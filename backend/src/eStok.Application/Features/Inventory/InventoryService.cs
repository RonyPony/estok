using eStok.Application.Abstractions;
using eStok.Application.Common;
using eStok.Domain.Entities;
using eStok.Domain.Enums;
using Microsoft.EntityFrameworkCore;
namespace eStok.Application.Features.Inventory;

public sealed record AdjustmentRequest(Guid ProductId, Guid WarehouseId, decimal Quantity, string Notes);
public sealed record TransferRequest(Guid ProductId, Guid SourceWarehouseId, Guid DestinationWarehouseId, decimal Quantity, string Notes);
public interface IInventoryService
{
    Task<ProductStock> AdjustStockAsync(AdjustmentRequest request, CancellationToken ct);
    Task<ProductStock> IncreaseStockAsync(Guid productId, Guid warehouseId, decimal quantity, InventoryMovementType type, Guid? reference, CancellationToken ct);
    Task<ProductStock> DecreaseStockAsync(Guid productId, Guid warehouseId, decimal quantity, InventoryMovementType type, Guid? reference, CancellationToken ct);
    Task TransferStockAsync(TransferRequest request, CancellationToken ct);
    Task<decimal> GetAvailableStockAsync(Guid productId, Guid warehouseId, CancellationToken ct);
}
public sealed class InventoryService(IApplicationDbContext db, ICurrentBusiness business, ICurrentUser user) : IInventoryService
{
    public Task<ProductStock> AdjustStockAsync(AdjustmentRequest request, CancellationToken ct)
    {
        if (request.Quantity == 0 || string.IsNullOrWhiteSpace(request.Notes)) throw new AppException("INVALID_ADJUSTMENT", "Indica cantidad y motivo del ajuste.");
        return db.InTransactionAsync(() => ChangeAsync(request.ProductId, request.WarehouseId, request.Quantity, request.Quantity > 0 ? InventoryMovementType.AdjustmentIn : InventoryMovementType.AdjustmentOut, null, request.Notes, ct), ct);
    }
    public Task<ProductStock> IncreaseStockAsync(Guid productId, Guid warehouseId, decimal quantity, InventoryMovementType type, Guid? reference, CancellationToken ct)
    { if (quantity <= 0) throw new AppException("INVALID_QUANTITY", "La cantidad debe ser positiva."); return ChangeAsync(productId, warehouseId, quantity, type, reference, null, ct); }
    public Task<ProductStock> DecreaseStockAsync(Guid productId, Guid warehouseId, decimal quantity, InventoryMovementType type, Guid? reference, CancellationToken ct)
    { if (quantity <= 0) throw new AppException("INVALID_QUANTITY", "La cantidad debe ser positiva."); return ChangeAsync(productId, warehouseId, -quantity, type, reference, null, ct); }
    public async Task TransferStockAsync(TransferRequest request, CancellationToken ct)
    {
        if (request.SourceWarehouseId == request.DestinationWarehouseId || request.Quantity <= 0) throw new AppException("INVALID_TRANSFER", "Transferencia inválida.");
        await db.InTransactionAsync(async () => { await DecreaseStockAsync(request.ProductId, request.SourceWarehouseId, request.Quantity, InventoryMovementType.TransferOut, null, ct); await IncreaseStockAsync(request.ProductId, request.DestinationWarehouseId, request.Quantity, InventoryMovementType.TransferIn, null, ct); return true; }, ct);
    }
    public async Task<decimal> GetAvailableStockAsync(Guid productId, Guid warehouseId, CancellationToken ct)
    {
        await ValidateAsync(productId, warehouseId, ct);
        return await db.Stocks.Where(x => x.BusinessId == business.BusinessId && x.ProductId == productId && x.WarehouseId == warehouseId).Select(x => x.Quantity - x.ReservedQuantity).SingleOrDefaultAsync(ct);
    }
    private async Task ValidateAsync(Guid productId, Guid warehouseId, CancellationToken ct)
    {
        if (!await db.Products.AnyAsync(x => x.Id == productId && x.BusinessId == business.BusinessId && x.IsActive && x.TrackInventory, ct) || !await db.Warehouses.AnyAsync(x => x.Id == warehouseId && x.BusinessId == business.BusinessId && x.IsActive, ct)) throw AppException.NotFound();
    }
    private async Task<ProductStock> ChangeAsync(Guid productId, Guid warehouseId, decimal delta, InventoryMovementType type, Guid? reference, string? notes, CancellationToken ct)
    {
        if (type == InventoryMovementType.Return)
        {
            if (!await db.Products.IgnoreQueryFilters().AnyAsync(x => x.Id == productId && x.BusinessId == business.BusinessId, ct) || !await db.Warehouses.AnyAsync(x => x.Id == warehouseId && x.BusinessId == business.BusinessId, ct)) throw AppException.NotFound();
        }
        else await ValidateAsync(productId, warehouseId, ct);
        if (decimal.Round(delta, 4) != delta) throw new AppException("INVALID_QUANTITY", "Usa hasta cuatro decimales.");
        var stock = db.Stocks.Local.SingleOrDefault(x => x.BusinessId == business.BusinessId && x.ProductId == productId && x.WarehouseId == warehouseId)
            ?? await db.Stocks.SingleOrDefaultAsync(x => x.BusinessId == business.BusinessId && x.ProductId == productId && x.WarehouseId == warehouseId, ct);
        if (stock is null) { stock = new ProductStock { BusinessId = business.BusinessId, ProductId = productId, WarehouseId = warehouseId }; db.Stocks.Add(stock); }
        var allowNegative = await db.Settings.Where(x => x.BusinessId == business.BusinessId).Select(x => x.AllowNegativeStock).SingleAsync(ct);
        if (!allowNegative && stock.Quantity + delta - stock.ReservedQuantity < 0) throw AppException.Conflict("Stock insuficiente.");
        stock.Quantity += delta;
        db.Movements.Add(new InventoryMovement { BusinessId = business.BusinessId, ProductId = productId, WarehouseId = warehouseId, MovementType = type, Quantity = delta, ReferenceId = reference, ReferenceType = reference.HasValue ? "Sale" : null, Notes = notes, CreatedBy = user.UserId });
        return stock;
    }
}
