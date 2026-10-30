import { readDatabase } from "../../../services/db";
import { SEO_CONFIG } from "../../../services/seo/config";
import { getPostUrl } from "../../../lib/utils";

export const dynamic = "force-dynamic";

/** Escape characters that are invalid in XML text/URL values. */
function xmlEscape(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Google News expects ISO 639-1 language codes (hinglish is not valid). */
function newsLanguage(lang) {
  if (lang === "hi") return "hi";
  return "en"; // en + hinglish
}

export async function GET() {
  try {
    const posts = await readDatabase();

    // Google News Sitemap rules: ONLY include articles published in the last 48 hours.
    const fortyEightHoursAgo = new Date();
    fortyEightHoursAgo.setHours(fortyEightHoursAgo.getHours() - 48);

    const newsArticles = posts.filter((post) => {
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
  .map((post) => {
    const url = `${SEO_CONFIG.baseUrl}${getPostUrl(post)}`;

    return `  <url>
    <loc>${xmlEscape(url)}</loc>
    <news:news>
      <news:publication>
        <news:name>${xmlEscape(SEO_CONFIG.siteName)}</news:name>
        <news:language>${newsLanguage(post.language)}</news:language>
      </news:publication>
      <news:publication_date>${xmlEscape(post.publishedAt)}</news:publication_date>
      <news:title>${xmlEscape(post.title)}</news:title>
    </news:news>
  </url>`;
  })
  .join("\n")}
</urlset>`;

    return new Response(newsSitemapXml, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    console.error("[News Sitemap API] Error compiling news sitemap:", error);
    return new Response("<error>Failed to compile Google News sitemap</error>", {
      status: 500,
      headers: { "Content-Type": "application/xml" },
    });
  }
}
