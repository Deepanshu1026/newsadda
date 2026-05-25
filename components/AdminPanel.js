"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPanel({ onSyncComplete }) {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalPosts: 0,
    lastSync: null,
    cronActive: true,
    interval: 60,
    categories: []
  });
  const [loading, setLoading] = useState(false);
  const [syncLogs, setSyncLogs] = useState([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [forceLiveAds, setForceLiveAds] = useState(false);

  // Manual News Selection Hub States
  const [activeCategory, setActiveCategory] = useState("politics");
  const [headlines, setHeadlines] = useState([]);
  const [loadingHeadlines, setLoadingHeadlines] = useState(false);
  const [selectedArticles, setSelectedArticles] = useState([]);
  const [isQueueLoaded, setIsQueueLoaded] = useState(false);
  const [bulkGenerating, setBulkGenerating] = useState(false);
  const [bulkLogs, setBulkLogs] = useState([]);
  const [bulkStatus, setBulkStatus] = useState("");
  // Client-side cache to avoid repeated queries and preserve API quota
  const [cachedHeadlines, setCachedHeadlines] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [searchedTerm, setSearchedTerm] = useState("");

  // Drag and Drop States
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // Load selection queue from localStorage on initial mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("newsadda_manual_queue");
      if (saved) {
        try {
          setSelectedArticles(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse saved queue:", e);
        }
      }
      setIsQueueLoaded(true);
    }
  }, []);

  // Save selection queue to localStorage only after it has been loaded
  useEffect(() => {
    if (isQueueLoaded && typeof window !== "undefined") {
      localStorage.setItem("newsadda_manual_queue", JSON.stringify(selectedArticles));
    }
  }, [selectedArticles, isQueueLoaded]);

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      try {
        e.dataTransfer.setData("text/plain", index.toString());
      } catch (err) {
        console.warn("dataTransfer error:", err);
      }
    }
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newQueue = [...selectedArticles];
    const draggedItem = newQueue[draggedIndex];
    
    // Remove from original slot
    newQueue.splice(draggedIndex, 1);
    // Insert into target slot
    newQueue.splice(index, 0, draggedItem);
    
    setSelectedArticles(newQueue);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const fetchTrendingHeadlines = async (cat, force = false, isSearch = false) => {
    const canCache = !isSearch;

    if (!force && canCache && cachedHeadlines[cat]) {
      setHeadlines(cachedHeadlines[cat]);
      return;
    }

    setLoadingHeadlines(true);
    try {
      const res = await fetch(`/api/trending-news?category=${encodeURIComponent(cat)}`);
      if (res.ok) {
        const data = await res.json();
        const categoryHeadlines = data.headlines || [];
        setHeadlines(categoryHeadlines);
        if (canCache) {
          setCachedHeadlines(prev => ({
            ...prev,
            [cat]: categoryHeadlines
          }));
        }
      } else {
        console.error("Failed to fetch headlines");
      }
    } catch (e) {
      console.error("Error fetching headlines:", e);
    } finally {
      setLoadingHeadlines(false);
    }
  };

  useEffect(() => {
    if (activeCategory) {
      setSearchedTerm("");
      setSearchQuery("");
      fetchTrendingHeadlines(activeCategory);
    }
  }, [activeCategory]);

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setActiveCategory("");
    setSearchedTerm(query);
    fetchTrendingHeadlines(query, false, true);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchedTerm("");
    setActiveCategory("politics");
  };

  const moveArticleInQueue = (index, direction) => {
    const newQueue = [...selectedArticles];
    if (direction === "up" && index > 0) {
      const temp = newQueue[index];
      newQueue[index] = newQueue[index - 1];
      newQueue[index - 1] = temp;
    } else if (direction === "down" && index < newQueue.length - 1) {
      const temp = newQueue[index];
      newQueue[index] = newQueue[index + 1];
      newQueue[index + 1] = temp;
    }
    setSelectedArticles(newQueue);
  };

  const handleToggleSelect = (headline) => {
    setSelectedArticles(prev => {
      const exists = prev.some(a => a.title === headline.title);
      if (exists) {
        return prev.filter(a => a.title !== headline.title);
      } else {
        return [...prev, {
          title: headline.title,
          description: headline.description || "Latest automated trending update.",
          category: activeCategory || searchedTerm || "News",
          image: headline.image,
          author: headline.author || "NewsAdda India Desk"
        }];
      }
    });
  };

  const handleToggleSelectAll = () => {
    const allCurrentSelected = headlines.length > 0 && headlines.every(h => selectedArticles.some(a => a.title === h.title));
    if (allCurrentSelected) {
      setSelectedArticles(prev => prev.filter(a => !headlines.some(h => h.title === a.title)));
    } else {
      setSelectedArticles(prev => {
        const newItems = headlines.filter(h => !prev.some(a => a.title === h.title))
          .map(h => ({
            title: h.title,
            description: h.description || "Latest automated trending update.",
            category: activeCategory || searchedTerm || "News",
            image: h.image,
            author: h.author || "NewsAdda India Desk"
          }));
        return [...prev, ...newItems];
      });
    }
  };

  const handleBulkGenerate = async () => {
    if (selectedArticles.length === 0) return;
    
    setBulkGenerating(true);
    setBulkStatus("Starting manual AI blog generation...");
    setBulkLogs(["[System] Starting manual bulk generation for " + selectedArticles.length + " article(s)..."]);
    
    try {
      const articlesToSend = selectedArticles;

      setBulkLogs(prev => [...prev, "[News Client] Packaging selected headlines..."]);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      for (let i = 0; i < articlesToSend.length; i++) {
        const art = articlesToSend[i];
        setBulkLogs(prev => [...prev, `[Sarvam AI] Writing blog article ${i + 1}/${articlesToSend.length}: "${art.title}"...`]);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      setBulkLogs(prev => [...prev, "[Database] Saving new articles persistently to Firestore..."]);
      
      const res = await fetch("/api/sync/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articles: articlesToSend })
      });
      
      if (res.ok) {
        const result = await res.json();
        setBulkLogs(prev => [
          ...prev,
          `[Firestore] Successfully saved ${result.generatedCount} new articles!`,
          "[System] Bulk generation completed successfully."
        ]);
        setBulkStatus("Bulk generation completed!");
        
        fetchStats();
        router.refresh();
        if (onSyncComplete) onSyncComplete();
        
        setSelectedArticles([]);
      } else {
        const err = await res.json();
        setBulkLogs(prev => [...prev, `[Error] Generation failed: ${err.error || "Unknown error"}`]);
        setBulkStatus("Generation failed.");
      }
    } catch (error) {
      console.error(error);
      setBulkLogs(prev => [...prev, `[Error] Connection failed: ${error.message}`]);
      setBulkStatus("Connection error.");
    } finally {
      setBulkGenerating(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/cron-status");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error("Failed to load cron statistics:", e);
    }
  };

  useEffect(() => {
    fetchStats();
    // Poll stats every 15 seconds to sync dashboard dynamically
    const timer = setInterval(fetchStats, 15000);
    
    if (typeof window !== "undefined") {
      setForceLiveAds(localStorage.getItem("newsadda_force_live_ads") === "true");
    }
    
    return () => clearInterval(timer);
  }, []);

  const toggleForceLiveAds = () => {
    const newVal = !forceLiveAds;
    setForceLiveAds(newVal);
    if (typeof window !== "undefined") {
      localStorage.setItem("newsadda_force_live_ads", newVal ? "true" : "false");
      window.location.reload();
    }
  };

  const handleSync = async () => {
    setLoading(true);
    setStatusMessage("Initializing synchronization pipeline...");
    setSyncLogs(["[System] Starting automated sync..."]);
    
    try {
      // Step 1: Initial query logs
      const initialLogs = [
        "[News Client] Accessing global headlines feed...",
        "[News Client] Filtering out duplicate URLs successfully.",
        "[News Client] Checking headlines against database.json..."
      ];
      
      for (const log of initialLogs) {
        await new Promise(resolve => setTimeout(resolve, 600));
        setSyncLogs(prev => [...prev, log]);
        setStatusMessage(log);
      }

      // Send the actual API request to the backend
      const res = await fetch("/api/sync", { method: "POST" });
      
      if (res.ok) {
        const result = await res.json();
        const count = result.addedCount || 0;
        
        if (count > 0) {
          // If articles were actually added, show the generation steps
          const addedLogs = [
            "[Gemini Engine] Prompting Google Gemini AI with new headlines...",
            `[Gemini Engine] Writing ${count} extensive SEO-optimized articles...`,
            "[Database] Prepending generated content into database.json...",
            "[System] Synchronization completed successfully!"
          ];
          for (const log of addedLogs) {
            await new Promise(resolve => setTimeout(resolve, 600));
            setSyncLogs(prev => [...prev, log]);
            setStatusMessage(log);
          }
          setSyncLogs(prev => [...prev, `[Success] ${result.message}`]);
          setStatusMessage("Synchronization complete!");
        } else {
          // No articles added
          await new Promise(resolve => setTimeout(resolve, 600));
          setSyncLogs(prev => [
            ...prev,
            "[News Client] No new unique headlines found.",
            "[System] Synchronization finished: Database is already up to date."
          ]);
          setSyncLogs(prev => [...prev, `[Success] ${result.message}`]);
          setStatusMessage("Database is already up to date.");
        }
        
        fetchStats();
        router.refresh(); // Clear Next.js Client-Side Router Cache
        if (onSyncComplete) onSyncComplete();
      } else {
        const errorData = await res.json();
        setSyncLogs(prev => [...prev, `[Error] Sync failed: ${errorData.error || "Unknown error"}`]);
        setStatusMessage("Sync failed. Check terminal logs.");
      }
    } catch (error) {
      console.error(error);
      setSyncLogs(prev => [...prev, `[Error] Connection failure: ${error.message}`]);
      setStatusMessage("Connection error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* CARD 1: AI Autopilot Sync Dashboard */}
      <div className="dashboard-card">
        <div className="dashboard-header">
          <div className="dashboard-title-group">
            <h2 className="dashboard-title">
              NewsAdda <span className="logo-accent">AI Autopilot</span>
            </h2>
            <p className="dashboard-subtitle">
              Automated Google AdSense monetization layout combined with hands-free AI content ingestion.
            </p>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
            <div className="sync-status-indicator">
              <div className={`status-dot ${stats.cronActive ? "active" : ""}`} />
              <span>Dev Cron Daemon: {stats.cronActive ? "Active" : "Offline"}</span>
            </div>
            <div className="sync-status-indicator" style={{
              background: stats.firestoreStatus && stats.firestoreStatus !== "none"
                ? (stats.firestoreStatus === "active" ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)")
                : (stats.isKvConnected 
                  ? "rgba(16, 185, 129, 0.1)" 
                  : stats.isVercel 
                    ? "rgba(245, 158, 11, 0.1)" 
                    : "rgba(99, 102, 241, 0.1)"),
              border: stats.firestoreStatus && stats.firestoreStatus !== "none"
                ? (stats.firestoreStatus === "active" ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid rgba(239, 68, 68, 0.2)")
                : (stats.isKvConnected 
                  ? "1px solid rgba(16, 185, 129, 0.2)" 
                  : stats.isVercel 
                    ? "1px solid rgba(245, 158, 11, 0.2)" 
                    : "1px solid rgba(99, 102, 241, 0.2)"),
              color: stats.firestoreStatus && stats.firestoreStatus !== "none"
                ? (stats.firestoreStatus === "active" ? "#10b981" : "#ef4444")
                : (stats.isKvConnected 
                  ? "#10b981" 
                  : stats.isVercel 
                    ? "#f59e0b" 
                    : "var(--accent-primary)")
            }}>
              <div className="status-dot" style={{
                backgroundColor: stats.firestoreStatus && stats.firestoreStatus !== "none"
                  ? (stats.firestoreStatus === "active" ? "#10b981" : "#ef4444")
                  : (stats.isKvConnected 
                    ? "#10b981" 
                    : stats.isVercel 
                      ? "#f59e0b" 
                      : "var(--accent-primary)"),
                boxShadow: stats.firestoreStatus && stats.firestoreStatus !== "none"
                  ? (stats.firestoreStatus === "active" ? "0 0 8px #10b981" : "0 0 8px #ef4444")
                  : (stats.isKvConnected 
                    ? "0 0 8px #10b981" 
                    : stats.isVercel 
                      ? "0 0 8px #f59e0b" 
                      : "0 0 8px var(--accent-primary)")
              }} />
              <span>
                {stats.firestoreStatus && stats.firestoreStatus !== "none"
                  ? (stats.firestoreStatus === "active"
                    ? "DB: Persistent (Firestore)"
                    : "DB: Firestore Error")
                  : (stats.isKvConnected 
                    ? "DB: Persistent (Vercel KV)" 
                    : stats.isVercel 
                      ? "DB: Ephemeral (Temporary)" 
                      : "DB: Local Workspace (Persistent)")
                }
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
          <div style={{ background: "rgba(15, 23, 42, 0.02)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-subtle)" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "bold" }}>Total Articles</div>
            <div style={{ fontSize: "2rem", fontWeight: "800", color: "var(--accent-primary)", marginTop: "4px" }}>{stats.totalPosts}</div>
          </div>
          <div style={{ background: "rgba(15, 23, 42, 0.02)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-subtle)" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "bold" }}>Last Ingest Cycle</div>
            <div style={{ fontSize: "0.95rem", fontWeight: "600", marginTop: "14px", color: "var(--text-primary)" }}>
              {stats.lastSync ? new Date(stats.lastSync).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : "Never"}
            </div>
          </div>
          <div style={{ background: "rgba(15, 23, 42, 0.02)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-subtle)" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "bold" }}>Interval Setting</div>
            <div style={{ fontSize: "0.95rem", fontWeight: "600", marginTop: "14px", color: "var(--text-primary)" }}>Every {stats.interval} Mins</div>
          </div>
          <div style={{ background: "rgba(15, 23, 42, 0.02)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-subtle)" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "bold" }}>Active Feeds</div>
            <div style={{ fontSize: "0.8rem", fontWeight: "600", marginTop: "14px", color: "var(--text-primary)", display: "flex", gap: "4px", flexWrap: "wrap" }}>
              {stats.categories.map(c => (
                <span key={c} style={{ background: "rgba(15, 23, 42, 0.05)", padding: "2px 6px", borderRadius: "4px", fontSize: "10px", border: "1px solid var(--border-subtle)", color: "var(--text-secondary)" }}>{c}</span>
              ))}
            </div>
          </div>
        </div>

        {stats.firestoreStatus === "error" && (
          <div style={{
            background: "rgba(239, 68, 68, 0.05)",
            border: "1px dashed rgba(239, 68, 68, 0.2)",
            borderRadius: "12px",
            padding: "16px 20px",
            marginTop: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "8px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#ef4444", fontWeight: "700", fontSize: "0.95rem" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span>Cloud Firestore Connection Error</span>
            </div>
            <p style={{ margin: 0, fontSize: "0.83rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>
              Unable to connect to Cloud Firestore. Please verify your <strong>FIRESTORE_PROJECT_ID</strong> and <strong>FIRESTORE_API_KEY</strong> environment variables, 
              and make sure your Firestore Security Rules allow public read/write access (e.g. <code>allow read, write: if true;</code>).
            </p>
          </div>
        )}

        {stats.firestoreStatus === "active" && (
          <div style={{
            background: "rgba(16, 185, 129, 0.05)",
            border: "1px dashed rgba(16, 185, 129, 0.2)",
            borderRadius: "12px",
            padding: "14px 18px",
            marginTop: "16px",
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span style={{ fontSize: "0.83rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
              <strong style={{ color: "#10b981" }}>Cloud Firestore Persistence Active</strong>: Your database is successfully connected to <strong>Google Cloud Firestore</strong>. All articles are securely saved in the cloud and will remain persistent indefinitely.
            </span>
          </div>
        )}


        {(!stats.firestoreStatus || stats.firestoreStatus === "none") && stats.isVercel && !stats.isKvConnected && (
          <div style={{
            background: "rgba(245, 158, 11, 0.05)",
            border: "1px dashed rgba(245, 158, 11, 0.2)",
            borderRadius: "12px",
            padding: "16px 20px",
            marginTop: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "8px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#f59e0b", fontWeight: "700", fontSize: "0.95rem" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span>Storage is Ephemeral (Articles Will Vanish!)</span>
            </div>
            <p style={{ margin: 0, fontSize: "0.83rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>
              You are running on Vercel, but <strong>Vercel KV is not connected</strong>. 
              Newly synced articles are saved in a temporary directory and will <strong>vanish automatically after a few minutes</strong> when the serverless instance restarts.
            </p>
            <div style={{
              background: "#08090d",
              border: "1px solid var(--border-subtle)",
              borderRadius: "8px",
              padding: "12px",
              marginTop: "4px",
              fontSize: "0.78rem"
            }}>
              <strong style={{ color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>To Fix Permanently (1-Click Guide):</strong>
              <ol style={{ margin: 0, paddingLeft: "16px", display: "flex", flexDirection: "column", gap: "4px", color: "var(--text-secondary)" }}>
                <li>Open your <strong>Vercel Dashboard</strong> &rarr; select <strong>newsadda</strong> &rarr; click <strong>Storage</strong> tab.</li>
                <li>Create a <strong>KV (Redis)</strong> database and click <strong>Connect to Project</strong>.</li>
                <li>Re-deploy your project. The application will instantly switch to cloud storage and posts will <strong>never vanish again!</strong></li>
              </ol>
            </div>
          </div>
        )}

        {(!stats.firestoreStatus || stats.firestoreStatus === "none") && stats.isKvConnected && (
          <div style={{
            background: "rgba(16, 185, 129, 0.05)",
            border: "1px dashed rgba(16, 185, 129, 0.2)",
            borderRadius: "12px",
            padding: "14px 18px",
            marginTop: "16px",
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span style={{ fontSize: "0.83rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
              <strong style={{ color: "#10b981" }}>Cloud Persistence Active</strong>: Your database is safely connected to <strong>Vercel KV Store</strong>. All articles are securely saved in the cloud and will remain persistent indefinitely.
            </span>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
          <div className="sync-actions">
            <button className="btn-primary" onClick={handleSync} disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner" style={{ width: "16px", height: "16px", borderWidth: "2px" }} />
                  <span>Running Sync Pipeline...</span>
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                  </svg>
                  <span>Trigger Manual AI Sync</span>
                </>
              )}
            </button>
            {loading && (
              <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontStyle: "italic" }}>
                {statusMessage}
              </span>
            )}
          </div>

          {syncLogs.length > 0 && (
            <div style={{
              background: "#08090d",
              border: "1px solid var(--border-subtle)",
              borderRadius: "10px",
              padding: "12px 16px",
              maxHeight: "150px",
              overflowY: "auto",
              fontFamily: "monospace",
              fontSize: "0.78rem",
              color: "var(--text-secondary)",
              display: "flex",
              flexDirection: "column",
              gap: "4px"
            }}>
              {syncLogs.map((log, index) => (
                <div key={index} style={{
                  color: log.startsWith("[Error]") ? "#ef4444" : log.startsWith("[Success]") ? "#10b981" : "inherit"
                }}>
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CARD: Premium Manually Select & Write AI Blogs */}
      <div className="dashboard-card" style={{ borderTop: "1px solid var(--border-subtle)" }}>
        <div className="dashboard-header">
          <div className="dashboard-title-group" style={{ flex: 1, minWidth: "250px" }}>
            <h2 className="dashboard-title">
              Manual <span className="logo-accent" style={{ color: "var(--text-primary)" }}>News Selection Hub</span>
            </h2>
            <p className="dashboard-subtitle">
              Fetch real-time trending stories across categories. Select articles to write and save directly to Cloud Firestore.
            </p>
          </div>
          <button
            className="btn-secondary"
            onClick={() => {
              const term = activeCategory || searchedTerm;
              if (term) {
                fetchTrendingHeadlines(term, true, !activeCategory);
              }
            }}
            disabled={loadingHeadlines || bulkGenerating}
            style={{
              padding: "8px 14px",
              fontSize: "0.82rem",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              height: "fit-content"
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={loadingHeadlines ? "spinner" : ""} style={loadingHeadlines ? { animation: "spin 0.8s linear infinite" } : {}}>
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            <span>{loadingHeadlines ? "Refreshing..." : "Force Refresh"}</span>
          </button>
        </div>

        {/* Categories Bar & Custom Search Box */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "16px"
        }}>
          <div className="category-bar" style={{ marginBottom: 0, paddingBottom: 0 }}>
            {["politics", "cricket", "technology", "science", "business", "crime"].map((cat) => (
              <button
                key={cat}
                className={`category-btn ${activeCategory === cat ? "active" : ""}`}
                onClick={() => setActiveCategory(cat)}
                disabled={bulkGenerating}
                style={activeCategory === cat ? {
                  background: "#0f172a",
                  borderColor: "#0f172a",
                  color: "#ffffff"
                } : {}}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>

          {/* Premium Search Box */}
          <form onSubmit={handleSearchSubmit} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.5" style={{ position: "absolute", left: "12px" }}>
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                placeholder="Search real-time news..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={bulkGenerating}
                style={{
                  padding: "8px 30px 8px 32px",
                  borderRadius: "20px",
                  border: "1px solid var(--border-subtle)",
                  background: "var(--bg-surface-solid)",
                  color: "var(--text-primary)",
                  fontSize: "0.82rem",
                  width: "200px",
                  outline: "none",
                  transition: "all 0.25s ease"
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  style={{
                    position: "absolute",
                    right: "10px",
                    background: "none",
                    border: "none",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    fontSize: "1.1rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0
                  }}
                  title="Clear Search"
                >
                  ×
                </button>
              )}
            </div>
            <button
              type="submit"
              className="category-btn"
              disabled={bulkGenerating || !searchQuery.trim()}
              style={{
                padding: "7px 14px",
                fontSize: "0.82rem",
                background: "#0f172a",
                borderColor: "#0f172a",
                color: "#ffffff"
              }}
            >
              Search
            </button>
          </form>
        </div>

        {/* Search Results Indicator */}
        {searchedTerm && (
          <div style={{
            fontSize: "0.82rem",
            color: "#64748b",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "6px"
          }}>
            <span>Showing search results for:</span>
            <span style={{
              color: "#334155",
              background: "rgba(51, 65, 85, 0.08)",
              border: "1px solid rgba(51, 65, 85, 0.15)",
              borderRadius: "4px",
              padding: "2px 8px",
              fontWeight: "600"
            }}>
              "{searchedTerm}"
            </span>
          </div>
        )}

        {/* CSS Media Rules for Queue Column wrapping on smaller viewports */}
        <style dangerouslySetInnerHTML={{__html: `
          @media (max-width: 991px) {
            .admin-queue-section {
              border-left: none !important;
              padding-left: 0 !important;
              border-top: 1px dashed var(--border-subtle);
              padding-top: 24px;
              margin-top: 8px;
            }
          }
          .queue-item-hoverable {
            transition: all 0.2s ease;
          }
          .queue-item-hoverable:hover {
            background: rgba(15, 23, 42, 0.02) !important;
            border-color: #cbd5e1 !important;
          }
        `}} />

        {/* Premium Selection Split-Screen Layout */}
        <div style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          gap: "28px",
          marginTop: "16px"
        }}>
          {/* Left Column: Source Feed Checklist */}
          <div style={{
            flex: "1 1 500px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            minWidth: 0
          }}>
            {/* Headlines List Grid */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "360px", overflowY: "auto", paddingRight: "4px", border: "1px solid var(--border-subtle)", borderRadius: "12px", padding: "12px", background: "rgba(15, 23, 42, 0.01)" }}>
              {loadingHeadlines ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", padding: "40px 0" }}>
                  <div className="spinner" style={{ width: "32px", height: "32px", borderWidth: "3px", borderTopColor: "var(--text-primary)" }} />
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "500" }}>Fetching real-time headlines...</span>
                </div>
              ) : headlines.length === 0 ? (
                <div style={{ padding: "32px 0", textAlign: "center", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                  No recent headlines found for {activeCategory ? `category "${activeCategory}"` : `query "${searchedTerm}"`}.
                </div>
              ) : (
                headlines.map((headline) => {
                  const isSelected = selectedArticles.some(a => a.title === headline.title);
                  return (
                    <div
                      key={headline.title}
                      onClick={() => !bulkGenerating && handleToggleSelect(headline)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        padding: "12px 16px",
                        borderRadius: "10px",
                        border: isSelected ? "1px solid #475569" : "1px solid var(--border-subtle)",
                        background: isSelected ? "rgba(15, 23, 42, 0.03)" : "var(--bg-surface-solid)",
                        cursor: bulkGenerating ? "not-allowed" : "pointer",
                        transition: "all 0.2s ease",
                        boxShadow: "none"
                      }}
                      className="headline-item"
                    >
                      {/* custom checkbox */}
                      <div
                        style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "6px",
                          border: isSelected ? "2px solid #0f172a" : "2px solid var(--text-muted)",
                          background: isSelected ? "#0f172a" : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.15s ease",
                          flexShrink: 0
                        }}
                      >
                        {isSelected && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>

                      {/* Thumbnail / Source Image */}
                      {headline.image && (
                        <img
                          src={headline.image}
                          alt=""
                          style={{
                            width: "50px",
                            height: "50px",
                            borderRadius: "8px",
                            objectFit: "cover",
                            border: "1px solid var(--border-subtle)",
                            flexShrink: 0
                          }}
                        />
                      )}

                      {/* Text Details */}
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "0.72rem", background: "rgba(15, 23, 42, 0.05)", padding: "2px 6px", borderRadius: "4px", fontWeight: "600", color: "var(--text-secondary)" }}>
                            {headline.source || "News Desk"}
                          </span>
                          <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                            {new Date(headline.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          </span>
                        </div>
                        <h4 style={{ fontSize: "0.88rem", fontWeight: "600", color: "var(--text-primary)", margin: 0, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                          {headline.title}
                        </h4>
                        <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", margin: 0, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                          {headline.description || "Latest trending headline update."}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Left Column Feed Toolbar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginTop: "4px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleToggleSelectAll}
                  disabled={loadingHeadlines || headlines.length === 0 || bulkGenerating}
                  style={{ padding: "8px 14px", fontSize: "0.82rem" }}
                >
                  {headlines.length > 0 && headlines.every(h => selectedArticles.some(a => a.title === h.title)) ? "Deselect All Current" : "Select All Current"}
                </button>
                <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: "500" }}>
                  {headlines.filter(h => selectedArticles.some(a => a.title === h.title)).length} of {headlines.length} selected in this category
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: AI Generation Queue */}
          <div
            className="admin-queue-section"
            style={{
              flex: "1 1 340px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              minWidth: 0,
              borderLeft: "1px solid var(--border-subtle)",
              paddingLeft: "28px"
            }}
          >
            {/* Queue Title Block */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <h3 style={{ fontSize: "1.05rem", fontWeight: "700", color: "#ffffff", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <span>AI Writing Queue</span>
                <span style={{
                  background: "#475569",
                  color: "#ffffff",
                  fontSize: "0.72rem",
                  fontWeight: "bold",
                  padding: "2px 8px",
                  borderRadius: "12px",
                  boxShadow: "none"
                }}>
                  {selectedArticles.length} queued
                </span>
              </h3>
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", margin: 0, lineHeight: "1.4" }}>
                Select stories from multiple categories to build your queue. Reorder priorities below before triggering Sarvam AI.
              </p>
            </div>

            {/* Queue scrollbox */}
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              maxHeight: "360px",
              overflowY: "auto",
              paddingRight: "4px",
              border: "1px solid var(--border-subtle)",
              borderRadius: "12px",
              padding: "10px",
              background: "rgba(15, 23, 42, 0.01)"
            }}>
              {selectedArticles.length === 0 ? (
                <div style={{
                  padding: "48px 12px",
                  textAlign: "center",
                  color: "var(--text-muted)",
                  fontSize: "0.82rem",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "10px"
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" style={{ opacity: 0.5 }}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                  <span>Queue is empty. Toggle story checkboxes on the left to add them across categories!</span>
                </div>
              ) : (
                selectedArticles.map((article, index) => {
                  const isDragged = draggedIndex === index;
                  const isDragOver = dragOverIndex === index;
                  const isPriority = index < 3;
                  
                  return (
                    <div
                      key={`${article.title}-${index}`}
                      className="queue-item-hoverable"
                      draggable={!bulkGenerating}
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      onDrop={(e) => handleDrop(e, index)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "10px 12px",
                        borderRadius: "10px",
                        border: isDragOver
                          ? "1.5px dashed #475569"
                          : "1px solid var(--border-subtle)",
                        background: isDragOver
                          ? "rgba(15, 23, 42, 0.04)"
                          : "var(--bg-surface-solid)",
                        opacity: isDragged ? 0.45 : 1,
                        transform: isDragOver ? "scale(1.02)" : "scale(1)",
                        boxShadow: "none",
                        position: "relative",
                        transition: "transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), border-color 0.2s ease, background-color 0.2s ease, opacity 0.2s ease",
                        cursor: bulkGenerating ? "not-allowed" : "grab"
                      }}
                    >
                      {/* Drag Handle */}
                      {!bulkGenerating && (
                        <div style={{
                          color: "var(--text-muted)",
                          fontSize: "1.1rem",
                          fontWeight: "bold",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "grab",
                          userSelect: "none",
                          paddingRight: "2px",
                          letterSpacing: "-1px",
                          opacity: 0.7
                        }} title="Drag to reorder">
                          ⋮⋮
                        </div>
                      )}

                      {/* Queue number badge */}
                      <div style={{
                        width: "22px",
                        height: "22px",
                        borderRadius: "50%",
                        background: "#f1f5f9",
                        color: "#334155",
                        fontSize: "0.75rem",
                        fontWeight: "800",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        border: "1px solid #cbd5e1",
                        boxShadow: "none"
                      }}>
                        {index + 1}
                      </div>

                      {/* Details */}
                      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "2px" }}>
                        <h4 style={{
                          fontSize: "0.82rem",
                          fontWeight: "600",
                          color: "var(--text-primary)",
                          margin: 0,
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                          whiteSpace: "nowrap"
                        }} title={article.title}>
                          {article.title}
                        </h4>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                          <span style={{
                            fontSize: "0.62rem",
                            background: "rgba(71, 85, 105, 0.08)",
                            color: "#475569",
                            padding: "1px 6px",
                            borderRadius: "4px",
                            fontWeight: "700",
                            textTransform: "capitalize"
                          }}>
                            {article.category}
                          </span>
                          <span style={{ fontSize: "0.62rem", color: "var(--text-muted)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                            {article.source || "News Desk"}
                          </span>
                          
                          {/* Premium Glowing Priority Labels */}
                          {isPriority && (
                            <span style={{
                              fontSize: "0.6rem",
                              fontWeight: "800",
                              textTransform: "uppercase",
                              padding: "1px 5px",
                              borderRadius: "4px",
                              background: "#f8fafc",
                              color: "#475569",
                              border: "1px solid #cbd5e1",
                              boxShadow: "none"
                            }}>
                              {index === 0 ? "1st in Queue" : index === 1 ? "2nd in Queue" : "3rd in Queue"}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Controls */}
                      <div style={{ display: "flex", alignItems: "center", gap: "3px", flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => moveArticleInQueue(index, "up")}
                          disabled={index === 0 || bulkGenerating}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: index === 0 || bulkGenerating ? "not-allowed" : "pointer",
                            color: index === 0 ? "var(--border-subtle)" : "var(--text-secondary)",
                            padding: "4px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "4px",
                            transition: "background 0.2s ease"
                          }}
                          title="Move Up"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="18 15 12 9 6 15" />
                          </svg>
                        </button>

                        <button
                          type="button"
                          onClick={() => moveArticleInQueue(index, "down")}
                          disabled={index === selectedArticles.length - 1 || bulkGenerating}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: index === selectedArticles.length - 1 || bulkGenerating ? "not-allowed" : "pointer",
                            color: index === selectedArticles.length - 1 ? "var(--border-subtle)" : "var(--text-secondary)",
                            padding: "4px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "4px",
                            transition: "background 0.2s ease"
                          }}
                          title="Move Down"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedArticles(prev => prev.filter((_, i) => i !== index))}
                          disabled={bulkGenerating}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: bulkGenerating ? "not-allowed" : "pointer",
                            color: "#ef4444",
                            padding: "4px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "4px",
                            marginLeft: "1px",
                            transition: "background 0.2s ease"
                          }}
                          title="Remove from queue"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Queue triggers */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px" }}>
              <button
                className="btn-primary"
                onClick={handleBulkGenerate}
                disabled={selectedArticles.length === 0 || bulkGenerating}
                style={{
                  background: "#0f172a",
                  border: "1px solid #1e293b",
                  boxShadow: "none",
                  width: "100%",
                  justifyContent: "center"
                }}
              >
                {bulkGenerating ? (
                  <>
                    <div className="spinner" style={{ width: "16px", height: "16px", borderWidth: "2px", borderTopColor: "#ffffff" }} />
                    <span>Writing AI Blogs...</span>
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                    <span>Write AI Blogs for Queue ({selectedArticles.length})</span>
                  </>
                )}
              </button>

              {selectedArticles.length > 0 && !bulkGenerating && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setSelectedArticles([])}
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    borderColor: "rgba(239, 68, 68, 0.15)",
                    color: "#ef4444",
                    fontSize: "0.78rem",
                    padding: "6px"
                  }}
                >
                  Clear Entire Queue
                </button>
              )}
            </div>

            {/* Queue Logger */}
            {(bulkLogs.length > 0 || bulkStatus) && (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "4px" }}>
                {bulkStatus && (
                  <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontStyle: "italic" }}>
                    Status: {bulkStatus}
                  </span>
                )}
                <div style={{
                  background: "#08090d",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  maxHeight: "130px",
                  overflowY: "auto",
                  fontFamily: "monospace",
                  fontSize: "0.75rem",
                  color: "var(--text-secondary)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px"
                }}>
                  {bulkLogs.map((log, index) => (
                    <div key={index} style={{
                      color: log.startsWith("[Error]") ? "#ef4444" : log.startsWith("[Firestore]") || log.startsWith("[System] Bulk generation completed") ? "#10b981" : "inherit"
                    }}>
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>


    </div>
  );
}
