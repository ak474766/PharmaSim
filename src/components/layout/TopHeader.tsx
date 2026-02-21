
'use client';

import styles from './TopHeader.module.css';
import { useAuth } from '@/context/AuthContext';

interface TopHeaderProps {
    title?: string;
    subtitle?: string;
}

export default function TopHeader({
    title = "Research Lab Dashboard",
    subtitle = "Welcome back, researcher. Your next breakthrough awaits.",
}: TopHeaderProps) {
    const { profile } = useAuth();
    const coins = profile?.coins || 0;

    return (
        <header className={styles.header}>
            <div className={styles.titleSection}>
                <h1 className={styles.title}>{title}</h1>
                <p className={styles.subtitle}>{subtitle}</p>
            </div>

            <div className={styles.actions}>
                <div className={styles.coinBtn}>
                    <span className={styles.coinIcon}>🪙</span>
                    <span className={styles.coinValue}>{coins.toLocaleString()}</span>
                </div>
                <button className={styles.primaryBtn}>
                    <span>+</span> New Simulation
                </button>
            </div>
        </header>
    );
}
