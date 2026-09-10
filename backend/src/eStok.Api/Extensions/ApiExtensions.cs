using eStok.Api.Configuration;
using eStok.Api.Middleware;
using eStok.Application.Abstractions;
using eStok.Application.Authorization;
using Microsoft.AspNetCore.Authorization;
using System.Threading.RateLimiting;
namespace eStok.Api.Extensions;
public static class ApiExtensions
{
    public static IServiceCollection AddApiServices(this IServiceCollection services, IConfiguration config)
    {
        services.AddControllers().AddJsonOptions(o => { o.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter()); o.JsonSerializerOptions.Converters.Add(new UtcDateTimeConverter()); });
        services.AddEndpointsApiExplorer(); services.AddSwaggerGen(); services.AddHttpContextAccessor();
        services.AddScoped<CurrentContext>(); services.AddScoped<ICurrentUser>(s => s.GetRequiredService<CurrentContext>()); services.AddScoped<ICurrentBusiness>(s => s.GetRequiredService<CurrentContext>());
        services.AddScoped<IAuthorizationHandler, PermissionAuthorizationHandler>();
        services.AddAuthorization(o => { foreach (var code in PermissionCodes.All) o.AddPolicy(code, p => p.RequireAuthenticatedUser().AddRequirements(new PermissionRequirement(code))); });
        services.AddCors(o => o.AddDefaultPolicy(p => p.WithOrigins(config.GetSection("AllowedOrigins").Get<string[]>() ?? ["http://localhost:4200"]).AllowAnyHeader().AllowAnyMethod().AllowCredentials()));
        services.AddRateLimiter(o => { o.RejectionStatusCode = 429; o.AddPolicy("auth", context => RateLimitPartition.GetFixedWindowLimiter(context.Connection.RemoteIpAddress?.ToString() ?? "unknown", _ => new FixedWindowRateLimiterOptions { PermitLimit = 20, Window = TimeSpan.FromMinutes(1) })); });
        return services;
    }
    public static WebApplication UseApiMiddlewares(this WebApplication app)
    {
        app.UseMiddleware<ErrorMiddleware>(); app.UseCors(); app.UseRateLimiter(); app.UseAuthentication(); app.UseAuthorization();
        if (app.Environment.IsDevelopment()) { app.UseSwagger(); app.UseSwaggerUI(); }
        app.MapControllers(); return app;
    }
}

