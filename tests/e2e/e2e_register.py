"""Cadastro da empresa ponta a ponta: cadastro → pendente → aprovação → perfil público (WhatsApp, cardápio, pedido)."""
import asyncio, json, urllib.parse
from playwright.async_api import async_playwright
from e2e import login, logout, mock_docs, BASE

results, errors = [], []
def ok(name, cond, detail=''):
    results.append((name, bool(cond)))
    print(('PASS ' if cond else 'FAIL ') + name + (f' — {detail}' if detail and not cond else ''))

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(**p.devices['iPhone 13'], locale='pt-BR')
        page = await ctx.new_page()
        page.on('pageerror', lambda e: errors.append(str(e)))
        opened = []
        async def wa(route):
            opened.append(route.request.url); await route.fulfill(status=200, body='ok')
        await ctx.route('https://wa.me/**', wa)

        # 1. Carla (cliente com permissão) cadastra a empresa
        await login(page, 'carla@teste.com')
        await page.goto(BASE + '/create-business'); await page.wait_for_timeout(1500)
        await page.fill('input[placeholder^="Ex:"]', 'Bistrô da Carla')
        await page.locator('button', has_text='Gastronomia').first.click()
        await page.locator('button', has_text='Continuar').first.click(); await page.wait_for_timeout(400)
        await page.locator('select').nth(0).select_option('arraial'); await page.wait_for_timeout(300)
        await page.locator('select').nth(1).select_option('praia-anjos')
        await page.fill('input[placeholder*="Rua"], input[placeholder*="endere"], input[placeholder*="Av"]', 'Rua das Flores, 10')
        await page.locator('button', has_text='Continuar').first.click(); await page.wait_for_timeout(400)
        await page.locator('button', has_text='Continuar').first.click(); await page.wait_for_timeout(400)
        # passo 4 (confirmação) ou passo 3 (detalhes)? preenche WhatsApp quando aparecer
        if await page.locator('[data-testid=reg-whatsapp]').count() == 0:
            await page.locator('button', has_text='Continuar').first.click(); await page.wait_for_timeout(400)
        await page.fill('[data-testid=reg-whatsapp]', '123')
        await page.locator('button[type=submit]').last.click(); await page.wait_for_timeout(600)
        ok('WhatsApp inválido bloqueia o cadastro', len(await mock_docs(page, 'businesses/carla')) == 0)
        await page.fill('[data-testid=reg-whatsapp]', '(22) 99988-7766')
        await page.fill('input[placeholder="@suaempresa"]', '@bistrocarla')
        await page.fill('textarea', 'Comida caseira à beira-mar.')
        await page.locator('button[type=submit]').last.click(); await page.wait_for_timeout(1500)
        biz = await mock_docs(page, 'businesses/carla')
        ok('empresa gravada como pendente', biz and biz[0].get('status') == 'PENDING' and biz[0].get('name') == 'Bistrô da Carla', json.dumps(biz)[:300])
        ok('WhatsApp gravado no campo whatsapp (não só em phone)', biz and biz[0].get('whatsapp') == '(22) 99988-7766' and biz[0].get('phone') == '(22) 99988-7766')
        ok('instagram sem @', biz and biz[0].get('instagram') == 'bistrocarla')
        ok('cidade/bairro/localização gravados', biz and biz[0].get('cityId') == 'arraial' and biz[0].get('neighborhoodId') == 'praia-anjos' and biz[0].get('lat') is not None)
        u = (await mock_docs(page, 'users/carla'))[0]
        ok('usuária promovida a COMPANY', u.get('role') == 'COMPANY', u.get('role'))

        # 2. Pendente não aparece no guia público
        await logout(page)
        await page.goto(BASE + '/guide'); await page.wait_for_timeout(1500)
        ok('empresa pendente não aparece no guia', await page.locator('text=Bistrô da Carla').count() == 0)

        # 3. Admin aprova
        await login(page, 'admin@teste.com')
        await page.goto(BASE + '/admin-dashboard'); await page.wait_for_timeout(1500)
        await page.evaluate("() => { const b=[...document.querySelectorAll('button')].find(x=>/empresas/i.test(x.innerText)); if(b) b.click(); }")
        await page.wait_for_timeout(800)
        ok('admin vê a empresa pendente', await page.locator('text=Bistrô da Carla').count() > 0)
        await page.locator('button', has_text='APROVAR').first.click(); await page.wait_for_timeout(600)
        btns = await page.evaluate("() => [...document.querySelectorAll('button')].map(x=>x.innerText.trim()).filter(Boolean).slice(-6)")
        print('botões:', btns)
        await page.locator('button', has_text='Confirmar').last.click(); await page.wait_for_timeout(1200)
        biz = await mock_docs(page, 'businesses/carla')
        ok('empresa aprovada', biz and str(biz[0].get('status')).lower() == 'approved', biz[0].get('status') if biz else '')

        # 4. Perfil público: WhatsApp funciona
        await logout(page)
        await page.goto(BASE + '/business/carla'); await page.wait_for_timeout(1800)
        ok('perfil público abre', await page.locator('text=Bistrô da Carla').count() > 0)
        await page.locator('button', has_text='WhatsApp').first.click(); await page.wait_for_timeout(600)
        ok('botão WhatsApp abre conversa com o número cadastrado', len(opened) == 1 and '/5522999887766' in opened[0], str(opened))
        await b.close()
    bad = [n for n, c in results if not c]
    print(f'\n{len(results)-len(bad)}/{len(results)} passaram')
    if errors: print('ERROS JS:', errors[:3])
    raise SystemExit(1 if bad else 0)
asyncio.run(main())
