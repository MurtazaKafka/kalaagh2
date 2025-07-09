import { useState, useEffect } from 'react'
import './App.css'
import { contentApi, healthCheck } from './services/api'
import { Header, Footer, Container, Section, Grid } from './components/layout'
import { Button, Card, Alert, CardHeader, CardContent } from './components/ui'
import { CourseCard, type Course } from './components/course'
import { ProgressCard, StatsChart, SubjectProgress, Leaderboard } from './components/progress'
import { theme } from './styles/design-system'

interface ContentSource {
  id: string;
  name: string;
  base_url: string;
  is_active: number;
  total_content: number;
  imported_content: number;
}

interface BackendStatus {
  status: 'connected' | 'disconnected' | 'loading';
  message: string;
}

function App() {
  const [backendStatus, setBackendStatus] = useState<BackendStatus>({
    status: 'loading',
    message: 'Checking backend connection...'
  })
  const [contentSources, setContentSources] = useState<ContentSource[]>([])
  const [stats, setStats] = useState<any>(null)
  const [user, setUser] = useState<{ name: string; avatar?: string } | undefined>({
    name: 'Maryam Ahmadi',
    avatar: undefined
  })

  useEffect(() => {
    checkBackendConnection()
    loadContentData()
  }, [])

  const checkBackendConnection = async () => {
    try {
      const health = await healthCheck()
      if (health.status === 'ok') {
        setBackendStatus({
          status: 'connected',
          message: `Backend connected (${health.environment})`
        })
      }
    } catch (error) {
      setBackendStatus({
        status: 'disconnected',
        message: 'Backend not available. Please start the backend server.'
      })
    }
  }

  const loadContentData = async () => {
    try {
      const [sourcesResponse, statsResponse] = await Promise.all([
        contentApi.getSources(),
        contentApi.getStats()
      ])
      
      if (sourcesResponse.success) {
        setContentSources(sourcesResponse.data)
      }
      
      if (statsResponse.success) {
        setStats(statsResponse.data)
      }
    } catch (error) {
      console.error('Failed to load content data:', error)
    }
  }

  // Sample data for demonstration
  const sampleCourses: Course[] = [
    {
      id: '1',
      title: 'Advanced Mathematics - Algebra',
      description: 'Master algebraic concepts including quadratic equations, polynomials, and advanced problem-solving techniques.',
      subject: 'Mathematics',
      grade: '10',
      instructor: 'Dr. Sarah Johnson',
      duration: '12 weeks',
      lessonsCount: 48,
      completedLessons: 12,
      language: 'en',
      difficulty: 'intermediate'
    },
    {
      id: '2',
      title: 'Physics - Motion and Forces',
      description: 'Explore the fundamental principles of motion, forces, and energy in the physical world.',
      subject: 'Physics',
      grade: '11',
      instructor: 'Prof. Ahmed Khan',
      duration: '10 weeks',
      lessonsCount: 40,
      completedLessons: 0,
      language: 'fa',
      difficulty: 'beginner'
    },
    {
      id: '3',
      title: 'Biology - Cell Structure',
      description: 'Dive deep into cellular biology, understanding the building blocks of life.',
      subject: 'Biology',
      grade: '9',
      instructor: 'Dr. Fatima Karimi',
      duration: '8 weeks',
      lessonsCount: 32,
      completedLessons: 32,
      language: 'ps',
      difficulty: 'beginner'
    }
  ];

  const progressData = {
    totalCourses: 12,
    completedCourses: 3,
    inProgressCourses: 4,
    totalLessons: 240,
    completedLessons: 89,
    totalHours: 127,
    weeklyStreak: 5,
    longestStreak: 21,
    achievements: [
      { id: '1', title: 'First Steps', description: 'Complete your first lesson', icon: '👣', unlockedAt: new Date() },
      { id: '2', title: 'Week Warrior', description: '7-day learning streak', icon: '🔥', unlockedAt: new Date() },
      { id: '3', title: 'Math Master', description: 'Complete all algebra lessons', icon: '🧮', unlockedAt: new Date() },
    ]
  };

  const weeklyStudyData = [
    { date: '2024-01-08', minutes: 45 },
    { date: '2024-01-09', minutes: 90 },
    { date: '2024-01-10', minutes: 60 },
    { date: '2024-01-11', minutes: 120 },
    { date: '2024-01-12', minutes: 30 },
    { date: '2024-01-13', minutes: 75 },
    { date: '2024-01-14', minutes: 95 },
  ];

  const subjectProgressData = [
    { name: 'Mathematics', progress: 75, color: theme.colors.primary.saffron },
    { name: 'Physics', progress: 60, color: theme.colors.secondary.turquoise },
    { name: 'Biology', progress: 90, color: theme.colors.accent.emerald },
    { name: 'Chemistry', progress: 45, color: theme.colors.accent.ruby },
    { name: 'English', progress: 85, color: theme.colors.accent.lapis },
  ];

  const leaderboardData = [
    { rank: 1, name: 'Zahra Mohammadi', points: 2450 },
    { rank: 2, name: 'Maryam Ahmadi', points: 2380, isCurrentUser: true },
    { rank: 3, name: 'Fatima Rezaei', points: 2290 },
    { rank: 4, name: 'Aisha Karimi', points: 2150 },
    { rank: 5, name: 'Sara Hosseini', points: 2050 },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.colors.neutral.cream }}>
      {/* Header */}
      <Header 
        user={user} 
        onLogin={() => console.log('Login')} 
        onLogout={() => setUser(undefined)}
      />

      {/* Hero Section */}
      <Section pattern className="bg-gradient-to-br from-orange-50 to-amber-50">
        <Container>
          <div className="text-center py-12">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
              Welcome to Kalaagh Platform
            </h1>
            <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
              Empowering Afghan girls through accessible, world-class education.
              Learn at your own pace, in your own language.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" variant="primary">
                Start Learning
              </Button>
              <Button size="lg" variant="outline">
                Explore Courses
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      <main>
        {/* Backend Status Alert */}
        <Section>
          <Container>
            {backendStatus.status === 'disconnected' && (
              <Alert
                variant="warning"
                title="Backend Connection"
                description={backendStatus.message}
                className="mb-8"
              />
            )}
          </Container>
        </Section>

        {/* Progress Overview */}
        {user && (
          <Section>
            <Container>
              <ProgressCard progress={progressData} userName={user.name} />
            </Container>
          </Section>
        )}

        {/* Featured Courses */}
        <Section>
          <Container>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Courses</h2>
              <p className="text-gray-600">Continue your learning journey with these recommended courses</p>
            </div>
            
            <Grid cols={{ default: 1, md: 2, lg: 3 }} gap="lg">
              {sampleCourses.map(course => (
                <CourseCard
                  key={course.id}
                  course={course}
                  enrolled={course.completedLessons > 0}
                  onEnroll={() => console.log('Enroll:', course.id)}
                  onContinue={() => console.log('Continue:', course.id)}
                />
              ))}
            </Grid>
          </Container>
        </Section>

        {/* Statistics Section */}
        {user && (
          <Section className="bg-gray-50">
            <Container>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Learning Analytics</h2>
                <p className="text-gray-600">Track your progress and stay motivated</p>
              </div>
              
              <Grid cols={{ default: 1, md: 2, lg: 3 }} gap="lg">
                <StatsChart data={weeklyStudyData} title="Weekly Study Time" />
                <SubjectProgress subjects={subjectProgressData} />
                <Leaderboard users={leaderboardData} />
              </Grid>
            </Container>
          </Section>
        )}

        {/* Platform Features */}
        <Section>
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Kalaagh?</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Our platform is designed specifically for Afghan students, with features that address
                real challenges in accessing quality education.
              </p>
            </div>

            <Grid cols={{ default: 1, md: 2, lg: 3 }} gap="md">
              <Card variant="geometric">
                <CardHeader 
                  title="Offline Learning" 
                  subtitle="Download lessons for learning without internet"
                />
                <CardContent>
                  <div className="text-4xl mb-4">📱</div>
                  <p className="text-gray-600">
                    Access your courses anytime, anywhere. Download videos and materials
                    to continue learning even without an internet connection.
                  </p>
                </CardContent>
              </Card>

              <Card variant="geometric">
                <CardHeader 
                  title="Multi-Language Support" 
                  subtitle="Learn in English, Dari, or Pashto"
                />
                <CardContent>
                  <div className="text-4xl mb-4">🌍</div>
                  <p className="text-gray-600">
                    All content is available in multiple languages with full RTL support,
                    making education accessible to all Afghan students.
                  </p>
                </CardContent>
              </Card>

              <Card variant="geometric">
                <CardHeader 
                  title="Expert Teachers" 
                  subtitle="Learn from the best educators worldwide"
                />
                <CardContent>
                  <div className="text-4xl mb-4">👩‍🏫</div>
                  <p className="text-gray-600">
                    Our courses are taught by experienced educators and reviewed by
                    subject matter experts to ensure quality.
                  </p>
                </CardContent>
              </Card>

              <Card variant="geometric">
                <CardHeader 
                  title="Interactive Learning" 
                  subtitle="Engage with quizzes and activities"
                />
                <CardContent>
                  <div className="text-4xl mb-4">🎮</div>
                  <p className="text-gray-600">
                    Practice what you learn with interactive exercises, quizzes,
                    and hands-on projects that reinforce understanding.
                  </p>
                </CardContent>
              </Card>

              <Card variant="geometric">
                <CardHeader 
                  title="Progress Tracking" 
                  subtitle="Monitor your learning journey"
                />
                <CardContent>
                  <div className="text-4xl mb-4">📊</div>
                  <p className="text-gray-600">
                    Track your progress, earn achievements, and get personalized
                    recommendations to optimize your learning path.
                  </p>
                </CardContent>
              </Card>

              <Card variant="geometric">
                <CardHeader 
                  title="Community Support" 
                  subtitle="Learn together with peers"
                />
                <CardContent>
                  <div className="text-4xl mb-4">🤝</div>
                  <p className="text-gray-600">
                    Join study groups, participate in discussions, and get help
                    from teachers and fellow students.
                  </p>
                </CardContent>
              </Card>
            </Grid>
          </Container>
        </Section>

        {/* Call to Action */}
        <Section className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
          <Container>
            <div className="text-center py-12">
              <h2 className="text-4xl font-bold mb-4">
                Start Your Learning Journey Today
              </h2>
              <p className="text-xl mb-8 text-orange-100 max-w-2xl mx-auto">
                Join thousands of Afghan students who are taking control of their education
                and building a brighter future.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button size="lg" variant="secondary">
                  Create Free Account
                </Button>
                <Button size="lg" variant="outline" className="!text-white !border-white hover:!bg-white hover:!text-orange-600">
                  Learn More
                </Button>
              </div>
            </div>
          </Container>
        </Section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default App
