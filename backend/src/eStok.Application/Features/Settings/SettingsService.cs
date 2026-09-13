using eStok.Application.Abstractions;
using eStok.Application.Common;
using eStok.Domain.Entities;
using eStok.Domain.Enums;
using Microsoft.EntityFrameworkCore;
namespace eStok.Application.Features.Settings;
public sealed record SettingsRequest(string Name, string Currency, string Country, string TimeZone, bool AllowNegativeStock, decimal DefaultTaxRate, int QuoteExpirationDays, string InvoicePrefix, string QuotePrefix);
public sealed class SettingsService(IApplicationDbContext db, ICurrentBusiness business)
{
    public async Task<object> GetAsync(CancellationToken ct) => new { Business = await db.Businesses.SingleAsync(x => x.Id == business.BusinessId, ct), Settings = await db.Settings.SingleAsync(x => x.BusinessId == business.BusinessId, ct) };
    public Task<object> SaveAsync(SettingsRequest request, CancellationToken ct) => db.InTransactionAsync<object>(async () =>
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            throw new AppException("INVALID_NAME", "El nombre es obligatorio.");

        if (request.Name.Length > 200)
            throw new AppException("INVALID_NAME", "El nombre no puede exceder los 200 caracteres.");

        if (!System.Text.RegularExpressions.Regex.IsMatch(request.Currency, "^[A-Z]{3}$"))
            throw new AppException("INVALID_CURRENCY", "La moneda debe tener exactamente 3 letras mayúsculas, por ejemplo: DOP, USD o EUR.");

        if (request.Country.Length != 2)
            throw new AppException("INVALID_COUNTRY", "El código de país debe tener exactamente 2 caracteres.");

        if (request.QuoteExpirationDays is < 1 or > 365)
            throw new AppException("INVALID_QUOTE_EXPIRATION_DAYS", "Los días de expiración de la cotización deben estar entre 1 y 365.");

        if (request.DefaultTaxRate is < 0 or > 100)
            throw new AppException("INVALID_DEFAULT_TAX_RATE", "La tasa de impuesto predeterminada debe estar entre 0 y 100.");

        if (!System.Text.RegularExpressions.Regex.IsMatch(request.InvoicePrefix, "^[A-Z0-9-]{1,10}$"))
            throw new AppException("INVALID_INVOICE_PREFIX", "El prefijo de factura debe tener entre 1 y 10 caracteres y solo puede contener letras mayúsculas, números y guiones.");

        if (!System.Text.RegularExpressions.Regex.IsMatch(request.QuotePrefix, "^[A-Z0-9-]{1,10}$"))
            throw new AppException("INVALID_QUOTE_PREFIX", "El prefijo de cotización debe tener entre 1 y 10 caracteres y solo puede contener letras mayúsculas, números y guiones.");
        if (!TimeZoneInfo.TryFindSystemTimeZoneById(request.TimeZone, out _)) throw new AppException("INVALID_TIMEZONE", "Zona horaria inválida.");
        var b = await db.Businesses.SingleAsync(x => x.Id == business.BusinessId, ct);
        if (b.Currency != request.Currency && await db.Sales.AnyAsync(x => x.BusinessId == business.BusinessId, ct)) throw AppException.Conflict("No se puede cambiar la moneda cuando existen ventas.");
        b.Name = request.Name; b.Currency = request.Currency; b.Country = request.Country; b.TimeZone = request.TimeZone;
        var settings = await db.Settings.SingleAsync(x => x.BusinessId == business.BusinessId, ct);
        settings.Currency = request.Currency; settings.AllowNegativeStock = request.AllowNegativeStock; settings.DefaultTaxRate = request.DefaultTaxRate; settings.QuoteExpirationDays = request.QuoteExpirationDays; settings.InvoicePrefix = request.InvoicePrefix; settings.QuotePrefix = request.QuotePrefix;
        foreach (var sequence in await db.Sequences.Where(x => x.BusinessId == business.BusinessId).ToListAsync(ct)) { if (sequence.DocumentType == DocumentType.Sale) sequence.Prefix = request.InvoicePrefix; if (sequence.DocumentType == DocumentType.Quote) sequence.Prefix = request.QuotePrefix; }
        return new { Business = b, Settings = settings };
    }, ct);
}

