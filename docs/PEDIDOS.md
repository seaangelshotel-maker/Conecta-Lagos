# Pedidos por WhatsApp (cardápio e serviços)

- **O que é:** o cliente monta o pedido no perfil da empresa e o app abre o WhatsApp da loja com a mensagem pronta. Sem pagamento e sem comissão; o fechamento acontece na conversa.
- **Quem tem:** planos com a opção **Pedidos por WhatsApp** (Admin → Planos). Planos antigos sem a opção: qualquer plano pago com cardápio. Plano gratuito só exibe o cardápio.
- **Empresário:** painel → Cardápio. Escolhe "Cardápio" ou "Serviços", informa o WhatsApp que recebe os pedidos (vazio = WhatsApp do perfil), marca "Receber pedidos pelo app" e cadastra seções/itens (preço, descrição, disponível/esgotado).
- **Cliente:** cardápio → quantidades → carrinho → nome + (retirada/entrega com endereço, ou data e nº de pessoas para serviços) → "Enviar pelo WhatsApp".
- **Métricas:** cada envio vira o evento `order_sent` (aparece em "Pedidos" nas métricas da empresa). O app não sabe se o pedido foi fechado.
- **Código:** `services/orderModel.ts` (regras puras, `tests/orderModel.test.ts`), `pages/BusinessDetail.tsx` (carrinho), `pages/AdminDashboard.tsx` (editor), e2e em `tests/e2e/e2e_orders.py` e `e2e_register.py`.
