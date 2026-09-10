using eStok.Api.Extensions;
using eStok.Application;
using eStok.Infrastructure;
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddApplicationServices().AddInfrastructureServices(builder.Configuration).AddApiServices(builder.Configuration);
var app = builder.Build();
if (args.Contains("--migrate")) { using var scope = app.Services.CreateScope(); await Microsoft.EntityFrameworkCore.RelationalDatabaseFacadeExtensions.MigrateAsync(scope.ServiceProvider.GetRequiredService<eStok.Infrastructure.Persistence.AppDbContext>().Database); return; }
app.UseApiMiddlewares();
app.Run();
public partial class Program;

