using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BillingService.Data;
using BillingService.Models;

namespace BillingService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InvoicesController : ControllerBase
{
    private readonly BillingDbContext _context;
    private readonly IHttpClientFactory _clientFactory;

    public InvoicesController(BillingDbContext context, IHttpClientFactory clientFactory)
    {
        _context = context;
        _clientFactory = clientFactory;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Invoice>>> GetInvoices()
    {
        var invoices = await _context.Invoices
            .Include(i => i.Items)
            .ToListAsync();
        return Ok(invoices);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Invoice>> GetInvoice(int id)
    {
        var invoice = await _context.Invoices
            .Include(i => i.Items)
            .FirstOrDefaultAsync(i => i.Id == id);
        
        if (invoice == null) return NotFound();
        return Ok(invoice);
    }

    [HttpPost]
    public async Task<ActionResult<Invoice>> CreateInvoice([FromBody] List<InvoiceItem> items)
    {
        if (items == null || items.Count == 0)
            return BadRequest(new { message = "A nota deve ter pelo menos um item." });

        var count = await _context.Invoices.CountAsync();
        var newNumber = $"NF-{(count + 1).ToString("D4")}";

        var invoice = new Invoice
        {
            Number = newNumber,
            Status = "Aberta",
            CreatedAt = DateTime.Now,
            Items = items
        };

        _context.Invoices.Add(invoice);
        await _context.SaveChangesAsync();

        var created = await _context.Invoices
            .Include(i => i.Items)
            .FirstAsync(i => i.Id == invoice.Id);

        return CreatedAtAction(nameof(GetInvoices), new { id = created.Id }, created);
    }

    [HttpPost("{id}/print")]
    public async Task<IActionResult> PrintInvoice(int id)
    {
        var invoice = await _context.Invoices
            .Include(i => i.Items)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (invoice == null) return NotFound();
        if (invoice.Status == "Fechada") return BadRequest(new { message = "Nota já fechada." });

        try
        {
            var client = _clientFactory.CreateClient("StockService");

            foreach (var item in invoice.Items)
            {
                var response = await client.PutAsJsonAsync(
                    $"/api/products/{item.ProductId}/deduct", 
                    item.Quantity
                );

                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    throw new Exception($"Produto {item.ProductId}: {response.StatusCode} - {errorContent}");
                }
            }

            invoice.Status = "Fechada";
            await _context.SaveChangesAsync();

            return Ok(new { message = "Nota impressa e estoque atualizado!", invoice });
        }
        catch (HttpRequestException ex)
        {
            Console.WriteLine($"[ERRO REDE] {ex.Message}");
            return StatusCode(502, new { 
                error = "Falha na comunicação com o serviço de estoque.",
                details = "Verifique se o Stock Service está rodando."
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERRO GERAL] {ex.Message}");
            return StatusCode(500, new { error = "Erro ao processar nota.", details = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteInvoice(int id)
    {
        Console.WriteLine($"[DELETE] Tentando excluir NF ID: {id}");
        
        var invoice = await _context.Invoices
            .Include(i => i.Items)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (invoice == null) 
        {
            Console.WriteLine($"[DELETE] NF {id} não encontrada.");
            return NotFound(new { message = "Nota não encontrada." });
        }
        
        if (invoice.Status == "Fechada")
        {
            Console.WriteLine($"[DELETE] NF {id} está fechada. Bloqueado.");
            return BadRequest(new { message = "Não é possível excluir uma nota já fechada/impressa." });
        }

        try
        {
            if (invoice.Items.Any())
            {
                _context.InvoiceItems.RemoveRange(invoice.Items);
            }
            
            _context.Invoices.Remove(invoice);
            await _context.SaveChangesAsync();
            
            Console.WriteLine($"[DELETE] NF {id} excluída com sucesso.");
            return NoContent();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[DELETE] ERRO CRÍTICO: {ex.Message}");
            return StatusCode(500, new { message = "Erro interno ao excluir nota.", details = ex.Message });
        }
    }
}