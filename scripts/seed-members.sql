-- Seed da tabela members com os membros do data/members.json
-- Cole este SQL no Supabase Studio > SQL Editor e execute

INSERT INTO members (name, active, restrictions)
VALUES
  ('Richard',        true, '{}'),
  ('Lara Myllena',   true, '{}'),
  ('Ana Letícia',    true, '{}'),
  ('Hiris',          true, '{}'),
  ('Amanda',         true, '{}'),
  ('Kauan Henrique', true, '{}'),
  ('Kauê',           true, '{}'),
  ('Kalleby',        true, '{}'),
  ('Arnaud',         true, '{}'),
  ('Viana',          true, '{}'),
  ('Tayná',          true, '{}')
ON CONFLICT (name) DO NOTHING;

-- Verificação: lista todos os membros ativos
SELECT name, active, restrictions FROM members WHERE active = true ORDER BY name;
