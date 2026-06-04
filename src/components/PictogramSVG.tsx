import React from 'react';
import type { AvatarConfig } from '../types';

interface PictogramSVGProps {
  label?: string;
  emoji?: string;
  className?: string;
  category?: string;
  genderTheme?: 'boy' | 'girl' | 'neutral';
  avatarConfig?: AvatarConfig;
}

declare global {
  interface Window {
    __teajudandoActiveTheme__?: 'boy' | 'girl' | 'neutral';
  }
}

const normalize = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');

const displayLabel = (label: string) =>
  label
    .replace(/^quero\s+/i, '')
    .replace(/^estou\s+/i, '')
    .replace(/^doi\s+(de|o)\s+/i, 'dor ')
    .replace(/^tomar\s+/i, '')
    .trim();

const fallbackFontSize = (label: string) => {
  if (label.length > 20) return 24;
  if (label.length > 15) return 28;
  if (label.length > 11) return 34;
  if (label.length > 8) return 42;
  return 52;
};

export const pictogramAssetFor = (label = '', emoji = ''): string | null => {
  const text = normalize(label);
  const em = normalize(emoji);
  const directAssets = new Set([
    'agua', 'ajuda', 'almocar', 'banana', 'banheiro', 'beber', 'biscoito',
    'bolacha', 'bola', 'bravo', 'brincar', 'cantar', 'casa', 'clinica',
    'comer', 'correr', 'dor', 'dormir', 'escola', 'escovar-dentes',
    'escrever', 'falar', 'feliz', 'frio', 'leite', 'maca', 'mais', 'medo',
    'nao', 'ouvir', 'pao', 'parque', 'pintar', 'quente', 'quero', 'sentar',
    'sim', 'suco', 'tablet', 'triste', 'ursinho', 'ver', 'acabou'
  ]);

  if (directAssets.has(em)) return em === 'bolacha' ? 'biscoito' : em;
  if (directAssets.has(text)) return text === 'bolacha' ? 'biscoito' : text;

  if (text.includes('quero') && (text.includes('agua') || text.includes('beber'))) return 'beber';
  if (text.includes('quero') && text.includes('comer')) return 'comer';
  if (text.includes('quero') && text.includes('abraco')) return 'ajuda';
  if (text.includes('ajuda') || text.includes('socorro')) return 'ajuda';
  if (text.includes('abraco')) return 'ajuda';
  if (text.includes('me da')) return 'quero';
  if (text === 'quero') return 'quero';
  if (text.includes('mais')) return 'mais';
  if (text.includes('acabou') || text.includes('terminou') || text.includes('fim')) return 'acabou';
  if (text === 'sim') return 'sim';
  if (text === 'nao' || text.includes('parar') || text.includes('nao estou gostando')) return 'nao';

  if (text.includes('agua')) return 'agua';
  if (text.includes('beber') || text.includes('sede')) return 'beber';
  if (text.includes('suco')) return 'suco';
  if (text.includes('leite')) return 'leite';
  if (text.includes('maca')) return 'maca';
  if (text.includes('banana') || text.includes('fruta')) return em.includes('🍓') ? 'maca' : 'banana';
  if (text.includes('biscoito') || text.includes('bolacha')) return 'biscoito';
  if (text.includes('pao')) return 'pao';
  if (text.includes('almocar') || text.includes('arroz') || text.includes('feijao') || text.includes('carne')) return 'almocar';

  if (text.includes('banheiro') || text.includes('xixi') || text.includes('coco')) return 'banheiro';
  if (text.includes('escovar') || text.includes('dente')) return 'escovar-dentes';
  if (text.includes('banho') || text.includes('lavar') || text.includes('sabao')) return 'banheiro';

  if (text.includes('feliz') || text.includes('alegre') || text.includes('gostando') || text.includes('brincalhao')) return 'feliz';
  if (text.includes('triste')) return 'triste';
  if (text.includes('bravo') || text.includes('raiva')) return 'bravo';
  if (text.includes('medo') || text.includes('assustado')) return 'medo';
  if (text.includes('ansioso') || text.includes('agitado')) return 'medo';
  if (text.includes('calmo')) return 'feliz';
  if (text.includes('dor') || text.includes('doi') || text.includes('machucado') || text.includes('bandaid')) return 'dor';
  if (text.includes('frio')) return 'frio';
  if (text.includes('calor') || text.includes('quente')) return 'quente';
  if (text.includes('dormir') || text.includes('sono') || text.includes('soneca') || text.includes('cansado')) return 'dormir';
  if (text.includes('enjoado') || text.includes('enojado')) return 'dor';
  if (text.includes('barulho') || text.includes('silencio')) return 'nao';

  if (text.includes('brincar') || text.includes('blocos')) return 'brincar';
  if (text.includes('ursino') || text.includes('urso')) return 'ursinho';
  if (text.includes('bola')) return 'bola';
  if (text.includes('tablet') || text.includes('video') || text.includes('tv') || text.includes('desenho')) return 'tablet';
  if (text.includes('pintar')) return 'pintar';
  if (text.includes('escrever')) return 'escrever';
  if (text.includes('correr') || text.includes('pula')) return 'correr';
  if (text.includes('cantar') || text.includes('musica')) return 'cantar';
  if (text.includes('falar')) return 'falar';
  if (text.includes('ver') || text.includes('livro')) return 'ver';
  if (text.includes('ouvir')) return 'ouvir';
  if (text.includes('sentar')) return 'sentar';

  if (text.includes('casa') || text.includes('quarto') || text.includes('lar')) return 'casa';
  if (text.includes('escola')) return 'escola';
  if (text.includes('parque') || text.includes('fora')) return 'parque';
  if (text.includes('clinica') || text.includes('terapeuta') || text.includes('sensorial') || text.includes('foco')) return 'clinica';

  if (text.includes('lapis') || text.includes('caderno') || text.includes('professor')) return 'escrever';
  if (text.includes('tesoura') || text.includes('cola') || text.includes('massinha')) return 'pintar';
  if (text.includes('mamae') || text.includes('papai') || text.includes('mae') || text.includes('pai') || text.includes('amigo') || text.includes('vovo') || text === 'eu') return 'quero';
  if (text.includes('cachorrinho') || text.includes('gatinho') || text.includes('carrinho') || text.includes('mochila') || text.includes('quebra') || text.includes('bicicleta')) return 'brincar';

  return null;
};

export const PictogramSVG: React.FC<PictogramSVGProps> = ({
  label = '',
  emoji = '',
  className = 'w-full h-full',
  genderTheme,
  avatarConfig,
}) => {
  void avatarConfig;
  const activeTheme =
    genderTheme ||
    (typeof window !== 'undefined' ? window.__teajudandoActiveTheme__ : undefined) ||
    'girl';
  const gender = activeTheme === 'boy' ? 'boy' : 'girl';
  const asset = pictogramAssetFor(label, emoji);
  const base = (import.meta.env.BASE_URL || '/').replace(/\/?$/, '/');
  const imageSrc = asset ? `${base}pictograms/${gender}/${asset}.png` : null;
  const finalLabel = displayLabel(label || 'cartao');

  if (imageSrc) {
    return (
      <img
        src={imageSrc}
        alt={finalLabel}
        className={`${className} object-contain`}
        loading="lazy"
        draggable={false}
      />
    );
  }

  return (
    <svg viewBox="0 0 320 380" className={className} role="img" aria-label={finalLabel}>
      <rect x="9" y="9" width="302" height="362" rx="28" fill="#ffffff" stroke="#090909" strokeWidth="7" />
      <text x="160" y="170" textAnchor="middle" dominantBaseline="middle" fontSize="112">
        {emoji || '💬'}
      </text>
      <text
        x="160"
        y="335"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#090909"
        fontFamily="Arial Rounded MT Bold, Arial, Helvetica, sans-serif"
        fontWeight="900"
        fontSize={fallbackFontSize(finalLabel)}
      >
        {finalLabel}
      </text>
    </svg>
  );
};
