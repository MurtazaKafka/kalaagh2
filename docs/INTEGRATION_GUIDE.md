# Kalaagh Educational Platform - Integration Guide

## Overview

This guide details the comprehensive integration of open-source educational resources into the Kalaagh platform, designed specifically for Afghan girls studying the International Baccalaureate (IB) curriculum. The integration prioritizes offline functionality, multilingual support (English, Dari, Pashto), and culturally sensitive content delivery.

## Integrated Platforms

### 1. Khan Academy
- **Content**: 10,000+ videos covering K-12 mathematics, science, computing, and economics
- **IB Alignment**: Mapped to PYP, MYP, and DP programmes
- **Features**: 
  - YouTube video downloads with subtitle extraction
  - Automatic quality adjustment based on bandwidth
  - Progress tracking overlay
  - Translation queue for Dari/Pashto

### 2. CK-12 Foundation
- **Content**: FlexBooks, PLIX simulations, practice exercises
- **Features**:
  - Custom FlexBook creation in multiple languages
  - Flexi AI tutoring integration
  - Downloadable PDF/EPUB formats
  - Interactive simulations

### 3. PhET Interactive Simulations
- **Content**: 125+ HTML5 science and math simulations
- **Languages**: English, Arabic (adaptable to Dari)
- **Features**:
  - Complete offline functionality
  - Activity guides in multiple languages
  - Touch-optimized for tablets

### 4. Code.org
- **Content**: CS Fundamentals, CS Discoveries, CS Principles
- **Features**:
  - LTI 1.3 integration for progress tracking
  - Unplugged activities for offline learning
  - Visual block-based programming
  - Teacher resources and lesson plans

### 5. BBC Bitesize Dari/Pashto
- **Content**: Existing Dari/Pashto educational videos
- **Note**: Only existing multilingual content source

## Architecture Components

### 1. Database Schema
```sql
-- Enhanced content management tables
- content_items (with IB mapping, offline support, cultural flags)
- user_progress (tracks learning with offline sync)
- offline_content_queue (manages downloads)
- translation_requests (community translation system)
```

### 2. Core Services

#### Content Downloader Service
```typescript
// Manages offline content with progressive download
- Video transcoding for multiple qualities
- Bandwidth-aware downloading
- Queue management with priorities
- Progress tracking
```

#### Translation Service
```typescript
// Multilingual support system
- Machine translation with educational dictionary
- Community translation workflow
- RTL language support
- Quality scoring
```

#### Cultural Adaptation Engine
```typescript
// Ensures content appropriateness
- Sensitive topic detection
- Grade-appropriate filtering
- Cultural context notes
- Alternative content suggestions
```

#### Bandwidth Optimization Service
```typescript
// Adapts to network conditions
- Real-time bandwidth measurement
- Adaptive quality selection
- Smart prefetching
- Video compression profiles
```

#### License Compliance Service
```typescript
// Manages open license requirements
- Attribution generation
- License compatibility checking
- Bulk compliance reporting
- Export for legal review
```

### 3. Offline-First Architecture

#### Service Worker
- Caches static assets and content
- Implements cache strategies per content type
- Background sync for progress updates
- Download progress tracking

#### Offline Page
- Multilingual offline experience
- Access to cached content
- Connection status checking

## API Endpoints

### Integration Routes
```
POST   /api/v1/integrations/sync              # Sync all content sources
GET    /api/v1/integrations/statistics        # Get sync statistics
GET    /api/v1/integrations/search            # Search across platforms
POST   /api/v1/integrations/download/:id      # Queue offline download
GET    /api/v1/integrations/downloads/status  # Check download status
POST   /api/v1/integrations/translate/:id     # Request translation
GET    /api/v1/integrations/cultural-review/:id # Get cultural review
GET    /api/v1/integrations/bandwidth/recommendations # Bandwidth advice
GET    /api/v1/integrations/license/compliance # License report
GET    /api/v1/integrations/attributions      # Attribution page
POST   /api/v1/integrations/lti/setup         # Setup LTI integration
```

## Implementation Checklist

### Phase 1: Infrastructure ✓
- [x] Database schema with IB mapping
- [x] Content downloader service
- [x] Offline storage system
- [x] Service worker implementation

### Phase 2: Core Integrations ✓
- [x] Enhanced Khan Academy service
- [x] CK-12 Foundation integration
- [x] PhET simulations import
- [x] Code.org curriculum mapping

### Phase 3: Support Services ✓
- [x] Translation management system
- [x] Cultural adaptation engine
- [x] Bandwidth optimization
- [x] License compliance

### Phase 4: Deployment (Pending)
- [ ] Deploy services to production
- [ ] Configure CDN for content delivery
- [ ] Set up monitoring and analytics
- [ ] Train content moderators

## Usage Examples

### 1. Sync Educational Content
```bash
# Sync all content for grade 8
POST /api/v1/integrations/sync?gradeLevel=8

# Sync only mathematics content
POST /api/v1/integrations/sync?subject=mathematics
```

### 2. Search Content
```bash
# Search for algebra content in Dari
GET /api/v1/integrations/search?query=algebra&language=fa

# Find grade 5 interactive content
GET /api/v1/integrations/search?gradeLevel=5&contentType=interactive
```

### 3. Download for Offline
```bash
# Queue video download
POST /api/v1/integrations/download/content-123
{
  "quality": "medium"
}

# Check download status
GET /api/v1/integrations/downloads/status
```

### 4. Request Translation
```bash
# Request Dari translation
POST /api/v1/integrations/translate/content-123
{
  "targetLanguage": "fa",
  "translationType": "title"
}
```

## Configuration

### Environment Variables
```env
# Content storage
CONTENT_DIR=/path/to/content

# Translation
TRANSLATION_API_KEY=your-key

# Integration APIs
CK12_API_KEY=your-key
KHAN_ACADEMY_API_KEY=your-key

# Bandwidth
MAX_CONCURRENT_DOWNLOADS=3
DEFAULT_VIDEO_QUALITY=medium
```

### Service Worker Registration
```javascript
// In your main app
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
    .then(reg => console.log('Service Worker registered'))
    .catch(err => console.error('Service Worker failed', err));
}
```

## Content Guidelines

### IB Programme Mapping
- **PYP (K-5)**: Focus on inquiry-based learning
- **MYP (6-10)**: Interdisciplinary connections
- **DP (11-12)**: University preparation

### Cultural Sensitivity
- Science topics presented with cultural context
- Alternative approaches for sensitive content
- Emphasis on Afghan cultural contributions
- Gender-appropriate content selection

### Language Priorities
1. English (primary for IB)
2. Dari (official language)
3. Pashto (widely spoken)

## Monitoring and Analytics

### Key Metrics
```javascript
{
  contentMetrics: {
    totalResources: 50000,
    offlineAvailable: 30000,
    translatedContent: {
      dari: 5000,
      pashto: 3000
    }
  },
  usageMetrics: {
    dailyActiveUsers: 10000,
    offlineUsagePercentage: 65,
    popularSubjects: ['mathematics', 'science']
  },
  performanceMetrics: {
    avgDownloadSpeed: '250 Kbps',
    cacheHitRate: 85
  }
}
```

## Troubleshooting

### Common Issues

1. **Slow Downloads**
   - Check bandwidth recommendations endpoint
   - Use lower quality settings
   - Enable download during off-peak hours

2. **Translation Errors**
   - Verify language codes (fa for Dari, ps for Pashto)
   - Check translation queue status
   - Fall back to community translations

3. **Cultural Flags**
   - Review flagged content manually
   - Apply suggested alternatives
   - Update cultural adaptation rules

4. **Offline Sync Issues**
   - Check service worker registration
   - Verify IndexedDB storage
   - Monitor sync queue

## Future Enhancements

1. **Additional Platforms**
   - MIT OpenCourseWare for DP
   - Smarthistory for arts
   - CORE Economics

2. **Advanced Features**
   - AI-powered content recommendations
   - Collaborative learning tools
   - Parent progress portal
   - Teacher content curation

3. **Infrastructure**
   - P2P content sharing
   - Mesh network support
   - SMS-based lessons
   - Radio broadcast integration

## Support

For technical support or content questions:
- GitHub Issues: [kalaagh/platform](https://github.com/kalaagh/platform)
- Email: support@kalaagh.org
- Documentation: [docs.kalaagh.org](https://docs.kalaagh.org)