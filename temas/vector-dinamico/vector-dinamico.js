// Lección del vector dinámico, en pasos. Los fragmentos de código deben
// coincidir línea por línea con ejemplos/cpp/vector_dinamico.cpp, y en
// inglés con ejemplos/cpp/en/dynamic_array.cpp (scripts/verificar-fragmentos.mjs
// lo revisa). Los textos que se ven van en los dos idiomas con DS.tr.
(function () {
  const { el, tr } = DS;
  const MAXIMO = 16; // límite solo para que la animación quepa en pantalla
  const CELDA = 44;
  const PASO = 52;
  const MARGEN = 14;
  const Y_CELDAS = 46; // dentro de cada fila: título y marcas arriba, índices abajo
  const SVG = "http://www.w3.org/2000/svg";

  // ------------------------------------------------------------------
  // Fragmentos de C++ (copiados de ejemplos/cpp/vector_dinamico.cpp y de
  // ejemplos/cpp/en/dynamic_array.cpp, con las mismas líneas)
  // ------------------------------------------------------------------

  const CODIGO = tr({
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
  }, {
    obtener: `
      int get(int i) const {
          if (i < 0 || i >= size) {
              throw std::out_of_range("invalid index");
          }
          return data[i];
      }`,
    agregarAlFinal: `
      void pushBack(int value) {
          if (size == capacity) {
              resize(capacity * 2);
          }
          data[size] = value;
          size++;
      }`,
    insertar: `
      void insert(int pos, int value) {
          if (pos < 0 || pos > size) {
              throw std::out_of_range("invalid position");
          }
          if (size == capacity) {
              resize(capacity * 2);
          }
          for (int i = size; i > pos; i--) {
              data[i] = data[i - 1];
          }
          data[pos] = value;
          size++;
      }`,
    eliminarEn: `
      void removeAt(int pos) {
          if (pos < 0 || pos >= size) {
              throw std::out_of_range("invalid position");
          }
          for (int i = pos; i < size - 1; i++) {
              data[i] = data[i + 1];
          }
          size--;
      }`,
    buscar: `
      int find(int value) const {
          for (int i = 0; i < size; i++) {
              if (data[i] == value) {
                  return i;
              }
          }
          return -1;
      }`,
    redimensionar: `
      void resize(int newCapacity) {
          int* newData = new int[newCapacity];
          for (int i = 0; i < size; i++) {
              newData[i] = data[i];
          }
          delete[] data;
          data = newData;
          capacity = newCapacity;
      }`,
  });

  const CLASE = tr("VectorDinamico", "DynamicArray");
  const FUNCION = tr(
    { obtener: "obtener", agregarAlFinal: "agregarAlFinal", insertar: "insertar", eliminarEn: "eliminarEn", buscar: "buscar", redimensionar: "redimensionar" },
    { obtener: "get", agregarAlFinal: "pushBack", insertar: "insert", eliminarEn: "removeAt", buscar: "find", redimensionar: "resize" });

  // Nombres del C++ que se dibujan. Los estados usan los de español y se
  // traducen al pintar, así son iguales en los dos idiomas.
  const NOMBRES = { tamano: "size", capacidad: "capacity", valor: "value", nuevaCapacidad: "newCapacity", "&datos[i]": "&data[i]", datos: "data", nuevos: "newData" };
  const nombre = (k) => tr(k, NOMBRES[k] || k);
  const traducirVars = (vars) => Object.fromEntries(Object.entries(vars).map(([k, v]) => [nombre(k), v]));

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
    paso("redimensionar", 2, tr(`new int[${nueva}]: reservamos un bloque nuevo, del doble de tamaño, en otra parte de la memoria (${hex(s.nuevos.base)}). El viejo no se puede estirar.`,
      `new int[${nueva}]: we reserve a new block, twice as big, somewhere else in memory (${hex(s.nuevos.base)}). The old one can't be stretched.`));
    for (let i = 0; i < s.tamano; i++) {
      copiar(s, s.datos, i, s.nuevos, i);
      s.vis = { vars: Object.assign({}, extra, { i }), escritaNuevo: i, marcas: { [i]: "i" }, marcasNuevo: { [i]: "i" } };
      paso("redimensionar", 4, tr(`nuevos[${i}] = datos[${i}]: copiamos ${s.nuevos.celdas[i].v}.`, `newData[${i}] = data[${i}]: we copy ${s.nuevos.celdas[i].v}.`)
        + (i === s.tamano - 1 ? tr(` Fueron ${s.tamano} copias: esta es la parte cara, O(n).`, ` That was ${s.tamano} copies: this is the expensive part, O(n).`) : ""));
    }
    s.liberado = true;
    s.vis = { vars: extra };
    paso("redimensionar", 6, tr("delete[] datos: devolvemos el bloque viejo al sistema. Desde ahora no se puede leer ni escribir ahí.",
      "delete[] data: we give the old block back to the system. From now on it can't be read or written."));
    s.datos = s.nuevos;
    s.nuevos = null;
    s.liberado = false;
    s.vis = { vars: extra };
    paso("redimensionar", 7, tr(`datos = nuevos: el puntero datos ahora apunta al bloque grande (${hex(s.datos.base)}).`,
      `data = newData: the data pointer now points to the big block (${hex(s.datos.base)}).`));
    s.capacidad = nueva;
    s.vis = { vars: extra, cambio: ["capacidad"] };
    paso("redimensionar", 8, tr(`capacidad = ${nueva}. No habrá que volver a copiar hasta llenar las ${nueva} casillas.`,
      `capacity = ${nueva}. No more copying until all ${nueva} slots are full.`));
  }

  function limiteAlcanzado(s, clave, linea, paso) {
    if (s.tamano < MAXIMO) return false;
    s.vis = { error: true, caret: true };
    paso(clave, linea, tr(`Para que la animación quepa en pantalla, el vector llega hasta ${MAXIMO} elementos. Elimina alguno o pulsa Reiniciar.`,
      `Up to ${MAXIMO} elements, so the animation fits on screen: remove some or press Reset.`), "error");
    return true;
  }

  // Mensaje y resaltado para una posición fuera del vector.
  function posicionInvalida(s, pos, maximo, nombre) {
    s.vis = { vars: { [nombre || "pos"]: pos }, error: true };
    if (pos >= s.tamano && pos < s.capacidad) {
      s.vis.malas = [pos];
      s.vis.marcas = { [pos]: nombre || "pos" };
      return tr(`No: la casilla ${pos} existe en memoria, pero no es parte del vector (tamano = ${s.tamano}). Se lanza std::out_of_range.`,
        `No: slot ${pos} exists in memory, but it isn't part of the array (size = ${s.tamano}). std::out_of_range is thrown.`);
    }
    if (maximo < 0) return tr("No: el vector está vacío, no hay ninguna posición válida. Se lanza std::out_of_range.",
      "No: the array is empty, there is no valid position. std::out_of_range is thrown.");
    return tr(`No: ${pos} está fuera del rango 0..${maximo}. Se lanza std::out_of_range y el vector no cambia.`,
      `No: ${pos} is outside the range 0..${maximo}. std::out_of_range is thrown and the array doesn't change.`);
  }

  const OPS = {
    obtener: {
      etiqueta: tr("obtener(i)", "get(i)"),
      usa: ["pos"],
      fragmentos: ["obtener"],
      ejecutar(s, { pos: i }, paso) {
        s.vis = { vars: { i }, marcas: i >= 0 && i < s.capacidad ? { [i]: "i" } : {} };
        paso("obtener", 2, tr(`¿i (${i}) está entre 0 y tamano − 1 (${s.tamano - 1})?`, `Is i (${i}) between 0 and size − 1 (${s.tamano - 1})?`));
        if (i < 0 || i >= s.tamano) {
          paso("obtener", 3, posicionInvalida(s, i, s.tamano - 1, "i"), "error");
          return;
        }
        const direccion = s.datos.base + 4 * i;
        const vars = { i, "&datos[i]": `${hex(s.datos.base)} + ${i}·4 = ${hex(direccion)}` };
        s.vis = { vars, salto: i, leidas: [i] };
        paso("obtener", 5, tr(`Sí. La dirección sale con una cuenta: inicio + i × 4 bytes (lo que ocupa un int) = ${hex(direccion)}. Saltamos directo, sin pasar por las casillas anteriores.`,
          `Yes. The address comes from arithmetic: start + i × 4 bytes (the size of an int) = ${hex(direccion)}. We jump straight there, without going through the earlier slots.`));
        s.vis = { vars, encontrada: i, salida: s.datos.celdas[i].v, marcas: { [i]: "i" } };
        paso("obtener", 5, tr(`return datos[${i}] = ${s.datos.celdas[i].v}. Da igual si i es 0 o un millón: siempre es una cuenta y un salto, O(1).`,
          `return data[${i}] = ${s.datos.celdas[i].v}. Whether i is 0 or a million, it's always one calculation and one jump: O(1).`), "exito");
      },
    },
    agregarAlFinal: {
      etiqueta: tr("agregarAlFinal(valor)", "pushBack(value)"),
      usa: ["valor"],
      fragmentos: ["agregarAlFinal", "redimensionar"],
      ejecutar(s, { valor }, paso) {
        const lleno = s.tamano === s.capacidad;
        s.vis = { vars: { valor }, caret: true };
        paso("agregarAlFinal", 2, tr(`¿Está lleno? tamano (${s.tamano}) == capacidad (${s.capacidad})? `, `Is it full? size (${s.tamano}) == capacity (${s.capacidad})? `)
          + (lleno ? tr("Sí.", "Yes.") : tr(`No: la casilla ${s.tamano} está libre.`, `No: slot ${s.tamano} is free.`)));
        if (lleno) {
          if (limiteAlcanzado(s, "agregarAlFinal", 2, paso)) return;
          s.vis = { vars: { valor }, caret: true };
          paso("agregarAlFinal", 3, tr("No queda espacio, y un bloque de memoria no se puede estirar: hay que redimensionar al doble.",
            "No space left, and a block of memory can't be stretched: we have to resize to double."));
          redimensionar(s, paso, { valor });
        }
        const nueva = nuevaFicha(s, valor);
        s.datos.celdas[s.tamano] = nueva;
        s.vis = { vars: { valor }, ocupadas: s.tamano + 1, escrita: s.tamano, cae: nueva.id, caret: true };
        paso("agregarAlFinal", 5, tr(`datos[${s.tamano}] = ${valor}: escribimos directo en la primera casilla libre. Nada se mueve.`,
          `data[${s.tamano}] = ${valor}: we write straight into the first free slot. Nothing moves.`));
        s.tamano++;
        s.vis = { vars: { valor }, cambio: ["tamano"] };
        const libres = s.capacidad - s.tamano;
        paso("agregarAlFinal", 6, tr(`tamano++ → ${s.tamano}. `, `size++ → ${s.tamano}. `)
          + (libres
            ? tr(`Quedan ${libres} casilla(s) libres: los próximos agregarAlFinal son O(1).`, `${libres} free slot(s) left: the next pushBack calls are O(1).`)
            : tr("Quedó lleno: el próximo agregarAlFinal tendrá que redimensionar.", "It's full now: the next pushBack will have to resize.")), "exito");
      },
    },
    insertar: {
      etiqueta: tr("insertar(pos, valor)", "insert(pos, value)"),
      usa: ["pos", "valor"],
      fragmentos: ["insertar", "redimensionar"],
      ejecutar(s, { pos, valor }, paso) {
        const vars = { pos, valor };
        s.vis = { vars, marcas: pos >= 0 && pos <= s.tamano ? { [pos]: "pos" } : {} };
        paso("insertar", 2, tr(`¿pos (${pos}) está entre 0 y tamano (${s.tamano})? Vale pos == tamano: sería agregar al final.`,
          `Is pos (${pos}) between 0 and size (${s.tamano})? pos == size is allowed: it would add at the end.`));
        if (pos < 0 || pos > s.tamano) {
          const texto = posicionInvalida(s, pos, s.tamano);
          s.vis.vars = vars;
          paso("insertar", 3, texto, "error");
          return;
        }
        const lleno = s.tamano === s.capacidad;
        s.vis = { vars, caret: true, marcas: { [pos]: "pos" } };
        paso("insertar", 5, tr(`¿Está lleno? tamano (${s.tamano}) == capacidad (${s.capacidad})? ${lleno ? "Sí." : "No: hay lugar para correr los elementos."}`,
          `Is it full? size (${s.tamano}) == capacity (${s.capacidad})? ${lleno ? "Yes." : "No: there is room to shift the elements."}`));
        if (lleno) {
          if (limiteAlcanzado(s, "insertar", 5, paso)) return;
          s.vis = { vars, caret: true, marcas: { [pos]: "pos" } };
          paso("insertar", 6, tr("Sí: primero redimensionamos al doble; después hacemos el hueco.", "Yes: first we resize to double; then we open the gap."));
          redimensionar(s, paso, vars);
        }
        const corridos = s.tamano - pos;
        for (let i = s.tamano; i > pos; i--) {
          copiar(s, s.datos, i - 1, s.datos, i);
          s.vis = { vars: { pos, valor, i }, ocupadas: s.tamano + 1, escrita: i, marcas: marcas([[i, "i"], [pos, "pos"]]) };
          paso("insertar", 9, tr(`datos[${i}] = datos[${i - 1}]: ${s.datos.celdas[i].v} se corre una casilla a la derecha.`, `data[${i}] = data[${i - 1}]: ${s.datos.celdas[i].v} shifts one slot to the right.`)
            + (i === s.tamano ? tr(" Empezamos por el final para no pisar nada.", " We start from the end so nothing gets overwritten.") : ""));
        }
        s.vis = { vars: { pos, valor, i: pos }, ocupadas: s.tamano + 1, hueco: pos, marcas: { [pos]: "i = pos" } };
        paso("insertar", 8, corridos
          ? tr(`i == pos: termina el ciclo. La casilla ${pos} quedó libre (lo que ves ahí es una copia vieja que vamos a pisar).`,
            `i == pos: the loop ends. Slot ${pos} is free now (what you see there is an old copy we are about to overwrite).`)
          : tr("pos == tamano: no hay nada a la derecha que correr.", "pos == size: there is nothing to the right to shift."));
        const nueva = nuevaFicha(s, valor);
        s.datos.celdas[pos] = nueva;
        s.vis = { vars, ocupadas: s.tamano + 1, escrita: pos, cae: nueva.id, marcas: { [pos]: "pos" } };
        paso("insertar", 11, `${tr("datos", "data")}[${pos}] = ${valor}.`);
        s.tamano++;
        s.vis = { vars, cambio: ["tamano"] };
        paso("insertar", 12, corridos
          ? tr(`tamano++ → ${s.tamano}. Corrimos ${corridos} elemento(s): cuanto más a la izquierda insertas, más trabajo. Por eso es O(n).`,
            `size++ → ${s.tamano}. We shifted ${corridos} element(s): the further left you insert, the more work. That's why it's O(n).`)
          : tr(`tamano++ → ${s.tamano}. No corrimos nada: insertar al final cuesta lo mismo que agregarAlFinal.`,
            `size++ → ${s.tamano}. Nothing was shifted: inserting at the end costs the same as pushBack.`), "exito");
      },
    },
    eliminarEn: {
      etiqueta: tr("eliminarEn(pos)", "removeAt(pos)"),
      usa: ["pos"],
      fragmentos: ["eliminarEn"],
      ejecutar(s, { pos }, paso) {
        s.vis = { vars: { pos }, marcas: pos >= 0 && pos < s.tamano ? { [pos]: "pos" } : {} };
        paso("eliminarEn", 2, tr(`¿pos (${pos}) está entre 0 y tamano − 1 (${s.tamano - 1})?`, `Is pos (${pos}) between 0 and size − 1 (${s.tamano - 1})?`));
        if (pos < 0 || pos >= s.tamano) {
          paso("eliminarEn", 3, posicionInvalida(s, pos, s.tamano - 1), "error");
          return;
        }
        const quitado = s.datos.celdas[pos].v;
        const aCorrer = s.tamano - 1 - pos;
        s.vis = { vars: { pos }, condenada: pos, marcas: { [pos]: "pos" } };
        paso("eliminarEn", 5, aCorrer
          ? tr(`Para borrar ${quitado} no hay un "hueco" posible: lo tapamos corriendo a la izquierda los ${aCorrer} elemento(s) de su derecha.`,
            `To delete ${quitado} we can't leave a "gap": we cover it by shifting the ${aCorrer} element(s) on its right to the left.`)
          : tr(`${quitado} es el último: no hay nada a su derecha que correr.`, `${quitado} is the last one: there is nothing to its right to shift.`));
        for (let i = pos; i < s.tamano - 1; i++) {
          copiar(s, s.datos, i + 1, s.datos, i);
          s.vis = { vars: { pos, i }, escrita: i, marcas: marcas([[i, "i"], [pos, "pos"]]) };
          paso("eliminarEn", 6, i === pos
            ? tr(`datos[${i}] = datos[${i + 1}]: ${s.datos.celdas[i].v} pisa a ${quitado}, que se pierde.`, `data[${i}] = data[${i + 1}]: ${s.datos.celdas[i].v} overwrites ${quitado}, which is lost.`)
            : tr(`datos[${i}] = datos[${i + 1}]: ${s.datos.celdas[i].v} se corre a la izquierda.`, `data[${i}] = data[${i + 1}]: ${s.datos.celdas[i].v} shifts to the left.`));
        }
        s.tamano--;
        s.vis = { vars: { pos }, cambio: ["tamano"] };
        paso("eliminarEn", 8, tr(`tamano-- → ${s.tamano}. La casilla ${s.tamano} queda como basura: sigue en memoria y la capacidad no cambia, pero ya no es parte del vector.`,
          `size-- → ${s.tamano}. Slot ${s.tamano} is left as garbage: it's still in memory and the capacity doesn't change, but it's no longer part of the array.`), "exito");
      },
    },
    buscar: {
      etiqueta: tr("buscar(valor)", "find(value)"),
      usa: ["valor"],
      fragmentos: ["buscar"],
      ejecutar(s, { valor }, paso) {
        for (let i = 0; i < s.tamano; i++) {
          const v = s.datos.celdas[i].v;
          s.vis = { vars: { valor, i }, leidas: [i], revisadas: hasta(i), marcas: { [i]: "i" } };
          paso("buscar", 3, tr(`¿datos[${i}] (${v}) == ${valor}? ${v === valor ? "¡Sí!" : "No, seguimos con la siguiente."}`,
            `data[${i}] (${v}) == ${valor}? ${v === valor ? "Yes!" : "No, on to the next one."}`));
          if (v === valor) {
            s.vis = { vars: { valor, i }, encontrada: i, revisadas: hasta(i), salida: i, marcas: { [i]: "i" } };
            paso("buscar", 4, tr(`return ${i}. Revisamos ${i + 1} casilla(s).`, `return ${i}. We checked ${i + 1} slot(s).`), "exito");
            return;
          }
        }
        s.vis = { vars: { valor }, revisadas: hasta(s.tamano), salida: -1 };
        paso("buscar", 7, s.tamano
          ? tr(`Revisamos las ${s.tamano} casillas y no está: return -1. En el peor caso hay que mirar todas: O(n).`,
            `We checked all ${s.tamano} slots and it isn't there: return -1. In the worst case we have to look at all of them: O(n).`)
          : tr("El vector está vacío: el for no da ni una vuelta. return -1.", "The array is empty: the for loop doesn't run even once. return -1."), "error");
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
    escenario.append(el("div", { class: "info-vector", "data-alto-estable": true }), el("div", { class: "marco-vector" }, lienzo));
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
      DS.variables(traducirVars(Object.assign({ tamano: s.tamano, capacidad: s.capacidad }, vis.vars)), (vis.cambio || []).map(nombre)),
      vis.salida != null ? el("div", { class: "salida-valor" }, tr("devuelve", "returns"), el("div", { class: "celda encontrada", text: vis.salida })) : "");

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
        ? `${nombre("datos")} → ${hex(f.arr.base)}${s.liberado ? tr("   (liberado con delete[])", "   (freed with delete[])") : ""}`
        : `${nombre("nuevos")} → ${hex(f.arr.base)}`;
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
          indicador = el("div", { class: "vtamano", "aria-hidden": "true" }, el("span", { text: "▲" }), el("span", { text: nombre("tamano") }));
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
      tituloCodigo: (clave) => `${CLASE}::${FUNCION[clave]}()`,
      mensajeInicial: opciones.mensajeInicial,
      estadoInicial: opciones.estadoInicial,
      entradas: opciones.entradas,
      operaciones: opciones.ops.map((id) => Object.assign({ id }, OPS[id], (opciones.etiquetas || {})[id] ? { etiqueta: opciones.etiquetas[id] } : {})),
    });
  }

  const VALOR = { id: "valor", etiqueta: tr("Valor", "Value"), min: 0, max: 99, aleatorio: true };
  const posicion = (valor) => ({ id: "pos", etiqueta: tr("Posición", "Position"), min: -5, max: 20, valor });

  // Paso 1: obtener(i), con las direcciones de memoria a la vista.
  visualizador("vis-obtener", {
    ops: ["obtener"],
    entradas: [{ id: "pos", etiqueta: "i", min: -5, max: 20, valor: 2 }],
    estadoInicial: () => estadoDesde([10, 20, 30], 4, { direcciones: true }),
    mensajeInicial: tr("Las direcciones van de 4 en 4: un int ocupa 4 bytes. Prueba i = 2, 3 y 9.",
      "The addresses go up by 4: an int takes 4 bytes. Try i = 2, 3 and 9."),
  });

  // Paso 2: agregarAlFinal y redimensionar.
  visualizador("vis-agregar", {
    ops: ["agregarAlFinal"],
    entradas: [VALOR],
    estadoInicial: () => estadoDesde([10, 20, 30], 4),
    mensajeInicial: tr("Así queda el vector de main() tras agregar 10, 20 y 30. Agrega dos valores: el primero cabe, el segundo no.",
      "This is the array from main() after adding 10, 20 and 30. Add two values: the first one fits, the second doesn't."),
  });

  // Pasos 4, 5 y 6: insertar, eliminarEn y buscar.
  visualizador("vis-insertar", {
    ops: ["insertar"],
    entradas: [posicion(1), VALOR],
    estadoInicial: () => estadoDesde([10, 20, 30, 40, 50], 8),
    mensajeInicial: tr("Inserta en la posición 1 y mira cómo se corre todo lo que está a su derecha. Prueba también pos = 0, pos = 5 y una inválida.",
      "Insert at position 1 and watch everything to its right shift over. Also try pos = 0, pos = 5 and an invalid one."),
  });

  visualizador("vis-eliminar", {
    ops: ["eliminarEn"],
    entradas: [posicion(1)],
    estadoInicial: () => estadoDesde([10, 15, 20, 30, 40, 50], 8),
    mensajeInicial: tr("Elimina la posición 1 y mira cómo se cierra el hueco. Prueba también el último (pos = 5) y una posición inválida.",
      "Remove position 1 and watch the gap close. Also try the last one (pos = 5) and an invalid position."),
  });

  visualizador("vis-buscar", {
    ops: ["buscar"],
    entradas: [{ id: "valor", etiqueta: tr("Valor", "Value"), min: 0, max: 99, valor: 30 }],
    estadoInicial: () => estadoDesde([10, 15, 20, 30, 40, 50], 8),
    mensajeInicial: tr("Busca 30, después un valor que no esté (por ejemplo 99).", "Find 30, then a value that isn't there (for example 99)."),
  });

  // Paso 7: todas las operaciones juntas.
  visualizador("vis-todo", {
    ops: ["agregarAlFinal", "insertar", "eliminarEn", "buscar", "obtener"],
    etiquetas: { obtener: tr("obtener(pos)", "get(pos)") },
    entradas: [VALOR, posicion(1)],
    estadoInicial: () => estadoDesde([10, 20, 30], 4),
    mensajeInicial: tr("El vector de main(): 10, 20, 30 con capacidad 4. Combina operaciones; Posición se usa para insertar, eliminarEn y obtener.",
      "The array from main(): 10, 20, 30 with capacity 4. Combine operations; Position is used by insert, removeAt and get."),
  });

  // ------------------------------------------------------------------
  // Paso 3: experimento del costo amortizado (duplicar contra sumar 1)
  // ------------------------------------------------------------------

  const ESTRATEGIAS = [
    { titulo: tr("redimensionar(capacidad * 2)", "resize(capacity * 2)"), crecer: (c) => c * 2 },
    { titulo: tr("redimensionar(capacidad + 1)", "resize(capacity + 1)"), crecer: (c) => c + 1 },
  ];
  const LLAMADAS = 64;

  function montarExperimento() {
    const caja = document.getElementById("experimento");
    if (!caja) return;
    let corridas = [];
    const local = tr("es", "en");
    const formato = (n) => n.toLocaleString(local);
    const decimal = (x) => x.toLocaleString(local, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    const AYUDA = tr("Toca una barra para ver lo que costó esa llamada.", "Tap a bar to see what that call cost.");

    const tarjetas = ESTRATEGIAS.map((e) => {
      const barras = hasta(LLAMADAS).map((k) => el("button", { type: "button", class: "barra-costo", "aria-label": tr(`Llamada ${k + 1}`, `Call ${k + 1}`), tabindex: -1 }));
      const lectura = el("p", { class: "lectura-costo", "aria-live": "polite", text: AYUDA });
      const datos = el("div", { class: "variables" });
      const grafico = el("div", { class: "grafico-costo", role: "img" }, barras);
      const tarjeta = el("div", { class: "tarjeta-costo" },
        el("p", { class: "fila-titulo", text: e.titulo }), datos, grafico,
        el("div", { class: "eje-costo" }, el("span", { text: tr("llamada 1", "call 1") }), el("span", { text: tr(`llamada ${LLAMADAS}`, `call ${LLAMADAS}`) })),
        lectura);
      grafico.addEventListener("click", (ev) => {
        const k = barras.indexOf(ev.target.closest(".barra-costo"));
        if (k < 0 || !corridas.length) return;
        const r = corridas[ESTRATEGIAS.indexOf(e)];
        if (k >= r.costos.length) return;
        const copias = r.costos[k] - 1;
        for (const b of barras) b.classList.toggle("elegida", b === barras[k]);
        lectura.textContent = tr(
          `Llamada ${k + 1}: ${copias ? `copió ${copias} elemento(s) y escribió 1` : "solo escribió 1 valor"} → ${r.costos[k]} escritura(s).`,
          `Call ${k + 1}: ${copias ? `copied ${copias} element(s) and wrote 1` : "only wrote 1 value"} → ${r.costos[k]} write(s).`);
      });
      return { e, barras, datos, grafico, lectura, tarjeta };
    });

    const resumen = el("p", { class: "resumen-costo", "aria-live": "polite" });

    function reiniciar() {
      corridas = ESTRATEGIAS.map(() => ({ tamano: 0, capacidad: 2, costos: [] }));
      for (const t of tarjetas) t.lectura.textContent = AYUDA;
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
          [nombre("tamano")]: r.tamano,
          [nombre("capacidad")]: r.capacidad,
          [tr("copias", "copies")]: formato(copias),
          [tr("escrituras por llamada", "writes per call")]: r.tamano ? decimal(total / r.tamano) : "—",
        }));
        t.grafico.setAttribute("aria-label", tr(`${t.e.titulo}: ${formato(total)} escrituras en ${r.tamano} llamadas`, `${t.e.titulo}: ${formato(total)} writes in ${r.tamano} calls`));
        t.barras.forEach((b, j) => {
          const costo = r.costos[j];
          b.style.height = costo ? `${Math.max(3, (costo / maximo) * 100)}%` : "0";
          b.className = `barra-costo${costo > 1 ? " con-copias" : ""}${costo && j >= desde ? " nueva" : ""}`;
          b.title = costo ? tr(`Llamada ${j + 1}: ${costo} escritura(s)`, `Call ${j + 1}: ${costo} write(s)`) : "";
          b.tabIndex = costo ? 0 : -1;
        });
      });
      const [a, b] = corridas.map((r) => r.costos.reduce((x, y) => x + y, 0));
      const n = corridas[0].tamano;
      resumen.textContent = n < 3
        ? tr("Todavía no hubo que redimensionar: las dos estrategias empiezan con capacidad 2.", "No resizing yet: both strategies start with capacity 2.")
        : tr(`Para ${n} elementos: duplicando, ${formato(a)} escrituras; sumando 1, ${formato(b)}. ${b > a ? `Sumar 1 cuesta ${decimal(b / a)} veces más.` : ""}`,
          `For ${n} elements: doubling, ${formato(a)} writes; adding 1, ${formato(b)}. ${b > a ? `Adding 1 costs ${decimal(b / a)} times as much.` : ""}`);
      bUno.disabled = bDiez.disabled = bTodo.disabled = n >= LLAMADAS;
    }

    const bUno = el("button", { class: "boton principal", type: "button", onclick: () => agregar(1) }, el("code", { text: FUNCION.agregarAlFinal }), " × 1");
    const bDiez = el("button", { class: "boton principal", type: "button", onclick: () => agregar(10) }, "× 10");
    const bTodo = el("button", { class: "boton", type: "button", text: tr(`Hasta ${LLAMADAS}`, `Up to ${LLAMADAS}`), onclick: () => agregar(LLAMADAS) });
    caja.classList.add("panel", "experimento");
    caja.append(
      el("div", { class: "controles" }, bUno, bDiez, bTodo, el("span", { class: "separador" }),
        el("button", { class: "boton", type: "button", text: tr("Reiniciar", "Reset"), onclick: reiniciar })),
      el("div", { class: "leyenda-costo" },
        el("span", {}, el("i", { class: "muestra" }), tr("solo escribe el valor (1)", "only writes the value (1)")),
        el("span", {}, el("i", { class: "muestra con-copias" }), tr("redimensiona: copia todo y escribe", "resizes: copies everything and writes"))),
      el("div", { class: "comparacion-costo" }, tarjetas.map((t) => t.tarjeta)),
      resumen);
    reiniciar();
  }

  if (typeof document !== "undefined") montarExperimento();
})();
