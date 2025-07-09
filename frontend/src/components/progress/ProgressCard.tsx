import React from 'react';
import { Card, Badge } from '../ui';
import { theme } from '../../styles/design-system';

interface ProgressData {
  totalCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  totalLessons: number;
  completedLessons: number;
  totalHours: number;
  weeklyStreak: number;
  longestStreak: number;
  achievements: Achievement[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
}

interface ProgressCardProps {
  progress: ProgressData;
  userName: string;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({ progress, userName }) => {
  const overallProgress = (progress.completedLessons / progress.totalLessons) * 100;

  return (
    <Card variant="geometric" className="overflow-hidden">
      {/* Header with Geometric Pattern */}
      <div className="relative bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-white">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: theme.utils.patternBackground(theme.patterns.afghanStar, theme.colors.neutral.cream),
            backgroundSize: '30px 30px',
          }}
        />
        
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-2">Welcome back, {userName}!</h2>
          <p className="text-orange-100">Keep up the great work on your learning journey.</p>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="p-6">
        <div className="mb-6">
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-2xl font-bold text-orange-600">{Math.round(overallProgress)}%</span>
          </div>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-orange-400 to-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatItem
            icon="📚"
            label="Total Courses"
            value={progress.totalCourses}
            color={theme.colors.primary.saffron}
          />
          <StatItem
            icon="✅"
            label="Completed"
            value={progress.completedCourses}
            color={theme.colors.accent.emerald}
          />
          <StatItem
            icon="🔥"
            label="Current Streak"
            value={`${progress.weeklyStreak} days`}
            color={theme.colors.accent.ruby}
          />
          <StatItem
            icon="⏱️"
            label="Study Time"
            value={`${progress.totalHours}h`}
            color={theme.colors.secondary.turquoise}
          />
        </div>

        {/* Recent Achievements */}
        {progress.achievements.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Recent Achievements</h3>
            <div className="flex flex-wrap gap-2">
              {progress.achievements.slice(0, 3).map(achievement => (
                <Badge 
                  key={achievement.id} 
                  variant="secondary" 
                  size="lg"
                  className="flex items-center"
                >
                  <span className="mr-1">{achievement.icon}</span>
                  {achievement.title}
                </Badge>
              ))}
              {progress.achievements.length > 3 && (
                <Badge variant="secondary" size="lg">
                  +{progress.achievements.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

interface StatItemProps {
  icon: string;
  label: string;
  value: string | number;
  color: string;
}

const StatItem: React.FC<StatItemProps> = ({ icon, label, value, color }) => (
  <div className="text-center">
    <div 
      className="w-12 h-12 mx-auto mb-2 rounded-lg flex items-center justify-center text-2xl"
      style={{ backgroundColor: theme.utils.hexToRgba(color, 0.1) }}
    >
      {icon}
    </div>
    <p className="text-xs text-gray-600">{label}</p>
    <p className="text-lg font-bold text-gray-900">{value}</p>
  </div>
);