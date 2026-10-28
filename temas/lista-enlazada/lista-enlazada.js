// Animación de la lista enlazada. Los fragmentos de `codigo` deben coincidir
// línea por línea con ejemplos/cpp/lista_enlazada.cpp
// (scripts/verificar-fragmentos.mjs lo revisa).
(function () {
  const { el } = DS;
  const MAXIMO = 8; // solo para que la animación quepa en pantalla
  const ANCHO_NODO = 78;
  const PASO_X = 116;
  const Y_LISTA = 64;
  const Y_SUELTOS = 176;
  const MARGEN = 20;
  const SVG = "http://www.w3.org/2000/svg";

  // Recorre desde cabeza y devuelve los ids en orden.
  function cadena(s) {
    const orden = [];
    const vistos = new Set();
    for (let id = s.cabeza; id != null && !vistos.has(id); id = s.nodos[id].sig) {
      vistos.add(id);
      orden.push(id);
    }
    return orden;
  }

  function nuevoNodo(s, valor) {
    const id = `n${s.siguienteId++}`;
    s.nodos[id] = { v: valor, sig: null };
    return id;
  }

  function borrarNodo(s, id) {
    delete s.nodos[id];
    for (const k of Object.keys(s.ptrs)) if (s.ptrs[k] === id) s.ptrs[k] = undefined;
  }

  function valor(s, id) {
    return id == null ? "nullptr" : `nodo ${s.nodos[id].v}`;
  }

  // Calcula la posición (x, y) de cada nodo.
  function posiciones(s) {
    const orden = cadena(s);
    const pos = {};
    orden.forEach((id, k) => { pos[id] = { x: k * PASO_X, y: Y_LISTA }; });
    const sueltos = Object.keys(s.nodos).filter((id) => !(id in pos));
    sueltos.forEach((id, k) => {
      const destino = s.nodos[id].sig;
      const x = destino != null && pos[destino] ? pos[destino].x - PASO_X / 2 : (orden.length + k) * PASO_X;
      pos[id] = { x, y: Y_SUELTOS, suelto: true };
    });
    const minX = Math.min(0, ...Object.values(pos).map((p) => p.x));
    for (const p of Object.values(pos)) p.x += MARGEN - minX;
    return pos;
  }

  function dibujarFlechas(lienzo, s) {
    const svg = lienzo.querySelector("svg");
    svg.querySelectorAll("path.flecha").forEach((p) => p.remove());
    for (const [id, nodo] of Object.entries(s.nodos)) {
      if (nodo.sig == null || !s.nodos[nodo.sig]) continue;
      const a = lienzo.querySelector(`.nodo[data-id="${id}"]`);
      const b = lienzo.querySelector(`.nodo[data-id="${nodo.sig}"]`);
      if (!a || !b) continue;
      const x1 = a.offsetLeft + ANCHO_NODO - 14;
      const y1 = a.offsetTop + 23;
      let d;
      if (Math.abs(a.offsetTop - b.offsetTop) < 5 && b.offsetLeft > a.offsetLeft) {
        d = `M ${x1} ${y1} L ${b.offsetLeft - 4} ${b.offsetTop + 23}`;
      } else {
        // Hacia otra fila: entra por la parte de abajo o de arriba del destino.
        const x2 = b.offsetLeft + 23;
        const arriba = b.offsetTop < a.offsetTop;
        const y2 = arriba ? b.offsetTop + 50 : b.offsetTop - 4;
        d = `M ${x1} ${y1} C ${x1 + 40} ${y1}, ${x2} ${arriba ? y2 + 40 : y2 - 40}, ${x2} ${y2}`;
      }
      const activa = s.vis.flecha === id;
      const path = document.createElementNS(SVG, "path");
      path.setAttribute("d", d);
      path.setAttribute("class", "flecha" + (activa ? " activa" : ""));
      path.setAttribute("marker-end", activa ? "url(#punta-activa)" : "url(#punta)");
      svg.append(path);
    }
  }

  function crearLienzo() {
    const svg = document.createElementNS(SVG, "svg");
    svg.innerHTML =
      '<defs>' +
      '<marker id="punta" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z"/></marker>' +
      '<marker id="punta-activa" class="activa" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z"/></marker>' +
      "</defs>";
    return el("div", { class: "lienzo-lista" }, svg, el("div", { class: "nulos" }));
  }

  DS.tema({
    incremental: true,

    codigo: {
      insertarAlInicio: `
        void insertarAlInicio(int valor) {
            Nodo* nuevo = new Nodo(valor);
            nuevo->siguiente = cabeza;
            cabeza = nuevo;
        }`,
      insertarAlFinal: `
        void insertarAlFinal(int valor) {
            Nodo* nuevo = new Nodo(valor);
            if (cabeza == nullptr) {
                cabeza = nuevo;
                return;
            }
            Nodo* actual = cabeza;
            while (actual->siguiente != nullptr) {
                actual = actual->siguiente;
            }
            actual->siguiente = nuevo;
        }`,
      buscar: `
        bool buscar(int valor) const {
            Nodo* actual = cabeza;
            while (actual != nullptr) {
                if (actual->valor == valor) {
                    return true;
                }
                actual = actual->siguiente;
            }
            return false;
        }`,
      eliminar: `
        bool eliminar(int valor) {
            if (cabeza == nullptr) {
                return false;
            }
            if (cabeza->valor == valor) {
                Nodo* temp = cabeza;
                cabeza = cabeza->siguiente;
                delete temp;
                return true;
            }
            Nodo* actual = cabeza;
            while (actual->siguiente != nullptr && actual->siguiente->valor != valor) {
                actual = actual->siguiente;
            }
            if (actual->siguiente == nullptr) {
                return false;
            }
            Nodo* temp = actual->siguiente;
            actual->siguiente = temp->siguiente;
            delete temp;
            return true;
        }`,
    },

    tituloCodigo: (clave) => `ListaEnlazada::${clave}()`,

    mensajeInicial: "La lista tiene 3 nodos. Cada nodo guarda un valor y un puntero (•) al siguiente; ∅ es nullptr.",

    estadoInicial: () => ({
      nodos: { n1: { v: 3, sig: "n2" }, n2: { v: 7, sig: "n3" }, n3: { v: 12, sig: null } },
      cabeza: "n1",
      ptrs: {},
      siguienteId: 4,
      vis: {},
    }),

    entradas: [{ id: "valor", etiqueta: "Valor", min: 0, max: 99, aleatorio: true }],

    operaciones: [
      {
        id: "insertarAlInicio",
        etiqueta: "insertarAlInicio(valor)",
        usa: ["valor"],
        ejecutar(s, { valor: v }, paso) {
          if (Object.keys(s.nodos).length >= MAXIMO) {
            paso("insertarAlInicio", 1, `Para que la animación quepa en pantalla, la lista llega hasta ${MAXIMO} nodos. Elimina alguno o pulsa Reiniciar.`, "error");
            return;
          }
          const id = nuevoNodo(s, v);
          s.ptrs = { nuevo: id };
          s.vis = { activo: id };
          paso("insertarAlInicio", 2, `Creamos un nodo con ${v} en memoria nueva. Todavía no está conectado a la lista.`);
          s.nodos[id].sig = s.cabeza;
          s.vis = { flecha: id };
          paso("insertarAlInicio", 3, `nuevo->siguiente apunta a lo mismo que cabeza (${valor(s, s.cabeza)}).`);
          s.cabeza = id;
          s.vis = { activo: id };
          paso("insertarAlInicio", 4, `cabeza ahora apunta al nodo nuevo. No hubo que mover ningún nodo: O(1).`, "exito");
          s.ptrs = {};
        },
      },
      {
        id: "insertarAlFinal",
        etiqueta: "insertarAlFinal(valor)",
        usa: ["valor"],
        ejecutar(s, { valor: v }, paso) {
          if (Object.keys(s.nodos).length >= MAXIMO) {
            paso("insertarAlFinal", 1, `Para que la animación quepa en pantalla, la lista llega hasta ${MAXIMO} nodos. Elimina alguno o pulsa Reiniciar.`, "error");
            return;
          }
          const id = nuevoNodo(s, v);
          s.ptrs = { nuevo: id };
          s.vis = { activo: id };
          paso("insertarAlFinal", 2, `Creamos un nodo con ${v}. Su siguiente es nullptr porque será el último.`);
          paso("insertarAlFinal", 3, `¿La lista está vacía? cabeza = ${valor(s, s.cabeza)}.`);
          if (s.cabeza == null) {
            s.cabeza = id;
            paso("insertarAlFinal", 4, "Sí: el nodo nuevo pasa a ser la cabeza.");
            paso("insertarAlFinal", 5, "Terminamos.", "exito");
            s.ptrs = {};
            return;
          }
          s.ptrs.actual = s.cabeza;
          s.vis = { activo: s.cabeza };
          paso("insertarAlFinal", 7, "actual empieza en la cabeza.");
          let recorridos = 1;
          while (s.nodos[s.ptrs.actual].sig != null) {
            paso("insertarAlFinal", 8, `actual->siguiente no es nullptr: todavía no es el último.`);
            s.ptrs.actual = s.nodos[s.ptrs.actual].sig;
            s.vis = { activo: s.ptrs.actual };
            recorridos++;
            paso("insertarAlFinal", 9, `Avanzamos actual al ${valor(s, s.ptrs.actual)}.`);
          }
          paso("insertarAlFinal", 8, "actual->siguiente es nullptr: encontramos el último nodo.");
          s.nodos[s.ptrs.actual].sig = id;
          s.vis = { flecha: s.ptrs.actual, activo: id };
          paso("insertarAlFinal", 11, `Enlazamos el último nodo con el nuevo. Recorrimos ${recorridos} nodo(s): por eso es O(n).`, "exito");
          s.ptrs = {};
        },
      },
      {
        id: "buscar",
        etiqueta: "buscar(valor)",
        usa: ["valor"],
        ejecutar(s, { valor: v }, paso) {
          s.ptrs = { actual: s.cabeza };
          s.vis = { activo: s.cabeza };
          paso("buscar", 2, "actual empieza en la cabeza.");
          while (s.ptrs.actual != null) {
            paso("buscar", 3, "actual no es nullptr: seguimos.");
            const nodo = s.nodos[s.ptrs.actual];
            paso("buscar", 4, `¿actual->valor (${nodo.v}) == ${v}?`);
            if (nodo.v === v) {
              s.vis = { encontrado: s.ptrs.actual };
              paso("buscar", 5, `¡Lo encontramos! Devolvemos true.`, "exito");
              s.ptrs = {};
              return;
            }
            s.ptrs.actual = nodo.sig;
            s.vis = { activo: s.ptrs.actual };
            paso("buscar", 7, `Avanzamos: actual = ${valor(s, s.ptrs.actual)}.`);
          }
          paso("buscar", 3, "actual es nullptr: llegamos al final de la lista.");
          paso("buscar", 9, `${v} no está en la lista. Devolvemos false.`, "error");
          s.ptrs = {};
        },
      },
      {
        id: "eliminar",
        etiqueta: "eliminar(valor)",
        usa: ["valor"],
        ejecutar(s, { valor: v }, paso) {
          paso("eliminar", 2, `¿La lista está vacía? cabeza = ${valor(s, s.cabeza)}.`);
          if (s.cabeza == null) {
            paso("eliminar", 3, "Sí: no hay nada que eliminar. Devolvemos false.", "error");
            return;
          }
          s.vis = { activo: s.cabeza };
          paso("eliminar", 5, `¿El valor de la cabeza (${s.nodos[s.cabeza].v}) es ${v}?`);
          if (s.nodos[s.cabeza].v === v) {
            s.ptrs = { temp: s.cabeza };
            paso("eliminar", 6, "Sí. Guardamos la cabeza en temp para no perderla.");
            s.cabeza = s.nodos[s.cabeza].sig;
            s.vis = { borrado: s.ptrs.temp };
            paso("eliminar", 7, `cabeza avanza a ${valor(s, s.cabeza)}. El nodo viejo quedó fuera de la lista.`);
            const t = s.ptrs.temp;
            borrarNodo(s, t);
            s.vis = {};
            paso("eliminar", 8, "delete temp libera la memoria del nodo.");
            paso("eliminar", 9, "Devolvemos true.", "exito");
            s.ptrs = {};
            return;
          }
          s.ptrs = { actual: s.cabeza };
          paso("eliminar", 11, "No. Buscamos el nodo ANTERIOR al que hay que borrar, empezando por la cabeza.");
          for (;;) {
            const sig = s.nodos[s.ptrs.actual].sig;
            if (sig == null) {
              paso("eliminar", 12, "actual->siguiente es nullptr: llegamos al final.");
              break;
            }
            s.vis = { activo: sig, flecha: s.ptrs.actual };
            if (s.nodos[sig].v === v) {
              paso("eliminar", 12, `actual->siguiente->valor es ${v}: actual es el nodo anterior. Paramos.`);
              break;
            }
            paso("eliminar", 12, `actual->siguiente->valor es ${s.nodos[sig].v}, no ${v}: seguimos.`);
            s.ptrs.actual = sig;
            s.vis = { activo: sig };
            paso("eliminar", 13, `Avanzamos: actual = ${valor(s, sig)}.`);
          }
          paso("eliminar", 15, "¿actual->siguiente es nullptr?");
          if (s.nodos[s.ptrs.actual].sig == null) {
            s.vis = {};
            paso("eliminar", 16, `Sí: ${v} no está en la lista. Devolvemos false.`, "error");
            s.ptrs = {};
            return;
          }
          s.ptrs.temp = s.nodos[s.ptrs.actual].sig;
          s.vis = { borrado: s.ptrs.temp };
          paso("eliminar", 18, "temp apunta al nodo que vamos a borrar.");
          s.nodos[s.ptrs.actual].sig = s.nodos[s.ptrs.temp].sig;
          s.vis = { borrado: s.ptrs.temp, flecha: s.ptrs.actual };
          paso("eliminar", 19, `Saltamos el nodo: actual->siguiente = temp->siguiente (${valor(s, s.nodos[s.ptrs.temp].sig)}).`);
          borrarNodo(s, s.ptrs.temp);
          s.vis = {};
          paso("eliminar", 20, "delete temp libera la memoria del nodo.");
          paso("eliminar", 21, "Devolvemos true.", "exito");
          s.ptrs = {};
        },
      },
    ],

    dibujar(escenario, s) {
      let lienzo = escenario.querySelector(".lienzo-lista");
      if (!lienzo) {
        lienzo = crearLienzo();
        escenario.append(lienzo);
      }
      const pos = posiciones(s);
      const vis = s.vis || {};

      // Punteros que apuntan a cada nodo (cabeza incluida).
      const etiquetas = {};
      const nulos = [];
      const todos = Object.assign({ cabeza: s.cabeza }, s.ptrs);
      for (const [nombre, id] of Object.entries(todos)) {
        if (id === undefined) continue;
        if (id == null) nulos.push(`${nombre} = nullptr`);
        else (etiquetas[id] = etiquetas[id] || []).push(nombre);
      }

      const vivos = new Set(Object.keys(s.nodos));
      for (const n of lienzo.querySelectorAll(".nodo")) if (!vivos.has(n.dataset.id)) n.remove();

      for (const [id, nodo] of Object.entries(s.nodos)) {
        let caja = lienzo.querySelector(`.nodo[data-id="${id}"]`);
        if (!caja) {
          caja = el("div", { class: "nodo nuevo", "data-id": id },
            el("span", { class: "valor" }), el("span", { class: "sig" }), el("div", { class: "punteros" }));
          caja.style.left = `${pos[id].x}px`;
          caja.style.top = `${pos[id].y}px`;
          lienzo.append(caja);
        }
        caja.querySelector(".valor").textContent = nodo.v;
        caja.querySelector(".sig").classList.toggle("nulo", nodo.sig == null);
        caja.style.left = `${pos[id].x}px`;
        caja.style.top = `${pos[id].y}px`;
        caja.classList.toggle("suelto", !!pos[id].suelto);
        caja.classList.toggle("activo", vis.activo === id);
        caja.classList.toggle("encontrado", vis.encontrado === id);
        caja.classList.toggle("borrado", vis.borrado === id);
        const punteros = caja.querySelector(".punteros");
        punteros.classList.toggle("abajo", !!pos[id].suelto);
        punteros.replaceChildren(...(etiquetas[id] || []).map((nombre) =>
          el("span", { class: "puntero" + (nombre === "cabeza" ? " cabeza" : ""), text: pos[id].suelto ? `↑ ${nombre}` : `${nombre} ↓` })));
      }

      const ancho = Math.max(0, ...Object.values(pos).map((p) => p.x)) + ANCHO_NODO + MARGEN;
      lienzo.style.width = `${ancho}px`;
      lienzo.style.height = "270px";
      lienzo.querySelector(".nulos").textContent = nulos.join("   ");

      // Redibujamos las flechas mientras los nodos se mueven.
      const fin = performance.now() + 520;
      cancelAnimationFrame(lienzo._cuadro);
      const cuadro = () => {
        dibujarFlechas(lienzo, s);
        if (performance.now() < fin) lienzo._cuadro = requestAnimationFrame(cuadro);
      };
      cuadro();
    },
  });
})();
