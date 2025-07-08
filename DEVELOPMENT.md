# Kalaagh Development Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- npm 9 or higher
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd kalaagh2
   ```

2. **Install dependencies**
   ```bash
   npm install
   npm run install:all
   ```

3. **Set up environment variables**
   ```bash
   # Copy environment template
   cp backend/.env.example backend/.env
   # Edit backend/.env with your configuration
   ```

4. **Set up database**
   ```bash
   npm run migrate
   npm run seed
   ```

5. **Start development servers**
   ```bash
   # Start both frontend and backend
   npm run dev

   # Or start individually
   npm run dev:frontend  # Frontend on http://localhost:5173
   npm run dev:backend   # Backend on http://localhost:3001
   ```

## 📁 Project Structure

```
kalaagh2/
├── frontend/           # React TypeScript frontend
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Page components
│   │   ├── hooks/      # Custom React hooks
│   │   ├── store/      # Zustand state management
│   │   ├── utils/      # Utility functions
│   │   └── i18n/       # Internationalization
│   ├── public/         # Static assets
│   └── package.json
├── backend/            # Node.js Express backend
│   ├── src/
│   │   ├── controllers/# Route controllers
│   │   ├── middleware/ # Express middleware
│   │   ├── models/     # Database models
│   │   ├── routes/     # API routes
│   │   ├── services/   # Business logic
│   │   ├── utils/      # Utility functions
│   │   └── types/      # TypeScript types
│   └── package.json
├── database/           # Database schema and migrations
│   ├── migrations/     # Knex.js migrations
│   ├── seeds/          # Database seed data
│   └── knexfile.js     # Database configuration
├── docs/               # Documentation
├── scripts/            # Build and deployment scripts
└── package.json        # Root package.json
```

## 🛠️ Development Commands

### Root Commands
```bash
npm run dev              # Start both frontend and backend
npm run build            # Build both applications
npm run test             # Run all tests
npm run lint             # Lint all code
npm run typecheck        # TypeScript type checking
npm run install:all      # Install all dependencies
```

### Database Commands
```bash
npm run migrate          # Run database migrations
npm run seed             # Seed database with initial data
npm run reset-db         # Reset database (rollback + migrate + seed)
```

### Frontend Commands
```bash
cd frontend
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build
npm run test             # Run tests
npm run lint             # ESLint
npm run typecheck        # TypeScript checking
```

### Backend Commands
```bash
cd backend
npm run dev              # Start development server with hot reload
npm run build            # Compile TypeScript
npm run start            # Start production server
npm run test             # Run tests
npm run lint             # ESLint
npm run typecheck        # TypeScript checking
```

### Database Commands (from database directory)
```bash
cd database
npx knex migrate:make <name>     # Create new migration
npx knex migrate:latest          # Run pending migrations
npx knex migrate:rollback        # Rollback last migration
npx knex seed:make <name>        # Create new seed file
npx knex seed:run                # Run seed files
```

## 🌐 API Documentation

When the backend is running, visit:
- **API Documentation**: http://localhost:3001/api/docs
- **Health Check**: http://localhost:3001/health

## 📊 Database Schema

The platform uses a comprehensive database schema with the following main tables:

### Core Tables
- **users**: User accounts and profiles
- **subjects**: Educational subjects (Math, Science, etc.)
- **courses**: Individual courses within subjects
- **lessons**: Video lessons and content within courses
- **enrollments**: User enrollments in courses

### Progress Tracking
- **lesson_progress**: Individual lesson completion tracking
- **assessments**: Quizzes and tests
- **questions**: Assessment questions
- **assessment_submissions**: Student test submissions
- **certificates**: Course completion certificates

## 🎨 Frontend Architecture

### State Management
- **Zustand**: Global state management
- **React Query**: Server state and caching
- **React Hook Form**: Form state management

### Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Afghan-inspired Design**: Custom color palette and typography
- **RTL Support**: Right-to-left layout for Dari and Pashto

### Internationalization
- **react-i18next**: Multi-language support
- **Languages**: English, Dari (دری), Pashto (پښتو)
- **Cultural Adaptation**: Context-appropriate content

## 🔧 Backend Architecture

### Framework & Libraries
- **Express.js**: Web framework
- **TypeScript**: Type safety
- **Knex.js**: Database query builder
- **JWT**: Authentication
- **Winston**: Logging

### Security Features
- **Helmet**: Security headers
- **Rate Limiting**: API rate limiting
- **CORS**: Cross-origin resource sharing
- **Input Validation**: Request validation
- **Password Hashing**: bcrypt

### File Storage
- **AWS S3**: Video and resource storage
- **Local Storage**: Development fallback

## 🧪 Testing

### Frontend Testing
```bash
cd frontend
npm run test        # Run unit tests
npm run test:watch  # Watch mode
```

### Backend Testing
```bash
cd backend
npm run test            # Run unit tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report
```

## 📱 Progressive Web App (PWA)

The frontend is configured as a PWA with:
- **Offline Support**: Core functionality works offline
- **Service Worker**: Background sync and caching
- **App Manifest**: Native app-like experience
- **Push Notifications**: Course updates and reminders

## 🌍 Deployment

### Environment Variables
Required environment variables for production:

```bash
# Database
DATABASE_URL=postgresql://...
DB_SSL=true

# JWT Secrets
JWT_SECRET=<strong-secret>
JWT_REFRESH_SECRET=<strong-secret>

# AWS S3
AWS_ACCESS_KEY_ID=<access-key>
AWS_SECRET_ACCESS_KEY=<secret-key>
S3_BUCKET_NAME=<bucket-name>

# Email
SMTP_HOST=<smtp-host>
SMTP_USER=<email>
SMTP_PASS=<password>
```

### Build for Production
```bash
npm run build
```

### Database Migration
```bash
NODE_ENV=production npm run migrate
NODE_ENV=production npm run seed
```

## 🤝 Contributing

### Code Style
- **ESLint**: JavaScript/TypeScript linting
- **Prettier**: Code formatting
- **Conventional Commits**: Commit message format

### Pull Request Process
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run linting and tests
6. Submit a pull request

### Development Guidelines
- **Component Structure**: Follow established patterns
- **Type Safety**: Use TypeScript throughout
- **Testing**: Add tests for new features
- **Documentation**: Update docs for changes
- **Accessibility**: Follow WCAG guidelines
- **Internationalization**: Support all three languages

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Kill processes on ports 3001 and 5173
   npx kill-port 3001 5173
   ```

2. **Database Connection Issues**
   - Check database is running
   - Verify connection string in `.env`
   - Run migrations: `npm run migrate`

3. **Node Version Issues**
   - Use Node.js 18 or higher
   - Consider using nvm: `nvm use 18`

4. **Module Resolution Issues**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

### Debug Mode
```bash
# Backend with debug logging
DEBUG=* npm run dev:backend

# Frontend with source maps
NODE_ENV=development npm run dev:frontend
```

## 📚 Educational Content Integration

### Khan Academy Integration
- Video content import
- Subtitle extraction
- Progress tracking alignment

### Custom Content
- Multi-language support
- Cultural adaptation
- Local educator contributions

### Quality Assurance
- Educational expert review
- Community feedback
- Continuous improvement

---

For more information, visit the [project documentation](./docs/) or contact the development team.