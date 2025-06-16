import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({ message: "Hello LLM Tracker" }, { status: 200 });
}