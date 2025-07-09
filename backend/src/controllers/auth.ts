import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/index.js';
import { generateTokenPair, verifyRefreshToken } from '../utils/jwt.js';
import { config } from '../utils/config.js';
import { logger } from '../utils/logger.js';

export const authController = {
  register: async (req: Request, res: Response) => {
    try {
      const {
        email,
        password,
        first_name,
        last_name,
        role = 'student',
        preferred_language = 'en',
        grade,
      } = req.body;

      // Validate required fields
      if (!email || !password || !first_name || !last_name) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: email, password, first_name, last_name',
        });
      }

      // Check if user already exists
      const existingUser = await db('users').where({ email }).first();
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'User with this email already exists',
        });
      }

      // Hash password
      const password_hash = await bcrypt.hash(password, config.bcryptSaltRounds);

      // Create user
      const userId = uuidv4();
      await db('users').insert({
        id: userId,
        email,
        password_hash,
        first_name,
        last_name,
        role,
        preferred_language,
        gender: 'female', // Default per schema
        is_email_verified: false,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      });

      // Generate tokens
      const { accessToken, refreshToken } = generateTokenPair({
        id: userId,
        role,
        email,
      });

      // Get user data (without password)
      const user = await db('users')
        .where({ id: userId })
        .select('id', 'email', 'first_name', 'last_name', 'role', 'preferred_language')
        .first();

      logger.info(`New user registered: ${email}`);

      res.status(201).json({
        success: true,
        token: accessToken,
        refreshToken,
        user,
      });
    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to register user',
      });
    }
  },

  login: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      // Validate required fields
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password are required',
        });
      }

      // Find user
      const user = await db('users')
        .where({ email, is_active: true })
        .first();

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password',
        });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password',
        });
      }

      // Update last login
      await db('users')
        .where({ id: user.id })
        .update({ last_login_at: new Date() });

      // Generate tokens
      const { accessToken, refreshToken } = generateTokenPair({
        id: user.id,
        role: user.role,
        email: user.email,
      });

      // Return user data (without password)
      const userData = {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        preferred_language: user.preferred_language,
      };

      logger.info(`User logged in: ${email}`);

      res.json({
        success: true,
        token: accessToken,
        refreshToken,
        user: userData,
      });
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to login',
      });
    }
  },

  refresh: async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          error: 'Refresh token is required',
        });
      }

      // Verify refresh token
      const payload = verifyRefreshToken(refreshToken);

      // Get user
      const user = await db('users')
        .where({ id: payload.userId, is_active: true })
        .select('id', 'email', 'role')
        .first();

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User not found or inactive',
        });
      }

      // Generate new tokens
      const tokens = generateTokenPair({
        id: user.id,
        role: user.role,
        email: user.email,
      });

      res.json({
        success: true,
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
    } catch (error) {
      logger.error('Token refresh error:', error);
      res.status(401).json({
        success: false,
        error: 'Invalid refresh token',
      });
    }
  },

  logout: async (req: Request, res: Response) => {
    // Since we're using stateless JWT, logout is handled client-side
    // This endpoint can be used for logging or token blacklisting if needed
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
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