// src/js/pages/admin-login.js
import { refreshProfileAndShell } from '../app.js';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'ekolelashley581@gmail.com';
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'Berly2004-2023';

export async function renderAdminLoginPage(state, _supabase, navigateTo) {
    const page = document.getElementById('page-admin-login');
    if (!page) return;

    if (sessionStorage.getItem('cc_role') === 'admin') {
        navigateTo('admin');
        return;
    }

    page.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;background:var(--bg);">
            <div style="max-width:360px;width:100%;padding:24px;">
                <div style="text-align:center;margin-bottom:32px;">
                    <span style="font-size:48px;">🏛️</span>
                    <h2 style="margin-top:8px;">Admin Access</h2>
                    <p style="color:var(--text3);font-size:12px;">Command Center for CheatCode</p>
                    <p style="color:var(--text3);font-size:11px;margin-top:6px;">Direct link: <code style="background:var(--elevated);padding:2px 6px;border-radius:4px;">#admin-login</code></p>
                </div>

                <div class="card" style="padding:24px;">
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="adminEmail" class="input" placeholder="admin@cheatcode.com" autocomplete="off">
                    </div>
                    <div class="form-group">
                        <label>Master Password</label>
                        <input type="password" id="adminPassword" class="input" placeholder="••••••••">
                    </div>
                    <div id="loginError" style="display:none;color:var(--red);font-size:12px;margin-bottom:12px;text-align:center;"></div>
                    <button class="btn btn-primary" id="adminLoginBtn" style="width:100%;">Access Command Center</button>
                    <button class="btn btn-secondary" id="backToAppBtn" style="width:100%;margin-top:8px;">Back to App</button>
                </div>
            </div>
        </div>
    `;

    document.getElementById('adminLoginBtn')?.addEventListener('click', async () => {
        const email = document.getElementById('adminEmail')?.value.trim() || '';
        const password = document.getElementById('adminPassword')?.value || '';
        const errorDiv = document.getElementById('loginError');

        if (!email || !password) {
            errorDiv.style.display = 'block';
            errorDiv.textContent = 'Please enter both email and password.';
            return;
        }

        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
            sessionStorage.setItem('cc_role', 'admin');
            sessionStorage.setItem('cc_access', new Date().toISOString());
            await refreshProfileAndShell();
            navigateTo('admin');
        } else {
            errorDiv.style.display = 'block';
            errorDiv.textContent = 'Invalid credentials. Access denied.';
        }
    });

    document.getElementById('backToAppBtn')?.addEventListener('click', () => {
        if (state.user) navigateTo('dashboard');
        else navigateTo('landing');
    });

    // Allow Enter key to submit
    page.querySelectorAll('input').forEach(input => {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') document.getElementById('adminLoginBtn')?.click();
        });
    });
}
