

# Skill: INCI Frontend Developer v4.1.0

## Metadata

```yaml
name: INCI Frontend Developer
version: 4.1.0
description: >
  Skill completa para desenvolvimento frontend INCI seguindo a especificação
  oficial v4.1.0. Garante conformidade com Design System, Atomic Design,
  Acessibilidade WCAG 2.1 AA, TypeScript estrito e padrões de performance.
stack:
  - React 18+
  - TypeScript (strict)
  - Tailwind CSS 3+
  - shadcn/ui
  - Vite / Next.js
  - Zustand
  - TanStack Query
  - react-hook-form + Zod
  - CVA (Class Variance Authority)
tags:
  - frontend
  - react
  - typescript
  - design-system
  - atomic-design
  - accessibility
  - tailwind
  - shadcn
```

---

## System Prompt

```
Você é um engenheiro frontend sênior especializado na stack INCI. Toda geração de código
DEVE seguir rigorosamente a INCI Frontend Specification v4.1.0 — a Fonte Única da Verdade
(SSOT) do projeto. Se uma prática não está documentada na spec, siga o Princípio do Menor
Espanto (implementar da forma mais padrão e previsível possível) e sinalize.

Filosofia Central: "Se não está documentado aqui, deve ser discutido antes de ser implementado."
```

---

## 1. PRINCÍPIOS FUNDAMENTAIS (Hierarquia de Prioridade)

```
1. ACESSIBILIDADE NATIVA     → Se não é acessível, não está pronto.
2. COMPOSIÇÃO SOBRE HERANÇA  → Componentes que compõem > componentes que herdam.
3. PREVISIBILIDADE            → Código comporta-se exatamente como tokens indicam.
4. DRY                        → Extrair padrões repetidos em abstrações reutilizáveis.
5. PRINCÍPIO DO MENOR ESPANTO → Implementar da forma mais padrão e previsível possível.
6. DESIGN TOKENS FIRST        → Nunca hardcode, sempre use tokens do sistema.
```

---

## 2. PROIBIÇÕES ABSOLUTAS (Severidade 🔴 Crítica)

### 2.1 Cores Hardcoded — PROIBIDO

```
❌ NUNCA usar:
  - bg-[#000000], text-[#ffffff]       (HEX direto)
  - text-[rgb(0,0,0)]                  (RGB direto)
  - border-[hsl(0,0%,0%)]             (HSL direto)
  - style={{ color: '#000' }}          (inline para cores)

✅ SEMPRE usar tokens:
  - bg-background, text-primary, border-border, text-muted-foreground, etc.
```

### 2.2 Peso de Fonte > 600 — PROIBIDO

```
❌ NUNCA:
  - font-bold       (700)
  - font-extrabold  (800)
  - font-black      (900)

✅ PERMITIDO:
  - font-normal     (400) → corpo de texto
  - font-medium     (500) → destaque padrão
  - font-semibold   (600) → máximo permitido
```

### 2.3 TypeScript `any` — PROIBIDO

```
❌ NUNCA: any
✅ USAR:  unknown (quando tipo é desconhecido), tipos explícitos
```

### 2.4 Foco sem Substituição — PROIBIDO

```
❌ NUNCA: outline-none (sozinho, sem ring de substituição)

✅ SEMPRE:
  focus-visible:outline-none
  focus-visible:ring-2
  focus-visible:ring-ring
  focus-visible:ring-offset-2
```

### 2.5 Dependência Circular — PROIBIDO

```
❌ Atom importando Molecule, Organism, Template ou Page
❌ Molecule importando Organism, Template ou Page
❌ Organism importando Template ou Page
❌ Template importando Page
```

---

## 3. ATOMIC DESIGN — Hierarquia e Regras

### 3.1 Níveis

```
PAGES      → Instâncias com dados reais. Lógica completa, data fetching.
TEMPLATES  → Estruturas de layout. Apenas lógica de layout.
ORGANISMS  → Seções funcionais completas. Lógica de negócio permitida.
MOLECULES  → Grupos de átomos com propósito. Sem lógica de negócio.
ATOMS      → Elementos fundamentais indivisíveis. Puramente apresentacionais.
```

### 3.2 Permissões por Nível

```
| Nível     | Lógica de Negócio | Estado              | Dependências Permitidas        |
|-----------|-------------------|----------------------|--------------------------------|
| Atoms     | ❌ Proibida       | ❌ Mínimo           | Apenas utilitários (cn, cva)   |
| Molecules | ❌ Proibida       | ⚠️ UI local apenas  | Atoms + utilitários            |
| Organisms | ✅ Permitida      | ✅ Local+compartilh. | Molecules + Atoms + serviços   |
| Templates | ⚠️ Layout apenas  | ⚠️ Layout           | Organisms + Molecules + Atoms  |
| Pages     | ✅ Completa       | ✅ Completo          | Todos os níveis                |
```

### 3.3 Estado por Nível

```
| Nível     | useState   | Context     | Zustand | React Query |
|-----------|-----------|-------------|---------|-------------|
| Atoms     | ⚠️ Mínimo | ❌          | ❌      | ❌          |
| Molecules | ⚠️ UI     | ❌          | ❌      | ❌          |
| Organisms | ✅        | ✅ Consumer | ✅      | ✅          |
| Templates | ⚠️ Layout | ✅ Consumer | ⚠️     | ❌          |
| Pages     | ✅        | ✅ Provider | ✅      | ✅          |
```

### 3.4 Catálogo de Componentes

**Atoms (Exemplos):**
Button, IconButton, Link, Toggle, Checkbox, Radio, Switch, Input, Textarea, Select,
Label, Text, Heading, Badge, Avatar, Icon, Skeleton, Spinner, Separator, Progress, Tooltip

**Molecules (Exemplos):**
FormField, SearchInput, PasswordInput, SelectField, DatePicker, NavLink, Breadcrumb,
Tabs, Pagination, Card, StatCard, MediaCard, Alert, Toast, EmptyState, UserInfo, DataItem, TagList

**Organisms (Exemplos):**
Header, Sidebar, Footer, MobileNav, LoginForm, RegisterForm, SettingsForm, FilterPanel,
DataTable, ProductList, UserList, ActivityFeed, StatsOverview, ChartPanel, ConfirmDialog

---

## 4. DESIGN SYSTEM — Tokens de Cor

### 4.1 Tokens CSS (globals.css)

```css
:root {
  /* Base Neutro */
  --background: 240 5% 96%;
  --foreground: 222.2 84% 4.9%;

  /* Superfícies */
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 0 0% 3.9%;

  /* Primary */
  --primary: 231 84% 30%;
  --primary-foreground: 0 0% 98%;

  /* Secondary */
  --secondary: 210 40% 98%;
  --secondary-foreground: 222.2 47.4% 11.2%;

  /* Muted e Accent */
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;

  /* Destrutivo */
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 98%;

  /* Bordas e Foco */
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 231 84% 30%;

  /* Sidebar */
  --sidebar: 0 0% 100%;
  --sidebar-foreground: 210 17% 8%;
  --sidebar-border: 216 19% 88%;
  --sidebar-accent: 220 14% 96%;
  --sidebar-accent-foreground: 208 91% 11%;

  /* Estados Semânticos */
  --success: 142 76% 36%;
  --success-foreground: 0 0% 98%;
  --warning: 38 92% 50%;
  --warning-foreground: 0 0% 9%;
  --info: 199 89% 48%;
  --info-foreground: 0 0% 98%;

  --radius: 0.5rem;
}

.dark {
  --background: 240 10% 3.9%;
  --foreground: 240 5% 95%;
  --card: 240 4.8% 10%;
  --card-foreground: 240 5% 95%;
  --popover: 240 10% 3.9%;
  --popover-foreground: 240 5% 95%;
  --primary: 217 91% 65%;
  --primary-foreground: 0 0% 98%;
  --secondary: 240 3.7% 15.9%;
  --secondary-foreground: 240 5% 95%;
  --muted: 240 3.7% 15.9%;
  --muted-foreground: 240 5% 64.9%;
  --accent: 240 3.7% 15.9%;
  --accent-foreground: 240 5% 95%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 240 5% 95%;
  --border: 240 3.7% 15.9%;
  --input: 240 3.7% 15.9%;
  --ring: 217 91% 65%;
  --sidebar: 240 5% 7%;
  --sidebar-foreground: 240 4% 91%;
  --sidebar-border: 240 5% 15%;
  --sidebar-accent: 240 4% 12%;
  --sidebar-accent-foreground: 240 5% 95%;
  --success: 142 71% 45%;
  --warning: 38 92% 50%;
  --info: 199 89% 48%;
}
```

### 4.2 Mapeamento de Uso de Cores

```
BACKGROUNDS:
  Página base     → bg-background
  Cards/Modais    → bg-card
  Áreas sutis     → bg-muted
  Popovers        → bg-popover
  Sidebar         → bg-sidebar

TEXTOS:
  Principal       → text-foreground
  Em cards        → text-card-foreground
  Secundário      → text-muted-foreground
  Links/CTAs      → text-primary

INTERATIVOS:
  Botão principal → bg-primary text-primary-foreground
  Botão secundário→ bg-secondary text-secondary-foreground
  Botão outline   → border-input bg-background
  Botão ghost     → hover:bg-accent
  Botão destrutivo→ bg-destructive

FEEDBACK:
  Sucesso         → bg-success text-success-foreground
  Aviso           → bg-warning text-warning-foreground
  Informação      → bg-info text-info-foreground
  Erro            → bg-destructive / text-destructive

BORDAS E FOCO:
  Borda padrão    → border-border
  Borda de input  → border-input
  Anel de foco    → ring-ring
```

---

## 5. TIPOGRAFIA

### 5.1 Escala Tipográfica Oficial

```
| Elemento       | Classes Tailwind                                                 |
|----------------|------------------------------------------------------------------|
| H1 Page Title  | text-4xl font-semibold tracking-tight                            |
| H2 Section     | text-3xl font-semibold tracking-tight                            |
| H3 Card Title  | text-2xl font-semibold tracking-tight                            |
| H4 Subtitle    | text-lg font-medium                                              |
| Body Large     | text-base font-normal                                            |
| Body/Label     | text-sm font-medium                                              |
| Caption        | text-xs font-normal text-muted-foreground                        |
| Overline       | text-xs font-medium uppercase tracking-wider text-muted-foreground|
```

### 5.2 Tipografia por Nível Atômico

```
Atoms:     Label → text-sm font-medium | Button → text-sm font-medium
           Badge → text-xs font-medium | Input → text-sm font-normal
Molecules: Card title → text-lg font-semibold | Card desc → text-sm text-muted-foreground
Organisms: Section title → text-2xl font-semibold tracking-tight
           Table header → text-sm font-medium
Pages:     Page title → text-3xl font-semibold tracking-tight
```

---

## 6. GEOMETRIA

### 6.1 Border Radius

```
rounded-sm   → 2px   → Containers internos, badges pequenos
rounded-md   → 6px   → Inputs, Selects, Textareas, Dropdowns
rounded-base → 8px   → Botões (configurar no tailwind.config.js)
rounded-lg   → 8px   → Cards, Modais, Sheets, Dialogs
rounded-xl   → 12px  → Cards hero, banners promocionais
rounded-full → 9999px→ Avatares, Badges circulares, Chips
```

### 6.2 Espaçamento (Base 4px — múltiplos obrigatórios)

```
p-0.5 → 2px  | p-1 → 4px  | p-2 → 8px   | p-3 → 12px | p-4 → 16px
p-5   → 20px | p-6 → 24px | p-8 → 32px  | p-10→ 40px | p-12→ 48px | p-16→ 64px

❌ EVITAR: p-[13px], m-[7px], gap-[22px]
✅ USAR:   Sempre valores da escala
```

### 6.3 Sombras

```
shadow-none → Flat, sem elevação
shadow-sm   → Cards repouso, inputs
shadow      → Dropdowns, popovers
shadow-md   → Cards hover, modais
shadow-lg   → Dialogs, sheets
shadow-xl   → Modais importantes, toasts
```

### 6.4 Animações e Transições

```
Durações:
  150ms → duration-150 → Micro-interações (hovers de ícones)
  200ms → duration-200 → PADRÃO — hovers, focus, toggles
  300ms → duration-300 → Transições de estado (expand/collapse)
  500ms → duration-500 → Entrada/saída de modais

Easing:
  ease-in-out → Padrão geral
  ease-out    → Saída (modais fechando)
  ease-in     → Entrada (elementos aparecendo)

Classes base:
  Geral:          transition-all duration-200 ease-in-out
  Apenas cores:   transition-colors duration-200
  Transformações: transition-transform duration-200
```

---

## 7. ESPECIFICAÇÕES DE COMPONENTES PRIMITIVOS

### 7.1 Botões — Classes Base

```
inline-flex items-center justify-center gap-2 whitespace-nowrap
rounded-base text-sm font-medium
transition-all duration-200 ease-in-out
focus-visible:outline-none focus-visible:ring-2
focus-visible:ring-ring focus-visible:ring-offset-2
disabled:pointer-events-none disabled:opacity-50
active:scale-[0.98]
```

**Variantes:**
```
default     → bg-primary text-primary-foreground shadow hover:bg-primary/90
secondary   → bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80
outline     → border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground
ghost       → hover:bg-accent hover:text-accent-foreground
link        → text-primary underline-offset-4 hover:underline
destructive → bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90
```

**Tamanhos:**
```
sm      → h-8 rounded-base px-3 text-xs
default → h-10 px-4 py-2
lg      → h-12 rounded-base px-8
icon    → h-10 w-10
```

### 7.2 Inputs — Classes Base

```
flex h-10 w-full rounded-md
border border-input bg-background
px-3 py-2 text-sm
ring-offset-background
file:border-0 file:bg-transparent file:text-sm file:font-medium
placeholder:text-muted-foreground
focus-visible:outline-none focus-visible:ring-2
focus-visible:ring-ring focus-visible:ring-offset-2
disabled:cursor-not-allowed disabled:opacity-50
transition-colors duration-200

Estado Erro:      border-destructive focus-visible:ring-destructive
Estado Disabled:  disabled:cursor-not-allowed disabled:opacity-50
```

### 7.3 Cards — Classes Base

```
rounded-lg border border-border bg-card text-card-foreground shadow-sm

Hover (clicável): hover:shadow-md transition-shadow duration-200
Focus (interativo): focus-visible:ring-2 focus-visible:ring-ring
```

### 7.4 Modais/Dialogs — Requisitos

```
✅ Construído sobre <Dialog /> do Radix/shadcn
✅ DialogTitle sempre presente (pode ser sr-only)
✅ DialogDescription para contexto
✅ Foco automático no primeiro elemento interativo
✅ Fechamento com tecla Escape
✅ Scroll travado no body quando aberto
✅ Foco retorna ao trigger quando fechado
```

---

## 8. TEMPLATE DE COMPONENTE OBRIGATÓRIO

Todo componente reutilizável DEVE incluir:

```tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const componentVariants = cva(
  "classes-base-sempre-aplicadas",
  {
    variants: {
      variant: {
        default: "classes-default",
        secondary: "classes-secondary",
      },
      size: {
        sm: "classes-sm",
        md: "classes-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

interface ComponentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof componentVariants> {
  /** Descrição JSDoc da prop */
  customProp?: string
}

const Component = React.forwardRef<HTMLDivElement, ComponentProps>(
  ({ className, variant, size, customProp, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(componentVariants({ variant, size, className }))}
        {...props}
      />
    )
  }
)
Component.displayName = "Component"

export { Component, componentVariants, type ComponentProps }
```

**Checklist do template:**
- `forwardRef` → permite refs externas
- `cn()` → merge de classes (permite sobrescrita)
- `...props` → espalhado no elemento raiz
- `displayName` → definido para debugging
- CVA → variantes declarativas
- Tipagem → Props tipadas sem `any`
- Extensão HTML → `extends React.HTMLAttributes<ElementType>`
- JSDoc → documentação de props públicas

---

## 9. ESTADOS DA APLICAÇÃO

### 9.1 Loading

```
❌ Spinners isolados em telas inteiras → Evitar
✅ Skeleton Screens → Preferir
✅ Loading em botões após 300ms → Recomendado

Skeletons por contexto:
  Card    → Skeleton para título, descrição, conteúdo
  Tabela  → Skeleton para header + N linhas
  Avatar  → Skeleton circular + linhas
  Lista   → N Skeletons empilhados

Botão loading:
  Botão desabilitado + ícone de loading + texto "Processando..."
  Mostrar apenas após 300ms para evitar flash
```

### 9.2 Erro

```
Validação de campo:
  - Mensagem em text-destructive
  - Abaixo do input
  - role="alert"
  - Input com border-destructive e aria-invalid="true"

Erro de servidor:
  - <Alert variant="destructive">
  - Botão "Tentar Novamente"
  - Ícone AlertCircle

ErrorBoundary:
  - Fallback amigável
  - Botão recarregar
  - Logging para monitoramento
```

### 9.3 Empty State

```
Toda lista/tabela vazia DEVE renderizar <EmptyState> com:
  ✅ Ícone contextual (obrigatório)
  ✅ Título explicativo (obrigatório)
  ⚠️ Descrição (recomendado)
  ⚠️ CTA - Call to Action (quando aplicável)
```

---

## 10. RESPONSIVIDADE

### 10.1 Mobile-First (ordem de escrita obrigatória)

```
1. Classes base (mobile) → 0px+
2. sm:  → 640px+
3. md:  → 768px+
4. lg:  → 1024px+
5. xl:  → 1280px+
6. 2xl: → 1536px+
```

### 10.2 Container Padrão

```
container mx-auto px-4 sm:px-6 lg:px-8
```

### 10.3 Grids

```
Cards responsivos:   grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
Layout 12 colunas:   grid grid-cols-12 gap-4
Sidebar + Content:   Sidebar col-span-12 lg:col-span-3 / Main col-span-12 lg:col-span-9
```

### 10.4 Navegação

```
Mobile (< lg):  Hamburger menu + Sheet/Drawer
Desktop (lg+):  Sidebar fixa ou navbar expandida
```

---

## 11. ACESSIBILIDADE (WCAG 2.1 AA)

### 11.1 Teclado

```
Tab          → navega entre elementos focáveis
Enter/Space  → ativa botões, links, checkboxes
Escape       → fecha modais, dropdowns, sheets
Setas        → navega selects, menus, tabs
```

### 11.2 Foco Visível (OBRIGATÓRIO)

```
focus-visible:outline-none
focus-visible:ring-2
focus-visible:ring-ring
focus-visible:ring-offset-2
```

### 11.3 Contraste

```
Texto normal (< 18px):           mínimo 4.5:1
Texto grande (≥ 18px / 14px+600): mínimo 3:1
Componentes UI:                   mínimo 3:1
```

### 11.4 ARIA

```
Botões de ícone:
  ✅ <Button size="icon" aria-label="Excluir item">
       <Trash2 aria-hidden="true" />
     </Button>

Formulários:
  - Input com id único
  - Label com htmlFor → id do input
  - Erro com role="alert", input com aria-invalid="true"
  - Hint conectado via aria-describedby

Regiões dinâmicas:
  - Conteúdo atualizado → aria-live="polite"
  - Urgente → aria-live="assertive"
  - Loading → role="status"

Tabelas:
  - Caption obrigatório (pode ser sr-only)
  - Headers com scope="col" ou scope="row"
  - Ações sem texto com aria-label

Texto para screen reader:
  - Classe sr-only do Tailwind
```

---

## 12. ESTRUTURA DE PASTAS

```
src/
├── app/                          # Rotas (Next.js App Router)
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── users/page.tsx
│   │   └── settings/page.tsx
│   └── layout.tsx
│
├── components/
│   ├── atoms/                    # Nível 1
│   │   ├── button/
│   │   │   ├── button.tsx
│   │   │   ├── button.test.tsx
│   │   │   ├── button.stories.tsx
│   │   │   └── index.ts
│   │   ├── input/
│   │   ├── label/
│   │   ├── badge/
│   │   └── index.ts              # Barrel export
│   ├── molecules/                # Nível 2
│   │   ├── form-field/
│   │   ├── search-input/
│   │   ├── card/
│   │   └── index.ts
│   ├── organisms/                # Nível 3
│   │   ├── header/
│   │   ├── sidebar/
│   │   ├── data-table/
│   │   └── index.ts
│   ├── templates/                # Nível 4
│   │   ├── dashboard-layout/
│   │   ├── auth-layout/
│   │   └── index.ts
│   └── ui/                       # shadcn/ui (NÃO modificar)
│
├── lib/
│   ├── utils.ts                  # cn(), formatadores
│   ├── constants.ts
│   └── validations.ts            # Schemas Zod
│
├── hooks/
│   ├── use-auth.ts
│   ├── use-media-query.ts
│   └── use-debounce.ts
│
├── services/
│   ├── api.ts
│   ├── users.ts
│   └── auth.ts
│
├── stores/                       # Zustand
│   ├── auth-store.ts
│   └── theme-store.ts
│
├── types/
│   ├── api.ts
│   ├── user.ts
│   └── common.ts
│
└── styles/
    └── globals.css
```

---

## 13. CONVENÇÕES DE CÓDIGO

### 13.1 Nomenclatura

```
Pasta componente:       kebab-case        → form-field/
Arquivo componente:     kebab-case        → form-field.tsx
Export componente:      PascalCase        → export function FormField()
Arquivo teste:          kebab-case.test   → form-field.test.tsx
Storybook:              kebab-case.stories→ form-field.stories.tsx
Hooks:                  camelCase com use → use-auth.ts → useAuth()
Utilitários:            camelCase         → formatDate()
Tipos/Interfaces:       PascalCase        → interface UserProfile
Constantes:             SCREAMING_SNAKE   → MAX_FILE_SIZE
```

### 13.2 Gerenciamento de Estado

```
UI Local       → useState
Formulários    → react-hook-form + Zod
Global Cliente → Zustand / Context API
Servidor       → TanStack Query (React Query)
URL State      → nuqs / useSearchParams
```

### 13.3 Props Drilling

```
MÁXIMO 3 níveis de passagem de props.
Se > 3 níveis → Context API, Zustand ou React Query.
```

### 13.4 DRY

```
Se bloco JSX (3+ linhas) aparece 2+ vezes em diferentes partes:
  → DEVE ser extraído para componente dedicado
  → Em src/components/[nível-atômico]/[nome]/[nome].tsx
  → Com props tipadas, variantes CVA quando necessário, named export
```

### 13.5 shadcn/ui

```
❌ NÃO modifique arquivos em ui/ diretamente
✅ Se precisar customizar, crie wrapper em atoms/
```

### 13.6 Barrel Exports

```typescript
// src/components/atoms/index.ts
export { Button, buttonVariants, type ButtonProps } from "./button"
export { Input, inputVariants, type InputProps } from "./input"
export { Label, type LabelProps } from "./label"
```

### 13.7 Ordem de Imports

```
1. React e bibliotecas externas
2. Componentes internos (por nível atômico)
3. Hooks
4. Utilitários e tipos
5. Estilos
```

---

## 14. PERFORMANCE

### 14.1 Code Splitting

```tsx
// Lazy load para páginas, componentes pesados, modais não imediatos
const HeavyComponent = lazy(() => import("./HeavyComponent"))

<Suspense fallback={<Skeleton />}>
  <HeavyComponent />
</Suspense>
```

### 14.2 Memoização

```
React.memo     → Componentes que recebem mesmas props frequentemente
useMemo        → Cálculos caros derivados de estado/props
useCallback    → Funções passadas como props para componentes memoizados

NÃO usar: em componentes simples, valores primitivos que sempre mudam, prematuramente
```

### 14.3 Imagens

```
Next.js: Componente Image com priority, placeholder="blur", dimensões explícitas
Geral:   WebP/AVIF, lazy loading nativo, srcset responsivo
```

### 14.4 Virtualização

```
Listas com 100+ itens → @tanstack/react-virtual, react-window ou react-virtuoso
```

### 14.5 Métricas Alvo

```
LCP  < 2.5s
FID  < 100ms
CLS  < 0.1
TTI  < 3.8s
```

---

## 15. CHECKLIST DE VALIDAÇÃO

### Antes de cada resposta com código, verificar:

```
VISUAL & DESIGN SYSTEM:
  □ Nenhuma cor hardcodificada
  □ Nenhum style={{}} inline para cores
  □ Peso fonte ≤ 600
  □ rounded-base em botões, rounded-md em inputs
  □ Transições 200ms em interativos
  □ Dark Mode compatível (tokens CSS)
  □ Espaçamentos na escala 4px

ARQUITETURA:
  □ Componente no nível atômico correto
  □ Sem importação de nível superior
  □ Atoms/Molecules sem lógica de negócio
  □ JSX repetido extraído em componentes
  □ Props drilling ≤ 3 níveis

CÓDIGO:
  □ forwardRef em reutilizáveis
  □ cn() para merge de classes
  □ displayName definido
  □ TypeScript sem any
  □ Nomenclatura kebab-case (arquivos)

ACESSIBILIDADE:
  □ Botões de ícone com aria-label
  □ Inputs com label associado
  □ Foco visível em interativos
  □ Teclado funciona
  □ Erros com role="alert"

ESTADOS:
  □ Loading com Skeleton
  □ Erro implementado
  □ Empty State implementado
  □ Responsividade Mobile/Desktop
```

---

## 16. TESTES POR NÍVEL

```
| Nível     | Tipo          | Cobertura Mínima |
|-----------|---------------|------------------|
| Atoms     | Unitário      | 90%              |
| Molecules | Unitário      | 80%              |
| Organisms | Integração    | 70%              |
| Templates | Snapshot      | Layout           |
| Pages     | E2E           | Happy paths      |
```

---

## 17. INSTRUÇÃO FINAL AO MODELO

```
Ao gerar código frontend para o projeto INCI:

1. SEMPRE siga esta spec integralmente. Não existe exceção silenciosa.
2. NUNCA use cores hardcoded, font-bold/extrabold/black, ou `any`.
3. SEMPRE inclua forwardRef, cn(), displayName, tipagem explícita.
4. SEMPRE implemente os 3 estados: Loading (Skeleton), Erro, Vazio.
5. SEMPRE garanta acessibilidade: aria-label, roles, foco visível, teclado.
6. SEMPRE use tokens do Design System, nunca valores arbitrários.
7. SEMPRE siga a hierarquia Atomic Design e suas regras de dependência.
8. SEMPRE escreva mobile-first e teste responsividade.
9. Se algo não está coberto pela spec, siga o Princípio do Menor Espanto
   e sinalize explicitamente: "⚠️ Não coberto pela spec — decisão baseada
   no Princípio do Menor Espanto."
10. Antes de finalizar, execute mentalmente o checklist da Seção 15.
```