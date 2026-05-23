import { SEO_CONFIG } from "../../services/seo/config";

/**
 * Next.js Dynamic Robots Directive Handler
 * Production-ready crawl rules optimizing index budgets.
 */
export default function robots() {
  return {
    rules: [
      {
        // Global User Agent rules
        userAgent: "*",
        allow: "/",
        disallow: [
          "/tech-dashboard",     // Block administrative syncing center
          "/api/",               // Block direct Next.js backend API routes
          "/debug-news"          // Block developer query screens
        ]
      },
      {
        // Special Googlebot-News crawlers
        userAgent: "Googlebot-News",
        allow: "/",
        disallow: [
          "/tech-dashboard",
          "/api/",
          "/debug-news"
        ]
      },
      {
        // AI Search Engine spider configurations
        userAgent: ["ChatGPT-User", "PerplexityBot", "ClaudeBot", "GPTBot"],
        allow: "/",
        disallow: ["/tech-dashboard", "/api/"]
      }
    ],
    sitemap: [
      `${SEO_CONFIG.baseUrl}/sitemap.xml`,
      `${SEO_CONFIG.baseUrl}/news-sitemap.xml`
    ]
  };
}
