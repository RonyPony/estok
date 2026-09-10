using eStok.Application.Abstractions;
using eStok.Application.Common;
using eStok.Application.Features.Inventory;
using eStok.Application.Features.Payments;
using eStok.Domain.Entities;
using eStok.Domain.Enums;
using Microsoft.EntityFrameworkCore;
namespace eStok.Application.Features.Sales;

public sealed record LineRequest(Guid ProductId, decimal Quantity, decimal Discount = 0);
public sealed record InitialPaymentRequest(Guid PaymentMethodId, decimal Amount, string? Reference = null);
public sealed record SaleRequest(Guid CustomerId, Guid WarehouseId, List<LineRequest> Items, string? Notes = null, DateTime? DueDate = null, List<InitialPaymentRequest>? Payments = null);
public interface IDocumentSequenceService { Task<string> NextAsync(DocumentType type, CancellationToken ct); }
public sealed class DocumentSequenceService(IApplicationDbContext db, ICurrentBusiness business) : IDocumentSequenceService
{
    public async Task<string> NextAsync(DocumentType type, CancellationToken ct) => (await db.Sequences.SingleAsync(x => x.BusinessId == business.BusinessId && x.DocumentType == type, ct)).Next();
}
public sealed class SalesService(IApplicationDbContext db, ICurrentBusiness business, ICurrentUser user, IDateTimeProvider clock, IInventoryService inventory, IDocumentSequenceService sequences, PaymentService payments)
{
    public Task<PagedResult<Sale>> ListAsync(PagedRequest request, CancellationToken ct) => db.Sales.AsNoTracking().Where(x => x.BusinessId == business.BusinessId && (request.Search == null || x.SaleNumber.Contains(request.Search))).OrderByDescending(x => x.CreatedAt).PageAsync(request, ct);
    public async Task<Sale> GetAsync(Guid id, CancellationToken ct) => await db.Sales.Include(x => x.Items).SingleOrDefaultAsync(x => x.Id == id && x.BusinessId == business.BusinessId, ct) ?? throw AppException.NotFound();
    public Task<Sale> CreateAsync(SaleRequest request, CancellationToken ct) => db.InTransactionAsync(() => CreateCoreAsync(request, null, ct), ct);
    public async Task<Sale> CreateCoreAsync(SaleRequest request, Quote? quote, CancellationToken ct)
    {
        var customer = await db.Customers.SingleOrDefaultAsync(x => x.Id == request.CustomerId && x.BusinessId == business.BusinessId && x.IsActive, ct) ?? throw AppException.NotFound();
        if (!await db.Warehouses.AnyAsync(x => x.Id == request.WarehouseId && x.BusinessId == business.BusinessId && x.IsActive, ct)) throw AppException.NotFound();
        if (request.Items.Count is 0 or > 100) throw new AppException("INVALID_ITEMS", "Agrega entre 1 y 100 productos.");
        var sale = new Sale { BusinessId = business.BusinessId, CustomerId = request.CustomerId, WarehouseId = request.WarehouseId, SaleDate = clock.UtcNow, CreatedBy = user.UserId, Notes = request.Notes, SaleNumber = await sequences.NextAsync(DocumentType.Sale, ct) };
        for (var index = 0; index < request.Items.Count; index++)
        {
            var line = request.Items[index];
            var product = await db.Products.SingleOrDefaultAsync(x => x.Id == line.ProductId && x.BusinessId == business.BusinessId && x.IsActive, ct) ?? throw AppException.NotFound();
            var snapshot = quote?.Items[index];
            var price = snapshot?.UnitPrice ?? product.SalePrice;
            ValidateLine(line, price);
            var subtotal = Money(line.Quantity * price);
            var tax = snapshot?.Tax ?? Money((subtotal - line.Discount) * product.TaxRate / 100);
            sale.Items.Add(new SaleItem { BusinessId = business.BusinessId, SaleId = sale.Id, ProductId = product.Id, Description = snapshot?.Description ?? product.Name, Quantity = line.Quantity, UnitPrice = price, UnitCost = product.Cost, Discount = line.Discount, Subtotal = subtotal, Tax = tax, Total = subtotal - line.Discount + tax });
            if (product.TrackInventory) await inventory.DecreaseStockAsync(product.Id, request.WarehouseId, line.Quantity, InventoryMovementType.Sale, sale.Id, ct);
        }
        sale.Subtotal = sale.Items.Sum(x => x.Subtotal); sale.Discount = sale.Items.Sum(x => x.Discount); sale.Tax = sale.Items.Sum(x => x.Tax); sale.Total = sale.Items.Sum(x => x.Total); sale.Balance = sale.Total;
        sale.PaymentStatus = sale.Total == 0 ? PaymentStatus.Paid : PaymentStatus.Pending;
        if (customer.CreditLimit.HasValue)
        {
            var debt = await db.Receivables.Where(x => x.BusinessId == business.BusinessId && x.CustomerId == customer.Id && x.Status != ReceivableStatus.Cancelled).SumAsync(x => x.Balance, ct);
            if (debt + sale.Total - (request.Payments?.Sum(x => x.Amount) ?? 0) > customer.CreditLimit) throw AppException.Conflict("La venta supera el límite de crédito del cliente.");
        }
        db.Sales.Add(sale);
        if (sale.Balance > 0) db.Receivables.Add(new AccountsReceivable { BusinessId = business.BusinessId, CustomerId = sale.CustomerId, SaleId = sale.Id, OriginalAmount = sale.Total, Balance = sale.Total, DueDate = request.DueDate, Status = ReceivableStatus.Pending });
        if (request.Payments is { Count: > 0 })
        {
            if (request.Payments.Count > 20) throw new AppException("INVALID_PAYMENTS", "Usa hasta 20 pagos por venta.");
            await db.SaveChangesAsync(ct);
            foreach (var payment in request.Payments) await payments.CreateAsync(new PaymentRequest(sale.Id, payment.PaymentMethodId, payment.Amount, payment.Reference), ct);
        }
        return sale;
    }
    public Task<Sale> CancelAsync(Guid id, CancellationToken ct) => db.InTransactionAsync(async () =>
    {
        var sale = await GetAsync(id, ct);
        if (sale.Status == SaleStatus.Cancelled) return sale;
        if (sale.PaidAmount > 0) throw AppException.Conflict("La venta tiene pagos. Deben reembolsarse antes de cancelarla.");
        var movements = await db.Movements.Where(x => x.BusinessId == business.BusinessId && x.ReferenceId == id && x.MovementType == InventoryMovementType.Sale).ToListAsync(ct);
        foreach (var movement in movements) await inventory.IncreaseStockAsync(movement.ProductId, movement.WarehouseId, -movement.Quantity, InventoryMovementType.Return, id, ct);
        sale.Status = SaleStatus.Cancelled; sale.PaymentStatus = PaymentStatus.Cancelled; sale.Balance = 0;
        var receivable = await db.Receivables.SingleOrDefaultAsync(x => x.SaleId == id && x.BusinessId == business.BusinessId, ct);
        if (receivable is not null) { receivable.Balance = 0; receivable.Status = ReceivableStatus.Cancelled; }
        return sale;
    }, ct);
    public static decimal Money(decimal value) => decimal.Round(value, 2, MidpointRounding.AwayFromZero);
    public static void ValidateLine(LineRequest line, decimal price)
    {
        if (line.Quantity <= 0 || line.Quantity > 1000000 || decimal.Round(line.Quantity, 4) != line.Quantity || line.Discount < 0 || line.Discount > Money(line.Quantity * price) || Money(line.Discount) != line.Discount) throw new AppException("INVALID_LINE", "Cantidad o descuento inválidos.");
    }
}
