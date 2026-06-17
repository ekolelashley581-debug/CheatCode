// src/js/utils/message-cleaner.js

export function cleanMessage(content) {
    if (!content) return { cleaned: '', visuals: [] };
    
    let cleaned = content;
    const visuals = [];
    
    // Extract HTML code blocks
    const htmlRegex = /```html\s*([\s\S]*?)```/g;
    let match;
    while ((match = htmlRegex.exec(content)) !== null) {
        if (match[1] && match[1].trim()) {
            visuals.push(match[1].trim());
        }
    }
    
    // Remove HTML code blocks from cleaned text
    cleaned = cleaned.replace(/```html\s*([\s\S]*?)```/g, '');
    
    // Remove any other code blocks
    cleaned = cleaned.replace(/```[\s\S]*?```/g, '');
    
    // Remove inline code markers but keep text
    cleaned = cleaned.replace(/`([^`]+)`/g, '$1');
    
    // Convert LaTeX to readable text (if MathJax not available)
    cleaned = cleaned.replace(/\\\[(.*?)\\\]/g, '[$1]');
    cleaned = cleaned.replace(/\\\((.*?)\\\)/g, '($1)');
    cleaned = cleaned.replace(/\$\$(.*?)\$\$/g, '[$1]');
    cleaned = cleaned.replace(/\$(.*?)\$/g, '($1)');
    
    // Clean up multiple newlines
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    
    // Remove markdown bold/italic markers
    cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, '$1');
    cleaned = cleaned.replace(/\*(.*?)\*/g, '$1');
    cleaned = cleaned.replace(/---+/g, '');
    
    return {
        cleaned: cleaned.trim(),
        visuals: visuals
    };
}

export function hasVisualization(content) {
    if (!content) return false;
    return content.includes('```html') || content.includes('<!DOCTYPE html');
}

export function extractVisualType(content) {
    if (!content) return null;
    const lower = content.toLowerCase();
    if (lower.includes('chart') || lower.includes('graph') || lower.includes('plot')) return 'chart';
    if (lower.includes('3d') || lower.includes('three')) return '3d';
    if (lower.includes('beam') || lower.includes('bmd')) return 'engineering';
    return null;
}