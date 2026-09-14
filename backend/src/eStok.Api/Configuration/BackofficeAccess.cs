using eStok.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace eStok.Api.Configuration;

public sealed class BackofficeOptions
{
    public bool Enabled { get; set; }
    public Guid[] AdministratorUserIds { get; set; } = [];
    public int SessionMinutes { get; set; } = 15;
    public int ActivityWindowMinutes { get; set; } = 15;
    public int SessionRetentionDays { get; set; } = 30;
    public bool AllowPermanentDeletion { get; set; }
    public bool AllowSessionCleanup { get; set; }
}

public sealed record BackofficeRequirement : IAuthorizationRequirement;
public sealed class BackofficeAuthorizationHandler(AppDbContext db, IOptionsSnapshot<BackofficeOptions> options)
    : AuthorizationHandler<BackofficeRequirement>
{
    protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, BackofficeRequirement requirement)
    {
        var settings = options.Value;
        if (!settings.Enabled || context.User.FindFirst("scope")?.Value != "backoffice" ||
            !Guid.TryParse(context.User.FindFirst("sub")?.Value, out var id) || !settings.AdministratorUserIds.Contains(id)) return;
        var stamp = context.User.FindFirst("security_stamp")?.Value;
        var user = await db.Users.AsNoTracking().SingleOrDefaultAsync(x => x.Id == id && x.IsActive && x.SecurityStamp == stamp);
        if (user != null && (!user.LockoutEnabled || user.LockoutEnd == null || user.LockoutEnd <= DateTimeOffset.UtcNow)) context.Succeed(requirement);
    }
}
