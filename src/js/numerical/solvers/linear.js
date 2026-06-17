export function solveLinear(a, b) {
    // Solve ax + b = 0
    if (a === 0) {
        if (b === 0) return { type: 'infinite', message: 'All real numbers' };
        return { type: 'none', message: 'No solution' };
    }
    const x = -b / a;
    return { type: 'unique', solution: x, equation: `${a}x + ${b} = 0 → x = ${x}` };
}

export function solveQuadratic(a, b, c) {
    // Solve ax² + bx + c = 0
    if (a === 0) return solveLinear(b, c);
    
    const discriminant = b * b - 4 * a * c;
    
    if (discriminant < 0) {
        const real = -b / (2 * a);
        const imag = Math.sqrt(-discriminant) / (2 * a);
        return {
            type: 'complex',
            solutions: [`${real} + ${imag}i`, `${real} - ${imag}i`],
            discriminant
        };
    }
    
    const sqrtD = Math.sqrt(discriminant);
    const x1 = (-b + sqrtD) / (2 * a);
    const x2 = (-b - sqrtD) / (2 * a);
    
    return {
        type: 'real',
        solutions: x1 === x2 ? [x1] : [x1, x2],
        discriminant,
        equation: `${a}x² + ${b}x + ${c} = 0`
    };
}

export function solveSystem(coefficients, constants) {
    // Solve system of linear equations using matrix method
    // coefficients: 2D array [[a,b],[c,d]] for ax + by = e, cx + dy = f
    // constants: [e, f]
    
    const n = coefficients.length;
    const det = coefficients[0][0] * coefficients[1][1] - coefficients[0][1] * coefficients[1][0];
    
    if (Math.abs(det) < 1e-10) {
        return { type: 'singular', message: 'System has no unique solution' };
    }
    
    const detX = constants[0] * coefficients[1][1] - coefficients[0][1] * constants[1];
    const detY = coefficients[0][0] * constants[1] - constants[0] * coefficients[1][0];
    
    const x = detX / det;
    const y = detY / det;
    
    return {
        type: 'unique',
        solutions: { x, y },
        method: 'Cramer\'s Rule',
        determinant: det
    };
}