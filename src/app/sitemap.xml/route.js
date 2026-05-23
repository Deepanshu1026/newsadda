import { readDatabase } from "../../../services/db";
import { SEO_CONFIG } from "../../../services/seo/config";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const posts = await readDatabase();
    
    // Core static URLs
    const staticPaths = [
      "",
      "/about",
      "/contact",
      "/editorial-policy",
      "/privacy-policy",
      "/terms"
    ];

    // Unique Categories
    const categories = Array.from(new Set(posts.map(p => p.category).filter(Boolean)));
    const categoryPaths = categories.map(cat => `/category/${cat.toLowerCase().trim()}`);

    // Dynamic Article Paths
    const articlePaths = posts.map(post => `/posts/${post.id}`);

    // Compile elements
    const allPaths = [...staticPaths, ...categoryPaths, ...articlePaths];
    const currentDate = new Date().toISOString();

    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${allPaths
  .map(path => {
    const isArticle = path.startsWith("/posts/");
    const matchedPost = isArticle ? posts.find(p => `/posts/${p.id}` === path) : null;
    const lastMod = matchedPost?.publishedAt || currentDate;
    const changeFreq = isArticle ? "monthly" : "daily";
    const priority = path === "" ? "1.0" : isArticle ? "0.8" : "0.5";

    return `  <url>
    <loc>${SEO_CONFIG.baseUrl}${path}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>${changeFreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  })
  .join("\n")}
</urlset>`;

    return new Response(sitemapXml, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600"
      }
    });
  } catch (error) {
    console.error("[Sitemap.xml API] Error generating standard sitemap:", error);
    return new Response("<error>Failed to compile sitemap</error>", {
      status: 500,
      headers: { "Content-Type": "application/xml" }
    });
  }
}
