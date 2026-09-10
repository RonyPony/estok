using Microsoft.EntityFrameworkCore;
namespace eStok.Application.Common;

public sealed class AppException(string code, string message, int status = 400) : Exception(message)
{
    public string Code { get; } = code;
    public int Status { get; } = status;
    public static AppException NotFound() => new("NOT_FOUND", "No se encontró el recurso.", 404);
    public static AppException Conflict(string message) => new("CONFLICT", message, 409);
}

public sealed record PagedRequest(int PageNumber = 1, int PageSize = 20, string? Search = null, string? SortBy = null, string SortDirection = "asc");
public sealed record PagedResult<T>(IReadOnlyList<T> Items, int PageNumber, int PageSize, int TotalItems)
{
    public int TotalPages => (int)Math.Ceiling((decimal)TotalItems / PageSize);
}
public static class Pagination
{
    public static async Task<PagedResult<T>> PageAsync<T>(this IQueryable<T> query, PagedRequest request, CancellationToken ct)
    {
        var page = Math.Max(1, request.PageNumber);
        var size = Math.Clamp(request.PageSize, 1, 100);
        return new(await query.Skip((page - 1) * size).Take(size).ToListAsync(ct), page, size, await query.CountAsync(ct));
    }
}
