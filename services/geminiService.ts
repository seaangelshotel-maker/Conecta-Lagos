
import { GoogleGenAI } from "@google/genai";

export const generateCouponDescription = async (businessName: string, category: string, discount: number): Promise<string> => {
  const apiKey = process.env.GEMINI_API_KEY_PESQU || process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey || apiKey === 'undefined') {
    return `Garanta ${discount}% de desconto na ${businessName}!`;
  }
  
  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: `Gere uma chamada vendedora e curta (máximo 15 palavras) para um cupom de ${discount}% na empresa ${businessName}. Categoria: ${category}.`,
    });
    return response.text || `Garanta ${discount}% de desconto na ${businessName}!`;
  } catch {
    return `Desconto de ${discount}% na ${businessName}!`;
  }
};

// IA Scraper removed as per user request
