export function multiplyMatrices(A, B) {
    const rowsA = A.length;
    const colsA = A[0].length;
    const rowsB = B.length;
    const colsB = B[0].length;
    
    if (colsA !== rowsB) {
        throw new Error('Matrix dimensions incompatible for multiplication');
    }
    
    const result = Array(rowsA).fill().map(() => Array(colsB).fill(0));
    
    for (let i = 0; i < rowsA; i++) {
        for (let j = 0; j < colsB; j++) {
            for (let k = 0; k < colsA; k++) {
                result[i][j] += A[i][k] * B[k][j];
            }
        }
    }
    
    return result;
}

export function inverseMatrix(matrix) {
    const n = matrix.length;
    const det = determinantMatrix(matrix);
    
    if (Math.abs(det) < 1e-10) {
        throw new Error('Matrix is singular, cannot invert');
    }
    
    // For 2x2 matrix
    if (n === 2) {
        const a = matrix[0][0], b = matrix[0][1];
        const c = matrix[1][0], d = matrix[1][1];
        return [
            [d / det, -b / det],
            [-c / det, a / det]
        ];
    }
    
    // For larger matrices, use adjugate method (simplified)
    // This is a placeholder - for production, use more robust method
    throw new Error('Inverse for matrices larger than 2x2 requires more complex implementation');
}

export function determinantMatrix(matrix) {
    const n = matrix.length;
    
    if (n === 1) return matrix[0][0];
    if (n === 2) return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
    
    let det = 0;
    for (let i = 0; i < n; i++) {
        const subMatrix = matrix.slice(1).map(row => row.filter((_, j) => j !== i));
        det += matrix[0][i] * determinantMatrix(subMatrix) * (i % 2 === 0 ? 1 : -1);
    }
    return det;
}

export function addMatrices(A, B) {
    const rows = A.length;
    const cols = A[0].length;
    const result = Array(rows).fill().map(() => Array(cols).fill(0));
    
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            result[i][j] = A[i][j] + B[i][j];
        }
    }
    return result;
}

export function subtractMatrices(A, B) {
    const rows = A.length;
    const cols = A[0].length;
    const result = Array(rows).fill().map(() => Array(cols).fill(0));
    
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            result[i][j] = A[i][j] - B[i][j];
        }
    }
    return result;
}

export function transposeMatrix(matrix) {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const result = Array(cols).fill().map(() => Array(rows).fill(0));
    
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            result[j][i] = matrix[i][j];
        }
    }
    return result;
}