// Lección del vector dinámico, en pasos. Los fragmentos de código deben
// coincidir línea por línea con ejemplos/cpp/vector_dinamico.cpp
// (scripts/verificar-fragmentos.mjs lo revisa).
(function () {
  const { el } = DS;
  const MAXIMO = 16; // límite solo para que la animación quepa en pantalla
  const CELDA = 44;
  const PASO = 52;
  const MARGEN = 14;
  const Y_CELDAS = 46; // dentro de cada fila: título y marcas arriba, índices abajo
  const SVG = "http://www.w3.org/2000/svg";

  // ------------------------------------------------------------------
  // Fragmentos de C++ (copiados de ejemplos/cpp/vector_dinamico.cpp)
  // ------------------------------------------------------------------

  const CODIGO = {
    obtener: `
      int obtener(int i) const {
          if (i < 0 || i >= tamano) {
              throw std::out_of_range("indice invalido");
          }
          return datos[i];
      }`,
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
  };

  const fragmentos = (...claves) => Object.fromEntries(claves.map((c) => [c, CODIGO[c]]));

  // ------------------------------------------------------------------
  // Estado: cada arreglo reservado es una fila de casillas; cada valor es
  // una ficha con id, para que se deslice cuando el C++ la copia.
  // ------------------------------------------------------------------

  const hex = (n) => `0x${n.toString(16)}`;

  function nuevaFicha(s, v, extra) {
    return Object.assign({ id: `f${s.sig++}`, v }, extra);
  }

  function estadoDesde(valores, capacidad, opciones) {
    const s = {
      sig: 1, tamano: valores.length, capacidad, nuevos: null, liberado: false,
      siguienteBase: 0x2000, direcciones: !!(opciones && opciones.direcciones), vis: {},
    };
    s.datos = { id: "a0", base: 0x1000, celdas: Array(capacidad).fill(null) };
    valores.forEach((v, i) => { s.datos.celdas[i] = nuevaFicha(s, v); });
    return s;
  }

  // destino[j] = origen[i]: la ficha viaja a su destino y en el origen
  // queda una copia (en C++ el valor sigue ahí hasta que se sobrescribe).
  function copiar(s, origen, i, destino, j) {
    const f = origen.celdas[i];
    destino.celdas[j] = { id: f.id, v: f.v };
    origen.celdas[i] = nuevaFicha(s, f.v, { copia: true });
  }

  // Junta varias etiquetas en la misma posición: { 2: "i, pos" }.
  function marcas(pares) {
    const r = {};
    for (const [indice, texto] of pares) {
      if (indice == null) continue;
      r[indice] = r[indice] ? `${r[indice]}, ${texto}` : texto;
    }
    return r;
  }

  const hasta = (n) => Array.from({ length: Math.max(0, n) }, (_, k) => k);

  // ------------------------------------------------------------------
  // Animaciones de cada función
  // ------------------------------------------------------------------

  function redimensionar(s, paso, vars) {
    const nueva = s.capacidad * 2;
    const extra = Object.assign({}, vars, { nuevaCapacidad: nueva });
    s.nuevos = { id: `a${s.sig++}`, base: s.siguienteBase, celdas: Array(nueva).fill(null) };
    s.siguienteBase += 0x1000;
    s.vis = { vars: extra };
    paso("redimensionar", 2, `new int[${nueva}]: reservamos un bloque nuevo, del doble de tamaño, en otra parte de la memoria (${hex(s.nuevos.base)}). El viejo no se puede estirar.`);
    for (let i = 0; i < s.tamano; i++) {
      copiar(s, s.datos, i, s.nuevos, i);
      s.vis = { vars: Object.assign({}, extra, { i }), escritaNuevo: i, marcas: { [i]: "i" }, marcasNuevo: { [i]: "i" } };
      paso("redimensionar", 4, `nuevos[${i}] = datos[${i}]: copiamos ${s.nuevos.celdas[i].v}.`
        + (i === s.tamano - 1 ? ` Fueron ${s.tamano} copias: esta es la parte cara, O(n).` : ""));
    }
    s.liberado = true;
    s.vis = { vars: extra };
    paso("redimensionar", 6, "delete[] datos: devolvemos el bloque viejo al sistema. Desde ahora no se puede leer ni escribir ahí.");
    s.datos = s.nuevos;
    s.nuevos = null;
    s.liberado = false;
    s.vis = { vars: extra };
    paso("redimensionar", 7, `datos = nuevos: el puntero datos ahora apunta al bloque grande (${hex(s.datos.base)}).`);
    s.capacidad = nueva;
    s.vis = { vars: extra, cambio: ["capacidad"] };
    paso("redimensionar", 8, `capacidad = ${nueva}. No habrá que volver a copiar hasta llenar las ${nueva} casillas.`);
  }

  function limiteAlcanzado(s, clave, linea, paso) {
    if (s.tamano < MAXIMO) return false;
    s.vis = { error: true, caret: true };
    paso(clave, linea, `Para que la animación quepa en pantalla, el vector llega hasta ${MAXIMO} elementos. Elimina alguno o pulsa Reiniciar.`, "error");
    return true;
  }

  // Mensaje y resaltado para una posición fuera del vector.
  function posicionInvalida(s, pos, maximo, nombre) {
    s.vis = { vars: { [nombre || "pos"]: pos }, error: true };
    if (pos >= s.tamano && pos < s.capacidad) {
      s.vis.malas = [pos];
      s.vis.marcas = { [pos]: nombre || "pos" };
      return `No: la casilla ${pos} existe en memoria, pero no es parte del vector (tamano = ${s.tamano}). Se lanza std::out_of_range.`;
    }
    if (maximo < 0) return "No: el vector está vacío, no hay ninguna posición válida. Se lanza std::out_of_range.";
    return `No: ${pos} está fuera del rango 0..${maximo}. Se lanza std::out_of_range y el vector no cambia.`;
  }

  const OPS = {
    obtener: {
      etiqueta: "obtener(i)",
      usa: ["pos"],
      fragmentos: ["obtener"],
      ejecutar(s, { pos: i }, paso) {
        s.vis = { vars: { i }, marcas: i >= 0 && i < s.capacidad ? { [i]: "i" } : {} };
        paso("obtener", 2, `¿i (${i}) está entre 0 y tamano − 1 (${s.tamano - 1})?`);
        if (i < 0 || i >= s.tamano) {
          paso("obtener", 3, posicionInvalida(s, i, s.tamano - 1, "i"), "error");
          return;
        }
        const direccion = s.datos.base + 4 * i;
        const vars = { i, "&datos[i]": `${hex(s.datos.base)} + ${i}·4 = ${hex(direccion)}` };
        s.vis = { vars, salto: i, leidas: [i] };
        paso("obtener", 5, `Sí. La dirección sale con una cuenta: inicio + i × 4 bytes (lo que ocupa un int) = ${hex(direccion)}. Saltamos directo, sin pasar por las casillas anteriores.`);
        s.vis = { vars, encontrada: i, salida: s.datos.celdas[i].v, marcas: { [i]: "i" } };
        paso("obtener", 5, `return datos[${i}] = ${s.datos.celdas[i].v}. Da igual si i es 0 o un millón: siempre es una cuenta y un salto, O(1).`, "exito");
      },
    },
    agregarAlFinal: {
      etiqueta: "agregarAlFinal(valor)",
      usa: ["valor"],
      fragmentos: ["agregarAlFinal", "redimensionar"],
      ejecutar(s, { valor }, paso) {
        const lleno = s.tamano === s.capacidad;
        s.vis = { vars: { valor }, caret: true };
        paso("agregarAlFinal", 2, `¿Está lleno? tamano (${s.tamano}) == capacidad (${s.capacidad})? `
          + (lleno ? "Sí." : `No: la casilla ${s.tamano} está libre.`));
        if (lleno) {
          if (limiteAlcanzado(s, "agregarAlFinal", 2, paso)) return;
          s.vis = { vars: { valor }, caret: true };
          paso("agregarAlFinal", 3, "No queda espacio, y un bloque de memoria no se puede estirar: hay que redimensionar al doble.");
          redimensionar(s, paso, { valor });
        }
        const nueva = nuevaFicha(s, valor);
        s.datos.celdas[s.tamano] = nueva;
        s.vis = { vars: { valor }, escrita: s.tamano, cae: nueva.id, marcas: { [s.tamano]: "tamano" } };
        paso("agregarAlFinal", 5, `datos[${s.tamano}] = ${valor}: escribimos directo en la primera casilla libre. Nada se mueve.`);
        s.tamano++;
        s.vis = { vars: { valor }, cambio: ["tamano"] };
        const libres = s.capacidad - s.tamano;
        paso("agregarAlFinal", 6, `tamano++ → ${s.tamano}. `
          + (libres ? `Quedan ${libres} casilla(s) libres: los próximos agregarAlFinal son O(1).` : "Quedó lleno: el próximo agregarAlFinal tendrá que redimensionar."), "exito");
      },
    },
    insertar: {
      etiqueta: "insertar(pos, valor)",
      usa: ["pos", "valor"],
      fragmentos: ["insertar", "redimensionar"],
      ejecutar(s, { pos, valor }, paso) {
        const vars = { pos, valor };
        s.vis = { vars, marcas: pos >= 0 && pos <= s.tamano ? { [pos]: "pos" } : {} };
        paso("insertar", 2, `¿pos (${pos}) está entre 0 y tamano (${s.tamano})? Vale pos == tamano: sería agregar al final.`);
        if (pos < 0 || pos > s.tamano) {
          const texto = posicionInvalida(s, pos, s.tamano);
          s.vis.vars = vars;
          paso("insertar", 3, texto, "error");
          return;
        }
        const lleno = s.tamano === s.capacidad;
        s.vis = { vars, caret: true, marcas: { [pos]: "pos" } };
        paso("insertar", 5, `¿Está lleno? tamano (${s.tamano}) == capacidad (${s.capacidad})? ${lleno ? "Sí." : "No: hay lugar para correr los elementos."}`);
        if (lleno) {
          if (limiteAlcanzado(s, "insertar", 5, paso)) return;
          s.vis = { vars, caret: true };
          paso("insertar", 6, "Sí: primero redimensionamos al doble; después hacemos el hueco.");
          redimensionar(s, paso, vars);
        }
        const corridos = s.tamano - pos;
        for (let i = s.tamano; i > pos; i--) {
          copiar(s, s.datos, i - 1, s.datos, i);
          s.vis = { vars: { pos, valor, i }, ocupadas: s.tamano + 1, escrita: i, marcas: marcas([[i, "i"], [pos, "pos"]]) };
          paso("insertar", 9, `datos[${i}] = datos[${i - 1}]: ${s.datos.celdas[i].v} se corre una casilla a la derecha.`
            + (i === s.tamano ? " Empezamos por el final para no pisar nada." : ""));
        }
        s.vis = { vars: { pos, valor, i: pos }, ocupadas: s.tamano + 1, hueco: pos, marcas: { [pos]: "i = pos" } };
        paso("insertar", 8, corridos
          ? `i == pos: termina el ciclo. La casilla ${pos} quedó libre (lo que ves ahí es una copia vieja que vamos a pisar).`
          : `pos == tamano: no hay nada a la derecha que correr.`);
        const nueva = nuevaFicha(s, valor);
        s.datos.celdas[pos] = nueva;
        s.vis = { vars, ocupadas: s.tamano + 1, escrita: pos, cae: nueva.id, marcas: { [pos]: "pos" } };
        paso("insertar", 11, `datos[${pos}] = ${valor}.`);
        s.tamano++;
        s.vis = { vars, cambio: ["tamano"] };
        paso("insertar", 12, `tamano++ → ${s.tamano}. Corrimos ${corridos} elemento(s): cuanto más a la izquierda insertas, más trabajo. Por eso es O(n).`, "exito");
      },
    },
    eliminarEn: {
      etiqueta: "eliminarEn(pos)",
      usa: ["pos"],
      fragmentos: ["eliminarEn"],
      ejecutar(s, { pos }, paso) {
        s.vis = { vars: { pos }, marcas: pos >= 0 && pos < s.tamano ? { [pos]: "pos" } : {} };
        paso("eliminarEn", 2, `¿pos (${pos}) está entre 0 y tamano − 1 (${s.tamano - 1})?`);
        if (pos < 0 || pos >= s.tamano) {
          paso("eliminarEn", 3, posicionInvalida(s, pos, s.tamano - 1), "error");
          return;
        }
        const quitado = s.datos.celdas[pos].v;
        const aCorrer = s.tamano - 1 - pos;
        s.vis = { vars: { pos }, condenada: pos, marcas: { [pos]: "pos" } };
        paso("eliminarEn", 5, aCorrer
          ? `Para borrar ${quitado} no hay un "hueco" posible: lo tapamos corriendo a la izquierda los ${aCorrer} elemento(s) de su derecha.`
          : `${quitado} es el último: no hay nada a su derecha que correr.`);
        for (let i = pos; i < s.tamano - 1; i++) {
          copiar(s, s.datos, i + 1, s.datos, i);
          s.vis = { vars: { pos, i }, escrita: i, marcas: marcas([[i, "i"], [pos, "pos"]]) };
          paso("eliminarEn", 6, i === pos
            ? `datos[${i}] = datos[${i + 1}]: ${s.datos.celdas[i].v} pisa a ${quitado}, que se pierde.`
            : `datos[${i}] = datos[${i + 1}]: ${s.datos.celdas[i].v} se corre a la izquierda.`);
        }
        s.tamano--;
        s.vis = { vars: { pos }, cambio: ["tamano"] };
        paso("eliminarEn", 8, `tamano-- → ${s.tamano}. La casilla ${s.tamano} queda como basura: sigue en memoria y la capacidad no cambia, pero ya no es parte del vector.`, "exito");
      },
    },
    buscar: {
      etiqueta: "buscar(valor)",
      usa: ["valor"],
      fragmentos: ["buscar"],
      ejecutar(s, { valor }, paso) {
        for (let i = 0; i < s.tamano; i++) {
          const v = s.datos.celdas[i].v;
          s.vis = { vars: { valor, i }, leidas: [i], revisadas: hasta(i), marcas: { [i]: "i" } };
          paso("buscar", 3, `¿datos[${i}] (${v}) == ${valor}? ${v === valor ? "¡Sí!" : "No, seguimos con la siguiente."}`);
          if (v === valor) {
            s.vis = { vars: { valor, i }, encontrada: i, revisadas: hasta(i), salida: i, marcas: { [i]: "i" } };
            paso("buscar", 4, `return ${i}. Revisamos ${i + 1} casilla(s).`, "exito");
            return;
          }
        }
        s.vis = { vars: { valor }, revisadas: hasta(s.tamano), salida: -1 };
        paso("buscar", 7, s.tamano
          ? `Revisamos las ${s.tamano} casillas y no está: return -1. En el peor caso hay que mirar todas: O(n).`
          : "El vector está vacío: el for no da ni una vuelta. return -1.", "error");
      },
    },
  };

  // ------------------------------------------------------------------
  // Dibujo: una fila por arreglo reservado (datos y, al redimensionar,
  // nuevos). Las fichas viven en el lienzo para poder volar entre filas.
  // ------------------------------------------------------------------

  const altoFila = (s) => (s.direcciones ? 156 : 140);

  function crearLienzo(escenario) {
    const svg = document.createElementNS(SVG, "svg");
    const lienzo = el("div", { class: "lienzo-vector" }, svg);
    escenario.append(el("div", { class: "info-vector" }), el("div", { class: "marco-vector" }, lienzo));
    return lienzo;
  }

  if (typeof window !== "undefined") {
    window.addEventListener("resize", () => {
      for (const lienzo of document.querySelectorAll(".lienzo-vector")) escalar(lienzo.closest(".escenario"), lienzo);
    });
  }

  // En pantallas angostas reducimos el dibujo; si aun así no cabe, el escenario hace scroll.
  function escalar(escenario, lienzo) {
    if (!escenario.clientWidth) return; // está en un paso oculto: se mide al mostrarlo
    const ancho = Number(lienzo.dataset.ancho);
    const alto = Number(lienzo.dataset.alto);
    const k = Math.max(0.6, Math.min(1, (escenario.clientWidth - 32) / ancho));
    lienzo.style.transform = k < 1 ? `scale(${k})` : "";
    const marco = lienzo.parentElement;
    marco.style.width = `${ancho * k}px`;
    marco.style.height = `${alto * k}px`;
  }

  // Lo que sale del dibujo se desvanece en lugar de desaparecer de golpe.
  function retirar(nodo) {
    nodo.removeAttribute("data-id");
    nodo.classList.add("saliendo");
    setTimeout(() => nodo.remove(), 400);
  }

  function dibujarSalto(svg, j) {
    const x0 = MARGEN + 4;
    const x1 = MARGEN + j * PASO + CELDA / 2;
    const y = Y_CELDAS - 4;
    const defs = document.createElementNS(SVG, "defs");
    const punta = document.createElementNS(SVG, "marker");
    for (const [k, v] of Object.entries({ id: "punta-salto", viewBox: "0 0 10 10", refX: 8, refY: 5, markerWidth: 7, markerHeight: 7, orient: "auto-start-reverse" })) punta.setAttribute(k, v);
    const forma = document.createElementNS(SVG, "path");
    forma.setAttribute("d", "M0 0 L10 5 L0 10 z");
    punta.append(forma);
    defs.append(punta);
    const arco = document.createElementNS(SVG, "path");
    arco.setAttribute("d", `M ${x0} ${y} Q ${(x0 + x1) / 2} ${y - 46} ${x1} ${y}`);
    arco.setAttribute("class", "salto");
    arco.setAttribute("pathLength", "1");
    arco.setAttribute("marker-end", "url(#punta-salto)");
    svg.append(defs, arco);
  }

  function dibujar(escenario, s) {
    const lienzo = escenario.querySelector(".lienzo-vector") || crearLienzo(escenario);
    const vis = s.vis || {};
    const alto = altoFila(s);
    const filas = [{ arr: s.datos, y: 0, principal: true }];
    if (s.nuevos) filas.push({ arr: s.nuevos, y: alto, principal: false });
    const casillas = Math.max(...filas.map((f) => f.arr.celdas.length));
    const ancho = Math.max(300, 2 * MARGEN + (casillas + 1) * PASO);
    const altoTotal = filas.length * alto;
    lienzo.style.width = `${ancho}px`;
    lienzo.style.height = `${altoTotal}px`;
    lienzo.dataset.ancho = ancho;
    lienzo.dataset.alto = altoTotal;
    escalar(escenario, lienzo);

    // Variables y valor devuelto, arriba del dibujo.
    escenario.querySelector(".info-vector").replaceChildren(
      DS.variables(Object.assign({ tamano: s.tamano, capacidad: s.capacidad }, vis.vars), vis.cambio),
      vis.salida != null ? el("div", { class: "salida-valor" }, "devuelve", el("div", { class: "celda encontrada", text: vis.salida })) : "");

    // Filas: casillas, índices, direcciones, marcas y el indicador de tamano.
    // Al insertar, la casilla tamano ya se usa antes de que tamano++ lo diga.
    const ocupadas = vis.ocupadas == null ? s.tamano : vis.ocupadas;
    const filasVivas = new Set();
    for (const f of filas) {
      filasVivas.add(f.arr.id);
      let fila = lienzo.querySelector(`.vfila[data-id="${f.arr.id}"]`);
      if (!fila) {
        fila = el("div", { class: `vfila${f.principal ? "" : " aparece"}`, "data-id": f.arr.id, style: `top:${f.y}px` }, el("div", { class: "vfila-capa" }));
        lienzo.prepend(fila);
      }
      fila.style.top = `${f.y}px`;
      fila.classList.toggle("liberada", f.principal && s.liberado);
      fila.classList.remove("sacudir");
      if (f.principal && vis.error) {
        void fila.offsetWidth; // reinicia la animación
        fila.classList.add("sacudir");
      }

      const n = f.arr.celdas.length;
      const titulo = f.principal
        ? `datos → ${hex(f.arr.base)}${s.liberado ? "   (liberado con delete[])" : ""}`
        : `nuevos → ${hex(f.arr.base)}`;
      const piezas = [el("span", { class: "fila-titulo", style: "left:0;top:0", text: titulo })];
      for (let j = 0; j < n; j++) {
        const x = j * PASO;
        let clase = "vmarco";
        if (j >= ocupadas || !f.arr.celdas[j]) clase += " libre";
        if (f.principal && vis.hueco === j) clase += " hueco";
        if (f.principal && (vis.malas || []).includes(j)) clase += " mala";
        piezas.push(el("div", { class: clase, style: `left:${x}px;top:${Y_CELDAS}px` }));
        piezas.push(el("span", { class: "indice", style: `left:${x}px;top:${Y_CELDAS + CELDA + 2}px;width:${CELDA}px;text-align:center`, text: j }));
        if (s.direcciones) {
          piezas.push(el("span", { class: "vdireccion", style: `left:${x - 4}px;top:${Y_CELDAS + CELDA + 17}px;width:${CELDA + 8}px`, text: hex(f.arr.base + 4 * j) }));
        }
      }
      for (const [j, texto] of Object.entries((f.principal ? vis.marcas : vis.marcasNuevo) || {})) {
        const lineas = texto.split(", ");
        piezas.push(el("span", { class: "marcador apilado", style: `left:${Number(j) * PASO - 6}px;top:${Y_CELDAS - 3 - 12 * lineas.length}px;width:${CELDA + 12}px`, text: lineas.join("\n") }));
      }
      fila.querySelector(".vfila-capa").replaceChildren(...piezas);

      let indicador = fila.querySelector(".vtamano");
      if (f.principal) {
        if (!indicador) {
          indicador = el("div", { class: "vtamano", "aria-hidden": "true" }, el("span", { text: "▲" }), el("span", { text: "tamano" }));
          fila.append(indicador);
        }
        indicador.style.left = `${s.tamano * PASO}px`;
        indicador.style.top = `${Y_CELDAS + CELDA + (s.direcciones ? 32 : 18)}px`;
        indicador.classList.toggle("lleno", s.tamano >= n);
        indicador.classList.toggle("activo", !!vis.caret);
      } else if (indicador) {
        indicador.remove();
      }
    }
    for (const fila of lienzo.querySelectorAll(".vfila[data-id]")) if (!filasVivas.has(fila.dataset.id)) retirar(fila);

    // Fichas, por id: al copiarse se deslizan de una casilla (o fila) a otra.
    const vivas = new Set();
    for (const f of filas) {
      const sufijo = f.principal ? "" : "Nuevo";
      f.arr.celdas.forEach((ficha, j) => {
        if (!ficha) return;
        vivas.add(ficha.id);
        const x = `${MARGEN + j * PASO}px`;
        const y = `${f.y + Y_CELDAS}px`;
        let nodo = lienzo.querySelector(`.vficha[data-id="${ficha.id}"]`);
        let moviendo = false;
        if (!nodo) {
          nodo = el("div", { class: "vficha", "data-id": ficha.id, style: `left:${x};top:${y}` });
          lienzo.append(nodo);
        } else {
          moviendo = nodo.style.left !== x || nodo.style.top !== y;
        }
        nodo.style.left = x;
        nodo.style.top = y;
        nodo.textContent = ficha.v;
        let clase = "vficha";
        if (f.principal && j >= ocupadas) clase += " basura";
        if (ficha.copia) clase += " copia";
        if ((vis[`leidas${sufijo}`] || []).includes(j)) clase += " leida";
        if ((vis[`revisadas${sufijo}`] || []).includes(j)) clase += " revisada";
        if ((vis[`malas${sufijo}`] || []).includes(j)) clase += " mala";
        if (vis[`escrita${sufijo}`] === j) clase += " escrita";
        if (vis[`encontrada${sufijo}`] === j) clase += " encontrada";
        if (vis[`condenada${sufijo}`] === j) clase += " condenada";
        if (vis.cae === ficha.id) clase += " cae";
        if (moviendo) clase += " moviendo";
        nodo.className = clase;
      });
    }
    for (const nodo of lienzo.querySelectorAll(".vficha[data-id]")) if (!vivas.has(nodo.dataset.id)) retirar(nodo);

    // Arco de obtener(i): de la dirección de inicio directo a la casilla i.
    const svg = lienzo.querySelector("svg");
    svg.replaceChildren();
    if (vis.salto != null) dibujarSalto(svg, vis.salto);
  }

  // ------------------------------------------------------------------
  // Visualizadores de la lección
  // ------------------------------------------------------------------

  function visualizador(contenedor, opciones) {
    const claves = [...new Set(opciones.ops.flatMap((id) => OPS[id].fragmentos))];
    DS.tema({
      contenedor,
      incremental: true,
      dibujar,
      codigo: fragmentos(...claves),
      tituloCodigo: (clave) => `VectorDinamico::${clave}()`,
      mensajeInicial: opciones.mensajeInicial,
      estadoInicial: opciones.estadoInicial,
      entradas: opciones.entradas,
      operaciones: opciones.ops.map((id) => Object.assign({ id }, OPS[id], (opciones.etiquetas || {})[id] ? { etiqueta: opciones.etiquetas[id] } : {})),
    });
  }

  const VALOR = { id: "valor", etiqueta: "Valor", min: 0, max: 99, aleatorio: true };
  const posicion = (valor) => ({ id: "pos", etiqueta: "Posición", min: -5, max: 20, valor });

  // Paso 1: obtener(i), con las direcciones de memoria a la vista.
  visualizador("vis-obtener", {
    ops: ["obtener"],
    entradas: [{ id: "pos", etiqueta: "i", min: -5, max: 20, valor: 2 }],
    estadoInicial: () => estadoDesde([10, 20, 30], 4, { direcciones: true }),
    mensajeInicial: "Las direcciones van de 4 en 4: un int ocupa 4 bytes. Prueba i = 2, 3 y 9.",
  });

  // Paso 2: agregarAlFinal y redimensionar.
  visualizador("vis-agregar", {
    ops: ["agregarAlFinal"],
    entradas: [VALOR],
    estadoInicial: () => estadoDesde([10, 20, 30], 4),
    mensajeInicial: "Así queda el vector de main() tras agregar 10, 20 y 30. Agrega dos valores: el primero cabe, el segundo no.",
  });

  // Pasos 4, 5 y 6: insertar, eliminarEn y buscar.
  visualizador("vis-insertar", {
    ops: ["insertar"],
    entradas: [posicion(1), VALOR],
    estadoInicial: () => estadoDesde([10, 20, 30, 40, 50], 8),
    mensajeInicial: "Inserta en la posición 1 y mira cómo se corre todo lo que está a su derecha. Prueba también pos = 0, pos = 5 y una inválida.",
  });

  visualizador("vis-eliminar", {
    ops: ["eliminarEn"],
    entradas: [posicion(1)],
    estadoInicial: () => estadoDesde([10, 15, 20, 30, 40, 50], 8),
    mensajeInicial: "Elimina la posición 1 y mira cómo se cierra el hueco. Prueba también el último (pos = 5) y una posición inválida.",
  });

  visualizador("vis-buscar", {
    ops: ["buscar"],
    entradas: [{ id: "valor", etiqueta: "Valor", min: 0, max: 99, valor: 30 }],
    estadoInicial: () => estadoDesde([10, 15, 20, 30, 40, 50], 8),
    mensajeInicial: "Busca 30, después un valor que no esté (por ejemplo 99).",
  });

  // Paso 7: todas las operaciones juntas.
  visualizador("vis-todo", {
    ops: ["agregarAlFinal", "insertar", "eliminarEn", "buscar", "obtener"],
    etiquetas: { obtener: "obtener(pos)" },
    entradas: [VALOR, posicion(1)],
    estadoInicial: () => estadoDesde([10, 20, 30], 4),
    mensajeInicial: "El vector de main(): 10, 20, 30 con capacidad 4. Combina operaciones; Posición se usa para insertar, eliminarEn y obtener.",
  });

  // ------------------------------------------------------------------
  // Paso 3: experimento del costo amortizado (duplicar contra sumar 1)
  // ------------------------------------------------------------------

  const ESTRATEGIAS = [
    { titulo: "redimensionar(capacidad * 2)", crecer: (c) => c * 2 },
    { titulo: "redimensionar(capacidad + 1)", crecer: (c) => c + 1 },
  ];
  const LLAMADAS = 64;

  function montarExperimento() {
    const caja = document.getElementById("experimento");
    if (!caja) return;
    let corridas = [];
    const formato = (n) => n.toLocaleString("es");

    const tarjetas = ESTRATEGIAS.map((e) => {
      const barras = hasta(LLAMADAS).map((k) => el("button", { type: "button", class: "barra-costo", "aria-label": `Llamada ${k + 1}`, tabindex: -1 }));
      const lectura = el("p", { class: "lectura-costo", "aria-live": "polite", text: "Toca una barra para ver lo que costó esa llamada." });
      const datos = el("div", { class: "variables" });
      const grafico = el("div", { class: "grafico-costo", role: "img" }, barras);
      const tarjeta = el("div", { class: "tarjeta-costo" },
        el("p", { class: "fila-titulo", text: e.titulo }), datos, grafico,
        el("div", { class: "eje-costo" }, el("span", { text: "llamada 1" }), el("span", { text: `llamada ${LLAMADAS}` })),
        lectura);
      grafico.addEventListener("click", (ev) => {
        const k = barras.indexOf(ev.target.closest(".barra-costo"));
        if (k < 0 || !corridas.length) return;
        const r = corridas[ESTRATEGIAS.indexOf(e)];
        if (k >= r.costos.length) return;
        const copias = r.costos[k] - 1;
        for (const b of barras) b.classList.toggle("elegida", b === barras[k]);
        lectura.textContent = `Llamada ${k + 1}: ${copias ? `copió ${copias} elemento(s) y escribió 1` : "solo escribió 1 valor"} → ${r.costos[k]} escritura(s).`;
      });
      return { e, barras, datos, grafico, lectura, tarjeta };
    });

    const resumen = el("p", { class: "resumen-costo", "aria-live": "polite" });

    function reiniciar() {
      corridas = ESTRATEGIAS.map(() => ({ tamano: 0, capacidad: 2, costos: [] }));
      for (const t of tarjetas) t.lectura.textContent = "Toca una barra para ver lo que costó esa llamada.";
      pintar(0);
    }

    function agregar(veces) {
      const antes = corridas[0].costos.length;
      corridas.forEach((r, k) => {
        for (let v = 0; v < veces && r.tamano < LLAMADAS; v++) {
          let copias = 0;
          if (r.tamano === r.capacidad) {
            copias = r.tamano;
            r.capacidad = ESTRATEGIAS[k].crecer(r.capacidad);
          }
          r.costos.push(copias + 1);
          r.tamano++;
        }
      });
      pintar(antes);
    }

    // Las dos gráficas usan la misma escala para poder compararlas.
    function pintar(desde) {
      const maximo = Math.max(4, ...corridas.flatMap((r) => r.costos));
      tarjetas.forEach((t, k) => {
        const r = corridas[k];
        const total = r.costos.reduce((a, b) => a + b, 0);
        const copias = total - r.costos.length;
        t.datos.replaceChildren(DS.variables({
          tamano: r.tamano,
          capacidad: r.capacidad,
          copias: formato(copias),
          "escrituras por llamada": r.tamano ? (total / r.tamano).toFixed(1).replace(".", ",") : "—",
        }));
        t.grafico.setAttribute("aria-label", `${t.e.titulo}: ${formato(total)} escrituras en ${r.tamano} llamadas`);
        t.barras.forEach((b, j) => {
          const costo = r.costos[j];
          b.style.height = costo ? `${Math.max(3, (costo / maximo) * 100)}%` : "0";
          b.className = `barra-costo${costo > 1 ? " con-copias" : ""}${costo && j >= desde ? " nueva" : ""}`;
          b.title = costo ? `Llamada ${j + 1}: ${costo} escritura(s)` : "";
          b.tabIndex = costo ? 0 : -1;
        });
      });
      const [a, b] = corridas.map((r) => r.costos.reduce((x, y) => x + y, 0));
      const n = corridas[0].tamano;
      resumen.textContent = n < 3
        ? "Todavía no hubo que redimensionar: las dos estrategias empiezan con capacidad 2."
        : `Para ${n} elementos: duplicando, ${formato(a)} escrituras; sumando 1, ${formato(b)}. ${b > a ? `Sumar 1 cuesta ${(b / a).toFixed(1).replace(".", ",")} veces más.` : ""}`;
      bUno.disabled = bDiez.disabled = bTodo.disabled = n >= LLAMADAS;
    }

    const bUno = el("button", { class: "boton principal", type: "button", onclick: () => agregar(1) }, el("code", { text: "agregarAlFinal" }), " × 1");
    const bDiez = el("button", { class: "boton principal", type: "button", onclick: () => agregar(10) }, "× 10");
    const bTodo = el("button", { class: "boton", type: "button", text: `Hasta ${LLAMADAS}`, onclick: () => agregar(LLAMADAS) });
    caja.classList.add("panel", "experimento");
    caja.append(
      el("div", { class: "controles" }, bUno, bDiez, bTodo, el("span", { class: "separador" }),
        el("button", { class: "boton", type: "button", text: "Reiniciar", onclick: reiniciar })),
      el("div", { class: "leyenda-costo" },
        el("span", {}, el("i", { class: "muestra" }), "solo escribe el valor (1)"),
        el("span", {}, el("i", { class: "muestra con-copias" }), "redimensiona: copia todo y escribe")),
      el("div", { class: "comparacion-costo" }, tarjetas.map((t) => t.tarjeta)),
      resumen);
    reiniciar();
  }

  if (typeof document !== "undefined") montarExperimento();
})();
