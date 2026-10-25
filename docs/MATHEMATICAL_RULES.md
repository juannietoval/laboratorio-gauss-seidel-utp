# Reglas y Rigor Matemático (MATHEMATICAL_RULES)

**Proyecto:** Laboratorio Virtual de Gauss-Seidel  
**Institución:** Universidad Tecnológica de Pereira — Métodos Numéricos y Programación  

---

## 1. El Método de Gauss-Seidel

Para un sistema de ecuaciones lineales $A\vec{x} = \vec{b}$ con $A \in \mathbb{R}^{n \times n}$ y $\vec{b} \in \mathbb{R}^n$:

$$
\begin{bmatrix}
a_{11} & a_{12} & \cdots & a_{1n} \\
a_{21} & a_{22} & \cdots & a_{2n} \\
\vdots & \vdots & \ddots & \vdots \\
a_{n1} & a_{n2} & \cdots & a_{nn}
\end{bmatrix}
\begin{bmatrix}
x_1 \\ x_2 \\ \vdots \\ x_n
\end{bmatrix}
=
\begin{bmatrix}
b_1 \\ b_2 \\ \vdots \\ b_n
\end{bmatrix}
$$

Asumiendo que $a_{ii} \neq 0$ para todo $i$, la regla de actualización para la incógnita $i$ en la iteración $(k+1)$ es:

$$
x_i^{(k+1)} = \frac{1}{a_{ii}} \left( b_i - \sum_{j=1}^{i-1} a_{ij} x_j^{(k+1)} - \sum_{j=i+1}^n a_{ij} x_j^{(k)} \right)
$$

### Diferencia Crítica con el Método de Jacobi
- **Jacobi:** Utiliza únicamente los valores de la iteración anterior $\vec{x}^{(k)}$ para calcular todas las componentes de $\vec{x}^{(k+1)}$.
- **Gauss-Seidel:** Utiliza de inmediato los valores actualizados $x_j^{(k+1)}$ para $j < i$ en cuanto están disponibles en el cálculo en curso.

---

## 2. Condiciones de Convergencia

### 2.1. Dominancia Diagonal Estricta por Filas (Condición Suficiente)
Una matriz $A$ es estrictamente diagonal dominante por filas si:

$$
|a_{ii}| > \sum_{\substack{j=1 \\ j \neq i}}^n |a_{ij}|, \quad \forall i \in \{1, 2, \dots, n\}
$$

- **Teorema:** Si $A$ es estrictamente diagonal dominante por filas, el método de Gauss-Seidel converge para cualquier aproximación inicial $\vec{x}^{(0)}$.
- **Aclaración Docente Obligatoria:** Esta condición es **suficiente**, pero **no necesaria**. Existen matrices que no son diagonalmente dominantes pero para las cuales el método converge (por ejemplo, matrices simétricas definidas positivas, o matrices con radio espectral $\rho(T_{GS}) < 1$).

### 2.2. Matriz de Iteración y Radio Espectral
Descomponiendo $A = D - L - U$, donde:
- $D$ es la parte diagonal de $A$.
- $L$ es la parte triangular inferior estricta cambiada de signo.
- $U$ es la parte triangular superior estricta cambiada de signo.

La iteración de Gauss-Seidel puede expresarse como:
$$(D - L) \vec{x}^{(k+1)} = U \vec{x}^{(k)} + \vec{b} \implies \vec{x}^{(k+1)} = (D - L)^{-1} U \vec{x}^{(k)} + (D - L)^{-1} \vec{b}$$

La matriz de iteración es $T_{GS} = (D - L)^{-1} U$.  
El método converge para cualquier $\vec{x}^{(0)}$ si y solo si:
$$\rho(T_{GS}) < 1$$

---

## 3. Criterios de Parada y Métricas Numéricas

### 3.1. Error Relativo Porcentual Aproximado ($E_a$)
Para cada incógnita $i$:
$$E_{a, i}^{(k+1)} = \left| \frac{x_i^{(k+1)} - x_i^{(k)}}{x_i^{(k+1)}} \right| \times 100\%$$

El criterio de parada global por error relativo exige que:
$$\max_{1 \le i \le n} E_{a, i}^{(k+1)} < E_s$$

**Tratamiento de denominador nulo:** Si $|x_i^{(k+1)}| < 10^{-14}$, se evalúa el error relativo escalado:
$$E_{a, i}^{(k+1)} = \frac{|x_i^{(k+1)} - x_i^{(k)}|}{\max(|x_i^{(k+1)}|, 10^{-12})} \times 100\%$$

### 3.2. Residuo del Sistema ($r^{(k)}$)
El vector residuo en la iteración $k$ es:
$$\vec{r}^{(k)} = \vec{b} - A\vec{x}^{(k)}$$

Su norma infinito se calcula como:
$$\|\vec{r}^{(k)}\|_\infty = \max_{1 \le i \le n} |r_i^{(k)}|$$

El laboratorio distingue claramente entre el error aproximado entre pasos consecutivas y el residuo del sistema, evitando confusiones comunes en los estudiantes.
