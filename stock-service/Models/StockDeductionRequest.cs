namespace StockService.Models;

public class StockDeductionRequest
{
    public string OperationId { get; set; } = string.Empty;
    public List<StockDeductionItem> Items { get; set; } = new();
}

public class StockDeductionItem
{
    public int ProductId { get; set; }
    public int Quantity { get; set; }
}
