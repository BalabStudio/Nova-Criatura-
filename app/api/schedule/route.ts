export const dynamic = "force-dynamic";
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

  // Garantir formato YYYY-MM-DD sem deslocamento de fuso horário
  let isoDate = dateParam;
  if (dateParam.includes("T")) {
    isoDate = dateParam.split("T")[0];
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
    return new NextResponse(JSON.stringify({ error: "Formato de data inválido. Use YYYY-MM-DD." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const assignments = await getAssignments();
    const cards = getCards();

    // Filtra sorteios para a data
    const dayAssignments = assignments.filter((a) => a.date === isoDate);
    const cardMap = new Map(cards.map((c) => [c.id, c]));

    // Monta a programação
    const funcoes: ScheduleResponse["funcoes"] = {
      facilitacao: "Richard", // Sempre Richard
      comunhao: [],
    };

    const comunhaoMembers: string[] = [];

    dayAssignments.forEach((assignment) => {
      const role = CARD_TO_ROLE[assignment.cardId];
      if (role === "comunhao") {
        comunhaoMembers.push(assignment.member);
      } else if (role && role !== "facilitacao") {
        funcoes[role as keyof Omit<ScheduleResponse["funcoes"], "facilitacao" | "comunhao">] =
          assignment.member;
      }
    });

    funcoes.comunhao = comunhaoMembers.slice(0, 3); // Máximo 3

    // Formata a data
    const dateObj = new Date(isoDate + "T00:00:00Z");
    const weekdayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const weekday = weekdayNames[dateObj.getUTCDay()];

    const response: ScheduleResponse = {
      date: isoDate,
      weekday,
      horario: "17:00", // Horário padrão (pode ser configurável)
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
