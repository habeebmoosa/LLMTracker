import prisma from '@/lib/prisma';
import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const projectId = searchParams.get('projectId');

        if (!projectId) {
            return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
        }

        const data = await prisma.usageLog.findMany({
            where: { projectId },
            orderBy: { timestamp: 'desc' },
            select: {
                id: true,
                timestamp: true,
                model: true,
                provider: true,
                promptTokens: true,
                completionTokens: true,
                totalTokens: true,
                totalCost: true,
                currency: true,
                requestDurationMs: true,
                statusCode: true,
                errorMessage: true,
                inputCost: true,
                outputCost: true,
            },
        });
        return NextResponse.json({ data });
    } catch (error) {
        console.log("Error while retrieving usage data: ", error)
        return NextResponse.json({
            error: "Internal server error",
            message: error instanceof Error ? error.message : String(error)
        }, { status: 500 })
    }
}