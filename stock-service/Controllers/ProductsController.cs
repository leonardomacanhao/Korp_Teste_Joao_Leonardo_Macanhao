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
        => await _context.Products
            .AsNoTracking()
            .Where(p => p.IsActive)
            .OrderBy(p => p.Code)
            .ToListAsync();

    [HttpGet("{id}")]
    public async Task<ActionResult<Product>> GetProduct(int id)
    {
        var product = await _context.Products
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == id && p.IsActive);
        if (product == null)
            return NotFound(new { message = "Produto não encontrado" });
        
        return Ok(product);
    }

    [HttpPost]
    public async Task<ActionResult<Product>> CreateProduct(ProductRequest request)
    {
        var code = request.Code.Trim();
        var description = request.Description.Trim();
        if (code.Length == 0 || description.Length == 0)
            return BadRequest(new { message = "Código e descrição são obrigatórios" });

        var product = new Product
        {
            Code = code,
            Description = description,
            StockBalance = request.StockBalance,
            IsActive = true
        };

        _context.Products.Add(product);
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            return Conflict(new { message = "Já existe um produto com este código" });
        }
        
        return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProduct(int id, ProductRequest request)
    {
        var existing = await _context.Products.FindAsync(id);
        if (existing == null || !existing.IsActive)
            return NotFound(new { message = "Produto não encontrado" });

        var code = request.Code.Trim();
        var description = request.Description.Trim();
        if (code.Length == 0 || description.Length == 0)
            return BadRequest(new { message = "Código e descrição são obrigatórios" });

        existing.Code = code;
        existing.Description = description;
        existing.StockBalance = request.StockBalance;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            return Conflict(new { message = "Já existe um produto com este código" });
        }
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null) 
            return NotFound(new { message = "Produto não encontrado" });
        
        product.IsActive = false;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("deductions")]
    public async Task<IActionResult> DeductBatch([FromBody] StockDeductionRequest request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.OperationId) || request.Items == null || !request.Items.Any())
            return BadRequest(new { message = "Requisição inválida" });

        using var tx = await _context.Database.BeginTransactionAsync();

        try
        {
            var existingOp = await _context.StockOperations.FindAsync(request.OperationId);
            if (existingOp != null)
                return Ok(new { message = "Operação já processada" });
            List<(int ProductId, int Quantity)> groupedItems;
            try
            {
                groupedItems = request.Items
                    .GroupBy(i => i.ProductId)
                    .Select(g => (g.Key, checked(g.Sum(i => i.Quantity))))
                    .ToList();
            }
            catch (OverflowException)
            {
                return BadRequest(new { message = "A quantidade total informada é inválida" });
            }

            var productIds = groupedItems.Select(i => i.ProductId).ToList();
            var products = await _context.Products
                .AsNoTracking()
                .Where(p => productIds.Contains(p.Id))
                .ToDictionaryAsync(p => p.Id);

            foreach (var item in groupedItems)
            {
                if (!products.TryGetValue(item.ProductId, out var product))
                    return NotFound(new { message = $"Produto {item.ProductId} não encontrado" });

                if (!product.IsActive)
                    return BadRequest(new { message = $"Produto {item.ProductId} está inativo" });

                if (product.StockBalance < item.Quantity)
                    return BadRequest(new { message = $"Saldo insuficiente para produto {item.ProductId}" });
            }

            foreach (var item in groupedItems)
            {
                var affected = await _context.Products
                    .Where(p => p.Id == item.ProductId && p.IsActive && p.StockBalance >= item.Quantity)
                    .ExecuteUpdateAsync(update => update
                        .SetProperty(p => p.StockBalance, p => p.StockBalance - item.Quantity));

                if (affected != 1)
                    return Conflict(new { message = $"O saldo do produto {item.ProductId} foi alterado por outra operação" });
            }

            _context.StockOperations.Add(new StockOperation
            {
                OperationId = request.OperationId,
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
            await tx.CommitAsync();
            return Ok(new { message = "Deduções aplicadas com sucesso" });
        }
        catch (DbUpdateException)
        {
            await tx.RollbackAsync();
            return Conflict(new { message = "A operação já foi processada ou houve uma alteração concorrente" });
        }
    }
}
