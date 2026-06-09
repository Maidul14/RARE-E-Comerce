using System.ComponentModel.DataAnnotations;

namespace ApexUSCommerce.Models
{
    public class Category
    {
        [Key]
        public int Id { get; set; }

        [Required(ErrorMessage = "Category Name is required")]
        [StringLength(100, ErrorMessage = "Category Name cannot exceed 100 characters")]
        public string Name { get; set; } = string.Empty;

        [Required]
        [StringLength(120)]
        public string Slug { get; set; } = string.Empty;

        // Navigation Property for Products
        public ICollection<Product> Products { get; set; } = new List<Product>();
    }
}
