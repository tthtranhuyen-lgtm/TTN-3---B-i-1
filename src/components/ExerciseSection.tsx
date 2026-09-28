import React, { useState } from 'react';
import { CheckCircle2, XCircle, RotateCcw, Volume2, Sparkles, HelpCircle, Award } from 'lucide-react';
import { FILL_BLANKS_EXERCISES, EXERCISE_WORD_POOL } from '../data/chineseLessonData';
import { speakChinese, SoundEffects } from '../utils/audio';
import confetti from 'canvas-confetti';

interface ExerciseSectionProps {
  speechRate: number;
  soundEnabled: boolean;
  onEarnStar: () => void;
}

export const ExerciseSection: React.FC<ExerciseSectionProps> = ({
  speechRate,
  soundEnabled,
  onEarnStar,
}) => {
  // Answers stored as map of exercise id -> selected word
  const [userAnswers, setUserAnswers] = useState<{ [id: number]: string }>({});
  const [checked, setChecked] = useState(false);
  const [activeExerciseId, setActiveExerciseId] = useState<number>(1);
  const [showHint, setShowHint] = useState<{ [id: number]: boolean }>({});
  const [awarded, setAwarded] = useState(false);

  const handleSelectWord = (word: string) => {
    if (checked) return;
    if (soundEnabled) SoundEffects.pop();
    setUserAnswers((prev) => ({
      ...prev,
      [activeExerciseId]: word,
    }));

    // Auto advance to next unanswered question
    const nextUnanswered = FILL_BLANKS_EXERCISES.find(
      (ex) => ex.id !== activeExerciseId && !userAnswers[ex.id]
    );
    if (nextUnanswered) {
      setActiveExerciseId(nextUnanswered.id);
    }
  };

  const handleClearBlank = (id: number) => {
    if (checked) return;
    if (soundEnabled) SoundEffects.click();
    setUserAnswers((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleCheckAnswers = () => {
    setChecked(true);
    let allCorrect = true;
    FILL_BLANKS_EXERCISES.forEach((ex) => {
      if (userAnswers[ex.id] !== ex.correctAnswer) {
        allCorrect = false;
      }
    });

    if (allCorrect) {
      if (soundEnabled) SoundEffects.celebrate();
      if (!awarded) {
        setAwarded(true);
        onEarnStar();
        onEarnStar(); // Give 2 stars for completing the exercise!
      }
      try {
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.5 },
        });
      } catch {
        // ignore
      }
    } else {
      if (soundEnabled) SoundEffects.wrong();
    }
  };

  const handleReset = () => {
    if (soundEnabled) SoundEffects.pop();
    setUserAnswers({});
    setChecked(false);
    setActiveExerciseId(1);
  };

  const handlePlaySentence = (text: string) => {
    if (soundEnabled) SoundEffects.pop();
    speakChinese(text, { rate: speechRate });
  };

  // Calculate score
  const totalQuestions = FILL_BLANKS_EXERCISES.length;
  const correctCount = FILL_BLANKS_EXERCISES.filter(
    (ex) => userAnswers[ex.id] === ex.correctAnswer
  ).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 space-y-6">
      {/* Exercise Banner */}
      <div className="bg-gradient-to-r from-emerald-100 via-teal-100 to-amber-100 rounded-3xl p-5 border-2 border-emerald-300 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-3xl shadow-sm">
            📝
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-emerald-950 font-['Baloo_2',sans-serif]">
              Bài Tập Điền Từ Vào Chỗ Trống
            </h2>
            <p className="text-xs sm:text-sm text-emerald-800 font-semibold">
              Trang 3 trong bài học: Chọn các từ thích hợp để hoàn thành 6 câu sau nhé!
            </p>
          </div>
        </div>

        {checked && (
          <div className="bg-white/90 px-4 py-2 rounded-2xl border-2 border-emerald-300 shadow-sm flex items-center gap-2">
            <span className="text-xl">🏆</span>
            <div className="text-xs sm:text-sm font-black text-emerald-900">
              Điểm của bé: {correctCount} / {totalQuestions}
            </div>
          </div>
        )}
      </div>

      {/* Word Bank (Từ để chọn) */}
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-5 border-2 border-emerald-200 shadow-sm">
        <div className="text-xs sm:text-sm font-black text-emerald-900 mb-3 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Kho từ vựng để điền: (Bấm vào từ để gắn vào câu đang chọn)</span>
          </span>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Đang điền câu {activeExerciseId}
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {EXERCISE_WORD_POOL.map((word) => {
            const isUsed = Object.values(userAnswers).includes(word);
            return (
              <button
                key={word}
                onClick={() => handleSelectWord(word)}
                disabled={checked}
                className={`px-4 py-2.5 rounded-2xl font-black text-base sm:text-lg transition-all transform shadow-sm ${
                  isUsed
                    ? 'bg-slate-100 text-slate-400 border border-slate-200'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:scale-105 active:scale-95 hover:shadow-md'
                }`}
              >
                {word}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sentences List */}
      <div className="space-y-3">
        {FILL_BLANKS_EXERCISES.map((ex) => {
          const answer = userAnswers[ex.id];
          const isCorrect = answer === ex.correctAnswer;
          const isActive = activeExerciseId === ex.id;

          return (
            <div
              key={ex.id}
              onClick={() => {
                if (!checked) {
                  setActiveExerciseId(ex.id);
                  if (soundEnabled) SoundEffects.click();
                }
              }}
              className={`cursor-pointer rounded-3xl p-4 sm:p-5 transition-all border-2 shadow-sm ${
                isActive && !checked
                  ? 'bg-amber-50/90 border-amber-400 ring-2 ring-amber-200 shadow-md'
                  : 'bg-white/95 border-slate-200 hover:border-slate-300'
              } ${checked && isCorrect ? 'bg-emerald-50/90 border-emerald-400' : ''} ${
                checked && !isCorrect ? 'bg-rose-50/90 border-rose-300' : ''
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${
                      isActive ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {ex.id}
                  </span>

                  {/* Sentence with blank */}
                  <div className="text-base sm:text-xl font-bold text-slate-800 flex items-center flex-wrap gap-1.5 font-['Noto_Serif_SC',serif]">
                    <span>{ex.beforeBlank}</span>

                    {/* The blank box */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        if (answer) handleClearBlank(ex.id);
                      }}
                      className={`min-w-24 px-3 py-1 rounded-xl text-center font-black text-lg transition-all border-2 border-dashed ${
                        answer
                          ? 'bg-emerald-100 border-emerald-400 text-emerald-900 shadow-sm cursor-pointer hover:bg-rose-100 hover:border-rose-400 hover:text-rose-800'
                          : isActive
                          ? 'bg-amber-100 border-amber-500 text-amber-900 animate-pulse'
                          : 'bg-slate-100 border-slate-300 text-slate-400'
                      }`}
                      title={answer ? 'Chạm để xóa từ này' : 'Chỗ cần điền'}
                    >
                      {answer || '______'}
                    </div>

                    <span>{ex.afterBlank}</span>
                  </div>
                </div>

                {/* Status icon or Audio button */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  {/* Hint button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowHint((prev) => ({ ...prev, [ex.id]: !prev[ex.id] }));
                    }}
                    className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs"
                    title="Xem gợi ý"
                  >
                    <HelpCircle className="w-4 h-4 text-amber-600" />
                  </button>

                  {/* Audio sentence read */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const fullSentence = `${ex.beforeBlank}${ex.correctAnswer}${ex.afterBlank}`;
                      handlePlaySentence(fullSentence);
                    }}
                    className="p-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-800"
                    title="Nghe câu hoàn chỉnh"
                  >
                    <Volume2 className="w-4 h-4 text-amber-700" />
                  </button>

                  {/* Result indicator */}
                  {checked && (
                    <div>
                      {isCorrect ? (
                        <div className="flex items-center gap-1 text-emerald-600 font-bold text-xs bg-emerald-100 px-2 py-1 rounded-xl">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Đúng rồi!</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-rose-600 font-bold text-xs bg-rose-100 px-2 py-1 rounded-xl">
                          <XCircle className="w-4 h-4" />
                          <span>Đáp án: {ex.correctAnswer}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Hint dropdown */}
              {showHint[ex.id] && (
                <div className="mt-2 text-xs font-semibold text-amber-800 bg-amber-100/60 p-2 rounded-xl">
                  {ex.hint}
                </div>
              )}

              {/* Full sentence translation when checked or active */}
              {checked && (
                <div className="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-600 flex flex-wrap gap-2">
                  <span className="font-bold text-amber-700">{ex.fullPinyin}</span>
                  <span>•</span>
                  <span className="font-semibold text-slate-700">Nghĩa: {ex.fullVietnamese}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 shadow-sm"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Làm lại từ đầu</span>
        </button>

        <button
          onClick={handleCheckAnswers}
          disabled={Object.keys(userAnswers).length === 0}
          className="flex items-center gap-2 px-6 py-2.5 rounded-2xl font-black text-sm sm:text-base bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
        >
          <Sparkles className="w-4 h-4" />
          <span>Kiểm tra bài làm 🎯</span>
        </button>
      </div>
    </div>
  );
};
