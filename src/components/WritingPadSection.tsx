import React, { useRef, useState, useEffect } from 'react';
import { RotateCcw, Trash2, Volume2, Sparkles, Eye, EyeOff, Palette, ChevronLeft, ChevronRight, Award } from 'lucide-react';
import { VocabItem } from '../types';
import { speakChinese, SoundEffects } from '../utils/audio';
import confetti from 'canvas-confetti';

interface WritingPadSectionProps {
  vocabList: VocabItem[];
  speechRate: number;
  soundEnabled: boolean;
  onEarnStar: () => void;
}

export const WritingPadSection: React.FC<WritingPadSectionProps> = ({
  vocabList,
  speechRate,
  soundEnabled,
  onEarnStar,
}) => {
  // Flatten unique characters from vocab list
  const allCharacters = React.useMemo(() => {
    const list: { char: string; pinyin: string; word: string; meaning: string }[] = [];
    vocabList.forEach((v) => {
      v.characters.forEach((char) => {
        if (!list.some((item) => item.char === char)) {
          list.push({
            char,
            pinyin: v.pinyin,
            word: v.hanzi,
            meaning: v.vietnamese,
          });
        }
      });
    });
    return list;
  }, [vocabList]);

  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const currentChar = allCharacters[currentCharIndex] || allCharacters[0];

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#e11d48'); // playful red/rose default
  const [brushSize, setBrushSize] = useState(12);
  const [showGuide, setShowGuide] = useState(true);
  const [strokeHistory, setStrokeHistory] = useState<ImageData[]>([]);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [praised, setPraised] = useState(false);

  // Palette colors for kids
  const colors = [
    { name: 'Đỏ son', hex: '#e11d48' },
    { name: 'Mực đen', hex: '#1e293b' },
    { name: 'Xanh ngọc', hex: '#0284c7' },
    { name: 'Xanh lá', hex: '#16a34a' },
    { name: 'Tím mộng', hex: '#9333ea' },
    { name: 'Cam vàng', hex: '#ea580c' },
  ];

  // Draw Tianzige background
  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.save();
    // Clear whole canvas
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

  // Re-draw background & guide
  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawGrid(ctx, canvas.width, canvas.height);
    setStrokeHistory([]);
    setHasDrawn(false);
    setPraised(false);
  };

  useEffect(() => {
    redrawCanvas();
  }, [currentCharIndex]);

  // "Xóa đi viết lại" - Clear & Rewrite
  const handleClearAndRewrite = () => {
    if (soundEnabled) SoundEffects.pop();
    redrawCanvas();
  };

  // Undo last stroke
  const handleUndo = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (strokeHistory.length > 0) {
      if (soundEnabled) SoundEffects.click();
      const newHistory = [...strokeHistory];
      newHistory.pop();
      setStrokeHistory(newHistory);

      if (newHistory.length === 0) {
        drawGrid(ctx, canvas.width, canvas.height);
        setHasDrawn(false);
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
    setStrokeHistory((prev) => [...prev, currentState]);

    setIsDrawing(true);
    setHasDrawn(true);

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

  const handleFinishWriting = () => {
    if (!praised) {
      setPraised(true);
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
      {/* Title banner */}
      <div className="bg-gradient-to-r from-rose-100 via-pink-100 to-amber-100 rounded-3xl p-4 sm:p-5 border-2 border-rose-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-400 text-white flex items-center justify-center text-2xl shadow-sm">
            ✍️
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-rose-950 font-['Baloo_2',sans-serif]">
              Bé Luyện Viết Chữ Hán
            </h2>
            <p className="text-xs sm:text-sm text-rose-800 font-semibold">
              Tập viết trên ô kẻ Điền Tự Cách (田字格) • Có bút màu, xóa đi viết lại thỏa thích!
            </p>
          </div>
        </div>

        {/* Word / Char Switcher */}
        <div className="flex items-center gap-2 bg-white/90 px-3 py-1.5 rounded-2xl border border-rose-200 shadow-sm">
          <button
            onClick={() => {
              if (currentCharIndex > 0) {
                setCurrentCharIndex(currentCharIndex - 1);
                if (soundEnabled) SoundEffects.click();
              }
            }}
            disabled={currentCharIndex === 0}
            className="p-1.5 rounded-xl hover:bg-rose-100 disabled:opacity-30 disabled:hover:bg-transparent text-rose-700"
            title="Chữ trước"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-black text-rose-900 min-w-16 text-center">
            {currentCharIndex + 1} / {allCharacters.length} chữ
          </span>
          <button
            onClick={() => {
              if (currentCharIndex < allCharacters.length - 1) {
                setCurrentCharIndex(currentCharIndex + 1);
                if (soundEnabled) SoundEffects.click();
              }
            }}
            disabled={currentCharIndex === allCharacters.length - 1}
            className="p-1.5 rounded-xl hover:bg-rose-100 disabled:opacity-30 disabled:hover:bg-transparent text-rose-700"
            title="Chữ sau"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Board Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Character Info & Selection carousel */}
        <div className="lg:col-span-4 bg-white/95 backdrop-blur-sm rounded-3xl p-5 border-2 border-rose-100 shadow-sm space-y-4">
          <div className="text-center p-4 bg-gradient-to-b from-rose-50 to-amber-50/60 rounded-2xl border border-rose-100">
            <span className="text-xs font-bold px-2.5 py-1 bg-rose-200/80 text-rose-800 rounded-full inline-block mb-2">
              Trong từ: {currentChar.word}
            </span>
            <div className="text-6xl font-black text-slate-800 font-['Noto_Serif_SC',serif] my-1">
              {currentChar.char}
            </div>
            <div className="text-lg font-bold text-amber-700">{currentChar.pinyin}</div>
            <div className="text-sm font-semibold text-slate-600 mt-1">{currentChar.meaning}</div>

            {/* Listen button */}
            <button
              onClick={() => {
                speakChinese(currentChar.char, { rate: speechRate });
              }}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md hover:scale-105 transition-transform"
            >
              <Volume2 className="w-4 h-4 animate-pulse" />
              <span>Nghe phát âm</span>
            </button>
          </div>

          {/* Quick select other characters */}
          <div>
            <div className="text-xs font-bold text-slate-500 mb-2 flex items-center justify-between">
              <span>Bảng chọn nhanh chữ Hán:</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5 max-h-48 overflow-y-auto p-1 scrollbar-thin">
              {allCharacters.map((c, i) => (
                <button
                  key={c.char + i}
                  onClick={() => {
                    setCurrentCharIndex(i);
                    if (soundEnabled) SoundEffects.click();
                  }}
                  className={`h-10 rounded-xl font-bold text-base transition-all ${
                    currentCharIndex === i
                      ? 'bg-rose-500 text-white shadow-sm scale-105'
                      : 'bg-rose-50 hover:bg-rose-100 text-slate-700'
                  }`}
                >
                  {c.char}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Writing Canvas */}
        <div className="lg:col-span-8 bg-white/95 backdrop-blur-sm rounded-3xl p-5 border-2 border-rose-100 shadow-sm flex flex-col items-center">
          {/* Top toolbar */}
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
              <span>{showGuide ? 'Đang bật chữ mẫu' : 'Đang ẩn chữ mẫu'}</span>
            </button>

            {/* Action buttons: Clear & Rewrite + Undo */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleUndo}
                disabled={strokeHistory.length === 0}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 disabled:opacity-40 transition-all"
                title="Lùi lại 1 nét vẽ"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Hoàn tác</span>
              </button>

              {/* SPECIAL EMPHASIS: "Xóa đi viết lại" button */}
              <button
                onClick={handleClearAndRewrite}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black bg-rose-500 hover:bg-rose-600 text-white shadow-sm hover:scale-105 active:scale-95 transition-all"
                title="Xóa hết để viết lại chữ này từ đầu"
              >
                <Trash2 className="w-4 h-4" />
                <span>Xóa đi viết lại 🔄</span>
              </button>
            </div>
          </div>

          {/* Canvas Container with Tianzige Grid and Optional Faint Guide Character */}
          <div className="relative touch-none select-none rounded-2xl overflow-hidden shadow-inner border-2 border-rose-300">
            {/* Faint guide character behind drawing */}
            {showGuide && (
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none select-none text-rose-200/50 font-['Noto_Serif_SC',serif]"
                style={{ fontSize: '240px', lineHeight: 1 }}
              >
                {currentChar.char}
              </div>
            )}

            <canvas
              ref={canvasRef}
              width={340}
              height={340}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="cursor-crosshair bg-transparent block"
            />
          </div>

          {/* Brush Color & Thickness Tools */}
          <div className="w-full mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-amber-50/70 p-3 rounded-2xl border border-amber-200">
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
                      brushColor === c.hex ? 'scale-125 ring-2 ring-offset-2 ring-rose-400' : 'hover:scale-110'
                    }`}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            {/* Thickness selector */}
            <div className="flex items-center gap-2">
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
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-white text-slate-700 hover:bg-amber-100'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* Encouragement & Finish button */}
          <div className="w-full mt-3 flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-slate-500">
              💡 Bé tô theo nét mẫu hoặc tự viết theo trí nhớ nhé!
            </span>
            <button
              onClick={handleFinishWriting}
              disabled={!hasDrawn}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl font-black text-sm shadow-md transition-all ${
                praised
                  ? 'bg-emerald-500 text-white cursor-default'
                  : hasDrawn
                  ? 'bg-gradient-to-r from-amber-400 to-rose-400 hover:from-amber-500 hover:to-rose-500 text-white hover:scale-105 active:scale-95 animate-bounce'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {praised ? (
                <>
                  <Award className="w-4 h-4" />
                  <span>Bé đã viết rất đẹp! 🌟 +1 Sao</span>
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
  );
};
