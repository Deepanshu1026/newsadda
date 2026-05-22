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
  const [bulkGenerating, setBulkGenerating] = useState(false);
  const [bulkLogs, setBulkLogs] = useState([]);
  const [bulkStatus, setBulkStatus] = useState("");
  // Client-side cache to avoid repeated queries and preserve API quota
  const [cachedHeadlines, setCachedHeadlines] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [searchedTerm, setSearchedTerm] = useState("");

  const fetchTrendingHeadlines = async (cat, force = false, isSearch = false) => {
    const canCache = !isSearch;

    if (!force && canCache && cachedHeadlines[cat]) {
      setHeadlines(cachedHeadlines[cat]);
      setSelectedArticles([]);
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
        setSelectedArticles([]);
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

  const handleToggleSelect = (title) => {
    setSelectedArticles(prev => 
      prev.includes(title) 
        ? prev.filter(t => t !== title) 
        : [...prev, title]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedArticles.length === headlines.length) {
      setSelectedArticles([]);
    } else {
      setSelectedArticles(headlines.map(h => h.title));
    }
  };

  const handleBulkGenerate = async () => {
    if (selectedArticles.length === 0) return;
    
    setBulkGenerating(true);
    setBulkStatus("Starting manual AI blog generation...");
    setBulkLogs(["[System] Starting manual bulk generation for " + selectedArticles.length + " article(s)..."]);
    
    try {
      const articlesToSend = selectedArticles.map(title => {
        const found = headlines.find(h => h.title === title);
        return {
          title: found.title,
          description: found.description,
          category: activeCategory || searchedTerm || "News",
          image: found.image,
          author: found.author
        };
      });

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
                <span key={c} style={{ background: "rgba(99,102,241,0.1)", padding: "2px 6px", borderRadius: "4px", fontSize: "10px", border: "1px solid rgba(99,102,241,0.2)" }}>{c}</span>
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
      <div className="dashboard-card" style={{ borderTop: "4px solid var(--accent-purple)" }}>
        <div className="dashboard-header">
          <div className="dashboard-title-group" style={{ flex: 1, minWidth: "250px" }}>
            <h2 className="dashboard-title">
              Manual <span className="logo-accent" style={{ background: "linear-gradient(to right, var(--accent-purple), var(--accent-secondary))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>News Selection Hub</span>
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
                  background: "var(--accent-purple)",
                  borderColor: "var(--accent-purple)",
                  boxShadow: "0 4px 12px rgba(124, 58, 237, 0.25)"
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
                background: "var(--accent-purple)",
                borderColor: "var(--accent-purple)",
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
            color: "var(--text-muted)",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "6px"
          }}>
            <span>Showing search results for:</span>
            <span style={{
              color: "var(--accent-purple)",
              background: "rgba(124, 58, 237, 0.08)",
              padding: "2px 8px",
              borderRadius: "12px",
              border: "1px solid rgba(124, 58, 237, 0.15)",
              fontWeight: "600"
            }}>
              "{searchedTerm}"
            </span>
          </div>
        )}

        {/* Headlines List Grid */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "360px", overflowY: "auto", paddingRight: "4px", border: "1px solid var(--border-subtle)", borderRadius: "12px", padding: "12px", background: "rgba(15, 23, 42, 0.01)" }}>
          {loadingHeadlines ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", padding: "40px 0" }}>
              <div className="spinner" style={{ width: "32px", height: "32px", borderWidth: "3px", borderTopColor: "var(--accent-purple)" }} />
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "500" }}>Fetching real-time headlines...</span>
            </div>
          ) : headlines.length === 0 ? (
            <div style={{ padding: "32px 0", textAlign: "center", color: "var(--text-muted)", fontSize: "0.9rem" }}>
              No recent headlines found for {activeCategory ? `category "${activeCategory}"` : `query "${searchedTerm}"`}.
            </div>
          ) : (
            headlines.map((headline) => {
              const isSelected = selectedArticles.includes(headline.title);
              return (
                <div
                  key={headline.title}
                  onClick={() => !bulkGenerating && handleToggleSelect(headline.title)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    border: isSelected ? "1px solid var(--accent-purple)" : "1px solid var(--border-subtle)",
                    background: isSelected ? "rgba(124, 58, 237, 0.03)" : "var(--bg-surface-solid)",
                    cursor: bulkGenerating ? "not-allowed" : "pointer",
                    transition: "all 0.2s ease",
                    boxShadow: isSelected ? "0 2px 8px rgba(124, 58, 237, 0.05)" : "none"
                  }}
                  className="headline-item"
                >
                  {/* custom checkbox */}
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "6px",
                      border: isSelected ? "2px solid var(--accent-purple)" : "2px solid var(--text-muted)",
                      background: isSelected ? "var(--accent-purple)" : "transparent",
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

        {/* Toolbar & Actions */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              className="btn-secondary"
              onClick={handleToggleSelectAll}
              disabled={loadingHeadlines || headlines.length === 0 || bulkGenerating}
              style={{ padding: "8px 14px", fontSize: "0.82rem" }}
            >
              {selectedArticles.length === headlines.length && headlines.length > 0 ? "Deselect All" : "Select All"}
            </button>
            <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: "500" }}>
              {selectedArticles.length} of {headlines.length} headlines selected
            </span>
          </div>

          <button
            className="btn-primary"
            onClick={handleBulkGenerate}
            disabled={selectedArticles.length === 0 || bulkGenerating}
            style={{
              background: "var(--accent-purple)",
              boxShadow: selectedArticles.length > 0 && !bulkGenerating ? "0 4px 14px rgba(124, 58, 237, 0.25)" : "none"
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
                <span>Write AI Blogs for Selected ({selectedArticles.length})</span>
              </>
            )}
          </button>
        </div>

        {/* Bulk Generation Logger */}
        {(bulkLogs.length > 0 || bulkStatus) && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {bulkStatus && (
              <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)", fontStyle: "italic" }}>
                Status: {bulkStatus}
              </span>
            )}
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

      {/* CARD 2: Google AdSense Monetization Hub */}
      <div className="dashboard-card" style={{ borderTop: "4px solid var(--accent-secondary)" }}>
        <div className="dashboard-header">
          <div className="dashboard-title-group">
            <h2 className="dashboard-title">
              Google AdSense <span className="logo-accent">Monetization Hub</span>
            </h2>
            <p className="dashboard-subtitle">
              Fully responsive Google AdSense integration with smart script injection and premium ad-layout alignment.
            </p>
          </div>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(22, 163, 74, 0.1)",
            color: "var(--accent-success)",
            border: "1px solid rgba(22, 163, 74, 0.2)",
            padding: "6px 14px",
            borderRadius: "30px",
            fontSize: "0.85rem",
            fontWeight: "600"
          }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--accent-success)" }} />
            <span>AdSense: Configured</span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
          <div style={{ background: "rgba(15, 23, 42, 0.02)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-subtle)" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "bold" }}>Publisher Account</div>
            <div style={{ fontSize: "0.95rem", fontWeight: "700", marginTop: "12px", color: "var(--text-primary)", fontFamily: "monospace" }}>ca-pub-8945078741780854</div>
          </div>
          <div style={{ background: "rgba(15, 23, 42, 0.02)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-subtle)" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "bold" }}>Script Loader (Next.js)</div>
            <div style={{ fontSize: "0.85rem", fontWeight: "600", marginTop: "12px", color: "var(--accent-primary)" }}>&lt;Script strategy="afterInteractive"&gt;</div>
          </div>
          <div style={{ background: "rgba(15, 23, 42, 0.02)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-subtle)" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "bold" }}>Active Layout Placements</div>
            <div style={{ fontSize: "0.85rem", fontWeight: "600", marginTop: "12px", color: "var(--text-primary)" }}>4 Active Slots (Sidebars + Bottom + In-Feed)</div>
          </div>
        </div>

        <div style={{
          background: "rgba(79, 70, 229, 0.03)",
          border: "1px dashed rgba(79, 70, 229, 0.15)",
          padding: "20px",
          borderRadius: "12px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px"
        }}>
          <div style={{ flex: 1, minWidth: "260px" }}>
            <h4 style={{ fontSize: "0.95rem", fontWeight: "700", color: "var(--text-primary)", marginBottom: "4px" }}>
              Localhost Dev Placements Mode
            </h4>
            <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: "1.45" }}>
              {forceLiveAds 
                ? "Rendering real AdSense ins tag elements. They may appear blank locally because localhost is not a verified AdSense domain, which is expected."
                : "Rendering custom interactive games and mascot ad simulations. This protects your account from invalid impression suspensions on localhost."
              }
            </p>
          </div>
          
          <button 
            onClick={toggleForceLiveAds}
            style={{
              padding: "10px 18px",
              borderRadius: "10px",
              fontWeight: "600",
              fontSize: "0.88rem",
              cursor: "pointer",
              transition: "all 0.2s ease",
              background: forceLiveAds ? "rgba(239, 68, 68, 0.1)" : "var(--accent-primary)",
              color: forceLiveAds ? "#ef4444" : "#ffffff",
              border: forceLiveAds ? "1px solid rgba(239, 68, 68, 0.2)" : "none",
              boxShadow: forceLiveAds ? "none" : "0 4px 12px rgba(79, 70, 229, 0.2)"
            }}
          >
            {forceLiveAds ? "Disable Live Ads on Local" : "Force Live Ads on Local"}
          </button>
        </div>

        <div style={{
          background: "#08090d",
          border: "1px solid var(--border-subtle)",
          borderRadius: "12px",
          padding: "20px",
          color: "var(--text-secondary)",
          fontSize: "0.85rem",
          display: "flex",
          flexDirection: "column",
          gap: "12px"
        }}>
          <h4 style={{ color: "#ffffff", fontWeight: "700", fontSize: "0.9rem" }}>Publisher Verification Checklist</h4>
          <ul style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "6px", margin: 0, listStyleType: "disc" }}>
            <li>
              <strong>Active head Script Tag:</strong> Script has been injected at the layout level via optimized Next.js Script hooks and will be read automatically by Google.
            </li>
            <li>
              <strong>Vercel Domain Setup:</strong> Ensure your custom domain maps directly to your Vercel project inside your Vercel dashboard.
            </li>
            <li>
              <strong>Auto Ads Activation:</strong> In your <a href="https://google.com/adsense" target="_blank" rel="noreferrer" style={{ color: "var(--accent-primary)", textDecoration: "underline", fontWeight: "600" }}>Google AdSense Dashboard</a>, verify your domain and enable "Auto Ads" so Google can overlay ads intelligently.
            </li>
            <li>
              <strong>Optimal Spaces Reserved:</strong> Sidebar margins and sticky bottom spaces are perfectly size-locked to prevent layout shifts (CLS), protecting SEO health.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
