'use client';

import { useState } from 'react';
import Link from 'next/link';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import MolecularBackground from '@/components/ui/MolecularBackground';
import styles from '../login/Login.module.css';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSent(false);
        setLoading(true);

        try {
            await sendPasswordResetEmail(auth, email);
            setSent(true);
        } catch (err: any) {
            setError(err?.message || 'Failed to send reset email');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <MolecularBackground />
            <div className={styles.formCard}>
                <h1 className={styles.title}>Recovery Protocol</h1>
                {error && <p className={styles.error}>{error}</p>}
                {sent && (
                    <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.85rem', textAlign: 'center', marginBottom: 18 }}>
                        Reset link sent. Check your inbox.
                    </p>
                )}

                <form onSubmit={handleSend} className={styles.form}>
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

                    <button type="submit" className={styles.button} disabled={loading} style={loading ? { opacity: 0.7, cursor: 'not-allowed' } : undefined}>
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                <p className={styles.footer}>
                    Return to <Link href="/login" className={styles.link}>System Access</Link>
                </p>
            </div>
        </div>
    );
}
