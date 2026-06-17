// ============================================
// CHEATCODE — library.js
// Fixed: all study nav uses localStorage
//        deleteSessionsByCourseId defined
//        Dexie version 3 matches study.js
// ============================================

import { supabase } from '../supabase.js';
import { db } from '../db.js';

// ── Helpers ─────────────────────────────────
function esc(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatSize(bytes) {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload  = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// ── Navigate to study — always localStorage ──
function goStudy(courseId, materialContent = null, materialTitle = null) {
    if (materialContent) localStorage.setItem('cc_study_material', materialContent);
    if (materialTitle)   localStorage.setItem('cc_study_title',    materialTitle);
    if (courseId)        localStorage.setItem('cc_study_course',   String(courseId));
    // Clear old resume so study.js picks up preloaded content instead
    localStorage.removeItem('cc_resume_session_id');
}

// ── Delete Supabase sessions for a course ────
async function deleteSessionsByCourseId(courseId) {
    if (!courseId) return;
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        // Fetch session IDs for this course
        const { data: sessions } = await supabase
            .from('user_sessions')
            .select('session_id')
            .eq('user_id',   user.id)
            .eq('course_id', courseId);

        if (!sessions?.length) return;

        const ids = sessions.map(s => s.session_id);
        // Delete messages first (FK)
        await supabase.from('session_messages').delete().in('session_id', ids);
        await supabase.from('user_sessions').delete().in('session_id', ids);

        // Clear localStorage pointers if they pointed to one of these
        const lastId = localStorage.getItem('cc_last_session_id');
        if (ids.includes(lastId)) {
            localStorage.removeItem('cc_last_session_id');
            localStorage.removeItem('cc_resume_session_id');
        }
    } catch (e) {
        console.warn('[Library] deleteSessionsByCourseId error:', e.message);
    }
}

// ============================================
// MAIN RENDER
// ============================================
export async function renderLibraryPage(state, _supabase, navigateTo) {
    const page = document.getElementById('page-library');
    if (!page) return;
    if (!state.user) { navigateTo('signin'); return; }

    let courses = await db.courses.toArray();

    function render() {
        page.innerHTML = `
            <div class="library-layout">
                <div class="library-header">
                    <div>
                        <h2 class="page-title">Library</h2>
                        <p class="page-subtitle">${courses.length} course${courses.length !== 1 ? 's' : ''} · Your knowledge vault</p>
                    </div>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;">
                        <button class="btn btn-secondary" id="quickScanBtn">📸 Quick Scan</button>
                        <button class="btn btn-primary" id="addCourseBtn">+ Add Course</button>
                    </div>
                </div>

                ${courses.length === 0 ? `
                    <div class="empty-state">
                        <div class="empty-icon">+</div>
                        <h3>No courses yet</h3>
                        <p>Add your first course to start building your library.</p>
                        <p style="font-size:12px;color:var(--text3);margin-top:4px;">
                            Upload PDFs, images, textbooks, or paste notes.<br>
                            The AI teaches from everything you store here.
                        </p>
                    </div>
                ` : `
                    <div class="course-grid">
                        ${courses.map(c => `
                            <div class="course-card" data-id="${c.id}">
                                <div class="course-card-header">
                                    <div class="course-code">${esc(c.code || '')}</div>
                                    <div class="course-actions">
                                        <button class="btn btn-sm btn-primary study-course-btn"         data-id="${c.id}">Study</button>
                                        <button class="btn btn-sm btn-secondary upload-to-course-btn"   data-id="${c.id}">📤 Upload</button>
                                        <button class="btn btn-sm btn-secondary delete-course-btn"      data-id="${c.id}">×</button>
                                    </div>
                                </div>
                                <div class="course-card-body">
                                    <h4>${esc(c.name || '')}</h4>
                                    <div class="course-meta">
                                        ${c.lecturer  ? `<span>${esc(c.lecturer)}</span>` : ''}
                                        ${c.examDate  ? `<span>Exam: ${new Date(c.examDate).toLocaleDateString('en-GB')}</span>` : ''}
                                    </div>
                                </div>
                                <div class="course-card-footer">
                                    <span class="badge badge-success">Active</span>
                                </div>
                            </div>
                        `).join('')}
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
        `;

        wireMainButtons();
    }

    // ============================================
    // WIRE MAIN BUTTONS (after render)
    // ============================================
    function wireMainButtons() {
        // Add course
        document.getElementById('addCourseBtn')?.addEventListener('click', () => {
            document.getElementById('courseModal').style.display = 'flex';
            setTimeout(() => document.getElementById('courseCode')?.focus(), 200);
        });

        // Close / cancel
        document.getElementById('closeCourseModal')?.addEventListener('click', closeModals);
        document.getElementById('cancelCourseBtn')?.addEventListener('click', closeModals);
        document.querySelectorAll('.modal-overlay').forEach(o => {
            o.addEventListener('click', e => { if (e.target === o) closeModals(); });
        });

        // Save course
        document.getElementById('saveCourseBtn')?.addEventListener('click', async () => {
            const code = document.getElementById('courseCode').value.trim();
            const name = document.getElementById('courseName').value.trim();
            if (!code || !name) { alert('Course code and name are required.'); return; }
            await db.courses.add({
                code, name,
                lecturer:  document.getElementById('courseLecturer').value.trim(),
                examDate:  document.getElementById('courseExamDate').value || null,
            });
            closeModals();
            courses = await db.courses.toArray();
            render();
        });

        // Quick scan
        document.getElementById('quickScanBtn')?.addEventListener('click', () => {
            document.getElementById('quickScanModal').style.display = 'flex';
            initCamera();
        });
        document.getElementById('closeQuickScanModal')?.addEventListener('click', () => {
            document.getElementById('quickScanModal').style.display = 'none';
            stopCamera();
        });

        // Gallery upload
        document.getElementById('galleryBtn')?.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file'; input.accept = 'image/*';
            input.onchange = async e => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = async ev => {
                    const img = document.getElementById('capturedImage');
                    img.src = ev.target.result; img.style.display = 'block';
                    document.getElementById('cameraPreview').style.display = 'none';
                    await analyzeImageWithAI(ev.target.result);
                };
                reader.readAsDataURL(file);
            };
            input.click();
        });

        // Save scan
        document.getElementById('saveScanBtn')?.addEventListener('click', async () => {
            if (!window.__lastScanExplanation) { alert('No scan to save.'); return; }
            const all = await db.courses.toArray();
            if (all.length === 0) { alert('Add a course first.'); return; }
            const courseId = all.length === 1
                ? all[0].id
                : parseInt(prompt(`Save to course:\n${all.map(c => `${c.id}: ${c.code} — ${c.name}`).join('\n')}\n\nEnter course ID:`, all[0].id));
            if (!courseId || !all.find(c => c.id === courseId)) return;
            await db.materials.add({
                courseId, topicId: null, type: 'Scanned Image',
                title: `Scan ${new Date().toLocaleString()}`,
                content: window.__lastScanExplanation,
                dateAdded: new Date().toISOString(),
            });
            alert('Saved!');
            document.getElementById('quickScanModal').style.display = 'none';
            stopCamera();
            courses = await db.courses.toArray();
            render();
        });

        // Textbook modal
        document.getElementById('closeTextbookModal')?.addEventListener('click', () => {
            document.getElementById('textbookModal').style.display = 'none';
        });

        // Study course → load most recent material for this course
        document.querySelectorAll('.study-course-btn').forEach(btn => {
            btn.addEventListener('click', async e => {
                e.stopPropagation();
                const courseId = parseInt(btn.dataset.id);
                const mats = await db.materials.where('courseId').equals(courseId).toArray();
                goStudy(courseId, mats[0]?.content || null, mats[0]?.title || null);
                navigateTo('study');
            });
        });

        // Upload to course
        document.querySelectorAll('.upload-to-course-btn').forEach(btn => {
            btn.addEventListener('click', async e => {
                e.stopPropagation();
                const courseId = parseInt(btn.dataset.id);
                const course   = courses.find(c => c.id === courseId);
                showTextbookUploadModal(courseId, course);
            });
        });

        // Delete course
        document.querySelectorAll('.delete-course-btn').forEach(btn => {
            btn.addEventListener('click', async e => {
                e.stopPropagation();
                const courseId = parseInt(btn.dataset.id);
                if (!confirm('Delete this course and all its materials and sessions?')) return;
                await deleteSessionsByCourseId(courseId);
                await db.courses.delete(courseId);
                await db.materials.where('courseId').equals(courseId).delete();
                await db.topics.where('courseId').equals(courseId).delete();
                await db.files.where('courseId').equals(courseId).delete();
                await db.textbooks.where('courseId').equals(courseId).delete();
                courses = await db.courses.toArray();
                render();
            });
        });

        // Open course detail
        document.querySelectorAll('.course-card').forEach(card => {
            card.addEventListener('click', () => showCourseDetail(parseInt(card.dataset.id)));
        });
    }

    // ============================================
    // CAMERA
    // ============================================
    let currentStream = null;

    async function initCamera() {
        try {
            const video  = document.getElementById('cameraPreview');
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            currentStream = stream;
            video.srcObject = stream;
            video.style.display = 'block';
            const btn = document.getElementById('cameraBtn');
            if (btn) { btn.textContent = '📸 Capture'; btn.onclick = capturePhoto; }
        } catch {
            alert('Camera access denied. Use the gallery option instead.');
        }
    }

    function stopCamera() {
        if (currentStream) { currentStream.getTracks().forEach(t => t.stop()); currentStream = null; }
    }

    async function capturePhoto() {
        const video  = document.getElementById('cameraPreview');
        const canvas = document.getElementById('photoCanvas');
        const img    = document.getElementById('capturedImage');
        canvas.width  = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        const photoData = canvas.toDataURL('image/jpeg', 0.8);
        img.src = photoData; img.style.display = 'block';
        video.style.display = 'none';
        await analyzeImageWithAI(photoData);
    }

    async function analyzeImageWithAI(imageDataUrl) {
        document.getElementById('scanProgress').style.display = 'block';
        document.getElementById('scanResult').style.display = 'none';
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            if (!token) throw new Error('Not authenticated');

            const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    messages: [{
                        role: 'user',
                        content: [
                            { type: 'text', text: 'You are an engineering tutor. Analyze this image and teach from it. If graph/chart: explain axes and meaning. If diagram: explain elements. If handwritten: transcribe and explain. Be thorough. Student is Level 200 Civil Engineering.' },
                            { type: 'image_url', image_url: { url: imageDataUrl } }
                        ]
                    }],
                    mode: 'learn', max_tokens: 2000,
                }),
            });
            const data = await res.json();
            const explanation = data.choices?.[0]?.message?.content || 'Could not analyze image.';
            document.getElementById('scanExplanation').innerHTML = explanation.replace(/\n/g, '<br>');
            window.__lastScanExplanation = explanation;
        } catch (err) {
            document.getElementById('scanExplanation').innerHTML = `<p style="color:var(--red);">Analysis failed: ${err.message}</p>`;
        }
        document.getElementById('scanProgress').style.display = 'none';
        document.getElementById('scanResult').style.display = 'block';
    }

    // ============================================
    // TEXTBOOK UPLOAD MODAL
    // ============================================
    function showTextbookUploadModal(courseId, course) {
        const modal    = document.getElementById('textbookModal');
        const dropZone = document.getElementById('textbookDropZone');
        const fileInput= document.getElementById('textbookFile');
        modal.style.display = 'flex';
        document.getElementById('textbookProgress').style.display  = 'none';
        document.getElementById('chapterSelection').style.display  = 'none';

        dropZone.onclick = () => fileInput.click();
        dropZone.ondragover  = e => { e.preventDefault(); dropZone.style.borderColor = 'var(--gold)'; };
        dropZone.ondragleave = () => { dropZone.style.borderColor = ''; };
        dropZone.ondrop      = async e => {
            e.preventDefault(); dropZone.style.borderColor = '';
            const f = e.dataTransfer.files[0];
            if (f?.type === 'application/pdf') await processTextbook(f, courseId);
        };
        fileInput.onchange = async e => {
            if (e.target.files[0]) await processTextbook(e.target.files[0], courseId);
        };
    }

    async function processTextbook(file, courseId) {
        const prog   = document.getElementById('textbookProgress');
        const status = document.getElementById('textbookStatus');
        const fill   = document.getElementById('textbookProgressFill');
        prog.style.display = 'block'; status.textContent = 'Reading PDF…'; fill.style.width = '5%';

        try {
            const pdfjsLib = await import('pdfjs-dist');
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
            const pdf       = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
            const total     = pdf.numPages;
            const maxPages  = Math.min(total, 50);
            let   fullText  = '';

            for (let i = 1; i <= maxPages; i++) {
                const pg  = await pdf.getPage(i);
                const ct  = await pg.getTextContent();
                fullText += `\n--- PAGE ${i} ---\n${ct.items.map(it => it.str).join(' ')}`;
                fill.style.width = `${(i / maxPages) * 40}%`;
                if (i % 10 === 0) status.textContent = `Extracting page ${i}/${maxPages}…`;
            }

            status.textContent = 'AI detecting chapters…'; fill.style.width = '50%';

            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            const aiRes = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    messages: [{
                        role: 'user',
                        content: `Extract table of contents from this textbook excerpt.\n\n${fullText.substring(0, 12000)}\n\nReturn ONLY JSON: {"title":"...","chapters":[{"number":1,"title":"...","startPage":1}],"totalPages":${total}}`
                    }],
                    mode: 'quick', max_tokens: 1500,
                }),
            });
            const aiData = await aiRes.json();
            let metadata;
            try { metadata = JSON.parse(aiData.choices?.[0]?.message?.content || '{}'); }
            catch { metadata = { chapters: [] }; }

            status.textContent = 'Saving…'; fill.style.width = '80%';

            await db.textbooks.add({
                courseId, title: metadata.title || file.name,
                totalPages: total, chapters: metadata.chapters || [],
                rawText: fullText.substring(0, 50000),
                dateAdded: new Date().toISOString(),
            });

            // Save file blob
            const reader = new FileReader();
            reader.onload = async ev => {
                await db.files.add({
                    courseId, name: file.name, type: file.type, size: file.size,
                    data: ev.target.result, dateAdded: new Date().toISOString(),
                });
            };
            reader.readAsDataURL(file);

            // Also save as a material so study.js can load it
            await db.materials.add({
                courseId, topicId: null, type: 'Textbook',
                title: metadata.title || file.name,
                content: fullText.substring(0, 50000),
                dateAdded: new Date().toISOString(),
            });

            fill.style.width = '100%'; status.textContent = '✅ Ready!';

            // Show chapters
            if (metadata.chapters?.length > 0) {
                document.getElementById('chapterSelection').style.display = 'block';
                document.getElementById('chaptersList').innerHTML = metadata.chapters.map(ch => `
                    <div style="padding:10px;border-bottom:1px solid rgba(255,255,255,0.06);">
                        <strong>Chapter ${ch.number}: ${esc(ch.title)}</strong>
                        <button class="btn btn-sm btn-primary study-chapter-btn" data-chapter="${ch.number}" style="display:block;margin-top:6px;">Study Chapter ${ch.number}</button>
                    </div>
                `).join('');

                document.querySelectorAll('.study-chapter-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        // ── localStorage, not sessionStorage ──
                        goStudy(courseId, fullText.substring(0, 20000), `Chapter ${btn.dataset.chapter} — ${metadata.title || file.name}`);
                        document.getElementById('textbookModal').style.display = 'none';
                        navigateTo('study');
                    });
                });
            }

            document.getElementById('startLearningBtn').onclick = () => {
                goStudy(courseId, fullText.substring(0, 20000), metadata.title || file.name);
                document.getElementById('textbookModal').style.display = 'none';
                navigateTo('study');
            };

        } catch (err) {
            status.textContent = `❌ Error: ${err.message}`;
            console.error('[Library] processTextbook error:', err);
        }
    }

    // ============================================
    // COURSE DETAIL MODAL
    // ============================================
    async function showCourseDetail(courseId) {
        const course    = courses.find(c => c.id === courseId);
        if (!course) return;
        const topics    = await db.topics   .where('courseId').equals(courseId).toArray();
        const materials = await db.materials.where('courseId').equals(courseId).toArray();
        const files     = await db.files    .where('courseId').equals(courseId).toArray();
        const textbooks = await db.textbooks.where('courseId').equals(courseId).toArray();

        const modal   = document.getElementById('detailModal');
        const content = document.getElementById('detailContent');
        content.innerHTML = `
            <div class="modal-header">
                <div>
                    <h3>${esc(course.code)} — ${esc(course.name)}</h3>
                    <p style="color:var(--text2);font-size:12px;">${esc(course.lecturer || '')} ${course.examDate ? '· Exam: ' + new Date(course.examDate).toLocaleDateString('en-GB') : ''}</p>
                </div>
                <button class="modal-close" id="closeDetailModal">×</button>
            </div>
            <div class="modal-body">

                ${textbooks.length > 0 ? `
                    <div style="background:var(--gold-dim);border:1px solid var(--gold-border);border-radius:8px;padding:12px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
                        <div>
                            <div style="font-size:11px;color:var(--gold);font-weight:700;margin-bottom:2px;">TEXTBOOK</div>
                            <div style="font-weight:600;font-size:13px;">${esc(textbooks[0].title)}</div>
                        </div>
                        <button class="btn btn-sm btn-primary" id="continueTextbookBtn">Study This →</button>
                    </div>
                ` : ''}

                <!-- Topics -->
                <div class="detail-section">
                    <div class="detail-section-header">
                        <h4>Topics (${topics.length})</h4>
                        <button class="btn btn-sm btn-primary" id="addTopicBtn">+ Add</button>
                    </div>
                    <div id="topicList">
                        ${topics.length === 0
                            ? '<p style="color:var(--text3);font-size:12px;">No topics yet.</p>'
                            : topics.map(t => `
                                <div class="topic-item">
                                    <span class="mastery-dot" style="background:${t.masteryLevel > 3 ? 'var(--green)' : t.masteryLevel > 1 ? 'var(--gold)' : 'var(--text3)'};"></span>
                                    <span style="flex:1;">${esc(t.name)}</span>
                                    <span style="font-size:10px;color:var(--text3);">Lv ${t.masteryLevel || 0}/5</span>
                                    <button class="btn btn-sm btn-secondary delete-topic-btn" data-id="${t.id}" style="font-size:10px;">×</button>
                                </div>`).join('')}
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
                        <h4>Materials (${materials.length})</h4>
                        <button class="btn btn-sm btn-primary" id="addMaterialBtn">+ Add</button>
                    </div>
                    <div id="materialList">
                        ${materials.length === 0
                            ? '<p style="color:var(--text3);font-size:12px;">No materials yet.</p>'
                            : materials.map(m => `
                                <div class="material-item">
                                    <div class="material-type">${esc(m.type || 'Note')}</div>
                                    <div class="material-title">${esc(m.title)}</div>
                                    <div class="material-preview">${esc((m.content || '').substring(0, 120))}…</div>
                                    <button class="material-study-btn" data-matid="${m.id}">Study This</button>
                                    <button class="btn btn-sm btn-secondary delete-material-btn" data-id="${m.id}" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);font-size:10px;opacity:0;">×</button>
                                </div>`).join('')}
                    </div>
                    <div id="addMaterialForm" style="display:none;margin-top:12px;">
                        <select id="materialTopic" class="input" style="margin-bottom:6px;">
                            <option value="">Topic (optional)</option>
                            ${topics.map(t => `<option value="${t.id}">${esc(t.name)}</option>`).join('')}
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
                        <h4>Uploaded Files (${files.length})</h4>
                    </div>
                    ${files.length === 0
                        ? '<p style="color:var(--text3);font-size:12px;">No files uploaded.</p>'
                        : files.map(f => `
                            <div style="display:flex;align-items:center;gap:12px;padding:8px 10px;border-radius:6px;font-size:12px;">
                                <span style="font-weight:600;">${f.type?.startsWith('image/') ? 'Image' : f.type === 'application/pdf' ? 'PDF' : 'File'}</span>
                                <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${esc(f.name)}</span>
                                <span style="color:var(--text3);font-size:11px;">${formatSize(f.size)}</span>
                                <button class="btn btn-sm btn-secondary delete-file-btn" data-id="${f.id}" style="font-size:10px;">×</button>
                            </div>`).join('')}
                </div>
            </div>`;

        modal.style.display = 'flex';

        // Wire detail modal buttons
        document.getElementById('closeDetailModal')?.addEventListener('click', closeModals);

        document.getElementById('continueTextbookBtn')?.addEventListener('click', () => {
            goStudy(courseId, textbooks[0].rawText?.substring(0, 20000), textbooks[0].title);
            closeModals();
            navigateTo('study');
        });

        // Topics
        document.getElementById('addTopicBtn')?.addEventListener('click', () => {
            document.getElementById('addTopicForm').style.display = 'block';
            document.getElementById('newTopicName').focus();
        });
        document.getElementById('cancelTopicBtn')?.addEventListener('click', () => {
            document.getElementById('addTopicForm').style.display = 'none';
        });
        document.getElementById('saveTopicBtn')?.addEventListener('click', async () => {
            const name = document.getElementById('newTopicName').value.trim();
            if (name) { await db.topics.add({ courseId, name, masteryLevel: 0 }); showCourseDetail(courseId); }
        });
        document.querySelectorAll('.delete-topic-btn').forEach(btn => {
            btn.addEventListener('click', async () => { await db.topics.delete(parseInt(btn.dataset.id)); showCourseDetail(courseId); });
        });

        // Materials
        document.getElementById('addMaterialBtn')?.addEventListener('click', () => {
            document.getElementById('addMaterialForm').style.display = 'block';
        });
        document.getElementById('cancelMaterialBtn')?.addEventListener('click', () => {
            document.getElementById('addMaterialForm').style.display = 'none';
        });

        // Tabs
        document.querySelectorAll('.upload-tab-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.upload-tab-btn').forEach(b => { b.classList.remove('active'); b.style.cssText = ''; });
                this.classList.add('active');
                this.style.background = 'var(--gold-dim)'; this.style.color = 'var(--gold)';
                document.getElementById('pasteTab').style.display = this.dataset.tab === 'paste' ? 'block' : 'none';
                document.getElementById('fileTab').style.display  = this.dataset.tab === 'file'  ? 'block' : 'none';
                document.getElementById('voiceTab').style.display = this.dataset.tab === 'voice' ? 'block' : 'none';
            });
        });

        // File upload
        const dropZone  = document.getElementById('fileDropZone');
        const fileInput = document.getElementById('materialFile');
        if (dropZone) {
            dropZone.addEventListener('click', () => fileInput.click());
            dropZone.addEventListener('dragover',  e => { e.preventDefault(); dropZone.style.borderColor = 'var(--gold)'; });
            dropZone.addEventListener('dragleave', () => { dropZone.style.borderColor = ''; });
            dropZone.addEventListener('drop', e => { e.preventDefault(); dropZone.style.borderColor = ''; if (e.dataTransfer.files[0]) processUploadedFile(e.dataTransfer.files[0]); });
            fileInput.addEventListener('change', e => { if (e.target.files[0]) processUploadedFile(e.target.files[0]); });
        }

        async function processUploadedFile(file) {
            document.getElementById('filePreview').style.display = 'block';
            document.getElementById('filePreview').innerHTML = `<p style="font-size:13px;color:var(--text2);">📄 ${esc(file.name)} (${formatSize(file.size)})</p>`;
            document.getElementById('extractStatus').textContent = 'Processing…';
            document.getElementById('extractedContent').style.display = 'block';

            // Store file
            const reader = new FileReader();
            reader.onload = async ev => await db.files.add({ courseId, name: file.name, type: file.type, size: file.size, data: ev.target.result, dateAdded: new Date().toISOString() });
            reader.readAsDataURL(file);

            if (!document.getElementById('materialTitle').value)
                document.getElementById('materialTitle').value = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');

            if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
                try {
                    const pdfjsLib = await import('pdfjs-dist');
                    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
                    const pdf  = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
                    let text = '';
                    const max = Math.min(pdf.numPages, 50);
                    for (let i = 1; i <= max; i++) {
                        const pg = await pdf.getPage(i);
                        const ct = await pg.getTextContent();
                        text += ct.items.map(it => it.str).join(' ') + '\n';
                        if (i % 10 === 0) document.getElementById('extractStatus').textContent = `Page ${i}/${max}…`;
                    }
                    document.getElementById('extractedContent').value = text;
                    document.getElementById('extractStatus').textContent = `✅ ${text.length.toLocaleString()} characters extracted.`;
                } catch (err) {
                    document.getElementById('extractStatus').textContent = '❌ Could not read PDF. Try an image scan.';
                }
            } else if (file.type.startsWith('image/')) {
                try {
                    const base64 = await fileToBase64(file);
                    document.getElementById('extractStatus').textContent = 'AI analyzing image…';
                    const { data: { session } } = await supabase.auth.getSession();
                    const token = session?.access_token;
                    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify({ messages: [{ role: 'user', content: [{ type: 'text', text: 'Extract ALL text, labels, numbers, formulas, chart data, and describe everything visible in this image. Be exhaustive.' }, { type: 'image_url', image_url: { url: base64 } }] }], mode: 'quick', max_tokens: 2500 }),
                    });
                    const data = await res.json();
                    const extracted = data.choices?.[0]?.message?.content || '';
                    document.getElementById('extractedContent').value = extracted;
                    document.getElementById('extractStatus').textContent = `✅ ${extracted.length.toLocaleString()} characters extracted.`;
                } catch {
                    document.getElementById('extractStatus').textContent = '❌ Image analysis failed. Describe manually.';
                }
            } else {
                const text = await file.text();
                document.getElementById('extractedContent').value = text;
                document.getElementById('extractStatus').textContent = `✅ ${text.length.toLocaleString()} characters loaded.`;
            }
        }

        // Voice
        let isRecording = false;
        document.getElementById('startDictationBtn')?.addEventListener('click', () => {
            const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SR) { alert('Voice not supported. Try Chrome.'); return; }
            if (isRecording) { isRecording = false; document.getElementById('startDictationBtn').textContent = '🎤'; return; }
            const rec = new SR();
            rec.lang = 'en-US'; rec.continuous = true; rec.interimResults = true;
            rec.onresult = e => {
                let t = '';
                for (let i = e.resultIndex; i < e.results.length; i++) t += e.results[i][0].transcript;
                document.getElementById('dictatedContent').value = t;
            };
            rec.onerror = () => { isRecording = false; document.getElementById('startDictationBtn').textContent = '🎤'; };
            rec.start(); isRecording = true;
            document.getElementById('startDictationBtn').textContent = '⏹';
            document.getElementById('dictationStatus').textContent = 'Listening…';
            setTimeout(() => { if (isRecording) { rec.stop(); isRecording = false; document.getElementById('startDictationBtn').textContent = '🎤'; document.getElementById('dictationStatus').textContent = 'Done. Edit and save.'; } }, 60000);
        });

        // Save material
        document.getElementById('saveMaterialBtn')?.addEventListener('click', async () => {
            const title = document.getElementById('materialTitle').value.trim();
            const activeTab = document.querySelector('.upload-tab-btn.active');
            let content = '';
            if (activeTab?.dataset.tab === 'file')  content = document.getElementById('extractedContent').value.trim();
            else if (activeTab?.dataset.tab === 'voice') content = document.getElementById('dictatedContent').value.trim();
            else content = document.getElementById('materialContent').value.trim();
            if (!title)   { alert('Enter a title.'); return; }
            if (!content) { alert('Add some content.'); return; }
            await db.materials.add({
                courseId,
                topicId:  document.getElementById('materialTopic').value || null,
                type:     document.getElementById('materialType').value,
                title, content, dateAdded: new Date().toISOString(),
            });
            showCourseDetail(courseId);
        });

        // Study material buttons — localStorage ──
        document.querySelectorAll('.material-study-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const mat = await db.materials.get(parseInt(btn.dataset.matid));
                if (mat) {
                    goStudy(courseId, mat.content, mat.title);
                    closeModals();
                    navigateTo('study');
                }
            });
        });

        document.querySelectorAll('.delete-material-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (confirm('Delete this material?')) { await db.materials.delete(parseInt(btn.dataset.id)); showCourseDetail(courseId); }
            });
        });
        document.querySelectorAll('.delete-file-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (confirm('Delete this file?')) { await db.files.delete(parseInt(btn.dataset.id)); showCourseDetail(courseId); }
            });
        });
    }

    function closeModals() {
        document.querySelectorAll('.modal-overlay').forEach(o => o.style.display = 'none');
        stopCamera();
    }

    render();
}