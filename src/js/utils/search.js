// src/js/utils/search.js

export function searchMaterials(materials, query) {
    if (!materials || !materials.length || !query) return [];
    
    const q = query.toLowerCase();
    const terms = q.split(/\s+/).filter(t => t.length > 2);
    
    const scored = materials.map(material => {
        let score = 0;
        const content = (material.title + ' ' + (material.content || '')).toLowerCase();
        
        // Exact phrase match (highest score)
        if (content.includes(q)) score += 100;
        
        // Individual term matches
        for (const term of terms) {
            const count = (content.match(new RegExp(term, 'g')) || []).length;
            score += count * 10;
        }
        
        // Title matches are weighted higher
        const titleLower = (material.title || '').toLowerCase();
        if (titleLower.includes(q)) score += 50;
        
        return { material, score };
    });
    
    return scored.filter(s => s.score > 0).sort((a, b) => b.score - a.score).slice(0, 5);
}

export function extractKeywords(text) {
    if (!text) return [];
    
    const words = text.toLowerCase().split(/\W+/);
    const stopWords = new Set([
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
        'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
        'having', 'do', 'does', 'did', 'doing', 'but', 'so', 'if', 'then', 'else', 'when',
        'where', 'which', 'what', 'who', 'whom', 'this', 'that', 'these', 'those', 'it',
        'they', 'we', 'you', 'he', 'she', 'it', 'them', 'us'
    ]);
    
    const freq = {};
    for (const word of words) {
        if (word.length < 3) continue;
        if (stopWords.has(word)) continue;
        freq[word] = (freq[word] || 0) + 1;
    }
    
    return Object.entries(freq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([word]) => word);
}