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
        => await _context.Products
            .Where(p => p.IsActive)
            .ToListAsync();

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
        product.IsActive = false;

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
        
        if (!product.IsActive)
            return BadRequest(new { message = "Produto inativo" });

        if (quantity <= 0)
            return BadRequest(new { message = "Quantidade inválida" });

        if (product.StockBalance < quantity) 
            return BadRequest(new { message = "Saldo insuficiente" });

        product.StockBalance -= quantity;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // DÉBITO ATÔMICO EM LOTE (idempotente)
    [HttpPost("deductions")]
    public async Task<IActionResult> DeductBatch([FromBody] StockDeductionRequest request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.OperationId) || request.Items == null || !request.Items.Any())
            return BadRequest(new { message = "Requisição inválida" });

        // Idempotency: se operação já foi processada, retornar sucesso sem fazer nada
        using var tx = await _context.Database.BeginTransactionAsync();

        try
        {
            var existingOp = await _context.StockOperations.FindAsync(request.OperationId);
            if (existingOp != null)
                return Ok(new { message = "Operação já processada" });
            var invalidItem = request.Items.FirstOrDefault(i => i.Quantity <= 0);
            if (invalidItem != null)
                return BadRequest(new { message = $"Quantidade inválida para produto {invalidItem.ProductId}" });

            // Agrupa itens repetidos para validar e debitar a quantidade total por produto
            var groupedItems = request.Items
                .GroupBy(i => i.ProductId)
                .Select(g => new
                {
                    ProductId = g.Key,
                    Quantity = g.Sum(i => i.Quantity)
                })
                .ToList();

            var productIds = groupedItems.Select(i => i.ProductId).ToList();
            var products = await _context.Products.Where(p => productIds.Contains(p.Id)).ToListAsync();

            foreach (var item in groupedItems)
            {
                var product = products.FirstOrDefault(p => p.Id == item.ProductId);
                if (product == null)
                    return NotFound(new { message = $"Produto {item.ProductId} não encontrado" });

                if (!product.IsActive)
                    return BadRequest(new { message = $"Produto {item.ProductId} está inativo" });

                if (product.StockBalance < item.Quantity)
                    return BadRequest(new { message = $"Saldo insuficiente para produto {item.ProductId}" });
            }

            // Apply all debits
            foreach (var item in groupedItems)
            {
                var product = products.First(p => p.Id == item.ProductId);
                product.StockBalance -= item.Quantity;
            }

            // Register operation for idempotency
            _context.StockOperations.Add(new StockOperation { OperationId = request.OperationId, CreatedAt = DateTime.UtcNow });

            await _context.SaveChangesAsync();
            await tx.CommitAsync();
            return Ok(new { message = "Deduções aplicadas com sucesso" });
        }
        catch (Exception ex)
        {
            await tx.RollbackAsync();
            Console.WriteLine($"[ERROR] DeductBatch: {ex.Message}");
            return StatusCode(500, new { message = "Erro ao processar débitos." });
        }
    }
}