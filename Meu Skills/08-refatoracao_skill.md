---
name: refatoracao-codigo
description: Padrões e técnicas de refatoração de código. Use quando precisar melhorar código existente, eliminar duplicação ou simplificar estruturas complexas.
---

# Instrução: Refatoração

Guia completo para refatoração de código seguindo melhores práticas.

## Quando usar esta skill

- Use ao melhorar código existente sem alterar comportamento
- Use ao eliminar código duplicado
- Use ao simplificar componentes complexos
- Use ao extrair lógica reutilizável
- Use ao preparar código para testes

## Princípio Fundamental

> "Refatorar é melhorar a estrutura interna do código SEM alterar seu comportamento externo."

## Checklist Antes de Refatorar

- [ ] Testes existentes passando
- [ ] Comportamento atual documentado
- [ ] Escopo definido (não refatorar tudo de uma vez)
- [ ] Git commit do estado atual

## Padrões de Refatoração

### 1. Extrair Componente

```typescript
// ❌ Antes: componente inchado
const UserProfile = () => {
  return (
    <div>
      <div className="avatar">
        <img src={user.avatar} />
        <span>{user.name}</span>
        <span>{user.role}</span>
      </div>
      {/* mais 200 linhas... */}
    </div>
  );
};

// ✅ Depois: componentes menores
const UserProfile = () => {
  return (
    <div>
      <UserAvatar user={user} />
      <UserDetails user={user} />
      <UserActions user={user} />
    </div>
  );
};
```

### 2. Extrair Hook

```typescript
// ❌ Antes: lógica no componente
const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);
  
  // render...
};

// ✅ Depois: lógica no hook
const ProductList = () => {
  const { data: products, isLoading, error } = useProducts();
  // render...
};
```

### 3. Extrair Utilitário

```typescript
// ❌ Antes: formatação inline
<span>{new Date(date).toLocaleDateString('pt-BR')}</span>
<span>{value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>

// ✅ Depois: funções utilitárias
<span>{formatDate(date)}</span>
<span>{formatCurrency(value)}</span>
```

### 4. Simplificar Condicionais

```typescript
// ❌ Antes: condicionais aninhadas
if (user) {
  if (user.isActive) {
    if (user.hasPermission) {
      // fazer algo
    }
  }
}

// ✅ Depois: early returns
if (!user) return null;
if (!user.isActive) return <InactiveMessage />;
if (!user.hasPermission) return <NoPermission />;

// fazer algo
```

### 5. Eliminar Código Duplicado

```typescript
// ❌ Antes: duplicação
const UserCard = ({ user }) => (
  <div className="card">
    <img src={user.avatar} className="avatar" />
    <h3>{user.name}</h3>
  </div>
);

const ProductCard = ({ product }) => (
  <div className="card">
    <img src={product.image} className="avatar" />
    <h3>{product.name}</h3>
  </div>
);

// ✅ Depois: componente genérico
const Card = ({ image, title, children }) => (
  <div className="card">
    <img src={image} className="avatar" />
    <h3>{title}</h3>
    {children}
  </div>
);
```

## Sinais de que Precisa Refatorar

- Componente com mais de 200 linhas
- Mais de 5 `useState` no mesmo componente
- Props drilling > 3 níveis
- Código duplicado em 2+ lugares
- Função fazendo mais de uma coisa
- Dificuldade para testar

## Processo de Refatoração

1. **Identificar** — localizar o problema
2. **Isolar** — garantir testes antes
3. **Refatorar** — pequenas mudanças incrementais
4. **Testar** — rodar testes após cada mudança
5. **Commitar** — commits pequenos e frequentes

## O que NUNCA fazer

❌ Refatorar sem testes
❌ Mudar comportamento durante refatoração
❌ Refatorar múltiplas coisas de uma vez
❌ Refatorar código que não entende
❌ Refatorar sem motivo claro

## Exemplo Completo: Refatoração de Formulário

### Antes (Código Inchado)

```typescript
const ContactForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [messageError, setMessageError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateName = () => {
    if (!name) {
      setNameError('Nome é obrigatório');
      return false;
    }
    setNameError('');
    return true;
  };

  const validateEmail = () => {
    if (!email) {
      setEmailError('Email é obrigatório');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Email inválido');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validateMessage = () => {
    if (!message) {
      setMessageError('Mensagem é obrigatória');
      return false;
    }
    setMessageError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const isNameValid = validateName();
    const isEmailValid = validateEmail();
    const isMessageValid = validateMessage();
    
    if (!isNameValid || !isEmailValid || !isMessageValid) {
      return;
    }

    setIsSubmitting(true);
    try {
      await submitContact({ name, email, message });
      alert('Mensagem enviada!');
    } catch (error) {
      alert('Erro ao enviar');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input value={name} onChange={(e) => setName(e.target.value)} />
        {nameError && <span>{nameError}</span>}
      </div>
      <div>
        <input value={email} onChange={(e) => setEmail(e.target.value)} />
        {emailError && <span>{emailError}</span>}
      </div>
      <div>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} />
        {messageError && <span>{messageError}</span>}
      </div>
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Enviando...' : 'Enviar'}
      </button>
    </form>
  );
};
```

### Depois (Refatorado)

```typescript
// Schema de validação
const contactSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  message: z.string().min(1, 'Mensagem é obrigatória'),
});

type ContactFormData = z.infer<typeof contactSchema>;

// Hook customizado
const useContactForm = () => {
  const { mutate, isPending } = useMutation({
    mutationFn: submitContact,
    onSuccess: () => toast.success('Mensagem enviada!'),
    onError: () => toast.error('Erro ao enviar'),
  });

  return { submitContact: mutate, isSubmitting: isPending };
};

// Componente limpo
const ContactForm = () => {
  const { submitContact, isSubmitting } = useContactForm();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  return (
    <form onSubmit={handleSubmit(submitContact)}>
      <FormField label="Nome" error={errors.name?.message}>
        <Input {...register('name')} />
      </FormField>

      <FormField label="Email" error={errors.email?.message}>
        <Input type="email" {...register('email')} />
      </FormField>

      <FormField label="Mensagem" error={errors.message?.message}>
        <Textarea {...register('message')} />
      </FormField>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Enviando...' : 'Enviar'}
      </Button>
    </form>
  );
};
```

## Técnicas Avançadas

### Composition Pattern

```typescript
// Antes
<Modal title="Confirmar" onClose={handleClose}>
  <p>Tem certeza?</p>
  <div>
    <Button onClick={handleConfirm}>Sim</Button>
    <Button onClick={handleClose}>Não</Button>
  </div>
</Modal>

// Depois
<Modal>
  <Modal.Header onClose={handleClose}>Confirmar</Modal.Header>
  <Modal.Body>
    <p>Tem certeza?</p>
  </Modal.Body>
  <Modal.Footer>
    <Button onClick={handleConfirm}>Sim</Button>
    <Button onClick={handleClose}>Não</Button>
  </Modal.Footer>
</Modal>
```

### Render Props to Hooks

```typescript
// Antes
<DataFetcher url="/api/users">
  {({ data, loading }) => (
    loading ? <Spinner /> : <UserList users={data} />
  )}
</DataFetcher>

// Depois
const UserListContainer = () => {
  const { data, isLoading } = useUsers();
  
  if (isLoading) return <Spinner />;
  return <UserList users={data} />;
};
```