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
            borderColor: '#2563EB',
            backgroundColor: '#2563EB',
            borderWidth: 2,
            tension: 0.15,
            pointRadius: 4,
            pointHoverRadius: 6
          },
          {
            label: 'Norma del Residuo ||r||_inf',
            data: dataResidual,
            borderColor: '#0F766E',
            backgroundColor: '#0F766E',
            borderWidth: 2,
            tension: 0.15,
            pointRadius: 4,
            pointHoverRadius: 6
          },
          {
            label: toleranceLabel,
            data: dataTol,
            borderColor: '#B91C1C',
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
            grid: { color: '#E2E8F0' },
            ticks: {
              color: '#475569',
              font: { family: "'JetBrains Mono', monospace", size: 10 }
            }
          },
          x: {
            grid: { color: '#F1F5F9' },
            ticks: {
              color: '#475569',
              font: { family: "'JetBrains Mono', monospace", size: 10 }
            }
          }
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#1F2937',
              font: { family: "'Inter', sans-serif", size: 11, weight: 'bold' },
              boxWidth: 12,
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            backgroundColor: '#1F2937',
            titleColor: '#FFFFFF',
            bodyColor: '#F8FAFC',
            borderColor: '#D9E2EF',
            borderWidth: 1,
            callbacks: {
              label: (context) => {
                const yVal = context.parsed.y;
                return `${context.dataset.label}: ${yVal != null ? yVal.toFixed(6) : ''}`;
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
  }, [snapshots, tolerance, errorMetric]);

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <svg className="card-title-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          Convergencia del Error y Residuo (Semilog)
        </div>
        <span className="badge-teal">
          Escala Log₁₀
        </span>
      </div>
      <div style={{ height: '230px', width: '100%', position: 'relative' }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};
