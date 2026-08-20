using System.ComponentModel.DataAnnotations;

namespace StockService.Models;

public sealed class ProductRequest
{
    [Required, MaxLength(50)]
    public string Code { get; init; } = string.Empty;

    [Required, MaxLength(200)]
    public string Description { get; init; } = string.Empty;

    [Range(0, int.MaxValue)]
    public int StockBalance { get; init; }
}
