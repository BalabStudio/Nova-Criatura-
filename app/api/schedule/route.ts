import { NextRequest, NextResponse } from "next/server";
import { getAssignments, getLatestSnapshot } from "@/lib/assignments";
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
  try {
    // Validação de data mais robusta
    const isoDate = dateParam.match(/^\d{4}-\d{2}-\d{2}$/) ? dateParam : new Date(dateParam).toISOString().slice(0, 10);

    const dateObj = new Date(isoDate + "T12:00:00Z"); // Use noon to avoid day shifts
    const weekdayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const weekday = weekdayNames[dateObj.getUTCDay()];

    // 1. Busca os dados reais/vivos
    const dayAssignments = await getAssignments(isoDate);

    // 2. Busca snapshot para metadados (horario, facilitacao padrao se nao houver assignment)
    const snapshot = await getLatestSnapshot(isoDate);

    // Monta a programação base
    const funcoes: ScheduleResponse["funcoes"] = {
      facilitacao: "Richard",
      comunhao: [],
    };

    const comunhaoMembers: string[] = [];

    // Prioridade 1: Dados vivos do banco (assignments)
    dayAssignments.forEach((assignment) => {
      const role = CARD_TO_ROLE[assignment.cardId];
      if (role === "comunhao") {
        comunhaoMembers.push(assignment.member);
      } else if (role) {
        funcoes[role as keyof Omit<ScheduleResponse["funcoes"], "comunhao">] =
          assignment.member;
      }
    });

    funcoes.comunhao = comunhaoMembers.slice(0, 3);

    // Se houver snapshot, podemos usar o horário ou facilitador se não estiver nos assignments
    const response: any = {
      date: isoDate,
      weekday,
      horario: snapshot?.content?.horario || "17:00",
      funcoes,
      version: snapshot?.version,
      isSnapshot: !!snapshot
    };

    return NextResponse.json(response);
  } catch (err) {
    return new NextResponse(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
