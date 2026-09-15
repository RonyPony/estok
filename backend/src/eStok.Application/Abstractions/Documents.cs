using eStok.Domain.Entities;
using eStok.Domain.Enums;
namespace eStok.Application.Abstractions;

public interface IDocumentService
{
    Task StoreAsync(Sale sale, CancellationToken ct);
    Task StoreAsync(Quote quote, CancellationToken ct);
    Task<BusinessDocument> GetAsync(Guid id, DocumentType type, CancellationToken ct);
    byte[] ValidateLogo(byte[] content);
}
