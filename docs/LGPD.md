# LGPD: inventário, procedimentos e pendências do responsável

Última revisão: 2026-11-11.

## 1. Inventário de dados (ROPA simplificado)

| Dado | Onde fica | Base legal | Quem acessa | Retenção |
|---|---|---|---|---|
| Cadastro (nome, e-mail, telefone, foto, cidade, perfil) | Firestore `users` | Contrato | Titular e admin | Até excluir a conta |
| Perfil público (nome, foto) | `public_profiles` | Contrato | Público | Até excluir a conta |
| Cupons resgatados | `redemptions` | Contrato | Titular, empresa, admin | Resgates não são apagados pelo titular: viram pedido `account_deleted` para o admin tratar |
| Comentários do Feed | `blog_comments` | Contrato | Público | Apagados na exclusão da conta |
| Avaliações | dentro do documento da empresa | Legítimo interesse | Público | Admin remove por pedido (`review_removal`) |
| Pedidos de empresa | `companyRequests` | Contrato | Titular e admin | Pendentes/recusados apagados na exclusão |
| Token de push | `push_tokens` | Consentimento | Servidor | Removido ao desligar notificações ou excluir conta |
| Pedidos de privacidade | `privacyRequests` | Obrigação legal | Titular e admin | 5 anos (prova de atendimento) |
| Newsletter (e-mail, datas de pedido, confirmação e cancelamento) | Firestore `newsletter_subscribers` | Consentimento (dupla confirmação) | Servidor e admin | Até o cancelamento |
| Registro de envios de e-mail (tipo, destinatário, data, resultado) | Firestore `mail_log` / `mail_limits` | Contrato / legítimo interesse | Servidor e admin | Revisar e limpar periodicamente |
| Analytics | Google Analytics | Consentimento | Equipe | Só liga com aceite |
| IP e logs de acesso | Vercel / Firebase | Obrigação legal (Marco Civil) | Infra | 6 meses |
| CPF/CNPJ para cobrança | Asaas (quando ativo) | Contrato / obrigação fiscal | Processador | Prazo fiscal |

## 2. Operadores e transferência internacional
Google (Firebase, Analytics), Vercel, Resend (e-mails), HostGator (caixa de contato), Asaas (pagamentos), OpenStreetMap (mapa), Google AI (uso só do admin, sem dados de usuários). Google e Vercel processam fora do Brasil (LGPD art. 33): manter os termos de tratamento de dados (DPA) aceitos nos consoles de cada um.

## 3. Atendimento a titulares (prazo: 15 dias)
1. A pessoa abre o pedido em /privacidade (painel "Exerça seus direitos") ou baixa o JSON com seus dados.
2. O pedido aparece em Admin → Ecossistema → "Pedidos de privacidade", com contagem de dias.
3. Atender (corrigir, apagar, exportar), escrever a resposta e marcar "Concluir". Confirmar a identidade pelo e-mail da conta.
4. Pedidos `account_deleted` listam o que sobrou (ex.: resgates): anonimizar ou apagar no console, depois concluir.

## 4. Incidente de segurança
1. Conter: revogar chaves/tokens afetados, publicar regras corretivas, trocar senhas de admin.
2. Registrar: o que vazou, de quantas pessoas, quando.
3. Avisar ANPD e titulares afetados em prazo razoável (a ANPD indica 3 dias úteis para incidentes com risco relevante) pelo canal oficial da ANPD.

## 5. O que o Yuri precisa fazer
- [ ] Publicar o `firestore.rules` atualizado no console do Firebase (aba Regras). Sem isso, pedidos de privacidade falham.
- [ ] Admin → Ecossistema → Dados legais: preencher razão social, CNPJ, endereço, e-mail de privacidade e encarregado (DPO).
- [ ] Aceitar os DPAs de Google/Firebase e Vercel nos consoles.
- [ ] Contrato/termos com o Asaas ao ativar pagamentos.
- [ ] Ligar 2FA na conta Google admin, no GitHub, na Vercel e no HostGator.
- [ ] Alerta de orçamento no Firebase/Google Cloud.
- [ ] Conferir se a lista de dados reais bate com a política (revisar uma vez por ano).

## 6. Recomendações técnicas em aberto
- O Tailwind é carregado por CDN (`index.html`): funciona, mas é uma dependência de terceiro sem versão fixa e impede uma CSP restritiva. Migrar para build com Tailwind via PostCSS e depois ativar CSP.
- Cabeçalhos de segurança já ativos em `vercel.json`: X-Frame-Options, Permissions-Policy, HSTS, nosniff, Referrer-Policy, COOP.
