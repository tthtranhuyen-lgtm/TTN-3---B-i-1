import React from 'react';
import { Volume2, Sparkles, VolumeX, Gauge, ClipboardCheck } from 'lucide-react';
import { SoundEffects } from '../utils/audio';

interface HeaderProps {
  speechRate: number;
  setSpeechRate: (rate: number) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  starsCount: number;
  onOpenReport?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  speechRate,
  setSpeechRate,
  soundEnabled,
  setSoundEnabled,
  starsCount,
  onOpenReport,
}) => {
  const speeds = [
    { label: '🐢 Rất chậm', short: '🐢', value: 0.6 },
    { label: '🐥 Vừa vừa', short: '🐥', value: 0.8 },
    { label: '🐰 Chuẩn', short: '🐰', value: 1.0 },
    { label: '🚀 Nhanh', short: '🚀', value: 1.25 }
  ];

  return (
    <header className="relative bg-gradient-to-r from-pink-100 via-amber-100 to-sky-100 border-b-2 sm:border-b-4 border-amber-200/70 shadow-xs px-2.5 py-2 sm:px-6 sm:py-3">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 sm:gap-3">
        {/* Logo & Mascot */}
        <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative group cursor-pointer" onClick={() => soundEnabled && SoundEffects.pop()}>
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-amber-400 to-rose-400 flex items-center justify-center text-2xl sm:text-3xl shadow-sm sm:shadow-md transform hover:scale-110 active:scale-95 transition-transform">
                🐼
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3 sm:h-4 sm:w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 sm:h-4 sm:w-4 bg-pink-500"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-amber-950 tracking-wide font-['Baloo_2',sans-serif]">
                  Bé Vui Học Tiếng Trung
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-pink-200 text-pink-800 shadow-2xs">
                  Bài 1
                </span>
              </div>
              <p className="text-[10px] sm:text-sm font-medium text-amber-700/80 hidden xs:flex items-center gap-1">
                <span>Ôn từ vựng</span>
                <span>•</span>
                <span>Luyện viết</span>
                <span>•</span>
                <span>Trò chơi 🎉</span>
              </p>
            </div>
          </div>

          {/* Stars badge on mobile header top right */}
          <div className="flex md:hidden items-center gap-1.5">
            {onOpenReport && (
              <button
                onClick={() => {
                  onOpenReport();
                  if (soundEnabled) SoundEffects.pop();
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white font-extrabold text-[11px] shadow-2xs active:scale-95"
              >
                <span>Báo Cáo</span>
                <span>📋</span>
              </button>
            )}
            <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full border border-amber-300 shadow-2xs">
              <span className="text-amber-500 text-sm">⭐</span>
              <span className="font-extrabold text-amber-900 text-xs">
                {starsCount}
              </span>
            </div>
          </div>
        </div>

        {/* Controls: Speed selector, Sound FX, Star Badges */}
        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-1.5 sm:gap-3 w-full md:w-auto">
          {/* Report Button (Desktop) */}
          {onOpenReport && (
            <button
              onClick={() => {
                onOpenReport();
                if (soundEnabled) SoundEffects.pop();
              }}
              className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-black text-xs sm:text-sm shadow-sm hover:scale-105 active:scale-95 transition-all"
              title="Bảng tổng kết gửi cô giáo"
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>Báo Cáo Gửi Cô</span>
              <span className="bg-white/25 px-1.5 py-0.2 rounded-full text-[10px]">📋</span>
            </button>
          )}

          {/* Stars Collected (Desktop) */}
          <div className="hidden md:flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-3.5 py-1.5 rounded-full border-2 border-amber-300 shadow-sm">
            <span className="text-amber-500 text-xl animate-bounce">⭐</span>
            <span className="font-extrabold text-amber-900 text-sm sm:text-base">
              {starsCount}
            </span>
            <span className="text-xs font-semibold text-amber-700">sao</span>
          </div>

          {/* Voice Speed Selector */}
          <div className="flex items-center bg-white/90 backdrop-blur-sm p-0.5 sm:p-1 rounded-xl sm:rounded-2xl border border-amber-200 shadow-2xs">
            <div className="flex items-center gap-1 px-1.5 sm:px-2 text-amber-800 text-[10px] sm:text-xs font-bold">
              <Gauge className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Đọc:</span>
            </div>
            <div className="flex items-center gap-0.5 sm:gap-1">
              {speeds.map((s) => {
                const isActive = Math.abs(speechRate - s.value) < 0.05;
                return (
                  <button
                    key={s.value}
                    onClick={() => {
                      setSpeechRate(s.value);
                      if (soundEnabled) SoundEffects.click();
                    }}
                    className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-amber-500 text-white shadow-2xs scale-105'
                        : 'text-amber-800 hover:bg-amber-100'
                    }`}
                    title={`Chỉnh tốc độ đọc ${s.label}`}
                  >
                    <span className="sm:hidden">{s.short}</span>
                    <span className="hidden sm:inline">{s.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sound FX Toggle */}
          <button
            onClick={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              if (next) SoundEffects.pop();
            }}
            className={`p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border transition-all shadow-2xs flex items-center gap-1 ${
              soundEnabled
                ? 'bg-emerald-100 border-emerald-300 text-emerald-800 hover:bg-emerald-200'
                : 'bg-slate-100 border-slate-300 text-slate-500 hover:bg-slate-200'
            }`}
            title={soundEnabled ? 'Đang bật âm thanh hiệu ứng' : 'Đang tắt âm thanh hiệu ứng'}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="text-[10px] sm:text-xs font-bold hidden sm:inline">Âm thanh</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="text-[10px] sm:text-xs font-bold hidden sm:inline">Tắt tiếng</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
