import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json({ limit: '10mb' }));

// 1. CORS Middleware: Enables seamless local integration from other ports (e.g. localhost:5173, localhost:8000)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  res.setHeader('Access-Control-Allow-Origin', origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// 2. Security Middleware: Optional Local API Key authentication
// When LUCKY_API_KEY is configured in .env, external tools must provide it in 'x-api-key' or 'Authorization: Bearer <token>'
const validateApiKey = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const requiredKey = process.env.LUCKY_API_KEY;
  if (!requiredKey) {
    // If not set, open for convenient local development
    return next();
  }

  // Allow same-origin requests from the studio UI
  const isSameOrigin = req.headers['sec-fetch-site'] === 'same-origin';
  if (isSameOrigin) {
    return next();
  }

  const providedKey =
    req.headers['x-api-key'] ||
    req.headers.authorization?.replace(/^Bearer\s+/i, '') ||
    req.query.api_key;

  if (providedKey !== requiredKey) {
    return res.status(401).json({
      error: 'Unauthorized: Invalid or missing API key. Send your key via "x-api-key" header, "Authorization: Bearer <key>", or query parameter "?api_key=".',
    });
  }

  next();
};

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is missing. Please set your key in Settings > Secrets or in your local .env file.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Health check and local API status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    hasLocalApiKeySecurity: Boolean(process.env.LUCKY_API_KEY),
    model: 'gemini-3.8-flash-tts',
    supportedVoices: ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr', 'Aoede'],
  });
});

// Helper for core TTS synthesis
async function synthesizeSpeech({
  text,
  voiceName = 'Puck',
  style,
  isDialogue = false,
  dialogue = [],
}: {
  text?: string;
  voiceName?: string;
  style?: string;
  isDialogue?: boolean;
  dialogue?: any[];
}) {
  const ai = getGeminiClient();
  const validVoices = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr', 'Aoede'];
  const chosenVoice = validVoices.includes(voiceName) ? voiceName : 'Puck';

  let base64Audio: string | undefined;

  if (isDialogue && Array.isArray(dialogue) && dialogue.length >= 2) {
    const speaker1 = dialogue[0];
    const speaker2 = dialogue[1];
    const s1Name = (speaker1.speaker || 'Lucky').trim();
    const s2Name = (speaker2.speaker || 'Friend').trim();

    const s1Voice = validVoices.includes(speaker1.voiceName) ? speaker1.voiceName : 'Puck';
    const s2Voice = validVoices.includes(speaker2.voiceName) ? speaker2.voiceName : 'Kore';

    const parts = dialogue.map((item) => ({
      text: `${item.speaker || 'Speaker'}: ${item.text}`,
      speechMetadata: {
        speaker: item.speaker || 'Speaker',
        style: item.style || style || 'Natural, warm tone',
      },
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-tts',
      contents: [{ role: 'user', parts }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          multiSpeakerVoiceConfig: {
            speakerVoiceConfigs: [
              {
                speaker: s1Name,
                voiceConfig: { prebuiltVoiceConfig: { voiceName: s1Voice } },
              },
              {
                speaker: s2Name,
                voiceConfig: { prebuiltVoiceConfig: { voiceName: s2Voice } },
              },
            ],
          },
        },
      },
    });

    base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } else {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: (text || '').trim(),
              speechMetadata: style ? { style: style.trim() } : undefined,
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: chosenVoice },
          },
        },
      },
    });

    base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  }

  return { base64Audio, chosenVoice };
}

// 3. Primary POST /api/tts endpoint (Supports JSON response OR direct binary WAV streaming)
app.post('/api/tts', validateApiKey, async (req, res) => {
  try {
    const {
      text,
      voiceName = 'Puck',
      style,
      isDialogue = false,
      dialogue = [],
      format, // 'wav' or 'json'
    } = req.body;

    if (!text && (!dialogue || dialogue.length === 0)) {
      return res.status(400).json({ error: 'Text or dialogue lines are required for TTS.' });
    }

    const { base64Audio, chosenVoice } = await synthesizeSpeech({
      text,
      voiceName,
      style,
      isDialogue,
      dialogue,
    });

    if (!base64Audio) {
      return res.status(502).json({
        error: 'Gemini TTS did not return audio data in the response candidates.',
      });
    }

    // Direct binary WAV streaming if requested
    const wantsWavBinary =
      format === 'wav' ||
      req.query.format === 'wav' ||
      req.headers.accept?.includes('audio/wav');

    if (wantsWavBinary) {
      const audioBuffer = Buffer.from(base64Audio, 'base64');
      res.setHeader('Content-Type', 'audio/wav');
      res.setHeader('Content-Length', audioBuffer.length);
      res.setHeader('Content-Disposition', 'inline; filename="lucky-speech.wav"');
      return res.send(audioBuffer);
    }

    // Default JSON payload
    return res.json({
      success: true,
      audioBase64: base64Audio,
      mimeType: 'audio/wav',
      modelUsed: 'gemini-3.8-flash-tts',
      voiceName: chosenVoice,
    });
  } catch (error: any) {
    console.error('Error generating TTS:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate speech with Gemini TTS.',
    });
  }
});

// 4. GET /api/tts/stream endpoint: Returns direct playable audio/wav for <audio src="..."> or curl
app.get('/api/tts/stream', validateApiKey, async (req, res) => {
  try {
    const text = (req.query.text as string) || '';
    const voiceName = (req.query.voiceName as string) || (req.query.voice as string) || 'Puck';
    const style = (req.query.style as string) || undefined;

    if (!text.trim()) {
      return res.status(400).send('Query parameter "text" is required.');
    }

    const { base64Audio } = await synthesizeSpeech({ text, voiceName, style });
    if (!base64Audio) {
      return res.status(502).send('Failed to generate audio from Gemini.');
    }

    const audioBuffer = Buffer.from(base64Audio, 'base64');
    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Content-Length', audioBuffer.length);
    res.setHeader('Content-Disposition', 'inline; filename="lucky-speech.wav"');
    return res.send(audioBuffer);
  } catch (error: any) {
    console.error('Stream error:', error);
    return res.status(500).send(error?.message || 'TTS generation error');
  }
});

// 5. AI Script Assistant using gemini-3.8-flash
app.post('/api/assistant/generate-script', validateApiKey, async (req, res) => {
  try {
    const { action, topic, currentText, userName = 'Лакі' } = req.body;
    const ai = getGeminiClient();

    let prompt = '';
    if (action === 'greeting') {
      prompt = `Склади тепле, радісне привітання українською мовою від імені ${userName}. Це має бути природний текст для озвучення (TTS), з живими емоціями, приблизно 2-3 речення. Можна вставити вокальні теги <laugh> або <breath> де це природно.`;
    } else if (action === 'story') {
      prompt = `Напиши коротку захопливу або кумедну історію/притчу українською мовою про героя на ім'я ${userName} на тему: "${topic || 'несподівана пригода'}". Довжина: 4-6 речень. Зроби речення легкими для сприйняття на слух. Додай 1-2 вокальні вигуки або паузи (наприклад <breath>, <laugh>, |yeah|).`;
    } else if (action === 'polish') {
      prompt = `Ось текст для озвучення голосом (TTS):
"${currentText}"

Оптимізуй його для читання вголос: покращ пунктуацію для природних пауз, розстав за потреби теги емоцій (<laugh>, <breath>, <sigh>, |mhm|), збережи мову оригіналу (якщо українська - пиши чудовою українською). Поверни лише готовий текст.`;
    } else if (action === 'dialogue') {
      prompt = `Склади короткий живий діалог (4 репліки загалом) між "${userName}" та його співрозмовником на тему "${topic || 'цікава подорож'}". 
Поверни JSON у форматі:
[
  {"speaker": "${userName}", "text": "...", "style": "Cheerful and enthusiastic"},
  {"speaker": "Друг", "text": "...", "style": "Curious and friendly"},
  {"speaker": "${userName}", "text": "...", "style": "Excited with <laugh>"},
  {"speaker": "Друг", "text": "...", "style": "Impressed"}
]`;
    } else {
      prompt = `Склади надихаюче повідомлення для озвучки для ${userName} на тему "${topic || 'успіх та натхнення'}". 3-4 речення українською мовою.`;
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'Ти експерт із написання текстів для озвучування (Text-to-Speech) українською та іншими мовами. Тексти мають звучати максимально природно, життєво, мелодійно.',
        },
      });

      const outputText = response.text || '';
      return res.json({ result: outputText.trim() });
    } catch (apiErr: any) {
      console.warn('Gemini assistant spike/error, returning curated script:', apiErr?.message);
      let fallbackText = '';
      if (action === 'greeting') {
        fallbackText = `Привіт усім! Мене звати ${userName}, і я дуже радий вас вітати! <laugh> Бажаю вам чудового дня та неймовірного натхнення! <breath>`;
      } else if (action === 'story') {
        fallbackText = `Одного сонячного ранку ${userName} вийшов на прогулянку у пошуках нових пригод. <breath> Вітерець тихо шепотів між деревами, а попереду відкривалася стежка до таємничого замку звуків. <laugh> "Це початок чогось грандіозного!" — вигукнув ${userName}. |yeah|`;
      } else if (action === 'polish') {
        fallbackText = (currentText || '')
          .replace(/!+/g, '! <laugh>')
          .replace(/\?+/g, '? <breath>')
          .trim();
      } else if (action === 'dialogue') {
        fallbackText = `[{"speaker":"${userName}","text":"Привіт! Як настрій сьогодні? <laugh>","style":"Joyful"},{"speaker":"Друг","text":"Привіт, ${userName}! Все чудово, готовий до пригод! |yeah|","style":"Warm"}]`;
      } else {
        fallbackText = `Пам'ятай: кожен новий день — це можливість зробити щось особливе. <breath> Вір у свої сили, посміхайся частіше і ніколи не зупиняйся! <laugh>`;
      }
      return res.json({ result: fallbackText });
    }
  } catch (error: any) {
    console.error('Error generating script:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate script with Gemini assistant.',
    });
  }
});

// Setup Vite or static serving
const setupFrontend = async () => {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true, host: '0.0.0.0' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Lucky Voice Studio server running on http://0.0.0.0:${PORT}`);
  });
};

if (process.env.VERCEL !== '1') {
  setupFrontend().catch((err) => {
    console.error('Failed to start server:', err);
  });
}

export default app;
