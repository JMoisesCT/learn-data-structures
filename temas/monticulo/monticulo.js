// Lección del montículo (max-heap / min-heap) y de heapsort, en pasos.
// Los fragmentos de código deben coincidir línea por línea con
// ejemplos/cpp/monticulo.cpp (scripts/verificar-fragmentos.mjs lo revisa).
(function () {
  const { el, tr } = DS;
  const MAXIMO = 15; // 4 niveles: lo que cabe en pantalla
  const NODO = 38;
  const NIVEL = 50;
  // Con 4 niveles (8 o más elementos) el árbol se abre más a lo ancho: así las
  // hojas, sus marcas y los índices no se tocan.
  const anchoArbol = (niveles) => (niveles >= 4 ? 560 : 400);
  const PASO_CELDA = 36;
  const MARGEN = 12;
  const Y_ARBOL = 22;
  const SVG = "http://www.w3.org/2000/svg";
  const EJEMPLO = [3, 10, 1, 8, 6, 4]; // el mismo arreglo que usa main()

  // ------------------------------------------------------------------
  // Fragmentos de C++ (copiados de ejemplos/cpp/monticulo.cpp y de
  // ejemplos/cpp/en/heap.cpp)
  // ------------------------------------------------------------------

  const CODIGO = tr({
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
  }, {
    maxHeapify: `
      void maxHeapify(vector<int>& v, int n, int i) {
          int largest = i;
          int left = 2 * i + 1;
          int right = 2 * i + 2;

          if (left < n && v[left] > v[largest]) largest = left;
          if (right < n && v[right] > v[largest]) largest = right;

          if (largest != i) {
              swap(v[i], v[largest]);
              maxHeapify(v, n, largest);
          }
      }`,
    minHeapify: `
      void minHeapify(vector<int>& v, int n, int i) {
          int smallest = i;
          int left = 2 * i + 1;
          int right = 2 * i + 2;

          if (left < n && v[left] < v[smallest]) smallest = left;
          if (right < n && v[right] < v[smallest]) smallest = right;

          if (smallest != i) {
              swap(v[i], v[smallest]);
              minHeapify(v, n, smallest);   // goes down recursively
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
      void insertMax(vector<int>& v, int value) {
          v.push_back(value);
          int i = v.size() - 1;

          // Rise while the parent is smaller
          while (i > 0 && v[(i - 1) / 2] < v[i]) {
              swap(v[i], v[(i - 1) / 2]);
              i = (i - 1) / 2;
          }
      }`,
    insertMin: `
      void insertMin(vector<int>& v, int value) {
          v.push_back(value);
          int i = v.size() - 1;

          // Rise while the parent is larger
          while (i > 0 && v[(i - 1) / 2] > v[i]) {
              swap(v[i], v[(i - 1) / 2]);
              i = (i - 1) / 2;
          }
      }`,
    maximum: `
      int maximum(vector<int>& v) {
          if (v.empty()) return INT_MIN;
          return v[0];   // root of the max-heap
      }`,
    minimum: `
      int minimum(vector<int>& v) {
          if (v.empty()) return INT_MAX;
          return v[0];   // root of the min-heap
      }`,
    extractMax: `
      int extractMax(vector<int>& v) {
          if (v.empty()) return INT_MIN;

          int root = v[0];
          v[0] = v.back();
          v.pop_back();
          maxHeapify(v, v.size(), 0);

          return root;
      }`,
    extractMin: `
      int extractMin(vector<int>& v) {
          if (v.empty()) return INT_MAX;

          int root = v[0];
          v[0] = v.back();
          v.pop_back();
          minHeapify(v, v.size(), 0);

          return root;
      }`,
    heapSort: `
      void heapSort(vector<int>& v) {
          buildMaxHeap(v);
          for (int i = v.size() - 1; i > 0; i--) {
              swap(v[0], v[i]);
              maxHeapify(v, i, 0);
          }
      }`,
  });

  const fragmentos = (...claves) => Object.fromEntries(claves.map((c) => [c, CODIGO[c]]));

  // Nombres del C++ que se dibujan (variables y marcas). Los estados usan los
  // de español y se traducen al pintar, así son iguales en los dos idiomas.
  const NOMBRES = {
    izq: "left", der: "right", mayor: "largest", menor: "smallest", padre: "parent",
    valor: "value", raiz: "root", tipo: "type", ordenados: "sorted",
  };
  const ident = (k) => tr(k, NOMBRES[k] || k);
  const traducirVars = (vars) => Object.fromEntries(Object.entries(vars).map(([k, v]) => [ident(k), v]));
  // "i, mayor" → "i, largest".
  const traducirMarca = (texto) => texto.split(", ").map(ident).join(", ");

  // Lo que cambia entre max-heap y min-heap. elegido es la variable del C++
  // (mayor / menor); palabra, cómo se dice en un mensaje ("es el mayor").
  const TIPOS = {
    max: {
      nombre: "max-heap", heapify: "maxHeapify", build: "buildMaxHeap", insert: "insertMax",
      extract: "extractMax", top: "maximum", elegido: "mayor", palabra: tr("mayor", "largest"),
      comparativo: tr("mayor", "larger"), extremo: tr("máximo", "maximum"),
      centinela: "INT_MIN", signo: ">", vaAntes: (a, b) => a > b,
    },
    min: {
      nombre: "min-heap", heapify: "minHeapify", build: "buildMinHeap", insert: "insertMin",
      extract: "extractMin", top: "minimum", elegido: "menor", palabra: tr("menor", "smallest"),
      comparativo: tr("menor", "smaller"), extremo: tr("mínimo", "minimum"),
      centinela: "INT_MAX", signo: "<", vaAntes: (a, b) => a < b,
    },
  };

  // ------------------------------------------------------------------
  // Utilidades compartidas
  // ------------------------------------------------------------------

  const nivel = (i) => Math.floor(Math.log2(i + 1));
  const padreDe = (i) => Math.floor((i - 1) / 2);

  // El lienzo solo se ensancha si el arreglo no cabe bajo el árbol.
  const anchoPara = (n, niveles) => Math.max(anchoArbol(niveles), n * PASO_CELDA) + 2 * MARGEN;

  function posArbol(i, ancho, niveles) {
    const d = nivel(i);
    const p = i - (2 ** d - 1);
    const w = anchoArbol(niveles);
    const x = (ancho - w) / 2 + (p + 0.5) * (w / 2 ** d) - NODO / 2;
    return { x, y: Y_ARBOL + d * NIVEL };
  }

  const posCelda = (i) => MARGEN + i * PASO_CELDA;

  const nivelesPara = (n) => (n > 1 ? nivel(n - 1) + 1 : 1);

  // Antes de cada operación se anotan los niveles que puede llegar a tener el
  // árbol (insert agrega uno): el dibujo reserva ese alto desde el principio.
  function tema(cfg) {
    DS.tema(Object.assign({}, cfg, {
      operaciones: cfg.operaciones.map((op) => Object.assign({}, op, {
        ejecutar(s, args, paso) {
          s.nivelesMin = nivelesPara(s.items.length + (op.id === "insertar" ? 1 : 0));
          op.ejecutar(s, args, paso);
        },
      })),
    }));
  }

  // El lienzo solo es tan alto como los niveles que ocupa el árbol.
  function geometria(niveles) {
    const yTitulo = Y_ARBOL + (niveles - 1) * NIVEL + NODO + 18;
    const yCeldas = yTitulo + 48; // deja lugar para dos líneas de marcas
    return { yTitulo, yCeldas, alto: yCeldas + 58 }; // con los índices debajo de las celdas
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
    const E = ident(e); // cómo se llama en el código que se ve
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
      paso(clave, 2, tr(`${e} = i = ${i}. Suponemos que v[${i}] = ${v(i)} es el ${t.palabra} y lo comprobamos contra sus hijos.`,
        `${E} = i = ${i}. We assume v[${i}] = ${v(i)} is the ${t.palabra} and check it against its children.`));
      mostrar({ comparar: [i, ...hijos], marcas: etiquetas(i), vars: vars(i) });
      paso(clave, 4, tr(`Sus hijos estarían en izq = 2·${i} + 1 = ${izq} y der = 2·${i} + 2 = ${der}.`,
        `Its children would be at left = 2·${i} + 1 = ${izq} and right = 2·${i} + 2 = ${der}.`)
        + (!hijos.length ? tr(` Ninguno es < n = ${n}: es una hoja.`, ` Neither is < n = ${n}: it's a leaf.`)
          : hijos.length === 1 ? tr(` der no es < n = ${n}: solo tiene hijo izquierdo.`, ` right isn't < n = ${n}: it only has a left child.`) : ""));
      for (const [k, nombre, linea] of [[izq, "izq", 6], [der, "der", 7]]) {
        if (k >= n) {
          mostrar({ comparar: [i], marcas: etiquetas(elegido), vars: vars(elegido) });
          paso(clave, linea, tr(`${nombre} = ${k} no es < n = ${n}: ese hijo no existe, no se compara.`,
            `${ident(nombre)} = ${k} isn't < n = ${n}: that child doesn't exist, it isn't compared.`));
          continue;
        }
        const antes = elegido;
        const gana = t.vaAntes(v(k), v(antes));
        if (gana) elegido = k;
        mostrar({ comparar: [antes, k], marcas: etiquetas(elegido), vars: vars(elegido) });
        paso(clave, linea, tr(`¿v[${nombre}] = ${v(k)} ${t.signo} v[${e}] = ${v(antes)}? `
          + (gana ? `Sí: ahora ${e} = ${nombre} = ${k}.` : `No: ${e} se queda en ${antes}.`),
        `v[${ident(nombre)}] = ${v(k)} ${t.signo} v[${E}] = ${v(antes)}? `
          + (gana ? `Yes: now ${E} = ${ident(nombre)} = ${k}.` : `No: ${E} stays at ${antes}.`)));
      }
    } else {
      if (izq < n && t.vaAntes(v(izq), v(elegido))) elegido = izq;
      if (der < n && t.vaAntes(v(der), v(elegido))) elegido = der;
      mostrar({ comparar: [i, ...hijos], marcas: etiquetas(elegido), vars: vars(elegido) });
      paso(clave, 7, hijos.length
        ? tr(`Comparamos v[${i}] = ${v(i)} con ${hijos.length === 2 ? "sus hijos" : "su único hijo"} (${hijos.map(v).join(" y ")}): el ${t.palabra} es ${v(elegido)}.`,
          `We compare v[${i}] = ${v(i)} with ${hijos.length === 2 ? "its children" : "its only child"} (${hijos.map(v).join(" and ")}): the ${t.palabra} is ${v(elegido)}.`)
        : tr(`v[${i}] = ${v(i)} es una hoja: izq = ${izq} ya no es < n = ${n}.`, `v[${i}] = ${v(i)} is a leaf: left = ${izq} is no longer < n = ${n}.`));
    }

    if (elegido === i) {
      mostrar({ ok: [i], marcas: marcas([[i, "i"], [i, e]]), vars: vars(i) });
      paso(clave, 9, hijos.length
        ? tr(`${e} == i: ${v(i)} ya es el ${t.palabra} entre él y sus hijos. La regla se cumple: termina.`,
          `${E} == i: ${v(i)} is already the ${t.palabra} among itself and its children. The rule holds: it ends.`)
        : tr(`${e} == i: una hoja no puede bajar más. Termina.`, `${E} == i: a leaf can't go down any further. It ends.`));
      return;
    }

    if (detallado) {
      mostrar({ comparar: [i, elegido], marcas: etiquetas(elegido), vars: vars(elegido) });
      paso(clave, 9, tr(`${e} (${elegido}) ≠ i (${i}): un hijo es ${t.comparativo} que v[${i}], así que ${v(i)} tiene que bajar.`,
        `${E} (${elegido}) ≠ i (${i}): a child is ${t.comparativo} than v[${i}], so ${v(i)} has to go down.`));
    }
    const baja = v(i);
    const sube = v(elegido);
    intercambiar(s, i, elegido);
    mostrar({ intercambio: [i, elegido], marcas: marcas([[i, "i"], [elegido, e]]), vars: vars(elegido) });
    paso(clave, 10, tr(`swap(v[${i}], v[${e}]): ${sube} sube y ${baja} baja a la posición ${elegido}.`,
      `swap(v[${i}], v[${E}]): ${sube} goes up and ${baja} goes down to position ${elegido}.`));
    mostrar({ comparar: [elegido], marcas: marcas([[elegido, e]]), vars: vars(elegido) });
    paso(clave, 11, tr(`Llamada recursiva ${clave}(v, ${n}, ${elegido}): ${baja} sigue bajando por ese subárbol.`,
      `Recursive call ${clave}(v, ${n}, ${elegido}): ${baja} keeps going down that subtree.`));
    animarHeapify(s, t, n, elegido, llamadas, paso, ver, detallado);
  }

  // Animación de buildMaxHeap / buildMinHeap.
  function animarBuild(s, t, pila, paso, ver, final) {
    const n = s.items.length;
    const llamadas = [...pila, `${t.build}(v)`];
    const mostrar = (o) => ver(Object.assign({ pila: llamadas }, o));
    const inicio = Math.floor(n / 2) - 1;
    mostrar({ vars: { n } });
    paso(t.build, 2, tr(`n = ${n}. Visto como árbol, el arreglo todavía no cumple la regla del ${t.nombre}.`,
      `n = ${n}. Seen as a tree, the array doesn't follow the ${t.nombre} rule yet.`));
    for (let i = inicio; i >= 0; i--) {
      mostrar({ comparar: [i], marcas: marcas([[i, "i"]]), vars: { n, i } });
      paso(t.build, 3, i === inicio
        ? tr(`i = n / 2 − 1 = ${i}: el último nodo con hijos. De ${i + 1} en adelante son hojas, y una hoja sola ya es un heap.`,
          `i = n / 2 − 1 = ${i}: the last node with children. From ${i + 1} on they're leaves, and a leaf on its own is already a heap.`)
        : tr(`i = ${i}: el siguiente nodo, subiendo hacia la raíz.`, `i = ${i}: the next node, going up toward the root.`));
      mostrar({ comparar: [i], marcas: marcas([[i, "i"]]), vars: { n, i } });
      paso(t.build, 4, tr(`${t.heapify}(v, ${n}, ${i}): hundimos ${s.items[i].v} dentro de su subárbol.`, `${t.heapify}(v, ${n}, ${i}): we sink ${s.items[i].v} into its subtree.`));
      animarHeapify(s, t, n, i, llamadas, paso, ver, false);
    }
    mostrar({ ok: [0], vars: { n } });
    paso(t.build, 5, tr(`¡Listo, es un ${t.nombre}! El ${t.extremo} (${s.items[0].v}) quedó en la raíz. Cuesta solo O(n): la mayoría de los nodos están abajo y casi no bajan.`,
      `Done, it's a ${t.nombre}! The ${t.extremo} (${s.items[0].v}) ended up at the root. It costs only O(n): most nodes are near the bottom and barely go down.`), final);
  }

  // ------------------------------------------------------------------
  // Dibujo: árbol arriba, arreglo abajo (los mismos elementos)
  // ------------------------------------------------------------------

  function crearLienzo(escenario) {
    const svg = document.createElementNS(SVG, "svg");
    const fija = el("div", { class: "capa-fija" });
    const lienzo = el("div", { class: "lienzo-heap" }, svg, fija);
    escenario.append(el("div", { class: "info-heap", "data-alto-estable": true }), el("div", { class: "marco-heap" }, lienzo));
    return lienzo;
  }

  if (typeof window !== "undefined") {
    window.addEventListener("resize", () => {
      for (const lienzo of document.querySelectorAll(".lienzo-heap")) escalar(lienzo.closest(".escenario"), lienzo);
    });
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
    // Durante una operación los niveles no disminuyen (s.nivelesMin): si el árbol
    // se achica, el dibujo no salta hacia arriba. Al reiniciar se vuelve a medir.
    const niveles = Math.max(s.nivelesMin || 1, nivelesPara(s.items.length));
    const ancho = anchoPara(s.items.length, niveles);
    const { yTitulo, yCeldas, alto } = geometria(niveles);
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
        ? el("div", { class: "pila-llamadas", "aria-label": tr("Llamadas en curso", "Calls in progress") },
          vis.pila.flatMap((texto, k) => [k ? "›" : "", el("span", { class: "llamada", text: texto })]))
        : "",
      DS.variables(traducirVars(variables)),
      vis.fase ? el("p", { class: "fila-titulo", text: vis.fase }) : "",
      vis.salida != null ? el("div", { class: "salida-valor" }, tr("devuelve", "returns"), el("div", { class: "celda encontrada", text: vis.salida })) : "");

    // Aristas padre -> hijo.
    const svg = lienzo.querySelector("svg");
    svg.replaceChildren();
    const resaltadas = [...(vis.comparar || []), ...(vis.intercambio || [])];
    for (let i = 1; i < enHeap; i++) {
      const a = posArbol(padreDe(i), ancho, niveles);
      const b = posArbol(i, ancho, niveles);
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
      // También el top: si el árbol gana un nivel, la fila del arreglo baja.
      celda.style.left = `${posCelda(i)}px`;
      celda.style.top = `${yCeldas}px`;
      celda.className = `hcelda ${estado(i)}${i >= ordenadoDesde ? " ordenado" : ""}${item.fantasma ? " fantasma" : ""}${vis.nuevo === i ? " nuevo" : ""}`;

      if (i >= enHeap) return;
      vivosArbol.add(item.id);
      const p = posArbol(i, ancho, niveles);
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
    // Lo que sale se desvanece antes de borrarse (si vuelve, por ejemplo al
    // retroceder un paso, se reusa y ya no se borra).
    const retirar = (n) => {
      if (n.classList.contains("saliendo")) return;
      n.classList.add("saliendo");
      setTimeout(() => { if (n.classList.contains("saliendo")) n.remove(); }, 350);
    };
    for (const n of lienzo.querySelectorAll(".hcelda")) if (!vivosArreglo.has(n.dataset.id)) retirar(n);
    for (const n of lienzo.querySelectorAll(".hnodo")) if (!vivosArbol.has(n.dataset.id)) retirar(n);

    // Capa fija: títulos, índices y marcadores (pertenecen a la posición, no al valor).
    const fija = lienzo.querySelector(".capa-fija");
    const piezas = [
      el("span", { class: "fila-titulo", style: `left:${MARGEN}px;top:0`, text: tr("Como árbol", "As a tree") }),
      el("span", { class: "fila-titulo", style: `left:${MARGEN}px;top:${yTitulo}px`, text: tr("Como arreglo (así se guarda en memoria)", "As an array (how it's stored in memory)") }),
    ];
    if (!s.items.length) piezas.push(el("span", { class: "indice", style: `left:${MARGEN}px;top:${yCeldas + 8}px`, text: tr("(vacío)", "(empty)") }));
    for (let i = 0; i < s.items.length; i++) {
      piezas.push(el("span", { class: "indice", style: `left:${posCelda(i)}px;top:${yCeldas + 36}px;width:32px;text-align:center`, text: i }));
      if (i >= enHeap) continue;
      const p = posArbol(i, ancho, niveles);
      piezas.push(el("span", { class: "indice-nodo", style: `left:${p.x}px;top:${p.y + NODO + 2}px`, text: i }));
    }
    for (const [i, marca] of Object.entries(vis.marcas || {})) {
      const k = Number(i);
      const texto = traducirMarca(marca);
      const lineas = texto.split(", ");
      piezas.push(el("span", { class: "marcador apilado", style: `left:${posCelda(k) - 8}px;top:${yCeldas - 3 - 12 * lineas.length}px;width:48px`, text: lineas.join("\n") }));
      if (k >= enHeap) continue;
      const p = posArbol(k, ancho, niveles);
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
        el("span", { class: "relacion-nombre", text: ident(nombre) }),
        el("code", { class: "relacion-cuenta", text: cuenta }),
        k != null && k < n ? valor(k) : el("span", { class: "relacion-motivo", text: motivo }));
      relaciones.replaceChildren(
        fila("i", `i = ${actual}`, actual),
        fila("padre", actual > 0 ? `(${actual} − 1) / 2 = ${padre}` : "—", padre, tr("no tiene: es la raíz", "none: it's the root")),
        fila("izq", `2·${actual} + 1 = ${izq}`, izq, tr(`no existe (${izq} ≥ n)`, `doesn't exist (${izq} ≥ n)`)),
        fila("der", `2·${actual} + 2 = ${der}`, der, tr(`no existe (${der} ≥ n)`, `doesn't exist (${der} ≥ n)`)));
    }

    escenario.addEventListener("click", (ev) => {
      const pieza = ev.target.closest(".hnodo, .hcelda");
      if (!pieza) return;
      const i = s.items.findIndex((x) => x.id === pieza.dataset.id);
      if (i >= 0) seleccionar(i);
    });
    caja.classList.add("panel", "explorador");
    caja.append(escenario, relaciones, el("div", { class: "reproduccion" },
      el("button", { class: "boton", type: "button", "aria-label": tr("Nodo anterior", "Previous node"), text: "‹ i − 1", onclick: () => seleccionar(actual - 1) }),
      el("span", { text: tr("Toca un nodo o una celda", "Tap a node or a cell") }),
      el("button", { class: "boton", type: "button", "aria-label": tr("Nodo siguiente", "Next node"), text: "i + 1 ›", onclick: () => seleccionar(actual + 1) })));
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

  tema({
    contenedor: "vis-heapify",
    incremental: true,
    dibujar,
    codigo: fragmentos("maxHeapify"),
    tituloCodigo: () => "maxHeapify(v, n, i)",
    mensajeInicial: tr("Los subárboles de la raíz ya son max-heaps; solo la raíz está fuera de lugar. Pulsa Ejecutar.",
      "The root's subtrees are already max-heaps; only the root is out of place. Press Run."),
    estadoInicial: () => estadoDesde([3, 10, 8, 1, 6, 4]),
    operaciones: [
      {
        id: "maxHeapify",
        etiqueta: "maxHeapify(v, n, 0)",
        ejecutar(s, args, paso) {
          const ver = (o) => { s.vis = o; };
          animarHeapify(s, TIPOS.max, s.items.length, 0, [], paso, ver, true);
          ver({ ok: [0] });
          paso("maxHeapify", 13, tr(`Terminó la recursión: ahora todo el árbol es un max-heap, con ${s.items[0].v} en la raíz.`,
            `The recursion is over: now the whole tree is a max-heap, with ${s.items[0].v} at the root.`), "exito");
        },
      },
      {
        id: "nuevo",
        etiqueta: tr("Nuevo ejemplo", "New example"),
        secundaria: true,
        ejecutar(s, args, paso) {
          Object.assign(s, estadoDesde(ejemploHeapify()));
          paso("maxHeapify", 0, tr("Nuevo ejemplo: otra vez, solo la raíz rompe la regla. Pulsa Ejecutar.", "New example: once again, only the root breaks the rule. Press Run."));
        },
      },
    ],
  });

  // ------------------------------------------------------------------
  // Pasos 4 y 5: buildMaxHeap y buildMinHeap
  // ------------------------------------------------------------------

  function visualizadorBuild(contenedor, tipo) {
    const t = TIPOS[tipo];
    tema({
      contenedor,
      incremental: true,
      dibujar,
      codigo: fragmentos(t.build, t.heapify),
      tituloCodigo: (clave) => `${clave}()`,
      mensajeInicial: tr(`El arreglo de main(): { ${EJEMPLO.join(", ")} }. Pulsa Ejecutar para convertirlo en ${t.nombre}.`,
        `The array from main(): { ${EJEMPLO.join(", ")} }. Press Run to turn it into a ${t.nombre}.`),
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
          etiqueta: tr("Nuevo arreglo aleatorio", "New random array"),
          secundaria: true,
          ejecutar(s, args, paso) {
            Object.assign(s, estadoDesde(valoresAleatorios(Math.floor(Math.random() * 5) + 6)));
            paso(t.build, 0, tr("Nuevo arreglo desordenado. Pulsa Ejecutar.", "New unsorted array. Press Run."));
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

  tema({
    contenedor: "vis-operaciones",
    incremental: true,
    dibujar,
    codigo: fragmentos("insertMax", "insertMin", "extractMax", "extractMin", "maxHeapify", "minHeapify", "maximum", "minimum"),
    tituloCodigo: (clave) => `${clave}()`,
    codigoInicial: ({ tipo }) => TIPOS[tipo].insert,
    mensajeInicial: ({ tipo }) => tr(`El ${TIPOS[tipo].nombre} que dejó ${TIPOS[tipo].build}. Inserta valores o extrae la raíz varias veces.`,
      `The ${TIPOS[tipo].nombre} left by ${TIPOS[tipo].build}. Insert values or extract the root several times.`),
    estadoInicial: ({ tipo }) => heapInicial(tipo),
    entradas: [
      // Textos cortos para que los controles quepan en una fila (el botón ya dice "valor").
      { id: "tipo", etiqueta: "", opciones: [["max", "max"], ["min", "min"]], valor: "max" },
      { id: "valor", etiqueta: "", min: 0, max: 99, aleatorio: true },
    ],
    operaciones: [
      {
        id: "insertar",
        etiqueta: ({ tipo }) => `${TIPOS[tipo].insert}(v, ${ident("valor")})`,
        llamada: ({ tipo, valor }) => `${TIPOS[tipo].insert}(v, ${valor})`,
        usa: ["valor"],
        ejecutar(s, { valor }, paso) {
          const t = TIPOS[s.tipo];
          const clave = t.insert;
          const ver = (o) => { s.vis = o; };
          if (s.items.length >= MAXIMO) {
            paso(clave, 2, tr(`Para que la animación quepa en pantalla, el heap llega hasta ${MAXIMO} elementos. Extrae alguno o pulsa Reiniciar.`,
              `So that the animation fits on screen, the heap goes up to ${MAXIMO} elements. Extract some or press Reset.`), "error");
            return;
          }
          s.items.push({ id: nuevoId(s), v: valor });
          let i = s.items.length - 1;
          ver({ nuevo: i, vars: { valor } });
          paso(clave, 2, tr(`v.push_back(${valor}): entra al final, en el primer hueco libre del último nivel.`, `v.push_back(${valor}): it goes in at the end, in the first free spot of the last level.`));
          ver({ nuevo: i, marcas: marcas([[i, "i"]]), vars: { valor, i } });
          paso(clave, 3, tr(`i = v.size() − 1 = ${i}: la posición del valor nuevo.`, `i = v.size() − 1 = ${i}: the position of the new value.`));
          for (;;) {
            if (i === 0) {
              ver({ ok: [0], marcas: marcas([[0, "i"]]), vars: { valor, i } });
              paso(clave, 6, tr(`i = 0: ${valor} llegó a la raíz. Es el nuevo ${t.extremo}.`, `i = 0: ${valor} reached the root. It's the new ${t.extremo}.`), "exito");
              return;
            }
            const padre = padreDe(i);
            const [vi, vp] = [s.items[i].v, s.items[padre].v];
            const sube = t.vaAntes(vi, vp);
            ver({ comparar: [i, padre], marcas: marcas([[i, "i"], [padre, "padre"]]), vars: { valor, i, "(i−1)/2": padre } });
            const inverso = t.signo === ">" ? "<" : ">";
            paso(clave, 6, tr(`El padre de ${i} es (${i} − 1) / 2 = ${padre}. ¿v[padre] = ${vp} ${inverso} v[i] = ${vi}? `
              + (sube ? `Sí: el padre es ${t.signo === ">" ? "menor" : "mayor"}, hay que subir.` : `No: ${vi} ya está en su lugar.`),
            `The parent of ${i} is (${i} − 1) / 2 = ${padre}. v[parent] = ${vp} ${inverso} v[i] = ${vi}? `
              + (sube ? `Yes: the parent is ${t.signo === ">" ? "smaller" : "larger"}, it has to rise.` : `No: ${vi} is already in its place.`)), sube ? "" : "exito");
            if (!sube) return;
            intercambiar(s, i, padre);
            ver({ intercambio: [i, padre], marcas: marcas([[i, "i"], [padre, "padre"]]), vars: { valor, i, "(i−1)/2": padre } });
            paso(clave, 7, tr(`swap: ${vi} sube a la posición ${padre} y ${vp} baja a la ${i}.`, `swap: ${vi} goes up to position ${padre} and ${vp} goes down to ${i}.`));
            i = padre;
            ver({ comparar: [i], marcas: marcas([[i, "i"]]), vars: { valor, i } });
            paso(clave, 8, tr(`i = ${i}: seguimos desde la nueva posición de ${vi}.`, `i = ${i}: we continue from ${vi}'s new position.`));
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
            paso(clave, 2, tr(`El heap está vacío: no hay raíz que sacar. Devuelve ${t.centinela} como señal de "vacío".`,
              `The heap is empty: there's no root to take out. It returns ${t.centinela} as a signal of "empty".`), "error");
            return;
          }
          paso(clave, 2, tr(`¿v.empty()? No: hay ${s.items.length} elemento(s).`, `v.empty()? No: there are ${s.items.length} element(s).`));
          salida = s.items[0].v;
          ver({ pila: [`${clave}(v)`], comparar: [0], vars: { raiz: salida } });
          paso(clave, 4, tr(`raiz = v[0] = ${salida}: el ${t.extremo}, lo que vamos a devolver.`, `root = v[0] = ${salida}: the ${t.extremo}, what we're going to return.`));
          const n = s.items.length;
          const ultimo = s.items[n - 1];
          s.items[0] = { id: ultimo.id, v: ultimo.v };
          if (n > 1) s.items[n - 1] = { id: nuevoId(s), v: ultimo.v, fantasma: true };
          ver({ pila: [`${clave}(v)`], intercambio: [0], vars: { raiz: salida } });
          paso(clave, 5, n > 1
            ? tr(`v[0] = v.back(): copiamos la última hoja (${ultimo.v}) a la raíz para tapar el hueco.`, `v[0] = v.back(): we copy the last leaf (${ultimo.v}) to the root to fill the gap.`)
            : tr("Era el único elemento: v.back() es la misma raíz.", "It was the only element: v.back() is the root itself."));
          s.items.pop();
          ver({ pila: [`${clave}(v)`], vars: { raiz: salida, "v.size()": s.items.length } });
          paso(clave, 6, n > 1
            ? tr(`v.pop_back(): quitamos la copia del final. Pero ${ultimo.v} arriba seguramente rompe la regla…`, `v.pop_back(): we remove the copy at the end. But ${ultimo.v} at the top probably breaks the rule…`)
            : tr("v.pop_back(): el heap queda vacío.", "v.pop_back(): the heap is left empty."));
          ver({ pila: [`${clave}(v)`], comparar: s.items.length ? [0] : [], vars: { raiz: salida, "v.size()": s.items.length } });
          paso(clave, 7, tr(`${t.heapify}(v, ${s.items.length}, 0): hundimos la nueva raíz hasta su lugar.`, `${t.heapify}(v, ${s.items.length}, 0): we sink the new root to its place.`));
          if (s.items.length) animarHeapify(s, t, s.items.length, 0, [`${clave}(v)`], paso, ver, false);
          ver({ vars: { raiz: salida } });
          paso(clave, 9, tr(`return ${salida}. Si sigues extrayendo, salen ${s.tipo === "max" ? "de mayor a menor" : "de menor a mayor"}.`,
            `return ${salida}. If you keep extracting, they come out ${s.tipo === "max" ? "from largest to smallest" : "from smallest to largest"}.`), "exito");
        },
      },
      {
        id: "raiz",
        etiqueta: ({ tipo }) => `${TIPOS[tipo].top}(v)`,
        ejecutar(s, args, paso) {
          const t = TIPOS[s.tipo];
          if (!s.items.length) {
            paso(t.top, 2, tr(`El heap está vacío: devuelve ${t.centinela} como señal de "no hay nada".`, `The heap is empty: it returns ${t.centinela} as a signal of "there's nothing".`), "error");
            return;
          }
          paso(t.top, 2, tr("¿v.empty()? No.", "v.empty()? No."));
          s.vis = { ok: [0], salida: s.items[0].v };
          paso(t.top, 3, tr(`return v[0] = ${s.items[0].v}, sin sacarlo. Es O(1): el ${t.extremo} siempre está en la raíz.`,
            `return v[0] = ${s.items[0].v}, without taking it out. It's O(1): the ${t.extremo} is always at the root.`), "exito");
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

  tema({
    contenedor: "vis-heapsort",
    incremental: true,
    dibujar,
    codigo: fragmentos("heapSort", "buildMaxHeap", "maxHeapify"),
    tituloCodigo: (clave) => `${clave}()`,
    mensajeInicial: tr(`El arreglo de main(): { ${EJEMPLO.join(", ")} }. Pulsa Ejecutar y observa las dos fases.`,
      `The array from main(): { ${EJEMPLO.join(", ")} }. Press Run and watch the two phases.`),
    estadoInicial: () => estadoOrdenar(EJEMPLO),
    operaciones: [
      {
        id: "heapSort",
        etiqueta: "heapSort(v)",
        ejecutar(s, args, paso) {
          const t = TIPOS.max;
          let fase = tr("Fase 1 de 2: convertir el arreglo en un max-heap", "Phase 1 of 2: turn the array into a max-heap");
          const ver = (o) => { s.vis = Object.assign({ fase }, o); };
          const n = s.items.length;
          s.tamHeap = n;
          s.ordenadoDesde = n;
          ver({ pila: ["heapSort(v)"] });
          paso("heapSort", 2, tr("Primero, buildMaxHeap(v): así el mayor de todos queda en v[0].", "First, buildMaxHeap(v): that way the largest of all ends up in v[0]."));
          animarBuild(s, t, ["heapSort(v)"], paso, ver, "");

          fase = tr("Fase 2 de 2: mandar el mayor al final y reparar", "Phase 2 of 2: send the largest to the end and repair");
          for (let i = n - 1; i > 0; i--) {
            ver({ pila: ["heapSort(v)"], comparar: [0, i], marcas: marcas([[0, "0"], [i, "i"]]), vars: { i } });
            paso("heapSort", 3, i === n - 1
              ? tr(`i = v.size() − 1 = ${i}: la última posición. El heap ocupa v[0..${i}].`, `i = v.size() − 1 = ${i}: the last position. The heap takes up v[0..${i}].`)
              : tr(`i = ${i}: el heap ocupa v[0..${i}]; de ${i + 1} en adelante ya está ordenado.`, `i = ${i}: the heap takes up v[0..${i}]; from ${i + 1} on it's already sorted.`));
            const mayor = s.items[0].v;
            intercambiar(s, 0, i);
            ver({ pila: ["heapSort(v)"], intercambio: [0, i], marcas: marcas([[0, "0"], [i, "i"]]), vars: { i } });
            paso("heapSort", 4, tr(`swap(v[0], v[${i}]): el mayor (${mayor}) va a la posición ${i}, que es su lugar definitivo.`, `swap(v[0], v[${i}]): the largest (${mayor}) goes to position ${i}, which is its final place.`));
            s.tamHeap = i;
            s.ordenadoDesde = i;
            ver({ pila: ["heapSort(v)"], comparar: [0], marcas: marcas([[0, "i"]]), vars: { i } });
            paso("heapSort", 5, tr(`El heap se achica a ${i} elemento(s). maxHeapify(v, ${i}, 0) hunde la nueva raíz (${s.items[0].v}).`,
              `The heap shrinks to ${i} element(s). maxHeapify(v, ${i}, 0) sinks the new root (${s.items[0].v}).`));
            animarHeapify(s, t, i, 0, ["heapSort(v)"], paso, ver, false);
          }
          s.tamHeap = 0;
          s.ordenadoDesde = 0;
          fase = "";
          ver({ vars: { i: 0 } });
          const ordenado = s.items.map((x) => x.v).join(", ");
          paso("heapSort", 3, tr(`i = 0 ya no cumple i > 0: v[0] es el menor y ya está en su lugar. ¡Ordenado! { ${ordenado} }`,
            `i = 0 no longer satisfies i > 0: v[0] is the smallest and it's already in its place. Sorted! { ${ordenado} }`), "exito");
        },
      },
      {
        id: "mezclar",
        etiqueta: tr("Nuevo arreglo aleatorio", "New random array"),
        secundaria: true,
        ejecutar(s, args, paso) {
          Object.assign(s, estadoOrdenar(valoresAleatorios(Math.floor(Math.random() * 4) + 6)));
          paso("heapSort", 0, tr("Nuevo arreglo desordenado. Pulsa Ejecutar.", "New unsorted array. Press Run."));
        },
      },
    ],
  });
})();
