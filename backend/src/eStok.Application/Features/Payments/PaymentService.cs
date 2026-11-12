using eStok.Application.Abstractions;
using eStok.Application.Common;
using eStok.Domain.Entities;
using eStok.Domain.Enums;
using Microsoft.EntityFrameworkCore;
namespace eStok.Application.Features.Payments;
public sealed record PaymentRequest(Guid SaleId, Guid PaymentMethodId, decimal Amount, string? Reference = null, string? Notes = null);
public sealed record RefundSaleRequest(string Reference, string Reason);
public sealed class PaymentService(IApplicationDbContext db, ICurrentBusiness business, ICurrentUser user, IDateTimeProvider clock)
{
    public Task<object> HistoryAsync(Guid saleId, CancellationToken ct) => HistoryCoreAsync(saleId, ct);
    public Task<PagedResult<PaymentRefund>> RefundsAsync(PagedRequest request, CancellationToken ct) =>
        db.PaymentRefunds.AsNoTracking().Where(x => x.BusinessId == business.BusinessId)
            .OrderByDescending(x => x.RefundDate).PageAsync(request, ct);
    private async Task<object> HistoryCoreAsync(Guid saleId, CancellationToken ct)
    {
        if (!await db.Sales.AnyAsync(x => x.Id == saleId && x.BusinessId == business.BusinessId, ct)) throw AppException.NotFound();
        return new {
            Payments = await db.Payments.AsNoTracking().Where(x => x.SaleId == saleId && x.BusinessId == business.BusinessId).OrderBy(x => x.PaymentDate).ToListAsync(ct),
            Refunds = await db.PaymentRefunds.AsNoTracking().Where(x => x.SaleId == saleId && x.BusinessId == business.BusinessId).OrderBy(x => x.RefundDate).ToListAsync(ct)
        };
    }

    public Task<object> RefundSaleAsync(Guid saleId, RefundSaleRequest request, CancellationToken ct) => db.InTransactionAsync(async () =>
    {
        if (string.IsNullOrWhiteSpace(request.Reference) || request.Reference.Length > 200 || string.IsNullOrWhiteSpace(request.Reason) || request.Reason.Length > 500)
            throw new AppException("INVALID_REFUND", "Indica la referencia del reembolso y el motivo (máximo 200 y 500 caracteres).");
        var sale = await db.Sales.SingleOrDefaultAsync(x => x.Id == saleId && x.BusinessId == business.BusinessId, ct) ?? throw AppException.NotFound();
        if (sale.Status is not (SaleStatus.Completed or SaleStatus.Refunded)) throw AppException.Conflict("Solo se pueden reembolsar pagos de una venta completada.");
        var received = await db.Payments.Where(x => x.SaleId == saleId && x.BusinessId == business.BusinessId).ToListAsync(ct);
        var refundedIds = await db.PaymentRefunds.Where(x => x.SaleId == saleId && x.BusinessId == business.BusinessId).Select(x => x.PaymentId).ToListAsync(ct);
        var pending = received.Where(x => !refundedIds.Contains(x.Id)).ToList();
        if (pending.Count == 0) return await HistoryCoreAsync(saleId, ct);
        foreach (var payment in pending)
            db.PaymentRefunds.Add(new PaymentRefund { BusinessId = business.BusinessId, PaymentId = payment.Id, SaleId = saleId, Amount = payment.Amount, RefundDate = clock.UtcNow, Reference = request.Reference.Trim(), Reason = request.Reason.Trim(), CreatedBy = user.UserId });
        // Original receipts remain immutable. PaidAmount represents the net amount retained.
        sale.PaidAmount = 0;
        sale.Balance = 0;
        sale.PaymentStatus = PaymentStatus.Refunded;
        sale.Status = SaleStatus.Refunded;
        var debt = await db.Receivables.SingleOrDefaultAsync(x => x.SaleId == saleId && x.BusinessId == business.BusinessId, ct);
        if (debt is not null) { debt.Balance = 0; debt.Status = ReceivableStatus.Cancelled; }
        await db.SaveChangesAsync(ct);
        return await HistoryCoreAsync(saleId, ct);
    }, ct);

    public Task<Payment> CreateAsync(PaymentRequest request, CancellationToken ct) => db.InTransactionAsync(async () =>
    {
        var sale = await db.Sales.SingleOrDefaultAsync(x => x.Id == request.SaleId && x.BusinessId == business.BusinessId, ct) ?? throw AppException.NotFound();
        if (sale.Status != SaleStatus.Completed || request.Amount <= 0 || request.Amount > sale.Balance || decimal.Round(request.Amount, 2) != request.Amount) throw AppException.Conflict("El pago debe ser positivo y no superar el saldo de una venta completada.");
        if (!await db.PaymentMethods.AnyAsync(x => x.Id == request.PaymentMethodId && x.BusinessId == business.BusinessId && x.IsActive && x.Type != PaymentMethodType.Credit, ct)) throw AppException.NotFound();
        var payment = new Payment { BusinessId = business.BusinessId, SaleId = sale.Id, CustomerId = sale.CustomerId, PaymentMethodId = request.PaymentMethodId, Amount = request.Amount, Reference = request.Reference, Notes = request.Notes, PaymentDate = clock.UtcNow, CreatedBy = user.UserId };
        db.Payments.Add(payment);
        sale.PaidAmount += request.Amount; sale.Balance -= request.Amount; sale.PaymentStatus = sale.Balance == 0 ? PaymentStatus.Paid : PaymentStatus.Partial;
        var debt = await db.Receivables.SingleOrDefaultAsync(x => x.SaleId == sale.Id && x.BusinessId == business.BusinessId, ct);
        if (debt is not null) { debt.Balance = sale.Balance; debt.Status = sale.Balance == 0 ? ReceivableStatus.Paid : ReceivableStatus.Partial; }
        return payment;
    }, ct);
}
