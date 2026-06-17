// src/js/numerical/pyodide-init.js

let pyodideInstance = null;
let isLoading = false;
let loadPromise = null;

export async function initPyodide() {
    if (pyodideInstance) return pyodideInstance;
    if (loadPromise) return loadPromise;
    
    isLoading = true;
    loadPromise = (async () => {
        try {
            console.log('Loading Pyodide...');
            
            // Correct way to load Pyodide
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.1/full/pyodide.js';
            document.head.appendChild(script);
            
            await new Promise((resolve) => {
                script.onload = resolve;
            });
            
            // Wait for loadPyodide to be available
            await new Promise((resolve) => {
                const checkInterval = setInterval(() => {
                    if (window.loadPyodide) {
                        clearInterval(checkInterval);
                        resolve();
                    }
                }, 100);
            });
            
            pyodideInstance = await window.loadPyodide({
                indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.1/full/'
            });
            
            console.log('Loading NumPy...');
            await pyodideInstance.loadPackage('numpy');
            
            console.log('Pyodide ready!');
            return pyodideInstance;
        } catch (err) {
            console.error('Failed to load Pyodide:', err);
            throw err;
        } finally {
            isLoading = false;
        }
    })();
    
    return loadPromise;
}

export async function runPython(code) {
    const pyodide = await initPyodide();
    try {
        const result = await pyodide.runPythonAsync(code);
        return { success: true, result: result?.toJs ? result.toJs() : result };
    } catch (err) {
        console.error('Python error:', err);
        return { success: false, error: err.message };
    }
}

export async function generatePlot(code) {
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

# Capture plot as base64
buffer = BytesIO()
plt.savefig(buffer, format='png', dpi=100, bbox_inches='tight')
buffer.seek(0)
image_base64 = base64.b64encode(buffer.read()).decode()
plt.close()

image_base64
        `);
        return { success: true, imageData: `data:image/png;base64,${result}` };
    } catch (err) {
        console.error('Plot generation error:', err);
        return { success: false, error: err.message };
    }
}

export function isPyodideReady() {
    return pyodideInstance !== null;
}