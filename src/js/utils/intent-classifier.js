// src/js/utils/intent-classifier.js

export function classifyIntent(question) {
    if (!question) return { type: 'unknown', confidence: 0 };
    
    const q = question.toLowerCase();
    
    // Definition questions
    if (q.match(/^(what is|define|what do you mean by|explain what is)/i)) {
        return { type: 'definition', confidence: 0.9 };
    }
    
    // How-to questions
    if (q.match(/^(how to|how do i|how can i|steps to)/i)) {
        return { type: 'howto', confidence: 0.85 };
    }
    
    // Numerical calculation
    if (q.match(/[0-9]+.*[+\-*/=]|[+\-*/=].*[0-9]+|solve|calculate|compute|find the value/i)) {
        return { type: 'numerical', confidence: 0.8 };
    }
    
    // Formula questions
    if (q.match(/formula|equation|what is the formula|write the formula/i)) {
        return { type: 'formula', confidence: 0.85 };
    }
    
    // Comparison questions
    if (q.match(/difference between|compare|versus|vs/i)) {
        return { type: 'comparison', confidence: 0.8 };
    }
    
    // Visualization request
    if (q.match(/visualize|show me|draw|diagram|plot|graph|3d|2d|chart|heatmap|surface|beam|bmd|sfd|mohr/i)) {
        return { type: 'visualization', confidence: 0.85 };
    }
    
    // Practice/problem generation
    if (q.match(/generate|create|make|practice|problem|exercise|quiz me|test me/i)) {
        return { type: 'practice', confidence: 0.75 };
    }
    
    // Explanation request
    if (q.match(/explain|tell me about|describe|what do you know about/i)) {
        return { type: 'explanation', confidence: 0.8 };
    }
    
    return { type: 'general', confidence: 0.5 };
}