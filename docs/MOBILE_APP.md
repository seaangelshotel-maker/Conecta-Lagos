# Lagos GO — preparação para Android e iOS

Atualizado em 08/nov/2026. Nada foi enviado às lojas; este documento registra o que já está pronto e o que depende da etapa nativa.

## Decisão técnica: Capacitor
- **Por quê:** o app já é Vite + React + Firebase JS. O Capacitor empacota exatamente o `dist/` em Android e iOS, aceita plugins nativos por demanda e não exige reescrever telas (React Native/Flutter exigiriam). Alternativas descartadas: TWA/PWA puro (não cobre App Store), Cordova (legado), React Native (reescrita).
- **Risco Apple (diretriz 4.2 "funcionalidade mínima"):** um site dentro de WebView costuma ser recusado. Por isso a etapa nativa deve entregar valor próprio: push, compartilhamento nativo, localização, câmera para fotos de Ajuda Colaborativa/avaliações, abertura por link profundo e uso básico offline. A camada de ponte já está pronta; os plugins entram na etapa nativa.
- **Login:** e-mail e senha funcionam na WebView. Login com Google precisa de plugin nativo (o pop-up do Firebase não funciona em WebView). Se houver login social em terceiros no iOS, a Apple exige também "Entrar com Apple".

## O que já está pronto no código
| Requisito | Estado | Onde |
|---|---|---|
| Navegador móvel e PWA | Pronto (manifest, service worker, página offline, ícones) | `public/manifest.webmanifest`, `public/sw.js`, `public/offline.html` |
| Navegação compatível com WebView | Pronto: roteador próprio sobre `history.pushState`, sem recarregar | `App.tsx` |
| Links profundos | Pronto no app: `lagosgo://guia/slug` e links https do domínio abrem a tela certa; outros hosts e esquemas são recusados | `services/native.ts` (`toAppPath`), `tests/native.test.ts` |
| Botão voltar do Android | Pronto: volta no histórico; na tela inicial fecha o app | `bindNativeEvents` |
| Áreas seguras (notch/barra home) | Pronto: `viewport-fit=cover`, `env(safe-area-inset-*)` na barra inferior, banner offline e folhas | `index.html`, `NavBar.tsx` |
| Teclado virtual | Pronto: barra de abas some com o teclado aberto | `watchKeyboard`, CSS `.kb-open` |
| Compartilhamento | Pronto: plugin nativo se existir, senão `navigator.share`, senão copia o link | `shareContent` (matérias, posts) |
| Links externos | Pronto: `openExternal` (navegador do sistema no app, nova aba sem `opener` na web) | `services/native.ts` |
| Sem conexão / instabilidade | Aviso discreto + service worker serve o que já foi carregado | `OfflineBanner.tsx`, `sw.js` |
| Carregamento eficiente | Páginas carregadas sob demanda (lazy), feed paginado em 8 itens, cache de assets com hash | `App.tsx`, `feedService.ts` |
| Sessão e autenticação | Firebase Auth com persistência local; funciona em WebView | `services/firebase.ts` |
| Configuração do container | `capacitor.config.json` (appId `org.lagosgo.app`, esquemas https, domínios permitidos, teclado, barra de status) | raiz |

A ponte usa o objeto global `Capacitor` injetado pelo container, sem importar o Capacitor no bundle web: o site continua idêntico no navegador.

## O que depende da etapa nativa (não feito)
1. Instalar dependências (a rede deste ambiente de desenvolvimento não alcançou o registro npm, por isso o `package.json` ainda não as contém):
   `npm i @capacitor/core @capacitor/app @capacitor/share @capacitor/browser @capacitor/keyboard @capacitor/status-bar @capacitor/splash-screen` e `npm i -D @capacitor/cli @capacitor/android @capacitor/ios`.
2. `npx cap add android` e `npx cap add ios`; `npm run build && npx cap sync`. Android exige Android Studio/JDK; iOS exige Mac com Xcode.
3. Importar os plugins uma vez no ponto de entrada nativo (ex.: `import '@capacitor/app'`) para que registrem em `Capacitor.Plugins`.
4. Links profundos verificados: publicar `/.well-known/assetlinks.json` (Android, com a impressão digital do certificado de assinatura) e `/.well-known/apple-app-site-association` (iOS, com o Team ID). Não foram criados agora porque dependem das credenciais reais.
5. Notificações push: Firebase Cloud Messaging (Android) e APNs (iOS), com `@capacitor/push-notifications`. Pedir permissão só ao usuário ativar alertas, nunca na abertura.
6. Geolocalização (`@capacitor/geolocation`), câmera (`@capacitor/camera`) e armazenamento local (`@capacitor/preferences`) quando a funcionalidade correspondente for ao ar. Nenhuma permissão é declarada antes disso.
7. Ícones e telas de abertura nativos (`@capacitor/assets`), política de privacidade publicada, declarações de dados das lojas e contas de desenvolvedor.
8. Testes em aparelhos reais (Android e iPhone) e ajuste de desempenho da WebView.

## Pontos de extensão financeiros
Nenhum fluxo de pagamento, plano, comissão ou checkout foi alterado. Compras digitais dentro do app iOS têm regras próprias da Apple; qualquer decisão comercial permanece com o Yuri.
