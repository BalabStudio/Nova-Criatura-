---
name: documentacao-projeto
description: Padrões para documentação de código e projeto. Use quando precisar criar READMEs, documentar APIs, ou escrever JSDoc para funções e componentes.
---

# Instrução: Documentação

Guia completo para documentação de projetos, código e APIs.

## Quando usar esta skill

- Use ao iniciar um novo projeto (criar README)
- Use ao documentar componentes públicos
- Use ao criar changelog de versões
- Use ao documentar APIs e funções
- Use ao preparar onboarding de desenvolvedores

## README do Projeto

```markdown
# Nome do Projeto

Descrição breve em uma linha.

## 🚀 Tecnologias

- React 18
- TypeScript
- Vite
- React Query
- Zustand

## 📋 Pré-requisitos

- Node.js >= 18
- npm ou yarn

## 🔧 Instalação

```bash
# Clonar repositório
git clone https://github.com/user/project.git

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env

# Rodar em desenvolvimento
npm run dev
```

## 📁 Estrutura de Pastas

```
src/
├── components/    # Componentes React (Atomic Design)
├── hooks/         # Custom hooks
├── services/      # Chamadas de API
├── stores/        # Estado global (Zustand)
├── types/         # TypeScript types
└── utils/         # Funções utilitárias
```

## 🧪 Testes

```bash
npm run test        # Rodar testes
npm run test:cov    # Cobertura
```

## 📦 Build

```bash
npm run build       # Build de produção
npm run preview     # Preview do build
```

## 🔑 Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| VITE_API_URL | URL da API | https://api.exemplo.com |
| VITE_APP_ENV | Ambiente | development |

## 📄 Licença

MIT
```

## JSDoc para Funções

```typescript
/**
 * Formata um valor numérico para moeda brasileira.
 * 
 * @param value - Valor numérico a ser formatado
 * @param showSymbol - Se deve exibir o símbolo R$ (default: true)
 * @returns String formatada como moeda
 * 
 * @example
 * formatCurrency(1234.56)
 * // => "R$ 1.234,56"
 * 
 * @example
 * formatCurrency(1234.56, false)
 * // => "1.234,56"
 */
export const formatCurrency = (value: number, showSymbol = true): string => {
  const formatted = value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return showSymbol ? `R$ ${formatted}` : formatted;
};
```

## Documentação de Componentes

```typescript
/**
 * Botão reutilizável com variantes e tamanhos.
 * 
 * @component
 * @example
 * // Botão primário
 * <Button variant="primary" onClick={handleClick}>
 *   Salvar
 * </Button>
 * 
 * @example
 * // Botão de loading
 * <Button loading disabled>
 *   Processando...
 * </Button>
 */
interface ButtonProps {
  /** Variante visual do botão */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  /** Tamanho do botão */
  size?: 'small' | 'medium' | 'large';
  /** Estado de carregamento */
  loading?: boolean;
  /** Desabilita interação */
  disabled?: boolean;
  /** Callback de clique */
  onClick?: () => void;
  /** Conteúdo do botão */
  children: React.ReactNode;
}
```

## Documentação de Hooks

```typescript
/**
 * Hook para gerenciar estado de toggle.
 * 
 * @param initialValue - Valor inicial (default: false)
 * @returns Objeto com valor e funções de controle
 * 
 * @example
 * const { value: isOpen, toggle, setTrue, setFalse } = useToggle();
 * 
 * <button onClick={toggle}>Toggle</button>
 * <button onClick={setTrue}>Abrir</button>
 * <button onClick={setFalse}>Fechar</button>
 */
export const useToggle = (initialValue = false) => {
  const [value, setValue] = useState(initialValue);
  
  const toggle = useCallback(() => setValue(v => !v), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);
  
  return { value, toggle, setTrue, setFalse };
};
```

## Changelog

```markdown
# Changelog

## [1.2.0] - 2026-01-08

### Adicionado
- Novo componente de Skeleton Loading
- Suporte a dark mode

### Modificado
- Refatoração do sistema de autenticação
- Melhoria na performance do ProductList

### Corrigido
- Bug no formulário de checkout
- Erro de cache em páginas protegidas

## [1.1.0] - 2025-12-15

### Adicionado
- Integração com Stripe Payments
- Dashboard de analytics
```

## Regras Obrigatórias

1. **README sempre atualizado** — refletir estado atual
2. **JSDoc em funções públicas** — exported functions
3. **Props documentadas** — comments em interfaces
4. **Exemplos de uso** — mostrar como usar

## O que NUNCA fazer

❌ Documentação desatualizada
❌ Comentários óbvios (// incrementa i)
❌ TODOs abandonados
❌ Código comentado (deletar ou descomentar)

## Documentação de API

```typescript
// services/user.service.ts

/**
 * Service para gerenciamento de usuários.
 * Fornece métodos para CRUD de usuários via API REST.
 */
export const userService = {
  /**
   * Lista todos os usuários.
   * 
   * @returns Promise com array de usuários
   * @throws {ApiError} Se a requisição falhar
   * 
   * @example
   * const users = await userService.getAll();
   */
  getAll: async (): Promise<IUser[]> => {
    const { data } = await api.get('/users');
    return data;
  },
  
  /**
   * Busca um usuário por ID.
   * 
   * @param id - ID do usuário
   * @returns Promise com dados do usuário
   * @throws {ApiError} Se usuário não for encontrado (404)
   * 
   * @example
   * const user = await userService.getById('123');
   */
  getById: async (id: string): Promise<IUser> => {
    const { data } = await api.get(`/users/${id}`);
    return data;
  },
};
```

## Arquivo de Contribuição

```markdown
# Contribuindo

## Como Contribuir

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Padrões de Código

- Use TypeScript
- Siga Atomic Design para componentes
- Escreva testes para novas features
- Use Design Tokens para estilos
- Mantenha cobertura > 80%

## Commits

Use Conventional Commits:

- `feat:` nova funcionalidade
- `fix:` correção de bug
- `docs:` documentação
- `style:` formatação
- `refactor:` refatoração
- `test:` testes
- `chore:` tarefas gerais

Exemplo: `feat: add user authentication`
```

## Storybook Documentation

```typescript
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Atoms/Button',
  component: Button,
  parameters: {
    docs: {
      description: {
        component: 'Botão reutilizável com múltiplas variantes e tamanhos.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'danger'],
      description: 'Variante visual do botão',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Tamanho do botão',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    children: 'Botão Primário',
    variant: 'primary',
  },
};

export const Loading: Story = {
  args: {
    children: 'Salvando...',
    loading: true,
    disabled: true,
  },
};
```

## ADR (Architecture Decision Records)

```markdown
# ADR 001: Usar Zustand para Estado Global

## Status
Aceito

## Contexto
Precisamos gerenciar estado global para autenticação, carrinho e preferências de UI.

## Decisão
Usar Zustand em vez de Redux ou Context API.

## Consequências

### Positivas
- API simples e intuitiva
- Menos boilerplate que Redux
- Performance melhor que Context API
- TypeScript nativo

### Negativas
- DevTools menos robustas que Redux
- Ecossistema menor
```