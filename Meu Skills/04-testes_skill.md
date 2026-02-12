---
name: testes-automatizados
description: Estratégia de testes com Vitest, React Testing Library e Playwright. Use quando precisar escrever testes unitários, de integração ou E2E.
---

# Instrução: Testes

Guia completo para testes automatizados usando Vitest, React Testing Library e Playwright.

## Quando usar esta skill

- Use ao criar testes unitários para componentes
- Use ao testar hooks personalizados
- Use ao criar testes de integração
- Use ao implementar testes E2E
- Use ao configurar mocks de API

## Estrutura

```
src/
├── components/
│   └── Button/
│       ├── Button.tsx
│       └── Button.test.tsx    # Teste junto do componente
├── hooks/
│   └── useAuth.test.ts
└── tests/
    ├── integration/           # Testes de integração
    └── e2e/                   # Testes end-to-end
```

## Stack de Testes

- **Unit/Integration:** Vitest + React Testing Library
- **E2E:** Playwright
- **Mocks:** MSW (Mock Service Worker)

## Padrão AAA (Arrange, Act, Assert)

```typescript
// Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Button from './Button';

describe('Button', () => {
  it('deve renderizar o texto corretamente', () => {
    // Arrange
    render(<Button>Clique aqui</Button>);
    
    // Act
    const button = screen.getByRole('button');
    
    // Assert
    expect(button).toHaveTextContent('Clique aqui');
  });
  
  it('deve chamar onClick ao ser clicado', () => {
    // Arrange
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Clique</Button>);
    
    // Act
    fireEvent.click(screen.getByRole('button'));
    
    // Assert
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  it('deve estar desabilitado quando disabled=true', () => {
    // Arrange
    render(<Button disabled>Desabilitado</Button>);
    
    // Act
    const button = screen.getByRole('button');
    
    // Assert
    expect(button).toBeDisabled();
  });
});
```

## Teste de Hooks

```typescript
// useCounter.test.ts
import { renderHook, act } from '@testing-library/react';
import { useCounter } from './useCounter';

describe('useCounter', () => {
  it('deve iniciar com valor padrão', () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });
  
  it('deve incrementar o contador', () => {
    const { result } = renderHook(() => useCounter());
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(1);
  });
});
```

## Teste com Mock de API

```typescript
// UserList.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import UserList from './UserList';

const mockUsers = [
  { id: '1', name: 'João' },
  { id: '2', name: 'Maria' },
];

const server = setupServer(
  http.get('/api/users', () => {
    return HttpResponse.json(mockUsers);
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('UserList', () => {
  it('deve exibir lista de usuários', async () => {
    const queryClient = new QueryClient();
    
    render(
      <QueryClientProvider client={queryClient}>
        <UserList />
      </QueryClientProvider>
    );
    
    // Loading state
    expect(screen.getByText(/carregando/i)).toBeInTheDocument();
    
    // Loaded state
    await waitFor(() => {
      expect(screen.getByText('João')).toBeInTheDocument();
      expect(screen.getByText('Maria')).toBeInTheDocument();
    });
  });
});
```

## Cobertura por Nível

| Nível | Tipo de Teste | Cobertura Mínima |
|-------|---------------|------------------|
| Atoms | Unitário | 90% |
| Molecules | Unitário + Integração | 80% |
| Organisms | Integração | 70% |
| Pages | E2E | Fluxos críticos |

## Nomenclatura de Testes

```typescript
// Formato: "deve [comportamento esperado] quando [condição]"

it('deve exibir mensagem de erro quando email é inválido')
it('deve desabilitar botão quando formulário está incompleto')
it('deve redirecionar para dashboard quando login é bem-sucedido')
```

## O que NUNCA fazer

❌ Testar implementação (teste comportamento)
❌ Testes sem assertions
❌ Dependência entre testes
❌ Dados de teste hardcoded em produção
❌ Ignorar testes flakey (conserte-os)

## Teste E2E com Playwright

```typescript
// tests/e2e/login.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test('deve fazer login com credenciais válidas', async ({ page }) => {
    // Navigate
    await page.goto('/login');
    
    // Fill form
    await page.fill('input[name="email"]', 'user@example.com');
    await page.fill('input[name="password"]', 'password123');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Assert redirect
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');
  });
  
  test('deve exibir erro com credenciais inválidas', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[name="email"]', 'wrong@example.com');
    await page.fill('input[name="password"]', 'wrongpass');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('[role="alert"]')).toContainText('Credenciais inválidas');
  });
});
```

## Exemplo Completo: FormField Component

```typescript
// FormField.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import FormField from './FormField';

describe('FormField', () => {
  it('deve renderizar label corretamente', () => {
    render(
      <FormField label="Nome">
        <input />
      </FormField>
    );
    
    expect(screen.getByText('Nome')).toBeInTheDocument();
  });
  
  it('deve exibir asterisco quando required', () => {
    render(
      <FormField label="Email" required>
        <input />
      </FormField>
    );
    
    expect(screen.getByText('*')).toBeInTheDocument();
  });
  
  it('deve exibir mensagem de erro', () => {
    render(
      <FormField label="Senha" error="Senha muito curta">
        <input />
      </FormField>
    );
    
    const error = screen.getByRole('alert');
    expect(error).toHaveTextContent('Senha muito curta');
  });
  
  it('deve renderizar children corretamente', () => {
    render(
      <FormField label="Test">
        <input data-testid="custom-input" />
      </FormField>
    );
    
    expect(screen.getByTestId('custom-input')).toBeInTheDocument();
  });
});
```

## Configuração Vitest

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/tests/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/tests/',
      ],
    },
  },
});
```

## Setup de Testes

```typescript
// src/tests/setup.ts
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

afterEach(() => {
  cleanup();
});
```