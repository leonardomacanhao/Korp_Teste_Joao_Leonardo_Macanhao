using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StockService.Data;
using StockService.Models;

namespace StockService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProductsController(AppDbContext context) => _context = context;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
        => await _context.Products.ToListAsync();

    [HttpPost]
    public async Task<ActionResult<Product>> CreateProduct(Product product)
    {
        _context.Products.Add(product);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetProducts), new { id = product.Id }, product);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateStock(int id, [FromBody] int newBalance)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null) return NotFound();

        product.StockBalance = newBalance;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPut("{id}/deduct")]
public async Task<IActionResult> DeductStock(int id, [FromBody] int quantity)
{
    var product = await _context.Products.FindAsync(id);
    if (product == null) return NotFound();
    if (product.StockBalance < quantity) return BadRequest("Saldo insuficiente.");

    product.StockBalance -= quantity;
    await _context.SaveChangesAsync();
    return NoContent();
}
}