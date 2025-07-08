#!/usr/bin/env node

import { program } from 'commander';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const API_BASE_URL = process.env.KALAAGH_API_URL || 'http://localhost:3001/api/v1';
const API_KEY = process.env.KALAAGH_API_KEY || '';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// API helper
async function apiCall(endpoint, method = 'GET', data = null) {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...(API_KEY && { 'Authorization': `Bearer ${API_KEY}` })
      }
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(`API Error: ${error.response.status} - ${error.response.data.error || error.response.statusText}`);
    } else {
      throw new Error(`Network Error: ${error.message}`);
    }
  }
}

// Subject mapping for Khan Academy
const KHAN_ACADEMY_SUBJECTS = {
  math: {
    slug: 'math',
    name: 'Mathematics',
    description: 'Complete mathematics curriculum from basic arithmetic to advanced calculus'
  },
  science: {
    slug: 'science',
    name: 'Science',
    description: 'Biology, Chemistry, Physics, and Earth Sciences'
  },
  computing: {
    slug: 'computing',
    name: 'Computer Science',
    description: 'Programming, algorithms, and computer science fundamentals'
  },
  'arts-humanities': {
    slug: 'arts-humanities',
    name: 'Language Arts',
    description: 'Literature, writing, grammar, and communication skills'
  },
  'economics-finance-domain': {
    slug: 'economics-finance-domain',
    name: 'Social Studies',
    description: 'Economics, finance, and social studies content'
  }
};

// Commands

async function listContentSources() {
  try {
    logInfo('Fetching content sources...');
    const response = await apiCall('/content-management/sources');
    
    if (response.success && response.data.length > 0) {
      logSuccess(`Found ${response.data.length} content sources:`);
      console.log();
      
      response.data.forEach(source => {
        log(`📚 ${source.name}`, 'cyan');
        log(`   URL: ${source.base_url}`);
        log(`   Status: ${source.is_active ? 'Active' : 'Inactive'}`, source.is_active ? 'green' : 'red');
        log(`   Content: ${source.imported_content}/${source.total_content}`);
        if (source.last_sync_at) {
          log(`   Last Sync: ${new Date(source.last_sync_at).toLocaleString()}`);
        }
        console.log();
      });
    } else {
      logWarning('No content sources found');
    }
  } catch (error) {
    logError(`Failed to fetch content sources: ${error.message}`);
  }
}

async function getContentStats() {
  try {
    logInfo('Fetching content statistics...');
    const response = await apiCall('/content-management/stats');
    
    if (response.success) {
      const stats = response.data;
      logSuccess('Content Statistics:');
      console.log();
      
      log(`📊 Total Content Items: ${stats.totalContent}`, 'cyan');
      log(`✅ Approved Content: ${stats.approvedContent}`, 'green');
      log(`⏳ Pending Review: ${stats.pendingReview}`, 'yellow');
      console.log();
      
      if (Object.keys(stats.bySubject).length > 0) {
        log('📚 By Subject:', 'cyan');
        Object.entries(stats.bySubject).forEach(([subject, count]) => {
          log(`   ${subject}: ${count}`);
        });
        console.log();
      }
      
      if (Object.keys(stats.byGrade).length > 0) {
        log('🎓 By Grade Level:', 'cyan');
        Object.entries(stats.byGrade).forEach(([grade, count]) => {
          log(`   Grade ${grade}: ${count}`);
        });
        console.log();
      }
      
      if (Object.keys(stats.byType).length > 0) {
        log('📝 By Content Type:', 'cyan');
        Object.entries(stats.byType).forEach(([type, count]) => {
          log(`   ${type}: ${count}`);
        });
      }
    }
  } catch (error) {
    logError(`Failed to fetch content statistics: ${error.message}`);
  }
}

async function importKhanAcademy(subject, subjectId) {
  try {
    if (!KHAN_ACADEMY_SUBJECTS[subject]) {
      logError(`Invalid subject: ${subject}`);
      logInfo('Available subjects:', 'blue');
      Object.keys(KHAN_ACADEMY_SUBJECTS).forEach(key => {
        log(`  - ${key}: ${KHAN_ACADEMY_SUBJECTS[key].name}`);
      });
      return;
    }

    logInfo(`Starting Khan Academy import for ${KHAN_ACADEMY_SUBJECTS[subject].name}...`);
    
    const response = await apiCall('/content-management/khan-academy/import', 'POST', {
      subjectSlug: subject,
      subjectId: subjectId
    });
    
    if (response.success) {
      const progressId = response.data.progressId;
      logSuccess(`Import started successfully! Progress ID: ${progressId}`);
      logInfo('Monitoring import progress...');
      
      // Monitor progress
      await monitorImportProgress(progressId);
    }
  } catch (error) {
    logError(`Failed to start Khan Academy import: ${error.message}`);
  }
}

async function monitorImportProgress(progressId) {
  const maxAttempts = 300; // 5 minutes with 1-second intervals
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    try {
      const response = await apiCall(`/content-management/khan-academy/import/${progressId}`);
      
      if (response.success) {
        const progress = response.data;
        const percentage = progress.totalItems > 0 ? 
          Math.round((progress.processedItems / progress.totalItems) * 100) : 0;
        
        // Clear previous line and show progress
        process.stdout.write('\r');
        process.stdout.write(`📥 Progress: ${percentage}% (${progress.processedItems}/${progress.totalItems}) | ✅ ${progress.successfulImports} | ❌ ${progress.failedImports}`);
        
        if (progress.currentItem) {
          process.stdout.write(` | Current: ${progress.currentItem.substring(0, 50)}...`);
        }
        
        if (progress.estimatedTimeRemaining) {
          const minutes = Math.floor(progress.estimatedTimeRemaining / 60);
          const seconds = progress.estimatedTimeRemaining % 60;
          process.stdout.write(` | ETA: ${minutes}m ${seconds}s`);
        }
        
        // Check if import is complete
        if (progress.processedItems >= progress.totalItems) {
          console.log(); // New line
          logSuccess(`Import completed! ${progress.successfulImports} items imported successfully.`);
          if (progress.failedImports > 0) {
            logWarning(`${progress.failedImports} items failed to import.`);
          }
          break;
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
      
    } catch (error) {
      console.log(); // New line
      logError(`Error monitoring progress: ${error.message}`);
      break;
    }
  }
  
  if (attempts >= maxAttempts) {
    console.log(); // New line
    logWarning('Progress monitoring timed out. Import may still be running in the background.');
  }
}

async function listImports() {
  try {
    logInfo('Fetching active imports...');
    const response = await apiCall('/content-management/khan-academy/imports');
    
    if (response.success) {
      const imports = Object.entries(response.data);
      
      if (imports.length > 0) {
        logSuccess(`Found ${imports.length} active imports:`);
        console.log();
        
        imports.forEach(([progressId, progress]) => {
          const percentage = progress.totalItems > 0 ? 
            Math.round((progress.processedItems / progress.totalItems) * 100) : 0;
          
          log(`🔄 Import ${progressId.substring(0, 8)}...`, 'cyan');
          log(`   Progress: ${percentage}% (${progress.processedItems}/${progress.totalItems})`);
          log(`   Success: ${progress.successfulImports} | Failed: ${progress.failedImports}`);
          log(`   Started: ${new Date(progress.startTime).toLocaleString()}`);
          if (progress.currentItem) {
            log(`   Current: ${progress.currentItem}`);
          }
          console.log();
        });
      } else {
        logInfo('No active imports found');
      }
    }
  } catch (error) {
    logError(`Failed to fetch active imports: ${error.message}`);
  }
}

async function generateContentReport() {
  try {
    logInfo('Generating comprehensive content report...');
    
    // Get all content items
    const contentResponse = await apiCall('/content-management/items?limit=1000');
    const statsResponse = await apiCall('/content-management/stats');
    
    if (contentResponse.success && statsResponse.success) {
      const content = contentResponse.data;
      const stats = statsResponse.data;
      
      const reportData = {
        generatedAt: new Date().toISOString(),
        summary: stats,
        contentItems: content,
        analysis: {
          averageQualityScore: content.length > 0 ? 
            content.reduce((sum, item) => sum + (item.quality_score || 0), 0) / content.length : 0,
          totalDuration: content.reduce((sum, item) => sum + (item.duration_seconds || 0), 0),
          contentBySource: {},
          contentByDifficulty: {}
        }
      };
      
      // Analyze content by source and difficulty
      content.forEach(item => {
        // By source
        if (!reportData.analysis.contentBySource[item.source_id]) {
          reportData.analysis.contentBySource[item.source_id] = 0;
        }
        reportData.analysis.contentBySource[item.source_id]++;
        
        // By difficulty
        if (!reportData.analysis.contentByDifficulty[item.difficulty]) {
          reportData.analysis.contentByDifficulty[item.difficulty] = 0;
        }
        reportData.analysis.contentByDifficulty[item.difficulty]++;
      });
      
      // Save report
      const reportPath = path.join(__dirname, '..', 'reports', `content-report-${Date.now()}.json`);
      
      // Create reports directory if it doesn't exist
      const reportsDir = path.dirname(reportPath);
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }
      
      fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
      
      logSuccess(`Content report generated: ${reportPath}`);
      logInfo(`Total items: ${content.length}`);
      logInfo(`Average quality score: ${reportData.analysis.averageQualityScore.toFixed(2)}`);
      logInfo(`Total duration: ${Math.round(reportData.analysis.totalDuration / 3600)} hours`);
    }
  } catch (error) {
    logError(`Failed to generate content report: ${error.message}`);
  }
}

// CLI Setup
program
  .name('content-manager')
  .description('Kalaagh Content Management CLI Tool')
  .version('1.0.0');

program
  .command('sources')
  .description('List all content sources')
  .action(listContentSources);

program
  .command('stats')
  .description('Show content statistics')
  .action(getContentStats);

program
  .command('import-khan')
  .description('Import content from Khan Academy')
  .argument('<subject>', 'Khan Academy subject (math, science, computing, arts-humanities, economics-finance-domain)')
  .argument('<subject-id>', 'Kalaagh subject ID')
  .action(importKhanAcademy);

program
  .command('imports')
  .description('List active import processes')
  .action(listImports);

program
  .command('monitor')
  .description('Monitor import progress')
  .argument('<progress-id>', 'Import progress ID')
  .action(monitorImportProgress);

program
  .command('report')
  .description('Generate comprehensive content report')
  .action(generateContentReport);

program
  .command('subjects')
  .description('List available Khan Academy subjects')
  .action(() => {
    logInfo('Available Khan Academy subjects:');
    Object.entries(KHAN_ACADEMY_SUBJECTS).forEach(([key, subject]) => {
      log(`📚 ${key}`, 'cyan');
      log(`   Name: ${subject.name}`);
      log(`   Description: ${subject.description}`);
      console.log();
    });
  });

// Error handling
program.configureHelp({
  sortSubcommands: true,
});

program.on('command:*', () => {
  logError(`Invalid command: ${program.args.join(' ')}`);
  logInfo('Use --help to see available commands');
  process.exit(1);
});

// Parse CLI arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}