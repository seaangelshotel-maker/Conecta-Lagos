/**
 * Regras de negócio da Ajuda Colaborativa — funções puras (sem Firebase),
 * espelhadas em firestore.rules e cobertas por tests/opportunityRules.test.ts.
 */
import type {
    Opportunity, OpportunityStatus, OpportunityType, CompensationType, ContactMethod, OpportunityRecurrence
} from '../types';

export const OPPORTUNITY_CATEGORIES = [
    'Náutica e passeios',
    'Bares e restaurantes',
    'Hospedagem',
    'Comércio e vendas',
    'Eventos',
    'Limpeza e manutenção',
    'Construção e reparos',
    'Transporte e entregas',
    'Beleza e bem-estar',
    'Aulas e educação',
    'Tecnologia e criação',
    'Outros',
] as const;

export const OPPORTUNITY_TYPES: OpportunityType[] = ['vaga', 'temporario', 'servico_pontual', 'prestacao', 'colaboracao'];
export const COMPENSATION_TYPES: CompensationType[] = ['fixed', 'range', 'to_agree', 'none'];
export const CONTACT_METHODS: ContactMethod[] = ['in_app', 'whatsapp', 'email', 'phone'];
export const RECURRENCES: OpportunityRecurrence[] = ['pontual', 'temporaria', 'recorrente'];

/** Status em que a oportunidade aparece como disponível para o público. */
export const PUBLIC_STATUSES: OpportunityStatus[] = ['published', 'in_progress'];

/** Transições permitidas ao anunciante (o admin pode qualquer uma). Espelha validOwnerTransition nas regras. */
const OWNER_TRANSITIONS: Record<OpportunityStatus, OpportunityStatus[]> = {
    draft: ['published', 'cancelled'],
    published: ['in_progress', 'filled', 'closed', 'cancelled'],
    in_progress: ['published', 'filled', 'closed', 'cancelled'],
    filled: ['published', 'closed'],
    closed: [],
    cancelled: [],
};

export const canOwnerTransition = (from: OpportunityStatus, to: OpportunityStatus) =>
    from === to || OWNER_TRANSITIONS[from].includes(to);

export const nextOwnerStatuses = (from: OpportunityStatus): OpportunityStatus[] => OWNER_TRANSITIONS[from];

export const isFinalStatus = (s: OpportunityStatus) => s === 'closed' || s === 'cancelled';

/** Data de referência (YYYY-MM-DD) a partir da qual a oportunidade já passou. */
export const effectiveEndDate = (o: Pick<Opportunity, 'endDate' | 'startDate' | 'recurrence'>): string | undefined => {
    if (o.endDate) return o.endDate;
    if (o.recurrence === 'pontual' && o.startDate) return o.startDate;
    return undefined;
};

export const isExpired = (o: Pick<Opportunity, 'endDate' | 'startDate' | 'recurrence'>, today = todayISO()) => {
    const end = effectiveEndDate(o);
    return !!end && end < today;
};

/** Disponível para candidaturas: status público, não oculta pela moderação e não vencida. */
export const isAvailable = (o: Pick<Opportunity, 'status' | 'isHidden' | 'endDate' | 'startDate' | 'recurrence'>, today = todayISO()) =>
    PUBLIC_STATUSES.includes(o.status) && !o.isHidden && !isExpired(o, today);

export const todayISO = () => {
    const d = new Date();
    const tz = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tz).toISOString().slice(0, 10);
};

export interface OpportunityInput {
    title: string;
    description: string;
    category: string;
    type: OpportunityType;
    recurrence: OpportunityRecurrence;
    posterName: string;
    businessId?: string;
    cityId?: string;
    neighborhoodId?: string;
    locationDetail?: string;
    startDate?: string;
    endDate?: string;
    schedule?: string;
    compensationType: CompensationType;
    compensationMin?: number | null;
    compensationMax?: number | null;
    compensationUnit?: string;
    requirementsText?: string;
    peopleNeeded: number;
    additionalInfo?: string;
    contactMethod: ContactMethod;
    contactValue?: string;
}

export type OpportunityErrors = Partial<Record<keyof OpportunityInput | 'form', string>>;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const parseRequirements = (text?: string): string[] =>
    (text || '')
        .split('\n')
        .map(l => l.replace(/^[-•*\s]+/, '').trim())
        .filter(Boolean)
        .slice(0, 20)
        .map(l => l.slice(0, 200));

/**
 * Valida os dados do formulário. `forPublish` acrescenta as exigências de publicação
 * (data, cidade e data ainda não vencida).
 */
export const validateOpportunity = (input: OpportunityInput, forPublish: boolean, today = todayISO()): OpportunityErrors => {
    const e: OpportunityErrors = {};
    const title = (input.title || '').trim();
    const description = (input.description || '').trim();

    if (title.length < 5) e.title = 'O título precisa ter pelo menos 5 caracteres.';
    else if (title.length > 120) e.title = 'O título pode ter no máximo 120 caracteres.';

    if (description.length < 20) e.description = 'Descreva a oportunidade com pelo menos 20 caracteres.';
    else if (description.length > 4000) e.description = 'A descrição pode ter no máximo 4000 caracteres.';

    if (!input.category) e.category = 'Escolha uma categoria.';
    if (!OPPORTUNITY_TYPES.includes(input.type)) e.type = 'Escolha o tipo de oportunidade.';
    if (!RECURRENCES.includes(input.recurrence)) e.recurrence = 'Escolha a frequência.';
    if (!(input.posterName || '').trim()) e.posterName = 'Informe quem está anunciando.';

    const people = Number(input.peopleNeeded);
    if (!Number.isInteger(people) || people < 1 || people > 500) e.peopleNeeded = 'Informe quantas pessoas (de 1 a 500).';

    if (input.startDate && !ISO_DATE.test(input.startDate)) e.startDate = 'Data inválida.';
    if (input.endDate && !ISO_DATE.test(input.endDate)) e.endDate = 'Data inválida.';
    if (input.startDate && input.endDate && input.endDate < input.startDate) e.endDate = 'A data final não pode ser antes da inicial.';
    if (forPublish) {
        if (input.recurrence !== 'recorrente' && !input.startDate) e.startDate = 'Informe a data (ou marque como recorrente).';
        const end = input.endDate || (input.recurrence === 'pontual' ? input.startDate : undefined);
        if (end && ISO_DATE.test(end) && end < today) e.endDate = 'Esta data já passou.';
        if (!input.cityId) e.cityId = 'Escolha a cidade.';
    }

    if (!COMPENSATION_TYPES.includes(input.compensationType)) {
        e.compensationType = 'Escolha como é a remuneração.';
    } else if (input.compensationType === 'fixed') {
        const v = Number(input.compensationMin);
        if (!(v > 0)) e.compensationMin = 'Informe o valor.';
    } else if (input.compensationType === 'range') {
        const min = Number(input.compensationMin);
        const max = Number(input.compensationMax);
        if (!(min > 0)) e.compensationMin = 'Informe o valor mínimo.';
        if (!(max > 0)) e.compensationMax = 'Informe o valor máximo.';
        else if (min > 0 && max < min) e.compensationMax = 'O máximo deve ser maior que o mínimo.';
    }

    if (!CONTACT_METHODS.includes(input.contactMethod)) {
        e.contactMethod = 'Escolha a forma de contato.';
    } else if (input.contactMethod !== 'in_app') {
        const v = (input.contactValue || '').trim();
        if (!v) e.contactValue = 'Informe o contato.';
        else if (v.length > 120) e.contactValue = 'Contato muito longo.';
        else if (input.contactMethod === 'email' && !EMAIL.test(v)) e.contactValue = 'E-mail inválido.';
        else if ((input.contactMethod === 'whatsapp' || input.contactMethod === 'phone') && v.replace(/\D/g, '').length < 10) {
            e.contactValue = 'Informe o número com DDD.';
        }
    }

    if ((input.additionalInfo || '').length > 2000) e.additionalInfo = 'Máximo de 2000 caracteres.';
    if ((input.schedule || '').length > 120) e.schedule = 'Máximo de 120 caracteres.';
    if ((input.locationDetail || '').length > 200) e.locationDetail = 'Máximo de 200 caracteres.';

    // Rascunhos passam pelas mesmas validações de formato (as regras do banco exigem),
    // mas não precisam de data, cidade nem de data futura.
    return e;
};

const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: v % 1 === 0 ? 0 : 2 });

/** Texto da remuneração, deixando claro quando não está definida. */
export const formatCompensation = (o: Pick<Opportunity, 'compensationType' | 'compensationMin' | 'compensationMax' | 'compensationUnit'>) => {
    const unit = o.compensationUnit ? ` ${o.compensationUnit}` : '';
    switch (o.compensationType) {
        case 'fixed': return o.compensationMin ? `${brl(o.compensationMin)}${unit}` : 'Valor não informado';
        case 'range': return o.compensationMin && o.compensationMax ? `${brl(o.compensationMin)} a ${brl(o.compensationMax)}${unit}` : 'Valor não informado';
        case 'to_agree': return 'Remuneração a combinar';
        case 'none': return 'Sem remuneração (colaboração)';
        default: return 'Remuneração não definida';
    }
};

/** Monta os campos gravados no Firestore a partir do formulário (sem campos vazios). */
export const buildOpportunityFields = (input: OpportunityInput) => {
    const fields: Record<string, unknown> = {
        title: input.title.trim(),
        description: input.description.trim(),
        category: input.category || 'Outros',
        type: input.type,
        recurrence: input.recurrence,
        posterName: input.posterName.trim().slice(0, 120),
        compensationType: input.compensationType,
        peopleNeeded: Math.max(1, Math.min(500, Math.round(Number(input.peopleNeeded) || 1))),
        contactMethod: input.contactMethod,
        requirements: parseRequirements(input.requirementsText),
    };
    const optional: [string, unknown][] = [
        ['businessId', input.businessId],
        ['cityId', input.cityId],
        ['neighborhoodId', input.neighborhoodId],
        ['locationDetail', input.locationDetail?.trim()],
        ['startDate', input.startDate],
        ['endDate', input.endDate],
        ['schedule', input.schedule?.trim()],
        ['additionalInfo', input.additionalInfo?.trim()],
        ['compensationUnit', input.compensationUnit?.trim()],
    ];
    optional.forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') fields[k] = v; });
    if (input.compensationType === 'fixed' || input.compensationType === 'range') {
        if (input.compensationMin) fields.compensationMin = Number(input.compensationMin);
    }
    if (input.compensationType === 'range' && input.compensationMax) fields.compensationMax = Number(input.compensationMax);
    if (input.contactMethod !== 'in_app' && input.contactValue) fields.contactValue = input.contactValue.trim();
    return fields;
};

/** Filtros da listagem pública (aplicados no cliente sobre o conjunto disponível). */
export interface OpportunityFilters {
    text?: string;
    category?: string;
    type?: OpportunityType | '';
    cityId?: string;
    neighborhoodId?: string;
    fromDate?: string;
    onlyPaid?: boolean;
}

const normalize = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export const filterOpportunities = (list: Opportunity[], f: OpportunityFilters, today = todayISO()) => {
    const text = f.text ? normalize(f.text.trim()) : '';
    return list.filter(o => {
        if (!isAvailable(o, today)) return false;
        if (f.category && o.category !== f.category) return false;
        if (f.type && o.type !== f.type) return false;
        if (f.cityId && o.cityId !== f.cityId) return false;
        if (f.neighborhoodId && o.neighborhoodId !== f.neighborhoodId) return false;
        if (f.onlyPaid && !(o.compensationType === 'fixed' || o.compensationType === 'range')) return false;
        if (f.fromDate) {
            // Mostra o que acontece a partir da data escolhida (recorrentes sempre entram).
            const end = effectiveEndDate(o);
            if (end && end < f.fromDate) return false;
        }
        if (text) {
            const hay = normalize([o.title, o.description, o.category, o.posterName, o.cityName, o.neighborhoodName, ...(o.requirements || [])].filter(Boolean).join(' '));
            if (!hay.includes(text)) return false;
        }
        return true;
    });
};
