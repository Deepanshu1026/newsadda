function decodeXml(str) {
  if (!str) return "";
  // Strip CDATA wrapper
  let clean = str.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, "$1");
  return clean
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .trim();
}

/**
 * Fetches and parses daily Google Trends searches for a given geo.
 * Default geo is 'IN' (India).
 */
export async function fetchGoogleTrends(geo = "IN") {
  const url = `https://trends.google.com/trending/rss?geo=${geo}`;
  
  try {
    console.log(`[Google Trends Service] Fetching trends from URL: ${url}`);
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
      },
      next: { revalidate: 900 } // cache for 15 minutes
    });

    if (!response.ok) {
      throw new Error(`Google Trends RSS HTTP error: status ${response.status}`);
    }

    const xml = await response.text();
    
    // Parse items using regex
    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    let match;

    while ((match = itemRegex.exec(xml)) !== null) {
      const itemContent = match[1];

      // Extract trend query title
      const titleMatch = /<title>([\s\S]*?)<\/title>/i.exec(itemContent);
      const title = titleMatch ? decodeXml(titleMatch[1]) : "";

      // Extract approx traffic
      const trafficMatch = /<ht:approx_traffic>([\s\S]*?)<\/ht:approx_traffic>/i.exec(itemContent);
      const traffic = trafficMatch ? decodeXml(trafficMatch[1]) : "Unknown volume";

      // Extract picture
      const pictureMatch = /<ht:picture>([\s\S]*?)<\/ht:picture>/i.exec(itemContent);
      const picture = pictureMatch ? decodeXml(pictureMatch[1]) : "";

      // Extract picture source
      const picSourceMatch = /<ht:picture_source>([\s\S]*?)<\/ht:picture_source>/i.exec(itemContent);
      const pictureSource = picSourceMatch ? decodeXml(picSourceMatch[1]) : "";

      // Extract news items
      const newsItems = [];
      const newsItemRegex = /<ht:news_item>([\s\S]*?)<\/ht:news_item>/gi;
      let newsMatch;

      while ((newsMatch = newsItemRegex.exec(itemContent)) !== null) {
        const newsContent = newsMatch[1];
        
        const newsTitleMatch = /<ht:news_item_title>([\s\S]*?)<\/ht:news_item_title>/i.exec(newsContent);
        const newsTitle = newsTitleMatch ? decodeXml(newsTitleMatch[1]) : "";

        const newsSnippetMatch = /<ht:news_item_snippet>([\s\S]*?)<\/ht:news_item_snippet>/i.exec(newsContent);
        const newsSnippet = newsSnippetMatch ? decodeXml(newsSnippetMatch[1]) : "";

        const newsUrlMatch = /<ht:news_item_url>([\s\S]*?)<\/ht:news_item_url>/i.exec(newsContent);
        const newsUrl = newsUrlMatch ? decodeXml(newsUrlMatch[1]) : "";

        const newsSourceMatch = /<ht:news_item_source>([\s\S]*?)<\/ht:news_item_source>/i.exec(newsContent);
        const newsSource = newsSourceMatch ? decodeXml(newsSourceMatch[1]) : "";

        if (newsTitle) {
          newsItems.push({
            title: newsTitle,
            snippet: newsSnippet,
            url: newsUrl,
            source: newsSource
          });
        }
      }

      if (title) {
        items.push({
          title,
          traffic,
          picture,
          pictureSource,
          newsItems
        });
      }
    }

    console.log(`[Google Trends Service] Successfully parsed ${items.length} daily trends for geo: ${geo}`);
    return items;
  } catch (error) {
    console.error("[Google Trends Service] Error fetching Google Trends daily RSS:", error.message);
    return [];
  }
}
