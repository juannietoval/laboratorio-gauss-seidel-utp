import React, { useEffect, useRef, useState } from 'react';
import Plotly from 'plotly.js-dist-min';
import { Matrix, Vector, IterationSnapshot } from '../../math/types';

interface Geometry3DViewProps {
  dimension: number;
  A: Matrix;
  b: Vector;
  snapshots: IterationSnapshot[];
  currentStep: number;
  exactSolution: Vector | null;
}

export const Geometry3DView: React.FC<Geometry3DViewProps> = ({
  dimension,
  A,
  b,
  snapshots,
  currentStep,
  exactSolution
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [showP1, setShowP1] = useState(true);
  const [showP2, setShowP2] = useState(true);
  const [showP3, setShowP3] = useState(true);

  useEffect(() => {
    if (dimension !== 3 || !containerRef.current || snapshots.length === 0) return;

    // Calcular límites dinámicos basados en la trayectoria y la solución exacta
    const allX: number[] = snapshots.map((s) => s.x[0]);
    const allY: number[] = snapshots.map((s) => s.x[1]);
    const allZ: number[] = snapshots.map((s) => s.x[2]);

    if (exactSolution && exactSolution.length === 3) {
      allX.push(exactSolution[0]);
      allY.push(exactSolution[1]);
      allZ.push(exactSolution[2]);
    }

    const minX = Math.min(...allX, 0);
    const maxX = Math.max(...allX, 1.5);
    const minY = Math.min(...allY, 0);
    const maxY = Math.max(...allY, 1.5);
    const minZ = Math.min(...allZ, 0);
    const maxZ = Math.max(...allZ, 1.5);

    const padX = Math.max((maxX - minX) * 0.2, 0.3);
    const padY = Math.max((maxY - minY) * 0.2, 0.3);
    const padZ = Math.max((maxZ - minZ) * 0.2, 0.3);

    const rangeX: [number, number] = [minX - padX, maxX + padX];
    const rangeY: [number, number] = [minY - padY, maxY + padY];
    const rangeZ: [number, number] = [minZ - padZ, maxZ + padZ];

    const resolution = 18;
    const xVals: number[] = [];
    const yVals: number[] = [];
    const stepX = (rangeX[1] - rangeX[0]) / (resolution - 1);
    const stepY = (rangeY[1] - rangeY[0]) / (resolution - 1);

    for (let i = 0; i < resolution; i++) {
      xVals.push(rangeX[0] + i * stepX);
      yVals.push(rangeY[0] + i * stepY);
    }

    // Generar mallas de planos evitando planos ficticios si a_i3 = 0
    const buildPlaneGrid = (rowIdx: number): { z: number[][]; hasZCoeff: boolean } => {
      const a_z = A[rowIdx][2];
      if (Math.abs(a_z) < 1e-12) {
        return { z: [], hasZCoeff: false };
      }
      const grid: number[][] = [];
      for (let j = 0; j < resolution; j++) {
        const row: number[] = [];
        const y = yVals[j];
        for (let i = 0; i < resolution; i++) {
          const x = xVals[i];
          row.push((b[rowIdx] - A[rowIdx][0] * x - A[rowIdx][1] * y) / a_z);
        }
        grid.push(row);
      }
      return { z: grid, hasZCoeff: true };
    };

    const p1Grid = buildPlaneGrid(0);
    const p2Grid = buildPlaneGrid(1);
    const p3Grid = buildPlaneGrid(2);

    // Puntos de la trayectoria hasta currentStep
    const trajX = snapshots.slice(0, currentStep + 1).map((s) => s.x[0]);
    const trajY = snapshots.slice(0, currentStep + 1).map((s) => s.x[1]);
    const trajZ = snapshots.slice(0, currentStep + 1).map((s) => s.x[2]);
    const trajText = snapshots.slice(0, currentStep + 1).map((s) => `k=${s.k}: (${s.x[0].toFixed(3)}, ${s.x[1].toFixed(3)}, ${s.x[2].toFixed(3)})`);

    const cur = snapshots[currentStep] || snapshots[0];

    const traces: Plotly.Data[] = [];

    if (p1Grid.hasZCoeff) {
      traces.push({
        type: 'surface',
        x: xVals,
        y: yVals,
        z: p1Grid.z,
        name: 'Plano 1 (E₁)',
        opacity: 0.45,
        showscale: false,
        visible: showP1,
        colorscale: [[0, '#93C5FD'], [1, '#2563EB']],
        hoverinfo: 'name'
      });
    }

    if (p2Grid.hasZCoeff) {
      traces.push({
        type: 'surface',
        x: xVals,
        y: yVals,
        z: p2Grid.z,
        name: 'Plano 2 (E₂)',
        opacity: 0.45,
        showscale: false,
        visible: showP2,
        colorscale: [[0, '#99F6E4'], [1, '#0F766E']],
        hoverinfo: 'name'
      });
    }

    if (p3Grid.hasZCoeff) {
      traces.push({
        type: 'surface',
        x: xVals,
        y: yVals,
        z: p3Grid.z,
        name: 'Plano 3 (E₃)',
        opacity: 0.45,
        showscale: false,
        visible: showP3,
        colorscale: [[0, '#FDE68A'], [1, '#D97706']],
        hoverinfo: 'name'
      });
    }

    traces.push(
      {
        type: 'scatter3d',
        mode: 'lines+markers',
        name: 'Trayectoria Gauss-Seidel',
        x: trajX,
        y: trajY,
        z: trajZ,
        text: trajText,
        line: { color: '#DC2626', width: 4, dash: 'dash' },
        marker: { size: 4, color: '#EF4444' },
        hoverinfo: 'text'
      },
      {
        type: 'scatter3d',
        mode: 'text+markers',
        name: 'Punto Activo',
        x: [cur.x[0]],
        y: [cur.x[1]],
        z: [cur.x[2]],
        marker: { size: 8, color: '#2563EB', symbol: 'circle', line: { color: '#FFFFFF', width: 2 } },
        text: [` k=${cur.k}`],
        textposition: 'top center',
        textfont: { color: '#1F2937', size: 12, family: "'JetBrains Mono', monospace" }
      }
    );

    if (exactSolution && exactSolution.length === 3) {
      traces.push({
        type: 'scatter3d',
        mode: 'text+markers',
        name: 'Solución Exacta x*',
        x: [exactSolution[0]],
        y: [exactSolution[1]],
        z: [exactSolution[2]],
        marker: { size: 10, color: '#7C3AED', symbol: 'diamond', line: { color: '#FFFFFF', width: 2 } },
        text: [' x* Exacto'],
        textposition: 'bottom right',
        textfont: { color: '#5B21B6', size: 11, family: "'JetBrains Mono', monospace" }
      });
    }

    const layout: Partial<Plotly.Layout> = {
      margin: { l: 0, r: 0, b: 0, t: 0 },
      paper_bgcolor: '#FFFFFF',
      scene: {
        xaxis: { title: 'X', range: rangeX, color: '#475569', gridcolor: '#E2E8F0', backgroundcolor: '#F8FAFC', showbackground: true },
        yaxis: { title: 'Y', range: rangeY, color: '#475569', gridcolor: '#E2E8F0', backgroundcolor: '#F8FAFC', showbackground: true },
        zaxis: { title: 'Z', range: rangeZ, color: '#475569', gridcolor: '#E2E8F0', backgroundcolor: '#F8FAFC', showbackground: true },
        camera: { eye: { x: 1.5, y: -1.7, z: 1.1 } },
        aspectmode: 'cube'
      },
      showlegend: false
    };

    const config: Partial<Plotly.Config> = {
      responsive: true,
      displayModeBar: true,
      displaylogo: false,
      modeBarButtonsToRemove: ['toImage', 'resetCameraLastSave3d']
    };

    Plotly.react(containerRef.current, traces, layout, config);
  }, [dimension, A, b, snapshots, currentStep, exactSolution, showP1, showP2, showP3]);

  if (dimension !== 3) {
    return (
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <svg className="card-title-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
            Espacio Geométrico ({dimension}x{dimension})
          </div>
        </div>
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5 }}>
          La representación tridimensional de planos intersecantes está optimizada específicamente para sistemas de dimensión <strong>3x3</strong>. Para dimensión {dimension}x{dimension}, consulta la tabla de convergencia y la gráfica semilogarítmica del error.
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <svg className="card-title-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
          Vista 3D: Intersección de Planos y Trayectoria
        </div>

        {/* Conmutadores de Visibilidad de Planos */}
        <div style={{ display: 'flex', gap: '10px', fontSize: '0.78rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: 'var(--primary-blue)', fontWeight: 600 }}>
            <input type="checkbox" checked={showP1} onChange={(e) => setShowP1(e.target.checked)} /> P₁
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: 'var(--math-teal)', fontWeight: 600 }}>
            <input type="checkbox" checked={showP2} onChange={(e) => setShowP2(e.target.checked)} /> P₂
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: 'var(--warning-amber)', fontWeight: 600 }}>
            <input type="checkbox" checked={showP3} onChange={(e) => setShowP3(e.target.checked)} /> P₃
          </label>
        </div>
      </div>

      <div ref={containerRef} style={{ width: '100%', height: '380px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-default)', backgroundColor: '#FFFFFF' }} />
    </div>
  );
};
