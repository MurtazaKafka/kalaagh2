import React, { useEffect, useState } from 'react';
import { api, healthCheck, contentApi } from '../services/api';
import { GeometricCard } from '../components/vintage/GeometricCard';
import { useTranslation } from 'react-i18next';

export const TestConnection = () => {
  const { t } = useTranslation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Test health check
        const health = await healthCheck();
        
        // Test content API
        let sources = null;
        let stats = null;
        try {
          sources = await contentApi.getSources();
          stats = await contentApi.getStats();
        } catch (apiError) {
          console.warn('Content API not fully configured yet:', apiError);
        }
        
        // Test course endpoint
        let courses = null;
        try {
          const response = await api.get('/courses');
          courses = response.data;
        } catch (courseError) {
          console.warn('Courses endpoint not available:', courseError);
        }
        
        setData({ health, sources, stats, courses });
        setStatus('success');
      } catch (error) {
        setStatus('error');
        setError(error instanceof Error ? error.message : 'Connection failed');
        console.error('Connection test failed:', error);
      }
    };

    testConnection();
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case 'success': return 'border-green-600 bg-green-50';
      case 'error': return 'border-red-600 bg-red-50';
      default: return 'border-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      default: return '⏳';
    }
  };

  return (
    <div className="vintage-page min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center" style={{ fontFamily: 'Playfair Display, serif' }}>
          API Connection Test
        </h1>
        
        <GeometricCard pattern="octagon" className={`mb-6 ${getStatusColor()}`}>
          <div className="text-center p-6">
            <span className="text-4xl mb-4 block">{getStatusIcon()}</span>
            <p className="text-2xl font-bold capitalize">{status}</p>
            {error && <p className="text-red-700 mt-2">{error}</p>}
          </div>
        </GeometricCard>
        
        {status === 'success' && data && (
          <div className="space-y-6">
            {/* Health Check */}
            <GeometricCard pattern="trapezoid">
              <h2 className="text-2xl font-bold mb-4">🏥 Health Check</h2>
              <pre className="bg-white p-4 rounded border-2 border-gray-300 overflow-auto text-sm">
                {JSON.stringify(data.health, null, 2)}
              </pre>
            </GeometricCard>
            
            {/* Content Sources */}
            {data.sources && (
              <GeometricCard pattern="hexagon">
                <h2 className="text-2xl font-bold mb-4">📚 Content Sources</h2>
                <pre className="bg-white p-4 rounded border-2 border-gray-300 overflow-auto text-sm">
                  {JSON.stringify(data.sources, null, 2)}
                </pre>
              </GeometricCard>
            )}
            
            {/* Statistics */}
            {data.stats && (
              <GeometricCard pattern="parallelogram">
                <h2 className="text-2xl font-bold mb-4">📊 Statistics</h2>
                <pre className="bg-white p-4 rounded border-2 border-gray-300 overflow-auto text-sm">
                  {JSON.stringify(data.stats, null, 2)}
                </pre>
              </GeometricCard>
            )}
            
            {/* Courses */}
            {data.courses && (
              <GeometricCard pattern="angled">
                <h2 className="text-2xl font-bold mb-4">🎓 Courses</h2>
                <pre className="bg-white p-4 rounded border-2 border-gray-300 overflow-auto text-sm">
                  {JSON.stringify(data.courses, null, 2)}
                </pre>
              </GeometricCard>
            )}
          </div>
        )}
        
        {/* Retry Button */}
        {status === 'error' && (
          <div className="text-center mt-6">
            <button 
              onClick={() => window.location.reload()}
              className="vintage-button primary"
            >
              {t('retry')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};