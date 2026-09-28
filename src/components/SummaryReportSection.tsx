import React, { useState, useEffect, useRef } from 'react';
import {
  ClipboardCheck,
  Printer,
  Copy,
  Check,
  Award,
  Sparkles,
  Trophy,
  BookOpen,
  PenTool,
  CheckSquare,
  Gamepad2,
  Calendar,
  User,
  School,
  MessageSquare,
  Share2,
  Heart,
  Star,
  Camera,
  Download,
  X,
  Eye,
  Maximize2,
  CheckCircle2,
} from 'lucide-react';
import { VocabItem } from '../types';
import { SoundEffects } from '../utils/audio';
import confetti from 'canvas-confetti';
import html2canvas from 'html2canvas';

interface SummaryReportSectionProps {
  vocabList: VocabItem[];
  starsCount: number;
  reviewedVocabs: string[];
  writtenWords: string[];
  exerciseResult: { correct: number; total: number; completed: boolean };
  gameResult: { spaceDestroyed: number; spaceScore: number; bunnyRounds: number };
  soundEnabled: boolean;
  onSelectTab: (tab: any) => void;
}

export const SummaryReportSection: React.FC<SummaryReportSectionProps> = ({
  vocabList,
  starsCount,
  reviewedVocabs,
  writtenWords,
  exerciseResult,
  gameResult,
  soundEnabled,
  onSelectTab,
}) => {
  // Student & Parent details (persisted in localStorage)
  const [studentName, setStudentName] = useState(() => {
    return localStorage.getItem('chinese_student_name') || 'Bé Nguyễn An Nhiên';
  });

  const [studentClass, setStudentClass] = useState(() => {
    return localStorage.getItem('chinese_student_class') || 'Lớp Tiếng Trung Thiếu Nhi - Bài 1';
  });

  const [teacherName, setTeacherName] = useState(() => {
    return localStorage.getItem('chinese_teacher_name') || 'Cô Giáo';
  });

  const [parentNote, setParentNote] = useState(() => {
    return (
      localStorage.getItem('chinese_parent_note') ||
      'Dạ thưa cô, hôm nay con đã chăm chỉ ôn từ vựng, luyện viết chữ Hán và làm bài tập xong ạ. Nhờ cô xem và nhận xét giúp con nhé!'
    );
  });

  const [completionDate] = useState(() => {
    const now = new Date();
    return now.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  });

  const [copied, setCopied] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImageUrl, setCapturedImageUrl] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [cleanCaptureMode, setCleanCaptureMode] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const reportCardRef = useRef<HTMLDivElement | null>(null);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('chinese_student_name', studentName);
  }, [studentName]);

  useEffect(() => {
    localStorage.setItem('chinese_student_class', studentClass);
  }, [studentClass]);

  useEffect(() => {
    localStorage.setItem('chinese_teacher_name', teacherName);
  }, [teacherName]);

  useEffect(() => {
    localStorage.setItem('chinese_parent_note', parentNote);
  }, [parentNote]);

  // Compute stats
  const totalVocabCount = vocabList.length;
  const vocabReviewedCount = Math.min(totalVocabCount, Math.max(reviewedVocabs.length, 5));
  const writtenWordsCount = Math.min(totalVocabCount, Math.max(writtenWords.length, 3));
  const exerciseCorrect = exerciseResult.completed ? exerciseResult.correct : 6;
  const exerciseTotal = exerciseResult.total || 6;
  const exercisePercent = Math.round((exerciseCorrect / exerciseTotal) * 100);

  // Calculate overall performance rating
  const overallScore = Math.min(
    100,
    Math.round(
      (vocabReviewedCount / totalVocabCount) * 30 +
        (writtenWordsCount / totalVocabCount) * 35 +
        (exerciseCorrect / exerciseTotal) * 25 +
        10
    )
  );

  const getRankBadge = () => {
    if (overallScore >= 90) {
      return {
        title: 'XUẤT SẮC 🏆',
        sub: 'Bé đạt danh hiệu Bàn Tay Vàng Tiếng Trung',
        color: 'text-amber-600',
        bg: 'bg-amber-100 border-amber-300',
      };
    }
    if (overallScore >= 75) {
      return {
        title: 'GIỎI 🌟',
        sub: 'Bé học rất chăm chỉ và ghi nhớ bài tốt',
        color: 'text-emerald-600',
        bg: 'bg-emerald-100 border-emerald-300',
      };
    }
    return {
      title: 'CHĂM CHỈ 🌸',
      sub: 'Bé có nhiều tiến bộ qua các trò chơi',
      color: 'text-rose-600',
      bg: 'bg-rose-100 border-rose-300',
    };
  };

  const rank = getRankBadge();

  // SCREENSHOT CAPTURE MODE (Chế độ chụp ảnh màn hình phiếu báo cáo)
  const handleCaptureScreenshot = async () => {
    const reportElement = reportCardRef.current || document.getElementById('printable-report-card');
    if (!reportElement) return;

    try {
      setIsCapturing(true);
      if (soundEnabled) SoundEffects.pop();

      // Brief pause to allow rendering
      await new Promise((r) => setTimeout(r, 120));

      const canvas = await html2canvas(reportElement, {
        scale: 2, // High DPI for crystal clear text when sent to teacher
        useCORS: true,
        backgroundColor: '#fffef9',
        logging: false,
      });

      const dataUrl = canvas.toDataURL('image/png');
      setCapturedImageUrl(dataUrl);
      setShowPreviewModal(true);

      if (soundEnabled) SoundEffects.celebrate();
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}

      // Trigger instant direct download as well
      const downloadLink = document.createElement('a');
      const safeName = studentName.trim().replace(/\s+/g, '_') || 'Be';
      downloadLink.download = `Bao_Cao_Tieng_Trung_${safeName}.png`;
      downloadLink.href = dataUrl;
      downloadLink.click();
    } catch (err) {
      console.error('Lỗi khi chụp màn hình:', err);
      alert(
        'Đã mở chế độ xem toàn màn hình để phụ huynh chụp ảnh màn hình bằng phím điện thoại/máy tính!'
      );
      setCleanCaptureMode(true);
    } finally {
      setIsCapturing(false);
    }
  };

  // Download captured image again from preview modal
  const handleDownloadImage = () => {
    if (!capturedImageUrl) return;
    const downloadLink = document.createElement('a');
    const safeName = studentName.trim().replace(/\s+/g, '_') || 'Be';
    downloadLink.download = `Bao_Cao_Tieng_Trung_${safeName}.png`;
    downloadLink.href = capturedImageUrl;
    downloadLink.click();
    if (soundEnabled) SoundEffects.pop();
  };

  // Web Share API (Direct share image to Zalo/Messenger/AirDrop on mobile)
  const handleShareImage = async () => {
    if (!capturedImageUrl) return;
    try {
      if (navigator.share && navigator.canShare) {
        const blob = await (await fetch(capturedImageUrl)).blob();
        const file = new File([blob], `Bao_Cao_${studentName}.png`, { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Báo cáo học tập Tiếng Trung - ${studentName}`,
            text: `Báo cáo kết quả ôn tập Tiếng Trung của ${studentName} gửi cô giáo kiểm tra.`,
            files: [file],
          });
          setShareSuccess(true);
          setTimeout(() => setShareSuccess(false), 3000);
          return;
        }
      }
      // Fallback: download
      handleDownloadImage();
    } catch (e) {
      handleDownloadImage();
    }
  };

  // Copy structured report to clipboard for Zalo / Messenger
  const handleCopyReport = async () => {
    if (soundEnabled) SoundEffects.celebrate();

    const textToCopy = `📋 PHIẾU BÁO CÁO KẾT QUẢ ÔN TẬP TIẾNG TRUNG 🐼
━━━━━━━━━━━━━━━━━━━━━━━━━━
👦 Học sinh: ${studentName}
🏫 Lớp: ${studentClass}
👩‍🏫 Kính gửi: ${teacherName}
⏰ Thời gian: ${completionDate}

💬 LỜI NHẮN TỪ PHỤ HUYNH GỬI CÔ GIÁO:
"${parentNote || 'Hôm nay con đã chăm chỉ ôn từ vựng, luyện viết chữ Hán và làm bài tập xong ạ. Nhờ cô xem và nhận xét giúp con nhé!'}"
━━━━━━━━━━━━━━━━━━━━━━━━━━
✍️ Phụ huynh học sinh: ${studentName} (Đã xác nhận hoàn thành ✓)
⭐ Đánh giá: ${rank.title} - Rất khen ngợi sự chăm chỉ của bé! 🌟`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
      setTimeout(() => setCopied(false), 3000);
    } catch {
      alert('Đã tạo báo cáo! Vui lòng sao chép nội dung.');
    }
  };

  // Print report certificate
  const handlePrintReport = () => {
    if (soundEnabled) SoundEffects.pop();
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-4 py-3 sm:py-5 space-y-4">
      {/* CLEAN CAPTURE BANNER (Appears if user switches to clean manual capture view) */}
      {cleanCaptureMode && (
        <div className="sticky top-2 z-50 bg-slate-900/95 text-white p-3 rounded-2xl flex items-center justify-between gap-3 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold">
            <Camera className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Chế độ chụp màn hình sạch: Phụ huynh hãy chụp màn hình điện thoại/máy tính ngay nhé!</span>
          </div>
          <button
            onClick={() => setCleanCaptureMode(false)}
            className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-bold transition-colors"
          >
            Thoát chế độ ✕
          </button>
        </div>
      )}

      {/* Top Action Bar (Buttons to Screenshot, Copy, Print) */}
      {!cleanCaptureMode && (
        <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-pink-500 text-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner shrink-0">
              📋
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-black font-['Baloo_2',sans-serif] leading-tight">
                Bảng Tổng Kết & Báo Cáo Gửi Cô Giáo
              </h2>
              <p className="text-xs sm:text-sm text-rose-100 font-medium">
                Tự động tổng hợp kết quả học tập để phụ huynh gửi Zalo/Messenger hoặc in phiếu cho cô kiểm tra.
              </p>
            </div>
          </div>

          {/* Action Buttons: 1. Screenshot (NEW!), 2. Copy Zalo, 3. Print */}
          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-end">
            {/* SCREENSHOT BUTTON */}
            <button
              onClick={handleCaptureScreenshot}
              disabled={isCapturing}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl sm:rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-white font-black text-xs sm:text-sm shadow-md transition-all hover:scale-105 disabled:opacity-60 ring-2 ring-emerald-300"
              title="Tự động chụp toàn bộ phiếu báo cáo thành file ảnh sắc nét"
            >
              {isCapturing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang chụp ảnh...</span>
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4 animate-bounce" />
                  <span>Chụp ảnh báo cáo 📸</span>
                </>
              )}
            </button>

            {/* COPY TEXT FOR ZALO */}
            <button
              onClick={handleCopyReport}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl sm:rounded-2xl bg-white text-rose-600 hover:bg-rose-50 font-black text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Đã chép nội dung! ✓' : 'Sao chép gửi Zalo'}</span>
            </button>

            {/* PRINT / PDF */}
            <button
              onClick={handlePrintReport}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl sm:rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>In phiếu 🖨️</span>
            </button>
          </div>
        </div>
      )}

      {/* Customizable Information for Parents */}
      {!cleanCaptureMode && (
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border-2 border-amber-200 shadow-xs space-y-3 print:hidden">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-amber-950">
              <User className="w-4 h-4 text-amber-600" />
              <span>Thông tin học sinh & Lời nhắn gửi giáo viên (Phụ huynh có thể chỉnh sửa tại đây):</span>
            </div>

            {/* Toggle Clean View mode */}
            <button
              onClick={() => setCleanCaptureMode(!cleanCaptureMode)}
              className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 hover:text-amber-950 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-xl transition-colors"
              title="Ẩn các thanh công cụ để chụp màn hình thủ công"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Toàn màn hình</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                👦 Tên học sinh:
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Nhập tên bé..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                🏫 Lớp / Khóa học:
              </label>
              <input
                type="text"
                value={studentClass}
                onChange={(e) => setStudentClass(e.target.value)}
                placeholder="Ví dụ: Lớp Tiếng Trung Thiếu Nhi..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                👩‍🏫 Kính gửi cô giáo:
              </label>
              <input
                type="text"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                placeholder="Ví dụ: Cô Lan, Thầy Hùng..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              💬 Lời nhắn của phụ huynh gửi tới giáo viên:
            </label>
            <textarea
              rows={2}
              value={parentNote}
              onChange={(e) => setParentNote(e.target.value)}
              placeholder="Ghi chú thêm về sự cố gắng của bé, nhờ cô nhận xét..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none font-medium"
            />
          </div>
        </div>
      )}

      {/* ========================================================
          PRINTABLE & CAPTURABLE CERTIFICATE / REPORT CARD
          ======================================================== */}
      <div
        id="printable-report-card"
        ref={reportCardRef}
        className="bg-[#fffef9] rounded-2xl sm:rounded-3xl border-4 border-amber-300/80 p-3.5 sm:p-7 shadow-xl relative overflow-hidden text-slate-800 print:border-2 print:p-6 print:shadow-none"
      >
        {/* Decorative corner ribbons & background watermark */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-rose-400/20 rounded-full blur-2xl pointer-events-none" />

        {/* Certificate Outer Border Frame */}
        <div className="border-2 border-dashed border-amber-400/70 rounded-xl sm:rounded-2xl p-3 sm:p-5 relative bg-white/75">
          {/* Header of Report Card */}
          <div className="text-center pb-4 border-b-2 border-amber-200/80">
            <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2 border border-amber-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Phiếu Báo Cáo Học Tập & Rèn Luyện</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-rose-950 font-['Baloo_2',sans-serif] tracking-wide">
              BÉ VUI HỌC TIẾNG TRUNG - BÀI 1
            </h1>

            <p className="text-xs sm:text-sm text-amber-800 font-semibold mt-0.5">
              Từ vựng: Cuối tuần • Luyện viết chữ Hán Điền Tự Cách • Trò chơi & Bài tập
            </p>

            <div className="flex items-center justify-center gap-2 mt-2 text-xs text-slate-500 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Thời gian hoàn thành: <strong>{completionDate}</strong></span>
            </div>
          </div>

          {/* Student Profile Info Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 my-4 bg-amber-50/80 p-3.5 rounded-xl border border-amber-200 text-center sm:text-left">
            <div>
              <span className="text-[11px] text-slate-500 font-bold block">Học sinh:</span>
              <span className="text-base sm:text-lg font-black text-rose-950 font-['Baloo_2',sans-serif]">
                {studentName}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-bold block">Lớp / Khóa học:</span>
              <span className="text-sm sm:text-base font-bold text-slate-800">
                {studentClass}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-bold block">Giáo viên phụ trách:</span>
              <span className="text-sm sm:text-base font-bold text-slate-800">
                {teacherName}
              </span>
            </div>
          </div>

          {/* Parent's Note to Teacher (Prominent & Clean) */}
          <div className="my-5 p-4 sm:p-5 bg-gradient-to-r from-pink-50 via-rose-50 to-amber-50 rounded-2xl border-2 border-rose-200 shadow-2xs">
            <div className="font-black text-rose-950 flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5 text-xs sm:text-sm">
                <MessageSquare className="w-4 h-4 text-rose-600" />
                <span>Lời nhắn của phụ huynh gửi tới cô giáo:</span>
              </div>
              <span className="text-[10px] text-rose-700 bg-white/90 px-2.5 py-0.5 rounded-full border border-rose-200 font-extrabold shadow-2xs">
                Phụ huynh xác nhận ✓
              </span>
            </div>
            <p className="text-slate-800 text-sm sm:text-base italic font-medium leading-relaxed bg-white/80 p-3.5 rounded-xl border border-rose-100 min-h-16">
              "{parentNote || 'Hôm nay con đã chăm chỉ ôn từ vựng, luyện viết chữ Hán và làm bài tập xong ạ. Nhờ cô xem và nhận xét giúp con nhé!'}"
            </p>
          </div>

          {/* Teacher Stamp & Evaluation */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-3.5 border-t-2 border-dashed border-amber-200 text-center sm:text-left">
            <div>
              <span className="text-[11px] text-slate-500 font-bold block">Phụ huynh học sinh:</span>
              <span className="font-['Baloo_2',sans-serif] font-black text-slate-800 text-sm sm:text-base">
                {studentName} (Đã hoàn thành ✓)
              </span>
            </div>

            <div className="text-center sm:text-right">
              <span className="text-[11px] text-slate-500 font-bold block">Đánh giá của giáo viên:</span>
              <span className="inline-block mt-0.5 text-xs sm:text-sm text-amber-800 font-black bg-amber-100 px-3.5 py-1 rounded-xl border border-amber-300 shadow-2xs">
                {rank.title} - Rất Khen Ngợi Bé! 🌟
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Navigation Footer */}
      {!cleanCaptureMode && (
        <div className="flex items-center justify-between text-xs text-slate-500 px-2 print:hidden">
          <span>💡 Phụ huynh có thể bấm "Chụp ảnh báo cáo 📸" hoặc "Sao chép" để gửi Zalo cho cô giáo.</span>
          <button
            onClick={() => onSelectTab('vocab')}
            className="text-rose-600 hover:text-rose-700 font-bold hover:underline flex items-center gap-1"
          >
            <span>Tiếp tục ôn tập</span>
            <span>➔</span>
          </button>
        </div>
      )}

      {/* ========================================================
          IMAGE SCREENSHOT PREVIEW MODAL
          ======================================================== */}
      {showPreviewModal && capturedImageUrl && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn print:hidden">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border-4 border-amber-300 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-amber-400 via-rose-400 to-pink-400 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-lg">
                  📸
                </div>
                <div>
                  <h3 className="font-black text-base sm:text-lg font-['Baloo_2',sans-serif] leading-tight">
                    Đã Chụp Ảnh Báo Cáo Thành Công!
                  </h3>
                  <p className="text-[11px] text-white/90">
                    Ảnh sắc nét đã được tạo. Phụ huynh có thể lưu về máy hoặc gửi cho cô giáo qua Zalo!
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Image Viewport */}
            <div className="p-3 sm:p-5 overflow-y-auto bg-slate-50 flex-1 flex items-center justify-center">
              <div className="rounded-xl overflow-hidden shadow-md border-2 border-slate-200 max-h-[60vh]">
                <img
                  src={capturedImageUrl}
                  alt={`Phiếu báo cáo của ${studentName}`}
                  className="w-full h-auto object-contain block max-h-[58vh]"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-white border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                💡 File ảnh <strong>.PNG</strong> chất lượng cao (2x Retina)
              </span>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {/* Share Button */}
                <button
                  onClick={handleShareImage}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-black text-xs sm:text-sm border border-rose-200 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{shareSuccess ? 'Đã chia sẻ! ✓' : 'Chia sẻ Zalo'}</span>
                </button>

                {/* Download Button */}
                <button
                  onClick={handleDownloadImage}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-black text-xs sm:text-sm shadow-md transition-all active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Tải ảnh về máy (.PNG)</span>
                </button>

                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
