# Laboratorio Virtual de Gauss-Seidel
### Universidad Tecnológica de Pereira (UTP) — Facultad de Ingenierías
**Asignatura:** Métodos Numéricos y Programación  
**Versión:** 1.0  
**Despliegue GitHub Pages:** [https://juannietoval.github.io/laboratorio-gauss-seidel-utp/](https://juannietoval.github.io/laboratorio-gauss-seidel-utp/)

---

## 1. Descripción del Proyecto

El **Laboratorio Virtual de Gauss-Seidel** es una plataforma educativa e interactiva diseñada para la experimentación, análisis y aprendizaje visual del método numérico de Gauss-Seidel para sistemas de ecuaciones lineales algebraicas cuadradas ($Ax = b$).

Desarrollado bajo una arquitectura desacoplada y fuertemente tipada con **React, TypeScript y Vite**, el laboratorio garantiza precisión matemática de 64 bits, actualización secuencial inmediata inmutable, diagnóstico formal de dominancia diagonal, vista geométrica 3D interactiva para sistemas $3 \times 3$ con WebGL, y exportación multiformato (CSV, JSON, Markdown/LaTeX).

---

## 2. Características Principales

1. **Arquitectura Científica de 3 Paneles:**
   - **Panel Izquierdo (Configuración y Entrada):** Editor interactivo de matriz $A$, vector $b$ y vector inicial $x^{(0)}$ para dimensiones $2 \times 2$, $3 \times 3$ y $4 \times 4$. Presets con los ejemplos de la libreta de la UTP, controles de tolerancia y permutación manual o automática de filas.
   - **Panel Central (Evolución y Vistas Científicas):** Controles de reproducción interactiva (Play/Pausa, Paso a paso, selector de velocidad 0.5x, 1x, 2x y deslizador temporal). Renderizado KaTeX con desglose algebraico en tiempo real, vista 3D interactiva de planos y trayectoria, y gráfica semilogarítmica del decaimiento de errores y residuo.
   - **Panel Derecho (Diagnóstico y Análisis):** Evaluación estricta de dominancia diagonal fila por fila ($|a_{ii}| > \sum |a_{ij}|$), cálculo de la solución analítica exacta de referencia ($x^* = A^{-1}b$), cálculo de norma de residuos ($\|r\|_\infty = \|b - Ax\|_\infty$), y tabla completa de iteraciones sincronizada por clic y teclado.
2. **Didáctica Matemática Rigurosa:**
   - Implementa inequívocamente la actualización secuencial inmediata de Gauss-Seidel (los nuevos valores $x_j^{(k+1)}$ se usan inmediatamente para $j < i$), diferenciándose radicalmente de Jacobi.
   - Términos nuevos y anteriores coloreados didácticamente en las ecuaciones KaTeX.
   - Cero stickers y cero emojis decorativos: iconografía 100% vectorial SVG semántica.
3. **Módulo de Reordenamiento de Ecuaciones:**
   - Detecta sistemas divergentes o con pivotes nulos en la diagonal.
   - Permite permutar filas manualmente o aplicar una propuesta automática que maximiza la dominancia diagonal, asegurando la convergencia.
4. **Resiliencia y Compatibilidad con GitHub Pages:**
   - Rutas relativas (`base: './'`) para funcionar en subdirectorios de GitHub Pages.
   - Fuentes tipográficas KaTeX auto-contenidas en el paquete de producción.
   - Workflow de despliegue automatizado con GitHub Actions en `.github/workflows/deploy.yml`.

---

## 3. Instalación y Ejecución Local

### Prerrequisitos
- Node.js (v18 o superior, probado en v22)
- npm (v9 o superior)

### Pasos
```bash
# 1. Clonar el repositorio
git clone https://github.com/juannietoval/laboratorio-gauss-seidel-utp.git
cd laboratorio-gauss-seidel-utp

# 2. Instalar dependencias
npm install

# 3. Iniciar el servidor de desarrollo local
npm run dev

# 4. Ejecutar la suite de pruebas unitarias y de integración
npm test

# 5. Compilar para producción (GitHub Pages)
npm run build
```

---

## 4. Estructura de Documentación Técnica

La documentación completa del proyecto está organizada en el directorio `docs/`:

- [docs/PROJECT_SPEC.md](docs/PROJECT_SPEC.md): Especificación funcional y no funcional detallada.
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): Arquitectura de software, separación matemática e inmutabilidad.
- [docs/MATHEMATICAL_RULES.md](docs/MATHEMATICAL_RULES.md): Formulación matemática, condiciones de convergencia y métricas.
- [docs/QUALITY_GATE.md](docs/QUALITY_GATE.md): Rúbrica de puntuación y criterios de aceptación.
- [docs/TEST_REPORT.md](docs/TEST_REPORT.md): Reporte de las 14 pruebas automáticas aprobadas.
- [docs/ADVERSARIAL_AUDIT.md](docs/ADVERSARIAL_AUDIT.md): Auditoría adversarial independiente y resolución de hallazgos.
- [docs/DECISIONS.md](docs/DECISIONS.md): Registro de decisiones de arquitectura (ADRs).
- [AGENTS.md](AGENTS.md): Bitácora histórica del protocolo de revisión por subagentes especializados.

---

## 5. Licencia y Créditos

Proyecto desarrollado con fines académicos y de investigación docente para la asignatura **Métodos Numéricos y Programación** de la **Universidad Tecnológica de Pereira**.
