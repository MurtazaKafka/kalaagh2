# 🌟 Kalaagh Educational Platform

**Empowering Afghan Girls Through Technology and Education**

Kalaagh (کلاغ - "crow" in Dari/Persian) is a comprehensive K-12 educational platform designed to provide world-class education to Afghan girls who have been denied access to schools. This humanitarian technology project aims to replace traditional schooling with a complete online learning experience.

## 🎯 Mission

To provide comprehensive K-12 education to Afghan girls worldwide, ensuring they have access to quality education despite systematic oppression and discrimination.

## 🏗️ Architecture

### Frontend (`/frontend`)
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with RTL support
- **State Management**: Zustand + React Query
- **Internationalization**: react-i18next (English, Dari, Pashto)

### Backend (`/backend`)
- **Runtime**: Node.js 18+ with Express.js
- **Database**: PostgreSQL (production), SQLite (development)
- **ORM**: Knex.js
- **Authentication**: JWT with bcrypt
- **File Storage**: AWS S3 integration

### Database (`/database`)
- **Schema**: Complete educational platform schema
- **Migrations**: Knex.js migrations
- **Seeds**: Initial data and content

## 🌟 Key Features

- **Complete K-12 Curriculum**: 5,800+ video lessons across all subjects
- **Multi-language Support**: English, Dari (دری), Pashto (پښتو)
- **Cultural Design**: Afghan-inspired vintage newspaper aesthetic
- **Assessment Engine**: Comprehensive testing and evaluation system
- **Progress Tracking**: Advanced analytics and learning insights
- **Offline Capabilities**: PWA with offline content access
- **Community Features**: Discussion forums, mentorship, study groups
- **Certification System**: Professional certificates with QR verification

## 🚀 Getting Started

### Quick Start (Recommended)

```bash
# Start all development servers with one command
./start-dev.sh
```

This will:
- Check and install dependencies
- Run database migrations
- Start backend server on port 3001
- Start frontend server on port 5173
- Monitor server health
- Provide interactive commands

### Alternative Commands

```bash
# Simple server startup (no monitoring)
./dev.sh

# Stop all servers
./stop-dev.sh

# Development utilities menu
./dev-utils.sh
```

### Prerequisites
- Node.js 18 or higher
- PostgreSQL 13 or higher (or SQLite for development)
- Git

### Manual Installation

```bash
# Clone the repository
git clone <repository-url>
cd kalaagh2

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install

# Set up database
cd ../database
npm run migrate
npm run seed
```

### Development

```bash
# Start frontend development server
cd frontend
npm run dev

# Start backend development server
cd backend
npm run dev

# Run database migrations
cd database
npm run migrate:latest
```

## 🛠️ Development Scripts

### `./start-dev.sh`
Comprehensive development server manager with:
- Automatic dependency installation
- Database migration checks
- Port conflict resolution
- Real-time server monitoring
- Interactive commands (press 'h' for help)

### `./dev.sh`
Quick server startup without monitoring

### `./stop-dev.sh`
Stops all development servers

### `./dev-utils.sh`
Interactive menu with utilities for:
- Server management
- Database operations
- Content synchronization
- Log viewing
- Testing and building

### `./deploy.sh`
Production deployment script

## 📚 Educational Content

### Subjects Covered
- **Mathematics**: Complete K-12 (2,000+ lessons)
- **Science**: Biology, Chemistry, Physics (1,500+ lessons)
- **Language Arts**: Reading, Writing, Grammar (1,000+ lessons)
- **Social Studies**: History, Geography, Civics (800+ lessons)
- **Computer Science**: Programming, Digital Literacy (300+ lessons)
- **Life Skills**: Health, Safety, Practical Skills (200+ lessons)

### Content Sources
- Khan Academy (primary source)
- MIT OpenCourseWare
- Coursera/edX Open Content
- OER Commons
- Custom Afghan educator content

## 🔒 Security & Privacy

- **GDPR Compliant**: Complete data protection compliance
- **Secure Authentication**: Multi-factor authentication support
- **Encrypted Storage**: All data encrypted at rest and in transit
- **Anonymous Learning**: Optional anonymous learning modes
- **Content Moderation**: AI-powered with human oversight

## 🌍 Global Impact

### Target Metrics
- **100,000+** Afghan girls served globally
- **99.9%** platform uptime
- **Complete K-12** education equivalent
- **Multi-country** deployment across Afghan diaspora communities

### Success Stories
*This section will be updated as the platform launches and grows*

## 🤝 Contributing

We welcome contributions from developers, educators, and advocates worldwide. Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Ways to Contribute
- **Development**: Frontend, backend, mobile app development
- **Content**: Educational content creation and translation
- **Design**: UI/UX design and cultural adaptation
- **Testing**: Quality assurance and user testing
- **Documentation**: Technical and user documentation
- **Translation**: Dari and Pashto translation services

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, questions, or feedback:
- **Email**: support@kalaagh.org
- **Community**: Join our Discord server
- **Documentation**: Visit our comprehensive docs

## 🙏 Acknowledgments

- Afghan educators and community leaders
- Open educational resource providers
- Global development and humanitarian organizations
- The international community supporting Afghan women's education

---

**"Education is the most powerful weapon which you can use to change the world."** - Nelson Mandela

*For Afghan girls, Kalaagh is that weapon.*