import{s as x}from"./index-BtxTVbtb.js";import{g as _}from"./supabase-session-manager-CUjF5Fi5.js";async function I(d,l,a){var p;const v=document.getElementById("page-dashboard");if(!v)return;if(!d.user){a("signin");return}let e=d.profile;if(!e){const{data:t}=await x.from("profiles").select("*").eq("id",d.user.id).single();e=t,d.profile=t}let i=[],c=0;try{i=await _(10),c=i.reduce((t,s)=>t+(s.duration||Math.min((s.message_count||0)*2,60)),0)}catch(t){console.warn("[Dashboard] getRecentSessions error:",t.message)}const n=(e==null?void 0:e.status)==="paid",u=e!=null&&e.trial_end?Math.max(0,Math.ceil((new Date(e.trial_end)-new Date)/864e5)):7,r=n?1/0:Math.max(0,((e==null?void 0:e.query_limit)||10)-((e==null?void 0:e.queries_today)||0)),f=e!=null&&e.trial_start?Math.ceil((new Date-new Date(e.trial_start))/864e5):1;v.innerHTML=`
        <div class="dashboard-layout">

            <!-- Greeting -->
            <div class="dash-top">
                <div class="dash-greeting">
                    <div class="dash-avatar">${((e==null?void 0:e.first_name)||"?")[0].toUpperCase()}</div>
                    <div>
                        <h2>Welcome back, ${b((e==null?void 0:e.first_name)||"Student")}</h2>
                        <p style="color:var(--text2);font-size:12px;">
                            ${n?"Pro Member":"Free Trial — Day "+f+" of 7"}
                        </p>
                    </div>
                </div>
                <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
                    <div style="text-align:right;margin-right:12px;">
                        <div style="font-size:20px;font-weight:700;color:${n?"var(--green)":"var(--gold)"};">
                            ${n?"Pro":r===1/0?"∞":r}
                        </div>
                        <div style="font-size:10px;color:var(--text3);">
                            ${n?"unlimited":"questions left today"}
                        </div>
                    </div>
                    <button class="btn btn-sm btn-secondary" id="profileBtn">Profile</button>
                    <button class="btn btn-sm btn-secondary" id="logoutBtn">Sign Out</button>
                </div>
            </div>

            <!-- Status banner -->
            ${!n&&u<=0?`
                <div class="dash-banner trial" style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);">
                    <div>
                        <strong>Trial Ended</strong>
                        <p style="font-size:11px;color:var(--text2);">Upgrade to continue studying.</p>
                    </div>
                    <button class="btn btn-primary btn-sm" id="upgradeBtn">Get Pro — $7.99</button>
                </div>
            `:n?`
                <div class="dash-banner pro">
                    <div>
                        <strong>Pro Access Active</strong>
                        <p style="font-size:11px;color:var(--text2);">Unlimited questions. All features unlocked.</p>
                    </div>
                </div>
            `:`
                <div class="dash-banner trial">
                    <div>
                        <strong>Free Trial Active</strong>
                        <p style="font-size:11px;color:var(--text2);">
                            ${u} day${u!==1?"s":""} remaining
                            · ${r} questions left today
                        </p>
                    </div>
                    <button class="btn btn-primary btn-sm" id="upgradeBtn">Upgrade — $7.99</button>
                </div>
            `}

            <!-- Stats -->
            <div class="dash-stats">
                <div class="dash-stat">
                    <div class="dash-stat-val">${i.length}</div>
                    <div class="dash-stat-label">Study Sessions</div>
                </div>
                <div class="dash-stat">
                    <div class="dash-stat-val">
                        ${Math.floor(c/60)}h ${c%60}m
                    </div>
                    <div class="dash-stat-label">Study Time</div>
                </div>
                <div class="dash-stat">
                    <div class="dash-stat-val">
                        ${i.length>0?Math.min(Math.ceil(i.length/2),30):0}
                    </div>
                    <div class="dash-stat-label">Day Streak</div>
                </div>
                <div class="dash-stat">
                    <div class="dash-stat-val">${n?"∞":r}</div>
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

                ${i.length===0?`
                    <div style="text-align:center;padding:32px;background:var(--surface);
                         border:var(--border);border-radius:8px;color:var(--text2);font-size:13px;">
                        <p>No study sessions yet.</p>
                        <p style="font-size:11px;color:var(--text3);margin-top:4px;">
                            Start your first session to see it here.
                        </p>
                    </div>
                `:`
                    <div style="background:var(--surface);border:var(--border);border-radius:8px;overflow:hidden;">
                        ${i.map(t=>{const s=new Date(t.last_active_at||t.created_at||Date.now()),o=(t.message_count||t.messageCount||0)>0,y=t.message_count||t.messageCount||0,h=t.session_id||t.sessionId;return`
                                <div class="session-history-item"
                                     data-session-id="${h}"
                                     style="display:flex;align-items:center;gap:12px;padding:12px 16px;
                                            border-bottom:1px solid rgba(255,255,255,0.04);
                                            cursor:pointer;transition:background 0.2s;
                                            ${o?"":"opacity:0.5;"}">
                                    <div style="width:36px;height:36px;border-radius:8px;flex-shrink:0;
                                         background:${o?"var(--gold-dim)":"var(--elevated)"};
                                         display:flex;align-items:center;justify-content:center;font-size:16px;">
                                        ${o?"📚":"📝"}
                                    </div>
                                    <div style="flex:1;min-width:0;">
                                        <div style="font-weight:600;font-size:13px;
                                             overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                                            ${b(t.title||"Study Session")}
                                        </div>
                                        <div style="font-size:11px;color:var(--text3);margin-top:2px;">
                                            ${s.toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}
                                            · ${y} message${y!==1?"s":""}
                                            · ${t.mode||"learn"}
                                            ${o?"":" · (empty)"}
                                        </div>
                                    </div>
                                    ${o?`
                                        <button class="continue-session-btn"
                                                data-session-id="${h}"
                                                style="background:var(--gold);border:none;padding:8px 14px;
                                                       border-radius:6px;color:#000;font-size:12px;
                                                       cursor:pointer;font-weight:600;flex-shrink:0;">
                                            Continue →
                                        </button>
                                    `:`
                                        <span style="font-size:10px;color:var(--text3);flex-shrink:0;">No messages</span>
                                    `}
                                </div>`}).join("")}
                    </div>
                `}
            </div>
        </div>
    `;function g(t){t&&(localStorage.setItem("cc_resume_session_id",t),localStorage.setItem("cc_last_session_id",t),a("study"))}document.getElementById("profileBtn").onclick=()=>a("profile"),document.getElementById("logoutBtn").onclick=async()=>{localStorage.removeItem("cc_last_session_id"),localStorage.removeItem("cc_resume_session_id"),localStorage.removeItem("cc_study_material"),localStorage.removeItem("cc_study_title"),localStorage.removeItem("cc_study_course"),sessionStorage.removeItem("cc_role"),sessionStorage.removeItem("cc_access"),await x.auth.signOut(),a("signin")},document.getElementById("goStudy").onclick=()=>{const t=i.find(s=>(s.message_count||s.messageCount||0)>0);if(t){const s=t.session_id||t.sessionId;localStorage.setItem("cc_resume_session_id",s),localStorage.setItem("cc_last_session_id",s)}else localStorage.removeItem("cc_resume_session_id"),localStorage.removeItem("cc_last_session_id");a("study")},document.getElementById("goLibrary").onclick=()=>a("library"),(p=document.getElementById("upgradeBtn"))!=null&&p.onclick&&(document.getElementById("upgradeBtn").onclick=()=>a("payment"));const m=document.getElementById("upgradeBtn");m&&(m.onclick=()=>a("payment")),document.querySelectorAll(".continue-session-btn").forEach(t=>{t.onclick=s=>{s.stopPropagation(),g(t.dataset.sessionId)}}),document.querySelectorAll(".session-history-item").forEach(t=>{t.onclick=()=>{const s=i.find(o=>(o.session_id||o.sessionId)===t.dataset.sessionId);s&&(s.message_count||s.messageCount||0)>0&&g(t.dataset.sessionId)}})}function b(d){if(!d)return"";const l=document.createElement("div");return l.textContent=d,l.innerHTML}export{I as renderDashboardPage};
