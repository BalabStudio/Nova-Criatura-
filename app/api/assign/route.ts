import { NextRequest, NextResponse } from "next/server";
import { getCards, pickRandomCard } from "@/lib/cards";
import {
  assign,
  isAssigned,
  getAllowedCards,
  getUsedCardIdsForDate,
  getAssignments,
  getAssignmentByMemberAndDate,
  getPreviousSaturday
} from "@/lib/assignments";

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

  // Garantir formato YYYY-MM-DD
  let isoDate = date;
  if (date.includes("T")) {
    isoDate = date.split("T")[0];
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
    return new NextResponse(JSON.stringify({ error: "Formato de data inválido. Use YYYY-MM-DD." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (await isAssigned(member, isoDate)) {
    return new NextResponse(JSON.stringify({ error: "Esta pessoa já possui uma função para esta data." }), {
      status: 409,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 1. Buscar todas as funções (considerando restrições do membro)
  let cards = getCards();
  const allowedCards = getAllowedCards(member);
  if (allowedCards.length > 0) {
    cards = cards.filter((c) => allowedCards.includes(c.id));
  }

  if (cards.length === 0) {
    return new NextResponse(JSON.stringify({ error: "Nenhuma função disponível para este membro." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // 2. Filtrar funções já usadas na mesma data
    const usedCardIds = await getUsedCardIdsForDate(isoDate);
    const allAssignments = await getAssignments();
    const lancheCountForDate = allAssignments.filter((a) => a.date === isoDate && a.cardId === "lanche").length;

    // Funções estruturalmente disponíveis para hoje
    const availableOnDate = cards.filter((c) => {
      if (c.id === "lanche") return lancheCountForDate < 3;
      return !usedCardIds.includes(c.id);
    });

    if (availableOnDate.length === 0) {
      return new NextResponse(JSON.stringify({ error: "Sem funções disponíveis para esta data." }), {
        status: 409,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 3. Obter função do sábado anterior
    const previousSaturday = getPreviousSaturday(isoDate);
    const prevAssignment = await getAssignmentByMemberAndDate(member, previousSaturday);
    const prevCardId = prevAssignment?.cardId;

    // 4. Filtrar tentando evitar a repetição
    const filteredAvoidingRepeat = availableOnDate.filter(c => c.id !== prevCardId);

    let finalCard;
    let isRepeated = false;

    // LÓGICA DE DECISÃO:
    if (filteredAvoidingRepeat.length > 0) {
      // Se existir função alternativa -> Sortear normalmente
      finalCard = pickRandomCard(filteredAvoidingRepeat);
    } else {
      // Se NÃO existir função alternativa -> Permitir repetição por limitação estrutural
      finalCard = pickRandomCard(availableOnDate);
      isRepeated = true;
    }

    const newAssign = await assign(member, isoDate, finalCard.id);

    return NextResponse.json({
      assignment: newAssign,
      card: finalCard,
      isRepeated // Indica ao frontend se houve repetição compulsória
    });

  } catch (err) {
    console.error("[api/assign] Erro:", err);
    return new NextResponse(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
