/*
 * Motor compartido del sitio: encabezado, tema claro/oscuro, resaltado de
 * C++, carga del código completo y el visualizador paso a paso.
 *
 * Cada página de tema llama a DS.tema({...}) desde su propio archivo .js.
 * Ver CONTRIBUTING.md -> "Cómo agregar un tema nuevo".
 */
(function () {
  "use strict";

  const DS = (window.DS = window.DS || {});

  const REPO = "https://github.com/JMoisesCT/learn-data-structures";

  // Lista única de temas: alimenta el menú, la portada y los enlaces
  // anterior/siguiente. Agrega aquí cada tema nuevo.
  DS.TEMAS = [
    {
      slug: "notacion-algoritmica",
      titulo: "Notación algorítmica (Big-O)",
      resumen: "El idioma para comparar algoritmos: cómo crecen los pasos con n. O(1), O(log n), O(n), O(n log n), O(n²) y O(2ⁿ), con gráficas.",
      etiquetas: ["empieza aquí", "O(1) a O(2ⁿ)"],
      archivo: "notacion_algoritmica.cpp",
    },
    {
      slug: "recursion",
      titulo: "Recursión",
      resumen: "Una función que se llama a sí misma con un problema más chico. Sacar dígitos, cambio de base, palíndromos, potencia rápida y el árbol de llamadas de Fibonacci, con la pila a la vista.",
      etiquetas: ["caso base", "pila de llamadas"],
      archivo: "recursion.cpp",
    },
    {
      slug: "lambdas",
      titulo: "Lambdas en C++",
      resumen: "Funciones sin nombre que se escriben donde se usan: capturas por valor y por referencia, lambdas anidadas y cómo le dan un criterio a std::sort o std::count_if.",
      etiquetas: ["herramienta de C++", "capturas [=] [&]"],
      archivo: "lambdas.cpp",
    },
    {
      slug: "vector-dinamico",
      titulo: "Vector dinámico",
      resumen: "Un arreglo que crece solo. Acceso por índice en O(1) y cómo se duplica la capacidad.",
      etiquetas: ["acceso O(1)", "insertar O(n)"],
      archivo: "vector_dinamico.cpp",
    },
    {
      slug: "lista-enlazada",
      titulo: "Lista enlazada",
      resumen: "Nodos conectados con punteros. Insertar al inicio es instantáneo; buscar requiere recorrer.",
      etiquetas: ["inicio O(1)", "buscar O(n)"],
      archivo: "lista_enlazada.cpp",
    },
    {
      slug: "lista-doble",
      titulo: "Lista doblemente enlazada",
      resumen: "Cada nodo apunta al siguiente y al anterior, y la lista guarda cabeza y cola: insertar y eliminar en los dos extremos es O(1). La idea de std::list.",
      etiquetas: ["extremos O(1)", "anterior y siguiente"],
      archivo: "lista_doble.cpp",
    },
    {
      slug: "lista-circular",
      titulo: "Lista circular",
      resumen: "El último nodo apunta al primero: con un solo puntero se llega a los dos extremos. Insertar, rotar y repartir turnos (round-robin) en O(1).",
      etiquetas: ["rotar O(1)", "round-robin"],
      archivo: "lista_circular.cpp",
    },
    {
      slug: "pila",
      titulo: "Pila (stack)",
      resumen: "El último que entra es el primero que sale (LIFO). std::stack y una pila hecha con nodos; paréntesis balanceados.",
      etiquetas: ["LIFO", "push/pop O(1)"],
      archivo: "pila.cpp",
    },
    {
      slug: "cola",
      titulo: "Cola (queue)",
      resumen: "El primero que entra es el primero que sale (FIFO). std::queue y una cola hecha con nodos y dos punteros.",
      etiquetas: ["FIFO", "push/pop O(1)"],
      archivo: "cola.cpp",
    },
    {
      slug: "ordenamiento-elemental",
      titulo: "Ordenamientos elementales",
      resumen: "Exchange, bubble, selection, insertion y shell sort: comparar pares y moverlos. Cuánto trabaja cada uno, cuál es estable y cuándo conviene.",
      etiquetas: ["O(n²)", "estabilidad"],
      archivo: "ordenamiento_elemental.cpp",
    },
    {
      slug: "merge-sort-quicksort",
      titulo: "Merge sort y quicksort",
      resumen: "Divide y vencerás: mezclar mitades ordenadas o particionar alrededor de un pivote. O(n log n), el peor caso de quicksort, el pivote al azar y quickselect.",
      etiquetas: ["O(n log n)", "recursión"],
      archivo: "merge_sort_quicksort.cpp",
    },
    {
      slug: "ordenamiento-sin-comparaciones",
      titulo: "Ordenamientos sin comparaciones",
      resumen: "Counting, radix y bucket sort: usar el valor como índice en lugar de compararlo. O(n + k), dígito por dígito, cubetas, y cuándo le ganan a O(n log n).",
      etiquetas: ["O(n + k)", "sin comparar"],
      archivo: "ordenamiento_sin_comparaciones.cpp",
    },
    {
      slug: "monticulo",
      titulo: "Montículo (heap)",
      resumen: "Min-heap y max-heap: un árbol guardado en un arreglo con el mínimo (o el máximo) siempre en la raíz. Incluye heapsort.",
      etiquetas: ["insertar O(log n)", "heapsort O(n log n)"],
      archivo: "monticulo.cpp",
    },
    {
      slug: "tabla-hash",
      titulo: "Tabla hash",
      resumen: "Una función hash lleva cada clave directo a su cubeta. Funciones hash, colisiones con encadenamiento y con sondeo, y rehash.",
      etiquetas: ["buscar O(1) promedio", "colisiones"],
      archivo: "tabla_hash.cpp",
    },
    {
      slug: "busqueda-binaria",
      titulo: "Búsqueda binaria",
      resumen: "En un arreglo ordenado, mirar el del medio descarta la mitad de golpe. Versión iterativa y recursiva, el medio que se desborda, lower_bound y upper_bound con repetidos, y buscar la respuesta sin arreglo.",
      etiquetas: ["buscar O(log n)", "requiere orden"],
      archivo: "busqueda_binaria.cpp",
    },
    {
      slug: "arbol-binario-busqueda",
      titulo: "Árbol binario de búsqueda",
      resumen: "Menores a la izquierda, mayores a la derecha. Buscar, insertar, recorridos y eliminar en sus tres casos; la idea detrás de std::set.",
      etiquetas: ["buscar O(h)", "inorden ordenado"],
      archivo: "arbol_binario_busqueda.cpp",
    },
    {
      slug: "arbol-avl",
      titulo: "Árbol AVL",
      resumen: "Un árbol binario de búsqueda que se rebalancea solo: altura y factor de balance en cada nodo, rotaciones simples y dobles, e insertar y eliminar en O(log n) aunque los datos lleguen ordenados.",
      etiquetas: ["rotaciones O(1)", "altura O(log n)"],
      archivo: "arbol_avl.cpp",
    },
    {
      slug: "grafos",
      titulo: "Grafos",
      resumen: "Vértices y aristas guardados en una lista de adyacencia. Recorrer por capas con BFS y una cola, al fondo con DFS y una pila o con recursión, distancias y componentes conexas.",
      etiquetas: ["BFS y DFS", "O(V + E)"],
      archivo: "grafos.cpp",
    },
  ];

  const raiz = document.body.dataset.raiz || "./";
  const temaActual = document.body.dataset.tema || "";

  // ------------------------------------------------------------------
  // Utilidades
  // ------------------------------------------------------------------

  function el(etiqueta, atributos, ...hijos) {
    const nodo = document.createElement(etiqueta);
    for (const [k, v] of Object.entries(atributos || {})) {
      if (v === false || v == null) continue;
      if (k === "class") nodo.className = v;
      else if (k === "text") nodo.textContent = v;
      else if (k === "html") nodo.innerHTML = v;
      else if (k.startsWith("on")) nodo.addEventListener(k.slice(2), v);
      else nodo.setAttribute(k, v === true ? "" : v);
    }
    for (const h of hijos.flat()) {
      if (h == null || h === false) continue;
      nodo.append(h instanceof Node ? h : document.createTextNode(String(h)));
    }
    return nodo;
  }
  DS.el = el;

  const clonar = typeof structuredClone === "function"
    ? (x) => structuredClone(x)
    : (x) => JSON.parse(JSON.stringify(x));

  function escapar(texto) {
    return texto.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  }

  function leerPreferencia(clave) {
    try { return localStorage.getItem(clave); } catch (e) { return null; }
  }

  function guardarPreferencia(clave, valor) {
    try { localStorage.setItem(clave, valor); } catch (e) { /* sin almacenamiento: no pasa nada */ }
  }

  // ------------------------------------------------------------------
  // Tema claro / oscuro
  // ------------------------------------------------------------------

  const temaGuardado = leerPreferencia("ds-tema");
  if (temaGuardado === "light" || temaGuardado === "dark") {
    document.documentElement.dataset.theme = temaGuardado;
  }

  function esOscuro() {
    const t = document.documentElement.dataset.theme;
    if (t) return t === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function botonTema() {
    const boton = el("button", { class: "boton-tema", type: "button", "aria-label": "Cambiar tema claro/oscuro" });
    const actualizar = () => { boton.textContent = esOscuro() ? "☀" : "☾"; };
    boton.addEventListener("click", () => {
      const nuevo = esOscuro() ? "light" : "dark";
      document.documentElement.dataset.theme = nuevo;
      guardarPreferencia("ds-tema", nuevo);
      actualizar();
    });
    actualizar();
    return boton;
  }

  // ------------------------------------------------------------------
  // Encabezado, portada y navegación entre temas
  // ------------------------------------------------------------------

  // Una sola fila en cualquier ancho: marca, tema actual, menú de temas y
  // botón de tema claro/oscuro. Así la lección tiene más alto disponible.
  function montarEncabezado() {
    const encabezado = document.querySelector("header.encabezado");
    if (!encabezado) return;
    const actual = DS.TEMAS.find((t) => t.slug === temaActual);
    const nav = el("nav", { class: "nav", "aria-label": "Temas" },
      DS.TEMAS.filter((t) => !t.proximamente).map((t) =>
        el("a", { href: `${raiz}temas/${t.slug}/`, "aria-current": t.slug === temaActual ? "page" : null, text: t.titulo })));
    const menu = el("details", { class: "menu-temas" }, el("summary", { text: "Temas" }), nav);
    // Se cierra al elegir, al tocar fuera o con Escape.
    document.addEventListener("click", (ev) => { if (menu.open && !menu.contains(ev.target)) menu.open = false; });
    document.addEventListener("keydown", (ev) => {
      if (ev.key === "Escape" && menu.open) {
        menu.open = false;
        menu.querySelector("summary").focus();
      }
    });
    encabezado.append(el("div", { class: "contenedor" },
      el("a", { class: "marca", href: raiz, title: "Inicio" },
        el("span", { class: "marca-icono", "aria-hidden": "true", text: "{ }" }),
        el("span", { class: actual ? "marca-texto con-tema" : "marca-texto", text: "Aprende Estructuras de Datos" })),
      actual ? el("span", { class: "marca-tema", text: actual.titulo }) : null,
      menu,
      botonTema()));
  }

  function montarPortada() {
    const contenedor = document.getElementById("lista-temas");
    if (!contenedor) return;
    for (const t of DS.TEMAS) {
      const contenido = [
        el("h3", { text: t.titulo }),
        el("p", { text: t.resumen }),
        el("div", { class: "etiquetas" }, t.etiquetas.map((e) => el("span", { class: "etiqueta", text: e }))),
      ];
      contenedor.append(t.proximamente
        ? el("div", { class: "tarjeta proximamente" }, contenido)
        : el("a", { class: "tarjeta", href: `${raiz}temas/${t.slug}/` }, contenido));
    }
  }

  function montarNavegacionTemas() {
    const contenedor = document.getElementById("navegacion-temas");
    if (!contenedor) return;
    const listos = DS.TEMAS.filter((t) => !t.proximamente);
    const i = listos.findIndex((t) => t.slug === temaActual);
    if (i < 0) return;
    contenedor.className = "navegacion-temas";
    contenedor.append(
      i > 0 ? el("a", { href: `${raiz}temas/${listos[i - 1].slug}/`, text: `← ${listos[i - 1].titulo}` }) : el("span"),
      i < listos.length - 1 ? el("a", { href: `${raiz}temas/${listos[i + 1].slug}/`, text: `${listos[i + 1].titulo} →` }) : el("a", { href: raiz, text: "Volver al inicio" }));
  }

  function siguienteTema() {
    const listos = DS.TEMAS.filter((t) => !t.proximamente);
    const i = listos.findIndex((t) => t.slug === temaActual);
    return i >= 0 && i < listos.length - 1 ? listos[i + 1] : null;
  }

  // ------------------------------------------------------------------
  // Lección por pasos (para temas largos: un paso a la vez, sin scroll eterno)
  // ------------------------------------------------------------------
  //
  // <div class="leccion">
  //   <section class="paso-leccion" id="idea" data-titulo="La idea">…</section>
  //   <section class="paso-leccion" id="…" data-titulo="…">…</section>
  // </div>
  //
  // Agrega barra de progreso (cada segmento lleva a su paso) y botones
  // Atrás / Continuar. El paso actual queda en la URL (#idea) para poder
  // enlazarlo. Sin JavaScript se ven todos los pasos seguidos.

  function montarLeccion() {
    const leccion = document.querySelector(".leccion");
    if (!leccion) return;
    const pasos = [...leccion.querySelectorAll(":scope > .paso-leccion")];
    if (!pasos.length) return;
    const total = pasos.length;
    let actual = -1;

    const segmentos = pasos.map((p, k) =>
      el("li", {}, el("a", { href: `#${p.id}`, title: `${k + 1}. ${p.dataset.titulo}`, "aria-label": `Paso ${k + 1}: ${p.dataset.titulo}` })));
    const contador = el("span", { class: "leccion-contador" });
    const cabecera = el("nav", { class: "leccion-cabecera", "aria-label": "Pasos de la lección" },
      el("ol", { class: "leccion-indice" }, segmentos), contador);

    const bAtras = el("button", { class: "boton", type: "button", text: "← Atrás", onclick: () => ir(actual - 1) });
    const destino = el("span", { class: "leccion-destino" });
    const bContinuar = el("button", { class: "boton principal", type: "button", onclick: () => ir(actual + 1) }, "Continuar", destino, " →");
    const proximo = siguienteTema();
    const enlaceFinal = el("a", {
      class: "boton principal",
      href: proximo ? `${raiz}temas/${proximo.slug}/` : raiz,
      text: proximo ? `Siguiente tema: ${proximo.titulo} →` : "Volver al inicio",
    });
    const pie = el("div", { class: "leccion-pie" }, el("div", { class: "leccion-pie-interior" }, bAtras, bContinuar, enlaceFinal));

    for (const p of pasos) {
      const titulo = p.querySelector("h2");
      if (titulo) titulo.setAttribute("tabindex", "-1");
    }
    leccion.append(pie);
    leccion.classList.add("lista");
    // La lección ocupa la pantalla: la presentación del tema solo se ve en el
    // primer paso y el pie del sitio solo en el último (ver estilos.css).
    document.body.classList.add("con-leccion");
    const presentacion = document.querySelector(".tema-cabecera");

    // En pantallas donde la lección cabe en la ventana, la barra de progreso va
    // en la misma fila que el encabezado del sitio (deja más alto a cada paso);
    // en las demás, arriba de la lección.
    const encabezado = document.querySelector("header.encabezado");
    const filaEncabezado = encabezado && encabezado.querySelector(".contenedor");
    function ubicarProgreso() {
      const arriba = !!filaEncabezado && PANTALLA_AJUSTADA.matches;
      if (arriba) filaEncabezado.insertBefore(cabecera, filaEncabezado.querySelector(".menu-temas"));
      else leccion.prepend(cabecera);
      document.body.classList.toggle("progreso-arriba", arriba);
    }
    ubicarProgreso();
    if (PANTALLA_AJUSTADA.addEventListener) PANTALLA_AJUSTADA.addEventListener("change", ubicarProgreso);

    // Si no, la barra de progreso se pega justo debajo del encabezado del sitio (si está fijo).
    const altoFijo = () => (encabezado && getComputedStyle(encabezado).position === "sticky" ? encabezado.offsetHeight : 0);
    const medirEncabezado = () => leccion.style.setProperty("--alto-encabezado", `${altoFijo()}px`);
    window.addEventListener("resize", medirEncabezado);
    medirEncabezado();

    function indiceDesdeHash() {
      const id = decodeURIComponent(location.hash.slice(1));
      if (!id) return -1;
      const objetivo = document.getElementById(id);
      return objetivo ? pasos.findIndex((p) => p.contains(objetivo)) : -1;
    }

    function ir(k, opciones) {
      k = Math.max(0, Math.min(total - 1, k));
      if (k === actual) return;
      const haciaAtras = k < actual;
      const primeraVez = actual < 0;
      actual = k;
      pasos.forEach((p, j) => {
        p.hidden = j !== k;
        p.classList.remove("entrando", "entrando-atras");
      });
      if (!primeraVez) {
        void pasos[k].offsetWidth; // reinicia la animación de entrada
        pasos[k].classList.add(haciaAtras ? "entrando-atras" : "entrando");
      }
      segmentos.forEach((li, j) => {
        li.className = j < k ? "hecho" : j === k ? "actual" : "";
        li.firstChild.toggleAttribute("aria-current", j === k);
      });
      contador.textContent = `${k + 1} / ${total}`;
      bAtras.disabled = k === 0;
      bContinuar.hidden = k === total - 1;
      enlaceFinal.hidden = k !== total - 1;
      if (k < total - 1) destino.textContent = `: ${pasos[k + 1].dataset.titulo}`;
      if (presentacion) presentacion.classList.toggle("plegada", k > 0);
      document.body.classList.toggle("leccion-final", k === total - 1);

      if (!(opciones && opciones.sinUrl) && history.replaceState) history.replaceState(null, "", `#${pasos[k].id}`);
      // Los dibujos que se escalan miden de nuevo su ancho ahora que son visibles.
      window.dispatchEvent(new Event("resize"));
      if (!primeraVez) {
        window.scrollTo(0, 0);
        const titulo = pasos[k].querySelector("h2");
        if (titulo) titulo.focus({ preventScroll: true });
      }
    }

    window.addEventListener("hashchange", () => {
      const k = indiceDesdeHash();
      if (k >= 0) ir(k, { sinUrl: true });
    });
    const inicial = indiceDesdeHash();
    ir(inicial >= 0 ? inicial : 0, { sinUrl: inicial < 0 });
    // Con #paso en la URL el navegador baja hasta la sección y tapa su título:
    // la lección siempre empieza arriba.
    if (inicial >= 0) window.addEventListener("load", () => { if (window.scrollY > 0) window.scrollTo(0, 0); }, { once: true });
  }

  // ------------------------------------------------------------------
  // Preguntas de opción múltiple con respuesta inmediata
  // ------------------------------------------------------------------
  //
  // <div class="pregunta">
  //   <p class="pregunta-enunciado">¿…?</p>
  //   <div class="opciones">
  //     <button type="button" class="opcion" data-correcta data-explicacion="Por qué sí">…</button>
  //     <button type="button" class="opcion" data-explicacion="Por qué no">…</button>
  //   </div>
  // </div>

  function montarPreguntas() {
    for (const pregunta of document.querySelectorAll(".pregunta")) {
      const respuesta = el("p", { class: "respuesta", "aria-live": "polite" });
      pregunta.append(respuesta);
      const opciones = pregunta.querySelectorAll(".opcion");
      for (const opcion of opciones) {
        opcion.addEventListener("click", () => {
          const correcta = opcion.hasAttribute("data-correcta");
          for (const o of opciones) {
            o.classList.remove("correcta", "incorrecta");
            o.setAttribute("aria-pressed", o === opcion ? "true" : "false");
          }
          opcion.classList.add(correcta ? "correcta" : "incorrecta");
          respuesta.className = `respuesta ${correcta ? "bien" : "pista"}`;
          respuesta.textContent = `${correcta ? "¡Exacto! " : "Todavía no. "}${opcion.dataset.explicacion || ""}`;
        });
      }
    }
  }

  // ------------------------------------------------------------------
  // Resaltado de sintaxis C++ (pequeño y sin dependencias)
  // ------------------------------------------------------------------

  const CLAVES = new Set(("if else for while do switch case return break continue new delete class struct public private " +
    "protected const constexpr static throw try catch true false nullptr this using namespace template typename " +
    "explicit default operator sizeof auto virtual override noexcept").split(" "));
  const TIPOS = new Set("void int bool char double float long short unsigned size_t std string vector".split(" "));
  const TOKEN = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')|(^[ \t]*#[^\n]*)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_]\w*)(?=(\s*\())?/gm;

  function envolver(clase, texto) {
    return texto.split("\n").map((t) => `<span class="${clase}">${escapar(t)}</span>`).join("\n");
  }

  function resaltarCpp(codigo) {
    let html = "";
    let ultimo = 0;
    let m;
    TOKEN.lastIndex = 0;
    while ((m = TOKEN.exec(codigo))) {
      html += escapar(codigo.slice(ultimo, m.index));
      ultimo = TOKEN.lastIndex;
      if (m[1]) html += envolver("tk-comentario", m[1]);
      else if (m[2]) html += envolver("tk-texto", m[2]);
      else if (m[3]) html += envolver("tk-pre", m[3]);
      else if (m[4]) html += envolver("tk-numero", m[4]);
      else if (m[5]) {
        const id = m[5];
        if (CLAVES.has(id)) html += envolver("tk-clave", id);
        else if (TIPOS.has(id) || /^[A-Z][a-z]/.test(id)) html += envolver("tk-tipo", id);
        else if (m[6] !== undefined) html += envolver("tk-funcion", id);
        else html += escapar(id);
      }
    }
    html += escapar(codigo.slice(ultimo));
    return html.split("\n").map((l) => `<span class="linea">${l || " "}</span>`).join("");
  }
  DS.resaltarCpp = resaltarCpp;

  // ------------------------------------------------------------------
  // Análisis de un fragmento: su nombre, sus bucles y sus llamadas
  // ------------------------------------------------------------------
  //
  // El visualizador lo usa para indicar, sin que cada tema haga nada, en qué
  // vuelta de un bucle va la ejecución, desde qué línea se llamó a una
  // función, a cuál llama la línea actual y de dónde sale una función de la
  // biblioteca estándar.

  // Funciones de la biblioteca estándar: de qué cabecera vienen.
  const ORIGENES = {
    swap: "<utility>",
    sort: "<algorithm>",
    count_if: "<algorithm>",
    find_if: "<algorithm>",
    min: "<algorithm>",
    max: "<algorithm>",
    abs: "<cstdlib>",
    floor: "<cmath>",
    out_of_range: "<stdexcept>",
    invalid_argument: "<stdexcept>",
    underflow_error: "<stdexcept>",
  };

  // Cambia comentarios y textos por espacios (conserva posiciones y saltos de
  // línea) para buscar bucles y llamadas sin confundirse con lo que dicen.
  function sinComentarios(codigo) {
    return codigo.replace(/\/\/[^\n]*|\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'/g,
      (m) => m.replace(/[^\n]/g, " "));
  }

  function analizarFragmento(codigo) {
    const limpio = sinComentarios(codigo);
    const lineas = limpio.split("\n");
    const inicios = [0];
    for (let k = 0; k < limpio.length; k++) if (limpio[k] === "\n") inicios.push(k + 1);
    const lineaDe = (pos) => {
      let n = 0;
      while (n + 1 < inicios.length && inicios[n + 1] <= pos) n++;
      return n + 1;
    };
    const saltarEspacios = (pos) => {
      while (pos < limpio.length && /\s/.test(limpio[pos])) pos++;
      return pos;
    };
    // Posición del cierre que corresponde a la apertura en pos.
    const cierre = (pos) => {
      const abre = limpio[pos];
      const cierra = abre === "(" ? ")" : "}";
      let nivel = 0;
      for (let k = pos; k < limpio.length; k++) {
        if (limpio[k] === abre) nivel++;
        else if (limpio[k] === cierra && --nivel === 0) return k;
      }
      return -1;
    };
    // Fin de una instrucción sin llaves (el ; fuera de paréntesis).
    const finInstruccion = (pos) => {
      let nivel = 0;
      for (let k = pos; k < limpio.length; k++) {
        if (limpio[k] === "(") nivel++;
        else if (limpio[k] === ")") nivel--;
        else if (limpio[k] === ";" && nivel === 0) return k;
      }
      return -1;
    };

    // Nombre de la función que define el fragmento (si es una definición).
    const primera = lineas.find((l) => l.trim()) || "";
    const def = primera.match(/^\s*[\w:<>,*&\s]*?[\w>*&]\s+[*&]?\s*(?:\w+::)?([A-Za-z_]\w*)\s*\([^;]*$/);
    const nombre = def && !CLAVES.has(def[1]) ? def[1] : null;

    // Bucles: for, while y do … while, con el rango de líneas que abarcan.
    const bucles = [];
    const whileDeDo = new Set();
    const reBucle = /\b(for|while|do)\b/g;
    let m;
    while ((m = reBucle.exec(limpio))) {
      const tipo = m[1];
      const cabecera = lineaDe(m.index);
      if (tipo === "do") {
        const llave = saltarEspacios(m.index + 2);
        if (limpio[llave] !== "{") continue;
        const fin = cierre(llave);
        const pw = saltarEspacios(fin + 1);
        if (fin < 0 || !limpio.startsWith("while", pw)) continue;
        whileDeDo.add(pw);
        const puntoYComa = finInstruccion(pw);
        const condicion = lineaDe(pw);
        if (condicion === cabecera) continue;
        bucles.push({ tipo, cabecera, condicion, inicio: cabecera, fin: lineaDe(puntoYComa), cuerpo: [cabecera, condicion - 1] });
        continue;
      }
      if (whileDeDo.has(m.index)) continue;
      const parentesis = saltarEspacios(m.index + tipo.length);
      if (limpio[parentesis] !== "(") continue;
      const finParentesis = cierre(parentesis);
      if (finParentesis < 0) continue;
      const despues = saltarEspacios(finParentesis + 1);
      if (limpio[despues] === ";") continue; // bucle sin cuerpo
      const fin = limpio[despues] === "{" ? cierre(despues) : finInstruccion(despues);
      if (fin < 0) continue;
      const desde = Math.max(lineaDe(finParentesis) + (limpio[despues] === "{" ? 1 : 0), lineaDe(despues));
      const hasta = lineaDe(fin);
      if (hasta <= cabecera || desde > hasta) continue; // todo en una línea: no hay vueltas que mostrar
      bucles.push({ tipo, cabecera, condicion: cabecera, inicio: cabecera, fin: hasta, cuerpo: [desde, hasta] });
    }
    // En un bucle sin otros bucles adentro, la misma línea del cuerpo dos
    // veces seguidas es otra vuelta (los temas suelen mostrar una sola línea
    // por vuelta). Con un bucle adentro, no: entre vuelta y vuelta corre el de
    // adentro, y dos pasos en la misma línea son dos mensajes de una vuelta.
    for (const b of bucles) {
      b.repetirEsVuelta = !bucles.some((o) => o !== b && o.inicio >= b.inicio && o.fin <= b.fin);
    }
    bucles.sort((a, b) => a.inicio - b.inicio || b.fin - a.fin);
    // Profundidad de cada bucle (para dibujar los anidados uno al lado del otro).
    for (const b of bucles) {
      b.nivel = bucles.filter((o) => o !== b && o.inicio <= b.inicio && o.fin >= b.fin).length;
    }

    // Llamadas de cada línea: identificadores seguidos de "(".
    const llamadas = lineas.map((l, k) => {
      const nombres = [];
      for (const c of l.matchAll(/\b([A-Za-z_]\w*)\s*\(/g)) {
        const id = c[1];
        if (CLAVES.has(id) || TIPOS.has(id)) continue;
        if (k === lineas.indexOf(primera) && id === nombre) continue; // la propia definición
        // obj.metodo( u obj->metodo(: método de un objeto, no una función suelta.
        nombres.push({ id, metodo: /(?:\.|->)\s*$/.test(l.slice(0, c.index)) });
      }
      return nombres;
    });

    // Lambdas de varias líneas: [capturas](parámetros) { … }. Su cuerpo corre
    // cuando se las llama, no donde se escriben.
    const lambdas = [];
    const reLambda = /\[[^\[\]\n]*\]\s*\(/g;
    while ((m = reLambda.exec(limpio))) {
      const parentesis = m.index + m[0].length - 1;
      const finParentesis = cierre(parentesis);
      if (finParentesis < 0) continue;
      let pos = saltarEspacios(finParentesis + 1);
      const resto = limpio.slice(pos).match(/^(?:mutable\s*)?(?:->\s*[\w:<>]+\s*)?/);
      pos = saltarEspacios(pos + resto[0].length);
      if (limpio[pos] !== "{") continue;
      const fin = cierre(pos);
      const inicio = lineaDe(m.index);
      if (fin < 0 || lineaDe(fin) <= inicio) continue;
      const asignada = lineas[inicio - 1].slice(0, m.index - inicios[inicio - 1]).match(/(\w+)\s*=\s*$/);
      lambdas.push({ nombre: asignada ? asignada[1] : null, inicio, fin: lineaDe(fin) });
    }

    return { nombre, bucles, llamadas, lambdas };
  }
  DS.analizarFragmento = analizarFragmento;

  // Quita la sangría común para que los fragmentos se vean alineados.
  function dedent(texto) {
    const lineas = texto.replace(/^\n+|\s+$/g, "").split("\n");
    const sangria = Math.min(...lineas.filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length));
    return lineas.map((l) => l.slice(sangria)).join("\n");
  }
  DS.dedent = dedent;

  // ------------------------------------------------------------------
  // Código completo (se copia a /codigo/ al construir el sitio)
  // ------------------------------------------------------------------

  function montarCodigoCompleto() {
    for (const caja of document.querySelectorAll("[data-codigo-completo]")) {
      const archivo = caja.dataset.codigoCompleto;
      const enGithub = `${REPO}/blob/main/ejemplos/cpp/${archivo}`;
      const pre = el("pre", { class: "codigo", tabindex: "0" }, el("span", { class: "linea", text: "// Cargando…" }));
      const copiar = el("button", { class: "boton", type: "button", text: "Copiar" });
      caja.classList.add("codigo-completo");
      caja.append(
        el("div", { class: "barra" },
          el("span", { text: `ejemplos/cpp/${archivo}` }),
          el("span", {}, copiar, " ", el("a", { class: "boton", href: enGithub, target: "_blank", rel: "noopener", text: "GitHub" }))),
        pre);

      fetch(`${raiz}ejemplos/cpp/${archivo}`)
        .then((r) => { if (!r.ok) throw new Error(r.status); return r.text(); })
        .then((texto) => {
          pre.innerHTML = resaltarCpp(texto.replace(/\s+$/, ""));
          copiar.addEventListener("click", () => {
            navigator.clipboard.writeText(texto).then(() => {
              copiar.textContent = "¡Copiado!";
              setTimeout(() => { copiar.textContent = "Copiar"; }, 1500);
            });
          });
        })
        .catch(() => {
          pre.innerHTML = "";
          pre.append(el("span", { class: "linea", text: "// No se pudo cargar el archivo aquí." }),
            el("span", { class: "linea", text: `// Míralo en GitHub: ${enGithub}` }));
          copiar.disabled = true;
        });
    }
  }

  // ------------------------------------------------------------------
  // Visualizador paso a paso
  // ------------------------------------------------------------------
  //
  // cfg = {
  //   codigo:        { clave: "fragmento C++" }      // fragmentos que se muestran y resaltan
  //   contenedor:    "visualizador"                   // opcional: id del elemento (varios por página)
  //   estadoInicial: (valores) => objeto              // estado plano (se clona en cada paso);
  //                                                   // recibe los valores actuales de las entradas
  //   entradas:      [{ id, etiqueta, valor, min, max, aleatorio }]   // número
  //                  [{ id, etiqueta, opciones: [[valor, texto]] }]   // lista; al cambiarla se reinicia
  //                  [{ ..., opciones, reinicia: false }]             // lista que no reinicia (solo es un argumento)
  //   operaciones:   [{ id, etiqueta, usa: ["valor"], codigo: "clave", secundaria, ejecutar(s, args, paso) }]
  //                  secundaria: true -> botón normal (para acciones que no son una función del C++)
  //                  etiqueta puede ser (valores) => texto si depende de una lista
  //   dibujar(escenario, estado)                      // pinta un estado en el escenario
  //   incremental:   true                             // opcional: no vaciar el escenario entre pasos
  //                                                   // (para animar movimientos con transiciones CSS)
  //   mensajeInicial                                  // texto o (valores) => texto
  //   codigoInicial                                   // opcional: clave del fragmento que se ve al
  //                                                   // empezar (texto o (valores) => clave)
  // }
  //
  // Dentro de ejecutar(), cada llamada paso(clave, linea, mensaje, tipo)
  // toma una "foto" del estado s. Las líneas empiezan en 1. tipo puede ser
  // "error" o "exito". Usa s.vis para resaltados temporales (se borra al
  // empezar y terminar cada operación).
  //
  // El panel de código indica solo, a partir de la secuencia de pasos, en qué
  // vuelta va cada bucle, quién llamó a la función que se ve (si el fragmento
  // cambia a uno que el anterior llama), las llamadas recursivas y de qué
  // cabecera viene cada función de la biblioteca estándar. Si los pasos de un
  // bucle no muestran cada vuelta (por ejemplo, se saltan la línea del for de
  // afuera), el tema puede dar el número: s.vis.vueltas = { 2: i + 1 }, con la
  // línea del for/while (dentro del fragmento) como clave.
  //
  // Las llamadas recursivas se deducen cuando la ejecución vuelve a una línea
  // anterior a la que se llama a sí misma. Si la llamada está en medio de una
  // expresión (return f(n / 10) + n % 10) o hay dos en la misma línea, el tema
  // da la profundidad: s.vis.nivel = k (1 = la primera llamada de esa función).

  const VELOCIDADES = [0.4, 0.7, 1, 1.6, 2.6];

  // Pantallas donde la lección cabe en la ventana (la misma consulta que en estilos.css).
  const PANTALLA_AJUSTADA = typeof window !== "undefined" && window.matchMedia
    ? window.matchMedia("(min-width: 861px) and (min-height: 560px)")
    : { matches: false };
  // Lo más que se reduce un dibujo para que quepa a lo alto; si aun así no cabe, la página hace scroll.
  const ESCALA_MINIMA = 0.8;

  function tema(cfg) {
    const contenedor = document.getElementById(cfg.contenedor || "visualizador");
    if (!contenedor) return;
    const prefijo = cfg.contenedor ? cfg.contenedor : "entrada";

    const fragmentos = {};
    for (const [clave, texto] of Object.entries(cfg.codigo)) fragmentos[clave] = dedent(texto);
    // Nombre, bucles y llamadas de cada fragmento (para las indicaciones del código).
    const analisis = {};
    const clavePorNombre = {};
    for (const [clave, texto] of Object.entries(fragmentos)) {
      analisis[clave] = analizarFragmento(texto);
      const n = analisis[clave].nombre;
      if (n && !(n in clavePorNombre)) clavePorNombre[n] = clave;
    }
    const nombreDe = (clave) => (analisis[clave] && analisis[clave].nombre) || clave;

    let estado = null;
    let pasos = [];
    let actual = 0;
    let temporizador = null;
    let velocidad = 2;
    let modo = "auto";
    let claveMostrada = null;
    // Entradas aleatorias que cambian de valor cuando termina la operación (no
    // antes: mientras corre la animación, la caja muestra el valor que se usa).
    let aleatoriosPendientes = [];

    // --- Construcción de la interfaz ---
    const campos = {};
    const controles = el("div", { class: "controles" });
    for (const e of cfg.entradas || []) {
      let input;
      if (e.opciones) {
        input = el("select", { id: `${prefijo}-${e.id}` },
          e.opciones.map(([valor, texto]) => el("option", { value: valor, text: texto })));
        if (e.valor != null) input.value = e.valor;
        input.addEventListener("change", e.reinicia === false ? () => actualizarEtiquetas(valoresEntradas()) : reiniciar);
      } else {
        input = el("input", { type: "number", id: `${prefijo}-${e.id}`, min: e.min, max: e.max, step: 1, inputmode: "numeric" });
        input.value = e.aleatorio ? aleatorio(e) : e.valor;
        input.addEventListener("keydown", (ev) => { if (ev.key === "Enter") cfg.operaciones[0] && ejecutar(cfg.operaciones[0]); });
      }
      campos[e.id] = { cfg: e, input };
      controles.append(el("label", { class: "campo", for: input.id }, e.etiqueta, input));
    }
    const botones = [];
    for (const op of cfg.operaciones) {
      const boton = el("button", { class: op.secundaria ? "boton" : "boton principal", type: "button", onclick: () => ejecutar(op) });
      botones.push([op, boton]);
      controles.append(boton);
    }
    controles.append(el("span", { class: "separador" }),
      el("button", { class: "boton", type: "button", text: "Reiniciar", onclick: reiniciar }));

    const escenario = el("div", { class: "escenario" });
    const mensaje = el("p", { class: "mensaje", "aria-live": "polite" });

    const bInicio = el("button", { class: "boton", type: "button", title: "Primer paso", "aria-label": "Primer paso", text: "«", onclick: () => ir(0) });
    const bAtras = el("button", { class: "boton", type: "button", title: "Paso anterior", "aria-label": "Paso anterior", text: "‹", onclick: () => ir(actual - 1) });
    // Ancho fijo: si ▶ y ❚❚ midieran distinto, la fila podría partirse en dos al empezar a
    // reproducir, después de que ajustarEscala midió el alto disponible.
    const bPlay = el("button", { class: "boton boton-play", type: "button", title: "Reproducir / pausar", "aria-label": "Reproducir o pausar", onclick: alternar });
    const bAdelante = el("button", { class: "boton", type: "button", title: "Paso siguiente", "aria-label": "Paso siguiente", text: "›", onclick: () => ir(actual + 1) });
    const bFin = el("button", { class: "boton", type: "button", title: "Último paso", "aria-label": "Último paso", text: "»", onclick: () => ir(pasos.length - 1) });
    const contador = el("span", { class: "contador-pasos" });
    const rango = el("input", { type: "range", min: 0, max: VELOCIDADES.length - 1, step: 1, "aria-label": "Velocidad", title: "Velocidad" });
    rango.value = velocidad;
    rango.addEventListener("input", () => { velocidad = Number(rango.value); if (temporizador) { detener(); reproducir(); } });
    const etiquetaVelocidad = el("label", { class: "velocidad" }, el("span", { class: "texto-velocidad", text: "Velocidad" }), rango);

    // Modo al ejecutar una operación: reproducir solo o avanzar con ›.
    const bAuto = el("button", { type: "button", text: "▶ Automático", onclick: () => cambiarModo("auto", true) });
    const bManual = el("button", { type: "button", text: "Paso a paso", onclick: () => cambiarModo("manual", true) });
    const selectorModo = el("div", { class: "selector-modo", role: "group", "aria-label": "Al ejecutar una operación", title: "Al ejecutar una operación" }, bAuto, bManual);

    const reproduccion = el("div", { class: "reproduccion" },
      el("div", { class: "fila-reproduccion" }, bInicio, bAtras, bPlay, bAdelante, bFin, contador),
      el("div", { class: "fila-reproduccion" }, selectorModo, etiquetaVelocidad));

    const nombreCodigo = el("span", { class: "nombre-codigo" });
    const preCodigo = el("pre", { class: "codigo con-rastro", tabindex: "0" });
    // Desde qué línea se llamó a la función que se ve (solo dentro de una llamada).
    const procedencia = el("div", { class: "llamada-desde", hidden: true });
    // Con el código plegado (móvil) las indicaciones de la línea actual van en su propia fila.
    const filaPlegada = el("div", { class: "indicaciones-plegado", "aria-hidden": "true" });
    // En pantallas angostas el código se pliega a la línea que se ejecuta.
    const bPlegar = el("button", { class: "boton-plegar", type: "button", "aria-expanded": "false", onclick: () => plegar(!panelCodigo.classList.contains("plegado")) });
    const panelCodigo = el("div", { class: "panel panel-codigo" }, el("div", { class: "titulo-codigo" }, nombreCodigo, bPlegar), procedencia, preCodigo, filaPlegada);
    function plegar(si) {
      panelCodigo.classList.toggle("plegado", si);
      bPlegar.setAttribute("aria-expanded", String(!si));
      bPlegar.textContent = si ? "Ver todo ▾" : "Ver menos ▴";
      // Los corchetes y el cursor se miden con las líneas a la vista.
      if (pasos[actual]) mostrarCodigo(pasos[actual], false);
    }
    plegar(true);

    // Las preguntas que siguen al visualizador van junto al código.
    const columnaCodigo = el("div", { class: "columna-codigo" }, panelCodigo);
    for (let sig = contenedor.nextElementSibling; sig && sig.classList.contains("pregunta"); sig = contenedor.nextElementSibling) {
      columnaCodigo.append(sig);
    }

    contenedor.classList.add("visualizador");
    contenedor.append(el("div", { class: "panel" }, controles, escenario, mensaje, reproduccion), columnaCodigo);

    // Si las preguntas no caben junto al código, la columna se desplaza por dentro y lo avisa.
    function avisarDesborde() {
      const falta = columnaCodigo.scrollHeight - columnaCodigo.clientHeight - columnaCodigo.scrollTop;
      columnaCodigo.classList.toggle("hay-mas", falta > 8);
    }
    columnaCodigo.addEventListener("scroll", avisarDesborde, { passive: true });
    if (window.ResizeObserver) {
      const observador = new ResizeObserver(avisarDesborde);
      for (const nodo of [columnaCodigo, ...columnaCodigo.children]) observador.observe(nodo);
    }

    // --- Lógica ---
    function cambiarModo(nuevo, elegidoAqui) {
      modo = nuevo;
      bAuto.setAttribute("aria-pressed", String(modo === "auto"));
      bManual.setAttribute("aria-pressed", String(modo === "manual"));
      etiquetaVelocidad.hidden = modo === "manual";
      bAdelante.classList.toggle("principal", modo === "manual");
      if (!elegidoAqui) return;
      if (modo === "manual") detener();
      guardarPreferencia("ds-modo", modo);
      // Los demás visualizadores de la página usan el mismo modo.
      window.dispatchEvent(new CustomEvent("ds-modo", { detail: { modo, origen: contenedor } }));
    }
    window.addEventListener("ds-modo", (ev) => { if (ev.detail.origen !== contenedor) cambiarModo(ev.detail.modo, false); });
    cambiarModo(leerPreferencia("ds-modo") === "manual" ? "manual" : "auto", false);

    // Para que los botones no salten entre pasos, el escenario y el mensaje
    // reservan desde el primer paso el alto del paso más grande, y nunca se
    // encogen; vuelven a su tamaño natural al reiniciar o cambiar el ancho.
    // La reserva va en --alto-reservado (el CSS decide el mínimo final).
    const altos = new Map();
    function reservar(nodo, h) {
      if (h > (altos.get(nodo) || 0)) {
        altos.set(nodo, h);
        nodo.style.setProperty("--alto-reservado", `${h}px`);
      }
    }
    const noEncoger = (nodo) => reservar(nodo, nodo.offsetHeight);

    // Cuando la lección estira el escenario para llenar la pantalla, el dibujo
    // se centra en vertical según el alto reservado (no según el paso actual,
    // para que no salte entre pasos).
    function centrar() {
      escenario.style.removeProperty("--hueco");
      // Con el alto que midió ajustarEscala (sin depender del dibujo): si el
      // dibujo anterior todavía se está achicando con una transición, el
      // escenario mide de más y el hueco quedaría grande hasta el paso siguiente.
      const alto = altoDisponible != null ? altoDisponible : escenario.offsetHeight;
      const sobra = alto - altoMinimo;
      if (sobra > 1) escenario.style.setProperty("--hueco", `${Math.floor(sobra / 2)}px`);
    }

    // En una lección que cabe en la ventana, si el dibujo más alto de la
    // operación no entra en el alto que le toca al escenario, el contenido se
    // reduce con zoom (en --escala, ver estilos.css). El alto disponible se
    // mide con el escenario vacío de reservas, así no depende del dibujo.
    const enLeccion = !!contenedor.closest(".leccion");
    let altoMinimo = 0;
    let altoDisponible = null;
    function ajustarEscala() {
      if (!escenario.clientWidth) return; // paso de lección oculto: se ajusta al mostrarlo
      altoDisponible = null;
      const natural = altos.get(escenario) || 0;
      const relleno = 32; // padding de arriba y abajo del escenario, sin el hueco
      let k = 1;
      if (enLeccion && PANTALLA_AJUSTADA.matches && natural > relleno) {
        // Al encoger el escenario para medirlo, la página puede quedar más baja
        // que la ventana y el navegador sube el scroll: se recupera al final.
        const scroll = window.scrollY;
        escenario.style.removeProperty("--hueco");
        escenario.style.minHeight = "0px";
        escenario.style.flexBasis = "0px";
        const disponible = escenario.clientHeight;
        altoDisponible = disponible;
        escenario.style.minHeight = "";
        escenario.style.flexBasis = "";
        if (window.scrollY !== scroll) window.scrollTo(window.scrollX, scroll);
        // 1 px de margen: el alto final se redondea hacia arriba.
        if (disponible < natural) k = Math.max(ESCALA_MINIMA, (disponible - relleno - 1) / (natural - relleno));
      }
      altoMinimo = k < 1 ? Math.ceil(relleno + (natural - relleno) * k) : natural;
      if (k < 1) {
        escenario.style.setProperty("--escala", k.toFixed(3));
        escenario.style.setProperty("--alto-minimo", `${altoMinimo}px`);
      } else {
        escenario.style.removeProperty("--escala");
        escenario.style.removeProperty("--alto-minimo");
      }
    }

    // Dibuja cada paso en copias invisibles del escenario y del mensaje para medirlos.
    function reservarEspacio() {
      if (!escenario.clientWidth) return; // paso de lección oculto
      const invisible = "position:absolute;left:0;top:0;min-height:0;visibility:hidden;pointer-events:none;";
      const copiaEscenario = el("div", { class: "escenario", "aria-hidden": "true", style: `${invisible}width:${escenario.offsetWidth}px` });
      const copiaMensaje = el("p", { class: "mensaje", "aria-hidden": "true", style: `${invisible}width:${mensaje.offsetWidth}px` });
      escenario.parentElement.append(copiaEscenario, copiaMensaje);
      let altoEscenario = 0;
      let altoMensaje = 0;
      for (const p of pasos) {
        copiaEscenario.replaceChildren();
        cfg.dibujar(copiaEscenario, p.estado);
        altoEscenario = Math.max(altoEscenario, copiaEscenario.offsetHeight);
        copiaMensaje.textContent = p.mensaje;
        altoMensaje = Math.max(altoMensaje, copiaMensaje.offsetHeight);
      }
      copiaEscenario.remove();
      copiaMensaje.remove();
      reservar(escenario, altoEscenario);
      reservar(mensaje, altoMensaje);
    }
    function liberarAlturas() {
      for (const nodo of altos.keys()) nodo.style.removeProperty("--alto-reservado");
      altos.clear();
    }
    let anchoVentana = window.innerWidth;
    window.addEventListener("resize", () => {
      if (window.innerWidth !== anchoVentana) { // en móvil, la barra del navegador cambia solo el alto
        anchoVentana = window.innerWidth;
        liberarAlturas();
      }
      if (!escenario.clientWidth) return; // paso de lección oculto
      if (!altos.has(escenario)) reservarEspacio();
      ajustarEscala();
      centrar();
      if (pasos[actual]) mostrarCodigo(pasos[actual], false);
    });

    function aleatorio(e) {
      const min = e.min ?? 1;
      const max = e.max ?? 99;
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function leerArgumentos(op) {
      const args = {};
      for (const id of op.usa || []) {
        const { cfg: e, input } = campos[id];
        if (e.opciones) {
          args[id] = input.value;
          continue;
        }
        const n = Number(input.value);
        if (input.value.trim() === "" || !Number.isInteger(n)) {
          return { error: `Escribe un número entero en "${e.etiqueta}".` };
        }
        if ((e.min != null && n < e.min) || (e.max != null && n > e.max)) {
          return { error: `"${e.etiqueta}" debe estar entre ${e.min} y ${e.max}.` };
        }
        args[id] = n;
      }
      return { args };
    }

    function valoresEntradas() {
      const valores = {};
      for (const [id, { cfg: e, input }] of Object.entries(campos)) {
        valores[id] = e.opciones ? input.value : Number(input.value);
      }
      return valores;
    }

    // Las etiquetas pueden depender de las listas (p. ej. insertMax / insertMin).
    function actualizarEtiquetas(valores) {
      for (const [op, boton] of botones) {
        const texto = typeof op.etiqueta === "function" ? op.etiqueta(valores) : op.etiqueta;
        if (op.secundaria) boton.textContent = texto;
        else boton.innerHTML = `<code>${escapar(texto)}</code>`;
      }
    }

    function pasoInicial(texto) {
      const inicial = typeof cfg.codigoInicial === "function" ? cfg.codigoInicial(valoresEntradas()) : cfg.codigoInicial;
      const clave = inicial || cfg.operaciones[0].codigo || cfg.operaciones[0].id;
      return { estado: clonar(estado), clave, linea: 0, mensaje: texto, tipo: "" };
    }

    // --- Rastro de la ejecución: llamadas y vueltas de los bucles ---
    //
    // Se deduce de la secuencia de pasos, sin que el tema haga nada: si el
    // fragmento cambia a uno que el anterior llama (redimensionar dentro de
    // agregarAlFinal), es una llamada y se apila; si vuelve a uno que ya
    // estaba en la pila, es un retorno. Las vueltas de un bucle se cuentan
    // cada vez que la ejecución entra a su cuerpo desde la condición o salta
    // hacia atrás dentro de él.

    function nuevoMarco(clave, lambda) {
      return { clave, lambda: lambda || null, linea: 0, ultima: 0, bucles: new Map() };
    }
    const dentroDeLambda = (lambda, l) => l > lambda.inicio && l <= lambda.fin;
    // Nombre con el que se muestra un marco: la función o la lambda.
    const nombreMarco = (m) => (m.lambda ? m.lambda.nombre || "lambda" : nombreDe(m.clave));
    // "insertarEn()" o, para una lambda sin nombre, "la lambda".
    const comoLlamada = (nombre) => (nombre === "lambda" ? "la lambda" : `${nombre}()`);

    // Línea del fragmento del marco que llama a la función de la clave dada.
    function lineaDeLlamada(marco, clave) {
      const nombre = analisis[clave] && analisis[clave].nombre;
      const a = analisis[marco.clave];
      if (!nombre || !a) return 0;
      const candidatas = [];
      a.llamadas.forEach((ls, k) => { if (ls.some((x) => x.id === nombre)) candidatas.push(k + 1); });
      if (!candidatas.length) return 0;
      return candidatas.find((l) => l >= marco.linea) || candidatas[candidatas.length - 1];
    }

    // Mueve el marco a la línea l y actualiza las vueltas de sus bucles.
    function avanzar(marco, l, trasRetorno) {
      const terminados = [];
      const nuevas = [];
      if (l > 0) {
        const bucles = analisis[marco.clave] ? analisis[marco.clave].bucles : [];
        const previa = marco.ultima;
        const enCuerpo = (b, x) => x >= b.cuerpo[0] && x <= b.cuerpo[1];
        for (const b of bucles) {
          let e = marco.bucles.get(b);
          const dentro = l >= b.inicio && l <= b.fin;
          if (!dentro) {
            if (e) {
              terminados.push({ bucle: b, vueltas: e.vueltas });
              marco.bucles.delete(b);
            }
            continue;
          }
          if (!e) {
            e = { vueltas: 0 };
            marco.bucles.set(b, e);
          }
          // La condición dos veces seguidas: hubo una vuelta cuyo cuerpo no se mostró
          // (por ejemplo, una cubeta vacía en la que no hay nada que hacer).
          if (l === b.condicion && previa === b.condicion && !trasRetorno && b.repetirEsVuelta !== undefined) {
            e.vueltas++;
            continue;
          }
          if (!enCuerpo(b, l)) continue;
          // Al volver de una llamada, la misma línea de la llamada sigue en la misma vuelta.
          const desdeFuera = !e.vueltas || !enCuerpo(b, previa) || (l === previa && b.repetirEsVuelta && !trasRetorno);
          // Un salto hacia atrás cuenta para este bucle salvo que lo explique
          // un bucle de adentro (que contiene las dos líneas).
          const haciaAtras = l < previa && !bucles.some((o) => o !== b && o.nivel > b.nivel
            && o.inicio >= b.inicio && o.fin <= b.fin
            && l >= o.inicio && l <= o.fin && previa >= o.inicio && previa <= o.fin);
          if (desdeFuera || haciaAtras) {
            e.vueltas++;
            nuevas.push(b);
          }
        }
        marco.ultima = l;
      }
      marco.linea = l;
      return { terminados, nuevas };
    }

    function anotarRastro(lista) {
      let pila = [];
      for (const p of lista) {
        let evento = null;
        const tope = pila[pila.length - 1];
        const nivel = p.estado && p.estado.vis && p.estado.vis.nivel;
        // Llamadas seguidas de la misma función en el tope de la pila (la recursión).
        const mismas = () => {
          let k = 0;
          while (k < pila.length && pila[pila.length - 1 - k].clave === p.clave && !pila[pila.length - 1 - k].lambda) k++;
          return k;
        };
        if (!tope) {
          pila = [nuevoMarco(p.clave)];
        } else if (tope.clave === p.clave && nivel && !tope.lambda) {
          // El tema dio la profundidad de la recursión.
          const k = mismas();
          if (nivel > k) {
            evento = { tipo: "llamada" };
            for (let i = k; i < nivel; i++) pila.push(nuevoMarco(p.clave));
          } else if (nivel < k) {
            evento = { tipo: "retorno", de: nombreDe(p.clave) };
            pila.length -= k - nivel;
          }
        } else if (tope.clave === p.clave) {
          const a = analisis[p.clave];
          // Fuera del cuerpo de una lambda: la lambda terminó y se vuelve a quien la llamó.
          while (pila.length > 1 && pila[pila.length - 1].lambda && p.linea > 0 && !dentroDeLambda(pila[pila.length - 1].lambda, p.linea)) {
            evento = { tipo: "retorno", de: nombreMarco(pila.pop()) };
          }
          const actualMarco = pila[pila.length - 1];
          const sitio = actualMarco.ultima;
          // Entra al cuerpo de una lambda desde una línea con una llamada: se llamó a la lambda.
          const lambda = a && p.linea > 0 && sitio > 0 && (a.llamadas[sitio - 1] || []).length
            ? a.lambdas.filter((x) => dentroDeLambda(x, p.linea) && !dentroDeLambda(x, sitio)
              && (!actualMarco.lambda || (x.inicio >= actualMarco.lambda.inicio && x.fin <= actualMarco.lambda.fin)))
              .sort((x, y) => y.inicio - x.inicio)[0]
            : null;
          const llamaASiMisma = a && a.nombre && sitio > 0 && (a.llamadas[sitio - 1] || []).some((x) => x.id === a.nombre && !x.metodo);
          const deUnBucle = a && a.bucles.some((b) => p.linea >= b.inicio && p.linea <= b.fin && sitio >= b.inicio && sitio <= b.fin);
          if (evento) {
            // Ya volvió de una lambda.
          } else if (lambda) {
            if (actualMarco.linea !== sitio) avanzar(actualMarco, sitio);
            evento = { tipo: "llamada" };
            // Una lambda sin nombre propio toma el de la variable con que se la llama (sumarBase(x)).
            const llamada = lambda.nombre ? null : a.llamadas[sitio - 1].find((x) => !x.metodo && !ORIGENES[x.id] && !clavePorNombre[x.id]
              && !a.lambdas.some((o) => o.nombre === x.id));
            pila.push(nuevoMarco(p.clave, llamada ? { ...lambda, nombre: llamada.id } : lambda));
          } else if (llamaASiMisma && p.linea > 0 && p.linea < sitio && !deUnBucle && !actualMarco.lambda) {
            // Recursión: desde la línea que se llama a sí misma, la ejecución
            // vuelve al principio de la función, en una llamada nueva.
            evento = { tipo: "llamada" };
            pila.push(nuevoMarco(p.clave));
          } else {
            // Después de la línea de la llamada recursiva sigue la llamada de
            // afuera: las de adentro ya terminaron.
            const antes = pila.length;
            while (pila.length > 1 && !pila[pila.length - 1].lambda && pila[pila.length - 2].clave === p.clave
              && !pila[pila.length - 2].lambda && p.linea > pila[pila.length - 2].linea) pila.pop();
            if (pila.length < antes) evento = { tipo: "retorno", de: nombreDe(p.clave) };
          }
        } else {
          const k = pila.map((m) => m.clave).lastIndexOf(p.clave);
          if (k >= 0) {
            evento = { tipo: "retorno", de: nombreMarco(tope) };
            pila = pila.slice(0, k + 1);
          } else {
            const sitio = lineaDeLlamada(tope, p.clave);
            if (sitio) {
              if (tope.linea !== sitio) avanzar(tope, sitio);
              evento = { tipo: "llamada" };
              pila.push(nuevoMarco(p.clave));
            } else {
              pila = [nuevoMarco(p.clave)];
            }
          }
        }
        const marco = pila[pila.length - 1];
        const antes = new Map([...marco.bucles].map(([b, e]) => [b, e.vueltas]));
        const { terminados, nuevas } = avanzar(marco, p.linea, evento && evento.tipo === "retorno");
        // El tema puede dar las vueltas exactas (s.vis.vueltas = { línea del bucle: número })
        // cuando sus pasos no muestran cada vuelta.
        const dadas = p.estado && p.estado.vis && p.estado.vis.vueltas;
        if (dadas) {
          for (const [b, e] of marco.bucles) {
            const n = dadas[b.cabecera];
            if (n == null) continue;
            e.vueltas = n;
            const k = nuevas.indexOf(b);
            if (n > (antes.get(b) || 0)) { if (k < 0) nuevas.push(b); } else if (k >= 0) nuevas.splice(k, 1);
          }
        }
        // Dentro de una lambda se ven también los bucles de la función que la llamó (es el mismo código).
        const bucles = [...marco.bucles].map(([b, e]) => ({ bucle: b, vueltas: e.vueltas, nueva: nuevas.includes(b) }));
        for (let k = pila.length - 1; k > 0 && pila[k].lambda && pila[k - 1].clave === marco.clave; k--) {
          for (const [b, e] of pila[k - 1].bucles) bucles.push({ bucle: b, vueltas: e.vueltas, nueva: false });
        }
        p.rastro = {
          pila: pila.map((m) => ({ clave: m.clave, linea: m.linea, nombre: nombreMarco(m), lambda: !!m.lambda })),
          bucles,
          terminados,
          evento,
        };
      }
    }

    function ejecutar(op) {
      detener();
      const { args, error } = leerArgumentos(op);
      if (error) {
        pasos = [pasoInicial(error)];
        pasos[0].tipo = "error";
        ir(0);
        return;
      }
      const s = clonar(estado);
      s.vis = {};
      const lista = [];
      const paso = (clave, linea, texto, tipo) => {
        lista.push({ estado: clonar(s), clave, linea, mensaje: texto, tipo: tipo || "" });
      };
      op.ejecutar(s, args, paso);
      s.vis = {};
      estado = s;
      anotarRastro(lista);
      pasos = lista.length ? lista : [pasoInicial("Listo.")];
      aleatoriosPendientes = (op.usa || []).filter((id) => campos[id].cfg.aleatorio);
      reservarEspacio();
      ir(0);
      if (pasos.length > 1 && modo === "auto") reproducir();
    }

    function reiniciar() {
      detener();
      aleatoriosPendientes = [];
      liberarAlturas();
      const valores = valoresEntradas();
      estado = cfg.estadoInicial(valores);
      actualizarEtiquetas(valores);
      const texto = typeof cfg.mensajeInicial === "function" ? cfg.mensajeInicial(valores) : cfg.mensajeInicial;
      pasos = [pasoInicial(texto || "Elige una operación para empezar.")];
      reservarEspacio();
      ir(0);
    }

    const tituloDe = (clave) => (cfg.tituloCodigo ? cfg.tituloCodigo(clave) : clave);

    function insignia(clase, texto, titulo) {
      return el("span", { class: `insignia ${clase}`, title: titulo || null, "aria-hidden": "true", text: texto });
    }

    function mostrarCodigo(p, animar) {
      const { clave, linea } = p;
      const r = p.rastro;
      if (clave !== claveMostrada) {
        claveMostrada = clave;
        preCodigo.innerHTML = resaltarCpp(fragmentos[clave]);
        preCodigo.append(el("div", { class: "cursor-linea", "aria-hidden": "true" }));
        preCodigo.scrollTop = 0;
      }
      // Al entrar a una función o volver de ella, el código se desliza.
      preCodigo.classList.remove("entra-llamada", "vuelve-llamada");
      if (animar && r && r.evento) {
        void preCodigo.offsetWidth;
        preCodigo.classList.add(r.evento.tipo === "llamada" ? "entra-llamada" : "vuelve-llamada");
      }
      const lineas = preCodigo.querySelectorAll(":scope > .linea");
      for (let k = 0; k < lineas.length; k++) lineas[k].classList.toggle("actual", k === linea - 1);
      const marcada = lineas[linea - 1];

      // Título: la cadena de llamadas (quién llamó a quién) y la función actual.
      const pila = r ? r.pila : [];
      // Las llamadas recursivas seguidas se agrupan: maxHeapify() ×3.
      const grupos = [];
      for (const m of pila) {
        const g = grupos[grupos.length - 1];
        if (g && g.nombre === m.nombre && !m.lambda) g.veces++;
        else grupos.push({ nombre: m.nombre, lambda: m.lambda, veces: 1 });
      }
      const ultimoGrupo = grupos.pop() || { veces: 1 };
      const conVeces = (texto, g) => texto + (g.veces > 1 ? ` ×${g.veces}` : "");
      nombreCodigo.replaceChildren(
        ...grupos.flatMap((g) => [
          el("span", { class: "miga-llamada", text: conVeces(g.nombre === "lambda" ? "lambda" : `${g.nombre}()`, g) }),
          el("span", { class: "miga-separador", text: "›" })]),
        el("span", { class: "miga-actual", text: ultimoGrupo.lambda ? (ultimoGrupo.nombre === "lambda" ? "lambda" : `${ultimoGrupo.nombre} (lambda)`) : conVeces(tituloDe(clave), ultimoGrupo) }));
      nombreCodigo.title = pila.length > 1 ? `${pila.map((m) => m.nombre).join(" llama a ")}` : "";

      // Cinta "llamada desde": la línea del que llamó, con su código. Justo
      // después de un retorno, en cambio, dice de qué función se volvió.
      const llamador = pila.length > 1 ? pila[pila.length - 2] : null;
      const retorno = r && r.evento && r.evento.tipo === "retorno" ? r.evento : null;
      procedencia.hidden = !llamador && !retorno;
      procedencia.classList.toggle("retorno", !!retorno);
      if (retorno) {
        procedencia.replaceChildren(
          el("span", { class: "llamada-desde-quien" }, "↩ volvió de ", el("b", { text: comoLlamada(retorno.de) }),
            `: sigue en ${comoLlamada(pila.length ? pila[pila.length - 1].nombre : nombreDe(clave))}${linea > 0 ? `, línea ${linea}` : ""}`));
        procedencia.classList.toggle("recien", !!animar);
      } else if (llamador) {
        const texto = (fragmentos[llamador.clave].split("\n")[llamador.linea - 1] || "").trim();
        procedencia.replaceChildren(
          el("span", { class: "llamada-desde-quien" }, "↳ llamada desde ", el("b", { text: comoLlamada(llamador.nombre) }),
            llamador.nombre === pila[pila.length - 1].nombre ? " (ella misma)" : "", `, línea ${llamador.linea}:`),
          el("code", { html: resaltarCpp(texto).replace(/<\/?span class="linea">/g, "") }));
        procedencia.classList.toggle("recien", !!(animar && r.evento && r.evento.tipo === "llamada"));
      }

      // Indicaciones sobre las líneas: bucles, llamadas y de dónde viene cada función.
      for (const viejo of preCodigo.querySelectorAll(".insignia, .corchete-bucle")) viejo.remove();
      filaPlegada.replaceChildren();
      const plegada = (nodo) => filaPlegada.append(nodo);
      const pegar = (n, nodo) => {
        if (!lineas[n - 1]) return;
        lineas[n - 1].append(nodo);
        if (n === linea) plegada(nodo.cloneNode(true));
      };
      const plural = (k) => `${k} ${k === 1 ? "vuelta" : "vueltas"}`;
      if (r && linea > 0) {
        for (const { bucle: b, vueltas, nueva } of r.bucles) {
          const enCondicion = linea === b.condicion;
          const texto = enCondicion ? (vueltas ? `↻ ${plural(vueltas)} · ¿otra?` : "↻ ¿entra al bucle?") : `↻ vuelta ${vueltas}`;
          const ayuda = enCondicion ? "Se evalúa la condición del bucle" : `La ejecución va en la vuelta ${vueltas} del bucle ${b.tipo}`;
          const clase = `bucle${nueva && animar && vueltas > 1 ? " nueva" : ""}`;
          pegar(b.condicion, insignia(clase, texto, ayuda));
          // En móvil solo se ve la línea actual: la vuelta va también en su fila.
          if (!enCondicion) plegada(insignia(clase, `↻ ${b.tipo}: vuelta ${vueltas}`, ayuda));
          const arriba = lineas[b.inicio - 1];
          const abajo = lineas[b.fin - 1];
          if (arriba && abajo) {
            preCodigo.append(el("div", {
              class: `corchete-bucle${nueva && animar && vueltas > 1 ? " vuelve" : ""}`,
              "aria-hidden": "true",
              style: `top:${arriba.offsetTop}px;height:${abajo.offsetTop + abajo.offsetHeight - arriba.offsetTop}px;--nivel:${b.nivel}`,
            }));
          }
        }
        for (const { bucle: b, vueltas } of r.terminados) {
          const nodo = insignia("bucle termino", `✓ salió tras ${plural(vueltas)}`, "El bucle ya terminó");
          if (b.condicion !== linea) plegada(insignia("bucle termino", `✓ ${b.tipo}: salió tras ${plural(vueltas)}`));
          pegar(b.condicion, nodo);
        }
        const ls = (analisis[clave] && analisis[clave].llamadas[linea - 1]) || [];
        if (!retorno) {
          const nombrePropio = analisis[clave] && analisis[clave].nombre;
          const siguiente = pasos[actual + 1];
          const entra = siguiente && siguiente.rastro && siguiente.rastro.evento && siguiente.rastro.evento.tipo === "llamada";
          for (const { id, metodo } of ls) {
            if (metodo) continue;
            if (id === nombrePropio) {
              pegar(linea, insignia("llamada", "↻ se llama a sí misma", "Llamada recursiva: la función se llama a sí misma con otros argumentos"));
              break;
            }
            if (clavePorNombre[id]) {
              pegar(linea, insignia(`llamada${entra ? " entra" : ""}`, `→ llama a ${id}()`, "Otra función de este tema"));
              break;
            }
            if (analisis[clave].lambdas.some((x) => x.nombre === id)) {
              pegar(linea, insignia(`llamada${entra ? " entra" : ""}`, `→ llama a la lambda ${id}`, "El cuerpo de la lambda corre ahora, con los valores de esta llamada"));
              break;
            }
          }
        }
        const deBiblioteca = ls.find((x) => !x.metodo && ORIGENES[x.id]);
        if (deBiblioteca) {
          pegar(linea, insignia("origen", `${deBiblioteca.id} ← #include ${ORIGENES[deBiblioteca.id]}`, `std::${deBiblioteca.id} es de la biblioteca estándar de C++`));
        }
      }

      // El resaltado se desliza hasta la línea actual.
      const cursor = preCodigo.querySelector(".cursor-linea");
      if (cursor) {
        cursor.hidden = !marcada;
        if (marcada) {
          if (!animar) cursor.style.transition = "none";
          cursor.style.top = `${marcada.offsetTop}px`;
          cursor.style.height = `${marcada.offsetHeight}px`;
          if (!animar) { void cursor.offsetWidth; cursor.style.transition = ""; }
        }
      }

      // Si el código no cabe en su panel, la línea actual se mantiene a la vista.
      if (marcada && preCodigo.scrollHeight > preCodigo.clientHeight) {
        const arriba = marcada.offsetTop;
        const margen = marcada.offsetHeight * 2;
        if (arriba - margen < preCodigo.scrollTop) preCodigo.scrollTop = arriba - margen;
        else if (arriba + marcada.offsetHeight + margen > preCodigo.scrollTop + preCodigo.clientHeight) {
          preCodigo.scrollTop = arriba + marcada.offsetHeight + margen - preCodigo.clientHeight;
        }
      }
    }

    function ir(indice) {
      const anterior = actual;
      actual = Math.max(0, Math.min(pasos.length - 1, indice));
      const p = pasos[actual];
      if (!cfg.incremental) escenario.innerHTML = "";
      cfg.dibujar(escenario, p.estado);
      // Las indicaciones se animan solo al avanzar de a un paso.
      mostrarCodigo(p, actual === anterior + 1);
      mensaje.textContent = p.mensaje;
      mensaje.className = "mensaje" + (p.tipo ? ` ${p.tipo}` : "");
      contador.textContent = `Paso ${actual + 1} de ${pasos.length}`;
      bInicio.disabled = bAtras.disabled = actual === 0;
      bFin.disabled = bAdelante.disabled = actual === pasos.length - 1;
      if (actual === pasos.length - 1) {
        detener();
        for (const id of aleatoriosPendientes) campos[id].input.value = aleatorio(campos[id].cfg);
        aleatoriosPendientes = [];
      }
      bPlay.textContent = temporizador ? "❚❚" : "▶";
      bPlay.disabled = pasos.length < 2;
      noEncoger(mensaje);
      ajustarEscala();
      centrar();
    }

    function reproducir() {
      if (actual >= pasos.length - 1) ir(0);
      temporizador = setInterval(() => ir(actual + 1), 1300 / VELOCIDADES[velocidad]);
      bPlay.textContent = "❚❚";
    }

    function detener() {
      clearInterval(temporizador);
      temporizador = null;
      bPlay.textContent = "▶";
    }

    function alternar() {
      if (temporizador) detener();
      else reproducir();
    }

    reiniciar();
  }
  DS.tema = tema;

  // ------------------------------------------------------------------
  // Piezas de dibujo reutilizables
  // ------------------------------------------------------------------

  // Muestra variables como "tope = 2" y resalta las que acaban de cambiar.
  DS.variables = function (pares, cambiadas) {
    return el("div", { class: "variables" },
      Object.entries(pares).map(([k, v]) =>
        el("span", { class: (cambiadas || []).includes(k) ? "cambio" : "" }, `${k} = `, el("b", { text: String(v) }))));
  };

  montarEncabezado();
  montarPortada();
  montarNavegacionTemas();
  montarLeccion();
  montarPreguntas();
  montarCodigoCompleto();
})();
