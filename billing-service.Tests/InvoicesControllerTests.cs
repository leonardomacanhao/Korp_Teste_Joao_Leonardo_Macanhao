using System;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using BillingService.Controllers;
using BillingService.Data;
using BillingService.Models;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace BillingService.Tests;

class SimpleHttpClientFactory : IHttpClientFactory
{
    private readonly HttpClient _client;
    public SimpleHttpClientFactory(HttpClient client) => _client = client;
    public HttpClient CreateClient(string name) => _client;
}

class AlwaysFailHandler : HttpMessageHandler
{
    private readonly HttpStatusCode _status;
    public AlwaysFailHandler(HttpStatusCode status = HttpStatusCode.ServiceUnavailable) => _status = status;
    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        var resp = new HttpResponseMessage(_status)
        {
            Content = new StringContent("Service unavailable")
        };
        return Task.FromResult(resp);
    }
}

class SucceedHandler : HttpMessageHandler
{
    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        var resp = new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new StringContent("{\"message\":\"Deduções aplicadas com sucesso\"}", Encoding.UTF8, "application/json")
        };
        return Task.FromResult(resp);
    }
}

class BadReqHandler : HttpMessageHandler
{
    private readonly string _msg;
    public BadReqHandler(string msg = "Saldo insuficiente") => _msg = msg;
    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        var resp = new HttpResponseMessage(HttpStatusCode.BadRequest)
        {
            Content = new StringContent("{\"message\":\"" + _msg + "\"}", Encoding.UTF8, "application/json")
        };
        return Task.FromResult(resp);
    }
}

public class InvoicesControllerTests
{
    private BillingDbContext CreateContext(SqliteConnection conn)
    {
        var options = new DbContextOptionsBuilder<BillingDbContext>()
            .UseSqlite(conn)
            .Options;
        var ctx = new BillingDbContext(options);
        ctx.Database.EnsureCreated();
        return ctx;
    }

    [Fact]
    public async Task PrintInvoice_StockUnavailable_KeepsInvoiceOpen()
    {
        using var conn = new SqliteConnection("DataSource=:memory:");
        conn.Open();

        using var ctx = CreateContext(conn);
        var invoice = new Invoice { Status = "Aberta", CreatedAt = DateTime.Now };
        invoice.Items.Add(new InvoiceItem { ProductId = 1, Quantity = 1 });
        ctx.Invoices.Add(invoice);
        ctx.SaveChanges();

        var handler = new AlwaysFailHandler(HttpStatusCode.ServiceUnavailable);
        var client = new HttpClient(handler) { BaseAddress = new Uri("http://localhost:5083") };
        var factory = new SimpleHttpClientFactory(client);

        var controller = new InvoicesController(ctx, factory, NullLogger<InvoicesController>.Instance);

        var result = await controller.PrintInvoice(invoice.Id);

        var inv = ctx.Invoices.First(i => i.Id == invoice.Id);
        Assert.Equal("Aberta", inv.Status);
    }

    [Fact]
    public async Task PrintInvoice_StockSuccess_ClosesInvoice()
    {
        using var conn = new SqliteConnection("DataSource=:memory:");
        conn.Open();

        using var ctx = CreateContext(conn);
        var invoice = new Invoice { Status = "Aberta", CreatedAt = DateTime.Now };
        invoice.Items.Add(new InvoiceItem { ProductId = 1, Quantity = 1 });
        ctx.Invoices.Add(invoice);
        ctx.SaveChanges();

        var handler = new SucceedHandler();
        var client = new HttpClient(handler) { BaseAddress = new Uri("http://localhost:5083") };
        var factory = new SimpleHttpClientFactory(client);

        var controller = new InvoicesController(ctx, factory, NullLogger<InvoicesController>.Instance);

        var result = await controller.PrintInvoice(invoice.Id);

        var inv = ctx.Invoices.First(i => i.Id == invoice.Id);
        Assert.Equal("Fechada", inv.Status);
    }

    [Fact]
    public async Task PrintInvoice_StockBadRequest_KeepsInvoiceOpen()
    {
        using var conn = new SqliteConnection("DataSource=:memory:");
        conn.Open();

        using var ctx = CreateContext(conn);
        var invoice = new Invoice { Status = "Aberta", CreatedAt = DateTime.Now };
        invoice.Items.Add(new InvoiceItem { ProductId = 1, Quantity = 1 });
        ctx.Invoices.Add(invoice);
        ctx.SaveChanges();

        var handler = new BadReqHandler("Saldo insuficiente");
        var client = new HttpClient(handler) { BaseAddress = new Uri("http://localhost:5083") };
        var factory = new SimpleHttpClientFactory(client);

        var controller = new InvoicesController(ctx, factory, NullLogger<InvoicesController>.Instance);

        var result = await controller.PrintInvoice(invoice.Id);

        var inv = ctx.Invoices.First(i => i.Id == invoice.Id);
        Assert.Equal("Aberta", inv.Status);
    }
}
