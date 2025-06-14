export type ProviderType = 'openai' | 'anthropic' | 'google' | 'xai' | 'deepseek' | 'alibaba' | 'cohere';

export type OpenAIModels = 'gpt-4o' | 'gpt-3.5-turbo' | 'gpt-4.5' | 'o3' | 'o1-2024-12-17' | 'o1-preview' | 'o3-mini-high' | 'o3-mini' | 'o1-mini' | 'gpt-4o-mini';
export type AnthropicModels = 'claude-3-sonnet' | 'claude-3.7-sonnet';
export type GoogleModels = 'gemini-2.5-pro' | 'gemini-2.0-flash-001';
export type XAIModels = 'grok-3-preview';
export type DeepSeekModels = 'deepseek-v3' | 'deepseek-r1';
export type AlibabaModels = 'qwen2.5-max' | 'qwen-plus-0125';
export type CohereModels = 'command-a';

export type ModelType = OpenAIModels | AnthropicModels | GoogleModels | XAIModels | DeepSeekModels | AlibabaModels | CohereModels;

export interface ModelRate {
    input: number;
    output: number;
}

export interface ModelRates {
    openai: Record<OpenAIModels, ModelRate>;
    anthropic: Record<AnthropicModels, ModelRate>;
    google: Record<GoogleModels, ModelRate>;
    xai: Record<XAIModels, ModelRate>;
    deepseek: Record<DeepSeekModels, ModelRate>;
    alibaba: Record<AlibabaModels, ModelRate>;
    cohere: Record<CohereModels, ModelRate>;
}

export const MODEL_RATES: ModelRates = {
    openai: {
        'gpt-4o': { input: 0.0025, output: 0.01 },
        'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
        'gpt-4.5': { input: 0.075, output: 0.15 },
        'o3': { input: 0.01, output: 0.04 },
        'o1-2024-12-17': { input: 0.015, output: 0.06 },
        'o1-preview': { input: 0.015, output: 0.06 },
        'o3-mini-high': { input: 0.0011, output: 0.0044 },
        'o3-mini': { input: 0.0011, output: 0.0044 },
        'o1-mini': { input: 0.0011, output: 0.0044 },
        'gpt-4o-mini': { input: 0.0011, output: 0.0044 },
    },
    anthropic: {
        'claude-3-sonnet': { input: 0.003, output: 0.015 },
        'claude-3.7-sonnet': { input: 0.003, output: 0.015 },
    },
    google: {
        'gemini-2.5-pro': { input: 0.0025, output: 0.015 },
        'gemini-2.0-flash-001': { input: 0.0001, output: 0.0004 },
    },
    xai: {
        'grok-3-preview': { input: 0.003, output: 0.015 },
    },
    deepseek: {
        'deepseek-v3': { input: 0.00027, output: 0.0011 },
        'deepseek-r1': { input: 0.00055, output: 0.00219 },
    },
    alibaba: {
        'qwen2.5-max': { input: 0.0016, output: 0.0064 },
        'qwen-plus-0125': { input: 0.0004, output: 0.0012 },
    },
    cohere: {
        'command-a': { input: 0.0025, output: 0.01 },
    }
};

// Helper function to determine provider from model
export function getProviderFromModel(model: string): ProviderType {
    const modelLower = model.toLowerCase();
    
    if (Object.keys(MODEL_RATES.openai).includes(modelLower)) return 'openai';
    if (Object.keys(MODEL_RATES.anthropic).includes(modelLower)) return 'anthropic';
    if (Object.keys(MODEL_RATES.google).includes(modelLower)) return 'google';
    if (Object.keys(MODEL_RATES.xai).includes(modelLower)) return 'xai';
    if (Object.keys(MODEL_RATES.deepseek).includes(modelLower)) return 'deepseek';
    if (Object.keys(MODEL_RATES.alibaba).includes(modelLower)) return 'alibaba';
    if (Object.keys(MODEL_RATES.cohere).includes(modelLower)) return 'cohere';
    
    throw new Error(`Unknown model: ${model}`);
}

// Helper function to get model rates
export function getModelRates(model: string, provider?: ProviderType): ModelRate {
    const actualProvider = provider || getProviderFromModel(model);
    
    if (actualProvider in MODEL_RATES && model in MODEL_RATES[actualProvider]) {
        return MODEL_RATES[actualProvider][model as keyof typeof MODEL_RATES[typeof actualProvider]];
    }
    
    throw new Error(`Invalid model ${model} for provider ${actualProvider}`);
}
