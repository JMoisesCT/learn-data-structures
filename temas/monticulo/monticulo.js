// Lección del montículo (max-heap / min-heap) y de heapsort, en pasos.
// Los fragmentos de código deben coincidir línea por línea con
// ejemplos/cpp/monticulo.cpp (scripts/verificar-fragmentos.mjs lo revisa).
(function () {
  const { el } = DS;
  const MAXIMO = 15; // 4 niveles: lo que cabe en pantalla
  const NODO = 38;
  const NIVEL = 66;
  const ANCHO_ARBOL = 400;
  const PASO_CELDA = 36;
  const MARGEN = 12;
  const Y_ARBOL = 30;
  const SVG = "http://www.w3.org/2000/svg";
  const EJEMPLO = [3, 10, 1, 8, 6, 4]; // el mismo arreglo que usa main()

  // ------------------------------------------------------------------
  // Fragmentos de C++ (copiados de ejemplos/cpp/monticulo.cpp)
  // ------------------------------------------------------------------

  const CODIGO = {
    maxHeapify: `
      void maxHeapify(vector<int>& v, int n, int i) {
          int mayor = i;
          int izq = 2 * i + 1;
          int der = 2 * i + 2;

          if (izq < n && v[izq] > v[mayor]) mayor = izq;
          if (der < n && v[der] > v[mayor]) mayor = der;

          if (mayor != i) {
              swap(v[i], v[mayor]);
              maxHeapify(v, n, mayor);
          }
      }`,
    minHeapify: `
      void minHeapify(vector<int>& v, int n, int i) {
          int menor = i;
          int izq = 2 * i + 1;
          int der = 2 * i + 2;

          if (izq < n && v[izq] < v[menor]) menor = izq;
          if (der < n && v[der] < v[menor]) menor = der;

          if (menor != i) {
              swap(v[i], v[menor]);
              minHeapify(v, n, menor);   // baja recursivamente
          }
      }`,
    buildMaxHeap: `
      void buildMaxHeap(vector<int>& v) {
          int n = v.size();
          for (int i = n / 2 - 1; i >= 0; i--)
              maxHeapify(v, n, i);
      }`,
    buildMinHeap: `
      void buildMinHeap(vector<int>& v) {
          int n = v.size();
          for (int i = n / 2 - 1; i >= 0; i--)
              minHeapify(v, n, i);
      }`,
    insertMax: `
      void insertMax(vector<int>& v, int valor) {
          v.push_back(valor);
          int i = v.size() - 1;

          // Sube mientras el padre sea menor
          while (i > 0 && v[(i - 1) / 2] < v[i]) {
              swap(v[i], v[(i - 1) / 2]);
              i = (i - 1) / 2;
          }
      }`,
    insertMin: `
      void insertMin(vector<int>& v, int valor) {
          v.push_back(valor);
          int i = v.size() - 1;

          // Sube mientras el padre sea mayor
          while (i > 0 && v[(i - 1) / 2] > v[i]) {
              swap(v[i], v[(i - 1) / 2]);
              i = (i - 1) / 2;
          }
      }`,
    maximum: `
      int maximum(vector<int>& v) {
          if (v.empty()) return INT_MIN;
          return v[0];   // raíz del max-heap
      }`,
    minimum: `
      int minimum(vector<int>& v) {
          if (v.empty()) return INT_MAX;
          return v[0];   // raíz del min-heap
      }`,
    extractMax: `
      int extractMax(vector<int>& v) {
          if (v.empty()) return INT_MIN;

          int raiz = v[0];
          v[0] = v.back();
          v.pop_back();
          maxHeapify(v, v.size(), 0);

          return raiz;
      }`,
    extractMin: `
      int extractMin(vector<int>& v) {
          if (v.empty()) return INT_MAX;

          int raiz = v[0];
          v[0] = v.back();
          v.pop_back();
          minHeapify(v, v.size(), 0);

          return raiz;
      }`,
    heapSort: `
      void heapSort(vector<int>& v) {
          buildMaxHeap(v);
          for (int i = v.size() - 1; i > 0; i--) {
              swap(v[0], v[i]);
              maxHeapify(v, i, 0);
          }
      }`,
  };

  const fragmentos = (...claves) => Object.fromEntries(claves.map((c) => [c, CODIGO[c]]));

  // Lo que cambia entre max-heap y min-heap.
  const TIPOS = {
    max: {
      nombre: "max-heap", heapify: "maxHeapify", build: "buildMaxHeap", insert: "insertMax",
      extract: "extractMax", top: "maximum", elegido: "mayor", palabra: "mayor", extremo: "máximo",
      centinela: "INT_MIN", signo: ">", vaAntes: (a, b) => a > b,
    },
    min: {
      nombre: "min-heap", heapify: "minHeapify", build: "buildMinHeap", insert: "insertMin",
      extract: "extractMin", top: "minimum", elegido: "menor", palabra: "menor", extremo: "mínimo",
      centinela: "INT_MAX", signo: "<", vaAntes: (a, b) => a < b,
    },
  };

  // ------------------------------------------------------------------
  // Utilidades compartidas
  // ------------------------------------------------------------------

  const nivel = (i) => Math.floor(Math.log2(i + 1));
  const padreDe = (i) => Math.floor((i - 1) / 2);

  // El lienzo solo se ensancha si el arreglo no cabe bajo el árbol.
  const anchoPara = (n) => Math.max(ANCHO_ARBOL, n * PASO_CELDA) + 2 * MARGEN;

  function posArbol(i, ancho) {
    const d = nivel(i);
    const p = i - (2 ** d - 1);
    const x = (ancho - ANCHO_ARBOL) / 2 + (p + 0.5) * (ANCHO_ARBOL / 2 ** d) - NODO / 2;
    return { x, y: Y_ARBOL + d * NIVEL };
  }

  const posCelda = (i) => MARGEN + i * PASO_CELDA;

  // El lienzo solo es tan alto como los niveles que ocupa el árbol.
  function geometria(n) {
    const niveles = n > 1 ? nivel(n - 1) + 1 : 1;
    const yTitulo = Y_ARBOL + (niveles - 1) * NIVEL + NODO + 26;
    const yCeldas = yTitulo + 50; // deja lugar para dos líneas de marcas
    return { yTitulo, yCeldas, alto: yCeldas + 60 };
  }

  function nuevoId(s) {
    return `h${s.siguienteId++}`;
  }

  function estadoDesde(valores) {
    const s = { items: [], siguienteId: 1, vis: {} };
    for (const v of valores) s.items.push({ id: nuevoId(s), v });
    return s;
  }

  function intercambiar(s, a, b) {
    [s.items[a], s.items[b]] = [s.items[b], s.items[a]];
  }

  // Junta varias etiquetas en la misma posición: { 2: "i, mayor" }.
  function marcas(pares) {
    const r = {};
    for (const [indice, texto] of pares) {
      if (indice == null) continue;
      r[indice] = r[indice] ? `${r[indice]}, ${texto}` : texto;
    }
    return r;
  }

  // Versión sin animación, para preparar estados iniciales.
  function heapificarValores(v, n, i, t) {
    for (;;) {
      const izq = 2 * i + 1;
      const der = 2 * i + 2;
      let e = i;
      if (izq < n && t.vaAntes(v[izq], v[e])) e = izq;
      if (der < n && t.vaAntes(v[der], v[e])) e = der;
      if (e === i) return v;
      [v[i], v[e]] = [v[e], v[i]];
      i = e;
    }
  }

  function construirValores(valores, t) {
    const v = [...valores];
    for (let i = Math.floor(v.length / 2) - 1; i >= 0; i--) heapificarValores(v, v.length, i, t);
    return v;
  }

  function valoresAleatorios(cantidad) {
    const usados = new Set();
    while (usados.size < cantidad) usados.add(Math.floor(Math.random() * 60) + 1);
    return [...usados];
  }

  // ------------------------------------------------------------------
  // Animación de maxHeapify / minHeapify (con su recursión)
  // ------------------------------------------------------------------
  //   pila: llamadas que esperan "arriba" de esta, para mostrar la recursión.
  //   detallado: un paso por línea; si no, solo comparar, intercambiar y recursión.
  function animarHeapify(s, t, n, i, pila, paso, ver, detallado) {
    const clave = t.heapify;
    const e = t.elegido;
    const v = (k) => s.items[k].v;
    const izq = 2 * i + 1;
    const der = 2 * i + 2;
    const hijos = [izq, der].filter((k) => k < n);
    const llamadas = [...pila, `${clave}(v, ${n}, ${i})`];
    const vars = (elegido) => ({ n, i, izq, der, [e]: elegido });
    const etiquetas = (elegido) => marcas([[i, "i"], [izq < n ? izq : null, "izq"], [der < n ? der : null, "der"], [elegido, e]]);
    const mostrar = (o) => ver(Object.assign({ pila: llamadas }, o));
    let elegido = i;

    if (detallado) {
      mostrar({ comparar: [i], marcas: marcas([[i, "i"], [i, e]]), vars: { n, i, [e]: i } });
      paso(clave, 2, `${e} = i = ${i}. Suponemos que v[${i}] = ${v(i)} es el ${t.palabra} y lo comprobamos contra sus hijos.`);
      mostrar({ comparar: [i, ...hijos], marcas: etiquetas(i), vars: vars(i) });
      paso(clave, 4, `Sus hijos estarían en izq = 2·${i} + 1 = ${izq} y der = 2·${i} + 2 = ${der}.`
        + (!hijos.length ? ` Ninguno es < n = ${n}: es una hoja.` : hijos.length === 1 ? ` der no es < n = ${n}: solo tiene hijo izquierdo.` : ""));
      for (const [k, nombre, linea] of [[izq, "izq", 6], [der, "der", 7]]) {
        if (k >= n) {
          mostrar({ comparar: [i], marcas: etiquetas(elegido), vars: vars(elegido) });
          paso(clave, linea, `${nombre} = ${k} no es < n = ${n}: ese hijo no existe, no se compara.`);
          continue;
        }
        const antes = elegido;
        const gana = t.vaAntes(v(k), v(antes));
        if (gana) elegido = k;
        mostrar({ comparar: [antes, k], marcas: etiquetas(elegido), vars: vars(elegido) });
        paso(clave, linea, `¿v[${nombre}] = ${v(k)} ${t.signo} v[${e}] = ${v(antes)}? `
          + (gana ? `Sí: ahora ${e} = ${nombre} = ${k}.` : `No: ${e} se queda en ${antes}.`));
      }
    } else {
      if (izq < n && t.vaAntes(v(izq), v(elegido))) elegido = izq;
      if (der < n && t.vaAntes(v(der), v(elegido))) elegido = der;
      mostrar({ comparar: [i, ...hijos], marcas: etiquetas(elegido), vars: vars(elegido) });
      paso(clave, 7, hijos.length
        ? `Comparamos v[${i}] = ${v(i)} con ${hijos.length === 2 ? "sus hijos" : "su único hijo"} (${hijos.map(v).join(" y ")}): el ${t.palabra} es ${v(elegido)}.`
        : `v[${i}] = ${v(i)} es una hoja: izq = ${izq} ya no es < n = ${n}.`);
    }

    if (elegido === i) {
      mostrar({ ok: [i], marcas: marcas([[i, "i"], [i, e]]), vars: vars(i) });
      paso(clave, 9, hijos.length
        ? `${e} == i: ${v(i)} ya es el ${t.palabra} entre él y sus hijos. La regla se cumple: termina.`
        : `${e} == i: una hoja no puede bajar más. Termina.`);
      return;
    }

    if (detallado) {
      mostrar({ comparar: [i, elegido], marcas: etiquetas(elegido), vars: vars(elegido) });
      paso(clave, 9, `${e} (${elegido}) ≠ i (${i}): un hijo es ${t.palabra} que v[${i}], así que ${v(i)} tiene que bajar.`);
    }
    const baja = v(i);
    const sube = v(elegido);
    intercambiar(s, i, elegido);
    mostrar({ intercambio: [i, elegido], marcas: marcas([[i, "i"], [elegido, e]]), vars: vars(elegido) });
    paso(clave, 10, `swap(v[${i}], v[${e}]): ${sube} sube y ${baja} baja a la posición ${elegido}.`);
    mostrar({ comparar: [elegido], marcas: marcas([[elegido, e]]), vars: vars(elegido) });
    paso(clave, 11, `Llamada recursiva ${clave}(v, ${n}, ${elegido}): ${baja} sigue bajando por ese subárbol.`);
    animarHeapify(s, t, n, elegido, llamadas, paso, ver, detallado);
  }

  // Animación de buildMaxHeap / buildMinHeap.
  function animarBuild(s, t, pila, paso, ver, final) {
    const n = s.items.length;
    const llamadas = [...pila, `${t.build}(v)`];
    const mostrar = (o) => ver(Object.assign({ pila: llamadas }, o));
    const inicio = Math.floor(n / 2) - 1;
    mostrar({ vars: { n } });
    paso(t.build, 2, `n = ${n}. Visto como árbol, el arreglo todavía no cumple la regla del ${t.nombre}.`);
    for (let i = inicio; i >= 0; i--) {
      mostrar({ comparar: [i], marcas: marcas([[i, "i"]]), vars: { n, i } });
      paso(t.build, 3, i === inicio
        ? `i = n / 2 − 1 = ${i}: el último nodo con hijos. De ${i + 1} en adelante son hojas, y una hoja sola ya es un heap.`
        : `i = ${i}: el siguiente nodo, subiendo hacia la raíz.`);
      mostrar({ comparar: [i], marcas: marcas([[i, "i"]]), vars: { n, i } });
      paso(t.build, 4, `${t.heapify}(v, ${n}, ${i}): hundimos ${s.items[i].v} dentro de su subárbol.`);
      animarHeapify(s, t, n, i, llamadas, paso, ver, false);
    }
    mostrar({ ok: [0], vars: { n } });
    paso(t.build, 5, `¡Listo, es un ${t.nombre}! El ${t.extremo} (${s.items[0].v}) quedó en la raíz.`, final);
  }

  // ------------------------------------------------------------------
  // Dibujo: árbol arriba, arreglo abajo (los mismos elementos)
  // ------------------------------------------------------------------

  function crearLienzo(escenario) {
    const svg = document.createElementNS(SVG, "svg");
    const fija = el("div", { class: "capa-fija" });
    const lienzo = el("div", { class: "lienzo-heap" }, svg, fija);
    escenario.append(el("div", { class: "info-heap" }), el("div", { class: "marco-heap" }, lienzo));
    window.addEventListener("resize", () => escalar(escenario, lienzo));
    return lienzo;
  }

  // En pantallas angostas reducimos el dibujo en lugar de recortarlo.
  function escalar(escenario, lienzo) {
    if (!escenario.clientWidth) return; // está en un paso oculto: se mide al mostrarlo
    const ancho = Number(lienzo.dataset.ancho);
    const alto = Number(lienzo.dataset.alto);
    const disponible = escenario.clientWidth - 32;
    const k = Math.min(1, disponible / ancho);
    lienzo.style.transform = k < 1 ? `scale(${k})` : "";
    const marco = lienzo.parentElement;
    marco.style.width = `${ancho * k}px`;
    marco.style.height = `${alto * k}px`;
  }

  function dibujar(escenario, s) {
    const lienzo = escenario.querySelector(".lienzo-heap") || crearLienzo(escenario);
    const ancho = anchoPara(s.items.length);
    const { yTitulo, yCeldas, alto } = geometria(s.items.length);
    lienzo.style.width = `${ancho}px`;
    lienzo.style.height = `${alto}px`;
    lienzo.dataset.ancho = ancho;
    lienzo.dataset.alto = alto;
    escalar(escenario, lienzo);
    const vis = s.vis || {};
    const enHeap = s.tamHeap == null ? s.items.length : s.tamHeap;
    const ordenadoDesde = s.ordenadoDesde == null ? Infinity : s.ordenadoDesde;
    const estado = (i) => {
      if ((vis.intercambio || []).includes(i)) return "intercambio";
      if ((vis.ok || []).includes(i)) return "ok";
      if ((vis.comparar || []).includes(i)) return "comparando";
      if ((vis.relacionado || []).includes(i)) return "relacionado";
      return "";
    };

    // Información arriba del lienzo: llamadas activas, variables, fase y valor devuelto.
    const info = escenario.querySelector(".info-heap");
    const variables = Object.assign(s.tipo ? { tipo: TIPOS[s.tipo].nombre } : {}, vis.vars || { "v.size()": s.items.length });
    if (s.ordenadoDesde != null) variables.ordenados = s.items.length - Math.min(s.items.length, ordenadoDesde);
    info.replaceChildren(
      vis.pila && vis.pila.length
        ? el("div", { class: "pila-llamadas", "aria-label": "Llamadas en curso" },
          vis.pila.flatMap((texto, k) => [k ? "›" : "", el("span", { class: "llamada", text: texto })]))
        : "",
      DS.variables(variables),
      vis.fase ? el("p", { class: "fila-titulo", text: vis.fase }) : "",
      vis.salida != null ? el("div", { class: "salida-valor" }, "devuelve", el("div", { class: "celda encontrada", text: vis.salida })) : "");

    // Aristas padre -> hijo.
    const svg = lienzo.querySelector("svg");
    svg.replaceChildren();
    const resaltadas = [...(vis.comparar || []), ...(vis.intercambio || [])];
    for (let i = 1; i < enHeap; i++) {
      const a = posArbol(padreDe(i), ancho);
      const b = posArbol(i, ancho);
      const linea = document.createElementNS(SVG, "line");
      linea.setAttribute("x1", a.x + NODO / 2);
      linea.setAttribute("y1", a.y + NODO / 2);
      linea.setAttribute("x2", b.x + NODO / 2);
      linea.setAttribute("y2", b.y + NODO / 2);
      if (resaltadas.includes(i) && resaltadas.includes(padreDe(i))) linea.setAttribute("class", "activa");
      svg.append(linea);
    }

    // Nodos del árbol y celdas del arreglo, por id para que se deslicen al intercambiar.
    const vivosArbol = new Set();
    const vivosArreglo = new Set();
    s.items.forEach((item, i) => {
      vivosArreglo.add(item.id);
      let celda = lienzo.querySelector(`.hcelda[data-id="${item.id}"]`);
      if (!celda) {
        celda = el("div", { class: "hcelda", "data-id": item.id, style: `left:${posCelda(i)}px;top:${yCeldas}px` });
        lienzo.append(celda);
      }
      celda.textContent = item.v;
      celda.style.left = `${posCelda(i)}px`;
      celda.className = `hcelda ${estado(i)}${i >= ordenadoDesde ? " ordenado" : ""}${item.fantasma ? " fantasma" : ""}${vis.nuevo === i ? " nuevo" : ""}`;

      if (i >= enHeap) return;
      vivosArbol.add(item.id);
      const p = posArbol(i, ancho);
      let nodo = lienzo.querySelector(`.hnodo[data-id="${item.id}"]`);
      if (!nodo) {
        nodo = el("div", { class: "hnodo", "data-id": item.id, style: `left:${p.x}px;top:${p.y}px` });
        lienzo.append(nodo);
      }
      nodo.textContent = item.v;
      nodo.style.left = `${p.x}px`;
      nodo.style.top = `${p.y}px`;
      nodo.className = `hnodo ${estado(i)}${item.fantasma ? " fantasma" : ""}${vis.nuevo === i ? " nuevo" : ""}`;
    });
    for (const n of lienzo.querySelectorAll(".hcelda")) if (!vivosArreglo.has(n.dataset.id)) n.remove();
    for (const n of lienzo.querySelectorAll(".hnodo")) if (!vivosArbol.has(n.dataset.id)) n.remove();

    // Capa fija: títulos, índices y marcadores (pertenecen a la posición, no al valor).
    const fija = lienzo.querySelector(".capa-fija");
    const piezas = [
      el("span", { class: "fila-titulo", style: `left:${MARGEN}px;top:0`, text: "Como árbol" }),
      el("span", { class: "fila-titulo", style: `left:${MARGEN}px;top:${yTitulo}px`, text: "Como arreglo (así se guarda en memoria)" }),
    ];
    if (!s.items.length) piezas.push(el("span", { class: "indice", style: `left:${MARGEN}px;top:${yCeldas + 8}px`, text: "(vacío)" }));
    for (let i = 0; i < s.items.length; i++) {
      piezas.push(el("span", { class: "indice", style: `left:${posCelda(i)}px;top:${yCeldas + 36}px;width:32px;text-align:center`, text: i }));
      if (i >= enHeap) continue;
      const p = posArbol(i, ancho);
      piezas.push(el("span", { class: "indice-nodo", style: `left:${p.x}px;top:${p.y + NODO + 2}px`, text: i }));
    }
    for (const [i, texto] of Object.entries(vis.marcas || {})) {
      const k = Number(i);
      const lineas = texto.split(", ");
      piezas.push(el("span", { class: "marcador apilado", style: `left:${posCelda(k) - 8}px;top:${yCeldas - 3 - 12 * lineas.length}px;width:48px`, text: lineas.join("\n") }));
      if (k >= enHeap) continue;
      const p = posArbol(k, ancho);
      piezas.push(el("span", { class: "marca-nodo", style: `left:${p.x + NODO / 2}px;top:${p.y - 16}px`, text: texto }));
    }
    fija.replaceChildren(...piezas);
  }

  // ------------------------------------------------------------------
  // Paso 1: explorador de índices (tocar un nodo muestra padre e hijos)
  // ------------------------------------------------------------------

  function montarExplorador() {
    const caja = document.getElementById("explorador");
    if (!caja) return;
    const s = estadoDesde(EJEMPLO);
    const n = s.items.length;
    const escenario = el("div", { class: "escenario explorable" });
    const relaciones = el("div", { class: "relaciones", "aria-live": "polite" });
    let actual = 1;

    function seleccionar(i) {
      actual = (i + n) % n;
      const izq = 2 * actual + 1;
      const der = 2 * actual + 2;
      const padre = actual > 0 ? padreDe(actual) : null;
      s.vis = {
        comparar: [actual],
        relacionado: [padre, izq < n ? izq : null, der < n ? der : null].filter((k) => k != null),
        marcas: marcas([[actual, "i"], [padre, "padre"], [izq < n ? izq : null, "izq"], [der < n ? der : null, "der"]]),
        vars: { n },
      };
      dibujar(escenario, s);

      // Una fila por relación: nombre, la cuenta y lo que hay en esa posición.
      const valor = (k) => el("span", { class: "relacion-valor" },
        el("span", { class: "indice", text: `v[${k}] =` }), el("span", { class: "relacion-celda", text: s.items[k].v }));
      const fila = (nombre, cuenta, k, motivo) => el("div", { class: `relacion${nombre === "i" ? " seleccionada" : ""}${k == null || k >= n ? " ausente" : ""}` },
        el("span", { class: "relacion-nombre", text: nombre }),
        el("code", { class: "relacion-cuenta", text: cuenta }),
        k != null && k < n ? valor(k) : el("span", { class: "relacion-motivo", text: motivo }));
      relaciones.replaceChildren(
        fila("i", `i = ${actual}`, actual),
        fila("padre", actual > 0 ? `(${actual} − 1) / 2 = ${padre}` : "—", padre, "no tiene: es la raíz"),
        fila("izq", `2·${actual} + 1 = ${izq}`, izq, `no existe (${izq} ≥ n)`),
        fila("der", `2·${actual} + 2 = ${der}`, der, `no existe (${der} ≥ n)`));
    }

    escenario.addEventListener("click", (ev) => {
      const pieza = ev.target.closest(".hnodo, .hcelda");
      if (!pieza) return;
      const i = s.items.findIndex((x) => x.id === pieza.dataset.id);
      if (i >= 0) seleccionar(i);
    });
    caja.classList.add("panel", "explorador");
    caja.append(escenario, relaciones, el("div", { class: "reproduccion" },
      el("button", { class: "boton", type: "button", "aria-label": "Nodo anterior", text: "‹ i − 1", onclick: () => seleccionar(actual - 1) }),
      el("span", { text: "Toca un nodo o una celda" }),
      el("button", { class: "boton", type: "button", "aria-label": "Nodo siguiente", text: "i + 1 ›", onclick: () => seleccionar(actual + 1) })));
    seleccionar(actual);
  }

  if (typeof document !== "undefined") montarExplorador();

  // ------------------------------------------------------------------
  // Paso 3: maxHeapify detallado, línea por línea
  // ------------------------------------------------------------------

  // Un max-heap cuya raíz se reemplazó por un valor chico: solo la raíz está mal.
  function ejemploHeapify() {
    for (;;) {
      const v = construirValores(valoresAleatorios(7), TIPOS.max);
      const tope = Math.min(v[1], v[2]);
      if (tope <= 2) continue;
      v[0] = Math.floor(Math.random() * (tope - 1)) + 1;
      if (!v.slice(1).includes(v[0])) return v;
    }
  }

  DS.tema({
    contenedor: "vis-heapify",
    incremental: true,
    dibujar,
    codigo: fragmentos("maxHeapify"),
    tituloCodigo: () => "maxHeapify(v, n, i)",
    mensajeInicial: "Los subárboles de la raíz ya son max-heaps; solo la raíz está fuera de lugar. Pulsa maxHeapify(v, n, 0).",
    estadoInicial: () => estadoDesde([3, 10, 8, 1, 6, 4]),
    operaciones: [
      {
        id: "maxHeapify",
        etiqueta: "maxHeapify(v, n, 0)",
        ejecutar(s, args, paso) {
          const ver = (o) => { s.vis = o; };
          animarHeapify(s, TIPOS.max, s.items.length, 0, [], paso, ver, true);
          ver({ ok: [0] });
          paso("maxHeapify", 13, `Terminó la recursión: ahora todo el árbol es un max-heap, con ${s.items[0].v} en la raíz.`, "exito");
        },
      },
      {
        id: "nuevo",
        etiqueta: "Nuevo ejemplo",
        secundaria: true,
        ejecutar(s, args, paso) {
          Object.assign(s, estadoDesde(ejemploHeapify()));
          paso("maxHeapify", 0, "Nuevo ejemplo: otra vez, solo la raíz rompe la regla. Pulsa maxHeapify(v, n, 0).");
        },
      },
    ],
  });

  // ------------------------------------------------------------------
  // Pasos 4 y 5: buildMaxHeap y buildMinHeap
  // ------------------------------------------------------------------

  function visualizadorBuild(contenedor, tipo) {
    const t = TIPOS[tipo];
    DS.tema({
      contenedor,
      incremental: true,
      dibujar,
      codigo: fragmentos(t.build, t.heapify),
      tituloCodigo: (clave) => `${clave}()`,
      mensajeInicial: `El arreglo de main(): { ${EJEMPLO.join(", ")} }. Pulsa ${t.build}(v) para convertirlo en ${t.nombre}.`,
      estadoInicial: () => estadoDesde(EJEMPLO),
      operaciones: [
        {
          id: t.build,
          etiqueta: `${t.build}(v)`,
          ejecutar(s, args, paso) {
            animarBuild(s, t, [], paso, (o) => { s.vis = o; }, "exito");
          },
        },
        {
          id: "mezclar",
          etiqueta: "Nuevo arreglo aleatorio",
          secundaria: true,
          ejecutar(s, args, paso) {
            Object.assign(s, estadoDesde(valoresAleatorios(Math.floor(Math.random() * 5) + 6)));
            paso(t.build, 0, `Nuevo arreglo desordenado. Pulsa ${t.build}(v).`);
          },
        },
      ],
    });
  }

  visualizadorBuild("vis-build-max", "max");
  visualizadorBuild("vis-build-min", "min");

  // ------------------------------------------------------------------
  // Paso 6: insertar, extraer y consultar la raíz
  // ------------------------------------------------------------------

  function heapInicial(tipo) {
    const s = estadoDesde(construirValores(EJEMPLO, TIPOS[tipo]));
    s.tipo = tipo;
    return s;
  }

  DS.tema({
    contenedor: "vis-operaciones",
    incremental: true,
    dibujar,
    codigo: fragmentos("insertMax", "insertMin", "extractMax", "extractMin", "maxHeapify", "minHeapify", "maximum", "minimum"),
    tituloCodigo: (clave) => `${clave}()`,
    codigoInicial: ({ tipo }) => TIPOS[tipo].insert,
    mensajeInicial: ({ tipo }) => `El ${TIPOS[tipo].nombre} que dejó ${TIPOS[tipo].build}. Inserta valores o extrae la raíz varias veces.`,
    estadoInicial: ({ tipo }) => heapInicial(tipo),
    entradas: [
      { id: "tipo", etiqueta: "Tipo", opciones: [["max", "Max-heap"], ["min", "Min-heap"]], valor: "max" },
      { id: "valor", etiqueta: "Valor", min: 0, max: 99, aleatorio: true },
    ],
    operaciones: [
      {
        id: "insertar",
        etiqueta: ({ tipo }) => `${TIPOS[tipo].insert}(v, valor)`,
        usa: ["valor"],
        ejecutar(s, { valor }, paso) {
          const t = TIPOS[s.tipo];
          const clave = t.insert;
          const ver = (o) => { s.vis = o; };
          if (s.items.length >= MAXIMO) {
            paso(clave, 2, `Para que la animación quepa en pantalla, el heap llega hasta ${MAXIMO} elementos. Extrae alguno o pulsa Reiniciar.`, "error");
            return;
          }
          s.items.push({ id: nuevoId(s), v: valor });
          let i = s.items.length - 1;
          ver({ nuevo: i, vars: { valor } });
          paso(clave, 2, `v.push_back(${valor}): entra al final, en el primer hueco libre del último nivel.`);
          ver({ nuevo: i, marcas: marcas([[i, "i"]]), vars: { valor, i } });
          paso(clave, 3, `i = v.size() − 1 = ${i}: la posición del valor nuevo.`);
          for (;;) {
            if (i === 0) {
              ver({ ok: [0], marcas: marcas([[0, "i"]]), vars: { valor, i } });
              paso(clave, 6, `i = 0: ${valor} llegó a la raíz. Es el nuevo ${t.extremo}.`, "exito");
              return;
            }
            const padre = padreDe(i);
            const [vi, vp] = [s.items[i].v, s.items[padre].v];
            const sube = t.vaAntes(vi, vp);
            ver({ comparar: [i, padre], marcas: marcas([[i, "i"], [padre, "padre"]]), vars: { valor, i, "(i−1)/2": padre } });
            paso(clave, 6, `El padre de ${i} es (${i} − 1) / 2 = ${padre}. ¿v[padre] = ${vp} ${t.signo === ">" ? "<" : ">"} v[i] = ${vi}? `
              + (sube ? "Sí: el padre es " + (t.signo === ">" ? "menor" : "mayor") + ", hay que subir." : `No: ${vi} ya está en su lugar.`), sube ? "" : "exito");
            if (!sube) return;
            intercambiar(s, i, padre);
            ver({ intercambio: [i, padre], marcas: marcas([[i, "i"], [padre, "padre"]]), vars: { valor, i, "(i−1)/2": padre } });
            paso(clave, 7, `swap: ${vi} sube a la posición ${padre} y ${vp} baja a la ${i}.`);
            i = padre;
            ver({ comparar: [i], marcas: marcas([[i, "i"]]), vars: { valor, i } });
            paso(clave, 8, `i = ${i}: seguimos desde la nueva posición de ${vi}.`);
          }
        },
      },
      {
        id: "extraer",
        etiqueta: ({ tipo }) => `${TIPOS[tipo].extract}(v)`,
        ejecutar(s, args, paso) {
          const t = TIPOS[s.tipo];
          const clave = t.extract;
          let salida = null;
          const ver = (o) => { s.vis = Object.assign({ salida }, o); };
          ver({ pila: [`${clave}(v)`] });
          if (!s.items.length) {
            paso(clave, 2, `El heap está vacío: no hay raíz que sacar. Devuelve ${t.centinela} como señal de "vacío".`, "error");
            return;
          }
          paso(clave, 2, `¿v.empty()? No: hay ${s.items.length} elemento(s).`);
          salida = s.items[0].v;
          ver({ pila: [`${clave}(v)`], comparar: [0], vars: { raiz: salida } });
          paso(clave, 4, `raiz = v[0] = ${salida}: el ${t.extremo}, lo que vamos a devolver.`);
          const n = s.items.length;
          const ultimo = s.items[n - 1];
          s.items[0] = { id: ultimo.id, v: ultimo.v };
          if (n > 1) s.items[n - 1] = { id: nuevoId(s), v: ultimo.v, fantasma: true };
          ver({ pila: [`${clave}(v)`], intercambio: [0], vars: { raiz: salida } });
          paso(clave, 5, n > 1
            ? `v[0] = v.back(): copiamos la última hoja (${ultimo.v}) a la raíz para tapar el hueco.`
            : "Era el único elemento: v.back() es la misma raíz.");
          s.items.pop();
          ver({ pila: [`${clave}(v)`], vars: { raiz: salida, "v.size()": s.items.length } });
          paso(clave, 6, n > 1
            ? `v.pop_back(): quitamos la copia del final. Pero ${ultimo.v} arriba seguramente rompe la regla…`
            : "v.pop_back(): el heap queda vacío.");
          ver({ pila: [`${clave}(v)`], comparar: s.items.length ? [0] : [], vars: { raiz: salida, "v.size()": s.items.length } });
          paso(clave, 7, `${t.heapify}(v, ${s.items.length}, 0): hundimos la nueva raíz hasta su lugar.`);
          if (s.items.length) animarHeapify(s, t, s.items.length, 0, [`${clave}(v)`], paso, ver, false);
          ver({ vars: { raiz: salida } });
          paso(clave, 9, `return ${salida}. Si sigues extrayendo, salen ${s.tipo === "max" ? "de mayor a menor" : "de menor a mayor"}.`, "exito");
        },
      },
      {
        id: "raiz",
        etiqueta: ({ tipo }) => `${TIPOS[tipo].top}(v)`,
        ejecutar(s, args, paso) {
          const t = TIPOS[s.tipo];
          if (!s.items.length) {
            paso(t.top, 2, `El heap está vacío: devuelve ${t.centinela} como señal de "no hay nada".`, "error");
            return;
          }
          paso(t.top, 2, `¿v.empty()? No.`);
          s.vis = { ok: [0], salida: s.items[0].v };
          paso(t.top, 3, `return v[0] = ${s.items[0].v}, sin sacarlo. Es O(1): el ${t.extremo} siempre está en la raíz.`, "exito");
        },
      },
    ],
  });

  // ------------------------------------------------------------------
  // Paso 7: heapSort
  // ------------------------------------------------------------------

  function estadoOrdenar(valores) {
    const s = estadoDesde(valores);
    s.tamHeap = valores.length;
    s.ordenadoDesde = valores.length;
    return s;
  }

  DS.tema({
    contenedor: "vis-heapsort",
    incremental: true,
    dibujar,
    codigo: fragmentos("heapSort", "buildMaxHeap", "maxHeapify"),
    tituloCodigo: (clave) => `${clave}()`,
    mensajeInicial: `El arreglo de main(): { ${EJEMPLO.join(", ")} }. Pulsa heapSort(v) y observa las dos fases.`,
    estadoInicial: () => estadoOrdenar(EJEMPLO),
    operaciones: [
      {
        id: "heapSort",
        etiqueta: "heapSort(v)",
        ejecutar(s, args, paso) {
          const t = TIPOS.max;
          let fase = "Fase 1 de 2: convertir el arreglo en un max-heap";
          const ver = (o) => { s.vis = Object.assign({ fase }, o); };
          const n = s.items.length;
          s.tamHeap = n;
          s.ordenadoDesde = n;
          ver({ pila: ["heapSort(v)"] });
          paso("heapSort", 2, "Primero, buildMaxHeap(v): así el mayor de todos queda en v[0].");
          animarBuild(s, t, ["heapSort(v)"], paso, ver, "");

          fase = "Fase 2 de 2: mandar el mayor al final y reparar";
          for (let i = n - 1; i > 0; i--) {
            ver({ pila: ["heapSort(v)"], comparar: [0, i], marcas: marcas([[0, "0"], [i, "i"]]), vars: { i } });
            paso("heapSort", 3, i === n - 1
              ? `i = v.size() − 1 = ${i}: la última posición. El heap ocupa v[0..${i}].`
              : `i = ${i}: el heap ocupa v[0..${i}]; de ${i + 1} en adelante ya está ordenado.`);
            const mayor = s.items[0].v;
            intercambiar(s, 0, i);
            ver({ pila: ["heapSort(v)"], intercambio: [0, i], marcas: marcas([[0, "0"], [i, "i"]]), vars: { i } });
            paso("heapSort", 4, `swap(v[0], v[${i}]): el mayor (${mayor}) va a la posición ${i}, que es su lugar definitivo.`);
            s.tamHeap = i;
            s.ordenadoDesde = i;
            ver({ pila: ["heapSort(v)"], comparar: [0], marcas: marcas([[0, "i"]]), vars: { i } });
            paso("heapSort", 5, `El heap se achica a ${i} elemento(s). maxHeapify(v, ${i}, 0) hunde la nueva raíz (${s.items[0].v}).`);
            animarHeapify(s, t, i, 0, ["heapSort(v)"], paso, ver, false);
          }
          s.tamHeap = 0;
          s.ordenadoDesde = 0;
          fase = "";
          ver({ vars: { i: 0 } });
          paso("heapSort", 3, `i = 0 ya no cumple i > 0: v[0] es el menor y ya está en su lugar. ¡Ordenado! { ${s.items.map((x) => x.v).join(", ")} }`, "exito");
        },
      },
      {
        id: "mezclar",
        etiqueta: "Nuevo arreglo aleatorio",
        secundaria: true,
        ejecutar(s, args, paso) {
          Object.assign(s, estadoOrdenar(valoresAleatorios(Math.floor(Math.random() * 4) + 6)));
          paso("heapSort", 0, "Nuevo arreglo desordenado. Pulsa heapSort(v).");
        },
      },
    ],
  });
})();
