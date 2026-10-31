// Lista doblemente enlazada: nodos con anterior y siguiente, y la lista con cabeza y cola.
(function () {
  "use strict";

  const { el } = DS;
  const SVG = "http://www.w3.org/2000/svg";
  const MAXIMO = 8; // límite solo para que la animación quepa en pantalla
  const X0 = 24;
  const PASO = 124;
  const ANCHO = 92;
  const ALTO = 46;
  const Y_FILA = 44; // arriba quedan las marcas de cabeza y cola
  const BAJADA = 62; // el nodo nuevo espera un poco más abajo hasta quedar enganchado
  const EJEMPLO = [3, 7, 12, 20]; // la lista que arma main()

  // Copia exacta de las funciones de ejemplos/cpp/lista_doble.cpp.
  const CODIGO = {
    insertarAlInicio: `
      void insertarAlInicio(int valor) {
          Nodo* nuevo = new Nodo(valor);
          nuevo->siguiente = cabeza;
          if (cabeza != nullptr) {
              cabeza->anterior = nuevo;
          } else {
              cola = nuevo;  // estaba vacía: es el primero y el último
          }
          cabeza = nuevo;
          tamano++;
      }`,
    insertarAlFinal: `
      void insertarAlFinal(int valor) {
          Nodo* nuevo = new Nodo(valor);
          nuevo->anterior = cola;
          if (cola != nullptr) {
              cola->siguiente = nuevo;
          } else {
              cabeza = nuevo;  // estaba vacía: es el primero y el último
          }
          cola = nuevo;
          tamano++;
      }`,
    insertarEn: `
      void insertarEn(int pos, int valor) {
          if (pos < 0 || pos > tamano) {
              throw std::out_of_range("posicion invalida");
          }
          if (pos == 0) {
              insertarAlInicio(valor);
              return;
          }
          if (pos == tamano) {
              insertarAlFinal(valor);
              return;
          }
          Nodo* siguiente = nodoEn(pos);
          Nodo* anterior = siguiente->anterior;
          Nodo* nuevo = new Nodo(valor);
          nuevo->anterior = anterior;
          nuevo->siguiente = siguiente;
          anterior->siguiente = nuevo;
          siguiente->anterior = nuevo;
          tamano++;
      }`,
    obtener: `
      int obtener(int pos) const {
          if (pos < 0 || pos >= tamano) {
              throw std::out_of_range("posicion invalida");
          }
          return nodoEn(pos)->valor;
      }`,
    nodoEn: `
      Nodo* nodoEn(int pos) const {
          if (pos < tamano / 2) {
              Nodo* actual = cabeza;
              for (int i = 0; i < pos; i++) {
                  actual = actual->siguiente;
              }
              return actual;
          }
          Nodo* actual = cola;
          for (int i = tamano - 1; i > pos; i--) {
              actual = actual->anterior;
          }
          return actual;
      }`,
    eliminar: `
      bool eliminar(int valor) {
          Nodo* nodo = cabeza;
          while (nodo != nullptr && nodo->valor != valor) {
              nodo = nodo->siguiente;
          }
          if (nodo == nullptr) {
              return false;
          }
          desenganchar(nodo);
          return true;
      }`,
    eliminarAlFinal: `
      int eliminarAlFinal() {
          if (cola == nullptr) {
              throw std::out_of_range("lista vacia");
          }
          int valor = cola->valor;
          desenganchar(cola);
          return valor;
      }`,
    eliminarAlInicio: `
      int eliminarAlInicio() {
          if (cabeza == nullptr) {
              throw std::out_of_range("lista vacia");
          }
          int valor = cabeza->valor;
          desenganchar(cabeza);
          return valor;
      }`,
    desenganchar: `
      void desenganchar(Nodo* nodo) {
          if (nodo->anterior != nullptr) {
              nodo->anterior->siguiente = nodo->siguiente;
          } else {
              cabeza = nodo->siguiente;
          }
          if (nodo->siguiente != nullptr) {
              nodo->siguiente->anterior = nodo->anterior;
          } else {
              cola = nodo->anterior;
          }
          delete nodo;
          tamano--;
      }`,
  };

  // Las funciones que llama cada operación (su código también se muestra).
  const LLAMA = {
    obtener: ["nodoEn"],
    insertarEn: ["nodoEn", "insertarAlInicio", "insertarAlFinal"],
    eliminar: ["desenganchar"],
    eliminarAlFinal: ["desenganchar"],
    eliminarAlInicio: ["desenganchar"],
  };

  // ------------------------------------------------------------------
  // Estado
  // ------------------------------------------------------------------

  function crearNodo(s, v) {
    const id = `n${s.siguienteId++}`;
    s.nodos[id] = { v, ant: null, sig: null };
    return id;
  }

  function estadoDesde(valores) {
    const s = { nodos: {}, cabeza: null, cola: null, siguienteId: 1, ptrs: {}, vis: {} };
    for (const v of valores) {
      const id = crearNodo(s, v);
      s.nodos[id].ant = s.cola;
      if (s.cola != null) s.nodos[s.cola].sig = id;
      else s.cabeza = id;
      s.cola = id;
    }
    return s;
  }

  function cadena(s) {
    const ids = [];
    const vistos = new Set();
    for (let a = s.cabeza; a != null && s.nodos[a] && !vistos.has(a); a = s.nodos[a].sig) {
      vistos.add(a);
      ids.push(a);
    }
    return ids;
  }

  const tamano = (s) => cadena(s).length;
  const nombre = (s, id) => (id == null ? "nullptr" : `nodo ${s.nodos[id].v}`);
  const valores = (s) => cadena(s).map((id) => s.nodos[id].v);
  const texto = (s) => (valores(s).length ? valores(s).join(" ⇄ ") : "vacía");

  function ver(s, vis) {
    s.vis = vis;
  }

  // Mientras eliminar cambia punteros, el dibujo queda quieto; los nodos se
  // acomodan recién después del delete.
  function congelar(s) {
    if (!s.congelado) s.congelado = posiciones(s).pos;
  }

  // Al insertar, la fila le abre lugar al nodo nuevo en la posición k, y el
  // nuevo espera un poco más abajo hasta que termina de engancharse.
  function hacerLugar(s, id, k) {
    s.nodos[id].entre = k;
  }
  function soltar(s) {
    delete s.congelado;
    for (const n of Object.values(s.nodos)) delete n.entre;
  }

  function limite(s, clave, paso) {
    ver(s, { error: true });
    paso(clave, 0, `Para que quepa en pantalla, la lista llega hasta ${MAXIMO} nodos. Elimina alguno o pulsa Reiniciar.`, "error");
  }

  // ------------------------------------------------------------------
  // Animaciones
  // ------------------------------------------------------------------

  function animarNodoEn(s, pos, paso, pila) {
    const C = "nodoEn";
    const n = tamano(s);
    const ids = cadena(s);
    const llamadas = [...pila, `nodoEn(${pos})`];
    const desdeCabeza = pos < Math.floor(n / 2);
    ver(s, { pila: llamadas, vars: { pos, tamano: n, "tamano / 2": Math.floor(n / 2) } });
    paso(C, 2, desdeCabeza
      ? `¿${pos} < ${n} / 2 = ${Math.floor(n / 2)}? Sí: pos está en la primera mitad, conviene empezar por la cabeza.`
      : `¿${pos} < ${n} / 2 = ${Math.floor(n / 2)}? No: pos está en la segunda mitad, conviene empezar por la cola y caminar hacia atrás.`);
    let k = desdeCabeza ? 0 : n - 1;
    s.ptrs.actual = ids[k];
    const vars = () => ({ pos, i: k, actual: nombre(s, ids[k]) });
    ver(s, { pila: llamadas, vars: vars(), cambio: ["actual"], activo: ids[k], flecha: desdeCabeza ? "cabeza" : "cola" });
    paso(C, desdeCabeza ? 3 : 9, `actual = ${desdeCabeza ? "cabeza" : "cola"} (el ${s.nodos[ids[k]].v}, posición ${k}).`);
    while (k !== pos) {
      const de = ids[k];
      k += desdeCabeza ? 1 : -1;
      s.ptrs.actual = ids[k];
      ver(s, { pila: llamadas, vars: vars(), cambio: ["actual", "i"], activo: ids[k], flecha: `${desdeCabeza ? "s" : "a"}:${de}` });
      paso(C, desdeCabeza ? 5 : 11, `actual = actual->${desdeCabeza ? "siguiente" : "anterior"}: el ${s.nodos[ids[k]].v}, posición ${k}.`);
    }
    const saltos = desdeCabeza ? pos : n - 1 - pos;
    ver(s, { pila: llamadas, vars: vars(), encontrado: ids[k] });
    paso(C, desdeCabeza ? 7 : 13, `Llegamos a la posición ${pos} en ${saltos} salto(s)${desdeCabeza ? "" : `; desde la cabeza habrían sido ${pos}`}.`);
    return ids[k];
  }

  function animarAlInicio(s, valor, paso, pila, final) {
    const C = "insertarAlInicio";
    const llamadas = [...pila, `insertarAlInicio(${valor})`];
    const id = crearNodo(s, valor);
    hacerLugar(s, id, 0);
    s.ptrs = { nuevo: id };
    const vars = () => ({ valor, nuevo: nombre(s, id) });
    ver(s, { pila: llamadas, vars: vars(), cambio: ["nuevo"], nuevo: id });
    paso(C, 2, `new Nodo(${valor}): anterior y siguiente empiezan en nullptr.`);
    s.nodos[id].sig = s.cabeza;
    ver(s, { pila: llamadas, vars: vars(), flecha: `s:${id}`, celda: `s:${id}` });
    paso(C, 3, s.cabeza == null ? "nuevo->siguiente = cabeza, que es nullptr: la lista estaba vacía." : `nuevo->siguiente = cabeza: el nuevo apunta al ${s.nodos[s.cabeza].v}.`);
    if (s.cabeza != null) {
      s.nodos[s.cabeza].ant = id;
      ver(s, { pila: llamadas, vars: vars(), flecha: `a:${s.cabeza}`, celda: `a:${s.cabeza}` });
      paso(C, 5, `cabeza->anterior = nuevo: el ${s.nodos[s.cabeza].v} ahora sabe quién está antes que él. Es el puntero que la lista simple no tiene.`);
    } else {
      s.cola = id;
      ver(s, { pila: llamadas, vars: vars(), flecha: "cola" });
      paso(C, 7, "La lista estaba vacía: cola = nuevo. Es el primero y también el último.");
    }
    s.cabeza = id;
    ver(s, { pila: llamadas, vars: vars(), flecha: "cabeza" });
    paso(C, 9, "cabeza = nuevo.");
    soltar(s);
    s.ptrs = {};
    ver(s, { pila: llamadas, vars: { tamano: tamano(s) }, cambio: ["tamano"], encontrado: id });
    paso(C, 10, `tamano++: ${texto(s)}. Cuatro pasos, sin recorrer nada: O(1).`, final ? "exito" : "");
  }

  function animarAlFinal(s, valor, paso, pila, final) {
    const C = "insertarAlFinal";
    const llamadas = [...pila, `insertarAlFinal(${valor})`];
    const n = tamano(s);
    const id = crearNodo(s, valor);
    hacerLugar(s, id, n);
    s.ptrs = { nuevo: id };
    const vars = () => ({ valor, nuevo: nombre(s, id) });
    ver(s, { pila: llamadas, vars: vars(), cambio: ["nuevo"], nuevo: id });
    paso(C, 2, `new Nodo(${valor}): anterior y siguiente empiezan en nullptr.`);
    s.nodos[id].ant = s.cola;
    ver(s, { pila: llamadas, vars: vars(), flecha: `a:${id}`, celda: `a:${id}` });
    paso(C, 3, s.cola == null ? "nuevo->anterior = cola, que es nullptr: la lista estaba vacía." : `nuevo->anterior = cola: el nuevo apunta hacia atrás, al ${s.nodos[s.cola].v}.`);
    if (s.cola != null) {
      s.nodos[s.cola].sig = id;
      ver(s, { pila: llamadas, vars: vars(), flecha: `s:${s.cola}`, celda: `s:${s.cola}` });
      paso(C, 5, `cola->siguiente = nuevo: sin cola habría que recorrer toda la lista para llegar al ${s.nodos[s.cola].v}.`);
    } else {
      s.cabeza = id;
      ver(s, { pila: llamadas, vars: vars(), flecha: "cabeza" });
      paso(C, 7, "La lista estaba vacía: cabeza = nuevo. Es el primero y también el último.");
    }
    s.cola = id;
    ver(s, { pila: llamadas, vars: vars(), flecha: "cola" });
    paso(C, 9, "cola = nuevo.");
    soltar(s);
    s.ptrs = {};
    ver(s, { pila: llamadas, vars: { tamano: tamano(s) }, cambio: ["tamano"], encontrado: id });
    paso(C, 10, `tamano++: ${texto(s)}. También O(1), gracias a cola.`, final ? "exito" : "");
  }

  function animarInsertarEn(s, pos, valor, paso) {
    const C = "insertarEn";
    const n = tamano(s);
    const pila = [`insertarEn(${pos}, ${valor})`];
    if (pos < 0 || pos > n) {
      ver(s, { pila, vars: { pos, tamano: n }, posMala: pos, error: true });
      paso(C, 3, `pos = ${pos} no está entre 0 y tamano = ${n}: lanza out_of_range.`, "error");
      return;
    }
    if (n >= MAXIMO) return limite(s, C, paso);
    if (pos === 0) {
      ver(s, { pila, vars: { pos } });
      paso(C, 6, "pos == 0: es insertar al inicio, y esa función ya existe.");
      return animarAlInicio(s, valor, paso, pila, true);
    }
    if (pos === n) {
      ver(s, { pila, vars: { pos, tamano: n } });
      paso(C, 10, `pos == tamano (${n}): es insertar al final, en O(1) gracias a cola.`);
      return animarAlFinal(s, valor, paso, pila, true);
    }
    const siguiente = animarNodoEn(s, pos, paso, pila);
    s.ptrs = { siguiente };
    const vars = (extra) => Object.assign({ pos, valor, siguiente: nombre(s, siguiente) }, extra);
    ver(s, { pila, vars: vars(), cambio: ["siguiente"], activo: siguiente });
    paso(C, 13, `siguiente = nodoEn(${pos}): el ${s.nodos[siguiente].v} es el que hoy está en la posición ${pos}. El nuevo va justo antes.`);
    const anterior = s.nodos[siguiente].ant;
    s.ptrs.anterior = anterior;
    ver(s, { pila, vars: vars({ anterior: nombre(s, anterior) }), cambio: ["anterior"], activo: anterior, flecha: `a:${siguiente}` });
    paso(C, 14, `anterior = siguiente->anterior: el ${s.nodos[anterior].v}. ¡No hubo que buscarlo!`);
    const id = crearNodo(s, valor);
    hacerLugar(s, id, pos);
    s.ptrs.nuevo = id;
    const varsN = () => vars({ anterior: nombre(s, anterior), nuevo: nombre(s, id) });
    ver(s, { pila, vars: varsN(), cambio: ["nuevo"], nuevo: id });
    paso(C, 15, `new Nodo(${valor}). Ahora hay que cambiar cuatro punteros: dos del nuevo y uno de cada vecino.`);
    s.nodos[id].ant = anterior;
    ver(s, { pila, vars: varsN(), flecha: `a:${id}`, celda: `a:${id}` });
    paso(C, 16, `nuevo->anterior = anterior (el ${s.nodos[anterior].v}).`);
    s.nodos[id].sig = siguiente;
    ver(s, { pila, vars: varsN(), flecha: `s:${id}`, celda: `s:${id}` });
    paso(C, 17, `nuevo->siguiente = siguiente (el ${s.nodos[siguiente].v}). El nuevo ya conoce a sus vecinos, pero ellos todavía no a él.`);
    s.nodos[anterior].sig = id;
    ver(s, { pila, vars: varsN(), flecha: `s:${anterior}`, celda: `s:${anterior}` });
    paso(C, 18, `anterior->siguiente = nuevo: yendo hacia adelante, del ${s.nodos[anterior].v} ya se pasa al ${valor}.`);
    s.nodos[siguiente].ant = id;
    ver(s, { pila, vars: varsN(), flecha: `a:${siguiente}`, celda: `a:${siguiente}` });
    paso(C, 19, `siguiente->anterior = nuevo: y hacia atrás, del ${s.nodos[siguiente].v} se llega al ${valor}. Los cuatro punteros listos.`);
    soltar(s);
    s.ptrs = {};
    ver(s, { pila, vars: { tamano: tamano(s) }, cambio: ["tamano"], encontrado: id });
    paso(C, 20, `tamano++: ${texto(s)}.`, "exito");
  }

  function animarObtener(s, pos, paso) {
    const C = "obtener";
    const n = tamano(s);
    const pila = [`obtener(${pos})`];
    if (pos < 0 || pos >= n) {
      ver(s, { pila, vars: { pos, tamano: n }, posMala: pos, error: true });
      paso(C, 3, n ? `pos = ${pos} no está entre 0 y ${n - 1}: lanza out_of_range.` : "La lista está vacía: cualquier pos lanza out_of_range.", "error");
      return;
    }
    const id = animarNodoEn(s, pos, paso, pila);
    s.ptrs = {};
    ver(s, { pila, vars: { pos }, encontrado: id, salida: s.nodos[id].v });
    paso(C, 5, `return nodoEn(${pos})->valor: devuelve ${s.nodos[id].v}.`, "exito");
  }

  function animarDesenganchar(s, id, paso, pila) {
    const C = "desenganchar";
    const llamadas = [...pila, `desenganchar(${nombre(s, id)})`];
    const n = s.nodos[id];
    congelar(s);
    s.ptrs = { nodo: id };
    const vars = () => ({ nodo: nombre(s, id), anterior: nombre(s, n.ant), siguiente: nombre(s, n.sig) });
    if (n.ant != null) {
      s.nodos[n.ant].sig = n.sig;
      ver(s, { pila: llamadas, vars: vars(), condenado: id, flecha: `s:${n.ant}`, celda: `s:${n.ant}` });
      paso(C, 3, `nodo->anterior->siguiente = nodo->siguiente: el ${s.nodos[n.ant].v} salta al ${n.sig == null ? "nullptr" : s.nodos[n.sig].v}. El nodo sabe quién es su anterior: no hay que buscarlo.`);
    } else {
      s.cabeza = n.sig;
      ver(s, { pila: llamadas, vars: vars(), condenado: id, flecha: "cabeza" });
      paso(C, 5, `No tiene anterior: es la cabeza. cabeza = nodo->siguiente (${nombre(s, n.sig)}).`);
    }
    if (n.sig != null) {
      s.nodos[n.sig].ant = n.ant;
      ver(s, { pila: llamadas, vars: vars(), condenado: id, flecha: `a:${n.sig}`, celda: `a:${n.sig}` });
      paso(C, 8, `nodo->siguiente->anterior = nodo->anterior: el ${s.nodos[n.sig].v} apunta hacia atrás a ${nombre(s, n.ant)}. Nadie apunta ya al ${n.v}.`);
    } else {
      s.cola = n.ant;
      ver(s, { pila: llamadas, vars: vars(), condenado: id, flecha: "cola" });
      paso(C, 10, `No tiene siguiente: es la cola. cola = nodo->anterior (${nombre(s, n.ant)}).`);
    }
    const v = n.v;
    delete s.nodos[id];
    soltar(s);
    s.ptrs = {};
    ver(s, { pila: llamadas, vars: { tamano: tamano(s) } });
    paso(C, 12, `delete nodo: se libera el ${v} y los demás se acomodan.`);
    ver(s, { pila: llamadas, vars: { tamano: tamano(s) }, cambio: ["tamano"] });
    paso(C, 13, `tamano--: ${texto(s)}. Desenganchar fue O(1): cuatro punteros como mucho.`);
    return v;
  }

  function animarEliminar(s, valor, paso) {
    const C = "eliminar";
    const pila = [`eliminar(${valor})`];
    let nodo = s.cabeza;
    s.ptrs = { nodo };
    const vars = () => ({ valor, nodo: nombre(s, nodo) });
    ver(s, { pila, vars: vars(), activo: nodo, flecha: "cabeza" });
    paso(C, 2, nodo == null ? "nodo = cabeza, que es nullptr: la lista está vacía." : `nodo = cabeza (el ${s.nodos[nodo].v}).`);
    const revisados = [];
    while (nodo != null && s.nodos[nodo].v !== valor) {
      revisados.push(nodo);
      const de = nodo;
      nodo = s.nodos[nodo].sig;
      s.ptrs.nodo = nodo;
      ver(s, { pila, vars: vars(), cambio: ["nodo"], activo: nodo, revisados, flecha: `s:${de}` });
      paso(C, 4, `${s.nodos[de].v} ≠ ${valor}: nodo = nodo->siguiente${nodo == null ? ", que es nullptr" : ` (el ${s.nodos[nodo].v})`}.`);
    }
    if (nodo == null) {
      ver(s, { pila, vars: vars(), revisados, salida: "false", error: true });
      paso(C, 7, `${valor} no está en la lista: devuelve false.`, "error");
      s.ptrs = {};
      return;
    }
    ver(s, { pila, vars: vars(), encontrado: nodo, revisados });
    paso(C, 9, `Encontrado: el ${valor}. Buscarlo costó O(n); sacarlo es O(1) con desenganchar.`);
    animarDesenganchar(s, nodo, paso, pila);
    ver(s, { pila, vars: { valor }, salida: "true" });
    paso(C, 10, `Devuelve true: ${texto(s)}.`, "exito");
  }

  function animarEliminarExtremo(s, extremo, paso) {
    const C = extremo === "final" ? "eliminarAlFinal" : "eliminarAlInicio";
    const ptr = extremo === "final" ? "cola" : "cabeza";
    const pila = [`${C}()`];
    const id = s[ptr];
    if (id == null) {
      ver(s, { pila, vars: { [ptr]: "nullptr" }, error: true, vacia: true });
      paso(C, 3, `${ptr} es nullptr: la lista está vacía y no hay nada que sacar. Lanza out_of_range.`, "error");
      return;
    }
    const valor = s.nodos[id].v;
    ver(s, { pila, vars: { valor }, cambio: ["valor"], activo: id, flecha: ptr });
    paso(C, 5, `int valor = ${ptr}->valor = ${valor}: se guarda antes de borrar el nodo.`);
    ver(s, { pila, vars: { valor }, condenado: id, flecha: ptr });
    paso(C, 6, `desenganchar(${ptr}): ${extremo === "final" ? "llegamos al último sin recorrer, y su anterior ya lo conocemos" : "el primero no tiene anterior"}.`);
    animarDesenganchar(s, id, paso, pila);
    ver(s, { pila, vars: { valor }, salida: valor });
    paso(C, 7, `Devuelve ${valor}. ${extremo === "final" ? "En una lista simple, esto costaría O(n): hay que encontrar el penúltimo." : "O(1), igual que en la lista simple."}`, "exito");
  }

  // ------------------------------------------------------------------
  // Dibujo
  // ------------------------------------------------------------------

  function posiciones(s) {
    const pos = {};
    const enCadena = new Set(cadena(s));
    if (s.congelado) {
      for (const id of Object.keys(s.nodos)) if (s.congelado[id]) pos[id] = Object.assign({}, s.congelado[id]);
    } else {
      const orden = cadena(s).filter((id) => s.nodos[id].entre == null);
      const entrando = Object.keys(s.nodos).filter((id) => s.nodos[id].entre != null).sort((a, b) => s.nodos[a].entre - s.nodos[b].entre);
      for (const id of entrando) orden.splice(Math.min(s.nodos[id].entre, orden.length), 0, id);
      orden.forEach((id, k) => { pos[id] = { x: X0 + k * PASO, y: Y_FILA + (s.nodos[id].entre != null ? BAJADA : 0) }; });
    }
    for (const id of Object.keys(pos)) pos[id].suelto = !enCadena.has(id) || pos[id].y > Y_FILA;
    return { pos, n: Math.max(enCadena.size, Object.keys(pos).length) };
  }

  let lienzos = 0;

  function crearLienzo(escenario) {
    const n = ++lienzos;
    const svg = document.createElementNS(SVG, "svg");
    svg.innerHTML =
      "<defs>" +
      `<marker id="punta-doble-${n}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z"/></marker>` +
      `<marker id="punta-doble-activa-${n}" class="activa" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z"/></marker>` +
      "</defs>";
    const vacia = el("div", { class: "doble-vacia", text: "nullptr" });
    const lienzo = el("div", { class: "lienzo-doble", "data-n": n }, svg, vacia);
    escenario.append(el("div", { class: "info-doble" }), el("div", { class: "desliza-doble" }, el("div", { class: "marco-doble" }, lienzo)));
    return lienzo;
  }

  if (typeof window !== "undefined") {
    window.addEventListener("resize", () => {
      for (const lienzo of document.querySelectorAll(".lienzo-doble")) {
        escalar(lienzo);
        trazarFlechas(lienzo);
      }
    });
  }

  // En escenarios angostos el dibujo se reduce; si aun así no cabe, hace scroll por dentro.
  function escalar(lienzo) {
    const desliza = lienzo.closest(".desliza-doble");
    if (!desliza || !desliza.clientWidth) return; // paso oculto: se mide al mostrarlo
    const ancho = Number(lienzo.dataset.ancho);
    const alto = Number(lienzo.dataset.alto);
    const k = Math.max(0.6, Math.min(1, desliza.clientWidth / ancho));
    lienzo.style.transform = k < 1 ? `scale(${k})` : "";
    const marco = lienzo.parentElement;
    marco.style.width = `${ancho * k}px`;
    marco.style.height = `${alto * k}px`;
  }

  function retirar(pieza) {
    pieza.removeAttribute("data-id");
    pieza.removeAttribute("data-nombre");
    pieza.classList.add("saliendo");
    setTimeout(() => pieza.remove(), 450);
  }

  // Flechas: s:<id> sale de la casilla siguiente (arriba) y a:<id> de la casilla anterior (abajo).
  function flechasDeseadas(s) {
    const deseadas = new Map();
    for (const [id, n] of Object.entries(s.nodos)) {
      if (n.sig != null && s.nodos[n.sig]) deseadas.set(`s:${id}`, n.sig);
      if (n.ant != null && s.nodos[n.ant]) deseadas.set(`a:${id}`, n.ant);
    }
    return deseadas;
  }

  function actualizarFlechas(lienzo, s, vis) {
    const n = lienzo.dataset.n;
    const svg = lienzo.querySelector("svg");
    const deseadas = flechasDeseadas(s);
    for (const path of svg.querySelectorAll("path.flecha")) if (deseadas.get(path.dataset.de) !== path.dataset.a) path.remove();
    for (const [de, a] of deseadas) {
      let path = svg.querySelector(`path.flecha[data-de="${de}"]`);
      if (!path) {
        path = document.createElementNS(SVG, "path");
        path.setAttribute("data-de", de);
        path.setAttribute("data-a", a);
        path.setAttribute("pathLength", "1");
        path.setAttribute("class", `flecha traza ${de[0] === "s" ? "hacia-adelante" : "hacia-atras"}`);
        svg.append(path);
      }
      const activa = vis.flecha === de;
      path.classList.toggle("activa", activa);
      path.setAttribute("marker-end", `url(#punta-doble${activa ? "-activa" : ""}-${n})`);
    }
  }

  function trazarFlechas(lienzo) {
    for (const path of lienzo.querySelectorAll("svg path.flecha")) {
      const [tipo, id] = path.dataset.de.split(":");
      const origen = lienzo.querySelector(`.dnodo[data-id="${id}"]`);
      const destino = lienzo.querySelector(`.dnodo[data-id="${path.dataset.a}"]`);
      if (!origen || !destino) continue;
      const o = { x: origen.offsetLeft, y: origen.offsetTop, w: origen.offsetWidth, h: origen.offsetHeight };
      const d = { x: destino.offsetLeft, y: destino.offsetTop, w: destino.offsetWidth, h: destino.offsetHeight };
      const adelante = tipo === "s";
      // La casilla siguiente está a la derecha y la anterior a la izquierda.
      const x1 = adelante ? o.x + o.w - 11 : o.x + 11;
      const y1 = o.y + (adelante ? 15 : o.h - 15);
      const aDerecha = d.x > o.x + 5;
      const x2 = aDerecha ? d.x - 2 : d.x + d.w + 2;
      const y2 = d.y + (adelante ? 15 : d.h - 15);
      const misma = Math.abs(d.y - o.y) < 5;
      if (misma && Math.abs(d.x - o.x) > PASO * 1.4) {
        // Salta por encima (siguiente) o por debajo (anterior) de un nodo.
        const curva = adelante ? -52 : 52;
        path.setAttribute("d", `M ${x1} ${y1} C ${x1 + (aDerecha ? 40 : -40)} ${y1 + curva}, ${x2 + (aDerecha ? -40 : 40)} ${y2 + curva}, ${x2} ${y2}`);
      } else {
        path.setAttribute("d", `M ${x1} ${y1} L ${x2} ${y2}`);
      }
    }
  }

  function dibujar(escenario, s) {
    const lienzo = escenario.querySelector(".lienzo-doble") || crearLienzo(escenario);
    const vis = s.vis || {};
    const { pos, n } = posiciones(s);

    // Arriba: llamadas en curso, variables y valor devuelto.
    const malo = vis.salida === "false";
    escenario.querySelector(".info-doble").replaceChildren(
      vis.pila && vis.pila.length > 1
        ? el("div", { class: "pila-llamadas", "aria-label": "Llamadas en curso" },
          vis.pila.flatMap((t, k) => [k ? "›" : "", el("span", { class: "llamada", text: t })]))
        : "",
      DS.variables(vis.vars || { tamano: tamano(s) }, vis.cambio),
      vis.salida != null ? el("div", { class: "salida-valor" }, "devuelve", el("div", { class: `celda ${malo ? "error" : "encontrada"}`, text: vis.salida })) : "");

    // Nodos.
    const vivos = new Set(Object.keys(s.nodos));
    for (const caja of lienzo.querySelectorAll(".dnodo[data-id]")) if (!vivos.has(caja.dataset.id)) retirar(caja);
    for (const [id, nodo] of Object.entries(s.nodos)) {
      const p = pos[id];
      if (!p) continue;
      let caja = lienzo.querySelector(`.dnodo[data-id="${id}"]`);
      let clase = "dnodo";
      if (!caja) {
        caja = el("div", { class: "dnodo", "data-id": id },
          el("span", { class: "ptr ant" }), el("span", { class: "valor" }), el("span", { class: "ptr sig" }));
        caja.style.left = `${p.x}px`;
        caja.style.top = `${p.y}px`;
        lienzo.append(caja);
        if (vis.nuevo === id) clase += " nuevo";
      } else if (caja.classList.contains("nuevo") && vis.nuevo === id) {
        clase += " nuevo";
      }
      caja.style.left = `${p.x}px`;
      caja.style.top = `${p.y}px`;
      caja.querySelector(".valor").textContent = nodo.v;
      for (const [lado, campo] of [["ant", "a"], ["sig", "s"]]) {
        const celda = caja.querySelector(`.ptr.${lado}`);
        celda.classList.toggle("nulo", nodo[lado] == null);
        celda.classList.toggle("resaltado", vis.celda === `${campo}:${id}`);
      }
      if (p.suelto) clase += " suelto";
      if (vis.activo === id) clase += " activo";
      if (vis.encontrado === id) clase += " encontrado";
      if (vis.condenado === id) clase += " condenado";
      if ((vis.revisados || []).includes(id)) clase += " revisado";
      caja.className = clase;
    }

    // Con la lista vacía, cabeza y cola apuntan a nullptr.
    const vacia = lienzo.querySelector(".doble-vacia");
    vacia.style.left = `${X0 + 10}px`;
    vacia.style.top = `${Y_FILA + 10}px`;
    vacia.classList.toggle("visible", s.cabeza == null);

    // Marcas: cabeza y cola arriba de su nodo; los punteros locales, abajo.
    const grupos = {};
    const agregar = (clave, nombreMarca, arriba) => {
      const g = (grupos[`${clave}|${arriba ? "a" : "b"}`] = grupos[`${clave}|${arriba ? "a" : "b"}`] || { clave, arriba, nombres: [] });
      g.nombres.push(nombreMarca);
    };
    for (const ptr of ["cabeza", "cola"]) agregar(s[ptr] == null ? "vacia" : s[ptr], ptr, true);
    for (const [k, destino] of Object.entries(s.ptrs || {})) if (destino != null && pos[destino]) agregar(destino, k, false);
    const presentes = new Set();
    for (const g of Object.values(grupos)) {
      const lugar = g.clave === "vacia" ? { x: X0 + 10, y: Y_FILA + 10 } : pos[g.clave];
      if (!lugar) continue;
      const x = lugar.x + (g.clave === "vacia" ? 30 : ANCHO / 2);
      const y = g.arriba ? lugar.y - 18 : lugar.y + ALTO + 4;
      g.nombres.forEach((k, i) => {
        presentes.add(k);
        let marca = lienzo.querySelector(`.lpuntero[data-nombre="${k}"]`);
        if (!marca) {
          marca = el("span", { class: `lpuntero${g.arriba ? " global" : ""}`, "data-nombre": k });
          marca.style.left = `${x}px`;
          marca.style.top = `${y}px`;
          lienzo.append(marca);
        }
        marca.textContent = g.arriba ? `${g.nombres.join(", ")} ↓` : `↑ ${g.nombres.join(", ")}`;
        marca.style.left = `${x}px`;
        marca.style.top = `${y}px`;
        marca.classList.toggle("oculta", i > 0);
        marca.classList.toggle("activa", vis.flecha === k);
      });
    }
    for (const marca of lienzo.querySelectorAll(".lpuntero[data-nombre]")) if (!presentes.has(marca.dataset.nombre)) retirar(marca);

    // Una posición inválida: marca roja después del último nodo (o antes del primero).
    let mala = lienzo.querySelector(".doble-pos-mala");
    if (vis.posMala != null) {
      if (!mala) {
        mala = el("span", { class: "lpuntero mala doble-pos-mala" });
        lienzo.append(mala);
      }
      const k = vis.posMala < 0 ? -0.5 : Math.max(n, 0);
      mala.textContent = `↑ pos = ${vis.posMala}`;
      mala.style.left = `${X0 + k * PASO + 24}px`;
      mala.style.top = `${Y_FILA + ALTO + 4}px`;
    } else if (mala) {
      retirar(mala);
    }

    // Tamaño del dibujo y sacudida si hubo un error.
    const xs = Object.values(pos).map((p) => p.x + ANCHO);
    const ancho = Math.max(360, X0 + Math.max(n, 1) * PASO + 20, ...xs.map((x) => x + 30), vis.posMala != null ? X0 + (n + 1) * PASO : 0);
    const conSueltos = Object.values(pos).some((p) => p.y > Y_FILA);
    const alto = conSueltos ? Y_FILA + BAJADA + ALTO + 24 : Y_FILA + ALTO + 24;
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

    // Las flechas siguen a los nodos mientras se deslizan.
    actualizarFlechas(lienzo, s, vis);
    const hasta = performance.now() + 520;
    cancelAnimationFrame(lienzo._cuadro);
    const cuadro = () => {
      trazarFlechas(lienzo);
      if (performance.now() < hasta && lienzo.isConnected) lienzo._cuadro = requestAnimationFrame(cuadro);
    };
    cuadro();
  }

  // ------------------------------------------------------------------
  // Visualizadores de la lección
  // ------------------------------------------------------------------

  const VALOR = { id: "valor", etiqueta: "Valor", min: 0, max: 99, aleatorio: true };
  const POSICION = { id: "pos", etiqueta: "pos", min: -3, max: 12, valor: 2 };

  const OPS = {
    obtener: { etiqueta: "obtener(pos)", usa: ["pos"], ejecutar(s, { pos }, paso) { animarObtener(s, pos, paso); } },
    insertarAlInicio: {
      etiqueta: "insertarAlInicio(valor)",
      usa: ["valor"],
      ejecutar(s, { valor }, paso) { if (tamano(s) >= MAXIMO) return limite(s, "insertarAlInicio", paso); animarAlInicio(s, valor, paso, [], true); },
    },
    insertarAlFinal: {
      etiqueta: "insertarAlFinal(valor)",
      usa: ["valor"],
      ejecutar(s, { valor }, paso) { if (tamano(s) >= MAXIMO) return limite(s, "insertarAlFinal", paso); animarAlFinal(s, valor, paso, [], true); },
    },
    insertarEn: { etiqueta: "insertarEn(pos, valor)", usa: ["pos", "valor"], ejecutar(s, { pos, valor }, paso) { animarInsertarEn(s, pos, valor, paso); } },
    eliminar: { etiqueta: "eliminar(valor)", usa: ["valor"], ejecutar(s, { valor }, paso) { animarEliminar(s, valor, paso); } },
    eliminarAlInicio: { etiqueta: "eliminarAlInicio()", ejecutar(s, args, paso) { animarEliminarExtremo(s, "inicio", paso); } },
    eliminarAlFinal: { etiqueta: "eliminarAlFinal()", ejecutar(s, args, paso) { animarEliminarExtremo(s, "final", paso); } },
  };

  function visualizador(contenedor, opciones) {
    const claves = new Set();
    for (const op of opciones.ops) [op, ...(LLAMA[op] || [])].forEach((k) => claves.add(k));
    DS.tema({
      contenedor,
      incremental: true,
      dibujar,
      codigo: Object.fromEntries([...claves].map((k) => [k, CODIGO[k]])),
      tituloCodigo: (clave) => `ListaDoble::${clave}()`,
      mensajeInicial: opciones.mensajeInicial,
      estadoInicial: opciones.estadoInicial || (() => estadoDesde(EJEMPLO)),
      entradas: opciones.entradas,
      operaciones: opciones.ops.map((id) => Object.assign({ id, codigo: id }, OPS[id])),
    });
  }

  visualizador("vis-obtener", {
    ops: ["obtener"],
    entradas: [Object.assign({}, POSICION, { valor: 3, min: -1, max: 8 })],
    estadoInicial: () => estadoDesde([3, 7, 9, 12, 20]),
    mensajeInicial: "Pide obtener(3): está en la segunda mitad, así que nodoEn camina desde la cola. Prueba también pos = 1 y pos = 7.",
  });

  visualizador("vis-extremos", {
    ops: ["insertarAlInicio", "insertarAlFinal"],
    entradas: [VALOR],
    mensajeInicial: "La lista de main(). Inserta por los dos extremos; prueba también después de Reiniciar con una lista vacía.",
  });

  visualizador("vis-insertar-en", {
    ops: ["insertarEn"],
    entradas: [POSICION, VALOR],
    mensajeInicial: "Inserta en pos = 2 (entre 7 y 12): mira los cuatro punteros. Prueba también pos = 0, pos = 4 y pos = 9.",
  });

  visualizador("vis-eliminar", {
    ops: ["eliminar"],
    entradas: [Object.assign({}, VALOR, { aleatorio: false, valor: 12 })],
    mensajeInicial: "Elimina 12 (en medio), 3 (la cabeza) y 20 (la cola); prueba también un valor que no esté.",
  });

  visualizador("vis-eliminar-extremos", {
    ops: ["eliminarAlInicio", "eliminarAlFinal"],
    entradas: [],
    mensajeInicial: "Saca por los dos extremos hasta vaciar la lista, y una vez más para ver el error.",
  });

  visualizador("vis-todo", {
    ops: ["insertarAlInicio", "insertarAlFinal", "insertarEn", "obtener", "eliminar", "eliminarAlFinal"],
    entradas: [POSICION, VALOR],
    mensajeInicial: "Todas las operaciones sobre la lista de main().",
  });
})();
