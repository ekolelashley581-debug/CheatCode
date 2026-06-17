import { detectVisualType, extractParameters } from './intent-parser.js';
import { generateMatplotlibCode, generateThreeJSCode, generateCanvasCode } from './code-generator.js';
import { renderVisual, hideVisualPanel } from './renderer.js';
import { initNumericalEngine, isEngineReady, generators } from '../numerical/index.js';

let visualEngineReady = false;

export async function initVisualEngine() {
    if (visualEngineReady) return true;
    visualEngineReady = await initNumericalEngine();
    return visualEngineReady;
}

export async function visualize(userQuery, containerId, contextData = {}) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('Container not found:', containerId);
        return null;
    }
    
    // Detect what type of visual the user wants
    const visualType = detectVisualType(userQuery);
    const params = extractParameters(userQuery, visualType);
    
    // Merge with context data (from user's uploaded materials)
    Object.assign(params, contextData);
    
    // Route to appropriate generator
    let result = null;
    
    if (visualType?.engine === 'matplotlib') {
        result = await renderMatplotlibVisual(visualType.type, params, container);
    } else if (visualType?.engine === 'threejs') {
        result = await renderThreeJSVisual(visualType.type, params, container);
    } else if (visualType?.engine === 'canvas') {
        result = await renderCanvasVisual(visualType.type, params, container);
    } else {
        // Fallback to generic matplotlib
        result = await renderMatplotlibVisual('generic', params, container);
    }
    
    return result;
}

async function renderMatplotlibVisual(type, params, container) {
    if (!isEngineReady()) {
        await initVisualEngine();
    }
    
    const code = generateMatplotlibCode(type, params);
    const result = await renderVisual(container.id, code);
    return result;
}

async function renderThreeJSVisual(type, params, container) {
    // For Three.js visuals, we generate HTML/JS code
    const code = generateThreeJSCode(type, params);
    const result = await renderVisual(container.id, code, 'html');
    return result;
}

async function renderCanvasVisual(type, params, container) {
    // For custom canvas visuals (engineering diagrams)
    const code = generateCanvasCode(type, params);
    const result = await renderVisual(container.id, code, 'canvas');
    return result;
}

export function getAvailableVisuals() {
    return {
        matplotlib: ['line_plot', 'bar_chart', 'scatter_plot', 'heat_map', 'histogram', 'pie_chart'],
        threejs: ['surface_3d', 'particle_system', 'molecule', 'lattice'],
        canvas: ['beam_diagram', 'truss_diagram', 'mohr_circle', 'free_body']
    };
}

export { hideVisualPanel };