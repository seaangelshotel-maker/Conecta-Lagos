"""Privacidade, termos, exclusão de conta e consentimento de Analytics (Conecta-Lagos)."""
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
        ctx = await b.new_context(**p.devices['iPhone 13'])
        await ctx.add_init_script("sessionStorage.setItem('__show_consent__', '1')")
        page = await ctx.new_page()
        page.on('pageerror', lambda e: errors.append(f'PAGEERROR: {e}'))

        # 1. Consentimento
        await page.goto(BASE + '/'); await page.wait_for_timeout(1500)
        ok('aviso de privacidade aparece na primeira visita', await page.locator('[data-testid=consent-banner]').count() == 1)
        await page.locator('[data-testid=consent-deny]').click(); await page.wait_for_timeout(300)
        ok('recusar fecha o aviso e grava a escolha', await page.locator('[data-testid=consent-banner]').count() == 0 and await page.evaluate("localStorage.getItem('lagosgo_consent_analytics_v1')") == 'denied')
        await page.goto(BASE + '/blog'); await page.wait_for_timeout(800)
        ok('aviso não volta depois da escolha', await page.locator('[data-testid=consent-banner]').count() == 0)

        # 2. Páginas legais
        for path, tid, must in [('/privacidade', 'privacy-page', 'Seus direitos'), ('/termos', 'terms-page', 'Ajuda Colaborativa'), ('/excluir-conta', 'delete-account-page', 'O que é apagado')]:
            await page.goto(BASE + path); await page.wait_for_timeout(1200)
            ok(f'{path} abre com conteúdo', await page.locator(f'[data-testid={tid}]').count() == 1 and await page.locator(f'text={must}').count() > 0)
        await page.goto(BASE + '/privacidade'); await page.wait_for_timeout(1000)
        await page.locator('[data-testid=privacy-consent] button', has_text='Aceitar').click(); await page.wait_for_timeout(300)
        ok('política permite mudar a escolha de Analytics', await page.evaluate("localStorage.getItem('lagosgo_consent_analytics_v1')") == 'granted')
        ok('sem dados do responsável, a política mostra contato genérico (sem campos vazios)', 'CNPJ:' not in await page.locator('[data-testid=legal-controller]').first.inner_text())
        await page.goto(BASE + '/'); await page.wait_for_timeout(1500)
        ok('rodapé com links legais na Home', await page.locator('[data-testid=legal-footer]').count() == 1)
        await page.locator('[data-testid=legal-footer] button', has_text='Termos de uso').click(); await page.wait_for_timeout(1000)
        ok('link do rodapé abre os termos', page.url.endswith('/termos'))

        # 3. Admin preenche os dados legais
        await login(page, 'admin@teste.com')
        await page.goto(BASE + '/admin-dashboard'); await page.wait_for_timeout(1500)
        await page.locator('button', has_text='ECOSSISTEMA').first.click(); await page.wait_for_timeout(1000)
        ok('painel de dados legais no admin', await page.locator('[data-testid=legal-admin]').count() == 1)
        await page.locator('[data-testid=legal-companyName]').fill('Teste Turismo Ltda')
        await page.locator('[data-testid=legal-cnpj]').fill('12.345.678/0001-90')
        await page.locator('[data-testid=legal-privacyEmail]').fill('privacidade@teste.com')
        await page.locator('[data-testid=legal-save]').click(); await page.wait_for_timeout(1000)
        d = await mock_docs(page, 'app_settings/legal')
        ok('dados legais gravados', d and d[0]['cnpj'] == '12.345.678/0001-90')
        await logout(page)
        await page.goto(BASE + '/privacidade'); await page.wait_for_timeout(1500)
        txt = await page.locator('[data-testid=legal-controller]').first.inner_text()
        ok('política mostra razão social, CNPJ e e-mail', 'Teste Turismo Ltda' in txt and '12.345.678/0001-90' in txt and 'privacidade@teste.com' in txt, txt)

        # 4. Excluir conta
        await page.goto(BASE + '/excluir-conta'); await page.wait_for_timeout(1200)
        ok('sem login pede para entrar', await page.locator('[data-testid=delete-login]').count() == 1)
        await login(page, 'bruno@teste.com')
        await page.evaluate("""() => { const s = JSON.parse(sessionStorage.getItem('__mock_fs__')); s.docs['blog_comments/c-b'] = { id: 'c-b', postId: 'x', userId: 'bruno', userName: 'Bruno', content: 'oi' }; s.docs['public_profiles/bruno'] = { id: 'bruno', name: 'Bruno' }; sessionStorage.setItem('__mock_fs__', JSON.stringify(s)); }""")
        # 4a. Direitos do titular
        await page.goto(BASE + '/privacidade'); await page.wait_for_timeout(1500)
        ok('painel de direitos aparece logado', await page.locator('[data-testid=rights-panel]').count() == 1)
        async with page.expect_download() as dl:
            await page.locator('[data-testid=rights-download]').click()
        ok('baixa arquivo JSON com os dados', (await dl.value).suggested_filename.startswith('meus-dados-lagos-go'))
        await page.locator('[data-testid=rights-text]').fill('Quero saber o que vocês guardam sobre mim')
        await page.locator('[data-testid=rights-send]').click(); await page.wait_for_timeout(1200)
        reqs = [d for d in await mock_docs(page, 'privacyRequests') if d.get('userId') == 'bruno']
        ok('pedido de privacidade gravado como aberto', len(reqs) == 1 and reqs[0]['status'] == 'open' and reqs[0]['type'] == 'access', str(reqs))
        ok('titular vê o pedido na lista', await page.locator('[data-testid=rights-list]').count() == 1)
        await page.goto(BASE + '/user-dashboard'); await page.wait_for_timeout(1500)
        ok('perfil tem link para excluir conta', await page.locator('[data-testid=legal-footer] button', has_text='Excluir conta').count() == 1)
        await page.locator('[data-testid=legal-footer] button', has_text='Excluir conta').click(); await page.wait_for_timeout(1200)
        ok('formulário de exclusão para quem está logado', await page.locator('[data-testid=delete-form]').count() == 1)
        ok('botão bloqueado sem digitar EXCLUIR', await page.locator('[data-testid=delete-confirm]').is_disabled())
        await page.locator('input[aria-label="Digite EXCLUIR para confirmar"]').fill('excluir')
        await page.locator('[data-testid=delete-confirm]').click(); await page.wait_for_timeout(1500)
        ok('confirma a exclusão', 'excluídos' in (await page.locator('[data-testid=delete-msg]').inner_text()))
        ok('apaga usuário, perfil público e comentários', not await mock_docs(page, 'users/bruno') and not await mock_docs(page, 'public_profiles/bruno') and not await mock_docs(page, 'blog_comments/c-b'))
        ok('apaga o login', await page.evaluate("JSON.parse(sessionStorage.getItem('__mock_fs__')).users.bruno === undefined"))
        acc = [d for d in await mock_docs(page, 'privacyRequests') if d.get('type') == 'account_deleted']
        ok('exclusão avisa a equipe com pedido account_deleted', len(acc) == 1 and acc[0]['userId'] == 'bruno', str(acc))
        await login(page, 'admin@teste.com')
        await page.goto(BASE + '/admin-dashboard'); await page.wait_for_timeout(1500)
        await page.locator('button', has_text='ECOSSISTEMA').first.click(); await page.wait_for_timeout(1200)
        ok('admin vê a fila de pedidos de privacidade', await page.locator('[data-testid=privacy-item]').count() == 2)
        await page.locator('[data-testid=privacy-done]').first.click(); await page.wait_for_timeout(1000)
        done = [d for d in await mock_docs(page, 'privacyRequests') if d.get('status') == 'done']
        ok('admin conclui um pedido', len(done) == 1 and 'resolvedAt' in done[0], str(done))
        ok('outros usuários intactos', len(await mock_docs(page, 'users/ana')) == 1)

        ok('nenhum erro de JavaScript', not errors, '; '.join(errors)[:300])
        await b.close()
    bad = [r for r in results if not r[1]]
    print(f'\n{len(results) - len(bad)}/{len(results)} passaram')
    raise SystemExit(1 if bad else 0)

asyncio.run(main())
