/**
 * NewsAdda SEO Configuration Constants
 * Centralized settings for metadata, indexation, locales, and social channels.
 */

export const SEO_CONFIG = {
  siteName: "NewsAdda",
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://newsadda.com",
  defaultTitle: "NewsAdda | Real-Time Factual News, Analysis & Perspectives",
  defaultDescription: "NewsAdda delivers fast, factual, and deeply researched news coverage across politics, cricket, science, business, and technology. Stay ahead with our real-time India Desk updates.",
  defaultKeywords: [
    "Indian News",
    "Real-time news",
    "Cricket highlights",
    "Politics India",
    "Science and tech updates",
    "Business news",
    "Breaking news India",
    "NewsAdda"
  ].join(", "),
  
  // E-E-A-T Publisher identity profiles (Personal News & Tech Blog handled by Deepanshu Bisht)
  publisher: {
    name: "Deepanshu Bisht (NewsAdda)",
    logoUrl: "https://newsadda.com/logo.png",
    foundingDate: "2026",
    ownerUrl: "https://github.com/Deepanshu1026",
    email: "bishtdepanshu321@gmail.com"
  },

  // Locales for dynamic hreflang indexation
  locales: {
    en: "en-US",
    hi: "hi-IN"
  },

  // Centralized Social profiles for Organization SameAs schemas
  socials: {
    twitter: "@NewsAddaIndia",
    facebook: "https://facebook.com/NewsAddaOfficial",
    linkedin: "https://linkedin.com/company/newsadda-media",
    youtube: "https://youtube.com/c/NewsAddaIndia"
  },

  // Author defaults
  defaultAuthor: "NewsAdda Editorial Board"
};

/**
 * Utility to construct fully qualified canonical URLs
 * @param {string} path - The relative route path (e.g. "/posts/slug")
 * @returns {string} - The complete canonical URL
 */
export function getCanonicalUrl(path = "") {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${SEO_CONFIG.baseUrl}${cleanPath}`;
}
