import { supabase } from '../supabase.js';
import { getRecentSessions } from '../sessions/supabase-session-manager.js';

export async function renderDashboardPage(state, _supabase, navigateTo) {
    const page = document.getElementById('page-dashboard');
    if (!page) return;
    if (!state.user) { navigateTo('signin'); return; }

    // Refresh profile if missing
    let profile = state.profile;
    if (!profile) {
        const { data } = await supabase.from('profiles').select('*').eq('id', state.user.id).single();
        profile = data;
        state.profile = data;
    }

    // Load recent sessions with real message counts
    let sessions = [];
    let totalStudyMinutes = 0;

    try {
        sessions = await getRecentSessions(10);
        totalStudyMinutes = sessions.reduce(
            (sum, s) => sum + (s.duration || Math.min((s.message_count || 0) * 2, 60)), 0
        );
    } catch (e) {
        console.warn('[Dashboard] getRecentSessions error:', e.message);
    }

    const isPaid        = profile?.status === 'paid';
    const trialDaysLeft = profile?.trial_end
        ? Math.max(0, Math.ceil((new Date(profile.trial_end) - new Date()) / 86400000))
        : 7;
    const questionsLeft = isPaid
        ? Infinity
        : Math.max(0, (profile?.query_limit || 10) - (profile?.queries_today || 0));
    const trialDay = profile?.trial_start
        ? Math.ceil((new Date() - new Date(profile.trial_start)) / 86400000)
        : 1;

    page.innerHTML = `
        <div class="dashboard-layout">

            <!-- Greeting -->
            <div class="dash-top">
                <div class="dash-greeting">
                    <div class="dash-avatar">${(profile?.first_name || '?')[0].toUpperCase()}</div>
                    <div>
                        <h2>Welcome back, ${esc(profile?.first_name || 'Student')}</h2>
                        <p style="color:var(--text2);font-size:12px;">
                            ${isPaid ? 'Pro Member' : 'Free Trial — Day ' + trialDay + ' of 7'}
                        </p>
                    </div>
                </div>
                <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
                    <div style="text-align:right;margin-right:12px;">
                        <div style="font-size:20px;font-weight:700;color:${isPaid ? 'var(--green)' : 'var(--gold)'};">
                            ${isPaid ? 'Pro' : (questionsLeft === Infinity ? '∞' : questionsLeft)}
                        </div>
                        <div style="font-size:10px;color:var(--text3);">
                            ${isPaid ? 'unlimited' : 'questions left today'}
                        </div>
                    </div>
                    <button class="btn btn-sm btn-secondary" id="profileBtn">Profile</button>
                    <button class="btn btn-sm btn-secondary" id="logoutBtn">Sign Out</button>
                </div>
            </div>

            <!-- Status banner -->
            ${!isPaid && trialDaysLeft <= 0 ? `
                <div class="dash-banner trial" style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);">
                    <div>
                        <strong>Trial Ended</strong>
                        <p style="font-size:11px;color:var(--text2);">Upgrade to continue studying.</p>
                    </div>
                    <button class="btn btn-primary btn-sm" id="upgradeBtn">Get Pro — $7.99</button>
                </div>
            ` : !isPaid ? `
                <div class="dash-banner trial">
                    <div>
                        <strong>Free Trial Active</strong>
                        <p style="font-size:11px;color:var(--text2);">
                            ${trialDaysLeft} day${trialDaysLeft !== 1 ? 's' : ''} remaining
                            · ${questionsLeft} questions left today
                        </p>
                    </div>
                    <button class="btn btn-primary btn-sm" id="upgradeBtn">Upgrade — $7.99</button>
                </div>
            ` : `
                <div class="dash-banner pro">
                    <div>
                        <strong>Pro Access Active</strong>
                        <p style="font-size:11px;color:var(--text2);">Unlimited questions. All features unlocked.</p>
                    </div>
                </div>
            `}

            <!-- Stats -->
            <div class="dash-stats">
                <div class="dash-stat">
                    <div class="dash-stat-val">${sessions.length}</div>
                    <div class="dash-stat-label">Study Sessions</div>
                </div>
                <div class="dash-stat">
                    <div class="dash-stat-val">
                        ${Math.floor(totalStudyMinutes / 60)}h ${totalStudyMinutes % 60}m
                    </div>
                    <div class="dash-stat-label">Study Time</div>
                </div>
                <div class="dash-stat">
                    <div class="dash-stat-val">
                        ${sessions.length > 0 ? Math.min(Math.ceil(sessions.length / 2), 30) : 0}
                    </div>
                    <div class="dash-stat-label">Day Streak</div>
                </div>
                <div class="dash-stat">
                    <div class="dash-stat-val">${isPaid ? '∞' : questionsLeft}</div>
                    <div class="dash-stat-label">Questions Today</div>
                </div>
            </div>

            <!-- Quick actions -->
            <div class="dash-actions">
                <div class="dash-card" id="goStudy">
                    <div style="width:36px;height:36px;border-radius:8px;background:var(--gold-dim);color:var(--gold);
                         display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;flex-shrink:0;">S</div>
                    <div>
                        <h3 style="font-size:14px;">Continue Studying</h3>
                        <p style="font-size:11px;color:var(--text3);">Resume your last session</p>
                    </div>
                </div>
                <div class="dash-card" id="goLibrary">
                    <div style="width:36px;height:36px;border-radius:8px;background:var(--gold-dim);color:var(--gold);
                         display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;flex-shrink:0;">L</div>
                    <div>
                        <h3 style="font-size:14px;">My Library</h3>
                        <p style="font-size:11px;color:var(--text3);">Manage courses and materials</p>
                    </div>
                </div>
            </div>

            <!-- Recent sessions -->
            <div style="margin-top:24px;">
                <h3 style="font-size:15px;margin-bottom:12px;">Recent Study Sessions</h3>

                ${sessions.length === 0 ? `
                    <div style="text-align:center;padding:32px;background:var(--surface);
                         border:var(--border);border-radius:8px;color:var(--text2);font-size:13px;">
                        <p>No study sessions yet.</p>
                        <p style="font-size:11px;color:var(--text3);margin-top:4px;">
                            Start your first session to see it here.
                        </p>
                    </div>
                ` : `
                    <div style="background:var(--surface);border:var(--border);border-radius:8px;overflow:hidden;">
                        ${sessions.map(s => {
                            const date       = new Date(s.last_active_at || s.created_at || Date.now());
                            const hasMsgs    = (s.message_count || s.messageCount || 0) > 0;
                            const msgCount   = s.message_count || s.messageCount || 0;
                            const sessionId  = s.session_id   || s.sessionId;
                            return `
                                <div class="session-history-item"
                                     data-session-id="${sessionId}"
                                     style="display:flex;align-items:center;gap:12px;padding:12px 16px;
                                            border-bottom:1px solid rgba(255,255,255,0.04);
                                            cursor:pointer;transition:background 0.2s;
                                            ${!hasMsgs ? 'opacity:0.5;' : ''}">
                                    <div style="width:36px;height:36px;border-radius:8px;flex-shrink:0;
                                         background:${hasMsgs ? 'var(--gold-dim)' : 'var(--elevated)'};
                                         display:flex;align-items:center;justify-content:center;font-size:16px;">
                                        ${hasMsgs ? '📚' : '📝'}
                                    </div>
                                    <div style="flex:1;min-width:0;">
                                        <div style="font-weight:600;font-size:13px;
                                             overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                                            ${esc(s.title || 'Study Session')}
                                        </div>
                                        <div style="font-size:11px;color:var(--text3);margin-top:2px;">
                                            ${date.toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}
                                            · ${msgCount} message${msgCount !== 1 ? 's' : ''}
                                            · ${s.mode || 'learn'}
                                            ${!hasMsgs ? ' · (empty)' : ''}
                                        </div>
                                    </div>
                                    ${hasMsgs ? `
                                        <button class="continue-session-btn"
                                                data-session-id="${sessionId}"
                                                style="background:var(--gold);border:none;padding:8px 14px;
                                                       border-radius:6px;color:#000;font-size:12px;
                                                       cursor:pointer;font-weight:600;flex-shrink:0;">
                                            Continue →
                                        </button>
                                    ` : `
                                        <span style="font-size:10px;color:var(--text3);flex-shrink:0;">No messages</span>
                                    `}
                                </div>`;
                        }).join('')}
                    </div>
                `}
            </div>
        </div>
    `;

    // ── Resume helper ─────────────────────────────────────────
    function resumeSession(sessionId) {
        if (!sessionId) return;
        localStorage.setItem('cc_resume_session_id', sessionId);
        localStorage.setItem('cc_last_session_id',   sessionId);
        navigateTo('study');
    }

    // ── Buttons (?.onclick = never throws on null) ────────────

    // Always-present elements
    document.getElementById('profileBtn').onclick = () => navigateTo('profile');
    document.getElementById('logoutBtn').onclick  = async () => {
        localStorage.removeItem('cc_last_session_id');
        localStorage.removeItem('cc_resume_session_id');
        localStorage.removeItem('cc_study_material');
        localStorage.removeItem('cc_study_title');
        localStorage.removeItem('cc_study_course');
        sessionStorage.removeItem('cc_role');
        sessionStorage.removeItem('cc_access');
        await supabase.auth.signOut();
        navigateTo('signin');          // no location.reload()
    };

    document.getElementById('goStudy').onclick = () => {
        // Resume most recent session that has messages
        const recent = sessions.find(s => (s.message_count || s.messageCount || 0) > 0);
        if (recent) {
            const id = recent.session_id || recent.sessionId;
            localStorage.setItem('cc_resume_session_id', id);
            localStorage.setItem('cc_last_session_id',   id);
        } else {
            localStorage.removeItem('cc_resume_session_id');
            localStorage.removeItem('cc_last_session_id');
        }
        navigateTo('study');
    };

    document.getElementById('goLibrary').onclick = () => navigateTo('library');

    // upgradeBtn is CONDITIONAL — only rendered when !isPaid or trial expired.
    // Use ?. so it silently no-ops for paid users.
    document.getElementById('upgradeBtn')?.onclick && (document.getElementById('upgradeBtn').onclick = () => navigateTo('payment'));
    // Cleaner way:
    const upgradeBtn = document.getElementById('upgradeBtn');
    if (upgradeBtn) upgradeBtn.onclick = () => navigateTo('payment');

    // Session buttons — .onclick prevents listener stacking on re-render
    document.querySelectorAll('.continue-session-btn').forEach(btn => {
        btn.onclick = e => {
            e.stopPropagation();
            resumeSession(btn.dataset.sessionId);
        };
    });

    document.querySelectorAll('.session-history-item').forEach(item => {
        item.onclick = () => {
            const s = sessions.find(x => (x.session_id || x.sessionId) === item.dataset.sessionId);
            if (s && (s.message_count || s.messageCount || 0) > 0) {
                resumeSession(item.dataset.sessionId);
            }
        };
    });
    // ── NO keyboard listener here — it lives in app.js ───────
}

function esc(text) {
    if (!text) return '';
    const d = document.createElement('div');
    d.textContent = text;
    return d.innerHTML;
}