using eStok.Domain.Entities;
using eStok.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
namespace eStok.Infrastructure.Persistence.Configurations;
public sealed class BusinessSettingsConfiguration : IEntityTypeConfiguration<BusinessSettings>
{
    public void Configure(EntityTypeBuilder<BusinessSettings> b)
    {
        b.HasKey(x => x.Id);
        b.HasAlternateKey(x => new { x.BusinessId, x.Id });
        b.HasOne<Business>().WithMany().HasForeignKey(x => x.BusinessId).OnDelete(DeleteBehavior.Restrict);
        b.HasIndex(x => x.BusinessId).IsUnique();
        b.Property(x => x.InvoiceAdditionalInfo).HasMaxLength(1000);
        b.Property(x => x.InvoiceLogoScale).HasDefaultValue(1m);
        b.Property(x => x.AllowDuplicateSaleItems).HasDefaultValue(false);
    }
}
