import React, { useEffect } from 'react';
import { useCourseStore } from '../../stores/courseStore';
import { useTranslation } from 'react-i18next';
import { GeometricCard } from '../vintage/GeometricCard';
import { MathematicalPattern } from '../vintage/MathematicalPattern';
import { AfghanPattern } from '../vintage/AfghanPattern';

export const CourseList = () => {
  const { courses, isLoading, error, fetchCourses, selectCourse } = useCourseStore();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Subject colors based on Afghan flag and cultural colors
  const subjectColors = {
    mathematics: '#D32011',     // Red
    science: '#007A36',         // Green
    physics: '#007A36',         // Green
    chemistry: '#007A36',       // Green
    biology: '#007A36',         // Green
    languages: '#26619C',       // Lapis
    english: '#26619C',         // Lapis
    history: '#8B0000',         // Burgundy
    geography: '#8B0000',       // Burgundy
    arts: '#FF8C00',           // Saffron
    technology: '#696969',      // Mountain gray
    default: '#2C2C2C'         // Default ink color
  };

  const getSubjectColor = (subject: string) => {
    const key = subject.toLowerCase();
    return subjectColors[key as keyof typeof subjectColors] || subjectColors.default;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-vintage-ink border-t-transparent" />
          <p className="mt-4 text-lg">{t('loading')}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <GeometricCard pattern="trapezoid" className="bg-red-50 border-red-300">
        <div className="text-center p-6">
          <span className="text-3xl mb-4 block">⚠️</span>
          <p className="text-red-700 font-bold text-lg mb-2">{t('error')}</p>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchCourses}
            className="mt-4 vintage-button primary"
          >
            {t('retry')}
          </button>
        </div>
      </GeometricCard>
    );
  }

  if (courses.length === 0) {
    return (
      <GeometricCard pattern="hexagon" className="bg-amber-50">
        <div className="text-center p-8">
          <span className="text-4xl mb-4 block">📚</span>
          <p className="text-xl font-bold mb-2">No courses available yet</p>
          <p className="text-gray-600">Courses will appear here once they are added to the system.</p>
          <button 
            onClick={fetchCourses}
            className="mt-4 vintage-button secondary"
          >
            Refresh
          </button>
        </div>
      </GeometricCard>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <GeometricCard 
          key={course.id} 
          pattern="angled" 
          patternType="diamond" 
          className="course-card hover:shadow-lg transition-shadow cursor-pointer"
        >
          {/* Newspaper-style header */}
          <div className="newspaper-header mb-4">
            <span className="subject" style={{ color: getSubjectColor(course.subject) }}>
              {t(`subjects.${course.subject}`) || course.subject}
            </span>
            <span className="edition">
              {t('grade')} {course.gradeLevel} 
              {course.ibProgram && ` • ${course.ibProgram}`}
            </span>
          </div>
          
          {/* Course title */}
          <h3 className="article-title mb-2">
            {course.title[i18n.language as keyof typeof course.title] || course.title.en}
          </h3>
          
          {/* Course metadata */}
          {(course.instructor || course.duration || course.totalLessons) && (
            <div className="article-meta mb-4">
              {course.instructor && <span>{course.instructor}</span>}
              {course.instructor && course.duration && <span className="mx-2">•</span>}
              {course.duration && <span>{course.duration}</span>}
              {(course.instructor || course.duration) && course.totalLessons && <span className="mx-2">•</span>}
              {course.totalLessons && <span>{course.totalLessons} {t('lessons')}</span>}
            </div>
          )}
          
          {/* Progress indicator */}
          <div className="progress-container mb-4">
            <div className="progress-bar geometric-progress">
              <div 
                className="progress-fill"
                style={{ width: `${course.progress}%` }}
              />
            </div>
            <span className="progress-text">
              {course.completedLessons && course.totalLessons ? (
                `${course.completedLessons}/${course.totalLessons} ${t('completed')} (${course.progress}%)`
              ) : (
                `${course.progress}% ${t('completed')}`
              )}
            </span>
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-2">
            <button 
              className="vintage-button primary flex-1"
              onClick={() => selectCourse(course.id)}
            >
              {course.progress > 0 ? t('continue') : t('start')}
            </button>
            
            {course.hasOfflineContent && (
              <button 
                className="vintage-button secondary"
                aria-label={t('downloadForOffline')}
                title={t('downloadForOffline')}
              >
                📥
              </button>
            )}
          </div>
          
          {/* Mathematical pattern overlay */}
          <MathematicalPattern type="fibonacci" className="opacity-5" />
        </GeometricCard>
      ))}
    </div>
  );
};