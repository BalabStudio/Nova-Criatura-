---
name: performance-otimizacao
description: Otimização de performance e Core Web Vitals. Use quando precisar melhorar velocidade de carregamento, reduzir bundle size ou otimizar renderização.
---

# Instrução: Performance

Guia completo para otimização de performance focado em Core Web Vitals.

## Quando usar esta skill

- Use ao otimizar tempo de carregamento
- Use ao reduzir bundle size
- Use ao melhorar Core Web Vitals
- Use ao otimizar re-renders
- Use ao implementar code splitting

## Métricas Alvo (Core Web Vitals)

| Métrica | Bom | Precisa Melhorar |
|---------|-----|------------------|
| LCP (Largest Contentful Paint) | < 2.5s | > 4s |
| FID (First Input Delay) | < 100ms | > 300ms |
| CLS (Cumulative Layout Shift) | < 0.1 | > 0.25 |

## Lazy Loading de Componentes

```typescript
// Importação dinâmica para code splitting
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Settings = lazy(() => import('@/pages/Settings'));

const App = () => (
  <Suspense fallback={<PageSkeleton />}>
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  </Suspense>
);
```

## Otimização de Imagens

```typescript
// Componente de imagem otimizada
const OptimizedImage = ({ src, alt, ...props }) => (
  <img
    src={src}
    alt={alt}
    loading="lazy"           // Lazy load nativo
    decoding="async"         // Decodificação assíncrona
    {...props}
  />
);

// Usar formatos modernos
<picture>
  <source srcSet={imageAvif} type="image/avif" />
  <source srcSet={imageWebp} type="image/webp" />
  <img src={imagePng} alt={alt} loading="lazy" />
</picture>
```

## Memoização

### React.memo

```typescript
// React.memo - evita re-render se props não mudaram
const ProductCard = memo(({ product }: ProductCardProps) => {
  return <div>{product.name}</div>;
});
```

### useMemo

```typescript
// useMemo - memoriza valores computados
const expensiveValue = useMemo(() => {
  return products
    .filter(p => p.price > 100)
    .sort((a, b) => b.price - a.price);
}, [products]);
```

### useCallback

```typescript
// useCallback - memoriza funções
const handleClick = useCallback((id: string) => {
  setSelectedId(id);
}, []);
```

## Virtualização para Listas Longas

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

const VirtualList = ({ items }) => {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });
  
  return (
    <div ref={parentRef} style={{ height: '400px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {items[virtualItem.index].name}
          </div>
        ))}
      </div>
    </div>
  );
};
```

## Debounce e Throttle

```typescript
// Debounce para busca
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

## Cache com React Query

```typescript
const { data } = useQuery({
  queryKey: ['products'],
  queryFn: fetchProducts,
  staleTime: 5 * 60 * 1000,    // 5 min antes de refetch
  gcTime: 30 * 60 * 1000,      // 30 min em cache
  refetchOnWindowFocus: false, // Não refetch ao focar
});
```

## Skeleton Loading

```typescript
// Evita layout shift durante carregamento
const ProductList = () => {
  const { data, isLoading } = useProducts();
  
  if (isLoading) {
    return <ProductListSkeleton count={6} />;
  }
  
  return (
    <div>
      {data.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  );
};
```

## Checklist de Performance

- [ ] Lazy loading em rotas
- [ ] Imagens otimizadas (WebP/AVIF, lazy load)
- [ ] Virtualização para listas > 50 itens
- [ ] Debounce em inputs de busca
- [ ] React.memo em componentes puros
- [ ] Cache configurado no React Query
- [ ] Skeleton loading para evitar CLS
- [ ] Bundle analyzer para identificar peso

## O que NUNCA fazer

❌ Otimizar prematuramente
❌ useMemo/useCallback em tudo
❌ Imagens sem lazy loading
❌ Listas longas sem virtualização
❌ Re-render em cada keystroke

## Preload de Recursos Críticos

```html
<!-- index.html -->
<head>
  <!-- Preload fontes críticas -->
  <link
    rel="preload"
    href="/fonts/inter.woff2"
    as="font"
    type="font/woff2"
    crossorigin
  />
  
  <!-- Preconnect para APIs -->
  <link rel="preconnect" href="https://api.example.com" />
  <link rel="dns-prefetch" href="https://api.example.com" />
</head>
```

## Code Splitting Avançado

```typescript
// Route-based splitting
const routes = [
  {
    path: '/dashboard',
    component: lazy(() => import('@/pages/Dashboard')),
  },
  {
    path: '/settings',
    component: lazy(() => import('@/pages/Settings')),
  },
];

// Component-based splitting
const HeavyChart = lazy(() => import('@/components/HeavyChart'));

const Dashboard = () => {
  const [showChart, setShowChart] = useState(false);
  
  return (
    <div>
      <button onClick={() => setShowChart(true)}>Mostrar Gráfico</button>
      {showChart && (
        <Suspense fallback={<ChartSkeleton />}>
          <HeavyChart />
        </Suspense>
      )}
    </div>
  );
};
```

## Bundle Analysis

```bash
# Instalar
npm install -D rollup-plugin-visualizer

# vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
});
```

## Web Workers para Cálculos Pesados

```typescript
// worker.ts
self.onmessage = (e) => {
  const result = heavyCalculation(e.data);
  self.postMessage(result);
};

// useWorker.ts
export const useWorker = () => {
  const workerRef = useRef<Worker>();
  
  useEffect(() => {
    workerRef.current = new Worker(
      new URL('./worker.ts', import.meta.url)
    );
    
    return () => workerRef.current?.terminate();
  }, []);
  
  const runTask = (data: unknown) => {
    return new Promise((resolve) => {
      workerRef.current!.onmessage = (e) => resolve(e.data);
      workerRef.current!.postMessage(data);
    });
  };
  
  return { runTask };
};
```

## Prefetch de Rotas

```typescript
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Prefetch ao hover
const NavLink = ({ to, children }) => {
  const handleMouseEnter = () => {
    // Prefetch da rota
    import(`@/pages${to}`);
  };
  
  return (
    <a href={to} onMouseEnter={handleMouseEnter}>
      {children}
    </a>
  );
};
```

## Compression

```typescript
// vite.config.ts
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react(),
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
  ],
});
```

## Lighthouse CI

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [push]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli
          lhci autorun
```

## Métricas em Produção

```typescript
// utils/analytics.ts
export const reportWebVitals = (metric: Metric) => {
  console.log(metric);
  
  // Enviar para analytics
  if (window.gtag) {
    window.gtag('event', metric.name, {
      value: Math.round(metric.value),
      metric_id: metric.id,
      metric_value: metric.value,
      metric_delta: metric.delta,
    });
  }
};

// App.tsx
import { onCLS, onFID, onLCP } from 'web-vitals';

onCLS(reportWebVitals);
onFID(reportWebVitals);
onLCP(reportWebVitals);
```