import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { IterationSnapshot } from '../../math/types';

Chart.register(...registerables);

interface ConvergenceChartProps {
  snapshots: IterationSnapshot[];
  tolerance: number;
  errorMetric?: 'RELATIVE_PERCENT' | 'ABSOLUTE_NORM' | 'RESIDUAL_NORM';
}

export const ConvergenceChart: React.FC<ConvergenceChartProps> = ({ snapshots, tolerance, errorMetric = 'RELATIVE_PERCENT' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current || snapshots.length < 2) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const iterLabels = snapshots.slice(1).map((s) => `k=${s.k}`);
    // Sujetar a mínimo 1e-12 para evitar colapso de escala logarítmica con log(0)
    const dataMaxEa = snapshots.slice(1).map((s) => s.maxApproximateError !== null ? Math.max(s.maxApproximateError, 1e-12) : null);
    const dataResidual = snapshots.slice(1).map((s) => Math.max(s.residualInfNorm, 1e-12));
    const dataTol = iterLabels.map(() => Math.max(tolerance, 1e-12));

    const toleranceLabel = errorMetric === 'RESIDUAL_NORM'
      ? `Tolerancia Residuo (${tolerance})`
      : errorMetric === 'ABSOLUTE_NORM'
      ? `Tolerancia Absoluta (${tolerance})`
      : `Tolerancia Es (${tolerance}%)`;

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: iterLabels,
        datasets: [
          {
            label: 'Ea Máximo (%)',
            data: dataMaxEa,
            borderColor: '#38bdf8',
            backgroundColor: '#38bdf8',
            borderWidth: 2,
            tension: 0.15,
            pointRadius: 4
          },
          {
            label: 'Norma del Residuo ||r||_inf',
            data: dataResidual,
            borderColor: '#f59e0b',
            backgroundColor: '#f59e0b',
            borderWidth: 2,
            tension: 0.15,
            pointRadius: 4
          },
          {
            label: toleranceLabel,
            data: dataTol,
            borderColor: '#f43f5e',
            borderDash: [5, 5],
            borderWidth: 1.5,
            pointRadius: 0,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            type: 'logarithmic',
            grid: { color: 'rgba(51, 65, 85, 0.4)' },
            ticks: {
              color: '#94a3b8'
            }
          },
          x: {
            grid: { color: 'rgba(51, 65, 85, 0.4)' },
            ticks: { color: '#94a3b8' }
          }
        },
        plugins: {
          legend: {
            position: 'top',
            labels: { color: '#94a3b8', font: { size: 11 }, boxWidth: 12 }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const yVal = context.parsed.y;
                return `${context.dataset.label}: ${yVal != null ? yVal.toFixed(5) : ''}`;
              }
            }
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [snapshots, tolerance]);

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <svg className="card-title-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          Evolución del Error & Residuo (Escala Logarítmica)
        </div>
      </div>
      <div style={{ height: '220px', width: '100%', position: 'relative' }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};
