import { EventEmitter } from 'events';
import { db } from '../database';
import { logger } from '../utils/logger';

interface License {
  type: string;
  name: string;
  url: string;
  attribution: boolean;
  shareAlike: boolean;
  commercial: boolean;
  modifications: boolean;
  distribution: boolean;
}

interface AttributionRequirement {
  contentId: string;
  title: string;
  author: string;
  source: string;
  sourceUrl: string;
  license: string;
  licenseUrl: string;
  modifications?: string;
}

export class LicenseComplianceService extends EventEmitter {
  // Supported open licenses
  private licenses: Record<string, License> = {
    'CC-BY': {
      type: 'CC-BY',
      name: 'Creative Commons Attribution',
      url: 'https://creativecommons.org/licenses/by/4.0/',
      attribution: true,
      shareAlike: false,
      commercial: true,
      modifications: true,
      distribution: true
    },
    'CC-BY-SA': {
      type: 'CC-BY-SA',
      name: 'Creative Commons Attribution-ShareAlike',
      url: 'https://creativecommons.org/licenses/by-sa/4.0/',
      attribution: true,
      shareAlike: true,
      commercial: true,
      modifications: true,
      distribution: true
    },
    'CC-BY-NC': {
      type: 'CC-BY-NC',
      name: 'Creative Commons Attribution-NonCommercial',
      url: 'https://creativecommons.org/licenses/by-nc/4.0/',
      attribution: true,
      shareAlike: false,
      commercial: false,
      modifications: true,
      distribution: true
    },
    'CC-BY-NC-SA': {
      type: 'CC-BY-NC-SA',
      name: 'Creative Commons Attribution-NonCommercial-ShareAlike',
      url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
      attribution: true,
      shareAlike: true,
      commercial: false,
      modifications: true,
      distribution: true
    },
    'CC-BY-ND': {
      type: 'CC-BY-ND',
      name: 'Creative Commons Attribution-NoDerivatives',
      url: 'https://creativecommons.org/licenses/by-nd/4.0/',
      attribution: true,
      shareAlike: false,
      commercial: true,
      modifications: false,
      distribution: true
    },
    'CC0': {
      type: 'CC0',
      name: 'Creative Commons Zero',
      url: 'https://creativecommons.org/publicdomain/zero/1.0/',
      attribution: false,
      shareAlike: false,
      commercial: true,
      modifications: true,
      distribution: true
    },
    'MIT': {
      type: 'MIT',
      name: 'MIT License',
      url: 'https://opensource.org/licenses/MIT',
      attribution: true,
      shareAlike: false,
      commercial: true,
      modifications: true,
      distribution: true
    },
    'GPL-3.0': {
      type: 'GPL-3.0',
      name: 'GNU General Public License v3.0',
      url: 'https://www.gnu.org/licenses/gpl-3.0.html',
      attribution: true,
      shareAlike: true,
      commercial: true,
      modifications: true,
      distribution: true
    },
    'Apache-2.0': {
      type: 'Apache-2.0',
      name: 'Apache License 2.0',
      url: 'https://www.apache.org/licenses/LICENSE-2.0',
      attribution: true,
      shareAlike: false,
      commercial: true,
      modifications: true,
      distribution: true
    },
    'Public-Domain': {
      type: 'Public-Domain',
      name: 'Public Domain',
      url: 'https://creativecommons.org/publicdomain/mark/1.0/',
      attribution: false,
      shareAlike: false,
      commercial: true,
      modifications: true,
      distribution: true
    }
  };

  // Platform-specific default licenses
  private platformLicenses: Record<string, string> = {
    'Khan Academy': 'CC-BY-NC-SA',
    'CK-12 Foundation': 'CC-BY-NC',
    'PhET Interactive Simulations': 'CC-BY',
    'Code.org': 'CC-BY-NC-SA',
    'MIT OpenCourseWare': 'CC-BY-NC-SA',
    'OpenStax': 'CC-BY',
    'BBC Bitesize': 'Educational-Use',
    'StoryWeaver': 'CC-BY',
    'Bloom Library': 'CC-BY'
  };

  constructor() {
    super();
  }

  /**
   * Check license compatibility
   */
  checkLicenseCompatibility(
    originalLicense: string,
    intendedUse: 'commercial' | 'non-commercial',
    modifications: boolean
  ): { compatible: boolean; reason?: string } {
    const license = this.licenses[originalLicense];
    
    if (!license) {
      return {
        compatible: false,
        reason: `Unknown license type: ${originalLicense}`
      };
    }

    // Check commercial use
    if (intendedUse === 'commercial' && !license.commercial) {
      return {
        compatible: false,
        reason: 'Content is licensed for non-commercial use only'
      };
    }

    // Check modifications
    if (modifications && !license.modifications) {
      return {
        compatible: false,
        reason: 'Content license does not allow modifications'
      };
    }

    return { compatible: true };
  }

  /**
   * Generate attribution text
   */
  generateAttribution(requirement: AttributionRequirement): {
    text: string;
    html: string;
    markdown: string;
  } {
    const license = this.licenses[requirement.license];
    
    if (!license || !license.attribution) {
      return {
        text: '',
        html: '',
        markdown: ''
      };
    }

    // Generate different formats
    const text = `"${requirement.title}" by ${requirement.author} (${requirement.source}) is licensed under ${license.name}. ${requirement.sourceUrl}`;
    
    const html = `<div class="attribution">
      "<a href="${requirement.sourceUrl}">${requirement.title}</a>" 
      by ${requirement.author} (${requirement.source}) 
      is licensed under <a href="${license.url}">${license.name}</a>.
      ${requirement.modifications ? `<br>Modifications: ${requirement.modifications}` : ''}
    </div>`;
    
    const markdown = `"[${requirement.title}](${requirement.sourceUrl})" by ${requirement.author} (${requirement.source}) is licensed under [${license.name}](${license.url}).${requirement.modifications ? `\nModifications: ${requirement.modifications}` : ''}`;

    return { text, html, markdown };
  }

  /**
   * Generate attribution page for all content
   */
  async generateAttributionPage(format: 'html' | 'markdown' | 'json'): Promise<string> {
    // Get all content requiring attribution
    const content = await db('content_items')
      .whereNotNull('license_type')
      .whereNotNull('attribution')
      .orderBy('source_id')
      .orderBy('title');

    const attributions: AttributionRequirement[] = [];

    for (const item of content) {
      const license = this.licenses[item.license_type];
      if (license && license.attribution) {
        attributions.push({
          contentId: item.id,
          title: item.title,
          author: item.author || 'Unknown',
          source: item.attribution,
          sourceUrl: item.source_url || '',
          license: item.license_type,
          licenseUrl: license.url
        });
      }
    }

    // Group by source
    const grouped = this.groupBySource(attributions);

    switch (format) {
      case 'html':
        return this.generateHTMLAttributions(grouped);
      case 'markdown':
        return this.generateMarkdownAttributions(grouped);
      case 'json':
        return JSON.stringify(grouped, null, 2);
      default:
        return '';
    }
  }

  /**
   * Group attributions by source
   */
  private groupBySource(attributions: AttributionRequirement[]): Record<string, AttributionRequirement[]> {
    return attributions.reduce((acc, attr) => {
      const source = attr.source;
      if (!acc[source]) {
        acc[source] = [];
      }
      acc[source].push(attr);
      return acc;
    }, {} as Record<string, AttributionRequirement[]>);
  }

  /**
   * Generate HTML attributions page
   */
  private generateHTMLAttributions(grouped: Record<string, AttributionRequirement[]>): string {
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Content Attributions - Kalaagh Educational Platform</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1, h2 { color: #333; }
        .source-section { margin-bottom: 30px; }
        .attribution { margin: 10px 0; padding: 10px; background: #f5f5f5; border-left: 3px solid #2196F3; }
        a { color: #2196F3; text-decoration: none; }
        a:hover { text-decoration: underline; }
        .license-badge { display: inline-block; padding: 2px 8px; background: #e0e0e0; border-radius: 3px; font-size: 0.9em; }
    </style>
</head>
<body>
    <h1>Content Attributions</h1>
    <p>The Kalaagh Educational Platform includes content from the following sources:</p>
`;

    for (const [source, items] of Object.entries(grouped)) {
      html += `
    <div class="source-section">
        <h2>${source}</h2>
        <p>${items.length} items</p>
`;
      
      for (const item of items) {
        const attr = this.generateAttribution(item);
        html += `        <div class="attribution">
            ${attr.html}
            <span class="license-badge">${item.license}</span>
        </div>\n`;
      }
      
      html += `    </div>\n`;
    }

    html += `
    <footer>
        <p><small>Generated on ${new Date().toISOString()}</small></p>
    </footer>
</body>
</html>`;

    return html;
  }

  /**
   * Generate Markdown attributions
   */
  private generateMarkdownAttributions(grouped: Record<string, AttributionRequirement[]>): string {
    let markdown = `# Content Attributions

The Kalaagh Educational Platform includes content from the following sources:

`;

    for (const [source, items] of Object.entries(grouped)) {
      markdown += `## ${source}\n\n`;
      
      for (const item of items) {
        const attr = this.generateAttribution(item);
        markdown += `- ${attr.markdown}\n`;
      }
      
      markdown += `\n`;
    }

    markdown += `---\n_Generated on ${new Date().toISOString()}_`;

    return markdown;
  }

  /**
   * Validate content license
   */
  async validateContentLicense(contentId: string): Promise<{
    valid: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const content = await db('content_items').where('id', contentId).first();
    
    if (!content) {
      return {
        valid: false,
        issues: ['Content not found'],
        recommendations: []
      };
    }

    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check if license type is specified
    if (!content.license_type) {
      issues.push('No license type specified');
      recommendations.push('Add appropriate license information');
    } else if (!this.licenses[content.license_type]) {
      issues.push(`Unknown license type: ${content.license_type}`);
      recommendations.push('Use a recognized open license');
    }

    // Check attribution requirements
    const license = this.licenses[content.license_type];
    if (license && license.attribution) {
      if (!content.attribution) {
        issues.push('Attribution required but not provided');
        recommendations.push('Add author and source attribution');
      }
      if (!content.author) {
        issues.push('Author information missing');
        recommendations.push('Add author name for proper attribution');
      }
      if (!content.source_url) {
        issues.push('Source URL missing');
        recommendations.push('Add original source URL');
      }
    }

    // Check ShareAlike compliance
    if (license && license.shareAlike) {
      recommendations.push('Derivative works must use the same license');
    }

    // Platform-specific checks
    if (content.source_id) {
      const source = await db('content_sources').where('id', content.source_id).first();
      if (source) {
        const expectedLicense = this.platformLicenses[source.name];
        if (expectedLicense && content.license_type !== expectedLicense) {
          issues.push(`License mismatch: expected ${expectedLicense} for ${source.name}`);
        }
      }
    }

    return {
      valid: issues.length === 0,
      issues,
      recommendations
    };
  }

  /**
   * Check bulk license compliance
   */
  async checkBulkCompliance(): Promise<{
    totalContent: number;
    compliant: number;
    nonCompliant: number;
    byLicense: Record<string, number>;
    issues: Array<{ contentId: string; title: string; issues: string[] }>;
  }> {
    const allContent = await db('content_items').whereNotNull('license_type');
    
    let compliant = 0;
    let nonCompliant = 0;
    const byLicense: Record<string, number> = {};
    const issues: Array<{ contentId: string; title: string; issues: string[] }> = [];

    for (const content of allContent) {
      const validation = await this.validateContentLicense(content.id);
      
      if (validation.valid) {
        compliant++;
      } else {
        nonCompliant++;
        issues.push({
          contentId: content.id,
          title: content.title,
          issues: validation.issues
        });
      }

      // Count by license
      if (content.license_type) {
        byLicense[content.license_type] = (byLicense[content.license_type] || 0) + 1;
      }
    }

    return {
      totalContent: allContent.length,
      compliant,
      nonCompliant,
      byLicense,
      issues: issues.slice(0, 100) // Limit to first 100 issues
    };
  }

  /**
   * Generate license report
   */
  async generateLicenseReport(): Promise<any> {
    const compliance = await this.checkBulkCompliance();
    const sources = await db('content_sources').select('name', 'id');
    
    const sourceCompliance: Record<string, any> = {};
    
    for (const source of sources) {
      const content = await db('content_items')
        .where('source_id', source.id)
        .whereNotNull('license_type');
      
      const licenses = content.reduce((acc, item) => {
        acc[item.license_type] = (acc[item.license_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      sourceCompliance[source.name] = {
        total: content.length,
        licenses
      };
    }

    return {
      summary: {
        totalContent: compliance.totalContent,
        compliantPercentage: (compliance.compliant / compliance.totalContent) * 100,
        nonCompliantCount: compliance.nonCompliant
      },
      licenseDistribution: compliance.byLicense,
      sourceCompliance,
      topIssues: this.summarizeIssues(compliance.issues),
      recommendations: [
        'Ensure all content has proper license information',
        'Verify attribution requirements are met',
        'Use compatible licenses for derivative works',
        'Regularly audit license compliance'
      ],
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Summarize compliance issues
   */
  private summarizeIssues(issues: Array<{ contentId: string; title: string; issues: string[] }>): Record<string, number> {
    const summary: Record<string, number> = {};
    
    for (const item of issues) {
      for (const issue of item.issues) {
        summary[issue] = (summary[issue] || 0) + 1;
      }
    }
    
    return summary;
  }

  /**
   * Fix common license issues
   */
  async autoFixLicenseIssues(): Promise<{
    fixed: number;
    issues: string[];
  }> {
    let fixed = 0;
    const issues: string[] = [];

    // Fix missing licenses based on source
    const sources = await db('content_sources');
    
    for (const source of sources) {
      const defaultLicense = this.platformLicenses[source.name];
      
      if (defaultLicense) {
        const result = await db('content_items')
          .where('source_id', source.id)
          .whereNull('license_type')
          .update({
            license_type: defaultLicense,
            updated_at: new Date()
          });
        
        if (result > 0) {
          fixed += result;
          logger.info(`Fixed ${result} items from ${source.name} with license ${defaultLicense}`);
        }
      }
    }

    // Fix missing attributions
    const needsAttribution = await db('content_items')
      .whereIn('license_type', Object.keys(this.licenses).filter(l => this.licenses[l].attribution))
      .whereNull('attribution');

    for (const item of needsAttribution) {
      const source = await db('content_sources').where('id', item.source_id).first();
      
      if (source) {
        await db('content_items')
          .where('id', item.id)
          .update({
            attribution: source.name,
            author: item.author || source.name,
            updated_at: new Date()
          });
        fixed++;
      }
    }

    return { fixed, issues };
  }

  /**
   * Export license data for legal review
   */
  async exportLicenseData(format: 'csv' | 'json'): Promise<string> {
    const data = await db('content_items')
      .leftJoin('content_sources', 'content_items.source_id', 'content_sources.id')
      .select(
        'content_items.id',
        'content_items.title',
        'content_items.license_type',
        'content_items.attribution',
        'content_items.author',
        'content_items.source_url',
        'content_sources.name as source_name'
      )
      .whereNotNull('content_items.license_type');

    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    }

    // CSV format
    const headers = ['ID', 'Title', 'License', 'Attribution', 'Author', 'Source URL', 'Platform'];
    const rows = data.map(item => [
      item.id,
      `"${item.title}"`,
      item.license_type,
      `"${item.attribution || ''}"`,
      `"${item.author || ''}"`,
      item.source_url || '',
      item.source_name || ''
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
}

export const licenseComplianceService = new LicenseComplianceService();