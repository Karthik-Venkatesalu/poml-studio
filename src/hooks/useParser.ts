/**
 * Parser Hook - Integrates the Text Analysis Engine with React components
 * Provides easy-to-use functions for text analysis and section detection
 */

import { useCallback, useState } from 'react';
import { TextAnalyzer, SectionExtractor } from '../parser';
import type { DetectedSection, AnalysisResult, SectionType } from '../types';
import { usePomlStore } from './usePoml';

export interface UseParserReturn {
  // State
  isAnalyzing: boolean;
  lastAnalysis: AnalysisResult | null;
  analysisStats: {
    totalAnalyses: number;
    averageProcessingTime: number;
    averageConfidence: number;
  };

  // Actions
  analyzeText: (text: string) => Promise<DetectedSection[]>;
  reanalyzeSection: (section: DetectedSection, feedback?: { correctedType: SectionType; wasCorrect: boolean }) => Promise<DetectedSection>;
  extractSectionsByType: (text: string, type: SectionType) => Promise<DetectedSection[]>;
  getAnalysisStats: () => void;
}

/**
 * Hook for text analysis and parsing functionality
 */
export const useParser = (): UseParserReturn => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<AnalysisResult | null>(null);
  const [analysisStats, setAnalysisStats] = useState({
    totalAnalyses: 0,
    averageProcessingTime: 0,
    averageConfidence: 0
  });

  const { 
    setDetectedSections, 
    setProcessing, 
    setParsingErrors,
    inputText 
  } = usePomlStore();

  // Initialize analyzers
  const textAnalyzer = new TextAnalyzer();
  const sectionExtractor = new SectionExtractor();

  /**
   * Analyze text and detect sections
   */
  const analyzeText = useCallback(async (text: string): Promise<DetectedSection[]> => {
    if (!text.trim()) {
      setDetectedSections([]);
      return [];
    }

    setIsAnalyzing(true);
    setProcessing(true);

    try {
      // Perform analysis
      const result = await textAnalyzer.analyzeText(text);
      
      // Update state
      setLastAnalysis(result);
      setDetectedSections(result.sections);
      setParsingErrors(result.errors);

      // Update stats
      const stats = textAnalyzer.getAnalysisStats();
      setAnalysisStats({
        totalAnalyses: stats.processingStats.totalAnalyses,
        averageProcessingTime: stats.processingStats.averageProcessingTime,
        averageConfidence: stats.averageConfidence
      });

      console.log(`Analysis completed in ${result.processingTime.toFixed(2)}ms`);
      console.log(`Detected ${result.sections.length} sections with ${result.confidence}% confidence`);

      return result.sections;
    } catch (error) {
      console.error('Text analysis failed:', error);
      setParsingErrors([{
        type: 'analysis_error',
        message: error instanceof Error ? error.message : 'Unknown analysis error',
        severity: 'error'
      }]);
      return [];
    } finally {
      setIsAnalyzing(false);
      setProcessing(false);
    }
  }, [textAnalyzer, setDetectedSections, setProcessing, setParsingErrors]);

  /**
   * Re-analyze a specific section with user feedback
   */
  const reanalyzeSection = useCallback(async (
    section: DetectedSection, 
    feedback?: { correctedType: SectionType; wasCorrect: boolean }
  ): Promise<DetectedSection> => {
    try {
      const updatedSection = await textAnalyzer.reanalyzeSectionWithContext(
        section, 
        inputText, 
        feedback
      );

      // Update the section in the store
      const currentSections = usePomlStore.getState().detectedSections;
      const updatedSections = currentSections.map(s => 
        s.id === section.id ? updatedSection : s
      );
      setDetectedSections(updatedSections);

      console.log(`Section ${section.id} reanalyzed: ${section.type} -> ${updatedSection.type}`);
      
      return updatedSection;
    } catch (error) {
      console.error('Section reanalysis failed:', error);
      return section; // Return original section if reanalysis fails
    }
  }, [textAnalyzer, inputText, setDetectedSections]);

  /**
   * Extract sections of a specific type
   */
  const extractSectionsByType = useCallback(async (
    text: string, 
    type: SectionType
  ): Promise<DetectedSection[]> => {
    try {
      const sections = await sectionExtractor.extractSectionsByType(text, type);
      console.log(`Found ${sections.length} sections of type: ${type}`);
      return sections;
    } catch (error) {
      console.error(`Failed to extract sections of type ${type}:`, error);
      return [];
    }
  }, [sectionExtractor]);

  /**
   * Get current analysis statistics
   */
  const getAnalysisStats = useCallback(() => {
    const stats = textAnalyzer.getAnalysisStats();
    setAnalysisStats({
      totalAnalyses: stats.processingStats.totalAnalyses,
      averageProcessingTime: stats.processingStats.averageProcessingTime,
      averageConfidence: stats.averageConfidence
    });
  }, [textAnalyzer]);

  return {
    isAnalyzing,
    lastAnalysis,
    analysisStats,
    analyzeText,
    reanalyzeSection,
    extractSectionsByType,
    getAnalysisStats
  };
};

/**
 * Hook for advanced parsing features
 */
export const useAdvancedParser = () => {
  const parser = useParser();
  const sectionExtractor = new SectionExtractor();

  /**
   * Analyze text with custom extraction options
   */
  const analyzeWithOptions = useCallback(async (
    text: string,
    options: {
      minConfidence?: number;
      resolveOverlaps?: boolean;
      maxSectionsPerType?: number;
    }
  ) => {
    const result = await sectionExtractor.extractSections(text, options);
    return result;
  }, [sectionExtractor]);

  /**
   * Extract sections with custom patterns
   */
  const extractWithCustomPatterns = useCallback(async (
    text: string,
    customPatterns: Record<string, RegExp[]>
  ) => {
    const sections = await sectionExtractor.extractWithCustomPatterns(text, customPatterns);
    return sections;
  }, [sectionExtractor]);

  return {
    ...parser,
    analyzeWithOptions,
    extractWithCustomPatterns
  };
};

export default useParser;
