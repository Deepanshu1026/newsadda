import Link from "next/link";
import { notFound } from "next/navigation";
import ViewIncrementer from "../../../../components/ViewIncrementer";
import { readDatabase } from "../../../../services/db";

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

// Generate Dynamic SEO Metadata for search engine indexation
export async function generateMetadata({ params }) {
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) {
    return {
      title: "Article Not Found | NewsAdda",
      description: "The requested news blog article could not be located.",
    };
  }

  return {
    title: `${post.title} | NewsAdda`,
    description: post.description,
    keywords: `${post.category?.toLowerCase()}, tech news, newsadda, AI article`,
    openGraph: {
      title: `${post.title} | NewsAdda`,
      description: post.description,
      url: `https://newsadda.com/posts/${post.id}`,
      images: [
        {
          url: post.image,
          alt: post.title,
        },
      ],
      type: "article",
      publishedTime: post.publishedAt,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [post.image],
    },
  };
}

export default async function ArticlePage({ params }) {
  const { id } = await params;
  const post = await getPostById(id);

  if (!post) {
    notFound();
  }

  // Simple, elegant Markdown to React parser for standard markup formatting
  const parseMarkdownToReact = (text) => {
    if (!text) return null;
    
    const lines = text.split("\n");
    let elements = [];
    let listItems = [];
    let insideCodeBlock = false;
    let codeContent = [];
    let codeLanguage = "";

    lines.forEach((line, index) => {
      // Handle Code Blocks
      if (line.trim().startsWith("```")) {
        if (insideCodeBlock) {
          // Closing code block
          elements.push(
            <pre key={`code-${index}`}>
              <code className={codeLanguage}>{codeContent.join("\n")}</code>
            </pre>
          );
          codeContent = [];
          insideCodeBlock = false;
        } else {
          // Opening code block
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
        elements.push(<ul key={`list-group-${index}`}>{listItems}</ul>);
        listItems = [];
      }

      // Handle Headings
      if (line.startsWith("### ")) {
        elements.push(<h3 key={index}>{line.replace("### ", "")}</h3>);
      } else if (line.startsWith("## ")) {
        elements.push(<h2 key={index}>{line.replace("## ", "")}</h2>);
      } else if (line.startsWith("# ")) {
        elements.push(<h1 key={index}>{line.replace("# ", "")}</h1>);
      }
      // Handle Blockquotes
      else if (line.startsWith("> ")) {
        elements.push(<blockquote key={index}>{line.replace("> ", "")}</blockquote>);
      }
      // Handle List Items
      else if (line.trim().startsWith("* ") || line.trim().startsWith("- ")) {
        const itemText = line.replace(/^[\s*-]+/, "").trim();
        listItems.push(<li key={`li-${index}`}>{parseInlineStyles(itemText)}</li>);
      } else if (line.trim().match(/^\d+\.\s/)) {
        const itemText = line.replace(/^\d+\.\s/, "").trim();
        listItems.push(<li key={`li-num-${index}`}>{parseInlineStyles(itemText)}</li>);
      }
      // Handle Empty Lines
      else if (line.trim() === "") {
        // Do nothing
      }
      // Handle Standard Paragraphs
      else {
        elements.push(<p key={index}>{parseInlineStyles(line)}</p>);
      }
    });

    // Flush any remaining list items
    if (listItems.length > 0) {
      elements.push(<ul key="list-group-final">{listItems}</ul>);
    }

    return elements;
  };

  // Inline formatting helper for Bold (**) and Code (`) tags
  const parseInlineStyles = (lineText) => {
    const parts = [];
    let currentIdx = 0;
    
    // Regular expression matching bold or inline code blocks
    const regex = /(\*\*.*?\*\*|`.*?`)/g;
    let match;
    
    while ((match = regex.exec(lineText)) !== null) {
      const matchText = match[0];
      const matchIndex = match.index;
      
      // Append text before match
      if (matchIndex > currentIdx) {
        parts.push(lineText.substring(currentIdx, matchIndex));
      }
      
      // Append styled match
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

  return (
    <div className="main-wrapper">
      <div className="article-container">
        {/* Silent component to increment impressions */}
        <ViewIncrementer id={post.id} />
        
        <Link href="/" className="article-back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span>Back to Feed Dashboard</span>
        </Link>

        <article>
          <header className="article-header">
            <span className="article-category">{post.category}</span>
            <h1 className="article-title">{post.title}</h1>
            <div className="article-meta">
              <span>By <strong>{post.author}</strong></span>
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

          <div className="article-image-wrapper">
            <img src={post.image} alt={post.title} className="article-image" />
          </div>

          <div className="article-content">
            {parseMarkdownToReact(post.content)}
          </div>
        </article>
      </div>
    </div>
  );
}
