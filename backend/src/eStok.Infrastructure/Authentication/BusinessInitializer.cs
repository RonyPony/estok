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
        var permissions = await db.Permissions.ToListAsync(ct);
        foreach (var code in PermissionCodes.All.Where(code => permissions.All(p => p.Code != code)))
        {
            var permission = new Permission { Code = code, Description = code };
            db.Permissions.Add(permission); permissions.Add(permission);
        }
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
