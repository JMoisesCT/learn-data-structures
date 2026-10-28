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
| Vector dinámico | [ver](https://jmoisesct.github.io/learn-data-structures/temas/vector-dinamico/) | [`vector_dinamico.cpp`](ejemplos/cpp/vector_dinamico.cpp) |
| Lista enlazada | [ver](https://jmoisesct.github.io/learn-data-structures/temas/lista-enlazada/) | [`lista_enlazada.cpp`](ejemplos/cpp/lista_enlazada.cpp) |
| Pila (stack) | [ver](https://jmoisesct.github.io/learn-data-structures/temas/pila/) | [`pila.cpp`](ejemplos/cpp/pila.cpp) |
| Cola (queue) | [ver](https://jmoisesct.github.io/learn-data-structures/temas/cola/) | [`cola.cpp`](ejemplos/cpp/cola.cpp) |

Los próximos temas están en [ROADMAP.md](ROADMAP.md).

## Estructura del repositorio

```
ejemplos/cpp/              Programas C++ completos, uno por tema
site/                      Sitio estático (HTML + CSS + JS, sin dependencias)
  index.html               Portada
  assets/css/estilos.css   Estilos compartidos (modo claro y oscuro)
  assets/js/visualizador.js  Motor de animaciones, resaltado C++ y lista de temas
  temas/<tema>/index.html  Página del tema
  temas/<tema>/<tema>.js   Animación del tema
scripts/
  compilar-ejemplos.sh     Compila y ejecuta todos los ejemplos (con sanitizadores)
  verificar-fragmentos.mjs Comprueba que el código de las animaciones = el de los .cpp
  construir-sitio.sh       Arma _site/ (lo que se publica en GitHub Pages)
.github/workflows/
  verificar.yml            CI de cada pull request
  pages.yml                Publica el sitio al hacer merge en main
```

## Usarlo en tu computadora

Compilar un ejemplo:

```bash
g++ -std=c++17 -Wall -Wextra ejemplos/cpp/pila.cpp -o pila && ./pila
```

Ver el sitio:

```bash
scripts/construir-sitio.sh
```

```bash
python3 -m http.server -d _site 8000
```

Luego abre http://localhost:8000.

Ejecutar las mismas verificaciones que el CI:

```bash
scripts/compilar-ejemplos.sh
```

```bash
node scripts/verificar-fragmentos.mjs
```

## GitHub Pages

El sitio se publica solo con el workflow [`pages.yml`](.github/workflows/pages.yml) cada vez que se hace merge a `main`.
Para activarlo **una sola vez**: en el repositorio ve a **Settings → Pages → Build and deployment → Source** y elige **GitHub Actions**.

## Contribuir

Lee [CONTRIBUTING.md](CONTRIBUTING.md): ahí están las convenciones de ramas, nombres de pull requests y la guía para agregar un tema nuevo.
