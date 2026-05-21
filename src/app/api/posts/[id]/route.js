import { NextResponse } from "next/server";
import { readDatabase, writeDatabase } from "../../../../../services/db";

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const posts = await readDatabase();

    const postIndex = posts.findIndex(p => p.id === id);
    if (postIndex === -1) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Increment view count
    posts[postIndex].views = (posts[postIndex].views || 0) + 1;

    // Save updated database
    await writeDatabase(posts);

    return NextResponse.json({ success: true, views: posts[postIndex].views });
  } catch (error) {
    console.error("[Views API] Error incrementing count:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
