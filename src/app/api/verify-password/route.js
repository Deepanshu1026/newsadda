import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { password } = await request.json();
    const correctPassword = process.env.ADMIN_PASSWORD || "newsadda777";
    
    if (password === correctPassword) {
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ success: false, error: "Incorrect password" }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Invalid request payload" }, { status: 400 });
  }
}
