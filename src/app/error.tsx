'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div style={{ minHeight: '100vh', background: '#050505', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <div style={{ width: '100%', maxWidth: 560, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, background: 'rgba(255,255,255,0.03)', padding: 24 }}>
                <div style={{ fontSize: '0.8rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)' }}>System Error</div>
                <h1 style={{ marginTop: 10, fontSize: '1.6rem', fontWeight: 600 }}>Something broke in the lab</h1>
                <p style={{ marginTop: 10, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
                    Try again. If the problem persists, return to the dashboard.
                </p>

                <div style={{ display: 'flex', gap: 12, marginTop: 18, flexWrap: 'wrap' }}>
                    <button
                        type="button"
                        onClick={() => reset()}
                        style={{ background: '#fff', color: '#000', border: 0, padding: '12px 16px', borderRadius: 10, cursor: 'pointer', fontWeight: 600 }}
                    >
                        Retry
                    </button>
                    <Link
                        href="/dashboard"
                        style={{ border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '12px 16px', borderRadius: 10, textDecoration: 'none' }}
                    >
                        Go to Dashboard
                    </Link>
                    <Link
                        href="/"
                        style={{ color: 'rgba(255,255,255,0.8)', padding: '12px 8px', textDecoration: 'underline' }}
                    >
                        Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
