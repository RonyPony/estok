namespace eStok.Application.Abstractions;
public sealed record CreateUserRequest(string FirstName, string LastName, string Email, string Password, Guid RoleId);
public sealed record UpdateUserRequest(Guid RoleId, bool IsActive);
public interface IUserService
{
    Task<object> ListAsync(CancellationToken ct);
    Task<object> CreateAsync(CreateUserRequest request, CancellationToken ct);
    Task UpdateAsync(Guid id, UpdateUserRequest request, CancellationToken ct);
}
