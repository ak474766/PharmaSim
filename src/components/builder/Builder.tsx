'use client';

import { useState, useEffect, useCallback } from 'react';
import View3D from './View3D';
import { Atom, Bond, PeriodicTable } from '@/lib/chemistry';
import { SYLLABUS_DATA, SyllabusLevel } from '@/lib/syllabusData';
import { AiService } from '@/lib/aiService';
import { MoleculeAnalysisResult } from '@/app/actions/ai';
import * as THREE from 'three';
import { validateMolecule, ValidationResult } from '@/lib/validation';
import { parseSmiles, SMILES_EXAMPLES } from '@/lib/smilesParser';
import styles from './Builder.module.css';
import { useAuth } from '@/context/AuthContext';
import { UserService } from '@/lib/userService';
import MissionSelector from './MissionSelector';
import ChemistryReference from './ChemistryReference';
import { useRouter } from 'next/navigation';
import { TrialService } from '@/lib/trialService';
import { ImageService } from '@/lib/imageService';

export default function Builder() {
    const [atoms, setAtoms] = useState<Atom[]>([]);
    const [bonds, setBonds] = useState<Bond[]>([]);
    const [selectedElement, setSelectedElement] = useState<string>('C');
    const [mode, setMode] = useState<'build' | 'delete' | 'bond'>('build');
    const [message, setMessage] = useState<string>('Select an element and click on the canvas.');
    const [bondingSource, setBondingSource] = useState<number | null>(null);

    // Properties State
    const [properties, setProperties] = useState({
        stability: 0,
        efficacy: 0,
        toxicity: 'Low'
    });

    const { user, refreshProfile, profile } = useAuth();
    const [submitting, setSubmitting] = useState(false);

    // --- Syllabus & AI State ---
    const [currentMission, setCurrentMission] = useState<SyllabusLevel>(SYLLABUS_DATA[0]);
    const [aiFeedback, setAiFeedback] = useState<MoleculeAnalysisResult | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
    const [missionLoaded, setMissionLoaded] = useState(false);

    // --- SMILES Input State ---
    const [smilesInput, setSmilesInput] = useState('');
    const [showSmilesInput, setShowSmilesInput] = useState(false);
    const [smilesError, setSmilesError] = useState<string | null>(null);

    // --- Chemistry Reference State ---
    const [showReference, setShowReference] = useState(false);

    // Helper: Load a mission template
    const loadMission = useCallback((mission: SyllabusLevel) => {
        setCurrentMission(mission);

        // Load atoms from template
        const templateAtoms = mission.moleculeTemplate.atoms.map(a => ({
            id: a.id,
            element: a.element,
            x: a.position[0],
            y: a.position[1],
            z: a.position[2]
        }));

        // Reconstruct bonds with proper bond order
        const templateBonds: Bond[] = [];
        let bondIdCounter = Date.now();
        mission.moleculeTemplate.bonds.forEach(b => {
            const sourceAtom = templateAtoms.find(a => a.id === b.source);
            const targetAtom = templateAtoms.find(a => a.id === b.target);
            if (sourceAtom && targetAtom) {
                templateBonds.push({
                    id: bondIdCounter++,
                    sourceId: sourceAtom.id,
                    targetId: targetAtom.id,
                    order: b.order || 1 // Use template bond order
                });
            }
        });

        setAtoms(templateAtoms);
        setBonds(templateBonds);
        setAiFeedback(null);
        updateProperties(templateAtoms, templateBonds);
        setMessage(`Loaded Mission: ${mission.title}`);
    }, []);

    // Initial Load: Check User Level and Load Highest Unlocked Template
    useEffect(() => {
        if (profile && !missionLoaded) {
            const userLevel = Math.min(profile.level || 1, 8);
            const mission = SYLLABUS_DATA.find(s => s.level === userLevel) || SYLLABUS_DATA[0];
            loadMission(mission);
            setMissionLoaded(true);
        }
    }, [profile, missionLoaded, loadMission]);

    // Run validation whenever atoms/bonds change
    useEffect(() => {
        if (atoms.length > 0) {
            const result = validateMolecule(atoms, bonds);
            setValidationResult(result);
        } else {
            setValidationResult(null);
        }
    }, [atoms, bonds]);


    const handleEmptyClick = (position: THREE.Vector3) => {
        if (mode === 'build') {
            const newAtom: Atom = {
                id: Date.now(),
                element: selectedElement,
                x: position.x,
                y: position.y,
                z: position.z
            };

            const newBonds: Bond[] = [];
            let bondIdCounter = Date.now();

            atoms.forEach(atom => {
                const dist = new THREE.Vector3(atom.x, atom.y, atom.z).distanceTo(position);
                if (dist < 2.0) {
                    newBonds.push({
                        id: bondIdCounter++,
                        sourceId: atom.id,
                        targetId: newAtom.id,
                        order: 1
                    });
                }
            });

            const updatedAtoms = [...atoms, newAtom];
            const updatedBonds = [...bonds, ...newBonds];

            setAtoms(updatedAtoms);
            setBonds(updatedBonds);
            updateProperties(updatedAtoms, updatedBonds);
            setMessage(`Added ${PeriodicTable[selectedElement].name}`);
        }
    };

    const handleAtomClick = (id: number) => {
        if (mode === 'delete') {
            const updatedAtoms = atoms.filter(a => a.id !== id);
            const updatedBonds = bonds.filter(b => b.sourceId !== id && b.targetId !== id);
            setAtoms(updatedAtoms);
            setBonds(updatedBonds);
            updateProperties(updatedAtoms, updatedBonds);
            setMessage('Atom deleted');
        } else if (mode === 'bond') {
            // Bonding mode: click two atoms to connect them
            if (bondingSource === null) {
                setBondingSource(id);
                setMessage(`Bonding: Selected first atom (ID: ${id}). Click another atom to connect.`);
            } else if (bondingSource !== id) {
                // Check if bond already exists
                const exists = bonds.some(b =>
                    (b.sourceId === bondingSource && b.targetId === id) ||
                    (b.sourceId === id && b.targetId === bondingSource)
                );
                if (!exists) {
                    const newBond: Bond = {
                        id: Date.now(),
                        sourceId: bondingSource,
                        targetId: id,
                        order: 1
                    };
                    const updatedBonds = [...bonds, newBond];
                    setBonds(updatedBonds);
                    updateProperties(atoms, updatedBonds);
                    setMessage(`Bond created between atoms!`);
                } else {
                    setMessage('Bond already exists between these atoms.');
                }
                setBondingSource(null);
            } else {
                setBondingSource(null);
                setMessage('Bonding cancelled.');
            }
        } else {
            // Build mode: clicking atom does nothing (only empty space adds atoms)
            const atom = atoms.find(a => a.id === id);
            if (atom) {
                const el = PeriodicTable[atom.element];
                setMessage(`${el?.name || atom.element} atom selected`);
            }
        }
    };

    const updateProperties = (currentAtoms: Atom[], currentBonds: Bond[]) => {
        const result = validateMolecule(currentAtoms, currentBonds);
        if (result.valid) {
            setProperties({
                stability: Math.min(100, 50 + result.score),
                efficacy: Math.min(100, 20 + result.score * 0.5),
                toxicity: 'Low'
            });
        } else {
            setProperties({
                stability: Math.max(0, 30 - currentAtoms.length * 2),
                efficacy: 0,
                toxicity: 'High'
            });
        }
    };

    const handleReset = () => {
        loadMission(currentMission);
        setMessage('Template reset to initial state.');
    };

    const handleAIAnalysis = async () => {
        setAnalyzing(true);
        try {
            const result = await AiService.analyzeMolecule(
                currentMission.moleculeTemplate.name,
                atoms.length,
                "User modified the structure."
            );
            setAiFeedback(result);
            setMessage("AI analysis complete!");
        } catch (error) {
            console.error("AI Analysis error:", error);
            setMessage("Error during AI analysis.");
        } finally {
            setAnalyzing(false);
        }
    };

    const router = useRouter();

    const handleSubmit = async () => {
        if (submitting || !user) return;
        setSubmitting(true);

        try {
            const score = aiFeedback ? Math.floor((aiFeedback.efficacy + aiFeedback.safety) / 2) : 50;
            const xpAwarded = score * 2;

            await UserService.addXP(user.uid, xpAwarded);
            await UserService.updateQuestProgress(user.uid, 'build_molecule', 1);

            // Calculate validation result for submission details
            const validationResult = validateMolecule(atoms, bonds);

            // Save trial data for the Clinical Trials phase using TrialService (Firebase)
            const submission = await TrialService.saveSubmission(user.uid, {
                moleculeName: currentMission.moleculeTemplate.name + " (Modified)",
                missionId: currentMission.level,
                missionTitle: currentMission.title,
                atomCount: atoms.length,
                stats: {
                    efficacy: aiFeedback?.efficacy || properties.efficacy,
                    safety: aiFeedback?.safety || (properties.toxicity === 'Low' ? 80 : 40),
                    stability: properties.stability
                },
                chemicalStats: {
                    formula: validationResult.formula || 'Unknown',
                    molecularWeight: validationResult.molecularWeight || 0,
                    functionalGroups: validationResult.functionalGroups || [],
                    bonds: {
                        single: bonds.filter(b => b.order === 1).length,
                        double: bonds.filter(b => b.order === 2).length,
                        triple: bonds.filter(b => b.order === 3).length,
                        aromatic: validationResult.rings?.filter(r => r.isAromatic).length || 0
                    },
                    warnings: validationResult.warnings || []
                },
                aiAnalysis: aiFeedback?.analysis,
                imageUrl: AiService.generateMoleculeImageUrl(currentMission.moleculeTemplate.name)
            });

            // Generate AI molecule image and save to Firebase Storage
            setMessage('Generating molecule visualization...');
            const generatedImage = await ImageService.generateMoleculeImage(
                currentMission.moleculeTemplate.name,
                submission.id,
                aiFeedback?.efficacy || properties.efficacy,
                aiFeedback?.safety || 50,
                aiFeedback?.visualPrompt
            );

            // Update trial with generated image URL
            if (generatedImage) {
                await TrialService.updateSubmission(submission.id, {
                    generatedImageUrl: generatedImage.url
                });
            }

            // Save trial ID to localStorage for quick access
            localStorage.setItem('active_trial_id', submission.id);

            if (atoms.length >= 5) {
                await UserService.unlockAchievement(user.uid, {
                    id: 'first_complex',
                    title: 'Molecular Architect',
                    description: 'Built a molecule with 5+ atoms',
                    icon: '🧬'
                });
            }

            await refreshProfile();
            setMessage(`SUCCESS: Design Submitted! Redirecting to Clinical Trials...`);

            // Short delay then redirect
            setTimeout(() => {
                router.push('/dashboard/clinical-trials');
            }, 1500);

        } catch (error) {
            console.error(error);
            setMessage('Error submitting design');
        } finally {
            setSubmitting(false);
        }
    };

    // --- SMILES Parsing Handler ---
    const handleSmilesLoad = () => {
        if (!smilesInput.trim()) {
            setSmilesError('Please enter a SMILES string');
            return;
        }

        const result = parseSmiles(smilesInput.trim());

        if (!result.success) {
            setSmilesError(result.error || 'Failed to parse SMILES');
            return;
        }

        // Successfully parsed - load into builder
        setAtoms(result.atoms);
        setBonds(result.bonds);
        setSmilesError(null);
        setShowSmilesInput(false);
        setSmilesInput('');
        setAiFeedback(null);
        updateProperties(result.atoms, result.bonds);
        setMessage(`Loaded molecule from SMILES: ${smilesInput.trim()}`);
    };

    const handleSmilesExample = (smiles: string, name: string) => {
        const result = parseSmiles(smiles);

        if (result.success) {
            setAtoms(result.atoms);
            setBonds(result.bonds);
            setSmilesError(null);
            setShowSmilesInput(false);
            setAiFeedback(null);
            updateProperties(result.atoms, result.bonds);
            setMessage(`Loaded ${name} from SMILES`);
        } else {
            setSmilesError(result.error || 'Failed to parse example');
        }
    };

    const elementList = ['C', 'O', 'N', 'H', 'S', 'P', 'F', 'Cl', 'Br'];

    return (
        <div className={styles.container}>
            <div className={styles.sidebar}>
                {/* Mission Selector Component */}
                {profile && (
                    <MissionSelector
                        userLevel={profile.level || 1}
                        currentMissionId={currentMission.level}
                        onSelectMission={loadMission}
                    />
                )}

                <div className={styles.header}>
                    <h2><span style={{ color: '#60a5fa' }}>LABORATORY:</span> {currentMission.title}</h2>
                    <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '4px' }}>{currentMission.description}</p>
                </div>

                <div className={styles.elementList}>
                    <h3>Elements</h3>
                    <div className={styles.elementsGrid}>
                        {elementList.map(symbol => {
                            const el = PeriodicTable[symbol];
                            if (!el) return null;
                            const isSelected = selectedElement === symbol && mode === 'build';
                            const colorHex = '#' + el.color.toString(16).padStart(6, '0');
                            return (
                                <div
                                    key={symbol}
                                    className={`${styles.elementCard} ${isSelected ? styles.selected : ''}`}
                                    onClick={() => { setSelectedElement(symbol); setMode('build'); setBondingSource(null); }}
                                    style={{
                                        borderColor: isSelected ? colorHex : undefined,
                                        boxShadow: isSelected ? `0 0 12px ${colorHex}40` : undefined
                                    }}
                                >
                                    <div style={{
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '50%',
                                        background: colorHex,
                                        marginBottom: '4px',
                                        boxShadow: `inset 0 -3px 6px rgba(0,0,0,0.3), 0 0 8px ${colorHex}50`
                                    }} />
                                    <b style={{ fontSize: '0.9rem' }}>{symbol}</b>
                                    <small>{el.name}</small>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className={styles.controls}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            className={`${styles.btn} ${mode === 'delete' ? styles.active : ''}`}
                            onClick={() => { setMode(mode === 'delete' ? 'build' : 'delete'); setBondingSource(null); }}
                            style={{ flex: 1 }}
                        >
                            🗑️ Eraser
                        </button>
                        <button
                            className={`${styles.btn} ${mode === 'bond' ? styles.active : ''}`}
                            onClick={() => { setMode(mode === 'bond' ? 'build' : 'bond'); setBondingSource(null); }}
                            style={{ flex: 1, background: mode === 'bond' ? '#7c3aed' : undefined }}
                        >
                            🔗 Bond
                        </button>
                    </div>
                    <button className={styles.btn} onClick={handleReset}>↺ Reset Template</button>

                    {/* SMILES Input Toggle */}
                    <button
                        className={`${styles.btn} ${showSmilesInput ? styles.active : ''}`}
                        onClick={() => setShowSmilesInput(!showSmilesInput)}
                        style={{ background: showSmilesInput ? '#0ea5e9' : undefined }}
                    >
                        📝 SMILES Input
                    </button>

                    {/* SMILES Input Panel */}
                    {showSmilesInput && (
                        <div style={{
                            background: 'rgba(15, 23, 42, 0.9)',
                            border: '1px solid rgba(14, 165, 233, 0.4)',
                            borderRadius: '10px',
                            padding: '12px',
                            marginTop: '4px'
                        }}>
                            <div style={{ marginBottom: '8px', fontSize: '0.75rem', color: '#94a3b8' }}>
                                Enter SMILES notation:
                            </div>
                            <input
                                type="text"
                                value={smilesInput}
                                onChange={(e) => { setSmilesInput(e.target.value); setSmilesError(null); }}
                                placeholder="e.g., CCO (ethanol)"
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    background: 'rgba(30, 41, 59, 0.8)',
                                    border: smilesError ? '1px solid #ef4444' : '1px solid rgba(148, 163, 184, 0.3)',
                                    borderRadius: '8px',
                                    color: '#e2e8f0',
                                    fontSize: '0.9rem',
                                    fontFamily: 'monospace',
                                    marginBottom: '8px'
                                }}
                                onKeyDown={(e) => e.key === 'Enter' && handleSmilesLoad()}
                            />
                            {smilesError && (
                                <div style={{ color: '#ef4444', fontSize: '0.75rem', marginBottom: '8px' }}>
                                    ⚠️ {smilesError}
                                </div>
                            )}
                            <button
                                className={`${styles.btn}`}
                                onClick={handleSmilesLoad}
                                style={{ width: '100%', marginBottom: '8px', background: '#0ea5e9' }}
                            >
                                🧬 Generate Structure
                            </button>

                            {/* Quick Examples */}
                            <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '6px' }}>Quick Examples:</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                {SMILES_EXAMPLES.slice(0, 8).map((ex) => (
                                    <button
                                        key={ex.name}
                                        onClick={() => handleSmilesExample(ex.smiles, ex.name)}
                                        style={{
                                            padding: '4px 8px',
                                            fontSize: '0.65rem',
                                            background: 'rgba(59, 130, 246, 0.2)',
                                            border: '1px solid rgba(59, 130, 246, 0.3)',
                                            borderRadius: '4px',
                                            color: '#60a5fa',
                                            cursor: 'pointer'
                                        }}
                                        title={ex.smiles}
                                    >
                                        {ex.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleAIAnalysis} disabled={analyzing}>
                        {analyzing ? '🤖 Analyzing...' : '🧠 AI Analysis'}
                    </button>

                    {/* Chemistry Reference Button */}
                    <button
                        className={styles.btn}
                        onClick={() => setShowReference(true)}
                        style={{ background: 'rgba(139, 92, 246, 0.3)', borderColor: '#8b5cf6' }}
                    >
                        📚 Chemistry Reference
                    </button>
                </div>

                {aiFeedback && (
                    <div className={styles.aiFeedback}>
                        <h4>AI Analysis Report</h4>
                        <p>{aiFeedback.analysis}</p>
                        <div className={styles.feedbackStats}>
                            <div>Eff: {Math.round(aiFeedback.efficacy)}%</div>
                            <div>Saf: {Math.round(aiFeedback.safety)}%</div>
                        </div>
                    </div>
                )}

                <button
                    className={`${styles.btn} ${styles.btnSuccess}`}
                    onClick={handleSubmit}
                    disabled={submitting || !aiFeedback}
                    style={{ marginTop: 'auto' }}
                >
                    {submitting ? 'Submitting...' : '🚀 Submit for Trials'}
                </button>
            </div>

            <div className={styles.canvasArea}>
                <div className={styles.canvasHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <div className={styles.statusMsg}>{message}</div>
                        {validationResult && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                background: validationResult.valid ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                border: `1px solid ${validationResult.valid ? '#10b981' : '#ef4444'}`,
                                color: validationResult.valid ? '#10b981' : '#ef4444'
                            }}>
                                {validationResult.valid ? '✓ Valid' : '✗ Invalid'}
                                {validationResult.name && (
                                    <span style={{ color: '#60a5fa', marginLeft: '4px' }}>• {validationResult.name}</span>
                                )}
                            </div>
                        )}
                        {/* Formula & MW Badge */}
                        {validationResult?.formula && (
                            <div style={{
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                background: 'rgba(96, 165, 250, 0.15)',
                                border: '1px solid rgba(96, 165, 250, 0.4)',
                                color: '#60a5fa'
                            }}>
                                {validationResult.formula} • {validationResult.molecularWeight} g/mol
                            </div>
                        )}
                    </div>
                    <div className={styles.propTags}>
                        {validationResult?.properties?.complexity !== undefined && (
                            <span className={styles.tag} style={{ color: '#a78bfa' }}>
                                Complexity: {validationResult.properties.complexity}%
                            </span>
                        )}
                        <span className={styles.tag}>Stab: {Math.round(properties.stability)}%</span>
                        <span className={styles.tag}>Eff: {Math.round(properties.efficacy)}%</span>
                        <span className={styles.tag} style={{ color: properties.toxicity === 'Low' ? '#10b981' : '#ef4444' }}>
                            Tox: {properties.toxicity}
                        </span>
                    </div>
                </div>

                {/* Functional Groups Panel (Top Right) */}
                {validationResult?.functionalGroups && validationResult.functionalGroups.length > 0 && (
                    <div style={{
                        position: 'absolute',
                        top: '60px',
                        right: '16px',
                        background: 'rgba(30, 41, 59, 0.95)',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        borderRadius: '10px',
                        padding: '12px',
                        zIndex: 10,
                        maxWidth: '220px',
                        fontSize: '0.75rem',
                        backdropFilter: 'blur(8px)'
                    }}>
                        <div style={{ fontWeight: 700, marginBottom: '8px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Functional Groups
                        </div>
                        {validationResult.functionalGroups.map((fg, i) => (
                            <div key={i} style={{ marginBottom: '4px', color: '#e2e8f0' }}>{fg}</div>
                        ))}
                    </div>
                )}

                {/* Validation Info Panel (Bottom Left) */}
                {validationResult && (validationResult.errors.length > 0 || validationResult.warnings.length > 0) && (
                    <div style={{
                        position: 'absolute',
                        bottom: '16px',
                        left: '16px',
                        background: validationResult.valid
                            ? 'rgba(30, 58, 95, 0.95)'
                            : 'rgba(127, 29, 29, 0.9)',
                        border: `1px solid ${validationResult.valid ? 'rgba(96, 165, 250, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                        borderRadius: '10px',
                        padding: '12px',
                        zIndex: 10,
                        maxWidth: '380px',
                        fontSize: '0.75rem',
                        backdropFilter: 'blur(8px)'
                    }}>
                        {/* Errors */}
                        {!validationResult.valid && validationResult.errors.length > 0 && (
                            <>
                                <div style={{ fontWeight: 700, marginBottom: '6px', color: '#ef4444' }}>⚠️ Valence Issues:</div>
                                {validationResult.errors.slice(0, 3).map((err, i) => (
                                    <div key={`err-${i}`} style={{ marginBottom: '2px', color: '#fca5a5' }}>• {err}</div>
                                ))}
                                {validationResult.errors.length > 3 && (
                                    <div style={{ color: '#9ca3af', marginTop: '4px' }}>...and {validationResult.errors.length - 3} more</div>
                                )}
                            </>
                        )}

                        {/* Warnings / Info */}
                        {validationResult.warnings.length > 0 && (
                            <div style={{ marginTop: validationResult.errors.length > 0 ? '10px' : '0' }}>
                                {validationResult.warnings.slice(0, 4).map((warn, i) => (
                                    <div key={`warn-${i}`} style={{
                                        marginBottom: '4px',
                                        color: warn.startsWith('✅') ? '#86efac' :
                                            warn.startsWith('⚠️') ? '#fcd34d' :
                                                warn.startsWith('💊') ? '#c4b5fd' :
                                                    warn.startsWith('🔵') ? '#93c5fd' : '#e2e8f0'
                                    }}>
                                        {warn}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <View3D
                    atoms={atoms}
                    bonds={bonds}
                    selectedElement={mode === 'build' ? selectedElement : null}
                    onEmptyClick={handleEmptyClick}
                    onAtomClick={handleAtomClick}
                />
            </div>

            {/* Chemistry Reference Panel */}
            <ChemistryReference
                isOpen={showReference}
                onClose={() => setShowReference(false)}
            />
        </div>
    );
}
