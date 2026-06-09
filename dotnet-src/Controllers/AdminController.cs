using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using ApexUSCommerce.Data;
using ApexUSCommerce.Models;
using ApexUSCommerce.ViewModels;

namespace ApexUSCommerce.Controllers
{
    [Authorize] // Default state is protected by Identity/Cookie mechanisms
    public class AdminController : Controller
    {
        private readonly ApplicationDbContext _context;

        public AdminController(ApplicationDbContext context)
        {
            _context = context;
        }

        // --- AUTHENTICATION CORNER ---

        [AllowAnonymous]
        [HttpGet]
        public IActionResult Login()
        {
            if (User.Identity?.IsAuthenticated == true)
            {
                return RedirectToAction(nameof(Dashboard));
            }
            return View(new LoginViewModel());
        }

        [AllowAnonymous]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Login(LoginViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return View(model);
            }

            var admin = await _context.Admins.FirstOrDefaultAsync(u => u.Username == model.Username);
            if (admin != null)
            {
                var hasher = new PasswordHasher<Admin>();
                var verification = hasher.VerifyHashedPassword(admin, admin.PasswordHash, model.Password);

                if (verification == PasswordVerificationResult.Success)
                {
                    // Establish standard Secure identity claims
                    var claims = new List<Claim>
                    {
                        new Claim(ClaimTypes.Name, admin.Username),
                        new Claim(ClaimTypes.Role, "Administrator")
                    };

                    var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
                    var authProperties = new AuthenticationProperties
                    {
                        IsPersistent = model.RememberMe,
                        ExpiresUtc = DateTimeOffset.UtcNow.AddMinutes(120)
                    };

                    await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(claimsIdentity), authProperties);
                    return RedirectToAction(nameof(Dashboard));
                }
            }

            ModelState.AddModelError(string.Empty, "Invalid login credentials. Access Denied.");
            return View(model);
        }

        [HttpPost]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return RedirectToAction(nameof(Login));
        }

        // --- DASHBOARD ANALYTICS ---

        public async Task<IActionResult> Dashboard()
        {
            var orders = await _context.Orders.ToListAsync();

            var model = new DashboardViewModel
            {
                TotalOrders = orders.Count,
                PendingOrders = orders.Count(o => o.Status == "Pending"),
                WaitingVerificationOrders = orders.Count(o => o.Status == "Waiting For Verification"),
                CompletedOrders = orders.Count(o => o.Status == "Completed"),
                TotalRevenue = orders.Where(o => o.Status == "Completed").Sum(o => o.Total),
                PendingRevenue = orders.Where(o => o.Status == "Waiting For Verification").Sum(o => o.Total)
            };

            // Grab Last 10 Orders
            model.RecentOrders = orders
                .OrderByDescending(o => o.CreatedAt)
                .Take(10)
                .Select(o => new RecentOrderViewModel
                {
                    OrderId = o.Id,
                    CustomerName = o.FullName,
                    Total = o.Total,
                    Status = o.Status,
                    OrderDate = o.CreatedAt
                }).ToList();

            // Populate mock graph trends
            model.MonthlyRevenueChart = new List<MonthlyRevenueItem>
            {
                new MonthlyRevenueItem { Month = "Jan", Revenue = model.TotalRevenue * 0.15m },
                new MonthlyRevenueItem { Month = "Feb", Revenue = model.TotalRevenue * 0.20m },
                new MonthlyRevenueItem { Month = "Mar", Revenue = model.TotalRevenue * 0.25m },
                new MonthlyRevenueItem { Month = "Apr", Revenue = model.TotalRevenue * 0.18m },
                new MonthlyRevenueItem { Month = "May", Revenue = model.TotalRevenue * 0.22m }
            };

            return View(model);
        }

        // --- CATEGORIES MANAGEMENT ---

        public async Task<IActionResult> Categories()
        {
            var categories = await _context.Categories.ToListAsync();
            return View(categories);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> CreateCategory(string name)
        {
            if (string.IsNullOrEmpty(name))
            {
                TempData["ErrorMessage"] = "Category name cannot be empty.";
                return RedirectToAction(nameof(Categories));
            }

            var slug = name.Trim().ToLower().Replace(" ", "-").Replace("&", "and");
            var item = new Category { Name = name.Trim(), Slug = slug };
            _context.Categories.Add(item);
            await _context.SaveChangesAsync();

            TempData["SuccessMessage"] = $"Category '{name}' created successfully.";
            return RedirectToAction(nameof(Categories));
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> EditCategory(int id, string name)
        {
            var cat = await _context.Categories.FindAsync(id);
            if (cat == null) return NotFound();

            if (string.IsNullOrEmpty(name))
            {
                TempData["ErrorMessage"] = "Category name cannot be empty.";
                return RedirectToAction(nameof(Categories));
            }

            cat.Name = name.Trim();
            cat.Slug = name.Trim().ToLower().Replace(" ", "-").Replace("&", "and");
            await _context.SaveChangesAsync();

            TempData["SuccessMessage"] = "Category name updated successfully.";
            return RedirectToAction(nameof(Categories));
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var cat = await _context.Categories.FindAsync(id);
            if (cat == null) return NotFound();

            // Check if products have dependencies
            bool hasProducts = await _context.Products.AnyAsync(p => p.CategoryId == id);
            if (hasProducts)
            {
                TempData["ErrorMessage"] = "Cannot delete category because it contains active product links. Shift or delete those products first.";
                return RedirectToAction(nameof(Categories));
            }

            _context.Categories.Remove(cat);
            await _context.SaveChangesAsync();

            TempData["SuccessMessage"] = "Category removed successfully.";
            return RedirectToAction(nameof(Categories));
        }

        // --- PRODUCT FILE CRUD ---

        public async Task<IActionResult> Products()
        {
            var products = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.ProductImages)
                .ToListAsync();

            ViewBag.Categories = await _context.Categories.ToListAsync();
            return View(products);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> CreateProduct(Product product, List<string> imageUrls)
        {
            if (!ModelState.IsValid)
            {
                ViewBag.Categories = await _context.Categories.ToListAsync();
                TempData["ErrorMessage"] = "Invalid product parameters entered. Check inputs.";
                return RedirectToAction(nameof(Products));
            }

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            // Support Multiple Image URLs injection
            if (imageUrls != null && imageUrls.Count > 0)
            {
                foreach (var url in imageUrls)
                {
                    if (!string.IsNullOrEmpty(url))
                    {
                        _context.ProductImages.Add(new ProductImage
                        {
                            ProductId = product.Id,
                            ImageUrl = url.Trim()
                        });
                    }
                }
                await _context.SaveChangesAsync();
            }

            TempData["SuccessMessage"] = $"Product '{product.Name}' added successfully with SKU {product.SKU}.";
            return RedirectToAction(nameof(Products));
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> EditProduct(Product model, List<string> imageUrls)
        {
            var product = await _context.Products.FindAsync(model.Id);
            if (product == null) return NotFound();

            product.Name = model.Name;
            product.Price = model.Price;
            product.Description = model.Description;
            product.Stock = model.Stock;
            product.SKU = model.SKU;
            product.CategoryId = model.CategoryId;

            // Simple update strategy: clear old images and append new list
            var oldImages = await _context.ProductImages.Where(pi => pi.ProductId == product.Id).ToListAsync();
            _context.ProductImages.RemoveRange(oldImages);

            if (imageUrls != null && imageUrls.Count > 0)
            {
                foreach (var url in imageUrls)
                {
                    if (!string.IsNullOrEmpty(url))
                    {
                        _context.ProductImages.Add(new ProductImage
                        {
                            ProductId = product.Id,
                            ImageUrl = url.Trim()
                        });
                    }
                }
            }

            await _context.SaveChangesAsync();
            TempData["SuccessMessage"] = "Product details updated successfully.";
            return RedirectToAction(nameof(Products));
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound();

            _context.Products.Remove(product);
            await _context.SaveChangesAsync(); // Auto-cascades product images due to fluent configurations

            TempData["SuccessMessage"] = "Product completely deleted.";
            return RedirectToAction(nameof(Products));
        }

        // --- ORDERS REVIEW CONTROL BOARD ---

        public async Task<IActionResult> Orders()
        {
            var orders = await _context.Orders
                .Include(o => o.OrderItems)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            return View(orders);
        }

        public async Task<IActionResult> OrderDetails(int id)
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null) return NotFound();
            return View(order);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> VerifyPayment(int id)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null) return NotFound();

            order.Status = "Completed"; // Payment has been physically matched and completed
            await _context.SaveChangesAsync();

            TempData["SuccessMessage"] = $"Order {id} verified successfully of manual payment. Order processed.";
            return RedirectToAction(nameof(Orders));
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> RejectPayment(int id)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null) return NotFound();

            order.Status = "Rejected"; // Verification failed or user gave flawed transaction reference.
            await _context.SaveChangesAsync();

            TempData["SuccessMessage"] = $"Order {id} flagged as transaction rejected.";
            return RedirectToAction(nameof(Orders));
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> AdjustOrderStatus(int id, string status)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null) return NotFound();

            order.Status = status;
            await _context.SaveChangesAsync();

            TempData["SuccessMessage"] = $"Order {id} status altered to '{status}'.";
            return RedirectToAction(nameof(Orders));
        }

        // --- SETTINGS (PAYPAL CORNER) ---

        public async Task<IActionResult> Settings()
        {
            var paypalEmailSetting = await _context.Settings.FirstOrDefaultAsync(s => s.Key == "PayPalEmail");
            var bizNameSetting = await _context.Settings.FirstOrDefaultAsync(s => s.Key == "PayPalBusinessName");
            var enabledSetting = await _context.Settings.FirstOrDefaultAsync(s => s.Key == "PayPalEnabled");

            var model = new SettingsViewModel
            {
                PayPalEmail = paypalEmailSetting?.Value ?? "merchant-billing@mystore.us",
                BusinessName = bizNameSetting?.Value ?? "Apex USA Commerce LLC",
                IsPaymentEnabled = (enabledSetting?.Value ?? "True").Equals("True", StringComparison.OrdinalIgnoreCase)
            };

            return View(model);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Settings(SettingsViewModel model)
        {
            if (!ModelState.IsValid) return View(model);

            var emailSet = await _context.Settings.FirstOrDefaultAsync(s => s.Key == "PayPalEmail");
            var bizSet = await _context.Settings.FirstOrDefaultAsync(s => s.Key == "PayPalBusinessName");
            var activeSet = await _context.Settings.FirstOrDefaultAsync(s => s.Key == "PayPalEnabled");

            if (emailSet != null) emailSet.Value = model.PayPalEmail.Trim();
            if (bizSet != null) bizSet.Value = model.BusinessName.Trim();
            if (activeSet != null) activeSet.Value = model.IsPaymentEnabled ? "True" : "False";

            await _context.SaveChangesAsync();

            TempData["SuccessMessage"] = "PayPal processing settings updated successfully.";
            return RedirectToAction(nameof(Settings));
        }
    }
}
