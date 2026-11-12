"""
Teste de ponta a ponta da Lagos GO (interface real + Firebase simulado em memória).
Fluxos: login, Ajuda Colaborativa (publicar, listar, filtrar, candidatar, gerenciar,
encerrar, denunciar), hub do perfil, moderação admin, página da empresa (WhatsApp + evento),
redirecionamento pós-login, rota protegida, permissões de tela.
"""
import asyncio, json, sys, datetime
from playwright.async_api import async_playwright, expect

BASE = 'http://localhost:5178'
results = []
errors = []

def ok(name, cond, detail=''):
    results.append((name, bool(cond), detail))
    print(('PASS ' if cond else 'FAIL ') + name + (f' — {detail}' if detail and not cond else ''))

async def login(page, email):
    await page.goto(f'{BASE}/login')
    await page.fill('input[type=email]', email)
    await page.fill('input[type=password]', 'senha123')
    await page.locator('form button[type=submit]').first.click()
    await page.wait_for_timeout(900)

async def logout(page):
    await page.evaluate("""() => { const s = JSON.parse(sessionStorage.getItem('__mock_fs__')); s.currentUid = null; sessionStorage.setItem('__mock_fs__', JSON.stringify(s)); localStorage.removeItem('lagos_go_session_v1'); }""")
    await page.goto(BASE + '/')
    await page.wait_for_timeout(500)

async def mock_docs(page, prefix):
    return await page.evaluate("(p) => { const s = JSON.parse(sessionStorage.getItem('__mock_fs__')); return Object.entries(s.docs).filter(([k]) => k.startsWith(p)).map(([k,v]) => ({path:k, ...v})); }", prefix)

async def main():
    future = (datetime.date.today() + datetime.timedelta(days=5)).isoformat()
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(**p.devices['iPhone 13'], locale='pt-BR')
        page = await ctx.new_page()
        page.on('pageerror', lambda e: errors.append(f'PAGEERROR: {e}'))
        page.on('console', lambda m: errors.append(f'console.{m.type}: {m.text}') if m.type == 'error' else None)
        page.on('popup', lambda pop: asyncio.ensure_future(pop.close()))

        # 1. Rota protegida sem login → tela de login; após login volta para a publicação
        await page.goto(f'{BASE}/ajuda/publicar')
        await page.wait_for_timeout(700)
        ok('rota protegida pede login', await page.locator('input[type=password]').count() > 0)
        await page.fill('input[type=email]', 'ana@teste.com')
        await page.fill('input[type=password]', 'senha123')
        await page.locator('form button[type=submit]').first.click()
        await page.wait_for_timeout(1200)
        ok('após login volta para "Publicar oportunidade"', await page.locator('text=Publicar oportunidade').count() > 0, page.url)

        # 2. Validação: tentar publicar vazio mostra erros
        await page.locator('button[type=submit]', has_text='Publicar').click()
        await page.wait_for_timeout(400)
        ok('validação bloqueia publicação vazia', await page.locator('text=O título precisa ter pelo menos 5 caracteres.').count() > 0)

        # 3. Preencher e publicar
        await page.fill('#opp-title', 'Marinheiro para saída de sábado')
        await page.select_option('#opp-category', 'Náutica e passeios')
        await page.fill('#opp-description', 'Precisamos de marinheiro com experiência para o passeio de sábado saindo da Praia dos Anjos.')
        await page.select_option('#opp-businessId', 'ana')
        ok('publicar em nome da empresa preenche o nome', await page.input_value('#opp-posterName') == 'Barco Azul Passeios')
        await page.fill('#opp-startDate', future)
        await page.fill('#opp-schedule', '8h às 16h')
        await page.select_option('#opp-cityId', 'arraial')
        await page.select_option('#opp-neighborhoodId', 'praia-anjos')
        await page.select_option('#opp-compensationType', 'fixed')
        await page.fill('#opp-compensationMin', '250')
        await page.fill('#opp-requirementsText', 'Habilitação Arrais\nExperiência com turismo')
        await page.screenshot(path='shots/02-form.png')
        await page.locator('button[type=submit]', has_text='Publicar').click()
        await page.wait_for_timeout(1200)
        ok('após publicar abre o detalhe', '/ajuda/' in page.url and await page.locator('text=Marinheiro para saída de sábado').count() > 0, page.url)
        ok('detalhe mostra remuneração formatada', await page.locator('text=/R\\$\\s?250 por dia/').count() > 0)
        await page.screenshot(path='shots/03-detail-owner.png')
        opps = await mock_docs(page, 'opportunities/')
        main_opp = [o for o in opps if o.get('title') == 'Marinheiro para saída de sábado' and '/' not in o['path'][len('opportunities/'):]]
        ok('oportunidade gravada como publicada', main_opp and main_opp[0]['status'] == 'published' and main_opp[0]['isHidden'] is False and main_opp[0].get('cityName') == 'Arraial do Cabo', json.dumps(main_opp)[:300])
        opp_id = main_opp[0]['id'] if main_opp else ''
        hist = [o for o in opps if o['path'].startswith(f'opportunities/{opp_id}/history/')]
        ok('histórico registrou a criação', len(hist) == 1 and hist[0]['action'] == 'created')
        rl = await mock_docs(page, 'rateLimits/ana')
        ok('antispam gravado no mesmo lote', len(rl) == 1)

        # 4. Rascunho de uma segunda oportunidade (não aparece na lista pública)
        await page.goto(f'{BASE}/ajuda/publicar')
        await page.wait_for_timeout(600)
        await page.fill('#opp-title', 'Atendente de bar no barco')
        await page.select_option('#opp-category', 'Bares e restaurantes')
        await page.fill('#opp-description', 'Atendimento no bar durante a saída de barco, servindo bebidas e petiscos aos turistas.')
        await page.locator('button', has_text='Salvar rascunho').click()
        await page.wait_for_timeout(1000)
        ok('rascunho leva para "Minha Ajuda Colaborativa"', '/ajuda/minhas' in page.url, page.url)
        ok('rascunho listado com status', await page.locator('text=Rascunho').count() > 0)

        # 5. Hub do perfil
        await page.goto(f'{BASE}/user-dashboard')
        await page.wait_for_timeout(900)
        ok('hub mostra painel da empresa', await page.locator('text=Barco Azul Passeios').count() > 0)
        ok('hub mostra minhas publicações', await page.locator('text=Minhas publicações').count() > 0)
        await page.locator('button', has_text='Estou visitando').click()
        await page.wait_for_timeout(700)
        u = await mock_docs(page, 'users/ana')
        ok('perfil salva "estou visitando"', u and 'turista' in (u[0].get('profileTypes') or []))
        ok('perfil turista mostra atendimento especializado', await page.locator('text=Falar com Guida Trips').count() > 0)
        ok('papel não foi alterado pelo próprio usuário', u and u[0]['role'] == 'COMPANY')
        await page.screenshot(path='shots/04-hub.png', full_page=True)

        # 6. Bruno: listagem, filtros, interesse
        await logout(page)
        await login(page, 'bruno@teste.com')
        await page.goto(f'{BASE}/ajuda')
        await page.wait_for_timeout(900)
        ok('lista pública mostra a oportunidade publicada', await page.locator('text=Marinheiro para saída de sábado').count() > 0)
        ok('lista pública não mostra rascunho', await page.locator('text=Atendente de bar no barco').count() == 0)
        await page.screenshot(path='shots/05-list.png')
        await page.locator('button', has_text='Filtros').click()
        await page.select_option('select[aria-label=Cidade]', 'cabo-frio')
        await page.wait_for_timeout(300)
        ok('filtro por cidade esconde a de Arraial', await page.locator('text=Marinheiro para saída de sábado').count() == 0)
        await page.select_option('select[aria-label=Cidade]', '')
        await page.fill('input[type=search]', 'arrais')
        await page.wait_for_timeout(300)
        ok('busca encontra por requisito', await page.locator('text=Marinheiro para saída de sábado').count() > 0)
        await page.locator('text=Marinheiro para saída de sábado').first.click()
        await page.wait_for_timeout(900)
        await page.locator('button', has_text='Tenho interesse').click()
        await page.wait_for_timeout(300)
        ok('formulário de interesse pré-preenche telefone', await page.input_value('#apply-contact') == '22999990000')
        await page.fill('#apply-msg', 'Tenho Arrais e 3 anos de experiência.')
        await page.locator('form button[type=submit]', has_text='Enviar').click()
        await page.wait_for_timeout(900)
        ok('status "Interesse enviado" aparece', await page.locator('text=Interesse enviado').count() > 0)
        apps = await mock_docs(page, f'opportunities/{opp_id}/applications/')
        ok('candidatura gravada com id = uid', len(apps) == 1 and apps[0]['path'].endswith('/bruno') and apps[0]['opportunityOwnerId'] == 'ana')
        inter = await mock_docs(page, 'interactions/')
        types = sorted(set(i['type'] for i in inter))
        ok('eventos de visualização e interesse registrados', 'opportunity_view' in types and 'opportunity_interest' in types, str(types))
        ok('eventos sem dados pessoais', all('userId' not in i and 'email' not in i and i.get('sessionId') for i in inter))
        await page.screenshot(path='shots/06-applied.png')

        # Denúncia
        await page.locator('text=Denunciar esta publicação').click()
        await page.locator('label', has_text='Spam ou publicação repetida').click()
        await page.locator('button', has_text='Enviar denúncia').click()
        await page.wait_for_timeout(700)
        reps = await mock_docs(page, 'reports/')
        ok('denúncia registrada', len(reps) == 1 and reps[0]['status'] == 'open' and reps[0]['reporterId'] == 'bruno')

        await page.goto(f'{BASE}/ajuda/interesses')
        await page.wait_for_timeout(900)
        ok('"Meus interesses" lista a candidatura', await page.locator('text=Marinheiro para saída de sábado').count() > 0)

        # Bruno não acessa gerenciamento da Ana
        await page.goto(f'{BASE}/ajuda/gerenciar/{opp_id}')
        await page.wait_for_timeout(800)
        ok('não-dono não gerencia publicação alheia', await page.locator('text=Publicação não encontrada').count() > 0)
        # Bruno não acessa painel de empresa
        await page.goto(f'{BASE}/admin-dashboard')
        await page.wait_for_timeout(900)
        ok('cliente comum é redirecionado do painel admin', '/user-dashboard' in page.url, page.url)

        # 7. Ana gerencia interessados e encerra
        await logout(page)
        await login(page, 'ana@teste.com')
        await page.goto(f'{BASE}/ajuda/gerenciar/{opp_id}')
        await page.wait_for_timeout(1000)
        ok('anunciante vê interessado e contato', await page.locator('text=Bruno').count() > 0 and await page.locator('text=22999990000').count() > 0)
        await page.get_by_role('button', name='Selecionar', exact=True).click()
        await page.wait_for_timeout(600)
        apps = await mock_docs(page, f'opportunities/{opp_id}/applications/')
        ok('status da candidatura vira "selected"', apps and apps[0]['status'] == 'selected')
        await page.locator('button', has_text='Marcar como preenchida').click()
        await page.wait_for_timeout(800)
        opp_doc = await mock_docs(page, f'opportunities/{opp_id}')
        ok('oportunidade marcada como preenchida', opp_doc and opp_doc[0]['status'] == 'filled')
        await page.screenshot(path='shots/07-manage.png', full_page=True)
        hist = await mock_docs(page, f'opportunities/{opp_id}/history/')
        ok('histórico registra mudança de status', any(h['action'] == 'status_changed' and h.get('toStatus') == 'filled' for h in hist))
        await page.goto(f'{BASE}/ajuda')
        await page.wait_for_timeout(800)
        ok('preenchida some da lista pública', await page.locator('text=Marinheiro para saída de sábado').count() == 0)

        # 8. Página da empresa: WhatsApp + evento com dono correto
        await page.goto(f'{BASE}/business/ana')
        await page.wait_for_timeout(1200)
        ok('página da empresa mostra botão WhatsApp', await page.locator('button[aria-label="Conversar no WhatsApp"]').count() > 0)
        await page.locator('button[aria-label="Conversar no WhatsApp"]').click()
        await page.wait_for_timeout(600)
        inter = await mock_docs(page, 'interactions/')
        biz_ev = [i for i in inter if i['entityId'] == 'ana']
        ok('visualização e clique no WhatsApp viram eventos com ownerId', any(i['type'] == 'business_view' for i in biz_ev) and any(i['type'] == 'whatsapp_click' and i.get('ownerId') == 'ana' for i in biz_ev), str([(i['type'], i.get('ownerId')) for i in biz_ev]))

        # 9. Painel da empresa mostra resultados reais
        await page.goto(f'{BASE}/admin-dashboard')
        await page.wait_for_timeout(1500)
        ok('painel da empresa explica período real', await page.locator('text=Resultados reais dos últimos').count() > 0)
        await page.screenshot(path='shots/08-company-dashboard.png')

        # 10. Admin: moderação
        await logout(page)
        await login(page, 'admin@teste.com')
        await page.goto(f'{BASE}/admin-dashboard')
        await page.wait_for_timeout(1500)
        await page.locator('button', has_text='MODERAÇÃO').click()
        await page.wait_for_timeout(1200)
        ok('moderação lista denúncia aberta', await page.locator('text=Spam ou publicação repetida').count() > 0)
        page.once('dialog', lambda d: asyncio.ensure_future(d.accept('Em análise')))
        await page.get_by_role('button', name='Ocultar', exact=True).first.click()
        await page.wait_for_timeout(900)
        opp_doc = await mock_docs(page, f'opportunities/{opp_id}')
        ok('admin oculta publicação com motivo', opp_doc and opp_doc[0]['isHidden'] is True and opp_doc[0].get('hiddenReason') == 'Em análise')
        await page.get_by_role('button', name='Resolvida', exact=True).first.click()
        await page.wait_for_timeout(600)
        reps = await mock_docs(page, 'reports/')
        ok('denúncia marcada como resolvida', reps and reps[0]['status'] == 'resolved' and reps[0].get('resolvedBy') == 'adm')
        await page.screenshot(path='shots/09-moderation.png', full_page=True)
        await page.locator('button', has_text='ECOSSISTEMA').click()
        await page.wait_for_timeout(900)
        ok('configurações do ecossistema carregam', await page.locator('text=Atendimento especializado').count() > 0)

        # 11. Desktop: navegação superior
        dctx = await b.new_context(viewport={'width': 1280, 'height': 800})
        dp = await dctx.new_page()
        dp.on('pageerror', lambda e: errors.append(f'PAGEERROR(desktop): {e}'))
        await dp.goto(f'{BASE}/ajuda')
        await dp.wait_for_timeout(1200)
        ok('desktop tem link "Ajuda Colaborativa" no topo', await dp.locator('button', has_text='Ajuda Colaborativa').count() > 0)
        await dp.screenshot(path='shots/10-desktop-ajuda.png')

        await b.close()

    print('\n==== RESUMO ====')
    passed = sum(1 for r in results if r[1])
    print(f'{passed}/{len(results)} verificações passaram')
    real_errors = [e for e in errors if 'favicon' not in e]
    print('Erros de página/console:', len(real_errors))
    for e in real_errors[:25]:
        print('  ', e[:300])
    sys.exit(0 if passed == len(results) else 1)

if __name__ == "__main__":
    asyncio.run(main())
