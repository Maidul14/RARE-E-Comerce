using Microsoft.EntityFrameworkCore;
using ApexUSCommerce.Models;
using Microsoft.AspNetCore.Identity;

namespace ApexUSCommerce.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Admin> Admins { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<ProductImage> ProductImages { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<Setting> Settings { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Relationships and Cascading
            modelBuilder.Entity<Category>()
                .HasMany(c => c.Products)
                .WithOne(p => p.Category)
                .HasForeignKey(p => p.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Product>()
                .HasMany(p => p.ProductImages)
                .WithOne(pi => pi.Product)
                .HasForeignKey(pi => pi.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Order>()
                .HasMany(o => o.OrderItems)
                .WithOne(oi => oi.Order)
                .HasForeignKey(oi => oi.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure Decimal precision for financials
            modelBuilder.Entity<Product>()
                .Property(p => p.Price)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Order>()
                .Property(o => o.Subtotal).HasPrecision(18, 2);
            modelBuilder.Entity<Order>()
                .Property(o => o.Tax).HasPrecision(18, 2);
            modelBuilder.Entity<Order>()
                .Property(o => o.Shipping).HasPrecision(18, 2);
            modelBuilder.Entity<Order>()
                .Property(o => o.Total).HasPrecision(18, 2);

            modelBuilder.Entity<OrderItem>()
                .Property(oi => oi.Price).HasPrecision(18, 2);

            // Seed Initial Categories
            modelBuilder.Entity<Category>().HasData(
                new Category { Id = 1, Name = "Tech & Gadgets", Slug = "tech-gadgets" },
                new Category { Id = 2, Name = "Apparel & Fashion", Slug = "apparel-fashion" },
                new Category { Id = 3, Name = "Home & Kitchen", Slug = "home-kitchen" },
                new Category { Id = 4, Name = "Sports & Outdoors", Slug = "sports-outdoors" }
            );

            // Seed Settings for PayPal manual flow
            modelBuilder.Entity<Setting>().HasData(
                new Setting { Key = "PayPalEmail", Value = "merchant-billing@mystore.us", Description = "Merchant PayPal Business Account Email" },
                new Setting { Key = "PayPalBusinessName", Value = "Apex USA Commerce LLC", Description = "Merchant Business Display Name" },
                new Setting { Key = "PayPalEnabled", Value = "True", Description = "Toggle state for active PayPal payments (True/False)" }
            );

            // Seed Default Hashed Administrator Credentials
            var hasher = new PasswordHasher<Admin>();
            var seededAdmin = new Admin
            {
                Id = 1,
                Username = "admin"
            };
            seededAdmin.PasswordHash = hasher.HashPassword(seededAdmin, "Password123!");

            modelBuilder.Entity<Admin>().HasData(seededAdmin);

            // Seed Products
            modelBuilder.Entity<Product>().HasData(
                new Product
                {
                    Id = 1,
                    Name = "AeroPro Active Noise Canceling Headphones",
                    Price = 249.99m,
                    Description = "Experience premium studio-quality audio with advanced active noise canceling, 45-hour battery life, and comfortable memory foam ear cups designed in California.",
                    CategoryId = 1,
                    Stock = 35,
                    SKU = "AP-ANC-90"
                },
                new Product
                {
                    Id = 2,
                    Name = "Cascade Trail Elite 45L Hiking Backpack",
                    Price = 89.50m,
                    Description = "Rugged, water-resistant hiking backpack featuring multi-point harness adjustments, breathable air-mesh padding, hydration bladder sleeve, and robust tactical gear-straps.",
                    CategoryId = 4,
                    Stock = 20,
                    SKU = "CT-HP-45"
                },
                new Product
                {
                    Id = 3,
                    Name = "Pro-Cast Heavy Pre-Seasoned Skillet",
                    Price = 45.00m,
                    Description = "Authentic double-handle deep cast iron skillet pre-seasoned with natural organic vegetable oil. Exceptional heat retention and robust American build quality.",
                    CategoryId = 3,
                    Stock = 42,
                    SKU = "PC-CI-12"
                }
            );

            // Seed Product Images
            modelBuilder.Entity<ProductImage>().HasData(
                new ProductImage { Id = 1, ProductId = 1, ImageUrl = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80" },
                new ProductImage { Id = 2, ProductId = 2, ImageUrl = "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80" },
                new ProductImage { Id = 3, ProductId = 3, ImageUrl = "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=600&q=80" }
            );
        }
    }
}
