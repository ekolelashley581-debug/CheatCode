// src/js/sessions/session-export.js

export async function exportSessionToPDF(messages, sessionTitle, teachingMode, guidanceTool, visuals = []) {
    if (!messages || messages.length === 0) {
        alert('Nothing to export.');
        return;
    }
    
    // Show loading
    const loadingToast = showToast('Generating PDF...', 'info', 0);
    
    try {
        // Dynamically import html2pdf.js
        const { default: html2pdf } = await import('https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js');
        
        const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
        const time = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        
        // Create export HTML
        const exportHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>CheatCode Study Session</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body {
                        font-family: 'Georgia', 'Times New Roman', serif;
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 40px 24px;
                        color: #1a1a1a;
                        line-height: 1.6;
                    }
                    .cover {
                        text-align: center;
                        padding: 60px 0;
                        border-bottom: 2px solid #d4a000;
                        margin-bottom: 40px;
                    }
                    .cover h1 { font-size: 28px; color: #d4a000; margin-bottom: 8px; }
                    .cover .meta { color: #666; font-size: 12px; margin-bottom: 20px; }
                    .stats {
                        display: flex;
                        justify-content: center;
                        gap: 40px;
                        margin-top: 20px;
                        font-size: 11px;
                        color: #888;
                    }
                    .msg {
                        margin: 24px 0;
                        padding: 16px 20px;
                        border-radius: 8px;
                        page-break-inside: avoid;
                    }
                    .msg-user {
                        background: #f8f8f8;
                        border-left: 3px solid #ccc;
                    }
                    .msg-assistant {
                        background: #fffdf5;
                        border-left: 3px solid #d4a000;
                    }
                    .msg-label {
                        font-size: 10px;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        color: #999;
                        margin-bottom: 8px;
                        font-weight: 700;
                    }
                    .msg-content {
                        font-size: 12px;
                        line-height: 1.6;
                    }
                    .visual {
                        margin: 24px 0;
                        padding: 16px;
                        border: 1px solid #ddd;
                        border-radius: 8px;
                        background: #fafafa;
                        page-break-inside: avoid;
                        text-align: center;
                    }
                    .visual h3 {
                        font-size: 13px;
                        color: #d4a000;
                        margin-bottom: 12px;
                    }
                    .visual-placeholder {
                        background: #eee;
                        padding: 40px;
                        text-align: center;
                        color: #999;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 40px;
                        padding-top: 20px;
                        border-top: 1px solid #eee;
                        color: #999;
                        font-size: 10px;
                    }
                    @media print {
                        body { padding: 0; }
                        .msg { page-break-inside: avoid; }
                    }
                </style>
            </head>
            <body>
                <div class="cover">
                    <h1>CheatCode Study Session</h1>
                    <p class="meta">${escapeHtml(date)} at ${escapeHtml(time)}</p>
                    <div class="stats">
                        <span>Session: ${escapeHtml(sessionTitle)}</span>
                        <span>Mode: ${escapeHtml(teachingMode)}</span>
                        ${guidanceTool ? `<span>Tool: ${escapeHtml(guidanceTool)}</span>` : ''}
                        <span>${messages.length} messages</span>
                    </div>
                </div>
                
                ${messages.map(msg => `
                    <div class="msg ${msg.role === 'user' ? 'msg-user' : 'msg-assistant'}">
                        <div class="msg-label">${msg.role === 'user' ? 'You' : 'CheatCode'}</div>
                        <div class="msg-content">${escapeHtml(msg.content).replace(/\n/g, '<br>')}</div>
                    </div>
                `).join('')}
                
                ${visuals && visuals.length > 0 ? `
                    <div class="visual">
                        <h3>📊 Visualization</h3>
                        <div class="visual-placeholder">[Visualization was generated during the session]</div>
                    </div>
                ` : ''}
                
                <div class="footer">
                    <p>Generated by CheatCode — ${escapeHtml(date)}</p>
                </div>
            </body>
            </html>
        `;
        
        // Create temporary element and generate PDF
        const element = document.createElement('div');
        element.innerHTML = exportHtml;
        document.body.appendChild(element);
        
        await html2pdf().set({
            margin: [10, 10, 10, 10],
            filename: `CheatCode-Session-${new Date().toISOString().slice(0, 10)}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, letterRendering: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        }).from(element).save();
        
        element.remove();
        showToast('PDF exported successfully!', 'success', 3000);
        
    } catch (error) {
        console.error('PDF export error:', error);
        // Fallback to print method
        fallbackPrintExport(messages, sessionTitle, teachingMode, guidanceTool);
    }
}

function fallbackPrintExport(messages, sessionTitle, teachingMode, guidanceTool) {
    const printWindow = window.open('', '_blank');
    const date = new Date().toLocaleDateString();
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head><title>CheatCode Study Session</title>
        <style>
            body { font-family: Georgia, serif; max-width: 800px; margin: 0 auto; padding: 40px; }
            .cover { text-align: center; border-bottom: 2px solid #d4a000; margin-bottom: 40px; }
            .msg { margin: 20px 0; padding: 12px; border-left: 3px solid #d4a000; }
            .msg-user { background: #f5f5f5; }
        </style>
        </head>
        <body>
            <div class="cover"><h1>CheatCode Study Session</h1><p>${date}</p></div>
            ${messages.map(msg => `<div class="msg ${msg.role === 'user' ? 'msg-user' : ''}"><strong>${msg.role === 'user' ? 'You' : 'AI'}:</strong><br>${msg.content.replace(/\n/g, '<br>')}</div>`).join('')}
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

function showToast(message, type, duration = 3000) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#f5b042'};
        color: ${type === 'success' ? 'white' : 'black'};
        border-radius: 8px;
        z-index: 10000;
        font-size: 13px;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), duration);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}