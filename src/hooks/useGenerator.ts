/**
 * POML Generator Hook - React integration for POML generation capabilities
 */

import { useState, useCallback } from 'react';
import { usePomlStore } from './usePoml';
import { TemplateEngine, type GenerationOptions, type GenerationResult } from '../generator/templateEngine';
import type { DetectedSection } from '../types';

interface UseGeneratorState {
  isGenerating: boolean;
  lastResult: GenerationResult | null;
  error: string | null;
}

interface UseGeneratorOptions {
  autoSave?: boolean;
  defaultOptions?: GenerationOptions;
}

export const useGenerator = (options: UseGeneratorOptions = {}) => {
  const { autoSave = true, defaultOptions = {} } = options;
  
  const [state, setState] = useState<UseGeneratorState>({
    isGenerating: false,
    lastResult: null,
    error: null
  });

  const { setGeneratedPoml } = usePomlStore();
  const templateEngine = new TemplateEngine();

  /**
   * Generate POML from detected sections
   */
  const generatePoml = useCallback(async (
    sections: DetectedSection[],
    generationOptions?: GenerationOptions
  ): Promise<GenerationResult> => {
    setState(prev => ({ ...prev, isGenerating: true, error: null }));

    try {
      const options = { ...defaultOptions, ...generationOptions };
      const result = await templateEngine.generatePoml(sections, options);

      setState(prev => ({ 
        ...prev, 
        isGenerating: false, 
        lastResult: result,
        error: null 
      }));

      // Auto-update the generated POML in the store
      if (autoSave && result.poml && !result.poml.includes('<error>')) {
        setGeneratedPoml(result.poml);
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Generation failed';
      
      setState(prev => ({ 
        ...prev, 
        isGenerating: false,
        error: errorMessage,
        lastResult: null
      }));

      // Return error result
      return {
        poml: `<prompt><error>${errorMessage}</error></prompt>`,
        components: [],
        metadata: {
          sectionsProcessed: 0,
          averageConfidence: 0,
          generationTime: 0,
          warnings: [errorMessage]
        }
      };
    }
  }, [templateEngine, defaultOptions, autoSave, setGeneratedPoml]);

  /**
   * Generate POML from a predefined template
   */
  const generateFromTemplate = useCallback(async (
    template: {
      id: string;
      structure: Array<{ 
        type: 'role' | 'task' | 'constraints' | 'examples' | 'outputFormat' | 'unknown';
        content: string; 
        attributes?: Record<string, string>; 
      }>;
    },
    generationOptions?: GenerationOptions
  ): Promise<GenerationResult> => {
    setState(prev => ({ ...prev, isGenerating: true, error: null }));

    try {
      const options = { ...defaultOptions, ...generationOptions };
      const result = await templateEngine.generateFromTemplate(template, options);

      setState(prev => ({ 
        ...prev, 
        isGenerating: false, 
        lastResult: result,
        error: null 
      }));

      // Auto-update the generated POML in the store
      if (autoSave && result.poml && !result.poml.includes('<error>')) {
        setGeneratedPoml(result.poml);
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Template generation failed';
      
      setState(prev => ({ 
        ...prev, 
        isGenerating: false,
        error: errorMessage,
        lastResult: null
      }));

      return {
        poml: `<prompt><error>${errorMessage}</error></prompt>`,
        components: [],
        metadata: {
          sectionsProcessed: 0,
          averageConfidence: 0,
          generationTime: 0,
          warnings: [errorMessage]
        }
      };
    }
  }, [templateEngine, defaultOptions, autoSave, setGeneratedPoml]);

  /**
   * Convert a single section to POML component (useful for previews)
   */
  const previewSection = useCallback((
    section: DetectedSection,
    options?: { includeConfidence?: boolean; includeComments?: boolean }
  ) => {
    try {
      const component = templateEngine.sectionToComponent(section, options);
      return {
        component,
        error: null
      };
    } catch (error) {
      return {
        component: null,
        error: error instanceof Error ? error.message : 'Preview failed'
      };
    }
  }, [templateEngine]);

  /**
   * Get predefined templates for common use cases
   */
  const getTemplates = useCallback(() => {
    return [
      {
        id: 'basic-assistant',
        name: 'Basic Assistant',
        description: 'Simple role-task structure for general assistance',
        structure: [
          { type: 'role' as const, content: 'You are a helpful AI assistant.' },
          { type: 'task' as const, content: 'Provide helpful and accurate responses to user questions.' },
          { type: 'constraints' as const, content: 'Be concise and clear in your responses. Always be respectful and professional.' }
        ]
      },
      {
        id: 'code-reviewer',
        name: 'Code Reviewer',
        description: 'Template for code review tasks',
        structure: [
          { type: 'role' as const, content: 'You are an experienced software engineer and code reviewer.' },
          { type: 'task' as const, content: 'Review the provided code and provide constructive feedback.' },
          { type: 'constraints' as const, content: 'Focus on code quality, best practices, potential bugs, and performance improvements. Be specific and actionable in your suggestions.' },
          { type: 'outputFormat' as const, content: 'Provide feedback in markdown format with clear sections for different types of issues.' }
        ]
      },
      {
        id: 'content-writer',
        name: 'Content Writer',
        description: 'Template for content creation tasks',
        structure: [
          { type: 'role' as const, content: 'You are a professional content writer with expertise in creating engaging and informative content.' },
          { type: 'task' as const, content: 'Create high-quality content based on the given topic and requirements.' },
          { type: 'constraints' as const, content: 'Ensure content is original, well-researched, and appropriate for the target audience. Follow SEO best practices when applicable.' },
          { type: 'examples' as const, content: 'Input: Blog post about sustainable living\nOutput: Well-structured article with introduction, main points, and conclusion' }
        ]
      }
    ];
  }, []);

  /**
   * Clear generation state
   */
  const clearState = useCallback(() => {
    setState({
      isGenerating: false,
      lastResult: null,
      error: null
    });
  }, []);

  /**
   * Get generation statistics
   */
  const getStats = useCallback(() => {
    return templateEngine.getGenerationStats();
  }, [templateEngine]);

  return {
    // State
    isGenerating: state.isGenerating,
    lastResult: state.lastResult,
    error: state.error,
    
    // Actions
    generatePoml,
    generateFromTemplate,
    previewSection,
    getTemplates,
    clearState,
    getStats,
    
    // Computed
    hasResult: !!state.lastResult,
    isSuccess: !!state.lastResult && !state.error,
    generatedPoml: state.lastResult?.poml || null,
    metadata: state.lastResult?.metadata || null
  };
};
