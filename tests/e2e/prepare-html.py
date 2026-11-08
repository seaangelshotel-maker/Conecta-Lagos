"""Gera www/index.html a partir do index.html do projeto, trocando CDNs pelo CSS local."""
import re, pathlib, shutil
here = pathlib.Path(__file__).parent
root = here.parent.parent
s = (root / 'index.html').read_text(encoding='utf-8')
s = re.sub(r'<script src="https://cdn.tailwindcss.com[^>]*></script>\s*<script>\s*tailwind.config.*?</script>', '', s, flags=re.S)
s = re.sub(r'<link rel="stylesheet" href="https://unpkg.com/leaflet[^>]*/>', '', s)
s = re.sub(r'<script src="https://unpkg.com/leaflet[^>]*></script>', '', s)
s = s.replace('<style>', '<link rel="stylesheet" href="/app.css">\n    <style>', 1)
s = s.replace('<script type="module" src="/index.tsx"></script>', '<script type="module" src="/assets/entry.js"></script>')
# Nos testes, o aviso de privacidade já vem respondido (só o e2e_legal.py pede para vê-lo).
s = s.replace('<script type="module" src="/assets/entry.js"></script>', '<script>try{if(!sessionStorage.getItem("__show_consent__")&&!localStorage.getItem("lagosgo_consent_analytics_v1"))localStorage.setItem("lagosgo_consent_analytics_v1","denied")}catch(e){}</script>\n    <script type="module" src="/assets/entry.js"></script>')
(here / 'www').mkdir(exist_ok=True)
(here / 'www' / 'index.html').write_text(s, encoding='utf-8')
shutil.copytree(root / 'public', here / 'www', dirs_exist_ok=True)
print('www pronto')
