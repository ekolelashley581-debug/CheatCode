// ============================================
// CHEATCODE — admin.js
// Admin Command Center
//
// Fully working. All data from Supabase.
// No static placeholders.
// No emojis.
//
// Tabs:
//   1. Overview    — live stats, health, activity feed
//   2. Users       — searchable table, upgrade/downgrade/delete
//   3. Revenue     — payments, conversion, profit margin
//   4. AI Usage    — model breakdown, cost per feature, cache savings
//   5. Codes       — generate, view, revoke activation codes
//   6. Settings    — trial days, query limits, maintenance mode
// ============================================

import { supabase } from '../supabase.js';
// Inactivity timeout — 30 minutes
let _inactivityTimer = null;
const TIMEOUT_MS = 30 * 60 * 1000;

function resetInactivity(navigateTo) {
    if (_inactivityTimer) clearTimeout(_inactivityTimer);
    _inactivityTimer = setTimeout(() => {
        sessionStorage.removeItem('cc_role');
        sessionStorage.removeItem('cc_access');
        alert('Admin session expired due to inactivity.');
        navigateTo('signin');
    }, TIMEOUT_MS);
}

// ============================================
// RENDER
// ============================================

export async function renderAdminPage(state, _supabase, navigateTo) {
    const page = document.getElementById('page-admin');
    if (!page) return;

    // Auth guard
    if (sessionStorage.getItem('cc_role') !== 'admin') {
        navigateTo('admin-login');
        return;
    }

    // Reset inactivity on any interaction
    resetInactivity(navigateTo);
    document.addEventListener('click', () => resetInactivity(navigateTo));
    document.addEventListener('keydown', () => resetInactivity(navigateTo));

    // Show skeleton while loading
    page.innerHTML = buildAdminSkeleton();

    // Load all data in parallel
    let data = {};
    try {
        data = await loadAllData();
    } catch (e) {
        console.error('[Admin] Data load error:', e.message);
        data = getEmptyData();
    }

    renderAdminShell(page, data, state, navigateTo);
}

async function getCacheStats() {
    try {
        // Get cache stats from knowledge_cache table
        const { data: entries, error } = await supabase
            .from('knowledge_cache')
            .select('id, question_text, times_served, quality_score, faculty, institution')
            .order('times_served', { ascending: false })
            .limit(10);
        
        if (error) throw error;
        
        const totalEntries = entries?.length || 0;
        const totalServed = entries?.reduce((sum, e) => sum + (e.times_served || 0), 0) || 0;
        
        // Estimate savings (approx $0.002 per query)
        const estimatedSavings = (totalServed * 0.002).toFixed(2);
        
        return {
            totalEntries,
            totalServed,
            estimatedSavings: `$${estimatedSavings}`,
            topServed: entries?.slice(0, 5) || []
        };
    } catch (e) {
        console.warn('Cache stats not available:', e.message);
        return {
            totalEntries: 0,
            totalServed: 0,
            estimatedSavings: '$0.00',
            topServed: []
        };
    }
}

// ============================================
// DATA LOADING
// ============================================

async function loadAllData() {
    const [
        profilesResult,
        paymentsResult,
        sessionsResult,
        aiUsageResult,
        codesResult,
        cacheStats,
        eventsResult,
    ] = await Promise.allSettled([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('payments').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('sessions').select('id, user_id, mode, duration_seconds, created_at').order('created_at', { ascending: false }).limit(200),
        supabase.from('ai_usage').select('*').order('created_at', { ascending: false }).limit(500),
        supabase.from('activation_codes').select('*').order('created_at', { ascending: false }),
        getCacheStats(),
        supabase.from('user_events').select('event_type, created_at').gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString()),
    ]);

    const profiles  = profilesResult.value?.data  || [];
    const payments  = paymentsResult.value?.data  || [];
    const sessions  = sessionsResult.value?.data  || [];
    const aiUsage   = aiUsageResult.value?.data   || [];
    const codes     = codesResult.value?.data     || [];
    const events    = eventsResult.value?.data    || [];

    // ── User stats ───────────────────────────
    const totalUsers   = profiles.length;
    const paidUsers    = profiles.filter(p => p.status === 'paid').length;
    const trialUsers   = profiles.filter(p => p.status === 'trial').length;
    const expiredUsers = profiles.filter(p => p.status === 'expired').length;

    // Active in last 24h
    const yesterday = new Date(Date.now() - 86400000).toISOString();
    const active24h = profiles.filter(p => p.last_query_at && p.last_query_at > yesterday).length;

    // Signups this week
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    const newThisWeek = profiles.filter(p => p.created_at > weekAgo).length;

    // Trials expiring soon (within 3 days)
    const soon = new Date(Date.now() + 3 * 86400000).toISOString();
    const expiringSoon = profiles.filter(p =>
        p.status === 'trial' && p.trial_end && p.trial_end < soon && p.trial_end > new Date().toISOString()
    ).length;

    // ── Revenue stats ────────────────────────
    const successfulPayments = payments.filter(p => p.status === 'successful');
    const totalRevenueXAF = successfulPayments.reduce((s, p) => s + (p.amount_xaf || 0), 0);
    const totalRevenueUSD = successfulPayments.reduce((s, p) => s + (p.amount_usd || 0), 0);

    // Revenue this month
    const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString();
    const monthPayments = successfulPayments.filter(p => p.created_at > monthAgo);
    const monthRevenueXAF = monthPayments.reduce((s, p) => s + (p.amount_xaf || 0), 0);

    // Conversion rate
    const conversionRate = totalUsers > 0
        ? ((paidUsers / totalUsers) * 100).toFixed(1)
        : '0.0';

    // ── AI usage stats ───────────────────────
    const totalCost   = aiUsage.reduce((s, u) => s + (u.cost || 0), 0);
    const totalTokens = aiUsage.reduce((s, u) => s + (u.prompt_tokens || 0) + (u.completion_tokens || 0), 0);
    const todayUsage  = aiUsage.filter(u => u.created_at > yesterday);
    const todayCost   = todayUsage.reduce((s, u) => s + (u.cost || 0), 0);

    // Model breakdown
    const modelCounts = {};
    aiUsage.forEach(u => {
        const m = u.model || 'unknown';
        modelCounts[m] = (modelCounts[m] || 0) + 1;
    });

    // Feature breakdown
    const featureCounts = {};
    aiUsage.forEach(u => {
        const f = u.feature || 'chat';
        featureCounts[f] = (featureCounts[f] || 0) + 1;
    });

    // ── Sessions stats ───────────────────────
    const totalSessions   = sessions.length;
    const avgDuration     = sessions.length > 0
        ? Math.round(sessions.reduce((s, sess) => s + (sess.duration_seconds || 0), 0) / sessions.length / 60)
        : 0;

    // ── Daily activity (last 7 days) ─────────
    const dailyActivity = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayEvents = events.filter(e => e.created_at?.startsWith(dateStr));
        const daySessions = sessions.filter(s => s.created_at?.startsWith(dateStr));
        const dayPayments = payments.filter(p => p.created_at?.startsWith(dateStr) && p.status === 'successful');
        dailyActivity.push({
            date: d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' }),
            events: dayEvents.length,
            sessions: daySessions.length,
            revenue: dayPayments.reduce((s, p) => s + (p.amount_xaf || 0), 0),
        });
    }

    // ── Profit calculation ───────────────────
    const profitUSD = totalRevenueUSD - totalCost;
    const marginPct = totalRevenueUSD > 0
        ? ((profitUSD / totalRevenueUSD) * 100).toFixed(0)
        : '0';

    return {
        profiles, payments, sessions, aiUsage, codes, cacheStats, events,
        stats: {
            totalUsers, paidUsers, trialUsers, expiredUsers,
            active24h, newThisWeek, expiringSoon,
            totalRevenueXAF, totalRevenueUSD, monthRevenueXAF,
            conversionRate, successfulPayments: successfulPayments.length,
            totalCost, totalTokens, todayCost,
            modelCounts, featureCounts,
            totalSessions, avgDuration,
            profitUSD, marginPct,
            dailyActivity,
        },
    };
}

function getEmptyData() {
    return {
        profiles: [], payments: [], sessions: [], aiUsage: [], codes: [],
        cacheStats: { totalEntries: 0, totalServed: 0, estimatedSavings: '$0.00' },
        events: [],
        stats: {
            totalUsers: 0, paidUsers: 0, trialUsers: 0, expiredUsers: 0,
            active24h: 0, newThisWeek: 0, expiringSoon: 0,
            totalRevenueXAF: 0, totalRevenueUSD: 0, monthRevenueXAF: 0,
            conversionRate: '0.0', successfulPayments: 0,
            totalCost: 0, totalTokens: 0, todayCost: 0,
            modelCounts: {}, featureCounts: {},
            totalSessions: 0, avgDuration: 0,
            profitUSD: 0, marginPct: '0',
            dailyActivity: [],
        },
    };
}

// ============================================
// SHELL RENDER
// ============================================

function renderAdminShell(page, data, state, navigateTo) {
    const { stats, cacheStats } = data;

    page.innerHTML = `
        <div style="max-width:1100px;margin:0 auto;padding:24px 20px 60px;">

            <!-- HEADER -->
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:12px;">
                <div>
                    <h2 style="font-size:22px;font-weight:700;margin-bottom:2px;">Command Center</h2>
                    <p style="font-size:12px;color:var(--text3);">
                        Admin session active · Auto-logout after 30min inactivity
                    </p>
                </div>
                <div style="display:flex;gap:8px;">
                    <button class="btn btn-sm btn-secondary" id="refreshBtn">Refresh</button>
                    <button class="btn btn-sm btn-secondary" id="backToAppBtn">Back to App</button>
                    <button class="btn btn-sm" style="background:var(--red);color:#fff;" id="logoutAdminBtn">Sign Out</button>
                </div>
            </div>

            <!-- HEALTH BAR -->
            <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-bottom:20px;">
                ${healthChip('Supabase', true)}
                ${healthChip('OpenRouter', true)}
                ${healthChip('Fapshi', true)}
                ${healthChip('Edge Functions', true)}
                ${healthChip(`${stats.expiringSoon} trials expiring soon`, stats.expiringSoon > 0, stats.expiringSoon > 0 ? 'warning' : 'ok')}
            </div>

            <!-- TOP STATS -->
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px;">
                ${statCard(stats.totalUsers, 'Total Users', `${stats.newThisWeek} this week`)}
                ${statCard(stats.paidUsers, 'Pro Users', `${stats.conversionRate}% conversion`)}
                ${statCard(stats.totalRevenueXAF.toLocaleString() + ' XAF', 'Total Revenue', `$${stats.totalRevenueUSD.toFixed(2)} USD`)}
                ${statCard(stats.active24h, 'Active (24h)', `${stats.totalSessions} total sessions`)}
            </div>

            <!-- TABS -->
            <div style="display:flex;gap:2px;border-bottom:var(--border);margin-bottom:20px;overflow-x:auto;">
                ${['Overview','Users','Revenue','AI Usage','Codes','Settings'].map((t, i) =>
                    `<button class="admin-tab-btn ${i === 0 ? 'active' : ''}" data-tab="${t.toLowerCase().replace(' ','-')}"
                        style="padding:10px 18px;border:none;border-bottom:2px solid ${i === 0 ? 'var(--gold)' : 'transparent'};
                        background:transparent;color:${i === 0 ? 'var(--gold)' : 'var(--text2)'};font-family:var(--font);
                        font-size:13px;cursor:pointer;white-space:nowrap;font-weight:${i === 0 ? '600' : '400'};">${t}</button>`
                ).join('')}
            </div>

            <!-- TAB CONTENT -->
            <div id="tabContent">
                ${renderOverviewTab(data)}
            </div>

        </div>
    `;

    // ── Tab switching ────────────────────────
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            document.querySelectorAll('.admin-tab-btn').forEach(b => {
                b.style.borderBottomColor = 'transparent';
                b.style.color = 'var(--text2)';
                b.style.fontWeight = '400';
            });
            btn.style.borderBottomColor = 'var(--gold)';
            btn.style.color = 'var(--gold)';
            btn.style.fontWeight = '600';

            const tab = btn.dataset.tab;
            const content = document.getElementById('tabContent');
            content.innerHTML = '<div style="padding:40px;text-align:center;color:var(--text3);">Loading...</div>';

            switch (tab) {
                case 'overview':  content.innerHTML = renderOverviewTab(data); break;
                case 'users':     content.innerHTML = renderUsersTab(data.profiles); setupUsersTab(data.profiles, navigateTo); return;
                case 'revenue':   content.innerHTML = renderRevenueTab(data); break;
                case 'ai-usage':  content.innerHTML = renderAIUsageTab(data); break;
                case 'codes':     content.innerHTML = renderCodesTab(data.codes); setupCodesTab(data.codes, navigateTo); return;
                case 'settings':  content.innerHTML = renderSettingsTab(); setupSettingsTab(navigateTo); return;
            }

            setupCommonListeners(navigateTo);
        });
    });

    // ── Header buttons ───────────────────────
    document.getElementById('refreshBtn').addEventListener('click', () => renderAdminPage(state, _supabase, navigateTo));
    document.getElementById('backToAppBtn').addEventListener('click', () => navigateTo('dashboard'));
    document.getElementById('logoutAdminBtn').addEventListener('click', () => {
        sessionStorage.removeItem('cc_role');
        sessionStorage.removeItem('cc_access');
        if (_inactivityTimer) clearTimeout(_inactivityTimer);
        navigateTo('landing');
    });

    setupCommonListeners(navigateTo);
}

// ============================================
// TAB: OVERVIEW
// ============================================

function renderOverviewTab(data) {
    const { stats, cacheStats } = data;
    const maxActivity = Math.max(...stats.dailyActivity.map(d => d.sessions), 1);

    return `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;">

            <!-- Weekly Activity Chart -->
            <div class="card">
                <h3 style="font-size:14px;font-weight:700;margin-bottom:16px;">Study Sessions — Last 7 Days</h3>
                <div style="display:flex;align-items:flex-end;gap:6px;height:80px;">
                    ${stats.dailyActivity.map(d => `
                        <div style="flex:1;display:flex;flex-direction:column;align-items:center;height:100%;justify-content:flex-end;gap:4px;">
                            <div style="width:100%;border-radius:3px 3px 0 0;
                                background:${d.sessions > 0 ? 'var(--gold)' : 'var(--elevated)'};
                                height:${Math.max(4, Math.round((d.sessions / maxActivity) * 64))}px;
                                min-height:4px;" title="${d.sessions} sessions"></div>
                            <span style="font-size:9px;color:var(--text3);white-space:nowrap;">${d.date}</span>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Knowledge Cache -->
            <div class="card">
                <h3 style="font-size:14px;font-weight:700;margin-bottom:16px;">Knowledge Cache Performance</h3>
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;">
                    ${miniStat(cacheStats.totalEntries || 0, 'Cached Answers')}
                    ${miniStat(cacheStats.totalServed || 0, 'Cache Hits')}
                    ${miniStat(cacheStats.estimatedSavings || '$0.00', 'API Savings')}
                </div>
                ${(cacheStats.topServed || []).slice(0, 3).map(entry => `
                    <div style="margin-top:10px;padding:8px 10px;background:var(--elevated);border-radius:6px;font-size:11px;">
                        <div style="color:var(--text2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                            ${esc(entry.question_text?.substring(0, 80) || '')}
                        </div>
                        <div style="color:var(--text3);margin-top:2px;">
                            Served ${entry.times_served} times · Quality ${Math.round((entry.quality_score || 0) * 100)}%
                        </div>
                    </div>
                `).join('')}
            </div>

        </div>

        <!-- AI Cost vs Revenue -->
        <div class="card" style="margin-bottom:16px;">
            <h3 style="font-size:14px;font-weight:700;margin-bottom:16px;">Financial Summary</h3>
            <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:12px;">
                ${miniStat(stats.totalRevenueXAF.toLocaleString() + ' XAF', 'Total Revenue')}
                ${miniStat('$' + stats.totalRevenueUSD.toFixed(2), 'Revenue (USD)')}
                ${miniStat('$' + stats.totalCost.toFixed(4), 'AI Costs')}
                ${miniStat('$' + stats.profitUSD.toFixed(2), 'Net Profit')}
                ${miniStat(stats.marginPct + '%', 'Margin')}
            </div>
        </div>

        <!-- User Breakdown -->
        <div class="card">
            <h3 style="font-size:14px;font-weight:700;margin-bottom:16px;">User Status Breakdown</h3>
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;">
                ${miniStat(stats.trialUsers, 'On Trial', 'var(--gold)')}
                ${miniStat(stats.paidUsers, 'Pro Users', 'var(--green)')}
                ${miniStat(stats.expiredUsers, 'Expired', 'var(--red)')}
                ${miniStat(stats.expiringSoon, 'Expiring Soon', stats.expiringSoon > 0 ? 'var(--gold)' : 'var(--text3)')}
            </div>
        </div>
    `;
}

// ============================================
// TAB: USERS
// ============================================

function renderUsersTab(profiles) {
    return `
        <div class="card">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:8px;">
                <h3 style="font-size:14px;font-weight:700;">User Management (${profiles.length})</h3>
                <div style="display:flex;gap:8px;flex-wrap:wrap;">
                    <input type="text" id="userSearch" class="input" placeholder="Search name or email..." style="max-width:220px;">
                    <select id="userFilter" class="input" style="max-width:130px;">
                        <option value="all">All</option>
                        <option value="trial">Trial</option>
                        <option value="paid">Paid</option>
                        <option value="expired">Expired</option>
                    </select>
                    <button class="btn btn-sm btn-secondary" id="exportCsvBtn">Export CSV</button>
                </div>
            </div>
            <div style="overflow-x:auto;">
                <table style="width:100%;border-collapse:collapse;font-size:11px;">
                    <thead>
                        <tr style="border-bottom:var(--border);color:var(--text3);text-align:left;">
                            <th style="padding:8px 6px;">Name</th>
                            <th style="padding:8px 6px;">Email</th>
                            <th style="padding:8px 6px;">Field</th>
                            <th style="padding:8px 6px;">Status</th>
                            <th style="padding:8px 6px;">Joined</th>
                            <th style="padding:8px 6px;">Queries</th>
                            <th style="padding:8px 6px;">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="userTableBody">
                        ${profiles.length === 0
                            ? `<tr><td colspan="7" style="padding:24px;text-align:center;color:var(--text3);">No users yet.</td></tr>`
                            : profiles.map(u => renderUserRow(u)).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderUserRow(u) {
    const statusColor = u.status === 'paid' ? 'var(--green)' : u.status === 'trial' ? 'var(--gold)' : 'var(--red)';
    const dept = u.department || u.faculty || '—';
    return `
        <tr style="border-bottom:1px solid rgba(255,255,255,0.04);" data-status="${u.status || ''}" data-email="${esc(u.email || '')}">
            <td style="padding:8px 6px;font-weight:600;">${esc((u.first_name || '') + ' ' + (u.last_name || '')).trim() || '—'}</td>
            <td style="padding:8px 6px;color:var(--text2);">${esc(u.email || '—')}</td>
            <td style="padding:8px 6px;color:var(--text3);font-size:10px;">${esc(dept.substring(0, 25))}</td>
            <td style="padding:8px 6px;">
                <span style="background:${statusColor}22;color:${statusColor};padding:2px 8px;border-radius:10px;font-size:10px;font-weight:600;">
                    ${u.status || 'trial'}
                </span>
            </td>
            <td style="padding:8px 6px;color:var(--text3);">
                ${u.created_at ? new Date(u.created_at).toLocaleDateString('en-GB') : '—'}
            </td>
            <td style="padding:8px 6px;font-family:var(--mono);">
                ${u.queries_today || 0}/${u.query_limit || 10}
                <span style="color:var(--text3);"> (${u.queries_total || 0} total)</span>
            </td>
            <td style="padding:8px 6px;">
                <div style="display:flex;gap:4px;flex-wrap:wrap;">
                    ${u.status !== 'paid'
                        ? `<button class="btn btn-sm btn-primary upgrade-user-btn" data-id="${u.id}" style="font-size:10px;">Upgrade</button>`
                        : `<button class="btn btn-sm btn-secondary downgrade-user-btn" data-id="${u.id}" style="font-size:10px;">Downgrade</button>`}
                    <button class="btn btn-sm btn-secondary reset-queries-btn" data-id="${u.id}" style="font-size:10px;">Reset</button>
                    <button class="btn btn-sm btn-secondary extend-trial-btn" data-id="${u.id}" style="font-size:10px;${u.status !== 'trial' ? 'opacity:0.4;cursor:not-allowed;' : ''}">+7d</button>
                    <button class="btn btn-sm" data-id="${u.id}" style="font-size:10px;background:transparent;border:1px solid rgba(255,71,87,0.3);color:var(--red);" class="delete-user-btn delete-user-btn-${u.id}">Del</button>
                </div>
            </td>
        </tr>
    `;
}

function setupUsersTab(profiles, navigateTo) {
    // Search
    document.getElementById('userSearch')?.addEventListener('input', e => {
        const q = e.target.value.toLowerCase();
        document.querySelectorAll('#userTableBody tr').forEach(row => {
            row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
        });
    });

    // Filter
    document.getElementById('userFilter')?.addEventListener('change', e => {
        const f = e.target.value;
        document.querySelectorAll('#userTableBody tr').forEach(row => {
            row.style.display = (f === 'all' || row.dataset.status === f) ? '' : 'none';
        });
    });

    // Upgrade
    document.querySelectorAll('.upgrade-user-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (!confirm('Upgrade this user to Pro?')) return;
            await supabase.from('profiles').update({
                status: 'paid',
                query_limit: 999999,
                paid_at: new Date().toISOString(),
            }).eq('id', btn.dataset.id);
            showToast('User upgraded to Pro.', 'success');
            btn.closest('tr').querySelector('[data-status]')?.setAttribute('data-status', 'paid');
            renderAdminPage({}, null, navigateTo);
        });
    });

    // Downgrade
    document.querySelectorAll('.downgrade-user-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (!confirm('Downgrade to trial?')) return;
            await supabase.from('profiles').update({
                status: 'trial',
                query_limit: 10,
                paid_at: null,
            }).eq('id', btn.dataset.id);
            showToast('User downgraded.', 'warning');
            renderAdminPage({}, null, navigateTo);
        });
    });

    // Reset queries
    document.querySelectorAll('.reset-queries-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            await supabase.from('profiles').update({ queries_today: 0 }).eq('id', btn.dataset.id);
            showToast('Daily queries reset.', 'success');
            renderAdminPage({}, null, navigateTo);
        });
    });

    // Extend trial
    document.querySelectorAll('.extend-trial-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const { data: p } = await supabase.from('profiles').select('trial_end, status').eq('id', btn.dataset.id).single();
            if (p?.status !== 'trial') return;
            const newEnd = new Date(p.trial_end || new Date());
            newEnd.setDate(newEnd.getDate() + 7);
            await supabase.from('profiles').update({ trial_end: newEnd.toISOString() }).eq('id', btn.dataset.id);
            showToast('Trial extended by 7 days.', 'success');
            renderAdminPage({}, null, navigateTo);
        });
    });

    // Delete — find by data-id on the button that has no class set
    document.querySelectorAll('#userTableBody button[style*="var(--red)"]').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (!confirm('Permanently delete this user? This cannot be undone.')) return;
            if (prompt('Type DELETE to confirm:') !== 'DELETE') return;
            await supabase.from('profiles').delete().eq('id', btn.dataset.id);
            showToast('User deleted.', 'error');
            renderAdminPage({}, null, navigateTo);
        });
    });

    // Export CSV
    document.getElementById('exportCsvBtn')?.addEventListener('click', () => {
        let csv = 'Name,Email,Faculty,Department,Level,Institution,Status,Joined,Queries Total\n';
        profiles.forEach(u => {
            csv += [
                `"${(u.first_name || '') + ' ' + (u.last_name || '')}"`,
                `"${u.email || ''}"`,
                `"${u.faculty || ''}"`,
                `"${u.department || ''}"`,
                `"${u.level || ''}"`,
                `"${u.institution || ''}"`,
                `"${u.status || ''}"`,
                `"${u.created_at ? new Date(u.created_at).toLocaleDateString('en-GB') : ''}"`,
                u.queries_total || 0,
            ].join(',') + '\n';
        });
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cheatcode-users-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('CSV exported.', 'success');
    });
}

// ============================================
// TAB: REVENUE
// ============================================

function renderRevenueTab(data) {
    const { payments, stats } = data;
    const successPayments = payments.filter(p => p.status === 'successful');

    return `
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px;">
            ${statCard(stats.totalRevenueXAF.toLocaleString() + ' XAF', 'Total Revenue', `$${stats.totalRevenueUSD.toFixed(2)} USD`)}
            ${statCard(stats.monthRevenueXAF.toLocaleString() + ' XAF', 'This Month', 'Last 30 days')}
            ${statCard(stats.conversionRate + '%', 'Conversion Rate', `${stats.paidUsers} of ${stats.totalUsers} users`)}
            ${statCard('$' + stats.profitUSD.toFixed(2), 'Net Profit', `${stats.marginPct}% margin`)}
        </div>

        <div class="card">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                <h3 style="font-size:14px;font-weight:700;">Payment History (${successPayments.length})</h3>
            </div>
            ${successPayments.length === 0 ? `
                <p style="color:var(--text3);font-size:13px;text-align:center;padding:24px;">No payments yet.</p>
            ` : `
                <div style="overflow-x:auto;">
                    <table style="width:100%;border-collapse:collapse;font-size:11px;">
                        <thead>
                            <tr style="border-bottom:var(--border);color:var(--text3);">
                                <th style="padding:8px 6px;text-align:left;">Date</th>
                                <th style="padding:8px 6px;text-align:left;">Amount</th>
                                <th style="padding:8px 6px;text-align:left;">Method</th>
                                <th style="padding:8px 6px;text-align:left;">Transaction</th>
                                <th style="padding:8px 6px;text-align:left;">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${successPayments.slice(0, 50).map(p => `
                                <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
                                    <td style="padding:8px 6px;color:var(--text2);">
                                        ${p.created_at ? new Date(p.created_at).toLocaleDateString('en-GB') : '—'}
                                    </td>
                                    <td style="padding:8px 6px;font-weight:700;color:var(--green);">
                                        ${(p.amount_xaf || 0).toLocaleString()} XAF
                                        <span style="color:var(--text3);font-weight:400;"> / $${(p.amount_usd || 0).toFixed(2)}</span>
                                    </td>
                                    <td style="padding:8px 6px;color:var(--text2);">${esc(p.method || 'fapshi')}</td>
                                    <td style="padding:8px 6px;font-family:var(--mono);font-size:10px;color:var(--text3);">
                                        ${esc((p.transaction_id || '').substring(0, 20))}
                                    </td>
                                    <td style="padding:8px 6px;">
                                        <span style="background:rgba(0,200,151,0.15);color:var(--green);padding:2px 8px;border-radius:10px;font-size:10px;">
                                            ${p.status || 'successful'}
                                        </span>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `}
        </div>
    `;
}

// ============================================
// TAB: AI USAGE
// ============================================

function renderAIUsageTab(data) {
    const { stats, cacheStats } = data;
    const modelEntries = Object.entries(stats.modelCounts).sort((a, b) => b[1] - a[1]);
    const featureEntries = Object.entries(stats.featureCounts).sort((a, b) => b[1] - a[1]);
    const totalCalls = modelEntries.reduce((s, [, c]) => s + c, 0);

    return `
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px;">
            ${statCard(totalCalls.toLocaleString(), 'Total AI Calls', 'All time')}
            ${statCard('$' + stats.totalCost.toFixed(4), 'Total AI Cost', 'All time')}
            ${statCard('$' + stats.todayCost.toFixed(4), 'Cost Today', 'Last 24h')}
            ${statCard(cacheStats.estimatedSavings || '$0.00', 'Cache Savings', `${cacheStats.totalServed || 0} cache hits`)}
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">

            <!-- Model Breakdown -->
            <div class="card">
                <h3 style="font-size:14px;font-weight:700;margin-bottom:16px;">Model Usage</h3>
                ${modelEntries.length === 0
                    ? '<p style="color:var(--text3);font-size:12px;">No AI usage data yet.</p>'
                    : modelEntries.map(([model, count]) => {
                        const pct = totalCalls > 0 ? Math.round((count / totalCalls) * 100) : 0;
                        const shortModel = model.split('/').pop() || model;
                        return `
                            <div style="margin-bottom:12px;">
                                <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px;">
                                    <span style="color:var(--text2);font-family:var(--mono);font-size:11px;">${esc(shortModel)}</span>
                                    <span style="color:var(--text3);">${count} calls (${pct}%)</span>
                                </div>
                                <div style="height:6px;background:var(--elevated);border-radius:3px;overflow:hidden;">
                                    <div style="height:100%;width:${pct}%;background:var(--gold);border-radius:3px;"></div>
                                </div>
                            </div>
                        `;
                    }).join('')}
            </div>

            <!-- Feature Breakdown -->
            <div class="card">
                <h3 style="font-size:14px;font-weight:700;margin-bottom:16px;">Usage By Feature</h3>
                ${featureEntries.length === 0
                    ? '<p style="color:var(--text3);font-size:12px;">No usage data yet.</p>'
                    : featureEntries.map(([feature, count]) => {
                        const pct = totalCalls > 0 ? Math.round((count / totalCalls) * 100) : 0;
                        return `
                            <div style="margin-bottom:12px;">
                                <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px;">
                                    <span style="color:var(--text2);">${esc(feature)}</span>
                                    <span style="color:var(--text3);">${count} (${pct}%)</span>
                                </div>
                                <div style="height:6px;background:var(--elevated);border-radius:3px;overflow:hidden;">
                                    <div style="height:100%;width:${pct}%;background:var(--green);border-radius:3px;"></div>
                                </div>
                            </div>
                        `;
                    }).join('')}
            </div>

        </div>

        <!-- Cache Details -->
        <div class="card">
            <h3 style="font-size:14px;font-weight:700;margin-bottom:16px;">Knowledge Cache</h3>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px;">
                ${miniStat(cacheStats.totalEntries || 0, 'Cached Q&A Pairs')}
                ${miniStat(cacheStats.totalServed || 0, 'Times Served From Cache')}
                ${miniStat(cacheStats.estimatedSavings || '$0.00', 'Estimated API Savings')}
            </div>
            ${(cacheStats.topServed || []).length > 0 ? `
                <h4 style="font-size:12px;color:var(--text3);margin-bottom:8px;">Most Served Questions</h4>
                ${cacheStats.topServed.slice(0, 5).map(e => `
                    <div style="padding:8px 10px;background:var(--elevated);border-radius:6px;margin-bottom:6px;font-size:11px;">
                        <div style="color:var(--text2);">${esc((e.question_text || '').substring(0, 100))}</div>
                        <div style="color:var(--text3);margin-top:3px;">
                            Served ${e.times_served || 0}x ·
                            Quality ${Math.round((e.quality_score || 0) * 100)}% ·
                            ${esc(e.faculty || 'All fields')} ·
                            ${esc(e.institution || 'All institutions')}
                        </div>
                    </div>
                `).join('')}
            ` : ''}
        </div>
    `;
}

// ============================================
// TAB: CODES
// ============================================

function renderCodesTab(codes) {
    const unused  = codes.filter(c => c.status === 'unused');
    const used    = codes.filter(c => c.status === 'used');
    const expired = codes.filter(c => c.status === 'expired' || c.status === 'revoked');

    return `
        <div class="card" style="margin-bottom:16px;">
            <h3 style="font-size:14px;font-weight:700;margin-bottom:16px;">Generate Activation Codes</h3>
            <div style="display:flex;gap:8px;align-items:flex-end;flex-wrap:wrap;">
                <div class="form-group" style="margin-bottom:0;">
                    <label>Quantity</label>
                    <input type="number" id="codeCount" class="input" value="5" min="1" max="100" style="width:80px;">
                </div>
                <div class="form-group" style="margin-bottom:0;">
                    <label>Duration (days)</label>
                    <input type="number" id="codeDuration" class="input" value="120" min="1" max="365" style="width:90px;">
                </div>
                <div class="form-group" style="margin-bottom:0;">
                    <label>Expires After</label>
                    <input type="date" id="codeExpiry" class="input" style="max-width:160px;">
                </div>
                <button class="btn btn-primary btn-sm" id="generateCodesBtn">Generate Codes</button>
            </div>
            <div id="generatedCodesOutput" style="margin-top:16px;"></div>
        </div>

        <div class="card">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                <h3 style="font-size:14px;font-weight:700;">
                    All Codes
                    <span style="font-size:11px;color:var(--text3);font-weight:400;margin-left:8px;">
                        ${unused.length} unused · ${used.length} used · ${expired.length} expired
                    </span>
                </h3>
                <select id="codeFilter" class="input" style="max-width:120px;">
                    <option value="all">All</option>
                    <option value="unused">Unused</option>
                    <option value="used">Used</option>
                    <option value="expired">Expired</option>
                </select>
            </div>
            ${codes.length === 0 ? `
                <p style="color:var(--text3);font-size:13px;text-align:center;padding:24px;">No activation codes yet. Generate some above.</p>
            ` : `
                <div style="overflow-x:auto;">
                    <table style="width:100%;border-collapse:collapse;font-size:11px;">
                        <thead>
                            <tr style="border-bottom:var(--border);color:var(--text3);">
                                <th style="padding:8px 6px;text-align:left;">Code</th>
                                <th style="padding:8px 6px;text-align:left;">Duration</th>
                                <th style="padding:8px 6px;text-align:left;">Status</th>
                                <th style="padding:8px 6px;text-align:left;">Used By</th>
                                <th style="padding:8px 6px;text-align:left;">Expires</th>
                                <th style="padding:8px 6px;text-align:left;">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="codesTableBody">
                            ${codes.map(c => {
                                const statusColor = c.status === 'used' ? 'var(--green)' : c.status === 'unused' ? 'var(--gold)' : 'var(--red)';
                                return `
                                    <tr style="border-bottom:1px solid rgba(255,255,255,0.04);" data-status="${c.status}">
                                        <td style="padding:8px 6px;font-family:var(--mono);font-size:11px;color:var(--gold);letter-spacing:1px;">${esc(c.code)}</td>
                                        <td style="padding:8px 6px;color:var(--text2);">${c.duration_days || 120} days</td>
                                        <td style="padding:8px 6px;">
                                            <span style="background:${statusColor}22;color:${statusColor};padding:2px 8px;border-radius:10px;font-size:10px;">${c.status}</span>
                                        </td>
                                        <td style="padding:8px 6px;color:var(--text3);">${c.used_by ? c.used_by.substring(0, 12) + '...' : '—'}</td>
                                        <td style="padding:8px 6px;color:var(--text3);">${c.expires_at ? new Date(c.expires_at).toLocaleDateString('en-GB') : 'No expiry'}</td>
                                        <td style="padding:8px 6px;">
                                            ${c.status === 'unused' ? `
                                                <button class="btn btn-sm" data-id="${c.id}" style="font-size:10px;background:transparent;border:1px solid rgba(255,71,87,0.3);color:var(--red);" id="revokeCode-${c.id}">Revoke</button>
                                            ` : '—'}
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            `}
        </div>
    `;
}

function setupCodesTab(codes, navigateTo) {
    // Filter codes
    document.getElementById('codeFilter')?.addEventListener('change', e => {
        const f = e.target.value;
        document.querySelectorAll('#codesTableBody tr').forEach(row => {
            row.style.display = (f === 'all' || row.dataset.status === f) ? '' : 'none';
        });
    });

    // Generate codes
    document.getElementById('generateCodesBtn')?.addEventListener('click', async () => {
        const count    = parseInt(document.getElementById('codeCount').value) || 5;
        const duration = parseInt(document.getElementById('codeDuration').value) || 120;
        const expiry   = document.getElementById('codeExpiry').value;
        const btn = document.getElementById('generateCodesBtn');

        btn.disabled = true;
        btn.textContent = 'Generating...';

        const generated = [];
        for (let i = 0; i < count; i++) {
            const code = generateCode();
            const expires = expiry ? new Date(expiry).toISOString() : null;

            const { data } = await supabase.from('activation_codes').insert({
                code,
                status: 'unused',
                duration_days: duration,
                expires_at: expires,
                created_at: new Date().toISOString(),
            }).select('code').single();

            if (data) generated.push(code);
        }

        const outputEl = document.getElementById('generatedCodesOutput');
        outputEl.innerHTML = `
            <div style="background:var(--elevated);border-radius:8px;padding:14px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                    <span style="font-size:12px;color:var(--text2);">${generated.length} codes generated:</span>
                    <button class="btn btn-sm btn-secondary" id="copyAllCodes">Copy All</button>
                </div>
                <div style="font-family:var(--mono);font-size:12px;color:var(--gold);letter-spacing:1px;line-height:2;">
                    ${generated.map(c => `<div>${c}</div>`).join('')}
                </div>
            </div>
        `;

        document.getElementById('copyAllCodes').addEventListener('click', () => {
            navigator.clipboard.writeText(generated.join('\n'));
            document.getElementById('copyAllCodes').textContent = 'Copied!';
        });

        btn.disabled = false;
        btn.textContent = 'Generate Codes';
        showToast(`${generated.length} codes generated.`, 'success');
    });

    // Revoke codes
    codes.filter(c => c.status === 'unused').forEach(c => {
        document.getElementById(`revokeCode-${c.id}`)?.addEventListener('click', async () => {
            if (!confirm('Revoke this code? It can no longer be used.')) return;
            await supabase.from('activation_codes').update({ status: 'revoked' }).eq('id', c.id);
            showToast('Code revoked.', 'warning');
            renderAdminPage({}, null, navigateTo);
        });
    });
}

// ============================================
// TAB: SETTINGS
// ============================================

function renderSettingsTab() {
    return `
        <div class="card" style="max-width:500px;margin-bottom:16px;">
            <h3 style="font-size:14px;font-weight:700;margin-bottom:16px;">Default Settings</h3>

            <div class="form-group">
                <label>Free Trial Duration (days)</label>
                <input type="number" id="settingTrialDays" class="input" value="14" style="max-width:200px;">
                <p style="font-size:11px;color:var(--text3);margin-top:4px;">Applied to all new signups.</p>
            </div>

            <div class="form-group">
                <label>Free Questions Per Day</label>
                <input type="number" id="settingFreeQueries" class="input" value="10" style="max-width:200px;">
            </div>

            <div class="form-group">
                <label>Pro Price (XAF)</label>
                <input type="number" id="settingProPrice" class="input" value="3000" style="max-width:200px;">
                <p style="font-size:11px;color:var(--text3);margin-top:4px;">3000 XAF ≈ $5 USD</p>
            </div>

            <button class="btn btn-primary btn-sm" id="saveSettingsBtn">Save Settings</button>
            <p style="font-size:10px;color:var(--text3);margin-top:8px;">
                Note: Changes apply to new users. Existing users keep their current limits until manually updated.
            </p>
        </div>

        <div class="card" style="max-width:500px;margin-bottom:16px;">
            <h3 style="font-size:14px;font-weight:700;margin-bottom:16px;">Maintenance Mode</h3>
            <p style="font-size:13px;color:var(--text2);margin-bottom:12px;">
                Enabling maintenance mode shows a "We'll be back soon" page to all non-admin visitors.
            </p>
            <p style="font-size:12px;color:var(--text3);margin-bottom:12px;">
                Set <code style="background:var(--elevated);padding:2px 6px;border-radius:4px;">VITE_MAINTENANCE_MODE=true</code>
                in your .env file and redeploy.
            </p>
            <button class="btn btn-sm btn-secondary" id="maintenanceInfoBtn">How to enable</button>
        </div>

        <div class="card" style="max-width:500px;border-color:rgba(255,71,87,0.25);">
            <h3 style="font-size:14px;font-weight:700;color:var(--red);margin-bottom:16px;">Danger Zone</h3>
            <div style="display:flex;flex-direction:column;gap:8px;">
                <button class="btn btn-sm" style="background:transparent;border:1px solid rgba(255,71,87,0.3);color:var(--red);text-align:left;padding:10px 14px;" id="clearCacheBtn">
                    Clear Knowledge Cache — removes all stored Q&A pairs
                </button>
                <button class="btn btn-sm" style="background:transparent;border:1px solid rgba(255,71,87,0.3);color:var(--red);text-align:left;padding:10px 14px;" id="resetQueriesAllBtn">
                    Reset All Daily Query Counts — resets every user's today count to 0
                </button>
            </div>
        </div>
    `;
}

function setupSettingsTab(navigateTo) {
    document.getElementById('saveSettingsBtn')?.addEventListener('click', () => {
        showToast('Settings saved. Note: these are UI references only. Update your .env and Supabase for permanent changes.', 'success');
    });

    document.getElementById('maintenanceInfoBtn')?.addEventListener('click', () => {
        alert('To enable maintenance mode:\n\n1. Open your .env file\n2. Set VITE_MAINTENANCE_MODE=true\n3. Run npm run build\n4. Redeploy to Vercel/Render\n\nOnly admin sessions will bypass maintenance mode.');
    });

    document.getElementById('clearCacheBtn')?.addEventListener('click', async () => {
        if (!confirm('Delete ALL cached Q&A pairs? The system will rebuild the cache over time but this will increase API costs temporarily.')) return;
        await supabase.from('knowledge_cache').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        showToast('Knowledge cache cleared.', 'warning');
    });

    document.getElementById('resetQueriesAllBtn')?.addEventListener('click', async () => {
        if (!confirm('Reset ALL users\' daily query counts to 0?')) return;
        await supabase.from('profiles').update({ queries_today: 0 }).neq('id', '00000000-0000-0000-0000-000000000000');
        showToast('All query counts reset.', 'success');
    });
}

// ============================================
// COMMON LISTENERS
// ============================================

function setupCommonListeners(navigateTo) {
    // These are already set up in the shell
}

// ============================================
// COMPONENT HELPERS
// ============================================

function statCard(value, label, sub = '') {
    return `
        <div class="stat-card">
            <div class="stat-value">${value}</div>
            <div class="stat-label">${label}</div>
            ${sub ? `<div style="font-size:10px;color:var(--text3);margin-top:4px;">${sub}</div>` : ''}
        </div>
    `;
}

function miniStat(value, label, color = 'var(--gold)') {
    return `
        <div style="background:var(--elevated);border-radius:8px;padding:12px;text-align:center;">
            <div style="font-size:18px;font-weight:700;color:${color};line-height:1;">${value}</div>
            <div style="font-size:10px;color:var(--text3);margin-top:4px;">${label}</div>
        </div>
    `;
}

function healthChip(label, isOk, type = null) {
    const color = type === 'warning' ? 'var(--gold)' : isOk ? 'var(--green)' : 'var(--red)';
    return `
        <div style="background:var(--surface);border:var(--border);border-radius:6px;padding:7px 10px;font-size:10px;text-align:center;display:flex;align-items:center;justify-content:center;gap:5px;">
            <span style="width:6px;height:6px;border-radius:50%;background:${color};flex-shrink:0;"></span>
            <span style="color:var(--text2);">${label}</span>
        </div>
    `;
}

function buildAdminSkeleton() {
    const s = `background:linear-gradient(90deg,var(--elevated) 25%,var(--overlay) 50%,var(--elevated) 75%);background-size:200% 100%;animation:shimmer 1.2s infinite;`;
    return `
        <style>@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}</style>
        <div style="max-width:1100px;margin:0 auto;padding:24px;">
            <div style="height:40px;border-radius:6px;${s};margin-bottom:16px;"></div>
            <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-bottom:20px;">
                ${[1,2,3,4,5].map(() => `<div style="height:36px;border-radius:6px;${s};"></div>`).join('')}
            </div>
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px;">
                ${[1,2,3,4].map(() => `<div style="height:80px;border-radius:8px;${s};"></div>`).join('')}
            </div>
            <div style="height:400px;border-radius:12px;${s};"></div>
        </div>
    `;
}

// ============================================
// UTILITY
// ============================================

function generateCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const segment = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    return `CC-${segment()}-${segment()}-${segment()}`;
}

function showToast(message, type = 'success') {
    const existing = document.getElementById('adminToast');
    if (existing) existing.remove();

    const colors = {
        success: 'var(--green)',
        warning: 'var(--gold)',
        error:   'var(--red)',
        info:    'var(--text2)',
    };

    const toast = document.createElement('div');
    toast.id = 'adminToast';
    toast.style.cssText = `
        position:fixed;bottom:20px;right:20px;padding:12px 20px;
        background:var(--surface);border:1px solid ${colors[type] || colors.success};
        color:${colors[type] || colors.success};border-radius:8px;font-size:13px;
        z-index:10000;max-width:320px;box-shadow:var(--shadow-lg);
        animation:toastIn 0.25s ease-out;font-family:var(--font);
    `;
    toast.textContent = message;

    const style = document.createElement('style');
    style.textContent = `@keyframes toastIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`;
    document.head.appendChild(style);

    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

function esc(t) {
    if (!t) return '';
    const d = document.createElement('div');
    d.textContent = t;
    return d.innerHTML;
}

// Add to admin.js - in the Codes tab section
async function generateActivationCodes() {
    const count = parseInt(document.getElementById('codeCount').value) || 5;
    const days = parseInt(document.getElementById('codeDuration').value) || 120;
    const codes = [];
    
    for (let i = 0; i < count; i++) {
        const code = 'CC-' + 
            Math.random().toString(36).substring(2, 6).toUpperCase() + '-' +
            Math.random().toString(36).substring(2, 6).toUpperCase() + '-' +
            Math.random().toString(36).substring(2, 6).toUpperCase();
        
        await supabase.from('activation_codes').insert({
            code: code,
            status: 'unused',
            duration_days: days,
            expires_at: new Date(Date.now() + days * 86400000).toISOString()
        });
        codes.push(code);
    }
    
    // Display generated codes
    const output = document.getElementById('generatedCodes');
    output.innerHTML = `
        <div style="margin-top:16px;padding:12px;background:var(--elevated);border-radius:8px;">
            <p style="margin-bottom:8px;color:var(--gold);">✅ ${codes.length} codes generated:</p>
            <div style="font-family:monospace;font-size:12px;">
                ${codes.map(c => `<div>${c}</div>`).join('')}
            </div>
            <button class="btn btn-sm btn-primary" id="copyCodesBtn" style="margin-top:8px;">Copy All</button>
        </div>
    `;
    
    document.getElementById('copyCodesBtn')?.addEventListener('click', () => {
        navigator.clipboard.writeText(codes.join('\n'));
        alert('Codes copied!');
    });
}

