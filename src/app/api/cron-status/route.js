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


    let firestoreStatus = "none"; // 'none', 'active', 'error'
    if (process.env.FIRESTORE_PROJECT_ID && process.env.FIRESTORE_API_KEY) {
      try {
        const url = `https://firestore.googleapis.com/v1/projects/${process.env.FIRESTORE_PROJECT_ID}/databases/(default)/documents/data/database?key=${process.env.FIRESTORE_API_KEY}`;
        const res = await fetch(url);
        if (res.ok || res.status === 404) {
          firestoreStatus = "active";
        } else {
          firestoreStatus = "error";
        }
      } catch (e) {
        firestoreStatus = "error";
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

      firestoreStatus
    });
  } catch (error) {
    console.error("[Cron API] Error rendering status:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
