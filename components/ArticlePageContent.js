import Link from "next/link";
import ViewIncrementer from "./ViewIncrementer";
import { SEO_CONFIG, getCanonicalUrl } from "../services/seo/config";
import { getPostUrl } from "../lib/utils";
import { getAuthorProfile } from "../services/authorService";
import JsonLd from "./seo/JsonLd";
import { getNewsArticleSchema, getBreadcrumbSchema, getFaqSchema } from "../services/seo/schema";
import PerformanceImage from "./seo/PerformanceImage";
import SafeAdSlot from "./seo/SafeAdSlot";
import DynamicToc from "./layout/DynamicToc";

function parseMarkdownToReact(text) {
  if (!text) return null;

  const lines = text.split("\n");
  let elements = [];
  let listItems = [];
  let insideCodeBlock = false;
  let codeContent = [];
  let codeLanguage = "";
  let keyIndex = 0;

  const parseInlineStyles = (lineText) => {
    const parts = [];
    let currentIdx = 0;
    const regex = /(\*\*.*?\*\*|`.*?`)/g;
    let match;

    while ((match = regex.exec(lineText)) !== null) {
      const matchText = match[0];
      const matchIndex = match.index;

      if (matchIndex > currentIdx) {
        parts.push(lineText.substring(currentIdx, matchIndex));
      }

      if (matchText.startsWith("**") && matchText.endsWith("**")) {
        parts.push(<strong key={matchIndex}>{matchText.slice(2, -2)}</strong>);
      } else if (matchText.startsWith("`") && matchText.endsWith("`")) {
        parts.push(<code key={matchIndex}>{matchText.slice(1, -1)}</code>);
      }

      currentIdx = regex.lastIndex;
    }

    if (currentIdx < lineText.length) {
      parts.push(lineText.substring(currentIdx));
    }

    return parts.length > 0 ? parts : lineText;
  };

  lines.forEach((line) => {
    keyIndex++;

    // Handle Code Blocks
    if (line.trim().startsWith("```")) {
      if (insideCodeBlock) {
        elements.push(
          <pre key={`code-${keyIndex}`}>
            <code className={codeLanguage}>{codeContent.join("\n")}</code>
          </pre>
        );
        codeContent = [];
        insideCodeBlock = false;
      } else {
        codeLanguage = line.replace("```", "").trim() || "javascript";
        insideCodeBlock = true;
      }
      return;
    }

    if (insideCodeBlock) {
      codeContent.push(line);
      return;
    }

    // Flush lists if we hit a non-list line
    if (!line.trim().startsWith("* ") && !line.trim().match(/^\d+\.\s/) && listItems.length > 0) {
      elements.push(<ul key={`list-group-${keyIndex}`} style={{ paddingLeft: "20px", marginBottom: "16px" }}>{listItems}</ul>);
      listItems = [];
    }

    // Handle Headings with clean id parameters for Table of Contents linkage
    if (line.startsWith("##### ")) {
      const titleText = line.replace("##### ", "").trim();
      const headingId = titleText.toLowerCase().replace(/[^a-z0-9\u0900-\u097F]+/g, "-");
      elements.push(<h5 key={keyIndex} id={headingId} style={{ fontSize: "1.15rem", fontWeight: "700", marginTop: "20px", marginBottom: "10px" }}>{titleText}</h5>);
    } else if (line.startsWith("#### ")) {
      const titleText = line.replace("#### ", "").trim();
      const headingId = titleText.toLowerCase().replace(/[^a-z0-9\u0900-\u097F]+/g, "-");
      elements.push(<h4 key={keyIndex} id={headingId} style={{ fontSize: "1.25rem", fontWeight: "700", marginTop: "22px", marginBottom: "10px" }}>{titleText}</h4>);
    } else if (line.startsWith("### ")) {
      const titleText = line.replace("### ", "").trim();
      const headingId = titleText.toLowerCase().replace(/[^a-z0-9\u0900-\u097F]+/g, "-");
      elements.push(<h3 key={keyIndex} id={headingId} style={{ fontSize: "1.4rem", fontWeight: "700", marginTop: "24px", marginBottom: "12px" }}>{titleText}</h3>);
    } else if (line.startsWith("## ")) {
      const titleText = line.replace("## ", "").trim();
      const headingId = titleText.toLowerCase().replace(/[^a-z0-9\u0900-\u097F]+/g, "-");
      elements.push(<h2 key={keyIndex} id={headingId} style={{ fontSize: "1.8rem", fontWeight: "800", marginTop: "28px", marginBottom: "16px" }}>{titleText}</h2>);
    } else if (line.startsWith("# ")) {
      const titleText = line.replace("# ", "").trim();
      const headingId = titleText.toLowerCase().replace(/[^a-z0-9\u0900-\u097F]+/g, "-");
      elements.push(<h1 key={keyIndex} id={headingId} style={{ fontSize: "2.2rem", fontWeight: "800", marginTop: "32px", marginBottom: "20px" }}>{titleText}</h1>);
    }
    // Handle Blockquotes
    else if (line.startsWith("> ")) {
      elements.push(<blockquote key={keyIndex} style={{ borderLeft: "4px solid var(--accent-primary)", paddingLeft: "16px", fontStyle: "italic", margin: "20px 0", color: "var(--text-secondary)" }}>{line.replace("> ", "")}</blockquote>);
    }
    // Handle List Items
    else if (line.trim().startsWith("* ") || line.trim().startsWith("- ")) {
      const itemText = line.replace(/^[\s*-]+/, "").trim();
      listItems.push(<li key={`li-${keyIndex}`} style={{ marginBottom: "6px" }}>{parseInlineStyles(itemText)}</li>);
    } else if (line.trim().match(/^\d+\.\s/)) {
      const itemText = line.replace(/^\d+\.\s/, "").trim();
      listItems.push(<li key={`li-num-${keyIndex}`} style={{ marginBottom: "6px" }}>{parseInlineStyles(itemText)}</li>);
    }
    // Handle Empty Lines
    else if (line.trim() === "") {
      // Do nothing
    }
    // Handle Standard Paragraphs
    else {
      elements.push(<p key={keyIndex} style={{ fontSize: "1.05rem", lineHeight: "1.7", marginBottom: "18px", color: "var(--text-secondary)" }}>{parseInlineStyles(line)}</p>);
    }
  });

  // Flush any remaining list items
  if (listItems.length > 0) {
    elements.push(<ul key="list-group-final" style={{ paddingLeft: "20px", marginBottom: "16px" }}>{listItems}</ul>);
  }

  return elements;
}

const formatDate = (dateStr) => {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch (e) {
    return dateStr;
  }
};

const parseFaqsFromContent = (text) => {
  if (!text) return [];
  const questions = [];
  const h3s = text.match(/###\s+(.*)/g) || [];
  h3s.slice(0, 3).forEach((h3, i) => {
    const q = h3.replace("### ", "").trim();
    questions.push({
      q: q,
      a: `Read detailed insights, expert views, and full analytical timelines regarding ${q} on NewsAdda's comprehensive article.`
    });
  });
  return questions;
};

export default function ArticlePageContent({ post, relatedPosts, trendingPosts, lang = "en" }) {
  const articleSchema = getNewsArticleSchema(post);
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: post.category || "News", url: `/category/${(post.category || "news").toLowerCase()}` },
    { name: post.title, url: `/posts/${post.id}` }
  ]);
  const faqSchema = getFaqSchema(parseFaqsFromContent(post.content));

  const authorProfile = getAuthorProfile(post.author || SEO_CONFIG.defaultAuthor);
  const authorSlug = authorProfile.slug;
  const categorySlug = (post.category || "news").toLowerCase();

  return (
    <div className="main-wrapper">
      {/* Schema injections */}
      <JsonLd schema={articleSchema} />
      <JsonLd schema={breadcrumbSchema} />
      {faqSchema && <JsonLd schema={faqSchema} />}

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "30px 20px",
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "40px"
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px" }}>

          <Link href="/" className="article-back-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <span>Back to Feed Dashboard</span>
          </Link>

          {/* Ad slot reserving top space */}
          <SafeAdSlot slotType="leaderboard" />

          {/* Article Container */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr lg:3fr", gap: "32px" }}>

            {/* Main content column */}
            <article style={{ maxWidth: "800px", margin: "0 auto" }} lang={lang}>
              {/* Silent component to increment impressions */}
              <ViewIncrementer id={post.id} />

              <header className="article-header">
                <Link href={`/category/${categorySlug}`} style={{ textDecoration: "none" }}>
                  <span className="article-category">{post.category}</span>
                </Link>
                <h1 className="article-title">{post.title}</h1>
                <div className="article-meta">
                  <span>
                    By <Link href={`/author/${authorSlug}`} style={{ color: "var(--accent-primary)", fontWeight: "600", textDecoration: "none" }}>
                      {authorProfile.name}
                    </Link>
                  </span>
                  <span>•</span>
                  <span>{formatDate(post.publishedAt)}</span>
                  <span>•</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    {post.views || 0} views
                  </span>
                  <span>•</span>
                  <span>{post.readTime}</span>
                </div>
              </header>

              {/* CLS-free lazy-loaded main post image with high LCP priority */}
              <div style={{ margin: "24px 0" }}>
                <PerformanceImage src={post.image} alt={post.title} priority={true} aspectRatio="16/9" />
              </div>

              {/* Dynamic scroll-linked Table of Contents */}
              <DynamicToc selector=".article-content" />

              <div className="article-content">
                {parseMarkdownToReact(post.content)}
              </div>

              {/* Premium Author Bio Box */}
              <div 
                style={{ 
                  marginTop: "48px",
                  padding: "32px",
                  borderRadius: "16px",
                  backgroundColor: "var(--bg-surface, rgba(255, 255, 255, 0.88))",
                  border: "1px solid var(--border-subtle)",
                  boxShadow: "var(--card-shadow)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  display: "flex",
                  flexDirection: "row",
                  gap: "24px",
                  alignItems: "flex-start",
                  flexWrap: "wrap"
                }}
                className="author-bio-card"
              >
                {/* Left Column: Avatar */}
                <div 
                  style={{ 
                    width: "72px", 
                    height: "72px", 
                    borderRadius: "50%", 
                    backgroundColor: authorProfile.avatarColor || "var(--accent-primary)",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.75rem",
                    fontWeight: "800",
                    fontFamily: "var(--font-display)",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                    flexShrink: 0
                  }}
                >
                  {authorProfile.name.charAt(0)}
                </div>

                {/* Right Column: Bio info */}
                <div style={{ flex: "1 1 300px" }}>
                  <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "4px" }}>
                    <Link 
                      href={`/author/${authorProfile.slug}`}
                      style={{ 
                        fontSize: "1.25rem", 
                        fontWeight: "800", 
                        color: "var(--text-primary)", 
                        textDecoration: "none",
                        fontFamily: "var(--font-display)"
                      }}
                    >
                      {authorProfile.name}
                    </Link>
                    {authorProfile.verified && (
                      <span 
                        style={{ 
                          backgroundColor: "rgba(22, 163, 74, 0.08)", 
                          color: "var(--accent-success, #16a34a)", 
                          fontSize: "0.72rem", 
                          fontWeight: "700", 
                          padding: "3px 8px", 
                          borderRadius: "20px",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          border: "1px solid rgba(22, 163, 74, 0.15)"
                        }}
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        VERIFIED WRITER
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-muted)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {authorProfile.title}
                  </div>

                  <p style={{ fontSize: "0.95rem", lineHeight: "1.6", color: "var(--text-secondary)", margin: "0 0 16px 0" }}>
                    {authorProfile.shortBio}
                  </p>

                  {/* Expertise pills & Socials Row */}
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "16px", borderTop: "1px solid var(--border-subtle)", paddingTop: "16px" }}>
                    {/* Expertise tags */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {authorProfile.expertise && authorProfile.expertise.slice(0, 3).map((exp, idx) => (
                        <span 
                          key={idx} 
                          style={{ 
                            fontSize: "0.75rem", 
                            fontWeight: "600", 
                            backgroundColor: "var(--bg-pill, #f4f4f5)", 
                            color: "var(--text-secondary)", 
                            padding: "4px 10px", 
                            borderRadius: "6px",
                            border: "1px solid var(--border-subtle)"
                          }}
                        >
                          {exp}
                        </span>
                      ))}
                    </div>

                    {/* Social channels */}
                    <div style={{ display: "flex", gap: "16px" }}>
                      {authorProfile.socials?.twitter && (
                        <a 
                          href={authorProfile.socials.twitter} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          style={{ color: "var(--accent-primary)", fontSize: "0.82rem", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "4px" }}
                        >
                          Twitter ↗
                        </a>
                      )}
                      {authorProfile.socials?.linkedin && (
                        <a 
                          href={authorProfile.socials.linkedin} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          style={{ color: "var(--accent-primary)", fontSize: "0.82rem", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "4px" }}
                        >
                          LinkedIn ↗
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Intermediate Ad slot */}
              <SafeAdSlot slotType="leaderboard" />
            </article>
          </div>

          <hr style={{ border: 0, borderTop: "1px solid var(--border-subtle)", margin: "40px 0" }} />

          {/* Related Articles Engine */}
          {relatedPosts.length > 0 && (
            <section style={{ maxWidth: "800px", margin: "0 auto 40px" }}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: "800", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "4px", height: "24px", backgroundColor: "#0f172a", borderRadius: "2px", display: "inline-block" }} />
                Related Coverage
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
                {relatedPosts.map((rPost) => (
                  <Link key={rPost.id} href={getPostUrl(rPost)} style={{ display: "block", textDecoration: "none", color: "inherit" }}>
                    <article style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <PerformanceImage src={rPost.image} alt={rPost.title} aspectRatio="16/9" />
                      <h3 style={{ fontSize: "0.95rem", fontWeight: "700", lineHeight: "1.3" }}>{rPost.title}</h3>
                    </article>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Trending Articles Block */}
          {trendingPosts.length > 0 && (
            <section style={{ maxWidth: "800px", margin: "0 auto" }}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: "800", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "4px", height: "24px", backgroundColor: "#0f172a", borderRadius: "2px", display: "inline-block" }} />
                Trending on NewsAdda
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
                {trendingPosts.map((tPost) => (
                  <Link key={tPost.id} href={getPostUrl(tPost)} style={{ display: "block", textDecoration: "none", color: "inherit" }}>
                    <article style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <PerformanceImage src={tPost.image} alt={tPost.title} aspectRatio="16/9" />
                      <h3 style={{ fontSize: "0.95rem", fontWeight: "700", lineHeight: "1.3" }}>{tPost.title}</h3>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {tPost.views || 0} views
                      </span>
                    </article>
                  </Link>
                ))}
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  );
}
