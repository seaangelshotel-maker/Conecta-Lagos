# Configuração do ambiente (Vercel e Firebase)

| Variável (Vercel) | Para quê | Obrigatória |
| --- | --- | --- |
| `SITE_URL` | Domínio oficial (ex.: `https://lagosgo.com.br`) usado no sitemap, robots e canônicos do servidor | Ao ligar o domínio |
| `VITE_SITE_URL` | Mesmo domínio, para os canônicos gerados no navegador | Ao ligar o domínio |
| `VITE_FIREBASE_VAPID_KEY` | Chave "Web Push" do Firebase (Cloud Messaging → Certificados push da Web) | Para notificações |
| `FIREBASE_SERVICE_ACCOUNT` | JSON da conta de serviço do Firebase | Para enviar notificações e para pagamentos |
| `GEMINI_API_KEY` | IA do painel | Opcional |
| `PAYMENTS_ENABLED`, `ASAAS_API_KEY`, `ASAAS_WEBHOOK_TOKEN`, `ASAAS_ENV` | Pagamentos (ver PAGAMENTOS.md) | Para cobrar |

## Firebase
- Publicar `firestore.rules` sempre que o arquivo mudar (Console → Firestore → Regras).
- Search Console: verificar o domínio e enviar `https://SEU_DOMINIO/sitemap.xml`.
- Restringir a chave web do Firebase aos domínios do site (Google Cloud → Credenciais).
