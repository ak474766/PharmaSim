'use client';

/**
 * UltraContext Provider
 * 
 * React context provider for app-wide UltraContext access.
 * Manages session-based context creation and provides hooks for components.
 */

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import {
    UltraContextService,
    UCContext,
    UCMessage,
    UCGetResponse
} from '@/lib/ultraContextService';

// =============================================================================
// Types
// =============================================================================

interface UltraContextState {
    /** Current active context ID */
    activeContextId: string | null;
    /** Loading state */
    isLoading: boolean;
    /** Error state */
    error: string | null;
}

interface UltraContextValue extends UltraContextState {
    /** Create a new general context */
    createContext: (metadata?: Record<string, unknown>) => Promise<UCContext | null>;
    /** Create a molecule analysis context */
    createMoleculeContext: (moleculeName: string) => Promise<UCContext | null>;
    /** Create a quiz context */
    createQuizContext: (topic: string) => Promise<UCContext | null>;
    /** Create a clinical trial context */
    createTrialContext: (trialId: string) => Promise<UCContext | null>;
    /** Set the active context by ID */
    setActiveContext: (contextId: string) => void;
    /** Get messages from the active context */
    getMessages: () => Promise<UCMessage[]>;
    /** Append a message to the active context */
    appendMessage: (message: UCMessage) => Promise<void>;
    /** Save a conversation exchange (user + assistant) */
    saveExchange: (userMessage: string, assistantMessage: string) => Promise<void>;
    /** Get context with history (for time-travel) */
    getHistory: () => Promise<UCGetResponse | null>;
    /** Clear error state */
    clearError: () => void;
}

// =============================================================================
// Context
// =============================================================================

const UltraContextContext = createContext<UltraContextValue | null>(null);

// =============================================================================
// Provider Component
// =============================================================================

export function UltraContextProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();

    const [state, setState] = useState<UltraContextState>({
        activeContextId: null,
        isLoading: false,
        error: null,
    });

    // Helper to set loading state
    const setLoading = (isLoading: boolean) => {
        setState(prev => ({ ...prev, isLoading }));
    };

    // Helper to set error state
    const setError = (error: string | null) => {
        setState(prev => ({ ...prev, error, isLoading: false }));
    };

    // Clear error
    const clearError = useCallback(() => {
        setState(prev => ({ ...prev, error: null }));
    }, []);

    // Set active context
    const setActiveContext = useCallback((contextId: string) => {
        setState(prev => ({ ...prev, activeContextId: contextId }));
    }, []);

    // Create a new general context
    const createContext = useCallback(async (metadata?: Record<string, unknown>) => {
        setLoading(true);
        try {
            const ctx = await UltraContextService.createContext({
                userId: user?.uid,
                ...metadata
            });
            setState(prev => ({
                ...prev,
                activeContextId: ctx.id,
                isLoading: false,
                error: null
            }));
            return ctx;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create context');
            return null;
        }
    }, [user?.uid]);

    // Create molecule analysis context
    const createMoleculeContext = useCallback(async (moleculeName: string) => {
        if (!user?.uid) {
            setError('User not authenticated');
            return null;
        }
        setLoading(true);
        try {
            const ctx = await UltraContextService.createMoleculeAnalysisContext(
                user.uid,
                moleculeName
            );
            setState(prev => ({
                ...prev,
                activeContextId: ctx.id,
                isLoading: false,
                error: null
            }));
            return ctx;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create molecule context');
            return null;
        }
    }, [user?.uid]);

    // Create quiz context
    const createQuizContext = useCallback(async (topic: string) => {
        if (!user?.uid) {
            setError('User not authenticated');
            return null;
        }
        setLoading(true);
        try {
            const ctx = await UltraContextService.createQuizContext(user.uid, topic);
            setState(prev => ({
                ...prev,
                activeContextId: ctx.id,
                isLoading: false,
                error: null
            }));
            return ctx;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create quiz context');
            return null;
        }
    }, [user?.uid]);

    // Create clinical trial context
    const createTrialContext = useCallback(async (trialId: string) => {
        if (!user?.uid) {
            setError('User not authenticated');
            return null;
        }
        setLoading(true);
        try {
            const ctx = await UltraContextService.createTrialContext(user.uid, trialId);
            setState(prev => ({
                ...prev,
                activeContextId: ctx.id,
                isLoading: false,
                error: null
            }));
            return ctx;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create trial context');
            return null;
        }
    }, [user?.uid]);

    // Get messages from active context
    const getMessages = useCallback(async (): Promise<UCMessage[]> => {
        if (!state.activeContextId) {
            console.warn('[UltraContext] No active context');
            return [];
        }
        try {
            const result = await UltraContextService.getContext(state.activeContextId);
            return result.data || [];
        } catch (err) {
            console.error('[UltraContext] Failed to get messages:', err);
            return [];
        }
    }, [state.activeContextId]);

    // Append message to active context
    const appendMessage = useCallback(async (message: UCMessage) => {
        if (!state.activeContextId) {
            setError('No active context');
            return;
        }
        try {
            await UltraContextService.appendMessage(state.activeContextId, message);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to append message');
        }
    }, [state.activeContextId]);

    // Save a conversation exchange
    const saveExchange = useCallback(async (userMessage: string, assistantMessage: string) => {
        if (!state.activeContextId) {
            setError('No active context');
            return;
        }
        try {
            await UltraContextService.saveConversationExchange(
                state.activeContextId,
                userMessage,
                assistantMessage
            );
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save exchange');
        }
    }, [state.activeContextId]);

    // Get context with history
    const getHistory = useCallback(async (): Promise<UCGetResponse | null> => {
        if (!state.activeContextId) {
            console.warn('[UltraContext] No active context');
            return null;
        }
        try {
            return await UltraContextService.getContextWithHistory(state.activeContextId);
        } catch (err) {
            console.error('[UltraContext] Failed to get history:', err);
            return null;
        }
    }, [state.activeContextId]);

    const value: UltraContextValue = {
        ...state,
        createContext,
        createMoleculeContext,
        createQuizContext,
        createTrialContext,
        setActiveContext,
        getMessages,
        appendMessage,
        saveExchange,
        getHistory,
        clearError,
    };

    return (
        <UltraContextContext.Provider value={value}>
            {children}
        </UltraContextContext.Provider>
    );
}

// =============================================================================
// Hook
// =============================================================================

/**
 * Hook to access UltraContext functionality
 * Must be used within an UltraContextProvider
 */
export function useUltraContext(): UltraContextValue {
    const context = useContext(UltraContextContext);
    if (!context) {
        throw new Error('useUltraContext must be used within an UltraContextProvider');
    }
    return context;
}

export default UltraContextProvider;
