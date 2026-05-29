import { readDatabase } from "../../../services/db";
import { SEO_CONFIG } from "../../../services/seo/config";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const posts = await readDatabase();
    
    // Google News Sitemap rules: ONLY include articles published in the last 48 hours.
    const fortyEightHoursAgo = new Date();
    fortyEightHoursAgo.setHours(fortyEightHoursAgo.getHours() - 48);

    const newsArticles = posts.filter(post => {
      if (!post.publishedAt) return false;
      const pubDate = new Date(post.publishedAt);
      return pubDate >= fortyEightHoursAgo;
    });

    console.log(`[News Sitemap] Found ${newsArticles.length} articles published in the last 48 hours.`);

    const newsSitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd
                            http://www.google.com/schemas/sitemap-news/0.9 http://www.google.com/schemas/sitemap-news/0.9/sitemap-news.xsd">
${newsArticles
  .map(post => {
    // Sanitize title for XML compliance
    const safeTitle = (post.title || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");

    return `  <url>
    <loc>${SEO_CONFIG.baseUrl}/posts/${post.id}</loc>
    <news:news>
      <news:publication>
        <news:name>${SEO_CONFIG.siteName}</news:name>
        <news:language>${post.language || 'en'}</news:language>
      </news:publication>
      <news:publication_date>${post.publishedAt}</news:publication_date>
      <news:title>${safeTitle}</news:title>
    </news:news>
  </url>`;
  })
  .join("\n")}
</urlset>`;

    return new Response(newsSitemapXml, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" // Faster revalidation for dynamic news content
      }
    });
  } catch (error) {
    console.error("[News Sitemap API] Error compiling news sitemap:", error);
    return new Response("<error>Failed to compile Google News sitemap</error>", {
      status: 500,
      headers: { "Content-Type": "application/xml" }
    });
  }
}
