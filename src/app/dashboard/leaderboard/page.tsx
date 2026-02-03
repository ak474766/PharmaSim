
'use client';

import { useEffect, useState } from 'react';
import TopHeader from '@/components/layout/TopHeader';
import { UserService, UserProfile } from '@/lib/userService';
import styles from './Leaderboard.module.css';

export default function LeaderboardPage() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchLeaderboard() {
            try {
                const data = await UserService.getLeaderboard();
                setUsers(data);
            } catch (error) {
                console.error("Error loading leaderboard:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchLeaderboard();
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <TopHeader title="Global Leaderboard" subtitle="Top Researcher rankings based on contribution and discovery XP." />

            <div className={styles.leaderboardContainer}>
                <div className={styles.tableHeader}>
                    <div className={styles.colRank}>Rank</div>
                    <div className={styles.colUser}>Researcher</div>
                    <div className={styles.colLevel}>Level</div>
                    <div className={styles.colXP}>Total XP</div>
                    <div className={styles.colRep}>Reputation</div>
                </div>

                <div className={styles.tableBody}>
                    {loading ? (
                        <div className={styles.loadingRow}>Loading Research Data...</div>
                    ) : (
                        users.map((user, index) => (
                            <div key={user.uid} className={styles.row}>
                                <div className={styles.colRank} style={{ color: index < 3 ? '#fbbf24' : '#6b7280' }}>
                                    #{index + 1}
                                </div>
                                <div className={styles.colUser}>
                                    <div className={styles.userAvatar}>
                                        {user.displayName?.[0]?.toUpperCase()}
                                    </div>
                                    <div className={styles.userName}>
                                        {user.displayName}
                                    </div>
                                    {index === 0 && <span className={styles.badge}>👑 Top Scientist</span>}
                                </div>
                                <div className={styles.colLevel}>
                                    <span className={styles.levelBadge}>{user.level}</span>
                                </div>
                                <div className={styles.colXP}>
                                    {user.xp.toLocaleString()} <span>XP</span>
                                </div>
                                <div className={styles.colRep}>
                                    {user.reputation}%
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
