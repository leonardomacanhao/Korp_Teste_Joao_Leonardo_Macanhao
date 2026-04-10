# 📋 ROTEIRO COMPLETO DE TESTES E2E - SISTEMA DE NOTAS FISCAIS
## Testes de API .NET Core - Microsserviços Stock e Billing

---

## 🔧 INFORMAÇÕES DE AMBIENTE

| Serviço | Protocolo | Porta | Host |
|---------|-----------|-------|------|
| stock-service | HTTPS | 7192 | https://localhost:7192 |
| stock-service | HTTP | 5083 | http://localhost:5083 |
| billing-service | HTTPS | 7063 | https://localhost:7063 |
| billing-service | HTTP | 5292 | http://localhost:5292 |

**Nota**: Use `--insecure` (ou `-k`) no cURL para ignorar erros de certificado SSL auto-assinado.

---

## ✅ SEÇÃO 1: TESTES DE PRODUTO (Stock-Service)

### 1.1 - Criar Produto #1
**Objetivo**: Criar primeiro produto com estoque inicial

```bash
curl --insecure -X POST https://localhost:7192/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "code": "PROD-001",
    "description": "Notebook Dell Inspiron 15",
    "stockBalance": 50
  }'
```

**Resultado Esperado (201 Created)**:
```json
{
  "id": 1,
  "code": "PROD-001",
  "description": "Notebook Dell Inspiron 15",
  "stockBalance": 50
}
```

---

### 1.2 - Criar Produto #2
**Objetivo**: Criar segundo produto com estoque diferente

```bash
curl --insecure -X POST https://localhost:7192/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "code": "PROD-002",
    "description": "Mouse Logitech MX",
    "stockBalance": 100
  }'
```

**Resultado Esperado (201 Created)**:
```json
{
  "id": 2,
  "code": "PROD-002",
  "description": "Mouse Logitech MX",
  "stockBalance": 100
}
```

---

### 1.3 - Listar Todos os Produtos
**Objetivo**: Validar que ambos os produtos foram criados corretamente

```bash
curl --insecure -X GET https://localhost:7192/api/products \
  -H "Content-Type: application/json"
```

**Resultado Esperado (200 OK)**:
```json
[
  {
    "id": 1,
    "code": "PROD-001",
    "description": "Notebook Dell Inspiron 15",
    "stockBalance": 50
  },
  {
    "id": 2,
    "code": "PROD-002",
    "description": "Mouse Logitech MX",
    "stockBalance": 100
  }
]
```

**Validações**:
- ✅ Ambos os produtos devem estar presentes
- ✅ IDs devem ser 1 e 2
- ✅ Saldos devem ser 50 e 100 respectivamente

---

### 1.4 - Verificar Saldo Inicial do Produto #1
**Objetivo**: Confirmar que o saldo inicial está correto antes de qualquer operação

```bash
curl --insecure -X GET https://localhost:7192/api/products/1 \
  -H "Content-Type: application/json"
```

**Resultado Esperado (200 OK)**:
```json
{
  "id": 1,
  "code": "PROD-001",
  "description": "Notebook Dell Inspiron 15",
  "stockBalance": 50
}
```

**Validações**:
- ✅ `stockBalance` deve ser exatamente 50

---

## 📝 SEÇÃO 2: TESTES DE NOTA FISCAL (Billing-Service)

### 2.1 - Criar Nota Fiscal #1 com Produto #1
**Objetivo**: Criar primeira nota fiscal com numeração sequencial

```bash
curl --insecure -X POST https://localhost:7063/api/invoices \
  -H "Content-Type: application/json" \
  -d '[1]'
```

**Resultado Esperado (201 Created)**:
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
    }
  ]
}
```

**Validações**:
- ✅ Número deve ser "NF-0001" (sequencial)
- ✅ Status deve ser "Aberta"
- ✅ Items deve conter 1 item com productId = 1

---

### 2.2 - Listar Dados da Nota Fiscal Criada
**Objetivo**: Validar que a nota foi criada corretamente

```bash
curl --insecure -X GET https://localhost:7063/api/invoices \
  -H "Content-Type: application/json"
```

**Resultado Esperado (200 OK)**:
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

### 2.3 - Criar Nota Fiscal #2 com Múltiplos Produtos
**Objetivo**: Testar nota com múltiplos itens e validar numeração sequencial

```bash
curl --insecure -X POST https://localhost:7063/api/invoices \
  -H "Content-Type: application/json" \
  -d '[1, 2]'
```

**Resultado Esperado (201 Created)**:
```json
{
  "id": 2,
  "number": "NF-0002",
  "status": "Aberta",
  "createdAt": "2026-04-09T12:35:00.000Z",
  "items": [
    {
      "id": 2,
      "invoiceId": 2,
      "productId": 1,
      "quantity": 1
    },
    {
      "id": 3,
      "invoiceId": 2,
      "productId": 2,
      "quantity": 1
    }
  ]
}
```

**Validações**:
- ✅ Número deve ser "NF-0002" (sequencial incrementado)
- ✅ Status deve ser "Aberta"
- ✅ Items deve conter 2 itens

---

### 2.4 - Listar Todas as Notas Fiscais
**Objetivo**: Confirmar criação de ambas as notas

```bash
curl --insecure -X GET https://localhost:7063/api/invoices \
  -H "Content-Type: application/json"
```

**Resultado Esperado (200 OK)**:
```json
[
  {
    "id": 1,
    "number": "NF-0001",
    "status": "Aberta",
    "items": [...]
  },
  {
    "id": 2,
    "number": "NF-0002",
    "status": "Aberta",
    "items": [...]
  }
]
```

**Validações**:
- ✅ Duas notas devem estar presentes
- ✅ Ambas com status "Aberta"
- ✅ Números sequenciais: NF-0001, NF-0002

---

## 🖨️ SEÇÃO 3: TESTES DE IMPRESSÃO/FECHAMENTO (INTEGRAÇÃO)

### 3.1 - Imprimir Nota Fiscal #1
**Objetivo**: Testar impressão da nota, que deve:
- Mudar status para "Fechada"
- Deduzir estoque do produto no stock-service

```bash
curl --insecure -X POST https://localhost:7063/api/invoices/1/print \
  -H "Content-Type: application/json"
```

**Resultado Esperado (200 OK)**:
```json
{
  "id": 1,
  "number": "NF-0001",
  "status": "Fechada",
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
```

**Validações**:
- ✅ Status deve mudar de "Aberta" para "Fechada"
- ✅ Response code deve ser 200 OK

---

### 3.2 - Verificar Status da Nota Após Impressão
**Objetivo**: Confirmar que o status foi persistido

```bash
curl --insecure -X GET https://localhost:7063/api/invoices/1 \
  -H "Content-Type: application/json"
```

**Resultado Esperado (200 OK)**:
```json
{
  "id": 1,
  "number": "NF-0001",
  "status": "Fechada",
  "createdAt": "2026-04-09T12:34:56.789Z",
  "items": [...]
}
```

**Validações**:
- ✅ Status deve ser "Fechada"

---

### 3.3 - Consultar Saldo do Produto #1 Após Impressão
**Objetivo**: Validar que o estoque foi deduzido corretamente

```bash
curl --insecure -X GET https://localhost:7192/api/products/1 \
  -H "Content-Type: application/json"
```

**Resultado Esperado (200 OK)**:
```json
{
  "id": 1,
  "code": "PROD-001",
  "description": "Notebook Dell Inspiron 15",
  "stockBalance": 49
}
```

**Validações**:
- ✅ `stockBalance` deve ser 49 (era 50, reduziu 1)
- ✅ O estoque foi deduzido em quantidade igual à quantidade da nota fiscal

---

## ❌ SEÇÃO 4: TESTES DE VALIDAÇÃO & ERRO

### 4.1 - Tentar Imprimir Nota Já Fechada
**Objetivo**: Testar validação de estado

```bash
curl --insecure -X POST https://localhost:7063/api/invoices/1/print \
  -H "Content-Type: application/json"
```

**Resultado Esperado (400 Bad Request)**:
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "Bad Request",
  "status": 400,
  "detail": "Nota fiscal já foi fechada."
}
```

**Validações**:
- ✅ HTTP Status Code: 400
- ✅ Mensagem deve mencionar "já foi fechada"

---

### 4.2 - Tentar Imprimir Nota Inexistente
**Objetivo**: Testar tratamento de recurso não encontrado

```bash
curl --insecure -X POST https://localhost:7063/api/invoices/999/print \
  -H "Content-Type: application/json"
```

**Resultado Esperado (404 Not Found)**:
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.4",
  "title": "Not Found",
  "status": 404,
  "detail": "Nota fiscal não encontrada."
}
```

**Validações**:
- ✅ HTTP Status Code: 404
- ✅ Mensagem deve mencionar "não encontrada"

---

### 4.3 - Tentar Criar Nota com Lista Vazia
**Objetivo**: Testar validação de entrada

```bash
curl --insecure -X POST https://localhost:7063/api/invoices \
  -H "Content-Type: application/json" \
  -d '[]'
```

**Resultado Esperado (400 Bad Request)**:
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "Bad Request",
  "status": 400,
  "detail": "Informe os IDs dos produtos e quantidades."
}
```

**Validações**:
- ✅ HTTP Status Code: 400
- ✅ Mensagem clara de validação

---

### 4.4 - Tentar Criar Nota com Produto Inexistente
**Objetivo**: Testar referência a produto inválido

```bash
curl --insecure -X POST https://localhost:7063/api/invoices \
  -H "Content-Type: application/json" \
  -d '[999]'
```

**Resultado Esperado**: Nota é criada (o sistema não valida existência)
```json
{
  "id": 3,
  "number": "NF-0003",
  "status": "Aberta",
  "items": [
    {
      "productId": 999,
      "quantity": 1
    }
  ]
}
```

**Nota**: A validação de produto pode ser implementada se necessário.

---

## ⚠️ SEÇÃO 5: TESTES DE RESILIÊNCIA (Stock-Service DOWN)

### Pré-requisito: Ter Nota #3 Criada

```bash
curl --insecure -X POST https://localhost:7063/api/invoices \
  -H "Content-Type: application/json" \
  -d '[2]'
```

---

### 5.1 - Parar o Stock-Service
**Ação no Terminal**:
```bash
# No terminal onde stock-service está rodando, pressione: Ctrl+C
```

**Validação**: Certificate que recebeu mensagem "Stopped" ou similar.

---

### 5.2 - Tentar Imprimir Nota com Stock-Service DOWN
**Objetivo**: Testar tratamento de falha em microsserviço

```bash
curl --insecure -X POST https://localhost:7063/api/invoices/3/print \
  -H "Content-Type: application/json"
```

**Resultado Esperado (502 Bad Gateway)**:
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.2",
  "title": "Bad Gateway",
  "status": 502,
  "detail": "Serviço de Estoque indisponível. A nota permanece Aberta."
}
```

**Validações**:
- ✅ HTTP Status Code: 502
- ✅ Mensagem clara indicando falha de integração
- ✅ **CRÍTICO**: Nota NÃO foi marcada como "Fechada" (operação falhou)

---

### 5.3 - Verificar que Status Permanece "Aberta"
**Objetivo**: Confirmar que a nota NÃO foi alterada em caso de erro

```bash
curl --insecure -X GET https://localhost:7063/api/invoices/3 \
  -H "Content-Type: application/json"
```

**Resultado Esperado (200 OK)**:
```json
{
  "id": 3,
  "number": "NF-0003",
  "status": "Aberta",
  "items": [...]
}
```

**Validações**:
- ✅ Status deve PERMANECER "Aberta"
- ✅ Isso garante que não houve mudança de estado em caso de erro
- ✅ Implementa o padrão de Saga (tudo ou nada)

---

### 5.4 - Reiniciar o Stock-Service
**Ação no Terminal**:
```bash
# Em novo terminal, navegue até stock-service
cd "c:\Users\joao.macanhao\Desktop\Korp_Teste_Joao_Leonardo_Macanhao\stock-service"

# Execute o serviço
dotnet run
```

**Validação**: Aguarde mensagem "Now listening on: https://localhost:7192"

---

### 5.5 - Retentar Imprimir a Nota (Deve Funcionar Agora)
**Objetivo**: Validar que a operação funciona após recuperação do serviço

```bash
curl --insecure -X POST https://localhost:7063/api/invoices/3/print \
  -H "Content-Type: application/json"
```

**Resultado Esperado (200 OK)**:
```json
{
  "id": 3,
  "number": "NF-0003",
  "status": "Fechada",
  "items": [...]
}
```

**Validações**:
- ✅ HTTP Status Code: 200
- ✅ Status agora é "Fechada"
- ✅ Recuperação bem-sucedida

---

### 5.6 - Verificar Saldo do Produto #2 Após Retentativa
**Objetivo**: Validar que o estoque foi deduzido

```bash
curl --insecure -X GET https://localhost:7192/api/products/2 \
  -H "Content-Type: application/json"
```

**Resultado Esperado (200 OK)**:
```json
{
  "id": 2,
  "code": "PROD-002",
  "description": "Mouse Logitech MX",
  "stockBalance": 99
}
```

**Validações**:
- ✅ `stockBalance` deve ser 99 (era 100, reduziu 1)

---

## 🔍 SEÇÃO 6: VALIDAÇÕES AVANÇADAS

### 6.1 - Validar Sequência de Numeração de Notas
**Objetivo**: Criar múltiplas notas e validar numeração consecutiva

```bash
# Criar 5 notas em sequence
for i in {1..5}; do
  curl --insecure -X POST https://localhost:7063/api/invoices \
    -H "Content-Type: application/json" \
    -d '[1, 2]'
done

# Listar todas
curl --insecure -X GET https://localhost:7063/api/invoices
```

**Validação**:
- ✅ Números devem ser: NF-0001, NF-0002, NF-0003, NF-0004, NF-0005, NF-0006, NF-0007
- ✅ Sem lacunas ou duplicatas

---

### 6.2 - Validar Dedução Múltipla de Estoque
**Objetivo**: Testar dedução com quantidade > 1

```bash
# Criar nota com múltiplos itens do mesmo produto
curl --insecure -X POST https://localhost:7063/api/invoices \
  -H "Content-Type: application/json" \
  -d '[1, 1, 1]'  # 3 unidades do produto 1

# Imprimir
curl --insecure -X POST https://localhost:7063/api/invoices/{id}/print \
  -H "Content-Type: application/json"

# Verificar saldo
curl --insecure -X GET https://localhost:7192/api/products/1
```

**Validação**:
- ✅ Estoque deve reduzir em 3 unidades por item

---

### 6.3 - Script de Whitespace/Caracteres Especiais
**Objetivo**: Testar validação de entrada

```bash
# Tentar criar nota com JSON malformado
curl --insecure -X POST https://localhost:7063/api/invoices \
  -H "Content-Type: application/json" \
  -d 'INVALID_JSON'
```

**Resultado Esperado (400 Bad Request)**

---

## 📊 RESUMO DE TESTES

| # | Teste | Tipo | Serviço | Esperado | Status |
|---|-------|------|---------|----------|--------|
| 1.1 | Criar Produto #1 | POST | Stock | 201 Created | [ ] |
| 1.2 | Criar Produto #2 | POST | Stock | 201 Created | [ ] |
| 1.3 | Listar Produtos | GET | Stock | 200 OK, 2 itens | [ ] |
| 1.4 | Verificar Saldo Prod | GET | Stock | 200 OK | [ ] |
| 2.1 | Criar Nota #1 | POST | Billing | 201 Created, NF-0001 | [ ] |
| 2.2 | Listar Notas | GET | Billing | 200 OK | [ ] |
| 2.3 | Criar Nota #2 | POST | Billing | 201 Created, NF-0002 | [ ] |
| 2.4 | Listar Notas | GET | Billing | 200 OK, 2 itens | [ ] |
| 3.1 | Imprimir Nota #1 | POST | Billing | 200 OK, Status=Fechada | [ ] |
| 3.2 | Verificar Status | GET | Billing | 200 OK, Fechada | [ ] |
| 3.3 | Verificar Saldo | GET | Stock | 200 OK, -1 | [ ] |
| 4.1 | Imprimir Fechada | POST | Billing | 400 Bad Request | [ ] |
| 4.2 | Imprimir Inexistente | POST | Billing | 404 Not Found | [ ] |
| 4.3 | Nota com Lista Vazia | POST | Billing | 400 Bad Request | [ ] |
| 5.2 | Imprimir COM DOWN | POST | Billing | 502 Bad Gateway | [ ] |
| 5.3 | Status Permanece | GET | Billing | Aberta | [ ] |
| 5.6 | Retentar | POST | Billing | 200 OK | [ ] |

---

## 🎯 CENÁRIOS DE TESTE CRÍTICOS

### ✅ Happy Path (Fluxo Principal)
1. Criar produto ✓
2. Criar nota ✓  
3. Imprimir nota ✓
4. Validar status mudou ✓
5. Validar estoque decresceu ✓

### ⚠️ Unhappy Path (Falhas)
1. Imprimir nota inexistente → 404 ✓
2. Imprimir nota já fechada → 400 ✓
3. Serviço de estoque down → 502 ✓
4. Status permanece "Aberta" em erro ✓

### 🔄 Resiliência
1. Recuperação após erro ✓
2. Retentativa bem-sucedida ✓

---

## 🛠️ DICAS DE TROUBLESHOOTING

| Problema | Solução |
|----------|---------|
| SSL Certificate Error | Use `--insecure` ou `-k` no cURL |
| Connection Refused | Verifique se ambos os serviços estão rodando |
| 404 Not Found | Verifique a porta (7192 vs 7063) |
| Saldo não decresceu | Verificar se print foi executado com sucesso (200 OK) |
| Nota permanece "Aberta" | Stock-Service pode estar down (esperado em teste 5) |

---

##  Glossário

- **NF-XXXX**: Numeração de Nota Fiscal (sequencial)
- **Aberta**: Nota foi criada mas não finalizada
- **Fechada**: Nota foi impressa e estoque foi deduzido
- **502 Bad Gateway**: Serviço de integração indisponível
- **Stock Balance**: Quantidade em estoque

---

**Última Atualização**: 09/04/2026
**Versão**: 1.0
