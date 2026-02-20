import Link from 'next/link';

export default function NotFound() {
    return (
        <div style={{ minHeight: '100vh', background: '#050505', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <div style={{ width: '100%', maxWidth: 560, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, background: 'rgba(255,255,255,0.03)', padding: 24 }}>
                <div style={{ fontSize: '0.8rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)' }}>404</div>
                <h1 style={{ marginTop: 10, fontSize: '1.6rem', fontWeight: 600 }}>Page not found</h1>
                <p style={{ marginTop: 10, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
                    This route doesn’t exist. Return to a known module.
                </p>

                <div style={{ display: 'flex', gap: 12, marginTop: 18, flexWrap: 'wrap' }}>
                    <Link
                        href="/dashboard"
                        style={{ background: '#fff', color: '#000', border: 0, padding: '12px 16px', borderRadius: 10, textDecoration: 'none', fontWeight: 600 }}
                    >
                        Dashboard
                    </Link>
                    <Link
                        href="/login"
                        style={{ border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '12px 16px', borderRadius: 10, textDecoration: 'none' }}
                    >
                        Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
