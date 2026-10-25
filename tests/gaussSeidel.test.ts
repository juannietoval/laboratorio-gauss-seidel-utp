import { describe, it, expect } from 'vitest';
import { analyzeDiagonalDominance } from '../src/math/dominance';
import { validateSystem } from '../src/math/validator';
import { solveExactSystem } from '../src/math/exactSolver';
import { findBestRowPermutation, swapRows } from '../src/math/reordering';
import { runGaussSeidel } from '../src/math/gaussSeidelEngine';
import { calculateResidual, infinityNorm } from '../src/math/errors';
import { PRESET_SYSTEMS } from '../src/math/presets';

describe('Capa Matemática de Gauss-Seidel (src/math)', () => {

  describe('1. Verificación de Dominancia Diagonal Estricta', () => {
    it('debe certificar dominancia estricta en el Ejemplo 1 del cuaderno UTP', () => {
      const e1 = PRESET_SYSTEMS[0];
      const res = analyzeDiagonalDominance(e1.A);
      expect(res.isStrictlyDominant).toBe(true);
      expect(res.rowDetails).toHaveLength(3);
      expect(res.rowDetails[0].satisfies).toBe(true); // 4 > 1+1
      expect(res.rowDetails[1].satisfies).toBe(true); // 3 > 1+1
      expect(res.rowDetails[2].satisfies).toBe(true); // 5 > 1+1
    });

    it('debe detectar la falta de dominancia estricta en el Ejemplo 2 original', () => {
      const e2 = PRESET_SYSTEMS[1];
      const res = analyzeDiagonalDominance(e2.A);
      expect(res.isStrictlyDominant).toBe(false);
      // Las tres filas fallan
      expect(res.rowDetails[0].satisfies).toBe(false); // 1 > 3+1 (Falso)
      expect(res.rowDetails[1].satisfies).toBe(false); // 1 > 2+4 (Falso)
      expect(res.rowDetails[2].satisfies).toBe(false); // 1 > 5+1 (Falso)
    });

    it('debe certificar dominancia en el Ejemplo 2 Reorganizado', () => {
      const e2Reorg = PRESET_SYSTEMS[2];
      const res = analyzeDiagonalDominance(e2Reorg.A);
      expect(res.isStrictlyDominant).toBe(true);
      expect(res.rowDetails[0].satisfies).toBe(true); // 5 > 1+1
      expect(res.rowDetails[1].satisfies).toBe(true); // 3 > 1+1
      expect(res.rowDetails[2].satisfies).toBe(true); // 4 > 2+1
    });
  });

  describe('2. Validación de Sistemas Lineales', () => {
    it('debe detectar coeficientes diagonales nulos (pivotes cero)', () => {
      const ePivot = PRESET_SYSTEMS[4];
      const val = validateSystem(ePivot.A, ePivot.b, ePivot.x0);
      expect(val.isValid).toBe(false);
      expect(val.errors.some(e => e.includes('diagonal a_11 es cero'))).toBe(true);
    });

    it('debe rechazar matrices no cuadradas o dimensiones incompatibles', () => {
      const invalidA = [[1, 2], [3, 4]];
      const b3 = [1, 2, 3];
      const x0 = [0, 0];
      const val = validateSystem(invalidA, b3, x0);
      expect(val.isValid).toBe(false);
      expect(val.errors.some(e => e.includes('dimensión 2'))).toBe(true);
    });
  });

  describe('3. Solución Analítica Exacta y Residuos', () => {
    it('debe calcular la solución exacta x* = (25/24, 13/12, 17/24) con determinante det(A) = 48', () => {
      const e2 = PRESET_SYSTEMS[2];
      const { solution, determinant, isSingular } = solveExactSystem(e2.A, e2.b);
      expect(isSingular).toBe(false);
      expect(Math.round(determinant)).toBe(48);
      expect(solution).not.toBeNull();
      if (solution) {
        expect(solution[0]).toBeCloseTo(25 / 24, 6);
        expect(solution[1]).toBeCloseTo(13 / 12, 6);
        expect(solution[2]).toBeCloseTo(17 / 24, 6);

        // Residuo exacto debe ser virtualmente cero
        const r = calculateResidual(e2.A, e2.b, solution);
        expect(infinityNorm(r)).toBeLessThan(1e-12);
      }
    });
  });

  describe('4. Algoritmo de Reordenamiento de Filas', () => {
    it('debe encontrar la permutación que convierte el Ejemplo 2 en estrictamente dominante', () => {
      const e2Orig = PRESET_SYSTEMS[1];
      const proposal = findBestRowPermutation(e2Orig.A, e2Orig.b);
      expect(proposal.canAchieveDominance).toBe(true);
      expect(proposal.permutation).toEqual([2, 0, 1]); // Fila 3 pasa a 1, Fila 1 a 2, Fila 2 a 3
      expect(proposal.reorderedA).toEqual([
        [5, 1, 1],
        [1, 3, 1],
        [2, 1, 4]
      ]);
    });

    it('debe permitir intercambio manual de filas', () => {
      const A = [[1, 2], [3, 4]];
      const b = [5, 6];
      const swapped = swapRows(A, b, 0, 1);
      expect(swapped.A).toEqual([[3, 4], [1, 2]]);
      expect(swapped.b).toEqual([6, 5]);
    });
  });

  describe('5. Motor de Gauss-Seidel: Rigor de Actualización y Parada', () => {
    it('debe aplicar la actualización secuencial inmediata y converger en k=6 para el Ejemplo 2', () => {
      const e2 = PRESET_SYSTEMS[2];
      const result = runGaussSeidel(e2.A, e2.b, e2.x0, {
        tolerance: 0.05,
        maxIterations: 20,
        errorMetric: 'RELATIVE_PERCENT'
      });

      expect(result.converged).toBe(true);
      expect(result.iterationsCompleted).toBe(6);
      expect(result.terminationReason).toBe('TOLERANCE_ACHIEVED');

      // Comprobar valores en k=1
      const k1 = result.snapshots[1];
      expect(k1.x[0]).toBeCloseTo(1.4, 4); // (7 - 0 - 0)/5 = 1.4
      expect(k1.x[1]).toBeCloseTo(1.2, 4); // (5 - 1.4 - 0)/3 = 1.2
      expect(k1.x[2]).toBeCloseTo(0.5, 4); // (6 - 2(1.4) - 1.2)/4 = 0.5

      // Comprobar valores finales en k=6
      const k6 = result.snapshots[6];
      expect(k6.x[0]).toBeCloseTo(1.041676, 4);
      expect(k6.x[1]).toBeCloseTo(1.083258, 4);
      expect(k6.x[2]).toBeCloseTo(0.708348, 4);

      // Comprobar que todos los errores relativos están bajo 0.05%
      expect(k6.approximateErrors[0]).toBeLessThan(0.05);
      expect(k6.approximateErrors[1]).toBeLessThan(0.05);
      expect(k6.approximateErrors[2]).toBeLessThan(0.05);
    });

    it('no debe ejecutar Jacobi: x_2^(1) debe usar x_1^(1) = 1.4 y no x_1^(0) = 0', () => {
      const e2 = PRESET_SYSTEMS[2];
      const result = runGaussSeidel(e2.A, e2.b, e2.x0, {
        tolerance: 0.05,
        maxIterations: 1,
        errorMetric: 'RELATIVE_PERCENT'
      });

      const k1 = result.snapshots[1];
      expect(k1.x[1]).toBeCloseTo(1.2, 4);
      expect(k1.x[1]).not.toBeCloseTo(5 / 3, 2);
    });

    it('debe admitir y respetar el criterio de parada por norma del residuo RESIDUAL_NORM', () => {
      const e2 = PRESET_SYSTEMS[2];
      const result = runGaussSeidel(e2.A, e2.b, e2.x0, {
        tolerance: 0.001,
        maxIterations: 20,
        errorMetric: 'RESIDUAL_NORM'
      });

      expect(result.converged).toBe(true);
      const lastSnap = result.snapshots[result.snapshots.length - 1];
      expect(lastSnap.residualInfNorm).toBeLessThan(0.001);
    });
  });

});
