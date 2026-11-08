// Lección de merge sort y quicksort (divide y vencerás), en pasos. Los
// fragmentos de código deben coincidir línea por línea con
// ejemplos/cpp/merge_sort_quicksort.cpp (scripts/verificar-fragmentos.mjs
// lo revisa).
(function () {
  const { el } = DS;
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
  // Fragmentos de C++ (copiados de ejemplos/cpp/merge_sort_quicksort.cpp)
  // ------------------------------------------------------------------

  const CODIGO = {
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
  };

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
    const base = (o) => Object.assign({ rango: [izq, der], mitades: [izq, medio, der], llamada: `mezclar(v, ${izq}, ${medio}, ${der})` }, extra, o);
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
      paso(K, 4, `Mezclamos { ${izquierda} } y { ${derecha} } tomando siempre el menor de los dos frentes: aux = { ${s.aux.map(texto).join(", ")} }. ${comparaciones} comparación(es).`);
      deAux(s, izq);
      ver(s, base({ vars: { "aux.size()": s.aux.length }, escritas: [izq, der], vueltas: { 10: s.aux.length } }));
      paso(K, 11, `v[${izq}..${der}] = aux: los ${s.aux.length} valores vuelven ordenados a su lugar en v.`);
      return;
    }
    ver(s, base({ vars: { "aux.size()": s.aux.length }, punteros: { i, j } }));
    paso(K, 3, `aux empieza vacío. i = ${i} apunta al frente de la mitad izquierda y j = ${j} al de la derecha. Las dos ya están ordenadas.`);
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
      paso(K, izqGana ? 5 : 6, `${izqGana ? "Sí" : "No"}: ${quien} es el menor de los dos frentes y baja a aux[${s.aux.length - 1}]. ${izqGana ? "i" : "j"} avanza.`);
    }
    const resto = i <= medio ? "izquierda" : "derecha";
    let n8 = 0;
    while (i <= medio) {
      n8++;
      aAux(s, i++);
      ver(s, base({ vars: { i, j }, punteros: { i, j }, cambio: ["copias a aux"], vueltas: { 8: n8 } }));
      paso(K, 8, `La mitad derecha se acabó: lo que queda de la izquierda ya está ordenado y baja tal cual (${texto(s.aux[s.aux.length - 1])}).`);
    }
    let n9 = 0;
    while (j <= der) {
      n9++;
      aAux(s, j++);
      ver(s, base({ vars: { i, j }, punteros: { i, j }, cambio: ["copias a aux"], vueltas: { 9: n9 } }));
      paso(K, 9, `La mitad izquierda se acabó: lo que queda de la derecha baja tal cual (${texto(s.aux[s.aux.length - 1])}).`);
    }
    if (!n8 && !n9) ver(s, base({ vars: { i, j } }));
    deAux(s, izq);
    ver(s, base({ vars: { "aux.size()": s.aux.length }, escritas: [izq, der], vueltas: { 10: s.aux.length } }));
    paso(K, 11, `for: v[izq + k] = aux[k]. Los ${s.aux.length} valores vuelven a v[${izq}..${der}], ya mezclados.`
      + (n8 + n9 ? ` (Al final sobraban valores de la ${resto}: no hizo falta compararlos.)` : ""));
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
        ? `${llamada}: un solo elemento (${val(s, izq)}) ya está ordenado. return.`
        : `${llamada}: rango vacío. return.`);
      cerrarLlamada(s, pila);
      return;
    }
    const medio = izq + Math.floor((der - izq) / 2);
    s.arbol[nodo].medio = medio;
    ver(s, base({ vars: { izq, der, medio }, mitades: [izq, medio, der], cambio: ["medio"] }));
    paso(K, 5, `${llamada}: ${der - izq + 1} elementos. medio = ${izq} + (${der} − ${izq}) / 2 = ${medio}. Partimos sin mirar los valores: v[${izq}..${medio}] y v[${medio + 1}..${der}].`);
    ver(s, base({ vars: { izq, der, medio }, mitades: [izq, medio, der] }));
    paso(K, 6, `Primero ordenamos la mitad izquierda, v[${izq}..${medio}], con una llamada recursiva.`);
    animarMergeSort(s, paso, izq, medio, prof + 1, pila, detalle);
    ver(s, base({ vars: { izq, der, medio }, mitades: [izq, medio, der] }));
    paso(K, 7, `De vuelta en ${llamada}: la izquierda ya está ordenada { ${lista(s, izq, medio)} }. Ahora la derecha, v[${medio + 1}..${der}].`);
    animarMergeSort(s, paso, medio + 1, der, prof + 1, pila, detalle);
    ver(s, base({ vars: { izq, der, medio }, mitades: [izq, medio, der] }));
    paso(K, 8, `Las dos mitades están ordenadas: { ${lista(s, izq, medio)} } y { ${lista(s, medio + 1, der)} }. mezclar las junta en O(n).`);
    animarMezclar(s, paso, izq, medio, der, detalle, {});
    s.aux = [];
    cerrarLlamada(s, pila);
  }

  function ordenarMerge(s, paso, detalle) {
    const n = s.items.length;
    animarMergeSort(s, paso, 0, n - 1, 0, [], detalle);
    s.fijos = s.items.map((_, k) => k);
    ver(s, { vars: { n }, nivel: 1, llamada: `mergeSort(v, 0, ${n - 1})` });
    paso("mergeSort", 8, `¡Ordenado! { ${lista(s, 0, n - 1)} }. ${s.cuenta.comparaciones} comparaciones y ${s.cuenta["copias a aux"]} copias a aux (la memoria extra de merge sort).`, "exito");
  }

  // ------------------------------------------------------------------
  // mergeSortIterativo: bloques de 1, 2, 4… (el árbol crece hacia abajo)
  // ------------------------------------------------------------------

  function ordenarMergeIterativo(s, paso, detalle) {
    const K = "mergeSortIterativo";
    const n = s.items.length;
    for (let k = 0; k < n; k++) s.arbol.push({ a: k, b: k, prof: 0, estado: "lista" });
    ver(s, { vars: { n } });
    paso(K, 2, `n = ${n}. Arriba en el árbol, cada valor solo es un bloque de 1: ya está ordenado.`);
    let pasada = 0;
    for (let ancho = 1; ancho < n; ancho *= 2) {
      pasada++;
      ver(s, { vars: { n, ancho }, vueltas: { 3: pasada }, cambio: ["ancho"] });
      paso(K, 3, `ancho = ${ancho}: mezclamos de a pares los bloques ordenados de ${ancho}, y quedan bloques de ${2 * ancho}.`);
      let vuelta = 0;
      for (let izq = 0; izq < n - ancho; izq += 2 * ancho) {
        vuelta++;
        const medio = izq + ancho - 1;
        const der = Math.min(izq + 2 * ancho - 1, n - 1);
        const nodo = s.arbol.length;
        s.arbol.push({ a: izq, b: der, prof: pasada, estado: "activa", medio });
        ver(s, { vars: { n, ancho, izq, medio, der }, rango: [izq, der], mitades: [izq, medio, der], vueltas: { 3: pasada, 4: vuelta }, cambio: ["izq", "medio", "der"] });
        paso(K, 6, `izq = ${izq}, medio = ${medio}, der = min(${izq + 2 * ancho - 1}, ${n - 1}) = ${der}: los bloques v[${izq}..${medio}] y v[${medio + 1}..${der}].`);
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
    paso(K, 3, `ancho = ${ancho} ya no cumple ancho < n: un solo bloque, ¡ordenado! Sin recursión, el mismo trabajo: ${s.cuenta.comparaciones} comparaciones.`, "exito");
  }

  // ------------------------------------------------------------------
  // particionar (Lomuto): detallado o resumido
  // ------------------------------------------------------------------

  function animarParticion(s, paso, bajo, alto, detalle, extra) {
    const K = "particionar";
    const pivote = s.items[alto].v;
    const nombre = val(s, alto);
    const base = (o) => Object.assign({ rango: [bajo, alto], pivote: alto, llamada: `particionar(v, ${bajo}, ${alto})` }, extra, o);
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
      paso(K, 10, `Pivote ${nombre}: a su izquierda quedan los ≤ ${nombre}${p > bajo ? ` { ${lista(s, bajo, p - 1)} }` : " (ninguno)"} y a su derecha los mayores${p < alto ? ` { ${lista(s, p + 1, alto)} }` : " (ninguno)"}. ${nombre} ya está en su lugar definitivo: v[${p}].`);
      return p;
    }
    ver(s, base({ vars: { pivote: nombre }, cambio: ["pivote"] }));
    paso(K, 2, `pivote = v[${alto}] = ${nombre}: el último. Vamos a dejar a su izquierda los ≤ ${nombre}.`);
    ver(s, base({ vars: { pivote: nombre, i }, punteros: { i }, cambio: ["i"] }));
    paso(K, 3, `i = bajo − 1 = ${i}: i marca el final de la zona de los ≤ pivote, que empieza vacía.`);
    for (let j = bajo; j < alto; j++) {
      const menor = s.items[j].v <= pivote;
      s.cuenta.comparaciones++;
      ver(s, base({ vars: { pivote: nombre, i, j }, punteros: { i, j }, zonas: zonas(bajo, i, i + 1, j - 1), comparar: [j], veredicto: { texto: `v[j] <= pivote: ${val(s, j)} <= ${nombre}`, si: menor }, cambio: ["comparaciones"], vueltas: { 4: j - bajo + 1 } }));
      paso(K, 5, menor
        ? `${val(s, j)} ≤ ${nombre}: pertenece a la zona de los menores.`
        : `${val(s, j)} > ${nombre}: se queda donde está; la zona de los mayores crece.`);
      if (menor) {
        i++;
        const mismo = i === j;
        if (!mismo) intercambiar(s, i, j);
        ver(s, base({ vars: { pivote: nombre, i, j }, punteros: { i, j }, zonas: zonas(bajo, i, i + 1, j), intercambio: mismo ? [] : [i, j], cambio: ["i"], vueltas: { 4: j - bajo + 1 } }));
        paso(K, 7, mismo
          ? `i++ → ${i}, y swap(v[${i}], v[${j}]) es con sí mismo: no hay mayores en medio, nada se mueve.`
          : `i++ → ${i}, y swap(v[${i}], v[${j}]): ${val(s, i)} entra a la zona de los menores y ${val(s, j)}, que era mayor, pasa al final de los mayores.`);
      }
    }
    const p = i + 1;
    if (p !== alto) intercambiar(s, p, alto);
    s.fijos.push(p);
    ver(s, base({ pivote: p, vars: { pivote: nombre, i }, punteros: { "i + 1": p }, zonas: zonas(bajo, p - 1, p + 1, alto), intercambio: p !== alto ? [p, alto] : [], vueltas: { 4: alto - bajo } }));
    paso(K, 10, p !== alto
      ? `swap(v[${p}], v[${alto}]): el pivote ${nombre} va justo después de los menores. Ya está en su lugar definitivo.`
      : `swap(v[${p}], v[${alto}]) es con sí mismo: ${nombre} era el mayor y ya estaba en su lugar.`);
    ver(s, base({ pivote: p, vars: { pivote: nombre }, salida: p, zonas: zonas(bajo, p - 1, p + 1, alto) }));
    paso(K, 11, `return ${p}: la posición del pivote. A la izquierda todo es ≤ ${nombre}, a la derecha todo es mayor, pero cada lado sigue desordenado.`);
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
    const llamada = `${K}(v, ${bajo}, ${alto})`;
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
        ? `${llamada}: un solo elemento (${val(s, bajo)}) ya está en su lugar. return.`
        : `${llamada}: rango vacío (bajo > alto). return.`);
      if (bajo === alto) cerrarLlamada(s, pila);
      return;
    }
    const nodo = abrirLlamada(s, pila, bajo, alto, prof);
    ver(s, base({}));
    paso(K, 5, `${llamada}: ${alto - bajo + 1} elementos. Primero ${aleatorio ? "particionarAleatorio" : "particionar"}: todo el trabajo se hace al dividir.`);
    const p = aleatorio ? animarAleatorio(s, paso, bajo, alto, detalle) : animarParticion(s, paso, bajo, alto, detalle, {});
    s.arbol[nodo].p = p;
    ver(s, base({ vars: { bajo, alto, p }, pivote: p, zonas: zonas(bajo, p - 1, p + 1, alto), cambio: ["p"] }));
    paso(K, 6, `p = ${p}. Ahora ordenamos los menores, v[${bajo}..${p - 1}]: el pivote ya no se mueve.`);
    animarQuickSort(s, paso, bajo, p - 1, prof + 1, pila, detalle, aleatorio);
    ver(s, base({ vars: { bajo, alto, p }, pivote: p, zonas: zonas(bajo, p - 1, p + 1, alto) }));
    paso(K, 7, `De vuelta en ${llamada}: los menores ya están. Ahora los mayores, v[${p + 1}..${alto}].`);
    animarQuickSort(s, paso, p + 1, alto, prof + 1, pila, detalle, aleatorio);
    cerrarLlamada(s, pila);
  }

  function animarAleatorio(s, paso, bajo, alto, detalle) {
    const K = "particionarAleatorio";
    const k = bajo + Math.floor(Math.random() * (alto - bajo + 1));
    const base = (o) => Object.assign({ rango: [bajo, alto], llamada: `particionarAleatorio(v, ${bajo}, ${alto})`, vars: { bajo, alto, k } }, o);
    ver(s, base({ punteros: { k }, comparar: [k], cambio: ["k"] }));
    paso(K, 2, `k = ${k}, al azar entre ${bajo} y ${alto}: el pivote será ${val(s, k)}.`);
    if (k !== alto) intercambiar(s, k, alto);
    ver(s, base({ punteros: { k }, intercambio: k !== alto ? [k, alto] : [], pivote: alto }));
    paso(K, 3, k !== alto
      ? `swap(v[${k}], v[${alto}]): lo llevamos al final, donde particionar espera el pivote.`
      : `k ya es alto: el pivote ya está al final.`);
    return animarParticion(s, paso, bajo, alto, detalle, {});
  }

  function ordenarQuick(s, paso, detalle, aleatorio) {
    const K = aleatorio ? "quickSortAleatorio" : "quickSort";
    const n = s.items.length;
    animarQuickSort(s, paso, 0, n - 1, 0, [], detalle, aleatorio);
    s.fijos = s.items.map((_, k) => k);
    ver(s, { vars: { n }, nivel: 1, llamada: `${K}(v, 0, ${n - 1})` });
    const prof = s.cuenta["profundidad máx."];
    paso(K, 7, `¡Ordenado! { ${lista(s, 0, n - 1)} }. ${s.cuenta.comparaciones} comparaciones, ${s.intercambios} intercambios y la recursión llegó a ${prof} llamadas de profundidad`
      + (prof >= n ? " (tantas como elementos: el peor caso)." : "."), "exito");
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
      paso(K, 3, `k = ${k} no está entre ${bajo} y ${alto}: no existe el ${k}-ésimo menor de ${alto - bajo + 1} elemento(s). Se lanza std::out_of_range.`, "error");
      return;
    }
    abrirLlamada(s, pila, bajo, alto, prof);
    if (bajo === alto) {
      if (!s.fijos.includes(bajo)) s.fijos.push(bajo);
      ver(s, base({ salida: val(s, bajo), encontrada: bajo }));
      paso(K, 6, `bajo == alto: queda un solo candidato. return v[${bajo}] = ${val(s, bajo)}. Cada llamada de arriba devuelve este mismo valor.`, "exito");
      return;
    }
    ver(s, base({}));
    paso(K, 8, `${llamada}: particionamos v[${bajo}..${alto}].`);
    const p = animarParticion(s, paso, bajo, alto, false, {});
    if (k === p) {
      ver(s, base({ vars: { bajo, alto, k, p }, pivote: p, salida: val(s, p), encontrada: p }));
      paso(K, 10, `k == p: el pivote cayó justo en la posición ${k}. return ${val(s, p)}. No hizo falta ordenar nada más.`, "exito");
      return;
    }
    const izquierda = k < p;
    const descartados = izquierda ? [p, alto] : [bajo, p];
    ver(s, base({ vars: { bajo, alto, k, p }, pivote: p, descartados, cambio: ["p"] }));
    paso(K, izquierda ? 12 : 14, izquierda
      ? `k (${k}) < p (${p}): el que buscamos está entre los menores. Descartamos v[${p}..${alto}] sin mirarlos y seguimos solo por la izquierda.`
      : `k (${k}) > p (${p}): el que buscamos está entre los mayores. Descartamos v[${bajo}..${p}] y seguimos solo por la derecha.`);
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
    const cuenta = DS.variables(s.cuenta, vis.cambio);
    cuenta.classList.add("ord-cuenta");
    escenario.querySelector(".ord-info").replaceChildren(
      vis.llamada ? el("code", { class: "dyv-llamada", text: vis.llamada }) : "",
      DS.variables(vis.vars || { n: s.items.length }, vis.cambio),
      cuenta,
      vis.veredicto ? el("span", { class: `ord-veredicto ${vis.veredicto.si ? "si" : "no"}` },
        el("code", { text: vis.veredicto.texto }), el("b", { text: vis.veredicto.si ? "→ sí" : "→ no" })) : "",
      vis.salida != null ? el("div", { class: "salida-valor" }, "devuelve", el("div", { class: "celda encontrada", text: vis.salida })) : "");

    // Capa fija: zonas, mitades, índices, caja de aux y árbol de llamadas.
    const n = s.items.length;
    const piezas = [];
    const banda = (a, b, tipo, largo, corto) => {
      if (b < a) return;
      const ancho = anchoRango(a, b) + 8;
      piezas.push(el("div", { class: `ord-zona ${tipo}`, style: `left:${xDe(a) - 4}px;top:${CABEZA - 16}px;width:${ancho}px;height:${altoMax(s) + 20}px` },
        el("span", { class: "ord-zona-texto", text: ancho >= 90 ? largo : corto })));
    };
    if (vis.zonas) for (const z of vis.zonas) banda(z.desde, z.hasta, z.tipo, z.tipo === "menores" ? "≤ pivote" : "> pivote", z.tipo === "menores" ? "≤" : ">");
    else if (vis.mitades) {
      const [a, m, b] = vis.mitades;
      banda(a, m, "izquierda", "izquierda", "izq.");
      banda(m + 1, b, "derecha", "derecha", "der.");
    }
    for (let k = 0; k < n; k++) {
      piezas.push(el("span", { class: "indice ord-indice", style: `left:${xDe(k)}px;top:${g.yBaseV + 3}px;width:${ANCHO_BARRA}px`, text: k }));
    }
    if (vis.buscado != null && vis.buscado >= 0 && vis.buscado < n) {
      piezas.push(el("span", { class: "dyv-buscado", style: `left:${xDe(vis.buscado) - 5}px;top:${g.yBaseV + 1}px;width:${ANCHO_BARRA + 10}px` }));
    }
    if (s.conAux) {
      piezas.push(el("div", { class: "ord-carril", style: `left:${MARGEN - 10}px;top:${g.yAux}px;width:${g.ancho - 2 * MARGEN + 20}px;height:${g.yBaseAux - g.yAux + 6}px` },
        el("span", { class: "ord-carril-nombre", text: "aux (vector temporal de mezclar)" })));
    }
    if (!s.sinArbol) piezas.push(el("span", { class: "dyv-arbol-titulo", style: `left:${MARGEN - 10}px;top:${g.yArbol}px`, text: s.tituloArbol || "llamadas (cada barra es el rango de una llamada)" }));
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
      nodo.textContent = fila === 1 ? `▲ ${nombre}` : nombre;
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
  const BLOQUES = "bloques ordenados (una fila por cada ancho: 1, 2, 4, 8)";
  const OPCIONES_ARREGLO = [["main", "El de main()"], ["azar", "Al azar"], ["ordenado", "Ya ordenado"], ["reves", "Al revés"]];
  const OPCIONES_DETALLE = [["resumen", "Mezcla resumida"], ["detalle", "Mezcla paso a paso"]];
  const OPCIONES_DETALLE_Q = [["resumen", "Partición resumida"], ["detalle", "Partición paso a paso"]];

  function tema(contenedor, cfg) {
    DS.tema(Object.assign({
      contenedor,
      incremental: true,
      dibujar,
      tituloCodigo: (clave) => `${clave}()`,
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
    entradas: [{ id: "caso", etiqueta: "Mitades", opciones: [["main", "{27, 38, 43} y {3, 9, 10, 82}"], ["sobra", "Una mitad toda menor"], ["iguales", "Con un 5 en cada mitad"]] }],
    estadoInicial: (valores) => {
      const s = estadoDesde(MEZCLAS[valores.caso].valores, { conAux: true, sinArbol: true });
      s.vis = { mitades: [0, MEZCLAS[valores.caso].medio, s.items.length - 1] };
      return s;
    },
    mensajeInicial: "Las dos mitades ya están ordenadas. Pulsa mezclar: en cada paso baja a aux el menor de los dos frentes.",
    operaciones: [{
      id: "mezclar",
      etiqueta: (valores) => `mezclar(v, 0, ${MEZCLAS[valores.caso].medio}, ${MEZCLAS[valores.caso].valores.length - 1})`,
      usa: ["caso"],
      ejecutar(s, { caso }, paso) {
        prepararCorrida(s);
        const n = s.items.length;
        animarMezclar(s, paso, 0, MEZCLAS[caso].medio, n - 1, true, {});
        s.aux = [];
        s.fijos = s.items.map((_, k) => k);
        ver(s, { vars: { izq: 0, medio: MEZCLAS[caso].medio, der: n - 1 } });
        const conLetras = s.items.filter((b) => b.e).map((b) => b.e).join("");
        paso("mezclar", 13, `Listo: { ${lista(s, 0, n - 1)} }. ${s.cuenta.comparaciones} comparaciones para ${n} valores: nunca más de n − 1.`
          + (conLetras ? (conLetras === "ab" ? " El 5ᵃ quedó antes que el 5ᵇ: con <= gana la izquierda, y por eso merge sort es estable." : "") : ""), "exito");
      },
    }],
  });

  // Paso 2: mergeSort recursivo.
  tema("vis-merge", {
    codigo: fragmentos("mergeSort", "mezclar"),
    entradas: [{ id: "arreglo", etiqueta: "Arreglo", opciones: OPCIONES_ARREGLO }],
    estadoInicial: (valores) => estadoDesde(ARREGLOS[valores.arreglo](), { conAux: true, filasArbol: 4 }),
    mensajeInicial: "El arreglo de main(). Abajo aparece cada llamada con su rango: se parte a la mitad hasta llegar a un elemento, y al volver se mezcla.",
    operaciones: [{
      id: "mergeSort",
      etiqueta: () => "mergeSort(v, 0, n − 1)",
      ejecutar(s, args, paso) { prepararCorrida(s); ordenarMerge(s, paso, false); },
    }],
  });

  // Paso 3: mergeSortIterativo.
  tema("vis-iterativo", {
    codigo: fragmentos("mergeSortIterativo", "mezclar"),
    entradas: [{ id: "arreglo", etiqueta: "Arreglo", opciones: [["azar", "Al azar"], ["main", "El de main()"], ["reves", "Al revés"]] }],
    estadoInicial: (valores) => estadoDesde(ARREGLOS[valores.arreglo](), { conAux: true, filasArbol: 4, tituloArbol: BLOQUES }),
    mensajeInicial: "Sin recursión: primero bloques de 1, después de 2, de 4 y de 8. El árbol se arma de arriba hacia abajo.",
    operaciones: [{
      id: "mergeSortIterativo",
      etiqueta: "mergeSortIterativo(v)",
      ejecutar(s, args, paso) { prepararCorrida(s); ordenarMergeIterativo(s, paso, false); },
    }],
  });

  // Paso 4: particionar paso a paso.
  tema("vis-particion", {
    codigo: fragmentos("particionar"),
    entradas: [{ id: "arreglo", etiqueta: "Arreglo", opciones: [["main", "El de main()"], ["azar", "Al azar"], ["ordenado", "Ya ordenado"]] }],
    estadoInicial: (valores) => estadoDesde(ARREGLOS[valores.arreglo](), { sinArbol: true, filasArbol: 0 }),
    mensajeInicial: "El pivote es el último (morado). Mira cómo crecen la zona de los ≤ pivote (azul) y la de los mayores (amarilla).",
    operaciones: [{
      id: "particionar",
      etiqueta: () => "particionar(v, 0, n − 1)",
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
      { id: "arreglo", etiqueta: "Arreglo", opciones: OPCIONES_ARREGLO },
      { id: "detalle", etiqueta: "Ver", opciones: OPCIONES_DETALLE_Q, reinicia: false },
    ],
    estadoInicial: (valores) => estadoDesde(ARREGLOS[valores.arreglo](), { filasArbol: 4 }),
    mensajeInicial: "Cada particionar deja un pivote en su lugar (verde). Después se ordena cada lado con una llamada recursiva.",
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
      { id: "version", etiqueta: "", opciones: [["quickSort", "Pivote: el último"], ["quickSortAleatorio", "Pivote: al azar"]], reinicia: false },
      { id: "arreglo", etiqueta: "", opciones: [["ordenado", "Ya ordenado"], ["reves", "Al revés"], ["azar", "Al azar"]] },
    ],
    estadoInicial: (valores) => estadoDesde(ARREGLOS[valores.arreglo]().slice(0, 7), { filasArbol: 7 }),
    mensajeInicial: "Con el arreglo ya ordenado, el último siempre es el mayor. Ordena con quickSort y mira la escalera de llamadas; después prueba quickSortAleatorio.",
    operaciones: [{
      id: "ordenar",
      etiqueta: (valores) => `${valores.version}(v, 0, n − 1)`,
      usa: ["version"],
      ejecutar(s, { version }, paso) { prepararCorrida(s); ordenarQuick(s, paso, false, version === "quickSortAleatorio"); },
    }],
  });

  // Paso 7: quickselect.
  tema("vis-select", {
    codigo: fragmentos("quickselect", "particionar"),
    entradas: [
      { id: "k", etiqueta: "k", min: -3, max: 12, valor: 3 },
      { id: "arreglo", etiqueta: "Arreglo", opciones: [["main", "El de main()"], ["azar", "Al azar"]] },
    ],
    estadoInicial: (valores) => estadoDesde(ARREGLOS[valores.arreglo](), { filasArbol: 3 }),
    mensajeInicial: "k = 3 es la mediana de 7 valores: el que quedaría en v[3] si se ordenara. Prueba también k = 0, k = 6 y un k inválido.",
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
      { id: "algoritmo", etiqueta: "Algoritmo", opciones: ALGORITMOS.map((a) => [a, a]), valor: "quickSort" },
      { id: "arreglo", etiqueta: "Arreglo", opciones: [["azar", "Al azar"], ["ordenado", "Ya ordenado"], ["reves", "Al revés"], ["main", "El de main()"]] },
      { id: "detalle", etiqueta: "", opciones: [["resumen", "Resumido"], ["detalle", "Paso a paso"]], reinicia: false },
    ],
    estadoInicial: (valores) => estadoDesde(ARREGLOS[valores.arreglo](), {
      conAux: valores.algoritmo.startsWith("merge"),
      filasArbol: valores.algoritmo.startsWith("merge") ? 4 : 8,
      tituloArbol: valores.algoritmo === "mergeSortIterativo" ? BLOQUES : null,
    }),
    mensajeInicial: "Elige algoritmo y arreglo. \"Paso a paso\" muestra cada comparación de mezclar o de particionar; Reiniciar trae otro arreglo al azar.",
    operaciones: [{
      id: "ordenar",
      etiqueta: (valores) => valores.algoritmo.endsWith("Iterativo") ? `${valores.algoritmo}(v)` : `${valores.algoritmo}(v, 0, n − 1)`,
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
      memoria = `${n.toLocaleString("es")} (aux)`;
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
      memoria = `${profundidad.toLocaleString("es")} marcos`;
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
    const formato = (x) => x.toLocaleString("es");
    const selN = el("select", { id: "dyv-carrera-n" }, [100, 1000, 10000].map((n) => el("option", { value: n, text: formato(n) })));
    selN.value = "1000";
    const selTipo = el("select", { id: "dyv-carrera-tipo" },
      [["azar", "Al azar"], ["ordenado", "Ya ordenado"], ["reves", "Al revés"], ["iguales", "Solo 1, 2 y 3"]].map(([v, t]) => el("option", { value: v, text: t })));
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
      referencia.textContent = `Para comparar: n log₂ n ≈ ${formato(nlogn)} y n²/2 = ${formato(n * n / 2)}.`;
    }

    selN.addEventListener("change", correr);
    selTipo.addEventListener("change", correr);
    caja.classList.add("panel", "ord-carrera");
    caja.append(
      el("div", { class: "controles" },
        el("label", { class: "campo", for: "dyv-carrera-n" }, "n", selN),
        el("label", { class: "campo", for: "dyv-carrera-tipo" }, "Arreglo", selTipo),
        el("button", { class: "boton principal", type: "button", text: "Otro arreglo", onclick: correr })),
      el("div", { class: "ord-carrera-cuerpo" },
        el("div", { class: "ord-carrera-fila dyv-carrera-fila ord-carrera-titulos" }, el("span"), el("span", { text: "comparaciones" }), el("span", { text: "memoria extra" })),
        filas.map((f) => f.fila),
        referencia));
    correr();
  }

  if (typeof document !== "undefined") montarCarrera();
})();
