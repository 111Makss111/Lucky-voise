import React, { useState } from 'react';
import { Bot, Sparkles, Wand2, BookOpen, Smile, ShieldAlert, Check } from 'lucide-react';

interface AiAssistantProps {
  currentText: string;
  onApplyScript: (script: string) => void;
  lang?: 'uk' | 'en';
}

export const AiAssistant: React.FC<AiAssistantProps> = ({
  currentText,
  onApplyScript,
  lang = 'uk',
}) => {
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePrompt = async (action: 'greeting' | 'story' | 'polish' | 'motivation') => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/assistant/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          topic: topic.trim() || undefined,
          currentText,
          userName: 'Лакі',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate script with Gemini.');
      }

      if (data.result) {
        onApplyScript(data.result);
      }
    } catch (err: any) {
      console.error('Script assistant error:', err);
      setError(err?.message || 'Could not generate script.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-indigo-950/30 border border-slate-800 rounded-2xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
              <span>{lang === 'uk' ? 'AI Асистент сценаріїв Лакі' : 'Lucky Script Assistant'}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                gemini-3.8-flash
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              {lang === 'uk'
                ? 'Генерація живих текстів з вокальними вигуками спеціально для озвучення'
                : 'Generates expressive scripts with vocal cues tailored for Gemini TTS'}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-3 p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
          <span className="truncate">{error}</span>
        </div>
      )}

      {/* Quick Action buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        <button
          type="button"
          disabled={isLoading}
          onClick={() => generatePrompt('greeting')}
          className="p-2.5 bg-slate-800/80 hover:bg-indigo-900/40 hover:border-indigo-500/40 border border-slate-700/80 rounded-xl text-left transition-all cursor-pointer group disabled:opacity-50"
        >
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 group-hover:text-indigo-300 mb-0.5">
            <Smile className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'uk' ? 'Привітання' : 'Greeting'}</span>
          </div>
          <p className="text-[10px] text-slate-400">
            {lang === 'uk' ? 'Теплий спіч від Лакі' : 'Lively greeting from Lucky'}
          </p>
        </button>

        <button
          type="button"
          disabled={isLoading}
          onClick={() => generatePrompt('story')}
          className="p-2.5 bg-slate-800/80 hover:bg-indigo-900/40 hover:border-indigo-500/40 border border-slate-700/80 rounded-xl text-left transition-all cursor-pointer group disabled:opacity-50"
        >
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 group-hover:text-indigo-300 mb-0.5">
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>{lang === 'uk' ? 'Міні-історія' : 'Micro Story'}</span>
          </div>
          <p className="text-[10px] text-slate-400">
            {lang === 'uk' ? 'Пригода або казка' : 'Adventure or tale'}
          </p>
        </button>

        <button
          type="button"
          disabled={isLoading}
          onClick={() => generatePrompt('motivation')}
          className="p-2.5 bg-slate-800/80 hover:bg-indigo-900/40 hover:border-indigo-500/40 border border-slate-700/80 rounded-xl text-left transition-all cursor-pointer group disabled:opacity-50"
        >
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 group-hover:text-indigo-300 mb-0.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>{lang === 'uk' ? 'Мотивація' : 'Inspiration'}</span>
          </div>
          <p className="text-[10px] text-slate-400">
            {lang === 'uk' ? 'Надихаючі слова' : 'Uplifting message'}
          </p>
        </button>

        <button
          type="button"
          disabled={isLoading || !currentText.trim()}
          onClick={() => generatePrompt('polish')}
          className="p-2.5 bg-slate-800/80 hover:bg-indigo-900/40 hover:border-indigo-500/40 border border-slate-700/80 rounded-xl text-left transition-all cursor-pointer group disabled:opacity-40"
          title={!currentText.trim() ? (lang === 'uk' ? 'Введіть текст вище для покращення' : 'Type text above first') : undefined}
        >
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 group-hover:text-indigo-300 mb-0.5">
            <Wand2 className="w-3.5 h-3.5 text-purple-400" />
            <span>{lang === 'uk' ? 'Покращити текст' : 'Polish for TTS'}</span>
          </div>
          <p className="text-[10px] text-slate-400">
            {lang === 'uk' ? 'Паузи та <laugh>' : 'Add pauses & emotion'}
          </p>
        </button>
      </div>

      {/* Optional Custom Topic */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder={
            lang === 'uk'
              ? 'Тема для історії або привітання (наприклад: "перший політ на Марс", "ранок біля моря")...'
              : 'Topic for story or greeting (e.g. "morning coffee", "first spaceflight")...'
          }
          className="flex-1 px-3 py-1.5 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
        {isLoading && (
          <span className="text-xs text-indigo-400 flex items-center gap-1 font-mono shrink-0">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>Gemini...</span>
          </span>
        )}
      </div>
    </div>
  );
};
