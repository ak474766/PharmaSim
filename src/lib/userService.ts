
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

export interface CoinTransaction {
    id: string;
    amount: number;
    type: 'earned' | 'spent';
    reason: string;
    timestamp: number;
}

export interface Redemption {
    id: string;
    rewardId: string;
    rewardTitle: string;
    coinsCost: number;
    voucherCode: string;
    redeemedAt: number;
    status: 'active' | 'used' | 'expired';
}

export interface UserProfile {
    uid: string;
    displayName: string;
    email: string;
    xp: number;
    level: number;
    reputation: number;
    moleculesDiscovered: number;
    coins: number;
    dailyQuests?: Quest[];
    lastLogin?: number;
    achievements?: Achievement[];
    topicMastery?: Record<string, number>;
    coinTransactions?: CoinTransaction[];
    redemptions?: Redemption[];
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
                coins: 0,
                dailyQuests: newQuests,
                lastLogin: Date.now(),
                achievements: [],
                topicMastery: { kinetics: 1, regulatory: 1, pharmacology: 1, chemistry: 1 },
                coinTransactions: [],
                redemptions: []
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

    // Unlock Achievement (also awards coins!)
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

                // Award coins for achievement unlock
                await UserService.addCoins(uid, 100, `🏆 Achievement: ${achievement.title}`);

                return newAchievement;
            }
        }
        return null;
    },

    // Add XP, check for level up, and award coins
    async addXP(uid: string, amount: number) {
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            const oldLevel = data.level;
            const newXP = data.xp + amount;
            const newLevel = Math.floor(newXP / 1000) + 1;

            await updateDoc(docRef, {
                xp: newXP,
                level: newLevel,
                moleculesDiscovered: data.moleculesDiscovered + 1
            });

            // Award 30 coins for building a molecule
            await UserService.addCoins(uid, 30, '🧬 Molecule built');

            // Bonus coins on level up
            if (newLevel > oldLevel) {
                await UserService.addCoins(uid, 50, `⬆️ Level up! Now Lvl ${newLevel}`);
            }

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
    },

    // ===== COIN SYSTEM =====

    // Add coins to user balance
    async addCoins(uid: string, amount: number, reason: string): Promise<number> {
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            const newBalance = (data.coins || 0) + amount;
            const transaction: CoinTransaction = {
                id: `txn_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                amount,
                type: 'earned',
                reason,
                timestamp: Date.now()
            };

            const transactions = [...(data.coinTransactions || []), transaction].slice(-50); // Keep last 50

            await updateDoc(docRef, {
                coins: newBalance,
                coinTransactions: transactions
            });
            return newBalance;
        }
        return 0;
    },

    // Spend coins on a reward
    async spendCoins(uid: string, amount: number, reason: string): Promise<{ success: boolean; balance: number }> {
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            const currentBalance = data.coins || 0;

            if (currentBalance < amount) {
                return { success: false, balance: currentBalance };
            }

            const newBalance = currentBalance - amount;
            const transaction: CoinTransaction = {
                id: `txn_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                amount,
                type: 'spent',
                reason,
                timestamp: Date.now()
            };

            const transactions = [...(data.coinTransactions || []), transaction].slice(-50);

            await updateDoc(docRef, {
                coins: newBalance,
                coinTransactions: transactions
            });
            return { success: true, balance: newBalance };
        }
        return { success: false, balance: 0 };
    },

    // Redeem a reward
    async redeemReward(
        uid: string,
        rewardId: string,
        rewardTitle: string,
        coinsCost: number
    ): Promise<{ success: boolean; voucherCode?: string; balance?: number }> {
        // First spend the coins
        const spendResult = await UserService.spendCoins(uid, coinsCost, `Redeemed: ${rewardTitle}`);
        if (!spendResult.success) {
            return { success: false };
        }

        // Generate a voucher code
        const voucherCode = `PHARMA-${rewardId.toUpperCase().slice(0, 4)}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

        const redemption: Redemption = {
            id: `red_${Date.now()}`,
            rewardId,
            rewardTitle,
            coinsCost,
            voucherCode,
            redeemedAt: Date.now(),
            status: 'active'
        };

        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            await updateDoc(docRef, {
                redemptions: [...(data.redemptions || []), redemption]
            });
        }

        return { success: true, voucherCode, balance: spendResult.balance };
    }
};
