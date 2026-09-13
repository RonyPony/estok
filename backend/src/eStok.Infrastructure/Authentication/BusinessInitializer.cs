using eStok.Application.Abstractions;
using eStok.Application.Authorization;
using eStok.Domain.Entities;
using eStok.Domain.Enums;
using eStok.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
namespace eStok.Infrastructure.Authentication;

public sealed class BusinessInitializer(AppDbContext db) : IBusinessInitializer
{
    public async Task InitializeAsync(Guid businessId, Guid userId, string currency, CancellationToken ct)
    {
        var permissions = await PermissionSeeder.EnsureCatalogAsync(db, ct);
        foreach (var name in new[] { "Owner", "Administrator", "Manager", "Seller", "InventoryManager", "Viewer" })
        {
            var role = new Role { BusinessId = businessId, Name = name, IsSystemRole = true };
            db.Roles.Add(role);
            foreach (var p in permissions.Where(p => PermissionCodes.ForRole(name).Contains(p.Code)))
                db.RolePermissions.Add(new RolePermission { BusinessId = businessId, RoleId = role.Id, PermissionId = p.Id });
            if (name == "Owner") db.BusinessUsers.Add(new BusinessUser { BusinessId = businessId, UserId = userId, RoleId = role.Id, IsOwner = true });
        }
        db.Settings.Add(new BusinessSettings { BusinessId = businessId, Currency = currency, CurrencySymbol = currency == "DOP" ? "RD$" : currency });
        db.Warehouses.Add(new Warehouse { BusinessId = businessId, Name = "Almacén Principal", IsDefault = true });
        foreach (var (name, type) in new[] { ("Efectivo", PaymentMethodType.Cash), ("Tarjeta", PaymentMethodType.Card), ("Transferencia", PaymentMethodType.BankTransfer), ("Crédito", PaymentMethodType.Credit) })
            db.PaymentMethods.Add(new PaymentMethod { BusinessId = businessId, Name = name, Type = type });
        foreach (var (type, prefix) in new[] { (DocumentType.Sale, "FAC"), (DocumentType.Quote, "COT"), (DocumentType.Purchase, "COM") })
            db.Sequences.Add(new DocumentSequence { BusinessId = businessId, DocumentType = type, Prefix = prefix });
        await db.SaveChangesAsync(ct);
    }
}

public static class PermissionSeeder
{
    public static async Task<List<Permission>> EnsureCatalogAsync(AppDbContext db, CancellationToken ct)
    {
        var permissions = await db.Permissions.ToListAsync(ct);
        foreach (var code in PermissionCodes.All.Where(code => permissions.All(p => p.Code != code)))
        {
            var permission = new Permission { Code = code, Description = code };
            db.Permissions.Add(permission);
            permissions.Add(permission);
        }

        await db.SaveChangesAsync(ct);
        return permissions;
    }

    public static async Task SeedAdministratorRolesAsync(AppDbContext db, CancellationToken ct)
    {
        db.IsInitializing = true;
        try
        {
            var permissions = await EnsureCatalogAsync(db, ct);
            var businesses = await db.Businesses.IgnoreQueryFilters()
                .Where(business => business.IsActive)
                .ToListAsync(ct);
            var administrators = await db.Roles.IgnoreQueryFilters()
                .Where(role => role.Name == "Administrator")
                .ToListAsync(ct);
            var existingBusinessIds = administrators.Select(role => role.BusinessId).ToHashSet();
            foreach (var business in businesses.Where(business => !existingBusinessIds.Contains(business.Id)))
            {
                var role = new Role
                {
                    BusinessId = business.Id,
                    Name = "Administrator",
                    Description = "Acceso completo a la administración de la empresa.",
                    IsSystemRole = true,
                    IsActive = true
                };
                db.Roles.Add(role);
                administrators.Add(role);
            }

            await db.SaveChangesAsync(ct);
            var permissionIds = permissions.Select(permission => permission.Id).ToHashSet();
            var roleIds = administrators.Select(role => role.Id).ToHashSet();
            var existing = await db.RolePermissions.IgnoreQueryFilters()
                .Where(link => roleIds.Contains(link.RoleId) && permissionIds.Contains(link.PermissionId))
                .Select(link => new { link.RoleId, link.PermissionId })
                .ToListAsync(ct);
            var existingKeys = existing.Select(link => (link.RoleId, link.PermissionId)).ToHashSet();

            foreach (var role in administrators)
                foreach (var permission in permissions)
                    if (existingKeys.Add((role.Id, permission.Id)))
                        db.RolePermissions.Add(new RolePermission { BusinessId = role.BusinessId, RoleId = role.Id, PermissionId = permission.Id });

            await db.SaveChangesAsync(ct);
        }
        finally
        {
            db.IsInitializing = false;
        }
    }

    public static async Task SeedBusinessDefaultsAsync(AppDbContext db, CancellationToken ct)
    {
        db.IsInitializing = true;
        try
        {
            var businesses = await db.Businesses.IgnoreQueryFilters()
                .Where(business => business.IsActive)
                .ToListAsync(ct);
            var businessIds = businesses.Select(business => business.Id).ToHashSet();

            var settings = await db.Settings.IgnoreQueryFilters()
                .Where(item => businessIds.Contains(item.BusinessId))
                .Select(item => item.BusinessId)
                .ToHashSetAsync(ct);
            var warehouses = await db.Warehouses.IgnoreQueryFilters()
                .Where(item => businessIds.Contains(item.BusinessId))
                .Select(item => item.BusinessId)
                .ToHashSetAsync(ct);
            var paymentMethods = await db.PaymentMethods.IgnoreQueryFilters()
                .Where(item => businessIds.Contains(item.BusinessId))
                .Select(item => item.BusinessId)
                .ToHashSetAsync(ct);
            var sequences = await db.Sequences.IgnoreQueryFilters()
                .Where(item => businessIds.Contains(item.BusinessId))
                .Select(item => new { item.BusinessId, item.DocumentType })
                .ToHashSetAsync(ct);

            foreach (var business in businesses)
            {
                if (!settings.Contains(business.Id))
                    db.Settings.Add(new BusinessSettings { BusinessId = business.Id, Currency = business.Currency, CurrencySymbol = business.Currency == "DOP" ? "RD$" : business.Currency });
                if (!warehouses.Contains(business.Id))
                    db.Warehouses.Add(new Warehouse { BusinessId = business.Id, Name = "Almacén Principal", IsDefault = true });
                if (!paymentMethods.Contains(business.Id))
                    foreach (var (name, type) in new[] { ("Efectivo", PaymentMethodType.Cash), ("Tarjeta", PaymentMethodType.Card), ("Transferencia", PaymentMethodType.BankTransfer), ("Crédito", PaymentMethodType.Credit) })
                        db.PaymentMethods.Add(new PaymentMethod { BusinessId = business.Id, Name = name, Type = type });
                foreach (var (type, prefix) in new[] { (DocumentType.Sale, "FAC"), (DocumentType.Quote, "COT"), (DocumentType.Purchase, "COM") })
                    if (!sequences.Contains(new { BusinessId = business.Id, DocumentType = type }))
                        db.Sequences.Add(new DocumentSequence { BusinessId = business.Id, DocumentType = type, Prefix = prefix });
            }

            await db.SaveChangesAsync(ct);
        }
        finally
        {
            db.IsInitializing = false;
        }
    }
}
