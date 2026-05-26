import { NextResponse } from "next/server";
import { readDatabase } from "../../../../services/db";

export async function GET() {
  try {
    const posts = await readDatabase();
    
    // Sort posts by publishedAt date in descending order (newest first)
    const sortedPosts = [...posts].sort((a, b) => {
      const dateA = new Date(a.publishedAt || 0);
      const dateB = new Date(b.publishedAt || 0);
      return dateB - dateA;
    });

    return NextResponse.json({ success: true, posts: sortedPosts });
  } catch (error) {
    console.error("[Posts List API] Error fetching posts:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
