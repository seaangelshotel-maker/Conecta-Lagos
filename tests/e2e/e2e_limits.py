"""Admin controla limites: editar plano, padrão para quem não tem plano e ajuste por cliente (cupons e eventos)."""
import asyncio, re
from playwright.async_api import async_playwright
from e2e import login, logout, mock_docs, BASE

results, errors = [], []
def ok(name, cond, detail=''):
    results.append((name, bool(cond)))
    print(('PASS ' if cond else 'FAIL ') + name + (f' — {detail}' if detail and not cond else ''))

async def patch_store(page, js_body):
    await page.evaluate("(b) => { const s = JSON.parse(sessionStorage.getItem('__mock_fs__')); (new Function('s', b))(s); sessionStorage.setItem('__mock_fs__', JSON.stringify(s)); }", js_body)

async def doc(page, path):
    r = await mock_docs(page, path)
    return next((d for d in r if d['path'] == path), None)

async def open_plans(page):
    await page.goto(BASE + '/admin-dashboard'); await page.wait_for_timeout(1300)
    await page.get_by_text('Planos de Assinatura').first.click(); await page.wait_for_timeout(1000)

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(**p.devices['iPhone 13'])
        page = await ctx.new_page()
        page.on('pageerror', lambda e: errors.append(f'PAGEERROR: {e}'))
        await page.goto(BASE + '/'); await page.evaluate("sessionStorage.clear(); localStorage.clear()")
        await login(page, 'admin@teste.com')
        await page.goto(BASE + '/'); await page.wait_for_timeout(800)
        await patch_store(page, "s.docs['users/ana'].plan = 'basic';")

        # ---- 1. editar um plano existente (antes só dava para criar ou excluir) ----
        await open_plans(page)
        n_plans = len(await mock_docs(page, 'pricingPlans/'))
        await page.locator('[data-testid=plan-edit-basic]').click(); await page.wait_for_timeout(400)
        ok('formulário vira "Editar Plano"', 'Editar' in await page.locator('[data-testid=plan-form-title]').inner_text())
        box = page.locator("xpath=//span[normalize-space()='Max. Cupons']/following-sibling::input")
        ok('formulário traz o limite atual do plano (3)', await box.input_value() == '3')
        await box.fill('1')
        await page.get_by_role('button', name=re.compile('SALVAR PLANO', re.I)).click(); await page.wait_for_timeout(900)
        plans = await mock_docs(page, 'pricingPlans/')
        basic = next(d for d in plans if d['path'] == 'pricingPlans/basic')
        ok('editar atualiza o MESMO plano (sem duplicar)', len(plans) == n_plans and basic['maxCoupons'] == 1 and basic['name'] == 'Básico', str(basic))
        ok('formulário volta para "Criar Novo Plano"', 'Criar' in await page.locator('[data-testid=plan-form-title]').inner_text())

        # ---- 2. painel de limites mostra o limite efetivo do cliente ----
        await open_plans(page)
        row = page.locator('[data-testid=limits-row]', has_text='ana@teste.com')
        ok('painel de limites lista o comerciante', await row.count() == 1)
        ok('cupons: usa o limite do plano editado (1)', 'de 1' in await row.locator('[data-testid=limits-c-state]').inner_text(), await row.inner_text())

        # ---- 3. limite próprio do cliente (cupons e eventos) ----
        await row.locator('[data-testid=limits-c-input]').fill('5')
        await row.locator('[data-testid=limits-c-save]').click(); await page.wait_for_timeout(700)
        ok('cota de cupons do cliente gravada', (await doc(page, 'users/ana'))['maxCoupons'] == 5)
        ok('tela mostra "definido por você"', 'definido por você' in await row.locator('[data-testid=limits-c-state]').inner_text())
        await row.locator('[data-testid=limits-e-input]').fill('2')
        await row.locator('[data-testid=limits-e-save]').click(); await page.wait_for_timeout(700)
        ok('cota de eventos do cliente gravada', (await doc(page, 'users/ana'))['maxEvents'] == 2)
        await row.get_by_role('button', name='Seguir plano').first.click(); await page.wait_for_timeout(700)
        ok('"Seguir plano" apaga só a cota própria de cupons', 'maxCoupons' not in await doc(page, 'users/ana') and (await doc(page, 'users/ana'))['maxEvents'] == 2)
        await row.locator('[data-testid=limits-c-input]').fill('-3')
        await row.locator('[data-testid=limits-c-save]').click(); await page.wait_for_timeout(500)
        ok('número negativo é recusado', 'maxCoupons' not in await doc(page, 'users/ana') and await page.get_by_text('igual ou maior que zero').count() >= 1)

        # ---- 4. padrão de quem não tem plano ----
        await patch_store(page, "delete s.docs['users/ana'].plan; delete s.docs['users/ana'].maxEvents;")
        await open_plans(page)
        await page.locator('[data-testid=default-coupons]').fill('0')
        await page.locator('[data-testid=default-events]').fill('3')
        await page.locator('[data-testid=default-save]').click(); await page.wait_for_timeout(800)
        g = await doc(page, 'app_settings/global')
        ok('padrão sem plano gravado (cupons 0, eventos 3)', g and g.get('defaultMaxCoupons') == 0 and g.get('defaultMaxEvents') == 3, str(g))
        row = page.locator('[data-testid=limits-row]', has_text='ana@teste.com')
        ok('cliente sem plano passa a seguir o padrão', 'de 0' in await row.locator('[data-testid=limits-c-state]').inner_text() and 'de 3' in await row.locator('[data-testid=limits-e-state]').inner_text(), await row.inner_text())

        # ---- 5. comerciante sem plano é barrado pelo padrão do admin ----
        await logout(page); await login(page, 'ana@teste.com')
        await page.goto(BASE + '/admin-dashboard'); await page.wait_for_timeout(1300)
        await page.locator('button', has_text='NOVO CUPOM').first.click(); await page.wait_for_timeout(600)
        prices = page.locator('input[placeholder="0.00"]')
        await prices.nth(0).fill('100'); await prices.nth(1).fill('70')
        await page.get_by_placeholder('Título da Oferta (Ex: 50% de Desconto no Rodízio)').fill('Bloqueado pelo padrão')
        await page.get_by_placeholder('Descreva o que está incluído nesta oferta...').fill('teste')
        await page.get_by_role('button', name='Link', exact=True).click()
        await page.get_by_placeholder('Cole os links das imagens (um por linha)...').fill('https://example.com/a.jpg')
        await page.locator('form button[type=submit]').last.click(); await page.wait_for_timeout(1000)
        ok('padrão 0 do admin barra cupom de quem não tem plano', not any(c.get('title') == 'Bloqueado pelo padrão' for c in await mock_docs(page, 'coupons/')) and await page.get_by_text('Seu plano permite 0 cupom').count() >= 1)

        # ---- 6. admin limpa o padrão: volta a ser sem limite ----
        await logout(page); await login(page, 'admin@teste.com')
        await open_plans(page)
        await page.locator('[data-testid=default-coupons]').fill('')
        await page.locator('[data-testid=default-save]').click(); await page.wait_for_timeout(800)
        g = await doc(page, 'app_settings/global')
        ok('limpar o padrão remove o limite (sem limite de novo)', 'defaultMaxCoupons' not in g and g.get('defaultMaxEvents') == 3, str(g))

        ok('nenhum erro de JavaScript', not [e for e in errors if 'Failed to load resource' not in e], '; '.join(errors)[:300])
        await b.close()
    bad = [r for r in results if not r[1]]
    print(f'\n{len(results) - len(bad)}/{len(results)} passaram')
    raise SystemExit(1 if bad else 0)

asyncio.run(main())
