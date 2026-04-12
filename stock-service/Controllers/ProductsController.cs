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

    // ✅ LISTAR TODOS (GET /api/products)
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
        => await _context.Products.ToListAsync();

    // ✅ BUSCAR POR ID (GET /api/products/{id}) ← ESSENCIAL PARA EDIÇÃO
    [HttpGet("{id}")]
    public async Task<ActionResult<Product>> GetProduct(int id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null) 
            return NotFound(new { message = "Produto não encontrado" });
        
        return Ok(product);
    }

    // ✅ CRIAR (POST /api/products)
    [HttpPost]
    public async Task<ActionResult<Product>> CreateProduct(Product product)
    {
        if (product == null) 
            return BadRequest(new { message = "Dados inválidos" });
        
        _context.Products.Add(product);
        await _context.SaveChangesAsync();
        
        return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
    }

    // ✅ ATUALIZAR (PUT /api/products/{id})
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProduct(int id, Product product)
    {
        if (product == null) 
            return BadRequest(new { message = "Dados inválidos" });
        
        var existing = await _context.Products.FindAsync(id);
        if (existing == null) 
            return NotFound(new { message = "Produto não encontrado" });
        
        existing.Code = product.Code;
        existing.Description = product.Description;
        existing.StockBalance = product.StockBalance;
        
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // ✅ SOFT DELETE (DELETE /api/products/{id})
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null) 
            return NotFound(new { message = "Produto não encontrado" });
        
        // Soft delete: marca como inativo ao invés de remover
        product.Code = $"[INATIVO]_{product.Code}";
        product.Description = $"[INATIVO] {product.Description}";
        
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // ✅ DÉBITO DE ESTOQUE (para integração com billing)
    [HttpPut("{id}/deduct")]
    public async Task<IActionResult> DeductStock(int id, [FromBody] int quantity)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null) 
            return NotFound(new { message = "Produto não encontrado" });
        
        if (product.StockBalance < quantity) 
            return BadRequest(new { message = "Saldo insuficiente" });

        product.StockBalance -= quantity;
        await _context.SaveChangesAsync();
        return NoContent();
    }
}