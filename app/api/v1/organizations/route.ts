import prisma from '@/lib/prisma';
import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: "Missing user ID parameter" }, { status: 400 })
        }

        const data = await prisma.organization.findMany({
            where: { ownerId: userId },
            orderBy: { createdAt: 'asc' },
            select: {
                id: true,
                name: true,
                description: true,
                createdAt: true,
                updatedAt: true,
                ownerId: true,
                isActive: true,
                settings: true,
            },
        });
        return NextResponse.json({ data });
    } catch (error) {
        console.log("Error while retrieving organizations: ", error)
        return NextResponse.json({
            error: "Internal server error",
            message: error instanceof Error ? error.message : String(error)
        }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, description, owner_id, settings } = body;

        if (!name || !owner_id) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const data = await prisma.organization.create({
            data: {
                name,
                description,
                ownerId: owner_id,
                settings: settings || {},
                isActive: true,
            },
        });
        return NextResponse.json({ data });
    } catch (error) {
        console.error("Error while creating organization:", error);
        return NextResponse.json({
            error: "Internal server error",
            message: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, name, description, settings, is_active } = body;

        if (!id) {
            return NextResponse.json({ error: "Missing organization ID" }, { status: 400 });
        }

        // First verify the organization exists
        const existingOrg = await prisma.organization.findUnique({
            where: { id },
            select: { ownerId: true },
        });
        if (!existingOrg) {
            return NextResponse.json({
                error: "Organization not found",
                details: "No organization with this ID"
            }, { status: 404 });
        }

        const data = await prisma.organization.update({
            where: { id },
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
        console.error("Error while updating organization:", error);
        return NextResponse.json({
            error: "Internal server error",
            message: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('orgId');

        if (!id) {
            return NextResponse.json({ error: "Missing organization ID" }, { status: 400 });
        }

        // First verify the organization exists
        const existingOrg = await prisma.organization.findUnique({
            where: { id },
            select: { ownerId: true },
        });
        if (!existingOrg) {
            return NextResponse.json({
                error: "Organization not found",
                details: "No organization with this ID"
            }, { status: 404 });
        }

        // Delete associated projects first
        await prisma.project.deleteMany({ where: { organizationId: id } });
        // Delete the organization
        await prisma.organization.delete({ where: { id } });
        return NextResponse.json({ message: "Organization and associated projects deleted successfully" });
    } catch (error) {
        console.error("Error while deleting organization:", error);
        return NextResponse.json({
            error: "Internal server error",
            message: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
} 