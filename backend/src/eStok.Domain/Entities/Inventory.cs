using eStok.Domain.Common;
using eStok.Domain.Enums;
namespace eStok.Domain.Entities;

public sealed class ProductStock : TenantEntity
{
    public Guid ProductId { get; set; }
    public Guid WarehouseId { get; set; }
    public decimal Quantity { get; set; }
    public decimal ReservedQuantity { get; set; }
}

public sealed class InventoryMovement : TenantEntity
{
    public Guid ProductId { get; set; }
    public Guid WarehouseId { get; set; }
    public InventoryMovementType MovementType { get; set; }
    public decimal Quantity { get; set; }
    public decimal? UnitCost { get; set; }
    public string? ReferenceType { get; set; }
    public Guid? ReferenceId { get; set; }
    public string? Notes { get; set; }
    public Guid CreatedBy { get; set; }
}

public sealed class DocumentSequence : TenantEntity
{
    public DocumentType DocumentType { get; set; }
    public string Prefix { get; set; } = "";
    public long CurrentNumber { get; set; }
    public string Next() => $"{Prefix}-{++CurrentNumber:D6}";
}

public sealed class AuditLog : TenantEntity
{
    public Guid? UserId { get; set; }
    public string EntityName { get; set; } = "";
    public string EntityId { get; set; } = "";
    public string Action { get; set; } = "";
    public string? OldValues { get; set; }
    public string? NewValues { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
}
