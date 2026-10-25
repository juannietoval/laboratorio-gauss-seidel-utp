import React, { useEffect, useRef, useState } from 'react';
import katex from 'katex';
import { IterationSnapshot, Matrix } from '../../math/types';

interface IterationCoreProps {
  snapshots: IterationSnapshot[];
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  playbackSpeed: number;
  setPlaybackSpeed: (speed: number) => void;
  A: Matrix;
}

const VARIABLE_NAMES = ['x₁', 'x₂', 'x₃', 'x₄', 'x₅'];

export const IterationCore: React.FC<IterationCoreProps> = ({
  snapshots,
  currentStep,
  setCurrentStep,
  isPlaying,
  setIsPlaying,
  playbackSpeed,
  setPlaybackSpeed,
  A
}) => {
  const [selectedVarIndex, setSelectedVarIndex] = useState<number>(0);
  const symbolicFormulaRef = useRef<HTMLDivElement | null>(null);
  const substitutedFormulaRef = useRef<HTMLDivElement | null>(null);

  const activeSnapshot = snapshots[currentStep] || snapshots[0];
  const maxStep = Math.max(0, snapshots.length - 1);
  const dimension = A.length;

  // Ajustar selectedVarIndex si la dimensión cambia
  const safeVarIndex = Math.min(selectedVarIndex, dimension - 1);

  // Intervalo de reproducción automática
  useEffect(() => {
    let timer: number | null = null;
    if (isPlaying) {
      timer = window.setInterval(() => {
        setCurrentStep((prev) => {
          if (prev < maxStep) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, 1200 / playbackSpeed);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, playbackSpeed, maxStep, setCurrentStep, setIsPlaying]);

  // Renderizar Fórmulas Simbólica y Numérica con KaTeX
  useEffect(() => {
    // 1. Fórmula simbólica genérica adaptada a la variable activa
    if (symbolicFormulaRef.current) {
      const iPlus1 = safeVarIndex + 1;
      const kStr = activeSnapshot.k > 0 ? activeSnapshot.k.toString() : 'k+1';
      const kPrevStr = activeSnapshot.k > 0 ? (activeSnapshot.k - 1).toString() : 'k';
      
      const symbolicLatex = `x_{${iPlus1}}^{(${kStr})} = \\frac{1}{a_{${iPlus1}${iPlus1}}} \\left[ b_{${iPlus1}} - \\sum_{j < ${iPlus1}} a_{${iPlus1}j} \\, x_j^{(${kStr})} - \\sum_{j > ${iPlus1}} a_{${iPlus1}j} \\, x_j^{(${kPrevStr})} \\right]`;

      try {
        katex.render(symbolicLatex, symbolicFormulaRef.current, {
          throwOnError: false,
          displayMode: true
        });
      } catch {
        symbolicFormulaRef.current.innerText = `x_${iPlus1}^(${kStr}) = ...`;
      }
    }

    // 2. Fórmula con sustitución numérica real de la incógnita activa
    if (substitutedFormulaRef.current) {
      if (!activeSnapshot || activeSnapshot.k === 0 || !activeSnapshot.substitutions[safeVarIndex]) {
        substitutedFormulaRef.current.innerHTML = '';
        return;
      }

      const sub = activeSnapshot.substitutions[safeVarIndex];
      try {
        const pivot = A[sub.variableIndex][sub.variableIndex];
        const constVal = sub.numeratorDetails.constant;

        // Términos actualizados en esta iteración (coloreados en verde azulado oscuro matemático)
        const updatedParts = sub.numeratorDetails.updatedTerms
          .filter((t) => Math.abs(t.coeff) > 1e-12)
          .map((t) => {
            const sign = t.coeff > 0 ? '-' : '+';
            const coeffStr = Math.abs(t.coeff) === 1 ? '' : Math.abs(t.coeff).toString();
            return `{\\mathbf{\\color{#0F766E}${sign} ${coeffStr}(${t.val.toFixed(4)})}}`;
          })
          .join(' ');

        // Términos de la iteración previa (coloreados en ámbar oscuro)
        const oldParts = sub.numeratorDetails.oldTerms
          .filter((t) => Math.abs(t.coeff) > 1e-12)
          .map((t) => {
            const sign = t.coeff > 0 ? '-' : '+';
            const coeffStr = Math.abs(t.coeff) === 1 ? '' : Math.abs(t.coeff).toString();
            return `{\\mathbf{\\color{#92400E}${sign} ${coeffStr}(${t.val.toFixed(4)})}}`;
          })
          .join(' ');

        const substitutedLatex = `x_{${safeVarIndex + 1}}^{(${activeSnapshot.k})} = \\frac{${constVal} ${updatedParts} ${oldParts}}{${pivot}} = \\mathbf{${sub.newValue.toFixed(6)}}`;

        katex.render(substitutedLatex, substitutedFormulaRef.current, {
          throwOnError: false,
          displayMode: true
        });
      } catch {
        substitutedFormulaRef.current.innerText = `${sub.variableName} = ${sub.newValue.toFixed(6)}`;
      }
    }
  }, [activeSnapshot, safeVarIndex, A]);

  const handlePlayToggle = () => {
    if (currentStep >= maxStep) {
      setCurrentStep(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleStepNext = () => {
    setIsPlaying(false);
    if (currentStep < maxStep) setCurrentStep(currentStep + 1);
  };

  const handleStepPrev = () => {
    setIsPlaying(false);
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  const handleGoToEnd = () => {
    setIsPlaying(false);
    setCurrentStep(maxStep);
  };

  const currentSub = activeSnapshot.substitutions ? activeSnapshot.substitutions[safeVarIndex] : null;

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Encabezado del Panel Central */}
      <div className="card-header">
        <div>
          <div className="card-title">
            <svg className="card-title-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="4 17 10 11 4 5" />
              <line x1="12" y1="19" x2="20" y2="19" />
            </svg>
            Evolución de Gauss-Seidel
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Paso a paso con actualización secuencial inmediata
          </span>
        </div>

        {/* Selector de Velocidad */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Velocidad:</span>
          {[0.5, 1, 2].map((spd) => (
            <button
              key={spd}
              className={`btn ${playbackSpeed === spd ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '2px 8px', fontSize: '0.75rem' }}
              onClick={() => setPlaybackSpeed(spd)}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>

      {/* Barra de Reproducción y Deslizador */}
      <div className="playback-bar">
        {/* Botones de Control de Reproducción */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button className="btn btn-secondary" onClick={handleReset} title="Ir al inicio (k=0)" aria-label="Inicio">
            <svg className="btn-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="19 20 9 12 19 4 19 20" />
              <line x1="5" y1="19" x2="5" y2="5" />
            </svg>
          </button>

          <button className="btn btn-secondary" onClick={handleStepPrev} disabled={currentStep === 0} title="Iteración anterior" aria-label="Anterior">
            <svg className="btn-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="15 18 9 12 15 6 15 18" />
            </svg>
          </button>

          <button
            className={`btn ${isPlaying ? 'btn-secondary' : 'btn-primary'}`}
            onClick={handlePlayToggle}
            style={{ minWidth: '100px', justifyContent: 'center' }}
            aria-label={isPlaying ? 'Pausar simulación' : 'Reproducir simulación'}
          >
            {isPlaying ? (
              <>
                <svg className="btn-svg" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
                Pausar
              </>
            ) : (
              <>
                <svg className="btn-svg" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                {currentStep >= maxStep ? 'Reiniciar' : 'Animar'}
              </>
            )}
          </button>

          <button className="btn btn-secondary" onClick={handleStepNext} disabled={currentStep >= maxStep} title="Iteración siguiente" aria-label="Siguiente">
            <svg className="btn-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="9 18 15 12 9 6 9 18" />
            </svg>
          </button>

          <button className="btn btn-secondary" onClick={handleGoToEnd} disabled={currentStep >= maxStep} title="Ir a la última iteración" aria-label="Fin">
            <svg className="btn-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5 4 15 12 5 20 5 4" />
              <line x1="19" y1="5" x2="19" y2="19" />
            </svg>
          </button>
        </div>

        {/* Deslizador de pasos */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '200px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Paso:</span>
          <input
            type="range"
            min="0"
            max={maxStep}
            value={currentStep}
            onChange={(e) => {
              setIsPlaying(false);
              setCurrentStep(parseInt(e.target.value, 10));
            }}
            style={{ flex: 1, accentColor: 'var(--primary-blue)', cursor: 'pointer' }}
            aria-label="Paso de iteración"
          />
          <span style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary-blue)', minWidth: '60px', textAlign: 'right' }}>
            k = {currentStep} / {maxStep}
          </span>
        </div>
      </div>

      {/* CASO K = 0 (VECTOR INICIAL) */}
      {activeSnapshot.k === 0 ? (
        <div style={{ backgroundColor: 'var(--surface-subtle)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Vector de Aproximación Inicial x⁽⁰⁾</strong>
            <span className="badge-info">Paso Inicial</span>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>
            Punto de partida del método iterativo. Pulsa <strong>Animar</strong> o <strong>Siguiente</strong> para observar la primera iteración $k=1$.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${dimension}, 1fr)`, gap: '10px', marginTop: '6px' }}>
            {activeSnapshot.x.map((val, idx) => (
              <div key={idx} style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', padding: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                  {VARIABLE_NAMES[idx] || `x${idx + 1}`}⁽⁰⁾
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-blue)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                  {val.toFixed(4)}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* CASO K >= 1: PASO ACTIVO CON STEPPER DE VARIABLE Y DESGLOSE KATEX */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Selector de Incógnita Activa (Stepper de Variable) */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Incógnita en evaluación secuencial:
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              {Array.from({ length: dimension }, (_, idx) => {
                const isSelected = idx === safeVarIndex;
                return (
                  <button
                    key={idx}
                    className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '4px 12px', fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}
                    onClick={() => setSelectedVarIndex(idx)}
                  >
                    {VARIABLE_NAMES[idx] || `x${idx + 1}`}⁽{activeSnapshot.k}⁾
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bloque 1: Formulación Simbólica */}
          <div style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '12px 16px' }}>
            <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px' }}>
              Ecuación Despejada (Formulación Simbólica)
            </div>
            <div ref={symbolicFormulaRef} style={{ overflowX: 'auto', fontSize: '0.98rem', color: 'var(--text-primary)', padding: '4px 0' }} />
          </div>

          {/* Bloque 2: Sustitución Numérica con Términos Coloreados Didácticamente */}
          <div style={{ backgroundColor: 'var(--surface-subtle)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 600 }}>
                Sustitución Numérica en Iteración k = {activeSnapshot.k}
              </span>
              <div style={{ display: 'flex', gap: '12px', fontSize: '0.72rem' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--math-teal)', fontWeight: 600 }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--math-teal)' }}></span>
                  Actualizado en k
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--warning-amber)', fontWeight: 600 }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--warning-amber)' }}></span>
                  Paso previo k-1
                </span>
              </div>
            </div>
            <div ref={substitutedFormulaRef} style={{ overflowX: 'auto', fontSize: '1.05rem', color: 'var(--text-primary)', padding: '6px 0' }} />
          </div>

          {/* Bloque 3: Subgrid de Valores Utilizados vs Resultado */}
          {currentSub && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
              {/* Columna Izquierda: Valores Utilizados */}
              <div style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  Valores utilizados en este cálculo:
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem' }}>
                  {currentSub.numeratorDetails.updatedTerms.length > 0 && (
                    <div style={{ backgroundColor: 'var(--math-teal-light)', border: '1px solid var(--math-teal-border)', borderRadius: 'var(--radius-sm)', padding: '6px 8px', color: 'var(--math-teal)' }}>
                      <strong>Valores recién actualizados (k):</strong>{' '}
                      {currentSub.numeratorDetails.updatedTerms.map((t) => `${t.name} = ${t.val.toFixed(4)}`).join(', ')}
                    </div>
                  )}
                  {currentSub.numeratorDetails.oldTerms.length > 0 && (
                    <div style={{ backgroundColor: 'var(--warning-bg)', border: '1px solid var(--warning-border)', borderRadius: 'var(--radius-sm)', padding: '6px 8px', color: 'var(--warning-amber)' }}>
                      <strong>Valores de iteración anterior (k-1):</strong>{' '}
                      {currentSub.numeratorDetails.oldTerms.map((t) => `${t.name} = ${t.val.toFixed(4)}`).join(', ')}
                    </div>
                  )}
                </div>
              </div>

              {/* Columna Derecha: Resultado y Error */}
              <div style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  Resultado de la incógnita {currentSub.variableName}:
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-blue)', fontFamily: 'var(--font-mono)' }}>
                    {currentSub.newValue.toFixed(6)}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                    (antes: {currentSub.previousValue.toFixed(4)})
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', marginTop: 'auto' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Error aprox:</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                    {currentSub.approximateError !== null ? `${currentSub.approximateError.toFixed(4)}%` : '—'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Bloque 4: Callout Pedagógico */}
          <div className="tip-callout">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <div>
              <strong>Principio Didáctico de Gauss-Seidel:</strong> A diferencia de Jacobi, que almacena todos los valores hasta completar la iteración, Gauss-Seidel sustituye de inmediato el valor obtenido de cada variable en las ecuaciones subsecuentes dentro del mismo ciclo, acelerando la tasa de contracción del error.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
