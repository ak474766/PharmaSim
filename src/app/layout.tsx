import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import { UltraContextProvider } from '@/context/UltraContextProvider';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
    title: 'PharmaSim - Deep Tech Education',
    description: 'Advanced pharmaceutical education platform.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={inter.variable}>
            <body>
                <AuthProvider>
                    <UltraContextProvider>
                        {children}
                    </UltraContextProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
