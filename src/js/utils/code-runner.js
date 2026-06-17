// src/js/utils/code-runner.js

export async function runCodeInSandbox(code, language = 'javascript') {
    return new Promise((resolve) => {
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.top = '-9999px';
        iframe.style.left = '-9999px';
        iframe.style.width = '800px';
        iframe.style.height = '600px';
        document.body.appendChild(iframe);
        
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { background: #1e1e2e; color: #e0e0e0; font-family: monospace; padding: 20px; margin: 0; }
                    pre { background: #0a0a0f; padding: 15px; border-radius: 8px; overflow-x: auto; white-space: pre-wrap; word-wrap: break-word; }
                    .error { color: #ef4444; }
                    .success { color: #10b981; }
                </style>
            </head>
            <body>
                <div id="output"></div>
                <script>
                    try {
                        ${language === 'javascript' ? code : ''}
                        document.getElementById('output').innerHTML = '<div class="success">✓ Code executed successfully</div>';
                    } catch(e) {
                        document.getElementById('output').innerHTML = '<div class="error">✗ Error: ' + e.message + '</div>';
                    }
                <\/script>
            </body>
            </html>
        `;
        
        iframe.srcdoc = html;
        
        setTimeout(() => {
            const output = iframe.contentDocument?.body?.innerHTML || '';
            document.body.removeChild(iframe);
            resolve(output);
        }, 500);
    });
}