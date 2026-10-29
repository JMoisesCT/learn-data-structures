// Lección de notación algorítmica (Big-O), en pasos. Los fragmentos de
// código deben coincidir línea por línea con
// ejemplos/cpp/notacion_algoritmica.cpp (scripts/verificar-fragmentos.mjs
// lo revisa).
(function () {
  const { el } = DS;
  const SVG = "http://www.w3.org/2000/svg";

  // ------------------------------------------------------------------
  // Fragmentos de C++ (copiados de ejemplos/cpp/notacion_algoritmica.cpp)
  // ------------------------------------------------------------------

  const CODIGO = {
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
  };

  // Cada clase de complejidad tiene su color (variables --serie-k de estilos.css),
  // el mismo en la carrera, en las gráficas y en las tablas.
  const log2 = (n) => Math.log(n) / Math.LN2;
  const pisoLog = (n) => Math.floor(log2(n) + 1e-9) + 1;
  const CLASES = {
    obtener: { o: "O(1)", serie: 1, peor: () => 1, forma: "una línea plana: da igual cuánto valga n." },
    busquedaBinaria: { o: "O(log n)", serie: 2, peor: (n) => pisoLog(n), forma: "una curva que casi se aplana: crece muy, muy despacio." },
    sumar: { o: "O(n)", serie: 3, peor: (n) => n, forma: "una recta: los pasos crecen al mismo ritmo que n." },
    contarPresentes: { o: "O(n log n)", serie: 4, peor: (n) => n * pisoLog(n), forma: "casi una recta, pero un poco más empinada cada vez." },
    hayRepetidos: { o: "O(n²)", serie: 5, peor: (n) => (n * (n - 1)) / 2, forma: "una curva que se empina cada vez más (una parábola)." },
  };

  // Valores distintos para los arreglos sin orden: los primeros 16 a mano y
  // después el resto de 1 a 99, mezclado (alcanza para n = 64).
  const PRIMEROS = [37, 12, 85, 4, 61, 29, 73, 18, 90, 46, 7, 55, 23, 68, 2, 81];
  const BASE = PRIMEROS.concat(Array.from({ length: 99 }, (_, k) => k + 1)
    .filter((v) => !PRIMEROS.includes(v))
    .sort((a, b) => ((a * 47) % 101) - ((b * 47) % 101)));
  // Con n grande, la animación agrupa varias vueltas en un paso para no durar minutos.
  const MAX_DETALLE = 10;
  const impares = (n) => Array.from({ length: n }, (_, k) => 2 * k + 1);
  const hasta = (n) => Array.from({ length: Math.max(0, n) }, (_, k) => k);
  const formato = (x) => x.toLocaleString("es", { maximumFractionDigits: 1 });

  // ------------------------------------------------------------------
  // Estado: el arreglo de la última ejecución, el contador de pasos y el
  // historial de ejecuciones (cada una deja un punto en la gráfica).
  // ------------------------------------------------------------------

  function estadoDesde(op, n) {
    const s = { historial: [], sigCorrida: 1, vis: {} };
    preparar(s, op, n, "sin");
    s.enCurso = false;
    return s;
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
    if (distintos.size >= 2 && !(s.formaVista || {})[s.op]) {
      s.formaVista = Object.assign({}, s.formaVista, { [s.op]: true });
      extra = ` Ya hay puntos con dos n distintos: la línea punteada muestra el peor caso, ${CLASES[s.op].forma}`;
    }
    paso(clave, linea, texto + extra, tipo);
  }

  // ------------------------------------------------------------------
  // Animaciones de cada función
  // ------------------------------------------------------------------

  const OPS = {
    obtener: {
      etiqueta: "obtener(datos, i)",
      usa: ["n", "i"],
      fragmentos: ["obtener"],
      ejecutar(s, { n, i }, paso) {
        preparar(s, "obtener", n);
        s.vis = { vars: { n, i }, marcas: [["i", "d", i]] };
        paso("obtener", 1, `obtener(datos, ${i}) en un arreglo de ${n} elemento(s). Fíjate: la función ni siquiera recibe n.`);
        if (i < 0 || i >= n) {
          s.enCurso = false;
          s.vis = { vars: { n, i }, marcas: [["i", "d", i]], error: true, fantasma: i };
          paso("obtener", 3, `datos[${i}] no existe: las posiciones van de 0 a ${n - 1}. C++ no lo revisa (sería comportamiento indefinido), así que aquí no lo ejecutamos.`, "error");
          return;
        }
        contar(s, "d", i);
        s.vis = { vars: { n, i }, marcas: [["i", "d", i]], leidas: [i] };
        paso("obtener", 2, "pasos++ → 1. Es el único paso: la dirección de datos[i] sale de una cuenta (inicio + i × 4 bytes), sin recorrer nada.");
        s.vis = { vars: { n, i }, marcas: [["i", "d", i]], encontrada: [i], salida: s.datos[i] };
        terminar(s, paso, "obtener", 3, `return datos[${i}] = ${s.datos[i]}. Con n = ${n} fue 1 paso; con un millón de elementos también sería 1. Eso es O(1): tiempo constante.`, "exito");
      },
    },
    sumar: {
      etiqueta: "sumar(datos, n)",
      usa: ["n"],
      fragmentos: ["sumar"],
      ejecutar(s, { n }, paso) {
        preparar(s, "sumar", n);
        let suma = 0;
        s.vis = { vars: { n, suma } };
        paso("sumar", 2, "int suma = 0. Preparar la suma se hace una vez, no por cada elemento: no es lo que crece.");
        const grupo = n > 16 ? Math.ceil(n / 16) : 1;
        for (let i = 0; i < n; i++) {
          contar(s, "d", i);
          suma += s.datos[i];
          if ((i + 1) % grupo && i < n - 1) continue;
          const desde = i + 1 - ((i % grupo) + 1);
          s.vis = { vars: { n, i, suma }, cambio: ["suma"], marcas: [["i", "d", i]], leidas: hasta(i + 1).slice(desde), revisadas: hasta(desde) };
          paso("sumar", 5, grupo === 1
            ? `i = ${i}: pasos++ → ${s.pasos}, y suma += ${s.datos[i]} → ${suma}.` + (i === 0 ? " Cada vuelta del for es un paso." : "")
            : `i = ${desde}…${i}: ${i - desde + 1} vueltas más (las mostramos juntas), una por elemento. pasos = ${s.pasos}, suma = ${suma}.`);
        }
        s.vis = { vars: { n, suma }, revisadas: hasta(n), salida: suma };
        terminar(s, paso, "sumar", 7, `return ${suma}. Una vuelta por elemento: ${n} pasos para n = ${n}. Con el doble de datos, el doble de pasos: O(n), tiempo lineal.`, "exito");
      },
    },
    hayRepetidos: {
      etiqueta: "hayRepetidos(datos, n)",
      usa: ["n", "caso"],
      fragmentos: ["hayRepetidos"],
      ejecutar(s, { n, caso }, paso) {
        preparar(s, "hayRepetidos", n, caso);
        const d = s.datos;
        const total = (n * (n - 1)) / 2;
        s.vis = { vars: { n } };
        paso("hayRepetidos", 2, `Hay que comparar cada elemento con todos los que están a su derecha. La tabla de pares tiene ${total} casillas: una por comparación posible.`);
        // Con n grande, un paso de la animación muestra varias filas de pares.
        const detallado = n <= MAX_DETALLE;
        const filasPorPaso = Math.ceil((n - 1) / 24);
        for (let i = 0; i < n; i++) {
          for (let j = i + 1; j < n; j++) {
            contar(s, "d", j);
            Object.assign(s.pares, { i, j, actual: true });
            const igual = d[i] === d[j];
            if (detallado || igual) {
              s.vis = { vars: { n, i, j }, marcas: [["i", "d", i], ["j", "d", j]], leidas: [i, j] };
              paso("hayRepetidos", 5, `${j === i + 1 ? `i = ${i}: ahora datos[${i}] se compara con todos los de su derecha. ` : ""}`
                + `¿datos[${i}] (${d[i]}) == datos[${j}] (${d[j]})? ${igual ? "¡Sí!" : "No."} pasos = ${s.pasos}.`);
            } else if (j === n - 1 && ((i + 1) % filasPorPaso === 0 || i === n - 2)) {
              const desde = i - (i % filasPorPaso);
              s.vis = { vars: { n, i, j }, marcas: [["i", "d", i]], leidas: [i] };
              paso("hayRepetidos", 5, `${desde < i ? `i = ${desde}…${i}` : `i = ${i}`}: cada uno se comparó con todos los de su derecha (los mostramos juntos). `
                + `Ninguno es igual. pasos = ${s.pasos} de ${total}.`);
            }
            if (igual) {
              s.pares.igual = true;
              s.vis = { vars: { n, i, j }, marcas: [["i", "d", i], ["j", "d", j]], encontrada: [i, j], salida: "true" };
              terminar(s, paso, "hayRepetidos", 6, `return true en ${s.pasos} paso(s) de ${total} posibles. `
                + (s.pasos <= 2 ? "Es el mejor caso: el repetido estaba al principio. Pero Big-O suele hablar del peor caso, cuando no hay ninguno."
                  : "Encontrarlo tarde es casi tan caro como no encontrarlo."), "exito");
              return;
            }
          }
        }
        s.pares.actual = false;
        s.vis = { vars: { n }, revisadas: hasta(n), salida: "false" };
        terminar(s, paso, "hayRepetidos", 10, `return false. Comparamos todos los pares: n·(n − 1)/2 = ${n}·${Math.max(0, n - 1)}/2 = ${total}. Con el doble de datos serían unas 4 veces más comparaciones: O(n²), tiempo cuadrático.`, "exito");
      },
    },
    busquedaBinaria: {
      etiqueta: "busquedaBinaria(datos, n, objetivo)",
      usa: ["n", "objetivo"],
      fragmentos: ["busquedaBinaria"],
      ejecutar(s, { n, objetivo }, paso) {
        preparar(s, "busquedaBinaria", n);
        const r = binaria(s, n, objetivo, paso, { fila: "d", detallado: true });
        s.vis = Object.assign({}, r.vis, { salida: r.resultado });
        const texto = r.resultado >= 0
          ? `return ${r.resultado}: está en la posición ${r.resultado}. `
          : `izq (${r.izq}) > der (${r.der}): ya no queda rango. return -1. `;
        terminar(s, paso, "busquedaBinaria", r.resultado >= 0 ? 8 : 16, texto
          + `${s.pasos} paso(s) para ${n} elemento(s): cada vuelta parte el rango a la mitad, así que con el doble de datos solo hace falta una vuelta más. O(log n).`, "exito");
      },
    },
    contarPresentes: {
      etiqueta: "contarPresentes(consultas, datos, n)",
      usa: ["n"],
      fragmentos: ["contarPresentes", "busquedaBinaria"],
      ejecutar(s, { n }, paso) {
        preparar(s, "contarPresentes", n);
        let encontrados = 0;
        s.vis = { vars: { n, encontrados } };
        paso("contarPresentes", 2, `Por cada una de las ${n} consultas haremos una búsqueda binaria en datos (los impares, ordenados). Mira cómo cada consulta junta su columna de pasos.`);
        if (n > MAX_DETALLE) {
          // Con n grande mostramos varias búsquedas por paso; cada una deja igual su columna.
          const grupo = Math.ceil(n / 16);
          for (let i = 0; i < n; i++) {
            if (binaria(s, n, s.consultas[i], null, { consulta: i }).resultado !== -1) encontrados++;
            if ((i + 1) % grupo && i < n - 1) continue;
            const desde = i + 1 - ((i % grupo) + 1);
            s.vis = { vars: { n, i, encontrados }, marcas: [["i", "c", i]], leidasC: hasta(i + 1).slice(desde), revisadasC: hasta(desde) };
            paso("contarPresentes", 4, `${desde < i ? `i = ${desde}…${i}: ${i - desde + 1} búsquedas binarias` : `i = ${i}: una búsqueda binaria`} (las mostramos juntas). `
              + `Cada columna junta unos log₂ ${n} ≈ ${formato(log2(n))} pasos. pasos = ${s.pasos}, encontrados = ${encontrados}.`);
          }
          s.vis = { vars: { n, encontrados }, revisadasC: hasta(n), salida: encontrados };
          terminar(s, paso, "contarPresentes", 8, `return ${encontrados}. ${n} búsquedas de a lo sumo ${pisoLog(n)} pasos cada una: ${s.pasos} pasos en total. Un ciclo de n vueltas con algo de O(log n) adentro: se multiplican, O(n log n).`, "exito");
          return;
        }
        for (let i = 0; i < n; i++) {
          const q = s.consultas[i];
          s.vis = { vars: { n, i, encontrados }, marcas: [["i", "c", i]], leidasC: [i], revisadasC: hasta(i) };
          paso("contarPresentes", 4, `i = ${i}: ¿${q} está en datos? Llamamos a busquedaBinaria.`);
          const r = binaria(s, n, q, paso, { fila: "d", extra: { i }, consulta: i, pila: true });
          if (r.resultado !== -1) encontrados++;
          s.vis = { vars: { n, i, encontrados }, cambio: r.resultado !== -1 ? ["encontrados"] : [], marcas: [["i", "c", i]], revisadasC: hasta(i + 1), encontradaC: r.resultado !== -1 ? [i] : [], encontrada: r.resultado !== -1 ? [r.resultado] : [] };
          paso("contarPresentes", r.resultado !== -1 ? 5 : 4, r.resultado !== -1
            ? `Sí está: encontrados++ → ${encontrados}. Esa búsqueda costó ${s.puntos[`c-${i}`] || 0} paso(s).`
            : `No está (devolvió -1). Esa búsqueda costó ${s.puntos[`c-${i}`] || 0} paso(s).`);
        }
        s.vis = { vars: { n, encontrados }, revisadasC: hasta(n), salida: encontrados };
        terminar(s, paso, "contarPresentes", 8, `return ${encontrados}. ${n} búsquedas de a lo sumo ${pisoLog(n)} pasos cada una: ${s.pasos} pasos en total. Un ciclo de n vueltas con algo de O(log n) adentro: se multiplican, O(n log n).`, "exito");
      },
    },
  };

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
      paso("busquedaBinaria", 3, `Los datos están ordenados. El objetivo (${objetivo}) solo puede estar entre izq = 0 y der = ${der}: ${n} candidato(s).`);
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
        paso("busquedaBinaria", 6, `pasos++ → ${s.pasos}. Quedan ${quedan} candidato(s); miramos el del medio: datos[${medio}] = ${v}. ¡Es el objetivo!`);
        s.vis = vis({ vars: Object.assign({}, base, { izq, der, medio }), marcas, encontrada: [medio], descartadas: fuera(izq, der) });
        return { resultado: medio, vis: s.vis, izq, der };
      }
      const derecha = v < objetivo;
      if (!o.detallado) {
        const descartados = derecha ? medio - izq + 1 : der - medio + 1;
        if (derecha) izq = medio + 1; else der = medio - 1;
        s.vis = vis({ vars: Object.assign({}, base, { izq, der, medio }), marcas: marcasConsulta.concat([["izq", "d", Math.min(izq, n - 1)], ["der", "d", Math.max(der, 0)]]), leidas: [medio], descartadas: fuera(izq, der) });
        paso("busquedaBinaria", derecha ? 11 : 13, `pasos++ → ${s.pasos}. datos[${medio}] = ${v} ${derecha ? "<" : ">"} ${objetivo}: descartamos ${descartados} de golpe.`);
        continue;
      }
      paso("busquedaBinaria", 6, `pasos++ → ${s.pasos}. Quedan ${quedan} candidato(s); miramos el del medio: datos[${medio}] = ${v}.`);
      const descartados = derecha ? medio - izq + 1 : der - medio + 1;
      if (derecha) izq = medio + 1; else der = medio - 1;
      s.vis = vis({
        vars: Object.assign({}, base, { izq, der, medio }), cambio: [derecha ? "izq" : "der"],
        marcas: [["izq", "d", Math.min(izq, n - 1)], ["der", "d", Math.max(der, 0)]], descartadas: fuera(izq, der),
      });
      paso("busquedaBinaria", derecha ? 11 : 13, `${v} ${derecha ? "<" : ">"} ${objetivo}: el objetivo solo puede estar a la ${derecha ? "derecha" : "izquierda"}. `
        + `${derecha ? `izq = ${izq}` : `der = ${der}`}: descartamos ${descartados} de golpe` + (der >= izq ? `; quedan ${der - izq + 1}.` : "."));
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

  // Hasta 12 casillas van en una fila grande (que se reduce en pantallas
  // angostas). Con más, las casillas se acomodan en varias filas para que los
  // valores se sigan leyendo.
  function medidas(n, escenario) {
    if (n <= 12) return { paso: 44, celda: 38, columnas: n };
    const disponible = Math.max(260, anchoArreglo(escenario) || 568);
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
      el("p", { class: "leyenda-na" }, el("i", { class: "na-punto muestra-punto" }), " = 1 paso (cada pasos++ deja caer un punto)"),
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
      contador = el("div", { class: "contador-na" }, el("span", { text: "pasos" }), el("b"));
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
      vis.pila ? el("div", { class: "pila-llamadas" }, vis.pila.map((f) => el("span", { class: "llamada", text: `${f}()` }))) : "",
      DS.variables(vis.vars || { n: s.n }, vis.cambio),
      vis.salida != null ? el("div", { class: "salida-valor" }, "devuelve", el("div", { class: "celda encontrada", text: vis.salida })) : "");
  }

  function dibujarArreglo(escenario, lienzo, s, vis) {
    const n = s.n;
    // La gráfica va al lado del arreglo, salvo con la tabla de pares de
    // hayRepetidos y n grande: ahí arreglo y tabla necesitan todo el ancho.
    escenario.querySelector(".cuerpo-na").classList.toggle("al-lado", !(s.op === "hayRepetidos" && n > 12));
    const { paso, celda, columnas } = medidas(n, escenario);
    // Alto de las columnas de puntos: cuántos pasos puede tocar una misma casilla.
    // En hayRepetidos con n grande serían demasiados: ahí los cuenta la tabla de pares.
    const conPuntos = s.op !== "hayRepetidos" || n <= 9;
    const columna = s.op === "hayRepetidos" ? n - 1 : s.op === "contarPresentes" ? pisoLog(n) : 1;
    const separacion = n > 12 ? 6 : 8;
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
    if (s.consultas) agregarFila("c", soloConsultas ? "consultas (se buscan en datos)" : "consultas", s.consultas, "C", 18);
    const ordenados = s.op === "busquedaBinaria" || s.op === "contarPresentes";
    if (!soloConsultas) agregarFila("d", ordenados ? "datos (ordenados)" : "datos", s.datos, "", ordenados ? 40 : 18);
    const extra = vis.fantasma != null && vis.fantasma >= n && n <= 12 ? Math.min(vis.fantasma, n + 3) - n + 1 : 0;
    const ancho = Math.max(280, (Math.min(n, columnas) + extra) * paso + 16);
    lienzo.style.width = `${ancho}px`;
    lienzo.style.height = `${y}px`;
    lienzo.dataset.ancho = ancho;
    lienzo.dataset.alto = y;
    escalar(escenario, lienzo);
    lienzo.classList.toggle("varias-filas", n > 12);
    lienzo.classList.remove("sacudir");
    if (vis.error) {
      void lienzo.offsetWidth;
      lienzo.classList.add("sacudir");
    }

    const p = piezas(lienzo);
    const x = (j) => 8 + (n <= 12 ? j : j % columnas) * paso;
    const yCelda = (f, j) => f.yCeldas + (n <= 12 ? 0 : Math.floor(j / columnas)) * f.banda;
    for (const f of filas) {
      const titulo = p.pieza(`t-${f.id}`, () => el("span", { class: "fila-titulo" }));
      titulo.textContent = f.titulo;
      titulo.style.cssText = `left:0;top:${f.y}px`;
      f.valores.forEach((v, j) => {
        const nodo = p.pieza(`c-${s.corrida}-${f.id}-${j}`, () => el("div", { class: "na-celda" }));
        nodo.textContent = v;
        nodo.style.cssText = `left:${x(j)}px;top:${yCelda(f, j)}px;width:${celda}px;height:${celda}px`;
        let clase = "na-celda";
        if ((vis[`revisadas${f.sufijo}`] || []).includes(j)) clase += " revisada";
        if (!f.sufijo && (vis.descartadas || []).includes(j)) clase += " descartada";
        if ((vis[`leidas${f.sufijo}`] || []).includes(j)) clase += " leida";
        if ((vis[`encontrada${f.sufijo}`] || []).includes(j)) clase += " encontrada";
        nodo.className = clase;
        const indice = p.pieza(`i-${s.corrida}-${f.id}-${j}`, () => el("span", { class: "indice" }));
        indice.textContent = j;
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
    for (const [nombre, fila, j] of vis.marcas || []) {
      if (j < 0 || j > (n <= 12 ? n + 3 : n - 1)) continue;
      (grupos[`${fila}-${j}`] = grupos[`${fila}-${j}`] || []).push(nombre);
    }
    for (const [clave, nombres] of Object.entries(grupos)) {
      const [fila, j] = clave.split("-");
      const f = filas.find((ff) => ff.id === fila);
      if (!f) continue;
      nombres.sort((a, b) => ORDEN_MARCAS.indexOf(a) - ORDEN_MARCAS.indexOf(b));
      nombres.forEach((nombre, k) => {
        const marca = p.pieza(`m-${fila}-${nombre}`, () => el("span", { class: "marcador na-marca", text: nombre }));
        const mala = !!vis.error && nombre === "i";
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
      const lado = n <= 8 ? 18 : n <= 12 ? 15 : 12;
      let rejilla = caja.querySelector(".rejilla-pares");
      if (!rejilla || rejilla.dataset.corrida !== String(s.corrida)) {
        rejilla = el("div", { class: "rejilla-pares", "data-corrida": s.corrida, style: `grid-template-columns:repeat(${n + 1}, ${lado}px)` });
        rejilla.append(el("span", { class: "eje-pares", text: "i\\j" }));
        for (let j = 0; j < n; j++) rejilla.append(el("span", { class: "eje-pares", text: j }));
        for (let i = 0; i < n; i++) {
          rejilla.append(el("span", { class: "eje-pares", text: i }));
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
    caja.querySelector(".fila-titulo").textContent = `pares comparados: ${hechos} de ${(n * (n - 1)) / 2}`;
  }

  function dibujarParesCanvas(caja, s, hecho) {
    const n = s.n;
    const lado = Math.max(3, Math.floor(250 / n) - 1);
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
    lienzo.setAttribute("aria-label", `Tabla de ${n} por ${n} pares: la parte coloreada son los pares ya comparados`);
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
    tp.textContent = "pasos ↑";
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
      g.querySelector("title").textContent = `${h.op}, n = ${h.n}: ${h.pasos} paso(s)`;
    }
    puntos.fin();

    const resumen = s.historial.length
      ? s.historial.map((h) => `${h.op} con n = ${h.n}: ${h.pasos} pasos`).join("; ")
      : "todavía sin puntos";
    lienzo.setAttribute("aria-label", `${cfg.tituloGrafica}: ${resumen}`);

    // Leyenda solo si hay más de una función en la gráfica.
    const leyenda = caja.querySelector(".leyenda-grafica");
    const enGrafica = [...new Set(visibles.map((h) => h.op))];
    leyenda.replaceChildren(...(cfg.leyenda && enGrafica.length ? Object.keys(CLASES).filter((op) => enGrafica.includes(op)).map((op) =>
      el("span", { class: `serie-${CLASES[op].serie}` }, el("i", { class: "muestra-serie" }), `${op} ${CLASES[op].o}`)) : []));
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
      tituloCodigo: (clave) => `${clave}()`,
      mensajeInicial: opciones.mensajeInicial,
      estadoInicial: (valores) => estadoDesde(opciones.ops[0], valores.n),
      entradas: opciones.entradas,
      operaciones: opciones.ops.map((id) => Object.assign({ id }, OPS[id])),
    });
  }

  const entradaN = (valor, max) => ({ id: "n", etiqueta: "n", min: 1, max, valor });
  const CASO = { id: "caso", etiqueta: "Datos", reinicia: false, opciones: [["sin", "sin repetidos (peor caso)"], ["inicio", "repetido al inicio"], ["final", "repetido al final"]] };

  visualizador("vis-constante", {
    ops: ["obtener"],
    entradas: [entradaN(6, 16), { id: "i", etiqueta: "i", min: -5, max: 20, valor: 4 }],
    maxN: 16,
    maxPasos: 16,
    tituloGrafica: "pasos de obtener según n",
    mensajeInicial: "Pulsa obtener(datos, i). Después cambia n (prueba 2, 10 y 16) y vuelve a pulsar: cada ejecución deja un punto en la gráfica.",
  });

  visualizador("vis-lineal", {
    ops: ["sumar"],
    entradas: [entradaN(4, 16)],
    maxN: 16,
    maxPasos: 16,
    tituloGrafica: "pasos de sumar según n",
    mensajeInicial: "Pulsa sumar con n = 4, después con 8 y con 16. ¿Qué forma dibujan los puntos?",
  });

  visualizador("vis-cuadratica", {
    ops: ["hayRepetidos"],
    entradas: [entradaN(4, 10), CASO],
    maxN: 10,
    maxPasos: 45,
    tituloGrafica: "pasos de hayRepetidos según n",
    mensajeInicial: "Pulsa con n = 4, después con 6 y con 8 (sin repetidos). Mira cómo se llena la tabla de pares y cómo se empinan los puntos.",
  });

  visualizador("vis-logaritmica", {
    ops: ["busquedaBinaria"],
    entradas: [entradaN(16, 32), { id: "objetivo", etiqueta: "objetivo", min: -99, max: 999, valor: 99 }],
    maxN: 32,
    maxPasos: 16,
    tituloGrafica: "pasos de busquedaBinaria según n",
    mensajeInicial: "Datos: los impares 1, 3, 5… ordenados. Busca 99 (mayor que todos: el peor caso) con n = 4, 8, 16 y 32. Prueba también un valor que sí esté.",
  });

  visualizador("vis-nlogn", {
    ops: ["contarPresentes"],
    entradas: [entradaN(4, 10)],
    maxN: 10,
    maxPasos: 40,
    tituloGrafica: "pasos de contarPresentes según n",
    mensajeInicial: "Pulsa con n = 4 y después con 8: cada consulta junta una columna de unos log n puntos. n columnas de log n: un rectángulo de n log n pasos.",
  });

  visualizador("vis-todo", {
    ops: ["obtener", "busquedaBinaria", "sumar", "contarPresentes", "hayRepetidos"],
    entradas: [entradaN(16, 64), { id: "i", etiqueta: "i", min: -5, max: 70, valor: 3 }, { id: "objetivo", etiqueta: "objetivo", min: -99, max: 999, valor: 999 }, CASO],
    maxN: 64,
    tituloGrafica: "pasos según n",
    mensajeInicial: "Ejecuta las cinco funciones con n = 16 y compara los puntos. Después prueba n = 32 y n = 64: la escala vertical crece sola y hayRepetidos sale disparada.",
  });

  // ------------------------------------------------------------------
  // Paso 1: la carrera de las funciones de crecimiento
  // ------------------------------------------------------------------

  const CURVAS = [
    { o: "O(1)", corto: "1", serie: 1, f: () => 1, ejemplo: "obtener(i)", duplicar: () => "igual" },
    { o: "O(log n)", corto: "log n", serie: 2, f: (n) => Math.max(0, log2(n)), ejemplo: "búsqueda binaria", duplicar: () => "+1 paso" },
    { o: "O(n)", corto: "n", serie: 3, f: (n) => n, ejemplo: "sumar", duplicar: () => "×2" },
    { o: "O(n log n)", corto: "n log n", serie: 4, f: (n) => n * Math.max(0, log2(n)), ejemplo: "heapsort", duplicar: (n) => `×${formato(n > 1 ? (2 * n * log2(2 * n)) / (n * log2(n)) : 2)}` },
    { o: "O(n²)", corto: "n²", serie: 5, f: (n) => n * n, ejemplo: "hayRepetidos", duplicar: () => "×4" },
    { o: "O(2ⁿ)", corto: "2ⁿ", serie: 6, f: (n) => Math.pow(2, n), ejemplo: "fibonacci recursivo", duplicar: () => "al cuadrado" },
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

    const deslizador = el("input", { type: "range", min: 1, max: MAXIMO, step: 1, "aria-label": "Tamaño de la entrada n" });
    deslizador.value = n;
    const lecturaN = el("b", { class: "valor-n" });
    const bAnimar = el("button", { class: "boton principal", type: "button", text: "▶ Ver crecer n" });
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
    caja.append(
      el("div", { class: "controles" },
        el("label", { class: "campo campo-n" }, el("span", {}, "n = ", lecturaN), deslizador),
        bAnimar),
      el("div", { class: "chips-serie", role: "group", "aria-label": "Curvas visibles" }, chips),
      marco,
      comentario,
      el("div", { class: "tabla-envoltura" }, el("table", { class: "tabla-carrera" },
        el("thead", {}, el("tr", {}, el("th", { text: "Clase" }), el("th", { class: "col-ejemplo", text: "Ejemplo" }), el("th", { class: "num", html: "Pasos con <span class=\"n-actual\"></span>" }), el("th", { class: "num", text: "Si duplicas n" }))),
        cuerpoTabla)));

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
      bAnimar.textContent = "❚❚ Pausar";
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
      bAnimar.textContent = "▶ Ver crecer n";
    }

    let tamano = { ancho: 0, alto: 0 };
    let geometria = null;

    function pintar() {
      lecturaN.textContent = n;
      caja.querySelector(".n-actual").textContent = `n = ${n}`;
      const ancho = Math.max(260, marco.clientWidth || 600);
      const alto = Math.round(Math.max(220, Math.min(340, ancho * 0.52)));
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
        "aria-label": `Pasos de cada clase de complejidad para n de 1 a ${nMax}. Los valores están en la tabla de abajo.` });
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
      tp.textContent = "pasos ↑";
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
        ? "Con n tan chico todas se parecen. Mueve n hacia la derecha (o pulsa ▶) y mira qué pasa."
        : activas.has(5) && n >= 12
          ? `Con 2ⁿ en la gráfica todo lo demás parece pegado al piso: con n = ${n} son ${grande(Math.pow(2, n))} pasos. Apágala para ver al resto.`
          : `Con n = ${n}: n² ya da ${grande(cuad)} pasos, ${formato(cuad / n)} veces más que n, y log n apenas ${formato(log2(n))}. Cuanto más crece n, más se separan.`;
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
    const deslizador = el("input", { type: "range", min: 0, max: 100, step: 1, "aria-label": "Tamaño de la entrada n" });
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
        el("p", { class: "fila-titulo", text: "f(n) = 3n² + 5n + 20: ¿cuánto aporta cada término?" }),
        el("div", { class: "barra-terminos", role: "img", "aria-label": "Parte de f(n) que aporta cada término" }, segmentos),
        detalle, razon,
        el("p", { class: "fila-titulo", text: "Algoritmo A: 100·n pasos. Algoritmo B: n² pasos. ¿Cuál es más rápido?" }),
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
      razon.textContent = `f(${formato(n)}) = ${grande(total)}. Dividido entre n² da ${formato(total / (n * n))}: ${n < 20
        ? "con n chico, 5n y 20 todavía pesan."
        : "se acerca a 3. Los términos chicos desaparecen y el 3 no cambia la forma: f(n) es O(n²)."}`;
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
        ? `Con n = ${formato(n)}, B (n²) hace menos pasos: la constante 100 le pesa a A. Pero sigue moviendo n…`
        : n === 100
          ? "Con n = 100 empatan: 10 000 pasos cada uno. Desde aquí, A gana siempre."
          : `Con n = ${formato(n)}, A (O(n)) gana: B hace ${formato(b / a)} veces más pasos, y la diferencia crece sin parar. Por eso Big-O mira qué pasa cuando n es grande.`;
    }

    deslizador.addEventListener("input", pintar);
    pintar();
  }

  if (typeof document !== "undefined") {
    montarCarrera();
    montarReglas();
  }
})();
