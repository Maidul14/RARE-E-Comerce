using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ApexUSCommerce.Data;
using ApexUSCommerce.Models;

namespace ApexUSCommerce.Controllers
{
    public class PaymentController : Controller
    {
        private readonly ApplicationDbContext _context;

        public PaymentController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Display manual PayPal payment instructions and transaction capture
        public async Task<IActionResult> Pay(int orderId)
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null)
            {
                return NotFound();
            }

            if (order.Status != "Pending")
            {
                TempData["Message"] = "This order has already been processed or is waiting for transaction approvals.";
                return RedirectToAction("Details", "Order", new { id = order.Id }); // or catalog
            }

            // Load active PayPal Email configurations from database settings
            var paypalEmailSetting = await _context.Settings.FirstOrDefaultAsync(s => s.Key == "PayPalEmail");
            var bizNameSetting = await _context.Settings.FirstOrDefaultAsync(s => s.Key == "PayPalBusinessName");
            var enabledSetting = await _context.Settings.FirstOrDefaultAsync(s => s.Key == "PayPalEnabled");

            ViewData["PayPalEmail"] = paypalEmailSetting?.Value ?? "merchant-billing@mystore.us";
            ViewData["BusinessName"] = bizNameSetting?.Value ?? "Apex USA Commerce LLC";
            ViewData["PaymentsEnabled"] = enabledSetting?.Value ?? "True";

            return View(order);
        }

        // Submit physical PayPal transaction ID
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> SubmitPayment(int orderId, string transactionId)
        {
            if (string.IsNullOrEmpty(transactionId))
            {
                TempData["ErrorMessage"] = "Transaction ID cannot be blank. Please enter the exact receipt reference.";
                return RedirectToAction(nameof(Pay), new { orderId });
            }

            var order = await _context.Orders.FindAsync(orderId);
            if (order == null)
            {
                return NotFound();
            }

            order.PayPalTransactionId = transactionId.Trim();
            order.Status = "Waiting For Verification"; // Triggers security review queues in admin

            await _context.SaveChangesAsync();

            TempData["SuccessMessage"] = $"Thank you! Transaction {transactionId} has been successfully logged. Our compliance administrators will verify and dispatch your order shortly.";
            return View("Confirmation", order);
        }

        // Simple confirmation screen
        public async Task<IActionResult> Confirmation(int id)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null) return NotFound();
            return View(order);
        }
    }
}
