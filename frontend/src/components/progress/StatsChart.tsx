import React from 'react';
import { Card } from '../ui';
import { theme } from '../../styles/design-system';

interface StudyData {
  date: string;
  minutes: number;
}

interface StatsChartProps {
  data: StudyData[];
  title?: string;
}

export const StatsChart: React.FC<StatsChartProps> = ({ 
  data, 
  title = "Weekly Study Time" 
}) => {
  const maxMinutes = Math.max(...data.map(d => d.minutes), 60);
  const chartHeight = 200;

  return (
    <Card variant="raised">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        
        {/* Chart */}
        <div className="relative" style={{ height: chartHeight }}>
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500 pr-2">
            <span>{Math.round(maxMinutes / 60)}h</span>
            <span>{Math.round(maxMinutes / 120)}h</span>
            <span>0</span>
          </div>
          
          {/* Chart bars */}
          <div className="ml-8 h-full flex items-end justify-between gap-2">
            {data.map((day, index) => {
              const height = (day.minutes / maxMinutes) * 100;
              const isToday = index === data.length - 1;
              
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center">
                  <div className="relative w-full">
                    <div
                      className={`
                        w-full rounded-t-lg transition-all duration-300 hover:opacity-80
                        ${isToday ? 'bg-gradient-to-t from-orange-500 to-amber-400' : 'bg-gradient-to-t from-gray-400 to-gray-300'}
                      `}
                      style={{ 
                        height: `${height}%`, 
                        minHeight: '4px',
                        marginTop: `${chartHeight - (chartHeight * height / 100)}px`
                      }}
                    >
                      {/* Tooltip */}
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap">
                        {Math.round(day.minutes / 60)}h {day.minutes % 60}m
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* X-axis labels */}
        <div className="ml-8 mt-2 flex justify-between text-xs text-gray-500">
          {data.map((day, index) => (
            <div key={day.date} className="flex-1 text-center">
              {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

interface SubjectProgressProps {
  subjects: {
    name: string;
    progress: number;
    color: string;
  }[];
}

export const SubjectProgress: React.FC<SubjectProgressProps> = ({ subjects }) => {
  return (
    <Card variant="raised">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress by Subject</h3>
        
        <div className="space-y-4">
          {subjects.map(subject => (
            <div key={subject.name}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">{subject.name}</span>
                <span className="text-sm font-bold" style={{ color: subject.color }}>
                  {subject.progress}%
                </span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${subject.progress}%`,
                    backgroundColor: subject.color 
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

interface LeaderboardProps {
  users: {
    rank: number;
    name: string;
    points: number;
    avatar?: string;
    isCurrentUser?: boolean;
  }[];
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ users }) => {
  const getMedalEmoji = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return null;
    }
  };

  return (
    <Card variant="raised">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Class Leaderboard</h3>
        
        <div className="space-y-3">
          {users.map(user => (
            <div 
              key={user.rank}
              className={`
                flex items-center justify-between p-3 rounded-lg
                ${user.isCurrentUser ? 'bg-orange-50 border-2 border-orange-300' : 'bg-gray-50'}
              `}
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8">
                  {getMedalEmoji(user.rank) || (
                    <span className="text-sm font-bold text-gray-600">#{user.rank}</span>
                  )}
                </div>
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full" />
                  ) : (
                    <span className="text-sm font-bold text-gray-600">{user.name[0]}</span>
                  )}
                </div>
                <span className={`font-medium ${user.isCurrentUser ? 'text-orange-700' : 'text-gray-900'}`}>
                  {user.name}
                  {user.isCurrentUser && <span className="text-xs ml-1">(You)</span>}
                </span>
              </div>
              <span className="font-bold text-gray-900">{user.points} pts</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};