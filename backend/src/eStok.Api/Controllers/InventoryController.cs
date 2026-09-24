using eStok.Api.Configuration;
using eStok.Application.Common;
using eStok.Application.Features.Inventory;
using Microsoft.AspNetCore.Mvc;
namespace eStok.Api.Controllers;
[ApiController, Route("api")]
public sealed class InventoryController(IInventoryService inventory, CatalogQueryService queries) : ControllerBase
{
    [HttpGet("inventory"), RequirePermission("inventory.view")] public async Task<IActionResult> Stock([FromQuery] PagedRequest request, CancellationToken ct) => Ok(await queries.StockAsync(request, ct));
    [HttpGet("inventory/movements"), RequirePermission("inventory.view")] public async Task<IActionResult> Movements([FromQuery] PagedRequest request, CancellationToken ct) => Ok(await queries.MovementsAsync(request, ct));
    [HttpPost("inventory/adjust"), RequirePermission("inventory.adjust")] public async Task<IActionResult> Adjust(AdjustmentRequest request, CancellationToken ct) => Ok(await inventory.AdjustStockAsync(request, ct));
    [HttpPost("inventory/transfer"), RequirePermission("inventory.adjust")] public async Task<IActionResult> Transfer(TransferRequest request, CancellationToken ct) { await inventory.TransferStockAsync(request, ct); return NoContent(); }
    [HttpGet("warehouses"), RequirePermission("inventory.view")] public async Task<IActionResult> Warehouses(CancellationToken ct) => Ok(await queries.WarehousesAsync(ct));
    [HttpPost("warehouses"), RequirePermission("settings.manage")] public async Task<IActionResult> AddWarehouse(NameRequest request, CancellationToken ct) => Ok(await queries.AddWarehouseAsync(request.Name, ct));
    [HttpGet("categories"), RequirePermission("products.view")] public async Task<IActionResult> Categories(CancellationToken ct) => Ok(await queries.CategoriesAsync(ct));
    [HttpPost("categories"), RequirePermission("products.create")] public async Task<IActionResult> AddCategory(NameRequest request, CancellationToken ct) => Ok(await queries.AddCategoryAsync(request.Name, request.ParentCategoryId, ct));
    [HttpPut("categories/{id:guid}"), RequirePermission("products.edit")] public async Task<IActionResult> UpdateCategory(Guid id, NameRequest request, CancellationToken ct) => Ok(await queries.UpdateCategoryAsync(id, request.Name, request.ParentCategoryId, ct));
    [HttpDelete("categories/{id:guid}"), RequirePermission("products.delete")] public async Task<IActionResult> DeleteCategory(Guid id, CancellationToken ct) { await queries.DeleteCategoryAsync(id, ct); return NoContent(); }
    [HttpGet("roles"), RequirePermission("users.view")] public async Task<IActionResult> Roles(CancellationToken ct) => Ok(await queries.RolesAsync(ct));
    [HttpGet("payment-methods"), RequirePermission("payments.view")] public async Task<IActionResult> Methods(CancellationToken ct) => Ok(await queries.MethodsAsync(ct));
    [HttpGet("payments"), RequirePermission("payments.view")] public async Task<IActionResult> Payments([FromQuery] PagedRequest request, CancellationToken ct) => Ok(await queries.PaymentsAsync(request, ct));
    [HttpGet("accounts-receivable"), RequirePermission("payments.view")] public async Task<IActionResult> Receivables([FromQuery] PagedRequest request, CancellationToken ct) => Ok(await queries.ReceivablesAsync(request, ct));
}
public sealed record NameRequest(string Name, Guid? ParentCategoryId = null);
