// Árbol AVL: altura y factor de balance, rotaciones, rebalancear, insertar y eliminar.
(function () {
  "use strict";

  const { el } = DS;
  const SVG = "http://www.w3.org/2000/svg";
  const MAXIMO = 15; // límite solo para que la animación quepa en pantalla
  const PASO_X = 60; // entre dos nodos seguidos en inorden
  const ANCHO = 64;
  const ALTO = 42;
  const NIVEL = 60;
  const MARGEN = 14;
  const X_ARBOL = 92; // a la izquierda queda la variable raiz
  const Y_ARBOL = 30; // arriba quedan las marcas de los punteros
  const PARA_ELIMINAR = [50, 30, 75, 20, 45, 65, 85, 10, 55, 80, 95, 90];

  // Copia exacta de las funciones de ejemplos/cpp/arbol_avl.cpp.
  const CODIGO = {
    altura: `
      static int altura(Nodo* nodo) {
          return nodo == nullptr ? 0 : nodo->altura;
      }`,
    factorBalance: `
      static int factorBalance(Nodo* nodo) {
          return altura(nodo->izq) - altura(nodo->der);
      }`,
    rotarDerecha: `
      static Nodo* rotarDerecha(Nodo* y) {
          Nodo* x = y->izq;
          Nodo* t2 = x->der;
          x->der = y;
          y->izq = t2;
          actualizarAltura(y);
          actualizarAltura(x);
          return x;
      }`,
    rotarIzquierda: `
      static Nodo* rotarIzquierda(Nodo* x) {
          Nodo* y = x->der;
          Nodo* t2 = y->izq;
          y->izq = x;
          x->der = t2;
          actualizarAltura(x);
          actualizarAltura(y);
          return y;
      }`,
    rebalancear: `
      static Nodo* rebalancear(Nodo* nodo) {
          actualizarAltura(nodo);
          int balance = factorBalance(nodo);
          if (balance > 1) {  // cargado a la izquierda
              if (factorBalance(nodo->izq) < 0) {
                  nodo->izq = rotarIzquierda(nodo->izq);  // caso izquierda-derecha
              }
              return rotarDerecha(nodo);  // caso izquierda-izquierda
          }
          if (balance < -1) {  // cargado a la derecha
              if (factorBalance(nodo->der) > 0) {
                  nodo->der = rotarDerecha(nodo->der);  // caso derecha-izquierda
              }
              return rotarIzquierda(nodo);  // caso derecha-derecha
          }
          return nodo;  // ya estaba balanceado
      }`,
    insertar: `
      bool insertar(int valor) {
          int antes = tamano;
          raiz = insertarEn(raiz, valor);
          return tamano > antes;
      }`,
    insertarEn: `
      Nodo* insertarEn(Nodo* nodo, int valor) {
          if (nodo == nullptr) {
              tamano++;
              return new Nodo(valor);
          }
          if (valor < nodo->valor) {
              nodo->izq = insertarEn(nodo->izq, valor);
          } else if (valor > nodo->valor) {
              nodo->der = insertarEn(nodo->der, valor);
          } else {
              return nodo;  // ya estaba: no cambia nada
          }
          return rebalancear(nodo);
      }`,
    eliminar: `
      bool eliminar(int valor) {
          int antes = tamano;
          raiz = eliminarDe(raiz, valor);
          return tamano < antes;
      }`,
    eliminarDe: `
      Nodo* eliminarDe(Nodo* nodo, int valor) {
          if (nodo == nullptr) {
              return nullptr;  // no está
          }
          if (valor < nodo->valor) {
              nodo->izq = eliminarDe(nodo->izq, valor);
          } else if (valor > nodo->valor) {
              nodo->der = eliminarDe(nodo->der, valor);
          } else if (nodo->izq == nullptr || nodo->der == nullptr) {
              Nodo* hijo = (nodo->izq != nullptr) ? nodo->izq : nodo->der;
              delete nodo;  // hoja o un hijo: el hijo (o nullptr) ocupa su lugar
              tamano--;
              return hijo;
          } else {
              Nodo* sucesor = nodo->der;  // dos hijos: el menor del subárbol derecho
              while (sucesor->izq != nullptr) {
                  sucesor = sucesor->izq;
              }
              nodo->valor = sucesor->valor;
              nodo->der = eliminarDe(nodo->der, sucesor->valor);
          }
          return rebalancear(nodo);
      }`,
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
  };

  // ------------------------------------------------------------------
  // Estado: nodos { v, h, izq, der } por id, raiz y punteros locales
  // ------------------------------------------------------------------

  function nuevoNodo(s, v) {
    const id = `n${s.siguienteId++}`;
    s.nodos[id] = { v, h: 1, izq: null, der: null };
    return id;
  }

  const existe = (s, id) => id != null && !!s.nodos[id];
  const alt = (s, id) => (existe(s, id) ? s.nodos[id].h : 0);
  const balanceDe = (s, id) => alt(s, s.nodos[id].izq) - alt(s, s.nodos[id].der);
  const val = (s, id) => s.nodos[id].v;
  const nombre = (s, id) => (id == null ? "nullptr" : existe(s, id) ? `nodo ${val(s, id)}` : "liberado");
  const signo = (b) => (b > 0 ? `+${b}` : b < 0 ? `−${-b}` : "0");
  const lado = (izq) => (izq ? "izquierda" : "derecha");

  function recalcular(s, id) {
    const n = s.nodos[id];
    n.h = 1 + Math.max(alt(s, n.izq), alt(s, n.der));
  }

  function recalcularTodo(s, id) {
    if (id == null) return 0;
    const n = s.nodos[id];
    n.h = 1 + Math.max(recalcularTodo(s, n.izq), recalcularTodo(s, n.der));
    return n.h;
  }

  const cantidad = (s) => subarbol(s, s.raiz).length;
  function subarbol(s, id) {
    return existe(s, id) ? [id, ...subarbol(s, s.nodos[id].izq), ...subarbol(s, s.nodos[id].der)] : [];
  }

  function buscarDirecto(s, valor) {
    let a = s.raiz;
    while (a != null && s.nodos[a].v !== valor) a = valor < s.nodos[a].v ? s.nodos[a].izq : s.nodos[a].der;
    return a;
  }

  function inordenDirecto(s, id = s.raiz) {
    return existe(s, id) ? [...inordenDirecto(s, s.nodos[id].izq), s.nodos[id].v, ...inordenDirecto(s, s.nodos[id].der)] : [];
  }

  // Quién apunta a este nodo (sin contar a "excepto", que en una rotación también lo apunta).
  function padreDe(s, id, excepto) {
    for (const [p, n] of Object.entries(s.nodos)) {
      if (p === excepto) continue;
      if (n.izq === id) return { padre: p, lado: "izq" };
      if (n.der === id) return { padre: p, lado: "der" };
    }
    return { padre: null, lado: null };
  }

  // Rotación sin animar. "derecha" sube el hijo izquierdo; "izquierda", el derecho.
  function rotarDirecto(s, id, sentido) {
    const sube = sentido === "derecha" ? "izq" : "der";
    const otro = sube === "izq" ? "der" : "izq";
    const r = s.nodos[id][sube];
    s.nodos[id][sube] = s.nodos[r][otro];
    s.nodos[r][otro] = id;
    recalcular(s, id);
    recalcular(s, r);
    return r;
  }

  // Devuelve la raíz nueva y, en casos, el nombre del caso que hubo (si rotó).
  function rebalancearDirecto(s, id, casos) {
    recalcular(s, id);
    const b = balanceDe(s, id);
    if (b > 1) {
      const doble = balanceDe(s, s.nodos[id].izq) < 0;
      if (doble) s.nodos[id].izq = rotarDirecto(s, s.nodos[id].izq, "izquierda");
      if (casos) casos.push(doble ? "izquierda-derecha" : "izquierda-izquierda");
      return rotarDirecto(s, id, "derecha");
    }
    if (b < -1) {
      const doble = balanceDe(s, s.nodos[id].der) > 0;
      if (doble) s.nodos[id].der = rotarDirecto(s, s.nodos[id].der, "derecha");
      if (casos) casos.push(doble ? "derecha-izquierda" : "derecha-derecha");
      return rotarDirecto(s, id, "izquierda");
    }
    return id;
  }

  function insertarAVL(s, id, v) {
    if (id == null) return nuevoNodo(s, v);
    const n = s.nodos[id];
    if (v < n.v) n.izq = insertarAVL(s, n.izq, v);
    else if (v > n.v) n.der = insertarAVL(s, n.der, v);
    else return id;
    return rebalancearDirecto(s, id);
  }

  // Inserta como en un ABB, sin rebalancear (para los árboles que muestran un desbalance).
  function insertarABB(s, v) {
    let padre = null;
    let a = s.raiz;
    while (a != null) {
      padre = a;
      a = v < s.nodos[a].v ? s.nodos[a].izq : s.nodos[a].der;
    }
    const id = nuevoNodo(s, v);
    if (padre == null) s.raiz = id;
    else s.nodos[padre][v < s.nodos[padre].v ? "izq" : "der"] = id;
    return id;
  }

  function vacio() {
    return { nodos: {}, raiz: null, siguienteId: 1, ptrs: {}, vis: {} };
  }

  // Un AVL armado con insertar (siempre balanceado).
  function estadoAVL(valores) {
    const s = vacio();
    for (const v of valores) s.raiz = insertarAVL(s, s.raiz, v);
    return s;
  }

  // Un ABB tal como queda con esos valores (puede estar desbalanceado). Con
  // "viejas", algunos nodos conservan la altura que tenían antes del último insertar.
  function estadoABB(valores, viejas) {
    const s = vacio();
    for (const v of valores) insertarABB(s, v);
    recalcularTodo(s, s.raiz);
    for (const [v, h] of Object.entries(viejas || {})) s.nodos[buscarDirecto(s, Number(v))].h = h;
    return s;
  }

  // Lo que se resalta en el paso que sigue (se borra al terminar cada operación).
  function ver(s, ctx, vis) {
    s.vis = Object.assign(ctx ? { pila: ctx.pila.slice(), enPila: ctx.enPila.slice() } : {}, vis);
  }

  function nuevoCtx(llamada) {
    return { pila: llamada ? [llamada] : [], enPila: [] };
  }

  // Engancha la raíz nueva de un subárbol donde estaba la vieja (lo hace quien llamó).
  function enganchar(s, viejo, nuevo) {
    delete s.sube;
    if (s.raiz === viejo) {
      s.raiz = nuevo;
      return "raiz";
    }
    const { padre, lado: l } = padreDe(s, viejo, nuevo);
    if (padre != null) s.nodos[padre][l] = nuevo;
    return padre != null ? `el ${val(s, padre)}` : "raiz";
  }

  // ------------------------------------------------------------------
  // factorBalance(nodo), con las dos llamadas a altura()
  // ------------------------------------------------------------------

  function animarFactorBalance(s, valor, paso) {
    const C = "factorBalance";
    const id = buscarDirecto(s, valor);
    if (id == null) {
      ver(s, null, { error: true });
      paso(C, 1, `No hay un nodo con el ${valor}. Elige uno de los valores del árbol.`, "error");
      return;
    }
    const n = s.nodos[id];
    s.ptrs = { nodo: id };
    ver(s, null, { vars: { nodo: nombre(s, id) }, activo: id });
    paso(C, 2, `factorBalance(${n.v}): compara la altura de sus dos subárboles.`);
    const medir = (l) => {
      const hijo = n[l];
      s.ptrs = { nodo: hijo };
      const regla = { de: hijo, lado: l, h: alt(s, hijo) };
      ver(s, null, {
        vars: { nodo: nombre(s, hijo) },
        sub: { ids: subarbol(s, hijo), lado: l },
        reglas: [regla],
        hueco: hijo == null ? { padre: id, lado: l } : null,
        activo: hijo,
        leida: hijo,
      });
      paso("altura", 2, hijo == null
        ? `altura(nodo->${l}): es nullptr, no hay subárbol ${l === "izq" ? "izquierdo" : "derecho"}. Su altura es 0.`
        : `altura(nodo->${l}): el ${val(s, hijo)} tiene guardada su altura, ${alt(s, hijo)}. No hace falta recorrer su subárbol: O(1).`);
      return regla;
    };
    const ri = medir("izq");
    s.ptrs = { nodo: id };
    ver(s, null, { vars: { nodo: nombre(s, id), izquierda: ri.h }, activo: id, reglas: [ri], sub: { ids: subarbol(s, n.izq), lado: "izq" } });
    paso(C, 2, `La izquierda mide ${ri.h}. Ahora la derecha.`);
    const rd = medir("der");
    s.ptrs = { nodo: id };
    const b = ri.h - rd.h;
    s.fbVisibles = [...new Set([...(s.fbVisibles || []), id])];
    const malo = Math.abs(b) > 1;
    ver(s, null, {
      vars: { nodo: nombre(s, id), izquierda: ri.h, derecha: rd.h },
      activo: id,
      reglas: [ri, rd],
      salida: signo(b),
      malo,
      fbNuevo: id,
      error: malo,
    });
    paso(C, 2, malo
      ? `Devuelve ${ri.h} − ${rd.h} = ${signo(b)}. ¡Se pasa de ±1! Con este nodo el árbol no es AVL: un lado es ${Math.abs(b)} niveles más alto que el otro.`
      : `Devuelve ${ri.h} − ${rd.h} = ${signo(b)}. Está entre −1 y +1: este nodo cumple la regla AVL.`, malo ? "error" : "exito");
  }

  // ------------------------------------------------------------------
  // rotarDerecha(y) y rotarIzquierda(x)
  // ------------------------------------------------------------------

  // Anima la rotación y devuelve la raíz nueva del subárbol (o null si no se puede).
  // Si "engancha" es true, quien llamó (la raíz o el padre) apunta al nuevo al volver.
  function animarRotacion(s, id, sentido, paso, ctx, engancha) {
    const C = sentido === "derecha" ? "rotarDerecha" : "rotarIzquierda";
    const S = sentido === "derecha" ? "izq" : "der"; // el hijo que sube
    const O = S === "izq" ? "der" : "izq";
    const P = sentido === "derecha" ? "y" : "x"; // nombres de las variables del C++
    const R = sentido === "derecha" ? "x" : "y";
    const y = id;
    const vy = val(s, y);
    ctx.pila.push(`${C}(${vy})`);
    const vars = (extra) => Object.assign({ [P]: nombre(s, y) }, extra);
    s.congelado = posiciones(s).pos; // mientras cambian los punteros, el dibujo queda quieto
    const r = s.nodos[y][S];
    // Hasta actualizarAltura, las alturas de los dos no sirven: su balance no se muestra.
    s.fbOcultos = [y, r];
    if (r == null) {
      s.ptrs = { [P]: y, [R]: null };
      ver(s, ctx, { vars: vars({ [R]: "nullptr" }), activo: y, hueco: { padre: y, lado: S, malo: true }, error: true });
      paso(C, 2, `${R} = ${P}->${S}, que es nullptr: no hay hijo que pueda subir. Por eso rebalancear solo rota ${sentido === "derecha" ? "a la derecha cuando el lado izquierdo" : "a la izquierda cuando el lado derecho"} es el más alto.`, "error");
      delete s.congelado;
      delete s.fbOcultos;
      ctx.pila.pop();
      return null;
    }
    const vr = val(s, r);
    s.ptrs = { [P]: y, [R]: r };
    ver(s, ctx, { vars: vars({ [R]: nombre(s, r) }), cambio: [R], activo: r, flecha: `${y}:${S}` });
    paso(C, 2, `${R} = ${P}->${S}: el ${vr} es el que va a subir, y el ${vy} va a bajar a su ${lado(O === "izq")}.`);

    const t2 = s.nodos[r][O];
    const t2s = subarbol(s, t2);
    s.ptrs.t2 = t2;
    const entre = sentido === "derecha" ? `mayor que ${vr} y menor que ${vy}` : `mayor que ${vy} y menor que ${vr}`;
    ver(s, ctx, { vars: vars({ [R]: nombre(s, r), t2: nombre(s, t2) }), cambio: ["t2"], t2: t2s, flecha: `${r}:${O}`, hueco: t2 == null ? { padre: r, lado: O } : null });
    paso(C, 3, t2 == null
      ? `t2 = ${R}->${O}, que es nullptr: no hay subárbol en el medio.`
      : `t2 = ${R}->${O}: el subárbol del ${val(s, t2)} es ${entre}. Es el único que va a cambiar de padre.`);

    s.nodos[r][O] = y;
    ver(s, ctx, { vars: vars({ [R]: nombre(s, r), t2: nombre(s, t2) }), t2: t2s, flecha: `${r}:${O}`, apuntado: `${r}:${O}`, activo: y });
    paso(C, 4, `${R}->${O} = ${P}: el ${vr} ahora apunta al ${vy}. Por un momento se apuntan entre los dos; la línea siguiente lo arregla.`);

    s.nodos[y][S] = t2;
    delete s.congelado;
    s.sube = { viejo: y, nuevo: r };
    ver(s, ctx, { vars: vars({ [R]: nombre(s, r), t2: nombre(s, t2) }), t2: t2s, flecha: t2 == null ? null : `${y}:${S}`, apuntado: `${y}:${S}`, activo: r });
    paso(C, 5, t2 == null
      ? `${P}->${S} = t2 (nullptr). Listo: el ${vr} quedó arriba del ${vy}. Fíjate que nadie se movió a los lados: el inorden es el mismo.`
      : `${P}->${S} = t2: el ${val(s, t2)} cambia de padre. El ${vr} quedó arriba del ${vy} y nadie se movió a los lados: el inorden es el mismo.`);

    const hy = s.nodos[y].h;
    recalcular(s, y);
    s.fbOcultos = [r];
    ver(s, ctx, { vars: vars({ [R]: nombre(s, r) }), cambioH: [y], activo: y });
    paso(C, 6, `actualizarAltura(${P}): primero el ${vy}, que ahora está abajo. ${hy === s.nodos[y].h ? `Sigue en ${hy}.` : `Su altura pasa de ${hy} a ${s.nodos[y].h}.`}`);

    const hr = s.nodos[r].h;
    recalcular(s, r);
    delete s.fbOcultos;
    ver(s, ctx, { vars: vars({ [R]: nombre(s, r) }), cambioH: [r], activo: r });
    paso(C, 7, `actualizarAltura(${R}): después el ${vr}, que usa la altura nueva del ${vy}. ${hr === s.nodos[r].h ? `Sigue en ${hr}.` : `Pasa de ${hr} a ${s.nodos[r].h}.`}`);

    let quien = "";
    if (engancha) quien = enganchar(s, y, r);
    ver(s, ctx, { vars: vars({ [R]: nombre(s, r) }), salida: vr, encontrado: r, flecha: engancha ? (quien === "raiz" ? "raiz" : null) : null });
    paso(C, 8, engancha
      ? `return ${R}: devuelve el ${vr}, la raíz nueva de este subárbol, y quien llamó lo engancha (${quien === "raiz" ? "raiz" : `${quien}`} apunta al ${vr}). Solo cambiaron 3 punteros: O(1).`
      : `return ${R}: devuelve el ${vr}, la raíz nueva de este subárbol. Quien llamó todavía apunta al ${vy}: lo arregla con lo que devuelve.`);
    ctx.pila.pop();
    return r;
  }

  // ------------------------------------------------------------------
  // rebalancear(nodo): los cuatro casos
  // ------------------------------------------------------------------

  function animarRebalancear(s, id, paso, ctx, engancha) {
    const C = "rebalancear";
    const n = s.nodos[id];
    ctx.pila.push(`rebalancear(${n.v})`);
    s.ptrs = { nodo: id };
    const h0 = n.h;
    recalcular(s, id);
    ver(s, ctx, { vars: { nodo: nombre(s, id) }, activo: id, cambioH: [id] });
    paso(C, 2, h0 === n.h
      ? `actualizarAltura(nodo): el ${n.v} sigue con altura ${n.h} (1 + la mayor de sus hijos).`
      : `actualizarAltura(nodo): el ${n.v} pasa de altura ${h0} a ${n.h} (1 + la mayor de sus hijos).`);

    const b = balanceDe(s, id);
    const reglas = [{ de: n.izq, lado: "izq", h: alt(s, n.izq) }, { de: n.der, lado: "der", h: alt(s, n.der) }];
    ver(s, ctx, { vars: { nodo: nombre(s, id), balance: signo(b) }, cambio: ["balance"], activo: id, reglas, fbNuevo: id });
    const desbalanceado = Math.abs(b) > 1;
    if (!desbalanceado) {
      paso(C, 3, `balance = ${reglas[0].h} − ${reglas[1].h} = ${signo(b)}: está entre −1 y +1.`);
      ver(s, ctx, { vars: { nodo: nombre(s, id), balance: signo(b) }, salida: n.v, encontrado: id });
      paso(C, 16, `No hace falta rotar: devuelve el mismo nodo, el ${n.v}.`, engancha ? "exito" : "");
      ctx.pila.pop();
      return id;
    }
    paso(C, 3, `balance = ${reglas[0].h} − ${reglas[1].h} = ${signo(b)}. ¡Se pasó! El lado ${b > 0 ? "izquierdo" : "derecho"} es 2 niveles más alto.`, "error");

    const izq = b > 0;
    const S = izq ? "izq" : "der";
    const hijo = n[S];
    const bh = balanceDe(s, hijo);
    const doble = izq ? bh < 0 : bh > 0;
    const caso = izq ? (doble ? "izquierda-derecha" : "izquierda-izquierda") : (doble ? "derecha-izquierda" : "derecha-derecha");
    ver(s, ctx, { vars: { nodo: nombre(s, id), balance: signo(b) }, activo: id, caso });
    paso(C, izq ? 4 : 10, `balance ${izq ? "> 1" : "< −1"}: cargado a la ${lado(izq)}. Hay que subir a su hijo ${izq ? "izquierdo" : "derecho"}, el ${val(s, hijo)}.`);

    ver(s, ctx, { vars: { nodo: nombre(s, id), balance: signo(b) }, activo: hijo, fbNuevo: hijo, flecha: `${id}:${S}`, caso });
    paso(C, izq ? 5 : 11, doble
      ? `factorBalance(nodo->${S}) = ${signo(bh)}: el ${val(s, hijo)} está cargado hacia adentro, en zigzag (caso ${caso}). Si subiera así, el zigzag quedaría del otro lado: primero hay que enderezarlo.`
      : `factorBalance(nodo->${S}) = ${signo(bh)}: el ${val(s, hijo)} está cargado hacia el mismo lado, en línea recta (caso ${caso}). Basta una rotación.`);

    if (doble) {
      const r1 = animarRotacion(s, hijo, izq ? "izquierda" : "derecha", paso, ctx, false);
      n[S] = r1;
      delete s.sube;
      s.ptrs = { nodo: id };
      ver(s, ctx, { vars: { nodo: nombre(s, id) }, flecha: `${id}:${S}`, apuntado: `${id}:${S}`, activo: r1, caso });
      paso(C, izq ? 6 : 12, `nodo->${S} = el ${val(s, r1)}: el zigzag quedó en línea recta. Ahora es un caso ${izq ? "izquierda-izquierda" : "derecha-derecha"}.`);
    }

    s.ptrs = { nodo: id };
    ver(s, ctx, { vars: { nodo: nombre(s, id) }, activo: id, flecha: `${id}:${S}`, caso });
    paso(C, izq ? 8 : 14, `return ${izq ? "rotarDerecha" : "rotarIzquierda"}(nodo): el ${val(s, n[S])} sube y el ${n.v} baja a su ${lado(!izq)}.`);
    const r = animarRotacion(s, id, izq ? "derecha" : "izquierda", paso, ctx, false);

    let quien = "";
    if (engancha) quien = enganchar(s, id, r);
    s.ptrs = { nodo: id };
    ver(s, ctx, { vars: { nodo: nombre(s, id) }, salida: val(s, r), encontrado: r, flecha: quien === "raiz" ? "raiz" : null, caso });
    paso(C, izq ? 8 : 14, engancha
      ? `rebalancear devuelve el ${val(s, r)} y ${quien === "raiz" ? "raiz" : quien} apunta a él. ${doble ? "Dos rotaciones" : "Una rotación"} y todos quedaron entre −1 y +1.`
      : `rebalancear devuelve el ${val(s, r)}, la raíz nueva de este subárbol: ${doble ? "dos rotaciones" : "una rotación"} y todos quedaron entre −1 y +1.`, engancha ? "exito" : "");
    ctx.pila.pop();
    return r;
  }

  // ------------------------------------------------------------------
  // insertar(valor) e insertarEn(nodo, valor), recursivo
  // ------------------------------------------------------------------

  function limite(s, clave, linea, paso) {
    ver(s, null, { error: true });
    paso(clave, linea, `Para que quepa en pantalla, el árbol llega hasta ${MAXIMO} nodos. Elimina alguno o pulsa Reiniciar.`, "error");
  }

  // Lo que hacen insertarEn y eliminarDe al final: return rebalancear(nodo).
  // Si no hay que rotar, la llamada se resume en un paso.
  function alVolver(s, id, C, linea, nivel, ctx, paso, vars) {
    const n = s.nodos[id];
    const h0 = n.h;
    const hNueva = 1 + Math.max(alt(s, n.izq), alt(s, n.der));
    const b = balanceDe(s, id);
    if (Math.abs(b) <= 1) {
      recalcular(s, id);
      s.ptrs = { nodo: id };
      ver(s, ctx, { nivel, vars: vars(), activo: id, cambioH: [id], fbNuevo: id });
      paso(C, linea, `return rebalancear(nodo): el ${n.v} ${h0 === hNueva ? `sigue con altura ${hNueva}` : `pasa de altura ${h0} a ${hNueva}`} y su balance es ${signo(b)}. No hay que rotar.${h0 === hNueva ? " Como su altura no cambió, más arriba nadie cambiará." : ""}`);
      ctx.pila.pop();
      return id;
    }
    const r = animarRebalancear(s, id, paso, ctx, false);
    s.ptrs = { nodo: id };
    ver(s, ctx, { nivel, vars: vars(), activo: r });
    paso(C, linea, `rebalancear devolvió el ${val(s, r)}: esta llamada lo devuelve a quien la llamó.`);
    ctx.pila.pop();
    return r;
  }

  function recInsertar(s, id, valor, padre, l, nivel, ctx, paso) {
    const C = "insertarEn";
    ctx.pila.push(`insertarEn(${id == null ? "nullptr" : val(s, id)})`);
    s.ptrs = { nodo: id };
    const vars = () => ({ valor, nodo: nombre(s, id) });
    if (id == null) {
      ver(s, ctx, { nivel, vars: vars(), hueco: padre == null ? { raiz: true } : { padre, lado: l } });
      paso(C, 2, `nodo es nullptr: aquí va el ${valor}.`);
      const nuevo = nuevoNodo(s, valor);
      s.nodos[nuevo].colgar = { padre, lado: l };
      s.ptrs = { nuevo };
      ver(s, ctx, { nivel, vars: vars(), nuevo, fbNuevo: nuevo });
      paso(C, 4, `tamano++ y return new Nodo(${valor}): nace con altura 1 y sin hijos. Todavía nadie lo apunta: lo engancha quien llamó, con lo que devuelve.`);
      ctx.pila.pop();
      return nuevo;
    }
    const n = s.nodos[id];
    if (valor === n.v) {
      ver(s, ctx, { nivel, vars: vars(), encontrado: id, error: true });
      paso(C, 11, `${valor} == ${n.v}: ya está. return nodo, sin cambiar nada (no se aceptan repetidos, como std::set).`, "error");
      ctx.pila.pop();
      return id;
    }
    const S = valor < n.v ? "izq" : "der";
    ver(s, ctx, { nivel, vars: vars(), activo: id, flecha: `${id}:${S}` });
    paso(C, S === "izq" ? 7 : 9, `${valor} ${S === "izq" ? "<" : ">"} ${n.v}: baja por la ${lado(S === "izq")}. El ${n.v} queda esperando: al volver revisará su balance.`);
    ctx.enPila.push(id);
    const r = recInsertar(s, n[S], valor, id, S, nivel + 1, ctx, paso);
    ctx.enPila.pop();
    s.ptrs = { nodo: id };
    if (r !== n[S]) {
      const eraNuevo = !!s.nodos[r].colgar;
      delete s.nodos[r].colgar;
      n[S] = r;
      delete s.sube;
      ver(s, ctx, { nivel, vars: vars(), activo: id, flecha: `${id}:${S}`, apuntado: `${id}:${S}` });
      paso(C, S === "izq" ? 7 : 9, eraNuevo
        ? `nodo->${S} = el nodo nuevo: el ${n.v} lo engancha como hoja.`
        : `nodo->${S} = el ${val(s, r)}: abajo hubo una rotación, y el ${n.v} apunta a la raíz nueva de ese subárbol.`);
    }
    return alVolver(s, id, C, 13, nivel, ctx, paso, vars);
  }

  function animarInsertar(s, valor, paso) {
    const yaEsta = buscarDirecto(s, valor) != null;
    if (!yaEsta && cantidad(s) >= MAXIMO) {
      limite(s, "insertar", 3, paso);
      return;
    }
    const ctx = nuevoCtx(`insertar(${valor})`);
    const antes = cantidad(s);
    s.ptrs = {};
    ver(s, ctx, { vars: { valor, antes }, flecha: "raiz" });
    paso("insertar", 3, `raiz = insertarEn(raiz, ${valor}): la recursión baja desde la raíz y, al volver, devuelve la raíz (quizás nueva) del árbol.`);
    const r = recInsertar(s, s.raiz, valor, null, null, 1, ctx, paso);
    const cambio = r !== s.raiz;
    if (s.nodos[r].colgar) delete s.nodos[r].colgar;
    s.raiz = r;
    delete s.sube;
    s.ptrs = {};
    ver(s, ctx, { vars: { valor, antes }, flecha: "raiz", apuntadoRaiz: true });
    paso("insertar", 3, cambio
      ? `De vuelta en insertar: raiz = el ${val(s, r)}. ${antes === 0 ? "Es el primer nodo." : "Hubo una rotación en la raíz: la raíz cambió."}`
      : `De vuelta en insertar: raiz sigue siendo el ${val(s, r)}.`);
    const ok = cantidad(s) > antes;
    ver(s, ctx, { vars: { cantidad: cantidad(s), altura: alt(s, s.raiz) }, salida: ok ? "true" : "false", error: !ok });
    paso("insertar", 4, ok
      ? `tamano > antes: devuelve true. ${cantidad(s)} nodos y altura ${alt(s, s.raiz)}; inorden: ${inordenDirecto(s).join(", ")}.`
      : `tamano no cambió: el ${valor} ya estaba. Devuelve false.`, ok ? "exito" : "error");
  }

  // Inserta de un paso (y rota en otro): para armar árboles grandes rápido.
  function insertarRapido(s, valor, paso) {
    const C = "insertar";
    if (buscarDirecto(s, valor) != null) {
      ver(s, null, { error: true });
      paso(C, 4, `insertar(${valor}): ya estaba, devuelve false.`, "error");
      return;
    }
    if (cantidad(s) >= MAXIMO) {
      limite(s, C, 3, paso);
      return;
    }
    const camino = [];
    for (let a = s.raiz; a != null; a = valor < s.nodos[a].v ? s.nodos[a].izq : s.nodos[a].der) camino.push(a);
    const id = insertarABB(s, valor);
    for (let k = camino.length - 1; k >= 0; k--) recalcular(s, camino[k]);
    const malo = camino.slice().reverse().find((a) => Math.abs(balanceDe(s, a)) > 1);
    const info = () => ({ cantidad: cantidad(s), altura: alt(s, s.raiz) });
    ver(s, null, { vars: info(), nuevo: id, fbNuevo: malo || id });
    paso(C, 3, malo
      ? `insertar(${valor}): baja hasta un nullptr y se cuelga como hoja. Al volver, el ${val(s, malo)} queda en ${signo(balanceDe(s, malo))}.`
      : `insertar(${valor}): baja hasta un nullptr y se cuelga como hoja. Al volver, todos siguen entre −1 y +1.`);
    if (!malo) return;
    const vm = val(s, malo);
    const { padre, lado: l } = padreDe(s, malo);
    const casos = [];
    const r = rebalancearDirecto(s, malo, casos);
    if (padre == null) s.raiz = r;
    else s.nodos[padre][l] = r;
    for (let k = camino.indexOf(malo) - 1; k >= 0; k--) recalcular(s, camino[k]);
    const doble = casos[0] === "izquierda-derecha" || casos[0] === "derecha-izquierda";
    ver(s, null, { vars: info(), encontrado: r, caso: casos[0] });
    paso(C, 3, `rebalancear(${vm}): caso ${casos[0]}, ${doble ? "dos rotaciones" : "una rotación"} y el ${val(s, r)} sube a su lugar. Altura ${alt(s, s.raiz)}.`);
  }

  // ------------------------------------------------------------------
  // eliminar(valor) y eliminarDe(nodo, valor), recursivo
  // ------------------------------------------------------------------

  function recEliminar(s, id, valor, padre, l, nivel, ctx, paso) {
    const C = "eliminarDe";
    ctx.pila.push(`eliminarDe(${id == null ? "nullptr" : val(s, id)})`);
    s.ptrs = { nodo: id };
    const vars = (extra) => Object.assign({ valor, nodo: nombre(s, id) }, extra);
    if (id == null) {
      ver(s, ctx, { nivel, vars: vars(), hueco: padre == null ? { raiz: true, malo: true } : { padre, lado: l, malo: true }, error: true });
      paso(C, 3, `nodo es nullptr: el ${valor} no está. Devuelve nullptr (lo mismo que había) y nada cambia.`, "error");
      ctx.pila.pop();
      return null;
    }
    const n = s.nodos[id];
    if (valor !== n.v) {
      const S = valor < n.v ? "izq" : "der";
      ver(s, ctx, { nivel, vars: vars(), activo: id, flecha: `${id}:${S}` });
      paso(C, S === "izq" ? 6 : 8, `${valor} ${S === "izq" ? "<" : ">"} ${n.v}: si está, está a la ${lado(S === "izq")}. El ${n.v} queda esperando para rebalancearse al volver.`);
      ctx.enPila.push(id);
      const r = recEliminar(s, n[S], valor, id, S, nivel + 1, ctx, paso);
      ctx.enPila.pop();
      s.ptrs = { nodo: id };
      if (r !== n[S]) {
        const borrado = !existe(s, n[S]);
        n[S] = r;
        delete s.congelado;
        delete s.sube;
        ver(s, ctx, { nivel, vars: vars(), activo: id, flecha: r == null ? null : `${id}:${S}`, apuntado: `${id}:${S}` });
        paso(C, S === "izq" ? 6 : 8, r == null
          ? `nodo->${S} = nullptr: el ${n.v} deja de apuntar a la memoria liberada.`
          : borrado
            ? `nodo->${S} = el ${val(s, r)}: el ${n.v} apunta al hijo que sube en lugar del nodo borrado.`
            : `nodo->${S} = el ${val(s, r)}: abajo hubo una rotación, y el ${n.v} apunta a la raíz nueva de ese subárbol.`);
      }
      return alVolver(s, id, C, 22, nivel, ctx, paso, vars);
    }
    if (n.izq == null || n.der == null) {
      const hijo = n.izq != null ? n.izq : n.der;
      s.ptrs = { nodo: id, hijo };
      ver(s, ctx, { nivel, vars: vars({ hijo: nombre(s, hijo) }), cambio: ["hijo"], condenado: id, activo: hijo, hueco: hijo == null ? { padre: id, lado: "der" } : null });
      paso(C, 10, hijo == null
        ? `¡Encontrado! El ${valor} es una hoja: hijo = nullptr.`
        : `¡Encontrado! El ${valor} tiene un solo hijo: hijo = el ${val(s, hijo)}, que subirá a su lugar con todo su subárbol.`);
      s.congelado = posiciones(s).pos; // el dibujo queda quieto hasta que el padre se entere
      delete s.nodos[id];
      s.ptrs = { hijo };
      ver(s, ctx, { nivel, vars: vars({ hijo: nombre(s, hijo) }), activo: hijo });
      paso(C, 11, `delete nodo: se libera su memoria. ${padre == null ? "raiz" : `El ${val(s, padre)}`} todavía apunta ahí (un puntero colgante): lo arregla con lo que devuelve esta llamada.`);
      ver(s, ctx, { nivel, vars: vars({ hijo: nombre(s, hijo) }), activo: hijo, salida: hijo == null ? "nullptr" : val(s, hijo) });
      paso(C, 13, `tamano-- y return hijo: devuelve ${hijo == null ? "nullptr" : `el ${val(s, hijo)}`}.`);
      ctx.pila.pop();
      return hijo;
    }

    // Dos hijos: el sucesor (el menor del subárbol derecho) toma su lugar.
    let suc = n.der;
    s.ptrs = { nodo: id, sucesor: suc };
    const varsSuc = () => vars({ sucesor: nombre(s, suc) });
    ver(s, ctx, { nivel, vars: varsSuc(), cambio: ["sucesor"], encontrado: id, activo: suc, flecha: `${id}:der` });
    paso(C, 15, `¡Encontrado! El ${valor} tiene dos hijos: lo reemplaza su sucesor, el menor del subárbol derecho. sucesor = nodo->der.`);
    let vueltas = 0;
    while (s.nodos[suc].izq != null) {
      const antes = suc;
      suc = s.nodos[suc].izq;
      vueltas++;
      s.ptrs.sucesor = suc;
      ver(s, ctx, { nivel, vars: varsSuc(), cambio: ["sucesor"], activo: suc, flecha: `${antes}:izq`, vueltas: { 16: vueltas } });
      paso(C, 17, `El ${val(s, antes)} tiene hijo izquierdo, algo todavía menor: sucesor = el ${val(s, suc)}.`);
    }
    const viejo = n.v;
    n.v = s.nodos[suc].v;
    ver(s, ctx, { nivel, vars: varsSuc(), copia: { de: suc, a: id }, activo: id });
    paso(C, 19, `nodo->valor = sucesor->valor: el ${n.v} se copia donde estaba el ${viejo}. Sigue en orden: es mayor que todo lo de la izquierda y menor que el resto de la derecha.`);
    ver(s, ctx, { nivel, vars: varsSuc(), activo: id, condenado: suc, flecha: `${id}:der` });
    paso(C, 20, `Ahora hay que borrar el ${n.v} repetido de abajo: eliminarDe(nodo->der, ${n.v}). No tiene hijo izquierdo, así que es una hoja o tiene un hijo.`);
    ctx.enPila.push(id);
    const r = recEliminar(s, n.der, n.v, id, "der", nivel + 1, ctx, paso);
    ctx.enPila.pop();
    s.ptrs = { nodo: id };
    if (r !== n.der) {
      const borrado = !existe(s, n.der);
      n.der = r;
      delete s.congelado;
      delete s.sube;
      ver(s, ctx, { nivel, vars: vars(), activo: id, flecha: r == null ? null : `${id}:der`, apuntado: `${id}:der` });
      paso(C, 20, r == null
        ? "nodo->der = nullptr: deja de apuntar a la memoria liberada."
        : borrado
          ? `nodo->der = el ${val(s, r)}: apunta al hijo que subió.`
          : `nodo->der = el ${val(s, r)}: abajo hubo una rotación.`);
    }
    return alVolver(s, id, C, 22, nivel, ctx, paso, vars);
  }

  function animarEliminar(s, valor, paso) {
    const ctx = nuevoCtx(`eliminar(${valor})`);
    const antes = cantidad(s);
    s.ptrs = {};
    ver(s, ctx, { vars: { valor, antes }, flecha: "raiz" });
    paso("eliminar", 3, `raiz = eliminarDe(raiz, ${valor}): baja buscando el ${valor} y, al volver, cada nodo del camino se rebalancea.`);
    const r = recEliminar(s, s.raiz, valor, null, null, 1, ctx, paso);
    const cambio = r !== s.raiz;
    s.raiz = r;
    delete s.congelado;
    delete s.sube;
    s.ptrs = {};
    ver(s, ctx, { vars: { valor, antes }, flecha: r == null ? null : "raiz", apuntadoRaiz: true });
    paso("eliminar", 3, !cambio
      ? `De vuelta en eliminar: raiz sigue siendo ${r == null ? "nullptr" : `el ${val(s, r)}`}.`
      : r == null
        ? "De vuelta en eliminar: raiz = nullptr. El árbol quedó vacío."
        : `De vuelta en eliminar: raiz = el ${val(s, r)}. La raíz cambió.`);
    const ok = cantidad(s) < antes;
    ver(s, ctx, { vars: { cantidad: cantidad(s), altura: alt(s, s.raiz) }, salida: ok ? "true" : "false", error: !ok });
    paso("eliminar", 4, ok
      ? `tamano < antes: devuelve true. ${cantidad(s)} nodos y altura ${alt(s, s.raiz)}${cantidad(s) ? `; inorden: ${inordenDirecto(s).join(", ")}` : ""}.`
      : `tamano no cambió: el ${valor} no estaba. Devuelve false.`, ok ? "exito" : "error");
  }

  // ------------------------------------------------------------------
  // buscar(valor): igual que en un ABB
  // ------------------------------------------------------------------

  function animarBuscar(s, valor, paso) {
    const C = "buscar";
    let actual = s.raiz;
    const camino = [];
    const descartados = [];
    s.ptrs = { actual };
    const vars = () => ({ valor, actual: nombre(s, actual) });
    ver(s, null, { vars: vars(), flecha: "raiz", activo: actual });
    paso(C, 2, actual == null ? "actual = raiz, que es nullptr: el árbol está vacío." : `actual = raiz: empezamos en el ${val(s, actual)}.`);
    let comparaciones = 0;
    while (actual != null) {
      const n = s.nodos[actual];
      comparaciones++;
      if (valor === n.v) {
        ver(s, null, { vars: vars(), camino, descartados, encontrado: actual, salida: "true" });
        paso(C, 5, `¡${valor} == ${n.v}! Está. ${comparaciones} comparación(es): como mucho tantas como la altura, ${alt(s, s.raiz)}.`, "exito");
        s.ptrs = {};
        return;
      }
      const S = valor < n.v ? "izq" : "der";
      descartados.push(...subarbol(s, n[S === "izq" ? "der" : "izq"]));
      camino.push(actual);
      ver(s, null, { vars: vars(), camino, descartados, activo: actual, flecha: `${actual}:${S}` });
      paso(C, S === "izq" ? 7 : 9, `${valor} ${S === "izq" ? "<" : ">"} ${n.v}: seguimos por la ${lado(S === "izq")} y el otro subárbol queda descartado.`);
      const padre = actual;
      actual = n[S];
      s.ptrs.actual = actual;
      ver(s, null, { vars: vars(), cambio: ["actual"], camino, descartados, activo: actual, hueco: actual == null ? { padre, lado: S } : null });
      paso(C, S === "izq" ? 8 : 10, actual == null ? `actual = actual->${S}, que es nullptr.` : `actual = el ${val(s, actual)}.`);
      if (actual == null) {
        ver(s, null, { vars: vars(), camino, descartados, hueco: { padre, lado: S, malo: true }, salida: "false", error: true });
        paso(C, 13, `${valor} no está. Bastaron ${comparaciones} comparaciones: el árbol tiene altura ${alt(s, s.raiz)}.`, "error");
        s.ptrs = {};
        return;
      }
    }
    ver(s, null, { vars: vars(), hueco: { raiz: true, malo: true }, salida: "false", error: true });
    paso(C, 13, `El árbol está vacío: ${valor} no está.`, "error");
    s.ptrs = {};
  }

  // ------------------------------------------------------------------
  // Dibujo
  // ------------------------------------------------------------------

  // Posición de cada nodo: x según su lugar en inorden, y según su profundidad.
  // Es una función pura del estado. En una rotación, mientras quien llamó todavía
  // apunta al nodo que bajó (s.sube), el dibujo ya muestra al que subió en su lugar.
  function posiciones(s) {
    const pendiente = {};
    for (const [id, n] of Object.entries(s.nodos)) if (n.colgar) pendiente[`${n.colgar.padre}:${n.colgar.lado}`] = id;
    const sube = s.sube;
    const cambiar = (h, desde) => (sube && h === sube.viejo && desde !== sube.nuevo ? sube.nuevo : h);
    const hijo = (id, l) => {
      let h = s.nodos[id][l];
      if (!existe(s, h)) h = pendiente[`${id}:${l}`] || null;
      return cambiar(h, id);
    };
    let raiz = existe(s, s.raiz) ? s.raiz : pendiente["null:null"] || null;
    raiz = cambiar(raiz, null);
    const orden = [];
    const prof = {};
    const vistos = new Set();
    const visitar = (id, d) => {
      if (id == null || !s.nodos[id] || vistos.has(id)) return;
      vistos.add(id);
      visitar(hijo(id, "izq"), d + 1);
      prof[id] = d;
      orden.push(id);
      visitar(hijo(id, "der"), d + 1);
    };
    visitar(raiz, 0);
    const pos = {};
    orden.forEach((id, k) => { pos[id] = { x: X_ARBOL + k * PASO_X, y: Y_ARBOL + prof[id] * NIVEL }; });
    if (s.congelado) {
      for (const id of Object.keys(s.nodos)) if (s.congelado[id]) pos[id] = Object.assign({}, s.congelado[id]);
    }
    const ys = Object.values(pos).map((p) => p.y);
    const niveles = ys.length ? Math.round((Math.max(...ys) - Y_ARBOL) / NIVEL) + 1 : 1;
    return { pos, niveles, n: Math.max(orden.length, Object.keys(pos).length) };
  }

  let lienzos = 0;

  function crearLienzo(escenario) {
    const n = ++lienzos;
    const svg = document.createElementNS(SVG, "svg");
    svg.innerHTML =
      "<defs>" +
      `<marker id="punta-avl-${n}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z"/></marker>` +
      `<marker id="punta-avl-activa-${n}" class="activa" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z"/></marker>` +
      `<marker id="punta-avl-pendiente-${n}" class="pendiente" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z"/></marker>` +
      "</defs>";
    const raiz = el("div", { class: "abb-raiz" }, el("span", { class: "abb-raiz-nombre", text: "raiz" }), el("span", { class: "ptr" }));
    const hueco = el("div", { class: "abb-hueco", text: "∅" });
    const lienzo = el("div", { class: "lienzo-abb lienzo-avl", "data-n": n }, svg, raiz, hueco);
    escenario.append(el("div", { class: "info-abb" }), el("div", { class: "marco-abb" }, lienzo));
    return lienzo;
  }

  if (typeof window !== "undefined") {
    window.addEventListener("resize", () => {
      for (const lienzo of document.querySelectorAll(".lienzo-avl")) {
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
    const k = Math.max(0.5, Math.min(1, (escenario.clientWidth - 32) / ancho));
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
    if (existe(s, s.raiz)) deseadas.set("raiz", s.raiz);
    for (const [id, n] of Object.entries(s.nodos)) {
      for (const l of ["izq", "der"]) if (existe(s, n[l])) deseadas.set(`${id}:${l}`, n[l]);
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
      // Quien todavía apunta al nodo que bajó en una rotación (lo arregla al volver).
      const pendiente = !!(s.sube && a === s.sube.viejo && de.split(":")[0] !== s.sube.nuevo);
      const activa = vis.flecha === de && !pendiente;
      path.classList.toggle("activa", activa);
      path.classList.toggle("pendiente", pendiente);
      path.classList.toggle("tenue", (vis.descartados || []).includes(a));
      path.setAttribute("marker-end", `url(#punta-avl${activa ? "-activa" : pendiente ? "-pendiente" : ""}-${n})`);
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
      const [id, l] = de.split(":");
      const caja = lienzo.querySelector(`.anodo[data-id="${id}"]`);
      if (!caja) continue;
      const celda = caja.querySelector(`.ptr.${l}`);
      const x1 = caja.offsetLeft + celda.offsetLeft + celda.offsetWidth / 2;
      const y1 = caja.offsetTop + celda.offsetTop + celda.offsetHeight / 2;
      if (y2 < y1) {
        // Apunta hacia arriba (en medio de una rotación): una curva por el costado.
        const dx = x2 >= x1 ? 46 : -46;
        path.setAttribute("d", `M ${x1} ${y1} C ${x1 + dx} ${y1 + 30}, ${x2 + dx} ${y2 - 40}, ${x2} ${y2}`);
      } else {
        path.setAttribute("d", `M ${x1} ${y1} L ${x2} ${y2}`);
      }
    }
  }

  // Un valor que viaja de un lugar a otro del dibujo (la copia del sucesor).
  function viajar(lienzo, texto, desde, hasta) {
    const ficha = el("div", { class: "abb-ficha copia", text: texto });
    ficha.style.left = `${desde.x}px`;
    ficha.style.top = `${desde.y}px`;
    lienzo.append(ficha);
    void ficha.offsetWidth;
    ficha.style.left = `${hasta.x}px`;
    ficha.style.top = `${hasta.y}px`;
    setTimeout(() => ficha.remove(), 650);
  }

  // Corchete con la altura de un subárbol, al costado de sus nodos.
  function dibujarReglas(lienzo, s, vis, pos) {
    const deseadas = (vis.reglas || []).filter((r) => r.de != null && pos[r.de]);
    const claves = new Set(deseadas.map((r) => r.lado));
    for (const pieza of lienzo.querySelectorAll(".avl-regla[data-lado]")) if (!claves.has(pieza.dataset.lado)) retirar(pieza);
    let derecha = 0;
    let fondo = 0;
    for (const r of deseadas) {
      const ps = subarbol(s, r.de).map((id) => pos[id]).filter(Boolean);
      const x = r.lado === "izq" ? Math.min(...ps.map((p) => p.x)) - 16 : Math.max(...ps.map((p) => p.x)) + ANCHO + 14;
      const y = Math.min(...ps.map((p) => p.y));
      const h = Math.max(...ps.map((p) => p.y)) + ALTO - y;
      let pieza = lienzo.querySelector(`.avl-regla[data-lado="${r.lado}"]`);
      if (!pieza) {
        pieza = el("div", { class: `avl-regla ${r.lado}`, "data-lado": r.lado }, el("span", { class: "avl-regla-texto" }));
        pieza.style.left = `${x}px`;
        pieza.style.top = `${y}px`;
        pieza.style.height = `${h}px`;
        lienzo.append(pieza);
      }
      pieza.querySelector(".avl-regla-texto").textContent = `h = ${r.h}`;
      pieza.style.left = `${x}px`;
      pieza.style.top = `${y}px`;
      pieza.style.height = `${h}px`;
      derecha = Math.max(derecha, x + 40);
      fondo = Math.max(fondo, y + h);
    }
    return { derecha, fondo };
  }

  function dibujar(escenario, s) {
    const lienzo = escenario.querySelector(".lienzo-avl") || crearLienzo(escenario);
    const vis = s.vis || {};
    const { pos, niveles, n } = posiciones(s);

    // Arriba del dibujo: llamadas en curso, variables y valor devuelto.
    const malo = vis.salida === "false" || vis.malo;
    escenario.querySelector(".info-abb").replaceChildren(
      vis.pila && vis.pila.length > 1
        ? el("div", { class: "pila-llamadas", "aria-label": "Llamadas en curso" },
          vis.pila.flatMap((texto, k) => [k ? "›" : "", el("span", { class: "llamada", text: texto })]))
        : "",
      DS.variables(vis.vars || { cantidad: cantidad(s), altura: alt(s, s.raiz) }, vis.cambio),
      vis.caso ? el("span", { class: "abb-caso", text: `caso ${vis.caso}` }) : "",
      vis.salida != null
        ? el("div", { class: "salida-valor" }, "devuelve", el("div", { class: `celda ${malo ? "error" : "encontrada"}`, text: vis.salida }))
        : "");

    // La variable raiz, a la izquierda.
    const raiz = lienzo.querySelector(".abb-raiz");
    raiz.style.left = `${MARGEN}px`;
    raiz.style.top = `${Y_ARBOL}px`;
    const ptrRaiz = raiz.querySelector(".ptr");
    ptrRaiz.classList.toggle("nulo", s.raiz == null);
    ptrRaiz.classList.toggle("colgante", s.raiz != null && !existe(s, s.raiz));
    raiz.classList.toggle("activa", vis.flecha === "raiz");

    // Nodos: se deslizan a su lugar; los nuevos aparecen con un pop y los borrados se desvanecen.
    const vivos = new Set(Object.keys(s.nodos));
    for (const caja of lienzo.querySelectorAll(".anodo[data-id]")) if (!vivos.has(caja.dataset.id)) retirar(caja);
    const enPila = new Set(vis.enPila || []);
    const t2 = new Set(vis.t2 || []);
    const sub = vis.sub ? new Set(vis.sub.ids) : new Set();
    const fbVisibles = s.fbVisibles ? new Set(s.fbVisibles) : null;
    for (const [id, nodo] of Object.entries(s.nodos)) {
      const p = pos[id];
      if (!p) continue;
      let caja = lienzo.querySelector(`.anodo[data-id="${id}"]`);
      let clase = "anodo avl";
      if (!caja) {
        caja = el("div", { class: "anodo avl", "data-id": id },
          el("span", { class: "valor" }), el("span", { class: "alt", title: "altura guardada en el nodo" }),
          el("span", { class: "ptr izq" }), el("span", { class: "ptr der" }),
          el("span", { class: "avl-fb", title: "factor de balance: altura(izq) − altura(der)" }));
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
        if (valor.textContent && vis.copia && vis.copia.a === id && pos[vis.copia.de]) {
          const de = pos[vis.copia.de];
          viajar(lienzo, nodo.v, { x: de.x + 6, y: de.y + 2 }, { x: p.x + 6, y: p.y + 2 });
        }
        valor.textContent = nodo.v;
      }
      // La altura guardada: late cuando cambia.
      const altura = caja.querySelector(".alt");
      if (altura.textContent !== String(nodo.h)) {
        if (altura.textContent) {
          altura.classList.remove("cambia");
          void altura.offsetWidth;
          altura.classList.add("cambia");
        }
        altura.textContent = nodo.h;
      }
      altura.classList.toggle("leida", vis.leida === id || (vis.cambioH || []).includes(id));
      // El factor de balance (se calcula, no se guarda).
      const b = balanceDe(s, id);
      const fb = caja.querySelector(".avl-fb");
      const texto = signo(b);
      if (fb.textContent !== texto && fb.textContent && fbVisibles == null) {
        fb.classList.remove("cambia");
        void fb.offsetWidth;
        fb.classList.add("cambia");
      }
      fb.textContent = texto;
      fb.className = `avl-fb fb-${Math.min(2, Math.abs(b))}${fb.classList.contains("cambia") ? " cambia" : ""}`;
      const visible = (fbVisibles == null || fbVisibles.has(id)) && !(s.fbOcultos || []).includes(id);
      fb.classList.toggle("oculto", !visible);
      fb.classList.toggle("resaltado", vis.fbNuevo === id);
      for (const l of ["izq", "der"]) {
        const celda = caja.querySelector(`.ptr.${l}`);
        celda.classList.toggle("nulo", nodo[l] == null);
        celda.classList.toggle("colgante", nodo[l] != null && !existe(s, nodo[l]));
        celda.classList.toggle("resaltado", vis.flecha === `${id}:${l}` || vis.apuntado === `${id}:${l}`);
      }
      if (nodo.colgar) clase += " suelto";
      if (visible && Math.abs(b) > 1) clase += " desbalanceado";
      if (vis.activo === id) clase += " activo";
      if (vis.encontrado === id) clase += " encontrado";
      if (vis.condenado === id) clase += " condenado";
      if ((vis.camino || []).includes(id)) clase += " camino";
      if ((vis.descartados || []).includes(id)) clase += " descartado";
      if (enPila.has(id)) clase += " en-pila";
      if (t2.has(id)) clase += " t2";
      if (sub.has(id)) clase += ` lado-${vis.sub.lado}`;
      if (vis.copia && vis.copia.a === id) clase += " copiado";
      caja.className = clase;
    }

    // El hueco nullptr donde termina una búsqueda.
    const hueco = lienzo.querySelector(".abb-hueco");
    let fondo = Y_ARBOL + (niveles - 1) * NIVEL + ALTO;
    if (vis.hueco) {
      const h = vis.hueco.raiz || !pos[vis.hueco.padre]
        ? { x: X_ARBOL + 12, y: Y_ARBOL + 8 }
        : { x: pos[vis.hueco.padre].x + (vis.hueco.lado === "izq" ? -PASO_X * 0.5 : PASO_X * 0.5) + 14, y: pos[vis.hueco.padre].y + ALTO + 12 };
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
        if (vis.hueco) (marcas.hueco = marcas.hueco || []).push(k);
        continue;
      }
      if (pos[destino]) (marcas[destino] = marcas[destino] || []).push(k);
    }
    const presentes = new Set();
    for (const [donde, nombres] of Object.entries(marcas)) {
      const x = donde === "hueco" ? parseFloat(hueco.style.left) + 17 : pos[donde].x + ANCHO / 2;
      const y = donde === "hueco" ? parseFloat(hueco.style.top) - 17 : pos[donde].y - 18;
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

    // Corchetes con la altura de cada subárbol.
    const reglas = dibujarReglas(lienzo, s, vis, pos);

    // Tamaño del dibujo y sacudida si hubo un error.
    const derecha = Math.max(X_ARBOL + Math.max(1, n) * PASO_X + 30, reglas.derecha, ...Object.values(pos).map((p) => p.x + ANCHO + 24));
    const ancho = Math.max(300, derecha + MARGEN);
    const alto = Math.max(fondo, reglas.fondo) + 10;
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

  const VALOR = { id: "valor", etiqueta: "Valor", min: 0, max: 99, valor: 50 };

  const OPS = {
    factorBalance: {
      etiqueta: "factorBalance(nodo)",
      usa: ["valor"],
      ejecutar(s, { valor }, paso) { animarFactorBalance(s, valor, paso); },
    },
    rotarDerecha: {
      etiqueta: "rotarDerecha(y)",
      usa: ["valor"],
      ejecutar(s, { valor }, paso) {
        const id = buscarDirecto(s, valor);
        if (id == null) {
          ver(s, null, { error: true });
          paso("rotarDerecha", 1, `No hay un nodo con el ${valor}. Elige uno de los valores del árbol.`, "error");
          return;
        }
        animarRotacion(s, id, "derecha", paso, nuevoCtx(""), true);
      },
    },
    rotarIzquierda: {
      etiqueta: "rotarIzquierda(x)",
      usa: ["valor"],
      ejecutar(s, { valor }, paso) {
        const id = buscarDirecto(s, valor);
        if (id == null) {
          ver(s, null, { error: true });
          paso("rotarIzquierda", 1, `No hay un nodo con el ${valor}. Elige uno de los valores del árbol.`, "error");
          return;
        }
        animarRotacion(s, id, "izquierda", paso, nuevoCtx(""), true);
      },
    },
    rebalancear: {
      etiqueta: "rebalancear(nodo)",
      usa: ["valor"],
      ejecutar(s, { valor }, paso) {
        const id = buscarDirecto(s, valor);
        if (id == null) {
          ver(s, null, { error: true });
          paso("rebalancear", 1, `No hay un nodo con el ${valor}. Elige uno de los valores del árbol.`, "error");
          return;
        }
        animarRebalancear(s, id, paso, nuevoCtx(""), true);
      },
    },
    insertar: { etiqueta: "insertar(valor)", usa: ["valor"], ejecutar(s, { valor }, paso) { animarInsertar(s, valor, paso); } },
    eliminar: { etiqueta: "eliminar(valor)", usa: ["valor"], ejecutar(s, { valor }, paso) { animarEliminar(s, valor, paso); } },
    buscar: { etiqueta: "buscar(valor)", usa: ["valor"], ejecutar(s, { valor }, paso) { animarBuscar(s, valor, paso); } },
  };

  // Fragmentos que muestra cada operación (la primera es la que se ve al empezar).
  const FRAGMENTOS = {
    factorBalance: ["factorBalance", "altura"],
    rotarDerecha: ["rotarDerecha"],
    rotarIzquierda: ["rotarIzquierda"],
    rebalancear: ["rebalancear", "rotarDerecha", "rotarIzquierda"],
    insertar: ["insertar", "insertarEn", "rebalancear", "rotarDerecha", "rotarIzquierda"],
    eliminar: ["eliminar", "eliminarDe", "rebalancear", "rotarDerecha", "rotarIzquierda"],
    buscar: ["buscar"],
  };

  function visualizador(contenedor, opciones) {
    const claves = new Set();
    for (const op of opciones.ops) FRAGMENTOS[op].forEach((k) => claves.add(k));
    for (const op of opciones.secundarias || []) claves.add(op.codigo);
    DS.tema({
      contenedor,
      incremental: true,
      dibujar,
      codigo: Object.fromEntries([...claves].map((k) => [k, CODIGO[k]])),
      tituloCodigo: (clave) => `ArbolAVL::${clave}()`,
      codigoInicial: opciones.codigoInicial,
      mensajeInicial: opciones.mensajeInicial,
      estadoInicial: opciones.estadoInicial,
      entradas: opciones.entradas,
      operaciones: opciones.ops.map((id) => Object.assign({ id, codigo: id }, OPS[id]))
        .concat(opciones.secundarias || []),
    });
  }

  // Paso 1: altura guardada y factor de balance.
  visualizador("vis-balance", {
    ops: ["factorBalance"],
    entradas: [Object.assign({}, VALOR, { valor: 30 })],
    estadoInicial: () => Object.assign(estadoABB([50, 30, 70, 20, 40, 10]), { fbVisibles: [] }),
    mensajeInicial: "Un ABB común: cada nodo guarda su altura (h). Calcula el balance del 30 y después del 50. ¿Cuál rompe la regla?",
  });

  // Paso 2: rotaciones simples.
  visualizador("vis-rotar", {
    ops: ["rotarDerecha", "rotarIzquierda"],
    entradas: [Object.assign({}, VALOR, { valor: 50 })],
    estadoInicial: () => estadoAVL([50, 30, 70, 20, 40]),
    mensajeInicial: "Rota a la derecha el 50: sube el 30 y el 40 cambia de padre. Después rota a la izquierda el 30 para deshacerlo.",
  });

  // Paso 3: rebalancear, los cuatro casos.
  const CASOS = {
    ii: { texto: "izquierda-izquierda", valores: [50, 30, 60, 20, 40, 10], ultimo: 10 },
    id: { texto: "izquierda-derecha", valores: [50, 30, 60, 20, 40, 45], ultimo: 45 },
    dd: { texto: "derecha-derecha", valores: [50, 40, 70, 60, 80, 90], ultimo: 90 },
    di: { texto: "derecha-izquierda", valores: [50, 40, 70, 60, 80, 55], ultimo: 55 },
  };
  visualizador("vis-rebalancear", {
    ops: ["rebalancear"],
    entradas: [
      { id: "caso", etiqueta: "Caso", opciones: Object.entries(CASOS).map(([k, c]) => [k, c.texto]), valor: "id" },
      Object.assign({}, VALOR, { valor: 50 }),
    ],
    estadoInicial: ({ caso }) => estadoABB(CASOS[caso].valores, { 50: 3 }),
    mensajeInicial: ({ caso }) => `Acaba de insertarse el ${CASOS[caso].ultimo}: el 50 todavía tiene su altura vieja y quedó desbalanceado. Ejecuta rebalancear(50) y prueba los cuatro casos.`,
  });

  // Paso 4: insertar.
  visualizador("vis-insertar", {
    ops: ["insertar"],
    entradas: [Object.assign({}, VALOR, { valor: 5 })],
    estadoInicial: () => estadoAVL([40, 20, 60, 10, 30]),
    mensajeInicial: "Inserta 5: al volver de la recursión, el 40 queda en +2 y rota. Después prueba 25, 27 y un repetido.",
  });

  // Paso 5: la revancha (valores ordenados).
  const lote = (hasta) => (s, args, paso) => {
    Object.assign(s, vacio());
    for (let v = 1; v <= hasta; v++) insertarRapido(s, v, paso);
    ver(s, null, { vars: { cantidad: cantidad(s), altura: alt(s, s.raiz) } });
    paso("insertar", 4, `1…${hasta} en orden → altura ${alt(s, s.raiz)}. En un ABB común serían ${hasta} niveles, una lista. Buscar cualquiera mira como mucho ${alt(s, s.raiz)} nodos.`, "exito");
  };
  visualizador("vis-revancha", {
    ops: ["insertar"],
    entradas: [Object.assign({}, VALOR, { valor: 8 })],
    codigoInicial: "insertar",
    secundarias: [
      { id: "siete", etiqueta: "1…7 en orden", secundaria: true, codigo: "insertar", ejecutar: lote(7) },
      { id: "quince", etiqueta: "1…15 en orden", secundaria: true, codigo: "insertar", ejecutar: lote(15) },
    ],
    estadoInicial: () => vacio(),
    mensajeInicial: "Los valores ordenados que convertían al ABB en una lista. Pulsa «1…7 en orden» y mira cada rotación.",
  });

  // Paso 6: eliminar.
  visualizador("vis-eliminar", {
    ops: ["eliminar"],
    entradas: [Object.assign({}, VALOR, { valor: 45 })],
    estadoInicial: () => estadoAVL(PARA_ELIMINAR),
    mensajeInicial: "Elimina 45: el 30 queda en +2 y rota, y al subir, la raíz queda en −2 y rota también. Después prueba 75 (dos hijos).",
  });

  // Paso 7: todo junto.
  visualizador("vis-todo", {
    ops: ["insertar", "eliminar", "buscar"],
    entradas: [Object.assign({}, VALOR, { valor: 35, aleatorio: true })],
    estadoInicial: () => estadoAVL([40, 20, 60, 10, 30, 50, 70]),
    mensajeInicial: "Inserta y elimina lo que quieras: el árbol se mantiene balanceado solo. Intenta desbalancearlo.",
  });
})();
