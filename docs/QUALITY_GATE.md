# Matriz de Calidad y Criterios de Aceptación (QUALITY_GATE)

**Proyecto:** Laboratorio Virtual de Gauss-Seidel  
**Institución:** Universidad Tecnológica de Pereira — Métodos Numéricos y Programación  

---

## 1. Rúbrica de Puntuación (Escala 0 a 100)

| Categoría | Peso | Criterios Observables |
| :--- | :---: | :--- |
| **1. Exactitud Matemática y Robustez Numérica** | 30 pts | Implementación rigurosa de Gauss-Seidel secuencial, cálculo exacto de residuos, tratamiento de pivotes cero, convergencia contrastada con soluciones analíticas. |
| **2. Cobertura y Calidad de Pruebas** | 20 pts | Pruebas unitarias de todas las funciones en `src/math/`, pruebas de casos límite (divergencia, singularidad, ceros diagonales) y pruebas de propiedades numéricas. |
| **3. Funcionamiento e Integración** | 15 pts | Sincronización perfecta entre controles, tabla, fórmulas KaTeX y vista 3D. Estados inmutables y sin fugas de memoria. |
| **4. Claridad Didáctica y Pedagógica** | 15 pts | Desglose paso a paso de las ecuaciones, aclaración de condición suficiente vs necesaria, explicación transparente de las causas de no convergencia. |
| **5. Diseño Visual y Accesibilidad** | 10 pts | Paleta científica sobria, cumplimiento estricto de cero emojis/stickers decorativos mediante SVGs semánticos, diseño responsive (escritorio y tabletas), contraste WCAG AA. |
| **6. Mantenibilidad y Documentación** | 10 pts | Código fuertemente tipado en TypeScript (`strict: true`), documentación técnica completa y coherente en `docs/`, despliegue automatizado a GitHub Pages. |

---

## 2. Condiciones Obligatorias de Aprobación Final (Bloqueantes)

1. Cero defectos críticos y cero defectos altos abiertos.
2. 100% de pruebas unitarias y de integración aprobadas.
3. Validación en navegador del despliegue en GitHub Pages.
4. Auditoría adversarial completada y documentada en `docs/ADVERSARIAL_AUDIT.md`.
5. Trazabilidad completa de requerimientos y bitácora de subagentes en `AGENTS.md`.
