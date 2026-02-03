
'use client';

import TopHeader from '@/components/layout/TopHeader';
import Builder from '@/components/builder/Builder';

export default function BuilderPage() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <TopHeader title="Molecular Builder" subtitle="Design complex molecular chains with real-time stability simulation." />
            <div style={{ flex: 1, padding: '0 40px 40px' }}>
                <Builder />
            </div>
        </div>
    );
}
