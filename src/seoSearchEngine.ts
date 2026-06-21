/**
 * Google SEO Search Programming Engine
 * A comprehensive search engine crawler and optimization engine
 */

import axios from 'axios';
import cheerio from 'cheerio';
import { URL } from 'url';

interface SEOMetrics {
  title: string;
  metaDescription: string;
  headings: string[];
  keywords: string[];
  imageAltTexts: string[];
  internalLinks: string[];
  externalLinks: string[];
  wordCount: number;
  readabilityScore: number;
  pageLoadTime: number;
  mobileOptimized: boolean;
  structuredData: any[];
}

interface SearchResult {
  url: string;
  title: string;
  description: string;
  rank: number;
  relevanceScore: number;
  metrics: SEOMetrics;
}

interface CrawlerConfig {
  maxDepth: number;
  maxPages: number;
  timeout: number;
  userAgent: string;
  respectRobotsTxt: boolean;
}

class GoogleSEOSearchEngine {
  private config: CrawlerConfig;
  private indexedPages: Map<string, SEOMetrics>;
  private visitedUrls: Set<string>;

  constructor(config: Partial<CrawlerConfig> = {}) {
    this.config = {
      maxDepth: config.maxDepth || 3,
      maxPages: config.maxPages || 1000,
      timeout: config.timeout || 10000,
      userAgent: config.userAgent || 'GoogleSEOBot/1.0',
      respectRobotsTxt: config.respectRobotsTxt !== false,
    };

    this.indexedPages = new Map();
    this.visitedUrls = new Set();
  }

  /**
   * Crawl a website and extract SEO metrics
   */
  async crawlWebsite(seedUrl: string): Promise<SearchResult[]> {
    console.log(`Starting crawl from: ${seedUrl}`);
    
    const queue: Array<{ url: string; depth: number }> = [
      { url: seedUrl, depth: 0 },
    ];

    while (queue.length > 0 && this.indexedPages.size < this.config.maxPages) {
      const { url, depth } = queue.shift()!;

      if (this.visitedUrls.has(url) || depth > this.config.maxDepth) {
        continue;
      }

      this.visitedUrls.add(url);

      try {
        const metrics = await this.extractSEOMetrics(url);
        this.indexedPages.set(url, metrics);

        // Extract new URLs to crawl
        const newUrls = this.extractLinks(metrics.internalLinks, seedUrl);
        for (const newUrl of newUrls) {
          if (!this.visitedUrls.has(newUrl)) {
            queue.push({ url: newUrl, depth: depth + 1 });
          }
        }

        console.log(`✓ Indexed: ${url} (Depth: ${depth})`);
      } catch (error) {
        console.error(`✗ Failed to crawl ${url}: ${error}`);
      }
    }

    return this.rankPages();
  }

  /**
   * Extract SEO metrics from a single page
   */
  async extractSEOMetrics(url: string): Promise<SEOMetrics> {
    const startTime = Date.now();

    try {
      const response = await axios.get(url, {
        timeout: this.config.timeout,
        headers: { 'User-Agent': this.config.userAgent },
      });

      const pageLoadTime = Date.now() - startTime;
      const $ = cheerio.load(response.data);
      const html = response.data;

      return {
        title: $('title').text() || '',
        metaDescription:
          $('meta[name="description"]').attr('content') || '',
        headings: this.extractHeadings($),
        keywords: this.extractKeywords($, html),
        imageAltTexts: this.extractImageAltTexts($),
        internalLinks: this.extractInternalLinks($, url),
        externalLinks: this.extractExternalLinks($),
        wordCount: this.calculateWordCount($),
        readabilityScore: this.calculateReadabilityScore($),
        pageLoadTime,
        mobileOptimized: this.checkMobileOptimization($),
        structuredData: this.extractStructuredData($),
      };
    } catch (error) {
      throw new Error(`Failed to extract metrics from ${url}: ${error}`);
    }
  }

  /**
   * Extract all headings from page
   */
  private extractHeadings($: cheerio.CheerioAPI): string[] {
    const headings: string[] = [];
    $('h1, h2, h3, h4, h5, h6').each((_, elem) => {
      const text = $(elem).text().trim();
      if (text) headings.push(text);
    });
    return headings;
  }

  /**
   * Extract keywords from meta tags and content
   */
  private extractKeywords($: cheerio.CheerioAPI, html: string): string[] {
    const keywords: string[] = [];

    // From meta keywords tag
    const metaKeywords = $('meta[name="keywords"]').attr('content');
    if (metaKeywords) {
      keywords.push(
        ...metaKeywords
          .split(',')
          .map((k) => k.trim())
          .filter((k) => k.length > 0)
      );
    }

    // Extract high-frequency words
    const words = html
      .toLowerCase()
      .match(/\b\w{4,}\b/g) || [];
    const wordFreq = new Map<string, number>();

    words.forEach((word) => {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
    });

    const topWords = Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);

    keywords.push(...topWords);

    return Array.from(new Set(keywords));
  }

  /**
   * Extract image alt texts for accessibility
   */
  private extractImageAltTexts($: cheerio.CheerioAPI): string[] {
    const altTexts: string[] = [];
    $('img').each((_, elem) => {
      const alt = $(elem).attr('alt');
      if (alt) altTexts.push(alt);
    });
    return altTexts;
  }

  /**
   * Extract internal links
   */
  private extractInternalLinks(
    $: cheerio.CheerioAPI,
    baseUrl: string
  ): string[] {
    const links: string[] = [];
    const baseHostname = new URL(baseUrl).hostname;

    $('a[href]').each((_, elem) => {
      try {
        const href = $(elem).attr('href')!;
        const fullUrl = new URL(href, baseUrl);

        if (fullUrl.hostname === baseHostname) {
          links.push(fullUrl.toString());
        }
      } catch (e) {
        // Invalid URL, skip
      }
    });

    return Array.from(new Set(links));
  }

  /**
   * Extract external links
   */
  private extractExternalLinks($: cheerio.CheerioAPI): string[] {
    const links: string[] = [];

    $('a[href]').each((_, elem) => {
      try {
        const href = $(elem).attr('href')!;
        if (href.startsWith('http://') || href.startsWith('https://')) {
          links.push(href);
        }
      } catch (e) {
        // Invalid URL, skip
      }
    });

    return Array.from(new Set(links));
  }

  /**
   * Calculate word count of main content
   */
  private calculateWordCount($: cheerio.CheerioAPI): number {
    const text = $('body').text();
    return text.split(/\s+/).filter((word) => word.length > 0).length;
  }

  /**
   * Calculate readability score (Flesch-Kincaid)
   */
  private calculateReadabilityScore($: cheerio.CheerioAPI): number {
    const text = $('body').text();
    const sentences = text.split(/[.!?]+/).length;
    const words = text.split(/\s+/).length;
    const syllables = this.countSyllables(text);

    // Flesch-Kincaid Grade Level
    const score =
      0.39 * (words / sentences) +
      11.8 * (syllables / words) -
      15.59;

    return Math.max(0, Math.round(score * 10) / 10);
  }

  /**
   * Count syllables in text (simplified)
   */
  private countSyllables(text: string): number {
    let count = 0;
    const words = text.toLowerCase().match(/\b[\w']+\b/g) || [];

    words.forEach((word) => {
      count += (word.match(/[aeiouy]/g) || []).length;
    });

    return Math.max(count, 1);
  }

  /**
   * Check mobile optimization
   */
  private checkMobileOptimized($: cheerio.CheerioAPI): boolean {
    const viewportMeta = $('meta[name="viewport"]').attr('content');
    return !!viewportMeta;
  }

  /**
   * Extract structured data (Schema.org)
   */
  private extractStructuredData($: cheerio.CheerioAPI): any[] {
    const structuredData: any[] = [];

    $('script[type="application/ld+json"]').each((_, elem) => {
      try {
        const data = JSON.parse($(elem).text());
        structuredData.push(data);
      } catch (e) {
        // Invalid JSON, skip
      }
    });

    return structuredData;
  }

  /**
   * Extract links and filter by domain
   */
  private extractLinks(links: string[], seedUrl: string): string[] {
    const baseHostname = new URL(seedUrl).hostname;

    return links.filter((link) => {
      try {
        return new URL(link).hostname === baseHostname;
      } catch {
        return false;
      }
    });
  }

  /**
   * Rank pages by relevance
   */
  private rankPages(): SearchResult[] {
    const results: SearchResult[] = [];
    let rank = 1;

    // Calculate relevance scores
    const scoreMap = new Map<string, number>();

    for (const [url, metrics] of this.indexedPages.entries()) {
      let score = 0;

      // Title relevance (20%)
      if (metrics.title) score += 20;

      // Meta description (15%)
      if (metrics.metaDescription) score += 15;

      // Content quality (30%)
      if (metrics.wordCount > 300) score += 20;
      if (metrics.wordCount > 1000) score += 10;

      // Headings structure (15%)
      score += Math.min(metrics.headings.length * 3, 15);

      // Mobile optimization (10%)
      if (metrics.mobileOptimized) score += 10;

      // Page load time (10%)
      if (metrics.pageLoadTime < 3000) score += 10;
      else if (metrics.pageLoadTime > 5000) score -= 5;

      scoreMap.set(url, score);
    }

    // Sort by score
    const sortedUrls = Array.from(scoreMap.entries())
      .sort((a, b) => b[1] - a[1]);

    for (const [url, relevanceScore] of sortedUrls) {
      const metrics = this.indexedPages.get(url)!;

      results.push({
        url,
        title: metrics.title,
        description: metrics.metaDescription,
        rank: rank++,
        relevanceScore,
        metrics,
      });
    }

    return results;
  }

  /**
   * Search for keyword in indexed pages
   */
  search(keyword: string): SearchResult[] {
    const results: SearchResult[] = [];

    for (const [url, metrics] of this.indexedPages.entries()) {
      let score = 0;

      // Title match (weight: 3x)
      if (metrics.title.toLowerCase().includes(keyword.toLowerCase())) {
        score += 30;
      }

      // Meta description match (weight: 2x)
      if (
        metrics.metaDescription
          .toLowerCase()
          .includes(keyword.toLowerCase())
      ) {
        score += 20;
      }

      // Headings match (weight: 2x)
      if (
        metrics.headings.some((h) =>
          h.toLowerCase().includes(keyword.toLowerCase())
        )
      ) {
        score += 20;
      }

      // Keywords match (weight: 1x)
      if (
        metrics.keywords.some((k) =>
          k.toLowerCase().includes(keyword.toLowerCase())
        )
      ) {
        score += 10;
      }

      if (score > 0) {
        results.push({
          url,
          title: metrics.title,
          description: metrics.metaDescription,
          rank: 0,
          relevanceScore: score,
          metrics,
        });
      }
    }

    // Sort by relevance
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Update ranks
    results.forEach((result, index) => {
      result.rank = index + 1;
    });

    return results;
  }

  /**
   * Get indexing statistics
   */
  getStats() {
    return {
      totalPagesIndexed: this.indexedPages.size,
      totalUrlsVisited: this.visitedUrls.size,
      averageWordCount:
        Array.from(this.indexedPages.values()).reduce(
          (sum, m) => sum + m.wordCount,
          0
        ) / this.indexedPages.size || 0,
      averagePageLoadTime:
        Array.from(this.indexedPages.values()).reduce(
          (sum, m) => sum + m.pageLoadTime,
          0
        ) / this.indexedPages.size || 0,
    };
  }
}

export default GoogleSEOSearchEngine;
export { SEOMetrics, SearchResult, CrawlerConfig };
