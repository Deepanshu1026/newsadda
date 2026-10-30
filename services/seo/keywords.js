/**
 * NewsAdda SEO Keyword & Internal Linking Engine
 * -------------------------------------------------
 * Pure functions (safe in both server and client components) that:
 *  1. Extract high-value trending keywords from post titles/descriptions.
 *  2. Build keyword-rich metadata strings for pages.
 *  3. Aggregate site-wide trending topics for tag clouds.
 *  4. Produce an internal-linking map so article bodies can deep-link
 *     to categories and trend hubs.
 */

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "if", "then", "else", "for", "of", "to", "in", "on", "at",
  "by", "with", "from", "as", "is", "are", "was", "were", "be", "been", "being", "it", "its",
  "this", "that", "these", "those", "he", "she", "they", "them", "his", "her", "their", "we", "you",
  "i", "me", "my", "our", "your", "not", "no", "do", "does", "did", "done", "have", "has", "had",
  "will", "would", "can", "could", "should", "may", "might", "must", "about", "into", "over", "after",
  "before", "between", "under", "above", "up", "down", "out", "off", "again", "more", "most", "some",
  "such", "only", "own", "same", "so", "than", "too", "very", "just", "also", "now", "new", "says",
  "said", "say", "amid", "ahead", "who", "what", "when", "where", "why", "how", "all", "any", "each",
  "few", "other", "because", "while", "during", "through", "against", "per", "vs", "him", "us", "get",
  "gets", "got", "one", "two", "three", "first", "last", "next", "back", "top", "here", "there", "today",
  "yesterday", "tomorrow", "read", "watch", "live", "update", "updates", "news", "latest", "breaking",
  "video", "photos", "photo", "full", "how", "why", "what", "which", "your", "you", "amid",
]);

/** Normalize a raw string into keyword tokens. */
function tokenize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\u0900-\u097F\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w));
}

/**
 * Extract the top N keywords from any text blob, ranked by frequency.
 * @param {string} text
 * @param {number} limit
 * @returns {string[]}
 */
export function extractKeywords(text, limit = 10) {
  const freq = {};
  tokenize(text).forEach((w) => {
    freq[w] = (freq[w] || 0) + 1;
  });
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word);
}

/** Core evergreen keywords always worth including on a news page. */
const CORE_KEYWORDS = [
  "newsadda",
  "breaking news india",
  "latest news",
  "trending news",
  "today news",
  "india news live",
];

/**
 * Build a keyword array for a single post (title + description + category + author).
 * @param {Object} post
 * @returns {string[]}
 */
export function getPostKeywords(post = {}) {
  const blob = [post.title, post.description, post.category, post.author]
    .filter(Boolean)
    .join(" ");

  const dynamic = extractKeywords(blob, 12);

  const categoryTerms = [];
  if (post.category) {
    const cat = post.category.toLowerCase().trim();
    categoryTerms.push(cat, `${cat} news`, `${cat} today`, `${cat} latest updates`);
  }

  return Array.from(
    new Set([...dynamic, ...categoryTerms, ...CORE_KEYWORDS])
  ).slice(0, 24);
}

/** Comma-joined keyword string for the metadata `keywords` field. */
export function getPostKeywordString(post = {}) {
  return getPostKeywords(post).join(", ");
}

/**
 * Aggregate the most frequently occurring keywords across the newest posts.
 * @param {Array} posts
 * @param {number} limit
 * @returns {string[]}
 */
export function getTrendingTopics(posts = [], limit = 16) {
  const recent = [...posts]
    .sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0))
    .slice(0, 60);

  const blob = recent
    .map((p) => `${p.title || ""} ${p.title || ""} ${p.description || ""}`)
    .join(" ");

  return extractKeywords(blob, limit);
}

/**
 * Derive a human-readable phrase from a trend slug (e.g. "ipl-2026" -> "IPL 2026").
 */
export function slugToPhrase(slug) {
  return String(slug || "")
    .split("-")
    .map((w) => (w.length <= 3 ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
}

/**
 * Build an ordered list of { phrase, url } pairs for internal deep-linking
 * inside an article body. Ordered by priority (category first, then trends).
 *
 * @param {Object} post - current post
 * @param {Array} trendSlugs - known trend slugs (from trendFetcher)
 * @param {number} max - max number of phrases to link
 * @returns {Array<{phrase: string, url: string}>}
 */
export function buildInternalLinkMap(post = {}, trendSlugs = [], max = 4) {
  const links = [];

  // 1. Category (highest priority)
  if (post.category) {
    links.push({
      phrase: post.category,
      url: `/category/${encodeURIComponent(post.category.toLowerCase().trim())}`,
    });
  }

  // 2. Trend hubs whose phrase appears in the article title
  const haystack = `${post.title || ""} ${post.description || ""}`.toLowerCase();
  for (const slug of trendSlugs) {
    const phrase = slugToPhrase(slug);
    if (phrase.length >= 5 && haystack.includes(phrase.toLowerCase())) {
      links.push({ phrase, url: `/trends/${slug}` });
    }
  }

  return links.slice(0, max);
}
