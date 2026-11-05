# Guida Trips dentro do ecossistema Lagos GO

A Guida Trips é uma **operação especializada** (curadoria, concierge, experiências) dentro do
ecossistema. Não é concorrente da Lagos GO e não recebe privilégios ocultos.

## O que existe no código

| Recurso | Onde | Como funciona |
| --- | --- | --- |
| Encaminhamento para atendimento especializado | `components/SpecialistReferral.tsx` (Início e perfil de quem marcou "Estou visitando") | Aparece só se ativado em *Admin → Ecossistema*. Botão identificado como "operação do ecossistema Lagos GO". |
| Configuração | `app_settings/global.specialistReferral` | Nome, descrição, WhatsApp e/ou link. Nada fixo no código. |
| Rastreamento de origem | `interactions` (`type: specialist_referral`, `source: home/profile`) | Cada clique vira evento sem dados pessoais. Links externos recebem `utm_source=lagosgo&utm_medium=<origem>`. |
| Publicação de experiências/roteiros | Ajuda Colaborativa (tipo "Ofereço meus serviços") e, futuramente, coleções | A Guida Trips pode publicar como qualquer participante, com as mesmas regras. |
| Contratação de parceiros | Ajuda Colaborativa | A Guida Trips pode publicar necessidades (barco, guia, hospedagem) para os parceiros da rede. |

## Regras de convivência (implementadas)

- O botão não altera a ordem do guia, os destaques nem as coleções.
- Identificação explícita como operação do ecossistema.
- Mesmas regras de publicação, denúncia e moderação dos demais participantes.

## O que **não** foi implementado (decisão pendente)

- Relação financeira entre Lagos GO e Guida Trips (comissão, repasse, contrato). Deve ser
  definida por escrito e, quando houver, configurada — não calculada automaticamente nesta etapa.
- Venda de roteiros/experiências com pagamento dentro da plataforma (depende de `docs/PAGAMENTOS.md`).
- Integração de sistemas (API) com a plataforma da Guida Trips.
