using eStok.Domain.Common;
namespace eStok.Domain.Entities;

public sealed class Customer : SoftDeletableEntity
{
    public string Code { get; set; } = "";
    public string FirstName { get; set; } = "";
    public string? LastName { get; set; }
    public string? BusinessName { get; set; }
    public string? DocumentType { get; set; }
    public string? DocumentNumber { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? SecondaryPhone { get; set; }
    public string? Notes { get; set; }
    public decimal? CreditLimit { get; set; }
    public bool IsActive { get; set; } = true;
}

public sealed class CustomerAddress : TenantEntity
{
    public Guid CustomerId { get; set; }
    public string AddressType { get; set; } = "Billing";
    public string AddressLine1 { get; set; } = "";
    public string? AddressLine2 { get; set; }
    public string? City { get; set; }
    public string? Province { get; set; }
    public string? PostalCode { get; set; }
    public string Country { get; set; } = "DO";
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public bool IsPrimary { get; set; }
}

public sealed class ProductCategory : SoftDeletableEntity
{
    public Guid? ParentCategoryId { get; set; }
    public string Name { get; set; } = "";
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
}

public sealed class Product : SoftDeletableEntity
{
    public Guid? CategoryId { get; set; }
    public string Sku { get; set; } = "";
    public string? Barcode { get; set; }
    public string Name { get; set; } = "";
    public string? Description { get; set; }
    public decimal Cost { get; set; }
    public decimal SalePrice { get; set; }
    public decimal TaxRate { get; set; }
    public bool TrackInventory { get; set; } = true;
    public decimal MinimumStock { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsActive { get; set; } = true;
}

public sealed class Warehouse : TenantEntity
{
    public string Name { get; set; } = "";
    public string? Address { get; set; }
    public bool IsDefault { get; set; }
    public bool IsActive { get; set; } = true;
}
