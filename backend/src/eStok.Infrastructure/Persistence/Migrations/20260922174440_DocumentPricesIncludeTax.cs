using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace eStok.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class DocumentPricesIncludeTax : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "PricesIncludeTax",
                table: "Sales",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "PricesIncludeTax",
                table: "Quotes",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PricesIncludeTax",
                table: "Sales");

            migrationBuilder.DropColumn(
                name: "PricesIncludeTax",
                table: "Quotes");
        }
    }
}
