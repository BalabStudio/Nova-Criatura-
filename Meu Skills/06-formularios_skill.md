---
name: formularios-validacao
description: Gerenciamento de formulários com React Hook Form e Zod. Use quando precisar criar formulários, validar inputs ou gerenciar estado de forms.
---

# Instrução: Formulários

Guia completo para formulários usando React Hook Form e validação com Zod.

## Quando usar esta skill

- Use ao criar qualquer formulário
- Use ao implementar validações
- Use ao gerenciar estado de inputs
- Use ao criar schemas de validação
- Use ao tratar erros de formulário

## Stack

- **Gerenciamento:** React Hook Form
- **Validação:** Zod
- **UI:** Componentes do Design System

## Estrutura Base

```typescript
// components/forms/LoginForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// 1. Schema de validação
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(8, 'Senha deve ter no mínimo 8 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

// 2. Componente
const LoginForm = ({ onSubmit }: LoginFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormField
        label="Email"
        error={errors.email?.message}
      >
        <Input
          type="email"
          {...register('email')}
          aria-invalid={!!errors.email}
        />
      </FormField>
      
      <FormField
        label="Senha"
        error={errors.password?.message}
      >
        <Input
          type="password"
          {...register('password')}
          aria-invalid={!!errors.password}
        />
      </FormField>
      
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Entrando...' : 'Entrar'}
      </Button>
    </form>
  );
};
```

## Validações Comuns

```typescript
// schemas/common.schemas.ts
import { z } from 'zod';

export const emailSchema = z
  .string()
  .min(1, 'Email é obrigatório')
  .email('Formato de email inválido');

export const passwordSchema = z
  .string()
  .min(1, 'Senha é obrigatória')
  .min(8, 'Mínimo 8 caracteres')
  .regex(/[A-Z]/, 'Deve conter letra maiúscula')
  .regex(/[0-9]/, 'Deve conter número');

export const phoneSchema = z
  .string()
  .regex(/^\(\d{2}\) \d{5}-\d{4}$/, 'Formato: (99) 99999-9999');

export const cpfSchema = z
  .string()
  .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido');

// Confirmação de senha
export const confirmPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Senhas não conferem',
    path: ['confirmPassword'],
  });
```

## Componente FormField Reutilizável

```typescript
// components/molecules/FormField.tsx
interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

const FormField = ({ label, error, required, children }: FormFieldProps) => {
  return (
    <div className={styles.field}>
      <label className={styles.label}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>
      
      {children}
      
      {error && (
        <span className={styles.error} role="alert">
          {error}
        </span>
      )}
    </div>
  );
};
```

## Mensagens de Erro

```typescript
// ✅ Mensagens claras e acionáveis
"Email deve conter @"
"Senha precisa ter no mínimo 8 caracteres"
"CPF inválido. Formato: 000.000.000-00"

// ❌ Evitar mensagens genéricas
"Campo inválido"
"Erro"
"Preencha corretamente"
```

## Formulário com Campos Dinâmicos

```typescript
import { useFieldArray } from 'react-hook-form';

const ProductForm = () => {
  const { control, register } = useForm();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });
  
  return (
    <form>
      {fields.map((field, index) => (
        <div key={field.id}>
          <Input {...register(`items.${index}.name`)} />
          <Input {...register(`items.${index}.quantity`)} type="number" />
          <Button onClick={() => remove(index)}>Remover</Button>
        </div>
      ))}
      <Button onClick={() => append({ name: '', quantity: 0 })}>
        Adicionar Item
      </Button>
    </form>
  );
};
```

## Regras Obrigatórias

1. **Zod para schemas** — validação tipada
2. **Mensagens descritivas** — dizer o que está errado e como corrigir
3. **Validação em tempo real** — `mode: 'onChange'` para UX
4. **Estados de loading** — desabilitar submit durante envio
5. **Acessibilidade** — `aria-invalid`, `aria-describedby`

## O que NUNCA fazer

❌ Validar só no submit (valide em tempo real)
❌ Mensagens genéricas ("Campo inválido")
❌ Formulários sem feedback de loading
❌ Limpar form em erro (frustrante para usuário)

## Exemplo Completo: Register Form

```typescript
// schemas/register.schema.ts
import { z } from 'zod';

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
    email: z.string().email('Email inválido'),
    password: z
      .string()
      .min(8, 'Senha deve ter no mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Deve conter letra maiúscula')
      .regex(/[0-9]/, 'Deve conter número'),
    confirmPassword: z.string(),
    terms: z.boolean().refine((val) => val === true, {
      message: 'Você deve aceitar os termos',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Senhas não conferem',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

// components/forms/RegisterForm.tsx
const RegisterForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await authService.register(data);
      toast.success('Conta criada com sucesso!');
    } catch (error) {
      toast.error('Erro ao criar conta');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormField label="Nome" error={errors.name?.message} required>
        <Input {...register('name')} aria-invalid={!!errors.name} />
      </FormField>

      <FormField label="Email" error={errors.email?.message} required>
        <Input
          type="email"
          {...register('email')}
          aria-invalid={!!errors.email}
        />
      </FormField>

      <FormField label="Senha" error={errors.password?.message} required>
        <Input
          type="password"
          {...register('password')}
          aria-invalid={!!errors.password}
        />
      </FormField>

      <FormField
        label="Confirmar Senha"
        error={errors.confirmPassword?.message}
        required
      >
        <Input
          type="password"
          {...register('confirmPassword')}
          aria-invalid={!!errors.confirmPassword}
        />
      </FormField>

      <label>
        <input type="checkbox" {...register('terms')} />
        Aceito os termos de uso
        {errors.terms && (
          <span role="alert">{errors.terms.message}</span>
        )}
      </label>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Criando conta...' : 'Criar conta'}
      </Button>
    </form>
  );
};
```

## Validação Customizada

```typescript
// Validação de idade mínima
const ageSchema = z.coerce
  .number()
  .min(18, 'Você deve ter no mínimo 18 anos');

// Validação condicional
const schema = z.object({
  hasCompany: z.boolean(),
  companyName: z.string().optional(),
}).refine(
  (data) => {
    if (data.hasCompany) {
      return !!data.companyName;
    }
    return true;
  },
  {
    message: 'Nome da empresa é obrigatório',
    path: ['companyName'],
  }
);
```

## Watch e SetValue

```typescript
const { watch, setValue } = useForm();

// Watch specific field
const hasCompany = watch('hasCompany');

useEffect(() => {
  if (!hasCompany) {
    setValue('companyName', '');
  }
}, [hasCompany, setValue]);

// Watch all fields
const formData = watch();
console.log(formData);
```