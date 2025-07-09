import React from 'react';
import type { ReactNode } from 'react';

interface NewspaperColumnsProps {
  children: ReactNode;
  columns?: 1 | 2 | 3;
  className?: string;
}

export const NewspaperColumns: React.FC<NewspaperColumnsProps> = ({ 
  children, 
  columns = 3,
  className = '' 
}) => {
  return (
    <div className={`content-section columns ${className}`}>
      {children}
    </div>
  );
};

interface ArticleProps {
  headline: string;
  subtitle?: string;
  author?: string;
  date?: string;
  children: ReactNode;
  priority?: 'high' | 'medium' | 'low';
  className?: string;
}

export const Article: React.FC<ArticleProps> = ({
  headline,
  subtitle,
  author,
  date,
  children,
  priority = 'medium',
  className = ''
}) => {
  const priorityClasses = {
    high: 'article-priority-high',
    medium: '',
    low: 'article-priority-low'
  };

  return (
    <article className={`article-card ${priorityClasses[priority]} ${className}`}>
      <h2 className="article-title">{headline}</h2>
      {subtitle && <h3 className="article-subtitle">{subtitle}</h3>}
      
      {(author || date) && (
        <div className="article-meta">
          {author && <span className="author">{author}</span>}
          {author && date && <span className="separator">•</span>}
          {date && <span className="date">{date}</span>}
        </div>
      )}
      
      <div className="article-content">
        {children}
      </div>
    </article>
  );
};