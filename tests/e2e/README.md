# Testes de navegador (ponta a ponta)

Executa a interface real da Lagos GO no Chromium (Playwright), em tela de celular,
com o **Firebase simulado em memória** (`mocks/`). Serve para validar telas, rotas,
formulários e o fluxo de dados da Ajuda Colaborativa, do hub da conta, do painel da
empresa e da moderação — **sem tocar no banco de produção**.

> Não testa as regras de segurança do Firestore (o mock não aplica regras).
> Para isso use o emulador do Firebase (ver `docs/TESTES.md`).

## Como rodar

```bash
npm install                      # precisa de esbuild e tailwindcss em node_modules
pip install playwright && playwright install chromium
node tests/e2e/build.mjs         # empacota o app com os mocks
node tests/e2e/tw.mjs            # gera o CSS (Tailwind v4) a partir das classes usadas
python3 tests/e2e/prepare-html.py
node tests/e2e/serve.mjs &       # http://localhost:5178
(cd tests/e2e && python3 e2e.py && python3 e2e_existing.py && python3 e2e_feed.py)   # 77 verificações; capturas em shots/
```

Variável `NM` aponta para outra pasta `node_modules`, se necessário.
