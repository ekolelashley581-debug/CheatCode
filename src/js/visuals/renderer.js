import { detectVisualType, extractParameters } from './intent-parser.js';
import { generateMatplotlibCode } from './code-generator.js';
import { generatePlot, isPyodideReady, initPyodide } from '../numerical/pyodide-init.js';

let visualPanelVisible = false;
let currentVisualPanel = null;

export async function renderVisual(containerId, userQuery, aiResponse = null) {
    const container = document.getElementById(containerId);
    if (!container) return null;
    
    // Show loading
    container.style.display = 'block';
    container.innerHTML = `
        <div style="padding: 20px; text-align: center;">
            <div style="margin-bottom: 12px;">🔍 Generating visualization...</div>
            <div style="width: 40px; height: 40px; border: 3px solid rgba(212,160,0,0.3); border-top-color: #d4a000; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
        </div>
        <style>
            @keyframes spin { to { transform: rotate(360deg); } }
        </style>
    `;
    
    try {
        // Initialize Pyodide if needed
        if (!isPyodideReady()) {
            container.innerHTML = '<div style="padding: 20px; text-align: center;">Loading Python engine... This may take a moment.</div>';
            await initPyodide();
        }
        
        // Detect visual type
        const visualType = detectVisualType(userQuery);
        const params = extractParameters(userQuery, visualType);
        
        // Generate Python code
        const pythonCode = generateMatplotlibCode(visualType?.type || 'generic', params);
        
        // Generate plot
        const result = await generatePlot(pythonCode);
        
        if (result.success && result.imageData) {
            container.innerHTML = `
                <div style="border-top: 2px solid #d4a000; background: #1e1e2a; border-radius: 8px; overflow: hidden;">
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 16px; background: #2a2a35; border-bottom: 1px solid rgba(255,255,255,0.1);">
                        <span style="font-size: 12px; color: #d4a000;">📊 Visualization</span>
                        <div style="display: flex; gap: 8px;">
                            <button class="close-visual-btn" style="background: none; border: none; color: #888; cursor: pointer; padding: 4px 8px;">✕ Close</button>
                        </div>
                    </div>
                    <div style="padding: 16px; text-align: center;">
                        <img src="${result.imageData}" style="max-width: 100%; border-radius: 4px;" alt="Visualization">
                    </div>
                </div>
            `;
            
            // Add close button handler
            container.querySelector('.close-visual-btn')?.addEventListener('click', () => {
                container.style.display = 'none';
            });
            
            currentVisualPanel = { container, type: visualType, params };
            return result.imageData;
        } else {
            container.innerHTML = `
                <div style="padding: 16px; background: rgba(239,68,68,0.1); border-left: 3px solid #ef4444; border-radius: 8px;">
                    <strong style="color: #ef4444;">Could not generate visualization</strong>
                    <p style="margin-top: 8px; font-size: 12px; color: #888;">${result.error || 'Unknown error'}</p>
                </div>
            `;
            return null;
        }
    } catch (err) {
        console.error('Visual render error:', err);
        container.innerHTML = `
            <div style="padding: 16px; background: rgba(239,68,68,0.1); border-left: 3px solid #ef4444; border-radius: 8px;">
                <strong style="color: #ef4444;">Visualization failed</strong>
                <p style="margin-top: 8px; font-size: 12px; color: #888;">${err.message}</p>
            </div>
        `;
        return null;
    }
}

export function hideVisualPanel() {
    if (currentVisualPanel?.container) {
        currentVisualPanel.container.style.display = 'none';
    }
}