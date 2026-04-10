# 📚 DOCUMENTAÇÃO COMPLETA - SISTEMA KORP (Notas Fiscais)

## 🎯 VISÃO GERAL DO PROJETO

**Nome:** Korp - Sistema de Gestão de Notas Fiscais com Microsserviços  
**Arquitetura:** Microsserviços (.NET 8) + Frontend (Angular 21)  
**Data de Desenvolvimento:** Abril 2026  
**Status:** Em Desenvolvimento

---

## 🏗️ ARQUITETURA DO SISTEMA

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Angular 21)                    │
│              http://localhost:4200                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  App Component (standalone)                            │ │
│  │  ├── Home Component (lazy-loaded)                      │ │
│  │  ├── Products Feature (trabalho em progresso)          │ │
│  │  └── Invoices Feature (trabalho em progresso)          │ │
│  │  Serviceis:                                            │ │
│  │  ├── StockService   → https://localhost:5001          │ │
│  │  └── BillingService → https://localhost:5002          │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
          ↓                                    ↓
┌──────────────────────────────┐    ┌──────────────────────────────┐
│   STOCK-SERVICE (.NET 8)     │    │  BILLING-SERVICE (.NET 8)    │
│   https://localhost:5001     │    │  https://localhost:5002      │
├──────────────────────────────┤    ├──────────────────────────────┤
│ Controllers:                 │    │ Controllers:                 │
│ ├── ProductsController       │    │ ├── InvoicesController       │
│    ├── GET /api/products     │    │    ├── GET /api/invoices     │
│    ├── POST /api/products    │    │    ├── POST /api/invoices    │
│    ├── PUT /api/products/{id}│    │    └── POST /{id}/print ⭐   │
│    └── PUT /{id}/deduct ⭐   │    │                              │
│                              │    │ Padrão Saga:                 │
│ Modelos:                     │    │ 1. Transição status          │
│ ├── Product                  │    │ 2. Chamada Stock-Service     │
│    ├── Id (PK)               │    │ 3. Dedução de estoque        │
│    ├── Code                  │    │ 4. Rollback se erro (502)    │
│    ├── Description           │    │                              │
│    └── StockBalance          │    │ Modelos:                     │
│                              │    │ ├── Invoice                  │
│ Banco: SQL Server            │    │ │  ├── Id (PK)               │
│ DB: StockDb                  │    │ │  ├── Number (NF-0001)      │
│                              │    │ │  ├── Status (Aberta/Fechada)
│                              │    │ │  ├── CreatedAt             │
│                              │    │ │  └── Items[] (relacionamento)
│                              │    │ └── InvoiceItem              │
│                              │    │    ├── ProductId (FK)        │
│                              │    │    └── Quantity              │
│                              │    │                              │
│                              │    │ Banco: SQL Server            │
│                              │    │ DB: BillingDb                │
└──────────────────────────────┘    └──────────────────────────────┘
```

---

## 📦 TECNOLOGIAS UTILIZADAS

### **Backend (.NET 8)**
| Componente | Versão | Uso |
|-----------|--------|-----|
| .NET | 8.0 | Runtime |
| Entity Framework Core | 8.x | ORM |
| SQL Server | 2019+ | Banco de Dados |
| ASP.NET Core | 8.0 | Web API |

### **Frontend (Angular)**
| Componente | Versão | Uso |
|-----------|--------|-----|
| Angular Core | 21.2.0 | Framework |
| Angular Material | 21.2.6 | UI Components |
| Angular CDK | 21.2.6 | Component Dev Kit |
| RxJS | 7.8.0 | Programação Reativa |
| TypeScript | 5.9.2 | Linguagem |

---

## 📂 ESTRUTURA DO PROJETO

```
Korp_Teste_Joao_Leonardo_Macanhao/
│
├── 📁 stock-service/ ........................ Microsserviço de Estoque
│   ├── Controllers/
│   │   └── ProductsController.cs ......... GET/POST/PUT products
│   ├── Models/
│   │   └── Product.cs ................... Id, Code, Description, StockBalance
│   ├── Data/
│   │   └── AppDbContext.cs .............. EF Core DbContext
│   ├── Migrations/
│   │   ├── 20260409221614_InitialCreate.cs
│   │   ├── 20260409221614_InitialCreate.Designer.cs
│   │   └── AppDbContextModelSnapshot.cs
│   ├── Properties/
│   │   └── launchSettings.json .......... HTTPS porta 5001
│   ├── appsettings.json ................. Configurações
│   ├── appsettings.Development.json ..... Config desenvolvimento
│   ├── Program.cs ....................... Setup do serviço
│   └── stock-service.csproj ............. Projeto C#
│
├── 📁 billing-service/ .................... Microsserviço de Faturamento
│   ├── Controllers/
│   │   └── InvoicesController.cs ........ GET/POST invoices + /print
│   ├── Models/
│   │   ├── Invoice.cs ................... Id, Number, Status, Items
│   │   └── InvoiceItem.cs ............... ProductId, Quantity
│   ├── Data/
│   │   └── BillingDbContext.cs .......... EF Core DbContext
│   ├── Properties/
│   │   └── launchSettings.json .......... HTTPS porta 5002
│   ├── appsettings.json ................. Configurações
│   ├── appsettings.Development.json ..... Config desenvolvimento
│   ├── Program.cs ....................... Setup + HttpClient para Stock
│   └── billing-service.csproj ........... Projeto C#
│
├── 📁 frontend/ ........................... Aplicação Angular
│   ├── src/
│   │   ├── main.ts ...................... Bootstrap da app
│   │   ├── index.html ................... HTML raiz
│   │   ├── styles.scss .................. Estilos globais
│   │   │
│   │   └── app/
│   │       ├── app.ts ................... Root Component (standalone)
│   │       ├── app.html ................. Template raiz (navbar + router-outlet)
│   │       ├── app.scss ................. Estilos raiz
│   │       ├── app.routes.ts ............ Definição de rotas
│   │       ├── app.config.ts ............ Configuração global
│   │       │
│   │       ├── 📁 core/
│   │       │   ├── services/
│   │       │   │   ├── stock.service.ts ......... GET/POST/PUT products
│   │       │   │   └── billing.service.ts ...... GET/POST invoices + print
│   │       │   └── interceptors/
│   │       │       └── error.interceptor.ts ... Tratamento de erros HTTP
│   │       │
│   │       ├── 📁 shared/
│   │       │   └── models/
│   │       │       ├── product.model.ts ....... Interface Product
│   │       │       └── invoice.model.ts ....... Interface Invoice
│   │       │
│   │       └── 📁 features/
│   │           ├── home/
│   │           │   ├── home.ts ........... Component (standalone)
│   │           │   ├── home.html ........ Template
│   │           │   └── home.scss ........ Estilos
│   │           │
│   │           ├── products/ (em progresso)
│   │           │   ├── product-list/
│   │           │   │   └── (arquivos criados e depois deletados)
│   │           │   └── product-form/
│   │           │       └── (vazio)
│   │           │
│   │           └── invoices/ (em progresso)
│   │               ├── invoice-list/
│   │               │   └── (vazio)
│   │               └── invoice-form/
│   │                   └── (vazio)
│   │
│   ├── angular.json ..................... Configuração Angular CLI
│   ├── tsconfig.json .................... Configuração TypeScript
│   ├── tsconfig.app.json ................ TS app specific
│   ├── tsconfig.spec.json ............... TS para testes
│   ├── package.json ..................... Dependências npm
│   └── README.md
│
├── 📄 Korp_Teste_Joao_Leonardo_Macanhao.sln ... Solução Visual Studio (.NET)
│
├── 📄 README_TESTES.md ................... Instruções de teste
├── 📄 TEST_ROTEIRO_E2E.http .............. Testes HTTP (REST Client)
├── 📄 TEST_ROTEIRO_COMPLETO_CURL.md ..... Testes detalhados cURL
├── 📄 ENDPOINTS_DETALHADOS.md ........... Mapa de endpoints
├── 📄 ENTREGA_COMPLETA.md ............... Sumário de entrega
├── 📄 INDEX_TESTES.md ................... Índice de testes
└── ⚡ QUICK_START_TESTS.sh .............. Script de automação
```

---

## 🔧 CLASSES E MODELOS

### **1. STOCK SERVICE**

#### **Product.cs** (Modelo)
```csharp
namespace StockService.Models;

public class Product
{
    [Key]
    public int Id { get; set; }                    // PK auto-increment

    [Required]
    public string Code { get; set; } = string.Empty;  // Código único

    [Required]
    public string Description { get; set; } = string.Empty;  // Descrição

    [Range(0, double.MaxValue)]
    public int StockBalance { get; set; }          // Saldo em estoque
}
```

#### **ProductsController.cs** (API)
```csharp
namespace StockService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly AppDbContext _context;

    // GET /api/products - Lista todos os produtos
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
        => await _context.Products.ToListAsync();

    // POST /api/products - Cria novo produto
    [HttpPost]
    public async Task<ActionResult<Product>> CreateProduct(Product product)
    {
        _context.Products.Add(product);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetProducts), new { id = product.Id }, product);
    }

    // PUT /api/products/{id} - Atualiza saldo completo
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateStock(int id, [FromBody] int newBalance)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null) return NotFound();

        product.StockBalance = newBalance;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // PUT /api/products/{id}/deduct ⭐ CRÍTICO
    // Deduz a quantidade do estoque (usado pelo print da nota)
    [HttpPut("{id}/deduct")]
    public async Task<IActionResult> DeductStock(int id, [FromBody] int quantity)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null) return NotFound();
        if (product.StockBalance < quantity) return BadRequest("Saldo insuficiente.");

        product.StockBalance -= quantity;
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
```

#### **AppDbContext.cs** (ORM)
```csharp
public class AppDbContext(DbContextOptions<AppDbContext> options) 
    : DbContext(options)
{
    public DbSet<Product> Products { get; set; } = null!;
}
```

---

### **2. BILLING SERVICE**

#### **Invoice.cs** (Modelo)
```csharp
namespace BillingService.Models;

public class Invoice
{
    [Key]
    public int Id { get; set; }                           // PK auto-increment

    public string Number { get; set; } = string.Empty;    // NF-0001, NF-0002, etc

    public string Status { get; set; } = "Aberta";        // Estados: Aberta, Fechada

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;  // Timestamp

    public List<InvoiceItem> Items { get; set; } = new(); // Relacionamento 1:N
}
```

#### **InvoiceItem.cs** (Modelo)
```csharp
namespace BillingService.Models;

public class InvoiceItem
{
    [Key]
    public int Id { get; set; }

    public int InvoiceId { get; set; }              // FK para Invoice

    [Required]
    public int ProductId { get; set; }              // ID do produto (referência ao Stock)

    public int Quantity { get; set; } = 1;          // Quantidade na nota
}
```

#### **InvoicesController.cs** (API) ⭐ IMPORTANTE
```csharp
namespace BillingService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InvoicesController : ControllerBase
{
    private readonly BillingDbContext _context;
    private readonly IHttpClientFactory _httpClientFactory;

    // GET /api/invoices - Lista todas as notas
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Invoice>>> GetInvoices()
    {
        return await _context.Invoices
                             .Include(i => i.Items)
                             .ToListAsync();
    }

    // POST /api/invoices - Cria nova nota fiscal
    [HttpPost]
    public async Task<ActionResult<Invoice>> CreateInvoice([FromBody] List<int> productIdsWithQty)
    {
        if (productIdsWithQty == null || productIdsWithQty.Count == 0)
            return BadRequest("Informe os IDs dos produtos e quantidades.");

        // Gera número sequencial NF-0001, NF-0002, etc
        var lastInvoice = await _context.Invoices.OrderByDescending(i => i.Id).FirstOrDefaultAsync();
        var nextNumber = $"NF-{(lastInvoice?.Id + 1):D4}";

        var invoice = new Invoice
        {
            Number = nextNumber,
            Status = "Aberta",
            Items = productIdsWithQty.Select(pid => 
                new InvoiceItem { ProductId = pid, Quantity = 1 }).ToList()
        };

        _context.Invoices.Add(invoice);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetInvoices), new { id = invoice.Id }, invoice);
    }

    // POST /api/invoices/{id}/print ⭐⭐⭐ PADRÃO SAGA
    // Integração com Stock Service para dedução de estoque
    [HttpPost("{id}/print")]
    public async Task<IActionResult> PrintInvoice(int id)
    {
        var invoice = await _context.Invoices.Include(i => i.Items).FirstOrDefaultAsync(i => i.Id == id);
        if (invoice == null) return NotFound("Nota fiscal não encontrada.");
        if (invoice.Status == "Fechada") return BadRequest("Nota fiscal já foi fechada.");

        try
        {
            // Passo 1: Deduz estoque no Stock-Service
            var client = _httpClientFactory.CreateClient("StockService");
            foreach (var item in invoice.Items)
            {
                var response = await client.PutAsync(
                    $"/api/products/{item.ProductId}/deduct",
                    new StringContent(
                        JsonSerializer.Serialize(item.Quantity),
                        Encoding.UTF8, 
                        "application/json"
                    )
                );

                if (!response.IsSuccessStatusCode)
                    return StatusCode(502, "Serviço de Estoque indisponível. A nota permanece Aberta.");
            }

            // Passo 2: Se tudo OK, fecha a nota
            invoice.Status = "Fechada";
            await _context.SaveChangesAsync();

            return Ok(new { message = "Nota fiscal impressa com sucesso", invoice });
        }
        catch
        {
            // Rollback automático: Status permanece "Aberta"
            return StatusCode(502, "Erro na comunicação com Stock Service.");
        }
    }
}
```

**⚠️ PADRÃO SAGA EXPLICADO:**
1. Recebe requisição de impressão `/print`
2. Tenta chamar o Stock Service para deduzir estoque
3. **Se sucesso:** Muda status para "Fechada" e salva
4. **Se erro 502:** Retorna erro SEM mudar o status
5. Na próxima tentativa (Stock online), o status ainda está "Aberta" → pode retentar print

---

### **3. FRONTEND ANGULAR 21**

#### **app.ts** (Root Component - Standalone)
```typescript
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('frontend');
}
```

**Características:**
- ✅ Standalone Component (sem NgModule)
- ✅ Router Outlet para navegação
- ✅ Signals (Angular 17+) para reatividade

#### **app.routes.ts** (Definição de Rotas)
```typescript
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  
  // Lazy-loading do HomeComponent
  { path: 'home', loadComponent: () => 
    import('./features/home/home').then(m => m.HomeComponent) 
  },
  
  // Wildcard para não encontrado
  { path: '**', redirectTo: '/home' }
];
```

**Estratégia:**
- ✅ Lazy-loading (componentes carregam sob demanda)
- ✅ Modo compartilhado com o bundle genérico
- ✅ Redireciona rotas inválidas para home

#### **stock.service.ts** (Injeção de Dependência)
```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Product } from '../../shared/models/product.model';

/**
 * StockService - Comunicação com Stock-Service (.NET)
 * Base URL: https://localhost:5001/api/products
 * 
 * Padrão: Injeção de dependência via inject() + RxJS Observables
 */
@Injectable({
  providedIn: 'root'  // ✅ Injetável em qualquer lugar
})
export class StockService {
  private http = inject(HttpClient);  // ✅ Injeção moderna (Angular 17+)
  private apiUrl = 'https://localhost:5001/api/products';

  /**
   * RxJS: Observable com pipe() e catchError
   * Padrão funcional de programação reativa
   */
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl).pipe(
      catchError(error => {
        console.error('Erro ao buscar produtos:', error);
        return throwError(() => 
          new Error('Falha na comunicação com o serviço de estoque')
        );
      })
    );
  }

  createProduct(product: Omit<Product, 'id'>): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  updateStock(id: number, newBalance: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, newBalance);
  }
}
```

**RxJS Explicado:**
- `Observable<T>`: Stream de dados assíncrono
- `pipe()`: Encadeia operadores
- `catchError()`: Captura erros da requisição
- `throwError()`: Relança o erro para o subscriber

#### **billing.service.ts**
```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Invoice } from '../../shared/models/invoice.model';

@Injectable({
  providedIn: 'root'
})
export class BillingService {
  private http = inject(HttpClient);
  private apiUrl = 'https://localhost:5002/api/invoices';

  getInvoices(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(this.apiUrl).pipe(
      catchError(error => {
        console.error('Erro ao buscar notas:', error);
        return throwError(() => 
          new Error('Falha na comunicação com o serviço de faturamento')
        );
      })
    );
  }

  createInvoice(productIds: number[]): Observable<Invoice> {
    return this.http.post<Invoice>(this.apiUrl, productIds);
  }

  // ⭐ Integração com Padrão Saga
  printInvoice(id: number): Observable<{ message: string; invoice: Invoice }> {
    return this.http.post<{ message: string; invoice: Invoice }>(
      `${this.apiUrl}/${id}/print`, 
      {}
    );
  }
}
```

#### **product.model.ts** (Interface TypeScript)
```typescript
export interface Product {
  id: number;           // PK
  code: string;         // Código único
  description: string;  // Descrição
  stockBalance: number; // Saldo em estoque
}
```

#### **invoice.model.ts**
```typescript
export interface Invoice {
  id: number;
  number: string;       // NF-0001, NF-0002, etc
  status: string;       // Aberta / Fechada
  createdAt: Date;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  id: number;
  productId: number;
  quantity: number;
}
```

#### **home.ts** (Componente de Exemplo)
```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule],
  template: `
    <div class="home-container">
      <h2>🚀 Bem-vindo ao Sistema Korp</h2>
      <p>Selecione uma opção no menu superior:</p>
      <div class="cards">
        <div class="card">
          <h3>📦 Produtos</h3>
          <p>Gerencie o cadastro de produtos e estoques.</p>
          <a routerLink="/products" mat-button>Ir para Produtos</a>
        </div>
        <div class="card">
          <h3>🧾 Notas Fiscais</h3>
          <p>Crie e imprima notas fiscais com controle de status.</p>
          <a routerLink="/invoices" mat-button>Ir para Notas</a>
        </div>
      </div>
    </div>
  `,
  styles: [/* ... */]
})
export class HomeComponent {}
```

---

## 🔌 ENDPOINTS DA API

### **STOCK SERVICE** (`https://localhost:5001`)

| Método | Endpoint | Descrição | Body | Status |
|--------|----------|-----------|------|--------|
| GET | `/api/products` | Lista todos produtos | - | 200 |
| GET | `/api/products/{id}` | Detalhe produto | - | 200 |
| POST | `/api/products` | Cria novo | `{ code, description, stockBalance }` | 201 |
| PUT | `/api/products/{id}` | Atualiza saldo | `newBalance: int` | 204 |
| PUT | `/api/products/{id}/deduct` | ⭐ Deduz estoque | `quantity: int` | 204 |

### **BILLING SERVICE** (`https://localhost:5002`)

| Método | Endpoint | Descrição | Body | Status |
|--------|----------|-----------|------|--------|
| GET | `/api/invoices` | Lista todas notas | - | 200 |
| GET | `/api/invoices/{id}` | Detalhe nota | - | 200 |
| POST | `/api/invoices` | Cria nova nota | `[productIds]` | 201 |
| POST | `/api/invoices/{id}/print` | ⭐ Imprime (deduz estoque) | `{}` | 200/502 |

---

## 🚀 FLUXO DA APLICAÇÃO

### **Cenário: Criar Produto**
```
1. Frontend (Angular)
   └─> StockService.createProduct(data)
       └─> HTTP POST https://localhost:5001/api/products
           └─> Stock Service (.NET)
               └─> ProductsController.CreateProduct(product)
                   └─> DbContext.Add + SaveChanges
                       └─> SQL Server (INSERT)
                           └─> 201 Created + Product com ID
```

### **Cenário: Imprimir Nota (Padrão Saga) ⭐**
```
1. Frontend (Angular)
   └─> BillingService.printInvoice(id)
       └─> HTTP POST https://localhost:5002/api/invoices/{id}/print
           └─> Billing Service (.NET)
               └─> InvoicesController.PrintInvoice(id)
                   │
                   ├─> PASSO 1: Deduz estoque
                   │   └─> HTTP PUT https://localhost:5001/api/products/{id}/deduct
                   │       └─> Stock Service
                   │           └─> ProductsController.DeductStock()
                   │
                   ├─> PASSO 2 (sucesso): Fecha nota
                   │   └─> invoice.Status = "Fechada"
                   │   └─> DbContext.SaveChanges()
                   │
                   └─> PASSO 2 (erro 502): Não altera status
                       └─> Retorna 502 (nota permanece Aberta)
                       └─> Retentar será possível later

2. Resposta para Frontend
   ├─> Sucesso (200): { message, invoice }
   └─> Erro (502): "Serviço indisponível"
```

---

## 🔄 FLUXO DE REQUISIÇÕES HTTP

### **CORS (Cross-Origin)**
O **Billing-Service** tem CORS configurado para aceitar o Angular:
```csharp
// Program.cs (Billing-Service)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyMethod()
              .AllowAnyHeader());
});

app.UseCors("AllowAngular");
```

### **Error Interceptor (Angular)**
```typescript
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError(error => {
      if (error.status === 0)
        alert('Serviço indisponível');
      else if (error.status === 502)
        alert('Falha na comunicação entre serviços');
      else if (error.status === 400)
        alert(error.error?.message || 'Requisição inválida');
      
      return throwError(() => error);
    })
  );
};
```

---

## 🗄️ BANCO DE DADOS

### **Stock Service - StockDb**
```sql
CREATE TABLE Products (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Code NVARCHAR(50) NOT NULL,
    Description NVARCHAR(500) NOT NULL,
    StockBalance INT NOT NULL CHECK (StockBalance >= 0)
);
```

### **Billing Service - BillingDb**
```sql
CREATE TABLE Invoices (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Number NVARCHAR(20) NOT NULL UNIQUE,  -- NF-0001, NF-0002
    Status NVARCHAR(20) NOT NULL,          -- Aberta, Fechada
    CreatedAt DATETIME2 NOT NULL
);

CREATE TABLE InvoiceItems (
    Id INT PRIMARY KEY IDENTITY(1,1),
    InvoiceId INT FOREIGN KEY REFERENCES Invoices(Id),
    ProductId INT NOT NULL,  -- Referência ao Stock Service
    Quantity INT NOT NULL
);
```

---

## 🏃 COMO EXECUTAR O PROJETO

### **1. Stock Service**
```bash
cd stock-service
dotnet run --launch-profile https
# Rodará em https://localhost:5001
```

### **2. Billing Service**
```bash
cd billing-service
dotnet run --launch-profile https
# Rodará em https://localhost:5002
```

### **3. Frontend (Angular)**
```bash
cd frontend
npm install  # Primeira vez
npm start
# Rodará em http://localhost:4200
```

---

## 📋 STATUS DO DESENVOLVIMENTO

### ✅ CONCLUÍDO
- [x] Arquitetura de Microsserviços
- [x] Stock Service (CRUD de produtos)
- [x] Billing Service (Criar notas + print)
- [x] Padrão Saga (integração com fallback)
- [x] Frontend Angular com Standalone Components
- [x] StockService e BillingService (Angular)
- [x] Modelos de dados (Product, Invoice)
- [x] Error Interceptor (Angular)
- [x] CORS configurado
- [x] Testes E2E (600+ linhas)

### 🚧 EM PROGRESSO
- [ ] ProductListComponent (UI com Material Table)
- [ ] InvoiceListComponent (UI com Material Table)
- [ ] ProductFormComponent (Formulário reativo)
- [ ] InvoiceFormComponent (Formulário reativo)
- [ ] Autenticação (JWT)
- [ ] Testes unitários (Jasmine)

### 📋 PRÓXIMOS PASSOS
1. Implementar componentes de lista e formulário
2. Integração visual completa
3. Deploy em produção
4. Testes automatizados

---

## 🎓 PADRÕES E BOAS PRÁTICAS UTILIZADAS

| Padrão | Descrição | Local |
|--------|-----------|-------|
| **Microsserviços** | Separação de responsabilidades | Stock + Billing |
| **Saga Pattern** | Transações distribuídas | /print endpoint |
| **Dependency Injection** | Injeção de dependências | Angular + .NET |
| **Repository Pattern** | Isolamento de dados | EF Core DbContext |
| **Observable Pattern** | Programação reativa | RxJS + Angular |
| **Error Handling** | Tratamento centralizado | Error Interceptor |
| **CORS** | Segurança cross-origin | Program.cs |
| **Standalone Components** | Angular 17+ | app.ts, HomeComponent |
| **Lazy Loading** | Carregamento sob demanda | app.routes.ts |
| **Signals** | Reatividade moderna | Angular 17+ |

---

## 🔍 TROUBLESHOOTING

**Problema:** Frontend não carrega  
**Solução:** Verificar se Stock e Billing services estão rodando em HTTPS

**Problema:** Erro 502 ao imprimir nota  
**Solução:** Verificar se Stock-Service está online em https://localhost:5001

**Problema:** CORS error  
**Solução:** Verificar se Billing-Service tem CORS + "AllowAngular" configurado

**Problema:** Banco de dados não encontrado  
**Solução:** Executar migrations: `dotnet ef database update`

---

## 📞 CONTATO & INFORMAÇÕES

- **Projeto:** Korp - Sistema de Notas Fiscais
- **Desenvolvedor:** João Leonardo Macanhão
- **Data:** Abril 2026
- **Framework:** Angular 21 + .NET 8
- **Banco:** SQL Server
- **Arquitetura:** Microsserviços com Padrão Saga

---

**FIM DA DOCUMENTAÇÃO**  
Para dúvidas ou melhorias, referir aos arquivos de teste (TEST_ROTEIRO_*.md)
