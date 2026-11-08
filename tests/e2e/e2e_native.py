"""Testes da camada nativa/PWA: compartilhar, offline, links profundos, botão voltar, teclado (Conecta-Lagos)."""
import asyncio
from playwright.async_api import async_playwright
from e2e import login, logout, mock_docs, BASE

results, errors = [], []
def ok(name, cond, detail=''):
    results.append((name, bool(cond)))
    print(('PASS ' if cond else 'FAIL ') + name + (f' — {detail}' if detail and not cond else ''))

CAP = """
window.__cap = { listeners: {}, exited: false, shared: null };
window.Capacitor = { isNativePlatform: () => true, getPlatform: () => 'android', Plugins: {
  App: { addListener: (n, cb) => { window.__cap.listeners[n] = cb; return Promise.resolve({ remove: () => { delete window.__cap.listeners[n]; } }); }, exitApp: () => { window.__cap.exited = true; } },
  Share: { share: async (d) => { window.__cap.shared = d; } },
}};
"""

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(**p.devices['Pixel 7'])
        await ctx.grant_permissions(['clipboard-read', 'clipboard-write'])
        page = await ctx.new_page()
        page.on('pageerror', lambda e: errors.append(f'PAGEERROR: {e}'))
        await page.goto(BASE + '/'); await page.wait_for_timeout(800)

        # dados: matéria publicada
        await page.evaluate("""() => { const s = JSON.parse(sessionStorage.getItem('__mock_fs__')); s.docs['blog_posts/guia_teste'] = { id: 'guia_teste', kind: 'guia', slug: 'teste', title: 'Matéria de teste', subtitle: 's', excerpt: 'Resumo', content: '## Oi\\n\\nTexto.', category: 'Guia', status: 'published', tags: [], date: '2026-11-01', author: 'Equipe', authorId: 'adm', readingMinutes: 2, order: 1 }; sessionStorage.setItem('__mock_fs__', JSON.stringify(s)); }""")

        # 1. Compartilhar no navegador: copia o link (sem navigator.share)
        await page.add_init_script("Object.defineProperty(navigator, 'share', { value: undefined, configurable: true })")
        await page.goto(BASE + '/guia/teste'); await page.wait_for_timeout(1500)
        await page.locator('[data-testid=share]').click(); await page.wait_for_timeout(600)
        clip = await page.evaluate('navigator.clipboard.readText()')
        ok('compartilhar na web copia o link da matéria', clip.endswith('/guia/teste'), clip)
        ok('avisa que o link foi copiado', await page.locator('[data-testid=share-msg]').count() == 1)

        # 2. Offline: aviso aparece e some
        await ctx.set_offline(True); await page.wait_for_timeout(500)
        ok('aviso de sem conexão aparece', await page.locator('[data-testid=offline-banner]').count() == 1)
        await ctx.set_offline(False); await page.wait_for_timeout(500)
        ok('aviso some quando volta a conexão', await page.locator('[data-testid=offline-banner]').count() == 0)

        # 3. Teclado virtual: abas inferiores somem
        await page.goto(BASE + '/descubra'); await page.wait_for_timeout(1200)
        await page.locator('form[role=search] input').focus()
        await page.evaluate("document.documentElement.classList.add('kb-open')")
        vis = await page.locator('nav[aria-label="Navegação principal"]').is_visible()
        ok('com teclado aberto a barra de abas não cobre o campo', not vis)
        await page.evaluate("document.documentElement.classList.remove('kb-open')")
        await ctx.close()

        # 4. Container nativo simulado: link profundo, voltar, compartilhar nativo
        nctx = await b.new_context(**p.devices['Pixel 7'])
        npg = await nctx.new_page()
        npg.on('pageerror', lambda e: errors.append(f'PAGEERROR: {e}'))
        await npg.add_init_script(CAP)
        await npg.goto(BASE + '/'); await npg.wait_for_timeout(1000)
        await npg.evaluate("""() => { const s = JSON.parse(sessionStorage.getItem('__mock_fs__')); s.docs['blog_posts/guia_teste'] = { id: 'guia_teste', kind: 'guia', slug: 'teste', title: 'Matéria de teste', subtitle: 's', excerpt: 'Resumo', content: '## Oi', category: 'Guia', status: 'published', tags: [], date: '2026-11-01', author: 'Equipe', authorId: 'adm', readingMinutes: 2, order: 1 }; sessionStorage.setItem('__mock_fs__', JSON.stringify(s)); }""")
        await npg.goto(BASE + '/'); await npg.wait_for_timeout(1000)
        ok('app registra ouvintes nativos (link profundo e voltar)', await npg.evaluate("Object.keys(window.__cap.listeners).sort().join()") == 'appUrlOpen,backButton')
        await npg.evaluate("window.__cap.listeners.appUrlOpen({ url: 'lagosgo://guia/teste' })"); await npg.wait_for_timeout(1500)
        ok('link profundo lagosgo:// abre a matéria', '/guia/teste' in npg.url and await npg.locator('[data-testid=article-title]').count() == 1, npg.url)
        await npg.evaluate("window.__cap.listeners.appUrlOpen({ url: 'https://evil.example.com/guia/teste' })"); await npg.wait_for_timeout(500)
        ok('link de outro site é ignorado', 'evil' not in npg.url)
        await npg.locator('[data-testid=share]').click(); await npg.wait_for_timeout(500)
        shared = await npg.evaluate('window.__cap.shared')
        ok('compartilhar usa o plugin nativo', shared and shared['title'] == 'Matéria de teste' and shared['url'].endswith('/guia/teste'), str(shared))
        await npg.evaluate("window.__cap.listeners.backButton()"); await npg.wait_for_timeout(800)
        ok('botão voltar do Android volta uma tela', '/guia/teste' not in npg.url, npg.url)
        await npg.evaluate("window.__cap.listeners.backButton()"); await npg.wait_for_timeout(500)
        await npg.goto(BASE + '/'); await npg.wait_for_timeout(800)
        await npg.evaluate("window.__cap.listeners.backButton()"); await npg.wait_for_timeout(300)
        ok('voltar na tela inicial fecha o app', await npg.evaluate('window.__cap.exited'))
        await nctx.close()

        ok('nenhum erro de JavaScript', not errors, '; '.join(errors)[:300])
        await b.close()
    bad = [r for r in results if not r[1]]
    print(f'\n{len(results) - len(bad)}/{len(results)} passaram')
    raise SystemExit(1 if bad else 0)

asyncio.run(main())
