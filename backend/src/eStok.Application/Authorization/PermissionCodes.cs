namespace eStok.Application.Authorization;

public static class PermissionCodes
{
    public static readonly string[] All = [
        "customers.view", "customers.create", "customers.edit", "customers.delete",
        "products.view", "products.create", "products.edit", "products.delete",
        "inventory.view", "inventory.adjust", "sales.view", "sales.create", "sales.cancel",
        "quotes.view", "quotes.create", "quotes.edit", "quotes.convert", "payments.view", "payments.create",
        "expenses.view", "expenses.create", "reports.view", "users.view", "users.manage", "settings.view", "settings.manage"
    ];
    public static string[] ForRole(string role) => role switch
    {
        "Owner" or "Administrator" => All,
        "Manager" => All.Where(x => !x.StartsWith("users.") && !x.EndsWith("manage")).ToArray(),
        "Seller" => All.Where(x => x.StartsWith("customers.") || x is "products.view" or "inventory.view" || x.StartsWith("sales.") || x.StartsWith("quotes.") || x.StartsWith("payments.")).ToArray(),
        "InventoryManager" => All.Where(x => x.StartsWith("products.") || x.StartsWith("inventory.")).ToArray(),
        _ => All.Where(x => x.EndsWith(".view") && !x.StartsWith("users.") && !x.StartsWith("settings.")).ToArray()
    };
}
