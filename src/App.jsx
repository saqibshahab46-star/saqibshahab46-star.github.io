import React, { useEffect, useState } from 'react';
import Prism from './Prism';
import MagneticDock from './MagneticDock';
import Smooth3DSlideshow from './Smooth3DSlideshow';
import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import './App.css';

function App() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);


    // Helper function to close menu and smooth scroll
    const handleMobileNavClick = (e, targetId) => {
        e.preventDefault(); // Stops the default jumpy anchor behavior
        setIsMenuOpen(false); // Forcefully closes the mobile menu

        const element = document.getElementById(targetId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' }); // Glides smoothly to the section
        }
    };

    // --- New Gallery State ---
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [currentImg, setCurrentImg] = useState(0);
    const donutImages = ['/donut1.png', '/donut2.png', '/donut3.png', '/donut4.png', '/donut5.png'];

    // --- Swipe / Drag Logic ---
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [dragEnd, setDragEnd] = useState({ x: 0, y: 0 });

    const handlePointerDown = (e) => {
        setDragStart({
            x: e.clientX || (e.touches && e.touches[0].clientX),
            y: e.clientY || (e.touches && e.touches[0].clientY)
        });
    };

    const handlePointerMove = (e) => {
        if (!dragStart.x) return; // Only track if currently dragging
        setDragEnd({
            x: e.clientX || (e.touches && e.touches[0].clientX),
            y: e.clientY || (e.touches && e.touches[0].clientY)
        });
    };

    const handlePointerUp = () => {
        if (!dragStart.x || !dragEnd.x) return;

        const distX = dragStart.x - dragEnd.x;
        const distY = dragStart.y - dragEnd.y;
        const isMobile = window.innerWidth <= 768;

        // Mobile: Swipe Y-axis (Up/Down) | Desktop: Swipe X-axis (Left/Right)
        if (isMobile) {
            if (distY > 50) setCurrentImg((prev) => (prev + 1) % donutImages.length); // Swipe Up -> Next
            if (distY < -50) setCurrentImg((prev) => (prev === 0 ? donutImages.length - 1 : prev - 1)); // Swipe Down -> Prev
        } else {
            if (distX > 50) setCurrentImg((prev) => (prev + 1) % donutImages.length); // Swipe Left -> Next
            if (distX < -50) setCurrentImg((prev) => (prev === 0 ? donutImages.length - 1 : prev - 1)); // Swipe Right -> Prev
        }

        // Reset tracking
        setDragStart({ x: 0, y: 0 });
        setDragEnd({ x: 0, y: 0 });
    };

    // Allow clicking the image to also advance to the next one
    const handleImageClick = () => {
        if (dragStart.x === dragEnd.x && dragStart.y === dragEnd.y) {
            setCurrentImg((prev) => (prev + 1) % donutImages.length);
        }
    };

    useEffect(() => {
        /* ================= Ambient antigravity particle field ================= */
        const ambientCanvas = document.getElementById('ambient-canvas');
        if (ambientCanvas) {
            const ctx = ambientCanvas.getContext('2d');
            let w, h, particles;
            function resize() {
                w = ambientCanvas.width = window.innerWidth;
                h = ambientCanvas.height = window.innerHeight * (document.body.scrollHeight / window.innerHeight);
                ambientCanvas.style.height = document.body.scrollHeight + 'px';
            }
            function initParticles() {
                const count = Math.min(90, Math.floor(window.innerWidth / 16));
                particles = Array.from({ length: count }, () => ({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    r: Math.random() * 1.6 + 0.4,
                    speed: Math.random() * 0.35 + 0.05,
                    drift: (Math.random() - 0.5) * 0.25,
                    hue: ['14,107,82', '31,63,145', '191,155,48'][Math.floor(Math.random() * 3)],
                    alpha: Math.random() * 0.5 + 0.15
                }));
            }
            resize(); initParticles();
            window.addEventListener('resize', () => { resize(); initParticles(); });

            let animationId;
            function tick() {
                ctx.clearRect(0, 0, w, h);
                const scrollY = window.scrollY;
                for (const p of particles) {
                    p.y -= p.speed;
                    p.x += p.drift;
                    if (p.y < scrollY - 20) { p.y = scrollY + h * 0 + window.innerHeight + 20; p.x = Math.random() * w; }
                    if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
                    const screenY = p.y;
                    ctx.beginPath();
                    ctx.arc(p.x, screenY, p.r, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(${p.hue},${p.alpha})`;
                    ctx.fill();
                }
                animationId = requestAnimationFrame(tick);
            }
            tick();
        }

        /* ================= Smooth Morph / Designation Text ================= */
        const words = [
            "Building AI Agents",
            "Engineering Full-Stack Systems",
            "Training Neural Networks",
            "Automating the Boring Stuff",
            "Designing Interactive Web Experiences"
        ];

        const morphEl = document.getElementById('morph-text');
        if (morphEl) {
            morphEl.innerHTML = '';
            words.forEach((word, i) => {
                const span = document.createElement('span');
                span.textContent = word;
                if (i === 0) span.classList.add('active');
                morphEl.appendChild(span);
            });

            let idx = 0;
            const spans = morphEl.querySelectorAll('span');

            const morphInterval = setInterval(() => {
                if (spans.length === 0) return;
                const current = spans[idx];
                current.classList.remove('active');
                current.classList.add('outgoing');

                idx = (idx + 1) % words.length;
                const next = spans[idx];

                setTimeout(() => {
                    current.classList.remove('outgoing');
                }, 300);

                next.classList.add('active');
            }, 3000);
        }

        /* ================= Reveal on scroll ================= */
        const items = document.querySelectorAll('.reveal');
        const io = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
            });
        }, { threshold: 0.15 });
        items.forEach(i => io.observe(i));

        /* ================= Rail (circuit link) active state ================= */
        const nodes = document.querySelectorAll('#rail .rail-node');
        const fills = document.querySelectorAll('#rail .rail-fill');
        const sections = Array.from(nodes).map(n => document.getElementById(n.dataset.target));

        nodes.forEach(n => {
            n.addEventListener('click', () => {
                const target = document.getElementById(n.dataset.target);
                if (target) target.scrollIntoView({ behavior: 'smooth' });
            });
        });

        function updateRail() {
            let activeIdx = 0;
            sections.forEach((s, i) => {
                if (s && s.getBoundingClientRect().top < window.innerHeight * 0.5) activeIdx = i;
            });
            nodes.forEach((n, i) => n.classList.toggle('active', i === activeIdx));
            fills.forEach((f, i) => f.style.height = (i < activeIdx ? '100%' : '0%'));
        }

        let isTicking = false;
        const scrollHandler = () => {
            if (!isTicking) {
                window.requestAnimationFrame(() => {
                    updateRail();
                    isTicking = false;
                });
                isTicking = true;
            }
        };
        window.addEventListener('scroll', scrollHandler);



        /* ================= Project card tilt + glow ================= */
        const pcards = document.querySelectorAll('.pcard');
        pcards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left, y = e.clientY - rect.top;
                card.style.setProperty('--mx', x + 'px');
                card.style.setProperty('--my', y + 'px');
                const rx = ((y / rect.height) - 0.5) * -6;
                const ry = ((x / rect.width) - 0.5) * 6;
                card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-2px)`;
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)';
            });
        });

        /* ================= Photo frame 3D tilt ================= */
        const stage = document.getElementById('photo-stage');
        const frame = document.getElementById('photo-frame');
        if (stage && frame) {
            stage.addEventListener('mousemove', (e) => {
                const rect = stage.getBoundingClientRect();
                const x = e.clientX - rect.left, y = e.clientY - rect.top;
                const rx = ((y / rect.height) - 0.5) * -10, ry = ((x / rect.width) - 0.5) * 10;
                frame.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) scale(1.02)`;
            });
            stage.addEventListener('mouseleave', () => { frame.style.transform = 'rotateX(0) rotateY(0) scale(1)'; });
        }

        /* ================= 3D Tech Stack Sphere ================= */
        let sphereAnimId;
        const sphereCanvas = document.getElementById('sphere-canvas');
        const sphereWrap = document.getElementById('sphere-wrap');
        if (sphereCanvas && sphereWrap) {
            const techs = [
                "Python", "JavaScript", "TypeScript", "React", "Node.js", "Next.js",
                "Flask", "FastAPI", "Django", "TensorFlow", "PyTorch", "LangChain",
                "MongoDB", "PostgreSQL", "Docker", "AWS", "Git", "Tailwind", "OpenCV", "n8n"
            ];

            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(55, sphereWrap.clientWidth / sphereWrap.clientHeight, 0.1, 100);
            camera.position.z = 9;

            const renderer = new THREE.WebGLRenderer({ canvas: sphereCanvas, antialias: true, alpha: true });
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.setSize(sphereWrap.clientWidth, sphereWrap.clientHeight);

            const group = new THREE.Group();
            scene.add(group);

            const coreGeo = new THREE.IcosahedronGeometry(2.4, 1);
            const coreMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff, wireframe: true, transparent: true, opacity: 0.3 });
            const core = new THREE.Mesh(coreGeo, coreMat);
            group.add(core);

            const coreGlowGeo = new THREE.IcosahedronGeometry(2.35, 1);
            const coreGlowMat = new THREE.MeshBasicMaterial({ color: 0xb026ff, transparent: true, opacity: 0.08 });
            group.add(new THREE.Mesh(coreGlowGeo, coreGlowMat));

            const radius = 3.9;
            const nodeGroup = new THREE.Group();
            group.add(nodeGroup);

            const nodePositions = [];
            const n = techs.length;
            const goldenAngle = Math.PI * (3 - Math.sqrt(5));
            for (let i = 0; i < n; i++) {
                const y = 1 - (i / (n - 1)) * 2;
                const rAtY = Math.sqrt(1 - y * y);
                const theta = goldenAngle * i;
                const x = Math.cos(theta) * rAtY;
                const z = Math.sin(theta) * rAtY;
                nodePositions.push(new THREE.Vector3(x * radius, y * radius, z * radius));
            }

            const nodeColorA = new THREE.Color(0x00e5ff);
            const nodeColorB = new THREE.Color(0xb026ff);
            const dotGeo = new THREE.SphereGeometry(0.09, 12, 12);
            nodePositions.forEach((pos, i) => {
                const col = nodeColorA.clone().lerp(nodeColorB, i / n);
                const mat = new THREE.MeshBasicMaterial({ color: col });
                const dot = new THREE.Mesh(dotGeo, mat);
                dot.position.copy(pos);
                nodeGroup.add(dot);
            });

            const lineMat = new THREE.LineBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.25 });
            for (let i = 0; i < nodePositions.length; i++) {
                for (let j = i + 1; j < nodePositions.length; j++) {
                    if (nodePositions[i].distanceTo(nodePositions[j]) < 3.1) {
                        const geo = new THREE.BufferGeometry().setFromPoints([nodePositions[i], nodePositions[j]]);
                        nodeGroup.add(new THREE.Line(geo, lineMat));
                    }
                }
            }

            function makeLabel(text) {
                const c = document.createElement('canvas');
                const ctx2 = c.getContext('2d');
                const fontSize = 34;

                ctx2.font = `500 ${fontSize}px 'JetBrains Mono', monospace`;
                const metrics = ctx2.measureText(text);
                c.width = metrics.width + 32;
                c.height = fontSize + 24;

                ctx2.font = `500 ${fontSize}px 'JetBrains Mono', monospace`;
                ctx2.fillStyle = 'rgba(255, 255, 255, 0.85)';
                ctx2.beginPath();
                ctx2.roundRect(0, 0, c.width, c.height, 10);
                ctx2.fill();

                ctx2.strokeStyle = 'rgba(0, 229, 255, 0.8)';
                ctx2.lineWidth = 2;
                ctx2.beginPath();
                ctx2.roundRect(1, 1, c.width - 2, c.height - 2, 10);
                ctx2.stroke();

                ctx2.fillStyle = '#17317A';
                ctx2.textBaseline = 'middle';
                ctx2.fillText(text, 16, c.height / 2);

                const tex = new THREE.CanvasTexture(c);
                tex.minFilter = THREE.LinearFilter;
                const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
                const sprite = new THREE.Sprite(mat);

                const scale = 0.0085;
                sprite.scale.set(c.width * scale, c.height * scale, 1);
                return sprite;
            }

            nodePositions.forEach((pos, i) => {
                const label = makeLabel(techs[i]);
                label.position.copy(pos.clone().multiplyScalar(1.16));
                nodeGroup.add(label);
            });

            let isDragging = false, prevX = 0, prevY = 0;
            let rotVelX = 0, rotVelY = 0.0016;

            sphereCanvas.addEventListener('pointerdown', (e) => { isDragging = true; prevX = e.clientX; prevY = e.clientY; });
            window.addEventListener('pointerup', () => isDragging = false);
            window.addEventListener('pointermove', (e) => {
                if (!isDragging) return;
                const dx = e.clientX - prevX, dy = e.clientY - prevY;
                group.rotation.y += dx * 0.005;
                group.rotation.x += dy * 0.005;
                rotVelY = dx * 0.0004;
                rotVelX = dy * 0.0004;
                prevX = e.clientX; prevY = e.clientY;
            });

            window.addEventListener('resize', () => {
                if (!sphereWrap) return;
                camera.aspect = sphereWrap.clientWidth / sphereWrap.clientHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(sphereWrap.clientWidth, sphereWrap.clientHeight);
            });

            function animate() {
                sphereAnimId = requestAnimationFrame(animate);
                if (!isDragging) {
                    group.rotation.y += rotVelY;
                    group.rotation.x += rotVelX;
                    rotVelY += (0.0016 - rotVelY) * 0.02;
                    rotVelX += (0 - rotVelX) * 0.02;
                }
                core.rotation.y -= 0.001;
                renderer.render(scene, camera);
            }
            animate();
        }

        /* ================= 3D AI Data Core — Experience Section ================= */
        let expAnimId;
        const expCanvas = document.getElementById('experience-canvas');
        if (expCanvas) {
            const wrap = expCanvas.parentElement;
            const scene = new THREE.Scene();

            const camera = new THREE.PerspectiveCamera(60, wrap.clientWidth / wrap.clientHeight, 0.5, 100);
            camera.position.z = 5.5;

            const renderer = new THREE.WebGLRenderer({ canvas: expCanvas, antialias: true, alpha: true });
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.setSize(wrap.clientWidth, wrap.clientHeight);

            const group = new THREE.Group();
            scene.add(group);

            // Center Object
            const coreGeo = new THREE.OctahedronGeometry(1.0, 0);
            const coreMat = new THREE.MeshBasicMaterial({ color: 0x0e6b52, wireframe: true, transparent: true, opacity: 0.8 });
            const core = new THREE.Mesh(coreGeo, coreMat);
            group.add(core);

            // Wireframe Rings
            const ringGeo1 = new THREE.TorusGeometry(2.2, 0.01, 16, 64);
            const ringMat1 = new THREE.MeshBasicMaterial({ color: 0x0e6b52, transparent: true, opacity: 0.4 });
            const outerRingGroup = new THREE.Mesh(ringGeo1, ringMat1);
            outerRingGroup.rotation.x = Math.PI / 2;
            group.add(outerRingGroup);

            const ringGeo2 = new THREE.TorusGeometry(1.6, 0.02, 16, 64);
            const ringMat2 = new THREE.MeshBasicMaterial({ color: 0x1f3f91, transparent: true, opacity: 0.6 });
            const innerRingGroup = new THREE.Mesh(ringGeo2, ringMat2);
            innerRingGroup.rotation.y = Math.PI / 3;
            group.add(innerRingGroup);

            // Variables to hold our text rings so the animation loop can spin them
            let outerTextRing, innerTextRing;

            // Load Font and Apply 3D Text
            const loader = new FontLoader();
            loader.load('/fonts/Space Grotesk_Light.json', (font) => {

                const createTextRing = (text, radius, color, rotX, rotY) => {
                    const textGroup = new THREE.Group();
                    const chars = text.split('');

                    chars.forEach((char, i) => {
                        const angle = (i / chars.length) * Math.PI * 2;
                        const geo = new TextGeometry(char, {
                            font: font,
                            size: 0.10,
                            depth: 0.03,
                            curveSegments: 2
                        });

                        geo.computeBoundingBox();
                        geo.translate(-0.5 * (geo.boundingBox.max.x - geo.boundingBox.min.x), 0, 0);

                        const mat = new THREE.MeshBasicMaterial({ color: color });
                        const mesh = new THREE.Mesh(geo, mat);

                        // Stand the letter up to face outward (radially)
                        mesh.rotation.x = -Math.PI / 2;

                        // Push it to the edge of the ring
                        mesh.position.y = radius;

                        // Create a pivot in the center to wrap the letters into a perfect circle
                        const pivot = new THREE.Group();
                        pivot.rotation.z = -angle;
                        pivot.add(mesh);

                        textGroup.add(pivot);
                    });

                    // Match the orientation of the physical wireframe rings
                    textGroup.rotation.x = rotX;
                    textGroup.rotation.y = rotY;

                    return textGroup;
                };

                // Create the rings and add them to the main group
                outerTextRing = createTextRing("FROM WHERE TO GET EXPERIENCE • ", 2.8, 0x0e6b52, Math.PI / 2, 0);
                innerTextRing = createTextRing("HOW TO GET EXPERIENCE • ", 1.8, 0x1f3f91, 0, Math.PI / 3);

                group.add(outerTextRing);
                group.add(innerTextRing);
            });

            // Floating Data Particles
            const particlesGeo = new THREE.BufferGeometry();
            const particleCount = 60;
            const posArray = new Float32Array(particleCount * 3);
            for (let i = 0; i < particleCount * 3; i++) {
                posArray[i] = (Math.random() - 0.5) * 8;
            }
            particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
            const particlesMat = new THREE.PointsMaterial({ size: 0.06, color: 0xbf9b30, transparent: true, opacity: 0.6 });
            const particlesMesh = new THREE.Points(particlesGeo, particlesMat);
            group.add(particlesMesh);

            // Drag-to-Rotate Interaction Logic
            let isExpDragging = false, expPrevX = 0, expPrevY = 0;
            let expRotVelX = 0, expRotVelY = 0.0016;

            expCanvas.addEventListener('pointerdown', (e) => {
                isExpDragging = true;
                expPrevX = e.clientX;
                expPrevY = e.clientY;
                expCanvas.style.cursor = 'grabbing';
            });

            expCanvas.addEventListener('pointerover', () => expCanvas.style.cursor = 'grab');

            window.addEventListener('pointerup', () => {
                isExpDragging = false;
                if (expCanvas) expCanvas.style.cursor = 'grab';
            });

            window.addEventListener('pointermove', (e) => {
                if (!isExpDragging) return;
                const dx = e.clientX - expPrevX;
                const dy = e.clientY - expPrevY;

                group.rotation.y += dx * 0.005;
                group.rotation.x += dy * 0.005;

                expRotVelY = dx * 0.0004;
                expRotVelX = dy * 0.0004;

                expPrevX = e.clientX;
                expPrevY = e.clientY;
            });

            // Handle Resize
            window.addEventListener('resize', () => {
                if (!wrap.clientWidth) return;
                camera.aspect = wrap.clientWidth / wrap.clientHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(wrap.clientWidth, wrap.clientHeight);
            });

            // Performance Observer
            let isVisible = false;
            const observer = new IntersectionObserver(entries => {
                isVisible = entries[0].isIntersecting;
            }, { threshold: 0 });
            observer.observe(document.getElementById('experience'));

            // Animation Loop
            function animate() {
                expAnimId = requestAnimationFrame(animate);
                if (!isVisible) return;

                if (!isExpDragging) {
                    group.rotation.y += expRotVelY;
                    group.rotation.x += expRotVelX;

                    expRotVelY += (0.0016 - expRotVelY) * 0.02;
                    expRotVelX += (0 - expRotVelX) * 0.02;
                }

                core.rotation.x -= 0.005;
                core.rotation.y += 0.008;

                outerRingGroup.rotation.z += 0.002;
                innerRingGroup.rotation.z -= 0.003;

                // Animate the text rings safely once they have finished loading
                if (outerTextRing) outerTextRing.rotation.z += 0.002;
                if (innerTextRing) innerTextRing.rotation.z -= 0.003;

                particlesMesh.rotation.y += 0.001;
                particlesMesh.rotation.x += 0.0005;

                group.position.y = Math.sin(Date.now() * 0.0015) * 0.2;

                renderer.render(scene, camera);
            }
            animate();
        }

        /* ================= 3D Scanning Digital Paper ================= */
        let resumeAnimId;
        const resCanvas = document.getElementById('resume-canvas');
        if (resCanvas) {
            const wrap = resCanvas.parentElement;
            const scene = new THREE.Scene();

            const camera = new THREE.PerspectiveCamera(45, wrap.clientWidth / wrap.clientHeight, 0.1, 100);
            camera.position.set(0, 0, 8);

            const renderer = new THREE.WebGLRenderer({ canvas: resCanvas, antialias: true, alpha: true });
            renderer.setSize(wrap.clientWidth, wrap.clientHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

            const group = new THREE.Group();
            scene.add(group);

            const textureLoader = new THREE.TextureLoader();
            textureLoader.load('/cv image.png', (texture) => {

                // 1. The Holographic Paper
                const planeGeo = new THREE.PlaneGeometry(3.5, 4.8);
                const planeMat = new THREE.MeshBasicMaterial({
                    map: texture,
                    transparent: true,
                    opacity: 0.95,
                    blending: THREE.AdditiveBlending,
                    depthWrite: false,
                    side: THREE.DoubleSide
                });
                const paper = new THREE.Mesh(planeGeo, planeMat);
                group.add(paper);

                // 2. Master Laser Group (Parented directly to the paper so it tilts perfectly)
                const laserGroup = new THREE.Group();
                laserGroup.position.z = 0.05; // Hover just above the paper
                paper.add(laserGroup);

                // 3. Stacked Glow Effect (Simulates realistic scanner bloom)

                // Layer A: White-hot core
                const laserCoreGeo = new THREE.PlaneGeometry(3.5, 0.02);
                const laserCoreMat = new THREE.MeshBasicMaterial({
                    color: 0xffffff,
                    transparent: true,
                    opacity: 0.9,
                    blending: THREE.AdditiveBlending
                });
                laserGroup.add(new THREE.Mesh(laserCoreGeo, laserCoreMat));

                // Layer B: Intense inner cyan glow
                const glowInnerGeo = new THREE.PlaneGeometry(3.5, 0.1);
                const glowInnerMat = new THREE.MeshBasicMaterial({
                    color: 0xED3C3F,
                    transparent: true,
                    opacity: 0.3,
                    blending: THREE.AdditiveBlending
                });
                laserGroup.add(new THREE.Mesh(glowInnerGeo, glowInnerMat));



                let laserPos = 2.4;
                let laserDir = -1;

                // Animation Loop
                function animate() {
                    resumeAnimId = requestAnimationFrame(animate);

                    // Smoothly float and tilt the entire hologram
                    // Added +0.35 to permanently tilt the right side forward
                    group.rotation.y = Math.sin(Date.now() * 0.001) * 0.15 + 0.35;

                    // Added +0.15 to permanently tilt the top edge slightly forward
                    group.rotation.x = Math.sin(Date.now() * 0.0008) * 0.1 + 0.15;

                    group.position.y = Math.sin(Date.now() * 0.0015) * 0.15;
                    // Bounce the laser up and down (Speed increased to 0.08)
                    laserPos += 0.14 * laserDir;
                    if (laserPos < -2.4) laserDir = 1;
                    if (laserPos > 2.4) laserDir = -1;
                    laserGroup.position.y = laserPos;

                    renderer.render(scene, camera);
                }
                animate();
            });

            // Handle Resize
            window.addEventListener('resize', () => {
                if (!wrap.clientWidth) return;
                camera.aspect = wrap.clientWidth / wrap.clientHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(wrap.clientWidth, wrap.clientHeight);
            });
        }




        /* ================= Decorative 3D shape — Contact section ================= */
        let contactAnimId;
        const contactCanvas = document.getElementById('contact-3d');
        if (contactCanvas) {
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
            camera.position.z = 7;
            const renderer = new THREE.WebGLRenderer({ canvas: contactCanvas, antialias: true, alpha: true });
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

            function size() {
                const s = contactCanvas.clientWidth || contactCanvas.parentElement.clientWidth;
                renderer.setSize(s, s);
                camera.aspect = 1;
                camera.updateProjectionMatrix();
            }
            size();
            window.addEventListener('resize', size);

            const knotGeo = new THREE.TorusKnotGeometry(1.7, 0.42, 140, 20);
            const knotMat = new THREE.MeshBasicMaterial({ color: 0x0e6b52, wireframe: true, transparent: true, opacity: 0.35 });
            const knot = new THREE.Mesh(knotGeo, knotMat);
            scene.add(knot);

            const innerGeo = new THREE.IcosahedronGeometry(0.9, 0);
            const innerMat = new THREE.MeshBasicMaterial({ color: 0xbf9b30, wireframe: true, transparent: true, opacity: 0.4 });
            const inner = new THREE.Mesh(innerGeo, innerMat);
            scene.add(inner);

            function animateContact() {
                contactAnimId = requestAnimationFrame(animateContact);
                knot.rotation.x += 0.0025;
                knot.rotation.y += 0.0035;
                inner.rotation.x -= 0.004;
                inner.rotation.y -= 0.003;
                renderer.render(scene, camera);
            }
            animateContact();
        }

        // Cleanup on component unmount
        return () => {
            window.removeEventListener('scroll', scrollHandler);
            if (sphereAnimId) cancelAnimationFrame(sphereAnimId);
            if (expAnimId) cancelAnimationFrame(expAnimId);
            if (contactAnimId) cancelAnimationFrame(contactAnimId);
        };
    }, []);

    return (
        <>
            <canvas id="ambient-canvas"></canvas>
            <div className="blob blob-1"></div>
            <div className="blob blob-2"></div>
            <div className="blob blob-3"></div>

            <nav>
                <div className="nav-logo"><span className="dot"></span>PORTFOLIO</div>
                <div className="nav-links">
                    <a href="#hero">Home</a>
                    <a href="#about">About</a>
                    <a href="#experience">Experience</a>
                    <a href="#projects">Projects</a>
                    <a href="#skills">Skills</a>
                    <a href="#resume">Resume</a>
                    <a href="#contact">Contact</a>
                </div>
                {/* ============ HAMBURGER BUTTON ============ */}
                <div
                    id="hamburger"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {/* Simple SVG Hamburger Icon */}
                    <svg viewBox="0 0 24 24" fill="none" stroke="#111816" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                </div>
            </nav>

            <div id="mobile-menu" className={isMenuOpen ? "open" : ""}>
                <a href="#hero" onClick={(e) => handleMobileNavClick(e, 'hero')}>
                    <span className="glass-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg></span>
                    Home
                </a>
                <a href="#about" onClick={(e) => handleMobileNavClick(e, 'about')}>
                    <span className="glass-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg></span>
                    About
                </a>
                <a href="#experience" onClick={(e) => handleMobileNavClick(e, 'experience')}>
                    <span className="glass-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg></span>
                    Experience
                </a>
                <a href="#projects" onClick={(e) => handleMobileNavClick(e, 'projects')}>
                    <span className="glass-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg></span>
                    Projects
                </a>
                <a href="#skills" onClick={(e) => handleMobileNavClick(e, 'skills')}>
                    <span className="glass-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg></span>
                    Skills
                </a>
                <a href="#resume" onClick={(e) => handleMobileNavClick(e, 'resume')}>
                    <span className="glass-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg></span>
                    Resume
                </a>
                <a href="#contact" onClick={(e) => handleMobileNavClick(e, 'contact')}>
                    <span className="glass-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg></span>
                    Contact
                </a>
            </div>

            <div id="rail">
                <div className="rail-node active" data-label="Hero" data-target="hero"></div>
                <div className="rail-line"><div className="rail-fill"></div></div>
                <div className="rail-node" data-label="About" data-target="about"></div>
                <div className="rail-line"><div className="rail-fill"></div></div>
                <div className="rail-node" data-label="Experience" data-target="experience"></div>
                <div className="rail-line"><div className="rail-fill"></div></div>
                <div className="rail-node" data-label="Projects" data-target="projects"></div>
                <div className="rail-line"><div className="rail-fill"></div></div>
                <div className="rail-node" data-label="Skills" data-target="skills"></div>
                <div className="rail-line"><div className="rail-fill"></div></div>
                <div className="rail-node" data-label="Resume" data-target="resume"></div>
                <div className="rail-line"><div className="rail-fill"></div></div>
                <div className="rail-node" data-label="Contact" data-target="contact"></div>
            </div>
            {/* ============ HERO ============ */}
            <section id="hero">
                <div className="hero-grid">
                    <div>
                        <div className="hero-eyebrow"><span className="pulse"></span> SOFTWARE ENGINEER</div>

                        <h1 className="hero-name">Saqib<br />Shahab</h1>
                        <div className="morph-row">I'm <span id="morph-text"></span></div>
                        <p className="hero-desc">Designing and deploying intelligent systems — AI agents, automation pipelines, and
                            full-stack products that solve real problems.</p>
                        <div className="hero-cta">
                            <a href="#projects" className="btn btn-primary">View Projects →</a>
                            <a href="mailto:saqibshahab46@gmail.com" className="btn btn-ghost">Get In Touch</a>
                        </div>
                        <div className="hero-stats">
                            <div className="hero-stat"><b>4+</b><span>Shipped Projects</span></div>
                            <div className="hero-stat"><b>20+</b><span>Technologies</span></div>
                            <div className="hero-stat"><b>NASTP</b><span>AI Trainee</span></div>
                        </div>
                    </div>
                    <div id="sphere-wrap">
                        <canvas id="sphere-canvas"></canvas>
                        <div className="sphere-hint">// drag to rotate the stack</div>
                    </div>
                </div>
            </section>

            {/* ============ ABOUT ============ */}
            <section id="about">
                <div className="eyebrow">01 · About</div>
                <h2 className="section-title reveal">Systems that think, and interfaces people enjoy using.</h2>
                <div className="about-grid">
                    <div className="about-side reveal">
                        <div className="photo-stage" id="photo-stage">
                            <div className="photo-glow"></div>
                            <div className="photo-ring"></div>
                            <div className="orbit-dots">
                                <span className="orbit-dot orbit-dot-1"></span>
                                <span className="orbit-dot orbit-dot-2"></span>
                            </div>
                            <div className="photo-frame" id="photo-frame">
                                <img src="/profile.jpeg" alt="Saqib Shahab" />
                            </div>
                            <div className="photo-badge"><span className="dot"></span>Available for collab</div>
                        </div>
                    </div>

                    <div className="about-text reveal">
                        <p><b><h1>Hi there,</h1></b>Myself <b>Saqib</b>.I'm a <b>Software Engineer</b>, worked as an <b>AI Trainee at NASTP,
                            Rawalpindi</b>, and previously
                            interned at <b>OraDigitals</b> building React.js interfaces.</p>
                        <p>Currently I'm building and exploring <b>DonutDoc</b> — a structured document generation system that helps
                            organizations turn raw, unstructured data into clean output using the DONUT vision-language model.
                            Alongside that, I'm deeply invested in <b>deep learning and agentic automation</b>, and always looking to
                            collaborate on open-source developer tools.</p>
                        <p>Ask me about: <b>Automation, n8n, React, Node.js, and AI Agents.</b>
                            <br /> Fun fact — I have a real weakness for
                            building interactive, attention-holding websites (this one included).
                        </p>
                        <div className="tag-row">
                            <span className="tag">#AI-Engineering</span>
                            <span className="tag">#Agentic-Automation</span>
                            <span className="tag">#Full-Stack</span>
                            <span className="tag">#Open-Source</span>
                            <span className="tag">#n8n</span>
                        </div>
                        <br />

                        <div className="about-glass-card">

                            {/* LOCATION ROW */}
                            <div className="info-row">
                                <div className="info-label">
                                    <img src="/location.webp" alt="Location" className="animated-icon" />
                                    <span>LOCATION</span>
                                </div>
                                <div className="info-value">Lahore, Pakistan</div>
                            </div>

                            <div className="row-divider"></div>

                            {/* EDUCATION ROW */}
                            <div className="info-row">
                                <div className="info-label">
                                    <img src="/education.webp" alt="Education" className="animated-icon" />
                                    <span>EDUCATION</span>
                                </div>
                                <div className="info-value">BS Software Engineering, UET Taxila (2026)</div>
                            </div>

                            <div className="row-divider"></div>

                            {/* CURRENT ROLE ROW */}
                            <div className="info-row">
                                <div className="info-label">
                                    <img src="/current-role.webp" alt="Current Role" className="animated-icon" />
                                    <span>CURRENT ROLE</span>
                                </div>
                                <div className="info-value">AI/ML Engineer</div>
                            </div>

                            <div className="row-divider"></div>

                            {/* BUILDING ROW */}
                            <div className="info-row">
                                <div className="info-label">
                                    <img src="/building.webp" alt="Building" className="animated-icon" />
                                    <span>BUILDING</span>
                                </div>
                                <div className="info-value">LLMs, AI Agents, Automations, Full-stack AI systems</div>
                            </div>

                            <div className="row-divider"></div>

                            {/* LEARNING ROW */}
                            <div className="info-row">
                                <div className="info-label">
                                    <img src="/learning.webp" alt="Learning" className="animated-icon" />
                                    <span>LEARNING</span>
                                </div>
                                <div className="info-value">Deep Learning · Agentic Automation</div>
                            </div>

                            <div className="row-divider"></div>

                            {/* PRONOUNS ROW */}
                            <div className="info-row">
                                <div className="info-label">
                                    <img src="/pronoun.webp" alt="Pronouns" className="animated-icon" />
                                    <span>PRONOUNS</span>
                                </div>
                                <div className="info-value">He / His</div>
                            </div>

                        </div>
                    </div>
                </div>
            </section>

            {/* ============ EXPERIENCE ============ */}
            <section id="experience">
                <div className="eyebrow">02 · Experience</div>
                <h2 className="section-title reveal">A short, dense timeline.</h2>
                <p className="section-sub reveal">From coursework to production systems — the path so far.</p>

                <div className="experience-grid">
                    <div className="timeline">
                        <div className="tl-item reveal">
                            <div className="tl-date">2025 — June 2026</div>
                            <div className="tl-title">AI Trainee</div>
                            <div className="tl-org">NASTP, Rawalpindi</div>
                            <div className="tl-desc">Designing and deploying intelligent systems — from agentic workflows to applied ML pipelines — inside Pakistan's National Aerospace Science & Technology Park.</div>
                        </div>
                        <div className="tl-item reveal">
                            <div className="tl-date">2024</div>
                            <div className="tl-title">React.js Intern</div>
                            <div className="tl-org">OraDigitals</div>
                            <div className="tl-desc">Built and shipped production React.js interfaces as part of a client-facing development team.</div>
                        </div>
                        <div className="tl-item reveal">
                            <div className="tl-date">2022 — 2026</div>
                            <div className="tl-title">BS Software Engineering</div>
                            <div className="tl-org">University of Engineering & Technology, Taxila</div>
                            <div className="tl-desc">Final-year project: DonutDoc, an AI structured-document generation system built on the DONUT model. Coursework spanning AI, HCI, distributed cloud computing, and embedded systems.</div>
                        </div>
                    </div>

                    <div className="experience-3d-wrap reveal">
                        <canvas id="experience-canvas"></canvas>
                    </div>
                </div>
            </section>

            {/* ============ PROJECTS ============ */}
            <section id="projects">
                <div className="eyebrow">03 · Projects</div>
                <h2 className="section-title reveal">Things I've shipped.</h2>
                <p className="section-sub reveal">Four systems, four different problems — a document intelligence engine, an AI booking agent, a computer-vision attendance system, a research-paper summarizer.</p>
                <div className="project-grid">

                    <div className="pcard reveal" onClick={() => setIsGalleryOpen(true)} style={{ cursor: 'pointer' }}>

                        {/* 1. The 3D Prism Background Layer */}
                        <div className="prism-bg">
                            <Prism
                                animationType="3drotate"
                                timeScale={0.7}          /* Lowered to make the movement silky and elegant */
                                height={3.5}
                                baseWidth={5.5}
                                scale={3.6}
                                hueShift={0}             /* Set to 0 so the custom royal colors stay pure */
                                colorFrequency={0.5}     /* Lowered to make color transitions wider and smoother */
                                noise={0.05}             /* Reduced noise for a cleaner glass look */
                                glow={2.0}               /* Maintains a bright, premium glow */
                                suspendWhenOffscreen={true}
                            />
                        </div>

                        {/* 2. Your Existing Content Wrapper */}
                        <div className="pcard-content">
                            <div className="pcard-top">
                                <span className="pcard-num">01</span>
                                <span className="pcard-icon">🍩</span>
                            </div>
                            <span className="ptag">Final Year Project · Vision-Language · IDP</span>
                            <h3>DonutDoc</h3>
                            <p className="desc">An AI-based structured document generation system that helps organizations convert raw, manual, unstructured records into clean, structured output — built around the DONUT vision-language model.</p>
                            <ul>
                                <li>Fine-tuned DONUT model reaching a 0.19 training loss</li>
                                <li>Targets manual/unstructured business documents at scale</li>
                                <li>Currently in active development as my final-year project</li>
                            </ul>
                            <div className="stack-chips">
                                <span className="chip"><i className="devicon-python-plain colored"></i>Python</span>
                                <span className="chip">🌀 Swin Encoder</span>
                                <span className="chip">📝 BART Decoder</span>
                                <span className="chip"><i className="devicon-pytorch-original colored"></i>PyTorch</span>
                                <span className="chip">🍩 DONUT</span>
                                <span className="chip">👁️ Computer Vision</span>
                                <span className="chip">🔤 NLP</span>
                                <span className="chip">⚡ FastAPI</span>
                            </div>

                        </div>

                    </div>

                    <div className="pcard reveal" onClick={() => setIsGalleryOpen(true)} style={{ cursor: 'pointer' }}>

                        {/* 1. The 3D Prism Background Layer */}
                        <div className="prism-bg">
                            <Prism
                                animationType="3drotate"
                                timeScale={0.7}          /* Lowered to make the movement silky and elegant */
                                height={3.5}
                                baseWidth={5.5}
                                scale={3.6}
                                hueShift={0}             /* Set to 0 so the custom royal colors stay pure */
                                colorFrequency={0.5}     /* Lowered to make color transitions wider and smoother */
                                noise={0.05}             /* Reduced noise for a cleaner glass look */
                                glow={2.0}               /* Maintains a bright, premium glow */
                                suspendWhenOffscreen={true}
                            />
                        </div>
                        {/* 2. Your Existing Content Wrapper */}
                        <div className="pcard-content">
                            <div className="pcard-top"><span className="pcard-num">02</span><span className="pcard-icon">🚗</span></div>
                            <span className="ptag">Agentic AI · SaaS</span>
                            <h3>Apex Auto Works</h3>
                            <p className="desc">A full-stack SaaS booking platform for automotive workshops. A production-grade AI agent holds human-like, multi-turn conversations to book appointments — grounded in workshop knowledge via RAG, with zero hallucinated double-bookings.</p>
                            <ul>
                                <li>LangChain + Groq (LLaMA-3.3-70B) for autonomous, stateful negotiation</li>
                                <li>MongoDB Atlas Vector Search + HuggingFace embeddings for RAG</li>
                                <li>JWT auth, bcrypt hashing, automated Nodemailer confirmations</li>
                            </ul>
                            <div className="stack-chips">
                                <span className="chip"><i className="devicon-react-original colored"></i>React.js</span>
                                <span className="chip"><i className="devicon-nodejs-plain colored"></i>Node</span>
                                <span className="chip">🦜 LangChain</span>
                                <span className="chip">⚡ Groq</span>
                                <span className="chip"><i className="devicon-mongodb-plain colored"></i>MongoDB</span>
                                <span className="chip">🔗 n8n</span>
                            </div>
                            <div className="pcard-links">
                                <a href="https://github.com/saqibshahab46-star/apex-auto-works" target="_blank" rel="noopener noreferrer">GitHub ↗</a>
                            </div>
                        </div>
                    </div>

                    <div className="pcard reveal" onClick={() => setIsGalleryOpen(true)} style={{ cursor: 'pointer' }}>

                        {/* 1. The 3D Prism Background Layer */}
                        <div className="prism-bg">
                            <Prism
                                animationType="3drotate"
                                timeScale={0.7}          /* Lowered to make the movement silky and elegant */
                                height={3.5}
                                baseWidth={5.5}
                                scale={3.6}
                                hueShift={0}             /* Set to 0 so the custom royal colors stay pure */
                                colorFrequency={0.5}     /* Lowered to make color transitions wider and smoother */
                                noise={0.05}             /* Reduced noise for a cleaner glass look */
                                glow={2.0}               /* Maintains a bright, premium glow */
                                suspendWhenOffscreen={true}
                            />
                        </div>
                        <div className="pcard-content">
                            <div className="pcard-top"><span className="pcard-num">03</span><span className="pcard-icon">📷</span></div>
                            <span className="ptag">Computer Vision</span>
                            <h3>AMS Pro</h3>
                            <p className="desc">A production attendance management system using real-time facial recognition. Replaces manual roll-calls with a webcam-driven pipeline — enroll a face once, and attendance logs itself from then on.</p>
                            <ul>
                                <li>OpenCV LBPH face recognition trained per-student</li>
                                <li>MongoDB Atlas + Cloudinary for student records & images</li>
                                <li>CI/CD to Render — push to main, both services redeploy</li>
                            </ul>
                            <div className="stack-chips">
                                <span className="chip"><i className="devicon-react-original colored"></i>React</span>
                                <span className="chip"><i className="devicon-flask-original colored"></i>Flask</span>
                                <span className="chip"><i className="devicon-opencv-plain colored"></i>OpenCV</span>
                                <span className="chip"><i className="devicon-mongodb-plain colored"></i>MongoDB</span>
                                <span className="chip">☁️ Cloudinary</span>
                            </div>
                            <div className="pcard-links">

                                <a href="https://github.com/saqibshahab46-star/AMS-PRO-Facial-Recognition-Attendance-System-" target="_blank" rel="noopener noreferrer">GitHub ↗</a>
                            </div>
                        </div>
                    </div>

                    <div className="pcard reveal" onClick={() => setIsGalleryOpen(true)} style={{ cursor: 'pointer' }}>

                        {/* 1. The 3D Prism Background Layer */}
                        <div className="prism-bg">
                            <Prism
                                animationType="3drotate"
                                timeScale={0.7}          /* Lowered to make the movement silky and elegant */
                                height={3.5}
                                baseWidth={5.5}
                                scale={3.6}
                                hueShift={0}             /* Set to 0 so the custom royal colors stay pure */
                                colorFrequency={0.5}     /* Lowered to make color transitions wider and smoother */
                                noise={0.05}             /* Reduced noise for a cleaner glass look */
                                glow={2.0}               /* Maintains a bright, premium glow */
                                suspendWhenOffscreen={true}
                            />
                        </div>
                        <div className="pcard-content">
                            <div className="pcard-top"><span className="pcard-num">04</span><span className="pcard-icon">📄</span></div>
                            <span className="ptag">LLM Pipeline · Research Tool</span>
                            <h3>ResumAgent</h3>
                            <p className="desc">An intelligent academic paper summarizing <b>Agent</b> that turns a 30-minute read into a 60-second one. A 5-step agentic pipeline extracts, cleans, and reasons over a paper before rendering it as structured, glassmorphic cards.</p>
                            <ul>
                                <li>Gemini 1.5 Flash at temperature 0.3, strict JSON-schema output</li>
                                <li>PyPDF2 extraction with reference-section stripping (~20-30% token savings)</li>
                                <li>FastAPI backend, React + Vite frontend, dark glassmorphism UI</li>
                            </ul>
                            <div className="stack-chips">
                                <span className="chip">⚡ FastAPI</span>
                                <span className="chip"><i className="devicon-react-original colored"></i>React</span>
                                <span className="chip">✨ Gemini 1.5</span>
                                <span className="chip">📚 PyPDF2</span>
                            </div>
                            <div className="pcard-links">
                                <a href="https://github.com/saqibshahab46-star/ResumAgent" target="_blank" rel="noopener noreferrer">GitHub ↗</a>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* ============ SKILLS ============ */}
            <section id="skills">
                <div className="eyebrow">04 · Skills</div>
                <h2 className="section-title reveal">The toolbox.</h2>
                <p className="section-sub reveal">Everything orbiting the sphere above, organized.</p>

                <div className="skills-grid">
                    <div className="skill-block reveal">
                        <h4>Languages</h4>
                        <div className="skill-chip-row">
                            <span className="chip"><i className="devicon-python-plain colored"></i>Python</span>
                            <span className="chip"><i className="devicon-javascript-plain colored"></i>JavaScript</span>
                            <span className="chip"><i className="devicon-typescript-plain colored"></i>TypeScript</span>
                            <span className="chip"><i className="devicon-cplusplus-plain colored"></i>C++</span>
                            <span className="chip"><i className="devicon-mysql-plain colored"></i>SQL</span>
                        </div>
                    </div>
                    <div className="skill-block reveal">
                        <h4>AI / Machine Learning</h4>
                        <div className="skill-chip-row">
                            <span className="chip"><i className="devicon-pytorch-original colored"></i>PyTorch</span>
                            <span className="chip"><i className="devicon-tensorflow-original colored"></i>TensorFlow</span>
                            <span className="chip">🦜 LangChain</span>
                            <span className="chip"><i className="devicon-opencv-plain colored"></i>OpenCV</span>
                            <span className="chip">✨ Gemini API</span>
                        </div>
                    </div>
                    <div className="skill-block reveal">
                        <h4>Frontend</h4>
                        <div className="skill-chip-row">
                            <span className="chip"><i className="devicon-react-original colored"></i>React</span>
                            <span className="chip"><i className="devicon-nextjs-original"></i>Next.js</span>
                            <span className="chip"><i className="devicon-tailwindcss-plain colored"></i>Tailwind CSS</span>
                            <span className="chip"><i className="devicon-html5-plain colored"></i>HTML5 / CSS3</span>
                        </div>
                    </div>
                    <div className="skill-block reveal">
                        <h4>Backend</h4>
                        <div className="skill-chip-row">
                            <span className="chip"><i className="devicon-nodejs-plain colored"></i>Node.js</span>
                            <span className="chip"><i className="devicon-express-original"></i>Express</span>
                            <span className="chip"><i className="devicon-flask-original colored"></i>Flask</span>
                            <span className="chip">⚡ FastAPI</span>
                            <span className="chip"><i className="devicon-django-plain colored"></i>Django</span>
                        </div>
                    </div>
                    <div className="skill-block reveal">
                        <h4>Data & Cloud</h4>
                        <div className="skill-chip-row">
                            <span className="chip"><i className="devicon-mongodb-plain colored"></i>MongoDB</span>
                            <span className="chip"><i className="devicon-postgresql-plain colored"></i>PostgreSQL</span>
                            <span className="chip"><i className="devicon-amazonwebservices-plain-wordmark colored"></i>AWS</span>
                            <span className="chip"><i className="devicon-docker-plain colored"></i>Docker</span>
                            <span className="chip"><i className="devicon-firebase-plain colored"></i>Firebase</span>
                        </div>
                    </div>
                    <div className="skill-block reveal">
                        <h4>Tools & Automation</h4>
                        <div className="skill-chip-row">
                            <span className="chip">🔗 n8n</span>
                            <span className="chip"><i className="devicon-git-plain colored"></i>Git</span>
                            <span className="chip"><i className="devicon-github-original"></i>GitHub</span>
                            <span className="chip"><i className="devicon-postman-plain colored"></i>Postman</span>
                            <span className="chip"><i className="devicon-figma-plain colored"></i>Figma</span>
                        </div>
                    </div>
                </div>

                {/* 2D Animated Skills Marquee */}
                <div className="skills-marquee-wrapper reveal">
                    <div className="marquee-track track-right">
                        <div className="marquee-content">
                            <i className="devicon-python-plain colored"></i>
                            <i className="devicon-javascript-plain colored"></i>
                            <i className="devicon-typescript-plain colored"></i>
                            <i className="devicon-react-original colored"></i>
                            <i className="devicon-nodejs-plain colored"></i>
                            <i className="devicon-nextjs-original colored"></i>
                            <i className="devicon-html5-plain colored"></i>
                            <i className="devicon-css3-plain colored"></i>
                            <i className="devicon-tailwindcss-plain colored"></i>
                            <i className="devicon-cplusplus-plain colored"></i>
                            <i className="devicon-flutter-plain colored"></i>
                            <i className="devicon-dart-plain colored"></i>
                        </div>
                        <div className="marquee-content">
                            <i className="devicon-python-plain colored"></i>
                            <i className="devicon-javascript-plain colored"></i>
                            <i className="devicon-typescript-plain colored"></i>
                            <i className="devicon-react-original colored"></i>
                            <i className="devicon-nodejs-plain colored"></i>
                            <i className="devicon-nextjs-original colored"></i>
                            <i className="devicon-html5-plain colored"></i>
                            <i className="devicon-css3-plain colored"></i>
                            <i className="devicon-tailwindcss-plain colored"></i>
                            <i className="devicon-cplusplus-plain colored"></i>
                            <i className="devicon-flutter-plain colored"></i>
                            <i className="devicon-dart-plain colored"></i>
                        </div>
                    </div>

                    <div className="marquee-track track-left">
                        <div className="marquee-content">
                            <i className="devicon-pytorch-original colored"></i>
                            <i className="devicon-tensorflow-original colored"></i>
                            <i className="devicon-opencv-plain colored"></i>
                            <i className="devicon-flask-original colored"></i>
                            <i className="devicon-django-plain colored"></i>
                            <i className="devicon-amazonwebservices-plain-wordmark colored"></i>
                            <i className="devicon-docker-plain colored"></i>
                            <i className="devicon-git-plain colored"></i>
                            <i className="devicon-github-original colored"></i>
                            <i className="devicon-figma-plain colored"></i>
                            <i className="devicon-mongodb-plain colored"></i>
                            <i className="devicon-postgresql-plain colored"></i>
                        </div>
                        <div className="marquee-content">
                            <i className="devicon-pytorch-original colored"></i>
                            <i className="devicon-tensorflow-original colored"></i>
                            <i className="devicon-opencv-plain colored"></i>
                            <i className="devicon-flask-original colored"></i>
                            <i className="devicon-django-plain colored"></i>
                            <i className="devicon-amazonwebservices-plain-wordmark colored"></i>
                            <i className="devicon-docker-plain colored"></i>
                            <i className="devicon-git-plain colored"></i>
                            <i className="devicon-github-original colored"></i>
                            <i className="devicon-figma-plain colored"></i>
                            <i className="devicon-mongodb-plain colored"></i>
                            <i className="devicon-postgresql-plain colored"></i>
                        </div>
                    </div>

                    <div className="marquee-track track-right-fast">
                        <div className="marquee-content">
                            <i className="devicon-firebase-plain colored"></i>
                            <i className="devicon-python-plain colored"></i>
                            <i className="devicon-react-original colored"></i>
                            <i className="devicon-flutter-plain colored"></i>
                            <i className="devicon-nodejs-plain colored"></i>
                            <i className="devicon-docker-plain colored"></i>
                            <i className="devicon-dart-plain colored"></i>
                            <i className="devicon-typescript-plain colored"></i>
                            <i className="devicon-pytorch-original colored"></i>
                            <i className="devicon-amazonwebservices-plain-wordmark colored"></i>
                            <i className="devicon-mongodb-plain colored"></i>
                            <i className="devicon-git-plain colored"></i>
                        </div>
                        <div className="marquee-content">
                            <i className="devicon-firebase-plain colored"></i>
                            <i className="devicon-python-plain colored"></i>
                            <i className="devicon-react-original colored"></i>
                            <i className="devicon-flutter-plain colored"></i>
                            <i className="devicon-nodejs-plain colored"></i>
                            <i className="devicon-docker-plain colored"></i>
                            <i className="devicon-dart-plain colored"></i>
                            <i className="devicon-typescript-plain colored"></i>
                            <i className="devicon-pytorch-original colored"></i>
                            <i className="devicon-amazonwebservices-plain-wordmark colored"></i>
                            <i className="devicon-mongodb-plain colored"></i>
                            <i className="devicon-git-plain colored"></i>
                        </div>
                    </div>
                </div>
            </section>

            {/* ============ RESUME ============ */}
            <section id="resume">
                <div className="eyebrow">05 · Resume</div>
                {/* Add the 3D wrapper here */}
                <div className="resume-3d-wrap">
                    <canvas id="resume-canvas"></canvas>
                </div>
                <h2 className="section-title reveal">Paperwork, formalized.</h2>
                <p className="section-sub reveal">A comprehensive overview of my academic background, technical skills, and professional experience.</p>

                <div className="resume-container reveal">
                    <div className="resume-card">

                        <div className="resume-visual">
                            <div className="resume-glow"></div>
                            {/* SVG Document Icon */}
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                                <polyline points="10 9 9 9 8 9"></polyline>
                            </svg>
                            <span className="resume-name">Saqib_Shahab_Resume.pdf</span>
                        </div>

                        <div className="resume-info">
                            <h3>Curriculum Vitae</h3>
                            <p>Available in PDF format for easy sharing, printing, or integration into ATS systems.</p>
                            <div className="resume-actions">
                                <a href="/resume.pdf" target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                                    Preview Resume ↗
                                </a>
                                <a href="/resume.pdf" download="Saqib_Shahab_Resume.pdf" className="btn btn-ghost">
                                    Download PDF ↓
                                </a>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* ============ CONTACT ============ */}
            <section id="contact">
                <canvas id="contact-3d"></canvas>
                <div className="eyebrow" >06 · Contact</div>
                <h2 className="contact-title reveal">Let's build<br />something intelligent.</h2>
                <a href="mailto:saqibshahab46@gmail.com" className="contact-email reveal">saqibshahab46@gmail.com</a>

                <div className="social-row reveal">
                    <a className="social-pill" href="https://www.linkedin.com/in/saqib-shahab-3b94a928a" target="_blank" rel="noopener noreferrer"><i className="devicon-linkedin-plain colored"></i>LinkedIn</a>
                    <a className="social-pill" href="https://github.com/saqibshahab46-star" target="_blank" rel="noopener noreferrer"><i className="devicon-github-original"></i>GitHub</a>
                    <a className="social-pill" href="https://instagram.com/btw_its__saqib" target="_blank" rel="noopener noreferrer">📷 Instagram</a>
                    <a className="social-pill" href="https://x.com/shaqib46" target="_blank" rel="noopener noreferrer">✕ X / Twitter</a>
                    <a className="social-pill" href="https://tiktok.com/@saqibshahab46" target="_blank" rel="noopener noreferrer">🎵 TikTok</a>
                    <a className="social-pill" href="https://youtube.com/@saqibshahab2283" target="_blank" rel="noopener noreferrer">▶️ YouTube</a>
                </div>
            </section>

            <footer>
                <span>© Saqib Shahab — Built with curiosity,</span>
                <span>Three.js · Devicon · React</span>
            </footer>

            {/* ============ PROJECT GALLERY MODAL ============ */}
            {isGalleryOpen && (
                <div className="gallery-modal-overlay">
                    <div className="gallery-modal-content">
                        <button
                            className="gallery-close-btn"
                            onClick={() => setIsGalleryOpen(false)}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>

                        {/* 3D Slideshow Component */}
                        <div style={{ width: '100vw', height: '100vh' }}>
                            <Smooth3DSlideshow />
                        </div>
                    </div>
                </div>
            )}

            {/* ============ NEW MAGNETIC DOCK ============ */}
            <MagneticDock />

        </>
    );
}

export default App;