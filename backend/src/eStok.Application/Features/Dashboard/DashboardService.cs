using eStok.Application.Abstractions;
using eStok.Domain.Enums;
using Microsoft.EntityFrameworkCore;
namespace eStok.Application.Features.Dashboard;
public sealed class DashboardService(IApplicationDbContext db, ICurrentBusiness business, IDateTimeProvider clock)
{
    public async Task<object> GetAsync(CancellationToken ct)
    {
        var b = await db.Businesses.SingleAsync(x => x.Id == business.BusinessId, ct);
        var zone = TimeZoneInfo.FindSystemTimeZoneById(b.TimeZone);
        var local = TimeZoneInfo.ConvertTimeFromUtc(clock.UtcNow, zone);
        var today = TimeZoneInfo.ConvertTimeToUtc(DateTime.SpecifyKind(local.Date, DateTimeKind.Unspecified), zone);
        var month = TimeZoneInfo.ConvertTimeToUtc(new DateTime(local.Year, local.Month, 1), zone);
        var sales = db.Sales.Where(x => x.BusinessId == business.BusinessId && x.Status == SaleStatus.Completed);
        var lowStock = db.Stocks.Where(x => x.BusinessId == business.BusinessId).Join(db.Products.Where(x => x.BusinessId == business.BusinessId), x => x.ProductId, x => x.Id, (s, p) => new { p.Id, p.Name, p.Sku, s.Quantity, p.MinimumStock }).Where(x => x.Quantity <= x.MinimumStock);
        return new {
            SalesToday = await sales.Where(x => x.SaleDate >= today).SumAsync(x => x.Total, ct),
            SalesThisMonth = await sales.Where(x => x.SaleDate >= month).SumAsync(x => x.Total, ct),
            EstimatedProfit = await sales.Where(x => x.SaleDate >= month).SelectMany(x => x.Items).SumAsync(x => x.Total - x.Tax - x.UnitCost * x.Quantity, ct),
            AccountsReceivable = await db.Receivables.Where(x => x.BusinessId == business.BusinessId && x.Status != ReceivableStatus.Cancelled).SumAsync(x => x.Balance, ct),
            Customers = await db.Customers.CountAsync(x => x.BusinessId == business.BusinessId, ct),
            Products = await db.Products.CountAsync(x => x.BusinessId == business.BusinessId, ct),
            QuotesPending = await db.Quotes.CountAsync(x => x.BusinessId == business.BusinessId && (x.Status == QuoteStatus.Draft || x.Status == QuoteStatus.Sent), ct),
            LowStock = await lowStock.CountAsync(ct),
            LowStockProducts = await lowStock.OrderBy(x => x.Quantity).Take(5).ToListAsync(ct),
            RecentSales = await sales.OrderByDescending(x => x.SaleDate).Take(5).Select(x => new { x.Id, x.SaleNumber, x.Total, x.PaymentStatus }).ToListAsync(ct),
            OutstandingReceivables = await db.Receivables.Where(x => x.BusinessId == business.BusinessId && x.Balance > 0).OrderByDescending(x => x.Balance).Take(5).ToListAsync(ct),
            SalesChart = await sales.Where(x => x.SaleDate >= month).GroupBy(x => x.SaleDate.Date).Select(x => new { Date = x.Key, Total = x.Sum(s => s.Total) }).OrderBy(x => x.Date).ToListAsync(ct)
        };
    }
}
