using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BillingService.Data;
using BillingService.Models;
using System.Text.Json;

namespace BillingService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InvoicesController : ControllerBase
{
    private readonly BillingDbContext _context;
    private readonly IHttpClientFactory _httpClientFactory;

    public InvoicesController(BillingDbContext context, IHttpClientFactory httpClientFactory)
    {
        _context = context;
        _httpClientFactory = httpClientFactory;
    }

    // Listar todas as notas
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Invoice>>> GetInvoices()
    {
        return await _context.Invoices
                             .Include(i => i.Items)
                             .ToListAsync();
    }

    // Criar nova nota
    [HttpPost]
    public async Task<ActionResult<Invoice>> CreateInvoice([FromBody] List<int> productIdsWithQty)
    {
        if (productIdsWithQty == null || productIdsWithQty.Count == 0)
            return BadRequest("Informe os IDs dos produtos e quantidades.");

        var lastInvoice = await _context.Invoices.OrderByDescending(i => i.Id).FirstOrDefaultAsync();
        var nextNumber = $"NF-{(lastInvoice?.Id + 1):D4}";

        var invoice = new Invoice
        {
            Number = nextNumber,
            Status = "Aberta",
            Items = productIdsWithQty.Select(pid => new InvoiceItem { ProductId = pid, Quantity = 1 }).ToList()
        };

        _context.Invoices.Add(invoice);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetInvoices), new { id = invoice.Id }, invoice);
    }

    // Imprimir/Finalizar nota fiscal
    [HttpPost("{id}/print")]
    public async Task<ActionResult<Invoice>> PrintInvoice(int id)
    {
        var invoice = await _context.Invoices
                                    .Include(i => i.Items)
                                    .FirstOrDefaultAsync(i => i.Id == id);

        if (invoice == null)
            return NotFound("Nota fiscal não encontrada.");

        if (invoice.Status == "Fechada")
            return BadRequest("Nota fiscal já foi fechada.");

        if (invoice.Status != "Aberta")
            return BadRequest($"Nota fiscal em status inválido: {invoice.Status}");

        try
        {
            // Deduzir estoque no stock-service para cada item
            var client = _httpClientFactory.CreateClient();
            client.BaseAddress = new Uri("https://localhost:7192"); // URL do stock-service

            foreach (var item in invoice.Items)
            {
                var deductUrl = $"/api/products/{item.ProductId}/deduct";
                var content = new StringContent(
                    JsonSerializer.Serialize(item.Quantity),
                    System.Text.Encoding.UTF8,
                    "application/json");

                var response = await client.PutAsync(deductUrl, content);

                if (!response.IsSuccessStatusCode)
                {
                    return StatusCode(502, "Erro ao deduzir estoque do produto. Stock-Service indisponível.");
                }
            }

            // Atualizar status da nota para "Fechada"
            invoice.Status = "Fechada";
            _context.Invoices.Update(invoice);
            await _context.SaveChangesAsync();

            return Ok(invoice);
        }
        catch (HttpRequestException)
        {
            return StatusCode(502, "Serviço de Estoque indisponível. A nota permanece Aberta.");
        }
    }
}
