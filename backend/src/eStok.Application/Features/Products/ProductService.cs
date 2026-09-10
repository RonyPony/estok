using eStok.Application.Abstractions;
using eStok.Application.Common;
using eStok.Domain.Entities;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
namespace eStok.Application.Features.Products;

public sealed record ProductRequest(string Sku, string Name, decimal Cost, decimal SalePrice, decimal TaxRate = 0, bool TrackInventory = true, decimal MinimumStock = 0, Guid? CategoryId = null, string? Barcode = null, string? Description = null, bool IsActive = true);
public sealed class ProductValidator : AbstractValidator<ProductRequest>
{
    public ProductValidator() { RuleFor(x => x.Sku).NotEmpty().MaximumLength(100); RuleFor(x => x.Name).NotEmpty().MaximumLength(200); RuleFor(x => x.Cost).InclusiveBetween(0, 999999999); RuleFor(x => x.SalePrice).InclusiveBetween(0, 999999999); RuleFor(x => x.TaxRate).InclusiveBetween(0, 100); RuleFor(x => x.MinimumStock).GreaterThanOrEqualTo(0); }
}
public sealed class ProductService(IApplicationDbContext db, ICurrentBusiness business, IValidator<ProductRequest> validator)
{
    public Task<PagedResult<Product>> ListAsync(PagedRequest request, CancellationToken ct)
    {
        var query = db.Products.AsNoTracking().Where(x => x.BusinessId == business.BusinessId);
        if (!string.IsNullOrWhiteSpace(request.Search)) query = query.Where(x => x.Name.Contains(request.Search) || x.Sku.Contains(request.Search));
        var ordered = (request.SortBy, request.SortDirection) switch { ("salePrice", "desc") => query.OrderByDescending(x => x.SalePrice), ("salePrice", _) => query.OrderBy(x => x.SalePrice), (_, "desc") => query.OrderByDescending(x => x.Name), _ => query.OrderBy(x => x.Name) };
        return ordered.PageAsync(request, ct);
    }
    public async Task<Product> GetAsync(Guid id, CancellationToken ct) => await db.Products.SingleOrDefaultAsync(x => x.Id == id && x.BusinessId == business.BusinessId, ct) ?? throw AppException.NotFound();
    public async Task<Product> SaveAsync(Guid? id, ProductRequest request, CancellationToken ct)
    {
        await validator.ValidateAndThrowAsync(request, ct);
        var sku = request.Sku.Trim().ToUpperInvariant();
        if (await db.Products.AnyAsync(x => x.BusinessId == business.BusinessId && x.Sku == sku && x.Id != id, ct)) throw AppException.Conflict("El SKU ya existe en esta empresa.");
        if (request.CategoryId.HasValue && !await db.Categories.AnyAsync(x => x.Id == request.CategoryId && x.BusinessId == business.BusinessId && x.IsActive, ct)) throw AppException.NotFound();
        var product = id.HasValue ? await GetAsync(id.Value, ct) : new Product { BusinessId = business.BusinessId };
        product.Sku = sku; product.Name = request.Name.Trim(); product.Cost = request.Cost; product.SalePrice = request.SalePrice; product.TaxRate = request.TaxRate; product.TrackInventory = request.TrackInventory; product.MinimumStock = request.MinimumStock; product.CategoryId = request.CategoryId; product.Barcode = request.Barcode; product.Description = request.Description; product.IsActive = request.IsActive;
        if (!id.HasValue) db.Products.Add(product);
        await db.SaveChangesAsync(ct); return product;
    }
    public async Task DeleteAsync(Guid id, CancellationToken ct) { db.Products.Remove(await GetAsync(id, ct)); await db.SaveChangesAsync(ct); }
}
