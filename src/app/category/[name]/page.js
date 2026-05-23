import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { readDatabase } from "../../../../services/db";
import { SEO_CONFIG, getCanonicalUrl } from "../../../../services/seo/config";
import JsonLd from "../../../../components/seo/JsonLd";
import { getBreadcrumbSchema } from "../../../../services/seo/schema";
import PerformanceImage from "../../../../components/seo/PerformanceImage";
import SafeAdSlot from "../../../../components/seo/SafeAdSlot";

export const dynamic = "force-dynamic";

// Helper to capitalize category names
function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Generate Category SEO Metadata
export async function generateMetadata({ params }) {
  const { name } = await params;
  const capitalized = capitalize(name);

  return {
    title: `${capitalized} News & Updates | ${SEO_CONFIG.siteName}`,
    description: `Browse the latest, most comprehensive trending news, articles, and analysis on ${capitalized} in India and globally.`,
    alternates: {
      canonical: getCanonicalUrl(`/category/${name.toLowerCase()}`)
    },
    openGraph: {
      title: `${capitalized} News | ${SEO_CONFIG.siteName}`,
      description: `Stay updated on ${capitalized} news and detailed insights from NewsAdda India Desk.`,
      url: getCanonicalUrl(`/category/${name.toLowerCase()}`),
      type: "website"
    }
  };
}

export default async function CategoryPage({ params }) {
  const { name } = await params;
  const categoryName = capitalize(name);
  
  // Read posts and filter by category
  const allPosts = await readDatabase();
  const filteredPosts = allPosts.filter(
    (post) =>
      post.category &&
      post.category.toLowerCase().trim() === name.toLowerCase().trim()
  );

  if (filteredPosts.length === 0) {
    notFound();
  }

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: categoryName, url: `/category/${name.toLowerCase()}` }
  ]);

  const featured = filteredPosts[0];
  const gridPosts = filteredPosts.slice(1);

  return (
    <div className="main-wrapper" style={{ padding: "30px 20px" }}>
      <JsonLd schema={breadcrumbSchema} />

      {/* Category Hero Header */}
      <section 
        className="feed-hero" 
        style={{ 
          maxWidth: "1200px", 
          margin: "0 auto 32px",
          borderBottom: "1px solid var(--border-subtle)",
          paddingBottom: "24px"
        }}
      >
        <span className="feed-hero-eyebrow">Category Focus</span>
        <h1 className="feed-hero-title">{categoryName} News</h1>
        <p className="feed-hero-desc">
          Factual coverage, deep analytical timelines, and comprehensive live reports regarding {categoryName.toLowerCase()} events.
        </p>
      </section>

      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* Ad block to maximize monetisation on high traffic landings */}
        <SafeAdSlot slotType="leaderboard" />

        {/* Featured Card */}
        {featured && (
          <div style={{ marginBottom: "40px" }}>
            <Link href={`/posts/${featured.id}`} style={{ display: "block", textDecoration: "none", color: "inherit" }}>
              <div 
                style={{ 
                  display: "grid", 
                  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
                  gap: "28px",
                  alignItems: "center"
                }}
              >
                <PerformanceImage 
                  src={featured.image} 
                  alt={featured.title} 
                  priority={true} 
                  aspectRatio="16/9" 
                />
                <div>
                  <span 
                    style={{ 
                      fontSize: "0.78rem", 
                      fontWeight: "700", 
                      textTransform: "uppercase", 
                      letterSpacing: "0.05em",
                      color: "var(--accent-primary)",
                      display: "inline-block",
                      marginBottom: "12px"
                    }}
                  >
                    {featured.category}
                  </span>
                  <h2 style={{ fontSize: "2rem", fontWeight: "800", lineHeight: "1.2", marginBottom: "16px" }}>
                    {featured.title}
                  </h2>
                  <p style={{ color: "var(--text-secondary)", lineHeight: "1.6", marginBottom: "16px" }}>
                    {featured.description}
                  </p>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    By <strong>{featured.author}</strong> • {new Date(featured.publishedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Dynamic post grid */}
        {gridPosts.length > 0 && (
          <section>
            <h2 style={{ fontSize: "1.4rem", fontWeight: "700", borderBottom: "2px solid #0f172a", display: "inline-block", paddingBottom: "4px", marginBottom: "24px" }}>
              More in {categoryName}
            </h2>
            <div 
              style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", 
                gap: "24px" 
              }}
            >
              {gridPosts.map((post) => (
                <Link key={post.id} href={`/posts/${post.id}`} style={{ display: "block", textDecoration: "none", color: "inherit" }}>
                  <article style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <PerformanceImage src={post.image} alt={post.title} aspectRatio="16/9" />
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      {new Date(post.publishedAt).toLocaleDateString()}
                    </span>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: "700", lineHeight: "1.3" }}>{post.title}</h3>
                    <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", display: "-webkit-box", WebkitLineClamp: "3", WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {post.description}
                    </p>
                  </article>
                </Link>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
