// ============================================
// CHEATCODE UNIVERSAL NUMERICAL ENGINE
// Covers: Engineering, Mathematics, Physics, Chemistry, 
// Biology, Medicine, Economics, Finance, Statistics
// Zero API Cost - Pure Local Computation
// ============================================

// ============================================
// ENGINEERING (CIVIL, MECHANICAL, ELECTRICAL)
// ============================================
export const Engineering = {
    // Beam deflection - simply supported, point load
    simplySupportedBeam(L, P, a, E, I, x) {
        const R1 = P * (L - a) / L;
        const R2 = P * a / L;
        let deflection;
        if (x <= a) {
            deflection = (P * (L - a) * x / (6 * E * I * L)) * (Math.pow(L, 2) - Math.pow(L - a, 2) - Math.pow(x, 2));
        } else {
            deflection = (P * (L - a) * x / (6 * E * I * L)) * (Math.pow(L, 2) - Math.pow(L - a, 2) - Math.pow(x, 2)) - (P * Math.pow(x - a, 3)) / (6 * E * I);
        }
        const moment = x <= a ? R1 * x : R1 * x - P * (x - a);
        const shear = x <= a ? R1 : R1 - P;
        return { deflection, moment, shear, R1, R2 };
    },
    
    // Principal stresses (Mohr's circle)
    principalStresses(sigma_x, sigma_y, tau_xy) {
        const avg = (sigma_x + sigma_y) / 2;
        const radius = Math.sqrt(Math.pow((sigma_x - sigma_y) / 2, 2) + tau_xy * tau_xy);
        return {
            sigma1: avg + radius,
            sigma2: avg - radius,
            tau_max: radius,
            theta_p: 0.5 * Math.atan2(2 * tau_xy, sigma_x - sigma_y) * 180 / Math.PI
        };
    },
    
    // Manning's equation for open channel flow
    manningsFlow(n, A, R, S) {
        const Q = (1 / n) * A * Math.pow(R, 2/3) * Math.sqrt(S);
        const V = Q / A;
        return { Q: Q.toFixed(3), V: V.toFixed(2) };
    },
    
    // Darcy-Weisbach pipe flow
    pipeFlow(f, L, D, rho, V) {
        const deltaP = f * (L / D) * (rho * V * V / 2);
        const h_loss = deltaP / (rho * 9.81);
        return { pressureDrop: deltaP.toFixed(0), headLoss: h_loss.toFixed(2) };
    },
    
    // Bearing capacity (Terzaghi)
    bearingCapacity(c, phiDeg, gamma, B, Df) {
        const phi = phiDeg * Math.PI / 180;
        const Nq = Math.pow(Math.E, Math.PI * Math.tan(phi)) * Math.pow(Math.tan(45 * Math.PI / 180 + phi/2), 2);
        const Nc = (Nq - 1) / Math.tan(phi);
        const Ng = 2 * (Nq + 1) * Math.tan(phi);
        const q_ult = c * Nc + gamma * Df * Nq + 0.5 * gamma * B * Ng;
        const q_allow = q_ult / 3;
        return { q_ult: q_ult.toFixed(2), q_allow: q_allow.toFixed(2), Nc: Nc.toFixed(2), Nq: Nq.toFixed(2), Ng: Ng.toFixed(2) };
    }
};

// ============================================
// PHYSICS ENGINE
// ============================================
export const Physics = {
    kinematics(u, a, t) {
        const v = u + a * t;
        const s = u * t + 0.5 * a * t * t;
        return { v: v.toFixed(2), s: s.toFixed(2) };
    },
    
    projectile(v0, angleDeg, g = 9.81) {
        const rad = angleDeg * Math.PI / 180;
        const v0x = v0 * Math.cos(rad);
        const v0y = v0 * Math.sin(rad);
        const timeOfFlight = 2 * v0y / g;
        const maxHeight = (v0y * v0y) / (2 * g);
        const range = v0x * timeOfFlight;
        return { 
            timeOfFlight: timeOfFlight.toFixed(2), 
            maxHeight: maxHeight.toFixed(2), 
            range: range.toFixed(2),
            v0x: v0x.toFixed(2), 
            v0y: v0y.toFixed(2) 
        };
    },
    
    ohmsLaw(V, I) {
        const R = V / I;
        const P = V * I;
        return { R: R.toFixed(2), P: P.toFixed(2) };
    },
    
    work(force, distance, angleDeg = 0) {
        const rad = angleDeg * Math.PI / 180;
        const work = force * distance * Math.cos(rad);
        return { work: work.toFixed(2) };
    },
    
    power(work, time) {
        return { power: (work / time).toFixed(2) };
    }
};

// ============================================
// CHEMISTRY ENGINE
// ============================================
export const Chemistry = {
    calculatePH(hPlus) {
        const pH = -Math.log10(hPlus);
        const pOH = 14 - pH;
        const ohMinus = Math.pow(10, -pOH);
        return { pH: pH.toFixed(2), pOH: pOH.toFixed(2), ohMinus: ohMinus.toExponential(2) };
    },
    
    phFromValue(pH) {
        const hPlus = Math.pow(10, -pH);
        const pOH = 14 - pH;
        const ohMinus = Math.pow(10, -pOH);
        return { hPlus: hPlus.toExponential(2), pOH: pOH.toFixed(2), ohMinus: ohMinus.toExponential(2) };
    },
    
    idealGasLaw(P, V, n, T, R = 0.0821) {
        if (P && V && n) return { T: (P * V / (n * R)).toFixed(2) };
        if (n && T && V) return { P: (n * R * T / V).toFixed(2) };
        if (P && n && T) return { V: (n * R * T / P).toFixed(2) };
        if (P && V && T) return { n: (P * V / (R * T)).toFixed(4) };
        return null;
    },
    
    molarMass(formula) {
        const elements = {
            H: 1.008, He: 4.0026, Li: 6.94, Be: 9.012, B: 10.81, C: 12.011, N: 14.007,
            O: 15.999, F: 18.998, Ne: 20.180, Na: 22.990, Mg: 24.305, Al: 26.982,
            Si: 28.086, P: 30.974, S: 32.06, Cl: 35.45, K: 39.098, Ca: 40.078,
            Fe: 55.845, Cu: 63.546, Zn: 65.38, Ag: 107.87, I: 126.90, Au: 196.97,
            Pb: 207.2
        };
        let mass = 0;
        let currentElement = '';
        let currentCount = '';
        for (let i = 0; i < formula.length; i++) {
            const c = formula[i];
            if (c >= 'A' && c <= 'Z') {
                if (currentElement) {
                    mass += elements[currentElement] * (parseInt(currentCount) || 1);
                    currentCount = '';
                }
                currentElement = c;
            } else if (c >= 'a' && c <= 'z') {
                currentElement += c;
            } else if (c >= '0' && c <= '9') {
                currentCount += c;
            }
        }
        if (currentElement) {
            mass += elements[currentElement] * (parseInt(currentCount) || 1);
        }
        return { molarMass: mass.toFixed(3) };
    }
};

// ============================================
// ECONOMICS & FINANCE ENGINE
// ============================================
export const Economics = {
    compoundInterest(P, rPercent, t, n = 1) {
        const r = rPercent / 100;
        const A = P * Math.pow(1 + r/n, n * t);
        const interest = A - P;
        return { A: A.toFixed(2), interest: interest.toFixed(2) };
    },
    
    simpleInterest(P, rPercent, t) {
        const r = rPercent / 100;
        const interest = P * r * t;
        const total = P + interest;
        return { interest: interest.toFixed(2), total: total.toFixed(2) };
    },
    
    presentValue(FV, rPercent, n) {
        const r = rPercent / 100;
        const PV = FV / Math.pow(1 + r, n);
        return { PV: PV.toFixed(2) };
    },
    
    futureValue(PV, rPercent, n) {
        const r = rPercent / 100;
        const FV = PV * Math.pow(1 + r, n);
        return { FV: FV.toFixed(2) };
    },
    
    netPresentValue(ratePercent, cashflows) {
        const rate = ratePercent / 100;
        let npv = 0;
        for (let t = 0; t < cashflows.length; t++) {
            npv += cashflows[t] / Math.pow(1 + rate, t);
        }
        return { npv: npv.toFixed(2), decision: npv > 0 ? 'Accept' : npv < 0 ? 'Reject' : 'Indifferent' };
    },
    
    demandElasticity(Q1, Q2, P1, P2) {
        const Qmid = (Q1 + Q2) / 2;
        const Pmid = (P1 + P2) / 2;
        const elasticity = ((Q2 - Q1) / Qmid) / ((P2 - P1) / Pmid);
        return { 
            elasticity: elasticity.toFixed(4), 
            type: Math.abs(elasticity) > 1 ? 'Elastic' : Math.abs(elasticity) < 1 ? 'Inelastic' : 'Unit Elastic' 
        };
    },
    
    returnOnInvestment(gain, cost) {
        const roi = (gain - cost) / cost;
        return { roi: (roi * 100).toFixed(2) + '%' };
    }
};

// ============================================
// STATISTICS ENGINE
// ============================================
export const Statistics = {
    mean(data) {
        return data.reduce((a, b) => a + b, 0) / data.length;
    },
    
    median(data) {
        const sorted = [...data].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        if (sorted.length % 2 === 0) return (sorted[mid-1] + sorted[mid]) / 2;
        return sorted[mid];
    },
    
    variance(data) {
        const mean = this.mean(data);
        const sumSq = data.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0);
        return sumSq / (data.length - 1);
    },
    
    stdDev(data) {
        return Math.sqrt(this.variance(data));
    },
    
    linearRegression(x, y) {
        const n = x.length;
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
        const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        
        const r_num = n * sumXY - sumX * sumY;
        const r_den = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
        const r = r_num / r_den;
        
        return { 
            slope: slope.toFixed(4), 
            intercept: intercept.toFixed(4), 
            r: r.toFixed(4),
            r2: (r * r).toFixed(4)
        };
    },
    
    correlation(x, y) {
        const n = x.length;
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
        const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
        
        const numerator = n * sumXY - sumX * sumY;
        const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
        const r = numerator / denominator;
        
        let strength = 'Weak';
        if (Math.abs(r) > 0.7) strength = 'Strong';
        else if (Math.abs(r) > 0.3) strength = 'Moderate';
        
        return { r: r.toFixed(4), strength: strength, direction: r > 0 ? 'Positive' : 'Negative' };
    }
};

// ============================================
// MATHEMATICS ENGINE
// ============================================
export const Mathematics = {
    quadratic(a, b, c) {
        const discriminant = b * b - 4 * a * c;
        if (discriminant < 0) {
            const real = -b / (2 * a);
            const imag = Math.sqrt(-discriminant) / (2 * a);
            return { 
                real: false, 
                root1: real.toFixed(4) + ' + ' + imag.toFixed(4) + 'i', 
                root2: real.toFixed(4) + ' - ' + imag.toFixed(4) + 'i', 
                discriminant: discriminant.toFixed(4) 
            };
        }
        const root1 = (-b + Math.sqrt(discriminant)) / (2 * a);
        const root2 = (-b - Math.sqrt(discriminant)) / (2 * a);
        return { real: true, root1: root1.toFixed(4), root2: root2.toFixed(4), discriminant: discriminant.toFixed(4) };
    },
    
    cubicRoot(a, b, c, d) {
        // Simple approximation - return one real root
        let x = 0;
        for (let i = 0; i < 100; i++) {
            const f = a * x * x * x + b * x * x + c * x + d;
            const fp = 3 * a * x * x + 2 * b * x + c;
            const xNew = x - f / fp;
            if (Math.abs(xNew - x) < 1e-6) return { root: xNew.toFixed(6) };
            x = xNew;
        }
        return { root: x.toFixed(6) };
    },
    
    derivativeAtPoint(f, x, h = 1e-6) {
        return ((f(x + h) - f(x - h)) / (2 * h)).toFixed(6);
    },
    
    integralSimpson(f, a, b, n = 100) {
        const h = (b - a) / n;
        let sum = f(a) + f(b);
        for (let i = 1; i < n; i++) {
            sum += (i % 2 === 0 ? 2 : 4) * f(a + i * h);
        }
        return ((h / 3) * sum).toFixed(6);
    }
};

// ============================================
// BIOLOGY / MEDICINE ENGINE
// ============================================
export const Medicine = {
    bmi(weightKg, heightCm) {
        const heightM = heightCm / 100;
        const bmi = weightKg / (heightM * heightM);
        let category = '';
        if (bmi < 18.5) category = 'Underweight';
        else if (bmi < 25) category = 'Normal weight';
        else if (bmi < 30) category = 'Overweight';
        else category = 'Obese';
        return { bmi: bmi.toFixed(1), category: category };
    },
    
    ibw(heightCm, gender) {
        const base = 50 + 0.9 * (heightCm - 152);
        if (gender === 'male') return { ibw: base.toFixed(1) + ' kg' };
        return { ibw: (base - 4.5).toFixed(1) + ' kg' };
    },
    
    bsa(weightKg, heightCm) {
        // DuBois formula
        const bsa = 0.007184 * Math.pow(weightKg, 0.425) * Math.pow(heightCm, 0.725);
        return { bsa: bsa.toFixed(2) + ' m²' };
    },
    
    calorieBurn(weightKg, met, hours) {
        const calories = met * weightKg * hours;
        return { calories: calories.toFixed(0) };
    }
};

// ============================================
// MAIN SOLVER - Routes to appropriate engine
// ============================================
export function solveNumerically(question) {
    const q = question.toLowerCase();
    
    // Engineering: Beam deflection
    if (q.includes('beam') && (q.includes('deflection') || q.includes('bending'))) {
        const numbers = question.match(/-?\d+(?:\.\d+)?/g)?.map(Number) || [];
        if (numbers.length >= 2) {
            const L = numbers[0] || 5;
            const P = numbers[1] || 10;
            const a = numbers[2] || L/2;
            const E = numbers[3] || 200e9;
            const I = numbers[4] || 1e-6;
            const x = numbers[5] || a;
            const result = Engineering.simplySupportedBeam(L, P, a, E, I, x);
            return { engine: 'Structural Engineering', result };
        }
    }
    
    // Engineering: Principal stresses
    if ((q.includes('principal stress') || q.includes('mohr')) && q.includes('stress')) {
        const numbers = question.match(/-?\d+(?:\.\d+)?/g)?.map(Number) || [];
        if (numbers.length >= 3) {
            const result = Engineering.principalStresses(numbers[0], numbers[1], numbers[2]);
            return { engine: 'Mechanics of Materials', result };
        }
    }
    
    // Physics: Kinematics
    if ((q.includes('kinematic') || q.includes('velocity')) && q.includes('acceleration')) {
        const numbers = question.match(/-?\d+(?:\.\d+)?/g)?.map(Number) || [];
        if (numbers.length >= 3) {
            const result = Physics.kinematics(numbers[0], numbers[1], numbers[2]);
            return { engine: 'Physics - Kinematics', result };
        }
    }
    
    // Physics: Projectile motion
    if (q.includes('projectile')) {
        const numbers = question.match(/-?\d+(?:\.\d+)?/g)?.map(Number) || [];
        if (numbers.length >= 2) {
            const result = Physics.projectile(numbers[0], numbers[1]);
            return { engine: 'Physics - Projectile Motion', result };
        }
    }
    
    // Physics: Ohm's Law
    if ((q.includes('ohm') || (q.includes('voltage') && q.includes('current')))) {
        const numbers = question.match(/-?\d+(?:\.\d+)?/g)?.map(Number) || [];
        if (numbers.length >= 2) {
            const result = Physics.ohmsLaw(numbers[0], numbers[1]);
            return { engine: 'Electrical Engineering', result };
        }
    }
    
    // Chemistry: pH
    if (q.includes('ph') || q.includes('h+')) {
        const numbers = question.match(/-?\d+(?:\.\d+)?/g)?.map(Number) || [];
        if (numbers.length >= 1) {
            if (q.includes('h+')) {
                const result = Chemistry.calculatePH(numbers[0]);
                return { engine: 'Chemistry - pH Calculation', result };
            } else {
                const result = Chemistry.phFromValue(numbers[0]);
                return { engine: 'Chemistry - pH Calculation', result };
            }
        }
    }
    
    // Chemistry: Molar mass
    if (q.includes('molar mass') || (q.includes('molecular weight') && q.match(/[A-Z][a-z]?\d*/g))) {
        const formulaMatch = question.match(/[A-Z][a-z]?\d*/g);
        if (formulaMatch) {
            const formula = formulaMatch.join('');
            const result = Chemistry.molarMass(formula);
            return { engine: 'Chemistry - Molar Mass', result };
        }
    }
    
    // Finance: Compound interest
    if (q.includes('compound interest')) {
        const numbers = question.match(/-?\d+(?:\.\d+)?/g)?.map(Number) || [];
        if (numbers.length >= 3) {
            const result = Economics.compoundInterest(numbers[0], numbers[1], numbers[2], numbers[3] || 1);
            return { engine: 'Finance - Compound Interest', result };
        }
    }
    
    // Finance: Present Value / Future Value
    if (q.includes('present value') || q.includes('future value')) {
        const numbers = question.match(/-?\d+(?:\.\d+)?/g)?.map(Number) || [];
        if (numbers.length >= 3) {
            if (q.includes('present value')) {
                const result = Economics.presentValue(numbers[0], numbers[1], numbers[2]);
                return { engine: 'Finance - Present Value', result };
            } else {
                const result = Economics.futureValue(numbers[0], numbers[1], numbers[2]);
                return { engine: 'Finance - Future Value', result };
            }
        }
    }
    
    // Finance: Net Present Value
    if (q.includes('npv') || q.includes('net present value')) {
        const numbers = question.match(/-?\d+(?:\.\d+)?/g)?.map(Number) || [];
        if (numbers.length >= 2) {
            const result = Economics.netPresentValue(numbers[0], numbers.slice(1));
            return { engine: 'Finance - Net Present Value', result };
        }
    }
    
    // Economics: Demand elasticity
    if (q.includes('elasticity') && (q.includes('demand') || q.includes('price'))) {
        const numbers = question.match(/-?\d+(?:\.\d+)?/g)?.map(Number) || [];
        if (numbers.length >= 4) {
            const result = Economics.demandElasticity(numbers[0], numbers[1], numbers[2], numbers[3]);
            return { engine: 'Economics - Price Elasticity', result };
        }
    }
    
    // Statistics: Mean, median, standard deviation
    if ((q.includes('mean') || q.includes('average') || q.includes('standard deviation')) && !q.includes('explain')) {
        const numbers = question.match(/-?\d+(?:\.\d+)?/g)?.map(Number) || [];
        if (numbers.length >= 2) {
            const mean = Statistics.mean(numbers);
            const median = Statistics.median(numbers);
            const std = Statistics.stdDev(numbers);
            return { 
                engine: 'Statistics', 
                result: { 
                    mean: mean.toFixed(4), 
                    median: median.toFixed(4), 
                    stdDev: std.toFixed(4), 
                    variance: (std * std).toFixed(4),
                    count: numbers.length 
                }
            };
        }
    }
    
    // Statistics: Linear regression / Correlation
    if ((q.includes('regression') || q.includes('correlation')) && !q.includes('explain')) {
        const numbers = question.match(/-?\d+(?:\.\d+)?/g)?.map(Number) || [];
        if (numbers.length >= 4 && numbers.length % 2 === 0) {
            const n = numbers.length / 2;
            const x = numbers.slice(0, n);
            const y = numbers.slice(n);
            const result = Statistics.linearRegression(x, y);
            const corr = Statistics.correlation(x, y);
            return { 
                engine: 'Statistics', 
                result: { 
                    slope: result.slope, 
                    intercept: result.intercept, 
                    r: result.r,
                    r2: result.r2,
                    strength: corr.strength,
                    direction: corr.direction
                }
            };
        }
    }
    
    // Mathematics: Quadratic equation
    if ((q.includes('quadratic') || q.includes('ax²') || q.includes('ax^2')) && !q.includes('explain')) {
        const numbers = question.match(/-?\d+(?:\.\d+)?/g)?.map(Number) || [];
        if (numbers.length >= 3) {
            const result = Mathematics.quadratic(numbers[0], numbers[1], numbers[2]);
            return { engine: 'Mathematics - Quadratic Equation', result };
        }
    }
    
    // Medicine: BMI
    if (q.includes('bmi') || q.includes('body mass index')) {
        const numbers = question.match(/-?\d+(?:\.\d+)?/g)?.map(Number) || [];
        if (numbers.length >= 2) {
            const result = Medicine.bmi(numbers[0], numbers[1]);
            return { engine: 'Medicine - Body Mass Index', result };
        }
    }
    
    return { engine: null, result: null };
}

// Default export
export default {
    Engineering,
    Physics,
    Chemistry,
    Economics,
    Statistics,
    Mathematics,
    Medicine,
    solveNumerically
};