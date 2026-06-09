using System.ComponentModel.DataAnnotations;

namespace ApexUSCommerce.ViewModels
{
    public class SettingsViewModel
    {
        [Required(ErrorMessage = "PayPal Business Email is required")]
        [EmailAddress(ErrorMessage = "Invalid Email address formatting")]
        [Display(Name = "PayPal Email Account")]
        public string PayPalEmail { get; set; } = string.Empty;

        [Required(ErrorMessage = "Business Account Name is required")]
        [StringLength(150, ErrorMessage = "Business Account Name cannot exceed 150 characters")]
        [Display(Name = "Business Display Name")]
        public string BusinessName { get; set; } = string.Empty;

        [Display(Name = "Enable PayPal as Active Payment Method")]
        public bool IsPaymentEnabled { get; set; }
    }
}
