
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './Sidebar.module.css';
import { auth } from '@/lib/firebase';

export default function Sidebar() {
    const pathname = usePathname();
    const { user, profile } = useAuth();

    // Helper to determine active state
    const isActive = (path: string) => pathname === path || (path !== '/dashboard' && pathname.startsWith(path));

    return (
        <aside className={styles.sidebar}>
            <div className={styles.profile}>
                <div className={styles.avatar}>
                    {profile?.displayName?.[0]?.toUpperCase() || 'D'}
                </div>
                <div className={styles.userInfo}>
                    <div className={styles.userName}>
                        {profile?.displayName || 'Researcher'}
                    </div>
                    <div className={styles.userRole}>Senior Biochemist • Lvl {profile?.level || 1}</div>
                </div>
            </div>

            <nav className={styles.nav}>
                <Link href="/dashboard" className={`${styles.navItem} ${pathname === '/dashboard' ? styles.active : ''}`}>
                    <span>📊</span> Dashboard
                </Link>
                <Link href="/dashboard/builder" className={`${styles.navItem} ${isActive('/dashboard/builder') ? styles.active : ''}`}>
                    <span>🧬</span> Molecule Builder
                </Link>
                <Link href="/dashboard/clinical-trials" className={`${styles.navItem} ${isActive('/dashboard/clinical-trials') ? styles.active : ''}`}>
                    <span>🧪</span> Clinical Trials
                </Link>
                <Link href="/dashboard/quiz" className={`${styles.navItem} ${isActive('/dashboard/quiz') ? styles.active : ''}`}>
                    <span>🎓</span> Learning Quizzes
                </Link>
                <Link href="/dashboard/leaderboard" className={`${styles.navItem} ${isActive('/dashboard/leaderboard') ? styles.active : ''}`}>
                    <span>🏆</span> Global Leaderboard
                </Link>
                <Link href="#" className={styles.navItem}>
                    <span>🗃️</span> Archive Lab
                </Link>
            </nav>

            <div className={styles.quests}>
                <div className={styles.questTitle}>Daily Quests</div>

                {(profile?.dailyQuests || []).length === 0 ? (
                    <div style={{ padding: '0 24px', fontSize: '0.8rem', color: '#6b7280' }}>All quests complete!</div>
                ) : (
                    (profile?.dailyQuests || []).map(quest => (
                        <div key={quest.id} className={styles.questItem}>
                            <div className={styles.questName}>
                                <span>{quest.title}</span>
                                {quest.completed ? (
                                    <span style={{ color: '#10b981' }}>Complete</span>
                                ) : (
                                    <span>{quest.progress}/{quest.total}</span>
                                )}
                            </div>
                            <div className={styles.progressBar}>
                                <div
                                    className={`${styles.progressFill} ${quest.completed ? styles.complete : ''}`}
                                    style={{ width: `${(quest.progress / quest.total) * 100}%` }}
                                />
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className={styles.footer}>
                <div className={styles.footerLink}>
                    <span>⚙️</span> Settings
                </div>
                <div className={`${styles.footerLink}`} onClick={() => auth.signOut()}>
                    <span>🚪</span> Logout
                </div>
            </div>
        </aside>
    );
}
