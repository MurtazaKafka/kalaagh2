import { Request, Response } from 'express';
import { db } from '../database/index.js';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const userController = {
  getProfile: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
        });
      }

      const user = await db('users')
        .where({ id: req.user.id })
        .select(
          'id',
          'email',
          'first_name',
          'last_name',
          'role',
          'gender',
          'date_of_birth',
          'country',
          'city',
          'preferred_language',
          'is_email_verified',
          'profile_picture_url',
          'bio',
          'last_login_at',
          'created_at'
        )
        .first();

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      res.json({
        success: true,
        user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch profile',
      });
    }
  },

  updateProfile: async (req: Request, res: Response) => {
    res.json({ message: 'Update profile endpoint - Coming soon' });
  },

  deleteProfile: async (req: Request, res: Response) => {
    res.json({ message: 'Delete profile endpoint - Coming soon' });
  },

  getUserProgress: async (req: Request, res: Response) => {
    res.json({ message: 'Get user progress endpoint - Coming soon' });
  },

  getUserCertificates: async (req: Request, res: Response) => {
    res.json({ message: 'Get user certificates endpoint - Coming soon' });
  },
};