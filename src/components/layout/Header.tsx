import React, { useState } from 'react';

export const Header: React.FC = () => {
  const [showDocModal, setShowDocModal] = useState(false);

  return (
    <>
      <header className="inst-header">
        <div className="inst-brand">
          {/* Emblema vectorial SVG semántico institucional UTP */}
          <svg className="inst-logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label="Logo institucional UTP">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
          <div className="inst-title-block">
            <h1>Laboratorio Virtual de Gauss-Seidel</h1>
            <div className="inst-subtitle">
              <span>Universidad Tecnológica de Pereira</span>
              <span>·</span>
              <span className="inst-badge">Métodos Numéricos</span>
            </div>
          </div>
        </div>

        <div className="inst-actions">
          {/* Botón de Guía y Teoría */}
          <button 
            className="btn btn-secondary" 
            onClick={() => setShowDocModal(true)} 
            title="Instrucciones y Fundamento Teórico"
            aria-label="Abrir guía teórica de Gauss-Seidel"
          >
            <svg className="btn-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
            <span>Guía y Teoría</span>
          </button>

          {/* Enlace al Repositorio */}
          <a 
            href="https://github.com/juannietoval/laboratorio-gauss-seidel-utp" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn btn-secondary"
            title="Ver repositorio del proyecto en GitHub"
            aria-label="Abrir repositorio en GitHub"
          >
            <svg className="btn-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
            <span>Repositorio</span>
          </a>

          {/* Icono de Perfil Académico */}
          <div 
            className="btn btn-secondary" 
            style={{ padding: '6px 8px', borderRadius: 'var(--radius-full)' }} 
            title="Estudiante / Investigador UTP"
            aria-label="Perfil de usuario"
          >
            <svg className="btn-svg" style={{ margin: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        </div>
      </header>

      {/* MODAL DE INFORMACIÓN Y DOCUMENTACIÓN DIDÁCTICA */}
      {showDocModal && (
        <div className="modal-overlay" onClick={() => setShowDocModal(false)} role="dialog" aria-modal="true" aria-labelledby="modal-doc-title">
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 id="modal-doc-title" style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Fundamentos del Método de Gauss-Seidel
              </h2>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '4px 8px' }} 
                onClick={() => setShowDocModal(false)}
                aria-label="Cerrar modal de información"
              >
                <svg className="btn-svg" style={{ margin: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '14px', lineHeight: 1.55 }}>
              <p>
                El método iterativo de <strong>Gauss-Seidel</strong> resuelve sistemas de ecuaciones lineales algebraicas cuadradas de la forma <strong>Ax = b</strong>. A diferencia del método de Jacobi, incorpora de inmediato los valores recién calculados en la misma iteración para evaluar las siguientes incógnitas.
              </p>
              
              <div className="tip-callout" style={{ flexDirection: 'column', gap: '6px' }}>
                <strong style={{ color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px' }}>
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  Fórmula de actualización secuencial inmediata:
                </strong>
                <div style={{ backgroundColor: 'var(--surface-card)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-primary)', overflowX: 'auto' }}>
                  x_i^(k+1) = [ b_i - &Sigma;_(j &lt; i) a_ij &middot; x_j^(k+1) - &Sigma;_(j &gt; i) a_ij &middot; x_j^(k) ] / a_ii
                </div>
              </div>

              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px', marginBottom: '0' }}>
                Condición Suficiente de Convergencia
              </h3>
              <p>
                Una condición suficiente (pero no necesaria) para asegurar la convergencia del algoritmo hacia la solución única es que la matriz de coeficientes sea <strong>estrictamente diagonal dominante por filas</strong>:
              </p>
              <div style={{ backgroundColor: 'var(--surface-subtle)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)', fontFamily: 'var(--font-mono)', color: 'var(--math-teal)', fontWeight: 600 }}>
                |a_ii| &gt; &Sigma;_(j &ne; i) |a_ij|, para todo i = 1, 2, ..., n
              </div>

              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px', marginBottom: '0' }}>
                Reordenamiento de Ecuaciones
              </h3>
              <p>
                Si el sistema presenta ceros en la diagonal principal (división por cero) o no satisface la dominancia diagonal, intercambiar el orden de las ecuaciones (filas del sistema) permite restablecer la viabilidad numérica y acelerar la convergencia sin modificar la solución física del problema.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
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
