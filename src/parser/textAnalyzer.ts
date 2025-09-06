/**
 * Text Analysis Engine - Core NLP module for intelligent section detection
 * Implements pattern-based detection with confidence scoring for POML components
 */

import type { DetectedSection, SectionType, PatternMatch, AnalysisResult } from '../types';

// Import individual components
interface PatternMatcherInterface {
  matchPatterns(text: string): PatternMatch[];
  getPatternStats(): Record<SectionType, number>;
}

interface ConfidenceScorerInterface {
  scoreMatch(match: PatternMatch, context: string): number;
  getAverageConfidence(): number;
}

interface ContextAnalyzerInterface {
  analyzeContext(matches: any[], fullText: string): any[];
  analyzeWithContext(text: string, before: string, after: string, patterns: PatternMatch[]): any;
  learnFromFeedback(text: string, oldType: SectionType, newType: SectionType, wasCorrect: boolean): void;
  getTotalAnalyses(): number;
  getAverageProcessingTime(): number;
}

/**
 * Pattern Matcher - Implements regex-based pattern detection for different section types
 */
class PatternMatcher implements PatternMatcherInterface {
  private patterns = {
    role: [
      /you\s+are\s+(?:a|an)?\s*([^.!?]*)/gi,
      /act\s+as\s+(?:a|an)?\s*([^.!?]*)/gi,
      /assume\s+(?:the\s+)?role\s+of\s+(?:a|an)?\s*([^.!?]*)/gi,
      /as\s+(?:a|an)\s+([^,.\n]*)/gi,
      /take\s+on\s+the\s+persona\s+of\s*([^.!?]*)/gi,
      /your\s+role\s+is\s+(?:to\s+)?([^.!?]*)/gi,
      /you\s+will\s+be\s+acting\s+as\s*([^.!?]*)/gi
    ],
    task: [
      /(?:please\s+)?(analyze|create|generate|summarize|write|develop|design|build|implement|explain|describe|compare|evaluate|assess|review)\s+([^.!?]*)/gi,
      /your\s+task\s+is\s+to\s+([^.!?]*)/gi,
      /i\s+need\s+you\s+to\s+([^.!?]*)/gi,
      /(?:can\s+you\s+)?(?:help\s+me\s+)?([^.!?]*\b(?:analyze|create|generate|write|develop|design|build|implement)\b[^.!?]*)/gi,
      /complete\s+the\s+following\s+([^.!?]*)/gi
    ],
    constraints: [
      /(?:don't|do\s+not|avoid|never|must\s+not)\s+([^.!?]*)/gi,
      /within\s+(\d+)\s+(words?|characters?|sentences?|paragraphs?)/gi,
      /no\s+more\s+than\s+([^.!?]*)/gi,
      /maximum\s+of?\s+([^.!?]*)/gi,
      /(?:only\s+use|stick\s+to|ensure\s+that|make\s+sure)\s+([^.!?]*)/gi,
      /(?:requirements?|constraints?|limitations?|restrictions?):\s*([^.!?]*)/gi,
      /keep\s+it\s+(simple|brief|concise|short|under\s+\d+)/gi
    ],
    examples: [
      /(?:for\s+example|example|such\s+as|like|including)\s*:?\s*([^.!?]*)/gi,
      /(?:input|output|sample):\s*([^.!?]*)/gi,
      /(?:here's?\s+an?\s+example|consider\s+this\s+example)\s*:?\s*([^.!?]*)/gi,
      /example\s+\d+\s*:?\s*([^.!?]*)/gi,
      /(?:first|second|third)\s+example\s*:?\s*([^.!?]*)/gi
    ],
    outputFormat: [
      /(?:format|structure|output)\s+(?:should\s+be|as|in)\s+([^.!?]*)/gi,
      /(json|xml|csv|markdown|html|yaml|table)\s+format/gi,
      /respond\s+(?:with|in|using)\s+([^.!?]*)/gi,
      /(?:bullet\s+points|numbered\s+list|table\s+format)/gi,
      /(?:concise|detailed|step-by-step|structured)\s+(?:format|response)/gi,
      /present\s+(?:the\s+)?(?:results?|information|data)\s+(?:in|as|using)\s+([^.!?]*)/gi
    ]
  };

  private patternStats: Record<SectionType, number> = {
    role: 0,
    task: 0,
    constraints: 0,
    examples: 0,
    outputFormat: 0,
    unknown: 0
  };

  public matchPatterns(text: string): PatternMatch[] {
    const matches: PatternMatch[] = [];
    const lowerText = text.toLowerCase();

    Object.entries(this.patterns).forEach(([type, patterns]) => {
      const sectionType = type as SectionType;
      let bestMatch: RegExpMatchArray | null = null;
      let bestPattern = '';
      let maxScore = 0;

      patterns.forEach(pattern => {
        const match = lowerText.match(pattern);
        if (match) {
          const score = this.calculatePatternScore(match, lowerText);
          if (score > maxScore) {
            maxScore = score;
            bestMatch = match;
            bestPattern = pattern.toString();
          }
        }
      });

      if (bestMatch && maxScore > 0.3) {
        matches.push({
          type: sectionType,
          confidence: maxScore,
          matchedText: bestMatch[0],
          matchedPatterns: [bestPattern],
          startIndex: lowerText.indexOf(bestMatch[0]),
          endIndex: lowerText.indexOf(bestMatch[0]) + bestMatch[0].length
        });
        this.patternStats[sectionType]++;
      }
    });

    return matches.sort((a, b) => b.confidence - a.confidence);
  }

  private calculatePatternScore(match: RegExpMatchArray, text: string): number {
    if (!match) return 0;
    
    const matchLength = match[0].length;
    const textLength = text.length;
    const coverage = matchLength / textLength;
    
    // Base score from coverage
    let score = Math.min(coverage * 2, 0.8);
    
    // Bonus for common keywords
    const keywords = ['you are', 'analyze', 'create', 'don\'t', 'example', 'format'];
    const keywordBonus = keywords.some(keyword => 
      match[0].toLowerCase().includes(keyword)
    ) ? 0.2 : 0;
    
    return Math.min(score + keywordBonus, 1.0);
  }

  public getPatternStats(): Record<SectionType, number> {
    return { ...this.patternStats };
  }
}

/**
 * Confidence Scorer - Calculates confidence scores for pattern matches
 */
class ConfidenceScorer implements ConfidenceScorerInterface {
  private confidenceHistory: number[] = [];

  public scoreMatch(match: PatternMatch, context: string): number {
    let score = match.confidence;
    
    // Context bonuses
    const contextWords = context.toLowerCase().split(/\s+/);
    
    // Position bonus - sections at start/end often have higher confidence
    const position = match.startIndex / context.length;
    const positionBonus = (position < 0.3 || position > 0.7) ? 0.1 : 0;
    
    // Length bonus - longer matches often more reliable
    const lengthBonus = Math.min(match.matchedText.length / 50, 0.2);
    
    // Keyword density bonus
    const relevantKeywords = this.getRelevantKeywords(match.type);
    const keywordCount = relevantKeywords.filter(keyword => 
      context.toLowerCase().includes(keyword)
    ).length;
    const keywordBonus = Math.min(keywordCount * 0.05, 0.15);
    
    const finalScore = Math.min(score + positionBonus + lengthBonus + keywordBonus, 1.0);
    this.confidenceHistory.push(finalScore);
    
    return finalScore;
  }

  private getRelevantKeywords(type: SectionType): string[] {
    const keywords = {
      role: ['you', 'are', 'act', 'role', 'persona', 'character'],
      task: ['analyze', 'create', 'generate', 'write', 'develop', 'task', 'objective'],
      constraints: ['don\'t', 'avoid', 'never', 'must not', 'limit', 'restrict', 'constraint'],
      examples: ['example', 'for instance', 'such as', 'like', 'sample'],
      outputFormat: ['format', 'structure', 'json', 'xml', 'respond', 'present'],
      unknown: []
    };
    return keywords[type] || [];
  }

  public getAverageConfidence(): number {
    if (this.confidenceHistory.length === 0) return 0;
    const sum = this.confidenceHistory.reduce((a, b) => a + b, 0);
    return sum / this.confidenceHistory.length;
  }
}

/**
 * Context Analyzer - Provides context-aware analysis and disambiguation
 */
class ContextAnalyzer implements ContextAnalyzerInterface {
  private totalAnalyses = 0;
  private processingTimes: number[] = [];
  private feedbackData: Array<{
    text: string;
    oldType: SectionType;
    newType: SectionType;
    wasCorrect: boolean;
  }> = [];

  public analyzeContext(
    matches: Array<{
      block: { content: string; startIndex: number; endIndex: number };
      blockIndex: number;
      matches: PatternMatch[];
    }>,
    fullText: string
  ): Array<{
    block: { content: string; startIndex: number; endIndex: number };
    blockIndex: number;
    bestMatch: PatternMatch | null;
    confidence: number;
  }> {
    const startTime = performance.now();
    this.totalAnalyses++;

    const results = matches.map(match => {
      if (match.matches.length === 0) {
        return {
          ...match,
          bestMatch: null,
          confidence: 0
        };
      }

      // Find best match considering context
      let bestMatch = match.matches[0];
      let bestConfidence = this.calculateContextualConfidence(
        bestMatch,
        match.block.content,
        fullText,
        match.blockIndex
      );

      // Check other matches
      for (let i = 1; i < match.matches.length; i++) {
        const currentMatch = match.matches[i];
        const currentConfidence = this.calculateContextualConfidence(
          currentMatch,
          match.block.content,
          fullText,
          match.blockIndex
        );

        if (currentConfidence > bestConfidence) {
          bestMatch = currentMatch;
          bestConfidence = currentConfidence;
        }
      }

      return {
        ...match,
        bestMatch,
        confidence: bestConfidence
      };
    });

    const endTime = performance.now();
    this.processingTimes.push(endTime - startTime);

    return results;
  }

  private calculateContextualConfidence(
    match: PatternMatch,
    blockText: string,
    fullText: string,
    blockIndex: number
  ): number {
    let confidence = match.confidence;

    // Sequence bonus - role usually comes first, task second, etc.
    const sequenceBonus = this.getSequenceBonus(match.type, blockIndex);
    
    // Avoid conflicts - if multiple blocks have same type, reduce confidence
    const typeConflictPenalty = this.getTypeConflictPenalty(match.type, fullText);
    
    // Length appropriateness - some types should be longer/shorter
    const lengthBonus = this.getLengthBonus(match.type, blockText.length);

    return Math.max(0, Math.min(1, 
      confidence + sequenceBonus - typeConflictPenalty + lengthBonus
    ));
  }

  private getSequenceBonus(type: SectionType, blockIndex: number): number {
    const expectedOrder = ['role', 'task', 'constraints', 'examples', 'outputFormat'];
    const expectedIndex = expectedOrder.indexOf(type);
    
    if (expectedIndex === -1) return 0;
    
    const deviation = Math.abs(blockIndex - expectedIndex);
    return Math.max(0, 0.1 - (deviation * 0.02));
  }

  private getTypeConflictPenalty(type: SectionType, fullText: string): number {
    // Simple check - if type appears multiple times in analysis, reduce confidence
    const typeOccurrences = (fullText.match(new RegExp(`\\b${type}\\b`, 'gi')) || []).length;
    return typeOccurrences > 1 ? 0.05 * (typeOccurrences - 1) : 0;
  }

  private getLengthBonus(type: SectionType, length: number): number {
    const optimalLengths = {
      role: { min: 20, max: 100 },
      task: { min: 30, max: 200 },
      constraints: { min: 20, max: 150 },
      examples: { min: 40, max: 300 },
      outputFormat: { min: 15, max: 80 },
      unknown: { min: 0, max: Infinity }
    };

    const optimal = optimalLengths[type];
    if (length >= optimal.min && length <= optimal.max) {
      return 0.05;
    }
    return 0;
  }

  public analyzeWithContext(
    text: string,
    before: string,
    after: string,
    patterns: PatternMatch[]
  ): {
    suggestedType: SectionType | null;
    confidence: number;
    matchedPatterns: string[];
  } {
    if (patterns.length === 0) {
      return {
        suggestedType: null,
        confidence: 0,
        matchedPatterns: []
      };
    }

    const bestPattern = patterns[0];
    const enhancedConfidence = this.calculateContextualConfidence(
      bestPattern,
      text,
      before + text + after,
      0
    );

    return {
      suggestedType: bestPattern.type,
      confidence: enhancedConfidence,
      matchedPatterns: bestPattern.matchedPatterns
    };
  }

  public learnFromFeedback(
    text: string,
    oldType: SectionType,
    newType: SectionType,
    wasCorrect: boolean
  ): void {
    this.feedbackData.push({
      text,
      oldType,
      newType,
      wasCorrect
    });

    // Simple learning - could be enhanced with ML in the future
    console.log(`Learning from feedback: ${oldType} -> ${newType} (correct: ${wasCorrect})`);
  }

  public getTotalAnalyses(): number {
    return this.totalAnalyses;
  }

  public getAverageProcessingTime(): number {
    if (this.processingTimes.length === 0) return 0;
    const sum = this.processingTimes.reduce((a, b) => a + b, 0);
    return sum / this.processingTimes.length;
  }
}

/**
 * Main TextAnalyzer class that orchestrates the analysis process
 */
export class TextAnalyzer {
  private patternMatcher: PatternMatcherInterface;
  private confidenceScorer: ConfidenceScorerInterface;
  private contextAnalyzer: ContextAnalyzerInterface;

  constructor() {
    this.patternMatcher = new PatternMatcher();
    this.confidenceScorer = new ConfidenceScorer();
    this.contextAnalyzer = new ContextAnalyzer();
  }

  /**
   * Main analysis function that processes text and detects POML sections
   */
  public async analyzeText(text: string): Promise<AnalysisResult> {
    if (!text.trim()) {
      return {
        sections: [],
        confidence: 0,
        processingTime: 0,
        errors: []
      };
    }

    const startTime = performance.now();
    
    try {
      // Step 1: Split text into logical blocks
      const blocks = this.splitIntoBlocks(text);
      
      // Step 2: Apply pattern matching to each block
      const patternMatches = blocks.map((block, index) => ({
        block,
        blockIndex: index,
        matches: this.patternMatcher.matchPatterns(block.content)
      }));

      // Step 3: Apply context analysis for disambiguation
      const contextualMatches = this.contextAnalyzer.analyzeContext(patternMatches, text);

      // Step 4: Generate detected sections with confidence scores
      const sections = this.generateDetectedSections(contextualMatches);

      // Step 5: Calculate overall confidence
      const overallConfidence = this.calculateOverallConfidence(sections);

      const endTime = performance.now();

      return {
        sections,
        confidence: overallConfidence,
        processingTime: endTime - startTime,
        errors: []
      };

    } catch (error) {
      const endTime = performance.now();
      return {
        sections: [],
        confidence: 0,
        processingTime: endTime - startTime,
        errors: [{
          type: 'analysis_error',
          message: error instanceof Error ? error.message : 'Unknown analysis error',
          severity: 'error'
        }]
      };
    }
  }

  /**
   * Split text into logical blocks for analysis
   */
  private splitIntoBlocks(text: string): Array<{ content: string; startIndex: number; endIndex: number }> {
    const blocks: Array<{ content: string; startIndex: number; endIndex: number }> = [];
    
    // Split by double newlines (paragraph breaks)
    const paragraphs = text.split(/\n\s*\n/);
    let currentIndex = 0;

    paragraphs.forEach(paragraph => {
      const trimmed = paragraph.trim();
      if (trimmed) {
        const startIndex = text.indexOf(trimmed, currentIndex);
        const endIndex = startIndex + trimmed.length;
        
        blocks.push({
          content: trimmed,
          startIndex,
          endIndex
        });
        
        currentIndex = endIndex;
      }
    });

    // If no paragraph breaks found, split by sentences
    if (blocks.length <= 1 && text.length > 100) {
      return this.splitBySentences(text);
    }

    return blocks;
  }

  /**
   * Fallback method to split text by sentences
   */
  private splitBySentences(text: string): Array<{ content: string; startIndex: number; endIndex: number }> {
    const sentences = text.split(/[.!?]+\s+/);
    const blocks: Array<{ content: string; startIndex: number; endIndex: number }> = [];
    let currentIndex = 0;

    sentences.forEach(sentence => {
      const trimmed = sentence.trim();
      if (trimmed) {
        const startIndex = text.indexOf(trimmed, currentIndex);
        const endIndex = startIndex + trimmed.length;
        
        blocks.push({
          content: trimmed,
          startIndex,
          endIndex
        });
        
        currentIndex = endIndex;
      }
    });

    return blocks;
  }

  /**
   * Generate DetectedSection objects from contextual matches
   */
  private generateDetectedSections(
    contextualMatches: Array<{
      block: { content: string; startIndex: number; endIndex: number };
      blockIndex: number;
      bestMatch: PatternMatch | null;
      confidence: number;
    }>
  ): DetectedSection[] {
    return contextualMatches
      .filter(match => match.bestMatch)
      .map((match, index) => ({
        id: `section-${index}`,
        type: match.bestMatch!.type,
        content: match.block.content,
        confidence: Math.round(match.confidence * 100),
        startIndex: match.block.startIndex,
        endIndex: match.block.endIndex,
        patterns: match.bestMatch!.matchedPatterns,
        metadata: {
          blockIndex: match.blockIndex,
          rawConfidence: match.confidence
        }
      }));
  }

  /**
   * Calculate overall confidence score for the analysis
   */
  private calculateOverallConfidence(sections: DetectedSection[]): number {
    if (sections.length === 0) return 0;
    
    const totalConfidence = sections.reduce((sum, section) => sum + section.confidence, 0);
    const averageConfidence = totalConfidence / sections.length;
    
    // Apply bonus for having diverse section types
    const uniqueTypes = new Set(sections.map(s => s.type));
    const diversityBonus = Math.min(uniqueTypes.size * 5, 20);
    
    return Math.min(Math.round(averageConfidence + diversityBonus), 100);
  }

  /**
   * Re-analyze specific section with updated context
   */
  public async reanalyzeSectionWithContext(
    section: DetectedSection,
    fullText: string,
    userFeedback?: { correctedType: SectionType; wasCorrect: boolean }
  ): Promise<DetectedSection> {
    const sectionText = fullText.substring(section.startIndex, section.endIndex);
    const contextBefore = fullText.substring(Math.max(0, section.startIndex - 200), section.startIndex);
    const contextAfter = fullText.substring(section.endIndex, Math.min(fullText.length, section.endIndex + 200));

    // Re-run pattern matching with enhanced context
    const patterns = this.patternMatcher.matchPatterns(sectionText);
    const contextualAnalysis = this.contextAnalyzer.analyzeWithContext(
      sectionText,
      contextBefore,
      contextAfter,
      patterns
    );

    // Apply user feedback if provided
    if (userFeedback) {
      this.contextAnalyzer.learnFromFeedback(
        sectionText,
        section.type,
        userFeedback.correctedType,
        userFeedback.wasCorrect
      );
    }

    return {
      ...section,
      type: contextualAnalysis.suggestedType || section.type,
      confidence: Math.round(contextualAnalysis.confidence * 100),
      patterns: contextualAnalysis.matchedPatterns,
      metadata: {
        ...section.metadata,
        reanalyzed: true,
        previousType: section.type
      }
    };
  }

  /**
   * Get analysis statistics for debugging and optimization
   */
  public getAnalysisStats(): {
    patternCounts: Record<SectionType, number>;
    averageConfidence: number;
    processingStats: {
      totalAnalyses: number;
      averageProcessingTime: number;
    };
  } {
    return {
      patternCounts: this.patternMatcher.getPatternStats(),
      averageConfidence: this.confidenceScorer.getAverageConfidence(),
      processingStats: {
        totalAnalyses: this.contextAnalyzer.getTotalAnalyses(),
        averageProcessingTime: this.contextAnalyzer.getAverageProcessingTime()
      }
    };
  }
}

// Create singleton instance for backward compatibility
export const textAnalyzer = new TextAnalyzer();
