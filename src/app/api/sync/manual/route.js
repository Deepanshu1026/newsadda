import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { generateBlogArticle, generateHindiBlogArticle, generateHinglishBlogArticle } from "../../../../../services/sarvamService";
import { readDatabase, writeDatabase } from "../../../../../services/db";

// Allow enough time for a batch of AI generations on Vercel.
export const maxDuration = 60;
export const dynamic = "force-dynamic";

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
    ],
    politics: [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=1200&auto=format&fit=crop"
    ],
    cricket: [
      "https://images.unsplash.com/photo-1531415080290-bc98545ab2ef?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1540747737956-37872404a8de?q=80&w=1200&auto=format&fit=crop"
    ]
  };

  const cat = (category || "").toLowerCase().trim();
  const catList = images[cat] || images.technology;
  const randomIndex = Math.floor(Math.random() * catList.length);
  return catList[randomIndex];
}

function slugify(title, language) {
  let slug = String(title || "")
    .toLowerCase()
    .replace(/[^a-z0-9\u0900-\u097F]+/g, "-")
    .replace(/(^-|-$)/g, "");
  if (!slug) {
    slug = `${language === "hi" ? "hi" : language === "hinglish" ? "hinglish" : "post"}-${Date.now()}`;
  }
  return slug;
}

/** Run async workers over items with a bounded concurrency limit. */
async function mapWithConcurrency(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  async function run() {
    while (cursor < items.length) {
      const i = cursor++;
      results[i] = await worker(items[i], i);
    }
  }
  const poolSize = Math.max(1, Math.min(limit, items.length));
  await Promise.all(Array.from({ length: poolSize }, run));
  return results;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { articles, language = "en" } = body;

    if (!articles || !Array.isArray(articles) || articles.length === 0) {
      return NextResponse.json(
        { success: false, error: "No articles provided for generation" },
        { status: 400 }
      );
    }

    const langLabel = language === "hi" ? "Hindi" : language === "hinglish" ? "Hinglish" : "English";
    console.log(`[Manual Sync API] Bulk generating ${langLabel} blogs for ${articles.length} selected articles...`);

    // Read existing database
    let posts = await readDatabase();

    // Pre-filter duplicates against the DB and within this batch
    const existingKeys = new Set(
      posts.map((p) => `${p.language || "en"}::${(p.title || "").toLowerCase().trim()}`)
    );
    const seenInBatch = new Set();
    const candidates = [];
    for (const article of articles) {
      const title = (article?.title || "").trim();
      if (!title) continue;
      const key = `${language}::${title.toLowerCase()}`;
      if (existingKeys.has(key) || seenInBatch.has(key)) {
        console.log(`[Manual Sync API] Skipping duplicate article [${language}]: ${title}`);
        continue;
      }
      seenInBatch.add(key);
      candidates.push(article);
    }

    // Generate content in parallel (bounded concurrency to respect API limits)
    const generated = await mapWithConcurrency(candidates, 4, async (article) => {
      const { title, description, category, image, author } = article;
      console.log(`[Manual Sync API] Writing [${language}] article via Sarvam: ${title}`);

      let content;
      try {
        if (language === "hi") {
          content = await generateHindiBlogArticle(title, description, category);
        } else if (language === "hinglish") {
          content = await generateHinglishBlogArticle(title, description, category);
        } else {
          content = await generateBlogArticle(title, description, category);
        }
      } catch (err) {
        console.error(`[Manual Sync API] Generation failed for "${title}":`, err.message);
        return { error: title, message: err.message };
      }

      if (!content || typeof content !== "string") {
        return { error: title, message: "Empty content returned" };
      }

      return {
        title,
        description: description || "Latest automated trending update.",
        category,
        image,
        author,
        content,
      };
    });

    const successes = generated.filter((g) => g && !g.error);
    const failures = generated.filter((g) => g && g.error);

    // Build new post objects with unique slugs
    const newlyGeneratedPosts = [];
    for (const g of successes) {
      let slug = slugify(g.title, language);
      if (posts.some((p) => p.id === slug) || newlyGeneratedPosts.some((p) => p.id === slug)) {
        slug = `${slug}-${Date.now().toString().slice(-4)}`;
      }

      const newPost = {
        id: slug,
        title: g.title,
        description: g.description,
        category: (g.category || "news").charAt(0).toUpperCase() + (g.category || "news").slice(1),
        image: g.image || getCategoryImage(g.category),
        content: g.content,
        publishedAt: new Date().toISOString(),
        readTime: `${Math.max(3, Math.ceil(g.content.split(/\s+/).length / 200))} min read`,
        views: 0,
        author: g.author || "NewsAdda India Desk",
        language,
      };

      newlyGeneratedPosts.push(newPost);
    }

    if (newlyGeneratedPosts.length > 0) {
      posts = [...newlyGeneratedPosts, ...posts];
      await writeDatabase(posts);
      revalidatePath("/");
    }

    return NextResponse.json({
      success: true,
      generatedCount: newlyGeneratedPosts.length,
      failedCount: failures.length,
      articles: newlyGeneratedPosts.map((p) => ({ id: p.id, title: p.title })),
      failures: failures.map((f) => ({ title: f.error, message: f.message })),
    });
  } catch (error) {
    console.error("[Manual Sync API] Bulk generation error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
