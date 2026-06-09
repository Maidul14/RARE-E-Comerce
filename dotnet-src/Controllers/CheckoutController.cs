using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using ApexUSCommerce.Data;
using ApexUSCommerce.Models;
using ApexUSCommerce.ViewModels;

namespace ApexUSCommerce.Controllers
{
    public class CheckoutController : Controller
    {
        private const string CartSessionKey = "_ShopCart";
        private readonly ApplicationDbContext _context;

        public CheckoutController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Display Checkout Form
        public IActionResult Index()
        {
            var cart = GetCartItems();
            if (cart.Count == 0)
            {
                TempData["ErrorMessage"] = "Your cart is empty. Please add items before checking out.";
                return RedirectToAction("Index", "Cart");
            }

            var model = new CheckoutViewModel { Country = "USA" };
            ViewData["CartItems"] = cart;
            ViewData["Subtotal"] = cart.Sum(i => i.Price * i.Quantity);
            return View(model);
        }

        // Process Guest Checkout
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Index(CheckoutViewModel model)
        {
            var cart = GetCartItems();
            if (cart.Count == 0)
            {
                return RedirectToAction("Index", "Cart");
            }

            if (!ModelState.IsValid)
            {
                ViewData["CartItems"] = cart;
                ViewData["Subtotal"] = cart.Sum(i => i.Price * i.Quantity);
                return View(model);
            }

            // Begin EF Core SQL Transaction block to prevent partial database writes
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                decimal subtotal = cart.Sum(item => item.Price * item.Quantity);
                
                // Typical USA 8% Sales Tax calculation
                decimal tax = Math.Round(subtotal * 0.08m, 2); 
                
                // Standard USA flat-rate shipping policies: free above $75 USD, else $9.99
                decimal shipping = subtotal >= 75.00m ? 0.00m : 9.99m; 
                decimal total = subtotal + tax + shipping;

                var order = new Order
                {
                    FullName = model.FullName,
                    Email = model.Email,
                    Phone = model.Phone,
                    Address = model.Address,
                    City = model.City,
                    State = model.State,
                    ZipCode = model.ZipCode,
                    Country = model.Country,
                    Subtotal = subtotal,
                    Tax = tax,
                    Shipping = shipping,
                    Total = total,
                    Status = "Pending",
                    CreatedAt = DateTime.UtcNow
                };

                _context.Orders.Add(order);
                await _context.SaveChangesAsync(); // Generates order Identity ID in SQL Server

                foreach (var item in cart)
                {
                    var orderItem = new OrderItem
                    {
                        OrderId = order.Id,
                        ProductId = item.ProductId,
                        Price = item.Price,
                        Quantity = item.Quantity,
                        SKU = "" // Looked up on order pipeline
                    };

                    // Load matching product catalog item to lock historical SKU
                    var prodDoc = await _context.Products.FindAsync(item.ProductId);
                    if (prodDoc != null)
                    {
                        orderItem.SKU = prodDoc.SKU;
                    }

                    _context.OrderItems.Add(orderItem);
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                // Clear ShopCart after successful order submission
                HttpContext.Session.Remove(CartSessionKey);

                // Send user to payment verification page
                return RedirectToAction("Pay", "Payment", new { orderId = order.Id });
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                ModelState.AddModelError(string.Empty, "An internal technical issue occurred processing your order. Please retry.");
                ViewData["CartItems"] = cart;
                ViewData["Subtotal"] = cart.Sum(i => i.Price * i.Quantity);
                return View(model);
            }
        }

        private List<CartItemSession> GetCartItems()
        {
            var rawJson = HttpContext.Session.GetString(CartSessionKey);
            if (string.IsNullOrEmpty(rawJson)) return new List<CartItemSession>();
            try
            {
                return JsonSerializer.Deserialize<List<CartItemSession>>(rawJson) ?? new List<CartItemSession>();
            }
            catch
            {
                return new List<CartItemSession>();
            }
        }
    }
}
