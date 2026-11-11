"""Notificações push: ativar, temas, desligar, painel do admin e carregamento do mapa sob demanda (Conecta-Lagos)."""
import asyncio, datetime, json
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
        await ctx.grant_permissions(['notifications', 'clipboard-read', 'clipboard-write'], origin=BASE)
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

        # ---- aviso da semana: gerar, copiar e usar no push ----
        d = datetime.date.today()
        sat = d + datetime.timedelta(days=(5 - d.weekday()) % 7 or 7) if d.weekday() < 4 else d
        ev = {'title': 'Festival do Peixe', 'category': 'festa', 'startDate': sat.isoformat(), 'cityId': 'arraial-do-cabo', 'status': 'published',
              'locationName': 'Praia dos Anjos', 'isFree': True, 'startTime': '18:00', 'ownerId': 'admin'}
        await page.evaluate("(e) => { const s = JSON.parse(sessionStorage.getItem('__mock_fs__')); s.docs['events/e2e-digest'] = e; sessionStorage.setItem('__mock_fs__', JSON.stringify(s)); }", ev)
        await page.reload(); await page.wait_for_timeout(1500)
        await page.locator('button', has_text='ECOSSISTEMA').first.click(); await page.wait_for_timeout(1000)
        ok('bloco do aviso da semana aparece no painel', await page.locator('[data-testid=weekly-digest]').count() == 1)
        ok('antes de gerar não há texto', await page.locator('[data-testid=digest-text]').count() == 0)
        await page.locator('[data-testid=digest-build]').click(); await page.wait_for_timeout(1500)
        txt = await page.locator('[data-testid=digest-text]').input_value()
        ok('texto traz o evento do fim de semana', 'Festival do Peixe' in txt and 'Praia dos Anjos' in txt, txt[:200])
        ok('texto traz cupom com economia em reais', 'economize R$' in txt, txt[:300])
        ok('texto traz o link do app', 'lagosgo.com.br/eventos' in txt)
        ok('contagem mostra 1 evento', '1 evento' in await page.locator('[data-testid=digest-counts]').inner_text())
        await page.locator('[data-testid=digest-text]').fill(txt + '\nRecado extra do admin')
        await page.locator('[data-testid=digest-copy]').click(); await page.wait_for_timeout(500)
        clip = await page.evaluate("navigator.clipboard.readText()")
        ok('copiar leva o texto (com a edição do admin) para a área de transferência', 'Recado extra do admin' in clip and 'Festival do Peixe' in clip)
        await page.locator('[data-testid=digest-use-push]').click(); await page.wait_for_timeout(300)
        vals = await page.locator('[data-testid=push-admin] input, [data-testid=push-admin] textarea').evaluate_all("els => els.map(e => e.value)")
        ok('usar no push preenche título, texto e link', any('1 evento' in v for v in vals) and any('Festival do Peixe' in v for v in vals) and '/eventos' in vals, str(vals)[:300])
        await page.screenshot(path='shots/digest.png')

        ok('nenhum erro de JavaScript', not errors, '; '.join(errors)[:300])
        await b.close()
    bad = [r for r in results if not r[1]]
    print(f'\n{len(results) - len(bad)}/{len(results)} passaram')
    raise SystemExit(1 if bad else 0)

asyncio.run(main())
