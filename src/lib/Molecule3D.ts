
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Atom, Bond, PeriodicTable } from './chemistry';

export class MoleculeScene {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private controls: OrbitControls;
    private raycaster: THREE.Raycaster;
    private mouse: THREE.Vector2;
    private container: HTMLElement;

    // Data
    private atoms: Atom[] = [];
    private bonds: Bond[] = [];
    private atomMeshes: Map<number, THREE.Mesh> = new Map();
    private bondMeshes: Map<number, THREE.Mesh[]> = new Map();

    // Interaction
    private onAtomClick?: (atomId: number) => void;
    private onEmptyClick?: (position: THREE.Vector3) => void;
    private onAtomHover?: (atom: Atom | null) => void;

    private ghostMesh: THREE.Mesh | null = null;
    private hoveredAtomId: number | null = null;

    constructor(
        container: HTMLElement,
        width: number,
        height: number,
        onAtomClick?: (id: number) => void,
        onEmptyClick?: (pos: THREE.Vector3) => void,
        onAtomHover?: (atom: Atom | null) => void
    ) {
        this.container = container;
        this.onAtomClick = onAtomClick;
        this.onEmptyClick = onEmptyClick;
        this.onAtomHover = onAtomHover;

        // Scene Setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x050508);
        this.scene.fog = new THREE.Fog(0x050508, 15, 60);

        // Camera
        this.camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
        this.camera.position.set(0, 8, 18);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(this.renderer.domElement);

        // Controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 5;
        this.controls.maxDistance = 50;

        // Lights
        const ambientLight = new THREE.AmbientLight(0x404050, 2);
        this.scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xffffff, 2.5);
        pointLight.position.set(10, 15, 10);
        this.scene.add(pointLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
        dirLight.position.set(-5, 10, -5);
        this.scene.add(dirLight);

        // Grid
        const gridHelper = new THREE.GridHelper(40, 40, 0x333340, 0x1a1a25);
        this.scene.add(gridHelper);

        // Interaction
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        // Event Listeners
        this.renderer.domElement.addEventListener('click', this.handleClick.bind(this));
        this.renderer.domElement.addEventListener('mousemove', this.handleMouseMove.bind(this));

        // Start Loop
        this.animate();
    }

    public updateGhost(elementSymbol: string | null) {
        if (this.ghostMesh) {
            this.scene.remove(this.ghostMesh);
            this.ghostMesh = null;
        }

        if (elementSymbol && PeriodicTable[elementSymbol]) {
            const data = PeriodicTable[elementSymbol];
            const geometry = new THREE.SphereGeometry(1, 32, 32);
            const material = new THREE.MeshPhongMaterial({
                color: data.color,
                opacity: 0.4,
                transparent: true,
                emissive: data.color,
                emissiveIntensity: 0.3
            });
            this.ghostMesh = new THREE.Mesh(geometry, material);
            const scale = data.radius * 0.5;
            this.ghostMesh.scale.set(scale, scale, scale);
            this.scene.add(this.ghostMesh);
        }
    }

    private handleMouseMove(event: MouseEvent) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);

        // Check for atom hover
        const atomMeshArray = Array.from(this.atomMeshes.values());
        const intersects = this.raycaster.intersectObjects(atomMeshArray);

        if (intersects.length > 0) {
            const object = intersects[0].object;
            for (const [id, mesh] of this.atomMeshes.entries()) {
                if (mesh === object) {
                    if (this.hoveredAtomId !== id) {
                        this.hoveredAtomId = id;
                        const atom = this.atoms.find(a => a.id === id);
                        if (this.onAtomHover) this.onAtomHover(atom || null);
                    }
                    break;
                }
            }
        } else {
            if (this.hoveredAtomId !== null) {
                this.hoveredAtomId = null;
                if (this.onAtomHover) this.onAtomHover(null);
            }
        }

        // Ghost positioning
        if (this.ghostMesh) {
            const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
            const target = new THREE.Vector3();
            const intersection = this.raycaster.ray.intersectPlane(plane, target);

            if (intersection) {
                this.ghostMesh.position.copy(intersection);
                this.ghostMesh.visible = true;
            } else {
                this.ghostMesh.visible = false;
            }
        }
    }

    private handleClick(event: MouseEvent) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);

        // Raycast against atoms
        const atomMeshArray = Array.from(this.atomMeshes.values());
        const intersects = this.raycaster.intersectObjects(atomMeshArray);

        if (intersects.length > 0) {
            // Clicked an atom
            const object = intersects[0].object;
            for (const [id, mesh] of this.atomMeshes.entries()) {
                if (mesh === object && this.onAtomClick) {
                    this.onAtomClick(id);
                    return;
                }
            }
        } else {
            // Clicked empty space
            const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
            const target = new THREE.Vector3();
            const intersection = this.raycaster.ray.intersectPlane(plane, target);

            if (intersection && this.onEmptyClick) {
                this.onEmptyClick(intersection);
            }
        }
    }

    public updateMolecule(atoms: Atom[], bonds: Bond[]) {
        this.atoms = atoms;
        this.bonds = bonds;
        this.renderMolecule();
    }

    private renderMolecule() {
        // Clear existing meshes
        this.atomMeshes.forEach(mesh => this.scene.remove(mesh));
        this.atomMeshes.clear();

        this.bondMeshes.forEach(meshes => meshes.forEach(m => this.scene.remove(m)));
        this.bondMeshes.clear();

        const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
        const cylinderGeometry = new THREE.CylinderGeometry(0.15, 0.15, 1, 16);

        // Render Atoms
        this.atoms.forEach(atom => {
            const data = PeriodicTable[atom.element];
            if (!data) return;

            const material = new THREE.MeshPhongMaterial({
                color: data.color,
                shininess: 80,
                specular: 0x444444
            });
            const mesh = new THREE.Mesh(sphereGeometry, material);

            // Scale by radius
            const scale = data.radius * 0.5;
            mesh.scale.set(scale, scale, scale);

            mesh.position.set(atom.x, atom.y, atom.z);

            this.scene.add(mesh);
            this.atomMeshes.set(atom.id, mesh);
        });

        // Render Bonds
        this.bonds.forEach(bond => {
            const startAtom = this.atoms.find(a => a.id === bond.sourceId);
            const endAtom = this.atoms.find(a => a.id === bond.targetId);
            if (!startAtom || !endAtom) return;

            const startPos = new THREE.Vector3(startAtom.x, startAtom.y, startAtom.z);
            const endPos = new THREE.Vector3(endAtom.x, endAtom.y, endAtom.z);

            const distance = startPos.distanceTo(endPos);
            const mid = new THREE.Vector3().addVectors(startPos, endPos).multiplyScalar(0.5);

            // Orientation
            const direction = new THREE.Vector3().subVectors(endPos, startPos).normalize();
            const quaternion = new THREE.Quaternion();
            quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);

            const bondColor = 0x666680;

            if (bond.order === 1) {
                const material = new THREE.MeshPhongMaterial({ color: bondColor });
                const mesh = new THREE.Mesh(cylinderGeometry, material);
                mesh.position.copy(mid);
                mesh.quaternion.copy(quaternion);
                mesh.scale.set(1, distance, 1);
                this.scene.add(mesh);
                this.bondMeshes.set(bond.id, [mesh]);
            } else if (bond.order >= 2) {
                // Double/Triple bond
                const offset = 0.2;
                let axis = new THREE.Vector3(0, 0, 1);
                if (Math.abs(direction.z) > 0.9) axis.set(1, 0, 0);
                const offsetVec = new THREE.Vector3().crossVectors(direction, axis).normalize().multiplyScalar(offset);

                const m1 = new THREE.Mesh(cylinderGeometry, new THREE.MeshPhongMaterial({ color: bondColor }));
                m1.position.copy(mid).add(offsetVec);
                m1.quaternion.copy(quaternion);
                m1.scale.set(0.8, distance, 0.8);

                const m2 = new THREE.Mesh(cylinderGeometry, new THREE.MeshPhongMaterial({ color: bondColor }));
                m2.position.copy(mid).sub(offsetVec);
                m2.quaternion.copy(quaternion);
                m2.scale.set(0.8, distance, 0.8);

                this.scene.add(m1);
                this.scene.add(m2);
                this.bondMeshes.set(bond.id, [m1, m2]);
            }
        });
    }

    public resize(width: number, height: number) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    public dispose() {
        this.renderer.dispose();
        if (this.container.contains(this.renderer.domElement)) {
            this.container.removeChild(this.renderer.domElement);
        }
    }

    private animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}
