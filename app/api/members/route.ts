import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase";
import { checkAdminPassword } from "@/lib/auth";
import staticMembers from "@/data/members.json";

export async function GET() {
  const { data, error } = await supabase
    .from("members")
    .select("name, restrictions")
    .eq("active", true)
    .order("name", { ascending: true });

  if (error) {
    console.error("[api/members] Erro Supabase:", error.code, error.message);
    // Fallback: retorna a lista estática se a tabela ainda não existir
    return NextResponse.json({
      members: staticMembers,
      membersWithRestrictions: staticMembers.map((name) => ({ name, restrictions: [] })),
      _fallback: true,
    });
  }

  return NextResponse.json({
    members: data.map((m) => m.name),
    membersWithRestrictions: data,
  });
}

export async function POST(req: NextRequest) {
  let body: { name?: string; password?: string; restrictions?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  const { name, password, restrictions = [] } = body;

  if (!name || name.trim().length < 2) {
    return NextResponse.json({ error: "Nome inválido (mínimo 2 caracteres)." }, { status: 400 });
  }

  if (!checkAdminPassword(password)) {
    return NextResponse.json({ error: "Senha incorreta." }, { status: 401 });
  }

  const trimmedName = name.trim();

  const { data, error } = await supabase
    .from("members")
    .insert([{ name: trimmedName, restrictions, active: true }])
    .select()
    .single();

  if (error) {
    console.error("[api/members] Erro ao inserir:", error.code, error.message);
    if (error.code === "23505") {
      return NextResponse.json({ error: `Membro "${trimmedName}" já existe.` }, { status: 409 });
    }
    // Tabela não existe ou outro erro de schema
    if (error.code === "42P01") {
      return NextResponse.json(
        { error: "Tabela 'members' não existe no Supabase. Execute o SQL de criação primeiro." },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: `Falha ao adicionar membro: ${error.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ member: data }, { status: 201 });
}

const VALID_CARD_IDS = ["oracao", "louvor", "quebra-gelo", "visao", "facilitacao", "oferta", "lanche"];

export async function PATCH(req: NextRequest) {
  let body: { name?: string; restrictions?: string[]; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  const { name, restrictions, password } = body;

  if (!name || name.trim().length < 2) {
    return NextResponse.json({ error: "Nome inválido." }, { status: 400 });
  }

  if (!Array.isArray(restrictions) || restrictions.some((r) => !VALID_CARD_IDS.includes(r))) {
    return NextResponse.json(
      { error: `Funções inválidas. Valores aceitos: ${VALID_CARD_IDS.join(", ")}.` },
      { status: 400 }
    );
  }

  if (!checkAdminPassword(password)) {
    return NextResponse.json({ error: "Senha incorreta." }, { status: 401 });
  }

  const trimmedName = name.trim();

  const { data: existing } = await supabase
    .from("members")
    .select("name")
    .eq("name", trimmedName)
    .eq("active", true)
    .single();

  if (!existing) {
    console.error(`[api/members PATCH] Membro "${trimmedName}" não encontrado na tabela members (active=true)`);
    return NextResponse.json({ error: `Membro "${trimmedName}" não encontrado.` }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("members")
    .update({ restrictions })
    .eq("name", trimmedName)
    .eq("active", true)
    .select("name, restrictions")
    .single();

  if (error) {
    console.error("[api/members PATCH] Erro ao atualizar:", error.code, error.message);
    return NextResponse.json({ error: "Falha ao atualizar permissões." }, { status: 500 });
  }

  return NextResponse.json({ member: data });
}

export async function DELETE(req: NextRequest) {
  let body: { name?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  const { name, password } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "Nome obrigatório." }, { status: 400 });
  }

  if (!checkAdminPassword(password)) {
    return NextResponse.json({ error: "Senha incorreta." }, { status: 401 });
  }

  const { error } = await supabase
    .from("members")
    .delete()
    .eq("name", name.trim());

  if (error) {
    console.error("[api/members DELETE] Erro:", error.code, error.message);
    return NextResponse.json({ error: "Falha ao remover membro." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
