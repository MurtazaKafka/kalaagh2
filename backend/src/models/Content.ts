import { Knex } from 'knex';

export interface ContentSource {
  id: string;
  name: string;
  baseUrl: string;
  apiKey?: string;
  isActive: boolean;
  lastSyncAt?: Date;
  totalContent: number;
  importedContent: number;
  metadata?: any;
}

export interface ContentItem {
  id: string;
  sourceId: string;
  externalId: string;
  title: string;
  titleDari?: string;
  titlePashto?: string;
  description?: string;
  descriptionDari?: string;
  descriptionPashto?: string;
  subjectId: string;
  gradeLevel: string;
  contentType: 'video' | 'article' | 'exercise' | 'interactive';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration?: number; // in seconds
  videoUrl?: string;
  thumbnailUrl?: string;
  subtitles?: SubtitleTrack[];
  transcript?: string;
  transcriptDari?: string;
  transcriptPashto?: string;
  tags: string[];
  prerequisites: string[];
  learningObjectives: string[];
  isProcessed: boolean;
  isApproved: boolean;
  qualityScore?: number;
  reviewNotes?: string;
  importedAt: Date;
  lastUpdatedAt: Date;
  metadata?: any;
}

export interface SubtitleTrack {
  language: string;
  url: string;
  isGenerated: boolean;
}

export interface ContentReview {
  id: string;
  contentId: string;
  reviewerId: string;
  status: 'pending' | 'approved' | 'rejected' | 'needs_revision';
  qualityScore: number;
  educationalValue: number;
  culturalAppropriateness: number;
  technicalQuality: number;
  notes: string;
  suggestions: string[];
  reviewedAt: Date;
}

export interface CurriculumMapping {
  id: string;
  contentId: string;
  subjectId: string;
  gradeLevel: string;
  unit: string;
  chapter: string;
  lesson: string;
  orderInSequence: number;
  isCore: boolean;
  estimatedTimeHours: number;
  prerequisites: string[];
  learningOutcomes: string[];
}

export class ContentModel {
  constructor(private db: Knex) {}

  // Content Sources Management
  async createContentSource(source: Omit<ContentSource, 'id'>): Promise<ContentSource> {
    const [id] = await this.db('content_sources').insert(source).returning('id');
    return this.getContentSource(id);
  }

  async getContentSource(id: string): Promise<ContentSource | null> {
    return this.db('content_sources').where({ id }).first();
  }

  async getContentSources(isActive?: boolean): Promise<ContentSource[]> {
    const query = this.db('content_sources');
    if (isActive !== undefined) {
      query.where({ isActive });
    }
    return query.orderBy('name');
  }

  async updateContentSource(id: string, updates: Partial<ContentSource>): Promise<ContentSource> {
    await this.db('content_sources').where({ id }).update(updates);
    return this.getContentSource(id);
  }

  // Content Items Management
  async createContentItem(item: Omit<ContentItem, 'id'>): Promise<ContentItem> {
    const [id] = await this.db('content_items').insert(item).returning('id');
    return this.getContentItem(id);
  }

  async getContentItem(id: string): Promise<ContentItem | null> {
    return this.db('content_items').where({ id }).first();
  }

  async getContentByExternalId(sourceId: string, externalId: string): Promise<ContentItem | null> {
    return this.db('content_items').where({ sourceId, externalId }).first();
  }

  async getContentItems(filters: {
    sourceId?: string;
    subjectId?: string;
    gradeLevel?: string;
    contentType?: string;
    isProcessed?: boolean;
    isApproved?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ items: ContentItem[]; total: number }> {
    const query = this.db('content_items');
    
    if (filters.sourceId) query.where('sourceId', filters.sourceId);
    if (filters.subjectId) query.where('subjectId', filters.subjectId);
    if (filters.gradeLevel) query.where('gradeLevel', filters.gradeLevel);
    if (filters.contentType) query.where('contentType', filters.contentType);
    if (filters.isProcessed !== undefined) query.where('isProcessed', filters.isProcessed);
    if (filters.isApproved !== undefined) query.where('isApproved', filters.isApproved);

    const total = await query.clone().count('* as count').first();
    
    if (filters.limit) query.limit(filters.limit);
    if (filters.offset) query.offset(filters.offset);
    
    const items = await query.orderBy('importedAt', 'desc');
    
    return {
      items,
      total: parseInt(total?.count as string) || 0
    };
  }

  async updateContentItem(id: string, updates: Partial<ContentItem>): Promise<ContentItem> {
    await this.db('content_items').where({ id }).update(updates);
    return this.getContentItem(id);
  }

  async deleteContentItem(id: string): Promise<void> {
    await this.db('content_items').where({ id }).del();
  }

  // Content Review System
  async createContentReview(review: Omit<ContentReview, 'id'>): Promise<ContentReview> {
    const [id] = await this.db('content_reviews').insert(review).returning('id');
    return this.getContentReview(id);
  }

  async getContentReview(id: string): Promise<ContentReview | null> {
    return this.db('content_reviews').where({ id }).first();
  }

  async getContentReviews(contentId: string): Promise<ContentReview[]> {
    return this.db('content_reviews')
      .where({ contentId })
      .orderBy('reviewedAt', 'desc');
  }

  async getPendingReviews(reviewerId?: string): Promise<ContentReview[]> {
    const query = this.db('content_reviews').where({ status: 'pending' });
    if (reviewerId) query.where({ reviewerId });
    return query.orderBy('reviewedAt', 'asc');
  }

  // Curriculum Mapping
  async createCurriculumMapping(mapping: Omit<CurriculumMapping, 'id'>): Promise<CurriculumMapping> {
    const [id] = await this.db('curriculum_mappings').insert(mapping).returning('id');
    return this.getCurriculumMapping(id);
  }

  async getCurriculumMapping(id: string): Promise<CurriculumMapping | null> {
    return this.db('curriculum_mappings').where({ id }).first();
  }

  async getCurriculumMappings(filters: {
    subjectId?: string;
    gradeLevel?: string;
    unit?: string;
  }): Promise<CurriculumMapping[]> {
    const query = this.db('curriculum_mappings');
    
    if (filters.subjectId) query.where('subjectId', filters.subjectId);
    if (filters.gradeLevel) query.where('gradeLevel', filters.gradeLevel);
    if (filters.unit) query.where('unit', filters.unit);
    
    return query.orderBy(['gradeLevel', 'orderInSequence']);
  }

  // Search and Analytics
  async searchContent(searchTerm: string, filters: {
    subjectId?: string;
    gradeLevel?: string;
    contentType?: string;
    limit?: number;
  }): Promise<ContentItem[]> {
    const query = this.db('content_items')
      .where('isApproved', true)
      .where(function() {
        this.where('title', 'like', `%${searchTerm}%`)
          .orWhere('description', 'like', `%${searchTerm}%`)
          .orWhere('tags', 'like', `%${searchTerm}%`);
      });
    
    if (filters.subjectId) query.where('subjectId', filters.subjectId);
    if (filters.gradeLevel) query.where('gradeLevel', filters.gradeLevel);
    if (filters.contentType) query.where('contentType', filters.contentType);
    
    if (filters.limit) query.limit(filters.limit);
    
    return query.orderBy('qualityScore', 'desc');
  }

  async getContentStats(): Promise<{
    totalContent: number;
    approvedContent: number;
    pendingReview: number;
    bySubject: Record<string, number>;
    byGrade: Record<string, number>;
    byType: Record<string, number>;
  }> {
    const totalContent = await this.db('content_items').count('* as count').first();
    const approvedContent = await this.db('content_items')
      .where('is_approved', true)
      .count('* as count')
      .first();
    const pendingReview = await this.db('content_items')
      .where('is_processed', false)
      .count('* as count')
      .first();

    const bySubject = await this.db('content_items')
      .select('subject_id')
      .count('* as count')
      .groupBy('subject_id');

    const byGrade = await this.db('content_items')
      .select('grade_level')
      .count('* as count')
      .groupBy('grade_level');

    const byType = await this.db('content_items')
      .select('content_type')
      .count('* as count')
      .groupBy('content_type');

    return {
      totalContent: parseInt(totalContent?.count as string) || 0,
      approvedContent: parseInt(approvedContent?.count as string) || 0,
      pendingReview: parseInt(pendingReview?.count as string) || 0,
      bySubject: Object.fromEntries(bySubject.map(s => [s.subject_id, parseInt(s.count as string)])),
      byGrade: Object.fromEntries(byGrade.map(g => [g.grade_level, parseInt(g.count as string)])),
      byType: Object.fromEntries(byType.map(t => [t.content_type, parseInt(t.count as string)]))
    };
  }
}