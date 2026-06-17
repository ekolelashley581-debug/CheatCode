import{s as u}from"./index-BtxTVbtb.js";let S=null;const lt=30*60*1e3;function B(e){S&&clearTimeout(S),S=setTimeout(()=>{sessionStorage.removeItem("cc_role"),sessionStorage.removeItem("cc_access"),alert("Admin session expired due to inactivity."),e("signin")},lt)}async function h(e,a,n){const d=document.getElementById("page-admin");if(!d)return;if(sessionStorage.getItem("cc_role")!=="admin"){n("admin-login");return}B(n),document.addEventListener("click",()=>B(n)),document.addEventListener("keydown",()=>B(n)),d.innerHTML=St();let t={};try{t=await pt()}catch(s){console.error("[Admin] Data load error:",s.message),t=ut()}gt(d,t,e,n)}async function ct(){try{const{data:e,error:a}=await u.from("knowledge_cache").select("id, question_text, times_served, quality_score, faculty, institution").order("times_served",{ascending:!1}).limit(10);if(a)throw a;const n=(e==null?void 0:e.length)||0,d=(e==null?void 0:e.reduce((s,o)=>s+(o.times_served||0),0))||0,t=(d*.002).toFixed(2);return{totalEntries:n,totalServed:d,estimatedSavings:`$${t}`,topServed:(e==null?void 0:e.slice(0,5))||[]}}catch(e){return console.warn("Cache stats not available:",e.message),{totalEntries:0,totalServed:0,estimatedSavings:"$0.00",topServed:[]}}}async function pt(){var F,q,M,P,O,j;const[e,a,n,d,t,s,o]=await Promise.allSettled([u.from("profiles").select("*").order("created_at",{ascending:!1}),u.from("payments").select("*").order("created_at",{ascending:!1}).limit(100),u.from("sessions").select("id, user_id, mode, duration_seconds, created_at").order("created_at",{ascending:!1}).limit(200),u.from("ai_usage").select("*").order("created_at",{ascending:!1}).limit(500),u.from("activation_codes").select("*").order("created_at",{ascending:!1}),ct(),u.from("user_events").select("event_type, created_at").gte("created_at",new Date(Date.now()-6048e5).toISOString())]),i=((F=e.value)==null?void 0:F.data)||[],l=((q=a.value)==null?void 0:q.data)||[],c=((M=n.value)==null?void 0:M.data)||[],v=((P=d.value)==null?void 0:P.data)||[],E=((O=t.value)==null?void 0:O.data)||[],A=((j=o.value)==null?void 0:j.data)||[],$=i.length,I=i.filter(r=>r.status==="paid").length,H=i.filter(r=>r.status==="trial").length,X=i.filter(r=>r.status==="expired").length,L=new Date(Date.now()-864e5).toISOString(),Q=i.filter(r=>r.last_query_at&&r.last_query_at>L).length,G=new Date(Date.now()-7*864e5).toISOString(),W=i.filter(r=>r.created_at>G).length,K=new Date(Date.now()+3*864e5).toISOString(),V=i.filter(r=>r.status==="trial"&&r.trial_end&&r.trial_end<K&&r.trial_end>new Date().toISOString()).length,_=l.filter(r=>r.status==="successful"),J=_.reduce((r,p)=>r+(p.amount_xaf||0),0),C=_.reduce((r,p)=>r+(p.amount_usd||0),0),Y=new Date(Date.now()-30*864e5).toISOString(),Z=_.filter(r=>r.created_at>Y).reduce((r,p)=>r+(p.amount_xaf||0),0),tt=$>0?(I/$*100).toFixed(1):"0.0",U=v.reduce((r,p)=>r+(p.cost||0),0),et=v.reduce((r,p)=>r+(p.prompt_tokens||0)+(p.completion_tokens||0),0),at=v.filter(r=>r.created_at>L).reduce((r,p)=>r+(p.cost||0),0),k={};v.forEach(r=>{const p=r.model||"unknown";k[p]=(k[p]||0)+1});const D={};v.forEach(r=>{const p=r.feature||"chat";D[p]=(D[p]||0)+1});const nt=c.length,st=c.length>0?Math.round(c.reduce((r,p)=>r+(p.duration_seconds||0),0)/c.length/60):0,z=[];for(let r=6;r>=0;r--){const p=new Date;p.setDate(p.getDate()-r);const T=p.toISOString().split("T")[0],it=A.filter(b=>{var f;return(f=b.created_at)==null?void 0:f.startsWith(T)}),rt=c.filter(b=>{var f;return(f=b.created_at)==null?void 0:f.startsWith(T)}),dt=l.filter(b=>{var f;return((f=b.created_at)==null?void 0:f.startsWith(T))&&b.status==="successful"});z.push({date:p.toLocaleDateString("en-GB",{weekday:"short",day:"numeric"}),events:it.length,sessions:rt.length,revenue:dt.reduce((b,f)=>b+(f.amount_xaf||0),0)})}const R=C-U,ot=C>0?(R/C*100).toFixed(0):"0";return{profiles:i,payments:l,sessions:c,aiUsage:v,codes:E,cacheStats:s,events:A,stats:{totalUsers:$,paidUsers:I,trialUsers:H,expiredUsers:X,active24h:Q,newThisWeek:W,expiringSoon:V,totalRevenueXAF:J,totalRevenueUSD:C,monthRevenueXAF:Z,conversionRate:tt,successfulPayments:_.length,totalCost:U,totalTokens:et,todayCost:at,modelCounts:k,featureCounts:D,totalSessions:nt,avgDuration:st,profitUSD:R,marginPct:ot,dailyActivity:z}}}function ut(){return{profiles:[],payments:[],sessions:[],aiUsage:[],codes:[],cacheStats:{totalEntries:0,totalServed:0,estimatedSavings:"$0.00"},events:[],stats:{totalUsers:0,paidUsers:0,trialUsers:0,expiredUsers:0,active24h:0,newThisWeek:0,expiringSoon:0,totalRevenueXAF:0,totalRevenueUSD:0,monthRevenueXAF:0,conversionRate:"0.0",successfulPayments:0,totalCost:0,totalTokens:0,todayCost:0,modelCounts:{},featureCounts:{},totalSessions:0,avgDuration:0,profitUSD:0,marginPct:"0",dailyActivity:[]}}}function gt(e,a,n,d){const{stats:t,cacheStats:s}=a;e.innerHTML=`
        <div style="max-width:1100px;margin:0 auto;padding:24px 20px 60px;">

            <!-- HEADER -->
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:12px;">
                <div>
                    <h2 style="font-size:22px;font-weight:700;margin-bottom:2px;">Command Center</h2>
                    <p style="font-size:12px;color:var(--text3);">
                        Admin session active · Auto-logout after 30min inactivity
                    </p>
                </div>
                <div style="display:flex;gap:8px;">
                    <button class="btn btn-sm btn-secondary" id="refreshBtn">Refresh</button>
                    <button class="btn btn-sm btn-secondary" id="backToAppBtn">Back to App</button>
                    <button class="btn btn-sm" style="background:var(--red);color:#fff;" id="logoutAdminBtn">Sign Out</button>
                </div>
            </div>

            <!-- HEALTH BAR -->
            <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-bottom:20px;">
                ${w("Supabase",!0)}
                ${w("OpenRouter",!0)}
                ${w("Fapshi",!0)}
                ${w("Edge Functions",!0)}
                ${w(`${t.expiringSoon} trials expiring soon`,t.expiringSoon>0,t.expiringSoon>0?"warning":"ok")}
            </div>

            <!-- TOP STATS -->
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px;">
                ${m(t.totalUsers,"Total Users",`${t.newThisWeek} this week`)}
                ${m(t.paidUsers,"Pro Users",`${t.conversionRate}% conversion`)}
                ${m(t.totalRevenueXAF.toLocaleString()+" XAF","Total Revenue",`$${t.totalRevenueUSD.toFixed(2)} USD`)}
                ${m(t.active24h,"Active (24h)",`${t.totalSessions} total sessions`)}
            </div>

            <!-- TABS -->
            <div style="display:flex;gap:2px;border-bottom:var(--border);margin-bottom:20px;overflow-x:auto;">
                ${["Overview","Users","Revenue","AI Usage","Codes","Settings"].map((o,i)=>`<button class="admin-tab-btn ${i===0?"active":""}" data-tab="${o.toLowerCase().replace(" ","-")}"
                        style="padding:10px 18px;border:none;border-bottom:2px solid ${i===0?"var(--gold)":"transparent"};
                        background:transparent;color:${i===0?"var(--gold)":"var(--text2)"};font-family:var(--font);
                        font-size:13px;cursor:pointer;white-space:nowrap;font-weight:${i===0?"600":"400"};">${o}</button>`).join("")}
            </div>

            <!-- TAB CONTENT -->
            <div id="tabContent">
                ${N(a)}
            </div>

        </div>
    `,document.querySelectorAll(".admin-tab-btn").forEach(o=>{o.addEventListener("click",async()=>{document.querySelectorAll(".admin-tab-btn").forEach(c=>{c.style.borderBottomColor="transparent",c.style.color="var(--text2)",c.style.fontWeight="400"}),o.style.borderBottomColor="var(--gold)",o.style.color="var(--gold)",o.style.fontWeight="600";const i=o.dataset.tab,l=document.getElementById("tabContent");switch(l.innerHTML='<div style="padding:40px;text-align:center;color:var(--text3);">Loading...</div>',i){case"overview":l.innerHTML=N(a);break;case"users":l.innerHTML=xt(a.profiles),vt(a.profiles,d);return;case"revenue":l.innerHTML=yt(a);break;case"ai-usage":l.innerHTML=ft(a);break;case"codes":l.innerHTML=bt(a.codes),ht(a.codes,d);return;case"settings":l.innerHTML=$t(),wt();return}})}),document.getElementById("refreshBtn").addEventListener("click",()=>h(n,_supabase,d)),document.getElementById("backToAppBtn").addEventListener("click",()=>d("dashboard")),document.getElementById("logoutAdminBtn").addEventListener("click",()=>{sessionStorage.removeItem("cc_role"),sessionStorage.removeItem("cc_access"),S&&clearTimeout(S),d("landing")})}function N(e){const{stats:a,cacheStats:n}=e,d=Math.max(...a.dailyActivity.map(t=>t.sessions),1);return`
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;">

            <!-- Weekly Activity Chart -->
            <div class="card">
                <h3 style="font-size:14px;font-weight:700;margin-bottom:16px;">Study Sessions — Last 7 Days</h3>
                <div style="display:flex;align-items:flex-end;gap:6px;height:80px;">
                    ${a.dailyActivity.map(t=>`
                        <div style="flex:1;display:flex;flex-direction:column;align-items:center;height:100%;justify-content:flex-end;gap:4px;">
                            <div style="width:100%;border-radius:3px 3px 0 0;
                                background:${t.sessions>0?"var(--gold)":"var(--elevated)"};
                                height:${Math.max(4,Math.round(t.sessions/d*64))}px;
                                min-height:4px;" title="${t.sessions} sessions"></div>
                            <span style="font-size:9px;color:var(--text3);white-space:nowrap;">${t.date}</span>
                        </div>
                    `).join("")}
                </div>
            </div>

            <!-- Knowledge Cache -->
            <div class="card">
                <h3 style="font-size:14px;font-weight:700;margin-bottom:16px;">Knowledge Cache Performance</h3>
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;">
                    ${g(n.totalEntries||0,"Cached Answers")}
                    ${g(n.totalServed||0,"Cache Hits")}
                    ${g(n.estimatedSavings||"$0.00","API Savings")}
                </div>
                ${(n.topServed||[]).slice(0,3).map(t=>{var s;return`
                    <div style="margin-top:10px;padding:8px 10px;background:var(--elevated);border-radius:6px;font-size:11px;">
                        <div style="color:var(--text2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                            ${x(((s=t.question_text)==null?void 0:s.substring(0,80))||"")}
                        </div>
                        <div style="color:var(--text3);margin-top:2px;">
                            Served ${t.times_served} times · Quality ${Math.round((t.quality_score||0)*100)}%
                        </div>
                    </div>
                `}).join("")}
            </div>

        </div>

        <!-- AI Cost vs Revenue -->
        <div class="card" style="margin-bottom:16px;">
            <h3 style="font-size:14px;font-weight:700;margin-bottom:16px;">Financial Summary</h3>
            <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:12px;">
                ${g(a.totalRevenueXAF.toLocaleString()+" XAF","Total Revenue")}
                ${g("$"+a.totalRevenueUSD.toFixed(2),"Revenue (USD)")}
                ${g("$"+a.totalCost.toFixed(4),"AI Costs")}
                ${g("$"+a.profitUSD.toFixed(2),"Net Profit")}
                ${g(a.marginPct+"%","Margin")}
            </div>
        </div>

        <!-- User Breakdown -->
        <div class="card">
            <h3 style="font-size:14px;font-weight:700;margin-bottom:16px;">User Status Breakdown</h3>
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;">
                ${g(a.trialUsers,"On Trial","var(--gold)")}
                ${g(a.paidUsers,"Pro Users","var(--green)")}
                ${g(a.expiredUsers,"Expired","var(--red)")}
                ${g(a.expiringSoon,"Expiring Soon",a.expiringSoon>0?"var(--gold)":"var(--text3)")}
            </div>
        </div>
    `}function xt(e){return`
        <div class="card">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:8px;">
                <h3 style="font-size:14px;font-weight:700;">User Management (${e.length})</h3>
                <div style="display:flex;gap:8px;flex-wrap:wrap;">
                    <input type="text" id="userSearch" class="input" placeholder="Search name or email..." style="max-width:220px;">
                    <select id="userFilter" class="input" style="max-width:130px;">
                        <option value="all">All</option>
                        <option value="trial">Trial</option>
                        <option value="paid">Paid</option>
                        <option value="expired">Expired</option>
                    </select>
                    <button class="btn btn-sm btn-secondary" id="exportCsvBtn">Export CSV</button>
                </div>
            </div>
            <div style="overflow-x:auto;">
                <table style="width:100%;border-collapse:collapse;font-size:11px;">
                    <thead>
                        <tr style="border-bottom:var(--border);color:var(--text3);text-align:left;">
                            <th style="padding:8px 6px;">Name</th>
                            <th style="padding:8px 6px;">Email</th>
                            <th style="padding:8px 6px;">Field</th>
                            <th style="padding:8px 6px;">Status</th>
                            <th style="padding:8px 6px;">Joined</th>
                            <th style="padding:8px 6px;">Queries</th>
                            <th style="padding:8px 6px;">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="userTableBody">
                        ${e.length===0?'<tr><td colspan="7" style="padding:24px;text-align:center;color:var(--text3);">No users yet.</td></tr>':e.map(a=>mt(a)).join("")}
                    </tbody>
                </table>
            </div>
        </div>
    `}function mt(e){const a=e.status==="paid"?"var(--green)":e.status==="trial"?"var(--gold)":"var(--red)",n=e.department||e.faculty||"—";return`
        <tr style="border-bottom:1px solid rgba(255,255,255,0.04);" data-status="${e.status||""}" data-email="${x(e.email||"")}">
            <td style="padding:8px 6px;font-weight:600;">${x((e.first_name||"")+" "+(e.last_name||"")).trim()||"—"}</td>
            <td style="padding:8px 6px;color:var(--text2);">${x(e.email||"—")}</td>
            <td style="padding:8px 6px;color:var(--text3);font-size:10px;">${x(n.substring(0,25))}</td>
            <td style="padding:8px 6px;">
                <span style="background:${a}22;color:${a};padding:2px 8px;border-radius:10px;font-size:10px;font-weight:600;">
                    ${e.status||"trial"}
                </span>
            </td>
            <td style="padding:8px 6px;color:var(--text3);">
                ${e.created_at?new Date(e.created_at).toLocaleDateString("en-GB"):"—"}
            </td>
            <td style="padding:8px 6px;font-family:var(--mono);">
                ${e.queries_today||0}/${e.query_limit||10}
                <span style="color:var(--text3);"> (${e.queries_total||0} total)</span>
            </td>
            <td style="padding:8px 6px;">
                <div style="display:flex;gap:4px;flex-wrap:wrap;">
                    ${e.status!=="paid"?`<button class="btn btn-sm btn-primary upgrade-user-btn" data-id="${e.id}" style="font-size:10px;">Upgrade</button>`:`<button class="btn btn-sm btn-secondary downgrade-user-btn" data-id="${e.id}" style="font-size:10px;">Downgrade</button>`}
                    <button class="btn btn-sm btn-secondary reset-queries-btn" data-id="${e.id}" style="font-size:10px;">Reset</button>
                    <button class="btn btn-sm btn-secondary extend-trial-btn" data-id="${e.id}" style="font-size:10px;${e.status!=="trial"?"opacity:0.4;cursor:not-allowed;":""}">+7d</button>
                    <button class="btn btn-sm" data-id="${e.id}" style="font-size:10px;background:transparent;border:1px solid rgba(255,71,87,0.3);color:var(--red);" class="delete-user-btn delete-user-btn-${e.id}">Del</button>
                </div>
            </td>
        </tr>
    `}function vt(e,a){var n,d,t;(n=document.getElementById("userSearch"))==null||n.addEventListener("input",s=>{const o=s.target.value.toLowerCase();document.querySelectorAll("#userTableBody tr").forEach(i=>{i.style.display=i.textContent.toLowerCase().includes(o)?"":"none"})}),(d=document.getElementById("userFilter"))==null||d.addEventListener("change",s=>{const o=s.target.value;document.querySelectorAll("#userTableBody tr").forEach(i=>{i.style.display=o==="all"||i.dataset.status===o?"":"none"})}),document.querySelectorAll(".upgrade-user-btn").forEach(s=>{s.addEventListener("click",async()=>{var o;confirm("Upgrade this user to Pro?")&&(await u.from("profiles").update({status:"paid",query_limit:999999,paid_at:new Date().toISOString()}).eq("id",s.dataset.id),y("User upgraded to Pro.","success"),(o=s.closest("tr").querySelector("[data-status]"))==null||o.setAttribute("data-status","paid"),h({},null,a))})}),document.querySelectorAll(".downgrade-user-btn").forEach(s=>{s.addEventListener("click",async()=>{confirm("Downgrade to trial?")&&(await u.from("profiles").update({status:"trial",query_limit:10,paid_at:null}).eq("id",s.dataset.id),y("User downgraded.","warning"),h({},null,a))})}),document.querySelectorAll(".reset-queries-btn").forEach(s=>{s.addEventListener("click",async()=>{await u.from("profiles").update({queries_today:0}).eq("id",s.dataset.id),y("Daily queries reset.","success"),h({},null,a)})}),document.querySelectorAll(".extend-trial-btn").forEach(s=>{s.addEventListener("click",async()=>{const{data:o}=await u.from("profiles").select("trial_end, status").eq("id",s.dataset.id).single();if((o==null?void 0:o.status)!=="trial")return;const i=new Date(o.trial_end||new Date);i.setDate(i.getDate()+7),await u.from("profiles").update({trial_end:i.toISOString()}).eq("id",s.dataset.id),y("Trial extended by 7 days.","success"),h({},null,a)})}),document.querySelectorAll('#userTableBody button[style*="var(--red)"]').forEach(s=>{s.addEventListener("click",async()=>{confirm("Permanently delete this user? This cannot be undone.")&&prompt("Type DELETE to confirm:")==="DELETE"&&(await u.from("profiles").delete().eq("id",s.dataset.id),y("User deleted.","error"),h({},null,a))})}),(t=document.getElementById("exportCsvBtn"))==null||t.addEventListener("click",()=>{let s=`Name,Email,Faculty,Department,Level,Institution,Status,Joined,Queries Total
`;e.forEach(c=>{s+=[`"${(c.first_name||"")+" "+(c.last_name||"")}"`,`"${c.email||""}"`,`"${c.faculty||""}"`,`"${c.department||""}"`,`"${c.level||""}"`,`"${c.institution||""}"`,`"${c.status||""}"`,`"${c.created_at?new Date(c.created_at).toLocaleDateString("en-GB"):""}"`,c.queries_total||0].join(",")+`
`});const o=new Blob([s],{type:"text/csv"}),i=URL.createObjectURL(o),l=document.createElement("a");l.href=i,l.download=`cheatcode-users-${new Date().toISOString().split("T")[0]}.csv`,l.click(),URL.revokeObjectURL(i),y("CSV exported.","success")})}function yt(e){const{payments:a,stats:n}=e,d=a.filter(t=>t.status==="successful");return`
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px;">
            ${m(n.totalRevenueXAF.toLocaleString()+" XAF","Total Revenue",`$${n.totalRevenueUSD.toFixed(2)} USD`)}
            ${m(n.monthRevenueXAF.toLocaleString()+" XAF","This Month","Last 30 days")}
            ${m(n.conversionRate+"%","Conversion Rate",`${n.paidUsers} of ${n.totalUsers} users`)}
            ${m("$"+n.profitUSD.toFixed(2),"Net Profit",`${n.marginPct}% margin`)}
        </div>

        <div class="card">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                <h3 style="font-size:14px;font-weight:700;">Payment History (${d.length})</h3>
            </div>
            ${d.length===0?`
                <p style="color:var(--text3);font-size:13px;text-align:center;padding:24px;">No payments yet.</p>
            `:`
                <div style="overflow-x:auto;">
                    <table style="width:100%;border-collapse:collapse;font-size:11px;">
                        <thead>
                            <tr style="border-bottom:var(--border);color:var(--text3);">
                                <th style="padding:8px 6px;text-align:left;">Date</th>
                                <th style="padding:8px 6px;text-align:left;">Amount</th>
                                <th style="padding:8px 6px;text-align:left;">Method</th>
                                <th style="padding:8px 6px;text-align:left;">Transaction</th>
                                <th style="padding:8px 6px;text-align:left;">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${d.slice(0,50).map(t=>`
                                <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
                                    <td style="padding:8px 6px;color:var(--text2);">
                                        ${t.created_at?new Date(t.created_at).toLocaleDateString("en-GB"):"—"}
                                    </td>
                                    <td style="padding:8px 6px;font-weight:700;color:var(--green);">
                                        ${(t.amount_xaf||0).toLocaleString()} XAF
                                        <span style="color:var(--text3);font-weight:400;"> / $${(t.amount_usd||0).toFixed(2)}</span>
                                    </td>
                                    <td style="padding:8px 6px;color:var(--text2);">${x(t.method||"fapshi")}</td>
                                    <td style="padding:8px 6px;font-family:var(--mono);font-size:10px;color:var(--text3);">
                                        ${x((t.transaction_id||"").substring(0,20))}
                                    </td>
                                    <td style="padding:8px 6px;">
                                        <span style="background:rgba(0,200,151,0.15);color:var(--green);padding:2px 8px;border-radius:10px;font-size:10px;">
                                            ${t.status||"successful"}
                                        </span>
                                    </td>
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>
                </div>
            `}
        </div>
    `}function ft(e){const{stats:a,cacheStats:n}=e,d=Object.entries(a.modelCounts).sort((o,i)=>i[1]-o[1]),t=Object.entries(a.featureCounts).sort((o,i)=>i[1]-o[1]),s=d.reduce((o,[,i])=>o+i,0);return`
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px;">
            ${m(s.toLocaleString(),"Total AI Calls","All time")}
            ${m("$"+a.totalCost.toFixed(4),"Total AI Cost","All time")}
            ${m("$"+a.todayCost.toFixed(4),"Cost Today","Last 24h")}
            ${m(n.estimatedSavings||"$0.00","Cache Savings",`${n.totalServed||0} cache hits`)}
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">

            <!-- Model Breakdown -->
            <div class="card">
                <h3 style="font-size:14px;font-weight:700;margin-bottom:16px;">Model Usage</h3>
                ${d.length===0?'<p style="color:var(--text3);font-size:12px;">No AI usage data yet.</p>':d.map(([o,i])=>{const l=s>0?Math.round(i/s*100):0,c=o.split("/").pop()||o;return`
                            <div style="margin-bottom:12px;">
                                <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px;">
                                    <span style="color:var(--text2);font-family:var(--mono);font-size:11px;">${x(c)}</span>
                                    <span style="color:var(--text3);">${i} calls (${l}%)</span>
                                </div>
                                <div style="height:6px;background:var(--elevated);border-radius:3px;overflow:hidden;">
                                    <div style="height:100%;width:${l}%;background:var(--gold);border-radius:3px;"></div>
                                </div>
                            </div>
                        `}).join("")}
            </div>

            <!-- Feature Breakdown -->
            <div class="card">
                <h3 style="font-size:14px;font-weight:700;margin-bottom:16px;">Usage By Feature</h3>
                ${t.length===0?'<p style="color:var(--text3);font-size:12px;">No usage data yet.</p>':t.map(([o,i])=>{const l=s>0?Math.round(i/s*100):0;return`
                            <div style="margin-bottom:12px;">
                                <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px;">
                                    <span style="color:var(--text2);">${x(o)}</span>
                                    <span style="color:var(--text3);">${i} (${l}%)</span>
                                </div>
                                <div style="height:6px;background:var(--elevated);border-radius:3px;overflow:hidden;">
                                    <div style="height:100%;width:${l}%;background:var(--green);border-radius:3px;"></div>
                                </div>
                            </div>
                        `}).join("")}
            </div>

        </div>

        <!-- Cache Details -->
        <div class="card">
            <h3 style="font-size:14px;font-weight:700;margin-bottom:16px;">Knowledge Cache</h3>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px;">
                ${g(n.totalEntries||0,"Cached Q&A Pairs")}
                ${g(n.totalServed||0,"Times Served From Cache")}
                ${g(n.estimatedSavings||"$0.00","Estimated API Savings")}
            </div>
            ${(n.topServed||[]).length>0?`
                <h4 style="font-size:12px;color:var(--text3);margin-bottom:8px;">Most Served Questions</h4>
                ${n.topServed.slice(0,5).map(o=>`
                    <div style="padding:8px 10px;background:var(--elevated);border-radius:6px;margin-bottom:6px;font-size:11px;">
                        <div style="color:var(--text2);">${x((o.question_text||"").substring(0,100))}</div>
                        <div style="color:var(--text3);margin-top:3px;">
                            Served ${o.times_served||0}x ·
                            Quality ${Math.round((o.quality_score||0)*100)}% ·
                            ${x(o.faculty||"All fields")} ·
                            ${x(o.institution||"All institutions")}
                        </div>
                    </div>
                `).join("")}
            `:""}
        </div>
    `}function bt(e){const a=e.filter(t=>t.status==="unused"),n=e.filter(t=>t.status==="used"),d=e.filter(t=>t.status==="expired"||t.status==="revoked");return`
        <div class="card" style="margin-bottom:16px;">
            <h3 style="font-size:14px;font-weight:700;margin-bottom:16px;">Generate Activation Codes</h3>
            <div style="display:flex;gap:8px;align-items:flex-end;flex-wrap:wrap;">
                <div class="form-group" style="margin-bottom:0;">
                    <label>Quantity</label>
                    <input type="number" id="codeCount" class="input" value="5" min="1" max="100" style="width:80px;">
                </div>
                <div class="form-group" style="margin-bottom:0;">
                    <label>Duration (days)</label>
                    <input type="number" id="codeDuration" class="input" value="120" min="1" max="365" style="width:90px;">
                </div>
                <div class="form-group" style="margin-bottom:0;">
                    <label>Expires After</label>
                    <input type="date" id="codeExpiry" class="input" style="max-width:160px;">
                </div>
                <button class="btn btn-primary btn-sm" id="generateCodesBtn">Generate Codes</button>
            </div>
            <div id="generatedCodesOutput" style="margin-top:16px;"></div>
        </div>

        <div class="card">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                <h3 style="font-size:14px;font-weight:700;">
                    All Codes
                    <span style="font-size:11px;color:var(--text3);font-weight:400;margin-left:8px;">
                        ${a.length} unused · ${n.length} used · ${d.length} expired
                    </span>
                </h3>
                <select id="codeFilter" class="input" style="max-width:120px;">
                    <option value="all">All</option>
                    <option value="unused">Unused</option>
                    <option value="used">Used</option>
                    <option value="expired">Expired</option>
                </select>
            </div>
            ${e.length===0?`
                <p style="color:var(--text3);font-size:13px;text-align:center;padding:24px;">No activation codes yet. Generate some above.</p>
            `:`
                <div style="overflow-x:auto;">
                    <table style="width:100%;border-collapse:collapse;font-size:11px;">
                        <thead>
                            <tr style="border-bottom:var(--border);color:var(--text3);">
                                <th style="padding:8px 6px;text-align:left;">Code</th>
                                <th style="padding:8px 6px;text-align:left;">Duration</th>
                                <th style="padding:8px 6px;text-align:left;">Status</th>
                                <th style="padding:8px 6px;text-align:left;">Used By</th>
                                <th style="padding:8px 6px;text-align:left;">Expires</th>
                                <th style="padding:8px 6px;text-align:left;">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="codesTableBody">
                            ${e.map(t=>{const s=t.status==="used"?"var(--green)":t.status==="unused"?"var(--gold)":"var(--red)";return`
                                    <tr style="border-bottom:1px solid rgba(255,255,255,0.04);" data-status="${t.status}">
                                        <td style="padding:8px 6px;font-family:var(--mono);font-size:11px;color:var(--gold);letter-spacing:1px;">${x(t.code)}</td>
                                        <td style="padding:8px 6px;color:var(--text2);">${t.duration_days||120} days</td>
                                        <td style="padding:8px 6px;">
                                            <span style="background:${s}22;color:${s};padding:2px 8px;border-radius:10px;font-size:10px;">${t.status}</span>
                                        </td>
                                        <td style="padding:8px 6px;color:var(--text3);">${t.used_by?t.used_by.substring(0,12)+"...":"—"}</td>
                                        <td style="padding:8px 6px;color:var(--text3);">${t.expires_at?new Date(t.expires_at).toLocaleDateString("en-GB"):"No expiry"}</td>
                                        <td style="padding:8px 6px;">
                                            ${t.status==="unused"?`
                                                <button class="btn btn-sm" data-id="${t.id}" style="font-size:10px;background:transparent;border:1px solid rgba(255,71,87,0.3);color:var(--red);" id="revokeCode-${t.id}">Revoke</button>
                                            `:"—"}
                                        </td>
                                    </tr>
                                `}).join("")}
                        </tbody>
                    </table>
                </div>
            `}
        </div>
    `}function ht(e,a){var n,d;(n=document.getElementById("codeFilter"))==null||n.addEventListener("change",t=>{const s=t.target.value;document.querySelectorAll("#codesTableBody tr").forEach(o=>{o.style.display=s==="all"||o.dataset.status===s?"":"none"})}),(d=document.getElementById("generateCodesBtn"))==null||d.addEventListener("click",async()=>{const t=parseInt(document.getElementById("codeCount").value)||5,s=parseInt(document.getElementById("codeDuration").value)||120,o=document.getElementById("codeExpiry").value,i=document.getElementById("generateCodesBtn");i.disabled=!0,i.textContent="Generating...";const l=[];for(let v=0;v<t;v++){const E=Et(),A=o?new Date(o).toISOString():null,{data:$}=await u.from("activation_codes").insert({code:E,status:"unused",duration_days:s,expires_at:A,created_at:new Date().toISOString()}).select("code").single();$&&l.push(E)}const c=document.getElementById("generatedCodesOutput");c.innerHTML=`
            <div style="background:var(--elevated);border-radius:8px;padding:14px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                    <span style="font-size:12px;color:var(--text2);">${l.length} codes generated:</span>
                    <button class="btn btn-sm btn-secondary" id="copyAllCodes">Copy All</button>
                </div>
                <div style="font-family:var(--mono);font-size:12px;color:var(--gold);letter-spacing:1px;line-height:2;">
                    ${l.map(v=>`<div>${v}</div>`).join("")}
                </div>
            </div>
        `,document.getElementById("copyAllCodes").addEventListener("click",()=>{navigator.clipboard.writeText(l.join(`
`)),document.getElementById("copyAllCodes").textContent="Copied!"}),i.disabled=!1,i.textContent="Generate Codes",y(`${l.length} codes generated.`,"success")}),e.filter(t=>t.status==="unused").forEach(t=>{var s;(s=document.getElementById(`revokeCode-${t.id}`))==null||s.addEventListener("click",async()=>{confirm("Revoke this code? It can no longer be used.")&&(await u.from("activation_codes").update({status:"revoked"}).eq("id",t.id),y("Code revoked.","warning"),h({},null,a))})})}function $t(){return`
        <div class="card" style="max-width:500px;margin-bottom:16px;">
            <h3 style="font-size:14px;font-weight:700;margin-bottom:16px;">Default Settings</h3>

            <div class="form-group">
                <label>Free Trial Duration (days)</label>
                <input type="number" id="settingTrialDays" class="input" value="14" style="max-width:200px;">
                <p style="font-size:11px;color:var(--text3);margin-top:4px;">Applied to all new signups.</p>
            </div>

            <div class="form-group">
                <label>Free Questions Per Day</label>
                <input type="number" id="settingFreeQueries" class="input" value="10" style="max-width:200px;">
            </div>

            <div class="form-group">
                <label>Pro Price (XAF)</label>
                <input type="number" id="settingProPrice" class="input" value="3000" style="max-width:200px;">
                <p style="font-size:11px;color:var(--text3);margin-top:4px;">3000 XAF ≈ $5 USD</p>
            </div>

            <button class="btn btn-primary btn-sm" id="saveSettingsBtn">Save Settings</button>
            <p style="font-size:10px;color:var(--text3);margin-top:8px;">
                Note: Changes apply to new users. Existing users keep their current limits until manually updated.
            </p>
        </div>

        <div class="card" style="max-width:500px;margin-bottom:16px;">
            <h3 style="font-size:14px;font-weight:700;margin-bottom:16px;">Maintenance Mode</h3>
            <p style="font-size:13px;color:var(--text2);margin-bottom:12px;">
                Enabling maintenance mode shows a "We'll be back soon" page to all non-admin visitors.
            </p>
            <p style="font-size:12px;color:var(--text3);margin-bottom:12px;">
                Set <code style="background:var(--elevated);padding:2px 6px;border-radius:4px;">VITE_MAINTENANCE_MODE=true</code>
                in your .env file and redeploy.
            </p>
            <button class="btn btn-sm btn-secondary" id="maintenanceInfoBtn">How to enable</button>
        </div>

        <div class="card" style="max-width:500px;border-color:rgba(255,71,87,0.25);">
            <h3 style="font-size:14px;font-weight:700;color:var(--red);margin-bottom:16px;">Danger Zone</h3>
            <div style="display:flex;flex-direction:column;gap:8px;">
                <button class="btn btn-sm" style="background:transparent;border:1px solid rgba(255,71,87,0.3);color:var(--red);text-align:left;padding:10px 14px;" id="clearCacheBtn">
                    Clear Knowledge Cache — removes all stored Q&A pairs
                </button>
                <button class="btn btn-sm" style="background:transparent;border:1px solid rgba(255,71,87,0.3);color:var(--red);text-align:left;padding:10px 14px;" id="resetQueriesAllBtn">
                    Reset All Daily Query Counts — resets every user's today count to 0
                </button>
            </div>
        </div>
    `}function wt(e){var a,n,d,t;(a=document.getElementById("saveSettingsBtn"))==null||a.addEventListener("click",()=>{y("Settings saved. Note: these are UI references only. Update your .env and Supabase for permanent changes.","success")}),(n=document.getElementById("maintenanceInfoBtn"))==null||n.addEventListener("click",()=>{alert(`To enable maintenance mode:

1. Open your .env file
2. Set VITE_MAINTENANCE_MODE=true
3. Run npm run build
4. Redeploy to Vercel/Render

Only admin sessions will bypass maintenance mode.`)}),(d=document.getElementById("clearCacheBtn"))==null||d.addEventListener("click",async()=>{confirm("Delete ALL cached Q&A pairs? The system will rebuild the cache over time but this will increase API costs temporarily.")&&(await u.from("knowledge_cache").delete().neq("id","00000000-0000-0000-0000-000000000000"),y("Knowledge cache cleared.","warning"))}),(t=document.getElementById("resetQueriesAllBtn"))==null||t.addEventListener("click",async()=>{confirm("Reset ALL users' daily query counts to 0?")&&(await u.from("profiles").update({queries_today:0}).neq("id","00000000-0000-0000-0000-000000000000"),y("All query counts reset.","success"))})}function m(e,a,n=""){return`
        <div class="stat-card">
            <div class="stat-value">${e}</div>
            <div class="stat-label">${a}</div>
            ${n?`<div style="font-size:10px;color:var(--text3);margin-top:4px;">${n}</div>`:""}
        </div>
    `}function g(e,a,n="var(--gold)"){return`
        <div style="background:var(--elevated);border-radius:8px;padding:12px;text-align:center;">
            <div style="font-size:18px;font-weight:700;color:${n};line-height:1;">${e}</div>
            <div style="font-size:10px;color:var(--text3);margin-top:4px;">${a}</div>
        </div>
    `}function w(e,a,n=null){return`
        <div style="background:var(--surface);border:var(--border);border-radius:6px;padding:7px 10px;font-size:10px;text-align:center;display:flex;align-items:center;justify-content:center;gap:5px;">
            <span style="width:6px;height:6px;border-radius:50%;background:${n==="warning"?"var(--gold)":a?"var(--green)":"var(--red)"};flex-shrink:0;"></span>
            <span style="color:var(--text2);">${e}</span>
        </div>
    `}function St(){const e="background:linear-gradient(90deg,var(--elevated) 25%,var(--overlay) 50%,var(--elevated) 75%);background-size:200% 100%;animation:shimmer 1.2s infinite;";return`
        <style>@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}</style>
        <div style="max-width:1100px;margin:0 auto;padding:24px;">
            <div style="height:40px;border-radius:6px;${e};margin-bottom:16px;"></div>
            <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-bottom:20px;">
                ${[1,2,3,4,5].map(()=>`<div style="height:36px;border-radius:6px;${e};"></div>`).join("")}
            </div>
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px;">
                ${[1,2,3,4].map(()=>`<div style="height:80px;border-radius:8px;${e};"></div>`).join("")}
            </div>
            <div style="height:400px;border-radius:12px;${e};"></div>
        </div>
    `}function Et(){const e="ABCDEFGHJKLMNPQRSTUVWXYZ23456789",a=()=>Array.from({length:4},()=>e[Math.floor(Math.random()*e.length)]).join("");return`CC-${a()}-${a()}-${a()}`}function y(e,a="success"){const n=document.getElementById("adminToast");n&&n.remove();const d={success:"var(--green)",warning:"var(--gold)",error:"var(--red)",info:"var(--text2)"},t=document.createElement("div");t.id="adminToast",t.style.cssText=`
        position:fixed;bottom:20px;right:20px;padding:12px 20px;
        background:var(--surface);border:1px solid ${d[a]||d.success};
        color:${d[a]||d.success};border-radius:8px;font-size:13px;
        z-index:10000;max-width:320px;box-shadow:var(--shadow-lg);
        animation:toastIn 0.25s ease-out;font-family:var(--font);
    `,t.textContent=e;const s=document.createElement("style");s.textContent="@keyframes toastIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}",document.head.appendChild(s),document.body.appendChild(t),setTimeout(()=>t.remove(),3500)}function x(e){if(!e)return"";const a=document.createElement("div");return a.textContent=e,a.innerHTML}export{h as renderAdminPage};
