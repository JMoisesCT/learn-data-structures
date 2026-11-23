// Lección de notación algorítmica (Big-O), en pasos. Los fragmentos de
// código deben coincidir línea por línea con
// ejemplos/cpp/notacion_algoritmica.cpp, y en inglés con
// ejemplos/cpp/en/algorithmic_notation.cpp (scripts/verificar-fragmentos.mjs
// lo revisa). Los textos que se ven van en los dos idiomas con DS.tr.
(function () {
  const { el, tr } = DS;
  const SVG = "http://www.w3.org/2000/svg";

  // ------------------------------------------------------------------
  // Fragmentos de C++ (copiados de ejemplos/cpp/notacion_algoritmica.cpp y
  // de ejemplos/cpp/en/algorithmic_notation.cpp, con las mismas líneas)
  // ------------------------------------------------------------------

  const CODIGO = tr({
    obtener: `
      int obtener(const int datos[], int i) {
          pasos++;
          return datos[i];
      }`,
    sumar: `
      int sumar(const int datos[], int n) {
          int suma = 0;
          for (int i = 0; i < n; i++) {
              pasos++;
              suma += datos[i];
          }
          return suma;
      }`,
    hayRepetidos: `
      bool hayRepetidos(const int datos[], int n) {
          for (int i = 0; i < n; i++) {
              for (int j = i + 1; j < n; j++) {
                  pasos++;
                  if (datos[i] == datos[j]) {
                      return true;
                  }
              }
          }
          return false;
      }`,
    busquedaBinaria: `
      int busquedaBinaria(const int datos[], int n, int objetivo) {
          int izq = 0;
          int der = n - 1;
          while (izq <= der) {
              pasos++;
              int medio = izq + (der - izq) / 2;
              if (datos[medio] == objetivo) {
                  return medio;
              }
              if (datos[medio] < objetivo) {
                  izq = medio + 1;
              } else {
                  der = medio - 1;
              }
          }
          return -1;
      }`,
    contarPresentes: `
      int contarPresentes(const int consultas[], const int datos[], int n) {
          int encontrados = 0;
          for (int i = 0; i < n; i++) {
              if (busquedaBinaria(datos, n, consultas[i]) != -1) {
                  encontrados++;
              }
          }
          return encontrados;
      }`,
  }, {
    obtener: `
      int get(const int data[], int i) {
          steps++;
          return data[i];
      }`,
    sumar: `
      int sum(const int data[], int n) {
          int total = 0;
          for (int i = 0; i < n; i++) {
              steps++;
              total += data[i];
          }
          return total;
      }`,
    hayRepetidos: `
      bool hasDuplicates(const int data[], int n) {
          for (int i = 0; i < n; i++) {
              for (int j = i + 1; j < n; j++) {
                  steps++;
                  if (data[i] == data[j]) {
                      return true;
                  }
              }
          }
          return false;
      }`,
    busquedaBinaria: `
      int binarySearch(const int data[], int n, int target) {
          int left = 0;
          int right = n - 1;
          while (left <= right) {
              steps++;
              int mid = left + (right - left) / 2;
              if (data[mid] == target) {
                  return mid;
              }
              if (data[mid] < target) {
                  left = mid + 1;
              } else {
                  right = mid - 1;
              }
          }
          return -1;
      }`,
    contarPresentes: `
      int countPresent(const int queries[], const int data[], int n) {
          int found = 0;
          for (int i = 0; i < n; i++) {
              if (binarySearch(data, n, queries[i]) != -1) {
                  found++;
              }
          }
          return found;
      }`,
  });

  // Nombres del C++ en el idioma de la página: funciones y variables que se
  // dibujan. Los estados usan siempre los nombres en español.
  const NOMBRES = tr({}, {
    obtener: "get", sumar: "sum", hayRepetidos: "hasDuplicates", busquedaBinaria: "binarySearch", contarPresentes: "countPresent",
    suma: "total", izq: "left", der: "right", medio: "mid", objetivo: "target", encontrados: "found",
  });
  const nombre = (x) => NOMBRES[x] || x;
  const renombrar = (vars) => Object.fromEntries(Object.entries(vars).map(([k, v]) => [nombre(k), v]));

  // Cada clase de complejidad tiene su color (variables --serie-k de estilos.css),
  // el mismo en la carrera, en las gráficas y en las tablas.
  const log2 = (n) => Math.log(n) / Math.LN2;
  const pisoLog = (n) => Math.floor(log2(n) + 1e-9) + 1;
  const CLASES = {
    obtener: { o: "O(1)", serie: 1, peor: () => 1, forma: tr("una línea plana: da igual cuánto valga n.", "a flat line: it doesn't matter what n is.") },
    busquedaBinaria: { o: "O(log n)", serie: 2, peor: (n) => pisoLog(n), forma: tr("una curva que casi se aplana: crece muy, muy despacio.", "a curve that almost flattens out: it grows very, very slowly.") },
    sumar: { o: "O(n)", serie: 3, peor: (n) => n, forma: tr("una recta: los pasos crecen al mismo ritmo que n.", "a straight line: the steps grow at the same pace as n.") },
    contarPresentes: { o: "O(n log n)", serie: 4, peor: (n) => n * pisoLog(n), forma: tr("casi una recta, pero un poco más empinada cada vez.", "almost a straight line, but a little steeper each time.") },
    hayRepetidos: { o: "O(n²)", serie: 5, peor: (n) => (n * (n - 1)) / 2, forma: tr("una curva que se empina cada vez más (una parábola).", "a curve that gets steeper and steeper (a parabola).") },
  };

  // Valores distintos para los arreglos sin orden: los primeros 16 a mano y
  // después el resto de 1 a 99, mezclado (alcanza para n = 64).
  const PRIMEROS = [37, 12, 85, 4, 61, 29, 73, 18, 90, 46, 7, 55, 23, 68, 2, 81];
  const BASE = PRIMEROS.concat(Array.from({ length: 99 }, (_, k) => k + 1)
    .filter((v) => !PRIMEROS.includes(v))
    .sort((a, b) => ((a * 47) % 101) - ((b * 47) % 101)));
  // Con n grande, la animación agrupa varias vueltas en un paso para no durar minutos.
  const MAX_DETALLE = 10;
  // Hasta este n cada pasos++ deja un punto bajo su casilla; con más, no caben.
  const MAX_CON_PUNTOS = 16;
  const impares = (n) => Array.from({ length: n }, (_, k) => 2 * k + 1);
  const hasta = (n) => Array.from({ length: Math.max(0, n) }, (_, k) => k);
  const formato = (x) => x.toLocaleString(DS.idioma === "en" ? "en" : "es", { maximumFractionDigits: 1 });

  // ------------------------------------------------------------------
  // Estado: el arreglo de la última ejecución, el contador de pasos y el
  // historial de ejecuciones (cada una deja un punto en la gráfica).
  // ------------------------------------------------------------------

  // sinPista: no agregar al mensaje final la pista de la curva del peor caso
  // (en Todo junto la gráfica ya tiene las curvas y su leyenda, y el mensaje
  // más largo le quitaría alto al paso).
  function estadoDesde(op, n, sinPista) {
    const s = { historial: [], sigCorrida: 1, vis: {}, sinPista: !!sinPista };
    preparar(s, op, n, "sin");
    s.enCurso = false;
    return s;
  }

  // Al escribir otro n, el arreglo se dibuja de inmediato con ese tamaño; la
  // gráfica conserva los puntos de las ejecuciones anteriores.
  // caso: el de la lista "repetido…" si la hay (cambia los datos de hayRepetidos).
  function cambiarN(s, n, caso, op) {
    const nuevo = Object.assign({}, s, { vis: {} });
    preparar(nuevo, op || s.op, n, caso || "sin");
    nuevo.enCurso = false;
    return nuevo;
  }

  // Elegir "repetido al inicio" o "al final" pone el repetido en los datos en
  // ese momento y marca las dos casillas iguales.
  function cambiarCaso(s, { n, caso }) {
    const nuevo = cambiarN(s, n, caso, "hayRepetidos");
    const d = nuevo.datos;
    let mensaje;
    if (n < 2) {
      mensaje = tr(`Con n = ${n} no hay pares que comparar: no puede haber repetidos.`, `With n = ${n} there are no pairs to compare: there can't be duplicates.`);
    } else if (caso === "inicio") {
      nuevo.vis = { leidas: [0, 1] };
      mensaje = tr(`datos[1] = datos[0] = ${d[0]}: hayRepetidos lo encuentra en la primera comparación. Es el mejor caso.`,
        `data[1] = data[0] = ${d[0]}: hasDuplicates finds it on the first comparison. It is the best case.`);
    } else if (caso === "final") {
      nuevo.vis = { leidas: [n - 2, n - 1] };
      mensaje = tr(`datos[${n - 1}] = datos[${n - 2}] = ${d[n - 1]}: es el último par que se compara, así que recorre toda la tabla de pares antes de encontrarlo.`,
        `data[${n - 1}] = data[${n - 2}] = ${d[n - 1]}: it is the last pair compared, so it goes through the whole table of pairs before finding it.`);
    } else {
      mensaje = tr(`Sin repetidos: el peor caso. hayRepetidos compara los ${(n * (n - 1)) / 2} pares antes de responder false.`,
        `No duplicates: the worst case. hasDuplicates compares all ${(n * (n - 1)) / 2} pairs before answering false.`);
    }
    return { estado: nuevo, mensaje, codigo: "hayRepetidos" };
  }

  function preparar(s, op, n, caso) {
    s.op = op;
    s.n = n;
    s.corrida = s.sigCorrida++;
    s.pasos = 0;
    s.puntos = {};
    s.pares = null;
    s.consultas = null;
    s.enCurso = true;
    if (op === "busquedaBinaria") {
      s.datos = impares(n);
    } else if (op === "contarPresentes") {
      s.datos = impares(n);
      // Las pares nunca están; las otras sí.
      s.consultas = hasta(n).map((k) => (k % 2 === 0 ? s.datos[(k * 7 + 3) % n] : 2 * ((k * 5) % n)));
    } else {
      s.datos = BASE.slice(0, n);
      if (op === "hayRepetidos" && n >= 2 && caso === "inicio") s.datos[1] = s.datos[0];
      if (op === "hayRepetidos" && n >= 2 && caso === "final") s.datos[n - 1] = s.datos[n - 2];
    }
    // Pares comparados: todos los que van hasta (i, j) en el orden de los dos for.
    if (op === "hayRepetidos") s.pares = { i: -1, j: -1, actual: false, igual: false };
  }

  // Cada pasos++ deja caer un punto bajo la casilla que se tocó.
  function contar(s, fila, j) {
    s.pasos++;
    const clave = `${fila}-${j}`;
    s.puntos[clave] = (s.puntos[clave] || 0) + 1;
  }

  // La ejecución termina: su punto queda fijo en la gráfica.
  function terminar(s, paso, clave, linea, texto, tipo) {
    s.enCurso = false;
    s.historial.push({ id: s.corrida, op: s.op, n: s.n, pasos: s.pasos });
    if (s.historial.length > 40) s.historial.shift();
    const distintos = new Set(s.historial.filter((h) => h.op === s.op).map((h) => h.n));
    let extra = "";
    if (!s.sinPista && distintos.size >= 2 && !(s.formaVista || {})[s.op]) {
      s.formaVista = Object.assign({}, s.formaVista, { [s.op]: true });
      extra = tr(` Ya hay puntos con dos n distintos: la línea punteada muestra el peor caso, ${CLASES[s.op].forma}`,
        ` There are now points with two different n: the dotted line shows the worst case, ${CLASES[s.op].forma}`);
    }
    paso(clave, linea, texto + extra, tipo);
  }

  // ------------------------------------------------------------------
  // Animaciones de cada función
  // ------------------------------------------------------------------

  const OPS = {
    obtener: {
      etiqueta: tr("obtener(datos, i)", "get(data, i)"),
      usa: ["n", "i"],
      fragmentos: ["obtener"],
      ejecutar(s, { n, i }, paso) {
        preparar(s, "obtener", n);
        s.vis = { vars: { n, i }, marcas: [["i", "d", i]] };
        paso("obtener", 1, tr(`obtener(datos, ${i}) en un arreglo de ${n} elemento(s). Fíjate: la función ni siquiera recibe n.`,
          `get(data, ${i}) on an array of ${n} element(s). Notice: the function doesn't even receive n.`));
        if (i < 0 || i >= n) {
          s.enCurso = false;
          s.vis = { vars: { n, i }, marcas: [["i", "d", i]], error: true, fantasma: i };
          paso("obtener", 3, tr(`datos[${i}] no existe: las posiciones van de 0 a ${n - 1}. C++ no lo revisa (sería comportamiento indefinido), así que aquí no lo ejecutamos.`,
            `data[${i}] doesn't exist: the positions go from 0 to ${n - 1}. C++ doesn't check it (it would be undefined behavior), so we don't run it here.`), "error");
          return;
        }
        contar(s, "d", i);
        s.vis = { vars: { n, i }, marcas: [["i", "d", i]], leidas: [i] };
        paso("obtener", 2, tr("pasos++ → 1. Es el único paso: la dirección de datos[i] sale de una cuenta (inicio + i × 4 bytes), sin recorrer nada.",
          "steps++ → 1. It is the only step: the address of data[i] comes from a calculation (start + i × 4 bytes), without walking through anything."));
        s.vis = { vars: { n, i }, marcas: [["i", "d", i]], encontrada: [i], salida: s.datos[i] };
        terminar(s, paso, "obtener", 3, tr(`return datos[${i}] = ${s.datos[i]}. Con n = ${n} fue 1 paso; con un millón de elementos también sería 1. Eso es O(1): tiempo constante.`,
          `return data[${i}] = ${s.datos[i]}. With n = ${n} it was 1 step; with a million elements it would also be 1. That is O(1): constant time.`), "exito");
      },
    },
    sumar: {
      etiqueta: tr("sumar(datos, n)", "sum(data, n)"),
      usa: ["n"],
      fragmentos: ["sumar"],
      ejecutar(s, { n }, paso) {
        preparar(s, "sumar", n);
        let suma = 0;
        s.vis = { vars: { n, suma } };
        paso("sumar", 2, tr("int suma = 0. Preparar la suma se hace una vez, no por cada elemento: no es lo que crece.",
          "int total = 0. Setting up the total happens once, not once per element: it is not what grows."));
        const grupo = n > 16 ? Math.ceil(n / 16) : 1;
        for (let i = 0; i < n; i++) {
          contar(s, "d", i);
          suma += s.datos[i];
          if ((i + 1) % grupo && i < n - 1) continue;
          const desde = i + 1 - ((i % grupo) + 1);
          s.vis = { vars: { n, i, suma }, cambio: ["suma"], marcas: [["i", "d", i]], leidas: hasta(i + 1).slice(desde), revisadas: hasta(desde) };
          paso("sumar", 5, grupo === 1
            ? tr(`i = ${i}: pasos++ → ${s.pasos}, y suma += ${s.datos[i]} → ${suma}.` + (i === 0 ? " Cada vuelta del for es un paso." : ""),
              `i = ${i}: steps++ → ${s.pasos}, and total += ${s.datos[i]} → ${suma}.` + (i === 0 ? " Each iteration of the for loop is one step." : ""))
            : tr(`i = ${desde}…${i}: ${i - desde + 1} vueltas más (las mostramos juntas), una por elemento. pasos = ${s.pasos}, suma = ${suma}.`,
              `i = ${desde}…${i}: ${i - desde + 1} more iterations (shown together), one per element. steps = ${s.pasos}, total = ${suma}.`));
        }
        s.vis = { vars: { n, suma }, revisadas: hasta(n), salida: suma };
        terminar(s, paso, "sumar", 7, tr(`return ${suma}. Una vuelta por elemento: ${n} pasos para n = ${n}. Con el doble de datos, el doble de pasos: O(n), tiempo lineal.`,
          `return ${suma}. One iteration per element: ${n} steps for n = ${n}. With twice the data, twice the steps: O(n), linear time.`), "exito");
      },
    },
    hayRepetidos: {
      etiqueta: tr("hayRepetidos(datos, n)", "hasDuplicates(data, n)"),
      usa: ["n", "caso"],
      fragmentos: ["hayRepetidos"],
      ejecutar(s, { n, caso }, paso) {
        preparar(s, "hayRepetidos", n, caso);
        const d = s.datos;
        const total = (n * (n - 1)) / 2;
        s.vis = { vars: { n } };
        paso("hayRepetidos", 2, tr(`Hay que comparar cada elemento con todos los que están a su derecha. La tabla de pares tiene ${total} casillas: una por comparación posible.`,
          `Each element must be compared with all the ones to its right. The table of pairs has ${total} cells: one per possible comparison.`));
        // Con n grande, un paso de la animación muestra varias filas de pares.
        const detallado = n <= MAX_DETALLE;
        const filasPorPaso = Math.ceil((n - 1) / 24);
        for (let i = 0; i < n; i++) {
          for (let j = i + 1; j < n; j++) {
            contar(s, "d", j);
            Object.assign(s.pares, { i, j, actual: true });
            const igual = d[i] === d[j];
            if (detallado || igual) {
              // Los pasos solo muestran la línea 5: las vueltas de los dos for van explícitas.
              s.vis = { vars: { n, i, j }, marcas: [["i", "d", i], ["j", "d", j]], leidas: [i, j], vueltas: { 2: i + 1, 3: j - i } };
              paso("hayRepetidos", 5, tr(`${j === i + 1 ? `i = ${i}: ahora datos[${i}] se compara con todos los de su derecha. ` : ""}`
                + `¿datos[${i}] (${d[i]}) == datos[${j}] (${d[j]})? ${igual ? "¡Sí!" : "No."} pasos = ${s.pasos}.`,
              `${j === i + 1 ? `i = ${i}: now data[${i}] is compared with all the ones to its right. ` : ""}`
                + `data[${i}] (${d[i]}) == data[${j}] (${d[j]})? ${igual ? "Yes!" : "No."} steps = ${s.pasos}.`));
            } else if (j === n - 1 && ((i + 1) % filasPorPaso === 0 || i === n - 2)) {
              const desde = i - (i % filasPorPaso);
              s.vis = { vars: { n, i, j }, marcas: [["i", "d", i]], leidas: [i], vueltas: { 2: i + 1, 3: j - i } };
              paso("hayRepetidos", 5, `${desde < i ? `i = ${desde}…${i}` : `i = ${i}`}: ` + tr(`cada uno se comparó con todos los de su derecha (los mostramos juntos). `
                + `Ninguno es igual. pasos = ${s.pasos} de ${total}.`,
              `each one was compared with all the ones to its right (shown together). None is equal. steps = ${s.pasos} of ${total}.`));
            }
            if (igual) {
              s.pares.igual = true;
              s.vis = { vars: { n, i, j }, marcas: [["i", "d", i], ["j", "d", j]], encontrada: [i, j], salida: "true" };
              terminar(s, paso, "hayRepetidos", 6, tr(`return true en ${s.pasos} paso(s) de ${total} posibles. `
                + (s.pasos <= 2 ? "Es el mejor caso: el repetido estaba al principio. Pero Big-O suele hablar del peor caso, cuando no hay ninguno."
                  : "Encontrarlo tarde es casi tan caro como no encontrarlo."),
              `return true in ${s.pasos} step(s) out of ${total} possible. `
                + (s.pasos <= 2 ? "It is the best case: the duplicate was at the start. But Big-O usually talks about the worst case, when there is none."
                  : "Finding it late is almost as expensive as not finding it.")), "exito");
              return;
            }
          }
        }
        s.pares.actual = false;
        s.vis = { vars: { n }, revisadas: hasta(n), salida: "false" };
        terminar(s, paso, "hayRepetidos", 10, tr(`return false. Comparamos todos los pares: n·(n − 1)/2 = ${n}·${Math.max(0, n - 1)}/2 = ${total}. Con el doble de datos, unas 4 veces más: O(n²), tiempo cuadrático.`,
          `return false. We compared every pair: n·(n − 1)/2 = ${n}·${Math.max(0, n - 1)}/2 = ${total}. With twice the data, about 4 times more: O(n²), quadratic time.`), "exito");
      },
    },
    busquedaBinaria: {
      etiqueta: tr("busquedaBinaria(datos, n, objetivo)", "binarySearch(data, n, target)"),
      usa: ["n", "objetivo"],
      fragmentos: ["busquedaBinaria"],
      ejecutar(s, { n, objetivo }, paso) {
        preparar(s, "busquedaBinaria", n);
        const r = binaria(s, n, objetivo, paso, { fila: "d", detallado: true });
        s.vis = Object.assign({}, r.vis, { salida: r.resultado });
        const texto = r.resultado >= 0
          ? tr(`return ${r.resultado}: está en la posición ${r.resultado}. `, `return ${r.resultado}: it is at position ${r.resultado}. `)
          : tr(`izq (${r.izq}) > der (${r.der}): no queda rango. return -1. `, `left (${r.izq}) > right (${r.der}): no range left. return -1. `);
        terminar(s, paso, "busquedaBinaria", r.resultado >= 0 ? 8 : 16, texto
          + tr(`${s.pasos} paso(s) para ${n} elemento(s): cada vuelta parte el rango a la mitad; con el doble de datos, una vuelta más. O(log n).`,
            `${s.pasos} step(s) for ${n} element(s): each iteration cuts the range in half; with twice the data, one more iteration. O(log n).`), "exito");
      },
    },
    contarPresentes: {
      etiqueta: tr("contarPresentes(consultas, datos, n)", "countPresent(queries, data, n)"),
      usa: ["n"],
      fragmentos: ["contarPresentes", "busquedaBinaria"],
      ejecutar(s, { n }, paso) {
        preparar(s, "contarPresentes", n);
        let encontrados = 0;
        s.vis = { vars: { n, encontrados } };
        paso("contarPresentes", 2, tr(`Por cada una de las ${n} consultas haremos una búsqueda binaria en datos (los impares, ordenados). Mira cómo cada consulta junta su columna de pasos.`,
          `For each of the ${n} queries we will do a binary search in data (the odd numbers, sorted). Watch how each query piles up its column of steps.`));
        if (n > MAX_DETALLE) {
          // Con n grande mostramos varias búsquedas por paso; cada una deja igual su columna.
          const grupo = Math.ceil(n / 16);
          for (let i = 0; i < n; i++) {
            if (binaria(s, n, s.consultas[i], null, { consulta: i }).resultado !== -1) encontrados++;
            if ((i + 1) % grupo && i < n - 1) continue;
            const desde = i + 1 - ((i % grupo) + 1);
            s.vis = { vars: { n, i, encontrados }, marcas: [["i", "c", i]], leidasC: hasta(i + 1).slice(desde), revisadasC: hasta(desde) };
            paso("contarPresentes", 4, tr(`${desde < i ? `i = ${desde}…${i}: ${i - desde + 1} búsquedas binarias` : `i = ${i}: una búsqueda binaria`} (las mostramos juntas). `
              + `Cada columna junta unos log₂ ${n} ≈ ${formato(log2(n))} pasos. pasos = ${s.pasos}, encontrados = ${encontrados}.`,
            `${desde < i ? `i = ${desde}…${i}: ${i - desde + 1} binary searches` : `i = ${i}: one binary search`} (shown together). `
              + `Each column piles up about log₂ ${n} ≈ ${formato(log2(n))} steps. steps = ${s.pasos}, found = ${encontrados}.`));
          }
          s.vis = { vars: { n, encontrados }, revisadasC: hasta(n), salida: encontrados };
          terminar(s, paso, "contarPresentes", 8, finContar(encontrados, n, s.pasos), "exito");
          return;
        }
        for (let i = 0; i < n; i++) {
          const q = s.consultas[i];
          s.vis = { vars: { n, i, encontrados }, marcas: [["i", "c", i]], leidasC: [i], revisadasC: hasta(i) };
          paso("contarPresentes", 4, tr(`i = ${i}: ¿${q} está en datos? Llamamos a busquedaBinaria.`, `i = ${i}: is ${q} in data? We call binarySearch.`));
          const r = binaria(s, n, q, paso, { fila: "d", extra: { i }, consulta: i, pila: true });
          if (r.resultado !== -1) encontrados++;
          s.vis = { vars: { n, i, encontrados }, cambio: r.resultado !== -1 ? ["encontrados"] : [], marcas: [["i", "c", i]], revisadasC: hasta(i + 1), encontradaC: r.resultado !== -1 ? [i] : [], encontrada: r.resultado !== -1 ? [r.resultado] : [] };
          const costo = s.puntos[`c-${i}`] || 0;
          paso("contarPresentes", r.resultado !== -1 ? 5 : 4, r.resultado !== -1
            ? tr(`Sí está: encontrados++ → ${encontrados}. Esa búsqueda costó ${costo} paso(s).`, `It is there: found++ → ${encontrados}. That search cost ${costo} step(s).`)
            : tr(`No está (devolvió -1). Esa búsqueda costó ${costo} paso(s).`, `It is not there (it returned -1). That search cost ${costo} step(s).`));
        }
        s.vis = { vars: { n, encontrados }, revisadasC: hasta(n), salida: encontrados };
        terminar(s, paso, "contarPresentes", 8, finContar(encontrados, n, s.pasos), "exito");
      },
    },
  };

  function finContar(encontrados, n, pasos) {
    return tr(`return ${encontrados}. ${n} búsquedas de a lo sumo ${pisoLog(n)} pasos: ${pasos} en total. Un ciclo de n vueltas con O(log n) adentro: se multiplican, O(n log n).`,
      `return ${encontrados}. ${n} searches of at most ${pisoLog(n)} steps: ${pasos} in total. A loop of n iterations with O(log n) inside: they multiply, O(n log n).`);
  }

  // Búsqueda binaria animada. La usan busquedaBinaria y contarPresentes
  // (ahí sus pasos se apilan bajo la consulta).
  function binaria(s, n, objetivo, paso, o) {
    const base = Object.assign({ n, objetivo }, o.extra);
    const pila = o.pila ? ["contarPresentes", "busquedaBinaria"] : null;
    const extraVis = o.consulta != null ? { leidasC: [o.consulta], revisadasC: hasta(o.consulta) } : {};
    const fuera = (izq, der) => hasta(n).filter((k) => k < izq || k > der);
    let izq = 0;
    let der = n - 1;
    const vis = (extra) => Object.assign({ pila }, extraVis, extra);
    const marcasConsulta = o.consulta != null ? [["i", "c", o.consulta]] : [];
    if (o.detallado) {
      s.vis = vis({ vars: Object.assign({}, base, { izq, der }), marcas: [["izq", "d", izq], ["der", "d", der]] });
      paso("busquedaBinaria", 3, tr(`Los datos están ordenados. El objetivo (${objetivo}) solo puede estar entre izq = 0 y der = ${der}: ${n} candidato(s).`,
        `The data is sorted. The target (${objetivo}) can only be between left = 0 and right = ${der}: ${n} candidate(s).`));
    }
    while (izq <= der) {
      const medio = izq + Math.floor((der - izq) / 2);
      if (o.consulta != null) contar(s, "c", o.consulta);
      else contar(s, "d", medio);
      const v = s.datos[medio];
      if (!paso) {
        // Sin animación: solo cuenta los pasos.
        if (v === objetivo) return { resultado: medio };
        if (v < objetivo) izq = medio + 1; else der = medio - 1;
        continue;
      }
      const quedan = der - izq + 1;
      const marcas = marcasConsulta.concat([["izq", "d", izq], ["medio", "d", medio], ["der", "d", der]]);
      s.vis = vis({ vars: Object.assign({}, base, { izq, der, medio }), marcas, leidas: [medio], descartadas: fuera(izq, der) });
      if (v === objetivo) {
        paso("busquedaBinaria", 6, tr(`pasos++ → ${s.pasos}. Quedan ${quedan} candidato(s); miramos el del medio: datos[${medio}] = ${v}. ¡Es el objetivo!`,
          `steps++ → ${s.pasos}. ${quedan} candidate(s) left; we look at the middle one: data[${medio}] = ${v}. It is the target!`));
        s.vis = vis({ vars: Object.assign({}, base, { izq, der, medio }), marcas, encontrada: [medio], descartadas: fuera(izq, der) });
        return { resultado: medio, vis: s.vis, izq, der };
      }
      const derecha = v < objetivo;
      if (!o.detallado) {
        const descartados = derecha ? medio - izq + 1 : der - medio + 1;
        if (derecha) izq = medio + 1; else der = medio - 1;
        s.vis = vis({ vars: Object.assign({}, base, { izq, der, medio }), marcas: marcasConsulta.concat(marcasLimites(izq, der, n)), leidas: [medio], descartadas: fuera(izq, der) });
        paso("busquedaBinaria", derecha ? 11 : 13, tr(`pasos++ → ${s.pasos}. datos[${medio}] = ${v} ${derecha ? "<" : ">"} ${objetivo}: descartamos ${descartados} de golpe.`,
          `steps++ → ${s.pasos}. data[${medio}] = ${v} ${derecha ? "<" : ">"} ${objetivo}: we discard ${descartados} at once.`));
        continue;
      }
      paso("busquedaBinaria", 6, tr(`pasos++ → ${s.pasos}. Quedan ${quedan} candidato(s); miramos el del medio: datos[${medio}] = ${v}.`,
        `steps++ → ${s.pasos}. ${quedan} candidate(s) left; we look at the middle one: data[${medio}] = ${v}.`));
      const descartados = derecha ? medio - izq + 1 : der - medio + 1;
      if (derecha) izq = medio + 1; else der = medio - 1;
      s.vis = vis({
        vars: Object.assign({}, base, { izq, der, medio }), cambio: [derecha ? "izq" : "der"],
        marcas: marcasLimites(izq, der, n), descartadas: fuera(izq, der),
      });
      paso("busquedaBinaria", derecha ? 11 : 13, tr(`${v} ${derecha ? "<" : ">"} ${objetivo}: el objetivo solo puede estar a la ${derecha ? "derecha" : "izquierda"}. `
        + `${derecha ? `izq = ${izq}` : `der = ${der}`}: descartamos ${descartados} de golpe` + (der >= izq ? `; quedan ${der - izq + 1}.` : "."),
      `${v} ${derecha ? "<" : ">"} ${objetivo}: the target can only be to the ${derecha ? "right" : "left"}. `
        + `${derecha ? `left = ${izq}` : `right = ${der}`}: we discard ${descartados} at once` + (der >= izq ? `; ${der - izq + 1} left.` : ".")));
    }
    if (!paso) return { resultado: -1 };
    s.vis = vis({ vars: Object.assign({}, base, { izq, der }), descartadas: hasta(n), marcas: marcasConsulta });
    return { resultado: -1, vis: s.vis, izq, der };
  }

  // ------------------------------------------------------------------
  // Dibujo: el arreglo (y las consultas), los puntos que deja cada paso,
  // la tabla de pares y la gráfica de pasos según n.
  // ------------------------------------------------------------------

  // Los nodos se reutilizan por clave para que las marcas se deslicen y
  // lo nuevo aparezca con una animación una sola vez.
  function piezas(capa) {
    const vivas = new Set();
    return {
      pieza(clave, crear) {
        let nodo = capa.querySelector(`:scope > [data-k="${clave}"]`);
        if (!nodo) {
          nodo = crear();
          nodo.dataset.k = clave;
          capa.append(nodo);
        }
        vivas.add(clave);
        return nodo;
      },
      fin() {
        for (const nodo of capa.querySelectorAll(":scope > [data-k]")) if (!vivas.has(nodo.dataset.k)) retirar(nodo);
      },
    };
  }

  function retirar(nodo) {
    nodo.removeAttribute("data-k");
    nodo.classList.add("saliendo");
    setTimeout(() => nodo.remove(), 400);
  }

  function svg(etiqueta, atributos) {
    const nodo = document.createElementNS(SVG, etiqueta);
    for (const [k, v] of Object.entries(atributos || {})) nodo.setAttribute(k, v);
    return nodo;
  }

  const ORDEN_MARCAS = ["i", "j", "izq", "medio", "der"];

  // izq y der sobre su casilla. Cuando se cruzan y uno sale del arreglo
  // (izq = n o der = -1), la marca queda en el borde pero dice su valor.
  function marcasLimites(izq, der, n) {
    const marca = (id, j) => (j >= 0 && j < n ? [id, "d", j] : [id, "d", Math.min(Math.max(j, 0), n - 1), `${nombre(id)} = ${j}`]);
    return [marca("izq", izq), marca("der", der)];
  }

  // Hasta 12 casillas van en una fila grande (que se reduce en pantallas
  // angostas). Con más, las casillas se acomodan en varias filas para que los
  // valores se sigan leyendo.
  function medidas(n, escenario) {
    if (n <= 8) return { paso: 40, celda: 34, columnas: n };
    if (n <= 12) return { paso: 34, celda: 30, columnas: n };
    const disponible = Math.max(260, anchoArreglo(escenario) || 568);
    // Con n grande, casillas chicas; con más de 32, sin número (lo que importa es cuántos pasos se dan).
    if (n > 32) {
      // Entre 10 y 14 px por casilla: en una sola fila si el ancho alcanza.
      const paso = Math.max(10, Math.min(14, Math.floor((disponible - 16) / n)));
      return { paso, celda: paso - 2, columnas: Math.max(16, Math.min(n, Math.floor((disponible - 16) / paso))), sinNumeros: true };
    }
    if (n > MAX_CON_PUNTOS) return { paso: 20, celda: 18, columnas: Math.max(12, Math.min(32, Math.floor((disponible - 16) / 20))) };
    return { paso: 34, celda: 30, columnas: Math.max(8, Math.min(16, Math.floor((disponible - 16) / 34))) };
  }

  // Ancho para el arreglo: todo el escenario, o la columna izquierda cuando la
  // gráfica va al lado (escenarios anchos, ver .cuerpo-na en estilos.css).
  function anchoArreglo(escenario) {
    if (!escenario || !escenario.clientWidth) return 0;
    const cuerpo = escenario.querySelector(".cuerpo-na");
    if (!cuerpo || !cuerpo.clientWidth) return escenario.clientWidth - 32;
    if (getComputedStyle(cuerpo).display !== "grid") return cuerpo.clientWidth;
    return cuerpo.clientWidth - cuerpo.querySelector(".grafica-na").offsetWidth - parseFloat(getComputedStyle(cuerpo).columnGap || 0);
  }

  if (typeof window !== "undefined") {
    window.addEventListener("resize", () => {
      for (const lienzo of document.querySelectorAll(".lienzo-na")) escalar(lienzo.closest(".escenario"), lienzo);
    });
  }

  function escalar(escenario, lienzo) {
    if (!escenario || !escenario.clientWidth) return;
    const ancho = Number(lienzo.dataset.ancho);
    const alto = Number(lienzo.dataset.alto);
    const k = Math.max(0.55, Math.min(1, anchoArreglo(escenario) / ancho));
    lienzo.style.transform = k < 1 ? `scale(${k})` : "";
    lienzo.parentElement.style.width = `${ancho * k}px`;
    lienzo.parentElement.style.height = `${alto * k}px`;
  }

  function crearEscenario(escenario, cfg) {
    const lienzo = el("div", { class: "lienzo-na" });
    const abajo = el("div", { class: "abajo-na" });
    escenario.classList.add("escenario-na");
    escenario.append(el("div", { class: "cuerpo-na" },
      el("div", { class: "info-na" }),
      el("div", { class: "marco-na" }, lienzo),
      el("p", { class: "leyenda-na" }, el("i", { class: "na-punto muestra-punto" }), tr(" = 1 paso (cada pasos++ deja caer un punto)", " = 1 step (each steps++ drops a dot)")),
      abajo));
    abajo.append(el("div", { class: "pares-na" }), crearGrafica(cfg));
    return lienzo;
  }

  function dibujarCon(cfg) {
    return function dibujar(escenario, s) {
      const lienzo = escenario.querySelector(".lienzo-na") || crearEscenario(escenario, cfg);
      const vis = s.vis || {};
      dibujarInfo(escenario.querySelector(".info-na"), s, vis);
      dibujarArreglo(escenario, lienzo, s, vis);
      dibujarPares(escenario.querySelector(".pares-na"), s);
      dibujarGrafica(escenario.querySelector(".grafica-na"), s, cfg);
    };
  }

  function dibujarInfo(info, s, vis) {
    let contador = info.querySelector(".contador-na");
    if (!contador) {
      contador = el("div", { class: "contador-na" }, el("span", { text: tr("pasos", "steps") }), el("b"));
      info.append(el("div", { class: "info-na-datos" }), contador);
    }
    const numero = contador.querySelector("b");
    if (numero.textContent !== String(s.pasos)) {
      numero.textContent = s.pasos;
      contador.classList.remove("sube");
      if (s.pasos > 0) {
        void contador.offsetWidth; // reinicia la animación
        contador.classList.add("sube");
      }
    }
    contador.className = `contador-na serie-${CLASES[s.op].serie}${contador.classList.contains("sube") ? " sube" : ""}`;
    info.querySelector(".info-na-datos").replaceChildren(
      vis.pila ? el("div", { class: "pila-llamadas" }, vis.pila.map((f) => el("span", { class: "llamada", text: `${nombre(f)}()` }))) : "",
      DS.variables(renombrar(vis.vars || { n: s.n }), (vis.cambio || []).map(nombre)),
      vis.salida != null ? el("div", { class: "salida-valor" }, tr("devuelve", "returns"), el("div", { class: "celda encontrada", text: vis.salida })) : "");
  }

  function dibujarArreglo(escenario, lienzo, s, vis) {
    const n = s.n;
    // La gráfica va al lado del arreglo, salvo con la tabla de pares de
    // hayRepetidos y n grande: ahí arreglo y tabla necesitan todo el ancho.
    const cuerpo = escenario.querySelector(".cuerpo-na");
    const alLado = !(s.op === "hayRepetidos" && n > 12);
    // Al cambiar de diseño, el marco toma su alto sin transición: si se achicara
    // de a poco, por un momento no cabría en la pantalla.
    if (cuerpo.classList.contains("al-lado") !== alLado) {
      const marco = escenario.querySelector(".marco-na");
      marco.style.transition = "none";
      requestAnimationFrame(() => { marco.style.transition = ""; });
    }
    cuerpo.classList.toggle("al-lado", alLado);
    const { paso, celda, columnas, sinNumeros } = medidas(n, escenario);
    // Alto de las columnas de puntos: cuántos pasos puede tocar una misma casilla.
    // En hayRepetidos con n grande serían demasiados: ahí los cuenta la tabla de pares.
    // Con n más grande que MAX_CON_PUNTOS tampoco: los cuentan el contador de pasos y la gráfica.
    const conPuntos = (s.op !== "hayRepetidos" || n <= 6) && n <= MAX_CON_PUNTOS;
    const columna = s.op === "hayRepetidos" ? n - 1 : s.op === "contarPresentes" ? pisoLog(n) : 1;
    const separacion = n > 12 ? 6 : 7;
    const altoPuntos = (fila) => (!conPuntos || (s.consultas && fila === "d") ? 0 : columna * separacion + 6);
    const filas = [];
    let y = 0;
    const agregarFila = (id, titulo, valores, sufijo, altoMarcas) => {
      const banda = altoMarcas + celda + 16 + altoPuntos(id);
      filas.push({ id, titulo, valores, sufijo, y, banda, yCeldas: y + 14 + altoMarcas });
      y += 14 + Math.ceil(Math.max(valores.length, 1) / columnas) * banda + 8;
    };
    // contarPresentes con n grande no anima cada búsqueda: basta con las consultas.
    const soloConsultas = s.consultas && n > MAX_DETALLE;
    if (s.consultas) agregarFila("c", soloConsultas ? tr("consultas (se buscan en datos)", "queries (searched in data)") : tr("consultas", "queries"), s.consultas, "C", 18);
    const ordenados = s.op === "busquedaBinaria" || s.op === "contarPresentes";
    if (!soloConsultas) agregarFila("d", ordenados ? tr("datos (ordenados)", "data (sorted)") : tr("datos", "data"), s.datos, "", ordenados ? 40 : 18);
    const extra = vis.fantasma != null && vis.fantasma >= n && n <= 12 ? Math.min(vis.fantasma, n + 3) - n + 1 : 0;
    const ancho = Math.max(280, (Math.min(n, columnas) + extra) * paso + 16);
    lienzo.style.width = `${ancho}px`;
    lienzo.style.height = `${y}px`;
    lienzo.dataset.ancho = ancho;
    lienzo.dataset.alto = y;
    escalar(escenario, lienzo);
    lienzo.classList.toggle("varias-filas", n > 12);
    lienzo.classList.toggle("muy-chicas", n > MAX_CON_PUNTOS);
    lienzo.classList.remove("sacudir");
    if (vis.error) {
      void lienzo.offsetWidth;
      lienzo.classList.add("sacudir");
    }

    const p = piezas(lienzo);
    // Si las casillas cambian de tamaño o de lugar (otro n), las nuevas
    // aparecen cuando las que se quedan ya se deslizaron: no se enciman.
    const medida = n <= 12 ? `${paso}-${celda}` : `${paso}-${celda}-${columnas}`;
    const seMueven = !!lienzo.dataset.medida && lienzo.dataset.medida !== medida;
    lienzo.dataset.medida = medida;
    const x = (j) => 8 + (n <= 12 ? j : j % columnas) * paso;
    const yCelda = (f, j) => f.yCeldas + (n <= 12 ? 0 : Math.floor(j / columnas)) * f.banda;
    for (const f of filas) {
      const titulo = p.pieza(`t-${f.id}`, () => el("span", { class: "fila-titulo" }));
      titulo.textContent = f.titulo;
      titulo.style.cssText = `left:0;top:${f.y}px`;
      f.valores.forEach((v, j) => {
        // Las casillas se conservan entre ejecuciones y al cambiar n: solo
        // aparecen las nuevas y se van las que sobran (si el valor cambia, late).
        const nodo = p.pieza(`c-${f.id}-${j}`, () => el("div", { class: seMueven ? "na-celda tarde" : "na-celda" }));
        const texto = sinNumeros ? "" : String(v);
        if (nodo.textContent !== "" && nodo.textContent !== texto) {
          nodo.classList.remove("renovada");
          void nodo.offsetWidth;
          nodo.classList.add("renovada");
        }
        nodo.textContent = texto;
        nodo.title = sinNumeros ? `[${j}] = ${v}` : "";
        nodo.style.cssText = `left:${x(j)}px;top:${yCelda(f, j)}px;width:${celda}px;height:${celda}px`;
        let clase = "na-celda";
        for (const extra of ["renovada", "tarde"]) if (nodo.classList.contains(extra)) clase += ` ${extra}`;
        if ((vis[`revisadas${f.sufijo}`] || []).includes(j)) clase += " revisada";
        if (!f.sufijo && (vis.descartadas || []).includes(j)) clase += " descartada";
        if ((vis[`leidas${f.sufijo}`] || []).includes(j)) clase += " leida";
        if ((vis[`encontrada${f.sufijo}`] || []).includes(j)) clase += " encontrada";
        nodo.className = clase;
        const indice = p.pieza(`i-${f.id}-${j}`, () => el("span", { class: seMueven ? "indice tarde" : "indice" }));
        indice.textContent = sinNumeros && j % 8 ? "" : j;
        indice.style.cssText = `left:${x(j)}px;top:${yCelda(f, j) + celda + 2}px;width:${celda}px;text-align:center`;
        // Puntos de paso: uno por cada pasos++ que tocó esta casilla.
        const puntos = conPuntos ? s.puntos[`${f.id}-${j}`] || 0 : 0;
        for (let k = 0; k < puntos; k++) {
          const punto = p.pieza(`p-${s.corrida}-${f.id}-${j}-${k}`, () => el("i", { class: `na-punto serie-${CLASES[s.op].serie}` }));
          punto.style.cssText = `left:${x(j) + celda / 2 - separacion / 2}px;top:${yCelda(f, j) + celda + 16 + k * separacion}px`;
        }
      });
    }
    if (vis.fantasma != null && vis.fantasma >= n && vis.fantasma <= n + 3 && n <= 12) {
      p.pieza(`f-${s.corrida}-${vis.fantasma}`, () => el("div", { class: "na-celda fantasma", text: "?" }))
        .style.cssText = `left:${x(vis.fantasma)}px;top:${filas[filas.length - 1].yCeldas}px;width:${celda}px;height:${celda}px`;
    }
    escenario.querySelector(".leyenda-na").hidden = !conPuntos;

    // Marcas (i, j, izq, medio, der) sobre su casilla; se apilan si coinciden.
    const grupos = {};
    for (const [id, fila, j, texto] of vis.marcas || []) {
      if (j < 0 || j > (n <= 12 ? n + 3 : n - 1)) continue;
      (grupos[`${fila}-${j}`] = grupos[`${fila}-${j}`] || []).push([id, texto || nombre(id)]);
    }
    for (const [clave, nombres] of Object.entries(grupos)) {
      const [fila, j] = clave.split("-");
      const f = filas.find((ff) => ff.id === fila);
      if (!f) continue;
      nombres.sort(([a], [b]) => ORDEN_MARCAS.indexOf(a) - ORDEN_MARCAS.indexOf(b));
      nombres.forEach(([id, texto], k) => {
        const marca = p.pieza(`m-${fila}-${id}`, () => el("span", { class: "marcador na-marca" }));
        marca.textContent = texto;
        const mala = !!vis.error && id === "i";
        marca.classList.toggle("mala", mala);
        marca.style.left = `${x(Number(j)) + celda / 2 - 30}px`;
        marca.style.top = `${yCelda(f, Number(j)) - 16 - (nombres.length - 1 - k) * 13}px`;
      });
    }
    p.fin();
  }

  // Tabla de pares de hayRepetidos: una casilla por cada comparación posible.
  // Se comparan en orden, así que están hechas todas las que van hasta (i, j).
  // Con n grande son miles de casillas: se pintan en un canvas.
  function dibujarPares(caja, s) {
    if (!s.pares) {
      caja.hidden = true;
      caja.replaceChildren();
      return;
    }
    caja.hidden = false;
    const n = s.n;
    const { i: pi, j: pj, actual, igual } = s.pares;
    const hecho = (a, b) => a < pi || (a === pi && b <= pj);
    const hechos = pi < 0 ? 0 : (pi * (2 * n - pi - 1)) / 2 + (pj - pi);
    if (n > 16) {
      dibujarParesCanvas(caja, s, hecho);
    } else {
      const lado = n <= 8 ? 12 : n <= 12 ? 8 : 7;
      let rejilla = caja.querySelector(".rejilla-pares");
      if (!rejilla || rejilla.dataset.corrida !== String(s.corrida)) {
        rejilla = el("div", { class: "rejilla-pares", "data-corrida": s.corrida, style: `grid-template-columns:max-content repeat(${n}, ${lado}px);grid-auto-rows:${lado}px` });
        rejilla.append(el("span", { class: "eje-pares", text: "i\\j" }));
        const eje = (k) => (lado >= 10 || k % 5 === 0 ? k : "");
        for (let j = 0; j < n; j++) rejilla.append(el("span", { class: "eje-pares", text: eje(j) }));
        for (let i = 0; i < n; i++) {
          rejilla.append(el("span", { class: "eje-pares", text: eje(i) }));
          for (let j = 0; j < n; j++) {
            rejilla.append(el("span", { class: j > i ? "par" : "par nulo", "data-i": i, "data-j": j, style: `height:${lado}px` }));
          }
        }
        caja.replaceChildren(el("p", { class: "fila-titulo" }), rejilla);
      }
      for (const celda of rejilla.querySelectorAll(".par:not(.nulo)")) {
        const a = Number(celda.dataset.i);
        const b = Number(celda.dataset.j);
        const esActual = actual && a === pi && b === pj;
        celda.classList.toggle("comparado", hecho(a, b));
        celda.classList.toggle("actual", esActual);
        celda.classList.toggle("igual", esActual && igual);
      }
    }
    caja.querySelector(".fila-titulo").textContent = tr(`pares comparados: ${hechos} de ${(n * (n - 1)) / 2}`, `pairs compared: ${hechos} of ${(n * (n - 1)) / 2}`);
  }

  function dibujarParesCanvas(caja, s, hecho) {
    const n = s.n;
    const lado = Math.max(2, Math.floor(180 / n) - 1);
    const tam = n * (lado + 1);
    let lienzo = caja.querySelector("canvas");
    if (!lienzo || lienzo.dataset.n !== String(n)) {
      lienzo = el("canvas", { class: "canvas-pares", role: "img" });
      lienzo.dataset.n = n;
      caja.replaceChildren(el("p", { class: "fila-titulo" }), lienzo);
    }
    const escala = window.devicePixelRatio || 1;
    lienzo.width = Math.round(tam * escala);
    lienzo.height = Math.round(tam * escala);
    lienzo.style.width = lienzo.style.height = `${tam}px`;
    const ctx = lienzo.getContext("2d");
    if (!ctx) return;
    const estilo = getComputedStyle(caja);
    const color = (nombre) => estilo.getPropertyValue(nombre).trim();
    const vacio = color("--superficie-2");
    const comparado = color("--serie-5");
    ctx.setTransform(escala, 0, 0, escala, 0, 0);
    ctx.clearRect(0, 0, tam, tam);
    for (let a = 0; a < n; a++) {
      for (let b = a + 1; b < n; b++) {
        ctx.fillStyle = hecho(a, b) ? comparado : vacio;
        ctx.fillRect(b * (lado + 1), a * (lado + 1), lado, lado);
      }
    }
    const { i: pi, j: pj, actual, igual } = s.pares;
    if (actual && pi >= 0) {
      ctx.fillStyle = color(igual ? "--exito" : "--activo");
      ctx.fillRect(pj * (lado + 1) - 1, pi * (lado + 1) - 1, lado + 2, lado + 2);
    }
    lienzo.setAttribute("aria-label", tr(`Tabla de ${n} por ${n} pares: la parte coloreada son los pares ya comparados`, `Table of ${n} by ${n} pairs: the colored part are the pairs already compared`));
  }

  // ---- Gráfica de pasos según n ----

  const G = { ancho: 320, alto: 200, izq: 38, der: 16, arr: 24, aba: 30 };

  function crearGrafica(cfg) {
    const id = `recorte-${cfg.contenedor}-${Math.random().toString(36).slice(2, 7)}`;
    const lienzo = svg("svg", { viewBox: `0 0 ${G.ancho} ${G.alto}`, class: "svg-na", role: "img" });
    const defs = svg("defs");
    const recorte = svg("clipPath", { id });
    recorte.append(svg("rect", { x: G.izq, y: G.arr - 6, width: G.ancho - G.izq - G.der + 6, height: G.alto - G.arr - G.aba + 6 }));
    defs.append(recorte);
    lienzo.append(defs, svg("g", { class: "ejes" }), svg("g", { class: "curvas", "clip-path": `url(#${id})` }), svg("g", { class: "puntos" }));
    return el("div", { class: "grafica-na" },
      el("p", { class: "fila-titulo", text: cfg.tituloGrafica }), lienzo, el("div", { class: "leyenda-grafica" }));
  }

  function techo(x) {
    const pasos = [1, 2, 2.5, 5, 10];
    const magnitud = Math.pow(10, Math.floor(Math.log10(x)));
    for (const k of pasos) if (k * magnitud >= x) return k * magnitud;
    return 10 * magnitud;
  }

  function dibujarGrafica(caja, s, cfg) {
    const lienzo = caja.querySelector("svg");
    const maxN = cfg.maxN;
    const visibles = s.historial.slice();
    if (s.enCurso) visibles.push({ id: s.corrida, op: s.op, n: s.n, pasos: s.pasos, actual: true });
    const maxY = cfg.maxPasos || techo(Math.max(10, ...visibles.map((h) => h.pasos)));
    const ancho = G.ancho - G.izq - G.der;
    const alto = G.alto - G.arr - G.aba;
    const px = (n) => G.izq + (n / maxN) * ancho;
    const py = (v) => G.alto - G.aba - (v / maxY) * alto;

    // Ejes y rejilla (se rehacen: no tienen animación).
    const ejes = lienzo.querySelector(".ejes");
    ejes.replaceChildren();
    for (const v of [0, maxY / 2, maxY]) {
      ejes.append(svg("line", { x1: G.izq, x2: G.ancho - G.der, y1: py(v), y2: py(v), class: v ? "rejilla" : "eje" }));
      const t = svg("text", { x: G.izq - 6, y: py(v) + 3.5, "text-anchor": "end" });
      t.textContent = formato(v);
      ejes.append(t);
    }
    const saltoX = maxN <= 12 ? 2 : maxN <= 16 ? 4 : maxN <= 32 ? 8 : 16;
    for (let n = 0; n <= maxN; n += saltoX) {
      const t = svg("text", { x: px(n), y: G.alto - G.aba + 14, "text-anchor": "middle" });
      t.textContent = n;
      ejes.append(t);
    }
    const tn = svg("text", { x: G.ancho - G.der, y: G.alto - 3, "text-anchor": "end", class: "titulo-eje" });
    tn.textContent = "n →";
    const tp = svg("text", { x: 2, y: 9, class: "titulo-eje" });
    tp.textContent = tr("pasos ↑", "steps ↑");
    ejes.append(tn, tp);

    // Curva del peor caso: aparece cuando ya hay puntos con dos n distintos.
    const curvas = piezasSvg(lienzo.querySelector(".curvas"));
    const ops = [...new Set(s.historial.map((h) => h.op))];
    const etiquetas = [];
    for (const op of ops) {
      const ns = new Set(s.historial.filter((h) => h.op === op).map((h) => h.n));
      if (ns.size < 2) continue;
      const c = CLASES[op];
      const puntos = [];
      for (let n = 1; n <= maxN; n++) puntos.push(`${px(n).toFixed(1)},${py(c.peor(n)).toFixed(1)}`);
      const curva = curvas.pieza(`curva-${op}`, () => svg("polyline", { class: `curva serie-${c.serie}` }));
      curva.setAttribute("points", puntos.join(" "));
      // Etiqueta en el último punto que queda dentro de la gráfica.
      let nEtiqueta = maxN;
      while (nEtiqueta > 1 && c.peor(nEtiqueta) > maxY) nEtiqueta--;
      const etiqueta = curvas.pieza(`etq-${op}`, () => svg("text", { class: "etiqueta-curva", "text-anchor": "end" }));
      etiqueta.textContent = c.o;
      etiqueta.setAttribute("x", Math.min(px(nEtiqueta), G.ancho - G.der) - 3);
      etiquetas.push({ etiqueta, x: px(nEtiqueta), y: Math.max(G.arr + 8, py(c.peor(nEtiqueta)) - 6) });
    }
    // Las etiquetas que terminan cerca se separan para no encimarse.
    etiquetas.sort((a, b) => b.y - a.y);
    etiquetas.forEach((e, k) => {
      const choca = etiquetas.slice(0, k).filter((o) => Math.abs(o.x - e.x) < 70);
      for (const o of choca) if (e.y > o.y - 11) e.y = o.y - 11;
      e.etiqueta.setAttribute("y", e.y);
    });
    curvas.fin();

    // Puntos: el de la ejecución en curso sube con cada paso y queda fijo al terminar.
    const puntos = piezasSvg(lienzo.querySelector(".puntos"));
    for (const h of visibles) {
      const c = CLASES[h.op];
      const g = puntos.pieza(`p-${h.id}`, () => {
        const nuevo = svg("g", { class: `punto serie-${c.serie}` });
        nuevo.append(svg("circle", { r: 4.5 }), svg("title"));
        return nuevo;
      });
      g.style.transform = `translate(${px(h.n)}px, ${py(Math.min(h.pasos, maxY * 1.04))}px)`;
      g.classList.toggle("actual", !!h.actual);
      g.querySelector("title").textContent = `${nombre(h.op)}, n = ${h.n}: ${h.pasos} ${tr("paso(s)", "step(s)")}`;
    }
    puntos.fin();

    const resumen = s.historial.length
      ? s.historial.map((h) => tr(`${h.op} con n = ${h.n}: ${h.pasos} pasos`, `${nombre(h.op)} with n = ${h.n}: ${h.pasos} steps`)).join("; ")
      : tr("todavía sin puntos", "no points yet");
    lienzo.setAttribute("aria-label", `${cfg.tituloGrafica}: ${resumen}`);

    // Leyenda solo si hay más de una función en la gráfica.
    const leyenda = caja.querySelector(".leyenda-grafica");
    const enGrafica = [...new Set(visibles.map((h) => h.op))];
    leyenda.replaceChildren(...(cfg.leyenda && enGrafica.length ? Object.keys(CLASES).filter((op) => enGrafica.includes(op)).map((op) =>
      el("span", { class: `serie-${CLASES[op].serie}` }, el("i", { class: "muestra-serie" }), `${nombre(op)} ${CLASES[op].o}`)) : []));
  }

  function piezasSvg(capa) {
    const vivas = new Set();
    return {
      pieza(clave, crear) {
        let nodo = capa.querySelector(`:scope > [data-k="${clave}"]`);
        if (!nodo) {
          nodo = crear();
          nodo.setAttribute("data-k", clave);
          capa.append(nodo);
        }
        vivas.add(clave);
        return nodo;
      },
      fin() {
        for (const nodo of capa.querySelectorAll(":scope > [data-k]")) {
          if (vivas.has(nodo.getAttribute("data-k"))) continue;
          nodo.removeAttribute("data-k");
          nodo.classList.add("saliendo");
          setTimeout(() => nodo.remove(), 400);
        }
      },
    };
  }

  // ------------------------------------------------------------------
  // Visualizadores de la lección
  // ------------------------------------------------------------------

  const fragmentos = (claves) => Object.fromEntries(claves.map((c) => [c, CODIGO[c]]));

  function visualizador(contenedor, opciones) {
    const claves = [...new Set(opciones.ops.flatMap((id) => OPS[id].fragmentos))];
    const cfg = { contenedor, maxN: opciones.maxN, maxPasos: opciones.maxPasos, leyenda: opciones.ops.length > 1, tituloGrafica: opciones.tituloGrafica };
    DS.tema({
      contenedor,
      incremental: true,
      dibujar: dibujarCon(cfg),
      codigo: fragmentos(claves),
      tituloCodigo: (clave) => `${nombre(clave)}()`,
      mensajeInicial: opciones.mensajeInicial,
      estadoInicial: (valores) => estadoDesde(opciones.ops[0], valores.n, opciones.sinPista),
      entradas: opciones.entradas,
      operaciones: opciones.ops.map((id) => Object.assign({ id }, OPS[id])),
    });
  }

  const entradaN = (valor, max) => ({
    id: "n", etiqueta: "n", min: 1, max, valor,
    // Con un repetido elegido, el nuevo n lo conserva y lo vuelve a marcar.
    alCambiar: (s, { n, caso }) => (s.op === "hayRepetidos" && caso && caso !== "sin" ? cambiarCaso(s, { n, caso }) : {
      estado: cambiarN(s, n),
      mensaje: tr(`n = ${n}: ahora el arreglo tiene ${n} elemento(s). Pulsa Ejecutar para contar sus pasos; los puntos de la gráfica se conservan.`,
        `n = ${n}: the array now has ${n} element(s). Press Run to count its steps; the points on the chart are kept.`),
    }),
  });
  const CASO = { id: "caso", etiqueta: "", alCambiar: cambiarCaso, opciones: [
    ["sin", tr("sin repetidos", "no duplicates")], ["inicio", tr("repetido al inicio", "duplicate at the start")], ["final", tr("repetido al final", "duplicate at the end")]] };
  const OBJETIVO = (max, valor) => ({ id: "objetivo", etiqueta: nombre("objetivo"), min: -99, max, valor });

  visualizador("vis-constante", {
    ops: ["obtener"],
    entradas: [entradaN(6, 16), { id: "i", etiqueta: "i", min: -5, max: 20, valor: 4 }],
    maxN: 16,
    maxPasos: 16,
    tituloGrafica: tr("pasos de obtener según n", "steps of get by n"),
    mensajeInicial: tr("Pulsa obtener(datos, i). Después cambia n (prueba 2, 10 y 16) y vuelve a pulsar: cada ejecución deja un punto en la gráfica.",
      "Press get(data, i). Then change n (try 2, 10 and 16) and press again: each run leaves a point on the chart."),
  });

  visualizador("vis-lineal", {
    ops: ["sumar"],
    entradas: [entradaN(4, 16)],
    maxN: 16,
    maxPasos: 16,
    tituloGrafica: tr("pasos de sumar según n", "steps of sum by n"),
    mensajeInicial: tr("Pulsa sumar con n = 4, después con 8 y con 16. ¿Qué forma dibujan los puntos?", "Press sum with n = 4, then with 8 and with 16. What shape do the points draw?"),
  });

  visualizador("vis-cuadratica", {
    ops: ["hayRepetidos"],
    entradas: [entradaN(4, 10), CASO],
    maxN: 10,
    maxPasos: 45,
    tituloGrafica: tr("pasos de hayRepetidos según n", "steps of hasDuplicates by n"),
    mensajeInicial: tr("Pulsa con n = 4, después con 6 y con 8 (sin repetidos). Mira cómo se llena la tabla de pares y cómo se empinan los puntos.",
      "Press with n = 4, then with 6 and with 8 (no duplicates). Watch how the table of pairs fills up and how the points get steeper."),
  });

  visualizador("vis-logaritmica", {
    ops: ["busquedaBinaria"],
    entradas: [entradaN(16, 32), OBJETIVO(999, 99)],
    maxN: 32,
    maxPasos: 16,
    tituloGrafica: tr("pasos de busquedaBinaria según n", "steps of binarySearch by n"),
    mensajeInicial: tr("Datos: los impares 1, 3, 5… ordenados. Busca 99 (mayor que todos: el peor caso) con n = 4, 8, 16 y 32. Prueba también un valor que sí esté.",
      "Data: the odd numbers 1, 3, 5… sorted. Search for 99 (greater than all: the worst case) with n = 4, 8, 16 and 32. Also try a value that is there."),
  });

  visualizador("vis-nlogn", {
    ops: ["contarPresentes"],
    entradas: [entradaN(4, 10)],
    maxN: 10,
    maxPasos: 40,
    tituloGrafica: tr("pasos de contarPresentes según n", "steps of countPresent by n"),
    mensajeInicial: tr("Pulsa con n = 4 y después con 8: cada consulta junta una columna de unos log n puntos. n columnas de log n: un rectángulo de n log n pasos.",
      "Press with n = 4 and then with 8: each query piles up a column of about log n dots. n columns of log n: a rectangle of n log n steps."),
  });

  visualizador("vis-todo", {
    ops: ["obtener", "busquedaBinaria", "sumar", "contarPresentes", "hayRepetidos"],
    sinPista: true,
    entradas: [entradaN(16, 64), { id: "i", etiqueta: "i", min: -5, max: 70, valor: 3 }, OBJETIVO(999, 999), CASO],
    maxN: 64,
    tituloGrafica: tr("pasos según n", "steps by n"),
    mensajeInicial: tr("Ejecuta las cinco con n = 16 y compara los puntos; luego prueba n = 32 y n = 64.", "Run all five with n = 16 and compare the points; then try n = 32 and n = 64."),
  });

  // ------------------------------------------------------------------
  // Paso 1: la carrera de las funciones de crecimiento
  // ------------------------------------------------------------------

  const CURVAS = [
    { o: "O(1)", corto: "1", serie: 1, f: () => 1, ejemplo: tr("obtener(i)", "get(i)"), duplicar: () => tr("igual", "same") },
    { o: "O(log n)", corto: "log n", serie: 2, f: (n) => Math.max(0, log2(n)), ejemplo: tr("búsqueda binaria", "binary search"), duplicar: () => tr("+1 paso", "+1 step") },
    { o: "O(n)", corto: "n", serie: 3, f: (n) => n, ejemplo: tr("sumar", "sum"), duplicar: () => "×2" },
    { o: "O(n log n)", corto: "n log n", serie: 4, f: (n) => n * Math.max(0, log2(n)), ejemplo: "heapsort", duplicar: (n) => `×${formato(n > 1 ? (2 * n * log2(2 * n)) / (n * log2(n)) : 2)}` },
    { o: "O(n²)", corto: "n²", serie: 5, f: (n) => n * n, ejemplo: tr("hayRepetidos", "hasDuplicates"), duplicar: () => "×4" },
    { o: "O(2ⁿ)", corto: "2ⁿ", serie: 6, f: (n) => Math.pow(2, n), ejemplo: tr("fibonacci recursivo", "recursive fibonacci"), duplicar: () => tr("al cuadrado", "squared") },
  ];

  const SUPERINDICES = "⁰¹²³⁴⁵⁶⁷⁸⁹";
  function grande(x) {
    if (x < 1e9) return formato(Math.abs(x - Math.round(x)) < 1e-9 ? Math.round(x) : x);
    const e = Math.floor(Math.log10(x));
    const m = x / Math.pow(10, e);
    return `${formato(Number(m.toFixed(1)))} × 10${String(e).split("").map((d) => SUPERINDICES[d]).join("")}`;
  }

  function montarCarrera() {
    const caja = document.getElementById("carrera");
    if (!caja) return;
    const MAXIMO = 100;
    let n = 10;
    const activas = new Set([0, 1, 2, 3, 4]);
    let animando = null;

    const deslizador = el("input", { type: "range", min: 1, max: MAXIMO, step: 1, "aria-label": tr("Tamaño de la entrada n", "Input size n") });
    deslizador.value = n;
    const lecturaN = el("b", { class: "valor-n" });
    const VER_CRECER = tr("▶ Ver crecer n", "▶ Watch n grow");
    const bAnimar = el("button", { class: "boton principal", type: "button", text: VER_CRECER });
    const chips = CURVAS.map((c, k) => el("button", {
      type: "button", class: `chip-serie serie-${c.serie}`, "aria-pressed": String(activas.has(k)),
      onclick: () => {
        if (activas.has(k)) activas.delete(k); else activas.add(k);
        chips[k].setAttribute("aria-pressed", String(activas.has(k)));
        pintar();
      },
    }, el("i", { class: "muestra-serie" }), c.o));
    const marco = el("div", { class: "marco-carrera" });
    const tooltip = el("div", { class: "tooltip-carrera", hidden: true });
    marco.append(tooltip);
    const cuerpoTabla = el("tbody");
    const comentario = el("p", { class: "resumen-costo", "aria-live": "polite" });

    caja.classList.add("panel", "carrera");
    // Las preguntas que siguen a la carrera van dentro, junto a la tabla.
    const preguntas = [];
    for (let sig = caja.nextElementSibling; sig && sig.classList.contains("pregunta"); sig = caja.nextElementSibling) {
      preguntas.push(sig);
      sig.remove();
    }
    caja.append(
      el("div", { class: "controles" },
        el("label", { class: "campo campo-n" }, el("span", {}, "n = ", lecturaN), deslizador),
        bAnimar),
      el("div", { class: "chips-serie", role: "group", "aria-label": tr("Curvas visibles", "Visible curves") }, chips),
      marco,
      comentario,
      el("div", { class: "tabla-envoltura" }, el("table", { class: "tabla-carrera" },
        el("thead", {}, el("tr", {}, el("th", { text: tr("Clase", "Class") }), el("th", { class: "col-ejemplo", text: tr("Ejemplo", "Example") }),
          el("th", { class: "num", html: tr("Pasos con <span class=\"n-actual\"></span>", "Steps with <span class=\"n-actual\"></span>") }), el("th", { class: "num", text: tr("Si duplicas n", "If you double n") }))),
        cuerpoTabla)),
      preguntas.length ? el("div", { class: "preguntas-carrera" }, preguntas) : null);

    deslizador.addEventListener("input", () => { detenerAnimacion(); n = Number(deslizador.value); pintar(); });
    bAnimar.addEventListener("click", () => {
      if (animando) { detenerAnimacion(); return; }
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        n = MAXIMO;
        deslizador.value = n;
        pintar();
        return;
      }
      const inicio = performance.now();
      const duracion = 4000;
      bAnimar.textContent = tr("❚❚ Pausar", "❚❚ Pause");
      const cuadro = (t) => {
        const avance = Math.min(1, (t - inicio) / duracion);
        n = Math.max(1, Math.round(1 + avance * avance * (MAXIMO - 1)));
        deslizador.value = n;
        pintar();
        if (avance < 1) animando = requestAnimationFrame(cuadro);
        else detenerAnimacion();
      };
      animando = requestAnimationFrame(cuadro);
    });

    function detenerAnimacion() {
      if (animando) cancelAnimationFrame(animando);
      animando = null;
      bAnimar.textContent = VER_CRECER;
    }

    let tamano = { ancho: 0, alto: 0 };
    let geometria = null;

    function pintar() {
      lecturaN.textContent = n;
      caja.querySelector(".n-actual").textContent = `n = ${n}`;
      const ancho = Math.max(260, marco.clientWidth || 600);
      // La lección en pantalla ancha usa una gráfica más baja (--proporcion en estilos.css).
      const proporcion = parseFloat(getComputedStyle(marco).getPropertyValue("--proporcion")) || 0.52;
      const alto = Math.round(Math.max(200, Math.min(340, ancho * proporcion)));
      tamano = { ancho, alto };
      const visibles = CURVAS.map((c, k) => ({ c, k })).filter(({ k }) => activas.has(k));
      const nMax = Math.max(2, n);
      const maxY = Math.max(2, ...visibles.map(({ c }) => c.f(nMax)));
      // El margen izquierdo se adapta a la etiqueta más larga del eje vertical.
      const largo = Math.max(...[0, maxY / 2, maxY].map((v) => grande(v).length));
      const m = { izq: Math.max(36, 12 + largo * 6.7), der: ancho < 420 ? 64 : 84, arr: 28, aba: 30 };
      const px = (x) => m.izq + ((x - 1) / (nMax - 1)) * (ancho - m.izq - m.der);
      const py = (y) => alto - m.aba - (y / maxY) * (alto - m.arr - m.aba);
      geometria = { m, nMax, px, py, maxY, visibles };

      const lienzo = svg("svg", { viewBox: `0 0 ${ancho} ${alto}`, width: ancho, height: alto, class: "svg-carrera", role: "img",
        "aria-label": tr(`Pasos de cada clase de complejidad para n de 1 a ${nMax}. Los valores están en la tabla de abajo.`, `Steps of each complexity class for n from 1 to ${nMax}. The values are in the table below.`) });
      for (const v of [0, maxY / 2, maxY]) {
        lienzo.append(svg("line", { x1: m.izq, x2: ancho - m.der, y1: py(v), y2: py(v), class: v ? "rejilla" : "eje" }));
        const t = svg("text", { x: m.izq - 6, y: py(v) + 4, "text-anchor": "end" });
        t.textContent = grande(v);
        lienzo.append(t);
      }
      for (const x of [1, Math.round((1 + nMax) / 2), nMax]) {
        const t = svg("text", { x: px(x), y: alto - m.aba + 16, "text-anchor": "middle" });
        t.textContent = x;
        lienzo.append(t);
      }
      const tn = svg("text", { x: ancho - m.der, y: alto - 4, "text-anchor": "end", class: "titulo-eje" });
      tn.textContent = "n →";
      const tp = svg("text", { x: 4, y: 11, class: "titulo-eje" });
      tp.textContent = tr("pasos ↑", "steps ↑");
      lienzo.append(tn, tp);

      // Curvas y etiquetas directas al final de cada una (separadas para no encimarse).
      const etiquetas = [];
      for (const { c } of visibles) {
        const puntos = [];
        const muestras = Math.min(160, Math.max(2, nMax * 4));
        for (let k = 0; k <= muestras; k++) {
          const x = 1 + (k / muestras) * (nMax - 1);
          puntos.push(`${px(x).toFixed(1)},${py(c.f(x)).toFixed(1)}`);
        }
        lienzo.append(svg("polyline", { points: puntos.join(" "), class: `curva-carrera serie-${c.serie}` }));
        lienzo.append(svg("circle", { cx: px(nMax), cy: py(c.f(nMax)), r: 4.5, class: `punta serie-${c.serie}` }));
        etiquetas.push({ c, y: py(c.f(nMax)) });
      }
      etiquetas.sort((a, b) => b.y - a.y);
      let limite = alto - m.aba + 4;
      for (const e of etiquetas) {
        e.y = Math.min(e.y + 4, limite);
        limite = e.y - 14;
      }
      for (const e of etiquetas) {
        const t = svg("text", { x: ancho - m.der + 8, y: e.y, class: `etiqueta-carrera serie-${e.c.serie}` });
        t.textContent = e.c.corto;
        lienzo.append(t);
      }
      lienzo.append(svg("line", { class: "cursor-carrera", x1: 0, x2: 0, y1: m.arr, y2: alto - m.aba, visibility: "hidden" }));
      const previo = marco.querySelector("svg");
      if (previo) previo.replaceWith(lienzo); else marco.prepend(lienzo);
      lienzo.addEventListener("pointermove", mover);
      lienzo.addEventListener("pointerdown", mover);
      lienzo.addEventListener("pointerleave", ocultar);

      cuerpoTabla.replaceChildren(...CURVAS.map((c, k) => el("tr", { class: activas.has(k) ? "" : "apagada" },
        el("td", {}, el("span", { class: `serie-${c.serie} nombre-serie` }, el("i", { class: "muestra-serie" }), c.o)),
        el("td", { class: "col-ejemplo", text: c.ejemplo }),
        el("td", { class: "num", text: grande(c.f(n)) }),
        el("td", { class: "num", text: c.duplicar(n) }))));

      const cuad = n * n;
      comentario.textContent = n < 4
        ? tr("Con n tan chico todas se parecen. Mueve n hacia la derecha (o pulsa ▶) y mira qué pasa.", "With such a small n they all look alike. Move n to the right (or press ▶) and see what happens.")
        : activas.has(5) && n >= 12
          ? tr(`Con 2ⁿ en la gráfica todo lo demás parece pegado al piso: con n = ${n} son ${grande(Math.pow(2, n))} pasos. Apágala para ver al resto.`,
            `With 2ⁿ on the chart everything else seems stuck to the floor: with n = ${n} it is ${grande(Math.pow(2, n))} steps. Turn it off to see the rest.`)
          : tr(`Con n = ${n}: n² ya da ${grande(cuad)} pasos, ${formato(cuad / n)} veces más que n, y log n apenas ${formato(log2(n))}. Cuanto más crece n, más se separan.`,
            `With n = ${n}: n² already gives ${grande(cuad)} steps, ${formato(cuad / n)} times more than n, and log n barely ${formato(log2(n))}. The more n grows, the further apart they get.`);
    }

    function mover(ev) {
      if (!geometria) return;
      const lienzo = marco.querySelector("svg");
      const caja = lienzo.getBoundingClientRect();
      const { m, nMax, px, visibles } = geometria;
      const x = ((ev.clientX - caja.left) / caja.width) * tamano.ancho;
      const k = Math.round(1 + ((x - m.izq) / (tamano.ancho - m.izq - m.der)) * (nMax - 1));
      if (k < 1 || k > nMax || !visibles.length) { ocultar(); return; }
      const cursor = lienzo.querySelector(".cursor-carrera");
      cursor.setAttribute("x1", px(k));
      cursor.setAttribute("x2", px(k));
      cursor.setAttribute("visibility", "visible");
      tooltip.hidden = false;
      tooltip.replaceChildren(el("b", { text: `n = ${k}` }), ...visibles.slice().reverse().map(({ c }) =>
        el("span", { class: `serie-${c.serie}` }, el("i", { class: "muestra-serie" }), `${c.corto}: `, el("b", { text: grande(c.f(k)) }))));
      const izquierda = px(k) / tamano.ancho * caja.width;
      tooltip.style.left = `${Math.min(caja.width - 150, Math.max(0, izquierda + 12))}px`;
    }

    function ocultar() {
      tooltip.hidden = true;
      const cursor = marco.querySelector(".cursor-carrera");
      if (cursor) cursor.setAttribute("visibility", "hidden");
    }

    let anchoAnterior = 0;
    window.addEventListener("resize", () => {
      if (!marco.clientWidth || marco.clientWidth === anchoAnterior) return;
      anchoAnterior = marco.clientWidth;
      pintar();
    });
    pintar();
  }

  // ------------------------------------------------------------------
  // Paso 7: quitar constantes y términos chicos
  // ------------------------------------------------------------------

  function montarReglas() {
    const caja = document.getElementById("widget-reglas");
    if (!caja) return;
    // El deslizador va de 0 a 100 y n crece de 1 a 10 000 en escala logarítmica.
    const nDesde = (v) => Math.max(1, Math.round(Math.pow(10, (v / 100) * 4)));
    const deslizador = el("input", { type: "range", min: 0, max: 100, step: 1, "aria-label": tr("Tamaño de la entrada n", "Input size n") });
    deslizador.value = 25;
    const lecturaN = el("b", { class: "valor-n" });

    const TERMINOS = [
      { nombre: "3n²", f: (n) => 3 * n * n, clase: "termino-1" },
      { nombre: "5n", f: (n) => 5 * n, clase: "termino-2" },
      { nombre: "20", f: () => 20, clase: "termino-3" },
    ];
    const segmentos = TERMINOS.map((t) => el("div", { class: `segmento ${t.clase}` }));
    const detalle = el("div", { class: "detalle-terminos" });
    const razon = el("p", { class: "lectura-costo" });

    const filaA = el("div", { class: "barra-comparador-relleno" });
    const filaB = el("div", { class: "barra-comparador-relleno" });
    const cifraA = el("span", { class: "barra-comparador-cifra" });
    const cifraB = el("span", { class: "barra-comparador-cifra" });
    const veredicto = el("p", { class: "resumen-costo", "aria-live": "polite" });

    caja.classList.add("panel", "reglas");
    caja.append(
      el("div", { class: "controles" }, el("label", { class: "campo campo-n" }, el("span", {}, "n = ", lecturaN), deslizador)),
      el("div", { class: "cuerpo-comparador" },
        el("p", { class: "fila-titulo", text: tr("f(n) = 3n² + 5n + 20: ¿cuánto aporta cada término?", "f(n) = 3n² + 5n + 20: how much does each term contribute?") }),
        el("div", { class: "barra-terminos", role: "img", "aria-label": tr("Parte de f(n) que aporta cada término", "Share of f(n) contributed by each term") }, segmentos),
        detalle, razon,
        el("p", { class: "fila-titulo", text: tr("Algoritmo A: 100·n pasos. Algoritmo B: n² pasos. ¿Cuál es más rápido?", "Algorithm A: 100·n steps. Algorithm B: n² steps. Which one is faster?") }),
        el("div", { class: "fila-comparador" }, el("span", { class: "fila-comparador-nombre", text: "A 100n" }), el("div", { class: "barra-comparador" }, filaA), cifraA),
        el("div", { class: "fila-comparador" }, el("span", { class: "fila-comparador-nombre", text: "B n²" }), el("div", { class: "barra-comparador" }, filaB), cifraB)),
      veredicto);

    function pintar() {
      const n = nDesde(Number(deslizador.value));
      lecturaN.textContent = formato(n);
      const valores = TERMINOS.map((t) => t.f(n));
      const total = valores.reduce((a, b) => a + b, 0);
      segmentos.forEach((s, k) => { s.style.width = `${(valores[k] / total) * 100}%`; });
      detalle.replaceChildren(...TERMINOS.map((t, k) => el("span", {},
        el("i", { class: `muestra ${t.clase}` }), `${t.nombre} = ${grande(valores[k])} `, el("b", { text: `(${formato((valores[k] / total) * 100)} %)` }))));
      razon.textContent = tr(`f(${formato(n)}) = ${grande(total)}. Dividido entre n² da ${formato(total / (n * n))}: ${n < 20
        ? "con n chico, 5n y 20 todavía pesan."
        : "se acerca a 3. Los términos chicos desaparecen y el 3 no cambia la forma: f(n) es O(n²)."}`,
      `f(${formato(n)}) = ${grande(total)}. Divided by n² it gives ${formato(total / (n * n))}: ${n < 20
        ? "with a small n, 5n and 20 still weigh in."
        : "it approaches 3. The small terms disappear and the 3 doesn't change the shape: f(n) is O(n²)."}`);
      const a = 100 * n;
      const b = n * n;
      const mayor = Math.max(a, b);
      filaA.style.width = `${(a / mayor) * 100}%`;
      filaB.style.width = `${(b / mayor) * 100}%`;
      filaA.className = `barra-comparador-relleno ${a < b ? "gana" : a > b ? "pierde" : ""}`;
      filaB.className = `barra-comparador-relleno ${b < a ? "gana" : b > a ? "pierde" : ""}`;
      cifraA.textContent = grande(a);
      cifraB.textContent = grande(b);
      veredicto.textContent = n < 100
        ? tr(`Con n = ${formato(n)}, B (n²) hace menos pasos: la constante 100 le pesa a A. Pero sigue moviendo n…`,
          `With n = ${formato(n)}, B (n²) takes fewer steps: the constant 100 weighs on A. But keep moving n…`)
        : n === 100
          ? tr("Con n = 100 empatan: 10 000 pasos cada uno. Desde aquí, A gana siempre.", "With n = 100 they tie: 10,000 steps each. From here on, A always wins.")
          : tr(`Con n = ${formato(n)}, A (O(n)) gana: B hace ${formato(b / a)} veces más pasos, y la diferencia crece sin parar. Por eso Big-O mira qué pasa cuando n es grande.`,
            `With n = ${formato(n)}, A (O(n)) wins: B takes ${formato(b / a)} times more steps, and the gap keeps growing. That is why Big-O looks at what happens when n is large.`);
    }

    deslizador.addEventListener("input", pintar);
    pintar();
  }

  if (typeof document !== "undefined") {
    montarCarrera();
    montarReglas();
  }
})();
