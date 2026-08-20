# Korp — Gestão de notas fiscais e estoque

Aplicação full-stack para cadastro de produtos, emissão de notas fiscais e baixa de estoque. A solução separa o domínio de faturamento do domínio de estoque e oferece uma interface web responsiva.

## Tecnologias

- .NET 8, ASP.NET Core Web API e Entity Framework Core 8
- SQLite com migrations versionadas
- Angular 18, TypeScript, RxJS, Angular Material e SCSS
- xUnit para testes automatizados do backend

## Arquitetura

```text
Angular (:4200)
   ├── Stock Service (:5083) ── produtos, saldo e operações de estoque
   └── Billing Service (:5002) ── notas fiscais
              └── Stock Service ── baixa atômica em lote
```

O frontend organiza código por responsabilidade:

- `core`: configuração e serviços compartilhados da aplicação;
- `features`: telas agrupadas por funcionalidade;
- `shared`: contratos usados por mais de uma funcionalidade.

A identidade da aplicação fica centralizada em `frontend/src/app/core/config/application.config.ts`. Nome, sigla e descrição são alterados em um único lugar e refletidos no título, cabeçalho, página inicial e rodapé.

### Consistência da impressão

Ao imprimir uma nota, o Billing Service envia todos os itens ao Stock Service em uma única requisição. O Stock Service:

1. agrupa itens repetidos;
2. valida produto, atividade e saldo;
3. aplica as baixas dentro de uma transação;
4. registra um identificador único da operação.

O identificador torna a operação idempotente: uma repetição da mesma impressão não baixa o estoque duas vezes. As atualizações de saldo são condicionais no banco (`saldo >= quantidade`), evitando saldo negativo em requisições concorrentes. O Billing só fecha a nota após o Stock confirmar a baixa.

Essa é uma integração HTTP síncrona com idempotência; não é uma transação distribuída nem uma Saga completa. Se a resposta se perder depois da baixa, uma nova tentativa reutiliza o mesmo identificador, recebe sucesso do Stock e permite que o Billing conclua o fechamento.

## Funcionalidades

- cadastro, edição, listagem e inativação lógica de produtos;
- código de produto único;
- criação de notas com validação de itens no cliente e no servidor;
- numeração sequencial no formato `NF-0001`;
- impressão/fechamento com baixa atômica de estoque;
- proteção contra baixa duplicada e concorrente;
- exclusão apenas de notas abertas;
- estados de carregamento e mensagens de erro na interface.

## Pré-requisitos

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js](https://nodejs.org/) e npm

## Execução local

### 1. Stock Service

```powershell
cd stock-service
dotnet restore
dotnet ef database update
dotnet run
```

Swagger: <http://localhost:5083/swagger>

### 2. Billing Service

Em outro terminal:

```powershell
cd billing-service
dotnet restore
dotnet ef database update
dotnet run
```

Swagger: <http://localhost:5002/swagger>

### 3. Frontend

Em outro terminal:

```powershell
cd frontend
npm ci
npm start
```

Aplicação: <http://localhost:4200>

As URLs dos serviços ficam nos arquivos de ambiente do Angular. Origens permitidas, conexão com o banco e endereço do Stock Service ficam nos respectivos `appsettings.json` e podem ser sobrescritos por variáveis de ambiente.

## Endpoints principais

### Stock Service

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/products` | Lista produtos ativos |
| `GET` | `/api/products/{id}` | Consulta um produto ativo |
| `POST` | `/api/products` | Cria um produto |
| `PUT` | `/api/products/{id}` | Atualiza um produto |
| `DELETE` | `/api/products/{id}` | Inativa um produto |
| `POST` | `/api/products/deductions` | Executa baixa idempotente em lote |

### Billing Service

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/invoices` | Lista notas e itens |
| `GET` | `/api/invoices/{id}` | Consulta uma nota |
| `POST` | `/api/invoices` | Cria uma nota aberta |
| `POST` | `/api/invoices/{id}/print` | Baixa o estoque e fecha a nota |
| `DELETE` | `/api/invoices/{id}` | Exclui uma nota aberta |

## Validação

Na raiz do repositório:

```powershell
dotnet test stock-service.Tests/stock-service.Tests.csproj
dotnet test billing-service.Tests/billing-service.Tests.csproj

cd frontend
npm run build
```

Os testes cobrem rollback por saldo insuficiente, idempotência, concorrência de baixa e manutenção do estado da nota em respostas de sucesso ou falha do Stock Service.

## Estrutura

```text
.
├── billing-service/        # API de faturamento
├── billing-service.Tests/  # testes de faturamento
├── stock-service/          # API de produtos e estoque
├── stock-service.Tests/    # testes de estoque
└── frontend/               # aplicação Angular
```

## Autor

João Leonardo Macanhão<br>
[LinkedIn](https://www.linkedin.com/in/joao-leonardo-macanhao) · [E-mail](mailto:leonardomacanhao@gmail.com)
