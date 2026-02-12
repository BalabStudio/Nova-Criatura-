# Nova Criatura — Funções

## Índice
1. [Visão Geral](#visão-geral)
2. [Guia de Uso](#guia-de-uso)
3. [API](#api)
4. [Arquitetura](#arquitetura)
5. [Referência de Código](#referência-de-codigo)

---

## Visão Geral

### Descrição do Projeto
O **Nova Criatura — Funções** é uma aplicação web desenvolvida para automatizar e gerenciar o sorteio de funções (tarefas) para as reuniões da célula "Nova Criatura". A aplicação permite que cada participante selecione seu nome e a data da reunião para receber uma função aleatória, respeitando regras de restrição e evitando repetições consecutivas.

### Objetivo Principal
Facilitar a organização das reuniões de célula, garantindo uma distribuição justa e dinâmica das tarefas entre os membros.

### Problema que Resolve
- Elimina a necessidade de sorteios manuais ou papel.
- Evita que a mesma pessoa faça a mesma função em semanas seguidas (exceto para "Lanche").
- Gerencia restrições específicas de membros (ex: quem pode fazer oração ou quebra-gelo).
- Mantém um histórico centralizado das atribuições.

### Instalação
```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente (opcional para local)
# NEXT_PUBLIC_SUPABASE_URL="..."
# NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
# ADMIN_PASSWORD="..."

# Rodar em desenvolvimento
npm run dev

# Gerar build de produção
npm run build
```

---

## Guia de Uso

### Uso Básico
1. Acesse a página inicial.
2. Selecione seu nome na lista de **Participantes**.
3. Escolha a **Data** da célula no calendário.
4. Clique em **"Escolher função"**.
5. O sistema exibirá o card da sua função com a descrição e dicas.

### Casos Avançados
- **Restrições de Membros**: Alguns membros possuem filtros pré-definidos no código (`lib/assignments.ts`) que limitam quais funções eles podem sortear.
- **Capacidade do Lanche**: O sistema permite até 3 pessoas atribuídas à função "Lanche" na mesma data. Todas as outras funções são exclusivas (1 pessoa por data).
- **Prevenção de Repetição**: O sistema verifica a última função realizada pelo membro e evita sorteá-la novamente na próxima participação, promovendo o rodízio.

### Exemplos Práticos
- **Visualização da Programação**: Clique em "Ver Programação" no topo da página para ver quem ficou com cada função em uma determinada data.
- **Administração**: Membros com acesso (ex: "Richard") podem visualizar o campo de senha para realizar o reset total dos sorteios.

---

## API

### Visão Geral da API
A API é construída usando Next.js Route Handlers.

| Rota | Método | Descrição |
| :--- | :--- | :--- |
| `/api/assign` | `POST` | Realiza o sorteio e atribui uma função a um membro. |
| `/api/schedule` | `GET` | Retorna a programação completa de uma data específica. |
| `/api/reset` | `POST` | Limpa todos os sorteios (requer senha de admin). |
| `/api/random` | `GET` | Retorna um card aleatório sem salvar (uso interno/teste). |

### Funções Globais (Backend)

| Função | Parâmetros | Retorno | Descrição |
| :--- | :--- | :--- | :--- |
| `getCards()` | - | `CardItem[]` | Retorna a lista de todas as funções disponíveis em `cards.json`. |
| `assign(member, date, cardId)` | `string, string, string` | `Promise<Assignment>` | Salva uma nova atribuição no Supabase. |
| `getAssignments()` | - | `Promise<Assignment[]>` | Retorna todos os sorteios realizados. |
| `isAssigned(member, date)` | `string, string` | `Promise<boolean>` | Verifica se um membro já tem função na data. |

---

## Arquitetura

### Stack Tecnológica
- **Linguagem**: TypeScript
- **Framework**: Next.js 15+ (App Router)
- **Estilização**: CSS Vanilla (custom) + Tailwind CSS (base)
- **Validação**: Zod
- **Banco de Dados**: Supabase (PostgreSQL)

### Estrutura de Pastas
```text
nova-criatura-funcoes/
├── app/                  # Rotas e Páginas (Next.js App Router)
│   ├── api/              # Endpoints da API
│   ├── programacao/      # Página de visualização da agenda
│   └── page.tsx          # Página principal de sorteio
├── components/           # Componentes React
│   ├── ui/               # Componentes de UI (Radix/Shadcn)
│   └── calendar.tsx      # Componente de calendário customizado
├── data/                 # Arquivos de dados estáticos (JSON)
├── lib/                  # Lógica de negócio e utilitários
│   ├── assignments.ts    # Gerenciamento de sorteios (Supabase)
│   ├── cards.ts          # Carregamento e sorteio de cards
│   └── supabase.ts       # Cliente Supabase configurado
├── services/             # Camada de comunicação com a API
│   └── api.service.ts    # Centralização de chamadas fetch
└── public/               # Ativos estáticos
```

### Componentes e Responsabilidades
- **Assignments Module (`lib/assignments.ts`)**: Responsável por toda a persistência de dados no Supabase.
- **Cards Module (`lib/cards.ts`)**: Gerencia o catálogo de funções e a aleatoriedade do sorteio.
- **API Service (`services/api.service.ts`)**: Abstração das chamadas HTTP para os Route Handlers.

### Fluxos de Dados
1. **Sorteio**: Client -> API Service -> Route Handler -> Supabase -> Retorno.
2. **Consulta**: Client -> API Service -> Route Handler -> Supabase -> Mapeamento de papéis -> UI.

---

## Referência de Código

### Módulos / Arquivos

| Arquivo | Propósito | Dependências |
| :--- | :--- | :--- |
| `lib/assignments.ts` | Persistência e regras de negócio de atribuição. | `@supabase/supabase-js`, `zod` |
| `lib/cards.ts` | Carregamento e validação do catálogo de funções. | `zod`, `data/cards.json` |
| `app/api/assign/route.ts` | Orquestração do sorteio via API. | `lib/assignments`, `lib/cards` |
| `components/calendar.tsx` | UI Selector de datas. | `react` |

### Constantes Principais

| Nome | Valor | Arquivo | Propósito |
| :--- | :--- | :--- | :--- |
| `MEMBER_RESTRICTIONS` | Map de nomes para lista de IDs | `lib/assignments.ts` | Define quais funções cada membro está apto a fazer. |
| `CARD_TO_ROLE` | Map de ID do card para cargo na célula | `app/api/schedule/route.ts` | Traduz IDs técnicos para nomes amigáveis na agenda. |
| `ADMIN_PASSWORD` | Variável de ambiente ou fallback | `app/api/reset/route.ts` | Protege a função de zerar sorteios. |
