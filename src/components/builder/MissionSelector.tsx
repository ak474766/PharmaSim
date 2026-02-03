'use client';

import React from 'react';
import { SYLLABUS_DATA, SyllabusLevel } from '@/lib/syllabusData';

interface MissionSelectorProps {
    userLevel: number;
    onSelectMission: (mission: SyllabusLevel) => void;
    currentMissionId: number;
}

export default function MissionSelector({ userLevel, onSelectMission, currentMissionId }: MissionSelectorProps) {

    // Sort levels just in case
    const sortedLevels = [...SYLLABUS_DATA].sort((a, b) => a.level - b.level);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            marginBottom: '20px',
        }}>
            <h3 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                🗺️ Syllabus Map
            </h3>

            <div className="no-scrollbar" style={{
                display: 'flex',
                gap: '8px',
                overflowX: 'auto',
                paddingBottom: '4px',
                maskImage: 'linear-gradient(to right, black 85%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to right, black 85%, transparent 100%)'
            }}>
                <style jsx>{`
                    .no-scrollbar::-webkit-scrollbar {
                        display: none;
                    }
                    .no-scrollbar {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }
                `}</style>
                {sortedLevels.map((level) => {
                    const isLocked = level.level > userLevel;
                    const isActive = level.level === currentMissionId;
                    const isCompleted = level.level < userLevel;

                    return (
                        <div
                            key={level.level}
                            onClick={() => !isLocked && onSelectMission(level)}
                            style={{
                                minWidth: '120px',
                                padding: '10px',
                                borderRadius: '10px',
                                background: isActive ? '#2563eb' : (isLocked ? '#1f2937' : '#1f2937'),
                                border: isActive ? '1px solid #60a5fa' : '1px solid #374151',
                                cursor: isLocked ? 'not-allowed' : 'pointer',
                                opacity: isLocked ? 0.5 : 1,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '2px',
                                position: 'relative',
                                transition: 'all 0.2s',
                                transform: isActive ? 'scale(1.02)' : 'scale(1)'
                            }}
                        >
                            {/* Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                <span style={{
                                    fontSize: '0.65rem',
                                    fontWeight: 'bold',
                                    color: isActive ? '#e0e7ff' : '#6b7280',
                                    textTransform: 'uppercase'
                                }}>
                                    {level.semester}
                                </span>
                                {isLocked && <span style={{ fontSize: '0.7rem' }}>🔒</span>}
                                {isCompleted && <span style={{ fontSize: '0.7rem' }}>✅</span>}
                            </div>

                            {/* Title */}
                            <div style={{
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                color: isActive ? '#fff' : '#e5e7eb',
                                lineHeight: '1.2',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                                {level.moleculeTemplate.name}
                            </div>

                            {/* Active Indicator */}
                            {isActive && (
                                <div style={{
                                    height: '2px',
                                    background: '#fff',
                                    marginTop: '6px',
                                    borderRadius: '1px',
                                    opacity: 0.5
                                }} />
                            )}
                        </div>
                    );
                })}
            </div>

            <div style={{
                fontSize: '0.75rem',
                color: '#9ca3af',
                background: '#151921',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.05)',
                lineHeight: '1.4'
            }}>
                <span style={{ color: '#60a5fa', fontWeight: 600 }}>Objective:</span> {
                    SYLLABUS_DATA.find(s => s.level === userLevel)?.learningObjective || "Master the syllabus."
                }
            </div>
        </div>
    );
}
