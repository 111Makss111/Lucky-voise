import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Volume2,
  Sparkles,
  Play,
  RotateCcw,
  Copy,
  Check,
  Languages,
  BookOpen,
  MessageSquare,
  Wand2,
  Music,
  Download,
  AlertCircle,
  HelpCircle,
  Radio,
  Smile,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { VoiceName, DialogueLine, ClipHistoryItem, VoicePersona } from './types';
import { INITIAL_VOICE_PERSONAS, SAMPLE_SCRIPTS, STYLE_PRESETS } from './data/voices';
import { VoiceSelector } from './components/VoiceSelector';
import { StyleSelector } from './components/StyleSelector';
import { VocalBurstsBar } from './components/VocalBurstsBar';
import { AudioPlayer } from './components/AudioPlayer';
import { DialogueEditor } from './components/DialogueEditor';
import { AiAssistant } from './components/AiAssistant';
import { HistoryList } from './components/HistoryList';
import { LocalApiDocs } from './components/LocalApiDocs';
import { CreateVoiceModal } from './components/CreateVoiceModal';
import { Terminal } from 'lucide-react';

const CUSTOM_VOICES_STORAGE_KEY = 'lucky_custom_voices';

export default function App() {
  const [lang, setLang] = useState<'uk' | 'en'>('uk');
  const [activeTab, setActiveTab] = useState<'solo' | 'dialogue' | 'library' | 'api'>('solo');

  // Personas collection (built-in + user created)
  const [personas, setPersonas] = useState<VoicePersona[]>(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_VOICES_STORAGE_KEY);
      if (saved) {
        const parsed: VoicePersona[] = JSON.parse(saved);
        return [...INITIAL_VOICE_PERSONAS, ...parsed];
      }
    } catch (e) {
      console.error('Failed to load custom voices from storage:', e);
    }
    return INITIAL_VOICE_PERSONAS;
  });

  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('lucky_signature');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const selectedPersona =
    personas.find((p) => p.id === selectedPersonaId) || personas[0];

  // Solo mode state
  const [text, setText] = useState<string>(
    'Привіт! Мене звати Лакі, і я радий вас вітати у нашій новій голосовій студії! <laugh> Як ваші справи сьогодні?'
  );
  const [customStyle, setCustomStyle] = useState<string>(selectedPersona.defaultStyle);

  // Dialogue mode state
  const [dialogue, setDialogue] = useState<DialogueLine[]>([
    {
      id: '1',
      speaker: 'Лакі',
      voiceName: 'Puck',
      text: 'Привіт! Мене звати Лакі! <laugh> Ти готовий протестувати наш новий голос?',
      style: 'Enthusiastic and welcoming Lucky tone',
    },
    {
      id: '2',
      speaker: 'Друг',
      voiceName: 'Kore',
      text: 'Привіт, Лакі! |yeah| Звісно, голос звучить просто неймовірно чисто та природно!',
      style: 'Curious and delighted friend tone',
    },
  ]);

  // Audio & synthesis state
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentAudioBase64, setCurrentAudioBase64] = useState<string | null>(null);
  const [currentAudioText, setCurrentAudioText] = useState<string>('');
  const [currentVoiceUsed, setCurrentVoiceUsed] = useState<string>('Лакі - Оптиміст');
  const [history, setHistory] = useState<ClipHistoryItem[]>([]);
  const [copied, setCopied] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Save custom persona
  const handleSaveCustomVoice = (newPersona: VoicePersona) => {
    const updated = [newPersona, ...personas];
    setPersonas(updated);
    setSelectedPersonaId(newPersona.id);
    setCustomStyle(newPersona.defaultStyle);

    try {
      const customOnly = updated.filter((p) => p.isCustom);
      localStorage.setItem(CUSTOM_VOICES_STORAGE_KEY, JSON.stringify(customOnly));
    } catch (e) {
      console.error('Failed to save custom voices to localStorage:', e);
    }
  };

  // Delete custom persona
  const handleDeleteCustomVoice = (personaId: string) => {
    const updated = personas.filter((p) => p.id !== personaId);
    setPersonas(updated);
    if (selectedPersonaId === personaId) {
      setSelectedPersonaId('lucky_signature');
      setCustomStyle(INITIAL_VOICE_PERSONAS[0].defaultStyle);
    }

    try {
      const customOnly = updated.filter((p) => p.isCustom);
      localStorage.setItem(CUSTOM_VOICES_STORAGE_KEY, JSON.stringify(customOnly));
    } catch (e) {
      console.error('Failed to update custom voices in localStorage:', e);
    }
  };

  // Select persona handler
  const handleSelectPersona = (persona: VoicePersona) => {
    setSelectedPersonaId(persona.id);
    setCustomStyle(persona.defaultStyle);
  };

  // Insert tag at textarea cursor
  const handleInsertTag = (tag: string) => {
    const el = textareaRef.current;
    if (!el) {
      setText((prev) => `${prev} ${tag} `);
      return;
    }

    const start = el.selectionStart || 0;
    const end = el.selectionEnd || 0;
    const newText = text.substring(0, start) + ` ${tag} ` + text.substring(end);
    setText(newText);

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + tag.length + 2, start + tag.length + 2);
    }, 50);
  };

  // Synthesize via Gemini 3.8 Flash TTS
  const handleSynthesize = async () => {
    const isSolo = activeTab === 'solo';
    const textToSpeak = isSolo ? text.trim() : '';

    if (isSolo && !textToSpeak) {
      setErrorMessage(
        lang === 'uk' ? 'Будь ласка, введіть текст для озвучення.' : 'Please enter text to synthesize.'
      );
      return;
    }

    if (!isSolo && (!dialogue || dialogue.length === 0)) {
      setErrorMessage(
        lang === 'uk' ? 'Діалог повинен містити хоча б репліку.' : 'Dialogue needs at least one line.'
      );
      return;
    }

    setIsSynthesizing(true);
    setErrorMessage(null);

    try {
      const payload = isSolo
        ? {
            text: textToSpeak,
            voiceName: selectedPersona.baseVoice,
            style: customStyle.trim() || selectedPersona.defaultStyle,
            isDialogue: false,
          }
        : {
            isDialogue: true,
            dialogue: dialogue.map((line) => ({
              speaker: line.speaker,
              voiceName: line.voiceName,
              text: line.text,
              style: line.style,
            })),
          };

      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to synthesize speech with Gemini TTS.');
      }

      if (data.audioBase64) {
        setCurrentAudioBase64(data.audioBase64);
        setCurrentVoiceUsed(isSolo ? selectedPersona.name : 'Діалог двох голосів');
        const snippet = isSolo
          ? textToSpeak
          : dialogue.map((d) => `${d.speaker}: ${d.text}`).join(' | ');
        setCurrentAudioText(snippet);

        // Add to history
        const newItem: ClipHistoryItem = {
          id: Math.random().toString(36).substring(2, 9),
          timestamp: Date.now(),
          text: snippet,
          audioBase64: data.audioBase64,
          voiceName: selectedPersona.baseVoice,
          personaName: isSolo ? selectedPersona.name : 'Dialogue',
          style: isSolo ? customStyle : undefined,
          isDialogue: !isSolo,
        };
        setHistory((prev) => [newItem, ...prev.slice(0, 19)]);
      }
    } catch (err: any) {
      console.error('Synthesis error:', err);
      setErrorMessage(err?.message || 'Error communicating with TTS server.');
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadSampleScript = (script: (typeof SAMPLE_SCRIPTS)[0]) => {
    setText(script.text);
    if (script.personaId) {
      const found = personas.find((p) => p.id === script.personaId);
      if (found) {
        setSelectedPersonaId(found.id);
        setCustomStyle(found.defaultStyle);
      }
    }
    setActiveTab('solo');
  };

  const handlePlayFromHistory = (item: ClipHistoryItem) => {
    setCurrentAudioBase64(item.audioBase64);
    setCurrentAudioText(item.text);
    setCurrentVoiceUsed(item.personaName || item.voiceName);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                  Lucky Voice Studio
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold flex items-center gap-1">
                  <Smile className="w-3 h-3" />
                  Лакі
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Powered by <span className="text-indigo-400 font-semibold">gemini-3.8-flash-tts</span>
              </p>
            </div>
          </div>

          {/* Engine Badges & Controls */}
          <div className="flex items-center gap-2.5">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{personas.length} Голосів & Персонажів</span>
            </div>

            {/* Language Toggle */}
            <button
              onClick={() => setLang(lang === 'uk' ? 'en' : 'uk')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 font-medium transition-colors cursor-pointer"
              title="Перемкнути мову інтерфейсу"
            >
              <Languages className="w-3.5 h-3.5 text-indigo-400" />
              <span>{lang === 'uk' ? 'UA' : 'EN'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full">
        {/* Welcome Greeting Banner for Lucky */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950/60 via-slate-900/90 to-purple-950/40 border border-indigo-500/30 p-6 sm:p-8 mb-8 shadow-xl shadow-indigo-950/20">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>
                {lang === 'uk' ? 'Розширена колекція: 12+ голосів та Voice Designer' : 'Expanded: 12+ Voices & Voice Designer'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
              {lang === 'uk'
                ? 'Привіт, Лакі! Обирайте серед десятків унікальних голосів'
                : 'Hello Lucky! Choose from dozens of unique voice personas'}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
              {lang === 'uk'
                ? 'Тепер доступна велика колекція: фірмовий Лакі, казковий дід Богдан, диктор новин Оксана, глибокий кіноепос Фенрір, DJ Макс, релакс-шепіт, дитячий бешкетник, а також конструктор створення власних голосів!'
                : 'Now with an expanded catalog: signature Lucky, fairytale storyteller, news anchor, cinematic baritone, DJ Max, ASMR whisper, kid persona, plus custom Voice Design!'}
            </p>
          </div>

          {/* Decorative background glow */}
          <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute right-40 -top-10 w-60 h-60 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Studio Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('solo')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'solo'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>{lang === 'uk' ? 'Каталог голосів (Лакі та інші)' : 'Voice Catalog (Lucky & More)'}</span>
          </button>

          <button
            onClick={() => setActiveTab('dialogue')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'dialogue'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>{lang === 'uk' ? 'Діалог 2-х голосів (Подкаст)' : 'Dual Dialogue (Podcast)'}</span>
          </button>

          <button
            onClick={() => setActiveTab('library')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'library'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>{lang === 'uk' ? 'Готові фрази та казки' : 'Preset Scripts & Tales'}</span>
          </button>

          <button
            onClick={() => setActiveTab('api')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'api'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>{lang === 'uk' ? 'Локальний API & Інтеграція' : 'Local API & Integration'}</span>
          </button>
        </div>

        {/* Content based on tab */}
        {activeTab === 'api' ? (
          <LocalApiDocs lang={lang} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column (Input & Settings) */}
            <div className="lg:col-span-7 space-y-6">
              {/* TAB 1: Solo Voice Mode */}
              {activeTab === 'solo' && (
              <div className="space-y-6">
                {/* Voice Selector Cards */}
                <VoiceSelector
                  personas={personas}
                  selectedPersonaId={selectedPersonaId}
                  onSelectPersona={handleSelectPersona}
                  onOpenCreateModal={() => setIsCreateModalOpen(true)}
                  onDeleteCustomVoice={handleDeleteCustomVoice}
                  lang={lang}
                />

                {/* Text Input Area */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                      <span>{lang === 'uk' ? 'Текст для читання вголос' : 'Script to Speak'}</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        ({text.length} {lang === 'uk' ? 'символів' : 'chars'})
                      </span>
                    </label>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCopyText}
                        className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
                        title={lang === 'uk' ? 'Скопіювати текст' : 'Copy text'}
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? (lang === 'uk' ? 'Скопійовано' : 'Copied') : (lang === 'uk' ? 'Копіювати' : 'Copy')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setText('')}
                        className="text-[11px] text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                      >
                        {lang === 'uk' ? 'Очистити' : 'Clear'}
                      </button>
                    </div>
                  </div>

                  <textarea
                    ref={textareaRef}
                    rows={5}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={
                      lang === 'uk'
                        ? 'Введіть текст українською або іншою мовою... Використовуйте <laugh>, <breath>, <sigh> для живих емоцій!'
                        : 'Enter text to speak... Use <laugh>, <breath>, <sigh> for lifelike vocal nuances!'
                    }
                    className="w-full px-3.5 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-sans leading-relaxed"
                  />

                  {/* Vocal bursts toolbar */}
                  <VocalBurstsBar onInsertTag={handleInsertTag} lang={lang} />
                </div>

                {/* Speech Style Direction */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
                  <StyleSelector
                    customStyle={customStyle}
                    onChangeStyle={setCustomStyle}
                    lang={lang}
                  />
                </div>

                {/* AI Script Assistant powered by gemini-3.8-flash */}
                <AiAssistant
                  currentText={text}
                  onApplyScript={(newScript) => setText(newScript)}
                  lang={lang}
                />
              </div>
            )}

            {/* TAB 2: Multi-Speaker Dialogue Mode */}
            {activeTab === 'dialogue' && (
              <div className="space-y-6">
                <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-2xl p-4">
                  <h3 className="text-xs font-bold text-indigo-300 flex items-center gap-1.5 mb-1">
                    <Radio className="w-4 h-4 text-indigo-400" />
                    <span>
                      {lang === 'uk'
                        ? 'Двохголосий синтез Gemini 3.8 Flash TTS'
                        : 'Dual-Speaker Native TTS'}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {lang === 'uk'
                      ? 'Модель Gemini 3.8 Flash TTS самостійно озвучує повноцінний діалог двох персонажів в єдиний студійний аудіофайл із синхронізованими паузами та інтонаціями!'
                      : 'Gemini 3.8 Flash TTS natively renders a dual-speaker script into one seamless studio audio track with natural pacing and dynamic voice acting!'}
                  </p>
                </div>

                <DialogueEditor
                  dialogue={dialogue}
                  onChangeDialogue={setDialogue}
                  lang={lang}
                />
              </div>
            )}

            {/* TAB 3: Preset Library */}
            {activeTab === 'library' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-300">
                    {lang === 'uk' ? 'Бібліотека підготовлених фраз для різних голосів' : 'Ready-to-Use Scripts & Character Tales'}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SAMPLE_SCRIPTS.map((script) => (
                    <div
                      key={script.id}
                      className="bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-4 space-y-2.5 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-100">{script.title}</span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-indigo-300 font-medium border border-slate-700">
                          {script.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                        "{script.text}"
                      </p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-slate-400 font-mono">
                          База: {script.voice}
                        </span>
                        <button
                          type="button"
                          onClick={() => loadSampleScript(script)}
                          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
                        >
                          {lang === 'uk' ? 'Використати' : 'Load script'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error Notification */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">{lang === 'uk' ? 'Помилка озвучення' : 'Synthesis error'}</p>
                  <p className="text-[11px] text-rose-200/90 mt-0.5">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Primary Action Button: Synthesize */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSynthesize}
                disabled={isSynthesizing}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-600 hover:from-indigo-600 hover:via-purple-700 hover:to-indigo-700 text-white font-bold text-sm shadow-xl shadow-indigo-600/25 hover:shadow-indigo-600/40 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2.5 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSynthesizing ? (
                  <>
                    <Sparkles className="w-5 h-5 animate-spin" />
                    <span>
                      {lang === 'uk'
                        ? 'Gemini 3.8 Flash TTS синтезує голос...'
                        : 'Gemini 3.8 Flash TTS is generating audio...'}
                    </span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-5 h-5" />
                    <span>
                      {activeTab === 'dialogue'
                        ? lang === 'uk'
                          ? 'Озвучити діалог двох голосів'
                          : 'Synthesize Dual-Speaker Dialogue'
                        : lang === 'uk'
                        ? `Озвучити голосом "${selectedPersona.name}"`
                        : `Generate Speech with "${selectedPersona.name}"`}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column (Audio Player & History) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Player Card */}
            <div className="sticky top-24 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                    <Music className="w-4 h-4 text-indigo-400" />
                    <span>{lang === 'uk' ? 'Аудіоплеєр та візуалізатор' : 'Audio Player & Visualizer'}</span>
                  </h2>
                </div>

                <AudioPlayer
                  audioBase64={currentAudioBase64}
                  voiceName={currentVoiceUsed}
                  textSnippet={currentAudioText}
                  lang={lang}
                />
              </div>

              {/* History Shelf */}
              <HistoryList
                history={history}
                onPlayClip={handlePlayFromHistory}
                onClearHistory={() => setHistory([])}
                lang={lang}
              />

              {/* Model Info Card */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{lang === 'uk' ? 'Параметри аудіосистеми' : 'Audio System Specs'}</span>
                </div>
                <ul className="text-[11px] text-slate-400 space-y-1.5">
                  <li className="flex justify-between">
                    <span>TTS Модель:</span>
                    <span className="font-mono text-indigo-300">gemini-3.8-flash-tts</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Кількість голосів:</span>
                    <span className="font-mono text-emerald-400 font-semibold">{personas.length} персонажів</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Формат аудіо:</span>
                    <span className="font-mono text-slate-200">WAV (24kHz, Mono 16-bit)</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Voice Design:</span>
                    <span className="font-mono text-amber-300">Акустичний промптинг</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
      </main>

      {/* Voice Designer Modal */}
      <CreateVoiceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSaveVoice={handleSaveCustomVoice}
        lang={lang}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <p>
          Lucky Voice Studio • Gemini 3.8 Flash TTS & Expressive Voice Design
        </p>
      </footer>
    </div>
  );
}
