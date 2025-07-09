import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface VideoPlayerProps {
  lesson: {
    id: string;
    title: string;
    videoUrl: string;
    offlinePath?: string;
    subtitles?: {
      en?: string;
      fa?: string;
      ps?: string;
    };
    duration: string;
  };
  onComplete?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ lesson, onComplete }) => {
  const { i18n } = useTranslation();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getVideoSource = () => {
    if (isOffline && lesson.offlinePath) {
      return lesson.offlinePath;
    }
    return lesson.videoUrl;
  };

  const getSubtitleTrack = () => {
    const lang = i18n.language as keyof typeof lesson.subtitles;
    return lesson.subtitles?.[lang];
  };

  return (
    <div className="video-container">
      <div className="film-reel-border" />
      
      {/* Offline indicator */}
      {isOffline && (
        <div className="absolute top-2 right-2 z-10 bg-amber-100 text-amber-800 px-2 py-1 text-sm rounded">
          📡 Offline Mode
        </div>
      )}
      
      {/* Video element */}
      {lesson.offlinePath || !lesson.videoUrl.includes('youtube') ? (
        <video 
          src={getVideoSource()} 
          controls
          className="w-full rounded-lg"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={onComplete}
        >
          {getSubtitleTrack() && (
            <track 
              kind="subtitles" 
              src={getSubtitleTrack()} 
              srcLang={i18n.language}
              label={i18n.language}
              default
            />
          )}
        </video>
      ) : (
        <iframe 
          src={lesson.videoUrl}
          className="w-full aspect-video rounded-lg"
          allowFullScreen
          title={lesson.title}
        />
      )}
      
      {/* Decorative vintage film elements */}
      <div className="video-ornament top-left">◆</div>
      <div className="video-ornament top-right">◆</div>
      <div className="video-ornament bottom-left">◆</div>
      <div className="video-ornament bottom-right">◆</div>
      
      {/* Vintage film info bar */}
      <div className="mt-2 p-2 bg-vintage-ink text-vintage-paper flex justify-between items-center text-sm">
        <span>{lesson.title}</span>
        <span>{lesson.duration}</span>
      </div>
    </div>
  );
};