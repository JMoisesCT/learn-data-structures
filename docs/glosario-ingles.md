# Glosario para la versión en inglés

Nombres en inglés de los identificadores de los ejemplos (`ejemplos/cpp/en/`), para que el mismo concepto se llame igual en todos los temas. Al traducir un tema, usa estos nombres y agrega los nuevos.

## Generales

| Español | Inglés |
| --- | --- |
| `Nodo` | `Node` |
| `valor` | `value` |
| `siguiente` | `next` |
| `anterior` | `prev` |
| `cabeza` | `head` |
| `cola` (puntero al último nodo) | `tail` |
| `cantidad` | `count` |
| `tamano()` | `size()` |
| `capacidad` | `capacity` |
| `estaVacia()` | `isEmpty()` |
| `imprimir()` | `print()` |
| `nuevo` (nodo recién creado) | `newNode` |
| `temp` | `temp` |
| `texto` | `text` |
| `resultado` | `result` |
| `izq` / `der` | `left` / `right` |
| `pasos` (contador de pasos) | `steps` |

## Por tema

| Tema | Español | Inglés |
| --- | --- | --- |
| Vector dinámico | `VectorDinamico` / `datos` / `tamano` (variable) / `capacidad` | `DynamicArray` / `data` / `size` / `capacity` |
| Vector dinámico | `size()` / `capacity()` (métodos) | `getSize()` / `getCapacity()` (así no chocan con las variables `size` y `capacity`) |
| Vector dinámico | `obtener` / `agregarAlFinal` / `insertar` / `eliminarEn` / `buscar` | `get` / `pushBack` / `insert` / `removeAt` / `find` |
| Vector dinámico | `redimensionar` / `nuevaCapacidad` / `nuevos` | `resize` / `newCapacity` / `newData` |
| Lista enlazada | `ListaEnlazada` | `LinkedList` |
| Lista enlazada | `nodoEn(i)` | `nodeAt(i)` |
| Lista enlazada | `obtener(i)` | `get(i)` |
| Lista enlazada | `insertarAlInicio` / `insertarAlFinal` / `insertarEn` | `insertAtFront` / `insertAtBack` / `insertAt` |
| Lista enlazada | `buscar` / `eliminar` / `eliminarEn` | `find` / `remove` / `removeAt` |
| Lista enlazada | `tamano` (variable) / `actual` / `anterior` (variable local) / `nodo` / `lista` | `size` / `current` / `prev` / `node` / `list` |
| Lista doblemente enlazada | `ListaDoble` | `DoublyLinkedList` |
| Lista doblemente enlazada | `anterior` / `siguiente` (campos del nodo y variables locales de `insertarEn`) | `prev` / `next` |
| Lista doblemente enlazada | `eliminarAlInicio` / `eliminarAlFinal` / `desenganchar` | `removeFront` / `removeBack` / `unlink` |
| Lista doblemente enlazada | `imprimirAlReves` | `printBackward` |
| Lista circular | `ListaCircular` / `ultimo` / `primero()` (método y variable local de `eliminarPrimero`) | `CircularList` / `last` / `first()` |
| Lista circular | `rotar` / `eliminarPrimero` / `vacia()` | `rotate` / `removeFirst` / `isEmpty()` |
| Lista circular | `unTurno` / `procesos` / `falta` / `quedan` / `tiempo` / `turno` | `takeTurn` / `processes` / `remaining` / `leftover` / `time` / `turn` |
| Lambdas | `elevarAlCuadrado` / `cuadrado` / `resultado` | `computeSquare` / `square` / `result` |
| Lambdas | `capturaPorValor` / `multiplicar` | `captureByValue` / `multiply` |
| Lambdas | `sumarConReferencia` / `numeros` / `acumular` | `sumWithReference` / `numbers` / `addToTotal` |
| Lambdas | `sumaDeCuadrados` / `sumarCuadrados` / `suma` | `sumOfSquares` / `sumSquares` / `sum` |
| Lambdas | `usarSumador` / `crearSumador` / `sumarBase` | `useAdder` / `makeAdder` / `addBase` |
| Lambdas | `contarMayores` / `limite` / `primerMultiplo` | `countGreater` / `limit` / `firstMultiple` |
| Lambdas | `ordenarDescendente` / `ordenarPorCercania` / `centro` / `ordenarParesPrimero` | `sortDescending` / `sortByCloseness` / `center` / `sortEvensFirst` |
| Lambdas | `imprimir` / `mayor` / `llamadas` / `contar` / `copiaTodo` / `refTodo` / `menorPrimero` / `cola` | `print` / `larger` / `calls` / `counter` / `copyAll` / `refAll` / `smallestFirst` / `pq` |
| Notación algorítmica | `pasos` / `datos` / `suma` | `steps` / `data` / `total` |
| Notación algorítmica | `obtener` / `sumar` / `hayRepetidos` | `get` / `sum` / `hasDuplicates` |
| Notación algorítmica | `busquedaBinaria` / `objetivo` / `medio` | `binarySearch` / `target` / `mid` |
| Notación algorítmica | `contarPresentes` / `consultas` / `encontrados` | `countPresent` / `queries` / `found` |
| Recursión | `sumaDigitos` / `imprimirDigitos` / `imprimirAlReves` | `digitSum` / `printDigits` / `printReversed` |
| Recursión | `invertir` / `acumulado` | `reverseDigits` / `accumulated` |
| Recursión | `aBase` / `DIGITOS` | `toBase` / `DIGITS` |
| Recursión | `esPalindromo` / `palabra` | `isPalindrome` / `word` |
| Recursión | `potencia` / `exponente` / `mitad` | `power` / `exponent` / `half` |
| Recursión | `fibonacci` / `fibonacciMemo` / `memo` | `fibonacci` / `fibonacciMemo` / `memo` |
| Pila | `PilaEnlazada` | `LinkedStack` |
| Pila | `apilar` / `desapilar` / `cima` | `push` / `pop` / `peek` |
| Pila | `tope` (puntero a la cima) | `top` |
| Pila | `usarStack` | `useStack` |
| Pila | `estanBalanceados` / `abiertos` / `esperado` | `isBalanced` / `openers` / `expected` |
| Cola | `ColaEnlazada` | `LinkedQueue` |
| Cola | `encolar` / `desencolar` / `frente()` | `enqueue` / `dequeue` / `front()` |
| Cola | `primero` / `ultimo` (punteros de `ColaEnlazada`) | `head` / `tail` (no `front`, que es el método) |
| Cola | `usarQueue` / `josefo` / `ronda` / `cola` (variable) | `useQueue` / `josephus` / `circle` / `queue` |
| Cola | `fondo()` (ejercicio) / `inicio` / `fin` (arreglo circular) | `back()` / `start` / `end` |
| Ordenamientos elementales | `estaOrdenado` / `huboIntercambio` / `minimo` (índice) | `isSorted` / `swapped` / `minIndex` |
| Ordenamientos elementales | `clave` / `salto` (shell sort) | `key` / `gap` |
| Ordenamientos elementales | comparaciones / intercambios / desplazamientos / escrituras (contadores) | comparisons / swaps / shifts / writes |
