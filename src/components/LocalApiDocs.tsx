import React, { useState, useEffect } from 'react';
import { Terminal, Shield, Check, Copy, Code, Sparkles, FileAudio, Lock, Globe } from 'lucide-react';

interface LocalApiDocsProps {
  lang?: 'uk' | 'en';
}

export const LocalApiDocs: React.FC<LocalApiDocsProps> = ({ lang = 'uk' }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [healthStatus, setHealthStatus] = useState<any>(null);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setHealthStatus(data))
      .catch((err) => console.warn('Health check error:', err));
  }, []);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const curlJsonSnippet = `curl -X POST http://localhost:3000/api/tts \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: my_secret_local_key" \\
  -d '{
    "text": "Привіт! Мене звати Лакі, голос згенеровано локальним API!",
    "voiceName": "Puck",
    "style": "Warm, cheerful, energetic Ukrainian speaker"
  }'`;

  const curlWavSnippet = `# Завантажити безпосередньо готовий аудіофайл .wav:
curl -X POST http://localhost:3000/api/tts \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: my_secret_local_key" \\
  -d '{"text": "Привіт! Аудіофайл збережено напряму.", "voiceName": "Puck", "format": "wav"}' \\
  --output speech.wav`;

  const jsFetchSnippet = `// Приклад для вашого іншого проекту (React / Vue / Node.js / Electron):
async function generateLuckyVoice(text, voice = 'Puck') {
  const response = await fetch('http://localhost:3000/api/tts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'my_secret_local_key', // той самий ключ з .env
    },
    body: JSON.stringify({
      text: text,
      voiceName: voice,
      style: 'Natural, cheerful Ukrainian speaker',
    }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error);

  // data.audioBase64 - повний WAV файл (24kHz Mono 16-bit)
  const audio = new Audio(\`data:audio/wav;base64,\${data.audioBase64}\`);
  audio.play();
  return data;
}`;

  const pythonSnippet = `# Приклад для вашого Python проекту (FastAPI, Flask, CLI, AI bot):
import requests

url = "http://localhost:3000/api/tts"
headers = {
    "Content-Type": "application/json",
    "x-api-key": "my_secret_local_key", # ключ з .env
}
payload = {
    "text": "Привіт з мого Python інструменту!",
    "voiceName": "Puck",
    "format": "wav", # повертає одразу бінарний аудіопотік
}

response = requests.post(url, json=payload, headers=headers)
if response.status_code == 200:
    with open("output.wav", "wb") as f:
        f.write(response.content)
    print("Успішно збережено в output.wav!")
else:
    print("Помилка:", response.text)`;

  const audioTagSnippet = `<!-- Пряме відтворення через GET запит у будь-якому HTML -->
<audio controls src="http://localhost:3000/api/tts/stream?text=Привіт&voice=Puck&api_key=my_secret_local_key">
</audio>`;

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-gradient-to-br from-indigo-950/60 via-slate-900/80 to-slate-900 border border-indigo-500/30 rounded-2xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                <Terminal className="w-4 h-4" />
              </span>
              <h2 className="text-base font-bold text-white">
                {lang === 'uk'
                  ? 'Безпечний локальний API для ваших інших проектів'
                  : 'Secure Local API for Your Other Tools'}
              </h2>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
              {lang === 'uk'
                ? 'Цей сервер працює локально на вашому комп’ютері (порт 3000) та надає готовий REST API для будь-яких зовнішніх додатків (Python, Node.js, браузер, скрипти). Всі запити обробляються моделлю gemini-3.8-flash-tts.'
                : 'This server runs locally on your machine (port 3000) and exposes a clean REST API for any external tools (Python, Node.js, scripts). Powered by gemini-3.8-flash-tts.'}
            </p>
          </div>

          <div className="hidden sm:flex flex-col items-end gap-1.5 shrink-0">
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              CORS Enabled
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              http://localhost:3000
            </span>
          </div>
        </div>
      </div>

      {/* Security Principles Guide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
            <Lock className="w-3.5 h-3.5" />
            <span>1. Авторизація (API Secret)</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Вкажіть у локальному файлі <code className="text-indigo-300 font-mono">.env</code> рядок <code className="text-amber-300 font-mono">LUCKY_API_KEY="ваш_секретний_ключ"</code>. Тоді інші додатки повинні передавати заголовок <code className="text-indigo-300 font-mono">x-api-key</code>.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
            <Globe className="w-3.5 h-3.5" />
            <span>2. CORS Підтримка</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Сервер автоматично дозволяє запити з будь-якого локального порта (localhost:5173, 8000, 4000), тому ваш браузер чи фронтенд не буде блокуватись браузерною політикою безпеки.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <FileAudio className="w-3.5 h-3.5" />
            <span>3. Формати відповідей</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Можна отримувати як <code className="text-indigo-300 font-mono">JSON (base64)</code>, так і прямий потік бінарного аудіофайлу <code className="text-emerald-300 font-mono">audio/wav</code> за допомогою прапорця <code className="text-amber-300 font-mono">"format": "wav"</code>.
          </p>
        </div>
      </div>

      {/* Code Snippets Accordion / Cards */}
      <div className="space-y-4">
        {/* cURL Snippet */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold text-slate-200">
                cURL / Термінал (Швидкий тест)
              </h3>
            </div>
            <button
              onClick={() => handleCopy(curlWavSnippet, 'curl')}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
            >
              {copiedKey === 'curl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'curl' ? 'Скопійовано' : 'Копіювати cURL'}</span>
            </button>
          </div>
          <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto">
            {curlWavSnippet}
          </pre>
        </div>

        {/* JavaScript / TypeScript */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold text-slate-200">
                JavaScript / TypeScript (Fetch у вашому іншому проєкті)
              </h3>
            </div>
            <button
              onClick={() => handleCopy(jsFetchSnippet, 'js')}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
            >
              {copiedKey === 'js' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'js' ? 'Скопійовано' : 'Копіювати код'}</span>
            </button>
          </div>
          <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto">
            {jsFetchSnippet}
          </pre>
        </div>

        {/* Python Snippet */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-bold text-slate-200">
                Python (requests / FastAPI / AI agent)
              </h3>
            </div>
            <button
              onClick={() => handleCopy(pythonSnippet, 'py')}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
            >
              {copiedKey === 'py' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'py' ? 'Скопійовано' : 'Копіювати Python'}</span>
            </button>
          </div>
          <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-indigo-300 overflow-x-auto">
            {pythonSnippet}
          </pre>
        </div>

        {/* HTML Audio Streaming Snippet */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileAudio className="w-4 h-4 text-purple-400" />
              <h3 className="text-xs font-bold text-slate-200">
                Прямий GET URL (для &lt;audio src&gt; або плеєрів)
              </h3>
            </div>
            <button
              onClick={() => handleCopy(audioTagSnippet, 'audio')}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
            >
              {copiedKey === 'audio' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'audio' ? 'Скопійовано' : 'Копіювати тег'}</span>
            </button>
          </div>
          <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-purple-300 overflow-x-auto">
            {audioTagSnippet}
          </pre>
        </div>
      </div>
    </div>
  );
};
