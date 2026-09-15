using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
namespace eStok.IntegrationTests;
public sealed class BusinessFlowTests
{
    [Fact]
    public async Task PersistentSession_RefreshesInNewClient_AndLogoutRevokesCookie()
    {
        using var factory = new ApiFactory(); using var original = factory.CreateReadyClient();
        await RegisterAsync(factory, original, "persistent@example.com");
        var login = await original.PostAsJsonAsync("/api/auth/login", new { email = "persistent@example.com", password = "StrongPassword123!" });
        var cookie = login.Headers.GetValues("Set-Cookie").Single();
        Assert.Contains("httponly", cookie.ToLowerInvariant()); Assert.Contains("secure", cookie.ToLowerInvariant()); Assert.Contains("max-age=2592000", cookie);
        Assert.DoesNotContain("refreshToken", await login.Content.ReadAsStringAsync());
        using var reopened = factory.CreateReadyClient();
        reopened.DefaultRequestHeaders.Add("Cookie", cookie.Split(';')[0]);
        var refresh = await reopened.PostAsJsonAsync("/api/auth/refresh", new { });
        Assert.Equal(HttpStatusCode.OK, refresh.StatusCode);
        var renewed = refresh.Headers.GetValues("Set-Cookie").Single().Split(';')[0];
        Assert.NotEqual(cookie.Split(';')[0], renewed);
        reopened.DefaultRequestHeaders.Remove("Cookie"); reopened.DefaultRequestHeaders.Add("Cookie", renewed);
        Assert.Equal(HttpStatusCode.NoContent, (await reopened.PostAsJsonAsync("/api/auth/logout", new { })).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await reopened.PostAsJsonAsync("/api/auth/refresh", new { })).StatusCode);
    }
    [Fact]
    public async Task CashSales_Documents_Logo_AndDuplicateValidation()
    {
        using var factory = new ApiFactory(); using var a = factory.CreateReadyClient(); using var b = factory.CreateReadyClient();
        await RegisterAsync(factory, a, "cash@example.com"); await RegisterAsync(factory, b, "other@example.com");
        var warehouseId = (await a.GetFromJsonAsync<JsonElement>("/api/warehouses"))[0].GetProperty("id").GetGuid();
        var methods = await a.GetFromJsonAsync<JsonElement>("/api/payment-methods");
        var methodId = methods.EnumerateArray().First(x => x.GetProperty("type").GetString() == "Cash").GetProperty("id").GetGuid();
        var productId = (await PostAsync(a, "/api/products", new { sku = "CASH", name = "Café de especialidad · Edición selección", cost = 5, salePrice = 10, trackInventory = false })).GetProperty("id").GetGuid();
        var line = new { productId, quantity = 2 };
        Assert.Equal(HttpStatusCode.Conflict, (await a.PostAsJsonAsync("/api/sales", new { warehouseId, items = new[] { line } })).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await a.PostAsJsonAsync("/api/sales", new { warehouseId, items = new[] { line, line } })).StatusCode);
        using var invalidLogo = new MultipartFormDataContent(); invalidLogo.Add(new ByteArrayContent("not an image"u8.ToArray()), "file", "logo.png");
        Assert.Equal(HttpStatusCode.BadRequest, (await a.PutAsync("/api/settings/logo", invalidLogo)).StatusCode);
        // A valid PNG is stored and rendered without fetching arbitrary remote URLs.
        var png = Convert.FromBase64String("iVBORw0KGgoAAAANSUhEUgAAAHgAAAAoCAIAAAC6iKlyAAAAZElEQVR4nO3QAQkAIADAMFPZxei2sYXCHTzA2Zhr60Lj+cEngQbdCjToVqBBtwINuhVo0K1Ag24FGnQr0KBbgQbdCjToVqBBtwINuhVo0K1Ag24FGnQr0KBbgQbdCjToVqBBtzr0hl+HTlPwhQAAAABJRU5ErkJggg==");
        using var logo = new MultipartFormDataContent(); logo.Add(new ByteArrayContent(png), "file", "logo.png");
        var uploaded = await a.PutAsync("/api/settings/logo", logo);
        Assert.True(uploaded.IsSuccessStatusCode, await uploaded.Content.ReadAsStringAsync());
        Assert.StartsWith("data:image/png;base64,", (await a.GetFromJsonAsync<JsonElement>("/api/settings")).GetProperty("logo").GetString());
        var sale = await PostAsync(a, "/api/sales", new { warehouseId, items = new[] { line }, payments = new[] { new { paymentMethodId = methodId, amount = 20 } } });
        var saleId = sale.GetProperty("id").GetGuid();
        Assert.Equal(JsonValueKind.Null, sale.GetProperty("customerId").ValueKind);
        Assert.Equal("Paid", sale.GetProperty("paymentStatus").GetString()); Assert.Equal(0, sale.GetProperty("balance").GetDecimal());
        Assert.Empty((await a.GetFromJsonAsync<JsonElement>("/api/customers")).GetProperty("items").EnumerateArray());
        Assert.Empty((await a.GetFromJsonAsync<JsonElement>("/api/accounts-receivable")).GetProperty("items").EnumerateArray());
        var pdf = await a.GetAsync($"/api/sales/{saleId}/pdf"); Assert.Equal("application/pdf", pdf.Content.Headers.ContentType?.MediaType);
        var content = await pdf.Content.ReadAsByteArrayAsync(); Assert.True(content.AsSpan().StartsWith("%PDF"u8));
        Assert.Equal(content, await a.GetByteArrayAsync($"/api/sales/{saleId}/pdf"));
        Assert.Equal(HttpStatusCode.NotFound, (await b.GetAsync($"/api/sales/{saleId}/pdf")).StatusCode);
        var customerId = (await PostAsync(a, "/api/customers", new { code = "C1", firstName = "María", lastName = "Peña" })).GetProperty("id").GetGuid();
        Assert.Equal(HttpStatusCode.BadRequest, (await a.PostAsJsonAsync("/api/quotes", new { customerId, items = new[] { line, line } })).StatusCode);
        var quote = await PostAsync(a, "/api/quotes", new { customerId, items = new[] { line }, notes = "Cotización válida según disponibilidad." });
        var quoteId = quote.GetProperty("id").GetGuid();
        var quotePdf = await a.GetByteArrayAsync($"/api/quotes/{quoteId}/pdf"); Assert.True(quotePdf.AsSpan().StartsWith("%PDF"u8));
        Assert.Equal(HttpStatusCode.NotFound, (await b.GetAsync($"/api/quotes/{quoteId}/pdf")).StatusCode);
        var output = Environment.GetEnvironmentVariable("ESTOK_PDF_TEST_OUTPUT");
        if (!string.IsNullOrEmpty(output)) { Directory.CreateDirectory(output); await File.WriteAllBytesAsync(Path.Combine(output, "factura.pdf"), content); await File.WriteAllBytesAsync(Path.Combine(output, "presupuesto.pdf"), quotePdf); }
        var manyLines = new List<object>();
        for (var i = 0; i < 40; i++)
        {
            var id = (await PostAsync(a, "/api/products", new { sku = $"PAGE-{i}", name = $"Producto {i + 1:00} · Café, té y selección de artículos para la oficina", cost = 5, salePrice = 10, taxRate = 18, trackInventory = false })).GetProperty("id").GetGuid();
            manyLines.Add(new { productId = id, quantity = 3, discount = 1 });
        }
        var largeQuote = await PostAsync(a, "/api/quotes", new { customerId, items = manyLines, notes = "Entrega según disponibilidad. Gracias por su preferencia." });
        var largePdf = await a.GetByteArrayAsync($"/api/quotes/{largeQuote.GetProperty("id").GetGuid()}/pdf");
        using var parsed = PdfSharp.Pdf.IO.PdfReader.Open(new MemoryStream(largePdf), PdfSharp.Pdf.IO.PdfDocumentOpenMode.Import);
        Assert.True(parsed.PageCount > 1);
        if (!string.IsNullOrEmpty(output)) await File.WriteAllBytesAsync(Path.Combine(output, "presupuesto-multipagina.pdf"), largePdf);
    }
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
