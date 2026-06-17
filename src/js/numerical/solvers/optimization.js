export function minimize(f, a, b, tolerance = 1e-6) {
    // Golden section search for minimum
    const phi = (Math.sqrt(5) - 1) / 2; // Golden ratio conjugate
    
    let c = b - phi * (b - a);
    let d = a + phi * (b - a);
    
    while (Math.abs(c - d) > tolerance) {
        if (f(c) < f(d)) {
            b = d;
        } else {
            a = c;
        }
        c = b - phi * (b - a);
        d = a + phi * (b - a);
    }
    
    const xMin = (a + b) / 2;
    return { x: xMin, f: f(xMin), iterations: Math.floor(Math.log(tolerance / (b - a)) / Math.log(phi)) };
}

export function maximize(f, a, b, tolerance = 1e-6) {
    // Maximize by minimizing -f
    const result = minimize((x) => -f(x), a, b, tolerance);
    return { x: result.x, f: -result.f, iterations: result.iterations };
}

export function gradientDescent(f, gradient, start, learningRate = 0.01, maxIterations = 1000, tolerance = 1e-6) {
    let x = start;
    let iter = 0;
    
    while (iter < maxIterations) {
        const grad = gradient(x);
        const xNew = x.map((xi, i) => xi - learningRate * grad[i]);
        
        // Check convergence
        let diff = 0;
        for (let i = 0; i < x.length; i++) {
            diff += Math.pow(xNew[i] - x[i], 2);
        }
        if (Math.sqrt(diff) < tolerance) break;
        
        x = xNew;
        iter++;
    }
    
    return { x, f: f(x), iterations: iter };
}

export function newtonMethod(f, df, x0, tolerance = 1e-6, maxIterations = 100) {
    let x = x0;
    let iter = 0;
    
    while (iter < maxIterations) {
        const fx = f(x);
        const dfx = df(x);
        
        if (Math.abs(dfx) < tolerance) break;
        
        const xNew = x - fx / dfx;
        
        if (Math.abs(xNew - x) < tolerance) {
            return { x: xNew, f: f(xNew), iterations: iter + 1 };
        }
        
        x = xNew;
        iter++;
    }
    
    return { x, f: f(x), iterations: iter };
}