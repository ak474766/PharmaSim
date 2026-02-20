'use client';

import styles from './Dashboard.module.css';
import TopHeader from '@/components/layout/TopHeader';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { UserService } from '@/lib/userService';
import { TrialService, TrialSubmission } from '@/lib/trialService';

export default function Dashboard() {
    const { profile, user } = useAuth();
    const [rank, setRank] = useState<number>(0);
    const [trials, setTrials] = useState<TrialSubmission[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            Promise.all([
                UserService.getUserRank(user.uid).then(setRank),
                TrialService.getSubmissions(user.uid).then(setTrials),
            ]).finally(() => setLoading(false));
        }
    }, [user]);

    // Derived real stats
    const completedTrials = trials.filter(t => t.status === 'completed').length;
    const failedTrials = trials.filter(t => t.status === 'failed').length;
    const inProgressTrials = trials.filter(t => t.status === 'in_progress').length;
    const totalTrials = trials.length;
    const successRate = totalTrials > 0 ? Math.round((completedTrials / totalTrials) * 100) : 0;
    const moleculesCount = profile?.moleculesDiscovered || 0;
    const currentXP = profile?.xp || 0;
    const currentLevel = profile?.level || 1;
    const xpInLevel = currentXP % 1000;
    const reputation = profile?.reputation || 100;

    // Topic mastery
    const mastery = profile?.topicMastery || {};
    const masteryEntries = Object.entries(mastery);

    // Recent activity from trials
    const recentTrials = trials.slice(0, 3);

    // SVG illustrations for module cards
    const MoleculeIllustration = () => (
        <svg viewBox="0 0 400 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.cardSvg}>
            <defs>
                <radialGradient id="mol-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#4DD0E1" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="transparent" />
                </radialGradient>
            </defs>
            <circle cx="200" cy="80" r="70" fill="url(#mol-glow)" />
            {/* Bonds */}
            <line x1="140" y1="80" x2="180" y2="55" stroke="#4DD0E1" strokeWidth="2" opacity="0.5" />
            <line x1="180" y1="55" x2="220" y2="55" stroke="#80DEEA" strokeWidth="2" opacity="0.5" />
            <line x1="220" y1="55" x2="260" y2="80" stroke="#4DD0E1" strokeWidth="2" opacity="0.5" />
            <line x1="260" y1="80" x2="220" y2="105" stroke="#80DEEA" strokeWidth="2" opacity="0.5" />
            <line x1="220" y1="105" x2="180" y2="105" stroke="#4DD0E1" strokeWidth="2" opacity="0.5" />
            <line x1="180" y1="105" x2="140" y2="80" stroke="#80DEEA" strokeWidth="2" opacity="0.5" />
            {/* Hexagon double bonds */}
            <line x1="153" y1="78" x2="182" y2="63" stroke="#4DD0E1" strokeWidth="1" opacity="0.3" />
            <line x1="218" y1="63" x2="247" y2="78" stroke="#4DD0E1" strokeWidth="1" opacity="0.3" />
            <line x1="218" y1="97" x2="182" y2="97" stroke="#4DD0E1" strokeWidth="1" opacity="0.3" />
            {/* Atoms */}
            <circle cx="140" cy="80" r="8" fill="#00ACC1" opacity="0.8">
                <animate attributeName="r" values="8;9;8" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx="180" cy="55" r="6" fill="#4DD0E1" opacity="0.8" />
            <circle cx="220" cy="55" r="8" fill="#00838F" opacity="0.8">
                <animate attributeName="r" values="8;9;8" dur="4s" repeatCount="indefinite" />
            </circle>
            <circle cx="260" cy="80" r="6" fill="#4DD0E1" opacity="0.8" />
            <circle cx="220" cy="105" r="7" fill="#80DEEA" opacity="0.7" />
            <circle cx="180" cy="105" r="6" fill="#4DD0E1" opacity="0.8" />
            {/* Side chains */}
            <line x1="140" y1="80" x2="110" y2="65" stroke="#4DD0E1" strokeWidth="1.5" opacity="0.3" />
            <circle cx="110" cy="65" r="4" fill="#80DEEA" opacity="0.5" />
            <line x1="260" y1="80" x2="290" y2="65" stroke="#4DD0E1" strokeWidth="1.5" opacity="0.3" />
            <circle cx="290" cy="65" r="4" fill="#80DEEA" opacity="0.5" />
            {/* Floating particles */}
            <circle cx="100" cy="120" r="2" fill="#4DD0E1" opacity="0.3">
                <animate attributeName="cy" values="120;110;120" dur="5s" repeatCount="indefinite" />
            </circle>
            <circle cx="300" cy="40" r="2" fill="#80DEEA" opacity="0.3">
                <animate attributeName="cy" values="40;30;40" dur="4s" repeatCount="indefinite" />
            </circle>
            <circle cx="320" cy="120" r="1.5" fill="#4DD0E1" opacity="0.2">
                <animate attributeName="cy" values="120;115;120" dur="6s" repeatCount="indefinite" />
            </circle>
        </svg>
    );

    const TrialIllustration = () => (
        <svg viewBox="0 0 400 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.cardSvg}>
            <defs>
                <radialGradient id="trial-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#00ACC1" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="transparent" />
                </radialGradient>
                <linearGradient id="flask-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4DD0E1" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#00ACC1" stopOpacity="0.5" />
                </linearGradient>
            </defs>
            <circle cx="200" cy="80" r="65" fill="url(#trial-glow)" />
            {/* Flask body */}
            <path d="M185 45 L185 85 L160 125 Q158 130 163 133 L237 133 Q242 130 240 125 L215 85 L215 45" stroke="#4DD0E1" strokeWidth="2" fill="none" opacity="0.6" />
            {/* Flask top */}
            <line x1="178" y1="45" x2="222" y2="45" stroke="#80DEEA" strokeWidth="2" opacity="0.5" />
            {/* Liquid */}
            <path d="M170 105 Q180 95 200 100 Q220 105 230 100 L240 125 Q242 130 237 133 L163 133 Q158 130 160 125 Z" fill="url(#flask-fill)" opacity="0.6">
                <animate attributeName="d" values="M170 105 Q180 95 200 100 Q220 105 230 100 L240 125 Q242 130 237 133 L163 133 Q158 130 160 125 Z;M170 103 Q185 108 200 102 Q215 96 230 103 L240 125 Q242 130 237 133 L163 133 Q158 130 160 125 Z;M170 105 Q180 95 200 100 Q220 105 230 100 L240 125 Q242 130 237 133 L163 133 Q158 130 160 125 Z" dur="4s" repeatCount="indefinite" />
            </path>
            {/* Bubbles */}
            <circle cx="190" cy="115" r="3" fill="#4DD0E1" opacity="0.4">
                <animate attributeName="cy" values="120;100;85" dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.4;0.2;0" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx="205" cy="118" r="2" fill="#80DEEA" opacity="0.3">
                <animate attributeName="cy" values="122;105;90" dur="3.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.3;0.15;0" dur="3.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="198" cy="125" r="2.5" fill="#4DD0E1" opacity="0.35">
                <animate attributeName="cy" values="125;108;92" dur="4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.35;0.18;0" dur="4s" repeatCount="indefinite" />
            </circle>
            {/* Phase arrows */}
            <text x="110" y="75" fill="#4DD0E1" fontSize="8" opacity="0.4" fontFamily="monospace">Phase I</text>
            <text x="265" y="65" fill="#80DEEA" fontSize="8" opacity="0.4" fontFamily="monospace">Phase II</text>
            <text x="270" y="110" fill="#B2EBF2" fontSize="8" opacity="0.3" fontFamily="monospace">Phase III</text>
            {/* Connecting dots */}
            <circle cx="135" cy="70" r="2" fill="#4DD0E1" opacity="0.3" />
            <circle cx="145" cy="72" r="1.5" fill="#4DD0E1" opacity="0.2" />
            <circle cx="295" cy="62" r="2" fill="#80DEEA" opacity="0.3" />
            <circle cx="265" cy="108" r="2" fill="#B2EBF2" opacity="0.2" />
        </svg>
    );

    const QuizIllustration = () => (
        <svg viewBox="0 0 400 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.cardSvg}>
            <defs>
                <radialGradient id="quiz-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#80DEEA" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="transparent" />
                </radialGradient>
            </defs>
            <circle cx="200" cy="80" r="60" fill="url(#quiz-glow)" />
            {/* Brain outline left */}
            <path d="M185 50 Q165 50 160 65 Q155 80 165 90 Q158 95 160 105 Q163 115 175 118 Q180 120 190 118 Q195 116 200 112" stroke="#4DD0E1" strokeWidth="1.5" fill="none" opacity="0.5" />
            {/* Brain outline right */}
            <path d="M215 50 Q235 50 240 65 Q245 80 235 90 Q242 95 240 105 Q237 115 225 118 Q220 120 210 118 Q205 116 200 112" stroke="#80DEEA" strokeWidth="1.5" fill="none" opacity="0.5" />
            {/* Brain top */}
            <path d="M185 50 Q190 40 200 38 Q210 40 215 50" stroke="#4DD0E1" strokeWidth="1.5" fill="none" opacity="0.5" />
            {/* Neural nodes */}
            <circle cx="175" cy="65" r="4" fill="#00ACC1" opacity="0.6">
                <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="225" cy="65" r="4" fill="#4DD0E1" opacity="0.6">
                <animate attributeName="opacity" values="0.6;1;0.6" dur="2.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="165" cy="90" r="3" fill="#80DEEA" opacity="0.5">
                <animate attributeName="opacity" values="0.5;0.9;0.5" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx="235" cy="90" r="3" fill="#00ACC1" opacity="0.5">
                <animate attributeName="opacity" values="0.5;0.9;0.5" dur="2.8s" repeatCount="indefinite" />
            </circle>
            <circle cx="200" cy="80" r="5" fill="#4DD0E1" opacity="0.7">
                <animate attributeName="r" values="5;6;5" dur="3s" repeatCount="indefinite" />
            </circle>
            {/* Neural connections */}
            <line x1="175" y1="65" x2="200" y2="80" stroke="#4DD0E1" strokeWidth="1" opacity="0.25" />
            <line x1="225" y1="65" x2="200" y2="80" stroke="#80DEEA" strokeWidth="1" opacity="0.25" />
            <line x1="165" y1="90" x2="200" y2="80" stroke="#4DD0E1" strokeWidth="1" opacity="0.2" />
            <line x1="235" y1="90" x2="200" y2="80" stroke="#80DEEA" strokeWidth="1" opacity="0.2" />
            <line x1="175" y1="65" x2="165" y2="90" stroke="#4DD0E1" strokeWidth="0.8" opacity="0.15" />
            <line x1="225" y1="65" x2="235" y2="90" stroke="#80DEEA" strokeWidth="0.8" opacity="0.15" />
            {/* Question marks floating */}
            <text x="120" y="60" fill="#4DD0E1" fontSize="14" opacity="0.2" fontFamily="serif">?</text>
            <text x="275" y="55" fill="#80DEEA" fontSize="12" opacity="0.15" fontFamily="serif">?</text>
            <text x="290" y="115" fill="#4DD0E1" fontSize="10" opacity="0.12" fontFamily="serif">?</text>
            <text x="100" y="110" fill="#80DEEA" fontSize="11" opacity="0.15" fontFamily="serif">?</text>
            {/* Light bulb hint */}
            <circle cx="310" cy="45" r="8" stroke="#4DD0E1" strokeWidth="1" fill="none" opacity="0.2" />
            <line x1="310" y1="53" x2="310" y2="58" stroke="#4DD0E1" strokeWidth="1" opacity="0.2" />
            <circle cx="310" cy="45" r="3" fill="#4DD0E1" opacity="0.15">
                <animate attributeName="opacity" values="0.15;0.35;0.15" dur="4s" repeatCount="indefinite" />
            </circle>
        </svg>
    );

    const modules = [
        {
            tag: 'LAB',
            tagClass: styles.tagAdvanced,
            gradient: styles.bgBuilder,
            illustration: <MoleculeIllustration />,
            title: 'Molecule Builder',
            desc: 'Design molecular structures using the periodic table, functional groups, and SMILES notation. Get AI-powered analysis.',
            stat: `${moleculesCount} molecules built`,
            href: '/dashboard/builder',
            cta: 'Enter Lab',
        },
        {
            tag: 'SIMULATION',
            tagClass: styles.tagSim,
            gradient: styles.bgTrials,
            illustration: <TrialIllustration />,
            title: 'Clinical Trials',
            desc: 'Guide your drug through multi-phase FDA trials. Manage budgets, efficacy, and safety across real-world scenarios.',
            stat: `${completedTrials}/${totalTrials} completed`,
            href: '/dashboard/clinical-trials',
            cta: 'Review Trials',
        },
        {
            tag: 'TRAINING',
            tagClass: styles.tagTraining,
            gradient: styles.bgQuiz,
            illustration: <QuizIllustration />,
            title: 'Adaptive Quizzes',
            desc: 'AI-generated questions across pharmacology, chemistry, and regulatory topics. Difficulty adapts to your mastery level.',
            stat: `${masteryEntries.length} topics tracked`,
            href: '/dashboard/quiz',
            cta: 'Start Session',
        },
    ];

    return (
        <div className={styles.container}>
            <TopHeader title="Research Lab" subtitle={`Welcome back, ${profile?.displayName || 'Researcher'}.`} />

            <div className={styles.scrollArea}>
                {/* ===== Stats Row ===== */}
                <div className={styles.statsRow}>
                    <div className={styles.statCard}>
                        <div className={styles.statCardGlow} />
                        <div className={styles.statLabel}>
                            Total XP
                            <span className={styles.statIcon}>⚡</span>
                        </div>
                        <div className={styles.statValue}>{currentXP.toLocaleString()}</div>
                        <div className={styles.statSub}>Level {currentLevel} · {xpInLevel}/1,000 to next</div>
                        <div className={styles.progressBar}>
                            <div className={styles.progressFill} style={{ width: `${xpInLevel / 10}%` }} />
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statCardGlow} />
                        <div className={styles.statLabel}>
                            Trial Record
                            <span className={styles.statIcon}>🧪</span>
                        </div>
                        <div className={styles.statValue}>{completedTrials}/{totalTrials}</div>
                        <div className={styles.statSub}>
                            {successRate}% success rate
                            {inProgressTrials > 0 && ` · ${inProgressTrials} active`}
                        </div>
                        <div className={styles.trialDots}>
                            {trials.slice(0, 10).map((t, i) => (
                                <div
                                    key={i}
                                    className={`${styles.trialDot} ${t.status === 'completed' ? styles.dotSuccess :
                                        t.status === 'failed' ? styles.dotFail :
                                            styles.dotActive
                                        }`}
                                    title={`${t.moleculeName} — ${t.status}`}
                                />
                            ))}
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statCardGlow} />
                        <div className={styles.statLabel}>
                            Global Rank
                            <span className={styles.statIcon}>🌎</span>
                        </div>
                        <div className={styles.statValue}>#{rank > 0 ? rank : '--'}</div>
                        <div className={styles.statSub}>
                            {rank > 0 && rank <= 10 ? '🏆 Top 10 Researcher' :
                                rank > 0 && rank <= 50 ? '⭐ Top 50 Researcher' :
                                    rank > 0 && rank <= 100 ? 'Top 100 Researcher' :
                                        'Keep contributing!'}
                        </div>
                        <div className={styles.repBar}>
                            <span className={styles.repLabel}>Reputation</span>
                            <span className={styles.repValue}>{reputation}%</span>
                        </div>
                    </div>
                </div>

                {/* ===== Modules Section ===== */}
                <div className={styles.sectionHeader}>
                    <div className={styles.sectionTitle}>
                        <span>⚗️</span> Interactive Modules
                    </div>
                    <div className={styles.sectionBadge}>{modules.length} available</div>
                </div>

                <div className={styles.modulesGrid}>
                    {modules.map((mod) => (
                        <div key={mod.href} className={styles.moduleCard}>
                            <div className={`${styles.cardBg} ${mod.gradient}`}>
                                {mod.illustration}
                            </div>
                            <div className={styles.cardContent}>
                                <div className={styles.cardTopRow}>
                                    <div className={mod.tagClass}>{mod.tag}</div>
                                    <div className={styles.cardStat}>{mod.stat}</div>
                                </div>
                                <h3 className={styles.cardTitle}>{mod.title}</h3>
                                <p className={styles.cardDesc}>{mod.desc}</p>
                                <Link href={mod.href} className={styles.btnEnter}>
                                    {mod.cta} <span>→</span>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ===== Bottom Grid: Activity + Mastery ===== */}
                <div className={styles.bottomGrid}>
                    {/* Recent Activity */}
                    <div className={styles.activityPanel}>
                        <h3 className={styles.panelTitle}>
                            <span>📋</span> Recent Activity
                        </h3>
                        {recentTrials.length === 0 ? (
                            <div className={styles.emptyState}>
                                <span className={styles.emptyIcon}>🧬</span>
                                <p>No trials yet. Build a molecule and start your first clinical trial!</p>
                            </div>
                        ) : (
                            <div className={styles.activityList}>
                                {recentTrials.map((trial) => (
                                    <div key={trial.id} className={styles.activityRow}>
                                        <div className={`${styles.activityDot} ${trial.status === 'completed' ? styles.dotSuccess :
                                            trial.status === 'failed' ? styles.dotFail :
                                                styles.dotActive
                                            }`} />
                                        <div className={styles.activityInfo}>
                                            <div className={styles.activityName}>{trial.moleculeName}</div>
                                            <div className={styles.activityMeta}>
                                                {trial.missionTitle} · {trial.status === 'completed' ? '✓ Approved' : trial.status === 'failed' ? '✗ Terminated' : '⏳ In Progress'}
                                            </div>
                                        </div>
                                        <div className={styles.activityTime}>
                                            {new Date(trial.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Achievements + Mastery */}
                    <div className={styles.achievePanel}>
                        <h3 className={styles.panelTitle}>
                            <span>🏅</span> Achievements
                            <span className={styles.achieveCount}>{(profile?.achievements || []).length}</span>
                        </h3>
                        {(profile?.achievements || []).length === 0 ? (
                            <div className={styles.emptyState}>
                                <span className={styles.emptyIcon}>🏆</span>
                                <p>Complete trials and quizzes to earn achievements!</p>
                            </div>
                        ) : (
                            <div className={styles.achieveList}>
                                {(profile?.achievements || []).slice(0, 4).map(ach => (
                                    <div key={ach.id} className={styles.achieveRow}>
                                        <div className={styles.achieveIcon}>{ach.icon}</div>
                                        <div className={styles.achieveInfo}>
                                            <div className={styles.achieveName}>{ach.title}</div>
                                            <div className={styles.achieveDesc}>{ach.description}</div>
                                        </div>
                                        <div className={styles.achieveDate}>
                                            {new Date(ach.unlockedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Topic Mastery */}
                        {masteryEntries.length > 0 && (
                            <div className={styles.masterySection}>
                                <div className={styles.masteryTitle}>Topic Mastery</div>
                                <div className={styles.masteryGrid}>
                                    {masteryEntries.map(([topic, level]) => (
                                        <div key={topic} className={styles.masteryItem}>
                                            <div className={styles.masteryLabel}>
                                                {topic.charAt(0).toUpperCase() + topic.slice(1)}
                                            </div>
                                            <div className={styles.masteryBarBg}>
                                                <div
                                                    className={styles.masteryBarFill}
                                                    style={{ width: `${(Number(level) / 5) * 100}%` }}
                                                />
                                            </div>
                                            <div className={styles.masteryLevel}>{level}/5</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
