import React from 'react';
import { Matrix, Vector, PresetSystem, SystemValidation, GaussSeidelConfig } from '../../math/types';
import { PRESET_SYSTEMS } from '../../math/presets';

interface MatrixEditorProps {
  dimension: number;
  setDimension: (n: number) => void;
  A: Matrix;
  setA: (newA: Matrix) => void;
  b: Vector;
  setB: (newB: Vector) => void;
  x0: Vector;
  setX0: (newX0: Vector) => void;
  config: GaussSeidelConfig;
  setConfig: React.Dispatch<React.SetStateAction<GaussSeidelConfig>>;
  validation: SystemValidation;
  onExecute: () => void;
  onAutoReorder: () => void;
  onSwapRows: (r1: number, r2: number) => void;
  onLoadPreset: (preset: PresetSystem) => void;
}

const VARIABLE_NAMES = ['x', 'y', 'z', 'w'];

export const MatrixEditor: React.FC<MatrixEditorProps> = ({
  dimension,
  setDimension,
  A,
  setA,
  b,
  setB,
  x0,
  setX0,
  config,
  setConfig,
  validation,
  onExecute,
  onAutoReorder,
  onSwapRows,
  onLoadPreset
}) => {
  const handleAChange = (row: number, col: number, valStr: string) => {
    const num = parseFloat(valStr) || 0;
    const newA = A.map((r, rIdx) =>
      r.map((c, cIdx) => (rIdx === row && cIdx === col ? num : c))
    );
    setA(newA);
  };

  const handleBChange = (idx: number, valStr: string) => {
    const num = parseFloat(valStr) || 0;
    const newB = [...b];
    newB[idx] = num;
    setB(newB);
  };

  const handleX0Change = (idx: number, valStr: string) => {
    const num = parseFloat(valStr) || 0;
    const newX0 = [...x0];
    newX0[idx] = num;
    setX0(newX0);
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <svg className="card-title-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="9" y1="3" x2="9" y2="21" />
            <line x1="15" y1="3" x2="15" y2="21" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="3" y1="15" x2="21" y2="15" />
          </svg>
          Configuración del Sistema
        </div>
      </div>

      {/* Selector de Presets */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Sistemas Predefinidos de Prueba
        </label>
        <select
          className="btn"
          style={{ width: '100%', padding: '8px 10px', fontSize: '0.85rem' }}
          onChange={(e) => {
            const found = PRESET_SYSTEMS.find((p) => p.id === e.target.value);
            if (found) onLoadPreset(found);
          }}
          defaultValue="ejemplo-2-reorganizado"
        >
          {PRESET_SYSTEMS.map((p) => (
            <option key={p.id} value={p.id} style={{ background: '#1e293b' }}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Selector de Dimensión */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Dimensión del Sistema (n x n):</span>
        <div style={{ display: 'flex', gap: '6px' }}>
          {[2, 3, 4].map((dim) => (
            <button
              key={dim}
              className={`btn ${dimension === dim ? 'btn-primary' : ''}`}
              style={{ padding: '4px 10px', fontSize: '0.8rem' }}
              onClick={() => setDimension(dim)}
            >
              {dim}x{dim}
            </button>
          ))}
        </div>
      </div>

      {/* Editor Matricial: Matriz A | Vector b */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Matriz de Coeficientes A y Términos b
          </span>
          <button
            className="btn btn-accent"
            style={{ padding: '3px 8px', fontSize: '0.75rem' }}
            onClick={onAutoReorder}
            title="Reordenar automáticamente para maximizar dominancia diagonal"
          >
            <svg className="btn-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="16 3 21 3 21 8" />
              <line x1="4" y1="20" x2="21" y2="3" />
              <polyline points="21 16 21 21 16 21" />
              <line x1="15" y1="15" x2="21" y2="21" />
              <line x1="4" y1="4" x2="9" y2="9" />
            </svg>
            Auto-Reordenar
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {A.map((row, rIdx) => (
            <div key={rIdx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {/* Controles de permutación manual de filas */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <button
                  className="btn"
                  style={{ padding: '2px 4px', fontSize: '0.65rem', lineHeight: 1 }}
                  disabled={rIdx === 0}
                  onClick={() => onSwapRows(rIdx, rIdx - 1)}
                  title={`Subir fila ${rIdx + 1}`}
                  aria-label={`Subir fila ${rIdx + 1}`}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="10" height="10">
                    <polyline points="18 15 12 9 6 15" />
                  </svg>
                </button>
                <button
                  className="btn"
                  style={{ padding: '2px 4px', fontSize: '0.65rem', lineHeight: 1 }}
                  disabled={rIdx === dimension - 1}
                  onClick={() => onSwapRows(rIdx, rIdx + 1)}
                  title={`Bajar fila ${rIdx + 1}`}
                  aria-label={`Bajar fila ${rIdx + 1}`}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="10" height="10">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
              </div>

              {/* Fila de coeficientes A */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${dimension}, 1fr)`,
                  gap: '6px',
                  flex: 1
                }}
              >
                {row.map((val, cIdx) => {
                  const isDiag = rIdx === cIdx;
                  return (
                    <input
                      key={cIdx}
                      type="number"
                      step="any"
                      value={val}
                      onChange={(e) => handleAChange(rIdx, cIdx, e.target.value)}
                      title={`A[${rIdx + 1}, ${cIdx + 1}] (${VARIABLE_NAMES[cIdx]})`}
                      style={{
                        background: isDiag ? 'rgba(56, 189, 248, 0.12)' : 'rgba(15, 23, 42, 0.6)',
                        border: isDiag ? '1px solid #38bdf8' : '1px solid #334155',
                        color: isDiag ? '#38bdf8' : '#ffffff',
                        borderRadius: '4px',
                        padding: '6px 8px',
                        fontSize: '0.85rem',
                        textAlign: 'center',
                        fontFamily: 'monospace',
                        fontWeight: isDiag ? 700 : 400
                      }}
                    />
                  );
                })}
              </div>

              {/* Separador = */}
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>=</span>

              {/* Término independiente b */}
              <input
                type="number"
                step="any"
                value={b[rIdx]}
                onChange={(e) => handleBChange(rIdx, e.target.value)}
                title={`Término b[${rIdx + 1}]`}
                style={{
                  width: '64px',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid #f59e0b',
                  color: '#f59e0b',
                  borderRadius: '4px',
                  padding: '6px 8px',
                  fontSize: '0.85rem',
                  textAlign: 'center',
                  fontFamily: 'monospace',
                  fontWeight: 600
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Aproximación Inicial x(0) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          Vector Inicial x(0)
        </span>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${dimension}, 1fr)`, gap: '6px' }}>
          {x0.map((val, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                {VARIABLE_NAMES[idx] || `x${idx + 1}`}:
              </span>
              <input
                type="number"
                step="any"
                value={val}
                onChange={(e) => handleX0Change(idx, e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid #334155',
                  color: '#ffffff',
                  borderRadius: '4px',
                  padding: '5px 8px',
                  fontSize: '0.82rem',
                  fontFamily: 'monospace'
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Parámetros de Parada */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tolerancia (Es %)</label>
          <input
            type="number"
            step="any"
            value={config.tolerance}
            onChange={(e) => setConfig({ ...config, tolerance: parseFloat(e.target.value) || 0.05 })}
            style={{
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid #334155',
              color: '#ffffff',
              borderRadius: '4px',
              padding: '6px 8px',
              fontSize: '0.85rem',
              fontFamily: 'monospace'
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Máx. Iteraciones</label>
          <input
            type="number"
            min="1"
            max="100"
            value={config.maxIterations}
            onChange={(e) => setConfig({ ...config, maxIterations: parseInt(e.target.value, 10) || 50 })}
            style={{
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid #334155',
              color: '#ffffff',
              borderRadius: '4px',
              padding: '6px 8px',
              fontSize: '0.85rem',
              fontFamily: 'monospace'
            }}
          />
        </div>
      </div>

      {/* Métrica de Criterio de Parada */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Criterio de Parada</label>
        <select
          className="btn"
          style={{ width: '100%', padding: '6px 8px', fontSize: '0.8rem' }}
          value={config.errorMetric}
          onChange={(e) =>
            setConfig({
              ...config,
              errorMetric: e.target.value as GaussSeidelConfig['errorMetric']
            })
          }
        >
          <option value="RELATIVE_PERCENT">Error Relativo Porcentual (Ea máx &lt; Es %)</option>
          <option value="RESIDUAL_NORM">Norma del Residuo (||r||_inf &lt; tol)</option>
          <option value="ABSOLUTE_NORM">Norma Absoluta de Pasos (||Δx||_inf &lt; tol)</option>
        </select>
      </div>

      {/* Mensajes de Validación */}
      {!validation.isValid && (
        <div style={{ backgroundColor: 'rgba(244, 63, 94, 0.15)', border: '1px solid #f43f5e', borderRadius: '6px', padding: '10px', fontSize: '0.78rem', color: '#fca5a5' }}>
          <strong>No se puede ejecutar:</strong>
          <ul style={{ paddingLeft: '16px', marginTop: '4px' }}>
            {validation.errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Botón de Ejecución */}
      <button
        className="btn btn-primary"
        style={{ width: '100%', padding: '10px', justifyContent: 'center', fontSize: '0.92rem', fontWeight: 600 }}
        disabled={!validation.isValid}
        onClick={onExecute}
      >
        <svg className="btn-svg" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
        Ejecutar Gauss-Seidel
      </button>
    </div>
  );
};
