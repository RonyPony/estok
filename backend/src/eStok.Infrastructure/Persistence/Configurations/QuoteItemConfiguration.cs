using eStok.Domain.Entities;
using eStok.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
namespace eStok.Infrastructure.Persistence.Configurations;
public sealed class QuoteItemConfiguration : IEntityTypeConfiguration<QuoteItem>
{
    public void Configure(EntityTypeBuilder<QuoteItem> b)
    {
        b.HasKey(x => x.Id);
        b.HasAlternateKey(x => new { x.BusinessId, x.Id });
        b.HasOne<Business>().WithMany().HasForeignKey(x => x.BusinessId).OnDelete(DeleteBehavior.Restrict);
         b.HasOne<Product>().WithMany().HasForeignKey(x => new { x.BusinessId, x.ProductId }).HasPrincipalKey(x => new { x.BusinessId, x.Id }).OnDelete(DeleteBehavior.Restrict);
    }
}
