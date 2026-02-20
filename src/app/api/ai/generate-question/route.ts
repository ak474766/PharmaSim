import { NextResponse } from 'next/server';
import { generateQuestionAction, QuizQuestionResult } from '@/app/actions/ai';

// ============================================================================
// Type Definitions for API Response
// ============================================================================

interface SuccessResponse {
    success: true;
    question: QuizQuestionResult | null;
}

interface ErrorResponse {
    success: false;
    error: string;
    errorType: 'validation_error' | 'api_key_error' | 'quota_exceeded' | 'rate_limit' | 'ai_service_error' | 'generation_failed';
    message: string;
    question: null;
}

type APIResponse = SuccessResponse | ErrorResponse;

// ============================================================================
// Error Categorization
// ============================================================================

function categorizeError(error: unknown): ErrorResponse {
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes('API') && (errorMessage.includes('key') || errorMessage.includes('Key') || errorMessage.includes('Missing'))) {
        return {
            success: false,
            error: 'api_key_error',
            errorType: 'api_key_error',
            message: 'AI service configuration error.',
            question: null,
        };
    }

    if (errorMessage.includes('quota') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
        return {
            success: false,
            error: 'quota_exceeded',
            errorType: 'quota_exceeded',
            message: 'API quota exceeded.',
            question: null,
        };
    }

    if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
        return {
            success: false,
            error: 'rate_limit',
            errorType: 'rate_limit',
            message: 'Rate limit reached.',
            question: null,
        };
    }

    return {
        success: false,
        error: 'generation_failed',
        errorType: 'generation_failed',
        message: errorMessage || 'Failed to generate question.',
        question: null,
    };
}

function getStatusCode(errorType: ErrorResponse['errorType']): number {
    switch (errorType) {
        case 'validation_error': return 400;
        case 'api_key_error': return 503;
        case 'quota_exceeded': return 429;
        case 'rate_limit': return 429;
        default: return 500;
    }
}

// ============================================================================
// POST Handler
// ============================================================================

export async function POST(req: Request): Promise<NextResponse<APIResponse>> {
    try {
        const body = await req.json();
        const { topic, level } = body || {};

        // Input validation
        if (!topic || typeof topic !== 'string') {
            return NextResponse.json({
                success: false,
                error: 'validation_error',
                errorType: 'validation_error',
                message: 'Missing or invalid topic parameter.',
                question: null,
            }, { status: 400 });
        }

        // Call AI service (returns null if AI unavailable - graceful degradation)
        const result = await generateQuestionAction(topic, Number(level || 1));

        // Success response (question may be null if AI fails - client uses fallback)
        return NextResponse.json({
            success: true,
            question: result,
        });

    } catch (error: unknown) {
        console.error('Question generation error:', error);
        const errorResponse = categorizeError(error);
        return NextResponse.json(errorResponse, { status: getStatusCode(errorResponse.errorType) });
    }
}
