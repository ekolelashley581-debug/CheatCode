import { supabase } from '../supabase.js';

export function renderSigninPage(state, _supabase, navigateTo) {
    const page = document.getElementById('page-signin');
    if (!page) return;

    page.innerHTML = `
        <div class="auth-container">
            <div class="auth-card" style="max-width:400px;">
                <a href="#" class="back-link" id="backLink">← Back to Home</a>
                <div class="auth-logo">C</div>
                <h2>Welcome Back</h2>
                <p class="auth-subtitle">Sign in to continue studying.</p>
                <form id="signinForm" class="auth-form">
                    <div class="form-group"><label>Email</label><input type="email" id="email" class="input" required></div>
                    <div class="form-group"><label>Password</label><input type="password" id="password" class="input" required></div>
                    <div id="error" style="display:none;color:var(--red);font-size:12px;text-align:center;margin-bottom:8px;"></div>
                    <button type="submit" class="btn-auth">Sign In</button>
                </form>
                <p class="auth-footer">Don't have an account? <a href="#" id="goToSignup">Sign up free</a></p>
            </div>
        </div>
    `;

    document.getElementById('backLink').addEventListener('click', e => { e.preventDefault(); navigateTo('landing'); });
    document.getElementById('goToSignup').addEventListener('click', e => { e.preventDefault(); navigateTo('signup'); });

    document.getElementById('signinForm').addEventListener('submit', async e => {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        const errorEl = document.getElementById('error');
        btn.disabled = true; btn.textContent = 'Signing in...'; errorEl.style.display = 'none';

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: document.getElementById('email').value.trim(),
                password: document.getElementById('password').value,
            });
            if (error) throw error;
        } catch (err) {
            errorEl.style.display = 'block';
            errorEl.textContent = err.message || 'Invalid email or password.';
            btn.disabled = false; btn.textContent = 'Sign In';
        }
    });
}