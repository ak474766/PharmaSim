
export type QuizTopic = 'kinetics' | 'regulatory' | 'pharmacology' | 'chemistry';

export interface Question {
    id: string;
    topic: QuizTopic;
    difficulty: 1 | 2 | 3 | 4 | 5;
    level?: number; // Target Semester Level
    text: string;
    options: string[];
    correctIndex: number;
    explanation: string;
}

export const QUESTION_BANK: Question[] = [
    // --- LEVEL 1: Pharm Analysis ---
    {
        id: 'L1_1',
        topic: 'chemistry',
        difficulty: 1,
        level: 1,
        text: 'What is the primary purpose of titration in pharmaceutical analysis?',
        options: ['To synthesize drugs', 'To determine concentration', 'To measure temperature', 'To break bonds'],
        correctIndex: 1,
        explanation: 'Titration is a quantitative technique used to determine the concentration of an analyte.'
    },
    {
        id: 'L1_2',
        topic: 'chemistry',
        difficulty: 2,
        level: 1,
        text: 'Which indicator is commonly used in acid-base titrations involving strong acid and strong base?',
        options: ['Starch', 'Phenolphthalein', 'Eriochrome Black T', 'Ferroin'],
        correctIndex: 1,
        explanation: 'Phenolphthalein is standard for strong acid-base titrations, changing color around pH 8-10.'
    },

    // --- LEVEL 2: Organic Chem I ---
    {
        id: 'L2_1',
        topic: 'chemistry',
        difficulty: 2,
        level: 2,
        text: 'What is the product of the reaction between Salicylic acid and Acetic anhydride?',
        options: ['Paracetamol', 'Ibuprofen', 'Aspirin', 'Benzoic Acid'],
        correctIndex: 2,
        explanation: 'Aspirin (Acetylsalicylic acid) is formed by acetylation of Salicylic acid.'
    },

    // --- LEVEL 3: Organic Chem II ---
    {
        id: 'L3_1',
        topic: 'chemistry',
        difficulty: 3,
        level: 3,
        text: 'Why is Benzene more stable than expected for a cyclic triene?',
        options: ['High Reactivity', 'Resonance Energy', 'Weak Bonds', 'Octet Rule violation'],
        correctIndex: 1,
        explanation: 'Delocalization of pi-electrons (Resonance) confers extra stability to the aromatic ring.'
    },

    // --- LEVEL 4: Med Chem I ---
    {
        id: 'L4_1',
        topic: 'pharmacology',
        difficulty: 3,
        level: 4,
        text: 'Which term describes the relationship between chemical structure and biological activity?',
        options: ['SAR', 'NMR', 'HPLC', 'TLC'],
        correctIndex: 0,
        explanation: 'Structure-Activity Relationship (SAR) studies how structural changes affect potency and efficacy.'
    },

    // --- LEVEL 5: Pharmacology ---
    {
        id: 'L5_1',
        topic: 'pharmacology',
        difficulty: 4,
        level: 5,
        text: 'Beta-lactam antibiotics (like Penicillin) work by inhibiting:',
        options: ['Protein synthesis', 'Cell wall synthesis', 'DNA replication', 'Folic acid synthesis'],
        correctIndex: 1,
        explanation: 'They inhibit penicillin-binding proteins (PBPs), preventing bacterial cell wall cross-linking.'
    },

    // --- LEVEL 6: Herbal Tech ---
    {
        id: 'L6_1',
        topic: 'kinetics',
        difficulty: 3,
        level: 6,
        text: 'Which extraction method is best for heat-sensitive volatile oils?',
        options: ['Soxhlet', 'Steam Distillation', 'Maceration', 'Cold Expression'],
        correctIndex: 3,
        explanation: 'Cold expression is used for citrus oils to avoid thermal degradation.'
    },

    // --- LEVEL 7: NDDS ---
    {
        id: 'L7_1',
        topic: 'kinetics',
        difficulty: 4,
        level: 7,
        text: 'Liposomes are primarily chemically composed of:',
        options: ['Proteins', 'Phospholipids', 'Carbohydrates', 'Metals'],
        correctIndex: 1,
        explanation: 'Liposomes are spherical vesicles formed by a lipid bilayer of phospholipids.'
    },

    // --- LEVEL 8: Clinical Research ---
    {
        id: 'L8_1', // Previous R1_easy
        topic: 'regulatory',
        difficulty: 1,
        level: 8,
        text: 'Which agency is responsible for drug approval in the USA?',
        options: ['EMA', 'WHO', 'FDA', 'CDC'],
        correctIndex: 2,
        explanation: 'The FDA (Food and Drug Administration) regulates drug approval in the US.'
    },
    {
        id: 'L8_2', // Previous R2_med
        topic: 'regulatory',
        difficulty: 3,
        level: 8,
        text: 'What application is submitted to start clinical trials in humans?',
        options: ['NDA', 'IND', 'ANDA', 'BLA'],
        correctIndex: 1,
        explanation: 'An IND (Investigational New Drug) application is required before Phase I trials.'
    },
    {
        id: 'L8_3',
        topic: 'regulatory',
        difficulty: 5,
        level: 8,
        text: 'Phase IV clinical trials are also known as:',
        options: ['Dose ranging', 'Therapeutic confirmation', 'Post-marketing surveillance', 'Safety screening'],
        correctIndex: 2,
        explanation: 'Phase IV occurs after approval to monitor long-term safety in the general population.'
    }
];

export const getQuestionsForLevel = (level: number, count = 5): Question[] => {
    // Filter by level (strict)
    let pool = QUESTION_BANK.filter(q => q.level === level);

    // If not enough level-specific questions, fallback to same topic
    if (pool.length < count) {
        // Find topic for this level (hacky lookup, ideally store map)
        const sample = pool[0];
        if (sample) {
            const more = QUESTION_BANK.filter(q => q.topic === sample.topic && !q.level);
            pool = [...pool, ...more];
        }
    }

    // Shuffle and slice
    return pool.sort(() => 0.5 - Math.random()).slice(0, count);
};
