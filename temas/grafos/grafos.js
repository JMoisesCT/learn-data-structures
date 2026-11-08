// Grafos: lista de adyacencia, BFS con una cola, distancias, DFS con una pila
// y con recursión, y componentes conexas.
(function () {
  "use strict";

  const { el } = DS;
  const SVG = "http://www.w3.org/2000/svg";
  const R = 17; // radio de cada vértice
  const GX = 24; // dónde empieza el dibujo del grafo
  const GY = 34;
  const ADY_X = 336; // la lista de adyacencia, a la derecha del grafo
  const ADY_Y = 20;
  const FILA = 28;
  const FICHA = 24;
  const PASO_FICHA = 26;
  const FILA_EST = 64; // alto de cada estructura (cola, visitado, orden…)

  // Dónde se dibuja cada vértice (el centro, relativo al grafo).
  const LUGARES = [
    { x: 30, y: 105 }, { x: 105, y: 30 }, { x: 105, y: 180 }, { x: 180, y: 30 },
    { x: 180, y: 105 }, { x: 180, y: 180 }, { x: 255, y: 105 }, { x: 255, y: 180 },
  ];
  const N = LUGARES.length;
  const EJEMPLO = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 4], [2, 5], [3, 6], [4, 6], [5, 7], [6, 7]];
  const ISLAS = [[0, 1], [1, 2], [0, 2], [3, 4], [5, 6], [6, 7]];

  // Copia exacta de las funciones de ejemplos/cpp/grafos.cpp.
  const CODIGO = {
    agregarArista: `
      bool agregarArista(int u, int v) {
          validar(u);
          validar(v);
          if (u == v || std::find(adyacentes[u].begin(), adyacentes[u].end(), v) != adyacentes[u].end()) {
              return false;
          }
          adyacentes[u].push_back(v);
          adyacentes[v].push_back(u);
          return true;
      }`,
    validar: `
      void validar(int u) const {
          if (u < 0 || u >= cantidadVertices()) {
              throw std::out_of_range("vértice inválido");
          }
      }`,
    bfs: `
      std::vector<int> bfs(int origen) const {
          validar(origen);
          std::vector<bool> visitado(adyacentes.size(), false);
          std::vector<int> orden;
          std::queue<int> cola;
          visitado[origen] = true;
          cola.push(origen);
          while (!cola.empty()) {
              int u = cola.front();
              cola.pop();
              orden.push_back(u);
              for (int v : adyacentes[u]) {
                  if (!visitado[v]) {
                      visitado[v] = true;
                      cola.push(v);
                  }
              }
          }
          return orden;
      }`,
    distancias: `
      std::vector<int> distancias(int origen) const {
          validar(origen);
          std::vector<int> dist(adyacentes.size(), -1);
          std::queue<int> cola;
          dist[origen] = 0;
          cola.push(origen);
          while (!cola.empty()) {
              int u = cola.front();
              cola.pop();
              for (int v : adyacentes[u]) {
                  if (dist[v] == -1) {
                      dist[v] = dist[u] + 1;
                      cola.push(v);
                  }
              }
          }
          return dist;
      }`,
    dfs: `
      std::vector<int> dfs(int origen) const {
          validar(origen);
          std::vector<bool> visitado(adyacentes.size(), false);
          std::vector<int> orden;
          std::stack<int> pila;
          pila.push(origen);
          while (!pila.empty()) {
              int u = pila.top();
              pila.pop();
              if (visitado[u]) {
                  continue;  // ya se visitó por otro camino
              }
              visitado[u] = true;
              orden.push_back(u);
              // Al revés, para que el primer vecino quede arriba y salga primero.
              for (auto it = adyacentes[u].rbegin(); it != adyacentes[u].rend(); ++it) {
                  if (!visitado[*it]) {
                      pila.push(*it);
                  }
              }
          }
          return orden;
      }`,
    dfsRecursivo: `
      std::vector<int> dfsRecursivo(int origen) const {
          validar(origen);
          std::vector<bool> visitado(adyacentes.size(), false);
          std::vector<int> orden;
          visitar(origen, visitado, orden);
          return orden;
      }`,
    visitar: `
      void visitar(int u, std::vector<bool>& visitado, std::vector<int>& orden) const {
          visitado[u] = true;
          orden.push_back(u);
          for (int v : adyacentes[u]) {
              if (!visitado[v]) {
                  visitar(v, visitado, orden);
              }
          }
      }`,
    contarComponentes: `
      int contarComponentes() const {
          std::vector<bool> visitado(adyacentes.size(), false);
          std::vector<int> orden;
          int componentes = 0;
          for (int u = 0; u < cantidadVertices(); u++) {
              if (!visitado[u]) {
                  visitar(u, visitado, orden);
                  componentes++;
              }
          }
          return componentes;
      }`,
  };

  // ------------------------------------------------------------------
  // Estado: la lista de adyacencia, las estructuras del recorrido y marcas
  // ------------------------------------------------------------------

  function estadoDesde(aristas) {
    const s = { ady: Array.from({ length: N }, () => []), est: {}, rec: limpioRec(), siguienteId: 1, vis: {} };
    for (const [u, v] of aristas) {
      s.ady[u].push(v);
      s.ady[v].push(u);
    }
    return s;
  }

  function limpioRec() {
    return { estado: Array(N).fill(""), arbol: [], comp: Array(N).fill(-1) };
  }

  // Cada recorrido empieza con las estructuras y las marcas vacías.
  function empezar(s, estructuras) {
    s.est = estructuras;
    s.rec = limpioRec();
  }

  const clave = (u, v) => (u < v ? `${u}-${v}` : `${v}-${u}`);
  const nuevaId = (s, prefijo) => `${prefijo}${s.siguienteId++}`;
  const lista = (xs) => (xs.length ? `{ ${xs.join(", ")} }` : "{ }");
  const textoCola = (s, k) => lista(s.est[k].map((x) => x.v));

  function ver(s, vis) {
    s.vis = vis;
  }

  // validar(u): si no es un vértice, se ve el throw dentro de validar.
  function validarAnimado(s, u, C, linea, paso, vars) {
    if (u >= 0 && u < N) return true;
    ver(s, { vars, error: true });
    paso(C, linea, `validar(${u}): el grafo tiene los vértices 0 a ${N - 1}.`);
    ver(s, { vars, error: true, invalido: true });
    paso("validar", 3, `${u} no es un vértice: throw std::out_of_range("vértice inválido"). Sin validar, adyacentes[${u}] leería memoria fuera del vector.`, "error");
    return false;
  }

  // ------------------------------------------------------------------
  // agregarArista(u, v)
  // ------------------------------------------------------------------

  function animarAgregar(s, u, v, paso) {
    const C = "agregarArista";
    empezar(s, {});
    const vars = { u, v };
    if (!validarAnimado(s, u, C, 2, paso, vars)) return;
    if (!validarAnimado(s, v, C, 3, paso, vars)) return;
    if (u === v) {
      ver(s, { vars, u, error: true, salida: "false" });
      paso(C, 5, `u == v: sería un lazo, una arista del ${u} a sí mismo. Este grafo no los acepta: devuelve false.`, "error");
      return;
    }
    const j = s.ady[u].indexOf(v);
    if (j >= 0) {
      ver(s, { vars, u, v, fila: u, buscando: s.ady[u].slice(0, j + 1), chip: j, arista: clave(u, v), error: true, salida: "false" });
      paso(C, 5, `std::find recorre la lista del ${u} y encuentra el ${v} en la posición ${j}: la arista ya está. Devuelve false.`, "error");
      return;
    }
    ver(s, { vars, u, v, fila: u, buscando: s.ady[u].slice() });
    paso(C, 4, s.ady[u].length
      ? `std::find recorre la lista del ${u} (${s.ady[u].length} vecino${s.ady[u].length === 1 ? "" : "s"}) y no encuentra el ${v}: O(grado). La arista es nueva.`
      : `La lista del ${u} está vacía: std::find no encuentra nada. La arista es nueva.`);
    s.ady[u].push(v);
    ver(s, { vars, u, v, fila: u, chip: s.ady[u].length - 1, desdeVertice: v });
    paso(C, 7, `adyacentes[${u}].push_back(${v}): el ${v} entra a la lista del ${u}. Con eso solo, se podría ir del ${u} al ${v}, pero no volver.`);
    s.ady[v].push(u);
    ver(s, { vars, u, v, fila: v, chip: s.ady[v].length - 1, desdeVertice: u, arista: clave(u, v) });
    paso(C, 8, `adyacentes[${v}].push_back(${u}): y el ${u} a la del ${v}. Como es no dirigido, cada arista aparece dos veces en las listas.`);
    const e = EJE(s);
    ver(s, { vars: { aristas: e }, arista: clave(u, v), salida: "true" });
    paso(C, 9, `Devuelve true. ${e} aristas: la suma de los largos de las listas es ${2 * e}, el doble.`, "exito");
  }

  const EJE = (s) => s.ady.reduce((t, xs) => t + xs.length, 0) / 2;

  // ------------------------------------------------------------------
  // bfs(origen) y distancias(origen): con una cola
  // ------------------------------------------------------------------

  function animarBfs(s, origen, paso) {
    const C = "bfs";
    empezar(s, {});
    if (!validarAnimado(s, origen, C, 2, paso, { origen })) return;
    empezar(s, { visitado: Array(N).fill(false), orden: [], cola: [] });
    const { est, rec } = s;
    const vars = (extra) => Object.assign({ origen }, extra);
    ver(s, { vars: vars() });
    paso(C, 5, "visitado empieza todo en false; orden y cola, vacíos.");
    est.visitado[origen] = true;
    est.cola.push({ id: nuevaId(s, "c"), v: origen });
    rec.estado[origen] = "descubierto";
    ver(s, { vars: vars(), desdeVertice: origen, marcado: origen });
    paso(C, 7, `visitado[${origen}] = true y cola.push(${origen}): el origen es el primero en la cola. Se marca al entrar, así nadie lo vuelve a encolar.`);
    let vuelta = 0;
    while (est.cola.length) {
      vuelta++;
      const sale = est.cola.shift();
      const u = sale.v;
      ver(s, { vars: vars({ u }), u, vueltas: { 8: vuelta } });
      paso(C, 10, `u = cola.front() y cola.pop(): sale el ${u}, el que lleva más tiempo esperando. cola = ${textoCola(s, "cola")}.`);
      est.orden.push({ id: nuevaId(s, "o"), v: u, de: sale.id });
      rec.estado[u] = "hecho";
      ver(s, { vars: vars({ u }), u, fila: u, vueltas: { 8: vuelta } });
      paso(C, 11, `orden.push_back(${u}): orden = ${textoCola(s, "orden")}. Ahora se miran sus ${s.ady[u].length} vecinos, en el orden de su lista.`);
      if (!s.ady[u].length) {
        ver(s, { vars: vars({ u }), u, fila: u, vueltas: { 8: vuelta, 12: 0 } });
        paso(C, 12, `La lista del ${u} está vacía: no tiene vecinos.`);
      }
      s.ady[u].forEach((v, j) => {
        const base = { vars: vars({ u, v }), u, v, fila: u, chip: j, arista: clave(u, v), vueltas: { 8: vuelta, 12: j + 1 } };
        if (est.visitado[v]) {
          ver(s, base);
          paso(C, 13, `¿visitado[${v}]? Sí: el ${v} ya ${rec.estado[v] === "hecho" ? "salió de la cola" : "está en la cola"}. Se salta.`);
          return;
        }
        est.visitado[v] = true;
        est.cola.push({ id: nuevaId(s, "c"), v, de: `a${u}-${v}` });
        rec.estado[v] = "descubierto";
        rec.arbol.push(clave(u, v));
        ver(s, Object.assign(base, { marcado: v }));
        paso(C, 15, `¿visitado[${v}]? No: visitado[${v}] = true y cola.push(${v}). Espera detrás de los que ya estaban: cola = ${textoCola(s, "cola")}.`);
      });
    }
    const faltan = est.visitado.map((x, k) => (x ? null : k)).filter((k) => k != null);
    ver(s, { vars: vars(), salida: lista(est.orden.map((x) => x.v)), vueltas: { 8: vuelta } });
    paso(C, 19, faltan.length
      ? `La cola quedó vacía: devuelve orden. No se llegó a ${faltan.join(", ")}: no hay camino desde el ${origen}.`
      : `La cola quedó vacía: devuelve orden. Primero el ${origen}, después sus vecinos, después los vecinos de esos… por capas.`, "exito");
  }

  function animarDistancias(s, origen, paso) {
    const C = "distancias";
    empezar(s, {});
    if (!validarAnimado(s, origen, C, 2, paso, { origen })) return;
    empezar(s, { dist: Array(N).fill(-1), cola: [] });
    const { est, rec } = s;
    const vars = (extra) => Object.assign({ origen }, extra);
    ver(s, { vars: vars() });
    paso(C, 4, "dist empieza todo en −1 (todavía no se llegó) y la cola, vacía. dist hace de visitado.");
    est.dist[origen] = 0;
    est.cola.push({ id: nuevaId(s, "c"), v: origen });
    rec.estado[origen] = "descubierto";
    ver(s, { vars: vars(), desdeVertice: origen, marcado: origen });
    paso(C, 6, `dist[${origen}] = 0 y cola.push(${origen}): el origen está a 0 aristas de sí mismo.`);
    let vuelta = 0;
    while (est.cola.length) {
      vuelta++;
      const u = est.cola.shift().v;
      rec.estado[u] = "hecho";
      ver(s, { vars: vars({ u }), u, fila: u, vueltas: { 7: vuelta } });
      paso(C, 9, `Sale el ${u}, a distancia ${est.dist[u]}. Sus vecinos sin distancia quedan a ${est.dist[u] + 1}.`);
      s.ady[u].forEach((v, j) => {
        const base = { vars: vars({ u, v }), u, v, fila: u, chip: j, arista: clave(u, v), vueltas: { 7: vuelta, 10: j + 1 } };
        if (est.dist[v] !== -1) {
          ver(s, base);
          paso(C, 11, `dist[${v}] ya es ${est.dist[v]}: se llegó antes por un camino igual o más corto. Se salta.`);
          return;
        }
        est.dist[v] = est.dist[u] + 1;
        est.cola.push({ id: nuevaId(s, "c"), v, de: `a${u}-${v}` });
        rec.estado[v] = "descubierto";
        rec.arbol.push(clave(u, v));
        ver(s, Object.assign(base, { marcado: v }));
        paso(C, 13, `dist[${v}] = dist[${u}] + 1 = ${est.dist[v]} y cola.push(${v}). La cola siempre tiene la capa actual delante de la siguiente.`);
      });
    }
    ver(s, { vars: vars(), salida: lista(est.dist), vueltas: { 7: vuelta } });
    const lejos = Math.max(...est.dist);
    paso(C, 17, est.dist.includes(-1)
      ? `Devuelve dist. Los −1 no tienen camino desde el ${origen}; el más lejano está a ${lejos} arista${lejos === 1 ? "" : "s"}.`
      : `Devuelve dist: cada número es el camino más corto (en aristas) desde el ${origen}. El más lejano está a ${lejos}.`, "exito");
  }

  // ------------------------------------------------------------------
  // dfs(origen): con una pila
  // ------------------------------------------------------------------

  function animarDfs(s, origen, paso) {
    const C = "dfs";
    empezar(s, {});
    if (!validarAnimado(s, origen, C, 2, paso, { origen })) return;
    empezar(s, { visitado: Array(N).fill(false), orden: [], pila: [] });
    const { est, rec } = s;
    const vars = (extra) => Object.assign({ origen }, extra);
    ver(s, { vars: vars() });
    paso(C, 5, "visitado empieza todo en false; orden y pila, vacíos.");
    est.pila.push({ id: nuevaId(s, "p"), v: origen, padre: null });
    rec.estado[origen] = "descubierto";
    ver(s, { vars: vars(), desdeVertice: origen });
    paso(C, 6, `pila.push(${origen}): el origen es el primero en la pila. Todavía no se marca: se marca al salir.`);
    let vuelta = 0;
    while (est.pila.length) {
      vuelta++;
      const sale = est.pila.pop();
      const u = sale.v;
      if (est.visitado[u]) {
        ver(s, { vars: vars({ u }), u, vueltas: { 7: vuelta }, repetido: true });
        paso(C, 11, `Sale el ${u} (pila.top() y pila.pop()), pero ya está visitado: entró dos veces a la pila. continue: se descarta.`);
        continue;
      }
      ver(s, { vars: vars({ u }), u, vueltas: { 7: vuelta } });
      paso(C, 9, `u = pila.top() y pila.pop(): sale el ${u}, el último que entró. pila = ${textoCola(s, "pila")}.`);
      est.visitado[u] = true;
      est.orden.push({ id: nuevaId(s, "o"), v: u, de: sale.id });
      rec.estado[u] = "hecho";
      if (sale.padre != null) rec.arbol.push(clave(sale.padre, u));
      ver(s, { vars: vars({ u }), u, fila: u, marcado: u, vueltas: { 7: vuelta } });
      paso(C, 14, `visitado[${u}] = true y orden.push_back(${u}): orden = ${textoCola(s, "orden")}.`);
      const vecinos = s.ady[u];
      for (let j = vecinos.length - 1, k = 1; j >= 0; j--, k++) {
        const v = vecinos[j];
        const base = { vars: vars({ u, "*it": v }), u, v, fila: u, chip: j, arista: clave(u, v), vueltas: { 7: vuelta, 16: k } };
        if (est.visitado[v]) {
          ver(s, base);
          paso(C, 17, `*it = ${v}: ya visitado, no se apila.`);
          continue;
        }
        est.pila.push({ id: nuevaId(s, "p"), v, padre: u, de: `a${u}-${v}` });
        if (rec.estado[v] !== "hecho") rec.estado[v] = "descubierto";
        ver(s, base);
        paso(C, 18, `*it = ${v}: no visitado, pila.push(${v})${j === 0 ? `. Fue el último en entrar: es el primer vecino de la lista y sale primero` : ""}. pila = ${textoCola(s, "pila")}.`);
      }
    }
    ver(s, { vars: vars(), salida: lista(est.orden.map((x) => x.v)), vueltas: { 7: vuelta } });
    paso(C, 22, `La pila quedó vacía: devuelve orden. Fue por un camino hasta el fondo antes de volver: ${lista(est.orden.map((x) => x.v))}.`, "exito");
  }

  // ------------------------------------------------------------------
  // dfsRecursivo(origen) y visitar(u): la pila es la de llamadas
  // ------------------------------------------------------------------

  function animarDfsRecursivo(s, origen, paso) {
    const C = "dfsRecursivo";
    empezar(s, {});
    if (!validarAnimado(s, origen, C, 2, paso, { origen })) return;
    empezar(s, { visitado: Array(N).fill(false), orden: [] });
    const { est, rec } = s;
    const pila = [`dfsRecursivo(${origen})`];
    const llamadas = [];
    ver(s, { vars: { origen }, pila: pila.slice() });
    paso(C, 4, "visitado empieza todo en false y orden, vacío. No hace falta una pila: la recursión usa la de llamadas.");

    function visitar(u, nivel, padre) {
      pila.push(`visitar(${u})`);
      llamadas.push(u);
      const mostrar = (o) => ver(s, Object.assign({ vars: { u }, pila: pila.slice(), llamadas: llamadas.slice(), nivel }, o));
      est.visitado[u] = true;
      est.orden.push({ id: nuevaId(s, "o"), v: u, deVertice: u });
      rec.estado[u] = "descubierto";
      if (padre != null) rec.arbol.push(clave(padre, u));
      mostrar({ u, fila: u, marcado: u });
      paso("visitar", 3, `visitar(${u}): visitado[${u}] = true y orden.push_back(${u}). orden = ${textoCola(s, "orden")}.`);
      s.ady[u].forEach((v, j) => {
        const base = { vars: { u, v }, u, v, fila: u, chip: j, arista: clave(u, v), vueltas: { 4: j + 1 } };
        if (est.visitado[v]) {
          mostrar(base);
          paso("visitar", 5, `¿visitado[${v}]? Sí: el ${v} ya se visitó. Sigue con el próximo vecino del ${u}.`);
          return;
        }
        mostrar(base);
        paso("visitar", 6, `¿visitado[${v}]? No: visitar(${v}). El ${u} queda esperando en la pila de llamadas, en su vecino ${j + 1} de ${s.ady[u].length}.`);
        visitar(v, nivel + 1, u);
      });
      rec.estado[u] = "hecho";
      mostrar({ u, fila: u, vueltas: { 4: s.ady[u].length } });
      paso("visitar", 9, `visitar(${u}) termina: no le quedan vecinos sin visitar. ${pila.length > 2 ? `Retrocede al ${llamadas[llamadas.length - 2]}, que sigue con sus vecinos.` : "Era la primera llamada: vuelve a dfsRecursivo."}`);
      pila.pop();
      llamadas.pop();
    }

    visitar(origen, 1, null);
    ver(s, { vars: { origen }, pila: pila.slice(), salida: lista(est.orden.map((x) => x.v)) });
    paso(C, 6, `Devuelve orden = ${lista(est.orden.map((x) => x.v))}: el mismo que con la pila a mano.`, "exito");
  }

  // ------------------------------------------------------------------
  // contarComponentes()
  // ------------------------------------------------------------------

  // Los vértices que visita visitar(u), en orden (sin animar).
  function visitarDirecto(s, u, visitado, salida) {
    visitado[u] = true;
    salida.push(u);
    for (const v of s.ady[u]) if (!visitado[v]) visitarDirecto(s, v, visitado, salida);
    return salida;
  }

  function animarComponentes(s, paso) {
    const C = "contarComponentes";
    empezar(s, { visitado: Array(N).fill(false), orden: [] });
    const { est, rec } = s;
    let componentes = 0;
    ver(s, { vars: { componentes } });
    paso(C, 4, "visitado en false, orden vacío y componentes = 0. Se prueba arrancar desde cada vértice, en orden.");
    for (let u = 0; u < N; u++) {
      if (est.visitado[u]) {
        ver(s, { vars: { u, componentes }, u, vueltas: { 5: u + 1 } });
        paso(C, 6, `u = ${u}: ya visitado, es de la componente ${rec.comp[u] + 1}. No arranca nada nuevo.`);
        continue;
      }
      const isla = visitarDirecto(s, u, est.visitado, []);
      isla.forEach((x, k) => {
        est.orden.push({ id: nuevaId(s, "o"), v: x, deVertice: x, lote: k });
        rec.comp[x] = componentes;
        rec.estado[x] = "hecho";
      });
      for (const x of isla) for (const y of s.ady[x]) if (x < y) rec.arbol.push(clave(x, y));
      ver(s, { vars: { u, componentes }, u, isla, vueltas: { 5: u + 1 } });
      paso(C, 7, `u = ${u}, sin visitar: visitar(${u}) recorre todo lo que se alcanza desde él: ${lista(isla)}. Es una isla del grafo.`);
      componentes++;
      ver(s, { vars: { u, componentes }, cambio: ["componentes"], u, vueltas: { 5: u + 1 } });
      paso(C, 8, `componentes++: van ${componentes}.`);
    }
    ver(s, { vars: { componentes }, salida: String(componentes), vueltas: { 5: N } });
    paso(C, 11, componentes === 1
      ? "Devuelve 1: desde cualquier vértice se llega a todos. El grafo es conexo."
      : `Devuelve ${componentes}: hay ${componentes} grupos de vértices que no se conectan entre sí.`, "exito");
  }

  // ------------------------------------------------------------------
  // Dibujo
  // ------------------------------------------------------------------

  const centro = (v) => ({ x: GX + LUGARES[v].x, y: GY + LUGARES[v].y });

  // Las estructuras que se ven a la derecha, en este orden.
  const FILAS = [
    ["cola", "cola (sale la de la izquierda)"],
    ["pila", "pila (el tope es el de la derecha)"],
    ["visitado", "visitado"],
    ["dist", "dist"],
    ["orden", "orden"],
  ];

  function medidas(s) {
    const grado = Math.max(3, ...s.ady.map((xs) => xs.length));
    const xEst = ADY_X + 32 + grado * PASO_FICHA + 18;
    const filas = FILAS.filter(([k]) => s.est[k]).map(([k, titulo], i) => ({ k, titulo, y: 2 + i * FILA_EST }));
    const ancho = filas.length ? xEst + N * PASO_FICHA + 12 : ADY_X + 32 + grado * PASO_FICHA + 12;
    const alto = Math.max(GY + 180 + R + 16, ADY_Y + N * FILA + 6, ...filas.map((f) => f.y + 16 + FICHA + 20));
    return { xEst, filas, ancho, alto };
  }

  // Las aristas que pasarían por encima de otro vértice se curvan.
  function trazo(u, v) {
    const a = centro(u);
    const b = centro(v);
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const largo = Math.hypot(dx, dy);
    let choca = false;
    for (let w = 0; w < N; w++) {
      if (w === u || w === v) continue;
      const c = centro(w);
      const t = ((c.x - a.x) * dx + (c.y - a.y) * dy) / (largo * largo);
      if (t <= 0 || t >= 1) continue;
      if (Math.hypot(a.x + t * dx - c.x, a.y + t * dy - c.y) < R + 6) choca = true;
    }
    if (!choca) return `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
    const mx = (a.x + b.x) / 2 - (dy / largo) * 34;
    const my = (a.y + b.y) / 2 + (dx / largo) * 34;
    return `M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`;
  }

  function crearLienzo(escenario) {
    const svg = document.createElementNS(SVG, "svg");
    const lienzo = el("div", { class: "lienzo-grafo" }, svg);
    for (let v = 0; v < N; v++) {
      const c = centro(v);
      const vertice = el("div", { class: "gvertice", "data-v": v }, el("span", { class: "gvertice-num", text: v }), el("span", { class: "gvertice-dist" }));
      vertice.style.left = `${c.x - R}px`;
      vertice.style.top = `${c.y - R}px`;
      lienzo.append(vertice);
      const fila = el("div", { class: "gady-indice", "data-u": v, text: v });
      fila.style.left = `${ADY_X}px`;
      fila.style.top = `${ADY_Y + v * FILA}px`;
      lienzo.append(fila);
    }
    lienzo.append(el("span", { class: "gtitulo gtitulo-ady", text: "adyacentes" }));
    escenario.append(el("div", { class: "info-grafo", "data-alto-estable": true }), el("div", { class: "marco-grafo" }, lienzo));
    return lienzo;
  }

  if (typeof window !== "undefined") {
    window.addEventListener("resize", () => {
      for (const lienzo of document.querySelectorAll(".lienzo-grafo")) escalar(lienzo);
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

  function dibujar(escenario, s) {
    const lienzo = escenario.querySelector(".lienzo-grafo") || crearLienzo(escenario);
    const vis = s.vis || {};
    const { rec, est } = s;
    const { xEst, filas, ancho, alto } = medidas(s);

    // Arriba: llamadas en curso, variables y valor devuelto.
    escenario.querySelector(".info-grafo").replaceChildren(
      vis.pila && vis.pila.length > 1
        ? el("div", { class: "pila-llamadas", "aria-label": "Llamadas en curso" },
          vis.pila.flatMap((texto, k) => [k ? "›" : "", el("span", { class: "llamada", text: texto })]))
        : "",
      DS.variables(vis.vars || { vértices: N, aristas: EJE(s) }, vis.cambio),
      vis.salida != null
        ? el("div", { class: "salida-valor" }, "devuelve", el("div", { class: `celda ${vis.salida === "false" ? "error" : "encontrada"}`, text: vis.salida }))
        : "");

    // Aristas: una por par, a medias si solo está en una de las dos listas.
    const svg = lienzo.querySelector("svg");
    const aristas = new Map();
    s.ady.forEach((xs, u) => xs.forEach((v) => {
      const k = clave(u, v);
      aristas.set(k, (aristas.get(k) || 0) + 1);
    }));
    for (const path of svg.querySelectorAll("path")) if (!aristas.has(path.dataset.k)) path.remove();
    for (const [k, veces] of aristas) {
      let path = svg.querySelector(`path[data-k="${k}"]`);
      if (!path) {
        const [a, b] = k.split("-").map(Number);
        path = document.createElementNS(SVG, "path");
        path.setAttribute("data-k", k);
        path.setAttribute("pathLength", "1");
        path.setAttribute("d", trazo(a, b));
        path.setAttribute("class", "traza");
        svg.append(path);
      }
      path.classList.toggle("media", veces < 2);
      path.classList.toggle("arbol", rec.arbol.includes(k));
      path.classList.toggle("mirando", vis.arista === k);
      path.classList.toggle("tenue", !!vis.isla && !rec.arbol.includes(k) && rec.comp.some((c) => c >= 0));
    }

    // Vértices: su estado en el recorrido, la capa (dist) o la isla (componente).
    const llamadas = new Set(vis.llamadas || []);
    for (let v = 0; v < N; v++) {
      const caja = lienzo.querySelector(`.gvertice[data-v="${v}"]`);
      let clase = "gvertice";
      if (rec.estado[v]) clase += ` ${rec.estado[v]}`;
      if (est.dist && est.dist[v] >= 0) clase += ` capa capa-${Math.min(est.dist[v], 4)}`;
      if (rec.comp[v] >= 0) clase += ` isla isla-${rec.comp[v] % 6}`;
      if (llamadas.has(v)) clase += " en-llamada";
      if (vis.u === v) clase += " actual";
      if (vis.v === v) clase += " mirado";
      if (vis.marcado === v || (vis.isla || []).includes(v)) clase += " marcado";
      if (vis.repetido && vis.u === v) clase += " repetido";
      caja.className = clase;
      if (vis.isla) caja.style.setProperty("--retraso", `${vis.isla.indexOf(v) * 90}ms`);
      const d = caja.querySelector(".gvertice-dist");
      d.textContent = est.dist && est.dist[v] >= 0 ? est.dist[v] : "";
    }

    // Marcas u y v arriba de los vértices.
    const marcas = {};
    if (vis.u != null && vis.u >= 0 && vis.u < N) (marcas[vis.u] = marcas[vis.u] || []).push("u");
    if (vis.v != null && vis.v >= 0 && vis.v < N) (marcas[vis.v] = marcas[vis.v] || []).push(est.pila ? "*it" : "v");
    const presentes = new Set();
    for (const [donde, nombres] of Object.entries(marcas)) {
      const c = centro(Number(donde));
      const k = nombres.join(",");
      presentes.add(k);
      let marca = lienzo.querySelector(`.abb-puntero[data-nombre="${k}"]`);
      if (!marca) {
        marca = el("span", { class: "abb-puntero", "data-nombre": k });
        marca.style.left = `${c.x}px`;
        marca.style.top = `${c.y - R - 16}px`;
        lienzo.append(marca);
      }
      marca.textContent = `${nombres.join(", ")} ↓`;
      marca.style.left = `${c.x}px`;
      marca.style.top = `${c.y - R - 16}px`;
    }
    for (const marca of lienzo.querySelectorAll(".abb-puntero[data-nombre]")) if (!presentes.has(marca.dataset.nombre)) retirar(marca);

    // Fichas que se mueven: la lista de adyacencia, la cola o la pila, y orden.
    const deseadas = [];
    s.ady.forEach((xs, u) => xs.forEach((v, j) => {
      let clase = "gficha ady";
      if (vis.fila === u && vis.chip === j) clase += vis.error ? " mala" : " leyendo";
      else if (vis.fila === u && (vis.buscando || []).includes(v)) clase += " buscada";
      deseadas.push({ id: `a${u}-${v}`, v, x: ADY_X + 32 + j * PASO_FICHA, y: ADY_Y + u * FILA, clase, deVertice: v });
    }));
    for (const f of filas) {
      if (!Array.isArray(est[f.k]) || f.k === "visitado" || f.k === "dist") continue;
      est[f.k].forEach((x, j) => {
        let clase = `gficha ${f.k}`;
        if (f.k === "orden" && j === est.orden.length - 1 && vis.u === x.v) clase += " reciente";
        deseadas.push({ id: x.id, v: x.v, x: xEst + j * PASO_FICHA, y: f.y + 16, clase, de: x.de, deVertice: x.deVertice, lote: x.lote });
      });
    }
    const antes = {};
    for (const ficha of lienzo.querySelectorAll(".gficha[data-id]")) antes[ficha.dataset.id] = { x: parseFloat(ficha.style.left), y: parseFloat(ficha.style.top) };
    const quedan = new Set(deseadas.map((d) => d.id));
    const nuevas = [];
    for (const d of deseadas) {
      let ficha = lienzo.querySelector(`.gficha[data-id="${d.id}"]`);
      if (!ficha) {
        ficha = el("div", { class: d.clase, "data-id": d.id, text: d.v });
        let origen = d.de && antes[d.de] ? antes[d.de] : null;
        if (!origen && d.deVertice != null) {
          const c = centro(d.deVertice);
          origen = { x: c.x - FICHA / 2, y: c.y - FICHA / 2 };
        }
        const p = origen || d;
        ficha.style.left = `${p.x}px`;
        ficha.style.top = `${p.y}px`;
        if (!origen) ficha.classList.add("aparece");
        if (d.lote) ficha.style.transitionDelay = `${d.lote * 90}ms`;
        lienzo.append(ficha);
        nuevas.push(ficha);
      }
      ficha.className = d.clase + (ficha.classList.contains("aparece") ? " aparece" : "");
      ficha._destino = d;
    }
    for (const ficha of lienzo.querySelectorAll(".gficha[data-id]")) if (!quedan.has(ficha.dataset.id)) retirar(ficha);
    if (nuevas.length) void lienzo.offsetWidth; // que las nuevas arranquen desde su origen
    for (const ficha of lienzo.querySelectorAll(".gficha[data-id]")) {
      const d = ficha._destino;
      if (!d) continue;
      ficha.style.left = `${d.x}px`;
      ficha.style.top = `${d.y}px`;
    }

    // Filas de las estructuras: título y, para visitado y dist, una celda por vértice.
    const tituloAdy = lienzo.querySelector(".gtitulo-ady");
    tituloAdy.style.left = `${ADY_X}px`;
    tituloAdy.style.top = `${ADY_Y - 17}px`;
    const titulos = new Set();
    for (const f of filas) {
      titulos.add(f.k);
      let t = lienzo.querySelector(`.gtitulo[data-fila="${f.k}"]`);
      if (!t) {
        t = el("span", { class: "gtitulo", "data-fila": f.k, text: f.titulo });
        lienzo.append(t);
      }
      t.style.left = `${xEst}px`;
      t.style.top = `${f.y}px`;
      if (f.k !== "visitado" && f.k !== "dist") continue;
      for (let v = 0; v < N; v++) {
        let celda = lienzo.querySelector(`.gcelda[data-fila="${f.k}"][data-v="${v}"]`);
        if (!celda) {
          celda = el("div", { class: "gcelda", "data-fila": f.k, "data-v": v }, el("span", { class: "gcelda-valor" }), el("span", { class: "gcelda-indice", text: v }));
          lienzo.append(celda);
        }
        celda.style.left = `${xEst + v * PASO_FICHA}px`;
        celda.style.top = `${f.y + 16}px`;
        const valor = f.k === "visitado" ? (est.visitado[v] ? "✓" : "") : String(est.dist[v]);
        const caja = celda.querySelector(".gcelda-valor");
        if (caja.textContent !== valor) {
          if (celda.dataset.listo) {
            celda.classList.remove("cambia");
            void celda.offsetWidth;
            celda.classList.add("cambia");
          }
          caja.textContent = valor;
        }
        celda.dataset.listo = "1";
        celda.classList.toggle("si", f.k === "visitado" ? est.visitado[v] : est.dist[v] >= 0);
        celda.classList.toggle("mirada", vis.v === v || vis.u === v);
      }
    }
    for (const t of lienzo.querySelectorAll(".gtitulo[data-fila]")) if (!titulos.has(t.dataset.fila)) t.remove();
    for (const c of lienzo.querySelectorAll(".gcelda")) if (!titulos.has(c.dataset.fila)) c.remove();

    // La fila de la lista que se está leyendo.
    for (const indice of lienzo.querySelectorAll(".gady-indice")) {
      indice.classList.toggle("leyendo", vis.fila === Number(indice.dataset.u));
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
  // Visualizadores de la lección
  // ------------------------------------------------------------------

  const U = { id: "u", etiqueta: "u", min: 0, max: 9, valor: 6 };
  const V = { id: "v", etiqueta: "v", min: 0, max: 9, valor: 7 };
  const ORIGEN = { id: "origen", etiqueta: "origen", min: 0, max: 9, valor: 0 };

  const OPS = {
    agregarArista: { etiqueta: "agregarArista(u, v)", usa: ["u", "v"], ejecutar(s, { u, v }, paso) { animarAgregar(s, u, v, paso); } },
    bfs: { etiqueta: "bfs(origen)", usa: ["origen"], ejecutar(s, { origen }, paso) { animarBfs(s, origen, paso); } },
    distancias: { etiqueta: "distancias(origen)", usa: ["origen"], ejecutar(s, { origen }, paso) { animarDistancias(s, origen, paso); } },
    dfs: { etiqueta: "dfs(origen)", usa: ["origen"], ejecutar(s, { origen }, paso) { animarDfs(s, origen, paso); } },
    dfsRecursivo: { etiqueta: "dfsRecursivo(origen)", usa: ["origen"], ejecutar(s, { origen }, paso) { animarDfsRecursivo(s, origen, paso); } },
    contarComponentes: { etiqueta: "contarComponentes()", usa: [], ejecutar(s, args, paso) { animarComponentes(s, paso); } },
  };

  // Fragmentos que muestra cada operación.
  const FRAGMENTOS = {
    agregarArista: ["agregarArista", "validar"],
    bfs: ["bfs", "validar"],
    distancias: ["distancias", "validar"],
    dfs: ["dfs", "validar"],
    dfsRecursivo: ["dfsRecursivo", "visitar", "validar"],
    contarComponentes: ["contarComponentes"],
  };

  function visualizador(contenedor, opciones) {
    const claves = new Set();
    for (const op of opciones.ops) FRAGMENTOS[op].forEach((k) => claves.add(k));
    DS.tema({
      contenedor,
      incremental: true,
      dibujar,
      codigo: Object.fromEntries([...claves].map((k) => [k, CODIGO[k]])),
      tituloCodigo: (k) => `Grafo::${k}()`,
      mensajeInicial: opciones.mensajeInicial,
      estadoInicial: opciones.estadoInicial,
      entradas: opciones.entradas,
      operaciones: opciones.ops.map((id) => Object.assign({ id, codigo: id }, OPS[id])),
    });
  }

  // Paso 1: lista de adyacencia.
  visualizador("vis-aristas", {
    ops: ["agregarArista"],
    entradas: [U, V],
    estadoInicial: () => estadoDesde(EJEMPLO.slice(0, 8)),
    mensajeInicial: "Cada vértice tiene su lista de vecinos. Agrega la arista 6–7 y después 5–7. Prueba también 1–4 (ya está) y 9–2 (no existe el 9).",
  });

  // Paso 2: BFS.
  visualizador("vis-bfs", {
    ops: ["bfs"],
    entradas: [ORIGEN],
    estadoInicial: () => estadoDesde(EJEMPLO),
    mensajeInicial: "Recorre desde el 0: mira cómo la cola hace que primero salgan los vecinos del 0, después los vecinos de esos… Prueba también desde el 7.",
  });

  // Paso 3: distancias.
  visualizador("vis-distancias", {
    ops: ["distancias"],
    entradas: [ORIGEN],
    estadoInicial: () => estadoDesde(EJEMPLO),
    mensajeInicial: "El mismo BFS anotando la distancia: cada capa tiene su color. ¿A cuántas aristas del 0 está el 7?",
  });

  // Paso 4: DFS con pila.
  visualizador("vis-dfs", {
    ops: ["dfs"],
    entradas: [ORIGEN],
    estadoInicial: () => estadoDesde(EJEMPLO),
    mensajeInicial: "Cambia la cola por una pila: el último que entra sale primero, y el recorrido se va lejos antes de volver. Compara el orden con el de BFS.",
  });

  // Paso 5: DFS recursivo.
  visualizador("vis-recursivo", {
    ops: ["dfsRecursivo"],
    entradas: [ORIGEN],
    estadoInicial: () => estadoDesde(EJEMPLO),
    mensajeInicial: "Sin pila a mano: cada visitar espera a que termine la llamada de su vecino. Mira la pila de llamadas arriba y cómo retrocede.",
  });

  // Paso 6: componentes.
  visualizador("vis-componentes", {
    ops: ["contarComponentes", "agregarArista"],
    entradas: [Object.assign({}, U, { valor: 2 }), Object.assign({}, V, { valor: 3 })],
    estadoInicial: () => estadoDesde(ISLAS),
    mensajeInicial: "Tres islas. Cuéntalas; después une dos con agregarArista(2, 3) y vuelve a contar.",
  });

  // Paso 7: todo junto.
  visualizador("vis-todo", {
    ops: ["agregarArista", "bfs", "distancias", "dfs", "contarComponentes"],
    entradas: [U, V, ORIGEN],
    estadoInicial: () => estadoDesde(ISLAS.slice(0, 4)),
    mensajeInicial: "Arma tu propio grafo con agregarArista y recórrelo de las dos maneras desde distintos orígenes.",
  });
})();
