import React from 'react';
import { useTranslation } from 'react-i18next';

export const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();
  
  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'fa', name: 'دری', flag: '🇦🇫' },
    { code: 'ps', name: 'پښتو', flag: '🇦🇫' }
  ];
  
  return (
    <div className="language-selector">
      {languages.map(lang => (
        <button
          key={lang.code}
          onClick={() => i18n.changeLanguage(lang.code)}
          className={`lang-btn ${i18n.language === lang.code ? 'active' : ''}`}
          aria-label={`Switch to ${lang.name}`}
        >
          <span className="flag" role="img" aria-label={`${lang.name} flag`}>
            {lang.flag}
          </span>
          <span className="name">{lang.name}</span>
        </button>
      ))}
    </div>
  );
};