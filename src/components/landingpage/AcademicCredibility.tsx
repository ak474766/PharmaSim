'use client';

import styles from './AcademicCredibility.module.css';

export default function AcademicCredibility() {
    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={styles.label}>Trusted By</div>
                <div className={styles.grid}>
                    <div className={styles.partner}>MIT School of Science</div>
                    <div className={styles.partner}>Stanford Medicine</div>
                    <div className={styles.partner}>Pfizer R&D</div>
                    <div className={styles.partner}>Novartis Institutes</div>
                </div>
                <div className={styles.statRow}>
                    <div className={styles.stat}>
                        <span className={styles.val}>98%</span>
                        <span className={styles.key}>Retention Rate</span>
                    </div>
                    <div className={styles.stat}>
                        <span className={styles.val}>10k+</span>
                        <span className={styles.key}>Simulations Run</span>
                    </div>
                    <div className={styles.stat}>
                        <span className={styles.val}>0.4s</span>
                        <span className={styles.key}>Latency</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
