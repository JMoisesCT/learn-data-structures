// Animación de la cola circular. Los fragmentos de `codigo` deben coincidir
// línea por línea con ejemplos/cpp/cola.cpp (scripts/verificar-fragmentos.mjs).
(function () {
  const { el } = DS;
  const CAPACIDAD = 8;

  function ocupadas(s) {
    const set = new Set();
    for (let k = 0; k < s.cantidad; k++) set.add((s.inicio + k) % CAPACIDAD);
    return set;
  }

  DS.tema({
    codigo: {
      encolar: `
        void encolar(int valor) {
            if (cantidad == CAPACIDAD) {
                throw std::overflow_error("cola llena");
            }
            datos[fin] = valor;
            fin = (fin + 1) % CAPACIDAD;
            cantidad++;
        }`,
      desencolar: `
        int desencolar() {
            if (estaVacia()) {
                throw std::underflow_error("cola vacia");
            }
            int valor = datos[inicio];
            inicio = (inicio + 1) % CAPACIDAD;
            cantidad--;
            return valor;
        }`,
      frente: `
        int frente() const {
            if (estaVacia()) {
                throw std::underflow_error("cola vacia");
            }
            return datos[inicio];
        }`,
    },

    tituloCodigo: (clave) => `Cola::${clave}()`,

    mensajeInicial: "La cola ya avanzó un poco (inicio = 2). Encola varios valores para ver cómo fin da la vuelta al arreglo.",

    estadoInicial: () => ({
      datos: [null, null, 5, 9, 2, null, null, null],
      inicio: 2,
      fin: 5,
      cantidad: 3,
      vis: {},
    }),

    entradas: [{ id: "valor", etiqueta: "Valor", min: 0, max: 99, aleatorio: true }],

    operaciones: [
      {
        id: "encolar",
        etiqueta: "encolar(valor)",
        usa: ["valor"],
        ejecutar(s, { valor }, paso) {
          paso("encolar", 2, `¿Está llena? cantidad (${s.cantidad}) == CAPACIDAD (${CAPACIDAD})?`);
          if (s.cantidad === CAPACIDAD) {
            s.vis.error = true;
            paso("encolar", 3, "La cola está llena: se lanza std::overflow_error.", "error");
            return;
          }
          s.datos[s.fin] = valor;
          s.vis.escrita = s.fin;
          paso("encolar", 5, `Guardamos ${valor} en datos[${s.fin}], la posición que marca fin.`);
          const anterior = s.fin;
          s.fin = (s.fin + 1) % CAPACIDAD;
          s.vis.cambio = ["fin"];
          paso("encolar", 6, anterior === CAPACIDAD - 1
            ? `fin = (${anterior} + 1) % ${CAPACIDAD} = 0. ¡Da la vuelta al inicio del arreglo!`
            : `fin = (${anterior} + 1) % ${CAPACIDAD} = ${s.fin}.`);
          s.cantidad++;
          s.vis.cambio = ["cantidad"];
          paso("encolar", 7, `cantidad = ${s.cantidad}. ${valor} quedó al final de la fila.`, "exito");
        },
      },
      {
        id: "desencolar",
        etiqueta: "desencolar()",
        ejecutar(s, args, paso) {
          paso("desencolar", 2, `¿Está vacía? cantidad = ${s.cantidad}.`);
          if (s.cantidad === 0) {
            s.vis.error = true;
            paso("desencolar", 3, "La cola está vacía: se lanza std::underflow_error.", "error");
            return;
          }
          const valor = s.datos[s.inicio];
          s.vis.leida = s.inicio;
          paso("desencolar", 5, `Leemos el frente: datos[${s.inicio}] = ${valor}.`);
          const anterior = s.inicio;
          s.inicio = (s.inicio + 1) % CAPACIDAD;
          s.vis.leida = null;
          s.vis.cambio = ["inicio"];
          paso("desencolar", 6, `inicio = (${anterior} + 1) % ${CAPACIDAD} = ${s.inicio}. No movemos ningún elemento: solo avanza el índice.`);
          s.cantidad--;
          s.vis.cambio = ["cantidad"];
          paso("desencolar", 7, `cantidad = ${s.cantidad}.`);
          s.vis.cambio = [];
          s.vis.salida = valor;
          paso("desencolar", 8, `Devolvemos ${valor}: el primero en entrar fue el primero en salir.`, "exito");
        },
      },
      {
        id: "frente",
        etiqueta: "frente()",
        ejecutar(s, args, paso) {
          paso("frente", 2, `¿Está vacía? cantidad = ${s.cantidad}.`);
          if (s.cantidad === 0) {
            s.vis.error = true;
            paso("frente", 3, "La cola está vacía: no hay frente. Se lanza std::underflow_error.", "error");
            return;
          }
          s.vis.leida = s.inicio;
          s.vis.salida = s.datos[s.inicio];
          paso("frente", 5, `Devolvemos datos[${s.inicio}] = ${s.datos[s.inicio]} sin sacarlo de la cola.`, "exito");
        },
      },
    ],

    dibujar(escenario, s) {
      const enCola = ocupadas(s);

      const columnas = s.datos.map((v, i) => {
        const marcas = [];
        if (i === s.inicio && s.cantidad > 0) marcas.push("inicio");
        if (i === s.fin) marcas.push("fin");
        let clase = "celda";
        if (enCola.has(i)) clase += " ocupada";
        else clase += v == null ? " vacia" : " basura";
        if (s.vis.leida === i) clase += " leida";
        if (s.vis.escrita === i) clase += " escrita";
        if (s.vis.error) clase += enCola.has(i) ? " error" : "";
        return el("div", { class: "celda-col" },
          el("div", { class: "marcador", html: marcas.join("<br>") }),
          el("div", { class: clase, text: v == null ? "" : v }),
          el("span", { class: "indice", text: i }));
      });

      const orden = [];
      for (let k = 0; k < s.cantidad; k++) orden.push(s.datos[(s.inicio + k) % CAPACIDAD]);

      escenario.append(
        DS.variables({ inicio: s.inicio, fin: s.fin, cantidad: s.cantidad, CAPACIDAD }, s.vis.cambio),
        el("p", { class: "fila-titulo", text: "Arreglo en memoria (datos[])" }),
        el("div", { class: "celdas" }, columnas),
        el("p", { class: "fila-titulo", style: "margin-top:1.4rem", text: "Cómo la ve quien la usa (en orden de llegada)" }),
        el("div", { class: "celdas", style: "align-items:center" },
          el("span", { class: "indice", text: "frente →" }),
          orden.length
            ? orden.map((v) => el("div", { class: "celda ocupada", text: v }))
            : el("span", { class: "indice", text: "(vacía)" }),
          el("span", { class: "indice", text: "← final" })),
        s.vis.salida != null
          ? el("div", { class: "salida-valor" }, "devuelve", el("div", { class: "celda encontrada", text: s.vis.salida }))
          : "");
    },
  });
})();
