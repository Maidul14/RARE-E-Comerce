using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ApexUSCommerce.Data;
using ApexUSCommerce.Models;

namespace ApexUSCommerce.Controllers
{
    public class HomeController : Controller
    {
        private readonly ApplicationDbContext _context;

        public HomeController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Product Catalog Listing Page
        public async Task<IActionResult> Index(string? search, string? category, string? sort)
        {
            var query = _context.Products
                .Include(p => p.Category)
                .Include(p => p.ProductImages)
                .AsQueryable();

            // Filter by search terms
            if (!string.IsNullOrEmpty(search))
            {
                var term = search.Trim().ToLower();
                query = query.Where(p => p.Name.ToLower().Contains(term) || p.Description.ToLower().Contains(term) || p.SKU.ToLower().Contains(term));
                ViewData["SearchQuery"] = search;
            }

            // Filter by category slug
            if (!string.IsNullOrEmpty(category))
            {
                query = query.Where(p => p.Category != null && p.Category.Slug == category);
                var cat = await _context.Categories.FirstOrDefaultAsync(c => c.Slug == category);
                ViewData["ActiveCategory"] = cat?.Name;
                ViewData["CategorySlug"] = category;
            }

            // Sort products
            switch (sort)
            {
                case "price_asc":
                    query = query.OrderBy(p => p.Price);
                    break;
                case "price_desc":
                    query = query.OrderByDescending(p => p.Price);
                    break;
                case "newest":
                default:
                    query = query.OrderByDescending(p => p.Id);
                    break;
            }
            ViewData["CurrentSort"] = sort;

            var products = await query.ToListAsync();
            var categories = await _context.Categories.ToListAsync();

            ViewData["CategoriesList"] = categories;
            return View(products);
        }

        // Product Details Page
        public async Task<IActionResult> Details(int id)
        {
            var product = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.ProductImages)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
            {
                return NotFound();
            }

            var recommendations = await _context.Products
                .Include(p => p.ProductImages)
                .Where(p => p.CategoryId == product.CategoryId && p.Id != product.Id)
                .Take(4)
                .ToListAsync();

            ViewData["Recommendations"] = recommendations;
            return View(product);
        }
    }
}
