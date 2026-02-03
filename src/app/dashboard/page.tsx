'use client';

import styles from './Dashboard.module.css';
import TopHeader from '@/components/layout/TopHeader';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { UserService } from '@/lib/userService';

export default function Dashboard() {
    const { profile, user } = useAuth();
    const [rank, setRank] = useState<number>(0);

    useEffect(() => {
        if (user) {
            UserService.getUserRank(user.uid).then(setRank);
        }
    }, [user]);

    return (
        <div className={styles.container}>
            <TopHeader title="Research Lab Dashboard" subtitle={`Welcome back, ${profile?.displayName || 'Researcher'}.`} />

            <div className={styles.scrollArea}>
                {/* Stats Row */}
                <div className={styles.statsRow}>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>
                            Total XP
                            <span className={styles.iconBlue}>⚡</span>
                        </div>
                        <div className={styles.statValue}>{profile?.xp?.toLocaleString() || 0}</div>
                        <div className={styles.statChange}>↗ +15% from last session</div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>
                            Lab Reputation
                            <span className={styles.iconPurple}>🏆</span>
                        </div>
                        <div className={styles.statValue}>Lvl {profile?.level || 1}</div>
                        <div className={styles.progressBar}>
                            <div className={styles.progressFill} style={{ width: `${(profile?.xp || 0) % 1000 / 10}%` }} />
                        </div>
                        <div className={styles.progressText}>{(profile?.xp || 0) % 1000}/1000</div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>
                            Global Rank
                            <span className={styles.iconCyan}>🌎</span>
                        </div>
                        <div className={styles.statValue}>#{rank > 0 ? rank : '--'}</div>
                        <div className={styles.statChange}>{rank > 0 && rank < 100 ? 'Top 100 Researcher' : 'Keep contributing!'}</div>
                    </div>
                </div>

                <div className={styles.sectionTitle}>
                    <span className={styles.sectionIcon}>⚗️</span> Interactive Modules
                </div>

                {/* Modules Grid */}
                <div className={styles.modulesGrid}>
                    {/* Builder Module */}
                    <div className={styles.moduleCard}>
                        <div className={`${styles.cardBg} ${styles.bgBuilder}`} />
                        <div className={styles.cardContent}>
                            <div className={styles.tagAdvanced}>ADVANCED</div>
                            <div className={styles.cardTime}>25 min avg</div>
                            <h3 className={styles.cardTitle}>3D Molecular Builder</h3>
                            <p className={styles.cardDesc}>
                                Design complex molecular chains with real-time stability simulation and DNA helix mapping.
                            </p>
                            <Link href="/dashboard/builder" className={styles.btnEnter}>
                                Enter Lab <span>→</span>
                            </Link>
                        </div>
                    </div>

                    {/* Clinical Trials Module */}
                    <div className={styles.moduleCard}>
                        <div className={`${styles.cardBg} ${styles.bgTrials}`} />
                        <div className={styles.cardContent}>
                            <div className={styles.tagSim}>SIMULATION</div>
                            <div className={styles.cardTime}>15 min avg</div>
                            <h3 className={styles.cardTitle}>Clinical Trial Simulator</h3>
                            <p className={styles.cardDesc}>
                                Manage multi-phase drug testing. Analyze efficacy data and monitor adverse patient reactions.
                            </p>
                            <Link href="/dashboard/clinical-trials" className={styles.btnEnter}>
                                Review Data <span>→</span>
                            </Link>
                        </div>
                    </div>

                    {/* Quiz Module */}
                    <div className={styles.moduleCard}>
                        <div className={`${styles.cardBg} ${styles.bgQuiz}`} />
                        <div className={styles.cardContent}>
                            <div className={styles.tagTraining}>TRAINING</div>
                            <div className={styles.cardTime}>10 min avg</div>
                            <h3 className={styles.cardTitle}>Adaptive Quiz Engine</h3>
                            <p className={styles.cardDesc}>
                                Dynamic knowledge checks that adjust difficulty based on your performance. Level up your theory.
                            </p>
                            <Link href="/dashboard/quiz" className={styles.btnEnter}>
                                Start Session <span>→</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Footer / Recent Achievements */}
                <div className={styles.achievements}>
                    <h3 className={styles.achievementsTitle}>Recent Achievements</h3>

                    {(profile?.achievements || []).length === 0 ? (
                        <div style={{ padding: '20px 0', color: '#6b7280', fontSize: '0.9rem' }}>
                            No achievements unlocked yet. Start building!
                        </div>
                    ) : (
                        (profile?.achievements || []).slice(0, 3).map(ach => (
                            <div key={ach.id} className={styles.achievementRow}>
                                <div className={styles.achievementIcon}>{ach.icon}</div>
                                <div>
                                    <div className={styles.achievementName}>{ach.title}</div>
                                    <div className={styles.achievementDesc}>{ach.description}</div>
                                </div>
                                <div className={styles.achievementTime}>
                                    {new Date(ach.unlockedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

