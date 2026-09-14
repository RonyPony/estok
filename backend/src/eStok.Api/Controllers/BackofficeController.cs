using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using eStok.Api.Configuration;
using eStok.Application.Abstractions;
using eStok.Application.Common;
using eStok.Domain.Entities;
using eStok.Infrastructure.Administration;
using eStok.Infrastructure.Authentication;
using eStok.Infrastructure.Identity;
using eStok.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace eStok.Api.Controllers;

[ApiController, Route("api/backoffice"), Authorize(Policy = "Backoffice")]
[ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
public sealed class BackofficeController(BackofficeService service, AppDbContext db, UserManager<ApplicationUser> users,
    IOptionsSnapshot<BackofficeOptions> settings, IOptions<JwtOptions> jwtOptions, ICurrentUser current) : ControllerBase
{
    [HttpPost("login"), AllowAnonymous, EnableRateLimiting("auth")]
    public async Task<object> Login(LoginRequest request, CancellationToken ct)
    {
        var config = settings.Value;
        var user = await users.FindByEmailAsync(request.Email.Trim());
        var denied = new AppException("INVALID_CREDENTIALS", "Credenciales inválidas o acceso administrativo no autorizado.", 401);
        if (!config.Enabled || user == null || await users.IsLockedOutAsync(user)) throw denied;
        if (!await users.CheckPasswordAsync(user, request.Password)) { await users.AccessFailedAsync(user); throw denied; }
        if (!user.IsActive || !config.AdministratorUserIds.Contains(user.Id)) throw denied;
        await users.ResetAccessFailedCountAsync(user);
        var now = DateTime.UtcNow;
        var expires = now.AddMinutes(config.SessionMinutes);
        var jwt = jwtOptions.Value;
        var token = new JwtSecurityToken(jwt.Issuer, jwt.Audience,
            [new Claim("sub", user.Id.ToString()), new Claim("scope", "backoffice"), new Claim("security_stamp", user.SecurityStamp ?? ""), new Claim("jti", Guid.NewGuid().ToString())],
            now, expires, new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.Key)), SecurityAlgorithms.HmacSha256));
        user.LastActivityAt = now;
        db.PlatformAuditLogs.Add(new PlatformAuditLog { UserId = user.Id, EntityName = "ApplicationUser", EntityId = user.Id.ToString(), Action = "login", Reason = "Inicio de sesión administrativo.", CreatedAt = now });
        await db.SaveChangesAsync(ct);
        return new { accessToken = new JwtSecurityTokenHandler().WriteToken(token), expiresAt = expires,
            user = new { user.Id, user.FirstName, user.LastName, user.Email } };
    }

    [HttpGet("catalog")]
    public object Catalog() => new { entities = service.Catalog(), settings.Value.AllowPermanentDeletion, settings.Value.AllowSessionCleanup };

    [HttpGet("dashboard")]
    public Task<object> Dashboard(CancellationToken ct) => service.DashboardAsync(settings.Value.ActivityWindowMinutes, ct);

    [HttpGet("records/{entity}")]
    public Task<object> Records(string entity, CancellationToken ct, Guid? businessId = null, Guid? userId = null, bool? active = null, bool deleted = false, string? search = null, int page = 1, int size = 20)
        => service.RecordsAsync(entity, businessId, userId, active, deleted, search, page, size, ct);

    [HttpPost("records/{entity}/{id:guid}/{operation}")]
    public Task<object> Change(string entity, Guid id, string operation, AdminChange request, CancellationToken ct)
    {
        if (operation == "purge" && !settings.Value.AllowPermanentDeletion) throw new AppException("PURGE_DISABLED", "El borrado definitivo está deshabilitado en la configuración del servidor.", 403);
        return service.ChangeAsync(entity, id, operation, request, current.UserId, ct);
    }

    [HttpGet("audit")]
    public Task<object> Audit(CancellationToken ct, Guid? userId = null, Guid? businessId = null, string? action = null, DateTime? from = null, DateTime? to = null, int page = 1, int size = 20)
        => service.AuditAsync(userId, businessId, action, from, to, page, size, ct);

    [HttpGet("database")]
    public Task<object> Database(CancellationToken ct) => service.DatabaseAsync(settings.Value.SessionRetentionDays, ct);

    [HttpPost("database/cleanup-sessions")]
    public Task<object> Cleanup(AdminChange request, CancellationToken ct)
    {
        if (!settings.Value.AllowSessionCleanup) throw new AppException("CLEANUP_DISABLED", "La limpieza de sesiones está deshabilitada en la configuración del servidor.", 403);
        return service.CleanupAsync(settings.Value.SessionRetentionDays, request, current.UserId, ct);
    }
}
