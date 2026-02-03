'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './CognitiveTension.module.css';

gsap.registerPlugin(ScrollTrigger);

export default function CognitiveTension() {
    const containerRef = useRef<HTMLDivElement>(null);
    const leftRef = useRef<HTMLDivElement>(null);
    const rightRef = useRef<HTMLDivElement>(null);
    const lineRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: containerRef.current,
                start: 'top 80%',
                end: 'bottom 20%',
                scrub: 1,
            },
        });

        tl.fromTo(
            leftRef.current,
            { x: -50, opacity: 0 },
            { x: 0, opacity: 1, duration: 1 }
        )
            .fromTo(
                rightRef.current,
                { x: 50, opacity: 0 },
                { x: 0, opacity: 1, duration: 1 },
                '<'
            )
            .fromTo(
                lineRef.current,
                { scaleY: 0 },
                { scaleY: 1, duration: 1 },
                '<'
            );

    }, []);

    return (
        <section ref={containerRef} className={styles.section}>
            <div className={styles.container}>
                <div ref={leftRef} className={styles.oldWorld}>
                    <h2 className={styles.heading}>The Void</h2>
                    <p className={styles.text}>Static textbooks. <br /> Abstract theory. <br /> Lost context.</p>
                </div>

                <div className={styles.divider}>
                    <div ref={lineRef} className={styles.line} />
                </div>

                <div ref={rightRef} className={styles.newWorld}>
                    <h2 className={styles.heading}>The Bridge</h2>
                    <p className={styles.text}>Tactile simulation. <br /> Visceral understanding. <br /> <span className={styles.highlight}>True Mastery.</span></p>
                </div>
            </div>
        </section>
    );
}
