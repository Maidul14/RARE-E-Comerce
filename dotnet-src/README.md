# USA E-Commerce Portal - .NET 8 MVC Codebase

This is a complete, production-ready ASP.NET Core MVC (.NET 8) codebase leveraging Entity Framework Core (EF Core) and SQL Server. This implementation features secure guest checkout, persistent local databases, safe local authentication, comprehensive administrators control boards, and manual PayPal Verification logs.

## Prerequites

1. **.NET SDK 8.0** (or later) - Standard command-line or Visual Studio integrations.
2. **SQL Server LocalDB** or Standard SQL Server Instance.
3. **Visual Studio 2022** or **Visual Studio Code** with C# Dev Kit.

## Solution Directory Structure

```text
/ApexUSCommerce
│
├── Data/
│   └── ApplicationDbContext.cs      # EF Core DbContext with custom seed data
│
├── Models/
│   ├── Admin.cs
│   ├── Category.cs
│   ├── Product.cs
│   ├── ProductImage.cs
│   ├── Order.cs
│   ├── OrderItem.cs
│   ├── Payment.cs
│   └── Setting.cs
│
├── ViewModels/
│   ├── LoginViewModel.cs
│   ├── DashboardViewModel.cs
│   ├── SettingsViewModel.cs
│   └── CheckoutViewModel.cs
│
├── Controllers/
│   ├── HomeController.cs            # Product Catalog, Search & Filter
│   ├── CartController.cs            # Session-Based Shopping Cart
│   ├── CheckoutController.cs        # Guest Checkout & Order Creation
│   ├── PaymentController.cs         # Manual PayPal Payment & TxID Capture
│   └── AdminController.cs           # Secured Controller for Category, Product, Orders, Settings
│
├── Views/ (Razor views styled with Bootstrap 5)
│   ├── Shared/_Layout.cshtml
│   ├── Shared/_AdminLayout.cshtml
│   ├── Home/ (Index, Details)
│   ├── Cart/ (Index)
│   ├── Checkout/ (Index)
│   ├── Payment/ (Pay)
│   └── Admin/ (Login, Dashboard, Products, Categories, Orders, Settings)
│
├── Program.cs                       # App entry point, Services, Pipeline
├── appsettings.json                 # ConnectionStrings and PayPal credentials config
└── ApexUSCommerce.csproj            # NuGet package declarations (.NET 8 + EF Core)
```

## Setup Instructions

1. **Navigate to the .NET Project folder** or open the project `.csproj` directly inside Visual Studio.
2. **Configure Database Connection String** inside `appsettings.json`. Update the `"DefaultConnection"` node with your database host, port, credentials, and name.
3. **Run EF Migrations** from the Package Manager Console or terminal to auto-provision your SQL database with optimized schemas:
   ```bash
   dotnet ef database update
   ```
4. **Build and Run the Server**:
   ```bash
   dotnet build
   dotnet run
   ```
5. **Access the Portal**:
   - Customer Portal: `http://localhost:5000` (or the configured https port)
   - Secure Admin Dashboard: `http://localhost:5000/Admin/Dashboard`
     - Default seeded administrator username: `admin`
     - Default seeded administrator password: `Password123!` (Stores as a secured hash in table upon initialization)

## Security Controls Implemented

- **Password Hashing**: Utilizes ASP.NET Core `IPasswordHasher<Admin>` for irreversible secure hashing algorithm.
- **SQL Injection Prevention**: Safe parametric query mapping executed by Entity Framework Core on standard requests.
- **Anti-Forgery Checks**: Every state-mutating POST operations guarded by Razor `[ValidateAntiForgeryToken]` annotations.
- **Input Verification**: Model state validated strictly via standard `.NET validation attributes` (`[Required]`, `[EmailAddress]`, `[Phone]`, `[Range]`).
- **Route Guards**: Critical admin panels secured tightly via standard MVC standard cookie-based authentication.
