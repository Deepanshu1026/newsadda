"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import PerformanceImage from "./seo/PerformanceImage";
import SafeAdSlot from "./seo/SafeAdSlot";
import { getPostUrl } from "../lib/utils";

// ─── Helper utilities ──────────────────────────────────────────────────────
function getFallbackImage(category) {
  const cat = (category || "").toLowerCase().trim();
  if (cat.includes("cricket") || cat.includes("indian cricket"))
    return "https://images.unsplash.com/photo-1540747737956-37872404a8de?q=80&w=1200&auto=format&fit=crop";
  if (cat.includes("viral") || cat.includes("case"))
    return "https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=1200&auto=format&fit=crop";
  if (cat.includes("fashion"))
    return "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1200&auto=format&fit=crop";
  if (cat.includes("polit") || cat.includes("govt") || cat.includes("elect"))
    return "https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=1200&auto=format&fit=crop";
  if (cat.includes("artificial") || cat.includes("ai") || cat.includes("intelligence"))
    return "https://images.unsplash.com/photo-1677442136019-21780efad99a?q=80&w=1200&auto=format&fit=crop";
  if (cat.includes("web") || cat.includes("develop") || cat.includes("next"))
    return "https://images.unsplash.com/photo-1618401471353-b98aedd07871?q=80&w=1200&auto=format&fit=crop";
  return "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop";
}

function formatDate(dateStr) {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

// ─── Featured Post Card ────────────────────────────────────────────────────
function FeaturedPost({ post }) {
  const fallback = getFallbackImage(post.category);
  return (
    <Link href={getPostUrl(post)} style={{ display: "block" }}>
      <article className="featured-post-card" id="featured-post-card">
        <div className="featured-post-image-wrapper" style={{ borderRadius: "12px", overflow: "hidden", marginBottom: "16px" }}>
          <PerformanceImage
            src={post.image || fallback}
            alt={post.title}
            priority={true}
            aspectRatio="16/9"
          />
        </div>
        <div>
          <span className="featured-category-badge">
            {post.category || "News"}
          </span>
        </div>
        <h2 className="featured-post-title">{post.title}</h2>
        <p className="featured-post-desc">{post.description}</p>
        <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "4px" }}>
          <span style={{ color: "var(--accent-primary)", fontWeight: 600 }}>
            {post.author || "NewsAdda"}
          </span>
          <span style={{ margin: "0 6px" }}>•</span>
          <span>{formatDate(post.publishedAt)}</span>
        </div>
      </article>
    </Link>
  );
}

// ─── Top Story Item ────────────────────────────────────────────────────────
function TopStoryItem({ post, index }) {
  const fallback = getFallbackImage(post.category);
  return (
    <Link href={getPostUrl(post)} style={{ display: "block" }}>
      <article className="top-story-item" id={`top-story-item-${index}`}>
        <div className="top-story-number" aria-label={`Story ${index + 1}`}>
          {index + 1}
        </div>
        <div className="top-story-body">
          <h3 className="top-story-title">{post.title}</h3>
          <div className="top-story-meta">
            <span>{post.author || "NewsAdda"}</span>
            <span style={{ margin: "0 5px", color: "var(--text-muted)" }}>•</span>
            <span style={{ color: "var(--text-muted)" }}>{formatDate(post.publishedAt)}</span>
          </div>
        </div>
        <div className="top-story-thumbnail-wrapper" style={{ width: "80px", flexShrink: 0, overflow: "hidden", borderRadius: "8px" }}>
          <PerformanceImage
            src={post.image || fallback}
            alt={post.title}
            aspectRatio="1/1"
          />
        </div>
      </article>
    </Link>
  );
}

// ─── Grid Post Card ────────────────────────────────────────────────────────
function GridPostCard({ post }) {
  const fallback = getFallbackImage(post.category);
  return (
    <Link href={getPostUrl(post)} style={{ display: "block" }}>
      <article className="grid-post-card" id={`grid-post-card-${post.id}`}>
        <div className="grid-post-image-wrapper" style={{ borderRadius: "12px", overflow: "hidden", marginBottom: "12px" }}>
          <PerformanceImage
            src={post.image || fallback}
            alt={post.title}
            aspectRatio="16/9"
          />
        </div>

        {/* Author • Date */}
        <div className="grid-post-meta">
          <span className="grid-post-meta-author">{post.author || "NewsAdda"}</span>
          <span>•</span>
          <span>{formatDate(post.publishedAt)}</span>
        </div>

        {/* Title + arrow */}
        <div className="grid-post-title-row">
          <h3 className="grid-post-title">{post.title}</h3>
          <span className="grid-post-arrow" aria-hidden="true">↗</span>
        </div>

        {/* Excerpt */}
        <p className="grid-post-desc">{post.description}</p>

        {/* Category pill */}
        {post.category && (
          <div className="grid-post-tags">
            <span className="tag-pill">{post.category}</span>
            {post.readTime && (
              <span className="tag-pill" style={{ background: "#fff", border: "1px solid var(--border-subtle)", color: "var(--text-muted)" }}>
                {post.readTime}
              </span>
            )}
          </div>
        )}
      </article>
    </Link>
  );
}

// ─── Main Feed ─────────────────────────────────────────────────────────────
export default function HomeFeed({ initialPosts = [] }) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Pick up search from navbar URL params
  useEffect(() => {
    const readSearch = () => {
      const params = new URLSearchParams(window.location.search);
      setSearchQuery(params.get("search") || "");
    };
    readSearch();
    window.addEventListener("popstate", readSearch);
    // Poll lightly for URL changes triggered by the Navbar router.replace
    const interval = setInterval(readSearch, 300);
    return () => {
      window.removeEventListener("popstate", readSearch);
      clearInterval(interval);
    };
  }, []);

  // Unique categories
  const categories = [
    "All",
    ...Array.from(new Set(initialPosts.map((p) => p.category).filter(Boolean))),
  ];

  // Filter
  const filteredPosts = initialPosts.filter((post) => {
    const matchesCat =
      selectedCategory === "All" ||
      (post.category &&
        post.category.toLowerCase().trim() === selectedCategory.toLowerCase().trim());

    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      post.title?.toLowerCase().includes(q) ||
      post.description?.toLowerCase().includes(q) ||
      post.content?.toLowerCase().includes(q);

    return matchesCat && matchesSearch;
  });

  // Slice
  const featuredPost = filteredPosts[0] || null;
  const topStories = filteredPosts.slice(1, 4);
  const gridPosts = filteredPosts.slice(4);

  return (
    <div className="main-wrapper">
      <div className="content-panel">


        {/* ── Category Filter Row ─────────────────────────────── */}
        <section className="category-filter-row" aria-label="Filter articles by category" style={{ marginBottom: "16px" }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`category-pill-btn ${selectedCategory === cat ? "active" : ""}`}
            >
              {cat}
            </button>
          ))}
        </section>

        {/* ── Above-the-fold Premium Ad Slot ─────────────────── */}
        <SafeAdSlot slotType="leaderboard" />

        {/* ── Empty state ────────────────────────────────────── */}
        {!featuredPost && (
          <div className="empty-state" id="empty-state-notice">
            <svg
              width="44"
              height="44"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              style={{ margin: "0 auto 12px", display: "block", opacity: 0.4 }}
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
            No articles found
            {searchQuery ? ` for "${searchQuery}"` : ""}
            {selectedCategory !== "All" ? ` in "${selectedCategory}"` : ""}.
          </div>
        )}

        {/* ── Split: Featured + Top Stories ─────────────────── */}
        {featuredPost && (
          <section className="split-layout" id="split-layout-section">
            {/* Left: Featured */}
            <div>
              <FeaturedPost post={featuredPost} />
            </div>

            {/* Right: Top Stories */}
            <aside id="top-stories-panel">
              <h2 className="top-stories-heading">Top Stories</h2>
              <div>
                {topStories.map((post, i) => (
                  <TopStoryItem key={post.id} post={post} index={i} />
                ))}
                {topStories.length === 0 && (
                  <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
                    No additional stories.
                  </p>
                )}
              </div>
              {process.env.NODE_ENV === "production" && (
                <div className="top-stories-ad-card">
                  <div className="top-stories-ad-label">Sponsored Advertisement</div>
                  <SafeAdSlot slotType="rectangle" className="top-stories-ad-slot" />
                </div>
              )}
            </aside>
          </section>
        )}

        {/* ── Meet Our Editorial Team ────────────────────────── */}
        <section 
          style={{
            backgroundColor: "var(--bg-surface, rgba(255, 255, 255, 0.88))",
            border: "1px solid var(--border-subtle)",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "var(--card-shadow)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            marginTop: "16px",
            marginBottom: "16px"
          }}
          aria-label="Editorial board and journalists"
        >
          <style dangerouslySetInnerHTML={{__html: `
            .editorial-author-card:hover {
              transform: translateY(-2px);
              box-shadow: 0 8px 16px -4px rgba(15,23,42,0.08);
              border-color: var(--accent-primary) !important;
            }
          `}} />

          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <span style={{ width: "4px", height: "18px", backgroundColor: "var(--accent-primary)", borderRadius: "2px", display: "inline-block" }} />
            <h2 style={{ fontSize: "1.15rem", fontWeight: "800", margin: 0, fontFamily: "var(--font-display)" }}>
              Meet Our Editorial Team
            </h2>
          </div>
          
          <div 
            style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", 
              gap: "16px" 
            }}
          >
            {[
              { name: "Deepanshu Bisht", role: "Founder & Tech Editor", slug: "deepanshu-bisht", color: "#4f46e5" },
              { name: "Anselm Noronha", role: "Senior Sports Editor", slug: "anselm-noronha", color: "#0284c7" },
              { name: "Ritabrata Banerjee", role: "Football Correspondent", slug: "ritabrata-banerjee", color: "#b91c1c" },
              { name: "NewsAdda Editorial Board", role: "Editorial Board", slug: "newsadda-editorial-board", color: "#0f172a" }
            ].map((author) => (
              <Link key={author.slug} href={`/author/${author.slug}`} style={{ textDecoration: "none" }}>
                <div 
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "16px",
                    borderRadius: "12px",
                    backgroundColor: "var(--bg-card, #ffffff)",
                    border: "1px solid var(--border-subtle)",
                    transition: "transform 0.18s ease, box-shadow 0.18s ease",
                    cursor: "pointer"
                  }}
                  className="editorial-author-card"
                >
                  <div 
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "50%",
                      backgroundColor: author.color,
                      color: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "800",
                      fontSize: "1rem"
                    }}
                  >
                    {author.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize: "0.85rem", fontWeight: "800", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "4px" }}>
                      {author.name}
                      <span style={{ color: "var(--accent-success, #16a34a)", display: "inline-flex" }} title="Verified Journalist">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: "500", marginTop: "2px" }}>{author.role}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Mid-feed Ad Slot to Monetise Scrolling Readers ─── */}
        {gridPosts.length > 0 && <SafeAdSlot slotType="leaderboard" />}

        {/* ── Grid Cards ─────────────────────────────────────── */}
        {gridPosts.length > 0 && (
          <section id="grid-posts-section" aria-label="All stories">
            <div className="grid-section-divider" />
            <div className="grid-cards-container">
              {gridPosts.flatMap((post, index) => {
                const elements = [<GridPostCard key={post.id} post={post} />];
                const totalRenderedPosts = 4 + index + 1;
                
                // Inject an in-feed banner after every 10 total blog cards in the full feed.
                if (totalRenderedPosts % 10 === 0) {
                  elements.push(
                    <div key={`in-feed-ad-${index}`} style={{ gridColumn: "1 / -1", width: "100%", margin: "16px 0" }}>
                      <SafeAdSlot slotType="leaderboard" />
                    </div>
                  );
                }
                
                return elements;
              })}
            </div>
          </section>
        )}

        {/* ── About NewsAdda (E-E-A-T Identity & Transparency) ──── */}
        <section 
          style={{
            backgroundColor: "var(--bg-surface, rgba(255, 255, 255, 0.88))",
            border: "1px solid var(--border-subtle)",
            borderRadius: "20px",
            padding: "32px",
            boxShadow: "var(--card-shadow)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            marginTop: "32px",
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "24px"
          }}
          className="about-newsadda-section"
        >
          <style dangerouslySetInnerHTML={{__html: `
            @media (min-width: 768px) {
              .about-newsadda-section {
                grid-template-columns: 2fr 1fr !important;
              }
            }
          `}} />

          <div>
            <h2 style={{ fontSize: "1.3rem", fontWeight: "800", color: "var(--text-primary)", margin: "0 0 12px 0", fontFamily: "var(--font-display)" }}>
              About NewsAdda
            </h2>
            <p style={{ fontSize: "0.92rem", lineHeight: "1.65", color: "var(--text-secondary)", margin: 0 }}>
              NewsAdda is an independent digital news platform delivering high-integrity coverage across Politics, Technology, Cricket, Geopolitics, and Opinion. Founded in 2026 by lead developer and technology editor <strong>Deepanshu Bisht</strong>, our platform is committed to providing factual, verified information (E-E-A-T). All articles, analytical briefs, and tutorials undergo rigorous validation by our accredited Editorial Board.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", justifyContent: "center", borderLeft: "1px solid var(--border-subtle)", paddingLeft: "24px" }}>
            <h4 style={{ fontSize: "0.8rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", margin: 0 }}>
              Editorial Integrity
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.82rem" }}>
              <Link href="/about" style={{ color: "var(--accent-primary)", fontWeight: "600", textDecoration: "none" }}>
                Our Editorial Board & Policies ↗
              </Link>
              <Link href="/editorial-policy" style={{ color: "var(--accent-primary)", fontWeight: "600", textDecoration: "none" }}>
                Ethics & Corrections Policy ↗
              </Link>
              <Link href="/contact" style={{ color: "var(--accent-primary)", fontWeight: "600", textDecoration: "none" }}>
                Contact the Newsroom Desk ↗
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
