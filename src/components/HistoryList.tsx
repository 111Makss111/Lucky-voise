import React from 'react';
import { ClipHistoryItem } from '../types';
import { Play, Download, Trash2, Clock, Volume2, Sparkles } from 'lucide-react';

interface HistoryListProps {
  history: ClipHistoryItem[];
  onPlayClip: (clip: ClipHistoryItem) => void;
  onClearHistory: () => void;
  lang?: 'uk' | 'en';
}

export const HistoryList: React.FC<HistoryListProps> = ({
  history,
  onPlayClip,
  onClearHistory,
  lang = 'uk',
}) => {
  if (history.length === 0) {
    return null;
  }

  const formatTimestamp = (ts: number) => {
    const date = new Date(ts);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleDownload = (clip: ClipHistoryItem) => {
    try {
      const byteCharacters = atob(clip.audioBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lucky-${clip.voiceName.toLowerCase()}-${clip.timestamp}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Download error:', e);
    }
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-bold text-slate-200">
            {lang === 'uk' ? 'Історія генерацій сесії' : 'Session History'} ({history.length})
          </h3>
        </div>
        <button
          onClick={onClearHistory}
          className="text-[11px] text-slate-500 hover:text-rose-400 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <Trash2 className="w-3 h-3" />
          <span>{lang === 'uk' ? 'Очистити' : 'Clear'}</span>
        </button>
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
        {history.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-3 p-2.5 bg-slate-950/60 hover:bg-slate-950 border border-slate-800/80 rounded-xl transition-colors"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                onClick={() => onPlayClip(item)}
                className="w-8 h-8 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                title={lang === 'uk' ? 'Відтворити' : 'Play'}
              >
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
              </button>
              <div className="min-w-0">
                <p className="text-xs text-slate-200 truncate font-medium">
                  {item.text}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                  <span className="font-semibold text-indigo-300">{item.voiceName}</span>
                  <span>•</span>
                  <span>{formatTimestamp(item.timestamp)}</span>
                  {item.isDialogue && (
                    <>
                      <span>•</span>
                      <span className="text-amber-400 font-medium">Діалог</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => handleDownload(item)}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shrink-0"
              title={lang === 'uk' ? 'Завантажити WAV' : 'Download WAV'}
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
