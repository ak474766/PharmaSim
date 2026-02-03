
export interface TrialChoice {
    text: string;
    effect: {
        budget: number;  // Cost (negative) or grant (positive)
        efficacy: number; // Percentage change
        safety: number;   // Percentage change
    };
    outcomeText: string;
}

export interface TrialEvent {
    id: string;
    title: string;
    description: string;
    choices: TrialChoice[];
}

export interface TrialPhase {
    id: string;
    name: string;
    description: string;
    minEfficacy: number;
    minSafety: number;
    events: TrialEvent[];
}

export const TRIAL_PHASES: TrialPhase[] = [
    {
        id: 'preclinical',
        name: 'Preclinical Phase',
        description: 'Animal testing and initial toxicity studies.',
        minEfficacy: 30, // Basic potential needed
        minSafety: 50,   // Must be reasonably safe
        events: [
            {
                id: 'tox_liver',
                title: 'Liver Toxicity Detected',
                description: 'Initial tests show elevated liver enzymes in mice.',
                choices: [
                    {
                        text: 'Reformulate (Expensive)',
                        effect: { budget: -2000000, efficacy: -5, safety: +20 },
                        outcomeText: 'Formulation adjusted. Safety improved significantly, but budget took a hit.'
                    },
                    {
                        text: 'Proceed with Caution',
                        effect: { budget: 0, efficacy: 0, safety: -10 },
                        outcomeText: 'You ignored the warning signs. Safety concerns linger.'
                    }
                ]
            },
            {
                id: 'solubility',
                title: 'Low Solubility',
                description: 'The drug is not dissolving well in blood simulation.',
                choices: [
                    {
                        text: 'Add Nanoparticles',
                        effect: { budget: -1000000, efficacy: +15, safety: -5 },
                        outcomeText: 'Absorption improved, but complications slightly increased.'
                    },
                    {
                        text: 'Increase Dosage',
                        effect: { budget: -100000, efficacy: +5, safety: -15 },
                        outcomeText: 'Potency up, but toxicity risks are rising.'
                    }
                ]
            }
        ]
    },
    {
        id: 'phase1',
        name: 'Phase I',
        description: 'Safety testing in a small group of healthy volunteers.',
        minEfficacy: 30,
        minSafety: 60,
        events: [
            {
                id: 'p1_headache',
                title: 'Mild Side Effects',
                description: 'Volunteers report severe headaches.',
                choices: [
                    {
                        text: 'Pause & Investigate',
                        effect: { budget: -1500000, efficacy: 0, safety: +10 },
                        outcomeText: 'Cause identified as hydration issue. Protocol updated.'
                    },
                    {
                        text: 'Ignore (Common)',
                        effect: { budget: 0, efficacy: 0, safety: -5 },
                        outcomeText: 'Trial continues, but reports persist.'
                    }
                ]
            }
        ]
    },
    {
        id: 'phase2',
        name: 'Phase II',
        description: 'Efficacy testing in patients with the disease.',
        minEfficacy: 50,
        minSafety: 65,
        events: [
            {
                id: 'p2_efficacy',
                title: 'Mixed Results',
                description: 'Analysis shows the drug works well only in younger patients.',
                choices: [
                    {
                        text: 'Narrow Target Group',
                        effect: { budget: -500000, efficacy: +20, safety: +5 },
                        outcomeText: 'Efficacy metrics soared for the target demographic.'
                    },
                    {
                        text: 'Broaden Study',
                        effect: { budget: -3000000, efficacy: -5, safety: 0 },
                        outcomeText: 'Expensive expanded trial returned average results.'
                    }
                ]
            },
            {
                id: 'p2_competitor',
                title: 'Competitor News',
                description: 'A rival lab released a similar drug.',
                choices: [
                    {
                        text: 'Rush Trial',
                        effect: { budget: -500000, efficacy: -10, safety: -15 },
                        outcomeText: 'Speed incidents caused data errors and safety slips.'
                    },
                    {
                        text: 'Stay the Course',
                        effect: { budget: 0, efficacy: +5, safety: +5 },
                        outcomeText: 'Quality data won out. The competitor had recalls.'
                    }
                ]
            }
        ]
    },
    {
        id: 'phase3',
        name: 'Phase III',
        description: 'Large scale testing for final validation.',
        minEfficacy: 70,
        minSafety: 80,
        events: [
            {
                id: 'p3_adverse',
                title: 'Rare Adverse Event',
                description: '0.1% of patients experienced irregular heartbeats.',
                choices: [
                    {
                        text: 'Halting Trial',
                        effect: { budget: -5000000, efficacy: 0, safety: +15 },
                        outcomeText: 'Massive cost, but safety board approved restart.'
                    },
                    {
                        text: 'Update Warning Label',
                        effect: { budget: -500000, efficacy: 0, safety: -10 },
                        outcomeText: 'Risky move. FDA noted this decision.'
                    }
                ]
            }
        ]
    }
];

export const INITIAL_STATS = {
    budget: 10000000, // $10M
    efficacy: 0,      // Start at 0, builds up
    safety: 100       // Start perfect, degrades
};
