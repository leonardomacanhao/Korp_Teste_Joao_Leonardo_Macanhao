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
    private readonly ILogger<InvoicesController> _logger;

    public InvoicesController(
        BillingDbContext context,
        IHttpClientFactory clientFactory,
        ILogger<InvoicesController> logger)
    {
        _context = context;
        _clientFactory = clientFactory;
        _logger = logger;
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
    public async Task<ActionResult<Invoice>> CreateInvoice([FromBody] List<CreateInvoiceItemRequest> items)
    {
        if (items.Count == 0)
            return BadRequest(new { message = "A nota deve ter pelo menos um item." });

        List<InvoiceItem> normalizedItems;
        try
        {
            normalizedItems = items
                .GroupBy(item => item.ProductId)
                .Select(group => new InvoiceItem
                {
                    ProductId = group.Key,
                    Quantity = checked(group.Sum(item => item.Quantity))
                })
                .ToList();
        }
        catch (OverflowException)
        {
            return BadRequest(new { message = "A quantidade total informada é inválida." });
        }

        var invoice = new Invoice
        {
            Status = InvoiceStatuses.Open,
            CreatedAt = DateTime.UtcNow,
            Items = normalizedItems
        };

        _context.Invoices.Add(invoice);
        await _context.SaveChangesAsync();

        invoice.Number = $"NF-{invoice.Id:D4}";
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetInvoice), new { id = invoice.Id }, invoice);
    }

    [HttpPost("{id}/print")]
    public async Task<IActionResult> PrintInvoice(int id)
    {
        var invoice = await _context.Invoices
            .Include(i => i.Items)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (invoice == null) return NotFound(new { message = "Nota não encontrada." });
        if (invoice.Status == InvoiceStatuses.Closed)
            return Conflict(new { message = "Nota já fechada." });

        try
        {
            var client = _clientFactory.CreateClient("StockService");

            var operationId = $"billing-invoice-{invoice.Id}";
            var payload = new
            {
                OperationId = operationId,
                Items = invoice.Items.Select(i => new { ProductId = i.ProductId, Quantity = i.Quantity }).ToList()
            };

            var response = await client.PostAsJsonAsync("/api/products/deductions", payload);

            if (!response.IsSuccessStatusCode)
            {
                if ((int)response.StatusCode >= 500)
                {
                    return StatusCode(502, new { error = "Serviço de estoque indisponível.", details = await response.Content.ReadAsStringAsync() });
                }

                var err = await response.Content.ReadAsStringAsync();
                return BadRequest(new { message = "Não foi possível debitar estoque.", details = err });
            }

            // Apenas marcar como fechada após sucesso do débito atômico
            invoice.Status = InvoiceStatuses.Closed;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Nota impressa e estoque atualizado!", invoice });
        }
        catch (HttpRequestException ex)
        {
            _logger.LogWarning(ex, "Falha ao acessar o Stock Service ao imprimir a nota {InvoiceId}", id);
            return StatusCode(502, new { 
                error = "Falha na comunicação com o serviço de estoque.",
                details = "Verifique se o Stock Service está rodando."
            });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteInvoice(int id)
    {
        var invoice = await _context.Invoices
            .Include(i => i.Items)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (invoice == null) 
        {
            return NotFound(new { message = "Nota não encontrada." });
        }
        
        if (invoice.Status == InvoiceStatuses.Closed)
        {
            return Conflict(new { message = "Não é possível excluir uma nota já fechada/impressa." });
        }

        _context.Invoices.Remove(invoice);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
