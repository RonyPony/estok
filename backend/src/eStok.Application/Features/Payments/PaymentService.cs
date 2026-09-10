using eStok.Application.Abstractions;
using eStok.Application.Common;
using eStok.Domain.Entities;
using eStok.Domain.Enums;
using Microsoft.EntityFrameworkCore;
namespace eStok.Application.Features.Payments;
public sealed record PaymentRequest(Guid SaleId, Guid PaymentMethodId, decimal Amount, string? Reference = null, string? Notes = null);
public sealed class PaymentService(IApplicationDbContext db, ICurrentBusiness business, ICurrentUser user, IDateTimeProvider clock)
{
    public Task<Payment> CreateAsync(PaymentRequest request, CancellationToken ct) => db.InTransactionAsync(async () =>
    {
        var sale = await db.Sales.SingleOrDefaultAsync(x => x.Id == request.SaleId && x.BusinessId == business.BusinessId, ct) ?? throw AppException.NotFound();
        if (sale.Status != SaleStatus.Completed || request.Amount <= 0 || request.Amount > sale.Balance || decimal.Round(request.Amount, 2) != request.Amount) throw AppException.Conflict("El pago debe ser positivo y no superar el saldo de una venta completada.");
        if (!await db.PaymentMethods.AnyAsync(x => x.Id == request.PaymentMethodId && x.BusinessId == business.BusinessId && x.IsActive && x.Type != PaymentMethodType.Credit, ct)) throw AppException.NotFound();
        var payment = new Payment { BusinessId = business.BusinessId, SaleId = sale.Id, CustomerId = sale.CustomerId, PaymentMethodId = request.PaymentMethodId, Amount = request.Amount, Reference = request.Reference, Notes = request.Notes, PaymentDate = clock.UtcNow, CreatedBy = user.UserId };
        db.Payments.Add(payment);
        sale.PaidAmount += request.Amount; sale.Balance -= request.Amount; sale.PaymentStatus = sale.Balance == 0 ? PaymentStatus.Paid : PaymentStatus.Partial;
        var debt = await db.Receivables.SingleAsync(x => x.SaleId == sale.Id && x.BusinessId == business.BusinessId, ct);
        debt.Balance = sale.Balance; debt.Status = sale.Balance == 0 ? ReceivableStatus.Paid : ReceivableStatus.Partial;
        return payment;
    }, ct);
}
