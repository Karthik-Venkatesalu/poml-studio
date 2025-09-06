import type { DetectedSection } from '../types';

/**
 * Generate a unique ID for sections, projects, etc.
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

/**
 * Debounce function for limiting frequent function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
}

/**
 * Calculate confidence score for a section based on pattern matches
 */
export function calculateConfidence(matches: number, totalPatterns: number): number {
  if (totalPatterns === 0) return 0;
  return Math.min((matches / totalPatterns) * 100, 100);
}

/**
 * Sanitize text content for XML/POML output
 */
export function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Clean up text by removing extra whitespace and normalizing
 */
export function normalizeText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Check if two sections overlap
 */
export function sectionsOverlap(section1: DetectedSection, section2: DetectedSection): boolean {
  return (
    (section1.startIndex <= section2.startIndex && section1.endIndex > section2.startIndex) ||
    (section2.startIndex <= section1.startIndex && section2.endIndex > section1.startIndex)
  );
}

/**
 * Merge overlapping sections by keeping the one with higher confidence
 */
export function mergeOverlappingSections(sections: DetectedSection[]): DetectedSection[] {
  const merged: DetectedSection[] = [];
  const sorted = [...sections].sort((a, b) => a.startIndex - b.startIndex);

  for (const section of sorted) {
    const overlapping = merged.find(existing => sectionsOverlap(existing, section));
    
    if (overlapping) {
      // Keep the section with higher confidence
      if (section.confidence > overlapping.confidence) {
        const index = merged.indexOf(overlapping);
        merged[index] = section;
      }
      // If existing has higher confidence, we keep it (do nothing)
    } else {
      merged.push(section);
    }
  }

  return merged;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Check if a string is a valid XML tag name
 */
export function isValidXmlTagName(name: string): boolean {
  // XML tag names must start with a letter or underscore, followed by letters, digits, hyphens, periods, or underscores
  const xmlNameRegex = /^[a-zA-Z_][a-zA-Z0-9._-]*$/;
  return xmlNameRegex.test(name);
}
