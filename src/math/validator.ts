import { Matrix, Vector, SystemValidation } from './types';

export function validateSystem(A: Matrix, b: Vector, x0: Vector): SystemValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  const n = A.length;
  if (n === 0) {
    errors.push('La matriz A no puede estar vacía.');
    return { isValid: false, errors, warnings };
  }

  // Comprobar matriz cuadrada
  for (let i = 0; i < n; i++) {
    if (!A[i] || A[i].length !== n) {
      errors.push(`La fila ${i + 1} no tiene dimensión ${n}. La matriz debe ser estrictamente cuadrada.`);
    }
  }

  // Comprobar vector b
  if (b.length !== n) {
    errors.push(`El vector de términos independientes b debe tener dimensión ${n} (actual: ${b.length}).`);
  }

  // Comprobar vector x0
  if (x0.length !== n) {
    errors.push(`El vector inicial x(0) debe tener dimensión ${n} (actual: ${x0.length}).`);
  }

  // Comprobar valores finitos
  for (let i = 0; i < n; i++) {
    if (A[i]) {
      for (let j = 0; j < n; j++) {
        if (!Number.isFinite(A[i][j])) {
          errors.push(`El coeficiente A[${i + 1}, ${j + 1}] no es un número finito.`);
        }
      }
    }
    if (!Number.isFinite(b[i])) {
      errors.push(`El término b[${i + 1}] no es un número finito.`);
    }
    if (!Number.isFinite(x0[i])) {
      errors.push(`El valor inicial x0[${i + 1}] no es un número finito.`);
    }
  }

  // Comprobar ceros en la diagonal
  for (let i = 0; i < n; i++) {
    if (A[i] && Math.abs(A[i][i]) < 1e-12) {
      errors.push(`El coeficiente diagonal a_${i + 1}${i + 1} es cero o numéricamente nulo (|a| < 1e-12), lo que impide despejar la incógnita.`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
