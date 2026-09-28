import React, { useState } from 'react';
import { Header } from './components/Header';
import { NavigationTabs, TabType } from './components/NavigationTabs';
import { VocabularySection } from './components/VocabularySection';
import { WritingPadSection } from './components/WritingPadSection';
import { ExerciseSection } from './components/ExerciseSection';
import { GamesSection } from './components/GamesSection';
import { GrammarSection } from './components/GrammarSection';
import { VOCABULARY_LIST } from './data/chineseLessonData';
import { SoundEffects } from './utils/audio';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('vocab');
  const [speechRate, setSpeechRate] = useState<number>(0.8); // Friendly and easy to hear for young kids
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [starsCount, setStarsCount] = useState<number>(3); // Initial bonus stars to encourage kids!

  const handleEarnStar = () => {
    setStarsCount((prev) => prev + 1);
  };

  const handleSelectForWriting = (word: string) => {
    setActiveTab('writing');
    if (soundEnabled) SoundEffects.pop();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fffbf2] text-slate-800 relative selection:bg-rose-200">
      {/* Decorative cute background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-40">
        {/* Soft pastel blobs */}
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-pink-200/50 blur-3xl" />
        <div className="absolute top-1/3 -right-20 w-96 h-96 rounded-full bg-amber-200/50 blur-3xl" />
        <div className="absolute -bottom-20 left-1/4 w-96 h-96 rounded-full bg-sky-200/50 blur-3xl" />
      </div>

      {/* Main App Container */}
      <div className="relative z-10 flex flex-col flex-1">
        {/* Header with Mascot, Speed controls, Sound FX, Stars */}
        <Header
          speechRate={speechRate}
          setSpeechRate={setSpeechRate}
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
          starsCount={starsCount}
        />

        {/* Navigation Tabs */}
        <NavigationTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          soundEnabled={soundEnabled}
        />

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
              onEarnStar={handleEarnStar}
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
              onEarnStar={handleEarnStar}
            />
          )}

          {activeTab === 'grammar' && (
            <GrammarSection
              speechRate={speechRate}
              soundEnabled={soundEnabled}
            />
          )}
        </main>
      </div>
    </div>
  );
}
