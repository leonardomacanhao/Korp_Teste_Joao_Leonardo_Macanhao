using System.ComponentModel.DataAnnotations;

namespace StockService.Models;

public class StockDeductionRequest
{
    [Required, MaxLength(100)]
    public string OperationId { get; set; } = string.Empty;

    [Required, MinLength(1)]
    public List<StockDeductionItem> Items { get; set; } = new();
}

public class StockDeductionItem
{
    [Range(1, int.MaxValue)]
    public int ProductId { get; set; }

    [Range(1, int.MaxValue)]
    public int Quantity { get; set; }
}
