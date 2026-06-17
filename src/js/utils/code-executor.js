// src/js/utils/code-executor.js

export async function executePython(code) {
    // Use Pyodide to execute Python code
    const pyodide = await initPyodide();
    try {
        const result = await pyodide.runPythonAsync(`
import sys
from io import StringIO
import matplotlib
matplotlib.use('AGG')
import matplotlib.pyplot as plt
import numpy as np
import base64
from io import BytesIO

${code}

# Capture plot if exists
buffer = BytesIO()
plt.savefig(buffer, format='png', dpi=100)
buffer.seek(0)
image_base64 = base64.b64encode(buffer.read()).decode()
plt.close()

image_base64
        `);
        return { success: true, image: `data:image/png;base64,${result}`, output: '' };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

export async function executeJavaScript(code) {
    return new Promise((resolve) => {
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.top = '-9999px';
        iframe.style.left = '-9999px';
        document.body.appendChild(iframe);
        
        const html = `
            <!DOCTYPE html>
            <html>
            <head><style>body{background:#07070f;color:#e8e8f0;}</style></head>
            <body>
                <div id="output"></div>
                <script>
                    try {
                        ${code}
                    } catch(e) {
                        document.getElementById('output').innerHTML = '<div style="color:red">Error: ' + e.message + '</div>';
                    }
                <\/script>
            </body>
            </html>
        `;
        
        iframe.srcdoc = html;
        
        setTimeout(() => {
            const output = iframe.contentDocument?.body?.innerHTML || '';
            document.body.removeChild(iframe);
            resolve({ success: true, output });
        }, 500);
    });
}