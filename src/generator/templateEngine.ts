/**
 * Template Engine - Converts detected sections to POML components
 * Implements intelligent component mapping and nested structure generation
 */

import type { DetectedSection, SectionType } from '../types';
import { PomlFormatter } from './pomlFormatter';
import { escapeXml } from '../utils/helpers';

export interface PomlComponent {
  tag: string;
  attributes?: Record<string, string>;
  content: string | PomlComponent[];
}

export interface GenerationOptions {
  includeComments?: boolean;
  includeConfidence?: boolean;
  formatOutput?: boolean;
  rootElement?: string;
  includeMetadata?: boolean;
}

export interface GenerationResult {
  poml: string;
  components: PomlComponent[];
  metadata: {
    sectionsProcessed: number;
    averageConfidence: number;
    generationTime: number;
    warnings: string[];
  };
}

export class TemplateEngine {
  private formatter: PomlFormatter;
  private componentMappings: Record<SectionType, (section: DetectedSection) => PomlComponent>;

  constructor() {
    this.formatter = new PomlFormatter();
    this.componentMappings = this.initializeComponentMappings();
  }

  /**
   * Generate POML from detected sections
   */
  public async generatePoml(
    sections: DetectedSection[], 
    options: GenerationOptions = {}
  ): Promise<GenerationResult> {
    const startTime = performance.now();
    const {
      includeComments = false,
      includeConfidence = false,
      formatOutput = true,
      rootElement = 'prompt',
      includeMetadata = false
    } = options;

    const warnings: string[] = [];
    
    try {
      // Filter and sort sections
      const validSections = this.filterAndSortSections(sections, warnings);
      
      // Convert sections to POML components
      const components = validSections.map(section => 
        this.sectionToComponent(section, { includeConfidence, includeComments })
      );

      // Create root component
      const rootComponent: PomlComponent = {
        tag: rootElement,
        content: components
      };

      // Add metadata if requested
      if (includeMetadata) {
        rootComponent.attributes = {
          generated: new Date().toISOString(),
          sections: sections.length.toString(),
          confidence: Math.round(this.calculateAverageConfidence(sections)).toString()
        };
      }

      // Format output
      const poml = formatOutput 
        ? this.formatter.format([rootComponent])
        : this.formatter.formatMinified([rootComponent]);

      const endTime = performance.now();
      const averageConfidence = this.calculateAverageConfidence(sections);

      return {
        poml,
        components,
        metadata: {
          sectionsProcessed: validSections.length,
          averageConfidence,
          generationTime: endTime - startTime,
          warnings
        }
      };

    } catch (error) {
      const endTime = performance.now();
      
      return {
        poml: this.generateErrorPoml(error instanceof Error ? error.message : 'Unknown error'),
        components: [],
        metadata: {
          sectionsProcessed: 0,
          averageConfidence: 0,
          generationTime: endTime - startTime,
          warnings: [`Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
        }
      };
    }
  }

  /**
   * Convert a single section to POML component
   */
  public sectionToComponent(
    section: DetectedSection, 
    options: { includeConfidence?: boolean; includeComments?: boolean } = {}
  ): PomlComponent {
    const mapper = this.componentMappings[section.type];
    if (!mapper) {
      // Fallback for unknown sections
      return this.createGenericComponent(section);
    }

    const component = mapper(section);
    
    // Add confidence attribute if requested
    if (options.includeConfidence && section.confidence < 100) {
      component.attributes = {
        ...component.attributes,
        confidence: section.confidence.toString()
      };
    }

    return component;
  }

  /**
   * Generate POML from a template structure
   */
  public async generateFromTemplate(
    template: {
      id: string;
      structure: Array<{ type: SectionType; content: string; attributes?: Record<string, string> }>;
    },
    options: GenerationOptions = {}
  ): Promise<GenerationResult> {
    // Convert template structure to detected sections
    const sections: DetectedSection[] = template.structure.map((item, index) => ({
      id: `template-${index}`,
      type: item.type,
      content: item.content,
      confidence: 100, // Templates have full confidence
      startIndex: 0,
      endIndex: item.content.length,
      metadata: {
        fromTemplate: true,
        templateId: template.id,
        customAttributes: item.attributes
      }
    }));

    return this.generatePoml(sections, options);
  }

  /**
   * Initialize component mapping functions
   */
  private initializeComponentMappings(): Record<SectionType, (section: DetectedSection) => PomlComponent> {
    return {
      role: (section) => this.createRoleComponent(section),
      task: (section) => this.createTaskComponent(section),
      constraints: (section) => this.createConstraintsComponent(section),
      examples: (section) => this.createExamplesComponent(section),
      outputFormat: (section) => this.createOutputFormatComponent(section),
      unknown: (section) => this.createGenericComponent(section)
    };
  }

  /**
   * Create role component
   */
  private createRoleComponent(section: DetectedSection): PomlComponent {
    return {
      tag: 'role',
      content: this.cleanContent(section.content)
    };
  }

  /**
   * Create task component
   */
  private createTaskComponent(section: DetectedSection): PomlComponent {
    return {
      tag: 'task',
      content: this.cleanContent(section.content)
    };
  }

  /**
   * Create constraints component
   */
  private createConstraintsComponent(section: DetectedSection): PomlComponent {
    const content = this.cleanContent(section.content);
    
    // Try to detect if constraints are in list form
    const listItems = this.extractListItems(content);
    
    if (listItems.length > 1) {
      return {
        tag: 'cp',
        attributes: { caption: 'Constraints' },
        content: [{
          tag: 'list',
          content: listItems.map(item => ({
            tag: 'item',
            content: item.trim()
          }))
        }]
      };
    } else {
      return {
        tag: 'cp',
        attributes: { caption: 'Constraints' },
        content: content
      };
    }
  }

  /**
   * Create examples component
   */
  private createExamplesComponent(section: DetectedSection): PomlComponent {
    const content = this.cleanContent(section.content);
    
    // Try to detect input/output patterns
    const examples = this.extractInputOutputExamples(content);
    
    if (examples.length > 0) {
      return {
        tag: 'examples',
        content: examples.map(example => ({
          tag: 'example',
          content: [
            { tag: 'input', content: example.input },
            { tag: 'output', content: example.output }
          ]
        }))
      };
    } else {
      // Simple example without input/output structure
      return {
        tag: 'examples',
        content: [{
          tag: 'example',
          content: content
        }]
      };
    }
  }

  /**
   * Create output format component
   */
  private createOutputFormatComponent(section: DetectedSection): PomlComponent {
    const content = this.cleanContent(section.content);
    const attributes: Record<string, string> = {};
    
    // Detect syntax/format type
    const formatType = this.detectFormatType(content);
    if (formatType) {
      attributes.syntax = formatType;
    }
    
    return {
      tag: 'output-format',
      attributes: Object.keys(attributes).length > 0 ? attributes : undefined,
      content
    };
  }

  /**
   * Create generic component for unknown types
   */
  private createGenericComponent(section: DetectedSection): PomlComponent {
    const attributes: Record<string, string> = {};
    
    if (section.type === 'unknown') {
      attributes.type = 'unclassified';
    }
    
    return {
      tag: 'p',
      attributes: Object.keys(attributes).length > 0 ? attributes : undefined,
      content: this.cleanContent(section.content)
    };
  }

  /**
   * Filter and sort sections for optimal POML structure
   */
  private filterAndSortSections(sections: DetectedSection[], warnings: string[]): DetectedSection[] {
    // Remove very low confidence sections
    const filtered = sections.filter(section => {
      if (section.confidence < 20) {
        warnings.push(`Skipped low-confidence section: ${section.type} (${section.confidence}%)`);
        return false;
      }
      return true;
    });

    // Sort by optimal order: role, task, constraints, examples, outputFormat, unknown
    const order: Record<SectionType, number> = {
      role: 1,
      task: 2,
      constraints: 3,
      examples: 4,
      outputFormat: 5,
      unknown: 6
    };

    return filtered.sort((a, b) => {
      const orderA = order[a.type] || 999;
      const orderB = order[b.type] || 999;
      if (orderA !== orderB) return orderA - orderB;
      
      // If same type, sort by position in original text
      return a.startIndex - b.startIndex;
    });
  }

  /**
   * Clean and normalize content
   */
  private cleanContent(content: string): string {
    return content
      .trim()
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/^(you are|act as|your task is|please|don't|for example|respond in)\s*/gi, '') // Remove common prefixes
      .trim();
  }

  /**
   * Extract list items from text
   */
  private extractListItems(text: string): string[] {
    // Look for bullet points, numbers, or line breaks
    const patterns = [
      /^[-*•]\s*(.+)$/gm,  // Bullet points
      /^\d+\.\s*(.+)$/gm,  // Numbered lists
      /^-\s*(.+)$/gm       // Dashes
    ];

    for (const pattern of patterns) {
      const matches = Array.from(text.matchAll(pattern));
      if (matches.length > 1) {
        return matches.map(match => match[1]);
      }
    }

    // Fallback: split by common separators
    const separators = ['\n', ';', ','];
    for (const separator of separators) {
      const items = text.split(separator).filter(item => item.trim().length > 10);
      if (items.length > 1) {
        return items;
      }
    }

    return [text]; // Return as single item if no list detected
  }

  /**
   * Extract input/output example pairs
   */
  private extractInputOutputExamples(text: string): Array<{ input: string; output: string }> {
    const examples: Array<{ input: string; output: string }> = [];
    
    // Pattern 1: Input: ... Output: ...
    const ioPattern = /input:\s*([^]*?)(?=output:|$)\s*output:\s*([^]*?)(?=input:|$)/gi;
    let match;
    while ((match = ioPattern.exec(text)) !== null) {
      examples.push({
        input: match[1].trim(),
        output: match[2].trim()
      });
    }

    // Pattern 2: Q: ... A: ...
    if (examples.length === 0) {
      const qaPattern = /q:\s*([^]*?)(?=a:|$)\s*a:\s*([^]*?)(?=q:|$)/gi;
      while ((match = qaPattern.exec(text)) !== null) {
        examples.push({
          input: match[1].trim(),
          output: match[2].trim()
        });
      }
    }

    return examples;
  }

  /**
   * Detect format type from content
   */
  private detectFormatType(content: string): string | null {
    const lowerContent = content.toLowerCase();
    
    const formats = [
      { keywords: ['json', 'javascript object notation'], type: 'json' },
      { keywords: ['xml', 'markup'], type: 'xml' },
      { keywords: ['markdown', 'md'], type: 'markdown' },
      { keywords: ['html'], type: 'html' },
      { keywords: ['csv', 'comma separated'], type: 'csv' },
      { keywords: ['yaml', 'yml'], type: 'yaml' },
      { keywords: ['table', 'tabular'], type: 'table' },
      { keywords: ['bullet points', 'bullets'], type: 'list' }
    ];

    for (const format of formats) {
      if (format.keywords.some(keyword => lowerContent.includes(keyword))) {
        return format.type;
      }
    }

    return null;
  }

  /**
   * Calculate average confidence of sections
   */
  private calculateAverageConfidence(sections: DetectedSection[]): number {
    if (sections.length === 0) return 0;
    const sum = sections.reduce((acc, section) => acc + section.confidence, 0);
    return sum / sections.length;
  }

  /**
   * Generate error POML when generation fails
   */
  private generateErrorPoml(errorMessage: string): string {
    return `<prompt>
  <error>
    Failed to generate POML: ${escapeXml(errorMessage)}
  </error>
</prompt>`;
  }

  /**
   * Get generation statistics
   */
  public getGenerationStats(): {
    totalGenerations: number;
    averageProcessingTime: number;
    componentTypeDistribution: Record<SectionType, number>;
  } {
    // This would be implemented with actual tracking in a production system
    return {
      totalGenerations: 0,
      averageProcessingTime: 0,
      componentTypeDistribution: {
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
export const templateEngine = new TemplateEngine();
