import { useState, useEffect } from 'react'
import './App.css'
import { contentApi, healthCheck } from './services/api'

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
  const [count, setCount] = useState(0)
  const [backendStatus, setBackendStatus] = useState<BackendStatus>({
    status: 'loading',
    message: 'Checking backend connection...'
  })
  const [contentSources, setContentSources] = useState<ContentSource[]>([])
  const [stats, setStats] = useState<any>(null)

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Backend Status Banner */}
      <div className={`w-full py-2 px-4 text-center text-sm font-medium ${
        backendStatus.status === 'connected' 
          ? 'bg-green-500 text-white' 
          : backendStatus.status === 'disconnected'
          ? 'bg-red-500 text-white'
          : 'bg-yellow-500 text-gray-800'
      }`}>
        {backendStatus.status === 'connected' && '✅'} 
        {backendStatus.status === 'disconnected' && '❌'} 
        {backendStatus.status === 'loading' && '⏳'} 
        {backendStatus.message}
      </div>

      <header className="bg-gradient-to-r from-orange-600 to-amber-600 text-white py-8 px-4 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl font-bold text-center mb-4">
            🌟 کلاغ - Kalaagh Educational Platform
          </h1>
          <p className="text-center text-xl text-orange-100 mb-2">
            Empowering Afghan Girls Through Technology and Education
          </p>
          <p className="text-center text-orange-200 text-lg">
            تعلیم د افغان نجونو لپاره د ټیکنالوژۍ او زده کړو له لارې پیاوړتیا
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto py-8 px-4">
        {/* Backend Connection Test */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8 border-l-4 border-orange-500">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            🔗 Backend Connection Test
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Content Sources ({contentSources.length})</h3>
              {contentSources.length > 0 ? (
                <div className="space-y-2">
                  {contentSources.map((source) => (
                    <div key={source.id} className="bg-gray-50 p-3 rounded border">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{source.name}</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          source.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {source.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Content: {source.imported_content}/{source.total_content}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No content sources loaded. Check backend connection.</p>
              )}
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Content Statistics</h3>
              {stats ? (
                <div className="bg-gray-50 p-4 rounded border">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Total Content:</span>
                      <span className="font-bold ml-2">{stats.totalContent}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Approved:</span>
                      <span className="font-bold ml-2 text-green-600">{stats.approvedContent}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Pending Review:</span>
                      <span className="font-bold ml-2 text-yellow-600">{stats.pendingReview}</span>
                    </div>
                    <div>
                      <button 
                        onClick={loadContentData}
                        className="bg-orange-500 text-white px-3 py-1 rounded text-xs hover:bg-orange-600 transition-colors"
                      >
                        🔄 Refresh
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No statistics available. Check backend connection.</p>
              )}
            </div>
          </div>
        </div>

        {/* Mission Statement */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b-2 border-orange-200 pb-3">
            🎯 Mission Statement
          </h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed mb-4 text-lg">
              Kalaagh (کلاغ - "crow" in Dari/Persian) is a comprehensive K-12 educational platform 
              designed specifically to <strong className="text-orange-600">replace the Taliban's discriminatory education system</strong> 
              for Afghan girls worldwide. This humanitarian technology project ensures that every Afghan girl, 
              regardless of her location or circumstances, has access to complete, world-class education.
            </p>
            <p className="text-gray-700 leading-relaxed text-lg">
              Our platform provides <strong className="text-orange-600">5,800+ educational videos</strong> covering the complete 
              K-12 curriculum in Mathematics, Science, Language Arts, Social Studies, Computer Science, 
              and Life Skills. Content is culturally adapted and available in English, Dari (دری), 
              and Pashto (پښتو).
            </p>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-orange-500">
            <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
              📚 Complete Curriculum
            </h3>
            <p className="text-gray-600">
              Full K-12 education covering all major subjects with 5,800+ video lessons from Khan Academy, 
              MIT OpenCourseWare, and custom Afghan content.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-blue-500">
            <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
              🌍 Multi-Language Support
            </h3>
            <p className="text-gray-600">
              Content available in English, Dari (دری), and Pashto (پښتو) with full RTL layout support 
              and cultural adaptation for Afghan students.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-green-500">
            <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
              🎓 Quality Education
            </h3>
            <p className="text-gray-600">
              Expert-reviewed content with comprehensive assessments, progress tracking, and certification 
              to ensure educational excellence.
            </p>
          </div>
        </div>

        {/* Platform Features */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            🚀 Platform Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-xl font-bold text-orange-600 mb-4">📊 Content Management</h4>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Automated Khan Academy import system
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Quality assurance workflow
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Curriculum mapping and organization
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Multi-language content support
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-bold text-blue-600 mb-4">🎯 Learning Experience</h4>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <span className="text-yellow-500 mr-2">⏳</span>
                  Advanced video player with subtitles
                </li>
                <li className="flex items-center">
                  <span className="text-yellow-500 mr-2">⏳</span>
                  Comprehensive assessment engine
                </li>
                <li className="flex items-center">
                  <span className="text-yellow-500 mr-2">⏳</span>
                  Progress tracking and analytics
                </li>
                <li className="flex items-center">
                  <span className="text-yellow-500 mr-2">⏳</span>
                  Offline capabilities (PWA)
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Interactive Test */}
        <div className="text-center">
          <div className="bg-white rounded-lg shadow-lg p-8 inline-block">
            <p className="text-2xl font-bold text-gray-800 mb-4">
              🌟 Platform Development Status
            </p>
            <div className="mb-4">
              <button 
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 mr-4"
                onClick={() => setCount((count) => count + 1)}
              >
                Test Frontend Reactivity: {count}
              </button>
              <button 
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
                onClick={() => {
                  checkBackendConnection()
                  loadContentData()
                }}
              >
                🔄 Test Backend Connection
              </button>
            </div>
            <p className="text-gray-600 mt-6 italic text-lg">
              "Education is the most powerful weapon which you can use to change the world." - Nelson Mandela
            </p>
            <p className="text-orange-600 font-bold mt-3 text-xl">
              For Afghan girls, Kalaagh is that weapon. 🌟
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
