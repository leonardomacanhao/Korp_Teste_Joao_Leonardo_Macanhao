# 🏗️ ARQUITETURA E DECISÕES DE DESIGN

## 🎯 PROBLEMA INICIAL

**Requisito do Teste Técnico:**
> Criar um Sistema de Notas Fiscais com arquitetura de Microsserviços, demonstrando integração entre múltiplas APIs, controle de estoque e geração de notas.

## 🛠️ SOLUÇÃO IMPLEMENTADA

### 1️⃣ SEPARAÇÃO EM MICROSSERVIÇOS

#### ✅ DECISÃO: Dividir em 2 serviços
```
Stock-Service (Porta 5001)
    └─ Responsável: Gerenciamento de produtos e estoque
    └─ Operações: Create, Read, Update, Deduct
    └─ Banco: StockDb (Products table)

Billing-Service (Porta 5002)
    └─ Responsável: Gerenciamento de notas fiscais
    └─ Operações: Create invoice, List, Print (com integração)
    └─ Banco: BillingDb (Invoices + InvoiceItems)
```

#### ❌ ALTERNATIVA REJEITADA: Monólito único
- Problema: Menos escalabilidade
- Benefício perdido: Independência de deploy

#### ✅ BENEFÍCIO ALCANÇADO:
- Stock pode evoluir independente de Billing
- Se Stock falha, só /print falha, resto funciona
- Fácil adicionar serviço de Relatórios depois

---

### 2️⃣ PADRÃO SAGA PARA TRANSAÇÕES DISTRIBUÍDAS

#### ✅ PROBLEMA RESOLVIDO
```
Como fazer 2 operações em 2 bancos diferentes 
parecerem uma operação atômica?

POST /invoices/{id}/print
  → Passo 1: Validar status
  → Passo 2: Chamar Stock para deduzir estoque
  → Passo 3: Fechar nota APENAS se Passo 2 sucedeu
```

#### ✅ IMPLEMENTAÇÃO: Saga Orquestrada

```csharp
[HttpPost("{id}/print")]
public async Task<IActionResult> PrintInvoice(int id)
{
    // PASSO 1: Validação local
    var invoice = await _context.Invoices
        .Include(i => i.Items)
        .FirstOrDefaultAsync(i => i.Id == id);
    
    if (invoice == null) 
        return NotFound();
    if (invoice.Status == "Fechada") 
        return BadRequest("Já foi fechada");
    
    try
    {
        // PASSO 2: Chaada remota (Stock Service)
        var client = _httpClientFactory.CreateClient("StockService");
        foreach (var item in invoice.Items)
        {
            var response = await client.PutAsync(
                $"/api/products/{item.ProductId}/deduct",
                new StringContent(
                    JsonSerializer.Serialize(item.Quantity),
                    Encoding.UTF8, "application/json"
                )
            );

            // ⚠️ CRÍTICO: Se falhar, não muda status
            if (!response.IsSuccessStatusCode)
                return StatusCode(502, "Stock Service indisponível");
        }

        // PASSO 3: Commit local APENAS após sucesso remoto
        invoice.Status = "Fechada";
        await _context.SaveChangesAsync();

        return Ok(new { message = "Sucesso", invoice });
    }
    catch
    {
        // Exceção = nenhuma alteração foi feita
        return StatusCode(502, "Erro na comunicação");
    }
}
```

#### ✅ POR QUE SAGA FUNCIONA AQUI?

```
Cenário 1: Stock online
═══════════════════════════════════════
POST /invoices/1/print
├─ Valida status ✓ (Aberta)
├─ Chama Stock /deduct ✓ (200 OK)
├─ Fecha nota ✓ (Status = Fechada)
└─ Retorna 200 OK

Cenário 2: Stock OFFLINE (502)
═══════════════════════════════════════
POST /invoices/1/print
├─ Valida status ✓ (Aberta)
├─ Chama Stock /deduct ✗ (502 timeout)
├─ NÃO fecha nota (Status permanece Aberta)
└─ Retorna 502 "Indisponível"

Resultado: Se retentar depois (Stock online)
POST /invoices/1/print (RETRY)
├─ Valida status ✓ (Aberta) ← Continuamos daqui!
├─ Chama Stock /deduct ✓ (200 OK)
├─ Fecha nota ✓ (Status = Fechada)
└─ Retorna 200 OK
```

#### ❌ ALTERNATIVA REJEITADA: 2-Phase Commit
- Problema: Complexo demais para o escopo
- Problema: SQL Server + SQL Server é overkill
- Problema: Não é cloud-native

---

### 3️⃣ FRONTEND: POR QUE ANGULAR 21 STANDALONE?

#### ✅ DECISÃO: Standalone Components (sem NgModule)

```typescript
// ✅ NOVO (Angular 17+)
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `...`
})
export class HomeComponent {}

// ❌ ANTIGO (Angular 1-16)
@NgModule({
  declarations: [HomeComponent],
  imports: [CommonModule, RouterModule]
})
export class HomeModule {}
```

#### ✅ BENEFÍCIOS:
1. **Menos boilerplate** - Sem NgModule
2. **Tree-shakeable** - Melhor bundle
3. **Mais próximo de Web Components**
4. **Evolucionário** - Caminho futuro do Angular

#### ✅ INJEÇÃO COM `inject()`

```typescript
// ✅ NOVO (Angular 17+)
private http = inject(HttpClient);

// ❌ ANTIGO
constructor(private http: HttpClient) {}
```

#### ✅ BENEFÍCIOS:
1. **Type-safe** melhorado
2. **Sem dependency na constructor signature**
3. **Mais funcional**

---

### 4️⃣ GERENCIAMENTO DE ESTADO: RxJS

#### ✅ DECISÃO: Observables ao invés de Promises

```typescript
// ✅ OBSERVABLES (Reativo, Cancelável)
stockService.getProducts().subscribe(
  data => this.products = data,
  error => console.error(error),
  () => console.log('completo')
);

// ❌ PROMISES (Uma-shot, não cancelável)
const products = await fetch('/api/products').then(r => r.json());
```

#### ✅ POR QUE?
1. **Cancelável** - Pode unsubscribe antes
2. **Reativo** - Reage a mudanças
3. **Composável** - pipe() com múltiplos operadores
4. **RxJS rich** - catchError, retry, debounce, etc

#### ✅ PADRÃO RXJS USADO

```typescript
// Error Handling + RxJS Pattern
getProducts(): Observable<Product[]> {
  return this.http.get<Product[]>(this.apiUrl).pipe(
    catchError(error => {
      console.error('Erro:', error);
      return throwError(() => 
        new Error('Falha na comunicação')
      );
    })
  );
}

// No componente:
ngOnInit() {
  this.stockService.getProducts().subscribe({
    next: (data) => this.products = data,
    error: (err) => this.snackBar.open('Erro'),
    complete: () => console.log('Done')
  });
}
```

---

### 5️⃣ LAZY-LOADING PARCIAL

#### ✅ DECISÃO: Home com import direto, Products com lazy

```typescript
// app.routes.ts
export const routes: Routes = [
  { path: 'home', component: HomeComponent },        // ✅ Direto
  { path: 'products', loadComponent: () => 
    import('./features/products/...').then(m => m.ProductsComponent)  // Lazy
  }
];
```

#### ✅ ESTRATÉGIA:
- **Home:** Importação direta (early-loaded)
- **Products/Invoices:** Lazy-loaded quando acessado

#### ✅ BENEFÍCIO:
- Bundle principal menor
- Componentes pesados carregam sob demanda

---

### 6️⃣ BANCO DE DADOS: SQL SERVER + EF CORE

#### ✅ DECISÃO: Não usar RelationalDB tão complexa para teste

```csharp
// Stock-Service DbContext
public class AppDbContext(DbContextOptions<AppDbContext> options) 
    : DbContext(options)
{
    public DbSet<Product> Products { get; set; }
}

// Migrations automáticas
dotnet ef database update
```

#### ✅ BENEFÍCIO:
- Code-first
- Versionamento automático
- Rollback facilitado

#### ❌ ALTERNATIVA: MongoDB
- Problema: Não é relacional
- Problema: Overkill para demo

---

### 7️⃣ CORS: PROTEGER REQUISIÇÕES CROSS-ORIGIN

#### ✅ DECISÃO: Configurar CORS no Billing apenas

```csharp
// Billing-Service (Program.cs)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyMethod()
              .AllowAnyHeader());
});

app.UseCors("AllowAngular");
```

#### ✅ POR QUÊ APENAS BILLING?
- Stock não recebe requisições do frontend
- Apenas Billing chama Stock
- Requisições serviço-para-serviço não precisam CORS

---

### 8️⃣ ERROR INTERCEPTOR: TRATAMENTO CENTRALIZADO

#### ✅ DECISÃO: Interceptor HTTP global

```typescript
// error.interceptor.ts
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError(error => {
      if (error.status === 0)
        alert('Serviço indisponível');
      else if (error.status === 502)
        alert('Falha comunicação entre serviços');
      else if (error.status === 400)
        alert(error.error?.message);
      
      return throwError(() => error);
    })
  );
};

// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([errorInterceptor]))
  ]
};
```

#### ✅ BENEFÍCIO:
- Não repetir tratamento em cada serviço
- Feedback visual consistente
- Fácil adicionar logging/analytics depois

---

## 🎯 MATRIZ DE DECISÕES

| Decisão | Opção A | Opção B | ✅ Escolhido | Razão |
|---------|---------|---------|-------------|-------|
| Arquitetura | Monólito | **Microsserviços** | MS | Requisito teste |
| Transações | 2-Phase Commit | **Saga** | Saga | Simples + cloud-native |
| Angular | Classes | **Standalone** | Standalone | Moderno + tree-shakeable |
| Injeção | constructor | **inject()** | inject() | Type-safe |
| Estado | Promises | **Observables** | Observables | Reativo + cancelável |
| Banco | NoSQL | **SQL (EF Core)** | SQL | Relacional + versionável |
| CORS | Todos | **Parcial (Billing)** | Parcial | Seguro + específico |

---

## 📊 FLUXO DE DECISÃO UX

```
Usuário acessa http://localhost:4200
          ↓
    [HomeComponent] ← importação direta (carregado)
          ↓
    Clica em "Produtos"
          ↓
    [ProductsComponent] ← lazy-loaded neste ponto
          ↓
    Clica em "Novo Produto"
          ↓
    [ProductFormComponent] (trabalho em progresso)
          ↓
    Preenche formulário reativo
          ↓
    Clica "Salvar"
          ↓
    StockService.createProduct()
          ↓
    HTTP POST https://localhost:5001/api/products
          ↓
    errorInterceptor (se erro, captura aqui)
          ↓
    [Material Snackbar] Sucesso/Erro
          ↓
    UI atualiza automaticamente (Change Detection)
```

---

## 🔐 SEGURANÇA (Considerações)

### ✅ IMPLEMENTADO
- HTTPS em dev (certificados autossinados)
- CORS restritivo
- Validação de entrada (Required, Range, etc)
- HttpOnly flags nos cookies (JWT futuro)

### 📋 TODO (Produção)
- [ ] JWT Authentication
- [ ] ApiKey para serviço-a-serviço
- [ ] Rate Limiting
- [ ] SQL Injection prevention (já tem via EF Core)
- [ ] XSS prevention (Angular sanitiza por padrão)

---

## 📈 ESCALABILIDADE

```
Hoje (Monolítico):
┌─────────────────┐
│ Frontend        │
├─────────────────┤
│ Stock API       │
│ Billing API     │
│ Relatórios API  │
│ Payments API    │
└─────────────────┘

Amanhã (Microsserviços):
┌──────────────────────────────┐
│ Frontend (API Gateway)       │
│                              │
├──────┬──────┬────────┬────────┤
│Stock │Billing│Reports │Payments│
│      │       │        │        │
└──────┴──────┴────────┴────────┘
   ↓      ↓      ↓       ↓
 [DB] [DB] [DB] [DB]
```

---

## 🚀 EVOLUÇÃO FUTURA

### Fase 1 (Atual - ✅ FEITO)
- [x] Microsserviços básicos
- [x] Padrão Saga
- [x] Frontend Angular 21
- [x] Integração HTTP

### Fase 2 (Próximo)
- [ ] ProductListComponent com Material Table
- [ ] InvoiceListComponent
- [ ] Formulários reativos com validação
- [ ] Testes unitários (Jasmine)

### Fase 3 (Depois)
- [ ] JWT Authentication
- [ ] Message Queue (RabbitMQ/Kafka)
- [ ] Event Sourcing
- [ ] Docker + Kubernetes
- [ ] CI/CD Pipeline
- [ ] API Gateway (Kong/Nginx)

---

## 🎓 CONCEITOS APLICADOS

| Conceito | Onde | Valor |
|----------|------|-------|
| **SOLID** | Classes + Serviços | Clean code |
| **DDD** | Stock vs Billing bounded contexts | Escalável |
| **SAGA Pattern** | /print endpoint | Transações distribuídas |
| **RxJS** | Observables | Reativo |
| **Dependency Injection** | Angular + .NET | Testável |
| **Lazy-Loading** | Routes | Performance |
| **CORS** | Segurança | Cross-origin |
| **Error Handling** | Interceptor | UX consistente |

---

## 💡 TRADE-OFFS

### Microsserviços vs Monólito ⚖️
```
✅ Escalabilidade independente
✅ Deploy independente
✅ Stack independente
❌ Complexidade de testes E2E
❌ Latência de rede
❌ Consistência eventual
```

### Saga vs 2-Phase Commit ⚖️
```
✅ Simples de implementar
✅ Cloud-native
✅ Funciona em diferentes BD
❌ Consistência eventual (não imediata)
❌ Precisa de compensação em caso de erro
```

### Standalone vs NgModule ⚖️
```
✅ Menos boilerplate
✅ Modern
✅ Tree-shakeable
❌ Novo (menos Stack Overflow)
❌ Comunidade menor
```

---

## 📝 CONCLUSÃO

```
┌─────────────────────────────────────────┐
│ SISTEMA KORP                            │
├─────────────────────────────────────────┤
│ ✅ Arquitetura Microsserviços           │
│ ✅ Padrão Saga para integrações         │
│ ✅ Frontend moderno (Angular 21)        │
│ ✅ Type-safe (TypeScript + C#)          │
│ ✅ Reativo (RxJS + Signals)             │
│ ✅ Escalável e manutenível              │
│ ✅ Pronto para evolução                 │
└─────────────────────────────────────────┘
```

Este sistema segue as melhores práticas atuais de engenharia de software e pode servir como base para aplicações maiores.
