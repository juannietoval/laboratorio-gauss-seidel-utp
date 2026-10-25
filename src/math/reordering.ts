import { Matrix, Vector } from './types';
import { analyzeDiagonalDominance } from './dominance';

export interface PermutationProposal {
  canAchieveDominance: boolean;
  permutation: number[]; // Nuevo orden de índices de fila
  reorderedA: Matrix;
  reorderedB: Vector;
  explanation: string;
}

/**
 * Intercambia dos filas en la matriz A y el vector b
 */
export function swapRows(A: Matrix, b: Vector, row1: number, row2: number): { A: Matrix; b: Vector } {
  const n = A.length;
  const newA: Matrix = A.map(r => [...r]);
  const newB: Vector = [...b];

  if (row1 < 0 || row1 >= n || row2 < 0 || row2 >= n) {
    return { A: newA, b: newB };
  }

  const tempRow = newA[row1];
  newA[row1] = newA[row2];
  newA[row2] = tempRow;

  const tempB = newB[row1];
  newB[row1] = newB[row2];
  newB[row2] = tempB;

  return { A: newA, b: newB };
}

/**
 * Busca entre todas las permutaciones posibles de filas aquella que cumpla
 * con dominancia diagonal estricta, o en su defecto, la que maximice la diagonal.
 */
export function findBestRowPermutation(A: Matrix, b: Vector): PermutationProposal {
  const n = A.length;
  const indices = Array.from({ length: n }, (_, i) => i);

  // Guardia de escala: para n <= 5 se evalúa el espacio combinatorio completo (máx 120 permutaciones)
  if (n > 5) {
    return {
      canAchieveDominance: false,
      permutation: indices,
      reorderedA: A,
      reorderedB: b,
      explanation: 'La búsqueda combinatoria exacta está acotada a dimensiones n <= 5 para garantizar tiempos de respuesta inmediatos en el laboratorio didáctico.'
    };
  }

  const permutations: number[][] = [];

  // Generar todas las permutaciones para n <= 4
  function permute(arr: number[], m: number[] = []) {
    if (arr.length === 0) {
      permutations.push(m);
    } else {
      for (let i = 0; i < arr.length; i++) {
        const curr = arr.slice();
        const next = curr.splice(i, 1);
        permute(curr.slice(), m.concat(next));
      }
    }
  }

  permute(indices);

  // 1. Probar si alguna logra dominancia estricta
  for (const p of permutations) {
    const candidateA = p.map(rowIndex => [...A[rowIndex]]);
    const dominance = analyzeDiagonalDominance(candidateA);
    if (dominance.isStrictlyDominant) {
      const candidateB = p.map(rowIndex => b[rowIndex]);
      return {
        canAchieveDominance: true,
        permutation: p,
        reorderedA: candidateA,
        reorderedB: candidateB,
        explanation: `Se encontró la permutación de filas [${p.map(x => x + 1).join(', ')}] que garantiza dominancia diagonal estricta por filas.`
      };
    }
  }

  // 2. Si ninguna logra dominancia estricta, elegir la que maximice la suma de |a_ii| - sum |a_ij|
  let bestP = indices;
  let bestScore = -Infinity;

  for (const p of permutations) {
    const candidateA = p.map(rowIndex => [...A[rowIndex]]);
    let score = 0;
    let hasZeroPivot = false;

    for (let i = 0; i < n; i++) {
      const diag = Math.abs(candidateA[i][i]);
      if (diag < 1e-12) {
        hasZeroPivot = true;
      }
      let sumOff = 0;
      for (let j = 0; j < n; j++) {
        if (j !== i) sumOff += Math.abs(candidateA[i][j]);
      }
      score += (diag - sumOff);
    }

    if (!hasZeroPivot && score > bestScore) {
      bestScore = score;
      bestP = p;
    }
  }

  const reorderedA = bestP.map(rowIndex => [...A[rowIndex]]);
  const reorderedB = bestP.map(rowIndex => b[rowIndex]);

  return {
    canAchieveDominance: false,
    permutation: bestP,
    reorderedA,
    reorderedB,
    explanation: `No existe permutación de filas que logre dominancia diagonal estricta, pero la permutación [${bestP.map(x => x + 1).join(', ')}] maximiza los coeficientes diagonales y evita pivotes nulos.`
  };
}
