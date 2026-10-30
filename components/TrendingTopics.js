import Link from "next/link";
import { getTrendingTopics } from "../services/seo/keywords";
import { getTrendSlugs } from "../services/trends/trendFetcher";

const TREND_LABELS = {
  "ipl-2026": "IPL 2026",
  "india-election-2026": "India Elections 2026",
  "deepika": "Deepika Padukone",
};

function trendLabel(slug) {
  return TREND_LABELS[slug] || slug.split("-").map((w) => (w.length <= 3 ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1))).join(" ");
}

/**
 * TrendingTopics
 * A dense, internal-link-rich topic cloud used on the home feed and article pages.
 * Every chip is an internal link (category hub, trend hub, or live search feed),
 * which spreads link equity across the site and helps crawlers discover pages.
 */
export default function TrendingTopics({ posts = [], title = "Trending Topics" }) {
  // Top categories by post volume
  const counts = {};
  posts.forEach((p) => {
    const cat = (p.category || "").trim();
    if (cat) counts[cat] = (counts[cat] || 0) + 1;
  });
  const topCategories = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([cat]) => cat);

  const keywords = getTrendingTopics(posts, 14);
  const trendSlugs = getTrendSlugs();

  if (topCategories.length === 0 && keywords.length === 0 && trendSlugs.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Trending topics and keywords"
      style={{
        backgroundColor: "var(--bg-surface, rgba(255, 255, 255, 0.88))",
        border: "1px solid var(--border-subtle)",
        borderRadius: "16px",
        padding: "24px",
        boxShadow: "var(--card-shadow)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        margin: "24px 0",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
        <span style={{ width: "4px", height: "18px", backgroundColor: "#b45309", borderRadius: "2px", display: "inline-block" }} />
        <h2 style={{ fontSize: "1.15rem", fontWeight: "800", margin: 0, fontFamily: "var(--font-display)" }}>
          {title}
        </h2>
      </div>

      {/* Trend hubs */}
      {trendSlugs.length > 0 && (
        <div style={{ marginBottom: "14px" }}>
          <div style={{ fontSize: "0.72rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: "8px" }}>
            Trend Hubs
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {trendSlugs.map((slug) => (
              <Link
                key={slug}
                href={`/trends/${slug}`}
                style={{
                  fontSize: "0.8rem",
                  fontWeight: "700",
                  padding: "5px 12px",
                  borderRadius: "20px",
                  background: "linear-gradient(135deg, #b45309, #d97706)",
                  color: "#fff",
                  textDecoration: "none",
                }}
              >
                🔥 {trendLabel(slug)}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Category hubs */}
      {topCategories.length > 0 && (
        <div style={{ marginBottom: "14px" }}>
          <div style={{ fontSize: "0.72rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: "8px" }}>
            News Categories
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {topCategories.map((cat) => (
              <Link
                key={cat}
                href={`/category/${encodeURIComponent(cat.toLowerCase().trim())}`}
                style={{
                  fontSize: "0.8rem",
                  fontWeight: "600",
                  padding: "5px 12px",
                  borderRadius: "20px",
                  background: "var(--bg-pill, #f4f4f5)",
                  color: "var(--text-pill, #4f46e5)",
                  border: "1px solid var(--border-subtle)",
                  textDecoration: "none",
                }}
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Keyword tags -> live search feed */}
      {keywords.length > 0 && (
        <div>
          <div style={{ fontSize: "0.72rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: "8px" }}>
            Trending Keywords
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {keywords.map((kw) => (
              <Link
                key={kw}
                href={`/?search=${encodeURIComponent(kw)}`}
                style={{
                  fontSize: "0.78rem",
                  fontWeight: "500",
                  padding: "4px 10px",
                  borderRadius: "8px",
                  background: "rgba(15, 23, 42, 0.03)",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border-subtle)",
                  textDecoration: "none",
                }}
              >
                #{kw}
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
