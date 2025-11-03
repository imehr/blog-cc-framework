import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';

const THREE_MONTHS_MS = 90 * 24 * 60 * 60 * 1000;
const TWEETS_DIR = path.join(process.cwd(), 'content/collections/tweets');
const ARCHIVE_DIR = path.join(process.cwd(), 'content/collections/tweets-archive');

async function archiveOldTweets(): Promise<void> {
  const now = new Date();
  const cutoffDate = new Date(now.getTime() - THREE_MONTHS_MS);

  console.log(`Archiving tweets older than ${cutoffDate.toISOString().split('T')[0]}...`);

  if (!fs.existsSync(ARCHIVE_DIR)) {
    fs.mkdirSync(ARCHIVE_DIR, { recursive: true });
  }

  if (!fs.existsSync(TWEETS_DIR)) {
    console.log('No tweets directory found. Nothing to archive.');
    return;
  }

  const files = fs.readdirSync(TWEETS_DIR).filter(f => f.endsWith('.md'));
  let archivedCount = 0;

  for (const file of files) {
    const filepath = path.join(TWEETS_DIR, file);
    const content = fs.readFileSync(filepath, 'utf-8');
    const { data } = matter(content);

    if (!data.date) continue;

    const tweetDate = new Date(data.date);
    if (tweetDate < cutoffDate) {
      // Create year-month subdirectory in archive
      const yearMonth = `${tweetDate.getFullYear()}-${String(tweetDate.getMonth() + 1).padStart(2, '0')}`;
      const archiveSubdir = path.join(ARCHIVE_DIR, yearMonth);

      if (!fs.existsSync(archiveSubdir)) {
        fs.mkdirSync(archiveSubdir, { recursive: true });
      }

      const archivePath = path.join(archiveSubdir, file);
      fs.renameSync(filepath, archivePath);
      console.log(`✓ Archived: ${file} → ${yearMonth}/`);
      archivedCount++;
    }
  }

  console.log(`\n✓ Archived ${archivedCount} tweets`);
}

archiveOldTweets().catch(error => {
  console.error('Error archiving tweets:', error);
  process.exit(1);
});
