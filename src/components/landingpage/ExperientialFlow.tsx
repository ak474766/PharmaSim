'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './ExperientialFlow.module.css';

gsap.registerPlugin(ScrollTrigger);

export default function ExperientialFlow() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        gsap.to(container, {
            xPercent: -100,
            x: () => window.innerWidth,
            ease: 'none',
            scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top top',
                end: '+=200%',
                scrub: 1,
                pin: true,
                invalidateOnRefresh: true,
            },
        });
    }, []);

    return (
        <section ref={sectionRef} className={styles.section}>
            <div ref={containerRef} className={styles.container}>
                <div className={`${styles.panel} ${styles.panel1}`}>
                    <h2 className={styles.step}>01. Observe</h2>
                    <p className={styles.desc}>Witness molecular interactions at the atomic scale.</p>
                </div>
                <div className={`${styles.panel} ${styles.panel2}`}>
                    <h2 className={styles.step}>02. Predict</h2>
                    <p className={styles.desc}>Hypothesize outcomes based on structural data.</p>
                </div>
                <div className={`${styles.panel} ${styles.panel3}`}>
                    <h2 className={styles.step}>03. Synthesize</h2>
                    <p className={styles.desc}>Create novel compounds in a risk-free environment.</p>
                </div>
                <div className={`${styles.panel} ${styles.panel4}`}>
                    <h2 className={styles.step}>04. Validate</h2>
                    <p className={styles.desc}>Test efficacy against simulated biological systems.</p>
                </div>
            </div>
        </section>
    );
}
