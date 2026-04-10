# 🔌 MAPA DE ENDPOINTS & INTEGRAÇÃO DE SERVIÇOS

## 📍 STOCK-SERVICE - Endpoints de Produtos

### Servidor
- **HTTPS**: `https://localhost:7192`
- **HTTP**: `http://localhost:5083`

### Endpoints Disponíveis

#### 1️⃣ GET /api/products
**Descrição**: Listar todos os produtos
```bash
curl --insecure -X GET https://localhost:7192/api/products
```
**Resposta**: `200 OK`
```json
[
  {
    "id": 1,
    "code": "PROD-001",
    "description": "Notebook Dell",
    "stockBalance": 50
  }
]
```

---

#### 2️⃣ POST /api/products
**Descrição**: Criar novo produto
```bash
curl --insecure -X POST https://localhost:7192/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "code": "PROD-001",
    "description": "Notebook Dell Inspiron 15",
    "stockBalance": 50
  }'
```
**Resposta**: `201 Created`
```json
{
  "id": 1,
  "code": "PROD-001",
  "description": "Notebook Dell Inspiron 15",
  "stockBalance": 50
}
```

---

#### 3️⃣ PUT /api/products/{id}
**Descrição**: Atualizar saldo total do produto
```bash
curl --insecure -X PUT https://localhost:7192/api/products/1 \
  -H "Content-Type: application/json" \
  -d '100'
```
**Resposta**: `204 No Content`
```
(sem corpo)
```

---

#### 4️⃣ PUT /api/products/{id}/deduct
**Descrição**: Deduzir quantidade do estoque
```bash
curl --insecure -X PUT https://localhost:7192/api/products/1/deduct \
  -H "Content-Type: application/json" \
  -d '5'
```
**Resposta**: `204 No Content` (sucesso)
```
(sem corpo)
```

**Resposta Erro** (saldo insuficiente): `400 Bad Request`
```json
{
  "detail": "Saldo insuficiente."
}
```

---

## 🧾 BILLING-SERVICE - Endpoints de Notas Fiscais

### Servidor
- **HTTPS**: `https://localhost:7063`
- **HTTP**: `http://localhost:5292`

### Endpoints Disponíveis

#### 1️⃣ GET /api/invoices
**Descrição**: Listar todas as notas fiscais
```bash
curl --insecure -X GET https://localhost:7063/api/invoices
```
**Resposta**: `200 OK`
```json
[
  {
    "id": 1,
    "number": "NF-0001",
    "status": "Aberta",
    "createdAt": "2026-04-09T12:34:56.789Z",
    "items": [
      {
        "id": 1,
        "invoiceId": 1,
        "productId": 1,
        "quantity": 1
      }
    ]
  }
]
```

---

#### 2️⃣ POST /api/invoices
**Descrição**: Criar nova nota fiscal com produtos
**Parâmetro**: Array de IDs de produtos
```bash
curl --insecure -X POST https://localhost:7063/api/invoices \
  -H "Content-Type: application/json" \
  -d '[1, 2]'
```
**Resposta**: `201 Created`
```json
{
  "id": 1,
  "number": "NF-0001",
  "status": "Aberta",
  "createdAt": "2026-04-09T12:34:56.789Z",
  "items": [
    {
      "id": 1,
      "invoiceId": 1,
      "productId": 1,
      "quantity": 1
    },
    {
      "id": 2,
      "invoiceId": 1,
      "productId": 2,
      "quantity": 1
    }
  ]
}
```

---

#### 3️⃣ GET /api/invoices/{id}
**Descrição**: Obter detalhes de uma nota fiscal
```bash
curl --insecure -X GET https://localhost:7063/api/invoices/1
```
**Resposta**: `200 OK`
```json
{
  "id": 1,
  "number": "NF-0001",
  "status": "Aberta",
  "items": [...]
}
```

---

#### 4️⃣ POST /api/invoices/{id}/print ⭐ NOVO
**Descrição**: Imprimir/Finalizar nota fiscal
- Integra com Stock-Service
- Deduz estoque
- Muda status para "Fechada"

```bash
curl --insecure -X POST https://localhost:7063/api/invoices/1/print \
  -H "Content-Type: application/json"
```

**Resposta Sucesso**: `200 OK`
```json
{
  "id": 1,
  "number": "NF-0001",
  "status": "Fechada",
  "items": [...]
}
```

**Resposta - Nota Inexistente**: `404 Not Found`
```json
{
  "detail": "Nota fiscal não encontrada."
}
```

**Resposta - Nota Já Fechada**: `400 Bad Request`
```json
{
  "detail": "Nota fiscal já foi fechada."
}
```

**Resposta - Stock-Service Down**: `502 Bad Gateway`
```json
{
  "detail": "Serviço de Estoque indisponível. A nota permanece Aberta."
}
```

---

## 🔗 FLUXO DE INTEGRAÇÃO: Print com Deduct

Quando você chama `POST /api/invoices/{id}/print`:

```
┌─────────────────────────────────────────────────────────────┐
│ Cliente                                                      │
│ POST /api/invoices/1/print                                  │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│ Billing-Service                                             │
│ 1. Busca nota fiscal ID=1                                   │
│ 2. Valida status = "Aberta"                                 │
│ 3. Para cada item da nota:                                  │
│    a. Prepara chamada para Stock-Service                   │
│    b. PUT /api/products/{ProductId}/deduct                 │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼ (chamada HTTP)
┌─────────────────────────────────────────────────────────────┐
│ Stock-Service                                               │
│ 1. Busca produto                                            │
│ 2. Valida saldo >= quantidade                               │
│ 3. Reduz saldo: newBalance = balance - quantity             │
│ 4. Retorna 204 No Content                                   │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│ Billing-Service (continuação)                               │
│ 5. Se tudo OK: Status = "Fechada"                           │
│ 6. Se erro: Retorna erro 502, Status permanece "Aberta"    │
│ 7. Salva mudança no banco                                   │
│ 8. Retorna nota atualizada                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ MATRIZ DE CASOS DE TESTE

| # | Endpoint | Método | Entrada | HTTP | Mensagem | Validação |
|---|----------|--------|---------|------|----------|-----------|
| 1 | /products | POST | {code,desc,balance} | 201 | id criado | id > 0 |
| 2 | /products | GET | - | 200 | lista | count > 0 |
| 3 | /products/{id} | PUT | newBalance | 204 | - | saldo atualizado |
| 4 | /products/{id}/deduct | PUT | quantity | 204 | - | saldo -= qty |
| 5 | /invoices | POST | [1,2] | 201 | NF-0001 | number correto |
| 6 | /invoices | GET | - | 200 | lista | count > 0 |
| 7 | /invoices/{id}/print | POST | - | 200 | Fechada | status=Fechada |
| 8 | /invoices/{id}/print | POST | - | 400 | fechada | se já fechada |
| 9 | /invoices/{id}/print | POST | - | 404 | não encontrada | se não existe |
| 10 | /invoices/{id}/print | POST | - | 502 | indisponível | mock down |

---

## 🧪 DADOS DE TESTE - VALORES INICIAIS

### Produtos a Criar
```json
{
  "code": "PROD-001",
  "description": "Notebook Dell Inspiron 15",
  "stockBalance": 50
}
```

```json
{
  "code": "PROD-002",
  "description": "Mouse Logitech MX",
  "stockBalance": 100
}
```

### Notas a Criar
```json
[1]           // Uma nota com Produto 1
```

```json
[1, 2]        // Uma nota com Produtos 1 e 2
```

### Operações de Deduct
```json
5             // Deduzir 5 unidades
```

---

## 🔐 SEGURANÇA & CONFIGURAÇÃO

### Certificados SSL
- Os certificados são **auto-assinados** para desenvolvimento
- Use flag `--insecure` ou `-k` no cURL para ignorar validação

### Portas (Development)
- Stock: 5192 (HTTP), 7192 (HTTPS)
- Billing: 5292 (HTTP), 7063 (HTTPS)

### Connection String
- **Banco**: SQL Server (LocalDB ou Dev)
- **String**: Configuravel em `appsettings.json`

---

## 📊 EXEMPLO DE FLUXO COMPLETO

### Passo 1: Criar Produtos
```bash
curl --insecure -X POST https://localhost:7192/api/products \
  -H "Content-Type: application/json" \
  -d '{"code":"PROD-001","description":"Notebook","stockBalance":50}'
# Resposta: id=1

curl --insecure -X POST https://localhost:7192/api/products \
  -H "Content-Type: application/json" \
  -d '{"code":"PROD-002","description":"Mouse","stockBalance":100}'
# Resposta: id=2
```

### Passo 2: Verificar Produtos
```bash
curl --insecure -X GET https://localhost:7192/api/products
# Resposta: 2 produtos listados
```

### Passo 3: Criar Nota
```bash
curl --insecure -X POST https://localhost:7063/api/invoices \
  -H "Content-Type: application/json" \
  -d '[1, 2]'
# Resposta: id=1, number=NF-0001, status=Aberta
```

### Passo 4: Imprimir Nota (Integração)
```bash
curl --insecure -X POST https://localhost:7063/api/invoices/1/print \
  -H "Content-Type: application/json"
# Resposta: status=Fechada
```

### Passo 5: Validações
```bash
# Verificar estoque do Produto 1
curl --insecure -X GET https://localhost:7192/api/products/1
# Resposta: stockBalance=49 ✅

# Verificar estoque do Produto 2  
curl --insecure -X GET https://localhost:7192/api/products/2
# Resposta: stockBalance=99 ✅

# Verificar status da nota
curl --insecure -X GET https://localhost:7063/api/invoices/1
# Resposta: status=Fechada ✅
```

---

## 🎓 APRENDIZADOS & BOAS PRÁTICAS

### Padrões Implementados
1. **REST API** - Recursos e verbos HTTP corretos
2. **Async/Await** - Operações não-bloqueantes
3. **Entity Framework Core** - ORM para data access
4. **Dependency Injection** - Services e contextos
5. **HTTP Client Factory** - Pool de conexões
6. **Status Codes Semânticas** - 201, 204, 400, 404, 502

### Melhorias Futuras
- [ ] Adicionar autenticação/autorização (JWT)
- [ ] Implementar versionamento de API
- [ ] Adicionar rate limiting
- [ ] Implementar caching (Redis)
- [ ] Adicionar circuit breaker (Polly)
- [ ] Testes unitários e integração
- [ ] CI/CD pipeline
- [ ] Docker containerization

---

**Versão**: 1.0  
**Atualizado**: 09/04/2026  
**Status**: ✅ Completo
