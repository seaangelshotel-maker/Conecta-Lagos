/**
 * Cliente de IA do navegador. Nunca usa chave embutida no site:
 * - Sem chave manual: chama /api/ai/generate (servidor, só administradores).
 * - Com chave manual (digitada pelo admin no painel, fica só no navegador dele):
 *   chama o Gemini diretamente.
 */
import { auth } from './firebase';

export interface GenerateParams {
    model: string;
    contents: unknown;
    config?: Record<string, unknown>;
}

export const generateText = async (params: GenerateParams, manualApiKey?: string): Promise<string> => {
    if (manualApiKey) {
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey: manualApiKey });
        const response = await ai.models.generateContent({
            model: params.model,
            contents: params.contents as any,
            config: params.config as any,
        });
        return response.text || '';
    }

    const user = auth.currentUser;
    if (!user) throw new Error('Faça login como administrador para usar a IA.');
    const idToken = await user.getIdToken();
    const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify(params),
    });
    let data: any = {};
    try {
        data = await response.json();
    } catch {
        throw new Error('O servidor de IA não respondeu. Verifique se as funções /api estão publicadas.');
    }
    if (!response.ok) throw new Error(data.error || 'Erro ao consultar a IA.');
    return data.text || '';
};
