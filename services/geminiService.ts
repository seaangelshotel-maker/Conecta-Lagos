import { generateText } from "./aiClient";

/**
 * Sugestão de chamada para cupom. Usa a IA do servidor (somente administradores);
 * se a IA não estiver disponível, devolve um texto padrão sem interromper o fluxo.
 */
export const generateCouponDescription = async (businessName: string, category: string, discount: number): Promise<string> => {
  const fallback = `Garanta ${discount}% de desconto na ${businessName}!`;
  try {
    const text = await generateText({
      model: 'gemini-2.5-flash',
      contents: `Gere uma chamada vendedora e curta (máximo 15 palavras) para um cupom de ${discount}% na empresa ${businessName}. Categoria: ${category}.`,
    });
    return text || fallback;
  } catch {
    return fallback;
  }
};
