using eStok.Domain.Entities;
using eStok.Infrastructure.Identity;
using eStok.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;

namespace eStok.Api.Configuration;

public static class BackofficeBootstrap
{
    // Explicit operator command, never executed during normal startup or registration.
    public static async Task CreateAsync(IServiceProvider services, IConfiguration configuration)
    {
        var email = configuration["BackofficeBootstrap:Email"]?.Trim();
        var password = configuration["BackofficeBootstrap:Password"];
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
            throw new InvalidOperationException("Configura BackofficeBootstrap__Email y BackofficeBootstrap__Password mediante variables de entorno.");
        using var scope = services.CreateScope();
        var users = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        if (await users.FindByEmailAsync(email) != null)
            throw new InvalidOperationException("La cuenta ya existe. Usa su ID en Backoffice:AdministratorUserIds; este comando no cambia cuentas existentes.");
        await using var tx = await db.Database.BeginTransactionAsync();
        var user = new ApplicationUser { UserName = email, Email = email, FirstName = "Administrador", LastName = "de plataforma", IsActive = true, CreatedAt = DateTime.UtcNow };
        var result = await users.CreateAsync(user, password);
        if (!result.Succeeded) throw new InvalidOperationException("No se pudo crear la cuenta. Revisa el correo y la política de contraseñas: " + string.Join(", ", result.Errors.Select(x => x.Code)));
        db.PlatformAuditLogs.Add(new PlatformAuditLog { UserId = user.Id, EntityName = "ApplicationUser", EntityId = user.Id.ToString(), Action = "bootstrap", Reason = "Cuenta administrativa creada mediante el comando del operador.", CreatedAt = DateTime.UtcNow });
        await db.SaveChangesAsync();
        await tx.CommitAsync();
        Console.WriteLine($"Cuenta creada. Configura Backoffice:AdministratorUserIds con este ID: {user.Id}");
    }
}
