import matter from 'gray-matter';
import { stringify, Scalar } from 'yaml';

export interface FrontmatterData {
  [key: string]: any;
}

export interface ParsedMarkdown {
  data: FrontmatterData;
  content: string;
}

export function parseMarkdownWithFrontmatter(markdown: string): ParsedMarkdown {
  const parsed = matter(markdown);
  return {
    data: parsed.data,
    content: parsed.content
  };
}

export function generateMarkdownWithFrontmatter(
  data: FrontmatterData,
  content: string
): string {
  // Process data to wrap date strings in Scalar for quoting
  const processedData = processDataForYAML(data);

  const yamlString = stringify(processedData, {
    indent: 2,
    lineWidth: 0
  });

  return `---\n${yamlString}---\n\n${content}`;
}

function processDataForYAML(data: any): any {
  if (Array.isArray(data)) {
    return data.map(item => processDataForYAML(item));
  } else if (data !== null && typeof data === 'object') {
    const processed: any = {};
    for (const [key, value] of Object.entries(data)) {
      processed[key] = processDataForYAML(value);
    }
    return processed;
  } else if (typeof data === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(data)) {
    // Force quoting for date-like strings
    const scalar = new Scalar(data);
    scalar.type = 'QUOTE_DOUBLE';
    return scalar;
  }
  return data;
}
