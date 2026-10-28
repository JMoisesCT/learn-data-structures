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
      slug: "pila",
      titulo: "Pila (stack)",
      resumen: "El último que entra es el primero que sale (LIFO). Deshacer, llamadas a funciones, paréntesis.",
      etiquetas: ["LIFO", "push/pop O(1)"],
      archivo: "pila.cpp",
    },
    {
      slug: "cola",
      titulo: "Cola (queue)",
      resumen: "El primero que entra es el primero que sale (FIFO), con un arreglo circular.",
      etiquetas: ["FIFO", "arreglo circular"],
      archivo: "cola.cpp",
    },
    {
      slug: "monticulo",
      titulo: "Montículo (heap)",
      resumen: "Min-heap y max-heap: un árbol guardado en un arreglo con el mínimo (o el máximo) siempre en la raíz. Incluye heapsort.",
      etiquetas: ["insertar O(log n)", "heapsort O(n log n)"],
      archivo: "monticulo.cpp",
    },
    { slug: "arbol-binario-busqueda", titulo: "Árbol binario de búsqueda", resumen: "Búsqueda, inserción y recorridos.", etiquetas: ["próximamente"], proximamente: true },
    { slug: "tabla-hash", titulo: "Tabla hash", resumen: "Funciones hash y manejo de colisiones.", etiquetas: ["próximamente"], proximamente: true },
    { slug: "grafos", titulo: "Grafos", resumen: "Representación, BFS y DFS.", etiquetas: ["próximamente"], proximamente: true },
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

  function montarEncabezado() {
    const encabezado = document.querySelector("header.encabezado");
    if (!encabezado) return;
    const nav = el("nav", { class: "nav", "aria-label": "Temas" },
      DS.TEMAS.filter((t) => !t.proximamente).map((t) =>
        el("a", { href: `${raiz}temas/${t.slug}/`, "aria-current": t.slug === temaActual ? "page" : null, text: t.titulo })));
    encabezado.append(el("div", { class: "contenedor" },
      el("a", { class: "marca", href: raiz },
        el("span", { class: "marca-icono", "aria-hidden": "true", text: "{ }" }),
        "Aprende Estructuras de Datos"),
      nav,
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
    leccion.prepend(cabecera);
    leccion.append(pie);
    leccion.classList.add("lista");

    // La barra de progreso se pega justo debajo del encabezado del sitio (si está fijo).
    const encabezado = document.querySelector("header.encabezado");
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

      if (!(opciones && opciones.sinUrl) && history.replaceState) history.replaceState(null, "", `#${pasos[k].id}`);
      // Los dibujos que se escalan miden de nuevo su ancho ahora que son visibles.
      window.dispatchEvent(new Event("resize"));
      if (!primeraVez) {
        const arriba = leccion.getBoundingClientRect().top - altoFijo();
        if (arriba < 0) window.scrollBy(0, arriba);
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

  const VELOCIDADES = [0.4, 0.7, 1, 1.6, 2.6];

  function tema(cfg) {
    const contenedor = document.getElementById(cfg.contenedor || "visualizador");
    if (!contenedor) return;
    const prefijo = cfg.contenedor ? cfg.contenedor : "entrada";

    const fragmentos = {};
    for (const [clave, texto] of Object.entries(cfg.codigo)) fragmentos[clave] = dedent(texto);

    let estado = null;
    let pasos = [];
    let actual = 0;
    let temporizador = null;
    let velocidad = 2;
    let claveMostrada = null;

    // --- Construcción de la interfaz ---
    const campos = {};
    const controles = el("div", { class: "controles" });
    for (const e of cfg.entradas || []) {
      let input;
      if (e.opciones) {
        input = el("select", { id: `${prefijo}-${e.id}` },
          e.opciones.map(([valor, texto]) => el("option", { value: valor, text: texto })));
        if (e.valor != null) input.value = e.valor;
        input.addEventListener("change", reiniciar);
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
    const bPlay = el("button", { class: "boton", type: "button", title: "Reproducir / pausar", "aria-label": "Reproducir o pausar", onclick: alternar });
    const bAdelante = el("button", { class: "boton", type: "button", title: "Paso siguiente", "aria-label": "Paso siguiente", text: "›", onclick: () => ir(actual + 1) });
    const bFin = el("button", { class: "boton", type: "button", title: "Último paso", "aria-label": "Último paso", text: "»", onclick: () => ir(pasos.length - 1) });
    const contador = el("span");
    const rango = el("input", { type: "range", min: 0, max: VELOCIDADES.length - 1, step: 1, "aria-label": "Velocidad" });
    rango.value = velocidad;
    rango.addEventListener("input", () => { velocidad = Number(rango.value); if (temporizador) { detener(); reproducir(); } });

    const reproduccion = el("div", { class: "reproduccion" },
      bInicio, bAtras, bPlay, bAdelante, bFin, contador,
      el("label", {}, "Velocidad", rango));

    const tituloCodigo = el("div", { class: "titulo-codigo" });
    const preCodigo = el("pre", { class: "codigo", tabindex: "0" });

    contenedor.classList.add("visualizador");
    contenedor.append(
      el("div", { class: "panel" }, controles, escenario, mensaje, reproduccion),
      el("div", { class: "panel panel-codigo" }, tituloCodigo, preCodigo));

    // --- Lógica ---
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
      pasos = lista.length ? lista : [pasoInicial("Listo.")];
      for (const id of op.usa || []) {
        if (campos[id].cfg.aleatorio) campos[id].input.value = aleatorio(campos[id].cfg);
      }
      ir(0);
      if (pasos.length > 1) reproducir();
    }

    function reiniciar() {
      detener();
      const valores = valoresEntradas();
      estado = cfg.estadoInicial(valores);
      actualizarEtiquetas(valores);
      const texto = typeof cfg.mensajeInicial === "function" ? cfg.mensajeInicial(valores) : cfg.mensajeInicial;
      pasos = [pasoInicial(texto || "Elige una operación para empezar.")];
      ir(0);
    }

    function mostrarCodigo(clave, linea) {
      if (clave !== claveMostrada) {
        claveMostrada = clave;
        preCodigo.innerHTML = resaltarCpp(fragmentos[clave]);
        tituloCodigo.textContent = cfg.tituloCodigo ? cfg.tituloCodigo(clave) : clave;
      }
      const lineas = preCodigo.children;
      for (let k = 0; k < lineas.length; k++) lineas[k].classList.toggle("actual", k === linea - 1);
    }

    function ir(indice) {
      actual = Math.max(0, Math.min(pasos.length - 1, indice));
      const p = pasos[actual];
      if (!cfg.incremental) escenario.innerHTML = "";
      cfg.dibujar(escenario, p.estado);
      mostrarCodigo(p.clave, p.linea);
      mensaje.textContent = p.mensaje;
      mensaje.className = "mensaje" + (p.tipo ? ` ${p.tipo}` : "");
      contador.textContent = `Paso ${actual + 1} de ${pasos.length}`;
      bInicio.disabled = bAtras.disabled = actual === 0;
      bFin.disabled = bAdelante.disabled = actual === pasos.length - 1;
      if (actual === pasos.length - 1) detener();
      bPlay.textContent = temporizador ? "❚❚" : "▶";
      bPlay.disabled = pasos.length < 2;
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
