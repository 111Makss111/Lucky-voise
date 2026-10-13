import React from 'react';
import { Sparkles, Smile, Wind, HelpCircle } from 'lucide-react';

interface VocalBurstsBarProps {
  onInsertTag: (tag: string) => void;
  lang?: 'uk' | 'en';
}

export const VocalBurstsBar: React.FC<VocalBurstsBarProps> = ({ onInsertTag, lang = 'uk' }) => {
  const tags = [
    {
      tag: '<laugh>',
      labelUk: 'Сміх <laugh>',
      labelEn: 'Laugh <laugh>',
      descUk: 'Додає щирий смішок або сміх',
      descEn: 'Inserts natural laughter or chuckle',
    },
    {
      tag: '<breath>',
      labelUk: 'Вдих <breath>',
      labelEn: 'Breath <breath>',
      descUk: 'Природна пауза на вдих перед фразою',
      descEn: 'Natural breath pause before speaking',
    },
    {
      tag: '<sigh>',
      labelUk: 'Зітхання <sigh>',
      labelEn: 'Sigh <sigh>',
      descUk: 'Легке зітхання або полегшення',
      descEn: 'Gentle sigh or emotional release',
    },
    {
      tag: '<gasp>',
      labelUk: 'Подив <gasp>',
      labelEn: 'Gasp <gasp>',
      descUk: 'Короткий вигук здивування або захоплення',
      descEn: 'Surprised gasp or amazement',
    },
    {
      tag: '|yeah|',
      labelUk: 'Підтак |yeah|',
      labelEn: 'Agreed |yeah|',
      descUk: 'Живе схвалення під час розмови',
      descEn: 'Backchannel conversational agreement',
    },
    {
      tag: '|mhm|',
      labelUk: 'Угу |mhm|',
      labelEn: 'Uh-huh |mhm|',
      descUk: 'Природне підтакування у діалозі',
      descEn: 'Backchannel listening reaction',
    },
  ];

  return (
    <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs font-medium text-indigo-300">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>
            {lang === 'uk'
              ? 'Вокальні вигуки Gemini 3.8 (Vocal Bursts & Backchanneling)'
              : 'Gemini 3.8 Vocal Bursts & Backchanneling'}
          </span>
        </div>
        <span className="text-[11px] text-slate-400 hidden sm:inline">
          {lang === 'uk'
            ? 'Клікніть, щоб вставити в текст'
            : 'Click to insert into cursor'}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {tags.map((item) => (
          <button
            key={item.tag}
            type="button"
            onClick={() => onInsertTag(item.tag)}
            title={lang === 'uk' ? item.descUk : item.descEn}
            className="group flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-indigo-950/80 hover:border-indigo-500/50 text-slate-300 hover:text-indigo-200 border border-slate-800 rounded-lg text-xs font-mono transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <span className="text-indigo-400 group-hover:scale-110 transition-transform">✦</span>
            <span>{lang === 'uk' ? item.labelUk : item.labelEn}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
