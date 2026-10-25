# Especificación del Proyecto (PROJECT_SPEC)

**Producto:** Laboratorio Virtual de Gauss-Seidel  
**Institución:** Universidad Tecnológica de Pereira — Facultad de Ingenierías  
**Asignatura:** Métodos Numéricos y Programación  
**Versión:** 1.0  
**Despliegue objetivo:** GitHub Pages  

---

## 1. Alcance y Propósito

El Laboratorio Virtual de Gauss-Seidel es una aplicación web interactiva de rigor científico orientada a estudiantes y docentes de ingeniería. Su propósito es transformar la enseñanza del método iterativo de Gauss-Seidel en una experiencia visual, analítica y reproducible.

La herramienta permite ingresar sistemas lineales arbitrarios ($n \times n$ con $2 \le n \le 4$), configurar tolerancias y vectores iniciales, inspeccionar paso a paso la actualización secuencial de incógnitas, estudiar la dominancia diagonal, reorganizar filas para inducir convergencia y verificar la aproximación numérica contra la solución analítica exacta.

---

## 2. Requerimientos Funcionales

1. **RF-01 (Editor de Sistema Lineal):** Entrada interactiva de matriz $A$, vector $b$ y aproximación inicial $x^{(0)}$ con soporte para dimensiones $n \in \{2, 3, 4\}$.
2. **RF-02 (Validación Previa):** Detección inmediata de matrices no cuadradas, coeficientes no finitos (NaN, Infinito), y ceros en la diagonal principal ($a_{ii} = 0$).
3. **RF-03 (Presets Didácticos):** Biblioteca de sistemas preconfigurados:
   - Ejemplo 1 (Cuaderno UTP: 3x3 estrictamente diagonal dominante).
   - Ejemplo 2 (Cuaderno UTP: 3x3 originalmente no dominante que converge tras reordenar).
   - Sistema Divergente (coeficientes diagonales débiles).
   - Sistema Patológico (ceros en la diagonal corregibles por pivoteo).
4. **RF-04 (Motor Iterativo Inmutable):** Cálculo secuencial estricto de Gauss-Seidel:
   $$x_i^{(k+1)} = \frac{1}{a_{ii}} \left( b_i - \sum_{j=1}^{i-1} a_{ij} x_j^{(k+1)} - \sum_{j=i+1}^n a_{ij} x_j^{(k)} \right)$$
5. **RF-05 (Criterios de Parada y Métricas):**
   - Error relativo porcentual aproximado: $E_{a, i} = \left|\frac{x_i^{(k+1)} - x_i^{(k)}}{x_i^{(k+1)}}\right| \times 100\%$.
   - Norma del error: $\|x^{(k+1)} - x^{(k)}\|_\infty$.
   - Norma del residuo: $\|r^{(k)}\|_\infty = \|b - A x^{(k)}\|_\infty$.
6. **RF-06 (Desglose Didáctico KaTeX):** Presentación en tiempo real de la fórmula algebraica con los valores numéricos exactos sustituidos en el paso activo.
7. **RF-07 (Controles de Reproducción):** Play, Pause, Paso Siguiente, Paso Anterior, Reinicio, y deslizador de iteración $k$.
8. **RF-08 (Módulo de Reordenamiento):** Intercambio interactivo de filas y función de sugerencia automática para maximizar la dominancia diagonal.
9. **RF-09 (Visualización Geométrica 3D para $n=3$):** Gráfica tridimensional interactiva con planos, intersección y trayectoria de convergencia.
10. **RF-10 (Exportación de Resultados):** Descarga del historial en formato CSV, JSON y reporte LaTeX/Markdown.

---

## 3. Requerimientos No Funcionales

1. **RNF-01 (Compatibilidad con GitHub Pages):** Generación de bundle estático con rutas relativas (`base: './'`) y workflow de GitHub Actions automatizado.
2. **RNF-02 (Rendimiento Numérico):** Cálculo instantáneo de hasta 100 iteraciones para $n \le 4$ en menos de 5 ms en el cliente.
3. **RNF-03 (Diseño Visual Científico):** Paleta oscura profesional (grafito azulado `#0f172a`, bordes `#334155`, acentos cian `#38bdf8`, esmeralda `#10b981`, ámbar `#f59e0b`).
4. **RNF-04 (Restricción Estricta de Elementos Gráficos):** Prohibición absoluta de emojis o stickers decorativos. Toda iconografía debe implementarse mediante SVG vectorial semántico inline.
5. **RNF-05 (Accesibilidad):** Cumplimiento de estándares WCAG AA en contraste y soporte para navegación completa por teclado.
