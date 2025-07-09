import React from 'react';
import { useTranslation } from 'react-i18next';
import { GeometricCard } from './GeometricCard';
import { MathematicalPattern } from './MathematicalPattern';

interface CourseData {
  id: string;
  title: {
    en: string;
    fa: string;
    ps: string;
  };
  subject: string;
  gradeLevel: string;
  ibProgram?: 'PYP' | 'MYP' | 'DP';
  progress: number;
  totalLessons: number;
  completedLessons: number;
  duration: string;
  instructor: string;
  thumbnail?: string;
  hasOfflineContent: boolean;
}

interface CourseCardProps {
  course: CourseData;
  onSelect: (courseId: string) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, onSelect }) => {
  const { t, i18n } = useTranslation();
  
  // Subject colors based on Afghan flag and cultural colors
  const subjectColors = {
    mathematics: '#D32011',     // Red
    science: '#007A36',         // Green
    languages: '#26619C',       // Lapis
    history: '#8B0000',         // Burgundy
    arts: '#FF8C00',           // Saffron
    technology: '#696969',      // Mountain gray
  };

  const getSubjectColor = (subject: string) => {
    const key = subject.toLowerCase();
    return subjectColors[key as keyof typeof subjectColors] || '#2C2C2C';
  };

  return (
    <GeometricCard pattern="angled" patternType="diamond" className="course-card">
      {/* Newspaper-style header */}
      <div className="newspaper-header mb-4">
        <span className="subject" style={{ color: getSubjectColor(course.subject) }}>
          {t(`subjects.${course.subject}`)}
        </span>
        <span className="edition">
          {t('grade')} {course.gradeLevel} 
          {course.ibProgram && ` • ${course.ibProgram}`}
        </span>
      </div>
      
      {/* Course title in vintage style */}
      <h3 className="article-title">
        {course.title[i18n.language as keyof typeof course.title] || course.title.en}
      </h3>
      
      {/* Course metadata */}
      <div className="article-meta">
        <span>{course.instructor}</span>
        <span className="mx-2">•</span>
        <span>{course.duration}</span>
        <span className="mx-2">•</span>
        <span>{course.totalLessons} {t('lessons')}</span>
      </div>
      
      {/* Progress indicator with geometric design */}
      <div className="progress-container">
        <div className="progress-bar geometric-progress">
          <div 
            className="progress-fill"
            style={{ width: `${course.progress}%` }}
          />
        </div>
        <span className="progress-text">
          {course.completedLessons}/{course.totalLessons} {t('completed')} ({course.progress}%)
        </span>
      </div>
      
      {/* Action buttons */}
      <div className="mt-4 flex gap-2">
        <button 
          className="vintage-button primary flex-1"
          onClick={() => onSelect(course.id)}
        >
          {course.progress > 0 ? t('continue') : t('start')}
        </button>
        
        {course.hasOfflineContent && (
          <button 
            className="vintage-button secondary"
            aria-label={t('downloadForOffline')}
          >
            📥
          </button>
        )}
      </div>
      
      {/* Mathematical pattern overlay */}
      <MathematicalPattern type="fibonacci" className="opacity-5" />
    </GeometricCard>
  );
};