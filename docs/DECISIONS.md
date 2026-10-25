# Registro de Decisiones de Arquitectura (ADR - Architecture Decision Records)

**Proyecto:** Laboratorio Virtual de Gauss-Seidel  
**Institución:** Universidad Tecnológica de Pereira  

---

## ADR-01: Separación de la Capa Matemática (`src/math/`) de la Interfaz
- **Estado:** Aprobado.
- **Contexto:** La interfaz debe ser interactiva y reactiva, pero los cálculos numéricos deben ser 100% testeables en entornos sin navegador ni DOM.
- **Decisión:** Implementar todas las funciones matemáticas en TypeScript puro bajo `src/math/`. No se permite importar React, hooks ni librerías visuales en esta capa.
- **Consecuencias:** Pruebas unitarias ultrarrápidas con Vitest y reproducibilidad matemática absoluta.

---

## ADR-02: Estados de Iteración Inmutables (`IterationSnapshot[]`)
- **Estado:** Aprobado.
- **Contexto:** En simulaciones numéricas interactivas con botones de reproducción, avance y retroceso, recalcular variables sobre la marcha provoca desincronizaciones y problemas de redondeo acumulado.
- **Decisión:** Al pulsar "Ejecutar" o cambiar un parámetro del sistema, el motor genera un array completo de estados inmutables `IterationSnapshot[]`. La navegación por pasos solo indexa este array.
- **Consecuencias:** Desempeño constante de 60 FPS, navegación instantánea hacia atrás y adelante, y sincronización garantizada entre tabla, fórmulas y gráficos.

---

## ADR-03: Despliegue en GitHub Pages con Rutas Relativas
- **Estado:** Aprobado.
- **Contexto:** El usuario solicitó explícitamente preparar la aplicación para su publicación en GitHub Pages bajo el repositorio `juannietoval/laboratorio-gauss-seidel-utp`.
- **Decisión:** Configurar `base: './'` en `vite.config.ts` y crear un GitHub Actions workflow en `.github/workflows/deploy.yml` para compilar y desplegar automáticamente en cada push a la rama `main`.
- **Consecuencias:** La aplicación puede servirse tanto en la raíz de un dominio como en subdirectorios de GitHub Pages sin errores 404 en assets.

---

## ADR-04: Prohibición de Stickers y Emojis Decorativos
- **Estado:** Aprobado (Regla Global Mandatoria).
- **Contexto:** El usuario exige una interfaz con rigor académico y visualmente profesional, libre de caracteres informales de tipo emoji o sticker.
- **Decisión:** Todo recurso visual, indicador o botón interactivo empleará código vectorial SVG semántico inline o archivos `.svg`.
- **Consecuencias:** Interfaz limpia, escalable y con estética de instrumentación científica.
