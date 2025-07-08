import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { EventEmitter } from 'events';
import axios from 'axios';
import ffmpeg from 'fluent-ffmpeg';
import { db } from '../database';
import { logger } from '../utils/logger';

interface DownloadOptions {
  quality: 'high' | 'medium' | 'low' | 'audio_only';
  priority: 'high' | 'medium' | 'low';
  userId: string;
  contentId: string;
}

interface VideoProfile {
  bitrate: string;
  resolution: string | null;
  audioOnly: boolean;
}

export class ContentDownloaderService extends EventEmitter {
  private downloadQueue: Map<string, DownloadOptions> = new Map();
  private activeDownloads: Map<string, AbortController> = new Map();
  private contentDir: string;
  private maxConcurrentDownloads: number = 3;
  private videoProfiles: Record<string, VideoProfile> = {
    high: { bitrate: '1000k', resolution: '720p', audioOnly: false },
    medium: { bitrate: '500k', resolution: '480p', audioOnly: false },
    low: { bitrate: '250k', resolution: '360p', audioOnly: false },
    audio_only: { bitrate: '64k', resolution: null, audioOnly: true }
  };

  constructor(contentDir: string = './content') {
    super();
    this.contentDir = contentDir;
    this.initializeDirectories();
    this.startQueueProcessor();
  }

  private async initializeDirectories(): Promise<void> {
    const dirs = [
      'videos/khan-academy',
      'videos/bbc-bitesize',
      'videos/youtube-cc',
      'interactive/phet-simulations',
      'interactive/geogebra',
      'interactive/code-org',
      'books/storyweaver',
      'books/bloom',
      'books/openstax',
      'assessments/ck12',
      'assessments/custom',
      'temp'
    ];

    for (const dir of dirs) {
      const fullPath = path.join(this.contentDir, dir);
      await fs.mkdir(fullPath, { recursive: true });
    }
  }

  async queueDownload(options: DownloadOptions): Promise<string> {
    const queueId = crypto.randomUUID();
    
    // Add to database queue
    await db('offline_content_queue').insert({
      id: queueId,
      user_id: options.userId,
      content_id: options.contentId,
      status: 'pending',
      priority: options.priority,
      quality: options.quality,
      queued_at: new Date()
    });

    this.downloadQueue.set(queueId, options);
    this.emit('download-queued', { queueId, ...options });
    
    return queueId;
  }

  private async startQueueProcessor(): Promise<void> {
    setInterval(async () => {
      if (this.activeDownloads.size >= this.maxConcurrentDownloads) {
        return;
      }

      const pendingDownloads = await db('offline_content_queue')
        .where('status', 'pending')
        .orderBy('priority', 'desc')
        .orderBy('queued_at', 'asc')
        .limit(this.maxConcurrentDownloads - this.activeDownloads.size);

      for (const download of pendingDownloads) {
        this.processDownload(download.id);
      }
    }, 5000);
  }

  private async processDownload(queueId: string): Promise<void> {
    const controller = new AbortController();
    this.activeDownloads.set(queueId, controller);

    try {
      // Update status to downloading
      await db('offline_content_queue')
        .where('id', queueId)
        .update({
          status: 'downloading',
          started_at: new Date()
        });

      const queue = await db('offline_content_queue')
        .where('id', queueId)
        .first();

      const content = await db('content_items')
        .where('id', queue.content_id)
        .first();

      if (!content || !content.video_url) {
        throw new Error('Content not found or no video URL');
      }

      // Download video
      const videoPath = await this.downloadVideo(
        content.video_url,
        content.id,
        queue.quality,
        controller.signal,
        (progress) => this.updateProgress(queueId, progress)
      );

      // Process video for offline use
      const processedPath = await this.processVideoForOffline(
        videoPath,
        queue.quality
      );

      // Update content item with offline path
      await db('content_items')
        .where('id', content.id)
        .update({
          offline_path: processedPath,
          offline_available: true,
          download_size_mb: await this.getFileSizeMB(processedPath)
        });

      // Update queue status
      await db('offline_content_queue')
        .where('id', queueId)
        .update({
          status: 'completed',
          completed_at: new Date(),
          download_progress: 100
        });

      this.emit('download-completed', { queueId, contentId: content.id });
      
    } catch (error) {
      logger.error('Download failed:', error);
      
      await db('offline_content_queue')
        .where('id', queueId)
        .update({
          status: 'failed',
          error_message: error.message,
          retry_count: db.raw('retry_count + 1')
        });

      this.emit('download-failed', { queueId, error: error.message });
      
    } finally {
      this.activeDownloads.delete(queueId);
    }
  }

  private async downloadVideo(
    url: string,
    contentId: string,
    quality: string,
    signal: AbortSignal,
    onProgress: (progress: number) => void
  ): Promise<string> {
    const tempPath = path.join(this.contentDir, 'temp', `${contentId}_temp.mp4`);
    const writer = fs.createWriteStream(tempPath);
    
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream',
      signal: signal,
      onDownloadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          onProgress(progress);
        }
      }
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(tempPath));
      writer.on('error', reject);
    });
  }

  private async processVideoForOffline(
    inputPath: string,
    quality: string
  ): Promise<string> {
    const profile = this.videoProfiles[quality];
    const outputPath = inputPath.replace('_temp.mp4', `_${quality}.mp4`);
    
    return new Promise((resolve, reject) => {
      let command = ffmpeg(inputPath)
        .videoBitrate(profile.bitrate);

      if (profile.audioOnly) {
        command = command.noVideo();
      } else if (profile.resolution) {
        command = command.size(profile.resolution);
      }

      command
        .audioCodec('aac')
        .videoCodec('libx264')
        .outputOptions([
          '-preset fast',
          '-movflags +faststart', // Enable progressive download
          '-pix_fmt yuv420p'
        ])
        .on('end', async () => {
          // Clean up temp file
          await fs.unlink(inputPath);
          resolve(outputPath);
        })
        .on('error', reject)
        .save(outputPath);
    });
  }

  private async updateProgress(queueId: string, progress: number): Promise<void> {
    await db('offline_content_queue')
      .where('id', queueId)
      .update({ download_progress: progress });
    
    this.emit('download-progress', { queueId, progress });
  }

  private async getFileSizeMB(filePath: string): Promise<number> {
    const stats = await fs.stat(filePath);
    return Math.round(stats.size / (1024 * 1024));
  }

  async cancelDownload(queueId: string): Promise<void> {
    const controller = this.activeDownloads.get(queueId);
    if (controller) {
      controller.abort();
    }

    await db('offline_content_queue')
      .where('id', queueId)
      .update({ status: 'cancelled' });

    this.downloadQueue.delete(queueId);
    this.activeDownloads.delete(queueId);
    
    this.emit('download-cancelled', { queueId });
  }

  async getQueueStatus(userId: string): Promise<any[]> {
    return db('offline_content_queue')
      .where('user_id', userId)
      .whereIn('status', ['pending', 'downloading'])
      .orderBy('priority', 'desc')
      .orderBy('queued_at', 'asc');
  }

  async cleanupFailedDownloads(): Promise<void> {
    const failedDownloads = await db('offline_content_queue')
      .where('status', 'failed')
      .where('retry_count', '>=', 3);

    for (const download of failedDownloads) {
      // Clean up any partial files
      const tempPath = path.join(this.contentDir, 'temp', `${download.content_id}_temp.mp4`);
      try {
        await fs.unlink(tempPath);
      } catch (error) {
        // File might not exist
      }
    }

    // Delete old failed downloads
    await db('offline_content_queue')
      .where('status', 'failed')
      .where('retry_count', '>=', 3)
      .where('created_at', '<', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
      .delete();
  }

  async smartPreload(userId: string): Promise<void> {
    // Get user's learning patterns
    const recentProgress = await db('user_progress')
      .where('user_id', userId)
      .orderBy('last_accessed', 'desc')
      .limit(10);

    // Predict next content based on prerequisites and learning path
    const nextContent = await this.predictNextContent(userId, recentProgress);

    // Measure bandwidth
    const bandwidth = await this.measureBandwidth();
    const quality = this.selectQualityForBandwidth(bandwidth);

    // Queue downloads
    for (const content of nextContent) {
      await this.queueDownload({
        userId,
        contentId: content.id,
        quality,
        priority: 'low'
      });
    }
  }

  private async predictNextContent(userId: string, recentProgress: any[]): Promise<any[]> {
    // Simple prediction based on prerequisites and subject continuity
    const subjectIds = [...new Set(recentProgress.map(p => p.subject_id))];
    
    return db('content_items')
      .whereIn('subject_id', subjectIds)
      .whereNotIn('id', recentProgress.map(p => p.resource_id))
      .where('offline_available', false)
      .limit(5);
  }

  private async measureBandwidth(): Promise<number> {
    const testUrl = 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png';
    const startTime = Date.now();
    
    try {
      const response = await axios.get(testUrl, { responseType: 'arraybuffer' });
      const endTime = Date.now();
      const sizeInBits = response.data.length * 8;
      const timeInSeconds = (endTime - startTime) / 1000;
      
      return sizeInBits / timeInSeconds; // bits per second
    } catch (error) {
      return 250000; // Default to 250 Kbps
    }
  }

  private selectQualityForBandwidth(bandwidth: number): 'high' | 'medium' | 'low' | 'audio_only' {
    if (bandwidth > 2000000) return 'high';      // > 2 Mbps
    if (bandwidth > 1000000) return 'medium';    // > 1 Mbps
    if (bandwidth > 500000) return 'low';        // > 500 Kbps
    return 'audio_only';                          // <= 500 Kbps
  }
}

export const contentDownloader = new ContentDownloaderService(
  process.env.CONTENT_DIR || './content'
);