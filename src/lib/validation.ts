/**
 * Enhanced Molecular Validation System
 * Provides comprehensive chemistry validation for PharmaSim
 * 
 * Features:
 * - Valence validation with detailed error messages
 * - Graph connectivity analysis
 * - Ring detection (aromatic and aliphatic)
 * - Functional group identification
 * - Expanded molecule recognition database
 * - Molecular weight calculation
 * - Drug-likeness scoring
 * - Educational warnings and hints
 */

import { Atom, Bond, PeriodicTable, ElementData } from './chemistry';

// ============================================================================
// Type Definitions
// ============================================================================

export interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
    score: number;
    name?: string;
    formula?: string;
    molecularWeight?: number;
    functionalGroups?: string[];
    rings?: RingInfo[];
    properties?: MoleculeProperties;
}

export interface RingInfo {
    size: number;
    atomIds: number[];
    isAromatic: boolean;
}

export interface MoleculeProperties {
    atomCount: number;
    bondCount: number;
    heavyAtomCount: number;  // Non-hydrogen atoms
    rotableBonds: number;
    hBondDonors: number;     // OH, NH groups
    hBondAcceptors: number;  // O, N atoms
    isConnected: boolean;
    hasAromaticRing: boolean;
    complexity: number;      // 1-100 scale
}

export interface FunctionalGroup {
    name: string;
    displayName: string;
    pattern: (atoms: Atom[], bonds: Bond[], graph: Map<number, number[]>) => number;  // Returns count
    icon: string;
    drugRelevance: string;
}

// ============================================================================
// Molecule Recognition Database
// ============================================================================

interface MoleculeEntry {
    formula: string;
    name: string;
    score: number;
    category: 'simple' | 'organic' | 'drug' | 'biomolecule';
    description?: string;
}

const MOLECULE_DATABASE: MoleculeEntry[] = [
    // Simple molecules
    { formula: 'H2', name: 'Hydrogen Gas', score: 10, category: 'simple' },
    { formula: 'O2', name: 'Oxygen Gas', score: 10, category: 'simple' },
    { formula: 'N2', name: 'Nitrogen Gas', score: 10, category: 'simple' },
    { formula: 'H2O', name: 'Water', score: 30, category: 'simple', description: 'Universal solvent' },
    { formula: 'CO2', name: 'Carbon Dioxide', score: 40, category: 'simple' },
    { formula: 'NH3', name: 'Ammonia', score: 35, category: 'simple' },
    { formula: 'HCl', name: 'Hydrochloric Acid', score: 25, category: 'simple' },
    { formula: 'HF', name: 'Hydrofluoric Acid', score: 25, category: 'simple' },
    { formula: 'H2S', name: 'Hydrogen Sulfide', score: 30, category: 'simple' },

    // Basic organic
    { formula: 'CH4', name: 'Methane', score: 50, category: 'organic', description: 'Simplest alkane' },
    { formula: 'C2H6', name: 'Ethane', score: 60, category: 'organic' },
    { formula: 'C3H8', name: 'Propane', score: 70, category: 'organic' },
    { formula: 'C4H10', name: 'Butane', score: 80, category: 'organic' },
    { formula: 'C2H4', name: 'Ethylene', score: 65, category: 'organic', description: 'Simplest alkene' },
    { formula: 'C2H2', name: 'Acetylene', score: 70, category: 'organic', description: 'Simplest alkyne' },
    { formula: 'C6H6', name: 'Benzene', score: 150, category: 'organic', description: 'Aromatic ring' },

    // Alcohols
    { formula: 'CH4O', name: 'Methanol', score: 80, category: 'organic' },
    { formula: 'C2H6O', name: 'Ethanol', score: 100, category: 'organic', description: 'Drinking alcohol' },
    { formula: 'C3H8O', name: 'Propanol', score: 110, category: 'organic' },
    { formula: 'C3H8O3', name: 'Glycerol', score: 140, category: 'organic' },

    // Aldehydes & Ketones
    { formula: 'CH2O', name: 'Formaldehyde', score: 70, category: 'organic' },
    { formula: 'C2H4O', name: 'Acetaldehyde', score: 85, category: 'organic' },
    { formula: 'C3H6O', name: 'Acetone', score: 95, category: 'organic' },

    // Carboxylic Acids
    { formula: 'CH2O2', name: 'Formic Acid', score: 75, category: 'organic' },
    { formula: 'C2H4O2', name: 'Acetic Acid', score: 90, category: 'organic', description: 'Vinegar' },
    { formula: 'C3H6O2', name: 'Propionic Acid', score: 100, category: 'organic' },

    // Amines
    { formula: 'CH5N', name: 'Methylamine', score: 70, category: 'organic' },
    { formula: 'C2H7N', name: 'Ethylamine', score: 80, category: 'organic' },
    { formula: 'C6H7N', name: 'Aniline', score: 130, category: 'organic' },

    // Pharmaceuticals
    { formula: 'C8H9NO2', name: 'Paracetamol', score: 300, category: 'drug', description: 'Acetaminophen - analgesic' },
    { formula: 'C9H8O4', name: 'Aspirin', score: 350, category: 'drug', description: 'Acetylsalicylic acid - NSAID' },
    { formula: 'C13H18O2', name: 'Ibuprofen', score: 400, category: 'drug', description: 'NSAID anti-inflammatory' },
    { formula: 'C8H10N4O2', name: 'Caffeine', score: 450, category: 'drug', description: 'Stimulant' },
    { formula: 'C17H19NO3', name: 'Morphine', score: 500, category: 'drug', description: 'Opioid analgesic' },
    { formula: 'C16H18N2O4S', name: 'Penicillin G', score: 550, category: 'drug', description: 'Beta-lactam antibiotic' },
    { formula: 'C10H15N', name: 'Amphetamine', score: 380, category: 'drug' },
    { formula: 'C20H25N3O', name: 'LSD', score: 600, category: 'drug' },
    { formula: 'C21H23NO5', name: 'Codeine', score: 480, category: 'drug' },
    { formula: 'C14H18N2O5', name: 'Aspartame', score: 350, category: 'organic' },

    // Biomolecules
    { formula: 'C6H12O6', name: 'Glucose', score: 250, category: 'biomolecule', description: 'Simple sugar' },
    { formula: 'C5H10O5', name: 'Ribose', score: 220, category: 'biomolecule' },
    { formula: 'C4H8N2O3', name: 'Asparagine', score: 280, category: 'biomolecule', description: 'Amino acid' },
    { formula: 'C5H9NO4', name: 'Glutamic Acid', score: 290, category: 'biomolecule', description: 'Amino acid' },
    { formula: 'C3H7NO2', name: 'Alanine', score: 200, category: 'biomolecule', description: 'Simple amino acid' },
    { formula: 'C2H5NO2', name: 'Glycine', score: 180, category: 'biomolecule', description: 'Simplest amino acid' },

    // Solvents & Industrial
    { formula: 'CHCl3', name: 'Chloroform', score: 120, category: 'organic' },
    { formula: 'CCl4', name: 'Carbon Tetrachloride', score: 110, category: 'organic' },
    { formula: 'C4H8O2', name: 'Ethyl Acetate', score: 130, category: 'organic', description: 'Common solvent' },
];

// ============================================================================
// Functional Group Definitions
// ============================================================================

const FUNCTIONAL_GROUPS: FunctionalGroup[] = [
    {
        name: 'hydroxyl',
        displayName: 'Hydroxyl (-OH)',
        icon: '💧',
        drugRelevance: 'Increases water solubility',
        pattern: (atoms, bonds, graph) => {
            let count = 0;
            atoms.forEach(atom => {
                if (atom.element === 'O') {
                    const neighbors = graph.get(atom.id) || [];
                    const bondInfo = getBondInfo(atom.id, bonds);
                    // Single-bonded oxygen with one H neighbor
                    if (bondInfo.totalOrder === 2) {
                        const hasH = neighbors.some(nId => atoms.find(a => a.id === nId)?.element === 'H');
                        const hasC = neighbors.some(nId => atoms.find(a => a.id === nId)?.element === 'C');
                        if (hasH && hasC) count++;
                    }
                }
            });
            return count;
        }
    },
    {
        name: 'carbonyl',
        displayName: 'Carbonyl (C=O)',
        icon: '⚗️',
        drugRelevance: 'Reactive center, H-bond acceptor',
        pattern: (atoms, bonds) => {
            let count = 0;
            bonds.forEach(bond => {
                if (bond.order === 2) {
                    const source = atoms.find(a => a.id === bond.sourceId);
                    const target = atoms.find(a => a.id === bond.targetId);
                    if ((source?.element === 'C' && target?.element === 'O') ||
                        (source?.element === 'O' && target?.element === 'C')) {
                        count++;
                    }
                }
            });
            return count;
        }
    },
    {
        name: 'carboxyl',
        displayName: 'Carboxyl (-COOH)',
        icon: '🧪',
        drugRelevance: 'Acidic, increases solubility',
        pattern: (atoms, bonds, graph) => {
            let count = 0;
            // Find C atoms double-bonded to O and single-bonded to OH
            atoms.forEach(atom => {
                if (atom.element === 'C') {
                    const neighbors = graph.get(atom.id) || [];
                    const neighborAtoms = neighbors.map(nId => atoms.find(a => a.id === nId)).filter(Boolean);

                    const hasDoubleBondO = bonds.some(b => {
                        if (b.order !== 2) return false;
                        const otherId = b.sourceId === atom.id ? b.targetId : (b.targetId === atom.id ? b.sourceId : null);
                        if (!otherId) return false;
                        return atoms.find(a => a.id === otherId)?.element === 'O';
                    });

                    const hasSingleBondOH = neighborAtoms.some(neighbor => {
                        if (neighbor?.element !== 'O') return false;
                        const oNeighbors = graph.get(neighbor.id) || [];
                        return oNeighbors.some(onId => atoms.find(a => a.id === onId)?.element === 'H');
                    });

                    if (hasDoubleBondO && hasSingleBondOH) count++;
                }
            });
            return count;
        }
    },
    {
        name: 'amine',
        displayName: 'Amine (-NH₂/-NHR)',
        icon: '🔵',
        drugRelevance: 'Basic, H-bond donor',
        pattern: (atoms, bonds, graph) => {
            let count = 0;
            atoms.forEach(atom => {
                if (atom.element === 'N') {
                    const neighbors = graph.get(atom.id) || [];
                    const hasH = neighbors.some(nId => atoms.find(a => a.id === nId)?.element === 'H');
                    const bondInfo = getBondInfo(atom.id, bonds);
                    // Primary or secondary amine (not in amide)
                    if (hasH && bondInfo.totalOrder <= 3) {
                        const hasDoubleBondC = bonds.some(b => {
                            if (b.order !== 2) return false;
                            const otherId = b.sourceId === atom.id ? b.targetId : (b.targetId === atom.id ? b.sourceId : null);
                            return otherId && atoms.find(a => a.id === otherId)?.element === 'C';
                        });
                        if (!hasDoubleBondC) count++;
                    }
                }
            });
            return count;
        }
    },
    {
        name: 'amide',
        displayName: 'Amide (-CONH₂)',
        icon: '🔗',
        drugRelevance: 'Peptide bond mimic, stable',
        pattern: (atoms, bonds, graph) => {
            let count = 0;
            atoms.forEach(atom => {
                if (atom.element === 'C') {
                    const neighbors = graph.get(atom.id) || [];
                    const hasDoubleBondO = bonds.some(b => {
                        if (b.order !== 2) return false;
                        const otherId = b.sourceId === atom.id ? b.targetId : (b.targetId === atom.id ? b.sourceId : null);
                        return otherId && atoms.find(a => a.id === otherId)?.element === 'O';
                    });
                    const hasSingleBondN = neighbors.some(nId => {
                        const neighbor = atoms.find(a => a.id === nId);
                        if (neighbor?.element !== 'N') return false;
                        const bond = bonds.find(b =>
                            (b.sourceId === atom.id && b.targetId === nId) ||
                            (b.targetId === atom.id && b.sourceId === nId)
                        );
                        return bond?.order === 1;
                    });
                    if (hasDoubleBondO && hasSingleBondN) count++;
                }
            });
            return count;
        }
    },
    {
        name: 'ether',
        displayName: 'Ether (C-O-C)',
        icon: '⭕',
        drugRelevance: 'Increases lipophilicity',
        pattern: (atoms, bonds, graph) => {
            let count = 0;
            atoms.forEach(atom => {
                if (atom.element === 'O') {
                    const neighbors = graph.get(atom.id) || [];
                    const bondInfo = getBondInfo(atom.id, bonds);
                    // O bonded to exactly 2 carbons with single bonds
                    if (bondInfo.totalOrder === 2 && neighbors.length === 2) {
                        const allCarbon = neighbors.every(nId => atoms.find(a => a.id === nId)?.element === 'C');
                        if (allCarbon) count++;
                    }
                }
            });
            return count;
        }
    },
    {
        name: 'ester',
        displayName: 'Ester (-COO-)',
        icon: '🍋',
        drugRelevance: 'Prodrug linkage, good absorption',
        pattern: (atoms, bonds, graph) => {
            let count = 0;
            atoms.forEach(atom => {
                if (atom.element === 'C') {
                    const neighbors = graph.get(atom.id) || [];
                    let hasDoubleBondO = false;
                    let hasSingleBondOC = false;

                    neighbors.forEach(nId => {
                        const neighbor = atoms.find(a => a.id === nId);
                        if (!neighbor) return;

                        const bond = bonds.find(b =>
                            (b.sourceId === atom.id && b.targetId === nId) ||
                            (b.targetId === atom.id && b.sourceId === nId)
                        );

                        if (neighbor.element === 'O' && bond?.order === 2) {
                            hasDoubleBondO = true;
                        }
                        if (neighbor.element === 'O' && bond?.order === 1) {
                            // Check if this O is connected to C (not H)
                            const oNeighbors = graph.get(nId) || [];
                            const connectedToC = oNeighbors.some(onId =>
                                onId !== atom.id && atoms.find(a => a.id === onId)?.element === 'C'
                            );
                            if (connectedToC) hasSingleBondOC = true;
                        }
                    });

                    if (hasDoubleBondO && hasSingleBondOC) count++;
                }
            });
            return count;
        }
    },
    {
        name: 'halogen',
        displayName: 'Halogen (F/Cl/Br/I)',
        icon: '🟢',
        drugRelevance: 'Metabolic stability, lipophilicity',
        pattern: (atoms) => {
            return atoms.filter(a => ['F', 'Cl', 'Br', 'I'].includes(a.element)).length;
        }
    },
    {
        name: 'thiol',
        displayName: 'Thiol (-SH)',
        icon: '🟡',
        drugRelevance: 'Reactive, covalent drug target',
        pattern: (atoms, bonds, graph) => {
            let count = 0;
            atoms.forEach(atom => {
                if (atom.element === 'S') {
                    const neighbors = graph.get(atom.id) || [];
                    const hasH = neighbors.some(nId => atoms.find(a => a.id === nId)?.element === 'H');
                    if (hasH) count++;
                }
            });
            return count;
        }
    },
    {
        name: 'phosphate',
        displayName: 'Phosphate (-PO₄)',
        icon: '🟠',
        drugRelevance: 'Energy transfer, nucleotides',
        pattern: (atoms, bonds, graph) => {
            let count = 0;
            atoms.forEach(atom => {
                if (atom.element === 'P') {
                    const neighbors = graph.get(atom.id) || [];
                    const oxygenCount = neighbors.filter(nId =>
                        atoms.find(a => a.id === nId)?.element === 'O'
                    ).length;
                    if (oxygenCount >= 3) count++;
                }
            });
            return count;
        }
    }
];

// ============================================================================
// Helper Functions
// ============================================================================

function getBondInfo(atomId: number, bonds: Bond[]): { count: number; totalOrder: number } {
    const atomBonds = bonds.filter(b => b.sourceId === atomId || b.targetId === atomId);
    return {
        count: atomBonds.length,
        totalOrder: atomBonds.reduce((acc, b) => acc + b.order, 0)
    };
}

function buildAdjacencyGraph(atoms: Atom[], bonds: Bond[]): Map<number, number[]> {
    const graph = new Map<number, number[]>();
    atoms.forEach(atom => graph.set(atom.id, []));

    bonds.forEach(bond => {
        graph.get(bond.sourceId)?.push(bond.targetId);
        graph.get(bond.targetId)?.push(bond.sourceId);
    });

    return graph;
}

function isConnected(atoms: Atom[], graph: Map<number, number[]>): boolean {
    if (atoms.length === 0) return true;
    if (atoms.length === 1) return true;

    const visited = new Set<number>();
    const queue: number[] = [atoms[0].id];

    while (queue.length > 0) {
        const current = queue.shift()!;
        if (visited.has(current)) continue;
        visited.add(current);

        const neighbors = graph.get(current) || [];
        neighbors.forEach(n => {
            if (!visited.has(n)) queue.push(n);
        });
    }

    return visited.size === atoms.length;
}

function findRings(atoms: Atom[], bonds: Bond[], graph: Map<number, number[]>): RingInfo[] {
    const rings: RingInfo[] = [];
    const visited = new Set<number>();

    // Simple ring detection using DFS with parent tracking
    function dfs(nodeId: number, parentId: number | null, path: number[]): void {
        if (path.length > 7) return; // Limit to reasonable ring sizes

        const neighbors = graph.get(nodeId) || [];

        for (const neighborId of neighbors) {
            if (neighborId === parentId) continue;

            const pathIndex = path.indexOf(neighborId);
            if (pathIndex !== -1) {
                // Found a ring
                const ringAtoms = path.slice(pathIndex);
                const ringSize = ringAtoms.length;

                // Only accept 3-7 membered rings
                if (ringSize >= 3 && ringSize <= 7) {
                    // Check if this ring is already found (by sorting atom IDs)
                    const sortedRing = [...ringAtoms].sort((a, b) => a - b).join(',');
                    const isNewRing = !rings.some(r =>
                        [...r.atomIds].sort((a, b) => a - b).join(',') === sortedRing
                    );

                    if (isNewRing) {
                        const isAromatic = checkAromaticity(ringAtoms, atoms, bonds);
                        rings.push({ size: ringSize, atomIds: ringAtoms, isAromatic });
                    }
                }
            } else if (!visited.has(neighborId)) {
                dfs(neighborId, nodeId, [...path, neighborId]);
            }
        }
    }

    atoms.forEach(atom => {
        if (!visited.has(atom.id)) {
            dfs(atom.id, null, [atom.id]);
            visited.add(atom.id);
        }
    });

    return rings;
}

function checkAromaticity(ringAtomIds: number[], atoms: Atom[], bonds: Bond[]): boolean {
    // Simple aromaticity check: 
    // - Ring must be planar (we assume this)
    // - All atoms in ring should be C or N
    // - Should have alternating single/double bonds or be all aromatic

    if (ringAtomIds.length !== 6 && ringAtomIds.length !== 5) return false;

    const ringAtoms = ringAtomIds.map(id => atoms.find(a => a.id === id)).filter(Boolean);
    if (ringAtoms.length !== ringAtomIds.length) return false;

    // Check if all non-H elements (C, N for simple aromatic)
    const validElements = ['C', 'N', 'O', 'S'];
    if (!ringAtoms.every(a => validElements.includes(a!.element))) return false;

    // Count double bonds in ring
    let doubleBondCount = 0;
    for (let i = 0; i < ringAtomIds.length; i++) {
        const a1 = ringAtomIds[i];
        const a2 = ringAtomIds[(i + 1) % ringAtomIds.length];
        const bond = bonds.find(b =>
            (b.sourceId === a1 && b.targetId === a2) ||
            (b.sourceId === a2 && b.targetId === a1)
        );
        if (bond?.order === 2) doubleBondCount++;
    }

    // For 6-membered ring: should have 3 double bonds (benzene-like)
    // For 5-membered ring: should have 2 double bonds (furan/pyrrole-like)
    if (ringAtomIds.length === 6 && doubleBondCount >= 2) return true;
    if (ringAtomIds.length === 5 && doubleBondCount >= 2) return true;

    return false;
}

function getFormula(atoms: Atom[]): string {
    const counts: Record<string, number> = {};
    atoms.forEach(a => {
        counts[a.element] = (counts[a.element] || 0) + 1;
    });

    // Hill system: C first, then H, then alphabetical
    const keys = Object.keys(counts).sort((a, b) => {
        if (a === 'C') return -1;
        if (b === 'C') return 1;
        if (a === 'H') return -1;
        if (b === 'H') return 1;
        return a.localeCompare(b);
    });

    return keys.map(k => `${k}${counts[k] > 1 ? counts[k] : ''}`).join('');
}

function calculateMolecularWeight(atoms: Atom[]): number {
    return atoms.reduce((sum, atom) => {
        const element = PeriodicTable[atom.element];
        return sum + (element?.mass || 0);
    }, 0);
}

function countRotatableBonds(atoms: Atom[], bonds: Bond[], graph: Map<number, number[]>): number {
    // Rotatable bonds: single bonds between non-terminal, non-ring atoms
    let count = 0;

    bonds.forEach(bond => {
        if (bond.order !== 1) return;

        const source = atoms.find(a => a.id === bond.sourceId);
        const target = atoms.find(a => a.id === bond.targetId);

        if (!source || !target) return;

        // Exclude H atoms
        if (source.element === 'H' || target.element === 'H') return;

        // Exclude terminal atoms (only one neighbor)
        const sourceNeighbors = graph.get(source.id)?.length || 0;
        const targetNeighbors = graph.get(target.id)?.length || 0;

        if (sourceNeighbors > 1 && targetNeighbors > 1) {
            count++;
        }
    });

    return count;
}

function countHBondDonors(atoms: Atom[], graph: Map<number, number[]>): number {
    // H-bond donors: OH, NH groups
    let count = 0;

    atoms.forEach(atom => {
        if (atom.element === 'O' || atom.element === 'N') {
            const neighbors = graph.get(atom.id) || [];
            const hasH = neighbors.some(nId =>
                atoms.find(a => a.id === nId)?.element === 'H'
            );
            if (hasH) count++;
        }
    });

    return count;
}

function countHBondAcceptors(atoms: Atom[]): number {
    // H-bond acceptors: O and N atoms
    return atoms.filter(a => a.element === 'O' || a.element === 'N').length;
}

function calculateComplexity(atoms: Atom[], bonds: Bond[], rings: RingInfo[], functionalGroupCount: number): number {
    // Complexity score: 0-100
    const atomScore = Math.min(atoms.length * 2, 30);
    const bondScore = Math.min(bonds.length * 1.5, 20);
    const ringScore = Math.min(rings.length * 10, 25);
    const aromaticBonus = rings.filter(r => r.isAromatic).length * 5;
    const fgScore = Math.min(functionalGroupCount * 5, 20);

    return Math.min(100, Math.round(atomScore + bondScore + ringScore + aromaticBonus + fgScore));
}

// ============================================================================
// Main Validation Function
// ============================================================================

export function validateMolecule(atoms: Atom[], bonds: Bond[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 0;

    // Empty check
    if (atoms.length === 0) {
        return {
            valid: false,
            errors: ['Molecule is empty'],
            warnings: [],
            score: 0
        };
    }

    // Build adjacency graph
    const graph = buildAdjacencyGraph(atoms, bonds);

    // ========== Connectivity Check ==========
    const connected = isConnected(atoms, graph);
    if (!connected) {
        warnings.push('⚠️ Molecule has disconnected fragments');
    }

    // ========== Valence Validation ==========
    let allValenceSatisfied = true;

    atoms.forEach(atom => {
        const bondInfo = getBondInfo(atom.id, bonds);
        const elementData = PeriodicTable[atom.element];

        if (!elementData) {
            errors.push(`Unknown element: ${atom.element}`);
            allValenceSatisfied = false;
            return;
        }

        const satisfies = elementData.valence.includes(bondInfo.totalOrder);

        if (!satisfies) {
            allValenceSatisfied = false;
            const atomLabel = `${elementData.name} #${atom.id.toString().slice(-4)}`;
            const current = bondInfo.totalOrder;
            const needed = elementData.valence.join(' or ');

            if (current === 0) {
                errors.push(`${atomLabel} has no bonds (needs ${needed})`);
            } else if (current < Math.min(...elementData.valence)) {
                errors.push(`${atomLabel} needs more bonds: has ${current}, needs ${needed}`);
            } else if (current > Math.max(...elementData.valence)) {
                errors.push(`${atomLabel} has too many bonds: has ${current}, max is ${Math.max(...elementData.valence)}`);
            } else {
                errors.push(`${atomLabel} has ${current} bonds (needs exactly ${needed})`);
            }
        }

        // Warning for unusual valence states
        if (atom.element === 'C' && bondInfo.totalOrder === 3) {
            warnings.push(`Carbon atom may be a carbocation (unstable)`);
        }
    });

    // ========== Ring Detection ==========
    const rings = findRings(atoms, bonds, graph);

    // Check for strained rings
    rings.forEach(ring => {
        if (ring.size === 3) {
            warnings.push(`⚠️ 3-membered ring detected (high ring strain)`);
        } else if (ring.size === 4) {
            warnings.push(`⚠️ 4-membered ring detected (moderate ring strain)`);
        }
    });

    // ========== Functional Group Detection ==========
    const detectedGroups: string[] = [];
    let totalFGCount = 0;

    FUNCTIONAL_GROUPS.forEach(fg => {
        const count = fg.pattern(atoms, bonds, graph);
        if (count > 0) {
            totalFGCount += count;
            detectedGroups.push(`${fg.icon} ${fg.displayName}${count > 1 ? ` (×${count})` : ''}`);
        }
    });

    // ========== Calculate Properties ==========
    const formula = getFormula(atoms);
    const molecularWeight = calculateMolecularWeight(atoms);
    const heavyAtomCount = atoms.filter(a => a.element !== 'H').length;
    const rotableBonds = countRotatableBonds(atoms, bonds, graph);
    const hBondDonors = countHBondDonors(atoms, graph);
    const hBondAcceptors = countHBondAcceptors(atoms);
    const hasAromaticRing = rings.some(r => r.isAromatic);
    const complexity = calculateComplexity(atoms, bonds, rings, totalFGCount);

    const properties: MoleculeProperties = {
        atomCount: atoms.length,
        bondCount: bonds.length,
        heavyAtomCount,
        rotableBonds,
        hBondDonors,
        hBondAcceptors,
        isConnected: connected,
        hasAromaticRing,
        complexity
    };

    // ========== Molecule Recognition ==========
    let name: string | undefined;

    if (allValenceSatisfied) {
        const match = MOLECULE_DATABASE.find(m => m.formula === formula);

        if (match) {
            name = match.name;
            score = match.score;

            if (match.description) {
                warnings.unshift(`💊 ${match.description}`);
            }
        } else {
            name = "Valid Unknown Compound";
            // Calculate score based on complexity
            score = Math.round(
                atoms.length * 8 +
                rings.length * 20 +
                totalFGCount * 15 +
                (hasAromaticRing ? 50 : 0)
            );
        }

        // Bonus for aromatic compounds
        if (hasAromaticRing) {
            warnings.unshift('🔵 Contains aromatic ring system');
        }

        // Drug-likeness check (Lipinski's Rule of 5)
        if (molecularWeight <= 500 && hBondDonors <= 5 && hBondAcceptors <= 10) {
            if (heavyAtomCount >= 5) {
                warnings.unshift('✅ Passes Lipinski drug-likeness criteria');
                score += 25;
            }
        } else if (molecularWeight > 500) {
            warnings.push('⚠️ Molecular weight >500 (may have poor absorption)');
        }
    }

    return {
        valid: allValenceSatisfied,
        errors,
        warnings,
        score,
        name,
        formula,
        molecularWeight: Math.round(molecularWeight * 100) / 100,
        functionalGroups: detectedGroups,
        rings,
        properties
    };
}

// ============================================================================
// Utility Exports
// ============================================================================

export { getFormula, calculateMolecularWeight };
