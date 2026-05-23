"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import PerformanceImage from "./seo/PerformanceImage";

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
    <Link href={`/posts/${post.id}`} style={{ display: "block" }}>
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
    <Link href={`/posts/${post.id}`} style={{ display: "block" }}>
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
    <Link href={`/posts/${post.id}`} style={{ display: "block" }}>
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

        {/* ── Hero / Blog Header ─────────────────────────────── */}
        <section className="feed-hero" id="blog-hero-section" aria-label="Blog header">
          <span className="feed-hero-eyebrow">Our Blog</span>
          <h1 className="feed-hero-title">Stories &amp; Ideas</h1>
          <p className="feed-hero-desc">
            Curated, trusted and fast news coverage from the world's leading publishers — real-time and
            SEO-optimised.
          </p>
        </section>



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
            </aside>
          </section>
        )}

        {/* ── Grid Cards ─────────────────────────────────────── */}
        {gridPosts.length > 0 && (
          <section id="grid-posts-section" aria-label="All stories">
            <div className="grid-section-divider" />
            <div className="grid-cards-container">
              {gridPosts.map((post) => (
                <GridPostCard key={post.id} post={post} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
