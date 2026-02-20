'use client';

import { useEffect, useState } from 'react';
import TopHeader from '@/components/layout/TopHeader';
import styles from './Archive.module.css';
import { useAuth } from '@/context/AuthContext';
import { TrialService, TrialSubmission } from '@/lib/trialService';
import { useRouter } from 'next/navigation';

export default function ArchivePage() {
    const { user } = useAuth();
    const router = useRouter();
    const [items, setItems] = useState<TrialSubmission[]>([]);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        if (!user) return;
        setLoading(true);
        const data = await TrialService.getSubmissions(user.uid);
        setItems(data);
        setLoading(false);
    };

    useEffect(() => {
        load();
    }, [user]);

    const openInTrials = (trialId: string) => {
        localStorage.setItem('active_trial_id', trialId);
        router.push('/dashboard/clinical-trials');
    };

    const deleteTrial = async (trialId: string) => {
        const ok = window.confirm('Delete this archived trial? This cannot be undone.');
        if (!ok) return;
        await TrialService.deleteSubmission(trialId);
        await load();
    };

    return (
        <div className={styles.container}>
            <TopHeader title="Archive Lab" subtitle="Your saved molecule submissions and trials." />

            <div className={styles.scrollArea}>
                {loading ? (
                    <div className={styles.empty}>Loading archive...</div>
                ) : items.length === 0 ? (
                    <div className={styles.empty}>No submissions yet. Build a molecule to create your first entry.</div>
                ) : (
                    <div className={styles.grid}>
                        {items.map((t) => (
                            <div key={t.id} className={styles.card}>
                                <div className={styles.titleRow}>
                                    <div>
                                        <div className={styles.title}>{t.moleculeName}</div>
                                        <div className={styles.meta}>
                                            Mission: {t.missionTitle} (Lvl {t.missionId})
                                            <br />
                                            Atoms: {t.atomCount}
                                            <br />
                                            Saved: {new Date(t.submittedAt).toLocaleString()}
                                        </div>
                                    </div>
                                    <div className={styles.badges}>
                                        <div className={styles.badge}>Efficacy {Math.round(t.stats.efficacy)}%</div>
                                        <div className={styles.badge}>Safety {Math.round(t.stats.safety)}%</div>
                                    </div>
                                </div>

                                <div className={styles.actions}>
                                    <button type="button" className={styles.btnPrimary} onClick={() => openInTrials(t.id)}>
                                        Open
                                    </button>
                                    <button type="button" className={styles.btnSecondary} onClick={load}>
                                        Refresh
                                    </button>
                                    <button type="button" className={styles.btnDanger} onClick={() => deleteTrial(t.id)}>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
