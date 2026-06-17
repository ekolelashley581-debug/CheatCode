export function detectVisualType(text) {
    if (!text) return null;
    
    const t = text.toLowerCase();
    
    // 2D plots
    if (t.match(/line|plot|graph|curve|function/i)) {
        return { type: 'line_plot', engine: 'matplotlib' };
    }
    
    if (t.match(/bar|histogram|distribution|frequency/i)) {
        return { type: 'bar_chart', engine: 'matplotlib' };
    }
    
    if (t.match(/scatter|points|data points|correlation/i)) {
        return { type: 'scatter_plot', engine: 'matplotlib' };
    }
    
    // Heat maps and contours
    if (t.match(/heat|temperature|contour|density|gradient/i)) {
        return { type: 'heat_map', engine: 'matplotlib' };
    }
    
    // 3D
    if (t.match(/3d|three d|surface|3 dimensional|rotate/i)) {
        return { type: 'surface_3d', engine: 'threejs' };
    }
    
    // Engineering diagrams
    if (t.match(/beam|bending|moment|shear|bmd|sfd|deflection/i)) {
        return { type: 'beam_diagram', engine: 'canvas' };
    }
    
    if (t.match(/truss|frame|structure|member|joint/i)) {
        return { type: 'truss_diagram', engine: 'canvas' };
    }
    
    if (t.match(/stress|strain|mohr|circle|principal/i)) {
        return { type: 'mohr_circle', engine: 'canvas' };
    }
    
    // Generic
    if (t.match(/visual|diagram|chart|graph|plot|show me/i)) {
        return { type: 'generic', engine: 'matplotlib' };
    }
    
    return null;
}

export function extractParameters(text, visualType) {
    const t = text.toLowerCase();
    const params = {};
    
    // Extract numbers (potential data points)
    const numbers = t.match(/\d+(?:\.\d+)?/g) || [];
    if (numbers.length > 0) params.numbers = numbers.map(Number);
    
    // Extract ranges
    const rangeMatch = t.match(/from\s+(\d+(?:\.\d+)?)\s+to\s+(\d+(?:\.\d+)?)/i);
    if (rangeMatch) {
        params.range = [parseFloat(rangeMatch[1]), parseFloat(rangeMatch[2])];
    }
    
    // Extract function expression (simple)
    const functionMatch = t.match(/(?:function|equation|expression|formula)?\s*[yf]\s*=\s*([^,.]+)/i);
    if (functionMatch) {
        params.function = functionMatch[1].trim();
    }
    
    return params;
}