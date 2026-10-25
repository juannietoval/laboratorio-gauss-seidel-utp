import { describe, it, expect } from 'vitest';
import { PRESET_SYSTEMS } from '../src/math/presets';
import { validateSystem } from '../src/math/validator';
import { runGaussSeidel } from '../src/math/gaussSeidelEngine';
import { findBestRowPermutation } from '../src/math/reordering';

describe('Pruebas de Integración y Ciclo de Vida del Laboratorio', () => {

  it('debe procesar todos los presets predefinidos sin excepciones ni estados indefinidos', () => {
    PRESET_SYSTEMS.forEach((preset) => {
      const val = validateSystem(preset.A, preset.b, preset.x0);

      if (preset.id === 'sistema-pivote-cero') {
        expect(val.isValid).toBe(false);
        // Debe poder corregirse automáticamente
        const proposal = findBestRowPermutation(preset.A, preset.b);
        const valReorg = validateSystem(proposal.reorderedA, proposal.reorderedB, preset.x0);
        expect(valReorg.isValid).toBe(true);
      } else {
        expect(val.isValid).toBe(true);
        const res = runGaussSeidel(preset.A, preset.b, preset.x0, {
          tolerance: preset.recommendedTolerance,
          maxIterations: 30,
          errorMetric: 'RELATIVE_PERCENT'
        });
        expect(res.snapshots.length).toBeGreaterThan(0);
        res.snapshots.forEach((snap) => {
          snap.x.forEach((valX) => expect(Number.isFinite(valX)).toBe(true));
        });
      }
    });
  });

  it('debe demostrar la transición de fallo a convergencia en el Ejemplo 2 al aplicar reordenamiento', () => {
    const e2Orig = PRESET_SYSTEMS[1];
    const e2Reorg = PRESET_SYSTEMS[2];

    // Orden original: divergente / oscilante
    const resOrig = runGaussSeidel(e2Orig.A, e2Orig.b, e2Orig.x0, {
      tolerance: 0.05,
      maxIterations: 20,
      errorMetric: 'RELATIVE_PERCENT'
    });
    // No alcanza tolerancia en 20 pasos
    expect(resOrig.converged).toBe(false);

    // Orden reorganizado: converge en k = 6
    const resReorg = runGaussSeidel(e2Reorg.A, e2Reorg.b, e2Reorg.x0, {
      tolerance: 0.05,
      maxIterations: 20,
      errorMetric: 'RELATIVE_PERCENT'
    });
    expect(resReorg.converged).toBe(true);
    expect(resReorg.iterationsCompleted).toBe(6);
  });

});
