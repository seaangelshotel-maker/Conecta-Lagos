const NM = process.env.NM || new URL('../../node_modules', import.meta.url).pathname;
const esbuildMod = await import(NM + '/esbuild/lib/main.js');
const esbuild = esbuildMod.default || esbuildMod;
import path from 'path';
const H = path.dirname(new URL(import.meta.url).pathname);
const M = (f) => path.join(H, 'mocks', f);
const alias = {
  'firebase/app': M('firebase-app.js'), 'firebase/auth': M('firebase-auth.js'),
  'firebase/firestore': M('firebase-firestore.js'), 'firebase/analytics': M('firebase-analytics.js'),
  'lucide-react': M('lucide-react.js'), 'recharts': M('recharts.js'), 'react-helmet-async': M('react-helmet-async.js'),
  'swr': M('swr.js'), 'motion/react': M('motion-react.js'), '@google/genai': M('google-genai.js'),
};

await esbuild.build({
  entryPoints: [path.join(H, 'entry.tsx')], bundle: true, format: 'esm', splitting: true, outdir: path.join(H, 'www/assets'),
  jsx: 'automatic', logLevel: 'warning', sourcemap: true,
  define: { 'import.meta.env.PROD': 'false', 'import.meta.env.DEV': 'false', 'import.meta.env': '{}', 'process.env.NODE_ENV': '"production"' },
  plugins: [{ name: 'alias', setup(b) {
    b.onResolve({ filter: /.*/ }, (a) => {
      if (alias[a.path]) return { path: alias[a.path] };
      if (/^(react|react-dom|scheduler)(\/.*)?$/.test(a.path)) return { path: require_resolve(a.path) };
      return undefined;
    });
  } }],
});
function require_resolve(p) {
  const map = { 'react': 'react/index.js', 'react/jsx-runtime': 'react/jsx-runtime.js', 'react/jsx-dev-runtime': 'react/jsx-dev-runtime.js',
    'react-dom': 'react-dom/index.js', 'react-dom/client': 'react-dom/client.js', 'scheduler': 'scheduler/index.js' };
  return path.join(NM, map[p] || p);
}
console.log('build ok');
