
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

    const getRankStyle = (index: number) => {
        if (index === 0) return styles.rankGold;
        if (index === 1) return styles.rankSilver;
        if (index === 2) return styles.rankBronze;
        return '';
    };

    // Top 3 for the podium (reorder: 2nd, 1st, 3rd)
    const podiumUsers = users.length >= 3 ? [users[1], users[0], users[2]] : [];
    // Remaining users for the table (start from #4)
    const tableUsers = users.slice(3);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <TopHeader title="Global Leaderboard" subtitle="Top Researcher rankings based on contribution and discovery XP." />

            <div className={styles.leaderboardContainer}>
                {loading ? (
                    <div className={styles.loadingRow}>Loading Research Data...</div>
                ) : (
                    <>
                        {/* === PODIUM === */}
                        {podiumUsers.length === 3 && (
                            <div className={styles.podium}>
                                {/* 2nd Place */}
                                <div className={styles.podiumSlot}>
                                    <div className={styles.podiumAvatarSecond}>
                                        {podiumUsers[0].displayName?.[0]?.toUpperCase()}
                                    </div>
                                    <div className={styles.podiumName}>{podiumUsers[0].displayName}</div>
                                    <div className={styles.podiumXP}>{podiumUsers[0].xp.toLocaleString()} XP</div>
                                    <div className={styles.podiumBaseSecond}>#2</div>
                                </div>

                                {/* 1st Place */}
                                <div className={styles.podiumSlot}>
                                    <div className={styles.podiumAvatarFirst}>
                                        <span className={styles.podiumCrown}>👑</span>
                                        {podiumUsers[1].displayName?.[0]?.toUpperCase()}
                                    </div>
                                    <div className={styles.podiumName}>{podiumUsers[1].displayName}</div>
                                    <div className={styles.podiumXP}>{podiumUsers[1].xp.toLocaleString()} XP</div>
                                    <div className={styles.podiumBaseFirst}>#1</div>
                                </div>

                                {/* 3rd Place */}
                                <div className={styles.podiumSlot}>
                                    <div className={styles.podiumAvatarThird}>
                                        {podiumUsers[2].displayName?.[0]?.toUpperCase()}
                                    </div>
                                    <div className={styles.podiumName}>{podiumUsers[2].displayName}</div>
                                    <div className={styles.podiumXP}>{podiumUsers[2].xp.toLocaleString()} XP</div>
                                    <div className={styles.podiumBaseThird}>#3</div>
                                </div>
                            </div>
                        )}

                        {/* === TABLE === */}
                        <div className={styles.tableHeader}>
                            <div className={styles.colRank}>Rank</div>
                            <div className={styles.colUser}>Researcher</div>
                            <div className={styles.colLevel}>Level</div>
                            <div className={styles.colXP}>Total XP</div>
                            <div className={styles.colRep}>Reputation</div>
                            <div className={styles.colAchieve}>Badges</div>
                        </div>

                        <div className={styles.tableBody}>
                            {tableUsers.length === 0 && users.length <= 3 ? (
                                // If only 3 or fewer users, show them in the table too
                                users.map((user, index) => (
                                    <div
                                        key={user.uid}
                                        className={styles.row}
                                        style={{ animationDelay: `${index * 0.05}s` }}
                                    >
                                        <div className={`${styles.colRank} ${getRankStyle(index)}`}>
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
                                        <div className={styles.colAchieve}>
                                            {(user.achievements || []).slice(0, 4).map((a, ai) => (
                                                <span key={ai} className={styles.achieveBadge} title={a.title}>
                                                    {a.icon}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                tableUsers.map((user, index) => (
                                    <div
                                        key={user.uid}
                                        className={styles.row}
                                        style={{ animationDelay: `${index * 0.05}s` }}
                                    >
                                        <div className={styles.colRank} style={{ color: '#6b7280' }}>
                                            #{index + 4}
                                        </div>
                                        <div className={styles.colUser}>
                                            <div className={styles.userAvatar}>
                                                {user.displayName?.[0]?.toUpperCase()}
                                            </div>
                                            <div className={styles.userName}>
                                                {user.displayName}
                                            </div>
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
                                        <div className={styles.colAchieve}>
                                            {(user.achievements || []).slice(0, 4).map((a, ai) => (
                                                <span key={ai} className={styles.achieveBadge} title={a.title}>
                                                    {a.icon}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
