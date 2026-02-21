
'use client';

import Sidebar from '@/components/layout/Sidebar';
import GameToast from '@/components/ui/GameToast';
import { GameEventProvider } from '@/context/GameEventContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) return (
        <div style={{
            background: '#050505',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            gap: '16px',
        }}>
            <div style={{ width: '200px', height: '200px' }}>
                <DotLottieReact
                    src="https://lottie.host/966ca14b-e2a3-4c3b-8d55-b55da2eba438/jfxcRF09z4.lottie"
                    loop
                    autoplay
                />
            </div>
            <p style={{
                fontSize: '0.9rem',
                color: '#6b7280',
                fontWeight: 500,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
            }}>
                Loading Lab Environment...
            </p>
        </div>
    );

    if (!user) return null;

    return (
        <GameEventProvider>
            <div style={{ display: 'flex', minHeight: '100vh', background: '#050505', color: '#fff' }}>
                <Sidebar />
                <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
                    {children}
                </main>
            </div>
            <GameToast />
        </GameEventProvider>
    );
}
