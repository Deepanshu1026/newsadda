import { NextResponse } from "next/server";
import { fetchGoldPrices } from "../../../../services/goldPrices";

export const dynamic = "force-dynamic"; // Next.js 16: keep dynamic but we also cache fetch itself

export async function GET() {
  try {
    const data = await fetchGoldPrices();
    return NextResponse.json({ success: true, ...data }, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    console.error("[Gold Prices API] Error:", error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
