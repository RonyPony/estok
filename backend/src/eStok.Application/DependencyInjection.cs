using eStok.Application.Features.Customers;
using eStok.Application.Features.Products;
using eStok.Application.Features.Inventory;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
namespace eStok.Application;
public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);
        services.AddScoped<CustomerService>(); services.AddScoped<ProductService>(); services.AddScoped<IInventoryService, InventoryService>();
        services.AddScoped<Features.Sales.SalesService>(); services.AddScoped<Features.Sales.IDocumentSequenceService, Features.Sales.DocumentSequenceService>(); services.AddScoped<Features.Payments.PaymentService>(); services.AddScoped<Features.Quotes.QuoteService>(); services.AddScoped<Features.Settings.SettingsService>(); services.AddScoped<Features.Dashboard.DashboardService>(); services.AddScoped<CatalogQueryService>(); return services;
    }
}


