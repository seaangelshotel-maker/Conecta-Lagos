"""Agenda de eventos: importação do calendário oficial, Home/Feed/Agenda, cota por plano, aprovação e ordenação por cidade.

O relógio do navegador é fixado em 11/11/2026 (o calendário oficial é de 2026), para o teste não depender do dia em que roda.
Não testa as regras do Firestore (o mock não aplica regras): isso é com tests/rules (emulador).
"""
import asyncio, datetime, os
from playwright.async_api import async_playwright
from e2e import login, logout, mock_docs, BASE

results, errors = [], []
def ok(name, cond, detail=''):
    results.append((name, bool(cond)))
    print(('PASS ' if cond else 'FAIL ') + name + (f' — {detail}' if detail and not cond else ''))

SHOTS = os.path.join(os.path.dirname(__file__), 'shots-events')
os.makedirs(SHOTS, exist_ok=True)
FEST = 'oficial-2026-festival-de-frutos-do-mar-gastronomia-e-chopp-2026-11-13'

async def shot(page, name):
    await page.screenshot(path=f'{SHOTS}/{name}.png', full_page=False)

async def agenda(page, qs=''):
    await page.goto(BASE + '/eventos' + qs); await page.wait_for_timeout(1300)

async def confirm_dialog(page, label):
    await page.get_by_role('button', name=label).last.click(); await page.wait_for_timeout(500)

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(**p.devices['iPhone 13'], timezone_id='America/Sao_Paulo', locale='pt-BR')
        page = await ctx.new_page()
        await page.clock.install(time=datetime.datetime(2026, 11, 11, 12, 0, 0))
        page.on('pageerror', lambda e: errors.append(f'PAGEERROR: {e}'))
        page.on('console', lambda m: errors.append(f'CONSOLE: {m.text}') if m.type == 'error' and 'favicon' not in m.text else None)

        # ---- 0. sem eventos nada aparece (e nada quebra) ----
        await page.goto(BASE + '/'); await page.wait_for_timeout(1200)
        ok('sem eventos: a Home não mostra a prateleira', await page.locator('[data-testid=events-shelf]').count() == 0)
        await agenda(page)
        ok('sem eventos: agenda mostra estado vazio', await page.get_by_text('Ainda não há eventos futuros').count() == 1)

        # ---- 1. admin importa o calendário oficial ----
        await login(page, 'admin@teste.com')
        await page.goto(BASE + '/admin-dashboard?view=events'); await page.wait_for_timeout(1500)
        ok('admin abre direto na agenda (?view=events)', await page.locator('[data-testid=admin-events]').count() == 1)
        await page.locator('[data-testid=import-official]').click(); await page.wait_for_timeout(300)
        await confirm_dialog(page, 'Importar')
        await page.wait_for_timeout(1500)
        docs = await mock_docs(page, 'events/')
        n_first = len(docs)
        ok('importou o calendário oficial (60+ eventos)', n_first >= 60, str(n_first))
        fest = [d for d in docs if d['path'] == f'events/{FEST}']
        ok('Festival de Frutos do Mar: 13 a 15/11, Orla da Praia Grande, publicado',
           len(fest) == 1 and fest[0]['startDate'] == '2026-11-13' and fest[0]['endDate'] == '2026-11-15'
           and fest[0]['locationName'] == 'Orla da Praia Grande' and fest[0]['status'] == 'published' and fest[0]['source'] == 'official')
        ok('feriados sem programação não entraram', not any('Finados' in d['title'] or 'Proclama' in d['title'] for d in docs))
        # edição do admin não é desfeita por nova importação
        await page.evaluate("""() => { const s = JSON.parse(sessionStorage.getItem('__mock_fs__')); s.docs['events/%s'].priceText = 'EDITADO'; sessionStorage.setItem('__mock_fs__', JSON.stringify(s)); }""" % FEST)
        await page.locator('[data-testid=import-official]').click(); await page.wait_for_timeout(300)
        await confirm_dialog(page, 'Importar'); await page.wait_for_timeout(1500)
        docs2 = await mock_docs(page, 'events/')
        ok('reimportar não duplica nem sobrescreve edições', len(docs2) == n_first and [d for d in docs2 if d['path'] == f'events/{FEST}'][0]['priceText'] == 'EDITADO')
        await page.evaluate("""() => { const s = JSON.parse(sessionStorage.getItem('__mock_fs__')); s.docs['events/%s'].priceText = 'Pratos a R$ 40'; sessionStorage.setItem('__mock_fs__', JSON.stringify(s)); }""" % FEST)
        await page.locator('[data-testid=ev-tab-official]').click(); await page.wait_for_timeout(300)
        ok('aba "Calendário oficial" lista tudo', await page.locator('[data-testid=admin-event]').count() == n_first)
        await shot(page, '10-admin-eventos')

        # ---- 2. público: Home, agenda, detalhe ----
        await logout(page)
        await page.goto(BASE + '/'); await page.wait_for_timeout(1500)
        ok('Home mostra a prateleira da agenda', await page.locator('[data-testid=events-shelf]').count() == 1)
        ok('título da prateleira sem cidade conhecida', await page.get_by_text('Agenda da Região dos Lagos').count() >= 1)
        hero = await page.locator('[data-testid=event-hero]').inner_text()
        ok('destaque da Home é o Festival de Frutos do Mar', 'Festival de Frutos do Mar' in hero and 'em 2 dias' in hero.lower(), hero[:120])
        ok('carrossel traz os próximos (7 cartões)', await page.locator('[data-testid=events-shelf] [data-testid=event-card]').count() == 7)
        await page.locator('[data-testid=events-shelf]').scroll_into_view_if_needed(); await page.wait_for_timeout(300)
        await shot(page, '20-home-agenda')

        await page.goto(BASE + '/blog'); await page.wait_for_timeout(1500)
        ok('Feed mostra a agenda', await page.locator('[data-testid=events-shelf]').count() == 1)
        await page.goto(BASE + '/blog?tipo=evento'); await page.wait_for_timeout(1500)
        ok('Feed filtrado em "Eventos" abre com a agenda', await page.locator('[data-testid=events-shelf]').count() == 1)

        await page.goto(BASE + '/'); await page.wait_for_timeout(1000)
        await page.locator('[data-testid=events-see-all]').first.click(); await page.wait_for_timeout(1200)
        ok('"Ver agenda" abre /eventos', page.url.endswith('/eventos'))
        rows = await page.locator('[data-testid=event-row]').count()
        ok('agenda lista os 10 eventos restantes de 2026', rows == 10, str(rows))
        body = await page.inner_text('body')
        ok('agrupado por mês', 'NOVEMBRO DE 2026' in body.upper() and 'DEZEMBRO DE 2026' in body.upper())
        await shot(page, '30-agenda')

        await page.locator('[data-testid=period-weekend]').click(); await page.wait_for_timeout(300)
        ok('filtro "Fim de semana" (13 a 15/11) traz só o festival', await page.locator('[data-testid=event-row]').count() == 1)
        await page.locator('[data-testid=period-all]').click()
        await page.locator('[data-testid=cat-feira]').click(); await page.wait_for_timeout(300)
        ok('filtro Feiras traz as 2 Feiras do Xaréu futuras (21/11 e 5/12)', await page.locator('[data-testid=event-row]').count() == 2)
        await page.locator('[data-testid=cat-feira]').click()
        await page.fill('[data-testid=events-search]', 'reveillon'); await page.wait_for_timeout(300)
        ok('busca sem acento acha o Réveillon', await page.locator('[data-testid=event-row]').count() == 1)
        await page.fill('[data-testid=events-search]', 'zzzz'); await page.wait_for_timeout(300)
        ok('busca sem resultado mostra estado vazio com "Limpar filtros"', await page.get_by_text('Nenhum evento com esses filtros').count() == 1)
        await page.fill('[data-testid=events-search]', '')
        n_past = await page.evaluate("() => document.querySelector('[data-testid=toggle-past]').innerText")
        await page.locator('[data-testid=toggle-past]').click(); await page.wait_for_timeout(300)
        ok('eventos passados ficam escondidos até pedir', await page.locator('[data-testid=event-row]').count() > 60, n_past)

        await agenda(page)
        await page.locator('[data-testid=event-hero]').click(); await page.wait_for_timeout(1200)
        ok('detalhe do festival', 'Festival de Frutos do Mar' in await page.locator('[data-testid=event-title]').inner_text())
        desc = await page.locator('[data-testid=event-description]').inner_text()
        ok('detalhe traz a programação confirmada (Nando Luiz, Chimarruts, Chico Chico)', all(x in desc for x in ['Nando Luiz', 'Chimarruts', 'Chico Chico']))
        dtxt = await page.inner_text('[data-testid=event-detail]')
        ok('detalhe mostra local, entrada e fonte', 'Orla da Praia Grande' in dtxt and 'Pratos a R$ 40' in dtxt and 'Fonte:' in dtxt)
        ok('festival não mostra aviso de "a confirmar"', 'ainda não foram divulgados' not in dtxt)
        await shot(page, '40-detalhe')
        async with page.expect_download() as dl:
            await page.locator('[data-testid=add-to-calendar]').click()
        path = await (await dl.value).path()
        ics = open(path, encoding='utf-8').read()
        ok('"Adicionar à agenda" baixa .ics com 13 a 15/11 (dia inteiro)', 'DTSTART;VALUE=DATE:20261113' in ics and 'DTEND;VALUE=DATE:20261116' in ics and 'SUMMARY:Festival de Frutos do Mar' in ics)
        await page.goto(BASE + '/eventos/oficial-2026-reveillon-2027-2026-12-30'); await page.wait_for_timeout(1200)
        ok('evento sem local/horário mostra o aviso de "a confirmar"', 'ainda não foram divulgados' in await page.inner_text('[data-testid=event-detail]'))
        await page.goto(BASE + '/eventos/nao-existe'); await page.wait_for_timeout(1000)
        ok('evento inexistente: mensagem amigável', await page.get_by_text('Evento não encontrado').count() == 1)

        # ---- 3. comerciante sem cota ----
        await login(page, 'ana@teste.com')
        await page.goto(BASE + '/admin-dashboard?view=events'); await page.wait_for_timeout(1500)
        ok('comerciante abre o gerenciador de eventos', await page.locator('[data-testid=merchant-events]').count() == 1)
        ok('plano sem eventos: "0 de 0" e botão travado', '0 de 0' in (await page.locator('[data-testid=event-quota]').inner_text()).lower() and await page.locator('[data-testid=new-event]').is_disabled())
        ok('avisa que o plano não inclui eventos', await page.get_by_text('não inclui eventos').count() >= 1)

        # ---- 4. admin libera 1 evento para a Ana (cota própria) ----
        await logout(page); await login(page, 'admin@teste.com')
        await page.goto(BASE + '/admin-dashboard?view=events'); await page.wait_for_timeout(1500)
        await page.locator('[data-testid=ev-tab-quotas]').click(); await page.wait_for_timeout(400)
        row = page.locator('[data-testid=quota-row]').filter(has_text='Ana')
        ok('admin vê o comerciante com a cota do plano', await row.count() == 1)
        await row.locator('input').fill('1'); await row.get_by_role('button', name='Salvar').click(); await page.wait_for_timeout(800)
        ana = (await mock_docs(page, 'users/ana'))[0]
        ok('cota do comerciante gravada (maxEvents = 1)', ana.get('maxEvents') == 1, str(ana.get('maxEvents')))

        # ---- 5. comerciante cria, dentro da cota ----
        await logout(page); await login(page, 'ana@teste.com')
        await page.goto(BASE + '/admin-dashboard?view=events'); await page.wait_for_timeout(1500)
        ok('cota liberada: "0 de 1" e botão ativo', '0 de 1' in (await page.locator('[data-testid=event-quota]').inner_text()).lower() and await page.locator('[data-testid=new-event]').is_enabled())
        await page.locator('[data-testid=new-event]').click(); await page.wait_for_timeout(400)
        await page.locator('[data-testid=event-save]').click(); await page.wait_for_timeout(300)
        ok('formulário vazio mostra erros e não salva', await page.get_by_text('Confira os campos destacados').count() == 1 and len(await mock_docs(page, 'events/')) == n_first)
        await page.fill('#ev-title', 'Forró no Barco'); await page.fill('#ev-start', '2026-11-20'); await page.fill('#ev-st', '19:30')
        await page.fill('#ev-loc', 'Praia dos Anjos'); await page.fill('#ev-desc', 'Noite de forró com passeio.')
        await shot(page, '50-form-comerciante')
        await page.locator('[data-testid=event-save]').click(); await page.wait_for_timeout(1200)
        mine = [d for d in await mock_docs(page, 'events/') if d.get('ownerId') == 'ana']
        ok('evento do comerciante entra como PENDENTE', len(mine) == 1 and mine[0]['status'] == 'pending' and mine[0]['source'] == 'merchant' and mine[0]['isFeatured'] is False, str(mine[:1]))
        ok('guarda a empresa que divulga', mine[0].get('businessName') == 'Barco Azul Passeios' and mine[0].get('businessId') == 'ana')
        ok('painel: "Aguardando aprovação" e cota cheia (1 de 1)', 'aguardando aprovação' in (await page.inner_text('[data-testid=merchant-events]')).lower() and '1 de 1' in (await page.locator('[data-testid=event-quota]').inner_text()).lower())
        ok('cota cheia trava "Novo evento"', await page.locator('[data-testid=new-event]').is_disabled())
        await shot(page, '51-painel-comerciante')
        my_id = mine[0]['id']

        # pendente não aparece para o público
        await logout(page)
        await agenda(page)
        ok('pendente NÃO aparece na agenda pública', 'Forró no Barco' not in await page.inner_text('body') and await page.locator('[data-testid=event-row]').count() == 10)

        # ---- 6. admin aprova ----
        await login(page, 'admin@teste.com')
        await page.goto(BASE + '/admin-dashboard?view=events'); await page.wait_for_timeout(1500)
        ok('admin cai nos pendentes (1)', 'Forró no Barco' in await page.inner_text('[data-testid=admin-events]') and await page.locator('[data-testid=admin-event]').count() == 1)
        await page.locator('[data-testid=approve]').click(); await page.wait_for_timeout(900)
        ev = (await mock_docs(page, f'events/{my_id}'))[0]
        ok('aprovado: publicado, com quem aprovou', ev['status'] == 'published' and ev.get('approvedBy') == 'adm')
        await logout(page)
        await agenda(page)
        ok('aprovado aparece na agenda pública (11 eventos)', await page.locator('[data-testid=event-row]').count() == 11 and 'Forró no Barco' in await page.inner_text('body'))

        # ---- 7. comerciante edita: pequeno mantém, grande volta para aprovação ----
        await login(page, 'ana@teste.com')
        await page.goto(BASE + '/admin-dashboard?view=events'); await page.wait_for_timeout(1500)
        await page.get_by_role('button', name='Editar').first.click(); await page.wait_for_timeout(300)
        await page.fill('#ev-price', 'R$ 20'); await page.locator('[data-testid=event-save]').click(); await page.wait_for_timeout(1000)
        ev = (await mock_docs(page, f'events/{my_id}'))[0]
        ok('ajuste pequeno (preço) mantém no ar', ev['status'] == 'published' and ev.get('priceText') == 'R$ 20')
        await page.get_by_role('button', name='Editar').first.click(); await page.wait_for_timeout(300)
        await page.fill('#ev-title', 'Forró no Barco 2'); await page.locator('[data-testid=event-save]').click(); await page.wait_for_timeout(1000)
        ev = (await mock_docs(page, f'events/{my_id}'))[0]
        ok('mudança grande (título) volta para aprovação', ev['status'] == 'pending' and ev['title'] == 'Forró no Barco 2')
        # cancelar libera a vaga
        await page.get_by_role('button', name='Cancelar', exact=True).first.click(); await page.wait_for_timeout(300)
        await confirm_dialog(page, 'Cancelar evento'); await page.wait_for_timeout(900)
        ev = (await mock_docs(page, f'events/{my_id}'))[0]
        ok('cancelar tira do ar e libera a vaga (0 de 1)', ev['status'] == 'cancelled' and '0 de 1' in (await page.locator('[data-testid=event-quota]').inner_text()).lower() and await page.locator('[data-testid=new-event]').is_enabled())

        # ---- 8. cota vem do plano quando o admin não define a dele ----
        await logout(page); await login(page, 'admin@teste.com')
        await page.goto(BASE + '/admin-dashboard?view=events'); await page.wait_for_timeout(1500)
        await page.locator('[data-testid=ev-tab-quotas]').click(); await page.wait_for_timeout(300)
        row = page.locator('[data-testid=quota-row]').filter(has_text='Ana')
        await row.get_by_role('button', name='Seguir plano').click(); await page.wait_for_timeout(800)
        ana = (await mock_docs(page, 'users/ana'))[0]
        ok('"Seguir plano" remove a cota própria', 'maxEvents' not in ana, str(ana.get('maxEvents')))
        await page.evaluate("""() => { const s = JSON.parse(sessionStorage.getItem('__mock_fs__')); s.docs['users/ana'].plan = 'basic'; s.docs['pricingPlans/basic'].maxEvents = 2; sessionStorage.setItem('__mock_fs__', JSON.stringify(s)); }""")
        await logout(page); await login(page, 'ana@teste.com')
        await page.goto(BASE + '/admin-dashboard?view=events'); await page.wait_for_timeout(1500)
        q = await page.locator('[data-testid=event-quota]').inner_text()
        ok('cota vem do plano Básico (0 de 2)', '0 de 2' in q.lower() and 'básico' in q.lower(), q)

        # ---- 9. cidade só ordena: nada some ----
        await logout(page); await login(page, 'admin@teste.com')
        await page.goto(BASE + '/admin-dashboard?view=events'); await page.wait_for_timeout(1500)
        await page.locator('[data-testid=admin-new-event]').click(); await page.wait_for_timeout(300)
        await page.fill('#ev-title', 'Show em Cabo Frio'); await page.select_option('#ev-city', 'cabo-frio'); await page.fill('#ev-start', '2026-11-12')
        await page.locator('[data-testid=event-save]').click(); await page.wait_for_timeout(1000)
        cf = [d for d in await mock_docs(page, 'events/') if d.get('title') == 'Show em Cabo Frio']
        ok('admin publica evento direto (sem aprovação)', len(cf) == 1 and cf[0]['status'] == 'published' and cf[0]['source'] == 'admin' and cf[0]['cityId'] == 'cabo-frio')
        await logout(page)

        await agenda(page)
        await page.select_option('[data-testid=region-chip] select', 'arraial-do-cabo'); await page.wait_for_timeout(500)
        txt = await page.inner_text('body')
        ok('em Arraial: bloco "Em Arraial do Cabo" primeiro', 'Em Arraial do Cabo' in txt and txt.index('Em Arraial do Cabo') < txt.index('Show em Cabo Frio'))
        ok('em Arraial: eventos de Cabo Frio continuam visíveis em "Outras cidades"', 'Outras cidades da região' in txt and 'Show em Cabo Frio' in txt)
        await page.goto(BASE + '/'); await page.wait_for_timeout(1500)
        ok('Home em Arraial: "Acontecendo em Arraial do Cabo"', await page.get_by_text('Acontecendo em Arraial do Cabo').count() == 1)
        ok('Home em Arraial: destaque é da cidade, mesmo havendo Cabo Frio antes', 'Festival de Frutos do Mar' in await page.locator('[data-testid=event-hero]').inner_text())
        await shot(page, '60-home-arraial')
        await agenda(page)
        await page.select_option('[data-testid=region-chip] select', 'cabo-frio'); await page.wait_for_timeout(500)
        txt = await page.inner_text('body')
        ok('em Cabo Frio: "Em Cabo Frio" vem primeiro e Arraial segue visível', 'Em Cabo Frio' in txt and txt.index('Em Cabo Frio') < txt.index('Festival de Frutos do Mar') and 'Outras cidades da região' in txt)
        await page.goto(BASE + '/'); await page.wait_for_timeout(1500)
        ok('Home em Cabo Frio: destaque é o show de Cabo Frio', 'Show em Cabo Frio' in await page.locator('[data-testid=event-hero]').inner_text())
        await agenda(page)
        await page.select_option('[data-testid=region-chip] select', 'geral'); await page.wait_for_timeout(500)
        ok('"Toda a região": sem blocos, só por data (Cabo Frio dia 12 vem antes)', 'Outras cidades da região' not in await page.inner_text('body'))
        first_row = await page.locator('[data-testid=event-row]').first.inner_text()
        ok('"Toda a região": primeiro da lista é o mais próximo no tempo', 'Show em Cabo Frio' in first_row, first_row[:80])
        ok('chips de cidade aparecem quando há mais de uma', await page.locator('[data-testid=city-cabo-frio]').count() == 1)
        await page.locator('[data-testid=city-cabo-frio]').click(); await page.wait_for_timeout(300)
        ok('filtro por cidade (usuário escolhe ver outra cidade)', await page.locator('[data-testid=event-row]').count() == 1)
        await shot(page, '61-agenda-cidade')

        # ---- 10. planos: campo de eventos aparece no admin ----
        await login(page, 'admin@teste.com')
        await page.goto(BASE + '/admin-dashboard'); await page.wait_for_timeout(1500)
        ok('tile "Agenda de eventos" no painel do admin', await page.locator('[data-testid=admin-events-tile]').count() == 1)
        ok('aba EVENTOS na barra do painel', await page.locator('[data-testid=tab-events]').count() == 1)

        fails = [r for r in results if not r[1]]
        print(f'\n{len(results) - len(fails)}/{len(results)} verificações OK')
        real_errors = [e for e in errors if 'Failed to load resource' not in e]
        print('erros de página:', real_errors[:5] if real_errors else 'nenhum')
        await b.close()
        raise SystemExit(1 if fails or real_errors else 0)

asyncio.run(main())
