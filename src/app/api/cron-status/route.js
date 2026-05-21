import { NextResponse } from "next/server";
import { readDatabase } from "../../../../services/db";

export async function GET() {
  try {
    const posts = await readDatabase();

    const interval = process.env.SYNC_INTERVAL_MINUTES || "60";
    const categoriesStr = process.env.CRON_CATEGORIES || "technology,science,business";
    const categories = categoriesStr.split(",").map(c => c.trim());

    // Fallback sync time is either stored in a global variable or the publishedAt date of the latest post
    const lastSync = global.lastSyncTime || (posts.length > 0 ? posts[0].publishedAt : new Date().toISOString());

    return NextResponse.json({
      totalPosts: posts.length,
      lastSync,
      cronActive: global.cronDaemonActive !== false, // Defaults to active
      interval: parseInt(interval, 10),
      categories
    });
  } catch (error) {
    console.error("[Cron API] Error rendering status:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
