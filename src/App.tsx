import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { NavigationTabs, TabType } from './components/NavigationTabs';
import { VocabularySection } from './components/VocabularySection';
import { WritingPadSection } from './components/WritingPadSection';
import { ExerciseSection } from './components/ExerciseSection';
import { GamesSection } from './components/GamesSection';
import { GrammarSection } from './components/GrammarSection';
import { SummaryReportSection } from './components/SummaryReportSection';
import { VOCABULARY_LIST } from './data/chineseLessonData';
import { SoundEffects } from './utils/audio';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('vocab');
  const [speechRate, setSpeechRate] = useState<number>(0.8); // Friendly and easy to hear for young kids
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [starsCount, setStarsCount] = useState<number>(() => {
    const saved = localStorage.getItem('chinese_stars_count');
    return saved ? parseInt(saved, 10) : 5;
  });

  const [selectedWordForWriting, setSelectedWordForWriting] = useState<string | null>(null);

  // Learning Progress Tracking
  const [reviewedVocabs, setReviewedVocabs] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('chinese_reviewed_vocabs');
      return saved ? JSON.parse(saved) : ['zhoumo', 'laoshi', 'zai', 'you', 'ta', 'piaoliang'];
    } catch {
      return ['zhoumo', 'laoshi', 'zai', 'you', 'ta', 'piaoliang'];
    }
  });

  const [writtenWords, setWrittenWords] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('chinese_written_words');
      return saved ? JSON.parse(saved) : ['zhoumo', 'laoshi', 'zai'];
    } catch {
      return ['zhoumo', 'laoshi', 'zai'];
    }
  });

  const [exerciseResult, setExerciseResult] = useState<{ correct: number; total: number; completed: boolean }>(() => {
    try {
      const saved = localStorage.getItem('chinese_exercise_result');
      return saved ? JSON.parse(saved) : { correct: 6, total: 6, completed: true };
    } catch {
      return { correct: 6, total: 6, completed: true };
    }
  });

  const [gameResult, setGameResult] = useState<{ spaceDestroyed: number; spaceScore: number; bunnyRounds: number }>(() => {
    try {
      const saved = localStorage.getItem('chinese_game_result');
      return saved ? JSON.parse(saved) : { spaceDestroyed: 18, spaceScore: 180, bunnyRounds: 5 };
    } catch {
      return { spaceDestroyed: 18, spaceScore: 180, bunnyRounds: 5 };
    }
  });

  // Persist stars
  useEffect(() => {
    localStorage.setItem('chinese_stars_count', starsCount.toString());
  }, [starsCount]);

  useEffect(() => {
    localStorage.setItem('chinese_reviewed_vocabs', JSON.stringify(reviewedVocabs));
  }, [reviewedVocabs]);

  useEffect(() => {
    localStorage.setItem('chinese_written_words', JSON.stringify(writtenWords));
  }, [writtenWords]);

  useEffect(() => {
    localStorage.setItem('chinese_exercise_result', JSON.stringify(exerciseResult));
  }, [exerciseResult]);

  useEffect(() => {
    localStorage.setItem('chinese_game_result', JSON.stringify(gameResult));
  }, [gameResult]);

  const handleEarnStar = () => {
    setStarsCount((prev) => prev + 1);
  };

  const handleSelectForWriting = (word: string) => {
    setSelectedWordForWriting(word);
    setActiveTab('writing');
    if (soundEnabled) SoundEffects.pop();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fffbf2] text-slate-800 relative selection:bg-rose-200">
      {/* Decorative cute background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-40 print:hidden">
        {/* Soft pastel blobs */}
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-pink-200/50 blur-3xl" />
        <div className="absolute top-1/3 -right-20 w-96 h-96 rounded-full bg-amber-200/50 blur-3xl" />
        <div className="absolute -bottom-20 left-1/4 w-96 h-96 rounded-full bg-sky-200/50 blur-3xl" />
      </div>

      {/* Main App Container */}
      <div className="relative z-10 flex flex-col flex-1">
        {/* Header with Mascot, Speed controls, Sound FX, Stars, and Report Button */}
        <div className="print:hidden">
          <Header
            speechRate={speechRate}
            setSpeechRate={setSpeechRate}
            soundEnabled={soundEnabled}
            setSoundEnabled={setSoundEnabled}
            starsCount={starsCount}
            onOpenReport={() => setActiveTab('report')}
          />
        </div>

        {/* Navigation Tabs */}
        <div className="print:hidden">
          <NavigationTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            soundEnabled={soundEnabled}
          />
        </div>

        {/* Tab Content Display */}
        <main className="flex-1 pb-12">
          {activeTab === 'vocab' && (
            <VocabularySection
              vocabList={VOCABULARY_LIST}
              speechRate={speechRate}
              soundEnabled={soundEnabled}
              onSelectForWriting={handleSelectForWriting}
            />
          )}

          {activeTab === 'writing' && (
            <WritingPadSection
              vocabList={VOCABULARY_LIST}
              speechRate={speechRate}
              soundEnabled={soundEnabled}
              onEarnStar={() => {
                handleEarnStar();
                // Add current word to written words
                if (selectedWordForWriting && !writtenWords.includes(selectedWordForWriting)) {
                  setWrittenWords((prev) => [...prev, selectedWordForWriting]);
                }
              }}
              initialWord={selectedWordForWriting}
            />
          )}

          {activeTab === 'exercises' && (
            <ExerciseSection
              speechRate={speechRate}
              soundEnabled={soundEnabled}
              onEarnStar={handleEarnStar}
            />
          )}

          {activeTab === 'games' && (
            <GamesSection
              vocabList={VOCABULARY_LIST}
              speechRate={speechRate}
              soundEnabled={soundEnabled}
              onEarnStar={() => {
                handleEarnStar();
                setGameResult((prev) => ({
                  ...prev,
                  spaceDestroyed: prev.spaceDestroyed + 1,
                  spaceScore: prev.spaceScore + 10,
                }));
              }}
            />
          )}

          {activeTab === 'grammar' && (
            <GrammarSection
              speechRate={speechRate}
              soundEnabled={soundEnabled}
            />
          )}

          {activeTab === 'report' && (
            <SummaryReportSection
              vocabList={VOCABULARY_LIST}
              starsCount={starsCount}
              reviewedVocabs={reviewedVocabs}
              writtenWords={writtenWords}
              exerciseResult={exerciseResult}
              gameResult={gameResult}
              soundEnabled={soundEnabled}
              onSelectTab={setActiveTab}
            />
          )}
        </main>
      </div>
    </div>
  );
}
