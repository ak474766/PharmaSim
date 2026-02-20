
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './Sidebar.module.css';
import { auth } from '@/lib/firebase';
import PharmaLogo from '@/components/ui/PharmaLogo';

export default function Sidebar() {
    const pathname = usePathname();
    const { profile } = useAuth();

    const isActive = (path: string) =>
        pathname === path || (path !== '/dashboard' && pathname.startsWith(path));

    // Calculate XP progress within current level (1000 XP per level)
    const currentXP = profile?.xp || 0;
    const xpInLevel = currentXP % 1000;
    const xpPercent = (xpInLevel / 1000) * 100;

    const activeQuests = (profile?.dailyQuests || []).filter(q => !q.completed).length;
    const totalQuests = (profile?.dailyQuests || []).length;

    const navItems = [
        { href: '/dashboard', icon: '📊', label: 'Dashboard' },
        { href: '/dashboard/builder', icon: '🧬', label: 'Molecule Builder' },
        { href: '/dashboard/clinical-trials', icon: '🧪', label: 'Clinical Trials' },
        { href: '/dashboard/quiz', icon: '🎓', label: 'Learning Quizzes' },
        { divider: true },
        { href: '/dashboard/leaderboard', icon: '🏆', label: 'Leaderboard' },
        { href: '/dashboard/rewards', icon: '🪙', label: 'Rewards' },
    ];

    return (
        <aside className={styles.sidebar}>
            {/* Brand */}
            <div className={styles.brand}>
                <PharmaLogo size={32} showText={false} />
                <span className={styles.brandName}>PharmaSim</span>
                <span className={styles.brandTag}>Beta</span>
            </div>

            {/* Profile Card */}
            <div className={styles.profile}>
                <Link href="/dashboard/settings" style={{ textDecoration: 'none' }}>
                    <div className={styles.profileCard}>
                        <div className={styles.avatarWrapper}>
                            <div className={styles.avatar}>
                                {profile?.displayName?.[0]?.toUpperCase() || 'R'}
                            </div>
                            <div className={styles.statusDot} />
                            <div className={styles.levelBadge}>{profile?.level || 1}</div>
                        </div>
                        <div className={styles.userInfo}>
                            <div className={styles.userName}>
                                {profile?.displayName || 'Researcher'}
                            </div>
                            <div className={styles.userRole}>Senior Biochemist</div>
                            <div className={styles.xpBar}>
                                <div
                                    className={styles.xpFill}
                                    style={{ width: `${xpPercent}%` }}
                                />
                            </div>
                            <div className={styles.xpText}>
                                {xpInLevel} / 1,000 XP
                            </div>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Section Label */}
            <div className={styles.sectionLabel}>Navigation</div>

            {/* Navigation */}
            <nav className={styles.nav}>
                {navItems.map((item, i) => {
                    if ('divider' in item && item.divider) {
                        return <div key={`div-${i}`} className={styles.navDivider} />;
                    }
                    if (!item.href) return null;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`${styles.navItem} ${item.href === '/dashboard'
                                ? pathname === '/dashboard' ? styles.active : ''
                                : isActive(item.href) ? styles.active : ''
                                }`}
                        >
                            <div className={styles.navIcon}>
                                <span>{item.icon}</span>
                            </div>
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Daily Quests */}
            <div className={styles.quests}>
                <div className={styles.questHeader}>
                    <div className={styles.questTitle}>
                        <span className={styles.questTitleIcon}>⚡</span>
                        Daily Quests
                    </div>
                    <div className={styles.questBadge}>
                        {activeQuests}/{totalQuests}
                    </div>
                </div>

                {totalQuests === 0 ? (
                    <div className={styles.emptyQuest}>No quests today</div>
                ) : (
                    (profile?.dailyQuests || []).map(quest => (
                        <div key={quest.id} className={styles.questItem}>
                            <div className={styles.questName}>
                                <span>{quest.title}</span>
                                {quest.completed ? (
                                    <span className={styles.questComplete}>
                                        ✓ Done
                                    </span>
                                ) : (
                                    <span className={styles.questProgress}>
                                        {quest.progress}/{quest.total}
                                    </span>
                                )}
                            </div>
                            <div className={styles.progressBar}>
                                <div
                                    className={`${styles.progressFill} ${quest.completed ? styles.complete : ''}`}
                                    style={{ width: `${Math.min((quest.progress / quest.total) * 100, 100)}%` }}
                                />
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Footer */}
            <div className={styles.footer}>
                <Link href="/dashboard/settings" className={styles.footerLink}>
                    <div className={styles.footerIcon}>⚙️</div>
                    Settings
                </Link>
                <div
                    className={`${styles.footerLink} ${styles.footerLinkDanger}`}
                    onClick={() => auth.signOut()}
                >
                    <div className={styles.footerIcon}>🚪</div>
                    Logout
                </div>
            </div>
        </aside>
    );
}
