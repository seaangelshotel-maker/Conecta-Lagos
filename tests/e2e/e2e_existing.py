"""Fluxos existentes que foram alterados: cupom, avaliação, favorito, cadastro de empresa."""
import asyncio, sys, re
from playwright.async_api import async_playwright
from e2e import BASE, login, logout, mock_docs, ok, results, errors

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(**p.devices['iPhone 13'], locale='pt-BR')
        page = await ctx.new_page()
        page.on('pageerror', lambda e: errors.append(f'PAGEERROR: {e}'))
        page.on('console', lambda m: errors.append(f'console.{m.type}: {m.text}') if m.type == 'error' else None)
        await page.goto(BASE + '/')
        await page.evaluate("sessionStorage.clear(); localStorage.clear()")

        # Resgate de cupom
        await login(page, 'bruno@teste.com')
        await page.goto(f'{BASE}/business/ana')
        await page.wait_for_timeout(1200)
        await page.locator('text=10% no passeio').first.click()
        await page.locator('button', has_text='PEGAR CUPOM').click()
        await page.wait_for_timeout(1200)
        ok('cupom resgatado mostra código de 6 dígitos', await page.locator('text=/^\\d{6}$/').count() > 0)
        red = await mock_docs(page, 'redemptions/')
        ok('resgate gravado PENDING, sem e-mail do cliente', len(red) == 1 and red[0]['status'] == 'PENDING' and 'userEmail' not in red[0])
        cpn = await mock_docs(page, 'coupons/c1')
        ok('contador do cupom +1', cpn and cpn[0]['currentRedemptions'] == 1)
        u = await mock_docs(page, 'users/bruno')
        ok('resgate guarda o código de 6 dígitos e o valor da economia', re.fullmatch(r'\d{6}', red[0].get('verificationCode', '')) and red[0]['amountSaved'] == 10)
        ok('pegar o cupom NÃO credita a carteira (só o comerciante confirma)', u and not u[0].get('history') and not u[0].get('savedAmount'))
        inter = await mock_docs(page, 'interactions/')
        ok('resgate vira evento coupon_redeem do dono', any(i['type'] == 'coupon_redeem' and i.get('ownerId') == 'ana' for i in inter))
        await page.keyboard.press('Escape')
        await page.goto(f'{BASE}/business/ana')
        await page.wait_for_timeout(1200)

        # Favorito
        await page.locator('button:has([data-icon=Heart])').first.click()
        await page.wait_for_timeout(700)
        u = await mock_docs(page, 'users/bruno')
        ok('favoritar empresa salva no perfil', 'ana' in u[0]['favorites']['businesses'])

        # Avaliação
        await page.fill('textarea[placeholder="Conte como foi sua experiência..."]', 'Passeio excelente, equipe atenciosa.')
        await page.locator('button', has_text='Enviar Avaliação').click()
        await page.wait_for_timeout(800)
        rv = await mock_docs(page, 'reviews/')
        ok('avaliação criada pendente com userId', len(rv) == 1 and rv[0]['status'] == 'pending' and rv[0]['userId'] == 'bruno' and rv[0]['rating'] == 5)

        # Admin aprova → aparece na página
        await logout(page)
        await login(page, 'admin@teste.com')
        await page.goto(f'{BASE}/admin-dashboard')
        await page.wait_for_timeout(1500)
        await page.locator('button', has_text='AVALIAÇÕES').click()
        await page.wait_for_timeout(800)
        await page.get_by_role('button', name='APROVAR', exact=True).first.click()
        await page.wait_for_timeout(1000)
        rv = await mock_docs(page, 'reviews/')
        biz = await mock_docs(page, 'businesses/ana')
        ok('aprovação atualiza avaliação e nota da empresa', rv[0]['status'] == 'approved' and biz[0].get('reviewCount') == 1)
        await page.goto(f'{BASE}/business/ana')
        await page.wait_for_timeout(1200)
        ok('avaliação aprovada aparece na página da empresa', await page.locator('text=Passeio excelente, equipe atenciosa.').count() > 0)

        # Cadastro de empresa por usuário com permissão
        await logout(page)
        await login(page, 'carla@teste.com')
        await page.goto(f'{BASE}/create-business')
        await page.wait_for_timeout(1200)
        await page.fill('input[placeholder="Ex: Restaurante do Yuri"]', 'Quiosque da Carla')
        await page.locator('button[type=submit]', has_text='Continuar').click()
        await page.wait_for_timeout(500)
        await page.locator('select').filter(has_text='Selecione a Cidade').select_option('cabo-frio')
        await page.locator('select').filter(has_text='Selecione o Bairro').select_option('centro-cf')
        await page.fill('input[placeholder="Rua, Número, Complemento"]', 'Av. Teste, 100')
        await page.locator('button[type=submit]', has_text='Continuar').click()
        await page.wait_for_timeout(500)
        ok('cadastro mostra participação gratuita (sem plano fictício)', await page.locator('text=Gratuita').count() > 0)
        await page.locator('button[type=submit]', has_text='Continuar').click()
        await page.wait_for_timeout(500)
        await page.locator('button[type=submit]', has_text='Finalizar Cadastro').click()
        await page.wait_for_timeout(1500)
        biz = await mock_docs(page, 'businesses/carla')
        ok('empresa criada pendente, sem plano pago, dono = usuária', biz and biz[0]['status'] == 'PENDING' and biz[0].get('ownerId') == 'carla' and 'subscriptionEndsAt' not in biz[0] and biz[0].get('plan') in (None, 'free'), str(biz)[:300])
        u = await mock_docs(page, 'users/carla')
        ok('usuária passa a COMPANY após cadastrar a empresa', u and u[0]['role'] == 'COMPANY')
        await page.wait_for_timeout(3200)
        ok('redireciona ao painel da empresa', '/admin-dashboard' in page.url, page.url)
        await page.screenshot(path='shots/11-new-company.png')
        await b.close()

    passed = sum(1 for r in results if r[1])
    print(f'\n{passed}/{len(results)} verificações passaram; erros de página/console: {len(errors)}')
    for e in errors[:15]: print('  ', e[:300])
    sys.exit(0 if passed == len(results) else 1)

asyncio.run(main())
