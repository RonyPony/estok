using eStok.Application.Abstractions;
using eStok.Application.Common;
using eStok.Domain.Entities;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
namespace eStok.Application.Features.Customers;

public sealed record CustomerRequest(string Code, string FirstName, string? LastName = null, string? Email = null, string? Phone = null, string? DocumentNumber = null, string? Notes = null, decimal? CreditLimit = null, bool IsActive = true);
public sealed class CustomerValidator : AbstractValidator<CustomerRequest>
{
    public CustomerValidator() { RuleFor(x => x.Code).NotEmpty().MaximumLength(100); RuleFor(x => x.FirstName).NotEmpty().MaximumLength(200); RuleFor(x => x.Email).EmailAddress().When(x => !string.IsNullOrWhiteSpace(x.Email)); RuleFor(x => x.CreditLimit).GreaterThanOrEqualTo(0); }
}
public sealed class CustomerService(IApplicationDbContext db, ICurrentBusiness business, IValidator<CustomerRequest> validator)
{
    public Task<PagedResult<Customer>> ListAsync(PagedRequest request, CancellationToken ct)
    {
        var query = db.Customers.AsNoTracking().Where(x => x.BusinessId == business.BusinessId);
        if (!string.IsNullOrWhiteSpace(request.Search)) query = query.Where(x => x.FirstName.Contains(request.Search) || x.Code.Contains(request.Search) || (x.LastName != null && x.LastName.Contains(request.Search)));
        return (request.SortDirection == "desc" ? query.OrderByDescending(x => x.FirstName) : query.OrderBy(x => x.FirstName)).PageAsync(request, ct);
    }
    public async Task<Customer> GetAsync(Guid id, CancellationToken ct) => await db.Customers.SingleOrDefaultAsync(x => x.Id == id && x.BusinessId == business.BusinessId, ct) ?? throw AppException.NotFound();
    public async Task<Customer> SaveAsync(Guid? id, CustomerRequest request, CancellationToken ct)
    {
        await validator.ValidateAndThrowAsync(request, ct);
        var code = request.Code.Trim().ToUpperInvariant();
        if (await db.Customers.AnyAsync(x => x.BusinessId == business.BusinessId && x.Code == code && x.Id != id, ct)) throw AppException.Conflict("El código de cliente ya existe.");
        var customer = id.HasValue ? await GetAsync(id.Value, ct) : new Customer { BusinessId = business.BusinessId };
        customer.Code = code; customer.FirstName = request.FirstName.Trim(); customer.LastName = request.LastName; customer.Email = request.Email; customer.Phone = request.Phone; customer.DocumentNumber = request.DocumentNumber; customer.Notes = request.Notes; customer.CreditLimit = request.CreditLimit; customer.IsActive = request.IsActive;
        if (!id.HasValue) db.Customers.Add(customer);
        await db.SaveChangesAsync(ct); return customer;
    }
    public async Task DeleteAsync(Guid id, CancellationToken ct) { db.Customers.Remove(await GetAsync(id, ct)); await db.SaveChangesAsync(ct); }
    public async Task<List<CustomerAddress>> AddressesAsync(Guid id, CancellationToken ct) { await GetAsync(id, ct); return await db.CustomerAddresses.Where(x => x.BusinessId == business.BusinessId && x.CustomerId == id).ToListAsync(ct); }
    public async Task<CustomerAddress> AddAddressAsync(Guid id, string addressLine1, string country, CancellationToken ct)
    {
        await GetAsync(id, ct);
        if (string.IsNullOrWhiteSpace(addressLine1) || addressLine1.Length > 500 || country.Length != 2) throw new AppException("INVALID_ADDRESS", "Dirección inválida.");
        var address = new CustomerAddress { BusinessId = business.BusinessId, CustomerId = id, AddressLine1 = addressLine1, Country = country };
        db.CustomerAddresses.Add(address); await db.SaveChangesAsync(ct); return address;
    }
}
