/**
 * UltraContext Service
 * 
 * This service provides a wrapper around the UltraContext API for managing
 * AI agent conversation contexts with automatic versioning, time-travel,
 * and persistent storage.
 * 
 * @see https://ultracontext.ai/docs
 */

import { UltraContext } from 'ultracontext';

// =============================================================================
// Types & Interfaces
// =============================================================================

/** Standard message format for LLM conversations */
export interface UCMessage {
    role: 'system' | 'user' | 'assistant' | 'tool';
    content: string;
    [key: string]: unknown; // Schema-free: allows any additional fields
}

/** Context metadata for tracking */
export interface UCContextMetadata {
    userId?: string;
    sessionId?: string;
    feature?: 'molecule-analysis' | 'quiz' | 'clinical-trial' | 'general';
    createdAt?: string;
    [key: string]: unknown;
}

/** Context object returned from UltraContext */
export interface UCContext {
    id: string;
    metadata?: UCContextMetadata;
}

/** Version history entry */
export interface UCVersion {
    version: number;
    operation: 'create' | 'append' | 'update' | 'delete';
    affected: string[] | null;
    timestamp?: string;
}

/** Get context response */
export interface UCGetResponse {
    data: UCMessage[];
    version?: number;
    versions?: UCVersion[];
}

// =============================================================================
// UltraContext Client Initialization
// =============================================================================

const API_KEY = process.env.NEXT_PUBLIC_ULTRACONTEXT_API_KEY || '';

// Initialize UltraContext client
let ucClient: UltraContext | null = null;

/**
 * Get or create the UltraContext client instance
 */
function getClient(): UltraContext {
    if (!ucClient) {
        if (!API_KEY) {
            console.warn('[UltraContext] API key not found. Set NEXT_PUBLIC_ULTRACONTEXT_API_KEY in .env.local');
        }
        ucClient = new UltraContext({ apiKey: API_KEY });
    }
    return ucClient;
}

// =============================================================================
// UltraContext Service
// =============================================================================

export const UltraContextService = {
    /**
     * Create a new context
     * @param metadata - Optional metadata to attach to the context
     * @returns The created context object with ID
     */
    async createContext(metadata?: UCContextMetadata): Promise<UCContext> {
        try {
            const uc = getClient();
            const ctx = await uc.create({ metadata });
            console.log('[UltraContext] Created context:', ctx.id);
            return ctx as UCContext;
        } catch (error) {
            console.error('[UltraContext] Failed to create context:', error);
            throw error;
        }
    },

    /**
     * Fork a context from an existing one
     * @param fromContextId - The context ID to fork from
     * @param version - Optional version to fork from (defaults to latest)
     * @returns The new forked context
     */
    async forkContext(fromContextId: string, version?: number): Promise<UCContext> {
        try {
            const uc = getClient();
            const ctx = await uc.create({
                from: fromContextId,
                ...(version !== undefined && { version })
            });
            console.log('[UltraContext] Forked context:', ctx.id, 'from:', fromContextId);
            return ctx as UCContext;
        } catch (error) {
            console.error('[UltraContext] Failed to fork context:', error);
            throw error;
        }
    },

    /**
     * Get a context with its messages
     * @param contextId - The context ID to retrieve
     * @param options - Optional parameters for retrieval
     * @returns The context data with messages
     */
    async getContext(
        contextId: string,
        options?: {
            version?: number;
            at?: number;
            before?: string;
            history?: boolean;
        }
    ): Promise<UCGetResponse> {
        try {
            const uc = getClient();
            const result = await uc.get(contextId, options);
            return result as unknown as UCGetResponse;
        } catch (error) {
            console.error('[UltraContext] Failed to get context:', error);
            throw error;
        }
    },

    /**
     * List all contexts
     * @returns Array of all contexts
     */
    async listContexts(): Promise<UCContext[]> {
        try {
            const uc = getClient();
            const result = await uc.get();
            return (result.data || []) as UCContext[];
        } catch (error) {
            console.error('[UltraContext] Failed to list contexts:', error);
            throw error;
        }
    },

    /**
     * Append one or more messages to a context
     * @param contextId - The context ID to append to
     * @param messages - Single message or array of messages
     */
    async appendMessage(
        contextId: string,
        messages: UCMessage | UCMessage[]
    ): Promise<void> {
        try {
            const uc = getClient();
            await uc.append(contextId, messages);
            console.log('[UltraContext] Appended message(s) to:', contextId);
        } catch (error) {
            console.error('[UltraContext] Failed to append message:', error);
            throw error;
        }
    },

    /**
     * Update a message by index or ID
     * Creates a new version automatically
     * @param contextId - The context ID
     * @param update - The update object with index/id and new content
     */
    async updateMessage(
        contextId: string,
        update: { index: number; content: string } | { id: string; content: string } | Array<{ index: number; content: string } | { id: string; content: string }>
    ): Promise<void> {
        try {
            const uc = getClient();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await uc.update(contextId, update as any);
            console.log('[UltraContext] Updated message in:', contextId);
        } catch (error) {
            console.error('[UltraContext] Failed to update message:', error);
            throw error;
        }
    },

    /**
     * Delete a message by index or ID
     * Creates a new version automatically
     * @param contextId - The context ID
     * @param target - Message index (number) or ID (string), use -1 for last message
     */
    async deleteMessage(
        contextId: string,
        target: number | string
    ): Promise<void> {
        try {
            const uc = getClient();
            await uc.delete(contextId, target);
            console.log('[UltraContext] Deleted message from:', contextId);
        } catch (error) {
            console.error('[UltraContext] Failed to delete message:', error);
            throw error;
        }
    },

    /**
     * Get context at a specific version (time-travel)
     * @param contextId - The context ID
     * @param version - The version number to retrieve
     * @returns The context data at that version
     */
    async getContextAtVersion(contextId: string, version: number): Promise<UCGetResponse> {
        return this.getContext(contextId, { version });
    },

    /**
     * Get context with full version history
     * @param contextId - The context ID
     * @returns The context data with version history
     */
    async getContextWithHistory(contextId: string): Promise<UCGetResponse> {
        return this.getContext(contextId, { history: true });
    },

    // =========================================================================
    // Convenience Methods for PharmaSim Features
    // =========================================================================

    /**
     * Create a context for molecule analysis conversations
     * @param userId - The user's ID
     * @param moleculeName - Name of the molecule being analyzed
     */
    async createMoleculeAnalysisContext(userId: string, moleculeName: string): Promise<UCContext> {
        return this.createContext({
            userId,
            feature: 'molecule-analysis',
            createdAt: new Date().toISOString(),
            moleculeName
        });
    },

    /**
     * Create a context for quiz sessions
     * @param userId - The user's ID
     * @param topic - The quiz topic
     */
    async createQuizContext(userId: string, topic: string): Promise<UCContext> {
        return this.createContext({
            userId,
            feature: 'quiz',
            createdAt: new Date().toISOString(),
            topic
        });
    },

    /**
     * Create a context for clinical trial simulations
     * @param userId - The user's ID
     * @param trialId - The trial ID
     */
    async createTrialContext(userId: string, trialId: string): Promise<UCContext> {
        return this.createContext({
            userId,
            feature: 'clinical-trial',
            createdAt: new Date().toISOString(),
            trialId
        });
    },

    /**
     * Save a conversation exchange (user prompt + AI response)
     * @param contextId - The context ID
     * @param userMessage - The user's message
     * @param assistantMessage - The AI's response
     */
    async saveConversationExchange(
        contextId: string,
        userMessage: string,
        assistantMessage: string
    ): Promise<void> {
        await this.appendMessage(contextId, [
            { role: 'user', content: userMessage },
            { role: 'assistant', content: assistantMessage }
        ]);
    }
};

export default UltraContextService;
