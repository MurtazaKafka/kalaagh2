import React from 'react';
import { Card, Badge, Button } from '../ui';
import { theme } from '../../styles/design-system';

export interface Course {
  id: string;
  title: string;
  description: string;
  subject: string;
  grade: string;
  thumbnail?: string;
  instructor: string;
  duration: string;
  lessonsCount: number;
  completedLessons: number;
  language: 'en' | 'fa' | 'ps';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface CourseCardProps {
  course: Course;
  onEnroll?: () => void;
  onContinue?: () => void;
  enrolled?: boolean;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onEnroll,
  onContinue,
  enrolled = false,
}) => {
  const progress = enrolled ? (course.completedLessons / course.lessonsCount) * 100 : 0;

  const difficultyColors = {
    beginner: 'success',
    intermediate: 'warning',
    advanced: 'danger',
  } as const;

  const languageLabels = {
    en: 'English',
    fa: 'دری',
    ps: 'پښتو',
  };

  return (
    <Card variant="geometric" padding="none" hoverable className="overflow-hidden">
      {/* Thumbnail */}
      <div className="relative h-48 bg-gradient-to-br from-orange-100 to-amber-100 overflow-hidden">
        {course.thumbnail ? (
          <img 
            src={course.thumbnail} 
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-6xl text-orange-300 opacity-50">📚</div>
          </div>
        )}
        
        {/* Subject Badge */}
        <div className="absolute top-4 left-4">
          <Badge variant="primary" size="sm">
            {course.subject}
          </Badge>
        </div>

        {/* Language Badge */}
        <div className="absolute top-4 right-4">
          <Badge variant="secondary" size="sm">
            {languageLabels[course.language]}
          </Badge>
        </div>

        {/* Progress Bar (if enrolled) */}
        {enrolled && (
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-black bg-opacity-20">
            <div 
              className="h-full bg-gradient-to-r from-green-400 to-emerald-400 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>

        {/* Course Meta */}
        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {course.instructor}
          </div>
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {course.duration}
          </div>
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            {course.lessonsCount} lessons
          </div>
        </div>

        {/* Tags */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Badge variant={difficultyColors[course.difficulty]} size="sm">
              {course.difficulty}
            </Badge>
            <Badge variant="info" size="sm">
              Grade {course.grade}
            </Badge>
          </div>
          
          {/* Action Button */}
          {enrolled ? (
            <Button size="sm" onClick={onContinue}>
              Continue
            </Button>
          ) : (
            <Button size="sm" variant="primary" onClick={onEnroll}>
              Enroll
            </Button>
          )}
        </div>

        {/* Progress Info (if enrolled) */}
        {enrolled && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium text-gray-900">
                {course.completedLessons}/{course.lessonsCount} lessons
              </span>
            </div>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-400 to-amber-400 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};