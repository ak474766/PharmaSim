/**
 * SMILES Parser - Converts SMILES notation to 3D molecular structures
 * 
 * Supported features:
 * - Organic subset atoms: B, C, N, O, P, S, F, Cl, Br, I
 * - Bracket atoms: [NH4+], [O-], [13C], etc.
 * - Bond types: - (single), = (double), # (triple)
 * - Branches: parentheses ()
 * - Ring closures: numeric digits 1-9, %10-%99
 * - Aromatic atoms: lowercase c, n, o, s
 * - Implicit hydrogens (added automatically)
 * 
 * Limitations:
 * - Stereochemistry (@, @@, /, \) is parsed but not applied to 3D
 * - Charges are parsed but not used in rendering
 * - Isotopes are parsed but not used
 */

import { Atom, Bond, PeriodicTable } from './chemistry';

// ============================================================================
// Types
// ============================================================================

interface ParsedAtom {
    element: string;
    aromatic: boolean;
    charge: number;
    hCount: number | null;  // Explicit H count, null means implicit
    isotope: number | null;
}

interface ParserState {
    pos: number;
    atoms: ParsedAtom[];
    bonds: Array<{ source: number; target: number; order: number }>;
    ringClosures: Map<number, { atomIndex: number; bondOrder: number }>;
    branchStack: number[];  // Stack of atom indices for branch returns
    lastAtomIndex: number;
    pendingBondOrder: number;
}

export interface SmilesParseResult {
    success: boolean;
    atoms: Atom[];
    bonds: Bond[];
    error?: string;
}

// ============================================================================
// Element Data for Valence
// ============================================================================

const VALENCE_MAP: Record<string, number[]> = {
    'H': [1],
    'B': [3],
    'C': [4],
    'N': [3, 4, 5],
    'O': [2],
    'P': [3, 5],
    'S': [2, 4, 6],
    'F': [1],
    'Cl': [1],
    'Br': [1],
    'I': [1],
};

// Organic subset - atoms that can appear without brackets
const ORGANIC_SUBSET = new Set(['B', 'C', 'N', 'O', 'P', 'S', 'F', 'Cl', 'Br', 'I']);

// Aromatic atoms (lowercase in SMILES)
const AROMATIC_ATOMS: Record<string, string> = {
    'c': 'C',
    'n': 'N',
    'o': 'O',
    's': 'S',
    'p': 'P',
};

// ============================================================================
// Parser Functions
// ============================================================================

function peek(smiles: string, state: ParserState): string {
    return smiles[state.pos] || '';
}

function consume(smiles: string, state: ParserState): string {
    return smiles[state.pos++] || '';
}

function parseNumber(smiles: string, state: ParserState): number | null {
    let numStr = '';
    while (state.pos < smiles.length && /[0-9]/.test(smiles[state.pos])) {
        numStr += consume(smiles, state);
    }
    return numStr ? parseInt(numStr, 10) : null;
}

function parseBracketAtom(smiles: string, state: ParserState): ParsedAtom | null {
    // Assumes '[' has been consumed
    let isotope: number | null = null;
    let element = '';
    let aromatic = false;
    let hCount: number | null = null;
    let charge = 0;

    // Isotope (optional)
    const isoNum = parseNumber(smiles, state);
    if (isoNum !== null) isotope = isoNum;

    // Element symbol (1-2 chars)
    const first = consume(smiles, state);
    if (!first) return null;

    if (first === first.toLowerCase() && AROMATIC_ATOMS[first]) {
        aromatic = true;
        element = AROMATIC_ATOMS[first];
    } else {
        element = first.toUpperCase();
        // Check for two-character elements
        const next = peek(smiles, state);
        if (next && next === next.toLowerCase() && /[a-z]/.test(next)) {
            element += consume(smiles, state);
        }
    }

    // Parse remaining bracket contents
    while (state.pos < smiles.length && peek(smiles, state) !== ']') {
        const char = peek(smiles, state);

        if (char === 'H') {
            consume(smiles, state);
            const num = parseNumber(smiles, state);
            hCount = num !== null ? num : 1;
        } else if (char === '+') {
            consume(smiles, state);
            const num = parseNumber(smiles, state);
            charge = num !== null ? num : 1;
        } else if (char === '-') {
            consume(smiles, state);
            const num = parseNumber(smiles, state);
            charge = -(num !== null ? num : 1);
        } else if (char === '@') {
            // Skip stereochemistry
            consume(smiles, state);
            if (peek(smiles, state) === '@') consume(smiles, state);
        } else {
            // Skip unknown characters
            consume(smiles, state);
        }
    }

    // Consume closing bracket
    if (peek(smiles, state) === ']') consume(smiles, state);

    return { element, aromatic, charge, hCount, isotope };
}

function parseOrganicAtom(smiles: string, state: ParserState): ParsedAtom | null {
    const char = peek(smiles, state);

    // Check for aromatic atoms
    if (AROMATIC_ATOMS[char]) {
        consume(smiles, state);
        return { element: AROMATIC_ATOMS[char], aromatic: true, charge: 0, hCount: null, isotope: null };
    }

    // Check for two-character elements first (Cl, Br)
    const twoChar = smiles.slice(state.pos, state.pos + 2);
    if (twoChar === 'Cl' || twoChar === 'Br') {
        state.pos += 2;
        return { element: twoChar, aromatic: false, charge: 0, hCount: null, isotope: null };
    }

    // Single character organic subset
    const upper = char.toUpperCase();
    if (ORGANIC_SUBSET.has(upper) && char === upper) {
        consume(smiles, state);
        return { element: upper, aromatic: false, charge: 0, hCount: null, isotope: null };
    }

    return null;
}

function parseBondOrder(smiles: string, state: ParserState): number {
    const char = peek(smiles, state);

    switch (char) {
        case '-': consume(smiles, state); return 1;
        case '=': consume(smiles, state); return 2;
        case '#': consume(smiles, state); return 3;
        case ':': consume(smiles, state); return 1; // Aromatic bond treated as single
        default: return 0; // Implicit bond
    }
}

function parseRingClosure(smiles: string, state: ParserState): number | null {
    const char = peek(smiles, state);

    // Single digit ring
    if (/[0-9]/.test(char)) {
        consume(smiles, state);
        return parseInt(char, 10);
    }

    // Double digit ring (%XX)
    if (char === '%') {
        consume(smiles, state);
        const num = parseNumber(smiles, state);
        return num;
    }

    return null;
}

function addBond(state: ParserState, source: number, target: number, order: number) {
    // Avoid duplicate bonds
    const exists = state.bonds.some(b =>
        (b.source === source && b.target === target) ||
        (b.source === target && b.target === source)
    );
    if (!exists && source !== target && source >= 0 && target >= 0) {
        state.bonds.push({ source, target, order });
    }
}

function calculateImplicitHydrogens(parsedAtoms: ParsedAtom[], bonds: Array<{ source: number; target: number; order: number }>): number[] {
    return parsedAtoms.map((atom, idx) => {
        // If explicit H count is specified, use it
        if (atom.hCount !== null) return atom.hCount;

        // Calculate current bond order sum
        const bondOrderSum = bonds
            .filter(b => b.source === idx || b.target === idx)
            .reduce((sum, b) => sum + b.order, 0);

        // Get target valence
        const valences = VALENCE_MAP[atom.element] || [0];
        const targetValence = valences.find(v => v >= bondOrderSum) || valences[valences.length - 1];

        // Aromatic atoms typically have one less hydrogen
        const aromaticAdjust = atom.aromatic ? 1 : 0;

        return Math.max(0, targetValence - bondOrderSum - aromaticAdjust);
    });
}

// ============================================================================
// 3D Coordinate Generation (Enhanced with VSEPR & Chemistry-Aware Layout)
// ============================================================================

// Standard bond lengths in Angstroms (approximate)
const BOND_LENGTHS: Record<string, number> = {
    'C-C': 1.54, 'C=C': 1.34, 'C#C': 1.20,
    'C-N': 1.47, 'C=N': 1.29, 'C#N': 1.16,
    'C-O': 1.43, 'C=O': 1.23,
    'C-S': 1.82, 'C=S': 1.71,
    'C-H': 1.09,
    'C-F': 1.35, 'C-Cl': 1.77, 'C-Br': 1.94, 'C-I': 2.14,
    'N-N': 1.45, 'N=N': 1.25, 'N#N': 1.10,
    'N-O': 1.40, 'N=O': 1.21,
    'N-H': 1.01,
    'O-O': 1.48, 'O=O': 1.21,
    'O-H': 0.96,
    'S-S': 2.05, 'S-H': 1.34,
    'P-O': 1.63, 'P=O': 1.48,
    'P-H': 1.42,
    'DEFAULT': 1.50
};

// Get bond length for a pair of elements
function getBondLength(elem1: string, elem2: string, order: number): number {
    // Sort elements alphabetically for consistent lookup
    const [a, b] = [elem1, elem2].sort();
    const orderSymbol = order === 1 ? '-' : order === 2 ? '=' : '#';

    const key = `${a}${orderSymbol}${b}`;
    const singleKey = `${a}-${b}`;

    return BOND_LENGTHS[key] || BOND_LENGTHS[singleKey] || BOND_LENGTHS['DEFAULT'];
}

// VSEPR geometry angles based on coordination number
const VSEPR_ANGLES: Record<number, { angles: number[]; name: string }> = {
    1: { angles: [0], name: 'terminal' },
    2: { angles: [Math.PI], name: 'linear' },                    // 180°
    3: { angles: [2 * Math.PI / 3, 4 * Math.PI / 3], name: 'trigonal' }, // 120°
    4: { angles: [Math.acos(-1 / 3), 2 * Math.PI / 3, 4 * Math.PI / 3], name: 'tetrahedral' }, // 109.5°
    5: { angles: [Math.PI / 2, 2 * Math.PI / 3], name: 'trigonal-bipyramidal' },
    6: { angles: [Math.PI / 2, Math.PI], name: 'octahedral' }       // 90°, 180°
};

// Tetrahedral unit vectors (sp3 hybridization)
const TETRAHEDRAL_VECTORS = [
    { x: 1, y: 1, z: 1 },
    { x: 1, y: -1, z: -1 },
    { x: -1, y: 1, z: -1 },
    { x: -1, y: -1, z: 1 }
].map(v => {
    const len = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    return { x: v.x / len, y: v.y / len, z: v.z / len };
});

// Trigonal planar unit vectors (sp2 hybridization)
const TRIGONAL_VECTORS = [
    { x: 1, y: 0, z: 0 },
    { x: -0.5, y: Math.sqrt(3) / 2, z: 0 },
    { x: -0.5, y: -Math.sqrt(3) / 2, z: 0 }
];

// Linear unit vectors (sp hybridization)
const LINEAR_VECTORS = [
    { x: 1, y: 0, z: 0 },
    { x: -1, y: 0, z: 0 }
];

interface Vec3 {
    x: number;
    y: number;
    z: number;
}

function vec3Add(a: Vec3, b: Vec3): Vec3 {
    return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

function vec3Sub(a: Vec3, b: Vec3): Vec3 {
    return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function vec3Scale(v: Vec3, s: number): Vec3 {
    return { x: v.x * s, y: v.y * s, z: v.z * s };
}

function vec3Length(v: Vec3): number {
    return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

function vec3Normalize(v: Vec3): Vec3 {
    const len = vec3Length(v) || 1;
    return { x: v.x / len, y: v.y / len, z: v.z / len };
}

function vec3Cross(a: Vec3, b: Vec3): Vec3 {
    return {
        x: a.y * b.z - a.z * b.y,
        y: a.z * b.x - a.x * b.z,
        z: a.x * b.y - a.y * b.x
    };
}

function vec3Dot(a: Vec3, b: Vec3): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}

// Find rings in the molecule using DFS
function findRings(atomCount: number, bonds: Array<{ source: number; target: number; order: number }>): number[][] {
    const adj: Map<number, number[]> = new Map();
    for (let i = 0; i < atomCount; i++) adj.set(i, []);

    bonds.forEach(b => {
        adj.get(b.source)?.push(b.target);
        adj.get(b.target)?.push(b.source);
    });

    const rings: number[][] = [];
    const visited = new Set<number>();

    function dfs(node: number, parent: number, path: number[]): void {
        if (path.length > 8) return; // Limit ring size

        const neighbors = adj.get(node) || [];
        for (const neighbor of neighbors) {
            if (neighbor === parent) continue;

            const idx = path.indexOf(neighbor);
            if (idx !== -1) {
                // Found a ring
                const ring = path.slice(idx);
                if (ring.length >= 3 && ring.length <= 7) {
                    // Check if this ring is new
                    const sortedRing = [...ring].sort((a, b) => a - b).join(',');
                    const isNew = !rings.some(r =>
                        [...r].sort((a, b) => a - b).join(',') === sortedRing
                    );
                    if (isNew) rings.push(ring);
                }
            } else if (!visited.has(neighbor)) {
                dfs(neighbor, node, [...path, neighbor]);
            }
        }
    }

    for (let i = 0; i < atomCount; i++) {
        if (!visited.has(i)) {
            dfs(i, -1, [i]);
            visited.add(i);
        }
    }

    return rings;
}

// Get coordination number (number of bonded atoms) for each atom
function getCoordinationNumbers(atomCount: number, bonds: Array<{ source: number; target: number; order: number }>): number[] {
    const coordination = new Array(atomCount).fill(0);
    bonds.forEach(b => {
        coordination[b.source]++;
        coordination[b.target]++;
    });
    return coordination;
}

// Build adjacency list with bond orders
function buildAdjacency(atomCount: number, bonds: Array<{ source: number; target: number; order: number }>): Map<number, Array<{ neighbor: number; order: number }>> {
    const adj: Map<number, Array<{ neighbor: number; order: number }>> = new Map();
    for (let i = 0; i < atomCount; i++) adj.set(i, []);

    bonds.forEach(b => {
        adj.get(b.source)?.push({ neighbor: b.target, order: b.order });
        adj.get(b.target)?.push({ neighbor: b.source, order: b.order });
    });

    return adj;
}

// Determine hybridization based on bond orders
function getHybridization(atomIdx: number, bonds: Array<{ source: number; target: number; order: number }>, element: string): 'sp' | 'sp2' | 'sp3' {
    const atomBonds = bonds.filter(b => b.source === atomIdx || b.target === atomIdx);
    const hasTriple = atomBonds.some(b => b.order === 3);
    const doubleCount = atomBonds.filter(b => b.order === 2).length;

    if (hasTriple) return 'sp';           // Linear
    if (doubleCount >= 1) return 'sp2';   // Trigonal planar
    return 'sp3';                          // Tetrahedral
}

// Generate 3D coordinates with enhanced chemistry-aware algorithm
function generate3DCoordinates(
    atomCount: number,
    bonds: Array<{ source: number; target: number; order: number }>,
    elements: string[]
): Array<{ x: number; y: number; z: number }> {
    if (atomCount === 0) return [];
    if (atomCount === 1) return [{ x: 0, y: 0, z: 0 }];

    const positions: Vec3[] = new Array(atomCount).fill(null).map(() => ({ x: 0, y: 0, z: 0 }));
    const placed = new Set<number>();
    const adj = buildAdjacency(atomCount, bonds);
    const coordination = getCoordinationNumbers(atomCount, bonds);
    const rings = findRings(atomCount, bonds);
    const inRing = new Set<number>();
    rings.forEach(ring => ring.forEach(idx => inRing.add(idx)));

    // Find the best starting atom (highest connectivity, preferring non-hydrogen)
    let startAtom = 0;
    let maxCoord = -1;
    for (let i = 0; i < atomCount; i++) {
        const score = coordination[i] * (elements[i] === 'H' ? 0.1 : 1);
        if (score > maxCoord) {
            maxCoord = score;
            startAtom = i;
        }
    }

    // Place first atom at origin
    positions[startAtom] = { x: 0, y: 0, z: 0 };
    placed.add(startAtom);

    // BFS queue for placement
    const queue: number[] = [startAtom];

    // Keep track of used directions for each atom
    const usedDirections: Map<number, Vec3[]> = new Map();

    while (queue.length > 0) {
        const current = queue.shift()!;
        const neighbors = adj.get(current) || [];
        const currentPos = positions[current];
        const hybridization = getHybridization(current, bonds, elements[current]);

        // Get already placed neighbors to determine available directions
        const placedNeighbors = neighbors.filter(n => placed.has(n.neighbor));
        const unplacedNeighbors = neighbors.filter(n => !placed.has(n.neighbor));

        if (unplacedNeighbors.length === 0) continue;

        // Calculate reference directions based on already placed neighbors
        let referenceDir: Vec3 = { x: 1, y: 0, z: 0 };
        let upDir: Vec3 = { x: 0, y: 0, z: 1 };

        if (placedNeighbors.length > 0) {
            // Use existing neighbor direction as reference
            const firstNeighbor = placedNeighbors[0];
            referenceDir = vec3Normalize(vec3Sub(positions[firstNeighbor.neighbor], currentPos));

            // Find a perpendicular direction
            if (Math.abs(referenceDir.z) < 0.9) {
                upDir = vec3Normalize(vec3Cross(referenceDir, { x: 0, y: 0, z: 1 }));
            } else {
                upDir = vec3Normalize(vec3Cross(referenceDir, { x: 1, y: 0, z: 0 }));
            }
        }

        // Get geometry vectors based on hybridization
        let geometryVectors: Vec3[];
        switch (hybridization) {
            case 'sp':
                geometryVectors = LINEAR_VECTORS;
                break;
            case 'sp2':
                geometryVectors = TRIGONAL_VECTORS;
                break;
            case 'sp3':
            default:
                geometryVectors = TETRAHEDRAL_VECTORS;
        }

        // Rotate geometry vectors to align with reference direction
        // Simple rotation: we'll use a basic transformation
        const rightDir = vec3Cross(upDir, referenceDir);

        // Place unplaced neighbors
        let vectorIdx = placedNeighbors.length; // Skip used positions

        for (const neighborInfo of unplacedNeighbors) {
            const neighbor = neighborInfo.neighbor;
            const bondOrder = neighborInfo.order;
            const bondLength = getBondLength(elements[current], elements[neighbor], bondOrder);

            // Get direction vector
            let dir: Vec3;

            // Check if this neighbor is in a ring with current atom
            const sharedRing = rings.find(r => r.includes(current) && r.includes(neighbor));

            if (sharedRing && sharedRing.length >= 5 && sharedRing.length <= 6) {
                // Planar ring geometry
                const ringSize = sharedRing.length;
                const currentRingIdx = sharedRing.indexOf(current);
                const neighborRingIdx = sharedRing.indexOf(neighbor);

                // Calculate angle for planar ring
                const angleStep = (2 * Math.PI) / ringSize;
                const angle = neighborRingIdx * angleStep;

                dir = {
                    x: Math.cos(angle),
                    y: Math.sin(angle),
                    z: 0  // Keep rings planar in XY plane initially
                };
            } else {
                // Use geometry vectors with rotation
                const geoVec = geometryVectors[vectorIdx % geometryVectors.length];

                // Transform the geometry vector to the local coordinate system
                dir = vec3Normalize({
                    x: geoVec.x * referenceDir.x + geoVec.y * upDir.x + geoVec.z * rightDir.x,
                    y: geoVec.x * referenceDir.y + geoVec.y * upDir.y + geoVec.z * rightDir.y,
                    z: geoVec.x * referenceDir.z + geoVec.y * upDir.z + geoVec.z * rightDir.z
                });

                vectorIdx++;
            }

            // Position the neighbor
            positions[neighbor] = vec3Add(currentPos, vec3Scale(dir, bondLength));
            placed.add(neighbor);
            queue.push(neighbor);

            // Track used directions
            if (!usedDirections.has(current)) usedDirections.set(current, []);
            usedDirections.get(current)!.push(dir);
        }
    }

    // Handle any disconnected atoms (shouldn't happen normally)
    for (let i = 0; i < atomCount; i++) {
        if (!placed.has(i)) {
            positions[i] = {
                x: (Math.random() - 0.5) * 5,
                y: (Math.random() - 0.5) * 5,
                z: (Math.random() - 0.5) * 5
            };
            placed.add(i);
        }
    }

    // Refinement phase: Force-directed relaxation
    refineMoleculeGeometry(positions, bonds, elements, 80);

    // Center the molecule
    const center: Vec3 = { x: 0, y: 0, z: 0 };
    positions.forEach(p => {
        center.x += p.x;
        center.y += p.y;
        center.z += p.z;
    });
    center.x /= atomCount;
    center.y /= atomCount;
    center.z /= atomCount;

    return positions.map(p => ({
        x: Math.round((p.x - center.x) * 100) / 100,
        y: Math.round((p.y - center.y) * 100) / 100,
        z: Math.round((p.z - center.z) * 100) / 100
    }));
}

// Force-directed geometry refinement
function refineMoleculeGeometry(
    positions: Vec3[],
    bonds: Array<{ source: number; target: number; order: number }>,
    elements: string[],
    iterations: number
): void {
    const atomCount = positions.length;
    const velocities: Vec3[] = positions.map(() => ({ x: 0, y: 0, z: 0 }));

    const BOND_STRENGTH = 0.15;
    const REPULSION_STRENGTH = 1.5;
    const ANGLE_STRENGTH = 0.05;
    const DAMPING = 0.85;
    const MIN_DISTANCE = 0.5;

    const adj = buildAdjacency(atomCount, bonds);

    for (let iter = 0; iter < iterations; iter++) {
        const forces: Vec3[] = positions.map(() => ({ x: 0, y: 0, z: 0 }));

        // Bond length forces
        bonds.forEach(bond => {
            const i = bond.source;
            const j = bond.target;
            const idealLength = getBondLength(elements[i], elements[j], bond.order);

            const delta = vec3Sub(positions[j], positions[i]);
            const dist = vec3Length(delta) + 0.001;
            const displacement = dist - idealLength;

            const forceDir = vec3Normalize(delta);
            const forceMag = BOND_STRENGTH * displacement;

            const force = vec3Scale(forceDir, forceMag);
            forces[i] = vec3Add(forces[i], force);
            forces[j] = vec3Sub(forces[j], force);
        });

        // Non-bonded repulsion (only between close atoms)
        for (let i = 0; i < atomCount; i++) {
            for (let j = i + 1; j < atomCount; j++) {
                // Skip bonded pairs
                const isBonded = bonds.some(b =>
                    (b.source === i && b.target === j) ||
                    (b.source === j && b.target === i)
                );

                const delta = vec3Sub(positions[i], positions[j]);
                const dist = vec3Length(delta) + 0.001;

                // Only apply repulsion if atoms are too close
                const minDist = isBonded ? 0 : (elements[i] === 'H' || elements[j] === 'H' ? 1.5 : 2.5);

                if (!isBonded && dist < minDist) {
                    const forceDir = vec3Normalize(delta);
                    const forceMag = REPULSION_STRENGTH * (minDist - dist) / dist;

                    const force = vec3Scale(forceDir, forceMag);
                    forces[i] = vec3Add(forces[i], force);
                    forces[j] = vec3Sub(forces[j], force);
                }
            }
        }

        // Angle constraints for proper geometry
        for (let center = 0; center < atomCount; center++) {
            const neighbors = adj.get(center) || [];
            if (neighbors.length < 2) continue;

            // Get ideal angle based on hybridization
            const hybridization = getHybridization(center, bonds, elements[center]);
            let idealAngle: number;
            switch (hybridization) {
                case 'sp': idealAngle = Math.PI; break;          // 180°
                case 'sp2': idealAngle = 2 * Math.PI / 3; break; // 120°
                case 'sp3':
                default: idealAngle = Math.acos(-1 / 3); break;    // 109.5°
            }

            // Apply angle forces for each pair of neighbors
            for (let ni = 0; ni < neighbors.length; ni++) {
                for (let nj = ni + 1; nj < neighbors.length; nj++) {
                    const i = neighbors[ni].neighbor;
                    const j = neighbors[nj].neighbor;

                    const v1 = vec3Normalize(vec3Sub(positions[i], positions[center]));
                    const v2 = vec3Normalize(vec3Sub(positions[j], positions[center]));

                    const cosAngle = Math.max(-1, Math.min(1, vec3Dot(v1, v2)));
                    const currentAngle = Math.acos(cosAngle);
                    const angleDiff = currentAngle - idealAngle;

                    if (Math.abs(angleDiff) > 0.1) {
                        // Apply torque-like forces to adjust angle
                        const perpForce = ANGLE_STRENGTH * angleDiff;

                        const perp1 = vec3Normalize(vec3Cross(v1, v2));
                        const tangent1 = vec3Cross(perp1, v1);
                        const tangent2 = vec3Cross(v2, perp1);

                        forces[i] = vec3Add(forces[i], vec3Scale(tangent1, perpForce));
                        forces[j] = vec3Add(forces[j], vec3Scale(tangent2, perpForce));
                    }
                }
            }
        }

        // Apply forces with damping
        for (let i = 0; i < atomCount; i++) {
            velocities[i] = vec3Scale(vec3Add(velocities[i], forces[i]), DAMPING);

            // Limit velocity
            const speed = vec3Length(velocities[i]);
            if (speed > 0.5) {
                velocities[i] = vec3Scale(velocities[i], 0.5 / speed);
            }

            positions[i] = vec3Add(positions[i], velocities[i]);
        }
    }
}

// ============================================================================
// Main Parser
// ============================================================================

export function parseSmiles(smiles: string): SmilesParseResult {
    // Sanitize input
    smiles = smiles.trim();

    if (!smiles) {
        return { success: false, atoms: [], bonds: [], error: 'Empty SMILES string' };
    }

    const state: ParserState = {
        pos: 0,
        atoms: [],
        bonds: [],
        ringClosures: new Map(),
        branchStack: [],
        lastAtomIndex: -1,
        pendingBondOrder: 0,
    };

    try {
        while (state.pos < smiles.length) {
            const char = peek(smiles, state);

            // Skip whitespace
            if (/\s/.test(char)) {
                consume(smiles, state);
                continue;
            }

            // Skip stereochemistry markers
            if (char === '/' || char === '\\') {
                consume(smiles, state);
                continue;
            }

            // Bond order
            if (char === '-' || char === '=' || char === '#' || char === ':') {
                state.pendingBondOrder = parseBondOrder(smiles, state);
                continue;
            }

            // Branch start
            if (char === '(') {
                consume(smiles, state);
                state.branchStack.push(state.lastAtomIndex);
                continue;
            }

            // Branch end
            if (char === ')') {
                consume(smiles, state);
                if (state.branchStack.length > 0) {
                    state.lastAtomIndex = state.branchStack.pop()!;
                }
                continue;
            }

            // Disconnection (dot)
            if (char === '.') {
                consume(smiles, state);
                state.lastAtomIndex = -1;
                continue;
            }

            // Ring closure
            const ringNum = parseRingClosure(smiles, state);
            if (ringNum !== null) {
                const bondOrder = state.pendingBondOrder || 1;
                state.pendingBondOrder = 0;

                if (state.ringClosures.has(ringNum)) {
                    // Close the ring
                    const opener = state.ringClosures.get(ringNum)!;
                    const closerOrder = Math.max(opener.bondOrder, bondOrder);
                    addBond(state, opener.atomIndex, state.lastAtomIndex, closerOrder);
                    state.ringClosures.delete(ringNum);
                } else {
                    // Open a new ring
                    state.ringClosures.set(ringNum, {
                        atomIndex: state.lastAtomIndex,
                        bondOrder
                    });
                }
                continue;
            }

            // Bracket atom
            if (char === '[') {
                consume(smiles, state);
                const atom = parseBracketAtom(smiles, state);
                if (!atom) {
                    return { success: false, atoms: [], bonds: [], error: `Invalid bracket atom at position ${state.pos}` };
                }

                const atomIndex = state.atoms.length;
                state.atoms.push(atom);

                if (state.lastAtomIndex >= 0) {
                    const bondOrder = state.pendingBondOrder || 1;
                    addBond(state, state.lastAtomIndex, atomIndex, bondOrder);
                }
                state.pendingBondOrder = 0;
                state.lastAtomIndex = atomIndex;
                continue;
            }

            // Organic subset atom
            const atom = parseOrganicAtom(smiles, state);
            if (atom) {
                const atomIndex = state.atoms.length;
                state.atoms.push(atom);

                if (state.lastAtomIndex >= 0) {
                    const bondOrder = state.pendingBondOrder || (atom.aromatic && state.atoms[state.lastAtomIndex]?.aromatic ? 1 : 1);
                    addBond(state, state.lastAtomIndex, atomIndex, bondOrder);
                }
                state.pendingBondOrder = 0;
                state.lastAtomIndex = atomIndex;
                continue;
            }

            // Unknown character
            return { success: false, atoms: [], bonds: [], error: `Unexpected character '${char}' at position ${state.pos}` };
        }

        // Check for unclosed rings
        if (state.ringClosures.size > 0) {
            const unclosed = Array.from(state.ringClosures.keys()).join(', ');
            return { success: false, atoms: [], bonds: [], error: `Unclosed ring(s): ${unclosed}` };
        }

        // Calculate implicit hydrogens and add them
        const implicitH = calculateImplicitHydrogens(state.atoms, state.bonds);

        // Add hydrogen atoms
        const allAtoms: ParsedAtom[] = [...state.atoms];
        const allBonds = [...state.bonds];

        implicitH.forEach((hCount, parentIdx) => {
            for (let h = 0; h < hCount; h++) {
                const hIdx = allAtoms.length;
                allAtoms.push({ element: 'H', aromatic: false, charge: 0, hCount: 0, isotope: null });
                allBonds.push({ source: parentIdx, target: hIdx, order: 1 });
            }
        });

        // Generate 3D coordinates with element information for proper bond lengths
        const elements = allAtoms.map(a => a.element);
        const positions = generate3DCoordinates(allAtoms.length, allBonds, elements);

        // Convert to output format
        const outputAtoms: Atom[] = allAtoms.map((a, i) => ({
            id: Date.now() + i,
            element: a.element,
            x: positions[i]?.x || 0,
            y: positions[i]?.y || 0,
            z: positions[i]?.z || 0
        }));

        const outputBonds: Bond[] = allBonds.map((b, i) => ({
            id: Date.now() + 1000 + i,
            sourceId: outputAtoms[b.source]?.id || 0,
            targetId: outputAtoms[b.target]?.id || 0,
            order: b.order
        }));

        return { success: true, atoms: outputAtoms, bonds: outputBonds };

    } catch (error) {
        return {
            success: false,
            atoms: [],
            bonds: [],
            error: `Parse error: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
}

// ============================================================================
// Common SMILES Examples for Quick Input
// ============================================================================

export const SMILES_EXAMPLES: Array<{ name: string; smiles: string; category: string }> = [
    // Simple
    { name: 'Water', smiles: 'O', category: 'Simple' },
    { name: 'Ammonia', smiles: 'N', category: 'Simple' },
    { name: 'Methane', smiles: 'C', category: 'Simple' },
    { name: 'Carbon Dioxide', smiles: 'O=C=O', category: 'Simple' },
    { name: 'Hydrogen Peroxide', smiles: 'OO', category: 'Simple' },

    // Alkanes
    { name: 'Ethane', smiles: 'CC', category: 'Alkanes' },
    { name: 'Propane', smiles: 'CCC', category: 'Alkanes' },
    { name: 'Butane', smiles: 'CCCC', category: 'Alkanes' },
    { name: 'Isobutane', smiles: 'CC(C)C', category: 'Alkanes' },

    // Alcohols
    { name: 'Methanol', smiles: 'CO', category: 'Alcohols' },
    { name: 'Ethanol', smiles: 'CCO', category: 'Alcohols' },
    { name: 'Isopropanol', smiles: 'CC(O)C', category: 'Alcohols' },
    { name: 'Glycerol', smiles: 'OCC(O)CO', category: 'Alcohols' },

    // Aromatics
    { name: 'Benzene', smiles: 'c1ccccc1', category: 'Aromatics' },
    { name: 'Toluene', smiles: 'Cc1ccccc1', category: 'Aromatics' },
    { name: 'Phenol', smiles: 'Oc1ccccc1', category: 'Aromatics' },
    { name: 'Aniline', smiles: 'Nc1ccccc1', category: 'Aromatics' },

    // Drugs
    { name: 'Aspirin', smiles: 'CC(=O)Oc1ccccc1C(=O)O', category: 'Drugs' },
    { name: 'Paracetamol', smiles: 'CC(=O)Nc1ccc(O)cc1', category: 'Drugs' },
    { name: 'Caffeine', smiles: 'Cn1cnc2c1c(=O)n(C)c(=O)n2C', category: 'Drugs' },
    { name: 'Ibuprofen', smiles: 'CC(C)Cc1ccc(C(C)C(=O)O)cc1', category: 'Drugs' },

    // Amino Acids
    { name: 'Glycine', smiles: 'NCC(=O)O', category: 'Amino Acids' },
    { name: 'Alanine', smiles: 'CC(N)C(=O)O', category: 'Amino Acids' },
    { name: 'Serine', smiles: 'NC(CO)C(=O)O', category: 'Amino Acids' },
];
