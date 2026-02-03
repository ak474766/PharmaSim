/**
 * Image Service - AI-powered molecule image generation with Firebase Storage
 * Generates unique molecule visualizations and stores them persistently
 */

import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// API Key for image generation (AI Guru Lab or similar)
const IMAGE_API_KEY = process.env.NEXT_PUBLIC_AI_GURU_LAB_API_KEY || '';
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_GENAI_API_KEY || '';

// Molecule color palettes based on molecule type
const MOLECULE_COLORS: Record<string, string[]> = {
    paracetamol: ['#4FC3F7', '#29B6F6', '#03A9F4', '#039BE5'],
    aspirin: ['#81C784', '#66BB6A', '#4CAF50', '#43A047'],
    ibuprofen: ['#FFB74D', '#FFA726', '#FF9800', '#FB8C00'],
    caffeine: ['#BA68C8', '#AB47BC', '#9C27B0', '#8E24AA'],
    default: ['#7C4DFF', '#651FFF', '#6200EA', '#536DFE']
};

export interface GeneratedImage {
    url: string;
    generatedAt: number;
    prompt: string;
}

export const ImageService = {
    /**
     * Generate a molecule image using AI and upload to Firebase Storage
     */
    async generateMoleculeImage(
        moleculeName: string,
        trialId: string,
        efficacy: number = 50,
        safety: number = 50
    ): Promise<GeneratedImage | null> {
        try {
            // Create a descriptive prompt for molecule visualization
            const prompt = this.createMoleculePrompt(moleculeName, efficacy, safety);

            // Try AI Guru Lab API first, then fallback to procedural
            let imageBlob: Blob | null = null;

            if (IMAGE_API_KEY && IMAGE_API_KEY.length > 10) {
                try {
                    imageBlob = await this.callAIGuruLabAPI(prompt);
                } catch (apiError) {
                    console.warn('AI Guru Lab API error, using procedural fallback');
                    imageBlob = null;
                }
            }

            // If AI API fails or not configured, generate procedural SVG
            if (!imageBlob) {
                console.log('Generating procedural molecule SVG for:', moleculeName);
                imageBlob = await this.generateProceduralMolecule(moleculeName, efficacy, safety);
            }

            // Upload to Firebase Storage
            let url = '';
            try {
                url = await this.uploadToFirebase(imageBlob, trialId);
            } catch (uploadError: any) {
                console.warn('Firebase Upload Failed:', uploadError.message);
                // Fallback: Convert Blob to Base64 Data URI so image still shows up
                if (imageBlob) {
                    url = await new Promise<string>((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result as string);
                        reader.readAsDataURL(imageBlob as Blob);
                    });
                }
            }

            return {
                url,
                generatedAt: Date.now(),
                prompt
            };
        } catch (error) {
            console.error('Failed to generate molecule image:', error);
            return null;
        }
    },

    /**
     * Create a descriptive prompt for molecule image generation
     */
    createMoleculePrompt(moleculeName: string, efficacy: number, safety: number): string {
        const quality = efficacy > 70 ? 'high-quality, well-structured' : 'experimental';
        const stability = safety > 70 ? 'stable' : 'reactive';

        return `Scientific 3D molecular structure visualization of ${moleculeName}, ${quality} ${stability} pharmaceutical compound, glowing atoms, dark background, neon blue and purple accents, professional medical illustration, high detail`;
    },

    /**
     * Call AI Guru Lab API for image generation
     */
    async callAIGuruLabAPI(prompt: string): Promise<Blob | null> {
        if (!IMAGE_API_KEY) return null;

        try {
            // AI Guru Lab API endpoint (adjust based on actual API documentation)
            const response = await fetch('https://api.aigurulab.tech/api/generate-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': IMAGE_API_KEY
                },
                body: JSON.stringify({
                    prompt: prompt,
                    width: 512,
                    height: 512,
                    model: 'flux' // or another model
                })
            });

            if (!response.ok) {
                console.warn('AI Guru Lab API failed:', response.status);
                return null;
            }

            const data = await response.json();

            // Handle response based on format (base64 or URL)
            if (data.image) {
                // Base64 response
                const base64Data = data.image.replace(/^data:image\/\w+;base64,/, '');
                const binaryString = atob(base64Data);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                return new Blob([bytes], { type: 'image/png' });
            } else if (data.url) {
                // URL response - fetch and convert to blob
                const imageResponse = await fetch(data.url);
                return await imageResponse.blob();
            }

            return null;
        } catch (error) {
            console.warn('AI Guru Lab API error:', error);
            return null;
        }
    },

    /**
     * Generate a procedural molecule SVG (fallback when AI is unavailable)
     */
    async generateProceduralMolecule(
        moleculeName: string,
        efficacy: number,
        safety: number
    ): Promise<Blob> {
        // Determine colors based on molecule type
        const lowerName = moleculeName.toLowerCase();
        let colors = MOLECULE_COLORS.default;
        for (const [key, palette] of Object.entries(MOLECULE_COLORS)) {
            if (lowerName.includes(key)) {
                colors = palette;
                break;
            }
        }

        // Generate atom positions based on molecule "hash"
        const seed = this.hashString(moleculeName + efficacy + safety);
        const atoms = this.generateAtomPositions(seed, 6 + (efficacy % 5));
        const bonds = this.generateBonds(atoms);

        // Create SVG
        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
                <defs>
                    <radialGradient id="bg" cx="50%" cy="50%" r="70%">
                        <stop offset="0%" stop-color="#1a1a2e"/>
                        <stop offset="100%" stop-color="#0a0a15"/>
                    </radialGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                    <radialGradient id="atom" cx="30%" cy="30%" r="60%">
                        <stop offset="0%" stop-color="${colors[0]}"/>
                        <stop offset="100%" stop-color="${colors[2]}"/>
                    </radialGradient>
                </defs>
                <rect width="512" height="512" fill="url(#bg)"/>
                
                <!-- Bonds -->
                <g stroke="${colors[1]}" stroke-width="3" opacity="0.7" filter="url(#glow)">
                    ${bonds.map(b => `<line x1="${b.x1}" y1="${b.y1}" x2="${b.x2}" y2="${b.y2}"/>`).join('\n')}
                </g>
                
                <!-- Atoms -->
                <g filter="url(#glow)">
                    ${atoms.map((a, i) => `
                        <circle cx="${a.x}" cy="${a.y}" r="${15 + (i % 3) * 5}" fill="url(#atom)"/>
                        <circle cx="${a.x - 4}" cy="${a.y - 4}" r="${5 + (i % 2) * 2}" fill="white" opacity="0.3"/>
                    `).join('\n')}
                </g>
                
                <!-- Center glow effect -->
                <circle cx="256" cy="256" r="100" fill="none" stroke="${colors[0]}" stroke-width="1" opacity="0.2"/>
                <circle cx="256" cy="256" r="150" fill="none" stroke="${colors[1]}" stroke-width="0.5" opacity="0.1"/>
            </svg>
        `;

        return new Blob([svg], { type: 'image/svg+xml' });
    },

    /**
     * Upload image blob to Firebase Storage
     */
    async uploadToFirebase(blob: Blob, trialId: string): Promise<string> {
        const extension = blob.type.includes('svg') ? 'svg' : 'png';
        const storageRef = ref(storage, `molecules/${trialId}.${extension}`);

        await uploadBytes(storageRef, blob);
        const downloadUrl = await getDownloadURL(storageRef);

        return downloadUrl;
    },

    /**
     * Get existing molecule image URL from storage
     */
    async getMoleculeImageUrl(trialId: string): Promise<string | null> {
        try {
            // Try PNG first, then SVG
            const pngRef = ref(storage, `molecules/${trialId}.png`);
            try {
                return await getDownloadURL(pngRef);
            } catch {
                const svgRef = ref(storage, `molecules/${trialId}.svg`);
                return await getDownloadURL(svgRef);
            }
        } catch {
            return null;
        }
    },

    // Helper: Simple string hash for deterministic generation
    hashString(str: string): number {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    },

    // Helper: Generate atom positions in a somewhat structured way
    generateAtomPositions(seed: number, count: number): Array<{ x: number, y: number }> {
        const atoms: Array<{ x: number, y: number }> = [];
        const centerX = 256, centerY = 256;

        for (let i = 0; i < count; i++) {
            const angle = ((seed + i * 137.5) % 360) * (Math.PI / 180);
            const radius = 60 + ((seed * (i + 1)) % 120);
            atoms.push({
                x: centerX + Math.cos(angle) * radius,
                y: centerY + Math.sin(angle) * radius
            });
        }

        return atoms;
    },

    // Helper: Generate bonds between nearby atoms
    generateBonds(atoms: Array<{ x: number, y: number }>): Array<{ x1: number, y1: number, x2: number, y2: number }> {
        const bonds: Array<{ x1: number, y1: number, x2: number, y2: number }> = [];

        for (let i = 0; i < atoms.length; i++) {
            // Connect to next atom (ring structure)
            const j = (i + 1) % atoms.length;
            bonds.push({
                x1: atoms[i].x, y1: atoms[i].y,
                x2: atoms[j].x, y2: atoms[j].y
            });

            // Connect some atoms to center for structure
            if (i % 2 === 0) {
                bonds.push({
                    x1: atoms[i].x, y1: atoms[i].y,
                    x2: 256, y2: 256
                });
            }
        }

        return bonds;
    }
};
