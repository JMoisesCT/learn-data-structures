// Árbol binario de búsqueda: buscar, insertar, recorridos y eliminar (con sus tres casos).
(function () {
  "use strict";

  const { el } = DS;
  const SVG = "http://www.w3.org/2000/svg";
  const MAXIMO = 15; // límites solo para que la animación quepa en pantalla
  const MAX_NIVELES = 7;
  const PASO_X = 50; // entre dos nodos seguidos en inorden
  const ANCHO = 58;
  const ALTO = 42;
  const MARGEN = 14;
  const X_ARBOL = 92; // a la izquierda queda la variable raiz
  const Y_ARBOL = 26; // arriba quedan las marcas de los punteros
  const PASO_SALIDA = 40;
  const EJEMPLO = [50, 30, 70, 20, 40, 60, 80]; // el mismo árbol que arma main()

  // Copia exacta de las funciones de ejemplos/cpp/arbol_binario_busqueda.cpp.
  const CODIGO = {
    buscar: `
      bool buscar(int valor) const {
          Nodo* actual = raiz;
          while (actual != nullptr) {
              if (valor == actual->valor) {
                  return true;
              }
              if (valor < actual->valor) {
                  actual = actual->izq;
              } else {
                  actual = actual->der;
              }
          }
          return false;
      }`,
    insertar: `
      bool insertar(int valor) {
          Nodo* padre = nullptr;
          Nodo* actual = raiz;
          while (actual != nullptr) {
              if (valor == actual->valor) {
                  return false;  // sin repetidos, como std::set
              }
              padre = actual;
              if (valor < actual->valor) {
                  actual = actual->izq;
              } else {
                  actual = actual->der;
              }
          }
          Nodo* nuevo = new Nodo(valor);
          if (padre == nullptr) {
              raiz = nuevo;
          } else if (valor < padre->valor) {
              padre->izq = nuevo;
          } else {
              padre->der = nuevo;
          }
          tamano++;
          return true;
      }`,
    eliminar: `
      bool eliminar(int valor) {
          Nodo* padre = nullptr;
          Nodo* actual = raiz;
          while (actual != nullptr && actual->valor != valor) {
              padre = actual;
              actual = (valor < actual->valor) ? actual->izq : actual->der;
          }
          if (actual == nullptr) {
              return false;  // no está
          }
          // Caso 3, dos hijos: copiamos el sucesor (el menor del subárbol
          // derecho) y pasamos a borrar el sucesor, que no tiene hijo izquierdo.
          if (actual->izq != nullptr && actual->der != nullptr) {
              Nodo* padreSucesor = actual;
              Nodo* sucesor = actual->der;
              while (sucesor->izq != nullptr) {
                  padreSucesor = sucesor;
                  sucesor = sucesor->izq;
              }
              actual->valor = sucesor->valor;
              padre = padreSucesor;
              actual = sucesor;
          }
          // Casos 1 y 2, hoja o un solo hijo: el hijo (o nullptr) ocupa su lugar.
          Nodo* hijo = (actual->izq != nullptr) ? actual->izq : actual->der;
          if (padre == nullptr) {
              raiz = hijo;
          } else if (padre->izq == actual) {
              padre->izq = hijo;
          } else {
              padre->der = hijo;
          }
          delete actual;
          tamano--;
          return true;
      }`,
    inorden: `
      void inorden(Nodo* nodo, std::vector<int>& salida) const {
          if (nodo == nullptr) {
              return;
          }
          inorden(nodo->izq, salida);
          salida.push_back(nodo->valor);
          inorden(nodo->der, salida);
      }`,
    preorden: `
      void preorden(Nodo* nodo, std::vector<int>& salida) const {
          if (nodo == nullptr) {
              return;
          }
          salida.push_back(nodo->valor);
          preorden(nodo->izq, salida);
          preorden(nodo->der, salida);
      }`,
    postorden: `
      void postorden(Nodo* nodo, std::vector<int>& salida) const {
          if (nodo == nullptr) {
              return;
          }
          postorden(nodo->izq, salida);
          postorden(nodo->der, salida);
          salida.push_back(nodo->valor);
      }`,
  };

  // Cada recorrido: en qué línea se anota el nodo y en qué orden se hacen las tres cosas.
  const RECORRIDOS = {
    inorden: { nombre: "Inorden", publica: "recorridoInorden", orden: ["izq", "nodo", "der"], lineas: { izq: 5, nodo: 6, der: 7 } },
    preorden: { nombre: "Preorden", publica: "recorridoPreorden", orden: ["nodo", "izq", "der"], lineas: { nodo: 5, izq: 6, der: 7 } },
    postorden: { nombre: "Postorden", publica: "recorridoPostorden", orden: ["izq", "der", "nodo"], lineas: { izq: 5, der: 6, nodo: 7 } },
  };

  // ------------------------------------------------------------------
  // Estado: nodos con punteros izq / der (por id), raiz y punteros locales
  // ------------------------------------------------------------------

  function nuevoNodo(s, v) {
    const id = `n${s.siguienteId++}`;
    s.nodos[id] = { v, izq: null, der: null };
    return id;
  }

  // Inserta sin animar (para armar los estados iniciales).
  function insertarDirecto(s, v) {
    let padre = null;
    let actual = s.raiz;
    while (actual != null) {
      if (v === s.nodos[actual].v) return false;
      padre = actual;
      actual = v < s.nodos[actual].v ? s.nodos[actual].izq : s.nodos[actual].der;
    }
    const id = nuevoNodo(s, v);
    if (padre == null) s.raiz = id;
    else if (v < s.nodos[padre].v) s.nodos[padre].izq = id;
    else s.nodos[padre].der = id;
    return true;
  }

  function estadoDesde(valores) {
    const s = { nodos: {}, raiz: null, siguienteId: 1, ptrs: {}, salida: null, vis: {} };
    for (const v of valores) insertarDirecto(s, v);
    return s;
  }

  const cantidad = (s) => contar(s, s.raiz);
  function contar(s, id) {
    return id == null ? 0 : 1 + contar(s, s.nodos[id].izq) + contar(s, s.nodos[id].der);
  }
  function altura(s, id) {
    return id == null ? 0 : 1 + Math.max(altura(s, s.nodos[id].izq), altura(s, s.nodos[id].der));
  }
  function subarbol(s, id) {
    return id == null ? [] : [id, ...subarbol(s, s.nodos[id].izq), ...subarbol(s, s.nodos[id].der)];
  }

  const nombre = (s, id) => (id == null ? "nullptr" : `nodo ${s.nodos[id].v}`);
  const val = (s, id) => s.nodos[id].v;

  // Lo que se resalta en el paso que sigue (se borra al terminar cada operación).
  function ver(s, vis) {
    s.vis = vis;
  }

  function limite(s, clave, paso) {
    paso(clave, 0, `Para que quepa en pantalla, el árbol llega hasta ${MAXIMO} nodos y ${MAX_NIVELES} niveles. Elimina alguno o pulsa Reiniciar.`, "error");
    ver(s, { error: true });
  }

  // ------------------------------------------------------------------
  // buscar(valor)
  // ------------------------------------------------------------------

  function animarBuscar(s, valor, paso) {
    const C = "buscar";
    const total = cantidad(s);
    const camino = [];
    const descartados = [];
    let actual = s.raiz;
    s.ptrs = { actual };
    const vars = () => ({ valor, actual: nombre(s, actual) });
    ver(s, { vars: vars(), flecha: "raiz", activo: actual, hueco: actual == null ? { raiz: true } : null });
    paso(C, 2, actual == null
      ? "actual = raiz, que es nullptr: el árbol está vacío."
      : `actual = raiz: empezamos por arriba, en el ${val(s, actual)}.`);
    let comparaciones = 0;
    while (actual != null) {
      const n = s.nodos[actual];
      comparaciones++;
      if (valor === n.v) {
        ver(s, { vars: vars(), camino, descartados, encontrado: actual, salida: "true" });
        paso(C, 5, `¡${valor} == ${n.v}! Está, y bastaron ${comparaciones} comparación(es) de ${total} nodos.`, "exito");
        s.ptrs = {};
        return;
      }
      const lado = valor < n.v ? "izq" : "der";
      const otro = lado === "izq" ? "der" : "izq";
      descartados.push(...subarbol(s, n[otro]));
      camino.push(actual);
      ver(s, { vars: vars(), camino, descartados, activo: actual, flecha: `${actual}:${lado}` });
      paso(C, lado === "izq" ? 7 : 9, lado === "izq"
        ? `¿${valor} == ${n.v}? No. ${valor} < ${n.v}: si está, está a la izquierda. Todo el subárbol derecho queda descartado.`
        : `¿${valor} == ${n.v}? No. ${valor} > ${n.v}: si está, está a la derecha. Todo el subárbol izquierdo queda descartado.`);
      const padre = actual;
      actual = n[lado];
      s.ptrs.actual = actual;
      ver(s, { vars: vars(), cambio: ["actual"], camino, descartados, activo: actual, hueco: actual == null ? { padre, lado } : null });
      paso(C, lado === "izq" ? 8 : 10, actual == null
        ? `actual = actual->${lado}, que es nullptr: no hay más dónde buscar.`
        : `actual = actual->${lado}: bajamos al ${val(s, actual)}.`);
      if (actual == null) {
        ver(s, { vars: vars(), camino, descartados, hueco: { padre, lado, malo: true }, salida: "false", error: true });
        paso(C, 13, `${valor} no está. Solo miramos ${comparaciones} de ${total} nodos: cada comparación descartó un subárbol entero.`, "error");
        s.ptrs = {};
        return;
      }
    }
    ver(s, { vars: vars(), hueco: { raiz: true, malo: true }, salida: "false", error: true });
    paso(C, 13, `El árbol está vacío: ${valor} no está.`, "error");
    s.ptrs = {};
  }

  // ------------------------------------------------------------------
  // insertar(valor)
  // ------------------------------------------------------------------

  // ¿Cuántos niveles tendría el árbol con el valor nuevo?
  function nivelesCon(s, valor) {
    let d = 1;
    for (let a = s.raiz; a != null; d++) {
      if (valor === s.nodos[a].v) return altura(s, s.raiz);
      a = valor < s.nodos[a].v ? s.nodos[a].izq : s.nodos[a].der;
    }
    return Math.max(d, altura(s, s.raiz));
  }

  function animarInsertar(s, valor, paso, rapido) {
    const C = "insertar";
    const yaEsta = buscarDirecto(s, valor) != null;
    if (!yaEsta && (cantidad(s) >= MAXIMO || nivelesCon(s, valor) > MAX_NIVELES)) {
      limite(s, C, paso);
      return false;
    }
    if (rapido) {
      // Sin recorrer paso a paso: para armar un árbol de golpe.
      const ok = insertarDirecto(s, valor);
      const id = buscarDirecto(s, valor);
      ver(s, { vars: rapido(s), nuevo: id, error: !ok });
      paso(C, ok ? 24 : 6, ok ? `insertar(${valor}): baja hasta un nullptr y se cuelga ahí.` : `insertar(${valor}): ya estaba.`, ok ? "" : "error");
      return ok;
    }
    let padre = null;
    let actual = s.raiz;
    const camino = [];
    s.ptrs = { padre, actual };
    const vars = () => ({ valor, padre: nombre(s, padre), actual: nombre(s, actual) });
    ver(s, { vars: vars(), flecha: "raiz", activo: actual, hueco: actual == null ? { raiz: true } : null });
    paso(C, 3, actual == null
      ? "padre = nullptr y actual = raiz, que es nullptr: el árbol está vacío, el nodo nuevo será la raíz."
      : `padre = nullptr y actual = raiz (${val(s, actual)}). Bajamos como en buscar, recordando de dónde venimos.`);
    while (actual != null) {
      const n = s.nodos[actual];
      if (valor === n.v) {
        ver(s, { vars: vars(), camino, encontrado: actual, salida: "false", error: true });
        paso(C, 6, `${valor} == ${n.v}: ya está en el árbol. No se aceptan repetidos (como std::set): devuelve false.`, "error");
        s.ptrs = {};
        return false;
      }
      const lado = valor < n.v ? "izq" : "der";
      padre = actual;
      s.ptrs.padre = padre;
      camino.push(actual);
      ver(s, { vars: vars(), cambio: ["padre"], camino, activo: actual, flecha: `${actual}:${lado}` });
      paso(C, lado === "izq" ? 9 : 11, `padre = actual (${n.v}). ${valor} ${lado === "izq" ? "<" : ">"} ${n.v}: va a la ${lado === "izq" ? "izquierda" : "derecha"}.`);
      actual = n[lado];
      s.ptrs.actual = actual;
      ver(s, { vars: vars(), cambio: ["actual"], camino, activo: actual, hueco: actual == null ? { padre, lado } : null });
      paso(C, lado === "izq" ? 10 : 12, actual == null
        ? `actual = padre->${lado}, que es nullptr: ¡ahí va el nodo nuevo!`
        : `actual = actual->${lado}: bajamos al ${val(s, actual)}.`);
    }
    // El nodo nuevo aparece en su lugar, todavía sin enganchar.
    const lado = padre == null ? null : valor < s.nodos[padre].v ? "izq" : "der";
    const id = nuevoNodo(s, valor);
    s.nodos[id].colgar = { padre, lado };
    s.ptrs = { padre, actual, nuevo: id };
    ver(s, { vars: Object.assign(vars(), { nuevo: nombre(s, id) }), cambio: ["nuevo"], camino, nuevo: id });
    paso(C, 15, `new Nodo(${valor}): el nodo se crea con izq y der en nullptr. Todavía nadie apunta a él.`);
    delete s.nodos[id].colgar;
    if (padre == null) {
      s.raiz = id;
      ver(s, { vars: vars(), camino, flecha: "raiz", encontrado: id });
      paso(C, 17, `padre es nullptr: el árbol estaba vacío. raiz = nuevo: ${valor} es la raíz.`);
    } else {
      s.nodos[padre][lado] = id;
      ver(s, { vars: vars(), camino, flecha: `${padre}:${lado}`, encontrado: id });
      paso(C, lado === "izq" ? 19 : 21, `${valor} ${lado === "izq" ? "<" : ">"} ${val(s, padre)}: padre->${lado} = nuevo. Un solo puntero lo engancha al árbol.`);
    }
    s.ptrs = {};
    ver(s, { vars: { valor, cantidad: cantidad(s) }, encontrado: id, salida: "true" });
    paso(C, 24, `tamano++ y devuelve true. Inorden sigue saliendo ordenado: ${inordenDirecto(s).join(", ")}.`, "exito");
    return true;
  }

  function buscarDirecto(s, valor) {
    let a = s.raiz;
    while (a != null && s.nodos[a].v !== valor) a = valor < s.nodos[a].v ? s.nodos[a].izq : s.nodos[a].der;
    return a;
  }

  function inordenDirecto(s, id = s.raiz) {
    return id == null ? [] : [...inordenDirecto(s, s.nodos[id].izq), s.nodos[id].v, ...inordenDirecto(s, s.nodos[id].der)];
  }

  // ------------------------------------------------------------------
  // Recorridos (recursivos, con la pila de llamadas a la vista)
  // ------------------------------------------------------------------

  function animarRecorrido(s, tipo, paso) {
    const t = RECORRIDOS[tipo];
    const C = tipo;
    s.salida = [];
    s.ptrs = {};
    const pila = [`${t.publica}()`];
    const enPila = [];
    const visitados = [];
    const textoSalida = () => (s.salida.length ? `{ ${s.salida.map((x) => x.v).join(", ")} }` : "{ }");
    const mostrar = (o) => ver(s, Object.assign({ pila: pila.slice(), enPila: enPila.slice(), visitados: visitados.slice(), vars: {} }, o));

    function visitar(id, padre, lado) {
      pila.push(`${tipo}(${id == null ? "nullptr" : val(s, id)})`);
      if (id == null) {
        mostrar({ hueco: padre == null ? { raiz: true } : { padre, lado } });
        paso(C, 3, padre == null ? `${tipo}(nullptr): el árbol está vacío, no hay nada que recorrer.` : `${tipo}(nullptr): ${val(s, padre)} no tiene hijo ${lado === "izq" ? "izquierdo" : "derecho"}. Vuelve enseguida.`);
        pila.pop();
        return;
      }
      const v = val(s, id);
      enPila.push(id);
      mostrar({ activo: id });
      paso(C, 2, {
        inorden: `${tipo}(${v}): antes de anotar el ${v}, todo su subárbol izquierdo.`,
        preorden: `${tipo}(${v}): primero se anota el ${v}, después sus dos subárboles.`,
        postorden: `${tipo}(${v}): el ${v} se anota al final, después de sus dos subárboles.`,
      }[tipo]);
      for (const parte of t.orden) {
        if (parte === "nodo") {
          s.salida.push({ id: `s${s.salida.length}`, v, de: id });
          visitados.push(id);
          mostrar({ activo: id, anotado: id });
          paso(C, t.lineas.nodo, `salida.push_back(${v}): salida = ${textoSalida()}.`);
        } else {
          visitar(s.nodos[id][parte], id, parte);
        }
      }
      enPila.pop();
      pila.pop();
    }

    visitar(s.raiz, null, null);
    mostrar({ salida: textoSalida() });
    const conclusion = {
      inorden: "¡De menor a mayor! En un ABB, inorden siempre sale ordenado.",
      preorden: "Cada padre sale antes que sus hijos: insertar en este orden arma el mismo árbol.",
      postorden: "Cada padre sale después de sus hijos: así se liberan los nodos en el destructor.",
    }[tipo];
    paso(C, 8, s.salida.length
      ? `Listo: ${textoSalida()}. ${conclusion}`
      : "Listo: salida = { }. Con el árbol vacío no hay nada que anotar.", "exito");
  }

  // ------------------------------------------------------------------
  // eliminar(valor): hoja, un hijo o dos hijos
  // ------------------------------------------------------------------

  function animarEliminar(s, valor, paso) {
    const C = "eliminar";
    let padre = null;
    let actual = s.raiz;
    const camino = [];
    const descartados = [];
    s.ptrs = { padre, actual };
    const vars = (extra) => Object.assign({ valor, padre: nombre(s, padre), actual: nombre(s, actual) }, extra || {});
    ver(s, { vars: vars(), flecha: "raiz", activo: actual, hueco: actual == null ? { raiz: true } : null });
    paso(C, 3, actual == null ? "padre = nullptr y actual = raiz, que es nullptr: el árbol está vacío." : "padre = nullptr y actual = raiz. Primero hay que encontrar el nodo, y también a su padre.");
    while (actual != null && s.nodos[actual].v !== valor) {
      const n = s.nodos[actual];
      const lado = valor < n.v ? "izq" : "der";
      descartados.push(...subarbol(s, n[lado === "izq" ? "der" : "izq"]));
      camino.push(actual);
      padre = actual;
      s.ptrs.padre = padre;
      ver(s, { vars: vars(), cambio: ["padre"], camino, descartados, activo: actual, flecha: `${actual}:${lado}` });
      paso(C, 5, `${n.v} ≠ ${valor}: padre = actual, y como ${valor} ${lado === "izq" ? "<" : ">"} ${n.v}, seguimos por la ${lado === "izq" ? "izquierda" : "derecha"}.`);
      actual = n[lado];
      s.ptrs.actual = actual;
      ver(s, { vars: vars(), cambio: ["actual"], camino, descartados, activo: actual, hueco: actual == null ? { padre, lado } : null });
      paso(C, 6, actual == null ? `actual = padre->${lado}, que es nullptr.` : `actual = ${val(s, actual)}.`);
      if (actual == null) {
        ver(s, { vars: vars(), camino, descartados, hueco: { padre, lado, malo: true }, salida: "false", error: true });
        paso(C, 9, `actual es nullptr: ${valor} no está en el árbol. No se borra nada: devuelve false.`, "error");
        s.ptrs = {};
        return;
      }
    }
    if (actual == null) {
      ver(s, { vars: vars(), hueco: { raiz: true, malo: true }, salida: "false", error: true });
      paso(C, 9, `El árbol está vacío: ${valor} no está. Devuelve false.`, "error");
      s.ptrs = {};
      return;
    }
    const n = s.nodos[actual];
    ver(s, { vars: vars(), camino, descartados, encontrado: actual });
    paso(C, 4, `¡Encontrado! actual = ${valor}${padre == null ? ", la raíz (padre es nullptr)" : `, y su padre es el ${val(s, padre)}`}.`);

    const hijos = (n.izq != null) + (n.der != null);
    if (hijos === 2) {
      // Caso 3: el sucesor (el menor del subárbol derecho) toma su valor.
      ver(s, { vars: vars(), camino, activo: actual, caso: 3 });
      paso(C, 13, `Caso 3: ${valor} tiene dos hijos. No podemos subir a los dos a su lugar: lo reemplaza el valor que le sigue en orden, su sucesor.`);
      let padreSucesor = actual;
      let sucesor = n.der;
      s.ptrs = { padre, actual, padreSucesor, sucesor };
      const varsSuc = () => vars({ padreSucesor: nombre(s, padreSucesor), sucesor: nombre(s, sucesor) });
      ver(s, { vars: varsSuc(), cambio: ["padreSucesor", "sucesor"], camino, activo: sucesor, flecha: `${actual}:der`, caso: 3 });
      paso(C, 15, `El sucesor está en el subárbol derecho (todo lo mayor que ${valor}): sucesor = actual->der = ${val(s, sucesor)}.`);
      while (s.nodos[sucesor].izq != null) {
        padreSucesor = sucesor;
        const siguiente = s.nodos[sucesor].izq;
        ver(s, { vars: varsSuc(), cambio: ["padreSucesor"], camino, activo: sucesor, flecha: `${sucesor}:izq`, caso: 3 });
        paso(C, 17, `${val(s, sucesor)} tiene hijo izquierdo, algo todavía menor: seguimos bajando a la izquierda.`);
        sucesor = siguiente;
        s.ptrs.padreSucesor = padreSucesor;
        s.ptrs.sucesor = sucesor;
        ver(s, { vars: varsSuc(), cambio: ["sucesor"], camino, activo: sucesor, caso: 3 });
        paso(C, 18, `sucesor = ${val(s, sucesor)}.`);
      }
      ver(s, { vars: varsSuc(), camino, encontrado: sucesor, caso: 3 });
      paso(C, 16, `${val(s, sucesor)} no tiene hijo izquierdo: es el menor del subárbol derecho, el sucesor de ${valor}.`);
      const viejo = n.v;
      n.v = s.nodos[sucesor].v;
      ver(s, { vars: varsSuc(), camino, copia: { de: sucesor, a: actual }, caso: 3 });
      paso(C, 20, `actual->valor = sucesor->valor: el ${n.v} se copia donde estaba el ${viejo}. El orden se mantiene: es mayor que todo lo de la izquierda y menor que el resto de la derecha.`);
      padre = padreSucesor;
      actual = sucesor;
      s.ptrs = { padre, actual };
      ver(s, { vars: vars(), cambio: ["padre", "actual"], condenado: actual, caso: 3 });
      paso(C, 22, `Ahora hay que borrar el nodo del sucesor (el ${val(s, actual)} repetido). No tiene hijo izquierdo, así que es un caso 1 o 2.`);
    }

    // Casos 1 y 2: el hijo (o nullptr) ocupa su lugar.
    const m = s.nodos[actual];
    const hijo = m.izq != null ? m.izq : m.der;
    const ladoPadre = padre == null ? null : s.nodos[padre].izq === actual ? "izq" : "der";
    s.ptrs = { padre, actual, hijo };
    ver(s, { vars: vars({ hijo: nombre(s, hijo) }), cambio: ["hijo"], condenado: actual, activo: hijo, hueco: hijo == null ? { padre: actual, lado: "der" } : null });
    paso(C, 25, hijo == null
      ? `Caso 1: ${m.v} es una hoja, hijo = nullptr. Al padre le basta con dejar de apuntarle.`
      : `Caso 2: ${m.v} tiene un solo hijo, el ${val(s, hijo)}. Ese hijo (con todo su subárbol) sube a ocupar su lugar.`);

    // Mientras se cambian los punteros, el dibujo queda quieto: el árbol se
    // reacomoda recién después del delete.
    s.congelado = posiciones(s).pos;
    if (padre == null) {
      s.raiz = hijo;
      ver(s, { vars: vars({ hijo: nombre(s, hijo) }), condenado: actual, flecha: "raiz", activo: hijo });
      paso(C, 27, `padre es nullptr: borramos la raíz. raiz = hijo (${nombre(s, hijo)}).`);
    } else {
      s.nodos[padre][ladoPadre] = hijo;
      ver(s, { vars: vars({ hijo: nombre(s, hijo) }), condenado: actual, flecha: hijo == null ? null : `${padre}:${ladoPadre}`, activo: hijo, apuntado: `${padre}:${ladoPadre}` });
      paso(C, ladoPadre === "izq" ? 29 : 31, `padre->${ladoPadre} = hijo: el ${val(s, padre)} ahora apunta a ${hijo == null ? "nullptr" : `el ${val(s, hijo)}`}. Nadie apunta ya al ${m.v}.`);
    }
    const borrado = m.v;
    delete s.nodos[actual];
    delete s.congelado;
    s.ptrs = { padre };
    ver(s, { vars: { valor, padre: nombre(s, padre) } });
    paso(C, 33, `delete actual: se libera la memoria del nodo ${borrado}${hijo == null ? "" : `, y el ${val(s, hijo)} sube a su lugar`}.`);
    s.ptrs = {};
    ver(s, { vars: { valor, cantidad: cantidad(s) }, salida: "true" });
    paso(C, 35, s.raiz == null
      ? "tamano-- y devuelve true. El árbol quedó vacío: raiz es nullptr."
      : `tamano-- y devuelve true. Inorden: ${inordenDirecto(s).join(", ")}, sigue ordenado.`, "exito");
  }

  // ------------------------------------------------------------------
  // Dibujo
  // ------------------------------------------------------------------

  // Posición de cada nodo: x según su lugar en inorden, y según su profundidad.
  // Es una función pura del estado (las animaciones la usan para fijar el
  // lugar de un nodo que se desengancha).
  function posiciones(s) {
    const pendiente = {};
    for (const [id, n] of Object.entries(s.nodos)) if (n.colgar) pendiente[`${n.colgar.padre}:${n.colgar.lado}`] = id;
    const hijo = (id, lado) => (s.nodos[id][lado] != null ? s.nodos[id][lado] : pendiente[`${id}:${lado}`] || null);
    const raiz = s.raiz != null ? s.raiz : pendiente["null:null"] || null;
    const orden = [];
    const prof = {};
    const visitar = (id, d) => {
      if (id == null || !s.nodos[id]) return;
      visitar(hijo(id, "izq"), d + 1);
      prof[id] = d;
      orden.push(id);
      visitar(hijo(id, "der"), d + 1);
    };
    visitar(raiz, 0);
    const niveles = Math.max(1, ...Object.values(prof).map((d) => d + 1));
    const nivel = niveles > 5 ? 48 : 60;
    const pos = {};
    orden.forEach((id, k) => { pos[id] = { x: X_ARBOL + k * PASO_X, y: Y_ARBOL + prof[id] * nivel }; });
    // Un dibujo congelado (mientras eliminar cambia punteros) conserva los lugares de antes.
    if (s.congelado) {
      for (const id of Object.keys(s.nodos)) if (s.congelado[id]) pos[id] = Object.assign({}, s.congelado[id], { suelto: !orden.includes(id) });
      const ys = Object.values(pos).map((p) => p.y);
      return { pos, niveles: Math.max(niveles, Math.round((Math.max(...ys) - Y_ARBOL) / nivel) + 1), nivel, n: Math.max(orden.length, Object.keys(pos).length) };
    }
    return { pos, niveles, nivel, n: orden.length };
  }

  let lienzos = 0;

  function crearLienzo(escenario) {
    const n = ++lienzos;
    const svg = document.createElementNS(SVG, "svg");
    svg.innerHTML =
      "<defs>" +
      `<marker id="punta-abb-${n}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z"/></marker>` +
      `<marker id="punta-abb-activa-${n}" class="activa" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z"/></marker>` +
      "</defs>";
    const raiz = el("div", { class: "abb-raiz" }, el("span", { class: "abb-raiz-nombre", text: "raiz" }), el("span", { class: "ptr" }));
    const hueco = el("div", { class: "abb-hueco", text: "∅" });
    const tituloSalida = el("span", { class: "abb-titulo-salida", text: "salida" });
    const lienzo = el("div", { class: "lienzo-abb", "data-n": n }, svg, raiz, hueco, tituloSalida);
    escenario.append(el("div", { class: "info-abb" }), el("div", { class: "marco-abb" }, lienzo));
    return lienzo;
  }

  if (typeof window !== "undefined") {
    window.addEventListener("resize", () => {
      for (const lienzo of document.querySelectorAll(".lienzo-abb")) {
        escalar(lienzo);
        trazarFlechas(lienzo);
      }
    });
  }

  // En escenarios angostos el dibujo se reduce para que entre a lo ancho.
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

  // Flechas: de la casilla izq / der del padre (o de raiz) a la parte de arriba del hijo.
  function flechasDeseadas(s) {
    const deseadas = new Map();
    if (s.raiz != null && s.nodos[s.raiz]) deseadas.set("raiz", s.raiz);
    for (const [id, n] of Object.entries(s.nodos)) {
      for (const lado of ["izq", "der"]) if (n[lado] != null && s.nodos[n[lado]]) deseadas.set(`${id}:${lado}`, n[lado]);
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
        path.setAttribute("class", "flecha traza");
        svg.append(path);
      }
      const activa = vis.flecha === de;
      path.classList.toggle("activa", activa);
      path.classList.toggle("tenue", (vis.descartados || []).includes(a));
      path.setAttribute("marker-end", `url(#punta-abb${activa ? "-activa" : ""}-${n})`);
    }
  }

  function trazarFlechas(lienzo) {
    for (const path of lienzo.querySelectorAll("svg path.flecha")) {
      const { de, a } = path.dataset;
      const destino = lienzo.querySelector(`.anodo[data-id="${a}"]`);
      if (!destino) continue;
      const x2 = destino.offsetLeft + destino.offsetWidth / 2;
      const y2 = destino.offsetTop - 2;
      if (de === "raiz") {
        const origen = lienzo.querySelector(".abb-raiz .ptr");
        const caja = origen.parentElement;
        const x1 = caja.offsetLeft + origen.offsetLeft + origen.offsetWidth / 2;
        const y1 = caja.offsetTop + origen.offsetTop + origen.offsetHeight / 2;
        path.setAttribute("d", `M ${x1} ${y1} C ${x1 + 40} ${y1 - 30}, ${x2} ${y2 - 40}, ${x2} ${y2}`);
        continue;
      }
      const [id, lado] = de.split(":");
      const caja = lienzo.querySelector(`.anodo[data-id="${id}"]`);
      if (!caja) continue;
      const celda = caja.querySelector(`.ptr.${lado}`);
      const x1 = caja.offsetLeft + celda.offsetLeft + celda.offsetWidth / 2;
      const y1 = caja.offsetTop + celda.offsetTop + celda.offsetHeight / 2;
      path.setAttribute("d", `M ${x1} ${y1} L ${x2} ${y2}`);
    }
  }

  // Un valor que viaja de un lugar a otro del dibujo (copia del sucesor, push_back).
  function viajar(lienzo, texto, desde, hasta, clase) {
    const ficha = el("div", { class: `abb-ficha ${clase || ""}`, text: texto });
    ficha.style.left = `${desde.x}px`;
    ficha.style.top = `${desde.y}px`;
    lienzo.append(ficha);
    void ficha.offsetWidth;
    ficha.style.left = `${hasta.x}px`;
    ficha.style.top = `${hasta.y}px`;
    setTimeout(() => ficha.remove(), 650);
  }

  function dibujar(escenario, s) {
    const lienzo = escenario.querySelector(".lienzo-abb") || crearLienzo(escenario);
    const vis = s.vis || {};
    const { pos, niveles, nivel, n } = posiciones(s);

    // Arriba del dibujo: llamadas en curso, variables y valor devuelto.
    const malo = vis.salida === "false";
    escenario.querySelector(".info-abb").replaceChildren(
      vis.pila && vis.pila.length
        ? el("div", { class: "pila-llamadas", "aria-label": "Llamadas en curso" },
          vis.pila.flatMap((texto, k) => [k ? "›" : "", el("span", { class: "llamada", text: texto })]))
        : "",
      DS.variables(vis.vars || { cantidad: cantidad(s) }, vis.cambio),
      vis.caso ? el("span", { class: "abb-caso", text: `caso ${vis.caso}: dos hijos` }) : "",
      vis.salida != null
        ? el("div", { class: "salida-valor" }, "devuelve", el("div", { class: `celda ${malo ? "error" : "encontrada"}`, text: vis.salida }))
        : "");

    // La variable raiz, a la izquierda.
    const raiz = lienzo.querySelector(".abb-raiz");
    raiz.style.left = `${MARGEN}px`;
    raiz.style.top = `${Y_ARBOL}px`;
    raiz.querySelector(".ptr").classList.toggle("nulo", s.raiz == null);
    raiz.classList.toggle("activa", vis.flecha === "raiz");

    // Nodos: se deslizan a su lugar; los nuevos aparecen con un pop y los borrados se desvanecen.
    const vivos = new Set(Object.keys(s.nodos));
    for (const caja of lienzo.querySelectorAll(".anodo[data-id]")) if (!vivos.has(caja.dataset.id)) retirar(caja);
    const enPila = new Set(vis.enPila || []);
    for (const [id, nodo] of Object.entries(s.nodos)) {
      const p = pos[id];
      if (!p) continue;
      let caja = lienzo.querySelector(`.anodo[data-id="${id}"]`);
      let clase = "anodo";
      if (!caja) {
        caja = el("div", { class: "anodo", "data-id": id },
          el("span", { class: "valor" }), el("span", { class: "ptr izq" }), el("span", { class: "ptr der" }));
        caja.style.left = `${p.x}px`;
        caja.style.top = `${p.y}px`;
        lienzo.append(caja);
        if (vis.nuevo === id) clase += " nuevo";
      } else if (caja.classList.contains("nuevo") && vis.nuevo === id) {
        clase += " nuevo";
      }
      caja.style.left = `${p.x}px`;
      caja.style.top = `${p.y}px`;
      const valor = caja.querySelector(".valor");
      if (valor.textContent !== String(nodo.v)) {
        if (valor.textContent && vis.copia && vis.copia.a === id) {
          const de = pos[vis.copia.de];
          viajar(lienzo, nodo.v, { x: de.x + 8, y: de.y + 2 }, { x: p.x + 8, y: p.y + 2 }, "copia");
        }
        valor.textContent = nodo.v;
      }
      for (const lado of ["izq", "der"]) {
        const celda = caja.querySelector(`.ptr.${lado}`);
        celda.classList.toggle("nulo", nodo[lado] == null);
        celda.classList.toggle("resaltado", vis.flecha === `${id}:${lado}` || vis.apuntado === `${id}:${lado}`);
      }
      if (p.suelto || nodo.colgar) clase += " suelto";
      if (vis.activo === id) clase += " activo";
      if (vis.encontrado === id) clase += " encontrado";
      if (vis.condenado === id) clase += " condenado";
      if (vis.anotado === id) clase += " anotado";
      if ((vis.camino || []).includes(id)) clase += " camino";
      if ((vis.descartados || []).includes(id)) clase += " descartado";
      if ((vis.visitados || []).includes(id)) clase += " visitado";
      if (enPila.has(id)) clase += " en-pila";
      if (vis.copia && vis.copia.a === id) clase += " copiado";
      caja.className = clase;
    }

    // El hueco nullptr donde termina una búsqueda o un recorrido.
    const hueco = lienzo.querySelector(".abb-hueco");
    let fondo = Y_ARBOL + (niveles - 1) * nivel + ALTO;
    if (vis.hueco) {
      const h = vis.hueco.raiz || !pos[vis.hueco.padre]
        ? { x: X_ARBOL + 12, y: Y_ARBOL + 8 }
        : { x: pos[vis.hueco.padre].x + (vis.hueco.lado === "izq" ? -PASO_X * 0.55 : PASO_X * 0.55) + 12, y: pos[vis.hueco.padre].y + ALTO + 10 };
      hueco.style.left = `${h.x}px`;
      hueco.style.top = `${h.y}px`;
      fondo = Math.max(fondo, h.y + 24);
    }
    hueco.classList.toggle("visible", !!vis.hueco);
    hueco.classList.toggle("malo", !!(vis.hueco && vis.hueco.malo));

    // Punteros locales: marcas arriba del nodo al que apuntan (o del hueco, si son nullptr).
    const marcas = {};
    for (const [k, destino] of Object.entries(s.ptrs || {})) {
      if (destino === undefined) continue;
      if (destino == null) {
        if (vis.hueco && (k === "actual" || k === "hijo")) (marcas.hueco = marcas.hueco || []).push(k);
        continue;
      }
      if (pos[destino]) (marcas[destino] = marcas[destino] || []).push(k);
    }
    const presentes = new Set();
    for (const [donde, nombres] of Object.entries(marcas)) {
      const x = donde === "hueco" ? parseFloat(hueco.style.left) + 17 : pos[donde].x + ANCHO / 2;
      const y = donde === "hueco" ? parseFloat(hueco.style.top) - 17 : pos[donde].y - 17;
      for (const k of nombres) {
        presentes.add(k);
        let marca = lienzo.querySelector(`.abb-puntero[data-nombre="${k}"]`);
        if (!marca) {
          marca = el("span", { class: "abb-puntero", "data-nombre": k });
          marca.style.left = `${x}px`;
          marca.style.top = `${y}px`;
          lienzo.append(marca);
        }
        marca.textContent = `${nombres.join(", ")} ↓`;
        marca.style.left = `${x}px`;
        marca.style.top = `${y}px`;
        // Si comparten lugar, solo se ve la primera (que ya lleva todos los nombres).
        marca.classList.toggle("oculta", k !== nombres[0]);
        marca.classList.toggle("mala", donde === "hueco" && !!(vis.hueco && vis.hueco.malo));
      }
    }
    for (const marca of lienzo.querySelectorAll(".abb-puntero[data-nombre]")) if (!presentes.has(marca.dataset.nombre)) retirar(marca);

    // El vector salida de los recorridos, debajo del árbol.
    const titulo = lienzo.querySelector(".abb-titulo-salida");
    const ySalida = fondo + 10;
    const conSalida = Array.isArray(s.salida);
    titulo.classList.toggle("visible", conSalida);
    titulo.style.left = `${MARGEN}px`;
    titulo.style.top = `${ySalida + 9}px`;
    const fichas = new Set((s.salida || []).map((x) => x.id));
    for (const celda of lienzo.querySelectorAll(".abb-salida[data-id]")) if (!fichas.has(celda.dataset.id)) retirar(celda);
    (s.salida || []).forEach((x, k) => {
      let celda = lienzo.querySelector(`.abb-salida[data-id="${x.id}"]`);
      const destino = { x: X_ARBOL + k * PASO_SALIDA, y: ySalida };
      if (!celda) {
        celda = el("div", { class: "abb-salida", "data-id": x.id, text: x.v });
        const origen = pos[x.de] || destino;
        celda.style.left = `${origen.x + 10}px`;
        celda.style.top = `${origen.y + 4}px`;
        lienzo.append(celda);
        void celda.offsetWidth;
      }
      celda.style.left = `${destino.x}px`;
      celda.style.top = `${destino.y}px`;
      celda.classList.toggle("reciente", vis.anotado === x.de && k === s.salida.length - 1);
    });

    // Tamaño del dibujo y sacudida si hubo un error.
    const derecha = Math.max(X_ARBOL + Math.max(1, n) * PASO_X + 20, conSalida ? X_ARBOL + (s.salida.length + 1) * PASO_SALIDA : 0,
      ...Object.values(pos).map((p) => p.x + ANCHO + 10));
    const ancho = Math.max(300, derecha + MARGEN);
    const alto = conSalida ? ySalida + 38 : fondo + 10;
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

  const VALOR = { id: "valor", etiqueta: "Valor", min: 0, max: 99, valor: 60 };
  const TIPO = { id: "tipo", etiqueta: "Recorrido", opciones: Object.entries(RECORRIDOS).map(([k, t]) => [k, t.nombre]), valor: "inorden", reinicia: false };

  const OPS = {
    buscar: { etiqueta: "buscar(valor)", usa: ["valor"], ejecutar(s, { valor }, paso) { s.salida = null; animarBuscar(s, valor, paso); } },
    insertar: { etiqueta: "insertar(valor)", usa: ["valor"], ejecutar(s, { valor }, paso) { s.salida = null; animarInsertar(s, valor, paso); } },
    eliminar: { etiqueta: "eliminar(valor)", usa: ["valor"], ejecutar(s, { valor }, paso) { s.salida = null; animarEliminar(s, valor, paso); } },
    recorrer: {
      etiqueta: ({ tipo }) => `${RECORRIDOS[tipo].publica}()`,
      usa: ["tipo"],
      codigo: "inorden",
      ejecutar(s, { tipo }, paso) { animarRecorrido(s, tipo, paso); },
    },
  };

  function visualizador(contenedor, opciones) {
    const claves = new Set();
    for (const op of opciones.ops) {
      if (op === "recorrer") ["inorden", "preorden", "postorden"].forEach((k) => claves.add(k));
      else claves.add(op);
    }
    for (const op of opciones.secundarias || []) claves.add(op.codigo);
    DS.tema({
      contenedor,
      incremental: true,
      dibujar,
      codigo: Object.fromEntries([...claves].map((k) => [k, CODIGO[k]])),
      tituloCodigo: (clave) => `ArbolBinarioBusqueda::${clave}()`,
      codigoInicial: opciones.codigoInicial,
      mensajeInicial: opciones.mensajeInicial,
      estadoInicial: opciones.estadoInicial,
      entradas: opciones.entradas,
      operaciones: opciones.ops.map((id) => Object.assign({ id, codigo: id }, OPS[id], opciones.extra && opciones.extra[id]))
        .concat(opciones.secundarias || []),
    });
  }

  // Paso 1: buscar.
  visualizador("vis-buscar", {
    ops: ["buscar"],
    entradas: [Object.assign({}, VALOR, { valor: 60 })],
    estadoInicial: () => estadoDesde(EJEMPLO),
    mensajeInicial: "El árbol de main(). Busca 60 (está) y 65 (no está): cuenta cuántos nodos mira.",
  });

  // Paso 2: insertar.
  visualizador("vis-insertar", {
    ops: ["insertar"],
    entradas: [Object.assign({}, VALOR, { valor: 65 })],
    estadoInicial: () => estadoDesde(EJEMPLO),
    mensajeInicial: "Inserta 65 (entre 60 y 70), luego 10 y 99. Prueba también un repetido, como 40.",
  });

  // Paso 3: recorridos.
  visualizador("vis-recorridos", {
    ops: ["recorrer"],
    entradas: [TIPO],
    codigoInicial: ({ tipo }) => tipo,
    estadoInicial: () => estadoDesde(EJEMPLO),
    mensajeInicial: "Elige un recorrido y mira la pila de llamadas: cada nodo espera a que vuelva la llamada de su hijo.",
  });

  // Paso 4: eliminar una hoja o un nodo con un solo hijo.
  visualizador("vis-eliminar", {
    ops: ["eliminar"],
    entradas: [Object.assign({}, VALOR, { valor: 20 })],
    estadoInicial: () => estadoDesde([50, 30, 70, 20, 40, 80]),
    mensajeInicial: "Elimina 20 (una hoja) y después 70 (tiene un solo hijo, el 80).",
  });

  // Paso 5: eliminar un nodo con dos hijos (el sucesor).
  visualizador("vis-eliminar-dos", {
    ops: ["eliminar"],
    entradas: [Object.assign({}, VALOR, { valor: 50 })],
    estadoInicial: () => estadoDesde([50, 30, 70, 20, 40, 60, 80, 65]),
    mensajeInicial: "Elimina 50, la raíz: tiene dos hijos. Su sucesor es el 60, que además tiene un hijo (el 65).",
  });

  // Paso 6: la forma importa (altura).
  const conAltura = (s) => ({ cantidad: cantidad(s), altura: altura(s, s.raiz) });
  const lote = (valores, explicacion) => (s, args, paso) => {
    Object.assign(s, estadoDesde([]));
    for (const v of valores) animarInsertar(s, v, paso, conAltura);
    ver(s, { vars: conAltura(s) });
    paso("insertar", 0, explicacion(altura(s, s.raiz)), "exito");
  };
  visualizador("vis-forma", {
    ops: ["buscar"],
    entradas: [Object.assign({}, VALOR, { valor: 7 })],
    codigoInicial: "insertar",
    secundarias: [
      {
        id: "en-orden",
        etiqueta: "1…7 ordenados",
        secundaria: true,
        codigo: "insertar",
        ejecutar: lote([1, 2, 3, 4, 5, 6, 7], (h) => `1, 2, 3, 4, 5, 6, 7 → altura ${h}: cada valor fue a la derecha del anterior. ¡Es una lista! Buscar el 7 recorre los 7 nodos: O(n).`),
      },
      {
        id: "balanceado",
        etiqueta: "1…7 mezclados",
        secundaria: true,
        codigo: "insertar",
        ejecutar: lote([4, 2, 6, 1, 3, 5, 7], (h) => `4, 2, 6, 1, 3, 5, 7 → altura ${h}: los mismos valores en otro orden. Buscar cualquiera mira como mucho ${h} nodos: O(log n).`),
      },
    ],
    estadoInicial: () => estadoDesde([]),
    mensajeInicial: "Arma el árbol con los mismos 7 valores en dos órdenes distintos y compara su altura. Después busca el 7 en cada uno.",
  });

  // Paso 7: todo junto.
  visualizador("vis-todo", {
    ops: ["insertar", "buscar", "eliminar", "recorrer"],
    entradas: [Object.assign({}, VALOR, { valor: 45, aleatorio: true }), TIPO],
    estadoInicial: () => estadoDesde(EJEMPLO),
    mensajeInicial: "El árbol de main(). Prueba eliminar la raíz varias veces seguidas, o vaciarlo y llenarlo de nuevo.",
  });
})();
