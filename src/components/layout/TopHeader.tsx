
'use client';

import styles from './TopHeader.module.css';

interface TopHeaderProps {
    title?: string;
    subtitle?: string;
}

export default function TopHeader({ title = "Research Lab Dashboard", subtitle = "Welcome back, researcher. Your next breakthrough awaits." }: TopHeaderProps) {
    return (
        <header className={styles.header}>
            <div className={styles.titleSection}>
                <h1 className={styles.title}>{title}</h1>
                <p className={styles.subtitle}>{subtitle}</p>
            </div>

            <div className={styles.actions}>
                <button className={styles.iconBtn}>
                    🔔
                </button>
                <button className={styles.primaryBtn}>
                    <span>+</span> New Simulation
                </button>
            </div>
        </header>
    );
}
