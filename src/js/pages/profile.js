import { supabase } from '../supabase.js';

export async function renderProfilePage(state, _supabase, navigateTo) {
    const page = document.getElementById('page-profile');
    if (!page) return;
    if (!state.user) { navigateTo('signin'); return; }

    let profile = state.profile;
    if (!profile) {
        const { data } = await supabase.from('profiles').select('*').eq('id', state.user.id).single();
        profile = data;
        state.profile = data;
    }

    const isPaid = profile?.status === 'paid';
    const isTrial = profile?.status === 'trial';
    const trialDaysLeft = profile?.trial_end ? Math.max(0, Math.ceil((new Date(profile.trial_end) - new Date()) / (1000 * 60 * 60 * 24))) : 7;
    const memberSince = profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Recently';

    page.innerHTML = `
        <div class="profile-layout">
            <a href="#" class="back-link" id="backLink">← Back to Dashboard</a>

            <!-- HEADER -->
            <div class="profile-header">
                <div class="profile-avatar-lg">${(profile?.first_name || '?')[0].toUpperCase()}</div>
                <div>
                    <h2>${escapeHtml(profile?.first_name || '')} ${escapeHtml(profile?.last_name || '')}</h2>
                    <span class="badge ${isPaid ? 'badge-success' : isTrial ? 'badge-warning' : 'badge-danger'}">
                        ${isPaid ? 'Pro Member' : isTrial ? `Trial · ${trialDaysLeft} days left` : 'Expired'}
                    </span>
                    <p style="color:var(--text3);font-size:11px;margin-top:4px;">Member since ${memberSince}</p>
                </div>
            </div>

            <!-- PERSONAL INFORMATION -->
            <div class="card" style="margin-bottom:16px;">
                <h3 style="font-size:12px;color:var(--text3);text-transform:uppercase;letter-spacing:1px;margin-bottom:16px;padding-bottom:10px;border-bottom:1px solid rgba(255,255,255,0.05);">
                    Personal Information
                </h3>
                
                <div class="form-group">
                    <label>First Name</label>
                    <div class="profile-input-row">
                        <input type="text" id="editFirstName" class="input" value="${escapeHtml(profile?.first_name || '')}" placeholder="First name">
                        <button class="btn btn-sm btn-primary" id="saveFirstName">Save</button>
                    </div>
                </div>

                <div class="form-group">
                    <label>Last Name</label>
                    <div class="profile-input-row">
                        <input type="text" id="editLastName" class="input" value="${escapeHtml(profile?.last_name || '')}" placeholder="Last name">
                        <button class="btn btn-sm btn-primary" id="saveLastName">Save</button>
                    </div>
                </div>

                <div class="form-group">
                    <label>Email</label>
                    <input type="text" class="input" value="${escapeHtml(state.user.email || '')}" disabled style="opacity:0.5;background:var(--elevated);">
                    <span style="font-size:10px;color:var(--text3);">Email cannot be changed</span>
                </div>

                <div class="form-group">
                    <label>Phone Number</label>
                    <div class="profile-input-row">
                        <input type="tel" id="editPhone" class="input" value="${escapeHtml(profile?.phone || '')}" placeholder="+237 6XX XXX XXX">
                        <button class="btn btn-sm btn-primary" id="savePhone">Save</button>
                    </div>
                </div>

                <div class="form-group">
                    <label>Country</label>
                    <div class="profile-input-row">
                        <select id="editCountry" class="input">
                            <option value="">Select country...</option>
                            ${['Cameroon', 'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'United States', 'United Kingdom', 'Other'].map(c => 
                                `<option ${profile?.country === c ? 'selected' : ''}>${c}</option>`
                            ).join('')}
                        </select>
                        <button class="btn btn-sm btn-primary" id="saveCountry">Save</button>
                    </div>
                </div>

                <div class="form-group">
                    <label>University / Institution</label>
                    <div class="profile-input-row">
                        <input type="text" id="editUniversity" class="input" value="${escapeHtml(profile?.university || '')}" placeholder="e.g., University of Buea">
                        <button class="btn btn-sm btn-primary" id="saveUniversity">Save</button>
                    </div>
                </div>

                <div class="form-group">
                    <label>Field of Study / Department</label>
                    <div class="profile-input-row">
                        <input type="text" id="editDepartment" class="input" value="${escapeHtml(profile?.department || '')}" placeholder="e.g., Civil Engineering">
                        <button class="btn btn-sm btn-primary" id="saveDepartment">Save</button>
                    </div>
                </div>

                <div class="form-group">
                    <label>Academic Level / Year</label>
                    <div class="profile-input-row">
                        <select id="editLevel" class="input">
                            <option value="">Select level...</option>
                            ${['100', '200', '300', '400', '500', 'Master', 'PhD', 'Other'].map(l => 
                                `<option ${profile?.level === l ? 'selected' : ''}>${l}</option>`
                            ).join('')}
                        </select>
                        <button class="btn btn-sm btn-primary" id="saveLevel">Save</button>
                    </div>
                </div>
            </div>

            <!-- ACCOUNT STATUS -->
            <div class="card" style="margin-bottom:16px;">
                <h3 style="font-size:12px;color:var(--text3);text-transform:uppercase;letter-spacing:1px;margin-bottom:16px;padding-bottom:10px;border-bottom:1px solid rgba(255,255,255,0.05);">
                    Account
                </h3>
                
                ${!isPaid ? `
                    <div style="margin-bottom:16px;">
                        <div style="background:rgba(245,176,66,0.1);border:1px solid rgba(245,176,66,0.2);border-radius:8px;padding:16px;text-align:center;margin-bottom:16px;">
                            <div style="font-size:20px;font-weight:700;color:var(--gold);margin-bottom:4px;">Free Trial</div>
                            <div style="font-size:12px;color:var(--text2);">${trialDaysLeft} days remaining</div>
                            <div style="font-size:11px;color:var(--text3);margin-top:8px;">${profile?.queries_today || 0}/${profile?.query_limit || 10} questions used today</div>
                        </div>
                        <button class="btn btn-primary" id="upgradeBtn" style="width:100%;">Upgrade to Pro — $7.99</button>
                        <p style="font-size:11px;color:var(--text3);text-align:center;margin-top:8px;">One-time payment · Unlimited questions · All features</p>
                    </div>
                ` : `
                    <div style="background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.2);border-radius:8px;padding:16px;text-align:center;margin-bottom:16px;">
                        <div style="font-size:20px;font-weight:700;color:var(--green);margin-bottom:4px;">Pro Access Active</div>
                        <div style="font-size:12px;color:var(--text2);">Unlimited questions · All features unlocked</div>
                        <div style="font-size:11px;color:var(--text3);margin-top:8px;">Thank you for supporting CheatCode</div>
                    </div>
                `}
                
                <button class="btn btn-secondary" id="signoutBtn" style="width:100%;margin-bottom:8px;">Sign Out</button>
            </div>

            <!-- DANGER ZONE -->
            <div class="card" style="border-color:rgba(239,68,68,0.2);">
                <h3 style="font-size:12px;color:var(--red);text-transform:uppercase;letter-spacing:1px;margin-bottom:16px;padding-bottom:10px;border-bottom:1px solid rgba(239,68,68,0.1);">
                    Danger Zone
                </h3>
                <button class="btn btn-sm" id="deleteAccountBtn" style="background:transparent;border:1px solid rgba(239,68,68,0.3);color:var(--red);width:100%;">
                    Delete My Account
                </button>
                <p style="font-size:10px;color:var(--text3);margin-top:8px;text-align:center;">
                    This action is permanent and cannot be undone. All your data will be deleted.
                </p>
            </div>
        </div>
    `;

    // ============================================
    // EVENT LISTENERS
    // ============================================

    // Back button
    const backLink = document.getElementById('backLink');
    if (backLink) {
        backLink.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo('dashboard');
        });
    }

    // Save functions
    async function saveField(field, value, btn, successMsg = 'Saved!') {
        if (!value && field !== 'phone') return;
        const originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'Saving...';
        
        try {
            await supabase.from('profiles').update({ [field]: value }).eq('id', state.user.id);
            state.profile = null;
            btn.textContent = successMsg;
            btn.style.background = '#10b981';
            btn.style.color = '#fff';
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = '';
                btn.style.color = '';
                btn.disabled = false;
            }, 1500);
        } catch (err) {
            btn.textContent = 'Error!';
            setTimeout(() => {
                btn.textContent = originalText;
                btn.disabled = false;
            }, 1500);
        }
    }

    const saveFirstName = document.getElementById('saveFirstName');
    if (saveFirstName) {
        saveFirstName.addEventListener('click', function() {
            saveField('first_name', document.getElementById('editFirstName').value.trim(), this, 'Saved!');
        });
    }
    
    const saveLastName = document.getElementById('saveLastName');
    if (saveLastName) {
        saveLastName.addEventListener('click', function() {
            saveField('last_name', document.getElementById('editLastName').value.trim(), this, 'Saved!');
        });
    }
    
    const savePhone = document.getElementById('savePhone');
    if (savePhone) {
        savePhone.addEventListener('click', function() {
            saveField('phone', document.getElementById('editPhone').value.trim(), this, 'Saved!');
        });
    }
    
    const saveCountry = document.getElementById('saveCountry');
    if (saveCountry) {
        saveCountry.addEventListener('click', function() {
            saveField('country', document.getElementById('editCountry').value, this, 'Saved!');
        });
    }
    
    const saveUniversity = document.getElementById('saveUniversity');
    if (saveUniversity) {
        saveUniversity.addEventListener('click', function() {
            saveField('university', document.getElementById('editUniversity').value.trim(), this, 'Saved!');
        });
    }
    
    const saveDepartment = document.getElementById('saveDepartment');
    if (saveDepartment) {
        saveDepartment.addEventListener('click', function() {
            saveField('department', document.getElementById('editDepartment').value.trim(), this, 'Saved!');
        });
    }
    
    const saveLevel = document.getElementById('saveLevel');
    if (saveLevel) {
        saveLevel.addEventListener('click', function() {
            saveField('level', document.getElementById('editLevel').value, this, 'Saved!');
        });
    }

    // Upgrade button - navigates to payment page
    const upgradeBtn = document.getElementById('upgradeBtn');
    if (upgradeBtn) {
        upgradeBtn.addEventListener('click', () => {
            console.log('Upgrade button clicked, navigating to payment');
            navigateTo('payment');
        });
    }

    // Sign out button
    const signoutBtn = document.getElementById('signoutBtn');
    if (signoutBtn) {
        signoutBtn.addEventListener('click', async () => {
            if (confirm('Are you sure you want to sign out?')) {
                await supabase.auth.signOut();
                location.reload();
            }
        });
    }

    // Delete account button
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', () => {
            if (confirm('⚠️ PERMANENTLY delete your account and all data? This cannot be undone.')) {
                if (prompt('Type "DELETE" to confirm:') === 'DELETE') {
                    alert('For security, please contact support@cheatcode.app to delete your account.');
                }
            }
        });
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}