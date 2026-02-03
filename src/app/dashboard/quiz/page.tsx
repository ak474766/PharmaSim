
'use client';

import { useState, useEffect } from 'react';
import styles from './Quiz.module.css';
import TopHeader from '@/components/layout/TopHeader';
import { useAuth } from '@/context/AuthContext';
import { UserService } from '@/lib/userService';
import { QUESTION_BANK, Question, QuizTopic } from '@/lib/quizData';

// Simple types for the graph
interface Node { id: string; x: number; y: number; label: string; active?: boolean; }
interface Edge { source: string; target: string; }

export default function QuizPage() {
    const { user, profile, refreshProfile } = useAuth();

    // States
    const [view, setView] = useState<'map' | 'quiz' | 'result'>('map');
    const [selectedTopic, setSelectedTopic] = useState<QuizTopic | null>(null);
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [streak, setStreak] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [feedback, setFeedback] = useState<{ type: 'correct' | 'wrong', text: string } | null>(null);

    // Knowledge Map Data
    const topics: { id: QuizTopic; label: string; x: number; y: number }[] = [
        { id: 'kinetics', label: 'Pharmacokinetics', x: 50, y: 20 },
        { id: 'regulatory', label: 'Regulatory (FDA)', x: 20, y: 80 },
        { id: 'pharmacology', label: 'Pharmacology', x: 80, y: 80 },
        { id: 'chemistry', label: 'Med Chem', x: 50, y: 50 },
    ];

    // Select a question based on Adaptive difficulty
    const getAdaptiveQuestion = (topic: QuizTopic) => {
        const userLevel = profile?.topicMastery?.[topic] || 1;
        // Find pool of questions with difficulty close to user level (+/- 1)
        const pool = QUESTION_BANK.filter(q =>
            q.topic === topic &&
            Math.abs(q.difficulty - userLevel) <= 1.5 // Allow slight reach
        );

        if (pool.length === 0) return QUESTION_BANK.find(q => q.topic === topic); // Fallback
        return pool[Math.floor(Math.random() * pool.length)];
    };

    const startQuiz = (topic: QuizTopic) => {
        setSelectedTopic(topic);
        const q = getAdaptiveQuestion(topic);
        if (q) {
            setCurrentQuestion(q);
            setView('quiz');
            setTimeLeft(30);
            setFeedback(null);
        }
    };

    const handleAnswer = async (index: number) => {
        if (!currentQuestion || !user || !selectedTopic) return;

        const isCorrect = index === currentQuestion.correctIndex;

        if (isCorrect) {
            setStreak(s => s + 1);
            setFeedback({ type: 'correct', text: 'Correct! Great job.' });
            // Adapt API: Increase difficulty
            await UserService.updateTopicMastery(user.uid, selectedTopic, 0.2);
            await UserService.addXP(user.uid, 20 + (streak * 5)); // Bonus XP
        } else {
            setStreak(0);
            setFeedback({ type: 'wrong', text: `Wrong. ${currentQuestion.explanation}` });
            // Adapt API: Decrease difficulty
            await UserService.updateTopicMastery(user.uid, selectedTopic, -0.1);
        }

        await refreshProfile(); // Sync new mastery

        // Auto next in 2s
        setTimeout(() => {
            if (isCorrect) {
                const nextQ = getAdaptiveQuestion(selectedTopic);
                if (nextQ && nextQ.id !== currentQuestion.id) {
                    setCurrentQuestion(nextQ);
                    setTimeLeft(30);
                    setFeedback(null);
                } else {
                    setView('result'); // End if no more unique questions or just to break
                }
            } else {
                setView('result'); // Exit on wrong to review (simple flow)
            }
        }, 2000);
    };

    // Timer
    useEffect(() => {
        if (view === 'quiz' && timeLeft > 0 && !feedback) {
            const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0 && !feedback) {
            setFeedback({ type: 'wrong', text: 'Time Up!' });
            setView('result');
        }
    }, [view, timeLeft, feedback]);

    return (
        <div className={styles.container}>
            <TopHeader title="Adaptive Knowledge Engine" subtitle="Mastery-based learning system." />

            <div className={styles.content}>

                {/* Knowledge Map View */}
                {view === 'map' && (
                    <div className={styles.mapContainer}>
                        <h2 className={styles.sectionTitle}>Select a Knowledge Domain</h2>
                        <div className={styles.nodeGrid}>
                            {topics.map(t => {
                                const mastery = profile?.topicMastery?.[t.id] || 1;
                                return (
                                    <div key={t.id} className={styles.nodeCard} onClick={() => startQuiz(t.id)}>
                                        <div className={styles.nodeIcon} style={{
                                            boxShadow: `0 0 ${mastery * 10}px ${mastery > 3 ? '#10b981' : '#3b82f6'}`
                                        }}>
                                            {mastery.toFixed(1)}
                                        </div>
                                        <div className={styles.nodeLabel}>{t.label}</div>
                                        <div className={styles.nodeLevel}>Level {Math.floor(mastery)}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Quiz View */}
                {view === 'quiz' && currentQuestion && (
                    <div className={styles.quizCard}>
                        <div className={styles.quizHeader}>
                            <span className={styles.topicBadge}>{selectedTopic?.toUpperCase()}</span>
                            <span className={styles.timer} style={{ color: timeLeft < 10 ? '#ef4444' : '#fff' }}>
                                ⏱ {timeLeft}s
                            </span>
                        </div>

                        <h2 className={styles.questionText}>{currentQuestion.text}</h2>

                        <div className={styles.optionsGrid}>
                            {currentQuestion.options.map((opt, idx) => (
                                <button
                                    key={idx}
                                    className={`${styles.optionBtn} ${feedback && idx === currentQuestion.correctIndex ? styles.correct : ''} ${feedback && feedback.type === 'wrong' && idx !== currentQuestion.correctIndex ? styles.dim : ''}`}
                                    onClick={() => !feedback && handleAnswer(idx)}
                                    disabled={!!feedback}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>

                        {feedback && (
                            <div className={`${styles.feedback} ${feedback.type === 'correct' ? styles.feedCorrect : styles.feedWrong}`}>
                                {feedback.text}
                            </div>
                        )}
                    </div>
                )}

                {/* Result View */}
                {view === 'result' && (
                    <div className={styles.resultCard}>
                        <h2>Session Complete</h2>
                        <p>Your mastery in <strong>{selectedTopic}</strong> has been updated.</p>
                        <div className={styles.newLevel}>
                            Current Level: {(profile?.topicMastery?.[selectedTopic!] || 1).toFixed(2)}
                        </div>
                        <button className={styles.btnPrimary} onClick={() => setView('map')}>Return to Map</button>
                    </div>
                )}

            </div>
        </div>
    );
}
