using eStok.Domain.Entities;
using eStok.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
namespace eStok.Infrastructure.Persistence.Configurations;
public sealed class SaleConfiguration : IEntityTypeConfiguration<Sale>
{
    public void Configure(EntityTypeBuilder<Sale> b)
    {
        b.HasKey(x => x.Id);
        b.HasAlternateKey(x => new { x.BusinessId, x.Id });
        b.HasOne<Business>().WithMany().HasForeignKey(x => x.BusinessId).OnDelete(DeleteBehavior.Restrict);
        b.HasIndex(x => new { x.BusinessId, x.SaleNumber }).IsUnique(); b.Property(x => x.Status).IsConcurrencyToken(); b.HasMany(x => x.Items).WithOne().HasForeignKey(x => new { x.BusinessId, x.SaleId }).HasPrincipalKey(x => new { x.BusinessId, x.Id }).OnDelete(DeleteBehavior.Restrict); b.HasOne<Customer>().WithMany().HasForeignKey(x => new { x.BusinessId, x.CustomerId }).HasPrincipalKey(x => new { x.BusinessId, x.Id }).OnDelete(DeleteBehavior.Restrict); b.HasOne<Warehouse>().WithMany().HasForeignKey(x => new { x.BusinessId, x.WarehouseId }).HasPrincipalKey(x => new { x.BusinessId, x.Id }).OnDelete(DeleteBehavior.Restrict);
    }
}
