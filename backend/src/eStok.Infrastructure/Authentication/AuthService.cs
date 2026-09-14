using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using eStok.Application.Abstractions;
using eStok.Application.Common;
using eStok.Domain.Entities;
using eStok.Infrastructure.Identity;
using eStok.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
namespace eStok.Infrastructure.Authentication;

public sealed class JwtOptions
{
    public string Key { get; set; } = "";
    public string Issuer { get; set; } = "estok-api";
    public string Audience { get; set; } = "estok-web";
    public int AccessMinutes { get; set; } = 20;
}

public sealed class AuthService(AppDbContext db, UserManager<ApplicationUser> users, IBusinessInitializer initializer,
    IDateTimeProvider clock, IOptions<JwtOptions> options, ICurrentUser currentUser, ICurrentBusiness currentBusiness) : IAuthService
{
    private static AppException Unauthorized() => new("INVALID_CREDENTIALS", "Credenciales o sesión inválidas.", 401);
    private static AppException InactiveAccount() => new("ACCOUNT_INACTIVE", "Tu cuenta o negocio aún no están activos. Revisaremos tu información y nos pondremos en contacto contigo para activar tu cuenta. Podrás iniciar sesión cuando se complete la activación.", 403);
    private static string Hash(string token) => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));

    public async Task<RegistrationResponse> RegisterAsync(RegisterRequest request, CancellationToken ct)
    {
        db.IsInitializing = true;
        try
        {
            return await db.InTransactionAsync(async () =>
            {
                var user = new ApplicationUser { UserName = request.Email.Trim(), Email = request.Email.Trim(), FirstName = request.FirstName.Trim(), LastName = request.LastName.Trim(), CreatedAt = clock.UtcNow, IsActive = false };
                var result = await users.CreateAsync(user, request.Password);
                if (!result.Succeeded) throw new AppException("REGISTRATION_FAILED", string.Join(" ", result.Errors.Select(e => e.Description)));
                var business = new Business { Name = request.BusinessName.Trim(), Country = request.Country.ToUpperInvariant(), Currency = request.Currency.ToUpperInvariant(), IsActive = false };
                db.Businesses.Add(business);
                await db.SaveChangesAsync(ct);
                await initializer.InitializeAsync(business.Id, user.Id, business.Currency, ct);
                return new RegistrationResponse("pending_review", "Recibimos tu información y la de tu negocio. Tu cuenta está inactiva mientras revisamos los datos. Nos pondremos en contacto contigo al correo registrado para activar tu cuenta. Podrás iniciar sesión cuando se complete la activación.");
            }, ct);
        }
        finally { db.IsInitializing = false; }
    }

    public async Task<SessionResponse> LoginAsync(LoginRequest request, CancellationToken ct)
    {
        var user = await users.FindByEmailAsync(request.Email.Trim());
        if (user is null || await users.IsLockedOutAsync(user)) throw Unauthorized();
        if (!await users.CheckPasswordAsync(user, request.Password)) { await users.AccessFailedAsync(user); throw Unauthorized(); }
        await users.ResetAccessFailedCountAsync(user);
        if (!user.IsActive) throw InactiveAccount();
        var membership = await (from member in db.BusinessUsers.IgnoreQueryFilters()
                                join business in db.Businesses on member.BusinessId equals business.Id
                                where member.UserId == user.Id && member.IsActive && business.IsActive
                                orderby member.CreatedAt
                                select member).FirstOrDefaultAsync(ct) ?? throw InactiveAccount();
        var response = await IssueAsync(user, membership.BusinessId, ct);
        await db.SaveChangesAsync(ct);
        return response;
    }

    public Task<SessionResponse> RefreshAsync(string token, CancellationToken ct) => db.InTransactionAsync(async () =>
    {
        var hash = Hash(token);
        var stored = await db.RefreshTokens.SingleOrDefaultAsync(x => x.TokenHash == hash, ct);
        if (stored is null || stored.RevokedAt != null || stored.ExpiresAt <= clock.UtcNow) throw Unauthorized();
        var user = await users.FindByIdAsync(stored.UserId.ToString());
        if (user is null || !user.IsActive) throw Unauthorized();
        var response = await IssueAsync(user, stored.BusinessId, ct);
        stored.RevokedAt = clock.UtcNow; stored.ReplacedByTokenHash = Hash(response.RefreshToken);
        return response;
    }, ct);

    public async Task LogoutAsync(string token, CancellationToken ct)
    {
        var hash = Hash(token);
        var stored = await db.RefreshTokens.SingleOrDefaultAsync(x => x.TokenHash == hash, ct);
        if (stored is not null && stored.RevokedAt is null) { stored.RevokedAt = clock.UtcNow; await db.SaveChangesAsync(ct); }
    }

    public async Task<object> MeAsync(CancellationToken ct)
    {
        var user = await users.FindByIdAsync(currentUser.UserId.ToString()) ?? throw Unauthorized();
        if (!user.IsActive) throw Unauthorized();
        var (business, _, permissions) = await MembershipAsync(user.Id, currentBusiness.BusinessId, ct);
        return new { User = new SessionUser(user.Id, user.FirstName, user.LastName, user.Email!), Business = business, Permissions = permissions };
    }

    private async Task<(SessionBusiness, string, string[])> MembershipAsync(Guid userId, Guid businessId, CancellationToken ct)
    {
        var membership = await db.BusinessUsers.IgnoreQueryFilters().SingleOrDefaultAsync(x => x.UserId == userId && x.BusinessId == businessId && x.IsActive, ct) ?? throw Unauthorized();
        var role = await db.Roles.IgnoreQueryFilters().SingleOrDefaultAsync(x => x.Id == membership.RoleId && x.BusinessId == businessId && x.IsActive, ct) ?? throw Unauthorized();
        var business = await db.Businesses.SingleOrDefaultAsync(x => x.Id == businessId && x.IsActive, ct) ?? throw Unauthorized();
        var permissions = await (from rp in db.RolePermissions.IgnoreQueryFilters() join p in db.Permissions on rp.PermissionId equals p.Id where rp.RoleId == role.Id && rp.BusinessId == businessId select p.Code).ToArrayAsync(ct);
        return (new(business.Id, business.Name, business.Currency, business.Country, business.TimeZone), role.Name, permissions);
    }

    private async Task<SessionResponse> IssueAsync(ApplicationUser user, Guid businessId, CancellationToken ct)
    {
        if (!user.IsActive) throw Unauthorized();
        var (business, role, permissions) = await MembershipAsync(user.Id, businessId, ct);
        var jwt = options.Value;
        Claim[] claims = [new("sub", user.Id.ToString()), new("email", user.Email!), new("business_id", businessId.ToString()), new("business_role", role), new("jti", Guid.NewGuid().ToString())];
        var access = new JwtSecurityToken(jwt.Issuer, jwt.Audience, claims, clock.UtcNow, clock.UtcNow.AddMinutes(jwt.AccessMinutes), new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.Key)), SecurityAlgorithms.HmacSha256));
        var refresh = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
        db.RefreshTokens.Add(new RefreshToken { UserId = user.Id, BusinessId = businessId, TokenHash = Hash(refresh), CreatedAt = clock.UtcNow, ExpiresAt = clock.UtcNow.AddDays(30) });
        return new(new JwtSecurityTokenHandler().WriteToken(access), refresh, new(user.Id, user.FirstName, user.LastName, user.Email!), business, permissions);
    }
}
