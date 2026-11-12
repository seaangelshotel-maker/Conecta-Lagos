"""Pedidos por WhatsApp: planos, carrinho, checkout (cardápio e serviços), esgotado, editor do empresário."""
import asyncio, json, urllib.parse
from playwright.async_api import async_playwright
from e2e import login, mock_docs, BASE

results, errors = [], []
def ok(name, cond, detail=''):
    results.append((name, bool(cond)))
    print(('PASS ' if cond else 'FAIL ') + name + (f' — {detail}' if detail and not cond else ''))

SETUP = """(cfg) => { const s = JSON.parse(sessionStorage.getItem('__mock_fs__'));
  s.docs['pricingPlans/pro'] = { id:'pro', name:'Pro', price:99.9, period:'semiannual', maxCoupons:10, maxBusinesses:1, isFeatured:false, showGallery:true, showMenu:true, showSocialMedia:true, showReviews:true, active:true };
  s.docs['pricingPlans/menuonly'] = { id:'menuonly', name:'SoCardapio', price:0, period:'semiannual', maxCoupons:3, maxBusinesses:1, isFeatured:false, showGallery:false, showMenu:true, showSocialMedia:true, showReviews:false, active:true };
  Object.assign(s.docs['businesses/ana'], cfg);
  sessionStorage.setItem('__mock_fs__', JSON.stringify(s)); }"""
MENU = [{'title': 'Pratos', 'items': [
    {'id': 'a', 'name': 'Moqueca', 'price': 80, 'description': 'Serve 2'},
    {'id': 'b', 'name': 'Suco', 'price': 12.5},
    {'id': 'c', 'name': 'Sobremesa', 'price': 20, 'available': False}]}]

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

        await page.goto(BASE + '/'); await page.wait_for_timeout(1200)
        # 1. Plano básico (sem pedidos): vê o cardápio, mas não pode pedir
        await page.evaluate(SETUP, {'plan': 'menuonly', 'menu': MENU, 'ordersEnabled': True, 'orderMode': 'menu'})
        await page.goto(BASE + '/business/ana'); await page.wait_for_timeout(1500)
        ok('plano sem pedidos: botão continua "Cardápio"', await page.locator('text=Cardápio').count() > 0 and await page.locator('text=Pedir').count() == 0)

        # 2. Plano Pro com pedidos ligados
        await page.evaluate(SETUP, {'plan': 'pro', 'menu': MENU, 'ordersEnabled': True, 'orderMode': 'menu', 'orderWhatsapp': '(22) 98888-7777'})
        await page.goto(BASE + '/business/ana'); await page.wait_for_timeout(1500)
        await page.locator('button', has_text='Pedir').first.click(); await page.wait_for_timeout(500)
        ok('overlay abre com 3 itens', await page.locator('[data-testid=menu-item]').count() == 3)
        ok('item esgotado sinalizado e sem botão de pedir', await page.locator('text=Esgotado').count() == 1 and await page.locator('[data-testid=item-add]').count() == 2)
        await page.locator('[data-testid=item-add]').nth(0).click(); await page.locator('[data-testid=item-add]').nth(0).click(); await page.locator('[data-testid=item-add]').nth(1).click()
        ok('quantidade do item sobe', await page.locator('[data-testid=item-qty]').first.inner_text() == '2')
        ok('barra do carrinho com total', await page.locator('[data-testid=open-checkout]', has_text='3 itens').count() == 1 and await page.locator('text=R$ 172,50').count() > 0)
        await page.locator('[data-testid=open-checkout]').click(); await page.wait_for_timeout(300)
        await page.locator('[data-testid=send-order]').click(); await page.wait_for_timeout(300)
        ok('validação: exige nome', len(opened) == 0)
        await page.fill('[data-testid=cust-name]', 'Bruno')
        await page.locator('[data-testid=recv-delivery]').click()
        await page.locator('[data-testid=send-order]').click(); await page.wait_for_timeout(300)
        ok('validação: exige endereço na entrega', len(opened) == 0)
        await page.fill('[data-testid=cust-address]', 'Rua das Flores, 10')
        await page.locator('[data-testid=send-order]').click(); await page.wait_for_timeout(800)
        ok('abre o WhatsApp do número dos pedidos', len(opened) == 1 and '/5522988887777' in opened[0], str(opened))
        msg = urllib.parse.unquote(opened[0].split('text=')[1]) if opened else ''
        ok('mensagem com itens, total e entrega', '2x Moqueca — R$ 160,00' in msg and '1x Suco' in msg and 'Total estimado: R$ 172,50' in msg and 'Entrega em: Rua das Flores, 10' in msg and 'Bruno' in msg, msg)
        ok('pedido enviado é contabilizado', any(i.get('type') == 'order_sent' and i.get('entityId') == 'ana' for i in await mock_docs(page, 'interactions/')))
        ok('carrinho esvazia depois do envio', await page.locator('[data-testid=open-checkout]').count() == 0)

        # 3. Serviços
        await page.evaluate(SETUP, {'orderMode': 'services'})
        await page.goto(BASE + '/business/ana'); await page.wait_for_timeout(1500)
        await page.locator('button', has_text='Solicitar').first.click(); await page.wait_for_timeout(400)
        await page.locator('[data-testid=item-add]').nth(0).click()
        await page.locator('[data-testid=open-checkout]').click(); await page.wait_for_timeout(300)
        await page.fill('[data-testid=cust-name]', 'Carla')
        await page.locator('[data-testid=send-order]').click(); await page.wait_for_timeout(300)
        ok('serviços: exige data', len(opened) == 1)
        await page.fill('[data-testid=cust-date]', 'sábado de manhã'); await page.fill('[data-testid=cust-people]', '4')
        await page.locator('[data-testid=send-order]').click(); await page.wait_for_timeout(800)
        msg2 = urllib.parse.unquote(opened[1].split('text=')[1]) if len(opened) > 1 else ''
        ok('serviços: mensagem com data e pessoas', 'solicitar' in msg2 and 'Data/período: sábado de manhã' in msg2 and 'Pessoas: 4' in msg2, msg2)

        # 4. Pedidos desligados pelo empresário → só mostra
        await page.evaluate(SETUP, {'ordersEnabled': False, 'orderMode': 'menu'})
        await page.goto(BASE + '/business/ana'); await page.wait_for_timeout(1500)
        await page.locator('button', has_text='Cardápio').first.click(); await page.wait_for_timeout(400)
        ok('pedidos desligados: sem botão de adicionar', await page.locator('[data-testid=menu-item]').count() == 3 and await page.locator('[data-testid=item-add]').count() == 0)

        # 5. Editor do empresário (plano Pro): configura e salva
        await page.evaluate(SETUP, {'ordersEnabled': False, 'orderMode': 'menu', 'orderWhatsapp': ''})
        await login(page, 'ana@teste.com')
        await page.goto(BASE + '/admin-dashboard'); await page.wait_for_timeout(1500)
        await page.evaluate("() => { const b=[...document.querySelectorAll('button')].find(x=>/card[áa]pio/i.test(x.innerText)); if(b) b.click(); }")
        await page.wait_for_timeout(800)
        ok('editor mostra configurações de pedidos', await page.locator('[data-testid=orders-settings]').count() == 1)
        ok('plano Pro pode ligar pedidos (sem cadeado)', await page.locator('[data-testid=orders-enabled]').count() == 1 and await page.locator('[data-testid=orders-locked]').count() == 0)
        await page.select_option('[data-testid=order-mode]', 'services')
        await page.fill('[data-testid=order-whatsapp]', '22977776666')
        await page.locator('[data-testid=orders-enabled]').check()
        await page.locator('button', has_text='SALVAR CARDÁPIO').click(); await page.wait_for_timeout(1200)
        biz = (await mock_docs(page, 'businesses/ana'))[0]
        ok('configuração salva no negócio', biz.get('orderMode') == 'services' and biz.get('ordersEnabled') is True and biz.get('orderWhatsapp') == '22977776666', json.dumps(biz)[:300])
        # plano básico: cadeado
        await page.evaluate(SETUP, {'plan': 'menuonly'})
        await page.goto(BASE + '/admin-dashboard'); await page.wait_for_timeout(1500)
        await page.evaluate("() => { const b=[...document.querySelectorAll('button')].find(x=>/card[áa]pio|servi[çc]os/i.test(x.innerText)); if(b) b.click(); }")
        await page.wait_for_timeout(800)
        ok('plano básico vê o cadeado e não o interruptor', await page.locator('[data-testid=orders-locked]').count() == 1 and await page.locator('[data-testid=orders-enabled]').count() == 0)
        await b.close()
    bad = [n for n, c in results if not c]
    print(f'\n{len(results)-len(bad)}/{len(results)} passaram'); 
    if errors: print('ERROS JS:', errors[:3])
    raise SystemExit(1 if bad else 0)
asyncio.run(main())
