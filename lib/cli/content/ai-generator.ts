import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { execSync } from 'child_process';

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
 * Extract metadata from YouTube using oEmbed API (primary method)
 */
async function extractViaOEmbed(url: string): Promise<Partial<VideoMetadata> | null> {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const response = await fetch(oembedUrl);

    if (!response.ok) {
      return null;
    }

    const data: any = await response.json();

    return {
      title: data.title || '',
      author: data.author_name || '',
      thumbnailUrl: data.thumbnail_url || '',
    };
  } catch (error) {
    console.error('oEmbed extraction failed:', error);
    return null;
  }
}

/**
 * Extract metadata from YouTube URL using direct page scraping (fallback)
 */
async function extractViaPageScraping(url: string): Promise<VideoMetadata | null> {
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
    const durationMatch = html.match(/"duration":"PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?"/);
    let duration: string | undefined;
    if (durationMatch) {
      const hours = durationMatch[1] ? parseInt(durationMatch[1], 10) : 0;
      const minutes = durationMatch[2] ? parseInt(durationMatch[2], 10) : 0;
      const seconds = durationMatch[3] ? parseInt(durationMatch[3], 10) : 0;
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
    console.error('Page scraping failed:', error);
    return null;
  }
}

/**
 * Extract duration using Chrome MCP (requires browser)
 */
async function extractDurationViaChromeMCP(url: string): Promise<string | null> {
  try {
    console.log('ℹ Attempting to extract duration via Chrome MCP...');

    // This is a placeholder - actual implementation would use MCP tool
    // For now, we'll document that duration extraction via Chrome requires:
    // 1. Navigate to video page
    // 2. Wait for player to load
    // 3. Extract duration from player UI or metadata

    // In practice, the slash command agent would handle this using:
    // mcp__plugin_superpowers-chrome_chrome__use_browser tool

    return null; // Return null for now, agent will handle it
  } catch (error) {
    console.error('Chrome MCP duration extraction failed:', error);
    return null;
  }
}

/**
 * Extract metadata from YouTube URL using three-tier fallback strategy:
 * 1. oEmbed API (fast, reliable, official)
 * 2. Direct page scraping (if oEmbed fails)
 * 3. Chrome MCP (for duration if needed)
 */
export async function extractYouTubeMetadata(url: string): Promise<VideoMetadata | null> {
  try {
    // Validate YouTube URL
    if (!url.match(/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//)) {
      console.error('Invalid YouTube URL');
      return null;
    }

    console.log('🤖 Extracting metadata from URL...');

    // Method 1: Try oEmbed API first (best method)
    console.log('ℹ Trying oEmbed API...');
    const oembedData = await extractViaOEmbed(url);

    if (oembedData && oembedData.title && oembedData.author) {
      console.log('✓ Metadata extracted via oEmbed API');

      // oEmbed doesn't provide duration, try to get it from page scraping
      const pageData = await extractViaPageScraping(url);

      return {
        title: oembedData.title,
        author: oembedData.author,
        duration: pageData?.duration,
        description: pageData?.description,
        thumbnailUrl: oembedData.thumbnailUrl,
      };
    }

    // Method 2: Fallback to page scraping
    console.log('⚠ oEmbed failed, trying page scraping...');
    const pageData = await extractViaPageScraping(url);

    if (pageData && pageData.title) {
      console.log('✓ Metadata extracted via page scraping');
      return pageData;
    }

    // Method 3: Final fallback - Chrome MCP (handled by agent)
    console.log('⚠ Page scraping failed');
    console.log('ℹ Chrome MCP fallback available via agent');
    console.log('ℹ Agent will use: mcp__plugin_superpowers-chrome_chrome__use_browser');

    return null;
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
