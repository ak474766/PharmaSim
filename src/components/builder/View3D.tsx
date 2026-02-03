'use client';

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { MoleculeScene } from '@/lib/Molecule3D';
import * as THREE from 'three';
import { Atom, Bond, PeriodicTable } from '@/lib/chemistry';

interface View3DProps {
    atoms: Atom[];
    bonds: Bond[];
    selectedElement?: string | null;
    onAtomClick?: (id: number) => void;
    onEmptyClick?: (position: THREE.Vector3) => void;
}

export interface View3DHandle {
    resize: () => void;
}

const View3D = forwardRef<View3DHandle, View3DProps>(({ atoms, bonds, selectedElement, onAtomClick, onEmptyClick }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<MoleculeScene | null>(null);
    const [hoveredAtom, setHoveredAtom] = useState<Atom | null>(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

    // Store callbacks in refs to avoid re-creating scene
    const onAtomClickRef = useRef(onAtomClick);
    const onEmptyClickRef = useRef(onEmptyClick);

    useEffect(() => {
        onAtomClickRef.current = onAtomClick;
    }, [onAtomClick]);

    useEffect(() => {
        onEmptyClickRef.current = onEmptyClick;
    }, [onEmptyClick]);

    useImperativeHandle(ref, () => ({
        resize: () => {
            if (sceneRef.current && containerRef.current) {
                const { clientWidth, clientHeight } = containerRef.current;
                sceneRef.current.resize(clientWidth, clientHeight);
            }
        }
    }));

    useEffect(() => {
        if (!containerRef.current) return;

        const { clientWidth, clientHeight } = containerRef.current;
        const scene = new MoleculeScene(
            containerRef.current,
            clientWidth,
            clientHeight,
            (id) => onAtomClickRef.current?.(id),
            (pos) => onEmptyClickRef.current?.(pos),
            (atom) => setHoveredAtom(atom)
        );
        sceneRef.current = scene;

        // Resize observer
        const resizeObserver = new ResizeObserver(() => {
            if (containerRef.current && sceneRef.current) {
                const { clientWidth, clientHeight } = containerRef.current;
                sceneRef.current.resize(clientWidth, clientHeight);
            }
        });
        resizeObserver.observe(containerRef.current);

        return () => {
            scene.dispose();
            resizeObserver.disconnect();
        };
    }, []); // Only run once

    // Update molecule when props change
    useEffect(() => {
        if (sceneRef.current) {
            sceneRef.current.updateMolecule(atoms, bonds);
            sceneRef.current.updateGhost(selectedElement || null);
        }
    }, [atoms, bonds, selectedElement]);

    // Track mouse for tooltip positioning
    const handleMouseMove = (e: React.MouseEvent) => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setTooltipPos({
                x: e.clientX - rect.left + 15,
                y: e.clientY - rect.top - 10
            });
        }
    };

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            style={{ width: '100%', height: '100%', position: 'relative', cursor: hoveredAtom ? 'pointer' : 'crosshair' }}
        >
            {/* Atom Tooltip */}
            {hoveredAtom && (
                <div style={{
                    position: 'absolute',
                    left: tooltipPos.x,
                    top: tooltipPos.y,
                    background: 'rgba(0, 0, 0, 0.9)',
                    color: '#fff',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    pointerEvents: 'none',
                    zIndex: 100,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    border: '1px solid rgba(255,255,255,0.15)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
                }}>
                    <div style={{
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        background: `#${PeriodicTable[hoveredAtom.element]?.color.toString(16).padStart(6, '0') || 'ffffff'}`
                    }} />
                    <span>{PeriodicTable[hoveredAtom.element]?.name || hoveredAtom.element}</span>
                    <span style={{ color: '#6b7280', fontWeight: 400, fontSize: '0.75rem' }}>({hoveredAtom.element})</span>
                </div>
            )}
        </div>
    );
});

View3D.displayName = 'View3D';
export default View3D;
