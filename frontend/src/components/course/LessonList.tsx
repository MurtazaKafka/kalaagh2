import React from 'react';
import { Card, Badge, Button } from '../ui';
import { theme } from '../../styles/design-system';

export interface Lesson {
  id: string;
  title: string;
  description?: string;
  duration: string;
  type: 'video' | 'reading' | 'quiz' | 'assignment' | 'interactive';
  completed: boolean;
  locked: boolean;
  order: number;
}

interface LessonListProps {
  lessons: Lesson[];
  onSelectLesson: (lesson: Lesson) => void;
  currentLessonId?: string;
}

export const LessonList: React.FC<LessonListProps> = ({
  lessons,
  onSelectLesson,
  currentLessonId,
}) => {
  const getTypeIcon = (type: Lesson['type']) => {
    switch (type) {
      case 'video':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'reading':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case 'quiz':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        );
      case 'assignment':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'interactive':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>
        );
    }
  };

  const getTypeColor = (type: Lesson['type']) => {
    switch (type) {
      case 'video': return 'text-blue-600';
      case 'reading': return 'text-purple-600';
      case 'quiz': return 'text-green-600';
      case 'assignment': return 'text-orange-600';
      case 'interactive': return 'text-pink-600';
    }
  };

  return (
    <Card variant="outlined" className="h-full">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-900">Course Content</h3>
        <p className="text-sm text-gray-600 mt-1">
          {lessons.filter(l => l.completed).length} of {lessons.length} completed
        </p>
      </div>

      <div className="overflow-y-auto" style={{ maxHeight: '600px' }}>
        {lessons.map((lesson, index) => (
          <div
            key={lesson.id}
            className={`
              border-b border-gray-100 last:border-0 transition-all duration-200
              ${lesson.locked ? 'opacity-50' : 'hover:bg-gray-50 cursor-pointer'}
              ${currentLessonId === lesson.id ? 'bg-orange-50 border-l-4 border-orange-500' : ''}
            `}
            onClick={() => !lesson.locked && onSelectLesson(lesson)}
          >
            <div className="p-4">
              <div className="flex items-start space-x-3">
                {/* Lesson Number/Check */}
                <div className="flex-shrink-0 mt-0.5">
                  {lesson.completed ? (
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ) : lesson.locked ? (
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-8 h-8 border-2 border-gray-300 rounded-full flex items-center justify-center text-gray-600 font-medium">
                      {lesson.order}
                    </div>
                  )}
                </div>

                {/* Lesson Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900 truncate pr-2">
                      {lesson.title}
                    </h4>
                    <div className={`flex-shrink-0 ${getTypeColor(lesson.type)}`}>
                      {getTypeIcon(lesson.type)}
                    </div>
                  </div>
                  
                  {lesson.description && (
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {lesson.description}
                    </p>
                  )}

                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {lesson.duration}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

interface LessonContentProps {
  lesson: Lesson;
  onComplete: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

export const LessonContent: React.FC<LessonContentProps> = ({
  lesson,
  onComplete,
  onNext,
  onPrevious,
  hasNext = false,
  hasPrevious = false,
}) => {
  return (
    <Card variant="raised" className="h-full">
      <div className="p-6">
        {/* Lesson Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Badge variant="secondary" size="sm" className="mb-2">
              {lesson.type}
            </Badge>
            <h2 className="text-2xl font-bold text-gray-900">{lesson.title}</h2>
          </div>
          {lesson.completed && (
            <div className="flex items-center text-green-600">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Completed
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="mb-8">
          {lesson.type === 'video' && (
            <div className="aspect-w-16 aspect-h-9 bg-black rounded-lg">
              <div className="flex items-center justify-center h-96 bg-gray-900 rounded-lg">
                <div className="text-white text-center">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>Video Player Placeholder</p>
                </div>
              </div>
            </div>
          )}

          {lesson.type === 'reading' && (
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700">
                This is where the reading content would be displayed. 
                The content would be formatted with proper typography and spacing for optimal readability.
              </p>
            </div>
          )}

          {lesson.type === 'quiz' && (
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700">Quiz interface would be displayed here.</p>
            </div>
          )}

          {lesson.type === 'assignment' && (
            <div className="bg-orange-50 rounded-lg p-6">
              <p className="text-gray-700">Assignment details and submission interface would be displayed here.</p>
            </div>
          )}

          {lesson.type === 'interactive' && (
            <div className="bg-cyan-50 rounded-lg p-6">
              <p className="text-gray-700">Interactive content would be displayed here.</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={!hasPrevious}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            }
          >
            Previous
          </Button>

          {!lesson.completed && (
            <Button variant="primary" onClick={onComplete}>
              Mark as Complete
            </Button>
          )}

          <Button
            variant="outline"
            onClick={onNext}
            disabled={!hasNext}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            }
            iconPosition="right"
          >
            Next
          </Button>
        </div>
      </div>
    </Card>
  );
};