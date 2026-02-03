
export interface ElementData {
    name: string;
    symbol: string;
    atomicNumber: number;
    color: number; // Hex color
    radius: number; // Van der Waals radius (approx) mechanism
    mass: number;
    valence: number[]; // Common valences
}

export const PeriodicTable: Record<string, ElementData> = {
    H: { name: 'Hydrogen', symbol: 'H', atomicNumber: 1, color: 0xffffff, radius: 0.8, mass: 1.008, valence: [1] },
    C: { name: 'Carbon', symbol: 'C', atomicNumber: 6, color: 0x909090, radius: 1.2, mass: 12.011, valence: [4] },
    N: { name: 'Nitrogen', symbol: 'N', atomicNumber: 7, color: 0x3050f8, radius: 1.1, mass: 14.007, valence: [3, 4, 5] },
    O: { name: 'Oxygen', symbol: 'O', atomicNumber: 8, color: 0xff0d0d, radius: 1.0, mass: 15.999, valence: [2] },
    F: { name: 'Fluorine', symbol: 'F', atomicNumber: 9, color: 0x90e050, radius: 0.9, mass: 18.998, valence: [1] },
    P: { name: 'Phosphorus', symbol: 'P', atomicNumber: 15, color: 0xff8000, radius: 1.3, mass: 30.974, valence: [3, 5] },
    S: { name: 'Sulfur', symbol: 'S', atomicNumber: 16, color: 0xffff30, radius: 1.3, mass: 32.06, valence: [2, 4, 6] },
    Cl: { name: 'Chlorine', symbol: 'Cl', atomicNumber: 17, color: 0x1ff01f, radius: 1.2, mass: 35.45, valence: [1] },
    Br: { name: 'Bromine', symbol: 'Br', atomicNumber: 35, color: 0xa62929, radius: 1.4, mass: 79.904, valence: [1] },
    I: { name: 'Iodine', symbol: 'I', atomicNumber: 53, color: 0x940094, radius: 1.6, mass: 126.90, valence: [1] },
};

export interface Atom {
    id: number;
    element: string; // Symbol
    x: number;
    y: number;
    z: number;
}

export interface Bond {
    id: number;
    sourceId: number;
    targetId: number;
    order: number; // 1, 2, 3
}

export interface MoleculeData {
    atoms: Atom[];
    bonds: Bond[];
}
