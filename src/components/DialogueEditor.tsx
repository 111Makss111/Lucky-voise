import React from 'react';
import { DialogueLine, VoiceName } from '../types';
import { CORE_VOICES } from '../data/voices';
import { Plus, Trash2, ArrowUpDown, UserCheck, Sparkles, MessageSquare } from 'lucide-react';

interface DialogueEditorProps {
  dialogue: DialogueLine[];
  onChangeDialogue: (lines: DialogueLine[]) => void;
  lang?: 'uk' | 'en';
}

export const DialogueEditor: React.FC<DialogueEditorProps> = ({
  dialogue,
  onChangeDialogue,
  lang = 'uk',
}) => {
  const addLine = () => {
    const lastSpeaker = dialogue[dialogue.length - 1];
    const newSpeaker = lastSpeaker?.speaker === 'Лакі' ? 'Друг' : 'Лакі';
    const newVoice: VoiceName = newSpeaker === 'Лакі' ? 'Puck' : 'Kore';

    const newLine: DialogueLine = {
      id: Math.random().toString(36).substring(2, 9),
      speaker: newSpeaker,
      voiceName: newVoice,
      text: '',
      style: newSpeaker === 'Лакі' ? 'Energetic and friendly' : 'Warm and curious',
    };
    onChangeDialogue([...dialogue, newLine]);
  };

  const removeLine = (id: string) => {
    if (dialogue.length <= 2) return;
    onChangeDialogue(dialogue.filter((l) => l.id !== id));
  };

  const updateLine = (id: string, updates: Partial<DialogueLine>) => {
    onChangeDialogue(
      dialogue.map((l) => (l.id === id ? { ...l, ...updates } : l))
    );
  };

  const loadPresetDialogue = (type: 'intro' | 'podcast' | 'banter') => {
    if (type === 'intro') {
      onChangeDialogue([
        {
          id: '1',
          speaker: 'Лакі',
          voiceName: 'Puck',
          text: 'Привіт! Я Лакі, твій новий голосовий асистент! <laugh> Як твій настрій сьогодні?',
          style: 'Joyful, enthusiastic Lucky voice',
        },
        {
          id: '2',
          speaker: 'Друг',
          voiceName: 'Kore',
          text: 'Привіт, Лакі! |yeah| Настрій просто супер, особливо коли чую такий живий та приємний голос!',
          style: 'Warm and genuine friend tone',
        },
        {
          id: '3',
          speaker: 'Лакі',
          voiceName: 'Puck',
          text: 'Дякую! <breath> Це все завдяки моделі Gemini 3.8 Flash TTS. Давай створимо щось дивовижне разом!',
          style: 'Proud and cheerful Lucky voice',
        },
      ]);
    } else if (type === 'podcast') {
      onChangeDialogue([
        {
          id: '1',
          speaker: 'Лакі',
          voiceName: 'Puck',
          text: 'Вітаємо у новому випуску подкасту Лакі! Сьогодні ми говоримо про голосовий інтелект майбутнього.',
          style: 'Confident, vibrant podcast host',
        },
        {
          id: '2',
          speaker: 'Експерт',
          voiceName: 'Fenrir',
          text: 'Так, Лакі. |mhm| Сучасні моделі тепер вміють передавати не просто слова, а справжні людські емоції та дихання.',
          style: 'Deep, thoughtful analytical expert voice',
        },
        {
          id: '3',
          speaker: 'Лакі',
          voiceName: 'Puck',
          text: 'Це фантастика! <laugh> Тільки послухайте, як природно звучить наш діалог!',
          style: 'Excited and amazed',
        },
      ]);
    } else {
      onChangeDialogue([
        {
          id: '1',
          speaker: 'Лакі',
          voiceName: 'Puck',
          text: 'Чув останній жарт про штучний інтелект? <breath>',
          style: 'Playful and curious',
        },
        {
          id: '2',
          speaker: 'Друг',
          voiceName: 'Zephyr',
          text: 'Ні, Лакі, розкажи! Дуже цікаво. |yeah|',
          style: 'Calm and intrigued',
        },
        {
          id: '3',
          speaker: 'Лакі',
          voiceName: 'Puck',
          text: 'Він попросив чашку кави, але йому дали лише біти та байти! <laugh>',
          style: 'Bursting with laughter',
        },
      ]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Preset Dialogues */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-900/50 border border-slate-800 rounded-xl">
        <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>{lang === 'uk' ? 'Готові сценарії діалогів:' : 'Dialogue presets:'}</span>
        </span>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => loadPresetDialogue('intro')}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700 transition-colors cursor-pointer"
          >
            {lang === 'uk' ? 'Знайомство Лакі' : 'Lucky Intro'}
          </button>
          <button
            type="button"
            onClick={() => loadPresetDialogue('podcast')}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700 transition-colors cursor-pointer"
          >
            {lang === 'uk' ? 'Міні-подкаст' : 'Mini Podcast'}
          </button>
          <button
            type="button"
            onClick={() => loadPresetDialogue('banter')}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700 transition-colors cursor-pointer"
          >
            {lang === 'uk' ? 'Жарт / розмова' : 'Joke & Laugh'}
          </button>
        </div>
      </div>

      {/* Turn by turn list */}
      <div className="space-y-3">
        {dialogue.map((line, index) => {
          const isLucky = line.speaker.toLowerCase().includes('лакі') || line.speaker.toLowerCase().includes('lucky');
          return (
            <div
              key={line.id}
              className={`p-3.5 rounded-xl border transition-all ${
                isLucky
                  ? 'bg-indigo-950/30 border-indigo-500/40'
                  : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-[11px] font-mono font-bold text-slate-300 flex items-center justify-center">
                    {index + 1}
                  </span>

                  {/* Speaker name */}
                  <input
                    type="text"
                    value={line.speaker}
                    onChange={(e) => updateLine(line.id, { speaker: e.target.value })}
                    className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs font-semibold text-slate-100 focus:outline-none focus:border-indigo-500 w-28"
                    placeholder="Ім'я спікера"
                  />

                  {/* Voice selector */}
                  <select
                    value={line.voiceName}
                    onChange={(e) => updateLine(line.id, { voiceName: e.target.value as VoiceName })}
                    className="px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs text-indigo-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    {CORE_VOICES.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.gender})
                      </option>
                    ))}
                  </select>
                </div>

                {dialogue.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeLine(line.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                    title={lang === 'uk' ? 'Видалити репліку' : 'Remove line'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Text Area */}
              <textarea
                rows={2}
                value={line.text}
                onChange={(e) => updateLine(line.id, { text: e.target.value })}
                placeholder={
                  lang === 'uk'
                    ? 'Введіть репліку... можна додавати <laugh>, <breath>, |yeah|'
                    : 'Enter speaker line... vocal tags <laugh>, <breath>, |yeah| supported'
                }
                className="w-full px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none font-sans"
              />

              {/* Style instruction */}
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[11px] text-slate-400 shrink-0">
                  {lang === 'uk' ? 'Інтонація:' : 'Emotion:'}
                </span>
                <input
                  type="text"
                  value={line.style || ''}
                  onChange={(e) => updateLine(line.id, { style: e.target.value })}
                  placeholder={lang === 'uk' ? 'напр. Радісно, з теплою усмішкою' : 'e.g. Enthusiastic, warm smile'}
                  className="w-full px-2 py-1 bg-slate-950/40 border border-slate-800/80 rounded-lg text-[11px] text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Line button */}
      <button
        type="button"
        onClick={addLine}
        className="w-full py-2.5 px-4 bg-slate-900/80 hover:bg-slate-800 border border-dashed border-slate-700 hover:border-indigo-500/60 rounded-xl text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer"
      >
        <Plus className="w-4 h-4 text-indigo-400" />
        <span>{lang === 'uk' ? 'Додати наступну репліку в діалог' : 'Add another speaker turn'}</span>
      </button>
    </div>
  );
};
