"use client";

import React from "react";
import Link from "next/link";
import { getPostUrl } from "../lib/utils";

export default function LeftNewsRail({ posts = [] }) {
  if (!posts || posts.length === 0) return null;

  // Let's filter or slice the recent 6 posts for the vertical ticker
  const bulletPosts = posts.slice(0, 6);

  // Duplicate to make scrolling loop seamless
  const duplicatedPosts = [...bulletPosts, ...bulletPosts];

  // A tiny helper to render a relative/short time
  const getShortTime = (dateStr) => {
    try {
      const pubDate = new Date(dateStr);
      // Ensure we don't display negative values if local clocks differ
      const diffMs = Math.max(0, new Date() - pubDate);
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);

      if (diffMins < 60) return `${Math.max(1, diffMins)}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      
      return pubDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Live";
    }
  };

  return (
    <aside className="news-rail left-news-rail" aria-label="Live updates panel">
      <div className="left-rail-title">
        <span className="bulletin-dot" aria-hidden="true" />
        Live Bulletins
      </div>
      <div className="vertical-ticker">
        <div className="vertical-ticker-inner">
          {duplicatedPosts.map((post, idx) => (
            <Link
              key={`${post.id}-${idx}`}
              href={getPostUrl(post)}
              className="vertical-item"
            >
              <span className="vertical-item-time">
                {getShortTime(post.publishedAt)}
              </span>
              <span className="vertical-item-title">
                {post.title}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
