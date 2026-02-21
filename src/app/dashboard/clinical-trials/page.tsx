'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './Trials.module.css';
import TopHeader from '@/components/layout/TopHeader';
import { useAuth } from '@/context/AuthContext';
import { UserService } from '@/lib/userService';
import { SYLLABUS_DATA, SyllabusLevel } from '@/lib/syllabusData';
import { getQuestionsForLevel, Question } from '@/lib/quizData';
import { useRouter } from 'next/navigation';
import { TrialService, TrialSubmission, RoadmapData, CachedTrialEvent, SimulationState } from '@/lib/trialService';
import { AiService } from '@/lib/aiService';

type ViewState = 'dashboard' | 'roadmap' | 'simulation' | 'quiz';

// Using CachedTrialEvent from trialService for type consistency
type TrialEvent = CachedTrialEvent;

const INITIAL_BUDGET = 10000000; // $10M

export default function ClinicalTrialsPage() {
    const { user, profile, refreshProfile } = useAuth();
    const router = useRouter();

    // View State
    const [viewState, setViewState] = useState<ViewState>('dashboard');
    const [submissions, setSubmissions] = useState<TrialSubmission[]>([]);
    const [selectedTrial, setSelectedTrial] = useState<TrialSubmission | null>(null);
    const [loadingRoadmap, setLoadingRoadmap] = useState(false);
    const [loading, setLoading] = useState(true);

    // Mission for quiz
    const [mission, setMission] = useState<SyllabusLevel>(SYLLABUS_DATA[0]);

    // Simulation State
    const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
    const [currentEvent, setCurrentEvent] = useState<TrialEvent | null>(null);
    const [loadingEvent, setLoadingEvent] = useState(false);
    const [stats, setStats] = useState({ budget: INITIAL_BUDGET, efficacy: 0, safety: 100 });
    const [logs, setLogs] = useState<string[]>([]);
    const [previousEvents, setPreviousEvents] = useState<string[]>([]);
    const [gameState, setGameState] = useState<'intro' | 'playing' | 'gameover' | 'victory'>('intro');
    const [gameOverReason, setGameOverReason] = useState('');
    const [cachedEvents, setCachedEvents] = useState<TrialEvent[]>([]);
    const [eventIndex, setEventIndex] = useState(0);
    const [scenarioDeck, setScenarioDeck] = useState<TrialEvent[]>([]); // Future events
    const [isGeneratingScenario, setIsGeneratingScenario] = useState(false);

    // Quiz State
    const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [quizResult, setQuizResult] = useState<{ passed: boolean; msg: string } | null>(null);

    // Load submissions on mount
    useEffect(() => {
        const loadSubmissions = async () => {
            if (user) {
                setLoading(true);
                const data = await TrialService.getSubmissions(user.uid);
                setSubmissions(data);
                setLoading(false);
            }
        };
        loadSubmissions();
    }, [user]);

    // Handle clicking a trial card - load from Firebase or generate roadmap
    const handleTrialClick = useCallback(async (trial: TrialSubmission) => {
        setSelectedTrial(trial);
        setViewState('roadmap');

        // Find mission
        const m = SYLLABUS_DATA.find(s => s.level === trial.missionId) || SYLLABUS_DATA[0];
        setMission(m);

        // If roadmap already exists in Firebase, use it
        if (trial.roadmap) {
            // Initialize stats from trial
            setStats({
                budget: trial.simulationState?.budget || INITIAL_BUDGET,
                efficacy: trial.simulationState?.efficacy || trial.stats.efficacy,
                safety: trial.simulationState?.safety || trial.stats.safety
            });
            return;
        }

        // Generate and save roadmap to Firebase
        setLoadingRoadmap(true);
        const roadmap = await AiService.generateTrialRoadmap(
            trial.moleculeName,
            trial.stats.efficacy,
            trial.stats.safety
        );

        // Save to Firebase
        await TrialService.saveRoadmap(trial.id, roadmap);

        // Update local state (add generatedAt to match RoadmapData type)
        const roadmapWithTimestamp = { ...roadmap, generatedAt: Date.now() };
        setSelectedTrial({ ...trial, roadmap: roadmapWithTimestamp });
        setStats({
            budget: INITIAL_BUDGET,
            efficacy: trial.stats.efficacy,
            safety: trial.stats.safety
        });
        setLoadingRoadmap(false);
    }, []);

    // Handle deleting a trial card
    const handleDeleteTrial = useCallback(async (e: React.MouseEvent, trialId: string) => {
        e.stopPropagation(); // Prevent card click
        if (!confirm('Are you sure you want to delete this trial? This action cannot be undone.')) return;
        try {
            const success = await TrialService.deleteSubmission(trialId);
            if (success) {
                setSubmissions(prev => prev.filter(t => t.id !== trialId));
            }
        } catch (err) {
            console.error('Failed to delete trial:', err);
        }
    }, []);

    useEffect(() => {
        if (loading || !user || submissions.length === 0 || selectedTrial) return;

        const activeId = localStorage.getItem('active_trial_id');
        if (!activeId) return;

        const trial = submissions.find(s => s.id === activeId);
        if (!trial) return;

        localStorage.removeItem('active_trial_id');
        handleTrialClick(trial);
    }, [loading, user, submissions, selectedTrial, handleTrialClick]);

    // Start simulation from roadmap - AI-powered with caching
    const startSimulation = async () => {
        if (!selectedTrial?.roadmap) return;

        setViewState('simulation');

        // Check if we have existing simulation state (resuming)
        const simState = selectedTrial.simulationState;
        if (simState && simState.cachedEvents && simState.cachedEvents.length > 0) {
            // Resume from saved state
            setGameState('playing');
            setCurrentPhaseIndex(simState.currentPhaseIndex || 0);
            setEventIndex(simState.eventIndex || 0);
            setStats({
                budget: simState.budget,
                efficacy: simState.efficacy,
                safety: simState.safety
            });
            setLogs(simState.logs || []);
            setPreviousEvents(simState.previousEvents || []);
            setCachedEvents(simState.cachedEvents as TrialEvent[]);

            // Load current event from cache
            const currentIdx = simState.eventIndex || 0;
            if (currentIdx < simState.cachedEvents.length) {
                setCurrentEvent(simState.cachedEvents[currentIdx] as TrialEvent);
            }
        } else {
            // Fresh start
            setGameState('intro');
            setCurrentPhaseIndex(0);
            setEventIndex(0);
            setPreviousEvents([]);
            setCachedEvents([]);
            setLogs([
                `Trial initialized for ${selectedTrial.moleculeName}.`,
                `Starting budget: $${(INITIAL_BUDGET / 1000000).toFixed(1)}M`
            ]);
        }
    };

    const startPlaying = async () => {
        if (!selectedTrial?.roadmap) return;
        setGameState('playing');

        // Check if we already have a scenario deck generated for this session
        if (scenarioDeck.length === 0) {
            setIsGeneratingScenario(true);
            setLoadingEvent(true);

            try {
                // Construct chemical context
                let chemicalContext = '';
                if (selectedTrial.chemicalStats) {
                    const cs = selectedTrial.chemicalStats;
                    const groups = cs.functionalGroups?.join(', ') || 'None';
                    const warnings = cs.warnings?.join('; ') || 'None';
                    const aromaticText = (cs.bonds?.aromatic || 0) > 0 ? 'Contains Aromatic System' : 'Non-aromatic';

                    chemicalContext = `
                        Formula: ${cs.formula}
                        Molecular Weight: ${cs.molecularWeight}
                        Key Functional Groups: ${groups}
                        Structure Type: ${aromaticText}
                        Chemical Warnings: ${warnings}
                    `.trim();
                }

                // Generate scenarios for ALL phases in parallel
                const phasePromises = selectedTrial.roadmap.phases.map((phase, idx) =>
                    AiService.generatePhaseScenarios(
                        selectedTrial.moleculeName,
                        phase.name,
                        phase.description,
                        chemicalContext
                    ).then(events => events.map(e => ({ ...e, phaseIndex: idx })))
                );

                const results = await Promise.all(phasePromises);
                const fullDeck = results.flat();

                if (fullDeck.length === 0) {
                    // Fallback if AI fails completely
                    console.error("AI failed to generate any events. Using fallback.");
                    // We could manually insert a generic event here
                }

                setScenarioDeck(fullDeck);

                // Load the first event immediately from the new deck
                if (fullDeck.length > 0) {
                    const firstEvent = fullDeck[0];
                    setCurrentEvent(firstEvent);

                    // Add to cache as the current event
                    const newCachedEvents = [...cachedEvents, firstEvent];
                    setCachedEvents(newCachedEvents);

                    // Save initial state
                    await TrialService.updateSimulationState(selectedTrial.id, {
                        currentPhaseIndex: 0,
                        eventIndex: 0,
                        budget: stats.budget,
                        efficacy: stats.efficacy,
                        safety: stats.safety,
                        previousEvents: [] as string[],
                        logs: logs,
                        cachedEvents: newCachedEvents
                    });
                }
            } catch (error) {
                console.error("Failed to generate simulation scenario:", error);
            } finally {
                setIsGeneratingScenario(false);
                setLoadingEvent(false);
            }
        } else {
            // Resume or deck already loaded
            await loadNextEvent();
        }
    };

    // Load next event from the pre-generated deck
    const loadNextEvent = async () => {
        if (!selectedTrial?.roadmap) return;

        // Calculate next event index
        const nextIdx = eventIndex + 1; // logical index

        // In the pre-generated deck, events are sequential.
        // We need to find the next event. 
        // If we are just starting, startPlaying handles it. 
        // This function is for AFTER a choice is made.

        // However, we need to handle "Phase Transitions". 
        // The deck has `phaseIndex` embedded.

        // Ideally, we just increment `eventIndex` state.
        // But `eventIndex` in state is currently used as "index in cachedEvents".
        // Let's assume cachedEvents grows as we play.

        // So simply:
        if (nextIdx < scenarioDeck.length) {
            const nextEvent = scenarioDeck[nextIdx];
            setCurrentEvent(nextEvent);
            setEventIndex(nextIdx);

            // Check if phase changed
            if (nextEvent.phaseIndex !== currentPhaseIndex) {
                setCurrentPhaseIndex(nextEvent.phaseIndex || currentPhaseIndex);
            }

            // Update cache and persistence
            const newCachedEvents = [...cachedEvents, nextEvent];
            setCachedEvents(newCachedEvents);

            await TrialService.updateSimulationState(selectedTrial.id, {
                currentPhaseIndex: nextEvent.phaseIndex || currentPhaseIndex,
                eventIndex: nextIdx,
                budget: stats.budget,
                efficacy: stats.efficacy,
                safety: stats.safety,
                logs,
                previousEvents,
                cachedEvents: newCachedEvents
            });
        } else {
            // No more events in deck -> Victory!
            handleVictory();
        }
    };

    // Handle choice selection
    const handleChoice = async (choiceIndex: number) => {
        if (!currentEvent || !selectedTrial) return;

        const choice = currentEvent.choices[choiceIndex];

        // Apply effects
        const newStats = {
            budget: stats.budget + choice.budgetEffect,
            efficacy: Math.min(100, Math.max(0, stats.efficacy + choice.efficacyEffect)),
            safety: Math.min(100, Math.max(0, stats.safety + choice.safetyEffect))
        };
        setStats(newStats);

        // Add to logs
        const logEntry = `${selectedTrial.roadmap?.phases[currentPhaseIndex].name}: ${choice.outcomeText}`;
        const newLogs = [logEntry, ...logs];
        setLogs(newLogs);

        const newPreviousEvents = [...previousEvents, currentEvent.title];
        setPreviousEvents(newPreviousEvents);

        // Increment event index for next event
        const newEventIndex = eventIndex + 1;
        setEventIndex(newEventIndex);

        // Save complete state to Firebase (including cached events)
        await TrialService.updateSimulationState(selectedTrial.id, {
            currentPhaseIndex,
            eventIndex: newEventIndex,
            budget: newStats.budget,
            efficacy: newStats.efficacy,
            safety: newStats.safety,
            logs: newLogs,
            previousEvents: newPreviousEvents,
            cachedEvents: cachedEvents
        });

        // Check fail conditions
        if (newStats.budget <= 0) {
            endGame('Bankrupt! The lab ran out of funds.');
            return;
        }
        if (newStats.safety <= 20) {
            endGame('Trial Halted! Safety concerns became critical.');
            return;
        }

        // Check if phase is complete
        if (currentEvent.isPhaseComplete) {
            advancePhase();
        } else {
            // Load another event for this phase
            await loadNextEvent();
        }
    };

    const advancePhase = async () => {
        if (!selectedTrial?.roadmap) return;

        if (currentPhaseIndex < selectedTrial.roadmap.phases.length - 1) {
            const nextPhase = currentPhaseIndex + 1;
            setCurrentPhaseIndex(nextPhase);
            setLogs(prev => [`--- Entered ${selectedTrial.roadmap!.phases[nextPhase].name} ---`, ...prev]);
            await loadNextEvent();
        } else {
            handleVictory();
        }
    };

    const handleVictory = async () => {
        setGameState('victory');
        if (user && selectedTrial) {
            await TrialService.updateSubmission(selectedTrial.id, { status: 'completed' });
            await UserService.addXP(user.uid, 200);
            await UserService.unlockAchievement(user.uid, {
                id: 'trial_master',
                title: 'Trial Master',
                description: 'Successfully guided a drug to market.',
                icon: '💊'
            });
            refreshProfile();
        }
    };

    const endGame = async (reason: string) => {
        setGameOverReason(reason);
        setGameState('gameover');
        if (user && selectedTrial) {
            await TrialService.updateSubmission(selectedTrial.id, { status: 'failed' });
            await UserService.addXP(user.uid, 50);
            refreshProfile();
        }
    };

    // --- QUIZ LOGIC ---
    const startQuiz = () => {
        const questions = getQuestionsForLevel(mission.level, 5);
        setQuizQuestions(questions);
        setViewState('quiz');
        setQuizCompleted(false);
        setScore(0);
        setCurrentQuestionIndex(0);
    };

    const handleQuizAnswer = async (optionIndex: number) => {
        const isCorrect = optionIndex === quizQuestions[currentQuestionIndex].correctIndex;
        if (isCorrect) setScore(s => s + 1);

        if (currentQuestionIndex < quizQuestions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            const finalScore = score + (isCorrect ? 1 : 0);
            const passed = finalScore >= 3;
            setQuizCompleted(true);

            if (passed && user) {
                await UserService.addXP(user.uid, 1000);
                await refreshProfile();
                setQuizResult({ passed: true, msg: `Congratulations! You have mastered Semester ${mission.level}.` });
            } else {
                setQuizResult({ passed: false, msg: "You failed the Semester Exam. Review the notes and try again." });
            }
        }
    };

    const goBackToDashboard = async () => {
        setViewState('dashboard');
        setSelectedTrial(null);
        setGameState('intro');
        setCurrentPhaseIndex(0);
        setCurrentEvent(null);
        // Refresh submissions from Firebase
        if (user) {
            const data = await TrialService.getSubmissions(user.uid);
            setSubmissions(data);
        }
    };

    // ==================== RENDER ====================

    // DASHBOARD VIEW - Show trial cards or empty state
    if (viewState === 'dashboard') {
        return (
            <div className={styles.container}>
                <TopHeader title="Clinical Trials" subtitle="Your Drug Development Pipeline" />

                <div className={styles.dashboardArea}>
                    {loading ? (
                        <div className={styles.loadingState}>
                            <div className={styles.spinner}></div>
                            <p>Loading your trials...</p>
                        </div>
                    ) : submissions.length === 0 ? (
                        // Empty State
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>🧪</div>
                            <h2>No Trials Yet</h2>
                            <p>First create a new simulation or build your own molecule in the lab, then submit it for clinical trials.</p>
                            <div className={styles.emptyActions}>
                                <button
                                    className={styles.btnPrimary}
                                    onClick={() => router.push('/dashboard/builder')}
                                >
                                    🔬 Build My Own
                                </button>
                                <button className={styles.btnSecondary}>
                                    🎲 New Simulation
                                </button>
                            </div>
                        </div>
                    ) : (
                        // Trial Cards Grid
                        <>
                            <div className={styles.dashboardHeader}>
                                <h2>Your Trials ({submissions.length})</h2>
                                <button
                                    className={styles.btnPrimary}
                                    onClick={() => router.push('/dashboard/builder')}
                                >
                                    + New Molecule
                                </button>
                            </div>
                            <div className={styles.trialsGrid}>
                                {submissions.map(trial => {
                                    // Determine the correct image for this trial
                                    const KNOWN_MOLECULES = ['aspirin', 'benzene', 'ibuprofen', 'paracetamol'];
                                    const moleculeNameLower = trial.moleculeName.toLowerCase();
                                    const matchedMolecule = KNOWN_MOLECULES.find(m => moleculeNameLower.includes(m));
                                    const staticImagePath = matchedMolecule ? `/clinical_trial/${matchedMolecule}.png` : '';

                                    return (
                                        <div
                                            key={trial.id}
                                            className={styles.trialCard}
                                            onClick={() => handleTrialClick(trial)}
                                        >
                                            <div
                                                className={styles.trialImage}
                                                style={{
                                                    background: 'linear-gradient(135deg, #0a1a2a 0%, #0d2436 50%, #0a1520 100%)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    position: 'relative',
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                {staticImagePath ? (
                                                    <img
                                                        src={staticImagePath}
                                                        alt={trial.moleculeName}
                                                        className={styles.moleculeImage}
                                                    />
                                                ) : (
                                                    <span className={styles.dnaEmoji}>
                                                        🧬
                                                    </span>
                                                )}
                                            </div>
                                            <div className={styles.trialInfo}>
                                                <h3>{trial.moleculeName}</h3>
                                                <p className={styles.trialMission}>{trial.missionTitle}</p>
                                                <div className={styles.trialStats}>
                                                    <span>Eff: {trial.stats.efficacy}%</span>
                                                    <span>Safe: {trial.stats.safety}%</span>
                                                </div>
                                                <div className={`${styles.trialStatus} ${styles[trial.status]}`}>
                                                    {trial.status === 'pending' && '⏳ Pending'}
                                                    {trial.status === 'in_progress' && '🔄 In Progress'}
                                                    {trial.status === 'completed' && '✅ Completed'}
                                                    {trial.status === 'failed' && '❌ Failed'}
                                                </div>
                                                <button
                                                    className={styles.btnDeleteTrial}
                                                    onClick={(e) => handleDeleteTrial(e, trial.id)}
                                                    title="Delete this trial"
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    }

    // ROADMAP VIEW - Show trial phases before simulation
    if (viewState === 'roadmap') {
        const roadmap = selectedTrial?.roadmap;

        return (
            <div className={styles.container}>
                <TopHeader title={selectedTrial?.moleculeName || 'Trial Roadmap'} subtitle="Clinical Development Pathway" />

                <div className={styles.roadmapArea}>
                    <button className={styles.backBtn} onClick={goBackToDashboard}>
                        ← Back to Dashboard
                    </button>

                    {loadingRoadmap ? (
                        <div className={styles.loadingState}>
                            <div className={styles.spinner}></div>
                            <p>Generating trial roadmap with AI...</p>
                        </div>
                    ) : roadmap ? (
                        <>
                            <div className={styles.roadmapHeader}>
                                <div className={styles.roadmapSummary}>
                                    <h2>Trial Overview</h2>
                                    <p>{roadmap.summary}</p>
                                    <div className={styles.successProb}>
                                        <span>Success Probability:</span>
                                        <div className={styles.probBar}>
                                            <div
                                                className={styles.probFill}
                                                style={{ width: `${roadmap.successProbability}%` }}
                                            />
                                        </div>
                                        <span className={styles.probValue}>{roadmap.successProbability}%</span>
                                    </div>
                                </div>
                                <button className={styles.proceedBtn} onClick={startSimulation}>
                                    ▶ Proceed to Trial Simulation
                                </button>
                            </div>

                            <div className={styles.phasesTimeline}>
                                {roadmap.phases.map((phase, idx) => (
                                    <div key={idx} className={styles.phaseItem}>
                                        <div className={styles.phaseNumber}>{idx + 1}</div>
                                        <div className={styles.phaseContent}>
                                            <h3>{phase.name}</h3>
                                            <span className={styles.phaseDuration}>{phase.duration}</span>
                                            <p>{phase.description}</p>
                                            <div className={styles.phaseActivities}>
                                                <strong>Key Activities:</strong>
                                                <ul>
                                                    {phase.keyActivities.map((act, i) => (
                                                        <li key={i}>{act}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div className={styles.phaseRisk}>
                                                ⚠️ <strong>Risk:</strong> {phase.risks}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <p>Failed to load roadmap data.</p>
                    )}
                </div>
            </div>
        );
    }

    // QUIZ VIEW
    if (viewState === 'quiz') {
        return (
            <div className={styles.container}>
                <TopHeader title="Semester Exam" subtitle={`${mission.semester}: ${mission.title}`} />
                <div className={styles.gameArea}>
                    <div className={styles.mainStage}>
                        {!quizCompleted ? (
                            <div className={styles.card}>
                                <div className={styles.phaseBadge} style={{ background: '#f59e0b' }}>Semester {mission.level} Exam</div>
                                <h3>Question {currentQuestionIndex + 1} / {quizQuestions.length}</h3>
                                <p style={{ fontSize: '1.2rem', fontWeight: 500, margin: '20px 0' }}>
                                    {quizQuestions[currentQuestionIndex]?.text}
                                </p>
                                <div className={styles.choices}>
                                    {quizQuestions[currentQuestionIndex]?.options.map((opt, idx) => (
                                        <button key={idx} className={styles.choiceBtn} onClick={() => handleQuizAnswer(idx)}>
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className={styles.card}>
                                <h1>{quizResult?.passed ? '🎓 SEMESTER PASSED!' : '❌ EXAM FAILED'}</h1>
                                <p style={{ fontSize: '1.1rem' }}>{quizResult?.msg}</p>
                                <div style={{ margin: '20px 0', fontSize: '2rem' }}>
                                    Score: {score} / {quizQuestions.length}
                                </div>
                                {quizResult?.passed && (
                                    <div style={{ background: '#064e3b', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                                        <strong>⭐ REWARDS:</strong><br />
                                        +1000 XP (Level Up!)<br />
                                        Next Semester Unlocked
                                    </div>
                                )}
                                <button className={styles.btnSecondary} onClick={goBackToDashboard}>
                                    Return to Trials
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // SIMULATION VIEW - AI-powered trial game
    return (
        <div className={styles.container}>
            <TopHeader
                title="Clinical Trial Simulator"
                subtitle={selectedTrial?.roadmap?.phases[currentPhaseIndex]?.name || 'Loading...'}
            />

            <div className={styles.gameArea}>
                {/* Stats Bar */}
                <div className={styles.statsBar}>
                    <div className={styles.statItem}>
                        <div className={styles.statLabel}>Budget</div>
                        <div className={styles.statValue} style={{ color: stats.budget < 2000000 ? '#ef4444' : '#00ACC1' }}>
                            ${(stats.budget / 1000000).toFixed(1)}M
                        </div>
                    </div>
                    <div className={styles.statItem}>
                        <div className={styles.statLabel}>Efficacy</div>
                        <div className={styles.statBarContainer}>
                            <div className={styles.statBarFill} style={{ width: `${stats.efficacy}%`, background: '#00ACC1' }} />
                        </div>
                        <div className={styles.statValueSm}>{stats.efficacy}%</div>
                    </div>
                    <div className={styles.statItem}>
                        <div className={styles.statLabel}>Safety</div>
                        <div className={styles.statBarContainer}>
                            <div className={styles.statBarFill} style={{ width: `${stats.safety}%`, background: stats.safety < 50 ? '#ef4444' : '#00ACC1' }} />
                        </div>
                        <div className={styles.statValueSm}>{stats.safety}%</div>
                    </div>
                </div>

                {/* Chemical Profile Display */}
                {selectedTrial?.chemicalStats && (
                    <div style={{
                        margin: '0 20px 20px 20px',
                        padding: '12px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        fontSize: '0.9rem'
                    }}>
                        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
                            <strong style={{ color: '#9ca3af', fontSize: '0.8rem', letterSpacing: '1px' }}>MICRO-STRUCTURE:</strong>
                            <span style={{ color: '#e5e7eb', fontFamily: 'monospace' }}>{selectedTrial.chemicalStats.formula}</span>
                            <span style={{ color: '#6b7280' }}>|</span>
                            <span style={{ color: '#e5e7eb' }}>{selectedTrial.chemicalStats.molecularWeight} Da</span>

                            {selectedTrial.chemicalStats.functionalGroups?.map((fg, i) => (
                                <span key={i} style={{
                                    background: 'rgba(59, 130, 246, 0.2)',
                                    color: '#93c5fd',
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    fontSize: '0.8rem'
                                }}>
                                    {fg}
                                </span>
                            ))}

                            {(selectedTrial.chemicalStats.warnings?.length ?? 0) > 0 && (
                                <span style={{
                                    background: 'rgba(239, 68, 68, 0.2)',
                                    color: '#fca5a5',
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    fontSize: '0.8rem',
                                    marginLeft: 'auto',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}>
                                    ⚠️ {selectedTrial.chemicalStats.warnings?.length} Structural Warnings
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Main Content Area */}
                <div className={styles.mainStage}>
                    {/* INTRO */}
                    {gameState === 'intro' && (
                        <div className={styles.card}>
                            <h1>🧪 {selectedTrial?.moleculeName}</h1>
                            <div className={styles.badge} style={{ background: '#4DD0E1', width: 'fit-content' }}>
                                AI-Powered Clinical Trial
                            </div>
                            <p style={{ margin: '20px 0' }}>
                                <strong>Objective:</strong> Navigate through {selectedTrial?.roadmap?.phases.length || 4} clinical trial phases.
                                <br /><br />
                                Each decision will be generated by AI based on your molecule&apos;s characteristics and current progress.
                            </p>
                            <button className={styles.btnPrimary} onClick={startPlaying}>
                                Begin Trial 🚀
                            </button>
                        </div>
                    )}

                    {/* PLAYING */}
                    {gameState === 'playing' && (
                        <>
                            {isGeneratingScenario || loadingEvent ? (
                                <div className={styles.loadingState}>
                                    <div className={styles.spinner}></div>
                                    <p>{isGeneratingScenario ? 'Generating Full Trial Scenarios...' : 'Loading...'}</p>
                                    {isGeneratingScenario && (
                                        <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '10px' }}>
                                            Creating events for all 4 phases...
                                        </p>
                                    )}
                                </div>
                            ) : currentEvent ? (
                                <div className={styles.card} style={{ borderColor: '#00ACC1' }}>
                                    <div className={styles.phaseBadge}>
                                        {selectedTrial?.roadmap?.phases[currentPhaseIndex]?.name}
                                    </div>
                                    <h2>{currentEvent.title}</h2>
                                    <p className={styles.eventDesc}>{currentEvent.description}</p>
                                    <div className={styles.choices}>
                                        {currentEvent.choices.map((choice, idx) => (
                                            <button
                                                key={idx}
                                                className={styles.choiceBtn}
                                                onClick={() => handleChoice(idx)}
                                            >
                                                <div className={styles.choiceText}>{choice.text}</div>
                                                <div className={styles.choiceEffect}>
                                                    {choice.budgetEffect < 0 ? `-$${Math.abs(choice.budgetEffect / 1000000).toFixed(1)}M` : ''}
                                                    {choice.efficacyEffect !== 0 ? ` Eff ${choice.efficacyEffect > 0 ? '+' : ''}${choice.efficacyEffect}` : ''}
                                                    {choice.safetyEffect !== 0 ? ` Safe ${choice.safetyEffect > 0 ? '+' : ''}${choice.safetyEffect}` : ''}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className={styles.card}>
                                    <p>Loading event...</p>
                                </div>
                            )}
                        </>
                    )}

                    {/* VICTORY */}
                    {gameState === 'victory' && (
                        <div className={styles.victoryOverlay}>
                            {/* Animated Particles */}
                            <div className={styles.victoryParticles}>
                                {Array.from({ length: 30 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className={styles.victoryParticle}
                                        style={{
                                            left: `${Math.random() * 100}%`,
                                            background: ['#00ACC1', '#4DD0E1', '#80DEEA', '#fbbf24', '#80DEEA', '#4DD0E1'][i % 6],
                                            width: `${4 + Math.random() * 8}px`,
                                            height: `${4 + Math.random() * 8}px`,
                                            animationDuration: `${2 + Math.random() * 4}s`,
                                            animationDelay: `${Math.random() * 3}s`,
                                        }}
                                    />
                                ))}
                            </div>

                            <div className={styles.victoryCard}>
                                <span className={styles.victoryIcon}>🎉</span>
                                <h1 className={styles.victoryTitle}>FDA APPROVED!</h1>
                                <p className={styles.victorySubtitle}>
                                    Excellent work, Doctor! Your drug <strong>{selectedTrial?.moleculeName}</strong> has passed all clinical trial phases and is cleared for market distribution.
                                </p>

                                {/* Final Stats */}
                                <div className={styles.victoryStats}>
                                    <div className={styles.victoryStat}>
                                        <span className={styles.victoryStatValue} style={{ color: '#00ACC1' }}>
                                            ${(stats.budget / 1000000).toFixed(1)}M
                                        </span>
                                        <span className={styles.victoryStatLabel}>Budget Left</span>
                                    </div>
                                    <div className={styles.victoryStat}>
                                        <span className={styles.victoryStatValue} style={{ color: '#4DD0E1' }}>
                                            {stats.efficacy}%
                                        </span>
                                        <span className={styles.victoryStatLabel}>Efficacy</span>
                                    </div>
                                    <div className={styles.victoryStat}>
                                        <span className={styles.victoryStatValue} style={{ color: '#80DEEA' }}>
                                            {stats.safety}%
                                        </span>
                                        <span className={styles.victoryStatLabel}>Safety</span>
                                    </div>
                                </div>

                                {/* XP Badge */}
                                <div className={styles.xpBadge}>⭐ +200 XP Earned</div>

                                {/* Achievement */}
                                <div className={styles.achievementUnlock}>
                                    <span className={styles.achieveIcon}>💊</span>
                                    <div className={styles.achieveInfo}>
                                        <div className={styles.achieveLabel}>Achievement Unlocked</div>
                                        <div className={styles.achieveTitle}>Trial Master</div>
                                    </div>
                                </div>

                                <p style={{ color: '#9ca3af', marginBottom: '24px', fontSize: '0.95rem' }}>
                                    To complete <strong style={{ color: '#fff' }}>Semester {mission.level}</strong>, pass the final exam.
                                </p>

                                <div className={styles.victoryActions}>
                                    <button className={styles.btnVictory} onClick={startQuiz}>
                                        Take Semester Exam 📝
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* GAMEOVER */}
                    {gameState === 'gameover' && (
                        <div className={styles.gameoverOverlay}>
                            <div className={styles.gameoverCard}>
                                <span className={styles.gameoverIcon}>🚫</span>
                                <h1 className={styles.gameoverTitle}>Trial Terminated</h1>

                                <div className={styles.gameoverReason}>{gameOverReason}</div>

                                {/* Stats at Failure */}
                                <div className={styles.gameoverStats}>
                                    <div className={styles.gameoverStat}>
                                        <span className={styles.gameoverStatValue} style={{ color: stats.budget <= 0 ? '#ef4444' : '#00ACC1' }}>
                                            ${(stats.budget / 1000000).toFixed(1)}M
                                        </span>
                                        <span className={styles.gameoverStatLabel}>Budget</span>
                                    </div>
                                    <div className={styles.gameoverStat}>
                                        <span className={styles.gameoverStatValue} style={{ color: '#4DD0E1' }}>
                                            {stats.efficacy}%
                                        </span>
                                        <span className={styles.gameoverStatLabel}>Efficacy</span>
                                    </div>
                                    <div className={styles.gameoverStat}>
                                        <span className={styles.gameoverStatValue} style={{ color: stats.safety <= 20 ? '#ef4444' : '#80DEEA' }}>
                                            {stats.safety}%
                                        </span>
                                        <span className={styles.gameoverStatLabel}>Safety</span>
                                    </div>
                                </div>

                                <p className={styles.gameoverTip}>
                                    💡 Tip: Balance cost-cutting with safety. Cutting too many corners leads to trial termination.
                                </p>

                                <div className={styles.gameoverActions}>
                                    <button className={styles.btnRetry} onClick={() => {
                                        setScenarioDeck([]);
                                        setEventIndex(-1);
                                        setCachedEvents([]);
                                        setGameState('intro');
                                        startPlaying();
                                    }}>
                                        🔁 Retry Trial
                                    </button>
                                    <button className={styles.btnGhost} onClick={goBackToDashboard}>
                                        Return to Dashboard
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Log Console */}
                <div className={styles.logConsole}>
                    <div className={styles.logTitle}>Activity Log</div>
                    <div className={styles.logList}>
                        {logs.map((log, i) => (
                            <div key={i} className={styles.logItem}>&gt; {log}</div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
