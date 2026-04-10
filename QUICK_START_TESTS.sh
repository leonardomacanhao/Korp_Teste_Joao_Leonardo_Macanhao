#!/bin/bash
# =====================================================
# QUICK START - COMANDOS ESSENCIAIS PARA TESTES E2E
# =====================================================
# Use este script para executar os testes principais
# Copie e cole os comandos no seu terminal (Windows PowerShell ou Git Bash)

# =====================================================
# PASSO 1: PREPARAR AMBIENTE
# =====================================================

# Terminal 1 - Iniciar Stock-Service
echo "=== INICIANDO STOCK-SERVICE ==="
cd "c:\Users\joao.macanhao\Desktop\Korp_Teste_Joao_Leonardo_Macanhao\stock-service"
dotnet run --launch-profile https

# ENQUANTO ISSO, em Terminal 2 - Iniciar Billing-Service
echo "=== INICIANDO BILLING-SERVICE ==="
cd "c:\Users\joao.macanhao\Desktop\Korp_Teste_Joao_Leonardo_Macanhao\billing-service"
dotnet run --launch-profile https

# =====================================================
# PASSO 2: EXECUTAR TESTES (em Terminal 3)
# =====================================================

# ========== TESTE 1: Criar Produtos ==========
echo "TEST 1.1: Criar Produto #1"
curl --insecure -X POST https://localhost:7192/api/products \
  -H "Content-Type: application/json" \
  -d '{"code":"PROD-001","description":"Notebook Dell","stockBalance":50}'

echo -e "\n\nTEST 1.2: Criar Produto #2"
curl --insecure -X POST https://localhost:7192/api/products \
  -H "Content-Type: application/json" \
  -d '{"code":"PROD-002","description":"Mouse Logitech","stockBalance":100}'

# ========== TESTE 2: Listar Produtos ==========
echo -e "\n\nTEST 1.3: Listar Produtos"
curl --insecure -X GET https://localhost:7192/api/products

# ========== TESTE 3: Criar Notas ==========
echo -e "\n\nTEST 2.1: Criar Nota Fiscal #1 (ID=1,2)"
curl --insecure -X POST https://localhost:7063/api/invoices \
  -H "Content-Type: application/json" \
  -d '[1]'

# ========== TESTE 4: Listar Notas ==========
echo -e "\n\nTEST 2.2: Listar Notas Fiscais"
curl --insecure -X GET https://localhost:7063/api/invoices

# ========== TESTE 5: Imprimir Nota (Integração) ==========
echo -e "\n\nTEST 3.1: Imprimir Nota #1"
curl --insecure -X POST https://localhost:7063/api/invoices/1/print \
  -H "Content-Type: application/json"

# ========== TESTE 6: Verificar Estoque Após Impressão ==========
echo -e "\n\nTEST 3.3: Verificar Saldo Produto #1 (deve ser 49)"
curl --insecure -X GET https://localhost:7192/api/products/1

# ========== TESTE 7: Erro - Imprimir Nota Fechada ==========
echo -e "\n\nTEST 4.1: Tentar Imprimir Nota Já Fechada (esperado erro 400)"
curl --insecure -X POST https://localhost:7063/api/invoices/1/print \
  -H "Content-Type: application/json"

# ========== TESTE 8: Erro - Nota Inexistente ==========
echo -e "\n\nTEST 4.2: Tentar Imprimir Nota Inexistente (esperado erro 404)"
curl --insecure -X POST https://localhost:7063/api/invoices/999/print \
  -H "Content-Type: application/json"

# ========== TESTE 9: Validação - Criar Nota Vazia ==========
echo -e "\n\nTEST 4.3: Tentar Criar Nota com Lista Vazia (esperado erro 400)"
curl --insecure -X POST https://localhost:7063/api/invoices \
  -H "Content-Type: application/json" \
  -d '[]'

# =====================================================
# PASSO 3: TESTES DE RESILIÊNCIA (Opcional)
# =====================================================

# 1. Criar nota para teste de resiliência
echo -e "\n\nTEST 5.1: Criar Nota para Teste de Resiliência"
curl --insecure -X POST https://localhost:7063/api/invoices \
  -H "Content-Type: application/json" \
  -d '[2]'

# 2. PARAR STOCK-SERVICE (Ctrl+C no Terminal 1)
echo -e "\n\n⚠️ AGORA PARE O STOCK-SERVICE (Ctrl+C no terminal 1)"
echo "Aguardando 5 segundos..."
sleep 5

# 3. Tentar imprimir com stock-service DOWN
echo -e "\n\nTEST 5.3: Imprimir com Stock-Service DOWN (esperado erro 502)"
curl --insecure -X POST https://localhost:7063/api/invoices/2/print \
  -H "Content-Type: application/json"

# 4. Verificar que status permanece "Aberta"
echo -e "\n\nTEST 5.4: Verificar que Nota permanece Aberta"
curl --insecure -X GET https://localhost:7063/api/invoices/2

# 5. REINICIAR STOCK-SERVICE (no Terminal 1)
echo -e "\n\n✅ REINICIE O STOCK-SERVICE (Terminal 1: dotnet run --launch-profile https)"
echo "Aguardando reinício..."
sleep 10

# 6. Retentar impressão
echo -e "\n\nTEST 5.6: Retentar Impressão (deve funcionar agora)"
curl --insecure -X POST https://localhost:7063/api/invoices/2/print \
  -H "Content-Type: application/json"

# 7. Verificar saldo final
echo -e "\n\nTEST 5.6: Verificar Saldo Final Produto #2 (deve ser 99)"
curl --insecure -X GET https://localhost:7192/api/products/2

# =====================================================
# FIM DOS TESTES
# =====================================================
echo -e "\n\n✅ TESTES CONCLUÍDOS!"
echo "Verifique os resultados acima e compare com os valores esperados"
