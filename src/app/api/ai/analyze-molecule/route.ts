import { NextResponse } from 'next/server';
import { analyzeMoleculeAction, MoleculeAnalysisResult } from '@/app/actions/ai';

// ============================================================================
// Type Definitions for API Response
// ============================================================================

interface SuccessResponse extends MoleculeAnalysisResult {
    success: true;
}

interface ErrorResponse {
    success: false;
    error: string;
    errorType: 'validation_error' | 'api_key_error' | 'quota_exceeded' | 'rate_limit' | 'ai_service_error' | 'analysis_failed';
    message: string;
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
            message: 'AI service configuration error. Please check API key settings.',
        };
    }

    if (errorMessage.includes('quota') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
        return {
            success: false,
            error: 'quota_exceeded',
            errorType: 'quota_exceeded',
            message: 'API quota exceeded. Please try again later.',
        };
    }

    if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
        return {
            success: false,
            error: 'rate_limit',
            errorType: 'rate_limit',
            message: 'Rate limit reached. Please wait and try again.',
        };
    }

    if (errorMessage.includes('unavailable') || errorMessage.includes('service')) {
        return {
            success: false,
            error: 'ai_service_error',
            errorType: 'ai_service_error',
            message: 'AI service is currently unavailable.',
        };
    }

    return {
        success: false,
        error: 'analysis_failed',
        errorType: 'analysis_failed',
        message: errorMessage || 'Failed to analyze molecule. Please try again.',
    };
}

function getStatusCode(errorType: ErrorResponse['errorType']): number {
    switch (errorType) {
        case 'validation_error': return 400;
        case 'api_key_error': return 503;
        case 'quota_exceeded': return 429;
        case 'rate_limit': return 429;
        case 'ai_service_error': return 503;
        default: return 500;
    }
}

// ============================================================================
// POST Handler
// ============================================================================

export async function POST(req: Request): Promise<NextResponse<APIResponse>> {
    try {
        const body = await req.json();
        const { moleculeName, atomCount, userModifications } = body || {};

        // Input validation
        if (!moleculeName || typeof moleculeName !== 'string') {
            return NextResponse.json({
                success: false,
                error: 'validation_error',
                errorType: 'validation_error',
                message: 'Missing or invalid moleculeName parameter.',
            }, { status: 400 });
        }

        // Call AI service
        const result = await analyzeMoleculeAction(
            moleculeName,
            Number(atomCount || 0),
            String(userModifications || '')
        );

        // Success response
        return NextResponse.json({
            success: true,
            ...result,
        });

    } catch (error: unknown) {
        console.error('Molecule analysis error:', error);
        const errorResponse = categorizeError(error);
        return NextResponse.json(errorResponse, { status: getStatusCode(errorResponse.errorType) });
    }
}
