# Hoja de ruta

Orden sugerido de los temas. Cada fila debería ser **un pull request** con el título indicado.

## Hechos

| Tema | Operaciones animadas |
| --- | --- |
| Notación algorítmica (Big-O) | Lección en 10 pasos: carrera interactiva de las curvas de crecimiento; `obtener` O(1), `sumar` O(n), `hayRepetidos` O(n²) con tabla de pares y mejor/peor caso, `busquedaBinaria` O(log n), `contarPresentes` O(n log n); cada `pasos++` deja un punto y cada ejecución un punto en la gráfica de pasos según n; reglas (quitar constantes y términos chicos), todas juntas con n hasta 64 y tabla de tiempos |
| Lambdas en C++ (herramienta, no es una estructura) | Lección en 11 pasos con la pila de llamadas a la vista: `elevarAlCuadrado` (la lambda se crea, pero el cuerpo corre al llamarla), `capturaPorValor` (la copia no ve el `factor = 100`), `sumarConReferencia` (`[&total]` con flecha a la variable original), lambdas anidadas con `sumaDeCuadrados` (una lambda dentro de otra, tres marcos) y `usarSumador` (una lambda que fabrica otra y conserva su copia de `b`), usos prácticos con `std::count_if`, `std::find_if` (incluye `end()` y `k = 0`) y `std::sort` con tres criterios; todo junto y tabla de capturas |
| Vector dinámico | Lección en 9 pasos: `obtener` (con el cálculo de la dirección), `agregarAlFinal` con `redimensionar` (copias entre bloques y `delete[]`), experimento de costo amortizado (duplicar contra sumar 1), `insertar`, `eliminarEn`, `buscar` y todas juntas |
| Lista enlazada simple | Lección en 11 pasos: `nodoEn` y `obtener` (con las direcciones de cada nodo), `insertarAlInicio`, `insertarEn` (en medio, al inicio, al final y fuera de rango), `insertarAlFinal` (llama a `insertarEn(tamano, valor)`, con la pila de llamadas a la vista), `buscar`, `eliminar` (cabeza, en medio y valor ausente), `eliminarEn`, comparador de costos contra el vector y todas juntas |
| Pila | Lección en 8 pasos con dos versiones: `std::stack` (`push`, `top`, `pop` y por qué se pregunta `empty()` antes), un uso real con `estanBalanceados` (paréntesis, corchetes y llaves), y `PilaEnlazada` sobre nodos (`apilar`, `desapilar` y `cima` en O(1), con la pila vacía como error); todo junto con selector de versión |
| Cola | Lección en 8 pasos con dos versiones: `std::queue` (`push`, `front`, `pop` y por qué se pregunta `empty()` antes), un uso real con `josefo` (cada persona pasa del frente al final), y `ColaEnlazada` sobre nodos con `primero` y `ultimo` (`encolar`, `desencolar` con el caso de la cola que queda vacía, y `frente`, todo en O(1)); todo junto con selector de versión |
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
