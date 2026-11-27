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

  // ------------------------------------------------------------------
  // Idioma
  // ------------------------------------------------------------------
  //
  // El sitio está en español (en la raíz) y en inglés (bajo en/). Cada página
  // dice su idioma en <html lang>. DS.tr(es, en) devuelve el valor del idioma
  // de la página: un texto, un objeto o un fragmento de código. Si falta el
  // inglés, usa el español.
  const idioma = /^en\b/i.test(document.documentElement.lang || "") ? "en" : "es";
  const otroIdioma = idioma === "en" ? "es" : "en";
  DS.idioma = idioma;
  DS.tr = (es, en) => (idioma === "en" && en !== undefined ? en : es);
  const tr = DS.tr;

  // Lista única de temas: alimenta el menú, la portada y los enlaces
  // anterior/siguiente. Agrega aquí cada tema nuevo.
  // en: título, resumen y etiquetas en inglés. Cuando el tema ya tiene su
  // página en inglés (en/temas/<slug>/), en.archivo es su .cpp en inglés
  // (ejemplos/cpp/en/); sin en.archivo, la versión en inglés enlaza a la de
  // español.
  DS.TEMAS = [
    {
      slug: "notacion-algoritmica",
      titulo: "Notación algorítmica (Big-O)",
      resumen: "El idioma para comparar algoritmos: cómo crecen los pasos con n. O(1), O(log n), O(n), O(n log n), O(n²) y O(2ⁿ), con gráficas.",
      etiquetas: ["empieza aquí", "O(1) a O(2ⁿ)"],
      archivo: "notacion_algoritmica.cpp",
      en: {
        titulo: "Algorithmic notation (Big-O)",
        resumen: "The language for comparing algorithms: how the number of steps grows with n. O(1), O(log n), O(n), O(n log n), O(n²) and O(2ⁿ), with charts.",
        etiquetas: ["start here", "O(1) to O(2ⁿ)"],
        archivo: "algorithmic_notation.cpp",
      },
    },
    {
      slug: "recursion",
      titulo: "Recursión",
      resumen: "Una función que se llama a sí misma con un problema más chico. Sacar dígitos, cambio de base, palíndromos, potencia rápida y el árbol de llamadas de Fibonacci, con la pila a la vista.",
      etiquetas: ["caso base", "pila de llamadas"],
      archivo: "recursion.cpp",
      en: {
        titulo: "Recursion",
        resumen: "A function that calls itself with a smaller problem. Extracting digits, base conversion, palindromes, fast power and the Fibonacci call tree, with the call stack in view.",
        etiquetas: ["base case", "call stack"],
        archivo: "recursion.cpp",
      },
    },
    {
      slug: "lambdas",
      titulo: "Lambdas en C++",
      resumen: "Funciones sin nombre que se escriben donde se usan: capturas por valor y por referencia, lambdas anidadas y cómo le dan un criterio a std::sort o std::count_if.",
      etiquetas: ["herramienta de C++", "capturas [=] [&]"],
      archivo: "lambdas.cpp",
      en: {
        titulo: "Lambdas in C++",
        resumen: "Unnamed functions written where they are used: captures by value and by reference, nested lambdas, and how they give std::sort or std::count_if a criterion.",
        etiquetas: ["C++ tool", "captures [=] [&]"],
        archivo: "lambdas.cpp",
      },
    },
    {
      slug: "vector-dinamico",
      titulo: "Vector dinámico",
      resumen: "Un arreglo que crece solo. Acceso por índice en O(1) y cómo se duplica la capacidad.",
      etiquetas: ["acceso O(1)", "insertar O(n)"],
      archivo: "vector_dinamico.cpp",
      en: {
        titulo: "Dynamic array",
        resumen: "An array that grows on its own. O(1) access by index and how the capacity doubles.",
        etiquetas: ["O(1) access", "O(n) insert"],
        archivo: "dynamic_array.cpp",
      },
    },
    {
      slug: "lista-enlazada",
      titulo: "Lista enlazada",
      resumen: "Nodos conectados con punteros. Insertar al inicio es instantáneo; buscar requiere recorrer.",
      etiquetas: ["inicio O(1)", "buscar O(n)"],
      archivo: "lista_enlazada.cpp",
      en: {
        titulo: "Linked list",
        resumen: "Nodes connected by pointers. Inserting at the front is instant; searching requires a traversal.",
        etiquetas: ["O(1) front", "O(n) search"],
        archivo: "linked_list.cpp",
      },
    },
    {
      slug: "lista-doble",
      titulo: "Lista doblemente enlazada",
      resumen: "Cada nodo apunta al siguiente y al anterior, y la lista guarda cabeza y cola: insertar y eliminar en los dos extremos es O(1). La idea de std::list.",
      etiquetas: ["extremos O(1)", "anterior y siguiente"],
      archivo: "lista_doble.cpp",
      en: {
        titulo: "Doubly linked list",
        resumen: "Each node points to the next and the previous one, and the list keeps a head and a tail: inserting and removing at both ends is O(1). The idea behind std::list.",
        etiquetas: ["O(1) ends", "prev and next"],
        archivo: "doubly_linked_list.cpp",
      },
    },
    {
      slug: "lista-circular",
      titulo: "Lista circular",
      resumen: "El último nodo apunta al primero: con un solo puntero se llega a los dos extremos. Insertar, rotar y repartir turnos (round-robin) en O(1).",
      etiquetas: ["rotar O(1)", "round-robin"],
      archivo: "lista_circular.cpp",
      en: {
        titulo: "Circular list",
        resumen: "The last node points to the first: a single pointer reaches both ends. Insert, rotate and hand out turns (round-robin) in O(1).",
        etiquetas: ["O(1) rotate", "round-robin"],
        archivo: "circular_list.cpp",
      },
    },
    {
      slug: "pila",
      titulo: "Pila (stack)",
      resumen: "El último que entra es el primero que sale (LIFO). std::stack y una pila hecha con nodos; paréntesis balanceados.",
      etiquetas: ["LIFO", "push/pop O(1)"],
      archivo: "pila.cpp",
      en: {
        titulo: "Stack",
        resumen: "The last one in is the first one out (LIFO). std::stack and a stack built from nodes; balanced parentheses.",
        etiquetas: ["LIFO", "O(1) push/pop"],
        archivo: "stack.cpp",
      },
    },
    {
      slug: "cola",
      titulo: "Cola (queue)",
      resumen: "El primero que entra es el primero que sale (FIFO). std::queue y una cola hecha con nodos y dos punteros.",
      etiquetas: ["FIFO", "push/pop O(1)"],
      archivo: "cola.cpp",
      en: {
        titulo: "Queue",
        resumen: "The first one in is the first one out (FIFO). std::queue and a queue built from nodes and two pointers.",
        etiquetas: ["FIFO", "O(1) push/pop"],
        archivo: "queue.cpp",
      },
    },
    {
      slug: "ordenamiento-elemental",
      titulo: "Ordenamientos elementales",
      resumen: "Exchange, bubble, selection, insertion y shell sort: comparar pares y moverlos. Cuánto trabaja cada uno, cuál es estable y cuándo conviene.",
      etiquetas: ["O(n²)", "estabilidad"],
      archivo: "ordenamiento_elemental.cpp",
      en: {
        titulo: "Elementary sorting",
        resumen: "Exchange, bubble, selection, insertion and shell sort: compare pairs and move them. How much work each one does, which ones are stable and when to use them.",
        etiquetas: ["O(n²)", "stability"],
        archivo: "elementary_sorting.cpp",
      },
    },
    {
      slug: "merge-sort-quicksort",
      titulo: "Merge sort y quicksort",
      resumen: "Divide y vencerás: mezclar mitades ordenadas o particionar alrededor de un pivote. O(n log n), el peor caso de quicksort, el pivote al azar y quickselect.",
      etiquetas: ["O(n log n)", "recursión"],
      archivo: "merge_sort_quicksort.cpp",
      en: {
        titulo: "Merge sort and quicksort",
        resumen: "Divide and conquer: merge sorted halves or partition around a pivot. O(n log n), quicksort's worst case, the random pivot and quickselect.",
        etiquetas: ["O(n log n)", "recursion"],
        archivo: "merge_sort_quicksort.cpp",
      },
    },
    {
      slug: "ordenamiento-sin-comparaciones",
      titulo: "Ordenamientos sin comparaciones",
      resumen: "Counting, radix y bucket sort: usar el valor como índice en lugar de compararlo. O(n + k), dígito por dígito, cubetas, y cuándo le ganan a O(n log n).",
      etiquetas: ["O(n + k)", "sin comparar"],
      archivo: "ordenamiento_sin_comparaciones.cpp",
      en: {
        titulo: "Non-comparison sorting",
        resumen: "Counting, radix and bucket sort: use the value as an index instead of comparing it. O(n + k), digit by digit, buckets, and when they beat O(n log n).",
        etiquetas: ["O(n + k)", "no comparisons"],
        archivo: "non_comparison_sorting.cpp",
      },
    },
    {
      slug: "monticulo",
      titulo: "Montículo (heap)",
      resumen: "Min-heap y max-heap: un árbol guardado en un arreglo con el mínimo (o el máximo) siempre en la raíz. Incluye heapsort.",
      etiquetas: ["insertar O(log n)", "heapsort O(n log n)"],
      archivo: "monticulo.cpp",
      en: {
        titulo: "Heap",
        resumen: "Min-heap and max-heap: a tree stored in an array with the minimum (or the maximum) always at the root. Includes heapsort.",
        etiquetas: ["O(log n) insert", "O(n log n) heapsort"],
        archivo: "heap.cpp",
      },
    },
    {
      slug: "tabla-hash",
      titulo: "Tabla hash",
      resumen: "Una función hash lleva cada clave directo a su cubeta. Funciones hash, colisiones con encadenamiento y con sondeo, y rehash.",
      etiquetas: ["buscar O(1) promedio", "colisiones"],
      archivo: "tabla_hash.cpp",
      en: {
        titulo: "Hash table",
        resumen: "A hash function takes each key straight to its bucket. Hash functions, collisions with chaining and with probing, and rehashing.",
        etiquetas: ["O(1) average search", "collisions"],
        archivo: "hash_table.cpp",
      },
    },
    {
      slug: "busqueda-binaria",
      titulo: "Búsqueda binaria",
      resumen: "En un arreglo ordenado, mirar el del medio descarta la mitad de golpe. Versión iterativa y recursiva, el medio que se desborda, lower_bound y upper_bound con repetidos, y buscar la respuesta sin arreglo.",
      etiquetas: ["buscar O(log n)", "requiere orden"],
      archivo: "busqueda_binaria.cpp",
      en: {
        titulo: "Binary search",
        resumen: "In a sorted array, looking at the middle discards half at once. Iterative and recursive versions, the overflowing midpoint, lower_bound and upper_bound with duplicates, and searching for the answer without an array.",
        etiquetas: ["O(log n) search", "needs order"],
      },
    },
    {
      slug: "arbol-binario-busqueda",
      titulo: "Árbol binario de búsqueda",
      resumen: "Menores a la izquierda, mayores a la derecha. Buscar, insertar, recorridos y eliminar en sus tres casos; la idea detrás de std::set.",
      etiquetas: ["buscar O(h)", "inorden ordenado"],
      archivo: "arbol_binario_busqueda.cpp",
      en: {
        titulo: "Binary search tree",
        resumen: "Smaller to the left, larger to the right. Search, insert, traversals and remove in its three cases; the idea behind std::set.",
        etiquetas: ["O(h) search", "sorted inorder"],
      },
    },
    {
      slug: "arbol-avl",
      titulo: "Árbol AVL",
      resumen: "Un árbol binario de búsqueda que se rebalancea solo: altura y factor de balance en cada nodo, rotaciones simples y dobles, e insertar y eliminar en O(log n) aunque los datos lleguen ordenados.",
      etiquetas: ["rotaciones O(1)", "altura O(log n)"],
      archivo: "arbol_avl.cpp",
      en: {
        titulo: "AVL tree",
        resumen: "A binary search tree that rebalances itself: height and balance factor in every node, single and double rotations, and O(log n) insert and remove even when the data arrives sorted.",
        etiquetas: ["O(1) rotations", "O(log n) height"],
      },
    },
    {
      slug: "representacion-grafos",
      titulo: "Representación de grafos",
      resumen: "Cómo se guarda un grafo: matriz de adyacencia (¿hay arista? en O(1), pero V² casillas) y lista de adyacencia (solo los vecinos, O(V + E)). Las mismas operaciones en las dos, y grafos dirigidos.",
      etiquetas: ["matriz y lista", "V² contra V + E"],
      archivo: "representacion_grafos.cpp",
      en: {
        titulo: "Graph representation",
        resumen: "How a graph is stored: adjacency matrix (is there an edge? in O(1), but V² cells) and adjacency list (only the neighbors, O(V + E)). The same operations on both, and directed graphs.",
        etiquetas: ["matrix and list", "V² vs V + E"],
      },
    },
    {
      slug: "grafos",
      titulo: "Grafos",
      resumen: "Vértices y aristas guardados en una lista de adyacencia. Recorrer por capas con BFS y una cola, al fondo con DFS y una pila o con recursión, distancias y componentes conexas.",
      etiquetas: ["BFS y DFS", "O(V + E)"],
      archivo: "grafos.cpp",
      en: {
        titulo: "Graphs",
        resumen: "Vertices and edges stored in an adjacency list. Traverse by layers with BFS and a queue, deep with DFS and a stack or with recursion, distances and connected components.",
        etiquetas: ["BFS and DFS", "O(V + E)"],
      },
    },
  ];

  // data-raiz es la raíz del sitio: assets/ y ejemplos/ sirven a los dos idiomas.
  const raiz = document.body.dataset.raiz || "./";
  const temaActual = document.body.dataset.tema || "";

  const tieneIngles = (t) => !!(t.en && t.en.archivo);
  // El tema con su título, resumen y etiquetas en el idioma de la página.
  const enIdioma = (t) => (idioma === "en" && t.en ? Object.assign({}, t, t.en) : t);
  const inicioDe = (lengua) => (lengua === "en" ? `${raiz}en/` : raiz);
  const inicio = inicioDe(idioma);
  // Página de un tema en el idioma de la página; en inglés, si todavía no
  // está traducido, la de español.
  const sinTraducir = (t) => idioma === "en" && !tieneIngles(t);
  const urlTema = (t) => `${inicioDe(sinTraducir(t) ? "es" : idioma)}temas/${t.slug}/`;
  // Los temas que tienen página en este idioma (para anterior y siguiente).
  const temasDelIdioma = () => DS.TEMAS.filter((t) => !t.proximamente && !sinTraducir(t));
  // Esta misma página en otro idioma, o null si no existe todavía.
  function paginaEn(lengua) {
    if (!temaActual) return inicioDe(lengua);
    const t = DS.TEMAS.find((x) => x.slug === temaActual);
    if (!t || (lengua === "en" && !tieneIngles(t))) return null;
    return `${inicioDe(lengua)}temas/${t.slug}/`;
  }

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

  function leerPreferencia(clave, almacen) {
    try { return (almacen || localStorage).getItem(clave); } catch (e) { return null; }
  }

  function guardarPreferencia(clave, valor, almacen) {
    try { (almacen || localStorage).setItem(clave, valor); } catch (e) { /* sin almacenamiento: no pasa nada */ }
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
    const boton = el("button", { class: "boton-tema", type: "button", "aria-label": tr("Cambiar tema claro/oscuro", "Switch light/dark theme") });
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
  // Selector de idioma
  // ------------------------------------------------------------------
  //
  // Un enlace a esta misma página en el otro idioma, en el mismo paso de la
  // lección. Elegir un idioma lo recuerda: después, cualquier página abre
  // directo en ese idioma si ya está traducida.

  function botonIdioma() {
    const destino = paginaEn(otroIdioma);
    const texto = otroIdioma.toUpperCase();
    if (!destino) {
      return el("span", { class: "boton-idioma no-disponible", "aria-disabled": "true", text: texto,
        title: "Este tema todavía no está en inglés · Not available in English yet" });
    }
    const etiqueta = tr("Read in English", "Leer en español");
    const enlace = el("a", { class: "boton-idioma", href: destino, hreflang: otroIdioma, lang: otroIdioma, title: etiqueta, "aria-label": etiqueta, text: texto });
    // El paso de la lección va en #paso, que cambia sin recargar la página.
    const conPaso = () => { enlace.href = destino + location.hash; };
    for (const evento of ["pointerdown", "focus", "contextmenu"]) enlace.addEventListener(evento, conPaso);
    enlace.addEventListener("click", () => {
      conPaso();
      guardarPreferencia("ds-idioma", otroIdioma);
    });
    return enlace;
  }

  // Quien ya eligió un idioma va directo a esa versión de la página, si existe.
  function irAlIdiomaPreferido() {
    if (leerPreferencia("ds-idioma") !== otroIdioma) return false;
    const destino = paginaEn(otroIdioma);
    if (!destino) return false;
    document.documentElement.style.visibility = "hidden"; // sin destello de la otra versión
    location.replace(destino + location.hash);
    return true;
  }

  // Quien todavía no eligió ve una sugerencia junto al selector si su
  // navegador está en otro idioma (una vez por visita). No se cambia de idioma
  // solo: los buscadores, que no guardan preferencias, ven las dos versiones.
  function sugerirIdioma() {
    const boton = document.querySelector("header.encabezado a.boton-idioma");
    if (!boton || leerPreferencia("ds-idioma")) return;
    if (leerPreferencia("ds-idioma-sugerido", sessionStorage)) return;
    const lenguas = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language];
    const principal = String(lenguas[0] || "").toLowerCase();
    if (!principal || principal.startsWith("es") === (idioma === "es")) return;
    guardarPreferencia("ds-idioma-sugerido", "1", sessionStorage);

    const quedarse = el("button", { class: "sugerencia-cerrar", type: "button", text: "×",
      "aria-label": idioma === "es" ? "No thanks, stay in Spanish" : "No, gracias: seguir en inglés" });
    const cambiar = el("a", { class: "boton principal", href: boton.getAttribute("href"),
      text: idioma === "es" ? "Read in English" : "Leer en español" });
    const burbuja = el("div", { class: "sugerencia-idioma", role: "status", lang: otroIdioma },
      el("span", { text: idioma === "es" ? "This page is also in English." : "Esta página también está en español." }),
      cambiar, quedarse);
    cambiar.addEventListener("click", (ev) => { ev.preventDefault(); boton.click(); });
    quedarse.addEventListener("click", () => {
      guardarPreferencia("ds-idioma", idioma);
      burbuja.remove();
    });
    const fila = boton.parentElement;
    fila.append(burbuja);
    // La flecha de la burbuja apunta al selector.
    const ubicar = () => {
      const derecha = fila.getBoundingClientRect().right - parseFloat(getComputedStyle(fila).paddingRight);
      const b = boton.getBoundingClientRect();
      burbuja.style.setProperty("--flecha", `${Math.max(12, derecha - (b.left + b.width / 2) - 7)}px`);
    };
    ubicar();
    window.addEventListener("resize", ubicar);
  }

  // En inglés, los enlaces del contenido a un tema que todavía no está
  // traducido (../lista-enlazada/) llevan a su versión en español.
  function ajustarEnlacesSinTraducir() {
    if (idioma !== "en") return;
    const base = new URL(`${raiz}en/temas/`, location.href).href;
    for (const a of document.querySelectorAll("main a[href]")) {
      const url = new URL(a.getAttribute("href"), location.href);
      if (!url.href.startsWith(base)) continue;
      const t = DS.TEMAS.find((x) => x.slug === url.href.slice(base.length).split(/[/#?]/)[0]);
      if (!t || tieneIngles(t)) continue;
      a.href = new URL(`${raiz}temas/${t.slug}/${url.hash}`, location.href).href;
      a.hreflang = "es";
      a.title = "In Spanish for now";
    }
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
    const nav = el("nav", { class: "nav", "aria-label": tr("Temas", "Topics") },
      DS.TEMAS.filter((t) => !t.proximamente).map((t) =>
        el("a", {
          href: urlTema(t),
          "aria-current": t.slug === temaActual ? "page" : null,
          hreflang: sinTraducir(t) ? "es" : null,
          title: sinTraducir(t) ? "In Spanish for now" : null,
        }, enIdioma(t).titulo, sinTraducir(t) ? el("span", { class: "solo-espanol", "aria-hidden": "true", text: "ES" }) : null)));
    const menu = el("details", { class: "menu-temas" }, el("summary", { text: tr("Temas", "Topics") }), nav);
    // Se cierra al elegir, al tocar fuera o con Escape.
    document.addEventListener("click", (ev) => { if (menu.open && !menu.contains(ev.target)) menu.open = false; });
    document.addEventListener("keydown", (ev) => {
      if (ev.key === "Escape" && menu.open) {
        menu.open = false;
        menu.querySelector("summary").focus();
      }
    });
    encabezado.append(el("div", { class: "contenedor" },
      el("a", { class: "marca", href: inicio, title: tr("Inicio", "Home") },
        el("span", { class: "marca-icono", "aria-hidden": "true", text: "{ }" }),
        el("span", { class: actual ? "marca-texto con-tema" : "marca-texto", text: tr("Aprende Estructuras de Datos", "Learn Data Structures") })),
      actual ? el("span", { class: "marca-tema", text: enIdioma(actual).titulo }) : null,
      menu,
      botonIdioma(),
      botonTema()));
  }

  function montarPortada() {
    const contenedor = document.getElementById("lista-temas");
    if (!contenedor) return;
    for (const tema of DS.TEMAS) {
      const t = enIdioma(tema);
      const contenido = [
        el("h3", { text: t.titulo }),
        el("p", { text: t.resumen }),
        el("div", { class: "etiquetas" },
          t.etiquetas.map((e) => el("span", { class: "etiqueta", text: e })),
          sinTraducir(tema) ? el("span", { class: "etiqueta solo-espanol", text: "in Spanish for now" }) : null),
      ];
      contenedor.append(t.proximamente
        ? el("div", { class: "tarjeta proximamente" }, contenido)
        : el("a", { class: "tarjeta", href: urlTema(tema), hreflang: sinTraducir(tema) ? "es" : null }, contenido));
    }
  }

  function montarNavegacionTemas() {
    const contenedor = document.getElementById("navegacion-temas");
    if (!contenedor) return;
    const listos = temasDelIdioma();
    const i = listos.findIndex((t) => t.slug === temaActual);
    if (i < 0) return;
    contenedor.className = "navegacion-temas";
    contenedor.append(
      i > 0 ? el("a", { href: urlTema(listos[i - 1]), text: `← ${enIdioma(listos[i - 1]).titulo}` }) : el("span"),
      i < listos.length - 1 ? el("a", { href: urlTema(listos[i + 1]), text: `${enIdioma(listos[i + 1]).titulo} →` }) : el("a", { href: inicio, text: tr("Volver al inicio", "Back to home") }));
  }

  function siguienteTema() {
    const listos = temasDelIdioma();
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
      el("li", {}, el("a", { href: `#${p.id}`, title: `${k + 1}. ${p.dataset.titulo}`, "aria-label": `${tr("Paso", "Step")} ${k + 1}: ${p.dataset.titulo}` })));
    const contador = el("span", { class: "leccion-contador" });
    const cabecera = el("nav", { class: "leccion-cabecera", "aria-label": tr("Pasos de la lección", "Lesson steps") },
      el("ol", { class: "leccion-indice" }, segmentos), contador);

    const bAtras = el("button", { class: "boton", type: "button", text: tr("← Atrás", "← Back"), onclick: () => ir(actual - 1) });
    const destino = el("span", { class: "leccion-destino" });
    const bContinuar = el("button", { class: "boton principal", type: "button", onclick: () => ir(actual + 1) }, tr("Continuar", "Continue"), destino, " →");
    const proximo = siguienteTema();
    const enlaceFinal = el("a", {
      class: "boton principal",
      href: proximo ? urlTema(proximo) : inicio,
      text: proximo ? `${tr("Siguiente tema", "Next topic")}: ${enIdioma(proximo).titulo} →` : tr("Volver al inicio", "Back to home"),
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
          respuesta.textContent = `${correcta ? tr("¡Exacto! ", "Exactly! ") : tr("Todavía no. ", "Not quite. ")}${opcion.dataset.explicacion || ""}`;
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
      const pre = el("pre", { class: "codigo", tabindex: "0" }, el("span", { class: "linea", text: tr("// Cargando…", "// Loading…") }));
      const copiar = el("button", { class: "boton", type: "button", text: tr("Copiar", "Copy") });
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
              copiar.textContent = tr("¡Copiado!", "Copied!");
              setTimeout(() => { copiar.textContent = tr("Copiar", "Copy"); }, 1500);
            });
          });
        })
        .catch(() => {
          pre.innerHTML = "";
          pre.append(el("span", { class: "linea", text: tr("// No se pudo cargar el archivo aquí.", "// The file could not be loaded here.") }),
            el("span", { class: "linea", text: `${tr("// Míralo en GitHub", "// See it on GitHub")}: ${enGithub}` }));
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
  //                                                   // (min y max se ven en una muesca bajo la caja,
  //                                                   // y la caja se pone roja apenas se pasan)
  //                  [{ id, etiqueta, opciones: [[valor, texto]] }]   // lista; al cambiarla se reinicia
  //                  [{ ..., opciones, reinicia: false }]             // lista que no reinicia (solo es un argumento)
  //                  [{ ..., alCambiar(estado, valores) }]            // número o lista que se refleja apenas
  //                                                   // cambia, sin reiniciar todo: devuelve
  //                                                   // { estado, mensaje, codigo } (todo opcional;
  //                                                   // codigo = clave del fragmento que se muestra).
  //                                                   // Toda entrada debería reflejarse al instante en
  //                                                   // el dibujo o en el código: si no cambia el estado
  //                                                   // (un argumento), que muestre el fragmento que
  //                                                   // va a correr.
  //   operaciones:   [{ id, etiqueta, usa: ["valor"], codigo: "clave", secundaria, llamada, ejecutar(s, args, paso) }]
  //                  Con varias operaciones, un selector elige cuál corre el botón Ejecutar; el botón
  //                  muestra la llamada con los valores de las entradas: en la etiqueta, cada
  //                  parámetro con el nombre de una entrada (su id o su etiqueta) se cambia por su valor.
  //                  llamada: (textos) => "rotarDerecha(nodo 30)" si los nombres no coinciden
  //                  secundaria: true -> botón normal que se ejecuta al pulsarlo (para acciones que no
  //                  son una función del C++, como "Nuevo ejemplo")
  //                  etiqueta puede ser (valores) => texto si depende de una lista
  //   dibujar(escenario, estado)                      // pinta un estado en el escenario
  //                                                   // una fila con data-alto-estable (variables, pila de
  //                                                   // llamadas…) reserva su alto más grande de la operación
  //   incremental:   true                             // opcional: no vaciar el escenario entre pasos
  //                                                   // (para animar movimientos con transiciones CSS)
  //   mensajeInicial                                  // texto o (valores) => texto
  //   codigoInicial                                   // opcional: clave del fragmento que se ve al
  //                                                   // empezar (texto o (valores) => clave)
  //   variantes:     { nombre: { archivo: "otro.cpp", codigo: { clave: "fragmento" } } }
  //                                                   // opcional: otra versión de algunos fragmentos,
  //                                                   // para un interruptor de toda la lección (como la
  //                                                   // convención del factor de balance en el AVL).
  //                                                   // verificar-fragmentos.mjs compara cada una con
  //                                                   // su archivo .cpp.
  //   variante:      "nombre"                         // opcional: la variante que se usa al empezar
  // }
  //
  // DS.tema devuelve { usarVariante(nombre) }: cambia los fragmentos por los
  // de esa variante (null = los de codigo) y reinicia el visualizador.
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

    let fragmentos = {};
    // Nombre, bucles y llamadas de cada fragmento (para las indicaciones del código).
    let analisis = {};
    let clavePorNombre = {};
    function prepararCodigo(variante) {
      const codigo = Object.assign({}, cfg.codigo, variante ? cfg.variantes[variante].codigo : {});
      fragmentos = {};
      analisis = {};
      clavePorNombre = {};
      for (const [clave, texto] of Object.entries(codigo)) {
        fragmentos[clave] = dedent(texto);
        analisis[clave] = analizarFragmento(fragmentos[clave]);
        const n = analisis[clave].nombre;
        if (n && !(n in clavePorNombre)) clavePorNombre[n] = clave;
      }
    }
    prepararCodigo(cfg.variante && cfg.variantes && cfg.variantes[cfg.variante] ? cfg.variante : null);
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
    // La operación cuyos pasos se ven (null en el estado inicial) y el
    // temporizador que termina rápido sus pasos pendientes antes de otra.
    let opMostrada = null;
    let llamadaMostrada = "";
    let avance = null;

    // --- Construcción de la interfaz ---
    const campos = {};
    const controles = el("div", { class: "controles" });
    // Las operaciones que son funciones del C++ no se ejecutan al elegirlas:
    // con varias, un selector elige cuál y el botón Ejecutar la corre. Ese
    // botón muestra la llamada con los valores de las entradas (insertarEn(2, 9)),
    // así se sabe qué va a correr antes de pulsarlo. Las secundarias (acciones
    // que no son una función, como "Nuevo ejemplo") se ejecutan al pulsarlas.
    const principales = cfg.operaciones.filter((op) => !op.secundaria);
    let opElegida = principales[0] || null;
    const chipsOps = principales.length > 1
      ? principales.map((op) => el("button", { type: "button", "data-op": op.id, onclick: () => elegir(op) }))
      : [];
    if (chipsOps.length) {
      controles.append(el("div", { class: "selector-modo selector-ops", role: "group", "aria-label": tr("Operación", "Operation") }, chipsOps));
    }
    for (const e of cfg.entradas || []) {
      let input;
      if (e.opciones) {
        input = el("select", { id: `${prefijo}-${e.id}` },
          e.opciones.map(([valor, texto]) => el("option", { value: valor, text: texto })));
        if (e.valor != null) input.value = e.valor;
        input.addEventListener("change", e.alCambiar ? () => cambiarEntrada(e, input)
          : e.reinicia === false ? () => actualizarEtiquetas(valoresEntradas()) : reiniciar);
      } else {
        input = el("input", { type: "number", id: `${prefijo}-${e.id}`, min: e.min, max: e.max, step: 1, inputmode: "numeric" });
        input.value = e.aleatorio ? aleatorio(e) : e.valor;
        // La caja tiene el ancho del número más largo que acepta.
        input.style.setProperty("--cifras", Math.max(String(e.min == null ? "" : e.min).length, String(e.max == null ? "" : e.max).length));
        input.addEventListener("keydown", (ev) => { if (ev.key === "Enter" && opElegida) ejecutar(opElegida); });
        input.addEventListener("input", () => {
          revisarCampo(e.id, true);
          const op = operacionDeEntrada(e.id);
          if (op && op !== opElegida && !e.alCambiar) elegir(op);
          else actualizarLlamadas();
        });
        if (e.alCambiar) input.addEventListener("input", () => cambiarEntrada(e, input));
      }
      // El rango va a la vista, en una muesca sobre el borde inferior de la
      // caja (no ocupa alto): así se sabe el límite antes de escribir.
      const rango = e.opciones ? null : textoRango(e);
      const muesca = rango ? el("span", { class: "campo-rango", "aria-hidden": "true", text: rango }) : null;
      if (rango) input.title = tr(`Entre ${e.min} y ${e.max}`, `Between ${e.min} and ${e.max}`);
      const etiquetaCampo = el("label", { class: "campo", for: input.id }, e.etiqueta,
        muesca ? el("span", { class: "campo-caja" }, input, muesca) : input);
      campos[e.id] = { cfg: e, input, muesca, rango, etiqueta: etiquetaCampo };
      controles.append(etiquetaCampo);
    }
    // Botones que ejecutan algo: Ejecutar (la operación elegida) y las secundarias.
    const botones = [];
    const bEjecutar = opElegida
      ? el("button", { class: "boton principal boton-ejecutar", type: "button", onclick: () => opElegida && ejecutar(opElegida) })
      : null;
    if (bEjecutar) {
      botones.push([null, bEjecutar]);
      controles.append(bEjecutar);
    }
    for (const op of cfg.operaciones.filter((o) => o.secundaria)) {
      const boton = el("button", { class: "boton", type: "button", onclick: () => ejecutar(op) });
      botones.push([op, boton]);
      controles.append(boton);
    }
    controles.append(el("span", { class: "separador" }),
      el("button", { class: "boton", type: "button", text: tr("Reiniciar", "Reset"), onclick: reiniciar }));

    const escenario = el("div", { class: "escenario" });
    const mensaje = el("p", { class: "mensaje", "aria-live": "polite" });

    const bInicio = el("button", { class: "boton", type: "button", title: tr("Primer paso", "First step"), "aria-label": tr("Primer paso", "First step"), text: "«", onclick: () => irAMano(0) });
    const bAtras = el("button", { class: "boton", type: "button", title: tr("Paso anterior", "Previous step"), "aria-label": tr("Paso anterior", "Previous step"), text: "‹", onclick: () => irAMano(actual - 1) });
    // Ancho fijo: si ▶ y ❚❚ midieran distinto, la fila podría partirse en dos al empezar a
    // reproducir, después de que ajustarEscala midió el alto disponible.
    const bPlay = el("button", { class: "boton boton-play", type: "button", title: tr("Reproducir / pausar", "Play / pause"), "aria-label": tr("Reproducir o pausar", "Play or pause"), onclick: alternar });
    const bAdelante = el("button", { class: "boton", type: "button", title: tr("Paso siguiente", "Next step"), "aria-label": tr("Paso siguiente", "Next step"), text: "›", onclick: () => irAMano(actual + 1) });
    const bFin = el("button", { class: "boton", type: "button", title: tr("Último paso", "Last step"), "aria-label": tr("Último paso", "Last step"), text: "»", onclick: () => ir(pasos.length - 1) });
    const contador = el("span", { class: "contador-pasos" });
    const rango = el("input", { type: "range", min: 0, max: VELOCIDADES.length - 1, step: 1, "aria-label": tr("Velocidad", "Speed"), title: tr("Velocidad", "Speed") });
    rango.value = velocidad;
    rango.addEventListener("input", () => { velocidad = Number(rango.value); if (temporizador) { detener(); reproducir(); } });
    const etiquetaVelocidad = el("label", { class: "velocidad" }, el("span", { class: "texto-velocidad", text: tr("Velocidad", "Speed") }), rango);

    // Modo al ejecutar una operación: reproducir solo o avanzar con ›. Está
    // sincronizado con la reproducción: ▶ marca Automático, y pausar (con ❚❚
    // o con ‹ › mientras corre) marca Paso a paso. Elegir Automático con una
    // operación a medio ver la sigue reproduciendo.
    const bAuto = el("button", {
      type: "button", text: tr("▶ Automático", "▶ Automatic"),
      onclick: () => {
        cambiarModo("auto", true);
        if (opMostrada && actual < pasos.length - 1 && !temporizador && !avance) reproducir();
      },
    });
    const bManual = el("button", { type: "button", text: tr("Paso a paso", "Step by step"), onclick: () => cambiarModo("manual", true) });
    const selectorModo = el("div", { class: "selector-modo", role: "group", "aria-label": tr("Al ejecutar una operación", "When an operation runs"), title: tr("Al ejecutar una operación", "When an operation runs") }, bAuto, bManual);

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
      bPlegar.textContent = si ? tr("Ver todo ▾", "Show all ▾") : tr("Ver menos ▴", "Show less ▴");
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
      invitarAvanzar(false);
      bAuto.setAttribute("aria-pressed", String(modo === "auto"));
      bManual.setAttribute("aria-pressed", String(modo === "manual"));
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

    // Filas de información (variables, pila de llamadas, "devuelve"…) que el
    // tema marca con data-alto-estable: si en algún paso de la operación
    // ocupan dos renglones, reservan ese alto desde el primero, así el dibujo
    // de abajo no salta. Se guarda el alto más grande de cada una (por el
    // valor del atributo).
    const altosFilas = new Map();
    const filasEstables = (nodo) => nodo.querySelectorAll("[data-alto-estable]");
    function fijarFilas() {
      for (const f of filasEstables(escenario)) {
        const h = altosFilas.get(f.dataset.altoEstable);
        f.style.minHeight = h ? `${h}px` : "";
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
      // Por cada paso: su alto sin las filas estables y qué filas tiene (al
      // final se les suma el alto reservado de cada una). Las filas se miden
      // de nuevo en cada operación: basta con que no salten dentro de ella.
      altosFilas.clear();
      const medidas = [];
      for (const p of pasos) {
        copiaEscenario.replaceChildren();
        cfg.dibujar(copiaEscenario, p.estado);
        let resto = copiaEscenario.offsetHeight;
        const claves = [];
        for (const f of filasEstables(copiaEscenario)) {
          const clave = f.dataset.altoEstable;
          resto -= f.offsetHeight;
          claves.push(clave);
          altosFilas.set(clave, Math.max(altosFilas.get(clave) || 0, f.offsetHeight));
        }
        medidas.push([resto, claves]);
        copiaMensaje.textContent = p.mensaje;
        altoMensaje = Math.max(altoMensaje, copiaMensaje.offsetHeight);
      }
      for (const [resto, claves] of medidas) {
        altoEscenario = Math.max(altoEscenario, claves.reduce((h, clave) => h + altosFilas.get(clave), resto));
      }
      copiaEscenario.remove();
      copiaMensaje.remove();
      reservar(escenario, altoEscenario);
      reservar(mensaje, altoMensaje);
      fijarFilas();
    }
    function liberarAlturas() {
      for (const nodo of altos.keys()) nodo.style.removeProperty("--alto-reservado");
      altos.clear();
      altosFilas.clear();
      fijarFilas();
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

    // Números en la muesca: con espacio fino entre miles (99 999) y signo
    // menos tipográfico, iguales en los dos idiomas.
    function numeroCorto(n) {
      const texto = String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g, Math.abs(n) >= 10000 ? "\u202f" : "");
      return n < 0 ? `\u2212${texto}` : texto;
    }
    function textoRango(e) {
      if (e.min != null && e.max != null) return tr(`${numeroCorto(e.min)} a ${numeroCorto(e.max)}`, `${numeroCorto(e.min)} to ${numeroCorto(e.max)}`);
      if (e.min != null) return `≥ ${numeroCorto(e.min)}`;
      if (e.max != null) return `≤ ${numeroCorto(e.max)}`;
      return null;
    }

    // Qué le falta a un número: null si está bien.
    function problemaDe(e, valor) {
      const n = Number(valor);
      if (valor.trim() === "" || !Number.isInteger(n)) return "entero";
      if (e.max != null && n > e.max) return "max";
      if (e.min != null && n < e.min) return "min";
      return null;
    }

    // Un número fuera de rango se nota apenas se escribe: la caja y la muesca
    // se ponen rojas y la muesca dice el límite que se pasó.
    function revisarCampo(id, alEscribir) {
      const { cfg: e, input, muesca, rango } = campos[id];
      if (e.opciones) return null;
      const problema = problemaDe(e, input.value);
      const antes = input.getAttribute("aria-invalid") === "true";
      input.setAttribute("aria-invalid", problema ? "true" : "false");
      if (!muesca) return problema;
      muesca.parentElement.classList.toggle("invalido", !!problema);
      muesca.textContent = problema === "max" ? tr(`máx. ${numeroCorto(e.max)}`, `max ${numeroCorto(e.max)}`)
        : problema === "min" ? tr(`mín. ${numeroCorto(e.min)}`, `min ${numeroCorto(e.min)}`)
          : rango;
      if (problema && (!antes || !alEscribir)) sacudirCampo(muesca.parentElement);
      return problema;
    }

    function sacudirCampo(caja) {
      caja.classList.remove("sacude");
      void caja.offsetWidth;
      caja.classList.add("sacude");
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
        const problema = problemaDe(e, input.value);
        if (problema === "entero") {
          return { id, error: tr(`Escribe un número entero en "${e.etiqueta}".`, `Type a whole number in "${e.etiqueta}".`) };
        }
        if (problema) {
          return { id, error: tr(`"${e.etiqueta}" debe estar entre ${e.min} y ${e.max}.`, `"${e.etiqueta}" must be between ${e.min} and ${e.max}.`) };
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
    const etiquetaDe = (op, valores) => (typeof op.etiqueta === "function" ? op.etiqueta(valores || valoresEntradas()) : op.etiqueta) || op.id;
    // Nombre de la función, sin los parámetros: lo que dice cada opción del selector.
    const nombreOp = (op, valores) => etiquetaDe(op, valores).replace(/\(.*$/, "");

    // La llamada con los valores de las entradas: en la etiqueta, cada
    // parámetro que se llama como una entrada numérica de la operación (por su
    // id o por su etiqueta: "valor", "pos", "Value") se cambia por lo que dice
    // la caja. insertarEn(pos, valor) → insertarEn(2, 9). Si los nombres no
    // coinciden, la operación puede dar op.llamada(textos) => texto, que
    // recibe lo que dice cada caja tal cual (o el valor de cada lista).
    function llamadaDe(op, valores) {
      const vals = valores || valoresEntradas();
      if (op.llamada) {
        const textos = {};
        for (const [id, c] of Object.entries(campos)) textos[id] = c.cfg.opciones ? c.input.value : c.input.value.trim() || "?";
        return op.llamada(textos);
      }
      const texto = etiquetaDe(op, vals);
      const abre = texto.indexOf("(");
      if (abre < 0 || !texto.endsWith(")")) return texto;
      const cambios = new Map();
      for (const id of op.usa || []) {
        const c = campos[id];
        if (!c || c.cfg.opciones) continue;
        const escrito = c.input.value.trim() || "?";
        cambios.set(id, escrito);
        if (typeof c.cfg.etiqueta === "string") cambios.set(c.cfg.etiqueta.trim().toLowerCase(), escrito);
      }
      if (!cambios.size) return texto;
      const params = texto.slice(abre + 1, -1).replace(/[\p{L}_][\p{L}\p{N}_]*/gu, (nombre) => {
        const v = cambios.get(nombre) ?? cambios.get(nombre.toLowerCase());
        return v == null ? nombre : v;
      });
      return `${texto.slice(0, abre)}(${params})`;
    }

    function actualizarEtiquetas(valores) {
      for (const [op, boton] of botones) {
        if (op) boton.textContent = op.secundaria && op.usa && op.usa.length ? llamadaDe(op, valores) : etiquetaDe(op, valores);
      }
      principales.forEach((op, k) => {
        if (!chipsOps[k]) return;
        chipsOps[k].replaceChildren(el("code", { text: nombreOp(op, valores) }));
        chipsOps[k].setAttribute("aria-pressed", String(op === opElegida));
        chipsOps[k].title = etiquetaDe(op, valores);
      });
      if (bEjecutar && opElegida) {
        bEjecutar.replaceChildren(el("span", { class: "ejecutar-verbo", text: tr("▶ Ejecutar", "▶ Run") }), " ", el("code", { text: llamadaDe(opElegida, valores) }));
      }
      // Con varias operaciones, las entradas que la elegida no usa se atenúan
      // (las listas no: suelen cambiar los datos, no ser un argumento).
      if (chipsOps.length) {
        const usadas = new Set(opElegida.usa || []);
        const deAlguna = new Set(principales.flatMap((op) => op.usa || []));
        for (const [id, c] of Object.entries(campos)) {
          c.etiqueta.classList.toggle("sin-uso", !c.cfg.opciones && deAlguna.has(id) && !usadas.has(id));
        }
      }
    }
    const actualizarLlamadas = () => actualizarEtiquetas();

    // Cambiar una entrada que solo usa una de las operaciones (u y v de
    // agregarArista, el recorrido del ABB) elige esa operación.
    function operacionDeEntrada(id) {
      const usan = principales.filter((op) => (op.usa || []).includes(id));
      return usan.length === 1 && chipsOps.length ? usan[0] : null;
    }

    // Elegir otra operación no la ejecuta: cambia la llamada del botón
    // Ejecutar y, si no hay otra operación en curso, muestra su código.
    function elegir(op, mostrar = true) {
      if (!op || op.secundaria) return;
      opElegida = op;
      actualizarEtiquetas();
      const enCurso = (opMostrada && actual < pasos.length - 1) || temporizador || avance;
      if (!mostrar || enCurso) return;
      const clave = op.codigo || op.id;
      if (!fragmentos[clave]) return;
      opMostrada = null;
      invitarAvanzar(false);
      aleatoriosPendientes = [];
      liberarAlturas();
      pasos = [pasoInicial(tr(`Pulsa Ejecutar para correr ${nombreOp(op)} con los valores de arriba.`,
        `Press Run to call ${nombreOp(op)} with the values above.`), clave)];
      reservarEspacio();
      ir(0);
    }

    function pasoInicial(texto, codigo) {
      const inicial = codigo || (typeof cfg.codigoInicial === "function" ? cfg.codigoInicial(valoresEntradas()) : cfg.codigoInicial);
      const porDefecto = opElegida || cfg.operaciones[0];
      const clave = inicial || porDefecto.codigo || porDefecto.id;
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
    const comoLlamada = (nombre) => (nombre === "lambda" ? tr("la lambda", "the lambda") : `${nombre}()`);

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

    // Las entradas al azar de la operación que se ve pasan a un valor nuevo,
    // el de la próxima operación: la caja lo avisa con un destello (el mensaje
    // sigue hablando del valor que se usó) y el botón Ejecutar lo muestra.
    function renovarAleatorios() {
      if (!aleatoriosPendientes.length) return;
      for (const id of aleatoriosPendientes) {
        const input = campos[id].input;
        input.value = aleatorio(campos[id].cfg);
        revisarCampo(id, false);
        input.title = tr("Nuevo valor al azar para la próxima operación", "New random value for the next operation");
        input.classList.remove("renovado");
        void input.offsetWidth;
        input.classList.add("renovado");
      }
      aleatoriosPendientes = [];
      actualizarEtiquetas();
    }

    // fijos: los argumentos que se leyeron al pulsar Ejecutar, si antes hubo
    // que terminar la operación anterior (al terminar, las entradas al azar
    // cambian de valor, y tiene que correr la llamada que se anunció).
    function ejecutar(op, fijos) {
      if (temporizador || avance) return; // los botones están bloqueados mientras corre la animación
      // Otra operación con la anterior a medio ver (en Paso a paso o en
      // pausa): primero se terminan a la vista sus pasos pendientes, así el
      // dibujo no salta de golpe al estado final.
      if (opMostrada && actual < pasos.length - 1) {
        // Los valores al azar de la próxima operación se sortean ya (no al
        // terminar la anterior): así la llamada que se anuncia es la que corre.
        renovarAleatorios();
        const leidos = leerArgumentos(op);
        terminarYLuego(() => ejecutar(op, leidos.error ? null : leidos.args), op.secundaria ? etiquetaDe(op) : llamadaDe(op));
        return;
      }
      detener();
      if (fijos) {
        // Las cajas vuelven a mostrar los valores con que se llama.
        for (const [id, v] of Object.entries(fijos)) {
          if (campos[id].cfg.opciones) continue;
          campos[id].input.value = v;
          revisarCampo(id, false);
        }
        actualizarEtiquetas();
      }
      const { args, error, id: campoMalo } = fijos ? { args: fijos } : leerArgumentos(op);
      if (error) {
        // La caja que falla se sacude y queda lista para corregirla.
        revisarCampo(campoMalo, false);
        campos[campoMalo].input.focus({ preventScroll: true });
        opMostrada = null;
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
      pasos = lista.length ? lista : [pasoInicial(tr("Listo.", "Done."))];
      opMostrada = op;
      llamadaMostrada = op.secundaria ? etiquetaDe(op) : llamadaDe(op);
      aleatoriosPendientes = (op.usa || []).filter((id) => campos[id].cfg.aleatorio);
      reservarEspacio();
      ir(0);
      if (pasos.length > 1 && modo === "auto") reproducir();
      // Paso a paso: el botón › invita a avanzar hasta que se use por primera vez.
      invitarAvanzar(pasos.length > 1 && modo === "manual" && !avanzoAMano);
    }

    // Recorre rápido los pasos que faltan de la operación que se ve (a lo
    // sumo AVANCE_CUADROS cuadros, repartidos hasta el último), deja ver un
    // momento cómo terminó y sigue con despues().
    const AVANCE_CUADROS = 6;
    const AVANCE_MS = 260;
    const AVANCE_PAUSA_MS = 550;
    function terminarYLuego(despues, siguiente) {
      detener();
      invitarAvanzar(false);
      const desde = actual;
      const faltan = pasos.length - 1 - desde;
      const cuadros = Math.min(faltan, AVANCE_CUADROS);
      const indices = Array.from({ length: cuadros }, (_, k) => desde + Math.round(((k + 1) * faltan) / cuadros));
      const aviso = siguiente
        ? tr(`Terminando ${llamadaMostrada}… Después: ${siguiente}`, `Finishing ${llamadaMostrada}… Next: ${siguiente}`)
        : tr(`Terminando ${llamadaMostrada}…`, `Finishing ${llamadaMostrada}…`);
      let k = 0;
      const cuadro = () => {
        const indice = indices[k++];
        ir(indice);
        if (k < indices.length) {
          mensaje.textContent = aviso;
          mensaje.className = "mensaje";
          avance = setTimeout(cuadro, AVANCE_MS);
        } else {
          // El último paso se queda a la vista con su mensaje antes de seguir.
          avance = setTimeout(() => {
            avance = null;
            despues();
          }, AVANCE_PAUSA_MS);
        }
        bloquearMientrasAvanza();
      };
      cuadro();
    }

    function cancelarAvance() {
      clearTimeout(avance);
      avance = null;
    }

    // Mientras termina la operación anterior no se puede pulsar nada más que
    // Reiniciar: ni operaciones ni la barra de reproducción.
    function bloquearMientrasAvanza() {
      if (!avance) return;
      bloquearOperaciones(true);
      bloquearEntradas(true);
      for (const b of [bInicio, bAtras, bPlay, bAdelante, bFin]) b.disabled = true;
    }

    function reiniciar() {
      cancelarAvance();
      opMostrada = null;
      detener();
      invitarAvanzar(false);
      aleatoriosPendientes = [];
      liberarAlturas();
      // Datos nuevos: el dibujo empieza de cero, así lo viejo no se desvanece
      // encima de lo nuevo (en los temas que animan entre pasos).
      escenario.replaceChildren();
      const valores = valoresEntradas();
      estado = cfg.estadoInicial(valores);
      actualizarEtiquetas(valores);
      const texto = typeof cfg.mensajeInicial === "function" ? cfg.mensajeInicial(valores) : cfg.mensajeInicial;
      pasos = [pasoInicial(texto || tr("Elige una operación para empezar.", "Pick an operation to start."))];
      reservarEspacio();
      ir(0);
    }

    // Una entrada con alCambiar se refleja apenas cambia (un número, cuando es
    // válido), sin esperar a ejecutar una operación y sin perder lo que el tema
    // quiera conservar, como los puntos de una gráfica.
    function cambiarEntrada(e, input) {
      if (!e.opciones && problemaDe(e, input.value)) return;
      cancelarAvance();
      opMostrada = null;
      detener();
      invitarAvanzar(false);
      aleatoriosPendientes = [];
      liberarAlturas();
      const valores = valoresEntradas();
      const r = e.alCambiar(estado, valores) || {};
      if (r.estado) estado = r.estado;
      // Si muestra el código de una operación (otro recorrido, otro criterio),
      // esa operación queda elegida para Ejecutar.
      const deCodigo = (r.codigo && principales.find((op) => (op.codigo || op.id) === r.codigo)) || operacionDeEntrada(e.id);
      if (deCodigo) opElegida = deCodigo;
      actualizarEtiquetas(valores);
      const texto = r.mensaje || (typeof cfg.mensajeInicial === "function" ? cfg.mensajeInicial(valores) : cfg.mensajeInicial) || "";
      pasos = [pasoInicial(texto, r.codigo)];
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
      nombreCodigo.title = pila.length > 1 ? `${pila.map((m) => m.nombre).join(tr(" llama a ", " calls "))}` : "";

      // Cinta "llamada desde": la línea del que llamó, con su código. Justo
      // después de un retorno, en cambio, dice de qué función se volvió.
      const llamador = pila.length > 1 ? pila[pila.length - 2] : null;
      const retorno = r && r.evento && r.evento.tipo === "retorno" ? r.evento : null;
      procedencia.hidden = !llamador && !retorno;
      procedencia.classList.toggle("retorno", !!retorno);
      if (retorno) {
        procedencia.replaceChildren(
          el("span", { class: "llamada-desde-quien" }, tr("↩ volvió de ", "↩ returned from "), el("b", { text: comoLlamada(retorno.de) }),
            `: ${tr("sigue en", "continues in")} ${comoLlamada(pila.length ? pila[pila.length - 1].nombre : nombreDe(clave))}${linea > 0 ? `, ${tr("línea", "line")} ${linea}` : ""}`));
        procedencia.classList.toggle("recien", !!animar);
      } else if (llamador) {
        const texto = (fragmentos[llamador.clave].split("\n")[llamador.linea - 1] || "").trim();
        procedencia.replaceChildren(
          el("span", { class: "llamada-desde-quien" }, tr("↳ llamada desde ", "↳ called from "), el("b", { text: comoLlamada(llamador.nombre) }),
            llamador.nombre === pila[pila.length - 1].nombre ? tr(" (ella misma)", " (itself)") : "", `, ${tr("línea", "line")} ${llamador.linea}:`),
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
      const plural = (k) => `${k} ${k === 1 ? tr("vuelta", "iteration") : tr("vueltas", "iterations")}`;
      if (r && linea > 0) {
        for (const { bucle: b, vueltas, nueva } of r.bucles) {
          const enCondicion = linea === b.condicion;
          const texto = enCondicion
            ? (vueltas ? `↻ ${plural(vueltas)} · ${tr("¿otra?", "again?")}` : tr("↻ ¿entra al bucle?", "↻ enter the loop?"))
            : `↻ ${tr("vuelta", "iteration")} ${vueltas}`;
          const ayuda = enCondicion
            ? tr("Se evalúa la condición del bucle", "The loop condition is evaluated")
            : tr(`La ejecución va en la vuelta ${vueltas} del bucle ${b.tipo}`, `Execution is in iteration ${vueltas} of the ${b.tipo} loop`);
          const clase = `bucle${nueva && animar && vueltas > 1 ? " nueva" : ""}`;
          pegar(b.condicion, insignia(clase, texto, ayuda));
          // En móvil solo se ve la línea actual: la vuelta va también en su fila.
          if (!enCondicion) plegada(insignia(clase, `↻ ${b.tipo}: ${tr("vuelta", "iteration")} ${vueltas}`, ayuda));
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
          const salio = `${tr("salió tras", "exited after")} ${plural(vueltas)}`;
          const nodo = insignia("bucle termino", `✓ ${salio}`, tr("El bucle ya terminó", "The loop has finished"));
          if (b.condicion !== linea) plegada(insignia("bucle termino", `✓ ${b.tipo}: ${salio}`));
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
              pegar(linea, insignia("llamada", tr("↻ se llama a sí misma", "↻ calls itself"), tr("Llamada recursiva: la función se llama a sí misma con otros argumentos", "Recursive call: the function calls itself with other arguments")));
              break;
            }
            if (clavePorNombre[id]) {
              pegar(linea, insignia(`llamada${entra ? " entra" : ""}`, `→ ${tr("llama a", "calls")} ${id}()`, tr("Otra función de este tema", "Another function from this topic")));
              break;
            }
            if (analisis[clave].lambdas.some((x) => x.nombre === id)) {
              pegar(linea, insignia(`llamada${entra ? " entra" : ""}`, `→ ${tr("llama a la lambda", "calls the lambda")} ${id}`, tr("El cuerpo de la lambda corre ahora, con los valores de esta llamada", "The lambda's body runs now, with this call's values")));
              break;
            }
          }
        }
        const deBiblioteca = ls.find((x) => !x.metodo && ORIGENES[x.id]);
        if (deBiblioteca) {
          pegar(linea, insignia("origen", `${deBiblioteca.id} ← #include ${ORIGENES[deBiblioteca.id]}`, tr(`std::${deBiblioteca.id} es de la biblioteca estándar de C++`, `std::${deBiblioteca.id} is from the C++ standard library`)));
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
      fijarFilas();
      // Las indicaciones se animan solo al avanzar de a un paso.
      mostrarCodigo(p, actual === anterior + 1);
      mensaje.textContent = p.mensaje;
      mensaje.className = "mensaje" + (p.tipo ? ` ${p.tipo}` : "");
      contador.textContent = tr(`Paso ${actual + 1} de ${pasos.length}`, `Step ${actual + 1} of ${pasos.length}`);
      bInicio.disabled = bAtras.disabled = actual === 0;
      bFin.disabled = bAdelante.disabled = actual === pasos.length - 1;
      if (actual === pasos.length - 1) {
        detener();
        invitarAvanzar(false);
        renovarAleatorios();
      }
      bPlay.textContent = temporizador ? "❚❚" : "▶";
      bPlay.disabled = pasos.length < 2;
      bloquearEntradas(actual < pasos.length - 1);
      noEncoger(mensaje);
      ajustarEscala();
      centrar();
    }

    function reproducir() {
      if (actual >= pasos.length - 1) ir(0);
      temporizador = setInterval(() => ir(actual + 1), 1300 / VELOCIDADES[velocidad]);
      bPlay.textContent = "❚❚";
      bloquearOperaciones(true);
    }

    function detener() {
      clearInterval(temporizador);
      temporizador = null;
      bPlay.textContent = "▶";
      bloquearOperaciones(false);
    }

    // Mientras corre la animación, Ejecutar y los botones secundarios esperan: así no se
    // interrumpe sin querer lo que se está viendo. Se desbloquean al terminar o
    // al pausar.
    function bloquearOperaciones(si) {
      for (const [, boton] of botones) {
        boton.disabled = si;
        boton.title = si ? tr("Espera a que termine la animación o pausa con ❚❚", "Wait for the animation to finish or pause it with ❚❚") : "";
      }
    }

    // Mientras una operación está en curso (no llegó a su último paso, en
    // cualquier modo) sus datos no se pueden cambiar: la animación muestra lo
    // que hizo la función con esos datos. Se desbloquean en el último paso
    // (» salta ahí) y Reiniciar sigue disponible.
    function bloquearEntradas(si) {
      for (const { input } of Object.values(campos)) {
        if (input.disabled === si) continue;
        input.disabled = si;
        const caja = input.closest(".campo");
        if (caja) {
          caja.classList.toggle("bloqueado", si);
          caja.title = si ? tr("Se puede cambiar al terminar la operación (» salta al final)", "You can change it when the operation ends (» jumps to the end)") : "";
        }
      }
    }

    // --- Guía para quien no sabe qué pulsar ---
    // 1. Si el visualizador está a la vista y nadie lo toca en unos segundos,
    //    el botón Ejecutar pulsa (una sola vez por visualizador).
    // 2. En modo Paso a paso, después de ejecutar una operación, el botón ›
    //    pulsa hasta que se use por primera vez.
    let avanzoAMano = false;
    function invitarAvanzar(si) {
      bAdelante.classList.toggle("invita-continua", si);
    }
    bAdelante.addEventListener("click", () => {
      avanzoAMano = true;
      invitarAvanzar(false);
    });

    const ESPERA_INVITACION = 4000;
    let invitado = false;
    let esperaInvitacion = null;
    const primeraOperacion = bEjecutar || (botones[0] || [])[1];
    function cancelarInvitacion() {
      clearTimeout(esperaInvitacion);
      esperaInvitacion = null;
      invitado = true;
      if (primeraOperacion) primeraOperacion.classList.remove("invita");
    }
    for (const evento of ["pointerdown", "keydown", "focusin"]) contenedor.addEventListener(evento, cancelarInvitacion);
    if (primeraOperacion && window.IntersectionObserver) {
      new IntersectionObserver((entradas) => {
        const visible = entradas.some((e) => e.isIntersecting);
        clearTimeout(esperaInvitacion);
        esperaInvitacion = null;
        if (!visible || invitado) return;
        esperaInvitacion = setTimeout(() => {
          invitado = true;
          if (primeraOperacion.disabled) return;
          primeraOperacion.classList.add("invita");
          // Tres pulsos (o, sin animaciones, un anillo fijo) y se quita.
          setTimeout(() => primeraOperacion.classList.remove("invita"), 3400);
        }, ESPERA_INVITACION);
      }, { threshold: 0.3 }).observe(contenedor);
    }

    // ▶ reproduce y deja el modo en Automático; ❚❚ pausa y lo deja en Paso a paso.
    function alternar() {
      if (temporizador) cambiarModo("manual", true);
      else {
        cambiarModo("auto", true);
        reproducir();
      }
    }

    // « ‹ › mientras corre la animación: la pausan (Paso a paso) y se mueven.
    function irAMano(k) {
      if (temporizador) cambiarModo("manual", true);
      ir(k);
    }

    reiniciar();

    return {
      usarVariante(nombre) {
        prepararCodigo(nombre && cfg.variantes && cfg.variantes[nombre] ? nombre : null);
        claveMostrada = null; // el fragmento que se ve se vuelve a pintar
        reiniciar();
      },
    };
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

  if (irAlIdiomaPreferido()) return;
  montarEncabezado();
  sugerirIdioma();
  ajustarEnlacesSinTraducir();
  montarPortada();
  montarNavegacionTemas();
  montarLeccion();
  montarPreguntas();
  montarCodigoCompleto();
})();
