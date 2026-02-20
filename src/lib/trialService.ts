/**
 * Trial Service - Manages clinical trial submissions in Firebase
 * Stores trial data including AI-generated roadmaps persistently
 */

import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';

export interface TrialPhaseData {
    name: string;
    duration: string;
    description: string;
    keyActivities: string[];
    risks: string;
}

export interface RoadmapData {
    summary: string;
    phases: TrialPhaseData[];
    successProbability: number;
    generatedAt: number;
}

// Exported types for shared usage across components
export interface CachedTrialEvent {
    phaseIndex?: number;
    title: string;
    description: string;
    choices: Array<{
        text: string;
        budgetEffect: number;
        efficacyEffect: number;
        safetyEffect: number;
        outcomeText: string;
    }>;
    isPhaseComplete?: boolean;
}

export interface SimulationState {
    currentPhaseIndex: number;
    eventIndex: number;
    budget: number;
    efficacy: number;
    safety: number;
    logs: string[];
    previousEvents: string[];
    cachedEvents?: CachedTrialEvent[];
}

export interface TrialSubmission {
    id: string;
    userId: string;
    moleculeName: string;
    missionId: number;
    missionTitle: string;
    atomCount: number;
    stats: {
        efficacy: number;
        safety: number;
        stability: number;
    };
    chemicalStats?: {
        formula: string;
        molecularWeight: number;
        functionalGroups: string[];
        bonds?: { single: number; double: number; triple: number; aromatic: number };
        warnings: string[];
    };
    aiAnalysis?: string;
    imageUrl?: string;
    generatedImageUrl?: string;
    roadmap?: RoadmapData;
    submittedAt: number;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    simulationState?: SimulationState;
}

export const TrialService = {
    /**
     * Get all trial submissions for a user from Firebase
     */
    async getSubmissions(userId: string): Promise<TrialSubmission[]> {
        try {
            const q = query(
                collection(db, 'trials'),
                where('userId', '==', userId)
            );
            const querySnapshot = await getDocs(q);
            const submissions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TrialSubmission));
            return submissions.sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0));
        } catch (e) {
            console.error('Failed to load trial submissions:', e);
            return [];
        }
    },

    /**
     * Save a new trial submission to Firebase
     */
    async saveSubmission(
        userId: string,
        submission: Omit<TrialSubmission, 'id' | 'userId' | 'submittedAt' | 'status'>
    ): Promise<TrialSubmission> {
        const id = `trial_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

        const newSubmission: TrialSubmission = {
            ...submission,
            id,
            userId: userId,
            submittedAt: Date.now(),
            status: 'pending'
        };

        await setDoc(doc(db, 'trials', id), newSubmission);
        return newSubmission;
    },

    /**
     * Update an existing submission (including roadmap)
     */
    async updateSubmission(id: string, updates: Partial<TrialSubmission>): Promise<TrialSubmission | null> {
        try {
            const docRef = doc(db, 'trials', id);
            await updateDoc(docRef, updates);

            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() } as TrialSubmission;
            }
            return null;
        } catch (e) {
            console.error('Failed to update trial:', e);
            return null;
        }
    },

    /**
     * Get a single submission by ID
     */
    async getSubmission(id: string): Promise<TrialSubmission | null> {
        try {
            const docRef = doc(db, 'trials', id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() } as TrialSubmission;
            }
            return null;
        } catch (e) {
            console.error('Failed to get trial:', e);
            return null;
        }
    },

    /**
     * Delete a submission
     */
    async deleteSubmission(id: string): Promise<boolean> {
        try {
            await deleteDoc(doc(db, 'trials', id));
            return true;
        } catch (e) {
            console.error('Failed to delete trial:', e);
            return false;
        }
    },

    /**
     * Save roadmap to a trial
     */
    async saveRoadmap(trialId: string, roadmap: Omit<RoadmapData, 'generatedAt'>): Promise<boolean> {
        try {
            await updateDoc(doc(db, 'trials', trialId), {
                roadmap: {
                    ...roadmap,
                    generatedAt: Date.now()
                }
            });
            return true;
        } catch (e) {
            console.error('Failed to save roadmap:', e);
            return false;
        }
    },

    /**
     * Update simulation state
     */
    async updateSimulationState(
        trialId: string,
        state: SimulationState
    ): Promise<boolean> {
        try {
            await updateDoc(doc(db, 'trials', trialId), {
                simulationState: state,
                status: 'in_progress'
            });
            return true;
        } catch (e) {
            console.error('Failed to update simulation state:', e);
            return false;
        }
    }
};
