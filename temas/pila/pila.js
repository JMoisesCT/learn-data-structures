// Lección de la pila, en pasos: std::stack (con un uso real, paréntesis
// balanceados) y PilaEnlazada (la misma idea con nodos). Los fragmentos de
// código deben coincidir línea por línea con ejemplos/cpp/pila.cpp
// (scripts/verificar-fragmentos.mjs lo revisa).
(function () {
  const { el } = DS;
  const MAXIMO = 6; // límite solo para que la animación quepa en pantalla
  const SVG = "http://www.w3.org/2000/svg";

  // Medidas del vaso (std::stack) y de la fila de nodos (PilaEnlazada).
  const ANCHO = 48;
  const ALTO = 38;
  const PASO_Y = 44;
  const X_NODOS = 100;
  const PASO_X = 108;
  const Y_NODOS = 46;
  const ALTO_NODO = 46;
  const BAJADA = 94; // de la fila a un nodo suelto

  // ------------------------------------------------------------------
  // Fragmentos de C++ (copiados de ejemplos/cpp/pila.cpp)
  // ------------------------------------------------------------------

  const CODIGO = {
    push: `
      pila.push(valor);`,
    top: `
      if (!pila.empty()) {
          std::cout << "top() = " << pila.top() << "\\n";
      }`,
    pop: `
      if (!pila.empty()) {
          pila.pop();
      }`,
    estanBalanceados: `
      bool estanBalanceados(const std::string& texto) {
          std::stack<char> abiertos;
          for (char c : texto) {
              if (c == '(' || c == '[' || c == '{') {
                  abiertos.push(c);
              } else if (c == ')' || c == ']' || c == '}') {
                  if (abiertos.empty()) {
                      return false;
                  }
                  char esperado = c == ')' ? '(' : (c == ']' ? '[' : '{');
                  if (abiertos.top() != esperado) {
                      return false;
                  }
                  abiertos.pop();
              }
          }
          return abiertos.empty();
      }`,
    apilar: `
      void apilar(int valor) {
          Nodo* nuevo = new Nodo(valor);
          nuevo->siguiente = tope;
          tope = nuevo;
          cantidad++;
      }`,
    desapilar: `
      int desapilar() {
          if (tope == nullptr) {
              throw std::underflow_error("pila vacia");
          }
          Nodo* temp = tope;
          int valor = temp->valor;
          tope = tope->siguiente;
          delete temp;
          cantidad--;
          return valor;
      }`,
    cima: `
      int cima() const {
          if (tope == nullptr) {
              throw std::underflow_error("pila vacia");
          }
          return tope->valor;
      }`,
  };

  const TITULOS = {
    push: "std::stack<int>::push",
    top: "std::stack<int>::top",
    pop: "std::stack<int>::pop",
    estanBalanceados: "estanBalanceados()",
    apilar: "PilaEnlazada::apilar()",
    desapilar: "PilaEnlazada::desapilar()",
    cima: "PilaEnlazada::cima()",
  };

  // ------------------------------------------------------------------
  // Estados. std::stack: ids de abajo hacia arriba. PilaEnlazada: nodos
  // por id con su siguiente, y tope. Paréntesis: el texto y la pila de
  // aperturas.
  // ------------------------------------------------------------------

  function estadoStl(valores) {
    const s = { modo: "stl", pila: [], vals: {}, sig: 1, vis: {} };
    for (const v of valores) {
      const id = `c${s.sig++}`;
      s.vals[id] = v;
      s.pila.push(id);
    }
    return s;
  }

  function estadoEnlazada(valores) {
    // valores de abajo hacia arriba, como se apilaron.
    const s = { modo: "enlazada", nodos: {}, tope: null, cantidad: 0, ptrs: {}, sig: 1, vis: {} };
    for (const v of valores) {
      const id = `n${s.sig++}`;
      s.nodos[id] = { v, sig: s.tope };
      s.tope = id;
      s.cantidad++;
    }
    return s;
  }

  function profundidad(texto) {
    let d = 0;
    let maximo = 0;
    for (const c of texto) {
      if ("([{".includes(c)) maximo = Math.max(maximo, ++d);
      else if (")]}".includes(c)) d = Math.max(0, d - 1);
    }
    return maximo;
  }

  function estadoParentesis(texto) {
    return { modo: "parentesis", texto, cap: Math.max(3, profundidad(texto)), pila: [], vals: {}, sig: 1, i: -1, hechos: 0, vis: {} };
  }

  // Desde los nodos alcanzables por tope, en orden.
  function cadena(s) {
    const orden = [];
    for (let id = s.tope; id != null && !orden.includes(id); id = s.nodos[id].sig) orden.push(id);
    return orden;
  }

  const comillas = (c) => `'${c}'`;
  const lleno = (s, n, clave, paso, linea) => {
    if (n < MAXIMO) return false;
    s.vis = { error: true };
    paso(clave, linea, `Para que la animación quepa en pantalla, la pila llega hasta ${MAXIMO} elementos. Saca alguno o pulsa Reiniciar.`, "error");
    return true;
  };

  // ------------------------------------------------------------------
  // Animaciones
  // ------------------------------------------------------------------

  const varsStl = (s) => ({ "size()": s.pila.length, "empty()": s.pila.length === 0 });

  const OPS = {
    push: {
      etiqueta: "push(valor)",
      usa: ["valor"],
      ejecutar(s, { valor }, paso) {
        if (lleno(s, s.pila.length, "push", paso, 1)) return;
        const id = `c${s.sig++}`;
        s.vals[id] = valor;
        s.pila.push(id);
        s.vis = { vars: varsStl(s), cambio: ["size()"], entrando: id };
        paso("push", 1, `push(${valor}): el ${valor} cae encima de todo y pasa a ser la cima. Lo que había abajo no se toca: O(1).`, "exito");
      },
    },

    top: {
      etiqueta: "top()",
      ejecutar(s, args, paso) {
        const vacia = s.pila.length === 0;
        s.vis = { vars: varsStl(s) };
        paso("top", 1, `¿!pila.empty()? ${vacia ? "No: la pila está vacía." : "Sí: hay algo arriba."}`);
        if (vacia) {
          s.vis = { vars: varsStl(s), error: true };
          paso("top", 1, "No se llama a top(). Sin esta pregunta, top() con la pila vacía sería comportamiento indefinido: std::stack no lanza ninguna excepción, simplemente lee basura (o el programa se cae).", "error");
          return;
        }
        const id = s.pila[s.pila.length - 1];
        s.vis = { vars: varsStl(s), leida: id, salida: s.vals[id] };
        paso("top", 2, `top() = ${s.vals[id]}: lee la cima sin sacarla. Es lo único que se puede ver; para llegar a los de abajo hay que sacar los de arriba.`, "exito");
      },
    },

    pop: {
      etiqueta: "pop()",
      ejecutar(s, args, paso) {
        const vacia = s.pila.length === 0;
        s.vis = { vars: varsStl(s) };
        paso("pop", 1, `¿!pila.empty()? ${vacia ? "No: la pila está vacía." : "Sí: hay algo que sacar."}`);
        if (vacia) {
          s.vis = { vars: varsStl(s), error: true };
          paso("pop", 1, "No se llama a pop(). Con la pila vacía, pop() sería comportamiento indefinido: no hay excepción que te avise.", "error");
          return;
        }
        const id = s.pila[s.pila.length - 1];
        s.vis = { vars: varsStl(s), condenada: id };
        paso("pop", 2, `pop() quita la cima (${s.vals[id]})...`);
        s.pila.pop();
        delete s.vals[id];
        s.vis = { vars: varsStl(s), cambio: ["size()", "empty()"] };
        paso("pop", 2, `...y no devuelve nada (es void). Si necesitabas el valor, había que leerlo antes con top(). ${s.pila.length ? `Ahora la cima es ${s.vals[s.pila[s.pila.length - 1]]}.` : "La pila quedó vacía."}`, "exito");
      },
    },

    estanBalanceados: {
      etiqueta: "estanBalanceados(texto)",
      ejecutar(s, args, paso) {
        // Cada ejecución empieza de cero, con abiertos vacía.
        Object.assign(s, { pila: [], vals: {}, i: -1, hechos: 0 });
        const texto = s.texto;
        const vars = (extra) => Object.assign({ texto: `"${texto}"` }, extra);
        s.vis = { vars: vars() };
        paso("estanBalanceados", 2, "abiertos empieza vacía. Va a guardar las aperturas que todavía no se cerraron.");
        for (let i = 0; i < texto.length; i++) {
          const c = texto[i];
          s.i = i;
          s.vis = { vars: vars({ c: comillas(c) }) };
          if ("([{".includes(c)) {
            paso("estanBalanceados", 4, `c = ${comillas(c)}: es una apertura.`);
            const id = `c${s.sig++}`;
            s.vals[id] = c;
            s.pila.push(id);
            s.vis = { vars: vars({ c: comillas(c) }), entrando: id, desde: i };
            paso("estanBalanceados", 5, `abiertos.push(${comillas(c)}): queda arriba de todo, porque es la que tiene que cerrarse primero.`);
          } else if (")]}".includes(c)) {
            paso("estanBalanceados", 6, `c = ${comillas(c)}: es un cierre. Tiene que corresponder a la última apertura sin cerrar, la cima.`);
            if (!s.pila.length) {
              s.vis = { vars: vars({ c: comillas(c) }), error: true, charMalo: i };
              paso("estanBalanceados", 7, "¿abiertos.empty()? Sí: no hay ninguna apertura esperando.");
              s.vis = { vars: vars({ c: comillas(c) }), error: true, charMalo: i, salida: "false" };
              paso("estanBalanceados", 8, `return false: ${comillas(c)} cierra algo que nunca se abrió.`, "error");
              s.i = -1;
              return;
            }
            paso("estanBalanceados", 7, "¿abiertos.empty()? No.");
            const esperado = c === ")" ? "(" : c === "]" ? "[" : "{";
            const arriba = s.pila[s.pila.length - 1];
            s.vis = { vars: vars({ c: comillas(c), esperado: comillas(esperado) }), cambio: ["esperado"] };
            paso("estanBalanceados", 10, `esperado = ${comillas(esperado)}: la apertura que corresponde a ${comillas(c)}.`);
            const coincide = s.vals[arriba] === esperado;
            s.vis = coincide
              ? { vars: vars({ c: comillas(c), esperado: comillas(esperado) }), leida: arriba, charLeido: i }
              : { vars: vars({ c: comillas(c), esperado: comillas(esperado) }), error: true, mala: arriba, charMalo: i };
            paso("estanBalanceados", 11, `¿abiertos.top() != esperado? La cima es ${comillas(s.vals[arriba])}: ${coincide ? "coinciden." : `no es ${comillas(esperado)}.`}`);
            if (!coincide) {
              s.vis = Object.assign({}, s.vis, { salida: "false" });
              paso("estanBalanceados", 12, `return false: ${comillas(c)} intenta cerrar, pero la última apertura es ${comillas(s.vals[arriba])}. Se cruzaron.`, "error");
              s.i = -1;
              return;
            }
            s.vis = { vars: vars({ c: comillas(c), esperado: comillas(esperado) }), condenada: arriba, charLeido: i };
            s.pila.pop();
            delete s.vals[arriba];
            paso("estanBalanceados", 14, `abiertos.pop(): ${comillas(esperado)} y ${comillas(c)} forman un par. La apertura sale de la pila.`);
          } else {
            paso("estanBalanceados", 6, `c = ${comillas(c)}: no es ni apertura ni cierre. Se ignora.`);
          }
          s.hechos = i + 1;
        }
        s.i = -1;
        const ok = s.pila.length === 0;
        s.vis = { vars: vars(), salida: String(ok), error: !ok, mala: ok ? null : s.pila[s.pila.length - 1] };
        paso("estanBalanceados", 17, ok
          ? "return abiertos.empty(): true. Todas las aperturas se cerraron, en el orden correcto."
          : `return abiertos.empty(): false. El texto se terminó y ${comillas(s.vals[s.pila[s.pila.length - 1]])} quedó sin cerrar.`, ok ? "exito" : "error");
      },
    },

    apilar: {
      etiqueta: "apilar(valor)",
      usa: ["valor"],
      ejecutar(s, { valor }, paso) {
        if (lleno(s, s.cantidad, "apilar", paso, 2)) return;
        const vars = () => ({ valor, cantidad: s.cantidad });
        const id = `n${s.sig++}`;
        s.nodos[id] = { v: valor, sig: null, ancla: true };
        s.ptrs = { nuevo: id };
        s.vis = { vars: vars(), activo: id };
        paso("apilar", 2, `new Nodo(${valor}): el nodo aparece suelto. Su siguiente es nullptr y nadie apunta a él todavía.`);
        s.nodos[id].sig = s.tope;
        s.vis = { vars: vars(), activo: id, flecha: id };
        paso("apilar", 3, s.tope == null
          ? "nuevo->siguiente = tope: la pila estaba vacía, así que sigue siendo nullptr."
          : `nuevo->siguiente = tope: el nuevo apunta a la cima actual (${s.nodos[s.tope].v}). Así no se pierde el resto de la pila.`);
        s.tope = id;
        delete s.nodos[id].ancla;
        s.vis = { vars: vars(), activo: id, flecha: "tope" };
        paso("apilar", 4, `tope = nuevo: ${valor} es la nueva cima. Los demás nodos no se movieron en memoria.`);
        s.cantidad++;
        s.vis = { vars: vars(), activo: id, cambio: ["cantidad"] };
        paso("apilar", 5, "cantidad++. Son los mismos pasos que insertarAlInicio de la lista enlazada: O(1), sin recorrer nada.", "exito");
        s.ptrs = {};
      },
    },

    desapilar: {
      etiqueta: "desapilar()",
      ejecutar(s, args, paso) {
        let valor;
        const vars = () => (valor == null ? { cantidad: s.cantidad } : { cantidad: s.cantidad, valor });
        s.vis = { vars: vars(), flecha: "tope", nuloTope: s.tope == null };
        paso("desapilar", 2, `¿tope == nullptr? ${s.tope == null ? "Sí: la pila está vacía." : "No."}`);
        if (s.tope == null) {
          s.vis = { vars: vars(), nuloTope: true, error: true };
          paso("desapilar", 3, "No hay nada que sacar: se lanza std::underflow_error. A diferencia de std::stack::pop, aquí el error se avisa.", "error");
          return;
        }
        const temp = s.tope;
        s.ptrs = { temp };
        s.vis = { vars: vars(), condenado: temp };
        paso("desapilar", 5, "temp = tope: guardamos la dirección de la cima para poder liberarla después.");
        valor = s.nodos[temp].v;
        s.vis = { vars: vars(), condenado: temp, cambio: ["valor"] };
        paso("desapilar", 6, `int valor = temp->valor: guardamos el ${valor} para devolverlo (después del delete ya no se puede leer).`);
        s.nodos[temp].reserva = true;
        s.tope = s.nodos[temp].sig;
        s.vis = { vars: vars(), condenado: temp, flecha: "tope", nuloTope: s.tope == null };
        paso("desapilar", 7, `tope = tope->siguiente: la cima ahora es ${s.tope == null ? "nullptr (la pila quedó vacía)" : s.nodos[s.tope].v}. El ${valor} quedó afuera, pero sigue ocupando memoria.`);
        delete s.nodos[temp];
        s.ptrs = {};
        s.vis = { vars: vars() };
        paso("desapilar", 8, "delete temp: liberamos la memoria del nodo.");
        s.cantidad--;
        s.vis = { vars: vars(), cambio: ["cantidad"] };
        paso("desapilar", 9, "cantidad--.");
        s.vis = { vars: vars(), salida: valor };
        paso("desapilar", 10, `return ${valor}. Es borrar la cabeza de una lista enlazada: O(1).`, "exito");
      },
    },

    cima: {
      etiqueta: "cima()",
      ejecutar(s, args, paso) {
        s.vis = { vars: { cantidad: s.cantidad }, flecha: "tope", nuloTope: s.tope == null };
        paso("cima", 2, `¿tope == nullptr? ${s.tope == null ? "Sí: la pila está vacía." : "No."}`);
        if (s.tope == null) {
          s.vis = { vars: { cantidad: s.cantidad }, nuloTope: true, error: true };
          paso("cima", 3, "Una pila vacía no tiene cima: se lanza std::underflow_error.", "error");
          return;
        }
        s.vis = { vars: { cantidad: s.cantidad }, encontrado: s.tope, flecha: "tope", salida: s.nodos[s.tope].v };
        paso("cima", 5, `return tope->valor: ${s.nodos[s.tope].v}. Un solo salto desde tope, sin sacar nada: O(1).`, "exito");
      },
    },
  };

  // ------------------------------------------------------------------
  // Dibujo
  // ------------------------------------------------------------------

  // El escenario se arma de nuevo si cambia el modo (en Todo junto).
  function lienzoDe(escenario, modo) {
    let lienzo = escenario.querySelector(".lienzo-pila");
    if (lienzo && lienzo.dataset.modo === modo) return lienzo;
    lienzo = el("div", { class: "lienzo-pila", "data-modo": modo });
    if (modo === "enlazada") {
      lienzo.classList.add("lienzo-enlazada");
      const n = ++lienzos;
      lienzo.dataset.n = n;
      const svg = document.createElementNS(SVG, "svg");
      svg.innerHTML =
        "<defs>" +
        `<marker id="punta-pila-${n}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z"/></marker>` +
        `<marker id="punta-pila-activa-${n}" class="activa" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z"/></marker>` +
        "</defs>";
      lienzo.append(svg, el("div", { class: "lcabeza" }, el("span", { class: "lcabeza-nombre", text: "tope" }), el("span", { class: "sig" })));
    }
    escenario.replaceChildren(el("div", { class: "info-pila" }), el("div", { class: "desliza-pila" }, el("div", { class: "marco-pila" }, lienzo)));
    return lienzo;
  }
  let lienzos = 0;

  // Reutiliza la pieza con ese id o la crea. Si es nueva y viene de otro
  // lugar (desde), aparece ahí y se desliza a su destino.
  function pieza(lienzo, id, crear, x, y, desde) {
    let p = lienzo.querySelector(`[data-id="${id}"]`);
    const nueva = !p;
    if (nueva) {
      p = crear();
      p.dataset.id = id;
      p.style.left = `${desde ? desde.x : x}px`;
      p.style.top = `${desde ? desde.y : y}px`;
      lienzo.append(p);
      if (desde) void p.offsetWidth;
    }
    p.style.left = `${x}px`;
    p.style.top = `${y}px`;
    return { p, nueva };
  }

  function retirar(p) {
    p.removeAttribute("data-id");
    p.classList.add("saliendo");
    setTimeout(() => p.remove(), 400);
  }

  function limpiar(lienzo, vivos) {
    for (const p of lienzo.querySelectorAll("[data-id]")) if (!vivos.has(p.dataset.id)) retirar(p);
  }

  function marca(lienzo, id, texto, x, y, clase) {
    const { p } = pieza(lienzo, id, () => el("span", { class: "vmarca" }), x, y);
    p.textContent = texto;
    p.className = `vmarca${clase ? ` ${clase}` : ""}`;
  }

  // El vaso de un std::stack: los valores se apilan de abajo hacia arriba.
  // Devuelve dónde quedó cada celda.
  function vaso(lienzo, { x, base, cap, ids, vals, vis, nombre, vivos, desde, etiquetaCima }) {
    const alto = cap * PASO_Y + 10;
    const { p: marco } = pieza(lienzo, "vaso", () => el("div", { class: "vaso" }, el("span", { class: "vaso-nombre" })), x, base - alto);
    marco.style.width = `${ANCHO + 20}px`;
    marco.style.height = `${alto}px`;
    marco.firstChild.textContent = nombre;
    vivos.add("vaso");
    const lugar = {};
    ids.forEach((id, k) => {
      const cx = x + 10;
      const cy = base - 6 - ALTO - k * PASO_Y;
      const origen = vis.entrando === id ? (desde || { x: cx, y: base - alto - ALTO - 14 }) : null;
      const { p } = pieza(lienzo, id, () => el("div", { class: "celda vcelda" }), cx, cy, origen);
      p.textContent = vals[id];
      let clase = "celda vcelda ocupada";
      if (vis.entrando === id) clase += " escrita";
      if (vis.leida === id) clase += " leida";
      if (vis.condenada === id) clase += " condenada";
      if (vis.mala === id) clase += " error";
      p.className = clase;
      vivos.add(id);
      lugar[id] = { x: cx, y: cy };
    });
    if (ids.length && etiquetaCima) {
      const arriba = lugar[ids[ids.length - 1]];
      marca(lienzo, "marca-cima", `← ${etiquetaCima}`, x + ANCHO + 28, arriba.y + 11, "acento");
      vivos.add("marca-cima");
    }
    return lugar;
  }

  function info(escenario, vis) {
    const malo = vis.salida === "false";
    escenario.querySelector(".info-pila").replaceChildren(
      DS.variables(vis.vars || {}, vis.cambio),
      vis.salida != null ? el("div", { class: "salida-valor" }, "devuelve", el("div", { class: `celda ${malo ? "error" : "encontrada"}`, text: vis.salida })) : "");
  }

  function dibujarStl(lienzo, s, vis) {
    const vivos = new Set();
    const cap = Math.max(4, s.pila.length);
    const base = 8 + ALTO + 16 + cap * PASO_Y + 10;
    // El nombre va centrado debajo del vaso: x deja lugar para que no se corte.
    vaso(lienzo, { x: 60, base, cap, ids: s.pila, vals: s.vals, vis, nombre: "std::stack<int> pila", vivos, etiquetaCima: "top()" });
    limpiar(lienzo, vivos);
    return { ancho: 60 + ANCHO + 20 + 90, alto: base + 30 };
  }

  // El texto arriba; debajo, el vaso de abiertos: cada apertura cae desde su letra.
  function dibujarParentesis(lienzo, s, vis) {
    const vivos = new Set();
    const x0 = 24;
    const yTexto = 26;
    const paso = 40;
    const base = yTexto + ALTO + 34 + s.cap * PASO_Y + 10;
    const posicion = (i) => ({ x: x0 + i * paso, y: yTexto });
    [...s.texto].forEach((c, i) => {
      const { x, y } = posicion(i);
      const { p } = pieza(lienzo, `t${i}`, () => el("div", { class: "celda vcelda vchar" }), x, y);
      p.textContent = c;
      let clase = "celda vcelda vchar";
      if (i === s.i) clase += vis.charMalo === i ? " error" : vis.charLeido === i ? " leida" : " escrita";
      else if (i < s.hechos) clase += " hecha";
      p.className = clase;
      vivos.add(`t${i}`);
    });
    if (s.i >= 0) {
      const { x, y } = posicion(s.i);
      marca(lienzo, "marca-c", "c ↓", x + 18, y - 20, "centrada");
      vivos.add("marca-c");
    }
    const desde = vis.desde != null ? posicion(vis.desde) : null;
    vaso(lienzo, { x: x0 + 40, base, cap: s.cap, ids: s.pila, vals: s.vals, vis, nombre: "abiertos", vivos, desde, etiquetaCima: "top()" });
    limpiar(lienzo, vivos);
    return { ancho: Math.max(x0 + s.texto.length * paso + 14, x0 + 40 + ANCHO + 20 + 90), alto: base + 30 };
  }

  // PilaEnlazada: la cima a la izquierda, como la cabeza de una lista.
  function dibujarEnlazada(lienzo, s, vis) {
    const vivos = new Set();
    const orden = cadena(s);
    const sueltos = Object.keys(s.nodos).filter((id) => !orden.includes(id));
    const pos = {};
    orden.forEach((id, k) => { pos[id] = { x: X_NODOS + k * PASO_X, y: Y_NODOS }; });
    for (const id of sueltos) {
      // El que se desapila guarda su lugar al frente; el nuevo aparece abajo, antes del primero.
      pos[id] = s.nodos[id].reserva ? { x: X_NODOS, y: Y_NODOS + BAJADA, abajo: true } : { x: X_NODOS - PASO_X / 2, y: Y_NODOS + BAJADA, abajo: true };
      if (s.nodos[id].reserva) for (const otro of orden) pos[otro].x += PASO_X;
    }

    const cabeza = lienzo.querySelector(".lcabeza");
    cabeza.style.left = "14px";
    cabeza.style.top = `${Y_NODOS}px`;
    const sigTope = cabeza.querySelector(".sig");
    sigTope.classList.toggle("nulo", s.tope == null);
    sigTope.classList.toggle("resaltado", !!vis.nuloTope);
    cabeza.classList.toggle("activa", vis.flecha === "tope");

    for (const [id, nodo] of Object.entries(s.nodos)) {
      const { p, nueva } = pieza(lienzo, id, () => el("div", { class: "nodo" }, el("span", { class: "valor" }), el("span", { class: "sig" }), el("span", { class: "ldireccion" })), pos[id].x, pos[id].y);
      p.querySelector(".valor").textContent = nodo.v;
      p.querySelector(".sig").classList.toggle("nulo", nodo.sig == null);
      let clase = "nodo";
      if (nueva || (p.classList.contains("nuevo") && vis.activo === id)) clase += " nuevo";
      if (pos[id].abajo) clase += " suelto";
      if (vis.activo === id) clase += " activo";
      if (vis.encontrado === id) clase += " encontrado";
      if (vis.condenado === id) clase += " condenado";
      p.className = clase;
      vivos.add(id);
    }
    for (const [nombre, id] of Object.entries(s.ptrs || {})) {
      if (!pos[id]) continue;
      const { x, y, abajo } = pos[id];
      marca(lienzo, `ptr-${nombre}`, abajo ? `↑ ${nombre}` : `${nombre} ↓`, x + 23, abajo ? y + ALTO_NODO + 4 : y - 18, "centrada");
      vivos.add(`ptr-${nombre}`);
    }
    limpiar(lienzo, vivos);

    actualizarFlechas(lienzo, s, vis);
    const hasta = performance.now() + 520;
    cancelAnimationFrame(lienzo._cuadro);
    const cuadro = () => {
      trazarFlechas(lienzo);
      if (performance.now() < hasta && lienzo.isConnected) lienzo._cuadro = requestAnimationFrame(cuadro);
    };
    cuadro();

    const derecha = Math.max(X_NODOS + PASO_X, ...Object.values(pos).map((p) => p.x + PASO_X));
    return { ancho: Math.max(300, derecha + 10), alto: Y_NODOS + ALTO_NODO + (sueltos.length ? BAJADA + 26 : 14) };
  }

  function actualizarFlechas(lienzo, s, vis) {
    const n = lienzo.dataset.n;
    const svg = lienzo.querySelector("svg");
    const deseadas = new Map();
    if (s.tope != null) deseadas.set("tope", s.tope);
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
      path.setAttribute("marker-end", `url(#punta-pila${activa ? "-activa" : ""}-${n})`);
    }
  }

  function trazarFlechas(lienzo) {
    for (const path of lienzo.querySelectorAll("svg path.flecha")) {
      const { de, a } = path.dataset;
      const origen = de === "tope" ? lienzo.querySelector(".lcabeza") : lienzo.querySelector(`.nodo[data-id="${de}"]`);
      const destino = lienzo.querySelector(`.nodo[data-id="${a}"]`);
      if (!origen || !destino) continue;
      const sig = origen.querySelector(".sig");
      const x1 = origen.offsetLeft + sig.offsetLeft + sig.offsetWidth / 2;
      const y1 = origen.offsetTop + origen.offsetHeight / 2;
      const tx = destino.offsetLeft;
      const ty = destino.offsetTop + destino.offsetHeight / 2;
      if (Math.abs(destino.offsetTop - origen.offsetTop) < 5) {
        path.setAttribute("d", x1 < tx ? `M ${x1} ${y1} L ${tx - 3} ${ty}` : `M ${x1} ${y1} C ${x1 + 40} ${y1 + 60}, ${tx - 40} ${ty + 60}, ${tx - 3} ${ty}`);
      } else {
        // De un nodo suelto (abajo) a la fila: sube y entra por arriba.
        const x2 = tx + 20;
        const arriba = destino.offsetTop < origen.offsetTop;
        const y2 = arriba ? destino.offsetTop + destino.offsetHeight + 3 : destino.offsetTop - 3;
        path.setAttribute("d", `M ${x1} ${y1} C ${x1 + 46} ${y1}, ${x2} ${arriba ? y2 + 46 : y2 - 46}, ${x2} ${y2}`);
      }
    }
  }

  // En pantallas angostas el dibujo se reduce; si aun así no cabe, hace scroll por dentro.
  function escalar(lienzo) {
    const desliza = lienzo.closest(".desliza-pila");
    if (!desliza || !desliza.clientWidth) return; // paso oculto: se mide al mostrarlo
    const ancho = Number(lienzo.dataset.ancho);
    const alto = Number(lienzo.dataset.alto);
    const k = Math.max(0.6, Math.min(1, desliza.clientWidth / ancho));
    lienzo.style.transform = k < 1 ? `scale(${k})` : "";
    lienzo.parentElement.style.width = `${ancho * k}px`;
    lienzo.parentElement.style.height = `${alto * k}px`;
  }

  if (typeof window !== "undefined") {
    window.addEventListener("resize", () => {
      for (const lienzo of document.querySelectorAll(".lienzo-pila")) {
        escalar(lienzo);
        if (lienzo.dataset.modo === "enlazada") trazarFlechas(lienzo);
      }
    });
  }

  function dibujar(escenario, s) {
    const lienzo = lienzoDe(escenario, s.modo);
    const vis = s.vis || {};
    info(escenario, vis);
    const { ancho, alto } = s.modo === "stl" ? dibujarStl(lienzo, s, vis)
      : s.modo === "parentesis" ? dibujarParentesis(lienzo, s, vis)
        : dibujarEnlazada(lienzo, s, vis);
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
  }

  // ------------------------------------------------------------------
  // Visualizadores de la lección
  // ------------------------------------------------------------------

  function visualizador(contenedor, opciones) {
    DS.tema(Object.assign({
      contenedor,
      incremental: true,
      dibujar,
      codigo: Object.fromEntries(opciones.claves.map((c) => [c, CODIGO[c]])),
      tituloCodigo: (clave) => TITULOS[clave],
    }, opciones.cfg));
  }

  const VALOR = { id: "valor", etiqueta: "Valor", min: 0, max: 99, aleatorio: true };
  const op = (id) => Object.assign({ id }, OPS[id]);

  // Paso 1: std::stack.
  visualizador("vis-stack", {
    claves: ["push", "top", "pop"],
    cfg: {
      entradas: [VALOR],
      estadoInicial: () => estadoStl([4, 8, 15]),
      operaciones: ["push", "top", "pop"].map(op),
      mensajeInicial: "Como en main(): se apilaron 4, 8 y 15. Prueba push, top y pop, y vacía la pila para ver qué pasa con top() y pop().",
    },
  });

  // Paso 2: paréntesis balanceados.
  visualizador("vis-parentesis", {
    claves: ["estanBalanceados"],
    cfg: {
      entradas: [{ id: "texto", etiqueta: "texto", opciones: [["{a[b(c)]}", "{a[b(c)]}"], ["([)]", "([)]"], ["(()", "(()"], ["())", "())"]] }],
      estadoInicial: ({ texto }) => estadoParentesis(texto),
      operaciones: [op("estanBalanceados")],
      mensajeInicial: ({ texto }) => `texto = "${texto}". Pulsa el botón y mira cómo cada cierre se compara con la cima. Prueba los cuatro textos.`,
    },
  });

  // Pasos 3 a 5: PilaEnlazada, una operación cada uno.
  visualizador("vis-apilar", {
    claves: ["apilar"],
    cfg: {
      entradas: [VALOR],
      estadoInicial: () => estadoEnlazada([4, 8]),
      operaciones: [op("apilar")],
      mensajeInicial: "La pila tiene 8 arriba y 4 abajo. Apila un valor y fíjate en el orden de los dos punteros.",
    },
  });

  visualizador("vis-desapilar", {
    claves: ["desapilar"],
    cfg: {
      estadoInicial: () => estadoEnlazada([4, 8, 15]),
      operaciones: [op("desapilar")],
      mensajeInicial: "Desapila tres veces: los valores salen al revés de como entraron. Después prueba con la pila vacía.",
    },
  });

  visualizador("vis-cima", {
    claves: ["cima"],
    cfg: {
      entradas: [{ id: "inicial", etiqueta: "Pila inicial", opciones: [["llena", "15, 8, 4"], ["vacia", "vacía"]] }],
      estadoInicial: ({ inicial }) => estadoEnlazada(inicial === "vacia" ? [] : [4, 8, 15]),
      operaciones: [op("cima")],
      mensajeInicial: ({ inicial }) => (inicial === "vacia" ? "La pila está vacía: tope es nullptr." : "Lee la cima: no se saca nada. Prueba también con la pila vacía."),
    },
  });

  // Todo junto: las dos versiones, con los mismos botones.
  const VERSION = { id: "version", etiqueta: "Versión", opciones: [["enlazada", "PilaEnlazada"], ["stl", "std::stack"]] };
  const segun = (stl, enlazada) => (s, args, paso) => (s.modo === "stl" ? OPS[stl] : OPS[enlazada]).ejecutar(s, args, paso);
  visualizador("vis-todo", {
    claves: ["apilar", "desapilar", "cima", "push", "top", "pop"],
    cfg: {
      entradas: [VALOR, VERSION],
      estadoInicial: ({ version }) => (version === "stl" ? estadoStl([4, 8, 15]) : estadoEnlazada([4, 8, 15])),
      codigoInicial: ({ version }) => (version === "stl" ? "push" : "apilar"),
      operaciones: [
        { id: "meter", etiqueta: ({ version }) => (version === "stl" ? "push(valor)" : "apilar(valor)"), usa: ["valor"], ejecutar: segun("push", "apilar") },
        { id: "sacar", etiqueta: ({ version }) => (version === "stl" ? "pop()" : "desapilar()"), ejecutar: segun("pop", "desapilar") },
        { id: "mirar", etiqueta: ({ version }) => (version === "stl" ? "top()" : "cima()"), ejecutar: segun("top", "cima") },
      ],
      mensajeInicial: ({ version }) => (version === "stl"
        ? "std::stack con 4, 8 y 15. Cambia la versión para comparar con PilaEnlazada."
        : "PilaEnlazada con 4, 8 y 15 (15 es la cima). Cambia la versión para comparar con std::stack."),
    },
  });
})();
