import { Request, Response } from 'express';
import { db } from '../database/index.js';
import { v4 as uuidv4 } from 'uuid';

export const courseController = {
  getAllCourses: async (req: Request, res: Response) => {
    try {
      const { grade, subject, search, limit = 20, offset = 0 } = req.query;
      
      // Build the query
      let query = db('courses')
        .select(
          'courses.id',
          'courses.title',
          'courses.title_dari',
          'courses.title_pashto',
          'courses.description',
          'courses.description_dari',
          'courses.description_pashto',
          'courses.grade_level',
          'courses.difficulty',
          'courses.estimated_duration_hours',
          'courses.thumbnail_url',
          'courses.is_free',
          'courses.is_featured',
          'courses.enrollment_count',
          'courses.rating_average',
          'courses.rating_count',
          'subjects.id as subject_id',
          'subjects.name as subject_name',
          'subjects.color as subject_color',
          'subjects.icon as subject_icon'
        )
        .leftJoin('subjects', 'courses.subject_id', 'subjects.id')
        .where('courses.is_published', true)
        .orderBy('courses.created_at', 'desc');

      // Apply filters
      if (grade) {
        query = query.where('courses.grade_level', grade);
      }

      if (subject) {
        query = query.where('subjects.name', 'ilike', `%${subject}%`);
      }

      if (search) {
        query = query.where(function() {
          this.where('courses.title', 'ilike', `%${search}%`)
            .orWhere('courses.description', 'ilike', `%${search}%`)
            .orWhere('courses.title_dari', 'ilike', `%${search}%`)
            .orWhere('courses.title_pashto', 'ilike', `%${search}%`);
        });
      }

      // Get total count
      const countQuery = query.clone();
      const [{ count }] = await countQuery.count('* as count');

      // Apply pagination
      const courses = await query
        .limit(Number(limit))
        .offset(Number(offset));

      // Transform the data to match frontend expectations
      const transformedCourses = courses.map(course => ({
        id: course.id,
        title: {
          en: course.title,
          fa: course.title_dari || course.title,
          ps: course.title_pashto || course.title
        },
        description: course.description,
        subject: course.subject_name?.toLowerCase() || 'general',
        gradeLevel: parseInt(course.grade_level) || 0,
        thumbnail: course.thumbnail_url,
        progress: 0, // This would come from user_progress table
        totalLessons: 0, // This would need to be calculated from lessons table
        completedLessons: 0, // This would come from user_progress table
        duration: course.estimated_duration_hours ? `${course.estimated_duration_hours} hours` : null,
        instructor: 'TBD', // This would come from a join with users table
        difficulty: course.difficulty,
        isFree: course.is_free,
        isFeatured: course.is_featured,
        enrollmentCount: course.enrollment_count,
        rating: course.rating_average,
        hasOfflineContent: false, // This would come from content_items table
        subjectColor: course.subject_color,
        subjectIcon: course.subject_icon
      }));

      res.json({
        success: true,
        courses: transformedCourses,
        total: Number(count),
        limit: Number(limit),
        offset: Number(offset)
      });
    } catch (error) {
      console.error('Error fetching courses:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch courses',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  searchCourses: async (req: Request, res: Response) => {
    const { q, limit = 10 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    try {
      const courses = await db('courses')
        .select(
          'courses.id',
          'courses.title',
          'courses.title_dari',
          'courses.title_pashto',
          'courses.description',
          'courses.grade_level',
          'courses.thumbnail_url',
          'subjects.name as subject_name'
        )
        .leftJoin('subjects', 'courses.subject_id', 'subjects.id')
        .where('courses.is_published', true)
        .where(function() {
          this.where('courses.title', 'ilike', `%${q}%`)
            .orWhere('courses.description', 'ilike', `%${q}%`)
            .orWhere('courses.title_dari', 'ilike', `%${q}%`)
            .orWhere('courses.title_pashto', 'ilike', `%${q}%`);
        })
        .limit(Number(limit));

      res.json({
        success: true,
        courses,
        total: courses.length,
        query: q
      });
    } catch (error) {
      console.error('Search courses error:', error);
      res.status(500).json({
        success: false,
        message: 'Search failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  getCategories: async (req: Request, res: Response) => {
    try {
      const subjects = await db('subjects')
        .select('id', 'name', 'name_dari', 'name_pashto', 'description', 'icon', 'color')
        .where('is_active', true)
        .orderBy('sort_order', 'asc');

      // Get course count for each subject
      const subjectsWithCount = await Promise.all(
        subjects.map(async (subject) => {
          const [{ count }] = await db('courses')
            .where('subject_id', subject.id)
            .where('is_published', true)
            .count('* as count');

          return {
            id: subject.id,
            name: subject.name,
            nameDari: subject.name_dari,
            namePashto: subject.name_pashto,
            description: subject.description,
            icon: subject.icon,
            color: subject.color,
            courseCount: Number(count)
          };
        })
      );

      res.json({
        success: true,
        categories: subjectsWithCount
      });
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch categories',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  getCourseById: async (req: Request, res: Response) => {
    const { id } = req.params;
    
    try {
      const course = await db('courses')
        .select(
          'courses.*',
          'subjects.name as subject_name',
          'subjects.color as subject_color',
          'subjects.icon as subject_icon',
          'users.name as instructor_name'
        )
        .leftJoin('subjects', 'courses.subject_id', 'subjects.id')
        .leftJoin('users', 'courses.created_by', 'users.id')
        .where('courses.id', id)
        .where('courses.is_published', true)
        .first();

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      // Get lesson count
      const [{ count: lessonCount }] = await db('lessons')
        .where('course_id', id)
        .count('* as count');

      const transformedCourse = {
        id: course.id,
        title: {
          en: course.title,
          fa: course.title_dari || course.title,
          ps: course.title_pashto || course.title
        },
        description: {
          en: course.description,
          fa: course.description_dari || course.description,
          ps: course.description_pashto || course.description
        },
        subject: course.subject_name?.toLowerCase() || 'general',
        gradeLevel: course.grade_level,
        difficulty: course.difficulty,
        thumbnail: course.thumbnail_url,
        previewVideo: course.preview_video_url,
        learningObjectives: course.learning_objectives,
        prerequisites: course.prerequisites,
        price: course.price,
        isFree: course.is_free,
        instructor: course.instructor_name,
        totalLessons: Number(lessonCount),
        estimatedDuration: course.estimated_duration_hours,
        enrollmentCount: course.enrollment_count,
        rating: {
          average: course.rating_average,
          count: course.rating_count
        },
        metadata: course.metadata
      };

      res.json({
        success: true,
        course: transformedCourse
      });
    } catch (error) {
      console.error('Get course by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch course',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  enrollInCourse: async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = (req as any).user?.id; // This would come from auth middleware
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    try {
      // Check if already enrolled
      const existingEnrollment = await db('user_courses')
        .where('user_id', userId)
        .where('course_id', id)
        .first();

      if (existingEnrollment) {
        return res.status(400).json({
          success: false,
          message: 'Already enrolled in this course'
        });
      }

      // Create enrollment
      await db('user_courses').insert({
        id: uuidv4(),
        user_id: userId,
        course_id: id,
        enrolled_at: new Date(),
        status: 'active'
      });

      // Update enrollment count
      await db('courses')
        .where('id', id)
        .increment('enrollment_count', 1);

      res.json({
        success: true,
        message: 'Successfully enrolled in course',
        courseId: id
      });
    } catch (error) {
      console.error('Enroll in course error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to enroll in course',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  unenrollFromCourse: async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    try {
      const result = await db('user_courses')
        .where('user_id', userId)
        .where('course_id', id)
        .del();

      if (result === 0) {
        return res.status(404).json({
          success: false,
          message: 'Enrollment not found'
        });
      }

      // Update enrollment count
      await db('courses')
        .where('id', id)
        .decrement('enrollment_count', 1);

      res.json({
        success: true,
        message: 'Successfully unenrolled from course',
        courseId: id
      });
    } catch (error) {
      console.error('Unenroll from course error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to unenroll from course',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  getCourseLessons: async (req: Request, res: Response) => {
    const { id } = req.params;
    
    try {
      const lessons = await db('lessons')
        .select('*')
        .where('course_id', id)
        .orderBy('order', 'asc');

      res.json({
        success: true,
        lessons,
        total: lessons.length
      });
    } catch (error) {
      console.error('Get course lessons error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch lessons',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  getCourseProgress: async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    try {
      const progress = await db('user_progress')
        .where('user_id', userId)
        .where('course_id', id)
        .first();

      if (!progress) {
        return res.json({
          success: true,
          courseId: id,
          progress: {
            completedLessons: 0,
            totalLessons: 0,
            percentComplete: 0,
            lastAccessedAt: null,
            timeSpent: 0
          }
        });
      }

      res.json({
        success: true,
        courseId: id,
        progress: {
          completedLessons: progress.completed_lessons || 0,
          totalLessons: progress.total_lessons || 0,
          percentComplete: progress.progress_percentage || 0,
          lastAccessedAt: progress.last_accessed_at,
          timeSpent: progress.time_spent_seconds || 0
        }
      });
    } catch (error) {
      console.error('Get course progress error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch progress',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },
};