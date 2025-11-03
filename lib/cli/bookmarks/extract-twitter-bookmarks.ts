import * as fs from 'fs';
import * as path from 'path';

interface TweetData {
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

async function extractBookmarks(limit: number = 10): Promise<TweetData[]> {
  console.log(`Extracting up to ${limit} bookmarks from x.com/@imehr...`);

  // This will be implemented via Chrome MCP in the agent
  // For now, return empty array
  return [];
}

async function saveTweetToMarkdown(tweet: TweetData, order: number): Promise<void> {
  const slug = tweet.url.split('/status/')[1] || `tweet-${Date.now()}`;
  const filename = `${slug}.md`;
  const filepath = path.join(process.cwd(), 'content/collections/tweets', filename);

  const frontmatter = `---
author: "${tweet.author}"
handle: "${tweet.handle}"
url: "${tweet.url}"
date: "${tweet.date}"
text: "${tweet.text.replace(/"/g, '\\"')}"
topic: "${tweet.topic}"
order: ${order}
media: ${JSON.stringify(tweet.media)}
hasThread: ${tweet.hasThread}
threadContext: ${tweet.threadContext ? JSON.stringify(tweet.threadContext) : 'null'}
extractedAt: "${tweet.extractedAt}"
---
`;

  fs.writeFileSync(filepath, frontmatter);
  console.log(`✓ Saved: ${filename}`);
}

async function main() {
  const limit = parseInt(process.argv[2] || '10', 10);

  try {
    const tweets = await extractBookmarks(limit);
    console.log(`Extracted ${tweets.length} tweets`);

    // Get current max order number
    const tweetsDir = path.join(process.cwd(), 'content/collections/tweets');
    if (!fs.existsSync(tweetsDir)) {
      fs.mkdirSync(tweetsDir, { recursive: true });
    }

    const existingFiles = fs.readdirSync(tweetsDir);
    let maxOrder = existingFiles.length;

    for (const tweet of tweets) {
      await saveTweetToMarkdown(tweet, ++maxOrder);
    }

    console.log(`\n✓ Successfully saved ${tweets.length} bookmarks`);
  } catch (error) {
    console.error('Error extracting bookmarks:', error);
    process.exit(1);
  }
}

main();
