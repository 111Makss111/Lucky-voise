import React from 'react';
import { STYLE_PRESETS } from '../data/voices';
import { Sliders, Sparkles } from 'lucide-react';

interface StyleSelectorProps {
  customStyle: string;
  onChangeStyle: (style: string) => void;
  lang?: 'uk' | 'en';
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({
  customStyle,
  onChangeStyle,
  lang = 'uk',
}) => {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-indigo-400" />
          <span>{lang === 'uk' ? 'Стиль та настрій мовлення (Speech Style)' : 'Voice Style & Emotion'}</span>
        </label>
        <span className="text-[11px] text-slate-400">
          {lang === 'uk' ? 'Передається в speechMetadata.style' : 'Sent to speechMetadata.style'}
        </span>
      </div>

      {/* Preset pills */}
      <div className="flex flex-wrap gap-1.5">
        {STYLE_PRESETS.map((preset) => {
          const isActive = customStyle === preset.prompt;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onChangeStyle(preset.prompt)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                isActive
                  ? 'bg-indigo-600/30 text-indigo-200 border-indigo-500/60 shadow-xs'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {lang === 'uk' ? preset.titleUk : preset.titleEn}
            </button>
          );
        })}
      </div>

      {/* Custom prompt input */}
      <div className="relative">
        <input
          type="text"
          value={customStyle}
          onChange={(e) => onChangeStyle(e.target.value)}
          placeholder={
            lang === 'uk'
              ? 'Наприклад: Жвавий, дружній голос із теплою усмішкою...'
              : 'E.g., Cheerful, friendly voice with natural warm cadence...'
          }
          className="w-full px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-sans"
        />
      </div>
    </div>
  );
};
