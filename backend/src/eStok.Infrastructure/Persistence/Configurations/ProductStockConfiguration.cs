using eStok.Domain.Entities;
using eStok.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
namespace eStok.Infrastructure.Persistence.Configurations;
public sealed class ProductStockConfiguration : IEntityTypeConfiguration<ProductStock>
{
    public void Configure(EntityTypeBuilder<ProductStock> b)
    {
        b.HasKey(x => x.Id);
        b.HasAlternateKey(x => new { x.BusinessId, x.Id });
        b.HasOne<Business>().WithMany().HasForeignKey(x => x.BusinessId).OnDelete(DeleteBehavior.Restrict);
        b.HasKey(x => new { x.ProductId, x.WarehouseId }); b.Property(x => x.Quantity).IsConcurrencyToken(); b.HasOne<Product>().WithMany().HasForeignKey(x => new { x.BusinessId, x.ProductId }).HasPrincipalKey(x => new { x.BusinessId, x.Id }).OnDelete(DeleteBehavior.Restrict); b.HasOne<Warehouse>().WithMany().HasForeignKey(x => new { x.BusinessId, x.WarehouseId }).HasPrincipalKey(x => new { x.BusinessId, x.Id }).OnDelete(DeleteBehavior.Restrict);
    }
}
