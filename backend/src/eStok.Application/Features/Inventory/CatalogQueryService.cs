using eStok.Application.Abstractions;
using eStok.Application.Common;
using eStok.Domain.Entities;
using Microsoft.EntityFrameworkCore;
namespace eStok.Application.Features.Inventory;
public sealed class CatalogQueryService(IApplicationDbContext db, ICurrentBusiness business)
{
    public async Task<object> StockAsync(PagedRequest request, CancellationToken ct) => await (from stock in db.Stocks join product in db.Products on stock.ProductId equals product.Id join warehouse in db.Warehouses on stock.WarehouseId equals warehouse.Id where stock.BusinessId == business.BusinessId && (request.Search == null || product.Name.Contains(request.Search)) orderby product.Name select new { stock.Id, stock.ProductId, stock.WarehouseId, product.Name, product.Sku, WarehouseName = warehouse.Name, stock.Quantity, stock.ReservedQuantity, product.MinimumStock }).PageAsync(request, ct);
    public async Task<object> MovementsAsync(PagedRequest request, CancellationToken ct) => await db.Movements.Where(x => x.BusinessId == business.BusinessId).OrderByDescending(x => x.CreatedAt).PageAsync(request, ct);
    public async Task<object> WarehousesAsync(CancellationToken ct) => await db.Warehouses.Where(x => x.BusinessId == business.BusinessId && x.IsActive).ToListAsync(ct);
    public async Task<object> CategoriesAsync(CancellationToken ct) => await db.Categories.Where(x => x.BusinessId == business.BusinessId && x.IsActive).OrderBy(x => x.Name).ToListAsync(ct);
    public async Task<object> RolesAsync(CancellationToken ct) => await db.Roles.Where(x => x.BusinessId == business.BusinessId && x.IsActive).ToListAsync(ct);
    public async Task<object> MethodsAsync(CancellationToken ct) => await db.PaymentMethods.Where(x => x.BusinessId == business.BusinessId && x.IsActive).ToListAsync(ct);
    public async Task<object> PaymentsAsync(PagedRequest request, CancellationToken ct) => await db.Payments.Where(x => x.BusinessId == business.BusinessId).OrderByDescending(x => x.PaymentDate).PageAsync(request, ct);
    public async Task<object> ReceivablesAsync(PagedRequest request, CancellationToken ct) => await db.Receivables.Where(x => x.BusinessId == business.BusinessId).OrderByDescending(x => x.CreatedAt).PageAsync(request, ct);
    public async Task<object> AddCategoryAsync(string name, Guid? parentId, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(name) || name.Length > 200) throw new AppException("INVALID_NAME", "Indica un nombre válido.");
        if (parentId.HasValue && !await db.Categories.AnyAsync(x => x.BusinessId == business.BusinessId && x.Id == parentId && x.IsActive, ct)) throw AppException.NotFound();
        var category = new ProductCategory { BusinessId = business.BusinessId, Name = name, ParentCategoryId = parentId }; db.Categories.Add(category); await db.SaveChangesAsync(ct); return category;
    }
    public Task<object> UpdateCategoryAsync(Guid id, string name, Guid? parentId, CancellationToken ct) => db.InTransactionAsync<object>(async () =>
    {
        if (string.IsNullOrWhiteSpace(name) || name.Length > 200) throw new AppException("INVALID_NAME", "Indica un nombre válido.");
        if (parentId == id) throw new AppException("INVALID_PARENT", "Una categoría no puede ser superior de sí misma.");
        var category = await db.Categories.SingleOrDefaultAsync(x => x.Id == id && x.BusinessId == business.BusinessId && x.IsActive, ct) ?? throw AppException.NotFound();
        if (parentId.HasValue)
        {
            if (!await db.Categories.AnyAsync(x => x.Id == parentId && x.BusinessId == business.BusinessId && x.IsActive, ct)) throw AppException.NotFound();
            if (await WouldCreateCycleAsync(id, parentId.Value, ct)) throw new AppException("INVALID_PARENT", "La categoría superior generaría un ciclo.");
        }
        category.Name = name.Trim(); category.ParentCategoryId = parentId; return category;
    }, ct);
    public Task DeleteCategoryAsync(Guid id, CancellationToken ct) => db.InTransactionAsync(async () =>
    {
        var category = await db.Categories.SingleOrDefaultAsync(x => x.Id == id && x.BusinessId == business.BusinessId && x.IsActive, ct) ?? throw AppException.NotFound();
        var children = await db.Categories.Where(x => x.BusinessId == business.BusinessId && x.ParentCategoryId == id).ToListAsync(ct);
        foreach (var child in children) child.ParentCategoryId = null;
        var products = await db.Products.Where(x => x.BusinessId == business.BusinessId && x.CategoryId == id).ToListAsync(ct);
        foreach (var product in products) product.CategoryId = null;
        db.Categories.Remove(category);
        return true;
    }, ct);
    private async Task<bool> WouldCreateCycleAsync(Guid categoryId, Guid parentId, CancellationToken ct)
    {
        var current = parentId;
        var visited = new HashSet<Guid>();
        while (visited.Add(current))
        {
            if (current == categoryId) return true;
            var next = await db.Categories.Where(x => x.BusinessId == business.BusinessId && x.Id == current).Select(x => x.ParentCategoryId).SingleOrDefaultAsync(ct);
            if (!next.HasValue) return false;
            current = next.Value;
        }
        return true;
    }
    public async Task<object> AddWarehouseAsync(string name, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(name) || name.Length > 200) throw new AppException("INVALID_NAME", "Indica un nombre válido.");
        var warehouse = new Warehouse { BusinessId = business.BusinessId, Name = name }; db.Warehouses.Add(warehouse); await db.SaveChangesAsync(ct); return warehouse;
    }
}
