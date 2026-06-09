using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using System.Text.Json;
using ApexUSCommerce.Data;
using ApexUSCommerce.Models;

namespace ApexUSCommerce.Controllers
{
    public class CartItemSession
    {
        public int ProductId { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Quantity { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
    }

    public class CartController : Controller
    {
        private const string CartSessionKey = "_ShopCart";
        private readonly ApplicationDbContext _context;

        public CartController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Display current Cart Items
        public IActionResult Index()
        {
            var cart = GetCartFromSession();
            return View(cart);
        }

        // Add Product to Cart
        [HttpPost]
        public async Task<IActionResult> AddToCart(int productId, int quantity = 1)
        {
            var product = await _context.Products
                .Include(p => p.ProductImages)
                .FirstOrDefaultAsync(p => p.Id == productId);

            if (product == null)
            {
                return NotFound();
            }

            var cart = GetCartFromSession();
            var existing = cart.FirstOrDefault(item => item.ProductId == productId);

            if (existing != null)
            {
                existing.Quantity += quantity;
            }
            else
            {
                var imgUrl = product.ProductImages.FirstOrDefault()?.ImageUrl
                             ?? "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80";

                cart.Add(new CartItemSession
                {
                    ProductId = product.Id,
                    Name = product.Name,
                    Price = product.Price,
                    Quantity = quantity,
                    ImageUrl = imgUrl
                });
            }

            SaveCartToSession(cart);
            return RedirectToAction(nameof(Index));
        }

        // Update items quantity bounds
        [HttpPost]
        public IActionResult UpdateQuantity(int productId, int quantity)
        {
            if (quantity <= 0)
            {
                return RemoveFromCart(productId);
            }

            var cart = GetCartFromSession();
            var item = cart.FirstOrDefault(i => i.ProductId == productId);
            if (item != null)
            {
                item.Quantity = quantity;
                SaveCartToSession(cart);
            }

            return RedirectToAction(nameof(Index));
        }

        // Remove item entirely from session
        [HttpPost]
        public IActionResult RemoveFromCart(int productId)
        {
            var cart = GetCartFromSession();
            var item = cart.FirstOrDefault(i => i.ProductId == productId);
            if (item != null)
            {
                cart.Remove(item);
                SaveCartToSession(cart);
            }
            return RedirectToAction(nameof(Index));
        }

        // Get Cart from Sessions Helper
        private List<CartItemSession> GetCartFromSession()
        {
            var rawJson = HttpContext.Session.GetString(CartSessionKey);
            if (string.IsNullOrEmpty(rawJson))
            {
                return new List<CartItemSession>();
            }
            try
            {
                return JsonSerializer.Deserialize<List<CartItemSession>>(rawJson) ?? new List<CartItemSession>();
            }
            catch
            {
                return new List<CartItemSession>();
            }
        }

        // Persist session Helper
        private void SaveCartToSession(List<CartItemSession> cart)
        {
            var json = JsonSerializer.Serialize(cart);
            HttpContext.Session.SetString(CartSessionKey, json);
        }
    }
}
