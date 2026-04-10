# 🎯 RESUMO EXECUTIVO - SISTEMA KORP

## ⚡ TL;DR (Em 30 segundos)

**O QUÊ:** Sistema de Notas Fiscais com arquitetura de Microsserviços  
**COMO:** 2 APIs .NET 8 + 1 Frontend Angular 21  
**ONDE:** Rodam localmente em HTTPS (portas 5001, 5002, 4200)  
**POR QUÊ:** Demonstrar integração entre serviços com Padrão Saga

---

## 📊 MAPA VISUAL

```
┌──────────────────────────────────────────────────────┐
│ NAVEGADOR: http://localhost:4200                     │
│                                                      │
│  ╔════════════════════════════════════════════════╗  │
│  ║         FRONTEND ANGULAR 21                   ║  │
│  ║  (standalone components + material + rxjs)    ║  │
│  ╠════════════════════════════════════════════════╣  │
│  ║ HOME (navbar + router-outlet)                ║  │
│  ║ └─ PRODUCTS (lazy-loaded)                    ║  │
│  ║ └─ INVOICES (lazy-loaded)                    ║  │
│  ╚════════════════════════════════════════════════╝  │
│           ↓                               ↓          │
├────────────────────────────────────────────────────┤
│  HTTP REQUESTS (HttpClient + RxJS Observables)    │
│  • StockService: https://localhost:5001/api/...   │
│  • BillingService: https://localhost:5002/api/... │
└────────────────────────────────────────────────────┘
  ↓                                              ↓
┌────────────────────────┐         ┌──────────────────────┐
│  STOCK SERVICE         │         │  BILLING SERVICE     │
│  https://5001          │         │  https://5002        │
│                        │         │                      │
│ POST /products         │         │ POST /invoices       │
│ GET /products          │         │ GET /invoices        │
│ PUT /{id}/deduct ⭐    │◄────────┤ POST /{id}/print ⭐  │
│                        │         │  (Padrão Saga)       │
│ DB: Products           │         │ DB: Invoices+Items   │
│ SQL Server             │         │ SQL Server           │
└────────────────────────┘         └──────────────────────┘
```

---

## 🔑 COMPONENTES PRINCIPAIS

### **Frontend (Angular 21.2.0)**
```typescript
📁 app/
├── app.ts ..................... Root Standalone Component
├── app.routes.ts .............. Rotas (home, products, invoices)
├── app.config.ts .............. Providers (Router, HttpClient, etc)
│
├── core/services/
│   ├── stock.service.ts ....... GET/POST/PUT products
│   └── billing.service.ts ..... GET/POST invoices + print
│
├── shared/models/
│   ├── product.model.ts ....... { id, code, description, stockBalance }
│   └── invoice.model.ts ....... { id, number, status, items }
│
└── features/
    ├── home/ .................. Landing page
    ├── products/ .............. (em progresso)
    └── invoices/ .............. (em progresso)
```

### **Stock Service (.NET 8)**
```csharp
📁 stock-service/
├── Controllers/
│   └── ProductsController.cs
│       ├── GET    /api/products
│       ├── POST   /api/products
│       ├── PUT    /api/products/{id}
│       └── PUT    /api/products/{id}/deduct ⭐
│
├── Models/
│   └── Product.cs ........... { Id, Code, Description, StockBalance }
│
├── Data/
│   └── AppDbContext.cs ...... EF Core DbContext
│
└── Program.cs ............... Setup + launchSettings (porta 5001)
```

### **Billing Service (.NET 8)**
```csharp
📁 billing-service/
├── Controllers/
│   └── InvoicesController.cs
│       ├── GET    /api/invoices
│       ├── POST   /api/invoices (cria nota "Aberta")
│       └── POST   /api/invoices/{id}/print ⭐⭐⭐ SAGA PATTERN
│
├── Models/
│   ├── Invoice.cs ........... { Id, Number, Status, Items, CreatedAt }
│   └── InvoiceItem.cs ....... { Id, InvoiceId, ProductId, Quantity }
│
├── Data/
│   └── BillingDbContext.cs .. EF Core DbContext
│
└── Program.cs ............... Setup + HttpClient + CORS (porta 5002)
```

---

## 🔄 FLUXO CRÍTICO: IMPRIMIR NOTA (Padrão Saga)

```
     Frontend (Angular)
            ↓
  POST /invoices/{id}/print
            ↓
     Billing Service
            ↓
    ┌───────────────────┐
    │ PASSO 1: Validar  │
    │ (Status != Fechada)
    └────────┬──────────┘
             ↓
    ┌────────────────────────┐
    │ PASSO 2: Chamar Stock  │
    │ PUT /products/{id}/deduct
    └────────┬───────────────┘
             ↓
        Stock Service
             ↓
        Deduz estoque
             ↓
         200 OK? 
        ↙      ↘
      SIM      NÃO (502)
       ↓        ↓
    ╔═══════╗  ╔════════════════════╗
    ║ 3:   ║  ║ FALHA: Retorna 502 ║
    ║ Fecha║  ║ Status:Aberta      ║
    ║ Nota ║  ║ (pode retentar)    ║
    ║ Status║  ╚════════════════════╝
    ║=Fechada
    ╚═══════╝
       ↓
    200 OK
    { invoice com Status="Fechada" }
```

**POR QUÊ SAGA?** Se o Stock falha, a nota NÃO é fechada. Ao retentar (quando Stock ficar online), a impressão funciona normalmente.

---

## 📱 VERSÕES TECNOLÓGICAS

| Tecnologia | Versão | Papel |
|-----------|--------|-------|
| **Angular** | 21.2.0 | Frontend SPA |
| **Angular Material** | 21.2.6 | UI Components |
| **TypeScript** | 5.9.2 | Linguagem Frontend |
| **.NET** | 8.0 | Runtime Backend |
| **ASP.NET Core** | 8.0 | Web API |
| **Entity Framework Core** | 8.x | ORM |
| **SQL Server** | 2019+ | Banco de dados |
| **RxJS** | 7.8.0 | Reatividade |
| **Node.js** | Latest | NPM Runtime |

---

## 🚀 INICIAR O SISTEMA (3 terminais)

### Terminal 1: Stock Service
```bash
cd stock-service
dotnet run --launch-profile https
# Output: listening on https://localhost:5001
```

### Terminal 2: Billing Service
```bash
cd billing-service
dotnet run --launch-profile https
# Output: listening on https://localhost:5002
```

### Terminal 3: Frontend
```bash
cd frontend
npm install  # Primeira vez
npm start
# Output: ✔ Compiled successfully. Application bundle generation complete.
```

**Resultado:** 
- 🔵 Stock: https://localhost:5001/swagger
- 🔵 Billing: https://localhost:5002/swagger
- 🟢 Frontend: http://localhost:4200

---

## 🎯 CASOS DE USO

### ✅ USE CASE 1: Criar Produto
```
1. Admin acessa Frontend
2. Clica "Novo Produto"
3. Preencha { Código, Descrição, Saldo }
4. Clica "Salvar"
5. StockService.createProduct() → POST /api/products
6. Stock-Service cria produto no SQL
7. Retorna 201 + Product com ID
8. Interface atualiza lista
```

### ✅ USE CASE 2: Criar Nota Fiscal
```
1. Admin acessa Frontend
2. Clica "Nova Nota"
3. Seleciona produtos { ID-1, ID-2 }
4. Clica "Criar"
5. BillingService.createInvoice() → POST /api/invoices
6. Billing-Service cria nota com Status="Aberta"
7. Gera número sequencial: NF-0001, NF-0002, ...
8. Retorna 201 + Invoice
```

### ✅ USE CASE 3: Imprimir Nota (SAGA) ⭐
```
1. Admin vê nota com Status="Aberta"
2. Clica "Imprimir"
3. BillingService.printInvoice(id) → POST /api/invoices/{id}/print
4. Billing faz as seguintes operações:
   a) Valida se Status != Fechada
   b) Chama Stock "/products/{id}/deduct"
   c) Se sucesso: setStatus="Fechada" + SaveChanges
   d) Se erro 502: Sem alterar status
5. Retorna { message, invoice } ou erro
```

---

## 🛡️ TRATAMENTO DE ERROS

### Frontend
```typescript
// Intercepta erros HTTP globalmente
errorInterceptor:
- 0 (sem conexão) → "Serviço indisponível"
- 400 (Bad Request) → error.error.message
- 502 (Bad Gateway) → "Falha comunicação entre serviços"
```

### Backend
```csharp
// Cada serviço valida suas entradas
- NotFound (404) → "Recurso não encontrado"
- BadRequest (400) → "Validação falhou"
- ServiceUnavailable (503) → "Serviço indisponível"
```

---

## 📊 FLUXO DE DADOS

```
Frontend                  Billing Service              Stock Service
┌──────────────┐         ┌────────────────┐          ┌───────────────┐
│ getProdutos()│────────→│ GET /products  │─────────→│ DbContext     │
│              │         │ (HTTP)         │          │ .Products     │
│              │◄────────│                │◄─────────│ .ToListAsync()│
│ Observable   │         │ Observable     │          │  SQL Query    │
│ [Product]    │         │ [Product]      │          │ SELECT *      │
└──────────────┘         └────────────────┘          └───────────────┘
        │
        ↓
     [Material Table]
     (atualiza automaticamente
      via Change Detection)
```

---

## 🔗 INTEGRAÇÃO ENTRE SERVIÇOS

### Requisição Interna (Billing → Stock)

**Nas mãos do Billing Service:**
```csharp
var client = _httpClientFactory.CreateClient("StockService");
var response = await client.PutAsync(
    "/api/products/{id}/deduct",
    new StringContent(
        JsonSerializer.Serialize(quantity),
        Encoding.UTF8,
        "application/json"
    )
);
```

**Configuração (Program.cs):**
```csharp
builder.Services.AddHttpClient("StockService", client =>
{
    client.BaseAddress = new Uri("https://localhost:5001");
});
```

---

## 🧪 TESTES (Arquivos Disponíveis)

| Arquivo | Descrição | Como usar |
|---------|-----------|-----------|
| `TEST_ROTEIRO_E2E.http` | 50+ requisições REST | Abrir no REST Client do VS Code |
| `TEST_ROTEIRO_COMPLETO_CURL.md` | 100+ comandos cURL | Copiar/colar no PowerShell |
| `QUICK_START_TESTS.sh` | Script automatizado | `bash QUICK_START_TESTS.sh` |

---

## 💾 ESTRUTURA DO BANCO DE DADOS

```sql
-- STOCK SERVICE (StockDb)
Products {
  Id: PK
  Code: STRING
  Description: STRING
  StockBalance: INT (≥ 0)
}

-- BILLING SERVICE (BillingDb)
Invoices {
  Id: PK
  Number: STRING (NF-0001)
  Status: STRING (Aberta/Fechada)
  CreatedAt: DATETIME
}

InvoiceItems {
  Id: PK
  InvoiceId: FK → Invoices
  ProductId: INT (referência ao Stock)
  Quantity: INT
}
```

---

## ⚙️ CONFIGURAÇÕES IMPORTANTES

### **CORS (Billing-Service)**
```csharp
Permite requisições de http://localhost:4200
```

### **HttpClient (Stock-Service)**
Stock NÃO chama Billing
```
Unidirecional: Billing → Stock
```

### **Banco de Dados**
```csharp
UseSqlServer(connectionString)
Migrações automáticas via EF Core
```

### **Segurança HTTPS**
```
launchSettings.json configura HTTPS
Certificados autossinados para dev
```

---

## 🚨 POSSÍVEIS PROBLEMAS E SOLUÇÕES

| Problema | Causa | Solução |
|----------|-------|---------|
| Frontend branco | Stock/Billing offline | Iniciar serviços em terminais |
| CORS error | Billing-Service sem CORS | Verificar Program.cs |
| 502 ao imprimir | Stock-Service não responde | Confirmar porta 5001 |
| Porta já em uso | Serviço anterior não fechou | Trocar porta em launchSettings |
| Banco não encontrado | Sem migrations | `dotnet ef database update` |

---

## 📝 PRÓXIMAS FUNCIONALIDADES

1. ✅ ProductListComponent com Material Table
2. ✅ ProductFormComponent com Validações Reativas
3. ✅ InvoiceListComponent
4. ✅ InvoiceFormComponent
5. ⏳ Autenticação (JWT)
6. ⏳ Testes Unitários (Jasmine)
7. ⏳ Deploy em Produção

---

## 📚 CONCEITOS-CHAVE

| Conceito | Explicação | Onde visto |
|----------|-----------|-----------|
| **Microsserviços** | 2 APIs independentes | Stock + Billing |
| **Padrão Saga** | Transações distribuídas | /print endpoint |
| **Lazy-Loading** | Componentes sob demanda | app.routes.ts |
| **RxJS Observable** | Stream de dados assíncrono | services |
| **Dependency Injection** | Injetar componentes | inject() + providedIn |
| **Standalone Components** | Sem NgModule | app.ts, HomeComponent |
| **Signals** | Reatividade moderna | Angular 17+ |
| **Entity Framework** | ORM para .NET | Product, Invoice |

---

## 🎓 REFERÊNCIAS ARQUITETURAIS

```
Domain-Driven Design (DDD):
→ Productos Bounded Context (Stock-Service)
→ Invoices Bounded Context (Billing-Service)

SOLID Principles:
→ Single Responsibility (cada serviço uma coisa)
→ Open/Closed (fácil estender sem quebrar)
→ Dependency Inversion (injeção de dependências)
```

---

**📌 PARA OUTRA IA:**  
1. Leia: `DOCUMENTACAO_COMPLETA.md` (referência completa)
2. Estude: Fluxo SAGA Pattern acima
3. Teste: Execute os 3 serviços
4. Implemente: Use estrutura como template para novos componentes

**Qualquer dúvida? Referir aos TEST_*.md ou ENDPOINTS_DETALHADOS.md**
