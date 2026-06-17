import { supabase } from '../supabase.js';

export function renderSignupPage(state, _supabase, navigateTo) {
    const page = document.getElementById('page-signup');
    if (!page) return;

    page.innerHTML = `
        <div class="auth-container">
            <div class="auth-card">
                <a href="#" class="back-link" id="backLink">← Back to Home</a>
                <div class="auth-logo">C</div>
                <h2>Create Your Free Account</h2>
                <p class="auth-subtitle">Start your 7-day trial. No payment required.</p>
                <form id="signupForm" class="auth-form">
                    <div class="form-row">
                        <div class="form-group"><label>First Name</label><input type="text" id="firstName" class="input" required></div>
                        <div class="form-group"><label>Last Name</label><input type="text" id="lastName" class="input" required></div>
                    </div>
                    <div class="form-group"><label>Email</label><input type="email" id="email" class="input" required></div>
                    <div class="form-group"><label>Password</label><input type="password" id="password" class="input" required minlength="6"></div>
                    <div class="form-group"><label>Phone</label><input type="text" id="phone" class="input"></div>
                    <div class="form-group"><label>Country</label>
                        <select id="country" class="input"><option value="">Select...</option><option>Cameroon</option><option>Nigeria</option><option>Ghana</option><option>Other</option></select>
                    </div>
                    <div id="error" style="display:none;color:var(--red);font-size:12px;text-align:center;margin-bottom:8px;"></div>
                    <button type="submit" class="btn-auth">Create Free Account</button>
                </form>
                <p class="auth-footer">Already have an account? <a href="#" id="goToSignin">Sign in</a></p>
            </div>
        </div>
    `;

    document.getElementById('backLink').addEventListener('click', e => { e.preventDefault(); navigateTo('landing'); });
    document.getElementById('goToSignin').addEventListener('click', e => { e.preventDefault(); navigateTo('signin'); });

    document.getElementById('signupForm').addEventListener('submit', async e => {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        const errorEl = document.getElementById('error');
        btn.disabled = true; btn.textContent = 'Creating...'; errorEl.style.display = 'none';

        try {
            const { data, error } = await supabase.auth.signUp({
                email: document.getElementById('email').value.trim(),
                password: document.getElementById('password').value,
            });

            if (!data.session) {
    alert('Check your email to confirm your account.');
    return;
}

            if (error) throw error;

            await supabase.from('profiles').insert({
                id: data.user.id,
                first_name: document.getElementById('firstName').value.trim(),
                last_name: document.getElementById('lastName').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                country: document.getElementById('country').value,
                status: 'trial',
                trial_start: new Date().toISOString(),
                trial_end: new Date(Date.now() + 7*24*60*60*1000).toISOString(),
                queries_today: 0,
                query_limit: 10,
            });

           
        } catch (err) {
            errorEl.style.display = 'block';
            errorEl.textContent = err.message || 'Signup failed.';
            btn.disabled = false; btn.textContent = 'Create Free Account';
        }
    });
}