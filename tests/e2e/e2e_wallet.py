"""Carteira de economia: pegar cupom -> código -> comerciante confirma -> economia entra na carteira.

Cobre o que antes estava quebrado: o comerciante validava? o código era conferido? a economia
só entrava quando o estabelecimento confirmava? Não testa as regras do Firestore (o mock não as aplica).
"""
import asyncio, json, os, re
from playwright.async_api import async_playwright
from e2e import login, logout, mock_docs, BASE

results, errors = [], []
def ok(name, cond, detail=''):
    results.append((name, bool(cond)))
    print(('PASS ' if cond else 'FAIL ') + name + (f' — {detail}' if detail and not cond else ''))

SHOTS = os.path.join(os.path.dirname(__file__), 'shots-wallet')
os.makedirs(SHOTS, exist_ok=True)
async def shot(page, name): await page.screenshot(path=f'{SHOTS}/{name}.png')

async def patch_store(page, js_body):
    """Altera o banco simulado (sessionStorage) para montar cenários."""
    await page.evaluate("(b) => { const s = JSON.parse(sessionStorage.getItem('__mock_fs__')); (new Function('s', b))(s); sessionStorage.setItem('__mock_fs__', JSON.stringify(s)); }", js_body)

async def wallet_text(page):
    await page.goto(BASE + '/user-dashboard'); await page.wait_for_timeout(1300)
    return await page.locator('[data-testid=wallet-full]').inner_text()

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(**p.devices['iPhone 13'], locale='pt-BR')
        page = await ctx.new_page()
        page.on('pageerror', lambda e: errors.append(f'PAGEERROR: {e}'))
        page.on('console', lambda m: errors.append(f'CONSOLE: {m.text}') if m.type == 'error' and 'favicon' not in m.text else None)
        await page.goto(BASE + '/')
        await page.evaluate("sessionStorage.clear(); localStorage.clear()")

        # ---- 1. cliente vê quanto economiza ANTES de pegar ----
        await login(page, 'bruno@teste.com')
        await page.goto(BASE + '/'); await page.wait_for_timeout(1500)
        ok('Home: carteira compacta começa em R$ 0,00', 'R$\xa00,00' in await page.locator('[data-testid=wallet-saved]').inner_text() or 'R$ 0,00' in await page.locator('[data-testid=wallet-saved]').inner_text())
        card = page.locator('[data-testid=coupon-saving]').first
        ok('cartão do cupom mostra "Você economiza R$ 10,00"', await card.count() == 1 and '10,00' in await card.inner_text())
        await page.goto(f'{BASE}/business/ana'); await page.wait_for_timeout(1300)
        await page.locator('text=10% no passeio').first.click(); await page.wait_for_timeout(400)
        ok('modal do cupom destaca a economia antes de pegar', '10,00' in await page.locator('[data-testid=modal-saving]').inner_text())
        await shot(page, '10-modal-antes')

        # ---- 2. pegar o cupom: um passo, reserva e mostra o código; NÃO credita ----
        await page.locator('[data-testid=get-coupon]').click(); await page.wait_for_timeout(1300)
        body = await page.inner_text('body')
        ok('um clique só: mostra "Cupom reservado" e o código de 6 dígitos', 'Cupom reservado' in body and await page.locator('text=/^\\d{6}$/').count() > 0)
        ok('não existe mais o botão "Validar & Economizar"', 'VALIDAR & ECONOMIZAR' not in body)
        red = await mock_docs(page, 'redemptions/')
        ok('resgate PENDING com valor, validade e nome da empresa',
           len(red) == 1 and red[0]['status'] == 'PENDING' and red[0]['amountSaved'] == 10 and red[0]['expiryDate'] == '2027-12-31' and red[0]['companyName'] == 'Barco Azul Passeios')
        code = red[0]['verificationCode']
        ok('código de 6 dígitos gravado', re.fullmatch(r'\d{6}', code))
        usr = (await mock_docs(page, 'users/bruno'))[0]
        ok('usuário NÃO recebeu crédito no próprio documento', not usr.get('history') and not usr.get('savedAmount'))
        await shot(page, '20-codigo')
        await page.keyboard.press('Escape')

        w = await wallet_text(page)
        ok('perfil: economizado continua R$ 0,00', re.search(r'R\$\s?0,00', w) is not None, w[:120])
        ok('perfil: mostra R$ 10,00 em 1 cupom para usar', 'R$\xa010,00' in w.replace(' ', '\xa0') or 'R$ 10,00' in w, w[:200])
        ok('perfil lista o cupom como "Aguardando uso"', 'Aguardando uso' in await page.inner_text('body'))
        await shot(page, '30-perfil-reservado')

        # limite por pessoa
        await page.goto(f'{BASE}/business/ana'); await page.wait_for_timeout(1300)
        await page.locator('text=10% no passeio').first.click(); await page.wait_for_timeout(700)
        ok('segundo resgate do mesmo cupom é barrado (limite 1 por pessoa)', await page.get_by_text('Você já atingiu o limite').count() == 1)
        ok('...e o botão de pegar some', await page.locator('[data-testid=get-coupon]').count() == 0)
        await page.keyboard.press('Escape')

        # ---- 3. comerciante: código errado não valida ----
        await logout(page); await login(page, 'ana@teste.com')
        await page.goto(BASE + '/admin-dashboard'); await page.wait_for_timeout(1500)
        await page.locator('button', has_text='RESGATES').first.click(); await page.wait_for_timeout(900)
        txt = (await page.inner_text('body')).lower()
        ok('painel do comerciante lista o resgate pendente com o desconto', 'pendente' in txt and '10,00' in txt)
        imp = await page.locator('[data-testid=merchant-impact]').inner_text()
        ok('resumo: R$ 0,00 entregues, 1 aguardando uso', 'R$\xa00,00' in imp.replace(' ', '\xa0') and '1' in await page.locator('[data-testid=impact-pending]').inner_text())
        inp = page.locator('input[placeholder="6 dígitos"]').first
        wrong = '000000' if code != '000000' else '111111'
        await inp.fill(wrong); await page.get_by_role('button', name='Validar').first.click(); await page.wait_for_timeout(900)
        ok('código ERRADO não valida (mensagem clara)', await page.get_by_text('Código incorreto').count() >= 1)
        ok('...e o resgate segue PENDING', (await mock_docs(page, 'redemptions/'))[0]['status'] == 'PENDING')
        await inp.fill('123'); await page.get_by_role('button', name='Validar').first.click(); await page.wait_for_timeout(500)
        ok('código incompleto pede os 6 dígitos', (await mock_docs(page, 'redemptions/'))[0]['status'] == 'PENDING')

        # ---- 4. comerciante: código certo valida (era o bug: dono comum nunca conseguia) ----
        await page.locator('input[placeholder="6 dígitos"]').first.fill(code)
        await page.get_by_role('button', name='Validar').first.click(); await page.wait_for_timeout(1300)
        r = (await mock_docs(page, 'redemptions/'))[0]
        ok('código CERTO: comerciante (não-admin) valida e vira USED com data', r['status'] == 'USED' and bool(r.get('validatedAt')))
        ok('painel: "Utilizado" e sem campo de código', await page.locator('input[placeholder="6 dígitos"]').count() == 0 and 'utilizado' in (await page.inner_text('body')).lower())
        imp = await page.locator('[data-testid=merchant-impact]').inner_text()
        ok('resumo: R$ 10,00 entregues a 1 cliente', '10,00' in imp and (await page.locator('[data-testid=impact-customers]').inner_text()).strip() == '1', imp[:160])
        await shot(page, '40-comerciante-resumo')

        # ---- 5. a economia entra na carteira do cliente ----
        await logout(page); await login(page, 'bruno@teste.com')
        w = await wallet_text(page)
        ok('perfil: economizado = R$ 10,00 depois da confirmação', 'R$ 10,00' in w.replace('\xa0', ' ') and 'Economizado em 1 cupom' in w, w[:200])
        ok('perfil: já não aparece "cupom para usar"', await page.locator('[data-testid=wallet-reserved]').count() == 0)
        ok('perfil lista o cupom como "Usado"', 'Usado' in await page.inner_text('body'))
        await shot(page, '50-perfil-economizado')
        await page.goto(BASE + '/'); await page.wait_for_timeout(1500)
        ok('Home: carteira compacta mostra R$ 10,00', '10,00' in await page.locator('[data-testid=wallet-saved]').inner_text())
        await shot(page, '51-home-carteira')

        # ---- 6. cupom que venceu sem uso não conta e não valida ----
        await patch_store(page, "s.docs['redemptions/exp1'] = { id:'exp1', userId:'bruno', userName:'Bruno', couponId:'c1', companyId:'ana', companyName:'Barco Azul Passeios', couponTitle:'10% no passeio', amountSaved: 50, redeemedAt:'2026-01-05T12:00:00.000Z', expiryDate:'2026-02-01', status:'PENDING', verificationCode:'424242' };")
        w = await wallet_text(page)
        ok('vencido sem uso: não entra em "economizado" nem em "para usar"', 'R$ 10,00' in w.replace('\xa0', ' ') and await page.locator('[data-testid=wallet-reserved]').count() == 0)
        ok('...e aparece como "Expirou"', 'Expirou' in await page.inner_text('body'))
        await logout(page); await login(page, 'ana@teste.com')
        await page.goto(BASE + '/admin-dashboard'); await page.wait_for_timeout(1300)
        await page.locator('button', has_text='RESGATES').first.click(); await page.wait_for_timeout(900)
        await page.locator('input[placeholder="6 dígitos"]').first.fill('424242')
        await page.get_by_role('button', name='Validar').first.click(); await page.wait_for_timeout(900)
        ok('comerciante não valida cupom vencido', await page.get_by_text('já expirou').count() >= 1 and (await mock_docs(page, 'redemptions/exp1'))[0]['status'] == 'PENDING')

        # ---- 7. validar de novo o mesmo resgate ----
        await patch_store(page, "s.docs['redemptions/exp1'].status = 'USED'; s.docs['redemptions/exp1'].expiryDate = '2027-01-01';")
        await page.goto(BASE + '/admin-dashboard'); await page.wait_for_timeout(1000)
        await page.locator('button', has_text='RESGATES').first.click(); await page.wait_for_timeout(900)
        ok('resgate já utilizado não tem mais campo de código', await page.locator('input[placeholder="6 dígitos"]').count() == 0)

        # ---- 8. preço inválido no cupom não gera "economia" ----
        await page.goto(BASE + '/admin-dashboard'); await page.wait_for_timeout(1000)
        await page.locator('button', has_text='NOVO CUPOM').first.click(); await page.wait_for_timeout(600)
        prices = page.locator('input[placeholder="0.00"]')
        await prices.nth(0).fill('50'); await prices.nth(1).fill('80')
        await page.get_by_placeholder('Título da Oferta (Ex: 50% de Desconto no Rodízio)').fill('Cupom inválido')
        await page.get_by_placeholder('Descreva o que está incluído nesta oferta...').fill('Oferta de teste')
        await page.locator('form button[type=submit]').last.click()
        await page.wait_for_timeout(700)
        coupons = await mock_docs(page, 'coupons/')
        ok('preço com desconto maior que o normal não cria cupom', not any(c.get('title') == 'Cupom inválido' for c in coupons))
        ok('...e explica que a diferença é a economia do cliente', await page.get_by_text('precisa ser menor que o preço normal').count() >= 1)

        # ---- 9. limite de cupons do plano (antes só aparecia na tela de planos) ----
        await patch_store(page, "s.docs['users/ana'].plan = 'basic'; s.docs['users/ana'].maxCoupons = 1;")
        await page.goto(BASE + '/admin-dashboard'); await page.wait_for_timeout(1200)
        await page.locator('button', has_text='NOVO CUPOM').first.click(); await page.wait_for_timeout(600)
        async def fill_valid(title):
            prices = page.locator('input[placeholder="0.00"]')
            await prices.nth(0).fill('100'); await prices.nth(1).fill('70')
            await page.get_by_placeholder('Título da Oferta (Ex: 50% de Desconto no Rodízio)').fill(title)
            await page.get_by_placeholder('Descreva o que está incluído nesta oferta...').fill('Oferta de teste')
            await page.get_by_role('button', name='Link', exact=True).click()
            await page.get_by_placeholder('Cole os links das imagens (um por linha)...').fill('https://example.com/a.jpg')
            await page.locator('form button[type=submit]').last.click(); await page.wait_for_timeout(1000)
        await fill_valid('Segundo cupom')
        coupons = await mock_docs(page, 'coupons/')
        ok('cota do comerciante (1) cheia: novo cupom é barrado', not any(c.get('title') == 'Segundo cupom' for c in coupons))
        ok('...com explicação do plano', await page.get_by_text('Seu plano permite 1 cupom').count() >= 1)
        await patch_store(page, "s.docs['users/ana'].maxCoupons = 2;")
        await page.goto(BASE + '/admin-dashboard'); await page.wait_for_timeout(1200)
        await page.locator('button', has_text='NOVO CUPOM').first.click(); await page.wait_for_timeout(600)
        await fill_valid('Segundo cupom')
        created = [c for c in await mock_docs(page, 'coupons/') if c.get('title') == 'Segundo cupom']
        ok('com cota liberada pelo admin, o cupom é criado como pendente', len(created) == 1 and created[0]['status'] == 'pending' and created[0]['currentRedemptions'] == 0)

        # ---- 10. editar cupom aprovado: oferta mudou -> volta para aprovação ----
        await patch_store(page, "s.docs['coupons/c1'].status = 'approved'; s.docs['users/ana'].maxCoupons = 9;")
        await page.goto(BASE + '/admin-dashboard'); await page.wait_for_timeout(1200)
        await page.locator('button', has_text='MEUS CUPONS').first.click(); await page.wait_for_timeout(800)
        await page.locator('button', has_text='EDITAR').first.click(); await page.wait_for_timeout(600)
        title = page.get_by_placeholder('Título da Oferta (Ex: 50% de Desconto no Rodízio)')
        await title.fill('Passeio com 90% de desconto (golpe)')
        await page.get_by_role('button', name='Link', exact=True).click()
        await page.get_by_placeholder('Cole os links das imagens (um por linha)...').fill('https://example.com/a.jpg')
        await page.locator('form button[type=submit]').last.click(); await page.wait_for_timeout(1000)
        c1 = [c for c in await mock_docs(page, 'coupons/') if c['path'] == 'coupons/c1'][0]
        ok('cupom aprovado editado volta para pendente', c1['status'] == 'pending' and c1['title'].startswith('Passeio com 90%'), str(c1.get('status')))
        ok('comerciante é avisado que o cupom sai do ar até nova aprovação', await page.get_by_text('sai do ar até o administrador aprovar').count() >= 1)
        
        # ---- 11. tela de pagamento do admin mostra o estado real, sem botão que não faz nada ----
        await logout(page); await login(page, 'admin@teste.com')
        await page.goto(BASE + '/admin-dashboard'); await page.wait_for_timeout(1300)
        await page.locator('button', has_text=re.compile('PAGAMENTO', re.I)).first.click(); await page.wait_for_timeout(900)
        ok('pagamento: mostra estado da cobrança (vindo do servidor)', await page.locator('[data-testid=payment-status]').count() == 1)
        ok('pagamento: não há mais botão "salvar" nem liga/desliga fantasma', await page.get_by_text('SALVAR CONFIGURAÇÕES').count() == 0)

        fails = [r for r in results if not r[1]]
        print(f'\n{len(results) - len(fails)}/{len(results)} verificações OK')
        real = [e for e in errors if 'Failed to load resource' not in e]
        print('erros de página:', real[:5] if real else 'nenhum')
        await b.close()
        raise SystemExit(1 if fails or real else 0)

asyncio.run(main())
