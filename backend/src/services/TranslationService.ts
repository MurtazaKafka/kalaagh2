import { EventEmitter } from 'events';
import axios from 'axios';
import crypto from 'crypto';
import { db } from '../database';
import { logger } from '../utils/logger';

interface TranslationRequest {
  id: string;
  contentId: string;
  targetLanguage: 'fa' | 'ps'; // fa=Dari, ps=Pashto
  translationType: 'title' | 'description' | 'transcript' | 'subtitles';
  originalText: string;
  translatedText?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'reviewed' | 'rejected';
  method: 'machine' | 'community' | 'professional';
}

interface TranslationCache {
  [key: string]: {
    translation: string;
    timestamp: number;
  };
}

export class TranslationService extends EventEmitter {
  private cache: TranslationCache = {};
  private cacheTimeout = 24 * 60 * 60 * 1000; // 24 hours
  private rtlLanguages = ['fa', 'ps', 'ar', 'ur'];
  
  // Language names for UI
  private languageNames = {
    en: 'English',
    fa: 'دری', // Dari
    ps: 'پښتو' // Pashto
  };

  // Common educational terms dictionary
  private educationalTerms = {
    fa: {
      'mathematics': 'ریاضیات',
      'science': 'علوم',
      'physics': 'فیزیک',
      'chemistry': 'کیمیا',
      'biology': 'بیولوژی',
      'computer science': 'علوم کامپیوتر',
      'addition': 'جمع',
      'subtraction': 'تفریق',
      'multiplication': 'ضرب',
      'division': 'تقسیم',
      'equation': 'معادله',
      'variable': 'متغیر',
      'function': 'تابع',
      'graph': 'گراف',
      'homework': 'کار خانگی',
      'lesson': 'درس',
      'exercise': 'تمرین',
      'example': 'مثال',
      'solution': 'حل',
      'practice': 'تمرین',
      'learn': 'یاد گرفتن',
      'understand': 'فهمیدن',
      'calculate': 'محاسبه کردن',
      'solve': 'حل کردن',
      'explain': 'توضیح دادن'
    },
    ps: {
      'mathematics': 'رياضيات',
      'science': 'ساينس',
      'physics': 'فزيک',
      'chemistry': 'کيميا',
      'biology': 'ژونپوهنه',
      'computer science': 'کمپيوټر ساينس',
      'addition': 'جمع',
      'subtraction': 'تفريق',
      'multiplication': 'ضرب',
      'division': 'تقسيم',
      'equation': 'معادله',
      'variable': 'متغير',
      'function': 'فنکشن',
      'graph': 'ګراف',
      'homework': 'کورنۍ دنده',
      'lesson': 'درس',
      'exercise': 'تمرين',
      'example': 'مثال',
      'solution': 'حل',
      'practice': 'تمرين',
      'learn': 'زده کول',
      'understand': 'پوهېدل',
      'calculate': 'محاسبه کول',
      'solve': 'حل کول',
      'explain': 'تشريح کول'
    }
  };

  constructor() {
    super();
    this.startTranslationProcessor();
  }

  /**
   * Start processing pending translations
   */
  private startTranslationProcessor(): void {
    setInterval(async () => {
      await this.processPendingTranslations();
    }, 30000); // Check every 30 seconds
  }

  /**
   * Process pending translation requests
   */
  private async processPendingTranslations(): Promise<void> {
    try {
      const pendingRequests = await db('translation_requests')
        .where('status', 'pending')
        .orderBy('requested_at', 'asc')
        .limit(10);

      for (const request of pendingRequests) {
        await this.processTranslationRequest(request);
      }
    } catch (error) {
      logger.error('Error processing translations:', error);
    }
  }

  /**
   * Process a single translation request
   */
  private async processTranslationRequest(request: TranslationRequest): Promise<void> {
    try {
      // Update status to in_progress
      await db('translation_requests')
        .where('id', request.id)
        .update({ status: 'in_progress' });

      let translatedText: string;

      switch (request.method) {
        case 'machine':
          translatedText = await this.machineTranslate(
            request.originalText,
            request.targetLanguage
          );
          break;
        case 'community':
          // For now, fall back to machine translation
          // In production, this would queue for community translation
          translatedText = await this.machineTranslate(
            request.originalText,
            request.targetLanguage
          );
          break;
        case 'professional':
          // Queue for professional translation service
          // For now, mark as pending for manual review
          return;
      }

      // Save translation
      await this.saveTranslation(request.id, translatedText);

      // Update content item with translation
      await this.updateContentWithTranslation(
        request.contentId,
        request.translationType,
        request.targetLanguage,
        translatedText
      );

      this.emit('translation-completed', {
        requestId: request.id,
        contentId: request.contentId,
        language: request.targetLanguage,
        type: request.translationType
      });

    } catch (error) {
      logger.error(`Translation failed for request ${request.id}:`, error);
      
      await db('translation_requests')
        .where('id', request.id)
        .update({
          status: 'rejected',
          review_notes: error.message
        });
    }
  }

  /**
   * Machine translate text
   */
  async machineTranslate(text: string, targetLang: 'fa' | 'ps'): Promise<string> {
    // Check cache first
    const cacheKey = `${text}-${targetLang}`;
    const cached = this.cache[cacheKey];
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.translation;
    }

    // First, try to translate using our educational terms dictionary
    let translatedText = this.translateWithDictionary(text, targetLang);
    
    // If not fully translated, use external service
    // Note: In production, you would use a real translation API like Google Translate
    // For demonstration, we'll do basic word replacement
    if (translatedText === text) {
      // Simulate API call
      translatedText = await this.simulateTranslationAPI(text, targetLang);
    }

    // Cache the result
    this.cache[cacheKey] = {
      translation: translatedText,
      timestamp: Date.now()
    };

    return translatedText;
  }

  /**
   * Translate using local dictionary
   */
  private translateWithDictionary(text: string, targetLang: 'fa' | 'ps'): string {
    const terms = this.educationalTerms[targetLang];
    let translated = text;

    // Sort terms by length (longest first) to avoid partial replacements
    const sortedTerms = Object.entries(terms).sort((a, b) => b[0].length - a[0].length);

    for (const [english, translation] of sortedTerms) {
      const regex = new RegExp(`\\b${english}\\b`, 'gi');
      translated = translated.replace(regex, translation);
    }

    return translated;
  }

  /**
   * Simulate translation API (replace with real API in production)
   */
  private async simulateTranslationAPI(text: string, targetLang: 'fa' | 'ps'): Promise<string> {
    // In production, use Google Translate API, Microsoft Translator, or AWS Translate
    // For now, return a placeholder
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate API delay
    
    // Add RTL marker for RTL languages
    const rtlMarker = this.rtlLanguages.includes(targetLang) ? '\u202B' : '';
    
    return `${rtlMarker}[${targetLang.toUpperCase()}] ${text}`;
  }

  /**
   * Save translation to database
   */
  private async saveTranslation(requestId: string, translatedText: string): Promise<void> {
    await db('translation_requests')
      .where('id', requestId)
      .update({
        translated_text: translatedText,
        status: 'completed',
        completed_at: new Date()
      });
  }

  /**
   * Update content item with translation
   */
  private async updateContentWithTranslation(
    contentId: string,
    type: string,
    language: string,
    translation: string
  ): Promise<void> {
    const updateData: any = {};
    
    switch (type) {
      case 'title':
        updateData[`title_${language}`] = translation;
        break;
      case 'description':
        updateData[`description_${language}`] = translation;
        break;
      case 'transcript':
        updateData[`transcript_${language}`] = translation;
        break;
    }

    // Update language availability
    const content = await db('content_items').where('id', contentId).first();
    const languages = content.language_available || ['en'];
    
    if (!languages.includes(language)) {
      languages.push(language);
      updateData.language_available = JSON.stringify(languages);
    }

    await db('content_items')
      .where('id', contentId)
      .update(updateData);
  }

  /**
   * Get available translations for content
   */
  async getContentTranslations(contentId: string): Promise<any> {
    const translations = await db('translation_requests')
      .where('content_id', contentId)
      .where('status', 'completed');

    const result: any = {};
    
    for (const trans of translations) {
      if (!result[trans.target_language]) {
        result[trans.target_language] = {};
      }
      result[trans.target_language][trans.translation_type] = trans.translated_text;
    }

    return result;
  }

  /**
   * Request community translation
   */
  async requestCommunityTranslation(
    contentId: string,
    text: string,
    type: 'title' | 'description' | 'transcript',
    targetLanguage: 'fa' | 'ps'
  ): Promise<string> {
    // Check if translation already exists
    const existing = await db('translation_requests')
      .where({
        content_id: contentId,
        target_language: targetLanguage,
        translation_type: type
      })
      .first();

    if (existing && existing.status === 'completed') {
      return existing.id;
    }

    // Create new request
    const requestId = crypto.randomUUID();
    
    await db('translation_requests').insert({
      id: requestId,
      content_id: contentId,
      target_language: targetLanguage,
      translation_type: type,
      status: 'pending',
      method: 'community',
      original_text: text,
      requested_at: new Date()
    });

    this.emit('community-translation-requested', {
      requestId,
      contentId,
      language: targetLanguage,
      type
    });

    return requestId;
  }

  /**
   * Submit community translation
   */
  async submitCommunityTranslation(
    requestId: string,
    translatedText: string,
    translatorId: string
  ): Promise<void> {
    await db('translation_requests')
      .where('id', requestId)
      .update({
        translated_text: translatedText,
        translator_id: translatorId,
        status: 'completed',
        completed_at: new Date()
      });

    const request = await db('translation_requests').where('id', requestId).first();
    
    if (request) {
      await this.updateContentWithTranslation(
        request.content_id,
        request.translation_type,
        request.target_language,
        translatedText
      );
    }
  }

  /**
   * Review and approve translation
   */
  async reviewTranslation(
    requestId: string,
    reviewerId: string,
    approved: boolean,
    notes?: string,
    qualityScore?: number
  ): Promise<void> {
    const updateData: any = {
      reviewer_id: reviewerId,
      reviewed_at: new Date(),
      review_notes: notes
    };

    if (approved) {
      updateData.status = 'reviewed';
      updateData.quality_score = qualityScore || 0.8;
    } else {
      updateData.status = 'rejected';
    }

    await db('translation_requests')
      .where('id', requestId)
      .update(updateData);
  }

  /**
   * Get translation statistics
   */
  async getTranslationStats(): Promise<any> {
    const stats = await db('translation_requests')
      .select('target_language', 'status')
      .count('* as count')
      .groupBy('target_language', 'status');

    const languages = await db('translation_requests')
      .distinct('target_language');

    return {
      totalRequests: stats.reduce((sum, s) => sum + parseInt(s.count), 0),
      byLanguage: languages.map(l => ({
        language: l.target_language,
        name: this.languageNames[l.target_language],
        stats: stats.filter(s => s.target_language === l.target_language)
      })),
      pendingCount: stats.filter(s => s.status === 'pending').reduce((sum, s) => sum + parseInt(s.count), 0),
      completedCount: stats.filter(s => s.status === 'completed').reduce((sum, s) => sum + parseInt(s.count), 0)
    };
  }

  /**
   * Check if content needs translation
   */
  async checkTranslationNeeds(contentId: string): Promise<any> {
    const content = await db('content_items').where('id', contentId).first();
    const needs = [];

    const languages = ['fa', 'ps'];
    const fields = ['title', 'description'];

    for (const lang of languages) {
      for (const field of fields) {
        const fieldName = `${field}_${lang}`;
        if (!content[fieldName]) {
          needs.push({
            language: lang,
            field,
            originalText: content[field]
          });
        }
      }
    }

    return needs;
  }
}

export const translationService = new TranslationService();