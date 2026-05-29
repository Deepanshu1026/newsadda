import React from "react";
import Link from "next/link";
import { readDatabase } from "../../../../services/db";
import { SEO_CONFIG, getCanonicalUrl } from "../../../../services/seo/config";
import { getPostUrl } from "../../../../lib/utils";
import JsonLd from "../../../../components/seo/JsonLd";
import { getBreadcrumbSchema, getFaqSchema } from "../../../../services/seo/schema";
import { getTrendOverview } from "../../../../services/trends/trendFetcher";
import PerformanceImage from "../../../../components/seo/PerformanceImage";
import SafeAdSlot from "../../../../components/seo/SafeAdSlot";

export const revalidate = 60;

// Generate Programmatic Trend Metadata
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const trend = getTrendOverview(slug);

  return {
    title: `${trend.title} | ${SEO_CONFIG.siteName}`,
    description: trend.description,
    alternates: {
      canonical: getCanonicalUrl(`/trends/${slug}`)
    },
    other: {
      robots: "index, follow, max-image-preview:large"
    }
  };
}

export default async function TrendPage({ params }) {
  const { slug } = await params;
  const trend = getTrendOverview(slug);

  // Load all posts and filter for matches relating to the trend
  const allPosts = await readDatabase();
  const searchWords = slug.split("-");
  
  const matchedPosts = allPosts.filter((post) => {
    const text = `${post.title} ${post.description} ${post.category} ${post.content}`.toLowerCase();
    // Match if any of the trend's words are mentioned
    return searchWords.some(word => word.length > 3 && text.includes(word));
  });

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Trending Topics", url: "/" },
    { name: trend.title, url: `/trends/${slug}` }
  ]);

  const faqSchema = getFaqSchema(trend.faqs);

  return (
    <div className="main-wrapper" style={{ padding: "30px 20px" }}>
      <JsonLd schema={breadcrumbSchema} />
      {faqSchema && <JsonLd schema={faqSchema} />}

      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        
        {/* Ad slots */}
        <SafeAdSlot slotType="leaderboard" />

        {/* Programmatic Overview Hero */}
        <section 
          style={{ 
            backgroundColor: "var(--background-secondary, #f8fafc)",
            padding: "32px",
            borderRadius: "24px",
            border: "1px solid var(--border-subtle)",
            marginBottom: "40px"
          }}
        >
          <span 
            style={{ 
              fontSize: "0.75rem", 
              fontWeight: "800", 
              letterSpacing: "0.1em",
              color: "var(--accent-primary)",
              textTransform: "uppercase",
              display: "block",
              marginBottom: "8px"
            }}
          >
            🔥 Programmatic Trend Tracker
          </span>
          <h1 style={{ fontSize: "2.2rem", fontWeight: "800", color: "var(--text-primary)", marginBottom: "16px", letterSpacing: "-0.02em" }}>
            {trend.title}
          </h1>
          <p style={{ fontSize: "1.08rem", lineHeight: "1.7", color: "var(--text-secondary)", margin: 0 }}>
            {trend.overview}
          </p>
        </section>

        {/* Semantic FAQ details block for Google AI Overviews & ChatGPT crawling */}
        {trend.faqs && trend.faqs.length > 0 && (
          <section style={{ marginBottom: "40px" }}>
            <h2 style={{ fontSize: "1.4rem", fontWeight: "800", marginBottom: "16px" }}>
              Frequently Asked Questions (FAQ)
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {trend.faqs.map((faq, idx) => (
                <details 
                  key={idx} 
                  style={{ 
                    border: "1px solid var(--border-subtle)", 
                    borderRadius: "12px", 
                    padding: "16px",
                    backgroundColor: "var(--background-primary, #ffffff)",
                    cursor: "pointer"
                  }}
                  open={idx === 0}
                >
                  <summary style={{ fontWeight: "700", fontSize: "1rem", outline: "none" }}>
                    {faq.q}
                  </summary>
                  <p style={{ marginTop: "10px", color: "var(--text-secondary)", lineHeight: "1.6", fontSize: "0.95rem", margin: "10px 0 0" }}>
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* Matched articles database grid */}
        <section>
          <h2 style={{ fontSize: "1.4rem", fontWeight: "800", borderBottom: "2px solid #0f172a", display: "inline-block", paddingBottom: "4px", marginBottom: "24px" }}>
            Latest News & Coverage
          </h2>
          
          {matchedPosts.length === 0 ? (
            <p style={{ color: "var(--text-secondary)" }}>
              No current articles in our active database match this trending topic yet. Stay tuned as our autopilot ingests updates.
            </p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" }}>
              {matchedPosts.map((post) => (
                <Link key={post.id} href={getPostUrl(post)} style={{ display: "block", textDecoration: "none", color: "inherit" }}>
                  <article style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <PerformanceImage src={post.image} alt={post.title} aspectRatio="16/9" />
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      {post.category} • {new Date(post.publishedAt).toLocaleDateString()}
                    </span>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: "700", lineHeight: "1.3" }}>{post.title}</h3>
                    <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", display: "-webkit-box", WebkitLineClamp: "3", WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {post.description}
                    </p>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
