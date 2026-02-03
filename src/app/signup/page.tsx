'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MolecularBackground from '@/components/ui/MolecularBackground';
import styles from '../login/Login.module.css'; // Reusing Cinematic Styles

export default function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleGoogleSignup = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className={styles.container}>
            <MolecularBackground />
            <div className={styles.formCard}>
                <h1 className={styles.title}>Initialize Entity</h1>
                {error && <p className={styles.error}>{error}</p>}
                <form onSubmit={handleSignup} className={styles.form}>
                    <div className={styles.group}>
                        <input
                            type="email"
                            placeholder=" "
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.input}
                            required
                        />
                        <label className={styles.label}>Primary Identifier (Email)</label>
                    </div>
                    <div className={styles.group}>
                        <input
                            type="password"
                            placeholder=" "
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={styles.input}
                            required
                        />
                        <label className={styles.label}>Secret Key (Password)</label>
                    </div>
                    <button type="submit" className={styles.button}>Register Sequence</button>

                    <div className={styles.separator}>OR INITIALIZE WITH</div>

                    <button type="button" onClick={handleGoogleSignup} className={styles.googleButton}>
                        <svg width="20" height="20" viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27c3.09 0 4.9 1.97 4.9 1.97L19 4.72C19 4.72 16.64 2 12.2 2C6.7 2 2 6.5 2 12c0 5.5 4.7 10 10.2 10c5.31 0 9.14-3.47 9.14-9.01c0-.48-.08-1.01-.15-1.5z"
                            />
                        </svg>
                        Google Protocol
                    </button>
                </form>
                <p className={styles.footer}>
                    Already Registered? <Link href="/login" className={styles.link}>Access System</Link>
                </p>
            </div>
        </div>
    );
}
