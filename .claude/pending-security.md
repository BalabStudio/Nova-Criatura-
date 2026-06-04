# Segurança Pendente — Nova Criatura (`yxzypqfvokexmlptbtmn`)

## Contexto
Três migrações já foram aplicadas com sucesso. O que resta é revisão de policies e bucket.

## 1. `rls_policy_always_true` — 6 policies sem restrição

Verificar cada uma e decidir se restringir ou manter:

| Tabela | Policy | Risco | Recomendação |
|---|---|---|---|
| `admin_actions` | `Allow public insert on admin_actions` | ALTO — qualquer um insere | Restringir a `authenticated` ou `is_admin()` |
| `assignments` | `Allow all` | ALTO | Restringir a `authenticated` |
| `assignments` | `Permitir acesso total para autenticados` | Médio | Consolidar com a acima |
| `candidate_resumes` | `Anonymous resume upload` | Baixo — intencional | Manter (upload público de currículos) |
| `members` | `anon_insert_members` | Baixo — intencional | Manter (cadastro público de membros) |
| `schedule_snapshots` | INSERT/UPDATE sem restrição | ALTO | Restringir a `authenticated` |

### SQL sugerido para os casos de alto risco:

```sql
-- admin_actions: somente authenticated pode inserir
ALTER POLICY "Allow public insert on admin_actions" ON public.admin_actions
  WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

-- schedule_snapshots: restringir INSERT e UPDATE
-- (verificar nome exato das policies antes de aplicar)
-- SELECT policyname FROM pg_policies WHERE tablename = 'schedule_snapshots';
```

## 2. `multiple_permissive_policies` — 60 casos

Baixo risco imediato (permissive = acesso é a união das policies, não intersecção).
Consolidar apenas se houver policies claramente duplicadas por tabela.

Verificar as tabelas mais críticas:
```sql
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('users', 'jobs', 'candidates', 'feedbacks')
ORDER BY tablename, cmd;
```

## 3. `public_bucket_allows_listing` — bucket `resumes`

Verificar se listagem pública é intencional:
- Dashboard → Storage → resumes → Policies
- Se não for intencional: adicionar policy que restringe SELECT a `authenticated` ou ao dono do arquivo

## Ordem recomendada
1. Corrigir `admin_actions` e `schedule_snapshots` (alto risco, SQL simples)
2. Revisar bucket `resumes`
3. Consolidar `multiple_permissive_policies` nas tabelas críticas

## MCP configurado
Projeto: `yxzypqfvokexmlptbtmn`
Arquivo: `.mcp.json` na raiz do projeto
