"""Notificações push: ativar, temas, desligar, painel do admin e carregamento do mapa sob demanda (Conecta-Lagos)."""
import asyncio
from playwright.async_api import async_playwright
from e2e import login, logout, mock_docs, BASE

results, errors = [], []
def ok(name, cond, detail=''):
    results.append((name, bool(cond)))
    print(('PASS ' if cond else 'FAIL ') + name + (f' — {detail}' if detail and not cond else ''))

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={'width': 420, 'height': 900})
        await ctx.grant_permissions(['notifications'], origin=BASE)
        page = await ctx.new_page()
        page.on('pageerror', lambda e: errors.append(f'PAGEERROR: {e}'))

        await page.goto(BASE + '/'); await page.wait_for_timeout(800)
        ok('mapa (Leaflet) não é carregado na Home', await page.evaluate("!document.querySelector('script[src*=leaflet]') && !window.L"))

        await login(page, 'bruno@teste.com')
        await page.goto(BASE + '/user-dashboard'); await page.wait_for_timeout(1500)
        ok('perfil mostra o cartão de avisos', await page.locator('[data-testid=push-prefs]').count() == 1)
        await page.locator('[data-testid=push-topic-ajuda]').click()
        await page.locator('[data-testid=push-enable]').click(); await page.wait_for_timeout(2500)
        d = await mock_docs(page, 'push_tokens/')
        ok('ativar grava o aparelho com os temas e o usuário', len(d) == 1 and set(d[0]['topics']) == {'cupons', 'materias', 'eventos', 'ajuda'} and d[0]['uid'] == 'bruno' and d[0]['platform'] == 'web', str(d))
        ok('mensagem de confirmação', 'Pronto' in (await page.locator('[data-testid=push-msg]').inner_text()))
        await page.locator('[data-testid=push-topic-eventos]').click()
        await page.locator('[data-testid=push-enable]').click(); await page.wait_for_timeout(1500)
        d = await mock_docs(page, 'push_tokens/')
        ok('salvar temas atualiza o mesmo aparelho', len(d) == 1 and 'eventos' not in d[0]['topics'])
        await page.locator('[data-testid=push-disable]').click(); await page.wait_for_timeout(1000)
        ok('desligar apaga o aparelho', len(await mock_docs(page, 'push_tokens/')) == 0)

        await logout(page); await login(page, 'admin@teste.com')
        await page.goto(BASE + '/admin-dashboard'); await page.wait_for_timeout(1500)
        await page.locator('button', has_text='ECOSSISTEMA').first.click(); await page.wait_for_timeout(1000)
        ok('painel de notificações no admin', await page.locator('[data-testid=push-admin]').count() == 1)
        await page.locator('[data-testid=push-admin] button', has_text='Contar destinatários').click(); await page.wait_for_timeout(800)
        ok('sem título o admin recebe aviso e nada é enviado', await page.locator('[data-testid=push-admin] [role=status]').count() == 0)

        ok('nenhum erro de JavaScript', not errors, '; '.join(errors)[:300])
        await b.close()
    bad = [r for r in results if not r[1]]
    print(f'\n{len(results) - len(bad)}/{len(results)} passaram')
    raise SystemExit(1 if bad else 0)

asyncio.run(main())
