import { readDatabase } from "../../../services/db";
import { SEO_CONFIG } from "../../../services/seo/config";
import { getPostUrl } from "../../../lib/utils";
import { getAuthorProfile } from "../../../services/authorService";
import { getTrendSlugs } from "../../../services/trends/trendFetcher";

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

export async function GET() {
  try {
    const posts = await readDatabase();
    const base = SEO_CONFIG.baseUrl;

    // Each entry: { loc, lastmod, changefreq, priority, image? }
    const entries = [];

    // ── Core static pages ────────────────────────────────────────
    const staticPages = [
      { path: "", priority: "1.0", changefreq: "daily" },
      { path: "/gold-rate", priority: "0.9", changefreq: "hourly" },
      { path: "/about", priority: "0.4", changefreq: "monthly" },
      { path: "/contact", priority: "0.4", changefreq: "monthly" },
      { path: "/editorial-policy", priority: "0.3", changefreq: "monthly" },
      { path: "/privacy-policy", priority: "0.3", changefreq: "monthly" },
      { path: "/terms", priority: "0.3", changefreq: "monthly" },
    ];

    const now = new Date().toISOString();

    staticPages.forEach((p) => {
      entries.push({
        loc: `${base}${p.path}`,
        lastmod: now,
        changefreq: p.changefreq,
        priority: p.priority,
      });
    });

    // ── Categories (unique, URL-safe) ────────────────────────────
    // Only submit categories with 2+ posts to avoid indexing thin-content pages.
    const categoryCounts = {};
    posts.forEach((p) => {
      const cat = (p.category || "").trim();
      if (cat) categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
    const categories = Object.keys(categoryCounts).filter(
      (cat) => categoryCounts[cat] >= 2
    );
    categories.forEach((cat) => {
      const slug = encodeURIComponent(cat.toLowerCase());
      entries.push({
        loc: `${base}/category/${slug}`,
        lastmod: now,
        changefreq: "daily",
        priority: "0.6",
      });
    });

    // ── Programmatic trend hubs ──────────────────────────────────
    getTrendSlugs().forEach((slug) => {
      entries.push({
        loc: `${base}/trends/${slug}`,
        lastmod: now,
        changefreq: "daily",
        priority: "0.7",
      });
    });

    // ── Authors (normalized slugs with 2+ posts to avoid thin pages) ─
    const authorPostCounts = {};
    posts.forEach((p) => {
      if (!p.author) return;
      const slug = getAuthorProfile(p.author, posts).slug;
      authorPostCounts[slug] = (authorPostCounts[slug] || 0) + 1;
    });
    const authorSlugs = Object.keys(authorPostCounts).filter(
      (slug) => authorPostCounts[slug] >= 2
    );
    authorSlugs.forEach((slug) => {
      entries.push({
        loc: `${base}/author/${slug}`,
        lastmod: now,
        changefreq: "weekly",
        priority: "0.5",
      });
    });

    // ── Articles (language-aware URLs) ───────────────────────────
    posts.forEach((post) => {
      const url = getPostUrl(post);
      const entry = {
        loc: `${base}${url}`,
        lastmod: post.publishedAt || now,
        changefreq: "weekly",
        priority: "0.8",
      };
      if (post.image && /^https?:\/\//.test(post.image)) {
        entry.image = post.image;
        entry.imageTitle = post.title || "";
      }
      entries.push(entry);
    });

    // ── Compile XML ──────────────────────────────────────────────
    const urlsXml = entries
      .map((e) => {
        const imageXml = e.image
          ? `
    <image:image>
      <image:loc>${xmlEscape(e.image)}</image:loc>
      <image:title>${xmlEscape(e.imageTitle)}</image:title>
    </image:image>`
          : "";

        return `  <url>
    <loc>${xmlEscape(e.loc)}</loc>
    <lastmod>${xmlEscape(e.lastmod)}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>${imageXml}
  </url>`;
      })
      .join("\n");

    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urlsXml}
</urlset>`;

    console.log(
      `[Sitemap.xml API] Generated ${entries.length} URLs (${posts.length} articles, ${categories.length} categories, ${authorSlugs.length} authors).`
    );

    return new Response(sitemapXml, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("[Sitemap.xml API] Error generating standard sitemap:", error);
    return new Response("<error>Failed to compile sitemap</error>", {
      status: 500,
      headers: { "Content-Type": "application/xml" },
    });
  }
}
