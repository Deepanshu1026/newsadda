"use client";

import React, { useEffect } from "react";

export default function ViewIncrementer({ id }) {
  useEffect(() => {
    if (!id) return;
    
    // Call the views API asynchronously on mount to update read metrics
    const increment = async () => {
      try {
        await fetch(`/api/posts/${id}`, { method: "POST" });
      } catch (e) {
        console.error("Failed to increment article view count:", e);
      }
    };
    
    // Tiny delay to make sure page load completes first
    const timer = setTimeout(increment, 1000);
    return () => clearTimeout(timer);
  }, [id]);

  return null; // Silent utility component
}
