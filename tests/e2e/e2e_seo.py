"""SEO: painel do admin (saúde, metas, ferramentas), páginas por cidade com endereço próprio e página 404."""
import asyncio
from playwright.async_api import async_playwright
from e2e import login, BASE

results, errors = [], []
def ok(name, cond, detail=''):
    results.append((name, bool(cond)))
    print(('PASS ' if cond else 'FAIL ') + name + (f' — {detail}' if detail and not cond else ''))

async def patch_store(page, js_body):
    await page.evaluate("(b) => { const s = JSON.parse(sessionStorage.getItem('__mock_fs__')); (new Function('s', b))(s); sessionStorage.setItem('__mock_fs__', JSON.stringify(s)); }", js_body)

BIZ = """
const mk = (id, name, extra) => Object.assign({ id, name, category: 'Restaurante', description: 'curta', address: '', phone: '', coverImage: '', gallery: [], amenities: [], openingHours: {}, rating: 0, reviews: [], status: 'approved', active: true, isBlocked: false, canBeClaimed: false, isClaimed: false, isFeatured: false, plan: 'pro' }, extra || {});
const long = 'Restaurante à beira-mar com frutos do mar frescos, ambiente familiar e música ao vivo nos fins de semana, em frente à praia.';
s.docs['businesses/cf1'] = mk('cf1', 'Cantina de Cabo Frio', { cityId: 'city_cabo_frio', description: long, address: 'Av. Central 10', phone: '22999990000', coverImage: 'https://example.com/a.jpg' });
s.docs['businesses/cf2'] = mk('cf2', 'Barraca do Canal', { cityId: 'city_cabo_frio' });
s.docs['businesses/ac1'] = mk('ac1', 'Bar de Arraial', { cityId: 'city_arraial_do_cabo' });
"""

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(**p.devices['iPhone 13'], locale='pt-BR')
        page = await ctx.new_page()
        page.on('pageerror', lambda e: errors.append(f'PAGEERROR: {e}'))
        await page.goto(BASE + '/'); await page.evaluate("sessionStorage.clear(); localStorage.clear()")
        await login(page, 'admin@teste.com')
        await page.goto(BASE + '/'); await page.wait_for_timeout(800)
        await patch_store(page, BIZ)

        # ---- 1. página da cidade ----
        await page.goto(BASE + '/cabo-frio'); await page.wait_for_timeout(1500)
        h1 = await page.locator('h1').first.inner_text()
        ok('página /cabo-frio tem título próprio', 'Cabo Frio' in h1 and 'hospedagens' in h1.lower(), h1)
        ok('o endereço continua /cabo-frio', page.url.endswith('/cabo-frio'), page.url)
        body = await page.inner_text('body')
        ok('mostra os lugares de Cabo Frio', 'Cantina de Cabo Frio' in body and 'Barraca do Canal' in body)
        ok('não mostra lugares de outra cidade', 'Bar de Arraial' not in body)

        # trocar para "Toda a região" sai da página da cidade
        await page.get_by_role('button', name='Toda a região').first.click(); await page.wait_for_timeout(500)
        ok('"Toda a região" volta para /descubra', '/descubra' in page.url and '/cabo-frio' not in page.url, page.url)
        ok('título geral volta', 'Todos os lugares da região' in await page.locator('h1').first.inner_text())

        # escolher uma cidade leva ao endereço da cidade
        await page.get_by_role('button', name='Arraial do Cabo').first.click(); await page.wait_for_timeout(500)
        ok('escolher só a cidade usa /arraial-do-cabo', page.url.endswith('/arraial-do-cabo'), page.url)

        # ---- 2. 404 ----
        await page.goto(BASE + '/pagina-que-nao-existe'); await page.wait_for_timeout(1000)
        ok('endereço inexistente mostra a página 404', await page.locator('[data-testid=not-found]').count() == 1)
        ok('404 oferece caminhos de volta', await page.get_by_text('Ir para o início').count() == 1 and await page.get_by_text('Agenda de eventos').count() >= 1)
        await page.get_by_text('Ir para o início').click(); await page.wait_for_timeout(800)
        ok('voltar ao início funciona', page.url.rstrip('/') == BASE.rstrip('/'), page.url)
        await page.goto(BASE + '/descubra'); await page.wait_for_timeout(1000)
        ok('/descubra continua existindo (sem 404)', await page.locator('[data-testid=not-found]').count() == 0)

        # ---- 3. painel de SEO ----
        await page.goto(BASE + '/admin-dashboard'); await page.wait_for_timeout(1300)
        await page.locator('[data-testid=tab-seo]').click(); await page.wait_for_timeout(1500)
        ok('painel de SEO abre', await page.locator('[data-testid=seo-dashboard]').count() == 1)
        ok('mostra a nota de SEO numérica', (await page.locator('[data-testid=seo-score]').inner_text()).strip().isdigit())
        ok('verifica HTTPS/domínio/sitemap/robots/imagem', all([await page.locator(f'[data-testid=seo-check-{k}]').count() == 1 for k in ['domain', 'https', 'sitemap', 'robots', 'og']]))
        desc = await page.locator('[data-testid=seo-goal-description]').inner_text()
        ok('meta de descrição mostra percentual e meta de 90%', '%' in desc and 'meta 90%' in desc, desc)
        ok('meta de foto, endereço e telefone presentes', all([await page.locator(f'[data-testid=seo-goal-{k}]').count() == 1 for k in ['cover', 'address', 'phone']]))
        await page.get_by_text('as fichas que mais precisam de ajuda').click(); await page.wait_for_timeout(300)
        weak = await page.locator('[data-testid=seo-weak-list]').inner_text()
        ok('lista as fichas fracas e o que falta', 'Barraca do Canal' in weak and 'Bar de Arraial' in weak and 'Cantina de Cabo Frio' not in weak and 'falta' in weak, weak[:200])
        ok('tem atalhos do Search Console e PageSpeed', await page.get_by_text('Google Search Console').count() >= 1 and await page.get_by_text('PageSpeed Insights').count() == 1)
        link = await page.get_by_role('link', name='Google Search Console').first.get_attribute('href')
        ok('atalho do Search Console aponta o domínio oficial', 'sc-domain%3Alagosgo.com.br' in (link or ''), link)

        real = [e for e in errors if 'Failed to load resource' not in e]
        ok('nenhum erro de JavaScript', not real, '; '.join(real)[:300])
        await b.close()
    bad = [r for r in results if not r[1]]
    print(f'\n{len(results) - len(bad)}/{len(results)} passaram')
    raise SystemExit(1 if bad else 0)

asyncio.run(main())
