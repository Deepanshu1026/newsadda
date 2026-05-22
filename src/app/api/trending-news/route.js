import { NextResponse } from "next/server";
import { fetchLatestNews } from "../../../../services/newsService";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "politics";
    
    console.log(`[Trending News API] Fetching real-time headlines for category: ${category}`);
    const headlines = await fetchLatestNews(category);
    
    // Return unique headlines parsed by newsService
    return NextResponse.json({
      success: true,
      category,
      count: headlines.length,
      headlines
    });
  } catch (error) {
    console.error("[Trending News API] Error fetching headlines:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
