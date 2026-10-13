import React, { useState } from 'react';
import { VoicePersona, VoiceCategory } from '../types';
import { Mic, Check, Sparkles, Plus, Search, Trash2, SlidersHorizontal } from 'lucide-react';

interface VoiceSelectorProps {
  personas: VoicePersona[];
  selectedPersonaId: string;
  onSelectPersona: (persona: VoicePersona) => void;
  onOpenCreateModal: () => void;
  onDeleteCustomVoice?: (personaId: string) => void;
  lang?: 'uk' | 'en';
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  personas,
  selectedPersonaId,
  onSelectPersona,
  onOpenCreateModal,
  onDeleteCustomVoice,
  lang = 'uk',
}) => {
  const [activeCategory, setActiveCategory] = useState<VoiceCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories: { id: VoiceCategory; labelUk: string; labelEn: string }[] = [
    { id: 'all', labelUk: 'Всі голоси', labelEn: 'All Voices' },
    { id: 'lucky', labelUk: 'Для Лакі', labelEn: 'Lucky' },
    { id: 'narrator', labelUk: 'Оповідачі & Казки', labelEn: 'Narrators' },
    { id: 'energetic', labelUk: 'Радіо & Драйв', labelEn: 'Radio & Energy' },
    { id: 'calm', labelUk: 'Релакс & Затишок', labelEn: 'Calm & Relax' },
    { id: 'custom', labelUk: 'Власні', labelEn: 'Custom' },
  ];

  const filteredPersonas = personas.filter((p) => {
    const matchesCategory =
      activeCategory === 'all' ||
      p.category === activeCategory ||
      (activeCategory === 'custom' && p.isCustom);

    const matchesSearch =
      searchQuery.trim() === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.traits.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-3.5">
      {/* Top Header & Create Voice Button */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Mic className="w-4 h-4 text-indigo-400" />
            <span>{lang === 'uk' ? 'Каталог голосів та персонажів' : 'Voices & Personas Catalog'}</span>
          </label>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            {personas.length} {lang === 'uk' ? 'голосів' : 'voices'}
          </span>
        </div>

        <button
          type="button"
          onClick={onOpenCreateModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{lang === 'uk' ? 'Створити власний голос' : 'Design Custom Voice'}</span>
        </button>
      </div>

      {/* Category Pills & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1 text-xs font-medium rounded-xl whitespace-nowrap transition-colors cursor-pointer border ${
                activeCategory === cat.id
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {lang === 'uk' ? cat.labelUk : cat.labelEn}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[180px]">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'uk' ? 'Пошук тембру чи рис...' : 'Search voice or traits...'}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Personas Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[380px] overflow-y-auto pr-1">
        {filteredPersonas.map((p) => {
          const isSelected = selectedPersonaId === p.id;
          return (
            <div
              key={p.id}
              onClick={() => onSelectPersona(p)}
              className={`group relative rounded-2xl p-3.5 border transition-all cursor-pointer text-left ${
                isSelected
                  ? 'bg-gradient-to-br from-indigo-950/90 to-slate-900 border-indigo-500 shadow-lg shadow-indigo-500/15 ring-1 ring-indigo-500'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${p.avatarColor} flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0`}
                  >
                    {p.name[0]}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-100 truncate flex items-center gap-1.5">
                      <span>{p.name}</span>
                    </h4>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                      <span className="font-mono text-indigo-300">База: {p.baseVoice}</span>
                      <span>•</span>
                      <span>{p.gender}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {p.isCustom && onDeleteCustomVoice && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteCustomVoice(p.id);
                      }}
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                      title={lang === 'uk' ? 'Видалити авторський голос' : 'Delete custom voice'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {isSelected ? (
                    <div className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-xs">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-slate-700 group-hover:border-slate-500 transition-colors" />
                  )}
                </div>
              </div>

              {/* Badge Tag */}
              <div className="mb-2">
                <span className="inline-block px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-medium text-amber-300 border border-slate-700/60">
                  {p.tag}
                </span>
              </div>

              {/* Description */}
              <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-2 mb-2.5">
                {lang === 'uk' ? p.descriptionUk : p.descriptionEn}
              </p>

              {/* Trait badges */}
              <div className="flex flex-wrap gap-1">
                {p.traits.map((trait, idx) => (
                  <span
                    key={idx}
                    className="px-1.5 py-0.5 rounded-md bg-slate-950/60 text-[10px] text-slate-400 border border-slate-800 font-medium"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          );
        })}

        {filteredPersonas.length === 0 && (
          <div className="col-span-full py-8 text-center text-slate-500 text-xs">
            {lang === 'uk'
              ? 'Голосів за даним запитом не знайдено.'
              : 'No voices matched your search.'}
          </div>
        )}
      </div>
    </div>
  );
};
