'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './SystemIntelligence.module.css';

gsap.registerPlugin(ScrollTrigger);

import use3DTilt from '@/hooks/use3DTilt';

const capabilities = [
    {
        title: 'Molecular Simulation',
        desc: 'Real-time interaction with complex binding affinities.',
        id: '01'
    },
    {
        title: 'Clinical Feedback',
        desc: 'Adaptive patient response modeling based on dosage.',
        id: '02'
    },
    {
        title: 'Regulatory Logic',
        desc: 'Integrated compliance constraints and safety protocols.',
        id: '03'
    }
];

function TiltCard({ cap }: { cap: typeof capabilities[0] }) {
    const ref = use3DTilt(15);

    return (
        <div ref={ref} className={styles.card}>
            <span className={styles.cardId}>{cap.id}</span>
            <h3 className={styles.cardTitle}>{cap.title}</h3>
            <p className={styles.cardDesc}>{cap.desc}</p>
            <div className={styles.cardGlow} />
        </div>
    );
}

export default function SystemIntelligence() {
    const sectionRef = useRef<HTMLDivElement>(null);
    // We'll trust the child refs for tilt, but for the stagger animation
    // we might need a wrapper or just animate the mounting. 
    // Simplified for now: mounting animation handles the entry.

    return (
        <section ref={sectionRef} className={styles.section}>
            <div className={styles.header}>
                <h2 className={styles.title}>System Intelligence</h2>
                <p className={styles.subtitle}>Three layers of computational depth.</p>
            </div>

            <div className={styles.grid}>
                {capabilities.map((cap) => (
                    <TiltCard key={cap.id} cap={cap} />
                ))}
            </div>
        </section>
    );
}
