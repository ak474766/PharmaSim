'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';

// ============================================================================
// Type Definitions - Strong typing for all AI responses (like JSON schema)
// ============================================================================

/** Response from molecule analysis */
// Update Interface
export interface MoleculeAnalysisResult {
    analysis: string;
    efficacy: number;
    safety: number;
    feedback: string;
    visualPrompt: string;
}



/** Response from quiz question generation */
export interface QuizQuestionResult {
    text: string;
    options: string[];
    correctIndex: number;
    explanation: string;
}

/** Phase data within a roadmap */
export interface RoadmapPhase {
    name: string;
    duration: string;
    description: string;
    keyActivities: string[];
    risks: string;
}

/** Response from trial roadmap generation */
export interface TrialRoadmapResult {
    summary: string;
    phases: RoadmapPhase[];
    successProbability: number;
}

/** Choice within a trial event */
export interface TrialEventChoice {
    text: string;
    budgetEffect: number;
    efficacyEffect: number;
    safetyEffect: number;
    outcomeText: string;
}

/** Response from trial event generation */
export interface TrialEventResult {
    title: string;
    description: string;
    choices: TrialEventChoice[];
    isPhaseComplete: boolean;
}

// ============================================================================
// AI Configuration
// ============================================================================

const API_KEY = process.env.GOOGLE_GENAI_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_GENAI_API_KEY || '';
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;
const model = genAI?.getGenerativeModel({ model: 'gemini-2.5-flash' });

// Config for consistent response format
const MODEL_CONFIG = {
    responseMimeType: 'text/plain',
};

// ============================================================================
// Error Handling Utilities
// ============================================================================

interface AIError {
    type: 'api_key_missing' | 'quota_exceeded' | 'rate_limit' | 'ai_service_error' | 'parse_error' | 'unknown';
    message: string;
    originalError?: unknown;
}

/**
 * Categorize errors for consistent handling (like the example code)
 */
function categorizeError(error: unknown): AIError {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // API Key errors
    if (errorMessage.includes('API_KEY') || errorMessage.includes('authentication') || errorMessage.includes('Missing API Key')) {
        return {
            type: 'api_key_missing',
            message: 'AI Service Unavailable: API key is invalid or missing.',
            originalError: error
        };
    }

    // Quota/Rate limit errors
    if (errorMessage.includes('quota') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
        return {
            type: 'quota_exceeded',
            message: 'API quota exceeded. Please try again later.',
            originalError: error
        };
    }

    if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
        return {
            type: 'rate_limit',
            message: 'Rate limit reached. Please wait a moment and try again.',
            originalError: error
        };
    }

    // AI Service errors
    if (errorMessage.includes('generateContent') || errorMessage.includes('model') || errorMessage.includes('503')) {
        return {
            type: 'ai_service_error',
            message: 'AI service is currently unavailable. Please try again later.',
            originalError: error
        };
    }

    // JSON Parse errors
    if (errorMessage.includes('JSON') || errorMessage.includes('parse') || errorMessage.includes('Unexpected token')) {
        return {
            type: 'parse_error',
            message: 'Failed to parse AI response. Please try again.',
            originalError: error
        };
    }

    return {
        type: 'unknown',
        message: errorMessage || 'An unexpected error occurred.',
        originalError: error
    };
}

/**
 * Helper to clean and parse JSON from AI response
 */
function parseAIResponse<T>(text: string): T {
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr) as T;
}

/**
 * Check if API is configured
 */
function ensureAPIConfigured(): void {
    if (!API_KEY || !model) {
        throw new Error('AI Service Unavailable: Missing API Key');
    }
}

// ============================================================================
// AI Action Functions with Strong Typing
// ============================================================================

/**
 * Analyze a molecule modification
 * Returns structured analysis with efficacy and safety scores
 */
export async function analyzeMoleculeAction(
    moleculeName: string,
    atomCount: number,
    userModifications: string
): Promise<MoleculeAnalysisResult> {
    ensureAPIConfigured();

    const prompt = `
        Act as a Pharmacy Professor.
        A student has submitted a modified version of ${moleculeName}.
        Data:
        - Atom Count: ${atomCount}
        - Student's Note/Mod: "${userModifications}"
        
        Analyze this. 
        1. What is the pharmacological impact?
        2. Estimate specific Efficacy (0-100) and Safety (0-100) scores based on this change (be realistic based on med chem principles).
        3. Provide 2 sentences of constructive feedback.
        4. Generate a 'visualPrompt' for an Image Generator (Stable Diffusion/DALL-E) to visualize this SPECIFIC molecule. Describe its color, key functional groups (e.g. 'glowing benzene rings'), and a scientific background.
        
        Respond in JSON format:
        {
            "analysis": "...",
            "efficacy": number,
            "safety": number,
            "feedback": "...",
            "visualPrompt": "A futuristic 3D render of..."
        }
    `;

    try {
        const result = await model!.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return parseAIResponse<MoleculeAnalysisResult>(text);
    } catch (error: unknown) {
        const categorized = categorizeError(error);
        console.error(`AI Analysis Failed [${categorized.type}]:`, categorized.message);
        throw new Error(categorized.message);
    }
}

/**
 * Generate a quiz question
 * Returns null if generation fails (allows fallback to local questions)
 */
export async function generateQuestionAction(
    topic: string,
    level: number
): Promise<QuizQuestionResult | null> {
    if (!API_KEY || !model) {
        return null; // Fail silently for quiz - use local fallback
    }

    const prompt = `
        Generate a single multiple-choice question for a B.Pharma student.
        Topic: ${topic}
        Difficulty Level: ${level} (1=Freshman, 8=Final Year).
        
        Respond in JSON:
        {
            "text": "Question text...",
            "options": ["A", "B", "C", "D"],
            "correctIndex": 0, // 0-3
            "explanation": "Why..."
        }
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return parseAIResponse<QuizQuestionResult>(text);
    } catch (error: unknown) {
        const categorized = categorizeError(error);
        console.error(`AI Question Gen Failed [${categorized.type}]:`, categorized.message);
        return null; // Return null to fallback to local questions
    }
}

/**
 * Generate clinical trial roadmap
 * Returns comprehensive phase breakdown for drug development
 */
export async function generateTrialRoadmapAction(
    moleculeName: string,
    efficacy: number,
    safety: number
): Promise<TrialRoadmapResult> {
    ensureAPIConfigured();

    const prompt = `
        You are a pharmaceutical regulatory expert. Generate detailed clinical trial phase content for a drug candidate called "${moleculeName}".
        
        Current stats:
        - Efficacy Score: ${efficacy}%
        - Safety Score: ${safety}%
        
        Generate content for each trial phase. Be realistic and educational.
        
        Respond in JSON format:
        {
            "summary": "Brief 2-sentence overview of the drug and its potential",
            "phases": [
                {
                    "name": "Preclinical",
                    "duration": "6-12 months",
                    "description": "Detailed description of what happens in this phase (2-3 sentences)",
                    "keyActivities": ["Activity 1", "Activity 2", "Activity 3"],
                    "risks": "Main risk for this phase based on the drug's stats"
                },
                {
                    "name": "Phase I Clinical Trial",
                    "duration": "1-2 years",
                    "description": "Description...",
                    "keyActivities": ["..."],
                    "risks": "..."
                },
                {
                    "name": "Phase II Clinical Trial",
                    "duration": "2-3 years",
                    "description": "Description...",
                    "keyActivities": ["..."],
                    "risks": "..."
                },
                {
                    "name": "Phase III & FDA Review",
                    "duration": "3-5 years",
                    "description": "Description...",
                    "keyActivities": ["..."],
                    "risks": "..."
                }
            ],
            "successProbability": number (0-100 based on efficacy and safety scores)
        }
    `;

    try {
        const result = await model!.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return parseAIResponse<TrialRoadmapResult>(text);
    } catch (error: unknown) {
        const categorized = categorizeError(error);
        console.error(`AI Roadmap Gen Failed [${categorized.type}]:`, categorized.message);
        throw new Error(categorized.message);
    }
}

/**
 * Generate a trial event for the simulation
 * Returns event with choices and consequences
 */
export async function generateTrialEventAction(
    moleculeName: string,
    phaseName: string,
    phaseDescription: string,
    currentStats: { budget: number; efficacy: number; safety: number },
    previousEvents: string[],
    chemicalFeatures?: string
): Promise<TrialEventResult> {
    ensureAPIConfigured();

    const chemicalContext = chemicalFeatures
        ? `\n        Chemical Structure Context: ${chemicalFeatures}\n        IMPORTANT: Incorporate these chemical features into the event (e.g., if it has a Ring Strain warning, create a stability or side-effect event related to that).`
        : '';

    const prompt = `
        You are a pharmaceutical regulatory simulation AI. Generate a realistic trial event for a drug called "${moleculeName}".

        Current Phase: ${phaseName}
        Phase Description: ${phaseDescription}
        ${chemicalContext}
        
        Current Trial Stats:
        - Budget: $${(currentStats.budget / 1000000).toFixed(1)}M remaining
        - Efficacy Score: ${currentStats.efficacy}%
        - Safety Score: ${currentStats.safety}%

        Previous events in this trial: ${previousEvents.length > 0 ? previousEvents.join(', ') : 'None yet'}

        Generate ONE new event for this phase. The event should be:
        1. Realistic for pharmaceutical trials
        2. Educational about the drug development process
        3. Have meaningful consequences based on choices
        4. If chemical context is provided, USE IT to make the event specific to this molecule's structure.

        Respond in JSON format:
        {
            "title": "Short event title",
            "description": "2-3 sentence detailed description of the situation",
            "choices": [
                {
                    "text": "Choice A (brief description)",
                    "budgetEffect": number (negative for costs, positive for grants, in dollars),
                    "efficacyEffect": number (-20 to +20),
                    "safetyEffect": number (-20 to +20),
                    "outcomeText": "What happens when this choice is made (2 sentences)"
                },
                {
                    "text": "Choice B (brief description)",
                    "budgetEffect": number,
                    "efficacyEffect": number,
                    "safetyEffect": number,
                    "outcomeText": "What happens"
                }
            ],
            "isPhaseComplete": boolean (true if this is a good point to advance to next phase based on stats)
        }
    `;

    try {
        const result = await model!.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return parseAIResponse<TrialEventResult>(text);
    } catch (error: unknown) {
        const categorized = categorizeError(error);
        console.error(`AI Event Gen Failed [${categorized.type}]:`, categorized.message);
        throw new Error(categorized.message);
    }
}

/**
 * Generate a full scenario (3 events) for a specific phase
 * This allows pre-generating the entire trial for instant playback
 */
export async function generatePhaseScenariosAction(
    moleculeName: string,
    phaseName: string,
    phaseDescription: string,
    chemicalFeatures?: string
): Promise<TrialEventResult[]> {
    ensureAPIConfigured();

    const chemicalContext = chemicalFeatures
        ? `\n        Chemical Structure Context: ${chemicalFeatures}\n        IMPORTANT: Incorporate these chemical features into the events.`
        : '';

    const prompt = `
        You are a pharmaceutical regulatory simulation AI. 
        Generate 3 distinct, sequential trial events for the "${phaseName}" of a drug called "${moleculeName}".

        Phase Description: ${phaseDescription}
        ${chemicalContext}
        
        Requirements:
        1. Generate exactly 3 events.
        2. Events should progress in severity or complexity.
        3. Event 1: Early phase issue/discovery.
        4. Event 2: Mid-phase complication.
        5. Event 3: Late-phase critical decision.
        6. Use the chemical context to make specific, scientific scenarios (e.g. solubility issues, metabolic toxicity).

        Respond in a JSON array format (valid JSON):
        [
            {
                "title": "Short event title",
                "description": "2-3 sentence detailed description",
                "choices": [
                    {
                        "text": "Choice A (Risky/Cheap)",
                        "budgetEffect": number (e.g. -100000),
                        "efficacyEffect": number (-10 to +10),
                        "safetyEffect": number (-10 to +10),
                        "outcomeText": "Outcome description"
                    },
                    {
                        "text": "Choice B (Safe/Expensive)",
                        "budgetEffect": number,
                        "efficacyEffect": number,
                        "safetyEffect": number,
                        "outcomeText": "Outcome description"
                    }
                ],
                "isPhaseComplete": false
            },
            ... (2 more, last one can have isPhaseComplete: true)
        ]
    `;

    try {
        const result = await model!.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        // Since we expect an array, parse it properly
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        // Sometimes the AI might wrap it in { events: [...] } or just [...]
        // We will assume array but handle object wrapper if needed
        try {
            const parsed = JSON.parse(jsonStr);
            if (Array.isArray(parsed)) return parsed as TrialEventResult[];
            // @ts-ignore
            if (parsed.events && Array.isArray(parsed.events)) return parsed.events as TrialEventResult[];
            return [parsed] as TrialEventResult[]; // Fallback for single object
        } catch (e) {
            throw new Error('Failed to parse AI array response');
        }
    } catch (error: unknown) {
        const categorized = categorizeError(error);
        console.error(`AI Phase Scenario Gen Failed [${categorized.type}]:`, categorized.message);
        throw new Error(categorized.message);
    }
}
