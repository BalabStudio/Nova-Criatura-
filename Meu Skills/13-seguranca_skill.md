---
name: seguranca-aplicacao
description: Práticas de segurança para aplicações web. Use quando precisar validar inputs, prevenir XSS, proteger dados sensíveis ou configurar headers de segurança.
---

# Instrução: Segurança

Guia completo para implementação de segurança em aplicações web.

## Quando usar esta skill

- Use ao validar inputs de usuário
- Use ao lidar com dados sensíveis
- Use ao implementar autenticação
- Use ao configurar variáveis de ambiente
- Use ao prevenir vulnerabilidades comuns

## Validação de Inputs

```typescript
// SEMPRE validar no cliente E no servidor
import { z } from 'zod';

const userSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  age: z.number().min(0).max(120),
});

// Sanitização de HTML
import DOMPurify from 'dompurify';

const SafeHTML = ({ html }: { html: string }) => (
  <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />
);
```

## Prevenção de XSS

```typescript
// ✅ React escapa automaticamente
<div>{userInput}</div>

// ⚠️ Perigoso - evitar
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// Se precisar, sanitize
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
```

## Variáveis de Ambiente

```bash
# .env (NUNCA commitar)
VITE_API_URL=https://api.exemplo.com
VITE_PUBLIC_KEY=pk_live_xxx

# Secrets só no servidor
API_SECRET_KEY=sk_live_xxx  # ❌ NUNCA no frontend
```

```typescript
// Acessar
const apiUrl = import.meta.env.VITE_API_URL;

// ✅ Sempre validar
if (!apiUrl) {
  throw new Error('VITE_API_URL não configurada');
}
```

## Autenticação Segura

### Armazenamento de Tokens

```typescript
// ✅ Preferível: httpOnly cookie (configurado no backend)
// ⚠️ Aceitável: localStorage com precauções

// NUNCA armazenar
localStorage.setItem('password', password);     // ❌
sessionStorage.setItem('creditCard', card);     // ❌

// Tokens com expiração
const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};
```

## Headers de Segurança

```typescript
// Configurar no servidor/CDN
Content-Security-Policy: default-src 'self';
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

## Proteção de Rotas

```typescript
// Sempre verificar autenticação no backend também
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isAuthenticated } = useAuth();
  
  // Verificação client-side (UX)
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // Verificação de role
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" />;
  }
  
  return children;
};

// O backend DEVE verificar também
// Nunca confiar apenas no frontend
```

## Rate Limiting (Frontend)

```typescript
// Debounce em operações sensíveis
const handleSubmit = useDebouncedCallback(async (data) => {
  await submitForm(data);
}, 1000);

// Desabilitar botão após clique
const [isSubmitting, setIsSubmitting] = useState(false);

const handleClick = async () => {
  if (isSubmitting) return;
  setIsSubmitting(true);
  try {
    await action();
  } finally {
    setIsSubmitting(false);
  }
};
```

## Dependências Seguras

```bash
# Verificar vulnerabilidades
npm audit

# Atualizar dependências
npm update

# Verificar licenças
npx license-checker
```

## Checklist de Segurança

- [ ] Inputs validados com Zod/Yup
- [ ] HTML sanitizado com DOMPurify
- [ ] Variáveis sensíveis em .env (não commitado)
- [ ] Tokens com expiração verificada
- [ ] HTTPS obrigatório
- [ ] Headers de segurança configurados
- [ ] Dependências auditadas
- [ ] Rate limiting em ações sensíveis
- [ ] Sem console.log com dados sensíveis em produção

## O que NUNCA fazer

❌ Secrets no código/frontend
❌ dangerouslySetInnerHTML sem sanitização
❌ Confiar apenas em validação client-side
❌ localStorage para dados sensíveis
❌ Console.log com tokens/senhas
❌ Ignorar npm audit warnings
❌ CORS com wildcard (*) em produção

## CSRF Protection

```typescript
// Com Axios
import axios from 'axios';

// Configurar CSRF token
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = getCookie('csrftoken');
  if (token) {
    config.headers['X-CSRFToken'] = token;
  }
  return config;
});
```

## Content Security Policy

```html
<!-- index.html -->
<meta
  http-equiv="Content-Security-Policy"
  content="
    default-src 'self';
    script-src 'self' 'unsafe-inline' https://cdn.example.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    font-src 'self' data:;
    connect-src 'self' https://api.example.com;
  "
/>
```

## Sanitização de URLs

```typescript
// Prevenir javascript: URLs
const sanitizeUrl = (url: string): string => {
  const dangerous = /^(javascript|data|vbscript):/i;
  if (dangerous.test(url)) {
    return '#';
  }
  return url;
};

// Uso
<a href={sanitizeUrl(userProvidedUrl)}>Link</a>
```

## Proteção contra Clickjacking

```typescript
// Verificar se está em iframe
useEffect(() => {
  if (window.self !== window.top) {
    // App está em iframe - pode ser clickjacking
    window.top!.location = window.self.location;
  }
}, []);
```

## Upload Seguro de Arquivos

```typescript
const FileUpload = () => {
  const validateFile = (file: File): boolean => {
    // Validar tipo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Tipo de arquivo não permitido');
      return false;
    }
    
    // Validar tamanho (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('Arquivo muito grande');
      return false;
    }
    
    return true;
  };

  const handleUpload = async (file: File) => {
    if (!validateFile(file)) return;
    
    // Upload para servidor que fará validação adicional
    const formData = new FormData();
    formData.append('file', file);
    
    await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  };
};
```

## Proteção de API Keys

```typescript
// ❌ NUNCA expor API keys no frontend
const API_KEY = 'sk_live_xxxxx'; // ERRADO!

// ✅ Usar proxy no backend
// Frontend chama backend, backend usa API key
const { data } = await api.post('/api/payment', paymentData);

// Backend (exemplo)
// app.post('/api/payment', async (req, res) => {
//   const stripeKey = process.env.STRIPE_SECRET_KEY;
//   const payment = await stripe.createPayment(stripeKey, req.body);
//   res.json(payment);
// });
```

## Logging Seguro

```typescript
// utils/logger.ts
const isProd = import.meta.env.PROD;

export const logger = {
  info: (message: string, data?: unknown) => {
    if (!isProd) {
      console.log(message, data);
    }
  },
  
  error: (message: string, error?: unknown) => {
    // NUNCA logar dados sensíveis
    const sanitized = sanitizeError(error);
    console.error(message, sanitized);
    
    // Enviar para serviço de logging (Sentry, etc)
    if (isProd) {
      reportToSentry(message, sanitized);
    }
  },
};

const sanitizeError = (error: unknown) => {
  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
      // Não incluir stack em produção
      stack: isProd ? undefined : error.stack,
    };
  }
  return error;
};
```

## Verificação de Integridade

```html
<!-- Usar SRI para scripts externos -->
<script
  src="https://cdn.example.com/library.js"
  integrity="sha384-xxxxx"
  crossorigin="anonymous"
></script>
```

## Password Strength

```typescript
import zxcvbn from 'zxcvbn';

const PasswordInput = () => {
  const [password, setPassword] = useState('');
  const strength = zxcvbn(password);

  return (
    <div>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <PasswordStrengthMeter score={strength.score} />
      {strength.feedback.suggestions.map(s => (
        <p key={s}>{s}</p>
      ))}
    </div>
  );
};
```

## .env.example

```bash
# .env.example - commitar este arquivo
# Copiar para .env e preencher valores reais

# API Configuration
VITE_API_URL=https://api.example.com
VITE_APP_ENV=development

# Public Keys (seguro expor no frontend)
VITE_STRIPE_PUBLIC_KEY=pk_test_xxxxx

# NÃO incluir secrets aqui!
```