using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.EntityFrameworkCore;
using ApexUSCommerce.Data;

var builder = WebApplication.CreateBuilder(args);

// Add Database Context representing MS SQL Server
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add authentication middleware and specify Cookie strategy for the Admin Area
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.LoginPath = "/Admin/Login";
        options.AccessDeniedPath = "/Admin/Login";
        options.ExpireTimeSpan = TimeSpan.FromMinutes(120);
    });

// Add HTTP Session services for Guest Shopping Carts
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
    {
        options.IdleTimeout = TimeSpan.FromHours(6); // Keep guest cart alive for 6 hours
        options.Cookie.HttpOnly = true;
        options.Cookie.IsEssential = true;
    });

// Enable MVC Controllers and razor views caching
builder.Services.AddControllersWithViews();

var app = builder.Build();

// Configure the HTTP request processing pipeline
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

// Critical order sequence: Sessions -> Authentication -> Authorization
app.UseSession();
app.UseAuthentication();
app.UseAuthorization();

// Map default routes
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
