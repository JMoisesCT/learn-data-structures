// Animación del vector dinámico. Los fragmentos de `codigo` deben coincidir
// línea por línea con ejemplos/cpp/vector_dinamico.cpp
// (scripts/verificar-fragmentos.mjs lo revisa).
(function () {
  const { el } = DS;
  // Límite solo para que la animación quepa en pantalla.
  const MAXIMO = 16;

  // Llena los pasos de redimensionar(capacidad * 2).
  function redimensionar(s, paso) {
    const nueva = s.capacidad * 2;
    s.nuevos = Array(nueva).fill(null);
    s.vis = {};
    paso("redimensionar", 2, `Reservamos un arreglo nuevo de ${nueva} casillas con new int[${nueva}].`);
    for (let i = 0; i < s.tamano; i++) {
      s.nuevos[i] = s.datos[i];
      s.vis = { leidas: [i], escritaNuevo: i, marcas: { [i]: "i" }, marcasNuevo: { [i]: "i" } };
      paso("redimensionar", 4, `Copiamos datos[${i}] = ${s.datos[i]} a nuevos[${i}].`);
    }
    s.vis = { liberado: true };
    paso("redimensionar", 5, "Liberamos el arreglo viejo con delete[] datos.");
    s.datos = s.nuevos;
    s.nuevos = null;
    s.vis = {};
    paso("redimensionar", 6, "Ahora el puntero datos apunta al arreglo nuevo.");
    s.capacidad = nueva;
    s.vis = { cambio: ["capacidad"] };
    paso("redimensionar", 7, `capacidad = ${nueva}. Copiar costó O(n), pero no volverá a pasar hasta llenar ${nueva} casillas.`);
    s.vis = {};
  }

  function limiteAlcanzado(s, clave, linea, paso) {
    if (s.tamano === MAXIMO) {
      s.vis.error = true;
      paso(clave, linea, `Para que la animación quepa en pantalla, el vector llega hasta ${MAXIMO} elementos. Elimina alguno o pulsa Reiniciar.`, "error");
      return true;
    }
    return false;
  }

  function fila(titulo, datos, tamano, vis, sufijo) {
    const leidas = vis[`leidas${sufijo}`] || [];
    const marcas = vis[`marcas${sufijo}`] || {};
    return el("div", { style: "margin-bottom:1.2rem" },
      el("p", { class: "fila-titulo", text: titulo }),
      el("div", { class: "celdas" }, datos.map((v, i) => {
        let clase = "celda";
        if (v == null) clase += " vacia";
        else clase += i < tamano ? " ocupada" : " basura";
        if (leidas.includes(i)) clase += " leida";
        if (vis[`escrita${sufijo}`] === i) clase += " escrita";
        if (vis[`encontrada${sufijo}`] === i) clase += " encontrada";
        return el("div", { class: "celda-col" },
          el("div", { class: "marcador", text: marcas[i] || "" }),
          el("div", { class: clase, text: v == null ? "" : v }),
          el("span", { class: "indice", text: i }));
      })));
  }

  DS.tema({
    codigo: {
      agregarAlFinal: `
        void agregarAlFinal(int valor) {
            if (tamano == capacidad) {
                redimensionar(capacidad * 2);
            }
            datos[tamano] = valor;
            tamano++;
        }`,
      insertar: `
        void insertar(int pos, int valor) {
            if (pos < 0 || pos > tamano) {
                throw std::out_of_range("posicion invalida");
            }
            if (tamano == capacidad) {
                redimensionar(capacidad * 2);
            }
            for (int i = tamano; i > pos; i--) {
                datos[i] = datos[i - 1];
            }
            datos[pos] = valor;
            tamano++;
        }`,
      eliminarEn: `
        void eliminarEn(int pos) {
            if (pos < 0 || pos >= tamano) {
                throw std::out_of_range("posicion invalida");
            }
            for (int i = pos; i < tamano - 1; i++) {
                datos[i] = datos[i + 1];
            }
            tamano--;
        }`,
      buscar: `
        int buscar(int valor) const {
            for (int i = 0; i < tamano; i++) {
                if (datos[i] == valor) {
                    return i;
                }
            }
            return -1;
        }`,
      redimensionar: `
        void redimensionar(int nuevaCapacidad) {
            int* nuevos = new int[nuevaCapacidad];
            for (int i = 0; i < tamano; i++) {
                nuevos[i] = datos[i];
            }
            delete[] datos;
            datos = nuevos;
            capacidad = nuevaCapacidad;
        }`,
    },

    tituloCodigo: (clave) => `VectorDinamico::${clave}()`,

    mensajeInicial: "El vector tiene 3 elementos y capacidad 4. Agrega dos valores para ver cómo se redimensiona.",

    estadoInicial: () => ({
      datos: [10, 20, 30, null],
      tamano: 3,
      capacidad: 4,
      nuevos: null,
      vis: {},
    }),

    entradas: [
      { id: "valor", etiqueta: "Valor", min: 0, max: 99, aleatorio: true },
      { id: "pos", etiqueta: "Posición", min: -1, max: 20, valor: 1 },
    ],

    operaciones: [
      {
        id: "agregarAlFinal",
        etiqueta: "agregarAlFinal(valor)",
        usa: ["valor"],
        ejecutar(s, { valor }, paso) {
          paso("agregarAlFinal", 2, `¿Está lleno? tamano (${s.tamano}) == capacidad (${s.capacidad})?`);
          if (s.tamano === s.capacidad) {
            if (limiteAlcanzado(s, "agregarAlFinal", 2, paso)) return;
            paso("agregarAlFinal", 3, "Sí: no queda espacio. Hay que redimensionar al doble.");
            redimensionar(s, paso);
          }
          s.datos[s.tamano] = valor;
          s.vis = { escrita: s.tamano };
          paso("agregarAlFinal", 5, `Guardamos ${valor} en datos[${s.tamano}].`);
          s.tamano++;
          s.vis = { cambio: ["tamano"] };
          paso("agregarAlFinal", 6, `tamano = ${s.tamano}. ¡Listo!`, "exito");
        },
      },
      {
        id: "insertar",
        etiqueta: "insertar(pos, valor)",
        usa: ["pos", "valor"],
        ejecutar(s, { pos, valor }, paso) {
          paso("insertar", 2, `¿pos (${pos}) está entre 0 y tamano (${s.tamano})?`);
          if (pos < 0 || pos > s.tamano) {
            s.vis.error = true;
            paso("insertar", 3, `No: ${pos} es una posición inválida. Se lanza std::out_of_range.`, "error");
            return;
          }
          paso("insertar", 5, `¿Está lleno? tamano (${s.tamano}) == capacidad (${s.capacidad})?`);
          if (s.tamano === s.capacidad) {
            if (limiteAlcanzado(s, "insertar", 5, paso)) return;
            paso("insertar", 6, "Sí: redimensionamos al doble antes de desplazar.");
            redimensionar(s, paso);
          }
          for (let i = s.tamano; i > pos; i--) {
            s.datos[i] = s.datos[i - 1];
            s.vis = { leidas: [i - 1], escrita: i, marcas: { [i]: "i", [pos]: "pos" } };
            paso("insertar", 9, `Desplazamos a la derecha: datos[${i}] = datos[${i - 1}] (${s.datos[i]}).`);
          }
          s.vis = { marcas: { [pos]: "i = pos" } };
          paso("insertar", 8, `i == pos (${pos}): termina el ciclo. El hueco quedó libre.`);
          s.datos[pos] = valor;
          s.vis = { escrita: pos, marcas: { [pos]: "pos" } };
          paso("insertar", 11, `Guardamos ${valor} en datos[${pos}].`);
          s.tamano++;
          s.vis = { cambio: ["tamano"] };
          paso("insertar", 12, `tamano = ${s.tamano}. Desplazamos ${s.tamano - 1 - pos} elemento(s): por eso insertar es O(n).`, "exito");
        },
      },
      {
        id: "eliminarEn",
        etiqueta: "eliminarEn(pos)",
        usa: ["pos"],
        ejecutar(s, { pos }, paso) {
          paso("eliminarEn", 2, `¿pos (${pos}) está entre 0 y tamano - 1 (${s.tamano - 1})?`);
          if (pos < 0 || pos >= s.tamano) {
            s.vis.error = true;
            paso("eliminarEn", 3, `No: ${pos} es una posición inválida. Se lanza std::out_of_range.`, "error");
            return;
          }
          for (let i = pos; i < s.tamano - 1; i++) {
            s.datos[i] = s.datos[i + 1];
            s.vis = { leidas: [i + 1], escrita: i, marcas: { [i]: "i" } };
            paso("eliminarEn", 6, `Desplazamos a la izquierda: datos[${i}] = datos[${i + 1}] (${s.datos[i]}).`);
          }
          s.tamano--;
          s.vis = { cambio: ["tamano"] };
          paso("eliminarEn", 8, `tamano = ${s.tamano}. La última casilla queda como basura: ya no es parte del vector.`, "exito");
        },
      },
      {
        id: "buscar",
        etiqueta: "buscar(valor)",
        usa: ["valor"],
        ejecutar(s, { valor }, paso) {
          for (let i = 0; i < s.tamano; i++) {
            s.vis = { leidas: [i], marcas: { [i]: "i" } };
            paso("buscar", 3, `¿datos[${i}] (${s.datos[i]}) == ${valor}?`);
            if (s.datos[i] === valor) {
              s.vis = { encontrada: i, marcas: { [i]: "i" } };
              paso("buscar", 4, `¡Sí! Devolvemos ${i}. Revisamos ${i + 1} casilla(s).`, "exito");
              return;
            }
          }
          s.vis = {};
          paso("buscar", 7, `Revisamos las ${s.tamano} casillas y no está. Devolvemos -1.`, "error");
        },
      },
    ],

    dibujar(escenario, s) {
      const vis = s.vis || {};
      escenario.append(DS.variables({ tamano: s.tamano, capacidad: s.capacidad }, vis.cambio));
      const viejo = fila(vis.liberado ? "datos (liberado con delete[])" : "datos", s.datos, s.tamano, vis, "");
      if (vis.liberado) viejo.style.opacity = "0.35";
      escenario.append(viejo);
      if (s.nuevos) escenario.append(fila("nuevos", s.nuevos, s.tamano, vis, "Nuevo"));
    },
  });
})();
