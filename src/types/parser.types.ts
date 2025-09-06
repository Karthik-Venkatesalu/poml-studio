export interface DetectedSection {
  id: string;
  type: 'role' | 'task' | 'constraints' | 'examples' | 'outputFormat' | 'unknown';
  content: string;
  confidence: number;
  startIndex: number;
  endIndex: number;
}

export interface ParseError {
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

export interface PatternMatch {
  pattern: RegExp;
  matches: Array<{
    text: string;
    index: number;
    length: number;
  }>;
  confidence: number;
}

export interface ParsingConfig {
  sensitivity: number; // 0-100, how strict the pattern matching is
  minConfidence: number; // minimum confidence to accept a section
  enableCustomPatterns: boolean;
}
