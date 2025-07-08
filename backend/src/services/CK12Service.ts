import axios from 'axios';
import * as cheerio from 'cheerio';
import crypto from 'crypto';
import { EventEmitter } from 'events';
import { db } from '../database';
import { logger } from '../utils/logger';
import { contentDownloader } from './ContentDownloaderService';
import { translationService } from './TranslationService';

interface CK12Resource {
  id: string;
  title: string;
  description: string;
  type: 'flexbook' | 'video' | 'simulation' | 'plix' | 'assessment';
  gradeLevel: string;
  subject: string;
  url: string;
  thumbnail?: string;
  duration?: number;
  standards?: string[];
  languages?: string[];
}

export class CK12Service extends EventEmitter {
  private baseUrl = 'https://www.ck12.org';
  private apiKey: string | undefined;
  
  constructor() {
    super();
    this.apiKey = process.env.CK12_API_KEY;
  }

  /**
   * Import CK-12 FlexBooks
   */
  async importFlexBooks(subject: string, gradeLevel: string): Promise<void> {
    try {
      logger.info(`Importing CK-12 FlexBooks for ${subject} grade ${gradeLevel}`);
      
      // Get or create content source
      let source = await db('content_sources')
        .where('name', 'CK-12 Foundation')
        .first();
      
      if (!source) {
        const [newSource] = await db('content_sources').insert({
          id: crypto.randomUUID(),
          name: 'CK-12 Foundation',
          base_url: this.baseUrl,
          is_active: true,
          metadata: { type: 'open-educational-resources' }
        }).returning('*');
        source = newSource;
      }

      // Fetch FlexBooks listing
      const flexBooks = await this.fetchFlexBooks(subject, gradeLevel);
      
      for (const book of flexBooks) {
        await this.importFlexBook(book, source.id);
      }

      logger.info(`Imported ${flexBooks.length} FlexBooks`);
    } catch (error) {
      logger.error('Failed to import CK-12 FlexBooks:', error);
      throw error;
    }
  }

  /**
   * Fetch FlexBooks from CK-12
   */
  private async fetchFlexBooks(subject: string, gradeLevel: string): Promise<CK12Resource[]> {
    const subjectMap: Record<string, string> = {
      'mathematics': 'math',
      'science': 'science',
      'biology': 'life-science',
      'chemistry': 'chemistry',
      'physics': 'physics',
      'earth-science': 'earth-science'
    };

    const ck12Subject = subjectMap[subject.toLowerCase()] || 'math';
    const url = `${this.baseUrl}/browse/${ck12Subject}`;

    try {
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);
      const flexBooks: CK12Resource[] = [];

      $('.book-tile').each((index, element) => {
        const $elem = $(element);
        const title = $elem.find('.book-title').text().trim();
        const description = $elem.find('.book-description').text().trim();
        const bookUrl = this.baseUrl + $elem.find('a').attr('href');
        const thumbnail = $elem.find('img').attr('src');

        // Check if grade level matches
        if (this.matchesGradeLevel(title, gradeLevel)) {
          flexBooks.push({
            id: this.extractIdFromUrl(bookUrl),
            title,
            description,
            type: 'flexbook',
            gradeLevel,
            subject,
            url: bookUrl,
            thumbnail
          });
        }
      });

      return flexBooks;
    } catch (error) {
      logger.error(`Failed to fetch FlexBooks:`, error);
      return [];
    }
  }

  /**
   * Import a single FlexBook
   */
  private async importFlexBook(book: CK12Resource, sourceId: string): Promise<void> {
    try {
      // Check if already imported
      const existing = await db('content_items')
        .where('source_id', sourceId)
        .where('external_id', book.id)
        .first();

      if (existing) {
        logger.debug(`FlexBook already imported: ${book.title}`);
        return;
      }

      // Get subject ID
      const subject = await db('subjects')
        .where('name', book.subject)
        .first();

      if (!subject) {
        logger.error(`Subject not found: ${book.subject}`);
        return;
      }

      // Map to IB Programme
      const ibProgramme = this.mapToIBProgramme(book.gradeLevel);

      // Create content item
      const [contentItem] = await db('content_items').insert({
        id: crypto.randomUUID(),
        source_id: sourceId,
        external_id: book.id,
        title: book.title,
        description: book.description,
        subject_id: subject.id,
        grade_level: book.gradeLevel,
        content_type: 'article',
        difficulty: this.determineDifficulty(book.gradeLevel),
        video_url: null,
        thumbnail_url: book.thumbnail,
        tags: ['flexbook', 'ck12', 'textbook'],
        learning_objectives: [`Read and understand ${book.title}`, 'Complete chapter exercises'],
        is_processed: false,
        is_approved: false,
        quality_score: 0.85,
        ib_programme: ibProgramme,
        offline_available: false,
        requires_internet: true,
        language_available: JSON.stringify(['en']),
        license_type: 'CC-BY-NC',
        attribution: 'CK-12 Foundation',
        author: 'CK-12',
        source_url: book.url,
        interactive: false,
        metadata: JSON.stringify({
          type: 'flexbook',
          url: book.url,
          downloadFormats: ['pdf', 'epub']
        })
      }).returning('*');

      // Queue for download and translation
      await this.queueFlexBookDownload(contentItem.id, book.url);
      await this.queueForTranslation(contentItem.id);

      this.emit('flexbook-imported', { contentId: contentItem.id, title: book.title });
    } catch (error) {
      logger.error(`Failed to import FlexBook ${book.title}:`, error);
    }
  }

  /**
   * Queue FlexBook for download
   */
  private async queueFlexBookDownload(contentId: string, bookUrl: string): Promise<void> {
    // In production, this would download the PDF/EPUB versions
    // For now, we'll mark it for manual download
    logger.info(`Queued FlexBook for download: ${bookUrl}`);
  }

  /**
   * Import PLIX interactive simulations
   */
  async importPLIXSimulations(subject: string): Promise<void> {
    try {
      logger.info(`Importing CK-12 PLIX simulations for ${subject}`);
      
      const simulations = await this.fetchPLIXSimulations(subject);
      
      for (const sim of simulations) {
        await this.importPLIXSimulation(sim);
      }

      logger.info(`Imported ${simulations.length} PLIX simulations`);
    } catch (error) {
      logger.error('Failed to import PLIX simulations:', error);
    }
  }

  /**
   * Fetch PLIX simulations
   */
  private async fetchPLIXSimulations(subject: string): Promise<CK12Resource[]> {
    // This would scrape or use API to get PLIX simulations
    // For demonstration, returning sample data
    return [
      {
        id: 'plix-1',
        title: 'Interactive Algebra Tiles',
        description: 'Explore algebraic expressions with virtual manipulatives',
        type: 'plix',
        gradeLevel: '8',
        subject: 'Mathematics',
        url: `${this.baseUrl}/plix/algebra-tiles`
      }
    ];
  }

  /**
   * Import a PLIX simulation
   */
  private async importPLIXSimulation(sim: CK12Resource): Promise<void> {
    // Similar to importFlexBook but with interactive flag set to true
    logger.info(`Importing PLIX: ${sim.title}`);
  }

  /**
   * Map grade level to IB Programme
   */
  private mapToIBProgramme(gradeLevel: string): 'PYP' | 'MYP' | 'DP' {
    const grade = parseInt(gradeLevel) || 0;
    if (grade <= 5) return 'PYP';
    if (grade <= 10) return 'MYP';
    return 'DP';
  }

  /**
   * Determine difficulty based on grade level
   */
  private determineDifficulty(gradeLevel: string): 'beginner' | 'intermediate' | 'advanced' {
    const grade = parseInt(gradeLevel) || 0;
    if (grade <= 5) return 'beginner';
    if (grade <= 8) return 'intermediate';
    return 'advanced';
  }

  /**
   * Check if title matches grade level
   */
  private matchesGradeLevel(title: string, targetGrade: string): boolean {
    const titleLower = title.toLowerCase();
    const grade = parseInt(targetGrade) || 0;
    
    // Direct grade match
    if (titleLower.includes(`grade ${grade}`) || titleLower.includes(`${grade}th grade`)) {
      return true;
    }
    
    // Level-based matching
    if (grade <= 5 && titleLower.includes('elementary')) return true;
    if (grade >= 6 && grade <= 8 && titleLower.includes('middle school')) return true;
    if (grade >= 9 && titleLower.includes('high school')) return true;
    
    return false;
  }

  /**
   * Extract ID from URL
   */
  private extractIdFromUrl(url: string): string {
    const parts = url.split('/');
    return parts[parts.length - 1] || crypto.randomUUID();
  }

  /**
   * Queue content for translation
   */
  private async queueForTranslation(contentId: string): Promise<void> {
    const content = await db('content_items').where('id', contentId).first();
    
    if (!content) return;

    // Queue title and description for translation
    await translationService.requestCommunityTranslation(
      contentId,
      content.title,
      'title',
      'fa'
    );
    
    await translationService.requestCommunityTranslation(
      contentId,
      content.description,
      'description',
      'fa'
    );
  }

  /**
   * Create custom FlexBook
   */
  async createCustomFlexBook(
    title: string,
    chapters: string[],
    language: 'en' | 'fa' | 'ps'
  ): Promise<string> {
    try {
      // This would use CK-12's API to create a custom book
      // For now, we'll create a local compilation
      
      const flexBookId = crypto.randomUUID();
      
      // Create content item
      await db('content_items').insert({
        id: flexBookId,
        source_id: 'custom',
        external_id: flexBookId,
        title: title,
        title_dari: language === 'fa' ? title : null,
        title_pashto: language === 'ps' ? title : null,
        description: `Custom FlexBook created for ${language} learners`,
        subject_id: 'custom',
        grade_level: 'mixed',
        content_type: 'article',
        difficulty: 'intermediate',
        tags: ['custom', 'flexbook', language],
        is_processed: true,
        is_approved: true,
        quality_score: 0.9,
        language_available: JSON.stringify([language]),
        license_type: 'CC-BY-NC-SA',
        attribution: 'Custom compilation from CK-12 content',
        metadata: JSON.stringify({
          type: 'custom-flexbook',
          chapters: chapters,
          language: language
        })
      });

      this.emit('custom-flexbook-created', { flexBookId, title, language });
      
      return flexBookId;
    } catch (error) {
      logger.error('Failed to create custom FlexBook:', error);
      throw error;
    }
  }

  /**
   * Integrate Flexi AI for tutoring
   */
  async getFlexiAIResponse(question: string, subject: string, gradeLevel: string): Promise<string> {
    try {
      // This would integrate with CK-12's Flexi AI
      // For demonstration, return a placeholder response
      
      const prompt = `Subject: ${subject}, Grade: ${gradeLevel}, Question: ${question}`;
      
      // In production, this would call CK-12's API
      const response = `I can help you with ${subject}. ${question} is an interesting question. Let me break it down for you...`;
      
      return response;
    } catch (error) {
      logger.error('Failed to get Flexi AI response:', error);
      throw error;
    }
  }
}

export const ck12Service = new CK12Service();