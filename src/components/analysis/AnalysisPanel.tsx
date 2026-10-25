import React from 'react';
import { DominanceAnalysis, IterationSnapshot, Vector } from '../../math/types';

interface AnalysisPanelProps {
  dominance: DominanceAnalysis;
  snapshots: IterationSnapshot[];
  currentStep: number;
  onSelectStep: (k: number) => void;
  exactSolution: Vector | null;
  determinant: number;
  isSingular: boolean;
}

const VARIABLE_NAMES = ['x', 'y', 'z', 'w'];

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  dominance,
  snapshots,
  currentStep,
  onSelectStep,
  exactSolution,
  determinant,
  isSingular
}) => {
  const activeSnapshot = snapshots[currentStep] || snapshots[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. ANÁLISIS DE DOMINANCIA DIAGONAL */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <svg className="card-title-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            Dominancia Diagonal Estricta
          </div>
          <span
            className="inst-badge"
            style={{
              backgroundColor: dominance.isStrictlyDominant ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
              color: dominance.isStrictlyDominant ? '#34d399' : '#f87171',
              borderColor: dominance.isStrictlyDominant ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'
            }}
          >
            {dominance.isStrictlyDominant ? 'Garantizada' : 'Sin Garantía Teórica'}
          </span>
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Condición suficiente habitual: <code style={{ color: '#38bdf8' }}>|a_ii| &gt; ∑_(j≠i) |a_ij|</code>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: 'rgba(15, 23, 42, 0.6)', padding: '10px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.8rem' }}>
          {dominance.rowDetails.map((d) => (
            <div
              key={d.row}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                color: d.satisfies ? '#34d399' : '#f87171',
                padding: '2px 0',
                borderBottom: '1px dashed rgba(51, 65, 85, 0.4)'
              }}
            >
              <span>Fila {d.row}: |{d.diagonal}| &gt; {d.sumOffDiagonal}</span>
              <span style={{ fontWeight: 600 }}>{d.satisfies ? 'CUMPLE' : 'NO CUMPLE'}</span>
            </div>
          ))}
        </div>

        <p style={{ fontSize: '0.76rem', color: '#94a3b8' }}>
          {dominance.summaryMessage}
        </p>
      </div>

      {/* 2. SOLUCIÓN ANALÍTICA EXACTA Y RESIDUO */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <svg className="card-title-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M7 15h0M2 9.5h20" />
            </svg>
            Solución Exacta & Residuo Actual
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
          {isSingular ? (
            <div style={{ color: '#f87171' }}>Matriz singular o indeterminada (det = 0).</div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Determinante det(A):</span>
                <strong style={{ color: '#ffffff', fontFamily: 'monospace' }}>{Math.round(determinant * 1e4) / 1e4}</strong>
              </div>

              {exactSolution && (
                <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '8px 12px', borderRadius: '6px', fontFamily: 'monospace' }}>
                  <div style={{ color: '#a855f7', fontWeight: 600, marginBottom: '4px' }}>x* exacto (A⁻¹b):</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                    {exactSolution.map((val, idx) => (
                      <span key={idx}>
                        {VARIABLE_NAMES[idx] || `x${idx + 1}`}* = <strong>{val.toFixed(6)}</strong>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Comparación de Error Verdadero en el paso actual */}
              {exactSolution && activeSnapshot.k > 0 && (
                <div style={{ fontSize: '0.76rem', color: '#34d399' }}>
                  Error frente a solución exacta (k={activeSnapshot.k}):
                  {activeSnapshot.x.map((val, idx) => {
                    const exact = exactSolution[idx];
                    const isZeroExact = Math.abs(exact) < 1e-12;
                    const et = isZeroExact
                      ? Math.abs(exact - val)
                      : (Math.abs(exact - val) / Math.abs(exact)) * 100;
                    return (
                      <span key={idx} style={{ marginLeft: '8px', fontFamily: 'monospace' }}>
                        Et_{VARIABLE_NAMES[idx]}: {et.toFixed(4)}{isZeroExact ? ' (abs)' : '%'}
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Norma del residuo */}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '4px', fontFamily: 'monospace' }}>
                <span style={{ color: 'var(--text-muted)' }}>Norma del residuo ||r(k)||_inf:</span>
                <strong style={{ color: '#f59e0b' }}>{activeSnapshot.residualInfNorm.toExponential(4)}</strong>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 3. TABLA COMPLETA DE ITERACIONES */}
      <div className="card" style={{ flex: 1 }}>
        <div className="card-header">
          <div className="card-title">
            <svg className="card-title-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
            Historial de Iteraciones
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Clic para inspeccionar</span>
        </div>

        <div style={{ overflowX: 'auto', maxHeight: '280px', overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'right' }}>
            <thead>
              <tr style={{ background: '#0b1120', color: 'var(--text-muted)', borderBottom: '1px solid #334155' }}>
                <th style={{ padding: '8px 10px', textAlign: 'center' }}>k</th>
                {snapshots[0].x.map((_, i) => (
                  <th key={i} style={{ padding: '8px 10px' }}>{VARIABLE_NAMES[i] || `x${i + 1}`}</th>
                ))}
                <th style={{ padding: '8px 10px' }}>Ea máx (%)</th>
                <th style={{ padding: '8px 10px' }}>||r||_inf</th>
              </tr>
            </thead>
            <tbody>
              {snapshots.map((snap) => {
                const isActive = snap.k === currentStep;
                return (
                  <tr
                    key={snap.k}
                    onClick={() => onSelectStep(snap.k)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectStep(snap.k);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`Ver iteración k=${snap.k}`}
                    style={{
                      cursor: 'pointer',
                      background: isActive ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                      borderBottom: '1px solid rgba(51, 65, 85, 0.4)',
                      outline: isActive ? '1px solid #38bdf8' : 'none'
                    }}
                  >
                    <td style={{ padding: '6px 10px', textAlign: 'center', fontWeight: 700, fontFamily: 'monospace' }}>
                      {snap.k}
                    </td>
                    {snap.x.map((val, idx) => (
                      <td key={idx} style={{ padding: '6px 10px', fontFamily: 'monospace' }}>
                        {val.toFixed(4)}
                      </td>
                    ))}
                    <td style={{ padding: '6px 10px', fontFamily: 'monospace', color: '#f59e0b' }}>
                      {snap.maxApproximateError !== null ? `${snap.maxApproximateError.toFixed(4)}%` : '—'}
                    </td>
                    <td style={{ padding: '6px 10px', fontFamily: 'monospace', color: '#94a3b8' }}>
                      {snap.residualInfNorm.toExponential(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
