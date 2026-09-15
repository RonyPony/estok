using eStok.Domain.Common;
namespace eStok.Domain.Entities;

public sealed class Business : Entity
{
    public string Name { get; set; } = "";
    public string? LegalName { get; set; }
    public string? TaxId { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
    public string? LogoUrl { get; set; }
    [System.Text.Json.Serialization.JsonIgnore]
    public byte[]? LogoContent { get; set; }
    public string Currency { get; set; } = "DOP";
    public string Country { get; set; } = "DO";
    public string TimeZone { get; set; } = "America/Santo_Domingo";
    public bool IsActive { get; set; } = true;
}

public sealed class BusinessUser : TenantEntity
{
    public Guid UserId { get; set; }
    public Guid RoleId { get; set; }
    public bool IsOwner { get; set; }
    public bool IsActive { get; set; } = true;
}

public sealed class Role : TenantEntity
{
    public string Name { get; set; } = "";
    public string? Description { get; set; }
    public bool IsSystemRole { get; set; }
    public bool IsActive { get; set; } = true;
}

public sealed class Permission : Entity
{
    public string Code { get; set; } = "";
    public string Description { get; set; } = "";
}

public sealed class RolePermission : TenantEntity
{
    public Guid RoleId { get; set; }
    public Guid PermissionId { get; set; }
}

public sealed class BusinessSettings : TenantEntity
{
    public string Currency { get; set; } = "DOP";
    public string CurrencySymbol { get; set; } = "RD$";
    public bool TaxEnabled { get; set; }
    public decimal DefaultTaxRate { get; set; }
    public int QuoteExpirationDays { get; set; } = 30;
    public bool LowStockEnabled { get; set; } = true;
    public bool AllowNegativeStock { get; set; }
    public string InvoicePrefix { get; set; } = "FAC";
    public string QuotePrefix { get; set; } = "COT";
    public string PurchasePrefix { get; set; } = "COM";
}
