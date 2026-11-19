import React from 'react';
import type { ImageCredit } from '../types';

/**
 * Legenda discreta de crédito sob a foto: "Foto: Fulano · CC BY-SA 4.0".
 * Se a fonte tiver página, o texto vira link para o leitor conferir (abre em nova aba).
 * Sem crédito, não mostra nada.
 */
export const PhotoCredit: React.FC<{ credit?: ImageCredit; className?: string }> = ({ credit, className = '' }) => {
  if (!credit?.author) return null;
  const text = `Foto: ${credit.author} · ${credit.license}`;
  return (
    <p className={`text-[10px] leading-snug text-slate-400 ${className}`} data-testid="photo-credit">
      {credit.sourceUrl
        ? <a href={credit.sourceUrl} target="_blank" rel="noreferrer noopener" className="hover:underline">{text}</a>
        : text}
    </p>
  );
};
