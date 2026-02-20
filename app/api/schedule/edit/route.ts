import { NextRequest, NextResponse } from "next/server";
import { updateAssignments, createSnapshot } from "@/lib/assignments";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "novacriatura01";

export async function POST(req: NextRequest) {
    let body: {
        password?: string;
        date?: string;
        adminName?: string;
        assignments: { member: string, cardId: string }[];
        fullSchedule: any;
    };

    try {
        body = await req.json();
    } catch {
        return new NextResponse(JSON.stringify({ error: "Corpo da requisição inválido." }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    const { password, date, adminName, assignments, fullSchedule } = body;

    if (password !== ADMIN_PASSWORD) {
        return new NextResponse(JSON.stringify({ error: "Senha incorreta." }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        });
    }

    if (!date || !adminName || !assignments || !fullSchedule) {
        return new NextResponse(JSON.stringify({ error: "Dados incompletos para salvar edição." }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    try {
        // 1. Atualiza os assignments reais no banco
        await updateAssignments(date, assignments, adminName);

        // 2. Cria um novo snapshot versionado
        await createSnapshot(date, fullSchedule, assignments, adminName);

        return NextResponse.json({ ok: true });
    } catch (err: any) {
        console.error("[api/schedule/edit] Erro:", err);
        return new NextResponse(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
