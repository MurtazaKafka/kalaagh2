import { Request, Response } from 'express';

export const courseController = {
  getAllCourses: async (req: Request, res: Response) => {
    res.json({ message: 'Get all courses endpoint - Coming soon' });
  },

  searchCourses: async (req: Request, res: Response) => {
    res.json({ message: 'Search courses endpoint - Coming soon' });
  },

  getCategories: async (req: Request, res: Response) => {
    res.json({ message: 'Get categories endpoint - Coming soon' });
  },

  getCourseById: async (req: Request, res: Response) => {
    res.json({ message: 'Get course by ID endpoint - Coming soon' });
  },

  enrollInCourse: async (req: Request, res: Response) => {
    res.json({ message: 'Enroll in course endpoint - Coming soon' });
  },

  unenrollFromCourse: async (req: Request, res: Response) => {
    res.json({ message: 'Unenroll from course endpoint - Coming soon' });
  },

  getCourseLessons: async (req: Request, res: Response) => {
    res.json({ message: 'Get course lessons endpoint - Coming soon' });
  },

  getCourseProgress: async (req: Request, res: Response) => {
    res.json({ message: 'Get course progress endpoint - Coming soon' });
  },
};