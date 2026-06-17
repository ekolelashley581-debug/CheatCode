export function derivative(f, x, h = 1e-5) {
    // Numerical derivative using central difference
    return (f(x + h) - f(x - h)) / (2 * h);
}

export function integral(f, a, b, n = 1000) {
    // Numerical integration using Simpson's rule
    if (n % 2 !== 0) n++;
    const h = (b - a) / n;
    let sum = f(a) + f(b);
    
    for (let i = 1; i < n; i++) {
        const x = a + i * h;
        sum += (i % 2 === 0) ? 2 * f(x) : 4 * f(x);
    }
    
    return (h / 3) * sum;
}

export function odeSolve(derivativeFunc, y0, tSpan, steps = 100) {
    // Euler method for ODE solving
    // dy/dt = f(t, y), y(t0) = y0
    const [t0, t1] = tSpan;
    const h = (t1 - t0) / steps;
    const t = Array(steps + 1).fill(0);
    const y = Array(steps + 1).fill(0);
    
    t[0] = t0;
    y[0] = y0;
    
    for (let i = 0; i < steps; i++) {
        t[i + 1] = t[i] + h;
        y[i + 1] = y[i] + h * derivativeFunc(t[i], y[i]);
    }
    
    return { t, y };
}

export function partialDerivative(f, point, variableIndex, h = 1e-5) {
    // Numerical partial derivative
    const pointPlus = [...point];
    const pointMinus = [...point];
    pointPlus[variableIndex] += h;
    pointMinus[variableIndex] -= h;
    
    return (f(...pointPlus) - f(...pointMinus)) / (2 * h);
}

export function gradient(f, point, h = 1e-5) {
    // Compute gradient vector
    const grad = [];
    for (let i = 0; i < point.length; i++) {
        grad.push(partialDerivative(f, point, i, h));
    }
    return grad;
}