// Lección de merge sort y quicksort (divide y vencerás), en pasos. Los
// fragmentos de código deben coincidir línea por línea con
// ejemplos/cpp/merge_sort_quicksort.cpp, y en inglés con
// ejemplos/cpp/en/merge_sort_quicksort.cpp (scripts/verificar-fragmentos.mjs
// lo revisa). Los textos que se ven van en los dos idiomas con DS.tr.
(function () {
  const { el, tr } = DS;
  const PASO = 50; // de una barra a la siguiente
  const ANCHO_BARRA = 40;
  const MARGEN = 44; // deja lugar a la izquierda para i = bajo - 1
  const ALTO_MAX = 80;
  const ALTO_MIN = 24;
  const CABEZA = 18; // etiquetas de las zonas, arriba de las barras
  const BAJO_V = 46; // índices y punteros debajo del arreglo
  const FILA = 16; // alto de cada fila del árbol de llamadas
  const EJEMPLO = [38, 27, 43, 3, 9, 82, 10]; // el mismo arreglo que usa main()

  // ------------------------------------------------------------------
  // Fragmentos de C++
  // ------------------------------------------------------------------

  // Copia exacta de las funciones de ejemplos/cpp/merge_sort_quicksort.cpp y de
  // ejemplos/cpp/en/merge_sort_quicksort.cpp, con las mismas líneas.
  const CODIGO = tr({
    mezclar: `
      void mezclar(vector<int>& v, int izq, int medio, int der) {
          vector<int> aux;
          int i = izq, j = medio + 1;
          while (i <= medio && j <= der) {
              if (v[i] <= v[j]) aux.push_back(v[i++]);
              else aux.push_back(v[j++]);
          }
          while (i <= medio) aux.push_back(v[i++]);
          while (j <= der) aux.push_back(v[j++]);
          for (int k = 0; k < (int)aux.size(); k++) {
              v[izq + k] = aux[k];
          }
      }`,
    mergeSort: `
      void mergeSort(vector<int>& v, int izq, int der) {
          if (izq >= der) {
              return;
          }
          int medio = izq + (der - izq) / 2;
          mergeSort(v, izq, medio);
          mergeSort(v, medio + 1, der);
          mezclar(v, izq, medio, der);
      }`,
    mergeSortIterativo: `
      void mergeSortIterativo(vector<int>& v) {
          int n = v.size();
          for (int ancho = 1; ancho < n; ancho *= 2) {
              for (int izq = 0; izq < n - ancho; izq += 2 * ancho) {
                  int medio = izq + ancho - 1;
                  int der = min(izq + 2 * ancho - 1, n - 1);
                  mezclar(v, izq, medio, der);
              }
          }
      }`,
    particionar: `
      int particionar(vector<int>& v, int bajo, int alto) {
          int pivote = v[alto];
          int i = bajo - 1;
          for (int j = bajo; j < alto; j++) {
              if (v[j] <= pivote) {
                  i++;
                  swap(v[i], v[j]);
              }
          }
          swap(v[i + 1], v[alto]);
          return i + 1;
      }`,
    quickSort: `
      void quickSort(vector<int>& v, int bajo, int alto) {
          if (bajo >= alto) {
              return;
          }
          int p = particionar(v, bajo, alto);
          quickSort(v, bajo, p - 1);
          quickSort(v, p + 1, alto);
      }`,
    particionarAleatorio: `
      int particionarAleatorio(vector<int>& v, int bajo, int alto) {
          int k = bajo + rand() % (alto - bajo + 1);
          swap(v[k], v[alto]);
          return particionar(v, bajo, alto);
      }`,
    quickSortAleatorio: `
      void quickSortAleatorio(vector<int>& v, int bajo, int alto) {
          if (bajo >= alto) {
              return;
          }
          int p = particionarAleatorio(v, bajo, alto);
          quickSortAleatorio(v, bajo, p - 1);
          quickSortAleatorio(v, p + 1, alto);
      }`,
    quickselect: `
      int quickselect(vector<int>& v, int bajo, int alto, int k) {
          if (k < bajo || k > alto) {
              throw out_of_range("k fuera del rango");
          }
          if (bajo == alto) {
              return v[bajo];
          }
          int p = particionar(v, bajo, alto);
          if (k == p) {
              return v[p];
          } else if (k < p) {
              return quickselect(v, bajo, p - 1, k);
          } else {
              return quickselect(v, p + 1, alto, k);
          }
      }`,
  }, {
    mezclar: `
      void merge(vector<int>& v, int left, int mid, int right) {
          vector<int> aux;
          int i = left, j = mid + 1;
          while (i <= mid && j <= right) {
              if (v[i] <= v[j]) aux.push_back(v[i++]);
              else aux.push_back(v[j++]);
          }
          while (i <= mid) aux.push_back(v[i++]);
          while (j <= right) aux.push_back(v[j++]);
          for (int k = 0; k < (int)aux.size(); k++) {
              v[left + k] = aux[k];
          }
      }`,
    mergeSort: `
      void mergeSort(vector<int>& v, int left, int right) {
          if (left >= right) {
              return;
          }
          int mid = left + (right - left) / 2;
          mergeSort(v, left, mid);
          mergeSort(v, mid + 1, right);
          merge(v, left, mid, right);
      }`,
    mergeSortIterativo: `
      void iterativeMergeSort(vector<int>& v) {
          int n = v.size();
          for (int width = 1; width < n; width *= 2) {
              for (int left = 0; left < n - width; left += 2 * width) {
                  int mid = left + width - 1;
                  int right = min(left + 2 * width - 1, n - 1);
                  merge(v, left, mid, right);
              }
          }
      }`,
    particionar: `
      int partition(vector<int>& v, int low, int high) {
          int pivot = v[high];
          int i = low - 1;
          for (int j = low; j < high; j++) {
              if (v[j] <= pivot) {
                  i++;
                  swap(v[i], v[j]);
              }
          }
          swap(v[i + 1], v[high]);
          return i + 1;
      }`,
    quickSort: `
      void quickSort(vector<int>& v, int low, int high) {
          if (low >= high) {
              return;
          }
          int p = partition(v, low, high);
          quickSort(v, low, p - 1);
          quickSort(v, p + 1, high);
      }`,
    particionarAleatorio: `
      int randomPartition(vector<int>& v, int low, int high) {
          int k = low + rand() % (high - low + 1);
          swap(v[k], v[high]);
          return partition(v, low, high);
      }`,
    quickSortAleatorio: `
      void randomQuickSort(vector<int>& v, int low, int high) {
          if (low >= high) {
              return;
          }
          int p = randomPartition(v, low, high);
          randomQuickSort(v, low, p - 1);
          randomQuickSort(v, p + 1, high);
      }`,
    quickselect: `
      int quickselect(vector<int>& v, int low, int high, int k) {
          if (k < low || k > high) {
              throw out_of_range("k out of range");
          }
          if (low == high) {
              return v[low];
          }
          int p = partition(v, low, high);
          if (k == p) {
              return v[p];
          } else if (k < p) {
              return quickselect(v, low, p - 1, k);
          } else {
              return quickselect(v, p + 1, high, k);
          }
      }`,
  });

  // Nombre de cada función en el idioma de la página (las claves quedan en español).
  const F = tr({}, {
    mezclar: "merge", mergeSortIterativo: "iterativeMergeSort", particionar: "partition",
    particionarAleatorio: "randomPartition", quickSortAleatorio: "randomQuickSort",
  });
  const nombreF = (clave) => F[clave] || clave;

  // Nombres del C++ que se dibujan (variables, contadores y punteros). Los
  // estados usan los de español y se traducen al pintar, así son iguales en
  // los dos idiomas.
  const NOMBRES = {
    izq: "left", der: "right", medio: "mid", bajo: "low", alto: "high", pivote: "pivot", ancho: "width",
    comparaciones: "comparisons", "copias a aux": "copies to aux", "profundidad máx.": "max depth",
  };
  const ident = (k) => tr(k, NOMBRES[k] || k);
  const traducirVars = (vars) => Object.fromEntries(Object.entries(vars).map(([k, v]) => [ident(k), v]));

  const fragmentos = (...claves) => Object.fromEntries(claves.map((c) => [c, CODIGO[c]]));

  // ------------------------------------------------------------------
  // Estado: cada valor es una barra con id (se desliza al moverse). aux es
  // el vector temporal de mezclar; arbol guarda el rango de cada llamada.
  // ------------------------------------------------------------------

  let lotes = 0;

  function nuevaBarra(s, v, e, extra) {
    return Object.assign({ id: `b${s.lote}-${s.sig++}`, v }, e ? { e } : {}, extra);
  }

  function estadoDesde(valores, opciones) {
    const s = { lote: ++lotes, sig: 1, items: [], aux: [], arbol: [], fijos: [], vis: {} };
    for (const x of valores) {
      const v = typeof x === "object" ? x.v : x;
      s.items.push(nuevaBarra(s, v, typeof x === "object" ? x.e : null));
    }
    s.maxV = Math.max(1, ...s.items.map((b) => b.v));
    Object.assign(s, opciones);
    prepararCorrida(s);
    return s;
  }

  let corridas = 0;

  function prepararCorrida(s) {
    s.corrida = ++corridas; // los nodos del árbol de otra corrida no se reutilizan
    s.cuenta = s.conAux ? { comparaciones: 0, "copias a aux": 0 } : s.sinArbol ? { comparaciones: 0 } : { comparaciones: 0, "profundidad máx.": 0 };
    s.intercambios = 0; // se cuenta aparte: en pantalla solo comparaciones y profundidad
    s.aux = [];
    s.arbol = [];
    s.fijos = [];
  }

  const LETRA = { a: "ᵃ", b: "ᵇ" };
  const texto = (b) => `${b.v}${b.e ? LETRA[b.e] : ""}`;
  const val = (s, k) => texto(s.items[k]);
  const lista = (s, a, b) => s.items.slice(a, b + 1).map(texto).join(", ");

  function ver(s, o) {
    s.vis = Object.assign({}, o);
  }

  function intercambiar(s, a, b) {
    [s.items[a], s.items[b]] = [s.items[b], s.items[a]];
    s.intercambios++;
  }

  // Árbol de llamadas: un nodo por llamada, con su rango y su estado.
  // La llamada en curso está "activa"; las que la esperan, "espera".
  function abrirLlamada(s, pila, a, b, prof) {
    const k = s.arbol.length;
    s.arbol.push({ a, b, prof, estado: "activa" });
    for (const j of pila) s.arbol[j].estado = "espera";
    pila.push(k);
    if (s.cuenta["profundidad máx."] != null) s.cuenta["profundidad máx."] = Math.max(s.cuenta["profundidad máx."], pila.length);
    return k;
  }

  function cerrarLlamada(s, pila) {
    const k = pila.pop();
    s.arbol[k].estado = "lista";
    if (pila.length) s.arbol[pila[pila.length - 1]].estado = "activa";
  }

  // ------------------------------------------------------------------
  // mezclar: detallado (una comparación por paso) o resumido (dos pasos)
  // ------------------------------------------------------------------

  // v[k] baja a aux: en v queda una copia atenuada (el C++ copia).
  function aAux(s, k) {
    const b = s.items[k];
    s.aux.push({ id: b.id, v: b.v, e: b.e });
    s.items[k] = nuevaBarra(s, b.v, b.e, { copia: true });
    s.cuenta["copias a aux"]++;
  }

  // v[izq + k] = aux[k]: la barra sube y en aux queda una copia.
  function deAux(s, izq) {
    s.aux.forEach((b, k) => {
      s.items[izq + k] = { id: b.id, v: b.v, e: b.e };
      s.aux[k] = nuevaBarra(s, b.v, b.e, { copia: true });
    });
  }

  function animarMezclar(s, paso, izq, medio, der, detalle, extra) {
    const K = "mezclar";
    const base = (o) => Object.assign({ rango: [izq, der], mitades: [izq, medio, der], llamada: `${nombreF("mezclar")}(v, ${izq}, ${medio}, ${der})` }, extra, o);
    s.aux = [];
    s.auxDesde = izq;
    let i = izq;
    let j = medio + 1;
    if (!detalle) {
      // Resumido: la mezcla entera en un paso, la copia de vuelta en otro.
      const izquierda = lista(s, izq, medio);
      const derecha = lista(s, medio + 1, der);
      let comparaciones = 0;
      while (i <= medio && j <= der) {
        comparaciones++;
        if (s.items[i].v <= s.items[j].v) aAux(s, i++);
        else aAux(s, j++);
      }
      while (i <= medio) aAux(s, i++);
      while (j <= der) aAux(s, j++);
      s.cuenta.comparaciones += comparaciones;
      ver(s, base({ vars: { "aux.size()": s.aux.length }, cambio: ["comparaciones", "copias a aux"], vueltas: { 4: comparaciones } }));
      const enAux = s.aux.map(texto).join(", ");
      paso(K, 4, tr(`Mezclamos { ${izquierda} } y { ${derecha} } tomando siempre el menor de los dos frentes: aux = { ${enAux} }. ${comparaciones} comparación(es).`,
        `We merge { ${izquierda} } and { ${derecha} }, always taking the smaller of the two fronts: aux = { ${enAux} }. ${comparaciones} comparison(s).`));
      deAux(s, izq);
      ver(s, base({ vars: { "aux.size()": s.aux.length }, escritas: [izq, der], vueltas: { 10: s.aux.length } }));
      paso(K, 11, tr(`v[${izq}..${der}] = aux: los ${s.aux.length} valores vuelven ordenados a su lugar en v.`, `v[${izq}..${der}] = aux: the ${s.aux.length} values go back to their place in v, sorted.`));
      return;
    }
    ver(s, base({ vars: { "aux.size()": s.aux.length }, punteros: { i, j } }));
    paso(K, 3, tr(`aux empieza vacío. i = ${i} apunta al frente de la mitad izquierda y j = ${j} al de la derecha. Las dos ya están ordenadas.`,
      `aux starts empty. i = ${i} points to the front of the left half and j = ${j} to the front of the right one. Both are already sorted.`));
    let vuelta = 0;
    while (i <= medio && j <= der) {
      vuelta++;
      const izqGana = s.items[i].v <= s.items[j].v;
      const texto1 = `v[i] <= v[j]: ${val(s, i)} <= ${val(s, j)}`;
      const quien = izqGana ? val(s, i) : val(s, j);
      s.cuenta.comparaciones++;
      const desde = izqGana ? i : j;
      aAux(s, desde);
      if (izqGana) i++; else j++;
      ver(s, base({ vars: { i, j }, punteros: { i, j }, veredicto: { texto: texto1, si: izqGana }, cambio: ["comparaciones", "copias a aux"], vueltas: { 4: vuelta } }));
      paso(K, izqGana ? 5 : 6, tr(`${izqGana ? "Sí" : "No"}: ${quien} es el menor de los dos frentes y baja a aux[${s.aux.length - 1}]. ${izqGana ? "i" : "j"} avanza.`,
        `${izqGana ? "Yes" : "No"}: ${quien} is the smaller of the two fronts and goes down to aux[${s.aux.length - 1}]. ${izqGana ? "i" : "j"} moves forward.`));
    }
    const resto = i <= medio ? "izquierda" : "derecha";
    let n8 = 0;
    while (i <= medio) {
      n8++;
      aAux(s, i++);
      ver(s, base({ vars: { i, j }, punteros: { i, j }, cambio: ["copias a aux"], vueltas: { 8: n8 } }));
      paso(K, 8, tr(`La mitad derecha se acabó: lo que queda de la izquierda ya está ordenado y baja tal cual (${texto(s.aux[s.aux.length - 1])}).`,
        `The right half ran out: what's left of the left one is already sorted and goes down as is (${texto(s.aux[s.aux.length - 1])}).`));
    }
    let n9 = 0;
    while (j <= der) {
      n9++;
      aAux(s, j++);
      ver(s, base({ vars: { i, j }, punteros: { i, j }, cambio: ["copias a aux"], vueltas: { 9: n9 } }));
      paso(K, 9, tr(`La mitad izquierda se acabó: lo que queda de la derecha baja tal cual (${texto(s.aux[s.aux.length - 1])}).`,
        `The left half ran out: what's left of the right one goes down as is (${texto(s.aux[s.aux.length - 1])}).`));
    }
    if (!n8 && !n9) ver(s, base({ vars: { i, j } }));
    deAux(s, izq);
    ver(s, base({ vars: { "aux.size()": s.aux.length }, escritas: [izq, der], vueltas: { 10: s.aux.length } }));
    paso(K, 11, tr(`for: v[izq + k] = aux[k]. Los ${s.aux.length} valores vuelven a v[${izq}..${der}], ya mezclados.`,
      `for: v[left + k] = aux[k]. The ${s.aux.length} values go back to v[${izq}..${der}], already merged.`)
      + (n8 + n9
        ? tr(` (Al final sobraban valores de la ${resto}: no hizo falta compararlos.)`,
          ` (At the end there were values left over on the ${resto === "izquierda" ? "left" : "right"}: they didn't need comparing.)`)
        : ""));
  }

  // ------------------------------------------------------------------
  // mergeSort recursivo
  // ------------------------------------------------------------------

  function animarMergeSort(s, paso, izq, der, prof, pila, detalle) {
    const K = "mergeSort";
    const nivel = prof + 1;
    const nodo = abrirLlamada(s, pila, izq, der, prof);
    const llamada = `mergeSort(v, ${izq}, ${der})`;
    const base = (o) => Object.assign({ rango: [izq, der], llamada, nivel, vars: { izq, der } }, o);
    if (izq >= der) {
      ver(s, base({}));
      paso(K, 3, izq === der
        ? tr(`${llamada}: un solo elemento (${val(s, izq)}) ya está ordenado. return.`, `${llamada}: a single element (${val(s, izq)}) is already sorted. return.`)
        : tr(`${llamada}: rango vacío. return.`, `${llamada}: empty range. return.`));
      cerrarLlamada(s, pila);
      return;
    }
    const medio = izq + Math.floor((der - izq) / 2);
    s.arbol[nodo].medio = medio;
    ver(s, base({ vars: { izq, der, medio }, mitades: [izq, medio, der], cambio: ["medio"] }));
    paso(K, 5, tr(`${llamada}: ${der - izq + 1} elementos. medio = ${izq} + (${der} − ${izq}) / 2 = ${medio}. Partimos sin mirar los valores: v[${izq}..${medio}] y v[${medio + 1}..${der}].`,
      `${llamada}: ${der - izq + 1} elements. mid = ${izq} + (${der} − ${izq}) / 2 = ${medio}. We split without looking at the values: v[${izq}..${medio}] and v[${medio + 1}..${der}].`));
    ver(s, base({ vars: { izq, der, medio }, mitades: [izq, medio, der] }));
    paso(K, 6, tr(`Primero ordenamos la mitad izquierda, v[${izq}..${medio}], con una llamada recursiva.`, `First we sort the left half, v[${izq}..${medio}], with a recursive call.`));
    animarMergeSort(s, paso, izq, medio, prof + 1, pila, detalle);
    ver(s, base({ vars: { izq, der, medio }, mitades: [izq, medio, der] }));
    paso(K, 7, tr(`De vuelta en ${llamada}: la izquierda ya está ordenada { ${lista(s, izq, medio)} }. Ahora la derecha, v[${medio + 1}..${der}].`,
      `Back in ${llamada}: the left is already sorted { ${lista(s, izq, medio)} }. Now the right, v[${medio + 1}..${der}].`));
    animarMergeSort(s, paso, medio + 1, der, prof + 1, pila, detalle);
    ver(s, base({ vars: { izq, der, medio }, mitades: [izq, medio, der] }));
    paso(K, 8, tr(`Las dos mitades están ordenadas: { ${lista(s, izq, medio)} } y { ${lista(s, medio + 1, der)} }. mezclar las junta en O(n).`,
      `Both halves are sorted: { ${lista(s, izq, medio)} } and { ${lista(s, medio + 1, der)} }. merge joins them in O(n).`));
    animarMezclar(s, paso, izq, medio, der, detalle, {});
    s.aux = [];
    cerrarLlamada(s, pila);
  }

  function ordenarMerge(s, paso, detalle) {
    const n = s.items.length;
    animarMergeSort(s, paso, 0, n - 1, 0, [], detalle);
    s.fijos = s.items.map((_, k) => k);
    ver(s, { vars: { n }, nivel: 1, llamada: `mergeSort(v, 0, ${n - 1})` });
    paso("mergeSort", 8, tr(`¡Ordenado! { ${lista(s, 0, n - 1)} }. ${s.cuenta.comparaciones} comparaciones y ${s.cuenta["copias a aux"]} copias a aux (la memoria extra de merge sort).`,
      `Sorted! { ${lista(s, 0, n - 1)} }. ${s.cuenta.comparaciones} comparisons and ${s.cuenta["copias a aux"]} copies to aux (merge sort's extra memory).`), "exito");
  }

  // ------------------------------------------------------------------
  // mergeSortIterativo: bloques de 1, 2, 4… (el árbol crece hacia abajo)
  // ------------------------------------------------------------------

  function ordenarMergeIterativo(s, paso, detalle) {
    const K = "mergeSortIterativo";
    const n = s.items.length;
    for (let k = 0; k < n; k++) s.arbol.push({ a: k, b: k, prof: 0, estado: "lista" });
    ver(s, { vars: { n } });
    paso(K, 2, tr(`n = ${n}. Arriba en el árbol, cada valor solo es un bloque de 1: ya está ordenado.`, `n = ${n}. At the top of the tree, each value on its own is a block of 1: it's already sorted.`));
    let pasada = 0;
    for (let ancho = 1; ancho < n; ancho *= 2) {
      pasada++;
      ver(s, { vars: { n, ancho }, vueltas: { 3: pasada }, cambio: ["ancho"] });
      paso(K, 3, tr(`ancho = ${ancho}: mezclamos de a pares los bloques ordenados de ${ancho}, y quedan bloques de ${2 * ancho}.`,
        `width = ${ancho}: we merge the sorted blocks of ${ancho} in pairs, and blocks of ${2 * ancho} are left.`));
      let vuelta = 0;
      for (let izq = 0; izq < n - ancho; izq += 2 * ancho) {
        vuelta++;
        const medio = izq + ancho - 1;
        const der = Math.min(izq + 2 * ancho - 1, n - 1);
        const nodo = s.arbol.length;
        s.arbol.push({ a: izq, b: der, prof: pasada, estado: "activa", medio });
        ver(s, { vars: { n, ancho, izq, medio, der }, rango: [izq, der], mitades: [izq, medio, der], vueltas: { 3: pasada, 4: vuelta }, cambio: ["izq", "medio", "der"] });
        paso(K, 6, tr(`izq = ${izq}, medio = ${medio}, der = min(${izq + 2 * ancho - 1}, ${n - 1}) = ${der}: los bloques v[${izq}..${medio}] y v[${medio + 1}..${der}].`,
          `left = ${izq}, mid = ${medio}, right = min(${izq + 2 * ancho - 1}, ${n - 1}) = ${der}: the blocks v[${izq}..${medio}] and v[${medio + 1}..${der}].`));
        animarMezclar(s, paso, izq, medio, der, detalle, { vars: { izq, medio, der } });
        s.aux = [];
        s.arbol[nodo].estado = "lista";
      }
      // Un bloque sin pareja pasa tal cual a la fila siguiente.
      let suelto = 0;
      while (suelto < n - ancho) suelto += 2 * ancho;
      if (suelto < n) s.arbol.push({ a: suelto, b: n - 1, prof: pasada, estado: "lista" });
    }
    let ancho = 1;
    while (ancho < n) ancho *= 2;
    s.fijos = s.items.map((_, k) => k);
    ver(s, { vars: { n, ancho }, vueltas: { 3: pasada } });
    paso(K, 3, tr(`ancho = ${ancho} ya no cumple ancho < n: un solo bloque, ¡ordenado! Sin recursión, el mismo trabajo: ${s.cuenta.comparaciones} comparaciones.`,
      `width = ${ancho} no longer satisfies width < n: a single block, sorted! No recursion, the same work: ${s.cuenta.comparaciones} comparisons.`), "exito");
  }

  // ------------------------------------------------------------------
  // particionar (Lomuto): detallado o resumido
  // ------------------------------------------------------------------

  function animarParticion(s, paso, bajo, alto, detalle, extra) {
    const K = "particionar";
    const pivote = s.items[alto].v;
    const nombre = val(s, alto);
    const base = (o) => Object.assign({ rango: [bajo, alto], pivote: alto, llamada: `${nombreF("particionar")}(v, ${bajo}, ${alto})` }, extra, o);
    let i = bajo - 1;
    if (!detalle) {
      let comparaciones = 0;
      for (let j = bajo; j < alto; j++) {
        comparaciones++;
        if (s.items[j].v <= pivote) {
          i++;
          if (i !== j) intercambiar(s, i, j);
        }
      }
      s.cuenta.comparaciones += comparaciones;
      if (i + 1 !== alto) intercambiar(s, i + 1, alto);
      const p = i + 1;
      s.fijos.push(p);
      ver(s, base({ pivote: p, zonas: zonas(bajo, p - 1, p + 1, alto), vars: { pivote: nombre, p }, cambio: ["comparaciones"] }));
      const menores = p > bajo ? ` { ${lista(s, bajo, p - 1)} }` : tr(" (ninguno)", " (none)");
      const mayores = p < alto ? ` { ${lista(s, p + 1, alto)} }` : tr(" (ninguno)", " (none)");
      paso(K, 10, tr(`Pivote ${nombre}: a su izquierda quedan los ≤ ${nombre}${menores} y a su derecha los mayores${mayores}. ${nombre} ya está en su lugar definitivo: v[${p}].`,
        `Pivot ${nombre}: the ones ≤ ${nombre} end up on its left${menores} and the larger ones on its right${mayores}. ${nombre} is already in its final place: v[${p}].`));
      return p;
    }
    ver(s, base({ vars: { pivote: nombre }, cambio: ["pivote"] }));
    paso(K, 2, tr(`pivote = v[${alto}] = ${nombre}: el último. Vamos a dejar a su izquierda los ≤ ${nombre}.`, `pivot = v[${alto}] = ${nombre}: the last one. We'll leave the ones ≤ ${nombre} on its left.`));
    ver(s, base({ vars: { pivote: nombre, i }, punteros: { i }, cambio: ["i"] }));
    paso(K, 3, tr(`i = bajo − 1 = ${i}: i marca el final de la zona de los ≤ pivote, que empieza vacía.`, `i = low − 1 = ${i}: i marks the end of the zone of the ones ≤ pivot, which starts empty.`));
    for (let j = bajo; j < alto; j++) {
      const menor = s.items[j].v <= pivote;
      s.cuenta.comparaciones++;
      ver(s, base({ vars: { pivote: nombre, i, j }, punteros: { i, j }, zonas: zonas(bajo, i, i + 1, j - 1), comparar: [j], veredicto: { texto: `v[j] <= ${ident("pivote")}: ${val(s, j)} <= ${nombre}`, si: menor }, cambio: ["comparaciones"], vueltas: { 4: j - bajo + 1 } }));
      paso(K, 5, menor
        ? tr(`${val(s, j)} ≤ ${nombre}: pertenece a la zona de los menores.`, `${val(s, j)} ≤ ${nombre}: it belongs in the zone of the smaller ones.`)
        : tr(`${val(s, j)} > ${nombre}: se queda donde está; la zona de los mayores crece.`, `${val(s, j)} > ${nombre}: it stays where it is; the zone of the larger ones grows.`));
      if (menor) {
        i++;
        const mismo = i === j;
        if (!mismo) intercambiar(s, i, j);
        ver(s, base({ vars: { pivote: nombre, i, j }, punteros: { i, j }, zonas: zonas(bajo, i, i + 1, j), intercambio: mismo ? [] : [i, j], cambio: ["i"], vueltas: { 4: j - bajo + 1 } }));
        paso(K, 7, mismo
          ? tr(`i++ → ${i}, y swap(v[${i}], v[${j}]) es con sí mismo: no hay mayores en medio, nada se mueve.`,
            `i++ → ${i}, and swap(v[${i}], v[${j}]) is with itself: there are no larger ones in between, nothing moves.`)
          : tr(`i++ → ${i}, y swap(v[${i}], v[${j}]): ${val(s, i)} entra a la zona de los menores y ${val(s, j)}, que era mayor, pasa al final de los mayores.`,
            `i++ → ${i}, and swap(v[${i}], v[${j}]): ${val(s, i)} enters the zone of the smaller ones and ${val(s, j)}, which was larger, moves to the end of the larger ones.`));
      }
    }
    const p = i + 1;
    if (p !== alto) intercambiar(s, p, alto);
    s.fijos.push(p);
    ver(s, base({ pivote: p, vars: { pivote: nombre, i }, punteros: { "i + 1": p }, zonas: zonas(bajo, p - 1, p + 1, alto), intercambio: p !== alto ? [p, alto] : [], vueltas: { 4: alto - bajo } }));
    paso(K, 10, p !== alto
      ? tr(`swap(v[${p}], v[${alto}]): el pivote ${nombre} va justo después de los menores. Ya está en su lugar definitivo.`,
        `swap(v[${p}], v[${alto}]): the pivot ${nombre} goes right after the smaller ones. It's already in its final place.`)
      : tr(`swap(v[${p}], v[${alto}]) es con sí mismo: ${nombre} era el mayor y ya estaba en su lugar.`,
        `swap(v[${p}], v[${alto}]) is with itself: ${nombre} was the largest and was already in its place.`));
    ver(s, base({ pivote: p, vars: { pivote: nombre }, salida: p, zonas: zonas(bajo, p - 1, p + 1, alto) }));
    paso(K, 11, tr(`return ${p}: la posición del pivote. A la izquierda todo es ≤ ${nombre}, a la derecha todo es mayor, pero cada lado sigue desordenado.`,
      `return ${p}: the pivot's position. On the left everything is ≤ ${nombre}, on the right everything is larger, but each side is still unsorted.`));
    return p;
  }

  function zonas(a, b, c, d) {
    const r = [];
    if (b >= a) r.push({ desde: a, hasta: b, tipo: "menores" });
    if (d >= c) r.push({ desde: c, hasta: d, tipo: "mayores" });
    return r;
  }

  // ------------------------------------------------------------------
  // quickSort y quickSortAleatorio
  // ------------------------------------------------------------------

  function animarQuickSort(s, paso, bajo, alto, prof, pila, detalle, aleatorio) {
    const K = aleatorio ? "quickSortAleatorio" : "quickSort";
    const nivel = prof + 1;
    const llamada = `${nombreF(K)}(v, ${bajo}, ${alto})`;
    const base = (o) => Object.assign({ rango: [bajo, alto], llamada, nivel, vars: { bajo, alto } }, o);
    if (bajo >= alto) {
      if (bajo === alto) {
        abrirLlamada(s, pila, bajo, alto, prof);
        if (!s.fijos.includes(bajo)) s.fijos.push(bajo);
      } else if (s.cuenta["profundidad máx."] != null) {
        s.cuenta["profundidad máx."] = Math.max(s.cuenta["profundidad máx."], pila.length + 1);
      }
      ver(s, base({}));
      paso(K, 3, bajo === alto
        ? tr(`${llamada}: un solo elemento (${val(s, bajo)}) ya está en su lugar. return.`, `${llamada}: a single element (${val(s, bajo)}) is already in place. return.`)
        : tr(`${llamada}: rango vacío (bajo > alto). return.`, `${llamada}: empty range (low > high). return.`));
      if (bajo === alto) cerrarLlamada(s, pila);
      return;
    }
    const nodo = abrirLlamada(s, pila, bajo, alto, prof);
    ver(s, base({}));
    const particion = nombreF(aleatorio ? "particionarAleatorio" : "particionar");
    paso(K, 5, tr(`${llamada}: ${alto - bajo + 1} elementos. Primero ${particion}: todo el trabajo se hace al dividir.`,
      `${llamada}: ${alto - bajo + 1} elements. First ${particion}: all the work is done when dividing.`));
    const p = aleatorio ? animarAleatorio(s, paso, bajo, alto, detalle) : animarParticion(s, paso, bajo, alto, detalle, {});
    s.arbol[nodo].p = p;
    ver(s, base({ vars: { bajo, alto, p }, pivote: p, zonas: zonas(bajo, p - 1, p + 1, alto), cambio: ["p"] }));
    paso(K, 6, tr(`p = ${p}. Ahora ordenamos los menores, v[${bajo}..${p - 1}]: el pivote ya no se mueve.`, `p = ${p}. Now we sort the smaller ones, v[${bajo}..${p - 1}]: the pivot doesn't move anymore.`));
    animarQuickSort(s, paso, bajo, p - 1, prof + 1, pila, detalle, aleatorio);
    ver(s, base({ vars: { bajo, alto, p }, pivote: p, zonas: zonas(bajo, p - 1, p + 1, alto) }));
    paso(K, 7, tr(`De vuelta en ${llamada}: los menores ya están. Ahora los mayores, v[${p + 1}..${alto}].`, `Back in ${llamada}: the smaller ones are done. Now the larger ones, v[${p + 1}..${alto}].`));
    animarQuickSort(s, paso, p + 1, alto, prof + 1, pila, detalle, aleatorio);
    cerrarLlamada(s, pila);
  }

  function animarAleatorio(s, paso, bajo, alto, detalle) {
    const K = "particionarAleatorio";
    const k = bajo + Math.floor(Math.random() * (alto - bajo + 1));
    const base = (o) => Object.assign({ rango: [bajo, alto], llamada: `${nombreF(K)}(v, ${bajo}, ${alto})`, vars: { bajo, alto, k } }, o);
    ver(s, base({ punteros: { k }, comparar: [k], cambio: ["k"] }));
    paso(K, 2, tr(`k = ${k}, al azar entre ${bajo} y ${alto}: el pivote será ${val(s, k)}.`, `k = ${k}, at random between ${bajo} and ${alto}: the pivot will be ${val(s, k)}.`));
    if (k !== alto) intercambiar(s, k, alto);
    ver(s, base({ punteros: { k }, intercambio: k !== alto ? [k, alto] : [], pivote: alto }));
    paso(K, 3, k !== alto
      ? tr(`swap(v[${k}], v[${alto}]): lo llevamos al final, donde particionar espera el pivote.`, `swap(v[${k}], v[${alto}]): we move it to the end, where partition expects the pivot.`)
      : tr("k ya es alto: el pivote ya está al final.", "k is already high: the pivot is already at the end."));
    return animarParticion(s, paso, bajo, alto, detalle, {});
  }

  function ordenarQuick(s, paso, detalle, aleatorio) {
    const K = aleatorio ? "quickSortAleatorio" : "quickSort";
    const n = s.items.length;
    animarQuickSort(s, paso, 0, n - 1, 0, [], detalle, aleatorio);
    s.fijos = s.items.map((_, k) => k);
    ver(s, { vars: { n }, nivel: 1, llamada: `${nombreF(K)}(v, 0, ${n - 1})` });
    const prof = s.cuenta["profundidad máx."];
    paso(K, 7, tr(`¡Ordenado! { ${lista(s, 0, n - 1)} }. ${s.cuenta.comparaciones} comparaciones, ${s.intercambios} intercambios y la recursión llegó a ${prof} llamadas de profundidad`,
      `Sorted! { ${lista(s, 0, n - 1)} }. ${s.cuenta.comparaciones} comparisons, ${s.intercambios} swaps, and the recursion reached a depth of ${prof} calls`)
      + (prof >= n ? tr(" (tantas como elementos: el peor caso).", " (as many as elements: the worst case).") : "."), "exito");
  }

  // ------------------------------------------------------------------
  // quickselect
  // ------------------------------------------------------------------

  function animarQuickselect(s, paso, bajo, alto, k, prof, pila) {
    const K = "quickselect";
    const nivel = prof + 1;
    const llamada = `quickselect(v, ${bajo}, ${alto}, ${k})`;
    const base = (o) => Object.assign({ rango: [bajo, alto], llamada, nivel, buscado: k, vars: { bajo, alto, k } }, o);
    if (k < bajo || k > alto) {
      ver(s, base({ error: true, rango: null }));
      paso(K, 3, tr(`k = ${k} no está entre ${bajo} y ${alto}: no existe el ${k}-ésimo menor de ${alto - bajo + 1} elemento(s). Se lanza std::out_of_range.`,
        `k = ${k} isn't between ${bajo} and ${alto}: there's no smallest number ${k} among ${alto - bajo + 1} element(s). std::out_of_range is thrown.`), "error");
      return;
    }
    abrirLlamada(s, pila, bajo, alto, prof);
    if (bajo === alto) {
      if (!s.fijos.includes(bajo)) s.fijos.push(bajo);
      ver(s, base({ salida: val(s, bajo), encontrada: bajo }));
      paso(K, 6, tr(`bajo == alto: queda un solo candidato. return v[${bajo}] = ${val(s, bajo)}. Cada llamada de arriba devuelve este mismo valor.`,
        `low == high: there's a single candidate left. return v[${bajo}] = ${val(s, bajo)}. Each call above returns this same value.`), "exito");
      return;
    }
    ver(s, base({}));
    paso(K, 8, tr(`${llamada}: particionamos v[${bajo}..${alto}].`, `${llamada}: we partition v[${bajo}..${alto}].`));
    const p = animarParticion(s, paso, bajo, alto, false, {});
    if (k === p) {
      ver(s, base({ vars: { bajo, alto, k, p }, pivote: p, salida: val(s, p), encontrada: p }));
      paso(K, 10, tr(`k == p: el pivote cayó justo en la posición ${k}. return ${val(s, p)}. No hizo falta ordenar nada más.`,
        `k == p: the pivot landed right at position ${k}. return ${val(s, p)}. Nothing else needed sorting.`), "exito");
      return;
    }
    const izquierda = k < p;
    const descartados = izquierda ? [p, alto] : [bajo, p];
    ver(s, base({ vars: { bajo, alto, k, p }, pivote: p, descartados, cambio: ["p"] }));
    paso(K, izquierda ? 12 : 14, izquierda
      ? tr(`k (${k}) < p (${p}): el que buscamos está entre los menores. Descartamos v[${p}..${alto}] sin mirarlos y seguimos solo por la izquierda.`,
        `k (${k}) < p (${p}): the one we're looking for is among the smaller ones. We discard v[${p}..${alto}] without looking at them and go on only to the left.`)
      : tr(`k (${k}) > p (${p}): el que buscamos está entre los mayores. Descartamos v[${bajo}..${p}] y seguimos solo por la derecha.`,
        `k (${k}) > p (${p}): the one we're looking for is among the larger ones. We discard v[${bajo}..${p}] and go on only to the right.`));
    animarQuickselect(s, paso, izquierda ? bajo : p + 1, izquierda ? p - 1 : alto, k, prof + 1, pila);
  }

  // ------------------------------------------------------------------
  // Dibujo: barras de v arriba, aux debajo (merge sort) y el árbol de
  // llamadas con el rango de cada una.
  // ------------------------------------------------------------------

  const xDe = (k) => MARGEN + k * PASO;
  // Con aux (dos filas de barras) o un árbol muy profundo, las barras son más bajas.
  const altoMax = (s) => (s.conAux || s.filasArbol >= 6 ? 56 : ALTO_MAX);
  const altoDe = (s, v) => Math.round(ALTO_MIN + (altoMax(s) - ALTO_MIN) * Math.max(0, v) / s.maxV);
  const anchoRango = (a, b) => (b - a + 1) * PASO - (PASO - ANCHO_BARRA);

  function geometria(s) {
    const yBaseV = CABEZA + altoMax(s);
    const yAux = yBaseV + (s.conAux ? 34 : BAJO_V); // en mezclar, i y j nunca coinciden: una fila de punteros
    const yBaseAux = yAux + 16 + altoMax(s);
    const yArbol = s.conAux ? yBaseAux + 10 : yBaseV + BAJO_V;
    const filas = Math.max(s.filasArbol || 1, ...s.arbol.map((x) => x.prof + 1));
    const n = Math.max(1, s.items.length);
    const alto = s.sinArbol ? yArbol - 8 : yArbol + 14 + filas * FILA;
    return { yBaseV, yAux, yBaseAux, yArbol, alto, ancho: 2 * MARGEN + anchoRango(0, n - 1) };
  }

  function crearLienzo(escenario) {
    const lienzo = el("div", { class: "ord-lienzo" }, el("div", { class: "ord-capa" }), el("div", { class: "ord-punteros" }));
    escenario.append(el("div", { class: "ord-info", "data-alto-estable": true }), el("div", { class: "ord-marco" }, lienzo));
    return lienzo;
  }

  if (typeof window !== "undefined") {
    window.addEventListener("resize", () => {
      for (const lienzo of document.querySelectorAll(".dyv .ord-lienzo")) escalar(lienzo.closest(".escenario"), lienzo);
    });
  }

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
    escenario.classList.add("dyv");
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

    // Llamada en curso, variables, contadores, comparación y valor devuelto.
    const cambio = (vis.cambio || []).map(ident);
    const cuenta = DS.variables(traducirVars(s.cuenta), cambio);
    cuenta.classList.add("ord-cuenta");
    escenario.querySelector(".ord-info").replaceChildren(
      vis.llamada ? el("code", { class: "dyv-llamada", text: vis.llamada }) : "",
      DS.variables(traducirVars(vis.vars || { n: s.items.length }), cambio),
      cuenta,
      vis.veredicto ? el("span", { class: `ord-veredicto ${vis.veredicto.si ? "si" : "no"}` },
        el("code", { text: vis.veredicto.texto }), el("b", { text: vis.veredicto.si ? tr("→ sí", "→ yes") : "→ no" })) : "",
      vis.salida != null ? el("div", { class: "salida-valor" }, tr("devuelve", "returns"), el("div", { class: "celda encontrada", text: vis.salida })) : "");

    // Capa fija: zonas, mitades, índices, caja de aux y árbol de llamadas.
    const n = s.items.length;
    const piezas = [];
    const banda = (a, b, tipo, largo, corto) => {
      if (b < a) return;
      const ancho = anchoRango(a, b) + 8;
      piezas.push(el("div", { class: `ord-zona ${tipo}`, style: `left:${xDe(a) - 4}px;top:${CABEZA - 16}px;width:${ancho}px;height:${altoMax(s) + 20}px` },
        el("span", { class: "ord-zona-texto", text: ancho >= 90 ? largo : corto })));
    };
    if (vis.zonas) for (const z of vis.zonas) banda(z.desde, z.hasta, z.tipo, `${z.tipo === "menores" ? "≤" : ">"} ${ident("pivote")}`, z.tipo === "menores" ? "≤" : ">");
    else if (vis.mitades) {
      const [a, m, b] = vis.mitades;
      banda(a, m, "izquierda", tr("izquierda", "left"), tr("izq.", "left"));
      banda(m + 1, b, "derecha", tr("derecha", "right"), tr("der.", "right"));
    }
    for (let k = 0; k < n; k++) {
      piezas.push(el("span", { class: "indice ord-indice", style: `left:${xDe(k)}px;top:${g.yBaseV + 3}px;width:${ANCHO_BARRA}px`, text: k }));
    }
    if (vis.buscado != null && vis.buscado >= 0 && vis.buscado < n) {
      piezas.push(el("span", { class: "dyv-buscado", style: `left:${xDe(vis.buscado) - 5}px;top:${g.yBaseV + 1}px;width:${ANCHO_BARRA + 10}px` }));
    }
    if (s.conAux) {
      piezas.push(el("div", { class: "ord-carril", style: `left:${MARGEN - 10}px;top:${g.yAux}px;width:${g.ancho - 2 * MARGEN + 20}px;height:${g.yBaseAux - g.yAux + 6}px` },
        el("span", { class: "ord-carril-nombre", text: tr("aux (vector temporal de mezclar)", "aux (merge's temporary vector)") })));
    }
    if (!s.sinArbol) piezas.push(el("span", { class: "dyv-arbol-titulo", style: `left:${MARGEN - 10}px;top:${g.yArbol}px`, text: s.tituloArbol || tr("llamadas (cada barra es el rango de una llamada)", "calls (each bar is one call's range)") }));
    lienzo.querySelector(".ord-capa").replaceChildren(...piezas);

    // Árbol de llamadas: cada nodo es un elemento propio (solo el nuevo aparece con animación).
    let arbol = lienzo.querySelector(".dyv-arbol");
    if (!arbol) {
      arbol = el("div", { class: "dyv-arbol" });
      lienzo.append(arbol);
    }
    const nodosVivos = new Set();
    s.arbol.forEach((nodo, k) => {
      if (nodo.b < nodo.a) return;
      const clave = `${s.corrida}-${k}`;
      nodosVivos.add(clave);
      const ancho = anchoRango(nodo.a, nodo.b);
      const etiqueta = nodo.a === nodo.b ? `${nodo.a}` : `${nodo.a}..${nodo.b}`;
      let caja = arbol.querySelector(`[data-k="${clave}"]`);
      const nueva = !caja;
      if (nueva) {
        caja = el("span", { "data-k": clave });
        arbol.append(caja);
      }
      caja.className = `dyv-nodo ${nodo.estado}${nueva ? " nuevo" : ""}`;
      caja.style.cssText = `left:${xDe(nodo.a)}px;top:${g.yArbol + 14 + nodo.prof * FILA}px;width:${ancho}px`;
      caja.title = etiqueta;
      caja.replaceChildren(ancho >= 30 ? etiqueta : "",
        nodo.p != null && nodo.a !== nodo.b ? el("i", { class: "dyv-pivote-nodo", style: `left:${(nodo.p - nodo.a) * PASO + ANCHO_BARRA / 2 - 5}px` }) : "");
    });
    for (const caja of arbol.querySelectorAll(".dyv-nodo")) if (!nodosVivos.has(caja.dataset.k)) caja.remove();

    // Barras de v y de aux, por id.
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
      const moviendo = !nueva && (nodo.style.left !== `${x}px` || nodo.style.top !== `${yAbajo - h}px`);
      nodo.style.left = `${x}px`;
      nodo.style.top = `${yAbajo - h}px`;
      nodo.style.height = `${h}px`;
      nodo.replaceChildren(...contenidoBarra(b));
      if (clases.includes("salta") && nodo.classList.contains("salta")) {
        nodo.classList.remove("salta");
        void nodo.offsetWidth;
      }
      nodo.className = ["ord-barra", ...clases, moviendo ? "moviendo" : "", nueva && !b.copia ? "aparece" : ""].filter(Boolean).join(" ");
    };
    const fuera = (k) => (vis.rango && (k < vis.rango[0] || k > vis.rango[1])) || (vis.descartados && k >= vis.descartados[0] && k <= vis.descartados[1]);
    s.items.forEach((b, k) => {
      const clases = [];
      if (b.copia) clases.push("copia");
      if (s.fijos.includes(k) && !b.copia) clases.push("fija");
      if (vis.pivote === k && !b.copia) clases.push("pivote");
      if ((vis.comparar || []).includes(k)) clases.push("comparando");
      if ((vis.intercambio || []).includes(k)) clases.push("intercambio", ...(k === vis.intercambio[0] ? ["salta"] : []));
      if (vis.escritas && k >= vis.escritas[0] && k <= vis.escritas[1]) clases.push("escrita");
      if (vis.encontrada === k) clases.push("encontrada");
      if (fuera(k)) clases.push("atenuada");
      ubicar(b, xDe(k), g.yBaseV, clases);
    });
    s.aux.forEach((b, k) => {
      ubicar(b, xDe(s.auxDesde + k), g.yBaseAux, b.copia ? ["copia"] : ["escrita"]);
    });
    for (const nodo of lienzo.querySelectorAll(".ord-barra[data-id]")) if (!vivas.has(nodo.dataset.id)) retirar(nodo);

    // Punteros.
    const capa = lienzo.querySelector(".ord-punteros");
    const usados = new Set();
    const porPosicion = {};
    for (const [nombre, k] of Object.entries(vis.punteros || {})) {
      if (k == null) continue;
      const fila = porPosicion[k] = (porPosicion[k] || 0) + 1;
      usados.add(nombre);
      let nodo = capa.querySelector(`[data-nombre="${nombre}"]`);
      const x = xDe(k) + ANCHO_BARRA / 2;
      const y = g.yBaseV + 17 + (fila - 1) * 14;
      if (!nodo) {
        nodo = el("span", { class: "ord-puntero", "data-nombre": nombre, style: `left:${x}px;top:${y}px` });
        capa.append(nodo);
      }
      nodo.textContent = fila === 1 ? `▲ ${ident(nombre)}` : ident(nombre);
      nodo.style.left = `${x}px`;
      nodo.style.top = `${y}px`;
      nodo.className = `ord-puntero${k < 0 || k >= n ? " fuera" : ""}`;
    }
    for (const nodo of capa.querySelectorAll(".ord-puntero")) if (!usados.has(nodo.dataset.nombre)) nodo.remove();
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
    azar: () => alAzar(8, 60),
    ordenado: () => [5, 12, 18, 26, 33, 41, 50, 58],
    reves: () => [58, 50, 41, 33, 26, 18, 12, 5],
  };
  const BLOQUES = tr("bloques ordenados (una fila por cada ancho: 1, 2, 4, 8)", "sorted blocks (one row per width: 1, 2, 4, 8)");
  // Los nombres de cada tipo de arreglo en las listas.
  const A = {
    main: tr("El de main()", "The one from main()"), azar: tr("Al azar", "Random"),
    ordenado: tr("Ya ordenado", "Already sorted"), reves: tr("Al revés", "Reversed"),
  };
  const opcionesArreglo = (...claves) => claves.map((c) => [c, A[c]]);
  const OPCIONES_ARREGLO = opcionesArreglo("main", "azar", "ordenado", "reves");
  const OPCIONES_DETALLE_Q = [["resumen", tr("Partición resumida", "Partition summarized")], ["detalle", tr("Partición paso a paso", "Partition step by step")]];

  function tema(contenedor, cfg) {
    DS.tema(Object.assign({
      contenedor,
      incremental: true,
      dibujar,
      tituloCodigo: (clave) => `${nombreF(clave)}()`,
    }, cfg));
  }

  // Paso 1: mezclar dos mitades ordenadas.
  const MEZCLAS = {
    main: { valores: [27, 38, 43, 3, 9, 10, 82], medio: 2 },
    sobra: { valores: [3, 9, 10, 27, 38, 43, 82], medio: 3 },
    iguales: { valores: [2, { v: 5, e: "a" }, 8, 1, { v: 5, e: "b" }, 9], medio: 2 },
  };
  tema("vis-mezclar", {
    codigo: fragmentos("mezclar"),
    entradas: [{
      id: "caso",
      etiqueta: tr("Mitades", "Halves"),
      opciones: [["main", tr("{27, 38, 43} y {3, 9, 10, 82}", "{27, 38, 43} and {3, 9, 10, 82}")], ["sobra", tr("Una mitad toda menor", "One half all smaller")], ["iguales", tr("Con un 5 en cada mitad", "With a 5 in each half")]],
    }],
    estadoInicial: (valores) => {
      const s = estadoDesde(MEZCLAS[valores.caso].valores, { conAux: true, sinArbol: true });
      s.vis = { mitades: [0, MEZCLAS[valores.caso].medio, s.items.length - 1] };
      return s;
    },
    mensajeInicial: tr("Las dos mitades ya están ordenadas. Pulsa mezclar: en cada paso baja a aux el menor de los dos frentes.",
      "Both halves are already sorted. Press merge: at each step the smaller of the two fronts goes down to aux."),
    operaciones: [{
      id: "mezclar",
      etiqueta: (valores) => `${nombreF("mezclar")}(v, 0, ${MEZCLAS[valores.caso].medio}, ${MEZCLAS[valores.caso].valores.length - 1})`,
      usa: ["caso"],
      ejecutar(s, { caso }, paso) {
        prepararCorrida(s);
        const n = s.items.length;
        animarMezclar(s, paso, 0, MEZCLAS[caso].medio, n - 1, true, {});
        s.aux = [];
        s.fijos = s.items.map((_, k) => k);
        ver(s, { vars: { izq: 0, medio: MEZCLAS[caso].medio, der: n - 1 } });
        const conLetras = s.items.filter((b) => b.e).map((b) => b.e).join("");
        paso("mezclar", 13, tr(`Listo: { ${lista(s, 0, n - 1)} }. ${s.cuenta.comparaciones} comparaciones para ${n} valores: nunca más de n − 1.`,
          `Done: { ${lista(s, 0, n - 1)} }. ${s.cuenta.comparaciones} comparisons for ${n} values: never more than n − 1.`)
          + (conLetras === "ab"
            ? tr(" El 5ᵃ quedó antes que el 5ᵇ: con <= gana la izquierda, y por eso merge sort es estable.",
              " 5ᵃ stayed before 5ᵇ: with <= the left one wins, and that's why merge sort is stable.")
            : ""), "exito");
      },
    }],
  });

  // Paso 2: mergeSort recursivo.
  tema("vis-merge", {
    codigo: fragmentos("mergeSort", "mezclar"),
    entradas: [{ id: "arreglo", etiqueta: tr("Arreglo", "Array"), opciones: OPCIONES_ARREGLO }],
    estadoInicial: (valores) => estadoDesde(ARREGLOS[valores.arreglo](), { conAux: true, filasArbol: 4 }),
    mensajeInicial: tr("El arreglo de main(). Abajo aparece cada llamada con su rango: se parte a la mitad hasta llegar a un elemento, y al volver se mezcla.",
      "The array from main(). Below, each call shows up with its range: it splits in half until it reaches one element, and merges on the way back."),
    operaciones: [{
      id: "mergeSort",
      etiqueta: () => "mergeSort(v, 0, n − 1)",
      ejecutar(s, args, paso) { prepararCorrida(s); ordenarMerge(s, paso, false); },
    }],
  });

  // Paso 3: mergeSortIterativo.
  tema("vis-iterativo", {
    codigo: fragmentos("mergeSortIterativo", "mezclar"),
    entradas: [{ id: "arreglo", etiqueta: tr("Arreglo", "Array"), opciones: opcionesArreglo("azar", "main", "reves") }],
    estadoInicial: (valores) => estadoDesde(ARREGLOS[valores.arreglo](), { conAux: true, filasArbol: 4, tituloArbol: BLOQUES }),
    mensajeInicial: tr("Sin recursión: primero bloques de 1, después de 2, de 4 y de 8. El árbol se arma de arriba hacia abajo.",
      "No recursion: first blocks of 1, then of 2, of 4 and of 8. The tree is built from top to bottom."),
    operaciones: [{
      id: "mergeSortIterativo",
      etiqueta: `${nombreF("mergeSortIterativo")}(v)`,
      ejecutar(s, args, paso) { prepararCorrida(s); ordenarMergeIterativo(s, paso, false); },
    }],
  });

  // Paso 4: particionar paso a paso.
  tema("vis-particion", {
    codigo: fragmentos("particionar"),
    entradas: [{ id: "arreglo", etiqueta: tr("Arreglo", "Array"), opciones: opcionesArreglo("main", "azar", "ordenado") }],
    estadoInicial: (valores) => estadoDesde(ARREGLOS[valores.arreglo](), { sinArbol: true, filasArbol: 0 }),
    mensajeInicial: tr("El pivote es el último (morado). Mira cómo crecen la zona de los ≤ pivote (azul) y la de los mayores (amarilla).",
      "The pivot is the last one (purple). Watch how the zone of the ones ≤ pivot (blue) and the zone of the larger ones (yellow) grow."),
    operaciones: [{
      id: "particionar",
      etiqueta: () => `${nombreF("particionar")}(v, 0, n − 1)`,
      ejecutar(s, args, paso) {
        prepararCorrida(s);
        animarParticion(s, paso, 0, s.items.length - 1, true, {});
      },
    }],
  });

  // Paso 5: quickSort.
  tema("vis-quick", {
    codigo: fragmentos("quickSort", "particionar"),
    entradas: [
      { id: "arreglo", etiqueta: tr("Arreglo", "Array"), opciones: OPCIONES_ARREGLO },
      { id: "detalle", etiqueta: tr("Ver", "Show"), opciones: OPCIONES_DETALLE_Q, reinicia: false },
    ],
    estadoInicial: (valores) => estadoDesde(ARREGLOS[valores.arreglo](), { filasArbol: 4 }),
    mensajeInicial: tr("Cada particionar deja un pivote en su lugar (verde). Después se ordena cada lado con una llamada recursiva.",
      "Each partition leaves a pivot in its place (green). Then each side is sorted with a recursive call."),
    operaciones: [{
      id: "quickSort",
      etiqueta: () => "quickSort(v, 0, n − 1)",
      usa: ["detalle"],
      ejecutar(s, { detalle }, paso) { prepararCorrida(s); ordenarQuick(s, paso, detalle === "detalle", false); },
    }],
  });

  // Paso 6: el peor caso y el pivote al azar.
  tema("vis-peor", {
    codigo: fragmentos("quickSort", "quickSortAleatorio", "particionarAleatorio", "particionar"),
    codigoInicial: (valores) => valores.version,
    entradas: [
      {
        id: "version", etiqueta: "", opciones: [["quickSort", tr("Pivote: el último", "Pivot: the last one")], ["quickSortAleatorio", tr("Pivote: al azar", "Pivot: random")]],
        // Elegir el pivote muestra enseguida la versión que va a correr.
        alCambiar: (s, { version }) => ({
          codigo: version,
          mensaje: version === "quickSort"
            ? tr("quickSort usa como pivote el último del rango: con el arreglo ya ordenado es el mayor, y cada partición deja todo de un lado.",
              "quickSort uses the last one in the range as the pivot: with the array already sorted it's the largest, and each partition leaves everything on one side.")
            : tr("quickSortAleatorio elige un pivote al azar y lo pone al final antes de particionar: así casi nunca cae en el peor caso.",
              "randomQuickSort picks a random pivot and puts it at the end before partitioning: that way it almost never hits the worst case."),
        }),
      },
      { id: "arreglo", etiqueta: "", opciones: opcionesArreglo("ordenado", "reves", "azar") },
    ],
    estadoInicial: (valores) => estadoDesde(ARREGLOS[valores.arreglo]().slice(0, 7), { filasArbol: 7 }),
    mensajeInicial: tr("Con el arreglo ya ordenado, el último siempre es el mayor. Ordena con quickSort y mira la escalera de llamadas; después prueba quickSortAleatorio.",
      "With the array already sorted, the last one is always the largest. Sort with quickSort and watch the staircase of calls; then try randomQuickSort."),
    operaciones: [{
      id: "ordenar",
      etiqueta: (valores) => `${nombreF(valores.version)}(v, 0, n − 1)`,
      usa: ["version"],
      ejecutar(s, { version }, paso) { prepararCorrida(s); ordenarQuick(s, paso, false, version === "quickSortAleatorio"); },
    }],
  });

  // Paso 7: quickselect.
  tema("vis-select", {
    codigo: fragmentos("quickselect", "particionar"),
    entradas: [
      { id: "k", etiqueta: "k", min: -3, max: 12, valor: 3 },
      { id: "arreglo", etiqueta: tr("Arreglo", "Array"), opciones: opcionesArreglo("main", "azar") },
    ],
    estadoInicial: (valores) => estadoDesde(ARREGLOS[valores.arreglo](), { filasArbol: 3 }),
    mensajeInicial: tr("k = 3 es la mediana de 7 valores: el que quedaría en v[3] si se ordenara. Prueba también k = 0, k = 6 y un k inválido.",
      "k = 3 is the median of 7 values: the one that would end up in v[3] if it were sorted. Also try k = 0, k = 6 and an invalid k."),
    operaciones: [{
      id: "quickselect",
      etiqueta: () => "quickselect(v, 0, n − 1, k)",
      usa: ["k"],
      ejecutar(s, { k }, paso) {
        prepararCorrida(s);
        animarQuickselect(s, paso, 0, s.items.length - 1, k, 0, []);
      },
    }],
  });

  // Paso 9: todo junto.
  const ALGORITMOS = ["mergeSort", "mergeSortIterativo", "quickSort", "quickSortAleatorio"];
  tema("vis-todo", {
    codigo: fragmentos(...ALGORITMOS, "mezclar", "particionarAleatorio", "particionar"),
    codigoInicial: (valores) => valores.algoritmo,
    entradas: [
      { id: "algoritmo", etiqueta: tr("Algoritmo", "Algorithm"), opciones: ALGORITMOS.map((a) => [a, nombreF(a)]), valor: "quickSort" },
      { id: "arreglo", etiqueta: tr("Arreglo", "Array"), opciones: opcionesArreglo("azar", "ordenado", "reves", "main") },
      { id: "detalle", etiqueta: "", opciones: [["resumen", tr("Resumido", "Summarized")], ["detalle", tr("Paso a paso", "Step by step")]], reinicia: false },
    ],
    estadoInicial: (valores) => estadoDesde(ARREGLOS[valores.arreglo](), {
      conAux: valores.algoritmo.startsWith("merge"),
      filasArbol: valores.algoritmo.startsWith("merge") ? 4 : 8,
      tituloArbol: valores.algoritmo === "mergeSortIterativo" ? BLOQUES : null,
    }),
    mensajeInicial: tr("Elige algoritmo y arreglo. \"Paso a paso\" muestra cada comparación de mezclar o de particionar; Reiniciar trae otro arreglo al azar.",
      "Pick an algorithm and an array. \"Step by step\" shows each comparison of merge or partition; Reset brings another random array."),
    operaciones: [{
      id: "ordenar",
      etiqueta: (valores) => (valores.algoritmo.endsWith("Iterativo") ? `${nombreF(valores.algoritmo)}(v)` : `${nombreF(valores.algoritmo)}(v, 0, n − 1)`),
      usa: ["algoritmo", "detalle"],
      ejecutar(s, { algoritmo, detalle }, paso) {
        prepararCorrida(s);
        const d = detalle === "detalle";
        if (algoritmo === "mergeSort") ordenarMerge(s, paso, d);
        else if (algoritmo === "mergeSortIterativo") ordenarMergeIterativo(s, paso, d);
        else ordenarQuick(s, paso, d, algoritmo === "quickSortAleatorio");
      },
    }],
  });

  // ------------------------------------------------------------------
  // Paso 8: carrera con arreglos grandes (comparaciones y profundidad)
  // ------------------------------------------------------------------

  function medir(algoritmo, arreglo) {
    const v = [...arreglo];
    const n = v.length;
    let comparaciones = 0;
    let profundidad = 0;
    let memoria = "O(1)";
    if (algoritmo === "insertionSort") {
      for (let i = 1; i < n; i++) {
        const clave = v[i];
        let j = i - 1;
        while (j >= 0 && (comparaciones++, v[j] > clave)) { v[j + 1] = v[j]; j--; }
        v[j + 1] = clave;
      }
    } else if (algoritmo === "heapSort") {
      const hundir = (tam, i) => {
        for (;;) {
          let m = i;
          const a = 2 * i + 1;
          const b = 2 * i + 2;
          if (a < tam && (comparaciones++, v[a] > v[m])) m = a;
          if (b < tam && (comparaciones++, v[b] > v[m])) m = b;
          if (m === i) return;
          [v[i], v[m]] = [v[m], v[i]];
          i = m;
        }
      };
      for (let i = Math.floor(n / 2) - 1; i >= 0; i--) hundir(n, i);
      for (let i = n - 1; i > 0; i--) { [v[0], v[i]] = [v[i], v[0]]; hundir(i, 0); }
    } else if (algoritmo === "mergeSort") {
      memoria = `${n.toLocaleString(tr("es", "en"))} (aux)`;
      const aux = new Array(n);
      const ordenar = (a, b, d) => {
        profundidad = Math.max(profundidad, d);
        if (a >= b) return;
        const m = a + Math.floor((b - a) / 2);
        ordenar(a, m, d + 1);
        ordenar(m + 1, b, d + 1);
        let i = a;
        let j = m + 1;
        let k = 0;
        while (i <= m && j <= b) aux[k++] = (comparaciones++, v[i] <= v[j]) ? v[i++] : v[j++];
        while (i <= m) aux[k++] = v[i++];
        while (j <= b) aux[k++] = v[j++];
        for (let t = 0; t < k; t++) v[a + t] = aux[t];
      };
      ordenar(0, n - 1, 1);
    } else {
      // quickSort con pila explícita (para medir la profundidad sin desbordar la de JavaScript).
      const aleatorio = algoritmo === "quickSortAleatorio";
      const pila = [[0, n - 1, 1]];
      while (pila.length) {
        const [bajo, alto, d] = pila.pop();
        profundidad = Math.max(profundidad, d);
        if (bajo >= alto) continue;
        if (aleatorio) {
          const k = bajo + Math.floor(Math.random() * (alto - bajo + 1));
          [v[k], v[alto]] = [v[alto], v[k]];
        }
        const pivote = v[alto];
        let i = bajo - 1;
        for (let j = bajo; j < alto; j++) {
          comparaciones++;
          if (v[j] <= pivote) { i++; [v[i], v[j]] = [v[j], v[i]]; }
        }
        [v[i + 1], v[alto]] = [v[alto], v[i + 1]];
        pila.push([i + 2, alto, d + 1], [bajo, i, d + 1]);
      }
      memoria = `${profundidad.toLocaleString(tr("es", "en"))} ${tr("marcos", "frames")}`;
    }
    return { comparaciones, profundidad, memoria };
  }

  function arregloDePrueba(tipo, n) {
    const v = Array.from({ length: n }, (_, k) => k + 1);
    if (tipo === "reves") return v.reverse();
    if (tipo === "ordenado") return v;
    if (tipo === "iguales") return v.map(() => 1 + Math.floor(Math.random() * 3));
    for (let k = n - 1; k > 0; k--) {
      const r = Math.floor(Math.random() * (k + 1));
      [v[k], v[r]] = [v[r], v[k]];
    }
    return v;
  }

  function montarCarrera() {
    const caja = document.getElementById("vis-carrera");
    if (!caja) return;
    const CORREDORES = ["insertionSort", "heapSort", "mergeSort", "quickSort", "quickSortAleatorio"];
    const formato = (x) => x.toLocaleString(tr("es", "en"));
    const selN = el("select", { id: "dyv-carrera-n" }, [100, 1000, 10000].map((n) => el("option", { value: n, text: formato(n) })));
    selN.value = "1000";
    const selTipo = el("select", { id: "dyv-carrera-tipo" },
      [...opcionesArreglo("azar", "ordenado", "reves"), ["iguales", tr("Solo 1, 2 y 3", "Only 1, 2 and 3")]].map(([v, t]) => el("option", { value: v, text: t })));
    const filas = CORREDORES.map((a) => {
      const barra = el("span", { class: "ord-carrera-barra comparaciones" });
      const num = el("span", { class: "ord-carrera-num" });
      const memoria = el("span", { class: "dyv-carrera-dato" });
      const fila = el("div", { class: "ord-carrera-fila dyv-carrera-fila" },
        el("code", { class: "ord-carrera-nombre", text: nombreF(a) }),
        el("div", { class: "ord-carrera-pista" }, el("span", { class: "ord-carrera-carril" }, barra), num),
        memoria);
      return { a, fila, barra, num, memoria };
    });
    const referencia = el("p", { class: "ord-carrera-referencia", "aria-live": "polite" });

    function correr() {
      const n = Number(selN.value);
      const arreglo = arregloDePrueba(selTipo.value, n);
      const r = filas.map((f) => medir(f.a, arreglo));
      const maximo = Math.max(1, ...r.map((x) => x.comparaciones));
      filas.forEach((f, k) => {
        f.barra.style.width = `${(r[k].comparaciones / maximo) * 100}%`;
        f.num.textContent = formato(r[k].comparaciones);
        f.memoria.textContent = r[k].memoria;
        f.fila.classList.remove("nueva");
        void f.fila.offsetWidth;
        f.fila.classList.add("nueva");
      });
      const nlogn = Math.round(n * Math.log2(n));
      referencia.textContent = tr(`Para comparar: n log₂ n ≈ ${formato(nlogn)} y n²/2 = ${formato(n * n / 2)}.`, `For comparison: n log₂ n ≈ ${formato(nlogn)} and n²/2 = ${formato(n * n / 2)}.`);
    }

    selN.addEventListener("change", correr);
    selTipo.addEventListener("change", correr);
    caja.classList.add("panel", "ord-carrera");
    caja.append(
      el("div", { class: "controles" },
        el("label", { class: "campo", for: "dyv-carrera-n" }, "n", selN),
        el("label", { class: "campo", for: "dyv-carrera-tipo" }, tr("Arreglo", "Array"), selTipo),
        el("button", { class: "boton principal", type: "button", text: tr("Otro arreglo", "Another array"), onclick: correr })),
      el("div", { class: "ord-carrera-cuerpo" },
        el("div", { class: "ord-carrera-fila dyv-carrera-fila ord-carrera-titulos" }, el("span"), el("span", { text: tr("comparaciones", "comparisons") }), el("span", { text: tr("memoria extra", "extra memory") })),
        filas.map((f) => f.fila),
        referencia));
    correr();
  }

  if (typeof document !== "undefined") montarCarrera();
})();
