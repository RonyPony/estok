using eStok.Domain.Common;
using eStok.Domain.Enums;
namespace eStok.Domain.Entities;

public sealed class Sale : TenantEntity
{
    public Guid? CustomerId { get; set; }
    public Guid WarehouseId { get; set; }
    public string SaleNumber { get; set; } = "";
    public DateTime SaleDate { get; set; }
    public SaleStatus Status { get; set; } = SaleStatus.Completed;
    public decimal Subtotal { get; set; }
    public decimal Discount { get; set; }
    public decimal Tax { get; set; }
    public decimal Total { get; set; }
    public bool SellerAssumesTax { get; set; }
    public bool IncludeCategoriesInReceipt { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal Balance { get; set; }
    public PaymentStatus PaymentStatus { get; set; }
    public string? Notes { get; set; }
    public Guid CreatedBy { get; set; }
    public List<SaleItem> Items { get; set; } = [];
}

public sealed class SaleItem : TenantEntity
{
    public Guid SaleId { get; set; }
    public Guid? ProductId { get; set; }
    public string Description { get; set; } = "";
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal UnitCost { get; set; }
    public decimal Discount { get; set; }
    public decimal Tax { get; set; }
    public decimal Subtotal { get; set; }
    public decimal Total { get; set; }
    public string? Comment { get; set; }
    public string? CategoryName { get; set; }
}

public sealed class PaymentMethod : TenantEntity
{
    public string Name { get; set; } = "";
    public PaymentMethodType Type { get; set; }
    public bool IsActive { get; set; } = true;
}

public sealed class Payment : TenantEntity
{
    public Guid? CustomerId { get; set; }
    public Guid? SaleId { get; set; }
    public Guid PaymentMethodId { get; set; }
    public decimal Amount { get; set; }
    public DateTime PaymentDate { get; set; }
    public string? Reference { get; set; }
    public string? Notes { get; set; }
    public Guid CreatedBy { get; set; }
}

public sealed class AccountsReceivable : TenantEntity
{
    public Guid CustomerId { get; set; }
    public Guid SaleId { get; set; }
    public decimal OriginalAmount { get; set; }
    public decimal Balance { get; set; }
    public DateTime? DueDate { get; set; }
    public ReceivableStatus Status { get; set; }
}

public sealed class Quote : TenantEntity
{
    public Guid CustomerId { get; set; }
    public string QuoteNumber { get; set; } = "";
    public DateTime IssueDate { get; set; }
    public DateTime ExpirationDate { get; set; }
    public QuoteStatus Status { get; set; }
    public decimal Subtotal { get; set; }
    public decimal Discount { get; set; }
    public decimal Tax { get; set; }
    public decimal Total { get; set; }
    public string? Notes { get; set; }
    public Guid CreatedBy { get; set; }
    public Guid? ConvertedSaleId { get; set; }
    public List<QuoteItem> Items { get; set; } = [];
}

public sealed class QuoteItem : TenantEntity
{
    public Guid QuoteId { get; set; }
    public Guid? ProductId { get; set; }
    public string Description { get; set; } = "";
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal Discount { get; set; }
    public decimal Tax { get; set; }
    public decimal Total { get; set; }
}
