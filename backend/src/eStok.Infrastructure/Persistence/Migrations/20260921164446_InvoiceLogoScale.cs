using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace eStok.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InvoiceLogoScale : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "InvoiceLogoScale",
                table: "Settings",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 1m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "InvoiceLogoScale",
                table: "Settings");
        }
    }
}
