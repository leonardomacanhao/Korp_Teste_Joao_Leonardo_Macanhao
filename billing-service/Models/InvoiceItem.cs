using System.ComponentModel.DataAnnotations;

namespace BillingService.Models;

public class InvoiceItem
{
    [Key]
    public int Id { get; set; }
    public int InvoiceId { get; set; }
    public int ProductId { get; set; }
    public int Quantity { get; set; }
}
