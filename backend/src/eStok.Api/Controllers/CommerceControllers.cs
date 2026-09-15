using eStok.Api.Configuration;
using eStok.Application.Common;
using eStok.Application.Features.Sales;
using eStok.Application.Features.Quotes;
using eStok.Application.Features.Payments;
using eStok.Application.Features.Settings;
using eStok.Application.Features.Dashboard;
using eStok.Application.Abstractions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
namespace eStok.Api.Controllers;
[ApiController, Route("api/sales")]
public sealed class SalesController(SalesService service, IAuthorizationService authorization, IDocumentService documents) : ControllerBase
{
    [HttpGet("{id:guid}/pdf"), RequirePermission("sales.view")]
    public async Task<IActionResult> Pdf(Guid id, CancellationToken ct) { var file = await documents.GetAsync(id, eStok.Domain.Enums.DocumentType.Sale, ct); Response.Headers.CacheControl = "no-store"; return File(file.Content, "application/pdf", file.FileName); }
    [HttpGet, RequirePermission("sales.view")] public async Task<IActionResult> List([FromQuery] PagedRequest request, CancellationToken ct) => Ok(await service.ListAsync(request, ct));
    [HttpGet("{id:guid}"), RequirePermission("sales.view")] public async Task<IActionResult> Get(Guid id, CancellationToken ct) => Ok(await service.GetAsync(id, ct));
    [HttpPost, RequirePermission("sales.create")] public async Task<IActionResult> Create(SaleRequest request, CancellationToken ct)
    {
        if (request.Payments is { Count: > 0 } && !(await authorization.AuthorizeAsync(User, "payments.create")).Succeeded) return Forbid();
        return Ok(await service.CreateAsync(request, ct));
    }
    [HttpPost("{id:guid}/cancel"), RequirePermission("sales.cancel")] public async Task<IActionResult> Cancel(Guid id, CancellationToken ct) => Ok(await service.CancelAsync(id, ct));
}
[ApiController, Route("api/quotes")]
public sealed class QuotesController(QuoteService service, IDocumentService documents) : ControllerBase
{
    [HttpGet("{id:guid}/pdf"), RequirePermission("quotes.view")]
    public async Task<IActionResult> Pdf(Guid id, CancellationToken ct) { var file = await documents.GetAsync(id, eStok.Domain.Enums.DocumentType.Quote, ct); Response.Headers.CacheControl = "no-store"; return File(file.Content, "application/pdf", file.FileName); }
    [HttpGet, RequirePermission("quotes.view")] public async Task<IActionResult> List([FromQuery] PagedRequest request, CancellationToken ct) => Ok(await service.ListAsync(request, ct));
    [HttpGet("{id:guid}"), RequirePermission("quotes.view")] public async Task<IActionResult> Get(Guid id, CancellationToken ct) => Ok(await service.GetAsync(id, ct));
    [HttpPost, RequirePermission("quotes.create")] public async Task<IActionResult> Create(QuoteRequest request, CancellationToken ct) => Ok(await service.CreateAsync(request, ct));
    [HttpPut("{id:guid}"), RequirePermission("quotes.edit")] public async Task<IActionResult> Update(Guid id, UpdateQuoteRequest request, CancellationToken ct) => Ok(await service.UpdateAsync(id, request, ct));
    [HttpPost("{id:guid}/convert-to-sale"), RequirePermission("quotes.convert"), RequirePermission("sales.create")] public async Task<IActionResult> Convert(Guid id, ConvertRequest request, CancellationToken ct) => Ok(await service.ConvertAsync(id, request.WarehouseId, ct));
}
public sealed record ConvertRequest(Guid WarehouseId);
[ApiController, Route("api/payments")]
public sealed class PaymentsController(PaymentService service) : ControllerBase
{
    [HttpPost, RequirePermission("payments.create")] public async Task<IActionResult> Create(PaymentRequest request, CancellationToken ct) => Ok(await service.CreateAsync(request, ct));
}
[ApiController, Route("api/settings")]
public sealed class SettingsController(SettingsService service) : ControllerBase
{
    [HttpPut("logo"), RequirePermission("settings.manage"), RequestSizeLimit(2200000)]
    public async Task<IActionResult> Logo(IFormFile file, CancellationToken ct)
    {
        if (file.Length is 0 or > 2097152) throw new AppException("INVALID_LOGO", "Selecciona una imagen PNG o JPG de hasta 2 MB.");
        using var content = new MemoryStream(); await file.CopyToAsync(content, ct);
        return Ok(await service.SaveLogoAsync(content.ToArray(), ct));
    }
    [HttpGet, RequirePermission("settings.view")] public async Task<IActionResult> Get(CancellationToken ct) => Ok(await service.GetAsync(ct));
    [HttpPut, RequirePermission("settings.manage")] public async Task<IActionResult> Save(SettingsRequest request, CancellationToken ct) => Ok(await service.SaveAsync(request, ct));
}
[ApiController, Route("api/dashboard")]
public sealed class DashboardController(DashboardService service) : ControllerBase
{
    [HttpGet, RequirePermission("reports.view")] public async Task<IActionResult> Get(CancellationToken ct) => Ok(await service.GetAsync(ct));
}
[ApiController, Route("api/users")]
public sealed class UsersController(IUserService service) : ControllerBase
{
    [HttpGet, RequirePermission("users.view")] public async Task<IActionResult> List(CancellationToken ct) => Ok(await service.ListAsync(ct));
    [HttpPost, RequirePermission("users.manage")] public async Task<IActionResult> Create(CreateUserRequest request, CancellationToken ct) => Ok(await service.CreateAsync(request, ct));
    [HttpPut("{id:guid}"), RequirePermission("users.manage")] public async Task<IActionResult> Update(Guid id, UpdateUserRequest request, CancellationToken ct) { await service.UpdateAsync(id, request, ct); return NoContent(); }
}
