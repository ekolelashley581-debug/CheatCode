// src/js/pages/payment.js
import { supabase } from '../supabase.js';

const PRICE_XAF = 4500;
const PRICE_USD = '$7.99';
const PAYMENT_LINK = 'https://pay.fapshi.com/54673366'; // YOUR FAPSHI LINK

export async function renderPaymentPage(state, _supabase, navigateTo) {
    const page = document.getElementById('page-payment');
    if (!page) return;
    if (!state.user) { navigateTo('signin'); return; }

    // If already paid
    if (state.profile?.status === 'paid') {
        page.innerHTML = `
            <div style="text-align:center;padding:60px 20px;">
                <div style="font-size:48px;margin-bottom:16px;color:var(--green);">✓</div>
                <h2>Pro Access Active</h2>
                <p style="color:var(--text2);">Unlimited questions, all features unlocked.</p>
                <button class="btn btn-primary" id="goStudyBtn" style="margin-top:16px;">Continue Studying →</button>
            </div>
        `;
        document.getElementById('goStudyBtn')?.addEventListener('click', () => navigateTo('study'));
        return;
    }

    page.innerHTML = `
        <div style="max-width:420px;margin:0 auto;padding:20px;">
            <a href="#" id="backLink" style="color:var(--text3);font-size:13px;text-decoration:none;display:inline-block;margin-bottom:20px;">← Back</a>

            <div style="background:var(--surface);border-radius:12px;padding:24px;border:1px solid rgba(255,255,255,0.06);">
                <div style="text-align:center;margin-bottom:24px;">
                    <div style="font-size:48px;font-weight:700;color:var(--gold);">Pro</div>
                    <p style="color:var(--text2);font-size:13px;margin-top:4px;">One-time payment · Full semester access</p>
                    <div style="font-size:32px;font-weight:700;color:var(--gold);margin:12px 0;">${PRICE_USD} USD</div>
                    <div style="font-size:14px;color:var(--text2);">${PRICE_XAF.toLocaleString()} XAF</div>
                </div>

                <!-- ========================================== -->
                <!-- OPTION 1: PAY WITH FAPSHI                  -->
                <!-- ========================================== -->
                <div style="margin-bottom:20px;">
                    <button class="btn btn-primary" id="payBtn" style="width:100%;padding:14px;font-size:16px;">
                        💳 Pay with Fapshi
                    </button>
                    <p style="font-size:11px;color:var(--text3);text-align:center;margin-top:8px;">
                        You'll be redirected to complete payment
                    </p>
                </div>

                <!-- ========================================== -->
                <!-- DIVIDER                                    -->
                <!-- ========================================== -->
                <div style="position:relative;margin:24px 0;">
                    <hr style="border-color:rgba(255,255,255,0.08);">
                    <span style="position:absolute;top:-10px;left:50%;transform:translateX(-50%);background:var(--surface);padding:0 10px;color:var(--text3);font-size:11px;">OR</span>
                </div>

                <!-- ========================================== -->
                <!-- OPTION 2: ACTIVATION CODE                  -->
                <!-- ========================================== -->
                <div>
                    <label style="font-size:13px;color:var(--text2);display:block;margin-bottom:6px;">Have an activation code?</label>
                    <div style="display:flex;gap:8px;">
                        <input type="text" id="activationCode" class="input" 
                               placeholder="CC-XXXX-XXXX-XXXX" 
                               style="flex:1;text-transform:uppercase;letter-spacing:1px;font-family:monospace;">
                        <button class="btn btn-primary" id="activateBtn">Activate</button>
                    </div>
                    <div id="activationStatus" style="margin-top:10px;font-size:12px;"></div>
                </div>

                <!-- ========================================== -->
                <!-- STATUS MESSAGES                           -->
                <!-- ========================================== -->
                <div id="paymentStatus" style="margin-top:16px;"></div>
            </div>

            <div style="text-align:center;font-size:11px;color:var(--text3);margin-top:16px;">
                🔒 Secured by Fapshi · MTN MoMo & Orange Money
            </div>
        </div>
    `;

    // ── Back button ──
    document.getElementById('backLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo('dashboard');
    });

    // ── Pay button - redirect to Fapshi ──
    document.getElementById('payBtn')?.addEventListener('click', () => {
        // Open Fapshi payment link in new tab
        const fapshiLink = PAYMENT_LINK + `?user_id=${state.user.id}&email=${encodeURIComponent(state.user.email)}`;
        window.open(fapshiLink, '_blank');
        
        // Show instructions
        const statusEl = document.getElementById('paymentStatus');
        statusEl.innerHTML = `
            <div style="padding:14px;background:rgba(212,160,0,0.08);border-radius:8px;text-align:center;">
                <p style="color:var(--gold);font-weight:600;margin-bottom:6px;">💳 Payment window opened</p>
                <p style="color:var(--text2);font-size:12px;">Complete payment on Fapshi, then enter your activation code below.</p>
                <p style="color:var(--text3);font-size:11px;margin-top:6px;">After payment, you'll receive a code via email/SMS.</p>
            </div>
        `;
    });

    // ── Activate button ──
    document.getElementById('activateBtn')?.addEventListener('click', async () => {
        const code = document.getElementById('activationCode')?.value.trim().toUpperCase() || '';
        const statusEl = document.getElementById('activationStatus');
        const btn = document.getElementById('activateBtn');

        if (!code) {
            statusEl.innerHTML = `<p style="color:var(--red);font-size:12px;">Please enter an activation code.</p>`;
            return;
        }

        btn.disabled = true;
        btn.textContent = 'Checking...';
        statusEl.innerHTML = `<p style="color:var(--text2);font-size:12px;">Verifying code...</p>`;

        try {
            // Check if code exists and is unused
            const { data: codeData, error: codeError } = await supabase
                .from('activation_codes')
                .select('*')
                .eq('code', code)
                .eq('status', 'unused')
                .single();

            if (codeError || !codeData) {
                throw new Error('Invalid or already used code.');
            }

            if (codeData.expires_at && new Date() > new Date(codeData.expires_at)) {
                throw new Error('This code has expired.');
            }

            // Activate user
            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    status: 'paid',
                    query_limit: 999999,
                    queries_today: 0,
                    paid_at: new Date().toISOString(),
                })
                .eq('id', state.user.id);

            if (updateError) throw new Error('Failed to activate. Please contact support.');

            // Mark code as used
            await supabase
                .from('activation_codes')
                .update({
                    status: 'used',
                    used_by: state.user.id,
                    used_at: new Date().toISOString(),
                })
                .eq('id', codeData.id);

            // Update state
            if (state.profile) {
                state.profile.status = 'paid';
                state.profile.query_limit = 999999;
                state.profile.queries_today = 0;
            }

            statusEl.innerHTML = `
                <p style="color:var(--green);font-weight:600;font-size:13px;"> Pro Activated!</p>
                <p style="color:var(--text2);font-size:12px;">Redirecting to dashboard...</p>
            `;
            
            setTimeout(() => navigateTo('dashboard'), 1500);

        } catch (err) {
            statusEl.innerHTML = `<p style="color:var(--red);font-size:12px;">${err.message}</p>`;
            btn.disabled = false;
            btn.textContent = 'Activate';
        }
    });

    // ── Check for pending activation ──
    const pending = sessionStorage.getItem('cc_pending_activation');
    if (pending) {
        try {
            const { code } = JSON.parse(pending);
            document.getElementById('activationCode').value = code;
            document.getElementById('activateBtn')?.click();
            sessionStorage.removeItem('cc_pending_activation');
        } catch { /* ignore */ }
    }
}