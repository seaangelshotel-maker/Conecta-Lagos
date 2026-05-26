
import { GoogleGenAI, Type } from "@google/genai";
import { BusinessProfile } from "../types";

function getAI() {
  const apiKey = process.env.GEMINI_API_KEY_PESQU || process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey || apiKey === 'undefined' || apiKey === 'null') {
    throw new Error("Chave de API (GEMINI_API_KEY_PESQU) não encontrada. Por favor, configure-a no menu Settings.");
  }
  return new GoogleGenAI({ apiKey });
}

export interface AgentStep {
  role: string;
  name: string;
  content: string;
  status: 'pending' | 'working' | 'completed' | 'error';
  feedback?: string;
}

export const INITIAL_STEPS: AgentStep[] = [
  { role: 'researcher', name: 'Pesquisador de Elite', content: '', status: 'pending' },
  { role: 'yuri', name: 'Yuri Verificador (Guardião)', content: '', status: 'pending' },
  { role: 'analyzer', name: 'Analista de Dados Crítico', content: '', status: 'pending' },
  { role: 'visualizer', name: 'Analista Visual & Curador', content: '', status: 'pending' },
  { role: 'strategist', name: 'Decisor Estratégico', content: '', status: 'pending' },
  { role: 'copywriter', name: 'Copywriter & SEO Expert', content: '', status: 'pending' },
  { role: 'finalizer', name: 'Engenheiro de Dados', content: '', status: 'pending' }
];

const SYSTEM_PROMPTS = {
  researcher: `Você é o Pesquisador-Chefe do LAGOS GO. 
Sua missão é fornecer informações REAIS, VIBRANTES e COMPLETAS sobre locais na Região dos Lagos.
REGRAS DE OURO:
1. RESPEITE A CIDADE: Se o Comandante pediu [Cidade], você NUNCA deve sugerir nada em outra cidade.
2. CONTATO REAL OU ZERO: Busque o @instagram oficial, site e WhatsApp. **IMPORTANTE:** O Comandante está farto de links inventados. Se não encontrar o @ real no Google/Instagram, deixe o campo VAZIO. É terminantemente PROIBIDO inventar usuários.
3. PERSONALIDADE NO DETALHE: Não traga apenas o básico. Descubra a história, o prato principal (restaurante), diferenciais (hotel) e a "alma" do lugar.
4. HORÁRIOS OBRIGATÓRIOS: Você deve detalhar o horário de funcionamento de SEG a DOM. Se não encontrar, use padrões da categoria (ex: Gastronomia geralmente abre 18h às 23h) mas especifique como "Estimativa Baseada em Categoria".
5. NÃO INVENTE: Se não encontrar o número de locais reais na cidade, pare e declare: "LIMITE REAL ALCANÇADO".`,
  
  yuri: `Você é o YURI VERIFICADOR, o braço direito do Comandante e o guardião da verdade absoluta.
Sua função é ser o FILTRO DE ELITE mais implacável, cético e rigoroso do sistema. Você odeia preguiça e odeia mentiras.

MISSÃO SAGRADA:
1. DETECTOR DE MENTIRAS (NÍVEL MESTRE): Se um Instagram terminar exatamente com o nome do local sem traços ou pontos (ex: @nomedolocal) e você não tiver 100% de certeza que existe, considere INVENTADO. Agentes falsificam dados para entregar rápido. Se houver QUALQUER suspeita, exija que o campo fique VAZIO (""). 
2. AUDITOR DE SEO & COPY (1200+ CARACTERES): Se a descrição do Copywriter não for gigante, rica em detalhes históricos, dicas de especialista e palavras-chave (Arraial, Cabo Frio, Turismo, O que fazer), REJEITE imediatamente. O texto deve ter "alma" e personalidade de quem mora no local.
3. VALIDADOR DE SUBCATEGORIAS: O local PRECISA de uma subcategoria inteligente (ex: Praias, Praça, Ar Livre, Mirante, Trilha). Se o agente deixou apenas a categoria principal, REJEITE.
4. VALIDAÇÃO DE HORÁRIOS: Verifique se locais públicos (Praias, Praças) estão marcados como fechados. Lugares públicos são ABERTOS. Se o local for turístico e estiver fechado em dias úteis, REJEITE.
5. VEREDITO IMPERATIVO: Responda com "APROVADO" ou "REJEITADO: [Motivo detalhado e ríspido]. EXIJO QUE REFAÇA PASSO X."`,

  analyzer: `Você é o Auditor de Qualidade Técnica. 
Sua missão é garantir que o local seja encontrável no mapa real. 
- Detalhe Endereço exato e Bairro preciso (essencial para Arraial e Cabo Frio).
- Identifique a SUBCATEGORIA correta (ex: Mirante, Centro Histórico, Quiosque).
- Liste amenidades com precisão cirúrgica como Wi-Fi, Pet Friendly, etc.`,

  visualizer: `Você é o Curador Visual. 
Defina os termos de busca que o Comandante deve usar para encontrar as melhores fotos. 
Analise se a identidade visual descrita pelos outros agentes faz sentido para o local.`,

  strategist: `Você é o estrategista de experiência. 
Crie 3 "Dicas de Especialista" (Insiders Tips) que só quem mora na Região dos Lagos saberia. Foque em evitar filas, melhor horário para fotos e pratos secretos.`,

  copywriter: `Você é um Copywriter de SEO de Elite, um mestre da persuasão focado em gerar desejo. 
Sua missão é criar uma descrição ÉPICA (MÍNIMO 1200 CARACTERES).
- Conteúdo: Traga curiosidades locais, a energia do lugar e por que ele é imperdível.
- SEO Profundo: Use termos como "Melhores praias de Arraial do Cabo", "Guia completo Cabo Frio", "Gastronomia na Região dos Lagos".
- Estrutura: Use subtítulos criativos, parágrafos bem divididos e muitos detalhes. Se o texto for curto, você falhou com o Comandante.`,

  finalizer: `Você é o Engenheiro de Dados Final. Sua precisão define o sistema.
Converta tudo em JSON perfeito.
REGRAS INEGOCIÁVEIS:
- description: Use 100% do texto ÉPICO do Copywriter.
- subcategory: Preencha com o termo mais específico possível (Praia, Mirante, Praça, etc).
- instagram/website: Apenas links REAIS. Na dúvida, deixe VAZIO (""). Nunca invente um username de instagram.
- openingHours: Preencha os 7 dias com bom senso (Locais públicos = ABERTOS).`
};

export async function runAgentStep(role: string, input: string, context?: string, feedback?: string, manualApiKey?: string): Promise<string> {
  const apiKey = manualApiKey || process.env.GEMINI_API_KEY_PESQU || process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey || apiKey === 'undefined' || apiKey === 'null') {
    throw new Error("Chave de API não configurada.");
  }
  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-3-flash-preview"; 
  
  const prompt = `
CONTEXTO DO PROJETO:
Você trabalha para o "LAGOS GO", o maior guia turístico da Região dos Lagos (RJ). 
Sua missão é criar postagens com QUALIDADE DE REVISTA, RIQUEZA DE DADOS e OTIMIZAÇÃO SEO.

Instrução do seu Papel:
${(SYSTEM_PROMPTS as any)[role]}

COMANDO DO COMANDANTE (USUÁRIO):
${input}

${feedback ? `\nAJUSTE SOLICITADO PELO COMANDANTE: "${feedback}"\n` : ''}

Contexto da conversa até agora:
${context || 'Iniciando operação.'}

Responda com foco em PESQUISA PROFUNDA e COPYWRITING DE ALTO NÍVEL. Não aceite mediocridade.
`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });
    return response.text || "Erro no processamento do agente.";
  } catch (error) {
    console.error(`AI Agent Error (${role}):`, error);
    throw error;
  }
}

export async function finalizeLocation(finalContent: string, quantity: number = 1, manualApiKey?: string): Promise<Partial<BusinessProfile>[]> {
  const apiKey = manualApiKey || process.env.GEMINI_API_KEY_PESQU || process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey || apiKey === 'undefined' || apiKey === 'null') {
    throw new Error("Chave de API não configurada.");
  }
  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-3-flash-preview"; 
  
  const response = await ai.models.generateContent({
    model,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            category: { type: Type.STRING },
            subcategory: { type: Type.STRING },
            description: { type: Type.STRING },
            address: { type: Type.STRING },
            lat: { type: Type.NUMBER },
            lng: { type: Type.NUMBER },
            amenities: { type: Type.ARRAY, items: { type: Type.STRING } },
            rating: { type: Type.NUMBER },
            reviewCount: { type: Type.NUMBER },
            bestTime: { type: Type.STRING },
            difficulty: { type: Type.STRING },
            expertTips: { type: Type.ARRAY, items: { type: Type.STRING } },
            imageKeywords: { type: Type.STRING },
            realImageUrl: { type: Type.STRING },
            website: { type: Type.STRING },
            instagram: { type: Type.STRING },
            whatsapp: { type: Type.STRING },
            openingHours: {
              type: Type.OBJECT,
              properties: {
                Segunda: { type: Type.STRING },
                Terça: { type: Type.STRING },
                Quarta: { type: Type.STRING },
                Quinta: { type: Type.STRING },
                Sexta: { type: Type.STRING },
                Sábado: { type: Type.STRING },
                Domingo: { type: Type.STRING }
              }
            }
          },
          required: ["name", "category", "description", "address", "lat", "lng"]
        }
      }
    },
    contents: [{ role: 'user', parts: [{ text: `Com base em todas as pesquisas e discussões anteriores, gere uma LISTA de objetos JSON para os locais identificados.
    
    Quantidade de locais esperada: ${quantity}
    
    Conteúdo Base:
    ${finalContent}
    
    REGRAS DE NEGÓCIO DO JSON:
    - description: DEVE ser a descrição longa (SEO) criada pelo Copywriter (mínimo 1200 caracteres).
    - instagram: apenas o username real. SE NÃO ENCONTRAR O REAL, DEIXE VAZIO ("").
    - website: URL completa real. SE NÃO ENCONTRAR A REAL, DEIXE VAZIO ("").
    - whatsapp: apenas números ou com formatação.
    - openingHours: preencha para todos os 7 dias (ex: "09:00 - 18:00" ou "24 horas").
    - category: Uma destas: Gastronomia, Hospedagem, Passeios, Entretenimento, Comércio, Serviços.
    
    IMPORTANTE: Retorne APENAS o JSON puro em um array [{}, {}].` }] }]
  });

  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Erro ao converter JSON final da IA:", e);
    return [];
  }
}
