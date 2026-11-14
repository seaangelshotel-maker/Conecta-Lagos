# Lagos GO no Google Play (Android, site em app / TWA)

Atualizado em 13/nov/2026. Decisão: **TWA** (o app abre o próprio lagosgo.com.br em tela cheia pelo Chrome). Atualiza sozinho com o site, o login com Google funciona e não precisa de código nativo. O Capacitor fica para o iPhone.

- Pacote: `org.lagosgo.app`
- Conta Google Play: **pessoal, criada há mais de 10 anos** → **não precisa** do teste fechado de 12 testadores/14 dias (a exigência vale só para contas pessoais novas). Publica direto em produção; confirme no Play Console, em Painel, se ele pedir o teste.
- Já pronto no site: manifesto com `id`, ícones (192, 512 e maskable), service worker, página offline, política de privacidade (`/privacidade`) e exclusão de conta (`/excluir-conta`, exigida pelo Google).

## Passo a passo
1. **Play Console → Criar app**: nome "Lagos GO", idioma português (Brasil), tipo "App", gratuito.
2. **Gerar o pacote**: pwabuilder.com → site `https://lagosgo.com.br` → "Package for stores" → Android. Package ID `org.lagosgo.app`, "Signing key: new". Baixar o zip e **guardar a chave de assinatura e a senha** (sem ela não dá para atualizar o app).
3. **Enviar o `.aab`** em Produção → Criar versão (ou em Teste interno primeiro, para você testar no seu celular). Ativar "Play App Signing" quando perguntar.
4. **Link verificado (some a barra do Chrome)**: no Play Console, Configuração → Integridade do app → copiar a impressão digital SHA-256 do certificado de assinatura. Mandar para o time técnico, que publica `/.well-known/assetlinks.json`.
5. **Teste interno (recomendado)**: adicione o seu Gmail como testador e instale pelo link antes de mandar para produção.
6. **Ficha da loja** (textos abaixo), classificação de conteúdo, público-alvo (18+ é o mais simples), segurança dos dados e URL da política de privacidade.
7. **Enviar para análise** em Produção. A primeira análise do Google costuma levar de 1 a 7 dias.

## Textos da ficha
**Nome:** Lagos GO

**Descrição curta (até 80):** Passeios, restaurantes, cupons e eventos da Região dos Lagos.

**Descrição completa:**
O Lagos GO é o guia local da Região dos Lagos (RJ): Arraial do Cabo, Cabo Frio e Búzios.

• Guia de lugares: praias, restaurantes, passeios, hospedagens e comércio, com telefone, endereço, horários e rota.
• Cupons de desconto de empresas parceiras, com carteira para ver quanto você já economizou.
• Agenda de eventos da região, com opção de adicionar ao calendário.
• Matérias e dicas de quem conhece a região.
• Ajuda colaborativa entre moradores e visitantes.

Para empresas: cadastre seu negócio, publique cupons e acompanhe quem usa.

**Categoria:** Viagens e local
**E-mail de contato:** comercial@lagosgo.com.br
**Site:** https://lagosgo.com.br
**Política de privacidade:** https://lagosgo.com.br/privacidade
**Exclusão de conta:** https://lagosgo.com.br/excluir-conta

## Imagens necessárias
- Ícone 512×512: `public/icons/icon-512.png` (pronto).
- Imagem de destaque 1024×500 (pronta).
- Capturas de tela do celular: pelo menos 2 (ideal 4 a 8), do app aberto no celular: Início, Guia, uma ficha de empresa, Cupons, Eventos.
