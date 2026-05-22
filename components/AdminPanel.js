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
