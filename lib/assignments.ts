import { z } from "zod";
import { supabase } from "./supabase";

// Schema para cada sorteio (data ISO, membro e cardId).
const AssignmentSchema = z.object({
  date: z.string().min(1),
  member: z.string().min(1),
  cardId: z.string().min(1),
});

export type Assignment = z.infer<typeof AssignmentSchema>;

// Restrições por membro: quais cardIds podem sortear
const MEMBER_RESTRICTIONS: Record<string, string[]> = {
  "Ana Letícia": ["oracao", "quebra-gelo", "lanche"],
  "Hiris": ["oracao", "quebra-gelo", "lanche"],
};

export function getAllowedCards(member: string): string[] {
  return MEMBER_RESTRICTIONS[member] || [];
}

export function hasRestriction(member: string): boolean {
  return !!MEMBER_RESTRICTIONS[member];
}

export async function getAssignments(date?: string): Promise<Assignment[]> {
  let query = supabase
    .from('assignments')
    .select('date, member, cardId:card_id');

  if (date) {
    query = query.eq('date', date);
  } else {
    // Busca apenas os últimos 30 dias se nenhuma data for informada, para performance
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    query = query.gte('date', thirtyDaysAgo.toISOString().split('T')[0]);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[assignments] Erro ao buscar no Supabase:", error);
    return [];
  }

  return data as Assignment[];
}

export async function isAssigned(member: string, date: string, cardId?: string): Promise<boolean> {
  let query = supabase
    .from('assignments')
    .select('*', { count: 'exact', head: true })
    .eq('member', member)
    .eq('date', date);

  if (cardId) {
    query = query.eq('card_id', cardId);
  }

  const { count, error } = await query;

  if (error) {
    console.error("[assignments] Erro ao verificar atribuição:", error);
    return false;
  }

  return (count || 0) > 0;
}

export async function assign(member: string, date: string, cardId: string): Promise<Assignment> {
  // Para o sorteio (assign), mantemos a regra de apenas uma função por pessoa
  if (await isAssigned(member, date)) {
    throw new Error(`O membro "${member}" já possui uma função atribuída para essa data.`);
  }

  // Verifica restrições
  const allowedCards = getAllowedCards(member);
  if (allowedCards.length > 0 && !allowedCards.includes(cardId)) {
    throw new Error(`O membro "${member}" não pode sortear a função "${cardId}".`);
  }

  const { data, error } = await supabase
    .from('assignments')
    .insert([{ member, date, card_id: cardId }])
    .select()
    .single();

  if (error) {
    console.error("[assignments] Erro ao salvar no Supabase:", error);
    throw new Error("Falha ao salvar atribuição no banco de dados.");
  }

  return {
    member: data.member,
    date: data.date,
    cardId: data.card_id
  };
}

export async function resetAssignments(date: string, adminName: string): Promise<void> {
  // Regra de ouro: A partir de 28/02/2026, nada pode ser apagado logicamente ou fisicamente.
  // No entanto, o reset "Zerar semana atual" é permitido se for para limpar rascunhos,
  // mas para datas passadas (<Hoje) ou após 28/02/2026, devemos ser cautelosos.
  // O requisito diz: "A partir de 28/02/2026, nada pode ser apagado."
  // E "Zerar" deve limpar apenas os registros do sábado selecionado.

  // Regra de ouro: A partir de 28/02/2026, é do Histórico Protegido.
  // No entanto, se o admin (Richard) quiser zerar, permitimos.
  // const limitDateStr = "2026-02-28";
  // if (date >= limitDateStr && adminName !== "Richard") { ... }
  // O usuário pediu explicitamente para Richard poder zerar.

  // Busca dados atuais para o log de auditoria
  const { data: beforeItems } = await supabase
    .from('assignments')
    .select('*')
    .eq('date', date);

  const { error } = await supabase
    .from('assignments')
    .delete()
    .eq('date', date);

  if (error) {
    console.error("[assignments] Erro ao resetar no Supabase:", error);
    throw new Error("Falha ao resetar o banco de dados.");
  }

  // Registra auditoria
  await supabase.from('admin_actions').insert([{
    action: 'RESET',
    admin_name: adminName,
    date_affected: date,
    details: {
      before: beforeItems,
      reason: "Zerar semana atual"
    }
  }]);
}

// Retorna cardIds já usados em uma data específica
export async function getUsedCardIdsForDate(date: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('assignments')
    .select('card_id')
    .eq('date', date);

  if (error) {
    console.error("[assignments] Erro ao buscar cards usados:", error);
    return [];
  }

  return data.map(d => d.card_id);
}

// Retorna a última função atribuída a um membro (ou null)
export async function getLastAssignmentForMember(member: string): Promise<Assignment | null> {
  const { data, error } = await supabase
    .from('assignments')
    .select('date, member, cardId:card_id')
    .eq('member', member)
    .order('date', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    // No data found counts as an error for single()
    if (error.code === 'PGRST116') return null;
    console.error("[assignments] Erro ao buscar último sorteio:", error);
    return null;
  }

  return data as Assignment;
}

// --- Snapshots e Auditoria ---

export async function createSnapshot(date: string, content: any, assignments: any[], adminName?: string) {
  // Busca a versão mais recente para essa data
  const { data: latest } = await supabase
    .from('schedule_snapshots')
    .select('version')
    .eq('date', date)
    .order('version', { ascending: false })
    .limit(1);

  const nextVersion = (latest && latest.length > 0 ? latest[0].version : 0) + 1;

  const { data, error } = await supabase
    .from('schedule_snapshots')
    .insert([{
      date,
      content,
      assignments,
      version: nextVersion,
      edited_by: adminName || "System"
    }])
    .select()
    .single();

  if (error) {
    console.error("[assignments] Erro ao criar snapshot:", error);
    throw new Error("Falha ao salvar snapshot da programação.");
  }

  return data;
}

export async function getLatestSnapshot(date: string) {
  const { data, error } = await supabase
    .from('schedule_snapshots')
    .select('*')
    .eq('date', date)
    .order('version', { ascending: false })
    .limit(1);

  if (error) {
    console.error("[assignments] Erro ao buscar snapshot:", error);
    return null;
  }

  return data && data.length > 0 ? data[0] : null;
}

export async function logAdminAction(action: string, adminName: string, date: string, details: any) {
  const { error } = await supabase
    .from('admin_actions')
    .insert([{
      action,
      admin_name: adminName,
      date_affected: date,
      details
    }]);

  if (error) {
    console.error("[assignments] Erro ao logar ação admin:", error);
  }
}

/**
 * Atualiza múltiplos assignments de uma vez (usado pelo Admin)
 */
export async function updateAssignments(date: string, newAssignments: { member: string, cardId: string }[], adminName: string) {
  // Busca estado atual para log
  const { data: before } = await supabase.from('assignments').select('*').eq('date', date);

  // Deleta atuais
  const { error: delError } = await supabase.from('assignments').delete().eq('date', date);
  if (delError) throw delError;

  // Insere novos
  const toInsert = newAssignments.map(a => ({
    date,
    member: a.member,
    card_id: a.cardId
  }));

  const { error: insError } = await supabase.from('assignments').insert(toInsert);
  if (insError) throw insError;

  // Log de auditoria
  await logAdminAction('EDIT', adminName, date, {
    before,
    after: toInsert,
    reason: "Edição administrativa de programação"
  });
}
