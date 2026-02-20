module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/process [external] (process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("process", () => require("process"));

module.exports = mod;
}),
"[externals]/tls [external] (tls, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("tls", () => require("tls"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[externals]/net [external] (net, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("net", () => require("net"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/http2 [external] (http2, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http2", () => require("http2"));

module.exports = mod;
}),
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/dns [external] (dns, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("dns", () => require("dns"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[project]/src/lib/firebase.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "auth",
    ()=>auth,
    "db",
    ()=>db,
    "default",
    ()=>__TURBOPACK__default__export__,
    "googleProvider",
    ()=>googleProvider,
    "storage",
    ()=>storage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$app$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/app/dist/index.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/app/dist/esm/index.esm.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$auth$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/auth/dist/index.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$node$2d$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/firebase/node_modules/@firebase/auth/dist/node-esm/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$firestore$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/firestore/dist/index.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/firestore/dist/index.node.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$storage$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/storage/dist/index.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$storage$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/storage/dist/node-esm/index.node.esm.js [app-ssr] (ecmascript)");
;
;
;
;
const firebaseConfig = {
    apiKey: ("TURBOPACK compile-time value", "AIzaSyBvPGH3ud7o9jH-SjAHMcxex5EO0XdADN0"),
    authDomain: ("TURBOPACK compile-time value", "pharmasim-db8ea.firebaseapp.com"),
    projectId: ("TURBOPACK compile-time value", "pharmasim-db8ea"),
    storageBucket: ("TURBOPACK compile-time value", "pharmasim-db8ea.firebasestorage.app"),
    messagingSenderId: ("TURBOPACK compile-time value", "1018116121297"),
    appId: ("TURBOPACK compile-time value", "1:1018116121297:web:05a12fa80c95aec29a5bf0")
};
const app = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getApps"])().length === 0 ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["initializeApp"])(firebaseConfig) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getApps"])()[0];
const auth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$node$2d$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAuth"])(app);
const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getFirestore"])(app);
const storage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$storage$2f$dist$2f$node$2d$esm$2f$index$2e$node$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getStorage"])(app);
const googleProvider = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$node$2d$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GoogleAuthProvider"]();
const __TURBOPACK__default__export__ = app;
}),
"[project]/src/lib/userService.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "UserService",
    ()=>UserService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$firestore$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/firestore/dist/index.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/firestore/dist/index.node.mjs [app-ssr] (ecmascript)");
;
;
const QUEST_TEMPLATES = [
    {
        id: 'q1',
        title: 'Synthesis Master',
        description: 'Build 3 Molecules',
        total: 3,
        type: 'build_molecule'
    },
    {
        id: 'q2',
        title: 'Lab Rat',
        description: 'Earn 500 XP',
        total: 500,
        type: 'earn_xp'
    },
    {
        id: 'q3',
        title: 'Daily Discovery',
        description: 'Build 1 Complex Molecule',
        total: 1,
        type: 'build_molecule'
    }
];
const UserService = {
    // Get user profile or create if not exists
    async getProfile (uid, email, displayName) {
        const docRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], 'users', uid);
        const docSnap = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDoc"])(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            // Check for daily quest reset
            const now = Date.now();
            const oneDay = 24 * 60 * 60 * 1000;
            if (!data.lastLogin || now - data.lastLogin > oneDay || !data.dailyQuests) {
                // Reset quests
                const newQuests = QUEST_TEMPLATES.slice(0, 2).map((q)=>({
                        ...q,
                        progress: 0,
                        completed: false
                    })); // Pick first 2 for now
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["updateDoc"])(docRef, {
                    dailyQuests: newQuests,
                    lastLogin: now
                });
                data.dailyQuests = newQuests;
            }
            return data;
        } else {
            // Create new profile
            const newQuests = QUEST_TEMPLATES.slice(0, 2).map((q)=>({
                    ...q,
                    progress: 0,
                    completed: false
                }));
            const newProfile = {
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
                topicMastery: {
                    kinetics: 1,
                    regulatory: 1,
                    pharmacology: 1,
                    chemistry: 1
                }
            };
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setDoc"])(docRef, newProfile);
            return newProfile;
        }
    },
    async updateDisplayName (uid, displayName) {
        const name = displayName.trim();
        if (!name) throw new Error('Display name cannot be empty');
        const docRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], 'users', uid);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["updateDoc"])(docRef, {
            displayName: name
        });
        return name;
    },
    // Update Quest Progress
    async updateQuestProgress (uid, type, amount) {
        const docRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], 'users', uid);
        const docSnap = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDoc"])(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            let questsUpdated = false;
            const newQuests = (data.dailyQuests || []).map((q)=>{
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
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["updateDoc"])(docRef, {
                    dailyQuests: newQuests
                });
            }
        }
    },
    // Unlock Achievement
    async unlockAchievement (uid, achievement) {
        const docRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], 'users', uid);
        const docSnap = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDoc"])(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            const existing = (data.achievements || []).find((a)=>a.id === achievement.id);
            if (!existing) {
                const newAchievement = {
                    ...achievement,
                    unlockedAt: Date.now()
                };
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["updateDoc"])(docRef, {
                    achievements: [
                        ...data.achievements || [],
                        newAchievement
                    ]
                });
                return newAchievement;
            }
        }
        return null;
    },
    // Add XP and check for level up
    async addXP (uid, amount) {
        const docRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], 'users', uid);
        const docSnap = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDoc"])(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            const newXP = data.xp + amount;
            const newLevel = Math.floor(newXP / 1000) + 1; // Simple level formula: 1000 XP per level
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["updateDoc"])(docRef, {
                xp: newXP,
                level: newLevel,
                moleculesDiscovered: data.moleculesDiscovered + 1 // Assuming 1 molecule per XP grant for now
            });
            return {
                newXP,
                newLevel
            };
        }
        return null;
    },
    // Get Leaderboard (Top 50 by XP)
    async getLeaderboard () {
        const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], 'users'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["orderBy"])('xp', 'desc'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["limit"])(50));
        const querySnapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDocs"])(q);
        return querySnapshot.docs.map((doc)=>doc.data());
    },
    // Get User Rank (Client-side calculation for demo)
    async getUserRank (uid) {
        // Fetch specific number of top users to determine rank
        // Note: In production you'd use a cloud function or dedicated rank field
        const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], 'users'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["orderBy"])('xp', 'desc'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["limit"])(100));
        const querySnapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDocs"])(q);
        const users = querySnapshot.docs.map((doc)=>doc.id);
        const rank = users.indexOf(uid);
        return rank !== -1 ? rank + 1 : 1000; // Return >100 if not in top 100
    },
    // Update Topic Mastery
    async updateTopicMastery (uid, topic, change) {
        const docRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], 'users', uid);
        const docSnap = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDoc"])(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            const currentMastery = data.topicMastery?.[topic] || 1;
            const newMastery = Math.max(1, Math.min(5, currentMastery + change)); // Clamp between 1 and 5
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["updateDoc"])(docRef, {
                [`topicMastery.${topic}`]: newMastery
            });
            return newMastery;
        }
        return 1;
    }
};
}),
"[project]/src/context/AuthContext.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$auth$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/auth/dist/index.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$node$2d$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/firebase/node_modules/@firebase/auth/dist/node-esm/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$userService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/userService.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])({
    user: null,
    profile: null,
    loading: true,
    refreshProfile: async ()=>{}
});
const AuthProvider = ({ children })=>{
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [profile, setProfile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const fetchProfile = async (currentUser)=>{
        try {
            const userProfile = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$userService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["UserService"].getProfile(currentUser.uid, currentUser.email || '', currentUser.displayName || '');
            setProfile(userProfile);
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const unsubscribe = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$node$2d$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["onAuthStateChanged"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["auth"], async (currentUser)=>{
            setUser(currentUser);
            if (currentUser) {
                await fetchProfile(currentUser);
            } else {
                setProfile(null);
            }
            setLoading(false);
        });
        return ()=>unsubscribe();
    }, []);
    const refreshProfile = async ()=>{
        if (user) {
            await fetchProfile(user);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: {
            user,
            profile,
            loading,
            refreshProfile
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/context/AuthContext.tsx",
        lineNumber: 57,
        columnNumber: 9
    }, ("TURBOPACK compile-time value", void 0));
};
const useAuth = ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
}),
"[project]/src/lib/ultraContextService.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "UltraContextService",
    ()=>UltraContextService,
    "default",
    ()=>__TURBOPACK__default__export__
]);
/**
 * UltraContext Service
 * 
 * This service provides a wrapper around the UltraContext API for managing
 * AI agent conversation contexts with automatic versioning, time-travel,
 * and persistent storage.
 * 
 * @see https://ultracontext.ai/docs
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ultracontext$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/ultracontext/dist/index.js [app-ssr] (ecmascript)");
;
// =============================================================================
// UltraContext Client Initialization
// =============================================================================
const API_KEY = ("TURBOPACK compile-time value", "uc_live_OuU12w0yaepGFV1sIYl1sKtpT6E3TAvx") || '';
// Initialize UltraContext client
let ucClient = null;
/**
 * Get or create the UltraContext client instance
 */ function getClient() {
    if (!ucClient) {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        ucClient = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ultracontext$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["UltraContext"]({
            apiKey: API_KEY
        });
    }
    return ucClient;
}
const UltraContextService = {
    /**
     * Create a new context
     * @param metadata - Optional metadata to attach to the context
     * @returns The created context object with ID
     */ async createContext (metadata) {
        try {
            const uc = getClient();
            const ctx = await uc.create({
                metadata
            });
            console.log('[UltraContext] Created context:', ctx.id);
            return ctx;
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
     */ async forkContext (fromContextId, version) {
        try {
            const uc = getClient();
            const ctx = await uc.create({
                from: fromContextId,
                ...version !== undefined && {
                    version
                }
            });
            console.log('[UltraContext] Forked context:', ctx.id, 'from:', fromContextId);
            return ctx;
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
     */ async getContext (contextId, options) {
        try {
            const uc = getClient();
            const result = await uc.get(contextId, options);
            return result;
        } catch (error) {
            console.error('[UltraContext] Failed to get context:', error);
            throw error;
        }
    },
    /**
     * List all contexts
     * @returns Array of all contexts
     */ async listContexts () {
        try {
            const uc = getClient();
            const result = await uc.get();
            return result.data || [];
        } catch (error) {
            console.error('[UltraContext] Failed to list contexts:', error);
            throw error;
        }
    },
    /**
     * Append one or more messages to a context
     * @param contextId - The context ID to append to
     * @param messages - Single message or array of messages
     */ async appendMessage (contextId, messages) {
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
     */ async updateMessage (contextId, update) {
        try {
            const uc = getClient();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await uc.update(contextId, update);
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
     */ async deleteMessage (contextId, target) {
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
     */ async getContextAtVersion (contextId, version) {
        return this.getContext(contextId, {
            version
        });
    },
    /**
     * Get context with full version history
     * @param contextId - The context ID
     * @returns The context data with version history
     */ async getContextWithHistory (contextId) {
        return this.getContext(contextId, {
            history: true
        });
    },
    // =========================================================================
    // Convenience Methods for PharmaSim Features
    // =========================================================================
    /**
     * Create a context for molecule analysis conversations
     * @param userId - The user's ID
     * @param moleculeName - Name of the molecule being analyzed
     */ async createMoleculeAnalysisContext (userId, moleculeName) {
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
     */ async createQuizContext (userId, topic) {
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
     */ async createTrialContext (userId, trialId) {
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
     */ async saveConversationExchange (contextId, userMessage, assistantMessage) {
        await this.appendMessage(contextId, [
            {
                role: 'user',
                content: userMessage
            },
            {
                role: 'assistant',
                content: assistantMessage
            }
        ]);
    }
};
const __TURBOPACK__default__export__ = UltraContextService;
}),
"[project]/src/context/UltraContextProvider.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "UltraContextProvider",
    ()=>UltraContextProvider,
    "default",
    ()=>__TURBOPACK__default__export__,
    "useUltraContext",
    ()=>useUltraContext
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
/**
 * UltraContext Provider
 * 
 * React context provider for app-wide UltraContext access.
 * Manages session-based context creation and provides hooks for components.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/AuthContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ultraContextService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/ultraContextService.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
// =============================================================================
// Context
// =============================================================================
const UltraContextContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(null);
function UltraContextProvider({ children }) {
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuth"])();
    const [state, setState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        activeContextId: null,
        isLoading: false,
        error: null
    });
    // Helper to set loading state
    const setLoading = (isLoading)=>{
        setState((prev)=>({
                ...prev,
                isLoading
            }));
    };
    // Helper to set error state
    const setError = (error)=>{
        setState((prev)=>({
                ...prev,
                error,
                isLoading: false
            }));
    };
    // Clear error
    const clearError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        setState((prev)=>({
                ...prev,
                error: null
            }));
    }, []);
    // Set active context
    const setActiveContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((contextId)=>{
        setState((prev)=>({
                ...prev,
                activeContextId: contextId
            }));
    }, []);
    // Create a new general context
    const createContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (metadata)=>{
        setLoading(true);
        try {
            const ctx = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ultraContextService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["UltraContextService"].createContext({
                userId: user?.uid,
                ...metadata
            });
            setState((prev)=>({
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
    }, [
        user?.uid
    ]);
    // Create molecule analysis context
    const createMoleculeContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (moleculeName)=>{
        if (!user?.uid) {
            setError('User not authenticated');
            return null;
        }
        setLoading(true);
        try {
            const ctx = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ultraContextService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["UltraContextService"].createMoleculeAnalysisContext(user.uid, moleculeName);
            setState((prev)=>({
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
    }, [
        user?.uid
    ]);
    // Create quiz context
    const createQuizContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (topic)=>{
        if (!user?.uid) {
            setError('User not authenticated');
            return null;
        }
        setLoading(true);
        try {
            const ctx = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ultraContextService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["UltraContextService"].createQuizContext(user.uid, topic);
            setState((prev)=>({
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
    }, [
        user?.uid
    ]);
    // Create clinical trial context
    const createTrialContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (trialId)=>{
        if (!user?.uid) {
            setError('User not authenticated');
            return null;
        }
        setLoading(true);
        try {
            const ctx = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ultraContextService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["UltraContextService"].createTrialContext(user.uid, trialId);
            setState((prev)=>({
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
    }, [
        user?.uid
    ]);
    // Get messages from active context
    const getMessages = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        if (!state.activeContextId) {
            console.warn('[UltraContext] No active context');
            return [];
        }
        try {
            const result = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ultraContextService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["UltraContextService"].getContext(state.activeContextId);
            return result.data || [];
        } catch (err) {
            console.error('[UltraContext] Failed to get messages:', err);
            return [];
        }
    }, [
        state.activeContextId
    ]);
    // Append message to active context
    const appendMessage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (message)=>{
        if (!state.activeContextId) {
            setError('No active context');
            return;
        }
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ultraContextService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["UltraContextService"].appendMessage(state.activeContextId, message);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to append message');
        }
    }, [
        state.activeContextId
    ]);
    // Save a conversation exchange
    const saveExchange = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (userMessage, assistantMessage)=>{
        if (!state.activeContextId) {
            setError('No active context');
            return;
        }
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ultraContextService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["UltraContextService"].saveConversationExchange(state.activeContextId, userMessage, assistantMessage);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save exchange');
        }
    }, [
        state.activeContextId
    ]);
    // Get context with history
    const getHistory = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        if (!state.activeContextId) {
            console.warn('[UltraContext] No active context');
            return null;
        }
        try {
            return await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ultraContextService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["UltraContextService"].getContextWithHistory(state.activeContextId);
        } catch (err) {
            console.error('[UltraContext] Failed to get history:', err);
            return null;
        }
    }, [
        state.activeContextId
    ]);
    const value = {
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
        clearError
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(UltraContextContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/src/context/UltraContextProvider.tsx",
        lineNumber: 258,
        columnNumber: 9
    }, this);
}
function useUltraContext() {
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(UltraContextContext);
    if (!context) {
        throw new Error('useUltraContext must be used within an UltraContextProvider');
    }
    return context;
}
const __TURBOPACK__default__export__ = UltraContextProvider;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__c4a16d22._.js.map