# Hoja de ruta

Orden sugerido de los temas. Cada fila debería ser **un pull request** con el título indicado.

## Hechos

| Tema | Operaciones animadas |
| --- | --- |
| Vector dinámico | `agregarAlFinal` (con redimensionar), `insertar`, `eliminarEn`, `buscar` |
| Lista enlazada simple | `insertarAlInicio`, `insertarAlFinal`, `buscar`, `eliminar` |
| Pila (sobre arreglo) | `apilar`, `desapilar`, `cima` |
| Cola (arreglo circular) | `encolar`, `desencolar`, `frente` |
| Montículo (min-heap / max-heap) y heapsort | `insertar` (subir), `extraerRaiz` (bajar), `raiz`, `heapsort` en dos fases |

## Pendientes

| # | Tema | Operaciones a animar | Título del PR |
| --- | --- | --- | --- |
| 1 | Árbol binario de búsqueda | insertar, buscar, recorridos inorden/preorden/postorden, eliminar (3 casos) | `[Árbol binario de búsqueda] Agregar animación de insertar, buscar y recorridos con ejemplo en C++` |
| 2 | Tabla hash | función hash, insertar/buscar con encadenamiento, factor de carga | `[Tabla hash] Agregar animación con encadenamiento y ejemplo en C++` |
| 3 | Grafos | lista de adyacencia, BFS (con cola), DFS (con pila) | `[Grafos] Agregar animación de BFS y DFS con ejemplo en C++` |
| 4 | Lista doblemente enlazada | insertar/eliminar en ambos extremos | `[Lista doblemente enlazada] Agregar animación y ejemplo en C++` |
| 5 | Ordenamiento | burbuja, inserción, merge sort, quicksort (heapsort ya está en Montículo) | `[Ordenamiento] Agregar animaciones de algoritmos de ordenamiento en C++` |

## Ideas para el sitio

- **Rediseño visual** con un formato más atractivo, inspirado en sitios de programación con animaciones. Referencia principal: [learn-program-animation](https://github.com/JMoisesCT/learn-program-animation); más ideas en [docs/inspiracion-visual.md](docs/inspiracion-visual.md).
- Atajos de teclado para la reproducción (espacio, flechas).
- Selector de lenguaje para mostrar los ejemplos también en Python o Java.
- Modo "pregunta": antes de cada paso, preguntar al estudiante qué va a pasar.
