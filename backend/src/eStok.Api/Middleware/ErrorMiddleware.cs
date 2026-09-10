using eStok.Application.Common;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
namespace eStok.Api.Middleware;
public sealed class ErrorMiddleware(RequestDelegate next, ILogger<ErrorMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try { await next(context); }
        catch (Exception ex)
        {
            if (context.Response.HasStarted) throw;
            var (status, code, message) = ex switch { AppException e => (e.Status, e.Code, e.Message), ValidationException => (400, "VALIDATION_FAILED", "Revisa los datos del formulario."), DbUpdateException => (409, "DATA_CONFLICT", "Los datos cambiaron o existe un registro duplicado. Actualiza e intenta de nuevo."), _ => (500, "INTERNAL_ERROR", "No se pudo completar la operación.") };
            if (status == 500) logger.LogError(ex, "Request failed {TraceId}", context.TraceIdentifier);
            context.Response.StatusCode = status;
            var errors = ex is ValidationException validation ? validation.Errors.GroupBy(x => x.PropertyName).ToDictionary(x => x.Key, x => x.Select(e => e.ErrorMessage).ToArray()) : new Dictionary<string, string[]>();
            await context.Response.WriteAsJsonAsync(new { code, message, errors });
        }
    }
}
