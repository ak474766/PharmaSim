'use client';

import { useEffect, useMemo, useState } from 'react';
import TopHeader from '@/components/layout/TopHeader';
import styles from './Settings.module.css';
import { useAuth } from '@/context/AuthContext';
import { UserService } from '@/lib/userService';
import { auth } from '@/lib/firebase';
import { sendEmailVerification, sendPasswordResetEmail } from 'firebase/auth';

export default function SettingsPage() {
    const { user, profile, refreshProfile } = useAuth();
    const [displayName, setDisplayName] = useState('');
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const emailVerified = useMemo(() => {
        return !!auth.currentUser?.emailVerified;
    }, [user]);

    useEffect(() => {
        setDisplayName(profile?.displayName || '');
    }, [profile?.displayName]);

    const handleSaveDisplayName = async () => {
        if (!user) return;
        setSaving(true);
        setMessage('');
        setError('');

        try {
            await UserService.updateDisplayName(user.uid, displayName.trim());
            await refreshProfile();
            setMessage('Profile updated.');
        } catch (err: any) {
            setError(err?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleSendVerification = async () => {
        setMessage('');
        setError('');
        try {
            const current = auth.currentUser;
            if (!current) return;
            await sendEmailVerification(current);
            setMessage('Verification email sent.');
        } catch (err: any) {
            setError(err?.message || 'Failed to send verification email');
        }
    };

    const handlePasswordReset = async () => {
        setMessage('');
        setError('');
        try {
            const email = auth.currentUser?.email;
            if (!email) {
                setError('No email found on this account.');
                return;
            }
            await sendPasswordResetEmail(auth, email);
            setMessage('Password reset email sent.');
        } catch (err: any) {
            setError(err?.message || 'Failed to send password reset email');
        }
    };

    return (
        <div className={styles.container}>
            <TopHeader title="Settings" subtitle="Manage your account and lab preferences." />

            <div className={styles.scrollArea}>
                <div className={styles.card}>
                    <div className={styles.sectionTitle}>Account</div>

                    <div className={styles.row}>
                        <div>
                            <div className={styles.label}>Email</div>
                            <div className={styles.value}>{profile?.email || auth.currentUser?.email || '--'}</div>
                        </div>
                        <div className={styles.actions}>
                            {!emailVerified ? (
                                <button type="button" className={styles.btnSecondary} onClick={handleSendVerification}>
                                    Send verification
                                </button>
                            ) : (
                                <button type="button" className={styles.btnSecondary} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }}>
                                    Verified
                                </button>
                            )}
                        </div>
                    </div>

                    <div className={styles.row}>
                        <div style={{ flex: 1 }}>
                            <div className={styles.label}>Display name</div>
                            <input
                                className={styles.input}
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="Your name"
                            />
                        </div>
                        <div className={styles.actions}>
                            <button
                                type="button"
                                className={styles.btnPrimary}
                                onClick={handleSaveDisplayName}
                                disabled={saving || !displayName.trim()}
                                style={saving || !displayName.trim() ? { opacity: 0.7, cursor: 'not-allowed' } : undefined}
                            >
                                {saving ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>

                    <div className={styles.row}>
                        <div>
                            <div className={styles.label}>Password</div>
                            <div className={styles.value}>••••••••</div>
                        </div>
                        <div className={styles.actions}>
                            <button type="button" className={styles.btnSecondary} onClick={handlePasswordReset}>
                                Send reset email
                            </button>
                        </div>
                    </div>

                    <div className={styles.row}>
                        <div>
                            <div className={styles.label}>Session</div>
                            <div className={styles.value}>Sign out from this device</div>
                        </div>
                        <div className={styles.actions}>
                            <button type="button" className={styles.btnDanger} onClick={() => auth.signOut()}>
                                Logout
                            </button>
                        </div>
                    </div>

                    {message && <div className={styles.message}>{message}</div>}
                    {error && <div className={styles.error}>{error}</div>}
                </div>
            </div>
        </div>
    );
}
