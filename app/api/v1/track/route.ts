import { NextResponse } from "next/server"
import prisma from '@/lib/prisma'
import { getProviderFromModel, getModelRates, ProviderType, ModelType } from '@/utils/constants/models'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const startTime = Date.now()

        if (!body.model || body.prompt_tokens === undefined || body.completion_tokens === undefined || !body.api_key) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        // Verify project exists by projectKey (api_key)
        const project = await prisma.project.findUnique({
            where: { projectKey: body.api_key },
        });
        if (!project) {
            return NextResponse.json({ error: "Invalid project key" }, { status: 404 });
        }

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
            projectKey: body.api_key,
            projectId: project.id,
            model: body.model,
            provider: provider,
            promptTokens: body.prompt_tokens,
            completionTokens: body.completion_tokens,
            totalTokens: total_tokens,
            inputCost: input_cost,
            outputCost: output_cost,
            totalCost: total_cost,
            currency: body.currency || 'USD',
            requestDurationMs: Date.now() - startTime,
            statusCode: 200,
            errorMessage: null
        }

        const data = await prisma.usageLog.create({
            data: usageData,
        })

        return NextResponse.json({
            id: data.id,
            provider: data.provider,
            model: data.model,
            prompt_tokens: data.promptTokens,
            completion_tokens: data.completionTokens,
            total_tokens: data.totalTokens,
            total_cost: data.totalCost,
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
