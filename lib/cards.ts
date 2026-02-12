import { z } from "zod";
import cardsData from "@/data/cards.json";

export const CardSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().optional().default(""),
  image: z.string().min(1), // ex: "/cards/foto1.jpg"
  description: z.string().optional().default(""),
});

export type CardItem = z.infer<typeof CardSchema>;

const CardsSchema = z.array(CardSchema).min(1, "Cadastre ao menos 1 card em data/cards.json");

export function getCards(): CardItem[] {
  // Validação forte para evitar “quebrar” em runtime
  const parsed = CardsSchema.safeParse(cardsData);
  if (!parsed.success) {
    // Log bem explícito pra debugar rápido
    console.error("cards.json inválido:", parsed.error.flatten());
    throw new Error("cards.json inválido. Verifique o formato e campos obrigatórios.");
  }
  return parsed.data;
}

export function pickRandomCard(cards: CardItem[]): CardItem {
  const idx = Math.floor(Math.random() * cards.length);
  return cards[idx];
}
