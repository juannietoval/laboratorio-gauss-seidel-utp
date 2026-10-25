import { PresetSystem } from './types';

export const PRESET_SYSTEMS: PresetSystem[] = [
  {
    id: 'ejemplo-1-utp',
    name: 'Ejemplo 1 (Cuaderno UTP - Diagonal Dominante)',
    description: 'Sistema 3x3 estrictamente diagonal dominante que converge rápidamente de forma natural.',
    dimension: 3,
    A: [
      [4, 1, 1],
      [1, 3, 1],
      [1, 1, 5]
    ],
    b: [7, 8, 10],
    x0: [0, 0, 0],
    recommendedTolerance: 0.05
  },
  {
    id: 'ejemplo-2-original',
    name: 'Ejemplo 2 (Cuaderno UTP - Orden Original Divergente)',
    description: 'Sistema 3x3 con diagonal débil (|1| < sum). Permite experimentar la falta de convergencia sin reordenar.',
    dimension: 3,
    A: [
      [1, 3, 1],
      [2, 1, 4],
      [5, 1, 1]
    ],
    b: [5, 6, 7],
    x0: [0, 0, 0],
    recommendedTolerance: 0.05
  },
  {
    id: 'ejemplo-2-reorganizado',
    name: 'Ejemplo 2 Reorganizado (Convergencia Garantizada)',
    description: 'Mismo sistema del Ejemplo 2 con filas permutadas: fila 3 -> fila 1, fila 1 -> fila 2, fila 2 -> fila 3. Cumple dominancia y converge en k=6.',
    dimension: 3,
    A: [
      [5, 1, 1],
      [1, 3, 1],
      [2, 1, 4]
    ],
    b: [7, 5, 6],
    x0: [0, 0, 0],
    recommendedTolerance: 0.05
  },
  {
    id: 'sistema-2x2-didactico',
    name: 'Sistema 2x2 Didáctico',
    description: 'Sistema sencillo de dos incógnitas para iniciación rápida y verificación gráfica en el plano cartesiano.',
    dimension: 2,
    A: [
      [3, 1],
      [1, 4]
    ],
    b: [5, 6],
    x0: [0, 0],
    recommendedTolerance: 0.01
  },
  {
    id: 'sistema-pivote-cero',
    name: 'Sistema con Pivote Cero en Diagonal',
    description: 'Presenta un coeficiente a_11 = 0. Ilustra cómo el reordenamiento de filas es indispensable para poder aplicar Gauss-Seidel.',
    dimension: 3,
    A: [
      [0, 2, 1],
      [3, 1, 1],
      [1, 1, 4]
    ],
    b: [4, 5, 6],
    x0: [0, 0, 0],
    recommendedTolerance: 0.05
  }
];
