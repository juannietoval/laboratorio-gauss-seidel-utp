import { Matrix, Vector, IterationSnapshot, VariableSubstitution, GaussSeidelConfig, GaussSeidelExecutionResult } from './types';
import { calculateResidual, infinityNorm, calculateApproximateRelativeError } from './errors';

const VARIABLE_NAMES = ['x', 'y', 'z', 'w', 'v'];

export function runGaussSeidel(
  A: Matrix,
  b: Vector,
  x0: Vector,
  config: GaussSeidelConfig
): GaussSeidelExecutionResult {
  const n = b.length;
  const snapshots: IterationSnapshot[] = [];

  // Snapshot k = 0 (Vector inicial)
  const initialResidual = calculateResidual(A, b, x0);
  const initialInfNorm = infinityNorm(initialResidual);

  snapshots.push({
    k: 0,
    x: [...x0],
    previousX: [...x0],
    substitutions: [],
    approximateErrors: new Array(n).fill(null),
    maxApproximateError: null,
    residualVector: initialResidual,
    residualInfNorm: initialInfNorm,
    converged: false,
    statusMessage: 'Aproximación inicial x(0)'
  });

  let currentX = [...x0];
  let converged = false;
  let iterationsCompleted = 0;
  let terminationReason: GaussSeidelExecutionResult['terminationReason'] = 'MAX_ITERATIONS';
  let message = `Se alcanzó el número máximo de ${config.maxIterations} iteraciones sin satisfacer la tolerancia.`;

  for (let k = 1; k <= config.maxIterations; k++) {
    iterationsCompleted = k;
    const prevX = [...currentX];
    const stepSubstitutions: VariableSubstitution[] = [];
    const approximateErrors: number[] = [];

    let hasNonFinite = false;

    // Actualización secuencial de Gauss-Seidel
    for (let i = 0; i < n; i++) {
      const varName = VARIABLE_NAMES[i] || `x_${i + 1}`;
      const pivot = A[i][i];

      if (Math.abs(pivot) < 1e-12) {
        return {
          snapshots,
          converged: false,
          iterationsCompleted: k - 1,
          terminationReason: 'ZERO_PIVOT',
          message: `Pivote nulo o numéricamente inestable en fila ${i + 1} (|a| < 1e-12). El método no puede continuar.`
        };
      }

      let sumUpdated = 0;
      const updatedTerms: { index: number; name: string; coeff: number; val: number }[] = [];
      for (let j = 0; j < i; j++) {
        const val = currentX[j];
        sumUpdated += A[i][j] * val;
        updatedTerms.push({ index: j, name: VARIABLE_NAMES[j] || `x_${j + 1}`, coeff: A[i][j], val });
      }

      let sumOld = 0;
      const oldTerms: { index: number; name: string; coeff: number; val: number }[] = [];
      for (let j = i + 1; j < n; j++) {
        const val = prevX[j];
        sumOld += A[i][j] * val;
        oldTerms.push({ index: j, name: VARIABLE_NAMES[j] || `x_${j + 1}`, coeff: A[i][j], val });
      }

      const newVal = (b[i] - sumUpdated - sumOld) / pivot;
      currentX[i] = newVal;

      if (!Number.isFinite(newVal) || Math.abs(newVal) > 1e12) {
        hasNonFinite = true;
      }

      const ea = calculateApproximateRelativeError(newVal, prevX[i]);
      approximateErrors.push(ea);

      stepSubstitutions.push({
        variableIndex: i,
        variableName: varName,
        previousValue: prevX[i],
        newValue: newVal,
        numeratorDetails: {
          constant: b[i],
          updatedTerms,
          oldTerms
        },
        approximateError: ea
      });
    }

    if (hasNonFinite) {
      const residual = calculateResidual(A, b, currentX.map(v => Number.isFinite(v) ? v : 1e12));
      snapshots.push({
        k,
        x: [...currentX],
        previousX: prevX,
        substitutions: stepSubstitutions,
        approximateErrors,
        maxApproximateError: Infinity,
        residualVector: residual,
        residualInfNorm: infinityNorm(residual),
        converged: false,
        statusMessage: `Divergencia numérica detectada en k = ${k}: valores no finitos o crecimiento desmedido.`
      });
      terminationReason = 'DIVERGENCE_DETECTED';
      message = `Divergencia numérica detectada en la iteración k = ${k}: los valores crecieron sin límite o perdieron finitud.`;
      break;
    }

    const maxEa = Math.max(...approximateErrors);
    const residual = calculateResidual(A, b, currentX);
    const resNorm = infinityNorm(residual);

    // Evaluación del criterio de parada según la métrica configurada
    let isStepConverged = false;
    let metricDisplayValue = '';

    const absDiffNorm = infinityNorm(currentX.map((val, idx) => Math.abs(val - prevX[idx])));

    switch (config.errorMetric) {
      case 'RESIDUAL_NORM':
        isStepConverged = resNorm < config.tolerance;
        metricDisplayValue = `||r||_inf = ${resNorm.toExponential(4)} < tol = ${config.tolerance}`;
        break;
      case 'ABSOLUTE_NORM':
        isStepConverged = absDiffNorm < config.tolerance;
        metricDisplayValue = `||Δx||_inf = ${absDiffNorm.toExponential(4)} < tol = ${config.tolerance}`;
        break;
      case 'RELATIVE_PERCENT':
      default:
        isStepConverged = maxEa < config.tolerance;
        metricDisplayValue = `Ea máx = ${maxEa.toFixed(4)}% < Es = ${config.tolerance}%`;
        break;
    }

    snapshots.push({
      k,
      x: [...currentX],
      previousX: prevX,
      substitutions: stepSubstitutions,
      approximateErrors,
      maxApproximateError: maxEa,
      residualVector: residual,
      residualInfNorm: resNorm,
      converged: isStepConverged,
      statusMessage: isStepConverged
        ? `Convergencia alcanzada (${metricDisplayValue})`
        : `Iteración completada (${config.errorMetric === 'RESIDUAL_NORM' ? `||r||_inf = ${resNorm.toExponential(4)}` : `Ea máx = ${maxEa.toFixed(4)}%`})`
    });

    if (isStepConverged) {
      converged = true;
      terminationReason = 'TOLERANCE_ACHIEVED';
      message = `Convergencia exitosa en ${k} iteraciones con criterio Es = ${config.tolerance}%.`;
      break;
    }
  }

  return {
    snapshots,
    converged,
    iterationsCompleted,
    terminationReason,
    message
  };
}
