"""Testes da experiência Descubra: filtros, busca, matérias, relacionamentos e admin (Conecta-Lagos)."""
import asyncio, json
from playwright.async_api import async_playwright
from e2e import login, logout, mock_docs, BASE

results, errors = [], []
def ok(name, cond, detail=''):
    results.append((name, bool(cond)))
    print(('PASS ' if cond else 'FAIL ') + name + (f' — {detail}' if detail and not cond else ''))

SEED = """() => { const s = JSON.parse(sessionStorage.getItem('__mock_fs__'));
 const b = (id, o) => s.docs['businesses/' + id] = Object.assign({ id, ownerId: id, description: 'Descrição ' + id, coverImage: '', gallery: [], amenities: [], openingHours: {}, rating: 0, isBlocked: false, status: 'approved', cityId: 'city_arraial_do_cabo', reviews: [] }, o);
 b('praia1', { name: 'Praia do Forno Teste', category: 'Passeios', subcategory: 'Praias', address: 'Rua A', lat: -22.97, lng: -42.00, views: 50, experienceTags: ['gratuito', 'familias'], amenities: ['wifi', 'Pet Friendly'] });
 b('praia2', { name: 'Praia Grande Teste', category: 'Passeios', subcategory: 'Praias', address: 'Rua B', lat: -22.95, lng: -42.02, views: 5 });
 b('rest1', { name: 'Restaurante Maré Teste', category: 'Gastronomia', subcategory: 'Restaurantes', address: 'Rua C', reviews: [{ id: 'r1', rating: 5, status: 'approved', comment: 'ok' }, { id: 'r2', rating: 4, status: 'approved', comment: 'ok' }] });
 b('trilha1', { name: 'Trilha do Pontal Teste', category: 'Passeios', subcategory: 'Trilhas', address: 'Rua D' });
 b('hotel1', { name: 'Pousada Teste', category: 'Hospedagem', subcategory: 'Pousadas', address: 'Rua E', experienceTags: ['casais'], amenities: ['wifi', 'pool'] });
 b('rascunho', { name: 'Rascunho Invisível', category: 'Gastronomia', subcategory: 'Restaurantes', status: 'draft' });
 sessionStorage.setItem('__mock_fs__', JSON.stringify(s)); }"""

async def count_results(page):
    t = await page.locator('[data-testid=results-count]').inner_text()
    return int(t.split()[0])

async def run_viewport(b, p, name, ctx_args):
    ctx = await b.new_context(**ctx_args)
    page = await ctx.new_page()
    page.on('pageerror', lambda e: errors.append(f'PAGEERROR: {e}'))
    page.on('console', lambda m: errors.append(f'console.error: {m.text}') if m.type == 'error' and 'TUNNEL' not in m.text else None)
    return ctx, page

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx, page = await run_viewport(b, p, 'mobile', p.devices['iPhone 13'])
        await page.goto(BASE + '/'); await page.wait_for_timeout(1000)
        await page.evaluate(SEED)

        # 1. Descubra abre, vazio de matérias é honesto
        n = len(errors)
        await page.goto(BASE + '/descubra'); await page.wait_for_timeout(1500)
        ok('/descubra abre sem erro', len(errors) == n, '; '.join(errors[n:])[:300])
        ok('10 categorias principais', await page.locator('[data-testid^=cat-]').count() == 10)
        ok('10 filtros contextuais', await page.locator('[data-testid^=flt-]').count() == 10)
        ok('página de lugares lista todos sem filtro', await count_results(page) >= 5)
        ok('página de lugares não repete o conteúdo editorial', await page.locator('[aria-label^="Ler matéria"]').count() == 0)
        await page.screenshot(path='shots/30-descubra-mobile.png', full_page=True)

        # 2. Categorias filtram de verdade
        await page.locator('[data-testid=cat-praias]').click(); await page.wait_for_timeout(300)
        ok('categoria Praias: 2 resultados', await count_results(page) == 2, str(await count_results(page)))
        await page.locator('[data-testid=cat-restaurantes]').click(); await page.wait_for_timeout(300)
        ok('categoria Restaurantes: só o aprovado', await count_results(page) == 1 and await page.locator('text=Restaurante Maré Teste').count() > 0)
        await page.locator('[data-testid=cat-hospedagens]').click(); await page.wait_for_timeout(300)
        ok('categoria Hospedagens', await count_results(page) == 1)
        await page.locator('[data-testid=cat-natureza]').click(); await page.wait_for_timeout(300)
        ok('categoria Natureza inclui trilha', await page.locator('text=Trilha do Pontal Teste').count() > 0)
        await page.locator('[data-testid=cat-natureza]').click(); await page.wait_for_timeout(300)
        ok('desmarcar categoria volta à lista completa', await count_results(page) >= 5)
        await page.locator('[data-testid=cat-restaurantes]').click(); await page.wait_for_timeout(300)
        ok('rascunho de empresa não aparece', await page.locator('text=Rascunho Invisível').count() == 0)
        await page.locator('[data-testid=cat-restaurantes]').click(); await page.wait_for_timeout(300)

        # 2b. Comodidades
        await page.locator('[data-testid=cat-praias]').click(); await page.wait_for_timeout(200)
        ok('12 comodidades disponíveis com contagem real', await page.locator('[data-testid^=am-]').count() == 12)
        wifi_txt = await page.locator('[data-testid=am-wifi]').inner_text()
        ok('Wi-Fi conta 2 lugares (id e rótulo aceitos)', wifi_txt.strip().endswith('2'), wifi_txt)
        await page.locator('[data-testid=cat-praias]').click(); await page.wait_for_timeout(200)
        await page.locator('[data-testid=am-wifi]').click(); await page.wait_for_timeout(400)
        ok('filtro Wi-Fi: praia e hotel', await count_results(page) == 2)
        await page.locator('[data-testid=am-pool]').click(); await page.wait_for_timeout(400)
        ok('Wi-Fi + piscina (todas as comodidades): só o hotel', await count_results(page) == 1 and await page.locator('text=Pousada Teste').count() > 0)
        ok('comodidades na URL', 'am=' in page.url, page.url)
        await page.locator('[data-testid=am-pool]').click(); await page.locator('[data-testid=cat-hospedagens]').click(); await page.wait_for_timeout(300)
        await page.locator('[data-testid=am-pet]').click(); await page.wait_for_timeout(400)
        ok('comodidade que ninguém tem em Hospedagens: vazio explicado', await page.locator('[data-testid=empty-state]').count() == 1)
        await page.locator('[data-testid=am-pet]').click(); await page.locator('[data-testid=am-wifi]').click(); await page.locator('[data-testid=cat-hospedagens]').click(); await page.wait_for_timeout(300)
        await page.goto(BASE + '/descubra?am=pet'); await page.wait_for_timeout(1500)
        ok('comodidade pela URL (Pet Friendly)', await count_results(page) == 1 and await page.locator('text=Praia do Forno Teste').count() > 0)
        await page.goto(BASE + '/descubra'); await page.wait_for_timeout(1200)

        # 3. Filtros contextuais
        await page.locator('[data-testid=cat-praias]').click()
        await page.locator('[data-testid=flt-populares]').click(); await page.wait_for_timeout(300)
        first = await page.locator('text=Praia do Forno Teste').count()
        ok('populares ordena por visualizações', first > 0 and await count_results(page) == 2)
        await page.locator('[data-testid=flt-gratuito]').click(); await page.wait_for_timeout(300)
        ok('gratuitos usa a curadoria (1 praia)', await count_results(page) == 1 and await page.locator('text=Praia do Forno Teste').count() > 0)
        await page.locator('[data-testid=flt-casais]').click(); await page.wait_for_timeout(300)
        ok('casais em Praias: vazio explicado', await page.locator('[data-testid=empty-state]').count() == 1)
        await page.locator('[data-testid=cat-praias]').click()  # desmarca
        await page.wait_for_timeout(300)
        ok('casais geral: pousada marcada', await count_results(page) == 1 and await page.locator('text=Pousada Teste').count() > 0)
        await page.locator('[data-testid=flt-melhores]').click(); await page.wait_for_timeout(300)
        ok('melhor avaliados: só quem tem avaliação real', await count_results(page) == 1 and await page.locator('text=Restaurante Maré Teste').count() > 0)
        await page.locator('[data-testid=flt-aventura]').click(); await page.wait_for_timeout(300)
        ok('aventura: trilha', await page.locator('text=Trilha do Pontal Teste').count() > 0)
        await page.locator('[data-testid=flt-chuva]').click(); await page.wait_for_timeout(300)
        ok('chuva sem curadoria: vazio explicado', await page.locator('[data-testid=empty-state]').count() == 1)
        await page.locator('[data-testid=flt-chuva]').click(); await page.wait_for_timeout(200)

        # 4. Perto de mim com geolocalização
        await ctx.grant_permissions(['geolocation']); await ctx.set_geolocation({'latitude': -22.95, 'longitude': -42.02})
        await page.locator('[data-testid=flt-perto]').click(); await page.wait_for_timeout(1200)
        ok('perto de mim lista só lugares com coordenadas', await count_results(page) == 2)
        await page.locator('[data-testid=flt-perto]').click(); await page.wait_for_timeout(200)

        # 5. Busca
        await page.goto(BASE + '/descubra?q=trilha'); await page.wait_for_timeout(1200)
        ok('busca pela URL', await count_results(page) == 1 and await page.locator('text=Trilha do Pontal Teste').count() > 0)
        await page.goto(BASE + '/descubra?q=zzzxxx'); await page.wait_for_timeout(1200)
        ok('busca sem resultado: estado vazio', await page.locator('[data-testid=empty-state]').count() == 1)
        await page.goto(BASE + '/descubra?cat=restaurantes'); await page.wait_for_timeout(1200)
        ok('categoria pela URL', await count_results(page) == 1)

        # 6. Artigo inexistente / sem matérias
        await page.goto(BASE + '/guia/nao-existe'); await page.wait_for_timeout(1200)
        ok('matéria inexistente mostra aviso', await page.locator('[data-testid=article-missing]').count() == 1)

        # 7. Admin importa as 20 matérias
        await login(page, 'admin@teste.com')
        await page.goto(BASE + '/admin-dashboard'); await page.wait_for_timeout(1500)
        await page.locator('button', has_text='ECOSSISTEMA').first.click(); await page.wait_for_timeout(1000)
        ok('painel de matérias aparece', await page.locator('[data-testid=guide-admin]').count() == 1)
        await page.locator('button', has_text='Cadastrar matérias').click(); await page.wait_for_timeout(3000)
        arts = await mock_docs(page, 'blog_posts/guia_')
        ok('20 matérias cadastradas', len(arts) == 20, str(len(arts)))
        req = ['title', 'subtitle', 'excerpt', 'content', 'slug', 'category', 'tags', 'readingMinutes', 'collections', 'related']
        bad = [a['slug'] for a in arts if any(not a.get(k) for k in req)]
        ok('todas completas (título, subtítulo, resumo, conteúdo, slug, tags, tempo, coleção, relação)', not bad, str(bad))
        ok('todas com aviso de confirmação', all('Confirme' in a['content'] for a in arts))
        ok('todas ligadas ao guia por regra, sem IDs inventados', all(not (a['related'].get('businessIds')) for a in arts))
        ok('slugs únicos', len({a['slug'] for a in arts}) == 20)
        await page.goto(BASE + '/blog'); await page.wait_for_timeout(1500)
        ok('Feed reúne as matérias do Guia', await page.locator('text=O guia completo de Arraial do Cabo').count() > 0)
        await page.screenshot(path='shots/31-admin-guias.png', full_page=True)

        # 8. Feed: portal editorial + comunidade
        await logout(page)
        n = len(errors)
        await page.goto(BASE + '/blog'); await page.wait_for_timeout(1800)
        ok('Feed abre sem erro', len([e for e in errors[n:] if 'PAGEERROR' in e]) == 0, '; '.join(errors[n:])[:300])
        ok('Feed tem destaque principal e secundários', await page.locator('[data-testid=feed-highlights] [data-testid=lead-card]').count() == 1 and await page.locator('[data-testid=feed-highlights] [data-testid=compact-card]').count() >= 2)
        ok('Feed tem matérias por tema', await page.locator('[data-testid=feed-themes]').count() == 1 and await page.locator('[data-testid=feed-themes] [aria-label^="Ler matéria"]').count() > 0)
        types = await page.locator('[data-testid=feed-stream] [data-testid=stream-card]').evaluate_all('els => els.map(e => e.dataset.type)')
        ok('fluxo mistura formatos (matéria e dica/notícia)', 'materia' in types and any(t != 'materia' for t in types), str(types))
        ok('fluxo carrega aos poucos (9 primeiro)', len(types) == 9, str(len(types)))
        for _ in range(6):
            await page.evaluate("document.querySelector('[data-testid=feed-stream] > div[aria-hidden]')?.scrollIntoView()"); await page.wait_for_timeout(500)
        labels = await page.locator('[data-testid=feed-stream] [data-testid=stream-card] > button').evaluate_all('els => els.map(e => e.getAttribute("aria-label"))')
        ok('rolagem carrega o resto sem repetir', len(labels) > 9 and len(set(labels)) == len(labels), str(len(labels)))
        ok('fim do Feed sinalizado', await page.locator('[data-testid=feed-end]').count() == 1)
        await page.evaluate("document.querySelector('header')?.scrollIntoView()"); await page.wait_for_timeout(200)
        await page.locator('[data-testid=type-materia]').click(); await page.wait_for_timeout(500)
        for _ in range(4):
            await page.evaluate("document.querySelector('[data-testid=feed-stream] > div[aria-hidden]')?.scrollIntoView()"); await page.wait_for_timeout(400)
        mt = await page.locator('[data-testid=feed-stream] [data-testid=stream-card]').evaluate_all('els => els.map(e => e.dataset.type)')
        ok('filtro Matérias: só matérias, todas as 20', len(mt) == 20 and set(mt) == {'materia'}, str(len(mt)))
        ok('filtro de tipo vai para a URL', 'tipo=materia' in page.url, page.url)
        await page.locator('[data-testid=type-materia]').click(); await page.wait_for_timeout(300)
        await page.locator('input[aria-label="Buscar no Feed"]').fill('mergulho'); await page.wait_for_timeout(400)
        ok('busca do Feed encontra matéria', await page.locator('[data-testid=stream-card]', has_text='ergulho').count() >= 1)
        await page.locator('input[aria-label="Buscar no Feed"]').fill('zzzxxx'); await page.wait_for_timeout(300)
        ok('busca do Feed sem resultado: aviso', await page.locator('[data-testid=feed-empty]').count() == 1)
        await page.locator('input[aria-label="Buscar no Feed"]').fill('')
        await page.screenshot(path='shots/35-feed.png', full_page=False)
        await page.locator('[data-testid=lead-card]').first.click(); await page.wait_for_timeout(1500)
        ok('destaque do Feed abre a matéria completa', '/guia/' in page.url or '/blog/' in page.url, page.url)
        await page.goto(BASE + '/guia/praia-do-forno'); await page.wait_for_timeout(1500)
        await page.locator('button[aria-label="Voltar para o Feed"]').click(); await page.wait_for_timeout(1200)
        ok('matéria volta para o Feed', page.url.endswith('/blog'), page.url)

        # alinhamento da página de lugares
        await page.goto(BASE + '/descubra'); await page.wait_for_timeout(1500)
        xs = await page.evaluate("""() => { const l = e => e ? Math.round(e.getBoundingClientRect().left) : null;
          return [l(document.querySelector('form[role=search]')), l(document.querySelector('[data-testid=cat-praias]')), l(document.querySelector('[data-testid=flt-populares]')), l(document.querySelector('[data-testid=am-wifi]'))]; }""")
        ok('busca, categorias, filtros e comodidades alinhados', len(set(xs)) == 1, str(xs))
        hs = await page.evaluate("""() => [...document.querySelectorAll('[data-testid^=cat-]')].map(e => Math.round(e.getBoundingClientRect().height))""")
        ok('categorias com a mesma altura', len(set(hs)) == 1, str(hs))

        await page.goto(BASE + '/descubra?q=forno'); await page.wait_for_timeout(1500)
        ok('busca encontra matéria sobre Praia do Forno', await page.locator('text=Ler matéria').count() > 0 or await page.locator('[aria-label^="Ler matéria"]').count() > 0)
        await page.goto(BASE + '/guia/praia-do-forno'); await page.wait_for_timeout(1500)
        ok('página da matéria abre', await page.locator('[data-testid=article-title]').count() == 1)
        ok('matéria liga a empresas reais', await page.locator('[data-testid=related-businesses]').count() == 1 and await page.locator('text=Praia do Forno Teste').count() > 0)
        await page.screenshot(path='shots/32-guia-mobile.png', full_page=True)
        # 8c. Ecossistema: cupom, "ver todos", Ajuda Colaborativa e matéria no perfil do lugar
        await page.evaluate("""() => { const s = JSON.parse(sessionStorage.getItem('__mock_fs__')); s.docs['coupons/cp1'] = { id: 'cp1', companyId: 'praia1', companyName: 'Praia do Forno Teste', title: 'Cupom da praia', description: 'x', originalPrice: 10, discountedPrice: 8, discountPercentage: 20, imageUrl: '', category: 'Passeios', expiryDate: '2030-01-01', code: 'X', active: true, status: 'approved' }; s.docs['coupons/cp2'] = { id: 'cp2', companyId: 'rest1', companyName: 'Outro', title: 'Cupom de outro lugar', description: 'x', originalPrice: 10, discountedPrice: 8, discountPercentage: 20, imageUrl: '', category: 'Gastronomia', expiryDate: '2030-01-01', code: 'Y', active: true, status: 'approved' }; sessionStorage.setItem('__mock_fs__', JSON.stringify(s)); }""")
        await page.goto(BASE + '/guia/praia-do-forno'); await page.wait_for_timeout(2000)
        ok('matéria mostra só o cupom de lugar ligado a ela', await page.locator('[data-testid=article-coupons]').count() == 1 and await page.locator('text=Cupom da praia').count() == 1 and await page.locator('text=Cupom de outro lugar').count() == 0)
        ok('matéria tem atalho para a Ajuda Colaborativa', await page.locator('[data-testid=collab-cta]').count() == 1)
        await page.locator('[data-testid=explore-more]').click(); await page.wait_for_timeout(1200)
        ok('"Ver todos" abre o Descubra na categoria certa', 'cat=praias' in page.url and await count_results(page) >= 1, page.url)
        await page.goto(BASE + '/business/praia1'); await page.wait_for_timeout(2000)
        ok('perfil do lugar lista matérias que falam dele', await page.locator('[data-testid=business-articles]').count() == 1)
        await page.goto(BASE + '/guia/praia-do-forno'); await page.wait_for_timeout(1500)
        await page.locator('nav[aria-label="Navegar entre matérias"] button').last.click(); await page.wait_for_timeout(1200)
        ok('navegar para a próxima matéria', '/guia/' in page.url and 'praia-do-forno' not in page.url, page.url)
        await page.goto(BASE + '/guia/prainhas-do-pontal-do-atalaia'); await page.wait_for_timeout(1500)
        ok('tema sem cadastro mostra aviso honesto', await page.locator('[data-testid=related-empty]').count() + await page.locator('[data-testid=related-businesses] [aria-label^="Abrir"]').count() > 0)

        # 9. Home: vitrine do ecossistema
        await page.goto(BASE + '/'); await page.wait_for_timeout(2200)
        ok('Home tem 10 categorias', await page.locator('[data-testid^=cat-]').count() == 10)
        await page.locator('[data-testid=cat-praias]').click(); await page.wait_for_timeout(400)
        n_places = await page.locator('[data-testid=home-places] [aria-label^="Abrir "]').count()
        ok('categoria na Home mostra até 8 lugares', 1 <= n_places <= 8, str(n_places))
        await page.locator('[data-testid=see-all-places]').click(); await page.wait_for_timeout(1500)
        ok('"Ver todos" abre a página de lugares com o filtro', '/descubra' in page.url and 'cat=praias' in page.url and await count_results(page) >= n_places, page.url)
        await page.goto(BASE + '/'); await page.wait_for_timeout(2000)
        ok('banner de destaque restaurado', await page.locator('[data-testid=home-banner]').count() == 1)
        ok('cupons e ofertas na Home', await page.locator('[data-testid=home-coupons]').count() == 1)
        ok('roteiros selecionados na Home', await page.locator('[data-testid=home-collections]').count() == 1 and await page.locator('[data-testid=home-collections] [aria-label^="Ler matéria"]').count() > 0)
        ok('prévia editorial na Home', await page.locator('[data-testid=home-editorial] [data-testid=lead-card]').count() == 1 and await page.locator('[data-testid=home-editorial] [data-testid=compact-card]').count() >= 1)
        ok('Home sem lista editorial completa (fica no Feed)', await page.locator('[data-testid=feed-stream]').count() == 0)
        ok('Home tem seletor de idioma', await page.locator('[data-testid=lang-btn]').count() == 1)
        await page.locator('[data-testid=home-editorial] [data-testid=lead-card]').click(); await page.wait_for_timeout(1500)
        ok('destaque da Home abre a matéria completa', '/guia/' in page.url or '/blog/' in page.url, page.url)
        await page.goto(BASE + '/'); await page.wait_for_timeout(1800)
        await page.locator('[data-testid=home-to-feed]').click(); await page.wait_for_timeout(1200)
        ok('"Ver tudo no Feed" abre o Feed', page.url.endswith('/blog'), page.url)
        await page.goto(BASE + '/'); await page.wait_for_timeout(1500)
        await page.locator('form[role=search] input').fill('barco')
        await page.locator('form[role=search] button[type=submit]').click(); await page.wait_for_timeout(1200)
        ok('busca da Home abre a página de lugares', '/descubra' in page.url and 'q=barco' in page.url, page.url)
        ok('aba Feed e Início na barra inferior', await page.locator('nav[aria-label="Navegação principal"] >> text=Feed').count() > 0 and await page.locator('nav[aria-label="Navegação principal"] >> text=Início').count() > 0)
        await page.goto(BASE + '/'); await page.wait_for_timeout(1500)
        await page.screenshot(path='shots/36-home.png', full_page=True)

        # 10. Despublicar esconde
        await login(page, 'admin@teste.com')
        await page.goto(BASE + '/admin-dashboard'); await page.wait_for_timeout(1500)
        await page.locator('button', has_text='ECOSSISTEMA').first.click(); await page.wait_for_timeout(1000)
        row = page.locator('[data-testid=guide-row-praia-do-forno]')
        await row.get_by_role('button', name='Despublicar').click(); await page.wait_for_timeout(1200)
        d = await mock_docs(page, 'blog_posts/guia_praia-do-forno')
        ok('despublicar grava rascunho', d and d[0]['status'] == 'draft')
        await row.get_by_role('button', name='Destacar').click(); await page.wait_for_timeout(800)
        d = await mock_docs(page, 'blog_posts/guia_praia-do-forno')
        ok('destacar grava featured', d and d[0].get('featured') is True)
        # curadoria
        await page.locator('[data-testid=curation] input').fill('Pousada Teste'); await page.wait_for_timeout(300)
        await page.locator('[data-testid=curate-hotel1]').get_by_role('button', name='Famílias').click(); await page.wait_for_timeout(800)
        bz = await mock_docs(page, 'businesses/hotel1')
        ok('curadoria grava experienceTags', bz and 'familias' in bz[0].get('experienceTags', []) and 'casais' in bz[0]['experienceTags'])
        await logout(page)
        await page.goto(BASE + '/guia/praia-do-forno'); await page.wait_for_timeout(1500)
        ok('matéria despublicada some para o público', await page.locator('[data-testid=article-missing]').count() == 1)

        # 11. Visitante não grava matérias
        ok('visitante não grava guias', len(await mock_docs(page, 'blog_posts/guia_')) == 20)
        await ctx.close()

        # 12. Desktop
        dctx, dp = await run_viewport(b, p, 'desktop', {'viewport': {'width': 1280, 'height': 800}})
        await dp.goto(BASE + '/'); await dp.wait_for_timeout(800)
        await dp.evaluate(SEED)
        await dp.goto(BASE + '/descubra'); await dp.wait_for_timeout(1500)
        ok('desktop: Descubra abre', await dp.locator('[data-testid=cat-praias]').count() == 1)
        ok('desktop: sem rolagem horizontal da página', await dp.evaluate('document.documentElement.scrollWidth <= window.innerWidth + 1'))
        await dp.goto(BASE + '/'); await dp.wait_for_timeout(1500)
        ok('desktop: Home mostra a vitrine', await dp.locator('[data-testid=home-places]').count() == 1)
        await dp.screenshot(path='shots/37-home-desktop.png', full_page=True)
        await dp.goto(BASE + '/descubra'); await dp.wait_for_timeout(1500)
        xs = await dp.evaluate("""() => { const l = e => e ? Math.round(e.getBoundingClientRect().left) : null; return [l(document.querySelector('form[role=search]')), l(document.querySelector('[data-testid=cat-praias]')), l(document.querySelector('[data-testid=flt-populares]'))]; }""")
        ok('desktop: busca, categorias e filtros alinhados', len(set(xs)) == 1, str(xs))
        await dp.screenshot(path='shots/33-descubra-desktop.png', full_page=True)
        await dctx.close()

        # 13. Tela pequena
        sctx, sp = await run_viewport(b, p, 'small', {'viewport': {'width': 320, 'height': 640}})
        await sp.goto(BASE + '/'); await sp.wait_for_timeout(800)
        await sp.evaluate(SEED)
        await sp.goto(BASE + '/descubra'); await sp.wait_for_timeout(1500)
        ok('320px: sem rolagem horizontal da página', await sp.evaluate('document.documentElement.scrollWidth <= window.innerWidth + 1'))
        await sctx.close()

        fatal = [e for e in errors if 'PAGEERROR' in e]
        ok('nenhum erro de JavaScript na página', not fatal, '; '.join(fatal)[:400])
        await b.close()
    bad = [r for r in results if not r[1]]
    print(f'\n{len(results) - len(bad)}/{len(results)} passaram')
    raise SystemExit(1 if bad else 0)

asyncio.run(main())
