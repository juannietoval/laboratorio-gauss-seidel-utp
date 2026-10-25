# Informe de Pruebas Automatizadas y Verificación (TEST_REPORT)

**Proyecto:** Laboratorio Virtual de Gauss-Seidel  
**Institución:** Universidad Tecnológica de Pereira — Métodos Numéricos y Programación  
**Versión:** 1.0  
**Fecha de Ejecución:** 2026-10-25  

---

## 1. Resumen de la Suite de Pruebas

- **Framework de Pruebas:** Vitest v2.1.9
- **Total de Archivos de Prueba:** 3
- **Total de Pruebas Ejecutadas:** 14
- **Pruebas Aprobadas:** 14 (100%)
- **Pruebas Fallidas:** 0
- **Tiempo Total de Ejecución:** 555 ms

---

## 2. Detalle de Pruebas por Módulo

### 2.1. `tests/smoke.test.ts`
- `[PASS]` Entorno de pruebas Vitest activo y funcional.

### 2.2. `tests/gaussSeidel.test.ts` (Pruebas Matemáticas Unitarias)
- `[PASS]` Dominancia diagonal estricta certificada en Ejemplo 1 del cuaderno UTP (4x+y+z=7, x+3y+z=8, x+y+5z=10).
- `[PASS]` Detección precisa de la falta de dominancia diagonal en Ejemplo 2 original (1 > 4, 1 > 6, 1 > 6 fallan).
- `[PASS]` Certificación de dominancia estricta en Ejemplo 2 reorganizado (5x+y+z=7, x+3y+z=5, 2x+y+4z=6).
- `[PASS]` Detección de coeficientes diagonales nulos (pivotes cero a_ii = 0) antes de ejecutar.
- `[PASS]` Rechazo inmediato de matrices no cuadradas y dimensiones incompatibles.
- `[PASS]` Cálculo de solución analítica exacta: det(A) = 48, x* = 25/24, y* = 13/12, z* = 17/24 con residuo norm < 1e-12.
- `[PASS]` Algoritmo de reordenamiento de filas: encuentra la permutación óptima [2, 0, 1] que logra dominancia estricta.
- `[PASS]` Intercambio manual de filas y conservación de correspondencia en el vector b.
- `[PASS]` Actualización secuencial de Gauss-Seidel y convergencia en k = 6 para Ejemplo 2 con Es = 0.05% (x=1.041676, y=1.083258, z=0.708348).
- `[PASS]` Verificación anti-Jacobi: confirmación de que x_2^(1) utiliza x_1^(1) = 1.4 y no x_1^(0) = 0.
- `[PASS]` Criterio de parada por norma del residuo (RESIDUAL_NORM < tol).

### 2.3. `tests/integration.test.ts` (Pruebas de Ciclo de Vida e Integración)
- `[PASS]` Procesamiento correcto de los 5 presets didácticos sin valores no finitos.
- `[PASS]` Transición de divergencia a convergencia en el Ejemplo 2 al aplicar la permutación de filas.

---

## 3. Estado de Compilación para Producción

- **Comando:** `npm run build` (`tsc && vite build`)
- **Resultado:** Exitoso (código de salida 0).
- **Ruta de salida:** `./dist/`
- **Configuración de rutas:** Rutas relativas (`./assets/...`) compatibles con GitHub Pages.
- **Fuentes matemáticas KaTeX:** Auto-contenidas en el bundle de producción sin dependencias externas de CDN.
