---
name: estado-dados
description: Gerenciamento de estado com useState, Zustand e React Query. Use quando precisar gerenciar estado local, global ou de servidor.
---

# Instrução: Estado e Dados

Estratégia completa para gerenciamento de estado usando useState, Zustand e React Query.

## Quando usar esta skill

- Use ao decidir onde armazenar estado
- Use ao criar stores Zustand
- Use ao implementar cache de dados do servidor
- Use ao criar custom hooks
- Use ao gerenciar estado de formulários

## Tipos de Estado

| Tipo | Ferramenta | Quando Usar |
|------|------------|-------------|
| **Local** | useState | Estado de um componente só |
| **Compartilhado** | Zustand | Estado entre componentes (UI) |
| **Servidor** | React Query | Dados da API (cache, sync) |
| **URL** | useSearchParams | Filtros, paginação |
| **Formulário** | React Hook Form | Inputs, validação |

## Estado Local (useState)

```typescript
// Apenas quando o estado não precisa ser compartilhado
const [isOpen, setIsOpen] = useState(false);
const [count, setCount] = useState(0);
```

## Estado Compartilhado (Zustand)

```typescript
// stores/useAuthStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      login: (user, token) => set({
        user,
        token,
        isAuthenticated: true,
      }),
      
      logout: () => set({
        user: null,
        token: null,
        isAuthenticated: false,
      }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

// Uso no componente
const { user, logout } = useAuthStore();
```

## Estado do Servidor (React Query)

```typescript
// hooks/useProducts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Query Keys centralizadas
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: Filters) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
};

// Hook de listagem
export const useProducts = (filters?: Filters) => {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => productService.getAll(filters),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
};

// Hook de mutação
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: productService.update,
    onSuccess: (data) => {
      // Atualiza cache específico
      queryClient.setQueryData(
        productKeys.detail(data.id),
        data
      );
      // Invalida lista
      queryClient.invalidateQueries({
        queryKey: productKeys.lists(),
      });
    },
  });
};
```

## Custom Hooks

### useToggle

```typescript
// hooks/useToggle.ts
export const useToggle = (initialValue = false) => {
  const [value, setValue] = useState(initialValue);
  
  const toggle = useCallback(() => setValue(v => !v), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);
  
  return { value, toggle, setTrue, setFalse };
};

// Uso
const { value: isOpen, toggle, setTrue: open, setFalse: close } = useToggle();
```

### useDebounce

```typescript
// hooks/useDebounce.ts
export const useDebounce = <T>(value: T, delay = 500): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  
  return debouncedValue;
};

// Uso
const SearchInput = () => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  
  const { data } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => searchApi(debouncedQuery),
    enabled: debouncedQuery.length > 2,
  });
  
  return <input value={query} onChange={(e) => setQuery(e.target.value)} />;
};
```

## Estrutura de Pastas

```
src/
├── stores/              # Zustand stores
│   ├── useAuthStore.ts
│   ├── useCartStore.ts
│   └── useUIStore.ts
├── hooks/               # Custom hooks
│   ├── useDebounce.ts
│   ├── useToggle.ts
│   └── queries/         # React Query hooks
│       ├── useProducts.ts
│       └── useUsers.ts
```

## Regras Obrigatórias

1. **React Query para dados do servidor** — nunca useEffect + useState para fetch
2. **Zustand para estado global de UI** — carrinho, tema, sidebar
3. **useState para estado local** — modais, toggles locais
4. **Hooks sempre com prefixo "use"**

## O que NUNCA fazer

❌ Props drilling > 3 níveis (use store ou context)
❌ useEffect para fetch (use React Query)
❌ Estado derivado em useState (calcule no render)
❌ Mutação direta de estado

## Exemplo Completo: Cart Store

```typescript
// stores/useCartStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  total: number;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

const calculateTotal = (items: CartItem[]) =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0);

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      total: 0,
      
      addItem: (newItem) => set((state) => {
        const existingItem = state.items.find(i => i.id === newItem.id);
        
        if (existingItem) {
          const items = state.items.map(i =>
            i.id === newItem.id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          );
          return { items, total: calculateTotal(items) };
        }
        
        const items = [...state.items, { ...newItem, quantity: 1 }];
        return { items, total: calculateTotal(items) };
      }),
      
      removeItem: (id) => set((state) => {
        const items = state.items.filter(i => i.id !== id);
        return { items, total: calculateTotal(items) };
      }),
      
      updateQuantity: (id, quantity) => set((state) => {
        if (quantity <= 0) {
          const items = state.items.filter(i => i.id !== id);
          return { items, total: calculateTotal(items) };
        }
        
        const items = state.items.map(i =>
          i.id === id ? { ...i, quantity } : i
        );
        return { items, total: calculateTotal(items) };
      }),
      
      clearCart: () => set({ items: [], total: 0 }),
    }),
    {
      name: 'cart-storage',
    }
  )
);

// Uso no componente
const Cart = () => {
  const { items, total, removeItem, updateQuantity } = useCartStore();
  
  return (
    <div>
      {items.map(item => (
        <CartItem
          key={item.id}
          item={item}
          onRemove={removeItem}
          onUpdateQuantity={updateQuantity}
        />
      ))}
      <div>Total: R$ {total.toFixed(2)}</div>
    </div>
  );
};
```

## Optimistic Updates

```typescript
export const useUpdateTodo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateTodo,
    
    // Optimistic update
    onMutate: async (newTodo) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      
      const previousTodos = queryClient.getQueryData(['todos']);
      
      queryClient.setQueryData(['todos'], (old: Todo[]) =>
        old.map(todo => todo.id === newTodo.id ? newTodo : todo)
      );
      
      return { previousTodos };
    },
    
    // Rollback on error
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(['todos'], context?.previousTodos);
    },
    
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
};
```