'use client';

interface PharmaLogoProps {
    size?: number;
    showText?: boolean;
}

export default function PharmaLogo({ size = 40, showText = true }: PharmaLogoProps) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Abstract Molecular Icon */}
            <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="18" stroke="url(#paint0_linear)" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.5">
                    <animateTransform attributeName="transform" type="rotate" from="0 20 20" to="360 20 20" dur="20s" repeatCount="indefinite" />
                </circle>
                <circle cx="20" cy="20" r="8" fill="url(#paint1_radial)" />
                <path d="M20 12V28M12 20H28" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
                <circle cx="20" cy="12" r="2" fill="#00ACC1" />
                <circle cx="28" cy="20" r="2" fill="#4DD0E1" />
                <circle cx="20" cy="28" r="2" fill="#80DEEA" />
                <circle cx="12" cy="20" r="2" fill="#00ACC1" />
                <defs>
                    <linearGradient id="paint0_linear" x1="20" y1="0" x2="20" y2="40" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#80DEEA" stopOpacity="0" />
                        <stop offset="0.5" stopColor="#4DD0E1" />
                        <stop offset="1" stopColor="#80DEEA" stopOpacity="0" />
                    </linearGradient>
                    <radialGradient id="paint1_radial" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(20 20) rotate(90) scale(8)">
                        <stop stopColor="#00ACC1" stopOpacity="0.8" />
                        <stop offset="1" stopColor="#00ACC1" stopOpacity="0" />
                    </radialGradient>
                </defs>
            </svg>

            {/* Text Logo */}
            {showText && (
                <span style={{
                    fontFamily: 'var(--font-inter)',
                    fontWeight: 700,
                    fontSize: '1.2rem',
                    letterSpacing: '0.05em',
                    background: 'linear-gradient(90deg, #fff, #888)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    PharmaSim
                </span>
            )}
        </div>
    );
}
