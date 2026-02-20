/**
 * AI Service - Client-side facade for AI API operations
 * 
 * This service handles:
 * 1. API calls to the AI routes with proper typing
 * 2. Error handling with fallback responses
 * 3. Rate limit and quota handling with graceful degradation
 */

import { TrialPhaseData, CachedTrialEvent } from './trialService';
import {
    MoleculeAnalysisResult,
    QuizQuestionResult,
    TrialRoadmapResult,
    TrialEventResult
} from '@/app/actions/ai';

// ============================================================================
// Type Re-exports for backward compatibility
// ============================================================================

/** Roadmap data returned from AI (without generatedAt which is added by TrialService) */
export interface AIRoadmapData {
    summary: string;
    phases: TrialPhaseData[];
    successProbability: number;
}

// ============================================================================
// API Response Types
// ============================================================================

interface APISuccessResponse<T> {
    success: true;
    [key: string]: unknown;
}

interface APIErrorResponse {
    success: false;
    error: string;
    errorType: string;
    message: string;
}

type APIResponse<T> = (APISuccessResponse<T> & T) | APIErrorResponse;

// ============================================================================
// HTTP Client Utilities
// ============================================================================

/**
 * Type-safe POST request with error handling
 */
async function postJSON<T>(url: string, body: unknown): Promise<T> {
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    const text = await res.text();
    let parsed: APIResponse<T> | null = null;

    try {
        parsed = text ? JSON.parse(text) : null;
    } catch {
        parsed = null;
    }

    if (!res.ok) {
        const message = (parsed as APIErrorResponse)?.message ||
            (parsed as APIErrorResponse)?.error ||
            text ||
            res.statusText;
        const err = new Error(message) as Error & { status: number; errorType?: string };
        err.status = res.status;
        err.errorType = (parsed as APIErrorResponse)?.errorType;
        throw err;
    }

    return (parsed ?? {}) as T;
}

/**
 * Check if error is rate limit or quota related
 */
function isRateLimitError(errorMessage: string, errorStatus?: number): boolean {
    return (
        errorStatus === 429 ||
        errorMessage.includes('429') ||
        errorMessage.includes('quota') ||
        errorMessage.includes('RESOURCE_EXHAUSTED') ||
        errorMessage.includes('rate limit') ||
        errorMessage.includes('Rate Limit') ||
        errorStatus === 404 ||
        errorMessage.includes('404') ||
        errorMessage.includes('not found')
    );
}

/**
 * Extract error info from unknown error
 */
function parseError(error: unknown): { message: string; status?: number } {
    const err = error as { message?: string; status?: number; response?: { status?: number } };
    return {
        message: err?.message || String(error) || 'Unknown error',
        status: err?.status || err?.response?.status
    };
}

// ============================================================================
// AI Service - Public API
// ============================================================================

export const AiService = {
    /**
     * Analyze a molecule modification
     * Returns AI analysis with efficacy/safety scores, or fallback data on failure
     */
    async analyzeMolecule(
        moleculeName: string,
        atomCount: number,
        userModifications: string
    ): Promise<MoleculeAnalysisResult> {
        try {
            const response = await postJSON<MoleculeAnalysisResult & { success?: boolean }>(
                '/api/ai/analyze-molecule',
                { moleculeName, atomCount, userModifications }
            );

            // Extract just the result fields
            return {
                analysis: response.analysis,
                efficacy: response.efficacy,
                safety: response.safety,
                feedback: response.feedback,
                visualPrompt: response.visualPrompt || "A generic 3D molecule structure, clean scientific style"
            };

        } catch (error: unknown) {
            const { message, status } = parseError(error);

            // API key missing - clear message to user
            if (status === 503) {
                return {
                    analysis: "AI Service Unavailable (Missing Key)",
                    safety: 50,
                    efficacy: 50,
                    feedback: "Please configure your API key in .env.local",
                    visualPrompt: "A generic molecule structure in blue style"
                };
            }

            // Rate limit - return simulated data
            if (isRateLimitError(message, status)) {
                console.warn("AI Service: Rate limit reached. Using simulated analysis.");
                return {
                    analysis: `[Simulated] Your ${moleculeName} modification shows promise. The ${atomCount} atom structure maintains core stability.`,
                    efficacy: 65 + Math.floor(Math.random() * 20),
                    safety: 70 + Math.floor(Math.random() * 15),
                    feedback: "API quota exceeded - using simulated analysis.",
                    visualPrompt: "A standard pharmaceutical molecule rendering"
                };
            }

            // Connection error
            console.warn("AI Service Error:", message);
            return {
                analysis: "Analysis failed due to connection error.",
                efficacy: 40,
                safety: 40,
                feedback: "Could not connect to AI lab expert. Please check your connection.",
                visualPrompt: "Error state molecule visualization"
            };
        }
    },

    /**
     * Generate a quiz question
     * Returns null on failure (allows fallback to local question bank)
     */
    async generateQuestion(topic: string, level: number): Promise<QuizQuestionResult | null> {
        try {
            const response = await postJSON<{ question: QuizQuestionResult | null; success?: boolean }>(
                '/api/ai/generate-question',
                { topic, level }
            );
            return response.question;

        } catch (error: unknown) {
            const { message, status } = parseError(error);

            if (isRateLimitError(message, status)) {
                console.warn("AI Service: Rate limit - using local question bank.");
            } else {
                console.error("AI Question Gen Failed:", message);
            }

            return null; // Fallback to local questions
        }
    },

    /**
     * Generate clinical trial roadmap
     * Returns AI-generated phases or fallback data on failure
     */
    async generateTrialRoadmap(
        moleculeName: string,
        efficacy: number,
        safety: number
    ): Promise<AIRoadmapData> {
        try {
            const response = await postJSON<TrialRoadmapResult & { success?: boolean }>(
                '/api/ai/trial-roadmap',
                { moleculeName, efficacy, safety }
            );

            return {
                summary: response.summary,
                phases: response.phases,
                successProbability: response.successProbability
            };

        } catch (error: unknown) {
            const { message, status } = parseError(error);

            if (isRateLimitError(message, status)) {
                console.warn("AI Service: Rate limit - using fallback roadmap.");
            } else {
                console.warn("AI Roadmap Generation Failed:", message);
            }

            return this.getFallbackRoadmap(moleculeName, efficacy, safety);
        }
    },

    /**
     * Fallback roadmap when AI is unavailable
     */
    getFallbackRoadmap(moleculeName: string, efficacy: number, safety: number): AIRoadmapData {
        const successProb = Math.round((efficacy * 0.6 + safety * 0.4) * 0.8);
        return {
            summary: `${moleculeName} is a promising drug candidate currently under development. Based on preliminary analysis, it shows potential for therapeutic application.`,
            phases: [
                {
                    name: "Preclinical",
                    duration: "6-12 months",
                    description: "Laboratory and animal testing to evaluate basic safety and biological activity. This phase determines if the compound is safe enough for human trials.",
                    keyActivities: ["In vitro cell studies", "Animal toxicology tests", "Pharmacokinetic analysis"],
                    risks: safety < 60 ? "Safety concerns may require additional testing" : "Standard preclinical risks apply"
                },
                {
                    name: "Phase I Clinical Trial",
                    duration: "1-2 years",
                    description: "First-in-human studies with 20-100 healthy volunteers. Focus is on safety, dosage, and side effects.",
                    keyActivities: ["Healthy volunteer recruitment", "Dose escalation studies", "Safety monitoring"],
                    risks: "Unexpected adverse reactions in humans"
                },
                {
                    name: "Phase II Clinical Trial",
                    duration: "2-3 years",
                    description: "Testing in 100-500 patients with the target condition. Evaluates efficacy and optimal dosing.",
                    keyActivities: ["Patient recruitment", "Efficacy measurements", "Side effect profiling"],
                    risks: efficacy < 70 ? "Efficacy may not meet primary endpoints" : "Competition from similar drugs in development"
                },
                {
                    name: "Phase III & FDA Review",
                    duration: "3-5 years",
                    description: "Large-scale trials with 1000-5000+ patients. Confirms effectiveness and monitors long-term safety before FDA submission.",
                    keyActivities: ["Multi-center trials", "NDA preparation", "FDA review process"],
                    risks: "Regulatory delays or additional data requirements"
                }
            ],
            successProbability: successProb
        };
    },

    /**
     * Generate a placeholder image URL for a molecule
     */
    generateMoleculeImageUrl(moleculeName: string, color: string = '#3b82f6'): string {
        const encodedName = encodeURIComponent(moleculeName.slice(0, 20));
        const bgColor = color.replace('#', '');
        return `https://via.placeholder.com/400x300/${bgColor}/ffffff?text=${encodedName}`;
    },

    /**
     * Generate a dynamic trial event for the simulation
     * Returns AI event or fallback data on failure
     */
    async generateTrialEvent(
        moleculeName: string,
        phaseName: string,
        phaseDescription: string,
        currentStats: { budget: number; efficacy: number; safety: number },
        previousEvents: string[],
        chemicalFeatures?: string
    ): Promise<CachedTrialEvent> {
        try {
            const response = await postJSON<TrialEventResult & { success?: boolean }>(
                '/api/ai/trial-event',
                { moleculeName, phaseName, phaseDescription, currentStats, previousEvents, chemicalFeatures }
            );

            return {
                title: response.title,
                description: response.description,
                choices: response.choices,
                isPhaseComplete: response.isPhaseComplete
            };

        } catch (error: unknown) {
            const { message, status } = parseError(error);

            if (isRateLimitError(message, status)) {
                console.warn("AI Service: Rate limit - using fallback event.");
            } else {
                console.warn("AI Trial Event Failed:", message);
            }

            return this.getFallbackTrialEvent(phaseName, currentStats);
        }
    },

    async generatePhaseScenarios(
        moleculeName: string,
        phaseName: string,
        phaseDescription: string,
        chemicalFeatures?: string
    ): Promise<TrialEventResult[]> {
        try {
            const response = await postJSON<{ data: TrialEventResult[]; success: boolean }>(
                '/api/ai/scenario',
                { moleculeName, phaseName, phaseDescription, chemicalFeatures }
            );

            if (!response.success || !response.data) {
                throw new Error('Failed to generate scenarios');
            }

            return response.data;
        } catch (error) {
            console.error('Scenario Gen Error:', error);
            // Fallback: Generate 3 basic events locally or return empty
            return [];
        }
    },

    /**
     * Fallback trial event when AI is unavailable
     */
    getFallbackTrialEvent(
        phaseName: string,
        currentStats: { budget: number; efficacy: number; safety: number }
    ): CachedTrialEvent {
        const events: Record<string, CachedTrialEvent> = {
            'Preclinical': {
                title: 'Animal Study Results',
                description: 'Initial animal studies are showing promising results, but there are some concerning liver enzyme readings in a subset of test subjects.',
                choices: [
                    {
                        text: 'Conduct additional testing',
                        budgetEffect: -1500000,
                        efficacyEffect: 5,
                        safetyEffect: 10,
                        outcomeText: 'Extended testing revealed the issue was dose-related. Protocol adjusted successfully.'
                    },
                    {
                        text: 'Proceed with current protocol',
                        budgetEffect: 0,
                        efficacyEffect: 0,
                        safetyEffect: -10,
                        outcomeText: 'Trial continues with documented risks. Safety team is monitoring closely.'
                    }
                ],
                isPhaseComplete: currentStats.efficacy >= 40 && currentStats.safety >= 60
            },
            'Phase I Clinical Trial': {
                title: 'Volunteer Recruitment Challenge',
                description: 'Healthy volunteer enrollment is slower than expected. The trial timeline may be affected.',
                choices: [
                    {
                        text: 'Increase incentives ($2M)',
                        budgetEffect: -2000000,
                        efficacyEffect: 0,
                        safetyEffect: 5,
                        outcomeText: 'Enrollment targets met ahead of schedule with high-quality participants.'
                    },
                    {
                        text: 'Expand recruitment sites',
                        budgetEffect: -800000,
                        efficacyEffect: -5,
                        safetyEffect: 0,
                        outcomeText: 'More sites added but data consistency slightly reduced.'
                    }
                ],
                isPhaseComplete: currentStats.efficacy >= 50 && currentStats.safety >= 65
            },
            'Phase II Clinical Trial': {
                title: 'Efficacy Data Review',
                description: 'Mid-trial analysis shows the drug is effective in most patients, but a specific demographic shows reduced response.',
                choices: [
                    {
                        text: 'Focus on responsive group',
                        budgetEffect: -500000,
                        efficacyEffect: 15,
                        safetyEffect: 5,
                        outcomeText: 'Refined targeting significantly improved overall efficacy metrics.'
                    },
                    {
                        text: 'Broaden study population',
                        budgetEffect: -3000000,
                        efficacyEffect: -5,
                        safetyEffect: 0,
                        outcomeText: 'Inclusive approach yielded average results but broader applicability data.'
                    }
                ],
                isPhaseComplete: currentStats.efficacy >= 70 && currentStats.safety >= 75
            },
            'Phase III & FDA Review': {
                title: 'FDA Pre-Submission Meeting',
                description: 'The FDA has reviewed your pre-submission package and has questions about long-term safety data.',
                choices: [
                    {
                        text: 'Conduct extended follow-up',
                        budgetEffect: -4000000,
                        efficacyEffect: 5,
                        safetyEffect: 15,
                        outcomeText: 'Extended data collection satisfied FDA concerns. Approval pathway cleared.'
                    },
                    {
                        text: 'Submit current data with justification',
                        budgetEffect: -500000,
                        efficacyEffect: 0,
                        safetyEffect: -5,
                        outcomeText: 'FDA accepted with conditions. Post-market surveillance required.'
                    }
                ],
                isPhaseComplete: currentStats.efficacy >= 80 && currentStats.safety >= 80
            }
        };

        return events[phaseName] || events['Preclinical'];
    }
};
