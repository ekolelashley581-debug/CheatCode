import{r as c}from"./index-BtxTVbtb.js";const m="ekolelashley581@gmail.com",p="Berly2004-2023";async function u(r,g,t){var d,o;const a=document.getElementById("page-admin-login");if(a){if(sessionStorage.getItem("cc_role")==="admin"){t("admin");return}a.innerHTML=`
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
    `,(d=document.getElementById("adminLoginBtn"))==null||d.addEventListener("click",async()=>{var s,l;const n=((s=document.getElementById("adminEmail"))==null?void 0:s.value.trim())||"",i=((l=document.getElementById("adminPassword"))==null?void 0:l.value)||"",e=document.getElementById("loginError");if(!n||!i){e.style.display="block",e.textContent="Please enter both email and password.";return}n===m&&i===p?(sessionStorage.setItem("cc_role","admin"),sessionStorage.setItem("cc_access",new Date().toISOString()),await c(),t("admin")):(e.style.display="block",e.textContent="Invalid credentials. Access denied.")}),(o=document.getElementById("backToAppBtn"))==null||o.addEventListener("click",()=>{r.user?t("dashboard"):t("landing")}),a.querySelectorAll("input").forEach(n=>{n.addEventListener("keydown",i=>{var e;i.key==="Enter"&&((e=document.getElementById("adminLoginBtn"))==null||e.click())})})}}export{u as renderAdminLoginPage};
