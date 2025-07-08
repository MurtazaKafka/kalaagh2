import axios from 'axios';
import crypto from 'crypto';
import { EventEmitter } from 'events';
import { promises as fs, createWriteStream } from 'fs';
import path from 'path';
import { db } from '../database';
import { logger } from '../utils/logger';
import { contentDownloader } from './ContentDownloaderService';

interface CodeOrgCourse {
  id: string;
  name: string;
  description: string;
  grade_levels: string[];
  course_type: 'cs_fundamentals' | 'cs_discoveries' | 'cs_principles' | 'hour_of_code';
  duration_hours: number;
  lessons: CodeOrgLesson[];
  standards: string[];
}

interface CodeOrgLesson {
  id: string;
  name: string;
  description: string;
  activities: CodeOrgActivity[];
  unplugged?: boolean;
  duration_minutes: number;
}

interface CodeOrgActivity {
  id: string;
  name: string;
  type: 'video' | 'puzzle' | 'unplugged' | 'assessment';
  instructions: string;
  tips?: string;
}

export class CodeOrgService extends EventEmitter {
  private baseUrl = 'https://code.org';
  private studioUrl = 'https://studio.code.org';
  
  // Course mappings to IB programmes
  private courseMappings = {
    'coursea-2022': { grades: ['K'], programme: 'PYP', name: 'CS Fundamentals A' },
    'courseb-2022': { grades: ['1'], programme: 'PYP', name: 'CS Fundamentals B' },
    'coursec-2022': { grades: ['2'], programme: 'PYP', name: 'CS Fundamentals C' },
    'coursed-2022': { grades: ['3'], programme: 'PYP', name: 'CS Fundamentals D' },
    'coursee-2022': { grades: ['4'], programme: 'PYP', name: 'CS Fundamentals E' },
    'coursef-2022': { grades: ['5'], programme: 'PYP', name: 'CS Fundamentals F' },
    'csd': { grades: ['6', '7', '8'], programme: 'MYP', name: 'CS Discoveries' },
    'csp': { grades: ['9', '10', '11', '12'], programme: 'DP', name: 'CS Principles' }
  };

  // Unplugged activities that work offline
  private unpluggedActivities = [
    {
      name: 'Binary Bracelets',
      description: 'Learn binary numbers by making bracelets',
      grades: ['3', '4', '5'],
      duration: 45
    },
    {
      name: 'Graph Paper Programming',
      description: 'Program your friends using graph paper',
      grades: ['K', '1', '2'],
      duration: 30
    },
    {
      name: 'Algorithms: Tangram',
      description: 'Use tangram pieces to understand algorithms',
      grades: ['2', '3', '4'],
      duration: 40
    },
    {
      name: 'Conditionals with Cards',
      description: 'Learn if-then logic with playing cards',
      grades: ['5', '6', '7'],
      duration: 45
    },
    {
      name: 'Internet Simulator',
      description: 'Simulate internet packets with string and paper',
      grades: ['9', '10', '11', '12'],
      duration: 60
    }
  ];

  constructor() {
    super();
  }

  /**
   * Import Code.org courses
   */
  async importCourses(gradeLevel?: string): Promise<void> {
    try {
      logger.info(`Importing Code.org courses${gradeLevel ? ` for grade ${gradeLevel}` : ''}`);
      
      // Get or create content source
      let source = await db('content_sources')
        .where('name', 'Code.org')
        .first();
      
      if (!source) {
        const [newSource] = await db('content_sources').insert({
          id: crypto.randomUUID(),
          name: 'Code.org',
          base_url: this.baseUrl,
          is_active: true,
          metadata: { 
            type: 'computer-science-curriculum',
            license: 'CC-BY-NC-SA',
            lti_support: true
          }
        }).returning('*');
        source = newSource;
      }

      // Import courses based on grade level
      const coursesToImport = gradeLevel 
        ? Object.entries(this.courseMappings).filter(([_, info]) => 
            info.grades.includes(gradeLevel))
        : Object.entries(this.courseMappings);

      for (const [courseId, courseInfo] of coursesToImport) {
        await this.importCourse(courseId, courseInfo, source.id);
      }

      // Import unplugged activities
      await this.importUnpluggedActivities(source.id, gradeLevel);

      logger.info(`Imported Code.org courses successfully`);
    } catch (error) {
      logger.error('Failed to import Code.org courses:', error);
      throw error;
    }
  }

  /**
   * Import a single course
   */
  private async importCourse(
    courseId: string,
    courseInfo: any,
    sourceId: string
  ): Promise<void> {
    try {
      // Check if already imported
      const existing = await db('content_items')
        .where('source_id', sourceId)
        .where('external_id', courseId)
        .first();

      if (existing) {
        logger.debug(`Course already imported: ${courseInfo.name}`);
        return;
      }

      // Get Computer Science subject
      const subject = await db('subjects')
        .where('name', 'Computer Science')
        .first();

      if (!subject) {
        logger.error('Computer Science subject not found');
        return;
      }

      // Create content item for course
      const [contentItem] = await db('content_items').insert({
        id: crypto.randomUUID(),
        source_id: sourceId,
        external_id: courseId,
        title: courseInfo.name,
        description: this.getCourseDescription(courseId),
        subject_id: subject.id,
        grade_level: courseInfo.grades[0],
        content_type: 'interactive',
        difficulty: this.getDifficulty(courseInfo.programme),
        duration_seconds: this.getCourseDuration(courseId),
        tags: ['coding', 'computer-science', 'code.org', courseId],
        learning_objectives: this.getCourseLearningObjectives(courseId),
        is_processed: false,
        is_approved: false,
        quality_score: 0.9,
        ib_programme: courseInfo.programme,
        ib_unit: this.getIBUnit(courseInfo.programme),
        offline_available: false,
        requires_internet: true,
        language_available: JSON.stringify(['en']),
        license_type: 'CC-BY-NC-SA',
        attribution: 'Code.org',
        author: 'Code.org',
        source_url: `${this.baseUrl}/curriculum/${courseId}`,
        interactive: true,
        interactive_data: JSON.stringify({
          type: 'code.org-course',
          courseId: courseId,
          hasUnplugged: true,
          ltiEnabled: true
        }),
        metadata: JSON.stringify({
          grades: courseInfo.grades,
          programme: courseInfo.programme,
          courseType: this.getCourseType(courseId)
        })
      }).returning('*');

      // Queue for offline content download
      await this.queueOfflineContent(contentItem.id, courseId);

      this.emit('course-imported', { 
        contentId: contentItem.id, 
        courseId: courseId,
        name: courseInfo.name 
      });

    } catch (error) {
      logger.error(`Failed to import course ${courseId}:`, error);
    }
  }

  /**
   * Import unplugged activities
   */
  private async importUnpluggedActivities(sourceId: string, gradeLevel?: string): Promise<void> {
    const activities = gradeLevel
      ? this.unpluggedActivities.filter(a => a.grades.includes(gradeLevel))
      : this.unpluggedActivities;

    for (const activity of activities) {
      await this.importUnpluggedActivity(activity, sourceId);
    }
  }

  /**
   * Import a single unplugged activity
   */
  private async importUnpluggedActivity(activity: any, sourceId: string): Promise<void> {
    try {
      const activityId = activity.name.toLowerCase().replace(/\s+/g, '-');
      
      // Check if already imported
      const existing = await db('content_items')
        .where('source_id', sourceId)
        .where('external_id', `unplugged-${activityId}`)
        .first();

      if (existing) {
        return;
      }

      // Get Computer Science subject
      const subject = await db('subjects')
        .where('name', 'Computer Science')
        .first();

      if (!subject) {
        return;
      }

      const gradeLevel = activity.grades[Math.floor(activity.grades.length / 2)];
      const ibProgramme = this.mapToIBProgramme(gradeLevel);

      // Create content item
      await db('content_items').insert({
        id: crypto.randomUUID(),
        source_id: sourceId,
        external_id: `unplugged-${activityId}`,
        title: `Unplugged: ${activity.name}`,
        description: activity.description,
        subject_id: subject.id,
        grade_level: gradeLevel,
        content_type: 'interactive',
        difficulty: 'beginner',
        duration_seconds: activity.duration * 60,
        tags: ['unplugged', 'offline', 'computer-science', 'activity'],
        learning_objectives: [
          'Understand computer science concepts without computers',
          'Develop computational thinking skills',
          'Collaborate with peers on problem-solving'
        ],
        is_processed: true,
        is_approved: true,
        quality_score: 0.95,
        ib_programme: ibProgramme,
        offline_available: true,
        requires_internet: false,
        language_available: JSON.stringify(['en']),
        license_type: 'CC-BY-NC-SA',
        attribution: 'Code.org',
        author: 'Code.org',
        interactive: true,
        interactive_data: JSON.stringify({
          type: 'unplugged-activity',
          materials: this.getActivityMaterials(activityId),
          printable: true
        })
      });

      logger.info(`Imported unplugged activity: ${activity.name}`);
    } catch (error) {
      logger.error(`Failed to import unplugged activity ${activity.name}:`, error);
    }
  }

  /**
   * Get course description
   */
  private getCourseDescription(courseId: string): string {
    const descriptions: Record<string, string> = {
      'coursea-2022': 'Introduction to computer science for kindergarten students using visual blocks',
      'courseb-2022': 'Building on concepts with sequences and loops for 1st grade',
      'coursec-2022': 'Expanding to events and conditionals for 2nd grade',
      'coursed-2022': 'Advanced concepts including nested loops for 3rd grade',
      'coursee-2022': 'Functions and parameters introduced for 4th grade',
      'coursef-2022': 'Complex problem solving and algorithms for 5th grade',
      'csd': 'Web development, games, and apps for middle school',
      'csp': 'AP Computer Science Principles for high school'
    };

    return descriptions[courseId] || 'Computer science curriculum from Code.org';
  }

  /**
   * Get course duration in seconds
   */
  private getCourseDuration(courseId: string): number {
    const durations: Record<string, number> = {
      'coursea-2022': 15 * 3600, // 15 hours
      'courseb-2022': 15 * 3600,
      'coursec-2022': 20 * 3600,
      'coursed-2022': 20 * 3600,
      'coursee-2022': 25 * 3600,
      'coursef-2022': 25 * 3600,
      'csd': 75 * 3600, // Full semester
      'csp': 120 * 3600 // Full year
    };

    return durations[courseId] || 20 * 3600;
  }

  /**
   * Get course learning objectives
   */
  private getCourseLearningObjectives(courseId: string): string[] {
    const baseObjectives = [
      'Develop computational thinking skills',
      'Learn to code using visual blocks or text',
      'Solve problems systematically',
      'Create interactive projects'
    ];

    if (courseId.includes('csd')) {
      baseObjectives.push('Build websites and web applications');
      baseObjectives.push('Design and develop games');
    } else if (courseId.includes('csp')) {
      baseObjectives.push('Understand computer science principles');
      baseObjectives.push('Prepare for AP CS Principles exam');
      baseObjectives.push('Explore impacts of computing');
    }

    return baseObjectives;
  }

  /**
   * Get difficulty level
   */
  private getDifficulty(programme: string): 'beginner' | 'intermediate' | 'advanced' {
    switch (programme) {
      case 'PYP': return 'beginner';
      case 'MYP': return 'intermediate';
      case 'DP': return 'advanced';
      default: return 'intermediate';
    }
  }

  /**
   * Get IB unit mapping
   */
  private getIBUnit(programme: string): string {
    switch (programme) {
      case 'PYP': return 'PYP.Technology.DigitalCitizenship';
      case 'MYP': return 'MYP.DesignTechnology.DigitalDesign';
      case 'DP': return 'DP.ComputerScience.Programming';
      default: return 'Technology.ComputerScience';
    }
  }

  /**
   * Get course type
   */
  private getCourseType(courseId: string): string {
    if (courseId.includes('course')) return 'cs_fundamentals';
    if (courseId === 'csd') return 'cs_discoveries';
    if (courseId === 'csp') return 'cs_principles';
    return 'general';
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
   * Get activity materials
   */
  private getActivityMaterials(activityId: string): string[] {
    const materials: Record<string, string[]> = {
      'binary-bracelets': ['Beads or stickers', 'String', 'Binary decoder cards'],
      'graph-paper-programming': ['Graph paper', 'Markers', 'Algorithm cards'],
      'algorithms-tangram': ['Tangram pieces', 'Pattern cards', 'Instructions'],
      'conditionals-with-cards': ['Playing cards', 'Conditional rule cards'],
      'internet-simulator': ['String or yarn', 'Paper', 'Message cards']
    };

    return materials[activityId] || ['Paper', 'Pencils'];
  }

  /**
   * Queue offline content download
   */
  private async queueOfflineContent(contentId: string, courseId: string): Promise<void> {
    // Download lesson plans and unplugged activities as PDFs
    const pdfUrl = `${this.baseUrl}/curriculum/${courseId}/resources`;
    
    await contentDownloader.queueDownload({
      userId: 'system',
      contentId: contentId,
      quality: 'high',
      priority: 'medium'
    });
  }

  /**
   * Setup LTI integration
   */
  async setupLTI(
    consumerKey: string,
    sharedSecret: string,
    schoolId: string
  ): Promise<any> {
    try {
      // Store LTI credentials securely
      const ltiConfig = {
        consumer_key: consumerKey,
        shared_secret: sharedSecret,
        school_id: schoolId,
        launch_url: `${this.studioUrl}/lti/launch`,
        config_url: `${this.studioUrl}/lti/config.xml`
      };

      // Save to database
      await db('lti_configurations').insert({
        id: crypto.randomUUID(),
        provider: 'code.org',
        school_id: schoolId,
        config: JSON.stringify(ltiConfig),
        created_at: new Date()
      });

      return {
        success: true,
        launchUrl: ltiConfig.launch_url,
        configUrl: ltiConfig.config_url
      };
    } catch (error) {
      logger.error('Failed to setup Code.org LTI:', error);
      throw error;
    }
  }

  /**
   * Generate progress report
   */
  async generateProgressReport(userId: string, courseId: string): Promise<any> {
    // This would integrate with Code.org's progress API
    // For now, return sample data
    return {
      userId,
      courseId,
      completedLessons: 5,
      totalLessons: 20,
      currentLesson: 'Loops and Patterns',
      achievements: ['First Program', 'Loop Master', 'Debugger'],
      timeSpent: 300, // minutes
      lastActive: new Date()
    };
  }

  /**
   * Download unplugged activity PDFs
   */
  async downloadUnpluggedPDFs(outputDir: string): Promise<void> {
    await fs.mkdir(outputDir, { recursive: true });

    const pdfUrls = [
      'https://code.org/curriculum/course1/2/Teacher.pdf',
      'https://code.org/curriculum/course2/1/Teacher.pdf',
      'https://code.org/curriculum/course3/1/Teacher.pdf'
    ];

    for (const url of pdfUrls) {
      try {
        const filename = path.basename(url);
        const response = await axios.get(url, { responseType: 'stream' });
        const writer = createWriteStream(path.join(outputDir, filename));
        
        response.data.pipe(writer);
        
        await new Promise<void>((resolve, reject) => {
          writer.on('finish', () => resolve());
          writer.on('error', reject);
        });

        logger.info(`Downloaded unplugged PDF: ${filename}`);
      } catch (error) {
        logger.error(`Failed to download PDF from ${url}:`, error);
      }
    }
  }
}

export const codeOrgService = new CodeOrgService();