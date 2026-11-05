const NM = process.env.NM || new URL('../../node_modules', import.meta.url).pathname;
const { compile } = await import(NM + '/tailwindcss/dist/lib.mjs');
import fs from 'fs';
import path from 'path';
const TW = NM + '/tailwindcss';
const css = `@import "tailwindcss";
@theme {
  --color-ocean-50:#f0f9ff;--color-ocean-100:#e0f2fe;--color-ocean-200:#bae6fd;--color-ocean-300:#7dd3fc;--color-ocean-400:#38bdf8;
  --color-ocean-500:#0ea5e9;--color-ocean-600:#0284c7;--color-ocean-700:#0369a1;--color-ocean-800:#075985;--color-ocean-900:#0c4a6e;--color-ocean-950:#082f49;
  --color-gold-50:#fffbeb;--color-gold-100:#fef3c7;--color-gold-400:#fbbf24;--color-gold-500:#f59e0b;--color-gold-600:#d97706;
  --font-sans: Inter, system-ui, sans-serif;
}`;
const compiler = await compile(css, {
  base: TW,
  loadStylesheet: async (id, base) => {
    const file = id === 'tailwindcss' ? path.join(TW, 'index.css') : path.resolve(base, id.replace(/^tailwindcss\//, ''));
    const f = fs.existsSync(file) ? file : path.join(TW, id.replace(/^tailwindcss\//, ''));
    return { content: fs.readFileSync(f, 'utf8'), base: path.dirname(f), path: f };
  },
});
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.name === 'node_modules' || e.name.startsWith('.') ? [] : e.isDirectory() ? walk(path.join(d, e.name)) : /\.(tsx|ts|html)$/.test(e.name) ? [path.join(d, e.name)] : []);
const cands = new Set();
for (const f of walk(new URL('../..', import.meta.url).pathname)) {
  for (const t of fs.readFileSync(f, 'utf8').split(/[\s'"`{}()<>,;]+/)) if (t && t.length < 120) cands.add(t);
}
fs.writeFileSync('www/app.css', compiler.build([...cands]));
console.log('css', fs.statSync('www/app.css').size, 'bytes');
