# Spec do PRD - Nova Criatura

## 1. Visão Geral
O projeto **Nova Criatura** está evoluindo de um sistema simples de sorteio de funções para células para uma plataforma robusta de gestão eclesiástica e ministerial organizada em múltiplos níveis (**Multi-tenant**). O foco principal é a organização de escalas, membros e permissões dentro de uma estrutura hierárquica de Organizações, Campuses e Células.

## 2. Objetivos Principais
- **Multi-tenancy**: Permitir que diversas organizações gerenciem seus próprios espaços.
- **Escalabilidade Hierárquica**: Organizar em Organização > Campus > Célula.
- **Gestão de Escalas**: Automatizar e registrar a programação das células.
- **Controle de Acesso**: Definir níveis de permissão granulares para usuários e membros.
- **Monetização**: Sistema de assinaturas para organizações.

## 3. Modelo de Dados (Lógica das Entidades)

### 3.1. Core Organizations
Estrutura de nível superior (Igreja Sede ou Ministério).
- **id**: UUID (PK)
- **nome**: Nome da organização.
- **cidade / estado**: Localização da sede.
- **slug**: Identificador único para URL.
- **tipo**: Categoria (ex: Igreja, Comunidade, Grupo).
- **status**: Ativo/Inativo.

### 3.2. Campuses
Subdivisões físicas ou geográficas das organizações.
- **id**: UUID (PK)
- **organization_id**: Relacionamento com a organização (FK).
- **nome**: Nome do campus.
- **endereço**: Localização completa.
- **latitude / longitude**: Coordenadas para geolocalização.

### 3.3. Cells (Células)
Grupos pequenos onde as atividades ocorrem.
- **id**: UUID (PK)
- **campus_id**: Relacionamento com o campus (FK).
- **nome**: Nome da célula.
- **líder**: Nome ou ID do líder principal.
- **dia_semana**: Dia de ocorrência (ex: Sábado).
- **horário**: Hora de início.
- **slug**: Identificador para link público.
- **link_publico**: URL para visualização externa da programação.
- **status**: Ativo/Inativo.

### 3.4. Members
Indivíduos que compõem as células.
- **id**: UUID (PK)
- **cell_id**: Célula atual do membro (FK).
- **nome**: Nome completo.
- **telefone**: Contato (opcional).
- **função_ministerial**: Cargo eclesiástico (ex: Líder, Diácono, Membro).
- **status**: Ativo/Afastado/Visitante.

### 3.5. Roles (Cargos/Funções)
Papéis disponíveis para as escalas (Schedules).
- **id**: UUID (PK)
- **organization_id / global**: Define se a role é específica de uma org ou disponível para todas.
- **nome**: Nome da função (ex: Louvor, Oração, Quebra-gelo).
- **categoria**: Agrupamento de funções.
- **limite_por_data**: Quantidade máxima de pessoas nesse cargo por escala.
- **ativo**: Booleano.

### 3.6. member_role_permissions
Define quem está apto a exercer cada Role.
- **member_id**: FK para members.
- **role_id**: FK para roles.
- **permitido**: Booleano.

### 3.7. Schedules (Programações)
Instâncias de ocorrência da célula.
- **id**: UUID (PK)
- **cell_id**: FK para cells.
- **data**: Data específica da célula.
- **status**: Planejado/Concluído/Cancelado.

### 3.8. Assignments (Escalações)
A vinculação de membros às funções em uma data específica.
- **schedule_id**: FK para schedules.
- **member_id**: FK para members.
- **role_id**: FK para roles.
- **origem**: Como foi escalado (Sorteio/Manual/Automático).
- **confirmado_em**: Timestamp de confirmação pelo membro.

### 3.9. Users & Access Control
Usuários da plataforma (Administradores/Gestores).
- **users**: id, nome, email, perfil (admin, gestor, líder).
- **user_access**: Tabela pivot para `user_id` -> `organization_id/campus_id/cell_id` com `nível_de_acesso`.

### 3.10. Subscriptions
Gestão financeira da organização.
- **organization_id**: FK para organizations.
- **plano**: Free, Premium, Enterprise.
- **status**: Ativa, Inadimplente, Cancelada.
- **billing_cycle**: Mensal/Anual.

## 4. Design System (Identidade Visual)
O projeto segue uma estética premium e moderna, focada em clareza e facilidade de uso mobile.

- **Paleta de Cores**:
  - **Primária**: `#0c228f` (Azul Forte Ministerial).
  - **Fundo**: `#ffffff` / `#f8fafc` (Claro e limpo).
  - **Bordas**: `#e1eaef` (Suaves e discretas).
- **Tipografia**: Interface moderna com foco em legibilidade.
- **Componentes**:
  - **Inputs**: Grandes e confortáveis para o clique (padrão mobile-first).
  - **Cards**: Bordas suaves (`14px`) e sombras sutis (`var(--shadow)`).
  - **Animações**: Transições suaves e micro-interações (ex: hover, active states).

## 5. Requisitos Técnicos
- **Frontend**: Next.js 15+ com TypeScript e Tailwind CSS.
- **Backend**: Supabase (Database, Auth, Storage).
- **Estado**: React Context / Hooks para gestão de sessões e filtros.
- **Geração de Assets**: Exportação de cards da programação como imagem (html-to-image).

---
> [!IMPORTANT]
> Este PRD serve como base para a migração do banco de dados e refatoração das interfaces atuais, garantindo que o sistema suporte o crescimento para múltiplas organizações.
