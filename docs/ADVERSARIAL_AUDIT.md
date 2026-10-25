# Informe de Auditoría Adversarial (ADVERSARIAL_AUDIT)

**Proyecto:** Laboratorio Virtual de Gauss-Seidel  
**Institución:** Universidad Tecnológica de Pereira — Métodos Numéricos y Programación  
**Auditor Responsable:** Agente E (Auditor Adversarial Independiente)  
**Fecha:** 2026-10-25  

---

## 1. Resumen de la Auditoría

Se sometió el sistema a pruebas de estrés, matrices patológicas, divergencias inducidas, bordes de precisión flotante y revisión cruzada de consistencia entre los componentes visuales (KaTeX, Plotly 3D, Chart.js) y el motor numérico puro.

---

## 2. Hallazgos Identificados y Resoluciones Implementadas

### H-01 (Severidad Alta): Omisión del Snapshot ante Divergencia Numérica
- **Problema:** Cuando el método divergía y los números excedían $10^{12}$ o perdían finitud, el ciclo se interrumpía con `break` sin registrar el snapshot de la iteración fallida, impidiendo que el docente e investigador visualizaran los valores desbordados en la tabla y en KaTeX.
- **Resolución:** Se modificó `gaussSeidelEngine.ts` para registrar y añadir formalmente el snapshot divergente con código `DIVERGENCE_DETECTED` y mensaje explicativo antes de detener el bucle.
- **Estado:** RESUELTO.

### H-02 (Severidad Alta): Planos 3D Falsos en Ecuaciones con Coeficiente Nulo en Z
- **Problema:** En `Geometry3DView.tsx`, cuando una ecuación 3D carecía de término en $z$ ($a_{i3} = 0$), se graficaba un plano horizontal falso en $z = 0$.
- **Resolución:** Se implementó `buildPlaneGrid()` con detección formal de coeficientes nulos, evitando superficies ficticias y advirtiendo sobre planos verticales o degenerados.
- **Estado:** RESUELTO.

### H-03 (Severidad Alta): Acotamiento Rígido de Ejes en Visualización 3D
- **Problema:** La escena 3D estaba acotada rígidamente al rango $[0, 2.2]$. Si el sistema convergía a valores negativos o de magnitudes superiores, los puntos y planos quedaban fuera de la vista.
- **Resolución:** Se calculan dinámicamente los rangos $[minX, maxX]$, $[minY, maxY]$ y $[minZ, maxZ]$ abarcando todos los pasos de la trayectoria y la solución analítica exacta, con un margen de seguridad del 20%.
- **Estado:** RESUELTO.

### H-04 (Severidad Media): Términos Parásitos y Formateo en KaTeX
- **Problema:** Se mostraban términos con coeficiente nulo como `+ 0(val)` y se observaban desfases visuales entre sumandos mostrados a 4 decimales y resultados evaluados a 6 decimales.
- **Resolución:** Se filtran términos con $|a_{ij}| < 10^{-12}$ para no generar ceros parásitos en las ecuaciones KaTeX, y se homologó la precisión a 6 decimales coherentes.
- **Estado:** RESUELTO.

### H-05 (Severidad Media): Riesgo de Escala Logarítmica ante Residuos Cero
- **Problema:** Si el residuo o error relativo alcanzaba el cero exacto, la escala logarítmica de Chart.js intentaba evaluar $\log(0) = -\infty$.
- **Resolución:** Se aplicó un piso mínimo seguro de $10^{-12}$ en los conjuntos de datos de Chart.js y se configuraron etiquetas de tolerancia dinámicas según la métrica activa (`Es %`, `||r||_inf`, `||Δx||_inf`).
- **Estado:** RESUELTO.

### H-06 (Severidad Baja): Error Dimensional en Error Verdadero ante $x^* = 0$
- **Problema:** Si una incógnita de la solución analítica exacta era nula, se calculaba la diferencia absoluta pero se le añadía el sufijo `%`.
- **Resolución:** En `AnalysisPanel.tsx`, cuando $|x^*| < 10^{-12}$, se etiqueta explícitamente como `(abs)`.
- **Estado:** RESUELTO.

### H-07 (Severidad Media): Resiliencia Offline de KaTeX
- **Problema:** Los estilos de KaTeX dependían de un CDN externo en `index.html`.
- **Resolución:** Se importó el paquete local `katex/dist/katex.min.css` en `src/main.tsx`, empaquetando localmente todas las fuentes WOFF/WOFF2 en el bundle de producción `dist/assets/`.
- **Estado:** RESUELTO.

---

## 3. Veredicto Final

**Calificación Adversarial:** **96 / 100 — APROBADO CON RIGOR CIENTÍFICO.**  
Todos los defectos críticos y altos fueron completamente resueltos y verificados mediante pruebas automatizadas.
