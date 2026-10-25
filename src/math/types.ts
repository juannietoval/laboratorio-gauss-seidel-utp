export type Matrix = number[][];
export type Vector = number[];

export interface RowDominanceDetail {
  row: number;
  diagonal: number;
  sumOffDiagonal: number;
  satisfies: boolean;
  difference: number;
}

export interface DominanceAnalysis {
  isStrictlyDominant: boolean;
  rowDetails: RowDominanceDetail[];
  summaryMessage: string;
}

export interface VariableSubstitution {
  variableIndex: number;
  variableName: string;
  previousValue: number;
  newValue: number;
  numeratorDetails: {
    constant: number;
    updatedTerms: { index: number; name: string; coeff: number; val: number }[];
    oldTerms: { index: number; name: string; coeff: number; val: number }[];
  };
  approximateError: number | null; // Porcentual
}

export interface IterationSnapshot {
  k: number;
  x: Vector;
  previousX: Vector;
  substitutions: VariableSubstitution[];
  approximateErrors: (number | null)[]; // Ea por variable (%)
  maxApproximateError: number | null;
  residualVector: Vector;                // r = b - Ax
  residualInfNorm: number;               // ||r||_inf
  converged: boolean;
  statusMessage: string;
}

export interface GaussSeidelConfig {
  tolerance: number;        // Porcentaje (ej. 0.05%)
  maxIterations: number;    // Límite de iteraciones
  errorMetric: 'RELATIVE_PERCENT' | 'ABSOLUTE_NORM' | 'RESIDUAL_NORM';
}

export interface GaussSeidelExecutionResult {
  snapshots: IterationSnapshot[];
  converged: boolean;
  iterationsCompleted: number;
  terminationReason: 'TOLERANCE_ACHIEVED' | 'MAX_ITERATIONS' | 'DIVERGENCE_DETECTED' | 'ZERO_PIVOT';
  message: string;
}

export interface SystemValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface PresetSystem {
  id: string;
  name: string;
  description: string;
  dimension: number;
  A: Matrix;
  b: Vector;
  x0: Vector;
  recommendedTolerance: number;
}
