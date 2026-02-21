'use client';

import { useGameEvent } from '@/context/GameEventContext';
import styles from './GameToast.module.css';

export default function GameToast() {
    const { events, dismissEvent } = useGameEvent();

    if (events.length === 0) return null;

    return (
        <div className={styles.toastContainer}>
            {events.map((event, index) => {
                switch (event.type) {
                    case 'coins':
                        return (
                            <div
                                key={event.id}
                                className={`${styles.toast} ${styles.coinToast}`}
                                style={{ top: `${24 + index * 80}px` }}
                                onClick={() => dismissEvent(event.id)}
                            >
                                {/* Flying coin particles */}
                                <div className={styles.coinParticles}>
                                    {[...Array(5)].map((_, i) => (
                                        <span key={i} className={styles.coinParticle}>🪙</span>
                                    ))}
                                </div>
                                <span className={styles.coinIconLarge}>🪙</span>
                                <div className={styles.coinInfo}>
                                    <div className={styles.coinAmount}>{event.title}</div>
                                    <div className={styles.coinSub}>{event.subtitle}</div>
                                </div>
                            </div>
                        );

                    case 'levelUp':
                        return (
                            <div
                                key={event.id}
                                className={`${styles.toast} ${styles.levelUpToast}`}
                                onClick={() => dismissEvent(event.id)}
                            >
                                <div className={styles.levelUpGlow} />
                                {/* Rising spark particles */}
                                <div className={styles.levelParticles}>
                                    {[...Array(8)].map((_, i) => (
                                        <div key={i} className={styles.levelParticle} />
                                    ))}
                                </div>
                                <div className={styles.levelUpLabel}>Congratulations</div>
                                <div className={styles.levelUpIcon}>🚀</div>
                                <div className={styles.levelUpTitle}>{event.title}</div>
                                <div className={styles.levelUpSub}>{event.subtitle}</div>
                            </div>
                        );

                    case 'achievement':
                        return (
                            <div
                                key={event.id}
                                className={`${styles.toast} ${styles.achieveToast}`}
                                style={{ top: `${24 + index * 90}px` }}
                                onClick={() => dismissEvent(event.id)}
                            >
                                <div className={styles.achieveIconWrapper}>
                                    {event.icon}
                                </div>
                                <div>
                                    <div className={styles.achieveLabel}>Achievement Unlocked</div>
                                    <div className={styles.achieveTitle}>{event.title}</div>
                                    <div className={styles.achieveSub}>{event.subtitle}</div>
                                </div>
                            </div>
                        );

                    case 'xp':
                        return (
                            <div
                                key={event.id}
                                className={`${styles.toast} ${styles.xpToast}`}
                                style={{ top: `${24 + index * 70}px` }}
                                onClick={() => dismissEvent(event.id)}
                            >
                                <span className={styles.xpIcon}>{event.icon}</span>
                                <div>
                                    <div className={styles.xpAmount}>{event.title}</div>
                                    <div className={styles.xpSub}>{event.subtitle}</div>
                                </div>
                            </div>
                        );

                    default:
                        return null;
                }
            })}
        </div>
    );
}
