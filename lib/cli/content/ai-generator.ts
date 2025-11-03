import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

export interface VideoMetadata {
  title: string;
  author: string;
  duration?: string;
  description?: string;
  tags?: string[];
  thumbnailUrl?: string;
}

export interface GeneratedContent {
  description: string;
  tags: string[];
  collectionType: 'videos' | 'tutorials' | 'courses';
}

/**
 * Extract metadata from YouTube URL using OpenGraph
 */
export async function extractYouTubeMetadata(url: string): Promise<VideoMetadata | null> {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract OpenGraph metadata
    const title = $('meta[property="og:title"]').attr('content') || '';
    const description = $('meta[property="og:description"]').attr('content') || '';
    const thumbnailUrl = $('meta[property="og:image"]').attr('content') || '';

    // Extract channel name
    const author = $('link[itemprop="name"]').attr('content') ||
                   $('meta[name="author"]').attr('content') || '';

    // Extract duration (if available in schema)
    const durationMatch = html.match(/"duration":"PT(\d+H)?(\d+M)?(\d+S)?"/);
    let duration: string | undefined;
    if (durationMatch) {
      const hours = durationMatch[1] ? parseInt(durationMatch[1]) : 0;
      const minutes = durationMatch[2] ? parseInt(durationMatch[2]) : 0;
      const seconds = durationMatch[3] ? parseInt(durationMatch[3]) : 0;
      if (hours > 0) {
        duration = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      } else {
        duration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      }
    }

    return {
      title,
      author,
      duration,
      description,
      thumbnailUrl
    };
  } catch (error) {
    console.error('Failed to extract YouTube metadata:', error);
    return null;
  }
}

/**
 * Placeholder for AI content generation
 * In actual implementation, this would call Claude via MCP
 * For now, returns basic analysis
 */
export async function generateContentWithAI(
  title: string,
  description?: string
): Promise<GeneratedContent> {
  // This is a placeholder. In real implementation, this would:
  // 1. Use Claude Code MCP to analyze title/description
  // 2. Generate enhanced description
  // 3. Suggest relevant tags
  // 4. Determine best collection type

  // For now, basic heuristics
  const lowerTitle = title.toLowerCase();
  const lowerDesc = (description || '').toLowerCase();
  const combined = lowerTitle + ' ' + lowerDesc;

  const tags: string[] = [];

  // Basic tag extraction
  if (combined.includes('tutorial') || combined.includes('how to')) {
    tags.push('Tutorial');
  }
  if (combined.includes('ai') || combined.includes('artificial intelligence')) {
    tags.push('AI');
  }
  if (combined.includes('machine learning') || combined.includes('ml')) {
    tags.push('Machine Learning');
  }
  if (combined.includes('deep learning')) {
    tags.push('Deep Learning');
  }
  if (combined.includes('llm') || combined.includes('language model')) {
    tags.push('LLM');
  }

  // Determine collection type
  let collectionType: 'videos' | 'tutorials' | 'courses' = 'videos';
  if (combined.includes('tutorial') || combined.includes('how to')) {
    collectionType = 'tutorials';
  } else if (combined.includes('course') || combined.includes('series')) {
    collectionType = 'courses';
  }

  return {
    description: description || `Learn about ${title}`,
    tags: tags.length > 0 ? tags : ['Video'],
    collectionType
  };
}

/**
 * Extract video ID from YouTube URL
 */
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}
