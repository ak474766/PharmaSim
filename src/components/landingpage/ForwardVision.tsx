'use client';

import styles from './ForwardVision.module.css';

export default function ForwardVision() {
    return (
        <section className={styles.section}>
            <div className={styles.content}>
                <h2 className={styles.text}>
                    Simulation is just the beginning.
                </h2>
                <p className={styles.sub}>
                    Generating the next era of therapeutics.
                </p>
            </div>
            <div className={styles.background} />
        </section>
    );
}
