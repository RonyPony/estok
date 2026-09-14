using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
namespace eStok.IntegrationTests;
public sealed class BusinessFlowTests
{
    private static async Task<JsonElement> PostAsync(HttpClient client, string path, object body)
    {
        var response = await client.PostAsJsonAsync(path, body);
        var text = await response.Content.ReadAsStringAsync();
        Assert.True(response.IsSuccessStatusCode, $"{path}: {response.StatusCode} {text}");
        return JsonDocument.Parse(text).RootElement.Clone();
    }
    private static async Task RegisterAsync(ApiFactory factory, HttpClient client, string email)
    {
        await PostAsync(client, "/api/auth/register", new { firstName = "Test", lastName = "Owner", email, password = "StrongPassword123!", businessName = email, country = "DO", currency = "DOP" });
        await RegistrationTests.SetActivationAsync(factory, email, true, true, true);
        var session = await PostAsync(client, "/api/auth/login", new { email, password = "StrongPassword123!" });
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", session.GetProperty("accessToken").GetString());
    }
    [Fact]
    public async Task TenantIsolation_Authentication_Inventory_Sales_Payments_Quotes()
    {
        using var factory = new ApiFactory(); using var a = factory.CreateReadyClient(); using var b = factory.CreateClient();
        Assert.Equal(HttpStatusCode.Unauthorized, (await a.GetAsync("/api/products")).StatusCode);
        await RegisterAsync(factory, a, "a@example.com"); await RegisterAsync(factory, b, "b@example.com");
        var customer = await PostAsync(a, "/api/customers", new { code = "C1", firstName = "Ana" }); var customerId = customer.GetProperty("id").GetGuid();
        var product = await PostAsync(a, "/api/products", new { sku = "SKU1", name = "Café", cost = 5, salePrice = 10 }); var productId = product.GetProperty("id").GetGuid();
        await PostAsync(b, "/api/products", new { sku = "SKU1", name = "Otro café", cost = 5, salePrice = 10 });
        Assert.Equal(HttpStatusCode.Conflict, (await a.PostAsJsonAsync("/api/products", new { sku = "SKU1", name = "Duplicado", cost = 5, salePrice = 10 })).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await b.GetAsync($"/api/products/{productId}")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await b.GetAsync($"/api/customers/{customerId}")).StatusCode);
        var warehouses = await a.GetFromJsonAsync<JsonElement>("/api/warehouses"); var warehouseId = warehouses[0].GetProperty("id").GetGuid();
        await PostAsync(a, "/api/inventory/adjust", new { productId, warehouseId, quantity = 10, notes = "Apertura" });
        var sale = await PostAsync(a, "/api/sales", new { customerId, warehouseId, items = new[] { new { productId, quantity = 2 } } }); var saleId = sale.GetProperty("id").GetGuid();
        Assert.Equal(20, sale.GetProperty("balance").GetDecimal());
        Assert.Equal(HttpStatusCode.NotFound, (await b.GetAsync($"/api/sales/{saleId}")).StatusCode);
        var stocks = await a.GetFromJsonAsync<JsonElement>("/api/inventory"); Assert.Equal(8, stocks.GetProperty("items")[0].GetProperty("quantity").GetDecimal());
        await PostAsync(a, $"/api/sales/{saleId}/cancel", new { }); await PostAsync(a, $"/api/sales/{saleId}/cancel", new { });
        stocks = await a.GetFromJsonAsync<JsonElement>("/api/inventory"); Assert.Equal(10, stocks.GetProperty("items")[0].GetProperty("quantity").GetDecimal());
        Assert.Equal(HttpStatusCode.Conflict, (await a.PostAsJsonAsync("/api/sales", new { customerId, warehouseId, items = new[] { new { productId, quantity = 11 } } })).StatusCode);
        stocks = await a.GetFromJsonAsync<JsonElement>("/api/inventory"); Assert.Equal(10, stocks.GetProperty("items")[0].GetProperty("quantity").GetDecimal());
        var quote = await PostAsync(a, "/api/quotes", new { customerId, items = new[] { new { productId, quantity = 2 } } });
        sale = await PostAsync(a, $"/api/quotes/{quote.GetProperty("id").GetGuid()}/convert-to-sale", new { warehouseId }); saleId = sale.GetProperty("id").GetGuid();
        var methods = await a.GetFromJsonAsync<JsonElement>("/api/payment-methods"); var methodId = methods.EnumerateArray().First(x => x.GetProperty("type").GetString() == "Cash").GetProperty("id").GetGuid();
        await PostAsync(a, "/api/payments", new { saleId, paymentMethodId = methodId, amount = 8 });
        await PostAsync(a, "/api/payments", new { saleId, paymentMethodId = methodId, amount = 12 });
        var paidSale = await PostAsync(a, "/api/sales", new { customerId, warehouseId, items = new[] { new { productId, quantity = 1 } }, payments = new[] { new { paymentMethodId = methodId, amount = 10 } } });
        Assert.Equal(0, paidSale.GetProperty("balance").GetDecimal());
        var priorStock = (await a.GetFromJsonAsync<JsonElement>("/api/inventory")).GetProperty("items")[0].GetProperty("quantity").GetDecimal();
        Assert.Equal(HttpStatusCode.Conflict, (await a.PostAsJsonAsync("/api/sales", new { customerId, warehouseId, items = new[] { new { productId, quantity = 1 } }, payments = new[] { new { paymentMethodId = methodId, amount = 11 } } })).StatusCode);
        Assert.Equal(priorStock, (await a.GetFromJsonAsync<JsonElement>("/api/inventory")).GetProperty("items")[0].GetProperty("quantity").GetDecimal());
        sale = await a.GetFromJsonAsync<JsonElement>($"/api/sales/{saleId}"); Assert.Equal(0, sale.GetProperty("balance").GetDecimal()); Assert.Equal("Paid", sale.GetProperty("paymentStatus").GetString());
        var debts = await a.GetFromJsonAsync<JsonElement>("/api/accounts-receivable"); Assert.Contains(debts.GetProperty("items").EnumerateArray(), x => x.GetProperty("saleId").GetGuid() == saleId && x.GetProperty("status").GetString() == "Paid");
        var roles = await a.GetFromJsonAsync<JsonElement>("/api/roles"); var viewer = roles.EnumerateArray().First(x => x.GetProperty("name").GetString() == "Viewer").GetProperty("id").GetGuid();
        await PostAsync(a, "/api/users", new { firstName = "View", lastName = "Only", email = "viewer@example.com", password = "StrongPassword123!", roleId = viewer });
        using var v = factory.CreateClient(); var session = await PostAsync(v, "/api/auth/login", new { email = "viewer@example.com", password = "StrongPassword123!" }); v.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", session.GetProperty("accessToken").GetString());
        Assert.Equal(HttpStatusCode.Forbidden, (await v.PostAsJsonAsync("/api/products", new { sku = "DENIED", name = "Denied", cost = 1, salePrice = 2 })).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await a.PostAsJsonAsync("/api/auth/refresh", new { })).StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, (await a.PostAsJsonAsync("/api/auth/logout", new { })).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await a.PostAsJsonAsync("/api/auth/refresh", new { })).StatusCode);
    }
}
