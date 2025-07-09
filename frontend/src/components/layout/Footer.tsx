import React from 'react';
import { theme } from '../../styles/design-system';

export const Footer: React.FC = () => {
  return (
    <footer className="relative bg-gray-900 text-white mt-16">
      {/* Geometric Pattern Top Border */}
      <div 
        className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-r from-orange-500 to-amber-500"
        style={{
          clipPath: 'polygon(0 0, 100% 0, 100% 50%, 50% 100%, 0 50%)',
        }}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-xl font-bold text-white">ک</span>
              </div>
              <h3 className="text-lg font-bold">Kalaagh Platform</h3>
            </div>
            <p className="text-gray-400 text-sm">
              Empowering Afghan girls through accessible, quality education. 
              Breaking barriers, building futures.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-orange-400">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#about" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
              <li><a href="#courses" className="text-gray-400 hover:text-white transition-colors">Courses</a></li>
              <li><a href="#teachers" className="text-gray-400 hover:text-white transition-colors">For Teachers</a></li>
              <li><a href="#parents" className="text-gray-400 hover:text-white transition-colors">For Parents</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-orange-400">Resources</h4>
            <ul className="space-y-2">
              <li><a href="#help" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#community" className="text-gray-400 hover:text-white transition-colors">Community</a></li>
              <li><a href="#blog" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
              <li><a href="#offline" className="text-gray-400 hover:text-white transition-colors">Offline Access</a></li>
            </ul>
          </div>

          {/* Languages */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-orange-400">Languages</h4>
            <div className="space-y-2">
              <button className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
                <span>🇬🇧</span>
                <span>English</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
                <span>🇦🇫</span>
                <span>دری (Dari)</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
                <span>🇦🇫</span>
                <span>پښتو (Pashto)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 Kalaagh Platform. Made with ❤️ for Afghan girls' education.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#privacy" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</a>
              <a href="#terms" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</a>
              <a href="#contact" className="text-gray-400 hover:text-white text-sm transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </div>

      {/* Geometric Pattern Background */}
      <div 
        className="absolute bottom-0 right-0 w-32 h-32 opacity-5"
        style={{
          backgroundImage: theme.utils.patternBackground(theme.patterns.islamicTile, theme.colors.neutral.cream),
          backgroundSize: '60px 60px',
        }}
      />
    </footer>
  );
};