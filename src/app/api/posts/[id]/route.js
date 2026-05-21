import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const dbPath = path.join(process.cwd(), "database.json");
    
    let posts = [];
    try {
      const fileData = await fs.readFile(dbPath, "utf-8");
      posts = JSON.parse(fileData);
    } catch (e) {
      return NextResponse.json({ error: "Database file not found" }, { status: 404 });
    }

    const postIndex = posts.findIndex(p => p.id === id);
    if (postIndex === -1) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Increment view count
    posts[postIndex].views = (posts[postIndex].views || 0) + 1;

    // Write back to database.json
    await fs.writeFile(dbPath, JSON.stringify(posts, null, 2), "utf-8");

    return NextResponse.json({ success: true, views: posts[postIndex].views });
  } catch (error) {
    console.error("[Views API] Error incrementing count:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
