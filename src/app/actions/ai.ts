'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini Client with Server-Side Key
const API_KEY = process.env.GOOGLE_GENAI_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_GENAI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export async function analyzeMoleculeAction(
    moleculeName: string,
    atomCount: number,
    userModifications: string
) {
    if (!API_KEY) throw new Error("AI Service Unavailable: Missing API Key");

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
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (error: any) {
        console.error("AI Analysis Failed:", error);
        throw new Error(error.message || "Failed to analyze molecule");
    }
}

export async function generateQuestionAction(topic: string, level: number) {
    if (!API_KEY) return null;

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
        const jsonStr = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("AI Question Gen Failed:", error);
        return null; // Return null to fallback to local
    }
}

export async function generateTrialRoadmapAction(moleculeName: string, efficacy: number, safety: number) {
    if (!API_KEY) throw new Error("Missing API Key");

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
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (error: any) {
        console.error("AI Roadmap Gen Failed:", error);
        throw error;
    }
}

export async function generateTrialEventAction(
    moleculeName: string,
    phaseName: string,
    phaseDescription: string,
    currentStats: { budget: number; efficacy: number; safety: number },
    previousEvents: string[]
) {
    if (!API_KEY) throw new Error("Missing API Key");

    const prompt = `
        You are a pharmaceutical regulatory simulation AI. Generate a realistic trial event for a drug called "${moleculeName}".

        Current Phase: ${phaseName}
        Phase Description: ${phaseDescription}
        
        Current Trial Stats:
        - Budget: $${(currentStats.budget / 1000000).toFixed(1)}M remaining
        - Efficacy Score: ${currentStats.efficacy}%
        - Safety Score: ${currentStats.safety}%

        Previous events in this trial: ${previousEvents.length > 0 ? previousEvents.join(', ') : 'None yet'}

        Generate ONE new event for this phase. The event should be:
        1. Realistic for pharmaceutical trials
        2. Educational about the drug development process
        3. Have meaningful consequences based on choices

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
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (error: any) {
        console.error("AI Event Gen Failed:", error);
        throw error;
    }
}
