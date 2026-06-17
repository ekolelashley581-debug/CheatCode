import{S as L,P as B,W as q,G as C,M as S,a as A,T,b as F,B as N,c as D,d as G,e as U,A as O,f as R,D as k,g as W}from"./three.module-Cthbw6hh.js";let h=null,x=null;function V(){x&&(cancelAnimationFrame(x),x=null),h&&(h.dispose(),h=null)}function $(E,l,s){var y,u,f,b,w,I,e,i,n,r;const a=document.getElementById("page-landing");if(!a)return;V(),a.innerHTML=`
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
    `,(y=document.getElementById("navSignin"))==null||y.addEventListener("click",()=>s("signin")),(u=document.getElementById("navSignup"))==null||u.addEventListener("click",()=>s("signup")),(f=document.getElementById("heroCta"))==null||f.addEventListener("click",()=>s("signup")),(b=document.getElementById("freeBtn"))==null||b.addEventListener("click",()=>s("signup")),(w=document.getElementById("proBtn"))==null||w.addEventListener("click",()=>s("signup")),(I=document.getElementById("bottomCta"))==null||I.addEventListener("click",()=>s("signup")),(e=document.getElementById("footerPrivacy"))==null||e.addEventListener("click",t=>{t.preventDefault(),s("privacy")}),(i=document.getElementById("footerTerms"))==null||i.addEventListener("click",t=>{t.preventDefault(),s("terms")});const m=document.getElementById("mobileMenuBtn"),P=document.getElementById("mobileDrawer"),g=document.getElementById("mobileClose");m==null||m.addEventListener("click",()=>{P.classList.add("open"),document.body.style.overflow="hidden"});const o=()=>{P.classList.remove("open"),document.body.style.overflow=""};g==null||g.addEventListener("click",o),(n=document.getElementById("mobileSignin"))==null||n.addEventListener("click",()=>{o(),s("signin")}),(r=document.getElementById("mobileSignup"))==null||r.addEventListener("click",()=>{o(),s("signup")}),document.querySelectorAll(".mobile-nav-link").forEach(t=>{t.addEventListener("click",d=>{d.preventDefault(),o();const c=document.querySelector(t.getAttribute("href"));c&&setTimeout(()=>c.scrollIntoView({behavior:"smooth",block:"start"}),200)})}),document.querySelectorAll('.landing-nav-links a[href^="#"]').forEach(t=>{t.addEventListener("click",d=>{d.preventDefault();const c=document.querySelector(t.getAttribute("href"));c&&c.scrollIntoView({behavior:"smooth",block:"start"})})});const M=document.getElementById("landingNav"),v=a.querySelector(".landing");v&&M&&v.addEventListener("scroll",()=>{M.classList.toggle("nav-scrolled",v.scrollTop>40)});const p=new IntersectionObserver(t=>{t.forEach(d=>{d.isIntersecting&&(d.target.classList.add("section-visible"),p.unobserve(d.target))})},{threshold:.08});a.querySelectorAll(".feature-card, .step, .testimonial, .pricing-card, .faq-item").forEach(t=>{t.classList.add("section-hidden"),p.observe(t)}),setTimeout(()=>{const t=document.getElementById("heroCanvas");if(t)try{H(t)}catch(d){console.warn("Three.js failed:",d.message),t.style.display="none";const c=a.querySelector(".hero-canvas-wrap");c&&(c.innerHTML='<div class="hero-fallback"></div>')}},300)}function H(E){const l=new L,s=new B(45,1,.1,100);s.position.set(2,1.5,9),s.lookAt(0,0,0),h=new q({canvas:E,alpha:!0,antialias:!0}),h.setSize(600,600),h.setPixelRatio(Math.min(window.devicePixelRatio,2));const a=new C;l.add(a);const m=[[Math.PI/4,Math.PI/4*1.3,Math.PI/4*.6],[Math.PI/2,Math.PI/2*1.3,Math.PI/2*.6],[Math.PI/4*3,Math.PI/4*3*1.3,Math.PI/4*3*.6],[Math.PI,Math.PI*1.3,Math.PI*.6]],P=new S({color:13934592,metalness:.85,roughness:.1});m.forEach(([e,i,n])=>{const r=new A(new T(2,.055,16,120),P);r.rotation.set(e,i,n),a.add(r)});const g=new S({color:12095488,metalness:.6,roughness:.3,transparent:!0,opacity:.65});for(let e=0;e<3;e++){const i=new A(new T(1.3,.03,12,80),g);i.rotation.set(Math.PI/3*e,Math.PI/3*e*1.7,Math.PI/3*e*1.1),a.add(i)}a.add(new A(new F(.28,32,32),new S({color:657940,roughness:.9,transparent:!0,opacity:.7})));const o=new C,M=new S({color:15776011,emissive:15776011,emissiveIntensity:.5});for(let e=0;e<8;e++){const i=new A(new F(.075,16,16),M),n=Math.PI*2/8*e;i.position.set(Math.cos(n)*2.35,0,Math.sin(n)*2.35),o.add(i)}a.add(o);const v=90,p=new Float32Array(v*3);for(let e=0;e<v*3;e+=3){const i=Math.random()*Math.PI*2,n=Math.acos(2*Math.random()-1),r=2.4+Math.random()*.8;p[e]=r*Math.sin(n)*Math.cos(i),p[e+1]=r*Math.sin(n)*Math.sin(i),p[e+2]=r*Math.cos(n)}const y=new N;y.setAttribute("position",new D(p,3));const u=new G(y,new U({color:15776011,size:.022,transparent:!0,opacity:.55,blending:O,depthWrite:!1}));a.add(u),l.add(new R(1710643,.6));const f=new k(16777215,2.8);f.position.set(0,8,2),l.add(f);const b=new k(15776011,.7);b.position.set(-4,2,-4),l.add(b);const w=new k(8952268,.4);w.position.set(0,-1,-5),l.add(w),l.add(new W(15776011,.4,5));function I(){x=requestAnimationFrame(I),a.rotation.x+=.002,a.rotation.y+=.006,o.rotation.y+=.01,o.rotation.x+=.004,u.rotation.y+=.002,u.rotation.x+=.001,h.render(l,s)}I()}export{$ as renderLandingPage};
