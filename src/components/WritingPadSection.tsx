import React, { useRef, useState, useEffect } from 'react';
import { RotateCcw, Trash2, Volume2, Sparkles, Eye, EyeOff, Palette, ChevronLeft, ChevronRight, Award, CheckCircle2, ArrowRight } from 'lucide-react';
import { VocabItem } from '../types';
import { speakChinese, SoundEffects } from '../utils/audio';
import confetti from 'canvas-confetti';

interface WritingPadSectionProps {
  vocabList: VocabItem[];
  speechRate: number;
  soundEnabled: boolean;
  onEarnStar: () => void;
  initialWord?: string | null;
}

export const WritingPadSection: React.FC<WritingPadSectionProps> = ({
  vocabList,
  speechRate,
  soundEnabled,
  onEarnStar,
  initialWord,
}) => {
  // Current vocabulary word (Full word: compound words like 周末, 老师, 漂亮 or single words like 在, 有)
  const [currentWordIndex, setCurrentWordIndex] = useState(() => {
    if (initialWord) {
      const foundIdx = vocabList.findIndex((v) => v.hanzi === initialWord || v.id === initialWord);
      if (foundIdx !== -1) return foundIdx;
    }
    return 0;
  });

  const currentWord = vocabList[currentWordIndex] || vocabList[0];
  const isCompoundWord = currentWord.characters.length > 1;

  // Selected character within the compound word (0 = first char, 1 = second char, etc.)
  const [selectedCharIdx, setSelectedCharIdx] = useState(0);
  const currentChar = currentWord.characters[selectedCharIdx] || currentWord.characters[0];

  // Canvas drawing state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#e11d48'); // playful red/rose default
  const [brushSize, setBrushSize] = useState(12);
  const [showGuide, setShowGuide] = useState(true);

  // Stroke history per character so switching between chars inside compound word preserves drawing
  const [characterHistories, setCharacterHistories] = useState<{ [key: string]: ImageData[] }>({});
  const [drawnFlags, setDrawnFlags] = useState<{ [key: string]: boolean }>({});
  const [praisedWords, setPraisedWords] = useState<{ [wordId: string]: boolean }>({});

  const charKey = `${currentWord.id}-${selectedCharIdx}`;
  const currentStrokes = characterHistories[charKey] || [];
  const hasDrawnCurrentChar = drawnFlags[charKey] || false;

  // Update when initialWord changes
  useEffect(() => {
    if (initialWord) {
      const foundIdx = vocabList.findIndex((v) => v.hanzi === initialWord || v.id === initialWord);
      if (foundIdx !== -1) {
        setCurrentWordIndex(foundIdx);
        setSelectedCharIdx(0);
      }
    }
  }, [initialWord, vocabList]);

  // Palette colors for kids
  const colors = [
    { name: 'Đỏ son', hex: '#e11d48' },
    { name: 'Mực đen', hex: '#1e293b' },
    { name: 'Xanh ngọc', hex: '#0284c7' },
    { name: 'Xanh lá', hex: '#16a34a' },
    { name: 'Tím mộng', hex: '#9333ea' },
    { name: 'Cam vàng', hex: '#ea580c' },
  ];

  // Draw Tianzige background on canvas
  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // Warm soft paper background
    ctx.fillStyle = '#fffdfa';
    ctx.fillRect(0, 0, width, height);

    // Outer border
    ctx.strokeStyle = '#f87171'; // soft red
    ctx.lineWidth = 4;
    ctx.strokeRect(6, 6, width - 12, height - 12);

    // Tianzige dashed lines
    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = '#fca5a5';
    ctx.lineWidth = 1.5;

    // Horizontal center line
    ctx.beginPath();
    ctx.moveTo(6, height / 2);
    ctx.lineTo(width - 6, height / 2);
    ctx.stroke();

    // Vertical center line
    ctx.beginPath();
    ctx.moveTo(width / 2, 6);
    ctx.lineTo(width / 2, height - 6);
    ctx.stroke();

    // Diagonals for Mizige helper (subtle)
    ctx.setLineDash([4, 8]);
    ctx.strokeStyle = '#fed7aa';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(6, 6);
    ctx.lineTo(width - 6, height - 6);
    ctx.moveTo(width - 6, 6);
    ctx.lineTo(6, height - 6);
    ctx.stroke();

    ctx.restore();
  };

  // Re-draw canvas for the selected character
  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawGrid(ctx, canvas.width, canvas.height);

    // Restore saved strokes for this character if any
    const saved = characterHistories[charKey];
    if (saved && saved.length > 0) {
      const lastState = saved[saved.length - 1];
      ctx.putImageData(lastState, 0, 0);
    }
  };

  useEffect(() => {
    redrawCanvas();
  }, [currentWordIndex, selectedCharIdx]);

  // "Xóa đi viết lại" - Clear & Rewrite current character
  const handleClearAndRewrite = () => {
    if (soundEnabled) SoundEffects.pop();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawGrid(ctx, canvas.width, canvas.height);
    setCharacterHistories((prev) => ({ ...prev, [charKey]: [] }));
    setDrawnFlags((prev) => ({ ...prev, [charKey]: false }));
  };

  // Undo last stroke
  const handleUndo = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const history = characterHistories[charKey] || [];
    if (history.length > 0) {
      if (soundEnabled) SoundEffects.click();
      const newHistory = [...history];
      newHistory.pop();

      setCharacterHistories((prev) => ({ ...prev, [charKey]: newHistory }));

      if (newHistory.length === 0) {
        drawGrid(ctx, canvas.width, canvas.height);
        setDrawnFlags((prev) => ({ ...prev, [charKey]: false }));
      } else {
        const lastState = newHistory[newHistory.length - 1];
        ctx.putImageData(lastState, 0, 0);
      }
    }
  };

  // Canvas drawing handlers (mouse & touch support for tablets/phones)
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Save state before this stroke for undo
    const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setCharacterHistories((prev) => {
      const existing = prev[charKey] || [];
      return { ...prev, [charKey]: [...existing, currentState] };
    });

    setIsDrawing(true);
    setDrawnFlags((prev) => ({ ...prev, [charKey]: true }));

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.closePath();
    }
  };

  // Celebration when finishing writing
  const handleFinishWriting = () => {
    if (!praisedWords[currentWord.id]) {
      setPraisedWords((prev) => ({ ...prev, [currentWord.id]: true }));
      if (soundEnabled) SoundEffects.celebrate();
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
    }
  };

  // Check how many characters of the current word have been drawn
  const allCharactersOfWordDrawn = currentWord.characters.every((_, i) => drawnFlags[`${currentWord.id}-${i}`]);
  const drawnCountInCurrentWord = currentWord.characters.filter((_, i) => drawnFlags[`${currentWord.id}-${i}`]).length;

  return (
    <div className="max-w-5xl mx-auto px-2 sm:px-4 py-3 sm:py-5 space-y-4">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-rose-100 via-pink-100 to-amber-100 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border-2 border-rose-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-rose-500 text-white flex items-center justify-center text-2xl shadow-sm shrink-0">
            ✍️
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-2xl font-black text-rose-950 font-['Baloo_2',sans-serif]">
                Bé Luyện Viết Chữ Hán
              </h2>
              <span className="text-[10px] sm:text-xs font-extrabold bg-white/80 text-rose-800 px-2.5 py-0.5 rounded-full border border-rose-300">
                Từ ghép giữ nguyên • Ô kẻ Điền Tự Cách
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-rose-800 font-semibold">
              Luyện viết từ vựng hoàn chỉnh • Có nét mẫu hướng dẫn & bút màu thỏa thích!
            </p>
          </div>
        </div>

        {/* Word Switcher (Prev / Next Word) */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-white/95 px-3 py-1.5 rounded-2xl border border-rose-200 shadow-2xs">
          <button
            onClick={() => {
              if (currentWordIndex > 0) {
                setCurrentWordIndex(currentWordIndex - 1);
                setSelectedCharIdx(0);
                if (soundEnabled) SoundEffects.click();
              }
            }}
            disabled={currentWordIndex === 0}
            className="p-1 sm:p-1.5 rounded-xl hover:bg-rose-100 disabled:opacity-30 disabled:hover:bg-transparent text-rose-700 transition-colors"
            title="Từ trước"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <span className="text-xs font-black text-rose-900 min-w-20 text-center">
            Từ {currentWordIndex + 1} / {vocabList.length}
          </span>
          <button
            onClick={() => {
              if (currentWordIndex < vocabList.length - 1) {
                setCurrentWordIndex(currentWordIndex + 1);
                setSelectedCharIdx(0);
                if (soundEnabled) SoundEffects.click();
              }
            }}
            disabled={currentWordIndex === vocabList.length - 1}
            className="p-1 sm:p-1.5 rounded-xl hover:bg-rose-100 disabled:opacity-30 disabled:hover:bg-transparent text-rose-700 transition-colors"
            title="Từ sau"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Main Grid: Left Column (Word Info & Word Selector) + Right Column (Writing Canvas) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
        {/* Left Column: Full Word Card & Word Quick Selector */}
        <div className="lg:col-span-4 bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border-2 border-rose-100 shadow-xs space-y-3.5">
          {/* Main Word Card (Displays full compound word or single word together) */}
          <div className="text-center p-4 bg-gradient-to-b from-rose-50 to-amber-50/70 rounded-2xl border border-rose-200">
            {/* Tag: Compound vs Single */}
            <div className="inline-flex items-center gap-1 text-[11px] font-extrabold px-3 py-0.5 rounded-full mb-2 shadow-2xs border bg-white text-rose-800 border-rose-200">
              <span>{currentWord.emoji}</span>
              <span>{isCompoundWord ? 'Từ ghép (2 chữ Hán)' : 'Từ đơn (1 chữ Hán)'}</span>
            </div>

            {/* Complete Word Hanzi (Never split!) */}
            <div className="text-5xl sm:text-6xl font-black text-slate-800 font-['Noto_Serif_SC',serif] my-1 tracking-wider drop-shadow-xs">
              {currentWord.hanzi}
            </div>

            {/* Pinyin */}
            <div className="text-lg sm:text-xl font-bold text-amber-700 font-mono">
              {currentWord.pinyin}
            </div>

            {/* Vietnamese Meaning */}
            <div className="text-sm sm:text-base font-bold text-slate-700 mt-1">
              {currentWord.vietnamese}
            </div>

            {/* Speaker Button: reads the WHOLE word */}
            <button
              onClick={() => {
                speakChinese(currentWord.hanzi, { rate: speechRate });
                if (soundEnabled) SoundEffects.pop();
              }}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-black text-xs sm:text-sm shadow-md transition-all"
            >
              <Volume2 className="w-4 h-4 animate-pulse" />
              <span>Nghe phát âm từ: {currentWord.hanzi} 📢</span>
            </button>

            {/* For Compound words: show the component characters for guided practice */}
            {isCompoundWord && (
              <div className="mt-3.5 pt-3 border-t border-rose-200/70">
                <div className="text-[11px] font-bold text-slate-500 mb-2">
                  Luyện viết các chữ trong từ ghép "{currentWord.hanzi}":
                </div>
                <div className="flex items-center justify-center gap-2">
                  {currentWord.characters.map((char, cIdx) => {
                    const isSelected = selectedCharIdx === cIdx;
                    const isCharDrawn = drawnFlags[`${currentWord.id}-${cIdx}`];
                    return (
                      <button
                        key={char + cIdx}
                        onClick={() => {
                          setSelectedCharIdx(cIdx);
                          if (soundEnabled) SoundEffects.click();
                        }}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border-2 font-black transition-all text-xs active:scale-95 ${
                          isSelected
                            ? 'bg-rose-500 text-white border-rose-600 shadow-sm scale-105 ring-2 ring-rose-300'
                            : 'bg-white hover:bg-rose-50 text-slate-700 border-rose-200'
                        }`}
                      >
                        <span className="text-lg font-['Noto_Serif_SC',serif]">{char}</span>
                        <span className="text-[10px] opacity-90">(Chữ {cIdx + 1})</span>
                        {isCharDrawn && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 fill-emerald-500 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Quick select other vocabulary words (WHOLE WORDS, NEVER SPLIT) */}
          <div>
            <div className="text-xs font-bold text-slate-600 mb-2 flex items-center justify-between">
              <span>Bảng chọn từ vựng bài học:</span>
              <span className="text-[11px] text-rose-700 font-extrabold bg-rose-100 px-2 py-0.5 rounded-full">
                15 từ
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 max-h-56 overflow-y-auto p-1 scrollbar-thin">
              {vocabList.map((item, idx) => {
                const isSelected = currentWordIndex === idx;
                const isCompound = item.characters.length > 1;
                const isCompleted = praisedWords[item.id] || (item.characters.every((_, i) => drawnFlags[`${item.id}-${i}`]));

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentWordIndex(idx);
                      setSelectedCharIdx(0);
                      if (soundEnabled) SoundEffects.click();
                    }}
                    className={`p-2 rounded-xl text-left transition-all border flex flex-col justify-between active:scale-95 touch-manipulation ${
                      isSelected
                        ? 'bg-rose-500 text-white border-rose-600 shadow-sm ring-2 ring-rose-300 scale-102'
                        : 'bg-rose-50/70 hover:bg-rose-100/80 text-slate-800 border-rose-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-base sm:text-lg font-black font-['Noto_Serif_SC',serif] leading-tight">
                        {item.hanzi}
                      </span>
                      <span className="text-xs">{item.emoji}</span>
                    </div>

                    <div className="flex items-center justify-between mt-1 gap-1">
                      <span className={`text-[11px] font-bold font-mono truncate ${isSelected ? 'text-rose-100' : 'text-amber-800'}`}>
                        {item.pinyin}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-full font-extrabold shrink-0 ${
                          isSelected
                            ? 'bg-white/25 text-white'
                            : isCompound
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-sky-100 text-sky-800'
                        }`}
                      >
                        {isCompound ? 'Từ ghép' : 'Từ đơn'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Writing Canvas (Tianzige with Guided Character) */}
        <div className="lg:col-span-8 bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border-2 border-rose-100 shadow-xs flex flex-col items-center">
          {/* Header info bar for the currently written character */}
          <div className="w-full flex flex-wrap items-center justify-between gap-2 mb-3 bg-rose-50/80 px-3.5 py-2 rounded-2xl border border-rose-200">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black text-rose-950">
                Đang viết: <span className="text-rose-600 font-extrabold text-base font-['Noto_Serif_SC',serif]">"{currentChar}"</span>
                {isCompoundWord && (
                  <span className="text-xs text-slate-600 ml-1 font-semibold">
                    (chữ {selectedCharIdx + 1}/{currentWord.characters.length} của từ ghép <strong className="text-rose-700">{currentWord.hanzi}</strong>)
                  </span>
                )}
              </span>
            </div>

            {/* Quick tabs if compound word */}
            {isCompoundWord && (
              <div className="flex items-center gap-1 bg-white p-0.5 rounded-xl border border-rose-200">
                {currentWord.characters.map((char, cIdx) => (
                  <button
                    key={char + cIdx}
                    onClick={() => {
                      setSelectedCharIdx(cIdx);
                      if (soundEnabled) SoundEffects.click();
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                      selectedCharIdx === cIdx
                        ? 'bg-rose-500 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-rose-600'
                    }`}
                  >
                    <span>{cIdx === 0 ? 'Chữ 1' : 'Chữ 2'}: {char}</span>
                    {drawnFlags[`${currentWord.id}-${cIdx}`] && (
                      <span className="text-[10px] text-emerald-300">✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Canvas Toolbar: Guide toggle, Undo, Clear & Rewrite */}
          <div className="w-full flex flex-wrap items-center justify-between gap-2 mb-3">
            {/* Guide overlay toggle */}
            <button
              onClick={() => {
                setShowGuide(!showGuide);
                if (soundEnabled) SoundEffects.click();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                showGuide
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-slate-100 text-slate-600 border-slate-300'
              }`}
            >
              {showGuide ? <Eye className="w-4 h-4 text-amber-700" /> : <EyeOff className="w-4 h-4" />}
              <span>{showGuide ? 'Đang bật nét mẫu' : 'Đang ẩn nét mẫu'}</span>
            </button>

            {/* Action buttons: Clear & Rewrite + Undo */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleUndo}
                disabled={currentStrokes.length === 0}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 disabled:opacity-40 transition-all active:scale-95"
                title="Lùi lại 1 nét vẽ"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Hoàn tác</span>
              </button>

              <button
                onClick={handleClearAndRewrite}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black bg-rose-500 hover:bg-rose-600 text-white shadow-2xs hover:scale-105 active:scale-95 transition-all"
                title="Xóa hết để viết lại chữ này từ đầu"
              >
                <Trash2 className="w-4 h-4" />
                <span>Xóa đi viết lại 🔄</span>
              </button>
            </div>
          </div>

          {/* Canvas Container with Tianzige Grid and Optional Faint Guide Character */}
          <div className="relative touch-none select-none rounded-2xl overflow-hidden shadow-inner border-3 border-rose-300">
            {/* Faint guide character behind drawing */}
            {showGuide && (
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none select-none text-rose-200/55 font-['Noto_Serif_SC',serif]"
                style={{ fontSize: '230px', lineHeight: 1 }}
              >
                {currentChar}
              </div>
            )}

            <canvas
              ref={canvasRef}
              width={330}
              height={330}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="cursor-crosshair bg-transparent block touch-manipulation"
            />
          </div>

          {/* Brush Color & Thickness Tools */}
          <div className="w-full mt-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 bg-amber-50/70 p-2.5 sm:p-3 rounded-2xl border border-amber-200">
            {/* Color swatches */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
                <Palette className="w-3.5 h-3.5 text-amber-700" />
                <span>Màu bút:</span>
              </span>
              <div className="flex items-center gap-1.5">
                {colors.map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => {
                      setBrushColor(c.hex);
                      if (soundEnabled) SoundEffects.pop();
                    }}
                    style={{ backgroundColor: c.hex }}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      brushColor === c.hex ? 'scale-125 ring-2 ring-offset-2 ring-rose-400' : 'hover:scale-110 active:scale-95'
                    }`}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            {/* Thickness selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-amber-900">Nét bút:</span>
              {[
                { label: 'Thanh', size: 6 },
                { label: 'Vừa', size: 12 },
                { label: 'Đậm', size: 20 },
              ].map((b) => (
                <button
                  key={b.size}
                  onClick={() => {
                    setBrushSize(b.size);
                    if (soundEnabled) SoundEffects.click();
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    brushSize === b.size
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'bg-white text-slate-700 hover:bg-amber-100'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* Next Character / Finish Word Action Area */}
          <div className="w-full mt-3 flex flex-col sm:flex-row items-center justify-between gap-2.5">
            {/* Status note */}
            <div className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
              {isCompoundWord ? (
                <span>
                  Tiến độ từ ghép: <strong>{drawnCountInCurrentWord} / {currentWord.characters.length}</strong> chữ
                </span>
              ) : (
                <span>💡 Bé tô theo nét mẫu hoặc tự viết theo trí nhớ nhé!</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* If compound word and on first character, show button to write next character */}
              {isCompoundWord && selectedCharIdx === 0 && (
                <button
                  onClick={() => {
                    setSelectedCharIdx(1);
                    if (soundEnabled) SoundEffects.click();
                  }}
                  className="flex items-center gap-1 px-3.5 py-2 rounded-xl font-black text-xs sm:text-sm bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300 active:scale-95 transition-all"
                >
                  <span>Viết tiếp chữ "{currentWord.characters[1]}"</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {/* Finish & Earn Star button */}
              <button
                onClick={handleFinishWriting}
                disabled={!hasDrawnCurrentChar}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl font-black text-xs sm:text-sm shadow-md transition-all ${
                  praisedWords[currentWord.id]
                    ? 'bg-emerald-500 text-white cursor-default'
                    : hasDrawnCurrentChar
                    ? 'bg-gradient-to-r from-amber-400 to-rose-400 hover:from-amber-500 hover:to-rose-500 text-white hover:scale-105 active:scale-95 animate-bounce'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {praisedWords[currentWord.id] ? (
                  <>
                    <Award className="w-4 h-4" />
                    <span>Đã hoàn thành từ "{currentWord.hanzi}"! 🌟 +1 Sao</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Viết xong rồi! Nhận sao ⭐</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
