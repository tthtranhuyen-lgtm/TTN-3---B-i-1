import React, { useState, useEffect } from 'react';
import { Volume2, Sparkles, RefreshCw, Trophy, Heart, Award, Rocket } from 'lucide-react';
import { VocabItem } from '../types';
import { speakChinese, SoundEffects } from '../utils/audio';
import { SpaceTypingGame } from './SpaceTypingGame';
import confetti from 'canvas-confetti';

interface GamesSectionProps {
  vocabList: VocabItem[];
  speechRate: number;
  soundEnabled: boolean;
  onEarnStar: () => void;
}

export const GamesSection: React.FC<GamesSectionProps> = ({
  vocabList,
  speechRate,
  soundEnabled,
  onEarnStar,
}) => {
  const [activeGame, setActiveGame] = useState<'space' | 'bunny' | 'bubbles'>('space');

  // BUNNY GAME STATE
  const [bunnyScore, setBunnyScore] = useState(0);
  const [bunnyRound, setBunnyRound] = useState(1);
  const [targetWord, setTargetWord] = useState<VocabItem | null>(null);
  const [carrotOptions, setCarrotOptions] = useState<VocabItem[]>([]);
  const [bunnyStatus, setBunnyStatus] = useState<'idle' | 'happy' | 'thinking' | 'oops'>('idle');
  const [showWinModal, setShowWinModal] = useState(false);

  // Setup a new bunny round
  const setupBunnyRound = () => {
    if (vocabList.length < 4) return;
    const shuffled = [...vocabList].sort(() => 0.5 - Math.random());
    const target = shuffled[0];
    const options = [target, shuffled[1], shuffled[2], shuffled[3]].sort(() => 0.5 - Math.random());

    setTargetWord(target);
    setCarrotOptions(options);
    setBunnyStatus('idle');

    // Auto pronounce for kid
    speakChinese(target.hanzi, { rate: speechRate });
  };

  useEffect(() => {
    if (activeGame === 'bunny') {
      setupBunnyRound();
    }
  }, [activeGame]);

  const handlePickCarrot = (item: VocabItem) => {
    if (!targetWord || bunnyStatus === 'happy') return;

    if (item.id === targetWord.id) {
      // Correct!
      setBunnyStatus('happy');
      if (soundEnabled) {
        SoundEffects.carrot();
        SoundEffects.correct();
      }
      setBunnyScore((s) => s + 1);
      onEarnStar();

      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {
        // ignore
      }

      setTimeout(() => {
        if (bunnyRound >= 10) {
          setShowWinModal(true);
          if (soundEnabled) SoundEffects.celebrate();
        } else {
          setBunnyRound((r) => r + 1);
          setupBunnyRound();
        }
      }, 1200);
    } else {
      // Wrong
      setBunnyStatus('oops');
      if (soundEnabled) SoundEffects.wrong();
      setTimeout(() => {
        setBunnyStatus('idle');
      }, 900);
    }
  };

  const handleRestartBunny = () => {
    setBunnyScore(0);
    setBunnyRound(1);
    setShowWinModal(false);
    setupBunnyRound();
  };

  // BUBBLE GAME STATE
  const [bubbleScore, setBubbleScore] = useState(0);
  const [bubbleTarget, setBubbleTarget] = useState<VocabItem | null>(null);
  const [bubbleItems, setBubbleItems] = useState<VocabItem[]>([]);

  const setupBubbleRound = () => {
    const shuffled = [...vocabList].sort(() => 0.5 - Math.random());
    const target = shuffled[0];
    const pool = [target, shuffled[1], shuffled[2], shuffled[3], shuffled[4]].sort(
      () => 0.5 - Math.random()
    );
    setBubbleTarget(target);
    setBubbleItems(pool);
    speakChinese(target.hanzi, { rate: speechRate });
  };

  useEffect(() => {
    if (activeGame === 'bubbles') {
      setupBubbleRound();
    }
  }, [activeGame]);

  const handlePopBubble = (item: VocabItem) => {
    if (!bubbleTarget) return;

    if (item.id === bubbleTarget.id) {
      if (soundEnabled) {
        SoundEffects.pop();
        SoundEffects.correct();
      }
      setBubbleScore((s) => s + 1);
      onEarnStar();
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }
      setupBubbleRound();
    } else {
      if (soundEnabled) SoundEffects.wrong();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-1 sm:px-4 py-2 sm:py-4 space-y-3 sm:space-y-5">
      {/* Game Selector Tab */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2.5">
        <button
          onClick={() => {
            setActiveGame('space');
            if (soundEnabled) SoundEffects.click();
          }}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-2xl font-black text-xs sm:text-base transition-all border-2 shadow-2xs ${
            activeGame === 'space'
              ? 'bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 text-white border-rose-300 scale-105 shadow-md ring-2 ring-rose-200'
              : 'bg-white text-rose-900 border-rose-200 hover:bg-rose-50'
          }`}
        >
          <Rocket className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
          <span>🚀 Phi Thuyền Vũ Trụ</span>
        </button>

        <button
          onClick={() => {
            setActiveGame('bunny');
            if (soundEnabled) SoundEffects.click();
          }}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl font-black text-xs sm:text-base transition-all border-2 shadow-2xs ${
            activeGame === 'bunny'
              ? 'bg-gradient-to-r from-orange-400 to-amber-500 text-white border-orange-300 scale-105 shadow-md'
              : 'bg-white text-orange-900 border-orange-200 hover:bg-orange-50'
          }`}
        >
          <span className="text-base sm:text-xl">🐰</span>
          <span>Thỏ Hái Cà Rốt</span>
        </button>

        <button
          onClick={() => {
            setActiveGame('bubbles');
            if (soundEnabled) SoundEffects.click();
          }}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl font-black text-xs sm:text-base transition-all border-2 shadow-2xs ${
            activeGame === 'bubbles'
              ? 'bg-gradient-to-r from-purple-400 to-indigo-500 text-white border-purple-300 scale-105 shadow-md'
              : 'bg-white text-purple-900 border-purple-200 hover:bg-purple-50'
          }`}
        >
          <span className="text-base sm:text-xl">🎈</span>
          <span>Bong Bóng Từ Vựng</span>
        </button>
      </div>

      {/* GAME 0: BAOLINGO STYLE SPACE TYPING GAME */}
      {activeGame === 'space' && (
        <SpaceTypingGame
          vocabList={vocabList}
          speechRate={speechRate}
          soundEnabled={soundEnabled}
          onEarnStar={onEarnStar}
        />
      )}

      {/* GAME 1: BUNNY CARROT HARVEST */}
      {activeGame === 'bunny' && (
        <div className="relative bg-gradient-to-b from-sky-100 via-emerald-50 to-emerald-100 rounded-2xl sm:rounded-3xl p-3 sm:p-6 border-3 sm:border-4 border-amber-300 shadow-lg overflow-hidden min-h-[420px] sm:min-h-[500px] flex flex-col justify-between">
          {/* Top scoreboard */}
          <div className="flex items-center justify-between z-10 gap-1.5">
            <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl border-2 border-orange-200 shadow-xs">
              <span className="text-xl sm:text-2xl">🥕</span>
              <span className="font-extrabold text-amber-900 text-xs sm:text-base">
                Giỏ: {bunnyScore} củ
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl border-2 border-emerald-200 shadow-xs">
              <span className="font-bold text-emerald-800 text-xs sm:text-sm">
                Vòng {bunnyRound} / 10
              </span>
            </div>

            <button
              onClick={handleRestartBunny}
              className="p-1.5 sm:p-2 bg-white/90 rounded-xl sm:rounded-2xl border border-amber-200 hover:bg-amber-100 text-amber-800"
              title="Chơi lại từ đầu"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Central stage: Bunny Mascot with speech bubble */}
          <div className="flex flex-col items-center my-3 sm:my-6 z-10">
            {/* Speech bubble */}
            <div className="relative bg-white px-4 py-3 sm:px-6 sm:py-4 rounded-2xl sm:rounded-3xl border-2 sm:border-3 border-amber-300 shadow-md text-center max-w-md animate-fade-in mx-2">
              <div className="text-[10px] sm:text-xs font-bold text-amber-700 uppercase tracking-wide mb-1">
                Thỏ con đói bụng muốn ăn:
              </div>
              <div className="text-xl sm:text-3xl font-black text-slate-800 flex items-center justify-center gap-1.5 sm:gap-2">
                <span>{targetWord?.vietnamese}</span>
                <span className="text-amber-500 font-normal text-sm sm:text-xl">({targetWord?.pinyin})</span>
              </div>

              {/* Repeat audio button */}
              <button
                onClick={() => {
                  if (targetWord) speakChinese(targetWord.hanzi, { rate: speechRate });
                  if (soundEnabled) SoundEffects.pop();
                }}
                className="mt-1.5 sm:mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 text-[11px] sm:text-xs font-bold transition-transform hover:scale-105 active:scale-95"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Nghe thỏ đọc 📢</span>
              </button>

              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-white" />
            </div>

            {/* Bunny Emoji / Character */}
            <div className="relative mt-2 sm:mt-4 select-none">
              <div
                className={`text-6xl sm:text-9xl transition-transform duration-300 ${
                  bunnyStatus === 'happy'
                    ? 'scale-125 animate-bounce'
                    : bunnyStatus === 'oops'
                    ? 'rotate-12 opacity-80'
                    : 'hover:scale-105'
                }`}
              >
                {bunnyStatus === 'happy' ? '🐰🎉' : bunnyStatus === 'oops' ? '🐰❓' : '🐰🥕'}
              </div>

              {bunnyStatus === 'happy' && (
                <div className="absolute -top-3 right-0 bg-amber-400 text-white font-black text-xs sm:text-sm px-2.5 py-0.5 rounded-full shadow animate-ping">
                  +1 Cà rốt!
                </div>
              )}
            </div>
          </div>

          {/* Bottom: Carrot garden options */}
          <div className="z-10 bg-amber-900/10 backdrop-blur-sm p-2 sm:p-4 rounded-2xl sm:rounded-3xl border-2 border-emerald-300">
            <div className="text-center text-[11px] sm:text-xs font-black text-emerald-950 mb-2 sm:mb-3">
              🌱 Bấm vào củ cà rốt có chữ Hán đúng để cho Thỏ ăn:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              {carrotOptions.map((carrot) => (
                <button
                  key={carrot.id}
                  onClick={() => handlePickCarrot(carrot)}
                  className="group relative bg-white hover:bg-amber-50 p-2 sm:p-4 rounded-xl sm:rounded-3xl border-2 sm:border-3 border-orange-300 hover:border-orange-500 shadow-xs hover:shadow-md transform active:scale-95 transition-all flex flex-col items-center justify-center text-center touch-manipulation"
                >
                  <span className="text-2xl sm:text-4xl group-hover:scale-115 transition-transform">
                    🥕
                  </span>
                  <span className="text-xl sm:text-3xl font-black text-slate-800 font-['Noto_Serif_SC',serif] mt-0.5">
                    {carrot.hanzi}
                  </span>
                  <span className="text-[11px] sm:text-xs font-extrabold text-amber-700">
                    {carrot.pinyin}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Win modal */}
          {showWinModal && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-md rounded-3xl z-20 flex flex-col items-center justify-center p-6 text-center space-y-4">
              <div className="text-6xl animate-bounce">🏆</div>
              <h3 className="text-2xl sm:text-3xl font-black text-amber-900 font-['Baloo_2',sans-serif]">
                Bé Thật Tuyệt Vời!
              </h3>
              <p className="text-sm font-bold text-amber-700 max-w-sm">
                Bé đã giúp chú thỏ thu hoạch đủ 10 củ cà rốt ngon lành và học thuộc hết từ vựng rồi!
              </p>
              <div className="flex items-center gap-1 text-amber-400 text-3xl">
                ⭐⭐⭐⭐⭐
              </div>
              <button
                onClick={handleRestartBunny}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black text-base shadow-lg hover:scale-105 active:scale-95 transition-transform"
              >
                Chơi Lại Vòng Mới 🔄
              </button>
            </div>
          )}
        </div>
      )}

      {/* GAME 2: BUBBLE WORD POP */}
      {activeGame === 'bubbles' && (
        <div className="bg-gradient-to-b from-indigo-100 via-purple-50 to-pink-100 rounded-2xl sm:rounded-3xl p-3 sm:p-6 border-3 sm:border-4 border-purple-300 shadow-lg min-h-[400px] sm:min-h-[480px] flex flex-col justify-between relative overflow-hidden">
          {/* Top header */}
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5 bg-white/90 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl border-2 border-purple-200 shadow-xs">
              <span className="text-xl sm:text-2xl">🎈</span>
              <span className="font-extrabold text-purple-900 text-xs sm:text-base">
                Điểm: {bubbleScore}
              </span>
            </div>

            <button
              onClick={setupBubbleRound}
              className="p-1.5 sm:p-2 bg-white/90 rounded-xl sm:rounded-2xl border border-purple-200 hover:bg-purple-100 text-purple-800"
              title="Đổi câu hỏi mới"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Central Target prompt */}
          <div className="text-center my-2 sm:my-4 bg-white/90 backdrop-blur-sm p-3 sm:p-4 rounded-2xl sm:rounded-3xl border-2 border-purple-300 shadow max-w-md mx-auto w-full">
            <div className="text-[10px] sm:text-xs font-bold text-purple-600 uppercase tracking-wide">
              Bé hãy bấm làm vỡ bong bóng:
            </div>
            <div className="text-xl sm:text-3xl font-black text-purple-950 mt-0.5 sm:mt-1">
              "{bubbleTarget?.vietnamese}"
            </div>
            <button
              onClick={() => {
                if (bubbleTarget) speakChinese(bubbleTarget.hanzi, { rate: speechRate });
              }}
              className="mt-1 sm:mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-100 hover:bg-purple-200 text-purple-800 text-[11px] sm:text-xs font-bold active:scale-95"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Nghe phát âm gợi ý 📢</span>
            </button>
          </div>

          {/* Floating Bubble field */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 py-3 sm:py-6">
            {bubbleItems.map((item, index) => {
              const bgColors = [
                'bg-gradient-to-tr from-pink-300 to-rose-200 border-pink-400',
                'bg-gradient-to-tr from-sky-300 to-blue-200 border-sky-400',
                'bg-gradient-to-tr from-amber-300 to-yellow-200 border-amber-400',
                'bg-gradient-to-tr from-emerald-300 to-teal-200 border-emerald-400',
                'bg-gradient-to-tr from-purple-300 to-indigo-200 border-purple-400',
              ];
              const colorClass = bgColors[index % bgColors.length];

              return (
                <button
                  key={item.id + index}
                  onClick={() => handlePopBubble(item)}
                  className={`w-20 h-20 sm:w-28 sm:h-28 rounded-full border-3 sm:border-4 shadow-md sm:shadow-lg active:scale-90 transition-all cursor-pointer animate-float ${colorClass} touch-manipulation flex flex-col items-center justify-center`}
                >
                  <span className="text-xl sm:text-3xl font-black text-slate-800 font-['Noto_Serif_SC',serif]">
                    {item.hanzi}
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold text-slate-700">
                    {item.pinyin}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="text-center text-[11px] sm:text-xs font-bold text-purple-700">
            💡 Mỗi lần bấm đúng bé sẽ nhận thêm 1 Ngôi Sao Thưởng ⭐
          </div>
        </div>
      )}
    </div>
  );
};
