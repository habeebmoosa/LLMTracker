import { createClient } from "@/utils/supabase/server";
import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: "Missing user ID parameter" }, { status: 400 })
        }

        const supabase = await createClient();

        const { data, error } = await supabase
            .from('organizations')
            .select(`
                id,
                name,
                description,
                created_at,
                updated_at,
                owner_id,
                is_active,
                settings
            `)
            .eq('owner_id', userId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error("Error retrieving organizations:", error)
            return NextResponse.json({
                error: "Failed to retrieve organizations",
                details: error.message,
                code: error.code,
                hint: error.hint
            }, { status: 500 })
        }

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

        const supabase = await createClient();

        const { data, error } = await supabase
            .from('organizations')
            .insert([
                {
                    name,
                    description,
                    owner_id,
                    settings: settings || {},
                    is_active: true
                }
            ])
            .select()
            .single();

        if (error) {
            console.error("Error creating organization:", error);
            return NextResponse.json({
                error: "Failed to create organization",
                details: error.message,
                code: error.code,
                hint: error.hint
            }, { status: 500 });
        }

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

        const supabase = await createClient();

        // First verify the organization exists and user has permission
        const { data: existingOrg, error: fetchError } = await supabase
            .from('organizations')
            .select('owner_id')
            .eq('id', id)
            .single();

        if (fetchError) {
            return NextResponse.json({
                error: "Organization not found",
                details: fetchError.message
            }, { status: 404 });
        }

        // Update the organization
        const { data, error } = await supabase
            .from('organizations')
            .update({
                name,
                description,
                settings,
                is_active,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error("Error updating organization:", error);
            return NextResponse.json({
                error: "Failed to update organization",
                details: error.message,
                code: error.code,
                hint: error.hint
            }, { status: 500 });
        }

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

        const supabase = await createClient();

        // First verify the organization exists
        const { data: existingOrg, error: fetchError } = await supabase
            .from('organizations')
            .select('owner_id')
            .eq('id', id)
            .single();

        if (fetchError) {
            return NextResponse.json({
                error: "Organization not found",
                details: fetchError.message
            }, { status: 404 });
        }

        // Delete associated projects first
        const { error: projectsError } = await supabase
            .from('projects')
            .delete()
            .eq('organization_id', id);

        if (projectsError) {
            console.error("Error deleting associated projects:", projectsError);
            return NextResponse.json({
                error: "Failed to delete associated projects",
                details: projectsError.message,
                code: projectsError.code,
                hint: projectsError.hint
            }, { status: 500 });
        }

        // Delete the organization
        const { error } = await supabase
            .from('organizations')
            .delete()
            .eq('id', id);

        if (error) {
            console.error("Error deleting organization:", error);
            return NextResponse.json({
                error: "Failed to delete organization",
                details: error.message,
                code: error.code,
                hint: error.hint
            }, { status: 500 });
        }

        return NextResponse.json({ message: "Organization and associated projects deleted successfully" });

    } catch (error) {
        console.error("Error while deleting organization:", error);
        return NextResponse.json({
            error: "Internal server error",
            message: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
} 