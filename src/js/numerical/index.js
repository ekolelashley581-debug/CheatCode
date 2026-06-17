import { initPyodide, runPython, generatePlot, isPyodideReady } from './pyodide-init.js';
import { solveLinear, solveQuadratic, solveSystem } from './solvers/linear.js';
import { multiplyMatrices, inverseMatrix, determinantMatrix } from './solvers/matrix.js';
import { derivative, integral, odeSolve } from './solvers/calculus.js';
import { interpolate, fitCurve } from './solvers/interpolation.js';
import { minimize, maximize } from './solvers/optimization.js';
import { generateLinePlot, generateBarChart, generateScatterPlot, generateHeatMap, generateSurface3D } from './generators/plots.js';
import { generateBMD, generateSFD, generateTrussDiagram, generateMohrCircle } from './generators/engineering.js';
import { generateHistogram, generatePieChart, generateNetworkGraph } from './generators/data-viz.js';

let initialized = false;

export async function initNumericalEngine() {
    if (initialized) return true;
    try {
        await initPyodide();
        initialized = true;
        return true;
    } catch (error) {
        console.error('Failed to initialize numerical engine:', error);
        return false;
    }
}

export function isEngineReady() {
    return initialized && isPyodideReady();
}

export const solvers = {
    linear: {
        solveLinear,
        solveQuadratic,
        solveSystem
    },
    matrix: {
        multiply: multiplyMatrices,
        inverse: inverseMatrix,
        determinant: determinantMatrix
    },
    calculus: {
        derivative,
        integral,
        odeSolve
    },
    interpolation: {
        interpolate,
        fitCurve
    },
    optimization: {
        minimize,
        maximize
    }
};

export const generators = {
    plots: {
        line: generateLinePlot,
        bar: generateBarChart,
        scatter: generateScatterPlot,
        heatmap: generateHeatMap,
        surface3d: generateSurface3D
    },
    engineering: {
        bmd: generateBMD,
        sfd: generateSFD,
        truss: generateTrussDiagram,
        mohrCircle: generateMohrCircle
    },
    dataViz: {
        histogram: generateHistogram,
        pieChart: generatePieChart,
        network: generateNetworkGraph
    }
};

export async function executePython(code) {
    return await runPython(code);
}

export async function generateAndPlot(code) {
    return await generatePlot(code);
}

export { initPyodide, isPyodideReady };