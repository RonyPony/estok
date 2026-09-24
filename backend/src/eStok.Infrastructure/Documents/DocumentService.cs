using System.Globalization;
using eStok.Application.Abstractions;
using eStok.Application.Common;
using eStok.Domain.Entities;
using eStok.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using MigraDoc.DocumentObjectModel;
using MigraDoc.Rendering;
using PdfSharp.Drawing;
using PdfSharp.Fonts;

namespace eStok.Infrastructure.Documents;

public sealed class DocumentService(IApplicationDbContext db, ICurrentBusiness business) : IDocumentService
{
    static DocumentService()
    {
        GlobalFontSettings.FontResolver = new DocumentFontResolver();
        // PDFsharp 6.2 subset generation can omit nested accent glyphs in Noto Sans.
        // Embedding the complete OFL font preserves Spanish characters in every viewer.
        _ = new XFont("Noto Sans", 9, XFontStyleEx.Regular,
            new XPdfFontOptions(PdfSharp.Pdf.PdfFontEmbedding.EmbedCompleteFontFile));
    }
    private record Line(string Description, decimal Quantity, decimal Price, decimal Discount, decimal Tax, decimal Total, string? Comment = null, string? CategoryName = null);

    public Task StoreAsync(Sale sale, CancellationToken ct) => StoreCoreAsync(sale.Id, DocumentType.Sale, sale.SaleNumber, sale.CustomerId, sale.SaleDate, null, sale.Notes,
        sale.Items.Select(x => new Line(x.Description, x.Quantity, x.UnitPrice, x.Discount, x.Tax, x.Total, x.Comment, sale.IncludeCategoriesInReceipt ? x.CategoryName : null)), sale.Subtotal, sale.Discount, sale.Tax, sale.Total, sale.SellerAssumesTax, ct);
    public Task StoreAsync(Quote quote, CancellationToken ct) => StoreCoreAsync(quote.Id, DocumentType.Quote, quote.QuoteNumber, quote.CustomerId, quote.IssueDate, quote.ExpirationDate, quote.Notes,
        quote.Items.Select(x => new Line(x.Description, x.Quantity, x.UnitPrice, x.Discount, x.Tax, x.Total)), quote.Subtotal, quote.Discount, quote.Tax, quote.Total, false, ct);

    public Task<BusinessDocument> GetAsync(Guid id, DocumentType type, CancellationToken ct) => db.InTransactionAsync(async () =>
    {
        var stored = await db.Documents.SingleOrDefaultAsync(x => x.BusinessId == business.BusinessId && x.SourceId == id && x.DocumentType == type, ct);
        if (stored is not null) return stored;
        // Documents predating this feature are generated on their first download.
        if (type == DocumentType.Sale)
            await StoreAsync(await db.Sales.Include(x => x.Items).SingleOrDefaultAsync(x => x.Id == id && x.BusinessId == business.BusinessId, ct) ?? throw AppException.NotFound(), ct);
        else
            await StoreAsync(await db.Quotes.Include(x => x.Items).SingleOrDefaultAsync(x => x.Id == id && x.BusinessId == business.BusinessId, ct) ?? throw AppException.NotFound(), ct);
        return db.Documents.Local.Single(x => x.SourceId == id && x.DocumentType == type && x.BusinessId == business.BusinessId);
    }, ct);

    public byte[] ValidateLogo(byte[] content)
    {
        if (content.Length is 0 or > 2097152 || !(content.AsSpan().StartsWith(new byte[] {137,80,78,71,13,10,26,10}) || content.AsSpan().StartsWith(new byte[] {255,216,255})))
            throw new AppException("INVALID_LOGO", "Selecciona una imagen PNG o JPG de hasta 2 MB.");
        try
        {
            using var stream = new MemoryStream(content, 0, content.Length, false, true);
            using var image = XImage.FromStream(stream);
            if (image.PixelWidth > 4096 || image.PixelHeight > 4096) throw new InvalidOperationException();
            return content;
        }
        catch { throw new AppException("INVALID_LOGO", "La imagen no es válida o supera los 4096 píxeles por lado."); }
    }

    private async Task StoreCoreAsync(Guid id, DocumentType type, string number, Guid? customerId, DateTime date, DateTime? expiration, string? notes,
        IEnumerable<Line> lines, decimal subtotal, decimal discount, decimal tax, decimal total, bool sellerAssumesTax, CancellationToken ct)
    {
        var company = await db.Businesses.SingleAsync(x => x.Id == business.BusinessId, ct);
        var settings = await db.Settings.SingleAsync(x => x.BusinessId == business.BusinessId, ct);
        var customer = customerId.HasValue ? await db.Customers.IgnoreQueryFilters().SingleOrDefaultAsync(x => x.Id == customerId && x.BusinessId == business.BusinessId, ct) : null;
        var document = new Document();
        document.Info.Title = $"{(type == DocumentType.Sale ? "Factura" : "Presupuesto")} {number}";
        document.Info.Author = company.Name;
        var normal = document.Styles[StyleNames.Normal]!;
        normal.Font.Name = "Noto Sans"; normal.Font.Size = 9; normal.Font.Color = Color.Parse("#17243B");
        normal.ParagraphFormat.SpaceAfter = 6;
        var section = document.AddSection();
        section.PageSetup.PageFormat = PageFormat.A4;
        section.PageSetup.LeftMargin = section.PageSetup.RightMargin = Unit.FromCentimeter(1.6);
        section.PageSetup.TopMargin = section.PageSetup.BottomMargin = Unit.FromCentimeter(1.8);
        if (company.LogoContent is { Length: > 0 } logo)
        {
            using var stream = new MemoryStream(logo, 0, logo.Length, false, true);
            using var source = XImage.FromStream(stream);
            var image = section.AddImage("base64:" + Convert.ToBase64String(logo));
            image.Width = Unit.FromPoint(Math.Min(120, 52.0 * source.PixelWidth / source.PixelHeight) * (double)settings.InvoiceLogoScale);
            image.LockAspectRatio = true;
        }
        var heading = section.AddParagraph(string.IsNullOrWhiteSpace(company.LegalName) ? company.Name : company.LegalName); heading.Format.Font.Size = 21; heading.Format.Font.Bold = true;
        if (!string.IsNullOrWhiteSpace(company.LegalName) && company.LegalName != company.Name) section.AddParagraph("Nombre comercial: " + company.Name);
        if (!string.IsNullOrWhiteSpace(company.TaxId)) section.AddParagraph("Identificación fiscal: " + company.TaxId);
        if (!string.IsNullOrWhiteSpace(company.Address)) section.AddParagraph(company.Address);
        if (!string.IsNullOrWhiteSpace(company.Phone)) section.AddParagraph("Teléfono: " + company.Phone);
        if (!string.IsNullOrWhiteSpace(company.Email)) section.AddParagraph("Email: " + company.Email);
        var title = section.AddParagraph(document.Info.Title); title.Format.Font.Size = 16; title.Format.Font.Color = Color.Parse("#3659D9"); title.Format.SpaceBefore = 12;
        var zone = TimeZoneInfo.FindSystemTimeZoneById(company.TimeZone);
        section.AddParagraph("Fecha: " + TimeZoneInfo.ConvertTimeFromUtc(DateTime.SpecifyKind(date, DateTimeKind.Utc), zone).ToString("dd/MM/yyyy HH:mm"));
        if (expiration.HasValue) section.AddParagraph("Válido hasta: " + TimeZoneInfo.ConvertTimeFromUtc(DateTime.SpecifyKind(expiration.Value, DateTimeKind.Utc), zone).ToString("dd/MM/yyyy"));
        section.AddParagraph("Cliente: " + (customer is null ? "Consumidor final · Contado" : customer.BusinessName ?? $"{customer.FirstName} {customer.LastName}".Trim()));
        if (!string.IsNullOrWhiteSpace(customer?.DocumentNumber)) section.AddParagraph("Documento: " + customer.DocumentNumber);
        section.AddParagraph("Moneda: " + company.Currency);
        var table = section.AddTable();
        table.Borders.Color = Color.Parse("#DFE5EF"); table.Borders.Width = .5;
        table.TopPadding = table.BottomPadding = 6;
        foreach (var width in new[] { 5.6, 1.7, 2.5, 2.5, 2.5, 3.0 }) table.AddColumn(Unit.FromCentimeter(width));
        var header = table.AddRow(); header.HeadingFormat = true; header.Shading.Color = Color.Parse("#17243B"); header.Format.Font.Color = Colors.White; header.Format.Font.Bold = true;
        string[] labels = ["Producto", "Cant.", "Precio", "Descuento", "Impuesto", "Total"];
        for (var i = 0; i < labels.Length; i++) header.Cells[i].AddParagraph(labels[i]);
        static string Money(decimal value) => value.ToString("N2", CultureInfo.GetCultureInfo("es-DO"));
        foreach (var line in lines)
        {
            var row = table.AddRow();
            var description = row.Cells[0].AddParagraph(line.Description);
            description.Format.Font.Bold = true;
            if (!string.IsNullOrWhiteSpace(line.CategoryName)) { var category = row.Cells[0].AddParagraph("Categoría: " + line.CategoryName); category.Format.Font.Size = 8; category.Format.Font.Color = Color.Parse("#657089"); }
            if (!string.IsNullOrWhiteSpace(line.Comment)) { var comment = row.Cells[0].AddParagraph("Detalle: " + line.Comment); comment.Format.Font.Size = 8; comment.Format.Font.Color = Color.Parse("#657089"); }
            string[] values = [line.Quantity.ToString("0.####", CultureInfo.InvariantCulture), Money(line.Price), Money(line.Discount), Money(line.Tax), Money(line.Total)];
            for (var i = 0; i < values.Length; i++) { row.Cells[i + 1].AddParagraph(values[i]); row.Cells[i + 1].Format.Alignment = ParagraphAlignment.Right; }
        }
        section.AddParagraph();
        foreach (var item in new[] { ("Subtotal", subtotal), ("Descuento", discount), ("Impuestos", tax), ("TOTAL", total) })
        {
            var p = section.AddParagraph($"{item.Item1}: {company.Currency} {Money(item.Item2)}"); p.Format.Alignment = ParagraphAlignment.Right;
            p.Format.KeepWithNext = item.Item1 != "TOTAL";
            if (item.Item1 == "TOTAL") { p.Format.Font.Bold = true; p.Format.Font.Size = 15; p.Format.Font.Color = Color.Parse("#3659D9"); }
        }
        if (sellerAssumesTax) section.AddParagraph("El impuesto fue asumido por el negocio y se descontó del total cobrado.");
        if (!string.IsNullOrWhiteSpace(notes)) section.AddParagraph("Notas: " + notes);
        if (!string.IsNullOrWhiteSpace(settings.InvoiceAdditionalInfo))
        {
            var info = section.AddParagraph();
            foreach (var line in settings.InvoiceAdditionalInfo.Split('\n'))
            {
                info.AddText(line);
                info.AddLineBreak();
            }
        }
        var footer = section.Footers.Primary.AddParagraph(); footer.Format.Alignment = ParagraphAlignment.Center; footer.Format.Font.Size = 8;
        footer.AddText(number + " · Página "); footer.AddPageField(); footer.AddText(" de "); footer.AddNumPagesField();
        var renderer = new PdfDocumentRenderer { Document = document }; renderer.RenderDocument();
        using var output = new MemoryStream(); renderer.PdfDocument.Save(output, false);
        var stored = await db.Documents.SingleOrDefaultAsync(x => x.BusinessId == business.BusinessId && x.SourceId == id && x.DocumentType == type, ct);
        if (stored is null) { stored = new BusinessDocument { BusinessId = business.BusinessId, SourceId = id, DocumentType = type, FileName = number + ".pdf" }; db.Documents.Add(stored); }
        stored.Content = output.ToArray();
    }
}

internal sealed class DocumentFontResolver : IFontResolver
{
    public FontResolverInfo ResolveTypeface(string familyName, bool bold, bool italic) => new("NotoSans", bold, italic);
    public byte[] GetFont(string faceName)
    {
        using var stream = typeof(DocumentFontResolver).Assembly.GetManifestResourceStream("eStok.Infrastructure.Documents.Fonts.NotoSans-Regular.ttf")!;
        using var output = new MemoryStream(); stream.CopyTo(output); return output.ToArray();
    }
}
