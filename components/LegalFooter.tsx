import React from 'react';

/** Links legais (exigidos pelas lojas e pela LGPD), discretos no fim das telas principais. */
export const LegalFooter: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => (
  <footer className="px-4 py-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[11px] font-bold text-slate-400" data-testid="legal-footer">
    <button onClick={() => onNavigate('privacy')}>Privacidade</button>
    <button onClick={() => onNavigate('terms')}>Termos de uso</button>
    <button onClick={() => onNavigate('delete-account')}>Excluir conta</button>
    <span>© {new Date().getFullYear()} Lagos GO</span>
  </footer>
);
