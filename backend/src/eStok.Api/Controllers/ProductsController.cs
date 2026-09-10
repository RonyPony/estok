using eStok.Api.Configuration;
using eStok.Application.Common;
using eStok.Application.Features.Products;
using Microsoft.AspNetCore.Mvc;
namespace eStok.Api.Controllers;
[ApiController, Route("api/products")]
public sealed class ProductsController(ProductService service) : ControllerBase
{
    [HttpGet, RequirePermission("products.view")] public async Task<IActionResult> List([FromQuery] PagedRequest request, CancellationToken ct) => Ok(await service.ListAsync(request, ct));
    [HttpGet("{id:guid}"), RequirePermission("products.view")] public async Task<IActionResult> Get(Guid id, CancellationToken ct) => Ok(await service.GetAsync(id, ct));
    [HttpPost, RequirePermission("products.create")] public async Task<IActionResult> Create(ProductRequest request, CancellationToken ct) => Ok(await service.SaveAsync(null, request, ct));
    [HttpPut("{id:guid}"), RequirePermission("products.edit")] public async Task<IActionResult> Update(Guid id, ProductRequest request, CancellationToken ct) => Ok(await service.SaveAsync(id, request, ct));
    [HttpDelete("{id:guid}"), RequirePermission("products.delete")] public async Task<IActionResult> Delete(Guid id, CancellationToken ct) { await service.DeleteAsync(id, ct); return NoContent(); }
}
