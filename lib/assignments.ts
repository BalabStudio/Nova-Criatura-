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

export async function getAssignments(): Promise<Assignment[]> {
  const { data, error } = await supabase
    .from('assignments')
    .select('date, member, cardId:card_id');

  if (error) {
    console.error("[assignments] Erro ao buscar no Supabase:", error);
    return [];
  }

  return data as Assignment[];
}

export async function isAssigned(member: string, date: string): Promise<boolean> {
  const { count, error } = await supabase
    .from('assignments')
    .select('*', { count: 'exact', head: true })
    .eq('member', member)
    .eq('date', date);

  if (error) {
    console.error("[assignments] Erro ao verificar atribuição:", error);
    return false;
  }

  return (count || 0) > 0;
}

export async function assign(member: string, date: string, cardId: string): Promise<Assignment> {
  // Verifica se já está atribuído
  if (await isAssigned(member, date)) {
    throw new Error(`Já há uma função atribuída para o membro "${member}" nessa data.`);
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

export async function resetAssignments(): Promise<void> {
  const { error } = await supabase
    .from('assignments')
    .delete()
    .neq('member', ''); // Deleta tudo (hack comum para delete global no supabase)

  if (error) {
    console.error("[assignments] Erro ao resetar no Supabase:", error);
    throw new Error("Falha ao resetar o banco de dados.");
  }
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
    .limit(1);

  if (error || !data || data.length === 0) {
    if (error && error.code !== 'PGRST116') {
      console.error("[assignments] Erro ao buscar último sorteio:", error);
    }
    return null;
  }

  return data[0] as Assignment;
}

// Retorna a atribuição de um membro em uma data específica
export async function getAssignmentByMemberAndDate(member: string, date: string): Promise<Assignment | null> {
  const { data, error } = await supabase
    .from('assignments')
    .select('date, member, cardId:card_id')
    .eq('member', member)
    .eq('date', date)
    .limit(1);

  if (error || !data || data.length === 0) {
    return null;
  }
  return data[0] as Assignment;
}

/**
 * Calcula a data do sábado anterior a uma data fornecida.
 * Se a data fornecida for um sábado, retorna o sábado de 7 dias atrás.
 */
export function getPreviousSaturday(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  const day = date.getDay(); // 0=Dom, 1=Seg, ..., 6=Sáb

  // Se for sábado (6), subtrai 7. Se não, subtrai (day + 1) para chegar no sábado anterior.
  const diff = day === 6 ? 7 : day + 1;

  const prevSat = new Date(date);
  prevSat.setDate(date.getDate() - diff);

  return prevSat.toISOString().split('T')[0];
}
