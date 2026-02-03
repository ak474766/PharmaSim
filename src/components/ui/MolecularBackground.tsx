'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function MolecularBackground() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const scene = new THREE.Scene();

        // Add subtle fog for depth
        scene.fog = new THREE.FogExp2(0x050505, 0.002);

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 20;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        containerRef.current.appendChild(renderer.domElement);

        // Create Molecules
        const geometry = new THREE.IcosahedronGeometry(0.5, 0);
        const material = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            flatShading: true,
            transparent: true,
            opacity: 0.8
        });

        const group = new THREE.Group();
        scene.add(group);

        const particles: THREE.Mesh[] = [];

        // Create a cloud of particles/molecules
        for (let i = 0; i < 200; i++) {
            const mesh = new THREE.Mesh(geometry, material);
            const x = (Math.random() - 0.5) * 40;
            const y = (Math.random() - 0.5) * 40;
            const z = (Math.random() - 0.5) * 40;
            mesh.position.set(x, y, z);
            mesh.scale.setScalar(Math.random() * 0.5 + 0.1);

            // Random rotation speed storage
            (mesh as any).userData = {
                rotX: (Math.random() - 0.5) * 0.02,
                rotY: (Math.random() - 0.5) * 0.02
            };

            group.add(mesh);
            particles.push(mesh);
        }

        // Connections (Lines)
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.05
        });

        const linesGeometry = new THREE.BufferGeometry();
        const lines = new THREE.LineSegments(linesGeometry, lineMaterial);
        group.add(lines);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 2);
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0x4444ff, 5, 50);
        pointLight.position.set(10, 10, 10);
        scene.add(pointLight);

        // Mouse interaction
        let mouseX = 0;
        let mouseY = 0;
        let targetX = 0;
        let targetY = 0;

        const handleMouseMove = (e: MouseEvent) => {
            mouseX = (e.clientX - window.innerWidth / 2) * 0.05;
            mouseY = (e.clientY - window.innerHeight / 2) * 0.05;
        };

        window.addEventListener('mousemove', handleMouseMove);

        // Animation Loop
        const animate = () => {
            requestAnimationFrame(animate);

            targetX = mouseX * 0.5;
            targetY = mouseY * 0.5;

            // Rotate entire group slowly
            group.rotation.y += 0.002;

            // Mouse interaction smoothing
            group.rotation.x += 0.05 * (targetY * 0.01 - group.rotation.x);
            group.rotation.y += 0.05 * (targetX * 0.01 - group.rotation.y);

            // Animate individual particles
            particles.forEach((p) => {
                p.rotation.x += p.userData.rotX;
                p.rotation.y += p.userData.rotY;
            });

            // Update Lines dynamically (connections based on distance)
            // Note: Doing this every frame for 200 particles is expensive (O(n^2)), 
            // let's optimize/simplify or just link close neighbors if needed.
            // For performance in this prompt, static or no-recalc lines might be better,
            // but let's try a simple visual trick: Rotate the static lines with the group.

            renderer.render(scene, camera);
        };

        animate();

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', handleResize);
            if (containerRef.current) {
                containerRef.current.removeChild(renderer.domElement);
            }
            geometry.dispose();
            material.dispose();
            renderer.dispose();
        };
    }, []);

    return <div ref={containerRef} style={{ position: 'absolute', top: 0, left: 0, zIndex: 0, opacity: 0.6 }} />;
}
