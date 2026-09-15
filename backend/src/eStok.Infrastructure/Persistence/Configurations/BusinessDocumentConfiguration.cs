using eStok.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
namespace eStok.Infrastructure.Persistence.Configurations;

public sealed class BusinessDocumentConfiguration : IEntityTypeConfiguration<BusinessDocument>
{
    public void Configure(EntityTypeBuilder<BusinessDocument> b)
    {
        b.HasKey(x => x.Id);
        b.HasIndex(x => new { x.BusinessId, x.DocumentType, x.SourceId }).IsUnique();
        b.HasOne<Business>().WithMany().HasForeignKey(x => x.BusinessId).OnDelete(DeleteBehavior.Restrict);
        b.Property(x => x.FileName).HasMaxLength(100);
    }
}
