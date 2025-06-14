import { NextResponse } from "next/server"
import { createClient } from '@/utils/supabase/server'
import { getProviderFromModel, getModelRates, ProviderType, ModelType } from '@/utils/constants/models'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const startTime = Date.now()

        if (!body.model || body.prompt_tokens === undefined || body.completion_tokens === undefined || !body.api_key_id || !body.project_id) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const supabase = await createClient()

        const total_tokens = (body.prompt_tokens || 0) + (body.completion_tokens || 0)

        const model = body.model as ModelType;
        let provider: ProviderType;
        let rates: { input: number, output: number };

        try {
            provider = (body.provider as ProviderType) || getProviderFromModel(model);
            rates = getModelRates(model, provider);
        } catch (error) {
            return NextResponse.json({ 
                error: "Invalid model or provider",
                details: error instanceof Error ? error.message : String(error)
            }, { status: 400 });
        }

        const input_cost = (body.prompt_tokens / 1000) * rates.input;
        const output_cost = (body.completion_tokens / 1000) * rates.output;
        const total_cost = input_cost + output_cost;

        const usageData = {
            api_key_id: body.api_key_id,
            project_id: body.project_id,
            model: body.model,
            provider: provider,
            prompt_tokens: body.prompt_tokens,
            completion_tokens: body.completion_tokens,
            total_tokens: total_tokens,
            input_cost: input_cost,
            output_cost: output_cost,
            total_cost: total_cost,
            currency: body.currency || 'USD',
            request_duration_ms: Date.now() - startTime,
            status_code: 200,
            error_message: null
        }

        const { data, error } = await supabase
            .from('usage_logs')
            .insert([usageData])
            .select()
            .single()

        if (error) {
            console.error("Error storing usage data:", error)
            return NextResponse.json({
                error: "Failed to store usage data",
                details: error.message,
                code: error.code,
                hint: error.hint
            }, { status: 500 })
        }

        return NextResponse.json({
            id: data.id,
            provider: data.provider,
            model: data.model,
            prompt_tokens: data.prompt_tokens,
            completion_tokens: data.completion_tokens,
            total_tokens: data.total_tokens,
            total_cost: data.total_cost,
            currency: data.currency,
            timestamp: data.timestamp,
            status: "success"
        })

    } catch (error) {
        console.error("Error tracking LLM usage:", error)
        return NextResponse.json({
            error: "Internal server error",
            message: error instanceof Error ? error.message : String(error)
        }, { status: 500 })
    }
}
