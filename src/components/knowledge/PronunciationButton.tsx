import { useRef, useState } from 'react';
import { Volume2 } from 'lucide-react';

interface PronunciationButtonProps {
  /** Word to pronounce — used by the Web Speech API fallback */
  word: string;
  /** Optional pre-recorded audio file (mp3/wav). Takes precedence over speech synthesis. */
  audioSrc?: string;
  /** BCP-47 lang tag for synthesis (default 'en-US') */
  lang?: string;
  /** Optional phonetic spelling shown on hover, e.g. /ˈæs.trə.nɔːt/ */
  phonetic?: string;
  className?: string;
}

export function PronunciationButton({
  word,
  audioSrc,
  lang = 'en-US',
  phonetic,
  className,
}: PronunciationButtonProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const play = () => {
    if (audioSrc) {
      if (!audioRef.current) audioRef.current = new Audio(audioSrc);
      const a = audioRef.current;
      a.currentTime = 0;
      setPlaying(true);
      a.onended = () => setPlaying(false);
      void a.play().catch(() => setPlaying(false));
      return;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(word);
      u.lang = lang;
      u.rate = 0.95;
      setPlaying(true);
      u.onend = () => setPlaying(false);
      u.onerror = () => setPlaying(false);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    }
  };

  return (
    <button
      type="button"
      onClick={play}
      title={phonetic ? `${word} ${phonetic}` : `Pronounce ${word}`}
      aria-label={`Pronounce ${word}`}
      className={`inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors ${
        playing ? 'border-primary text-primary' : ''
      } ${className ?? ''}`}
    >
      <Volume2 className={`h-3 w-3 ${playing ? 'animate-pulse' : ''}`} />
      {phonetic ?? 'say it'}
    </button>
  );
}
