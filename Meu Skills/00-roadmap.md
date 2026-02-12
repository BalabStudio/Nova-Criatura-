---
name: roadmap-construcao-aplicacao
description: Roadmap estratégico para construção de aplicações. Use quando precisar planejar fases de desenvolvimento, definir ordem de arquivos, ou entender dependências entre documentos técnicos.
---

# Roadmap de Construção de Aplicação

Uso Estratégico da Biblioteca Técnica - define quando e por que utilizar cada arquivo da biblioteca técnica durante as fases de construção de uma aplicação.

## Quando usar este roadmap

- Use ao iniciar um novo projeto do zero
- Use para planejar a sequência de desenvolvimento
- Use para entender quais arquivos técnicos aplicar em cada fase
- Use para validar se todas as fases obrigatórias foram cumpridas

## Fase 1: Planejamento e Alinhamento

### Objetivo
Estabelecer fundações claras antes de qualquer linha de código ou design.

### Arquivos e Aplicação

| Arquivo | Quando Usar | Por Que Usar | Entregável Esperado |
|---------|-------------|--------------|---------------------|
| Co-Pilot Estratégico de Produto Digital.docx | Primeiro contato com o projeto | Define diretrizes de comunicação entre equipe e IA, estabelece stack tecnológica preferencial (Bun) | Briefing estruturado com visão do produto |
| Sequência de Desenvolvimento.docx | Após definir escopo | Garante ordem correta de execução das 6 fases obrigatórias | Cronograma de fases com dependências |

### Ordem de Execução
1. Aplicar Co-Pilot Estratégico de Produto Digital.docx para estruturar a visão inicial
2. Mapear fases do projeto seguindo Sequência de Desenvolvimento.docx

## Fase 2: Arquitetura e Estrutura

### Objetivo
Definir a espinha dorsal técnica que sustentará toda a aplicação.

### Arquivos e Aplicação

| Arquivo | Quando Usar | Por Que Usar | Entregável Esperado |
|---------|-------------|--------------|---------------------|
| INCI Design System.md.docx | Antes de criar qualquer componente | Estabelece regras obrigatórias de Design Tokens, proíbe cores hardcoded, limita pesos de fonte | Arquivo de tokens CSS e configuração de tema |
| SóEducador - System Design.md.docx | Durante definição da arquitetura do sistema | Define padrões de arquitetura específicos do projeto | Documento de arquitetura técnica |
| Componentes Reutilizáveis com Atomic Design.docx | Durante definição da estrutura de pastas | Organiza componentes em 5 níveis hierárquicos com propagação correta de mudanças | Inventário de componentes por nível (átomos, moléculas, organismos, templates, páginas) |
| Skeleton Loading.docx | Ao planejar estados de carregamento | Define padrões para loading states que reduzem Layout Shift | Especificação de componentes skeleton |

### Ordem de Execução
1. Configurar Design Tokens seguindo INCI Design System.md.docx
2. Definir arquitetura com SóEducador - System Design.md.docx
3. Estruturar pastas conforme Componentes Reutilizáveis com Atomic Design.docx
4. Planejar loading states com Skeleton Loading.docx

### Regras Críticas Extraídas
- Nunca usar cores fixas (hex ou rgb direto no código)
- Máximo 2 pesos de fonte por página
- Skeleton deve espelhar o layout final do componente

## Fase 3: Design de Experiência

### Objetivo
Garantir que a interface seja eficaz, acessível e orientada à conversão.

### Arquivos e Aplicação

| Arquivo | Quando Usar | Por Que Usar | Entregável Esperado |
|---------|-------------|--------------|---------------------|
| Designing Positive Experiences.md | Durante criação de wireframes e protótipos | Aplica regra dos 3 segundos, valida acessibilidade, garante design emocional positivo | Checklist de auditoria preenchido por tela |
| UX_UI para Conversão.docx | Ao definir fluxos de ação do usuário | Otimiza hierarquia visual para CTAs, reduz scroll excessivo, implementa prova social | Mapa de pontos de conversão por página |
| UI UX.md.docx | Durante refinamento visual | Implementa filosofia de design invisível, reduz esforço cognitivo | Guia de estilo comportamental |

### Ordem de Execução
1. Auditar cada tela com Designing Positive Experiences.md
2. Aplicar estratégias de conversão do UX_UI para Conversão.docx
3. Refinar usando princípios de UI UX.md.docx

### Critérios de Validação

| Critério | Métrica | Arquivo de Referência |
|----------|---------|----------------------|
| Clareza imediata | Usuário entende propósito em 3 segundos | Designing Positive Experiences.md |
| Hierarquia visual | CTA principal visível em 1 segundo | UX_UI para Conversão.docx |
| Esforço cognitivo | Máximo 3 opções por decisão | UI UX.md.docx |

## Fase 4: Implementação

### Objetivo
Construir a aplicação com qualidade, consistência e eficiência.

### Arquivos e Aplicação

| Arquivo | Quando Usar | Por Que Usar | Entregável Esperado |
|---------|-------------|--------------|---------------------|
| Instruções para IA de Código.docx | Ao usar Lovable, Bolt, v0.dev ou similar | Garante que código gerado siga Atomic Design, use tokens, implemente acessibilidade | Prompt templates para cada tipo de componente |
| Skeleton Loading.docx | Ao implementar qualquer carregamento de dados | Reduz Layout Shift (CLS), melhora percepção de performance | Componentes skeleton que espelham layout final |
| DOCUMENTATION.md.docx | Continuamente durante desenvolvimento | Gera documentação técnica automatizada a partir de comentários e estrutura | Documentação atualizada do codebase |

### Ordem de Execução
1. Preparar prompts seguindo Instruções para IA de Código.docx antes de gerar código
2. Implementar estados de carregamento usando Skeleton Loading.docx
3. Manter documentação atualizada conforme DOCUMENTATION.md.docx

### Estrutura de Prompt para IA

| Seção do Prompt | Conteúdo Obrigatório | Arquivo de Referência |
|-----------------|---------------------|----------------------|
| Contexto | Descrição do projeto e stack | Instruções para IA de Código.docx |
| Requisitos | Nível Atomic Design, uso de tokens | Componentes Reutilizáveis com Atomic Design.docx |
| Restrições | Bibliotecas proibidas, limites | INCI Design System.md.docx |
| Estrutura | Props tipadas, skeleton, erros | Skeleton Loading.docx |

## Fase 5: Qualidade e Performance

### Objetivo
Garantir que a aplicação seja rápida, segura e otimizada para buscas.

### Arquivos e Aplicação

| Arquivo | Quando Usar | Por Que Usar | Entregável Esperado |
|---------|-------------|--------------|---------------------|
| INSTRUÇÃO DE OTIMIZAÇÃO DE PERFORMA.md | Antes e após build de produção | Analisa complexidade O(n), otimiza frontend, backend e dados | Relatório de performance com métricas Core Web Vitals |
| app_security_guide.md | Antes de qualquer deploy | Configura RLS, protege variáveis de ambiente, previne SQL Injection | Checklist de segurança validado |
| Guia Avançado e Completo de SEO On-Page_ Implementação Técnica e Estratégica.md | Ao finalizar páginas públicas | Implementa meta tags, dados estruturados Schema.org, Core Web Vitals | Validação no Search Console e Schema Validator |
| Modificações par SEO.txt | Complemento ao guia de SEO | Ajustes específicos adicionais de SEO | Lista de modificações aplicadas |
| Instrução de Vibe Debugging Checkli.md | Quando algo parece errado sem erro claro | Diagnóstico holístico de energia do código, dívidas técnicas, harmonia | Lista de débitos técnicos priorizados |

### Ordem de Execução
1. Executar auditoria usando INSTRUÇÃO DE OTIMIZAÇÃO DE PERFORMA.md em staging
2. Aplicar app_security_guide.md
3. Implementar otimizações de Guia Avançado e Completo de SEO On-Page_ Implementação Técnica e Estratégica.md
4. Aplicar ajustes de Modificações par SEO.txt
5. Rodar diagnóstico com Instrução de Vibe Debugging Checkli.md para identificar problemas ocultos

### Métricas Obrigatórias

| Métrica | Alvo | Arquivo de Referência |
|---------|------|----------------------|
| LCP (Largest Contentful Paint) | ≤ 2.5s | INSTRUÇÃO DE OTIMIZAÇÃO DE PERFORMA.md |
| FID (First Input Delay) | ≤ 100ms | INSTRUÇÃO DE OTIMIZAÇÃO DE PERFORMA.md |
| CLS (Cumulative Layout Shift) | ≤ 0.1 | INSTRUÇÃO DE OTIMIZAÇÃO DE PERFORMA.md |
| Taxa de erro | < 1% | app_security_guide.md |
| Lighthouse Score | > 90 | Guia Avançado e Completo de SEO On-Page_ Implementação Técnica e Estratégica.md |

## Fase 6: Deploy e Operação

### Objetivo
Lançar com segurança e manter operação estável.

### Arquivos e Aplicação

| Arquivo | Quando Usar | Por Que Usar | Entregável Esperado |
|---------|-------------|--------------|---------------------|
| CHECKLIST DE PRÉ-DEPLOY.md | 24 horas antes do lançamento | Valida ambiente de produção, prepara rollback, define smoke tests | Deploy executado com sucesso |
| DOCUMENTATION.md.docx | Pós-deploy para onboarding | Referência técnica para novos desenvolvedores | Documentação publicada |

### Checklist Resumido de Pré-Deploy

| Categoria | Verificação | Arquivo de Referência |
|-----------|-------------|----------------------|
| Ambiente | Variáveis de produção configuradas | CHECKLIST DE PRÉ-DEPLOY.md |
| Dados | Backup do banco atual realizado | CHECKLIST DE PRÉ-DEPLOY.md |
| Código | Build sem erros em staging | CHECKLIST DE PRÉ-DEPLOY.md |
| Monitoramento | Alertas de erro configurados | app_security_guide.md |
| Rollback | Runbook de reversão preparado | CHECKLIST DE PRÉ-DEPLOY.md |

## Matriz de Decisão Rápida

### Qual Arquivo Usar em Cada Situação

| Situação | Arquivo Principal | Arquivos de Apoio |
|----------|------------------|-------------------|
| Iniciando projeto do zero | Co-Pilot Estratégico de Produto Digital.docx | Sequência de Desenvolvimento.docx |
| Definindo estrutura de componentes | Componentes Reutilizáveis com Atomic Design.docx | INCI Design System.md.docx |
| Criando nova tela | Designing Positive Experiences.md | UX_UI para Conversão.docx; Skeleton Loading.docx |
| Definindo arquitetura do sistema | SóEducador - System Design.md.docx | INCI Design System.md.docx |
| Performance lenta | INSTRUÇÃO DE OTIMIZAÇÃO DE PERFORMA.md | Instrução de Vibe Debugging Checkli.md |
| Preparando lançamento | CHECKLIST DE PRÉ-DEPLOY.md | app_security_guide.md; Guia Avançado e Completo de SEO On-Page_ Implementação Técnica e Estratégica.md |
| Bug difícil de encontrar | Instrução de Vibe Debugging Checkli.md | INSTRUÇÃO DE OTIMIZAÇÃO DE PERFORMA.md |
| Gerando código com IA | Instruções para IA de Código.docx | Componentes Reutilizáveis com Atomic Design.docx; INCI Design System.md.docx |
| Implementando SEO | Guia Avançado e Completo de SEO On-Page_ Implementação Técnica e Estratégica.md | Modificações par SEO.txt |
| Validando segurança | app_security_guide.md | CHECKLIST DE PRÉ-DEPLOY.md |

## Fluxo de Dependências

### Ordem Obrigatória de Arquivos

| Etapa | Arquivos Obrigatórios | Arquivos Opcionais |
|-------|----------------------|-------------------|
| 1 | Co-Pilot Estratégico de Produto Digital.docx | - |
| 2 | Sequência de Desenvolvimento.docx | - |
| 3 | INCI Design System.md.docx | SóEducador - System Design.md.docx |
| 4 | Componentes Reutilizáveis com Atomic Design.docx | Skeleton Loading.docx |
| 5 | Designing Positive Experiences.md | UX_UI para Conversão.docx |
| 6 | UI UX.md.docx | - |
| 7 | Instruções para IA de Código.docx | DOCUMENTATION.md.docx |
| 8 | INSTRUÇÃO DE OTIMIZAÇÃO DE PERFORMA.md | Instrução de Vibe Debugging Checkli.md |
| 9 | app_security_guide.md | - |
| 10 | Guia Avançado e Completo de SEO On-Page_ Implementação Técnica e Estratégica.md | Modificações par SEO.txt |
| 11 | CHECKLIST DE PRÉ-DEPLOY.md | - |
| 12 | DOCUMENTATION.md.docx | - |

## Lista Completa de Arquivos da Biblioteca

### Arquivos por Categoria

**Estratégia e Planejamento**
- Co-Pilot Estratégico de Produto Digital.docx
- Sequência de Desenvolvimento.docx

**Arquitetura Técnica e Padrões**
- INCI Design System.md.docx
- SóEducador - System Design.md.docx
- Componentes Reutilizáveis com Atomic Design.docx
- Skeleton Loading.docx

**Experiência do Usuário (UX) e Design (UI)**
- Designing Positive Experiences.md
- UX_UI para Conversão.docx
- UI UX.md.docx

**Qualidade, Performance e Segurança**
- INSTRUÇÃO DE OTIMIZAÇÃO DE PERFORMA.md
- INSTRUÇÃO DE OTIMIZAÇÃO DE PERFORMA.md.docx
- app_security_guide.md
- Guia Avançado e Completo de SEO On-Page_ Implementação Técnica e Estratégica.md
- Modificações par SEO.txt
- Instrução de Vibe Debugging Checkli.md

**Implementação e IA**
- Instruções para IA de Código.docx
- DOCUMENTATION.md.docx
- CHECKLIST DE PRÉ-DEPLOY.md

## Referência de Stack Tecnológica

### Preferências Definidas na Biblioteca

| Categoria | Preferência | Alternativa | Evitar | Arquivo de Referência |
|-----------|------------|-------------|--------|----------------------|
| Runtime | Bun | Node.js | - | Co-Pilot Estratégico de Produto Digital.docx |
| Componentes UI | shadcn/ui | - | Bibliotecas pesadas | INCI Design System.md.docx |
| Estilização | Design Tokens (CSS Variables) | - | Cores hardcoded | INCI Design System.md.docx |
| Banco de Dados | Supabase com RLS | - | Queries sem parametrização | app_security_guide.md |
| Estrutura | Atomic Design | - | Componentes desorganizados | Componentes Reutilizáveis com Atomic Design.docx |