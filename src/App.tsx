import React, { useState, useMemo, useCallback } from 'react';
import { Header } from './components/layout/Header';
import { MatrixEditor } from './components/matrix-editor/MatrixEditor';
import { IterationCore } from './components/iteration-core/IterationCore';
import { AnalysisPanel } from './components/analysis/AnalysisPanel';
import { ConvergenceChart } from './components/charts/ConvergenceChart';
import { Geometry3DView } from './components/geometry/Geometry3DView';
import { ExportModal } from './components/export/ExportModal';

import { Matrix, Vector, GaussSeidelConfig, PresetSystem } from './math/types';
import { PRESET_SYSTEMS } from './math/presets';
import { validateSystem } from './math/validator';
import { analyzeDiagonalDominance } from './math/dominance';
import { solveExactSystem } from './math/exactSolver';
import { findBestRowPermutation, swapRows } from './math/reordering';
import { runGaussSeidel } from './math/gaussSeidelEngine';

export const App: React.FC = () => {
  // Inicialización con el Ejemplo 2 Reorganizado del cuaderno UTP
  const defaultPreset = PRESET_SYSTEMS[2];

  const [dimension, setDimensionState] = useState<number>(defaultPreset.dimension);
  const [A, setA] = useState<Matrix>(defaultPreset.A);
  const [b, setB] = useState<Vector>(defaultPreset.b);
  const [x0, setX0] = useState<Vector>(defaultPreset.x0);

  const [config, setConfig] = useState<GaussSeidelConfig>({
    tolerance: defaultPreset.recommendedTolerance,
    maxIterations: 40,
    errorMetric: 'RELATIVE_PERCENT'
  });

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);

  // Validación del sistema lineal
  const validation = useMemo(() => validateSystem(A, b, x0), [A, b, x0]);

  // Análisis de dominancia diagonal
  const dominance = useMemo(() => analyzeDiagonalDominance(A), [A]);

  // Solución analítica exacta de referencia
  const { solution: exactSolution, determinant, isSingular } = useMemo(
    () => solveExactSystem(A, b),
    [A, b]
  );

  // Ejecución de Gauss-Seidel inmutable
  const executionResult = useMemo(() => {
    if (!validation.isValid) {
      return {
        snapshots: [
          {
            k: 0,
            x: [...x0],
            previousX: [...x0],
            substitutions: [],
            approximateErrors: new Array(dimension).fill(null),
            maxApproximateError: null,
            residualVector: new Array(dimension).fill(0),
            residualInfNorm: 0,
            converged: false,
            statusMessage: 'El sistema presenta inconsistencias de entrada.'
          }
        ],
        converged: false,
        iterationsCompleted: 0,
        terminationReason: 'ZERO_PIVOT' as const,
        message: 'No ejecutable.'
      };
    }
    return runGaussSeidel(A, b, x0, config);
  }, [A, b, x0, config, validation.isValid, dimension]);

  const snapshots = executionResult.snapshots;

  // Ajuste seguro de paso si cambia el número de iteraciones
  const safeCurrentStep = Math.min(currentStep, snapshots.length - 1);

  // Cambiar dimensión
  const handleSetDimension = (newDim: number) => {
    if (newDim === dimension) return;
    setIsPlaying(false);
    setDimensionState(newDim);

    // Crear matrices identidades adaptadas
    const newA: Matrix = Array.from({ length: newDim }, (_, i) =>
      Array.from({ length: newDim }, (__, j) => (i === j ? 4 : 1))
    );
    const newB: Vector = Array.from({ length: newDim }, (_, i) => (i + 1) * 3);
    const newX0: Vector = new Array(newDim).fill(0);

    setA(newA);
    setB(newB);
    setX0(newX0);
    setCurrentStep(0);
  };

  // Cargar preset educativo
  const handleLoadPreset = (preset: PresetSystem) => {
    setIsPlaying(false);
    setDimensionState(preset.dimension);
    setA(preset.A);
    setB(preset.b);
    setX0(preset.x0);
    setConfig((prev) => ({ ...prev, tolerance: preset.recommendedTolerance }));
    setCurrentStep(0);
  };

  // Permutación manual de filas
  const handleSwapRows = (r1: number, r2: number) => {
    setIsPlaying(false);
    const { A: newA, b: newB } = swapRows(A, b, r1, r2);
    setA(newA);
    setB(newB);
    setCurrentStep(0);
  };

  // Reordenamiento automático
  const handleAutoReorder = () => {
    setIsPlaying(false);
    const proposal = findBestRowPermutation(A, b);
    setA(proposal.reorderedA);
    setB(proposal.reorderedB);
    setCurrentStep(0);
  };

  const handleManualExecute = useCallback(() => {
    setIsPlaying(false);
    setCurrentStep(0);
  }, []);

  return (
    <div className="app-container">
      <Header />

      <main className="main-content">
        {/* Barra superior de estado y métricas globales de ejecución */}
        <div className="status-strip-card">
          <div className="status-strip-kpis">
            <div className="status-kpi-item">
              <span>Estado del método:</span>
              <span className={executionResult.converged ? 'badge-success' : 'badge-warning'}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: '13px', height: '13px' }}>
                  {executionResult.converged ? (
                    <polyline points="20 6 9 17 4 12" />
                  ) : (
                    <>
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </>
                  )}
                </svg>
                {executionResult.converged ? 'Convergencia Verificada' : 'Límite de Iteraciones / Divergente'}
              </span>
            </div>

            <div className="status-kpi-item">
              <span>Iteración actual:</span>
              <strong>{safeCurrentStep} de {Math.max(0, snapshots.length - 1)}</strong>
            </div>

            <div className="status-kpi-item">
              <span>Criterio de parada:</span>
              <strong>
                {config.errorMetric === 'RELATIVE_PERCENT'
                  ? `Tolerancia ε = ${config.tolerance}%`
                  : config.errorMetric === 'RESIDUAL_NORM'
                  ? `Norma ||r||∞ < ${config.tolerance}`
                  : `Norma ||Δx||∞ < ${config.tolerance}`}
              </strong>
            </div>
          </div>

          <button className="btn btn-secondary" onClick={() => setShowExportModal(true)}>
            <svg className="btn-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Exportar Resultados
          </button>
        </div>

        {/* REJILLA CIENTÍFICA DE 3 PANELES */}
        <div className="tri-panel-grid">
          {/* PANEL IZQUIERDO: CONFIGURACIÓN Y ENTRADA */}
          <MatrixEditor
            dimension={dimension}
            setDimension={handleSetDimension}
            A={A}
            setA={setA}
            b={b}
            setB={setB}
            x0={x0}
            setX0={setX0}
            config={config}
            setConfig={setConfig}
            validation={validation}
            onExecute={handleManualExecute}
            onAutoReorder={handleAutoReorder}
            onSwapRows={handleSwapRows}
            onLoadPreset={handleLoadPreset}
          />

          {/* PANEL CENTRAL: EVOLUCIÓN DE GAUSS-SEIDEL Y VISTAS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <IterationCore
              snapshots={snapshots}
              currentStep={safeCurrentStep}
              setCurrentStep={setCurrentStep}
              isPlaying={isPlaying}
              setIsPlaying={setIsPlaying}
              playbackSpeed={playbackSpeed}
              setPlaybackSpeed={setPlaybackSpeed}
              A={A}
            />

            {/* Vista 3D si n=3 */}
            <Geometry3DView
              dimension={dimension}
              A={A}
              b={b}
              snapshots={snapshots}
              currentStep={safeCurrentStep}
              exactSolution={exactSolution}
            />

            {/* Gráfica de convergencia del error y residuo */}
            <ConvergenceChart
              snapshots={snapshots}
              tolerance={config.tolerance}
              errorMetric={config.errorMetric}
            />
          </div>

          {/* PANEL DERECHO: ANÁLISIS, DOMINANCIA E HISTORIAL */}
          <AnalysisPanel
            dominance={dominance}
            snapshots={snapshots}
            currentStep={safeCurrentStep}
            onSelectStep={setCurrentStep}
            exactSolution={exactSolution}
            determinant={determinant}
            isSingular={isSingular}
          />
        </div>
      </main>

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        A={A}
        b={b}
        snapshots={snapshots}
        exactSolution={exactSolution}
      />
    </div>
  );
};
