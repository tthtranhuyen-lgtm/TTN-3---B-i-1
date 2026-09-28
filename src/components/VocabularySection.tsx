import React, { useState } from 'react';
import { Volume2, Search, Sparkles, PenTool, Layers, Repeat, ArrowRight, Play } from 'lucide-react';
import { VocabItem } from '../types';
import { speakChinese, SoundEffects } from '../utils/audio';

interface VocabularySectionProps {
  vocabList: VocabItem[];
  speechRate: number;
  soundEnabled: boolean;
  onSelectForWriting: (word: string) => void;
}

export const VocabularySection: React.FC<VocabularySectionProps> = ({
  vocabList,
  speechRate,
  soundEnabled,
  onSelectForWriting,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'flashcard'>('grid');
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Filter list
  const filteredVocab = vocabList.filter((item) => {
    const matchesSearch =
      item.hanzi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.pinyin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.vietnamese.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const currentFlashcard = filteredVocab[flashcardIndex] || filteredVocab[0];

  const handlePlayAudio = (text: string, rateMultiplier: number = 1) => {
    if (soundEnabled) SoundEffects.pop();
    speakChinese(text, { rate: speechRate * rateMultiplier });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-200 via-orange-100 to-pink-100 rounded-3xl p-5 border-2 border-amber-300 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-400 text-white flex items-center justify-center text-3xl shadow-sm">
            📚
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-amber-950 font-['Baloo_2',sans-serif]">
              Vườn Từ Vựng Tiếng Trung
            </h2>
            <p className="text-xs sm:text-sm text-amber-800 font-semibold">
              Bấm vào chiếc loa 📢 để nghe giọng đọc chuẩn • Có nút nói chậm để bé nghe rõ từng âm tiết!
            </p>
          </div>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-2 bg-white/90 p-1 rounded-2xl border border-amber-300 shadow-sm">
          <button
            onClick={() => {
              setViewMode('grid');
              if (soundEnabled) SoundEffects.click();
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'grid'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-amber-800 hover:bg-amber-50'
            }`}
          >
            📋 Danh sách (15 từ)
          </button>
          <button
            onClick={() => {
              setViewMode('flashcard');
              setIsFlipped(false);
              if (soundEnabled) SoundEffects.click();
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'flashcard'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-amber-800 hover:bg-amber-50'
            }`}
          >
            🎴 Thẻ Flashcard
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/80 backdrop-blur-sm p-3.5 rounded-2xl border border-amber-200 shadow-sm">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-amber-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm chữ Hán, pinyin hoặc nghĩa..."
            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs sm:text-sm bg-amber-50/50 border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-800 placeholder-slate-400"
          />
        </div>

        {/* Category buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'Tất cả 🌟' },
            { id: 'time', label: 'Thời gian ⏰' },
            { id: 'person', label: 'Con người 👩‍🏫' },
            { id: 'noun', label: 'Đồ vật/Ăn uống 🍎' },
            { id: 'verb', label: 'Hành động 🍽️' },
            { id: 'grammar', label: 'Ngữ pháp 💡' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setFlashcardIndex(0);
                if (soundEnabled) SoundEffects.click();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* FLASHCARD MODE */}
      {viewMode === 'flashcard' && currentFlashcard && (
        <div className="max-w-md mx-auto py-4">
          <div
            onClick={() => {
              setIsFlipped(!isFlipped);
              if (soundEnabled) SoundEffects.pop();
            }}
            className="cursor-pointer relative h-80 w-full rounded-3xl bg-gradient-to-tr from-amber-50 via-white to-orange-50 border-4 border-amber-300 shadow-xl flex flex-col items-center justify-between p-6 transition-transform hover:scale-[1.02] text-center"
          >
            {/* Top header on card */}
            <div className="w-full flex items-center justify-between text-xs font-bold text-amber-600">
              <span className="bg-amber-100 px-3 py-1 rounded-full">{currentFlashcard.emoji} Thẻ từ</span>
              <span>{flashcardIndex + 1} / {filteredVocab.length}</span>
            </div>

            {/* Front or Back content */}
            {!isFlipped ? (
              <div className="my-auto space-y-3">
                <div className="text-7xl font-black text-slate-800 font-['Noto_Serif_SC',serif]">
                  {currentFlashcard.hanzi}
                </div>
                <div className="text-2xl font-bold text-amber-700">
                  {currentFlashcard.pinyin}
                </div>
                <p className="text-xs text-slate-400 font-semibold">
                  (Chạm vào thẻ để xem nghĩa tiếng Việt)
                </p>
              </div>
            ) : (
              <div className="my-auto space-y-3">
                <div className="text-4xl font-extrabold text-amber-900">
                  {currentFlashcard.vietnamese}
                </div>
                <div className="text-lg font-bold text-amber-600">
                  {currentFlashcard.hanzi} • {currentFlashcard.pinyin}
                </div>
                <div className="bg-amber-100/70 p-3 rounded-2xl text-xs text-amber-950 font-medium">
                  {currentFlashcard.exampleSentence}
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div
              className="w-full flex items-center justify-center gap-2 pt-2 border-t border-amber-100"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Normal voice */}
              <button
                onClick={() => handlePlayAudio(currentFlashcard.hanzi, 1)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow"
              >
                <Volume2 className="w-4 h-4" />
                <span>Nghe đọc</span>
              </button>

              {/* Slow voice */}
              <button
                onClick={() => handlePlayAudio(currentFlashcard.hanzi, 0.65)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-100 hover:bg-orange-200 text-orange-800 font-bold text-xs border border-orange-300"
                title="Đọc chậm cho bé nghe từng âm"
              >
                <span>🐢 Đọc chậm</span>
              </button>

              {/* Practice write */}
              <button
                onClick={() => onSelectForWriting(currentFlashcard.hanzi)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow"
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Tập viết</span>
              </button>
            </div>
          </div>

          {/* Flashcard navigation buttons */}
          <div className="flex items-center justify-between mt-4 px-2">
            <button
              onClick={() => {
                if (flashcardIndex > 0) {
                  setFlashcardIndex(flashcardIndex - 1);
                  setIsFlipped(false);
                  if (soundEnabled) SoundEffects.click();
                }
              }}
              disabled={flashcardIndex === 0}
              className="px-4 py-2 rounded-2xl bg-white border border-amber-200 text-amber-900 font-bold text-sm disabled:opacity-40 shadow-sm"
            >
              ⬅️ Thẻ trước
            </button>
            <button
              onClick={() => {
                if (flashcardIndex < filteredVocab.length - 1) {
                  setFlashcardIndex(flashcardIndex + 1);
                  setIsFlipped(false);
                  if (soundEnabled) SoundEffects.click();
                }
              }}
              disabled={flashcardIndex === filteredVocab.length - 1}
              className="px-4 py-2 rounded-2xl bg-amber-500 text-white font-bold text-sm disabled:opacity-40 shadow-sm"
            >
              Thẻ tiếp theo ➡️
            </button>
          </div>
        </div>
      )}

      {/* GRID LIST MODE */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVocab.map((item) => (
            <div
              key={item.id}
              className="group bg-white/95 backdrop-blur-sm rounded-3xl p-5 border-2 border-amber-100 hover:border-amber-300 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Top header row */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl p-2 rounded-2xl bg-amber-50 border border-amber-100">
                      {item.emoji}
                    </span>
                    <div>
                      <div className="text-3xl font-black text-slate-800 font-['Noto_Serif_SC',serif]">
                        {item.hanzi}
                      </div>
                      <div className="text-sm font-extrabold text-amber-600">
                        {item.pinyin}
                      </div>
                    </div>
                  </div>

                  {/* Audio buttons */}
                  <div className="flex flex-col items-end gap-1">
                    <button
                      onClick={() => handlePlayAudio(item.hanzi, 1)}
                      className="p-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-800 transition-colors shadow-sm"
                      title="Nghe phát âm chuẩn"
                    >
                      <Volume2 className="w-4 h-4 text-amber-700" />
                    </button>
                    <button
                      onClick={() => handlePlayAudio(item.hanzi, 0.65)}
                      className="px-1.5 py-0.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-[10px] font-bold text-orange-700 border border-orange-200"
                      title="Nghe giọng đọc chậm"
                    >
                      🐢 Chậm
                    </button>
                  </div>
                </div>

                {/* Meaning */}
                <div className="mt-3 bg-amber-50/70 px-3 py-1.5 rounded-xl border border-amber-100">
                  <span className="text-xs font-bold text-amber-900">Nghĩa: </span>
                  <span className="text-sm font-extrabold text-slate-700">
                    {item.vietnamese}
                  </span>
                </div>

                {/* Example sentence from PDF */}
                <div className="mt-3 p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="text-xs font-bold text-slate-500 flex items-center justify-between mb-1">
                    <span>Ví dụ trong bài:</span>
                    <button
                      onClick={() => handlePlayAudio(item.exampleSentence, 0.85)}
                      className="text-amber-600 hover:text-amber-700 flex items-center gap-1 font-bold text-[11px]"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Đọc câu</span>
                    </button>
                  </div>
                  <div className="text-xs font-bold text-slate-800">
                    {item.exampleSentence}
                  </div>
                  <div className="text-[11px] font-medium text-amber-700">
                    {item.examplePinyin}
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5 italic">
                    "{item.exampleVietnamese}"
                  </div>
                </div>
              </div>

              {/* Bottom Card Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-slate-400">
                  {item.characters.length} chữ Hán
                </span>

                <button
                  onClick={() => onSelectForWriting(item.hanzi)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-colors"
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>Luyện viết chữ này</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
