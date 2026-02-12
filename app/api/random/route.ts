import { NextResponse } from "next/server";
import { getCards, pickRandomCard } from "@/lib/cards";

export const runtime = "nodejs";

export async function GET() {
  const cards = getCards();
  const card = pickRandomCard(cards);

  return NextResponse.json(
    { card },
    {
      headers: {
        // garante que o navegador não "reuse" a resposta
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
