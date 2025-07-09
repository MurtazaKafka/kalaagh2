import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  en: {
    translation: {
      // Navigation
      home: 'Home',
      courses: 'Courses',
      myLearning: 'My Learning',
      progress: 'Progress',
      settings: 'Settings',
      
      // Course related
      grade: 'Grade',
      lessons: 'lessons',
      completed: 'completed',
      continue: 'Continue',
      start: 'Start',
      downloadForOffline: 'Download for offline use',
      
      // Subjects
      subjects: {
        mathematics: 'Mathematics',
        science: 'Science',
        physics: 'Physics',
        chemistry: 'Chemistry',
        biology: 'Biology',
        languages: 'Languages',
        english: 'English',
        dari: 'Dari',
        pashto: 'Pashto',
        history: 'History',
        geography: 'Geography',
        arts: 'Arts',
        technology: 'Technology',
        computerScience: 'Computer Science'
      },
      
      // IB Programs
      programs: {
        PYP: 'Primary Years Programme',
        MYP: 'Middle Years Programme',
        DP: 'Diploma Programme'
      },
      
      // Common phrases
      welcome: 'Welcome',
      search: 'Search',
      filter: 'Filter',
      sortBy: 'Sort by',
      showMore: 'Show more',
      showLess: 'Show less',
      loading: 'Loading...',
      error: 'Error',
      retry: 'Retry',
      offline: 'Offline',
      online: 'Online'
    }
  },
  fa: {
    translation: {
      // Navigation
      home: 'خانه',
      courses: 'دوره‌ها',
      myLearning: 'یادگیری من',
      progress: 'پیشرفت',
      settings: 'تنظیمات',
      
      // Course related
      grade: 'صنف',
      lessons: 'درس',
      completed: 'تکمیل شده',
      continue: 'ادامه',
      start: 'شروع',
      downloadForOffline: 'دانلود برای استفاده آفلاین',
      
      // Subjects
      subjects: {
        mathematics: 'ریاضیات',
        science: 'علوم',
        physics: 'فیزیک',
        chemistry: 'کیمیا',
        biology: 'بیولوژی',
        languages: 'زبان‌ها',
        english: 'انگلیسی',
        dari: 'دری',
        pashto: 'پشتو',
        history: 'تاریخ',
        geography: 'جغرافیا',
        arts: 'هنر',
        technology: 'تکنالوژی',
        computerScience: 'علوم کامپیوتر'
      },
      
      // IB Programs
      programs: {
        PYP: 'برنامه سال‌های ابتدایی',
        MYP: 'برنامه سال‌های متوسطه',
        DP: 'برنامه دیپلوم'
      },
      
      // Common phrases
      welcome: 'خوش آمدید',
      search: 'جستجو',
      filter: 'فیلتر',
      sortBy: 'مرتب‌سازی بر اساس',
      showMore: 'نمایش بیشتر',
      showLess: 'نمایش کمتر',
      loading: 'در حال بارگذاری...',
      error: 'خطا',
      retry: 'تلاش مجدد',
      offline: 'آفلاین',
      online: 'آنلاین'
    }
  },
  ps: {
    translation: {
      // Navigation
      home: 'کور',
      courses: 'کورسونه',
      myLearning: 'زما زده کړه',
      progress: 'پرمختګ',
      settings: 'تنظیمات',
      
      // Course related
      grade: 'ټولګی',
      lessons: 'درسونه',
      completed: 'بشپړ شوی',
      continue: 'دوام',
      start: 'پیل',
      downloadForOffline: 'د آفلاین کارولو لپاره ډاونلوډ',
      
      // Subjects
      subjects: {
        mathematics: 'ریاضیات',
        science: 'ساینس',
        physics: 'فزیک',
        chemistry: 'کیمیا',
        biology: 'بیولوژي',
        languages: 'ژبې',
        english: 'انګلیسي',
        dari: 'دري',
        pashto: 'پښتو',
        history: 'تاریخ',
        geography: 'جغرافیه',
        arts: 'هنر',
        technology: 'ټکنالوژي',
        computerScience: 'کمپیوټر ساینس'
      },
      
      // IB Programs
      programs: {
        PYP: 'د لومړنیو کلونو برنامه',
        MYP: 'د منځنیو کلونو برنامه',
        DP: 'د ډیپلوم برنامه'
      },
      
      // Common phrases
      welcome: 'ښه راغلاست',
      search: 'لټون',
      filter: 'فلټر',
      sortBy: 'ترتیب په',
      showMore: 'نور وښایاست',
      showLess: 'لږ وښایاست',
      loading: 'بارول کیږي...',
      error: 'خطا',
      retry: 'بیا هڅه',
      offline: 'آفلاین',
      online: 'آنلاین'
    }
  }
};

// Initialize i18n
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    
    interpolation: {
      escapeValue: false // React already escapes values
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    }
  });

export default i18n;