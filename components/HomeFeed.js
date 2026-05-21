"use client";

import React, { useState } from "react";
import BlogCard from "./BlogCard";

export default function HomeFeed({ initialPosts = [] }) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Safely extract unique categories from actual articles in the database
  const categories = [
    "All",
    ...Array.from(
      new Set(initialPosts.map((post) => post.category).filter(Boolean))
    ),
  ];

  // Filter posts based on active category selection and search query
  const filteredPosts = initialPosts.filter((post) => {
    const matchesCategory =
      selectedCategory === "All" ||
      (post.category &&
        post.category.toLowerCase().trim() ===
          selectedCategory.toLowerCase().trim());

    const matchesSearch =
      searchQuery.trim() === "" ||
      post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="content-panel">
      {/* Premium Hero Title and Modern Search Controls */}
      <div className="feed-header-section" style={{
        background: "rgba(255, 255, 255, 0.7)",
        padding: "32px",
        borderRadius: "20px",
        border: "1px solid var(--border-subtle)",
        backdropFilter: "blur(10px)",
        boxShadow: "var(--glass-shadow)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
          <div>
            <h1 style={{ fontSize: "2.2rem", fontWeight: "800", letterSpacing: "-0.5px" }}>
              Explore the <span className="logo-accent">Latest Updates</span>
            </h1>
            <p style={{ color: "var(--text-secondary)", marginTop: "4px", fontSize: "0.98rem" }}>
              Curated, SEO-enhanced, and real-time coverage from leading worldwide publishers.
            </p>
          </div>

          {/* Sleek Search Bar */}
          <div style={{ position: "relative", width: "100%", maxWidth: "320px" }}>
            <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search news and blogs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px 12px 42px",
                borderRadius: "12px",
                border: "1px solid var(--border-subtle)",
                outline: "none",
                fontSize: "0.92rem",
                color: "var(--text-primary)",
                background: "var(--bg-card)",
                transition: "all 0.2s ease"
              }}
              className="search-input-field"
            />
          </div>
        </div>

        {/* Dynamic Category Navigation Menu */}
        <div style={{
          display: "flex",
          gap: "8px",
          marginTop: "28px",
          overflowX: "auto",
          paddingBottom: "8px",
          scrollbarWidth: "none"
        }} className="category-scroll-bar">
          {categories.map((cat) => {
            const isActive = selectedCategory.toLowerCase().trim() === cat.toLowerCase().trim();
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: "8px 18px",
                  borderRadius: "30px",
                  border: "1px solid",
                  borderColor: isActive ? "var(--accent-primary)" : "var(--border-subtle)",
                  background: isActive ? "var(--accent-primary)" : "var(--bg-card)",
                  color: isActive ? "#ffffff" : "var(--text-secondary)",
                  fontSize: "0.88rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                  boxShadow: isActive ? "0 4px 12px rgba(79, 70, 229, 0.2)" : "none"
                }}
                className={`category-btn-pill ${isActive ? "active" : ""}`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid Feed Container */}
      {filteredPosts.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "60px 20px",
          background: "var(--bg-card)",
          borderRadius: "16px",
          border: "1px solid var(--border-subtle)",
          color: "var(--text-muted)",
          fontSize: "1rem"
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: "0 auto 12px", display: "block" }}>
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
          No articles found for "{selectedCategory}" matching your search.
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "28px"
        }} className="news-cards-grid">
          {filteredPosts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
