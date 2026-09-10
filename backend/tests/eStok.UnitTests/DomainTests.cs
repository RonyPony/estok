using eStok.Application.Authorization;
using eStok.Application.Features.Products;
using eStok.Application.Features.Sales;
using eStok.Domain.Entities;
namespace eStok.UnitTests;
public sealed class DomainTests
{
    [Fact] public void DocumentSequence_IncrementsWithoutRepeating() { var sequence = new DocumentSequence { Prefix = "FAC" }; Assert.Equal("FAC-000001", sequence.Next()); Assert.Equal("FAC-000002", sequence.Next()); }
    [Fact] public void OwnerHasEveryPermission_ViewerCannotWrite() { Assert.Equal(PermissionCodes.All, PermissionCodes.ForRole("Owner")); Assert.All(PermissionCodes.ForRole("Viewer"), x => Assert.EndsWith(".view", x)); }
    [Theory] [InlineData(-1, 10)] [InlineData(1, -10)] public void ProductRejectsNegativeMoney(decimal cost, decimal price) { Assert.False(new ProductValidator().Validate(new ProductRequest("SKU", "Product", cost, price)).IsValid); }
    [Fact] public void FinancialRoundingUsesDecimal() { Assert.Equal(1.01m, SalesService.Money(1.005m)); Assert.Throws<eStok.Application.Common.AppException>(() => SalesService.ValidateLine(new LineRequest(Guid.NewGuid(), 1, 11), 10)); }
    [Fact] public void DomainDoesNotDependOnFrameworks() { Assert.DoesNotContain(typeof(Product).Assembly.GetReferencedAssemblies(), x => x.Name!.Contains("EntityFramework") || x.Name.Contains("AspNetCore") || x.Name.Contains("Application")); }
}
