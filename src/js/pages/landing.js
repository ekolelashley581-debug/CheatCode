// ============================================
// CHEATCODE LANDING PAGE
// Professional version — self-contained, no external deps beyond Three.js
// ============================================

import * as THREE from 'three';

// Track renderer for cleanup on navigate away
let _renderer = null;
let _animFrameId = null;

function destroyThree() {
    if (_animFrameId) { cancelAnimationFrame(_animFrameId); _animFrameId = null; }
    if (_renderer) { _renderer.dispose(); _renderer = null; }
}

export function renderLandingPage(state, supabase, navigateTo) {
    const page = document.getElementById('page-landing');
    if (!page) return;

    // Clean up any previous Three.js instance
    destroyThree();

    page.innerHTML = `
        <div class="landing">

            <!-- ── NAV ── -->
            <nav class="landing-nav" id="landingNav">
                <div class="landing-nav-brand">
                    <span class="landing-logo">C</span>
                    <span>Cheat<span style="color:var(--accent)">Code</span></span>
                </div>
                <div class="landing-nav-links">
                    <a href="#features">Features</a>
                    <a href="#how-it-works">How It Works</a>
                    <a href="#pricing">Pricing</a>
                    <a href="#faq">FAQ</a>
                    <button class="btn btn-sm btn-secondary" id="navSignin">Sign In</button>
                    <button class="btn btn-sm btn-primary" id="navSignup">Sign Up Free</button>
                </div>
                <button class="landing-mobile-menu" id="mobileMenuBtn" aria-label="Menu">&#9776;</button>
            </nav>

            <!-- Mobile menu drawer -->
            <div class="landing-mobile-drawer" id="mobileDrawer">
                <button class="landing-mobile-close" id="mobileClose">&#x2715;</button>
                <a href="#features" class="mobile-nav-link">Features</a>
                <a href="#how-it-works" class="mobile-nav-link">How It Works</a>
                <a href="#pricing" class="mobile-nav-link">Pricing</a>
                <a href="#faq" class="mobile-nav-link">FAQ</a>
                <button class="btn btn-secondary" id="mobileSignin" style="width:100%;margin-top:8px;">Sign In</button>
                <button class="btn btn-primary" id="mobileSignup" style="width:100%;margin-top:8px;">Sign Up Free</button>
            </div>

            <!-- ── HERO ── -->
            <section class="hero">
                <div class="hero-content">
                    <div class="hero-badge">The AI Study Companion for African Students</div>
                    <h1>Understand Anything.<br><span class="hero-highlight">Finally.</span></h1>
                    <p class="hero-subtitle">
                        Upload your lecturer's notes. Ask any question. Get explanations 
                        built from your exact materials — not the internet. 
                        The AI tutor that has actually read what your exam will cover.
                    </p>
                    <div class="hero-actions">
                        <button class="btn-hero" id="heroCta">Start Free Trial — 7 Days</button>
                        <span class="hero-note">No payment required &nbsp;·&nbsp; 10 questions/day &nbsp;·&nbsp; Cancel anytime</span>
                    </div>
                    <div class="hero-stats">
                        <div class="hero-stat">
                            <span class="hero-stat-number">600+</span>
                            <span class="hero-stat-label">Students</span>
                        </div>
                        <div class="hero-stat-divider"></div>
                        <div class="hero-stat">
                            <span class="hero-stat-number">94%</span>
                            <span class="hero-stat-label">Better Grades</span>
                        </div>
                        <div class="hero-stat-divider"></div>
                        <div class="hero-stat">
                            <span class="hero-stat-number">4.9/5</span>
                            <span class="hero-stat-label">Rating</span>
                        </div>
                    </div>
                </div>
                <div class="hero-visual">
                    <div class="hero-canvas-wrap">
                        <canvas id="heroCanvas"></canvas>
                        <div class="hero-canvas-glow"></div>
                    </div>
                </div>
            </section>

            <!-- ── SOCIAL PROOF BAR ── -->
            <div class="social-bar">
                <span>Trusted by students at</span>
                <span class="social-item">University of Buea</span>
                <span class="social-dot">·</span>
                <span class="social-item">HTTTC Kumba</span>
                <span class="social-dot">·</span>
                <span class="social-item">UY1 Yaoundé</span>
                <span class="social-dot">·</span>
                <span class="social-item">University of Douala</span>
                <span class="social-dot">·</span>
                <span class="social-item">and more</span>
            </div>

            <!-- ── FEATURES ── -->
            <section class="landing-section" id="features">
                <div class="section-header">
                    <div class="section-label">Features</div>
                    <h2>Everything You Need to Master Any Subject</h2>
                    <p>Powerful AI tools designed for how students actually learn — not how a Silicon Valley engineer thinks they do.</p>
                </div>
                <div class="features-grid">
                    <div class="feature-card">
                        <div class="feature-icon">01</div>
                        <h3>Teaches From Your Notes</h3>
                        <p>Upload your lecturer's PDF. The AI reads it and answers from it. Not Wikipedia. Not the internet. Your exact materials.</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">02</div>
                        <h3>Interactive Visuals</h3>
                        <p>Complex concepts become interactive diagrams you can manipulate. See a beam deflect, watch a circuit respond, plot a function live.</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">03</div>
                        <h3>Multiple Teaching Styles</h3>
                        <p>Learn deeply, practice with problems, get quick answers, or prepare for tomorrow's exam. The AI adapts to the mode you need right now.</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">04</div>
                        <h3>Gap Sweep</h3>
                        <p>The AI scans everything you have studied across all your courses and pinpoints exactly what you don't understand yet.</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">05</div>
                        <h3>Exam Prediction</h3>
                        <p>Based on your materials, the AI predicts what is most likely to appear in your exam. Ranked by probability. With practice questions.</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">06</div>
                        <h3>Reads Charts & Photos</h3>
                        <p>Snap a photo of a diagram, graph, or whiteboard. Vision AI extracts all information from it and lets you ask questions about it.</p>
                    </div>
                </div>
            </section>

            <!-- ── HOW IT WORKS ── -->
            <section class="landing-section alt-section" id="how-it-works">
                <div class="section-header">
                    <div class="section-label">Process</div>
                    <h2>Three Steps to Understanding</h2>
                    <p>Simple enough to start in under two minutes.</p>
                </div>
                <div class="steps">
                    <div class="step">
                        <div class="step-num">1</div>
                        <h3>Upload Your Materials</h3>
                        <p>PDFs, photos, typed notes. The AI reads everything in seconds and organizes it by course.</p>
                    </div>
                    <div class="step-arrow">&#8594;</div>
                    <div class="step">
                        <div class="step-num">2</div>
                        <h3>Ask Any Question</h3>
                        <p>Type naturally. "Explain bending moment diagrams." "Why does this formula work?" "Give me a practice problem."</p>
                    </div>
                    <div class="step-arrow">&#8594;</div>
                    <div class="step">
                        <div class="step-num">3</div>
                        <h3>Actually Understand</h3>
                        <p>Step-by-step breakdowns, interactive visuals, practice until it clicks. Walk into your exam with confidence.</p>
                    </div>
                </div>
            </section>

            <!-- ── VIDEO DEMO ── -->
            <section class="landing-section">
                <div class="section-header">
                    <div class="section-label">Demo</div>
                    <h2>See It In Action</h2>
                    <p>Watch how CheatCode transforms a lecture PDF into a real conversation.</p>
                </div>
                <div class="video-wrap">
                    <video
                        controls
                        poster="/media/study-demo.png"
                        style="width:100%;border-radius:12px;box-shadow:0 8px 40px rgba(0,0,0,0.6);"
                        onerror="this.style.display='none';document.getElementById('videoFallback').style.display='flex';"
                    >
                        <source src="/media/recording-demo.mp4" type="video/mp4">
                    </video>
                    <div id="videoFallback" class="video-fallback" style="display:none;">
                        <p>Video demo coming soon.</p>
                    </div>
                </div>
            </section>

            <!-- ── TESTIMONIALS ── -->
            <section class="landing-section alt-section">
                <div class="section-header">
                    <div class="section-label">Students</div>
                    <h2>What Students Say</h2>
                </div>
                <div class="testimonials">
                    <div class="testimonial">
                        <div class="testimonial-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
                        <p class="testimonial-text">"I uploaded my lecturer's Structural Mechanics notes and asked it to explain bending moments. It answered using the exact examples from the notes. I passed my exam for the first time."</p>
                        <div class="testimonial-author">
                            <div class="testimonial-avatar">A</div>
                            <div>
                                <div class="testimonial-name">Amara N.</div>
                                <div class="testimonial-role">Civil Engineering, UB</div>
                            </div>
                        </div>
                    </div>
                    <div class="testimonial">
                        <div class="testimonial-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
                        <p class="testimonial-text">"The Gap Sweep found three topics I had completely skipped. I studied them the night before the exam. Two of them came out. This app knows things."</p>
                        <div class="testimonial-author">
                            <div class="testimonial-avatar">C</div>
                            <div>
                                <div class="testimonial-name">Courage T.</div>
                                <div class="testimonial-role">Biochemistry, UY1</div>
                            </div>
                        </div>
                    </div>
                    <div class="testimonial">
                        <div class="testimonial-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
                        <p class="testimonial-text">"I photographed a circuit diagram from my notebook and asked it to explain how it worked. It read it perfectly. Better than any private tutor I have paid for."</p>
                        <div class="testimonial-author">
                            <div class="testimonial-avatar">F</div>
                            <div>
                                <div class="testimonial-name">Fatima M.</div>
                                <div class="testimonial-role">Electrical Engineering, UD</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- ── PRICING ── -->
            <section class="landing-section" id="pricing">
                <div class="section-header">
                    <div class="section-label">Pricing</div>
                    <h2>Start Learning Today</h2>
                    <p>No subscription. No monthly fees. One payment covers your entire semester.</p>
                </div>
                <div class="pricing-cards">
                    <div class="pricing-card">
                        <div class="pricing-header">
                            <h3>Free Trial</h3>
                            <div class="pricing-price">$0</div>
                            <div class="pricing-period">7 days, no card needed</div>
                        </div>
                        <ul class="pricing-list">
                            <li>10 questions per day</li>
                            <li>Upload notes and PDFs</li>
                            <li>All 4 teaching modes</li>
                            <li>Basic AI model</li>
                            <li class="pricing-no">No Visualize tool</li>
                            <li class="pricing-no">No Gap Sweep or Exam Prediction</li>
                            <li class="pricing-no">No image upload</li>
                        </ul>
                        <button class="btn btn-secondary" id="freeBtn" style="width:100%;padding:12px;">Start Free Trial</button>
                    </div>
                    <div class="pricing-card pricing-featured">
                        <div class="pricing-badge">Most Popular</div>
                        <div class="pricing-header">
                            <h3>Pro Access</h3>
                            <div class="pricing-price">$7.99</div>
                            <div class="pricing-period">one-time &nbsp;·&nbsp; full semester</div>
                        </div>
                        <ul class="pricing-list">
                            <li>Unlimited questions</li>
                            <li>Premium AI (Claude 3.5, GPT-4o)</li>
                            <li>Unlimited interactive visuals</li>
                            <li>Image upload and camera capture</li>
                            <li>Vision AI — reads charts and diagrams</li>
                            <li>Gap Sweep and Exam Prediction</li>
                            <li>Session export and knowledge cards</li>
                        </ul>
                        <button class="btn-hero" id="proBtn" style="width:100%;padding:14px;">Get Pro Access — $7.99</button>
                        <p class="pricing-note">Pay with MTN MoMo or Orange Money</p>
                    </div>
                </div>
                <div class="pricing-comparison">
                    Claude Pro costs $20/month. ChatGPT Plus costs $20/month. A private tutor costs $10–15 per hour.
                    CheatCode Pro is <strong>$7.99 once</strong> — all AI models, all features, your entire semester.
                </div>
            </section>

            <!-- ── FAQ ── -->
            <section class="landing-section alt-section" id="faq">
                <div class="section-header">
                    <div class="section-label">FAQ</div>
                    <h2>Frequently Asked Questions</h2>
                </div>
                <div class="faq-grid">
                    <div class="faq-item">
                        <h3>How is this different from ChatGPT?</h3>
                        <p>ChatGPT answers from the internet. CheatCode answers from your specific lecture notes. It has read what your exam will actually cover — ChatGPT hasn't.</p>
                    </div>
                    <div class="faq-item">
                        <h3>What subjects does it work for?</h3>
                        <p>Any subject. Engineering, Medicine, Law, Science, Arts, Business. If you have notes, CheatCode can teach from them. It works in English and French.</p>
                    </div>
                    <div class="faq-item">
                        <h3>Can I use it on my phone?</h3>
                        <p>Yes. CheatCode is designed for mobile. Study on your phone, snap photos of diagrams, upload PDFs — all from your browser with no app download required.</p>
                    </div>
                    <div class="faq-item">
                        <h3>Is there really no subscription?</h3>
                        <p>Correct. Pro Access is a single payment of $7.99 that covers your entire semester. No monthly renewal. No hidden fees. Nothing to cancel.</p>
                    </div>
                    <div class="faq-item">
                        <h3>How do I pay?</h3>
                        <p>MTN Mobile Money and Orange Money are both supported. Enter your phone number, confirm the request on your phone, and your access activates instantly.</p>
                    </div>
                    <div class="faq-item">
                        <h3>What happens to my notes after I upload them?</h3>
                        <p>Your materials are stored securely and privately. Only you can access them. We do not share, sell, or use your academic materials for anything except answering your questions.</p>
                    </div>
                </div>
            </section>

            <!-- ── FINAL CTA ── -->
            <section class="cta-section">
                <div class="cta-inner">
                    <h2>Ready to Finally Understand?</h2>
                    <p>Start your free trial. No payment required. 7 days of clarity, confidence, and actually understanding what your lecturer has been saying all semester.</p>
                    <button class="btn-hero btn-hero-lg" id="bottomCta">Start Free Trial — 7 Days</button>
                    <p class="cta-note">Join 600+ students already learning with CheatCode</p>
                </div>
            </section>

            <!-- ── FOOTER ── -->
            <footer class="landing-footer">
                <div class="footer-grid">
                    <div class="footer-col">
                        <div class="footer-brand">
                            <span class="landing-logo" style="width:24px;height:24px;font-size:12px;">C</span>
                            <span>CheatCode</span>
                        </div>
                        <p class="footer-tagline">Not cheating. Just the code to how learning actually works.</p>
                    </div>
                    <div class="footer-col">
                        <h4>Product</h4>
                        <a href="#features">Features</a>
                        <a href="#pricing">Pricing</a>
                        <a href="#faq">FAQ</a>
                    </div>
                    <div class="footer-col">
                        <h4>Legal</h4>
                        <a href="#" id="footerPrivacy">Privacy Policy</a>
                        <a href="#" id="footerTerms">Terms of Service</a>
                    </div>
                    <div class="footer-col">
                        <h4>Contact</h4>
                        <a href="mailto:support@cheatcode.app">support@cheatcode.app</a>
                    </div>
                </div>
                <div class="footer-bottom">
                    <p>2025 CheatCode. All rights reserved.</p>
                </div>
            </footer>

        </div>
    `;

    // ── EVENT LISTENERS ──────────────────────────────────────────

    // Nav buttons
    document.getElementById('navSignin')?.addEventListener('click', () => navigateTo('signin'));
    document.getElementById('navSignup')?.addEventListener('click', () => navigateTo('signup'));
    document.getElementById('heroCta')?.addEventListener('click', () => navigateTo('signup'));
    document.getElementById('freeBtn')?.addEventListener('click', () => navigateTo('signup'));
    document.getElementById('proBtn')?.addEventListener('click', () => navigateTo('signup'));
    document.getElementById('bottomCta')?.addEventListener('click', () => navigateTo('signup'));

    // Footer legal links
    document.getElementById('footerPrivacy')?.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo('privacy');
    });
    document.getElementById('footerTerms')?.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo('terms');
    });

    // Mobile menu
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileDrawer = document.getElementById('mobileDrawer');
    const mobileClose = document.getElementById('mobileClose');

    mobileMenuBtn?.addEventListener('click', () => {
        mobileDrawer.classList.add('open');
        document.body.style.overflow = 'hidden';
    });

    const closeMobileMenu = () => {
        mobileDrawer.classList.remove('open');
        document.body.style.overflow = '';
    };

    mobileClose?.addEventListener('click', closeMobileMenu);
    document.getElementById('mobileSignin')?.addEventListener('click', () => { closeMobileMenu(); navigateTo('signin'); });
    document.getElementById('mobileSignup')?.addEventListener('click', () => { closeMobileMenu(); navigateTo('signup'); });

    // Mobile anchor links close drawer
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            closeMobileMenu();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                // Small delay to let drawer close first
                setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
            }
        });
    });

    // Smooth scroll for desktop nav anchor links
    document.querySelectorAll('.landing-nav-links a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    // Navbar scroll effect (add shadow on scroll)
    const nav = document.getElementById('landingNav');
    const landingDiv = page.querySelector('.landing');
    if (landingDiv && nav) {
        landingDiv.addEventListener('scroll', () => {
            nav.classList.toggle('nav-scrolled', landingDiv.scrollTop > 40);
        });
    }

    // ── INTERSECTION OBSERVER (animate sections in) ──────────────

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('section-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08 });

    page.querySelectorAll('.feature-card, .step, .testimonial, .pricing-card, .faq-item').forEach(el => {
        el.classList.add('section-hidden');
        observer.observe(el);
    });

    // ── THREE.JS KNOWLEDGE SPHERE ────────────────────────────────

    setTimeout(() => {
        const canvas = document.getElementById('heroCanvas');
        if (!canvas) return;

        try {
            _buildKnowledgeSphere(canvas);
        } catch (err) {
            // Graceful fallback — hide canvas, show CSS shape
            console.warn('Three.js failed:', err.message);
            canvas.style.display = 'none';
            const wrap = page.querySelector('.hero-canvas-wrap');
            if (wrap) {
                wrap.innerHTML = `<div class="hero-fallback"></div>`;
            }
        }
    }, 300);
}

// ── THREE.JS SPHERE (extracted for cleanliness) ──────────────────

function _buildKnowledgeSphere(canvas) {
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(2, 1.5, 9);
    camera.lookAt(0, 0, 0);

    _renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    _renderer.setSize(600, 600);
    _renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const group = new THREE.Group();
    scene.add(group);

    // ── Rings ──
    const ringRotations = [
        [Math.PI / 4, Math.PI / 4 * 1.3, Math.PI / 4 * 0.6],
        [Math.PI / 2, Math.PI / 2 * 1.3, Math.PI / 2 * 0.6],
        [Math.PI / 4 * 3, Math.PI / 4 * 3 * 1.3, Math.PI / 4 * 3 * 0.6],
        [Math.PI, Math.PI * 1.3, Math.PI * 0.6],
    ];
    const ringMat = new THREE.MeshStandardMaterial({ color: 0xd4a000, metalness: 0.85, roughness: 0.1 });

    ringRotations.forEach(([rx, ry, rz]) => {
        const ring = new THREE.Mesh(
            new THREE.TorusGeometry(2.0, 0.055, 16, 120),
            ringMat
        );
        ring.rotation.set(rx, ry, rz);
        group.add(ring);
    });

    // ── Inner accent rings (thinner) ──
    const innerRingMat = new THREE.MeshStandardMaterial({
        color: 0xb89000,
        metalness: 0.6,
        roughness: 0.3,
        transparent: true,
        opacity: 0.65,
    });
    for (let i = 0; i < 3; i++) {
        const r = new THREE.Mesh(new THREE.TorusGeometry(1.3, 0.03, 12, 80), innerRingMat);
        r.rotation.set(Math.PI / 3 * i, Math.PI / 3 * i * 1.7, Math.PI / 3 * i * 1.1);
        group.add(r);
    }

    // ── Center sphere ──
    group.add(new THREE.Mesh(
        new THREE.SphereGeometry(0.28, 32, 32),
        new THREE.MeshStandardMaterial({ color: 0x0a0a14, roughness: 0.9, transparent: true, opacity: 0.7 })
    ));

    // ── Orbiting dots ──
    const dots = new THREE.Group();
    const dotMat = new THREE.MeshStandardMaterial({ color: 0xf0b90b, emissive: 0xf0b90b, emissiveIntensity: 0.5 });
    for (let i = 0; i < 8; i++) {
        const dot = new THREE.Mesh(new THREE.SphereGeometry(0.075, 16, 16), dotMat);
        const angle = (Math.PI * 2 / 8) * i;
        dot.position.set(Math.cos(angle) * 2.35, 0, Math.sin(angle) * 2.35);
        dots.add(dot);
    }
    group.add(dots);

    // ── Particle cloud ──
    const pCount = 90;
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount * 3; i += 3) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = 2.4 + Math.random() * 0.8;
        pPos[i]   = r * Math.sin(phi) * Math.cos(theta);
        pPos[i+1] = r * Math.sin(phi) * Math.sin(theta);
        pPos[i+2] = r * Math.cos(phi);
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
        color: 0xf0b90b,
        size: 0.022,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    }));
    group.add(particles);

    // ── Lighting ──
    scene.add(new THREE.AmbientLight(0x1a1a33, 0.6));

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
    keyLight.position.set(0, 8, 2);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xf0b90b, 0.7);
    fillLight.position.set(-4, 2, -4);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x8899cc, 0.4);
    rimLight.position.set(0, -1, -5);
    scene.add(rimLight);

    scene.add(new THREE.PointLight(0xf0b90b, 0.4, 5));

    // ── Animation loop ──
    function animate() {
        _animFrameId = requestAnimationFrame(animate);
        group.rotation.x += 0.002;
        group.rotation.y += 0.006;
        dots.rotation.y += 0.01;
        dots.rotation.x += 0.004;
        particles.rotation.y += 0.002;
        particles.rotation.x += 0.001;
        _renderer.render(scene, camera);
    }
    animate();
}