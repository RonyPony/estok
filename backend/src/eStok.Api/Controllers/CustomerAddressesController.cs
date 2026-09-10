using eStok.Api.Configuration;
using eStok.Application.Features.Customers;
using Microsoft.AspNetCore.Mvc;
namespace eStok.Api.Controllers;
[ApiController, Route("api/customers/{id:guid}/addresses")]
public sealed class CustomerAddressesController(CustomerService service) : ControllerBase
{
    [HttpGet, RequirePermission("customers.view")] public async Task<IActionResult> List(Guid id, CancellationToken ct) => Ok(await service.AddressesAsync(id, ct));
    [HttpPost, RequirePermission("customers.edit")] public async Task<IActionResult> Add(Guid id, AddressRequest request, CancellationToken ct) => Ok(await service.AddAddressAsync(id, request.AddressLine1, request.Country, ct));
}
public sealed record AddressRequest(string AddressLine1, string Country);
