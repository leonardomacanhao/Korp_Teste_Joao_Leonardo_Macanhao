using Microsoft.EntityFrameworkCore;
using BillingService.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers(); // ← ESSENCIAL: Habilita os Controllers
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyMethod()
              .AllowAnyHeader());
});

builder.Services.AddDbContext<BillingDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddHttpClient("StockService", client =>
{
    var stockUrl = builder.Configuration["ServiceUrls:StockService"] ?? "http://localhost:5083";
    client.BaseAddress = new Uri(stockUrl);
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseRouting();

app.UseCors("AllowAngular");

app.UseAuthorization();

app.MapControllers();

app.Urls.Clear();
app.Urls.Add("http://localhost:5002");

app.Run();