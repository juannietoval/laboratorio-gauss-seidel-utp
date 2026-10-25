import { Matrix, Vector } from './types';

/**
 * Resuelve el sistema Ax = b de manera directa utilizando eliminación gaussiana
 * con pivoteo parcial de máxima precisión para servir como solución analítica de referencia.
 */
export function solveExactSystem(A: Matrix, b: Vector): { solution: Vector | null; determinant: number; isSingular: boolean } {
  const n = b.length;
  // Clonar matriz aumentada
  const M: number[][] = [];
  for (let i = 0; i < n; i++) {
    M[i] = [...A[i], b[i]];
  }

  let det = 1.0;

  for (let i = 0; i < n; i++) {
    // Buscar pivote máximo
    let maxRow = i;
    let maxVal = Math.abs(M[i][i]);
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(M[k][i]) > maxVal) {
        maxVal = Math.abs(M[k][i]);
        maxRow = k;
      }
    }

    if (maxVal < 1e-12) {
      return { solution: null, determinant: 0, isSingular: true };
    }

    if (maxRow !== i) {
      const temp = M[i];
      M[i] = M[maxRow];
      M[maxRow] = temp;
      det *= -1.0;
    }

    const pivot = M[i][i];
    det *= pivot;

    // Eliminación
    for (let k = i + 1; k < n; k++) {
      const factor = M[k][i] / pivot;
      for (let j = i; j <= n; j++) {
        M[k][j] -= factor * M[i][j];
      }
    }
  }

  // Sustitución hacia atrás
  const x: Vector = new Array(n);
  for (let i = n - 1; i >= 0; i--) {
    let sum = M[i][n];
    for (let j = i + 1; j < n; j++) {
      sum -= M[i][j] * x[j];
    }
    x[i] = sum / M[i][i];
  }

  return { solution: x, determinant: det, isSingular: false };
}
