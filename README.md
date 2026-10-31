# Aprende Estructuras de Datos

Estructuras de datos explicadas con **animaciones interactivas paso a paso** y **ejemplos en C++**.
Las ideas sirven para cualquier lenguaje; por ahora el código de ejemplo está en C++.

🌐 **Sitio:** https://jmoisesct.github.io/learn-data-structures/

Cada tema tiene:

- Una explicación corta con una analogía.
- Una animación donde ejecutas operaciones (insertar, eliminar, buscar…) y ves qué pasa en memoria, **con la línea de C++ que se está ejecutando resaltada**. Puedes pausar, avanzar y retroceder.
- Una tabla de complejidad (Big-O).
- Un programa completo en C++ listo para compilar.
- Ejercicios para practicar.

## Temas

| Tema | Animación | Código C++ |
| --- | --- | --- |
| Notación algorítmica (Big-O: O(1), O(log n), O(n), O(n log n), O(n²), O(2ⁿ)) | [ver](https://jmoisesct.github.io/learn-data-structures/temas/notacion-algoritmica/) | [`notacion_algoritmica.cpp`](ejemplos/cpp/notacion_algoritmica.cpp) |
| Lambdas en C++ (capturas por valor y por referencia, lambdas anidadas, `count_if`, `find_if` y `sort` con criterio) | [ver](https://jmoisesct.github.io/learn-data-structures/temas/lambdas/) | [`lambdas.cpp`](ejemplos/cpp/lambdas.cpp) |
| Vector dinámico (acceso O(1), redimensionar y costo amortizado) | [ver](https://jmoisesct.github.io/learn-data-structures/temas/vector-dinamico/) | [`vector_dinamico.cpp`](ejemplos/cpp/vector_dinamico.cpp) |
| Lista enlazada | [ver](https://jmoisesct.github.io/learn-data-structures/temas/lista-enlazada/) | [`lista_enlazada.cpp`](ejemplos/cpp/lista_enlazada.cpp) |
| Pila (stack) | [ver](https://jmoisesct.github.io/learn-data-structures/temas/pila/) | [`pila.cpp`](ejemplos/cpp/pila.cpp) |
| Cola (queue) | [ver](https://jmoisesct.github.io/learn-data-structures/temas/cola/) | [`cola.cpp`](ejemplos/cpp/cola.cpp) |
| Montículo (min-heap, max-heap) y heapsort | [ver](https://jmoisesct.github.io/learn-data-structures/temas/monticulo/) | [`monticulo.cpp`](ejemplos/cpp/monticulo.cpp) |
| Tabla hash (funciones hash, encadenamiento, sondeo y rehash) | [ver](https://jmoisesct.github.io/learn-data-structures/temas/tabla-hash/) | [`tabla_hash.cpp`](ejemplos/cpp/tabla_hash.cpp) |
| Árbol binario de búsqueda (buscar, insertar, recorridos, eliminar en sus 3 casos) | [ver](https://jmoisesct.github.io/learn-data-structures/temas/arbol-binario-busqueda/) | [`arbol_binario_busqueda.cpp`](ejemplos/cpp/arbol_binario_busqueda.cpp) |

Los próximos temas están en [ROADMAP.md](ROADMAP.md).

## Estructura del repositorio

El repositorio **es** el sitio: GitHub Pages publica `main` tal cual, sin pasos de construcción.

```
index.html                 Portada
assets/css/estilos.css     Estilos compartidos (modo claro y oscuro)
assets/js/visualizador.js  Motor de animaciones, resaltado C++ y lista de temas
temas/<tema>/index.html    Página del tema
temas/<tema>/<tema>.js     Animación del tema
ejemplos/cpp/              Programas C++ completos, uno por tema (las páginas los muestran)
docs/                      Notas del proyecto (p. ej. inspiración para el rediseño visual)
scripts/
  compilar-ejemplos.sh     Compila y ejecuta todos los ejemplos (con sanitizadores)
  verificar-fragmentos.mjs Comprueba que el código de las animaciones = el de los .cpp
.github/workflows/
  verificar.yml            CI de cada pull request
```

## Usarlo en tu computadora

Compilar un ejemplo:

```bash
g++ -std=c++17 -Wall -Wextra ejemplos/cpp/pila.cpp -o pila && ./pila
```

Ver el sitio (desde la raíz del repositorio):

```bash
python3 -m http.server 8000
```

Luego abre http://localhost:8000. También puedes abrir `index.html` con doble clic: todo funciona salvo el bloque "Código completo", que el navegador solo carga con un servidor.

Ejecutar las mismas verificaciones que el CI:

```bash
scripts/compilar-ejemplos.sh
```

```bash
node scripts/verificar-fragmentos.mjs
```

## GitHub Pages

Configuración (ya hecha): **Settings → Pages → Build and deployment → Source: Deploy from a branch**, rama `main`, carpeta `/ (root)`.
Cada merge a `main` se publica en uno o dos minutos. El archivo `.nojekyll` hace que GitHub sirva los archivos tal cual.

## Contribuir

Lee [CONTRIBUTING.md](CONTRIBUTING.md): ahí están las convenciones de ramas, nombres de pull requests y la guía para agregar un tema nuevo.
