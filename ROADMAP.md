# Hoja de ruta

Orden sugerido de los temas. Cada fila debería ser **un pull request** con el título indicado.

## Hechos

| Tema | Operaciones animadas |
| --- | --- |
| Vector dinámico | Lección en 9 pasos: `obtener` (con el cálculo de la dirección), `agregarAlFinal` con `redimensionar` (copias entre bloques y `delete[]`), experimento de costo amortizado (duplicar contra sumar 1), `insertar`, `eliminarEn`, `buscar` y todas juntas |
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

## Pasar al formato de lección

Temas ya publicados que todavía son una sola página. Hay que llevarlos al formato de "Formato de un tema" en CONTRIBUTING.md (lección por pasos, un visualizador por operación con preguntas, animaciones con "juice"), como ya se hizo con Vector dinámico. Un PR por tema.

| # | Tema | Qué agregar | Título del PR |
| --- | --- | --- | --- |
| 1 | Lista enlazada simple | Pasos para `insertarAlInicio`, `insertarAlFinal`, `buscar` y `eliminar`; nodos que se deslizan y punteros `sig` que se reconectan paso a paso; nodo eliminado que se desvanece | `[Lista enlazada] Explicar sus operaciones en una lección por pasos animada` |
| 2 | Pila (sobre arreglo) | Pasos para `apilar`, `desapilar` y `cima`; valores que caen y salen por arriba; marca `tope` que sube y baja; pila llena y vacía como errores visibles; un ejemplo de uso (paréntesis balanceados o deshacer) | `[Pila] Explicar sus operaciones en una lección por pasos animada` |
| 3 | Cola (arreglo circular) | Pasos para `encolar`, `desencolar` y `frente`; marcas `frente` y `fin` que dan la vuelta al arreglo; la vista circular junto a la lineal; cola llena y vacía como errores visibles | `[Cola] Explicar sus operaciones en una lección por pasos animada` |

## Ideas para el sitio

- **Rediseño visual** con un formato más atractivo, inspirado en sitios de programación con animaciones. Referencia principal: [learn-program-animation](https://github.com/JMoisesCT/learn-program-animation); más ideas en [docs/inspiracion-visual.md](docs/inspiracion-visual.md).
- Atajos de teclado para la reproducción (espacio, flechas).
- Selector de lenguaje para mostrar los ejemplos también en Python o Java.
- Modo "pregunta": antes de cada paso, preguntar al estudiante qué va a pasar.
