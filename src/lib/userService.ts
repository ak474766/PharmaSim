
import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

export interface Quest {
    id: string;
    title: string;
    description: string;
    progress: number;
    total: number;
    completed: boolean;
    type: 'build_molecule' | 'earn_xp';
}

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    unlockedAt: number; // Timestamp
}

export interface UserProfile {
    uid: string;
    displayName: string;
    email: string;
    xp: number;
    level: number;
    reputation: number;
    moleculesDiscovered: number;
    dailyQuests?: Quest[];
    lastLogin?: number;
    achievements?: Achievement[];
    topicMastery?: Record<string, number>;
}

const QUEST_TEMPLATES: Omit<Quest, 'progress' | 'completed'>[] = [
    { id: 'q1', title: 'Synthesis Master', description: 'Build 3 Molecules', total: 3, type: 'build_molecule' },
    { id: 'q2', title: 'Lab Rat', description: 'Earn 500 XP', total: 500, type: 'earn_xp' },
    { id: 'q3', title: 'Daily Discovery', description: 'Build 1 Complex Molecule', total: 1, type: 'build_molecule' }
];

export const UserService = {
    // Get user profile or create if not exists
    async getProfile(uid: string, email: string, displayName: string): Promise<UserProfile> {
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            // Check for daily quest reset
            const now = Date.now();
            const oneDay = 24 * 60 * 60 * 1000;
            if (!data.lastLogin || (now - data.lastLogin) > oneDay || !data.dailyQuests) {
                // Reset quests
                const newQuests = QUEST_TEMPLATES.slice(0, 2).map(q => ({ ...q, progress: 0, completed: false })); // Pick first 2 for now
                await updateDoc(docRef, { dailyQuests: newQuests, lastLogin: now });
                data.dailyQuests = newQuests;
            }
            return data;
        } else {
            // Create new profile
            const newQuests = QUEST_TEMPLATES.slice(0, 2).map(q => ({ ...q, progress: 0, completed: false }));
            const newProfile: UserProfile = {
                uid,
                email,
                displayName: displayName || 'Researcher ' + uid.slice(0, 4),
                xp: 0,
                level: 1,
                reputation: 100,
                moleculesDiscovered: 0,
                dailyQuests: newQuests,
                lastLogin: Date.now(),
                achievements: [],
                topicMastery: { kinetics: 1, regulatory: 1, pharmacology: 1, chemistry: 1 }
            };
            await setDoc(docRef, newProfile);
            return newProfile;
        }
    },

    async updateDisplayName(uid: string, displayName: string) {
        const name = displayName.trim();
        if (!name) throw new Error('Display name cannot be empty');
        const docRef = doc(db, 'users', uid);
        await updateDoc(docRef, { displayName: name });
        return name;
    },

    // Update Quest Progress
    async updateQuestProgress(uid: string, type: string, amount: number) {
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            let questsUpdated = false;

            const newQuests = (data.dailyQuests || []).map(q => {
                if (q.type === type && !q.completed) {
                    const newProgress = Math.min(q.progress + amount, q.total);
                    questsUpdated = true;
                    return {
                        ...q,
                        progress: newProgress,
                        completed: newProgress >= q.total
                    };
                }
                return q;
            });

            if (questsUpdated) {
                await updateDoc(docRef, { dailyQuests: newQuests });
            }
        }
    },

    // Unlock Achievement
    async unlockAchievement(uid: string, achievement: Omit<Achievement, 'unlockedAt'>) {
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            const existing = (data.achievements || []).find(a => a.id === achievement.id);
            if (!existing) {
                const newAchievement = { ...achievement, unlockedAt: Date.now() };
                await updateDoc(docRef, {
                    achievements: [...(data.achievements || []), newAchievement]
                });
                return newAchievement;
            }
        }
        return null;
    },

    // Add XP and check for level up
    async addXP(uid: string, amount: number) {
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            const newXP = data.xp + amount;
            const newLevel = Math.floor(newXP / 1000) + 1; // Simple level formula: 1000 XP per level

            await updateDoc(docRef, {
                xp: newXP,
                level: newLevel,
                moleculesDiscovered: data.moleculesDiscovered + 1 // Assuming 1 molecule per XP grant for now
            });
            return { newXP, newLevel };
        }
        return null;
    },

    // Get Leaderboard (Top 50 by XP)
    async getLeaderboard(): Promise<UserProfile[]> {
        const q = query(collection(db, 'users'), orderBy('xp', 'desc'), limit(50));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => doc.data() as UserProfile);
    },

    // Get User Rank (Client-side calculation for demo)
    async getUserRank(uid: string): Promise<number> {
        // Fetch specific number of top users to determine rank
        // Note: In production you'd use a cloud function or dedicated rank field
        const q = query(collection(db, 'users'), orderBy('xp', 'desc'), limit(100));
        const querySnapshot = await getDocs(q);
        const users = querySnapshot.docs.map(doc => doc.id);
        const rank = users.indexOf(uid);
        return rank !== -1 ? rank + 1 : 1000; // Return >100 if not in top 100
    },

    // Update Topic Mastery
    async updateTopicMastery(uid: string, topic: string, change: number) {
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            const currentMastery = data.topicMastery?.[topic] || 1;
            const newMastery = Math.max(1, Math.min(5, currentMastery + change)); // Clamp between 1 and 5

            await updateDoc(docRef, {
                [`topicMastery.${topic}`]: newMastery
            });
            return newMastery;
        }
        return 1;
    }
};
