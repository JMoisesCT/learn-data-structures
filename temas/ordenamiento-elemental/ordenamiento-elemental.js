// Lección de los ordenamientos elementales, en pasos. Los fragmentos de
// código deben coincidir línea por línea con
// ejemplos/cpp/ordenamiento_elemental.cpp (scripts/verificar-fragmentos.mjs
// lo revisa).
(function () {
  const { el } = DS;
  const PASO = 50; // de una barra a la siguiente
  const ANCHO_BARRA = 40;
  const MARGEN = 44; // deja lugar a la izquierda para j = -1
  const ALTO_MAX = 92;
  const ALTO_MIN = 26;
  const CARRIL = ALTO_MAX + 26; // arriba de las barras: donde espera la clave
  const CABEZA = 18; // etiqueta de la zona ordenada
  const PIE = 50; // índices y hasta dos filas de punteros
  const EJEMPLO = [5, 2, 8, 1, 9, 3]; // el mismo arreglo que usa main()
  const EJEMPLO_SHELL = [23, 29, 15, 19, 31, 7, 9, 5];

  // ------------------------------------------------------------------
  // Fragmentos de C++ (copiados de ejemplos/cpp/ordenamiento_elemental.cpp)
  // ------------------------------------------------------------------

  const CODIGO = {
    estaOrdenado: `
      bool estaOrdenado(const vector<int>& v) {
          for (size_t i = 1; i < v.size(); i++) {
              if (v[i - 1] > v[i]) {
                  return false;
              }
          }
          return true;
      }`,
    exchangeSort: `
      void exchangeSort(vector<int>& v) {
          int n = v.size();
          for (int i = 0; i < n - 1; i++) {
              for (int j = i + 1; j < n; j++) {
                  if (v[j] < v[i]) {
                      swap(v[i], v[j]);
                  }
              }
          }
      }`,
    bubbleSort: `
      void bubbleSort(vector<int>& v) {
          int n = v.size();
          for (int i = 0; i < n - 1; i++) {
              bool huboIntercambio = false;
              for (int j = 0; j < n - 1 - i; j++) {
                  if (v[j] > v[j + 1]) {
                      swap(v[j], v[j + 1]);
                      huboIntercambio = true;
                  }
              }
              if (!huboIntercambio) {
                  break;
              }
          }
      }`,
    selectionSort: `
      void selectionSort(vector<int>& v) {
          int n = v.size();
          for (int i = 0; i < n - 1; i++) {
              int minimo = i;
              for (int j = i + 1; j < n; j++) {
                  if (v[j] < v[minimo]) {
                      minimo = j;
                  }
              }
              if (minimo != i) {
                  swap(v[i], v[minimo]);
              }
          }
      }`,
    insertionSort: `
      void insertionSort(vector<int>& v) {
          int n = v.size();
          for (int i = 1; i < n; i++) {
              int clave = v[i];
              int j = i - 1;
              while (j >= 0 && v[j] > clave) {
                  v[j + 1] = v[j];
                  j--;
              }
              v[j + 1] = clave;
          }
      }`,
    shellSort: `
      void shellSort(vector<int>& v) {
          int n = v.size();
          for (int salto = n / 2; salto > 0; salto /= 2) {
              for (int i = salto; i < n; i++) {
                  int clave = v[i];
                  int j = i;
                  while (j >= salto && v[j - salto] > clave) {
                      v[j] = v[j - salto];
                      j -= salto;
                  }
                  v[j] = clave;
              }
          }
      }`,
  };

  const ALGORITMOS = ["exchangeSort", "bubbleSort", "selectionSort", "insertionSort", "shellSort"];
  // Los que guardan una clave aparte y desplazan (en lugar de intercambiar).
  const CON_CLAVE = new Set(["insertionSort", "shellSort"]);

  // ------------------------------------------------------------------
  // Estado: cada valor es una barra con id, para que se deslice cuando el
  // C++ la mueve. Las copias (lo que queda en una casilla después de
  // v[j + 1] = v[j]) son barras atenuadas con otro id.
  // ------------------------------------------------------------------

  // Cada arreglo nuevo tiene sus propios ids: las barras viejas se desvanecen.
  let lotes = 0;

  function nuevaBarra(s, v, e, extra) {
    return Object.assign({ id: `b${s.lote}-${s.sig++}`, v }, e ? { e } : {}, extra);
  }

  function estadoDesde(valores, algoritmo) {
    const s = { lote: ++lotes, sig: 1, items: [], carril: null, zona: null, vis: {} };
    for (const x of valores) {
      const v = typeof x === "object" ? x.v : x;
      s.items.push(nuevaBarra(s, v, typeof x === "object" ? x.e : null));
    }
    s.maxV = Math.max(1, ...s.items.map((b) => b.v));
    prepararCorrida(s, algoritmo);
    return s;
  }

  // Cada corrida empieza con los contadores en cero.
  function prepararCorrida(s, algoritmo) {
    s.conCarril = CON_CLAVE.has(algoritmo);
    s.cuenta = { comparaciones: 0, [s.conCarril ? "desplazamientos" : "intercambios"]: 0 };
    s.zona = null;
    s.carril = null;
  }

  const LETRA = { a: "ᵃ", b: "ᵇ" };
  const texto = (b) => `${b.v}${b.e ? LETRA[b.e] : ""}`;
  const val = (s, k) => texto(s.items[k]);
  const ordenEtiquetas = (s) => s.items.filter((b) => b.e && !b.copia).map((b) => b.e).join("");

  // Si dos valores iguales cambiaron de orden, lo dice (para el paso de estabilidad).
  function notaEstabilidad(s, antes) {
    const ahora = ordenEtiquetas(s);
    if (antes.length < 2 || antes === ahora) return "";
    const iguales = s.items.find((b) => b.e && !b.copia).v;
    return ` Ojo: ${iguales}ᵃ y ${iguales}ᵇ acaban de cambiar de orden.`;
  }

  function intercambiar(s, a, b) {
    const antes = ordenEtiquetas(s);
    [s.items[a], s.items[b]] = [s.items[b], s.items[a]];
    s.cuenta.intercambios = (s.cuenta.intercambios || 0) + 1;
    return notaEstabilidad(s, antes);
  }

  // clave = v[i]: el valor sube al carril y en v[i] queda una copia.
  function levantar(s, i) {
    const b = s.items[i];
    s.carril = { id: b.id, v: b.v, e: b.e, x: i };
    s.items[i] = nuevaBarra(s, b.v, b.e, { copia: true });
  }

  // v[destino] = v[origen]: la barra viaja y en el origen queda una copia.
  function desplazar(s, origen, destino) {
    const b = s.items[origen];
    s.items[destino] = { id: b.id, v: b.v, e: b.e };
    s.items[origen] = nuevaBarra(s, b.v, b.e, { copia: true });
    s.carril.x = origen;
    s.cuenta.desplazamientos++;
  }

  // v[k] = clave: la clave baja del carril y pisa la copia que había ahí.
  function soltar(s, k) {
    const c = s.carril;
    s.items[k] = { id: c.id, v: c.v, e: c.e };
    s.carril = null;
  }

  // Varios punteros en la misma posición se apilan (ver dibujar).
  function ver(s, o) {
    s.vis = Object.assign({}, o);
  }

  function resumen(s) {
    const c = s.cuenta;
    const otro = c.desplazamientos != null ? `${c.desplazamientos} desplazamiento(s)` : `${c.intercambios} intercambio(s)`;
    return `${c.comparaciones} comparación(es) y ${otro}`;
  }

  function terminar(s) {
    s.zona = s.items.length ? { desde: 0, hasta: s.items.length - 1, tipo: "final" } : null;
  }

  // ------------------------------------------------------------------
  // Animaciones de cada algoritmo
  // ------------------------------------------------------------------

  function animarExchange(s, paso) {
    const K = "exchangeSort";
    const n = s.items.length;
    ver(s, { vars: { n } });
    paso(K, 2, n > 1
      ? `n = ${n}. Para cada posición i vamos a revisar todas las que vienen después y traer a v[i] cualquier valor menor.`
      : `n = ${n}: con ${n ? "un elemento" : "el arreglo vacío"} no hay nada que ordenar.`);
    for (let i = 0; i < n - 1; i++) {
      ver(s, { vars: { n, i }, punteros: { i }, vueltas: { 3: i + 1 } });
      paso(K, 3, (i ? `v[${i - 1}] = ${val(s, i - 1)} ya está en su lugar. ` : "")
        + `i = ${i}: al terminar esta vuelta, v[${i}] tendrá el menor de v[${i}..${n - 1}].`);
      for (let j = i + 1; j < n; j++) {
        const a = s.items[j].v;
        const b = s.items[i].v;
        const menor = a < b;
        s.cuenta.comparaciones++;
        const base = { vars: { n, i, j }, punteros: { i, j }, vueltas: { 3: i + 1, 4: j - i } };
        ver(s, Object.assign({ comparar: [i, j], veredicto: { texto: `v[j] < v[i]: ${val(s, j)} < ${val(s, i)}`, si: menor }, cambio: ["comparaciones"] }, base));
        paso(K, 5, menor
          ? `${val(s, j)} < ${val(s, i)}: v[${j}] es menor que v[${i}], así que se cambian de lugar.`
          : `${val(s, j)} no es menor que ${val(s, i)}: v[${i}] se queda como está.`);
        if (menor) {
          const nota = intercambiar(s, i, j);
          ver(s, Object.assign({ intercambio: [i, j], cambio: ["intercambios"] }, base));
          paso(K, 6, `swap(v[${i}], v[${j}]): ${val(s, i)} pasa a la posición ${i} y ${val(s, j)} a la ${j}.${nota}`);
        }
      }
      s.zona = { desde: 0, hasta: i, tipo: "final" };
    }
    terminar(s);
    ver(s, { vars: { n, i: Math.max(0, n - 1) }, vueltas: { 3: Math.max(0, n - 1) } });
    if (n > 1) {
      paso(K, 3, `i = ${n - 1} ya no cumple i < n − 1: el último quedó en su lugar solo. ¡Ordenado! ${resumen(s)}. Las comparaciones son siempre n(n − 1)/2 = ${n * (n - 1) / 2}, aunque ya estuviera ordenado.`, "exito");
    }
  }

  function animarBubble(s, paso) {
    const K = "bubbleSort";
    const n = s.items.length;
    ver(s, { vars: { n } });
    paso(K, 2, n > 1
      ? `n = ${n}. Vamos a comparar vecinos: si están al revés, se cambian. El mayor "burbujea" hasta el final.`
      : `n = ${n}: con ${n ? "un elemento" : "el arreglo vacío"} no hay nada que ordenar.`);
    for (let i = 0; i < n - 1; i++) {
      let hubo = false;
      const ultimo = n - 1 - i;
      ver(s, { vars: { n, i, huboIntercambio: "false" }, vueltas: { 3: i + 1 } });
      paso(K, 4, `Pasada ${i + 1}: huboIntercambio = false. Recorremos los vecinos de v[0] a v[${ultimo}]`
        + (i ? `; de v[${ultimo + 1}] en adelante ya está ordenado.` : "."));
      for (let j = 0; j < ultimo; j++) {
        const a = s.items[j].v;
        const b = s.items[j + 1].v;
        const mayor = a > b;
        s.cuenta.comparaciones++;
        const base = () => ({ vars: { n, i, j, huboIntercambio: String(hubo) }, punteros: { j, "j + 1": j + 1 }, vueltas: { 3: i + 1, 5: j + 1 } });
        ver(s, Object.assign({ comparar: [j, j + 1], veredicto: { texto: `v[j] > v[j + 1]: ${val(s, j)} > ${val(s, j + 1)}`, si: mayor }, cambio: ["comparaciones"] }, base()));
        paso(K, 6, mayor
          ? `${val(s, j)} > ${val(s, j + 1)}: estos vecinos están al revés.`
          : `${val(s, j)} no es mayor que ${val(s, j + 1)}: están en orden, seguimos.`);
        if (mayor) {
          const nota = intercambiar(s, j, j + 1);
          ver(s, Object.assign({ intercambio: [j, j + 1], cambio: ["intercambios"] }, base()));
          paso(K, 7, `swap(v[${j}], v[${j + 1}]): ${val(s, j + 1)} avanza una posición hacia el final.${nota}`);
          if (!hubo) {
            hubo = true;
            ver(s, Object.assign({ cambio: ["huboIntercambio"] }, base()));
            paso(K, 8, "huboIntercambio = true: en esta pasada algo se movió, así que todavía no sabemos si quedó ordenado.");
          }
        }
      }
      s.zona = { desde: ultimo, hasta: n - 1, tipo: "final" };
      ver(s, { vars: { n, i, huboIntercambio: String(hubo) }, vueltas: { 3: i + 1 } });
      paso(K, 11, hubo
        ? `Hubo intercambios. El mayor de v[0..${ultimo}] (${val(s, ultimo)}) burbujeó hasta v[${ultimo}]: ya está en su lugar.`
        : `¿!huboIntercambio? Sí: en toda la pasada no se movió nada, cada vecino está en orden.`);
      if (!hubo) {
        terminar(s);
        ver(s, { vars: { n, i, huboIntercambio: "false" }, vueltas: { 3: i + 1 } });
        paso(K, 12, `break: el arreglo ya está ordenado y no hace falta seguir. ¡Listo tras ${i + 1} pasada(s)! ${resumen(s)}.`, "exito");
        return;
      }
    }
    terminar(s);
    ver(s, { vars: { n, i: Math.max(0, n - 1) }, vueltas: { 3: Math.max(0, n - 1) } });
    if (n > 1) paso(K, 3, `i = ${n - 1} ya no cumple i < n − 1: v[0] es lo único que queda y ya está en su lugar. ¡Ordenado! ${resumen(s)}.`, "exito");
  }

  function animarSelection(s, paso) {
    const K = "selectionSort";
    const n = s.items.length;
    ver(s, { vars: { n } });
    paso(K, 2, n > 1
      ? `n = ${n}. En cada vuelta buscamos el mínimo de lo que falta y lo ponemos al principio.`
      : `n = ${n}: con ${n ? "un elemento" : "el arreglo vacío"} no hay nada que ordenar.`);
    for (let i = 0; i < n - 1; i++) {
      ver(s, { vars: { n, i }, punteros: { i }, vueltas: { 3: i + 1 } });
      paso(K, 3, `i = ${i}: buscamos el menor de v[${i}..${n - 1}] para ponerlo en v[${i}].`);
      let minimo = i;
      ver(s, { vars: { n, i, minimo }, punteros: { i, minimo }, minimo, vueltas: { 3: i + 1 }, cambio: ["minimo"] });
      paso(K, 4, `minimo = ${i}: por ahora, el menor que conocemos es v[${i}] = ${val(s, i)}.`);
      for (let j = i + 1; j < n; j++) {
        const menor = s.items[j].v < s.items[minimo].v;
        s.cuenta.comparaciones++;
        const base = () => ({ vars: { n, i, j, minimo }, punteros: { i, j, minimo }, minimo, vueltas: { 3: i + 1, 5: j - i } });
        ver(s, Object.assign({ comparar: [j, minimo], veredicto: { texto: `v[j] < v[minimo]: ${val(s, j)} < ${val(s, minimo)}`, si: menor }, cambio: ["comparaciones"] }, base()));
        paso(K, 6, menor
          ? `${val(s, j)} < ${val(s, minimo)}: encontramos uno más chico.`
          : `${val(s, j)} no es menor que ${val(s, minimo)}: el mínimo sigue siendo v[${minimo}].`);
        if (menor) {
          minimo = j;
          ver(s, Object.assign({ cambio: ["minimo"] }, base()));
          paso(K, 7, `minimo = ${j}. Solo anotamos la posición: todavía no se mueve nada.`);
        }
      }
      if (minimo !== i) {
        ver(s, { vars: { n, i, minimo }, punteros: { i, minimo }, minimo, comparar: [i, minimo], vueltas: { 3: i + 1 } });
        paso(K, 10, `minimo (${minimo}) ≠ i (${i}): el menor de lo que falta es ${val(s, minimo)} y no está en v[${i}].`);
        const antes = val(s, i);
        const nota = intercambiar(s, i, minimo);
        ver(s, { vars: { n, i, minimo }, punteros: { i, minimo }, intercambio: [i, minimo], vueltas: { 3: i + 1 }, cambio: ["intercambios"] });
        paso(K, 11, `swap(v[${i}], v[${minimo}]): ${val(s, i)} va a la posición ${i} y ${antes} se va a la ${minimo}. Un solo intercambio en toda la vuelta.${nota}`);
      } else {
        ver(s, { vars: { n, i, minimo }, punteros: { i, minimo }, minimo, vueltas: { 3: i + 1 } });
        paso(K, 10, `minimo == i: v[${i}] = ${val(s, i)} ya era el menor. No hace falta intercambiar.`);
      }
      s.zona = { desde: 0, hasta: i, tipo: "final" };
    }
    terminar(s);
    ver(s, { vars: { n, i: Math.max(0, n - 1) }, vueltas: { 3: Math.max(0, n - 1) } });
    if (n > 1) paso(K, 3, `i = ${n - 1} ya no cumple i < n − 1: el que queda es el mayor. ¡Ordenado! ${resumen(s)}.`, "exito");
  }

  function animarInsertion(s, paso) {
    const K = "insertionSort";
    const n = s.items.length;
    ver(s, { vars: { n } });
    paso(K, 2, n > 1
      ? `n = ${n}. Como al ordenar cartas en la mano: tomamos una y la metemos entre las que ya están ordenadas.`
      : `n = ${n}: con ${n ? "un elemento" : "el arreglo vacío"} no hay nada que ordenar.`);
    for (let i = 1; i < n; i++) {
      s.zona = { desde: 0, hasta: i - 1, tipo: "parcial" };
      ver(s, { vars: { n, i }, punteros: { i }, vueltas: { 3: i } });
      paso(K, 3, `i = ${i}: v[0..${i - 1}] ya están ordenados entre sí (todavía no en su lugar final). Toca meter v[${i}] = ${val(s, i)}.`);
      const clave = s.items[i].v;
      const nombreClave = val(s, i);
      levantar(s, i);
      ver(s, { vars: { n, i, clave: nombreClave }, punteros: { i }, vueltas: { 3: i }, cambio: ["clave"] });
      paso(K, 4, `clave = v[${i}] = ${nombreClave}: la guardamos aparte. En v[${i}] queda una copia que se puede pisar.`);
      let j = i - 1;
      ver(s, { vars: { n, i, clave: nombreClave, j }, punteros: { i, j }, vueltas: { 3: i }, cambio: ["j"] });
      paso(K, 5, `j = ${j}: empezamos por el vecino de la izquierda.`);
      let corridos = 0;
      for (;;) {
        const base = () => ({ vars: { n, i, clave: nombreClave, j }, punteros: { i, j }, vueltas: { 3: i, 6: corridos } });
        if (j < 0) {
          ver(s, Object.assign({ fuera: true }, base()));
          paso(K, 6, `j = -1: ya no queda nada a la izquierda. ${nombreClave} es el menor de los que van.`);
          break;
        }
        const mayor = s.items[j].v > clave;
        s.cuenta.comparaciones++;
        ver(s, Object.assign({ comparar: [j], compararClave: true, veredicto: { texto: `v[j] > clave: ${val(s, j)} > ${nombreClave}`, si: mayor }, cambio: ["comparaciones"] }, base()));
        paso(K, 6, mayor
          ? `${val(s, j)} > ${nombreClave}: ${val(s, j)} tiene que ir después de la clave.`
          : `${val(s, j)} no es mayor que ${nombreClave}: la clave va justo después de él, en v[${j + 1}].`);
        if (!mayor) break;
        desplazar(s, j, j + 1);
        corridos++;
        ver(s, Object.assign({ escrita: j + 1, cambio: ["desplazamientos"] }, base()));
        paso(K, 7, `v[${j + 1}] = v[${j}]: ${val(s, j + 1)} se corre a la derecha y la casilla ${j} queda libre. (Desplazar no es intercambiar: es una sola escritura.)`);
        j--;
      }
      const antes = ordenEtiquetas(s); // la clave está en el carril: no cuenta
      soltar(s, j + 1);
      ver(s, { vars: { n, i, clave: nombreClave, j }, punteros: { i, "j + 1": j + 1 }, escrita: j + 1, vueltas: { 3: i } });
      paso(K, 10, `v[${j + 1}] = clave: ${nombreClave} cae en el hueco.`
        + (corridos ? ` Corrimos ${corridos} valor(es) para hacerle lugar.` : " No hubo que correr nada: ya estaba en su lugar.")
        + (antes ? notaEstabilidad(s, antes) : ""));
    }
    terminar(s);
    ver(s, { vars: { n, i: Math.max(1, n) }, vueltas: { 3: Math.max(0, n - 1) } });
    if (n > 1) paso(K, 3, `i = ${n} ya no cumple i < n: la parte ordenada es todo el arreglo. ¡Ordenado! ${resumen(s)}.`, "exito");
  }

  function animarShell(s, paso) {
    const K = "shellSort";
    const n = s.items.length;
    ver(s, { vars: { n } });
    paso(K, 2, n > 1
      ? `n = ${n}. Es insertion sort, pero primero con saltos grandes: así los valores viajan lejos de un solo paso.`
      : `n = ${n}: con ${n ? "un elemento" : "el arreglo vacío"} no hay nada que ordenar.`);
    let pasada = 0;
    for (let salto = Math.floor(n / 2); salto > 0; salto = Math.floor(salto / 2)) {
      pasada++;
      ver(s, { vars: { n, salto }, vueltas: { 3: pasada }, grupos: salto, cambio: ["salto"] });
      paso(K, 3, salto > 1
        ? `salto = ${salto}: ordenamos por separado cada grupo de valores que están a ${salto} casillas (cada color es un grupo).`
        : "salto = 1: es un insertion sort normal, pero sobre un arreglo que ya quedó casi ordenado. Casi no hay que correr nada.");
      for (let i = salto; i < n; i++) {
        const grupo = [];
        for (let k = i % salto; k < n; k += salto) grupo.push(k);
        const clave = s.items[i].v;
        const nombreClave = val(s, i);
        const antes = ordenEtiquetas(s);
        levantar(s, i);
        let j = i;
        let corridos = 0;
        const base = () => ({ vars: { n, salto, i, clave: nombreClave, j }, punteros: { i, j }, grupo, grupos: salto, vueltas: { 3: pasada, 4: i - salto + 1, 7: corridos } });
        ver(s, Object.assign({ cambio: ["clave", "i"] }, base()));
        paso(K, 5, `i = ${i}: clave = v[${i}] = ${nombreClave}, y j = i. Solo miramos su grupo: las posiciones ${grupo.join(", ")}.`);
        for (;;) {
          if (j < salto) {
            ver(s, base());
            paso(K, 7, `j = ${j} no es ≥ salto (${salto}): no hay nada ${salto} casillas a la izquierda.`);
            break;
          }
          const mayor = s.items[j - salto].v > clave;
          s.cuenta.comparaciones++;
          ver(s, Object.assign({ comparar: [j - salto], compararClave: true, veredicto: { texto: `v[j − salto] > clave: ${val(s, j - salto)} > ${nombreClave}`, si: mayor }, cambio: ["comparaciones"] }, base()));
          paso(K, 7, mayor
            ? `${val(s, j - salto)} > ${nombreClave}: va después de la clave, aunque esté ${salto} casillas antes.`
            : `${val(s, j - salto)} no es mayor que ${nombreClave}: la clave se queda en v[${j}].`);
          if (!mayor) break;
          desplazar(s, j - salto, j);
          corridos++;
          ver(s, Object.assign({ escrita: j, cambio: ["desplazamientos"] }, base()));
          paso(K, 8, `v[${j}] = v[${j - salto}]: ${val(s, j)} salta ${salto} casillas a la derecha de una vez.`);
          j -= salto;
        }
        soltar(s, j);
        ver(s, Object.assign({ escrita: j }, base()));
        paso(K, 11, `v[${j}] = clave: ${nombreClave} cae en su lugar dentro del grupo.` + notaEstabilidad(s, antes));
      }
    }
    terminar(s);
    ver(s, { vars: { n, salto: 0 }, vueltas: { 3: pasada } });
    if (n > 1) paso(K, 3, `salto = 0 ya no cumple salto > 0. ¡Ordenado! ${resumen(s)}.`, "exito");
  }

  const ANIMAR = {
    exchangeSort: animarExchange,
    bubbleSort: animarBubble,
    selectionSort: animarSelection,
    insertionSort: animarInsertion,
    shellSort: animarShell,
  };

  function ordenar(algoritmo) {
    return (s, args, paso) => {
      const alg = (args && args.algoritmo) || algoritmo;
      prepararCorrida(s, alg);
      ANIMAR[alg](s, paso);
      if (ordenEtiquetas(s).length > 1) {
        const iguales = s.items.find((b) => b.e).v;
        const estable = ordenEtiquetas(s) === "ab";
        s.vis = { vars: { n: s.items.length }, malas: estable ? [] : s.items.map((b, k) => (b.e ? k : -1)).filter((k) => k >= 0) };
        paso(alg, 0, estable
          ? `${iguales}ᵃ sigue antes que ${iguales}ᵇ, como al principio: ${alg} fue estable con este arreglo.`
          : `${iguales}ᵇ quedó antes que ${iguales}ᵃ: los iguales se invirtieron. ${alg} no es estable.`, estable ? "exito" : "error");
      }
    };
  }

  // ------------------------------------------------------------------
  // Paso 1: estaOrdenado y swap a mano
  // ------------------------------------------------------------------

  const OP_ESTA_ORDENADO = {
    id: "estaOrdenado",
    etiqueta: "estaOrdenado(v)",
    codigo: "estaOrdenado",
    ejecutar(s, args, paso) {
      const K = "estaOrdenado";
      const n = s.items.length;
      s.zona = null;
      for (let i = 1; i < n; i++) {
        const mal = s.items[i - 1].v > s.items[i].v;
        s.cuenta.comparaciones++;
        ver(s, { vars: { i }, punteros: { "i − 1": i - 1, i }, comparar: [i - 1, i], veredicto: { texto: `v[i − 1] > v[i]: ${val(s, i - 1)} > ${val(s, i)}`, si: mal }, cambio: ["comparaciones"], vueltas: { 2: i } });
        paso(K, 3, mal
          ? `${val(s, i - 1)} > ${val(s, i)}: este par de vecinos está al revés.`
          : `${val(s, i - 1)} ≤ ${val(s, i)}: este par está en orden.`);
        if (mal) {
          ver(s, { vars: { i }, punteros: { "i − 1": i - 1, i }, malas: [i - 1, i], error: true, salida: "false", vueltas: { 2: i } });
          paso(K, 4, `return false: basta un par al revés para saber que no está ordenado. Usa swap para arreglarlo y vuelve a preguntar.`, "error");
          return;
        }
      }
      terminar(s);
      ver(s, { vars: { i: Math.max(1, n) }, salida: "true", vueltas: { 2: Math.max(0, n - 1) } });
      paso(K, 7, `return true: los ${Math.max(0, n - 1)} pares de vecinos están en orden. Hicimos n − 1 = ${Math.max(0, n - 1)} comparaciones.`, "exito");
    },
  };

  const OP_SWAP = {
    id: "swap",
    etiqueta: "swap(v[i], v[j])",
    usa: ["i", "j"],
    secundaria: true,
    ejecutar(s, { i, j }, paso) {
      const n = s.items.length;
      s.zona = null;
      for (const [nombre, k] of [["i", i], ["j", j]]) {
        if (k >= n) {
          ver(s, { vars: { i, j }, error: true });
          paso("estaOrdenado", 0, `v[${k}] no existe: el arreglo tiene ${n} elementos (posiciones 0 a ${n - 1}). En C++, ${nombre} = ${k} sería leer fuera del arreglo (comportamiento indefinido).`, "error");
          return;
        }
      }
      if (i === j) {
        ver(s, { vars: { i, j }, punteros: { "i, j": i } });
        paso("estaOrdenado", 0, `i == j: intercambiar v[${i}] consigo mismo no cambia nada.`);
        return;
      }
      intercambiar(s, i, j);
      ver(s, { vars: { i, j }, punteros: { i, j }, intercambio: [i, j], cambio: ["intercambios"] });
      paso("estaOrdenado", 0, `swap(v[${i}], v[${j}]): ${val(s, i)} y ${val(s, j)} cambian de lugar. Llevas ${s.cuenta.intercambios} intercambio(s). ¿Ya está ordenado? Pregúntale a estaOrdenado(v).`);
    },
  };

  // ------------------------------------------------------------------
  // Dibujo: barras cuya altura es el valor. Arriba, el carril donde espera
  // la clave (insertion y shell sort); abajo, índices y punteros.
  // ------------------------------------------------------------------

  const xDe = (k) => MARGEN + k * PASO;
  const altoDe = (s, v) => Math.round(ALTO_MIN + (ALTO_MAX - ALTO_MIN) * Math.max(0, v) / s.maxV);

  function geometria(s) {
    const yArriba = (s.conCarril ? CARRIL : 0) + CABEZA;
    const yBase = yArriba + ALTO_MAX;
    const n = Math.max(1, s.items.length);
    return { yArriba, yBase, alto: yBase + PIE, ancho: 2 * MARGEN + n * PASO - (PASO - ANCHO_BARRA) };
  }

  function crearLienzo(escenario) {
    const lienzo = el("div", { class: "ord-lienzo" }, el("div", { class: "ord-capa" }), el("div", { class: "ord-punteros" }));
    escenario.append(el("div", { class: "ord-info", "data-alto-estable": true }), el("div", { class: "ord-marco" }, lienzo));
    return lienzo;
  }

  if (typeof window !== "undefined") {
    window.addEventListener("resize", () => {
      for (const lienzo of document.querySelectorAll(".ord-lienzo")) escalar(lienzo.closest(".escenario"), lienzo);
    });
  }

  // En pantallas angostas reducimos el dibujo; si aun así no cabe, el escenario hace scroll.
  function escalar(escenario, lienzo) {
    if (!escenario || !escenario.clientWidth) return; // paso oculto: se mide al mostrarlo
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

  function contenidoBarra(b) {
    const piezas = [el("span", { class: "ord-num", text: b.v })];
    if (b.e) piezas.push(el("span", { class: `ord-letra ${b.e}`, text: b.e }));
    return piezas;
  }

  function dibujar(escenario, s) {
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
      void lienzo.offsetWidth; // reinicia la animación
      lienzo.classList.add("sacudir");
    }

    // Variables, contadores, la comparación de este paso y el valor devuelto.
    const cuenta = DS.variables(s.cuenta, vis.cambio);
    cuenta.classList.add("ord-cuenta");
    escenario.querySelector(".ord-info").replaceChildren(
      DS.variables(vis.vars || { n: s.items.length }, vis.cambio),
      cuenta,
      vis.veredicto ? el("span", { class: `ord-veredicto ${vis.veredicto.si ? "si" : "no"}` },
        el("code", { text: vis.veredicto.texto }), el("b", { text: vis.veredicto.si ? "→ sí" : "→ no" })) : "",
      vis.salida != null ? el("div", { class: "salida-valor" }, "devuelve", el("div", { class: `celda ${vis.salida === "false" ? "error" : "encontrada"}`, text: vis.salida })) : "");

    // Capa fija: carril de la clave, zona ordenada e índices.
    const n = s.items.length;
    const piezas = [];
    if (s.conCarril) {
      piezas.push(el("div", { class: "ord-carril", style: `left:${MARGEN - 10}px;top:4px;width:${g.ancho - 2 * MARGEN + 20}px;height:${CARRIL - 10}px` },
        el("span", { class: "ord-carril-nombre", text: "clave (fuera del arreglo)" })));
    }
    if (s.zona && s.zona.hasta >= s.zona.desde) {
      const ancho = (s.zona.hasta - s.zona.desde + 1) * PASO - (PASO - ANCHO_BARRA) + 8;
      piezas.push(el("div", { class: `ord-zona ${s.zona.tipo}`, style: `left:${xDe(s.zona.desde) - 4}px;top:${g.yArriba - 18}px;width:${ancho}px;height:${g.yBase - g.yArriba + 22}px` },
        ancho >= 92 ? el("span", { class: "ord-zona-texto", text: s.zona.tipo === "final" ? "en su lugar" : ancho >= 140 ? "ordenados entre sí" : "ordenados" }) : null));
    }
    for (let k = 0; k < n; k++) {
      piezas.push(el("span", { class: "indice ord-indice", style: `left:${xDe(k)}px;top:${g.yBase + 4}px;width:${ANCHO_BARRA}px`, text: k }));
    }
    if (!n) piezas.push(el("span", { class: "indice", style: `left:${MARGEN}px;top:${g.yBase - 20}px`, text: "(vacío)" }));
    // Colores de los grupos de shell sort: posiciones a distancia salto.
    if (vis.grupos > 1) {
      for (let k = 0; k < n; k++) {
        piezas.push(el("span", { class: `ord-grupo g${(k % vis.grupos) % 6 + 1}`, style: `left:${xDe(k)}px;top:${g.yBase + 2}px;width:${ANCHO_BARRA}px` }));
      }
    }
    lienzo.querySelector(".ord-capa").replaceChildren(...piezas);

    // Barras, por id: al moverse se deslizan; las nuevas aparecen y las viejas se desvanecen.
    const vivas = new Set();
    const ubicar = (b, x, yAbajo, clases) => {
      vivas.add(b.id);
      const h = altoDe(s, b.v);
      let nodo = lienzo.querySelector(`.ord-barra[data-id="${b.id}"]`);
      const nueva = !nodo;
      if (nueva) {
        nodo = el("div", { class: "ord-barra", "data-id": b.id, style: `left:${x}px;top:${yAbajo - h}px;height:${h}px` });
        lienzo.append(nodo);
      }
      const moviendo = !nueva && nodo.style.left !== `${x}px`;
      nodo.style.left = `${x}px`;
      nodo.style.top = `${yAbajo - h}px`;
      nodo.style.height = `${h}px`;
      nodo.replaceChildren(...contenidoBarra(b));
      const salta = clases.includes("salta");
      if (salta && nodo.classList.contains("salta")) {
        nodo.classList.remove("salta");
        void nodo.offsetWidth; // otra vez el mismo salto: reinicia la animación
      }
      nodo.className = ["ord-barra", ...clases, moviendo ? "moviendo" : "", nueva && !b.copia ? "aparece" : ""].filter(Boolean).join(" ");
    };
    const enZonaFinal = (k) => s.zona && s.zona.tipo === "final" && k >= s.zona.desde && k <= s.zona.hasta;
    s.items.forEach((b, k) => {
      const clases = [];
      if (b.copia) clases.push("copia");
      if (enZonaFinal(k) && !b.copia) clases.push("fija");
      if ((vis.comparar || []).includes(k)) clases.push("comparando");
      if ((vis.intercambio || []).includes(k)) clases.push("intercambio", ...(k === vis.intercambio[0] ? ["salta"] : []));
      if (vis.escrita === k) clases.push("escrita");
      if (vis.minimo === k) clases.push("minimo");
      if ((vis.malas || []).includes(k)) clases.push("mala");
      if (vis.grupo && !vis.grupo.includes(k)) clases.push("atenuada");
      if (vis.grupos > 1 && !b.copia) clases.push(`g${(k % vis.grupos) % 6 + 1}`);
      ubicar(b, xDe(k), g.yBase, clases);
    });
    if (s.carril) {
      ubicar(s.carril, xDe(s.carril.x), CARRIL - 8, ["flotante", vis.compararClave ? "comparando" : ""].filter(Boolean));
    }
    for (const nodo of lienzo.querySelectorAll(".ord-barra[data-id]")) if (!vivas.has(nodo.dataset.id)) retirar(nodo);

    // Punteros: cada uno es un elemento propio que se desliza a su nueva posición.
    const capaPunteros = lienzo.querySelector(".ord-punteros");
    const usados = new Set();
    const porPosicion = {};
    for (const [nombre, k] of Object.entries(vis.punteros || {})) {
      if (k == null) continue;
      const fila = porPosicion[k] = (porPosicion[k] || 0) + 1;
      usados.add(nombre);
      let nodo = capaPunteros.querySelector(`[data-nombre="${nombre}"]`);
      if (!nodo) {
        nodo = el("span", { class: "ord-puntero", "data-nombre": nombre, style: `left:${xDe(k) + ANCHO_BARRA / 2}px;top:${g.yBase + 18 + (fila - 1) * 14}px` });
        capaPunteros.append(nodo);
      }
      nodo.textContent = fila === 1 ? `▲ ${nombre}` : nombre;
      nodo.style.left = `${xDe(k) + ANCHO_BARRA / 2}px`;
      nodo.style.top = `${g.yBase + 18 + (fila - 1) * 14}px`;
      nodo.className = `ord-puntero${nombre === "minimo" ? " acento" : ""}${k < 0 || k >= n ? " fuera" : ""}`;
    }
    for (const nodo of capaPunteros.querySelectorAll(".ord-puntero")) if (!usados.has(nodo.dataset.nombre)) nodo.remove();
  }

  // ------------------------------------------------------------------
  // Arreglos de ejemplo
  // ------------------------------------------------------------------

  function alAzar(cantidad, maximo) {
    const usados = new Set();
    while (usados.size < cantidad) usados.add(Math.floor(Math.random() * maximo) + 1);
    return [...usados];
  }

  const ARREGLOS = {
    main: () => [...EJEMPLO],
    casi: () => [1, 2, 5, 3, 8, 9],
    reves: () => [9, 8, 5, 3, 2, 1],
    azar: () => alAzar(6, 30),
  };
  const ARREGLOS_SHELL = {
    main: () => [...EJEMPLO_SHELL],
    casi: () => [5, 7, 9, 19, 15, 23, 29, 31],
    reves: () => [31, 29, 23, 19, 15, 9, 7, 5],
    azar: () => alAzar(8, 40),
  };
  const OPCIONES_ARREGLO = [["main", "El de main()"], ["casi", "Casi ordenado"], ["reves", "Al revés"], ["azar", "Al azar"]];
  const entradaArreglo = { id: "arreglo", etiqueta: "Arreglo", opciones: OPCIONES_ARREGLO };

  function visualizador(contenedor, algoritmo, mensajeInicial, arreglos) {
    DS.tema({
      contenedor,
      incremental: true,
      dibujar,
      codigo: { [algoritmo]: CODIGO[algoritmo] },
      tituloCodigo: (clave) => `${clave}()`,
      entradas: [entradaArreglo],
      estadoInicial: (valores) => estadoDesde((arreglos || ARREGLOS)[valores.arreglo](), algoritmo),
      mensajeInicial,
      operaciones: [{ id: algoritmo, etiqueta: `${algoritmo}(v)`, codigo: algoritmo, ejecutar: ordenar(algoritmo) }],
    });
  }

  // Paso 1: ¿qué es estar ordenado?
  DS.tema({
    contenedor: "vis-idea",
    incremental: true,
    dibujar,
    codigo: { estaOrdenado: CODIGO.estaOrdenado },
    tituloCodigo: (clave) => `${clave}()`,
    entradas: [{ id: "i", etiqueta: "i", min: 0, max: 9, valor: 0 }, { id: "j", etiqueta: "j", min: 0, max: 9, valor: 2 }],
    estadoInicial: () => estadoDesde([4, 7, 1, 9, 5], "exchangeSort"),
    mensajeInicial: "Pregunta si está ordenado. Después ordénalo tú con swap(v[i], v[j]): ¿cuántos intercambios necesitas?",
    operaciones: [OP_ESTA_ORDENADO, OP_SWAP],
  });

  // Pasos 2 a 5 y 7: un algoritmo por paso.
  visualizador("vis-exchange", "exchangeSort",
    "El arreglo de main(). Pulsa exchangeSort(v): mira cómo v[0] se queda con el menor, después v[1], y así.");
  visualizador("vis-bubble", "bubbleSort",
    "Pulsa bubbleSort(v) y mira cómo el mayor burbujea hasta el final. Después prueba \"Casi ordenado\": termina antes.");
  visualizador("vis-selection", "selectionSort",
    "Pulsa selectionSort(v): el puntero minimo recorre lo que falta y se hace un solo swap por vuelta.");
  visualizador("vis-insertion", "insertionSort",
    "Pulsa insertionSort(v): la clave sube, los mayores se corren a la derecha y la clave cae en el hueco.");
  visualizador("vis-shell", "shellSort",
    "Pulsa shellSort(v): con salto = 4 cada color es un grupo que se ordena por su cuenta; al final, salto = 1.", ARREGLOS_SHELL);

  // Paso 6: estabilidad, con dos valores iguales marcados a y b.
  const OPCIONES_ALGORITMO = ALGORITMOS.map((a) => [a, a]);
  DS.tema({
    contenedor: "vis-estable",
    incremental: true,
    dibujar,
    codigo: Object.fromEntries(ALGORITMOS.map((a) => [a, CODIGO[a]])),
    codigoInicial: (valores) => valores.algoritmo,
    tituloCodigo: (clave) => `${clave}()`,
    entradas: [{ id: "algoritmo", etiqueta: "Algoritmo", opciones: OPCIONES_ALGORITMO, valor: "selectionSort" }],
    estadoInicial: (valores) => estadoDesde([{ v: 4, e: "a" }, 2, 3, { v: 4, e: "b" }, 1], valores.algoritmo),
    mensajeInicial: "Hay dos 4: el 4ᵃ va antes que el 4ᵇ. Ordena y mira si al final siguen en ese orden. Prueba los cinco algoritmos.",
    operaciones: [{ id: "ordenar", etiqueta: (valores) => `${valores.algoritmo}(v)`, usa: ["algoritmo"], ejecutar: ordenar() }],
  });

  // Paso 9: todo junto.
  const ARREGLOS_TODO = {
    azar: () => alAzar(8, 40),
    casi: () => [3, 6, 9, 12, 15, 21, 18, 24],
    reves: () => [40, 35, 28, 22, 17, 11, 6, 2],
    repetidos: () => [7, 3, 7, 1, 3, 9, 1, 7],
  };
  DS.tema({
    contenedor: "vis-todo",
    incremental: true,
    dibujar,
    codigo: Object.fromEntries(ALGORITMOS.map((a) => [a, CODIGO[a]])),
    codigoInicial: (valores) => valores.algoritmo,
    tituloCodigo: (clave) => `${clave}()`,
    entradas: [
      { id: "algoritmo", etiqueta: "Algoritmo", opciones: OPCIONES_ALGORITMO, valor: "insertionSort", reinicia: false },
      { id: "arreglo", etiqueta: "Arreglo", opciones: [["azar", "Al azar"], ["casi", "Casi ordenado"], ["reves", "Al revés"], ["repetidos", "Con repetidos"]] },
    ],
    estadoInicial: (valores) => estadoDesde(ARREGLOS_TODO[valores.arreglo](), valores.algoritmo),
    mensajeInicial: "Elige un algoritmo y ordena. Ordena dos veces seguidas: la segunda vez el arreglo ya está ordenado (el mejor caso). Reiniciar trae otro arreglo.",
    operaciones: [
      { id: "ordenar", etiqueta: (valores) => `${valores.algoritmo}(v)`, usa: ["algoritmo"], ejecutar: ordenar() },
    ],
  });

  // ------------------------------------------------------------------
  // Paso 8: carrera. Cuenta el trabajo de cada algoritmo con arreglos grandes.
  // ------------------------------------------------------------------

  // Las mismas funciones del C++, contando comparaciones y escrituras en v.
  function medir(algoritmo, arreglo) {
    const v = [...arreglo];
    const n = v.length;
    let comparaciones = 0;
    let escrituras = 0;
    const swap = (a, b) => { [v[a], v[b]] = [v[b], v[a]]; escrituras += 2; };
    const mayor = (a, b) => { comparaciones++; return a > b; };
    if (algoritmo === "exchangeSort") {
      for (let i = 0; i < n - 1; i++) for (let j = i + 1; j < n; j++) if (mayor(v[i], v[j])) swap(i, j);
    } else if (algoritmo === "bubbleSort") {
      for (let i = 0; i < n - 1; i++) {
        let hubo = false;
        for (let j = 0; j < n - 1 - i; j++) if (mayor(v[j], v[j + 1])) { swap(j, j + 1); hubo = true; }
        if (!hubo) break;
      }
    } else if (algoritmo === "selectionSort") {
      for (let i = 0; i < n - 1; i++) {
        let m = i;
        for (let j = i + 1; j < n; j++) if (mayor(v[m], v[j])) m = j;
        if (m !== i) swap(i, m);
      }
    } else {
      const inicial = algoritmo === "shellSort" ? Math.floor(n / 2) : 1;
      for (let salto = inicial; salto > 0; salto = algoritmo === "shellSort" ? Math.floor(salto / 2) : 0) {
        for (let i = salto; i < n; i++) {
          const clave = v[i];
          let j = i;
          while (j >= salto && mayor(v[j - salto], clave)) { v[j] = v[j - salto]; escrituras++; j -= salto; }
          v[j] = clave;
          escrituras++;
        }
      }
    }
    return { comparaciones, escrituras };
  }

  function arregloDePrueba(tipo, n) {
    const v = Array.from({ length: n }, (_, k) => k + 1);
    if (tipo === "reves") return v.reverse();
    if (tipo === "ordenado") return v;
    if (tipo === "casi") {
      for (let k = 0; k < Math.max(1, Math.floor(n / 20)); k++) {
        const a = Math.floor(Math.random() * (n - 1));
        [v[a], v[a + 1]] = [v[a + 1], v[a]];
      }
      return v;
    }
    for (let k = n - 1; k > 0; k--) {
      const r = Math.floor(Math.random() * (k + 1));
      [v[k], v[r]] = [v[r], v[k]];
    }
    return v;
  }

  function montarCarrera() {
    const caja = document.getElementById("vis-carrera");
    if (!caja) return;
    const formato = (x) => x.toLocaleString("es");
    const selN = el("select", { id: "ord-carrera-n" }, [10, 100, 1000].map((n) => el("option", { value: n, text: n })));
    selN.value = "100";
    const selTipo = el("select", { id: "ord-carrera-tipo" },
      [["azar", "Al azar"], ["casi", "Casi ordenado"], ["reves", "Al revés"], ["ordenado", "Ya ordenado"]].map(([v, t]) => el("option", { value: v, text: t })));
    const filas = ALGORITMOS.map((a) => {
      const barraC = el("span", { class: "ord-carrera-barra comparaciones" });
      const barraE = el("span", { class: "ord-carrera-barra escrituras" });
      const numC = el("span", { class: "ord-carrera-num" });
      const numE = el("span", { class: "ord-carrera-num" });
      const fila = el("div", { class: "ord-carrera-fila" },
        el("code", { class: "ord-carrera-nombre", text: a }),
        el("div", { class: "ord-carrera-pista" }, el("span", { class: "ord-carrera-carril" }, barraC), numC),
        el("div", { class: "ord-carrera-pista" }, el("span", { class: "ord-carrera-carril" }, barraE), numE));
      return { a, fila, barraC, barraE, numC, numE };
    });
    const referencia = el("p", { class: "ord-carrera-referencia", "aria-live": "polite" });

    function correr() {
      const n = Number(selN.value);
      const arreglo = arregloDePrueba(selTipo.value, n);
      const r = filas.map((f) => medir(f.a, arreglo));
      const maxC = Math.max(1, ...r.map((x) => x.comparaciones));
      const maxE = Math.max(1, ...r.map((x) => x.escrituras));
      filas.forEach((f, k) => {
        f.barraC.style.width = `${(r[k].comparaciones / maxC) * 100}%`;
        f.barraE.style.width = `${(r[k].escrituras / maxE) * 100}%`;
        f.numC.textContent = formato(r[k].comparaciones);
        f.numE.textContent = formato(r[k].escrituras);
        f.fila.classList.remove("nueva");
        void f.fila.offsetWidth;
        f.fila.classList.add("nueva");
      });
      const menosC = filas[r.findIndex((x) => x.comparaciones === Math.min(...r.map((y) => y.comparaciones)))].a;
      const menosE = filas[r.findIndex((x) => x.escrituras === Math.min(...r.map((y) => y.escrituras)))].a;
      referencia.textContent = `Todos los pares: n(n − 1)/2 = ${formato(n * (n - 1) / 2)}. Menos comparaciones: ${menosC}. Menos escrituras: ${menosE}.`;
    }

    selN.addEventListener("change", correr);
    selTipo.addEventListener("change", correr);
    caja.classList.add("panel", "ord-carrera");
    caja.append(
      el("div", { class: "controles" },
        el("label", { class: "campo", for: "ord-carrera-n" }, "n", selN),
        el("label", { class: "campo", for: "ord-carrera-tipo" }, "Arreglo", selTipo),
        el("button", { class: "boton principal", type: "button", text: "Otro arreglo", onclick: correr })),
      el("div", { class: "ord-carrera-cuerpo" },
        el("div", { class: "ord-carrera-fila ord-carrera-titulos" }, el("span"), el("span", { text: "comparaciones" }), el("span", { text: "escrituras en v (un swap escribe 2)" })),
        filas.map((f) => f.fila),
        referencia));
    correr();
  }

  if (typeof document !== "undefined") montarCarrera();
})();
