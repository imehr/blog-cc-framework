/**
 * Twitter Bookmark Extraction Agent
 *
 * This module provides functionality to extract tweet data from Twitter/X bookmarks
 * using Chrome DevTools Protocol. It should be invoked from Claude Code with the
 * Chrome MCP tool available.
 *
 * Usage: This is meant to be called from the /extract-bookmarks slash command,
 * not run directly as a standalone script.
 */

export interface TweetData {
  author: string;
  handle: string;
  url: string;
  date: string;
  text: string;
  topic: string;
  media: string[];
  hasThread: boolean;
  threadContext: any;
  extractedAt: string;
}

/**
 * Infers a topic category from tweet text using keyword matching
 */
export function inferTopic(text: string): string {
  const keywords: { [key: string]: string } = {
    'ai|artificial intelligence|machine learning|llm|gpt|claude|neural': 'AI & ML',
    'code|programming|software|developer|javascript|python|typescript|react': 'Software Engineering',
    'design|ui|ux|product|interface|figma|sketch': 'Design & Product',
    'startup|founder|entrepreneur|vc|venture capital|funding': 'Startups',
    'productivity|workflow|tools|notion|obsidian|pkm': 'Productivity',
    'web3|blockchain|crypto|ethereum|bitcoin|nft': 'Web3 & Crypto',
    'philosophy|psychology|mental model|thinking|cognition': 'Philosophy & Psychology',
    'writing|content|storytelling|communication|essay': 'Writing & Content',
    'business|strategy|growth|marketing|sales|revenue': 'Business & Strategy',
    'science|research|physics|biology|chemistry|math': 'Science & Research',
  };

  const lowerText = text.toLowerCase();
  for (const [pattern, topic] of Object.entries(keywords)) {
    if (new RegExp(pattern).test(lowerText)) {
      return topic;
    }
  }

  return 'General';
}

/**
 * Extracts clean image URLs from media HTML
 */
export function parseMediaUrls(html: string): string[] {
  const urls: string[] = [];

  // Match Twitter/X image URLs
  const imgMatches = html.matchAll(/src="([^"]*pbs\.twimg\.com[^"]*)"/g);
  for (const match of imgMatches) {
    const url = match[1];
    // Get the highest quality version
    const cleanUrl = url.replace(/&name=\w+/, '&name=large');
    if (!urls.includes(cleanUrl)) {
      urls.push(cleanUrl);
    }
  }

  return urls;
}

/**
 * Extracts tweet ID from a tweet URL
 */
export function extractTweetId(url: string): string {
  const match = url.match(/status\/(\d+)/);
  return match ? match[1] : `tweet-${Date.now()}`;
}

/**
 * Formats a date string to YYYY-MM-DD format
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

/**
 * Example extraction flow documentation
 *
 * This function is NOT meant to be called directly. It serves as documentation
 * for how Claude Code should use the Chrome MCP tool to extract bookmarks.
 *
 * The actual extraction happens in the /extract-bookmarks slash command where
 * Claude Code has access to the mcp__plugin_superpowers-chrome_chrome__use_browser tool.
 */
export async function extractBookmarksDocumentation() {
  // This is pseudo-code documentation showing the extraction flow:

  /*
  1. Navigate to bookmarks:
     await use_browser({ action: 'navigate', payload: 'https://x.com/imehr/bookmarks' })

  2. Wait for tweets to load:
     await use_browser({ action: 'await_element', selector: 'article[data-testid="tweet"]', timeout: 10000 })

  3. For each tweet (limit 10):

     a. Extract author name:
        const author = await use_browser({
          action: 'extract',
          selector: 'article[data-testid="tweet"]:nth-child(N) [data-testid="User-Name"] span:first-child',
          payload: 'text'
        })

     b. Extract handle:
        const handle = await use_browser({
          action: 'extract',
          selector: 'article[data-testid="tweet"]:nth-child(N) [data-testid="User-Name"] a[role="link"]',
          payload: 'text'
        })

     c. Extract tweet URL from timestamp:
        const timeHref = await use_browser({
          action: 'eval',
          payload: 'document.querySelectorAll("article[data-testid=\\"tweet\\"]")[N-1].querySelector("time").parentElement.href'
        })

     d. Extract date:
        const dateAttr = await use_browser({
          action: 'eval',
          payload: 'document.querySelectorAll("article[data-testid=\\"tweet\\"]")[N-1].querySelector("time").getAttribute("datetime")'
        })

     e. Extract text content:
        const text = await use_browser({
          action: 'extract',
          selector: 'article[data-testid="tweet"]:nth-child(N) [data-testid="tweetText"]',
          payload: 'text'
        })

     f. Extract media (images/videos):
        const mediaHtml = await use_browser({
          action: 'extract',
          selector: 'article[data-testid="tweet"]:nth-child(N) [data-testid="tweetPhoto"], article[data-testid="tweet"]:nth-child(N) img[src*="pbs.twimg.com"]',
          payload: 'html'
        })
        const media = parseMediaUrls(mediaHtml)

     g. Check for thread context:
        const hasThread = await use_browser({
          action: 'eval',
          payload: 'document.querySelectorAll("article[data-testid=\\"tweet\\"]")[N-1].querySelector("[data-testid=\\"tweet-thread\\"]") !== null'
        })

  4. For each extracted tweet, create TweetData object:
     {
       author: author.trim(),
       handle: handle.trim().startsWith('@') ? handle.trim() : '@' + handle.trim(),
       url: timeHref,
       date: formatDate(dateAttr),
       text: text.trim(),
       topic: inferTopic(text),
       media: media,
       hasThread: hasThread,
       threadContext: null,
       extractedAt: new Date().toISOString().split('T')[0]
     }

  5. Save each tweet using the saveTweetToMarkdown function from extract-twitter-bookmarks.ts
  */

  console.log('This is documentation only. See /extract-bookmarks slash command for actual implementation.');
}

// Export helper functions that will be used by the extraction logic
export default {
  inferTopic,
  parseMediaUrls,
  extractTweetId,
  formatDate,
};
