'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import styles from './Rewards.module.css';
import TopHeader from '@/components/layout/TopHeader';
import { useAuth } from '@/context/AuthContext';
import { UserService, Redemption, CoinTransaction } from '@/lib/userService';

// Reward catalog
const REWARDS_CATALOG = [
    {
        id: 'coffee_voucher',
        title: 'Coffee Voucher',
        desc: 'Enjoy a free coffee on us! Redeemable at any participating café.',
        icon: '☕',
        image: '/reward/coffee voucher.jpeg',
        category: 'VOUCHER',
        bannerClass: 'voucher',
        cost: 500,
    },
    {
        id: 'book_coupon',
        title: 'Science Book Coupon',
        desc: '$10 off any science textbook or journal subscription.',
        icon: '📚',
        image: '/reward/Science Book Coupon.jpeg',
        category: 'VOUCHER',
        bannerClass: 'voucher',
        cost: 1000,
    },
    {
        id: 'amazon_gift_5',
        title: '$5 Amazon Gift Card',
        desc: 'A $5 Amazon gift card code. Valid on all products.',
        icon: '🎁',
        image: '/reward/$5 Amazon Gift Card.jpeg',
        category: 'GIFT CARD',
        bannerClass: 'gift',
        cost: 2500,
    },
    {
        id: 'amazon_gift_10',
        title: '$10 Amazon Gift Card',
        desc: 'A $10 Amazon gift card code. Best value for your coins!',
        icon: '💳',
        image: '/reward/$10 Amazon Gift Card.jpeg',
        category: 'GIFT CARD',
        bannerClass: 'gift',
        cost: 4500,
    },
    {
        id: 'premium_month',
        title: 'Premium Access (1 Month)',
        desc: 'Unlock premium Lab features, AI priority, and exclusive simulations.',
        icon: '⭐',
        image: '/reward/Premium Access (1 Month).jpeg',
        category: 'PREMIUM',
        bannerClass: 'premium',
        cost: 3000,
    },
    {
        id: 'donation_5',
        title: '$5 Charity Donation',
        desc: 'Donate $5 to medical research charities in your name.',
        icon: '❤️',
        image: '/reward/$5 Charity Donation.jpeg',
        category: 'DONATION',
        bannerClass: 'premium',
        cost: 2000,
    },
];

// How to earn coins guide
const EARNING_GUIDE = [
    { icon: '🏆', action: 'Unlock Achievement', coins: '+50 to +200' },
    { icon: '✅', action: 'Complete a Trial', coins: '+100' },
    { icon: '🧪', action: 'Pass Trial Phase', coins: '+25' },
    { icon: '🧬', action: 'Build a Molecule', coins: '+30' },
    { icon: '📝', action: 'Quiz Perfect Score', coins: '+75' },
    { icon: '📅', action: 'Daily Login Streak', coins: '+10/day' },
];

export default function RewardsPage() {
    const { user } = useAuth();
    const [coins, setCoins] = useState(0);
    const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
    const [redemptions, setRedemptions] = useState<Redemption[]>([]);
    const [loading, setLoading] = useState(true);
    const [redeemingId, setRedeemingId] = useState<string | null>(null);
    const [modal, setModal] = useState<{ show: boolean; voucherCode: string; rewardTitle: string } | null>(null);
    const [copied, setCopied] = useState(false);

    const loadData = useCallback(async () => {
        if (!user) return;
        try {
            const profile = await UserService.getProfile(user.uid, user.email || '', user.displayName || '');
            setCoins(profile.coins || 0);
            setTransactions((profile.coinTransactions || []).slice().reverse());
            setRedemptions((profile.redemptions || []).slice().reverse());
        } catch (err) {
            console.error('Failed to load rewards data:', err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleRedeem = async (reward: typeof REWARDS_CATALOG[0]) => {
        if (!user || coins < reward.cost) return;
        setRedeemingId(reward.id);
        try {
            const result = await UserService.redeemReward(user.uid, reward.id, reward.title, reward.cost);
            if (result.success && result.voucherCode) {
                setCoins(result.balance || 0);
                setModal({ show: true, voucherCode: result.voucherCode, rewardTitle: reward.title });
                await loadData(); // Refresh transaction and redemption lists
            }
        } catch (err) {
            console.error('Redeem failed:', err);
        } finally {
            setRedeemingId(null);
        }
    };

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }).catch(() => { });
    };

    const formatDate = (ts: number) => {
        const d = new Date(ts);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const formatTime = (ts: number) => {
        const d = new Date(ts);
        const now = new Date();
        const diff = now.getTime() - ts;
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const totalEarned = transactions.filter(t => t.type === 'earned').reduce((sum, t) => sum + t.amount, 0);
    const totalSpent = transactions.filter(t => t.type === 'spent').reduce((sum, t) => sum + t.amount, 0);

    if (loading) {
        return (
            <div className={styles.container}>
                <TopHeader title="Rewards Store" subtitle="Earn coins, redeem rewards" />
                <div className={styles.scrollArea}>
                    <div className={styles.emptyState}>
                        <span className={styles.emptyIcon}>⏳</span>
                        <p>Loading your rewards...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <TopHeader title="Rewards Store" subtitle="Earn coins from achievements, redeem for real rewards" />

            <div className={styles.scrollArea}>
                {/* ===== COIN HERO ===== */}
                <div className={styles.coinHero}>
                    <div className={styles.coinHeroLeft}>
                        <div className={styles.coinIconLarge}>🪙</div>
                        <div className={styles.coinBalance}>
                            <span className={styles.coinBalanceLabel}>Your Balance</span>
                            <div className={styles.coinBalanceValue}>
                                {coins.toLocaleString()}
                                <span className={styles.coinUnit}>coins</span>
                            </div>
                        </div>
                    </div>
                    <div className={styles.coinHeroRight}>
                        <div className={styles.heroStat}>
                            <div className={styles.heroStatValue}>{totalEarned.toLocaleString()}</div>
                            <div className={styles.heroStatLabel}>Total Earned</div>
                        </div>
                        <div className={styles.heroStat}>
                            <div className={styles.heroStatValue}>{totalSpent.toLocaleString()}</div>
                            <div className={styles.heroStatLabel}>Total Spent</div>
                        </div>
                        <div className={styles.heroStat}>
                            <div className={styles.heroStatValue}>{redemptions.length}</div>
                            <div className={styles.heroStatLabel}>Redeemed</div>
                        </div>
                    </div>
                </div>

                {/* ===== REWARDS STORE ===== */}
                <div className={styles.sectionHeader}>
                    <div className={styles.sectionTitle}>
                        <span>🛒</span> Rewards Store
                    </div>
                    <div className={styles.sectionBadge}>{REWARDS_CATALOG.length} rewards</div>
                </div>

                <div className={styles.rewardsGrid}>
                    {REWARDS_CATALOG.map((reward) => {
                        const canAfford = coins >= reward.cost;
                        return (
                            <div
                                key={reward.id}
                                className={`${styles.rewardCard} ${!canAfford ? styles.disabled : ''}`}
                            >
                                <div className={styles.rewardBanner}>
                                    <Image
                                        src={reward.image}
                                        alt={reward.title}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 33vw"
                                        style={{ objectFit: 'cover' }}
                                    />
                                    <div className={styles.rewardBannerOverlay} />
                                </div>
                                <div className={styles.rewardBody}>
                                    <div className={styles.rewardCategory}>{reward.category}</div>
                                    <div className={styles.rewardTitle}>{reward.title}</div>
                                    <div className={styles.rewardDesc}>{reward.desc}</div>
                                    <div className={styles.rewardFooter}>
                                        <div className={styles.rewardPrice}>
                                            <span className={styles.rewardPriceIcon}>🪙</span>
                                            {reward.cost.toLocaleString()}
                                        </div>
                                        <button
                                            className={styles.btnRedeem}
                                            disabled={!canAfford || redeemingId === reward.id}
                                            onClick={() => handleRedeem(reward)}
                                        >
                                            {redeemingId === reward.id ? 'Redeeming...' : canAfford ? 'Redeem' : 'Not enough'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ===== HOW TO EARN ===== */}
                <div className={styles.sectionHeader}>
                    <div className={styles.sectionTitle}>
                        <span>💡</span> How To Earn Coins
                    </div>
                </div>

                <div className={styles.earningGrid} style={{ marginBottom: 32 }}>
                    {EARNING_GUIDE.map((item, i) => (
                        <div key={i} className={styles.earningCard}>
                            <span className={styles.earningIcon}>{item.icon}</span>
                            <div className={styles.earningInfo}>
                                <div className={styles.earningAction}>{item.action}</div>
                                <div className={styles.earningAmount}>{item.coins}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ===== BOTTOM GRID ===== */}
                <div className={styles.bottomGrid}>
                    {/* Transaction History */}
                    <div className={styles.panel}>
                        <div className={styles.panelTitle}>
                            📊 Transaction History
                            <span className={styles.panelCount}>{transactions.length}</span>
                        </div>
                        {transactions.length === 0 ? (
                            <div className={styles.emptyState}>
                                <span className={styles.emptyIcon}>📭</span>
                                <p>No transactions yet. Complete achievements to earn your first coins!</p>
                            </div>
                        ) : (
                            <div className={styles.txnList}>
                                {transactions.slice(0, 8).map((txn) => (
                                    <div key={txn.id} className={styles.txnRow}>
                                        <div className={`${styles.txnIcon} ${styles[txn.type]}`}>
                                            {txn.type === 'earned' ? '📥' : '📤'}
                                        </div>
                                        <div className={styles.txnInfo}>
                                            <div className={styles.txnReason}>{txn.reason}</div>
                                            <div className={styles.txnTime}>{formatTime(txn.timestamp)}</div>
                                        </div>
                                        <div className={`${styles.txnAmount} ${txn.type === 'earned' ? styles.positive : styles.negative}`}>
                                            {txn.type === 'earned' ? '+' : '-'}{txn.amount}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* My Vouchers */}
                    <div className={styles.panel}>
                        <div className={styles.panelTitle}>
                            🎫 My Vouchers
                            <span className={styles.panelCount}>{redemptions.length}</span>
                        </div>
                        {redemptions.length === 0 ? (
                            <div className={styles.emptyState}>
                                <span className={styles.emptyIcon}>🎫</span>
                                <p>No vouchers yet. Redeem rewards from the store above!</p>
                            </div>
                        ) : (
                            <div className={styles.voucherList}>
                                {redemptions.slice(0, 5).map((rdm) => (
                                    <div key={rdm.id} className={styles.voucherRow}>
                                        <div className={styles.voucherIcon}>🎫</div>
                                        <div className={styles.voucherInfo}>
                                            <div className={styles.voucherTitle}>{rdm.rewardTitle}</div>
                                            <div
                                                className={styles.voucherCode}
                                                onClick={() => copyCode(rdm.voucherCode)}
                                                title="Click to copy"
                                            >
                                                {rdm.voucherCode}
                                            </div>
                                        </div>
                                        <div className={styles.voucherMeta}>
                                            <div className={styles.voucherCost}>🪙 {rdm.coinsCost}</div>
                                            <div className={styles.voucherDate}>{formatDate(rdm.redeemedAt)}</div>
                                            <span className={`${styles.voucherStatus} ${rdm.status === 'active' ? styles.statusActive : styles.statusUsed}`}>
                                                {rdm.status.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ===== REDEEM SUCCESS MODAL ===== */}
            {modal?.show && (
                <div className={styles.modalOverlay} onClick={() => setModal(null)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalIcon}>🎉</div>
                        <div className={styles.modalTitle}>Reward Redeemed!</div>
                        <div className={styles.modalDesc}>
                            Your <strong>{modal.rewardTitle}</strong> has been unlocked. Here&apos;s your voucher code:
                        </div>
                        <div
                            className={styles.modalCode}
                            onClick={() => copyCode(modal.voucherCode)}
                        >
                            {modal.voucherCode}
                        </div>
                        <div className={styles.modalHint}>Click code to copy • Valid for 30 days</div>
                        <div className={styles.modalBtns}>
                            <button
                                className={styles.btnModalPrimary}
                                onClick={() => copyCode(modal.voucherCode)}
                            >
                                {copied ? '✅ Copied!' : '📋 Copy Code'}
                            </button>
                            <button
                                className={styles.btnModalSecondary}
                                onClick={() => setModal(null)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
