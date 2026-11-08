"""Admin controla a Home: lugares por categoria, ordem, nome, ícone, visibilidade e categorias novas (Conecta-Lagos)."""
import asyncio
from playwright.async_api import async_playwright
from e2e import login, logout, mock_docs, BASE

results, errors = [], []
def ok(name, cond, detail=''):
    results.append((name, bool(cond)))
    print(('PASS ' if cond else 'FAIL ') + name + (f' — {detail}' if detail and not cond else ''))

SEED = """() => { const s = JSON.parse(sessionStorage.getItem('__mock_fs__'));
 const b = (id, o) => s.docs['businesses/' + id] = Object.assign({ id, ownerId: id, description: '', coverImage: '', gallery: [], amenities: [], openingHours: {}, rating: 0, isBlocked: false, status: 'approved', cityId: 'arraial', reviews: [] }, o);
 for (let i = 1; i <= 12; i++) b('p' + i, { name: 'Praia Teste ' + i, category: 'Passeios', subcategory: 'Praias', address: 'Rua ' + i });
 b('r1', { name: 'Restaurante Teste', category: 'Gastronomia', subcategory: 'Restaurantes' });
 b('a1', { name: 'Açaí da Praia', category: 'Gastronomia', subcategory: 'Lanchonetes', description: 'Açaí na tigela' });
 b('a2', { name: 'Sorveteria Gelato', category: 'Gastronomia', subcategory: 'Sorveterias' });
 sessionStorage.setItem('__mock_fs__', JSON.stringify(s)); }"""

async def home_state(page):
    await page.goto(BASE + '/'); await page.wait_for_timeout(1800)
    cats = await page.locator('[data-testid^=cat-]').evaluate_all('els => els.map(e => e.dataset.testid.slice(4) + "|" + e.innerText.split("\\n")[0])')
    return cats

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(**p.devices['iPhone 13'])
        page = await ctx.new_page()
        page.on('pageerror', lambda e: errors.append(f'PAGEERROR: {e}'))
        page.on('dialog', lambda d: asyncio.ensure_future(d.accept()))
        await page.goto(BASE + '/'); await page.wait_for_timeout(800)
        await page.evaluate(SEED)

        # padrão
        cats = await home_state(page)
        ok('sem configuração: 10 categorias padrão', len(cats) == 10, str(cats))
        await page.locator('[data-testid=cat-praias]').click(); await page.wait_for_timeout(400)
        ok('sem configuração: 8 lugares por categoria', await page.locator('[data-testid=home-places] [aria-label^="Abrir "]').count() == 8)

        # admin
        await login(page, 'admin@teste.com')
        await page.goto(BASE + '/admin-dashboard'); await page.wait_for_timeout(1500)
        await page.locator('[data-testid=admin-home-discovery]').click(); await page.wait_for_timeout(1500)
        ok('tela do admin abre', await page.locator('[data-testid=home-discovery-admin]').count() == 1)
        praias_n = int((await page.locator('[data-testid=hd-count-praias]').inner_text()).split()[0])
        ok('lista as 10 categorias com contagem real', await page.locator('[data-testid^=hd-row-]').count() == 10 and praias_n >= 12, str(praias_n))
        # quantidade
        await page.locator('[data-testid=hd-places]').fill('5')
        # renomear + ícone
        await page.locator('[data-testid=hd-label-restaurantes]').fill('Onde comer')
        await page.locator('[data-testid=hd-icon-restaurantes]').click()
        ok('seletor de ícones abre', await page.locator('[data-testid=hd-icon-grid]').count() == 1 and await page.locator('[data-testid^=hd-pick-]').count() >= 40)
        await page.locator('[data-testid=hd-pick-Pizza]').click()
        # esconder
        await page.locator('[data-testid=hd-toggle-servicos]').click()
        # mover restaurantes para o topo
        row = page.locator('[data-testid=hd-row-restaurantes]')
        await row.get_by_role('button', name='Subir').click()
        # nova categoria
        await page.locator('[data-testid=hd-add]').click(); await page.wait_for_timeout(300)
        new_id = (await page.locator('[data-testid^=hd-row-nova-categoria]').first.get_attribute('data-testid')).replace('hd-row-', '')
        await page.locator(f'[data-testid=hd-label-{new_id}]').fill('Açaí e sorvetes')
        await page.locator(f'[data-testid=hd-subs-{new_id}] button', has_text='Sorveterias').click()
        await page.locator(f'[data-testid=hd-kw-{new_id}]').fill('açaí'); await page.locator(f'[data-testid=hd-kw-{new_id}]').press('Enter'); await page.wait_for_timeout(200)
        ok('regra mostra quantos lugares batem (2)', 'Hoje: 2 lugares' in (await page.locator(f'[data-testid=hd-rule-box-{new_id}]').inner_text()).replace('\n', ' '))
        # categoria visível sem regra é bloqueada
        await page.locator('[data-testid=hd-add]').click(); await page.wait_for_timeout(200)
        empty_id = (await page.locator('[data-testid^=hd-row-nova-categoria]').last.get_attribute('data-testid')).replace('hd-row-', '')
        await page.locator(f'[data-testid=hd-toggle-{empty_id}]').click()
        await page.locator('[data-testid=hd-save]').click(); await page.wait_for_timeout(800)
        ok('não salva categoria visível sem regra', len(await mock_docs(page, 'app_settings/home_discovery')) == 0)
        await page.locator(f'[data-testid=hd-del-{empty_id}]').click(); await page.wait_for_timeout(300)
        await page.locator(f'[data-testid=hd-toggle-{new_id}]').click()  # mostrar a nova
        await page.locator('[data-testid=hd-save]').click(); await page.wait_for_timeout(1200)
        d = await mock_docs(page, 'app_settings/home_discovery')
        ok('configuração gravada em app_settings/home_discovery', len(d) == 1 and d[0]['placesPerCategory'] == 5)
        saved = {c['id']: c for c in d[0]['categories']} if d else {}
        ok('nova categoria ganhou id pelo nome', 'c-acai-e-sorvetes' in saved and saved['c-acai-e-sorvetes']['rule']['subcategories'] == ['Sorveterias'], str(list(saved)))
        ok('nome, ícone e visibilidade gravados', saved.get('restaurantes', {}).get('label') == 'Onde comer' and saved['restaurantes']['icon'] == 'Pizza' and saved.get('servicos', {}).get('active') is False)
        await page.screenshot(path='shots/40-admin-home.png', full_page=True)

        # efeito na Home (visitante)
        await logout(page)
        cats = await home_state(page)
        ids = [c.split('|')[0] for c in cats]
        ok('Home segue a ordem do admin (Onde comer primeiro)', cats[0] == 'restaurantes|Onde comer', str(cats[:3]))
        ok('categoria escondida some da Home', 'servicos' not in ids)
        ok('categoria criada aparece na Home', 'c-acai-e-sorvetes' in ids)
        await page.locator('[data-testid=cat-praias]').click(); await page.wait_for_timeout(400)
        ok('Home mostra 5 lugares por categoria', await page.locator('[data-testid=home-places] [aria-label^="Abrir "]').count() == 5)
        await page.locator('[data-testid=cat-c-acai-e-sorvetes]').click(); await page.wait_for_timeout(400)
        names = await page.locator('[data-testid=home-places] [aria-label^="Abrir "]').evaluate_all('els => els.map(e => e.getAttribute("aria-label"))')
        ok('categoria criada lista os lugares da regra', sorted(names) == ['Abrir Açaí da Praia', 'Abrir Sorveteria Gelato'], str(names))
        await page.locator('[data-testid=see-all-places]').click(); await page.wait_for_timeout(1500)
        ok('"Ver todos" da categoria criada funciona', 'cat=c-acai-e-sorvetes' in page.url and (await page.locator('[data-testid=results-count]').inner_text()).startswith('2'), page.url)
        ok('página de lugares usa as mesmas categorias', await page.locator('[data-testid=cat-servicos]').count() == 0 and await page.locator('[data-testid=cat-c-acai-e-sorvetes]').count() == 1)

        # visitante não grava
        ok('visitante não altera a configuração', (await mock_docs(page, 'app_settings/home_discovery'))[0]['placesPerCategory'] == 5)
        ok('nenhum erro de JavaScript', not errors, '; '.join(errors)[:300])
        await b.close()
    bad = [r for r in results if not r[1]]
    print(f'\n{len(results) - len(bad)}/{len(results)} passaram')
    raise SystemExit(1 if bad else 0)

asyncio.run(main())
