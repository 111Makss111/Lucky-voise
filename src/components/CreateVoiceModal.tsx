import React, { useState } from 'react';
import { VoicePersona, VoiceName, VoiceCategory } from '../types';
import { CORE_VOICES } from '../data/voices';
import { X, Sparkles, Wand2, Mic, Palette } from 'lucide-react';

interface CreateVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveVoice: (voice: VoicePersona) => void;
  lang?: 'uk' | 'en';
}

const COLOR_OPTIONS = [
  'from-violet-600 to-indigo-600',
  'from-emerald-500 to-teal-700',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-cyan-500 to-blue-600',
  'from-fuchsia-600 to-purple-800',
];

export const CreateVoiceModal: React.FC<CreateVoiceModalProps> = ({
  isOpen,
  onClose,
  onSaveVoice,
  lang = 'uk',
}) => {
  const [name, setName] = useState('');
  const [baseVoice, setBaseVoice] = useState<VoiceName>('Puck');
  const [gender, setGender] = useState<'Чоловічий' | 'Жіночий' | 'Нейтральний' | 'Дитячий'>('Чоловічий');
  const [tag, setTag] = useState('');
  const [traitsInput, setTraitsInput] = useState('Жвавий, Харизматичний, Теплий');
  const [description, setDescription] = useState('');
  const [voicePrompt, setVoicePrompt] = useState(
    'Friendly, natural Ukrainian speaker with distinct expressive character'
  );
  const [colorIndex, setColorIndex] = useState(0);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const traits = traitsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const newPersona: VoicePersona = {
      id: `custom_${Date.now()}`,
      name: name.trim(),
      baseVoice,
      category: 'custom',
      gender,
      tag: tag.trim() || (lang === 'uk' ? 'Власний голос' : 'Custom Voice'),
      traits: traits.length > 0 ? traits : ['Унікальний', 'Експресивний'],
      descriptionUk: description.trim() || 'Власний авторський голос, створений у Lucky Voice Studio.',
      descriptionEn: description.trim() || 'Custom user-designed voice created in Lucky Voice Studio.',
      avatarColor: COLOR_OPTIONS[colorIndex],
      defaultStyle: voicePrompt.trim(),
      isCustom: true,
    };

    onSaveVoice(newPersona);
    onClose();
  };

  const handleApplyPresetArchetype = (archetype: 'robot' | 'hero' | 'fairy' | 'gamer') => {
    if (archetype === 'robot') {
      setName('Кібер-Асистент 3000');
      setBaseVoice('Zephyr');
      setGender('Нейтральний');
      setTag('Sci-Fi / AI');
      setTraitsInput('Електронний, Спокійний, Точний');
      setDescription('Теплий штучний інтелект з майбутнього з ритмічною дикцією.');
      setVoicePrompt('Calm, precise, futuristic benevolent AI assistant with clear crisp articulation');
      setColorIndex(4);
    } else if (archetype === 'hero') {
      setName('Капітан Зорельоту');
      setBaseVoice('Fenrir');
      setGender('Чоловічий');
      setTag('Космос / Лідер');
      setTraitsInput('Мужній, Впевнений, Командний');
      setDescription('Капітан дослідницького зорельоту, що віддає накази екіпажу.');
      setVoicePrompt('Commanding, bold, heroic spaceship captain with deep courageous voice');
      setColorIndex(1);
    } else if (archetype === 'fairy') {
      setName('Лісова Мавка');
      setBaseVoice('Aoede');
      setGender('Жіночий');
      setTag('Фентезі / Магія');
      setTraitsInput('Магічна, Дзвінка, Загадкова');
      setDescription('Чарівна лісова мавка з мелодійним дзвінким сміхом.');
      setVoicePrompt('Enchanting, mystical, ethereal Ukrainian forest spirit with melodic pauses and light whisper');
      setColorIndex(3);
    } else {
      setName('Геймер-Стример Влад');
      setBaseVoice('Puck');
      setGender('Чоловічий');
      setTag('Стрими / YouTube');
      setTraitsInput('Драйвовий, Веселий, Швидкий');
      setDescription('Енергійний стример комп’ютерних ігор з емоційними реакціями.');
      setVoicePrompt('Fast-talking, hyped, funny Ukrainian gaming streamer reacting with passion and laughs');
      setColorIndex(2);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <Wand2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>{lang === 'uk' ? 'Створити власний голос (Voice Design)' : 'Design a Custom Voice'}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Gemini 3.8
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              {lang === 'uk'
                ? 'Налаштуйте унікальний характер, тембр та мовний стиль'
                : 'Configure a unique persona, base timbre, and speech style prompt'}
            </p>
          </div>
        </div>

        {/* Quick Archetype suggestions */}
        <div className="mb-5 p-3 bg-slate-950/60 rounded-2xl border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 block mb-2">
            {lang === 'uk' ? 'Швидкі шаблони характерів:' : 'Quick character archetypes:'}
          </span>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => handleApplyPresetArchetype('robot')}
              className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
            >
              🤖 Кібер-AI
            </button>
            <button
              type="button"
              onClick={() => handleApplyPresetArchetype('hero')}
              className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
            >
              🚀 Капітан
            </button>
            <button
              type="button"
              onClick={() => handleApplyPresetArchetype('fairy')}
              className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
            >
              ✨ Мавка
            </button>
            <button
              type="button"
              onClick={() => handleApplyPresetArchetype('gamer')}
              className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
            >
              🎮 Стример
            </button>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Name & Gender */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {lang === 'uk' ? 'Назва або ім’я голосу *' : 'Voice Name *'}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={lang === 'uk' ? 'напр. Лакі - Казкар' : 'e.g. Lucky Storyteller'}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {lang === 'uk' ? 'Тип / категорія' : 'Gender / Category'}
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="Чоловічий">Чоловічий</option>
                <option value="Жіночий">Жіночий</option>
                <option value="Нейтральний">Нейтральний / Робот</option>
                <option value="Дитячий">Дитячий</option>
              </select>
            </div>
          </div>

          {/* Base Engine Timbre */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              {lang === 'uk' ? 'Базовий акустичний тембр Gemini 3.8 *' : 'Base Gemini 3.8 Core Voice *'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CORE_VOICES.map((cv) => (
                <button
                  type="button"
                  key={cv.id}
                  onClick={() => setBaseVoice(cv.id)}
                  className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                    baseVoice === cv.id
                      ? 'bg-indigo-950 border-indigo-500 text-white ring-1 ring-indigo-500'
                      : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold">{cv.name}</div>
                  <div className="text-[10px] text-slate-400">{cv.gender}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Voice Prompt (Style direction for Gemini) */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              {lang === 'uk' ? 'Промпт стилю для Gemini 3.8 (Speech Style Prompt) *' : 'Voice Direction Prompt *'}
            </label>
            <textarea
              rows={2}
              required
              value={voicePrompt}
              onChange={(e) => setVoicePrompt(e.target.value)}
              placeholder="e.g. Wise raspy grandfather storyteller with slow pacing and warm laughter..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              {lang === 'uk'
                ? 'Цей опис передається прямо в модель Gemini для формування інтонацій та характеру мовлення.'
                : 'Directly steers speech rhythm, timbre, warmth, and emotion in Gemini 3.8 Flash TTS.'}
            </span>
          </div>

          {/* Tags / Traits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {lang === 'uk' ? 'Риси характеру (через кому)' : 'Traits (comma separated)'}
              </label>
              <input
                type="text"
                value={traitsInput}
                onChange={(e) => setTraitsInput(e.target.value)}
                placeholder="Жвавий, Теплий, Енергійний"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {lang === 'uk' ? 'Тег бейджик' : 'Badge Tag'}
              </label>
              <input
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="напр. Авторський голос"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Avatar Color */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-indigo-400" />
              <span>{lang === 'uk' ? 'Колір іконки персонажа' : 'Avatar Color'}</span>
            </label>
            <div className="flex gap-2">
              {COLOR_OPTIONS.map((c, i) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColorIndex(i)}
                  className={`w-7 h-7 rounded-xl bg-gradient-to-tr ${c} transition-all cursor-pointer ${
                    colorIndex === i ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
            >
              {lang === 'uk' ? 'Скасувати' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{lang === 'uk' ? 'Зберегти голос' : 'Save Voice'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
