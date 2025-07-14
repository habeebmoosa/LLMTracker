import prisma from '@/lib/prisma';
import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const orgId = searchParams.get('orgId');
        const userId = searchParams.get('userId');

        if (!userId || !orgId) {
            return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
        }

        const data = await prisma.project.findMany({
            where: {
                createdBy: userId,
                organizationId: orgId,
            },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                description: true,
                projectKey: true,
                createdAt: true,
                updatedAt: true,
                organizationId: true,
                createdBy: true,
                isActive: true,
                settings: true,
            },
        });
        return NextResponse.json({ data });
    } catch (error) {
        console.log("Error while retrieving projects: ", error)
        return NextResponse.json({
            error: "Internal server error",
            message: error instanceof Error ? error.message : String(error)
        }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const orgId = searchParams.get('orgId');
        const userId = searchParams.get('userId');

        const body = await request.json();
        const { name, description, settings, is_active } = body;

        if (!name || !userId || !orgId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const data = await prisma.project.create({
            data: {
                name,
                description,
                organizationId: orgId,
                createdBy: userId,
                settings: settings || {},
                isActive: is_active ?? true,
            },
        });
        return NextResponse.json({ data });
    } catch (error) {
        console.error("Error while creating project:", error);
        return NextResponse.json({
            error: "Internal server error",
            message: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const projectId = searchParams.get('projectId');

        const body = await request.json();
        const { name, description, settings, is_active } = body;

        if (!projectId) {
            return NextResponse.json({ error: "Missing project ID" }, { status: 400 });
        }

        // First verify the project exists
        const existingProject = await prisma.project.findUnique({
            where: { id: projectId },
            select: { createdBy: true },
        });
        if (!existingProject) {
            return NextResponse.json({
                error: "project not found",
                details: "No project with this ID"
            }, { status: 404 });
        }

        const data = await prisma.project.update({
            where: { id: projectId },
            data: {
                name,
                description,
                settings,
                isActive: is_active,
                updatedAt: new Date(),
            },
        });
        return NextResponse.json({ data });
    } catch (error) {
        console.error("Error while updating project:", error);
        return NextResponse.json({
            error: "Internal server error",
            message: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('projectId');

        if (!id) {
            return NextResponse.json({ error: "Missing project ID" }, { status: 400 });
        }

        // First verify the project exists
        const existingProject = await prisma.project.findUnique({
            where: { id },
            select: { createdBy: true },
        });
        if (!existingProject) {
            return NextResponse.json({
                error: "project not found",
                details: "No project with this ID"
            }, { status: 404 });
        }

        await prisma.project.delete({ where: { id } });
        return NextResponse.json({ message: "project deleted successfully" });
    } catch (error) {
        console.error("Error while deleting project:", error);
        return NextResponse.json({
            error: "Internal server error",
            message: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
} 