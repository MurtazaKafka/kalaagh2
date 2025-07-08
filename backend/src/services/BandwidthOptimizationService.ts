import { EventEmitter } from 'events';
import ffmpeg from 'fluent-ffmpeg';
import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import axios from 'axios';
import { db } from '../database';
import { logger } from '../utils/logger';

interface VideoProfile {
  name: string;
  bitrate: string;
  resolution: string;
  fps: number;
  audiobitrate: string;
}

interface OptimizationResult {
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  profiles: Record<string, string>;
}

interface BandwidthMeasurement {
  timestamp: Date;
  downloadSpeed: number; // bits per second
  uploadSpeed: number;
  latency: number; // milliseconds
  connectionType: string;
}

export class BandwidthOptimizationService extends EventEmitter {
  private videoProfiles: Record<string, VideoProfile> = {
    high: {
      name: 'high',
      bitrate: '1000k',
      resolution: '1280x720',
      fps: 30,
      audiobitrate: '128k'
    },
    medium: {
      name: 'medium',
      bitrate: '500k',
      resolution: '854x480',
      fps: 24,
      audiobitrate: '96k'
    },
    low: {
      name: 'low',
      bitrate: '250k',
      resolution: '640x360',
      fps: 24,
      audiobitrate: '64k'
    },
    ultra_low: {
      name: 'ultra_low',
      bitrate: '100k',
      resolution: '426x240',
      fps: 15,
      audiobitrate: '32k'
    },
    audio_only: {
      name: 'audio_only',
      bitrate: '0',
      resolution: '',
      fps: 0,
      audiobitrate: '64k'
    }
  };

  private imageProfiles = {
    high: { width: 1920, quality: 90 },
    medium: { width: 1280, quality: 80 },
    low: { width: 640, quality: 70 },
    thumbnail: { width: 320, quality: 60 }
  };

  private bandwidthHistory: BandwidthMeasurement[] = [];
  private maxHistorySize = 100;

  constructor() {
    super();
    this.startBandwidthMonitoring();
  }

  /**
   * Start periodic bandwidth monitoring
   */
  private startBandwidthMonitoring(): void {
    // Measure bandwidth every 5 minutes
    setInterval(async () => {
      const measurement = await this.measureBandwidth();
      this.recordBandwidthMeasurement(measurement);
    }, 5 * 60 * 1000);
  }

  /**
   * Optimize video for multiple quality levels
   */
  async optimizeVideo(inputPath: string, outputDir: string): Promise<OptimizationResult> {
    const stats = await fs.stat(inputPath);
    const originalSize = stats.size;
    const profiles: Record<string, string> = {};

    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });

    // Get video info
    const videoInfo = await this.getVideoInfo(inputPath);
    const availableProfiles = this.selectProfilesForVideo(videoInfo);

    // Process each profile
    for (const profileName of availableProfiles) {
      const profile = this.videoProfiles[profileName];
      const outputPath = path.join(outputDir, `${profileName}.mp4`);

      try {
        if (profileName === 'audio_only') {
          await this.extractAudio(inputPath, outputPath, profile);
        } else {
          await this.transcodeVideo(inputPath, outputPath, profile);
        }

        profiles[profileName] = outputPath;
        logger.info(`Created ${profileName} version: ${outputPath}`);
      } catch (error) {
        logger.error(`Failed to create ${profileName} version:`, error);
      }
    }

    // Calculate total optimized size
    let optimizedSize = 0;
    for (const filePath of Object.values(profiles)) {
      const stats = await fs.stat(filePath);
      optimizedSize += stats.size;
    }

    return {
      originalSize,
      optimizedSize,
      compressionRatio: originalSize / optimizedSize,
      profiles
    };
  }

  /**
   * Get video information
   */
  private getVideoInfo(videoPath: string): Promise<any> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) reject(err);
        else resolve(metadata);
      });
    });
  }

  /**
   * Select appropriate profiles based on source video
   */
  private selectProfilesForVideo(videoInfo: any): string[] {
    const profiles: string[] = ['audio_only']; // Always include audio-only
    const videoStream = videoInfo.streams.find((s: any) => s.codec_type === 'video');

    if (!videoStream) {
      return profiles;
    }

    const sourceHeight = videoStream.height;

    // Only include profiles that are lower than source resolution
    if (sourceHeight >= 240) profiles.push('ultra_low');
    if (sourceHeight >= 360) profiles.push('low');
    if (sourceHeight >= 480) profiles.push('medium');
    if (sourceHeight >= 720) profiles.push('high');

    return profiles;
  }

  /**
   * Transcode video to specific profile
   */
  private transcodeVideo(
    inputPath: string,
    outputPath: string,
    profile: VideoProfile
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const command = ffmpeg(inputPath)
        .videoCodec('libx264')
        .videoBitrate(profile.bitrate)
        .size(profile.resolution)
        .fps(profile.fps)
        .audioCodec('aac')
        .audioBitrate(profile.audiobitrate)
        .outputOptions([
          '-preset fast',
          '-movflags +faststart', // Enable progressive download
          '-pix_fmt yuv420p',
          '-profile:v baseline', // Maximum compatibility
          '-level 3.0'
        ]);

      // Add adaptive bitrate encoding
      if (profile.name !== 'ultra_low') {
        command.outputOptions([
          '-crf 23', // Constant Rate Factor for quality
          '-maxrate ' + profile.bitrate,
          '-bufsize ' + parseInt(profile.bitrate) * 2 + 'k'
        ]);
      }

      command
        .on('progress', (progress) => {
          this.emit('transcode-progress', {
            file: outputPath,
            percent: progress.percent
          });
        })
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .save(outputPath);
    });
  }

  /**
   * Extract audio only from video
   */
  private extractAudio(
    inputPath: string,
    outputPath: string,
    profile: VideoProfile
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .noVideo()
        .audioCodec('aac')
        .audioBitrate(profile.audiobitrate)
        .outputOptions([
          '-movflags +faststart'
        ])
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .save(outputPath);
    });
  }

  /**
   * Optimize images for different sizes
   */
  async optimizeImage(inputPath: string, outputDir: string): Promise<Record<string, string>> {
    const results: Record<string, string> = {};

    await fs.mkdir(outputDir, { recursive: true });

    for (const [profileName, profile] of Object.entries(this.imageProfiles)) {
      const outputPath = path.join(outputDir, `${profileName}.jpg`);

      try {
        await sharp(inputPath)
          .resize(profile.width, null, {
            withoutEnlargement: true,
            fit: 'inside'
          })
          .jpeg({ quality: profile.quality, progressive: true })
          .toFile(outputPath);

        results[profileName] = outputPath;
      } catch (error) {
        logger.error(`Failed to create ${profileName} image:`, error);
      }
    }

    return results;
  }

  /**
   * Measure current bandwidth
   */
  async measureBandwidth(): Promise<BandwidthMeasurement> {
    const testFiles = [
      { url: 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png', size: 5969 },
      { url: 'https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js', size: 89476 }
    ];

    let totalBits = 0;
    let totalTime = 0;
    let totalLatency = 0;

    for (const testFile of testFiles) {
      const startTime = Date.now();
      
      try {
        const response = await axios.get(testFile.url, { 
          responseType: 'arraybuffer',
          timeout: 10000
        });
        
        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000; // seconds
        const bits = response.data.length * 8;
        
        totalBits += bits;
        totalTime += duration;
        totalLatency += (endTime - startTime);
      } catch (error) {
        logger.error('Bandwidth measurement failed:', error);
      }
    }

    const downloadSpeed = totalTime > 0 ? totalBits / totalTime : 250000; // Default 250 Kbps
    const latency = totalLatency / testFiles.length;

    return {
      timestamp: new Date(),
      downloadSpeed,
      uploadSpeed: downloadSpeed * 0.1, // Estimate upload as 10% of download
      latency,
      connectionType: this.categorizeConnection(downloadSpeed)
    };
  }

  /**
   * Categorize connection type based on speed
   */
  private categorizeConnection(bitsPerSecond: number): string {
    const mbps = bitsPerSecond / 1000000;
    
    if (mbps < 0.5) return '2G';
    if (mbps < 2) return '3G';
    if (mbps < 10) return '4G';
    if (mbps < 50) return 'Broadband';
    return 'High-Speed';
  }

  /**
   * Record bandwidth measurement
   */
  private recordBandwidthMeasurement(measurement: BandwidthMeasurement): void {
    this.bandwidthHistory.push(measurement);
    
    if (this.bandwidthHistory.length > this.maxHistorySize) {
      this.bandwidthHistory.shift();
    }

    this.emit('bandwidth-measured', measurement);
  }

  /**
   * Get average bandwidth over time period
   */
  getAverageBandwidth(minutes: number = 60): number {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    const recentMeasurements = this.bandwidthHistory.filter(
      m => m.timestamp > cutoff
    );

    if (recentMeasurements.length === 0) {
      return 250000; // Default 250 Kbps
    }

    const sum = recentMeasurements.reduce((acc, m) => acc + m.downloadSpeed, 0);
    return sum / recentMeasurements.length;
  }

  /**
   * Select quality based on current bandwidth
   */
  selectQualityForBandwidth(bandwidthBps?: number): string {
    const bandwidth = bandwidthBps || this.getAverageBandwidth();
    
    if (bandwidth > 2000000) return 'high';      // > 2 Mbps
    if (bandwidth > 1000000) return 'medium';    // > 1 Mbps
    if (bandwidth > 500000) return 'low';        // > 500 Kbps
    if (bandwidth > 200000) return 'ultra_low';  // > 200 Kbps
    return 'audio_only';                          // <= 200 Kbps
  }

  /**
   * Create adaptive playlist for video
   */
  async createAdaptivePlaylist(
    contentId: string,
    videoProfiles: Record<string, string>
  ): Promise<string> {
    const content = await db('content_items').where('id', contentId).first();
    const playlistPath = path.join(path.dirname(videoProfiles.high || videoProfiles.medium), 'playlist.m3u8');

    let playlist = '#EXTM3U\n#EXT-X-VERSION:3\n\n';

    // Add each quality variant
    for (const [quality, filePath] of Object.entries(videoProfiles)) {
      if (quality === 'audio_only') continue;

      const profile = this.videoProfiles[quality];
      const bandwidth = parseInt(profile.bitrate) * 1000; // Convert to bps

      playlist += `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${profile.resolution}\n`;
      playlist += `${path.basename(filePath)}\n\n`;
    }

    await fs.writeFile(playlistPath, playlist);
    return playlistPath;
  }

  /**
   * Optimize content for user's connection
   */
  async optimizeForUser(userId: string, contentId: string): Promise<string> {
    // Get user's recent bandwidth measurements
    const userBandwidth = await this.getUserBandwidth(userId);
    const quality = this.selectQualityForBandwidth(userBandwidth);

    // Get content
    const content = await db('content_items').where('id', contentId).first();
    
    if (!content || !content.video_qualities) {
      throw new Error('Content not found or not optimized');
    }

    const qualities = JSON.parse(content.video_qualities);
    const selectedUrl = qualities[quality] || qualities.low || qualities.audio_only;

    // Log usage for analytics
    await this.logQualitySelection(userId, contentId, quality, userBandwidth);

    return selectedUrl;
  }

  /**
   * Get user's average bandwidth
   */
  private async getUserBandwidth(userId: string): Promise<number> {
    // In a real implementation, this would track per-user bandwidth
    // For now, use global average
    return this.getAverageBandwidth();
  }

  /**
   * Log quality selection for analytics
   */
  private async logQualitySelection(
    userId: string,
    contentId: string,
    quality: string,
    bandwidth: number
  ): Promise<void> {
    // This would log to an analytics table
    logger.info(`User ${userId} selected ${quality} quality for content ${contentId} at ${bandwidth} bps`);
  }

  /**
   * Prefetch content based on user patterns
   */
  async prefetchContent(userId: string): Promise<void> {
    // Get user's learning pattern
    const recentProgress = await db('user_progress')
      .where('user_id', userId)
      .orderBy('last_accessed', 'desc')
      .limit(5);

    if (recentProgress.length === 0) return;

    // Find next likely content
    const subjectIds = [...new Set(recentProgress.map(p => p.subject_id))];
    const nextContent = await db('content_items')
      .whereIn('subject_id', subjectIds)
      .whereNotIn('id', recentProgress.map(p => p.resource_id))
      .where('offline_available', false)
      .limit(3);

    // Queue for low-priority download
    const bandwidth = await this.getUserBandwidth(userId);
    const quality = this.selectQualityForBandwidth(bandwidth);

    for (const content of nextContent) {
      this.emit('prefetch-content', {
        userId,
        contentId: content.id,
        quality,
        priority: 'low'
      });
    }
  }

  /**
   * Generate bandwidth optimization report
   */
  async generateOptimizationReport(startDate: Date, endDate: Date): Promise<any> {
    const measurements = this.bandwidthHistory.filter(
      m => m.timestamp >= startDate && m.timestamp <= endDate
    );

    const connectionTypes = measurements.reduce((acc, m) => {
      acc[m.connectionType] = (acc[m.connectionType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const avgSpeed = measurements.reduce((sum, m) => sum + m.downloadSpeed, 0) / measurements.length;
    const avgLatency = measurements.reduce((sum, m) => sum + m.latency, 0) / measurements.length;

    return {
      period: { startDate, endDate },
      totalMeasurements: measurements.length,
      averageSpeed: avgSpeed,
      averageSpeedMbps: avgSpeed / 1000000,
      averageLatency: avgLatency,
      connectionTypes,
      recommendedQuality: this.selectQualityForBandwidth(avgSpeed),
      lowBandwidthPeriods: measurements.filter(m => m.downloadSpeed < 500000).length,
      optimization: {
        potentialDataSavings: '60-80% with adaptive quality',
        recommendedCaching: 'Enable aggressive caching for static content',
        prefetchStrategy: 'Prefetch during high-bandwidth periods'
      }
    };
  }
}

export const bandwidthOptimizer = new BandwidthOptimizationService();