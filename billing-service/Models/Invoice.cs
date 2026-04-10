using System.ComponentModel.DataAnnotations;

namespace BillingService.Models;

public class Invoice
{
    [Key]
    public int Id { get; set; }
    public string Number { get; set; } = string.Empty;
    public string Status { get; set; } = "Aberta";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public List<InvoiceItem> Items { get; set; } = new();
}
