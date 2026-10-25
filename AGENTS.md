# Bitácora de Subagentes y Protocolo de Aprobación

**Proyecto:** Laboratorio Virtual de Gauss-Seidel  
**Institución:** Universidad Tecnológica de Pereira — Métodos Numéricos y Programación  
**Versión:** 1.0  

---

## 1. Definición de Roles Especializados

1. **Agente A — Revisor Matemático (`math-reviewer`):**
   - Responsabilidad: Auditar la correcta actualización secuencial inmediata de Gauss-Seidel, el diagnóstico de dominancia diagonal como condición suficiente, el cálculo formal de residuos $r = b - Ax$, criterios de parada y contraste con la solución analítica exacta $x = A^{-1}b$.
2. **Agente B — Revisor de Arquitectura y Código (`architecture-reviewer`):**
   - Responsabilidad: Auditar la separación de responsabilidades (capa matemática independiente en `src/math/` sin dependencias de UI), tipado estricto en TypeScript, inmutabilidad de estados de iteración y compatibilidad con GitHub Pages (`base: './'`).
3. **Agente C — Revisor UX/UI y Didáctica (`ux-reviewer`):**
   - Responsabilidad: Auditar jerarquía visual de tres columnas, legibilidad con KaTeX, paleta científica sobria, accesibilidad WCAG AA y cumplimiento estricto de la regla de cero emojis/stickers decorativos mediante SVGs vectoriales semánticos.
4. **Agente D — Revisor de Pruebas y Casos Límite (`test-engineer`):**
   - Responsabilidad: Auditar la suite de pruebas unitarias y de integración, diseño de casos patológicos (pivotes cero, matrices mal condicionadas, tolerancias extremas).
5. **Agente E — Auditor Adversarial (`adversarial-auditor`):**
   - Responsabilidad: Realizar auditorías destructivas buscando fallos de estado, inconsistencias entre valores visuales y calculados, afirmaciones teóricas erradas y bloqueos de interfaz.

---

## 2. Protocolo de Aprobación por Etapas

Para cada fase:
1. El Agente Principal implementa la unidad funcional correspondiente.
2. Se ejecutan las pruebas automatizadas locales.
3. Se invoca al revisor especializado correspondiente con el alcance y criterios de aceptación.
4. El revisor inspecciona de forma independiente y emite un informe con hallazgos categorizados por severidad (Crítica, Alta, Media, Baja).
5. El Agente Principal corrige los defectos señalados.
6. Se re-ejecutan las pruebas y se confirma la resolución.
7. Se actualiza esta bitácora y la matriz de calidad antes de proceder a la siguiente fase.

---

## 3. Registro Histórico de Revisiones

| Fase | Revisor | Fecha / Hora | Veredicto | Hallazgos Principales / Acciones |
| :--- | :--- | :--- | :--- | :--- |
| **Fase 0** | Agente B / Principal | 2026-10-24 | APROBADO | Estructura de repositorio, configuración GitHub Pages y documentación base inicializada. |
| **Fase 1-2** | Agente C (`ux-reviewer`) | 2026-10-25 | APROBADO CON EXCELENCIA (98/100) | Jerarquía visual tripartita verificada. Cero emojis/stickers (100% SVG semántico). Se aplicó OBS-01 (coloreado didáctico KaTeX), OBS-02 (aria-labels a11y) y OBS-03 (navegación por teclado). |
| **Fase 3** | Agente A (`math-reviewer`) | 2026-10-25 | APROBADO (98/100) | Actualización estrictamente secuencial Gauss-Seidel verificada. Se corrigió H-01 (bifurcación completa de criterios de parada por residuo y norma absoluta) y H-02 (guardia de dimensión en reordenamiento). 14/14 tests aprobados. |
| **Fase 1** | Agente C (`ux-reviewer`) | Pendiente | — | Estructura visual y componentes base de diseño. |
| **Fase 2** | Agente D (`test-engineer`) | Pendiente | — | Editor matricial y validaciones de entrada. |
| **Fase 3** | Agente A (`math-reviewer`) | Pendiente | — | Motor matemático de Gauss-Seidel desacoplado. |
| **Fase 4** | Agente A (`math-reviewer`) | Pendiente | — | Registro de iteraciones y desglose algebraico KaTeX. |
| **Fase 5** | Agente B (`architecture-reviewer`) | Pendiente | — | Controles de reproducción e inmutabilidad de estados. |
| **Fase 6** | Agente A / C | Pendiente | — | Gráficas semilogarítmicas de error y residuo. |
| **Fase 7** | Agente A / D | Pendiente | — | Reordenamiento de filas y comparación antes/después. |
| **Fase 8** | Agente C (`ux-reviewer`) | Pendiente | — | Vista geométrica 3D interactiva WebGL (dimensión n=3). |
| **Fase 9** | Agente B (`architecture-reviewer`) | Pendiente | — | Exportación de datos y pipeline de despliegue a GitHub Pages. |
| **Fase 10** | Agente E (`adversarial-auditor`) | Pendiente | — | Auditoría adversarial integral y verificación final. |
