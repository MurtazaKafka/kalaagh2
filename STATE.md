=== FRONTEND STRUCTURE ===
frontend/src/App.tsx
frontend/src/main.tsx
frontend/src/VintageApp.tsx
frontend/src/styles/design-system.ts
frontend/src/components/ui/Card.tsx
frontend/src/components/ui/Alert.tsx
frontend/src/components/ui/Badge.tsx
frontend/src/components/ui/index.ts
frontend/src/components/ui/Button.tsx
frontend/src/components/ui/Input.tsx
frontend/src/components/course/LessonList.tsx
frontend/src/components/course/CourseCard.tsx
frontend/src/components/course/index.ts
frontend/src/components/progress/ProgressCard.tsx
frontend/src/components/progress/StatsChart.tsx
frontend/src/components/progress/index.ts
frontend/src/components/layout/Container.tsx
frontend/src/components/layout/Grid.tsx
frontend/src/components/layout/Footer.tsx
frontend/src/components/layout/Header.tsx

=== API CALLS FOUND ===
frontend/src//App.tsx:import { contentApi, healthCheck } from './services/api'
frontend/src//App.tsx:    { name: 'English', progress: 85, color: theme.colors.accent.lapis },
frontend/src//VintageApp.tsx:import { contentApi, healthCheck } from './services/api';
frontend/src//styles/design-system.ts:    lapis: '#26619C',        // For info
frontend/src//components/ui/Badge.tsx:    info: theme.colors.accent.lapis,
frontend/src//components/vintage/CourseCard.tsx:    languages: '#26619C',       // Lapis
frontend/src//services/api.ts:import axios from 'axios';
frontend/src//services/api.ts:const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';
frontend/src//services/api.ts:export const api = axios.create({
frontend/src//services/api.ts:    const response = await api.get('/content-management/sources');

=== BACKEND STRUCTURE ===
total 32
drwxr-xr-x  10 murtaza  staff   320 Jul  7 23:21 .
drwxr-xr-x@ 28 murtaza  staff   896 Jul  8 20:38 ..
-rw-r--r--   1 murtaza  staff   856 Jun 29 11:16 .env
-rw-r--r--   1 murtaza  staff  1466 Jun 29 10:30 .env.example
drwxr-xr-x   7 murtaza  staff   224 Jul  7 23:21 content
-rw-r--r--   1 murtaza  staff     0 Jun 29 11:06 dev.db
drwxr-xr-x  16 murtaza  staff   512 Jun 29 11:00 node_modules
-rw-r--r--   1 murtaza  staff  2476 Jul  7 22:54 package.json
drwxr-xr-x  11 murtaza  staff   352 Jun 29 10:30 src
-rw-r--r--   1 murtaza  staff  1337 Jun 29 10:29 tsconfig.json

=== INSTALLED PACKAGES (FRONTEND) ===
  "dependencies": {
    "@hookform/resolvers": "^5.1.1",
    "@tanstack/react-query": "^5.81.5",
    "@tanstack/react-query-devtools": "^5.81.5",
    "axios": "^1.10.0",
    "date-fns": "^4.1.0",
    "framer-motion": "^12.19.2",
    "i18next": "^25.3.1",
    "i18next-browser-languagedetector": "^8.2.0",
    "i18next-http-backend": "^3.0.2",
    "lucide-react": "^0.525.0",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "react-hook-form": "^7.59.0",
    "react-i18next": "^15.6.0",
    "react-player": "^3.0.0",
    "react-router-dom": "^7.6.3",
    "sass": "^1.89.2",
    "zod": "^3.25.67",
    "zustand": "^5.0.6"
  },

=== INSTALLED PACKAGES (BACKEND) ===
  "dependencies": {
    "@aws-sdk/client-s3": "^3.693.0",
    "bcryptjs": "^2.4.3",
    "compression": "^1.7.4",
    "cors": "^2.8.5",
    "dotenv": "^16.4.7",
    "express": "^4.19.2",
    "express-rate-limit": "^7.4.1",
    "express-validator": "^7.2.0",
    "helmet": "^8.0.0",
    "joi": "^17.13.3",
    "jsonwebtoken": "^9.0.2",
    "knex": "^3.1.0",
    "morgan": "^1.10.0",
    "multer": "^1.4.5-lts.1",
    "nodemailer": "^6.9.17",
    "pg": "^8.13.1",
    "rate-limiter-flexible": "^5.0.3",
    "sqlite3": "^5.1.7",
    "swagger-jsdoc": "^6.2.8",
    "swagger-ui-express": "^5.0.1",

=== ENVIRONMENT SETUP ===
Frontend: No .env files found
Backend: 
-rw-r--r--  1 murtaza  staff   856 Jun 29 11:16 backend/.env
-rw-r--r--  1 murtaza  staff  1466 Jun 29 10:30 backend/.env.example

=== BACKEND API ROUTES ===
backend/src/controllers
assessments.ts
auth.ts
content.ts
contentManagement.ts
courses.ts
integrations.ts
progress.ts
users.ts

=== BACKEND ENTRY POINT ===
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
