"""Reivindicar empresa: liberar por categoria, pedido com dados, sem duplicar, aprovação segura (nunca tira de quem já é dono)."""
import asyncio
from playwright.async_api import async_playwright
from e2e import login, logout, mock_docs, BASE

results, errors = [], []
def ok(name, cond, detail=''):
    results.append((name, bool(cond)))
    print(('PASS ' if cond else 'FAIL ') + name + (f' — {detail}' if detail and not cond else ''))

async def patch_store(page, js_body):
    await page.evaluate("(b) => { const s = JSON.parse(sessionStorage.getItem('__mock_fs__')); (new Function('s', b))(s); sessionStorage.setItem('__mock_fs__', JSON.stringify(s)); }", js_body)

async def doc(page, path):
    return next((d for d in await mock_docs(page, path) if d['path'] == path), None)

BIZ = """
const mk = (id, name, category, extra) => Object.assign({ id, name, category, description: 'd', address: 'Rua 1', phone: '22988887777', coverImage: '', gallery: [], amenities: [], openingHours: {}, rating: 0, reviews: [], status: 'approved', active: true, isBlocked: false, canBeClaimed: false, isClaimed: false, isFeatured: false, plan: 'pro' }, extra || {});
s.docs['businesses/rest1'] = mk('rest1', 'Restaurante do Mar', 'Restaurante');
s.docs['businesses/rest2'] = mk('rest2', 'Cantina Bela', 'Restaurante');
s.docs['businesses/hosp1'] = mk('hosp1', 'Pousada Sol', 'Hospedagem');
s.docs['businesses/pub1'] = mk('pub1', 'Praia do Forno', 'Restaurante', { importBatch: 'lugares-publicos-2026-11' });
s.docs['businesses/owned1'] = mk('owned1', 'Bar do Zé', 'Restaurante', { isClaimed: true, ownerId: 'ana' });
"""

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(**p.devices['iPhone 13'])
        page = await ctx.new_page()
        page.on('pageerror', lambda e: errors.append(f'PAGEERROR: {e}'))
        await page.goto(BASE + '/'); await page.evaluate("sessionStorage.clear(); localStorage.clear()")
        await login(page, 'admin@teste.com')
        await page.goto(BASE + '/'); await page.wait_for_timeout(800)
        await patch_store(page, BIZ)

        # ---- 1. liberar por categoria ----
        await page.goto(BASE + '/admin-dashboard'); await page.wait_for_timeout(1300)
        await page.get_by_text('Solicitações').first.click(); await page.wait_for_timeout(900)
        ok('painel de liberação aparece', await page.locator('[data-testid=claim-release]').count() == 1)
        ok('lugar público e empresa com dono não entram na contagem de Restaurante (2)', await page.locator('[data-testid="claim-cat-Restaurante"]').inner_text() == 'Restaurante (2)', await page.locator('[data-testid=claim-release]').inner_text())
        await page.locator('[data-testid="claim-cat-Restaurante"]').click()
        await page.locator('[data-testid=claim-release-run]').click(); await page.wait_for_timeout(900)
        ok('restaurantes liberados', (await doc(page, 'businesses/rest1'))['canBeClaimed'] is True and (await doc(page, 'businesses/rest2'))['canBeClaimed'] is True)
        ok('hospedagem não foi tocada (não escolhida)', (await doc(page, 'businesses/hosp1'))['canBeClaimed'] is False)
        ok('lugar público continua fechado', (await doc(page, 'businesses/pub1'))['canBeClaimed'] is False)
        ok('empresa que já tem dono continua intocada', (await doc(page, 'businesses/owned1'))['canBeClaimed'] is False)

        # ---- 2. pedido do Bruno ----
        await logout(page); await login(page, 'bruno@teste.com')
        await page.goto(BASE + '/business/hosp1'); await page.wait_for_timeout(1200)
        ok('empresa fechada não mostra "Esta é sua empresa?"', await page.locator('[data-testid=claim-box]').count() == 0)
        await page.goto(BASE + '/business/owned1'); await page.wait_for_timeout(1200)
        ok('empresa com dono não mostra reivindicação', await page.locator('[data-testid=claim-box]').count() == 0)
        await page.goto(BASE + '/business/rest1'); await page.wait_for_timeout(1300)
        ok('empresa liberada mostra a caixa', await page.locator('[data-testid=claim-box]').count() == 1)
        await page.locator('[data-testid=claim-open]').click(); await page.wait_for_timeout(300)
        await page.locator('[data-testid=claim-whatsapp]').fill('')
        await page.locator('[data-testid=claim-send]').click(); await page.wait_for_timeout(500)
        ok('sem WhatsApp e sem declaração o pedido é barrado, com explicação', len(await mock_docs(page, 'companyRequests/')) == 0 and await page.get_by_text('WhatsApp com DDD').count() >= 1 and await page.get_by_text('Confirme que você representa').count() >= 1)
        await page.locator('[data-testid=claim-name]').fill('Bruno Silva')
        await page.locator('[data-testid=claim-whatsapp]').fill('(22) 99999-0000')
        await page.locator('[data-testid=claim-role]').select_option('Gerente')
        await page.locator('[data-testid=claim-confirm]').check()
        await page.locator('[data-testid=claim-send]').click(); await page.wait_for_timeout(900)
        reqs = await mock_docs(page, 'companyRequests/')
        r = reqs[0] if reqs else {}
        ok('pedido gravado com WhatsApp, relação e telefone da empresa', len(reqs) == 1 and r.get('whatsapp') == '(22) 99999-0000' and r.get('claimerRole') == 'Gerente' and r.get('companyPhone') == '22988887777' and r.get('status') == 'PENDING' and r.get('companyId') == 'rest1', str(r))
        ok('tela passa a mostrar "em análise"', await page.locator('[data-testid=claim-pending]').count() == 1)
        await page.reload(); await page.wait_for_timeout(1300)
        ok('ao voltar à página continua "em análise" (sem novo pedido)', await page.locator('[data-testid=claim-pending]').count() == 1 and await page.locator('[data-testid=claim-open]').count() == 0)

        # ---- 3. pedido da Carla para a MESMA empresa ----
        await logout(page); await login(page, 'carla@teste.com')
        await page.goto(BASE + '/business/rest1'); await page.wait_for_timeout(1300)
        await page.locator('[data-testid=claim-open]').click()
        await page.locator('[data-testid=claim-name]').fill('Carla Dias')
        await page.locator('[data-testid=claim-whatsapp]').fill('22 98888-1111')
        await page.locator('[data-testid=claim-confirm]').check()
        await page.locator('[data-testid=claim-send]').click(); await page.wait_for_timeout(900)
        ok('segundo pedido (outra pessoa) é aceito para análise', len(await mock_docs(page, 'companyRequests/')) == 2)

        # ---- 4. admin confere e aprova o do Bruno ----
        await logout(page); await login(page, 'admin@teste.com')
        await page.goto(BASE + '/admin-dashboard'); await page.wait_for_timeout(1300)
        await page.get_by_text('Solicitações').first.click(); await page.wait_for_timeout(900)
        ok('cartão mostra WhatsApp de quem pede e link para confirmar com a empresa', await page.locator('[data-testid=claim-call-company]').count() == 2 and 'Gerente' in await page.locator('[data-testid=claim-details]').first.inner_text())
        bruno_card = page.locator('div', has=page.get_by_text('Bruno Silva')).filter(has=page.get_by_role('button', name='APROVAR')).last
        await bruno_card.get_by_role('button', name='APROVAR').click(); await page.wait_for_timeout(500)
        await page.get_by_role('button', name=__import__('re').compile('confirm|aprovar|sim', __import__('re').I)).last.click(); await page.wait_for_timeout(1500)
        biz = await doc(page, 'businesses/rest1')
        ok('empresa passa para o Bruno', biz['ownerId'] == 'bruno' and biz['isClaimed'] is True and biz['canBeClaimed'] is False, str(biz))
        ub = await doc(page, 'users/bruno')
        ok('Bruno vira COMPANY, com o plano da empresa nos limites dele', ub['role'] == 'COMPANY' and ub.get('plan') == 'pro', str(ub))
        reqs = {d['ownerName']: d['status'] for d in await mock_docs(page, 'companyRequests/')}
        ok('pedido da Carla (mesma empresa) foi recusado automaticamente', reqs.get('Bruno Silva') == 'APPROVED' and reqs.get('Carla Dias') == 'REJECTED', str(reqs))

        # ---- 5. segurança: tentar aprovar à força um pedido de empresa que já tem dono ----
        await patch_store(page, "s.docs['companyRequests/forced'] = { id:'forced', userId:'carla', type:'CLAIM', status:'PENDING', companyId:'rest1', companyName:'Restaurante do Mar', ownerName:'Carla Dias', email:'carla@teste.com', phone:'22988881111', requestDate:'2026-11-11T10:00:00.000Z', document:'', category:'Restaurante', description:'x' };")
        await page.goto(BASE + '/admin-dashboard'); await page.wait_for_timeout(1200)
        await page.get_by_text('Solicitações').first.click(); await page.wait_for_timeout(900)
        ok('pedido de empresa que já tem dono é sinalizado', await page.locator('[data-testid=claim-taken]').count() == 1)
        await page.get_by_role('button', name='APROVAR').first.click(); await page.wait_for_timeout(500)
        await page.get_by_role('button', name=__import__('re').compile('confirm|aprovar|sim', __import__('re').I)).last.click(); await page.wait_for_timeout(1200)
        ok('aprovar à força NÃO tira a empresa do dono', (await doc(page, 'businesses/rest1'))['ownerId'] == 'bruno' and (await doc(page, 'companyRequests/forced'))['status'] == 'PENDING')
        ok('admin vê a explicação', await page.get_by_text('já tem dono').count() >= 1)

        real = [e for e in errors if 'Failed to load resource' not in e]
        ok('nenhum erro de JavaScript', not real, '; '.join(real)[:300])
        await b.close()
    bad = [r for r in results if not r[1]]
    print(f'\n{len(results) - len(bad)}/{len(results)} passaram')
    raise SystemExit(1 if bad else 0)

asyncio.run(main())
