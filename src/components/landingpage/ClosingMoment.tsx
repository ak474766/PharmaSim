'use client';

import styles from './ClosingMoment.module.css';

export default function ClosingMoment() {
    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <h2 className={styles.title}>Ready to synthesize?</h2>
                <a href="#contact" className={styles.cta}>
                    Request Access
                </a>
            </div>
        </section>
    );
}
