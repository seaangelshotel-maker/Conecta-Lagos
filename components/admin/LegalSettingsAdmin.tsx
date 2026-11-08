import React, { useEffect, useState } from 'react';
import { Scale, Save, Loader2 } from 'lucide-react';
import { getLegalSettings, saveLegalSettings, LegalSettings, EMPTY_LEGAL } from '../../services/legalService';
import { useNotification } from '../NotificationSystem';

const FIELDS: { key: keyof LegalSettings; label: string; ph: string }[] = [
  { key: 'companyName', label: 'Razão social', ph: 'Ex.: Fulano Turismo Ltda.' },
  { key: 'tradeName', label: 'Nome da plataforma', ph: 'Lagos GO' },
  { key: 'cnpj', label: 'CNPJ', ph: '00.000.000/0001-00' },
  { key: 'address', label: 'Endereço', ph: 'Rua, número, bairro, cidade/UF' },
  { key: 'privacyEmail', label: 'E-mail para privacidade (titulares de dados)', ph: 'privacidade@...' },
  { key: 'dpoName', label: 'Encarregado (DPO)', ph: 'Nome de quem responde pelos dados' },
];

/** Admin: dados do responsável exibidos na Política de Privacidade, Termos e Excluir conta. */
export const LegalSettingsAdmin: React.FC = () => {
  const { notify } = useNotification();
  const [v, setV] = useState<LegalSettings>(EMPTY_LEGAL);
  const [busy, setBusy] = useState(false);
  useEffect(() => { getLegalSettings(true).then(setV); }, []);
  const save = async () => {
    setBusy(true);
    try { setV(await saveLegalSettings(v)); notify('success', 'Dados legais salvos. Já aparecem na Política e nos Termos.'); }
    catch (e: any) { notify('error', e?.message || 'Não foi possível salvar.'); }
    finally { setBusy(false); }
  };
  const missing = FIELDS.filter(f => f.key !== 'dpoName' && !v[f.key]).map(f => f.label);
  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 p-6 space-y-4" data-testid="legal-admin">
      <div className="flex items-start gap-3">
        <div className="bg-ocean-50 text-ocean-600 p-3 rounded-2xl"><Scale size={22} /></div>
        <div>
          <h3 className="font-black text-ocean-950 text-lg">Privacidade e termos: dados do responsável</h3>
          <p className="text-sm text-slate-500">Aparecem em /privacidade, /termos e /excluir-conta. Exigidos pela LGPD e pelas lojas de aplicativos.</p>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {FIELDS.map(f => (
          <label key={f.key} className="text-xs font-bold text-slate-500">{f.label}
            <input value={(v[f.key] as string) || ''} placeholder={f.ph} onChange={e => setV({ ...v, [f.key]: e.target.value })} data-testid={`legal-${f.key}`}
              className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800" />
          </label>
        ))}
      </div>
      {missing.length > 0 && <p className="text-xs font-bold text-amber-700">Faltam: {missing.join(', ')}.</p>}
      <button onClick={save} disabled={busy} data-testid="legal-save" className="bg-ocean-600 text-white font-black px-5 py-3 rounded-xl text-sm flex items-center gap-2 disabled:opacity-60">
        {busy ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Salvar dados legais
      </button>
    </div>
  );
};
