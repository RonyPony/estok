using eStok.Application.Abstractions;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
namespace eStok.Api.Controllers;

[ApiController, Route("api/auth"), EnableRateLimiting("auth")]
public sealed class AuthController(IAuthService auth, IValidator<RegisterRequest> validator, IConfiguration config) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request, CancellationToken ct) { await validator.ValidateAndThrowAsync(request, ct); return Ok(await auth.RegisterAsync(request, ct)); }
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request, CancellationToken ct)
    {
        ValidateOrigin();
        return Session(await auth.LoginAsync(request, ct));
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh(CancellationToken ct) { ValidateOrigin(); return Session(await auth.RefreshAsync(Request.Cookies["refresh_token"] ?? "", ct)); }
    [HttpPost("logout")]
    public async Task<IActionResult> Logout(CancellationToken ct) { ValidateOrigin(); await auth.LogoutAsync(Request.Cookies["refresh_token"] ?? "", ct); Response.Cookies.Delete("refresh_token", CookieOptions()); return NoContent(); }
    [Authorize, HttpGet("me")]
    public async Task<IActionResult> Me(CancellationToken ct)
    {
        return Ok(await auth.MeAsync(ct));
    }

    private CookieOptions CookieOptions()
    {
        var secure = !HttpContext.RequestServices.GetRequiredService<IWebHostEnvironment>().IsDevelopment();
        return new() { HttpOnly = true, Secure = secure || Request.IsHttps, SameSite = secure ? SameSiteMode.None : SameSiteMode.Lax, Path = "/api/auth", Expires = DateTimeOffset.UtcNow.AddDays(30), MaxAge = TimeSpan.FromDays(30) };
    }

    private IActionResult Session(SessionResponse session) { Response.Headers.CacheControl = "no-store"; Response.Cookies.Append("refresh_token", session.RefreshToken, CookieOptions()); return Ok(new { session.AccessToken, session.User, session.Business, session.Permissions }); }
    private void ValidateOrigin() { var origin = Request.Headers.Origin.ToString(); if (origin.Length > 0 && !(config.GetSection("AllowedOrigins").Get<string[]>() ?? ["http://localhost:4200"]).Contains(origin)) throw new eStok.Application.Common.AppException("INVALID_ORIGIN", "Origen no permitido.", 403); }
}
