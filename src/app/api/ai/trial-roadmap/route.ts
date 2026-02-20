import { NextResponse } from 'next/server';
import { generateTrialRoadmapAction, TrialRoadmapResult } from '@/app/actions/ai';

// ============================================================================
// Type Definitions for API Response
// ============================================================================

interface SuccessResponse extends TrialRoadmapResult {
    success: true;
}

interface ErrorResponse {
    success: false;
    error: string;
    errorType: 'validation_error' | 'api_key_error' | 'quota_exceeded' | 'rate_limit' | 'ai_service_error' | 'generation_failed';
    message: string;
}

type APIResponse = SuccessResponse | ErrorResponse;

// ============================================================================
// Error Categorization (following best practices from reference code)
// ============================================================================

function categorizeError(error: unknown): ErrorResponse {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // API Key errors
    if (errorMessage.includes('API') && (errorMessage.includes('key') || errorMessage.includes('Key') || errorMessage.includes('Missing'))) {
        return {
            success: false,
            error: 'api_key_error',
            errorType: 'api_key_error',
            message: 'AI service configuration error. Please check API key settings.',
        };
    }

    // Quota exceeded
    if (errorMessage.includes('quota') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
        return {
            success: false,
            error: 'quota_exceeded',
            errorType: 'quota_exceeded',
            message: 'API quota exceeded. Please try again later.',
        };
    }

    // Rate limit
    if (errorMessage.includes('rate limit') || errorMessage.includes('429') || errorMessage.includes('Rate Limit')) {
        return {
            success: false,
            error: 'rate_limit',
            errorType: 'rate_limit',
            message: 'Rate limit reached. Please wait a moment and try again.',
        };
    }

    // AI Service errors
    if (errorMessage.includes('unavailable') || errorMessage.includes('service') || errorMessage.includes('503')) {
        return {
            success: false,
            error: 'ai_service_error',
            errorType: 'ai_service_error',
            message: 'AI service is currently unavailable. Please try again later.',
        };
    }

    // Generic generation failure
    return {
        success: false,
        error: 'generation_failed',
        errorType: 'generation_failed',
        message: errorMessage || 'Failed to generate roadmap. Please try again.',
    };
}

// ============================================================================
// HTTP Status Mapping
// ============================================================================

function getStatusCode(errorType: ErrorResponse['errorType']): number {
    switch (errorType) {
        case 'validation_error':
            return 400;
        case 'api_key_error':
            return 503;
        case 'quota_exceeded':
            return 429;
        case 'rate_limit':
            return 429;
        case 'ai_service_error':
            return 503;
        case 'generation_failed':
        default:
            return 500;
    }
}

// ============================================================================
// POST Handler
// ============================================================================

export async function POST(req: Request): Promise<NextResponse<APIResponse>> {
    try {
        // Parse request body
        const body = await req.json();
        const { moleculeName, efficacy, safety } = body || {};

        // Input validation
        if (!moleculeName || typeof moleculeName !== 'string') {
            const errorResponse: ErrorResponse = {
                success: false,
                error: 'validation_error',
                errorType: 'validation_error',
                message: 'Missing or invalid moleculeName parameter.',
            };
            return NextResponse.json(errorResponse, { status: 400 });
        }

        // Parse numeric values with defaults
        const parsedEfficacy = Number(efficacy) || 0;
        const parsedSafety = Number(safety) || 0;

        // Call AI service
        const result = await generateTrialRoadmapAction(
            moleculeName,
            parsedEfficacy,
            parsedSafety
        );

        // Success response
        const successResponse: SuccessResponse = {
            success: true,
            ...result,
        };

        return NextResponse.json(successResponse);

    } catch (error: unknown) {
        console.error('Trial roadmap generation error:', error);

        const errorResponse = categorizeError(error);
        const statusCode = getStatusCode(errorResponse.errorType);

        return NextResponse.json(errorResponse, { status: statusCode });
    }
}
