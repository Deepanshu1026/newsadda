import { fetchLatestNews } from "../../../services/newsService";
import Link from "next/link";

// Force server-rendering on every request to fetch absolute fresh live payloads from APIs
export const dynamic = "force-dynamic";

export default async function DebugNewsPage(props) {
  const searchParams = await props.searchParams;
  const currentTab = searchParams.tab === "politics" ? "politics" : "india";
  const queryTerm = currentTab === "politics" ? "indian politics" : "india";

  const newsApiKey = process.env.NEWS_API_KEY;
  const newsDataApiKey = process.env.NEWSDATA_API_KEY;

  let error = null;
  let articles = [];
  try {
    // Request top articles by searching for selected query
    articles = await fetchLatestNews(queryTerm);
    // Limit to top 10 as requested
    articles = articles.slice(0, 10);
  } catch (err) {
    error = err.message;
  }

  return (
    <div style={{
      maxWidth: "960px",
      margin: "0 auto",
      padding: "40px 20px",
      fontFamily: "Inter, system-ui, sans-serif",
      color: "#1f2937",
      backgroundColor: "#f9fafb",
      minHeight: "100vh"
    }}>
      {/* Header */}
      <header style={{ borderBottom: "2px solid #e5e7eb", paddingBottom: "20px", marginBottom: "30px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: "800", color: "#111827", margin: 0 }}>
            🇮🇳 India News Debug Console
          </h1>
          <Link href="/" style={{
            textDecoration: "none",
            color: "#7c3aed",
            fontWeight: "600",
            fontSize: "0.9rem",
            display: "inline-flex",
            alignItems: "center",
            gap: "5px"
          }}>
            ← Back to Feed
          </Link>
        </div>
        <p style={{ color: "#4b5563", marginTop: "8px", fontSize: "0.95rem" }}>
          Retrieves the top 10 de-duplicated, latest raw articles from the active news APIs using query category: <code>"{queryTerm}"</code>.
        </p>
      </header>

      {/* Modern Tab Selector */}
      <div style={{
        display: "flex",
        gap: "12px",
        marginBottom: "30px",
        borderBottom: "1px solid #e5e7eb",
        paddingBottom: "16px"
      }}>
        <Link 
          href="/debug-news?tab=india"
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            fontSize: "0.95rem",
            fontWeight: "600",
            textDecoration: "none",
            backgroundColor: currentTab === "india" ? "#7c3aed" : "transparent",
            color: currentTab === "india" ? "#ffffff" : "#4b5563",
            transition: "all 0.2s ease",
            border: currentTab === "india" ? "1px solid #7c3aed" : "1px solid #e5e7eb",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px"
          }}
        >
          🇮🇳 India News
        </Link>
        <Link 
          href="/debug-news?tab=politics"
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            fontSize: "0.95rem",
            fontWeight: "600",
            textDecoration: "none",
            backgroundColor: currentTab === "politics" ? "#7c3aed" : "transparent",
            color: currentTab === "politics" ? "#ffffff" : "#4b5563",
            transition: "all 0.2s ease",
            border: currentTab === "politics" ? "1px solid #7c3aed" : "1px solid #e5e7eb",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px"
          }}
        >
          🏛️ Indian Politics
        </Link>
      </div>

      {/* API Key Status Grid */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginBottom: "30px" }}>
        <div style={{
          background: "#ffffff",
          padding: "16px",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
        }}>
          <div style={{ fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase", fontWeight: "700", letterSpacing: "0.05em" }}>
            NewsAPI (newsapi.org)
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
            <span style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: newsApiKey ? "#10b981" : "#ef4444"
            }} />
            <span style={{ fontSize: "0.95rem", fontWeight: "600" }}>
              {newsApiKey ? "API Key Configured" : "API Key Missing (Using Fallbacks)"}
            </span>
          </div>
          {newsApiKey && (
            <div style={{ fontSize: "0.78rem", color: "#9ca3af", marginTop: "4px", fontFamily: "monospace" }}>
              Key: {newsApiKey.slice(0, 4)}...{newsApiKey.slice(-4)}
            </div>
          )}
        </div>

        <div style={{
          background: "#ffffff",
          padding: "16px",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
        }}>
          <div style={{ fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase", fontWeight: "700", letterSpacing: "0.05em" }}>
            NewsData.io (newsdata.io)
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
            <span style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: newsDataApiKey ? "#10b981" : "#ef4444"
            }} />
            <span style={{ fontSize: "0.95rem", fontWeight: "600" }}>
              {newsDataApiKey ? "API Key Configured" : "API Key Missing (Using Fallbacks)"}
            </span>
          </div>
          {newsDataApiKey && (
            <div style={{ fontSize: "0.78rem", color: "#9ca3af", marginTop: "4px", fontFamily: "monospace" }}>
              Key: {newsDataApiKey.slice(0, 4)}...{newsDataApiKey.slice(-4)}
            </div>
          )}
        </div>
      </section>

      {/* Diagnostics */}
      <section style={{
        background: "#ffffff",
        padding: "20px",
        borderRadius: "12px",
        border: "1px solid #e5e7eb",
        marginBottom: "30px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
      }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: "700", margin: "0 0 12px 0", color: "#111827" }}>
          Pipeline Ingestion Diagnostics
        </h2>
        <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
          <div>
            <span style={{ color: "#6b7280", fontSize: "0.85rem" }}>Total Returned Articles:</span>
            <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "#7c3aed" }}>{articles.length}</div>
          </div>
          <div>
            <span style={{ color: "#6b7280", fontSize: "0.85rem" }}>Query Term:</span>
            <div style={{ fontSize: "1.1rem", fontWeight: "700", marginTop: "4px" }}>"{queryTerm}"</div>
          </div>
          <div>
            <span style={{ color: "#6b7280", fontSize: "0.85rem" }}>Mode:</span>
            <div style={{ fontSize: "1.1rem", fontWeight: "700", marginTop: "4px", color: (!newsApiKey && !newsDataApiKey) ? "#ef4444" : "#10b981" }}>
              {(!newsApiKey && !newsDataApiKey) ? "Fallback Simulation" : "Live Production Ingestion"}
            </div>
          </div>
        </div>
      </section>

      {/* Errors */}
      {error && (
        <div style={{
          background: "#fef2f2",
          border: "1px solid #fee2e2",
          borderRadius: "8px",
          padding: "16px",
          color: "#991b1b",
          marginBottom: "30px",
          fontSize: "0.9rem"
        }}>
          <strong>Error loading news data:</strong> {error}
        </div>
      )}

      {/* Articles Feed */}
      <main>
        <h2 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "16px", color: "#111827" }}>
          Ingested Top 10 {currentTab === "politics" ? "Indian Politics" : "India"} Feed
        </h2>
        
        {articles.length === 0 ? (
          <div style={{
            background: "#ffffff",
            padding: "40px",
            textAlign: "center",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            color: "#6b7280"
          }}>
            No articles found for "india".
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {articles.map((art, idx) => (
              <article key={idx} style={{
                background: "#ffffff",
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
                padding: "20px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                display: "flex",
                gap: "20px",
                flexDirection: "row",
                alignItems: "flex-start",
                justifyContent: "space-between",
                flexWrap: "wrap-reverse"
              }}>
                <div style={{ flex: "1 1 500px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "8px" }}>
                    <span style={{
                      background: "#7c3aed15",
                      color: "#7c3aed",
                      fontSize: "0.75rem",
                      fontWeight: "700",
                      padding: "4px 10px",
                      borderRadius: "20px"
                    }}>
                      Index {idx + 1}
                    </span>
                    <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                      Source: <strong>{art.source}</strong>
                    </span>
                    <span style={{ color: "#d1d5db" }}>•</span>
                    <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                      Author: {art.author || "Unknown"}
                    </span>
                  </div>

                  <h3 style={{ fontSize: "1.15rem", fontWeight: "700", margin: "0 0 10px 0", color: "#111827", lineHeight: "1.4" }}>
                    {art.title}
                  </h3>

                  <p style={{ fontSize: "0.88rem", color: "#4b5563", margin: "0 0 16px 0", lineHeight: "1.6" }}>
                    {art.description}
                  </p>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
                    <span style={{ fontSize: "0.78rem", color: "#9ca3af" }}>
                      Published: {new Date(art.publishedAt).toLocaleString()}
                    </span>
                    <a href={art.url} target="_blank" rel="noopener noreferrer" style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      background: "#7c3aed",
                      color: "#ffffff",
                      textDecoration: "none",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      fontSize: "0.82rem",
                      fontWeight: "600",
                      transition: "opacity 0.2s ease"
                    }}>
                      Read Original Headline ↗
                    </a>
                  </div>
                </div>

                {art.image && (
                  <div style={{ flex: "0 0 120px", maxWidth: "120px", height: "120px", borderRadius: "8px", overflow: "hidden", border: "1px solid #e5e7eb" }}>
                    <img src={art.image} alt={art.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
