using eStok.Application.Authorization;
using eStok.Application.Features.Products;
using eStok.Application.Features.Sales;
using eStok.Domain.Entities;
namespace eStok.UnitTests;
public sealed class DomainTests
{
    [Theory]
    [InlineData(100, 18, false, 18)]
    [InlineData(100, 18, true, 15.25)]
    [InlineData(90, 18, true, 13.73)]
    [InlineData(0, 18, true, 0)]
    [InlineData(100, 0, true, 0)]
    [InlineData(1.01, 50, false, .51)]
    [InlineData(1.01, 50, true, .34)]
    public void TaxIsRoundedPerLineAndIncludedOnlyOnce(decimal amount, decimal rate, bool included, decimal expected)
        => Assert.Equal(expected, SalesService.CalculateTax(amount, rate, included));
    [Fact] public void DocumentSequence_IncrementsWithoutRepeating() { var sequence = new DocumentSequence { Prefix = "FAC" }; Assert.Equal("FAC-000001", sequence.Next()); Assert.Equal("FAC-000002", sequence.Next()); }
    [Fact] public void OwnerHasEveryPermission_ViewerCannotWrite() { Assert.Equal(PermissionCodes.All, PermissionCodes.ForRole("Owner")); Assert.All(PermissionCodes.ForRole("Viewer"), x => Assert.EndsWith(".view", x)); }
    [Theory] [InlineData(-1, 10)] [InlineData(1, -10)] public void ProductRejectsNegativeMoney(decimal cost, decimal price) { Assert.False(new ProductValidator().Validate(new ProductRequest("SKU", "Product", cost, price)).IsValid); }
    [Fact] public void FinancialRoundingUsesDecimal() { Assert.Equal(1.01m, SalesService.Money(1.005m)); Assert.Throws<eStok.Application.Common.AppException>(() => SalesService.ValidateLine(new LineRequest(Guid.NewGuid(), 1, 11), 10)); }
    [Fact] public void DomainDoesNotDependOnFrameworks() { Assert.DoesNotContain(typeof(Product).Assembly.GetReferencedAssemblies(), x => x.Name!.Contains("EntityFramework") || x.Name.Contains("AspNetCore") || x.Name.Contains("Application")); }
}
