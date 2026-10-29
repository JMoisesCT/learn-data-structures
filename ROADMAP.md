# Hoja de ruta

Orden sugerido de los temas. Cada fila debería ser **un pull request** con el título indicado.

## Hechos

| Tema | Operaciones animadas |
| --- | --- |
| Notación algorítmica (Big-O) | Lección en 10 pasos: carrera interactiva de las curvas de crecimiento; `obtener` O(1), `sumar` O(n), `hayRepetidos` O(n²) con tabla de pares y mejor/peor caso, `busquedaBinaria` O(log n), `contarPresentes` O(n log n); cada `pasos++` deja un punto y cada ejecución un punto en la gráfica de pasos según n; reglas (quitar constantes y términos chicos), todas juntas con n hasta 64 y tabla de tiempos |
| Vector dinámico | Lección en 9 pasos: `obtener` (con el cálculo de la dirección), `agregarAlFinal` con `redimensionar` (copias entre bloques y `delete[]`), experimento de costo amortizado (duplicar contra sumar 1), `insertar`, `eliminarEn`, `buscar` y todas juntas |
| Lista enlazada simple | Lección en 11 pasos: `nodoEn` y `obtener` (con las direcciones de cada nodo), `insertarAlInicio`, `insertarEn` (en medio, al inicio, al final y fuera de rango), `insertarAlFinal` (llama a `insertarEn(tamano, valor)`, con la pila de llamadas a la vista), `buscar`, `eliminar` (cabeza, en medio y valor ausente), `eliminarEn`, comparador de costos contra el vector y todas juntas |
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

Temas ya publicados que todavía son una sola página. Hay que llevarlos al formato de "Formato de un tema" en CONTRIBUTING.md (lección por pasos, un visualizador por operación con preguntas, animaciones con "juice"), como ya se hizo con Vector dinámico y Lista enlazada. Un PR por tema.

| # | Tema | Qué agregar | Título del PR |
| --- | --- | --- | --- |
| 1 | Pila (sobre arreglo) | Pasos para `apilar`, `desapilar` y `cima`; valores que caen y salen por arriba; marca `tope` que sube y baja; pila llena y vacía como errores visibles; un ejemplo de uso (paréntesis balanceados o deshacer) | `[Pila] Explicar sus operaciones en una lección por pasos animada` |
| 2 | Cola (arreglo circular) | Pasos para `encolar`, `desencolar` y `frente`; marcas `frente` y `fin` que dan la vuelta al arreglo; la vista circular junto a la lineal; cola llena y vacía como errores visibles | `[Cola] Explicar sus operaciones en una lección por pasos animada` |

## Ideas para el sitio

- **Rediseño visual** con un formato más atractivo, inspirado en sitios de programación con animaciones. Referencia principal: [learn-program-animation](https://github.com/JMoisesCT/learn-program-animation); más ideas en [docs/inspiracion-visual.md](docs/inspiracion-visual.md).
- Atajos de teclado para la reproducción (espacio, flechas).
- Selector de lenguaje para mostrar los ejemplos también en Python o Java.
- Modo "pregunta": antes de cada paso, preguntar al estudiante qué va a pasar.
