// src/js/visuals/full-page-visual.js

export function enterFullPageVisual(htmlCode, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: #07070f;
        z-index: 10000;
        display: flex;
        flex-direction: column;
    `;
    
    overlay.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 20px;background:#1a1a2a;border-bottom:1px solid rgba(255,255,255,0.1);">
            <span style="color:#d4a000;font-weight:600;">Full Screen Visualization</span>
            <button id="closeFullscreenBtn" style="background:none;border:none;color:#888;cursor:pointer;font-size:16px;">✕ Close</button>
        </div>
        <iframe style="flex:1;width:100%;border:none;background:#fff;"></iframe>
    `;
    
    document.body.appendChild(overlay);
    
    const iframe = overlay.querySelector('iframe');
    if (iframe && htmlCode) {
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        doc.open();
        doc.write(htmlCode);
        doc.close();
    }
    
    overlay.querySelector('#closeFullscreenBtn')?.addEventListener('click', () => {
        overlay.remove();
    });
}