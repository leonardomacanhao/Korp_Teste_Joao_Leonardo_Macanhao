using System.ComponentModel.DataAnnotations;

namespace StockService.Models;

public class Product
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(50)]
    public string Code { get; set; } = string.Empty;

    [Required, MaxLength(200)]
    public string Description { get; set; } = string.Empty;

    [Range(0, int.MaxValue)]
    public int StockBalance { get; set; }

    public bool IsActive { get; set; } = true;
}
