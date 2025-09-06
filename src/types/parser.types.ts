export type SectionType = 'role' | 'task' | 'constraints' | 'examples' | 'outputFormat' | 'unknown';

export interface DetectedSection {
  id: string;
  type: SectionType;
  content: string;
  confidence: number;
  startIndex: number;
  endIndex: number;
  patterns?: string[];
  metadata?: Record<string, any>;
}

export interface ParseError {
  type: string;
  message: string;
  line?: number;
  column?: number;
  severity: 'error' | 'warning' | 'info';
}

export interface ParseResult {
  sections: DetectedSection[];
  errors: ParseError[];
  confidence: number;
}

export interface AnalysisResult {
  sections: DetectedSection[];
  confidence: number;
  processingTime: number;
  errors: ParseError[];
}

export interface PatternMatch {
  type: SectionType;
  confidence: number;
  matchedText: string;
  matchedPatterns: string[];
  startIndex: number;
  endIndex: number;
}

export interface ParsingConfig {
  sensitivity: number; // 0-100, how strict the pattern matching is
  minConfidence: number; // minimum confidence to accept a section
  enableCustomPatterns: boolean;
}
