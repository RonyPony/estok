using eStok.Domain.Common;
namespace eStok.Domain.Entities;

// Global audit intentionally survives tenant and record deletion. No cascading foreign keys.
public sealed class PlatformAuditLog : Entity
{
    public Guid UserId { get; set; }
    public Guid? BusinessId { get; set; }
    public string EntityName { get; set; } = "";
    public string EntityId { get; set; } = "";
    public string Action { get; set; } = "";
    public string Reason { get; set; } = "";
    public string? PreviousValue { get; set; }
    public string? NewValue { get; set; }
}
