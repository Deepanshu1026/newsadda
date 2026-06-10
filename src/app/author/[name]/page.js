import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { readDatabase } from "../../../../services/db";
import { SEO_CONFIG, getCanonicalUrl } from "../../../../services/seo/config";
import { getPostUrl } from "../../../../lib/utils";
import JsonLd from "../../../../components/seo/JsonLd";
import { getAuthorSchema, getBreadcrumbSchema } from "../../../../services/seo/schema";
import PerformanceImage from "../../../../components/seo/PerformanceImage";
import { getAuthorProfile } from "../../../../services/authorService";

export const revalidate = 60;

// Generate Author metadata
export async function generateMetadata({ params }) {
  const { name } = await params;
  const allPosts = await readDatabase();
  const profile = getAuthorProfile(name, allPosts);

  return {
    title: `${profile.name} - ${profile.title} | ${SEO_CONFIG.siteName}`,
    description: profile.shortBio || `Read E-E-A-T verified articles, commentaries, and news coverage by senior writer ${profile.name} at NewsAdda.`,
    alternates: {
      canonical: getCanonicalUrl(`/author/${profile.slug}`)
    }
  };
}

export default async function AuthorProfilePage({ params }) {
  const { name } = await params;
  const allPosts = await readDatabase();
  const profile = getAuthorProfile(name, allPosts);

  // Filter posts using normalized matching logic
  const authorPosts = allPosts.filter(
    (post) =>
      post.author &&
      getAuthorProfile(post.author).slug === profile.slug
  );

  // Let known authors pass through even with 0 posts
  const knownSlugs = ["anselm-noronha", "ritabrata-banerjee", "deepanshu-bisht", "newsadda-editorial-board", "newsdata-editorial-board", "pti", "ani", "associated-press", "khabarhub", "rediff-sports-desk"];
  const isKnown = knownSlugs.includes(profile.slug);

  if (authorPosts.length === 0 && !isKnown) {
    notFound();
  }

  // Calculate statistics
  const totalViews = authorPosts.reduce((sum, p) => sum + (p.views || 0), 0);
  
  // Find primary category
  const categoriesCount = {};
  authorPosts.forEach(p => {
    if (p.category) {
      categoriesCount[p.category] = (categoriesCount[p.category] || 0) + 1;
    }
  });
  
  let primaryCategory = "General News";
  let maxCount = 0;
  Object.keys(categoriesCount).forEach(cat => {
    if (categoriesCount[cat] > maxCount) {
      maxCount = categoriesCount[cat];
      primaryCategory = cat;
    }
  });

  const socialsList = profile.socials ? Object.values(profile.socials).filter(Boolean) : [];
  const authorSchema = getAuthorSchema(profile.name, profile.extendedBio, socialsList);
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Editorial Board", url: "/about" },
    { name: profile.name, url: `/author/${profile.slug}` }
  ]);

  return (
    <div className="main-wrapper" style={{ padding: "40px 20px" }}>
      <JsonLd schema={authorSchema} />
      <JsonLd schema={breadcrumbSchema} />

      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* Breadcrumb path */}
        <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "24px" }}>
          <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>Home</Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <span style={{ color: "var(--text-secondary)" }}>Editorial Profiles</span>
          <span style={{ margin: "0 8px" }}>/</span>
          <span style={{ fontWeight: "600", color: "var(--accent-primary)" }}>{profile.name}</span>
        </div>

        {/* Two-column layout */}
        <div 
          style={{ 
            display: "grid", 
            gridTemplateColumns: "1fr", 
            gap: "40px",
            alignItems: "start"
          }}
          className="author-profile-grid"
        >
          {/* Inject style for responsiveness */}
          <style dangerouslySetInnerHTML={{__html: `
            @media (min-width: 900px) {
              .author-profile-grid {
                grid-template-columns: 340px 1fr !important;
              }
            }
          `}} />

          {/* Left Column: Author Metadata & Info Cards */}
          <aside style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            {/* Identity Card */}
            <div 
              style={{
                backgroundColor: "var(--bg-surface, rgba(255, 255, 255, 0.88))",
                border: "1px solid var(--border-subtle)",
                borderRadius: "20px",
                padding: "32px 24px",
                textAlign: "center",
                boxShadow: "var(--card-shadow)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)"
              }}
            >
              {/* Large Avatar */}
              <div 
                style={{
                  width: "110px",
                  height: "110px",
                  borderRadius: "50%",
                  backgroundColor: profile.avatarColor || "var(--accent-primary)",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "2.5rem",
                  fontWeight: "800",
                  fontFamily: "var(--font-display)",
                  margin: "0 auto 20px",
                  boxShadow: "0 10px 20px -5px rgba(0,0,0,0.15)"
                }}
              >
                {profile.name.charAt(0)}
              </div>

              {/* Verified Badge */}
              {profile.verified && (
                <div style={{ marginBottom: "12px" }}>
                  <span 
                    style={{ 
                      backgroundColor: "rgba(22, 163, 74, 0.08)", 
                      color: "var(--accent-success, #16a34a)", 
                      fontSize: "0.7rem", 
                      fontWeight: "800", 
                      padding: "4px 12px", 
                      borderRadius: "20px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      border: "1px solid rgba(22, 163, 74, 0.15)",
                      letterSpacing: "0.03em"
                    }}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    VERIFIED JOURNALIST
                  </span>
                </div>
              )}

              {/* Name and Title */}
              <h1 style={{ fontSize: "1.6rem", fontWeight: "800", color: "var(--text-primary)", margin: "0 0 6px 0", fontFamily: "var(--font-display)", lineHeight: "1.2" }}>
                {profile.name}
              </h1>
              <p style={{ fontSize: "0.9rem", fontWeight: "600", color: "var(--text-muted)", margin: "0 0 24px 0", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {profile.title}
              </p>

              {/* Social links */}
              <div style={{ display: "flex", justifyContent: "center", gap: "12px", borderTop: "1px solid var(--border-subtle)", paddingTop: "20px" }}>
                {profile.socials?.twitter && (
                  <a 
                    href={profile.socials.twitter} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={{ 
                      flex: 1,
                      padding: "8px 12px",
                      borderRadius: "10px",
                      backgroundColor: "var(--bg-pill, #f4f4f5)",
                      color: "var(--text-secondary)",
                      fontSize: "0.82rem",
                      fontWeight: "700",
                      textDecoration: "none",
                      border: "1px solid var(--border-subtle)",
                      transition: "all 0.2s ease"
                    }}
                    className="author-btn"
                  >
                    X / Twitter
                  </a>
                )}
                {profile.socials?.linkedin && (
                  <a 
                    href={profile.socials.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={{ 
                      flex: 1,
                      padding: "8px 12px",
                      borderRadius: "10px",
                      backgroundColor: "var(--bg-pill, #f4f4f5)",
                      color: "var(--text-secondary)",
                      fontSize: "0.82rem",
                      fontWeight: "700",
                      textDecoration: "none",
                      border: "1px solid var(--border-subtle)",
                      transition: "all 0.2s ease"
                    }}
                    className="author-btn"
                  >
                    LinkedIn
                  </a>
                )}
              </div>
            </div>

            {/* Quick Stats Card */}
            <div 
              style={{
                backgroundColor: "var(--bg-surface, rgba(255, 255, 255, 0.88))",
                border: "1px solid var(--border-subtle)",
                borderRadius: "20px",
                padding: "24px",
                boxShadow: "var(--card-shadow)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)"
              }}
            >
              <h3 style={{ fontSize: "1rem", fontWeight: "800", color: "var(--text-primary)", margin: "0 0 16px 0", fontFamily: "var(--font-display)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Performance & Coverage
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dashed var(--border-subtle)", paddingBottom: "12px" }}>
                  <span style={{ fontSize: "0.88rem", color: "var(--text-secondary)" }}>Publications</span>
                  <span style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>{authorPosts.length}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dashed var(--border-subtle)", paddingBottom: "12px" }}>
                  <span style={{ fontSize: "0.88rem", color: "var(--text-secondary)" }}>Cumulative Views</span>
                  <span style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>{totalViews.toLocaleString()}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.88rem", color: "var(--text-secondary)" }}>Primary Domain</span>
                  <span style={{ fontSize: "0.9rem", fontWeight: "700", color: "var(--accent-primary)", backgroundColor: "var(--accent-primary-glow)", padding: "2px 8px", borderRadius: "6px" }}>{primaryCategory}</span>
                </div>
              </div>
            </div>

            {/* Credentials & Affiliations */}
            {profile.credentials && profile.credentials.length > 0 && (
              <div 
                style={{
                  backgroundColor: "var(--bg-surface, rgba(255, 255, 255, 0.88))",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "20px",
                  padding: "24px",
                  boxShadow: "var(--card-shadow)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)"
                }}
              >
                <h3 style={{ fontSize: "1rem", fontWeight: "800", color: "var(--text-primary)", margin: "0 0 16px 0", fontFamily: "var(--font-display)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Journalistic Credentials
                </h3>
                <ul style={{ paddingLeft: "16px", margin: 0, fontSize: "0.88rem", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "10px" }}>
                  {profile.credentials.map((cred, idx) => (
                    <li key={idx} style={{ lineHeight: "1.4" }}>{cred}</li>
                  ))}
                </ul>
              </div>
            )}
          </aside>

          {/* Right Column: Bio Narrative and Publications Grid */}
          <main style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
            
            {/* Bio Narrative */}
            <section 
              style={{
                backgroundColor: "var(--bg-surface, rgba(255, 255, 255, 0.88))",
                border: "1px solid var(--border-subtle)",
                borderRadius: "20px",
                padding: "32px",
                boxShadow: "var(--card-shadow)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)"
              }}
            >
              <h2 style={{ fontSize: "1.4rem", fontWeight: "800", color: "var(--text-primary)", margin: "0 0 16px 0", fontFamily: "var(--font-display)", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "4px", height: "20px", backgroundColor: "var(--accent-primary)", borderRadius: "2px", display: "inline-block" }} />
                About the Journalist
              </h2>
              <p style={{ fontSize: "1.05rem", lineHeight: "1.7", color: "var(--text-secondary)", margin: "0 0 24px 0" }}>
                {profile.extendedBio}
              </p>

              {/* Areas of Expertise Header */}
              <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "24px" }}>
                <h4 style={{ fontSize: "0.9rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 12px 0" }}>
                  Core Areas of Expertise
                </h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {profile.expertise && profile.expertise.map((exp, idx) => (
                    <span 
                      key={idx} 
                      style={{ 
                        fontSize: "0.82rem", 
                        fontWeight: "600", 
                        backgroundColor: "var(--bg-pill, #f4f4f5)", 
                        color: "var(--text-primary)", 
                        padding: "6px 14px", 
                        borderRadius: "8px",
                        border: "1px solid var(--border-subtle)"
                      }}
                    >
                      {exp}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            {/* Author's Articles feed */}
            <section>
              <h2 
                style={{ 
                  fontSize: "1.5rem", 
                  fontWeight: "800", 
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-display)",
                  marginBottom: "24px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px" 
                }}
              >
                <span style={{ width: "4px", height: "20px", backgroundColor: "var(--accent-primary)", borderRadius: "2px", display: "inline-block" }} />
                Journalistic Publications
              </h2>

              {authorPosts.length === 0 ? (
                <div 
                  style={{ 
                    padding: "40px", 
                    textAlign: "center", 
                    backgroundColor: "var(--bg-surface, rgba(255, 255, 255, 0.88))", 
                    borderRadius: "20px", 
                    border: "1px dashed var(--border-subtle)",
                    color: "var(--text-secondary)" 
                  }}
                >
                  <p style={{ margin: "0 0 8px 0", fontWeight: "600" }}>No individual articles found in this feed.</p>
                  <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", margin: 0 }}>
                    This wire agency or board directs live bulletins to our central feed. Select briefings are compiled by the editorial desk.
                  </p>
                </div>
              ) : (
                <div 
                  style={{ 
                    display: "grid", 
                    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", 
                    gap: "24px" 
                  }}
                >
                  {authorPosts.map((post) => (
                    <Link key={post.id} href={getPostUrl(post)} style={{ display: "block", textDecoration: "none", color: "inherit" }}>
                      <article 
                        style={{ 
                          display: "flex", 
                          flexDirection: "column", 
                          gap: "12px",
                          backgroundColor: "var(--bg-surface, rgba(255, 255, 255, 0.88))",
                          border: "1px solid var(--border-subtle)",
                          borderRadius: "16px",
                          padding: "16px",
                          height: "100%",
                          boxShadow: "var(--card-shadow)",
                          transition: "transform 0.2s ease, box-shadow 0.2s ease"
                        }}
                        className="author-article-card"
                      >
                        <PerformanceImage src={post.image} alt={post.title} aspectRatio="16/9" />
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          <span>{post.category}</span>
                          <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                        </div>
                        <h3 style={{ fontSize: "1.1rem", fontWeight: "700", lineHeight: "1.3", color: "var(--text-primary)", margin: 0, display: "-webkit-box", WebkitLineClamp: "2", WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {post.title}
                        </h3>
                        <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", margin: 0, display: "-webkit-box", WebkitLineClamp: "3", WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: "1.5" }}>
                          {post.description}
                        </p>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: "8px", fontSize: "0.78rem", borderTop: "1px solid var(--border-subtle)", color: "var(--text-muted)" }}>
                          <span>{post.readTime}</span>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                            {post.views || 0} views
                          </span>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              )}
            </section>

          </main>
        </div>

      </div>
    </div>
  );
}
