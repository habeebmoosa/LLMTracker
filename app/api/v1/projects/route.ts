import { createClient } from "@/utils/supabase/server";
import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const orgId = searchParams.get('orgId');
        const userId = searchParams.get('userId');

        if (!userId || !orgId) {
            return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
        }

        const supabase = await createClient();

        const { data, error } = await supabase
            .from('projects')
            .select(`
                id,
                name,
                description,
                created_at,
                updated_at,
                organization_id,
                created_by,
                is_active,
                settings
            `)
            .eq('created_by', userId)
            .eq('organization_id', orgId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error retrieving projects:", error)
            return NextResponse.json({
                error: "Failed to retrieve projects",
                details: error.message,
                code: error.code,
                hint: error.hint
            }, { status: 500 })
        }

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

        if (!name || !userId || !userId || !orgId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const supabase = await createClient();

        const { data, error } = await supabase
            .from('projects')
            .insert([
                {
                    name,
                    description,
                    organization_id: orgId,
                    created_by: userId,
                    settings: settings || {},
                    is_active: is_active || true
                }
            ])
            .select()
            .single();

        if (error) {
            console.error("Error creating project:", error);
            return NextResponse.json({
                error: "Failed to create project",
                details: error.message,
                code: error.code,
                hint: error.hint
            }, { status: 500 });
        }

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

        const supabase = await createClient();

        // First verify the project exists and user has permission
        const { data: existingOrg, error: fetchError } = await supabase
            .from('projects')
            .select('created_by')
            .eq('id', projectId)
            .single();

        if (fetchError) {
            return NextResponse.json({
                error: "project not found",
                details: fetchError.message
            }, { status: 404 });
        }

        // Update the project
        const { data, error } = await supabase
            .from('projects')
            .update({
                name,
                description,
                settings,
                is_active,
                updated_at: new Date().toISOString()
            })
            .eq('id', projectId)
            .select()
            .single();

        if (error) {
            console.error("Error updating project:", error);
            return NextResponse.json({
                error: "Failed to update project",
                details: error.message,
                code: error.code,
                hint: error.hint
            }, { status: 500 });
        }

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

        const supabase = await createClient();

        // First verify the project exists
        const { data: existingProject, error: fetchError } = await supabase
            .from('projects')
            .select('created_by')
            .eq('id', id)
            .single();

        if (fetchError) {
            return NextResponse.json({
                error: "project not found",
                details: fetchError.message
            }, { status: 404 });
        }

        // Delete the organization
        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', id);

        if (error) {
            console.error("Error deleting project:", error);
            return NextResponse.json({
                error: "Failed to delete project",
                details: error.message,
                code: error.code,
                hint: error.hint
            }, { status: 500 });
        }

        return NextResponse.json({ message: "project deleted successfully" });

    } catch (error) {
        console.error("Error while deleting project:", error);
        return NextResponse.json({
            error: "Internal server error",
            message: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
} 