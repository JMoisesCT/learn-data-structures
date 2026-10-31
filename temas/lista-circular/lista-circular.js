// Lista circular: el último nodo apunta al primero y la lista solo guarda ultimo.
(function () {
  "use strict";

  const { el } = DS;
  const SVG = "http://www.w3.org/2000/svg";
  const MAXIMO = 8; // límite solo para que la animación quepa en pantalla
  const ANCHO = 76;
  const ALTO = 42;
  const ARRIBA = 30; // lugar para las marcas sobre el nodo de más arriba
  const EJEMPLO = [5, 10, 20, 30]; // la lista que arma main()

  // Copia exacta de las funciones de ejemplos/cpp/lista_circular.cpp.
  const CODIGO = {
    buscar: `
      bool buscar(int valor) const {
          if (ultimo == nullptr) {
              return false;
          }
          Nodo* actual = ultimo->siguiente;
          do {
              if (actual->valor == valor) {
                  return true;
              }
              actual = actual->siguiente;
          } while (actual != ultimo->siguiente);
          return false;
      }`,
    insertarAlInicio: `
      void insertarAlInicio(int valor) {
          Nodo* nuevo = new Nodo(valor);
          if (ultimo == nullptr) {
              nuevo->siguiente = nuevo;  // un solo nodo: se apunta a sí mismo
              ultimo = nuevo;
          } else {
              nuevo->siguiente = ultimo->siguiente;
              ultimo->siguiente = nuevo;
          }
          tamano++;
      }`,
    insertarAlFinal: `
      void insertarAlFinal(int valor) {
          insertarAlInicio(valor);
          ultimo = ultimo->siguiente;
      }`,
    rotar: `
      void rotar() {
          if (ultimo != nullptr) {
              ultimo = ultimo->siguiente;
          }
      }`,
    eliminarPrimero: `
      int eliminarPrimero() {
          if (ultimo == nullptr) {
              throw std::out_of_range("lista vacia");
          }
          Nodo* primero = ultimo->siguiente;
          int valor = primero->valor;
          if (primero == ultimo) {
              ultimo = nullptr;  // era el único
          } else {
              ultimo->siguiente = primero->siguiente;
          }
          delete primero;
          tamano--;
          return valor;
      }`,
    unTurno: `
      int unTurno(ListaCircular& procesos, int quantum) {
          int& falta = procesos.primero();
          falta -= std::min(falta, quantum);
          if (falta == 0) {
              procesos.eliminarPrimero();
              return 0;
          }
          int quedan = falta;
          procesos.rotar();
          return quedan;
      }`,
  };

  const LLAMA = {
    insertarAlFinal: ["insertarAlInicio"],
    unTurno: ["eliminarPrimero", "rotar"],
  };

  // ------------------------------------------------------------------
  // Estado
  // ------------------------------------------------------------------

  function crearNodo(s, v) {
    const id = `n${s.siguienteId++}`;
    s.nodos[id] = { v, sig: null };
    return id;
  }

  // Inserta al final sin animar (para los estados iniciales).
  function estadoDesde(valores) {
    const s = { nodos: {}, ultimo: null, ancla: null, siguienteId: 1, ptrs: {}, vis: {} };
    for (const v of valores) {
      const id = crearNodo(s, v);
      if (s.ultimo == null) s.nodos[id].sig = id;
      else {
        s.nodos[id].sig = s.nodos[s.ultimo].sig;
        s.nodos[s.ultimo].sig = id;
      }
      s.ultimo = id;
      if (s.ancla == null) s.ancla = id;
    }
    return s;
  }

  const primero = (s) => (s.ultimo == null ? null : s.nodos[s.ultimo].sig);

  // La vuelta completa empezando por el primero.
  function vuelta(s, desde = primero(s)) {
    const ids = [];
    for (let a = desde; a != null && s.nodos[a] && !ids.includes(a); a = s.nodos[a].sig) ids.push(a);
    return ids;
  }

  const tamano = (s) => vuelta(s).length;
  const nombre = (s, id) => (id == null ? "nullptr" : `nodo ${s.nodos[id].v}`);
  const texto = (s) => (tamano(s) ? `${vuelta(s).map((id) => s.nodos[id].v).join(" → ")} → (vuelve al ${s.nodos[primero(s)].v})` : "vacía");

  function ver(s, vis) {
    s.vis = vis;
  }

  function limite(s, clave, paso) {
    ver(s, { error: true });
    paso(clave, 0, `Para que quepa en pantalla, la lista llega hasta ${MAXIMO} nodos. Saca alguno o pulsa Reiniciar.`, "error");
  }

  // ------------------------------------------------------------------
  // Animaciones
  // ------------------------------------------------------------------

  function animarBuscar(s, valor, paso) {
    const C = "buscar";
    if (s.ultimo == null) {
      ver(s, { vars: { valor, ultimo: "nullptr" }, salida: "false", error: true });
      paso(C, 3, "ultimo es nullptr: la lista está vacía. Devuelve false.", "error");
      return;
    }
    let actual = primero(s);
    s.ptrs = { actual };
    const vars = () => ({ valor, actual: nombre(s, actual) });
    ver(s, { vars: vars(), cambio: ["actual"], activo: actual, flecha: s.ultimo });
    paso(C, 5, `actual = ultimo->siguiente: empezamos por el primero, el ${s.nodos[actual].v}.`);
    const revisados = [];
    let vueltas = 0;
    for (;;) {
      if (s.nodos[actual].v === valor) {
        ver(s, { vars: vars(), revisados, encontrado: actual, salida: "true" });
        paso(C, 8, `¡${valor} == ${valor}! Lo encontramos.`, "exito");
        s.ptrs = {};
        return;
      }
      ver(s, { vars: vars(), revisados, activo: actual });
      paso(C, 7, `¿${s.nodos[actual].v} == ${valor}? No.`);
      revisados.push(actual);
      const de = actual;
      actual = s.nodos[actual].sig;
      s.ptrs.actual = actual;
      vueltas++;
      const otraVez = actual === primero(s);
      ver(s, { vars: vars(), cambio: ["actual"], revisados, activo: actual, flecha: de, completa: otraVez });
      paso(C, 11, otraVez
        ? `actual = actual->siguiente: ¡volvimos al primero! actual == ultimo->siguiente, la vuelta terminó (${vueltas} nodos). Sin esta condición, el ciclo no terminaría nunca.`
        : `actual = actual->siguiente: el ${s.nodos[actual].v}. ¿Ya volvimos al primero? Todavía no.`);
      if (otraVez) break;
    }
    ver(s, { vars: vars(), revisados, salida: "false", error: true });
    paso(C, 12, `${valor} no está: devuelve false.`, "error");
    s.ptrs = {};
  }

  function animarAlInicio(s, valor, paso, pila, final) {
    const C = "insertarAlInicio";
    const llamadas = [...pila, `insertarAlInicio(${valor})`];
    const id = crearNodo(s, valor);
    s.nodos[id].entrando = true;
    s.ptrs = { nuevo: id };
    const vars = () => ({ valor, nuevo: nombre(s, id) });
    ver(s, { pila: llamadas, vars: vars(), cambio: ["nuevo"], nuevo: id });
    paso(C, 2, `new Nodo(${valor}): todavía no está en la vuelta.`);
    if (s.ultimo == null) {
      s.nodos[id].sig = id;
      ver(s, { pila: llamadas, vars: vars(), flecha: id, celda: id });
      paso(C, 4, "La lista estaba vacía: nuevo->siguiente = nuevo. Un solo nodo es una vuelta completa: se apunta a sí mismo.");
      s.ultimo = id;
      s.ancla = id;
      delete s.nodos[id].entrando;
      ver(s, { pila: llamadas, vars: vars(), global: "ultimo" });
      paso(C, 5, "ultimo = nuevo: es el último y, a la vez, el primero (ultimo->siguiente).");
    } else {
      const p = primero(s);
      s.nodos[id].sig = p;
      ver(s, { pila: llamadas, vars: vars(), flecha: id, celda: id });
      paso(C, 7, `nuevo->siguiente = ultimo->siguiente: el nuevo apunta al que hoy es el primero (el ${s.nodos[p].v}).`);
      s.nodos[s.ultimo].sig = id;
      delete s.nodos[id].entrando;
      ver(s, { pila: llamadas, vars: vars(), flecha: s.ultimo, celda: s.ultimo });
      paso(C, 8, `ultimo->siguiente = nuevo: el último (el ${s.nodos[s.ultimo].v}) ahora apunta al nuevo, que pasa a ser el primero. El anillo se abrió y se volvió a cerrar.`);
    }
    s.ptrs = {};
    ver(s, { pila: llamadas, vars: { tamano: tamano(s) }, cambio: ["tamano"], encontrado: id });
    paso(C, 10, `tamano++: ${texto(s)}. Dos punteros: O(1).`, final ? "exito" : "");
    return id;
  }

  function animarAlFinal(s, valor, paso) {
    const C = "insertarAlFinal";
    const pila = [`insertarAlFinal(${valor})`];
    ver(s, { pila, vars: { valor } });
    paso(C, 2, "Truco: insertar al final es insertar al inicio y después correr ultimo un lugar.");
    const id = animarAlInicio(s, valor, paso, pila, false);
    s.ultimo = s.nodos[s.ultimo].sig;
    ver(s, { pila, vars: { ultimo: nombre(s, s.ultimo) }, cambio: ["ultimo"], global: "ultimo", encontrado: id });
    paso(C, 3, `ultimo = ultimo->siguiente: ahora el ${valor} es el último, y el primero vuelve a ser el de antes. Ningún nodo se movió en memoria: ${texto(s)}.`, "exito");
  }

  function animarRotar(s, paso, pila, final) {
    const C = "rotar";
    const llamadas = [...(pila || []), "rotar()"];
    if (s.ultimo == null) {
      ver(s, { pila: llamadas, vars: { ultimo: "nullptr" }, error: final });
      paso(C, 2, "ultimo es nullptr: la lista está vacía, no hay nada que rotar.", final ? "error" : "");
      return;
    }
    const antes = s.ultimo;
    ver(s, { pila: llamadas, vars: { ultimo: nombre(s, antes) }, flecha: antes, global: "ultimo" });
    paso(C, 2, `ultimo != nullptr: el último es el ${s.nodos[antes].v} y el primero, el ${s.nodos[primero(s)].v}.`);
    s.ultimo = s.nodos[antes].sig;
    ver(s, { pila: llamadas, vars: { ultimo: nombre(s, s.ultimo) }, cambio: ["ultimo"], global: "ultimo" });
    paso(C, 3, `ultimo = ultimo->siguiente: el ${s.nodos[s.ultimo].v} pasa a ser el último y el ${s.nodos[primero(s)].v}, el primero. Solo se movió un puntero: O(1).`, final ? "exito" : "");
  }

  function animarEliminarPrimero(s, paso, pila, final) {
    const C = "eliminarPrimero";
    const llamadas = [...(pila || []), "eliminarPrimero()"];
    if (s.ultimo == null) {
      ver(s, { pila: llamadas, vars: { ultimo: "nullptr" }, error: true });
      paso(C, 3, "ultimo es nullptr: la lista está vacía. Lanza out_of_range.", "error");
      return null;
    }
    const p = primero(s);
    s.congelado = posiciones(s).pos;
    s.ptrs = { primero: p };
    const valor = s.nodos[p].v;
    ver(s, { pila: llamadas, vars: { primero: nombre(s, p) }, cambio: ["primero"], activo: p, flecha: s.ultimo });
    paso(C, 5, `primero = ultimo->siguiente: el ${valor}.`);
    ver(s, { pila: llamadas, vars: { primero: nombre(s, p), valor }, cambio: ["valor"], condenado: p });
    paso(C, 6, `int valor = primero->valor = ${valor}: se guarda antes de borrarlo.`);
    if (p === s.ultimo) {
      s.ultimo = null;
      ver(s, { pila: llamadas, vars: { primero: nombre(s, p), valor, ultimo: "nullptr" }, cambio: ["ultimo"], condenado: p });
      paso(C, 8, "primero == ultimo: era el único nodo. ultimo = nullptr, la lista queda vacía.");
    } else {
      s.nodos[s.ultimo].sig = s.nodos[p].sig;
      ver(s, { pila: llamadas, vars: { primero: nombre(s, p), valor }, condenado: p, flecha: s.ultimo, celda: s.ultimo });
      paso(C, 10, `ultimo->siguiente = primero->siguiente: el último salta al ${s.nodos[s.nodos[p].sig].v}, que pasa a ser el primero. Nadie apunta ya al ${valor}.`);
    }
    delete s.nodos[p];
    if (s.ancla === p) s.ancla = primero(s);
    delete s.congelado;
    s.ptrs = {};
    ver(s, { pila: llamadas, vars: { valor } });
    paso(C, 12, `delete primero: se libera el ${valor} y el anillo se cierra sin él.`);
    ver(s, { pila: llamadas, vars: { valor }, salida: valor });
    paso(C, 14, `tamano-- y devuelve ${valor}: ${texto(s)}.`, final ? "exito" : "");
    return valor;
  }

  function animarTurno(s, quantum, paso) {
    const C = "unTurno";
    const pila = [`unTurno(procesos, ${quantum})`];
    if (s.ultimo == null) {
      ver(s, { pila, vars: { quantum }, error: true });
      paso(C, 2, "Todos los procesos terminaron: la lista está vacía y primero() lanzaría out_of_range. Pulsa Reiniciar.", "error");
      return;
    }
    const p = primero(s);
    const n = s.nodos[p];
    ver(s, { pila, vars: { quantum, falta: n.v }, cambio: ["falta"], activo: p, flecha: s.ultimo });
    paso(C, 2, `int& falta = procesos.primero(): al proceso del frente le faltan ${n.v} unidades. Es una referencia: cambiarla cambia el valor del nodo.`);
    const trabajo = Math.min(n.v, quantum);
    n.v -= trabajo;
    ver(s, { pila, vars: { quantum, falta: n.v }, cambio: ["falta"], activo: p, trabaja: p });
    paso(C, 3, `Trabaja ${trabajo} unidad(es) (lo que le falta, o el quantum si es menor): falta = ${n.v}.`);
    if (n.v === 0) {
      ver(s, { pila, vars: { quantum, falta: 0 }, encontrado: p });
      paso(C, 5, "falta == 0: ¡terminó! Sale de la lista.");
      animarEliminarPrimero(s, paso, pila, false);
      ver(s, { pila, vars: { quantum }, salida: 0 });
      paso(C, 6, tamano(s) ? `Devuelve 0. Siguen ${tamano(s)} proceso(s).` : "Devuelve 0. ¡Todos los procesos terminaron!", "exito");
      return;
    }
    ver(s, { pila, vars: { quantum, falta: n.v, quedan: n.v }, cambio: ["quedan"], activo: p });
    paso(C, 8, `Le faltan ${n.v}: se guarda en quedan antes de rotar.`);
    animarRotar(s, paso, pila, false);
    ver(s, { pila, vars: { quantum, quedan: n.v }, salida: n.v });
    paso(C, 10, `Devuelve ${n.v}. El ${n.v} quedó al final de la vuelta: le toca de nuevo cuando pasen los demás.`, "exito");
  }

  // ------------------------------------------------------------------
  // Dibujo: los nodos en un anillo (una elipse)
  // ------------------------------------------------------------------

  // El orden del dibujo empieza en un nodo fijo (el ancla), no en el primero:
  // así rotar no mueve ningún nodo, solo las marcas.
  function posiciones(s) {
    if (s.congelado) {
      const pos = {};
      for (const id of Object.keys(s.nodos)) if (s.congelado[id]) pos[id] = Object.assign({}, s.congelado[id]);
      return { pos, n: Object.keys(pos).length };
    }
    const ancla = s.ancla != null && s.nodos[s.ancla] && vuelta(s).includes(s.ancla) ? s.ancla : primero(s);
    const anillo = ancla == null ? [] : vuelta(s, ancla);
    // El que está entrando va justo después del último.
    const entrando = Object.keys(s.nodos).filter((id) => s.nodos[id].entrando);
    if (entrando.length) {
      const k = s.ultimo != null && anillo.includes(s.ultimo) ? anillo.indexOf(s.ultimo) + 1 : anillo.length;
      anillo.splice(k, 0, ...entrando);
    }
    const n = anillo.length;
    const g = geometria(n);
    const pos = {};
    anillo.forEach((id, k) => {
      const ang = -Math.PI / 2 + (2 * Math.PI * k) / n;
      const r = s.nodos[id].entrando ? 0.42 : 1; // el nuevo espera adentro del anillo
      pos[id] = { x: g.cx + r * g.rx * Math.cos(ang), y: g.cy + r * g.ry * Math.sin(ang), dentro: r < 1 };
    });
    return { pos, n };
  }

  // Tamaño del anillo según cuántos nodos tiene (fijo para un mismo n).
  function geometria(n) {
    const rx = n <= 1 ? 0 : Math.max(120, 30 * n);
    const ry = n <= 1 ? 0 : Math.max(62, 15 * n);
    const ancho = Math.max(380, 2 * 1.32 * rx + 60);
    const margen = Math.max(ARRIBA, 0.32 * ry + 14);
    return { rx, ry, cx: ancho / 2, cy: margen + ry + ALTO / 2, ancho, alto: 2 * margen + 2 * ry + ALTO + (n <= 1 ? 50 : 0) };
  }

  let lienzos = 0;

  function crearLienzo(escenario) {
    const n = ++lienzos;
    const svg = document.createElementNS(SVG, "svg");
    svg.innerHTML =
      "<defs>" +
      `<marker id="punta-circ-${n}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z"/></marker>` +
      `<marker id="punta-circ-activa-${n}" class="activa" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z"/></marker>` +
      "</defs>";
    const vacia = el("div", { class: "circ-vacia", text: "ultimo = nullptr" });
    const lienzo = el("div", { class: "lienzo-circ", "data-n": n }, svg, vacia);
    escenario.append(el("div", { class: "info-circ" }), el("div", { class: "marco-circ" }, lienzo));
    return lienzo;
  }

  if (typeof window !== "undefined") {
    window.addEventListener("resize", () => {
      for (const lienzo of document.querySelectorAll(".lienzo-circ")) {
        escalar(lienzo);
        trazarFlechas(lienzo);
      }
    });
  }

  function escalar(lienzo) {
    const escenario = lienzo.closest(".escenario");
    if (!escenario || !escenario.clientWidth) return; // paso oculto: se mide al mostrarlo
    const ancho = Number(lienzo.dataset.ancho);
    const alto = Number(lienzo.dataset.alto);
    const k = Math.max(0.55, Math.min(1, (escenario.clientWidth - 32) / ancho));
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

  function actualizarFlechas(lienzo, s, vis) {
    const n = lienzo.dataset.n;
    const svg = lienzo.querySelector("svg");
    const deseadas = new Map();
    for (const [id, nodo] of Object.entries(s.nodos)) if (nodo.sig != null && s.nodos[nodo.sig]) deseadas.set(id, nodo.sig);
    for (const path of svg.querySelectorAll("path.flecha")) if (deseadas.get(path.dataset.de) !== path.dataset.a) path.remove();
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
      path.classList.toggle("vuelta-completa", !!vis.completa && activa);
      path.setAttribute("marker-end", `url(#punta-circ${activa ? "-activa" : ""}-${n})`);
    }
  }

  // Punto del borde de una caja en la dirección (dx, dy) desde su centro.
  function borde(c, dx, dy, margen) {
    const t = Math.min((ANCHO / 2 + margen) / Math.abs(dx || 1e-9), (ALTO / 2 + margen) / Math.abs(dy || 1e-9));
    return { x: c.x + dx * t, y: c.y + dy * t };
  }

  const dentroDe = (p, c, margen) => Math.abs(p.x - c.x) < ANCHO / 2 + margen && Math.abs(p.y - c.y) < ALTO / 2 + margen;

  // Las flechas siguen el anillo (una elipse): salen del borde de un nodo y
  // llegan al borde del siguiente, en el sentido de las agujas del reloj.
  function trazarFlechas(lienzo) {
    const g = { cx: Number(lienzo.dataset.cx), cy: Number(lienzo.dataset.cy), rx: Number(lienzo.dataset.rx), ry: Number(lienzo.dataset.ry) };
    const centros = new Map();
    for (const caja of lienzo.querySelectorAll(".cnodo[data-id]")) {
      centros.set(caja.dataset.id, { x: caja.offsetLeft + ANCHO / 2, y: caja.offsetTop + ALTO / 2, dentro: caja.classList.contains("suelto") });
    }
    const angulo = (c) => Math.atan2((c.y - g.cy) / (g.ry || 1), (c.x - g.cx) / (g.rx || 1));
    for (const path of lienzo.querySelectorAll("svg path.flecha")) {
      const o = centros.get(path.dataset.de);
      const d = centros.get(path.dataset.a);
      if (!o || !d) continue;
      if (path.dataset.de === path.dataset.a) {
        // Un solo nodo: un lazo que sale por la derecha y vuelve por arriba.
        const x = o.x + ANCHO / 2 - 14;
        path.setAttribute("d", `M ${x} ${o.y} C ${x + 60} ${o.y}, ${o.x + 40} ${o.y - 70}, ${o.x + 6} ${o.y - ALTO / 2 - 3}`);
        continue;
      }
      if (o.dentro || d.dentro || !g.rx) {
        // El nodo que está entrando todavía no está en el anillo: flecha recta.
        const inicio = borde(o, d.x - o.x, d.y - o.y, 1);
        const fin = borde(d, o.x - d.x, o.y - d.y, 3);
        path.setAttribute("d", `M ${inicio.x} ${inicio.y} L ${fin.x} ${fin.y}`);
        continue;
      }
      let a1 = angulo(o);
      let a2 = angulo(d);
      if (a2 <= a1 + 1e-3) a2 += 2 * Math.PI;
      // Si salta por encima de otro nodo (al eliminar), va por un anillo más grande.
      const salta = [...centros.entries()].some(([id, c]) => {
        if (id === path.dataset.de || id === path.dataset.a || c.dentro) return false;
        let a = angulo(c);
        while (a <= a1) a += 2 * Math.PI;
        return a < a2;
      });
      const k = salta ? 1.32 : 1;
      const punto = (a) => ({ x: g.cx + k * g.rx * Math.cos(a), y: g.cy + k * g.ry * Math.sin(a) });
      // Se avanza sobre la elipse hasta salir de cada caja.
      let i = 0;
      while (i++ < 200 && a1 < a2 && dentroDe(punto(a1), o, 2)) a1 += 0.01;
      i = 0;
      while (i++ < 200 && a2 > a1 && dentroDe(punto(a2), d, 4)) a2 -= 0.01;
      const p1 = punto(a1);
      const p2 = punto(a2);
      let dPath = `M ${p1.x} ${p1.y} A ${k * g.rx} ${k * g.ry} 0 ${a2 - a1 > Math.PI ? 1 : 0} 1 ${p2.x} ${p2.y}`;
      if (salta) {
        // Une el anillo grande con los dos nodos con tramos cortos.
        const ini = borde(o, p1.x - o.x, p1.y - o.y, 1);
        const fin = borde(d, p2.x - d.x, p2.y - d.y, 3);
        dPath = `M ${ini.x} ${ini.y} L ${p1.x} ${p1.y} A ${k * g.rx} ${k * g.ry} 0 ${a2 - a1 > Math.PI ? 1 : 0} 1 ${p2.x} ${p2.y} L ${fin.x} ${fin.y}`;
      }
      path.setAttribute("d", dPath);
    }
  }

  function dibujar(escenario, s) {
    const lienzo = escenario.querySelector(".lienzo-circ") || crearLienzo(escenario);
    const vis = s.vis || {};
    const { pos, n } = posiciones(s);
    const g = geometria(Math.max(n, tamano(s)));

    const malo = vis.salida === "false";
    escenario.querySelector(".info-circ").replaceChildren(
      vis.pila && vis.pila.length > 1
        ? el("div", { class: "pila-llamadas", "aria-label": "Llamadas en curso" },
          vis.pila.flatMap((t, k) => [k ? "›" : "", el("span", { class: "llamada", text: t })]))
        : "",
      DS.variables(vis.vars || { tamano: tamano(s) }, vis.cambio),
      vis.salida != null ? el("div", { class: "salida-valor" }, "devuelve", el("div", { class: `celda ${malo ? "error" : "encontrada"}`, text: vis.salida })) : "");

    // Nodos.
    const vivos = new Set(Object.keys(s.nodos));
    for (const caja of lienzo.querySelectorAll(".cnodo[data-id]")) if (!vivos.has(caja.dataset.id)) retirar(caja);
    for (const [id, nodo] of Object.entries(s.nodos)) {
      const p = pos[id];
      if (!p) continue;
      const x = p.x - ANCHO / 2;
      const y = p.y - ALTO / 2;
      let caja = lienzo.querySelector(`.cnodo[data-id="${id}"]`);
      let clase = "cnodo";
      if (!caja) {
        caja = el("div", { class: "cnodo", "data-id": id }, el("span", { class: "valor" }), el("span", { class: "sig" }));
        caja.style.left = `${x}px`;
        caja.style.top = `${y}px`;
        lienzo.append(caja);
        if (vis.nuevo === id) clase += " nuevo";
      } else if (caja.classList.contains("nuevo") && vis.nuevo === id) {
        clase += " nuevo";
      }
      caja.style.left = `${x}px`;
      caja.style.top = `${y}px`;
      const valor = caja.querySelector(".valor");
      if (valor.textContent !== String(nodo.v)) {
        if (valor.textContent) {
          valor.classList.remove("cambia");
          void valor.offsetWidth;
          valor.classList.add("cambia");
        }
        valor.textContent = nodo.v;
      }
      caja.querySelector(".sig").classList.toggle("resaltado", vis.celda === id);
      if (p.dentro) clase += " suelto";
      if (vis.activo === id) clase += " activo";
      if (vis.encontrado === id) clase += " encontrado";
      if (vis.condenado === id) clase += " condenado";
      if (vis.trabaja === id) clase += " trabaja";
      if ((vis.revisados || []).includes(id)) clase += " revisado";
      caja.className = clase;
    }

    const vacia = lienzo.querySelector(".circ-vacia");
    vacia.style.left = `${g.cx - 60}px`;
    vacia.style.top = `${g.cy - 14}px`;
    vacia.classList.toggle("visible", s.ultimo == null && !Object.keys(s.nodos).length);

    // Marcas arriba de cada nodo: ultimo y primero (ultimo->siguiente), y los punteros locales.
    const marcas = {};
    const agregar = (id, nombreMarca) => { if (id != null && pos[id]) (marcas[id] = marcas[id] || []).push(nombreMarca); };
    agregar(s.ultimo, "ultimo");
    if (s.ultimo != null && !(s.ptrs && s.ptrs.primero)) agregar(primero(s), "primero");
    for (const [k, destino] of Object.entries(s.ptrs || {})) agregar(destino, k);
    const presentes = new Set();
    for (const [id, nombres] of Object.entries(marcas)) {
      const x = pos[id].x;
      const y = pos[id].y - ALTO / 2 - 17;
      nombres.forEach((k, i) => {
        presentes.add(k);
        let marca = lienzo.querySelector(`.lpuntero[data-nombre="${k}"]`);
        if (!marca) {
          marca = el("span", { class: "lpuntero", "data-nombre": k });
          marca.style.left = `${x}px`;
          marca.style.top = `${y}px`;
          lienzo.append(marca);
        }
        marca.textContent = `${nombres.join(", ")} ↓`;
        marca.style.left = `${x}px`;
        marca.style.top = `${y}px`;
        marca.classList.toggle("oculta", i > 0);
        marca.classList.toggle("global", nombres[0] === "ultimo" || nombres[0] === "primero");
        marca.classList.toggle("activa", vis.global === "ultimo" && nombres.includes("ultimo"));
      });
    }
    for (const marca of lienzo.querySelectorAll(".lpuntero[data-nombre]")) if (!presentes.has(marca.dataset.nombre)) retirar(marca);

    lienzo.style.width = `${g.ancho}px`;
    lienzo.style.height = `${g.alto}px`;
    lienzo.dataset.ancho = g.ancho;
    lienzo.dataset.alto = g.alto;
    lienzo.dataset.cx = g.cx;
    lienzo.dataset.cy = g.cy;
    lienzo.dataset.rx = g.rx;
    lienzo.dataset.ry = g.ry;
    escalar(lienzo);
    lienzo.classList.remove("sacudir");
    if (vis.error) {
      void lienzo.offsetWidth; // reinicia la animación
      lienzo.classList.add("sacudir");
    }

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
  const lleno = (s) => tamano(s) >= MAXIMO;

  const OPS = {
    buscar: { etiqueta: "buscar(valor)", usa: ["valor"], ejecutar(s, { valor }, paso) { animarBuscar(s, valor, paso); } },
    insertarAlInicio: {
      etiqueta: "insertarAlInicio(valor)",
      usa: ["valor"],
      ejecutar(s, { valor }, paso) { if (lleno(s)) return limite(s, "insertarAlInicio", paso); animarAlInicio(s, valor, paso, [], true); },
    },
    insertarAlFinal: {
      etiqueta: "insertarAlFinal(valor)",
      usa: ["valor"],
      ejecutar(s, { valor }, paso) { if (lleno(s)) return limite(s, "insertarAlFinal", paso); animarAlFinal(s, valor, paso); },
    },
    rotar: { etiqueta: "rotar()", ejecutar(s, args, paso) { animarRotar(s, paso, [], true); } },
    eliminarPrimero: { etiqueta: "eliminarPrimero()", ejecutar(s, args, paso) { animarEliminarPrimero(s, paso, [], true); } },
    unTurno: { etiqueta: "unTurno(procesos, quantum)", usa: ["quantum"], ejecutar(s, { quantum }, paso) { animarTurno(s, quantum, paso); } },
  };

  function visualizador(contenedor, opciones) {
    const claves = new Set();
    for (const op of opciones.ops) [op, ...(LLAMA[op] || [])].forEach((k) => claves.add(k));
    DS.tema({
      contenedor,
      incremental: true,
      dibujar,
      codigo: Object.fromEntries([...claves].map((k) => [k, CODIGO[k]])),
      tituloCodigo: (clave) => (clave === "unTurno" ? "unTurno()" : `ListaCircular::${clave}()`),
      mensajeInicial: opciones.mensajeInicial,
      estadoInicial: opciones.estadoInicial || (() => estadoDesde(EJEMPLO)),
      entradas: opciones.entradas || [],
      operaciones: opciones.ops.map((id) => Object.assign({ id, codigo: id }, OPS[id])),
    });
  }

  visualizador("vis-buscar", {
    ops: ["buscar"],
    entradas: [Object.assign({}, VALOR, { aleatorio: false, valor: 30 })],
    mensajeInicial: "La lista de main(). Busca 30 (está) y 99 (no está): mira cómo la vuelta termina al volver al primero.",
  });

  visualizador("vis-inicio", {
    ops: ["insertarAlInicio"],
    entradas: [VALOR, { id: "inicial", etiqueta: "Lista", opciones: [["llena", "10, 20, 30"], ["vacia", "vacía"]], valor: "llena" }],
    estadoInicial: ({ inicial }) => estadoDesde(inicial === "vacia" ? [] : [10, 20, 30]),
    mensajeInicial: ({ inicial }) => (inicial === "vacia"
      ? "La lista está vacía: ultimo = nullptr. El primer nodo tiene que apuntarse a sí mismo."
      : "Inserta al inicio: el nuevo se mete entre el último (30) y el primero (10). Prueba también con la lista vacía."),
  });

  visualizador("vis-final", {
    ops: ["insertarAlFinal"],
    entradas: [VALOR],
    estadoInicial: () => estadoDesde([10, 20, 30]),
    mensajeInicial: "Inserta al final y mira la pila de llamadas: llama a insertarAlInicio y después solo corre ultimo.",
  });

  visualizador("vis-rotar", {
    ops: ["rotar"],
    mensajeInicial: "Pulsa rotar() varias veces: los nodos no se mueven, solo las marcas ultimo y primero.",
  });

  visualizador("vis-eliminar", {
    ops: ["eliminarPrimero"],
    estadoInicial: () => estadoDesde([5, 10, 20]),
    mensajeInicial: "Saca el primero hasta vaciar la lista: el último nodo se apunta a sí mismo antes de irse. Después, una vez más para ver el error.",
  });

  visualizador("vis-turnos", {
    ops: ["unTurno"],
    entradas: [{ id: "quantum", etiqueta: "quantum", min: 1, max: 9, valor: 3 }],
    estadoInicial: () => estadoDesde([5, 3, 7]),
    mensajeInicial: "Tres procesos: a cada uno le faltan 5, 3 y 7 unidades de trabajo. Pulsa unTurno con quantum = 3 hasta que terminen todos.",
  });

  visualizador("vis-todo", {
    ops: ["insertarAlInicio", "insertarAlFinal", "buscar", "rotar", "eliminarPrimero"],
    entradas: [VALOR],
    mensajeInicial: "Todas las operaciones sobre la lista de main().",
  });
})();
