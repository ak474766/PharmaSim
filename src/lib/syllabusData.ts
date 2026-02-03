
export interface AtomTemplate {
    id: number;
    element: string;
    position: [number, number, number];
}

export interface BondTemplate {
    source: number;
    target: number;
    order: number; // 1 = single, 2 = double, 3 = triple
}

export interface MoleculeTemplate {
    name: string;
    description: string;
    atoms: AtomTemplate[];
    bonds: BondTemplate[];
}

export interface SyllabusLevel {
    level: number;
    semester: string;
    title: string;
    description: string;
    moleculeTemplate: MoleculeTemplate;
    quizTopic: string;
    learningObjective: string;
}

// ==================== MOLECULE TEMPLATES ====================
// All molecules now include hydrogen atoms and proper bond orders

const PARACETAMOL_TEMPLATE: MoleculeTemplate = {
    name: 'Paracetamol',
    description: 'C8H9NO2 - Benzene ring + Hydroxyl + Acetamide group.',
    atoms: [
        // Benzene ring
        { id: 1, element: 'C', position: [0, 0, 0] },
        { id: 2, element: 'C', position: [1.4, 0, 0] },
        { id: 3, element: 'C', position: [2.1, 1.2, 0] },
        { id: 4, element: 'C', position: [1.4, 2.4, 0] },
        { id: 5, element: 'C', position: [0, 2.4, 0] },
        { id: 6, element: 'C', position: [-0.7, 1.2, 0] },
        // Functional groups
        { id: 7, element: 'O', position: [2.1, -1.2, 0] },  // Hydroxyl O
        { id: 8, element: 'H', position: [3.0, -1.4, 0] },  // Hydroxyl H
        { id: 9, element: 'N', position: [-2.1, 1.2, 0] },  // Amide N
        { id: 10, element: 'H', position: [-2.5, 2.1, 0] }, // Amide H
        { id: 11, element: 'C', position: [-3.0, 0, 0] },   // Acetyl C
        { id: 12, element: 'O', position: [-3.5, -1.0, 0] }, // Carbonyl O
        { id: 13, element: 'C', position: [-4.2, 0.8, 0] },  // Methyl C
        // Ring hydrogens
        { id: 14, element: 'H', position: [3.1, 1.2, 0] },
        { id: 15, element: 'H', position: [2.0, 3.3, 0] },
        { id: 16, element: 'H', position: [-0.6, 3.3, 0] },
        // Methyl hydrogens
        { id: 17, element: 'H', position: [-4.8, 0.0, 0] },
        { id: 18, element: 'H', position: [-4.8, 1.3, 0] },
        { id: 19, element: 'H', position: [-3.8, 1.6, 0] },
    ],
    bonds: [
        // Benzene ring (alternating double bonds for resonance)
        { source: 1, target: 2, order: 2 },
        { source: 2, target: 3, order: 1 },
        { source: 3, target: 4, order: 2 },
        { source: 4, target: 5, order: 1 },
        { source: 5, target: 6, order: 2 },
        { source: 6, target: 1, order: 1 },
        // Hydroxyl group
        { source: 2, target: 7, order: 1 },
        { source: 7, target: 8, order: 1 },
        // Acetamide group
        { source: 6, target: 9, order: 1 },
        { source: 9, target: 10, order: 1 },
        { source: 9, target: 11, order: 1 },
        { source: 11, target: 12, order: 2 },
        { source: 11, target: 13, order: 1 },
        // Ring hydrogens
        { source: 3, target: 14, order: 1 },
        { source: 4, target: 15, order: 1 },
        { source: 5, target: 16, order: 1 },
        // Methyl hydrogens
        { source: 13, target: 17, order: 1 },
        { source: 13, target: 18, order: 1 },
        { source: 13, target: 19, order: 1 },
    ]
};

const ASPIRIN_TEMPLATE: MoleculeTemplate = {
    name: 'Aspirin',
    description: 'C9H8O4 - Acetylsalicylic Acid.',
    atoms: [
        // Benzene ring
        { id: 1, element: 'C', position: [0, 0, 0] },
        { id: 2, element: 'C', position: [1.4, 0, 0] },
        { id: 3, element: 'C', position: [2.1, 1.2, 0] },
        { id: 4, element: 'C', position: [1.4, 2.4, 0] },
        { id: 5, element: 'C', position: [0, 2.4, 0] },
        { id: 6, element: 'C', position: [-0.7, 1.2, 0] },
        // Carboxylic acid
        { id: 7, element: 'C', position: [2.8, -1.2, 0] },
        { id: 8, element: 'O', position: [4.0, -0.8, 0] },  // =O
        { id: 9, element: 'O', position: [2.4, -2.4, 0] },  // -OH
        { id: 10, element: 'H', position: [3.2, -2.8, 0] }, // COOH H
        // Ester group
        { id: 11, element: 'O', position: [-2.0, 1.2, 0] },
        { id: 12, element: 'C', position: [-3.0, 0.4, 0] },  // Acetyl C
        { id: 13, element: 'O', position: [-3.5, -0.6, 0] }, // =O
        { id: 14, element: 'C', position: [-4.0, 1.4, 0] },  // CH3
        // Ring hydrogens
        { id: 15, element: 'H', position: [0, -0.9, 0] },
        { id: 16, element: 'H', position: [3.1, 1.2, 0] },
        { id: 17, element: 'H', position: [2.0, 3.3, 0] },
        { id: 18, element: 'H', position: [-0.6, 3.3, 0] },
        // Methyl hydrogens
        { id: 19, element: 'H', position: [-4.6, 0.8, 0] },
        { id: 20, element: 'H', position: [-4.6, 2.0, 0] },
        { id: 21, element: 'H', position: [-3.4, 2.2, 0] },
    ],
    bonds: [
        // Benzene ring
        { source: 1, target: 2, order: 2 },
        { source: 2, target: 3, order: 1 },
        { source: 3, target: 4, order: 2 },
        { source: 4, target: 5, order: 1 },
        { source: 5, target: 6, order: 2 },
        { source: 6, target: 1, order: 1 },
        // Carboxylic acid
        { source: 2, target: 7, order: 1 },
        { source: 7, target: 8, order: 2 },
        { source: 7, target: 9, order: 1 },
        { source: 9, target: 10, order: 1 },
        // Ester group
        { source: 6, target: 11, order: 1 },
        { source: 11, target: 12, order: 1 },
        { source: 12, target: 13, order: 2 },
        { source: 12, target: 14, order: 1 },
        // Ring hydrogens
        { source: 1, target: 15, order: 1 },
        { source: 3, target: 16, order: 1 },
        { source: 4, target: 17, order: 1 },
        { source: 5, target: 18, order: 1 },
        // Methyl hydrogens
        { source: 14, target: 19, order: 1 },
        { source: 14, target: 20, order: 1 },
        { source: 14, target: 21, order: 1 },
    ]
};

const BENZENE_TEMPLATE: MoleculeTemplate = {
    name: 'Benzene',
    description: 'C6H6 - The fundamental aromatic ring with delocalized electrons.',
    atoms: [
        { id: 1, element: 'C', position: [0, 1.4, 0] },
        { id: 2, element: 'C', position: [1.2, 0.7, 0] },
        { id: 3, element: 'C', position: [1.2, -0.7, 0] },
        { id: 4, element: 'C', position: [0, -1.4, 0] },
        { id: 5, element: 'C', position: [-1.2, -0.7, 0] },
        { id: 6, element: 'C', position: [-1.2, 0.7, 0] },
        // All hydrogens
        { id: 7, element: 'H', position: [0, 2.4, 0] },
        { id: 8, element: 'H', position: [2.1, 1.2, 0] },
        { id: 9, element: 'H', position: [2.1, -1.2, 0] },
        { id: 10, element: 'H', position: [0, -2.4, 0] },
        { id: 11, element: 'H', position: [-2.1, -1.2, 0] },
        { id: 12, element: 'H', position: [-2.1, 1.2, 0] },
    ],
    bonds: [
        // Alternating double bonds (resonance structure)
        { source: 1, target: 2, order: 2 },
        { source: 2, target: 3, order: 1 },
        { source: 3, target: 4, order: 2 },
        { source: 4, target: 5, order: 1 },
        { source: 5, target: 6, order: 2 },
        { source: 6, target: 1, order: 1 },
        // C-H bonds
        { source: 1, target: 7, order: 1 },
        { source: 2, target: 8, order: 1 },
        { source: 3, target: 9, order: 1 },
        { source: 4, target: 10, order: 1 },
        { source: 5, target: 11, order: 1 },
        { source: 6, target: 12, order: 1 },
    ]
};

const IBUPROFEN_TEMPLATE: MoleculeTemplate = {
    name: 'Ibuprofen',
    description: 'C13H18O2 - Propionic acid derivative NSAID.',
    atoms: [
        // Benzene ring
        { id: 1, element: 'C', position: [0, 0, 0] },
        { id: 2, element: 'C', position: [1.4, 0, 0] },
        { id: 3, element: 'C', position: [2.1, 1.2, 0] },
        { id: 4, element: 'C', position: [1.4, 2.4, 0] },
        { id: 5, element: 'C', position: [0, 2.4, 0] },
        { id: 6, element: 'C', position: [-0.7, 1.2, 0] },
        // Propionic acid chain
        { id: 7, element: 'C', position: [3.5, 1.2, 0] },  // CH
        { id: 8, element: 'C', position: [4.2, 0.2, 0] },  // CH3
        { id: 9, element: 'C', position: [4.2, 2.4, 0] },  // COOH
        { id: 10, element: 'O', position: [5.4, 2.2, 0] }, // =O
        { id: 11, element: 'O', position: [3.8, 3.6, 0] }, // -OH
        { id: 12, element: 'H', position: [4.5, 4.0, 0] }, // -OH H
        // Isobutyl group
        { id: 13, element: 'C', position: [-2.1, 1.2, 0] }, // CH2
        { id: 14, element: 'C', position: [-3.0, 0.0, 0] }, // CH
        { id: 15, element: 'C', position: [-4.4, 0.2, 0] }, // CH3
        { id: 16, element: 'C', position: [-2.6, -1.4, 0] }, // CH3
        // Key hydrogens
        { id: 17, element: 'H', position: [0, -0.9, 0] },
        { id: 18, element: 'H', position: [2.0, -0.9, 0] },
        { id: 19, element: 'H', position: [2.0, 3.3, 0] },
        { id: 20, element: 'H', position: [-0.6, 3.3, 0] },
    ],
    bonds: [
        // Benzene ring
        { source: 1, target: 2, order: 2 },
        { source: 2, target: 3, order: 1 },
        { source: 3, target: 4, order: 2 },
        { source: 4, target: 5, order: 1 },
        { source: 5, target: 6, order: 2 },
        { source: 6, target: 1, order: 1 },
        // Propionic acid
        { source: 3, target: 7, order: 1 },
        { source: 7, target: 8, order: 1 },
        { source: 7, target: 9, order: 1 },
        { source: 9, target: 10, order: 2 },
        { source: 9, target: 11, order: 1 },
        { source: 11, target: 12, order: 1 },
        // Isobutyl
        { source: 6, target: 13, order: 1 },
        { source: 13, target: 14, order: 1 },
        { source: 14, target: 15, order: 1 },
        { source: 14, target: 16, order: 1 },
        // Ring H
        { source: 1, target: 17, order: 1 },
        { source: 2, target: 18, order: 1 },
        { source: 4, target: 19, order: 1 },
        { source: 5, target: 20, order: 1 },
    ]
};

const PENICILLIN_TEMPLATE: MoleculeTemplate = {
    name: 'Penicillin G Core',
    description: 'Beta-lactam + Thiazolidine ring system.',
    atoms: [
        // Beta-lactam ring (4-membered)
        { id: 1, element: 'C', position: [0, 0, 0] },
        { id: 2, element: 'N', position: [1.2, 0.5, 0] },
        { id: 3, element: 'C', position: [1.2, 1.8, 0] },
        { id: 4, element: 'C', position: [0, 1.3, 0] },
        { id: 5, element: 'O', position: [2.2, 2.5, 0] }, // Carbonyl =O
        // Thiazolidine ring (5-membered)
        { id: 6, element: 'S', position: [-1.2, 0.5, 0] },
        { id: 7, element: 'C', position: [-1.2, 2.0, 0] },
        { id: 8, element: 'C', position: [-2.4, 2.8, 0] }, // COOH
        { id: 9, element: 'O', position: [-3.4, 2.2, 0] }, // =O
        { id: 10, element: 'O', position: [-2.4, 4.0, 0] }, // -OH
        { id: 11, element: 'H', position: [-3.2, 4.4, 0] },
        // Methyl groups on thiazolidine
        { id: 12, element: 'C', position: [-2.0, 3.0, 1.0] },
        { id: 13, element: 'C', position: [-2.0, 3.0, -1.0] },
        // Amide side chain
        { id: 14, element: 'C', position: [2.4, -0.2, 0] }, // C=O
        { id: 15, element: 'O', position: [2.8, -1.3, 0] },
        { id: 16, element: 'H', position: [2.8, 0.6, 0] },
    ],
    bonds: [
        // Beta-lactam ring
        { source: 1, target: 2, order: 1 },
        { source: 2, target: 3, order: 1 },
        { source: 3, target: 4, order: 1 },
        { source: 4, target: 1, order: 1 },
        { source: 3, target: 5, order: 2 },
        // Thiazolidine
        { source: 4, target: 6, order: 1 },
        { source: 6, target: 7, order: 1 },
        { source: 7, target: 4, order: 1 },
        { source: 7, target: 8, order: 1 },
        { source: 8, target: 9, order: 2 },
        { source: 8, target: 10, order: 1 },
        { source: 10, target: 11, order: 1 },
        // Methyl
        { source: 7, target: 12, order: 1 },
        { source: 7, target: 13, order: 1 },
        // Side chain
        { source: 2, target: 14, order: 1 },
        { source: 14, target: 15, order: 2 },
        { source: 14, target: 16, order: 1 },
    ]
};

const MORPHINE_TEMPLATE: MoleculeTemplate = {
    name: 'Morphine Core',
    description: 'C17H19NO3 - Phenanthrene backbone with key functional groups.',
    atoms: [
        // Ring A (aromatic)
        { id: 1, element: 'C', position: [0, 0, 0] },
        { id: 2, element: 'C', position: [1.4, 0, 0] },
        { id: 3, element: 'C', position: [2.1, 1.2, 0] },
        { id: 4, element: 'C', position: [1.4, 2.4, 0] },
        { id: 5, element: 'C', position: [0, 2.4, 0] },
        { id: 6, element: 'C', position: [-0.7, 1.2, 0] },
        // Phenolic OH
        { id: 7, element: 'O', position: [-2.0, 1.2, 0] },
        { id: 8, element: 'H', position: [-2.5, 0.5, 0] },
        // Ether oxygen bridge
        { id: 9, element: 'O', position: [3.4, 1.2, 0] },
        // Ring B carbon
        { id: 10, element: 'C', position: [3.8, 2.4, 0] },
        // Tertiary amine nitrogen
        { id: 11, element: 'N', position: [0, 3.8, 1.0] },
        { id: 12, element: 'C', position: [-1.2, 4.4, 1.2] }, // N-CH3
        // Allylic OH
        { id: 13, element: 'C', position: [2.8, 3.4, 0.5] },
        { id: 14, element: 'O', position: [3.2, 4.6, 0.8] },
        { id: 15, element: 'H', position: [4.0, 4.8, 0.5] },
    ],
    bonds: [
        // Aromatic ring
        { source: 1, target: 2, order: 2 },
        { source: 2, target: 3, order: 1 },
        { source: 3, target: 4, order: 2 },
        { source: 4, target: 5, order: 1 },
        { source: 5, target: 6, order: 2 },
        { source: 6, target: 1, order: 1 },
        // Phenol
        { source: 6, target: 7, order: 1 },
        { source: 7, target: 8, order: 1 },
        // Ether bridge
        { source: 3, target: 9, order: 1 },
        { source: 9, target: 10, order: 1 },
        // Tertiary amine
        { source: 5, target: 11, order: 1 },
        { source: 11, target: 12, order: 1 },
        // Alcohol
        { source: 4, target: 13, order: 1 },
        { source: 13, target: 14, order: 1 },
        { source: 14, target: 15, order: 1 },
    ]
};

const LIPOSOME_TEMPLATE: MoleculeTemplate = {
    name: 'Phospholipid',
    description: 'Phosphatidylcholine - key component of liposomal delivery.',
    atoms: [
        // Phosphate head
        { id: 1, element: 'P', position: [0, 3, 0] },
        { id: 2, element: 'O', position: [0.8, 3.8, 0] },  // P=O
        { id: 3, element: 'O', position: [-0.8, 3.8, 0] }, // P-O-
        { id: 4, element: 'O', position: [0, 2, 0] },      // Ester O
        // Glycerol backbone
        { id: 5, element: 'C', position: [0, 1, 0] },
        { id: 6, element: 'C', position: [1.2, 0.5, 0] },
        { id: 7, element: 'C', position: [-1.2, 0.5, 0] },
        // Fatty acid tails
        { id: 8, element: 'O', position: [2.0, 1.2, 0] },  // Ester O
        { id: 9, element: 'C', position: [3.0, 0.8, 0] },  // C=O
        { id: 10, element: 'O', position: [3.5, 1.6, 0] }, // =O
        { id: 11, element: 'C', position: [3.5, -0.4, 0] }, // Chain start
        { id: 12, element: 'C', position: [4.0, -1.6, 0] },
        { id: 13, element: 'C', position: [4.5, -2.8, 0] },
        // Second tail
        { id: 14, element: 'O', position: [-2.0, 1.2, 0] },
        { id: 15, element: 'C', position: [-3.0, 0.8, 0] },
        { id: 16, element: 'O', position: [-3.5, 1.6, 0] },
        { id: 17, element: 'C', position: [-3.5, -0.4, 0] },
        { id: 18, element: 'C', position: [-4.0, -1.6, 0] },
        { id: 19, element: 'C', position: [-4.5, -2.8, 0] },
        // Choline head
        { id: 20, element: 'N', position: [0, 5, 0] },
    ],
    bonds: [
        // Phosphate
        { source: 1, target: 2, order: 2 },
        { source: 1, target: 3, order: 1 },
        { source: 1, target: 4, order: 1 },
        { source: 4, target: 5, order: 1 },
        // Glycerol
        { source: 5, target: 6, order: 1 },
        { source: 5, target: 7, order: 1 },
        // Tail 1
        { source: 6, target: 8, order: 1 },
        { source: 8, target: 9, order: 1 },
        { source: 9, target: 10, order: 2 },
        { source: 9, target: 11, order: 1 },
        { source: 11, target: 12, order: 1 },
        { source: 12, target: 13, order: 1 },
        // Tail 2
        { source: 7, target: 14, order: 1 },
        { source: 14, target: 15, order: 1 },
        { source: 15, target: 16, order: 2 },
        { source: 15, target: 17, order: 1 },
        { source: 17, target: 18, order: 1 },
        { source: 18, target: 19, order: 1 },
        // Choline
        { source: 3, target: 20, order: 1 },
    ]
};

const CANDIDATE_X_TEMPLATE: MoleculeTemplate = {
    name: 'Candidate-X',
    description: 'Novel Fluorinated Oncology Drug for Clinical Trial.',
    atoms: [
        // Core structure
        { id: 1, element: 'C', position: [0, 0, 0] },
        { id: 2, element: 'C', position: [1.4, 0, 0] },
        { id: 3, element: 'N', position: [2.1, 1.0, 0] },
        { id: 4, element: 'C', position: [3.4, 1.2, 0] },
        { id: 5, element: 'O', position: [4.0, 2.2, 0] },
        // Fluorine substituents (for enhanced activity)
        { id: 6, element: 'F', position: [-1.0, 0.8, 0] },
        { id: 7, element: 'F', position: [-1.0, -0.8, 0] },
        // Additional ring
        { id: 8, element: 'C', position: [4.0, 0, 0] },
        { id: 9, element: 'C', position: [5.2, 0.5, 0] },
        { id: 10, element: 'N', position: [5.8, -0.5, 0] },
        // Hydrogens
        { id: 11, element: 'H', position: [0, -0.9, 0] },
        { id: 12, element: 'H', position: [1.8, -0.9, 0] },
        { id: 13, element: 'H', position: [1.8, 1.8, 0] },
        { id: 14, element: 'H', position: [3.8, -0.9, 0] },
        { id: 15, element: 'H', position: [6.8, -0.5, 0] },
    ],
    bonds: [
        // Core
        { source: 1, target: 2, order: 2 },
        { source: 2, target: 3, order: 1 },
        { source: 3, target: 4, order: 1 },
        { source: 4, target: 5, order: 2 },
        // Fluorines
        { source: 1, target: 6, order: 1 },
        { source: 1, target: 7, order: 1 },
        // Ring extension
        { source: 4, target: 8, order: 1 },
        { source: 8, target: 9, order: 2 },
        { source: 9, target: 10, order: 1 },
        // Hydrogens
        { source: 2, target: 11, order: 1 },
        { source: 2, target: 12, order: 1 },
        { source: 3, target: 13, order: 1 },
        { source: 8, target: 14, order: 1 },
        { source: 10, target: 15, order: 1 },
    ]
};

// ==================== SYLLABUS LEVELS ====================

export const SYLLABUS_DATA: SyllabusLevel[] = [
    {
        level: 1,
        semester: 'Sem 1',
        title: 'Pharm. Analysis',
        description: 'Synthesize Paracetamol and verify its structural purity.',
        moleculeTemplate: PARACETAMOL_TEMPLATE,
        quizTopic: 'chemistry',
        learningObjective: 'Understand basic aromatic substitution and purity analysis.'
    },
    {
        level: 2,
        semester: 'Sem 2',
        title: 'Organic Chemistry I',
        description: 'Synthesize Aspirin and modify the ester group for stability.',
        moleculeTemplate: ASPIRIN_TEMPLATE,
        quizTopic: 'chemistry',
        learningObjective: 'Master esterification reactions.'
    },
    {
        level: 3,
        semester: 'Sem 3',
        title: 'Organic Chemistry II',
        description: 'Analyze Benzene stability and aromatic resonance.',
        moleculeTemplate: BENZENE_TEMPLATE,
        quizTopic: 'chemistry',
        learningObjective: 'Understand aromaticity and resonance energy.'
    },
    {
        level: 4,
        semester: 'Sem 4',
        title: 'Med. Chem I',
        description: 'Optimize Ibuprofen side-chains for better receptor binding.',
        moleculeTemplate: IBUPROFEN_TEMPLATE,
        quizTopic: 'pharmacology',
        learningObjective: 'Chirality and Structure-Activity Relationship (SAR).'
    },
    {
        level: 5,
        semester: 'Sem 5',
        title: 'Pharmacology',
        description: 'Propose Penicillin modifications to fight bacterial resistance.',
        moleculeTemplate: PENICILLIN_TEMPLATE,
        quizTopic: 'pharmacology',
        learningObjective: 'Antibiotic mechanisms and resistance.'
    },
    {
        level: 6,
        semester: 'Sem 6',
        title: 'Herbal Tech',
        description: 'Perform extraction analysis on Morphine alkaloids.',
        moleculeTemplate: MORPHINE_TEMPLATE,
        quizTopic: 'kinetics',
        learningObjective: 'Extraction techniques and alkaloid chemistry.'
    },
    {
        level: 7,
        semester: 'Sem 7',
        title: 'NDDS',
        description: 'Design a Liposomal delivery system for targeted therapy.',
        moleculeTemplate: LIPOSOME_TEMPLATE,
        quizTopic: 'kinetics',
        learningObjective: 'Novel Drug Delivery Systems.'
    },
    {
        level: 8,
        semester: 'Sem 8',
        title: 'Clinical Research',
        description: 'Guide Candidate-X through a complete Phase I-III Clinical Trial.',
        moleculeTemplate: CANDIDATE_X_TEMPLATE,
        quizTopic: 'regulatory',
        learningObjective: 'Complete IND/NDA process.'
    }
];
