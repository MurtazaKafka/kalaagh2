import axios from 'axios';
import { promises as fs, createWriteStream } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { EventEmitter } from 'events';
import { db } from '../database';
import { logger } from '../utils/logger';
import { translationService } from './TranslationService';

interface PhETSimulation {
  id: string;
  title: string;
  description: string;
  subjects: string[];
  grades: string[];
  topics: string[];
  languages: string[];
  thumbnailUrl: string;
  simulationUrl: string;
  downloadUrl: string;
  isHTML5: boolean;
  keywords: string[];
}

export class PhETService extends EventEmitter {
  private baseUrl = 'https://phet.colorado.edu';
  private apiUrl = 'https://phet.colorado.edu/services/metadata/1.2/simulations';
  private contentDir: string;
  
  // Map PhET subjects to our subjects
  private subjectMapping: Record<string, string> = {
    'physics': 'Physics',
    'chemistry': 'Chemistry',
    'biology': 'Biology',
    'earth-science': 'Earth Science',
    'math': 'Mathematics'
  };

  // Arabic language support (includes Dari/Farsi support)
  private supportedLanguages = ['en', 'ar', 'fa'];

  constructor(contentDir: string = './content/interactive/phet-simulations') {
    super();
    this.contentDir = contentDir;
  }

  /**
   * Import all PhET simulations
   */
  async importAllSimulations(): Promise<void> {
    try {
      logger.info('Starting PhET simulations import');
      
      // Get or create content source
      let source = await db('content_sources')
        .where('name', 'PhET Interactive Simulations')
        .first();
      
      if (!source) {
        const [newSource] = await db('content_sources').insert({
          id: crypto.randomUUID(),
          name: 'PhET Interactive Simulations',
          base_url: this.baseUrl,
          is_active: true,
          metadata: { 
            type: 'interactive-simulations',
            license: 'CC-BY',
            languages: this.supportedLanguages
          }
        }).returning('*');
        source = newSource;
      }

      // Fetch all simulations
      const simulations = await this.fetchSimulations();
      
      // Import each simulation
      let imported = 0;
      for (const sim of simulations) {
        if (sim.isHTML5) { // Only import HTML5 simulations for offline support
          const success = await this.importSimulation(sim, source.id);
          if (success) imported++;
        }
      }

      // Update source statistics
      await db('content_sources')
        .where('id', source.id)
        .update({
          total_content: simulations.length,
          imported_content: imported,
          last_sync_at: new Date()
        });

      logger.info(`Imported ${imported} PhET simulations`);
    } catch (error) {
      logger.error('Failed to import PhET simulations:', error);
      throw error;
    }
  }

  /**
   * Fetch simulations from PhET API
   */
  private async fetchSimulations(): Promise<PhETSimulation[]> {
    try {
      const response = await axios.get(this.apiUrl);
      const simulations: PhETSimulation[] = [];

      for (const project of response.data.projects) {
        for (const sim of project.simulations) {
          // Check if HTML5 version exists
          const isHTML5 = sim.media.some((m: any) => m.type === 'html');
          
          if (isHTML5) {
            simulations.push({
              id: sim.name,
              title: sim.localizedTitle,
              description: sim.description.en,
              subjects: this.mapSubjects(sim.subjects),
              grades: this.mapGrades(sim.gradeLevel),
              topics: sim.topics || [],
              languages: sim.supportedLanguages || ['en'],
              thumbnailUrl: sim.media.find((m: any) => m.type === 'thumbnail')?.url || '',
              simulationUrl: `${this.baseUrl}/sims/html/${sim.name}/latest/${sim.name}_en.html`,
              downloadUrl: `${this.baseUrl}/sims/html/${sim.name}/latest/${sim.name}_all.html`,
              isHTML5: true,
              keywords: sim.keywords || []
            });
          }
        }
      }

      return simulations;
    } catch (error) {
      logger.error('Failed to fetch PhET simulations:', error);
      return [];
    }
  }

  /**
   * Import a single simulation
   */
  private async importSimulation(sim: PhETSimulation, sourceId: string): Promise<boolean> {
    try {
      // Check if already imported
      const existing = await db('content_items')
        .where('source_id', sourceId)
        .where('external_id', sim.id)
        .first();

      if (existing) {
        logger.debug(`Simulation already imported: ${sim.title}`);
        return false;
      }

      // Get subject ID (use first matching subject)
      let subjectId = null;
      for (const subjectName of sim.subjects) {
        const subject = await db('subjects')
          .where('name', subjectName)
          .first();
        if (subject) {
          subjectId = subject.id;
          break;
        }
      }

      if (!subjectId) {
        logger.warn(`No matching subject found for simulation: ${sim.title}`);
        return false;
      }

      // Determine IB programme and grade level
      const gradeLevel = sim.grades[0] || '8';
      const ibProgramme = this.mapToIBProgramme(gradeLevel);

      // Create content item
      const [contentItem] = await db('content_items').insert({
        id: crypto.randomUUID(),
        source_id: sourceId,
        external_id: sim.id,
        title: sim.title,
        description: sim.description,
        subject_id: subjectId,
        grade_level: gradeLevel,
        content_type: 'interactive',
        difficulty: this.determineDifficulty(gradeLevel),
        duration_seconds: 1800, // Estimate 30 minutes
        thumbnail_url: sim.thumbnailUrl,
        tags: [...sim.topics, ...sim.keywords, 'phet', 'simulation'],
        learning_objectives: this.generateLearningObjectives(sim),
        is_processed: false,
        is_approved: false,
        quality_score: 0.95, // PhET simulations are high quality
        ib_programme: ibProgramme,
        ib_unit: this.mapToIBUnit(sim.topics),
        offline_available: false,
        requires_internet: false, // Will be false after download
        language_available: JSON.stringify(this.filterSupportedLanguages(sim.languages)),
        license_type: 'CC-BY',
        attribution: 'PhET Interactive Simulations, University of Colorado Boulder',
        author: 'PhET Team',
        source_url: sim.simulationUrl,
        interactive: true,
        interactive_data: JSON.stringify({
          type: 'phet-simulation',
          downloadUrl: sim.downloadUrl,
          supportedLanguages: sim.languages
        }),
        metadata: JSON.stringify({
          subjects: sim.subjects,
          grades: sim.grades,
          topics: sim.topics,
          keywords: sim.keywords
        })
      }).returning('*');

      // Queue for download
      await this.queueSimulationDownload(contentItem.id, sim);

      // Queue for translation if Arabic is supported
      if (sim.languages.includes('ar')) {
        await this.queueForArabicAdaptation(contentItem.id);
      }

      this.emit('simulation-imported', { 
        contentId: contentItem.id, 
        title: sim.title,
        subjects: sim.subjects 
      });

      return true;
    } catch (error) {
      logger.error(`Failed to import simulation ${sim.title}:`, error);
      return false;
    }
  }

  /**
   * Queue simulation for download
   */
  private async queueSimulationDownload(contentId: string, sim: PhETSimulation): Promise<void> {
    try {
      const downloadPath = path.join(this.contentDir, sim.id);
      await fs.mkdir(downloadPath, { recursive: true });

      // Download the all-languages HTML file
      const response = await axios.get(sim.downloadUrl, { responseType: 'stream' });
      const filePath = path.join(downloadPath, 'index.html');
      const writer = createWriteStream(filePath);

      response.data.pipe(writer);

      await new Promise<void>((resolve, reject) => {
        writer.on('finish', () => resolve());
        writer.on('error', reject);
      });

      // Update content item
      await db('content_items')
        .where('id', contentId)
        .update({
          offline_path: filePath,
          offline_available: true,
          requires_internet: false,
          download_size_mb: Math.round((await fs.stat(filePath)).size / (1024 * 1024))
        });

      logger.info(`Downloaded PhET simulation: ${sim.title}`);
    } catch (error) {
      logger.error(`Failed to download simulation ${sim.title}:`, error);
    }
  }

  /**
   * Map PhET subjects to our system
   */
  private mapSubjects(phetSubjects: string[]): string[] {
    return phetSubjects
      .map(subject => this.subjectMapping[subject.toLowerCase()])
      .filter(Boolean) as string[];
  }

  /**
   * Map grade levels
   */
  private mapGrades(phetGrades: string): string[] {
    const grades: string[] = [];
    
    if (phetGrades.includes('Elementary')) grades.push(...['K', '1', '2', '3', '4', '5']);
    if (phetGrades.includes('Middle')) grades.push(...['6', '7', '8']);
    if (phetGrades.includes('High')) grades.push(...['9', '10', '11', '12']);
    if (phetGrades.includes('University')) grades.push(...['11', '12']); // Advanced DP level
    
    return grades.length > 0 ? grades : ['8']; // Default to middle school
  }

  /**
   * Map to IB Programme
   */
  private mapToIBProgramme(gradeLevel: string): 'PYP' | 'MYP' | 'DP' {
    const grade = parseInt(gradeLevel) || 0;
    if (grade <= 5) return 'PYP';
    if (grade <= 10) return 'MYP';
    return 'DP';
  }

  /**
   * Map topics to IB Units
   */
  private mapToIBUnit(topics: string[]): string | undefined {
    const unitMappings: Record<string, string> = {
      'force': 'MYP.Physics.Forces',
      'energy': 'MYP.Physics.Energy',
      'motion': 'MYP.Physics.Motion',
      'waves': 'MYP.Physics.Waves',
      'electricity': 'MYP.Physics.Electricity',
      'atoms': 'MYP.Chemistry.AtomicStructure',
      'molecules': 'MYP.Chemistry.MolecularStructure',
      'reactions': 'MYP.Chemistry.ChemicalReactions',
      'cells': 'MYP.Biology.Cells',
      'genetics': 'MYP.Biology.Genetics',
      'ecology': 'MYP.Biology.Ecology',
      'fractions': 'MYP.Mathematics.Number',
      'algebra': 'MYP.Mathematics.AlgebraicConcepts',
      'geometry': 'MYP.Mathematics.Geometry'
    };

    for (const topic of topics) {
      const topicLower = topic.toLowerCase();
      for (const [key, unit] of Object.entries(unitMappings)) {
        if (topicLower.includes(key)) {
          return unit;
        }
      }
    }

    return undefined;
  }

  /**
   * Determine difficulty
   */
  private determineDifficulty(gradeLevel: string): 'beginner' | 'intermediate' | 'advanced' {
    const grade = parseInt(gradeLevel) || 0;
    if (grade <= 5) return 'beginner';
    if (grade <= 8) return 'intermediate';
    return 'advanced';
  }

  /**
   * Generate learning objectives
   */
  private generateLearningObjectives(sim: PhETSimulation): string[] {
    const objectives: string[] = [
      `Explore ${sim.title} through interactive simulation`,
      'Develop conceptual understanding through visualization',
      'Test hypotheses and observe outcomes',
      'Apply scientific method through experimentation'
    ];

    // Add topic-specific objectives
    if (sim.topics.some(t => t.toLowerCase().includes('force'))) {
      objectives.push('Understand the relationship between force and motion');
    }
    if (sim.topics.some(t => t.toLowerCase().includes('energy'))) {
      objectives.push('Explore energy conservation and transformation');
    }
    if (sim.topics.some(t => t.toLowerCase().includes('circuit'))) {
      objectives.push('Build and analyze electrical circuits');
    }

    return objectives.slice(0, 5);
  }

  /**
   * Filter for supported languages
   */
  private filterSupportedLanguages(languages: string[]): string[] {
    const supported = languages.filter(lang => 
      this.supportedLanguages.includes(lang) || lang === 'ar'
    );
    
    // Arabic can be adapted for Dari/Pashto
    if (supported.includes('ar') && !supported.includes('fa')) {
      supported.push('fa');
    }
    
    return supported.length > 0 ? supported : ['en'];
  }

  /**
   * Queue for Arabic to Dari/Pashto adaptation
   */
  private async queueForArabicAdaptation(contentId: string): Promise<void> {
    // Since PhET supports Arabic, we can adapt the UI for Dari speakers
    await translationService.requestCommunityTranslation(
      contentId,
      'Simulation available in Arabic - needs Dari adaptation',
      'description',
      'fa'
    );
  }

  /**
   * Create simulation activity guide
   */
  async createActivityGuide(
    simulationId: string,
    language: 'en' | 'fa' | 'ps'
  ): Promise<string> {
    const simulation = await db('content_items')
      .where('external_id', simulationId)
      .first();

    if (!simulation) {
      throw new Error('Simulation not found');
    }

    const guide = {
      title: `Activity Guide: ${simulation.title}`,
      simulation: simulation.title,
      objectives: JSON.parse(simulation.learning_objectives || '[]'),
      preActivity: [
        'Review key concepts before starting',
        'Prepare notebook for observations',
        'Form initial hypotheses'
      ],
      duringActivity: [
        'Explore all controls and parameters',
        'Record observations systematically',
        'Test different scenarios',
        'Compare results with predictions'
      ],
      postActivity: [
        'Summarize findings',
        'Discuss with classmates',
        'Apply concepts to real-world examples',
        'Complete assessment questions'
      ],
      assessmentQuestions: this.generateAssessmentQuestions(simulation),
      language: language
    };

    // Save activity guide
    const guideId = crypto.randomUUID();
    const guidePath = path.join(this.contentDir, simulationId, `guide_${language}.json`);
    
    await fs.writeFile(guidePath, JSON.stringify(guide, null, 2));

    return guideId;
  }

  /**
   * Generate assessment questions
   */
  private generateAssessmentQuestions(simulation: any): any[] {
    const topics = JSON.parse(simulation.metadata || '{}').topics || [];
    const questions: any[] = [];

    // Generic questions applicable to all simulations
    questions.push({
      type: 'open-ended',
      question: 'What did you observe when you changed the parameters?',
      points: 5
    });

    questions.push({
      type: 'prediction',
      question: 'Predict what would happen if you doubled the value of the main variable.',
      points: 5
    });

    // Topic-specific questions
    if (topics.some((t: string) => t.toLowerCase().includes('force'))) {
      questions.push({
        type: 'multiple-choice',
        question: 'What happens to acceleration when force increases?',
        options: ['Increases', 'Decreases', 'Stays the same', 'Becomes zero'],
        correct: 0,
        points: 3
      });
    }

    return questions;
  }

  /**
   * Get simulation statistics
   */
  async getSimulationStats(): Promise<any> {
    const stats = await db('content_items')
      .where('source_id', db.raw("(SELECT id FROM content_sources WHERE name = 'PhET Interactive Simulations')"))
      .select('subject_id', 'ib_programme', 'grade_level')
      .count('* as count')
      .groupBy('subject_id', 'ib_programme', 'grade_level');

    const totalSimulations = await db('content_items')
      .where('source_id', db.raw("(SELECT id FROM content_sources WHERE name = 'PhET Interactive Simulations')"))
      .count('* as total');

    return {
      total: totalSimulations[0]?.total || 0,
      bySubject: stats.filter(s => s.subject_id),
      byProgramme: stats.filter(s => s.ib_programme),
      byGrade: stats.filter(s => s.grade_level),
      languages: ['en', 'ar', 'fa'],
      offlineAvailable: await db('content_items')
        .where('source_id', db.raw("(SELECT id FROM content_sources WHERE name = 'PhET Interactive Simulations')"))
        .where('offline_available', true)
        .count('* as count')
        .first()
    };
  }
}

export const phetService = new PhETService();