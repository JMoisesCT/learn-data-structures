// Lección de la cola, en pasos: std::queue (con un uso real, el problema de
// Josefo) y ColaEnlazada (la misma idea con nodos y dos punteros). Los
// fragmentos de código deben coincidir línea por línea con
// ejemplos/cpp/cola.cpp (scripts/verificar-fragmentos.mjs lo revisa).
(function () {
  const { el } = DS;
  const MAXIMO = 6; // límite solo para que la animación quepa en pantalla
  const SVG = "http://www.w3.org/2000/svg";

  // Medidas del tubo (std::queue) y de la fila de nodos (ColaEnlazada).
  const ALTO = 38;
  const PASO_C = 54;
  const X_TUBO = 30;
  const Y_TUBO = 40;
  const X_NODOS = 110;
  const PASO_X = 108;
  const Y_NODOS = 46;
  const ALTO_NODO = 46;
  const BAJADA = 94; // de la fila a un nodo suelto
  const Y_ULTIMO = Y_NODOS + 82; // la variable ultimo, debajo de primero

  // ------------------------------------------------------------------
  // Fragmentos de C++ (copiados de ejemplos/cpp/cola.cpp)
  // ------------------------------------------------------------------

  const CODIGO = {
    push: `
      cola.push(valor);`,
    front: `
      if (!cola.empty()) {
          std::cout << "front() = " << cola.front() << "\\n";
      }`,
    pop: `
      if (!cola.empty()) {
          cola.pop();
      }`,
    josefo: `
      int josefo(int n, int k) {
          std::queue<int> ronda;
          for (int i = 1; i <= n; i++) {
              ronda.push(i);
          }
          while (ronda.size() > 1) {
              for (int i = 1; i < k; i++) {
                  ronda.push(ronda.front());
                  ronda.pop();
              }
              ronda.pop();
          }
          return ronda.front();
      }`,
    encolar: `
      void encolar(int valor) {
          Nodo* nuevo = new Nodo(valor);
          if (ultimo == nullptr) {
              primero = nuevo;
          } else {
              ultimo->siguiente = nuevo;
          }
          ultimo = nuevo;
          cantidad++;
      }`,
    desencolar: `
      int desencolar() {
          if (primero == nullptr) {
              throw std::underflow_error("cola vacia");
          }
          Nodo* temp = primero;
          int valor = temp->valor;
          primero = primero->siguiente;
          if (primero == nullptr) {
              ultimo = nullptr;
          }
          delete temp;
          cantidad--;
          return valor;
      }`,
    frente: `
      int frente() const {
          if (primero == nullptr) {
              throw std::underflow_error("cola vacia");
          }
          return primero->valor;
      }`,
  };

  const TITULOS = {
    push: "std::queue<int>::push",
    front: "std::queue<int>::front",
    pop: "std::queue<int>::pop",
    josefo: "josefo()",
    encolar: "ColaEnlazada::encolar()",
    desencolar: "ColaEnlazada::desencolar()",
    frente: "ColaEnlazada::frente()",
  };

  // ------------------------------------------------------------------
  // Estados. std::queue: ids del primero al último. ColaEnlazada: nodos
  // por id con su siguiente, primero y ultimo. Josefo: la ronda.
  // ------------------------------------------------------------------

  function estadoStl(valores) {
    const s = { modo: "stl", fila: [], vals: {}, sig: 1, vis: {} };
    for (const v of valores) {
      const id = `c${s.sig++}`;
      s.vals[id] = v;
      s.fila.push(id);
    }
    return s;
  }

  function estadoEnlazada(valores) {
    const s = { modo: "enlazada", nodos: {}, primero: null, ultimo: null, cantidad: 0, ptrs: {}, sig: 1, vis: {} };
    for (const v of valores) {
      const id = `n${s.sig++}`;
      s.nodos[id] = { v, sig: null };
      if (s.ultimo) s.nodos[s.ultimo].sig = id;
      else s.primero = id;
      s.ultimo = id;
      s.cantidad++;
    }
    return s;
  }

  const estadoJosefo = () => ({ modo: "josefo", fila: [], vals: {}, salieron: [], sig: 1, vis: {} });

  function cadena(s) {
    const orden = [];
    for (let id = s.primero; id != null && !orden.includes(id); id = s.nodos[id].sig) orden.push(id);
    return orden;
  }

  const lleno = (s, n, clave, paso, linea) => {
    if (n < MAXIMO) return false;
    s.vis = { error: true };
    paso(clave, linea, `Para que la animación quepa en pantalla, la cola llega hasta ${MAXIMO} elementos. Saca alguno o pulsa Reiniciar.`, "error");
    return true;
  };

  // ------------------------------------------------------------------
  // Animaciones
  // ------------------------------------------------------------------

  const varsStl = (s) => ({ "size()": s.fila.length, "empty()": s.fila.length === 0 });

  const OPS = {
    push: {
      etiqueta: "push(valor)",
      usa: ["valor"],
      ejecutar(s, { valor }, paso) {
        if (lleno(s, s.fila.length, "push", paso, 1)) return;
        const id = `c${s.sig++}`;
        s.vals[id] = valor;
        s.fila.push(id);
        s.vis = { vars: varsStl(s), cambio: ["size()"], entrando: id };
        paso("push", 1, `push(${valor}): el ${valor} entra por el final y se pone detrás de todos; ahora es back(). Nadie se mueve: O(1).`, "exito");
      },
    },

    front: {
      etiqueta: "front()",
      ejecutar(s, args, paso) {
        const vacia = s.fila.length === 0;
        s.vis = { vars: varsStl(s) };
        paso("front", 1, `¿!cola.empty()? ${vacia ? "No: la cola está vacía." : "Sí: hay alguien adelante."}`);
        if (vacia) {
          s.vis = { vars: varsStl(s), error: true };
          paso("front", 1, "No se llama a front(). Sin esta pregunta, front() con la cola vacía sería comportamiento indefinido: std::queue no lanza ninguna excepción.", "error");
          return;
        }
        const id = s.fila[0];
        s.vis = { vars: varsStl(s), leida: id, salida: s.vals[id] };
        paso("front", 2, `front() = ${s.vals[id]}: lee el primero sin sacarlo. Es el que lleva más tiempo esperando.`, "exito");
      },
    },

    pop: {
      etiqueta: "pop()",
      ejecutar(s, args, paso) {
        const vacia = s.fila.length === 0;
        s.vis = { vars: varsStl(s) };
        paso("pop", 1, `¿!cola.empty()? ${vacia ? "No: la cola está vacía." : "Sí: hay alguien que sacar."}`);
        if (vacia) {
          s.vis = { vars: varsStl(s), error: true };
          paso("pop", 1, "No se llama a pop(). Con la cola vacía, pop() sería comportamiento indefinido: no hay excepción que te avise.", "error");
          return;
        }
        const id = s.fila[0];
        s.vis = { vars: varsStl(s), condenada: id };
        paso("pop", 2, `pop() quita el primero (${s.vals[id]})...`);
        s.fila.shift();
        delete s.vals[id];
        s.vis = { vars: varsStl(s), cambio: ["size()", "empty()"] };
        paso("pop", 2, `...y no devuelve nada (es void): si necesitabas el valor, había que leerlo antes con front(). ${s.fila.length ? `Ahora el primero es ${s.vals[s.fila[0]]}.` : "La cola quedó vacía."}`, "exito");
      },
    },

    josefo: {
      etiqueta: "josefo(n, k)",
      usa: ["n", "k"],
      ejecutar(s, { n, k }, paso) {
        // Cada ejecución empieza de cero. El tubo deja lugar para la copia
        // que entra al final antes de que salga el original del frente.
        Object.assign(s, { fila: [], vals: {}, salieron: [], cap: n + 1 });
        const vars = (extra) => Object.assign({ n, k }, extra, s.salieron.length ? { salieron: s.salieron.join(", ") } : {});
        s.vis = { vars: vars() };
        paso("josefo", 2, `${n} personas en ronda; se cuenta de ${k} en ${k} y sale la que cae en ${k}. La ronda empieza vacía.`);
        for (let i = 1; i <= n; i++) {
          const id = `c${s.sig++}`;
          s.vals[id] = i;
          s.fila.push(id);
          s.vis = { vars: vars({ i }), entrando: id };
          paso("josefo", 4, `ronda.push(${i}): la persona ${i} se pone al final.`);
        }
        while (s.fila.length > 1) {
          s.vis = { vars: vars({ "size()": s.fila.length }) };
          paso("josefo", 6, `ronda.size() es ${s.fila.length}: todavía queda más de una persona.`);
          for (let i = 1; i < k; i++) {
            const frente = s.fila[0];
            const copia = `c${s.sig++}`;
            s.vals[copia] = s.vals[frente];
            s.fila.push(copia);
            s.vis = { vars: vars({ i }), entrando: copia, desdeFrente: true, leida: frente };
            paso("josefo", 8, `Cuenta ${i}: ronda.push(ronda.front()) copia a ${s.vals[frente]} al final de la ronda...`);
            s.fila.shift();
            delete s.vals[frente];
            s.vis = { vars: vars({ i }) };
            paso("josefo", 9, `...y ronda.pop() lo quita del frente. Pasó de adelante hacia atrás, como en una ronda.`);
          }
          const sale = s.fila[0];
          s.vis = { vars: vars(), condenada: sale };
          paso("josefo", 11, `Cuenta ${k}: le toca a ${s.vals[sale]}. ronda.pop() lo saca de la ronda.`);
          s.salieron.push(s.vals[sale]);
          s.fila.shift();
          delete s.vals[sale];
          s.vis = { vars: vars(), cambio: ["salieron"] };
          paso("josefo", 11, `${s.salieron[s.salieron.length - 1]} salió. ${s.fila.length === 1 ? "Queda 1" : `Quedan ${s.fila.length}`}.`);
        }
        const ganador = s.fila[0];
        s.vis = { vars: vars(), leida: ganador, salida: s.vals[ganador] };
        paso("josefo", 13, `return ronda.front(): queda ${s.vals[ganador]}. Cada vuelta movió k - 1 personas del frente al final: O(n·k), y cada push y pop fue O(1).`, "exito");
      },
    },

    encolar: {
      etiqueta: "encolar(valor)",
      usa: ["valor"],
      ejecutar(s, { valor }, paso) {
        if (lleno(s, s.cantidad, "encolar", paso, 2)) return;
        const vars = () => ({ valor, cantidad: s.cantidad });
        const id = `n${s.sig++}`;
        s.nodos[id] = { v: valor, sig: null, ancla: true };
        s.ptrs = { nuevo: id };
        s.vis = { vars: vars(), activo: id };
        paso("encolar", 2, `new Nodo(${valor}): el nodo aparece suelto al final. Su siguiente es nullptr, justo lo que necesita el último.`);
        s.vis = { vars: vars(), activo: id, flecha: "ultimo", nulo: s.ultimo == null ? "ultimo" : null };
        paso("encolar", 3, `¿ultimo == nullptr? ${s.ultimo == null ? "Sí: la cola está vacía." : `No: el último es ${s.nodos[s.ultimo].v}.`}`);
        if (s.ultimo == null) {
          s.primero = id;
          s.vis = { vars: vars(), activo: id, flecha: "primero" };
          paso("encolar", 4, "primero = nuevo: en una cola vacía, el nodo nuevo también es el primero.");
        } else {
          const anterior = s.ultimo;
          s.nodos[anterior].sig = id;
          s.vis = { vars: vars(), activo: id, flecha: anterior };
          paso("encolar", 6, `ultimo->siguiente = nuevo: ${s.nodos[anterior].v} ahora apunta al nuevo. No hubo que recorrer: ultimo ya sabía dónde estaba el final.`);
        }
        delete s.nodos[id].ancla;
        s.ultimo = id;
        s.vis = { vars: vars(), activo: id, flecha: "ultimo" };
        paso("encolar", 8, `ultimo = nuevo: ${valor} es el nuevo final de la cola.`);
        s.cantidad++;
        s.vis = { vars: vars(), activo: id, cambio: ["cantidad"] };
        paso("encolar", 9, "cantidad++. Siempre los mismos pasos, sin importar cuántos haya: O(1).", "exito");
        s.ptrs = {};
      },
    },

    desencolar: {
      etiqueta: "desencolar()",
      ejecutar(s, args, paso) {
        let valor;
        const vars = () => (valor == null ? { cantidad: s.cantidad } : { cantidad: s.cantidad, valor });
        s.vis = { vars: vars(), flecha: "primero", nulo: s.primero == null ? "primero" : null };
        paso("desencolar", 2, `¿primero == nullptr? ${s.primero == null ? "Sí: la cola está vacía." : "No."}`);
        if (s.primero == null) {
          s.vis = { vars: vars(), nulo: "primero", error: true };
          paso("desencolar", 3, "No hay nadie que sacar: se lanza std::underflow_error. A diferencia de std::queue::pop, aquí el error se avisa.", "error");
          return;
        }
        const temp = s.primero;
        s.ptrs = { temp };
        s.vis = { vars: vars(), condenado: temp };
        paso("desencolar", 5, "temp = primero: guardamos la dirección del primero para poder liberarlo después.");
        valor = s.nodos[temp].v;
        s.vis = { vars: vars(), condenado: temp, cambio: ["valor"] };
        paso("desencolar", 6, `int valor = temp->valor: guardamos el ${valor} para devolverlo.`);
        s.nodos[temp].reserva = true;
        s.primero = s.nodos[temp].sig;
        s.vis = { vars: vars(), condenado: temp, flecha: "primero", nulo: s.primero == null ? "primero" : null };
        paso("desencolar", 7, `primero = primero->siguiente: ${s.primero == null ? "no había nadie más, así que primero queda en nullptr." : `ahora el primero es ${s.nodos[s.primero].v}.`}`);
        paso("desencolar", 8, `¿primero == nullptr? ${s.primero == null ? "Sí: la cola quedó vacía." : "No."}`);
        if (s.primero == null) {
          s.vis = { vars: vars(), condenado: temp, flecha: "ultimo", mala: true };
          paso("desencolar", 8, "Pero ultimo todavía apunta al nodo que vamos a liberar: después del delete sería un puntero colgante.");
          s.ultimo = null;
          s.vis = { vars: vars(), condenado: temp, nulo: "ultimo" };
          paso("desencolar", 9, "ultimo = nullptr: la cola vacía tiene los dos punteros en nullptr.");
        }
        delete s.nodos[temp];
        s.ptrs = {};
        s.vis = { vars: vars() };
        paso("desencolar", 11, "delete temp: liberamos la memoria del nodo. Los demás no se movieron.");
        s.cantidad--;
        s.vis = { vars: vars(), cambio: ["cantidad"] };
        paso("desencolar", 12, "cantidad--.");
        s.vis = { vars: vars(), salida: valor };
        paso("desencolar", 13, `return ${valor}. Es borrar la cabeza de una lista enlazada: O(1).`, "exito");
      },
    },

    frente: {
      etiqueta: "frente()",
      ejecutar(s, args, paso) {
        s.vis = { vars: { cantidad: s.cantidad }, flecha: "primero", nulo: s.primero == null ? "primero" : null };
        paso("frente", 2, `¿primero == nullptr? ${s.primero == null ? "Sí: la cola está vacía." : "No."}`);
        if (s.primero == null) {
          s.vis = { vars: { cantidad: s.cantidad }, nulo: "primero", error: true };
          paso("frente", 3, "Una cola vacía no tiene frente: se lanza std::underflow_error.", "error");
          return;
        }
        s.vis = { vars: { cantidad: s.cantidad }, encontrado: s.primero, flecha: "primero", salida: s.nodos[s.primero].v };
        paso("frente", 5, `return primero->valor: ${s.nodos[s.primero].v}. Un solo salto desde primero, sin sacar nada: O(1).`, "exito");
      },
    },
  };

  // ------------------------------------------------------------------
  // Dibujo
  // ------------------------------------------------------------------

  let lienzos = 0;

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
        `<marker id="punta-cola-${n}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z"/></marker>` +
        `<marker id="punta-cola-activa-${n}" class="activa" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z"/></marker>` +
        "</defs>";
      const variable = (nombre) => el("div", { class: "lcabeza", "data-ptr": nombre }, el("span", { class: "lcabeza-nombre", text: nombre }), el("span", { class: "sig" }));
      lienzo.append(svg, variable("primero"), variable("ultimo"));
    }
    escenario.replaceChildren(el("div", { class: "info-pila" }), el("div", { class: "desliza-pila" }, el("div", { class: "marco-pila" }, lienzo)));
    return lienzo;
  }

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

  function info(escenario, vis) {
    escenario.querySelector(".info-pila").replaceChildren(
      DS.variables(vis.vars || {}, vis.cambio),
      vis.salida != null ? el("div", { class: "salida-valor" }, "devuelve", el("div", { class: "celda encontrada", text: vis.salida })) : "");
  }

  // El tubo de un std::queue: se entra por la derecha (back) y se sale por
  // la izquierda (front).
  function tubo(lienzo, s, vis, nombre) {
    const vivos = new Set(["tubo"]);
    const cap = Math.max(4, s.fila.length, s.cap || 0);
    const ancho = cap * PASO_C + 10;
    const { p: marco } = pieza(lienzo, "tubo", () => el("div", { class: "vaso fila" }, el("span", { class: "vaso-nombre" })), X_TUBO, Y_TUBO);
    marco.style.width = `${ancho}px`;
    marco.style.height = `${ALTO + 14}px`;
    marco.firstChild.textContent = nombre;
    const lugar = (k) => ({ x: X_TUBO + 6 + k * PASO_C, y: Y_TUBO + 5 });
    s.fila.forEach((id, k) => {
      const { x, y } = lugar(k);
      let desde = null;
      if (vis.entrando === id) desde = vis.desdeFrente ? lugar(0) : { x: X_TUBO + ancho + 40, y };
      const { p } = pieza(lienzo, id, () => el("div", { class: "celda vcelda" }), x, y, desde);
      p.textContent = s.vals[id];
      let clase = "celda vcelda ocupada";
      if (vis.entrando === id) clase += " escrita";
      if (vis.leida === id) clase += " leida";
      if (vis.condenada === id) clase += " condenada";
      p.className = clase;
      vivos.add(id);
    });
    if (s.fila.length) {
      const primero = lugar(0);
      const ultimo = lugar(s.fila.length - 1);
      if (s.fila.length === 1) {
        marca(lienzo, "marca-front", "front() back() ↓", primero.x + 24, primero.y - 24, "centrada acento");
        vivos.add("marca-front");
      } else {
        marca(lienzo, "marca-front", "front() ↓", primero.x + 24, primero.y - 24, "centrada acento");
        marca(lienzo, "marca-back", "back() ↓", ultimo.x + 24, ultimo.y - 24, "centrada acento");
        vivos.add("marca-front");
        vivos.add("marca-back");
      }
    }
    limpiar(lienzo, vivos);
    return { ancho: X_TUBO + ancho + 60, alto: Y_TUBO + ALTO + 14 + 30 };
  }

  // ColaEnlazada: primero a la izquierda, como la cabeza de una lista; la
  // variable ultimo, debajo, apunta al último nodo.
  function dibujarEnlazada(lienzo, s, vis) {
    const vivos = new Set();
    const orden = cadena(s);
    const pos = {};
    let corrimiento = 0;
    for (const [id, nodo] of Object.entries(s.nodos)) {
      // El que se desencola baja y guarda su lugar al frente.
      if (nodo.reserva) {
        pos[id] = { x: X_NODOS, y: Y_NODOS + BAJADA, abajo: true };
        corrimiento = 1;
      }
    }
    orden.forEach((id, k) => { pos[id] = { x: X_NODOS + (k + corrimiento) * PASO_X, y: Y_NODOS }; });
    // El que se está encolando ya está al final de la fila, pero suelto.
    const enFila = orden.length + corrimiento;
    for (const [id, nodo] of Object.entries(s.nodos)) {
      if (!pos[id]) pos[id] = { x: X_NODOS + enFila * PASO_X, y: Y_NODOS, suelto: true };
    }

    for (const nombre of ["primero", "ultimo"]) {
      const caja = lienzo.querySelector(`.lcabeza[data-ptr="${nombre}"]`);
      caja.style.left = "14px";
      caja.style.top = `${nombre === "primero" ? Y_NODOS : Y_ULTIMO}px`;
      const sig = caja.querySelector(".sig");
      sig.classList.toggle("nulo", s[nombre] == null);
      sig.classList.toggle("resaltado", vis.nulo === nombre);
      caja.classList.toggle("activa", vis.flecha === nombre);
      caja.classList.toggle("mala", nombre === "ultimo" && !!vis.mala);
    }

    for (const [id, nodo] of Object.entries(s.nodos)) {
      const { p, nueva } = pieza(lienzo, id, () => el("div", { class: "nodo" }, el("span", { class: "valor" }), el("span", { class: "sig" }), el("span", { class: "ldireccion" })), pos[id].x, pos[id].y);
      p.querySelector(".valor").textContent = nodo.v;
      p.querySelector(".sig").classList.toggle("nulo", nodo.sig == null);
      let clase = "nodo";
      if (nueva || (p.classList.contains("nuevo") && vis.activo === id)) clase += " nuevo";
      if (pos[id].abajo || pos[id].suelto) clase += " suelto";
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
    const conSuelto = Object.values(pos).some((p) => p.abajo);
    return { ancho: Math.max(300, derecha + 10), alto: conSuelto ? Y_NODOS + BAJADA + ALTO_NODO + 26 : Y_ULTIMO + ALTO_NODO + 14 };
  }

  function actualizarFlechas(lienzo, s, vis) {
    const n = lienzo.dataset.n;
    const svg = lienzo.querySelector("svg");
    const deseadas = new Map();
    if (s.primero != null) deseadas.set("primero", s.primero);
    if (s.ultimo != null) deseadas.set("ultimo", s.ultimo);
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
      path.setAttribute("marker-end", `url(#punta-cola${activa ? "-activa" : ""}-${n})`);
    }
  }

  function trazarFlechas(lienzo) {
    for (const path of lienzo.querySelectorAll("svg path.flecha")) {
      const { de, a } = path.dataset;
      const origen = de === "primero" || de === "ultimo" ? lienzo.querySelector(`.lcabeza[data-ptr="${de}"]`) : lienzo.querySelector(`.nodo[data-id="${de}"]`);
      const destino = lienzo.querySelector(`.nodo[data-id="${a}"]`);
      if (!origen || !destino) continue;
      const sig = origen.querySelector(".sig");
      const x1 = origen.offsetLeft + sig.offsetLeft + sig.offsetWidth / 2;
      const y1 = origen.offsetTop + origen.offsetHeight / 2;
      const tx = destino.offsetLeft;
      const ty = destino.offsetTop + destino.offsetHeight / 2;
      if (Math.abs(destino.offsetTop - origen.offsetTop) < 5) {
        path.setAttribute("d", `M ${x1} ${y1} L ${tx - 3} ${ty}`);
      } else {
        // Desde ultimo (o desde un nodo que bajó): entra al nodo por abajo.
        const x2 = tx + 20;
        const arriba = destino.offsetTop < origen.offsetTop;
        const y2 = arriba ? destino.offsetTop + destino.offsetHeight + 3 : destino.offsetTop - 3;
        path.setAttribute("d", `M ${x1} ${y1} C ${(x1 + x2) / 2} ${y1}, ${x2} ${arriba ? y2 + 40 : y2 - 40}, ${x2} ${y2}`);
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
    const { ancho, alto } = s.modo === "stl" ? tubo(lienzo, s, vis, "std::queue<int> cola")
      : s.modo === "josefo" ? tubo(lienzo, s, vis, "std::queue<int> ronda")
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

  // Paso 1: std::queue.
  visualizador("vis-queue", {
    claves: ["push", "front", "pop"],
    cfg: {
      entradas: [VALOR],
      estadoInicial: () => estadoStl([5, 9, 2]),
      operaciones: ["push", "front", "pop"].map(op),
      mensajeInicial: "Como en main(): entraron 5, 9 y 2, en ese orden. Prueba push, front y pop, y vacía la cola para ver qué pasa con front() y pop().",
    },
  });

  // Paso 2: el problema de Josefo.
  visualizador("vis-josefo", {
    claves: ["josefo"],
    cfg: {
      entradas: [{ id: "n", etiqueta: "n", min: 2, max: MAXIMO, valor: 6 }, { id: "k", etiqueta: "k", min: 1, max: 4, valor: 3 }],
      estadoInicial: estadoJosefo,
      operaciones: [op("josefo")],
      mensajeInicial: "Con n = 6 y k = 3: ¿quién queda al final? Pulsa el botón y mira cómo cada persona pasa del frente al final.",
    },
  });

  // Pasos 3 a 5: ColaEnlazada, una operación cada uno.
  visualizador("vis-encolar", {
    claves: ["encolar"],
    cfg: {
      entradas: [VALOR, { id: "inicial", etiqueta: "Cola inicial", opciones: [["llena", "5, 9"], ["vacia", "vacía"]] }],
      estadoInicial: ({ inicial }) => estadoEnlazada(inicial === "vacia" ? [] : [5, 9]),
      operaciones: [op("encolar")],
      mensajeInicial: ({ inicial }) => (inicial === "vacia"
        ? "La cola está vacía: primero y ultimo son nullptr. Encola para ver el caso especial."
        : "Encola un valor: fíjate en que no se recorre nada. Prueba también con la cola vacía."),
    },
  });

  visualizador("vis-desencolar", {
    claves: ["desencolar"],
    cfg: {
      estadoInicial: () => estadoEnlazada([5, 9, 2]),
      operaciones: [op("desencolar")],
      mensajeInicial: "Desencola tres veces: salen en el mismo orden en que entraron. Mira qué pasa con ultimo en la última, y después prueba con la cola vacía.",
    },
  });

  visualizador("vis-frente", {
    claves: ["frente"],
    cfg: {
      entradas: [{ id: "inicial", etiqueta: "Cola inicial", opciones: [["llena", "5, 9, 2"], ["vacia", "vacía"]] }],
      estadoInicial: ({ inicial }) => estadoEnlazada(inicial === "vacia" ? [] : [5, 9, 2]),
      operaciones: [op("frente")],
      mensajeInicial: ({ inicial }) => (inicial === "vacia" ? "La cola está vacía: primero es nullptr." : "Lee el frente: no se saca nada. Prueba también con la cola vacía."),
    },
  });

  // Todo junto: las dos versiones, con los mismos botones.
  const VERSION = { id: "version", etiqueta: "Versión", opciones: [["enlazada", "ColaEnlazada"], ["stl", "std::queue"]] };
  const segun = (stl, enlazada) => (s, args, paso) => (s.modo === "stl" ? OPS[stl] : OPS[enlazada]).ejecutar(s, args, paso);
  visualizador("vis-todo", {
    claves: ["encolar", "desencolar", "frente", "push", "front", "pop"],
    cfg: {
      entradas: [VALOR, VERSION],
      estadoInicial: ({ version }) => (version === "stl" ? estadoStl([5, 9, 2]) : estadoEnlazada([5, 9, 2])),
      codigoInicial: ({ version }) => (version === "stl" ? "push" : "encolar"),
      operaciones: [
        { id: "meter", etiqueta: ({ version }) => (version === "stl" ? "push(valor)" : "encolar(valor)"), usa: ["valor"], ejecutar: segun("push", "encolar") },
        { id: "sacar", etiqueta: ({ version }) => (version === "stl" ? "pop()" : "desencolar()"), ejecutar: segun("pop", "desencolar") },
        { id: "mirar", etiqueta: ({ version }) => (version === "stl" ? "front()" : "frente()"), ejecutar: segun("front", "frente") },
      ],
      mensajeInicial: ({ version }) => (version === "stl"
        ? "std::queue con 5, 9 y 2. Cambia la versión para comparar con ColaEnlazada."
        : "ColaEnlazada con 5, 9 y 2 (5 es el primero). Cambia la versión para comparar con std::queue."),
    },
  });
})();
