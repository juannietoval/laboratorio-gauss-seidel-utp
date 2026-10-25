import React, { useState } from 'react';
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

const VARIABLE_NAMES = ['x₁', 'x₂', 'x₃', 'x₄', 'x₅'];

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
  const [activeTab, setActiveTab] = useState<'sistema' | 'avanzado' | 'reordenamiento'>('sistema');

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
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Encabezado con Título y Badge */}
      <div className="card-header">
        <div className="card-title">
          <svg className="card-title-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="9" y1="3" x2="9" y2="21" />
            <line x1="15" y1="3" x2="15" y2="21" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="3" y1="15" x2="21" y2="15" />
          </svg>
          Editor del Sistema
        </div>
        <span className="badge-info">
          Ax = b
        </span>
      </div>

      {/* Pestañas del Editor */}
      <div className="editor-tabs" role="tablist" aria-label="Secciones del editor del sistema">
        <button
          role="tab"
          aria-selected={activeTab === 'sistema'}
          className={`editor-tab-btn ${activeTab === 'sistema' ? 'active' : ''}`}
          onClick={() => setActiveTab('sistema')}
        >
          Sistema
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'avanzado'}
          className={`editor-tab-btn ${activeTab === 'avanzado' ? 'active' : ''}`}
          onClick={() => setActiveTab('avanzado')}
        >
          Avanzado
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'reordenamiento'}
          className={`editor-tab-btn ${activeTab === 'reordenamiento' ? 'active' : ''}`}
          onClick={() => setActiveTab('reordenamiento')}
        >
          Reordenamiento
        </button>
      </div>

      {/* CONTENIDO PESTAÑA 1: SISTEMA */}
      {activeTab === 'sistema' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Selector de Presets */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Cargar Caso Predeterminado:
            </label>
            <select
              className="btn btn-secondary"
              style={{ width: '100%', padding: '7px 10px', fontSize: '0.85rem', textAlign: 'left' }}
              onChange={(e) => {
                const found = PRESET_SYSTEMS.find((p) => p.id === e.target.value);
                if (found) onLoadPreset(found);
              }}
              defaultValue="ejemplo-2-reorganizado"
            >
              {PRESET_SYSTEMS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.dimension}x{p.dimension})
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Dimensión */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Dimensión del sistema:
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[2, 3, 4].map((dim) => (
                <button
                  key={dim}
                  className={`btn ${dimension === dim ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '4px 10px', fontSize: '0.8rem', minWidth: '42px', justifyContent: 'center' }}
                  onClick={() => setDimension(dim)}
                >
                  {dim}x{dim}
                </button>
              ))}
            </div>
          </div>

          {/* Matriz A y Vector b */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                Matriz de Coeficientes A & Términos b
              </span>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Diagonal en azul
              </span>
            </div>

            {/* Encabezado de columnas x1, x2, x3... */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingLeft: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${dimension}, 1fr)`, gap: '6px', flex: 1 }}>
                {Array.from({ length: dimension }, (_, idx) => (
                  <div key={idx} style={{ textAlign: 'center', fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                    {VARIABLE_NAMES[idx] || `x${idx + 1}`}
                  </div>
                ))}
              </div>
              <span style={{ width: '16px', textAlign: 'center', color: 'transparent' }}>=</span>
              <div style={{ width: '64px', textAlign: 'center', fontSize: '0.76rem', color: 'var(--math-teal)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                b
              </div>
            </div>

            {/* Filas de la matriz */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {A.map((row, rIdx) => (
                <div key={rIdx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {/* Etiqueta de la ecuación */}
                  <span style={{ width: '18px', fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    E{rIdx + 1}
                  </span>

                  {/* Coeficientes a_ij */}
                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${dimension}, 1fr)`, gap: '6px', flex: 1 }}>
                    {row.map((val, cIdx) => {
                      const isDiag = rIdx === cIdx;
                      return (
                        <input
                          key={cIdx}
                          type="number"
                          step="any"
                          value={val}
                          onChange={(e) => handleAChange(rIdx, cIdx, e.target.value)}
                          title={`A[${rIdx + 1}, ${cIdx + 1}] (${VARIABLE_NAMES[cIdx] || `x${cIdx + 1}`})`}
                          className={`matrix-input-cell ${isDiag ? 'matrix-cell-diag' : ''}`}
                        />
                      );
                    })}
                  </div>

                  {/* Separador = */}
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>=</span>

                  {/* Término b_i */}
                  <input
                    type="number"
                    step="any"
                    value={b[rIdx]}
                    onChange={(e) => handleBChange(rIdx, e.target.value)}
                    title={`Término independiente b[${rIdx + 1}]`}
                    className="matrix-input-cell matrix-cell-term"
                    style={{ width: '64px' }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Vector Inicial x(0) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 600 }}>
              Vector de Aproximación Inicial x⁽⁰⁾
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${dimension}, 1fr)`, gap: '6px' }}>
              {x0.map((val, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    {VARIABLE_NAMES[idx] || `x${idx + 1}`}:
                  </span>
                  <input
                    type="number"
                    step="any"
                    value={val}
                    onChange={(e) => handleX0Change(idx, e.target.value)}
                    className="matrix-input-cell"
                    style={{ width: '100%', fontSize: '0.82rem' }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Mensajes de Validación */}
          {!validation.isValid && (
            <div style={{ backgroundColor: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', fontSize: '0.8rem', color: 'var(--danger-red)' }}>
              <strong>Inconsistencia en el sistema:</strong>
              <ul style={{ paddingLeft: '16px', margin: '4px 0 0 0' }}>
                {validation.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Botón de Ejecución */}
          <button
            className="btn btn-primary"
            style={{ width: '100%', padding: '10px', justifyContent: 'center', fontSize: '0.92rem', fontWeight: 600, marginTop: '4px' }}
            disabled={!validation.isValid}
            onClick={onExecute}
          >
            <svg className="btn-svg" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Ejecutar Gauss-Seidel
          </button>
        </div>
      )}

      {/* CONTENIDO PESTAÑA 2: AVANZADO */}
      {activeTab === 'avanzado' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 600 }}>
              Tolerancia de Parada (Es % o tol)
            </label>
            <input
              type="number"
              step="any"
              value={config.tolerance}
              onChange={(e) => setConfig({ ...config, tolerance: parseFloat(e.target.value) || 0.0001 })}
              style={{ width: '100%', fontFamily: 'var(--font-mono)' }}
            />
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Valor umbral para detener las iteraciones (ej. 0.05% o 1e-4).
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 600 }}>
              Límite Máximo de Iteraciones
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={config.maxIterations}
              onChange={(e) => setConfig({ ...config, maxIterations: parseInt(e.target.value, 10) || 40 })}
              style={{ width: '100%', fontFamily: 'var(--font-mono)' }}
            />
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Detiene la ejecución para prevenir bucles infinitos en sistemas divergentes.
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 600 }}>
              Criterio de Convergencia
            </label>
            <select
              className="btn btn-secondary"
              style={{ width: '100%', padding: '7px 10px', fontSize: '0.82rem', textAlign: 'left' }}
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

          <div className="tip-callout">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <div>
              <strong>Criterio Estándar:</strong> En la Universidad Tecnológica de Pereira (UTP), se evalúa preferentemente el <em>Error Relativo Porcentual</em> entre iteraciones consecutivas: |(x_i^(k) - x_i^(k-1)) / x_i^(k)| &times; 100%.
            </div>
          </div>
        </div>
      )}

      {/* CONTENIDO PESTAÑA 3: REORDENAMIENTO */}
      {activeTab === 'reordenamiento' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
            El reordenamiento de filas intercambia ecuaciones completas (coeficientes y término independiente) para colocar los elementos de mayor magnitud en la diagonal principal, induciendo <strong>dominancia diagonal</strong> sin alterar la solución.
          </p>

          <button
            className="btn btn-primary"
            style={{ width: '100%', padding: '8px 12px', justifyContent: 'center' }}
            onClick={onAutoReorder}
            title="Calcular e intercambiar automáticamente las filas para maximizar dominancia diagonal"
          >
            <svg className="btn-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="16 3 21 3 21 8" />
              <line x1="4" y1="20" x2="21" y2="3" />
              <polyline points="21 16 21 21 16 21" />
              <line x1="15" y1="15" x2="21" y2="21" />
              <line x1="4" y1="4" x2="9" y2="9" />
            </svg>
            Reordenar Filas Automáticamente
          </button>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 600 }}>
              Intercambio Manual de Ecuaciones:
            </span>
            {A.map((_, rIdx) => (
              <div key={rIdx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', backgroundColor: 'var(--surface-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Ecuación {rIdx + 1}
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '3px 8px', fontSize: '0.74rem' }}
                    disabled={rIdx === 0}
                    onClick={() => onSwapRows(rIdx, rIdx - 1)}
                    title={`Subir ecuación ${rIdx + 1}`}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                      <polyline points="18 15 12 9 6 15" />
                    </svg>
                    Subir
                  </button>
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '3px 8px', fontSize: '0.74rem' }}
                    disabled={rIdx === dimension - 1}
                    onClick={() => onSwapRows(rIdx, rIdx + 1)}
                    title={`Bajar ecuación ${rIdx + 1}`}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                    Bajar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
