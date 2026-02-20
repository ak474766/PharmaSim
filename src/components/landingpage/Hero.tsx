'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import MolecularBackground from '../ui/MolecularBackground';
import styles from './Hero.module.css';

export default function Hero() {
    const containerRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const subRef = useRef<HTMLParagraphElement>(null);
    const floatingImageRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        // Initial darkness
        gsap.set(containerRef.current, { autoAlpha: 1 });

        tl.fromTo(
            textRef.current,
            { y: 100, opacity: 0, skewY: 5 },
            { y: 0, opacity: 1, skewY: 0, duration: 1.5, delay: 0.5 }
        )
            .fromTo(
                subRef.current,
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 1 },
                '-=1'
            );

        // Subtle background movement
        gsap.to(`.${styles.orb}`, {
            y: -50,
            duration: 10,
            repeat: -1,
            yoyo: true,
            // The orbs are now part of MolecularBackground, so this specific animation is removed.
        });

        // Floating image animation - like a particle in space
        if (floatingImageRef.current) {
            // Initial fade in with scale
            gsap.fromTo(
                floatingImageRef.current,
                { opacity: 0, scale: 0.8, y: 50 },
                { opacity: 1, scale: 1, y: 0, duration: 1.5, delay: 0.8, ease: 'power2.out' }
            );

            // Continuous floating animation
            gsap.to(floatingImageRef.current, {
                y: -20,
                duration: 4,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
            });

            // Subtle rotation animation
            gsap.to(floatingImageRef.current, {
                rotation: 3,
                duration: 6,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
            });

            // Subtle horizontal drift
            gsap.to(floatingImageRef.current, {
                x: 15,
                duration: 7,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
            });
        }
    }, []);

    return (
        <section ref={containerRef} className={styles.hero}>
            <MolecularBackground />
            <div className={styles.background}>
                {/* Fallback/Overlay grid */}
                <div className={styles.grid} />
            </div>

            <div className={styles.content}>
                <h1 ref={textRef} className={styles.title}>
                    Redefining <br />
                    <span className={styles.highlight}>Chemical Cognition</span>
                </h1>
                <p ref={subRef} className={styles.subtitle}>
                    The world's first experiential learning platform for advanced pharmaceutical sciences.
                </p>
            </div>

            {/* Floating Hero Image */}
            <div ref={floatingImageRef} className={styles.floatingImage}>
                <Image
                    src="/image.png"
                    alt="PharmaSim - Molecular Controller"
                    width={500}
                    height={300}
                    priority
                    className={styles.heroImage}
                />
            </div>
        </section>
    );
}
