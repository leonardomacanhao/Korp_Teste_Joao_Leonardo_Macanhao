# 🧪 ROTEIRO DE TESTES E2E - SUMÁRIO EXECUTIVO

## 📦 ENTREGÁVEIS DISPONIBILIZADOS

Três arquivo foram criados no diretório raiz do projeto:

1. **`TEST_ROTEIRO_E2E.http`** 
   - Arquivo compatível com VS Code (extensão REST Client)
   - Pronto para copiar/colar e executar
   - Basta ter a extensão "REST Client" instalada

2. **`TEST_ROTEIRO_COMPLETO_CURL.md`** 
   - Documento completo com 100+ comandos cURL
   - Explicações detalhadas de cada teste
   - Resultados esperados (JSON/HTTP Status)
   - Validações e critérios de sucesso

3. **`QUICK_START_TESTS.sh`** 
   - Script bash/powershell com os testes mais importantes
   - Referência rápida para executar
   - Bom para aprovação rápida/CI/CD

---

## 🚀 COMO EXECUTAR OS TESTES

### Método 1: VS Code (RECOMENDADO - Mais Fácil)

1. Instale a extensão "REST Client" (publicador: Huachao Mao)
2. Abra o arquivo `TEST_ROTEIRO_E2E.http`
3. Clique em "Send Request" acima de cada teste
4. Vejo o resultado no painel à direita

**Vantagem**: Interface visual, histórico, fácil validação

---

### Método 2: PowerShell (Windows)

1. Abra 3 terminais PowerShell
2. **Terminal 1 - Iniciar Stock-Service**:
   ```powershell
   cd "c:\Users\joao.macanhao\Desktop\Korp_Teste_Joao_Leonardo_Macanhao\stock-service"
   dotnet run --launch-profile https
   ```

3. **Terminal 2 - Iniciar Billing-Service**:
   ```powershell
   cd "c:\Users\joao.macanhao\Desktop\Korp_Teste_Joao_Leonardo_Macanhao\billing-service"
   dotnet run --launch-profile https
   ```

4. **Terminal 3 - Executar Testes** (copie e cole os comandos do arquivo `TEST_ROTEIRO_COMPLETO_CURL.md`)

---

### Método 3: Git Bash/WSL

```bash
chmod +x QUICK_START_TESTS.sh
./QUICK_START_TESTS.sh
```

---

## 🎯 MAPA DOS TESTES

### ✅ SEÇÃO 1: TESTES DE PRODUTO (Stock-Service)
- **1.1**: Criar Produto #1 → 201 Created
- **1.2**: Criar Produto #2 → 201 Created
- **1.3**: Listar Produtos → 200 OK, 2 itens
- **1.4**: Verificar Saldo → 200 OK, stockBalance=50

**Validando**: Produtos são criados com saldo inicial correto

---

### 📝 SEÇÃO 2: TESTES DE NOTA FISCAL (Billing-Service)
- **2.1**: Criar Nota #1 → 201 Created, NF-0001
- **2.2**: Listar Notas → 200 OK
- **2.3**: Criar Nota #2 → 201 Created, NF-0002
- **2.4**: Listar Notas → 200 OK, 2 notas, numeração sequencial

**Validando**: Notas são criadas com numeração sequencial (NF-0001, NF-0002)

---

### 🖨️ SEÇÃO 3: TESTES DE INTEGRAÇÃO (Print/Fechamento)
- **3.1**: Imprimir Nota #1 → 200 OK, Status="Fechada"
- **3.2**: Verificar Status → 200 OK, Status="Fechada"
- **3.3**: Verificar Saldo → 200 OK, stockBalance=49

**Validando**: 
- ✅ Status muda de "Aberta" para "Fechada"
- ✅ Saldo do produto decresce (50→49)
- ✅ Integração entre serviços funciona

---

### ❌ SEÇÃO 4: TESTES DE VALIDAÇÃO & ERRO
- **4.1**: Imprimir Nota Fechada → 400 Bad Request
- **4.2**: Imprimir Nota Inexistente → 404 Not Found
- **4.3**: Criar Nota Vazia → 400 Bad Request

**Validando**: Erros são tratados corretamente

---

### ⚠️ SEÇÃO 5: TESTES DE RESILIÊNCIA (Falha em Microsserviço)

**Cenário**: Stock-Service está DOWN

- **5.1**: Criar Nota (com stock-service online) → 201 Created
- **5.2**: Parar Stock-Service (Ctrl+C)
- **5.3**: Imprimir Nota → 502 Bad Gateway
- **5.4**: Verificar Status → "Aberta" (NÃO mudou!)
- **5.5**: Reiniciar Stock-Service
- **5.6**: Imprimir Novamente → 200 OK, Status="Fechada"

**Validando**: 
- ✅ Erro 502 quando serviço está down
- ✅ Status permanece "Aberta" em caso de erro (CRÍTICO)
- ✅ Funciona após recuperação (idempotência)

---

## 📊 CHECKLIST DE VALIDAÇÃO

Após executar todos os testes, o sistema está OK se:

### Produtos (Stock-Service)
- [ ] Todos os produtos foram criados
- [ ] Saldo inicial está correto (50, 100)
- [ ] Saldo decresce após impressão de nota (49, 99)

### Notas Fiscais (Billing-Service)
- [ ] Numeração é sequencial (NF-0001, NF-0002, ...)
- [ ] Status inicial é "Aberta"
- [ ] Status muda para "Fechada" após print
- [ ] Nota não pode ser impressa 2x (erro 400)

### Integração
- [ ] Stock-Service é chamado durante print
- [ ] Estoque é deduzido corretamente
- [ ] Em caso de erro do Stock, billing retorna 502
- [ ] A nota permanece "Aberta" se stock falhar

### Resiliência
- [ ] Sistema retorna 502 quando Stock está down
- [ ] Nota NÃO é marcada como "Fechada" em erro
- [ ] Sistema funciona após recuperação (retry bem-sucedido)

---

## 🔧 INTERPRETANDO RESULTADOS

### Resposta 201 Created (Sucesso)
```
Significa que o recurso foi criado com sucesso
Verifique o ID e os dados no JSON
```

### Resposta 200 OK (Sucesso)
```
Operação completada com sucesso
Consulte os dados no JSON da resposta
```

### Resposta 400 Bad Request (Erro Validação)
```
Entrada inválida (lista vazia, JSON malformado, etc)
Verifique a mensagem de erro
```

### Resposta 404 Not Found (Recurso Inexistente)
```
O recurso (nota, produto) não existe
Verifique o ID enviado
```

### Resposta 502 Bad Gateway (Serviço Indisponível)
```
Microsserviço chamado não respondeu
Verifique se Stock-Service está rodando
```

---

## 📍 COMO VALIDAR O SALDO DO PRODUTO

**Antes de Imprimir**:
```bash
curl --insecure https://localhost:7192/api/products/1
# Resultado esperado: "stockBalance": 50
```

**Depois de Imprimir Nota com 1 Item do Produto 1**:
```bash
curl --insecure https://localhost:7192/api/products/1
# Resultado esperado: "stockBalance": 49
```

**Fórmula de Validação**:
```
SaldoFinal = SaldoInicial - QuantidadeNotaFiscal
49 = 50 - 1 ✅
```

---

## 🗺️ FLUXO E2E ESPERADO

```
┌─────────────────────────────────────────────────────┐
│ 1. Criar Produto (Stock-Service)                    │
│    POST /api/products → 201 Created                 │
│    Resposta: {id: 1, stockBalance: 50}              │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ 2. Criar Nota Fiscal (Billing-Service)              │
│    POST /api/invoices → 201 Created                 │
│    Resposta: {id: 1, number: "NF-0001", status: "Aberta"} │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ 3. Imprimir Nota (Billing-Service)                  │
│    POST /api/invoices/1/print                       │
│    ┌─────────────────────────────────────────────┐  │
│    │ 3a. Chama Stock-Service                     │  │
│    │     PUT /api/products/1/deduct              │  │
│    │     Resultado: 204 No Content               │  │
│    └─────────────────────────────────────────────┘  │
│    Resposta: {status: "Fechada"}  → 200 OK         │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ 4. Validar Resultado                                │
│    GET /api/products/1 → {stockBalance: 49}        │
│    GET /api/invoices/1 → {status: "Fechada"}       │
│    ✅ Saldo decrementou ✅ Status mudou             │
└─────────────────────────────────────────────────────┘
```

---

## 🆘 TROUBLESHOOTING

| Erro | Causa | Solução |
|------|-------|---------|
| **SSL Certificate Error** | Certificado auto-assinado | Use `--insecure` ou `-k` |
| **Connection Refused** | Serviço não está rodando | Inicie stock-service ou billing-service |
| **404 Stock-Service** | URL errada | Use `https://localhost:7192` |
| **404 Billing-Service** | URL errada | Use `https://localhost:7063` |
| **Saldo não decresce** | Print retornou erro | Verifique HTTP Status e mensagem |
| **Nota permanece Aberta** | É esperado se Print falhou | Verifique se Stock-Service está online |

---

## 📄 ARQUIVOS DE REFERÊNCIA

| Arquivo | Propósito | Quando Usar |
|---------|-----------|------------|
| `TEST_ROTEIRO_E2E.http` | Testes no VS Code | Desenvolvimento interativo |
| `TEST_ROTEIRO_COMPLETO_CURL.md` | Documentação completa | Referência detalhada |
| `QUICK_START_TESTS.sh` | Script automatizado | CI/CD ou testes rápidos |
| **Este arquivo (.md)** | Sumário executivo | Overview rápido |

---

## ✨ PRÓXIMAS MELHORIAS (Opcional)

1. **Adicionar testes automáticos** com xUnit/NUnit
2. **Implementar circuit breaker** para resiliência
3. **Adicionar retry logic** no client HTTP
4. **Implementar logging** distribuído (Serilog)
5. **Health checks** para microsserviços

---

**Versão**: 1.0  
**Data**: 09/04/2026  
**Status**: ✅ Pronto para Testes

Dúvidas? Consulte o arquivo `TEST_ROTEIRO_COMPLETO_CURL.md` para detalhes completos.
