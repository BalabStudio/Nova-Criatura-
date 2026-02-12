export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getCards, pickRandomCard } from "@/lib/cards";
import { assign, isAssigned, getAllowedCards, getUsedCardIdsForDate, getLastAssignmentForMember, getAssignments } from "@/lib/assignments";

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
  // Garantir formato YYYY-MM-DD sem deslocamento de fuso horário
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

  // Filtra cards por restrição do membro
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
    // Obtém cardIds já usados nessa data
    const usedCardIds = await getUsedCardIdsForDate(isoDate);
    const allAssignments = await getAssignments();
    const lancheCountForDate = allAssignments.filter((a) => a.date === isoDate && a.cardId === "lanche").length;

    let availableCards = cards.filter((c) => {
      // "lanche" pode ter até 3 pessoas
      if (c.id === "lanche") {
        return lancheCountForDate < 3;
      }
      // Outros cards: apenas 1 por data
      return !usedCardIds.includes(c.id);
    });

    // Evita que o membro repita a última função (a menos que seja lanche)
    const lastAssignment = await getLastAssignmentForMember(member);
    if (lastAssignment && lastAssignment.cardId !== "lanche") {
      availableCards = availableCards.filter((c) => c.id !== lastAssignment.cardId);
    }

    if (availableCards.length === 0) {
      // Fallback: se não houver opção que não repita, tenta qualquer uma disponível na data
      availableCards = cards.filter((c) => {
        if (c.id === "lanche") {
          return lancheCountForDate < 3;
        }
        return !usedCardIds.includes(c.id);
      });
      if (availableCards.length === 0) {
        return new NextResponse(JSON.stringify({ error: "Sem funções disponíveis para esta data." }), {
          status: 409,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    const card = pickRandomCard(availableCards);
    const newAssign = await assign(member, isoDate, card.id);
    return NextResponse.json({ assignment: newAssign, card });
  } catch (err) {
    console.error("[api/assign] Erro:", err);
    return new NextResponse(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
