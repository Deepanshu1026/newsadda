import { NextResponse } from "next/server";
import { fetchGoogleTrends } from "../../../../services/trends/googleTrendsService";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const geo = searchParams.get("geo") || process.env.TRENDS_GEO || "IN";

    console.log(`[Google Trends API] Fetching daily trends for geo: ${geo}`);
    const trends = await fetchGoogleTrends(geo);

    return NextResponse.json({
      success: true,
      geo,
      count: trends.length,
      trends
    });
  } catch (error) {
    console.error("[Google Trends API] Error fetching daily trends:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
