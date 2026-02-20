import { NextRequest, NextResponse } from "next/server";
import { getAssignments } from "@/lib/assignments";
import { getCards } from "@/lib/cards";

interface ScheduleResponse {
  date: string;
  weekday: string;
  horario: string;
  funcoes: {
    oracao?: string;
    louvor?: string;
    dinamica?: string;
    visao?: string;
    facilitacao: string;
    oferta?: string;
    comunhao: string[];
  };
}

// Mapeia cardId para role na célula
const CARD_TO_ROLE: Record<string, string> = {
  oracao: "oracao",
  louvor: "louvor",
  "quebra-gelo": "dinamica",
  visao: "visao",
  oferta: "oferta",
  lanche: "comunhao",
  facilitacao: "facilitacao",
};

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const dateParam = searchParams.get("date");

  if (!dateParam) {
    return new NextResponse(JSON.stringify({ error: "Parâmetro 'date' é obrigatório." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const isoDate = new Date(dateParam).toISOString().slice(0, 10);
  if (Number.isNaN(Date.parse(isoDate))) {
    return new NextResponse(JSON.stringify({ error: "Data inválida." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const dateObj = new Date(isoDate + "T00:00:00Z");
    const weekdayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const weekday = weekdayNames[dateObj.getUTCDay()];

    // 1. Tenta buscar o snapshot mais recente
    const { getLatestSnapshot, createSnapshot } = await import("@/lib/assignments");
    const snapshot = await getLatestSnapshot(isoDate);

    if (snapshot) {
      return NextResponse.json({
        ...snapshot.content,
        date: isoDate,
        weekday,
        version: snapshot.version,
        isSnapshot: true
      });
    }

    // 2. Se não houver snapshot, calcula dinamicamente
    const assignments = await getAssignments();
    const cards = getCards();

    // Filtra sorteios para a data
    const dayAssignments = assignments.filter((a) => a.date === isoDate);

    // Monta a programação
    const funcoes: ScheduleResponse["funcoes"] = {
      facilitacao: "Richard", // Default, but can be overridden
      comunhao: [],
    };

    const comunhaoMembers: string[] = [];

    dayAssignments.forEach((assignment) => {
      const role = CARD_TO_ROLE[assignment.cardId];
      if (role === "comunhao") {
        comunhaoMembers.push(assignment.member);
      } else if (role) {
        funcoes[role as keyof Omit<ScheduleResponse["funcoes"], "comunhao">] =
          assignment.member;
      }
    });

    funcoes.comunhao = comunhaoMembers.slice(0, 3); // Máximo 3

    const response: ScheduleResponse = {
      date: isoDate,
      weekday,
      horario: "17:00",
      funcoes,
    };

    return NextResponse.json(response);
  } catch (err) {
    return new NextResponse(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
