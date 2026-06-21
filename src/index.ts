import GoogleSEOSearchEngine from './seoSearchEngine';

/**
 * Example usage of the Google SEO Search Engine
 */
async function main() {
  // Initialize the search engine with custom config
  const searchEngine = new GoogleSEOSearchEngine({
    maxDepth: 3,
    maxPages: 500,
    timeout: 10000,
  });

  try {
    // Crawl a website
    console.log('Starting SEO crawl...\n');
    const results = await searchEngine.crawlWebsite('https://example.com');

    // Display top results
    console.log('\n=== Top Ranked Pages ===\n');
    results.slice(0, 10).forEach((result) => {
      console.log(`Rank: ${result.rank}`);
      console.log(`URL: ${result.url}`);
      console.log(`Title: ${result.title}`);
      console.log(`Description: ${result.description}`);
      console.log(`Relevance Score: ${result.relevanceScore}/100`);
      console.log(`Word Count: ${result.metrics.wordCount}`);
      console.log(`Page Load Time: ${result.metrics.pageLoadTime}ms`);
      console.log(`Mobile Optimized: ${result.metrics.mobileOptimized}`);
      console.log('---');
    });

    // Search for specific keyword
    console.log('\n=== Search Results for "typescript" ===\n');
    const searchResults = searchEngine.search('typescript');
    searchResults.slice(0, 5).forEach((result) => {
      console.log(`${result.rank}. ${result.title}`);
      console.log(`   ${result.url}`);
      console.log(`   Relevance: ${result.relevanceScore}\n`);
    });

    // Display statistics
    console.log('\n=== Indexing Statistics ===\n');
    const stats = searchEngine.getStats();
    console.log(`Total Pages Indexed: ${stats.totalPagesIndexed}`);
    console.log(`Total URLs Visited: ${stats.totalUrlsVisited}`);
    console.log(`Average Word Count: ${Math.round(stats.averageWordCount)}`);
    console.log(
      `Average Page Load Time: ${Math.round(stats.averagePageLoadTime)}ms`
    );
  } catch (error) {
    console.error('Error during crawling:', error);
  }
}

main();
