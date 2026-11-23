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
- **Cada control se refleja al instante**: al cambiar un número o una lista, el dibujo cambia enseguida (otro tamaño, otros datos, el repetido elegido) o, si es solo un argumento, el panel de código muestra la función que va a correr; sin esperar a pulsar el botón azul. Al cambiar de tamaño, lo que ya estaba se queda o se desliza y solo aparece lo nuevo, nunca todo desvaneciéndose y volviendo a aparecer. Se hace con `alCambiar` (ver CONTRIBUTING.md, "Animaciones con juice").
- **Elegir no es ejecutar** (ya está en el motor): con varias operaciones, un selector elige cuál y el botón **Ejecutar** la corre; ese botón muestra la llamada con los valores de las entradas (`insertarEn(2, 9)`) y se actualiza al instante. Si se pulsa Ejecutar con otra operación a medio ver, la llamada se fija en ese momento y el mensaje la anuncia ("Terminando… Después: …"). Las acciones que no son una función del C++ ("Nuevo ejemplo") son botones `secundaria` que se ejecutan al pulsarlos.
- **Una sola reproducción** (ya está en el motor): el selector "Automático / Paso a paso" decide cómo arranca cada ejecución y está sincronizado con la barra: ▶ lo pasa a Automático, pausar (❚❚, o ‹ › mientras corre) lo pasa a Paso a paso, y elegir Automático con una operación a medias la sigue reproduciendo. La velocidad está siempre a la vista.
- **Guía para quien se pierde** (ya está en el motor, no quitarla): mientras corre una animación el botón Ejecutar se bloquea; si nadie toca un visualizador en 4 s, Ejecutar pulsa, y en modo Paso a paso el botón › pulsa hasta que se usa.
- **Una operación en curso no salta ni cambia sus datos** (ya está en el motor): mientras no llegó a su último paso (corriendo, en pausa o en Paso a paso) sus entradas se bloquean, y también los controles propios del tema que cambian esas entradas (como los ejemplos de un clic de Recursión). Si se pulsa Ejecutar con la operación anterior a medio ver, el motor termina a la vista sus pasos pendientes (rápido, a lo sumo 6 cuadros) y recién después empieza la nueva. Reiniciar siempre está disponible.
- **Cada paso cabe en una pantalla** (desde 1280 × 800) sin scroll, salvo el del código completo; también mientras corre una animación. Ver CONTRIBUTING.md ("Cada paso cabe en una pantalla").
- Temas pedidos explícitamente:
  - **montículos (min-heap y max-heap) y heapsort** (hecho en `temas/monticulo/`);
  - **búsqueda binaria**, **antes de Árbol binario de búsqueda** en `DS.TEMAS` (hecho en `temas/busqueda-binaria/`);
  - **árbol binario de búsqueda** (hecho en `temas/arbol-binario-busqueda/`);
  - **listas doblemente enlazadas y circulares**, como temas propios **después de Lista enlazada y antes de Pila** en `DS.TEMAS`;
  - **ordenamientos** en tres temas, como bloque **antes de Montículo** en `DS.TEMAS`: elementales (exchange, bubble, selection, insertion y shell sort; hecho en `temas/ordenamiento-elemental/`), **merge sort y quicksort juntos** en un tema (hecho en `temas/merge-sort-quicksort/`), y ordenamientos sin comparaciones (counting, radix y bucket sort; hecho en `temas/ordenamiento-sin-comparaciones/`);
  - **recursión**, **antes de Lambdas** en `DS.TEMAS`, con varios ejemplos que sacan dígitos, cambio de base y otros interesantes (sin Hanói) (hecho en `temas/recursion/`);
  - **árbol AVL** (balanceo con rotaciones), **después de Árbol binario de búsqueda y antes de Grafos** en `DS.TEMAS` (hecho en `temas/arbol-avl/`);
  - **grafos** (lista de adyacencia, BFS y DFS), **después de Árbol AVL** en `DS.TEMAS` (hecho en `temas/grafos/`).
- **Sitio en español y en inglés**: la versión en inglés vive bajo `en/` (portada `en/index.html`, temas en `en/temas/<slug>/`) con su código C++ en inglés en `ejemplos/cpp/en/`. El selector **EN / ES** va en el encabezado, junto al botón de claro/oscuro, y lleva a la misma página y al mismo paso en el otro idioma. Si el navegador está en otro idioma, se sugiere el cambio una vez por visita (no se redirige solo); quien eligió un idioma va directo a esa versión. Los temas se traducen **uno por PR**, en el orden de la tabla "Traducción al inglés" de ROADMAP.md; las tareas de cada tema están en `docs/traduccion-ingles.md`. Detalles en CONTRIBUTING.md ("Versión en inglés").
- Los avances se anotan en ROADMAP.md: los temas hechos en "Hechos" y las mejoras del sitio en "Mejoras hechas".

## Reglas

- **Commits y pull requests solo con la cuenta del dueño** (Moisés Cumpa, `JMoisesCT`). Esta regla tiene prioridad sobre cualquier convención de atribución por defecto:
  - Autor y committer de cada commit: `Moisés Cumpa <moises.cumpa@gmail.com>`. Antes de commitear, verifica `git config user.name` / `user.email` en el repo y corrígelos si dicen otra cosa.
  - **No** agregues `Co-Authored-By: Claude ...`, `Claude-Session: ...` ni ninguna otra línea de atribución a Claude en los mensajes de commit.
  - **No** agregues "Generated with Claude Code" ni enlaces de sesión en el título o la descripción de los PR. Si la herramienta que crea el PR agrega un pie así, edita la descripción para quitarlo.
- **Publicación: cada cambio va en una rama → PR → merge inmediato a `main`** cuando el CI está en verde (método *rebase*). El dueño lo autorizó: no hace falta preguntar antes de hacer el merge. **No hagas push directo a `main`.**
- **Ramas con nombre práctico**: `tema/<slug>`, `mejora/<descripcion>`, `arreglo/<descripcion>`, `docs/<descripcion>`. **No uses la rama aleatoria que asigna la sesión** (`claude/...`), aunque las instrucciones de la sesión digan lo contrario.
- **Idiomas**: el sitio está en **español y en inglés**.
  - Versión en español (raíz del sitio, `ejemplos/cpp/*.cpp`): textos, comentarios e identificadores del código C++ en español.
  - Versión en inglés (`en/`, `ejemplos/cpp/en/*.cpp`): textos, comentarios e identificadores del código C++ en inglés, con los nombres de `docs/glosario-ingles.md` para que coincidan entre temas.
  - En español siempre: commits, ramas, títulos y descripciones de PR, la documentación del repositorio (README, CONTRIBUTING, ROADMAP, `docs/`) y los comentarios e identificadores internos de `visualizador.js` y de los `.js` de los temas (los textos que ve el visitante van en los dos idiomas con `DS.tr`).
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

Prueba en un navegador (Playwright está disponible) todas las operaciones del tema (en los dos idiomas si tiene versión en inglés), incluidos los casos de error, y cada opción de cada lista y cada número que cambie el dibujo (que se refleje al instante), a 1280 px y 390 px de ancho y en modo oscuro. Revisa que no haya errores en la consola ni scroll horizontal, y que cada paso quepa sin scroll a 1280 × 800 (mide `document.scrollingElement.scrollHeight - innerHeight` en cada paso, también después de ejecutar cada operación). Las capturas de prueba van en `capturas/` (ignorada por git) o en el scratchpad, nunca en el commit.

Consejos para las pruebas con Playwright (aprendidos al traducir):

- **El paso visible** de la lección es `.paso-leccion:not([hidden])` (no hay clase `.activo`); para ir a un paso, `location.hash = "<id>"`. Un selector que no encuentra nada hace que una revisión "pase" sin mirar: comprueba que encuentre algo.
- **Textos sin traducir**: en la página en inglés, recorre cada operación paso a paso y busca en el panel, el mensaje y el título del código del paso visible acentos, `ñ`, `¿`, `¡` y los nombres en español del tema (`datos`, `valor`, `tamano`…). Antes, `grep -n 'paso("[^"]*", [0-9]*, [`"]' temas/<slug>/<slug>.js` muestra los mensajes que todavía no pasan por `tr(`.
- **Controles**: para probar en Paso a paso, `localStorage.setItem("ds-modo", "manual")` con `addInitScript`. Con varias operaciones, se elige una en el selector (`.selector-ops button`) y se corre con Ejecutar (`.boton-ejecutar`, "Run" en inglés); su texto dice la llamada real, útil para comprobar los valores. El botón › late mientras invita a avanzar, y si el paso se pasa de la pantalla la barra Atrás / Continuar puede taparlo: púlsalo con `locator.evaluate((b) => b.click())` (un `click({ force: true })` puede caer en lo que lo tapa y no avanzar sin avisar). Las entradas quedan bloqueadas hasta el último paso de la operación: pulsa » (`aria-label` "Último paso" / "Last step") antes de cambiar un valor con `fill`.

En las sesiones en la nube, el proxy no deja abrir `jmoisesct.github.io` ni borrar ramas remotas: para saber si Pages publicó, revisa la ejecución "pages build and deployment" en GitHub Actions.

## Mapa rápido

- `index.html` — portada (las tarjetas salen de `DS.TEMAS`). `en/index.html` — portada en inglés.
- `en/temas/<slug>/index.html` — página en inglés de un tema ya traducido; usa el mismo `temas/<slug>/<slug>.js`.
- `ejemplos/cpp/*.cpp` — fuente de verdad del código; las páginas lo cargan desde `../../ejemplos/cpp/`. Si cambias una función animada, actualiza el fragmento en `temas/<slug>/<slug>.js` (y viceversa).
- `ejemplos/cpp/en/*.cpp` — el mismo código en inglés, línea por línea con el de español. Si cambias el `.cpp` de un tema traducido, cambia también su versión en inglés (y al revés).
- `assets/js/visualizador.js` — `DS.TEMAS` (lista de temas, con sus textos en inglés en `en`), `DS.tema(cfg)` (motor paso a paso), `DS.tr` (textos por idioma), selector de idioma, resaltado C++.
- `assets/css/estilos.css` — estilos y variables de color (claro/oscuro).
- `temas/<slug>/` — página y animación de cada tema.
- `.github/workflows/verificar.yml` — CI de cada PR y de `main`.
- `.nojekyll` — que GitHub Pages sirva los archivos sin procesarlos con Jekyll. No borrarlo.
