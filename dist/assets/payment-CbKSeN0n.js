import{s as d}from"./index-BtxTVbtb.js";const f=4500,b="$7.99",h="https://pay.fapshi.com/54673366";async function S(t,E,o){var p,l,c,u,m,v;const r=document.getElementById("page-payment");if(!r)return;if(!t.user){o("signin");return}if(((p=t.profile)==null?void 0:p.status)==="paid"){r.innerHTML=`
            <div style="text-align:center;padding:60px 20px;">
                <div style="font-size:48px;margin-bottom:16px;color:var(--green);">✓</div>
                <h2>Pro Access Active</h2>
                <p style="color:var(--text2);">Unlimited questions, all features unlocked.</p>
                <button class="btn btn-primary" id="goStudyBtn" style="margin-top:16px;">Continue Studying →</button>
            </div>
        `,(l=document.getElementById("goStudyBtn"))==null||l.addEventListener("click",()=>o("study"));return}r.innerHTML=`
        <div style="max-width:420px;margin:0 auto;padding:20px;">
            <a href="#" id="backLink" style="color:var(--text3);font-size:13px;text-decoration:none;display:inline-block;margin-bottom:20px;">← Back</a>

            <div style="background:var(--surface);border-radius:12px;padding:24px;border:1px solid rgba(255,255,255,0.06);">
                <div style="text-align:center;margin-bottom:24px;">
                    <div style="font-size:48px;font-weight:700;color:var(--gold);">Pro</div>
                    <p style="color:var(--text2);font-size:13px;margin-top:4px;">One-time payment · Full semester access</p>
                    <div style="font-size:32px;font-weight:700;color:var(--gold);margin:12px 0;">${b} USD</div>
                    <div style="font-size:14px;color:var(--text2);">${f.toLocaleString()} XAF</div>
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
    `,(c=document.getElementById("backLink"))==null||c.addEventListener("click",e=>{e.preventDefault(),o("dashboard")}),(u=document.getElementById("payBtn"))==null||u.addEventListener("click",()=>{const e=h+`?user_id=${t.user.id}&email=${encodeURIComponent(t.user.email)}`;window.open(e,"_blank");const i=document.getElementById("paymentStatus");i.innerHTML=`
            <div style="padding:14px;background:rgba(212,160,0,0.08);border-radius:8px;text-align:center;">
                <p style="color:var(--gold);font-weight:600;margin-bottom:6px;">💳 Payment window opened</p>
                <p style="color:var(--text2);font-size:12px;">Complete payment on Fapshi, then enter your activation code below.</p>
                <p style="color:var(--text3);font-size:11px;margin-top:6px;">After payment, you'll receive a code via email/SMS.</p>
            </div>
        `}),(m=document.getElementById("activateBtn"))==null||m.addEventListener("click",async()=>{var y;const e=((y=document.getElementById("activationCode"))==null?void 0:y.value.trim().toUpperCase())||"",i=document.getElementById("activationStatus"),a=document.getElementById("activateBtn");if(!e){i.innerHTML='<p style="color:var(--red);font-size:12px;">Please enter an activation code.</p>';return}a.disabled=!0,a.textContent="Checking...",i.innerHTML='<p style="color:var(--text2);font-size:12px;">Verifying code...</p>';try{const{data:n,error:x}=await d.from("activation_codes").select("*").eq("code",e).eq("status","unused").single();if(x||!n)throw new Error("Invalid or already used code.");if(n.expires_at&&new Date>new Date(n.expires_at))throw new Error("This code has expired.");const{error:g}=await d.from("profiles").update({status:"paid",query_limit:999999,queries_today:0,paid_at:new Date().toISOString()}).eq("id",t.user.id);if(g)throw new Error("Failed to activate. Please contact support.");await d.from("activation_codes").update({status:"used",used_by:t.user.id,used_at:new Date().toISOString()}).eq("id",n.id),t.profile&&(t.profile.status="paid",t.profile.query_limit=999999,t.profile.queries_today=0),i.innerHTML=`
                <p style="color:var(--green);font-weight:600;font-size:13px;"> Pro Activated!</p>
                <p style="color:var(--text2);font-size:12px;">Redirecting to dashboard...</p>
            `,setTimeout(()=>o("dashboard"),1500)}catch(n){i.innerHTML=`<p style="color:var(--red);font-size:12px;">${n.message}</p>`,a.disabled=!1,a.textContent="Activate"}});const s=sessionStorage.getItem("cc_pending_activation");if(s)try{const{code:e}=JSON.parse(s);document.getElementById("activationCode").value=e,(v=document.getElementById("activateBtn"))==null||v.click(),sessionStorage.removeItem("cc_pending_activation")}catch{}}export{S as renderPaymentPage};
