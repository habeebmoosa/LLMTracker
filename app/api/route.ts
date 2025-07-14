import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 })
    }
    return NextResponse.json({ message: "Hello LLM Tracker", session: session }, { status: 200 });
}