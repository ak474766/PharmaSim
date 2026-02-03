'use client';

import { useState, useEffect } from 'react';
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
    const handleTrialClick = async (trial: TrialSubmission) => {
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

        // Update local state
        setSelectedTrial({ ...trial, roadmap });
        setStats({
            budget: INITIAL_BUDGET,
            efficacy: trial.stats.efficacy,
            safety: trial.stats.safety
        });
        setLoadingRoadmap(false);
    };

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
        setGameState('playing');
        await loadNextEvent();
    };

    // Load AI-generated event for current phase (with caching)
    const loadNextEvent = async () => {
        if (!selectedTrial?.roadmap) return;

        const phase = selectedTrial.roadmap.phases[currentPhaseIndex];
        if (!phase) {
            // All phases complete
            handleVictory();
            return;
        }

        // Check if we have this event cached already
        const nextEventIdx = eventIndex;
        if (cachedEvents[nextEventIdx]) {
            setCurrentEvent(cachedEvents[nextEventIdx]);
            return;
        }

        // Generate new event via AI
        setLoadingEvent(true);
        const event = await AiService.generateTrialEvent(
            selectedTrial.moleculeName,
            phase.name,
            phase.description,
            stats,
            previousEvents
        );

        // Add phaseIndex to the event for caching
        const eventWithPhase = { ...event, phaseIndex: currentPhaseIndex };

        // Add to cache
        const newCachedEvents = [...cachedEvents, eventWithPhase];
        setCachedEvents(newCachedEvents);
        setCurrentEvent(event);

        // Save cached events to Firebase immediately
        await TrialService.updateSimulationState(selectedTrial.id, {
            currentPhaseIndex,
            eventIndex: nextEventIdx,
            budget: stats.budget,
            efficacy: stats.efficacy,
            safety: stats.safety,
            logs,
            previousEvents,
            cachedEvents: newCachedEvents
        });

        setLoadingEvent(false);
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
                                {submissions.map(trial => (
                                    <div
                                        key={trial.id}
                                        className={styles.trialCard}
                                        onClick={() => handleTrialClick(trial)}
                                    >
                                        <div
                                            className={styles.trialImage}
                                            style={{
                                                background: trial.generatedImageUrl
                                                    ? `url(${trial.generatedImageUrl}) center/cover`
                                                    : `linear-gradient(135deg, #1e3a5f 0%, #0d1b2a 100%)`
                                            }}
                                        >
                                            {!trial.generatedImageUrl && (
                                                <div className={styles.moleculeIcon}>🧬</div>
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
                                        </div>
                                    </div>
                                ))}
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
                        <div className={styles.statValue} style={{ color: stats.budget < 2000000 ? '#ef4444' : '#10b981' }}>
                            ${(stats.budget / 1000000).toFixed(1)}M
                        </div>
                    </div>
                    <div className={styles.statItem}>
                        <div className={styles.statLabel}>Efficacy</div>
                        <div className={styles.statBarContainer}>
                            <div className={styles.statBarFill} style={{ width: `${stats.efficacy}%`, background: '#3b82f6' }} />
                        </div>
                        <div className={styles.statValueSm}>{stats.efficacy}%</div>
                    </div>
                    <div className={styles.statItem}>
                        <div className={styles.statLabel}>Safety</div>
                        <div className={styles.statBarContainer}>
                            <div className={styles.statBarFill} style={{ width: `${stats.safety}%`, background: stats.safety < 50 ? '#ef4444' : '#10b981' }} />
                        </div>
                        <div className={styles.statValueSm}>{stats.safety}%</div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className={styles.mainStage}>
                    {/* INTRO */}
                    {gameState === 'intro' && (
                        <div className={styles.card}>
                            <h1>🧪 {selectedTrial?.moleculeName}</h1>
                            <div className={styles.badge} style={{ background: '#8b5cf6', width: 'fit-content' }}>
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
                            {loadingEvent ? (
                                <div className={styles.loadingState}>
                                    <div className={styles.spinner}></div>
                                    <p>AI is generating next event...</p>
                                </div>
                            ) : currentEvent ? (
                                <div className={styles.card} style={{ borderColor: '#3b82f6' }}>
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
                        <div className={`${styles.card} ${styles.winCard}`}>
                            <h1>🎉 FDA APPROVED!</h1>
                            <p>Excellent work! The drug has been approved for market distribution.</p>
                            <p>Now, to complete <strong>Semester {mission.level}</strong>, you must pass the final exam.</p>
                            <button className={styles.btnPrimary} onClick={startQuiz}>Take Semester Exam 📝</button>
                        </div>
                    )}

                    {/* GAMEOVER */}
                    {gameState === 'gameover' && (
                        <div className={`${styles.card} ${styles.lossCard}`}>
                            <h1>🚫 Trial Terminated</h1>
                            <div className={styles.reason}>{gameOverReason}</div>
                            <button className={styles.btnSecondary} onClick={goBackToDashboard}>Return to Dashboard</button>
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
