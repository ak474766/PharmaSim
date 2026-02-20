module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/src/app/actions/ai.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"601e660d024180ae0f13bea7d4b5c2adea5a7e5425":"generateQuestionAction","706fe35eb3cc4539e1f6447f98998e10278d96e180":"generateTrialRoadmapAction","7082d21f98c1253297eeafcb2befa9fa0c2635d950":"analyzeMoleculeAction","7eedabe67397f6933b025cbfe82fa81095208f69b3":"generateTrialEventAction"},"",""] */ __turbopack_context__.s([
    "analyzeMoleculeAction",
    ()=>analyzeMoleculeAction,
    "generateQuestionAction",
    ()=>generateQuestionAction,
    "generateTrialEventAction",
    ()=>generateTrialEventAction,
    "generateTrialRoadmapAction",
    ()=>generateTrialRoadmapAction
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@google/generative-ai/dist/index.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-route] (ecmascript)");
;
;
// ============================================================================
// AI Configuration
// ============================================================================
const API_KEY = process.env.GOOGLE_GENAI_API_KEY || ("TURBOPACK compile-time value", "AIzaSyBA0G2atNYDKbZh9qXp0U9c0EeH5O6jIA4") || '';
const genAI = ("TURBOPACK compile-time truthy", 1) ? new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GoogleGenerativeAI"](API_KEY) : "TURBOPACK unreachable";
const model = genAI?.getGenerativeModel({
    model: 'gemini-2.5-flash'
});
// Config for consistent response format
const MODEL_CONFIG = {
    responseMimeType: 'text/plain'
};
/**
 * Categorize errors for consistent handling (like the example code)
 */ function categorizeError(error) {
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
 */ function parseAIResponse(text) {
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
}
/**
 * Check if API is configured
 */ function ensureAPIConfigured() {
    if (!API_KEY || !model) {
        throw new Error('AI Service Unavailable: Missing API Key');
    }
}
async function analyzeMoleculeAction(moleculeName, atomCount, userModifications) {
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
        
        Respond in JSON format:
        {
            "analysis": "...",
            "efficacy": number,
            "safety": number,
            "feedback": "..."
        }
    `;
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return parseAIResponse(text);
    } catch (error) {
        const categorized = categorizeError(error);
        console.error(`AI Analysis Failed [${categorized.type}]:`, categorized.message);
        throw new Error(categorized.message);
    }
}
async function generateQuestionAction(topic, level) {
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
        return parseAIResponse(text);
    } catch (error) {
        const categorized = categorizeError(error);
        console.error(`AI Question Gen Failed [${categorized.type}]:`, categorized.message);
        return null; // Return null to fallback to local questions
    }
}
async function generateTrialRoadmapAction(moleculeName, efficacy, safety) {
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
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return parseAIResponse(text);
    } catch (error) {
        const categorized = categorizeError(error);
        console.error(`AI Roadmap Gen Failed [${categorized.type}]:`, categorized.message);
        throw new Error(categorized.message);
    }
}
async function generateTrialEventAction(moleculeName, phaseName, phaseDescription, currentStats, previousEvents, chemicalFeatures) {
    ensureAPIConfigured();
    const chemicalContext = chemicalFeatures ? `\n        Chemical Structure Context: ${chemicalFeatures}\n        IMPORTANT: Incorporate these chemical features into the event (e.g., if it has a Ring Strain warning, create a stability or side-effect event related to that).` : '';
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
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return parseAIResponse(text);
    } catch (error) {
        const categorized = categorizeError(error);
        console.error(`AI Event Gen Failed [${categorized.type}]:`, categorized.message);
        throw new Error(categorized.message);
    }
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    analyzeMoleculeAction,
    generateQuestionAction,
    generateTrialRoadmapAction,
    generateTrialEventAction
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerServerReference"])(analyzeMoleculeAction, "7082d21f98c1253297eeafcb2befa9fa0c2635d950", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerServerReference"])(generateQuestionAction, "601e660d024180ae0f13bea7d4b5c2adea5a7e5425", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerServerReference"])(generateTrialRoadmapAction, "706fe35eb3cc4539e1f6447f98998e10278d96e180", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerServerReference"])(generateTrialEventAction, "7eedabe67397f6933b025cbfe82fa81095208f69b3", null);
}),
"[project]/src/app/api/ai/trial-event/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$actions$2f$ai$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/actions/ai.ts [app-route] (ecmascript)");
;
;
// ============================================================================
// Error Categorization
// ============================================================================
function categorizeError(error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('API') && (errorMessage.includes('key') || errorMessage.includes('Key') || errorMessage.includes('Missing'))) {
        return {
            success: false,
            error: 'api_key_error',
            errorType: 'api_key_error',
            message: 'AI service configuration error. Please check API key settings.'
        };
    }
    if (errorMessage.includes('quota') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
        return {
            success: false,
            error: 'quota_exceeded',
            errorType: 'quota_exceeded',
            message: 'API quota exceeded. Please try again later.'
        };
    }
    if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
        return {
            success: false,
            error: 'rate_limit',
            errorType: 'rate_limit',
            message: 'Rate limit reached. Please wait and try again.'
        };
    }
    if (errorMessage.includes('unavailable') || errorMessage.includes('service')) {
        return {
            success: false,
            error: 'ai_service_error',
            errorType: 'ai_service_error',
            message: 'AI service is currently unavailable.'
        };
    }
    return {
        success: false,
        error: 'event_failed',
        errorType: 'event_failed',
        message: errorMessage || 'Failed to generate trial event. Please try again.'
    };
}
function getStatusCode(errorType) {
    switch(errorType){
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
        default:
            return 500;
    }
}
async function POST(req) {
    try {
        const body = await req.json();
        const { moleculeName, phaseName, phaseDescription, currentStats, previousEvents, chemicalFeatures } = body || {};
        // Input validation
        if (!moleculeName || typeof moleculeName !== 'string') {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'validation_error',
                errorType: 'validation_error',
                message: 'Missing or invalid moleculeName parameter.'
            }, {
                status: 400
            });
        }
        if (!phaseName || typeof phaseName !== 'string') {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'validation_error',
                errorType: 'validation_error',
                message: 'Missing or invalid phaseName parameter.'
            }, {
                status: 400
            });
        }
        // Call AI service with validated params
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$actions$2f$ai$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateTrialEventAction"])(moleculeName, phaseName, String(phaseDescription || ''), {
            budget: Number(currentStats?.budget || 0),
            efficacy: Number(currentStats?.efficacy || 0),
            safety: Number(currentStats?.safety || 0)
        }, Array.isArray(previousEvents) ? previousEvents.map(String) : [], chemicalFeatures ? String(chemicalFeatures) : undefined);
        // Success response
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error('Trial event generation error:', error);
        const errorResponse = categorizeError(error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(errorResponse, {
            status: getStatusCode(errorResponse.errorType)
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__037a46b8._.js.map