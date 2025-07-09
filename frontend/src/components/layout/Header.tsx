import React, { useState } from 'react';
import { theme } from '../../styles/design-system';
import { Button } from '../ui';

interface HeaderProps {
  user?: {
    name: string;
    avatar?: string;
  };
  onLogin?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogin, onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="relative bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg">
      {/* Geometric Pattern Background */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: theme.utils.patternBackground(theme.patterns.afghanStar, theme.colors.neutral.cream),
          backgroundSize: '40px 40px',
        }}
      />
      
      {/* Main Header Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-md">
              <span className="text-2xl font-bold text-orange-600">ک</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">کلاغ - Kalaagh</h1>
              <p className="text-sm text-orange-100">Educational Platform</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#courses" className="hover:text-orange-200 transition-colors">Courses</a>
            <a href="#library" className="hover:text-orange-200 transition-colors">Library</a>
            <a href="#progress" className="hover:text-orange-200 transition-colors">Progress</a>
            <a href="#community" className="hover:text-orange-200 transition-colors">Community</a>
          </nav>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-orange-200">Student</p>
                  </div>
                  <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full" />
                    ) : (
                      <span className="text-lg font-bold">{user.name[0]}</span>
                    )}
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={onLogout} className="!text-white !border-white hover:!bg-white hover:!text-orange-600">
                  Logout
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={onLogin} className="!text-white !border-white hover:!bg-white hover:!text-orange-600">
                Login
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-orange-700 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-orange-500">
            <nav className="flex flex-col space-y-3">
              <a href="#courses" className="hover:text-orange-200 transition-colors">Courses</a>
              <a href="#library" className="hover:text-orange-200 transition-colors">Library</a>
              <a href="#progress" className="hover:text-orange-200 transition-colors">Progress</a>
              <a href="#community" className="hover:text-orange-200 transition-colors">Community</a>
            </nav>
            <div className="mt-4 pt-4 border-t border-orange-500">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold">{user.name[0]}</span>
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-orange-200">Student</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" fullWidth onClick={onLogout} className="!text-white !border-white">
                    Logout
                  </Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" fullWidth onClick={onLogin} className="!text-white !border-white">
                  Login
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Geometric Border */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-700 to-amber-700 opacity-50" />
    </header>
  );
};