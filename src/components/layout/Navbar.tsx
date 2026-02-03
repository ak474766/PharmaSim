'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import PharmaLogo from '../ui/PharmaLogo';
import styles from './Navbar.module.css';

export default function Navbar() {
    const { user } = useAuth();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
            <div className={styles.container}>
                <Link href="/" className={styles.logoLink}>
                    <PharmaLogo />
                </Link>

                <div className={styles.links}>
                    <Link href="#system" className={styles.link}>System</Link>
                    <Link href="#vision" className={styles.link}>Vision</Link>
                </div>

                <div className={styles.auth}>
                    {user ? (
                        <Link href="/dashboard" className={styles.dashboardBtn}>
                            Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link href="/login" className={styles.loginBtn}>Sign In</Link>
                            <Link href="/signup" className={styles.signupBtn}>Sign Up</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
