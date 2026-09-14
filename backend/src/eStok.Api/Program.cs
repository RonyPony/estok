using eStok.Api.Extensions;
using eStok.Application;
using eStok.Infrastructure;
using eStok.Infrastructure.Authentication;
using eStok.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddApplicationServices().AddInfrastructureServices(builder.Configuration).AddApiServices(builder.Configuration);
var app = builder.Build();
if (args.Contains("--migrate")) { using var scope = app.Services.CreateScope(); await Microsoft.EntityFrameworkCore.RelationalDatabaseFacadeExtensions.MigrateAsync(scope.ServiceProvider.GetRequiredService<eStok.Infrastructure.Persistence.AppDbContext>().Database); return; }
if (args.Contains("--create-backoffice-admin")) { await eStok.Api.Configuration.BackofficeBootstrap.CreateAsync(app.Services, builder.Configuration); return; }
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await PermissionSeeder.SeedAdministratorRolesAsync(db, CancellationToken.None);
    await PermissionSeeder.SeedBusinessDefaultsAsync(db, CancellationToken.None);
}
app.UseApiMiddlewares();
app.Run();
public partial class Program;

