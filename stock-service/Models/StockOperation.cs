using System.ComponentModel.DataAnnotations;

namespace StockService.Models;

public class StockOperation
{
    [Key]
    public string OperationId { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
