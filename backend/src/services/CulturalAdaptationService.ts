import { EventEmitter } from 'events';
import crypto from 'crypto';
import { db } from '../database';
import { logger } from '../utils/logger';

interface CulturalFlag {
  topic: string;
  severity: 'low' | 'medium' | 'high';
  suggestion: string;
  context?: string;
}

interface ContentReview {
  contentId: string;
  flags: CulturalFlag[];
  culturalNotes: string;
  requiresReview: boolean;
  adaptationSuggestions: string[];
}

export class CulturalAdaptationService extends EventEmitter {
  // Topics that may require cultural sensitivity review
  private sensitiveTopics = {
    // Science topics
    'evolution': {
      severity: 'medium',
      suggestion: 'Present as scientific theory with acknowledgment of diverse perspectives',
      alternativeApproach: 'Focus on adaptation and biodiversity without evolutionary timeline'
    },
    'human reproduction': {
      severity: 'high',
      suggestion: 'Use clinical, educational language and diagrams',
      alternativeApproach: 'Focus on biological systems and health education aspects'
    },
    'human anatomy': {
      severity: 'medium',
      suggestion: 'Use medical diagrams and professional terminology',
      alternativeApproach: 'Focus on systems and functions rather than detailed anatomy'
    },
    
    // Arts and culture
    'music with instruments': {
      severity: 'low',
      suggestion: 'Include traditional Afghan instruments and cultural context',
      alternativeApproach: 'Focus on rhythm, mathematics in music, and vocal traditions'
    },
    'representational art': {
      severity: 'medium',
      suggestion: 'Focus on geometric patterns, calligraphy, and abstract art',
      alternativeApproach: 'Emphasize Islamic art traditions and mathematical patterns'
    },
    'dance': {
      severity: 'medium',
      suggestion: 'Present in cultural and historical context',
      alternativeApproach: 'Focus on cultural celebrations and traditional movements'
    },
    
    // Social topics
    'dating': {
      severity: 'high',
      suggestion: 'Replace with family values and respectful relationships',
      alternativeApproach: 'Focus on communication skills and respect in all relationships'
    },
    'western holidays': {
      severity: 'low',
      suggestion: 'Present as cultural studies with Islamic holiday parallels',
      alternativeApproach: 'Focus on universal themes like gratitude, family, and community'
    },
    
    // Historical topics
    'crusades': {
      severity: 'medium',
      suggestion: 'Present balanced historical perspective',
      alternativeApproach: 'Focus on cultural exchange and historical impact'
    },
    'colonialism': {
      severity: 'low',
      suggestion: 'Include Afghan perspective and resistance history',
      alternativeApproach: 'Emphasize independence movements and cultural preservation'
    }
  };

  // Positive cultural elements to emphasize
  private culturalStrengths = {
    'mathematics': 'Highlight contributions of Islamic mathematicians like Al-Khwarizmi',
    'astronomy': 'Feature Islamic astronomical discoveries and navigation',
    'medicine': 'Include contributions of Ibn Sina (Avicenna) and Islamic medicine',
    'architecture': 'Showcase Islamic architecture and geometric principles',
    'poetry': 'Include Rumi, Hafez, and Afghan poets',
    'calligraphy': 'Emphasize the art and mathematics of Islamic calligraphy',
    'hospitality': 'Connect to Afghan cultural values of mehman nawazi',
    'family': 'Reinforce strong family values in Afghan culture',
    'education': 'Emphasize Islamic tradition of seeking knowledge',
    'charity': 'Connect to Islamic principles of zakat and helping others'
  };

  // Grade-appropriate content guidelines
  private gradeGuidelines = {
    'K-5': {
      focus: ['basic concepts', 'moral stories', 'cultural pride', 'family values'],
      avoid: ['complex social issues', 'controversial topics', 'graphic content']
    },
    '6-8': {
      focus: ['critical thinking', 'Islamic history', 'scientific method', 'cultural diversity'],
      avoid: ['explicit content', 'controversial social topics']
    },
    '9-12': {
      focus: ['analytical skills', 'global perspectives', 'career preparation', 'civic responsibility'],
      avoid: ['content conflicting with Islamic values']
    }
  };

  constructor() {
    super();
  }

  /**
   * Review content for cultural appropriateness
   */
  async reviewContent(contentId: string): Promise<ContentReview> {
    const content = await db('content_items').where('id', contentId).first();
    
    if (!content) {
      throw new Error('Content not found');
    }

    const flags: CulturalFlag[] = [];
    const adaptationSuggestions: string[] = [];

    // Check title and description for sensitive topics
    const textToReview = `${content.title} ${content.description} ${content.transcript || ''}`.toLowerCase();
    
    // Check for sensitive topics
    for (const [topic, config] of Object.entries(this.sensitiveTopics)) {
      if (this.containsTopic(textToReview, topic)) {
        flags.push({
          topic,
          severity: config.severity,
          suggestion: config.suggestion,
          context: this.extractContext(textToReview, topic)
        });
        
        if (config.alternativeApproach) {
          adaptationSuggestions.push(config.alternativeApproach);
        }
      }
    }

    // Generate cultural notes
    const culturalNotes = await this.generateCulturalNotes(content);

    // Add positive cultural connections
    const culturalConnections = this.findCulturalConnections(content);
    if (culturalConnections.length > 0) {
      adaptationSuggestions.push(...culturalConnections);
    }

    // Check grade appropriateness
    const gradeFlags = this.checkGradeAppropriateness(content);
    flags.push(...gradeFlags);

    const requiresReview = flags.some(f => f.severity === 'high') || flags.length > 3;

    // Save review results
    await this.saveReviewResults(contentId, flags, culturalNotes, requiresReview);

    return {
      contentId,
      flags,
      culturalNotes,
      requiresReview,
      adaptationSuggestions
    };
  }

  /**
   * Check if text contains a topic
   */
  private containsTopic(text: string, topic: string): boolean {
    // Use word boundaries for more accurate matching
    const words = topic.split(' ');
    return words.every(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      return regex.test(text);
    });
  }

  /**
   * Extract context around a topic mention
   */
  private extractContext(text: string, topic: string): string {
    const index = text.toLowerCase().indexOf(topic.toLowerCase());
    if (index === -1) return '';
    
    const start = Math.max(0, index - 50);
    const end = Math.min(text.length, index + topic.length + 50);
    
    return '...' + text.substring(start, end) + '...';
  }

  /**
   * Generate cultural notes for content
   */
  private async generateCulturalNotes(content: any): Promise<string> {
    const notes: string[] = [];

    // Add subject-specific cultural context
    if (content.subject_id) {
      const subject = await db('subjects').where('id', content.subject_id).first();
      if (subject && this.culturalStrengths[subject.name.toLowerCase()]) {
        notes.push(this.culturalStrengths[subject.name.toLowerCase()]);
      }
    }

    // Add IB programme-specific notes
    if (content.ib_programme) {
      switch (content.ib_programme) {
        case 'PYP':
          notes.push('Content suitable for young learners with emphasis on inquiry and cultural awareness');
          break;
        case 'MYP':
          notes.push('Content promotes critical thinking while respecting cultural values');
          break;
        case 'DP':
          notes.push('Advanced content preparing students for international education while maintaining cultural identity');
          break;
      }
    }

    // Add language-specific notes
    if (content.language_available && content.language_available.includes('fa')) {
      notes.push('Content available in Dari for better comprehension');
    }
    if (content.language_available && content.language_available.includes('ps')) {
      notes.push('Content available in Pashto for mother tongue education');
    }

    // Add content type specific notes
    if (content.content_type === 'video') {
      notes.push('Visual content should be reviewed for cultural appropriateness');
    } else if (content.content_type === 'interactive') {
      notes.push('Interactive elements should respect cultural norms and learning styles');
    }

    return notes.join('. ');
  }

  /**
   * Find positive cultural connections
   */
  private findCulturalConnections(content: any): string[] {
    const connections: string[] = [];
    const text = `${content.title} ${content.description}`.toLowerCase();

    // Mathematics connections
    if (text.includes('algebra') || text.includes('algorithm')) {
      connections.push('Connect to Al-Khwarizmi, the father of algebra from the Islamic Golden Age');
    }

    // Science connections
    if (text.includes('optics') || text.includes('light')) {
      connections.push('Reference Ibn al-Haytham\'s contributions to optics');
    }

    if (text.includes('medicine') || text.includes('anatomy')) {
      connections.push('Include Ibn Sina\'s Canon of Medicine as historical context');
    }

    // Geography connections
    if (text.includes('geography') || text.includes('map')) {
      connections.push('Highlight the Silk Road and Afghanistan\'s historical importance');
    }

    // Literature connections
    if (text.includes('poetry') || text.includes('literature')) {
      connections.push('Include examples from Rumi, Hafez, and Afghan poets');
    }

    return connections;
  }

  /**
   * Check grade appropriateness
   */
  private checkGradeAppropriateness(content: any): CulturalFlag[] {
    const flags: CulturalFlag[] = [];
    const grade = parseInt(content.grade_level) || 0;
    
    let guidelines;
    if (grade <= 5) {
      guidelines = this.gradeGuidelines['K-5'];
    } else if (grade <= 8) {
      guidelines = this.gradeGuidelines['6-8'];
    } else {
      guidelines = this.gradeGuidelines['9-12'];
    }

    const text = `${content.title} ${content.description}`.toLowerCase();

    // Check against avoid list
    for (const avoidTopic of guidelines.avoid) {
      if (text.includes(avoidTopic)) {
        flags.push({
          topic: avoidTopic,
          severity: 'medium',
          suggestion: `This topic may not be appropriate for grade ${grade}`
        });
      }
    }

    return flags;
  }

  /**
   * Save review results to database
   */
  private async saveReviewResults(
    contentId: string,
    flags: CulturalFlag[],
    culturalNotes: string,
    requiresReview: boolean
  ): Promise<void> {
    await db('content_items')
      .where('id', contentId)
      .update({
        cultural_notes: culturalNotes,
        cultural_flags: JSON.stringify(flags),
        cultural_review_required: requiresReview,
        updated_at: new Date()
      });

    if (requiresReview) {
      this.emit('content-flagged-for-review', {
        contentId,
        flags,
        severity: flags.find(f => f.severity === 'high') ? 'high' : 'medium'
      });
    }
  }

  /**
   * Approve content after cultural review
   */
  async approveContent(
    contentId: string,
    reviewerId: string,
    notes?: string,
    modifications?: any
  ): Promise<void> {
    const updateData: any = {
      cultural_review_required: false,
      is_approved: true,
      review_notes: notes,
      updated_at: new Date()
    };

    if (modifications) {
      // Apply any content modifications
      Object.assign(updateData, modifications);
    }

    await db('content_items')
      .where('id', contentId)
      .update(updateData);

    // Log the approval
    await db('content_reviews').insert({
      id: crypto.randomUUID(),
      content_id: contentId,
      reviewer_id: reviewerId,
      review_type: 'cultural',
      status: 'approved',
      notes: notes,
      reviewed_at: new Date()
    });

    this.emit('content-approved', { contentId, reviewerId });
  }

  /**
   * Get content requiring cultural review
   */
  async getContentForReview(limit: number = 10): Promise<any[]> {
    return db('content_items')
      .where('cultural_review_required', true)
      .where('is_approved', false)
      .orderBy('created_at', 'asc')
      .limit(limit);
  }

  /**
   * Generate cultural adaptation report
   */
  async generateAdaptationReport(startDate: Date, endDate: Date): Promise<any> {
    const reviews = await db('content_items')
      .whereBetween('created_at', [startDate, endDate])
      .whereNotNull('cultural_flags');

    const flagCounts: Record<string, number> = {};
    const severityCounts = { low: 0, medium: 0, high: 0 };
    let totalFlags = 0;

    for (const review of reviews) {
      if (review.cultural_flags) {
        const flags = JSON.parse(review.cultural_flags);
        for (const flag of flags) {
          flagCounts[flag.topic] = (flagCounts[flag.topic] || 0) + 1;
          severityCounts[flag.severity]++;
          totalFlags++;
        }
      }
    }

    return {
      period: { startDate, endDate },
      totalContentReviewed: reviews.length,
      totalFlags,
      flagsByTopic: flagCounts,
      flagsBySeverity: severityCounts,
      requiresReview: reviews.filter(r => r.cultural_review_required).length,
      approved: reviews.filter(r => r.is_approved).length
    };
  }

  /**
   * Create content adaptation suggestions
   */
  async createAdaptationSuggestions(contentId: string): Promise<string[]> {
    const content = await db('content_items').where('id', contentId).first();
    const suggestions: string[] = [];

    if (!content) return suggestions;

    // Parse cultural flags
    const flags = content.cultural_flags ? JSON.parse(content.cultural_flags) : [];

    // Generate suggestions based on flags
    for (const flag of flags) {
      const topicConfig = this.sensitiveTopics[flag.topic];
      if (topicConfig && topicConfig.alternativeApproach) {
        suggestions.push(topicConfig.alternativeApproach);
      }
    }

    // Add general suggestions based on content type
    if (content.content_type === 'video') {
      suggestions.push('Consider adding disclaimer or context at the beginning of the video');
      suggestions.push('Provide alternative activities for sensitive sections');
    }

    if (content.content_type === 'interactive') {
      suggestions.push('Ensure interactive elements respect cultural norms');
      suggestions.push('Add options to skip or modify sensitive content');
    }

    // Add grade-specific suggestions
    const grade = parseInt(content.grade_level) || 0;
    if (grade <= 5) {
      suggestions.push('Use simple language and focus on moral lessons');
    } else if (grade <= 8) {
      suggestions.push('Encourage critical thinking while respecting cultural values');
    } else {
      suggestions.push('Present multiple perspectives while maintaining cultural sensitivity');
    }

    return [...new Set(suggestions)]; // Remove duplicates
  }
}

export const culturalAdaptationService = new CulturalAdaptationService();