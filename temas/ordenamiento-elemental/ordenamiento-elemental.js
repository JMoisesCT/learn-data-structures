// Lección de los ordenamientos elementales, en pasos. Los fragmentos de
// código deben coincidir línea por línea con
// ejemplos/cpp/ordenamiento_elemental.cpp, y en inglés con
// ejemplos/cpp/en/elementary_sorting.cpp (scripts/verificar-fragmentos.mjs
// lo revisa). Los textos que se ven van en los dos idiomas con DS.tr.
(function () {
  const { el, tr } = DS;
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
  // Fragmentos de C++ (copiados de ejemplos/cpp/ordenamiento_elemental.cpp
  // y de ejemplos/cpp/en/elementary_sorting.cpp, con las mismas líneas)
  // ------------------------------------------------------------------

  const CODIGO = tr({
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
  }, {
    estaOrdenado: `
      bool isSorted(const vector<int>& v) {
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
              bool swapped = false;
              for (int j = 0; j < n - 1 - i; j++) {
                  if (v[j] > v[j + 1]) {
                      swap(v[j], v[j + 1]);
                      swapped = true;
                  }
              }
              if (!swapped) {
                  break;
              }
          }
      }`,
    selectionSort: `
      void selectionSort(vector<int>& v) {
          int n = v.size();
          for (int i = 0; i < n - 1; i++) {
              int minIndex = i;
              for (int j = i + 1; j < n; j++) {
                  if (v[j] < v[minIndex]) {
                      minIndex = j;
                  }
              }
              if (minIndex != i) {
                  swap(v[i], v[minIndex]);
              }
          }
      }`,
    insertionSort: `
      void insertionSort(vector<int>& v) {
          int n = v.size();
          for (int i = 1; i < n; i++) {
              int key = v[i];
              int j = i - 1;
              while (j >= 0 && v[j] > key) {
                  v[j + 1] = v[j];
                  j--;
              }
              v[j + 1] = key;
          }
      }`,
    shellSort: `
      void shellSort(vector<int>& v) {
          int n = v.size();
          for (int gap = n / 2; gap > 0; gap /= 2) {
              for (int i = gap; i < n; i++) {
                  int key = v[i];
                  int j = i;
                  while (j >= gap && v[j - gap] > key) {
                      v[j] = v[j - gap];
                      j -= gap;
                  }
                  v[j] = key;
              }
          }
      }`,
  });

  // Nombre de cada función en el idioma de la página (las claves quedan en español).
  const F = { estaOrdenado: tr("estaOrdenado", "isSorted") };
  const nombreF = (clave) => F[clave] || clave;

  // Nombres del C++ que se dibujan (variables, contadores y punteros). Los
  // estados usan los de español y se traducen al pintar, así son iguales en
  // los dos idiomas.
  const NOMBRES = {
    comparaciones: "comparisons", intercambios: "swaps", desplazamientos: "shifts",
    huboIntercambio: "swapped", minimo: "minIndex", clave: "key", salto: "gap",
  };
  const ident = (k) => tr(k, NOMBRES[k] || k);
  const traducirVars = (vars) => Object.fromEntries(Object.entries(vars).map(([k, v]) => [ident(k), v]));
  // Para los textos que nombran variables del C++ (v[minimo], v[j − salto]…).
  const M = tr({ minimo: "minimo", clave: "clave", salto: "salto" }, { minimo: "minIndex", clave: "key", salto: "gap" });

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
    return tr(` Ojo: ${iguales}ᵃ y ${iguales}ᵇ acaban de cambiar de orden.`, ` Watch out: ${iguales}ᵃ and ${iguales}ᵇ just switched order.`);
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
    const otro = c.desplazamientos != null
      ? tr(`${c.desplazamientos} desplazamiento(s)`, `${c.desplazamientos} shift(s)`)
      : tr(`${c.intercambios} intercambio(s)`, `${c.intercambios} swap(s)`);
    return tr(`${c.comparaciones} comparación(es) y ${otro}`, `${c.comparaciones} comparison(s) and ${otro}`);
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
      ? tr(`n = ${n}. Para cada posición i vamos a revisar todas las que vienen después y traer a v[i] cualquier valor menor.`,
        `n = ${n}. For each position i we'll check all the ones after it and bring any smaller value to v[i].`)
      : nadaQueOrdenar(n));
    for (let i = 0; i < n - 1; i++) {
      ver(s, { vars: { n, i }, punteros: { i }, vueltas: { 3: i + 1 } });
      paso(K, 3, (i ? tr(`v[${i - 1}] = ${val(s, i - 1)} ya está en su lugar. `, `v[${i - 1}] = ${val(s, i - 1)} is already in place. `) : "")
        + tr(`i = ${i}: al terminar esta vuelta, v[${i}] tendrá el menor de v[${i}..${n - 1}].`,
          `i = ${i}: when this round ends, v[${i}] will hold the smallest of v[${i}..${n - 1}].`));
      for (let j = i + 1; j < n; j++) {
        const a = s.items[j].v;
        const b = s.items[i].v;
        const menor = a < b;
        s.cuenta.comparaciones++;
        const base = { vars: { n, i, j }, punteros: { i, j }, vueltas: { 3: i + 1, 4: j - i } };
        ver(s, Object.assign({ comparar: [i, j], veredicto: { texto: `v[j] < v[i]: ${val(s, j)} < ${val(s, i)}`, si: menor }, cambio: ["comparaciones"] }, base));
        paso(K, 5, menor
          ? tr(`${val(s, j)} < ${val(s, i)}: v[${j}] es menor que v[${i}], así que se cambian de lugar.`,
            `${val(s, j)} < ${val(s, i)}: v[${j}] is smaller than v[${i}], so they switch places.`)
          : tr(`${val(s, j)} no es menor que ${val(s, i)}: v[${i}] se queda como está.`,
            `${val(s, j)} isn't smaller than ${val(s, i)}: v[${i}] stays as it is.`));
        if (menor) {
          const nota = intercambiar(s, i, j);
          ver(s, Object.assign({ intercambio: [i, j], cambio: ["intercambios"] }, base));
          paso(K, 6, tr(`swap(v[${i}], v[${j}]): ${val(s, i)} pasa a la posición ${i} y ${val(s, j)} a la ${j}.${nota}`,
            `swap(v[${i}], v[${j}]): ${val(s, i)} moves to position ${i} and ${val(s, j)} to ${j}.${nota}`));
        }
      }
      s.zona = { desde: 0, hasta: i, tipo: "final" };
    }
    terminar(s);
    ver(s, { vars: { n, i: Math.max(0, n - 1) }, vueltas: { 3: Math.max(0, n - 1) } });
    if (n > 1) {
      paso(K, 3, tr(`i = ${n - 1} ya no cumple i < n − 1: el último quedó en su lugar solo. ¡Ordenado! ${resumen(s)}. Las comparaciones son siempre n(n − 1)/2 = ${n * (n - 1) / 2}, aunque ya estuviera ordenado.`,
        `i = ${n - 1} no longer satisfies i < n − 1: the last one ended up in place on its own. Sorted! ${resumen(s)}. The comparisons are always n(n − 1)/2 = ${n * (n - 1) / 2}, even if it was already sorted.`), "exito");
    }
  }

  function animarBubble(s, paso) {
    const K = "bubbleSort";
    const n = s.items.length;
    ver(s, { vars: { n } });
    paso(K, 2, n > 1
      ? tr(`n = ${n}. Vamos a comparar vecinos: si están al revés, se cambian. El mayor "burbujea" hasta el final.`,
        `n = ${n}. We'll compare neighbors: if they're out of order, they swap. The largest one "bubbles up" to the end.`)
      : nadaQueOrdenar(n));
    for (let i = 0; i < n - 1; i++) {
      let hubo = false;
      const ultimo = n - 1 - i;
      ver(s, { vars: { n, i, huboIntercambio: "false" }, vueltas: { 3: i + 1 } });
      paso(K, 4, tr(`Pasada ${i + 1}: huboIntercambio = false. Recorremos los vecinos de v[0] a v[${ultimo}]`,
        `Pass ${i + 1}: swapped = false. We walk the neighbors from v[0] to v[${ultimo}]`)
        + (i ? tr(`; de v[${ultimo + 1}] en adelante ya está ordenado.`, `; from v[${ultimo + 1}] onward it's already sorted.`) : "."));
      for (let j = 0; j < ultimo; j++) {
        const a = s.items[j].v;
        const b = s.items[j + 1].v;
        const mayor = a > b;
        s.cuenta.comparaciones++;
        const base = () => ({ vars: { n, i, j, huboIntercambio: String(hubo) }, punteros: { j, "j + 1": j + 1 }, vueltas: { 3: i + 1, 5: j + 1 } });
        ver(s, Object.assign({ comparar: [j, j + 1], veredicto: { texto: `v[j] > v[j + 1]: ${val(s, j)} > ${val(s, j + 1)}`, si: mayor }, cambio: ["comparaciones"] }, base()));
        paso(K, 6, mayor
          ? tr(`${val(s, j)} > ${val(s, j + 1)}: estos vecinos están al revés.`, `${val(s, j)} > ${val(s, j + 1)}: these neighbors are out of order.`)
          : tr(`${val(s, j)} no es mayor que ${val(s, j + 1)}: están en orden, seguimos.`, `${val(s, j)} isn't greater than ${val(s, j + 1)}: they're in order, we move on.`));
        if (mayor) {
          const nota = intercambiar(s, j, j + 1);
          ver(s, Object.assign({ intercambio: [j, j + 1], cambio: ["intercambios"] }, base()));
          paso(K, 7, tr(`swap(v[${j}], v[${j + 1}]): ${val(s, j + 1)} avanza una posición hacia el final.${nota}`,
            `swap(v[${j}], v[${j + 1}]): ${val(s, j + 1)} moves one position toward the end.${nota}`));
          if (!hubo) {
            hubo = true;
            ver(s, Object.assign({ cambio: ["huboIntercambio"] }, base()));
            paso(K, 8, tr("huboIntercambio = true: en esta pasada algo se movió, así que todavía no sabemos si quedó ordenado.",
              "swapped = true: something moved in this pass, so we don't know yet whether it's sorted."));
          }
        }
      }
      s.zona = { desde: ultimo, hasta: n - 1, tipo: "final" };
      ver(s, { vars: { n, i, huboIntercambio: String(hubo) }, vueltas: { 3: i + 1 } });
      paso(K, 11, hubo
        ? tr(`Hubo intercambios. El mayor de v[0..${ultimo}] (${val(s, ultimo)}) burbujeó hasta v[${ultimo}]: ya está en su lugar.`,
          `There were swaps. The largest of v[0..${ultimo}] (${val(s, ultimo)}) bubbled up to v[${ultimo}]: it's already in place.`)
        : tr("¿!huboIntercambio? Sí: en toda la pasada no se movió nada, cada vecino está en orden.",
          "!swapped? Yes: nothing moved in the whole pass, every neighbor is in order."));
      if (!hubo) {
        terminar(s);
        ver(s, { vars: { n, i, huboIntercambio: "false" }, vueltas: { 3: i + 1 } });
        paso(K, 12, tr(`break: el arreglo ya está ordenado y no hace falta seguir. ¡Listo tras ${i + 1} pasada(s)! ${resumen(s)}.`,
          `break: the array is already sorted and there's no need to go on. Done after ${i + 1} pass(es)! ${resumen(s)}.`), "exito");
        return;
      }
    }
    terminar(s);
    ver(s, { vars: { n, i: Math.max(0, n - 1) }, vueltas: { 3: Math.max(0, n - 1) } });
    if (n > 1) {
      paso(K, 3, tr(`i = ${n - 1} ya no cumple i < n − 1: v[0] es lo único que queda y ya está en su lugar. ¡Ordenado! ${resumen(s)}.`,
        `i = ${n - 1} no longer satisfies i < n − 1: v[0] is all that's left and it's already in place. Sorted! ${resumen(s)}.`), "exito");
    }
  }

  function animarSelection(s, paso) {
    const K = "selectionSort";
    const n = s.items.length;
    ver(s, { vars: { n } });
    paso(K, 2, n > 1
      ? tr(`n = ${n}. En cada vuelta buscamos el mínimo de lo que falta y lo ponemos al principio.`,
        `n = ${n}. In each round we find the minimum of what's left and put it at the start.`)
      : nadaQueOrdenar(n));
    for (let i = 0; i < n - 1; i++) {
      ver(s, { vars: { n, i }, punteros: { i }, vueltas: { 3: i + 1 } });
      paso(K, 3, tr(`i = ${i}: buscamos el menor de v[${i}..${n - 1}] para ponerlo en v[${i}].`, `i = ${i}: we look for the smallest of v[${i}..${n - 1}] to put it in v[${i}].`));
      let minimo = i;
      ver(s, { vars: { n, i, minimo }, punteros: { i, minimo }, minimo, vueltas: { 3: i + 1 }, cambio: ["minimo"] });
      paso(K, 4, tr(`minimo = ${i}: por ahora, el menor que conocemos es v[${i}] = ${val(s, i)}.`, `minIndex = ${i}: for now, the smallest we know is v[${i}] = ${val(s, i)}.`));
      for (let j = i + 1; j < n; j++) {
        const menor = s.items[j].v < s.items[minimo].v;
        s.cuenta.comparaciones++;
        const base = () => ({ vars: { n, i, j, minimo }, punteros: { i, j, minimo }, minimo, vueltas: { 3: i + 1, 5: j - i } });
        ver(s, Object.assign({ comparar: [j, minimo], veredicto: { texto: `v[j] < v[${M.minimo}]: ${val(s, j)} < ${val(s, minimo)}`, si: menor }, cambio: ["comparaciones"] }, base()));
        paso(K, 6, menor
          ? tr(`${val(s, j)} < ${val(s, minimo)}: encontramos uno más chico.`, `${val(s, j)} < ${val(s, minimo)}: we found a smaller one.`)
          : tr(`${val(s, j)} no es menor que ${val(s, minimo)}: el mínimo sigue siendo v[${minimo}].`, `${val(s, j)} isn't smaller than ${val(s, minimo)}: the minimum is still v[${minimo}].`));
        if (menor) {
          minimo = j;
          ver(s, Object.assign({ cambio: ["minimo"] }, base()));
          paso(K, 7, tr(`minimo = ${j}. Solo anotamos la posición: todavía no se mueve nada.`, `minIndex = ${j}. We just note the position: nothing moves yet.`));
        }
      }
      if (minimo !== i) {
        ver(s, { vars: { n, i, minimo }, punteros: { i, minimo }, minimo, comparar: [i, minimo], vueltas: { 3: i + 1 } });
        paso(K, 10, tr(`minimo (${minimo}) ≠ i (${i}): el menor de lo que falta es ${val(s, minimo)} y no está en v[${i}].`,
          `minIndex (${minimo}) ≠ i (${i}): the smallest of what's left is ${val(s, minimo)} and it isn't in v[${i}].`));
        const antes = val(s, i);
        const nota = intercambiar(s, i, minimo);
        ver(s, { vars: { n, i, minimo }, punteros: { i, minimo }, intercambio: [i, minimo], vueltas: { 3: i + 1 }, cambio: ["intercambios"] });
        paso(K, 11, tr(`swap(v[${i}], v[${minimo}]): ${val(s, i)} va a la posición ${i} y ${antes} se va a la ${minimo}. Un solo intercambio en toda la vuelta.${nota}`,
          `swap(v[${i}], v[${minimo}]): ${val(s, i)} goes to position ${i} and ${antes} goes to ${minimo}. A single swap in the whole round.${nota}`));
      } else {
        ver(s, { vars: { n, i, minimo }, punteros: { i, minimo }, minimo, vueltas: { 3: i + 1 } });
        paso(K, 10, tr(`minimo == i: v[${i}] = ${val(s, i)} ya era el menor. No hace falta intercambiar.`, `minIndex == i: v[${i}] = ${val(s, i)} was already the smallest. No swap needed.`));
      }
      s.zona = { desde: 0, hasta: i, tipo: "final" };
    }
    terminar(s);
    ver(s, { vars: { n, i: Math.max(0, n - 1) }, vueltas: { 3: Math.max(0, n - 1) } });
    if (n > 1) {
      paso(K, 3, tr(`i = ${n - 1} ya no cumple i < n − 1: el que queda es el mayor. ¡Ordenado! ${resumen(s)}.`,
        `i = ${n - 1} no longer satisfies i < n − 1: the one left is the largest. Sorted! ${resumen(s)}.`), "exito");
    }
  }

  function animarInsertion(s, paso) {
    const K = "insertionSort";
    const n = s.items.length;
    ver(s, { vars: { n } });
    paso(K, 2, n > 1
      ? tr(`n = ${n}. Como al ordenar cartas en la mano: tomamos una y la metemos entre las que ya están ordenadas.`,
        `n = ${n}. Like sorting cards in your hand: we take one and slip it in among the ones already sorted.`)
      : nadaQueOrdenar(n));
    for (let i = 1; i < n; i++) {
      s.zona = { desde: 0, hasta: i - 1, tipo: "parcial" };
      ver(s, { vars: { n, i }, punteros: { i }, vueltas: { 3: i } });
      paso(K, 3, tr(`i = ${i}: v[0..${i - 1}] ya están ordenados entre sí (todavía no en su lugar final). Toca meter v[${i}] = ${val(s, i)}.`,
        `i = ${i}: v[0..${i - 1}] are already sorted relative to each other (not in their final place yet). Now v[${i}] = ${val(s, i)} goes in.`));
      const clave = s.items[i].v;
      const nombreClave = val(s, i);
      levantar(s, i);
      ver(s, { vars: { n, i, clave: nombreClave }, punteros: { i }, vueltas: { 3: i }, cambio: ["clave"] });
      paso(K, 4, tr(`clave = v[${i}] = ${nombreClave}: la guardamos aparte. En v[${i}] queda una copia que se puede pisar.`,
        `key = v[${i}] = ${nombreClave}: we keep it aside. A copy stays in v[${i}] that can be overwritten.`));
      let j = i - 1;
      ver(s, { vars: { n, i, clave: nombreClave, j }, punteros: { i, j }, vueltas: { 3: i }, cambio: ["j"] });
      paso(K, 5, tr(`j = ${j}: empezamos por el vecino de la izquierda.`, `j = ${j}: we start with the neighbor on the left.`));
      let corridos = 0;
      for (;;) {
        const base = () => ({ vars: { n, i, clave: nombreClave, j }, punteros: { i, j }, vueltas: { 3: i, 6: corridos } });
        if (j < 0) {
          ver(s, Object.assign({ fuera: true }, base()));
          paso(K, 6, tr(`j = -1: ya no queda nada a la izquierda. ${nombreClave} es el menor de los que van.`, `j = -1: there's nothing left on the left. ${nombreClave} is the smallest so far.`));
          break;
        }
        const mayor = s.items[j].v > clave;
        s.cuenta.comparaciones++;
        ver(s, Object.assign({ comparar: [j], compararClave: true, veredicto: { texto: `v[j] > ${M.clave}: ${val(s, j)} > ${nombreClave}`, si: mayor }, cambio: ["comparaciones"] }, base()));
        paso(K, 6, mayor
          ? tr(`${val(s, j)} > ${nombreClave}: ${val(s, j)} tiene que ir después de la clave.`, `${val(s, j)} > ${nombreClave}: ${val(s, j)} has to go after the key.`)
          : tr(`${val(s, j)} no es mayor que ${nombreClave}: la clave va justo después de él, en v[${j + 1}].`,
            `${val(s, j)} isn't greater than ${nombreClave}: the key goes right after it, in v[${j + 1}].`));
        if (!mayor) break;
        desplazar(s, j, j + 1);
        corridos++;
        ver(s, Object.assign({ escrita: j + 1, cambio: ["desplazamientos"] }, base()));
        paso(K, 7, tr(`v[${j + 1}] = v[${j}]: ${val(s, j + 1)} se corre a la derecha y la casilla ${j} queda libre. (Desplazar no es intercambiar: es una sola escritura.)`,
          `v[${j + 1}] = v[${j}]: ${val(s, j + 1)} shifts to the right and slot ${j} is free. (Shifting isn't swapping: it's a single write.)`));
        j--;
      }
      const antes = ordenEtiquetas(s); // la clave está en el carril: no cuenta
      soltar(s, j + 1);
      ver(s, { vars: { n, i, clave: nombreClave, j }, punteros: { i, "j + 1": j + 1 }, escrita: j + 1, vueltas: { 3: i } });
      paso(K, 10, tr(`v[${j + 1}] = clave: ${nombreClave} cae en el hueco.`, `v[${j + 1}] = key: ${nombreClave} drops into the gap.`)
        + (corridos
          ? tr(` Corrimos ${corridos} valor(es) para hacerle lugar.`, ` We shifted ${corridos} value(s) to make room for it.`)
          : tr(" No hubo que correr nada: ya estaba en su lugar.", " Nothing had to shift: it was already in place."))
        + (antes ? notaEstabilidad(s, antes) : ""));
    }
    terminar(s);
    ver(s, { vars: { n, i: Math.max(1, n) }, vueltas: { 3: Math.max(0, n - 1) } });
    if (n > 1) {
      paso(K, 3, tr(`i = ${n} ya no cumple i < n: la parte ordenada es todo el arreglo. ¡Ordenado! ${resumen(s)}.`,
        `i = ${n} no longer satisfies i < n: the sorted part is the whole array. Sorted! ${resumen(s)}.`), "exito");
    }
  }

  function animarShell(s, paso) {
    const K = "shellSort";
    const n = s.items.length;
    ver(s, { vars: { n } });
    paso(K, 2, n > 1
      ? tr(`n = ${n}. Es insertion sort, pero primero con saltos grandes: así los valores viajan lejos de un solo paso.`,
        `n = ${n}. It's insertion sort, but first with big gaps: that way values travel far in a single step.`)
      : nadaQueOrdenar(n));
    let pasada = 0;
    for (let salto = Math.floor(n / 2); salto > 0; salto = Math.floor(salto / 2)) {
      pasada++;
      ver(s, { vars: { n, salto }, vueltas: { 3: pasada }, grupos: salto, cambio: ["salto"] });
      paso(K, 3, salto > 1
        ? tr(`salto = ${salto}: ordenamos por separado cada grupo de valores que están a ${salto} casillas (cada color es un grupo).`,
          `gap = ${salto}: we sort separately each group of values that are ${salto} slots apart (each color is a group).`)
        : tr("salto = 1: es un insertion sort normal, pero sobre un arreglo que ya quedó casi ordenado. Casi no hay que correr nada.",
          "gap = 1: it's a normal insertion sort, but on an array that's already almost sorted. Hardly anything has to shift."));
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
        paso(K, 5, tr(`i = ${i}: clave = v[${i}] = ${nombreClave}, y j = i. Solo miramos su grupo: las posiciones ${grupo.join(", ")}.`,
          `i = ${i}: key = v[${i}] = ${nombreClave}, and j = i. We only look at its group: positions ${grupo.join(", ")}.`));
        for (;;) {
          if (j < salto) {
            ver(s, base());
            paso(K, 7, tr(`j = ${j} no es ≥ salto (${salto}): no hay nada ${salto} casillas a la izquierda.`, `j = ${j} isn't ≥ gap (${salto}): there's nothing ${salto} slots to the left.`));
            break;
          }
          const mayor = s.items[j - salto].v > clave;
          s.cuenta.comparaciones++;
          ver(s, Object.assign({ comparar: [j - salto], compararClave: true, veredicto: { texto: `v[j − ${M.salto}] > ${M.clave}: ${val(s, j - salto)} > ${nombreClave}`, si: mayor }, cambio: ["comparaciones"] }, base()));
          paso(K, 7, mayor
            ? tr(`${val(s, j - salto)} > ${nombreClave}: va después de la clave, aunque esté ${salto} casillas antes.`,
              `${val(s, j - salto)} > ${nombreClave}: it goes after the key, even though it's ${salto} slots earlier.`)
            : tr(`${val(s, j - salto)} no es mayor que ${nombreClave}: la clave se queda en v[${j}].`, `${val(s, j - salto)} isn't greater than ${nombreClave}: the key stays in v[${j}].`));
          if (!mayor) break;
          desplazar(s, j - salto, j);
          corridos++;
          ver(s, Object.assign({ escrita: j, cambio: ["desplazamientos"] }, base()));
          paso(K, 8, tr(`v[${j}] = v[${j - salto}]: ${val(s, j)} salta ${salto} casillas a la derecha de una vez.`, `v[${j}] = v[${j - salto}]: ${val(s, j)} jumps ${salto} slots to the right at once.`));
          j -= salto;
        }
        soltar(s, j);
        ver(s, Object.assign({ escrita: j }, base()));
        paso(K, 11, tr(`v[${j}] = clave: ${nombreClave} cae en su lugar dentro del grupo.`, `v[${j}] = key: ${nombreClave} drops into its place within the group.`) + notaEstabilidad(s, antes));
      }
    }
    terminar(s);
    ver(s, { vars: { n, salto: 0 }, vueltas: { 3: pasada } });
    if (n > 1) paso(K, 3, tr(`salto = 0 ya no cumple salto > 0. ¡Ordenado! ${resumen(s)}.`, `gap = 0 no longer satisfies gap > 0. Sorted! ${resumen(s)}.`), "exito");
  }

  function nadaQueOrdenar(n) {
    return n
      ? tr(`n = ${n}: con un elemento no hay nada que ordenar.`, `n = ${n}: with one element there's nothing to sort.`)
      : tr(`n = ${n}: con el arreglo vacío no hay nada que ordenar.`, `n = ${n}: with the empty array there's nothing to sort.`);
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
          ? tr(`${iguales}ᵃ sigue antes que ${iguales}ᵇ, como al principio: ${alg} fue estable con este arreglo.`,
            `${iguales}ᵃ is still before ${iguales}ᵇ, as at the start: ${alg} was stable with this array.`)
          : tr(`${iguales}ᵇ quedó antes que ${iguales}ᵃ: los iguales se invirtieron. ${alg} no es estable.`,
            `${iguales}ᵇ ended up before ${iguales}ᵃ: the equal values were flipped. ${alg} isn't stable.`), estable ? "exito" : "error");
      }
    };
  }

  // ------------------------------------------------------------------
  // Paso 1: estaOrdenado y swap a mano
  // ------------------------------------------------------------------

  const OP_ESTA_ORDENADO = {
    id: "estaOrdenado",
    etiqueta: tr("estaOrdenado(v)", "isSorted(v)"),
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
          ? tr(`${val(s, i - 1)} > ${val(s, i)}: este par de vecinos está al revés.`, `${val(s, i - 1)} > ${val(s, i)}: this pair of neighbors is out of order.`)
          : tr(`${val(s, i - 1)} ≤ ${val(s, i)}: este par está en orden.`, `${val(s, i - 1)} ≤ ${val(s, i)}: this pair is in order.`));
        if (mal) {
          ver(s, { vars: { i }, punteros: { "i − 1": i - 1, i }, malas: [i - 1, i], error: true, salida: "false", vueltas: { 2: i } });
          paso(K, 4, tr("return false: basta un par al revés para saber que no está ordenado. Usa swap para arreglarlo y vuelve a preguntar.",
            "return false: one pair out of order is enough to know it isn't sorted. Use swap to fix it and ask again."), "error");
          return;
        }
      }
      terminar(s);
      ver(s, { vars: { i: Math.max(1, n) }, salida: "true", vueltas: { 2: Math.max(0, n - 1) } });
      const pares = Math.max(0, n - 1);
      paso(K, 7, tr(`return true: los ${pares} pares de vecinos están en orden. Hicimos n − 1 = ${pares} comparaciones.`,
        `return true: all ${pares} pairs of neighbors are in order. We made n − 1 = ${pares} comparisons.`), "exito");
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
          paso("estaOrdenado", 0, tr(`v[${k}] no existe: el arreglo tiene ${n} elementos (posiciones 0 a ${n - 1}). En C++, ${nombre} = ${k} sería leer fuera del arreglo (comportamiento indefinido).`,
            `v[${k}] doesn't exist: the array has ${n} elements (positions 0 to ${n - 1}). In C++, ${nombre} = ${k} would read outside the array (undefined behavior).`), "error");
          return;
        }
      }
      if (i === j) {
        ver(s, { vars: { i, j }, punteros: { "i, j": i } });
        paso("estaOrdenado", 0, tr(`i == j: intercambiar v[${i}] consigo mismo no cambia nada.`, `i == j: swapping v[${i}] with itself changes nothing.`));
        return;
      }
      intercambiar(s, i, j);
      ver(s, { vars: { i, j }, punteros: { i, j }, intercambio: [i, j], cambio: ["intercambios"] });
      paso("estaOrdenado", 0, tr(`swap(v[${i}], v[${j}]): ${val(s, i)} y ${val(s, j)} cambian de lugar. Llevas ${s.cuenta.intercambios} intercambio(s). ¿Ya está ordenado? Pregúntale a estaOrdenado(v).`,
        `swap(v[${i}], v[${j}]): ${val(s, i)} and ${val(s, j)} switch places. You've made ${s.cuenta.intercambios} swap(s). Is it sorted yet? Ask isSorted(v).`));
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
    const cambio = (vis.cambio || []).map(ident);
    const cuenta = DS.variables(traducirVars(s.cuenta), cambio);
    cuenta.classList.add("ord-cuenta");
    escenario.querySelector(".ord-info").replaceChildren(
      DS.variables(traducirVars(vis.vars || { n: s.items.length }), cambio),
      cuenta,
      vis.veredicto ? el("span", { class: `ord-veredicto ${vis.veredicto.si ? "si" : "no"}` },
        el("code", { text: vis.veredicto.texto }), el("b", { text: vis.veredicto.si ? tr("→ sí", "→ yes") : "→ no" })) : "",
      vis.salida != null ? el("div", { class: "salida-valor" }, tr("devuelve", "returns"), el("div", { class: `celda ${vis.salida === "false" ? "error" : "encontrada"}`, text: vis.salida })) : "");

    // Capa fija: carril de la clave, zona ordenada e índices.
    const n = s.items.length;
    const piezas = [];
    if (s.conCarril) {
      piezas.push(el("div", { class: "ord-carril", style: `left:${MARGEN - 10}px;top:4px;width:${g.ancho - 2 * MARGEN + 20}px;height:${CARRIL - 10}px` },
        el("span", { class: "ord-carril-nombre", text: tr("clave (fuera del arreglo)", "key (outside the array)") })));
    }
    if (s.zona && s.zona.hasta >= s.zona.desde) {
      const ancho = (s.zona.hasta - s.zona.desde + 1) * PASO - (PASO - ANCHO_BARRA) + 8;
      piezas.push(el("div", { class: `ord-zona ${s.zona.tipo}`, style: `left:${xDe(s.zona.desde) - 4}px;top:${g.yArriba - 18}px;width:${ancho}px;height:${g.yBase - g.yArriba + 22}px` },
        ancho >= 92 ? el("span", { class: "ord-zona-texto", text: s.zona.tipo === "final" ? tr("en su lugar", "in place") : ancho >= 140 ? tr("ordenados entre sí", "sorted so far") : tr("ordenados", "sorted") }) : null));
    }
    for (let k = 0; k < n; k++) {
      piezas.push(el("span", { class: "indice ord-indice", style: `left:${xDe(k)}px;top:${g.yBase + 4}px;width:${ANCHO_BARRA}px`, text: k }));
    }
    if (!n) piezas.push(el("span", { class: "indice", style: `left:${MARGEN}px;top:${g.yBase - 20}px`, text: tr("(vacío)", "(empty)") }));
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
      nodo.textContent = fila === 1 ? `▲ ${ident(nombre)}` : ident(nombre);
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
  const OPCIONES_ARREGLO = [["main", tr("El de main()", "The one from main()")], ["casi", tr("Casi ordenado", "Almost sorted")], ["reves", tr("Al revés", "Reversed")], ["azar", tr("Al azar", "Random")]];
  const entradaArreglo = { id: "arreglo", etiqueta: tr("Arreglo", "Array"), opciones: OPCIONES_ARREGLO };

  function visualizador(contenedor, algoritmo, mensajeInicial, arreglos) {
    DS.tema({
      contenedor,
      incremental: true,
      dibujar,
      codigo: { [algoritmo]: CODIGO[algoritmo] },
      tituloCodigo: (clave) => `${nombreF(clave)}()`,
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
    tituloCodigo: (clave) => `${nombreF(clave)}()`,
    entradas: [{ id: "i", etiqueta: "i", min: 0, max: 9, valor: 0 }, { id: "j", etiqueta: "j", min: 0, max: 9, valor: 2 }],
    estadoInicial: () => estadoDesde([4, 7, 1, 9, 5], "exchangeSort"),
    mensajeInicial: tr("Pregunta si está ordenado. Después ordénalo tú con swap(v[i], v[j]): ¿cuántos intercambios necesitas?",
      "Ask whether it's sorted. Then sort it yourself with swap(v[i], v[j]): how many swaps do you need?"),
    operaciones: [OP_ESTA_ORDENADO, OP_SWAP],
  });

  // Pasos 2 a 5 y 7: un algoritmo por paso.
  visualizador("vis-exchange", "exchangeSort",
    tr("El arreglo de main(). Pulsa exchangeSort(v): mira cómo v[0] se queda con el menor, después v[1], y así.",
      "The array from main(). Press exchangeSort(v): watch how v[0] keeps the smallest, then v[1], and so on."));
  visualizador("vis-bubble", "bubbleSort",
    tr("Pulsa bubbleSort(v) y mira cómo el mayor burbujea hasta el final. Después prueba \"Casi ordenado\": termina antes.",
      "Press bubbleSort(v) and watch how the largest bubbles up to the end. Then try \"Almost sorted\": it finishes earlier."));
  visualizador("vis-selection", "selectionSort",
    tr("Pulsa selectionSort(v): el puntero minimo recorre lo que falta y se hace un solo swap por vuelta.",
      "Press selectionSort(v): the minIndex pointer walks what's left and there's a single swap per round."));
  visualizador("vis-insertion", "insertionSort",
    tr("Pulsa insertionSort(v): la clave sube, los mayores se corren a la derecha y la clave cae en el hueco.",
      "Press insertionSort(v): the key goes up, the larger ones shift to the right and the key drops into the gap."));
  visualizador("vis-shell", "shellSort",
    tr("Pulsa shellSort(v): con salto = 4 cada color es un grupo que se ordena por su cuenta; al final, salto = 1.",
      "Press shellSort(v): with gap = 4 each color is a group sorted on its own; at the end, gap = 1."), ARREGLOS_SHELL);

  // Paso 6: estabilidad, con dos valores iguales marcados a y b.
  const OPCIONES_ALGORITMO = ALGORITMOS.map((a) => [a, a]);
  DS.tema({
    contenedor: "vis-estable",
    incremental: true,
    dibujar,
    codigo: Object.fromEntries(ALGORITMOS.map((a) => [a, CODIGO[a]])),
    codigoInicial: (valores) => valores.algoritmo,
    tituloCodigo: (clave) => `${nombreF(clave)}()`,
    entradas: [{ id: "algoritmo", etiqueta: tr("Algoritmo", "Algorithm"), opciones: OPCIONES_ALGORITMO, valor: "selectionSort" }],
    estadoInicial: (valores) => estadoDesde([{ v: 4, e: "a" }, 2, 3, { v: 4, e: "b" }, 1], valores.algoritmo),
    mensajeInicial: tr("Hay dos 4: el 4ᵃ va antes que el 4ᵇ. Ordena y mira si al final siguen en ese orden. Prueba los cinco algoritmos.",
      "There are two 4s: 4ᵃ comes before 4ᵇ. Sort and see whether they're still in that order at the end. Try all five algorithms."),
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
    tituloCodigo: (clave) => `${nombreF(clave)}()`,
    entradas: [
      {
        id: "algoritmo", etiqueta: tr("Algoritmo", "Algorithm"), opciones: OPCIONES_ALGORITMO, valor: "insertionSort",
        // Elegir otro algoritmo muestra enseguida su código, con el mismo arreglo.
        alCambiar: (s, { algoritmo }) => {
          const estado = Object.assign({}, s);
          prepararCorrida(estado, algoritmo);
          return {
            estado,
            codigo: algoritmo,
            mensaje: tr(`Pulsa ${algoritmo}(v) para ordenar este arreglo con él. Si ya está ordenado, verás su mejor caso; Reiniciar trae otro.`,
              `Press ${algoritmo}(v) to sort this array with it. If it's already sorted, you'll see its best case; Reset brings another one.`),
          };
        },
      },
      { id: "arreglo", etiqueta: tr("Arreglo", "Array"), opciones: [["azar", tr("Al azar", "Random")], ["casi", tr("Casi ordenado", "Almost sorted")], ["reves", tr("Al revés", "Reversed")], ["repetidos", tr("Con repetidos", "With repeats")]] },
    ],
    estadoInicial: (valores) => estadoDesde(ARREGLOS_TODO[valores.arreglo](), valores.algoritmo),
    mensajeInicial: tr("Elige un algoritmo y ordena. Ordena dos veces seguidas: la segunda vez el arreglo ya está ordenado (el mejor caso). Reiniciar trae otro arreglo.",
      "Pick an algorithm and sort. Sort twice in a row: the second time the array is already sorted (the best case). Reset brings another array."),
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
    const formato = (x) => x.toLocaleString(tr("es", "en"));
    const selN = el("select", { id: "ord-carrera-n" }, [10, 100, 1000].map((n) => el("option", { value: n, text: n })));
    selN.value = "100";
    const selTipo = el("select", { id: "ord-carrera-tipo" },
      [["azar", tr("Al azar", "Random")], ["casi", tr("Casi ordenado", "Almost sorted")], ["reves", tr("Al revés", "Reversed")], ["ordenado", tr("Ya ordenado", "Already sorted")]]
        .map(([v, t]) => el("option", { value: v, text: t })));
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
      referencia.textContent = tr(`Todos los pares: n(n − 1)/2 = ${formato(n * (n - 1) / 2)}. Menos comparaciones: ${menosC}. Menos escrituras: ${menosE}.`,
        `All the pairs: n(n − 1)/2 = ${formato(n * (n - 1) / 2)}. Fewest comparisons: ${menosC}. Fewest writes: ${menosE}.`);
    }

    selN.addEventListener("change", correr);
    selTipo.addEventListener("change", correr);
    caja.classList.add("panel", "ord-carrera");
    caja.append(
      el("div", { class: "controles" },
        el("label", { class: "campo", for: "ord-carrera-n" }, "n", selN),
        el("label", { class: "campo", for: "ord-carrera-tipo" }, tr("Arreglo", "Array"), selTipo),
        el("button", { class: "boton principal", type: "button", text: tr("Otro arreglo", "Another array"), onclick: correr })),
      el("div", { class: "ord-carrera-cuerpo" },
        el("div", { class: "ord-carrera-fila ord-carrera-titulos" }, el("span"), el("span", { text: tr("comparaciones", "comparisons") }), el("span", { text: tr("escrituras en v (un swap escribe 2)", "writes to v (a swap writes 2)") })),
        filas.map((f) => f.fila),
        referencia));
    correr();
  }

  if (typeof document !== "undefined") montarCarrera();
})();
