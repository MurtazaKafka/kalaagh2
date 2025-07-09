import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './styles/vintage-newspaper.scss';
import { 
  VintageLayout, 
  NewspaperColumns, 
  Article,
  GeometricCard,
  VideoPlayer
} from './components/vintage';
import { healthCheck } from './services/api';
import { CourseList } from './components/courses/CourseList';
import { useCourseStore } from './stores/courseStore';

function VintageApp() {
  const { t, i18n } = useTranslation();
  const selectedCourse = useCourseStore(state => state.selectedCourse);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const health = await healthCheck();
      setConnectionStatus(health.status === 'ok' ? 'connected' : 'disconnected');
    } catch {
      setConnectionStatus('disconnected');
    }
  };

  return (
    <VintageLayout>
      {/* Hero Section with Vintage Headline */}
      <section className="mb-8">
        <div className="text-center py-8 border-4 border-double border-vintage-ink mb-6">
          <h2 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            {t('welcome')} to Kalaagh Education
          </h2>
          <p className="text-lg italic" style={{ fontFamily: 'Amiri, serif' }}>
            {i18n.language === 'fa' 
              ? 'یک دنیای از دانش برای دختران افغان'
              : i18n.language === 'ps' 
              ? 'د افغان نجونو لپاره د پوهې نړۍ'
              : 'A World of Knowledge for Afghan Girls'
            }
          </p>
        </div>

        {/* Test Connection Link */}
        <div className="text-center mb-4">
          <a 
            href="/test-connection" 
            className="vintage-button secondary"
          >
            🔧 Test API Connection
          </a>
        </div>

        {/* Connection Status */}
        {connectionStatus === 'disconnected' && (
          <GeometricCard pattern="trapezoid" className="mb-6 bg-amber-50 border-amber-600">
            <div className="text-center">
              <span className="text-2xl mr-2">⚠️</span>
              <span className="font-bold">
                {i18n.language === 'fa' 
                  ? 'در حال حاضر آفلاین هستید - محتوای دانلود شده در دسترس است'
                  : i18n.language === 'ps' 
                  ? 'تاسو اوس آفلاین یاست - ډاونلوډ شوی محتوا شتون لري'
                  : 'You are currently offline - Downloaded content is available'
                }
              </span>
            </div>
          </GeometricCard>
        )}
      </section>

      {/* Featured Content in Newspaper Columns */}
      <NewspaperColumns columns={3}>
        <Article
          headline={t('subjects.mathematics')}
          subtitle="Latest Updates in Math Curriculum"
          author="Editorial Team"
          date={new Date().toLocaleDateString()}
          priority="high"
        >
          <p>
            The mathematics department has introduced new interactive lessons covering advanced algebra 
            and geometry concepts aligned with the IB MYP curriculum.
          </p>
          <p className="mt-2">
            Students can now access over 200 video lessons with subtitles in Dari, Pashto, and English.
          </p>
        </Article>

        <Article
          headline={t('subjects.science')}
          subtitle="Exploring the Natural World"
          author="Science Department"
          priority="medium"
        >
          <p>
            New laboratory simulation videos allow students to conduct virtual experiments safely from home.
          </p>
        </Article>

        <Article
          headline="Student Success Stories"
          author="Community Team"
          priority="medium"
        >
          <p>
            This month, we celebrate Maryam from Kabul who completed her first year of studies with 
            outstanding results in all subjects.
          </p>
        </Article>
      </NewspaperColumns>

      {/* Course Grid */}
      <section className="mt-12">
        <h2 className="text-3xl font-bold text-center mb-8 pb-4 border-b-4 border-double border-vintage-ink">
          {t('courses')}
        </h2>
        
        <CourseList />
      </section>

      {/* Sample Video Section */}
      {selectedCourse && (
        <section className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Sample Lesson: {selectedCourse.title?.en || 'Course'}
          </h2>
          <VideoPlayer
            lesson={{
              id: '1',
              title: 'Introduction to ' + (selectedCourse.title?.en || 'Course'),
              videoUrl: 'https://example.com/video.mp4',
              offlinePath: '/offline/videos/lesson1.mp4',
              duration: '15:30',
              subtitles: {
                en: '/subtitles/lesson1-en.vtt',
                fa: '/subtitles/lesson1-fa.vtt',
                ps: '/subtitles/lesson1-ps.vtt'
              }
            }}
            onComplete={() => console.log('Video completed')}
          />
        </section>
      )}
    </VintageLayout>
  );
}

export default VintageApp;