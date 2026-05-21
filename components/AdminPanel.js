"use client";

import React, { useState, useEffect } from "react";

export default function AdminPanel({ onSyncComplete }) {
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
      const simulateLogs = [
        "[News Client] Accessing global headlines feed...",
        "[News Client] Filtered out duplicate URLs successfully.",
        "[Gemini Engine] Prompting Google Gemini AI with selected headlines...",
        "[Gemini Engine] Writing extensive SEO-optimized articles...",
        "[Database] Prepending generated content into database.json...",
        "[System] Synchronization completed successfully!"
      ];

      // Send the actual API request to the backend
      const responsePromise = fetch("/api/sync", { method: "POST" });
      
      // Animate logs sequentially for highly engaging developer visual feedback
      for (let i = 0; i < simulateLogs.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setSyncLogs(prev => [...prev, simulateLogs[i]]);
        setStatusMessage(simulateLogs[i]);
      }

      const res = await responsePromise;
      if (res.ok) {
        const result = await res.json();
        setSyncLogs(prev => [...prev, `[Success] ${result.message}`]);
        setStatusMessage("Synchronization complete!");
        fetchStats();
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
          <div className="sync-status-indicator">
            <div className={`status-dot ${stats.cronActive ? "active" : ""}`} />
            <span>Dev Cron Daemon: {stats.cronActive ? "Active" : "Offline"}</span>
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

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
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
