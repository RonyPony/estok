using eStok.Application.Abstractions;
using eStok.Application.Common;
using eStok.Application.Features.Sales;
using eStok.Domain.Entities;
using eStok.Domain.Enums;
using Microsoft.EntityFrameworkCore;
namespace eStok.Application.Features.Quotes;
public sealed record QuoteRequest(Guid CustomerId, List<LineRequest> Items, string? Notes = null);
public sealed record UpdateQuoteRequest(QuoteStatus Status, string? Notes, DateTime ExpirationDate);
public sealed class QuoteService(IApplicationDbContext db, ICurrentBusiness business, ICurrentUser user, IDateTimeProvider clock, IDocumentSequenceService sequences, SalesService sales)
{
    public Task<PagedResult<Quote>> ListAsync(PagedRequest request, CancellationToken ct) => db.Quotes.AsNoTracking().Where(x => x.BusinessId == business.BusinessId && (request.Search == null || x.QuoteNumber.Contains(request.Search))).OrderByDescending(x => x.CreatedAt).PageAsync(request, ct);
    public async Task<Quote> GetAsync(Guid id, CancellationToken ct) => await db.Quotes.Include(x => x.Items).SingleOrDefaultAsync(x => x.Id == id && x.BusinessId == business.BusinessId, ct) ?? throw AppException.NotFound();
    public Task<Quote> UpdateAsync(Guid id, UpdateQuoteRequest request, CancellationToken ct) => db.InTransactionAsync(async () =>
    {
        var quote = await GetAsync(id, ct);
        if (quote.Status == QuoteStatus.Converted) throw AppException.Conflict("Un presupuesto convertido no puede modificarse.");
        if (request.Status is not (QuoteStatus.Draft or QuoteStatus.Sent or QuoteStatus.Accepted or QuoteStatus.Rejected) || request.ExpirationDate <= clock.UtcNow || request.Notes?.Length > 500)
            throw new AppException("INVALID_QUOTE", "Revisa el estado, las notas y la vigencia.");
        quote.Status = request.Status; quote.Notes = request.Notes; quote.ExpirationDate = request.ExpirationDate;
        return quote;
    }, ct);
    public Task<Quote> CreateAsync(QuoteRequest request, CancellationToken ct) => db.InTransactionAsync(async () =>
    {
        if (!await db.Customers.AnyAsync(x => x.Id == request.CustomerId && x.BusinessId == business.BusinessId && x.IsActive, ct)) throw AppException.NotFound();
        if (request.Items.Count is 0 or > 100) throw new AppException("INVALID_ITEMS", "Agrega entre 1 y 100 productos.");
        var days = await db.Settings.Where(x => x.BusinessId == business.BusinessId).Select(x => x.QuoteExpirationDays).SingleAsync(ct);
        var quote = new Quote { BusinessId = business.BusinessId, CustomerId = request.CustomerId, QuoteNumber = await sequences.NextAsync(DocumentType.Quote, ct), IssueDate = clock.UtcNow, ExpirationDate = clock.UtcNow.AddDays(days), Status = QuoteStatus.Draft, CreatedBy = user.UserId, Notes = request.Notes };
        foreach (var line in request.Items)
        {
            var product = await db.Products.SingleOrDefaultAsync(x => x.Id == line.ProductId && x.BusinessId == business.BusinessId && x.IsActive, ct) ?? throw AppException.NotFound();
            SalesService.ValidateLine(line, product.SalePrice);
            var subtotal = SalesService.Money(product.SalePrice * line.Quantity); var tax = SalesService.Money((subtotal - line.Discount) * product.TaxRate / 100);
            quote.Items.Add(new QuoteItem { BusinessId = business.BusinessId, QuoteId = quote.Id, ProductId = product.Id, Description = product.Name, Quantity = line.Quantity, UnitPrice = product.SalePrice, Discount = line.Discount, Tax = tax, Total = subtotal - line.Discount + tax });
            quote.Subtotal += subtotal; quote.Discount += line.Discount; quote.Tax += tax;
        }
        quote.Total = quote.Subtotal - quote.Discount + quote.Tax; db.Quotes.Add(quote); return quote;
    }, ct);
    public Task<Sale> ConvertAsync(Guid id, Guid warehouseId, CancellationToken ct) => db.InTransactionAsync(async () =>
    {
        var quote = await GetAsync(id, ct);
        if (quote.ConvertedSaleId.HasValue) return await sales.GetAsync(quote.ConvertedSaleId.Value, ct);
        if (quote.Status is QuoteStatus.Rejected or QuoteStatus.Expired || quote.ExpirationDate < clock.UtcNow) throw AppException.Conflict("El presupuesto ya no puede convertirse.");
        var sale = await sales.CreateCoreAsync(new SaleRequest(quote.CustomerId, warehouseId, quote.Items.Select(x => new LineRequest(x.ProductId ?? throw AppException.NotFound(), x.Quantity, x.Discount)).ToList(), quote.Notes), quote, ct);
        quote.Status = QuoteStatus.Converted; quote.ConvertedSaleId = sale.Id; return sale;
    }, ct);
}
