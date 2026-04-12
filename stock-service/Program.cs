using Microsoft.EntityFrameworkCore;
using StockService.Data;

var builder = WebApplication.CreateBuilder(args);

// ✅ 1. CORS - LIBERAR ANGULAR
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyMethod()
              .AllowAnyHeader());
});

// ✅ 2. Banco de Dados (SQLite)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// ✅ 3. HTTP (não HTTPS) para desenvolvimento
app.UseRouting();

// ✅ 4. CORS DEVE VIR DEPOIS DE UseRouting E ANTES DE UseAuthorization
app.UseCors("AllowAngular");

app.UseAuthorization();
app.MapControllers();

// ✅ 5. Forçar URL HTTP
app.Urls.Add("http://localhost:5083");

app.Run();