using System.ComponentModel.DataAnnotations;

namespace BillingService.Models;

public static class InvoiceStatuses
{
    public const string Open = "Aberta";
    public const string Closed = "Fechada";
}

public class Invoice
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(20)]
    public string Number { get; set; } = string.Empty;

    [Required, MaxLength(20)]
    public string Status { get; set; } = InvoiceStatuses.Open;
    public DateTime CreatedAt { get; set; }
    public List<InvoiceItem> Items { get; set; } = new();
}
