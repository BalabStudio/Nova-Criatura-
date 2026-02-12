---
name: estilizacao-design-tokens
description: Sistema de estilização com CSS Modules e Design Tokens. Use quando precisar estilizar componentes, criar temas, ou definir variáveis de design.
---

# Instrução: Estilização

Sistema completo de estilização usando CSS Modules com Design Tokens como variáveis CSS.

## Quando usar esta skill

- Use ao estilizar qualquer componente
- Use ao criar ou modificar design tokens
- Use ao implementar temas (light/dark mode)
- Use ao definir breakpoints responsivos
- Use ao revisar estilos de componentes

## Abordagem

Utilizamos **CSS Modules** com **Design Tokens** como variáveis CSS.

## Design Tokens

### Cores

```css
:root {
  /* Primárias */
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
  
  /* Semânticas */
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;
  
  /* Neutras */
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-500: #6b7280;
  --color-gray-900: #111827;
  
  /* Superfícies */
  --color-background: #ffffff;
  --color-surface: #f9fafb;
  --color-border: #e5e7eb;
}
```

### Tipografia

```css
:root {
  /* Família */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'Fira Code', monospace;
  
  /* Tamanhos */
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  
  /* Pesos */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
}
```

### Espaçamentos

```css
:root {
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
}
```

### Outros Tokens

```css
:root {
  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;
  
  /* Sombras */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  
  /* Transições */
  --transition-fast: 150ms ease;
  --transition-base: 200ms ease;
  --transition-slow: 300ms ease;
  
  /* Z-index */
  --z-dropdown: 100;
  --z-modal: 200;
  --z-tooltip: 300;
}
```

## Convenção de Nomenclatura

```
--[categoria]-[elemento]-[propriedade]-[variante]-[estado]
```

### Exemplos:
- `--color-button-background-primary-hover`
- `--text-heading-size-large`
- `--space-card-padding-default`

## Estrutura de Arquivo CSS Module

```css
/* ComponentName.module.css */

/* Container principal */
.container {
  display: flex;
  padding: var(--space-4);
  background: var(--color-surface);
  border-radius: var(--radius-md);
}

/* Elementos filhos */
.title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--color-gray-900);
}

/* Variantes */
.container.primary {
  background: var(--color-primary-500);
}

/* Estados */
.container:hover {
  box-shadow: var(--shadow-md);
}

.container:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

## Regras Obrigatórias

1. **SEMPRE usar tokens** — nunca valores hardcoded
2. **Mobile-first** — começar pelo mobile, expandir com media queries
3. **Mínimo 44x44px** — áreas clicáveis para acessibilidade
4. **Nomes descritivos** — `.card-header` não `.ch`

## Breakpoints

```css
/* Mobile first */
.container { /* mobile */ }

@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
```

## O que NUNCA fazer

❌ Cores em hexadecimal direto (use tokens)
❌ Pixels para font-size (use rem)
❌ `!important` (refatore a especificidade)
❌ IDs para estilização (use classes)
❌ Estilos inline em JSX (exceto dinâmicos)

## Exemplo Completo: Card Component

```css
/* Card.module.css */
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--transition-base);
}

.card:hover {
  box-shadow: var(--shadow-md);
}

.card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
}

.card__title {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--color-gray-900);
  margin: 0;
}

.card__content {
  font-size: var(--text-base);
  color: var(--color-gray-700);
  line-height: 1.6;
}

/* Variantes */
.card--primary {
  border-color: var(--color-primary-500);
  background: var(--color-primary-50);
}

.card--error {
  border-color: var(--color-error);
  background: #fef2f2;
}

/* Responsivo */
@media (min-width: 768px) {
  .card {
    padding: var(--space-8);
  }
  
  .card__title {
    font-size: var(--text-2xl);
  }
}
```

```tsx
// Card.tsx
import styles from './Card.module.css';

interface CardProps {
  variant?: 'default' | 'primary' | 'error';
  title: string;
  children: React.ReactNode;
}

const Card = ({ variant = 'default', title, children }: CardProps) => {
  const cardClass = variant !== 'default' 
    ? `${styles.card} ${styles[`card--${variant}`]}`
    : styles.card;

  return (
    <div className={cardClass}>
      <div className={styles.card__header}>
        <h3 className={styles.card__title}>{title}</h3>
      </div>
      <div className={styles.card__content}>
        {children}
      </div>
    </div>
  );
};
```

## Dark Mode

```css
/* tokens.css */
:root {
  --color-background: #ffffff;
  --color-text: #111827;
}

[data-theme="dark"] {
  --color-background: #111827;
  --color-text: #f9fafb;
}
```

```tsx
// ThemeProvider.tsx
const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
};
```