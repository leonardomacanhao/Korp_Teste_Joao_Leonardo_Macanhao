# 📦 Korp - Sistema de Gestão de Notas Fiscais e Estoque

> Solução full-stack para emissão de notas fiscais, controle de estoque e integração entre microsserviços, construída com .NET 8 e Angular 17+.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![.NET](https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet)
![Angular](https://img.shields.io/badge/Angular-17-DD0031?logo=angular)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)

---

## 📖 Sobre o Projeto

O **Korp** é um sistema empresarial que simula o fluxo real de emissão de notas fiscais com débito automático em estoque. Foi desenvolvido seguindo práticas modernas de arquitetura, separando responsabilidades entre **Stock Service** (gestão de produtos) e **Billing Service** (lógica fiscal), garantindo escalabilidade, resiliência e manutenção simplificada.

O frontend foi construído com **Angular Material** e um **Design System Fluent personalizado**, priorizando usabilidade, acessibilidade e feedback visual em tempo real.

---

## 🛠️ Tecnologias

| Camada        | Tecnologias Utilizadas                                                                 |
|---------------|----------------------------------------------------------------------------------------|
| **Backend**   | .NET 8, C#, ASP.NET Core Web API, Entity Framework Core, SQLite, FluentValidation      |
| **Frontend**  | Angular 17+, TypeScript, RxJS, Angular Material, SCSS (Fluent Design System)           |
| **Arquitetura** | Microsserviços, RESTful APIs, Saga Pattern (integração síncrona), Injeção de Dependência |
| **Banco**     | SQLite (Desenvolvimento), EF Core Migrations                                           |
| **Ferramentas** | Git, VS Code, Visual Studio 2022, Angular CLI, Postman/Swagger                         |

---

## 🏗️ Arquitetura
┌─────────────────┐ HTTP/REST ┌─────────────────┐
│ Stock Service │◄──────────────────────►│ Billing Service │
│ (:5083) │ Débito de Estoque │ (:5002) │
└─────────────────┘ ────────┬────────
│
┌──────▼──────┐
│ Frontend │
│ Angular 17 │
│ (:4200) │
└──────────────┘


- **Stock Service**: Gerencia produtos, saldos e soft delete.
- **Billing Service**: Gerencia notas fiscais, numeração sequencial e orquestra o débito no estoque.
- **Frontend**: Interface reativa com validação rigorosa, tratamento de erros e UX profissional.

---

## ✨ Funcionalidades

✅ Cadastro completo de produtos (Criar, Editar, Visualizar)  
✅ **Soft Delete**: Inativação lógica com prefixo `[INATIVO]` preservando histórico  
✅ Emissão de Notas Fiscais com numeração automática (`NF-0001`, `NF-0002`...)  
✅ Validação de estoque em tempo real antes da criação da NF  
✅ Débito automático de saldo ao "Imprimir/Fechar" a nota  
✅ **Resiliência**: Se o Stock Service estiver fora, a NF permanece "Aberta" e o usuário é notificado  
✅ UI/UX Profissional: Design System consistente, loading states, animações e acessibilidade  
✅ Tratamento de erros em camadas (Client + Server + Network)  

---

## 📋 Pré-requisitos

Antes de iniciar, certifique-se de ter instalado:
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+ & npm](https://nodejs.org/)
- [Angular CLI](https://angular.io/cli) (`npm install -g @angular/cli`)
- [Git](https://git-scm.com/)

---

## 🚀 Instalação e Execução

### 1. Clonar o repositório
```bash
git clone https://github.com/leonardomacanhao/Korp_Teste_Joao_Leonardo_Macanhao.git
cd Korp_Teste_Joao_Leonardo_Macanhao

2. Configurar e rodar o Stock Service

cd stock-service
dotnet restore
dotnet ef database update
dotnet run --urls "http://localhost:5083"

🌐 Swagger: http://localhost:5083/swagger

3. Configurar e rodar o Billing Service (novo terminal)

cd billing-service
dotnet restore
dotnet ef database update
dotnet run --urls "http://localhost:5002"

🌐 Swagger: http://localhost:5002/swagger

4. Configurar e rodar o Frontend (novo terminal)

cd frontend
npm install
ng serve

🌐 Aplicação: http://localhost:4200

🗄️ Banco de Dados
O projeto utiliza SQLite para desenvolvimento local. As migrations já estão versionadas no repositório. Para recriar os bancos do zero:

# Em cada pasta de serviço:
dotnet ef database drop --force
dotnet ef database update

💡 Nota: Arquivos .db e .db-shm/.db-wal estão ignorados pelo .gitignore.

🌐 Endpoints Principais
📦 Stock Service (:5083)
Método
Rota
Descrição
GET
/api/products
Listar produtos ativos
POST
/api/products
Criar novo produto
PUT
/api/products/{id}
Atualizar produto
DEL
/api/products/{id}
Soft delete (inativação)
PUT
/api/products/{id}/deduct
Debitar quantidade do estoque
📄 Billing Service (:5002)
Método
Rota
Descrição
GET
/api/invoices
Listar notas fiscais
POST
/api/invoices
Criar nova NF (Aberta)
POST
/api/invoices/{id}/print
Fechar NF e debitar estoque
DEL
/api/invoices/{id}
Excluir NF (apenas se Aberta)

🛡️ Resiliência e Tratamento de Falhas

O sistema foi projetado para não corromper dados em cenários de indisponibilidade:
Ao tentar fechar uma NF, o Billing Service chama o Stock Service.
Se a resposta for 502/500 ou timeout, a transação não é consolidada.
O status da NF permanece "Aberta".
O frontend exibe um SnackBar vermelho explicativo.
O usuário pode tentar novamente quando o serviço estiver estável.
Isso simula um Saga Pattern síncrono, garantindo consistência eventual e experiência transparente.

📁 Estrutura do Projeto

.
├── billing-service/      # API .NET 8 (Notas Fiscais)
│   ├── Controllers/
│   ├── Data/
│   ├── Models/
│   └── Migrations/
├── stock-service/        # API .NET 8 (Produtos/Estoque)
│   ├── Controllers/
│   ├── Data/
│   ├── Models/
│   └── Migrations/
├── frontend/             # Angular 17 Application
│   ├── src/app/
│   │   ├── core/         # Services, Interceptors, Guards
│   │   ├── features/     # Módulos de Produtos e Notas Fiscais
│   │   └── shared/       # Models, Utils
│   └── styles.scss       # Design System Global
└── README.md

👨‍ Autor
Desenvolvido por João Leonardo Macanhão
📧 [leonardomacanhao@gmail.com]
🔗 [https://www.linkedin.com/in/joao-leonardo-macanhao]
