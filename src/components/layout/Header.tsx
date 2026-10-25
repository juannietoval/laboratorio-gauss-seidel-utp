import React, { useState } from 'react';

export const Header: React.FC = () => {
  const [showDocModal, setShowDocModal] = useState(false);

  return (
    <>
      <header className="inst-header">
        <div className="inst-brand">
          {/* Logo vectorial SVG semántico institucional */}
          <svg className="inst-logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
          <div className="inst-title-block">
            <h1>Laboratorio Virtual de Gauss-Seidel</h1>
            <div className="inst-subtitle">
              <span>Universidad Tecnológica de Pereira</span>
              <span>·</span>
              <span className="inst-badge">Métodos Numéricos y Programación</span>
            </div>
          </div>
        </div>

        <div className="inst-actions">
          <button className="btn btn-accent" onClick={() => setShowDocModal(true)} title="Instrucciones y Fundamento Teórico">
            <svg className="btn-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span>Guía y Teoría</span>
          </button>

          <a 
            href="https://github.com/juannietoval/laboratorio-gauss-seidel-utp" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn"
            title="Ver repositorio en GitHub"
          >
            <svg className="btn-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
            </svg>
            <span>GitHub</span>
          </a>
        </div>
      </header>

      {/* MODAL DE INFORMACIÓN Y DOCUMENTACIÓN */}
      {showDocModal && (
        <div className="modal-overlay" onClick={() => setShowDocModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>
                Fundamentos del Método de Gauss-Seidel
              </h2>
              <button className="btn" onClick={() => setShowDocModal(false)}>
                <svg className="btn-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div style={{ fontSize: '0.9rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p>
                El método de Gauss-Seidel es una técnica iterativa empleada para resolver sistemas de ecuaciones lineales algebraicas cuadradas de la forma <strong>Ax = b</strong>.
              </p>
              
              <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', padding: '12px', borderRadius: '6px', borderLeft: '4px solid #38bdf8' }}>
                <strong style={{ color: '#38bdf8' }}>Esquema de actualización secuencial inmediata:</strong>
                <p style={{ marginTop: '4px', fontFamily: 'monospace' }}>
                  x_i^(k+1) = [ b_i - Σ(j=1 a i-1) a_ij·x_j^(k+1) - Σ(j=i+1 a n) a_ij·x_j^(k) ] / a_ii
                </p>
              </div>

              <h3 style={{ fontSize: '1rem', color: '#f8fafc', marginTop: '6px' }}>Condición de Convergencia</h3>
              <p>
                Una condición <strong>suficiente</strong> (pero no necesaria) para asegurar la convergencia del método es que la matriz de coeficientes sea <strong>estrictamente diagonal dominante por filas</strong>:
              </p>
              <p style={{ fontFamily: 'monospace', color: '#34d399' }}>
                |a_ii| &gt; Σ_(j ≠ i) |a_ij|, para toda fila i = 1, 2, ..., n
              </p>

              <h3 style={{ fontSize: '1rem', color: '#f8fafc', marginTop: '6px' }}>Reordenamiento de Ecuaciones</h3>
              <p>
                Si un sistema no cumple la condición de dominancia diagonal o presenta ceros en la diagonal principal (impidiendo la división), intercambiar las filas del sistema permite inducir convergencia sin alterar la solución matemática del problema.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button className="btn btn-primary" onClick={() => setShowDocModal(false)}>
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
