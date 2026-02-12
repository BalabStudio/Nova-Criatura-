import { NextRequest, NextResponse } from "next/server";
import { resetAssignments } from "@/lib/assignments";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "novacriatura01";

export async function POST(req: NextRequest) {
  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return new NextResponse(JSON.stringify({ error: "Corpo da requisição inválido." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  const { password } = body;
  if (password !== ADMIN_PASSWORD) {
    return new NextResponse(JSON.stringify({ error: "Senha incorreta." }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  await resetAssignments();
  return NextResponse.json({ ok: true });
}
