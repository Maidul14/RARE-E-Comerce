using System.ComponentModel.DataAnnotations;

namespace ApexUSCommerce.Models
{
    public class Setting
    {
        [Key]
        [StringLength(50)]
        public string Key { get; set; } = string.Empty;

        [Required]
        [StringLength(250)]
        public string Value { get; set; } = string.Empty;

        [StringLength(250)]
        public string? Description { get; set; }
    }
}
