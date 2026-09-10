using eStok.Application.Abstractions;
using eStok.Application.Common;
using eStok.Domain.Entities;
using eStok.Infrastructure.Persistence;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
namespace eStok.IntegrationTests;
public sealed class TenantWriteTests
{
    private sealed class Context(Guid businessId) : ICurrentBusiness, ICurrentUser, IDateTimeProvider
    {
        public Guid BusinessId => businessId;
        public bool HasBusiness => businessId != Guid.Empty;
        public Guid UserId => Guid.NewGuid();
        public string Email => "test@example.com";
        public bool IsAuthenticated => true;
        public DateTime UtcNow => new(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);
    }
    [Fact]
    public async Task DetachedEntityCannotOverwriteAnotherTenant()
    {
        await using var connection = new SqliteConnection("Data Source=:memory:"); await connection.OpenAsync();
        var options = new DbContextOptionsBuilder<AppDbContext>().UseSqlite(connection).Options;
        var a = new Context(Guid.NewGuid()); var b = new Context(Guid.NewGuid());
        Guid productId;
        await using (var setup = new AppDbContext(options, b, b, b))
        {
            await setup.Database.EnsureCreatedAsync();
            setup.Businesses.AddRange(new Business { Id = a.BusinessId, Name = "A" }, new Business { Id = b.BusinessId, Name = "B" });
            var product = new Product { BusinessId = b.BusinessId, Name = "Original", Sku = "ONE" }; productId = product.Id;
            setup.Products.Add(product); await setup.SaveChangesAsync();
        }
        await using (var attack = new AppDbContext(options, a, a, a))
        {
            attack.Products.Update(new Product { Id = productId, BusinessId = a.BusinessId, Name = "Overwritten", Sku = "ONE" });
            var error = await Assert.ThrowsAsync<AppException>(() => attack.SaveChangesAsync()); Assert.Equal(403, error.Status);
        }
        await using var verify = new AppDbContext(options, b, b, b);
        Assert.Equal("Original", (await verify.Products.SingleAsync()).Name);
    }
    [Fact]
    public async Task ForeignKeyCannotAssociateCategoryFromAnotherTenant()
    {
        await using var connection = new SqliteConnection("Data Source=:memory:"); await connection.OpenAsync();
        var options = new DbContextOptionsBuilder<AppDbContext>().UseSqlite(connection).Options;
        var a = new Context(Guid.NewGuid()); var b = new Context(Guid.NewGuid()); Guid categoryId;
        await using (var setup = new AppDbContext(options, b, b, b))
        {
            await setup.Database.EnsureCreatedAsync(); setup.Businesses.AddRange(new Business { Id = a.BusinessId, Name = "A" }, new Business { Id = b.BusinessId, Name = "B" });
            var category = new ProductCategory { BusinessId = b.BusinessId, Name = "B category" }; categoryId = category.Id; setup.Categories.Add(category); await setup.SaveChangesAsync();
        }
        await using var attack = new AppDbContext(options, a, a, a);
        attack.Products.Add(new Product { BusinessId = a.BusinessId, CategoryId = categoryId, Sku = "BAD", Name = "Bad association" });
        await Assert.ThrowsAsync<DbUpdateException>(() => attack.SaveChangesAsync());
    }
}
