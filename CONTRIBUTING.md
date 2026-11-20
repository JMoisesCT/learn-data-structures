# Cómo contribuir

El sitio está **en español y en inglés** (ver "Versión en inglés"). La versión en español lleva textos, comentarios e identificadores del código de ejemplo en español, y la versión en inglés, todo eso en inglés. Commits, ramas, PR, la documentación del repositorio y los comentarios internos de los `.js` van **en español**.

Al contribuir aceptas que tu aporte se publique con las mismas licencias del proyecto: [MIT](LICENSE) para el código y [CC BY 4.0](LICENSE-CONTENIDO) para los textos, la documentación y las imágenes (ver "Licencia" en el README).

## Estructura del repositorio

El repositorio **es** el sitio: GitHub Pages publica `main` tal cual, sin pasos de construcción.

```
index.html                 Portada
en/index.html              Portada en inglés
en/temas/<tema>/index.html Página en inglés de un tema traducido (usa el mismo <tema>.js)
assets/css/estilos.css     Estilos compartidos (modo claro y oscuro)
assets/js/visualizador.js  Motor de animaciones, resaltado C++ y lista de temas
temas/<tema>/index.html    Página del tema
temas/<tema>/<tema>.js     Animación del tema
ejemplos/cpp/              Programas C++ completos, uno por tema (las páginas los muestran)
ejemplos/cpp/en/           Los mismos programas en inglés, línea por línea
docs/                      Notas del proyecto (p. ej. inspiración para el rediseño visual)
docs/glosario-ingles.md    Nombres en inglés de las funciones y variables de los ejemplos
docs/traduccion-ingles.md  Plan de traducción: tareas de cada tema
docs/img/                  Imágenes del README
scripts/
  compilar-ejemplos.sh     Compila y ejecuta todos los ejemplos, en los dos idiomas (con sanitizadores)
  verificar-fragmentos.mjs Comprueba que el código de las animaciones = el de los .cpp (en los dos idiomas)
.github/workflows/
  verificar.yml            CI de cada pull request y de main
LICENSE                    Licencia MIT (código)
LICENSE-CONTENIDO          Licencia CC BY 4.0 (textos, documentación e imágenes)
```

## GitHub Pages

Configuración (ya hecha): **Settings → Pages → Build and deployment → Source: Deploy from a branch**, rama `main`, carpeta `/ (root)`.
Cada merge a `main` se publica en uno o dos minutos. El archivo `.nojekyll` hace que GitHub sirva los archivos tal cual: no lo borres. Usa siempre rutas relativas, porque el sitio vive bajo `/learn-data-structures/`.

## Flujo de trabajo

1. Crea una rama desde `main` con un nombre descriptivo (ver abajo). **No hagas push directo a `main`.**
2. Haz cambios pequeños y enfocados: **un tema o una mejora por pull request**.
3. Antes de abrir el PR, ejecuta las verificaciones locales (ver abajo).
4. Abre el PR contra `main` usando la plantilla.
5. Cuando el CI (`Verificar ejemplos`) quede en verde, **haz el merge de inmediato** (método *rebase*, para que `main` conserve los commits tal cual, sin commit de merge).
6. GitHub Pages publica `main` en uno o dos minutos.

## Nombres de pull requests

El título debe decir **qué cambia** sin tener que abrir el PR:

```
[Ámbito] Verbo en infinitivo + qué cambia
```

- **Ámbito**: el tema (`Pila`, `Cola`, `Árbol binario de búsqueda`…) o el área: `Sitio`, `Motor`, `CI`, `Docs`.
- **Verbo**: `Agregar`, `Corregir`, `Mejorar`, `Explicar`, `Refactorizar`, `Eliminar`.
- Máximo ~70 caracteres. Sin punto final.

Ejemplos:

| ✅ Claro | ❌ Poco claro |
| --- | --- |
| `[Árbol binario de búsqueda] Agregar animación de insertar y buscar con ejemplo en C++` | `Nuevo tema` |
| `[Pila] Corregir mensaje al desapilar una pila vacía` | `fix` |
| `[Motor] Agregar control de velocidad por teclado` | `Cambios varios` |
| `[Sitio] Publicar desde la raíz de main en GitHub Pages` | `Update index.html` |
| `[Docs] Explicar cómo agregar un tema nuevo` | `docs` |

La descripción sigue [la plantilla](.github/pull_request_template.md): qué hace, lista de cambios y checklist.

## Ramas y commits

- Ramas con nombre práctico: `tema/<slug>` para temas nuevos (`tema/arbol-binario-busqueda`), `mejora/<descripcion>`, `arreglo/<descripcion>`, `docs/<descripcion>`. **Nunca** ramas con nombres aleatorios (como las `claude/...` que crean las sesiones).
- Commits en español, en infinitivo y con el ámbito en minúsculas: `pila: corregir mensaje de pila vacía`, `sitio: agregar modo oscuro`.
- Los commits y pull requests van **solo a nombre de la cuenta del dueño** (`JMoisesCT`): sin líneas `Co-Authored-By`, sin firmas de herramientas ni "Generated with…" en commits o descripciones de PR.

## Verificaciones locales

```bash
scripts/compilar-ejemplos.sh          # compila con -Wall -Wextra -Werror y sanitizadores, y ejecuta
node scripts/verificar-fragmentos.mjs # el código de las animaciones coincide con los .cpp
for f in $(find assets temas -name '*.js'); do node --check "$f"; done  # sintaxis de los .js
python3 -m http.server 8000           # desde la raíz: revisar en el navegador
```

Las tres primeras son las mismas que corre el CI.

Prueba cada operación de la animación, incluidos los casos de error (estructura vacía, llena, posición inválida), en pantalla ancha y en móvil (~390 px), en modo claro y oscuro, y en los dos idiomas si el tema tiene versión en inglés. Cambia también cada opción de cada lista y cada número: el dibujo o el código tienen que reflejarlo apenas se elige.

## Cómo agregar un tema nuevo

Usa como plantilla **`temas/vector-dinamico/`** (estructura lineal) o **`temas/monticulo/`** (árbol): tienen el formato que se espera de todos los temas (ver "Formato de un tema" más abajo). Para estructuras con nodos y punteros, mira también `temas/lista-enlazada/`.

1. **Código C++** — `ejemplos/cpp/<nombre>.cpp`
   - Programa completo con `main()` que demuestre cada operación e imprima resultados.
   - C++17, sin dependencias externas, sin advertencias con `-Wall -Wextra -Wpedantic`.
   - Identificadores y comentarios en español; menciona el equivalente de la STL (`std::stack`, `std::map`…).
   - Cada operación con un comentario de complejidad (`// O(1): ...`).
   - Sin fugas de memoria (el CI usa AddressSanitizer).
2. **Animación** — `temas/<slug>/<slug>.js`
   - Llama a `DS.tema({...})` (la API está documentada al inicio de la sección "Visualizador" en `assets/js/visualizador.js`).
   - `codigo`: copia **exacta** de cada función del `.cpp` que se anima (la sangría no importa). `verificar-fragmentos.mjs` falla si no coinciden.
   - Si el tema deja elegir entre dos versiones de algunas funciones (como la convención del factor de balance en `temas/arbol-avl/`), la otra versión va en `variantes` (ver `DS.tema` en `visualizador.js`) con su propio `.cpp`. El verificador exige que ese archivo sea el principal con esos fragmentos cambiados (sin contar comentarios).
   - `ejecutar(s, args, paso)`: modifica el estado `s` como lo haría el C++ y llama a `paso(clave, linea, mensaje, tipo)` después de cada línea relevante. Las líneas empiezan en 1, contadas dentro del fragmento.
   - Muestra también los casos de error (`tipo = "error"`) en la línea del `throw` o del `return` correspondiente.
   - Mensajes cortos que expliquen **por qué**, no solo qué.
   - No toques el DOM fuera de `dibujar()` (el verificador ejecuta el archivo sin navegador). Si el tema tiene un widget propio (explorador, experimento), móntalo solo cuando `typeof document !== "undefined"`.
   - Anima con **"juice"** (ver "Formato de un tema"): usa `incremental: true` y dale un id a cada valor para que se deslice al moverse.
3. **Página** — `temas/<slug>/index.html`
   - Siempre es una **lección por pasos** (ver "Formato de un tema"): envuelve las secciones en `<div class="leccion">`, cada una como `<section class="paso-leccion" id="<paso>" data-titulo="<título corto>">`. El motor agrega la barra de progreso y los botones Atrás / Continuar. Las preguntas con respuesta inmediata usan `.pregunta`. El marcado está documentado en `visualizador.js`.
   - Un visualizador por paso: `<div id="vis-<operacion>"></div>` y `DS.tema({ contenedor: "vis-<operacion>", ... })`.
4. **Registro** — agrega el tema en `DS.TEMAS` (`assets/js/visualizador.js`); si estaba como `proximamente`, quita esa marca. Eso actualiza menú, portada y enlaces anterior/siguiente.
5. **Docs** — agrega la fila en la tabla de `README.md`, en su grupo y con una descripción corta (una línea: el detalle va en la lección), y marca el tema como hecho en `ROADMAP.md`.

## Versión en inglés

El sitio en español está en la raíz y el sitio en inglés bajo `en/`, con las mismas rutas: `temas/pila/` ↔ `en/temas/pila/`, y la portada `index.html` ↔ `en/index.html`. Los dos idiomas comparten `assets/`, `ejemplos/` y el `.js` de cada tema.

**Cómo se ve:**

- El selector **EN / ES** está en el encabezado, junto al botón de claro/oscuro. Lleva a la misma página en el otro idioma y conserva el paso de la lección (`#paso`). En un tema que todavía no está traducido aparece atenuado, con una ayuda que lo explica.
- Elegir un idioma (con el selector o con la sugerencia) se recuerda en `localStorage` (`ds-idioma`): después, cualquier página abre directo en ese idioma si ya está traducida.
- Quien no eligió nada y tiene el navegador en otro idioma (`navigator.languages`) ve una sugerencia que flota bajo el selector, una vez por visita. **No se redirige solo** por el idioma del navegador: así los buscadores, que no guardan preferencias, indexan las dos versiones. Tampoco se usa el país: un sitio estático no lo sabe sin un servicio externo, y el país no dice qué idioma lee cada persona.
- En inglés, el menú y la portada muestran todos los temas con su título en inglés; los que faltan traducir dicen *in Spanish for now* y abren la versión en español. Los enlaces del contenido a un tema sin traducir (`../lista-enlazada/`) se ajustan solos a la versión en español.

**Cómo traducir un tema** (un tema por PR, título `[<Tema>] Agregar la lección en inglés`):

1. **Código C++** — `ejemplos/cpp/en/<nombre-en-ingles>.cpp`, traducido **línea por línea** desde el de español: las mismas líneas, en el mismo orden, con identificadores, comentarios, mensajes y salidas en inglés. Usa los nombres de `docs/glosario-ingles.md` (y agrega ahí los nuevos) para que coincidan entre temas. Las líneas de comentario pueden cambiar de cantidad; las de código no.
2. **Animación** — en el mismo `temas/<slug>/<slug>.js`, cada texto que ve el visitante pasa por `DS.tr(es, en)`: mensajes de `paso(...)`, `mensajeInicial`, etiquetas de botones y entradas, títulos del código y los nombres de variables y punteros que se dibujan. Los fragmentos de código también: `const CODIGO = DS.tr({ … }, { … })`, con las mismas claves. La lógica de la animación es una sola para los dos idiomas.
3. **Página** — `en/temas/<slug>/index.html`, copia traducida de `temas/<slug>/index.html` con `<html lang="en">`, `data-raiz="../../../"`, los mismos `id` de pasos (para que el selector conserve el paso), `data-codigo-completo="en/<archivo>.cpp"` y los scripts `../../../assets/js/visualizador.js` y `../../../temas/<slug>/<slug>.js`. Los enlaces a otros temas se escriben como en español (`../cola/`).
4. **Registro** — en `DS.TEMAS`, agrega `archivo: "<archivo>.cpp"` dentro de `en` (eso hace que el selector, el menú y la portada usen la página en inglés), y marca el tema como traducido en `ROADMAP.md`.

`verificar-fragmentos.mjs` revisa la página en inglés igual que la de español (con `DS.idioma = "en"`) y además que cada fragmento tenga **las mismas líneas** en los dos idiomas, porque los mensajes de la animación usan los mismos números de línea. `compilar-ejemplos.sh` compila también `ejemplos/cpp/en/`.

## Formato de un tema

Así quiere el dueño del repositorio **todos** los temas. Los ejemplos de referencia son `temas/vector-dinamico/` y `temas/monticulo/`.

### Lección por pasos, nunca una página larga

Pasos cortos, uno a la vez, al estilo de Brilliant. Un tema típico tiene entre 7 y 10 pasos:

1. **La idea**, con una analogía, y si se puede un primer visualizador o explorador simple (por ejemplo `obtener(i)` en el vector, o tocar un nodo para ver padre e hijos en el montículo).
2. **Un paso por operación** (`insertar`, `eliminar`, `buscar`…). Cada uno tiene una explicación breve (2 o 3 frases), su propio visualizador con solo esa operación y un estado inicial pensado para mostrarla bien, y **una o dos preguntas** (`.pregunta`) con explicación en cada opción, también en las incorrectas.
3. Si hay una idea que se entiende mejor experimentando (costo amortizado, factor de carga, comparación de estrategias), un **paso con un widget interactivo** propio, como el experimento de `vector-dinamico`.
4. **Todo junto**: un visualizador con todas las operaciones para jugar libremente.
5. **Complejidad y usos**: tabla de Big-O con el porqué, el equivalente en la STL y cuándo usar (y cuándo no) la estructura.
6. **Código completo y práctica**: el `.cpp` completo, cómo compilarlo y ejercicios.

### Cada paso cabe en una pantalla

En pantallas desde 861 px de ancho y 560 px de alto, la lección ocupa la ventana sin scroll: el encabezado es una sola fila (con la barra de progreso de la lección), la presentación del tema es compacta y solo se ve en el primer paso y el pie del sitio solo en el último, el visualizador se estira hasta el pie de la lección y **las preguntas que van justo después de un visualizador se muestran junto al código** (el motor las mueve). Para que eso funcione:

- Pon las preguntas de un paso **inmediatamente después** de su `<div id="vis-…">`.
- Mantén la explicación en 2 o 3 frases: el texto largo le quita alto a la animación. Si son dos ideas, ponlas lado a lado con `.dos-columnas`; una lista larga (como los usos del paso de complejidad) puede ir en dos columnas con `<ul class="lista-columnas">`.
- Comprueba que cada paso, salvo el del código completo, quepa sin scroll a 1280 × 800.
- Si el dibujo más alto de una operación no entra en el alto disponible, el motor reduce el contenido del escenario con `zoom` (hasta 0,8; si aun así no cabe, la página hace scroll). No hace falta hacer nada en el tema, pero un dibujo compacto se lee mejor: si tiene dos partes (como el arreglo y la gráfica de Notación algorítmica), ponlas lado a lado cuando el escenario es ancho.
- En una sola columna (móvil y tablet vertical) el código se pliega a la línea que se ejecuta; panel, mensaje y controles deben caber juntos en ~390 × 700 px.

### Animaciones con "juice"

La animación tiene que mostrar **qué hace cada método en memoria**, no solo cambiar colores:

- **Los valores se mueven:** cada valor tiene un id y una posición absoluta, y se desliza con una transición CSS cuando el código lo copia o lo mueve (`incremental: true` en `DS.tema`). Si el C++ copia, en el origen queda una copia atenuada hasta que se pisa.
- **Entradas y salidas visibles:** lo que se agrega cae o aparece con `pop`, lo que se borra se desvanece antes de desaparecer, y lo que se va a perder se marca en rojo un paso antes.
- **Punteros e índices como marcas que se desplazan:** `i`, `pos`, `tamano`, `cabeza`… arriba o abajo de su casilla o nodo, y también en las variables.
- **Los cambios de estructura se ven:** por ejemplo, al redimensionar aparece el bloque nuevo, los valores viajan hasta él y el viejo se libera.
- **Los errores se notan:** sacudida, marca roja en la posición inválida y el mensaje en la línea del `throw` o del `return`.
- **Cada control se refleja al instante:** si una entrada cambia los datos (una lista con otro arreglo, el tamaño `n`), el dibujo cambia apenas se elige, sin esperar a ejecutar. Si es un argumento (qué recorrido, qué criterio, qué pivote), el panel de código muestra enseguida la función que va a correr. Para lo que no debe reiniciar todo, usa `alCambiar` en la entrada (ver `DS.tema` en `visualizador.js`). Al cambiar de tamaño, lo que ya estaba se queda (o se desliza) y solo aparece lo nuevo: no recrees las piezas que siguen siendo las mismas.
- **Valor devuelto** visible ("devuelve 30") cuando la función retorna algo.
- **El dibujo no salta:** si arriba del dibujo hay una fila de información que a veces ocupa dos renglones (variables, pila de llamadas, "devuelve"), márcala con `data-alto-estable`: el motor le reserva desde el primer paso el alto más grande que tenga en la operación.
- **De dónde viene cada cosa:** el panel de código lo indica solo a partir de los pasos (vueltas de cada bucle, quién llamó a la función que se ve y a dónde vuelve, llamadas a lambdas y recursivas, cabecera de cada función de la biblioteca estándar). Para que funcione, al pasar a otra función cambia al fragmento de esa función en `paso(...)` (así se ve la llamada) y muestra cada vuelta de un bucle con al menos una línea de su cuerpo. Si los pasos se saltan vueltas o la línea del bucle de afuera, da el número con `s.vis.vueltas = { 2: i + 1 }` (la línea del `for`/`while` dentro del fragmento). Si una llamada recursiva está en medio de una expresión (`return f(n / 10) + n % 10;`) o hay dos en la misma línea, da la profundidad con `s.vis.nivel = k` (1 = la primera llamada), como en `temas/recursion/`.
- **Mensajes cortos que expliquen el porqué** de cada paso, y la línea de C++ correcta resaltada.
- Funciona a 390 px (el dibujo se escala o el escenario hace scroll por dentro), en modo oscuro y con `prefers-reduced-motion`. Los colores salen solo de las variables de `estilos.css`.

## Estilo del sitio

- Sin frameworks ni dependencias externas: HTML, CSS y JS simples que funcionen en GitHub Pages.
- Colores solo mediante variables de `:root` en `estilos.css` (cada una con su versión oscura).
- Nada debe causar scroll horizontal de la página en móvil; si una animación es ancha, el escenario hace scroll por dentro.
