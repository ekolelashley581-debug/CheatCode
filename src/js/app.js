import './fix-regex.js';  // <-- ADD THIS LINE FIRST
// ============================================
// CHEATCODE V2 — app.js
// FIXED: invalid regular expression flag 'e'
// Added: regex debugging to catch errors
// Fixed: session persistence, mobile nav
// ============================================

// ============================================
// DEBUG: Catch invalid regex flags
// ============================================
(function catchInvalidRegex() {
    const originalRegExp = RegExp;
    window.RegExp = function(pattern, flags) {
        if (flags && flags.includes('e')) {
            console.error('❌ INVALID REGEX FLAG "e" DETECTED!');
            console.error('Pattern:', pattern);
            console.error('Flags:', flags);
            console.trace('Stack trace:');
            // Remove the 'e' flag to prevent crash
            flags = flags.replace(/e/g, '');
            if (!flags) flags = undefined;
        }
        return new originalRegExp(pattern, flags);
    };
    window.RegExp.prototype = originalRegExp.prototype;
    console.log('✅ Regex debugger installed');
})();

// ============================================
// IMPORTS
// ============================================

import { supabase } from './supabase.js';

// ============================================
// STATE
// ============================================
const state = { 
    currentPage: 'landing', 
    user: null, 
    profile: null 
};

const VALID_PAGES = [
    'landing', 'signup', 'signin', 'dashboard', 'study',
    'library', 'profile', 'payment', 'admin', 'admin-login',
];

function getPageFromHash() {
    const hash = window.location.hash.replace(/^#/, '').split('?')[0].trim();
    return VALID_PAGES.includes(hash) ? hash : null;
}

function resolveInitialPage() {
    const hashPage = getPageFromHash();
    if (hashPage === 'admin' || hashPage === 'admin-login') return hashPage;
    if (hashPage && (state.user || ['landing', 'signup', 'signin'].includes(hashPage))) return hashPage;
    return state.user ? 'dashboard' : 'landing';
}

// ============================================
// INIT
// ============================================
async function init() {
    console.log('[App] Initializing...');
    
    const adminRole   = sessionStorage.getItem('cc_role');
    const adminAccess = sessionStorage.getItem('cc_access');
    if (adminRole === 'admin' && adminAccess) {
        const hrs = (Date.now() - new Date(adminAccess)) / 3600000;
        if (hrs > 24) { 
            sessionStorage.removeItem('cc_role'); 
            sessionStorage.removeItem('cc_access'); 
        }
    }

    if (supabase) {
        try {
            const { data } = await supabase.auth.getSession();

            supabase.auth.onAuthStateChange(async (event, session) => {

    console.log('[Auth] Event:', event);

    if (session?.user) {

        state.user = session.user;

        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', state.user.id)
            .single();

        state.profile = profile;

        // Re-render authenticated shell
        renderShell();
        setupNav();

        navigateTo('dashboard');

    } else {

        state.user = null;
        state.profile = null;

        renderShell();
        navigateTo('signin');
    }
});

            if (data?.session?.user) {
                state.user = data.session.user;
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', state.user.id)
                    .single();
                state.profile = profile;
                console.log('[App] User authenticated:', state.user.email);
            }
        } catch (e) {
            console.error('[App] Auth error:', e);
        }
    }

    if (state.profile?.status === 'trial') {
        const trialEnd = new Date(state.profile.trial_end);
        if (new Date() > trialEnd) {
            state.profile.status = 'expired';
            await supabase
                .from('profiles')
                .update({ status: 'expired' })
                .eq('id', state.user.id);
        }
    }

    state.currentPage = resolveInitialPage();

    renderShell();
    setupNav();
    navigateTo(state.currentPage);
}

// ============================================
// RENDER SHELL
// ============================================
function renderShell() {
    const loggedIn = !!state.user;
    const isAdmin  = sessionStorage.getItem('cc_role') === 'admin';

    document.getElementById('app').innerHTML = `
        <header id="topbar">
            <div class="brand">
                <span class="logo" id="mobileBrand">C</span>
                <span>Cheat<span style="color:var(--gold);">Code</span></span>
            </div>
            <div class="status-bar">
                ${loggedIn ? `<span class="badge badge-success">Online</span>` : ''}
            </div>
        </header>

        ${loggedIn ? `
        <nav id="sidebar">
            <div class="sidebar-header" style="padding:14px 14px 10px;border-bottom:1px solid rgba(255,255,255,0.04);position:relative;">
                <div style="display:flex;align-items:center;gap:10px;font-weight:700;font-size:13px;">
                    <span class="sidebar-logo">C</span>
                    CheatCode
                </div>
                <button id="sidebarCloseBtn" style="display:none;position:absolute;right:10px;top:10px;background:none;border:none;color:var(--text3);font-size:20px;cursor:pointer;padding:4px 8px;">✕</button>
            </div>
            <div class="sidebar-nav" style="flex:1;padding:8px;display:flex;flex-direction:column;gap:2px;" id="navButtonsContainer">
                <button class="nav-btn" data-page="dashboard"> Dashboard</button>
                <button class="nav-btn" data-page="study"> Study</button>
                <button class="nav-btn" data-page="library"> Library</button>
                <button class="nav-btn" data-page="profile"> Profile</button>
                ${isAdmin ? '<button class="nav-btn" data-page="admin"> Admin</button>' : ''}
            </div>
            <div style="padding:8px 10px 10px;border-top:1px solid rgba(255,255,255,0.04);">
                <div style="display:flex;align-items:center;gap:8px;cursor:pointer;padding:6px;border-radius:6px;transition:background 0.2s;" id="sidebarProfile">
                    <div style="width:28px;height:28px;border-radius:50%;background:var(--gold);color:#000;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;">${(state.profile?.first_name || '?')[0].toUpperCase()}</div>
                    <div style="flex:1;min-width:0;">
                        <div style="font-size:11px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${state.profile?.first_name || 'Student'}</div>
                        <div style="font-size:9px;color:var(--text3);">${state.profile?.status === 'paid' ? 'Pro ✓' : 'Trial'}</div>
                    </div>
                    <button class="btn btn-sm btn-secondary" id="sidebarSignout" style="font-size:10px;flex-shrink:0;">Sign Out</button>
                </div>
            </div>
        </nav>` : ''}

        <main id="main-content">
            <div id="page-landing"    class="page"></div>
            <div id="page-signup"     class="page"></div>
            <div id="page-signin"     class="page"></div>
            <div id="page-dashboard"  class="page"></div>
            <div id="page-study"      class="page"></div>
            <div id="page-library"    class="page"></div>
            <div id="page-profile"    class="page"></div>
            <div id="page-payment"    class="page"></div>
            <div id="page-admin"      class="page"></div>
            <div id="page-admin-login" class="page"></div>
        </main>
    `;

    // Call mobile nav AFTER sidebar exists
    if (loggedIn) initMobileNav();
}

// ============================================
// SETUP NAV
// ============================================
function setupNav() {
    document.querySelectorAll('.nav-btn[data-page]').forEach(b => {
        b.addEventListener('click', () => {
            closeMobileSidebar();
            navigateTo(b.dataset.page);
        });
    });

    document.getElementById('sidebarProfile')?.addEventListener('click', () => {
        closeMobileSidebar();
        navigateTo('profile');
    });

    document.getElementById('sidebarSignout')?.addEventListener('click', async (e) => {
        e.stopPropagation();
        sessionStorage.removeItem('cc_role');
        sessionStorage.removeItem('cc_access');
        // Clear study session storage
        localStorage.removeItem('cc_last_session_id');
        localStorage.removeItem('cc_resume_session_id');
        localStorage.removeItem('cc_study_material');
        localStorage.removeItem('cc_study_title');
        localStorage.removeItem('cc_study_course');
        if (supabase) await supabase.auth.signOut();
        location.reload();
    });

    document.getElementById('sidebarCloseBtn')?.addEventListener('click', closeMobileSidebar);
}

// ============================================
// NAVIGATION
// ============================================
async function navigateTo(page) {
    console.log('[App] Navigating to:', page);
    state.currentPage = page;
    if (window.location.hash !== `#${page}`) {
        window.history.replaceState(null, '', `#${page}`);
    }

    const noSidebar = ['landing', 'signup', 'signin', 'payment', 'admin-login'];
    const app     = document.getElementById('app');
    const sidebar = document.getElementById('sidebar');
    const topbar  = document.getElementById('topbar');

    if (page === 'landing') {
        if (topbar) topbar.style.display = 'none';
        app.style.cssText = 'grid-template-areas:"main";grid-template-columns:1fr;grid-template-rows:1fr;';
    } else if (noSidebar.includes(page)) {
        if (topbar) topbar.style.display = 'flex';
        app.style.cssText = 'grid-template-areas:"topbar""main";grid-template-columns:1fr;grid-template-rows:48px 1fr;';
    } else {
        if (topbar) topbar.style.display = 'flex';
        app.style.cssText = 'grid-template-areas:"sidebar topbar""sidebar main";grid-template-columns:220px 1fr;grid-template-rows:48px 1fr;';
        if (sidebar) sidebar.style.display = 'flex';
    }

    if (sidebar) {
        if (noSidebar.includes(page)) {
            sidebar.style.display = 'none';
        } else {
            sidebar.style.display = 'flex';
            if (window.innerWidth <= 768) initMobileNav();
        }
    }

    document.querySelectorAll('.nav-btn[data-page]').forEach(b =>
        b.classList.toggle('active', b.dataset.page === page)
    );
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`page-${page}`)?.classList.add('active');

    await loadPage(page);
    document.getElementById('main-content').scrollTop = 0;
}

// ============================================
// LOAD PAGE - WITH ERROR HANDLING
// ============================================
async function loadPage(page) {
    console.log('[App] Loading page:', page);
    
    const loaders = {
        landing:      () => import('./pages/landing.js'),
        signup:       () => import('./pages/signup.js'),
        signin:       () => import('./pages/signin.js'),
        dashboard:    () => import('./pages/dashboard.js'),
        study:        () => import('./pages/study.js'),
        library:      () => import('./pages/library.js'),
        profile:      () => import('./pages/profile.js'),
        payment:      () => import('./pages/payment.js'),
        admin:        () => import('./pages/admin.js'),
        'admin-login':() => import('./pages/admin-login.js'),
    };

    try {
        const mod  = await loaders[page]();
        const name = `render${page.split('-').map(p => p[0].toUpperCase() + p.slice(1)).join('')}Page`;
        if (mod[name]) {
            await mod[name](state, supabase, navigateTo);
            console.log('[App] Page loaded:', page);
        } else {
            console.warn(`[App] No render function found for: ${page}`);
            // Show a simple message
            const pageEl = document.getElementById(`page-${page}`);
            if (pageEl) {
                pageEl.innerHTML = `
                    <div style="display:flex;align-items:center;justify-content:center;height:100%;padding:40px;">
                        <div style="text-align:center;">
                            <h3>${page}</h3>
                            <p style="color:var(--text2);">Page loaded but no render function</p>
                        </div>
                    </div>
                `;
            }
        }
    } catch (e) {
        console.error(`[app] Failed to load page: ${page}`, e);
        // Show error in page
        const pageEl = document.getElementById(`page-${page}`);
        if (pageEl) {
            pageEl.innerHTML = `
                <div style="display:flex;align-items:center;justify-content:center;height:100%;padding:40px;">
                    <div style="text-align:center;max-width:400px;">
                        <h3 style="color:var(--red);">❌ Failed to load ${page}</h3>
                        <p style="color:var(--text2);font-size:13px;margin-top:8px;">${e.message || 'Unknown error'}</p>
                        <button class="btn btn-primary" onclick="location.reload()" style="margin-top:16px;">Reload Page</button>
                    </div>
                </div>
            `;
        }
    }
}

// ============================================
// MOBILE SIDEBAR
// ============================================
function initMobileNav() {
    if (window.innerWidth > 768) {
        // Clean up mobile styles
        const sidebar = document.getElementById('sidebar');
        const closeBtn = document.getElementById('sidebarCloseBtn');
        if (sidebar) {
            Object.assign(sidebar.style, {
                position: '',
                transform: '',
                width: '',
                transition: '',
                zIndex: '',
                boxShadow: '',
                height: '',
                maxWidth: '',
                overflowY: '',
            });
        }
        if (closeBtn) closeBtn.style.display = 'none';
        return;
    }

    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    // Show the close button inside sidebar
    const closeBtn = document.getElementById('sidebarCloseBtn');
    if (closeBtn) closeBtn.style.display = 'block';

    // Don't add hamburger twice
    if (document.getElementById('hamburgerBtn')) return;

    // Style sidebar as off-canvas drawer
    Object.assign(sidebar.style, {
        position:   'fixed',
        top:        '0',
        left:       '0',
        bottom:     '0',
        width:      '78%',
        maxWidth:   '280px',
        height:     '100vh',
        transform:  'translateX(-100%)',
        transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
        zIndex:     '9999',
        boxShadow:  '4px 0 24px rgba(0,0,0,0.6)',
        overflowY:  'auto',
    });

    // Backdrop
    const backdrop = document.createElement('div');
    backdrop.id = 'sidebarBackdrop';
    Object.assign(backdrop.style, {
        display:    'none',
        position:   'fixed',
        inset:      '0',
        background: 'rgba(0,0,0,0.55)',
        zIndex:     '9998',
        backdropFilter: 'blur(2px)',
    });
    document.body.appendChild(backdrop);

    // Hamburger button
    const hamburger = document.createElement('button');
    hamburger.id = 'hamburgerBtn';
    hamburger.innerHTML = '☰';
    hamburger.setAttribute('aria-label', 'Open menu');
    Object.assign(hamburger.style, {
        position:    'fixed',
        bottom:      '20px',
        right:       '20px',
        width:       '52px',
        height:      '52px',
        borderRadius:'50%',
        background:  'var(--gold, #d4a000)',
        border:      'none',
        color:       '#000',
        fontSize:    '22px',
        fontWeight:  '700',
        cursor:      'pointer',
        zIndex:      '10000',
        display:     'flex',
        alignItems:  'center',
        justifyContent: 'center',
        boxShadow:   '0 4px 16px rgba(0,0,0,0.4)',
    });
    document.body.appendChild(hamburger);

    const open  = () => {
        sidebar.style.transform = 'translateX(0)';
        backdrop.style.display  = 'block';
        hamburger.innerHTML     = '✕';
    };
    const close = () => {
        sidebar.style.transform = 'translateX(-100%)';
        backdrop.style.display  = 'none';
        hamburger.innerHTML     = '☰';
    };

    hamburger.addEventListener('click', e => { 
        e.stopPropagation(); 
        sidebar.style.transform === 'translateX(0)' ? close() : open(); 
    });
    backdrop.addEventListener('click', close);

    // Store close fn globally
    window._closeMobileSidebar = close;
}

function closeMobileSidebar() {
    if (window._closeMobileSidebar) window._closeMobileSidebar();
}

// ============================================
// RESIZE HANDLER
// ============================================
window.addEventListener('resize', () => {
    const hamburger  = document.getElementById('hamburgerBtn');
    const backdrop   = document.getElementById('sidebarBackdrop');
    const sidebar    = document.getElementById('sidebar');
    const closeBtn   = document.getElementById('sidebarCloseBtn');

    if (window.innerWidth > 768) {
        if (hamburger) hamburger.remove();
        if (backdrop)  backdrop.remove();
        if (sidebar) {
            Object.assign(sidebar.style, { 
                position: '', 
                transform: '', 
                width: '', 
                transition: '', 
                zIndex: '', 
                boxShadow: '', 
                height: '', 
                maxWidth: '',
                overflowY: '',
            });
        }
        if (closeBtn)  closeBtn.style.display = 'none';
        window._closeMobileSidebar = null;
    } else {
        if (!document.getElementById('hamburgerBtn') && sidebar?.style.display !== 'none') {
            initMobileNav();
        }
    }
});

// ============================================
// KEYBOARD SHORTCUTS
// ============================================
document.addEventListener('keydown', e => {
    // Ctrl+Shift+A → admin
    if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        if (sessionStorage.getItem('cc_role') === 'admin') {
            navigateTo('admin');
        } else if (state.user) {
            navigateTo('admin-login');
        } else {
            navigateTo('signin');
        }
    }
    
    // Ctrl+Shift+S → study
    if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        if (state.user) navigateTo('study');
    }
    
    // Ctrl+Shift+L → library
    if (e.ctrlKey && e.shiftKey && e.key === 'L') {
        if (state.user) navigateTo('library');
    }
});

// ============================================
// PROFILE / SHELL REFRESH (after Pro upgrade)
// ============================================
export async function refreshProfileAndShell() {
    if (state.user && supabase) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', state.user.id)
            .single();
        if (profile) state.profile = profile;
    }
    const page = state.currentPage;
    renderShell();
    setupNav();
    document.querySelectorAll('.nav-btn[data-page]').forEach(b =>
        b.classList.toggle('active', b.dataset.page === page)
    );
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`page-${page}`)?.classList.add('active');
}

// ============================================
// START
// ============================================
document.addEventListener('DOMContentLoaded', init);

window.addEventListener('hashchange', () => {
    const hashPage = getPageFromHash();
    if (hashPage && hashPage !== state.currentPage) navigateTo(hashPage);
});

// ============================================
// EXPORTS
// ============================================
export { state, supabase, navigateTo };
