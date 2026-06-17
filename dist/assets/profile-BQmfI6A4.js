import{s as l}from"./index-BtxTVbtb.js";async function A(a,s,r){const c=document.getElementById("page-profile");if(!c)return;if(!a.user){r("signin");return}let t=a.profile;if(!t){const{data:e}=await l.from("profiles").select("*").eq("id",a.user.id).single();t=e,a.profile=e}const d=(t==null?void 0:t.status)==="paid",u=(t==null?void 0:t.status)==="trial",m=t!=null&&t.trial_end?Math.max(0,Math.ceil((new Date(t.trial_end)-new Date)/(1e3*60*60*24))):7,$=t!=null&&t.created_at?new Date(t.created_at).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"}):"Recently";c.innerHTML=`
        <div class="profile-layout">
            <a href="#" class="back-link" id="backLink">← Back to Dashboard</a>

            <!-- HEADER -->
            <div class="profile-header">
                <div class="profile-avatar-lg">${((t==null?void 0:t.first_name)||"?")[0].toUpperCase()}</div>
                <div>
                    <h2>${i((t==null?void 0:t.first_name)||"")} ${i((t==null?void 0:t.last_name)||"")}</h2>
                    <span class="badge ${d?"badge-success":u?"badge-warning":"badge-danger"}">
                        ${d?"Pro Member":u?`Trial · ${m} days left`:"Expired"}
                    </span>
                    <p style="color:var(--text3);font-size:11px;margin-top:4px;">Member since ${$}</p>
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
                        <input type="text" id="editFirstName" class="input" value="${i((t==null?void 0:t.first_name)||"")}" placeholder="First name">
                        <button class="btn btn-sm btn-primary" id="saveFirstName">Save</button>
                    </div>
                </div>

                <div class="form-group">
                    <label>Last Name</label>
                    <div class="profile-input-row">
                        <input type="text" id="editLastName" class="input" value="${i((t==null?void 0:t.last_name)||"")}" placeholder="Last name">
                        <button class="btn btn-sm btn-primary" id="saveLastName">Save</button>
                    </div>
                </div>

                <div class="form-group">
                    <label>Email</label>
                    <input type="text" class="input" value="${i(a.user.email||"")}" disabled style="opacity:0.5;background:var(--elevated);">
                    <span style="font-size:10px;color:var(--text3);">Email cannot be changed</span>
                </div>

                <div class="form-group">
                    <label>Phone Number</label>
                    <div class="profile-input-row">
                        <input type="tel" id="editPhone" class="input" value="${i((t==null?void 0:t.phone)||"")}" placeholder="+237 6XX XXX XXX">
                        <button class="btn btn-sm btn-primary" id="savePhone">Save</button>
                    </div>
                </div>

                <div class="form-group">
                    <label>Country</label>
                    <div class="profile-input-row">
                        <select id="editCountry" class="input">
                            <option value="">Select country...</option>
                            ${["Cameroon","Nigeria","Ghana","Kenya","South Africa","United States","United Kingdom","Other"].map(e=>`<option ${(t==null?void 0:t.country)===e?"selected":""}>${e}</option>`).join("")}
                        </select>
                        <button class="btn btn-sm btn-primary" id="saveCountry">Save</button>
                    </div>
                </div>

                <div class="form-group">
                    <label>University / Institution</label>
                    <div class="profile-input-row">
                        <input type="text" id="editUniversity" class="input" value="${i((t==null?void 0:t.university)||"")}" placeholder="e.g., University of Buea">
                        <button class="btn btn-sm btn-primary" id="saveUniversity">Save</button>
                    </div>
                </div>

                <div class="form-group">
                    <label>Field of Study / Department</label>
                    <div class="profile-input-row">
                        <input type="text" id="editDepartment" class="input" value="${i((t==null?void 0:t.department)||"")}" placeholder="e.g., Civil Engineering">
                        <button class="btn btn-sm btn-primary" id="saveDepartment">Save</button>
                    </div>
                </div>

                <div class="form-group">
                    <label>Academic Level / Year</label>
                    <div class="profile-input-row">
                        <select id="editLevel" class="input">
                            <option value="">Select level...</option>
                            ${["100","200","300","400","500","Master","PhD","Other"].map(e=>`<option ${(t==null?void 0:t.level)===e?"selected":""}>${e}</option>`).join("")}
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
                
                ${d?`
                    <div style="background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.2);border-radius:8px;padding:16px;text-align:center;margin-bottom:16px;">
                        <div style="font-size:20px;font-weight:700;color:var(--green);margin-bottom:4px;">Pro Access Active</div>
                        <div style="font-size:12px;color:var(--text2);">Unlimited questions · All features unlocked</div>
                        <div style="font-size:11px;color:var(--text3);margin-top:8px;">Thank you for supporting CheatCode</div>
                    </div>
                `:`
                    <div style="margin-bottom:16px;">
                        <div style="background:rgba(245,176,66,0.1);border:1px solid rgba(245,176,66,0.2);border-radius:8px;padding:16px;text-align:center;margin-bottom:16px;">
                            <div style="font-size:20px;font-weight:700;color:var(--gold);margin-bottom:4px;">Free Trial</div>
                            <div style="font-size:12px;color:var(--text2);">${m} days remaining</div>
                            <div style="font-size:11px;color:var(--text3);margin-top:8px;">${(t==null?void 0:t.queries_today)||0}/${(t==null?void 0:t.query_limit)||10} questions used today</div>
                        </div>
                        <button class="btn btn-primary" id="upgradeBtn" style="width:100%;">Upgrade to Pro — $7.99</button>
                        <p style="font-size:11px;color:var(--text3);text-align:center;margin-top:8px;">One-time payment · Unlimited questions · All features</p>
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
    `;const v=document.getElementById("backLink");v&&v.addEventListener("click",e=>{e.preventDefault(),r("dashboard")});async function o(e,k,n,I="Saved!"){if(!k&&e!=="phone")return;const S=n.textContent;n.disabled=!0,n.textContent="Saving...";try{await l.from("profiles").update({[e]:k}).eq("id",a.user.id),a.profile=null,n.textContent=I,n.style.background="#10b981",n.style.color="#fff",setTimeout(()=>{n.textContent=S,n.style.background="",n.style.color="",n.disabled=!1},1500)}catch{n.textContent="Error!",setTimeout(()=>{n.textContent=S,n.disabled=!1},1500)}}const p=document.getElementById("saveFirstName");p&&p.addEventListener("click",function(){o("first_name",document.getElementById("editFirstName").value.trim(),this,"Saved!")});const b=document.getElementById("saveLastName");b&&b.addEventListener("click",function(){o("last_name",document.getElementById("editLastName").value.trim(),this,"Saved!")});const g=document.getElementById("savePhone");g&&g.addEventListener("click",function(){o("phone",document.getElementById("editPhone").value.trim(),this,"Saved!")});const y=document.getElementById("saveCountry");y&&y.addEventListener("click",function(){o("country",document.getElementById("editCountry").value,this,"Saved!")});const x=document.getElementById("saveUniversity");x&&x.addEventListener("click",function(){o("university",document.getElementById("editUniversity").value.trim(),this,"Saved!")});const f=document.getElementById("saveDepartment");f&&f.addEventListener("click",function(){o("department",document.getElementById("editDepartment").value.trim(),this,"Saved!")});const h=document.getElementById("saveLevel");h&&h.addEventListener("click",function(){o("level",document.getElementById("editLevel").value,this,"Saved!")});const E=document.getElementById("upgradeBtn");E&&E.addEventListener("click",()=>{console.log("Upgrade button clicked, navigating to payment"),r("payment")});const L=document.getElementById("signoutBtn");L&&L.addEventListener("click",async()=>{confirm("Are you sure you want to sign out?")&&(await l.auth.signOut(),location.reload())});const B=document.getElementById("deleteAccountBtn");B&&B.addEventListener("click",()=>{confirm("⚠️ PERMANENTLY delete your account and all data? This cannot be undone.")&&prompt('Type "DELETE" to confirm:')==="DELETE"&&alert("For security, please contact support@cheatcode.app to delete your account.")})}function i(a){if(!a)return"";const s=document.createElement("div");return s.textContent=a,s.innerHTML}export{A as renderProfilePage};
