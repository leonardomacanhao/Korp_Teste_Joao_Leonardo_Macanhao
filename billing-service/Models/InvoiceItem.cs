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

public sealed class CreateInvoiceItemRequest
{
    [Range(1, int.MaxValue)]
    public int ProductId { get; init; }

    [Range(1, int.MaxValue)]
    public int Quantity { get; init; }
}
