'use client';

import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { UserProfile } from '@/lib/userService';

/* ===== Event Types ===== */
export type GameEventType = 'coins' | 'levelUp' | 'achievement' | 'xp' | 'questComplete';

export interface GameEvent {
    id: string;
    type: GameEventType;
    amount?: number;
    title?: string;
    subtitle?: string;
    icon?: string;
    timestamp: number;
}

interface GameEventContextType {
    events: GameEvent[];
    triggerEvent: (event: Omit<GameEvent, 'id' | 'timestamp'>) => void;
    dismissEvent: (id: string) => void;
}

const GameEventContext = createContext<GameEventContextType>({
    events: [],
    triggerEvent: () => { },
    dismissEvent: () => { },
});

export function GameEventProvider({ children }: { children: React.ReactNode }) {
    const { profile } = useAuth();
    const [events, setEvents] = useState<GameEvent[]>([]);
    const prevProfile = useRef<UserProfile | null>(null);
    const isInitialized = useRef(false);

    /* ===== Trigger helper ===== */
    const triggerEvent = useCallback((event: Omit<GameEvent, 'id' | 'timestamp'>) => {
        const newEvent: GameEvent = {
            ...event,
            id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            timestamp: Date.now(),
        };
        setEvents(prev => [...prev, newEvent]);

        // Auto-dismiss after animation duration
        const duration = event.type === 'levelUp' ? 5000 : event.type === 'achievement' ? 4500 : 3500;
        setTimeout(() => {
            setEvents(prev => prev.filter(e => e.id !== newEvent.id));
        }, duration);
    }, []);

    const dismissEvent = useCallback((id: string) => {
        setEvents(prev => prev.filter(e => e.id !== id));
    }, []);

    /* ===== Profile diff detection ===== */
    useEffect(() => {
        if (!profile) return;

        // Skip first load — don't animate initial state
        if (!isInitialized.current) {
            prevProfile.current = { ...profile };
            isInitialized.current = true;
            return;
        }

        const prev = prevProfile.current;
        if (!prev) {
            prevProfile.current = { ...profile };
            return;
        }

        // Detect coin gain
        const coinDiff = (profile.coins || 0) - (prev.coins || 0);
        if (coinDiff > 0) {
            triggerEvent({
                type: 'coins',
                amount: coinDiff,
                title: `+${coinDiff} Coins`,
                subtitle: 'Added to your wallet',
                icon: '🪙',
            });
        }

        // Detect level up
        if ((profile.level || 1) > (prev.level || 1)) {
            triggerEvent({
                type: 'levelUp',
                amount: profile.level,
                title: `Level ${profile.level}!`,
                subtitle: 'You leveled up! Keep going!',
                icon: '⬆️',
            });
        }

        // Detect XP gain (only if no level up, to avoid double toast)
        const xpDiff = (profile.xp || 0) - (prev.xp || 0);
        if (xpDiff > 0 && (profile.level || 1) === (prev.level || 1)) {
            triggerEvent({
                type: 'xp',
                amount: xpDiff,
                title: `+${xpDiff} XP`,
                subtitle: `Total: ${profile.xp?.toLocaleString()} XP`,
                icon: '⚡',
            });
        }

        // Detect new achievements
        const prevAchs = prev.achievements || [];
        const newAchs = profile.achievements || [];
        if (newAchs.length > prevAchs.length) {
            const latest = newAchs[newAchs.length - 1];
            triggerEvent({
                type: 'achievement',
                title: latest.title,
                subtitle: latest.description,
                icon: latest.icon || '🏆',
            });
        }

        // Store snapshot
        prevProfile.current = { ...profile };
    }, [profile, triggerEvent]);

    return (
        <GameEventContext.Provider value={{ events, triggerEvent, dismissEvent }}>
            {children}
        </GameEventContext.Provider>
    );
}

export const useGameEvent = () => useContext(GameEventContext);
