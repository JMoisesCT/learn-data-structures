// Lección de la cola, en pasos: std::queue (con un uso real, el problema de
// Josefo) y ColaEnlazada (la misma idea con nodos y dos punteros). Los
// fragmentos de código deben coincidir línea por línea con
// ejemplos/cpp/cola.cpp, y en inglés con ejemplos/cpp/en/queue.cpp
// (scripts/verificar-fragmentos.mjs lo revisa). Los textos que se ven van en
// los dos idiomas con DS.tr.
(function () {
  const { el, tr } = DS;
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
  // Fragmentos de C++ (copiados de ejemplos/cpp/cola.cpp y de
  // ejemplos/cpp/en/queue.cpp, con las mismas líneas)
  // ------------------------------------------------------------------

  const CODIGO = tr({
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
  }, {
    push: `
      queue.push(value);`,
    front: `
      if (!queue.empty()) {
          std::cout << "front() = " << queue.front() << "\\n";
      }`,
    pop: `
      if (!queue.empty()) {
          queue.pop();
      }`,
    josefo: `
      int josephus(int n, int k) {
          std::queue<int> circle;
          for (int i = 1; i <= n; i++) {
              circle.push(i);
          }
          while (circle.size() > 1) {
              for (int i = 1; i < k; i++) {
                  circle.push(circle.front());
                  circle.pop();
              }
              circle.pop();
          }
          return circle.front();
      }`,
    encolar: `
      void enqueue(int value) {
          Node* newNode = new Node(value);
          if (tail == nullptr) {
              head = newNode;
          } else {
              tail->next = newNode;
          }
          tail = newNode;
          count++;
      }`,
    desencolar: `
      int dequeue() {
          if (head == nullptr) {
              throw std::underflow_error("empty queue");
          }
          Node* temp = head;
          int value = temp->value;
          head = head->next;
          if (head == nullptr) {
              tail = nullptr;
          }
          delete temp;
          count--;
          return value;
      }`,
    frente: `
      int front() const {
          if (head == nullptr) {
              throw std::underflow_error("empty queue");
          }
          return head->value;
      }`,
  });

  const CLASE = tr("ColaEnlazada", "LinkedQueue");
  const TITULOS = {
    push: "std::queue<int>::push",
    front: "std::queue<int>::front",
    pop: "std::queue<int>::pop",
    josefo: tr("josefo()", "josephus()"),
    encolar: `${CLASE}::${tr("encolar", "enqueue")}()`,
    desencolar: `${CLASE}::${tr("desencolar", "dequeue")}()`,
    frente: `${CLASE}::${tr("frente", "front")}()`,
  };

  // Nombres del C++ que se dibujan (variables, punteros y marcas). Los estados
  // usan los de español y se traducen al pintar, así son iguales en los dos idiomas.
  const NOMBRES = {
    primero: "head", ultimo: "tail", cantidad: "count", valor: "value", nuevo: "newNode",
    salieron: "out", cola: "queue", ronda: "circle",
  };
  const ident = (k) => tr(k, NOMBRES[k] || k);
  const traducirVars = (vars) => Object.fromEntries(Object.entries(vars).map(([k, v]) => [ident(k), v]));

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
    paso(clave, linea, tr(`Para que la animación quepa en pantalla, la cola llega hasta ${MAXIMO} elementos. Saca alguno o pulsa Reiniciar.`,
      `Up to ${MAXIMO} elements, so the animation fits on screen: take some out or press Reset.`), "error");
    return true;
  };

  // ------------------------------------------------------------------
  // Animaciones
  // ------------------------------------------------------------------

  const varsStl = (s) => ({ "size()": s.fila.length, "empty()": s.fila.length === 0 });

  const OPS = {
    push: {
      etiqueta: tr("push(valor)", "push(value)"),
      usa: ["valor"],
      ejecutar(s, { valor }, paso) {
        if (lleno(s, s.fila.length, "push", paso, 1)) return;
        const id = `c${s.sig++}`;
        s.vals[id] = valor;
        s.fila.push(id);
        s.vis = { vars: varsStl(s), cambio: ["size()"], entrando: id };
        paso("push", 1, tr(`push(${valor}): el ${valor} entra por el final y se pone detrás de todos; ahora es back(). Nadie se mueve: O(1).`,
          `push(${valor}): ${valor} enters at the back and gets behind everyone; now it's back(). Nobody moves: O(1).`), "exito");
      },
    },

    front: {
      etiqueta: "front()",
      ejecutar(s, args, paso) {
        const vacia = s.fila.length === 0;
        s.vis = { vars: varsStl(s) };
        paso("front", 1, vacia
          ? tr("¿!cola.empty()? No: la cola está vacía.", "!queue.empty()? No: the queue is empty.")
          : tr("¿!cola.empty()? Sí: hay alguien adelante.", "!queue.empty()? Yes: there's someone at the front."));
        if (vacia) {
          s.vis = { vars: varsStl(s), error: true };
          paso("front", 1, tr("No se llama a front(). Sin esta pregunta, front() con la cola vacía sería comportamiento indefinido: std::queue no lanza ninguna excepción.",
            "front() isn't called. Without this check, front() on an empty queue would be undefined behavior: std::queue doesn't throw any exception."), "error");
          return;
        }
        const id = s.fila[0];
        s.vis = { vars: varsStl(s), leida: id, salida: s.vals[id] };
        paso("front", 2, tr(`front() = ${s.vals[id]}: lee el primero sin sacarlo. Es el que lleva más tiempo esperando.`,
          `front() = ${s.vals[id]}: it reads the first one without taking it out. It's the one that has been waiting the longest.`), "exito");
      },
    },

    pop: {
      etiqueta: "pop()",
      ejecutar(s, args, paso) {
        const vacia = s.fila.length === 0;
        s.vis = { vars: varsStl(s) };
        paso("pop", 1, vacia
          ? tr("¿!cola.empty()? No: la cola está vacía.", "!queue.empty()? No: the queue is empty.")
          : tr("¿!cola.empty()? Sí: hay alguien que sacar.", "!queue.empty()? Yes: there's someone to take out."));
        if (vacia) {
          s.vis = { vars: varsStl(s), error: true };
          paso("pop", 1, tr("No se llama a pop(). Con la cola vacía, pop() sería comportamiento indefinido: no hay excepción que te avise.",
            "pop() isn't called. On an empty queue, pop() would be undefined behavior: there's no exception to warn you."), "error");
          return;
        }
        const id = s.fila[0];
        s.vis = { vars: varsStl(s), condenada: id };
        paso("pop", 2, tr(`pop() quita el primero (${s.vals[id]})...`, `pop() removes the first one (${s.vals[id]})...`));
        s.fila.shift();
        delete s.vals[id];
        s.vis = { vars: varsStl(s), cambio: ["size()", "empty()"] };
        paso("pop", 2, `${tr("...y no devuelve nada (es void): si necesitabas el valor, había que leerlo antes con front().",
          "...and returns nothing (it's void): if you needed the value, you had to read it first with front().")} ${s.fila.length
          ? tr(`Ahora el primero es ${s.vals[s.fila[0]]}.`, `Now the first one is ${s.vals[s.fila[0]]}.`)
          : tr("La cola quedó vacía.", "The queue is now empty.")}`, "exito");
      },
    },

    josefo: {
      etiqueta: tr("josefo(n, k)", "josephus(n, k)"),
      usa: ["n", "k"],
      ejecutar(s, { n, k }, paso) {
        // Cada ejecución empieza de cero. El tubo deja lugar para la copia
        // que entra al final antes de que salga el original del frente.
        Object.assign(s, { fila: [], vals: {}, salieron: [], cap: n + 1 });
        const vars = (extra) => Object.assign({ n, k }, extra, s.salieron.length ? { salieron: s.salieron.join(", ") } : {});
        s.vis = { vars: vars() };
        paso("josefo", 2, tr(`${n} personas en ronda; se cuenta de ${k} en ${k} y sale la que cae en ${k}. La ronda empieza vacía.`,
          `${n} people in a circle; you count ${k} at a time and the one you land on at ${k} leaves. The circle starts empty.`));
        for (let i = 1; i <= n; i++) {
          const id = `c${s.sig++}`;
          s.vals[id] = i;
          s.fila.push(id);
          s.vis = { vars: vars({ i }), entrando: id };
          paso("josefo", 4, tr(`ronda.push(${i}): la persona ${i} se pone al final.`, `circle.push(${i}): person ${i} gets in at the back.`));
        }
        while (s.fila.length > 1) {
          s.vis = { vars: vars({ "size()": s.fila.length }) };
          paso("josefo", 6, tr(`ronda.size() es ${s.fila.length}: todavía queda más de una persona.`, `circle.size() is ${s.fila.length}: there's still more than one person.`));
          for (let i = 1; i < k; i++) {
            const frente = s.fila[0];
            const copia = `c${s.sig++}`;
            s.vals[copia] = s.vals[frente];
            s.fila.push(copia);
            s.vis = { vars: vars({ i }), entrando: copia, desdeFrente: true, leida: frente };
            paso("josefo", 8, tr(`Cuenta ${i}: ronda.push(ronda.front()) copia a ${s.vals[frente]} al final de la ronda...`,
              `Count ${i}: circle.push(circle.front()) copies ${s.vals[frente]} to the back of the circle...`));
            s.fila.shift();
            delete s.vals[frente];
            s.vis = { vars: vars({ i }) };
            paso("josefo", 9, tr("...y ronda.pop() lo quita del frente. Pasó de adelante hacia atrás, como en una ronda.",
              "...and circle.pop() removes it from the front. It went from the front to the back, like in a circle."));
          }
          const sale = s.fila[0];
          s.vis = { vars: vars(), condenada: sale };
          paso("josefo", 11, tr(`Cuenta ${k}: le toca a ${s.vals[sale]}. ronda.pop() lo saca de la ronda.`,
            `Count ${k}: it's ${s.vals[sale]}'s turn. circle.pop() takes them out of the circle.`));
          s.salieron.push(s.vals[sale]);
          s.fila.shift();
          delete s.vals[sale];
          s.vis = { vars: vars(), cambio: ["salieron"] };
          const quedan = s.fila.length;
          paso("josefo", 11, tr(`${s.salieron[s.salieron.length - 1]} salió. ${quedan === 1 ? "Queda 1" : `Quedan ${quedan}`}.`,
            `${s.salieron[s.salieron.length - 1]} left. ${quedan} ${quedan === 1 ? "is" : "are"} left.`));
        }
        const ganador = s.fila[0];
        s.vis = { vars: vars(), leida: ganador, salida: s.vals[ganador] };
        paso("josefo", 13, tr(`return ronda.front(): queda ${s.vals[ganador]}. Cada vuelta movió k - 1 personas del frente al final: O(n·k), y cada push y pop fue O(1).`,
          `return circle.front(): ${s.vals[ganador]} is left. Each round moved k - 1 people from the front to the back: O(n·k), and each push and pop was O(1).`), "exito");
      },
    },

    encolar: {
      etiqueta: tr("encolar(valor)", "enqueue(value)"),
      usa: ["valor"],
      ejecutar(s, { valor }, paso) {
        if (lleno(s, s.cantidad, "encolar", paso, 2)) return;
        const vars = () => ({ valor, cantidad: s.cantidad });
        const id = `n${s.sig++}`;
        s.nodos[id] = { v: valor, sig: null, ancla: true };
        s.ptrs = { nuevo: id };
        s.vis = { vars: vars(), activo: id };
        paso("encolar", 2, tr(`new Nodo(${valor}): el nodo aparece suelto al final. Su siguiente es nullptr, justo lo que necesita el último.`,
          `new Node(${valor}): the node appears loose at the end. Its next is nullptr, just what the last one needs.`));
        s.vis = { vars: vars(), activo: id, flecha: "ultimo", nulo: s.ultimo == null ? "ultimo" : null };
        paso("encolar", 3, s.ultimo == null
          ? tr("¿ultimo == nullptr? Sí: la cola está vacía.", "tail == nullptr? Yes: the queue is empty.")
          : tr(`¿ultimo == nullptr? No: el último es ${s.nodos[s.ultimo].v}.`, `tail == nullptr? No: the last one is ${s.nodos[s.ultimo].v}.`));
        if (s.ultimo == null) {
          s.primero = id;
          s.vis = { vars: vars(), activo: id, flecha: "primero" };
          paso("encolar", 4, tr("primero = nuevo: en una cola vacía, el nodo nuevo también es el primero.", "head = newNode: in an empty queue, the new node is also the first one."));
        } else {
          const anterior = s.ultimo;
          s.nodos[anterior].sig = id;
          s.vis = { vars: vars(), activo: id, flecha: anterior };
          paso("encolar", 6, tr(`ultimo->siguiente = nuevo: ${s.nodos[anterior].v} ahora apunta al nuevo. No hubo que recorrer: ultimo ya sabía dónde estaba el final.`,
            `tail->next = newNode: ${s.nodos[anterior].v} now points to the new node. No walking needed: tail already knew where the end was.`));
        }
        delete s.nodos[id].ancla;
        s.ultimo = id;
        s.vis = { vars: vars(), activo: id, flecha: "ultimo" };
        paso("encolar", 8, tr(`ultimo = nuevo: ${valor} es el nuevo final de la cola.`, `tail = newNode: ${valor} is the new end of the queue.`));
        s.cantidad++;
        s.vis = { vars: vars(), activo: id, cambio: ["cantidad"] };
        paso("encolar", 9, tr("cantidad++. Siempre los mismos pasos, sin importar cuántos haya: O(1).", "count++. Always the same steps, no matter how many there are: O(1)."), "exito");
        s.ptrs = {};
      },
    },

    desencolar: {
      etiqueta: tr("desencolar()", "dequeue()"),
      ejecutar(s, args, paso) {
        let valor;
        const vars = () => (valor == null ? { cantidad: s.cantidad } : { cantidad: s.cantidad, valor });
        s.vis = { vars: vars(), flecha: "primero", nulo: s.primero == null ? "primero" : null };
        paso("desencolar", 2, s.primero == null
          ? tr("¿primero == nullptr? Sí: la cola está vacía.", "head == nullptr? Yes: the queue is empty.")
          : tr("¿primero == nullptr? No.", "head == nullptr? No."));
        if (s.primero == null) {
          s.vis = { vars: vars(), nulo: "primero", error: true };
          paso("desencolar", 3, tr("No hay nadie que sacar: se lanza std::underflow_error. A diferencia de std::queue::pop, aquí el error se avisa.",
            "There's nobody to take out: std::underflow_error is thrown. Unlike std::queue::pop, here the error is reported."), "error");
          return;
        }
        const temp = s.primero;
        s.ptrs = { temp };
        s.vis = { vars: vars(), condenado: temp };
        paso("desencolar", 5, tr("temp = primero: guardamos la dirección del primero para poder liberarlo después.", "temp = head: we save the first node's address so we can free it later."));
        valor = s.nodos[temp].v;
        s.vis = { vars: vars(), condenado: temp, cambio: ["valor"] };
        paso("desencolar", 6, tr(`int valor = temp->valor: guardamos el ${valor} para devolverlo.`, `int value = temp->value: we save ${valor} to return it.`));
        s.nodos[temp].reserva = true;
        s.primero = s.nodos[temp].sig;
        s.vis = { vars: vars(), condenado: temp, flecha: "primero", nulo: s.primero == null ? "primero" : null };
        paso("desencolar", 7, s.primero == null
          ? tr("primero = primero->siguiente: no había nadie más, así que primero queda en nullptr.", "head = head->next: there was nobody else, so head is left as nullptr.")
          : tr(`primero = primero->siguiente: ahora el primero es ${s.nodos[s.primero].v}.`, `head = head->next: now the first one is ${s.nodos[s.primero].v}.`));
        paso("desencolar", 8, s.primero == null
          ? tr("¿primero == nullptr? Sí: la cola quedó vacía.", "head == nullptr? Yes: the queue is now empty.")
          : tr("¿primero == nullptr? No.", "head == nullptr? No."));
        if (s.primero == null) {
          s.vis = { vars: vars(), condenado: temp, flecha: "ultimo", mala: true };
          paso("desencolar", 8, tr("Pero ultimo todavía apunta al nodo que vamos a liberar: después del delete sería un puntero colgante.",
            "But tail still points to the node we're about to free: after the delete it would be a dangling pointer."));
          s.ultimo = null;
          s.vis = { vars: vars(), condenado: temp, nulo: "ultimo" };
          paso("desencolar", 9, tr("ultimo = nullptr: la cola vacía tiene los dos punteros en nullptr.", "tail = nullptr: the empty queue has both pointers set to nullptr."));
        }
        delete s.nodos[temp];
        s.ptrs = {};
        s.vis = { vars: vars() };
        paso("desencolar", 11, tr("delete temp: liberamos la memoria del nodo. Los demás no se movieron.", "delete temp: we free the node's memory. The others didn't move."));
        s.cantidad--;
        s.vis = { vars: vars(), cambio: ["cantidad"] };
        paso("desencolar", 12, tr("cantidad--.", "count--."));
        s.vis = { vars: vars(), salida: valor };
        paso("desencolar", 13, tr(`return ${valor}. Es borrar la cabeza de una lista enlazada: O(1).`, `return ${valor}. It's deleting the head of a linked list: O(1).`), "exito");
      },
    },

    frente: {
      etiqueta: tr("frente()", "front()"),
      ejecutar(s, args, paso) {
        s.vis = { vars: { cantidad: s.cantidad }, flecha: "primero", nulo: s.primero == null ? "primero" : null };
        paso("frente", 2, s.primero == null
          ? tr("¿primero == nullptr? Sí: la cola está vacía.", "head == nullptr? Yes: the queue is empty.")
          : tr("¿primero == nullptr? No.", "head == nullptr? No."));
        if (s.primero == null) {
          s.vis = { vars: { cantidad: s.cantidad }, nulo: "primero", error: true };
          paso("frente", 3, tr("Una cola vacía no tiene frente: se lanza std::underflow_error.", "An empty queue has no front: std::underflow_error is thrown."), "error");
          return;
        }
        s.vis = { vars: { cantidad: s.cantidad }, encontrado: s.primero, flecha: "primero", salida: s.nodos[s.primero].v };
        paso("frente", 5, tr(`return primero->valor: ${s.nodos[s.primero].v}. Un solo salto desde primero, sin sacar nada: O(1).`,
          `return head->value: ${s.nodos[s.primero].v}. A single jump from head, without taking anything out: O(1).`), "exito");
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
      const variable = (nombre) => el("div", { class: "lcabeza", "data-ptr": nombre }, el("span", { class: "lcabeza-nombre", text: ident(nombre) }), el("span", { class: "sig" }));
      lienzo.append(svg, variable("primero"), variable("ultimo"));
    }
    escenario.replaceChildren(el("div", { class: "info-pila", "data-alto-estable": true }), el("div", { class: "desliza-pila" }, el("div", { class: "marco-pila" }, lienzo)));
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
      DS.variables(traducirVars(vis.vars || {}), (vis.cambio || []).map(ident)),
      vis.salida != null ? el("div", { class: "salida-valor" }, tr("devuelve", "returns"), el("div", { class: "celda encontrada", text: vis.salida })) : "");
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
      } else if (s.fila.length === 2) {
        // Casillas vecinas: centradas, las dos marcas se pisarían. Se abren
        // hacia afuera con la flecha sobre su casilla.
        marca(lienzo, "marca-front", "front() ↓", primero.x + 24, primero.y - 24, "flecha-al-final acento");
        marca(lienzo, "marca-back", "↓ back()", ultimo.x + 24, ultimo.y - 24, "flecha-al-inicio acento");
        vivos.add("marca-front");
        vivos.add("marca-back");
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
      marca(lienzo, `ptr-${nombre}`, abajo ? `↑ ${ident(nombre)}` : `${ident(nombre)} ↓`, x + 23, abajo ? y + ALTO_NODO + 4 : y - 18, "centrada");
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
        // La de ultimo sube enseguida: así pasa entre la fila y el nodo que
        // bajó al desencolar (temp), en vez de atravesarlo.
        const c1 = de === "ultimo" && arriba ? `${x1 + 60} ${y1 - 45}` : `${(x1 + x2) / 2} ${y1}`;
        path.setAttribute("d", `M ${x1} ${y1} C ${c1}, ${x2} ${arriba ? y2 + 40 : y2 - 40}, ${x2} ${y2}`);
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
    const { ancho, alto } = s.modo === "stl" ? tubo(lienzo, s, vis, `std::queue<int> ${ident("cola")}`)
      : s.modo === "josefo" ? tubo(lienzo, s, vis, `std::queue<int> ${ident("ronda")}`)
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

  const VALOR = { id: "valor", etiqueta: tr("Valor", "Value"), min: 0, max: 99, aleatorio: true };
  const op = (id) => Object.assign({ id }, OPS[id]);

  // Paso 1: std::queue.
  visualizador("vis-queue", {
    claves: ["push", "front", "pop"],
    cfg: {
      entradas: [VALOR],
      estadoInicial: () => estadoStl([5, 9, 2]),
      operaciones: ["push", "front", "pop"].map(op),
      mensajeInicial: tr("Como en main(): entraron 5, 9 y 2, en ese orden. Prueba push, front y pop, y vacía la cola para ver qué pasa con front() y pop().",
        "As in main(): 5, 9 and 2 went in, in that order. Try push, front and pop, and empty the queue to see what happens with front() and pop()."),
    },
  });

  // Paso 2: el problema de Josefo.
  visualizador("vis-josefo", {
    claves: ["josefo"],
    cfg: {
      entradas: [{ id: "n", etiqueta: "n", min: 2, max: MAXIMO, valor: 6 }, { id: "k", etiqueta: "k", min: 1, max: 4, valor: 3 }],
      estadoInicial: estadoJosefo,
      operaciones: [op("josefo")],
      mensajeInicial: tr("Con n = 6 y k = 3: ¿quién queda al final? Pulsa el botón y mira cómo cada persona pasa del frente al final.",
        "With n = 6 and k = 3: who is left at the end? Press the button and watch how each person goes from the front to the back."),
    },
  });

  // Pasos 3 a 5: ColaEnlazada, una operación cada uno.
  visualizador("vis-encolar", {
    claves: ["encolar"],
    cfg: {
      entradas: [VALOR, { id: "inicial", etiqueta: tr("Cola inicial", "Initial queue"), opciones: [["llena", "5, 9"], ["vacia", tr("vacía", "empty")]] }],
      estadoInicial: ({ inicial }) => estadoEnlazada(inicial === "vacia" ? [] : [5, 9]),
      operaciones: [op("encolar")],
      mensajeInicial: ({ inicial }) => (inicial === "vacia"
        ? tr("La cola está vacía: primero y ultimo son nullptr. Encola para ver el caso especial.",
          "The queue is empty: head and tail are nullptr. Enqueue to see the special case.")
        : tr("Encola un valor: fíjate en que no se recorre nada. Prueba también con la cola vacía.",
          "Enqueue a value: notice that nothing is walked. Also try it with the empty queue.")),
    },
  });

  visualizador("vis-desencolar", {
    claves: ["desencolar"],
    cfg: {
      estadoInicial: () => estadoEnlazada([5, 9, 2]),
      operaciones: [op("desencolar")],
      mensajeInicial: tr("Desencola tres veces: salen en el mismo orden en que entraron. Mira qué pasa con ultimo en la última, y después prueba con la cola vacía.",
        "Dequeue three times: they come out in the same order they went in. Watch what happens to tail on the last one, and then try with the empty queue."),
    },
  });

  visualizador("vis-frente", {
    claves: ["frente"],
    cfg: {
      entradas: [{ id: "inicial", etiqueta: tr("Cola inicial", "Initial queue"), opciones: [["llena", "5, 9, 2"], ["vacia", tr("vacía", "empty")]] }],
      estadoInicial: ({ inicial }) => estadoEnlazada(inicial === "vacia" ? [] : [5, 9, 2]),
      operaciones: [op("frente")],
      mensajeInicial: ({ inicial }) => (inicial === "vacia"
        ? tr("La cola está vacía: primero es nullptr.", "The queue is empty: head is nullptr.")
        : tr("Lee el frente: no se saca nada. Prueba también con la cola vacía.", "Read the front: nothing is taken out. Also try it with the empty queue.")),
    },
  });

  // Todo junto: las dos versiones, con los mismos botones.
  const VERSION = { id: "version", etiqueta: tr("Versión", "Version"), opciones: [["enlazada", CLASE], ["stl", "std::queue"]] };
  const segun = (stl, enlazada) => (s, args, paso) => (s.modo === "stl" ? OPS[stl] : OPS[enlazada]).ejecutar(s, args, paso);
  visualizador("vis-todo", {
    claves: ["encolar", "desencolar", "frente", "push", "front", "pop"],
    cfg: {
      entradas: [VALOR, VERSION],
      estadoInicial: ({ version }) => (version === "stl" ? estadoStl([5, 9, 2]) : estadoEnlazada([5, 9, 2])),
      codigoInicial: ({ version }) => (version === "stl" ? "push" : "encolar"),
      operaciones: [
        { id: "meter", etiqueta: ({ version }) => (version === "stl" ? OPS.push.etiqueta : OPS.encolar.etiqueta), usa: ["valor"], ejecutar: segun("push", "encolar") },
        { id: "sacar", etiqueta: ({ version }) => (version === "stl" ? OPS.pop.etiqueta : OPS.desencolar.etiqueta), ejecutar: segun("pop", "desencolar") },
        { id: "mirar", etiqueta: ({ version }) => (version === "stl" ? OPS.front.etiqueta : OPS.frente.etiqueta), ejecutar: segun("front", "frente") },
      ],
      mensajeInicial: ({ version }) => (version === "stl"
        ? tr("std::queue con 5, 9 y 2. Cambia la versión para comparar con ColaEnlazada.", "std::queue with 5, 9 and 2. Change the version to compare with LinkedQueue.")
        : tr("ColaEnlazada con 5, 9 y 2 (5 es el primero). Cambia la versión para comparar con std::queue.",
          "LinkedQueue with 5, 9 and 2 (5 is the first one). Change the version to compare with std::queue.")),
    },
  });
})();
