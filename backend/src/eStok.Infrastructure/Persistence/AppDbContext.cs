using System.Data;
using System.Linq.Expressions;
using eStok.Application.Abstractions;
using eStok.Application.Common;
using eStok.Domain.Common;
using eStok.Domain.Entities;
using eStok.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace eStok.Infrastructure.Persistence;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options, ICurrentBusiness business, ICurrentUser user, IDateTimeProvider clock)
    : IdentityUserContext<ApplicationUser, Guid>(options), IApplicationDbContext
{
    private Guid TenantId => business.BusinessId;
    internal bool IsInitializing { get; set; }
    public DbSet<Business> Businesses => Set<Business>();
    public DbSet<BusinessUser> BusinessUsers => Set<BusinessUser>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<CustomerAddress> CustomerAddresses => Set<CustomerAddress>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductCategory> Categories => Set<ProductCategory>();
    public DbSet<Warehouse> Warehouses => Set<Warehouse>();
    public DbSet<ProductStock> Stocks => Set<ProductStock>();
    public DbSet<InventoryMovement> Movements => Set<InventoryMovement>();
    public DbSet<Sale> Sales => Set<Sale>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<PaymentMethod> PaymentMethods => Set<PaymentMethod>();
    public DbSet<AccountsReceivable> Receivables => Set<AccountsReceivable>();
    public DbSet<Quote> Quotes => Set<Quote>();
    public DbSet<BusinessSettings> Settings => Set<BusinessSettings>();
    public DbSet<DocumentSequence> Sequences => Set<DocumentSequence>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    protected override void OnModelCreating(ModelBuilder model)
    {
        base.OnModelCreating(model);
        model.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
        foreach (var type in model.Model.GetEntityTypes().Where(t => typeof(TenantEntity).IsAssignableFrom(t.ClrType)))
        {
            var p = Expression.Parameter(type.ClrType, "entity");
            Expression filter = Expression.Equal(Expression.Property(p, "BusinessId"), Expression.Property(Expression.Constant(this), nameof(TenantId)));
            if (typeof(SoftDeletableEntity).IsAssignableFrom(type.ClrType))
                filter = Expression.AndAlso(filter, Expression.Not(Expression.Property(p, "IsDeleted")));
            model.Entity(type.ClrType).HasQueryFilter(Expression.Lambda(filter, p));
        }
        foreach (var property in model.Model.GetEntityTypes().SelectMany(e => e.GetProperties()))
        {
            if (property.ClrType == typeof(decimal) || property.ClrType == typeof(decimal?))
            {
                property.SetPrecision(18);
                property.SetScale(property.Name.Contains("Quantity") || property.Name == "MinimumStock" ? 4 : 2);
            }
            if (property.ClrType == typeof(string) && property.GetMaxLength() is null) property.SetMaxLength(500);
        }
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var changes = ChangeTracker.Entries<Entity>().Where(e => e.State is EntityState.Added or EntityState.Modified or EntityState.Deleted).ToList();
        foreach (var entry in changes)
        {
            if (entry.Entity is TenantEntity tenant)
            {
                if (!IsInitializing && entry.State != EntityState.Added)
                {
                    var persisted = await entry.GetDatabaseValuesAsync(cancellationToken);
                    if (persisted is null || persisted.GetValue<Guid>(nameof(TenantEntity.BusinessId)) != TenantId)
                        throw new AppException("TENANT_ACCESS_DENIED", "Acceso denegado.", 403);
                }
                if (!IsInitializing && (!business.HasBusiness || tenant.BusinessId != TenantId ||
                    (entry.State != EntityState.Added && entry.Property(nameof(TenantEntity.BusinessId)).OriginalValue is Guid original && original != TenantId)))
                    throw new AppException("TENANT_ACCESS_DENIED", "Acceso denegado.", 403);
                if (entry.State != EntityState.Added && entry.Entity is InventoryMovement or Payment or AuditLog)
                    throw AppException.Conflict("El registro histórico es inmutable.");
                if (entry.State == EntityState.Deleted)
                {
                    if (entry.Entity is not SoftDeletableEntity soft) throw AppException.Conflict("No se puede eliminar este registro.");
                    entry.State = EntityState.Modified;
                    soft.IsDeleted = true; soft.DeletedAt = clock.UtcNow; soft.DeletedBy = user.UserId;
                }
                if (entry.Entity is not AuditLog && !IsInitializing)
                    AuditLogs.Add(new AuditLog { BusinessId = tenant.BusinessId, UserId = user.UserId, EntityName = entry.Entity.GetType().Name, EntityId = tenant.Id.ToString(), Action = entry.State.ToString(), CreatedAt = clock.UtcNow });
            }
            if (entry.State == EntityState.Added) entry.Entity.CreatedAt = clock.UtcNow;
            else entry.Entity.UpdatedAt = clock.UtcNow;
        }
        return await base.SaveChangesAsync(cancellationToken);
    }

    public async Task<T> InTransactionAsync<T>(Func<Task<T>> action, CancellationToken ct)
    {
        if (Database.CurrentTransaction is not null) return await action();
        await using var transaction = await Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);
        var result = await action();
        await SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);
        return result;
    }
}
