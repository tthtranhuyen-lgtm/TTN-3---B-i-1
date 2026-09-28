import React from 'react';
import { Volume2, Sparkles, BookMarked, Play } from 'lucide-react';
import { GRAMMAR_PATTERNS } from '../data/chineseLessonData';
import { speakChinese, SoundEffects } from '../utils/audio';

interface GrammarSectionProps {
  speechRate: number;
  soundEnabled: boolean;
}

export const GrammarSection: React.FC<GrammarSectionProps> = ({
  speechRate,
  soundEnabled,
}) => {
  const handlePlayAudio = (text: string) => {
    if (soundEnabled) SoundEffects.pop();
    speakChinese(text, { rate: speechRate });
  };

  const getCuteEmojiForExample = (type?: string) => {
    switch (type) {
      case 'coke':
        return '🥤🥛';
      case 'tv':
        return '📺👦';
      case 'school':
        return '🎒🏫';
      case 'badminton':
        return '🏸🏸';
      case 'home':
        return '🍚🏡';
      case 'park':
        return '🎠🌳';
      default:
        return '✨';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-sky-200 via-blue-100 to-indigo-100 rounded-3xl p-5 border-2 border-sky-300 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-sky-500 text-white flex items-center justify-center text-3xl shadow-sm">
            💡
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-sky-950 font-['Baloo_2',sans-serif]">
              Góc Ngữ Pháp Vui Nhộn
            </h2>
            <p className="text-xs sm:text-sm text-sky-800 font-semibold">
              Trang 3 & 4 trong tài liệu: 3 cấu trúc câu thông dụng giúp bé nói tiếng Trung trôi chảy!
            </p>
          </div>
        </div>
      </div>

      {/* Grammar Cards */}
      <div className="space-y-6">
        {GRAMMAR_PATTERNS.map((pattern, index) => (
          <div
            key={pattern.id}
            className="bg-white/95 backdrop-blur-sm rounded-3xl p-5 sm:p-6 border-2 border-slate-200 shadow-sm space-y-4 hover:border-sky-300 transition-colors"
          >
            {/* Header with Pattern Structure */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-black px-3 py-1 rounded-full bg-sky-100 text-sky-800 uppercase tracking-wider inline-block mb-1">
                  {pattern.title}
                </span>
                <div className="flex items-center gap-3 mt-1">
                  <div className="text-2xl sm:text-3xl font-black text-slate-800 font-['Baloo_2',sans-serif]">
                    {pattern.structure}
                  </div>
                  <span className="text-sm sm:text-base font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
                    Nghĩa: {pattern.meaning}
                  </span>
                </div>
              </div>
            </div>

            {/* Example Sentences */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pattern.examples.map((ex, exIdx) => (
                <div
                  key={exIdx}
                  className="bg-gradient-to-br from-slate-50 to-amber-50/40 p-4 rounded-2xl border border-slate-200 hover:border-amber-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">
                        {getCuteEmojiForExample(ex.imageType)}
                      </span>
                      <button
                        onClick={() => handlePlayAudio(ex.chinese)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-sm hover:scale-105 transition-transform"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Nghe đọc</span>
                      </button>
                    </div>

                    <div className="text-xl sm:text-2xl font-black text-slate-800 font-['Noto_Serif_SC',serif]">
                      {ex.chinese}
                    </div>
                    <div className="text-sm font-bold text-amber-600 mt-0.5">
                      {ex.pinyin}
                    </div>
                    <div className="text-xs sm:text-sm font-semibold text-slate-700 mt-1">
                      👉 {ex.vietnamese}
                    </div>
                  </div>

                  {ex.breakdown && (
                    <div className="mt-3 pt-2 border-t border-slate-200/70 text-[11px] font-bold text-sky-800 bg-sky-50/70 px-2.5 py-1.5 rounded-xl">
                      {ex.breakdown}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
