"""Testes das funcionalidades do Feed/Blog, multi-idioma e telas do painel (Conecta-Lagos)."""
import asyncio, sys
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
        page = await ctx.new_page()
        page.on('pageerror', lambda e: errors.append(f'PAGEERROR: {e}'))
        page.on('console', lambda m: errors.append(f'console.error: {m.text}') if m.type == 'error' and 'TUNNEL' not in m.text else None)

        # 1. Telas públicas abrem sem erro
        for path, txt in [('/', 'Lagos GO'), ('/guide', None), ('/search', None), ('/blog', None), ('/ajuda', 'Ajuda'), ('/pricing-plans', None), ('/collections', None)]:
            n = len(errors)
            await page.goto(BASE + path); await page.wait_for_timeout(1300)
            body = await page.inner_text('body')
            ok(f'{path} abre sem erro', len(errors) == n and len(body) > 50, '; '.join(errors[n:])[:300])

        # 2. Feed: posts padrão aparecem para visitante, sem gravar no banco
        await page.goto(BASE + '/blog'); await page.wait_for_timeout(1500)
        posts_db = await mock_docs(page, 'blog_posts/')
        cards = await page.locator('text=Cabo Frio').count()
        ok('feed mostra posts para visitante', cards > 0)
        ok('visitante não grava posts padrão no banco', len([d for d in posts_db if d['path'].startswith('blog_posts/')]) == 0)
        await page.screenshot(path='shots/20-feed.png')

        # 3. Detalhe do post: comentário como visitante e "conectar-se"
        await page.evaluate("""() => { const s = JSON.parse(sessionStorage.getItem('__mock_fs__')); s.docs['blog_posts/p-test'] = { id: 'p-test', title: 'Roteiro de teste no Forte', excerpt: 'Resumo', content: 'Conteúdo do roteiro', imageUrl: '', category: 'Roteiros', date: '2026-11-01', author: 'Yuri Guida', authorId: 'yuri_guida', status: 'published', connectedUsers: [] }; sessionStorage.setItem('__mock_fs__', JSON.stringify(s)); }""")
        await page.goto(BASE + '/blog/p-test'); await page.wait_for_timeout(1500)
        ok('detalhe do post abre', await page.locator('text=Roteiro de teste no Forte').count() > 0)
        ok('sem número inventado de conexões', await page.locator('text=Seja a primeira pessoa').count() > 0)
        ta = page.locator('textarea').first
        if await ta.count():
            await ta.fill('Ótima dica!')
            name_inp = page.locator('input[placeholder*="João"]').first
            if await name_inp.count(): await name_inp.fill('Visitante Teste')
            await page.locator('form button[type=submit]').last.click(); await page.wait_for_timeout(900)
            comms = await mock_docs(page, 'blog_comments/')
            ok('comentário de visitante gravado como guest', any(c['content'] == 'Ótima dica!' and c['userId'] == 'guest' for c in comms))
        else:
            ok('campo de comentário existe', False)
        await page.screenshot(path='shots/21-post.png', full_page=True)

        await login(page, 'carla@teste.com')
        await page.goto(BASE + '/blog/p-test'); await page.wait_for_timeout(1500)
        btn = page.locator('button', has_text='Conectar-se')
        if await btn.count():
            await btn.first.click(); await page.wait_for_timeout(900)
            post = await mock_docs(page, 'blog_posts/p-test')
            ok('conectar grava só o nome na lista', post and 'Carla' in ' '.join(post[0].get('connectedUsers', [])) and post[0]['title'] == 'Roteiro de teste no Forte')
            ok('texto mostra conexão real', await page.locator('text=se conectou a este roteiro').count() > 0)
        else:
            ok('botão Conectar-se existe', False)

        # 4. Multi-idioma: inglês
        await page.goto(BASE + '/'); await page.wait_for_timeout(1000)
        flag = page.locator('button', has_text='🇧🇷').first
        if await flag.count():
            await flag.click(); await page.wait_for_timeout(400)
            en = page.locator('button', has_text='🇺🇸').first
            if await en.count():
                await en.click(); await page.wait_for_timeout(1200)
                ok('troca para inglês traduz a navegação', await page.locator('text=Home').count() > 0 or await page.locator('text=Coupons').count() > 0)
            else: ok('opção de inglês existe', False)
        else: ok('seletor de idioma existe', False)
        await page.screenshot(path='shots/22-english.png')
        await page.evaluate("() => { localStorage.removeItem('app_language'); localStorage.removeItem('lagos_go_language'); }")

        # 5. Admin: telas do Feed, patrocínios e Drive abrem
        await logout(page); await login(page, 'admin@teste.com')
        for label in ['FEED DE DICAS', 'PATROCÍNIOS DICAS', 'MODERAÇÃO', 'ECOSSISTEMA']:
            n = len(errors)
            await page.goto(BASE + '/admin-dashboard'); await page.wait_for_timeout(1500)
            bt = page.locator('button', has_text=label)
            if await bt.count():
                await bt.first.click(); await page.wait_for_timeout(1200)
                ok(f'admin abre "{label}"', len(errors) == n, '; '.join(errors[n:])[:300])
            else:
                ok(f'botão "{label}" existe', False)
        await page.screenshot(path='shots/23-admin.png')

        # 6. Dados ruins do banco não aparecem: nota sem avaliações e horário com texto de IA
        await page.evaluate("""() => { const s = JSON.parse(sessionStorage.getItem('__mock_fs__')); s.docs['businesses/ruim'] = { id: 'ruim', name: 'Hostel Dados Ruins', category: 'Hospedagem', description: 'x', address: 'Prainha', status: 'approved', isBlocked: false, rating: 5, reviewCount: 850, reviews: [], openingHours: { 'Segunda': '24 horas', 'Terça': '24 horasBaseada no bom senso: 24 horas (Recepção). No JSON, usarei 24h. Corrigindo para as chaves exatas do schema', 'Quarta': '08:00 - 18:00 Conforme schema e JSON eu fiz isso e aquilo bem comprido mesmo' } }; sessionStorage.setItem('__mock_fs__', JSON.stringify(s)); }""")
        await page.goto(BASE + '/business/ruim'); await page.wait_for_timeout(1500)
        body = await page.inner_text('body')
        ok('nota inventada (850) não aparece', '(850)' not in body and '5.0' not in body)
        ok('texto de IA no horário não aparece', 'schema' not in body and 'JSON' not in body)
        ok('horário limpo mostra faixa e 24 horas', '08:00 - 18:00' in body and '24 horas' in body)
        await page.screenshot(path='shots/24-dados-ruins.png', full_page=True)
        await b.close()

    passed = sum(1 for r in results if r[1])
    print(f'\n{passed}/{len(results)} verificações passaram; erros: {len(errors)}')
    for e in errors[:15]: print('  ', e[:300])
    sys.exit(0 if passed == len(results) else 1)

asyncio.run(main())
