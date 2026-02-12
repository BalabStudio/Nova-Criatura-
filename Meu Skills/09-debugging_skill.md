---
name: debugging-tecnicas
description: Técnicas e ferramentas para debugging de aplicações React. Use quando precisar investigar bugs, diagnosticar problemas ou analisar comportamento inesperado.
---

# Instrução: Debugging

Guia completo para debugging de aplicações React com técnicas e ferramentas.

## Quando usar esta skill

- Use ao investigar bugs
- Use ao diagnosticar erros difíceis de encontrar
- Use ao analisar performance
- Use ao debugar requisições de API
- Use ao identificar re-renders desnecessários

## Estrutura do Relatório de Bug

```markdown
## Descrição do Problema
[O que deveria acontecer vs. o que acontece]

## Passos para Reproduzir
1. [Passo 1]
2. [Passo 2]
3. [Passo 3]

## Comportamento Esperado
[O que deveria acontecer]

## Comportamento Atual
[O que está acontecendo]

## Contexto
- Browser: [Chrome 120]
- OS: [Windows 11]
- Ambiente: [Produção/Desenvolvimento]
- Usuário logado: [Sim/Não]

## Logs/Erros
[Colar mensagens de erro do console]

## Código Relevante
```typescript
[Trecho de código onde o problema ocorre]
```
```

## Técnicas de Debugging

### 1. Console Estratégico

```typescript
// ❌ Evitar
console.log(data);

// ✅ Usar
console.log('[ComponentName] data:', data);
console.log('[useAuth] login response:', { user, token: token?.slice(0, 10) });
console.table(users); // Para arrays

console.group('Fetch Users');
console.log('Request:', params);
console.log('Response:', data);
console.groupEnd();
```

### 2. Debugger Statement

```typescript
const handleSubmit = (data) => {
  debugger; // Pausa execução no DevTools
  processData(data);
};
```

### 3. React DevTools

- Inspecionar props e state
- Identificar re-renders desnecessários
- Profiler para performance

### 4. Network Tab

- Verificar requests/responses
- Status codes
- Payload enviado vs. recebido

## Diagnóstico por Tipo de Erro

### Erro de Renderização

```typescript
// 1. Verificar se dados existem
console.log('[Component] props:', props);

// 2. Adicionar fallback
if (!data) return <Loading />;

// 3. Verificar tipo
console.log('[Component] typeof data:', typeof data);
```

### Erro de Estado

```typescript
// 1. Logar mudanças de estado
useEffect(() => {
  console.log('[Component] state changed:', state);
}, [state]);

// 2. Verificar se estado é atualizado corretamente
const handleClick = () => {
  console.log('[Before]:', count);
  setCount(prev => {
    console.log('[Setting]:', prev + 1);
    return prev + 1;
  });
};
```

### Erro de API

```typescript
try {
  const response = await api.get('/users');
  console.log('[API] Success:', response.data);
} catch (error) {
  console.error('[API] Error:', {
    message: error.message,
    status: error.response?.status,
    data: error.response?.data,
  });
}
```

## Checklist de Debugging

- [ ] Erro reproduzível consistentemente?
- [ ] Console mostra algum erro?
- [ ] Network mostra resposta correta da API?
- [ ] Props/state estão corretos no React DevTools?
- [ ] Problema ocorre apenas em produção?
- [ ] Cache pode estar afetando?
- [ ] Variáveis de ambiente estão corretas?

## Ferramentas

- **React DevTools** — estado e props
- **Redux/Zustand DevTools** — store global
- **Network Tab** — requisições
- **React Query DevTools** — cache de queries
- **Lighthouse** — performance

## O que NUNCA fazer

❌ Deixar `console.log` em produção
❌ Assumir sem verificar
❌ Ignorar mensagens de erro
❌ Debuggar múltiplos problemas de uma vez

## Debugging de Re-renders

```typescript
// Componente que re-renderiza muito
const ExpensiveComponent = ({ data }) => {
  console.log('[ExpensiveComponent] render');
  
  // Use React DevTools Profiler para ver por que re-renderiza
  return <div>{data.map(/* ... */)}</div>;
};

// Solução: React.memo
const ExpensiveComponent = memo(({ data }) => {
  console.log('[ExpensiveComponent] render');
  return <div>{data.map(/* ... */)}</div>;
}, (prevProps, nextProps) => {
  // Custom comparison
  return prevProps.data.length === nextProps.data.length;
});
```

## Debugging de Hooks

```typescript
// Hook personalizado com logs
const useDebugValue = (value, label = 'Value') => {
  useEffect(() => {
    console.log(`[${label}] changed:`, value);
  }, [value, label]);
  
  return value;
};

// Uso
const MyComponent = () => {
  const count = useDebugValue(useState(0)[0], 'count');
  const user = useDebugValue(useUser(), 'user');
  
  return <div>{count}</div>;
};
```

## Debugging de Performance

```typescript
// Medir tempo de execução
console.time('fetchUsers');
const users = await fetchUsers();
console.timeEnd('fetchUsers');

// React Profiler API
import { Profiler } from 'react';

const onRenderCallback = (
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime
) => {
  console.log(`[${id}] ${phase}:`, actualDuration);
};

<Profiler id="UserList" onRender={onRenderCallback}>
  <UserList />
</Profiler>
```

## Debugging de Memory Leaks

```typescript
// Verificar listeners não removidos
useEffect(() => {
  const handleResize = () => console.log('resize');
  window.addEventListener('resize', handleResize);
  
  // ✅ Sempre limpar
  return () => window.removeEventListener('resize', handleResize);
}, []);

// Verificar timers não cancelados
useEffect(() => {
  const timer = setTimeout(() => doSomething(), 1000);
  
  // ✅ Sempre limpar
  return () => clearTimeout(timer);
}, []);
```

## Exemplo Completo: Debug Logger

```typescript
// utils/logger.ts
const isDev = import.meta.env.DEV;

export const logger = {
  info: (component: string, message: string, data?: unknown) => {
    if (isDev) {
      console.log(`[${component}] ${message}`, data ?? '');
    }
  },
  
  error: (component: string, message: string, error?: unknown) => {
    console.error(`[${component}] ${message}`, error ?? '');
  },
  
  group: (label: string, fn: () => void) => {
    if (isDev) {
      console.group(label);
      fn();
      console.groupEnd();
    }
  },
  
  table: (data: unknown[]) => {
    if (isDev) {
      console.table(data);
    }
  },
};

// Uso
const UserList = () => {
  const { data, isLoading, error } = useUsers();
  
  logger.info('UserList', 'Component mounted');
  logger.info('UserList', 'Loading state:', isLoading);
  
  if (error) {
    logger.error('UserList', 'Failed to fetch users', error);
  }
  
  logger.group('UserList Data', () => {
    logger.table(data);
  });
  
  return <div>...</div>;
};
```

## Debugging com Source Maps

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    sourcemap: true, // Ativa source maps em produção
  },
});
```

## Error Boundaries

```typescript
// components/ErrorBoundary.tsx
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
    // Enviar para serviço de logging (Sentry, etc)
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

// Uso
<ErrorBoundary>
  <App />
</ErrorBoundary>
```