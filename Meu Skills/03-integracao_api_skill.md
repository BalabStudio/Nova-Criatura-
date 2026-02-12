---
name: integracao-api
description: Padrões para integração com APIs REST. Use quando precisar criar services, configurar HTTP client, ou implementar hooks de data fetching.
---

# Instrução: Integração com API

Guia completo para integração com APIs usando Axios e React Query.

## Quando usar esta skill

- Use ao criar novos services de API
- Use ao configurar interceptors HTTP
- Use ao implementar hooks de data fetching
- Use ao tratar erros de API
- Use ao estruturar camada de dados

## Estrutura de Pastas

```
src/
├── services/
│   ├── api.ts           # Cliente HTTP configurado
│   ├── auth.service.ts
│   ├── user.service.ts
│   └── product.service.ts
├── hooks/
│   ├── useAuth.ts
│   └── useProducts.ts
└── types/
    └── api.types.ts
```

## Cliente HTTP Base

```typescript
// services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de Request - adiciona token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de Response - trata erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

## Estrutura de Service

```typescript
// services/user.service.ts
import api from './api';
import type { IUser, CreateUserDTO, UpdateUserDTO } from '@/types';

export const userService = {
  getAll: async (): Promise<IUser[]> => {
    const { data } = await api.get('/users');
    return data;
  },
  
  getById: async (id: string): Promise<IUser> => {
    const { data } = await api.get(`/users/${id}`);
    return data;
  },
  
  create: async (payload: CreateUserDTO): Promise<IUser> => {
    const { data } = await api.post('/users', payload);
    return data;
  },
  
  update: async (id: string, payload: UpdateUserDTO): Promise<IUser> => {
    const { data } = await api.put(`/users/${id}`, payload);
    return data;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};
```

## Hook com React Query

```typescript
// hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { toast } from 'sonner';

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: userService.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => userService.getById(id),
    enabled: !!id,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuário criado com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao criar usuário');
      console.error('[useCreateUser]:', error);
    },
  });
};
```

## Tratamento de Erros

```typescript
// utils/errorHandler.ts
interface ApiError {
  code: string;
  message: string;
  details?: string[];
}

export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as ApiError;
    
    // Erros conhecidos da API
    if (apiError?.message) {
      return apiError.message;
    }
    
    // Erros HTTP padrão
    switch (error.response?.status) {
      case 400: return 'Dados inválidos';
      case 401: return 'Sessão expirada';
      case 403: return 'Sem permissão';
      case 404: return 'Recurso não encontrado';
      case 422: return 'Dados não processáveis';
      case 429: return 'Muitas requisições. Aguarde.';
      case 500: return 'Erro interno do servidor';
      default: return 'Erro de conexão';
    }
  }
  
  return 'Erro inesperado';
};
```

## Tipagem de Respostas

```typescript
// types/api.types.ts
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: string[];
  };
}
```

## Regras Obrigatórias

1. **SEMPRE usar services** — nunca fetch/axios direto em componentes
2. **SEMPRE tipar respostas** — interfaces para request e response
3. **SEMPRE tratar erros** — try/catch + feedback ao usuário
4. **Usar React Query** — para cache e estado de servidor

## O que NUNCA fazer

❌ Fetch direto em componentes
❌ Ignorar erros (catch vazio)
❌ Hardcode de URLs (use env vars)
❌ Token em código (use localStorage/cookies seguros)
❌ Expor erros técnicos ao usuário

## Exemplo Completo: Product Service

```typescript
// services/product.service.ts
import api from './api';
import type { IProduct, ProductFilters } from '@/types';

export const productService = {
  getAll: async (filters?: ProductFilters) => {
    const { data } = await api.get('/products', { params: filters });
    return data;
  },
  
  getById: async (id: string) => {
    const { data } = await api.get(`/products/${id}`);
    return data;
  },
  
  create: async (payload: Partial<IProduct>) => {
    const { data } = await api.post('/products', payload);
    return data;
  },
  
  update: async (id: string, payload: Partial<IProduct>) => {
    const { data } = await api.put(`/products/${id}`, payload);
    return data;
  },
  
  delete: async (id: string) => {
    await api.delete(`/products/${id}`);
  },
};

// hooks/useProducts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '@/services/product.service';
import { handleApiError } from '@/utils/errorHandler';

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters?: ProductFilters) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
};

export const useProducts = (filters?: ProductFilters) => {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => productService.getAll(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productService.getById(id),
    enabled: !!id,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: productService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      toast.success('Produto criado com sucesso');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<IProduct> }) =>
      productService.update(id, data),
    onSuccess: (data) => {
      queryClient.setQueryData(productKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      toast.success('Produto atualizado');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
};
```

## Uso no Componente

```tsx
const ProductList = () => {
  const [filters, setFilters] = useState<ProductFilters>({});
  const { data: products, isLoading, error } = useProducts(filters);
  const { mutate: createProduct } = useCreateProduct();

  if (isLoading) return <ProductListSkeleton />;
  if (error) return <ErrorMessage message="Erro ao carregar produtos" />;

  return (
    <div>
      <ProductFilter onChange={setFilters} />
      {products?.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
```