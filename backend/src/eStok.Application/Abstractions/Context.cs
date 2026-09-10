using eStok.Domain.Entities;
using Microsoft.EntityFrameworkCore;
namespace eStok.Application.Abstractions;

public interface ICurrentBusiness { Guid BusinessId { get; } bool HasBusiness { get; } }
public interface ICurrentUser { Guid UserId { get; } string? Email { get; } bool IsAuthenticated { get; } }
public interface IDateTimeProvider { DateTime UtcNow { get; } }
public interface IApplicationDbContext
{
    DbSet<Business> Businesses { get; }
    DbSet<BusinessUser> BusinessUsers { get; }
    DbSet<Role> Roles { get; }
    DbSet<Permission> Permissions { get; }
    DbSet<RolePermission> RolePermissions { get; }
    DbSet<Customer> Customers { get; }
    DbSet<CustomerAddress> CustomerAddresses { get; }
    DbSet<Product> Products { get; }
    DbSet<ProductCategory> Categories { get; }
    DbSet<Warehouse> Warehouses { get; }
    DbSet<ProductStock> Stocks { get; }
    DbSet<InventoryMovement> Movements { get; }
    DbSet<Sale> Sales { get; }
    DbSet<Payment> Payments { get; }
    DbSet<PaymentMethod> PaymentMethods { get; }
    DbSet<AccountsReceivable> Receivables { get; }
    DbSet<Quote> Quotes { get; }
    DbSet<BusinessSettings> Settings { get; }
    DbSet<DocumentSequence> Sequences { get; }
    DbSet<AuditLog> AuditLogs { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    Task<T> InTransactionAsync<T>(Func<Task<T>> action, CancellationToken cancellationToken);
}
