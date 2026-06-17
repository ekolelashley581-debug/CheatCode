import { createClient } from '@supabase/supabase-js';
import {
    getOrCreateCurrentSession,
    saveMessage,
    updateSessionTitle,
    getSession,
    getSessionsByCourse,
    createSession as createLocalSession,
} from '../sessions/supabase-session-manager.js';
import { solveNumerically } from '../universalEngine.js';
import { detectVisualType, showVisualPanel } from '../visuals.js';
import { cleanMessage } from '../utils/message-cleaner.js';
import { db } from '../db.js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================
// HELPERS
// ============================================

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function escapeHtmlForIframe(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/'/g, '&#39;')
        .replace(/"/g, '&quot;');
}

// LaTeX-safe markdown: stash math blocks, run marked, restore.
function formatMessage(text) {
    if (!text) return '';
    const stash = [];
    let safe = text.replace(
        /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)|\$[^$\n]+?\$)/g,
        (m) => { stash.push(m); return `@@M${stash.length - 1}@@`; }
    );
    if (typeof marked !== 'undefined') {
        marked.setOptions({ breaks: true, gfm: true });
        safe = marked.parse(safe);
    } else {
        safe = safe.replace(/\n/g, '<br>');
    }
    return safe.replace(/@@M(\d+)@@/g, (_, i) =>
        stash[+i].replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    );
}

function autoResize(el) {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 140) + 'px';
}

async function checkAndResetDailyLimit(profile) {
    if (!profile) return { allowed: true, remaining: 10 };
    if (profile.status === 'paid') return { allowed: true, remaining: Infinity };
    const today = new Date().toDateString();
    if (profile.last_reset_date !== today) {
        await supabase.from('profiles')
            .update({ queries_today: 0, last_reset_date: today })
            .eq('id', profile.id);
        profile.queries_today = 0;
        profile.last_reset_date = today;
        return { allowed: true, remaining: profile.query_limit || 10 };
    }
    const remaining = (profile.query_limit || 10) - (profile.queries_today || 0);
    return { allowed: remaining > 0, remaining: Math.max(0, remaining) };
}

function checkTrialStatus(profile) {
    if (!profile) return { active: true };
    if (profile.status === 'paid') return { active: true, isPaid: true };
    const now = new Date();
    if (now > new Date(profile.trial_end)) return { active: false, expired: true };
    return { active: true, daysLeft: Math.ceil((new Date(profile.trial_end) - now) / 86400000) };
}

// ── forceSaveSession: reads sessionId safely ────────────────────────────
// Defined outside renderStudyPage so it can be called even after cleanup.
let _activeSessionId = null;
let _activeMessages  = [];

function forceSaveSession() {
    if (!_activeSessionId) return;
    localStorage.setItem('cc_last_session_id',   _activeSessionId);
    localStorage.setItem('cc_resume_session_id', _activeSessionId);
}

// ============================================
// AI CALL
// ============================================
async function callAI(messages, options = {}) {
    const { mode = 'learn', guidanceTool = null, isPro = false } = options;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) throw new Error('Not authenticated. Please sign in again.');

    const res = await fetch(`${SUPABASE_URL}/functions/v1/ai-chat`, {
        method: 'POST',
        headers: {
            'Content-Type':  'application/json',
            'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ messages, mode, guidanceTool, isPro, temperature: 0.3, max_tokens: 3000 }),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `AI error ${res.status}`);
    }
    const data = await res.json();
    return { content: data.choices?.[0]?.message?.content || '' };
}

// ============================================
// MAIN EXPORT
// ============================================
export async function renderStudyPage(state, _supabase, navigateTo) {
    const page = document.getElementById('page-study');
    if (!page) return;
    if (!state.user) { navigateTo('signin'); return; }

    // ── State ────────────────────────────────
    let messages         = [];
    let currentSession   = null;
    let teachingMode     = 'learn';
    let guidanceTool     = null;
    let uploadedContent  = null;
    let uploadedFileName = null;
    let currentCourse    = null;
    let sessionStart     = Date.now();
    let isPro            = state.profile?.status === 'paid';
    let questionsLeft    = isPro
        ? Infinity
        : Math.max(0, (state.profile?.query_limit || 10) - (state.profile?.queries_today || 0));

    // Expired
    if (state.profile?.status === 'expired') {
        page.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:center;height:100%;padding:40px;">
                <div style="text-align:center;max-width:380px;">
                    <div style="font-size:32px;font-weight:700;color:var(--gold);margin-bottom:12px;">C</div>
                    <h2 style="margin-bottom:8px;">Free trial ended</h2>
                    <p style="color:var(--text2);font-size:13px;margin-bottom:24px;">
                        Upgrade to Pro — $7.99 one-time. Unlimited questions, all features.
                    </p>
                    <button class="btn btn-primary" id="expUp" style="width:100%;margin-bottom:8px;">Upgrade — $7.99</button>
                    <button class="btn btn-secondary" id="expDash" style="width:100%;">Dashboard</button>
                </div>
            </div>`;
        document.getElementById('expUp')?.addEventListener('click', () => navigateTo('payment'));
        document.getElementById('expDash')?.addEventListener('click', () => navigateTo('dashboard'));
        return;
    }

    // ── Read localStorage keys BEFORE any rendering ──────────────────────
    const resumeId      = localStorage.getItem('cc_resume_session_id')
                       || localStorage.getItem('cc_last_session_id');
    const preContent    = localStorage.getItem('cc_study_material');
    const preTitle      = localStorage.getItem('cc_study_title');
    const preCourse     = localStorage.getItem('cc_study_course');

    // Clear resume key immediately so double-reload doesn't loop
    localStorage.removeItem('cc_resume_session_id');

    if (preContent)  { uploadedContent = preContent; uploadedFileName = preTitle; localStorage.removeItem('cc_study_material'); localStorage.removeItem('cc_study_title'); }
    if (preCourse)   { currentCourse = preCourse; localStorage.removeItem('cc_study_course'); }

    // ── Load session BEFORE rendering HTML ────────────────────────────────
    if (resumeId) {
        const sess = await getSession(resumeId);
        if (sess && sess.messages?.length > 0) {
            currentSession = sess;
            messages       = sess.messages;
            currentCourse  = sess.courseId || currentCourse;
            teachingMode   = sess.mode     || 'learn';
            guidanceTool   = sess.guidanceTool || null;
        }
    }

    // Sync to module-level vars used by forceSaveSession
    _activeSessionId = currentSession?.sessionId || null;
    _activeMessages  = messages;

    // ── Render HTML ──────────────────────────────────────────────────────
    page.innerHTML = `
        <div class="study-container">
            <div class="focus-bar sticky-top">
                <div class="focus-info">
                    <span class="focus-label">Course</span>
                    <select id="courseSelect" class="course-select">
                        <option value="">Select course...</option>
                    </select>
                    <span id="contextBadge" class="context-badge ${uploadedContent ? 'has-material' : ''}">
                        ${uploadedContent ? (uploadedFileName?.substring(0,30) || 'Material loaded') : 'No materials'}
                    </span>
                </div>
                <div class="focus-stats">
                    ${!isPro
                        ? `<span class="limit-indicator" id="questionsLeftLabel">${questionsLeft === Infinity ? 'Unlimited' : questionsLeft + ' left'}</span>`
                        : `<span class="pro-indicator">Pro</span>`}
                    <span id="timer" class="timer">00:00</span>
                    <button class="btn-sm" id="newSessionBtn">New</button>
                    <button class="btn-sm" id="backToLibraryBtn">Library</button>
                </div>
            </div>

            <div class="mode-bar sticky-top">
                <span class="mode-label">Mode:</span>
                <button class="mode-btn ${teachingMode==='learn'?'active':''}"    data-mode="learn">Learn</button>
                <button class="mode-btn ${teachingMode==='practice'?'active':''}" data-mode="practice">Practice</button>
                <button class="mode-btn ${teachingMode==='quick'?'active':''}"    data-mode="quick">Quick</button>
                <button class="mode-btn ${teachingMode==='urgent'?'active':''}"   data-mode="urgent">Urgent</button>
            </div>

            <div class="cmd-bar sticky-top">
                <span class="mode-label">Tools:</span>
                <button class="cmd-btn ${guidanceTool==='deconstruct'?'active':''}"     data-cmd="deconstruct">Deconstruct</button>
                <button class="cmd-btn ${guidanceTool==='analogy'?'active':''}"         data-cmd="analogy">Analogy</button>
                <button class="cmd-btn ${guidanceTool==='firstprinciples'?'active':''}" data-cmd="firstprinciples">First Principles</button>
                <button class="cmd-btn ${guidanceTool==='socratic'?'active':''}"        data-cmd="socratic">Socratic</button>
                <button class="cmd-btn ${guidanceTool==='visualize'?'active':''}"       data-cmd="visualize">Visualize</button>
                <button class="cmd-btn ${guidanceTool==='testme'?'active':''}"          data-cmd="testme">Test Me</button>
            </div>

            <div id="guidanceIndicator" class="guidance-indicator" style="display:${guidanceTool?'flex':'none'};">
                <span class="guidance-label">Active Tool:</span>
                <span id="guidanceValue" class="guidance-value">${guidanceTool || ''}</span>
                <button id="clearGuidance" class="guidance-clear">Clear</button>
            </div>

            <div class="chat-area">
                <div class="chat-messages" id="chatMessages"></div>
                <div id="typing" style="display:none;padding:10px 20px;color:var(--text3);font-size:12px;">
                    CheatCode is thinking<span class="typing-dots"></span>
                </div>
            </div>

            <div class="input-bar">
                <textarea id="chatInput" class="chat-input" placeholder="Ask anything…" rows="1"></textarea>
                <button class="send-btn" id="sendBtn">→</button>
            </div>
        </div>`;

    injectStudyStyles();

    // ── Courses ──────────────────────────────────────────────────────────
    try {
        await db.open();
        const courses = await db.courses.toArray();
        const sel = document.getElementById('courseSelect');
        if (sel && courses.length > 0) {
            sel.innerHTML = '<option value="">Select course...</option>';
            courses.forEach(c => {
                const o = document.createElement('option');
                o.value = c.id;
                o.textContent = `${c.code || ''} ${c.code ? '—' : ''} ${c.name || ''}`.trim();
                if (String(c.id) === String(currentCourse)) o.selected = true;
                sel.appendChild(o);
            });
        }
    } catch(e) { console.warn('[Study] Dexie:', e.message); }

    // ── Message display helpers ──────────────────────────────────────────

    function scrollDown() {
        setTimeout(() => {
            const c = document.getElementById('chatMessages');
            if (c) c.scrollTop = c.scrollHeight;
        }, 50);
    }

    function addUserMessage(text) {
        const c = document.getElementById('chatMessages');
        if (!c) return;
        const el = document.createElement('div');
        el.className = 'msg msg-user';
        el.innerHTML = `<div class="msg-content"><div class="msg-bubble">${escapeHtml(text)}</div></div><div class="msg-avatar">U</div>`;
        c.appendChild(el);
        scrollDown();
    }

    function addAssistantMessage(text) {
        const c = document.getElementById('chatMessages');
        if (!c) return;
        const el = document.createElement('div');
        el.className = 'msg msg-assistant';
        el.innerHTML = `<div class="msg-avatar">C</div><div class="msg-content"><div class="msg-bubble">${formatMessage(text)}</div></div>`;
        c.appendChild(el);
        scrollDown();
        if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
            MathJax.typesetPromise([el]).catch(() => {});
        }
    }

    function addSystemMessage(text, isErr = false) {
        const c = document.getElementById('chatMessages');
        if (!c) return;
        const el = document.createElement('div');
        el.style.cssText = `text-align:center;padding:5px 16px;font-size:11px;color:${isErr ? 'var(--red)' : 'var(--text3)'};`;
        el.textContent = text;
        c.appendChild(el);
        scrollDown();
    }

    function displayMessages() {
        const c = document.getElementById('chatMessages');
        if (!c) return;
        c.innerHTML = '';
        for (const m of messages) {
            if (m.role === 'user') addUserMessage(m.content);
            else if (m.role === 'assistant') addAssistantMessage(m.content);
            else if (m.role === 'visual' && m.visualCode) addVisualToChat(m.visualCode, m.id);
        }
        scrollDown();
    }

    function addWelcomeMessage() {
        const c = document.getElementById('chatMessages');
        if (!c || c.children.length > 0) return;
        addAssistantMessage(
            `**Welcome to CheatCode**\n\nYour AI study companion. Getting started:\n\n` +
            `- Upload materials in **Library** (PDFs, images, notes)\n` +
            `- Choose a **Mode**: Learn · Practice · Quick · Urgent\n` +
            `- Use **Tools**: Deconstruct, Analogy, Socratic, Visualize\n\n` +
            `Ask me anything. I teach from what you upload.`
        );
    }

    // ── Visual card ──────────────────────────────────────────────────────

    function addVisualToChat(html, vid) {
        const c = document.getElementById('chatMessages');
        if (!c || !html) return;

        let enhanced = html;
        if (/THREE\./.test(enhanced) && !/three(\.min)?\.js/.test(enhanced))
            enhanced = enhanced.replace('</head>', '<scr' + 'ipt src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></scr' + 'ipt>\n</head>');
        if (/new Chart\(/.test(enhanced) && !/chart\.js/.test(enhanced))
            enhanced = enhanced.replace('</head>', '<scr' + 'ipt src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></scr' + 'ipt>\n</head>');

        const cid = vid || `vis_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
        const is3d = /THREE\./.test(enhanced);
        let exp = false;

        const card = document.createElement('div');
        card.className = 'msg msg-assistant';
        card.setAttribute('data-visual-id', cid);
        card.innerHTML = `
            <div class="msg-avatar">V</div>
            <div class="msg-content" style="max-width:100%;width:100%;">
                <div class="visual-card">
                    <div class="visual-header">
                        <span class="visual-title">Interactive Visualization</span>
                        <div class="visual-actions">
                            <button id="exp-${cid}">Expand</button>
                            <button id="fs-${cid}">Full Screen</button>
                        </div>
                    </div>
                    <div id="prev-${cid}">
                        <iframe srcdoc="${escapeHtmlForIframe(enhanced)}"
                            style="width:100%;height:${is3d?'320px':'260px'};border:none;background:#fff;"
                            sandbox="allow-scripts allow-same-origin" loading="lazy"></iframe>
                    </div>
                    <div id="full-${cid}" style="display:none;">
                        <iframe srcdoc="${escapeHtmlForIframe(enhanced)}"
                            style="width:100%;height:${is3d?'70vh':'60vh'};border:none;background:#fff;"
                            sandbox="allow-scripts allow-same-origin"></iframe>
                    </div>
                </div>
            </div>`;
        c.appendChild(card);

        document.getElementById(`exp-${cid}`)?.addEventListener('click', function() {
            exp = !exp;
            document.getElementById(`prev-${cid}`).style.display = exp ? 'none' : 'block';
            document.getElementById(`full-${cid}`).style.display = exp ? 'block' : 'none';
            this.textContent = exp ? 'Collapse' : 'Expand';
        });
        document.getElementById(`fs-${cid}`)?.addEventListener('click', () => {
            const w = window.open('', '_blank', 'width=1200,height=800');
            if (w) { w.document.write(enhanced); w.document.close(); }
        });
        scrollDown();
    }

    // ── INITIAL DISPLAY (session already loaded above) ───────────────────
    if (messages.length > 0) {
        displayMessages();
        addSystemMessage(`Resumed: "${currentSession?.title || 'Session'}"`);
    } else {
        addWelcomeMessage();
    }

    // ── Local helper that keeps module-level vars in sync ────────────────
    function saveSessionPointer() {
        _activeSessionId = currentSession?.sessionId || null;
        _activeMessages  = messages;
        forceSaveSession();
    }

    // ── Heartbeat ────────────────────────────────────────────────────────
    const heartbeat = setInterval(saveSessionPointer, 30000);
    document.addEventListener('visibilitychange', () => { if (document.hidden) saveSessionPointer(); });
    window.addEventListener('beforeunload', saveSessionPointer);

    // ── Cleanup on navigate away ─────────────────────────────────────────
    // (clears interval so it doesn't fire after the page is removed)
    const observer = new MutationObserver(() => {
        if (!document.contains(page)) {
            clearInterval(heartbeat);
            clearInterval(timerInterval);
            observer.disconnect();
        }
    });
    observer.observe(document.body, { childList: true, subtree: false });

    // ── Numerical solver ─────────────────────────────────────────────────

    async function tryNumericalSolve(q) {
        try {
            const r = solveNumerically(q);
            if (r?.engine && r?.result) {
                let t = `**${r.engine}**\n\n`;
                for (const [k,v] of Object.entries(r.result)) {
                    if (v != null) t += `- **${k}**: ${v}\n`;
                }
                return t + '\n*Computed locally.*';
            }
        } catch {}
        return null;
    }

    // ── Visualization handler ────────────────────────────────────────────

    async function handleVisualization(question) {
        try {
            const res = await callAI([
                { role: 'system', content:
`Generate a COMPLETE self-contained HTML visualization.
Rules:
- HTML/CSS/JS only. No Python.
- 2D charts: Chart.js from https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js
- 3D: Three.js from https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js + OrbitControls + AxesHelper + GridHelper
- Show axis labels, units, key values on screen. Add sliders for parameters.
- White background (#ffffff). Gold (#d4a000) highlights, dark text (#1a1a2e).
- Return ONLY the HTML inside a single \`\`\`html code block.` },
                { role: 'user', content: question },
            ], { mode: teachingMode, guidanceTool: 'visualize', isPro });

            const cleaned = cleanMessage(res.content);
            const visuals = cleaned.visuals || [];

            if (visuals.length > 0) {
                visuals.forEach((h, i) => addVisualToChat(h, `vis_${Date.now()}_${i}`));
                if (currentSession) {
                    for (const v of visuals) await saveMessage(currentSession.sessionId, 'visual', '[Visualization]', v);
                    saveSessionPointer();
                }
                return true;
            }

            // Fallback to algorithmic 3D
            const vt = detectVisualType(question);
            if (vt) {
                let tmp = document.getElementById('__visTemp');
                if (!tmp) { tmp = document.createElement('div'); tmp.id = '__visTemp'; tmp.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:800px;height:500px;'; document.body.appendChild(tmp); }
                tmp.innerHTML = '';
                showVisualPanel('__visTemp', { type: vt.type, params: {} });
                await new Promise(r => setTimeout(r, 500));
                const iframe = tmp.querySelector('iframe');
                if (iframe?.srcdoc) { addVisualToChat(iframe.srcdoc, `vis_${vt.type}_${Date.now()}`); tmp.innerHTML = ''; return true; }
                tmp.innerHTML = '';
            }

            // Last resort: just show AI text
            const reply = cleaned.cleaned || res.content;
            if (reply) addAssistantMessage(reply);
            return false;

        } catch(err) {
            addSystemMessage(`Visualization failed: ${err.message}`, true);
            return false;
        }
    }

    // ── Increment profile ────────────────────────────────────────────────

    async function incrementProfile() {
        if (isPro || !state.profile) return;
        state.profile.queries_today = (state.profile.queries_today || 0) + 1;
        await supabase.from('profiles').update({ queries_today: state.profile.queries_today }).eq('id', state.profile.id);
        const rem = Math.max(0, (state.profile.query_limit || 10) - state.profile.queries_today);
        questionsLeft = rem;
        const lbl = document.getElementById('questionsLeftLabel');
        if (lbl) lbl.textContent = `${rem} left`;
    }

    // ── SEND MESSAGE ─────────────────────────────────────────────────────

    async function sendMessage() {
        const input   = document.getElementById('chatInput');
        const sendBtn = document.getElementById('sendBtn');
        const typing  = document.getElementById('typing');
        const msg     = input?.value.trim();
        if (!msg) return;
        input.value = '';
        autoResize(input);

        // Trial check
        if (!checkTrialStatus(state.profile).active && !isPro) {
            addSystemMessage('Your free trial has ended. Upgrade to continue.', true);
            const el = document.createElement('div');
            el.className = 'msg msg-assistant';
            el.innerHTML = `<div class="msg-avatar">C</div><div class="msg-content"><div class="msg-bubble"><p>Trial ended.</p><div style="display:flex;gap:8px;margin-top:8px;"><button id="tupBtn" class="btn-sm" style="background:var(--gold);color:#000;">Upgrade $7.99</button><button id="tdashBtn" class="btn-sm">Dashboard</button></div></div></div>`;
            document.getElementById('chatMessages')?.appendChild(el);
            scrollDown();
            document.getElementById('tupBtn')?.addEventListener('click', () => navigateTo('payment'));
            document.getElementById('tdashBtn')?.addEventListener('click', () => navigateTo('dashboard'));
            return;
        }

        // Daily limit
        const lim = await checkAndResetDailyLimit(state.profile);
        if (!lim.allowed && !isPro) {
            addSystemMessage('Daily question limit reached. Upgrade to Pro for unlimited.', true);
            return;
        }

        // Create session lazily (first message only)
        if (!currentSession) {
            currentSession = await createLocalSession(currentCourse ? parseInt(currentCourse) : null, teachingMode, guidanceTool);
            saveSessionPointer();
        }

        // ── Numerical solver ──
        const numResult = await tryNumericalSolve(msg);
        if (numResult) {
            messages.push({ role:'user', content:msg });
            messages.push({ role:'assistant', content:numResult });
            addUserMessage(msg);
            addAssistantMessage(numResult);
            await saveMessage(currentSession.sessionId, 'user', msg);
            await saveMessage(currentSession.sessionId, 'assistant', numResult);
            saveSessionPointer();
            await incrementProfile();
            input?.focus();
            return;
        }

        // ── Visualization ──
        const isVis = /visualize|visualise|show me|draw|plot|graph|3d|diagram|chart|heatmap|surface|beam|bmd|sfd|mohr|wave|sine|cosine|faraday|electromagnetic|dam|truss|circuit/i.test(msg);
        if (isVis || guidanceTool === 'visualize') {
            messages.push({ role:'user', content:msg });
            addUserMessage(msg);
            if (typing) typing.style.display = 'block';
            await handleVisualization(msg);
            if (typing) typing.style.display = 'none';
            await saveMessage(currentSession.sessionId, 'user', msg);
            saveSessionPointer();
            await incrementProfile();
            input?.focus();
            return;
        }

        // ── AI call ──
        messages.push({ role:'user', content:msg });
        addUserMessage(msg);
        if (typing) typing.style.display = 'block';
        if (sendBtn) sendBtn.disabled = true;

        try {
            const ctxMsgs = [];
            if (uploadedContent) {
                ctxMsgs.push({ role:'system', content:`Material: "${uploadedFileName}"\n\n${uploadedContent.substring(0,5000)}\n\nTeach from this only.` });
            }
            const res = await callAI([...ctxMsgs, ...messages.slice(-20)], { mode:teachingMode, guidanceTool, isPro });
            const cleaned = cleanMessage(res.content);
            const reply   = cleaned.cleaned || res.content;
            const visuals = cleaned.visuals || [];

            messages.push({ role:'assistant', content:reply });
            addAssistantMessage(reply);
            visuals.forEach((h,i) => addVisualToChat(h, `${currentSession.sessionId}_${Date.now()}_${i}`));

            // Auto-title on first exchange
            if (messages.length === 2 && currentSession) {
                const title = msg.substring(0,50).replace(/[?!.]/g,'').trim();
                if (title) { await updateSessionTitle(currentSession.sessionId, title); currentSession.title = title; }
            }

            await saveMessage(currentSession.sessionId, 'user', msg);
            await saveMessage(currentSession.sessionId, 'assistant', reply);
            for (const v of visuals) await saveMessage(currentSession.sessionId, 'visual', '[Visualization]', v);
            saveSessionPointer();
            await incrementProfile();

        } catch(err) {
            addSystemMessage(`Error: ${err.message}`, true);
            console.error('[Study] AI error:', err);
        }

        if (typing) typing.style.display = 'none';
        if (sendBtn) sendBtn.disabled = false;
        input?.focus();
    }

    // ── EVENT LISTENERS ──────────────────────────────────────────────────

    document.getElementById('backToLibraryBtn')?.addEventListener('click', () => navigateTo('library'));

    document.getElementById('newSessionBtn')?.addEventListener('click', async () => {
        if (messages.length > 0 && !confirm('Start new session? Current session is saved.')) return;
        saveSessionPointer();
        messages = [];
        currentSession = await createLocalSession(
            currentCourse ? parseInt(currentCourse) : null, teachingMode, guidanceTool
        );
        saveSessionPointer();
        const c = document.getElementById('chatMessages');
        if (c) c.innerHTML = '';
        addWelcomeMessage();
        addSystemMessage('New session started.');
    });

    document.querySelectorAll('.mode-btn').forEach(btn => btn.addEventListener('click', function() {
        teachingMode = this.dataset.mode;
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        addSystemMessage(`Mode: ${teachingMode.toUpperCase()}`);
    }));

    document.querySelectorAll('.cmd-btn').forEach(btn => btn.addEventListener('click', function() {
        const cmd = this.dataset.cmd;
        guidanceTool = guidanceTool === cmd ? null : cmd;
        document.querySelectorAll('.cmd-btn').forEach(b => b.classList.toggle('active', b.dataset.cmd === guidanceTool));
        const ind = document.getElementById('guidanceIndicator');
        const val = document.getElementById('guidanceValue');
        if (guidanceTool) {
            if (ind) ind.style.display = 'flex';
            if (val) val.textContent = guidanceTool;
            addSystemMessage(`Tool: ${guidanceTool}`);
        } else {
            if (ind) ind.style.display = 'none';
            addSystemMessage('Tool cleared.');
        }
    }));

    document.getElementById('clearGuidance')?.addEventListener('click', () => {
        guidanceTool = null;
        document.querySelectorAll('.cmd-btn').forEach(b => b.classList.remove('active'));
        const ind = document.getElementById('guidanceIndicator');
        if (ind) ind.style.display = 'none';
        addSystemMessage('Tool cleared.');
    });

    document.getElementById('sendBtn')?.addEventListener('click', sendMessage);
    document.getElementById('chatInput')?.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    });
    document.getElementById('chatInput')?.addEventListener('input', function() { autoResize(this); });

    document.getElementById('courseSelect')?.addEventListener('change', async function() {
        currentCourse = this.value;
        if (!currentCourse) return;

        const sessions = await getSessionsByCourse(parseInt(currentCourse));
        const withMsgs = sessions.find(s => s.messageCount > 0 || s.message_count > 0);

        if (withMsgs) {
            const full = await getSession(withMsgs.sessionId);
            if (full && full.messages?.length > 0) {
                currentSession = full;
                messages       = full.messages;
                displayMessages();
                addSystemMessage(`Loaded: "${full.title}"`);
                saveSessionPointer();
                return;
            }
        }

        currentSession = null;
        messages = [];
        saveSessionPointer();
        addWelcomeMessage();
        addSystemMessage('No previous session for this course.');
    });

    // Timer
    const timerInterval = setInterval(() => {
        const e = Math.floor((Date.now() - sessionStart) / 1000);
        const el = document.getElementById('timer');
        if (el) el.textContent = `${String(Math.floor(e/60)).padStart(2,'0')}:${String(e%60).padStart(2,'0')}`;
        else clearInterval(timerInterval);
    }, 1000);

    setTimeout(() => document.getElementById('chatInput')?.focus(), 200);
}

// ============================================
// CSS
// ============================================

function injectStudyStyles() {
    if (document.getElementById('study-page-styles')) return;
    const s = document.createElement('style');
    s.id = 'study-page-styles';
    s.textContent = `
        .study-container { display:flex; flex-direction:column; height:100%; background:var(--bg); color:var(--text); overflow:hidden; }
        .sticky-top { position:sticky; top:0; z-index:50; }
        .focus-bar { display:flex; justify-content:space-between; align-items:center; padding:8px 16px; background:var(--elevated); border-bottom:var(--border,1px solid rgba(255,255,255,0.08)); flex-wrap:wrap; gap:8px; flex-shrink:0; }
        .focus-info { display:flex; align-items:center; gap:10px; flex-wrap:wrap; min-width:0; }
        .focus-label { font-size:11px; color:var(--text3); text-transform:uppercase; letter-spacing:.5px; flex-shrink:0; }
        .course-select { background:var(--input,var(--bg)); border:1px solid rgba(255,255,255,.1); border-radius:6px; padding:7px 10px; color:var(--text); font-size:13px; cursor:pointer; min-width:140px; max-width:100%; }
        .course-select:focus { outline:none; border-color:var(--gold); }
        .context-badge { font-size:10px; color:var(--text3); }
        .context-badge.has-material { color:var(--gold); }
        .focus-stats { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
        .limit-indicator { color:var(--gold); font-size:12px; font-weight:600; }
        .pro-indicator { color:var(--green); font-size:12px; font-weight:600; }
        .timer { font-family:var(--mono,monospace); font-size:12px; background:var(--bg); padding:3px 8px; border-radius:20px; border:1px solid rgba(255,255,255,.06); }
        .mode-bar,.cmd-bar { display:flex; align-items:center; gap:4px; padding:7px 16px; background:var(--surface); border-bottom:1px solid rgba(255,255,255,.05); overflow-x:auto; flex-shrink:0; -webkit-overflow-scrolling:touch; }
        .mode-label { font-size:10px; color:var(--text3); margin-right:4px; white-space:nowrap; flex-shrink:0; }
        .mode-btn,.cmd-btn { background:transparent; border:1px solid transparent; padding:6px 12px; border-radius:16px; font-size:12px; cursor:pointer; color:var(--text2); transition:all .15s; white-space:nowrap; flex-shrink:0; }
        .mode-btn:hover,.cmd-btn:hover { background:var(--elevated); color:var(--text); }
        .mode-btn.active,.cmd-btn.active { background:var(--gold-dim,rgba(212,160,0,.12)); color:var(--gold); border-color:var(--gold-border,rgba(212,160,0,.3)); font-weight:600; }
        .guidance-indicator { padding:6px 16px; background:var(--gold-dim,rgba(212,160,0,.08)); font-size:11px; color:var(--gold); align-items:center; gap:8px; border-bottom:1px solid var(--gold-border,rgba(212,160,0,.2)); flex-shrink:0; }
        .guidance-label { color:var(--text3); text-transform:uppercase; letter-spacing:.5px; font-size:9px; }
        .guidance-value { font-weight:600; text-transform:capitalize; }
        .guidance-clear { background:none; border:none; color:var(--text3); cursor:pointer; padding:2px 6px; border-radius:4px; font-size:11px; margin-left:auto; }
        .guidance-clear:hover { background:rgba(255,255,255,.08); color:var(--gold); }
        .chat-area { flex:1; overflow-y:auto; display:flex; flex-direction:column; min-height:0; }
        .chat-messages { flex:1; padding:16px; display:flex; flex-direction:column; gap:16px; }
        .msg { display:flex; gap:10px; max-width:88%; animation:fadeIn .2s ease; }
        .msg-user { align-self:flex-end; flex-direction:row-reverse; }
        .msg-assistant { align-self:flex-start; }
        .msg-avatar { width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:12px; flex-shrink:0; background:var(--elevated); color:var(--text2); }
        .msg-user .msg-avatar { background:var(--gold-dim,rgba(212,160,0,.15)); color:var(--gold); }
        .msg-content { flex:1; min-width:0; }
        .msg-user .msg-content { text-align:right; }
        .msg-bubble { background:var(--elevated); padding:10px 14px; border-radius:4px 16px 16px 16px; font-size:14px; line-height:1.6; display:inline-block; max-width:100%; text-align:left; overflow-wrap:break-word; }
        .msg-user .msg-bubble { background:var(--gold-dim,rgba(212,160,0,.15)); color:var(--gold); border-radius:16px 4px 16px 16px; }
        .msg-assistant .msg-bubble { border-left:3px solid var(--gold); }
        .msg-bubble p { margin:4px 0; }
        .msg-bubble p:first-child { margin-top:0; }
        .msg-bubble p:last-child { margin-bottom:0; }
        .msg-bubble h1,.msg-bubble h2,.msg-bubble h3 { color:var(--gold); margin:8px 0 4px; }
        .msg-bubble h1{font-size:18px;} .msg-bubble h2{font-size:16px;} .msg-bubble h3{font-size:14px;}
        .msg-bubble strong { color:var(--gold); }
        .msg-bubble code { color:var(--gold); background:rgba(0,0,0,.2); padding:2px 4px; border-radius:4px; font-family:var(--mono,monospace); font-size:12px; }
        .msg-bubble pre { background:rgba(0,0,0,.3); padding:12px; border-radius:8px; overflow-x:auto; margin:8px 0; }
        .msg-bubble pre code { background:none; padding:0; color:var(--text); }
        .msg-bubble ul,.msg-bubble ol { margin:6px 0; padding-left:22px; }
        .msg-bubble li { margin:3px 0; }
        .msg-bubble a { color:var(--gold); text-decoration:underline; }
        .msg-bubble mjx-container { font-size:105%!important; overflow-x:auto; max-width:100%; }
        .msg-bubble mjx-container[display="true"] { margin:10px 0!important; }
        .typing-dots::after { content:''; animation:typingDots 1.4s infinite; }
        @keyframes typingDots { 0%{content:'.'} 33%{content:'..'} 66%{content:'...'} 100%{content:''} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }
        .visual-card { border:1px solid var(--gold-border,rgba(212,160,0,.3)); border-radius:8px; overflow:hidden; background:#fff; margin-top:4px; width:100%; max-width:100%; }
        .visual-header { display:flex; justify-content:space-between; align-items:center; padding:7px 12px; background:var(--elevated); border-bottom:1px solid rgba(255,255,255,.08); }
        .visual-title { font-size:11px; color:var(--gold); font-weight:600; }
        .visual-actions { display:flex; gap:6px; }
        .visual-actions button { background:none; border:none; color:var(--text3); cursor:pointer; font-size:11px; padding:4px 10px; border-radius:4px; transition:all .15s; }
        .visual-actions button:hover { background:rgba(255,255,255,.1); color:var(--gold); }
        iframe { display:block; width:100%; max-width:100%; }
        .input-bar { display:flex; align-items:flex-end; gap:8px; padding:10px 12px; background:var(--elevated); border-top:1px solid rgba(255,255,255,.08); flex-shrink:0; }
        .chat-input { flex:1; background:var(--bg); border:1px solid rgba(255,255,255,.1); border-radius:18px; padding:11px 16px; color:var(--text); font-size:16px; resize:none; font-family:inherit; max-height:120px; overflow-y:auto; line-height:1.4; }
        .chat-input:focus { outline:none; border-color:var(--gold); }
        .chat-input::placeholder { color:var(--text3); }
        .send-btn { background:var(--gold); border:none; width:42px; height:42px; border-radius:50%; cursor:pointer; font-size:17px; font-weight:700; color:#000; transition:all .2s; flex-shrink:0; display:flex; align-items:center; justify-content:center; }
        .send-btn:hover { background:var(--gold-hover,#e0b800); }
        .send-btn:disabled { opacity:.4; cursor:not-allowed; }
        .btn-sm { padding:6px 12px; font-size:12px; border-radius:6px; cursor:pointer; background:rgba(255,255,255,.08); border:none; color:var(--text); transition:all .2s; white-space:nowrap; }
        .btn-sm:hover { background:rgba(255,255,255,.15); }
        @media(max-width:768px){
            .focus-bar{padding:8px 10px;gap:6px;} .focus-info{width:100%;justify-content:space-between;} .focus-stats{width:100%;justify-content:space-between;}
            .course-select{flex:1;min-width:0;font-size:14px;padding:9px 10px;} .context-badge{display:none;}
            .mode-bar,.cmd-bar{padding:6px 10px;} .mode-btn,.cmd-btn{padding:8px 13px;font-size:12px;} .mode-label{display:none;}
            .chat-messages{padding:12px;gap:12px;} .msg{max-width:95%;} .msg-avatar{width:26px;height:26px;font-size:11px;} .msg-bubble{font-size:14px;padding:10px 13px;}
            .input-bar{padding:8px;} .chat-input{font-size:16px;padding:12px 14px;} .send-btn{width:46px;height:46px;font-size:18px;}
            .btn-sm{padding:8px 12px;font-size:12px;} .timer{font-size:11px;padding:4px 8px;}
        }
    `;
    document.head.appendChild(s);
}
