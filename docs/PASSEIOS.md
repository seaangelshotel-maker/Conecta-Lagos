# Passeios e reservas

- **Menu:** a aba "Passeios" substituiu a "Ajuda" na barra do app. A Ajuda colaborativa continua no menu lateral e num atalho no rodapé da Home.
- **Quem cria:** só o administrador (Painel → PASSEIOS). Escolhe a operadora (Guida Trips por padrão, empresas da categoria Passeios ou outra), define fotos, descrição, preço por pessoa (opcional), vagas por saída, mínimo/máximo por reserva, antecedência e a **agenda**: dias da semana, horários, temporada, datas sem saída e saídas extras. Em "Saídas" fecha/reabre uma saída específica.
- **Cliente:** Passeios → passeio → calendário (verde = com vaga, riscado = lotado) → horário → pessoas, nome e WhatsApp → "Pedir reserva". Precisa estar logado. Não há pagamento: a operadora confirma e combina o pagamento pelo WhatsApp.
- **Vagas:** pedido pendente já ocupa vaga; cancelar (cliente ou admin) devolve. Reserva e contador da saída são gravados na mesma transação, e as regras do Firestore impedem passar da capacidade.
- **Admin → Reservas:** confirmar, cancelar e chamar o cliente no WhatsApp.
- **Código:** regras puras em `services/tourRules.ts` (`tests/tourRules.test.ts`), Firestore em `services/tourService.ts`, telas em `pages/Tours.tsx`, `pages/TourDetail.tsx`, `pages/MyBookings.tsx`, `components/TourCalendar.tsx`, painel em `components/admin/ToursManager.tsx`. Coleções: `tours`, `tourSlots`, `tourBookings`.
- **Publicar `firestore.rules`** (Console → Firestore → Regras) antes de usar: sem isso a lista de passeios não carrega e as reservas são negadas. Testes das regras: `tests/rules/firestore.rules.spec.ts` (bloco "Passeios"; precisam do emulador).
