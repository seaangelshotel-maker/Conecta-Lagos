/**
 * Jornada do plano: em vez de uma lista seca, cada recurso vira um passo com "o que é" e "o que você ganha".
 * O preço só aparece no último passo. Puro (sem Firebase), então é testável.
 */
import { canOrder } from './orderModel';

export type StepIcon = 'store' | 'ticket' | 'calendar' | 'star' | 'images' | 'menu' | 'orders' | 'chat' | 'social' | 'gift';
export interface JourneyStep { id: string; icon: StepIcon; title: string; what: string; gain: string }

interface PlanLike {
  maxCoupons?: number; maxEvents?: number; isFeatured?: boolean; showGallery?: boolean; showMenu?: boolean;
  showOrders?: boolean; showChat?: boolean; showSocialMedia?: boolean; extra?: string;
}

export const journeySteps = (plan: PlanLike): JourneyStep[] => {
  const steps: JourneyStep[] = [{
    id: 'ficha', icon: 'store', title: 'Sua página no guia',
    what: 'Uma página só da sua empresa, com fotos, telefone, endereço e horário de funcionamento.',
    gain: 'Quem procura onde comer, ficar ou passear encontra você e já sabe como chegar e falar com você.',
  }];
  if ((plan.maxCoupons ?? 0) > 0) steps.push({
    id: 'cupons', icon: 'ticket', title: `Cupons para atrair clientes (até ${plan.maxCoupons})`,
    what: 'Você cria ofertas e o cliente resgata pelo app. Você define o desconto e a validade.',
    gain: 'Dá um motivo para a pessoa escolher a sua empresa e você acompanha quantos resgates tiveram.',
  });
  if ((plan.maxEvents ?? 0) > 0) steps.push({
    id: 'eventos', icon: 'calendar', title: `Agenda de eventos (até ${plan.maxEvents})`,
    what: 'Divulgue música ao vivo, festas e promoções na agenda da Região dos Lagos.',
    gain: 'Seu evento aparece para quem está procurando o que fazer, não só para quem já te segue.',
  });
  if (plan.isFeatured) steps.push({
    id: 'destaque', icon: 'star', title: 'Destaque nas pesquisas',
    what: 'Sua empresa aparece na frente quando alguém pesquisa na sua categoria e cidade.',
    gain: 'Mais gente vê a sua empresa antes dos concorrentes.',
  });
  if (plan.showGallery) steps.push({
    id: 'galeria', icon: 'images', title: 'Galeria de fotos completa',
    what: 'Mostre o ambiente, os pratos, os quartos ou os serviços em várias fotos.',
    gain: 'O cliente decide mais rápido quando vê o lugar antes de ir.',
  });
  if (plan.showMenu) steps.push({
    id: 'cardapio', icon: 'menu', title: 'Cardápio digital',
    what: 'Seu cardápio ou lista de serviços organizado dentro da sua página, sem precisar de PDF.',
    gain: 'O cliente confere os itens e preços pelo celular, e você atualiza quando quiser.',
  });
  if (canOrder(plan as any)) steps.push({
    id: 'pedidos', icon: 'orders', title: 'Pedidos direto no seu WhatsApp',
    what: 'O cliente monta o pedido na sua página e ele chega pronto no seu WhatsApp.',
    gain: 'Sem comissão sobre as vendas: o pedido e o cliente ficam 100% com você.',
  });
  if (canOrder(plan as any) && plan.showChat === true) steps.push({
    id: 'chat', icon: 'chat', title: 'Chat com clientes dentro do app',
    what: 'Se preferir, atenda o pedido por um chat dentro do Lagos GO, em vez do WhatsApp. Você escolhe o canal.',
    gain: 'Conversas organizadas e protegidas, com aviso para você quando chega mensagem nova.',
  });
  if (plan.showSocialMedia) steps.push({
    id: 'redes', icon: 'social', title: 'Suas redes sociais na página',
    what: 'Links do Instagram, Facebook e site da sua empresa na sua página.',
    gain: 'Quem gostou de você no guia continua acompanhando você nas redes.',
  });
  const extras = String(plan.extra || '').split('\n').map(x => x.trim()).filter(Boolean);
  if (extras.length) steps.push({
    id: 'bonus', icon: 'gift', title: 'Bônus deste plano',
    what: extras.join(' · '),
    gain: 'Vem incluso no mesmo valor, sem custo extra.',
  });
  return steps;
};

export type FunnelStage = 'viewing' | 'cadastro' | 'price' | 'checkout';
const RANK: Record<FunnelStage, number> = { viewing: 0, cadastro: 1, price: 2, checkout: 3 };
/** A etapa só sobe (voltar um passo não apaga o quanto a pessoa avançou). */
export const maxStage = (a: FunnelStage | undefined, b: FunnelStage): FunnelStage => (a && RANK[a] > RANK[b] ? a : b);
export const funnelDocId = (uid: string, planId: string): string => `${uid}_${planId}`;
export const STAGE_LABEL: Record<FunnelStage, string> = { viewing: 'Parou nos benefícios', cadastro: 'Parou no cadastro da empresa', price: 'Viu o preço e parou', checkout: 'Foi para o pagamento' };
/** "Abandonou" = não foi ao pagamento e ficou parado há mais de 1 hora. */
export const isAbandoned = (f: { stage: FunnelStage; updatedAt: string }, now = Date.now()): boolean =>
  f.stage !== 'checkout' && now - new Date(f.updatedAt).getTime() > 3_600_000;

/** Lembrete do que a pessoa ganha, mostrado em cada passo do cadastro da empresa (1 a 4). */
export const cadastroHint = (plan: PlanLike & { name?: string }, step: number): string => {
  const ids = journeySteps(plan);
  const by = (id: string) => ids.find(x => x.id === id);
  if (step === 1) return by('ficha')!.gain;
  if (step === 2) return 'Com o endereço e o ponto no mapa, o cliente traça a rota até você com um toque.';
  if (step === 3) return by('galeria') ? `${by('galeria')!.what} ${by('galeria')!.gain}` : 'A foto de capa é a primeira coisa que o cliente vê na sua página.';
  const ped = by('pedidos');
  if (ped) return `${ped.gain}${by('chat') ? ' E, se preferir, atenda também pelo chat do app.' : ''}`;
  return 'Seu WhatsApp aparece na sua página para o cliente chamar você direto.';
};
