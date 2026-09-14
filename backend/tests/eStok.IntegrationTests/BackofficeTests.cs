using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using eStok.Infrastructure.Identity;
using eStok.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace eStok.IntegrationTests;

public sealed class BackofficeTests
{
    private static readonly Guid AdminId = Guid.Parse("10000000-0000-0000-0000-000000000001");
    private const string Password = "StrongPassword123!";
    private static ApiFactory Factory() => new(new() {
        ["Backoffice:Enabled"] = "true", ["Backoffice:AdministratorUserIds:0"] = AdminId.ToString(),
        ["Backoffice:AllowPermanentDeletion"] = "true", ["Backoffice:AllowSessionCleanup"] = "true"
    });

    private static async Task<HttpClient> Admin(ApiFactory factory)
    {
        var client = factory.CreateReadyClient();
        using var scope = factory.Services.CreateScope();
        var manager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var result = await manager.CreateAsync(new ApplicationUser { Id = AdminId, UserName = "admin@example.com", Email = "admin@example.com", IsActive = true, CreatedAt = DateTime.UtcNow }, Password);
        Assert.True(result.Succeeded);
        var response = await client.PostAsJsonAsync("/api/backoffice/login", new { email = "admin@example.com", password = Password });
        response.EnsureSuccessStatusCode();
        var login = await response.Content.ReadFromJsonAsync<JsonElement>();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", login.GetProperty("accessToken").GetString());
        return client;
    }

    private static Task<HttpResponseMessage> Change(HttpClient client, string entity, string id, string action, bool? active = null) =>
        client.PostAsJsonAsync($"/api/backoffice/records/{entity}/{id}/{action}", new { reason = "Revisión administrativa verificada.", confirmation = id, active });

    [Fact]
    public async Task Admin_CanReviewActivateAndReadStatistics_WithoutTenantMembership()
    {
        using var factory = Factory();
        using var admin = await Admin(factory);
        using var customer = factory.CreateReadyClient();
        Assert.Equal(HttpStatusCode.Unauthorized, (await customer.GetAsync("/api/backoffice/dashboard")).StatusCode);
        (await customer.PostAsJsonAsync("/api/auth/register", new { firstName = "Ana", lastName = "Pérez", email = "ana@example.com", password = Password, businessName = "Negocio", country = "DO", currency = "DOP" })).EnsureSuccessStatusCode();
        foreach (var entity in new[] { "ApplicationUser", "Business", "BusinessUser" })
        {
            var response = await admin.GetAsync($"/api/backoffice/records/{entity}?active=false");
            response.EnsureSuccessStatusCode();
            var page = await response.Content.ReadFromJsonAsync<JsonElement>();
            var row = page.GetProperty("items")[0];
            Assert.False(row.TryGetProperty("passwordHash", out _));
            (await Change(admin, entity, row.GetProperty("id").GetString()!, "activation", true)).EnsureSuccessStatusCode();
        }
        var login = await customer.PostAsJsonAsync("/api/auth/login", new { email = "ana@example.com", password = Password });
        login.EnsureSuccessStatusCode();
        customer.DefaultRequestHeaders.Authorization = new("Bearer", (await login.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("accessToken").GetString());
        Assert.Equal(HttpStatusCode.Forbidden, (await customer.GetAsync("/api/backoffice/dashboard")).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await admin.GetAsync("/api/products")).StatusCode);
        foreach (var path in new[] { "dashboard", "catalog", "audit", "database" })
        {
            var response = await admin.GetAsync($"/api/backoffice/{path}");
            Assert.True(response.IsSuccessStatusCode, await response.Content.ReadAsStringAsync());
        }
        Assert.Equal(HttpStatusCode.Conflict, (await Change(admin, "ApplicationUser", AdminId.ToString(), "activation", false)).StatusCode);
        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        Assert.NotNull((await db.Users.SingleAsync(x => x.Email == "ana@example.com")).LastActivityAt);
        Assert.Equal(3, await db.PlatformAuditLogs.CountAsync(x => x.Action == "activation"));
        await db.Users.Where(x => x.Id == AdminId).ExecuteUpdateAsync(s => s.SetProperty(x => x.IsActive, false));
        Assert.Equal(HttpStatusCode.Forbidden, (await admin.GetAsync("/api/backoffice/dashboard")).StatusCode);
    }

    [Fact]
    public async Task Trash_RestorePurgeAndRelatedRecordProtection_AreAudited()
    {
        using var factory = Factory();
        using var admin = await Admin(factory);
        using var client = factory.CreateReadyClient();
        (await client.PostAsJsonAsync("/api/auth/register", new { firstName = "Ana", lastName = "Pérez", email = "owner@example.com", password = Password, businessName = "Negocio", country = "DO", currency = "DOP" })).EnsureSuccessStatusCode();
        await RegistrationTests.SetActivationAsync(factory, "owner@example.com", true, true, true);
        var login = await client.PostAsJsonAsync("/api/auth/login", new { email = "owner@example.com", password = Password });
        client.DefaultRequestHeaders.Authorization = new("Bearer", (await login.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("accessToken").GetString());
        var created = await client.PostAsJsonAsync("/api/customers", new { code = "C-1", firstName = "Cliente" });
        created.EnsureSuccessStatusCode();
        var id = (await created.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("id").GetString()!;
        (await client.DeleteAsync($"/api/customers/{id}")).EnsureSuccessStatusCode();
        var trash = await admin.GetFromJsonAsync<JsonElement>("/api/backoffice/records/Customer?deleted=true");
        Assert.Equal(1, trash.GetProperty("totalItems").GetInt32());
        (await Change(admin, "Customer", id, "restore")).EnsureSuccessStatusCode();
        (await client.GetAsync($"/api/customers/{id}")).EnsureSuccessStatusCode();
        Assert.Equal(HttpStatusCode.Conflict, (await Change(admin, "Customer", id, "purge")).StatusCode);
        (await client.DeleteAsync($"/api/customers/{id}")).EnsureSuccessStatusCode();
        (await Change(admin, "Customer", id, "purge")).EnsureSuccessStatusCode();
        var second = await client.PostAsJsonAsync("/api/customers", new { code = "C-2", firstName = "Con dirección" });
        var secondId = (await second.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("id").GetString()!;
        (await client.PostAsJsonAsync($"/api/customers/{secondId}/addresses", new { addressLine1 = "Calle principal", country = "DO" })).EnsureSuccessStatusCode();
        (await client.DeleteAsync($"/api/customers/{secondId}")).EnsureSuccessStatusCode();
        Assert.Equal(HttpStatusCode.Conflict, (await Change(admin, "Customer", secondId, "purge")).StatusCode);
        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        Assert.Equal(1, await db.PlatformAuditLogs.CountAsync(x => x.Action == "purge"));
        Assert.True(await db.Customers.IgnoreQueryFilters().AnyAsync(x => x.Id == Guid.Parse(secondId) && x.IsDeleted));
    }

    [Fact]
    public async Task Maintenance_RequiresConfirmationAndPreservesValidSessions()
    {
        using var factory = Factory();
        using var admin = await Admin(factory);
        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var business = new eStok.Domain.Entities.Business { Name = "Mantenimiento" };
            db.Businesses.Add(business);
            foreach (var days in new[] { -60, -10, 10 })
                db.RefreshTokens.Add(new RefreshToken { UserId = AdminId, BusinessId = business.Id, TokenHash = $"token-{days}", CreatedAt = DateTime.UtcNow.AddDays(-90), ExpiresAt = DateTime.UtcNow.AddDays(days) });
            await db.SaveChangesAsync();
        }
        Assert.Equal(HttpStatusCode.BadRequest, (await admin.PostAsJsonAsync("/api/backoffice/database/cleanup-sessions", new { reason = "Mantenimiento mensual", confirmation = "incorrecta" })).StatusCode);
        (await admin.PostAsJsonAsync("/api/backoffice/database/cleanup-sessions", new { reason = "Mantenimiento mensual", confirmation = "LIMPIAR SESIONES" })).EnsureSuccessStatusCode();
        Assert.Equal(HttpStatusCode.NotFound, (await admin.GetAsync("/api/backoffice/records/RefreshToken")).StatusCode);
        using var verification = factory.Services.CreateScope();
        var verifiedDb = verification.ServiceProvider.GetRequiredService<AppDbContext>();
        Assert.Equal(2, await verifiedDb.RefreshTokens.CountAsync());
        Assert.False(await verifiedDb.RefreshTokens.AnyAsync(x => x.TokenHash == "token--60"));
        Assert.Equal("1", (await verifiedDb.PlatformAuditLogs.SingleAsync(x => x.Action == "cleanup")).NewValue);
    }

    [Fact]
    public async Task ProductAndCategoryTrash_RequireParentRestoration_AndRejectHistoryTypes()
    {
        using var factory = Factory();
        using var admin = await Admin(factory);
        Guid productId;
        Guid categoryId;
        // Trusted fixture setup; production still uses the tenant write guards.
        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var business = new eStok.Domain.Entities.Business { Name = "Papelera" };
            db.Businesses.Add(business);
            await db.SaveChangesAsync();
            categoryId = Guid.NewGuid(); productId = Guid.NewGuid();
            await db.Database.ExecuteSqlInterpolatedAsync($"INSERT INTO Categories (Id, BusinessId, Name, IsActive, IsDeleted, CreatedAt) VALUES ({categoryId}, {business.Id}, {'C'}, {true}, {true}, {DateTime.UtcNow})");
            await db.Database.ExecuteSqlInterpolatedAsync($"INSERT INTO Products (Id, BusinessId, CategoryId, Sku, Name, Cost, SalePrice, TaxRate, TrackInventory, MinimumStock, IsActive, IsDeleted, CreatedAt) VALUES ({productId}, {business.Id}, {categoryId}, {'P'}, {'P'}, {0}, {0}, {0}, {false}, {0}, {true}, {true}, {DateTime.UtcNow})");
        }
        Assert.Equal(HttpStatusCode.Conflict, (await Change(admin, "Product", productId.ToString(), "restore")).StatusCode);
        (await Change(admin, "ProductCategory", categoryId.ToString(), "restore")).EnsureSuccessStatusCode();
        (await Change(admin, "Product", productId.ToString(), "restore")).EnsureSuccessStatusCode();
        Assert.Equal(HttpStatusCode.NotFound, (await Change(admin, "Payment", productId.ToString(), "purge")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await Change(admin, "AuditLog", productId.ToString(), "purge")).StatusCode);
        var filtered = await admin.GetFromJsonAsync<JsonElement>($"/api/backoffice/audit?userId={AdminId}&action=restore&size=1");
        Assert.Equal(2, filtered.GetProperty("totalItems").GetInt32());
        Assert.Equal(1, filtered.GetProperty("items").GetArrayLength());
    }
}
