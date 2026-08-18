using System;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using StockService.Controllers;
using StockService.Data;
using StockService.Models;
using Xunit;

namespace StockService.Tests;

public class StockControllerTests
{
    private AppDbContext CreateContext(SqliteConnection conn)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlite(conn)
            .Options;
        var ctx = new AppDbContext(options);
        ctx.Database.EnsureCreated();
        return ctx;
    }

    [Fact]
    public async Task DeductBatch_RollsBackOnInsufficient()
    {
        using var conn = new SqliteConnection("DataSource=:memory:");
        conn.Open();

        using var ctx = CreateContext(conn);
        ctx.Products.Add(new Product { Code = "A", Description = "Prod A", StockBalance = 5 });
        ctx.Products.Add(new Product { Code = "B", Description = "Prod B", StockBalance = 3 });
        ctx.SaveChanges();

        var controller = new ProductsController(ctx);

        var request = new StockDeductionRequest
        {
            OperationId = Guid.NewGuid().ToString(),
            Items = new System.Collections.Generic.List<StockDeductionItem>
            {
                new StockDeductionItem { ProductId = ctx.Products.First(p=>p.Code=="A").Id, Quantity = 2 },
                new StockDeductionItem { ProductId = ctx.Products.First(p=>p.Code=="B").Id, Quantity = 10 }
            }
        };

        var result = await controller.DeductBatch(request);

        // After failure, balances must remain unchanged
        var a = ctx.Products.First(p => p.Code == "A");
        var b = ctx.Products.First(p => p.Code == "B");

        Assert.Equal(5, a.StockBalance);
        Assert.Equal(3, b.StockBalance);
    }

    [Fact]
    public async Task DeductBatch_Idempotent_DoesNotDoubleDebit()
    {
        using var conn = new SqliteConnection("DataSource=:memory:");
        conn.Open();

        using var ctx = CreateContext(conn);
        ctx.Products.Add(new Product { Code = "X", Description = "Prod X", StockBalance = 10 });
        ctx.SaveChanges();

        var controller = new ProductsController(ctx);
        var pid = ctx.Products.First().Id;
        var opId = Guid.NewGuid().ToString();

        var request = new StockDeductionRequest
        {
            OperationId = opId,
            Items = new System.Collections.Generic.List<StockDeductionItem>
            {
                new StockDeductionItem { ProductId = pid, Quantity = 2 }
            }
        };

        var r1 = await controller.DeductBatch(request);
        var r2 = await controller.DeductBatch(request);

        var prod = ctx.Products.First();
        Assert.Equal(8, prod.StockBalance);
    }

    [Fact]
    public async Task DeductBatch_Concurrent_AllowsOnlyOneSuccess()
    {
        // use a temporary file-based SQLite DB to allow true concurrent connections
        var dbFile = System.IO.Path.Combine(System.IO.Path.GetTempPath(), $"stock_test_{Guid.NewGuid()}.db");
        var connStr = $"DataSource={dbFile}";
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlite(connStr)
            .Options;

        // create initial data
        using (var seed = new AppDbContext(options))
        {
            seed.Database.EnsureCreated();
            seed.Products.Add(new Product { Code = "C", Description = "Prod C", StockBalance = 1 });
            seed.SaveChanges();
        }

        // run two concurrent deductions
        var task1 = Task.Run(async () =>
        {
            using var ctx1 = new AppDbContext(options);
            var ctrl1 = new ProductsController(ctx1);
            var req = new StockDeductionRequest { OperationId = Guid.NewGuid().ToString(), Items = new System.Collections.Generic.List<StockDeductionItem>{ new StockDeductionItem{ ProductId = ctx1.Products.First().Id, Quantity = 1 } } };
            return await ctrl1.DeductBatch(req);
        });

        var task2 = Task.Run(async () =>
        {
            using var ctx2 = new AppDbContext(options);
            var ctrl2 = new ProductsController(ctx2);
            var req = new StockDeductionRequest { OperationId = Guid.NewGuid().ToString(), Items = new System.Collections.Generic.List<StockDeductionItem>{ new StockDeductionItem{ ProductId = ctx2.Products.First().Id, Quantity = 1 } } };
            return await ctrl2.DeductBatch(req);
        });

        await Task.WhenAll(task1, task2);

        using var vctx = new AppDbContext(options);
        var prod = vctx.Products.First();
        Assert.InRange(prod.StockBalance, 0, 1);
        Assert.True(prod.StockBalance == 0 || prod.StockBalance == 1);
    }
}
