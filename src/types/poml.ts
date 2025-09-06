export interface PomlSection {
  id: string;
  type: 'overview' | 'objective' | 'motivation' | 'learning' | 'custom';
  content: string;
  startLine?: number;
  endLine?: number;
  confidence: number;
}

export interface PomlGenerationResult {
  poml: string;
  confidence: number;
  sections: string[];
  metadata: {
    generatedAt: string;
    version: string;
    wordCount: number;
    sectionCount: number;
  };
}

export interface AnalysisResult {
  overview: string;
  keyPoints: string[];
  structure: string[];
  confidence: number;
  complexity: number;
  readability: number;
  metadata: {
    wordCount: number;
    sentenceCount: number;
    paragraphCount: number;
    averageWordsPerSentence: number;
    readingTime: number;
  };
}
