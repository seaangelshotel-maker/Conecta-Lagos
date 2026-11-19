# Fotos do Feed (prévia + crédito)

Como as fotos das dicas são escolhidas e publicadas.

1. **Busca**: no Chrome, a partir de uma página do lagosgo.com.br, consulta à API do Wikimedia Commons
   (`commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&prop=imageinfo&iiprop=url|extmetadata`)
   com o nome do lugar. Vem autor e licença de cada foto (`extmetadata`).
2. **Escolha**: monta-se uma grade de miniaturas numeradas e olha-se cada foto; só entra a que mostra de fato o lugar.
3. **Registro**: a escolha vai em `data/privateFeedPreviews.ts` (chave secreta, endereço, autor, licença, página da fonte).
4. **Prévia**: `https://lagosgo.com.br/previa-dica/<id-da-dica>?k=<chave>` — noindex, fora do Google.
5. **Aprovação**: aprovada, coloca-se imageUrl + imageCredit na dica (Admin) e apaga-se a linha do arquivo.
6. Licença não aberta (ou duvidosa) = `needsPermission: true` + `permissionNote`; só publica com autorização do autor.
