export interface VocabItem {
  id: string;
  hanzi: string;
  pinyin: string;
  vietnamese: string;
  category: 'time' | 'person' | 'verb' | 'adjective' | 'noun' | 'grammar';
  emoji: string;
  exampleSentence: string;
  examplePinyin: string;
  exampleVietnamese: string;
  notes?: string;
  characters: string[]; // individual characters for writing practice
}

export interface SentenceItem {
  id: string;
  chinese: string;
  pinyin: string;
  vietnamese: string;
  tag: string;
  emoji: string;
}

export interface ExerciseItem {
  id: number;
  question: string; // e.g. "她是我们的 ______ 。"
  beforeBlank: string;
  afterBlank: string;
  correctAnswer: string;
  fullPinyin: string;
  fullVietnamese: string;
  hint: string;
}

export interface GrammarPattern {
  id: string;
  title: string;
  structure: string;
  meaning: string;
  color: string;
  examples: {
    chinese: string;
    pinyin: string;
    vietnamese: string;
    breakdown?: string;
    imageType?: 'coke' | 'tv' | 'school' | 'badminton' | 'home' | 'park';
  }[];
}
