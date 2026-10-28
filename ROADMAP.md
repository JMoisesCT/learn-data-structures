# Hoja de ruta

Orden sugerido de los temas. Cada fila debería ser **un pull request** con el título indicado.

## Hechos

| Tema | Operaciones animadas |
| --- | --- |
| Vector dinámico | `agregarAlFinal` (con redimensionar), `insertar`, `eliminarEn`, `buscar` |
| Lista enlazada simple | `insertarAlInicio`, `insertarAlFinal`, `buscar`, `eliminar` |
| Pila (sobre arreglo) | `apilar`, `desapilar`, `cima` |
| Cola (arreglo circular) | `encolar`, `desencolar`, `frente` |
| Montículo (min-heap / max-heap) y heapsort | Lección en 9 pasos: `maxHeapify`/`minHeapify` (con su recursión), `buildMaxHeap`/`buildMinHeap`, `insertMax`/`insertMin`, `extractMax`/`extractMin`, `maximum`/`minimum`, `heapSort` en dos fases |
| Tabla hash | Lección en 8 pasos: funciones hash para números (`hashDivision`, `hashMultiplicacion`, `hashCuadradoMedio`, `hashPlegado`) y para texto (`hashSumaLetras`, `hashPolinomial`); encadenamiento (`insertar` al frente, `buscar`, `eliminar`); direccionamiento abierto con sondeo lineal, cuadrático y doble hash (`insertar`, `buscar`, `eliminar` con lápidas); factor de carga y `rehash` |

## Pendientes

| # | Tema | Operaciones a animar | Título del PR |
| --- | --- | --- | --- |
| 1 | Árbol binario de búsqueda | insertar, buscar, recorridos inorden/preorden/postorden, eliminar (3 casos) | `[Árbol binario de búsqueda] Agregar animación de insertar, buscar y recorridos con ejemplo en C++` |
| 2 | Grafos | lista de adyacencia, BFS (con cola), DFS (con pila) | `[Grafos] Agregar animación de BFS y DFS con ejemplo en C++` |
| 3 | Lista doblemente enlazada | insertar/eliminar en ambos extremos | `[Lista doblemente enlazada] Agregar animación y ejemplo en C++` |
| 4 | Ordenamiento | burbuja, inserción, merge sort, quicksort (heapsort ya está en Montículo) | `[Ordenamiento] Agregar animaciones de algoritmos de ordenamiento en C++` |

## Ideas para el sitio

- **Rediseño visual** con un formato más atractivo, inspirado en sitios de programación con animaciones. Referencia principal: [learn-program-animation](https://github.com/JMoisesCT/learn-program-animation); más ideas en [docs/inspiracion-visual.md](docs/inspiracion-visual.md).
- Atajos de teclado para la reproducción (espacio, flechas).
- Selector de lenguaje para mostrar los ejemplos también en Python o Java.
- Modo "pregunta": antes de cada paso, preguntar al estudiante qué va a pasar.
