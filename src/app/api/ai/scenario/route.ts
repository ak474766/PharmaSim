
import { NextResponse } from 'next/server';
import { generatePhaseScenariosAction } from '../../../actions/ai';

export const maxDuration = 60; // Allow longer timeout for batch generation

interface APIResponse {
    success: boolean;
    data?: any;
    error?: string;
}

export async function POST(req: Request): Promise<NextResponse<APIResponse>> {
    try {
        const body = await req.json();
        const { moleculeName, phaseName, phaseDescription, chemicalFeatures } = body || {};

        if (!moleculeName || !phaseName) {
            return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 });
        }

        const events = await generatePhaseScenariosAction(
            moleculeName,
            phaseName,
            phaseDescription || '',
            chemicalFeatures
        );

        return NextResponse.json({ success: true, data: events });

    } catch (e: any) {
        console.error('API Error:', e);
        return NextResponse.json({ success: false, error: e.message || 'Unknown error' }, { status: 500 });
    }
}
