// Representación de grafos: el mismo grafo guardado en una matriz de
// adyacencia y en una lista de adyacencia, las mismas operaciones en las dos,
// grafos dirigidos y cuánta memoria ocupa cada una.
(function () {
  "use strict";

  const { el } = DS;
  const SVG = "http://www.w3.org/2000/svg";
  const R = 17; // radio de cada vértice
  const N = 6;
  const PASO = 28; // casilla de la matriz y renglón de la lista (se alinean)
  const TOP = 46; // dónde empieza la fila 0 de la matriz y de la lista (al lado del grafo)
  const GX = 8; // dónde empieza el dibujo del grafo
  const FICHA = 24;
  const PASO_FICHA = 26;

  // Dónde se dibuja cada vértice (el centro, relativo al grafo).
  const LUGARES = [
    { x: 28, y: 95 }, { x: 95, y: 28 }, { x: 95, y: 162 },
    { x: 175, y: 28 }, { x: 175, y: 162 }, { x: 242, y: 95 },
  ];
  const NO_DIRIGIDO = [[0, 1], [0, 2], [1, 2], [1, 3], [2, 4], [3, 5], [4, 5]];
  const DIRIGIDO = [[0, 1], [0, 2], [1, 3], [2, 1], [3, 5], [4, 2], [5, 4]];
  const CLASE = { matriz: "GrafoMatriz", lista: "GrafoLista" };

  // Copia exacta de las funciones de ejemplos/cpp/representacion_grafos.cpp.
  const CODIGO = {
    "matriz.agregarArista": `
      bool agregarArista(int u, int v) {
          if (hayArista(u, v) || u == v) {  // hayArista valida u y v
              return false;
          }
          matriz[u][v] = 1;
          if (!dirigido) {
              matriz[v][u] = 1;
          }
          return true;
      }`,
    "matriz.eliminarArista": `
      bool eliminarArista(int u, int v) {
          if (!hayArista(u, v)) {  // hayArista valida u y v
              return false;
          }
          matriz[u][v] = 0;
          if (!dirigido) {
              matriz[v][u] = 0;
          }
          return true;
      }`,
    "matriz.hayArista": `
      bool hayArista(int u, int v) const {
          validar(u);
          validar(v);
          return matriz[u][v] == 1;
      }`,
    "matriz.vecinos": `
      std::vector<int> vecinos(int u) const {
          validar(u);
          std::vector<int> resultado;
          for (int v = 0; v < cantidadVertices(); v++) {
              if (matriz[u][v] == 1) {
                  resultado.push_back(v);
              }
          }
          return resultado;
      }`,
    "matriz.validar": `
      void validar(int u) const {
          if (u < 0 || u >= cantidadVertices()) {
              throw std::out_of_range("vértice inválido");
          }
      }`,
    "lista.agregarArista": `
      bool agregarArista(int u, int v) {
          if (hayArista(u, v) || u == v) {  // hayArista valida u y v
              return false;
          }
          adyacentes[u].push_back(v);
          if (!dirigido) {
              adyacentes[v].push_back(u);
          }
          return true;
      }`,
    "lista.eliminarArista": `
      bool eliminarArista(int u, int v) {
          if (!hayArista(u, v)) {  // hayArista valida u y v
              return false;
          }
          quitar(adyacentes[u], v);
          if (!dirigido) {
              quitar(adyacentes[v], u);
          }
          return true;
      }`,
    "lista.hayArista": `
      bool hayArista(int u, int v) const {
          validar(u);
          validar(v);
          return std::find(adyacentes[u].begin(), adyacentes[u].end(), v) != adyacentes[u].end();
      }`,
    "lista.vecinos": `
      const std::vector<int>& vecinos(int u) const {
          validar(u);
          return adyacentes[u];
      }`,
    "lista.validar": `
      void validar(int u) const {
          if (u < 0 || u >= cantidadVertices()) {
              throw std::out_of_range("vértice inválido");
          }
      }`,
    "lista.quitar": `
      static void quitar(std::vector<int>& lista, int x) {
          lista.erase(std::find(lista.begin(), lista.end(), x));
      }`,
  };

  // ------------------------------------------------------------------
  // Estado: la matriz y la lista guardan el mismo grafo
  // ------------------------------------------------------------------

  // vista: qué representación se ve ("matriz", "lista" o "ambas"). Las
  // operaciones se animan en la que se ve; la otra se pone al día al final.
  function estadoDesde(aristas, dirigido, vista, reservaResultado) {
    const s = {
      dirigido,
      vista,
      reservaResultado: !!reservaResultado,
      mat: Array.from({ length: N }, () => Array(N).fill(0)),
      ady: Array.from({ length: N }, () => []),
      resultado: null,
      siguienteId: 1,
      vis: {},
    };
    for (const [u, v] of aristas) agregarDirecto(s, u, v);
    return s;
  }

  const nuevaId = (s) => `f${s.siguienteId++}`;
  const clave = (u, v) => (u < v ? `${u}-${v}` : `${v}-${u}`);
  const lista = (xs) => (xs.length ? `{ ${xs.join(", ")} }` : "{ }");
  const esVertice = (u) => u >= 0 && u < N;

  function agregarDirecto(s, u, v) {
    if (u === v || s.mat[u][v]) return;
    s.mat[u][v] = 1;
    s.ady[u].push({ id: nuevaId(s), v });
    if (!s.dirigido) {
      s.mat[v][u] = 1;
      s.ady[v].push({ id: nuevaId(s), v: u });
    }
  }

  // Después de animar una representación, la otra pasa a guardar lo mismo
  // (cada lista conserva su orden y agrega al final lo que falta).
  function sincronizar(s, desde) {
    if (desde === "lista") {
      s.mat = s.mat.map((fila, u) => fila.map((x, v) => (s.ady[u].some((y) => y.v === v) ? 1 : 0)));
      return;
    }
    s.ady = s.ady.map((xs, u) => {
      const quedan = xs.filter((x) => s.mat[u][x.v]);
      for (let v = 0; v < N; v++) if (s.mat[u][v] && !quedan.some((x) => x.v === v)) quedan.push({ id: nuevaId(s), v });
      return quedan;
    });
  }

  const unos = (s) => s.mat.reduce((t, fila) => t + fila.reduce((a, b) => a + b, 0), 0);
  const largoListas = (s) => s.ady.reduce((t, xs) => t + xs.length, 0);
  function cantidadAristas(s) {
    const total = s.vista === "lista" ? largoListas(s) : unos(s);
    return s.dirigido ? total : total / 2;
  }

  function ver(s, vis) {
    s.vis = vis;
  }

  // ------------------------------------------------------------------
  // Operaciones animadas (rep es "matriz" o "lista")
  // ------------------------------------------------------------------

  const K = (rep, fn) => `${rep}.${fn}`;

  // validar(u): si no es un vértice, se ve el throw dentro de validar.
  function validarAnimado(s, rep, u, desde, linea, paso, vars) {
    if (esVertice(u)) return true;
    ver(s, { vars, error: true, invalido: u });
    paso(desde, linea, `validar(${u}): el grafo tiene los vértices 0 a ${N - 1}.`);
    ver(s, { vars, error: true, invalido: u });
    paso(K(rep, "validar"), 3, rep === "matriz"
      ? `${u} no es un vértice: throw std::out_of_range("vértice inválido"). Sin validar, matriz[${u}] leería fuera del vector.`
      : `${u} no es un vértice: throw std::out_of_range("vértice inválido"). Sin validar, adyacentes[${u}] leería fuera del vector.`, "error");
    return false;
  }

  // hayArista(u, v): devuelve true o false, o null si lanzó una excepción.
  function animarHay(s, rep, u, v, paso, base) {
    const C = K(rep, "hayArista");
    const vars = Object.assign({ u, v }, base);
    if (!validarAnimado(s, rep, u, C, 2, paso, vars)) return null;
    if (!validarAnimado(s, rep, v, C, 3, paso, vars)) return null;
    const hayEnGrafo = s.dirigido ? `${u}>${v}` : clave(u, v);
    if (rep === "matriz") {
      const x = s.mat[u][v];
      ver(s, { vars, u, v, fila: u, columna: v, celda: [u, v], hallado: x === 1, arista: x ? hayEnGrafo : null, fantasma: x ? null : [u, v] });
      paso(C, 4, x
        ? `matriz[${u}][${v}] es 1: hay arista. Se leyó una sola casilla, la de la fila ${u} y la columna ${v}: O(1).`
        : `matriz[${u}][${v}] es 0: no hay arista. Se leyó una sola casilla, sin recorrer nada: O(1).`);
      return x === 1;
    }
    const xs = s.ady[u];
    if (!xs.length) {
      ver(s, { vars, u, v, fila: u, fin: true, fantasma: [u, v] });
      paso(C, 4, `La lista del ${u} está vacía: std::find llega enseguida a end(). No hay arista.`);
      return false;
    }
    for (let j = 0; j < xs.length; j++) {
      const igual = xs[j].v === v;
      ver(s, { vars, u, v, fila: u, chip: j, hallado: igual, arista: igual ? hayEnGrafo : null });
      if (igual) {
        paso(C, 4, `std::find compara adyacentes[${u}][${j}] = ${v} con ${v}: ¡es! Se detiene y devuelve true, después de ${j + 1} ${j ? "comparaciones" : "comparación"}.`);
        return true;
      }
      paso(C, 4, `std::find compara adyacentes[${u}][${j}] = ${xs[j].v} con ${v}: no es, sigue con el próximo.`);
    }
    ver(s, { vars, u, v, fila: u, chip: xs.length, fin: true, fantasma: [u, v] });
    paso(C, 4, `std::find llegó a end(): el ${v} no está en la lista del ${u}. ${xs.length === 1 ? "Miró su único vecino" : `Miró los ${xs.length} vecinos`}: O(grado).`);
    return false;
  }

  function animarHayArista(s, rep, u, v, paso) {
    const r = animarHay(s, rep, u, v, paso);
    if (r === null) return;
    const vis = Object.assign({}, s.vis, { salida: String(r) });
    ver(s, vis);
    paso(K(rep, "hayArista"), 4, r
      ? `Devuelve true: ${s.dirigido ? `hay un arco del ${u} al ${v}` : `el ${u} y el ${v} son vecinos`}.`
      : `Devuelve false: ${s.dirigido ? `no hay arco del ${u} al ${v}` : `el ${u} y el ${v} no son vecinos`}.`, r ? "exito" : "");
  }

  function animarAgregar(s, rep, u, v, paso) {
    const C = K(rep, "agregarArista");
    const vars = { u, v };
    ver(s, { vars, u: esVertice(u) ? u : null, v: esVertice(v) ? v : null });
    paso(C, 2, `Primero, ¿ya está? Llama a hayArista(${u}, ${v}), que además valida los dos vértices.`);
    const hay = animarHay(s, rep, u, v, paso);
    if (hay === null) return;
    if (hay) {
      ver(s, Object.assign({}, s.vis, { vars, error: true, salida: "false", fantasma: null }));
      paso(C, 3, `hayArista devolvió true: la arista ya está. Devuelve false, sin repetirla.`, "error");
      return;
    }
    if (u === v) {
      ver(s, { vars, u, error: true, salida: "false", celda: rep === "matriz" ? [u, v] : null, fila: u });
      paso(C, 3, rep === "matriz"
        ? `u == v: sería un lazo, la casilla de la diagonal. Este grafo no los acepta: devuelve false.`
        : `u == v: sería un lazo, el ${u} en su propia lista. Este grafo no los acepta: devuelve false.`, "error");
      return;
    }
    const nombre = s.dirigido ? `${u}>${v}` : clave(u, v);
    ver(s, { vars, u, v });
    paso(C, 2, `hayArista devolvió false y u != v: la arista es nueva.`);
    if (rep === "matriz") {
      s.mat[u][v] = 1;
      ver(s, { vars, u, v, fila: u, columna: v, celda: [u, v], arista: nombre });
      paso(C, 5, `matriz[${u}][${v}] = 1: se enciende la casilla de la fila ${u}, columna ${v}. O(1): no se mueve nada más.`);
      if (s.dirigido) {
        ver(s, { vars, u, v, celda: [u, v], espejo: [v, u], arista: nombre });
        paso(C, 6, s.mat[v][u]
          ? `Es dirigido: no se toca matriz[${v}][${u}]. Ya era 1 por el arco ${v} → ${u}: ahora hay arcos en los dos sentidos.`
          : `Es dirigido: solo va del ${u} al ${v}. matriz[${v}][${u}] sigue en 0: la matriz deja de ser simétrica.`);
      } else {
        s.mat[v][u] = 1;
        ver(s, { vars, u, v, fila: v, columna: u, celda: [v, u], espejo: [u, v], arista: nombre });
        paso(C, 7, `Y su espejo, matriz[${v}][${u}] = 1: sin dirección, cada arista ocupa dos casillas y la matriz es simétrica respecto de la diagonal.`);
      }
    } else {
      s.ady[u].push({ id: nuevaId(s), v, deVertice: v });
      ver(s, { vars, u, v, fila: u, chip: s.ady[u].length - 1, nuevo: true, arista: nombre });
      paso(C, 5, `adyacentes[${u}].push_back(${v}): el ${v} entra al final de la lista del ${u}. O(1).`);
      if (s.dirigido) {
        ver(s, { vars, u, v, fila: v, arista: nombre });
        paso(C, 6, s.ady[v].some((x) => x.v === u)
          ? `Es dirigido: la lista del ${v} no se toca. Ya tenía al ${u} por el arco ${v} → ${u}: ahora hay arcos en los dos sentidos.`
          : `Es dirigido: solo va del ${u} al ${v}. La lista del ${v} no cambia.`);
      } else {
        s.ady[v].push({ id: nuevaId(s), v: u, deVertice: u });
        ver(s, { vars, u, v, fila: v, chip: s.ady[v].length - 1, nuevo: true, arista: nombre });
        paso(C, 7, `adyacentes[${v}].push_back(${u}): y el ${u} a la del ${v}. Sin dirección, cada arista aparece en dos listas.`);
      }
    }
    const e = cantidadAristas(s);
    ver(s, { vars: { aristas: e }, cambio: ["aristas"], arista: nombre, salida: "true" });
    const nombreE = s.dirigido ? "arcos" : "aristas";
    paso(C, 9, rep === "matriz"
      ? `Devuelve true. ${e} ${nombreE}: la matriz sigue teniendo ${N * N} casillas, una por cada par de vértices.`
      : `Devuelve true. ${e} ${nombreE}: las listas suman ${largoListas(s)} números${s.dirigido ? ", uno por arco" : ", el doble"}.`, "exito");
    sincronizar(s, rep);
  }

  function animarEliminar(s, rep, u, v, paso) {
    const C = K(rep, "eliminarArista");
    const vars = { u, v };
    ver(s, { vars, u: esVertice(u) ? u : null, v: esVertice(v) ? v : null });
    paso(C, 2, `Primero, ¿está? Llama a hayArista(${u}, ${v}).`);
    const hay = animarHay(s, rep, u, v, paso);
    if (hay === null) return;
    if (!hay) {
      ver(s, Object.assign({}, s.vis, { vars, error: true, salida: "false" }));
      paso(C, 3, `hayArista devolvió false: no hay nada que borrar. Devuelve false.`, "error");
      return;
    }
    const nombre = s.dirigido ? `${u}>${v}` : clave(u, v);
    ver(s, { vars, u, v, arista: nombre });
    paso(C, 2, `hayArista devolvió true: la arista existe y se puede borrar.`);
    if (rep === "matriz") {
      s.mat[u][v] = 0;
      ver(s, { vars, u, v, fila: u, columna: v, celda: [u, v], arista: nombre });
      paso(C, 5, `matriz[${u}][${v}] = 0: se apaga la casilla. O(1): la matriz no cambia de tamaño ni se mueve nada.`);
      if (!s.dirigido) {
        s.mat[v][u] = 0;
        ver(s, { vars, u, v, fila: v, columna: u, celda: [v, u], espejo: [u, v] });
        paso(C, 7, `matriz[${v}][${u}] = 0: y su espejo. La arista desaparece del grafo.`);
      }
    } else {
      quitarAnimado(s, u, v, C, 5, paso, vars, nombre);
      if (!s.dirigido) {
        ver(s, { vars, u, v, fila: v, arista: nombre });
        paso(C, 7, `Sin dirección, el ${u} también está en la lista del ${v}: quitar(adyacentes[${v}], ${u}).`);
        quitarAnimado(s, v, u, C, 7, paso, vars, null);
      }
    }
    const e = cantidadAristas(s);
    ver(s, { vars: { aristas: e }, cambio: ["aristas"], salida: "true" });
    paso(C, 9, rep === "matriz"
      ? `Devuelve true. Quedan ${e} ${s.dirigido ? "arcos" : "aristas"}, pero la matriz ocupa lo mismo: ${N * N} casillas.`
      : `Devuelve true. Quedan ${e} ${s.dirigido ? "arcos" : "aristas"} y las listas suman ${largoListas(s)} números: la lista se achica; la matriz, no.`, "exito");
    sincronizar(s, rep);
  }

  // quitar(adyacentes[u], v): std::find recorre la lista y erase corre a los de atrás.
  function quitarAnimado(s, u, v, desde, linea, paso, vars, nombre) {
    const Q = "lista.quitar";
    const xs = s.ady[u];
    const j = xs.findIndex((x) => x.v === v);
    if (desde && linea === 5) {
      ver(s, { vars, u, v, fila: u, arista: nombre });
      paso(desde, 5, `quitar(adyacentes[${u}], ${v}): hay que encontrar el ${v} en la lista del ${u} para borrarlo.`);
    }
    ver(s, { vars: { x: v }, u, fila: u, chip: j, hallado: true, condenado: xs[j].id });
    paso(Q, 2, `std::find recorre la lista del ${u} y encuentra el ${v} en la posición ${j}${j === 0 ? ", la primera" : j === 1 ? ", después de mirar el de antes" : `, después de mirar los ${j} de antes`}.`);
    const atras = xs.length - 1 - j;
    xs.splice(j, 1);
    ver(s, { vars: { x: v }, u, fila: u });
    paso(Q, 2, atras
      ? `lista.erase: el ${v} se borra y ${atras === 1 ? "el de atrás se corre" : `los ${atras} de atrás se corren`} un lugar para no dejar un hueco. O(grado).`
      : `lista.erase: el ${v} era el último, así que no hay que correr a nadie.`);
  }

  function animarVecinos(s, rep, u, paso) {
    const C = K(rep, "vecinos");
    const vars = { u };
    if (!validarAnimado(s, rep, u, C, 2, paso, vars)) return;
    if (rep === "lista") {
      const xs = s.ady[u].map((x) => x.v);
      ver(s, { vars, u, fila: u, todaFila: true, salida: lista(xs) });
      paso(C, 3, `Devuelve adyacentes[${u}] tal cual, sin copiarla: la lista ya tiene solo los vecinos, sin ceros que saltar. O(1). Recorrerla después cuesta O(grado): ${xs.length} vecino${xs.length === 1 ? "" : "s"}.`, "exito");
      return;
    }
    s.resultado = [];
    ver(s, { vars, u, fila: u });
    paso(C, 3, `resultado empieza vacío. Para saber los vecinos del ${u} hay que mirar su fila de la matriz.`);
    for (let v = 0; v < N; v++) {
      const base = { vars: { u, v }, u, fila: u, celda: [u, v], vistas: v, vueltas: { 4: v + 1 } };
      if (!s.mat[u][v]) {
        ver(s, base);
        paso(C, 5, u === v
          ? `matriz[${u}][${u}] es 0: la diagonal, sin lazos. Otra casilla que hubo que mirar.`
          : `matriz[${u}][${v}] es 0: el ${v} no es vecino, pero igual hubo que mirar la casilla.`);
        continue;
      }
      s.resultado.push({ id: nuevaId(s), v, deCelda: [u, v] });
      ver(s, Object.assign(base, { hallado: true, v, arista: s.dirigido ? `${u}>${v}` : clave(u, v) }));
      paso(C, 6, `matriz[${u}][${v}] es 1: resultado.push_back(${v}).`);
    }
    const xs = s.resultado.map((x) => x.v);
    ver(s, { vars, u, fila: u, vistas: N, salida: lista(xs), vueltas: { 4: N } });
    paso(C, 9, `Devuelve ${lista(xs)}: miró las ${N} casillas de la fila para encontrar ${xs.length} vecino${xs.length === 1 ? "" : "s"}. O(V), aunque tenga pocos.`, "exito");
  }

  // ------------------------------------------------------------------
  // Dibujo: el grafo a la izquierda, la matriz y la lista a la derecha
  // ------------------------------------------------------------------

  // Disposición del dibujo actual. En escenarios angostos el grafo se dibuja
  // más chico y, si se ven la matriz y la lista, va arriba de ellas.
  let L = { gx: GX, gy: 35, k: 1 };
  const centro = (v) => ({ x: L.gx + LUGARES[v].x * L.k, y: L.gy + LUGARES[v].y * L.k });

  function medidas(s, angosto) {
    const conMatriz = s.vista !== "lista";
    const conLista = s.vista !== "matriz";
    const k = angosto ? 0.74 : 1;
    const vertical = angosto && conMatriz && conLista;
    const top = vertical ? Math.round(4 + (162 - 28) * k + 2 * R + 46) : TOP;
    const izq = vertical ? 0 : Math.round(GX + (242 + R) * k + 20);
    const mx = izq + 26;
    const lx = conMatriz ? mx + N * PASO + 30 : izq + 10;
    const grado = Math.max(3, ...s.ady.map((xs) => xs.length));
    const ancho = conLista ? lx + 32 + grado * PASO_FICHA + 4 : mx + N * PASO + 4;
    const alto = top + N * PASO + (s.reservaResultado && conMatriz ? 58 : conLista ? PASO + 6 : 6);
    // El grafo, centrado a lo alto junto a las filas o a lo ancho arriba de ellas.
    L = vertical
      ? { k, gx: (ancho - (242 - 28) * k) / 2 - 28 * k, gy: R + 4 - 28 * k }
      : { k, gx: GX, gy: top + (N * PASO) / 2 - 95 * k };
    return { conMatriz, conLista, mx, lx, ancho, alto, top };
  }

  // Las aristas que se ven: una por par (o por arco, si es dirigido), según
  // la representación que se muestra. Sin dirección, "veces" es 1 mientras
  // solo se anotó en un lado.
  function aristasDe(s) {
    const m = new Map();
    const anotar = (u, v) => {
      const k = s.dirigido ? `${u}>${v}` : clave(u, v);
      const a = m.get(k) || { u: s.dirigido ? u : Math.min(u, v), v: s.dirigido ? v : Math.max(u, v), veces: 0 };
      a.veces++;
      m.set(k, a);
    };
    if (s.vista === "lista") s.ady.forEach((xs, u) => xs.forEach((x) => anotar(u, x.v)));
    else s.mat.forEach((fila, u) => fila.forEach((x, v) => { if (x) anotar(u, v); }));
    return m;
  }

  // Sin dirección, una línea de centro a centro. Con dirección, una flecha que
  // termina en el borde del vértice; si hay arcos en los dos sentidos, se curvan.
  function trazo(u, v, curva) {
    const a = centro(u);
    const b = centro(v);
    if (curva == null) return { d: `M ${a.x} ${a.y} L ${b.x} ${b.y}` };
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const largo = Math.hypot(dx, dy);
    const c = { x: (a.x + b.x) / 2 - (dy / largo) * curva, y: (a.y + b.y) / 2 + (dx / largo) * curva };
    const unidad = (p, q) => {
      const l = Math.hypot(q.x - p.x, q.y - p.y);
      return { x: (q.x - p.x) / l, y: (q.y - p.y) / l };
    };
    const n1 = unidad(a, c);
    const n2 = unidad(c, b);
    const inicio = { x: a.x + n1.x * R, y: a.y + n1.y * R };
    const tope = { x: b.x - n2.x * (R + 1), y: b.y - n2.y * (R + 1) };
    const base = { x: tope.x - n2.x * 9, y: tope.y - n2.y * 9 };
    const f = (p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    const d = curva ? `M ${f(inicio)} Q ${f(c)} ${f(base)}` : `M ${f(inicio)} L ${f(base)}`;
    const punta = `M ${f(tope)} L ${f({ x: base.x - n2.y * 5, y: base.y + n2.x * 5 })} L ${f({ x: base.x + n2.y * 5, y: base.y - n2.x * 5 })} Z`;
    return { d, punta };
  }

  let lienzos = 0;

  function crearLienzo(escenario) {
    const svg = document.createElementNS(SVG, "svg");
    const lienzo = el("div", { class: "lienzo-grafo lienzo-rep" }, svg);
    lienzo.dataset.n = ++lienzos;
    for (let v = 0; v < N; v++) {
      const c = centro(v);
      const vertice = el("div", { class: "gvertice", "data-v": v }, el("span", { class: "gvertice-num", text: v }));
      vertice.style.left = `${c.x - R}px`;
      vertice.style.top = `${c.y - R}px`;
      lienzo.append(vertice);
    }
    escenario.append(el("div", { class: "info-grafo", "data-alto-estable": true }), el("div", { class: "marco-grafo" }, lienzo));
    observar(escenario, lienzo);
    return lienzo;
  }

  // Si el escenario cambia de ancho (otra ventana, o el paso se muestra), se
  // vuelve a escalar; si pasa de ancho a angosto o al revés, se redibuja.
  const angostoEn = (escenario) => escenario.clientWidth > 0 && escenario.clientWidth - 32 < 560;
  function observar(escenario, lienzo) {
    if (typeof ResizeObserver === "undefined") return;
    new ResizeObserver(() => {
      if (!escenario.clientWidth) return;
      if (lienzo._estado && String(angostoEn(escenario)) !== lienzo.dataset.angosto) dibujar(escenario, lienzo._estado);
      else escalar(lienzo);
    }).observe(escenario);
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
    pieza.classList.add("saliendo");
    setTimeout(() => pieza.remove(), 450);
  }

  // Una pieza fija (título, casilla, índice) en el lienzo: la crea si falta.
  function pieza(lienzo, selector, crear) {
    let p = lienzo.querySelector(`${selector}:not(.saliendo)`);
    if (!p) {
      p = crear();
      lienzo.append(p);
    }
    return p;
  }

  const mismo = (par, u, v) => !!par && par[0] === u && par[1] === v;

  function dibujar(escenario, s) {
    const lienzo = escenario.querySelector(".lienzo-rep") || crearLienzo(escenario);
    const vis = s.vis || {};
    const angosto = angostoEn(escenario);
    const { conMatriz, conLista, mx, lx, ancho, alto, top } = medidas(s, angosto);
    lienzo._estado = s;
    lienzo.dataset.angosto = angosto;

    // Arriba: variables y valor devuelto.
    escenario.querySelector(".info-grafo").replaceChildren(
      DS.variables(vis.vars || { vértices: N, aristas: cantidadAristas(s) }, vis.cambio),
      vis.salida != null
        ? el("div", { class: "salida-valor" }, "devuelve", el("div", { class: `celda ${vis.salida === "false" ? "error" : "encontrada"}`, text: vis.salida }))
        : "");

    // Aristas del grafo.
    const svg = lienzo.querySelector("svg");
    const aristas = aristasDe(s);
    for (const g of svg.querySelectorAll("g[data-k]")) {
      if (aristas.has(g.dataset.k) || g.classList.contains("saliendo")) continue;
      g.classList.add("saliendo");
      setTimeout(() => g.remove(), 400);
    }
    for (const [k, a] of aristas) {
      let g = svg.querySelector(`g[data-k="${k}"]:not(.saliendo)`);
      const doble = s.dirigido && aristas.has(`${a.v}>${a.u}`);
      const { d, punta } = trazo(a.u, a.v, s.dirigido ? (doble ? 16 : 0) : null);
      if (!g) {
        g = document.createElementNS(SVG, "g");
        g.setAttribute("data-k", k);
        const path = document.createElementNS(SVG, "path");
        path.setAttribute("pathLength", "1");
        path.setAttribute("class", "traza");
        g.append(path);
        svg.append(g);
      }
      g.firstChild.setAttribute("d", d);
      let cabeza = g.querySelector(".punta");
      if (punta && !cabeza) {
        cabeza = document.createElementNS(SVG, "path");
        cabeza.setAttribute("class", "punta");
        g.append(cabeza);
      }
      if (cabeza) {
        if (punta) cabeza.setAttribute("d", punta);
        else cabeza.remove();
      }
      g.classList.toggle("media", !s.dirigido && a.veces < 2);
      g.classList.toggle("mirando", vis.arista === k);
      g.classList.toggle("tenue", vis.u != null && vis.todaFila === "explorar" && a.u !== vis.u && a.v !== vis.u);
    }
    // Una arista que se buscó y no está: una línea punteada que se desvanece.
    let fantasma = svg.querySelector("path.fantasma");
    if (vis.fantasma && esVertice(vis.fantasma[0]) && esVertice(vis.fantasma[1]) && vis.fantasma[0] !== vis.fantasma[1]) {
      if (!fantasma) {
        fantasma = document.createElementNS(SVG, "path");
        fantasma.setAttribute("class", "fantasma");
        svg.append(fantasma);
      }
      fantasma.setAttribute("d", trazo(vis.fantasma[0], vis.fantasma[1], null).d);
    } else if (fantasma) {
      fantasma.remove();
    }

    // Vértices.
    for (let v = 0; v < N; v++) {
      const caja = lienzo.querySelector(`.gvertice[data-v="${v}"]`);
      const c = centro(v);
      caja.style.left = `${c.x - R}px`;
      caja.style.top = `${c.y - R}px`;
      let clase = "gvertice";
      if (vis.u === v) clase += " actual";
      if (vis.v === v && vis.u !== v) clase += " mirado";
      if ((vis.vecinosDe || []).includes(v)) clase += " descubierto";
      caja.className = clase;
    }

    // Matriz: títulos, cabeceras y una casilla por par.
    const presentes = new Set();
    const fijar = (p, x, y) => {
      p.style.left = `${x}px`;
      p.style.top = `${y}px`;
      presentes.add(p);
      return p;
    };
    if (conMatriz) {
      fijar(pieza(lienzo, ".gtitulo[data-t='matriz']", () => el("span", { class: "gtitulo", "data-t": "matriz", text: "matriz[u][v]" })), mx - 24, top - 44);
      for (let k = 0; k < N; k++) {
        const col = fijar(pieza(lienzo, `.rcabecera[data-col="${k}"]`, () => el("span", { class: "rcabecera", "data-col": k, "data-k": k, text: k })), mx + k * PASO + 1, top - 20);
        col.classList.toggle("activa", vis.columna === k || !!(vis.fila != null && vis.celda && vis.celda[1] === k));
        const fil = fijar(pieza(lienzo, `.rcabecera[data-fil="${k}"]`, () => el("span", { class: "rcabecera fil", "data-fil": k, "data-k": k, text: k })), mx - 22, top + k * PASO + 1);
        fil.classList.toggle("activa", vis.fila === k);
      }
      for (let u = 0; u < N; u++) {
        for (let v = 0; v < N; v++) {
          const casilla = fijar(pieza(lienzo, `.rcasilla[data-u="${u}"][data-v="${v}"]`,
            () => el("div", { class: "rcasilla", "data-u": u, "data-v": v }, el("span", { class: "rcasilla-valor" }))), mx + v * PASO + 1, top + u * PASO + 1);
          const valor = String(s.mat[u][v]);
          const caja = casilla.querySelector(".rcasilla-valor");
          const cambia = casilla.dataset.valor != null && casilla.dataset.valor !== valor;
          caja.textContent = valor;
          casilla.dataset.valor = valor;
          let clase = "rcasilla";
          if (s.mat[u][v]) clase += " uno";
          if (u === v) clase += " diagonal";
          if (vis.fila === u) clase += " en-fila";
          if (vis.columna === v && vis.celda) clase += " en-columna";
          if (vis.vistas != null && vis.fila === u && v < vis.vistas) clase += " vista";
          if (mismo(vis.celda, u, v)) clase += vis.error ? " mala" : vis.hallado ? " hallada" : " leyendo";
          if (mismo(vis.espejo, u, v)) clase += " espejo";
          casilla.className = clase;
          if (cambia) {
            void casilla.offsetWidth;
            casilla.classList.add(valor === "1" ? "enciende" : "apaga");
          }
        }
      }
    }

    // Lista: un índice por vértice y sus fichas a la derecha.
    if (conLista) {
      fijar(pieza(lienzo, ".gtitulo[data-t='lista']", () => el("span", { class: "gtitulo", "data-t": "lista", text: "adyacentes" })), lx, conMatriz ? top - 44 : top - 22);
      for (let u = 0; u < N; u++) {
        const indice = fijar(pieza(lienzo, `.gady-indice[data-u="${u}"]`, () => el("div", { class: "gady-indice", "data-u": u, text: u })), lx, top + u * PASO + 2);
        indice.classList.toggle("leyendo", vis.fila === u);
      }
    }
    // Un vértice que no existe: una cabecera o un índice en rojo, fuera de la matriz o de la lista.
    if (vis.invalido != null && conMatriz) {
      const p = fijar(pieza(lienzo, ".rcabecera.fuera", () => el("span", { class: "rcabecera fuera" })), mx + N * PASO + 1, top - 20);
      p.textContent = vis.invalido;
    }
    if (vis.invalido != null && conLista && !conMatriz) {
      const p = fijar(pieza(lienzo, ".gady-indice.fuera", () => el("div", { class: "gady-indice fuera" })), lx, top + N * PASO + 2);
      p.textContent = vis.invalido;
    }
    // std::find llegó a end(): una casilla vacía después del último.
    if (vis.fin && conLista && vis.fila != null) {
      fijar(pieza(lienzo, ".rfin", () => el("span", { class: "rfin", text: "end" })), lx + 32 + s.ady[vis.fila].length * PASO_FICHA, top + vis.fila * PASO + 2);
    }
    if (conMatriz && s.reservaResultado) {
      fijar(pieza(lienzo, ".gtitulo[data-t='resultado']", () => el("span", { class: "gtitulo", "data-t": "resultado", text: "resultado" })), mx, top + N * PASO + 10);
      lienzo.querySelector(".gtitulo[data-t='resultado']").classList.toggle("oculto", !s.resultado);
    }
    for (const p of lienzo.querySelectorAll(".gtitulo, .rcabecera, .rcasilla, .gady-indice, .rfin")) {
      if (!presentes.has(p)) {
        p.classList.add("saliendo");
        setTimeout(() => p.remove(), 300);
      }
    }

    // Fichas que se mueven: los vecinos de cada lista y el vector resultado.
    const deseadas = [];
    if (conLista) {
      s.ady.forEach((xs, u) => xs.forEach((x, j) => {
        let clase = "gficha ady";
        if (vis.condenado === x.id) clase += " mala";
        else if (vis.fila === u && vis.todaFila) clase += " leyendo";
        else if (vis.fila === u && vis.chip === j) clase += vis.hallado ? " hallada" : vis.error ? " mala" : " leyendo";
        else if (vis.fila === u && vis.chip != null && j < vis.chip && !vis.nuevo) clase += " buscada";
        deseadas.push({ id: x.id, v: x.v, u, x: lx + 32 + j * PASO_FICHA, y: top + u * PASO + 2, clase, deVertice: x.deVertice });
      }));
    }
    if (conMatriz && s.resultado) {
      s.resultado.forEach((x, j) => {
        deseadas.push({ id: x.id, v: x.v, x: mx + j * PASO_FICHA, y: top + N * PASO + 26, clase: "gficha orden", deCelda: x.deCelda });
      });
    }
    const quedan = new Set(deseadas.map((d) => d.id));
    let nuevas = 0;
    for (const d of deseadas) {
      let ficha = lienzo.querySelector(`.gficha[data-id="${d.id}"]`);
      if (!ficha) {
        ficha = el("div", { class: d.clase, "data-id": d.id, "data-v": d.v, text: d.v });
        if (d.u != null) ficha.dataset.u = d.u;
        let origen = null;
        if (d.deVertice != null) {
          const c = centro(d.deVertice);
          origen = { x: c.x - FICHA / 2, y: c.y - FICHA / 2 };
        } else if (d.deCelda) {
          origen = { x: mx + d.deCelda[1] * PASO + 2, y: top + d.deCelda[0] * PASO + 2 };
        }
        const p = origen || d;
        ficha.style.left = `${p.x}px`;
        ficha.style.top = `${p.y}px`;
        if (!origen) ficha.classList.add("aparece");
        lienzo.append(ficha);
        nuevas++;
      }
      ficha.className = d.clase + (ficha.classList.contains("aparece") ? " aparece" : "");
      ficha._destino = d;
    }
    for (const ficha of lienzo.querySelectorAll(".gficha[data-id]")) if (!quedan.has(ficha.dataset.id)) retirar(ficha);
    if (nuevas) void lienzo.offsetWidth; // que las nuevas arranquen desde su origen
    for (const ficha of lienzo.querySelectorAll(".gficha[data-id]")) {
      const d = ficha._destino;
      if (!d) continue;
      ficha.style.left = `${d.x}px`;
      ficha.style.top = `${d.y}px`;
    }

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
  // Paso 1: explorador (tocar un vértice o una casilla)
  // ------------------------------------------------------------------

  function montarExplorador() {
    const caja = document.getElementById("explorador");
    if (!caja) return;
    const s = estadoDesde(NO_DIRIGIDO, false, "ambas");
    const escenario = el("div", { class: "escenario explorable" });
    const relaciones = el("div", { class: "relaciones", "aria-live": "polite" });
    let actual = 2;

    const fila = (nombre, cuenta, valor, motivo, ausente) => el("div", { class: `relacion${ausente ? " ausente" : " seleccionada"}` },
      el("span", { class: "relacion-nombre", text: nombre }),
      el("code", { class: "relacion-cuenta", text: cuenta }),
      valor != null ? el("span", { class: "relacion-valor" }, el("span", { class: "relacion-celda", text: valor })) : el("span", { class: "relacion-motivo", text: motivo }));

    function verVertice(u) {
      actual = (u + N) % N;
      const vecinos = s.ady[actual].map((x) => x.v);
      s.vis = { u: actual, fila: actual, todaFila: "explorar", vecinosDe: vecinos };
      dibujar(escenario, s);
      relaciones.replaceChildren(
        fila("matriz", `fila ${actual}: ${s.mat[actual].join(" ")}`, null, `${N} casillas, ${vecinos.length} con 1`),
        fila("lista", `adyacentes[${actual}] = ${lista(vecinos)}`, null, `${vecinos.length} número${vecinos.length === 1 ? "" : "s"}, sin ceros`));
    }

    function verPar(u, v) {
      actual = u;
      const hay = s.mat[u][v] === 1;
      const j = s.ady[u].findIndex((x) => x.v === v);
      s.vis = { u, v, celda: [u, v], espejo: u !== v ? [v, u] : null, hallado: hay, fila: u, columna: v, chip: j >= 0 ? j : null,
        arista: hay ? clave(u, v) : null, fantasma: hay ? null : [u, v] };
      dibujar(escenario, s);
      relaciones.replaceChildren(
        fila("matriz", u === v ? `matriz[${u}][${v}] = 0` : `matriz[${u}][${v}] = ${s.mat[u][v]} y matriz[${v}][${u}] = ${s.mat[v][u]}`, null,
          u === v ? "la diagonal: sin lazos" : hay ? "una casilla: O(1)" : "no hay arista", !hay),
        fila("lista", hay ? `adyacentes[${u}][${j}] = ${v}` : `${v} no está en adyacentes[${u}]`, null,
          hay ? `std::find miró ${j + 1} de ${s.ady[u].length}` : `std::find miró los ${s.ady[u].length}`, !hay));
    }

    escenario.addEventListener("click", (ev) => {
      const t = ev.target;
      const vertice = t.closest(".gvertice");
      if (vertice) return verVertice(Number(vertice.dataset.v));
      const casilla = t.closest(".rcasilla");
      if (casilla) return verPar(Number(casilla.dataset.u), Number(casilla.dataset.v));
      const ficha = t.closest(".gficha");
      if (ficha && ficha.dataset.u != null) return verPar(Number(ficha.dataset.u), Number(ficha.dataset.v));
      const indice = t.closest(".gady-indice, .rcabecera");
      if (indice) return verVertice(Number(indice.dataset.u != null ? indice.dataset.u : indice.dataset.k));
      return undefined;
    });
    caja.classList.add("panel", "explorador");
    caja.append(escenario, relaciones, el("div", { class: "reproduccion" },
      el("button", { class: "boton", type: "button", "aria-label": "Vértice anterior", text: "‹ u − 1", onclick: () => verVertice(actual - 1) }),
      el("span", { text: "Toca un vértice, una casilla o un número de la lista" }),
      el("button", { class: "boton", type: "button", "aria-label": "Vértice siguiente", text: "u + 1 ›", onclick: () => verVertice(actual + 1) })));
    verVertice(actual);
  }

  // ------------------------------------------------------------------
  // Experimento: cuánta memoria ocupa cada una
  // ------------------------------------------------------------------

  const V_MAX = 24;
  // Cada par tiene un número fijo al azar: el par es arista si su número es
  // menor que la densidad. Así, al mover V o la densidad, lo que ya estaba
  // se queda y solo aparece (o se va) lo que cambia.
  const AZAR = (() => {
    let semilla = 7;
    const r = () => {
      semilla = (semilla * 16807) % 2147483647;
      return (semilla - 1) / 2147483646;
    };
    return Array.from({ length: V_MAX }, () => Array.from({ length: V_MAX }, r));
  })();
  const esArista = (u, v, densidad) => u !== v && AZAR[Math.min(u, v)][Math.max(u, v)] < densidad;

  const formato = (x) => x.toLocaleString("es");
  function bytes(b) {
    const unidades = ["bytes", "KB", "MB", "GB", "TB"];
    let k = 0;
    while (b >= 1000 && k < unidades.length - 1) {
      b /= 1000;
      k++;
    }
    return `${b >= 100 || k === 0 ? Math.round(b) : b.toFixed(1).replace(".", ",")} ${unidades[k]}`;
  }

  function montarMemoria() {
    const caja = document.getElementById("experimento-memoria");
    if (!caja) return;
    const deslizador = (etiqueta, min, max, valor, paso) => {
      const input = el("input", { type: "range", min, max, step: paso || 1, "aria-label": etiqueta });
      input.value = valor;
      const salida = el("output", { class: "rmem-valor" });
      return { input, salida, campo: el("label", { class: "rmem-campo" }, el("span", { text: etiqueta }), input, salida) };
    };
    const dV = deslizador("Vértices V", 4, V_MAX, 12);
    const dD = deslizador("Densidad", 0, 100, 20, 5);
    const matriz = el("div", { class: "rmem-matriz", "aria-hidden": "true" });
    const listas = el("div", { class: "rmem-listas", "aria-hidden": "true" });
    const cuentaM = el("p", { class: "rmem-cuenta" });
    const cuentaL = el("p", { class: "rmem-cuenta" });
    const escala = el("p", { class: "rmem-escala", "aria-live": "polite" });

    function actualizar() {
      const n = Number(dV.input.value);
      const densidad = Number(dD.input.value) / 100;
      dV.salida.textContent = n;
      dD.salida.textContent = `${dD.input.value} %`;
      let e = 0;
      // La matriz: n × n cuadritos; los que existen siguen siendo los mismos.
      matriz.style.setProperty("--n", n);
      listas.style.setProperty("--n", n);
      const quedan = new Set();
      for (let u = 0; u < n; u++) {
        for (let v = 0; v < n; v++) {
          const k = `${u}-${v}`;
          quedan.add(k);
          let c = matriz.querySelector(`[data-k="${k}"]`);
          if (!c) {
            c = el("span", { class: "rmem-c nueva", "data-k": k });
            matriz.append(c);
          }
          c.style.gridRow = u + 1;
          c.style.gridColumn = v + 1;
          const si = esArista(u, v, densidad);
          if (si && u < v) e++;
          c.classList.toggle("uno", si);
        }
      }
      for (const c of matriz.querySelectorAll("[data-k]")) if (!quedan.has(c.dataset.k)) c.remove();
      // Las listas: un renglón por vértice con un cuadrito por vecino.
      while (listas.children.length > n) listas.lastChild.remove();
      for (let u = 0; u < n; u++) {
        let renglon = listas.children[u];
        if (!renglon) {
          renglon = el("div", { class: "rmem-renglon" }, el("span", { class: "rmem-indice", text: u }));
          listas.append(renglon);
        }
        const vecinos = [];
        for (let v = 0; v < n; v++) if (esArista(u, v, densidad)) vecinos.push(v);
        const fichas = [...renglon.querySelectorAll(".rmem-f")];
        for (const f of fichas) if (!vecinos.includes(Number(f.dataset.v))) f.remove();
        for (const v of vecinos) {
          if (!renglon.querySelector(`.rmem-f[data-v="${v}"]`)) renglon.append(el("span", { class: "rmem-f", "data-v": v }));
        }
        // En el orden de los vecinos.
        for (const v of vecinos) renglon.append(renglon.querySelector(`.rmem-f[data-v="${v}"]`));
      }
      cuentaM.replaceChildren(el("strong", { text: "Matriz: " }), `V² = ${formato(n * n)} casillas, ${formato(2 * e)} con 1`);
      cuentaL.replaceChildren(el("strong", { text: "Lista: " }), `${n} listas con 2E = ${formato(2 * e)} números`);
      // A escala real: un millón de vértices con el mismo grado promedio.
      const grado = n > 1 ? (2 * e) / n : 0;
      const V = 1e6;
      const enMatriz = V * V * 4;
      const enLista = V * 24 + V * grado * 4;
      escala.replaceChildren("Con ", el("strong", { text: "1 000 000 de vértices" }), ` y el mismo grado promedio (${grado.toFixed(1).replace(".", ",")} vecinos), la matriz de int ocupa `,
        el("strong", { class: "rmem-malo", text: bytes(enMatriz) }), " y la lista, ", el("strong", { class: "rmem-bueno", text: bytes(enLista) }), ".");
    }

    dV.input.addEventListener("input", actualizar);
    dD.input.addEventListener("input", actualizar);
    caja.classList.add("panel", "rmem");
    caja.append(
      el("div", { class: "rmem-controles" }, dV.campo, dD.campo),
      el("div", { class: "rmem-dibujos" },
        el("div", { class: "rmem-lado" }, cuentaM, matriz),
        el("div", { class: "rmem-lado" }, cuentaL, listas)),
      escala);
    actualizar();
  }

  if (typeof document !== "undefined") {
    montarExplorador();
    montarMemoria();
  }

  // ------------------------------------------------------------------
  // Visualizadores de la lección
  // ------------------------------------------------------------------

  const U = { id: "u", etiqueta: "u", min: 0, max: 9, valor: 0 };
  const V = { id: "v", etiqueta: "v", min: 0, max: 9, valor: 5 };
  const REP = { id: "rep", etiqueta: "Representación", opciones: [["lista", "lista de adyacencia"], ["matriz", "matriz de adyacencia"]] };

  // Cada operación corre en la representación que se ve. Su fragmento
  // depende de esa representación: codigo es un getter que la consulta.
  function operaciones(ids, repDe) {
    const DEF = {
      agregarArista: { etiqueta: "agregarArista(u, v)", usa: ["u", "v"], correr: (s, a, paso) => animarAgregar(s, s.vista, a.u, a.v, paso) },
      eliminarArista: { etiqueta: "eliminarArista(u, v)", usa: ["u", "v"], correr: (s, a, paso) => animarEliminar(s, s.vista, a.u, a.v, paso) },
      hayArista: { etiqueta: "hayArista(u, v)", usa: ["u", "v"], correr: (s, a, paso) => animarHayArista(s, s.vista, a.u, a.v, paso) },
      vecinos: { etiqueta: "vecinos(u)", usa: ["u"], correr: (s, a, paso) => animarVecinos(s, s.vista, a.u, paso) },
    };
    return ids.map((id) => ({
      id,
      etiqueta: DEF[id].etiqueta,
      usa: DEF[id].usa,
      get codigo() { return K(repDe(), id); },
      ejecutar(s, args, paso) {
        s.resultado = null;
        DEF[id].correr(s, args, paso);
      },
    }));
  }

  function visualizador(contenedor, opciones) {
    const reps = opciones.reps;
    let rep = reps[0];
    const claves = [];
    for (const r of reps) {
      for (const fn of ["agregarArista", "eliminarArista", "hayArista", "vecinos", "validar", "quitar"]) {
        const k = K(r, fn);
        // agregarArista y eliminarArista llaman a hayArista; eliminarArista, a quitar.
        const usada = fn === "validar" || opciones.ops.includes(fn)
          || (fn === "hayArista" && opciones.ops.some((o) => o !== "vecinos"))
          || (fn === "quitar" && opciones.ops.includes("eliminarArista"));
        if (CODIGO[k] && usada) claves.push(k);
      }
    }
    const entradas = (opciones.entradas || []).map((e) => (e.id !== "rep" ? e : Object.assign({}, e, {
      alCambiar(estado, valores) {
        rep = valores.rep;
        const nuevo = Object.assign({}, estado, { vista: rep, resultado: null, vis: {} });
        return { estado: nuevo, mensaje: opciones.mensajeInicial(valores) };
      },
    })));
    DS.tema({
      contenedor,
      incremental: true,
      dibujar,
      codigo: Object.fromEntries(claves.map((k) => [k, CODIGO[k]])),
      tituloCodigo: (k) => `${CLASE[k.split(".")[0]]}::${k.split(".")[1]}()`,
      mensajeInicial: opciones.mensajeInicial,
      estadoInicial: (valores) => {
        if (valores.rep) rep = valores.rep;
        const dirigido = valores.tipo ? valores.tipo === "dirigido" : !!opciones.dirigido;
        return estadoDesde(dirigido ? DIRIGIDO : NO_DIRIGIDO, dirigido, rep, opciones.ops.includes("vecinos"));
      },
      entradas,
      operaciones: operaciones(opciones.ops, () => rep),
    });
  }

  // Paso 2: matriz de adyacencia.
  visualizador("vis-matriz", {
    reps: ["matriz"],
    ops: ["agregarArista", "hayArista", "vecinos"],
    entradas: [Object.assign({}, U, { valor: 0 }), Object.assign({}, V, { valor: 5 })],
    mensajeInicial: () => "Agrega la arista 0–5: mira cómo se encienden dos casillas. Prueba también hayArista y vecinos(5), que mira la fila entera.",
  });

  // Paso 3: lista de adyacencia.
  visualizador("vis-lista", {
    reps: ["lista"],
    ops: ["agregarArista", "hayArista", "vecinos"],
    entradas: [Object.assign({}, U, { valor: 0 }), Object.assign({}, V, { valor: 5 })],
    mensajeInicial: () => "Agrega la arista 0–5: cada vértice va al final de la lista del otro. Prueba hayArista(2, 4) y hayArista(2, 3): std::find recorre la lista.",
  });

  // Paso 4: eliminar en las dos.
  visualizador("vis-eliminar", {
    reps: ["lista", "matriz"],
    ops: ["eliminarArista"],
    entradas: [REP, Object.assign({}, U, { valor: 1 }), Object.assign({}, V, { valor: 0 })],
    mensajeInicial: ({ rep }) => (rep === "matriz"
      ? "En la matriz, borrar es apagar dos casillas. Elimina la arista 1–0 y compara con la lista."
      : "Elimina la arista 1–0: el número se busca, se borra y los de atrás se corren. Cambia a la matriz para comparar."),
  });

  // Paso 6: dirigido.
  visualizador("vis-dirigido", {
    reps: ["matriz", "lista"],
    ops: ["agregarArista", "hayArista", "vecinos"],
    dirigido: true,
    entradas: [Object.assign({}, REP, { opciones: [REP.opciones[1], REP.opciones[0]] }), Object.assign({}, U, { valor: 1 }), Object.assign({}, V, { valor: 2 })],
    mensajeInicial: ({ rep }) => (rep === "matriz"
      ? "Cada 1 es un arco de la fila a la columna. Agrega el arco 1 → 2 (ya está 2 → 1) y mira que la matriz no es simétrica. Cambia a la lista para comparar."
      : "Cada arco va solo en la lista de donde sale. Agrega el arco 1 → 2 (ya está 2 → 1). Cambia a la matriz para comparar."),
  });

  // Paso 7: todo junto.
  visualizador("vis-todo", {
    reps: ["lista", "matriz"],
    ops: ["agregarArista", "eliminarArista", "hayArista", "vecinos"],
    entradas: [REP, { id: "tipo", etiqueta: "Tipo", opciones: [["no-dirigido", "no dirigido"], ["dirigido", "dirigido"]] }, Object.assign({}, U, { valor: 0 }), Object.assign({}, V, { valor: 3 })],
    mensajeInicial: ({ rep }) => `Arma tu grafo en la ${rep === "matriz" ? "matriz" : "lista"} y cambia de representación cuando quieras: el grafo es el mismo, guardado de otra manera.`,
  });
})();
