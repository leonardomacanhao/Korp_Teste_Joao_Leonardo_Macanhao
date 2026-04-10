# 📑 ÍNDICE DE TESTES E2E - SISTEMA DE EMISSÃO DE NOTAS FISCAIS

## 🎯 OBJETIVO DO PROJETO

Validar o fluxo end-to-end da emissão de notas fiscais com integração entre dois microsserviços:
- **Stock-Service**: Gerencia produtos e estoque
- **Billing-Service**: Gerencia notas fiscais

---

## 📁 ARQUIVOS DE TESTE DISPONÍVEIS

### 1. 🚀 **README_TESTES.md** (COMECE AQUI)
**O quê**: Sumário executivo com instruções rápidas
**Para quem**: QA Engineers que querem começar rápido
**Tempo**: 5 minutos
- ✅ Como executar (3 métodos)
- ✅ Mapa dos testes
- ✅ Checklist de validação
- ✅ Troubleshooting

➡️ **LEIA PRIMEIRO ESTE ARQUIVO**

---

### 2. 🧪 **TEST_ROTEIRO_E2E.http** (EXECUTE AQUI)
**O quê**: Arquivo de requisições HTTP compatível com VS Code
**Para quem**: Desenvolvedores usando VS Code Rest Client
**Tempo**: Execução imediata
- ✅ Copie/cole nos terminas
- ✅ Clique em "Send Request" no VS Code
- ✅ 50+ requisições prontas

**Como usar**:
1. Instale extensão "REST Client" (Huachao Mao)
2. Abra `TEST_ROTEIRO_E2E.http`
3. Clique em "Send Request" acima de cada teste

---

### 3. 📊 **TEST_ROTEIRO_COMPLETO_CURL.md** (REFERÊNCIA DETALHADA)
**O quê**: Documentação completa com 100+ comandos cURL
**Para quem**: QA Engineers que querem profundidade total
**Tempo**: 30 minutos para ler completo
- ✅ Comandos cURL exatos
- ✅ Resultados esperados (JSON)
- ✅ Validações passo-a-passo
- ✅ Matriz de testes
- ✅ Scripts de teste avançado

---

### 4. ⚡ **QUICK_START_TESTS.sh** (AUTOMATIZADO)
**O quê**: Script bash/powershell com testes principais
**Para quem**: CI/CD pipelines ou aprovação rápida
**Tempo**: Execução automática
- ✅ 20+ testes automatizados
- ✅ Pronto para CI/CD
- ✅ Testes de resiliência inclusos

**Como usar**:
```bash
chmod +x QUICK_START_TESTS.sh
./QUICK_START_TESTS.sh
```

---

### 5. 🔌 **ENDPOINTS_DETALHADOS.md** (REFERÊNCIA TÉCNICA)
**O quê**: Mapa completo de endpoints com exemplos
**Para quem**: Desenvolvedores integrando com a API
**Tempo**: 15 minutos
- ✅ Todos os 4 endpoints de Stock
- ✅ Todos os 4 endpoints de Billing
- ✅ Fluxo de integração Print
- ✅ Matriz de testes

---

## 🗺️ GUIA RÁPIDO POR PERFIL

### 👤 **QA Engineer (Teste Manual)**
1. Leia: `README_TESTES.md` (5 min)
2. Execute: `TEST_ROTEIRO_E2E.http` no VS Code (20 min)
3. Consulte: `TEST_ROTEIRO_COMPLETO_CURL.md` (conforme necessário)

### 💻 **Desenvolvedor (.NET)**
1. Consulte: `ENDPOINTS_DETALHADOS.md`
2. Integre com: `BillingService`
3. Teste com: `quick-start tests.sh`

### 🤖 **DevOps / CI-CD**
1. Execute: `QUICK_START_TESTS.sh` em pipeline
2. Configure: Variáveis de ambiente
3. Monitore: Testes de resiliência (Seção 5)

### 📋 **Líder Técnico**
1. Entenda: `README_TESTES.md` + `Fluxo E2E`
2. Valide: `Checklist de Validação`
3. Audite: `Matriz de Casos de Teste`

---

##🎯 FLUXO DE EXECUÇÃO RECOMENDADO

### **Dia 1: Validação Básica**
```
[] Ler README_TESTES.md
[] Iniciar Stock-Service
[] Iniciar Billing-Service
[] Executar Seção 1 (Testes de Produto)
[] Executar Seção 2 (Testes de Nota Fiscal)
[] Preencher checklist ✅
```

### **Dia 2: Validação de Integração**
```
[] Executar Seção 3 (Print/Integração)
[] Validar saldos decrescent todos os IDs
[] Executar Seção 4 (Validação & Erro)
[] Verificar mensagens de erro (400, 404)
[] Preencher checklist ✅
```

### **Dia 3: Resiliência & Stress**
```
[] Executar Seção 5 (Resiliência)
[] Parar Stock-Service manualmente
[] Tentar imprimir nota (esperar erro 502)
[] Validar que status permanece "Aberta"
[] Reiniciar Stock-Service
[] Retentar impressão (deve funcionar)
[] Preencher checklist ✅
```

---

## 📊 RESUMO DE COBERTURA DE TESTES

### ✅ Funcionalidade
- [x] Criar produtos com saldo inicial
- [x] Listar produtos
- [x] Verificar saldo
- [x] Criar notas fiscais
- [x] Numeração sequencial (NF-0001, NF-0002)
- [x] Impressão/Fechamento de nota
- [x] Integração: Deduzir estoque

### ✅ Validação
- [x] Rejeitar nota vazia
- [x] Rejeitar impressão de nota já fechada
- [x] Rejeitar impressão de nota inexistente
- [x] Validar status da nota
- [x] Validar saldo do produto

### ✅ Resiliência
- [x] Erro 502 quando Stock indisponível
- [x] Nota permanece "Aberta" em erro
- [x] Recuperação após serviço voltar
- [x] Impressão bem-sucedida na retentativa

### ✅ Integração
- [x] Billing chama Stock corretamente
- [x] Stock retorna 204 No Content
- [x] Stock retorna 400 em saldo insuficiente
- [x] Tratamento de timeout
- [x] HTTP Factory Pool

---

## 🔧 TECNOLOGIAS & FERRAMENTAS

### Microsserviços
- **Framework**: ASP.NET Core 8.0
- **Banco**: SQL Server (LocalDB)
- **ORM**: Entity Framework Core 8.0
- **Pattern**: REST API

### Testes
- **Tools**: cURL, VS Code REST Client, Postman
- **Cobertura**: 
  - 50+ teste E2E
  - 7 seções temáticas
  - 3 cenários de resiliência

### CI/CD
- **Script**: Bash/PowerShell
- **Integração**: GitHub Actions (opcional)

---

## ⚠️ PRÉ-REQUISITOS

### Ambiente
- [x] .NET 8.0 SDK instalado
- [x] Visual Studio Code (opcional, para REST Client)
- [x] SQL Server LocalDB ou Dev
- [x] cURL instalado (ou WSL/Git Bash)

### Projetos
- [x] Stock-Service compilado
- [x] Billing-Service compilado
- [x] Ambos com banco de dados inicializado
- [x] Ambos rodando (2 terminais)

### Conhecimento
- [x] REST API (GET, POST, PUT)
- [x] HTTP Status Codes (200, 201, 400, 404, 502)
- [x] JSON
- [x] Básico de curl ou REST Client

---

## 📈 PROGRESSO DE EXECUÇÃO

Use esta tabela para acompanhar sua execução:

| Seção | Nome | Testes | Status | Data |
|-------|------|--------|--------|------|
| 1 | Produtos | 4 | [ ] | __/__/__ |
| 2 | Notas Fiscais | 4 | [ ] | __/__/__ |
| 3 | Print/Integração | 3 | [ ] | __/__/__ |
| 4 | Validação | 3 | [ ] | __/__/__ |
| 5 | Resiliência | 6 | [ ] | __/__/__ |
| 6 | Avançado | 2 | [ ] | __/__/__ |

---

## 🎓 O QUE VOCÊ VAI APRENDER

Ao executar todos os testes, você terá validado:

1. ✅ **REST APIs** bem estruturadas
2. ✅ **Microsserviços** comunicando corretamente
3. ✅ **Tratamento de Erros** apropriado
4. ✅ **Transações** (tudo ou nada)
5. ✅ **Integração HTTP** entre serviços
6. ✅ **Resiliência** contra falhas
7. ✅ **Status Codes Semânticos**
8. ✅ **Entity Framework Core** funcionando

---

## 📞 SUPORTE & TROUBLESHOOTING

### Erro Comum: SSL Certificate
**Solução**: Use `--insecure` ou `-k` no cURL

### Erro Comum: Connection Refused
**Solução**: Verifique se ambos serviços estão rodando
```bash
netstat -an | findstr 7192  # Stock
netstat -an | findstr 7063  # Billing
```

### Erro Comum: 404 Not Found
**Solução**: Verifique a porta (7192 vs 7063)

### Erro Comum: Saldo não decresceu
**Solução**: 
1. Verifique se impressão retornou 200 OK
2. Consulte endpoint de saldo novamente
3. Verifique se Stock-Service estava online

### Mais Detalhes
**Consulte**: `README_TESTES.md` → Seção **Troubleshooting**

---

## 📋 CHECKLIST FINAL

- [ ] Todos os serviços compilam sem erros
- [ ] Stock-Service executa sem exceções
- [ ] Billing-Service executa sem exceções
- [ ] Testes da Seção 1-4 passam 100%
- [ ] Testes de Resiliência passam (Seção 5)
- [ ] Saldos decrementam corretamente
- [ ] Status da nota muda com sucesso
- [ ] Erros retornam códigos corretos (400, 404, 502)
- [ ] Nota permanece "Aberta" em erro

---

## 🎉 PRÓXIMOS PASSOS

### Se Tudo Passou ✅
1. Documente resultados
2. Prepare relatório de testes
3. Marque conclusão do projeto

### Se Houver Falhas ❌
1. Consulte `ENDPOINTS_DETALHADOS.md`
2. Revise o fluxo no código
3. Debugue com debugger do VS Code
4. Reexecute testes

---

## 📄 ÍNDICE RÁPIDO DE ARQUIVOS

| Arquivo | Linhas | Tempo de Leitura |
|---------|--------|-----------------|
| README_TESTES.md | 200 | 5 min |
| TEST_ROTEIRO_E2E.http | 150 | 30 min (execução) |
| TEST_ROTEIRO_COMPLETO_CURL.md | 600+ | 30 min |
| ENDPOINTS_DETALHADOS.md | 400+ | 15 min |
| QUICK_START_TESTS.sh | 100 | 10 min (execução) |
| THIS FILE (INDEX) | 300+ | 10 min |

---

**🚀 COMECE AGORA**:
1. Abra `README_TESTES.md`
2. Siga as instruções
3. Sucesso! ✅

**Versão**: 1.0  
**Data**: 09/04/2026  
**Autor**: QA Engineer (.NET Expert)  
**Status**: ✅ Ready for Testing
