import { Matrix, Vector } from './types';

/**
 * Calcula el vector residuo r = b - A * x
 */
export function calculateResidual(A: Matrix, b: Vector, x: Vector): Vector {
  const n = b.length;
  const r: Vector = new Array(n);
  for (let i = 0; i < n; i++) {
    let ax = 0;
    for (let j = 0; j < n; j++) {
      ax += A[i][j] * x[j];
    }
    r[i] = b[i] - ax;
  }
  return r;
}

/**
 * Norma infinito de un vector: ||v||_inf = max |v_i|
 */
export function infinityNorm(v: Vector): number {
  let maxVal = 0;
  for (let i = 0; i < v.length; i++) {
    const absVal = Math.abs(v[i]);
    if (absVal > maxVal) {
      maxVal = absVal;
    }
  }
  return maxVal;
}

/**
 * Error relativo aproximado porcentual entre dos valores:
 * Ea = |(x_new - x_old) / x_new| * 100%
 * Maneja divisiones por cero escalando con un umbral seguro para evitar NaN.
 */
export function calculateApproximateRelativeError(xNew: number, xOld: number): number {
  if (Math.abs(xNew) < 1e-14) {
    // Si el valor se aproxima a cero, evaluar respecto a umbral mínimo seguro
    return (Math.abs(xNew - xOld) / 1e-12) * 100.0;
  }
  return Math.abs((xNew - xOld) / xNew) * 100.0;
}
