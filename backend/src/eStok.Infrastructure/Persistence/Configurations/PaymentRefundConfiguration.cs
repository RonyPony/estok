using eStok.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace eStok.Infrastructure.Persistence.Configurations;

public sealed class PaymentRefundConfiguration : IEntityTypeConfiguration<PaymentRefund>
{
    public void Configure(EntityTypeBuilder<PaymentRefund> b)
    {
        b.HasKey(x => x.Id);
        // A payment can be refunded once, in full. The unique index also protects retries.
        b.HasIndex(x => new { x.BusinessId, x.PaymentId }).IsUnique();
        b.HasOne<Payment>().WithMany().HasForeignKey(x => new { x.BusinessId, x.PaymentId })
            .HasPrincipalKey(x => new { x.BusinessId, x.Id }).OnDelete(DeleteBehavior.Restrict);
        b.HasOne<Sale>().WithMany().HasForeignKey(x => new { x.BusinessId, x.SaleId })
            .HasPrincipalKey(x => new { x.BusinessId, x.Id }).OnDelete(DeleteBehavior.Restrict);
        b.Property(x => x.Reference).HasMaxLength(200).IsRequired();
        b.Property(x => x.Reason).HasMaxLength(500).IsRequired();
    }
}
