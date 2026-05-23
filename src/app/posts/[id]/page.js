import Link from "next/link";
import { notFound } from "next/navigation";
import ViewIncrementer from "../../../../components/ViewIncrementer";
import { readDatabase } from "../../../../services/db";
import { SEO_CONFIG, getCanonicalUrl } from "../../../../services/seo/config";
import JsonLd from "../../../../components/seo/JsonLd";
import { getNewsArticleSchema, getBreadcrumbSchema, getFaqSchema } from "../../../../services/seo/schema";
import PerformanceImage from "../../../../components/seo/PerformanceImage";
import SafeAdSlot from "../../../../components/seo/SafeAdSlot";
import DynamicToc from "../../../../components/layout/DynamicToc";

export const dynamic = "force-dynamic";

async function getPostById(id) {
  try {
    const posts = await readDatabase();
    return posts.find((p) => p.id === id);
  } catch (error) {
    console.error(`[Article Page] Error reading post ID ${id}:`, error.message);
    return null;
  }
}

// Generate Dynamic SEO Metadata for Google Discover, Google News, and indexation
export async function generateMetadata({ params }) {
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) {
    return {
      title: "Article Not Found | NewsAdda",
      description: "The requested news blog article could not be located.",
    };
  }

  const categoryKeyword = post.category ? `${post.category.toLowerCase()}, ` : "";
  const authorSlug = (post.author || SEO_CONFIG.defaultAuthor).toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return {
    title: `${post.title} | ${SEO_CONFIG.siteName}`,
    description: post.description,
    keywords: `${categoryKeyword}tech news, newsadda, AI article, trending updates, organic search`,
    alternates: {
      canonical: getCanonicalUrl(`/posts/${post.id}`),
    },
    other: {
      // Directives for Google Discover and Google News high-resolution layout slots
      robots: "max-image-preview:large, index, follow"
    },
    openGraph: {
      title: `${post.title} | ${SEO_CONFIG.siteName}`,
      description: post.description,
      url: getCanonicalUrl(`/posts/${post.id}`),
      images: [
        {
          url: post.image || SEO_CONFIG.publisher.logoUrl,
          alt: post.title,
        },
      ],
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.publishedAt,
      authors: [getCanonicalUrl(`/author/${authorSlug}`)]
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [post.image || SEO_CONFIG.publisher.logoUrl],
      creator: SEO_CONFIG.socials.twitter
    },
  };
}

export default async function ArticlePage({ params }) {
  const { id } = await params;
  const post = await getPostById(id);

  if (!post) {
    notFound();
  }

  // Load all posts to compile related and trending lists
  const allPosts = await readDatabase();
  
  // Related posts (same category, excluding current post)
  const relatedPosts = allPosts
    .filter(p => p.category === post.category && p.id !== post.id)
    .slice(0, 3);

  // Trending posts (based on views, excluding current post)
  const trendingPosts = allPosts
    .filter(p => p.id !== post.id)
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 4);

  // Compile JSON-LD schemas
  const articleSchema = getNewsArticleSchema(post);
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: post.category || "News", url: `/category/${(post.category || "news").toLowerCase()}` },
    { name: post.title, url: `/posts/${post.id}` }
  ]);

  // Extract FAQ items from Markdown headings for rich semantic search snippets
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
  const faqSchema = getFaqSchema(parseFaqsFromContent(post.content));

  // Simple, elegant Markdown to React parser for standard markup formatting
  const parseMarkdownToReact = (text) => {
    if (!text) return null;
    
    const lines = text.split("\n");
    let elements = [];
    let listItems = [];
    let insideCodeBlock = false;
    let codeContent = [];
    let codeLanguage = "";
    let keyIndex = 0;

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
      if (line.startsWith("### ")) {
        const titleText = line.replace("### ", "").trim();
        const headingId = titleText.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        elements.push(<h3 key={keyIndex} id={headingId} style={{ fontSize: "1.4rem", fontWeight: "700", marginTop: "24px", marginBottom: "12px" }}>{titleText}</h3>);
      } else if (line.startsWith("## ")) {
        const titleText = line.replace("## ", "").trim();
        const headingId = titleText.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        elements.push(<h2 key={keyIndex} id={headingId} style={{ fontSize: "1.8rem", fontWeight: "800", marginTop: "28px", marginBottom: "16px" }}>{titleText}</h2>);
      } else if (line.startsWith("# ")) {
        const titleText = line.replace("# ", "").trim();
        const headingId = titleText.toLowerCase().replace(/[^a-z0-9]+/g, "-");
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
  };

  // Inline formatting helper for Bold (**) and Code (`) tags
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

  const authorSlug = (post.author || SEO_CONFIG.defaultAuthor).toLowerCase().replace(/[^a-z0-9]+/g, "-");
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
            <article style={{ maxWidth: "800px", margin: "0 auto" }}>
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
                      {post.author || SEO_CONFIG.defaultAuthor}
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
                  <Link key={rPost.id} href={`/posts/${rPost.id}`} style={{ display: "block", textDecoration: "none", color: "inherit" }}>
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
                  <Link key={tPost.id} href={`/posts/${tPost.id}`} style={{ display: "block", textDecoration: "none", color: "inherit" }}>
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
