"use client";

import React from "react";
import Link from "next/link";
import { getPostUrl } from "../lib/utils";

export default function BreakingNewsTicker({ posts = [] }) {
  if (!posts || posts.length === 0) return null;

  // Take the 10 most recent posts
  const tickerPosts = posts.slice(0, 10);

  // Duplicate lists to make scrolling loop seamless
  const duplicatedPosts = [...tickerPosts, ...tickerPosts];

  return (
    <div className="breaking-ticker" id="breaking-news-ticker">
      <div className="breaking-label">
        <span className="breaking-dot" aria-hidden="true" />
        BREAKING NEWS
      </div>
      <div className="ticker-flow">
        <div className="ticker-flow-inner">
          {duplicatedPosts.map((post, idx) => (
            <Link
              key={`${post.id}-${idx}`}
              href={getPostUrl(post)}
              className="ticker-item"
            >
              <span className="ticker-bullet">✦</span>
              <span>{post.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
