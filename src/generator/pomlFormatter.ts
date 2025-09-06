/**
 * POML Formatter - Handles XML-style formatting and indentation for POML output
 */

import { escapeXml } from '../utils/helpers';
import type { PomlComponent } from './templateEngine';

export interface FormattingOptions {
  indent?: string;
  includeXmlDeclaration?: boolean;
  sortAttributes?: boolean;
  preserveWhitespace?: boolean;
}

export class PomlFormatter {
  private defaultOptions: Required<FormattingOptions> = {
    indent: '  ',
    includeXmlDeclaration: false,
    sortAttributes: false,
    preserveWhitespace: true
  };

  /**
   * Format POML components into a properly indented string
   */
  public format(
    components: PomlComponent[], 
    options: FormattingOptions = {}
  ): string {
    const opts = { ...this.defaultOptions, ...options };
    const lines: string[] = [];
    
    if (opts.includeXmlDeclaration) {
      lines.push('<?xml version="1.0" encoding="UTF-8"?>');
    }

    for (const component of components) {
      this.formatComponent(component, lines, 0, opts);
    }

    return lines.join('\n');
  }

  /**
   * Format components into a minified string (single line)
   */
  public formatMinified(components: PomlComponent[]): string {
    return components.map(component => this.formatComponentMinified(component)).join('');
  }

  /**
   * Format a single component with proper indentation
   */
  private formatComponent(
    component: PomlComponent,
    lines: string[],
    depth: number,
    options: Required<FormattingOptions>
  ): void {
    const indent = options.indent.repeat(depth);
    const { tag, attributes, content } = component;

    // Build opening tag with attributes
    const openingTag = this.buildOpeningTag(tag, attributes, options);
    
    if (Array.isArray(content)) {
      // Component has child components
      lines.push(`${indent}<${openingTag}>`);
      
      for (const child of content) {
        this.formatComponent(child, lines, depth + 1, options);
      }
      
      lines.push(`${indent}</${tag}>`);
    } else {
      // Component has text content
      const escapedContent = escapeXml(content);
      
      if (this.isSimpleContent(content) && !content.includes('\n')) {
        // Single line content
        lines.push(`${indent}<${openingTag}>${escapedContent}</${tag}>`);
      } else {
        // Multi-line content
        lines.push(`${indent}<${openingTag}>`);
        
        if (options.preserveWhitespace && content.includes('\n')) {
          // Preserve original formatting for multi-line content
          const contentLines = escapedContent.split('\n');
          for (const line of contentLines) {
            lines.push(`${options.indent.repeat(depth + 1)}${line}`);
          }
        } else {
          // Simple indented content
          lines.push(`${options.indent.repeat(depth + 1)}${escapedContent}`);
        }
        
        lines.push(`${indent}</${tag}>`);
      }
    }
  }

  /**
   * Format a single component in minified form
   */
  private formatComponentMinified(component: PomlComponent): string {
    const { tag, attributes, content } = component;
    const openingTag = this.buildOpeningTag(tag, attributes, this.defaultOptions);

    if (Array.isArray(content)) {
      const childrenHtml = content.map(child => this.formatComponentMinified(child)).join('');
      return `<${openingTag}>${childrenHtml}</${tag}>`;
    } else {
      const escapedContent = escapeXml(content);
      return `<${openingTag}>${escapedContent}</${tag}>`;
    }
  }

  /**
   * Build opening tag string with attributes
   */
  private buildOpeningTag(
    tag: string, 
    attributes: Record<string, string> | undefined,
    options: Required<FormattingOptions>
  ): string {
    if (!attributes || Object.keys(attributes).length === 0) {
      return tag;
    }

    const attributeEntries = Object.entries(attributes);
    
    if (options.sortAttributes) {
      attributeEntries.sort(([a], [b]) => a.localeCompare(b));
    }

    const attributeStrings = attributeEntries.map(([key, value]) => {
      const escapedValue = escapeXml(value);
      return `${key}="${escapedValue}"`;
    });

    return `${tag} ${attributeStrings.join(' ')}`;
  }

  /**
   * Check if content is simple (no special formatting needed)
   */
  private isSimpleContent(content: string): boolean {
    return content.length < 80 && 
           !content.includes('<') && 
           !content.includes('>') && 
           !content.includes('&') &&
           content.trim() === content; // No leading/trailing whitespace
  }

  /**
   * Validate POML component structure
   */
  public validateComponent(component: PomlComponent): string[] {
    const errors: string[] = [];

    // Validate tag name
    if (!this.isValidTagName(component.tag)) {
      errors.push(`Invalid tag name: '${component.tag}'`);
    }

    // Validate attributes
    if (component.attributes) {
      for (const [key, value] of Object.entries(component.attributes)) {
        if (!this.isValidAttributeName(key)) {
          errors.push(`Invalid attribute name: '${key}'`);
        }
        if (typeof value !== 'string') {
          errors.push(`Attribute '${key}' must be a string, got ${typeof value}`);
        }
      }
    }

    // Validate content
    if (Array.isArray(component.content)) {
      for (let i = 0; i < component.content.length; i++) {
        const childErrors = this.validateComponent(component.content[i]);
        errors.push(...childErrors.map(error => `Child ${i}: ${error}`));
      }
    } else if (typeof component.content !== 'string') {
      errors.push(`Content must be string or array of components, got ${typeof component.content}`);
    }

    return errors;
  }

  /**
   * Check if a tag name is valid XML
   */
  private isValidTagName(name: string): boolean {
    // XML tag name rules: start with letter/underscore, contain letters/digits/hyphens/periods/underscores
    return /^[a-zA-Z_][a-zA-Z0-9._-]*$/.test(name);
  }

  /**
   * Check if an attribute name is valid XML
   */
  private isValidAttributeName(name: string): boolean {
    // Same rules as tag names
    return this.isValidTagName(name);
  }

  /**
   * Pretty print a component tree for debugging
   */
  public debugPrint(component: PomlComponent, depth = 0): string {
    const indent = '  '.repeat(depth);
    const attributes = component.attributes 
      ? ` [${Object.entries(component.attributes).map(([k, v]) => `${k}="${v}"`).join(', ')}]`
      : '';
    
    let result = `${indent}${component.tag}${attributes}\n`;
    
    if (Array.isArray(component.content)) {
      for (const child of component.content) {
        result += this.debugPrint(child, depth + 1);
      }
    } else {
      const preview = component.content.length > 50 
        ? component.content.substring(0, 50) + '...'
        : component.content;
      result += `${indent}  "${preview}"\n`;
    }
    
    return result;
  }

  /**
   * Get formatting statistics
   */
  public getFormattingStats(components: PomlComponent[]): {
    totalComponents: number;
    maxDepth: number;
    totalAttributes: number;
    totalTextLength: number;
  } {
    let totalComponents = 0;
    let maxDepth = 0;
    let totalAttributes = 0;
    let totalTextLength = 0;

    const analyze = (component: PomlComponent, depth: number) => {
      totalComponents++;
      maxDepth = Math.max(maxDepth, depth);
      
      if (component.attributes) {
        totalAttributes += Object.keys(component.attributes).length;
      }
      
      if (Array.isArray(component.content)) {
        component.content.forEach(child => analyze(child, depth + 1));
      } else {
        totalTextLength += component.content.length;
      }
    };

    components.forEach(component => analyze(component, 1));

    return {
      totalComponents,
      maxDepth,
      totalAttributes,
      totalTextLength
    };
  }
}
