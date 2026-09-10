using eStok.Application.Abstractions;
namespace eStok.Api.Configuration;
public sealed class CurrentContext(IHttpContextAccessor accessor) : ICurrentBusiness, ICurrentUser
{
    public Guid BusinessId => Guid.TryParse(accessor.HttpContext?.User.FindFirst("business_id")?.Value, out var id) ? id : Guid.Empty;
    public bool HasBusiness => IsAuthenticated && BusinessId != Guid.Empty;
    public Guid UserId => Guid.TryParse(accessor.HttpContext?.User.FindFirst("sub")?.Value, out var id) ? id : Guid.Empty;
    public string? Email => accessor.HttpContext?.User.FindFirst("email")?.Value;
    public bool IsAuthenticated => accessor.HttpContext?.User.Identity?.IsAuthenticated == true;
}
