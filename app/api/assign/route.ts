import { NextRequest, NextResponse } from "next/server";
import { getCards, pickRandomCard } from "@/lib/cards";
import { getAssignments, assign, isAssigned, getUsedCardIdsForDate, getLastAssignmentsForMember } from "@/lib/assignments";
import { supabaseAdmin as supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  let body: { member?: string; date?: string };
  try {
    body = await req.json();
  } catch {
    return new NextResponse(JSON.stringify({ error: "Corpo da requisição inválido." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { member, date } = body;

  if (!member || !date) {
    return new NextResponse(JSON.stringify({ error: "Campos 'member' e 'date' são obrigatórios." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Validação: Membro deve existir na tabela members do Supabase
  const { data: memberRow, error: memberErr } = await supabase
    .from("members")
    .select("name, restrictions")
    .eq("name", member)
    .eq("active", true)
    .single();

  if (memberErr || !memberRow) {
    return new NextResponse(JSON.stringify({ error: "Participante não encontrado na lista oficial." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const memberRestrictions: string[] = memberRow.restrictions || [];

  // Validação de data robusta (YYYY-MM-DD)
  const isoDate = date.match(/^\d{4}-\d{2}-\d{2}$/) ? date : new Date(date).toISOString().slice(0, 10);

  if (Number.isNaN(Date.parse(isoDate))) {
    return new NextResponse(JSON.stringify({ error: "Data inválida." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // 1. Verifica se o membro já tem função nesta data (Prevenção nível aplicação para o sorteio)
    if (member !== "Richard" && await isAssigned(member, isoDate)) {
      return new NextResponse(JSON.stringify({ error: `${member}, você já possui uma função para este dia!` }), {
        status: 409,
        headers: { "Content-Type": "application/json" },
      });
    }


    const allCards = getCards();

    // 2. Obtém cards já usados nessa data e histórico do membro (considerando apenas a partir de 28/02/2026 para o Sorteio Justo)
    const [usedCardIds, allMemberAssignments] = await Promise.all([
      getUsedCardIdsForDate(isoDate),
      supabase
        .from('assignments')
        .select('card_id')
        .eq('member', member)
        .gte('date', '2026-02-28')
    ]);

    if (allMemberAssignments.error) {
      throw new Error("Falha ao consultar histórico do banco de dados.");
    }

    const memberHistory = (allMemberAssignments.data || []).map((a: { card_id: string }) => a.card_id);
    const dayAssignments = await getAssignments(isoDate);
    const lancheCountForDate = dayAssignments.filter((a) => a.cardId === "lanche").length;

    // 3. Aplica restrições de membro (via DB) — restrictions=[] significa não configurado
    if (memberRestrictions.length === 0) {
      return new NextResponse(JSON.stringify({ error: `${member} não possui funções configuradas. Contate o administrador.` }), {
        status: 409,
        headers: { "Content-Type": "application/json" },
      });
    }

    const candidateCards = allCards.filter(c => memberRestrictions.includes(c.id));

    // 4. Filtra o que está disponível fisicamente na data
    let physicallyAvailableCards = candidateCards.filter((c) => {
      if (c.id === "lanche") return lancheCountForDate < 3;
      return !usedCardIds.includes(c.id);
    });

    if (physicallyAvailableCards.length === 0) {
      const errorMsg = memberRestrictions.length > 0
        ? `Nenhuma das funções permitidas para ${member} está disponível nesta data.`
        : "Todas as funções para esta data já foram preenchidas.";

      return new NextResponse(JSON.stringify({ error: errorMsg }), {
        status: 409,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 5. Algoritmo de Rotação Justa (Frequência Mínima)
    const frequency: Record<string, number> = {};
    candidateCards.forEach((c) => (frequency[c.id] = 0));
    memberHistory.forEach((id: string) => {
      if (frequency[id] !== undefined) frequency[id]++;
    });

    const lastTwoAssignments = await getLastAssignmentsForMember(member, 2);
    const lastTwoCardIds = lastTwoAssignments.map(a => a.cardId);

    // Tenta evitar repetição das últimas 2 funções (Regra de 2 semanas)
    let rotationCards = physicallyAvailableCards.filter(c => !lastTwoCardIds.includes(c.id));
    
    // Fallback: se sobrar nada (ex: pessoa só pode fazer 3 coisas e já fez 2 ultimamente), volta pro que está fisicamente disponível
    if (rotationCards.length === 0) rotationCards = physicallyAvailableCards;

    // Escolhe os cards menos realizados pelo membro
    const minFreq = Math.min(...rotationCards.map(c => frequency[c.id]));
    let bestCards = rotationCards.filter(c => frequency[c.id] === minFreq);

    const card = pickRandomCard(bestCards);

    // 6. Persistência
    try {
      const newAssign = await assign(member, isoDate, card.id);
      return NextResponse.json({ assignment: newAssign, card });
    } catch (dbErr: any) {
      // Tratamento de concorrência: se o UNIQUE do banco barrar o que a aplicação não viu
      if (dbErr.message?.includes("unique_member_date")) {
        return new NextResponse(JSON.stringify({ error: "Você já foi sorteado por outro dispositivo simultaneamente." }), {
          status: 409,
          headers: { "Content-Type": "application/json" },
        });
      }
      if (dbErr.message?.includes("unique_card_per_day")) {
        return new NextResponse(JSON.stringify({ error: "Esta função acabou de ser preenchida por outra pessoa." }), {
          status: 409,
          headers: { "Content-Type": "application/json" },
        });
      }
      throw dbErr;
    }

  } catch (err: any) {
    console.error("[api/assign] Erro crítico:", err);
    return new NextResponse(JSON.stringify({ error: "Erro interno ao processar o sorteio. Tente novamente." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
