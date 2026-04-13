using System.ComponentModel.DataAnnotations;

namespace StockService.Models;

public class Product
{
    [Key]
    public int Id { get; set; }

    [Required]
    public string Code { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    [Range(0, double.MaxValue)]
    public int StockBalance { get; set; }
    
}