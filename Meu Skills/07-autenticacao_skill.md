---
name: autenticacao-seguranca
description: Implementação de autenticação com tokens JWT. Use quando precisar implementar login, rotas protegidas, ou gerenciar sessões de usuário.
---

# Instrução: Autenticação

Guia completo para implementação de autenticação e autorização com JWT.

## Quando usar esta skill

- Use ao implementar sistema de login/logout
- Use ao criar rotas protegidas
- Use ao gerenciar tokens de autenticação
- Use ao implementar refresh tokens
- Use ao controlar permissões de usuário

## Fluxo de Autenticação

```
Login → Recebe Token → Armazena → Envia em Requisições → Refresh/Logout
```

## Store de Autenticação

```typescript
// stores/useAuthStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  setAuth: (user: User, token: string, refreshToken: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,
      
      setAuth: (user, token, refreshToken) => set({
        user,
        token,
        refreshToken,
        isAuthenticated: true,
        isLoading: false,
      }),
      
      clearAuth: () => set({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      }),
      
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
      }),
    }
  )
);
```

## Service de Autenticação

```typescript
// services/auth.service.ts
import api from './api';
import { useAuthStore } from '@/stores/useAuthStore';

export const authService = {
  login: async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    useAuthStore.getState().setAuth(data.user, data.token, data.refreshToken);
    return data;
  },
  
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      useAuthStore.getState().clearAuth();
    }
  },
  
  refreshToken: async () => {
    const { refreshToken } = useAuthStore.getState();
    const { data } = await api.post('/auth/refresh', { refreshToken });
    useAuthStore.getState().setAuth(data.user, data.token, data.refreshToken);
    return data.token;
  },
  
  getMe: async () => {
    const { data } = await api.get('/auth/me');
    return data;
  },
};
```

## Componente de Rota Protegida

```typescript
// components/auth/ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

const ProtectedRoute = ({ children, requiredRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const location = useLocation();
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  if (requiredRoles && !requiredRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <>{children}</>;
};

// Uso nas rotas
<Route
  path="/dashboard"
  element={
    <ProtectedRoute requiredRoles={['admin', 'user']}>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

## Interceptor com Refresh Token

```typescript
// services/api.ts
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const newToken = await authService.refreshToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch {
        authService.logout();
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);
```

## Hook de Autenticação

```typescript
// hooks/useAuth.ts
export const useAuth = () => {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const navigate = useNavigate();
  
  const login = async (email: string, password: string) => {
    await authService.login(email, password);
    navigate('/dashboard');
  };
  
  const logout = async () => {
    await authService.logout();
    navigate('/login');
  };
  
  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
};
```

## Regras Obrigatórias

1. **Token em httpOnly cookie** (preferencial) ou localStorage
2. **Refresh token** para renovação automática
3. **Interceptors** para adicionar token automaticamente
4. **Rotas protegidas** com componente wrapper
5. **Loading state** durante verificação inicial

## O que NUNCA fazer

❌ Token em código/variável global
❌ Senha em localStorage
❌ Rota protegida sem loading state
❌ Ignorar expiração de token

## Exemplo Completo: Login Page

```typescript
// pages/LoginPage.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

type LoginData = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginData) => {
    try {
      await login(data.email, data.password);
    } catch (error) {
      toast.error('Credenciais inválidas');
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormField label="Email" error={errors.email?.message}>
          <Input type="email" {...register('email')} />
        </FormField>

        <FormField label="Senha" error={errors.password?.message}>
          <Input type="password" {...register('password')} />
        </FormField>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>
    </div>
  );
};
```

## Verificação Inicial de Autenticação

```typescript
// App.tsx
const App = () => {
  const { setAuth, setLoading } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          const user = await authService.getMe();
          setAuth(user, token, '');
        } catch {
          localStorage.removeItem('token');
        }
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  return <RouterProvider router={router} />;
};
```

## Controle de Permissões

```typescript
// hooks/usePermission.ts
export const usePermission = () => {
  const { user } = useAuthStore();

  const can = (permission: string) => {
    return user?.permissions?.includes(permission) ?? false;
  };

  const hasRole = (role: string) => {
    return user?.role === role;
  };

  const isOwner = (resourceUserId: string) => {
    return user?.id === resourceUserId;
  };

  return { can, hasRole, isOwner };
};

// Uso no componente
const ProductActions = ({ product }) => {
  const { can, isOwner } = usePermission();

  return (
    <div>
      {can('product:edit') && <EditButton />}
      {(can('product:delete') || isOwner(product.userId)) && <DeleteButton />}
    </div>
  );
};
```