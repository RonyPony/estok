namespace eStok.Application.Abstractions;
public sealed record RegisterRequest(string FirstName, string LastName, string Email, string Password, string BusinessName, string Country = "DO", string Currency = "DOP");
public sealed record RegistrationResponse(string Status, string Message);
public sealed record LoginRequest(string Email, string Password);
public sealed record SessionUser(Guid Id, string FirstName, string LastName, string Email);
public sealed record SessionBusiness(Guid Id, string Name, string Currency, string Country, string TimeZone);
public sealed record SessionResponse(string AccessToken, string RefreshToken, SessionUser User, SessionBusiness Business, string[] Permissions);
public interface IAuthService
{
    Task<RegistrationResponse> RegisterAsync(RegisterRequest request, CancellationToken ct);
    Task<SessionResponse> LoginAsync(LoginRequest request, CancellationToken ct);
    Task<SessionResponse> RefreshAsync(string token, CancellationToken ct);
    Task LogoutAsync(string token, CancellationToken ct);
    Task<object> MeAsync(CancellationToken ct);
}
public interface IBusinessInitializer { Task InitializeAsync(Guid businessId, Guid userId, string currency, CancellationToken ct); }
