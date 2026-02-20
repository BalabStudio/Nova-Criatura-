import { NextRequest, NextResponse } from "next/server";
import { resetAssignments } from "@/lib/assignments";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "novacriatura01";

export async function POST(req: NextRequest) {
  let body: { password?: string; date?: string; adminName?: string };
  try {
    body = await req.json();
  } catch {
    return new NextResponse(JSON.stringify({ error: "Corpo da requisição inválido." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  const { password, date, adminName } = body;

  if (password !== ADMIN_PASSWORD) {
    return new NextResponse(JSON.stringify({ error: "Senha incorreta." }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!date || !adminName) {
    return new NextResponse(JSON.stringify({ error: "Data e nome do admin são obrigatórios para zerar." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    await resetAssignments(date, adminName);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return new NextResponse(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
