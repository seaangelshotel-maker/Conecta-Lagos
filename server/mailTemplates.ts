/**
 * Modelos de e-mail do Lagos GO. Cada função devolve { subject, html, text }.
 * Layout em tabelas com CSS inline (compatível com Gmail, Outlook e apps de celular), paleta oceano + dourado.
 * Todo texto vindo de usuário passa por esc() antes de entrar no HTML.
 */

export interface Rendered { subject: string; html: string; text: string }

const OCEAN_950 = '#082f49', OCEAN_900 = '#0c4a6e', OCEAN_600 = '#0284c7', OCEAN_50 = '#f0f9ff', OCEAN_100 = '#e0f2fe';
const GOLD = '#f59e0b', SLATE = '#475569', SLATE_LIGHT = '#94a3b8';
const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

export const esc = (v: unknown) => String(v ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/** Só deixa passar links http(s); qualquer outra coisa vira o site. */
export const safeUrl = (u: unknown, fallback: string) => {
    const s = String(u || '').trim();
    return /^https?:\/\//i.test(s) ? s : fallback;
};

export const formatDatePt = (iso?: string) => {
    if (!iso) return '';
    const d = new Date(iso.length <= 10 ? `${iso}T12:00:00` : iso);
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'America/Sao_Paulo' });
};

export const firstName = (name?: string) => String(name || '').trim().split(/\s+/)[0] || '';
const greet = (name?: string) => (firstName(name) ? `Olá, ${firstName(name)}!` : 'Olá!');

interface LayoutOpts {
    site: string;
    preheader: string;
    heading: string;
    /** HTML já escapado do corpo. */
    body: string;
    cta?: { label: string; url: string };
    /** Texto pequeno antes do rodapé (HTML já escapado). */
    note?: string;
    unsubscribeUrl?: string;
    footerReason?: string;
}

export function layout(o: LayoutOpts): string {
    const cta = o.cta ? `
        <tr><td align="center" style="padding:8px 32px 28px">
          <a href="${esc(o.cta.url)}" style="display:inline-block;background:${OCEAN_600};color:#ffffff;font-weight:700;font-size:15px;text-decoration:none;padding:14px 28px;border-radius:12px">${esc(o.cta.label)}</a>
        </td></tr>` : '';
    const note = o.note ? `<tr><td style="padding:0 32px 24px;font-size:13px;line-height:1.6;color:${SLATE}">${o.note}</td></tr>` : '';
    const unsub = o.unsubscribeUrl ? ` · <a href="${esc(o.unsubscribeUrl)}" style="color:${SLATE_LIGHT}">Cancelar inscrição</a>` : '';
    return `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${esc(o.heading)}</title></head>
<body style="margin:0;padding:0;background:${OCEAN_50};font-family:${FONT}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${esc(o.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${OCEAN_50}"><tr><td align="center" style="padding:24px 12px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid ${OCEAN_100}">
    <tr><td style="background:${OCEAN_900};padding:26px 32px">
      <a href="${esc(o.site)}" style="text-decoration:none;font-size:22px;font-weight:800;letter-spacing:1px;color:#ffffff">LAGOS <span style="color:${GOLD}">GO</span></a>
      <div style="font-size:12px;color:#bae6fd;margin-top:4px">Região dos Lagos para explorar</div>
    </td></tr>
    <tr><td style="padding:32px 32px 8px"><h1 style="margin:0;font-size:24px;line-height:1.25;color:${OCEAN_950}">${esc(o.heading)}</h1></td></tr>
    <tr><td style="padding:12px 32px 24px;font-size:15px;line-height:1.65;color:${SLATE}">${o.body}</td></tr>
    ${cta}
    ${note}
    <tr><td style="background:${OCEAN_50};padding:20px 32px;font-size:12px;line-height:1.6;color:${SLATE_LIGHT}">
      ${esc(o.footerReason || 'Você recebeu este e-mail porque tem uma conta ou fez um pedido no Lagos GO.')}<br>
      <a href="${esc(o.site)}" style="color:${SLATE_LIGHT}">lagosgo.com.br</a> · Dúvidas? Responda este e-mail${unsub}
    </td></tr>
  </table>
</td></tr></table></body></html>`;
}

const p = (t: string) => `<p style="margin:0 0 14px">${t}</p>`;
const b = (t: string) => `<strong style="color:${OCEAN_950}">${esc(t)}</strong>`;
const rows = (list: [string, string][]) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 14px;background:${OCEAN_50};border-radius:12px">${
    list.filter(([, v]) => v).map(([k, v]) => `<tr><td style="padding:8px 14px;font-size:13px;color:${SLATE_LIGHT};width:36%">${esc(k)}</td><td style="padding:8px 14px;font-size:14px;color:${OCEAN_950}">${esc(v)}</td></tr>`).join('')}</table>`;

// ───────── Conta e acesso

export function welcome(o: { site: string; name?: string }): Rendered {
    const body = p(`${esc(greet(o.name))} Que bom ter você no Lagos GO.`) +
        p('Aqui você descobre praias, restaurantes, passeios e hospedagens de Arraial do Cabo, Cabo Frio e Búzios, junta cupons na sua carteira e acompanha o que acontece na região, tudo sem comissão.') +
        p('Dois passos para começar: salve seus lugares favoritos e pegue o primeiro cupom.');
    return {
        subject: 'Bem-vindo ao Lagos GO 🌴',
        html: layout({ site: o.site, preheader: 'Sua conta está pronta. Veja o que fazer primeiro.', heading: 'Bem-vindo ao Lagos GO', body, cta: { label: 'Explorar o guia', url: `${o.site}/descubra` } }),
        text: `${greet(o.name)} Que bom ter você no Lagos GO.\n\nAqui você descobre praias, restaurantes, passeios e hospedagens de Arraial do Cabo, Cabo Frio e Búzios, junta cupons e acompanha o que acontece na região.\n\nExplorar o guia: ${o.site}/descubra\n`,
    };
}

export function passwordReset(o: { site: string; name?: string; link: string }): Rendered {
    const body = p(`${esc(greet(o.name))} Recebemos um pedido para criar uma nova senha da sua conta.`) +
        p('Clique no botão abaixo para escolher a senha. O link vale por tempo limitado e só pode ser usado uma vez.');
    const note = 'Não pediu isso? Ignore este e-mail: sua senha continua a mesma e ninguém entra na sua conta sem ela.';
    return {
        subject: 'Crie uma nova senha no Lagos GO',
        html: layout({ site: o.site, preheader: 'Link para criar uma nova senha.', heading: 'Nova senha', body, cta: { label: 'Criar nova senha', url: safeUrl(o.link, o.site) }, note: esc(note) }),
        text: `${greet(o.name)} Recebemos um pedido para criar uma nova senha.\n\nUse este link (vale por tempo limitado): ${o.link}\n\n${note}\n`,
    };
}

export function verifyEmail(o: { site: string; name?: string; link: string }): Rendered {
    const body = p(`${esc(greet(o.name))} Falta só confirmar que este e-mail é seu.`) +
        p('A confirmação protege a sua conta e libera recursos como resgatar cupons e gerenciar empresa.');
    return {
        subject: 'Confirme seu e-mail no Lagos GO',
        html: layout({ site: o.site, preheader: 'Um clique para confirmar seu e-mail.', heading: 'Confirme seu e-mail', body, cta: { label: 'Confirmar e-mail', url: safeUrl(o.link, o.site) }, note: esc('Se você não criou uma conta no Lagos GO, pode ignorar esta mensagem.') }),
        text: `${greet(o.name)} Confirme seu e-mail: ${o.link}\n\nSe você não criou uma conta no Lagos GO, ignore esta mensagem.\n`,
    };
}

// ───────── Empresas e planos

export function planActivated(o: { site: string; name?: string; businessName: string; planName: string; endsAt?: string }): Rendered {
    const ends = formatDatePt(o.endsAt);
    const body = p(`${esc(greet(o.name))} Recebemos o pagamento e o plano da sua empresa já está ativo.`) +
        rows([['Empresa', o.businessName], ['Plano', o.planName], ['Válido até', ends]]) +
        p('Complete a ficha da empresa (fotos, horário, cardápio e cupons) para aparecer melhor para quem visita a região.');
    return {
        subject: `Plano ${o.planName} ativo: ${o.businessName}`,
        html: layout({ site: o.site, preheader: `O plano ${o.planName} de ${o.businessName} está ativo.`, heading: 'Pagamento confirmado', body, cta: { label: 'Abrir o painel da empresa', url: `${o.site}/user-dashboard` }, footerReason: 'Você recebeu este e-mail porque é responsável por uma empresa no Lagos GO.' }),
        text: `${greet(o.name)} Pagamento confirmado.\n\nEmpresa: ${o.businessName}\nPlano: ${o.planName}${ends ? `\nVálido até: ${ends}` : ''}\n\nPainel: ${o.site}/user-dashboard\n`,
    };
}

export function planExpiring(o: { site: string; name?: string; businessName: string; planName: string; endsAt?: string; days: number }): Rendered {
    const ends = formatDatePt(o.endsAt);
    const when = o.days <= 1 ? 'amanhã' : `em ${o.days} dias`;
    const body = p(`${esc(greet(o.name))} O plano ${b(o.planName)} da empresa ${b(o.businessName)} vence ${esc(when)}${ends ? ` (${esc(ends)})` : ''}.`) +
        p('Renovando antes do vencimento, a ficha, os cupons e os recursos do plano continuam no ar sem interrupção. Depois da data, a empresa volta ao plano gratuito.');
    return {
        subject: `O plano de ${o.businessName} vence ${when}`,
        html: layout({ site: o.site, preheader: `Renove para manter ${o.businessName} com todos os recursos.`, heading: 'Seu plano está perto de vencer', body, cta: { label: 'Renovar o plano', url: `${o.site}/user-dashboard` }, footerReason: 'Você recebeu este e-mail porque é responsável por uma empresa no Lagos GO.' }),
        text: `${greet(o.name)} O plano ${o.planName} de ${o.businessName} vence ${when}${ends ? ` (${ends})` : ''}.\n\nRenove em: ${o.site}/user-dashboard\n`,
    };
}

export function planExpired(o: { site: string; name?: string; businessName: string; planName: string }): Rendered {
    const body = p(`${esc(greet(o.name))} O plano ${b(o.planName)} da empresa ${b(o.businessName)} venceu e a empresa voltou ao plano gratuito.`) +
        p('A ficha continua no guia com as informações básicas. Quando quiser, é só renovar para reativar fotos, cupons e os demais recursos.');
    return {
        subject: `O plano de ${o.businessName} venceu`,
        html: layout({ site: o.site, preheader: 'A empresa voltou ao plano gratuito. Renove para reativar os recursos.', heading: 'Seu plano venceu', body, cta: { label: 'Reativar o plano', url: `${o.site}/user-dashboard` }, footerReason: 'Você recebeu este e-mail porque é responsável por uma empresa no Lagos GO.' }),
        text: `${greet(o.name)} O plano ${o.planName} de ${o.businessName} venceu e a empresa voltou ao plano gratuito.\n\nReativar: ${o.site}/user-dashboard\n`,
    };
}

export function claimReceived(o: { site: string; name?: string; businessName: string }): Rendered {
    const body = p(`${esc(greet(o.name))} Recebemos o seu pedido para assumir a empresa ${b(o.businessName)}.`) +
        p('Nossa equipe confere os dados e responde em até 2 dias úteis. Se precisarmos de algo, escrevemos para este e-mail.');
    return {
        subject: `Recebemos seu pedido: ${o.businessName}`,
        html: layout({ site: o.site, preheader: 'Estamos conferindo os dados da empresa.', heading: 'Pedido recebido', body, footerReason: 'Você recebeu este e-mail porque pediu para assumir uma empresa no Lagos GO.' }),
        text: `${greet(o.name)} Recebemos o seu pedido para assumir a empresa ${o.businessName}. Respondemos em até 2 dias úteis.\n`,
    };
}

// ───────── Avisos internos (equipe)

export function adminAlert(o: { site: string; title: string; lines: [string, string][]; link?: string }): Rendered {
    const body = p('Chegou um novo item no Lagos GO:') + rows(o.lines);
    return {
        subject: `[Lagos GO] ${o.title}`,
        html: layout({ site: o.site, preheader: o.title, heading: o.title, body, cta: { label: 'Abrir no painel', url: safeUrl(o.link, `${o.site}/admin-dashboard`) }, footerReason: 'Aviso interno enviado para a equipe do Lagos GO.' }),
        text: `${o.title}\n\n${o.lines.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join('\n')}\n\nPainel: ${o.link || `${o.site}/admin-dashboard`}\n`,
    };
}

// ───────── Newsletter

export function newsletterConfirm(o: { site: string; confirmUrl: string }): Rendered {
    const body = p('Você pediu para receber o resumo semanal do Lagos GO: eventos do fim de semana, cupons e novidades de Arraial do Cabo, Cabo Frio e Búzios.') +
        p('Confirme a inscrição com um clique. Sem a confirmação, nada será enviado.');
    return {
        subject: 'Confirme sua inscrição no Lagos GO',
        html: layout({ site: o.site, preheader: 'Um clique para receber o resumo semanal.', heading: 'Confirme sua inscrição', body, cta: { label: 'Confirmar inscrição', url: o.confirmUrl }, footerReason: 'Você recebeu este e-mail porque este endereço foi informado para a newsletter do Lagos GO. Se não foi você, ignore: nada será enviado.' }),
        text: `Você pediu para receber o resumo semanal do Lagos GO.\n\nConfirme a inscrição: ${o.confirmUrl}\n\nSe não foi você, ignore esta mensagem.\n`,
    };
}

export interface DigestItem { title: string; subtitle?: string; url: string; image?: string }
export interface NewsletterData { intro?: string; events: DigestItem[]; coupons: DigestItem[]; posts: DigestItem[] }

const section = (title: string, items: DigestItem[]) => items.length ? `
  <tr><td style="padding:8px 0 4px"><div style="font-size:13px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:${GOLD}">${esc(title)}</div></td></tr>
  ${items.map(i => `<tr><td style="padding:8px 0;border-bottom:1px solid ${OCEAN_100}">
    <a href="${esc(i.url)}" style="font-size:16px;font-weight:700;color:${OCEAN_900};text-decoration:none">${esc(i.title)}</a>
    ${i.subtitle ? `<div style="font-size:13px;color:${SLATE};margin-top:3px">${esc(i.subtitle)}</div>` : ''}
  </td></tr>`).join('')}` : '';

export function newsletterWeekly(o: { site: string; data: NewsletterData; unsubscribeUrl: string; subject?: string }): Rendered {
    const { data } = o;
    const intro = data.intro?.trim() || 'O que vale a pena na Região dos Lagos nesta semana.';
    const body = p(esc(intro)) + `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${section('Neste fim de semana', data.events)}${section('Cupons para usar', data.coupons)}${section('Para ler', data.posts)}</table>`;
    const subject = o.subject?.trim() || 'Lagos GO: o fim de semana na Região dos Lagos';
    const lines = (t: string, l: DigestItem[]) => l.length ? `${t}\n${l.map(i => `• ${i.title}${i.subtitle ? ` — ${i.subtitle}` : ''}\n  ${i.url}`).join('\n')}\n\n` : '';
    return {
        subject,
        html: layout({ site: o.site, preheader: intro, heading: 'Resumo da semana', body, cta: { label: 'Ver tudo no Lagos GO', url: o.site }, unsubscribeUrl: o.unsubscribeUrl, footerReason: 'Você recebe este e-mail porque se inscreveu na newsletter do Lagos GO.' }),
        text: `${intro}\n\n${lines('NESTE FIM DE SEMANA', data.events)}${lines('CUPONS PARA USAR', data.coupons)}${lines('PARA LER', data.posts)}Ver tudo: ${o.site}\n\nCancelar inscrição: ${o.unsubscribeUrl}\n`,
    };
}

export const newsletterHasContent = (d: NewsletterData) => d.events.length + d.coupons.length + d.posts.length > 0;

/** Página simples devolvida pelos links de confirmação e descadastro. */
export function statusPage(o: { site: string; title: string; message: string; ok: boolean }): string {
    return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${esc(o.title)} · Lagos GO</title></head>
<body style="margin:0;background:${OCEAN_50};font-family:${FONT};min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px">
<div style="max-width:440px;background:#fff;border:1px solid ${OCEAN_100};border-radius:20px;padding:36px;text-align:center">
<div style="font-size:20px;font-weight:800;letter-spacing:1px;color:${OCEAN_900}">LAGOS <span style="color:${GOLD}">GO</span></div>
<h1 style="font-size:22px;color:${o.ok ? OCEAN_950 : '#b91c1c'};margin:22px 0 10px">${esc(o.title)}</h1>
<p style="color:${SLATE};line-height:1.6;margin:0 0 24px">${esc(o.message)}</p>
<a href="${esc(o.site)}" style="display:inline-block;background:${OCEAN_600};color:#fff;text-decoration:none;font-weight:700;padding:12px 24px;border-radius:12px">Ir para o Lagos GO</a>
</div></body></html>`;
}
