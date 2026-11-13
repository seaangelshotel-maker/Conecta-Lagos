# Sistema de e-mail do Lagos GO

Envio pelo **Resend** (API HTTP, sem SDK). Caixa de entrada `comercial@lagosgo.com.br` fica no HostGator.
Sem `RESEND_API_KEY` tudo continua funcionando: os envios são ignorados sem erro.

## O que é enviado
| Quando | Para quem | Modelo |
|---|---|---|
| Primeiro login | usuário | boas-vindas (1x por usuário) |
| Esqueci a senha | usuário | link de nova senha (resposta igual exista ou não a conta) |
| Pedido de verificação | usuário | confirmar e-mail |
| Pagamento confirmado (webhook Asaas) | responsável + equipe | plano ativo |
| 7 e 1 dia antes de vencer | responsável | plano vencendo (1 aviso por faixa) |
| Plano venceu (cron diário) | responsável | voltou ao gratuito |
| Pedido de assumir empresa / contato / anúncio | equipe (+ confirmação ao usuário no pedido de empresa) | aviso interno |
| Sexta 12h UTC (9h Brasília) | inscritos ativos | newsletter semanal |

## Endpoint único: `/api/email?action=`
Público: `subscribe`, `confirm`, `unsubscribe` (GET e POST one-click), `password-reset`.
Logado: `welcome`, `verify-email`, `notify-admin`. Admin: `status`, `test`, `newsletter-preview`, `newsletter-send`.
Cron: `cron-newsletter` (Bearer `CRON_SECRET`).

## Variáveis na Vercel
| Nome | Obrigatória | Exemplo |
|---|---|---|
| `RESEND_API_KEY` | sim | `re_...` |
| `MAIL_FROM` | não | `Lagos GO <comercial@lagosgo.com.br>` |
| `MAIL_REPLY_TO` | não | `comercial@lagosgo.com.br` |
| `MAIL_ADMIN_TO` | não | e-mails da equipe, separados por vírgula |
| `MAIL_SECRET` | não | assina links; padrão = `CRON_SECRET` |
| `NEWSLETTER_AUTO` | não | `false` desliga o envio automático de sexta |

## DNS (HostGator) para o Resend
Verifique o domínio no Resend usando um **subdomínio** de envio (ex.: `send.lagosgo.com.br`): os registros DKIM/SPF/MX do Resend ficam nele e **não mexem** no e-mail comercial@ (MX/SPF da raiz).
Depois do "Verified", defina `RESEND_API_KEY` e faça um envio de teste em Admin → E-mails.

## Dados
`newsletter_subscribers` (status pending/active/unsubscribed), `mail_log`, `mail_limits`: só o servidor acessa (regras do Firestore negam o resto).
Newsletter: confirmação em duas etapas, cabeçalhos `List-Unsubscribe`, não envia se não houver conteúdo.
