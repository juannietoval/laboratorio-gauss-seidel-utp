import React, { useEffect, useRef } from 'react';
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
  const formulaRefs = useRef<(HTMLDivElement | null)[]>([]);

  const activeSnapshot = snapshots[currentStep] || snapshots[0];
  const maxStep = Math.max(0, snapshots.length - 1);

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

  // Renderizar fórmulas con KaTeX en los contenedores DOM
  useEffect(() => {
    if (!activeSnapshot || activeSnapshot.k === 0) return;

    activeSnapshot.substitutions.forEach((sub, idx) => {
      const el = formulaRefs.current[idx];
      if (el) {
        try {
          const pivot = A[sub.variableIndex][sub.variableIndex];
          const constVal = sub.numeratorDetails.constant;

          // Construcción de la cadena LaTeX con términos no nulos coloreados didácticamente
          const updatedParts = sub.numeratorDetails.updatedTerms
            .filter((t) => Math.abs(t.coeff) > 1e-12)
            .map((t) => {
              const sign = t.coeff > 0 ? '-' : '+';
              const coeffStr = Math.abs(t.coeff) === 1 ? '' : Math.abs(t.coeff).toString();
              return `{\\color{#34d399}${sign} ${coeffStr}(${t.val.toFixed(6)})}`;
            })
            .join(' ');

          const oldParts = sub.numeratorDetails.oldTerms
            .filter((t) => Math.abs(t.coeff) > 1e-12)
            .map((t) => {
              const sign = t.coeff > 0 ? '-' : '+';
              const coeffStr = Math.abs(t.coeff) === 1 ? '' : Math.abs(t.coeff).toString();
              return `{\\color{#f59e0b}${sign} ${coeffStr}(${t.val.toFixed(6)})}`;
            })
            .join(' ');

          const latexStr = `\\mathbf{${sub.variableName}^{(${activeSnapshot.k})}} = \\frac{${constVal} ${updatedParts} ${oldParts}}{${pivot}} = \\mathbf{${sub.newValue.toFixed(6)}}`;

          katex.render(latexStr, el, {
            throwOnError: false,
            displayMode: true
          });
        } catch {
          el.innerText = `${sub.variableName} = ${sub.newValue.toFixed(6)}`;
        }
      }
    });
  }, [activeSnapshot, A]);

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

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <svg className="card-title-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="4 17 10 11 4 5" />
            <line x1="12" y1="19" x2="20" y2="19" />
          </svg>
          Evolución del Método (Paso {currentStep} de {maxStep})
        </div>

        {/* Selector de velocidad */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Velocidad:</span>
          {[0.5, 1, 2].map((spd) => (
            <button
              key={spd}
              className={`btn ${playbackSpeed === spd ? 'btn-primary' : ''}`}
              style={{ padding: '2px 8px', fontSize: '0.75rem' }}
              onClick={() => setPlaybackSpeed(spd)}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>

      {/* Controles de Reproducción y Deslizador */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', background: 'rgba(15, 23, 42, 0.7)', padding: '10px 14px', borderRadius: '8px', border: '1px solid #334155' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className={`btn ${isPlaying ? 'btn-accent' : 'btn-primary'}`} onClick={handlePlayToggle}>
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
                {currentStep >= maxStep ? 'Reiniciar y Animar' : 'Animar'}
              </>
            )}
          </button>

          <button className="btn" onClick={handleStepPrev} disabled={currentStep === 0} title="Paso anterior">
            <svg className="btn-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="19 20 9 12 19 4 19 20" />
              <line x1="5" y1="19" x2="5" y2="5" />
            </svg>
          </button>

          <button className="btn" onClick={handleStepNext} disabled={currentStep >= maxStep} title="Paso siguiente">
            <svg className="btn-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5 4 15 12 5 20 5 4" />
              <line x1="19" y1="5" x2="19" y2="19" />
            </svg>
          </button>

          <button className="btn" onClick={handleReset} title="Reiniciar al paso 0">
            <svg className="btn-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
          </button>
        </div>

        {/* Deslizador de pasos */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '220px', maxWidth: '360px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Iteración:</span>
          <input
            type="range"
            min="0"
            max={maxStep}
            value={currentStep}
            onChange={(e) => {
              setIsPlaying(false);
              setCurrentStep(parseInt(e.target.value, 10));
            }}
            style={{ flex: 1, accentColor: '#38bdf8', cursor: 'pointer' }}
          />
          <span style={{ fontSize: '0.88rem', fontFamily: 'monospace', fontWeight: 700, color: '#38bdf8', minWidth: '40px' }}>
            k = {currentStep}
          </span>
        </div>
      </div>

      {/* Tarjeta de Sustitución Numérica y Desglose de Fórmulas */}
      <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid #334155', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(51, 65, 85, 0.5)', paddingBottom: '8px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff' }}>
            {activeSnapshot.k === 0 ? 'Vector Inicial x(0)' : `Actualización Secuencial en k = ${activeSnapshot.k}`}
          </span>
          <span style={{ fontSize: '0.78rem', color: activeSnapshot.converged ? '#34d399' : '#60a5fa' }}>
            {activeSnapshot.statusMessage}
          </span>
        </div>

        {activeSnapshot.k === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem', color: '#cbd5e1' }}>
            <p style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>
              Punto de partida ingresado para iniciar el proceso iterativo:
            </p>
            <div style={{ display: 'flex', gap: '20px', background: 'rgba(15, 23, 42, 0.8)', padding: '12px', borderRadius: '6px', fontFamily: 'monospace' }}>
              {activeSnapshot.x.map((val, idx) => (
                <div key={idx}>
                  <strong style={{ color: '#38bdf8' }}>{['x', 'y', 'z', 'w'][idx] || `x${idx + 1}`}(0):</strong> {val.toFixed(4)}
                </div>
              ))}
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Norma inicial del residuo ||r(0)||_inf = {activeSnapshot.residualInfNorm.toFixed(4)}. Pulsa <strong>Animar</strong> o <strong>Paso siguiente</strong> para iniciar el cálculo.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {activeSnapshot.substitutions.map((sub, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(15, 23, 42, 0.85)',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8' }}>
                    Incógnita {sub.variableName}
                  </span>
                  <div style={{ fontSize: '0.78rem', fontFamily: 'monospace' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Valor anterior: </span>
                    <span>{sub.previousValue.toFixed(4)}</span>
                    <span style={{ margin: '0 8px', color: '#64748b' }}>&rarr;</span>
                    <span style={{ color: '#ffffff', fontWeight: 700 }}>{sub.newValue.toFixed(6)}</span>
                    {sub.approximateError !== null && (
                      <span style={{ color: '#f59e0b', marginLeft: '10px' }}>
                        [Ea: {sub.approximateError.toFixed(4)}%]
                      </span>
                    )}
                  </div>
                </div>

                {/* Contenedor renderizado con KaTeX */}
                <div
                  ref={(el) => (formulaRefs.current[idx] = el)}
                  style={{
                    overflowX: 'auto',
                    padding: '6px 0',
                    color: '#f8fafc',
                    fontFamily: 'serif'
                  }}
                />

                <div style={{ fontSize: '0.72rem', color: '#94a3b8', borderTop: '1px dashed rgba(51, 65, 85, 0.4)', paddingTop: '6px' }}>
                  {sub.numeratorDetails.updatedTerms.length > 0 && (
                    <span style={{ color: '#34d399', marginRight: '14px' }}>
                      Valores nuevos ya actualizados utilizados: {sub.numeratorDetails.updatedTerms.map((t) => `${t.name}=${t.val.toFixed(4)}`).join(', ')}
                    </span>
                  )}
                  {sub.numeratorDetails.oldTerms.length > 0 && (
                    <span style={{ color: '#f59e0b' }}>
                      Valores del paso anterior utilizados: {sub.numeratorDetails.oldTerms.map((t) => `${t.name}=${t.val.toFixed(4)}`).join(', ')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
