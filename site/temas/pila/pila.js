// Animación de la pila. Los fragmentos de `codigo` deben coincidir línea por
// línea con ejemplos/cpp/pila.cpp (scripts/verificar-fragmentos.mjs lo revisa).
(function () {
  const { el } = DS;
  const CAPACIDAD = 8;

  DS.tema({
    codigo: {
      apilar: `
        void apilar(int valor) {
            if (tope == CAPACIDAD - 1) {
                throw std::overflow_error("pila llena");
            }
            tope++;
            datos[tope] = valor;
        }`,
      desapilar: `
        int desapilar() {
            if (estaVacia()) {
                throw std::underflow_error("pila vacia");
            }
            int valor = datos[tope];
            tope--;
            return valor;
        }`,
      cima: `
        int cima() const {
            if (estaVacia()) {
                throw std::underflow_error("pila vacia");
            }
            return datos[tope];
        }`,
    },

    tituloCodigo: (clave) => `Pila::${clave}()`,

    mensajeInicial: "La pila tiene 3 elementos. Prueba apilar(), desapilar() o cima().",

    estadoInicial: () => ({
      datos: [4, 8, 15, null, null, null, null, null],
      tope: 2,
      vis: {},
    }),

    entradas: [{ id: "valor", etiqueta: "Valor", min: 0, max: 99, aleatorio: true }],

    operaciones: [
      {
        id: "apilar",
        etiqueta: "apilar(valor)",
        usa: ["valor"],
        ejecutar(s, { valor }, paso) {
          paso("apilar", 2, `¿Está llena? Comparamos tope (${s.tope}) con CAPACIDAD - 1 (${CAPACIDAD - 1}).`);
          if (s.tope === CAPACIDAD - 1) {
            s.vis.error = true;
            paso("apilar", 3, "La pila está llena: se lanza std::overflow_error y no se apila nada.", "error");
            return;
          }
          s.tope++;
          s.vis.cambio = ["tope"];
          paso("apilar", 5, `Hay espacio. Subimos tope a ${s.tope}.`);
          s.datos[s.tope] = valor;
          s.vis.cambio = [];
          s.vis.escrita = s.tope;
          paso("apilar", 6, `Guardamos ${valor} en datos[${s.tope}]. Ahora ${valor} es la cima.`, "exito");
        },
      },
      {
        id: "desapilar",
        etiqueta: "desapilar()",
        ejecutar(s, args, paso) {
          paso("desapilar", 2, `¿Está vacía? tope = ${s.tope}${s.tope === -1 ? ", sí" : ", no"}.`);
          if (s.tope === -1) {
            s.vis.error = true;
            paso("desapilar", 3, "No hay nada que sacar: se lanza std::underflow_error.", "error");
            return;
          }
          const valor = s.datos[s.tope];
          s.vis.leida = s.tope;
          paso("desapilar", 5, `Leemos la cima: datos[${s.tope}] = ${valor}.`);
          s.tope--;
          s.vis.leida = null;
          s.vis.cambio = ["tope"];
          paso("desapilar", 6, `Bajamos tope a ${s.tope}. El ${valor} sigue en memoria, pero ya no es parte de la pila.`);
          s.vis.salida = valor;
          s.vis.cambio = [];
          paso("desapilar", 7, `Devolvemos ${valor}. El último en entrar fue el primero en salir.`, "exito");
        },
      },
      {
        id: "cima",
        etiqueta: "cima()",
        ejecutar(s, args, paso) {
          paso("cima", 2, `¿Está vacía? tope = ${s.tope}${s.tope === -1 ? ", sí" : ", no"}.`);
          if (s.tope === -1) {
            s.vis.error = true;
            paso("cima", 3, "La pila está vacía: no hay cima. Se lanza std::underflow_error.", "error");
            return;
          }
          s.vis.leida = s.tope;
          s.vis.salida = s.datos[s.tope];
          paso("cima", 5, `Devolvemos datos[${s.tope}] = ${s.datos[s.tope]} sin quitarlo de la pila.`, "exito");
        },
      },
    ],

    dibujar(escenario, s) {
      const filas = s.datos.map((v, i) => {
        let clase = "celda";
        if (i <= s.tope) clase += " ocupada";
        else clase += v == null ? " vacia" : " basura";
        if (s.vis.leida === i) clase += " leida";
        if (s.vis.escrita === i) clase += " escrita";
        return el("div", { class: "pila-fila" },
          el("span", { class: "indice", text: i }),
          el("div", { class: clase, text: v == null ? "" : v }),
          el("span", { class: "marcador", text: i === s.tope ? "← tope" : "" }));
      });

      const columna = el("div", { class: "pila-columna" }, filas);
      if (s.vis.error) columna.classList.add("error");

      const lado = el("div", {},
        DS.variables({ tope: s.tope === -1 ? "-1 (vacía)" : s.tope, CAPACIDAD }, s.vis.cambio),
        el("p", { class: "fila-titulo", text: "Las celdas punteadas están fuera de la pila." }),
        s.vis.salida != null
          ? el("div", { class: "salida-valor" }, "devuelve", el("div", { class: "celda encontrada", text: s.vis.salida }))
          : null);

      escenario.append(el("div", { class: "pila-vista" }, columna, lado));
    },
  });
})();
