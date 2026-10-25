import { Matrix, DominanceAnalysis, RowDominanceDetail } from './types';

/**
 * Evalúa si una matriz cuadrada es estrictamente diagonal dominante por filas.
 * Condición: |a_ii| > sum_{j != i} |a_ij| para toda fila i.
 */
export function analyzeDiagonalDominance(A: Matrix): DominanceAnalysis {
  const n = A.length;
  const rowDetails: RowDominanceDetail[] = [];
  let isStrictlyDominant = true;

  for (let i = 0; i < n; i++) {
    const diag = Math.abs(A[i][i]);
    let sumOff = 0;
    for (let j = 0; j < n; j++) {
      if (j !== i) {
        sumOff += Math.abs(A[i][j]);
      }
    }
    const satisfies = diag > sumOff;
    if (!satisfies) {
      isStrictlyDominant = false;
    }
    rowDetails.push({
      row: i + 1,
      diagonal: diag,
      sumOffDiagonal: sumOff,
      satisfies,
      difference: diag - sumOff
    });
  }

  const summaryMessage = isStrictlyDominant
    ? 'La matriz es estrictamente diagonal dominante por filas. La convergencia del método de Gauss-Seidel está teóricamente garantizada para cualquier punto inicial.'
    : 'La matriz NO es estrictamente diagonal dominante por filas. La convergencia no está teóricamente garantizada; el método podría divergir, oscilar o converger más lentamente si no se reordenan las ecuaciones.';

  return {
    isStrictlyDominant,
    rowDetails,
    summaryMessage
  };
}
