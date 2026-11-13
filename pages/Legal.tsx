import React, { useEffect, useState } from 'react';
import { ArrowLeft, ShieldCheck, FileText, UserX, Loader2 } from 'lucide-react';
import { User } from '../types';
import { SEO } from '../components/SEO';
import { useLegalSettings, LEGAL_VERSION, LegalSettings } from '../services/legalService';
import { getConsent, setConsent } from '../services/consent';
import { deleteMyAccount } from '../services/accountService';
import { createPrivacyRequest, downloadMyData, getMyPrivacyRequests, PrivacyRequest, PRIVACY_TYPE_LABEL, PrivacyRequestType, USER_REQUEST_TYPES, privacyDaysLeft } from '../services/privacyService';

type Nav = (page: string, params?: any) => void;

const fmtDate = (iso: string) => { const [y, m, d] = iso.split('-'); return `${d}/${m}/${y}`; };

/** Identificação do responsável; mostra só o que o admin preencheu. */
const Controller: React.FC<{ legal: LegalSettings }> = ({ legal }) => {
  const lines = [
    legal.companyName && `Razão social: ${legal.companyName}`,
    legal.tradeName && `Nome da plataforma: ${legal.tradeName}`,
    legal.cnpj && `CNPJ: ${legal.cnpj}`,
    legal.address && `Endereço: ${legal.address}`,
    legal.dpoName && `Encarregado pelo tratamento de dados (DPO): ${legal.dpoName}`,
  ].filter(Boolean) as string[];
  return (
    <ul className="space-y-1 text-[15px] text-slate-700" data-testid="legal-controller">
      {lines.map(l => <li key={l}>{l}</li>)}
      <li>Contato sobre privacidade: {legal.privacyEmail
        ? <a className="text-ocean-600 font-bold" href={`mailto:${legal.privacyEmail}`}>{legal.privacyEmail}</a>
        : <>pelo painel "Exerça seus direitos" abaixo (item 6) ou pelo e-mail <a className="text-ocean-600 font-bold" href="mailto:comercial@lagosgo.com.br">comercial@lagosgo.com.br</a></>}</li>
    </ul>
  );
};

const Shell: React.FC<{ title: string; icon: React.ReactNode; onNavigate: Nav; children: React.ReactNode; testId: string; seoUrl: string; seoDesc: string }> = ({ title, icon, onNavigate, children, testId, seoUrl, seoDesc }) => (
  <div className="min-h-screen bg-slate-50 pb-28 font-sans" data-testid={testId}>
    <SEO title={title} description={seoDesc} url={seoUrl} />
    <div className="max-w-3xl mx-auto px-4 pt-6">
      <button onClick={() => onNavigate('home')} className="flex items-center gap-1.5 text-xs font-black text-ocean-600 uppercase"><ArrowLeft size={14} /> Início</button>
      <div className="mt-4 flex items-center gap-3">
        <span className="w-12 h-12 rounded-2xl bg-ocean-50 text-ocean-600 flex items-center justify-center">{icon}</span>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-ocean-950 tracking-tight">{title}</h1>
          <p className="text-xs text-slate-500">Versão de {fmtDate(LEGAL_VERSION)}</p>
        </div>
      </div>
      <article className="mt-6 bg-white rounded-3xl border border-slate-100 p-5 md:p-8 space-y-6 legal">{children}</article>
    </div>
  </div>
);

const H: React.FC<{ children: React.ReactNode }> = ({ children }) => <h2 className="text-lg font-black text-ocean-950 mt-2">{children}</h2>;
const P: React.FC<{ children: React.ReactNode }> = ({ children }) => <p className="text-[15px] text-slate-700 leading-relaxed">{children}</p>;
const L: React.FC<{ items: React.ReactNode[] }> = ({ items }) => (
  <ul className="space-y-1.5">{items.map((x, i) => <li key={i} className="flex gap-2 text-[15px] text-slate-700 leading-relaxed"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-ocean-600 shrink-0" /><span>{x}</span></li>)}</ul>
);

/** Painel do titular: baixar os próprios dados e abrir pedidos (LGPD, art. 18). */
const RightsPanel: React.FC<{ user: User | null; onNavigate: Nav }> = ({ user, onNavigate }) => {
  const [busy, setBusy] = useState(false);
  const [type, setType] = useState<PrivacyRequestType>('access');
  const [text, setText] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [mine, setMine] = useState<PrivacyRequest[]>([]);
  const load = () => { if (user) getMyPrivacyRequests(user.id).then(setMine).catch(() => setMine([])); };
  useEffect(load, [user?.id]);
  if (!user) return (
    <div className="rounded-2xl bg-ocean-50 p-4 text-sm text-ocean-900" data-testid="rights-login">
      Para baixar seus dados ou abrir um pedido, <button className="font-black text-ocean-600" onClick={() => onNavigate('login')}>entre na sua conta</button>.
    </div>
  );
  const download = async () => {
    setBusy(true); setMsg(null);
    try { await downloadMyData(); setMsg({ ok: true, text: 'Pronto! O arquivo foi baixado no seu aparelho.' }); }
    catch (e: any) { setMsg({ ok: false, text: e?.message || 'Não foi possível gerar o arquivo agora. Tente de novo.' }); }
    finally { setBusy(false); }
  };
  const send = async () => {
    if (text.trim().length < 5) { setMsg({ ok: false, text: 'Conte em poucas palavras o que você precisa.' }); return; }
    setBusy(true); setMsg(null);
    try {
      await createPrivacyRequest(type, text, { userId: user.id, userName: user.name || 'Usuário', email: user.email || '' });
      setText(''); setMsg({ ok: true, text: 'Pedido enviado. Respondemos em até 15 dias.' }); load();
    } catch { setMsg({ ok: false, text: 'Não foi possível enviar agora. Tente de novo em instantes.' }); }
    finally { setBusy(false); }
  };
  return (
    <div className="rounded-2xl border border-ocean-100 bg-ocean-50/40 p-4 space-y-3" data-testid="rights-panel">
      <p className="text-sm font-black text-ocean-950">Exerça seus direitos</p>
      <button onClick={download} disabled={busy} data-testid="rights-download"
        className="px-4 h-10 rounded-full text-xs font-black bg-ocean-600 text-white disabled:opacity-50">Baixar meus dados (JSON)</button>
      <div className="space-y-2">
        <select value={type} onChange={e => setType(e.target.value as PrivacyRequestType)} data-testid="rights-type" aria-label="Tipo de pedido"
          className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm">
          {USER_REQUEST_TYPES.map(t => <option key={t} value={t}>{PRIVACY_TYPE_LABEL[t]}</option>)}
        </select>
        <textarea value={text} onChange={e => setText(e.target.value)} maxLength={2000} rows={3} data-testid="rights-text" aria-label="Detalhes do pedido"
          placeholder="Explique o que você precisa" className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm" />
        <button onClick={send} disabled={busy} data-testid="rights-send" className="px-4 h-10 rounded-full text-xs font-black bg-slate-900 text-white disabled:opacity-50">Enviar pedido</button>
      </div>
      {msg && <p role="status" data-testid="rights-msg" className={`text-sm font-bold rounded-xl p-3 ${msg.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'}`}>{msg.text}</p>}
      {mine.length > 0 && (
        <ul className="space-y-1 text-xs text-slate-600" data-testid="rights-list">
          {mine.map(r => <li key={r.id}>{PRIVACY_TYPE_LABEL[r.type]} · {r.status === 'open' ? `em andamento (prazo: ${Math.max(privacyDaysLeft(r.createdAt), 0)} dias)` : r.status === 'done' ? 'concluído' : 'recusado'}{r.resolutionNote ? ` — ${r.resolutionNote}` : ''}</li>)}
        </ul>
      )}
    </div>
  );
};

export const PrivacyPolicy: React.FC<{ onNavigate: Nav; currentUser?: User | null }> = ({ onNavigate, currentUser = null }) => {
  const legal = useLegalSettings();
  const [consent, setC] = useState(getConsent());
  const choose = (v: 'granted' | 'denied') => { setConsent(v); setC(v); };
  return (
    <Shell title="Política de Privacidade" icon={<ShieldCheck size={24} />} onNavigate={onNavigate} testId="privacy-page" seoUrl="/privacidade"
      seoDesc="Como o Lagos GO coleta, usa e protege seus dados pessoais, conforme a LGPD.">
      <P>Esta política explica quais dados pessoais o {legal.tradeName || 'Lagos GO'} trata no site e no aplicativo, para quê, com quem compartilha e como você exerce seus direitos, conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018).</P>

      <H>1. Quem é o responsável</H>
      <Controller legal={legal} />

      <H>2. Dados que tratamos</H>
      <L items={[
        <><b>Cadastro:</b> nome, sobrenome, e-mail, telefone (opcional), foto de perfil (opcional), cidade e perfil (morador, turista, empresa).</>,
        <><b>Uso da plataforma:</b> favoritos, cupons resgatados e economia acumulada, avaliações, comentários, curtidas, publicações e candidaturas na Ajuda Colaborativa.</>,
        <><b>Empresas:</b> dados da empresa cadastrada (nome, endereço, telefone, horários, fotos) e do responsável pela conta.</>,
        <><b>Localização:</b> só quando você toca em "Perto de mim" ou permite o GPS; fica no seu aparelho durante a visita e não é gravada no servidor.</>,
        <><b>Dados técnicos:</b> endereço IP, tipo de aparelho e navegador, registros de acesso necessários à segurança.</>,
        <><b>Notificações:</b> se você ativar, guardamos o identificador do aparelho para enviá-las, ligado à sua conta; você desliga a qualquer momento.</>,
        <><b>Estatísticas de uso (Google Analytics):</b> só se você aceitar no aviso de cookies.</>,
        <><b>E-mails:</b> seu endereço de e-mail e o registro técnico dos avisos que enviamos (tipo de mensagem, data e se foi entregue). Quem assina a newsletter também tem guardados o endereço, a data do pedido, a da confirmação e a do cancelamento, se houver.</>,
        <><b>Pagamentos (quando ativos):</b> dados de cobrança tratados pelo processador de pagamentos; não guardamos número de cartão.</>,
      ]} />

      <H>3. Para que usamos e com qual base legal</H>
      <L items={[
        'Criar e manter sua conta, mostrar seus favoritos e cupons e permitir avaliações e publicações (execução de contrato).',
        'Exibir empresas, lugares e conteúdos do Guia e do Feed (execução de contrato e legítimo interesse).',
        'Prevenir fraudes, abusos e garantir a segurança da plataforma (legítimo interesse).',
        'Medir o uso para melhorar o produto (consentimento, que você pode retirar a qualquer momento).',
        'Cumprir obrigações legais e fiscais, inclusive guardar registros de acesso e de pagamentos (obrigação legal).',
        'Enviar notificações que você ativar (consentimento).',
        'Enviar e-mails do serviço: boas-vindas, confirmação de e-mail, redefinição de senha, avisos sobre plano e cobrança (execução de contrato).',
        'Enviar a newsletter semanal, só a quem pediu e confirmou o endereço (consentimento).',
      ]} />

      <H>4. Com quem compartilhamos</H>
      <P>Não vendemos dados pessoais. Compartilhamos apenas com prestadores que fazem a plataforma funcionar:</P>
      <L items={[
        'Google Firebase (login, banco de dados, notificações e, se aceito, Analytics).',
        'Vercel (hospedagem do site e das funções do servidor).',
        'Resend (envio dos e-mails do serviço e da newsletter) e HostGator (caixa de e-mail de contato, onde chegam as respostas que você nos manda).',
        'Asaas (processamento de pagamentos), quando houver cobrança.',
        'OpenStreetMap e serviços de mapa, que recebem o endereço IP ao carregar o mapa.',
        'Ferramentas de IA do Google, usadas apenas pela equipe administrativa para redigir textos; não recebem dados de usuários.',
        'Autoridades, quando exigido por lei ou ordem judicial.',
      ]} />
      <P>Transferência internacional: Google (Firebase), Vercel e Resend podem armazenar e processar dados em servidores fora do Brasil, com salvaguardas contratuais, conforme o art. 33 da LGPD.</P>
      <P>Seu nome, foto e o que você publica no Feed, em avaliações ou na Ajuda Colaborativa ficam visíveis para outras pessoas. E-mail e telefone não são exibidos publicamente.</P>

      <H>5. Por quanto tempo guardamos</H>
      <P>Enquanto sua conta existir. Ao excluir a conta, apagamos seus dados pessoais, exceto o que a lei manda guardar (por exemplo, registros de acesso por 6 meses, conforme o Marco Civil da Internet, e documentos fiscais de pagamentos pelo prazo legal). A ficha pública de uma empresa pode continuar no Guia como informação de interesse público; o responsável pode pedir a remoção pelo canal de privacidade.</P>

      <H>6. Seus direitos</H>
      <P>Você pode pedir confirmação e acesso aos dados, correção, anonimização, portabilidade, informação sobre compartilhamento, revogação do consentimento e exclusão. Edite seus dados no perfil ou exclua a conta em <button className="text-ocean-600 font-bold" onClick={() => onNavigate('delete-account')}>Excluir conta</button>. Os demais pedidos você faz aqui mesmo, e respondemos em até 15 dias. Você também pode reclamar à Autoridade Nacional de Proteção de Dados (ANPD).</P>
      <RightsPanel user={currentUser} onNavigate={onNavigate} />

      <H>7. E-mails e newsletter</H>
      <P>Os e-mails do serviço (como boas-vindas, confirmação de e-mail, redefinição de senha e avisos de plano) fazem parte do uso da conta. A newsletter é opcional: você só a recebe depois de pedir e confirmar o endereço pelo link que enviamos (confirmação em duas etapas). Todo e-mail da newsletter traz um link para cancelar em um clique, e o cancelamento vale de imediato. Respostas enviadas ao nosso e-mail de contato ficam na caixa de e-mail da equipe.</P>

      <H>8. Cookies e Analytics</H>
      <P>Usamos armazenamento do navegador para manter você conectado, lembrar idioma e favoritos. O Google Analytics só é ligado se você aceitar.</P>
      <div className="flex flex-wrap items-center gap-2" data-testid="privacy-consent">
        <span className="text-sm text-slate-600">Estatísticas de uso: <b>{consent === 'granted' ? 'aceitas' : consent === 'denied' ? 'recusadas' : 'sem escolha (desligadas)'}</b></span>
        <button onClick={() => choose('granted')} className="px-3 h-9 rounded-full text-xs font-black bg-ocean-600 text-white">Aceitar</button>
        <button onClick={() => choose('denied')} className="px-3 h-9 rounded-full text-xs font-black bg-slate-100 text-slate-700">Recusar</button>
      </div>

      <H>9. Segurança</H>
      <P>Conexão criptografada (HTTPS), regras de acesso no banco de dados que impedem uma pessoa de ver ou alterar dados de outra, e acesso administrativo restrito. Nenhum sistema é 100% imune; se houver incidente relevante, avisaremos você e a ANPD.</P>

      <H>10. Crianças e adolescentes</H>
      <P>A plataforma não é direcionada a crianças (menores de 12 anos). Adolescentes (12 a 17 anos) só devem usá-la com o consentimento de pelo menos um dos pais ou responsável, que pode pedir a exclusão dos dados a qualquer momento pelo painel do item 6.</P>

      <H>11. Mudanças nesta política</H>
      <P>Avisaremos no site e no aplicativo quando houver mudança relevante. A data da versão fica no topo desta página.</P>
    </Shell>
  );
};

export const TermsOfUse: React.FC<{ onNavigate: Nav }> = ({ onNavigate }) => {
  const legal = useLegalSettings();
  const name = legal.tradeName || 'Lagos GO';
  return (
    <Shell title="Termos de Uso" icon={<FileText size={24} />} onNavigate={onNavigate} testId="terms-page" seoUrl="/termos"
      seoDesc="Regras de uso do Lagos GO: guia, cupons, Feed, Ajuda Colaborativa e empresas parceiras.">
      <P>Ao usar o {name} você concorda com estes termos. Leia também a <button className="text-ocean-600 font-bold" onClick={() => onNavigate('privacy')}>Política de Privacidade</button>.</P>
      <H>1. O que é o {name}</H>
      <P>Um guia digital da Região dos Lagos (RJ) com lugares, empresas, cupons, matérias, Feed de dicas e a Ajuda Colaborativa, que conecta pessoas e empresas para trabalhos e colaborações.</P>
      <H>2. Conta</H>
      <L items={['Os dados informados devem ser verdadeiros e atualizados.', 'A conta é pessoal; você responde pelo que for feito com ela.', 'Você pode excluir a conta a qualquer momento na página Excluir conta.']} />
      <H>3. Informações do Guia</H>
      <P>Horários, preços, regras de acesso e condições de passeios e estabelecimentos podem mudar. Confirme diretamente com o lugar antes de ir. As matérias são orientativas e não substituem avisos oficiais (como Marinha, ICMBio, Defesa Civil e prefeituras).</P>
      <H>4. Cupons e ofertas</H>
      <L items={['Cada cupom tem regras, validade e limite definidos pela empresa que o oferece.', 'A empresa é responsável por honrar a oferta nas condições publicadas.', 'Uso indevido (cópias, revenda, fraude) leva ao bloqueio da conta.']} />
      <H>5. Conteúdo publicado por você</H>
      <L items={[
        'Você é responsável pelo que publica (avaliações, comentários, fotos, anúncios na Ajuda Colaborativa).',
        'É proibido conteúdo ilegal, ofensivo, discriminatório, enganoso, spam ou que viole direitos de terceiros.',
        'Ao publicar, você autoriza a exibição do conteúdo na plataforma enquanto ele estiver publicado.',
        'Podemos ocultar ou remover conteúdo que viole estes termos, e qualquer pessoa pode denunciar.',
      ]} />
      <H>6. Ajuda Colaborativa</H>
      <P>O {name} só aproxima as partes. Combinações de valores, prazos, segurança e pagamentos entre quem publica e quem se candidata são de responsabilidade das próprias partes. Desconfie de pedidos de pagamento antecipado e denuncie anúncios suspeitos.</P>
      <H>7. Empresas parceiras</H>
      <P>Empresas respondem pela veracidade das informações, ofertas e atendimento. Planos, destaques e eventuais cobranças seguem as condições apresentadas no momento da contratação.</P>
      <H>8. Limitação de responsabilidade</H>
      <P>Trabalhamos para manter a plataforma disponível e correta, mas não garantimos funcionamento ininterrupto nem nos responsabilizamos por serviços prestados por terceiros anunciados na plataforma.</P>
      <H>9. Contato e foro</H>
      <Controller legal={legal} />
      <P>Estes termos seguem a lei brasileira. Mudanças relevantes serão avisadas no site e no aplicativo.</P>
    </Shell>
  );
};

export const DeleteAccountPage: React.FC<{ onNavigate: Nav; currentUser: User | null }> = ({ onNavigate, currentUser }) => {
  const legal = useLegalSettings();
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const run = async () => {
    setBusy(true); setMsg(null);
    const r = await deleteMyAccount();
    setBusy(false);
    if (r.ok) { setMsg({ ok: true, text: 'Sua conta e seus dados pessoais foram excluídos.' }); setTimeout(() => onNavigate('home'), 2500); }
    else setMsg({ ok: false, text: r.message });
  };

  return (
    <Shell title="Excluir conta" icon={<UserX size={24} />} onNavigate={onNavigate} testId="delete-account-page" seoUrl="/excluir-conta"
      seoDesc="Como excluir sua conta do Lagos GO e os dados associados.">
      <P>Você pode excluir sua conta do {legal.tradeName || 'Lagos GO'} a qualquer momento, pelo site ou pelo aplicativo, sem precisar instalar nada.</P>
      <H>O que é apagado</H>
      <L items={['Seu cadastro (nome, e-mail, telefone, foto, cidade e perfil).', 'Favoritos, histórico de cupons e economia acumulada.', 'Seu perfil público e seus comentários no Feed.', 'Seu login: você não conseguirá mais entrar com esta conta.']} />
      <H>O que pode continuar</H>
      <L items={['Registros que a lei obriga a guardar (registros de acesso por 6 meses e documentos de pagamentos pelo prazo legal).', 'A ficha pública de uma empresa cadastrada, que pode ser removida a pedido pelo canal de privacidade.', 'Avaliações e anúncios da Ajuda Colaborativa podem ser removidos a pedido pelo mesmo canal.']} />

      <H>Excluir agora</H>
      {msg && <p role="status" data-testid="delete-msg" className={`text-sm font-bold rounded-xl p-3 ${msg.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'}`}>{msg.text}</p>}
      {!currentUser ? (
        <div className="space-y-2" data-testid="delete-login">
          <P>Entre na conta que você quer excluir e volte a esta página.</P>
          <button onClick={() => onNavigate('login')} className="h-11 px-5 rounded-xl bg-ocean-600 text-white text-sm font-black">Entrar</button>
        </div>
      ) : msg?.ok ? null : (
        <div className="space-y-3" data-testid="delete-form">
          <P>Conta: <b>{currentUser.email}</b>. Esta ação não pode ser desfeita. Para confirmar, digite <b>EXCLUIR</b>.</P>
          <input value={typed} onChange={e => setTyped(e.target.value)} aria-label="Digite EXCLUIR para confirmar" className="w-full border border-slate-200 rounded-xl px-3 h-11 text-sm" />
          <button onClick={run} disabled={busy || typed.trim().toUpperCase() !== 'EXCLUIR'} data-testid="delete-confirm"
            className="h-11 px-5 rounded-xl bg-red-600 text-white text-sm font-black flex items-center gap-2 disabled:opacity-40">
            {busy && <Loader2 size={15} className="animate-spin" />} Excluir minha conta
          </button>
        </div>
      )}
      <H>Outros pedidos</H>
      <Controller legal={legal} />
    </Shell>
  );
};
