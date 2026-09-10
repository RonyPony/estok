using eStok.Application.Abstractions;
using eStok.Application.Common;
using eStok.Domain.Entities;
using eStok.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
namespace eStok.Infrastructure.Identity;
public sealed class UserService(AppDbContext db, UserManager<ApplicationUser> users, ICurrentBusiness business, ICurrentUser current, IDateTimeProvider clock) : IUserService
{
    public async Task<object> ListAsync(CancellationToken ct) => await (from m in db.BusinessUsers join u in db.Users on m.UserId equals u.Id join r in db.Roles on m.RoleId equals r.Id where m.BusinessId == business.BusinessId select new { m.Id, u.FirstName, u.LastName, u.Email, m.RoleId, RoleName = r.Name, m.IsActive, m.IsOwner }).ToListAsync(ct);
    private async Task<Role> CheckRoleAsync(Guid roleId, CancellationToken ct)
    {
        var role = await db.Roles.SingleOrDefaultAsync(x => x.Id == roleId && x.BusinessId == business.BusinessId && x.IsActive, ct) ?? throw AppException.NotFound();
        if (role.Name == "Owner") throw AppException.Conflict("La propiedad de la empresa no se asigna por este formulario.");
        return role;
    }
    public Task<object> CreateAsync(CreateUserRequest request, CancellationToken ct) => db.InTransactionAsync<object>(async () =>
    {
        await CheckRoleAsync(request.RoleId, ct);
        if (string.IsNullOrWhiteSpace(request.FirstName) || string.IsNullOrWhiteSpace(request.LastName)) throw new AppException("INVALID_USER", "Indica nombre y apellido.");
        if (await users.FindByEmailAsync(request.Email) is not null) throw AppException.Conflict("El correo ya está registrado. La incorporación de cuentas existentes requiere un flujo de invitación.");
        var user = new ApplicationUser { UserName = request.Email, Email = request.Email, FirstName = request.FirstName, LastName = request.LastName, CreatedAt = clock.UtcNow };
        var result = await users.CreateAsync(user, request.Password);
        if (!result.Succeeded) throw new AppException("INVALID_USER", string.Join(" ", result.Errors.Select(x => x.Description)));
        var membership = new BusinessUser { BusinessId = business.BusinessId, UserId = user.Id, RoleId = request.RoleId }; db.BusinessUsers.Add(membership);
        return new { membership.Id, user.Email };
    }, ct);
    public async Task UpdateAsync(Guid id, UpdateUserRequest request, CancellationToken ct)
    {
        await CheckRoleAsync(request.RoleId, ct);
        var member = await db.BusinessUsers.SingleOrDefaultAsync(x => x.Id == id && x.BusinessId == business.BusinessId, ct) ?? throw AppException.NotFound();
        if (member.IsOwner || member.UserId == current.UserId) throw AppException.Conflict("No puedes modificar al propietario ni tu propio acceso.");
        member.RoleId = request.RoleId; member.IsActive = request.IsActive; await db.SaveChangesAsync(ct);
    }
}
