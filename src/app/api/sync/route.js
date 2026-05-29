import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { fetchLatestNews } from "../../../../services/newsService";
import { generateBlogArticle, generateHindiBlogArticle } from "../../../../services/sarvamService";
import { readDatabase, writeDatabase } from "../../../../services/db";

function getCategoryImage(category) {
  const images = {
    technology: [
      "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?q=80&w=1200&auto=format&fit=crop"
    ],
    science: [
      "https://images.unsplash.com/photo-1507668077129-56e32842fceb?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?q=80&w=1200&auto=format&fit=crop"
    ],
    business: [
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1200&auto=format&fit=crop"
    ]
  };

  const catList = images[category.toLowerCase()] || images.technology;
  const randomIndex = Math.floor(Math.random() * catList.length);
  return catList[randomIndex];
}

// Basic completeness guard: checks word count and ending punctuation
function isContentComplete(text) {
  if (!text || typeof text !== "string") return false;
  const words = text.trim().split(/\s+/).length;
  if (words < 200) return false;
  const lastChar = text.trim().slice(-1);
  const properEndings = new Set([".", "!", "?", '"', "'", "”", "'", "।"]);
  if (!properEndings.has(lastChar)) return false;
  return true;
}

// Fuzzy deduplication to avoid content cannibalization
function normalizeTitle(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s\u0900-\u097F]/g, "") // keep Devanagari
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

function isSimilarTitle(a, b, threshold = 0.55) {
  const wordsA = new Set(normalizeTitle(a));
  const wordsB = new Set(normalizeTitle(b));
  if (wordsA.size === 0 || wordsB.size === 0) return false;
  const intersection = new Set([...wordsA].filter((w) => wordsB.has(w)));
  const union = new Set([...wordsA, ...wordsB]);
  return intersection.size / union.size >= threshold;
}

export async function GET() {
  return POST();
}

export async function POST() {
  try {
    console.log("[Sync API] Triggering synchronization pipeline...");
    global.lastSyncTime = new Date().toISOString();

    let posts = await readDatabase();

    // Support mixed English + Hindi categories, e.g. "technology,hi-politics,science"
    const categoriesStr = process.env.CRON_CATEGORIES || "technology,science,business";
    const categories = categoriesStr.split(",").map((c) => c.trim().toLowerCase());

    let addedCount = 0;
    const maxPostsToGenerate = 2; // Allow up to 2 per cycle (e.g. 1 EN + 1 HI)

    for (const category of categories) {
      if (addedCount >= maxPostsToGenerate) break;

      const isHindi = category.startsWith("hi-");
      const newsCategory = isHindi ? category.replace("hi-", "") : category;

      console.log(`[Sync API] Querying headlines for category: ${category}`);
      const headlines = await fetchLatestNews(newsCategory);

      for (const headline of headlines) {
        if (addedCount >= maxPostsToGenerate) break;

        const titleExists = posts.some(
          (p) =>
            (p.language || "en") === (isHindi ? "hi" : "en") &&
            (p.title.toLowerCase().trim() === headline.title.toLowerCase().trim() ||
             isSimilarTitle(p.title, headline.title))
        );
        if (titleExists) {
          console.log(`[Sync API] Skipping duplicate/similar headline [${isHindi ? "hi" : "en"}]: ${headline.title}`);
          continue;
        }

        console.log(`[Sync API] Processing new headline [${isHindi ? "hi" : "en"}]: ${headline.title}`);

        // Generate content (Hindi or English)
        let content = isHindi
          ? await generateHindiBlogArticle(headline.title, headline.description, newsCategory)
          : await generateBlogArticle(headline.title, headline.description, newsCategory);

        // Guard against incomplete / too-short generations: retry once if needed
        if (!isContentComplete(content)) {
          console.warn("[Sync API] Content looks incomplete. Retrying generation once...");
          const retryContent = isHindi
            ? await generateHindiBlogArticle(headline.title, headline.description, newsCategory)
            : await generateBlogArticle(headline.title, headline.description, newsCategory);
          if (isContentComplete(retryContent)) {
            content = retryContent;
          } else {
            console.warn("[Sync API] Retry still incomplete; keeping best-effort text.");
          }
        }

        let slug = headline.title
          .toLowerCase()
          .replace(/[^a-z0-9\u0900-\u097F]+/g, "-") // allow Devanagari for slug safety
          .replace(/(^-|-$)/g, "");

        if (!slug) slug = isHindi ? `hi-${Date.now()}` : `post-${Date.now()}`;
        if (posts.some((p) => p.id === slug)) {
          slug = `${slug}-${Date.now().toString().slice(-4)}`;
        }

        const newPost = {
          id: slug,
          title: headline.title,
          description: headline.description,
          category: newsCategory.charAt(0).toUpperCase() + newsCategory.slice(1),
          image: headline.image || getCategoryImage(newsCategory),
          content: content,
          publishedAt: new Date().toISOString(),
          readTime: `${Math.max(3, Math.ceil(content.split(/\s+/).length / 200))} min read`,
          views: 0,
          author: headline.author || "NewsAdda Editorial",
          language: isHindi ? "hi" : "en"
        };

        posts = [newPost, ...posts];
        addedCount++;
        console.log(`[Sync API] Successfully generated and added article [${newPost.language}]: ${slug}`);
      }
    }

    if (addedCount > 0) {
      await writeDatabase(posts);
      revalidatePath("/");
    }

    return NextResponse.json({
      success: true,
      addedCount: addedCount,
      message:
        addedCount > 0
          ? `Successfully ingested ${addedCount} new AI-generated articles!`
          : "Database is already fully synchronized with latest news."
    });
  } catch (error) {
    console.error("[Sync API] Error executing synchronization pipeline:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
