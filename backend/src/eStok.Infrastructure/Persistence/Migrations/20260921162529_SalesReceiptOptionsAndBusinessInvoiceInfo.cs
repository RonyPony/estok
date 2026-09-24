using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace eStok.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class SalesReceiptOptionsAndBusinessInvoiceInfo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "InvoiceAdditionalInfo",
                table: "Settings",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IncludeCategoriesInReceipt",
                table: "Sales",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "SellerAssumesTax",
                table: "Sales",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "CategoryName",
                table: "SaleItem",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Comment",
                table: "SaleItem",
                type: "nvarchar(300)",
                maxLength: 300,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "InvoiceAdditionalInfo",
                table: "Settings");

            migrationBuilder.DropColumn(
                name: "IncludeCategoriesInReceipt",
                table: "Sales");

            migrationBuilder.DropColumn(
                name: "SellerAssumesTax",
                table: "Sales");

            migrationBuilder.DropColumn(
                name: "CategoryName",
                table: "SaleItem");

            migrationBuilder.DropColumn(
                name: "Comment",
                table: "SaleItem");
        }
    }
}
