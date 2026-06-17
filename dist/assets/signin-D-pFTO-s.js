import{s as o}from"./index-BtxTVbtb.js";function u(r,d,i){const s=document.getElementById("page-signin");s&&(s.innerHTML=`
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
    `,document.getElementById("backLink").addEventListener("click",e=>{e.preventDefault(),i("landing")}),document.getElementById("goToSignup").addEventListener("click",e=>{e.preventDefault(),i("signup")}),document.getElementById("signinForm").addEventListener("submit",async e=>{e.preventDefault();const t=e.target.querySelector("button"),a=document.getElementById("error");t.disabled=!0,t.textContent="Signing in...",a.style.display="none";try{const{error:n}=await o.auth.signInWithPassword({email:document.getElementById("email").value.trim(),password:document.getElementById("password").value});if(n)throw n}catch(n){a.style.display="block",a.textContent=n.message||"Invalid email or password.",t.disabled=!1,t.textContent="Sign In"}}))}export{u as renderSigninPage};
