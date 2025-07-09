import { create } from 'zustand';
import { api } from '../services/api';

interface Course {
  id: string;
  title: {
    en: string;
    fa?: string;
    ps?: string;
  };
  description?: string;
  subject: string;
  gradeLevel: number;
  thumbnail?: string;
  progress: number;
  totalLessons?: number;
  completedLessons?: number;
  duration?: string;
  instructor?: string;
  ibProgram?: 'PYP' | 'MYP' | 'DP';
  hasOfflineContent?: boolean;
}

interface CourseStore {
  courses: Course[];
  isLoading: boolean;
  error: string | null;
  selectedCourse: Course | null;
  
  // Actions
  fetchCourses: () => Promise<void>;
  selectCourse: (courseId: string) => void;
  updateCourseProgress: (courseId: string, progress: number) => void;
  reset: () => void;
}

export const useCourseStore = create<CourseStore>((set, get) => ({
  courses: [],
  isLoading: false,
  error: null,
  selectedCourse: null,

  fetchCourses: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await api.get('/courses');
      const courses = response.data.courses || response.data;
      
      // Transform the data if needed
      const transformedCourses = Array.isArray(courses) ? courses.map((course: any) => ({
        ...course,
        title: typeof course.title === 'string' 
          ? { en: course.title } 
          : course.title,
        progress: course.progress || 0,
        hasOfflineContent: course.hasOfflineContent || false,
      })) : [];
      
      set({ courses: transformedCourses, isLoading: false });
    } catch (error: any) {
      console.error('Failed to fetch courses:', error);
      set({ 
        error: error.response?.data?.message || error.message || 'Failed to fetch courses',
        isLoading: false 
      });
    }
  },

  selectCourse: (courseId: string) => {
    const course = get().courses.find(c => c.id === courseId);
    set({ selectedCourse: course || null });
  },

  updateCourseProgress: (courseId: string, progress: number) => {
    set(state => ({
      courses: state.courses.map(course =>
        course.id === courseId
          ? { ...course, progress }
          : course
      ),
      selectedCourse: state.selectedCourse?.id === courseId
        ? { ...state.selectedCourse, progress }
        : state.selectedCourse
    }));
  },

  reset: () => set({ 
    courses: [], 
    isLoading: false, 
    error: null,
    selectedCourse: null 
  }),
}));