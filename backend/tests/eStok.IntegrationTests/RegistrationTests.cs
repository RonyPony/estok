using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using eStok.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace eStok.IntegrationTests;

public sealed class RegistrationTests
{
    private const string Email = "pending@example.com";
    private const string Password = "StrongPassword123!";

    private static Task<HttpResponseMessage> RegisterAsync(HttpClient client) => client.PostAsJsonAsync("/api/auth/register",
        new { firstName = "Test", lastName = "Owner", email = Email, password = Password, businessName = "Pending business", country = "DO", currency = "DOP", isActive = true });

    internal static async Task SetActivationAsync(ApiFactory factory, string email, bool userActive, bool businessActive, bool membershipActive)
    {
        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var user = await db.Users.SingleAsync(x => x.Email == email);
        var membership = await db.BusinessUsers.IgnoreQueryFilters().SingleAsync(x => x.UserId == user.Id);
        // Simulate the trusted manual review; no public activation endpoint exists.
        await db.Users.Where(x => x.Id == user.Id).ExecuteUpdateAsync(x => x.SetProperty(u => u.IsActive, userActive));
        await db.Businesses.Where(x => x.Id == membership.BusinessId).ExecuteUpdateAsync(x => x.SetProperty(b => b.IsActive, businessActive));
        await db.BusinessUsers.IgnoreQueryFilters().Where(x => x.Id == membership.Id).ExecuteUpdateAsync(x => x.SetProperty(m => m.IsActive, membershipActive));
    }

    [Fact]
    public async Task Registration_PersistsInactiveRecords_WithoutSessionOrRefreshToken()
    {
        using var factory = new ApiFactory();
        using var client = factory.CreateReadyClient();
        var response = await RegisterAsync(client);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal("pending_review", body.GetProperty("status").GetString());
        Assert.Contains("contacto", body.GetProperty("message").GetString());
        Assert.False(body.TryGetProperty("accessToken", out _));
        Assert.False(body.TryGetProperty("refreshToken", out _));
        Assert.False(response.Headers.Contains("Set-Cookie"));

        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        Assert.False((await db.Users.SingleAsync()).IsActive);
        Assert.False((await db.Businesses.SingleAsync()).IsActive);
        var membership = await db.BusinessUsers.IgnoreQueryFilters().SingleAsync();
        Assert.True(membership.IsOwner);
        Assert.False(membership.IsActive);
        Assert.Empty(await db.RefreshTokens.ToListAsync());
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.PostAsJsonAsync("/api/auth/refresh", new { })).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/api/products")).StatusCode);
    }

    [Theory]
    [InlineData(false, false, false)]
    [InlineData(false, true, true)]
    [InlineData(true, false, true)]
    [InlineData(true, true, false)]
    [InlineData(true, true, true)]
    public async Task Login_RequiresUserBusinessAndMembershipActivation(bool userActive, bool businessActive, bool membershipActive)
    {
        using var factory = new ApiFactory();
        using var client = factory.CreateReadyClient();
        (await RegisterAsync(client)).EnsureSuccessStatusCode();
        await SetActivationAsync(factory, Email, userActive, businessActive, membershipActive);
        var response = await client.PostAsJsonAsync("/api/auth/login", new { email = Email, password = Password });
        var body = await response.Content.ReadFromJsonAsync<JsonElement>();
        if (userActive && businessActive && membershipActive)
        {
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.False(string.IsNullOrWhiteSpace(body.GetProperty("accessToken").GetString()));
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", body.GetProperty("accessToken").GetString());
            Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/api/auth/me")).StatusCode);
            Assert.Equal(HttpStatusCode.OK, (await client.PostAsJsonAsync("/api/auth/refresh", new { })).StatusCode);
        }
        else
        {
            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
            Assert.Equal("ACCOUNT_INACTIVE", body.GetProperty("code").GetString());
            Assert.False(response.Headers.Contains("Set-Cookie"));
            using var scope = factory.Services.CreateScope();
            Assert.Empty(await scope.ServiceProvider.GetRequiredService<AppDbContext>().RefreshTokens.ToListAsync());
        }
    }

    [Fact]
    public async Task WrongPassword_DoesNotDisclosePendingStatus_AndDuplicateRegistrationDoesNotCreateAnotherBusiness()
    {
        using var factory = new ApiFactory();
        using var client = factory.CreateReadyClient();
        (await RegisterAsync(client)).EnsureSuccessStatusCode();
        var wrongPassword = await client.PostAsJsonAsync("/api/auth/login", new { email = Email, password = "WrongPassword123!" });
        Assert.Equal(HttpStatusCode.Unauthorized, wrongPassword.StatusCode);
        Assert.Equal("INVALID_CREDENTIALS", (await wrongPassword.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("code").GetString());
        Assert.False((await RegisterAsync(client)).IsSuccessStatusCode);
        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        Assert.Equal(1, await db.Users.CountAsync());
        Assert.Equal(1, await db.Businesses.CountAsync());
    }

    [Theory]
    [InlineData(false, true, true)]
    [InlineData(true, false, true)]
    [InlineData(true, true, false)]
    public async Task Deactivation_BlocksExistingSessionAndRefresh(bool userActive, bool businessActive, bool membershipActive)
    {
        using var factory = new ApiFactory();
        using var client = factory.CreateReadyClient();
        (await RegisterAsync(client)).EnsureSuccessStatusCode();
        await SetActivationAsync(factory, Email, true, true, true);
        var login = await client.PostAsJsonAsync("/api/auth/login", new { email = Email, password = Password });
        login.EnsureSuccessStatusCode();
        var session = await login.Content.ReadFromJsonAsync<JsonElement>();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", session.GetProperty("accessToken").GetString());
        await SetActivationAsync(factory, Email, userActive, businessActive, membershipActive);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/api/auth/me")).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await client.GetAsync("/api/products")).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.PostAsJsonAsync("/api/auth/refresh", new { })).StatusCode);
    }
}
