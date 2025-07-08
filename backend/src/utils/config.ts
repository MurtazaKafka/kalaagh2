import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const configSchema = z.object({
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
  port: z.coerce.number().default(3001),
  apiVersion: z.string().default('v1'),
  
  // Database
  databaseUrl: z.string().optional(),
  dbHost: z.string().default('localhost'),
  dbPort: z.coerce.number().default(5432),
  dbName: z.string().default('kalaagh'),
  dbUser: z.string().default('postgres'),
  dbPassword: z.string().default('password'),
  dbSsl: z.coerce.boolean().default(false),
  devDatabasePath: z.string().default('./dev.db'),
  
  // JWT
  jwtSecret: z.string().min(32),
  jwtExpiresIn: z.string().default('7d'),
  jwtRefreshSecret: z.string().min(32),
  jwtRefreshExpiresIn: z.string().default('30d'),
  
  // Email
  smtpHost: z.string().default('smtp.gmail.com'),
  smtpPort: z.coerce.number().default(587),
  smtpSecure: z.coerce.boolean().default(false),
  smtpUser: z.string().optional(),
  smtpPass: z.string().optional(),
  fromEmail: z.string().email().default('noreply@kalaagh.org'),
  fromName: z.string().default('Kalaagh Platform'),
  
  // AWS S3
  awsRegion: z.string().default('us-east-1'),
  awsAccessKeyId: z.string().optional(),
  awsSecretAccessKey: z.string().optional(),
  s3BucketName: z.string().default('kalaagh-content'),
  s3PublicUrl: z.string().url().optional(),
  
  // Security
  bcryptSaltRounds: z.coerce.number().default(12),
  rateLimitWindowMs: z.coerce.number().default(900000), // 15 minutes
  rateLimitMaxRequests: z.coerce.number().default(100),
  
  // CORS
  corsOrigin: z.string().default('http://localhost:5173,http://localhost:5174,http://localhost:3000'),
  corsOrigins: z.array(z.string()).optional(),
  corsCredentials: z.coerce.boolean().default(true),
  
  // File Upload
  maxFileSize: z.string().default('100MB'),
  maxVideoSize: z.string().default('500MB'),
  
  // External APIs
  khanAcademyApiKey: z.string().optional(),
  
  // Logging
  logLevel: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  logFile: z.string().default('./logs/app.log'),
  
  // URLs
  frontendUrl: z.string().url().default('http://localhost:5173'),
  backendUrl: z.string().url().default('http://localhost:3001'),
});

const parseConfig = () => {
  const rawConfig = {
    nodeEnv: process.env.NODE_ENV,
    port: process.env.PORT,
    apiVersion: process.env.API_VERSION,
    
    databaseUrl: process.env.DATABASE_URL,
    dbHost: process.env.DB_HOST,
    dbPort: process.env.DB_PORT,
    dbName: process.env.DB_NAME,
    dbUser: process.env.DB_USER,
    dbPassword: process.env.DB_PASSWORD,
    dbSsl: process.env.DB_SSL,
    devDatabasePath: process.env.DEV_DATABASE_PATH,
    
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    
    smtpHost: process.env.SMTP_HOST,
    smtpPort: process.env.SMTP_PORT,
    smtpSecure: process.env.SMTP_SECURE,
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASS,
    fromEmail: process.env.FROM_EMAIL,
    fromName: process.env.FROM_NAME,
    
    awsRegion: process.env.AWS_REGION,
    awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
    awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    s3BucketName: process.env.S3_BUCKET_NAME,
    s3PublicUrl: process.env.S3_PUBLIC_URL,
    
    bcryptSaltRounds: process.env.BCRYPT_SALT_ROUNDS,
    rateLimitWindowMs: process.env.RATE_LIMIT_WINDOW_MS,
    rateLimitMaxRequests: process.env.RATE_LIMIT_MAX_REQUESTS,
    
    corsOrigin: process.env.CORS_ORIGIN,
    corsCredentials: process.env.CORS_CREDENTIALS,
    
    maxFileSize: process.env.MAX_FILE_SIZE,
    maxVideoSize: process.env.MAX_VIDEO_SIZE,
    
    khanAcademyApiKey: process.env.KHAN_ACADEMY_API_KEY,
    
    logLevel: process.env.LOG_LEVEL,
    logFile: process.env.LOG_FILE,
    
    frontendUrl: process.env.FRONTEND_URL,
    backendUrl: process.env.BACKEND_URL,
  };

  try {
    return configSchema.parse(rawConfig);
  } catch (error) {
    console.error('❌ Invalid configuration:', error);
    process.exit(1);
  }
};

export const config = parseConfig();

// Parse CORS origins
export const getCorsOrigins = (): string[] => {
  if (config.corsOrigins) {
    return config.corsOrigins;
  }
  if (config.corsOrigin.includes(',')) {
    return config.corsOrigin.split(',').map(origin => origin.trim());
  }
  return [config.corsOrigin];
};

// Helper function to check if we're in development
export const isDevelopment = () => config.nodeEnv === 'development';

// Helper function to check if we're in production
export const isProduction = () => config.nodeEnv === 'production';

// Helper function to check if we're in test
export const isTest = () => config.nodeEnv === 'test';