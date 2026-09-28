import React, { useState, useEffect, useRef } from 'react';
import { Rocket, Trophy, Heart, RotateCcw, Volume2, Sparkles, Zap, Crosshair, AlertCircle, Target, CheckCircle2, Hand, X } from 'lucide-react';
import { VocabItem } from '../types';
import { speakChinese, SoundEffects } from '../utils/audio';

interface FallingWord {
  id: string;
  item: VocabItem;
  x: number; // 18% to 82%
  y: number; // 8% to 80%
  speed: number;
  rawPinyin: string;
  colorTheme: 'cyan' | 'amber' | 'purple' | 'emerald' | 'rose';
  spaceIcon: string;
  isDestroyed?: boolean;
}

interface LaserBeam {
  id: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  color: string;
}

interface Explosion {
  id: number;
  x: number;
  y: number;
  hanzi: string;
  pinyin: string;
  meaning: string;
}

interface SpaceTypingGameProps {
  vocabList: VocabItem[];
  speechRate: number;
  soundEnabled: boolean;
  onEarnStar: () => void;
}

// Convert tone-marked or formatted pinyin into plain ASCII, removing accents and handling Vietnamese Telex artifacts
export function normalizePinyin(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove tone marks
    .replace(/[0-9]/g, '') // remove tone numbers (1-5)
    .replace(/['’\s\-_.,!]/g, '') // remove apostrophes, spaces, punctuation
    .replace(/ü/g, 'v')
    .replace(/u:/g, 'v')
    .trim();
}

// Smart word matcher supporting standard pinyin, Telex keyboard quirks, and partial substring typing
export function isWordMatched(word: FallingWord, rawInput: string): boolean {
  const norm = normalizePinyin(rawInput);
  if (!norm) return false;

  // Direct match
  if (word.rawPinyin === norm) return true;
  if (normalizePinyin(word.item.pinyin) === norm) return true;

  // Vietnamese Telex tolerance:
  // e.g. "laoshi" typed with Telex becomes "láohi" (s was absorbed as acute accent into á)
  if (word.rawPinyin === 'laoshi' && (norm === 'laohi' || norm === 'laoshi' || norm === 'laosh')) return true;
  // e.g. "dianxin" typed with Telex 'dd' becomes "đianxin"
  if (word.rawPinyin === 'dianxin' && (norm === 'dianxin' || norm === 'ianxin')) return true;
  // e.g. "zhoumo" typed with Telex 'uo' -> 'ươ' / 'uô'
  if (word.rawPinyin === 'zhoumo' && (norm === 'zhoumo' || norm === 'zhomo' || norm === 'zhowmo')) return true;
  // e.g. "shuiguo"
  if (word.rawPinyin === 'shuiguo' && (norm === 'shuiguo' || norm === 'shuirguo' || norm === 'shuigwo')) return true;
  // e.g. "pingguo"
  if (word.rawPinyin === 'pingguo' && (norm === 'pingguo' || norm === 'pingsguo' || norm === 'pinggwo')) return true;
  // e.g. "meiyou"
  if (word.rawPinyin === 'meiyou' && (norm === 'meiyou' || norm === 'meisyou' || norm === 'meiyour')) return true;
  // e.g. "biyou"
  if (word.rawPinyin === 'biyou' && (norm === 'biyou' || norm === 'biryou' || norm === 'biyour')) return true;
  // e.g. "gongyuan"
  if (word.rawPinyin === 'gongyuan' && (norm === 'gongyuan' || norm === 'gongyuans')) return true;

  return false;
}

const COLOR_THEMES: ('cyan' | 'amber' | 'purple' | 'emerald' | 'rose')[] = [
  'cyan',
  'amber',
  'purple',
  'emerald',
  'rose',
];

const SPACE_ICONS = ['☄️', '🛸', '⭐', '🪐', '💎', '🚀', '✨', '👾'];

export const SpaceTypingGame: React.FC<SpaceTypingGameProps> = ({
  vocabList,
  speechRate,
  soundEnabled,
  onEarnStar,
}) => {
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [destroyedCount, setDestroyedCount] = useState(0);
  const [inputVal, setInputVal] = useState('');
  const [gameSpeed, setGameSpeed] = useState<'slow' | 'normal' | 'fast'>('slow');

  const [isGameOver, setIsGameOver] = useState(false);
  const [screenShake, setScreenShake] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [fallingWords, setFallingWords] = useState<FallingWord[]>([]);
  const [lasers, setLasers] = useState<LaserBeam[]>([]);
  const [explosions, setExplosions] = useState<Explosion[]>([]);
  const [rocketAngle, setRocketAngle] = useState(0);
  const [activeTargetId, setActiveTargetId] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const arenaRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | null>(null);
  const lastSpawnTime = useRef<number>(Date.now());
  const wordsQueue = useRef<VocabItem[]>([]);

  // Speed multiplier based on user speed setting
  const speedConfig = {
    slow: { multiplier: 0.08, spawnInterval: 4400 },
    normal: { multiplier: 0.12, spawnInterval: 3300 },
    fast: { multiplier: 0.17, spawnInterval: 2500 },
  }[gameSpeed];

  // Refill queue if running low
  const replenishWordsQueue = () => {
    if (wordsQueue.current.length < 5) {
      const shuffled = [...vocabList].sort(() => 0.5 - Math.random());
      wordsQueue.current.push(...shuffled);
    }
  };

  // Clear input box immediately in React state and in DOM
  const clearInputNow = () => {
    setInputVal('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    setActiveTargetId(null);
  };

  // Sound effect for wrong action
  const triggerMistake = (reason: string) => {
    if (soundEnabled) SoundEffects.wrong();
    setScreenShake(true);
    setErrorMessage(reason);

    setLives((prev) => {
      const nextLives = prev - 1;
      if (nextLives <= 0) {
        setIsGameOver(true);
      }
      return Math.max(0, nextLives);
    });

    setTimeout(() => {
      setScreenShake(false);
    }, 450);

    setTimeout(() => {
      setErrorMessage(null);
    }, 1800);
  };

  // Restart game
  const resetGame = () => {
    setScore(0);
    setLives(3);
    setDestroyedCount(0);
    setIsGameOver(false);
    clearInputNow();
    setFallingWords([]);
    setLasers([]);
    setExplosions([]);
    setErrorMessage(null);

    // Initial words queue
    wordsQueue.current = [...vocabList].sort(() => 0.5 - Math.random());
    lastSpawnTime.current = Date.now();

    // Spawn first word right away
    spawnWord();
  };

  const spawnWord = () => {
    replenishWordsQueue();
    if (wordsQueue.current.length === 0) return;

    const nextItem = wordsQueue.current.shift()!;
    const theme = COLOR_THEMES[Math.floor(Math.random() * COLOR_THEMES.length)];
    const icon = SPACE_ICONS[Math.floor(Math.random() * SPACE_ICONS.length)];

    const newWord: FallingWord = {
      id: `${nextItem.id}-${Date.now()}-${Math.random()}`,
      item: nextItem,
      x: 18 + Math.random() * 64, // Keep safely inside mobile screen bounds
      y: 7,
      speed: speedConfig.multiplier * (0.9 + Math.random() * 0.2),
      rawPinyin: normalizePinyin(nextItem.pinyin),
      colorTheme: theme,
      spaceIcon: icon,
    };
    setFallingWords((prev) => [...prev, newWord]);
  };

  useEffect(() => {
    resetGame();
  }, [vocabList, gameSpeed]);

  // Main game animation loop
  useEffect(() => {
    if (isGameOver) return;

    let prevTime = performance.now();

    const loop = (currentTime: number) => {
      const delta = (currentTime - prevTime) / 1000;
      prevTime = currentTime;

      // Spawn words periodically
      const now = Date.now();
      if (now - lastSpawnTime.current > speedConfig.spawnInterval) {
        spawnWord();
        lastSpawnTime.current = now;
      }

      // Update falling words
      setFallingWords((prev) => {
        const nextWords: FallingWord[] = [];
        let missedWordItem: VocabItem | null = null;

        for (const w of prev) {
          if (w.isDestroyed) continue;
          const nextY = w.y + w.speed * delta * 60;

          if (nextY >= 80) {
            // Missed -> Lost 1 life
            missedWordItem = w.item;
          } else {
            nextWords.push({ ...w, y: nextY });
          }
        }

        if (missedWordItem) {
          triggerMistake(`Để lọt từ "${missedWordItem.hanzi}" chạm đáy: -1 mạng! 💔`);
        }

        return nextWords;
      });

      requestRef.current = requestAnimationFrame(loop);
    };

    requestRef.current = requestAnimationFrame(loop);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isGameOver, speedConfig, soundEnabled]);

  // Core checker: looks for any match and immediately shoots & wipes the input box
  const checkAndShoot = (rawVal: string): boolean => {
    if (!rawVal) return false;
    const norm = normalizePinyin(rawVal);
    if (!norm) return false;

    // 1. Direct or fuzzy match with any active falling word
    let matchedWord = fallingWords.find(
      (w) => !w.isDestroyed && isWordMatched(w, rawVal)
    );

    // 2. Substring / suffix match:
    // If user previously typed characters without deleting (e.g. "chilaoshi" or "xyzzhoumo"),
    // check if the end of the input matches any word!
    if (!matchedWord) {
      matchedWord = fallingWords.find((w) => {
        if (w.isDestroyed) return false;
        // Ends with the pinyin of this falling word
        if (norm.endsWith(w.rawPinyin)) return true;
        // If word is >= 3 chars and is contained in the typed buffer
        if (w.rawPinyin.length >= 3 && norm.includes(w.rawPinyin)) return true;
        return false;
      });
    }

    if (matchedWord) {
      // Đúng -> Bắn trúng từ và TỰ ĐỘNG XÓA SẠCH Ô NHẬP NGAY LẬP TỨC!
      shootAndDestroy(matchedWord);
      clearInputNow();
      return true;
    }

    return false;
  };

  // Handle typing input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;

    // Check if the current value hits any word -> shoots & clears automatically!
    if (checkAndShoot(rawVal)) {
      return;
    }

    // Keep the current input value while typing
    setInputVal(rawVal);

    const normalizedTyped = normalizePinyin(rawVal);
    if (!normalizedTyped) {
      setActiveTargetId(null);
      return;
    }

    // Aim rocket towards word that starts with typed characters
    const partialMatch = fallingWords.find(
      (w) => !w.isDestroyed && (w.rawPinyin.startsWith(normalizedTyped) || isWordMatched(w, rawVal))
    );

    if (partialMatch) {
      setActiveTargetId(partialMatch.id);
      const dx = partialMatch.x - 50;
      const dy = partialMatch.y - 88;
      const angleDeg = (Math.atan2(dx, -dy) * 180) / Math.PI;
      setRocketAngle(angleDeg);
    } else {
      setActiveTargetId(null);
    }
  };

  // Submit on Enter or Space
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const hit = checkAndShoot(inputVal);
      if (!hit && inputVal.trim()) {
        triggerMistake(`Gõ sai pinyin "${inputVal}": -1 mạng! 💔`);
      }
      // ALWAYS clear on Enter or Space so user never has to waste time backspacing!
      clearInputNow();
    }
  };

  // Shoot laser at target word
  const shootAndDestroy = (target: FallingWord) => {
    if (target.isDestroyed) return;

    // Tự động xóa ô nhập pinyin ngay khi bắn trúng!
    clearInputNow();

    // Compute rocket angle
    const dx = target.x - 50;
    const dy = target.y - 88;
    const angleDeg = (Math.atan2(dx, -dy) * 180) / Math.PI;
    setRocketAngle(angleDeg);

    // Play sounds
    if (soundEnabled) {
      SoundEffects.laser();
      setTimeout(() => {
        SoundEffects.explosion();
        speakChinese(target.item.hanzi, { rate: speechRate });
      }, 90);
    }

    // Add laser beam
    const laserId = Date.now();
    setLasers((prev) => [
      ...prev,
      {
        id: laserId,
        startX: 50,
        startY: 88,
        targetX: target.x,
        targetY: target.y,
        color:
          target.colorTheme === 'amber'
            ? '#fbbf24'
            : target.colorTheme === 'rose'
            ? '#fb7185'
            : target.colorTheme === 'purple'
            ? '#c084fc'
            : '#22d3ee',
      },
    ]);

    setTimeout(() => {
      setLasers((prev) => prev.filter((l) => l.id !== laserId));
    }, 180);

    // Remove word immediately from screen
    setFallingWords((prev) => prev.filter((w) => w.id !== target.id));

    // Add explosion animation
    const explosionId = Date.now() + 1;
    setExplosions((prev) => [
      ...prev,
      {
        id: explosionId,
        x: target.x,
        y: target.y,
        hanzi: target.item.hanzi,
        pinyin: target.item.pinyin,
        meaning: target.item.vietnamese,
      },
    ]);

    setTimeout(() => {
      setExplosions((prev) => prev.filter((ex) => ex.id !== explosionId));
    }, 850);

    // Update score and count
    setScore((s) => s + 10);
    setDestroyedCount((c) => c + 1);
    onEarnStar();
  };

  // Helper styling for theme colors
  const getThemeStyles = (theme: FallingWord['colorTheme'], isTargeted: boolean) => {
    if (isTargeted) {
      return {
        cardBg: 'bg-slate-900/95 shadow-[0_0_25px_rgba(34,211,238,0.9)] ring-2 sm:ring-4 ring-cyan-400',
        tailColor: 'from-cyan-400 via-sky-500 to-transparent',
        textColor: 'text-cyan-200',
        borderColor: 'border-cyan-300',
        glowAura: 'shadow-[0_0_15px_#22d3ee]',
      };
    }
    switch (theme) {
      case 'amber':
        return {
          cardBg: 'bg-amber-950/85 shadow-[0_0_15px_rgba(245,158,11,0.5)]',
          tailColor: 'from-amber-400 via-orange-500 to-transparent',
          textColor: 'text-amber-200',
          borderColor: 'border-amber-400/80',
          glowAura: 'shadow-[0_0_10px_#f59e0b]',
        };
      case 'purple':
        return {
          cardBg: 'bg-purple-950/85 shadow-[0_0_15px_rgba(168,85,247,0.5)]',
          tailColor: 'from-purple-400 via-indigo-500 to-transparent',
          textColor: 'text-purple-200',
          borderColor: 'border-purple-400/80',
          glowAura: 'shadow-[0_0_10px_#a855f7]',
        };
      case 'emerald':
        return {
          cardBg: 'bg-emerald-950/85 shadow-[0_0_15px_rgba(16,185,129,0.5)]',
          tailColor: 'from-emerald-400 via-teal-500 to-transparent',
          textColor: 'text-emerald-200',
          borderColor: 'border-emerald-400/80',
          glowAura: 'shadow-[0_0_10px_#10b981]',
        };
      case 'rose':
        return {
          cardBg: 'bg-rose-950/85 shadow-[0_0_15px_rgba(244,63,94,0.5)]',
          tailColor: 'from-rose-400 via-red-500 to-transparent',
          textColor: 'text-rose-200',
          borderColor: 'border-rose-400/80',
          glowAura: 'shadow-[0_0_10px_#f43f5e]',
        };
      case 'cyan':
      default:
        return {
          cardBg: 'bg-sky-950/85 shadow-[0_0_20px_rgba(14,165,233,0.5)]',
          tailColor: 'from-sky-400 via-blue-500 to-transparent',
          textColor: 'text-sky-200',
          borderColor: 'border-sky-400/80',
          glowAura: 'shadow-[0_0_10px_#0ea5e9]',
        };
    }
  };

  return (
    <div className={`max-w-4xl mx-auto px-1 sm:px-4 py-1 sm:py-3 space-y-2 sm:space-y-3 ${screenShake ? 'animate-[wiggle_0.2s_ease-in-out_infinite]' : ''}`}>
      {/* Top Compact Sub-Header */}
      <div className="flex items-center justify-between gap-2 bg-white/95 backdrop-blur-sm px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl border-2 border-rose-200 shadow-xs">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-rose-500/10 border border-rose-300 text-rose-500 flex items-center justify-center shrink-0">
            <Rocket className="w-4 h-4 sm:w-5 sm:h-5 fill-rose-500" />
          </div>
          <div className="truncate">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="text-sm sm:text-lg font-black text-slate-800 font-['Baloo_2',sans-serif] truncate">
                Luyện Gõ Phi Thuyền Vũ Trụ
              </h2>
              <span className="inline-flex text-[9px] sm:text-[10px] font-extrabold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full border border-emerald-300 items-center gap-0.5">
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                <span>Tự động xóa Pinyin khi bắn trúng</span>
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate">
              Gõ đúng pinyin tự động bắn hạ và xóa ô gõ ngay lập tức
            </p>
          </div>
        </div>

        {/* Speed setting */}
        <div className="flex items-center gap-0.5 sm:gap-1 bg-slate-100 p-0.5 sm:p-1 rounded-xl shrink-0">
          <button
            onClick={() => setGameSpeed('slow')}
            className={`px-2 py-1 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${
              gameSpeed === 'slow'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🐢 Chậm
          </button>
          <button
            onClick={() => setGameSpeed('normal')}
            className={`px-2 py-1 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${
              gameSpeed === 'normal'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🐰 Vừa
          </button>
          <button
            onClick={() => setGameSpeed('fast')}
            className={`hidden xs:block px-2 py-1 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${
              gameSpeed === 'fast'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🚀 Nhanh
          </button>
        </div>
      </div>

      {/* Main Starry Space Game Arena */}
      <div
        ref={arenaRef}
        onClick={() => inputRef.current?.focus()}
        className={`relative w-full h-[350px] xs:h-[390px] sm:h-[480px] md:h-[520px] rounded-2xl sm:rounded-3xl overflow-hidden border-3 sm:border-4 shadow-xl select-none flex flex-col justify-between transition-colors duration-150 touch-manipulation ${
          screenShake ? 'border-red-500 bg-red-950/40' : 'border-slate-900'
        }`}
        style={{
          background: screenShake
            ? 'radial-gradient(ellipse at bottom, #450a0a 0%, #1a0505 100%)'
            : 'radial-gradient(ellipse at bottom, #111a2e 0%, #060810 100%)',
        }}
      >
        {/* Starfield simulation */}
        <div className="absolute inset-0 pointer-events-none opacity-80 overflow-hidden">
          <div className="absolute top-8 left-1/4 w-1.5 h-1.5 bg-white rounded-full animate-ping" />
          <div className="absolute top-16 right-1/3 w-2 h-2 bg-yellow-200 rounded-full animate-pulse" />
          <div className="absolute top-36 left-1/5 w-1 h-1 bg-sky-200 rounded-full" />
          <div className="absolute top-28 right-1/6 w-1.5 h-1.5 bg-pink-300 rounded-full animate-ping" />
          <div className="absolute top-48 left-1/2 w-2 h-2 bg-white rounded-full animate-pulse" />
          <div className="absolute top-64 right-1/4 w-1 h-1 bg-amber-100 rounded-full" />
          <div className="absolute top-1/2 left-8 w-1.5 h-1.5 bg-purple-200 rounded-full" />
          <div className="absolute top-12 left-3/4 w-2 h-2 bg-cyan-200 rounded-full animate-pulse" />
        </div>

        {/* Top HUD: Score, Destroyed count, Lives */}
        <div className="relative z-10 flex items-center justify-between p-2 sm:p-4">
          {/* Trophy Score */}
          <div className="flex items-center gap-1 bg-slate-900/85 backdrop-blur-md px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-xl sm:rounded-2xl border border-amber-500/40 text-amber-400 font-black text-xs sm:text-base shadow-md">
            <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400 text-amber-400" />
            <span>{score}</span>
          </div>

          {/* Destroyed count */}
          <div className="flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-md px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-xl sm:rounded-2xl border border-cyan-500/40 text-white font-bold text-xs sm:text-sm shadow-md">
            <Target className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-cyan-300 font-black">
              Đã hạ: {destroyedCount}
            </span>
          </div>

          {/* Lives: 3 Hearts */}
          <div className="flex items-center gap-1 bg-slate-900/85 backdrop-blur-md px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-xl sm:rounded-2xl border border-rose-500/40 text-rose-500 shadow-md">
            {[1, 2, 3].map((heart) => (
              <Heart
                key={heart}
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-200 ${
                  heart <= lives
                    ? 'fill-rose-500 text-rose-500 scale-100 animate-pulse'
                    : 'fill-transparent text-slate-700 scale-75 opacity-40'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Mobile touch hint overlay banner */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 pointer-events-none z-10 opacity-70 flex items-center gap-1 text-[10px] text-cyan-200 bg-slate-950/60 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
          <Hand className="w-3 h-3 text-cyan-400 animate-bounce" />
          <span>Chạm trực tiếp vào từ rơi hoặc gõ Pinyin</span>
        </div>

        {/* Error Warning Banner */}
        {errorMessage && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-red-600/95 text-white px-3 py-1.5 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm shadow-2xl border-2 border-white/40 flex items-center gap-1.5 animate-bounce max-w-[90%] text-center">
            <AlertCircle className="w-4 h-4 text-yellow-300 shrink-0" />
            <span className="truncate">{errorMessage}</span>
          </div>
        )}

        {/* Falling Words Area with Animated Plasma Tails */}
        <div className="relative flex-1 w-full overflow-hidden">
          {fallingWords.map((word) => {
            const isTargeted = activeTargetId === word.id;
            const themeStyle = getThemeStyles(word.colorTheme, isTargeted);

            // Compute typed progress
            const typedNormalized = normalizePinyin(inputVal);
            let matchedCharsCount = 0;
            if (isTargeted && typedNormalized) {
              matchedCharsCount = Math.min(typedNormalized.length, word.rawPinyin.length);
            }

            return (
              <div
                key={word.id}
                onClick={(e) => {
                  e.stopPropagation();
                  shootAndDestroy(word);
                  clearInputNow();
                }}
                style={{
                  left: `${word.x}%`,
                  top: `${word.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                className={`absolute cursor-pointer transition-transform duration-100 flex flex-col items-center justify-center touch-manipulation active:scale-95 ${
                  isTargeted ? 'scale-110 sm:scale-115 z-30' : 'hover:scale-105 z-20'
                }`}
              >
                {/* Plasma comet tail */}
                <div className="relative -mb-2 sm:-mb-3 flex flex-col items-center pointer-events-none">
                  <div
                    className={`w-6 h-8 sm:w-8 sm:h-12 bg-gradient-to-t ${themeStyle.tailColor} opacity-75 blur-xs rounded-full animate-pulse`}
                  />
                  <span className="absolute -top-1 text-[10px] sm:text-xs animate-bounce opacity-80">
                    {word.spaceIcon}
                  </span>
                </div>

                {/* Word Capsule Card */}
                <div
                  className={`relative px-2.5 py-1 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl border-2 backdrop-blur-md transition-all duration-150 flex flex-col items-center select-none shadow-md ${themeStyle.cardBg} ${themeStyle.borderColor} ${themeStyle.glowAura}`}
                >
                  {isTargeted && (
                    <div className="absolute -top-2.5 -right-2.5 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center text-[10px] sm:text-xs font-black shadow-lg animate-spin">
                      <Crosshair className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                  )}

                  {/* Hanzi */}
                  <span
                    className={`text-xl sm:text-3xl font-black font-['Noto_Serif_SC',serif] leading-tight filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] ${
                      isTargeted ? 'text-cyan-200 scale-105' : 'text-white'
                    }`}
                  >
                    {word.item.hanzi}
                  </span>

                  {/* Pinyin highlighting */}
                  <div className="flex items-center gap-0.5 text-[11px] sm:text-sm font-black tracking-wide mt-0.5">
                    {isTargeted && matchedCharsCount > 0 ? (
                      <>
                        <span className="text-emerald-400 bg-emerald-950/80 px-1 rounded font-extrabold border border-emerald-500/60 shadow-[0_0_8px_#34d399]">
                          {word.rawPinyin.slice(0, matchedCharsCount)}
                        </span>
                        <span className="text-slate-200">
                          {word.rawPinyin.slice(matchedCharsCount)}
                        </span>
                      </>
                    ) : (
                      <span className="text-amber-300 font-extrabold drop-shadow">
                        {word.item.pinyin}
                      </span>
                    )}
                  </div>

                  {/* Meaning */}
                  <span className="text-[9px] sm:text-[10px] font-bold text-slate-300 mt-0.5 sm:mt-1 bg-black/60 px-2 py-0.5 rounded-full border border-white/10 shadow-xs max-w-[120px] sm:max-w-none truncate">
                    {word.item.vietnamese}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Laser Beams SVG */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-40">
            {lasers.map((laser) => (
              <g key={laser.id}>
                <line
                  x1={`${laser.startX}%`}
                  y1={`${laser.startY}%`}
                  x2={`${laser.targetX}%`}
                  y2={`${laser.targetY}%`}
                  stroke={laser.color}
                  strokeWidth="6"
                  strokeOpacity="0.5"
                  strokeLinecap="round"
                />
                <line
                  x1={`${laser.startX}%`}
                  y1={`${laser.startY}%`}
                  x2={`${laser.targetX}%`}
                  y2={`${laser.targetY}%`}
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  style={{ filter: `drop-shadow(0 0 8px ${laser.color})` }}
                />
              </g>
            ))}
          </svg>

          {/* Explosions */}
          {explosions.map((ex) => (
            <div
              key={ex.id}
              style={{
                left: `${ex.x}%`,
                top: `${ex.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className="absolute z-50 pointer-events-none flex flex-col items-center justify-center animate-bounce"
            >
              <div className="absolute w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-amber-300 animate-ping opacity-80" />
              <div className="relative text-2xl sm:text-3xl select-none">💥</div>
              <div className="relative bg-slate-900/90 text-amber-300 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-xl text-xs sm:text-sm font-black border border-amber-400 shadow-lg whitespace-nowrap mt-1">
                ĐÚNG! +10 ⭐ {ex.hanzi}
              </div>
            </div>
          ))}
        </div>

        {/* Red Defense Laser Line at Bottom */}
        <div className="relative w-full z-10 flex flex-col items-center">
          <div className="w-full h-1 sm:h-1.5 bg-red-500 shadow-[0_0_15px_#ef4444]" />
          <div className="w-full h-4 sm:h-5 bg-gradient-to-t from-red-600/30 to-transparent pointer-events-none" />

          {/* Spaceship Rocket */}
          <div
            className="relative -mt-6 sm:-mt-7 mb-1 sm:mb-2 transition-transform duration-100 ease-out"
            style={{
              transform: `rotate(${rocketAngle}deg)`,
            }}
          >
            <div className="relative w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center filter drop-shadow-[0_0_15px_rgba(56,189,248,0.9)]">
              <div className="text-4xl sm:text-5xl transform -rotate-45">🚀</div>
              <div className="absolute -bottom-1.5 w-3 h-3 sm:w-4 sm:h-4 bg-amber-400 rounded-full blur-xs animate-ping" />
            </div>
          </div>
        </div>

        {/* Game Over Modal */}
        {isGameOver && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4 sm:p-6 text-center text-white space-y-3 sm:space-y-4">
            <div className="text-5xl sm:text-6xl animate-bounce">💔</div>
            <h3 className="text-2xl sm:text-3xl font-black text-rose-400 font-['Baloo_2',sans-serif]">
              Bé Đã Hết Mạng!
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-sm">
              Đừng buồn nhé! Hãy nhìn kỹ từ vựng và gõ chính xác pinyin để bảo vệ phi thuyền ở lần chơi tiếp theo nào!
            </p>
            <div className="text-lg sm:text-xl text-amber-300 font-bold">
              Bé đã bắn hạ được {destroyedCount} từ • Điểm: {score}
            </div>
            <button
              onClick={resetGame}
              className="px-6 py-2.5 sm:py-3 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-black text-sm sm:text-base shadow-lg hover:scale-105 active:scale-95 transition-transform flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Chơi Lại Từ Đầu</span>
            </button>
          </div>
        )}
      </div>

      {/* Typing & Action Bar at Bottom */}
      <div className="bg-white/95 backdrop-blur-sm p-2.5 sm:p-4 rounded-2xl sm:rounded-3xl border-2 border-slate-300 shadow-md space-y-2">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={handleInputChange}
              onInput={(e) => {
                const targetEl = e.currentTarget;
                if (checkAndShoot(targetEl.value)) {
                  targetEl.value = '';
                }
              }}
              onKeyDown={handleKeyDown}
              onCompositionEnd={(e) => {
                handleInputChange(e as unknown as React.ChangeEvent<HTMLInputElement>);
              }}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              enterKeyHint="go"
              placeholder="Gõ Pinyin (laoshi, pingguo, chi)... Tự động xóa ngay khi bắn!"
              disabled={isGameOver}
              className={`w-full px-3.5 py-2.5 sm:px-5 sm:py-3.5 pr-14 sm:pr-20 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg bg-slate-50 border-2 outline-none text-slate-900 placeholder:text-slate-400 transition-all font-mono shadow-inner ${
                errorMessage ? 'border-red-500 bg-red-50' : 'border-rose-300 focus:border-rose-500 focus:bg-white focus:ring-2 sm:focus:ring-4 focus:ring-rose-200'
              }`}
            />
            {inputVal && (
              <button
                type="button"
                onClick={clearInputNow}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-bold text-rose-600 hover:text-white bg-rose-100 hover:bg-rose-500 rounded-lg transition-colors flex items-center gap-0.5"
                title="Xóa nhanh chữ trong ô"
              >
                <X className="w-3.5 h-3.5" />
                <span>Xóa</span>
              </button>
            )}
          </div>

          {/* Shoot Button */}
          <button
            onClick={() => {
              const hit = checkAndShoot(inputVal);
              if (!hit && inputVal.trim()) {
                triggerMistake(`Gõ sai pinyin "${inputVal}": -1 mạng! 💔`);
              }
              clearInputNow();
            }}
            disabled={!inputVal.trim() || isGameOver}
            className="px-3.5 py-2.5 sm:px-5 sm:py-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-black text-xs sm:text-base shadow-md disabled:opacity-40 transition-all active:scale-95 flex items-center gap-1 shrink-0"
          >
            <Rocket className="w-4 h-4 fill-white" />
            <span className="hidden xs:inline">BẮN 🎯</span>
          </button>

          <button
            onClick={resetGame}
            className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors shadow-2xs shrink-0"
            title="Chơi lại từ đầu"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Feature highlight: Auto Clear Pinyin */}
        <div className="flex items-center justify-between text-[10px] sm:text-xs text-slate-500 px-1 pt-0.5">
          <div className="flex items-center gap-1.5 font-bold text-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Đã bật Tự Động Xóa: Bắn trúng là ô nhập tự xóa trắng tinh ngay, không cần nhấn phím xóa!</span>
          </div>
          <span className="hidden sm:inline font-semibold text-slate-400">
            Nhấn Phím Cách (Space) hoặc Enter cũng tự xóa
          </span>
        </div>

        {/* Quick tap pinyin suggestions */}
        <div className="pt-1 border-t border-slate-100">
          <div className="flex items-center justify-between text-[10px] sm:text-xs font-bold text-slate-500 mb-1.5">
            <span className="flex items-center gap-1 text-amber-600">
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Chạm nhanh Pinyin từ đang rơi:</span>
            </span>
            <span className="text-emerald-700 hidden sm:inline">
              ✓ Tự động xóa sau khi bắn
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 max-h-[110px] overflow-y-auto">
            {fallingWords
              .filter((w) => !w.isDestroyed)
              .map((w) => (
                <button
                  key={w.id}
                  onClick={() => {
                    shootAndDestroy(w);
                    clearInputNow();
                  }}
                  className={`px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl font-black text-xs border shadow-2xs active:scale-95 transition-all flex items-center gap-1 touch-manipulation ${
                    activeTargetId === w.id
                      ? 'bg-cyan-500 text-white border-cyan-400 scale-105 ring-2 ring-cyan-200'
                      : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
                  }`}
                >
                  <span className="text-slate-800 font-bold">{w.item.hanzi}</span>
                  <span className="text-rose-600 font-mono font-bold text-[11px] sm:text-xs">
                    ({w.rawPinyin})
                  </span>
                </button>
              ))}

            {fallingWords.filter((w) => !w.isDestroyed).length === 0 && (
              <span className="text-[11px] text-slate-400 italic py-1">
                Đang nạp từ vựng vũ trụ tiếp theo...
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
