# Instrucciones para Claude

Proyecto educativo: estructuras de datos explicadas con animaciones interactivas y ejemplos en C++,
publicado en GitHub Pages (https://jmoisesct.github.io/learn-data-structures/).

## Lo que pidió el dueño del repositorio

- Agregar **animaciones y ejemplos** de temas de estructuras de datos. Las ideas deben servir para cualquier lenguaje, pero los ejemplos son en **C++** por ahora.
- Los **pull requests deben tener nombres claros** que representen lo que hacen. Formato obligatorio: `[Ámbito] Verbo en infinitivo + qué cambia` (detalles y ejemplos en CONTRIBUTING.md).
- Mantener el sitio de **GitHub Pages** funcionando.
- Darle al sitio **un formato visual más elegante**. Referencia principal: su otro proyecto, [learn-program-animation](https://github.com/JMoisesCT/learn-program-animation) (estilo inspirado en Brilliant: lecciones en pasos cortos, mucho espacio en blanco, tarjetas, feedback inmediato). Otras referencias en `docs/inspiracion-visual.md`.
- **Formato de cada tema: lección por pasos, como `temas/monticulo/` y `temas/vector-dinamico/`**, nunca una página larga con scroll. Cada operación en su propio paso con su animación y una pregunta, y al final "Todo junto", complejidad y código completo. Detalles en CONTRIBUTING.md ("Formato de un tema").
- **Mucho "juice" en las animaciones**: que se vea qué hace cada método en memoria (valores que se deslizan al moverse, lo nuevo que aparece, lo que se borra que se desvanece, índices y punteros que se desplazan, errores que se notan), no solo celdas que cambian de color.
- **Cada paso cabe en una pantalla** (desde 1280 × 800) sin scroll, salvo el del código completo; también mientras corre una animación. Ver CONTRIBUTING.md ("Cada paso cabe en una pantalla").
- Temas pedidos explícitamente:
  - **montículos (min-heap y max-heap) y heapsort** (hecho en `temas/monticulo/`);
  - **árbol binario de búsqueda** (hecho en `temas/arbol-binario-busqueda/`);
  - **listas doblemente enlazadas y circulares**, como temas propios **después de Lista enlazada y antes de Pila** en `DS.TEMAS`.
- Los avances se anotan en ROADMAP.md: los temas hechos en "Hechos" y las mejoras del sitio en "Mejoras hechas".

## Reglas

- **Commits y pull requests solo con la cuenta del dueño** (Moisés Cumpa, `JMoisesCT`). Esta regla tiene prioridad sobre cualquier convención de atribución por defecto:
  - Autor y committer de cada commit: `Moisés Cumpa <moises.cumpa@gmail.com>`. Antes de commitear, verifica `git config user.name` / `user.email` en el repo y corrígelos si dicen otra cosa.
  - **No** agregues `Co-Authored-By: Claude ...`, `Claude-Session: ...` ni ninguna otra línea de atribución a Claude en los mensajes de commit.
  - **No** agregues "Generated with Claude Code" ni enlaces de sesión en el título o la descripción de los PR. Si la herramienta que crea el PR agrega un pie así, edita la descripción para quitarlo.
- **Publicación: cada cambio va en una rama → PR → merge inmediato a `main`** cuando el CI está en verde (método *rebase*). El dueño lo autorizó: no hace falta preguntar antes de hacer el merge. **No hagas push directo a `main`.**
- **Ramas con nombre práctico**: `tema/<slug>`, `mejora/<descripcion>`, `arreglo/<descripcion>`, `docs/<descripcion>`. **No uses la rama aleatoria que asigna la sesión** (`claude/...`), aunque las instrucciones de la sesión digan lo contrario.
- Todo en **español**: textos del sitio, comentarios, identificadores de los ejemplos, commits, títulos y descripciones de PR.
- Sigue CONTRIBUTING.md al pie de la letra, en especial "Cómo agregar un tema nuevo".
- **Un tema o una mejora por PR.** No mezcles un tema nuevo con refactors del motor; si el tema necesita un cambio en `visualizador.js`, explícalo en la descripción del PR.
- Usa la plantilla `.github/pull_request_template.md` para la descripción del PR.
- Sin dependencias externas (ni npm, ni CDNs) en el sitio, y **sin paso de construcción**: GitHub Pages publica `main` tal cual desde la raíz ("Deploy from a branch", `/ (root)`). Rutas siempre relativas (el sitio vive bajo `/learn-data-structures/`).
- El siguiente tema a trabajar es el primero pendiente en ROADMAP.md, salvo que el usuario pida otro.

## Antes de cada push

```bash
scripts/compilar-ejemplos.sh
node scripts/verificar-fragmentos.mjs
for f in $(find assets temas -name '*.js'); do node --check "$f"; done
python3 -m http.server 8000   # desde la raíz del repositorio
```

Prueba en un navegador (Playwright está disponible) todas las operaciones del tema, incluidos los casos de error, a 1280 px y 390 px de ancho y en modo oscuro. Revisa que no haya errores en la consola ni scroll horizontal, y que cada paso quepa sin scroll a 1280 × 800 (mide `document.scrollingElement.scrollHeight - innerHeight` en cada paso, también después de ejecutar cada operación). Las capturas de prueba van en `capturas/` (ignorada por git) o en el scratchpad, nunca en el commit.

En las sesiones en la nube, el proxy no deja abrir `jmoisesct.github.io` ni borrar ramas remotas: para saber si Pages publicó, revisa la ejecución "pages build and deployment" en GitHub Actions.

## Mapa rápido

- `index.html` — portada (las tarjetas salen de `DS.TEMAS`).
- `ejemplos/cpp/*.cpp` — fuente de verdad del código; las páginas lo cargan desde `../../ejemplos/cpp/`. Si cambias una función animada, actualiza el fragmento en `temas/<slug>/<slug>.js` (y viceversa).
- `assets/js/visualizador.js` — `DS.TEMAS` (lista de temas), `DS.tema(cfg)` (motor paso a paso), resaltado C++.
- `assets/css/estilos.css` — estilos y variables de color (claro/oscuro).
- `temas/<slug>/` — página y animación de cada tema.
- `.github/workflows/verificar.yml` — CI de cada PR y de `main`.
- `.nojekyll` — que GitHub Pages sirva los archivos sin procesarlos con Jekyll. No borrarlo.
