
import { Atom, Bond, PeriodicTable } from './chemistry';

export interface ValidationResult {
    valid: boolean;
    errors: string[];
    score: number;
    name?: string;
}

export function validateMolecule(atoms: Atom[], bonds: Bond[]): ValidationResult {
    const errors: string[] = [];
    let score = 0;

    if (atoms.length === 0) {
        return { valid: false, errors: ['Molecule is empty'], score: 0 };
    }

    // Check connectivity (Graph Traversal) - Optional for MVP but good
    // Check Valence
    let allSatisfied = true;

    atoms.forEach(atom => {
        const atomBonds = bonds.filter(b => b.sourceId === atom.id || b.targetId === atom.id);
        const currentValence = atomBonds.reduce((acc, bond) => acc + bond.order, 0);

        const elementData = PeriodicTable[atom.element];
        if (!elementData) return; // Should not happen

        // Check against possible valences
        const satisfies = elementData.valence.includes(currentValence);

        if (!satisfies) {
            allSatisfied = false;
            errors.push(`${elementData.name} #${atom.id.toString().slice(-4)} has ${currentValence} bonds (needs ${elementData.valence.join(' or ')})`);
        }
    });

    if (allSatisfied) {
        // Recognition logic (very basic)
        let name = "Unknown Stable Molecule";
        const formula = getFormula(atoms);

        if (formula === 'CH4') { name = 'Methane'; score = 50; }
        else if (formula === 'H2O') { name = 'Water'; score = 30; }
        else if (formula === 'CO2') { name = 'Carbon Dioxide'; score = 40; }
        else if (formula === 'C2H6O') { name = 'Ethanol'; score = 100; }
        else if (formula === 'C8H10N4O2') { name = 'Caffeine'; score = 500; } // Optimistic check
        else {
            score = atoms.length * 10; // Generic points for valid structure
        }

        return { valid: true, errors: [], score, name };
    }

    return { valid: false, errors, score: 0 };
}

function getFormula(atoms: Atom[]): string {
    const counts: Record<string, number> = {};
    atoms.forEach(a => {
        counts[a.element] = (counts[a.element] || 0) + 1;
    });

    // Sort logic: C first, then H, then alphabetical
    const keys = Object.keys(counts).sort((a, b) => {
        if (a === 'C') return -1;
        if (b === 'C') return 1;
        if (a === 'H') return -1;
        if (b === 'H') return 1;
        return a.localeCompare(b);
    });

    return keys.map(k => `${k}${counts[k] > 1 ? counts[k] : ''}`).join('');
}
