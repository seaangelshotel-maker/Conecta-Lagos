"""Tradução da página inteira: auto-detecção, troca pela bandeira, restauração (Conecta-Lagos)."""
import asyncio, json
from playwright.async_api import async_playwright
from e2e import BASE

results = []
def ok(name, cond, detail=''):
    results.append((name, bool(cond)))
    print(('PASS ' if cond else 'FAIL ') + name + (f' — {detail}' if detail and not cond else ''))

async def route_translate(route):
    body = json.loads(route.request.post_data)
    out = [f"[{body['target']}] {t}" for t in body['texts']]
    await route.fulfill(status=200, content_type='application/json', body=json.dumps({'translations': out}))

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        # 1. Navegador em inglês → traduz sozinho
        ctx = await b.new_context(**p.devices['iPhone 13'], locale='en-US')
        await ctx.add_init_script("sessionStorage.setItem('__show_consent__','0')")
        page = await ctx.new_page()
        await page.route('**/api/translate', route_translate)
        await page.goto(BASE + '/blog'); await page.wait_for_timeout(2500)
        ok('html lang acompanha o idioma', await page.evaluate("document.documentElement.lang") == 'en')
        txt = await page.evaluate("document.body.innerText")
        ok('conteúdo da página foi traduzido sozinho (en-US)', '[en]' in txt or 'Home' in txt or 'Guide' in txt, txt[:200])
        # 2. Escolha manual para pt restaura tudo
        await page.evaluate("localStorage.setItem('lagos_go_selected_language','🇧🇷'); window.dispatchEvent(new Event('lagosGoLanguageChanged'))")
        await page.wait_for_timeout(800)
        txt2 = await page.evaluate("document.body.innerText")
        ok('voltar para 🇧🇷 remove as traduções', '[en]' not in txt2 and 'Início' in txt2 or '[en]' not in txt2, txt2[:200])
        # 3. Espanhol manual
        await page.evaluate("localStorage.setItem('lagos_go_selected_language','🇪🇸'); window.dispatchEvent(new Event('lagosGoLanguageChanged'))")
        await page.wait_for_timeout(2000)
        ok('espanhol aplicado', await page.evaluate("document.documentElement.lang") == 'es')
        # 4. Brasileiro não é traduzido
        ctx2 = await b.new_context(**p.devices['iPhone 13'], locale='pt-BR')
        pg2 = await ctx2.new_page()
        await pg2.route('**/api/translate', route_translate)
        await pg2.goto(BASE + '/blog'); await pg2.wait_for_timeout(1500)
        ok('pt-BR permanece em português', '[' not in (await pg2.evaluate("document.body.innerText")).split('\n')[0] and await pg2.evaluate("document.documentElement.lang") == 'pt-BR')
        await b.close()
    bad = [n for n, c in results if not c]
    print(f'\n{len(results)-len(bad)}/{len(results)} ok'); raise SystemExit(1 if bad else 0)
asyncio.run(main())
