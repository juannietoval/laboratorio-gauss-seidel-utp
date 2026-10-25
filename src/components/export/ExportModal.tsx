import React, { useState } from 'react';
import { IterationSnapshot, Matrix, Vector } from '../../math/types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  A: Matrix;
  b: Vector;
  snapshots: IterationSnapshot[];
  exactSolution: Vector | null;
}

const VARIABLE_NAMES = ['x', 'y', 'z', 'w'];

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  A,
  b,
  snapshots,
  exactSolution
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // 1. Generar CSV
  const generateCSV = (): string => {
    const n = b.length;
    const header = ['k', ...Array.from({ length: n }, (_, i) => VARIABLE_NAMES[i] || `x${i + 1}`), 'Ea_max(%)', 'residual_inf_norm'].join(',');
    const rows = snapshots.map((s) => {
      const vars = s.x.map((v) => v.toFixed(6)).join(',');
      const ea = s.maxApproximateError !== null ? s.maxApproximateError.toFixed(4) : '';
      return `${s.k},${vars},${ea},${s.residualInfNorm.toExponential(4)}`;
    });
    return [header, ...rows].join('\n');
  };

  // 2. Generar JSON
  const generateJSON = (): string => {
    return JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        institution: 'Universidad Tecnológica de Pereira',
        course: 'Métodos Numéricos y Programación',
        system: { A, b },
        exactSolution,
        iterationsCount: snapshots.length - 1,
        converged: snapshots[snapshots.length - 1]?.converged ?? false,
        snapshots
      },
      null,
      2
    );
  };

  // 3. Generar Reporte Markdown
  const generateMarkdown = (): string => {
    const n = b.length;
    let md = `# Reporte de Simulación: Método de Gauss-Seidel\n`;
    md += `**Universidad Tecnológica de Pereira — Métodos Numéricos**\n\n`;
    md += `### Sistema Resuelto:\n\`\`\`\n`;
    A.forEach((row, i) => {
      const eq = row.map((c, j) => `${c >= 0 && j > 0 ? '+' : ''}${c}${VARIABLE_NAMES[j] || `x${j + 1}`}`).join(' ');
      md += `${eq} = ${b[i]}\n`;
    });
    md += `\`\`\`\n\n`;

    if (exactSolution) {
      md += `### Solución Analítica Exacta:\n`;
      exactSolution.forEach((val, idx) => {
        md += `- ${VARIABLE_NAMES[idx] || `x${idx + 1}`}* = ${val.toFixed(6)}\n`;
      });
      md += `\n`;
    }

    md += `### Tabla de Iteraciones:\n`;
    const header = `| k | ${Array.from({ length: n }, (_, i) => VARIABLE_NAMES[i] || `x${i + 1}`).join(' | ')} | Ea máx (%) | ||r||_inf |\n`;
    const sep = `|:---:|${Array.from({ length: n }, () => ':---:').join('|')}|:---:|:---:|\n`;
    let tableRows = '';
    snapshots.forEach((s) => {
      const vars = s.x.map((v) => v.toFixed(4)).join(' | ');
      const ea = s.maxApproximateError !== null ? `${s.maxApproximateError.toFixed(4)}%` : '—';
      tableRows += `| ${s.k} | ${vars} | ${ea} | ${s.residualInfNorm.toExponential(2)} |\n`;
    });

    return md + header + sep + tableRows;
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>
            Exportar Resultados de la Simulación
          </h2>
          <button className="btn" onClick={onClose}>
            <svg className="btn-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Selecciona el formato deseado para respaldar o incluir en tu informe académico:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            {/* CSV */}
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid #334155', borderRadius: '6px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <strong style={{ color: '#38bdf8' }}>Archivo CSV</strong>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Ideal para Excel, MATLAB o Pandas en Python.</p>
              <button
                className="btn btn-accent"
                style={{ marginTop: 'auto', justifyContent: 'center' }}
                onClick={() => downloadFile(generateCSV(), 'gauss_seidel_iteraciones.csv', 'text/csv')}
              >
                Descargar CSV
              </button>
            </div>

            {/* JSON */}
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid #334155', borderRadius: '6px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <strong style={{ color: '#10b981' }}>Estructura JSON</strong>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Datos completos inmutables con matrices y snapshots.</p>
              <button
                className="btn"
                style={{ marginTop: 'auto', justifyContent: 'center', borderColor: '#10b981', color: '#34d399' }}
                onClick={() => downloadFile(generateJSON(), 'gauss_seidel_datos.json', 'application/json')}
              >
                Descargar JSON
              </button>
            </div>

            {/* Markdown */}
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid #334155', borderRadius: '6px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <strong style={{ color: '#f59e0b' }}>Reporte Markdown</strong>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Listo para copiar en Overleaf / LaTeX o GitHub.</p>
              <button
                className="btn"
                style={{ marginTop: 'auto', justifyContent: 'center', borderColor: '#f59e0b', color: '#fbbf24' }}
                onClick={() => copyToClipboard(generateMarkdown())}
              >
                {copied ? '¡Copiado!' : 'Copiar Reporte'}
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
          <button className="btn" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
