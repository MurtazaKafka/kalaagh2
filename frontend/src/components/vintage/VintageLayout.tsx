import React from 'react';
import type { ReactNode } from 'react';
import { LanguageSelector } from './LanguageSelector';
import { AfghanPattern } from './AfghanPattern';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate } from 'react-router-dom';

interface VintageLayoutProps {
  children: ReactNode;
  hideNavigation?: boolean;
}

export const VintageLayout: React.FC<VintageLayoutProps> = ({ children, hideNavigation = false }) => {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuthStore();
  const isRTL = ['fa', 'ps'].includes(i18n.language);
  const currentDate = new Date().toLocaleDateString(
    i18n.language === 'fa' ? 'fa-AF' : i18n.language === 'ps' ? 'ps-AF' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );

  return (
    <div 
      dir={isRTL ? 'rtl' : 'ltr'} 
      className="vintage-page"
    >
      {/* Background patterns */}
      <div className="pattern-overlay grid" />
      <AfghanPattern type="mountains" className="fixed bottom-0 left-0 right-0 h-32 opacity-5" />
      
      {/* Newspaper Header */}
      <header className="newspaper-header">
        <div className="container mx-auto px-4">
          {/* Top Bar with Language Selector and User Info */}
          <div className="flex justify-between items-center mb-4">
            {!hideNavigation && isAuthenticated && user ? (
              <div className="flex items-center gap-4">
                <span className="vintage-text text-sm">
                  {t('auth.welcome', 'Welcome')}, {user.first_name}
                </span>
                <button 
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="vintage-link text-sm"
                >
                  {t('auth.logout', 'Logout')}
                </button>
              </div>
            ) : (
              <div />
            )}
            <LanguageSelector />
          </div>
          
          {/* Masthead */}
          <h1 className="masthead">
            {i18n.language === 'fa' ? 'کلاغ' : i18n.language === 'ps' ? 'کارغه' : 'KALAAGH'}
          </h1>
          
          {/* Subtitle */}
          <p className="text-center text-lg italic mb-4" style={{ fontFamily: 'Amiri, serif' }}>
            {i18n.language === 'fa' 
              ? 'پلتفرم آموزشی برای دختران افغان'
              : i18n.language === 'ps' 
              ? 'د افغان نجونو لپاره تعليمي پلیټفارم'
              : 'Educational Platform for Afghan Girls'
            }
          </p>
          
          {/* Edition Info */}
          <div className="edition-info">
            <span className="date">{currentDate}</span>
            <span className="edition">
              {i18n.language === 'fa' ? 'نسخه آنلاین' : i18n.language === 'ps' ? 'آنلاین نسخه' : 'Online Edition'}
            </span>
            <span className="price">
              {i18n.language === 'fa' ? 'رایگان' : i18n.language === 'ps' ? 'وړیا' : 'FREE'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4">
        {children}
      </main>

      {/* Footer with decorative border */}
      <footer className="mt-16 py-8 border-t-4 border-double border-vintage-ink">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm" style={{ fontFamily: 'Roboto Mono, monospace' }}>
            {i18n.language === 'fa' 
              ? '© ۲۰۲۴ پلتفرم کلاغ - تمام حقوق محفوظ است'
              : i18n.language === 'ps' 
              ? '© ۲۰۲۴ د کارغه پلیټفارم - ټول حقونه خوندي دي'
              : '© 2024 Kalaagh Platform - All Rights Reserved'
            }
          </p>
          <p className="text-xs mt-2 italic">
            {i18n.language === 'fa' 
              ? 'با افتخار برای دختران افغان ساخته شده'
              : i18n.language === 'ps' 
              ? 'د افغان نجونو لپاره په ویاړ سره جوړ شوی'
              : 'Proudly Made for Afghan Girls'
            }
          </p>
        </div>
      </footer>
    </div>
  );
};