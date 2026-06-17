import{s as T,_ as Z}from"./index-BtxTVbtb.js";import{d}from"./db-pvI7aOo2.js";function b(m){if(!m)return"";const f=document.createElement("div");return f.textContent=m,f.innerHTML}function J(m){return m?m<1024?m+" B":m<1048576?(m/1024).toFixed(1)+" KB":(m/1048576).toFixed(1)+" MB":"0 B"}function at(m){return new Promise((f,g)=>{const I=new FileReader;I.onload=()=>f(I.result),I.onerror=g,I.readAsDataURL(m)})}function j(m,f=null,g=null){f&&localStorage.setItem("cc_study_material",f),g&&localStorage.setItem("cc_study_title",g),m&&localStorage.setItem("cc_study_course",String(m)),localStorage.removeItem("cc_resume_session_id")}async function nt(m){if(m)try{const{data:{user:f}}=await T.auth.getUser();if(!f)return;const{data:g}=await T.from("user_sessions").select("session_id").eq("user_id",f.id).eq("course_id",m);if(!(g!=null&&g.length))return;const I=g.map(D=>D.session_id);await T.from("session_messages").delete().in("session_id",I),await T.from("user_sessions").delete().in("session_id",I);const k=localStorage.getItem("cc_last_session_id");I.includes(k)&&(localStorage.removeItem("cc_last_session_id"),localStorage.removeItem("cc_resume_session_id"))}catch(f){console.warn("[Library] deleteSessionsByCourseId error:",f.message)}}async function it(m,f,g){const I=document.getElementById("page-library");if(!I)return;if(!m.user){g("signin");return}let k=await d.courses.toArray();function D(){I.innerHTML=`
            <div class="library-layout">
                <div class="library-header">
                    <div>
                        <h2 class="page-title">Library</h2>
                        <p class="page-subtitle">${k.length} course${k.length!==1?"s":""} · Your knowledge vault</p>
                    </div>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;">
                        <button class="btn btn-secondary" id="quickScanBtn">📸 Quick Scan</button>
                        <button class="btn btn-primary" id="addCourseBtn">+ Add Course</button>
                    </div>
                </div>

                ${k.length===0?`
                    <div class="empty-state">
                        <div class="empty-icon">+</div>
                        <h3>No courses yet</h3>
                        <p>Add your first course to start building your library.</p>
                        <p style="font-size:12px;color:var(--text3);margin-top:4px;">
                            Upload PDFs, images, textbooks, or paste notes.<br>
                            The AI teaches from everything you store here.
                        </p>
                    </div>
                `:`
                    <div class="course-grid">
                        ${k.map(e=>`
                            <div class="course-card" data-id="${e.id}">
                                <div class="course-card-header">
                                    <div class="course-code">${b(e.code||"")}</div>
                                    <div class="course-actions">
                                        <button class="btn btn-sm btn-primary study-course-btn"         data-id="${e.id}">Study</button>
                                        <button class="btn btn-sm btn-secondary upload-to-course-btn"   data-id="${e.id}">📤 Upload</button>
                                        <button class="btn btn-sm btn-secondary delete-course-btn"      data-id="${e.id}">×</button>
                                    </div>
                                </div>
                                <div class="course-card-body">
                                    <h4>${b(e.name||"")}</h4>
                                    <div class="course-meta">
                                        ${e.lecturer?`<span>${b(e.lecturer)}</span>`:""}
                                        ${e.examDate?`<span>Exam: ${new Date(e.examDate).toLocaleDateString("en-GB")}</span>`:""}
                                    </div>
                                </div>
                                <div class="course-card-footer">
                                    <span class="badge badge-success">Active</span>
                                </div>
                            </div>
                        `).join("")}
                    </div>
                `}

                <!-- Add Course Modal -->
                <div class="modal-overlay" id="courseModal" style="display:none;">
                    <div class="modal">
                        <div class="modal-header">
                            <h3>Add Course</h3>
                            <button class="modal-close" id="closeCourseModal">×</button>
                        </div>
                        <div class="modal-body">
                            <div class="form-group"><label>Course Code</label><input type="text" id="courseCode" class="input" placeholder="e.g. CIV 201" autofocus></div>
                            <div class="form-group"><label>Course Name</label><input type="text" id="courseName" class="input" placeholder="e.g. Structural Mechanics II"></div>
                            <div class="form-group"><label>Lecturer (optional)</label><input type="text" id="courseLecturer" class="input" placeholder="Dr. ..."></div>
                            <div class="form-group"><label>Exam Date (optional)</label><input type="date" id="courseExamDate" class="input"></div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-secondary" id="cancelCourseBtn">Cancel</button>
                            <button class="btn btn-primary"   id="saveCourseBtn">Save Course</button>
                        </div>
                    </div>
                </div>

                <!-- Quick Scan Modal -->
                <div class="modal-overlay" id="quickScanModal" style="display:none;">
                    <div class="modal modal-lg">
                        <div class="modal-header">
                            <h3>📸 Quick Scan</h3>
                            <button class="modal-close" id="closeQuickScanModal">×</button>
                        </div>
                        <div class="modal-body">
                            <p style="margin-bottom:12px;">Take a photo of a diagram, graph, or notes. AI will read and teach you.</p>
                            <div style="display:flex;gap:8px;margin-bottom:16px;">
                                <button class="btn btn-primary"   id="cameraBtn">📷 Take Photo</button>
                                <button class="btn btn-secondary" id="galleryBtn">🖼️ Choose from Gallery</button>
                            </div>
                            <video id="cameraPreview" autoplay playsinline style="width:100%;max-height:300px;object-fit:cover;border-radius:8px;display:none;"></video>
                            <canvas id="photoCanvas" style="display:none;"></canvas>
                            <img id="capturedImage" style="width:100%;border-radius:8px;display:none;">
                            <div id="scanProgress" style="display:none;text-align:center;padding:20px;">
                                <div class="spinner"></div>
                                <p style="margin-top:12px;color:var(--text2);">AI is reading your image...</p>
                            </div>
                            <div id="scanResult" style="margin-top:16px;display:none;">
                                <div style="background:var(--elevated);padding:14px;border-radius:8px;">
                                    <h4 style="margin-bottom:8px;">🤖 AI Analysis</h4>
                                    <div id="scanExplanation" style="font-size:13px;line-height:1.6;"></div>
                                    <button class="btn btn-primary" id="saveScanBtn" style="margin-top:12px;">Save to Course</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Textbook Upload Modal -->
                <div class="modal-overlay" id="textbookModal" style="display:none;">
                    <div class="modal modal-lg">
                        <div class="modal-header">
                            <h3>📚 Upload to Course</h3>
                            <button class="modal-close" id="closeTextbookModal">×</button>
                        </div>
                        <div class="modal-body">
                            <div class="file-drop-zone" id="textbookDropZone">
                                <p style="font-size:24px;margin-bottom:8px;">📖</p>
                                <p>Drop PDF here or click to browse</p>
                                <p style="color:var(--text3);font-size:11px;margin-top:4px;">Large files supported</p>
                                <input type="file" id="textbookFile" accept=".pdf" style="display:none;">
                            </div>
                            <div id="textbookProgress" style="display:none;margin-top:16px;">
                                <div style="background:rgba(255,255,255,0.1);border-radius:10px;height:8px;overflow:hidden;">
                                    <div id="textbookProgressFill" style="width:0%;height:100%;background:var(--gold);transition:width 0.3s;border-radius:10px;"></div>
                                </div>
                                <p id="textbookStatus" style="font-size:12px;margin-top:8px;color:var(--text2);">Processing...</p>
                            </div>
                            <div id="chapterSelection" style="display:none;margin-top:16px;">
                                <h4 style="margin-bottom:10px;">📑 Table of Contents Detected</h4>
                                <div id="chaptersList" style="max-height:300px;overflow-y:auto;"></div>
                                <button class="btn btn-primary" id="startLearningBtn" style="margin-top:12px;">Study from Chapter 1</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Course Detail Modal -->
                <div class="modal-overlay" id="detailModal" style="display:none;">
                    <div class="modal modal-lg" id="detailContent"></div>
                </div>
            </div>
        `,V()}function V(){var e,s,c,i,p,u,E,C,y;(e=document.getElementById("addCourseBtn"))==null||e.addEventListener("click",()=>{document.getElementById("courseModal").style.display="flex",setTimeout(()=>{var a;return(a=document.getElementById("courseCode"))==null?void 0:a.focus()},200)}),(s=document.getElementById("closeCourseModal"))==null||s.addEventListener("click",$),(c=document.getElementById("cancelCourseBtn"))==null||c.addEventListener("click",$),document.querySelectorAll(".modal-overlay").forEach(a=>{a.addEventListener("click",l=>{l.target===a&&$()})}),(i=document.getElementById("saveCourseBtn"))==null||i.addEventListener("click",async()=>{const a=document.getElementById("courseCode").value.trim(),l=document.getElementById("courseName").value.trim();if(!a||!l){alert("Course code and name are required.");return}await d.courses.add({code:a,name:l,lecturer:document.getElementById("courseLecturer").value.trim(),examDate:document.getElementById("courseExamDate").value||null}),$(),k=await d.courses.toArray(),D()}),(p=document.getElementById("quickScanBtn"))==null||p.addEventListener("click",()=>{document.getElementById("quickScanModal").style.display="flex",Y()}),(u=document.getElementById("closeQuickScanModal"))==null||u.addEventListener("click",()=>{document.getElementById("quickScanModal").style.display="none",N()}),(E=document.getElementById("galleryBtn"))==null||E.addEventListener("click",()=>{const a=document.createElement("input");a.type="file",a.accept="image/*",a.onchange=async l=>{const n=l.target.files[0];if(!n)return;const x=new FileReader;x.onload=async v=>{const w=document.getElementById("capturedImage");w.src=v.target.result,w.style.display="block",document.getElementById("cameraPreview").style.display="none",await G(v.target.result)},x.readAsDataURL(n)},a.click()}),(C=document.getElementById("saveScanBtn"))==null||C.addEventListener("click",async()=>{if(!window.__lastScanExplanation){alert("No scan to save.");return}const a=await d.courses.toArray();if(a.length===0){alert("Add a course first.");return}const l=a.length===1?a[0].id:parseInt(prompt(`Save to course:
${a.map(n=>`${n.id}: ${n.code} — ${n.name}`).join(`
`)}

Enter course ID:`,a[0].id));!l||!a.find(n=>n.id===l)||(await d.materials.add({courseId:l,topicId:null,type:"Scanned Image",title:`Scan ${new Date().toLocaleString()}`,content:window.__lastScanExplanation,dateAdded:new Date().toISOString()}),alert("Saved!"),document.getElementById("quickScanModal").style.display="none",N(),k=await d.courses.toArray(),D())}),(y=document.getElementById("closeTextbookModal"))==null||y.addEventListener("click",()=>{document.getElementById("textbookModal").style.display="none"}),document.querySelectorAll(".study-course-btn").forEach(a=>{a.addEventListener("click",async l=>{var v,w;l.stopPropagation();const n=parseInt(a.dataset.id),x=await d.materials.where("courseId").equals(n).toArray();j(n,((v=x[0])==null?void 0:v.content)||null,((w=x[0])==null?void 0:w.title)||null),g("study")})}),document.querySelectorAll(".upload-to-course-btn").forEach(a=>{a.addEventListener("click",async l=>{l.stopPropagation();const n=parseInt(a.dataset.id);k.find(x=>x.id===n),X(n)})}),document.querySelectorAll(".delete-course-btn").forEach(a=>{a.addEventListener("click",async l=>{l.stopPropagation();const n=parseInt(a.dataset.id);confirm("Delete this course and all its materials and sessions?")&&(await nt(n),await d.courses.delete(n),await d.materials.where("courseId").equals(n).delete(),await d.topics.where("courseId").equals(n).delete(),await d.files.where("courseId").equals(n).delete(),await d.textbooks.where("courseId").equals(n).delete(),k=await d.courses.toArray(),D())})}),document.querySelectorAll(".course-card").forEach(a=>{a.addEventListener("click",()=>A(parseInt(a.dataset.id)))})}let F=null;async function Y(){try{const e=document.getElementById("cameraPreview"),s=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}});F=s,e.srcObject=s,e.style.display="block";const c=document.getElementById("cameraBtn");c&&(c.textContent="📸 Capture",c.onclick=K)}catch{alert("Camera access denied. Use the gallery option instead.")}}function N(){F&&(F.getTracks().forEach(e=>e.stop()),F=null)}async function K(){const e=document.getElementById("cameraPreview"),s=document.getElementById("photoCanvas"),c=document.getElementById("capturedImage");s.width=e.videoWidth,s.height=e.videoHeight,s.getContext("2d").drawImage(e,0,0);const i=s.toDataURL("image/jpeg",.8);c.src=i,c.style.display="block",e.style.display="none",await G(i)}async function G(e){var s,c,i;document.getElementById("scanProgress").style.display="block",document.getElementById("scanResult").style.display="none";try{const{data:{session:p}}=await T.auth.getSession(),u=p==null?void 0:p.access_token;if(!u)throw new Error("Not authenticated");const y=((i=(c=(s=(await(await fetch("https://snsvhyoiznrlbbszcisw.supabase.co/functions/v1/ai-chat",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${u}`},body:JSON.stringify({messages:[{role:"user",content:[{type:"text",text:"You are an engineering tutor. Analyze this image and teach from it. If graph/chart: explain axes and meaning. If diagram: explain elements. If handwritten: transcribe and explain. Be thorough. Student is Level 200 Civil Engineering."},{type:"image_url",image_url:{url:e}}]}],mode:"learn",max_tokens:2e3})})).json()).choices)==null?void 0:s[0])==null?void 0:c.message)==null?void 0:i.content)||"Could not analyze image.";document.getElementById("scanExplanation").innerHTML=y.replace(/\n/g,"<br>"),window.__lastScanExplanation=y}catch(p){document.getElementById("scanExplanation").innerHTML=`<p style="color:var(--red);">Analysis failed: ${p.message}</p>`}document.getElementById("scanProgress").style.display="none",document.getElementById("scanResult").style.display="block"}function X(e,s){const c=document.getElementById("textbookModal"),i=document.getElementById("textbookDropZone"),p=document.getElementById("textbookFile");c.style.display="flex",document.getElementById("textbookProgress").style.display="none",document.getElementById("chapterSelection").style.display="none",i.onclick=()=>p.click(),i.ondragover=u=>{u.preventDefault(),i.style.borderColor="var(--gold)"},i.ondragleave=()=>{i.style.borderColor=""},i.ondrop=async u=>{u.preventDefault(),i.style.borderColor="";const E=u.dataTransfer.files[0];(E==null?void 0:E.type)==="application/pdf"&&await Q(E,e)},p.onchange=async u=>{u.target.files[0]&&await Q(u.target.files[0],e)}}async function Q(e,s){var u,E,C,y;const c=document.getElementById("textbookProgress"),i=document.getElementById("textbookStatus"),p=document.getElementById("textbookProgressFill");c.style.display="block",i.textContent="Reading PDF…",p.style.width="5%";try{const a=await Z(()=>import("./pdf-DmBMYJlR.js").then(r=>r.p),[]);a.GlobalWorkerOptions.workerSrc="https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js";const l=await a.getDocument({data:await e.arrayBuffer()}).promise,n=l.numPages,x=Math.min(n,50);let v="";for(let r=1;r<=x;r++){const o=await(await l.getPage(r)).getTextContent();v+=`
--- PAGE ${r} ---
${o.items.map(h=>h.str).join(" ")}`,p.style.width=`${r/x*40}%`,r%10===0&&(i.textContent=`Extracting page ${r}/${x}…`)}i.textContent="AI detecting chapters…",p.style.width="50%";const{data:{session:w}}=await T.auth.getSession(),R=w==null?void 0:w.access_token,O=await(await fetch("https://snsvhyoiznrlbbszcisw.supabase.co/functions/v1/ai-chat",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${R}`},body:JSON.stringify({messages:[{role:"user",content:`Extract table of contents from this textbook excerpt.

${v.substring(0,12e3)}

Return ONLY JSON: {"title":"...","chapters":[{"number":1,"title":"...","startPage":1}],"totalPages":${n}}`}],mode:"quick",max_tokens:1500})})).json();let B;try{B=JSON.parse(((C=(E=(u=O.choices)==null?void 0:u[0])==null?void 0:E.message)==null?void 0:C.content)||"{}")}catch{B={chapters:[]}}i.textContent="Saving…",p.style.width="80%",await d.textbooks.add({courseId:s,title:B.title||e.name,totalPages:n,chapters:B.chapters||[],rawText:v.substring(0,5e4),dateAdded:new Date().toISOString()});const P=new FileReader;P.onload=async r=>{await d.files.add({courseId:s,name:e.name,type:e.type,size:e.size,data:r.target.result,dateAdded:new Date().toISOString()})},P.readAsDataURL(e),await d.materials.add({courseId:s,topicId:null,type:"Textbook",title:B.title||e.name,content:v.substring(0,5e4),dateAdded:new Date().toISOString()}),p.style.width="100%",i.textContent="✅ Ready!",((y=B.chapters)==null?void 0:y.length)>0&&(document.getElementById("chapterSelection").style.display="block",document.getElementById("chaptersList").innerHTML=B.chapters.map(r=>`
                    <div style="padding:10px;border-bottom:1px solid rgba(255,255,255,0.06);">
                        <strong>Chapter ${r.number}: ${b(r.title)}</strong>
                        <button class="btn btn-sm btn-primary study-chapter-btn" data-chapter="${r.number}" style="display:block;margin-top:6px;">Study Chapter ${r.number}</button>
                    </div>
                `).join(""),document.querySelectorAll(".study-chapter-btn").forEach(r=>{r.addEventListener("click",()=>{j(s,v.substring(0,2e4),`Chapter ${r.dataset.chapter} — ${B.title||e.name}`),document.getElementById("textbookModal").style.display="none",g("study")})})),document.getElementById("startLearningBtn").onclick=()=>{j(s,v.substring(0,2e4),B.title||e.name),document.getElementById("textbookModal").style.display="none",g("study")}}catch(a){i.textContent=`❌ Error: ${a.message}`,console.error("[Library] processTextbook error:",a)}}async function A(e){var x,v,w,R,U,O,B,P,r;const s=k.find(t=>t.id===e);if(!s)return;const c=await d.topics.where("courseId").equals(e).toArray(),i=await d.materials.where("courseId").equals(e).toArray(),p=await d.files.where("courseId").equals(e).toArray(),u=await d.textbooks.where("courseId").equals(e).toArray(),E=document.getElementById("detailModal"),C=document.getElementById("detailContent");C.innerHTML=`
            <div class="modal-header">
                <div>
                    <h3>${b(s.code)} — ${b(s.name)}</h3>
                    <p style="color:var(--text2);font-size:12px;">${b(s.lecturer||"")} ${s.examDate?"· Exam: "+new Date(s.examDate).toLocaleDateString("en-GB"):""}</p>
                </div>
                <button class="modal-close" id="closeDetailModal">×</button>
            </div>
            <div class="modal-body">

                ${u.length>0?`
                    <div style="background:var(--gold-dim);border:1px solid var(--gold-border);border-radius:8px;padding:12px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
                        <div>
                            <div style="font-size:11px;color:var(--gold);font-weight:700;margin-bottom:2px;">TEXTBOOK</div>
                            <div style="font-weight:600;font-size:13px;">${b(u[0].title)}</div>
                        </div>
                        <button class="btn btn-sm btn-primary" id="continueTextbookBtn">Study This →</button>
                    </div>
                `:""}

                <!-- Topics -->
                <div class="detail-section">
                    <div class="detail-section-header">
                        <h4>Topics (${c.length})</h4>
                        <button class="btn btn-sm btn-primary" id="addTopicBtn">+ Add</button>
                    </div>
                    <div id="topicList">
                        ${c.length===0?'<p style="color:var(--text3);font-size:12px;">No topics yet.</p>':c.map(t=>`
                                <div class="topic-item">
                                    <span class="mastery-dot" style="background:${t.masteryLevel>3?"var(--green)":t.masteryLevel>1?"var(--gold)":"var(--text3)"};"></span>
                                    <span style="flex:1;">${b(t.name)}</span>
                                    <span style="font-size:10px;color:var(--text3);">Lv ${t.masteryLevel||0}/5</span>
                                    <button class="btn btn-sm btn-secondary delete-topic-btn" data-id="${t.id}" style="font-size:10px;">×</button>
                                </div>`).join("")}
                    </div>
                    <div id="addTopicForm" style="display:none;margin-top:8px;">
                        <div style="display:flex;gap:6px;">
                            <input type="text" id="newTopicName" class="input" placeholder="Topic name…">
                            <button class="btn btn-sm btn-primary"   id="saveTopicBtn"   style="flex-shrink:0;">Save</button>
                            <button class="btn btn-sm btn-secondary" id="cancelTopicBtn" style="flex-shrink:0;">Cancel</button>
                        </div>
                    </div>
                </div>

                <!-- Materials -->
                <div class="detail-section">
                    <div class="detail-section-header">
                        <h4>Materials (${i.length})</h4>
                        <button class="btn btn-sm btn-primary" id="addMaterialBtn">+ Add</button>
                    </div>
                    <div id="materialList">
                        ${i.length===0?'<p style="color:var(--text3);font-size:12px;">No materials yet.</p>':i.map(t=>`
                                <div class="material-item">
                                    <div class="material-type">${b(t.type||"Note")}</div>
                                    <div class="material-title">${b(t.title)}</div>
                                    <div class="material-preview">${b((t.content||"").substring(0,120))}…</div>
                                    <button class="material-study-btn" data-matid="${t.id}">Study This</button>
                                    <button class="btn btn-sm btn-secondary delete-material-btn" data-id="${t.id}" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);font-size:10px;opacity:0;">×</button>
                                </div>`).join("")}
                    </div>
                    <div id="addMaterialForm" style="display:none;margin-top:12px;">
                        <select id="materialTopic" class="input" style="margin-bottom:6px;">
                            <option value="">Topic (optional)</option>
                            ${c.map(t=>`<option value="${t.id}">${b(t.name)}</option>`).join("")}
                        </select>
                        <select id="materialType" class="input" style="margin-bottom:6px;">
                            <option>Lecture Note</option><option>Past Question</option>
                            <option>Tutorial</option><option>Textbook</option>
                            <option>Diagram</option><option>Other</option>
                        </select>
                        <input type="text" id="materialTitle" class="input" placeholder="Title…" style="margin-bottom:6px;">

                        <div style="display:flex;gap:4px;margin-bottom:8px;flex-wrap:wrap;">
                            <button class="btn btn-sm btn-secondary upload-tab-btn active" data-tab="paste">Paste Text</button>
                            <button class="btn btn-sm btn-secondary upload-tab-btn" data-tab="file">Upload File</button>
                            <button class="btn btn-sm btn-secondary upload-tab-btn" data-tab="voice">Voice</button>
                        </div>

                        <div id="pasteTab">
                            <textarea id="materialContent" class="input" rows="8" placeholder="Paste notes, textbook content…"></textarea>
                        </div>
                        <div id="fileTab" style="display:none;">
                            <div class="file-drop-zone" id="fileDropZone" style="border:2px dashed rgba(255,255,255,0.12);border-radius:10px;padding:32px;text-align:center;cursor:pointer;">
                                <p style="font-size:22px;margin-bottom:6px;">+</p>
                                <p style="color:var(--text2);">Drop file or click to browse</p>
                                <p style="color:var(--text3);font-size:11px;">PDF, image, text, Word</p>
                                <input type="file" id="materialFile" accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.doc,.docx" style="display:none;">
                            </div>
                            <div id="filePreview"     style="display:none;margin-top:8px;"></div>
                            <div id="extractStatus"   style="font-size:11px;color:var(--text3);margin-top:6px;"></div>
                            <textarea id="extractedContent" class="input" rows="8" style="display:none;margin-top:8px;" placeholder="Extracted content…"></textarea>
                        </div>
                        <div id="voiceTab" style="display:none;text-align:center;padding:20px;">
                            <p style="color:var(--text2);margin-bottom:12px;">Click and speak your notes</p>
                            <button class="btn btn-primary" id="startDictationBtn" style="width:60px;height:60px;border-radius:50%;font-size:24px;">🎤</button>
                            <p id="dictationStatus" style="color:var(--text3);font-size:11px;margin-top:8px;">Press to start</p>
                            <textarea id="dictatedContent" class="input" rows="6" style="margin-top:12px;" placeholder="Spoken notes appear here…"></textarea>
                        </div>

                        <button class="btn btn-primary"   id="saveMaterialBtn"   style="margin-top:8px;">Save Material</button>
                        <button class="btn btn-secondary" id="cancelMaterialBtn" style="margin-top:8px;margin-left:4px;">Cancel</button>
                    </div>
                </div>

                <!-- Files -->
                <div class="detail-section">
                    <div class="detail-section-header">
                        <h4>Uploaded Files (${p.length})</h4>
                    </div>
                    ${p.length===0?'<p style="color:var(--text3);font-size:12px;">No files uploaded.</p>':p.map(t=>{var o;return`
                            <div style="display:flex;align-items:center;gap:12px;padding:8px 10px;border-radius:6px;font-size:12px;">
                                <span style="font-weight:600;">${(o=t.type)!=null&&o.startsWith("image/")?"Image":t.type==="application/pdf"?"PDF":"File"}</span>
                                <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${b(t.name)}</span>
                                <span style="color:var(--text3);font-size:11px;">${J(t.size)}</span>
                                <button class="btn btn-sm btn-secondary delete-file-btn" data-id="${t.id}" style="font-size:10px;">×</button>
                            </div>`}).join("")}
                </div>
            </div>`,E.style.display="flex",(x=document.getElementById("closeDetailModal"))==null||x.addEventListener("click",$),(v=document.getElementById("continueTextbookBtn"))==null||v.addEventListener("click",()=>{var t;j(e,(t=u[0].rawText)==null?void 0:t.substring(0,2e4),u[0].title),$(),g("study")}),(w=document.getElementById("addTopicBtn"))==null||w.addEventListener("click",()=>{document.getElementById("addTopicForm").style.display="block",document.getElementById("newTopicName").focus()}),(R=document.getElementById("cancelTopicBtn"))==null||R.addEventListener("click",()=>{document.getElementById("addTopicForm").style.display="none"}),(U=document.getElementById("saveTopicBtn"))==null||U.addEventListener("click",async()=>{const t=document.getElementById("newTopicName").value.trim();t&&(await d.topics.add({courseId:e,name:t,masteryLevel:0}),A(e))}),document.querySelectorAll(".delete-topic-btn").forEach(t=>{t.addEventListener("click",async()=>{await d.topics.delete(parseInt(t.dataset.id)),A(e)})}),(O=document.getElementById("addMaterialBtn"))==null||O.addEventListener("click",()=>{document.getElementById("addMaterialForm").style.display="block"}),(B=document.getElementById("cancelMaterialBtn"))==null||B.addEventListener("click",()=>{document.getElementById("addMaterialForm").style.display="none"}),document.querySelectorAll(".upload-tab-btn").forEach(t=>{t.addEventListener("click",function(){document.querySelectorAll(".upload-tab-btn").forEach(o=>{o.classList.remove("active"),o.style.cssText=""}),this.classList.add("active"),this.style.background="var(--gold-dim)",this.style.color="var(--gold)",document.getElementById("pasteTab").style.display=this.dataset.tab==="paste"?"block":"none",document.getElementById("fileTab").style.display=this.dataset.tab==="file"?"block":"none",document.getElementById("voiceTab").style.display=this.dataset.tab==="voice"?"block":"none"})});const y=document.getElementById("fileDropZone"),a=document.getElementById("materialFile");y&&(y.addEventListener("click",()=>a.click()),y.addEventListener("dragover",t=>{t.preventDefault(),y.style.borderColor="var(--gold)"}),y.addEventListener("dragleave",()=>{y.style.borderColor=""}),y.addEventListener("drop",t=>{t.preventDefault(),y.style.borderColor="",t.dataTransfer.files[0]&&l(t.dataTransfer.files[0])}),a.addEventListener("change",t=>{t.target.files[0]&&l(t.target.files[0])}));async function l(t){var h,z,_;document.getElementById("filePreview").style.display="block",document.getElementById("filePreview").innerHTML=`<p style="font-size:13px;color:var(--text2);">📄 ${b(t.name)} (${J(t.size)})</p>`,document.getElementById("extractStatus").textContent="Processing…",document.getElementById("extractedContent").style.display="block";const o=new FileReader;if(o.onload=async S=>await d.files.add({courseId:e,name:t.name,type:t.type,size:t.size,data:S.target.result,dateAdded:new Date().toISOString()}),o.readAsDataURL(t),document.getElementById("materialTitle").value||(document.getElementById("materialTitle").value=t.name.replace(/\.[^/.]+$/,"").replace(/[_-]/g," ")),t.type==="application/pdf"||t.name.endsWith(".pdf"))try{const S=await Z(()=>import("./pdf-DmBMYJlR.js").then(L=>L.p),[]);S.GlobalWorkerOptions.workerSrc="https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js";const M=await S.getDocument({data:await t.arrayBuffer()}).promise;let q="";const H=Math.min(M.numPages,50);for(let L=1;L<=H;L++){const tt=await(await M.getPage(L)).getTextContent();q+=tt.items.map(et=>et.str).join(" ")+`
`,L%10===0&&(document.getElementById("extractStatus").textContent=`Page ${L}/${H}…`)}document.getElementById("extractedContent").value=q,document.getElementById("extractStatus").textContent=`✅ ${q.length.toLocaleString()} characters extracted.`}catch{document.getElementById("extractStatus").textContent="❌ Could not read PDF. Try an image scan."}else if(t.type.startsWith("image/"))try{const S=await at(t);document.getElementById("extractStatus").textContent="AI analyzing image…";const{data:{session:M}}=await T.auth.getSession(),q=M==null?void 0:M.access_token,W=((_=(z=(h=(await(await fetch("https://snsvhyoiznrlbbszcisw.supabase.co/functions/v1/ai-chat",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${q}`},body:JSON.stringify({messages:[{role:"user",content:[{type:"text",text:"Extract ALL text, labels, numbers, formulas, chart data, and describe everything visible in this image. Be exhaustive."},{type:"image_url",image_url:{url:S}}]}],mode:"quick",max_tokens:2500})})).json()).choices)==null?void 0:h[0])==null?void 0:z.message)==null?void 0:_.content)||"";document.getElementById("extractedContent").value=W,document.getElementById("extractStatus").textContent=`✅ ${W.length.toLocaleString()} characters extracted.`}catch{document.getElementById("extractStatus").textContent="❌ Image analysis failed. Describe manually."}else{const S=await t.text();document.getElementById("extractedContent").value=S,document.getElementById("extractStatus").textContent=`✅ ${S.length.toLocaleString()} characters loaded.`}}let n=!1;(P=document.getElementById("startDictationBtn"))==null||P.addEventListener("click",()=>{const t=window.SpeechRecognition||window.webkitSpeechRecognition;if(!t){alert("Voice not supported. Try Chrome.");return}if(n){n=!1,document.getElementById("startDictationBtn").textContent="🎤";return}const o=new t;o.lang="en-US",o.continuous=!0,o.interimResults=!0,o.onresult=h=>{let z="";for(let _=h.resultIndex;_<h.results.length;_++)z+=h.results[_][0].transcript;document.getElementById("dictatedContent").value=z},o.onerror=()=>{n=!1,document.getElementById("startDictationBtn").textContent="🎤"},o.start(),n=!0,document.getElementById("startDictationBtn").textContent="⏹",document.getElementById("dictationStatus").textContent="Listening…",setTimeout(()=>{n&&(o.stop(),n=!1,document.getElementById("startDictationBtn").textContent="🎤",document.getElementById("dictationStatus").textContent="Done. Edit and save.")},6e4)}),(r=document.getElementById("saveMaterialBtn"))==null||r.addEventListener("click",async()=>{const t=document.getElementById("materialTitle").value.trim(),o=document.querySelector(".upload-tab-btn.active");let h="";if((o==null?void 0:o.dataset.tab)==="file"?h=document.getElementById("extractedContent").value.trim():(o==null?void 0:o.dataset.tab)==="voice"?h=document.getElementById("dictatedContent").value.trim():h=document.getElementById("materialContent").value.trim(),!t){alert("Enter a title.");return}if(!h){alert("Add some content.");return}await d.materials.add({courseId:e,topicId:document.getElementById("materialTopic").value||null,type:document.getElementById("materialType").value,title:t,content:h,dateAdded:new Date().toISOString()}),A(e)}),document.querySelectorAll(".material-study-btn").forEach(t=>{t.addEventListener("click",async()=>{const o=await d.materials.get(parseInt(t.dataset.matid));o&&(j(e,o.content,o.title),$(),g("study"))})}),document.querySelectorAll(".delete-material-btn").forEach(t=>{t.addEventListener("click",async()=>{confirm("Delete this material?")&&(await d.materials.delete(parseInt(t.dataset.id)),A(e))})}),document.querySelectorAll(".delete-file-btn").forEach(t=>{t.addEventListener("click",async()=>{confirm("Delete this file?")&&(await d.files.delete(parseInt(t.dataset.id)),A(e))})})}function $(){document.querySelectorAll(".modal-overlay").forEach(e=>e.style.display="none"),N()}D()}export{it as renderLibraryPage};
