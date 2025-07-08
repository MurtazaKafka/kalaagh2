import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config, getCorsOrigins } from './utils/config.js';
import { logger } from './utils/logger.js';
import { errorHandler } from './middleware/error.js';
import { notFoundHandler } from './middleware/notFound.js';
import { authRoutes } from './routes/auth.js';
import { userRoutes } from './routes/users.js';
import { courseRoutes } from './routes/courses.js';
import { contentRoutes } from './routes/content.js';
import { progressRoutes } from './routes/progress.js';
import { assessmentRoutes } from './routes/assessments.js';
import { contentManagementRoutes } from './routes/contentManagement.js';
import { integrationRoutes } from './routes/integrations.js';
import { swaggerDocs } from './utils/swagger.js';
import { initializeContentServices } from './controllers/contentManagement.js';
import knex from 'knex';
import knexConfig from '../../database/knexfile.js';

const app = express();

// Initialize database connection
const db = knex(knexConfig[config.nodeEnv]);

// Initialize content management services
initializeContentServices(db);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", 'https://api.kalaagh.org'],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// CORS configuration
const allowedOrigins = getCorsOrigins();

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: config.corsCredentials,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined', {
  stream: {
    write: (message: string) => logger.info(message.trim()),
  },
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    version: process.env.npm_package_version || '1.0.0',
  });
});

// API routes
app.use(`/api/${config.apiVersion}/auth`, authRoutes);
app.use(`/api/${config.apiVersion}/users`, userRoutes);
app.use(`/api/${config.apiVersion}/courses`, courseRoutes);
app.use(`/api/${config.apiVersion}/content`, contentRoutes);
app.use(`/api/${config.apiVersion}/progress`, progressRoutes);
app.use(`/api/${config.apiVersion}/assessments`, assessmentRoutes);
app.use(`/api/${config.apiVersion}/content-management`, contentManagementRoutes);
app.use(`/api/${config.apiVersion}/integrations`, integrationRoutes);

// Swagger documentation
app.use('/api/docs', ...swaggerDocs);

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

const server = app.listen(config.port, () => {
  logger.info(`🌟 Kalaagh Platform API Server running on port ${config.port}`);
  logger.info(`📚 Environment: ${config.nodeEnv}`);
  logger.info(`📖 API Documentation: http://localhost:${config.port}/api/docs`);
  logger.info(`🏥 Health Check: http://localhost:${config.port}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    logger.info('Process terminated');
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully...');
  server.close(() => {
    logger.info('Process terminated');
  });
});

export default app;