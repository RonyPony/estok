using eStok.Api.Configuration;
using eStok.Application.Common;
using eStok.Application.Features.Customers;
using Microsoft.AspNetCore.Mvc;
namespace eStok.Api.Controllers;
[ApiController, Route("api/customers")]
public sealed class CustomersController(CustomerService service) : ControllerBase
{
    [HttpGet, RequirePermission("customers.view")] public async Task<IActionResult> List([FromQuery] PagedRequest request, CancellationToken ct) => Ok(await service.ListAsync(request, ct));
    [HttpGet("{id:guid}"), RequirePermission("customers.view")] public async Task<IActionResult> Get(Guid id, CancellationToken ct) => Ok(await service.GetAsync(id, ct));
    [HttpPost, RequirePermission("customers.create")] public async Task<IActionResult> Create(CustomerRequest request, CancellationToken ct) => Ok(await service.SaveAsync(null, request, ct));
    [HttpPut("{id:guid}"), RequirePermission("customers.edit")] public async Task<IActionResult> Update(Guid id, CustomerRequest request, CancellationToken ct) => Ok(await service.SaveAsync(id, request, ct));
    [HttpDelete("{id:guid}"), RequirePermission("customers.delete")] public async Task<IActionResult> Delete(Guid id, CancellationToken ct) { await service.DeleteAsync(id, ct); return NoContent(); }
}
