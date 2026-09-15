using System.Text;
using eStok.Application.Abstractions;
using eStok.Infrastructure.Authentication;
using eStok.Infrastructure.Identity;
using eStok.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
namespace eStok.Infrastructure;
public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(o => o.UseSqlServer(configuration.GetConnectionString("Database")));
        services.AddScoped<IApplicationDbContext>(s => s.GetRequiredService<AppDbContext>());
        services.AddIdentityCore<ApplicationUser>(o => { o.User.RequireUniqueEmail = true; o.Password.RequiredLength = 10; o.Lockout.MaxFailedAccessAttempts = 5; }).AddEntityFrameworkStores<AppDbContext>().AddDefaultTokenProviders();
        services.AddOptions<JwtOptions>().Bind(configuration.GetSection("Jwt")).Validate(o => Encoding.UTF8.GetByteCount(o.Key) >= 32, "Configure Jwt:Key with at least 32 bytes.").ValidateOnStart();
        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer();
        services.AddOptions<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme).Configure<Microsoft.Extensions.Options.IOptions<JwtOptions>>((o, jwt) =>
        {
            o.MapInboundClaims = false;
            o.TokenValidationParameters = new TokenValidationParameters { ValidateIssuer = true, ValidateAudience = true, ValidateLifetime = true, ValidateIssuerSigningKey = true, ValidIssuer = jwt.Value.Issuer, ValidAudience = jwt.Value.Audience, IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.Value.Key)), ClockSkew = TimeSpan.FromSeconds(15) };
        });
        services.AddScoped<IDocumentService, eStok.Infrastructure.Documents.DocumentService>();
        services.AddScoped<IAuthService, AuthService>(); services.AddScoped<IBusinessInitializer, BusinessInitializer>(); services.AddSingleton<IDateTimeProvider, DateTimeProvider>();
        services.AddScoped<IUserService, UserService>(); return services;
    }
}
public sealed class DateTimeProvider : IDateTimeProvider { public DateTime UtcNow => DateTime.UtcNow; }

