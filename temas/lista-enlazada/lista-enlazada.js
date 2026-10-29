// Lección de la lista enlazada, en pasos. Los fragmentos de código deben
// coincidir línea por línea con ejemplos/cpp/lista_enlazada.cpp
// (scripts/verificar-fragmentos.mjs lo revisa).
(function () {
  const { el } = DS;
  const MAXIMO = 15; // límite solo para que la animación quepa en pantalla
  const MARGEN = 14;
  const X_LISTA = 100; // x del primer nodo: a la izquierda va la variable cabeza
  const ALTO_NODO = 46;
  const Y_FILA = 58; // y de la primera fila: arriba quedan las marcas de los punteros
  const SVG = "http://www.w3.org/2000/svg";
  const ORDEN_PUNTEROS = ["nuevo", "actual", "temp"];

  // Direcciones "al azar": cada new Nodo cae donde haya lugar, no en orden.
  const DIRECCIONES = [0x3a0, 0x1c8, 0x5f0, 0x2b8, 0x748, 0x0d0, 0x630, 0x418, 0x290, 0x7e0, 0x158, 0x6a8];

  // ------------------------------------------------------------------
  // Fragmentos de C++ (copiados de ejemplos/cpp/lista_enlazada.cpp)
  // ------------------------------------------------------------------

  const CODIGO = {
    obtener: `
      int obtener(int pos) const {
          Nodo* actual = cabeza;
          for (int i = 0; i < pos && actual != nullptr; i++) {
              actual = actual->siguiente;
          }
          if (pos < 0 || actual == nullptr) {
              throw std::out_of_range("posicion invalida");
          }
          return actual->valor;
      }`,
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
  };

  // ------------------------------------------------------------------
  // Estado: nodos por id (para que se deslicen), la cabeza y los punteros
  // locales de cada función (nuevo, actual, temp).
  // ------------------------------------------------------------------

  const hex = (n) => `0x${n.toString(16).padStart(3, "0")}`;

  function crearNodo(s, v, extra) {
    const id = `n${s.sig++}`;
    s.nodos[id] = Object.assign({ v, sig: null, dir: DIRECCIONES[s.usadas++ % DIRECCIONES.length] }, extra);
    return id;
  }

  function estadoDesde(valores, opciones) {
    const s = { nodos: {}, cabeza: null, ptrs: {}, sig: 1, usadas: 0, direcciones: !!(opciones && opciones.direcciones), vis: {} };
    let anterior = null;
    for (const v of valores) {
      const id = crearNodo(s, v);
      if (anterior) s.nodos[anterior].sig = id;
      else s.cabeza = id;
      anterior = id;
    }
    return s;
  }

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

  // Cómo se nombra un puntero en los mensajes: por su valor o, en el paso
  // de las direcciones, por la dirección a la que apunta.
  function nombre(s, id) {
    if (id == null) return "nullptr";
    return s.direcciones ? `${hex(s.nodos[id].dir)} (el ${s.nodos[id].v})` : `el nodo ${s.nodos[id].v}`;
  }

  function limiteAlcanzado(s, clave, paso) {
    if (Object.keys(s.nodos).length < MAXIMO) return false;
    s.vis = { error: true };
    paso(clave, 2, `Para que la animación quepa en pantalla, la lista llega hasta ${MAXIMO} nodos. Elimina alguno o pulsa Reiniciar.`, "error");
    return true;
  }

  // Limpia lo que solo existe mientras corre una función.
  function terminar(s) {
    s.ptrs = {};
    for (const nodo of Object.values(s.nodos)) {
      delete nodo.ancla;
      delete nodo.reserva;
    }
  }

  // ------------------------------------------------------------------
  // Animaciones de cada función
  // ------------------------------------------------------------------

  const OPS = {
    obtener: {
      etiqueta: "obtener(pos)",
      usa: ["pos"],
      ejecutar(s, { pos }, paso) {
        s.ptrs = { actual: s.cabeza };
        s.vis = { vars: { pos }, activo: s.cabeza, flecha: "cabeza" };
        paso("obtener", 2, s.cabeza == null
          ? "La lista está vacía: actual empieza en nullptr."
          : `No hay cuenta que diga dónde está el nodo ${pos}: lo único que conocemos es cabeza. actual empieza ahí (${nombre(s, s.cabeza)}).`);
        let i = 0;
        const revisados = [];
        while (i < pos && s.ptrs.actual != null) {
          const desde = s.ptrs.actual;
          revisados.push(desde);
          s.ptrs.actual = s.nodos[desde].sig;
          s.vis = { vars: { pos, i }, activo: s.ptrs.actual, flecha: desde, revisados: revisados.slice() };
          paso("obtener", 4, `i = ${i} < ${pos}: seguimos la flecha de ${s.nodos[desde].v}. actual = actual->siguiente → ${nombre(s, s.ptrs.actual)}. Van ${i + 1} salto(s).`);
          i++;
        }
        const llego = pos >= 0 && s.ptrs.actual != null;
        s.vis = { vars: { pos, i }, activo: s.ptrs.actual, revisados };
        paso("obtener", 3, pos < 0
          ? `pos es ${pos}: la condición i < pos es falsa desde el principio.`
          : llego ? `i == pos: llegamos al nodo ${pos} después de ${pos} salto(s).` : `actual es nullptr: la lista se terminó después de ${i} nodo(s), antes de llegar a la posición ${pos}.`);
        if (!llego) {
          s.vis = { vars: { pos, i }, revisados, error: true };
          paso("obtener", 7, pos < 0
            ? "No existe una posición negativa. Se lanza std::out_of_range y la lista no cambia."
            : `No hay nodo en la posición ${pos}. Se lanza std::out_of_range y la lista no cambia.`, "error");
          terminar(s);
          return;
        }
        s.vis = { vars: { pos, i }, encontrado: s.ptrs.actual, revisados, salida: s.nodos[s.ptrs.actual].v };
        paso("obtener", 9, `return ${s.nodos[s.ptrs.actual].v}. En el vector sería una cuenta y un salto; aquí fueron ${pos} salto(s), uno por cada nodo anterior: O(n).`, "exito");
        terminar(s);
      },
    },

    insertarAlInicio: {
      etiqueta: "insertarAlInicio(valor)",
      usa: ["valor"],
      ejecutar(s, { valor }, paso) {
        if (limiteAlcanzado(s, "insertarAlInicio", paso)) return;
        const id = crearNodo(s, valor, { ancla: -0.5 });
        s.ptrs = { nuevo: id };
        s.vis = { vars: { valor }, activo: id };
        paso("insertarAlInicio", 2, `new Nodo(${valor}): el nodo aparece donde haya memoria libre${s.direcciones ? ` (${hex(s.nodos[id].dir)})` : ""}. Su siguiente es nullptr y todavía nadie apunta a él.`);
        s.nodos[id].sig = s.cabeza;
        s.vis = { vars: { valor }, activo: id, flecha: id };
        paso("insertarAlInicio", 3, s.cabeza == null
          ? "nuevo->siguiente = cabeza: la lista estaba vacía, así que sigue siendo nullptr."
          : `nuevo->siguiente = cabeza: el nodo nuevo apunta al que hoy es el primero (${s.nodos[s.cabeza].v}). Así el resto de la lista no se pierde.`);
        s.cabeza = id;
        s.vis = { vars: { valor }, activo: id, flecha: "cabeza" };
        paso("insertarAlInicio", 4, `cabeza = nuevo: la lista ahora empieza en ${valor}. Ningún nodo se copió ni se movió en memoria: siempre son dos punteros, O(1).`, "exito");
        terminar(s);
      },
    },

    insertarAlFinal: {
      etiqueta: "insertarAlFinal(valor)",
      usa: ["valor"],
      ejecutar(s, { valor }, paso) {
        if (limiteAlcanzado(s, "insertarAlFinal", paso)) return;
        const largo = cadena(s).length;
        const id = crearNodo(s, valor, { ancla: largo });
        s.ptrs = { nuevo: id };
        s.vis = { vars: { valor }, activo: id };
        paso("insertarAlFinal", 2, `new Nodo(${valor}): su siguiente es nullptr, justo lo que necesita el último nodo.`);
        s.vis = { vars: { valor }, activo: id, flecha: "cabeza", nulo: s.cabeza == null ? "cabeza" : null };
        paso("insertarAlFinal", 3, `¿cabeza == nullptr? ${s.cabeza == null ? "Sí: la lista está vacía." : "No: hay que encontrar el último nodo."}`);
        if (s.cabeza == null) {
          s.cabeza = id;
          s.vis = { vars: { valor }, activo: id, flecha: "cabeza" };
          paso("insertarAlFinal", 4, "cabeza = nuevo: el nodo nuevo es el primero y también el último.");
          paso("insertarAlFinal", 5, "return: no hubo nada que recorrer.", "exito");
          terminar(s);
          return;
        }
        s.ptrs.actual = s.cabeza;
        s.vis = { vars: { valor }, activo: s.cabeza };
        paso("insertarAlFinal", 7, "Solo conocemos el primer nodo: actual empieza en la cabeza.");
        const revisados = [];
        while (s.nodos[s.ptrs.actual].sig != null) {
          const desde = s.ptrs.actual;
          s.vis = { vars: { valor }, activo: desde, flecha: desde, revisados: revisados.slice() };
          paso("insertarAlFinal", 8, `actual->siguiente no es nullptr: ${s.nodos[desde].v} no es el último.`);
          revisados.push(desde);
          s.ptrs.actual = s.nodos[desde].sig;
          s.vis = { vars: { valor }, activo: s.ptrs.actual, flecha: desde, revisados: revisados.slice() };
          paso("insertarAlFinal", 9, `actual = actual->siguiente: saltamos a ${nombre(s, s.ptrs.actual)}.`);
        }
        const ultimo = s.ptrs.actual;
        s.vis = { vars: { valor }, activo: ultimo, nulo: ultimo, revisados };
        paso("insertarAlFinal", 8, `actual->siguiente es nullptr: ${s.nodos[ultimo].v} es el último.`);
        s.nodos[ultimo].sig = id;
        s.vis = { vars: { valor }, activo: id, flecha: ultimo };
        paso("insertarAlFinal", 11, `actual->siguiente = nuevo: el último ahora apunta al nuevo. Para llegar hasta aquí recorrimos los ${largo} nodo(s): O(n).`, "exito");
        terminar(s);
      },
    },

    buscar: {
      etiqueta: "buscar(valor)",
      usa: ["valor"],
      ejecutar(s, { valor }, paso) {
        s.ptrs = { actual: s.cabeza };
        s.vis = { vars: { valor }, activo: s.cabeza, flecha: "cabeza" };
        paso("buscar", 2, s.cabeza == null ? "La lista está vacía: actual empieza en nullptr." : "actual empieza en la cabeza.");
        const revisados = [];
        while (s.ptrs.actual != null) {
          const id = s.ptrs.actual;
          const v = s.nodos[id].v;
          s.vis = { vars: { valor }, activo: id, revisados: revisados.slice() };
          paso("buscar", 4, `actual no es nullptr. ¿actual->valor (${v}) == ${valor}? ${v === valor ? "¡Sí!" : "No."}`);
          if (v === valor) {
            s.vis = { vars: { valor }, encontrado: id, revisados: revisados.slice(), salida: "true" };
            paso("buscar", 5, `return true. Revisamos ${revisados.length + 1} nodo(s).`, "exito");
            terminar(s);
            return;
          }
          revisados.push(id);
          s.ptrs.actual = s.nodos[id].sig;
          s.vis = { vars: { valor }, activo: s.ptrs.actual, flecha: id, revisados: revisados.slice() };
          paso("buscar", 7, `actual = actual->siguiente → ${nombre(s, s.ptrs.actual)}.`);
        }
        s.vis = { vars: { valor }, revisados };
        paso("buscar", 3, "actual es nullptr: se terminó la lista.");
        s.vis = { vars: { valor }, revisados, salida: "false" };
        paso("buscar", 9, revisados.length
          ? `return false: ${valor} no está. Hubo que revisar los ${revisados.length} nodos; en el peor caso es O(n).`
          : "return false: en una lista vacía no hay nada que revisar.", "error");
        terminar(s);
      },
    },

    eliminar: {
      etiqueta: "eliminar(valor)",
      usa: ["valor"],
      ejecutar(s, { valor }, paso) {
        s.vis = { vars: { valor }, flecha: "cabeza", nulo: s.cabeza == null ? "cabeza" : null };
        paso("eliminar", 2, `¿cabeza == nullptr? ${s.cabeza == null ? "Sí." : "No."}`);
        if (s.cabeza == null) {
          s.vis = { vars: { valor }, nulo: "cabeza", error: true, salida: "false" };
          paso("eliminar", 3, "La lista está vacía: no hay nada que eliminar. return false.", "error");
          return;
        }
        const primero = s.cabeza;
        s.vis = { vars: { valor }, activo: primero };
        paso("eliminar", 5, `¿cabeza->valor (${s.nodos[primero].v}) == ${valor}? ${s.nodos[primero].v === valor ? "Sí: hay que borrar el primero." : "No."}`);

        if (s.nodos[primero].v === valor) {
          s.ptrs = { temp: primero };
          s.vis = { vars: { valor }, condenado: primero };
          paso("eliminar", 6, "temp = cabeza: guardamos su dirección. Si moviéramos cabeza primero, ya nadie sabría dónde está este nodo para liberarlo.");
          s.nodos[primero].reserva = 0;
          s.cabeza = s.nodos[primero].sig;
          s.vis = { vars: { valor }, condenado: primero, flecha: "cabeza" };
          paso("eliminar", 7, `cabeza = cabeza->siguiente: la lista ahora empieza en ${s.cabeza == null ? "nullptr (quedó vacía)" : s.nodos[s.cabeza].v}. El ${valor} quedó afuera, pero sigue ocupando memoria.`);
          delete s.nodos[primero];
          s.ptrs = {};
          s.vis = { vars: { valor } };
          paso("eliminar", 8, "delete temp: liberamos la memoria del nodo. Los demás nodos no se tocaron.");
          s.vis = { vars: { valor }, salida: "true" };
          paso("eliminar", 9, "return true. Sin recorrer nada: borrar el primero es O(1).", "exito");
          terminar(s);
          return;
        }

        s.ptrs = { actual: primero };
        s.vis = { vars: { valor }, activo: primero };
        paso("eliminar", 11, `Para desenganchar un nodo hay que cambiar el siguiente del nodo ANTERIOR. actual va a buscar ese anterior, empezando por la cabeza.`);
        const revisados = [];
        for (;;) {
          const id = s.ptrs.actual;
          const sig = s.nodos[id].sig;
          if (sig == null) {
            s.vis = { vars: { valor }, activo: id, nulo: id, revisados: revisados.slice() };
            paso("eliminar", 12, `actual->siguiente es nullptr: llegamos al último sin encontrar ${valor}.`);
            break;
          }
          s.vis = { vars: { valor }, activo: id, mirado: sig, flecha: id, revisados: revisados.slice() };
          if (s.nodos[sig].v === valor) {
            paso("eliminar", 12, `actual->siguiente->valor es ${valor}: actual (${s.nodos[id].v}) es el anterior. Paramos.`);
            break;
          }
          paso("eliminar", 12, `actual->siguiente->valor es ${s.nodos[sig].v}, no ${valor}: seguimos.`);
          revisados.push(id);
          s.ptrs.actual = sig;
          s.vis = { vars: { valor }, activo: sig, flecha: id, revisados: revisados.slice() };
          paso("eliminar", 13, `actual = actual->siguiente → ${nombre(s, sig)}.`);
        }

        const anterior = s.ptrs.actual;
        if (s.nodos[anterior].sig == null) {
          s.vis = { vars: { valor }, nulo: anterior, revisados: revisados.concat(anterior), error: true, salida: "false" };
          paso("eliminar", 16, `${valor} no está en la lista. return false y la lista no cambia.`, "error");
          terminar(s);
          return;
        }
        s.vis = { vars: { valor }, activo: anterior, mirado: s.nodos[anterior].sig };
        paso("eliminar", 15, "actual->siguiente no es nullptr: el valor sí está.");
        const temp = s.nodos[anterior].sig;
        s.ptrs.temp = temp;
        s.vis = { vars: { valor }, activo: anterior, condenado: temp };
        paso("eliminar", 18, `temp = actual->siguiente: temp marca el nodo ${valor}, el que vamos a borrar.`);
        s.nodos[temp].reserva = cadena(s).indexOf(temp);
        s.nodos[anterior].sig = s.nodos[temp].sig;
        s.vis = { vars: { valor }, activo: anterior, condenado: temp, flecha: anterior };
        paso("eliminar", 19, `actual->siguiente = temp->siguiente: ${s.nodos[anterior].v} salta por encima de ${valor} y apunta a ${s.nodos[anterior].sig == null ? "nullptr" : s.nodos[s.nodos[anterior].sig].v}. Ya no se llega a ${valor} desde la cabeza.`);
        delete s.nodos[temp];
        s.ptrs = { actual: anterior };
        s.vis = { vars: { valor }, activo: anterior };
        paso("eliminar", 20, "delete temp: liberamos la memoria del nodo. Ningún otro nodo se movió en memoria: solo cambió un puntero.");
        s.vis = { vars: { valor }, salida: "true" };
        paso("eliminar", 21, `return true. El borrado en sí es O(1); lo caro fue encontrar el anterior: O(n).`, "exito");
        terminar(s);
      },
    },
  };

  // ------------------------------------------------------------------
  // Dibujo: los nodos alcanzables desde cabeza van en filas, como un texto
  // que salta de línea al llegar al borde; los que están sueltos (recién
  // creados o desenganchados) van debajo de su fila. Todo se reutiliza por
  // id para que se deslice con transiciones CSS.
  // ------------------------------------------------------------------

  const pasoX = (s) => (s.direcciones ? 136 : 108);
  const anchoNodo = (s) => (s.direcciones ? 94 : 78);
  const bajada = (s) => ALTO_NODO + (s.direcciones ? 62 : 48); // de una fila a sus nodos sueltos
  // Entre dos filas: el carril de la flecha que salta de fila y las marcas de los punteros.
  const separacion = (s) => (s.direcciones ? 70 : 58);
  // Lo que ocupa una fila: sus nodos sueltos solo ocupan lugar cuando los hay.
  const altoFila = (s, sueltos) => (sueltos ? bajada(s) + ALTO_NODO + 22 + (s.direcciones ? 14 : 0) : ALTO_NODO);

  // Cuántos nodos caben por fila en el ancho del escenario (al menos 3: si
  // no caben, el dibujo se reduce). Se mide el ancho visible, sin el zoom del
  // motor, para que sea el mismo que en las copias con que el motor mide el alto.
  function columnas(lienzo, s) {
    const ancho = lienzo.closest(".desliza-lista").getBoundingClientRect().width;
    if (!ancho) return Number(lienzo.dataset.columnas) || 5; // paso oculto: se mide al mostrarlo
    return Math.max(3, Math.floor((ancho - X_LISTA - MARGEN - anchoNodo(s)) / pasoX(s)) + 1);
  }

  function posiciones(s, cols, conNulo) {
    const fila = cadena(s);
    const enFila = new Set(fila);
    // Un nodo recién desenganchado guarda su lugar hasta el delete.
    const reservados = Object.entries(s.nodos)
      .filter(([id, n]) => !enFila.has(id) && n.reserva != null)
      .sort((a, b) => a[1].reserva - b[1].reserva);
    const lugares = fila.slice();
    for (const [id, n] of reservados) lugares.splice(Math.min(n.reserva, lugares.length), 0, id);
    const filaDe = (k) => Math.max(0, Math.floor(k / cols));

    // El lugar k de cada nodo y si va debajo de su fila.
    const lugar = {};
    lugares.forEach((id, k) => { lugar[id] = { k, abajo: !enFila.has(id) }; });
    let extra = 0;
    for (const [id, n] of Object.entries(s.nodos)) {
      if (lugar[id]) continue;
      const k = n.ancla != null ? n.ancla : lugares.length + extra++;
      // Si abre una fila que todavía está vacía, aparece ya en ella.
      const f = filaDe(k);
      lugar[id] = { k, abajo: !(f > 0 && f * cols >= lugares.length) };
    }

    // Cada fila empieza debajo de la anterior y de sus nodos sueltos.
    let filas = conNulo ? filaDe(lugares.length) + 1 : 1;
    const conSueltos = [];
    for (const { k, abajo } of Object.values(lugar)) {
      filas = Math.max(filas, filaDe(k) + 1);
      if (abajo) conSueltos[filaDe(k)] = true;
    }
    const tops = [Y_FILA];
    for (let f = 1; f < filas; f++) tops[f] = tops[f - 1] + altoFila(s, conSueltos[f - 1]) + separacion(s);
    const en = (k, abajo) => ({ x: X_LISTA + (k - filaDe(k) * cols) * pasoX(s), y: tops[filaDe(k)] + (abajo ? bajada(s) : 0), abajo });

    const pos = {};
    for (const [id, { k, abajo }] of Object.entries(lugar)) pos[id] = Object.assign(en(k, abajo), { suelto: !enFila.has(id) });
    const ultima = filas - 1;
    const alto = tops[ultima] + (conSueltos[ultima] ? bajada(s) + ALTO_NODO + 34 : ALTO_NODO + (s.direcciones ? 28 : 14));
    return { pos, nulo: en(lugares.length, false), alto };
  }

  let lienzos = 0;

  function crearLienzo(escenario) {
    const n = ++lienzos;
    const svg = document.createElementNS(SVG, "svg");
    svg.innerHTML =
      "<defs>" +
      `<marker id="punta-lista-${n}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z"/></marker>` +
      `<marker id="punta-lista-activa-${n}" class="activa" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z"/></marker>` +
      "</defs>";
    const cabeza = el("div", { class: "lcabeza", "data-pieza": "cabeza" }, el("span", { class: "lcabeza-nombre", text: "cabeza" }), el("span", { class: "sig" }));
    const nulo = el("div", { class: "lnulo", text: "nullptr" });
    const lienzo = el("div", { class: "lienzo-enlazada", "data-n": n }, svg, cabeza, nulo);
    // Las variables quedan fijas; si el dibujo no cabe, solo él hace scroll.
    escenario.append(el("div", { class: "info-lista" }), el("div", { class: "desliza-lista" }, el("div", { class: "marco-lista" }, lienzo)));
    return lienzo;
  }

  if (typeof window !== "undefined") {
    window.addEventListener("resize", () => {
      for (const lienzo of document.querySelectorAll(".lienzo-enlazada")) {
        // Si cambia cuántos nodos caben por fila, se acomodan de nuevo.
        const s = lienzo._estado;
        if (s && columnas(lienzo, s) !== Number(lienzo.dataset.columnas)) dibujar(lienzo.closest(".escenario"), s);
        else escalar(lienzo);
      }
    });
  }

  // En pantallas angostas reducimos el dibujo; si aun así no cabe, hace scroll por dentro.
  const escala = (lienzo) => Math.max(0.6, Math.min(1, lienzo.closest(".desliza-lista").clientWidth / Number(lienzo.dataset.ancho)));

  function escalar(lienzo) {
    if (!lienzo.closest(".desliza-lista").clientWidth) return; // está en un paso oculto: se mide al mostrarlo
    const ancho = Number(lienzo.dataset.ancho);
    const alto = Number(lienzo.dataset.alto);
    const k = escala(lienzo);
    lienzo.style.transform = k < 1 ? `scale(${k})` : "";
    const marco = lienzo.parentElement;
    marco.style.width = `${ancho * k}px`;
    marco.style.height = `${alto * k}px`;
  }

  // Si el dibujo no cabe, se desplaza hasta lo que está pasando.
  function enfocar(lienzo) {
    const desliza = lienzo.closest(".desliza-lista");
    if (desliza.scrollWidth <= desliza.clientWidth) return;
    const foco = lienzo.querySelector(".lnulo.visible, .nodo.condenado, .nodo.encontrado, .nodo.activo");
    if (!foco) return;
    const centro = (parseFloat(foco.style.left) + 40) * escala(lienzo);
    desliza.scrollTo({ left: Math.max(0, centro - desliza.clientWidth / 2), behavior: "smooth" });
  }

  // Lo que sale del dibujo se desvanece en lugar de desaparecer de golpe.
  function retirar(nodo) {
    nodo.removeAttribute("data-id");
    nodo.removeAttribute("data-nombre");
    nodo.classList.add("saliendo");
    setTimeout(() => nodo.remove(), 400);
  }

  // Punto de salida de una flecha: el centro del campo siguiente o, si
  // muestra una dirección, su borde derecho (para no tapar el texto).
  function salida(pieza) {
    const sig = pieza.querySelector(".sig");
    const x = sig.textContent ? sig.offsetLeft + sig.offsetWidth - 2 : sig.offsetLeft + sig.offsetWidth / 2;
    return { x: pieza.offsetLeft + x, y: pieza.offsetTop + pieza.offsetHeight / 2 };
  }

  function camino(origen, destino, paso) {
    const { x: x1, y: y1 } = salida(origen);
    const tx = destino.offsetLeft;
    const ty = destino.offsetTop;
    const th = destino.offsetHeight;
    // Salta a la fila de abajo: sale por la derecha, cruza por encima de las
    // marcas de la fila nueva y entra al nodo por la izquierda, como las demás.
    if (ty > origen.offsetTop + 5 && tx < origen.offsetLeft) {
      const r = 10;
      const xd = origen.offsetLeft + origen.offsetWidth + 14;
      const xi = tx - 28;
      const yc = ty - 40;
      const y2 = ty + th / 2;
      return `M ${x1} ${y1} L ${xd - r} ${y1} Q ${xd} ${y1} ${xd} ${y1 + r} L ${xd} ${yc - r} Q ${xd} ${yc} ${xd - r} ${yc}`
        + ` L ${xi + r} ${yc} Q ${xi} ${yc} ${xi} ${yc + r} L ${xi} ${y2 - r} Q ${xi} ${y2} ${xi + r} ${y2} L ${tx - 3} ${y2}`;
    }
    if (Math.abs(ty - origen.offsetTop) < 5) {
      const x2 = tx - 3;
      const y2 = ty + th / 2;
      // Si salta por encima de un lugar vacío (al eliminar), hace un arco.
      if (x2 - x1 > paso * 1.4) return `M ${x1} ${y1} C ${x1 + 30} ${y1 - 58}, ${x2 - 40} ${y2 - 58}, ${x2} ${y2}`;
      return `M ${x1} ${y1} L ${x2} ${y2}`;
    }
    const arriba = ty < origen.offsetTop;
    const x2 = tx + 20;
    const y2 = arriba ? ty + th + 3 : ty - 3;
    return `M ${x1} ${y1} C ${x1 + 46} ${y1}, ${x2} ${arriba ? y2 + 46 : y2 - 46}, ${x2} ${y2}`;
  }

  // Las flechas se reutilizan por origen; si cambia su destino, se trazan de nuevo.
  function actualizarFlechas(lienzo, s, vis) {
    const n = lienzo.dataset.n;
    const svg = lienzo.querySelector("svg");
    const deseadas = new Map();
    if (s.cabeza != null) deseadas.set("cabeza", s.cabeza);
    for (const [id, nodo] of Object.entries(s.nodos)) if (nodo.sig != null && s.nodos[nodo.sig]) deseadas.set(id, nodo.sig);
    for (const path of svg.querySelectorAll("path.flecha")) {
      if (deseadas.get(path.dataset.de) !== path.dataset.a) path.remove();
    }
    for (const [de, a] of deseadas) {
      let path = svg.querySelector(`path.flecha[data-de="${de}"]`);
      if (!path) {
        path = document.createElementNS(SVG, "path");
        path.setAttribute("data-de", de);
        path.setAttribute("data-a", a);
        path.setAttribute("pathLength", "1");
        path.setAttribute("class", "flecha traza");
        svg.append(path);
      }
      const activa = vis.flecha === de;
      path.classList.toggle("activa", activa);
      path.setAttribute("marker-end", `url(#punta-lista${activa ? "-activa" : ""}-${n})`);
    }
    return deseadas;
  }

  function trazarFlechas(lienzo, deseadas, paso) {
    const svg = lienzo.querySelector("svg");
    for (const [de, a] of deseadas) {
      const path = svg.querySelector(`path.flecha[data-de="${de}"]`);
      const origen = de === "cabeza" ? lienzo.querySelector(".lcabeza") : lienzo.querySelector(`.nodo[data-id="${de}"]`);
      const destino = lienzo.querySelector(`.nodo[data-id="${a}"]`);
      if (path && origen && destino) path.setAttribute("d", camino(origen, destino, paso));
    }
  }

  function dibujar(escenario, s) {
    const lienzo = escenario.querySelector(".lienzo-enlazada") || crearLienzo(escenario);
    const vis = s.vis || {};
    const dx = pasoX(s);
    const cols = columnas(lienzo, s);
    lienzo.dataset.columnas = cols;
    lienzo._estado = s;
    lienzo.classList.toggle("con-direcciones", s.direcciones);

    // Variables y valor devuelto, arriba del dibujo.
    escenario.querySelector(".info-lista").replaceChildren(
      DS.variables(vis.vars || {}, vis.cambio),
      vis.salida != null ? el("div", { class: "salida-valor" }, "devuelve", el("div", { class: `celda ${vis.salida === "false" ? "error" : "encontrada"}`, text: vis.salida })) : "");

    // ¿Algún puntero local vale nullptr? Entonces se ve el "nullptr" al final.
    const nombres = ORDEN_PUNTEROS.filter((k) => s.ptrs[k] !== undefined);
    const algunoNulo = nombres.some((k) => s.ptrs[k] == null);
    const { pos, nulo: fin, alto } = posiciones(s, cols, algunoNulo);
    const nulo = lienzo.querySelector(".lnulo");
    nulo.style.left = `${fin.x}px`;
    nulo.style.top = `${fin.y + 8}px`;
    nulo.classList.toggle("visible", algunoNulo);

    // La variable cabeza, a la izquierda.
    const cabeza = lienzo.querySelector(".lcabeza");
    cabeza.style.left = `${MARGEN}px`;
    cabeza.style.top = `${Y_FILA}px`;
    const sigCabeza = cabeza.querySelector(".sig");
    sigCabeza.classList.toggle("nulo", s.cabeza == null);
    sigCabeza.classList.toggle("resaltado", vis.nulo === "cabeza");
    sigCabeza.textContent = s.direcciones && s.cabeza != null ? hex(s.nodos[s.cabeza].dir) : "";
    cabeza.classList.toggle("activa", vis.flecha === "cabeza");

    // Nodos.
    const vivos = new Set(Object.keys(s.nodos));
    for (const caja of lienzo.querySelectorAll(".nodo[data-id]")) if (!vivos.has(caja.dataset.id)) retirar(caja);
    for (const [id, nodo] of Object.entries(s.nodos)) {
      const p = pos[id];
      let caja = lienzo.querySelector(`.nodo[data-id="${id}"]`);
      let clase = "nodo";
      if (!caja) {
        caja = el("div", { class: "nodo", "data-id": id },
          el("span", { class: "valor" }), el("span", { class: "sig" }), el("span", { class: "ldireccion" }));
        caja.style.left = `${p.x}px`;
        caja.style.top = `${p.y}px`;
        lienzo.append(caja);
        clase += " nuevo";
      } else if (caja.classList.contains("nuevo") && caja.style.left === `${p.x}px` && caja.style.top === `${p.y}px`) {
        clase += " nuevo"; // que no se corte el pop si el paso no lo movió
      }
      caja.style.left = `${p.x}px`;
      caja.style.top = `${p.y}px`;
      caja.querySelector(".valor").textContent = nodo.v;
      const sig = caja.querySelector(".sig");
      sig.classList.toggle("nulo", nodo.sig == null);
      sig.classList.toggle("resaltado", vis.nulo === id);
      sig.textContent = s.direcciones && nodo.sig != null && s.nodos[nodo.sig] ? hex(s.nodos[nodo.sig].dir) : "";
      caja.querySelector(".ldireccion").textContent = s.direcciones ? hex(nodo.dir) : "";
      if (p.suelto) clase += " suelto";
      if (vis.activo === id) clase += " activo";
      if (vis.mirado === id) clase += " mirado";
      if (vis.encontrado === id) clase += " encontrado";
      if (vis.condenado === id) clase += " condenado";
      if ((vis.revisados || []).includes(id)) clase += " revisado";
      caja.className = clase;
    }

    // Punteros locales: marcas que se deslizan de nodo en nodo.
    const pila = {};
    for (const k of nombres) {
      const destino = s.ptrs[k];
      const lugar = destino == null ? Object.assign({ nulo: true }, fin) : pos[destino];
      if (!lugar) continue;
      const clave = destino == null ? "nulo" : destino;
      const nivel = (pila[clave] = (pila[clave] || 0) + 1) - 1;
      let marca = lienzo.querySelector(`.lpuntero[data-nombre="${k}"]`);
      if (!marca) {
        marca = el("span", { class: "lpuntero", "data-nombre": k });
        marca.style.left = `${lugar.x + 23}px`;
        lienzo.append(marca);
      }
      const ancla = lugar.nulo ? 34 : 23; // centro del campo valor (o del nullptr)
      marca.textContent = lugar.abajo ? `↑ ${k}` : `${k} ↓`;
      marca.style.left = `${lugar.x + ancla}px`;
      marca.style.top = lugar.abajo
        ? `${lugar.y + ALTO_NODO + 4 + nivel * 14 + (s.direcciones ? 14 : 0)}px`
        : `${lugar.y - 18 - nivel * 14}px`;
      marca.classList.toggle("nulo", destino == null);
      marca.classList.toggle("mala", destino == null && !!vis.error);
    }
    for (const marca of lienzo.querySelectorAll(".lpuntero[data-nombre]")) if (!nombres.includes(marca.dataset.nombre)) retirar(marca);

    // Tamaño del dibujo y sacudida si hubo un error.
    const derecha = Math.max(fin.x + (algunoNulo ? 80 : 0), ...Object.values(pos).map((p) => p.x + dx));
    const ancho = Math.max(320, derecha + MARGEN);
    lienzo.style.width = `${ancho}px`;
    lienzo.style.height = `${alto}px`;
    lienzo.dataset.ancho = ancho;
    lienzo.dataset.alto = alto;
    escalar(lienzo);
    lienzo.classList.remove("sacudir");
    if (vis.error) {
      void lienzo.offsetWidth; // reinicia la animación
      lienzo.classList.add("sacudir");
    }

    enfocar(lienzo);

    // Las flechas siguen a los nodos mientras se deslizan.
    const deseadas = actualizarFlechas(lienzo, s, vis);
    const hasta = performance.now() + 520;
    cancelAnimationFrame(lienzo._cuadro);
    const cuadro = () => {
      trazarFlechas(lienzo, deseadas, dx);
      if (performance.now() < hasta && lienzo.isConnected) lienzo._cuadro = requestAnimationFrame(cuadro);
    };
    cuadro();
  }

  // ------------------------------------------------------------------
  // Visualizadores de la lección
  // ------------------------------------------------------------------

  function visualizador(contenedor, opciones) {
    DS.tema({
      contenedor,
      incremental: true,
      dibujar,
      codigo: Object.fromEntries(opciones.ops.map((id) => [id, CODIGO[id]])),
      tituloCodigo: (clave) => `ListaEnlazada::${clave}()`,
      mensajeInicial: opciones.mensajeInicial,
      estadoInicial: opciones.estadoInicial,
      entradas: opciones.entradas,
      operaciones: opciones.ops.map((id) => Object.assign({ id }, OPS[id])),
    });
  }

  const VALOR = { id: "valor", etiqueta: "Valor", min: 0, max: 99, aleatorio: true };
  const POSICION = { id: "pos", etiqueta: "pos", min: -3, max: 12, valor: 2 };

  // Paso 1: obtener(pos), con las direcciones de memoria a la vista.
  visualizador("vis-obtener", {
    ops: ["obtener"],
    entradas: [POSICION],
    estadoInicial: () => estadoDesde([3, 7, 12, 20], { direcciones: true }),
    mensajeInicial: "Debajo de cada nodo está su dirección; en su campo siguiente, la dirección del próximo. Pulsa obtener(pos) y prueba también pos = 0 y pos = 6.",
  });

  // Pasos 2 a 5: una operación cada uno.
  visualizador("vis-inicio", {
    ops: ["insertarAlInicio"],
    entradas: [VALOR],
    estadoInicial: () => estadoDesde([7, 12]),
    mensajeInicial: "La lista tiene 7 y 12. Inserta un valor al inicio y fíjate en el orden de los dos punteros.",
  });

  visualizador("vis-final", {
    ops: ["insertarAlFinal"],
    entradas: [VALOR, { id: "inicial", etiqueta: "Lista inicial", opciones: [["llena", "3 → 7 → 12"], ["vacia", "vacía"]] }],
    estadoInicial: ({ inicial }) => estadoDesde(inicial === "vacia" ? [] : [3, 7, 12]),
    mensajeInicial: ({ inicial }) => inicial === "vacia"
      ? "La lista está vacía: cabeza es nullptr. Inserta al final para ver el caso especial."
      : "Inserta al final y cuenta cuántos saltos da actual antes de enlazar el nodo nuevo. Prueba también con la lista vacía.",
  });

  visualizador("vis-buscar", {
    ops: ["buscar"],
    entradas: [{ id: "valor", etiqueta: "Valor", min: 0, max: 99, valor: 12 }],
    estadoInicial: () => estadoDesde([3, 7, 12, 20]),
    mensajeInicial: "Busca 12; después un valor que no esté (por ejemplo 99).",
  });

  visualizador("vis-eliminar", {
    ops: ["eliminar"],
    entradas: [{ id: "valor", etiqueta: "Valor", min: 0, max: 99, valor: 12 }],
    estadoInicial: () => estadoDesde([3, 7, 12, 20]),
    mensajeInicial: "Elimina 12 (en medio), después 3 (la cabeza) y un valor que no esté.",
  });

  // Paso 7: todas las operaciones juntas.
  visualizador("vis-todo", {
    ops: ["insertarAlInicio", "insertarAlFinal", "buscar", "eliminar", "obtener"],
    entradas: [VALOR, Object.assign({}, POSICION, { valor: 1 })],
    estadoInicial: () => estadoDesde([3, 7, 12]),
    mensajeInicial: "La lista de main(): 3 → 7 → 12. Combina operaciones: pos solo se usa en obtener.",
  });

  // ------------------------------------------------------------------
  // Paso 6: ¿lista o vector? Cuánto trabajo hace cada uno según n
  // ------------------------------------------------------------------

  const COMPARACIONES = [
    {
      id: "inicio",
      titulo: "Insertar al inicio",
      vector: (n) => [n + 1, `corre ${fmt(n)} elementos y escribe 1`],
      lista: () => [3, "crea un nodo y cambia 2 punteros"],
      texto: "La lista gana siempre: no importa cuántos nodos haya detrás.",
    },
    {
      id: "final",
      titulo: "Insertar al final",
      vector: () => [1, "escribe en datos[tamano] (O(1) amortizado)"],
      lista: (n) => [n + 1, `recorre ${fmt(n)} nodos y cambia 1 puntero`],
      texto: "El vector gana. La lista empataría si guardara un puntero al último nodo (ejercicio del final).",
    },
    {
      id: "medio",
      titulo: "Leer la posición n / 2",
      vector: () => [1, "una cuenta y un salto"],
      lista: (n) => [Math.floor(n / 2), `${fmt(Math.floor(n / 2))} saltos de nodo en nodo`],
      texto: "El vector gana: es su gran ventaja, el acceso por índice.",
    },
    {
      id: "eliminar",
      titulo: "Eliminar el primero",
      vector: (n) => [n - 1, `corre ${fmt(n - 1)} elementos a la izquierda`],
      lista: () => [2, "mueve cabeza y hace delete"],
      texto: "La lista gana. (Si ya tienes el nodo anterior, borrar en medio también es O(1).)",
    },
    {
      id: "buscar",
      titulo: "Buscar (peor caso)",
      vector: (n) => [n, `revisa ${fmt(n)} casillas`],
      lista: (n) => [n, `revisa ${fmt(n)} nodos`],
      texto: "Empate en la cuenta, pero en la práctica el vector es varias veces más rápido: sus datos están juntos y el procesador los trae a la caché en bloque; los nodos están dispersos.",
    },
    {
      id: "memoria",
      titulo: "Memoria usada",
      unidad: "bytes",
      vector: (n) => [4 * n, `${fmt(4 * n)} bytes: 4 por int (más la capacidad libre)`],
      lista: (n) => [16 * n, `${fmt(16 * n)} bytes: int + puntero + relleno, 16 por nodo`],
      texto: "Cada nodo paga además su puntero (8 bytes en un sistema de 64 bits) y el relleno de alineación.",
    },
  ];

  function fmt(n) {
    return n.toLocaleString("es");
  }

  function montarComparador() {
    const caja = document.getElementById("comparador");
    if (!caja) return;
    let elegida = COMPARACIONES[0];
    const rango = el("input", { type: "range", min: 0, max: 3, step: 1, value: 2, "aria-label": "Cantidad de elementos" });
    const tamanos = [10, 100, 1000, 100000];
    const etiquetaN = el("b");
    const botones = COMPARACIONES.map((c) => el("button", { type: "button", text: c.titulo, onclick: () => { elegida = c; pintar(); } }));
    const barra = (nombre) => {
      const relleno = el("div", { class: "barra-comparador-relleno" });
      const cifra = el("span", { class: "barra-comparador-cifra" });
      const detalle = el("span", { class: "barra-comparador-detalle" });
      const fila = el("div", { class: "fila-comparador" },
        el("span", { class: "fila-comparador-nombre", text: nombre }),
        el("div", { class: "barra-comparador" }, relleno), cifra, detalle);
      return { fila, relleno, cifra, detalle };
    };
    const bVector = barra("vector");
    const bLista = barra("lista");
    const conclusion = el("p", { class: "resumen-costo", "aria-live": "polite" });

    function pintar() {
      const n = tamanos[Number(rango.value)];
      etiquetaN.textContent = fmt(n);
      botones.forEach((b, k) => b.setAttribute("aria-pressed", String(COMPARACIONES[k] === elegida)));
      const [cv, dv] = elegida.vector(n);
      const [cl, dl] = elegida.lista(n);
      const maximo = Math.max(cv, cl);
      const unidad = elegida.unidad || "pasos";
      for (const [b, costo, detalle, otro] of [[bVector, cv, dv, cl], [bLista, cl, dl, cv]]) {
        b.relleno.style.width = `${Math.max(1.5, (costo / maximo) * 100)}%`;
        b.relleno.classList.toggle("gana", costo < otro);
        b.relleno.classList.toggle("pierde", costo > otro);
        b.cifra.textContent = `${fmt(costo)} ${costo === 1 ? unidad.replace(/s$/, "") : unidad}`;
        b.detalle.textContent = detalle;
      }
      conclusion.textContent = elegida.texto;
    }

    rango.addEventListener("input", pintar);
    caja.classList.add("panel", "comparador");
    caja.append(
      el("div", { class: "controles" },
        el("div", { class: "selector-modo selector-comparador", role: "group", "aria-label": "Operación" }, botones)),
      el("div", { class: "cuerpo-comparador" },
        el("label", { class: "tamano-comparador" }, "Elementos: n = ", etiquetaN, rango),
        bVector.fila, bLista.fila),
      conclusion);
    pintar();
  }

  if (typeof document !== "undefined") montarComparador();
})();
