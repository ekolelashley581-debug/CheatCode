import{s as l}from"./index-BtxTVbtb.js";function c(s,d,n){const r=document.getElementById("page-signup");r&&(r.innerHTML=`
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
    `,document.getElementById("backLink").addEventListener("click",e=>{e.preventDefault(),n("landing")}),document.getElementById("goToSignin").addEventListener("click",e=>{e.preventDefault(),n("signin")}),document.getElementById("signupForm").addEventListener("submit",async e=>{e.preventDefault();const t=e.target.querySelector("button"),i=document.getElementById("error");t.disabled=!0,t.textContent="Creating...",i.style.display="none";try{const{data:a,error:o}=await l.auth.signUp({email:document.getElementById("email").value.trim(),password:document.getElementById("password").value});if(!a.session){alert("Check your email to confirm your account.");return}if(o)throw o;await l.from("profiles").insert({id:a.user.id,first_name:document.getElementById("firstName").value.trim(),last_name:document.getElementById("lastName").value.trim(),phone:document.getElementById("phone").value.trim(),country:document.getElementById("country").value,status:"trial",trial_start:new Date().toISOString(),trial_end:new Date(Date.now()+7*24*60*60*1e3).toISOString(),queries_today:0,query_limit:10})}catch(a){i.style.display="block",i.textContent=a.message||"Signup failed.",t.disabled=!1,t.textContent="Create Free Account"}}))}export{c as renderSignupPage};
