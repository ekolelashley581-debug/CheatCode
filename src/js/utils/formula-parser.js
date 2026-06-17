// src/js/utils/formula-parser.js

export function extractFormulas(text) {
    if (!text) return [];
    
    const formulas = [];
    
    // Match common formula patterns: variable = expression
    const formulaRegex = /([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*([^=\n]+)/g;
    let match;
    while ((match = formulaRegex.exec(text)) !== null) {
        formulas.push({
            variable: match[1].trim(),
            expression: match[2].trim(),
            raw: match[0]
        });
    }
    
    // Match equations with no assignment: expression = expression
    const equationRegex = /([^=]+)\s*=\s*([^\n]+)/g;
    while ((match = equationRegex.exec(text)) !== null) {
        if (!formulas.find(f => f.raw === match[0])) {
            formulas.push({
                variable: null,
                expression: match[0].trim(),
                raw: match[0]
            });
        }
    }
    
    return formulas;
}

export function evaluateFormula(formula, variables) {
    try {
        let expression = formula;
        for (const [key, value] of Object.entries(variables)) {
            const regex = new RegExp(`\\b${key}\\b`, 'g');
            expression = expression.replace(regex, value);
        }
        // Basic math operations only - safe evaluation
        const safeExpr = expression.replace(/[^0-9+\-*/()%^.]/g, '');
        if (safeExpr !== expression) return null;
        return Function('"use strict";return (' + safeExpr + ')')();
    } catch (e) {
        return null;
    }
}