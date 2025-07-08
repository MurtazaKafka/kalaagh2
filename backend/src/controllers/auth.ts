import { Request, Response } from 'express';

export const authController = {
  register: async (req: Request, res: Response) => {
    res.json({ message: 'Register endpoint - Coming soon' });
  },

  login: async (req: Request, res: Response) => {
    res.json({ message: 'Login endpoint - Coming soon' });
  },

  refresh: async (req: Request, res: Response) => {
    res.json({ message: 'Refresh token endpoint - Coming soon' });
  },

  logout: async (req: Request, res: Response) => {
    res.json({ message: 'Logout endpoint - Coming soon' });
  },

  forgotPassword: async (req: Request, res: Response) => {
    res.json({ message: 'Forgot password endpoint - Coming soon' });
  },

  resetPassword: async (req: Request, res: Response) => {
    res.json({ message: 'Reset password endpoint - Coming soon' });
  },

  verifyEmail: async (req: Request, res: Response) => {
    res.json({ message: 'Verify email endpoint - Coming soon' });
  },

  resendVerification: async (req: Request, res: Response) => {
    res.json({ message: 'Resend verification endpoint - Coming soon' });
  },
};