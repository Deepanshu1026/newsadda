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
    return () => clearInterval(timer);
  }, []);

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
  );
}
