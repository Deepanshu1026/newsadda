import { NextResponse } from "next/server";
import { fetchLatestNews } from "../../../../services/newsService";
import { generateBlogArticle } from "../../../../services/sarvamService";
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

export async function GET() {
  return POST();
}

export async function POST() {
  try {
    console.log("[Sync API] Triggering synchronization pipeline...");
    global.lastSyncTime = new Date().toISOString();
    global.lastSyncTime = new Date().toISOString(); // Maintain compatibility for dashboard caching
    
    // Read existing database
    let posts = await readDatabase();

    const categoriesStr = process.env.CRON_CATEGORIES || "technology,science,business";
    const categories = categoriesStr.split(",").map(c => c.trim().toLowerCase());
    
    let addedCount = 0;
    const maxPostsToGenerate = 1; // Safeguard execution time and API rate limits per sync cycle

    // Pull news headlines across categories
    for (const category of categories) {
      if (addedCount >= maxPostsToGenerate) break;
      
      console.log(`[Sync API] Querying headlines for category: ${category}`);
      const headlines = await fetchLatestNews(category);
      
      for (const headline of headlines) {
        if (addedCount >= maxPostsToGenerate) break;

        // Check if article title already exists in database
        const titleExists = posts.some(p => p.title.toLowerCase().trim() === headline.title.toLowerCase().trim());
        if (titleExists) {
          console.log(`[Sync API] Skipping duplicate headline: ${headline.title}`);
          continue;
        }

        console.log(`[Sync API] Processing new headline: ${headline.title}`);
        
        // Generate article content via Gemini
        const content = await generateBlogArticle(headline.title, headline.description, category);
        
        // Generate robust dynamic URL slug
        let slug = headline.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
          
        if (posts.some(p => p.id === slug)) {
          slug = `${slug}-${Date.now().toString().slice(-4)}`;
        }

        const newPost = {
          id: slug,
          title: headline.title,
          description: headline.description,
          category: category.charAt(0).toUpperCase() + category.slice(1),
          image: headline.image || getCategoryImage(category),
          content: content,
          publishedAt: new Date().toISOString(),
          readTime: `${Math.max(3, Math.ceil(content.split(/\s+/).length / 200))} min read`,
          views: 0,
          author: headline.author || "NewsAdda Editorial"
        };

        // Prepend new article to database list
        posts = [newPost, ...posts];
        addedCount++;
        console.log(`[Sync API] Successfully generated and added article: ${slug}`);
      }
    }

    if (addedCount > 0) {
      // Save updated database
      await writeDatabase(posts);
    }

    return NextResponse.json({
      success: true,
      message: addedCount > 0 ? `Successfully ingested ${addedCount} new AI-generated articles!` : "Database is already fully synchronized with latest news."
    });
  } catch (error) {
    console.error("[Sync API] Error executing synchronization pipeline:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
