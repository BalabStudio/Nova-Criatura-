---
name: acessibilidade-wcag
description: Implementação de acessibilidade seguindo WCAG. Use quando precisar garantir acessibilidade, implementar ARIA, ou criar interfaces inclusivas.
---

# Instrução: Acessibilidade

Guia completo para implementação de acessibilidade seguindo padrões WCAG.

## Quando usar esta skill

- Use ao criar qualquer componente interativo
- Use ao implementar formulários
- Use ao criar modais e overlays
- Use ao definir hierarquia de headings
- Use ao revisar acessibilidade de páginas

## Princípios WCAG

1. **Perceptível** — informação apresentável de formas que usuários possam perceber
2. **Operável** — componentes navegáveis e operáveis
3. **Compreensível** — informação e operação compreensíveis
4. **Robusto** — compatível com tecnologias assistivas

## HTML Semântico

```typescript
// ✅ Correto: elementos semânticos
<header>
  <nav>
    <ul>
      <li><a href="/">Home</a></li>
    </ul>
  </nav>
</header>
<main>
  <article>
    <h1>Título Principal</h1>
    <section>
      <h2>Seção</h2>
    </section>
  </article>
</main>
<footer>...</footer>

// ❌ Evitar: divs para tudo
<div class="header">
  <div class="nav">
    <div class="link">Home</div>
  </div>
</div>
```

## Atributos ARIA

### Botão com Estado

```typescript
<button
  aria-pressed={isActive}
  aria-label="Favoritar produto"
  onClick={toggleFavorite}
>
  <HeartIcon />
</button>
```

### Modal

```typescript
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <h2 id="modal-title">Confirmar Ação</h2>
  <p id="modal-description">Deseja continuar?</p>
</div>
```

### Loading State

```typescript
<div aria-busy={isLoading} aria-live="polite">
  {isLoading ? <Skeleton /> : <Content />}
</div>
```

### Formulário com Erro

```typescript
<input
  id="email"
  type="email"
  aria-invalid={!!error}
  aria-describedby={error ? "email-error" : undefined}
/>
{error && <span id="email-error" role="alert">{error}</span>}
```

## Navegação por Teclado

### Focus Visível

```css
.button:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}
```

### Trap Focus em Modais

```typescript
const Modal = ({ isOpen, onClose, children }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (isOpen) {
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      const firstElement = focusableElements?.[0] as HTMLElement;
      const lastElement = focusableElements?.[focusableElements.length - 1] as HTMLElement;
      
      firstElement?.focus();
      
      const handleTab = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
        if (e.key === 'Escape') onClose();
      };
      
      document.addEventListener('keydown', handleTab);
      return () => document.removeEventListener('keydown', handleTab);
    }
  }, [isOpen, onClose]);
  
  return isOpen ? <div ref={modalRef}>{children}</div> : null;
};
```

## Imagens e Mídia

### Imagens Informativas

```typescript
<img src={product.image} alt={`${product.name} - ${product.color}`} />
```

### Imagens Decorativas

```typescript
<img src={decorative.svg} alt="" role="presentation" />
```

### Ícones com Significado

```typescript
<button aria-label="Fechar modal">
  <CloseIcon aria-hidden="true" />
</button>
```

## Contraste e Cores

```css
/* Mínimo 4.5:1 para texto normal, 3:1 para texto grande */
.text-primary {
  color: var(--color-gray-900);     /* Contraste alto */
  background: var(--color-white);
}

/* Não depender apenas de cor */
.error {
  color: var(--color-error);
  border-left: 3px solid var(--color-error); /* Indicador visual adicional */
}
```

## Componente Acessível Completo

```typescript
const Button = ({
  children,
  onClick,
  disabled,
  loading,
  ariaLabel,
}: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-busy={loading}
      aria-disabled={disabled}
    >
      {loading ? (
        <>
          <Spinner aria-hidden="true" />
          <span className="sr-only">Carregando...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};
```

## Checklist de Acessibilidade

- [ ] HTML semântico (header, main, nav, footer)
- [ ] Hierarquia de headings (h1 → h2 → h3)
- [ ] Alt text em imagens informativas
- [ ] Labels em todos os inputs
- [ ] Focus visível em elementos interativos
- [ ] Contraste mínimo 4.5:1
- [ ] Área clicável mínima 44x44px
- [ ] Navegação por teclado funcional
- [ ] Skip links para conteúdo principal
- [ ] Estados de erro anunciados

## O que NUNCA fazer

❌ `outline: none` sem alternativa
❌ Informação apenas por cor
❌ Imagens sem alt (ou alt inadequado)
❌ Formulários sem labels
❌ Contraste insuficiente
❌ Elementos interativos sem foco

## Skip Link

```typescript
// components/SkipLink.tsx
const SkipLink = () => (
  <a href="#main-content" className={styles.skipLink}>
    Pular para o conteúdo principal
  </a>
);

// styles
.skipLink {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--color-primary-500);
  color: white;
  padding: var(--space-2);
  z-index: 1000;
}

.skipLink:focus {
  top: 0;
}
```

## Screen Reader Only Text

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

```typescript
<button>
  <TrashIcon aria-hidden="true" />
  <span className="sr-only">Deletar item</span>
</button>
```

## Accordion Acessível

```typescript
const Accordion = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const contentId = useId();

  return (
    <div>
      <button
        aria-expanded={isOpen}
        aria-controls={contentId}
        onClick={() => setIsOpen(!isOpen)}
      >
        {title}
        <ChevronIcon aria-hidden="true" />
      </button>
      
      <div
        id={contentId}
        role="region"
        aria-labelledby={contentId}
        hidden={!isOpen}
      >
        {children}
      </div>
    </div>
  );
};
```

## Combobox/Autocomplete Acessível

```typescript
const Autocomplete = ({ options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const listboxId = useId();

  return (
    <div>
      <input
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-activedescendant={
          activeIndex >= 0 ? `option-${activeIndex}` : undefined
        }
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      
      {isOpen && (
        <ul id={listboxId} role="listbox">
          {options.map((option, index) => (
            <li
              key={option.id}
              id={`option-${index}`}
              role="option"
              aria-selected={index === activeIndex}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
```

## Testes de Acessibilidade

```typescript
// Button.test.tsx
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Button Accessibility', () => {
  it('should not have accessibility violations', async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  it('should be keyboard accessible', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    
    const button = screen.getByRole('button');
    button.focus();
    expect(button).toHaveFocus();
  });
});
```

## Live Regions

```typescript
const Toast = ({ message, type }) => (
  <div
    role="status"
    aria-live="polite"
    aria-atomic="true"
  >
    {message}
  </div>
);

// Para alertas urgentes
const Alert = ({ message }) => (
  <div
    role="alert"
    aria-live="assertive"
  >
    {message}
  </div>
);
```