import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { generateBlogArticle } from "../../../../../services/sarvamService";
import { readDatabase, writeDatabase } from "../../../../../services/db";

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

export async function POST(request) {
  try {
    const body = await request.json();
    const { articles } = body;
    
    if (!articles || !Array.isArray(articles) || articles.length === 0) {
      return NextResponse.json(
        { success: false, error: "No articles provided for generation" },
        { status: 400 }
      );
    }

    console.log(`[Manual Sync API] Bulk generating blogs for ${articles.length} selected articles...`);
    
    // Read existing database
    let posts = await readDatabase();
    let generatedCount = 0;
    const newlyGeneratedPosts = [];

    for (const article of articles) {
      const { title, description, category, image, author } = article;
      
      // 1. Double check for duplicates
      const titleExists = posts.some(p => p.title.toLowerCase().trim() === title.toLowerCase().trim());
      if (titleExists) {
        console.log(`[Manual Sync API] Skipping duplicate article: ${title}`);
        continue;
      }

      console.log(`[Manual Sync API] Writing article via Sarvam: ${title}`);
      
      // 2. Generate blog content via Sarvam
      const content = await generateBlogArticle(title, description, category);
      
      // 3. Create clean URL slug
      let slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
        
      if (posts.some(p => p.id === slug)) {
        slug = `${slug}-${Date.now().toString().slice(-4)}`;
      }

      const newPost = {
        id: slug,
        title,
        description: description || "Latest automated trending update.",
        category: category.charAt(0).toUpperCase() + category.slice(1),
        image: image || getCategoryImage(category),
        content,
        publishedAt: new Date().toISOString(),
        readTime: `${Math.max(3, Math.ceil(content.split(/\s+/).length / 200))} min read`,
        views: 0,
        author: author || "NewsAdda India Desk"
      };

      // 4. Prepend to current list
      posts = [newPost, ...posts];
      newlyGeneratedPosts.push(newPost);
      generatedCount++;
    }

    if (generatedCount > 0) {
      // Save updated list to Firestore (stateless write)
      await writeDatabase(posts);
      
      // Flush client static page cache
      revalidatePath("/");
    }

    return NextResponse.json({
      success: true,
      generatedCount,
      articles: newlyGeneratedPosts.map(p => ({ id: p.id, title: p.title }))
    });
  } catch (error) {
    console.error("[Manual Sync API] Bulk generation error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
