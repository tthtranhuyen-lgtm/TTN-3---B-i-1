import React, { useRef, useState, useEffect } from 'react';
import { BookOpen, PenTool, CheckSquare, Gamepad2, Sparkles, ClipboardCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { SoundEffects } from '../utils/audio';

export type TabType = 'vocab' | 'writing' | 'exercises' | 'games' | 'grammar' | 'report';

interface NavigationTabsProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  soundEnabled: boolean;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  setActiveTab,
  soundEnabled,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const tabs = [
    {
      id: 'vocab' as TabType,
      label: 'Vườn Từ Vựng',
      icon: BookOpen,
      badge: '15 từ',
      activeBg: 'bg-amber-100 text-amber-950 border-amber-400 shadow-md ring-2 ring-amber-300',
      tagEmoji: '🌸'
    },
    {
      id: 'writing' as TabType,
      label: 'Bé Luyện Viết',
      icon: PenTool,
      badge: 'Ô kẻ 田字格',
      activeBg: 'bg-rose-100 text-rose-950 border-rose-400 shadow-md ring-2 ring-rose-300',
      tagEmoji: '✏️'
    },
    {
      id: 'exercises' as TabType,
      label: 'Bài Tập Điền Từ',
      icon: CheckSquare,
      badge: 'Trang 3',
      activeBg: 'bg-emerald-100 text-emerald-950 border-emerald-400 shadow-md ring-2 ring-emerald-300',
      tagEmoji: '⭐'
    },
    {
      id: 'games' as TabType,
      label: 'Trò Chơi Ôn Bài',
      icon: Gamepad2,
      badge: 'Vui vẻ',
      activeBg: 'bg-purple-100 text-purple-950 border-purple-400 shadow-md ring-2 ring-purple-300',
      tagEmoji: '🎮'
    },
    {
      id: 'grammar' as TabType,
      label: 'Góc Ngữ Pháp',
      icon: Sparkles,
      badge: '3 cấu trúc',
      activeBg: 'bg-sky-100 text-sky-950 border-sky-400 shadow-md ring-2 ring-sky-300',
      tagEmoji: '💡'
    },
    {
      id: 'report' as TabType,
      label: 'Bảng Tổng Kết',
      icon: ClipboardCheck,
      badge: 'Gửi cô giáo 📋',
      activeBg: 'bg-gradient-to-r from-amber-500 to-rose-500 text-white border-amber-600 shadow-md ring-2 ring-amber-300',
      tagEmoji: '🏆'
    },
  ];

  const checkScroll = () => {
    const el = scrollContainerRef.current;
    if (el) {
      // Small tolerance of 2px
      setCanScrollLeft(el.scrollLeft > 4);
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (el) {
      const scrollAmount = 240;
      el.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      if (soundEnabled) SoundEffects.click();
    }
  };

  // Convert vertical mouse wheel to horizontal scrolling if cursor is over tab bar
  const handleWheel = (e: React.WheelEvent) => {
    const el = scrollContainerRef.current;
    if (el && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      el.scrollLeft += e.deltaY;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 pt-4 pb-2 relative">
      <div className="relative flex items-center">
        {/* Left Scroll Arrow Button */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute -left-1 sm:left-0 z-20 w-8 h-8 rounded-full bg-white/95 border-2 border-amber-300 shadow-md text-amber-800 flex items-center justify-center hover:bg-amber-100 active:scale-95 transition-all"
            title="Kéo sang trái"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Scrollable Container without justify-center to prevent clipping */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          onWheel={handleWheel}
          className="w-full flex items-center justify-start gap-2.5 overflow-x-auto pb-2 pt-1 px-1 sm:px-2 scrollbar-thin scrollbar-thumb-amber-200/80 scroll-smooth touch-pan-x"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (soundEnabled) SoundEffects.click();
                }}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl font-['Baloo_2',sans-serif] font-bold text-sm sm:text-base transition-all transform duration-200 border-2 ${
                  isActive
                    ? `${tab.activeBg} scale-105`
                    : 'bg-white/90 hover:bg-white text-slate-700 border-amber-200/70 hover:border-amber-300 shadow-sm'
                }`}
              >
                <span className="text-lg leading-none">{tab.tagEmoji}</span>
                <Icon className="w-4 h-4 opacity-80" />
                <span className="tracking-wide">{tab.label}</span>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider ${
                    isActive
                      ? 'bg-white/90 text-slate-800 shadow-xs'
                      : 'bg-amber-50 text-amber-800 border border-amber-100'
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Scroll Arrow Button */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute -right-1 sm:right-0 z-20 w-8 h-8 rounded-full bg-white/95 border-2 border-amber-300 shadow-md text-amber-800 flex items-center justify-center hover:bg-amber-100 active:scale-95 transition-all"
            title="Kéo sang phải"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};
