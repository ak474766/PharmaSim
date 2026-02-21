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

    /* ========================================================
       Premium SVG Illustrations for Module Cards
       ======================================================== */

    const MoleculeIllustration = () => (
        <svg viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.cardSvg}>
            <defs>
                <radialGradient id="mol-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#4DD0E1" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="transparent" />
                </radialGradient>
                <filter id="mol-blur">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
                </filter>
                <linearGradient id="bond-grad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#4DD0E1" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#80DEEA" stopOpacity="0.6" />
                </linearGradient>
            </defs>
            {/* Background glow */}
            <circle cx="200" cy="100" r="85" fill="url(#mol-glow)" />
            {/* Hexagon ring bonds */}
            <polygon points="175,65 210,52 240,70 240,100 210,118 175,100" stroke="url(#bond-grad)" strokeWidth="2.5" fill="none" />
            {/* Double bond indicators */}
            <line x1="182" y1="70" x2="207" y2="58" stroke="#4DD0E1" strokeWidth="1.2" opacity="0.35" />
            <line x1="235" y1="95" x2="207" y2="112" stroke="#4DD0E1" strokeWidth="1.2" opacity="0.35" />
            {/* Atoms — Carbon ring */}
            <circle cx="175" cy="65" r="10" fill="#1a6b75" stroke="#4DD0E1" strokeWidth="1.5" opacity="0.9">
                <animate attributeName="r" values="10;11;10" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx="210" cy="52" r="8" fill="#0d4f5a" stroke="#80DEEA" strokeWidth="1.5" opacity="0.85" />
            <circle cx="240" cy="70" r="11" fill="#00838F" stroke="#4DD0E1" strokeWidth="1.5" opacity="0.9">
                <animate attributeName="r" values="11;12;11" dur="4s" repeatCount="indefinite" />
            </circle>
            <circle cx="240" cy="100" r="8" fill="#0d4f5a" stroke="#80DEEA" strokeWidth="1.5" opacity="0.85" />
            <circle cx="210" cy="118" r="9" fill="#1a6b75" stroke="#B2EBF2" strokeWidth="1.5" opacity="0.8" />
            <circle cx="175" cy="100" r="8" fill="#0d4f5a" stroke="#4DD0E1" strokeWidth="1.5" opacity="0.85" />
            {/* Oxygen side chain */}
            <line x1="175" y1="65" x2="140" y2="48" stroke="#4DD0E1" strokeWidth="2" opacity="0.4" />
            <circle cx="140" cy="48" r="12" fill="#BF360C" stroke="#FF5722" strokeWidth="1.5" opacity="0.7">
                <animate attributeName="opacity" values="0.7;0.9;0.7" dur="3.5s" repeatCount="indefinite" />
            </circle>
            <text x="136" y="52" fill="#fff" fontSize="8" fontWeight="bold" opacity="0.8">O</text>
            {/* Nitrogen side chain */}
            <line x1="240" y1="70" x2="275" y2="55" stroke="#80DEEA" strokeWidth="2" opacity="0.4" />
            <circle cx="275" cy="55" r="10" fill="#1565C0" stroke="#42A5F5" strokeWidth="1.5" opacity="0.7" />
            <text x="271" y="59" fill="#fff" fontSize="8" fontWeight="bold" opacity="0.8">N</text>
            {/* Hydrogen atoms */}
            <line x1="210" y1="118" x2="200" y2="145" stroke="#4DD0E1" strokeWidth="1.2" opacity="0.25" />
            <circle cx="200" cy="145" r="5" fill="#e0e0e0" opacity="0.4" />
            <line x1="175" y1="100" x2="148" y2="118" stroke="#80DEEA" strokeWidth="1.2" opacity="0.25" />
            <circle cx="148" cy="118" r="5" fill="#e0e0e0" opacity="0.4" />
            {/* Floating ambient particles */}
            <circle cx="110" cy="140" r="2" fill="#4DD0E1" opacity="0.2" filter="url(#mol-blur)">
                <animate attributeName="cy" values="140;128;140" dur="5s" repeatCount="indefinite" />
            </circle>
            <circle cx="300" cy="45" r="2.5" fill="#80DEEA" opacity="0.2" filter="url(#mol-blur)">
                <animate attributeName="cy" values="45;35;45" dur="4s" repeatCount="indefinite" />
            </circle>
            <circle cx="320" cy="150" r="1.5" fill="#4DD0E1" opacity="0.15" filter="url(#mol-blur)">
                <animate attributeName="cy" values="150;140;150" dur="6s" repeatCount="indefinite" />
            </circle>
            <circle cx="90" cy="70" r="1.5" fill="#80DEEA" opacity="0.15" filter="url(#mol-blur)">
                <animate attributeName="cy" values="70;62;70" dur="5.5s" repeatCount="indefinite" />
            </circle>
        </svg>
    );

    const TrialIllustration = () => (
        <svg viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.cardSvg}>
            <defs>
                <radialGradient id="trial-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#00ACC1" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="transparent" />
                </radialGradient>
                <linearGradient id="flask-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4DD0E1" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#00ACC1" stopOpacity="0.55" />
                </linearGradient>
                <linearGradient id="flask-glass" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#80DEEA" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#4DD0E1" stopOpacity="0.1" />
                </linearGradient>
                <filter id="flask-glow">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
                </filter>
            </defs>
            <circle cx="200" cy="100" r="80" fill="url(#trial-glow)" />
            {/* Flask body — clean glassmorphic look */}
            <path d="M188 50 L188 88 L158 138 Q154 146 162 150 L238 150 Q246 146 242 138 L212 88 L212 50"
                stroke="url(#flask-glass)" strokeWidth="2.5" fill="rgba(0,172,193,0.03)" />
            {/* Flask top ring */}
            <rect x="182" y="44" width="36" height="8" rx="3" stroke="#80DEEA" strokeWidth="1.5" fill="none" opacity="0.5" />
            {/* Liquid with wave animation */}
            <path d="M168 118 Q182 108 200 115 Q218 122 232 115 L242 138 Q246 146 238 150 L162 150 Q154 146 158 138 Z"
                fill="url(#flask-fill)" opacity="0.7">
                <animate attributeName="d"
                    values="M168 118 Q182 108 200 115 Q218 122 232 115 L242 138 Q246 146 238 150 L162 150 Q154 146 158 138 Z;
                            M168 116 Q185 122 200 114 Q215 106 232 118 L242 138 Q246 146 238 150 L162 150 Q154 146 158 138 Z;
                            M168 118 Q182 108 200 115 Q218 122 232 115 L242 138 Q246 146 238 150 L162 150 Q154 146 158 138 Z"
                    dur="4s" repeatCount="indefinite" />
            </path>
            {/* Inner glow on liquid */}
            <ellipse cx="200" cy="140" rx="30" ry="6" fill="#4DD0E1" opacity="0.08" filter="url(#flask-glow)" />
            {/* Bubbles */}
            <circle cx="190" cy="130" r="3.5" fill="#4DD0E1" opacity="0.35">
                <animate attributeName="cy" values="135;110;85" dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.35;0.15;0" dur="3s" repeatCount="indefinite" />
                <animate attributeName="r" values="3.5;2.5;1.5" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx="205" cy="135" r="2.5" fill="#80DEEA" opacity="0.3">
                <animate attributeName="cy" values="138;115;90" dur="3.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.3;0.12;0" dur="3.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="197" cy="140" r="3" fill="#4DD0E1" opacity="0.25">
                <animate attributeName="cy" values="140;118;95" dur="4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.25;0.1;0" dur="4s" repeatCount="indefinite" />
            </circle>
            {/* Phase labels */}
            <text x="105" y="82" fill="#4DD0E1" fontSize="9" opacity="0.35" fontFamily="monospace" fontWeight="600">Phase I</text>
            <text x="270" y="72" fill="#80DEEA" fontSize="9" opacity="0.35" fontFamily="monospace" fontWeight="600">Phase II</text>
            <text x="275" y="125" fill="#B2EBF2" fontSize="9" opacity="0.25" fontFamily="monospace" fontWeight="600">Phase III</text>
            {/* Phase connecting lines */}
            <line x1="145" y1="80" x2="155" y2="78" stroke="#4DD0E1" strokeWidth="1" opacity="0.2" strokeDasharray="3 2" />
            <line x1="265" y1="70" x2="255" y2="72" stroke="#80DEEA" strokeWidth="1" opacity="0.2" strokeDasharray="3 2" />
        </svg>
    );

    const QuizIllustration = () => (
        <svg viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.cardSvg}>
            <defs>
                <radialGradient id="quiz-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#80DEEA" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="transparent" />
                </radialGradient>
                <filter id="neural-glow">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" />
                </filter>
            </defs>
            <circle cx="200" cy="100" r="75" fill="url(#quiz-glow)" />
            {/* Brain outline left hemisphere */}
            <path d="M190 55 Q165 55 158 72 Q152 90 163 102 Q155 108 158 120 Q162 132 178 136 Q185 138 195 135 Q200 132 205 126"
                stroke="#4DD0E1" strokeWidth="2" fill="none" opacity="0.45" />
            {/* Brain outline right hemisphere */}
            <path d="M210 55 Q235 55 242 72 Q248 90 237 102 Q245 108 242 120 Q238 132 222 136 Q215 138 205 135 Q200 132 195 126"
                stroke="#80DEEA" strokeWidth="2" fill="none" opacity="0.45" />
            {/* Brain top */}
            <path d="M190 55 Q195 43 200 40 Q205 43 210 55"
                stroke="#4DD0E1" strokeWidth="2" fill="none" opacity="0.4" />
            {/* Glowing neural nodes */}
            <circle cx="172" cy="72" r="5" fill="#00ACC1" opacity="0.7">
                <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="228" cy="72" r="5" fill="#4DD0E1" opacity="0.7">
                <animate attributeName="opacity" values="0.5;1;0.5" dur="2.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="162" cy="100" r="4" fill="#80DEEA" opacity="0.6">
                <animate attributeName="opacity" values="0.4;0.9;0.4" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx="238" cy="100" r="4" fill="#00ACC1" opacity="0.6">
                <animate attributeName="opacity" values="0.4;0.9;0.4" dur="2.8s" repeatCount="indefinite" />
            </circle>
            <circle cx="200" cy="90" r="6" fill="#4DD0E1" opacity="0.8">
                <animate attributeName="r" values="6;7;6" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx="185" cy="120" r="3.5" fill="#80DEEA" opacity="0.5">
                <animate attributeName="opacity" values="0.3;0.7;0.3" dur="3.2s" repeatCount="indefinite" />
            </circle>
            <circle cx="215" cy="120" r="3.5" fill="#4DD0E1" opacity="0.5">
                <animate attributeName="opacity" values="0.3;0.7;0.3" dur="2.7s" repeatCount="indefinite" />
            </circle>
            {/* Neural connections */}
            <line x1="172" y1="72" x2="200" y2="90" stroke="#4DD0E1" strokeWidth="1.2" opacity="0.25" />
            <line x1="228" y1="72" x2="200" y2="90" stroke="#80DEEA" strokeWidth="1.2" opacity="0.25" />
            <line x1="162" y1="100" x2="200" y2="90" stroke="#4DD0E1" strokeWidth="1" opacity="0.2" />
            <line x1="238" y1="100" x2="200" y2="90" stroke="#80DEEA" strokeWidth="1" opacity="0.2" />
            <line x1="172" y1="72" x2="162" y2="100" stroke="#4DD0E1" strokeWidth="0.8" opacity="0.15" />
            <line x1="228" y1="72" x2="238" y2="100" stroke="#80DEEA" strokeWidth="0.8" opacity="0.15" />
            <line x1="185" y1="120" x2="200" y2="90" stroke="#80DEEA" strokeWidth="0.8" opacity="0.15" />
            <line x1="215" y1="120" x2="200" y2="90" stroke="#4DD0E1" strokeWidth="0.8" opacity="0.15" />
            {/* Gear outlines (right side) */}
            <g opacity="0.3" transform="translate(280, 65)">
                <circle cx="0" cy="0" r="16" stroke="#9CA3AF" strokeWidth="1.5" fill="none" />
                <circle cx="0" cy="0" r="6" fill="#6B7280" opacity="0.3" />
                {/* Gear teeth */}
                <rect x="-3" y="-20" width="6" height="8" rx="1" fill="#6B7280" opacity="0.4" />
                <rect x="-3" y="12" width="6" height="8" rx="1" fill="#6B7280" opacity="0.4" />
                <rect x="12" y="-3" width="8" height="6" rx="1" fill="#6B7280" opacity="0.4" />
                <rect x="-20" y="-3" width="8" height="6" rx="1" fill="#6B7280" opacity="0.4" />
            </g>
            <g opacity="0.2" transform="translate(310, 110)">
                <circle cx="0" cy="0" r="12" stroke="#6B7280" strokeWidth="1" fill="none" />
                <circle cx="0" cy="0" r="4" fill="#4B5563" opacity="0.3" />
                <rect x="-2" y="-15" width="4" height="6" rx="1" fill="#4B5563" opacity="0.3" />
                <rect x="-2" y="9" width="4" height="6" rx="1" fill="#4B5563" opacity="0.3" />
                <rect x="9" y="-2" width="6" height="4" rx="1" fill="#4B5563" opacity="0.3" />
                <rect x="-15" y="-2" width="6" height="4" rx="1" fill="#4B5563" opacity="0.3" />
            </g>
            {/* Floating question marks */}
            <text x="115" y="70" fill="#4DD0E1" fontSize="16" opacity="0.15" fontFamily="serif" fontWeight="bold">?</text>
            <text x="90" y="130" fill="#80DEEA" fontSize="12" opacity="0.1" fontFamily="serif" fontWeight="bold">?</text>
        </svg>
    );

    /* ========================================================
       Stat Card SVG Visuals
       ======================================================== */

    const TrophyVisual = () => (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.statSvg}>
            <defs>
                <linearGradient id="trophy-gold" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FFD54F" />
                    <stop offset="100%" stopColor="#FF8F00" />
                </linearGradient>
                <filter id="trophy-glow">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
                </filter>
            </defs>
            <ellipse cx="32" cy="32" rx="28" ry="28" fill="#FFD54F" opacity="0.06" filter="url(#trophy-glow)" />
            {/* Cup body */}
            <path d="M22 16 L22 30 Q22 40 32 44 Q42 40 42 30 L42 16 Z"
                fill="url(#trophy-gold)" opacity="0.7" />
            {/* Cup handles */}
            <path d="M22 20 Q14 20 14 28 Q14 34 22 34" stroke="#FFD54F" strokeWidth="2" fill="none" opacity="0.4" />
            <path d="M42 20 Q50 20 50 28 Q50 34 42 34" stroke="#FFD54F" strokeWidth="2" fill="none" opacity="0.4" />
            {/* Base */}
            <rect x="27" y="44" width="10" height="4" rx="1" fill="#FFD54F" opacity="0.5" />
            <rect x="24" y="48" width="16" height="3" rx="1.5" fill="#FFD54F" opacity="0.4" />
            {/* Star */}
            <polygon points="32,22 33.5,27 38,27 34.5,30 35.5,35 32,32 28.5,35 29.5,30 26,27 30.5,27"
                fill="#fff" opacity="0.5" />
        </svg>
    );

    const GlobeVisual = () => (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.statSvg}>
            <defs>
                <radialGradient id="globe-glow" cx="40%" cy="40%" r="50%">
                    <stop offset="0%" stopColor="#4DD0E1" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#00ACC1" stopOpacity="0.05" />
                </radialGradient>
                <filter id="globe-blur">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
                </filter>
            </defs>
            {/* Outer glow */}
            <circle cx="32" cy="32" r="28" fill="#4DD0E1" opacity="0.05" filter="url(#globe-blur)" />
            {/* Globe body */}
            <circle cx="32" cy="32" r="22" fill="url(#globe-glow)" stroke="#4DD0E1" strokeWidth="1.5" opacity="0.6" />
            {/* Longitude lines */}
            <ellipse cx="32" cy="32" rx="10" ry="22" stroke="#4DD0E1" strokeWidth="0.8" fill="none" opacity="0.25" />
            <ellipse cx="32" cy="32" rx="18" ry="22" stroke="#80DEEA" strokeWidth="0.6" fill="none" opacity="0.15" />
            {/* Latitude lines */}
            <ellipse cx="32" cy="22" rx="20" ry="4" stroke="#4DD0E1" strokeWidth="0.6" fill="none" opacity="0.2" />
            <ellipse cx="32" cy="32" rx="22" ry="4" stroke="#80DEEA" strokeWidth="0.8" fill="none" opacity="0.25" />
            <ellipse cx="32" cy="42" rx="20" ry="4" stroke="#4DD0E1" strokeWidth="0.6" fill="none" opacity="0.2" />
            {/* Continents (simplified) */}
            <path d="M24 22 Q28 18 34 21 Q36 23 33 26 Q30 28 26 25 Z" fill="#4DD0E1" opacity="0.2" />
            <path d="M36 30 Q40 28 43 32 Q42 36 38 35 Z" fill="#80DEEA" opacity="0.15" />
            <path d="M22 33 Q25 31 28 34 Q26 38 22 36 Z" fill="#4DD0E1" opacity="0.15" />
            {/* Rotation highlight */}
            <circle cx="26" cy="26" r="6" fill="#fff" opacity="0.05" />
        </svg>
    );

    const modules = [
        {
            tag: 'LAB',
            tagClass: styles.tagAdvanced,
            gradient: styles.bgBuilder,
            image: '/dashboard/molecule_builder.png',
            title: 'Molecule Builder',
            desc: 'Design molecular structures using the periodic table, functional groups, and SMILES analysis. Get AI-powered analysis.',
            stat: `${moleculesCount} molecules built`,
            href: '/dashboard/builder',
            cta: 'Enter Lab',
        },
        {
            tag: 'SIMULATION',
            tagClass: styles.tagSim,
            gradient: styles.bgTrials,
            image: '/dashboard/clinical_trial.png',
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
            image: '/dashboard/adaptive_quizzes.png',
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
                    {/* XP Card */}
                    <div className={`${styles.statCard} ${styles.statCardXP}`}>
                        <div className={styles.statCardGlow} />
                        <div className={styles.statContent}>
                            <div className={styles.statLabel}>
                                Total XP
                            </div>
                            <div className={styles.statValue}>{currentXP.toLocaleString()}</div>
                            <div className={styles.statSub}>Level {currentLevel} · {xpInLevel}/1,000 to next</div>
                            <div className={styles.progressBar}>
                                <div className={styles.progressFill} style={{ width: `${xpInLevel / 10}%` }} />
                            </div>
                        </div>
                        <div className={styles.statVisual}>
                            <span className={styles.statVisualXP}>⚡</span>
                        </div>
                    </div>

                    {/* Trial Record Card */}
                    <div className={`${styles.statCard} ${styles.statCardTrial}`}>
                        <div className={styles.statCardGlow} />
                        <div className={styles.statContent}>
                            <div className={styles.statLabel}>
                                Trial Record
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
                        <div className={styles.statVisual}>
                            {/* Circular Gauge Ring */}
                            <svg viewBox="0 0 80 80" className={styles.trialGauge}>
                                <defs>
                                    <linearGradient id="gauge-bg" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#1e293b" />
                                        <stop offset="100%" stopColor="#0f172a" />
                                    </linearGradient>
                                </defs>
                                {/* Background ring */}
                                <circle cx="40" cy="40" r="30" fill="none"
                                    stroke="rgba(255,255,255,0.04)" strokeWidth="6" />
                                {/* Completed arc (green) */}
                                {totalTrials > 0 && (
                                    <circle cx="40" cy="40" r="30" fill="none"
                                        stroke="#10b981" strokeWidth="6"
                                        strokeDasharray={`${(completedTrials / Math.max(totalTrials, 1)) * 188.5} 188.5`}
                                        strokeDashoffset="0"
                                        strokeLinecap="round"
                                        transform="rotate(-90 40 40)"
                                        style={{ filter: 'drop-shadow(0 0 3px rgba(16,185,129,0.4))' }}
                                    />
                                )}
                                {/* Failed arc (red) */}
                                {trials.filter(t => t.status === 'failed').length > 0 && (
                                    <circle cx="40" cy="40" r="30" fill="none"
                                        stroke="#ef4444" strokeWidth="6"
                                        strokeDasharray={`${(trials.filter(t => t.status === 'failed').length / Math.max(totalTrials, 1)) * 188.5} 188.5`}
                                        strokeDashoffset={`${-(completedTrials / Math.max(totalTrials, 1)) * 188.5}`}
                                        strokeLinecap="round"
                                        transform="rotate(-90 40 40)"
                                        style={{ filter: 'drop-shadow(0 0 3px rgba(239,68,68,0.4))' }}
                                    />
                                )}
                                {/* Active arc (amber) */}
                                {inProgressTrials > 0 && (
                                    <circle cx="40" cy="40" r="30" fill="none"
                                        stroke="#fbbf24" strokeWidth="6"
                                        strokeDasharray={`${(inProgressTrials / Math.max(totalTrials, 1)) * 188.5} 188.5`}
                                        strokeDashoffset={`${-((completedTrials + trials.filter(t => t.status === 'failed').length) / Math.max(totalTrials, 1)) * 188.5}`}
                                        strokeLinecap="round"
                                        transform="rotate(-90 40 40)"
                                        style={{ filter: 'drop-shadow(0 0 3px rgba(251,191,36,0.4))' }}
                                    />
                                )}
                                {/* Inner status dots */}
                                <circle cx="33" cy="40" r="3.5" fill="#10b981" opacity="0.8" />
                                <circle cx="43" cy="40" r="3.5" fill="#ef4444" opacity="0.6" />
                                <circle cx="38" cy="31" r="3" fill="#fbbf24" opacity="0.7" />
                            </svg>
                        </div>
                    </div>

                    {/* Global Rank Card */}
                    <div className={`${styles.statCard} ${styles.statCardRank}`}>
                        <div className={styles.statCardGlow} />
                        <div className={styles.statContent}>
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
                        <div className={styles.statVisual}>
                            <img
                                src="/globe_rank_visual.png"
                                alt=""
                                className={styles.statVisualImg}
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
                            />
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
                                <img src={mod.image} alt={mod.title} className={styles.cardImage} />
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
