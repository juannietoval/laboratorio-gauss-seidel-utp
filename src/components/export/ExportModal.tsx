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
        iterations: snapshots.map((s) => ({
          k: s.k,
          x: s.x,
          maxApproximateError: s.maxApproximateError,
          residualInfNorm: s.residualInfNorm,
          converged: s.converged
        }))
      },
      null,
      2
    );
  };

  // 3. Generar Markdown
  const generateMarkdown = (): string => {
    const n = b.length;
    let md = `# Laboratorio Virtual de Gauss-Seidel — Reporte Numérico\n\n`;
    md += `**Institución:** Universidad Tecnológica de Pereira  \n`;
    md += `**Fecha:** ${new Date().toLocaleDateString('es-CO')}  \n\n`;
    md += `## Sistema de Ecuaciones Ax = b\n\n`;
    md += `\`\`\`\n`;
    A.forEach((row, i) => {
      md += `[ ${row.map((val) => val.toFixed(2).padStart(8, ' ')).join(' ')} ] [ x${i + 1} ] = [ ${b[i].toFixed(2)} ]\n`;
    });
    md += `\`\`\`\n\n`;

    if (exactSolution) {
      md += `**Solución Analítica Exacta:** (${exactSolution.map((val, i) => `x${i + 1}=${val.toFixed(6)}`).join(', ')})  \n\n`;
    }

    md += `## Tabla de Convergencia Iterativa\n\n`;
    const header = `| k | ${Array.from({ length: n }, (_, i) => `x${i + 1}`).join(' | ')} | Ea Máx (%) | ||r||∞ |\n`;
    const sep = `| :-: | ${Array.from({ length: n }, () => ':-:').join(' | ')} | :-: | :-: |\n`;
    let rows = '';
    snapshots.forEach((s) => {
      const vars = s.x.map((v) => v.toFixed(6)).join(' | ');
      const ea = s.maxApproximateError !== null ? `${s.maxApproximateError.toFixed(4)}%` : '—';
      rows += `| ${s.k} | ${vars} | ${ea} | ${s.residualInfNorm.toExponential(3)} |\n`;
    });

    return md + header + sep + rows;
  };

  const downloadFile = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
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
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-export-title">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 id="modal-export-title" style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Exportar Resultados de la Simulación
          </h2>
          <button className="btn btn-secondary" style={{ padding: '4px 8px' }} onClick={onClose} aria-label="Cerrar modal de exportación">
            <svg className="btn-svg" style={{ margin: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
            Selecciona el formato deseado para respaldar o incluir en tu informe académico:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
            {/* CSV */}
            <div style={{ backgroundColor: 'var(--surface-subtle)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '18px', height: '18px', color: 'var(--primary-blue)' }}>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>Archivo CSV</strong>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>Ideal para procesar en Microsoft Excel, MATLAB o Pandas en Python.</p>
              <button
                className="btn btn-secondary"
                style={{ marginTop: 'auto', justifyContent: 'center' }}
                onClick={() => downloadFile(generateCSV(), 'gauss_seidel_iteraciones.csv', 'text/csv')}
              >
                <svg className="btn-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Descargar CSV
              </button>
            </div>

            {/* JSON */}
            <div style={{ backgroundColor: 'var(--surface-subtle)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '18px', height: '18px', color: 'var(--math-teal)' }}>
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
                <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>Estructura JSON</strong>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>Datos inmutables estructurados con matrices y snapshots completos.</p>
              <button
                className="btn btn-secondary"
                style={{ marginTop: 'auto', justifyContent: 'center' }}
                onClick={() => downloadFile(generateJSON(), 'gauss_seidel_datos.json', 'application/json')}
              >
                <svg className="btn-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Descargar JSON
              </button>
            </div>

            {/* Markdown */}
            <div style={{ backgroundColor: 'var(--surface-subtle)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '18px', height: '18px', color: 'var(--warning-amber)' }}>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>Reporte Markdown</strong>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>Formato listo para copiar en Overleaf / LaTeX, informes o GitHub.</p>
              <button
                className="btn btn-secondary"
                style={{ marginTop: 'auto', justifyContent: 'center' }}
                onClick={() => copyToClipboard(generateMarkdown())}
              >
                <svg className="btn-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                {copied ? '¡Copiado al Portapapeles!' : 'Copiar Reporte'}
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
