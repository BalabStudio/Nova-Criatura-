/**
 * Script de seed: popula a tabela `members` no Supabase com os dados do members.json.
 * Execução: npx ts-node -e "require('./scripts/seed-members.ts')"
 * Ou: npx tsx scripts/seed-members.ts
 */
import { createClient } from "@supabase/supabase-js";
import members from "../data/members.json";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!url || !key || key.startsWith("http")) {
  console.error("Variáveis de ambiente inválidas. Verifique o .env.local");
  process.exit(1);
}

const supabase = createClient(url, key);

async function seed() {
  console.log(`Inserindo ${members.length} membros...`);

  for (const name of members) {
    const { error } = await supabase
      .from("members")
      .upsert({ name, active: true, restrictions: [] }, { onConflict: "name" });

    if (error) {
      console.error(`  ✗ ${name}:`, error.message);
    } else {
      console.log(`  ✓ ${name}`);
    }
  }

  console.log("Seed concluído.");
}

seed();
