// Animaciones del montículo (min-heap / max-heap) y de heapsort.
// Los fragmentos de `codigo` deben coincidir línea por línea con
// ejemplos/cpp/monticulo.cpp (scripts/verificar-fragmentos.mjs lo revisa).
(function () {
  const { el } = DS;
  const MAXIMO = 15; // 4 niveles: lo que cabe en pantalla
  const NODO = 38;
  const NIVEL = 62;
  const ANCHO_ARBOL = 400;
  const PASO_CELDA = 36;
  const MARGEN = 12;
  const Y_ARBOL = 26;
  const Y_TITULO_ARREGLO = Y_ARBOL + 3 * NIVEL + NODO + 22;
  const Y_MARCAS = Y_TITULO_ARREGLO + 22;
  const Y_CELDAS = Y_MARCAS + 18;
  const ALTO = Y_CELDAS + 60;
  const SVG = "http://www.w3.org/2000/svg";

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

  function nuevoId(s) {
    return `h${s.siguienteId++}`;
  }

  function intercambiar(s, a, b) {
    [s.items[a], s.items[b]] = [s.items[b], s.items[a]];
  }

  // Junta varias etiquetas en la misma posición: { 2: "i, padre" }.
  function marcas(pares) {
    const r = {};
    for (const [indice, texto] of pares) {
      if (indice == null) continue;
      r[indice] = r[indice] ? `${r[indice]}, ${texto}` : texto;
    }
    return r;
  }

  // Pasos de "hundir" un nodo: lo usan bajar() del montículo y hundir() de heapsort.
  //   c = { clave, lineaComparar, lineaFin, lineaIntercambio, vaAntes, palabra, nombreElegido }
  function pasosHundir(s, i, n, c, paso, ver) {
    if (i >= n) {
      ver({});
      paso(c.clave, c.lineaFin, "No quedan elementos: izq y der están fuera del montículo, así que no hay nada que hundir.");
      return;
    }
    for (;;) {
      const izq = 2 * i + 1;
      const der = 2 * i + 2;
      let elegido = i;
      if (izq < n && c.vaAntes(s.items[izq].v, s.items[elegido].v)) elegido = izq;
      if (der < n && c.vaAntes(s.items[der].v, s.items[elegido].v)) elegido = der;
      const hijos = [izq, der].filter((k) => k < n);
      const actual = s.items[i].v;
      ver({
        comparar: [i, ...hijos],
        marcas: marcas([[i, "i"], [izq < n ? izq : null, "izq"], [der < n ? der : null, "der"], [elegido, c.nombreElegido]]),
      });
      paso(c.clave, c.lineaComparar, hijos.length
        ? `Comparamos ${actual} con sus hijos (${hijos.map((k) => s.items[k].v).join(" y ")}). El ${c.palabra} de los tres es ${s.items[elegido].v}.`
        : `${actual} está en una hoja (no tiene hijos dentro del montículo).`);
      if (elegido === i) {
        ver({ ok: [i] });
        paso(c.clave, c.lineaFin, hijos.length
          ? `${actual} ya es el ${c.palabra}: queda en su lugar y terminamos de hundir.`
          : `${actual} llegó a una hoja: terminamos de hundir.`);
        return;
      }
      intercambiar(s, i, elegido);
      ver({ intercambio: [i, elegido], marcas: marcas([[elegido, "i"]]) });
      paso(c.clave, c.lineaIntercambio, `Intercambiamos ${actual} con ${s.items[i].v}: ${actual} baja un nivel.`);
      i = elegido;
    }
  }

  // ------------------------------------------------------------------
  // Dibujo: árbol arriba, arreglo abajo (los mismos elementos)
  // ------------------------------------------------------------------

  function crearLienzo(escenario) {
    const svg = document.createElementNS(SVG, "svg");
    const fija = el("div", { class: "capa-fija" });
    const lienzo = el("div", { class: "lienzo-heap", style: `height:${ALTO}px` }, svg, fija);
    escenario.append(el("div", { class: "info-heap" }), el("div", { class: "marco-heap" }, lienzo));
    window.addEventListener("resize", () => escalar(escenario, lienzo));
    return lienzo;
  }

  // En pantallas angostas reducimos el dibujo en lugar de recortarlo.
  function escalar(escenario, lienzo) {
    const ancho = Number(lienzo.dataset.ancho);
    const disponible = escenario.clientWidth - 32;
    const k = Math.min(1, disponible / ancho);
    lienzo.style.transform = k < 1 ? `scale(${k})` : "";
    const marco = lienzo.parentElement;
    marco.style.width = `${ancho * k}px`;
    marco.style.height = `${ALTO * k}px`;
  }

  function dibujar(escenario, s) {
    const lienzo = escenario.querySelector(".lienzo-heap") || crearLienzo(escenario);
    const ancho = anchoPara(s.items.length);
    lienzo.style.width = `${ancho}px`;
    lienzo.dataset.ancho = ancho;
    escalar(escenario, lienzo);
    const vis = s.vis || {};
    const enHeap = s.tamHeap == null ? s.items.length : s.tamHeap;
    const ordenadoDesde = s.ordenadoDesde == null ? Infinity : s.ordenadoDesde;
    const estado = (i) => {
      if ((vis.intercambio || []).includes(i)) return "intercambio";
      if ((vis.ok || []).includes(i)) return "ok";
      if ((vis.comparar || []).includes(i)) return "comparando";
      return "";
    };

    // Información arriba del lienzo.
    const info = escenario.querySelector(".info-heap");
    info.replaceChildren(
      DS.variables(Object.assign(s.esMinimo == null ? {} : { tipo: s.esMinimo ? "min-heap" : "max-heap" },
        { tamano: enHeap }, s.ordenadoDesde == null ? {} : { ordenados: s.items.length - Math.min(s.items.length, ordenadoDesde) })),
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
        celda = el("div", { class: "hcelda", "data-id": item.id, style: `left:${posCelda(i)}px;top:${Y_CELDAS}px` });
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

    // Capa fija: títulos, índices y marcadores.
    const fija = lienzo.querySelector(".capa-fija");
    const piezas = [
      el("span", { class: "fila-titulo", style: `left:${MARGEN}px;top:0`, text: "Como árbol" }),
      el("span", { class: "fila-titulo", style: `left:${MARGEN}px;top:${Y_TITULO_ARREGLO}px`, text: "Como arreglo (así se guarda en memoria)" }),
    ];
    if (!s.items.length) piezas.push(el("span", { class: "indice", style: `left:${MARGEN}px;top:${Y_CELDAS + 8}px`, text: "(vacío)" }));
    for (let i = 0; i < s.items.length; i++) {
      piezas.push(el("span", { class: "indice", style: `left:${posCelda(i)}px;top:${Y_CELDAS + 36}px;width:32px;text-align:center`, text: i }));
    }
    for (const [i, texto] of Object.entries(vis.marcas || {})) {
      piezas.push(el("span", { class: "marcador", style: `left:${posCelda(Number(i)) - 12}px;top:${Y_MARCAS}px;width:56px`, text: texto }));
    }
    fija.replaceChildren(...piezas);
  }

  // ------------------------------------------------------------------
  // Visualizador 1: min-heap / max-heap
  // ------------------------------------------------------------------

  const vaAntes = (s, a, b) => (s.esMinimo ? a < b : a > b);
  const signo = (s) => (s.esMinimo ? "<" : ">");
  const palabra = (s) => (s.esMinimo ? "menor" : "mayor");

  function construir(esMinimo, valores) {
    const s = { items: [], esMinimo, siguienteId: 1, vis: {} };
    for (const v of valores) {
      s.items.push({ id: nuevoId(s), v });
      let i = s.items.length - 1;
      while (i > 0 && vaAntes(s, s.items[i].v, s.items[padreDe(i)].v)) {
        intercambiar(s, i, padreDe(i));
        i = padreDe(i);
      }
    }
    return s;
  }

  DS.tema({
    incremental: true,
    dibujar,

    codigo: {
      insertar: `
        void insertar(int valor) {
            datos.push_back(valor);
            int i = tamano() - 1;
            while (i > 0) {
                int padre = (i - 1) / 2;
                if (!vaAntes(datos[i], datos[padre])) {
                    break;
                }
                std::swap(datos[i], datos[padre]);
                i = padre;
            }
        }`,
      extraerRaiz: `
        int extraerRaiz() {
            if (estaVacio()) {
                throw std::underflow_error("monticulo vacio");
            }
            int valor = datos[0];
            datos[0] = datos.back();
            datos.pop_back();
            bajar(0);
            return valor;
        }`,
      bajar: `
        void bajar(int i) {
            int n = tamano();
            while (true) {
                int izq = 2 * i + 1;
                int der = 2 * i + 2;
                int elegido = i;
                if (izq < n && vaAntes(datos[izq], datos[elegido])) {
                    elegido = izq;
                }
                if (der < n && vaAntes(datos[der], datos[elegido])) {
                    elegido = der;
                }
                if (elegido == i) {
                    break;
                }
                std::swap(datos[i], datos[elegido]);
                i = elegido;
            }
        }`,
      raiz: `
        int raiz() const {
            if (estaVacio()) {
                throw std::underflow_error("monticulo vacio");
            }
            return datos[0];
        }`,
    },

    tituloCodigo: (clave) => `Monticulo::${clave}()`,

    mensajeInicial: ({ tipo }) => tipo === "min"
      ? "Min-heap: cada padre es menor o igual que sus hijos, así que el mínimo siempre está en la raíz."
      : "Max-heap: cada padre es mayor o igual que sus hijos, así que el máximo siempre está en la raíz.",

    estadoInicial: ({ tipo }) => construir(tipo === "min", [12, 7, 20, 3, 15, 9]),

    entradas: [
      { id: "tipo", etiqueta: "Tipo", opciones: [["min", "Min-heap"], ["max", "Max-heap"]], valor: "min" },
      { id: "valor", etiqueta: "Valor", min: 0, max: 99, aleatorio: true },
    ],

    operaciones: [
      {
        id: "insertar",
        etiqueta: "insertar(valor)",
        usa: ["valor"],
        ejecutar(s, { valor }, paso) {
          const ver = (o) => { s.vis = o; };
          if (s.items.length >= MAXIMO) {
            paso("insertar", 2, `Para que la animación quepa en pantalla, el montículo llega hasta ${MAXIMO} elementos. Extrae alguno o pulsa Reiniciar.`, "error");
            return;
          }
          s.items.push({ id: nuevoId(s), v: valor });
          let i = s.items.length - 1;
          ver({ nuevo: i, marcas: marcas([[i, "i"]]) });
          paso("insertar", 2, `push_back(${valor}): entra al final del arreglo, que es el primer hueco libre del último nivel del árbol.`);
          while (i > 0) {
            const padre = padreDe(i);
            const [vi, vp] = [s.items[i].v, s.items[padre].v];
            ver({ comparar: [i, padre], marcas: marcas([[i, "i"], [padre, "padre"]]) });
            paso("insertar", 6, `padre = (${i} - 1) / 2 = ${padre}. ¿${vi} ${signo(s)} ${vp}?`);
            if (!vaAntes(s, vi, vp)) {
              ver({ ok: [i] });
              paso("insertar", 7, `No: ${vi} no es ${palabra(s)} que su padre (${vp}). Ya está en su lugar.`, "exito");
              return;
            }
            intercambiar(s, i, padre);
            ver({ intercambio: [i, padre], marcas: marcas([[padre, "i"]]) });
            paso("insertar", 9, `Sí: intercambiamos ${vi} y ${vp}. ${vi} sube un nivel.`);
            i = padre;
          }
          ver({ ok: [0] });
          paso("insertar", 4, `i = 0: ${valor} llegó a la raíz. Es el nuevo ${s.esMinimo ? "mínimo" : "máximo"}.`, "exito");
        },
      },
      {
        id: "extraerRaiz",
        etiqueta: "extraerRaiz()",
        ejecutar(s, args, paso) {
          let salida = null;
          const ver = (o) => { s.vis = Object.assign({ salida }, o); };
          paso("extraerRaiz", 2, `¿Está vacío? tamano = ${s.items.length}.`);
          if (!s.items.length) {
            paso("extraerRaiz", 3, "No hay nada que extraer: se lanza std::underflow_error.", "error");
            return;
          }
          salida = s.items[0].v;
          ver({ comparar: [0] });
          paso("extraerRaiz", 5, `Guardamos la raíz: ${salida}, el ${s.esMinimo ? "mínimo" : "máximo"} de todos.`);
          const n = s.items.length;
          const ultimo = s.items[n - 1];
          s.items[0] = { id: ultimo.id, v: ultimo.v };
          if (n > 1) s.items[n - 1] = { id: nuevoId(s), v: ultimo.v, fantasma: true };
          ver({ intercambio: [0] });
          paso("extraerRaiz", 6, n > 1
            ? `Copiamos el último elemento (${ultimo.v}) a la raíz para tapar el hueco.`
            : "Era el único elemento: el último es la misma raíz.");
          s.items.pop();
          ver({});
          paso("extraerRaiz", 7, n > 1
            ? `pop_back(): quitamos la copia del final. Pero ${ultimo.v} en la raíz puede romper la regla del montículo…`
            : "pop_back(): el montículo queda vacío.");
          paso("extraerRaiz", 8, "Llamamos a bajar(0) para hundir la nueva raíz hasta su lugar.");
          pasosHundir(s, 0, s.items.length, {
            clave: "bajar", lineaComparar: 10, lineaFin: 14, lineaIntercambio: 16,
            vaAntes: (a, b) => vaAntes(s, a, b), palabra: palabra(s), nombreElegido: "elegido",
          }, paso, ver);
          ver({});
          paso("extraerRaiz", 9, `Devolvemos ${salida}. Si sigues extrayendo, los valores salen ${s.esMinimo ? "de menor a mayor" : "de mayor a menor"}.`, "exito");
        },
      },
      {
        id: "raiz",
        etiqueta: "raiz()",
        ejecutar(s, args, paso) {
          paso("raiz", 2, `¿Está vacío? tamano = ${s.items.length}.`);
          if (!s.items.length) {
            paso("raiz", 3, "El montículo está vacío: no hay raíz. Se lanza std::underflow_error.", "error");
            return;
          }
          s.vis = { ok: [0], salida: s.items[0].v };
          paso("raiz", 5, `Devolvemos datos[0] = ${s.items[0].v} sin sacarlo. Es O(1): siempre está en la raíz.`, "exito");
        },
      },
    ],
  });

  // ------------------------------------------------------------------
  // Visualizador 2: heapsort
  // ------------------------------------------------------------------

  const N_ORDENAR = 8;

  function arregloAleatorio(s) {
    s.items = [];
    for (let k = 0; k < N_ORDENAR; k++) s.items.push({ id: nuevoId(s), v: Math.floor(Math.random() * 90) + 1 });
    s.tamHeap = N_ORDENAR;
    s.ordenadoDesde = N_ORDENAR;
  }

  DS.tema({
    contenedor: "visualizador-heapsort",
    incremental: true,
    dibujar,

    codigo: {
      heapsort: `
        void heapsort(std::vector<int>& v) {
            int n = static_cast<int>(v.size());
            for (int i = n / 2 - 1; i >= 0; i--) {
                hundir(v, n, i);
            }
            for (int fin = n - 1; fin > 0; fin--) {
                std::swap(v[0], v[fin]);
                hundir(v, fin, 0);
            }
        }`,
      hundir: `
        void hundir(std::vector<int>& v, int n, int i) {
            while (true) {
                int izq = 2 * i + 1;
                int der = 2 * i + 2;
                int mayor = i;
                if (izq < n && v[izq] > v[mayor]) {
                    mayor = izq;
                }
                if (der < n && v[der] > v[mayor]) {
                    mayor = der;
                }
                if (mayor == i) {
                    return;
                }
                std::swap(v[i], v[mayor]);
                i = mayor;
            }
        }`,
    },

    tituloCodigo: (clave) => `${clave}()`,

    mensajeInicial: "Un arreglo desordenado de 8 números. Pulsa heapsort(v) y observa las dos fases.",

    estadoInicial: () => {
      const s = { items: [], siguienteId: 1, vis: {} };
      [38, 27, 43, 3, 9, 82, 10, 5].forEach((v) => s.items.push({ id: nuevoId(s), v }));
      s.tamHeap = N_ORDENAR;
      s.ordenadoDesde = N_ORDENAR;
      return s;
    },

    operaciones: [
      {
        id: "heapsort",
        etiqueta: "heapsort(v)",
        ejecutar(s, args, paso) {
          let fase = "";
          const ver = (o) => { s.vis = Object.assign({ fase }, o); };
          const n = s.items.length;
          s.tamHeap = n;
          s.ordenadoDesde = n;
          const hundir = (i, tam) => pasosHundir(s, i, tam, {
            clave: "hundir", lineaComparar: 9, lineaFin: 13, lineaIntercambio: 15,
            vaAntes: (a, b) => a > b, palabra: "mayor", nombreElegido: "mayor",
          }, paso, ver);

          fase = "Fase 1 de 2: convertir el arreglo en un max-heap";
          ver({});
          paso("heapsort", 2, `n = ${n}. Miramos el arreglo como un árbol, aunque todavía no cumple la regla del max-heap.`);
          for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
            ver({ comparar: [i], marcas: marcas([[i, "i"]]) });
            paso("heapsort", 4, i === Math.floor(n / 2) - 1
              ? `Empezamos por el último nodo que tiene hijos: i = ${n} / 2 - 1 = ${i}. Las hojas ya son montículos de un elemento.`
              : `Seguimos con i = ${i}: hundimos ${s.items[i].v}.`);
            hundir(i, n);
          }
          ver({ ok: [0] });
          paso("heapsort", 6, `¡Ya es un max-heap! El mayor (${s.items[0].v}) está en la raíz.`);

          fase = "Fase 2 de 2: sacar el mayor y ponerlo al final";
          for (let fin = n - 1; fin > 0; fin--) {
            const mayor = s.items[0].v;
            intercambiar(s, 0, fin);
            ver({ intercambio: [0, fin], marcas: marcas([[0, "0"], [fin, "fin"]]) });
            paso("heapsort", 7, `Intercambiamos la raíz (${mayor}) con v[${fin}] (${s.items[0].v}). ${mayor} ya queda en su posición final.`);
            s.tamHeap = fin;
            s.ordenadoDesde = fin;
            ver({ marcas: marcas([[0, "i"]]) });
            paso("heapsort", 8, `El montículo ahora tiene ${fin} elemento(s). Hundimos la nueva raíz (${s.items[0].v}) para repararlo.`);
            hundir(0, fin);
          }
          s.tamHeap = 0;
          s.ordenadoDesde = 0;
          fase = "";
          ver({});
          paso("heapsort", 10, `¡Ordenado! ${s.items.map((x) => x.v).join(", ")}. Cada extracción costó O(log n), así que en total O(n log n).`, "exito");
        },
      },
      {
        id: "mezclar",
        etiqueta: "Nuevo arreglo aleatorio",
        secundaria: true,
        ejecutar(s, args, paso) {
          arregloAleatorio(s);
          paso("heapsort", 0, "Nuevo arreglo desordenado. Pulsa heapsort(v).");
        },
      },
    ],
  });
})();
