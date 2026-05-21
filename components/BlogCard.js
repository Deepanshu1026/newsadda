"use client";

import React from "react";
import Link from "next/link";

// ─── Helpers ───────────────────────────────────────────────────────────────
function getInitials(name) {
  if (!name) return "AI";
  const parts = name.split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function formatDate(dateStr) {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

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

// ─── BlogCard ──────────────────────────────────────────────────────────────
// Used in the Admin Dashboard / Tech Dashboard grids (not the home feed).
// Keeps the existing .blog-card styles defined in globals.css.
export default function BlogCard({ post }) {
  const fallback = getFallbackImage(post.category);

  return (
    <Link href={`/posts/${post.id}`} style={{ display: "block" }}>
      <div className="blog-card">
        {/* Cover image */}
        <div className="blog-card-image-wrapper">
          <img
            src={post.image || fallback}
            alt={post.title}
            className="blog-card-image"
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = fallback;
            }}
          />
        </div>

        {/* Body */}
        <div className="blog-card-body">
          {/* Category badge + date */}
          <div className="blog-card-meta">
            <span className="blog-card-category">{post.category || "News"}</span>
            <span>{formatDate(post.publishedAt)}</span>
          </div>

          {/* Title row with arrow icon */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
            <h3 className="blog-card-title" style={{ flex: 1 }}>{post.title}</h3>
            <span
              style={{
                flexShrink: 0,
                color: "var(--text-muted)",
                fontSize: "1rem",
                marginTop: "2px",
                transition: "color 0.18s ease",
              }}
              aria-hidden="true"
            >
              ↗
            </span>
          </div>

          {/* Excerpt */}
          <p className="blog-card-desc">{post.description}</p>

          {/* Footer: author + views/read time */}
          <div className="blog-card-footer">
            <div className="blog-card-author">
              <div className="author-avatar">{getInitials(post.author)}</div>
              <span>{post.author || "NewsAdda"}</span>
            </div>
            <div className="blog-card-views">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span>{post.views || 0}</span>
              <span style={{ margin: "0 3px" }}>•</span>
              <span>{post.readTime || "3 min read"}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
