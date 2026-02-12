---
name: criacao-componentes
description: Metodologia Atomic Design para criação de componentes React. Use quando precisar criar qualquer componente novo, estruturar pastas de componentes, ou definir hierarquia de componentes.
---

# Instrução: Criação de Componentes

Guia completo para criação de componentes usando Atomic Design com 5 níveis hierárquicos.

## Quando usar esta skill

- Use ao criar qualquer componente React novo
- Use ao estruturar a hierarquia de componentes do projeto
- Use ao decidir onde um componente deve ser categorizado
- Use ao refatorar componentes existentes
- Use ao revisar PRs de componentes

## Metodologia Atomic Design

| Nível | Descrição | Exemplos |
|-------|-----------|----------|
| **Atoms** | Elementos indivisíveis | Button, Input, Label, Icon, Avatar |
| **Molecules** | Combinação de 2+ átomos | SearchBar, FormField, Card |
| **Organisms** | Seções funcionais completas | Header, Footer, ProductList, LoginForm |
| **Templates** | Layouts estruturais sem conteúdo | MainLayout, AuthLayout, DashboardLayout |
| **Pages** | Templates com dados reais | HomePage, ProductPage, ProfilePage |

## Estrutura de Pastas

```
src/components/
├── atoms/
│   └── Button/
│       ├── Button.tsx
│       ├── Button.styles.css
│       ├── Button.test.tsx
│       └── index.ts
├── molecules/
├── organisms/
├── templates/
└── pages/
```

## Estrutura de Arquivo do Componente

```tsx
// 1. Imports externos
import { useState } from 'react';

// 2. Imports internos (usar alias @/)
import { Button } from '@/components/atoms';

// 3. Tipos
import type { IUser } from '@/types';

// 4. Estilos
import styles from './ComponentName.module.css';

// 5. Interface de Props (sempre tipada)
interface ComponentNameProps {
  title: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

// 6. Componente
const ComponentName = ({ title, onClick, children }: ComponentNameProps) => {
  // Estados
  const [isActive, setIsActive] = useState(false);
  
  // Handlers
  const handleClick = () => {
    setIsActive(true);
    onClick?.();
  };
  
  // Render
  return (
    <div className={styles.container}>
      {children}
    </div>
  );
};

export default ComponentName;
```

## Regras Obrigatórias

1. **Átomos são genéricos** — sem lógica de negócio, apenas apresentação
2. **Props sempre tipadas** — nunca usar `any`
3. **Um componente por arquivo** — nomeado igual ao arquivo
4. **Composição sobre herança** — criar variantes via props, não extensão
5. **Reutilizar antes de criar** — verificar catálogo de componentes existentes

## Nomenclatura

- **Arquivos:** PascalCase (`UserCard.tsx`)
- **Props interface:** `[ComponentName]Props`
- **Handlers:** prefixo `handle` (`handleClick`, `handleSubmit`)
- **Estados booleanos:** prefixo `is/has/can` (`isLoading`, `hasError`)

## Variantes e Composição

### ✅ Correto: variantes via props
```tsx
<Button variant="primary" size="large" />
<Button variant="secondary" size="small" />
```

### ✅ Correto: composição
```tsx
const PrimaryButton = (props) => <Button variant="primary" {...props} />;
```

### ❌ Evitar: lógica condicional excessiva dentro do componente

## O que NUNCA fazer

❌ Criar componente sem verificar se já existe similar
❌ Colocar lógica de negócio em átomos
❌ Usar `any` em TypeScript
❌ Misturar níveis (átomo importando organismo)
❌ Props drilling excessivo (use Context se > 3 níveis)

## Exemplo Completo: Button Component

```tsx
// components/atoms/Button/Button.tsx
import styles from './Button.module.css';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: React.ReactNode;
}

const Button = ({
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) => {
  const classes = [
    styles.button,
    styles[variant],
    styles[size],
    loading && styles.loading,
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? 'Carregando...' : children}
    </button>
  );
};

export default Button;
```

## Checklist de Criação

Antes de finalizar um componente, verifique:

- [ ] Tipagem completa de props
- [ ] Exportação default e named export no index.ts
- [ ] Estilos usando CSS Modules e Design Tokens
- [ ] Testes unitários criados
- [ ] Documentação JSDoc para props complexas
- [ ] Acessibilidade verificada (ARIA quando necessário)
- [ ] Responsividade testada
- [ ] Componente registrado no catálogo/Storybook