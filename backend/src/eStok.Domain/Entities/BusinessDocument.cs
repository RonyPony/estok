using eStok.Domain.Common;
using eStok.Domain.Enums;
namespace eStok.Domain.Entities;

public sealed class BusinessDocument : TenantEntity
{
    public Guid SourceId { get; set; }
    public DocumentType DocumentType { get; set; }
    public string FileName { get; set; } = "";
    public byte[] Content { get; set; } = [];
}
