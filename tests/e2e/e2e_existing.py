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

        # Avaliação: só depois de comprovar a visita (cupom usado ou check-in). O envio vai ao servidor
        # (/api/email?action=review-submit), que o mock não atende; aqui conferimos a porta de entrada.
        ok('avaliação exige prova: aparece o check-in e não o formulário',
           await page.locator('[data-testid=review-checkin]').count() > 0
           and await page.locator('textarea[placeholder="Conte como foi sua experiência..."]').count() == 0)
        # Simula a avaliação que o servidor grava (pendente, com prova de check-in) para testar a moderação.
        await page.evaluate("""() => { const s = JSON.parse(sessionStorage.getItem('__mock_fs__'));
          s.docs['reviews/bruno_ana'] = { id: 'bruno_ana', businessId: 'ana', businessName: 'Ana', userId: 'bruno', userName: 'Bruno',
            rating: 5, comment: 'Passeio excelente, equipe atenciosa.', date: new Date().toISOString(), status: 'pending', proof: 'checkin' };
          sessionStorage.setItem('__mock_fs__', JSON.stringify(s)); }""")

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
        ok('aprovação atualiza avaliação e o resumo de notas da empresa', rv[0]['status'] == 'approved' and biz[0].get('reviewCount') == 1 and biz[0].get('ratingStats', {}).get('count') == 1)
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
        ok('cadastro exige marcar o local no mapa', await page.locator('[data-testid=location-picker]').count() > 0 and await page.locator('text=Av. Teste, 100').count() >= 0)
        await ctx.grant_permissions(['geolocation'])
        await ctx.set_geolocation({'latitude': -22.8794, 'longitude': -42.0188, 'accuracy': 15})
        await page.locator('[data-testid=location-gps]').click()
        await page.wait_for_timeout(1200)
        await page.locator('button[type=submit]', has_text='Continuar').click()
        await page.wait_for_timeout(500)
        ok('cadastro mostra participação gratuita (sem plano fictício)', await page.locator('text=Gratuita').count() > 0)
        await page.locator('button[type=submit]', has_text='Continuar').click()
        await page.wait_for_timeout(500)
        await page.fill('input[placeholder="(21) 99999-9999"]', '(22) 99977-6655')
        await page.locator('button[type=submit]', has_text='Finalizar Cadastro').click()
        await page.wait_for_timeout(1500)
        biz = await mock_docs(page, 'businesses/carla')
        ok('empresa criada pendente, sem plano pago, dono = usuária', biz and biz[0]['status'] == 'PENDING' and biz[0].get('ownerId') == 'carla' and 'subscriptionEndsAt' not in biz[0] and biz[0].get('plan') in (None, 'free'), str(biz)[:300])
        u = await mock_docs(page, 'users/carla')
        ok('empresa nasce com o local marcado pelo GPS e sem nota', biz and abs(biz[0].get('lat', 0) - (-22.8794)) < 0.001 and biz[0].get('locationSource') == 'gps' and biz[0].get('rating') == 0)
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
