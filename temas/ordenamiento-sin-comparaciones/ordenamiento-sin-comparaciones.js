// Lección de los ordenamientos sin comparaciones (counting, radix y bucket
// sort), en pasos. Los fragmentos de código deben coincidir línea por línea
// con ejemplos/cpp/ordenamiento_sin_comparaciones.cpp
// (scripts/verificar-fragmentos.mjs lo revisa).
(function () {
  const { el } = DS;
  const PASO = 50; // de una columna a la siguiente
  const ANCHO = 40; // ancho de una barra o de una casilla
  const MARGEN = 30;
  const ALTO_MAX = 52;
  const ALTO_MIN = 22;
  const TITULO = 16; // alto del título de cada fila
  const CASILLA = 32; // alto de una casilla de conteo
  const FICHA = 22; // alto de un valor dentro de una cubeta
  const SEP_FICHA = 25;

  // ------------------------------------------------------------------
  // Fragmentos de C++ (copiados de ejemplos/cpp/ordenamiento_sin_comparaciones.cpp)
  // ------------------------------------------------------------------

  const CODIGO = {
    contarYReescribir: `
      void contarYReescribir(vector<int>& v, int maximo) {
          vector<int> conteo(maximo + 1, 0);
          for (int x : v) {
              conteo[x]++;
          }
          int k = 0;
          for (int valor = 0; valor <= maximo; valor++) {
              for (int c = 0; c < conteo[valor]; c++) {
                  v[k++] = valor;
              }
          }
      }`,
    countingSort: `
      vector<int> countingSort(const vector<int>& v, int maximo) {
          vector<int> conteo(maximo + 1, 0);
          for (int x : v) {
              if (x < 0 || x > maximo) {
                  throw out_of_range("valor fuera de 0..maximo");
              }
              conteo[x]++;
          }
          for (int i = 1; i <= maximo; i++) {
              conteo[i] += conteo[i - 1];
          }
          vector<int> salida(v.size());
          for (int i = (int)v.size() - 1; i >= 0; i--) {
              conteo[v[i]]--;
              salida[conteo[v[i]]] = v[i];
          }
          return salida;
      }`,
    ordenarPorDigito: `
      void ordenarPorDigito(vector<int>& v, int exp) {
          vector<int> conteo(10, 0);
          for (int x : v) {
              conteo[(x / exp) % 10]++;
          }
          for (int d = 1; d < 10; d++) {
              conteo[d] += conteo[d - 1];
          }
          vector<int> salida(v.size());
          for (int i = (int)v.size() - 1; i >= 0; i--) {
              int d = (v[i] / exp) % 10;
              conteo[d]--;
              salida[conteo[d]] = v[i];
          }
          v = salida;
      }`,
    radixSort: `
      void radixSort(vector<int>& v) {
          if (v.empty()) {
              return;
          }
          int maximo = *max_element(v.begin(), v.end());
          for (int exp = 1; maximo / exp > 0; exp *= 10) {
              ordenarPorDigito(v, exp);
          }
      }`,
    bucketSort: `
      void bucketSort(vector<int>& v, int maximo, int cubetas) {
          vector<vector<int>> cubeta(cubetas);
          for (int x : v) {
              cubeta[(long long)x * cubetas / (maximo + 1)].push_back(x);
          }
          int k = 0;
          for (auto& c : cubeta) {
              sort(c.begin(), c.end());
              for (int x : c) {
                  v[k++] = x;
              }
          }
      }`,
  };

  const fragmentos = (...claves) => Object.fromEntries(claves.map((c) => [c, CODIGO[c]]));

  // ------------------------------------------------------------------
  // Estado. v y salida son barras con id; conteo son números; cubetas,
  // listas de barras. "de" dice desde dónde vuela una barra nueva, y
  // vuelos son fichas que viajan durante un solo paso (+1 hacia conteo).
  // ------------------------------------------------------------------

  let lotes = 0;

  function nuevaBarra(s, v, e, extra) {
    return Object.assign({ id: `b${s.lote}-${s.sig++}`, v }, e ? { e } : {}, extra);
  }

  // modo: "contar", "counting", "radix" o "bucket".
  function estadoDesde(valores, modo, opciones) {
    const s = { lote: ++lotes, sig: 1, modo, v: [], vis: {} };
    for (const x of valores) {
      const v = typeof x === "object" ? x.v : x;
      s.v.push(nuevaBarra(s, v, typeof x === "object" ? x.e : null));
    }
    s.maxV = Math.max(1, ...s.v.map((b) => b.v));
    s.digitos = String(s.maxV).length;
    Object.assign(s, opciones);
    prepararCorrida(s);
    return s;
  }

  function prepararCorrida(s) {
    s.conteo = null;
    s.salida = null;
    s.cubetas = null;
    s.vuelos = [];
    s.listos = false;
    s.salidaLista = false;
    s.exp = null;
    s.cuenta = s.modo === "bucket" ? { "pasos": 0 } : { "pasos": 0 };
    s.columnasConteo = s.modo === "radix" ? 10 : (s.maximo || 0) + 1;
  }

  const LETRA = { a: "ᵃ", b: "ᵇ" };
  const texto = (b) => `${b.v}${b.e ? LETRA[b.e] : ""}`;
  const lista = (arr) => arr.map(texto).join(", ");
  const digito = (x, exp) => Math.floor(x / exp) % 10;

  function ver(s, o) {
    s.vis = Object.assign({}, o);
  }

  // Cada lectura o escritura que hace el algoritmo cuenta como un paso de trabajo.
  function trabajo(s, k) {
    s.cuenta.pasos += k || 1;
  }

  // ------------------------------------------------------------------
  // contarYReescribir
  // ------------------------------------------------------------------

  function animarContar(s, paso) {
    const K = "contarYReescribir";
    const n = s.v.length;
    const maximo = s.maximo;
    s.conteo = Array(maximo + 1).fill(0);
    ver(s, { vars: { maximo }, conteoNuevo: true });
    paso(K, 2, `conteo tiene maximo + 1 = ${maximo + 1} casillas, una por cada valor posible (0 a ${maximo}), todas en 0.`);
    for (let i = 0; i < n; i++) {
      const x = s.v[i].v;
      s.conteo[x]++;
      trabajo(s);
      s.vuelos = [{ id: `f${s.sig++}`, texto: "+1", de: ["v", i], a: ["conteo", x] }];
      ver(s, { vars: { maximo, x }, leidas: [i], conteoEscrito: [x], cambio: ["pasos"], vueltas: { 3: i + 1 } });
      paso(K, 4, `x = ${x}: no se compara con nadie, solo se usa como índice. conteo[${x}]++ → ${s.conteo[x]}.`);
    }
    s.vuelos = [];
    let k = 0;
    ver(s, { vars: { maximo, k }, cambio: ["k"] });
    paso(K, 6, `Ya sabemos cuántos hay de cada valor: { ${s.conteo.join(", ")} }. Ahora reescribimos v desde k = 0, recorriendo los valores en orden.`);
    for (let valor = 0; valor <= maximo; valor++) {
      if (!s.conteo[valor]) {
        ver(s, { vars: { maximo, k, valor }, conteoLeido: [valor], vueltas: { 7: valor + 1, 8: 0 } });
        paso(K, 8, `conteo[${valor}] = 0: no hay ningún ${valor}. Nada que escribir.`);
        continue;
      }
      for (let c = 0; c < s.conteo[valor]; c++) {
        s.v[k] = nuevaBarra(s, valor, null, { de: ["conteo", valor] });
        trabajo(s);
        ver(s, { vars: { maximo, k: k + 1, valor, c }, conteoLeido: [valor], escritas: [k], punteros: { k }, cambio: ["pasos"], vueltas: { 7: valor + 1, 8: c + 1 } });
        paso(K, 9, `v[${k}] = ${valor}${s.conteo[valor] > 1 ? ` (${c + 1} de ${s.conteo[valor]})` : ""}. k avanza a ${k + 1}.`);
        k++;
      }
    }
    s.listos = true;
    ver(s, { vars: { maximo, k } });
    paso(K, 7, `¡Ordenado sin una sola comparación! ${s.cuenta.pasos} pasos: n = ${n} para contar y n para reescribir, más recorrer los ${maximo + 1} valores posibles. O(n + k).`, "exito");
  }

  // ------------------------------------------------------------------
  // countingSort (estable) y ordenarPorDigito: la misma estructura.
  // clave(x) es x (counting) o su dígito (radix).
  // ------------------------------------------------------------------

  function animarConteoEstable(s, paso, cfg) {
    const { K, detalle, clave, nombreClave, columnas } = cfg;
    const L = cfg.lineas;
    const n = s.v.length;
    const base = cfg.vars || {};
    s.conteo = Array(columnas).fill(0);
    s.salida = null;
    ver(s, { vars: Object.assign({}, base), conteoNuevo: true, exp: s.exp });
    paso(K, 2, cfg.textoInicio);

    // 1. Contar.
    if (detalle) {
      for (let i = 0; i < n; i++) {
        const x = s.v[i].v;
        if (cfg.valida && !cfg.valida(x)) {
          ver(s, { vars: Object.assign({ x }, base), malas: [i], error: true, exp: s.exp, vueltas: { [L.contar]: i + 1 } });
          paso(K, 5, `x = ${x} no está entre 0 y maximo = ${s.maximo}: conteo[${x}] estaría fuera del vector. Se lanza std::out_of_range.`, "error");
          return false;
        }
        const c = clave(x);
        s.conteo[c]++;
        trabajo(s);
        s.vuelos = [{ id: `f${s.sig++}`, texto: "+1", de: ["v", i], a: ["conteo", c] }];
        ver(s, { vars: Object.assign({ x }, base), leidas: [i], conteoEscrito: [c], exp: s.exp, cambio: ["pasos"], vueltas: { [L.contar]: i + 1 } });
        paso(K, L.contarLinea, `${nombreClave(x)} conteo[${c}]++ → ${s.conteo[c]}.`);
      }
    } else {
      const malo = cfg.valida ? s.v.findIndex((b) => !cfg.valida(b.v)) : -1;
      if (malo >= 0) {
        ver(s, { vars: Object.assign({ x: s.v[malo].v }, base), malas: [malo], error: true, exp: s.exp });
        paso(K, 5, `x = ${s.v[malo].v} no está entre 0 y maximo = ${s.maximo}: se lanza std::out_of_range.`, "error");
        return false;
      }
      s.vuelos = s.v.map((b, i) => {
        s.conteo[clave(b.v)]++;
        return { id: `f${s.sig++}`, texto: "+1", de: ["v", i], a: ["conteo", clave(b.v)], retraso: i };
      });
      trabajo(s, n);
      ver(s, { vars: Object.assign({}, base), conteoEscrito: s.conteo.map((_, k) => k), exp: s.exp, cambio: ["pasos"], vueltas: { [L.contar]: n } });
      paso(K, L.contarLinea, `Contamos ${cfg.queSeCuenta}: conteo = { ${s.conteo.join(", ")} }.`);
    }
    s.vuelos = [];

    // 2. Sumas acumuladas: conteo[c] pasa a ser dónde TERMINA la clave c en la salida.
    if (detalle) {
      for (let c = 1; c < columnas; c++) {
        const antes = s.conteo[c];
        s.conteo[c] += s.conteo[c - 1];
        trabajo(s);
        s.vuelos = [{ id: `f${s.sig++}`, texto: `+${s.conteo[c - 1]}`, de: ["conteo", c - 1], a: ["conteo", c] }];
        ver(s, { vars: Object.assign({ [L.indice]: c }, base), conteoEscrito: [c], conteoLeido: [c - 1], exp: s.exp, cambio: ["pasos"], vueltas: { [L.sumar]: c } });
        paso(K, L.sumar + 1, `conteo[${c}] += conteo[${c - 1}]: ${antes} + ${s.conteo[c - 1]} = ${s.conteo[c]}. Hay ${s.conteo[c]} valor(es) con clave ≤ ${c}: el último ${c} irá en la posición ${s.conteo[c] - 1}.`);
      }
    } else {
      for (let c = 1; c < columnas; c++) s.conteo[c] += s.conteo[c - 1];
      trabajo(s, columnas - 1);
      ver(s, { vars: Object.assign({}, base), conteoEscrito: s.conteo.map((_, k) => k).slice(1), exp: s.exp, cambio: ["pasos"], vueltas: { [L.sumar]: columnas - 1 } });
      paso(K, L.sumar + 1, `Sumas acumuladas: conteo = { ${s.conteo.join(", ")} }. Ahora conteo[c] es cuántos tienen clave ≤ c: dónde termina cada clave en la salida.`);
    }
    s.vuelos = [];

    // 3. Colocar, de derecha a izquierda.
    s.salida = Array(n).fill(null);
    ver(s, { vars: Object.assign({}, base), exp: s.exp });
    paso(K, L.salida, `salida tiene ${n} casillas. Recorremos v de derecha a izquierda: así, entre dos con la misma clave, el de más a la derecha ocupa la última posición libre de su clave.`);
    if (detalle) {
      for (let i = n - 1; i >= 0; i--) {
        const x = s.v[i].v;
        const c = clave(x);
        s.conteo[c]--;
        const pos = s.conteo[c];
        ver(s, { vars: Object.assign({ i, [cfg.nombreC]: c }, base), leidas: [i], conteoEscrito: [c], punteros: { i }, exp: s.exp, vueltas: { [L.colocar]: n - i } });
        paso(K, L.decrementar, `${cfg.textoClave(x, i)} conteo[${c}]-- → ${pos}: esa es su posición en la salida.`);
        s.salida[pos] = nuevaBarra(s, x, s.v[i].e, { de: ["v", i] });
        trabajo(s, 2);
        ver(s, { vars: Object.assign({ i, [cfg.nombreC]: c }, base), leidas: [i], escritasSalida: [pos], punteros: { i }, punterosSalida: { [`conteo[${c}]`]: pos }, exp: s.exp, cambio: ["pasos"], vueltas: { [L.colocar]: n - i } });
        paso(K, L.decrementar + 1, `salida[${pos}] = ${texto(s.v[i])}.`);
      }
    } else {
      for (let i = n - 1; i >= 0; i--) {
        const c = clave(s.v[i].v);
        s.conteo[c]--;
        s.salida[s.conteo[c]] = nuevaBarra(s, s.v[i].v, s.v[i].e, { de: ["v", i], retraso: n - 1 - i });
      }
      trabajo(s, 2 * n);
      ver(s, { vars: Object.assign({}, base), escritasSalida: s.salida.map((_, k) => k), exp: s.exp, cambio: ["pasos"], vueltas: { [L.colocar]: n } });
      paso(K, L.decrementar + 1, `Colocamos cada valor en salida[--conteo[clave]], de derecha a izquierda: salida = { ${lista(s.salida)} }.`);
    }
    return true;
  }

  function animarCounting(s, paso, detalle) {
    const K = "countingSort";
    const maximo = s.maximo;
    const ok = animarConteoEstable(s, paso, {
      K, detalle, columnas: maximo + 1, clave: (x) => x, nombreC: "v[i]",
      valida: (x) => x >= 0 && x <= maximo,
      nombreClave: (x) => `x = ${x}:`,
      textoClave: (x, i) => `i = ${i}, v[i] = ${x}:`,
      queSeCuenta: "cuántas veces aparece cada valor",
      textoInicio: `conteo tiene maximo + 1 = ${maximo + 1} casillas, una por valor posible, todas en 0.`,
      vars: { maximo },
      lineas: { contar: 3, contarLinea: 7, sumar: 9, indice: "i", salida: 12, colocar: 13, decrementar: 14 },
    });
    if (!ok) return;
    // countingSort devuelve salida (v queda como estaba): la ordenada es salida.
    s.salidaLista = true;
    ver(s, { vars: { maximo } });
    const letras = s.salida.filter((b) => b.e).map((b) => b.e).join("");
    paso(K, 17, `return salida: { ${lista(s.salida)} }. ${s.cuenta.pasos} pasos y ninguna comparación: O(n + k).`
      + (letras.length > 1 ? (letras === "ab" ? " Los iguales siguen en su orden (ᵃ antes que ᵇ): es estable." : " Los iguales se invirtieron.") : ""), "exito");
  }

  function animarRadix(s, paso, detalle) {
    const K = "radixSort";
    const n = s.v.length;
    if (!n) {
      ver(s, {});
      paso(K, 3, "El vector está vacío: no hay nada que ordenar. return.");
      return;
    }
    const maximo = s.maxV;
    ver(s, { vars: { maximo }, cambio: ["maximo"] });
    paso(K, 5, `maximo = ${maximo}: tiene ${String(maximo).length} dígito(s), así que habrá ${String(maximo).length} pasadas.`);
    const NOMBRES = { 1: "unidades", 10: "decenas", 100: "centenas", 1000: "miles" };
    let pasada = 0;
    for (let exp = 1; Math.floor(maximo / exp) > 0; exp *= 10) {
      pasada++;
      s.exp = exp;
      s.conteo = null;
      s.salida = null;
      ver(s, { vars: { maximo, exp }, exp, cambio: ["exp"], vueltas: { 6: pasada } });
      paso(K, 7, `exp = ${exp}: ordenamos solo por las ${NOMBRES[exp] || `posiciones de ${exp}`} (el dígito resaltado), con un counting sort estable.`);
      animarConteoEstable(s, paso, {
        K: "ordenarPorDigito", detalle, columnas: 10, clave: (x) => digito(x, exp), nombreC: "d",
        nombreClave: (x) => `${x}: su dígito es ${digito(x, exp)}.`,
        textoClave: (x, i) => `i = ${i}: d = (${x} / ${exp}) % 10 = ${digito(x, exp)}.`,
        queSeCuenta: `cuántos tienen cada dígito en las ${NOMBRES[exp] || "posiciones de " + exp}`,
        textoInicio: `conteo tiene 10 casillas, una por dígito (0 a 9).`,
        vars: { exp },
        lineas: { contar: 3, contarLinea: 4, sumar: 6, indice: "d", salida: 9, colocar: 10, decrementar: 12 },
      });
      // v = salida: los valores suben a v (la salida pasa a ser el arreglo).
      s.v = s.salida.map((b, k) => ({ id: b.id, v: b.v, e: b.e }));
      s.salida = null;
      trabajo(s, n);
      ver(s, { vars: { exp }, exp, cambio: ["pasos"] });
      paso("ordenarPorDigito", 15, `v = salida: { ${lista(s.v)} }. Ordenado por ${NOMBRES[exp] || "ese dígito"}; los empates conservan el orden de la pasada anterior.`);
    }
    s.exp = null;
    s.conteo = null;
    s.listos = true;
    ver(s, { vars: { maximo } });
    paso(K, 6, `maximo / exp = 0: no quedan dígitos. ¡Ordenado! { ${lista(s.v)} }. ${s.cuenta.pasos} pasos en ${pasada} pasada(s): O(d · (n + 10)).`, "exito");
  }

  // ------------------------------------------------------------------
  // bucketSort
  // ------------------------------------------------------------------

  function animarBucket(s, paso, detalle) {
    const K = "bucketSort";
    const n = s.v.length;
    const { maximo, numCubetas } = s;
    const anchoCubeta = Math.ceil((maximo + 1) / numCubetas);
    s.cubetas = Array.from({ length: numCubetas }, () => []);
    ver(s, { vars: { maximo, cubetas: numCubetas } });
    paso(K, 2, `${numCubetas} cubetas vacías; cada una recibe un tramo de ${anchoCubeta} valores (0..${anchoCubeta - 1}, ${anchoCubeta}..${2 * anchoCubeta - 1}, …).`);
    const cubetaDe = (x) => Math.floor((x * numCubetas) / (maximo + 1));
    if (detalle) {
      for (let i = 0; i < n; i++) {
        const x = s.v[i].v;
        const c = cubetaDe(x);
        s.cubetas[c].push(nuevaBarra(s, x, null, { de: ["v", i] }));
        trabajo(s);
        ver(s, { vars: { maximo, cubetas: numCubetas, x }, leidas: [i], cubetaActiva: c, cambio: ["pasos"], vueltas: { 3: i + 1 } });
        paso(K, 4, `x = ${x}: ${x} · ${numCubetas} / ${maximo + 1} = ${c}. Va al final de la cubeta ${c}.`);
      }
    } else {
      s.v.forEach((b, i) => s.cubetas[cubetaDe(b.v)].push(nuevaBarra(s, b.v, null, { de: ["v", i], retraso: i })));
      trabajo(s, n);
      ver(s, { vars: { maximo, cubetas: numCubetas }, cambio: ["pasos"], vueltas: { 3: n } });
      paso(K, 4, `Repartimos: cada x va a la cubeta x · ${numCubetas} / ${maximo + 1}. Sin comparar entre ellos.`);
    }
    let k = 0;
    ver(s, { vars: { maximo, cubetas: numCubetas, k } });
    paso(K, 6, "k = 0: ahora vaciamos las cubetas en orden, de la 0 a la última.");
    for (let c = 0; c < numCubetas; c++) {
      const cubeta = s.cubetas[c];
      const m = cubeta.length;
      cubeta.sort((a, b) => a.v - b.v);
      trabajo(s, m > 1 ? Math.ceil(m * Math.log2(m)) : m);
      ver(s, { vars: { maximo, cubetas: numCubetas, k }, cubetaActiva: c, cubetaOrdenada: c, cambio: ["pasos"], vueltas: { 7: c + 1 } });
      paso(K, 8, m > 1
        ? `sort de la cubeta ${c}: solo ${m} valores, así que ordenarla es barato → { ${lista(cubeta)} }.`
        : m ? `La cubeta ${c} tiene un solo valor: ya está ordenada.` : `La cubeta ${c} está vacía.`);
      if (!m) continue;
      if (detalle) {
        cubeta.forEach((b, j) => {
          s.v[k] = nuevaBarra(s, b.v, null, { de: ["cubeta", c, j] });
          trabajo(s);
          ver(s, { vars: { maximo, cubetas: numCubetas, k: k + 1 }, cubetaActiva: c, escritas: [k], punteros: { k }, cambio: ["pasos"], vueltas: { 7: c + 1, 9: j + 1 } });
          paso(K, 10, `v[${k}] = ${b.v}.`);
          k++;
        });
      } else {
        const desde = k;
        cubeta.forEach((b, j) => { s.v[k++] = nuevaBarra(s, b.v, null, { de: ["cubeta", c, j], retraso: j }); });
        trabajo(s, m);
        ver(s, { vars: { maximo, cubetas: numCubetas, k }, cubetaActiva: c, escritas: [desde, k - 1], punteros: { k: Math.min(k, n - 1) }, cambio: ["pasos"], vueltas: { 7: c + 1, 9: m } });
        paso(K, 10, `Los ${m} valores de la cubeta ${c} vuelven a v[${desde}..${k - 1}].`);
      }
    }
    s.listos = true;
    ver(s, { vars: { maximo, cubetas: numCubetas } });
    const mayor = Math.max(...s.cubetas.map((c) => c.length));
    paso(K, 7, `¡Ordenado! { ${lista(s.v)} }. ${s.cuenta.pasos} pasos.`
      + (mayor > n / 2 ? ` Pero una cubeta recibió ${mayor} de ${n}: casi todo el trabajo fue su sort. Con valores amontonados, bucket sort no ayuda.` : " Con valores repartidos parejo, cada cubeta tiene pocos: O(n) en promedio."), "exito");
  }

  // ------------------------------------------------------------------
  // Dibujo
  // ------------------------------------------------------------------

  const xDe = (k) => MARGEN + k * PASO;
  // En bucket sort, debajo de v van las cubetas: las barras son más bajas.
  const altoMax = (s) => (s.modo === "bucket" ? 44 : ALTO_MAX);
  const altoDe = (s, v) => Math.round(ALTO_MIN + (altoMax(s) - ALTO_MIN) * Math.max(0, v) / s.maxV);

  function geometria(s) {
    const yBaseV = TITULO + altoMax(s);
    const y = { yBaseV };
    let fondo;
    const columnas = Math.max(s.v.length, s.modo === "bucket" ? 0 : s.columnasConteo);
    if (s.modo === "bucket") {
      y.yCubetas = yBaseV + 34;
      // Dos fichas por fila dentro de cada cubeta.
      const pila = Math.ceil(Math.max(4, s.filasCubeta || 0, ...(s.cubetas || []).map((c) => c.length)) / 2);
      y.altoCubeta = 6 + pila * SEP_FICHA;
      fondo = y.yCubetas + TITULO + y.altoCubeta + 15;
    } else {
      y.yConteo = yBaseV + 34;
      fondo = y.yConteo + TITULO + CASILLA + 16;
      if (s.modo !== "contar") {
        y.ySalida = fondo + 2;
        y.yBaseS = y.ySalida + TITULO + ALTO_MAX;
        fondo = y.yBaseS + 32;
      }
    }
    return Object.assign(y, { alto: fondo, ancho: 2 * MARGEN + Math.max(1, columnas) * PASO - (PASO - ANCHO) });
  }

  // Columnas de las cubetas: reparten el ancho de v.
  function cubetaX(s, g, c) {
    const anchoCol = (g.ancho - 2 * MARGEN + (PASO - ANCHO)) / s.numCubetas;
    return { x: MARGEN + c * anchoCol, ancho: anchoCol - 10 };
  }

  function posicion(s, g, de) {
    const [fila, k, j] = de;
    if (fila === "v") return { x: xDe(k), y: g.yBaseV - altoMax(s) / 2 };
    if (fila === "conteo") return { x: xDe(k), y: g.yConteo + TITULO };
    if (fila === "salida") return { x: xDe(k), y: g.yBaseS - ALTO_MAX / 2 };
    const col = cubetaX(s, g, k);
    const izquierda = col.x + (col.ancho - 2 * ANCHO - 6) / 2;
    return { x: izquierda + (j % 2) * (ANCHO + 6), y: g.yCubetas + TITULO + 4 + Math.floor(j / 2) * SEP_FICHA };
  }

  function crearLienzo(escenario) {
    const lienzo = el("div", { class: "ord-lienzo" }, el("div", { class: "ord-capa" }), el("div", { class: "ord-punteros" }));
    escenario.append(el("div", { class: "ord-info" }), el("div", { class: "ord-marco" }, lienzo));
    return lienzo;
  }

  if (typeof window !== "undefined") {
    window.addEventListener("resize", () => {
      for (const lienzo of document.querySelectorAll(".snc .ord-lienzo")) escalar(lienzo.closest(".escenario"), lienzo);
    });
  }

  function escalar(escenario, lienzo) {
    if (!escenario || !escenario.clientWidth) return;
    const ancho = Number(lienzo.dataset.ancho);
    const alto = Number(lienzo.dataset.alto);
    const k = Math.max(0.6, Math.min(1, (escenario.clientWidth - 32) / ancho));
    lienzo.style.transform = k < 1 ? `scale(${k})` : "";
    const marco = lienzo.parentElement;
    marco.style.width = `${ancho * k}px`;
    marco.style.height = `${alto * k}px`;
  }

  function retirar(nodo) {
    nodo.removeAttribute("data-id");
    nodo.classList.add("saliendo");
    setTimeout(() => nodo.remove(), 400);
  }

  // El número con sus dígitos; en radix sort, el dígito de exp resaltado.
  function contenidoBarra(s, b, exp) {
    const piezas = [];
    if (exp) {
      const txt = String(b.v).padStart(s.digitos, "0");
      const pos = txt.length - 1 - Math.round(Math.log10(exp));
      const numero = el("span", { class: "ord-num" });
      [...txt].forEach((d, k) => {
        const ceroIzq = k < txt.length - String(b.v).length;
        numero.append(el("span", { class: `${k === pos ? "snc-digito" : ""}${ceroIzq ? " snc-cero" : ""}`.trim() || null, text: d }));
      });
      piezas.push(numero);
    } else {
      piezas.push(el("span", { class: "ord-num", text: b.v }));
    }
    if (b.e) piezas.push(el("span", { class: `ord-letra ${b.e}`, text: b.e }));
    return piezas;
  }

  function dibujar(escenario, s) {
    escenario.classList.add("snc");
    const lienzo = escenario.querySelector(".ord-lienzo") || crearLienzo(escenario);
    const vis = s.vis || {};
    const g = geometria(s);
    lienzo.style.width = `${g.ancho}px`;
    lienzo.style.height = `${g.alto}px`;
    lienzo.dataset.ancho = g.ancho;
    lienzo.dataset.alto = g.alto;
    escalar(escenario, lienzo);
    lienzo.classList.remove("sacudir");
    if (vis.error) {
      void lienzo.offsetWidth;
      lienzo.classList.add("sacudir");
    }

    const cuenta = DS.variables(s.cuenta, vis.cambio);
    cuenta.classList.add("ord-cuenta");
    escenario.querySelector(".ord-info").replaceChildren(
      DS.variables(vis.vars || { n: s.v.length }, vis.cambio),
      cuenta,
      el("span", { class: "snc-sin-comparar", text: "comparaciones = 0" }));

    // Capa fija: títulos, índices, casillas de conteo y cajas de las cubetas.
    const piezas = [];
    const titulo = (y, txt) => piezas.push(el("span", { class: "fila-titulo snc-titulo", style: `left:${MARGEN - 6}px;top:${y}px`, text: txt }));
    titulo(0, s.modo === "contar" ? "v (se reescribe al final)" : "v");
    s.v.forEach((_, k) => piezas.push(el("span", { class: "indice ord-indice", style: `left:${xDe(k)}px;top:${g.yBaseV + 3}px;width:${ANCHO}px`, text: k })));
    if (s.modo === "bucket") {
      titulo(g.yCubetas, `cubetas (cada una, un tramo de ${Math.ceil((s.maximo + 1) / s.numCubetas)} valores)`);
      const ancho = Math.ceil((s.maximo + 1) / s.numCubetas);
      for (let c = 0; c < s.numCubetas; c++) {
        const col = cubetaX(s, g, c);
        const clases = `snc-cubeta${vis.cubetaActiva === c ? " activa" : ""}${vis.cubetaOrdenada === c ? " ordenada" : ""}${!s.cubetas ? " vacia" : ""}`;
        piezas.push(el("div", { class: clases, style: `left:${col.x}px;top:${g.yCubetas + TITULO}px;width:${col.ancho}px;height:${g.altoCubeta}px` }));
        piezas.push(el("span", { class: "indice snc-tramo", style: `left:${col.x}px;top:${g.yCubetas + TITULO + g.altoCubeta + 2}px;width:${col.ancho}px`, text: `${c}: ${c * ancho}..${Math.min(s.maximo, (c + 1) * ancho - 1)}` }));
      }
    } else {
      titulo(g.yConteo, s.modo === "radix" ? "conteo[d] (d = dígito)" : "conteo[valor]");
      for (let k = 0; k < s.columnasConteo; k++) {
        piezas.push(el("span", { class: "indice ord-indice", style: `left:${xDe(k)}px;top:${g.yConteo + TITULO + CASILLA + 1}px;width:${ANCHO}px`, text: k }));
      }
      if (s.ySalida !== null && g.ySalida != null) {
        titulo(g.ySalida, "salida");
        for (let k = 0; k < s.v.length; k++) {
          piezas.push(el("div", { class: `snc-hueco${s.salida ? "" : " sin-reservar"}`, style: `left:${xDe(k)}px;top:${g.yBaseS - 10}px;width:${ANCHO}px` }));
          piezas.push(el("span", { class: "indice ord-indice", style: `left:${xDe(k)}px;top:${g.yBaseS + 3}px;width:${ANCHO}px`, text: k }));
        }
      }
    }
    lienzo.querySelector(".ord-capa").replaceChildren(...piezas);

    // Casillas de conteo: persistentes, su número cambia con un "pop".
    let capaConteo = lienzo.querySelector(".snc-conteo");
    if (!capaConteo) {
      capaConteo = el("div", { class: "snc-conteo" });
      lienzo.append(capaConteo);
    }
    const casillas = s.modo === "bucket" ? 0 : s.columnasConteo;
    for (let k = 0; k < Math.max(casillas, capaConteo.children.length); k++) {
      let caja = capaConteo.children[k];
      if (k >= casillas) { if (caja) caja.remove(); continue; }
      if (!caja) {
        caja = el("div", { class: "snc-casilla" });
        capaConteo.append(caja);
      }
      const valor = s.conteo ? s.conteo[k] : "";
      if (caja.textContent !== String(valor)) {
        caja.textContent = valor;
      }
      caja.style.left = `${xDe(k)}px`;
      caja.style.top = `${g.yConteo + TITULO}px`;
      const escrita = (vis.conteoEscrito || []).includes(k);
      caja.className = `snc-casilla${s.conteo ? "" : " sin-reservar"}${escrita ? " escrita" : ""}${(vis.conteoLeido || []).includes(k) ? " leida" : ""}${vis.conteoNuevo ? " nueva" : ""}`;
      if (escrita) { caja.classList.remove("pop"); void caja.offsetWidth; caja.classList.add("pop"); }
    }

    // Barras: v, salida y cubetas, por id. Las nuevas vuelan desde "de".
    const vivas = new Set();
    const ubicar = (b, x, yAbajo, clases, alto) => {
      vivas.add(b.id);
      const h = alto || altoDe(s, b.v);
      let nodo = lienzo.querySelector(`.ord-barra[data-id="${b.id}"]`);
      const nueva = !nodo;
      if (nueva) {
        nodo = el("div", { class: "ord-barra", "data-id": b.id, style: `left:${x}px;top:${yAbajo - h}px;height:${h}px` });
        if (b.de) {
          const o = posicion(s, g, b.de);
          nodo.style.setProperty("--dx", `${o.x - x}px`);
          nodo.style.setProperty("--dy", `${o.y - (yAbajo - h)}px`);
          if (b.retraso) nodo.style.animationDelay = `${Math.min(b.retraso, 12) * 60}ms`;
        }
        lienzo.append(nodo);
      }
      const moviendo = !nueva && (nodo.style.left !== `${x}px` || nodo.style.top !== `${yAbajo - h}px`);
      nodo.style.left = `${x}px`;
      nodo.style.top = `${yAbajo - h}px`;
      nodo.style.height = `${h}px`;
      nodo.replaceChildren(...contenidoBarra(s, b, vis.exp || s.exp));
      const vuela = nueva && b.de;
      nodo.className = ["ord-barra", ...clases, moviendo ? "moviendo" : "", vuela ? "vuela" : nueva ? "aparece" : "", alto ? "snc-ficha" : ""].filter(Boolean).join(" ");
    };
    const enRango = (r, k) => r && (r.length === 1 ? r[0] === k : k >= r[0] && k <= r[r.length - 1]);
    s.v.forEach((b, k) => {
      const clases = [];
      if (s.listos) clases.push("fija");
      if ((vis.leidas || []).includes(k)) clases.push("comparando");
      if (enRango(vis.escritas, k)) clases.push("escrita");
      if ((vis.malas || []).includes(k)) clases.push("mala");
      ubicar(b, xDe(k), g.yBaseV, clases);
    });
    (s.salida || []).forEach((b, k) => {
      if (!b) return;
      const clases = s.salidaLista ? ["fija"] : [];
      if ((vis.escritasSalida || []).includes(k)) clases.push("escrita");
      ubicar(b, xDe(k), g.yBaseS, clases);
    });
    (s.cubetas || []).forEach((cubeta, c) => {
      cubeta.forEach((b, j) => {
        const p = posicion(s, g, ["cubeta", c, j]);
        ubicar(b, p.x, p.y + FICHA, vis.cubetaActiva === c ? ["escrita"] : [], FICHA);
      });
    });
    for (const nodo of lienzo.querySelectorAll(".ord-barra[data-id]")) if (!vivas.has(nodo.dataset.id)) retirar(nodo);

    // Fichas de un solo paso (+1 hacia conteo, +k en las sumas acumuladas).
    for (const viejo of lienzo.querySelectorAll(".snc-vuelo")) viejo.remove();
    for (const f of s.vuelos || []) {
      const a = posicion(s, g, f.a);
      const d = posicion(s, g, f.de);
      const ficha = el("span", { class: "snc-vuelo", text: f.texto, style: `left:${a.x + ANCHO / 2}px;top:${a.y - 6}px;--dx:${d.x - a.x}px;--dy:${d.y - a.y}px;animation-delay:${Math.min(f.retraso || 0, 12) * 50}ms` });
      lienzo.append(ficha);
    }

    // Punteros en v y en salida.
    const capa = lienzo.querySelector(".ord-punteros");
    const usados = new Set();
    const poner = (nombre, k, yBase) => {
      usados.add(nombre);
      let nodo = capa.querySelector(`[data-nombre="${nombre}"]`);
      if (!nodo) {
        nodo = el("span", { class: "ord-puntero", "data-nombre": nombre, style: `left:${xDe(k) + ANCHO / 2}px;top:${yBase + 17}px` });
        capa.append(nodo);
      }
      nodo.textContent = `▲ ${nombre}`;
      nodo.style.left = `${xDe(k) + ANCHO / 2}px`;
      nodo.style.top = `${yBase + 17}px`;
    };
    for (const [nombre, k] of Object.entries(vis.punteros || {})) poner(nombre, k, g.yBaseV);
    for (const [nombre, k] of Object.entries(vis.punterosSalida || {})) poner(nombre, k, g.yBaseS);
    for (const nodo of capa.querySelectorAll(".ord-puntero")) if (!usados.has(nodo.dataset.nombre)) nodo.remove();
  }

  // ------------------------------------------------------------------
  // Visualizadores de la lección
  // ------------------------------------------------------------------

  function alAzar(cantidad, maximo) {
    return Array.from({ length: cantidad }, () => Math.floor(Math.random() * (maximo + 1)));
  }

  function tema(contenedor, cfg) {
    DS.tema(Object.assign({ contenedor, incremental: true, dibujar, tituloCodigo: (clave) => `${clave}()` }, cfg));
  }

  const OPCIONES_DETALLE = [["detalle", "Paso a paso"], ["resumen", "Resumido"]];

  // Paso 1: contar y reescribir.
  const CONTAR = { main: [4, 1, 3, 4, 0, 2, 1], azar: () => alAzar(8, 5), iguales: [2, 2, 2, 0, 2, 2] };
  tema("vis-contar", {
    codigo: fragmentos("contarYReescribir"),
    entradas: [{ id: "arreglo", etiqueta: "Arreglo", opciones: [["main", "El de main()"], ["azar", "Al azar (0 a 5)"], ["iguales", "Casi todos iguales"]] }],
    estadoInicial: (valores) => {
      const datos = typeof CONTAR[valores.arreglo] === "function" ? CONTAR[valores.arreglo]() : CONTAR[valores.arreglo];
      return estadoDesde(datos, "contar", { maximo: Math.max(4, ...datos) });
    },
    mensajeInicial: "Valores entre 0 y maximo. Pulsa contarYReescribir: cada valor manda un +1 a su casilla de conteo.",
    operaciones: [{
      id: "contar",
      codigo: "contarYReescribir",
      etiqueta: (valores) => `contarYReescribir(v, ${valores.arreglo === "azar" ? 5 : 4})`,
      ejecutar(s, args, paso) { prepararCorrida(s); animarContar(s, paso); },
    }],
  });

  // Paso 2: countingSort estable (con dos 4 marcados) y el error de rango.
  const COUNTING = {
    main: [{ v: 4, e: "a" }, 1, 3, { v: 4, e: "b" }, 0, 2, 1],
    fuera: [3, 7, 1],
  };
  tema("vis-counting", {
    codigo: fragmentos("countingSort"),
    entradas: [
      { id: "arreglo", etiqueta: "Arreglo", opciones: [["main", "El de main(), con 4ᵃ y 4ᵇ"], ["fuera", "{ 3, 7, 1 } con maximo = 4"]] },
      { id: "detalle", etiqueta: "", opciones: OPCIONES_DETALLE, reinicia: false },
    ],
    estadoInicial: (valores) => estadoDesde(COUNTING[valores.arreglo], "counting", { maximo: 4 }),
    mensajeInicial: "Los dos 4 están marcados ᵃ y ᵇ. Fíjate en las sumas acumuladas: dicen dónde termina cada valor en la salida.",
    operaciones: [{
      id: "counting",
      codigo: "countingSort",
      etiqueta: "countingSort(v, 4)",
      usa: ["detalle"],
      ejecutar(s, { detalle }, paso) { prepararCorrida(s); animarCounting(s, paso, detalle === "detalle"); },
    }],
  });

  // Paso 3: radixSort.
  const RADIX = { main: [170, 45, 75, 90, 802, 24, 2, 66], azar: () => alAzar(8, 999) };
  tema("vis-radix", {
    codigo: fragmentos("radixSort", "ordenarPorDigito"),
    entradas: [
      { id: "arreglo", etiqueta: "Arreglo", opciones: [["main", "El de main()"], ["azar", "Al azar (0 a 999)"]] },
      { id: "detalle", etiqueta: "", opciones: [["resumen", "Resumido"], ["detalle", "Paso a paso"]], reinicia: false },
    ],
    estadoInicial: (valores) => estadoDesde(typeof RADIX[valores.arreglo] === "function" ? RADIX[valores.arreglo]() : RADIX[valores.arreglo], "radix"),
    mensajeInicial: "Una pasada por dígito, de las unidades a las centenas. El dígito que manda en cada pasada se resalta.",
    operaciones: [{
      id: "radix",
      codigo: "radixSort",
      etiqueta: "radixSort(v)",
      usa: ["detalle"],
      ejecutar(s, { detalle }, paso) { prepararCorrida(s); animarRadix(s, paso, detalle === "detalle"); },
    }],
  });

  // Paso 4: bucketSort.
  const BUCKET = { main: [42, 7, 93, 15, 68, 31, 84, 59, 3, 26], amontonado: [41, 47, 43, 45, 2, 44, 48, 40, 46, 42], azar: () => alAzar(10, 99) };
  tema("vis-bucket", {
    codigo: fragmentos("bucketSort"),
    entradas: [
      { id: "arreglo", etiqueta: "Arreglo", opciones: [["main", "Parejos"], ["amontonado", "Amontonados"], ["azar", "Al azar"]] },
      { id: "detalle", etiqueta: "", opciones: [["resumen", "Resumido"], ["detalle", "Paso a paso"]], reinicia: false },
    ],
    estadoInicial: (valores) => estadoDesde(typeof BUCKET[valores.arreglo] === "function" ? BUCKET[valores.arreglo]() : BUCKET[valores.arreglo], "bucket", { maximo: 99, numCubetas: 5, filasCubeta: valores.arreglo === "amontonado" ? 9 : 4 }),
    mensajeInicial: "Valores de 0 a 99 en 5 cubetas de 20. Prueba también \"Amontonados\": todos caen en la misma cubeta.",
    operaciones: [{
      id: "bucket",
      codigo: "bucketSort",
      etiqueta: "bucketSort(v, 99, 5)",
      usa: ["detalle"],
      ejecutar(s, { detalle }, paso) { prepararCorrida(s); animarBucket(s, paso, detalle === "detalle"); },
    }],
  });

  // Paso 6: todo junto.
  const ALGORITMOS = {
    contarYReescribir: { modo: "contar", datos: () => alAzar(8, 9), opciones: { maximo: 9 }, animar: (s, paso) => animarContar(s, paso), etiqueta: "contarYReescribir(v, 9)" },
    countingSort: { modo: "counting", datos: () => alAzar(8, 9), opciones: { maximo: 9 }, animar: animarCounting, etiqueta: "countingSort(v, 9)" },
    radixSort: { modo: "radix", datos: () => alAzar(8, 999), opciones: {}, animar: animarRadix, etiqueta: "radixSort(v)" },
    bucketSort: { modo: "bucket", datos: () => alAzar(10, 99), opciones: { maximo: 99, numCubetas: 5, filasCubeta: 5 }, animar: animarBucket, etiqueta: "bucketSort(v, 99, 5)" },
  };
  tema("vis-todo", {
    codigo: fragmentos("contarYReescribir", "countingSort", "radixSort", "ordenarPorDigito", "bucketSort"),
    codigoInicial: (valores) => valores.algoritmo,
    entradas: [
      { id: "algoritmo", etiqueta: "Algoritmo", opciones: Object.keys(ALGORITMOS).map((a) => [a, a]), valor: "countingSort" },
      { id: "detalle", etiqueta: "", opciones: [["resumen", "Resumido"], ["detalle", "Paso a paso"]], reinicia: false },
    ],
    estadoInicial: (valores) => {
      const a = ALGORITMOS[valores.algoritmo];
      return estadoDesde(a.datos(), a.modo, Object.assign({}, a.opciones));
    },
    mensajeInicial: "Elige un algoritmo y ordena. Reiniciar trae otro arreglo al azar.",
    operaciones: [{
      id: "ordenar",
      etiqueta: (valores) => ALGORITMOS[valores.algoritmo].etiqueta,
      usa: ["algoritmo", "detalle"],
      ejecutar(s, { algoritmo, detalle }, paso) {
        prepararCorrida(s);
        ALGORITMOS[algoritmo].animar(s, paso, detalle === "detalle");
      },
    }],
  });

  // ------------------------------------------------------------------
  // Paso 5: carrera. Trabajo y memoria según n y el rango de valores k.
  // ------------------------------------------------------------------

  function medir(algoritmo, v, k) {
    const n = v.length;
    if (algoritmo === "countingSort") return { trabajo: 2 * n + k, memoria: k + 1 + n };
    if (algoritmo === "radixSort") {
      const d = String(Math.max(1, k)).length;
      return { trabajo: d * (3 * n + 9), memoria: n + 10 };
    }
    if (algoritmo === "bucketSort") {
      // n cubetas; cada una se ordena con insertion sort (contando comparaciones).
      const cubetas = Array.from({ length: n }, () => []);
      for (const x of v) cubetas[Math.floor((x * n) / (k + 1))].push(x);
      let trabajo = 2 * n + n;
      for (const c of cubetas) {
        for (let i = 1; i < c.length; i++) {
          const clave = c[i];
          let j = i - 1;
          while (j >= 0 && (trabajo++, c[j] > clave)) { c[j + 1] = c[j]; j--; }
          c[j + 1] = clave;
        }
      }
      return { trabajo, memoria: 2 * n };
    }
    // quickSort aleatorio (comparaciones), con pila explícita.
    const a = [...v];
    let trabajo = 0;
    const pila = [[0, n - 1]];
    while (pila.length) {
      const [bajo, alto] = pila.pop();
      if (bajo >= alto) continue;
      const r = bajo + Math.floor(Math.random() * (alto - bajo + 1));
      [a[r], a[alto]] = [a[alto], a[r]];
      const pivote = a[alto];
      let i = bajo - 1;
      for (let j = bajo; j < alto; j++) { trabajo++; if (a[j] <= pivote) { i++; [a[i], a[j]] = [a[j], a[i]]; } }
      [a[i + 1], a[alto]] = [a[alto], a[i + 1]];
      pila.push([i + 2, alto], [bajo, i]);
    }
    return { trabajo, memoria: Math.ceil(Math.log2(Math.max(2, n))) };
  }

  function montarCarrera() {
    const caja = document.getElementById("vis-carrera");
    if (!caja) return;
    const CORREDORES = ["countingSort", "radixSort", "bucketSort", "quickSortAleatorio"];
    const formato = (x) => x.toLocaleString("es");
    const selN = el("select", { id: "snc-carrera-n" }, [1000, 100000].map((n) => el("option", { value: n, text: formato(n) })));
    const selK = el("select", { id: "snc-carrera-k" }, [99, 9999, 9999999].map((k) => el("option", { value: k, text: `0 a ${formato(k)}` })));
    const filas = CORREDORES.map((a) => {
      const barra = el("span", { class: "ord-carrera-barra comparaciones" });
      const num = el("span", { class: "ord-carrera-num" });
      const memoria = el("span", { class: "dyv-carrera-dato" });
      const fila = el("div", { class: "ord-carrera-fila dyv-carrera-fila" },
        el("code", { class: "ord-carrera-nombre", text: a }),
        el("div", { class: "ord-carrera-pista" }, el("span", { class: "ord-carrera-carril" }, barra), num),
        memoria);
      return { a, fila, barra, num, memoria };
    });
    const referencia = el("p", { class: "ord-carrera-referencia", "aria-live": "polite" });

    function correr() {
      const n = Number(selN.value);
      const k = Number(selK.value);
      const v = Array.from({ length: n }, () => Math.floor(Math.random() * (k + 1)));
      const r = filas.map((f) => medir(f.a, v, k));
      const maximo = Math.max(1, ...r.map((x) => x.trabajo));
      filas.forEach((f, j) => {
        f.barra.style.width = `${(r[j].trabajo / maximo) * 100}%`;
        f.num.textContent = formato(r[j].trabajo);
        f.memoria.textContent = formato(r[j].memoria);
        f.fila.classList.remove("nueva");
        void f.fila.offsetWidth;
        f.fila.classList.add("nueva");
      });
      const mejor = filas[r.findIndex((x) => x.trabajo === Math.min(...r.map((y) => y.trabajo)))].a;
      referencia.textContent = `n = ${formato(n)}, k = ${formato(k + 1)} valores posibles. Menos trabajo: ${mejor}. Para comparar: n log₂ n ≈ ${formato(Math.round(n * Math.log2(n)))}.`;
    }

    selN.addEventListener("change", correr);
    selK.addEventListener("change", correr);
    caja.classList.add("panel", "ord-carrera");
    caja.append(
      el("div", { class: "controles" },
        el("label", { class: "campo", for: "snc-carrera-n" }, "n", selN),
        el("label", { class: "campo", for: "snc-carrera-k" }, "Valores", selK),
        el("button", { class: "boton principal", type: "button", text: "Otro arreglo", onclick: correr })),
      el("div", { class: "ord-carrera-cuerpo" },
        el("div", { class: "ord-carrera-fila dyv-carrera-fila ord-carrera-titulos" }, el("span"), el("span", { text: "pasos de trabajo" }), el("span", { text: "memoria extra" })),
        filas.map((f) => f.fila),
        referencia));
    correr();
  }

  if (typeof document !== "undefined") montarCarrera();
})();
