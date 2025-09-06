/**
 * Confidence Scorer - Calculates confidence scores for pattern matches and sections
 * Implements sophisticated scoring algorithms based on pattern strength, context, and user feedback
 */

import type { DetectedSection, SectionType, PatternMatch } from '../types';

export interface ConfidenceScorerInterface {
  calculateSectionConfidence(section: DetectedSection, context: string): number;
  calculatePatternConfidence(match: PatternMatch, text: string): number;
  calculateOverallConfidence(sections: DetectedSection[]): number;
  getAverageConfidence(): number;
  updateFromFeedback(section: DetectedSection, userFeedback: boolean): void;
}

export class ConfidenceScorer implements ConfidenceScorerInterface {
  private confidenceHistory: number[] = [];
  private feedbackData: Array<{
    sectionType: SectionType;
    originalConfidence: number;
    userFeedback: boolean;
    timestamp: number;
  }> = [];

  /**
   * Calculate confidence for a detected section based on multiple factors
   */
  public calculateSectionConfidence(section: DetectedSection, context: string): number {
    let confidence = section.confidence / 100; // Convert to 0-1 range
    
    // Apply various confidence boosters/penalties
    confidence *= this.getPositionConfidenceMultiplier(section, context);
    confidence *= this.getLengthConfidenceMultiplier(section);
    confidence *= this.getContextRelevanceMultiplier(section, context);
    confidence *= this.getTypeSpecificMultiplier(section);
    confidence *= this.getFeedbackBasedMultiplier(section.type);

    // Ensure confidence stays within bounds
    return Math.max(0.1, Math.min(1.0, confidence));
  }

  /**
   * Calculate confidence for a pattern match
   */
  public calculatePatternConfidence(match: PatternMatch, text: string): number {
    let confidence = match.confidence;

    // Pattern specificity bonus
    const specificityBonus = this.calculatePatternSpecificity(match);
    
    // Context relevance bonus
    const contextBonus = this.calculateContextRelevance(match, text);
    
    // Match position bonus (beginning/end of text often more reliable)
    const positionBonus = this.calculatePositionBonus(match, text);
    
    // Length penalty/bonus (very short or very long matches may be less reliable)
    const lengthModifier = this.calculateLengthModifier(match.matchedText);

    confidence = confidence + specificityBonus + contextBonus + positionBonus + lengthModifier;
    
    return Math.max(0.0, Math.min(1.0, confidence));
  }

  /**
   * Calculate overall confidence for a set of sections
   */
  public calculateOverallConfidence(sections: DetectedSection[]): number {
    if (sections.length === 0) return 0;

    // Calculate weighted average based on section importance
    const sectionWeights = this.getSectionTypeWeights();
    let totalWeightedScore = 0;
    let totalWeight = 0;

    sections.forEach(section => {
      const weight = sectionWeights[section.type] || 1;
      const confidence = section.confidence / 100;
      totalWeightedScore += confidence * weight;
      totalWeight += weight;
    });

    const averageConfidence = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;

    // Apply diversity bonus (having different section types increases confidence)
    const uniqueTypes = new Set(sections.map(s => s.type));
    const diversityBonus = Math.min(uniqueTypes.size * 0.05, 0.2);

    // Apply completeness bonus (having role + task is a good sign)
    const hasRole = sections.some(s => s.type === 'role');
    const hasTask = sections.some(s => s.type === 'task');
    const completenessBonus = (hasRole && hasTask) ? 0.1 : 0;

    const finalConfidence = averageConfidence + diversityBonus + completenessBonus;
    
    this.confidenceHistory.push(finalConfidence);
    return Math.max(0, Math.min(1, finalConfidence));
  }

  /**
   * Get average confidence from history
   */
  public getAverageConfidence(): number {
    if (this.confidenceHistory.length === 0) return 0;
    const sum = this.confidenceHistory.reduce((a, b) => a + b, 0);
    return sum / this.confidenceHistory.length;
  }

  /**
   * Update scorer based on user feedback
   */
  public updateFromFeedback(section: DetectedSection, userFeedback: boolean): void {
    this.feedbackData.push({
      sectionType: section.type,
      originalConfidence: section.confidence,
      userFeedback,
      timestamp: Date.now()
    });

    // Keep only recent feedback (last 100 items)
    if (this.feedbackData.length > 100) {
      this.feedbackData.shift();
    }
  }

  /**
   * Calculate position-based confidence multiplier
   */
  private getPositionConfidenceMultiplier(section: DetectedSection, context: string): number {
    const position = section.startIndex / context.length;
    
    // Different section types have different optimal positions
    const optimalPositions = {
      role: 0.2,      // Usually near the beginning
      task: 0.4,      // Often in the first half
      constraints: 0.6, // Often in the middle/later
      examples: 0.7,  // Usually later in the text
      outputFormat: 0.8, // Often at the end
      unknown: 0.5    // No preference
    };

    const optimal = optimalPositions[section.type];
    const deviation = Math.abs(position - optimal);
    
    // Less deviation = higher multiplier (max 1.1, min 0.9)
    return 1.0 + (0.1 - deviation * 0.2);
  }

  /**
   * Calculate length-based confidence multiplier
   */
  private getLengthConfidenceMultiplier(section: DetectedSection): number {
    const length = section.content.length;
    
    // Optimal length ranges for different section types
    const optimalRanges = {
      role: { min: 20, max: 150, optimal: 60 },
      task: { min: 30, max: 300, optimal: 100 },
      constraints: { min: 20, max: 200, optimal: 80 },
      examples: { min: 50, max: 500, optimal: 150 },
      outputFormat: { min: 15, max: 100, optimal: 40 },
      unknown: { min: 10, max: 1000, optimal: 100 }
    };

    const range = optimalRanges[section.type];
    
    if (length < range.min) {
      return 0.8; // Too short penalty
    } else if (length > range.max) {
      return 0.9; // Too long penalty
    } else {
      // Calculate how close to optimal length
      const deviation = Math.abs(length - range.optimal) / range.optimal;
      return 1.0 + (0.1 - deviation * 0.1);
    }
  }

  /**
   * Calculate context relevance multiplier
   */
  private getContextRelevanceMultiplier(section: DetectedSection, context: string): number {
    const relevantKeywords = this.getRelevantKeywords(section.type);
    const contextWords = context.toLowerCase().split(/\s+/);
    
    const relevantWordCount = relevantKeywords.filter(keyword => 
      contextWords.some(word => word.includes(keyword))
    ).length;
    
    // More relevant keywords = higher confidence
    return 1.0 + Math.min(relevantWordCount * 0.02, 0.1);
  }

  /**
   * Calculate type-specific multiplier based on section characteristics
   */
  private getTypeSpecificMultiplier(section: DetectedSection): number {
    switch (section.type) {
      case 'role':
        // Role sections with personal pronouns are more reliable
        return /\b(you|your|i|my)\b/gi.test(section.content) ? 1.05 : 0.95;
      
      case 'task':
        // Task sections with action verbs are more reliable
        return /\b(analyze|create|generate|write|develop|design|build)\b/gi.test(section.content) ? 1.05 : 0.95;
      
      case 'constraints':
        // Constraint sections with negative words are more reliable
        return /\b(don't|never|avoid|must not|cannot|shouldn't)\b/gi.test(section.content) ? 1.05 : 0.95;
      
      case 'examples':
        // Example sections with example indicators are more reliable
        return /\b(example|for instance|such as|like|sample)\b/gi.test(section.content) ? 1.05 : 0.95;
      
      case 'outputFormat':
        // Format sections with format keywords are more reliable
        return /\b(json|xml|format|structure|response|output)\b/gi.test(section.content) ? 1.05 : 0.95;
      
      default:
        return 1.0;
    }
  }

  /**
   * Calculate feedback-based multiplier
   */
  private getFeedbackBasedMultiplier(type: SectionType): number {
    const typeFeedback = this.feedbackData.filter(f => f.sectionType === type);
    
    if (typeFeedback.length === 0) return 1.0;
    
    const positiveCount = typeFeedback.filter(f => f.userFeedback).length;
    const accuracy = positiveCount / typeFeedback.length;
    
    // Convert accuracy to multiplier (0.5 accuracy = 1.0 multiplier, higher = bonus, lower = penalty)
    return 0.8 + (accuracy * 0.4);
  }

  /**
   * Calculate pattern specificity (more specific patterns = higher confidence)
   */
  private calculatePatternSpecificity(match: PatternMatch): number {
    const patternLength = match.matchedPatterns.join('').length;
    return Math.min(patternLength / 100, 0.1);
  }

  /**
   * Calculate context relevance for pattern match
   */
  private calculateContextRelevance(match: PatternMatch, text: string): number {
    const beforeContext = text.substring(0, match.startIndex);
    const afterContext = text.substring(match.endIndex);
    
    const relevantKeywords = this.getRelevantKeywords(match.type);
    const contextKeywords = (beforeContext + afterContext).toLowerCase();
    
    const relevanceCount = relevantKeywords.filter(keyword => 
      contextKeywords.includes(keyword)
    ).length;
    
    return Math.min(relevanceCount * 0.02, 0.05);
  }

  /**
   * Calculate position bonus for pattern match
   */
  private calculatePositionBonus(match: PatternMatch, text: string): number {
    const position = match.startIndex / text.length;
    
    // Sections near the beginning or end often have higher confidence
    if (position < 0.2 || position > 0.8) {
      return 0.05;
    }
    return 0;
  }

  /**
   * Calculate length modifier for matched text
   */
  private calculateLengthModifier(matchedText: string): number {
    const length = matchedText.length;
    
    // Optimal range: 20-100 characters
    if (length < 10) return -0.1; // Too short
    if (length > 200) return -0.05; // Too long
    if (length >= 20 && length <= 100) return 0.05; // Optimal
    return 0;
  }

  /**
   * Get section type weights for overall confidence calculation
   */
  private getSectionTypeWeights(): Record<SectionType, number> {
    return {
      role: 1.2,      // Role is very important
      task: 1.3,      // Task is most important
      constraints: 1.0,
      examples: 0.9,
      outputFormat: 1.1,
      unknown: 0.5
    };
  }

  /**
   * Get relevant keywords for each section type
   */
  private getRelevantKeywords(type: SectionType): string[] {
    const keywordMap = {
      role: ['you', 'are', 'act', 'role', 'persona', 'character', 'assistant'],
      task: ['analyze', 'create', 'generate', 'write', 'develop', 'task', 'objective', 'goal'],
      constraints: ['don\'t', 'avoid', 'never', 'must', 'limit', 'restrict', 'constraint', 'rule'],
      examples: ['example', 'instance', 'sample', 'demonstration', 'illustration'],
      outputFormat: ['format', 'structure', 'json', 'xml', 'respond', 'present', 'output'],
      unknown: []
    };
    return keywordMap[type] || [];
  }

  /**
   * Get confidence statistics
   */
  public getConfidenceStats(): {
    averageConfidence: number;
    confidenceDistribution: Record<string, number>;
    feedbackAccuracy: number;
  } {
    const distribution = {
      low: this.confidenceHistory.filter(c => c < 0.5).length,
      medium: this.confidenceHistory.filter(c => c >= 0.5 && c < 0.8).length,
      high: this.confidenceHistory.filter(c => c >= 0.8).length
    };

    const positiveFeeback = this.feedbackData.filter(f => f.userFeedback).length;
    const feedbackAccuracy = this.feedbackData.length > 0 
      ? positiveFeeback / this.feedbackData.length 
      : 0;

    return {
      averageConfidence: this.getAverageConfidence(),
      confidenceDistribution: distribution,
      feedbackAccuracy
    };
  }
}

// Create singleton instance for backward compatibility
export const confidenceScorer = new ConfidenceScorer();
