import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini Client
// NOTE: In a real app, do not expose API keys in client-side code.
// For this demo/hackathon, we are using the key from env directly.
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_GENAI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// Helper function to check if error is rate limit related
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

export const AiService = {
    // Phase 1: Analyze Student's Modified Molecule
    async analyzeMolecule(
        moleculeName: string,
        atomCount: number,
        userModifications: string
    ) {
        if (!API_KEY) {
            return {
                analysis: "AI Service Unavailable (Missing Key)",
                safety: 50,
                efficacy: 50,
                feedback: "Please configure your API key in .env.local"
            };
        }

        try {
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

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Cleanup json markdown if present
            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonStr);

        } catch (error: unknown) {
            const err = error as { message?: string; status?: number; response?: { status?: number } };
            const errorMessage = err?.message || String(error) || '';
            const errorStatus = err?.status || err?.response?.status;

            if (isRateLimitError(errorMessage, errorStatus)) {
                console.warn("AI Service Warning: Rate limit or Model not found. Using simulated analysis.");
                // Return simulated "good" result so user can continue
                return {
                    analysis: `[Simulated] Your ${moleculeName} modification shows promise. The ${atomCount} atom structure maintains core stability.`,
                    efficacy: 65 + Math.floor(Math.random() * 20),
                    safety: 70 + Math.floor(Math.random() * 15),
                    feedback: "API quota exceeded or model unavailable - using simulated analysis."
                };
            }

            console.warn("AI Service Error:", errorMessage);
            return {
                analysis: "Analysis failed due to connection error.",
                efficacy: 40,
                safety: 40,
                feedback: "Could not connect to AI lab expert. Please check your internet connection."
            };
        }
    },

    // Phase 2: Generate Context-Aware Quiz Question
    async generateQuestion(topic: string, level: number) {
        if (!API_KEY) return null;

        try {
            const prompt = `
            Generate a single multiple-choice question for a B.Pharma student.
            Topic: ${topic}
            Difficulty Level: ${level} (1=Freshman, 8=Final Year).
            
            Respond in JSON:
            {
                "text": "Question text...",
                "options": ["A", "B", "C", "D"],
                "correctIndex": 0,
                "explanation": "Why..."
            }
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const jsonStr = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonStr);

        } catch (error: unknown) {
            console.error("AI Question Gen Failed:", error);

            const err = error as { message?: string; status?: number; response?: { status?: number } };
            const errorMessage = err?.message || String(error) || '';
            const errorStatus = err?.status || err?.response?.status;

            if (isRateLimitError(errorMessage, errorStatus)) {
                console.warn("API Rate Limit - using local question bank instead.");
            }
            return null;
        }
    },

    /**
     * Generate clinical trial roadmap content for a molecule
     */
    async generateTrialRoadmap(moleculeName: string, efficacy: number, safety: number) {
        if (!API_KEY) return this.getFallbackRoadmap(moleculeName, efficacy, safety);

        try {
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
                "successProbability": number
            }
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonStr);

        } catch (error: unknown) {
            const err = error as { message?: string; status?: number; response?: { status?: number } };
            const errorMessage = err?.message || String(error) || '';
            const errorStatus = err?.status || err?.response?.status;

            if (isRateLimitError(errorMessage, errorStatus)) {
                console.warn("AI Service Warning: Rate limit or Model not found. Using fallback roadmap.");
            } else {
                console.warn("AI Roadmap Generation Failed:", errorMessage);
            }
            return this.getFallbackRoadmap(moleculeName, efficacy, safety);
        }
    },

    /**
     * Fallback roadmap when AI is unavailable
     */
    getFallbackRoadmap(moleculeName: string, efficacy: number, safety: number) {
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
     * Generate a dynamic trial event based on current phase and stats (AI-powered simulation)
     */
    async generateTrialEvent(
        moleculeName: string,
        phaseName: string,
        phaseDescription: string,
        currentStats: { budget: number; efficacy: number; safety: number },
        previousEvents: string[]
    ) {
        if (!API_KEY) return this.getFallbackTrialEvent(phaseName, currentStats);

        try {
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
                        "budgetEffect": number,
                        "efficacyEffect": number,
                        "safetyEffect": number,
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
                "isPhaseComplete": boolean
            }
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonStr);

        } catch (error: unknown) {
            const err = error as { message?: string; status?: number; response?: { status?: number } };
            const errorMessage = err?.message || String(error) || '';
            const errorStatus = err?.status || err?.response?.status;

            if (isRateLimitError(errorMessage, errorStatus)) {
                console.warn("AI Service Warning: Rate limit or Model not found. Using fallback trial event.");
            } else {
                console.warn("AI Trial Event Generation Failed:", errorMessage);
            }
            return this.getFallbackTrialEvent(phaseName, currentStats);
        }
    },

    /**
     * Fallback trial event when AI is unavailable
     */
    getFallbackTrialEvent(phaseName: string, currentStats: { budget: number; efficacy: number; safety: number }) {
        const events: Record<string, {
            title: string;
            description: string;
            choices: Array<{
                text: string;
                budgetEffect: number;
                efficacyEffect: number;
                safetyEffect: number;
                outcomeText: string;
            }>;
            isPhaseComplete: boolean;
        }> = {
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
