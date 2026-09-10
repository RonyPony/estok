using eStok.Application.Abstractions;
using eStok.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
namespace eStok.Api.Configuration;
public sealed class RequirePermissionAttribute(string code) : AuthorizeAttribute(code);
public sealed record PermissionRequirement(string Code) : IAuthorizationRequirement;
public sealed class PermissionAuthorizationHandler(AppDbContext db, ICurrentBusiness business, ICurrentUser user) : AuthorizationHandler<PermissionRequirement>
{
    protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, PermissionRequirement requirement)
    {
        if (!user.IsAuthenticated || !business.HasBusiness) return;
        var allowed = await (from m in db.BusinessUsers join r in db.Roles on m.RoleId equals r.Id join rp in db.RolePermissions on r.Id equals rp.RoleId join p in db.Permissions on rp.PermissionId equals p.Id join b in db.Businesses on m.BusinessId equals b.Id join u in db.Users on m.UserId equals u.Id where m.BusinessId == business.BusinessId && m.UserId == user.UserId && m.IsActive && r.IsActive && b.IsActive && u.IsActive && p.Code == requirement.Code select m.Id).AnyAsync();
        if (allowed) context.Succeed(requirement);
    }
}
