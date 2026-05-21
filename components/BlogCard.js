"use client";

import React from "react";
import Link from "next/link";

export default function BlogCard({ post }) {
  // Helper to extract initials for author avatar
  const getInitials = (name) => {
    if (!name) return "AI";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Helper to format date
  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (e) {
      return dateStr;
    }
  };

  // Helper to resolve category-specific high-quality Unsplash fallbacks
  const getFallbackImage = (cat) => {
    const category = (cat || "").toLowerCase().trim();
    if (category.includes("cricket")) {
      return "https://images.unsplash.com/photo-1540747737956-37872404a8de?q=80&w=1200&auto=format&fit=crop";
    }
    if (category.includes("viral") || category.includes("case")) {
      return "https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=1200&auto=format&fit=crop";
    }
    if (category.includes("fashion")) {
      return "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1200&auto=format&fit=crop";
    }
    if (category.includes("polit") || category.includes("govt") || category.includes("elect")) {
      return "https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=1200&auto=format&fit=crop";
    }
    if (category.includes("artificial") || category.includes("ai") || category.includes("intelligence")) {
      return "https://images.unsplash.com/photo-1677442136019-21780efad99a?q=80&w=1200&auto=format&fit=crop";
    }
    if (category.includes("web") || category.includes("develop") || category.includes("next")) {
      return "https://images.unsplash.com/photo-1618401471353-b98aedd07871?q=80&w=1200&auto=format&fit=crop";
    }
    return "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop";
  };

  const fallbackSrc = getFallbackImage(post.category);

  return (
    <Link href={`/posts/${post.id}`} style={{ display: "block" }}>
      <div className="blog-card">
        <div className="blog-card-image-wrapper">
          <img
            src={post.image || fallbackSrc}
            alt={post.title}
            className="blog-card-image"
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = fallbackSrc;
            }}
          />
        </div>
        <div className="blog-card-body">
          <div className="blog-card-meta">
            <span className="blog-card-category">{post.category || "Technology"}</span>
            <span>{formatDate(post.publishedAt)}</span>
          </div>
          <h3 className="blog-card-title">{post.title}</h3>
          <p className="blog-card-desc">{post.description}</p>
          <div className="blog-card-footer">
            <div className="blog-card-author">
              <div className="author-avatar">{getInitials(post.author)}</div>
              <span>{post.author || "NewsAdda Writer"}</span>
            </div>
            <div className="blog-card-views">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span>{post.views || 0}</span>
              <span style={{ margin: "0 4px" }}>•</span>
              <span>{post.readTime || "3 min read"}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
