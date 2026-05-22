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

    // Detect storage layer persistence capabilities
    const isKvConnected = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
    const isVercel = !!process.env.VERCEL;

    let firebaseStatus = "none"; // 'none', 'active', 'deactivated', 'error'
    if (process.env.FIREBASE_DATABASE_URL) {
      try {
        const baseUrl = process.env.FIREBASE_DATABASE_URL.endsWith("/") ? process.env.FIREBASE_DATABASE_URL.slice(0, -1) : process.env.FIREBASE_DATABASE_URL;
        const res = await fetch(`${baseUrl}/posts.json`);
        if (res.status === 423) {
          firebaseStatus = "deactivated";
        } else if (res.ok) {
          firebaseStatus = "active";
        } else {
          firebaseStatus = "error";
        }
      } catch (e) {
        firebaseStatus = "error";
      }
    }

    return NextResponse.json({
      totalPosts: posts.length,
      lastSync,
      cronActive: global.cronDaemonActive !== false, // Defaults to active
      interval: parseInt(interval, 10),
      categories,
      isKvConnected,
      isVercel,
      firebaseStatus
    });
  } catch (error) {
    console.error("[Cron API] Error rendering status:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
