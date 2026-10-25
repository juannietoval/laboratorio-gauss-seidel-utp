# Arquitectura del Sistema (ARCHITECTURE)

**Proyecto:** Laboratorio Virtual de Gauss-Seidel  
**Institución:** Universidad Tecnológica de Pereira  

---

## 1. Principio Fundamental: Separación Absoluta de Responsabilidades

El núcleo matemático del laboratorio está totalmente desacoplado de la biblioteca de interfaz de usuario. El motor numérico opera como una librería TypeScript independiente en `src/math/`, sin ninguna referencia a React, DOM o librerías de renderizado visual.

```
       +-------------------------------------------------------------+
       |                   Capa de Presentación                      |
       |                (React 18/19 + TypeScript)                   |
       |  +------------------+  +-----------------+  +------------+  |
       |  |  MatrixEditor    |  |  IterationCore  |  |  Analysis  |  |
       |  +------------------+  +-----------------+  +------------+  |
       |  |  ControlsBar     |  |  Plotly3DView   |  |  ErrorPlot |  |
       |  +------------------+  +-----------------+  +------------+  |
       +------------------------------+------------------------------+
                                      | Lee estados inmutables
                                      v
       +-------------------------------------------------------------+
       |                     Estado del Laboratorio                  |
       |              (Custom React Hooks / Reducer)                 |
       +------------------------------+------------------------------+
                                      | Invoca funciones puras
                                      v
       +-------------------------------------------------------------+
       |               Capa Matemática Pura (src/math/)              |
       |  +-----------------+  +------------------+  +------------+  |
       |  |  validator.ts   |  |  dominance.ts    |  |  reorder.ts|  |
       |  +-----------------+  +------------------+  +------------+  |
       |  |  errors.ts      |  |  exactSolver.ts  |  |  engine.ts |  |
       |  +-----------------+  +------------------+  +------------+  |
       +-------------------------------------------------------------+
```

---

## 2. Modelos de Datos Centrales

```typescript
export type Matrix = number[][];
export type Vector = number[];

export interface StepSubstitution {
  variableIndex: number;
  variableName: string;
  formulaString: string;
  previousValue: number;
  newValue: number;
  substitutedValues: { index: number; name: string; value: number; isUpdated: boolean }[];
  approximateError: number | null;
}

export interface IterationSnapshot {
  k: number;
  x: Vector;
  previousX: Vector;
  substitutions: StepSubstitution[];
  approximateErrors: (number | null)[]; // Ea por variable
  maxApproximateError: number | null;
  residualVector: Vector;                // r = b - Ax
  residualInfNorm: number;               // ||r||_inf
  converged: boolean;
  statusMessage: string;
}

export interface GaussSeidelResult {
  snapshots: IterationSnapshot[];
  converged: boolean;
  iterationsCompleted: number;
  terminationReason: 'TOLERANCE_ACHIEVED' | 'MAX_ITERATIONS' | 'DIVERGENCE_DETECTED' | 'ZERO_PIVOT';
}
```

---

## 3. Inmutabilidad y Trazabilidad

Cada ejecución de Gauss-Seidel genera un array inmutable `IterationSnapshot[]`. Cuando el usuario pulsa *Paso siguiente*, *Paso anterior* o mueve el control deslizante, la aplicación no realiza recálculos numéricos sobre la marcha; simplemente selecciona el índice correspondiente del array inmutable. Esto garantiza:
1. Determinismo absoluto.
2. Cero discrepancias entre la tabla, las fórmulas de KaTeX y el gráfico 3D.
3. Desempeño óptimo de 60 FPS durante la animación.
