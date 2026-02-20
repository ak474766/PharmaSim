'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MolecularBackground from '@/components/ui/MolecularBackground';
import styles from './Login.module.css';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleGoogleLogin = async () => {
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
                <h1 className={styles.title}>System Access</h1>
                {error && <p className={styles.error}>{error}</p>}
                <form onSubmit={handleLogin} className={styles.form}>
                    <div className={styles.group}>
                        <input
                            type="email"
                            placeholder=" "
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.input}
                            required
                        />
                        <label className={styles.label}>Identity Hash (Email)</label>
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
                        <label className={styles.label}>Access Key (Password)</label>
                    </div>
                    <div style={{ textAlign: 'right', marginTop: '-12px' }}>
                        <Link href="/forgot-password" className={styles.link} style={{ marginLeft: 0 }}>
                            Forgot Access Key?
                        </Link>
                    </div>
                    <button type="submit" className={styles.button}>Authenticate</button>

                    <div className={styles.separator}>OR ACCESS WITH</div>

                    <button type="button" onClick={handleGoogleLogin} className={styles.googleButton}>
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
                    New Entity? <Link href="/signup" className={styles.link}>Initialize Sequence</Link>
                </p>
            </div>
        </div>
    );
}
