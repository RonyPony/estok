using eStok.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
namespace eStok.Api.Middleware;

public sealed class UserActivityMiddleware(RequestDelegate next, ILogger<UserActivityMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context, AppDbContext db)
    {
        await next(context);
        if (context.Response.StatusCode >= 400 || context.User.Identity?.IsAuthenticated != true ||
            !Guid.TryParse(context.User.FindFirst("sub")?.Value, out var id)) return;
        var now = DateTime.UtcNow;
        var cutoff = now.AddMinutes(-1);
        try
        {
            await db.Users.Where(x => x.Id == id && x.IsActive && (x.LastActivityAt == null || x.LastActivityAt < cutoff))
                .ExecuteUpdateAsync(x => x.SetProperty(u => u.LastActivityAt, now), context.RequestAborted);
        }
        catch (Exception ex) { logger.LogWarning(ex, "Could not record activity for {UserId}", id); }
    }
}
