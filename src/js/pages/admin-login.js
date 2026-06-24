// src/js/pages/admin-login.js
import { refreshProfileAndShell } from '../app.js';
import { supabase } from '../supabase.js';

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
                    <p style="color:var(--text3);font-size:12px;">Enter your admin key</p>
                </div>
                <div class="card" style="padding:24px;">
                    <div class="form-group">
                        <label>Admin Key</label>
                        <input type="password" id="adminKey" class="input" placeholder="Enter your admin key">
                    </div>
                    <div id="loginError" style="display:none;color:var(--red);font-size:12px;margin-bottom:12px;text-align:center;"></div>
                    <button class="btn btn-primary" id="adminLoginBtn" style="width:100%;">Access Command Center</button>
                    <button class="btn btn-secondary" id="backToAppBtn" style="width:100%;margin-top:8px;">Back to App</button>
                </div>
            </div>
        </div>
    `;

    document.getElementById('adminLoginBtn')?.addEventListener('click', async () => {
        const key = document.getElementById('adminKey')?.value.trim() || '';
        const errorDiv = document.getElementById('loginError');

        if (!key) {
            errorDiv.style.display = 'block';
            errorDiv.textContent = 'Please enter your admin key.';
            return;
        }

        try {
            // ✅ Verify against Supabase - NO hardcoded credentials!
            const { data, error } = await supabase
                .from('admins')
                .select('*')
                .eq('access_key', key)
                .eq('is_active', true)
                .single();

            if (error || !data) {
                errorDiv.style.display = 'block';
                errorDiv.textContent = 'Invalid admin key.';
                return;
            }

            sessionStorage.setItem('cc_role', 'admin');
            sessionStorage.setItem('cc_access', new Date().toISOString());
            
            await supabase
                .from('admins')
                .update({ last_login: new Date().toISOString() })
                .eq('id', data.id);

            await refreshProfileAndShell();
            navigateTo('admin');

        } catch (err) {
            errorDiv.style.display = 'block';
            errorDiv.textContent = 'Error verifying admin key.';
            console.error('[Admin] Error:', err);
        }
    });

    document.getElementById('backToAppBtn')?.addEventListener('click', () => {
        if (state.user) navigateTo('dashboard');
        else navigateTo('landing');
    });
}