# Lançamento — o que falta (auditoria de 11/nov/2026)

Estado do site no ar (https://conecta-lagos-one.vercel.app) conferido em produção: 166 lugares, 41 matérias, **5 cupons**.
`/api/health`: pagamentos desligados, push desligado, IA desligada, `siteUrl` vazio.

## Bloqueia o lançamento
1. **Dados legais vazios.** `app_settings/legal` não existe: Privacidade e Termos saem sem responsável/CNPJ/contato.
   → Painel → Ecossistema → Legal: preencher razão social/nome, CNPJ ou CPF, e-mail de contato (LGPD) e endereço.
2. **WhatsApp comercial não configurado.** `app_settings/global.salesWhatsapp` não existe: "Assinar" mostra "contato não configurado".
   → Painel → Ecossistema: preencher o WhatsApp de vendas.
3. **Conteúdo: só 5 cupons.** A promessa do app é "quanto você economiza". Meta antes de abrir: 15 a 20 comerciantes com cupom real.
   → Usar o teste grátis de cortesia (90 dias) para trazê-los; aprovar os cupons no painel.
4. **Planos bagunçados (6 ativos).** "Basico Teste" R$ 0,50 visível ao público; dois "Premium" (R$ 189 com 5 cupons e R$ 199,90 com 50); "Planos Standard" antigo; nenhum com limite de eventos.
   → Deixar 3 planos (Básico, Pro, Premium), desativar o resto, definir cupons, eventos e destaque; definir o padrão de "sem plano" em Planos → Limites por cliente.
5. **Domínio e variáveis.** Domínio ainda não comprado (lagosgo.com.br). Ao ter o domínio: conectar na Vercel; criar `VITE_APP_URL` e `SITE_URL`; autorizar o domínio no Firebase Auth (senão o login Google quebra); atualizar o webhook do Asaas.
6. **Firebase no plano grátis (Spark).** Limites diários de ~50 mil leituras e ~20 mil escritas: um dia bom de divulgação estoura. → Migrar para Blaze (pagar o que usar) com alerta de orçamento (ex.: R$ 50/mês).
7. **Vercel.** O plano Hobby é só para uso não comercial; um app que cobra assinatura deve estar no Pro. Conferir o plano da conta.
8. **Conta de administrador.** `sea.angelshotel@gmail.com` é a chave de tudo: ligar verificação em duas etapas e ter e-mail de recuperação.

## Importante (primeira semana)
- **Push desligado em produção:** faltam `FIREBASE_SERVICE_ACCOUNT` (Vercel) e `VITE_FIREBASE_VAPID_KEY`. Sem isso o aviso semanal só vira texto de WhatsApp.
- **Rotina de planos vencidos** (`/api/expire-plans`, diária): precisa de `CRON_SECRET` e `FIREBASE_SERVICE_ACCOUNT`. Até lá, usar o botão em Planos.
- **Pagamentos Asaas:** conta aprovada → sandbox → produção (docs/PAGAMENTOS.md). No começo, contratar pelo WhatsApp e ativar o plano à mão funciona.
- **Monitoramento:** sem registro de erros nem alerta de queda. Ligar monitor de uptime gratuito e avisos de erro.
- **Backup:** agendar exportação do Firestore (exige Blaze).
- **Segurança:** restringir a chave web do Firebase ao domínio (Google Cloud → Credenciais); apagar ou deixar privado o repositório antigo público `yuriguida30/conectario`; rodar os testes de regras com o emulador (nunca rodaram neste ambiente); considerar App Check.
- **Moderação:** definir quem aprova cupons, avaliações e Ajuda Colaborativa, e com que frequência (cupom editado volta para aprovação).
- **Teste em celular real** (Android e iPhone) dos fluxos: cadastro, pegar cupom, comerciante confirmar código, agenda.
- **Remoto do git mudou:** o GitHub avisa que o repositório agora é `seaangelshotel-maker/Conecta-Lagos`.

## Depois (app nas lojas)
Conta Apple Developer (US$ 99/ano) e Google Play (US$ 25 única); gerar `android/` e `ios/`; login Google sem popup no app; ícones e capturas de tela; push nativo; ver docs/MOBILE_APP.md.

## Já pronto
Carteira de economia confiável, agenda de eventos, limites de cupons/eventos por plano e por cliente, plano vencido rebaixa, cupom editado volta para aprovação, LGPD (privacidade, termos, exclusão de conta), SEO (sitemap, robots, páginas para robôs), regras do Firestore publicadas.
