import { createClient } from "@/utils/supabase/server";
import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        // const apiKey = searchParams.get('organizationId');
        const projectId = searchParams.get('projectId');

        if (!projectId) {
            return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
        }

        const supabase = await createClient();

        const { data, error } = await supabase
            .from('usage_logs')
            .select(`
                id,
                timestamp,
                model,
                provider,
                prompt_tokens,
                completion_tokens,
                total_tokens,
                total_cost,
                currency,
                request_duration_ms,
                status_code,
                error_message,
                input_cost,
                output_cost
            `)
            // .eq('api_key_id', apiKey)
            .eq('project_id', projectId)
            .order('timestamp', { ascending: false });

        if (error) {
            console.error("Error retrieving usage data:", error)
            return NextResponse.json({
                error: "Failed to retrieve usage data",
                details: error.message,
                code: error.code,
                hint: error.hint
            }, { status: 500 })
        }

        return NextResponse.json({ data });

    } catch (error) {
        console.log("Error while retrieving usage data: ", error)
        return NextResponse.json({
            error: "Internal server error",
            message: error instanceof Error ? error.message : String(error)
        }, { status: 500 })
    }
}