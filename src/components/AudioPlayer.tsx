import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Download, Volume2, VolumeX, Sparkles, Sliders } from 'lucide-react';

interface AudioPlayerProps {
  audioBase64: string | null;
  mimeType?: string;
  voiceName?: string;
  textSnippet?: string;
  onDownload?: () => void;
  lang?: 'uk' | 'en';
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioBase64,
  mimeType = 'audio/wav',
  voiceName = 'Puck',
  textSnippet = '',
  lang = 'uk',
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Convert base64 to object URL when audioBase64 changes
  useEffect(() => {
    if (!audioBase64) {
      setAudioUrl(null);
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      return;
    }

    try {
      const byteCharacters = atob(audioBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);

      // Reset state for new audio
      setIsPlaying(false);
      setCurrentTime(0);

      return () => {
        URL.revokeObjectURL(url);
      };
    } catch (err) {
      console.error('Failed to create audio blob URL:', err);
    }
  }, [audioBase64, mimeType]);

  // Audio element listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      audio.playbackRate = playbackRate;
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [playbackRate]);

  // Visualizer with Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const draw = () => {
      if (!isRunning) return;

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const barCount = 36;
      const barWidth = (width / barCount) - 2;

      for (let i = 0; i < barCount; i++) {
        let barHeight = 6;
        if (isPlaying) {
          // Dynamic lively oscillation based on frequency simulation
          const wave = Math.sin((Date.now() / 150) + i * 0.4) * 0.5 + 0.5;
          const wave2 = Math.cos((Date.now() / 220) - i * 0.3) * 0.5 + 0.5;
          barHeight = 8 + (wave * 0.6 + wave2 * 0.4) * (height - 14);
        }

        const x = i * (barWidth + 2);
        const y = height - barHeight;

        // Gradient from violet to cyan
        const gradient = ctx.createLinearGradient(0, height, 0, 0);
        gradient.addColorStop(0, '#6366f1'); // Indigo
        gradient.addColorStop(0.5, '#8b5cf6'); // Purple
        gradient.addColorStop(1, '#06b6d4'); // Cyan

        ctx.fillStyle = isPlaying ? gradient : '#cbd5e1';
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 3);
        ctx.fill();
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      isRunning = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.error('Audio playback failed:', err);
      });
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      if (audioRef.current) audioRef.current.volume = volume || 0.8;
    } else {
      setIsMuted(true);
      if (audioRef.current) audioRef.current.volume = 0;
    }
  };

  const handleDownload = () => {
    if (!audioUrl) return;
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `lucky-gemini-tts-${voiceName.toLowerCase()}-${Date.now()}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!audioUrl) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 text-center text-slate-400">
        <div className="w-12 h-12 mx-auto rounded-full bg-slate-800/80 flex items-center justify-center text-slate-500 mb-3">
          <Sparkles className="w-6 h-6 text-indigo-400" />
        </div>
        <p className="text-sm font-medium text-slate-300">
          {lang === 'uk' ? 'Аудіодоріжка ще не згенерована' : 'No audio synthesized yet'}
        </p>
        <p className="text-xs text-slate-500 mt-1">
          {lang === 'uk'
            ? 'Введіть або оберіть текст для Лакі та натисніть "Озвучити голосом Gemini 3.8"'
            : 'Enter or choose text for Lucky and press "Synthesize with Gemini 3.8"'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-900/90 via-indigo-950/40 to-slate-900/90 border border-indigo-500/30 shadow-xl shadow-indigo-950/20 rounded-2xl p-5 backdrop-blur-md">
      <audio ref={audioRef} src={audioUrl} />

      {/* Top row: Track Info & Badges */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-indigo-500/20">
            <Volume2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {voiceName} (WAV 24kHz)
              </span>
              <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                gemini-3.8-flash-tts
              </span>
            </div>
            {textSnippet && (
              <p className="text-xs text-slate-300 truncate mt-0.5 max-w-md">
                "{textSnippet}"
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 hover:border-indigo-400/40 transition-colors cursor-pointer"
            title={lang === 'uk' ? 'Завантажити WAV аудіо' : 'Download WAV audio'}
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">WAV</span>
          </button>
        </div>
      </div>

      {/* Waveform Visualizer Canvas */}
      <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 mb-4">
        <canvas
          ref={canvasRef}
          width={600}
          height={48}
          className="w-full h-12 block"
        />
      </div>

      {/* Progress & Duration */}
      <div className="space-y-1 mb-4">
        <input
          type="range"
          min={0}
          max={duration || 1}
          step={0.01}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
        />
        <div className="flex justify-between text-[11px] font-mono text-slate-400">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Play Controls & Speed / Volume Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
        {/* Play / Replay */}
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlay}
            className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play();
                setIsPlaying(true);
              }
            }}
            className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
            title={lang === 'uk' ? 'Слухати спочатку' : 'Restart audio'}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Playback speed selector */}
        <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
          {[0.75, 1, 1.25, 1.5].map((rate) => (
            <button
              key={rate}
              onClick={() => handleRateChange(rate)}
              className={`px-2 py-1 text-xs font-mono font-medium rounded-lg transition-colors cursor-pointer ${
                playbackRate === rate
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>

        {/* Volume control */}
        <div className="flex items-center gap-2 text-slate-400">
          <button
            onClick={toggleMute}
            className="hover:text-slate-200 transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-16 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>
      </div>
    </div>
  );
};
