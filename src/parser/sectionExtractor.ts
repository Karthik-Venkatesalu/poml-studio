/**
 * Section Extractor - Extracts and processes detected sections from analyzed text
 * Handles block identification, context preservation, and overlap resolution
 */

import type { DetectedSection, SectionType } from '../types';
import { TextAnalyzer } from './textAnalyzer';

export interface SectionExtractionOptions {
  minConfidenceThreshold?: number;
  resolveOverlaps?: boolean;
  preserveContext?: boolean;
  maxSectionsPerType?: number;
}

export class SectionExtractor {
  private textAnalyzer: TextAnalyzer;

  constructor() {
    this.textAnalyzer = new TextAnalyzer();
  }

  /**
   * Extract sections from text with specified options
   */
  public async extractSections(
    text: string, 
    options: SectionExtractionOptions = {}
  ): Promise<{
    sections: DetectedSection[];
    metadata: {
      totalBlocks: number;
      processedBlocks: number;
      overlapsResolved: number;
      averageConfidence: number;
    };
  }> {
    const {
      minConfidenceThreshold = 30,
      resolveOverlaps = true,
      preserveContext = true,
      maxSectionsPerType = 3
    } = options;

    // Get initial analysis
    const analysisResult = await this.textAnalyzer.analyzeText(text);
    
    // Filter by confidence threshold
    let sections = analysisResult.sections.filter(
      section => section.confidence >= minConfidenceThreshold
    );

    // Preserve context by expanding section boundaries
    if (preserveContext) {
      sections = this.expandSectionBoundaries(sections, text);
    }

    // Resolve overlapping sections
    let overlapsResolved = 0;
    if (resolveOverlaps) {
      const resolved = this.resolveOverlappingSections(sections);
      sections = resolved.sections;
      overlapsResolved = resolved.overlapsResolved;
    }

    // Limit sections per type
    sections = this.limitSectionsPerType(sections, maxSectionsPerType);

    // Sort by position in text
    sections.sort((a, b) => a.startIndex - b.startIndex);

    const totalBlocks = this.countTextBlocks(text);
    const averageConfidence = sections.length > 0 
      ? sections.reduce((sum, s) => sum + s.confidence, 0) / sections.length 
      : 0;

    return {
      sections,
      metadata: {
        totalBlocks,
        processedBlocks: sections.length,
        overlapsResolved,
        averageConfidence: Math.round(averageConfidence)
      }
    };
  }

  /**
   * Extract sections of a specific type only
   */
  public async extractSectionsByType(
    text: string,
    targetType: SectionType,
    options: SectionExtractionOptions = {}
  ): Promise<DetectedSection[]> {
    const result = await this.extractSections(text, options);
    return result.sections.filter(section => section.type === targetType);
  }

  /**
   * Extract sections with manual patterns for custom detection
   */
  public async extractWithCustomPatterns(
    text: string,
    customPatterns: Record<string, RegExp[]>,
    options: SectionExtractionOptions = {}
  ): Promise<DetectedSection[]> {
    const standardResult = await this.extractSections(text, options);
    const customSections: DetectedSection[] = [];

    // Apply custom patterns
    Object.entries(customPatterns).forEach(([type, patterns]) => {
      patterns.forEach((pattern, index) => {
        const matches = Array.from(text.matchAll(new RegExp(pattern, 'gi')));
        matches.forEach((match, matchIndex) => {
          if (match.index !== undefined) {
            customSections.push({
              id: `custom-${type}-${index}-${matchIndex}`,
              type: type as SectionType,
              content: match[0],
              confidence: 75, // Custom patterns get medium confidence
              startIndex: match.index,
              endIndex: match.index + match[0].length,
              patterns: [pattern.toString()],
              metadata: {
                isCustomPattern: true,
                patternIndex: index
              }
            });
          }
        });
      });
    });

    // Combine and deduplicate
    const allSections = [...standardResult.sections, ...customSections];
    return this.deduplicateSections(allSections);
  }

  /**
   * Expand section boundaries to include relevant context
   */
  private expandSectionBoundaries(sections: DetectedSection[], text: string): DetectedSection[] {
    return sections.map(section => {
      const words = text.substring(section.startIndex, section.endIndex).split(/\s+/);
      
      // Expand to sentence boundaries
      let newStart = section.startIndex;
      let newEnd = section.endIndex;

      // Look backwards for sentence start
      while (newStart > 0 && !/[.!?]\s+/.test(text.charAt(newStart - 1))) {
        newStart--;
      }

      // Look forward for sentence end
      while (newEnd < text.length && !/[.!?]\s+/.test(text.charAt(newEnd))) {
        newEnd++;
      }

      // Don't expand too much (max 50% increase)
      const originalLength = section.endIndex - section.startIndex;
      const maxExpansion = originalLength * 0.5;
      
      newStart = Math.max(newStart, section.startIndex - maxExpansion);
      newEnd = Math.min(newEnd, section.endIndex + maxExpansion);

      return {
        ...section,
        content: text.substring(newStart, newEnd).trim(),
        startIndex: newStart,
        endIndex: newEnd,
        metadata: {
          ...section.metadata,
          expandedBoundaries: true,
          originalStart: section.startIndex,
          originalEnd: section.endIndex
        }
      };
    });
  }

  /**
   * Resolve overlapping sections by choosing the best one or merging
   */
  private resolveOverlappingSections(sections: DetectedSection[]): {
    sections: DetectedSection[];
    overlapsResolved: number;
  } {
    const resolved: DetectedSection[] = [];
    let overlapsResolved = 0;

    // Sort by start index
    const sortedSections = [...sections].sort((a, b) => a.startIndex - b.startIndex);

    for (let i = 0; i < sortedSections.length; i++) {
      const current = sortedSections[i];
      let hasOverlap = false;

      // Check for overlaps with already resolved sections
      for (let j = 0; j < resolved.length; j++) {
        const existing = resolved[j];
        
        if (this.sectionsOverlap(current, existing)) {
          hasOverlap = true;
          overlapsResolved++;

          // Choose the section with higher confidence
          if (current.confidence > existing.confidence) {
            resolved[j] = current;
          }
          // If same type and similar confidence, merge them
          else if (current.type === existing.type && 
                   Math.abs(current.confidence - existing.confidence) < 10) {
            resolved[j] = this.mergeSections(current, existing);
          }
          break;
        }
      }

      if (!hasOverlap) {
        resolved.push(current);
      }
    }

    return { sections: resolved, overlapsResolved };
  }

  /**
   * Check if two sections overlap
   */
  private sectionsOverlap(section1: DetectedSection, section2: DetectedSection): boolean {
    return !(section1.endIndex <= section2.startIndex || section2.endIndex <= section1.startIndex);
  }

  /**
   * Merge two overlapping sections
   */
  private mergeSections(section1: DetectedSection, section2: DetectedSection): DetectedSection {
    const startIndex = Math.min(section1.startIndex, section2.startIndex);
    const endIndex = Math.max(section1.endIndex, section2.endIndex);
    const averageConfidence = Math.round((section1.confidence + section2.confidence) / 2);

    return {
      id: `${section1.id}-merged-${section2.id}`,
      type: section1.confidence > section2.confidence ? section1.type : section2.type,
      content: section1.content + ' ' + section2.content,
      confidence: averageConfidence,
      startIndex,
      endIndex,
      patterns: [...section1.patterns, ...section2.patterns],
      metadata: {
        mergedSections: [section1.id, section2.id],
        mergedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Limit the number of sections per type
   */
  private limitSectionsPerType(sections: DetectedSection[], maxPerType: number): DetectedSection[] {
    const sectionsByType: Record<string, DetectedSection[]> = {};
    
    // Group by type
    sections.forEach(section => {
      if (!sectionsByType[section.type]) {
        sectionsByType[section.type] = [];
      }
      sectionsByType[section.type].push(section);
    });

    // Limit each type and take the highest confidence ones
    const limitedSections: DetectedSection[] = [];
    Object.values(sectionsByType).forEach(typeSections => {
      const sorted = typeSections.sort((a, b) => b.confidence - a.confidence);
      limitedSections.push(...sorted.slice(0, maxPerType));
    });

    return limitedSections;
  }

  /**
   * Remove duplicate sections based on content similarity
   */
  private deduplicateSections(sections: DetectedSection[]): DetectedSection[] {
    const deduplicated: DetectedSection[] = [];
    
    for (const section of sections) {
      const isDuplicate = deduplicated.some(existing => 
        this.calculateContentSimilarity(section.content, existing.content) > 0.8
      );
      
      if (!isDuplicate) {
        deduplicated.push(section);
      }
    }
    
    return deduplicated;
  }

  /**
   * Calculate content similarity between two strings
   */
  private calculateContentSimilarity(text1: string, text2: string): number {
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);
    
    const commonWords = words1.filter(word => words2.includes(word));
    const totalWords = Math.max(words1.length, words2.length);
    
    return totalWords > 0 ? commonWords.length / totalWords : 0;
  }

  /**
   * Count the number of logical blocks in text
   */
  private countTextBlocks(text: string): number {
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
    if (paragraphs.length > 1) return paragraphs.length;
    
    const sentences = text.split(/[.!?]+\s+/).filter(s => s.trim());
    return sentences.length;
  }

  /**
   * Get extraction statistics
   */
  public getExtractionStats(): {
    totalExtractions: number;
    averageSectionsPerExtraction: number;
    typeDistribution: Record<SectionType, number>;
  } {
    // This would be implemented with actual tracking in a production system
    return {
      totalExtractions: 0,
      averageSectionsPerExtraction: 0,
      typeDistribution: {
        role: 0,
        task: 0,
        constraints: 0,
        examples: 0,
        outputFormat: 0,
        unknown: 0
      }
    };
  }
}

// Create singleton instance for backward compatibility
export const sectionExtractor = new SectionExtractor();
