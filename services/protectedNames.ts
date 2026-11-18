/**
 * Nomes próprios de empresas/locais: NUNCA são traduzidos.
 * O nome da empresa é registrado aqui quando o conteúdo carrega; o tradutor de página
 * (1) deixa intacto o texto que é só o nome e (2) esconde o nome dentro de frases antes de enviar
 * para a tradução e o devolve no lugar certo depois.
 */
const names = new Map<string, string>();   // chave normalizada → nome original
let sorted: string[] = [];                  // chaves, maiores primeiro (para casar "Pousada Sol e Mar" antes de "Sol")

const norm = (s: string) => s.normalize('NFC').replace(/\s+/g, ' ').trim().toLowerCase();

/** Nome curto (ex.: "Sol") é protegido só quando é o texto inteiro; dentro de frases só entram nomes com 5+ letras, para não mascarar palavra comum. */
/** Nomes curtos demais ou genéricos demais não entram (evita mascarar palavras comuns). */
const registrable = (n: string) => n.trim().length >= 3 && /\p{L}{3,}/u.test(n);

export const registerNames = (list: Array<string | undefined | null>) => {
    let changed = false;
    for (const raw of list) {
        if (!raw || !registrable(raw)) continue;
        const k = norm(raw);
        if (!names.has(k)) { names.set(k, raw.trim()); changed = true; }
    }
    if (changed) sorted = [...names.keys()].filter(k => k.length >= 5).sort((a, b) => b.length - a.length);
};

export const clearNames = () => { names.clear(); sorted = []; };

/** O texto inteiro é o nome de uma empresa? */
export const isProtectedName = (text: string): boolean => names.has(norm(text));

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const TOKEN = (i: number) => `Zq${i}x`;

/** Troca os nomes por marcadores e devolve a função que os recoloca na tradução. null = sem nomes no texto. */
export const maskNames = (text: string): { masked: string; restore: (tr: string) => string | null } | null => {
    if (!sorted.length) return null;
    const lower = text.normalize('NFC').toLowerCase();
    const found: string[] = [];
    let masked = text.normalize('NFC');
    for (const k of sorted) {
        if (!lower.includes(k)) continue;
        // só casa palavra inteira (não mascara "sol" dentro de "solução")
        const re = new RegExp(`(?<![\\p{L}\\p{N}])${esc(k).replace(/ /g, '\\s+')}(?![\\p{L}\\p{N}])`, 'giu');
        masked = masked.replace(re, m => { found.push(m); return TOKEN(found.length - 1); });
    }
    if (!found.length) return null;
    return {
        masked,
        restore: (tr: string) => {
            let out = tr;
            for (let i = 0; i < found.length; i++) {
                if (!out.includes(TOKEN(i))) return null;       // o tradutor comeu o marcador → melhor não mostrar do que mostrar errado
                out = out.split(TOKEN(i)).join(found[i]);
            }
            return out;
        },
    };
};
