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

const VARIABLE_NAMES = ['x₁', 'x₂', 'x₃', 'x₄', 'x₅'];

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 1. DIAGNÓSTICO Y MÉTRICAS CLAVE DE LA ITERACIÓN ACTUAL */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <svg className="card-title-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
            Diagnóstico de la Iteración k = {activeSnapshot.k}
          </div>
          <span className={activeSnapshot.converged ? 'badge-success' : 'badge-info'}>
            {activeSnapshot.converged ? 'Convergencia Verificada' : 'En Cálculo'}
          </span>
        </div>

        {/* Rejilla de Métricas KPI */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '4px' }}>
          {/* KPI 1: Error Máximo Aproximado */}
          <div style={{ backgroundColor: 'var(--surface-subtle)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', padding: '10px' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Error Aprox. Máx (Ea):
            </span>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--primary-blue)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
              {activeSnapshot.maxApproximateError !== null
                ? `${activeSnapshot.maxApproximateError.toFixed(4)}%`
                : 'Paso 0'}
            </div>
          </div>

          {/* KPI 2: Norma del Residuo */}
          <div style={{ backgroundColor: 'var(--surface-subtle)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', padding: '10px' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Norma Residuo ||r||∞:
            </span>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--math-teal)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
              {activeSnapshot.residualInfNorm.toExponential(3)}
            </div>
          </div>
        </div>

        {/* Determinante y Condición */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', padding: '6px 8px', backgroundColor: 'var(--surface-subtle)', borderRadius: 'var(--radius-xs)' }}>
          <span>Determinante de la matriz det(A):</span>
          <strong style={{ fontFamily: 'var(--font-mono)', color: isSingular ? 'var(--danger-red)' : 'var(--text-primary)' }}>
            {Math.round(determinant * 1e4) / 1e4}
          </strong>
        </div>
      </div>

      {/* 2. ANÁLISIS DE DOMINANCIA DIAGONAL */}
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
          <span className={dominance.isStrictlyDominant ? 'badge-success' : 'badge-warning'}>
            {dominance.isStrictlyDominant ? 'Garantizada' : 'Sin Garantía Teórica'}
          </span>
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
          Condición suficiente: <code style={{ color: 'var(--primary-blue)', fontWeight: 600 }}>|a_ii| &gt; &Sigma;_(j&ne;i) |a_ij|</code>
        </div>

        {/* Desglose por filas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', backgroundColor: 'var(--surface-subtle)', border: '1px solid var(--border-default)', padding: '8px 10px', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
          {dominance.rowDetails.map((d) => (
            <div
              key={d.row}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '4px 0',
                borderBottom: '1px solid var(--border-subtle)',
                color: d.satisfies ? 'var(--success-green)' : 'var(--warning-amber)'
              }}
            >
              <span>Fila {d.row}: |{d.diagonal}| &gt; {d.sumOffDiagonal}</span>
              <span style={{ fontWeight: 700 }}>{d.satisfies ? 'CUMPLE' : 'NO CUMPLE'}</span>
            </div>
          ))}
        </div>

        <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
          {dominance.summaryMessage}
        </p>
      </div>

      {/* 3. SOLUCIÓN ANALÍTICA EXACTA Y COMPARACIÓN */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <svg className="card-title-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M7 15h0M2 9.5h20" />
            </svg>
            Solución Exacta vs Iteración Actual
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
          {isSingular ? (
            <div style={{ color: 'var(--danger-red)', fontWeight: 600 }}>
              Matriz singular o indeterminada (det = 0).
            </div>
          ) : (
            <>
              {exactSolution && (
                <div style={{ backgroundColor: 'var(--surface-info)', border: '1px solid var(--surface-info-border)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)' }}>
                  <div style={{ color: 'var(--primary-blue)', fontWeight: 700, fontSize: '0.78rem', marginBottom: '4px' }}>
                    Solución Analítica x* (A⁻¹b):
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                    {exactSolution.map((val, idx) => (
                      <span key={idx} style={{ color: 'var(--text-primary)' }}>
                        {VARIABLE_NAMES[idx] || `x${idx + 1}`}* = <strong>{val.toFixed(6)}</strong>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Comparación de Error Verdadero */}
              {exactSolution && activeSnapshot.k > 0 && (
                <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', backgroundColor: 'var(--surface-subtle)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-xs)', padding: '6px 8px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Error verdadero Et (k={activeSnapshot.k}):</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '3px' }}>
                    {activeSnapshot.x.map((val, idx) => {
                      const exact = exactSolution[idx];
                      const isZeroExact = Math.abs(exact) < 1e-12;
                      const et = isZeroExact
                        ? Math.abs(exact - val)
                        : (Math.abs(exact - val) / Math.abs(exact)) * 100;
                      return (
                        <span key={idx} style={{ fontFamily: 'var(--font-mono)' }}>
                          Et_{VARIABLE_NAMES[idx] || `x${idx + 1}`}: <strong>{et.toFixed(4)}{isZeroExact ? ' (abs)' : '%'}</strong>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* 4. HISTORIAL DE ITERACIONES */}
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
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            Selecciona fila para inspeccionar
          </span>
        </div>

        <div style={{ overflowX: 'auto', maxHeight: '280px', overflowY: 'auto' }}>
          <table className="scientific-table">
            <thead>
              <tr>
                <th>k</th>
                {snapshots[0].x.map((_, i) => (
                  <th key={i}>{VARIABLE_NAMES[i] || `x${i + 1}`}</th>
                ))}
                <th>Ea Máx (%)</th>
                <th>||r||∞</th>
              </tr>
            </thead>
            <tbody>
              {snapshots.map((snap) => {
                const isActive = snap.k === currentStep;
                return (
                  <tr
                    key={snap.k}
                    className={isActive ? 'active-row' : ''}
                    onClick={() => onSelectStep(snap.k)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectStep(snap.k);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`Inspeccionar iteración k=${snap.k}`}
                    style={{ cursor: 'pointer' }}
                  >
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                      {snap.k}
                    </td>
                    {snap.x.map((val, idx) => (
                      <td key={idx} style={{ fontFamily: 'var(--font-mono)' }}>
                        {val.toFixed(4)}
                      </td>
                    ))}
                    <td style={{ fontFamily: 'var(--font-mono)', color: snap.maxApproximateError !== null && snap.maxApproximateError < 1 ? 'var(--success-green)' : 'var(--text-secondary)' }}>
                      {snap.maxApproximateError !== null ? `${snap.maxApproximateError.toFixed(4)}%` : '—'}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--math-teal)' }}>
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
