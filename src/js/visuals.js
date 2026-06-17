// ============================================
// CHEATCODE — visuals.js
// Complete Visual Engine — upgraded quality.
// Same imports, same exports. Drop-in replacement.
// ============================================

import * as THREE from 'three';
import { enterFullPageVisual } from './visuals/full-page-visual.js';

let threeInstances = {};

// ============================================
// VALIDATION
// ============================================

function validateVisualHTML(html) {
    if (!html || typeof html !== 'string') return false;
    if (html.length < 100) return false;
    if (!html.includes('<html') && !html.includes('<body') &&
        !html.includes('<canvas') && !html.includes('<svg') &&
        !html.includes('<script')) return false;
    return true;
}

// ============================================
// AI-GENERATED HTML VISUAL
// ============================================

function extractVisualFromResponse(content) {
    if (!content) return null;
    const match = content.match(/```html\s*([\s\S]*?)```/);
    if (match && match[1].trim().length > 100) return { htmlCode: match[1].trim() };
    const rawMatch = content.match(/<!DOCTYPE html[\s\S]*?<\/html>/i);
    if (rawMatch) return { htmlCode: rawMatch[0].trim() };
    return null;
}

function showVisualPanel(containerId, options = {}) {
    const { htmlCode, type, params, fullPage = false } = options;
    const container = document.getElementById(containerId);
    if (!container) return;

    // AI-generated HTML visual
    if (htmlCode && validateVisualHTML(htmlCode)) {
        if (fullPage) {
            enterFullPageVisual(htmlCode, containerId);
            return;
        }
        container.style.display = 'block';
        container.innerHTML = `
            <div style="border-top:2px solid var(--gold, #d4a000);background:var(--surface,#0d0d1a);border-radius:0 0 10px 10px;">
                <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 16px;background:var(--elevated,#121225);">
                    <span style="color:var(--gold,#d4a000);font-size:11px;font-weight:600;">Interactive Visual</span>
                    <div style="display:flex;gap:6px;">
                        <button class="btn btn-sm btn-secondary" id="closeVis" style="font-size:10px;">Close</button>
                        <button class="btn btn-sm btn-secondary" id="fullVis" style="font-size:10px;">Fullscreen</button>
                        <button class="btn btn-sm btn-primary" id="downloadVis" style="font-size:10px;">Download</button>
                    </div>
                </div>
                <iframe id="visFrame" sandbox="allow-scripts allow-same-origin"
                    style="width:100%;height:480px;border:none;background:#fff;border-radius:0 0 10px 10px;"></iframe>
            </div>`;

        document.getElementById('closeVis')?.addEventListener('click', () => {
            container.style.display = 'none';
        });
        document.getElementById('fullVis')?.addEventListener('click', () => {
            const w = window.open('', '_blank', 'width=1400,height=900,left=60,top=60');
            if (w) { w.document.write(htmlCode); w.document.close(); }
        });
        document.getElementById('downloadVis')?.addEventListener('click', () => {
            const blob = new Blob([htmlCode], { type: 'text/html' });
            const url  = URL.createObjectURL(blob);
            const a    = document.createElement('a');
            a.href = url;
            a.download = `cheatcode-visual-${Date.now()}.html`;
            a.click();
            URL.revokeObjectURL(url);
        });

        const frame = document.getElementById('visFrame');
        if (frame) {
            const doc = frame.contentDocument || (frame.contentWindow && frame.contentWindow.document);
            if (doc) { doc.open(); doc.write(htmlCode); doc.close(); }
        }
        return;
    }

    // 3D Scene
    if (type) {
        container.style.display = 'block';
        container.innerHTML = `
            <div style="border-top:2px solid var(--gold,#d4a000);background:var(--surface,#0d0d1a);">
                <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 16px;background:var(--elevated,#121225);">
                    <span style="color:var(--text,#e8e8f0);font-size:11px;">3D Model — Drag to rotate · Scroll to zoom</span>
                    <div style="display:flex;gap:6px;">
                        <button class="btn btn-sm btn-secondary" id="resetCamBtn" style="font-size:10px;">Reset View</button>
                        <button class="btn btn-sm btn-secondary" id="closeVis" style="font-size:10px;">Close</button>
                    </div>
                </div>
                <div id="vis3dContent" style="height:480px;position:relative;"></div>
            </div>`;

        document.getElementById('closeVis')?.addEventListener('click', () => {
            container.style.display = 'none';
            cleanup3D('vis3dContent');
        });

        document.getElementById('resetCamBtn')?.addEventListener('click', () => {
            const inst = threeInstances['vis3dContent'];
            if (inst && inst.camera) {
                inst.camera.position.set(6, 4, 8);
                inst.camera.lookAt(0, 0, 0);
                if (inst.controls && inst.controls.reset) { inst.controls.reset(); }
            }
        });

        render3DScene('vis3dContent', { type, params });
        return;
    }

    container.style.display = 'none';
}

// ============================================
// 2D GRAPH (Chart.js)
// ============================================

function render2DGraph(containerId, config) {
    const container = document.getElementById(containerId);
    if (!container || typeof Chart === 'undefined') return null;

    container.innerHTML = '<canvas id="gcCanvas" style="max-height:400px;"></canvas>';
    const canvas = document.getElementById('gcCanvas');
    if (!canvas) return null;

    const goldPalette = [
        '#d4a000', '#00c897', '#ff4757', '#3b82f6', '#a855f7', '#f59e0b',
    ];

    const datasets = config.datasets || [{
        label:           config.label || 'Value',
        data:            config.data || config.yValues || [],
        borderColor:     goldPalette[0],
        backgroundColor: 'rgba(212,160,0,0.1)',
        borderWidth:     2.5,
        pointRadius:     0,
        tension:         0.3,
        fill:            true,
    }];

    return new Chart(canvas.getContext('2d'), {
        type: config.chartType || 'line',
        data: { labels: config.labels || config.xValues || [], datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 400, easing: 'easeOutQuart' },
            plugins: {
                title: {
                    display: !!config.title,
                    text: config.title || '',
                    color: '#e8e8f0',
                    font: { family: 'Times New Roman, Georgia, serif', size: 14, weight: 'bold' },
                    padding: { bottom: 12 },
                },
                legend: {
                    labels: { color: '#9898b8', font: { size: 11 }, boxWidth: 12 },
                },
                tooltip: {
                    backgroundColor: '#0d0d1a',
                    borderColor: 'rgba(212,160,0,0.3)',
                    borderWidth: 1,
                    titleColor: '#d4a000',
                    bodyColor: '#e8e8f0',
                    padding: 10,
                },
            },
            scales: {
                x: {
                    ticks: { color: '#606080', font: { size: 11 } },
                    grid:  { color: 'rgba(255,255,255,0.04)' },
                    border: { color: 'rgba(255,255,255,0.08)' },
                },
                y: {
                    ticks: { color: '#606080', font: { size: 11 } },
                    grid:  { color: 'rgba(255,255,255,0.04)' },
                    border: { color: 'rgba(255,255,255,0.08)' },
                },
            },
        },
    });
}

// ============================================
// 3D SCENE RENDERER — upgraded quality
// ============================================

async function render3DScene(containerId, config) {
    const container = document.getElementById(containerId);
    if (!container) return null;

    cleanup3D(containerId);

    container.innerHTML = '';
    const width  = container.clientWidth  || 640;
    const height = container.clientHeight || 480;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x07070f);
    scene.fog = new THREE.FogExp2(0x07070f, 0.035);

    // Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.05, 200);
    camera.position.set(7, 5, 9);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // Lighting — upgraded
    const ambient = new THREE.AmbientLight(0x203060, 1.8);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(8, 12, 8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize = { width: 2048, height: 2048 };
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 50;
    keyLight.shadow.bias = -0.001;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xd4a000, 0.6);
    fillLight.position.set(-6, 4, -4);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0x4488ff, 0.8, 20);
    rimLight.position.set(-4, 8, -6);
    scene.add(rimLight);

    // Grid — subtle
    const gridHelper = new THREE.GridHelper(16, 16, 0x1a1a30, 0x111120);
    scene.add(gridHelper);

    // Build model
    const model = buildModel(config);
    model.traverse(function(obj) {
        if (obj.isMesh) {
            obj.castShadow = true;
            obj.receiveShadow = true;
        }
    });
    scene.add(model);

    // Orbit controls
    let controls = null;
    try {
        const module = await import('three/examples/jsm/controls/OrbitControls.js');
        const OrbitControls = module.OrbitControls;
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping  = true;
        controls.dampingFactor  = 0.06;
        controls.minDistance    = 2;
        controls.maxDistance    = 40;
        controls.maxPolarAngle  = Math.PI * 0.85;
        controls.autoRotate     = true;
        controls.autoRotateSpeed = 0.5;
        renderer.domElement.addEventListener('pointerdown', function() { controls.autoRotate = false; });
    } catch(e) {}

    threeInstances[containerId] = { scene, camera, renderer, model, controls };

    // Resize observer
    const ro = new ResizeObserver(function(entries) {
        for (var i = 0; i < entries.length; i++) {
            var entry = entries[i];
            var w = entry.contentRect.width;
            var h = entry.contentRect.height || 480;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        }
    });
    ro.observe(container);
    threeInstances[containerId].ro = ro;

    // Animate
    var animId;
    function animate() {
        if (!threeInstances[containerId]) return;
        animId = requestAnimationFrame(animate);
        if (controls) controls.update();
        renderer.render(scene, camera);
    }
    threeInstances[containerId].animId = animId;
    animate();

    return { scene, model };
}

function cleanup3D(containerId) {
    var inst = threeInstances[containerId];
    if (!inst) return;
    if (inst.animId) cancelAnimationFrame(inst.animId);
    if (inst.ro) inst.ro.disconnect();
    if (inst.renderer) inst.renderer.dispose();
    if (inst.scene) {
        inst.scene.traverse(function(obj) {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
                if (Array.isArray(obj.material)) {
                    for (var i = 0; i < obj.material.length; i++) obj.material[i].dispose();
                } else {
                    obj.material.dispose();
                }
            }
        });
    }
    delete threeInstances[containerId];
}

// ============================================
// 3D MODEL BUILDERS — upgraded quality
// ============================================

function buildModel(config) {
    var group = new THREE.Group();
    var type   = (config.type || 'auto').toLowerCase();
    var params = config.params || {};

    switch (type) {
        case 'beam':                 buildBeam(group, params);         break;
        case 'truss':               buildTruss(group, params);        break;
        case 'lattice':
        case 'crystal':
        case 'bcc': case 'fcc':     buildLattice(group, params);      break;
        case 'molecule':
        case 'compound':            buildMolecule(group, params);     break;
        case 'surface':
        case 'math':
        case 'function':            buildSurface(group, params);      break;
        case 'particles':
        case 'gas': case 'diffusion': buildParticles(group, params);  break;
        case 'pipe': case 'fluid':  buildPipe(group, params);         break;
        case 'layer': case 'soil':
        case 'strata':              buildLayers(group, params);       break;
        case 'gear':                buildGear(group, params);         break;
        case 'bridge':              buildBridge(group, params);       break;
        case 'dna':                 buildDNA(group, params);          break;
        case 'spring':              buildSpring(group, params);       break;
        case 'pendulum':            buildPendulum(group, params);     break;
        case 'circuit':             buildCircuitBoard(group, params); break;
        case 'earth': case 'planet': buildPlanet(group, params);     break;
        default:                    buildDefault(group);              break;
    }

    return group;
}

// ── Materials palette ────────────────────────

function goldMat() { return new THREE.MeshStandardMaterial({ color: 0xd4a000, roughness: 0.2, metalness: 0.8 }); }
function steelMat() { return new THREE.MeshStandardMaterial({ color: 0x6688aa, roughness: 0.3, metalness: 0.7 }); }
function redMat() { return new THREE.MeshStandardMaterial({ color: 0xff4757, roughness: 0.3, metalness: 0.1 }); }
function blueMat() { return new THREE.MeshStandardMaterial({ color: 0x4488dd, roughness: 0.3, metalness: 0.3 }); }
function greenMat() { return new THREE.MeshStandardMaterial({ color: 0x00c897, roughness: 0.4, metalness: 0.1 }); }
function concreteMat() { return new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.9, metalness: 0 }); }

// ── Beam (structural) ────────────────────────

function buildBeam(group, p) {
    var L = p.length || 6, W = 0.3, H = p.height || 0.5;
    var beamMat = steelMat();
    var beam = new THREE.Mesh(new THREE.BoxGeometry(L, H, W), beamMat);
    beam.position.y = H / 2;
    beam.castShadow = true;
    group.add(beam);

    var supGeo = new THREE.CylinderGeometry(0.1, 0.15, 0.8, 12);
    var supMat = concreteMat();
    var leftSup = new THREE.Mesh(supGeo, supMat);
    leftSup.position.set(-L / 2 + 0.2, -0.1, 0);
    leftSup.castShadow = true;
    group.add(leftSup);
    var rightSup = new THREE.Mesh(supGeo, supMat);
    rightSup.position.set(L / 2 - 0.2, -0.1, 0);
    rightSup.castShadow = true;
    group.add(rightSup);

    // Load arrows
    var arrowCount = p.distributed ? 5 : 1;
    for (var i = 0; i < arrowCount; i++) {
        var x = p.distributed
            ? -L / 2 + 0.5 + i * ((L - 1) / (arrowCount - 1 || 1))
            : (p.loadPosition || 0);
        addArrow(group, new THREE.Vector3(x, H + 1.4, 0), new THREE.Vector3(0, -1, 0), 1.2, 0xd4a000);
    }

    // Reaction arrows
    addArrow(group, new THREE.Vector3(-L / 2 + 0.2, -0.8, 0), new THREE.Vector3(0, 1, 0), 0.8, 0x00c897);
    addArrow(group, new THREE.Vector3(L / 2 - 0.2,  -0.8, 0), new THREE.Vector3(0, 1, 0), 0.8, 0x00c897);
}

function addArrow(group, origin, dir, length, color) {
    var arrowHelper = new THREE.ArrowHelper(dir.clone().normalize(), origin, length, color, length * 0.25, length * 0.12);
    group.add(arrowHelper);
}

// ── Truss (structural) ───────────────────────

function buildTruss(group, p) {
    var span = p.span || 6, h = p.height || 2, panels = p.panels || 6;
    var nodeGeo = new THREE.SphereGeometry(0.12, 16, 16);
    var nodeMat = goldMat();
    var memberMat = steelMat();
    var tensionMat = redMat();
    var pw = span / panels;

    var topNodes = [], btmNodes = [];
    for (var i = 0; i <= panels; i++) {
        var x = -span / 2 + i * pw;
        var topPos = new THREE.Vector3(x, h, 0);
        var btmPos = new THREE.Vector3(x, 0, 0);
        topNodes.push(topPos);
        btmNodes.push(btmPos);
        var topNode = new THREE.Mesh(nodeGeo, nodeMat);
        topNode.position.copy(topPos);
        group.add(topNode);
        var btmNode = new THREE.Mesh(nodeGeo, nodeMat);
        btmNode.position.copy(btmPos);
        group.add(btmNode);
    }

    function addMember(a, b, mat) {
        var dir = new THREE.Vector3().subVectors(b, a);
        var len = dir.length();
        var mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
        var m = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, len, 8), mat);
        m.position.copy(mid);
        m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
        m.castShadow = true;
        group.add(m);
    }

    for (var i = 0; i < panels; i++) {
        addMember(topNodes[i], topNodes[i + 1], memberMat);
        addMember(btmNodes[i], btmNodes[i + 1], memberMat);
        addMember(btmNodes[i], topNodes[i], memberMat);
        addMember(btmNodes[i + 1], topNodes[i], tensionMat);
    }
    addMember(btmNodes[panels], topNodes[panels], memberMat);
}

// ── Lattice / Crystal ────────────────────────

function buildLattice(group, p) {
    var spacing = p.spacing || 1.1;
    var layers  = Math.max(2, Math.min(p.layers || 3, 4));
    var type    = (p.type || p.latticeType || 'simple').toLowerCase();
    var atomColors = [0x4a90d9, 0xd4a000, 0xff4757, 0x00c897];
    var atomGeo    = new THREE.SphereGeometry(0.22, 20, 20);
    var bondMat    = new THREE.MeshStandardMaterial({ color: 0x445566, roughness: 0.5, metalness: 0.3, transparent: true, opacity: 0.7 });
    var positions = [];

    for (var x = 0; x < layers; x++) {
        for (var y = 0; y < layers; y++) {
            for (var z = 0; z < layers; z++) {
                var pos = new THREE.Vector3(
                    (x - (layers - 1) / 2) * spacing,
                    (y - (layers - 1) / 2) * spacing,
                    (z - (layers - 1) / 2) * spacing
                );
                positions.push(pos);
                var mat = new THREE.MeshStandardMaterial({
                    color: atomColors[(x + y + z) % 2 === 0 ? 0 : 1],
                    roughness: 0.15, metalness: 0.7,
                });
                var atom = new THREE.Mesh(atomGeo, mat);
                atom.position.copy(pos);
                atom.castShadow = true;
                group.add(atom);
            }
        }
    }

    // BCC center atoms
    if (type === 'bcc') {
        for (var x = 0; x < layers - 1; x++) {
            for (var y = 0; y < layers - 1; y++) {
                for (var z = 0; z < layers - 1; z++) {
                    var pos = new THREE.Vector3(
                        (x - (layers - 1) / 2 + 0.5) * spacing,
                        (y - (layers - 1) / 2 + 0.5) * spacing,
                        (z - (layers - 1) / 2 + 0.5) * spacing
                    );
                    var bccAtom = new THREE.Mesh(atomGeo, new THREE.MeshStandardMaterial({ color: 0xd4a000, roughness: 0.15, metalness: 0.8 }));
                    bccAtom.position.copy(pos);
                    group.add(bccAtom);
                }
            }
        }
    }

    // Draw bonds
    for (var i = 0; i < positions.length; i++) {
        for (var j = i + 1; j < positions.length; j++) {
            var a = positions[i];
            var b = positions[j];
            if (a.distanceTo(b) < spacing * 1.05) {
                var dir = new THREE.Vector3().subVectors(b, a);
                var len = dir.length();
                var mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
                var bond = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, len, 8), bondMat);
                bond.position.copy(mid);
                bond.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
                group.add(bond);
            }
        }
    }
}

// ── Molecule ─────────────────────────────────

function buildMolecule(group, p) {
    var n    = Math.min(p.atoms || 6, 12);
    var centralMat = new THREE.MeshStandardMaterial({ color: 0xd4a000, roughness: 0.1, metalness: 0.7, emissive: 0x221100 });
    var central = new THREE.Mesh(new THREE.SphereGeometry(0.3, 24, 24), centralMat);
    group.add(central);

    var atomColors = [0x4a90d9, 0xff4757, 0xffffff, 0x6c5ce7, 0x00c897, 0xff6b35];
    var bondMat    = new THREE.MeshStandardMaterial({ color: 0x446688, roughness: 0.4, transparent: true, opacity: 0.8 });
    var r          = p.bondLength || 1.4;

    for (var i = 0; i < n; i++) {
        var phi   = Math.acos(1 - 2 * (i + 0.5) / n);
        var theta = Math.PI * (1 + Math.sqrt(5)) * i;
        var pos   = new THREE.Vector3(
            r * Math.sin(phi) * Math.cos(theta),
            r * Math.sin(phi) * Math.sin(theta),
            r * Math.cos(phi)
        );

        var mat  = new THREE.MeshStandardMaterial({ color: atomColors[i % atomColors.length], roughness: 0.2, metalness: 0.4 });
        var atom = new THREE.Mesh(new THREE.SphereGeometry(0.2, 20, 20), mat);
        atom.position.copy(pos);
        atom.castShadow = true;
        group.add(atom);

        var dir  = pos.clone().normalize();
        var bond = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, r, 8), bondMat);
        bond.position.copy(pos.clone().multiplyScalar(0.5));
        bond.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
        group.add(bond);
    }
}

// ── Math surface ─────────────────────────────

function buildSurface(group, p) {
    var range   = p.range || 4;
    var res     = Math.min(p.resolution || 80, 100);
    var fn      = p.fn || 'sinc';

    var geo = new THREE.PlaneGeometry(range * 2, range * 2, res, res);
    var posAttr = geo.attributes.position;
    var colors = new Float32Array(posAttr.count * 3);
    var zValues = new Float32Array(posAttr.count);
    var zMin = Infinity, zMax = -Infinity;

    for (var i = 0; i < posAttr.count; i++) {
        var x = posAttr.getX(i), y = posAttr.getY(i);
        var r = Math.sqrt(x * x + y * y);
        var z = 0;
        switch (fn) {
            case 'saddle':   z = x * x / 4 - y * y / 4; break;
            case 'ripple':   z = Math.cos(x * 1.5) * Math.sin(y * 1.5) * 0.8; break;
            case 'gaussian': z = Math.exp(-(x * x + y * y) / 4) * 1.5; break;
            case 'sinc':
            default:         z = r < 0.01 ? 1 : Math.sin(r * 2) / (r * 2); break;
        }
        zValues[i] = z;
        zMin = Math.min(zMin, z);
        zMax = Math.max(zMax, z);
    }

    for (var i = 0; i < posAttr.count; i++) {
        var x = posAttr.getX(i), y = posAttr.getY(i);
        var z = zValues[i];
        posAttr.setZ(i, z * 1.2);
        var t = (z - zMin) / (zMax - zMin || 1);
        colors[i * 3]     = 0.18 + t * 0.64;
        colors[i * 3 + 1] = 0.3  + t * 0.33;
        colors[i * 3 + 2] = 0.85 - t * 0.75;
    }
    geo.computeVertexNormals();
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    var mat = new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.35,
        metalness: 0.1,
        side: THREE.DoubleSide,
        wireframe: false,
    });

    var surface = new THREE.Mesh(geo, mat);
    surface.rotation.x = -Math.PI / 2.5;
    surface.castShadow = true;
    group.add(surface);

    var wireMat = new THREE.MeshBasicMaterial({ color: 0xd4a000, wireframe: true, transparent: true, opacity: 0.08 });
    var wireframe = new THREE.Mesh(geo.clone(), wireMat);
    wireframe.rotation.x = -Math.PI / 2.5;
    group.add(wireframe);
}

// ── Particles ────────────────────────────────

function buildParticles(group, p) {
    var count  = Math.min(p.count || 300, 600);
    var spread = p.spread || 4;
    var pos    = new Float32Array(count * 3);
    var cols   = new Float32Array(count * 3);

    for (var i = 0; i < count; i++) {
        pos[i * 3]     = (Math.random() - 0.5) * spread;
        pos[i * 3 + 1] = (Math.random() - 0.5) * spread;
        pos[i * 3 + 2] = (Math.random() - 0.5) * spread;
        var t = Math.random();
        cols[i * 3]     = 0.22 + t * 0.6;
        cols[i * 3 + 1] = 0.35 + t * 0.45;
        cols[i * 3 + 2] = 0.85 - t * 0.6;
    }

    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(cols, 3));

    var mat = new THREE.PointsMaterial({
        vertexColors: true,
        size:        0.07,
        sizeAttenuation: true,
        blending:    THREE.AdditiveBlending,
        depthWrite:  false,
        transparent: true,
        opacity:     0.85,
    });

    group.add(new THREE.Points(geo, mat));

    var cage = new THREE.Mesh(
        new THREE.SphereGeometry(spread / 2 + 0.1, 16, 12),
        new THREE.MeshBasicMaterial({ color: 0x2244aa, wireframe: true, transparent: true, opacity: 0.15 })
    );
    group.add(cage);
}

// ── Pipe / Fluid ─────────────────────────────

function buildPipe(group, p) {
    var radius = p.radius || 0.45;
    var length = p.length || 6;
    var pipeMat = new THREE.MeshStandardMaterial({ color: 0x6688aa, roughness: 0.2, metalness: 0.8 });
    var pipeGeo = new THREE.CylinderGeometry(radius, radius, length, 32, 1, false);
    var pipe    = new THREE.Mesh(pipeGeo, pipeMat);
    pipe.rotation.z = Math.PI / 2;
    pipe.castShadow = true;
    group.add(pipe);

    var arrowMat = new THREE.MeshStandardMaterial({ color: 0x00c897, roughness: 0.3, emissive: 0x003322 });
    for (var i = 0; i < 4; i++) {
        var x = -length / 2 + 0.6 + i * (length / 4);
        var arrow = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.35, 8), arrowMat);
        arrow.position.set(x, 0, 0);
        arrow.rotation.z = -Math.PI / 2;
        group.add(arrow);
    }

    var capGeo = new THREE.CylinderGeometry(radius + 0.06, radius + 0.06, 0.08, 32);
    var leftCap = new THREE.Mesh(capGeo, pipeMat);
    leftCap.rotation.z = Math.PI / 2;
    leftCap.position.x = -length / 2;
    group.add(leftCap);
    var rightCap = new THREE.Mesh(capGeo, pipeMat);
    rightCap.rotation.z = Math.PI / 2;
    rightCap.position.x = length / 2;
    group.add(rightCap);
}

// ── Soil / Layers ─────────────────────────────

function buildLayers(group, p) {
    var layerDefs = [
        { color: 0x8B4513, label: 'Topsoil',   roughness: 0.9 },
        { color: 0xa0784f, label: 'Clay',       roughness: 0.85 },
        { color: 0xc8a87a, label: 'Sand',       roughness: 0.95 },
        { color: 0xd4c4a0, label: 'Gravel',     roughness: 0.9 },
        { color: 0x8899aa, label: 'Rock',       roughness: 0.6, metalness: 0.2 },
        { color: 0x556677, label: 'Bedrock',    roughness: 0.5, metalness: 0.3 },
    ];

    for (var i = 0; i < layerDefs.length; i++) {
        var layer = layerDefs[i];
        var mat = new THREE.MeshStandardMaterial({
            color:     layer.color,
            roughness: layer.roughness || 0.8,
            metalness: layer.metalness || 0,
        });
        var mesh = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.65, 2.5), mat);
        mesh.position.y = -2.0 + i * 0.7;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        group.add(mesh);
    }

    var boreMat = new THREE.MeshStandardMaterial({ color: 0x333355, roughness: 0.3 });
    var borehole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 5, 16), boreMat);
    borehole.position.set(1.5, 0, 0);
    group.add(borehole);
}

// ── Gear ─────────────────────────────────────

function buildGear(group, p) {
    var teeth = p.teeth || 14;
    var r     = p.radius || 1.2;
    var shape = new THREE.Shape();

    for (var i = 0; i < teeth; i++) {
        var ang  = (i / teeth) * Math.PI * 2;
        var next = ((i + 0.5) / teeth) * Math.PI * 2;
        var toothH = 0.22;

        shape.lineTo(r * Math.cos(ang), r * Math.sin(ang));
        shape.lineTo((r + toothH) * Math.cos(ang + Math.PI / teeth / 2), (r + toothH) * Math.sin(ang + Math.PI / teeth / 2));
        shape.lineTo((r + toothH) * Math.cos(next - Math.PI / teeth / 2), (r + toothH) * Math.sin(next - Math.PI / teeth / 2));
        shape.lineTo(r * Math.cos(next), r * Math.sin(next));
    }
    shape.closePath();

    var geo  = new THREE.ExtrudeGeometry(shape, { depth: 0.35, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.02, bevelSegments: 2 });
    var gear = new THREE.Mesh(geo, steelMat());
    gear.castShadow = true;
    group.add(gear);

    var hub = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.5, 24), goldMat());
    hub.rotation.x = Math.PI / 2;
    hub.position.z = 0.17;
    group.add(hub);

    var scale = 0.65;
    var gear2 = gear.clone();
    gear2.scale.set(scale, scale, scale);
    gear2.position.set(r * (1 + scale) + 0.15, 0, 0);
    gear2.rotation.z = Math.PI / teeth;
    group.add(gear2);
}

// ── Bridge ───────────────────────────────────

function buildBridge(group, p) {
    var span = p.span || 7;
    var deck = new THREE.Mesh(new THREE.BoxGeometry(span, 0.15, 1.2), concreteMat());
    deck.position.y = 0;
    group.add(deck);
    
    var towerPositions = [-(span / 2 - 0.4), (span / 2 - 0.4)];
    for (var t = 0; t < towerPositions.length; t++) {
        var x = towerPositions[t];
        var tower = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.8, 0.2), steelMat());
        tower.position.set(x, 1.5, 0);
        tower.castShadow = true;
        group.add(tower);
        
        for (var i = 0; i < 6; i++) {
            var tx = x + (x > 0 ? -1 : 1) * (i + 1) * 0.55;
            var ty = 0.12;
            var topY = 2.8;
            var dir = new THREE.Vector3(tx - x, ty - topY, 0);
            var len = dir.length();
            var mid = new THREE.Vector3((x + tx) / 2, (topY + ty) / 2, 0);
            var cable = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, len, 6), goldMat());
            cable.position.copy(mid);
            cable.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
            group.add(cable);
        }
    }
}

// ── DNA ──────────────────────────────────────

function buildDNA(group, p) {
    var turns  = p.turns || 3;
    var height = turns * 2;
    var steps  = turns * 10;
    var rHelix = 0.8;

    var redMatDNA   = new THREE.MeshStandardMaterial({ color: 0xff4757, roughness: 0.3, metalness: 0.3 });
    var blueMatDNA  = new THREE.MeshStandardMaterial({ color: 0x4a90d9, roughness: 0.3, metalness: 0.3 });
    var bondMatDNA  = new THREE.MeshStandardMaterial({ color: 0xd4a000, roughness: 0.4, transparent: true, opacity: 0.8 });
    var baseGeoDNA  = new THREE.SphereGeometry(0.1, 12, 12);

    for (var i = 0; i <= steps; i++) {
        var t    = i / steps;
        var ang  = t * turns * Math.PI * 2;
        var y    = t * height - height / 2;

        var p1 = new THREE.Vector3(rHelix * Math.cos(ang), y, rHelix * Math.sin(ang));
        var p2 = new THREE.Vector3(rHelix * Math.cos(ang + Math.PI), y, rHelix * Math.sin(ang + Math.PI));

        var atom1 = new THREE.Mesh(baseGeoDNA, redMatDNA);
        atom1.position.copy(p1);
        group.add(atom1);
        var atom2 = new THREE.Mesh(baseGeoDNA, blueMatDNA);
        atom2.position.copy(p2);
        group.add(atom2);

        if (i % 2 === 0) {
            var dir  = new THREE.Vector3().subVectors(p2, p1);
            var len  = dir.length();
            var mid  = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
            var rung = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, len, 8), bondMatDNA);
            rung.position.copy(mid);
            rung.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
            group.add(rung);
        }
    }
}

// ── Spring ───────────────────────────────────

function buildSpring(group, p) {
    var coils  = p.coils || 8;
    var radius = p.radius || 0.6;
    var height = p.height || 4;
    var pts = [];

    for (var i = 0; i <= coils * 30; i++) {
        var t   = i / (coils * 30);
        var ang = t * coils * Math.PI * 2;
        pts.push(new THREE.Vector3(radius * Math.cos(ang), t * height - height / 2, radius * Math.sin(ang)));
    }

    var curve  = new THREE.CatmullRomCurve3(pts);
    var tube   = new THREE.TubeGeometry(curve, coils * 30, 0.06, 8, false);
    var spring = new THREE.Mesh(tube, steelMat());
    spring.castShadow = true;
    group.add(spring);

    var plateMat = concreteMat();
    var topPlate = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.12, 24), plateMat);
    topPlate.position.set(0, height / 2 + 0.06, 0);
    group.add(topPlate);
    var bottomPlate = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.12, 24), plateMat);
    bottomPlate.position.set(0, -height / 2 - 0.06, 0);
    group.add(bottomPlate);
}

// ── Pendulum ─────────────────────────────────

function buildPendulum(group, p) {
    var angle = (p.angle || 25) * Math.PI / 180;
    var len   = p.length || 3;
    var pivot = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), steelMat());
    pivot.position.set(0, 0, 0);
    group.add(pivot);
    
    var bob = new THREE.Vector3(len * Math.sin(angle), -len * Math.cos(angle), 0);
    var dir = bob.clone().normalize();
    var rod = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, len, 8), steelMat());
    rod.position.copy(bob.clone().multiplyScalar(0.5));
    rod.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    group.add(rod);
    
    var bobMesh = new THREE.Mesh(new THREE.SphereGeometry(0.3, 24, 24), goldMat());
    bobMesh.position.copy(bob);
    bobMesh.castShadow = true;
    group.add(bobMesh);
    
    var arcPts = [];
    for (var a = -35 * Math.PI / 180; a <= 35 * Math.PI / 180; a += 0.04) {
        arcPts.push(new THREE.Vector3(len * Math.sin(a), -len * Math.cos(a), 0));
    }
    var arcGeo = new THREE.BufferGeometry().setFromPoints(arcPts);
    var arcLine = new THREE.Line(arcGeo, new THREE.LineBasicMaterial({ color: 0xd4a000, transparent: true, opacity: 0.35 }));
    group.add(arcLine);
}

// ── Circuit board ─────────────────────────────

function buildCircuitBoard(group, p) {
    var pcb = new THREE.Mesh(new THREE.BoxGeometry(5, 0.08, 3.5), new THREE.MeshStandardMaterial({ color: 0x1a4a1a, roughness: 0.8 }));
    pcb.receiveShadow = true;
    group.add(pcb);
    
    var compPositions = [[-1.5,0.15,0.5],[-0.5,0.15,-0.3],[0.5,0.15,0.8],[1.5,0.15,-0.5],[0,0.15,0],[-1,0.15,-1],[1,0.15,-0.8]];
    var compColors    = [0xff4757, 0x4a90d9, 0xd4a000, 0x00c897, 0xa855f7, 0xffffff, 0xff8800];
    for (var i = 0; i < compPositions.length; i++) {
        var pos = compPositions[i];
        var h = 0.15 + Math.random() * 0.3;
        var comp = new THREE.Mesh(new THREE.BoxGeometry(0.3, h, 0.2), new THREE.MeshStandardMaterial({ color: compColors[i % 7], roughness: 0.3, metalness: 0.2 }));
        comp.position.set(pos[0], pos[1] + h / 2, pos[2]);
        comp.castShadow = true;
        group.add(comp);
    }
    
    var traceMat = new THREE.LineBasicMaterial({ color: 0xc8a400 });
    var tracePoints = [[[-1.5,0.06,0.5],[-0.5,0.06,-0.3]],[[-0.5,0.06,-0.3],[0.5,0.06,0.8]],[[0.5,0.06,0.8],[1.5,0.06,-0.5]]];
    for (var i = 0; i < tracePoints.length; i++) {
        var points = tracePoints[i];
        var lineGeo = new THREE.BufferGeometry().setFromPoints(points.map(function(pt) { return new THREE.Vector3(pt[0], pt[1], pt[2]); }));
        var traceLine = new THREE.Line(lineGeo, traceMat);
        group.add(traceLine);
    }
}

// ── Planet ────────────────────────────────────

function buildPlanet(group, p) {
    var bodyMat = new THREE.MeshStandardMaterial({ color: p.color || 0x2244aa, roughness: 0.7, metalness: 0 });
    var body    = new THREE.Mesh(new THREE.SphereGeometry(p.radius || 1.5, 32, 32), bodyMat);
    group.add(body);

    var atmosphere = new THREE.Mesh(new THREE.SphereGeometry((p.radius || 1.5) * 1.06, 32, 32), new THREE.MeshStandardMaterial({ color: 0x4488ff, transparent: true, opacity: 0.15 }));
    group.add(atmosphere);

    if (p.rings !== false) {
        var ringGeo = new THREE.RingGeometry((p.radius || 1.5) * 1.35, (p.radius || 1.5) * 2.1, 64);
        var ringMat = new THREE.MeshStandardMaterial({ color: 0xd4a000, roughness: 0.8, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
        var ring    = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 3;
        group.add(ring);
    }

    var moon = new THREE.Mesh(new THREE.SphereGeometry((p.radius || 1.5) * 0.28, 16, 16), new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.9 }));
    moon.position.set((p.radius || 1.5) * 2.8, 0, 0);
    group.add(moon);
}

// ── Default ───────────────────────────────────

function buildDefault(group) {
    var geo  = new THREE.TorusKnotGeometry(1.4, 0.38, 128, 24);
    var mat  = new THREE.MeshStandardMaterial({ color: 0xd4a000, roughness: 0.12, metalness: 0.85, emissive: 0x221100 });
    var mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    group.add(mesh);
}

// ============================================
// SMART DETECTION — expanded
// ============================================

function detectVisualType(text) {
    if (!text) return null;
    var t = text.toLowerCase();

    if (/beam|bending|deflection|bmd|sfd|moment|shear/.test(t))      return { type: 'beam' };
    if (/truss|frame|member|joint|howe|pratt/.test(t))               return { type: 'truss' };
    if (/bcc|fcc|hcp|unit cell|crystal|lattice/.test(t))             return { type: 'lattice' };
    if (/molecule|bond|atom|compound|organic|h2o|co2/.test(t))       return { type: 'molecule' };
    if (/dna|helix|base pair|nucleotide|chromosome/.test(t))         return { type: 'dna' };
    if (/spring|hooke|oscillat/.test(t))                             return { type: 'spring' };
    if (/pendulum|simple harmonic|shm/.test(t))                      return { type: 'pendulum' };
    if (/gear|mechanism|shaft|rotation/.test(t))                     return { type: 'gear' };
    if (/bridge|suspension|cable|arch/.test(t))                      return { type: 'bridge' };
    if (/circuit board|pcb|component|trace/.test(t))                 return { type: 'circuit' };
    if (/planet|orbit|saturn|earth|solar/.test(t))                   return { type: 'planet' };
    if (/surface|3d function|plot|equation|graph/.test(t))           return { type: 'surface' };
    if (/particle|gas|diffusion|brownian/.test(t))                   return { type: 'particles' };
    if (/pipe|fluid|flow|bernoulli|channel|pipe/.test(t))            return { type: 'pipe' };
    if (/soil|layer|geology|strata|boring/.test(t))                  return { type: 'layer' };

    return null;
}

// ============================================
// ADDITIONAL FUNCTIONS
// ============================================

async function renderVisual(containerId, userQuery, options = {}) {
    var visualType = detectVisualType(userQuery);
    if (visualType) {
        showVisualPanel(containerId, { type: visualType.type, params: options.params || {} });
        return true;
    }
    return false;
}

function hideVisualPanel() {
    var panels = document.querySelectorAll('#visualPanel, .visual-panel');
    for (var i = 0; i < panels.length; i++) {
        panels[i].style.display = 'none';
    }
}

// ============================================
// EXPORTS — unchanged
// ============================================

export {
    validateVisualHTML,
    extractVisualFromResponse,
    showVisualPanel,
    render2DGraph,
    render3DScene,
    detectVisualType,
    renderVisual,
    hideVisualPanel,
};