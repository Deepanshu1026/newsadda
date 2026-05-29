import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { readDatabase } from "../../../../services/db";
import { SEO_CONFIG, getCanonicalUrl } from "../../../../services/seo/config";
import { getPostUrl } from "../../../../lib/utils";
import JsonLd from "../../../../components/seo/JsonLd";
import { getAuthorSchema, getBreadcrumbSchema } from "../../../../services/seo/schema";
import PerformanceImage from "../../../../components/seo/PerformanceImage";

export const revalidate = 60;

// Format author slug back into a clean readable name
function deSlug(slug) {
  if (!slug) return "";
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Generate Author metadata
export async function generateMetadata({ params }) {
  const { name } = await params;
  const authorName = deSlug(name);

  return {
    title: `${authorName} - Editorial Profile & Articles | ${SEO_CONFIG.siteName}`,
    description: `Read articles, analytical publications, and E-E-A-T verified journalistic reports by senior news writer ${authorName} at NewsAdda.`,
    alternates: {
      canonical: getCanonicalUrl(`/author/${name.toLowerCase()}`)
    }
  };
}

export default async function AuthorProfilePage({ params }) {
  const { name } = await params;
  const authorName = deSlug(name);

  // Fetch articles and filter by author
  const allPosts = await readDatabase();
  const authorPosts = allPosts.filter(
    (post) =>
      post.author &&
      post.author.toLowerCase().replace(/[^a-z0-9]+/g, "-") === name.toLowerCase()
  );

  // If the author has no posts, fall back or check if it's default
  const isDefault = name.toLowerCase() === "newsadda-editorial-board" || name.toLowerCase() === "newsadda-india-desk";
  const verifiedName = authorPosts.length > 0 ? authorPosts[0].author : authorName;

  if (authorPosts.length === 0 && !isDefault) {
    notFound();
  }

  // Construct schemas
  const sameAs = [
    `https://twitter.com/${name}`,
    `https://linkedin.com/in/${name}`
  ];
  const bio = `${verifiedName} is a verified senior journalist and commentator at NewsAdda. Specializing in South Asian affairs, political analysis, and tech policy, ${verifiedName} delivers prompt, accurate, and deeply context-driven reporting for our readers.`;
  
  const authorSchema = getAuthorSchema(verifiedName, bio, sameAs);
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Editorial Board", url: "/about" },
    { name: verifiedName, url: `/author/${name}` }
  ]);

  return (
    <div className="main-wrapper" style={{ padding: "40px 20px" }}>
      <JsonLd schema={authorSchema} />
      <JsonLd schema={breadcrumbSchema} />

      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        
        {/* E-E-A-T Author Card Header */}
        <section 
          style={{ 
            backgroundColor: "var(--background-secondary, #f8fafc)",
            padding: "32px",
            borderRadius: "20px",
            border: "1px solid var(--border-subtle)",
            display: "flex",
            flexWrap: "wrap",
            gap: "24px",
            alignItems: "center",
            marginBottom: "40px"
          }}
        >
          {/* Avatar Placeholder */}
          <div 
            style={{ 
              width: "90px", 
              height: "90px", 
              borderRadius: "50%", 
              backgroundColor: "#0f172a",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2rem",
              fontWeight: "700"
            }}
          >
            {verifiedName.charAt(0)}
          </div>

          <div style={{ flex: 1, minWidth: "260px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "8px" }}>
              <h1 style={{ fontSize: "1.8rem", fontWeight: "800", color: "var(--text-primary)", margin: 0 }}>
                {verifiedName}
              </h1>
              <span 
                style={{ 
                  backgroundColor: "rgba(16, 185, 129, 0.1)", 
                  color: "#10b981", 
                  fontSize: "0.7rem", 
                  fontWeight: "700", 
                  padding: "4px 8px", 
                  borderRadius: "12px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                VERIFIED JOURNALIST
              </span>
            </div>
            
            <p style={{ color: "var(--text-secondary)", lineHeight: "1.6", fontSize: "0.95rem", margin: "0 0 16px" }}>
              {bio}
            </p>

            {/* Social channels sameAs */}
            <div style={{ display: "flex", gap: "12px", fontSize: "0.85rem" }}>
              {sameAs.map((link, idx) => (
                <a 
                  key={idx} 
                  href={link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ color: "var(--accent-primary)", textDecoration: "none", fontWeight: "600" }}
                >
                  {link.includes("twitter") ? "X / Twitter" : "LinkedIn"} ↗
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Author published publications */}
        <section>
          <h2 
            style={{ 
              fontSize: "1.3rem", 
              fontWeight: "700", 
              borderBottom: "2px solid #0f172a", 
              display: "inline-block", 
              paddingBottom: "4px",
              marginBottom: "24px" 
            }}
          >
            Publications by {verifiedName}
          </h2>

          {authorPosts.length === 0 ? (
            <p style={{ color: "var(--text-secondary)" }}>
              No individual articles found. Editorial updates are co-authored by the general desk.
            </p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" }}>
              {authorPosts.map((post) => (
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
