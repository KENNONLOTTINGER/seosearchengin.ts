# SEO Search Engine

A comprehensive Google-style SEO search programming engine built with TypeScript. This project implements a web crawler that extracts SEO metrics, ranks pages by relevance, and provides powerful search capabilities.

## Features

✅ **Web Crawling** - Crawl websites with configurable depth and page limits
✅ **SEO Metrics Extraction** - Title, meta descriptions, headings, keywords
✅ **Mobile Optimization Detection** - Check for mobile-friendly implementations
✅ **Readability Scoring** - Flesch-Kincaid readability analysis
✅ **Page Ranking** - Relevance-based ranking algorithm
✅ **Keyword Search** - Search indexed pages by keyword
✅ **Structured Data** - Extract Schema.org microdata
✅ **Performance Metrics** - Track page load times and statistics

## Installation

```bash
npm install
```

## Build

```bash
npm run build
```

## Usage

### Basic Example

```typescript
import GoogleSEOSearchEngine from './src/seoSearchEngine';

const searchEngine = new GoogleSEOSearchEngine({
  maxDepth: 3,
  maxPages: 500,
  timeout: 10000,
});

// Crawl a website
const results = await searchEngine.crawlWebsite('https://example.com');

// Search for keyword
const searchResults = searchEngine.search('typescript');

// Get statistics
const stats = searchEngine.getStats();
```

### Configuration Options

```typescript
interface CrawlerConfig {
  maxDepth: number;          // Maximum crawl depth (default: 3)
  maxPages: number;          // Maximum pages to index (default: 1000)
  timeout: number;           // Request timeout in ms (default: 10000)
  userAgent: string;         // Custom user agent (default: 'GoogleSEOBot/1.0')
  respectRobotsTxt: boolean; // Respect robots.txt (default: true)
}
```

## SEO Metrics Extracted

- **Title** - Page title tag
- **Meta Description** - Meta description tag
- **Headings** - All H1-H6 headings
- **Keywords** - Meta keywords and high-frequency words
- **Image Alt Texts** - For accessibility analysis
- **Internal/External Links** - Link structure analysis
- **Word Count** - Content length measurement
- **Readability Score** - Flesch-Kincaid grade level
- **Page Load Time** - Performance metrics
- **Mobile Optimization** - Viewport meta tag detection
- **Structured Data** - Schema.org microdata

## Ranking Algorithm

Pages are ranked based on:
- Title presence (20%)
- Meta description (15%)
- Content quality (30%)
- Heading structure (15%)
- Mobile optimization (10%)
- Page load time (10%)

## API Reference

### `crawlWebsite(seedUrl: string): Promise<SearchResult[]>`
Crawl a website and return ranked results.

### `search(keyword: string): SearchResult[]`
Search indexed pages for a specific keyword.

### `getStats()`
Get crawling statistics and metrics.

### `extractSEOMetrics(url: string): Promise<SEOMetrics>`
Extract SEO metrics from a single page.

## Dependencies

- **axios** - HTTP client for web requests
- **cheerio** - jQuery-like HTML parsing
- **TypeScript** - Type safety and modern JavaScript

## Development

Run in development mode:
```bash
npm run dev
```

Run tests:
```bash
npm test
```

Lint code:
```bash
npm run lint
```

## License

MIT

## Author

KENNONLOTTINGER
