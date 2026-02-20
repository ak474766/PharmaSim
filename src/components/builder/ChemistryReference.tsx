'use client';

import { useState } from 'react';
import { PeriodicTable, ElementData } from '@/lib/chemistry';
import styles from './ChemistryReference.module.css';

interface ChemistryReferenceProps {
    isOpen: boolean;
    onClose: () => void;
}

// Tab types
type TabType = 'elements' | 'bonds' | 'groups' | 'tips' | 'smiles';

// Functional group data with expanded descriptions
const FUNCTIONAL_GROUPS_DATA = [
    {
        name: 'Hydroxyl (-OH)',
        structure: 'R-O-H',
        icon: '💧',
        description: 'An oxygen atom bonded to a hydrogen. Found in alcohols and phenols.',
        drugRelevance: 'Increases water solubility (hydrophilicity), enables hydrogen bonding for receptor binding.',
        examples: ['Ethanol (CCO)', 'Phenol (Oc1ccccc1)'],
        color: '#60a5fa'
    },
    {
        name: 'Carbonyl (C=O)',
        structure: 'R-C(=O)-R',
        icon: '⚗️',
        description: 'A carbon double-bonded to oxygen. The defining feature of aldehydes, ketones, esters, and amides.',
        drugRelevance: 'Reactive center for drug metabolism, hydrogen bond acceptor.',
        examples: ['Acetone (CC(=O)C)', 'Formaldehyde (C=O)'],
        color: '#f59e0b'
    },
    {
        name: 'Carboxyl (-COOH)',
        structure: 'R-C(=O)-O-H',
        icon: '🧪',
        description: 'A carbonyl attached to a hydroxyl group. Found in carboxylic acids.',
        drugRelevance: 'Acidic (pKa ~4-5), ionizes at physiological pH, increases water solubility.',
        examples: ['Acetic Acid (CC(=O)O)', 'Aspirin (CC(=O)Oc1ccccc1C(=O)O)'],
        color: '#ef4444'
    },
    {
        name: 'Amine (-NH₂)',
        structure: 'R-N-H₂',
        icon: '🔵',
        description: 'A nitrogen atom with hydrogen(s) attached. Can be primary, secondary, or tertiary.',
        drugRelevance: 'Basic (pKa ~9-11), protonated at physiological pH, hydrogen bond donor.',
        examples: ['Methylamine (CN)', 'Aniline (Nc1ccccc1)'],
        color: '#3b82f6'
    },
    {
        name: 'Amide (-CONH₂)',
        structure: 'R-C(=O)-N-H₂',
        icon: '🔗',
        description: 'A carbonyl attached to a nitrogen. The peptide bond is an amide.',
        drugRelevance: 'Very stable, resistant to metabolism, mimics peptide bonds in proteins.',
        examples: ['Acetamide (CC(=O)N)', 'Paracetamol (CC(=O)Nc1ccc(O)cc1)'],
        color: '#8b5cf6'
    },
    {
        name: 'Ether (C-O-C)',
        structure: 'R-O-R',
        icon: '⭕',
        description: 'An oxygen between two carbon groups. Generally stable and non-reactive.',
        drugRelevance: 'Increases lipophilicity, good for crossing cell membranes.',
        examples: ['Diethyl Ether (CCOCC)', 'Anisole (COc1ccccc1)'],
        color: '#06b6d4'
    },
    {
        name: 'Ester (-COO-)',
        structure: 'R-C(=O)-O-R',
        icon: '🍋',
        description: 'A carbonyl attached to an oxygen with an R group. Common in fats and flavors.',
        drugRelevance: 'Used in prodrugs - can be cleaved by esterases to release active drug.',
        examples: ['Ethyl Acetate (CCOC(=O)C)', 'Aspirin ester group'],
        color: '#84cc16'
    },
    {
        name: 'Halogen (F/Cl/Br/I)',
        structure: 'R-X',
        icon: '🟢',
        description: 'Fluorine, chlorine, bromine, or iodine attached to a carbon.',
        drugRelevance: 'F increases metabolic stability, Cl/Br add lipophilicity, useful for PET imaging (18F).',
        examples: ['Chloroform (ClC(Cl)Cl)', 'Fluorobenzene (Fc1ccccc1)'],
        color: '#22c55e'
    },
    {
        name: 'Thiol (-SH)',
        structure: 'R-S-H',
        icon: '🟡',
        description: 'A sulfur with a hydrogen. Also called mercaptan. Very reactive.',
        drugRelevance: 'Can form covalent bonds with cysteine residues, used in covalent drugs.',
        examples: ['Methanethiol (CS)', 'Cysteine (NC(CS)C(=O)O)'],
        color: '#eab308'
    },
    {
        name: 'Aromatic Ring',
        structure: 'c1ccccc1',
        icon: '🔵',
        description: 'A planar ring of carbons with delocalized π electrons. Benzene is the prototype.',
        drugRelevance: 'Flat, hydrophobic, can stack with other aromatics (π-π stacking).',
        examples: ['Benzene (c1ccccc1)', 'Naphthalene (c1ccc2ccccc2c1)'],
        color: '#a78bfa'
    }
];

// Bond types data
const BOND_TYPES_DATA = [
    {
        name: 'Single Bond',
        symbol: '-',
        electrons: 2,
        description: 'One pair of shared electrons. Allows free rotation around the bond axis.',
        examples: ['C-C in ethane', 'C-H in methane'],
        strength: 'Medium (347 kJ/mol for C-C)'
    },
    {
        name: 'Double Bond',
        symbol: '=',
        electrons: 4,
        description: 'Two pairs of shared electrons (1 sigma + 1 pi). Restricts rotation, creates geometric isomers.',
        examples: ['C=C in ethylene', 'C=O in aldehydes'],
        strength: 'Strong (614 kJ/mol for C=C)'
    },
    {
        name: 'Triple Bond',
        symbol: '≡',
        electrons: 6,
        description: 'Three pairs of shared electrons (1 sigma + 2 pi). Very strong and linear.',
        examples: ['C≡C in acetylene', 'C≡N in nitriles'],
        strength: 'Very Strong (839 kJ/mol for C≡C)'
    },
    {
        name: 'Aromatic Bond',
        symbol: '◯',
        electrons: 1.5,
        description: 'Delocalized electrons shared across a ring. Bond order is between single and double.',
        examples: ['Benzene ring', 'Pyridine ring'],
        strength: 'Intermediate (resonance stabilized)'
    }
];

// Building tips
const BUILDING_TIPS = [
    {
        title: '🎯 Start with Carbon',
        tip: 'Carbon forms 4 bonds and is the backbone of organic molecules. Place carbons first, then add other atoms.'
    },
    {
        title: '⚡ Watch Your Valence',
        tip: 'Each element has a specific number of bonds it needs: H=1, O=2, N=3, C=4. The validation panel shows errors if bonds are wrong.'
    },
    {
        title: '🔄 Use Bond Mode',
        tip: 'After placing atoms, switch to Bond Mode to connect them. Click two atoms to create a bond. Click existing bonds to increase their order.'
    },
    {
        title: '🗑️ Delete Mode',
        tip: 'Use Delete Mode to remove atoms or bonds. Clicking an atom removes it and all its bonds.'
    },
    {
        title: '💊 Drug-like Molecules',
        tip: 'For pharmaceutical compounds, follow Lipinski\'s Rule of 5: MW ≤ 500, H-bond donors ≤ 5, H-bond acceptors ≤ 10.'
    },
    {
        title: '🔵 Aromatic Rings',
        tip: 'To build benzene, create 6 carbons in a ring with alternating single and double bonds. The system will detect aromaticity.'
    },
    {
        title: '📝 SMILES Input',
        tip: 'Use the SMILES tab to quickly generate molecules from SMILES notation. Great for importing known structures!'
    },
    {
        title: '🧬 Load Templates',
        tip: 'Use the mission system to load pre-built molecule templates as starting points for modifications.'
    }
];

// SMILES syntax guide
const SMILES_SYNTAX = [
    { syntax: 'C, N, O, S, P, F, Cl, Br, I', description: 'Organic atoms (implicit H added)' },
    { syntax: 'c, n, o, s', description: 'Aromatic atoms (lowercase)' },
    { syntax: '[NH4+], [O-], [Fe]', description: 'Bracket atoms (charges, metals)' },
    { syntax: '- = #', description: 'Single, double, triple bonds' },
    { syntax: '()', description: 'Branches (side chains)' },
    { syntax: '1, 2, %10', description: 'Ring closures' },
    { syntax: '.', description: 'Disconnected fragments' },
];

export default function ChemistryReference({ isOpen, onClose }: ChemistryReferenceProps) {
    const [activeTab, setActiveTab] = useState<TabType>('elements');
    const [selectedElement, setSelectedElement] = useState<string | null>(null);

    if (!isOpen) return null;

    const elements = Object.entries(PeriodicTable) as [string, ElementData][];

    const renderElements = () => (
        <div className={styles.elementsGrid}>
            {elements.map(([symbol, data]) => (
                <div
                    key={symbol}
                    className={`${styles.elementCard} ${selectedElement === symbol ? styles.selected : ''}`}
                    onClick={() => setSelectedElement(selectedElement === symbol ? null : symbol)}
                    style={{ borderColor: `#${data.color.toString(16).padStart(6, '0')}` }}
                >
                    <div
                        className={styles.elementSymbol}
                        style={{ color: `#${data.color.toString(16).padStart(6, '0')}` }}
                    >
                        {symbol}
                    </div>
                    <div className={styles.elementName}>{data.name}</div>
                    <div className={styles.elementNumber}>#{data.atomicNumber}</div>
                </div>
            ))}

            {selectedElement && PeriodicTable[selectedElement] && (
                <div className={styles.elementDetail}>
                    <h4 style={{ color: `#${PeriodicTable[selectedElement].color.toString(16).padStart(6, '0')}` }}>
                        {PeriodicTable[selectedElement].name} ({selectedElement})
                    </h4>
                    <div className={styles.detailGrid}>
                        <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Atomic Number</span>
                            <span className={styles.detailValue}>{PeriodicTable[selectedElement].atomicNumber}</span>
                        </div>
                        <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Atomic Mass</span>
                            <span className={styles.detailValue}>{PeriodicTable[selectedElement].mass} u</span>
                        </div>
                        <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Valence</span>
                            <span className={styles.detailValue}>{PeriodicTable[selectedElement].valence.join(', ')}</span>
                        </div>
                        <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Radius</span>
                            <span className={styles.detailValue}>{PeriodicTable[selectedElement].radius} Å</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const renderBonds = () => (
        <div className={styles.bondsList}>
            {BOND_TYPES_DATA.map((bond, i) => (
                <div key={i} className={styles.bondCard}>
                    <div className={styles.bondHeader}>
                        <span className={styles.bondSymbol}>{bond.symbol}</span>
                        <span className={styles.bondName}>{bond.name}</span>
                        <span className={styles.bondElectrons}>{bond.electrons} e⁻</span>
                    </div>
                    <p className={styles.bondDescription}>{bond.description}</p>
                    <div className={styles.bondExamples}>
                        <strong>Examples:</strong> {bond.examples.join(', ')}
                    </div>
                    <div className={styles.bondStrength}>
                        <strong>Strength:</strong> {bond.strength}
                    </div>
                </div>
            ))}
        </div>
    );

    const renderGroups = () => (
        <div className={styles.groupsList}>
            {FUNCTIONAL_GROUPS_DATA.map((group, i) => (
                <div key={i} className={styles.groupCard} style={{ borderLeftColor: group.color }}>
                    <div className={styles.groupHeader}>
                        <span className={styles.groupIcon}>{group.icon}</span>
                        <span className={styles.groupName}>{group.name}</span>
                    </div>
                    <div className={styles.groupStructure}>
                        <code>{group.structure}</code>
                    </div>
                    <p className={styles.groupDescription}>{group.description}</p>
                    <div className={styles.groupRelevance}>
                        <strong>💊 Drug Relevance:</strong> {group.drugRelevance}
                    </div>
                    <div className={styles.groupExamples}>
                        <strong>Examples:</strong> {group.examples.join(', ')}
                    </div>
                </div>
            ))}
        </div>
    );

    const renderTips = () => (
        <div className={styles.tipsList}>
            {BUILDING_TIPS.map((tip, i) => (
                <div key={i} className={styles.tipCard}>
                    <div className={styles.tipTitle}>{tip.title}</div>
                    <p className={styles.tipContent}>{tip.tip}</p>
                </div>
            ))}
        </div>
    );

    const renderSmiles = () => (
        <div className={styles.smilesGuide}>
            <h4 className={styles.smilesTitle}>📝 SMILES Notation Guide</h4>
            <p className={styles.smilesIntro}>
                SMILES (Simplified Molecular Input Line Entry System) is a way to represent molecules as text strings.
            </p>

            <table className={styles.smilesTable}>
                <thead>
                    <tr>
                        <th>Syntax</th>
                        <th>Meaning</th>
                    </tr>
                </thead>
                <tbody>
                    {SMILES_SYNTAX.map((item, i) => (
                        <tr key={i}>
                            <td><code>{item.syntax}</code></td>
                            <td>{item.description}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h4 className={styles.smilesTitle} style={{ marginTop: '20px' }}>🧪 Examples</h4>
            <div className={styles.smilesExamples}>
                <div className={styles.smilesExample}>
                    <code>CCO</code> → Ethanol (2 carbons + oxygen)
                </div>
                <div className={styles.smilesExample}>
                    <code>c1ccccc1</code> → Benzene (aromatic ring)
                </div>
                <div className={styles.smilesExample}>
                    <code>CC(=O)O</code> → Acetic acid (with carbonyl)
                </div>
                <div className={styles.smilesExample}>
                    <code>CC(C)C</code> → Isobutane (with branch)
                </div>
                <div className={styles.smilesExample}>
                    <code>C1CCCCC1</code> → Cyclohexane (6-ring)
                </div>
            </div>
        </div>
    );

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.panel} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 className={styles.title}>📚 Chemistry Reference</h2>
                    <button className={styles.closeBtn} onClick={onClose}>×</button>
                </div>

                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeTab === 'elements' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('elements')}
                    >
                        🧪 Elements
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'bonds' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('bonds')}
                    >
                        🔗 Bonds
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'groups' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('groups')}
                    >
                        🧬 Groups
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'smiles' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('smiles')}
                    >
                        📝 SMILES
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'tips' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('tips')}
                    >
                        💡 Tips
                    </button>
                </div>

                <div className={styles.content}>
                    {activeTab === 'elements' && renderElements()}
                    {activeTab === 'bonds' && renderBonds()}
                    {activeTab === 'groups' && renderGroups()}
                    {activeTab === 'tips' && renderTips()}
                    {activeTab === 'smiles' && renderSmiles()}
                </div>
            </div>
        </div>
    );
}
