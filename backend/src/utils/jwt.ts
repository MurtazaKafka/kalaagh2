import jwt from 'jsonwebtoken';
import { config } from './config.js';

export interface TokenPayload {
  userId: string;
  role: string;
  email: string;
}

export interface RefreshTokenPayload {
  userId: string;
  type: 'refresh';
}

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
};

export const generateRefreshToken = (userId: string): string => {
  const payload: RefreshTokenPayload = {
    userId,
    type: 'refresh',
  };
  return jwt.sign(payload, config.jwtRefreshSecret, {
    expiresIn: config.jwtRefreshExpiresIn,
  });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwtSecret) as TokenPayload;
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  return jwt.verify(token, config.jwtRefreshSecret) as RefreshTokenPayload;
};

export const generateTokenPair = (user: { id: string; role: string; email: string }) => {
  const accessToken = generateAccessToken({
    userId: user.id,
    role: user.role,
    email: user.email,
  });
  const refreshToken = generateRefreshToken(user.id);
  
  return {
    accessToken,
    refreshToken,
  };
};