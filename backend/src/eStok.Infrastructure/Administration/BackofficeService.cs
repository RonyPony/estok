using System.Data;
using System.Data.Common;
using System.Linq.Expressions;
using System.Reflection;
using eStok.Application.Common;
using eStok.Domain.Common;
using eStok.Domain.Entities;
using eStok.Infrastructure.Identity;
using eStok.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace eStok.Infrastructure.Administration;

public sealed record AdminChange(string Reason, string Confirmation, bool? Active = null);
public sealed record AdminRecord(Guid Id, string Name, Guid? BusinessId, bool? IsActive, bool IsDeleted,
    DateTime? CreatedAt, DateTime? UpdatedAt, DateTime? DeletedAt, Guid? DeletedBy,
    string? Email, Guid? UserId, Guid? RoleId, DateTime? LastActivityAt, Dictionary<string, string?> ReviewFields)
{
    public string? BusinessName { get; init; }
    public string? UserName { get; init; }
    public string? RoleName { get; init; }
}
public sealed record AdminAudit(Guid Id, Guid? UserId, Guid? BusinessId, string EntityName, string EntityId,
    string Action, DateTime CreatedAt, string Source, string? Reason, string? PreviousValue, string? NewValue)
{
    public string? UserName { get; init; }
    public string? BusinessName { get; init; }
}

public sealed class BackofficeService(AppDbContext db)
{
    private IEnumerable<Type> ManagedTypes => db.Model.GetEntityTypes().Select(x => x.ClrType)
        .Where(t => t.GetProperty("IsActive")?.PropertyType == typeof(bool) || typeof(SoftDeletableEntity).IsAssignableFrom(t));

    public object Catalog() => ManagedTypes.OrderBy(t => t.Name).Select(t => new {
        key = t.Name, canActivate = t.GetProperty("IsActive") != null,
        canRestore = typeof(SoftDeletableEntity).IsAssignableFrom(t), tenantScoped = typeof(TenantEntity).IsAssignableFrom(t)
    }).ToArray();

    public async Task<object> DashboardAsync(int activityMinutes, CancellationToken ct)
    {
        var since = DateTime.UtcNow.AddMinutes(-activityMinutes);
        return new {
            users = await db.Users.CountAsync(ct), activeUsers = await db.Users.CountAsync(x => x.IsActive, ct),
            recentlyActiveUsers = await db.Users.CountAsync(x => x.IsActive && x.LastActivityAt >= since, ct), activityMinutes,
            pendingUsers = await db.Users.CountAsync(x => !x.IsActive, ct),
            businesses = await db.Businesses.CountAsync(ct), activeBusinesses = await db.Businesses.CountAsync(x => x.IsActive, ct),
            pendingMemberships = await db.BusinessUsers.IgnoreQueryFilters().CountAsync(x => !x.IsActive, ct),
            deletedRecords = await db.Customers.IgnoreQueryFilters().CountAsync(x => x.IsDeleted, ct)
                + await db.Products.IgnoreQueryFilters().CountAsync(x => x.IsDeleted, ct)
                + await db.Categories.IgnoreQueryFilters().CountAsync(x => x.IsDeleted, ct),
            auditActions = await db.AuditLogs.IgnoreQueryFilters().LongCountAsync(ct) + await db.PlatformAuditLogs.LongCountAsync(ct)
        };
    }

    private Type Resolve(string key) => ManagedTypes.SingleOrDefault(t => t.Name == key) ?? throw AppException.NotFound();
    private Task<object> Invoke(string method, Type type, params object?[] args) =>
        (Task<object>)GetType().GetMethod(method, BindingFlags.Instance | BindingFlags.NonPublic)!.MakeGenericMethod(type).Invoke(this, args)!;

    public Task<object> RecordsAsync(string key, Guid? businessId, Guid? userId, bool? active, bool deleted, string? search, int page, int size, CancellationToken ct)
        => Invoke(nameof(RecordsCore), Resolve(key), businessId, userId, active, deleted, search, Math.Clamp(page, 1, 1000000), Math.Clamp(size, 1, 100), ct);

    private async Task<object> RecordsCore<T>(Guid? businessId, Guid? userId, bool? active, bool deleted, string? search, int page, int size, CancellationToken ct) where T : class
    {
        var q = db.Set<T>().IgnoreQueryFilters().AsNoTracking();
        if (businessId.HasValue && typeof(TenantEntity).IsAssignableFrom(typeof(T))) q = q.Where(x => EF.Property<Guid>(x, "BusinessId") == businessId);
        if (userId.HasValue && typeof(T).GetProperty("UserId")?.PropertyType == typeof(Guid)) q = q.Where(x => EF.Property<Guid>(x, "UserId") == userId);
        if (active.HasValue && typeof(T).GetProperty("IsActive") != null) q = q.Where(x => EF.Property<bool>(x, "IsActive") == active);
        if (typeof(SoftDeletableEntity).IsAssignableFrom(typeof(T))) q = q.Where(x => EF.Property<bool>(x, "IsDeleted") == deleted);
        else if (deleted) throw new AppException("INVALID_FILTER", "Esta entidad no admite borrado lógico.");
        if (!string.IsNullOrWhiteSpace(search))
        {
            search = search.Trim();
            if (Guid.TryParse(search, out var id)) q = q.Where(x => EF.Property<Guid>(x, "Id") == id);
            else
            {
                var names = new[] { "Name", "FirstName", "LastName", "Email", "Sku", "Code" }.Where(n => typeof(T).GetProperty(n)?.PropertyType == typeof(string));
                var p = Expression.Parameter(typeof(T), "x");
                Expression filter = Expression.Constant(false);
                foreach (var name in names)
                {
                    var value = Expression.Property(p, name);
                    filter = Expression.OrElse(filter, Expression.AndAlso(Expression.NotEqual(value, Expression.Constant(null, typeof(string))),
                        Expression.Call(value, nameof(string.Contains), null, Expression.Constant(search))));
                }
                q = q.Where(Expression.Lambda<Func<T, bool>>(filter, p));
            }
        }
        var total = await q.CountAsync(ct);
        var items = await q.OrderByDescending(x => EF.Property<DateTime>(x, "CreatedAt")).ThenBy(x => EF.Property<Guid>(x, "Id"))
            .Skip((page - 1) * size).Take(size).ToListAsync(ct);
        var records = items.Select(ToRecord).ToArray();
        var businessIds = records.Where(x => x.BusinessId.HasValue).Select(x => x.BusinessId!.Value).Distinct().ToArray();
        var userIds = records.Where(x => x.UserId.HasValue).Select(x => x.UserId!.Value).Distinct().ToArray();
        var roleIds = records.Where(x => x.RoleId.HasValue).Select(x => x.RoleId!.Value).Distinct().ToArray();
        var businesses = await db.Businesses.Where(x => businessIds.Contains(x.Id)).ToDictionaryAsync(x => x.Id, x => x.Name, ct);
        var users = await db.Users.Where(x => userIds.Contains(x.Id)).ToDictionaryAsync(x => x.Id, x => x.FirstName + " " + x.LastName, ct);
        var roles = await db.Roles.IgnoreQueryFilters().Where(x => roleIds.Contains(x.Id)).ToDictionaryAsync(x => x.Id, x => x.Name, ct);
        return new PagedResult<AdminRecord>(records.Select(x => x with { BusinessName = businesses.GetValueOrDefault(x.BusinessId ?? Guid.Empty),
            UserName = users.GetValueOrDefault(x.UserId ?? Guid.Empty), RoleName = roles.GetValueOrDefault(x.RoleId ?? Guid.Empty) }).ToArray(), page, size, total);
    }

    private static AdminRecord ToRecord<T>(T entity) where T : class
    {
        object? Get(string name) => typeof(T).GetProperty(name)?.GetValue(entity);
        var id = (Guid)Get("Id")!;
        var name = Get("Name")?.ToString() ?? string.Join(" ", new[] { Get("FirstName"), Get("LastName") }.Where(x => x != null));
        return new(id, string.IsNullOrWhiteSpace(name) ? id.ToString() : name, (Guid?)Get("BusinessId"), (bool?)Get("IsActive"),
            (bool?)Get("IsDeleted") ?? false, (DateTime?)Get("CreatedAt"), (DateTime?)Get("UpdatedAt"), (DateTime?)Get("DeletedAt"),
            (Guid?)Get("DeletedBy"), (string?)Get("Email"), (Guid?)Get("UserId"), (Guid?)Get("RoleId"), (DateTime?)Get("LastActivityAt"),
            new[] { "LegalName", "TaxId", "Phone", "Address", "Country", "Currency", "TimeZone", "IsOwner", "IsSystemRole", "Code", "Sku" }
                .Where(n => typeof(T).GetProperty(n) != null).ToDictionary(n => n, n => Get(n)?.ToString()));
    }

    public Task<object> ChangeAsync(string key, Guid id, string action, AdminChange request, Guid actor, CancellationToken ct)
    {
        Validate(request, id.ToString());
        if (action is not ("activation" or "restore" or "purge")) throw AppException.NotFound();
        return Invoke(nameof(ChangeCore), Resolve(key), id, action, request, actor, ct);
    }

    public static void Validate(AdminChange request, string confirmation)
    {
        if (string.IsNullOrWhiteSpace(request.Reason) || request.Reason.Trim().Length < 5 || request.Reason.Length > 500)
            throw new AppException("REASON_REQUIRED", "Escribe un motivo de entre 5 y 500 caracteres.");
        if (!string.Equals(request.Confirmation, confirmation, StringComparison.OrdinalIgnoreCase))
            throw new AppException("CONFIRMATION_REQUIRED", "La confirmación no coincide con la operación.");
    }

    private async Task<object> ChangeCore<T>(Guid id, string action, AdminChange request, Guid actor, CancellationToken ct) where T : class
    {
        await using var tx = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);
        var entity = await db.Set<T>().IgnoreQueryFilters().SingleOrDefaultAsync(x => EF.Property<Guid>(x, "Id") == id, ct) ?? throw AppException.NotFound();
        var before = ToRecord(entity);
        var now = DateTime.UtcNow;
        if (action == "activation")
        {
            var property = typeof(T).GetProperty("IsActive") ?? throw AppException.NotFound();
            if (!request.Active.HasValue) throw new AppException("ACTIVE_REQUIRED", "Indica el estado de activación.");
            if (before.IsDeleted) throw AppException.Conflict("Restaura el registro antes de cambiar su activación.");
            if (typeof(T) == typeof(ApplicationUser) && id == actor && !request.Active.Value) throw AppException.Conflict("No puedes desactivar tu propia cuenta administrativa.");
            if (before.IsActive == request.Active.Value) throw AppException.Conflict("El registro ya tiene ese estado. Actualiza la lista.");
            property.SetValue(entity, request.Active.Value);
        }
        else
        {
            if (entity is not SoftDeletableEntity soft || !soft.IsDeleted) throw AppException.Conflict("Solo se pueden restaurar o purgar registros de la papelera.");
            if (action == "restore")
            {
                // Restore parents first; foreign keys alone cannot detect soft-deleted parents.
                foreach (var fk in db.Model.FindEntityType(typeof(T))!.GetForeignKeys()
                    .Where(f => typeof(SoftDeletableEntity).IsAssignableFrom(f.PrincipalEntityType.ClrType)))
                {
                    var values = fk.Properties.Select(p => db.Entry(entity).Property(p.Name).CurrentValue).ToArray();
                    if (values.Any(x => x == null)) continue;
                    var deletedParent = (bool)await Invoke(nameof(ParentDeleted), fk.PrincipalEntityType.ClrType,
                        fk.PrincipalKey.Properties.Select(p => p.Name).ToArray(), values, ct);
                    if (deletedParent) throw AppException.Conflict("Restaura primero el registro principal relacionado.");
                }
                soft.IsDeleted = false; soft.DeletedAt = null; soft.DeletedBy = null;
            }
            else
            {
                // All existing references use RESTRICT. Never cascade into financial history.
                try { await db.Set<T>().IgnoreQueryFilters().Where(x => EF.Property<Guid>(x, "Id") == id && EF.Property<bool>(x, "IsDeleted")).ExecuteDeleteAsync(ct); }
                catch (DbException) { throw AppException.Conflict("No se puede borrar definitivamente: existen registros relacionados. Conserva el registro o restaúralo."); }
                db.Entry(entity).State = EntityState.Detached;
            }
        }
        if (action != "purge") typeof(T).GetProperty("UpdatedAt")?.SetValue(entity, now);
        db.PlatformAuditLogs.Add(new PlatformAuditLog { UserId = actor, BusinessId = before.BusinessId,
            EntityName = typeof(T).Name, EntityId = id.ToString(), Action = action, Reason = request.Reason.Trim(), CreatedAt = now,
            PreviousValue = action == "activation" ? before.IsActive.ToString() : "IsDeleted=True",
            NewValue = action == "activation" ? request.Active.ToString() : action == "restore" ? "IsDeleted=False" : "Purged" });
        await db.SavePlatformChangesAsync(ct);
        await tx.CommitAsync(ct);
        return new { message = "Operación completada y registrada en auditoría." };
    }

    private async Task<object> ParentDeleted<T>(string[] names, object[] values, CancellationToken ct) where T : class
    {
        var p = Expression.Parameter(typeof(T), "x");
        Expression filter = Expression.Constant(true);
        for (var i = 0; i < names.Length; i++)
        {
            var property = Expression.Property(p, names[i]);
            filter = Expression.AndAlso(filter, Expression.Equal(property, Expression.Convert(Expression.Constant(values[i]), property.Type)));
        }
        return await db.Set<T>().IgnoreQueryFilters().Where(Expression.Lambda<Func<T, bool>>(filter, p)).AnyAsync(x => EF.Property<bool>(x, "IsDeleted"), ct);
    }

    public async Task<object> AuditAsync(Guid? userId, Guid? businessId, string? action, DateTime? from, DateTime? to, int page, int size, CancellationToken ct)
    {
        var regular = db.AuditLogs.IgnoreQueryFilters().Select(x => new { x.Id, x.UserId, BusinessId = (Guid?)x.BusinessId, x.EntityName, x.EntityId, x.Action, x.CreatedAt, Source = "Negocio", Reason = (string?)null, PreviousValue = (string?)null, NewValue = (string?)null });
        var platform = db.PlatformAuditLogs.Select(x => new { x.Id, UserId = (Guid?)x.UserId, x.BusinessId, x.EntityName, x.EntityId, x.Action, x.CreatedAt, Source = x.BusinessId != null && x.Action == "login" ? "Negocio" : "Backoffice", Reason = (string?)x.Reason, x.PreviousValue, x.NewValue });
        var q = regular.Concat(platform);
        if (userId.HasValue) q = q.Where(x => x.UserId == userId);
        if (businessId.HasValue) q = q.Where(x => x.BusinessId == businessId);
        if (!string.IsNullOrWhiteSpace(action)) q = q.Where(x => x.Action == action);
        if (from.HasValue) q = q.Where(x => x.CreatedAt >= from);
        if (to.HasValue) q = q.Where(x => x.CreatedAt <= to);
        if (from.HasValue && to.HasValue && from > to) throw new AppException("INVALID_DATES", "La fecha inicial debe ser anterior a la fecha final.");
        var result = await q.OrderByDescending(x => x.CreatedAt).ThenBy(x => x.Id)
            .Select(x => new AdminAudit(x.Id, x.UserId, x.BusinessId, x.EntityName, x.EntityId, x.Action, x.CreatedAt, x.Source, x.Reason, x.PreviousValue, x.NewValue))
            .PageAsync(new PagedRequest(Math.Clamp(page, 1, 1000000), size), ct);
        var userIds = result.Items.Where(x => x.UserId.HasValue).Select(x => x.UserId!.Value).Distinct().ToArray();
        var businessIds = result.Items.Where(x => x.BusinessId.HasValue).Select(x => x.BusinessId!.Value).Distinct().ToArray();
        var users = await db.Users.Where(x => userIds.Contains(x.Id)).ToDictionaryAsync(x => x.Id, x => x.FirstName + " " + x.LastName, ct);
        var businesses = await db.Businesses.Where(x => businessIds.Contains(x.Id)).ToDictionaryAsync(x => x.Id, x => x.Name, ct);
        return result with { Items = result.Items.Select(x => x with { UserName = users.GetValueOrDefault(x.UserId ?? Guid.Empty), BusinessName = businesses.GetValueOrDefault(x.BusinessId ?? Guid.Empty) }).ToArray() };
    }

    public async Task<object> DatabaseAsync(int retentionDays, CancellationToken ct)
    {
        var tables = new List<object>();
        foreach (var type in db.Model.GetEntityTypes().OrderBy(x => x.GetTableName()))
            tables.Add(await Invoke(nameof(CountCore), type.ClrType, ct));
        var cutoff = DateTime.UtcNow.AddDays(-retentionDays);
        return new { provider = db.Database.ProviderName, checkedAt = DateTime.UtcNow, tables,
            pendingMigrations = (await db.Database.GetPendingMigrationsAsync(ct)).ToArray(), retentionDays,
            cleanupCandidates = await db.RefreshTokens.CountAsync(x => x.ExpiresAt < cutoff, ct) };
    }

    private async Task<object> CountCore<T>(CancellationToken ct) where T : class
    {
        var q = db.Set<T>().IgnoreQueryFilters();
        return new { name = db.Model.FindEntityType(typeof(T))!.GetTableName(), records = await q.LongCountAsync(ct),
            deleted = typeof(SoftDeletableEntity).IsAssignableFrom(typeof(T)) ? await q.LongCountAsync(x => EF.Property<bool>(x, "IsDeleted"), ct) : 0 };
    }

    public async Task<object> CleanupAsync(int retentionDays, AdminChange request, Guid actor, CancellationToken ct)
    {
        Validate(request, "LIMPIAR SESIONES");
        await using var tx = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);
        var cutoff = DateTime.UtcNow.AddDays(-retentionDays);
        var ids = await db.RefreshTokens.Where(x => x.ExpiresAt < cutoff).OrderBy(x => x.ExpiresAt).Select(x => x.Id).Take(1000).ToArrayAsync(ct);
        var count = await db.RefreshTokens.Where(x => ids.Contains(x.Id) && x.ExpiresAt < cutoff).ExecuteDeleteAsync(ct);
        db.PlatformAuditLogs.Add(new PlatformAuditLog { UserId = actor, EntityName = "RefreshToken", Action = "cleanup", Reason = request.Reason.Trim(), NewValue = count.ToString(), CreatedAt = DateTime.UtcNow });
        await db.SavePlatformChangesAsync(ct);
        await tx.CommitAsync(ct);
        return new { message = $"Se eliminaron {count} sesiones vencidas.", count };
    }
}
