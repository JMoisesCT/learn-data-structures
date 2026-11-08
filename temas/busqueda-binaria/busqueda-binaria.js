// Lección de búsqueda binaria, en pasos. Los fragmentos de código deben
// coincidir línea por línea con ejemplos/cpp/busqueda_binaria.cpp
// (scripts/verificar-fragmentos.mjs lo revisa).
(function () {
  const { el } = DS;
  const CELDA = 38;
  const PASO = 44;
  const MARGEN = 10;
  const Y_CELDAS = 30; // arriba, la marca de medio; abajo, índices, izq/der y desde/hasta
  const INT_MAX = 2147483647;
  const INT_MIN = -2147483648;

  // ------------------------------------------------------------------
  // Fragmentos de C++ (copiados de ejemplos/cpp/busqueda_binaria.cpp)
  // ------------------------------------------------------------------

  const CODIGO = {
    busquedaBinaria: `
      int busquedaBinaria(const std::vector<int>& v, int objetivo) {
          int izq = 0;
          int der = static_cast<int>(v.size()) - 1;
          while (izq <= der) {
              int medio = izq + (der - izq) / 2;
              if (v[medio] == objetivo) {
                  return medio;
              }
              if (v[medio] < objetivo) {
                  izq = medio + 1;
              } else {
                  der = medio - 1;
              }
          }
          return -1;
      }`,
    busquedaRecursiva: `
      int busquedaRecursiva(const std::vector<int>& v, int objetivo, int izq, int der) {
          if (izq > der) {
              return -1;
          }
          int medio = izq + (der - izq) / 2;
          if (v[medio] == objetivo) {
              return medio;
          }
          if (v[medio] < objetivo) {
              return busquedaRecursiva(v, objetivo, medio + 1, der);
          }
          return busquedaRecursiva(v, objetivo, izq, medio - 1);
      }`,
    lowerBound: `
      int lowerBound(const std::vector<int>& v, int x) {
          int izq = 0;
          int der = static_cast<int>(v.size());
          while (izq < der) {
              int medio = izq + (der - izq) / 2;
              if (v[medio] < x) {
                  izq = medio + 1;
              } else {
                  der = medio;
              }
          }
          return izq;
      }`,
    upperBound: `
      int upperBound(const std::vector<int>& v, int x) {
          int izq = 0;
          int der = static_cast<int>(v.size());
          while (izq < der) {
              int medio = izq + (der - izq) / 2;
              if (v[medio] <= x) {
                  izq = medio + 1;
              } else {
                  der = medio;
              }
          }
          return izq;
      }`,
    contarApariciones: `
      int contarApariciones(const std::vector<int>& v, int x) {
          int desde = lowerBound(v, x);
          int hasta = upperBound(v, x);
          return hasta - desde;
      }`,
    raizEntera: `
      int raizEntera(int n) {
          if (n < 0) {
              throw std::invalid_argument("n negativo");
          }
          long long izq = 0;
          long long der = n;
          int respuesta = 0;
          while (izq <= der) {
              long long medio = izq + (der - izq) / 2;
              if (medio * medio <= n) {
                  respuesta = static_cast<int>(medio);
                  izq = medio + 1;
              } else {
                  der = medio - 1;
              }
          }
          return respuesta;
      }`,
  };

  const fragmentos = (claves) => Object.fromEntries(claves.map((c) => [c, CODIGO[c]]));
  const entre = (a, b) => Array.from({ length: Math.max(0, b - a + 1) }, (_, k) => a + k);
  const plural = (k, uno, varios) => `${k} ${k === 1 ? uno : varios}`;

  // ------------------------------------------------------------------
  // Datos de los ejemplos (los mismos que main() en el .cpp)
  // ------------------------------------------------------------------

  const ARREGLOS = {
    ordenado: [3, 8, 12, 15, 21, 27, 30, 34, 40, 46, 51, 57, 63, 70, 88],
    recursivo: [4, 9, 13, 18, 22, 27, 35, 41, 50, 56, 62],
    desordenado: [8, 3, 15, 1, 22, 9, 30, 4, 17, 12, 27],
    reordenado: [1, 3, 4, 8, 9, 12, 15, 17, 22, 27, 30],
    repetidos: [2, 4, 4, 4, 7, 9, 9, 12, 15],
    muchos: [1, 3, 3, 3, 3, 6, 8, 8, 10, 14, 14, 19],
  };

  // ------------------------------------------------------------------
  // Estado: el arreglo (cada valor es una ficha con id) y lo que se
  // resalta en cada paso (s.vis). s.persiste se suma a cada foto: las
  // marcas desde/hasta de contarApariciones sobreviven a las llamadas.
  // ------------------------------------------------------------------

  function estadoArreglo(valores, opciones) {
    return Object.assign({
      modo: "arreglo",
      v: valores.map((x, i) => ({ id: `c${i}`, v: x })),
      marcos: null,
      persiste: null,
      fin: false,
      vis: {},
    }, opciones);
  }

  function foto(s, extra) {
    s.vis = Object.assign({}, s.persiste, extra);
  }

  const valoresDe = (s) => s.v.map((c) => c.v);

  // Comparación que se muestra arriba: "v[7] = 34  <  63  sí".
  const cmp = (a, op, b, si) => ({ a, op, b: String(b), si });

  // ------------------------------------------------------------------
  // busquedaBinaria (iterativa)
  // ------------------------------------------------------------------

  function animarIterativa(s, objetivo, paso) {
    const v = valoresDe(s);
    const n = v.length;
    const k = "busquedaBinaria";
    let izq = 0;
    let der = n - 1;
    let vueltas = 0;
    const vars = (extra) => Object.assign({ objetivo, izq, der }, extra);

    foto(s, { vars: { objetivo, izq }, cambio: ["izq"], izq });
    paso(k, 2, `izq = 0: si el ${objetivo} está, está de aquí en adelante.`);
    foto(s, { vars: vars(), cambio: ["der"], izq, der, rango: [izq, der] });
    paso(k, 3, n
      ? `der = ${der}: al principio los ${n} son candidatos (el recuadro). Están ordenados: eso es lo que vamos a aprovechar.`
      : "der = −1: el arreglo está vacío.");

    for (;;) {
      if (izq > der) {
        foto(s, { vars: vars(), izq, der, rango: [izq, der], error: true });
        paso(k, 4, `izq = ${izq} > der = ${der}: se cruzaron. No queda ningún candidato.`);
        break;
      }
      foto(s, { vars: vars(), izq, der, rango: [izq, der] });
      paso(k, 4, `izq ≤ der: ${plural(der - izq + 1, "candidato", "candidatos")} todavía.`);
      const medio = izq + Math.floor((der - izq) / 2);
      vueltas++;
      foto(s, { vars: vars({ medio }), cambio: ["medio"], izq, der, medio, rango: [izq, der] });
      paso(k, 5, `medio = ${izq} + (${der} − ${izq}) / 2 = ${medio}: el del centro de los candidatos.`);
      const x = v[medio];
      const base = { vars: vars({ medio }), izq, der, medio, rango: [izq, der], leida: medio };
      foto(s, Object.assign({}, base, { cmp: cmp(`v[${medio}] = ${x}`, "==", objetivo, x === objetivo) }));
      if (x === objetivo) {
        paso(k, 6, `v[${medio}] = ${x}: ¡es el objetivo!`);
        foto(s, Object.assign({}, base, { leida: null, encontrada: medio, devuelve: medio }));
        paso(k, 7, `return ${medio}. ${plural(vueltas, "comparación", "comparaciones")} entre ${n} elementos: cada una partió los candidatos a la mitad.`, "exito");
        return medio;
      }
      paso(k, 6, `v[${medio}] = ${x}: no es el ${objetivo}.`);
      const derecha = x < objetivo;
      foto(s, Object.assign({}, base, {
        cmp: cmp(`v[${medio}] = ${x}`, "<", objetivo, derecha),
        condenadas: derecha ? entre(izq, medio) : entre(medio, der),
      }));
      paso(k, 9, derecha
        ? `${x} < ${objetivo}: v[medio] y todo lo que está a su izquierda es todavía más chico. Esa mitad no puede tenerlo.`
        : `${x} > ${objetivo}: v[medio] y todo lo que está a su derecha es todavía más grande. Esa mitad sobra.`);
      const descartados = derecha ? medio - izq + 1 : der - medio + 1;
      if (derecha) izq = medio + 1;
      else der = medio - 1;
      foto(s, { vars: vars({ medio }), cambio: [derecha ? "izq" : "der"], izq, der, medio, rango: [izq, der] });
      paso(k, derecha ? 10 : 12, `${derecha ? `izq = medio + 1 = ${izq}` : `der = medio − 1 = ${der}`}: descartamos ${descartados} de golpe, sin mirarlos uno por uno.`);
    }
    const perdida = v.indexOf(objetivo);
    foto(s, { vars: vars(), izq, der, rango: [izq, der], devuelve: -1, perdida: perdida >= 0 ? perdida : null });
    paso(k, 15, perdida >= 0
      ? `return -1… ¡pero el ${objetivo} estaba en la posición ${perdida}! El arreglo no estaba ordenado y descartamos la mitad que lo tenía.`
      : `return -1: el ${objetivo} no está. Bastaron ${plural(vueltas, "comparación", "comparaciones")} para saberlo, sin mirar los ${n}.`, "error");
    return -1;
  }

  // ------------------------------------------------------------------
  // busquedaRecursiva: cada llamada es un marco en la pila, con su
  // propio izq y der. s.vis.nivel le dice al motor la profundidad.
  // ------------------------------------------------------------------

  function animarRecursiva(s, objetivo, paso) {
    const v = valoresDe(s);
    const n = v.length;
    const k = "busquedaRecursiva";
    s.marcos = [];
    let final = {};

    function llamar(izq, der, nivel) {
      for (const m of s.marcos) m.estado = "espera";
      const marco = { izq, der, objetivo, estado: "activo" };
      s.marcos.push(marco);
      const base = { vars: { objetivo, izq, der }, izq, der, rango: [izq, der], nivel };
      if (izq > der) {
        foto(s, Object.assign({}, base, { error: true }));
        paso(k, 2, `Llamada ${nivel}: izq = ${izq} > der = ${der}, no queda nadie. Es el caso base.`);
        marco.estado = "devuelve";
        marco.valor = -1;
        final = { rango: [izq, der] };
        foto(s, Object.assign({}, base, final));
        paso(k, 3, `return -1: el ${objetivo} no está. Ahora cada llamada que espera recibe ese -1.`, nivel === 1 ? "error" : "");
        return -1;
      }
      foto(s, base);
      paso(k, 2, `Llamada ${nivel}: ¿izq > der? No: quedan ${der - izq + 1}.`);
      const medio = izq + Math.floor((der - izq) / 2);
      const conMedio = Object.assign({}, base, { vars: { objetivo, izq, der, medio }, medio });
      foto(s, Object.assign({}, conMedio, { cambio: ["medio"] }));
      paso(k, 5, `medio = ${izq} + (${der} − ${izq}) / 2 = ${medio}.`);
      const x = v[medio];
      foto(s, Object.assign({}, conMedio, { leida: medio, cmp: cmp(`v[${medio}] = ${x}`, "==", objetivo, x === objetivo) }));
      if (x === objetivo) {
        paso(k, 6, `v[${medio}] = ${x}: ¡es el objetivo!`);
        marco.estado = "devuelve";
        marco.valor = medio;
        final = { rango: [izq, der], encontrada: medio };
        foto(s, Object.assign({}, conMedio, final));
        paso(k, 7, `return ${medio}: el otro caso base. ${nivel > 1 ? "Ahora el resultado sube por las llamadas que esperan." : ""}`, nivel === 1 ? "exito" : "");
        return medio;
      }
      paso(k, 6, `v[${medio}] = ${x}: no es el ${objetivo}.`);
      const derecha = x < objetivo;
      foto(s, Object.assign({}, conMedio, {
        leida: medio,
        cmp: cmp(`v[${medio}] = ${x}`, "<", objetivo, derecha),
        condenadas: derecha ? entre(izq, medio) : entre(medio, der),
      }));
      paso(k, 9, derecha
        ? `${x} < ${objetivo}: la mitad izquierda (con medio) sobra.`
        : `${x} > ${objetivo}: la mitad derecha (con medio) sobra.`);
      const nIzq = derecha ? medio + 1 : izq;
      const nDer = derecha ? der : medio - 1;
      const linea = derecha ? 10 : 12;
      foto(s, Object.assign({}, conMedio, { rango: [nIzq, nDer] }));
      paso(k, linea, `Se llama a sí misma con izq = ${nIzq} y der = ${nDer}. Esta llamada queda esperando en la pila.`);
      const r = llamar(nIzq, nDer, nivel + 1);
      s.marcos.pop();
      marco.estado = "devuelve";
      marco.valor = r;
      foto(s, Object.assign({}, base, final, { vars: { objetivo, izq, der }, devuelve: nivel === 1 ? r : null }));
      paso(k, linea, nivel === 1
        ? `return ${r}: la primera llamada devuelve lo que le llegó. Hubo ${plural(s.profundidad, "marco", "marcos")} en la pila a la vez: O(log n) de memoria.`
        : `Llamada ${nivel}: recibe ${r} y lo devuelve tal cual. No le queda nada por hacer (recursión de cola).`,
      nivel === 1 ? (r >= 0 ? "exito" : "error") : "");
      return r;
    }

    s.profundidad = 0;
    // Primero se cuenta la profundidad (para el mensaje final), sin animar.
    (function contar(izq, der, p) {
      s.profundidad = Math.max(s.profundidad, p);
      if (izq > der) return;
      const medio = izq + Math.floor((der - izq) / 2);
      if (v[medio] === objetivo) return;
      if (v[medio] < objetivo) contar(medio + 1, der, p + 1);
      else contar(izq, medio - 1, p + 1);
    })(0, n - 1, 1);

    const r = llamar(0, n - 1, 1);
    s.marcos = null;
    return r;
  }

  // ------------------------------------------------------------------
  // lowerBound / upperBound: la respuesta está entre izq y der (der
  // incluida, puede ser v.size()). Se termina cuando queda una sola.
  // ------------------------------------------------------------------

  function animarLimite(s, x, paso, tipo, dentroDeOtra) {
    const v = valoresDe(s);
    const n = v.length;
    const k = tipo;
    const inferior = tipo === "lowerBound";
    const op = inferior ? "<" : "≤";
    const busca = inferior ? `la primera posición con v[i] ≥ ${x}` : `la primera posición con v[i] > ${x}`;
    let izq = 0;
    let der = n;
    const vars = (extra) => Object.assign({ x, izq }, extra);

    foto(s, { vars: vars(), cambio: ["izq"], izq });
    paso(k, 2, `Buscamos ${busca}. izq = 0.`);
    foto(s, { vars: vars({ der }), cambio: ["der"], izq, der, rango: [izq, der] });
    paso(k, 3, `der = v.size() = ${n}: la respuesta puede ser "ninguna" (el final). Hay ${n + 1} candidatas, de 0 a ${n}.`);
    for (;;) {
      if (izq >= der) {
        foto(s, { vars: vars({ der }), izq, der, rango: [izq, der] });
        paso(k, 4, `izq = der = ${izq}: queda una sola candidata. Esa es la respuesta.`);
        break;
      }
      foto(s, { vars: vars({ der }), izq, der, rango: [izq, der] });
      paso(k, 4, `izq < der: quedan ${der - izq + 1} candidatas, de ${izq} a ${der}.`);
      const medio = izq + Math.floor((der - izq) / 2);
      foto(s, { vars: vars({ der, medio }), cambio: ["medio"], izq, der, medio, rango: [izq, der] });
      paso(k, 5, `medio = ${izq} + (${der} − ${izq}) / 2 = ${medio}.`);
      const si = inferior ? v[medio] < x : v[medio] <= x;
      foto(s, {
        vars: vars({ der, medio }), izq, der, medio, rango: [izq, der], leida: medio,
        cmp: cmp(`v[${medio}] = ${v[medio]}`, op, x, si),
        condenadas: si ? entre(izq, medio) : entre(medio + 1, der),
      });
      paso(k, 6, si
        ? `${v[medio]} ${op} ${x}: v[medio] y lo que está a su izquierda quedan antes de la respuesta.`
        : `${v[medio]} ${inferior ? "≥" : ">"} ${x}: medio podría ser la respuesta; lo que está a su derecha, ya no.`);
      if (si) {
        izq = medio + 1;
        foto(s, { vars: vars({ der, medio }), cambio: ["izq"], izq, der, medio, rango: [izq, der] });
        paso(k, 7, `izq = medio + 1 = ${izq}.`);
      } else {
        der = medio;
        foto(s, { vars: vars({ der, medio }), cambio: ["der"], izq, der, medio, rango: [izq, der] });
        paso(k, 9, `der = medio = ${der}: medio sigue siendo candidata${v[medio] === x ? ` (aunque ya vimos un ${x}, puede haber otro más a la izquierda)` : ""}.`);
      }
    }
    foto(s, { vars: vars({ der }), izq, der, rango: [izq, der], encontrada: izq, devuelve: izq });
    paso(k, 12, `return ${izq}: ${izq < n ? `v[${izq}] = ${v[izq]} es ${busca.replace("la primera posición con v[i]", "la primera")}` : `ninguna cumple, así que devuelve el final (v.size())`}.`
      + (inferior && !dentroDeOtra ? ` Es donde iría el ${x} para que v siga ordenado.` : ""), dentroDeOtra ? "" : "exito");
    return izq;
  }

  function animarContar(s, x, paso) {
    const k = "contarApariciones";
    s.persiste = null;
    foto(s, { vars: { x } });
    paso(k, 2, `desde = lowerBound(v, ${x}): la primera copia del ${x} (o donde iría).`);
    const desde = animarLimite(s, x, paso, "lowerBound", true);
    s.persiste = { fijas: { desde } };
    foto(s, { vars: { x, desde }, cambio: ["desde"] });
    paso(k, 2, `desde = ${desde}.`);
    paso(k, 3, `hasta = upperBound(v, ${x}): la primera posición después de las copias.`);
    const hasta = animarLimite(s, x, paso, "upperBound", true);
    s.persiste = { fijas: { desde, hasta } };
    foto(s, { vars: { x, desde, hasta }, cambio: ["hasta"] });
    paso(k, 3, `hasta = ${hasta}.`);
    const c = hasta - desde;
    foto(s, { vars: { x, desde, hasta }, tramo: [desde, hasta], devuelve: c });
    paso(k, 4, `return ${hasta} − ${desde} = ${c}: ${c
      ? `las copias del ${x} ocupan de ${desde} a ${hasta - 1}. Ni las miramos una por una: O(log n) aunque fueran un millón.`
      : `el ${x} no aparece; los dos límites coinciden donde iría.`}`, c ? "exito" : "error");
    s.persiste = null;
    return c;
  }

  // ------------------------------------------------------------------
  // raizEntera: búsqueda sobre la respuesta, en una recta de 0 a n
  // ------------------------------------------------------------------

  function estadoRaiz(n) {
    return { modo: "raiz", n, vis: {} };
  }

  function animarRaiz(s, n, paso) {
    const k = "raizEntera";
    s.n = n;
    foto(s, { vars: { n } });
    if (n < 0) {
      foto(s, { vars: { n }, error: true });
      paso(k, 2, `n = ${n} < 0: un número negativo no tiene raíz entera.`);
      paso(k, 3, "throw std::invalid_argument(\"n negativo\").", "error");
      return null;
    }
    paso(k, 2, `n = ${n} no es negativo: seguimos.`);
    let izq = 0;
    let der = n;
    let respuesta = 0;
    const vars = (extra) => Object.assign({ n, izq, der, respuesta }, extra);
    foto(s, { vars: { n, izq }, cambio: ["izq"], izq });
    paso(k, 5, "izq = 0: la raíz es al menos 0.");
    foto(s, { vars: { n, izq, der }, cambio: ["der"], izq, der });
    paso(k, 6, `der = ${n}: y a lo más ${n}. Los candidatos son los números de 0 a ${n}.`);
    foto(s, { vars: vars(), cambio: ["respuesta"], izq, der, respuesta });
    paso(k, 7, "respuesta = 0: el mayor \"sí\" que conocemos por ahora.");
    let vueltas = 0;
    for (;;) {
      if (izq > der) {
        foto(s, { vars: vars(), izq, der, respuesta, cruzados: true });
        paso(k, 8, `izq = ${izq} > der = ${der}: no quedan candidatos sin revisar.`);
        break;
      }
      foto(s, { vars: vars(), izq, der, respuesta });
      paso(k, 8, `izq ≤ der: quedan ${der - izq + 1} candidatos.`);
      const medio = izq + Math.floor((der - izq) / 2);
      vueltas++;
      foto(s, { vars: vars({ medio }), cambio: ["medio"], izq, der, medio, respuesta });
      paso(k, 9, `medio = ${izq} + (${der} − ${izq}) / 2 = ${medio}.`);
      const cuadrado = medio * medio;
      const si = cuadrado <= n;
      foto(s, { vars: vars({ medio }), izq, der, medio, respuesta, cmp: cmp(`${medio} · ${medio} = ${cuadrado}`, "≤", n, si), condena: si ? "izq" : "der" });
      paso(k, 10, si
        ? `${medio}² = ${cuadrado} ≤ ${n}: sí. ${medio} sirve, y todos los menores también sirven: no hace falta probarlos.`
        : `${medio}² = ${cuadrado} > ${n}: no. Y cualquier número mayor tampoco sirve.`);
      if (si) {
        respuesta = medio;
        foto(s, { vars: vars({ medio }), cambio: ["respuesta"], izq, der, medio, respuesta, nueva: true });
        paso(k, 11, `respuesta = ${medio}: el mejor "sí" hasta ahora. ¿Habrá uno mayor?`);
        izq = medio + 1;
        foto(s, { vars: vars({ medio }), cambio: ["izq"], izq, der, medio, respuesta });
        paso(k, 12, `izq = ${izq}: buscamos solo entre los mayores.`);
      } else {
        der = medio - 1;
        foto(s, { vars: vars({ medio }), cambio: ["der"], izq, der, medio, respuesta });
        paso(k, 14, `der = ${der}: descartamos ${medio} y todos los mayores.`);
      }
    }
    foto(s, { vars: vars(), izq, der, respuesta, cruzados: true, devuelve: respuesta });
    paso(k, 17, `return ${respuesta}: ${respuesta}² = ${respuesta * respuesta} ≤ ${n} < ${(respuesta + 1) * (respuesta + 1)} = ${respuesta + 1}². ${plural(vueltas, "vuelta", "vueltas")} entre ${plural(n + 1, "candidato", "candidatos")}.`, "exito");
    return respuesta;
  }

  // ------------------------------------------------------------------
  // Operaciones
  // ------------------------------------------------------------------

  const OPS = {
    busquedaBinaria: {
      etiqueta: "busquedaBinaria(v, objetivo)",
      usa: ["objetivo"],
      codigo: "busquedaBinaria",
      fragmentos: ["busquedaBinaria"],
      ejecutar: (s, { objetivo }, paso) => { animarIterativa(s, objetivo, paso); },
    },
    busquedaRecursiva: {
      etiqueta: "busquedaRecursiva(v, objetivo, 0, n − 1)",
      usa: ["objetivo"],
      codigo: "busquedaRecursiva",
      fragmentos: ["busquedaRecursiva"],
      ejecutar: (s, { objetivo }, paso) => { animarRecursiva(s, objetivo, paso); },
    },
    lowerBound: {
      etiqueta: "lowerBound(v, x)",
      usa: ["objetivo"],
      codigo: "lowerBound",
      fragmentos: ["lowerBound"],
      ejecutar: (s, { objetivo }, paso) => { animarLimite(s, objetivo, paso, "lowerBound", false); },
    },
    upperBound: {
      etiqueta: "upperBound(v, x)",
      usa: ["objetivo"],
      codigo: "upperBound",
      fragmentos: ["upperBound"],
      ejecutar: (s, { objetivo }, paso) => { animarLimite(s, objetivo, paso, "upperBound", false); },
    },
    contarApariciones: {
      etiqueta: "contarApariciones(v, x)",
      usa: ["objetivo"],
      codigo: "contarApariciones",
      fragmentos: ["contarApariciones", "lowerBound", "upperBound"],
      ejecutar: (s, { objetivo }, paso) => { animarContar(s, objetivo, paso); },
    },
    raizEntera: {
      etiqueta: "raizEntera(n)",
      usa: ["n"],
      codigo: "raizEntera",
      fragmentos: ["raizEntera"],
      ejecutar: (s, { n }, paso) => { animarRaiz(s, n, paso); },
    },
  };

  // ------------------------------------------------------------------
  // Dibujo
  // ------------------------------------------------------------------

  const xDe = (i) => MARGEN + (i + 1) * PASO; // la columna 0 es la casilla fantasma −1

  if (typeof window !== "undefined") {
    window.addEventListener("resize", () => {
      for (const lienzo of document.querySelectorAll(".bb-lienzo")) escalar(lienzo.closest(".escenario"), lienzo);
      for (const lienzo of document.querySelectorAll(".bb-recta-lienzo")) anchoRecta(lienzo.closest(".escenario"), lienzo);
    });
  }

  // En pantallas angostas el dibujo se reduce; si aun así no cabe, el escenario hace scroll.
  function escalar(escenario, lienzo) {
    if (!escenario || !escenario.clientWidth) return; // paso oculto: se mide al mostrarlo
    const ancho = Number(lienzo.dataset.ancho);
    const alto = Number(lienzo.dataset.alto);
    const k = Math.max(0.55, Math.min(1, (escenario.clientWidth - 32) / ancho));
    lienzo.style.transform = k < 1 ? `scale(${k})` : "";
    const marco = lienzo.parentElement;
    marco.style.width = `${ancho * k}px`;
    marco.style.height = `${alto * k}px`;
  }

  // Lo que sale del dibujo se desvanece en lugar de desaparecer de golpe.
  function retirar(nodo) {
    // Un marco de la pila está en el flujo: mientras se desvanece, sale del flujo
    // en el mismo lugar, para no empujar lo que sigue.
    if (nodo.classList.contains("bb-pila-marco")) {
      const { offsetTop: arriba, offsetLeft: izquierda, offsetWidth: ancho } = nodo;
      Object.assign(nodo.style, { position: "absolute", top: `${arriba}px`, left: `${izquierda}px`, width: `${ancho}px`, marginLeft: "0" });
    }
    nodo.removeAttribute("data-k");
    nodo.classList.add("saliendo");
    setTimeout(() => nodo.remove(), 400);
  }

  // Reutiliza los nodos por clave para que se deslicen entre pasos.
  function capa(padre) {
    const vivas = new Set();
    return {
      pieza(clave, crear) {
        let nodo = padre.querySelector(`:scope > [data-k="${clave}"]`);
        let nuevo = false;
        if (!nodo) {
          nodo = crear();
          nodo.dataset.k = clave;
          padre.append(nodo);
          nuevo = true;
        }
        vivas.add(clave);
        return { nodo, nuevo };
      },
      fin() {
        for (const nodo of padre.querySelectorAll(":scope > [data-k]")) if (!vivas.has(nodo.dataset.k)) retirar(nodo);
      },
    };
  }

  function sacudir(nodo, si) {
    nodo.classList.remove("sacudir");
    if (si) {
      void nodo.offsetWidth; // reinicia la animación
      nodo.classList.add("sacudir");
    }
  }

  // Fila de arriba: variables, la comparación del paso y el valor devuelto.
  function dibujarInfo(info, vis) {
    const piezas = [DS.variables(vis.vars || {}, vis.cambio)];
    if (vis.cmp) {
      const c = vis.cmp;
      const clave = `${c.a}|${c.op}|${c.b}`;
      const viejo = info.querySelector(".bb-cmp");
      const pill = viejo && viejo.dataset.clave === clave ? viejo : el("div", { class: "bb-cmp", "data-clave": clave },
        el("code", { text: c.a }), el("b", { text: c.op }), el("code", { text: c.b }), el("span", { class: "bb-cmp-r", text: c.si ? "sí" : "no" }));
      pill.className = `bb-cmp ${c.si ? "si" : "no"}${pill === viejo ? "" : " entra"}`;
      piezas.push(pill);
    }
    if (vis.devuelve != null) {
      const viejo = info.querySelector(".salida-valor");
      piezas.push(viejo && viejo.dataset.valor === String(vis.devuelve) ? viejo
        : el("div", { class: "salida-valor", "data-valor": vis.devuelve }, "devuelve",
          el("div", { class: `celda ${vis.devuelve === -1 ? "error" : "encontrada"}`, text: vis.devuelve })));
    }
    info.replaceChildren(...piezas);
  }

  function crearArreglo(escenario) {
    const lienzo = el("div", { class: "bb-lienzo" },
      el("div", { class: "bb-fondo" }), el("div", { class: "bb-fichas" }), el("div", { class: "bb-marcas" }));
    escenario.append(el("div", { class: "bb-info", "data-alto-estable": true }), el("div", { class: "bb-marco-lienzo" }, lienzo), el("div", { class: "bb-marcos" }));
    return lienzo;
  }

  function dibujarArreglo(escenario, s, real) {
    const lienzo = escenario.querySelector(".bb-lienzo") || crearArreglo(escenario);
    const vis = s.vis || {};
    const n = s.v.length;
    const ancho = 2 * MARGEN + (n + 2) * PASO - (PASO - CELDA);
    // La fila de desde/hasta solo hace falta en contarApariciones.
    const alto = s.vis && s.vis.fijas ? 140 : 116;
    lienzo.style.width = `${ancho}px`;
    lienzo.style.height = `${alto}px`;
    lienzo.dataset.ancho = ancho;
    lienzo.dataset.alto = alto;
    escalar(real, lienzo);
    dibujarInfo(escenario.querySelector(".bb-info"), vis);
    sacudir(lienzo, !!vis.error);

    const rango = vis.rango;
    const dentro = (i) => !rango || (i >= rango[0] && i <= rango[1]);
    const condenadas = new Set(vis.condenadas || []);
    const fijas = vis.fijas || {};

    // Fondo: el recuadro de candidatos, el tramo de copias y las casillas fantasma −1 y n.
    const fondo = capa(lienzo.querySelector(".bb-fondo"));
    if (rango) {
      const [a, b] = rango;
      const { nodo } = fondo.pieza("rango", () => el("div", { class: "bb-rango" }));
      const izqX = xDe(a) - 5;
      const derX = b >= a ? xDe(b) + CELDA + 5 : izqX + 0;
      nodo.style.left = `${b >= a ? izqX : xDe(a) - (PASO - CELDA) / 2 - 2}px`;
      nodo.style.width = `${Math.max(4, derX - izqX)}px`;
      nodo.classList.toggle("vacio", b < a);
      nodo.classList.toggle("unico", b === a);
    }
    if (vis.tramo) {
      const [a, b] = vis.tramo;
      const { nodo } = fondo.pieza("tramo", () => el("div", { class: "bb-tramo" }));
      nodo.style.left = `${b > a ? xDe(a) - 5 : xDe(a) - (PASO - CELDA) / 2 - 2}px`;
      nodo.style.width = `${b > a ? xDe(b - 1) + CELDA + 10 - xDe(a) : 4}px`;
    }
    const usados = [vis.izq, vis.der, vis.medio, vis.encontrada, fijas.desde, fijas.hasta];
    for (const i of [-1, n]) {
      const visible = (i === n && s.fin) || usados.includes(i) || (rango && rango[0] <= i && i <= rango[1]);
      if (!visible) continue;
      const { nodo } = fondo.pieza(`f${i}`, () => el("div", { class: "bb-fantasma" }, el("span", { text: i === n ? "fin" : "" })));
      nodo.style.left = `${xDe(i)}px`;
      nodo.style.top = `${Y_CELDAS}px`;
      let clase = "bb-fantasma";
      if (vis.encontrada === i) clase += " elegida";
      else if (condenadas.has(i)) clase += " condenada";
      else if (rango && !dentro(i)) clase += " descartada";
      nodo.className = clase;
    }
    // Índices.
    for (let i = 0; i < n; i++) {
      const { nodo } = fondo.pieza(`i${i}`, () => el("span", { class: "indice bb-indice", text: i }));
      nodo.style.left = `${xDe(i)}px`;
    }
    for (const i of [-1, n]) {
      if (!lienzo.querySelector(`.bb-fondo > [data-k="f${i}"]:not(.saliendo)`)) continue;
      const { nodo } = fondo.pieza(`i${i}`, () => el("span", { class: "indice bb-indice fuera", text: i }));
      nodo.style.left = `${xDe(i)}px`;
    }
    fondo.fin();

    // Fichas: cada valor en su casilla. El del medio se levanta al compararlo.
    const fichas = capa(lienzo.querySelector(".bb-fichas"));
    s.v.forEach((c, i) => {
      const { nodo } = fichas.pieza(c.id, () => el("div", { class: "bb-ficha", text: c.v }));
      nodo.textContent = c.v;
      nodo.style.left = `${xDe(i)}px`;
      nodo.style.top = `${Y_CELDAS}px`;
      let clase = "bb-ficha";
      if (vis.encontrada === i) clase += " encontrada";
      else if (vis.perdida === i) clase += " perdida";
      else if (vis.leida === i) clase += " leida";
      if (condenadas.has(i)) clase += " condenada";
      else if (rango && !dentro(i) && vis.encontrada !== i && vis.perdida !== i) clase += " descartada";
      if (vis.tramo && i >= vis.tramo[0] && i < vis.tramo[1]) clase += " en-tramo";
      nodo.className = clase;
    });
    fichas.fin();

    // Marcas: medio arriba; izq y der abajo (si coinciden, una a cada lado); desde y hasta más abajo.
    const marcas = capa(lienzo.querySelector(".bb-marcas"));
    const centro = (i) => xDe(i) + CELDA / 2;
    const marca = (clave, i, texto, clase, top, dx) => {
      const { nodo } = marcas.pieza(clave, () => el("span", { class: `bb-marca ${clase}` }));
      nodo.textContent = texto;
      nodo.style.left = `${centro(i) + (dx || 0)}px`;
      nodo.style.top = `${top}px`;
    };
    if (vis.medio != null) marca("medio", vis.medio, "medio\n▼", "medio", 0);
    if (vis.perdida != null) marca("perdida", vis.perdida, "¡estaba aquí!\n▼", "perdida", 0);
    const juntos = vis.izq != null && vis.izq === vis.der;
    if (vis.izq != null) marca("izq", vis.izq, "▲\nizq", "izq", Y_CELDAS + CELDA + 20, juntos ? -13 : 0);
    if (vis.der != null) marca("der", vis.der, "▲\nder", "der", Y_CELDAS + CELDA + 20, juntos ? 13 : 0);
    if (fijas.desde != null) marca("desde", fijas.desde, "desde", "fija", Y_CELDAS + CELDA + 50, fijas.desde === fijas.hasta ? -20 : 0);
    if (fijas.hasta != null) marca("hasta", fijas.hasta, "hasta", "fija", Y_CELDAS + CELDA + 50, fijas.desde === fijas.hasta ? 20 : 0);
    marcas.fin();

    dibujarMarcos(escenario.querySelector(".bb-marcos"), s);
  }

  // La pila de llamadas de busquedaRecursiva: un marco por llamada, en escalera,
  // con una barrita que muestra qué parte del arreglo le toca.
  function dibujarMarcos(caja, s) {
    const marcos = s.marcos || [];
    caja.hidden = !s.marcos;
    const n = s.v.length;
    const c = capa(caja);
    marcos.forEach((m, k) => {
      const { nodo, nuevo } = c.pieza(`m${k}`, () => el("div", { class: "bb-pila-marco" },
        el("span", { class: "bb-prof" }), el("code", { class: "bb-llamada" }),
        el("span", { class: "bb-mini" }, el("i")), el("span", { class: "bb-estado" })));
      nodo.style.setProperty("--prof", k);
      nodo.classList.toggle("entra", nuevo);
      nodo.classList.toggle("actual", k === marcos.length - 1);
      nodo.classList.toggle("devuelve", m.estado === "devuelve");
      nodo.children[0].textContent = k + 1;
      nodo.children[1].textContent = `busquedaRecursiva(v, ${m.objetivo}, ${m.izq}, ${m.der})`;
      const barra = nodo.children[2].firstChild;
      const total = Math.max(1, n);
      barra.style.left = `${(Math.min(m.izq, n) / total) * 100}%`;
      barra.style.width = `${(Math.max(0, m.der - m.izq + 1) / total) * 100}%`;
      const estado = nodo.children[3];
      const texto = m.estado === "devuelve" ? `→ devuelve ${m.valor}` : m.estado === "espera" ? "espera…" : "";
      if (estado.textContent !== texto) {
        estado.textContent = texto;
        estado.classList.remove("cambia");
        if (texto) { void estado.offsetWidth; estado.classList.add("cambia"); }
      }
    });
    c.fin();
  }

  // raizEntera: una recta con los candidatos 0…n. A la izquierda de izq,
  // los "sí" (r² ≤ n); a la derecha de der, los "no". Todo en porcentajes
  // del ancho de la recta, así no depende del tamaño de la pantalla.
  function anchoRecta(escenario, lienzo) {
    if (!escenario || !escenario.clientWidth) return;
    lienzo.style.width = `${Math.max(280, Math.min(720, escenario.clientWidth - 40))}px`;
  }

  function dibujarRaiz(escena, s, escenario) {
    let lienzo = escena.querySelector(".bb-recta-lienzo");
    if (!lienzo) {
      lienzo = el("div", { class: "bb-recta-lienzo" },
        el("div", { class: "bb-pista" }, el("div", { class: "bb-si" }), el("div", { class: "bb-cand" }), el("div", { class: "bb-no" }), el("div", { class: "bb-previa" })),
        el("div", { class: "bb-marcas" }));
      escena.append(el("div", { class: "bb-info", "data-alto-estable": true }), lienzo,
        el("div", { class: "bb-leyenda" },
          el("span", {}, el("i", { class: "bb-muestra si" }), "sí: r · r ≤ n"),
          el("span", {}, el("i", { class: "bb-muestra cand" }), "sin revisar"),
          el("span", {}, el("i", { class: "bb-muestra no" }), "no: r · r > n"),
          el("span", { class: "bb-zoom" })));
    }
    anchoRecta(escenario, lienzo);
    lienzo.classList.toggle("invalida", s.n < 0);
    const vis = s.vis || {};
    dibujarInfo(escena.querySelector(".bb-info"), vis);
    sacudir(lienzo, !!vis.error);
    const n = Math.max(0, s.n);
    const izq = vis.izq != null ? vis.izq : 0;
    const der = vis.der != null ? vis.der : n;
    const empezo = vis.der != null;
    // La recta hace zoom: muestra los candidatos que quedan y un poco a cada lado.
    // Todo se mide en % de esa ventana, así que al cambiarla todo se desliza.
    const tamano = Math.max(1, der - izq + 1);
    const margen = Math.ceil(tamano / 2) + 2;
    const desde = empezo ? Math.max(0, Math.min(izq, der) - margen) : 0;
    const hasta = empezo ? Math.min(n, Math.max(izq, der) + margen) : n;
    const ancho = hasta - desde + 1;
    const pct = (val) => (Math.max(0, Math.min(ancho, val - desde)) / ancho) * 100;
    const tramo = (nodo, a, b) => {
      nodo.style.left = `${pct(a)}%`;
      nodo.style.width = `${Math.max(0, pct(b) - pct(a))}%`;
    };
    const [si, cand, no, previa] = lienzo.querySelector(".bb-pista").children;
    tramo(si, desde, empezo ? izq : desde);
    tramo(cand, izq, empezo ? Math.max(izq, der + 1) : n + 1);
    tramo(no, empezo ? der + 1 : n + 1, n + 1);
    lienzo.querySelector(".bb-pista").classList.toggle("recortada-izq", desde > 0);
    lienzo.querySelector(".bb-pista").classList.toggle("recortada-der", hasta < n);
    const zoom = (n + 1) / ancho;
    const etiquetaZoom = escena.querySelector(".bb-zoom");
    const textoZoom = zoom >= 1.5 ? `🔍 zoom ×${Math.round(zoom)}` : "";
    if (etiquetaZoom.textContent !== textoZoom) {
      etiquetaZoom.textContent = textoZoom;
      etiquetaZoom.classList.remove("cambia");
      if (textoZoom) { void etiquetaZoom.offsetWidth; etiquetaZoom.classList.add("cambia"); }
    }
    cand.classList.toggle("vacio", empezo && izq > der);
    // Lo que la comparación va a pasar a "sí" o a "no", un paso antes de que pase.
    if (vis.condena && vis.medio != null) {
      if (vis.condena === "izq") tramo(previa, izq, vis.medio + 1);
      else tramo(previa, vis.medio, der + 1);
      previa.className = `bb-previa ${vis.condena === "izq" ? "si" : "no"}`;
    } else {
      previa.className = "bb-previa";
    }

    const marcas = capa(lienzo.querySelector(".bb-marcas"));
    const marca = (clave, val, texto, clase, top) => {
      const { nodo } = marcas.pieza(clave, () => el("span", { class: `bb-marca ${clase}` }));
      nodo.textContent = texto;
      nodo.style.left = `${pct(val + 0.5)}%`;
      nodo.style.top = `${top}px`;
    };
    // Extremos de la ventana que se ve (con … si la recta sigue más allá).
    for (const [clave, val, texto] of [["cero", desde, desde > 0 ? `… ${desde}` : "0"], ["ene", hasta, hasta < n ? `${hasta} …` : `${n}`]]) {
      const { nodo } = marcas.pieza(clave, () => el("span", { class: "bb-tope indice" }));
      nodo.textContent = texto;
      nodo.style.left = `${pct(val + 0.5)}%`;
    }
    if (vis.medio != null) marca("medio", vis.medio, `medio = ${vis.medio}\n▼`, "medio", 0);
    const cerca = vis.izq != null && vis.der != null && Math.abs(pct(vis.izq) - pct(vis.der)) < 16;
    if (vis.izq != null) marca("izq", vis.izq, `▲\nizq = ${vis.izq}`, "izq", 76);
    if (vis.der != null) marca("der", vis.der, `▲\nder = ${vis.der}`, "der", cerca ? 108 : 76);
    if (vis.respuesta != null) {
      marca("resp", vis.respuesta, `respuesta = ${vis.respuesta}`, `resp${vis.nueva ? " nueva" : ""}`, cerca ? 142 : 112);
    }
    marcas.fin();
  }

  function dibujar(escenario, s) {
    const raiz = escenario.firstElementChild;
    if (raiz && raiz.dataset.modo !== s.modo) escenario.replaceChildren();
    if (!escenario.firstElementChild) {
      const contenido = el("div", { class: `bb-escena ${s.modo}`, "data-modo": s.modo });
      escenario.append(contenido);
    }
    const contenido = escenario.firstElementChild;
    if (s.modo === "raiz") dibujarRaiz(contenido, s, escenario);
    else dibujarArreglo(contenido, s, escenario);
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
      codigo: fragmentos(claves),
      mensajeInicial: opciones.mensajeInicial,
      estadoInicial: opciones.estadoInicial,
      entradas: opciones.entradas,
      operaciones: opciones.ops.map((id) => Object.assign({ id }, OPS[id], (opciones.etiquetas || {})[id] ? { etiqueta: opciones.etiquetas[id] } : {})),
    });
  }

  const objetivo = (valor, etiqueta) => ({ id: "objetivo", etiqueta: etiqueta || "Objetivo", min: -99, max: 999, valor });

  // Paso 2: la versión iterativa.
  visualizador("vis-iterativa", {
    ops: ["busquedaBinaria"],
    entradas: [objetivo(63)],
    estadoInicial: () => estadoArreglo(ARREGLOS.ordenado),
    mensajeInicial: "15 números ordenados. Busca el 63: mira cómo el recuadro de candidatos se parte a la mitad en cada vuelta. Después prueba con 20, que no está.",
  });

  // Paso 3: la versión recursiva, con la pila de llamadas.
  visualizador("vis-recursiva", {
    ops: ["busquedaRecursiva"],
    entradas: [objetivo(56)],
    estadoInicial: () => estadoArreglo(ARREGLOS.recursivo, { marcos: null }),
    mensajeInicial: "Busca el 56 y mira la pila: cada llamada tiene su propio izq y der. Prueba también 30, que no está.",
  });

  // Paso 4: sin orden no funciona.
  visualizador("vis-desordenado", {
    ops: ["busquedaBinaria"],
    entradas: [
      { id: "datos", etiqueta: "Datos", opciones: [["desordenado", "sin ordenar"], ["reordenado", "los mismos, ordenados"]] },
      objetivo(4),
    ],
    estadoInicial: (valores) => estadoArreglo(ARREGLOS[valores.datos]),
    mensajeInicial: (valores) => (valores.datos === "desordenado"
      ? "Los mismos números de antes… sin ordenar. Busca el 4 (está en la posición 7). Prueba también 22 y 9."
      : "Ahora ordenados: busca otra vez el 4, el 22 o el 9."),
  });

  // Paso 6: lowerBound, upperBound y contarApariciones con repetidos.
  visualizador("vis-limites", {
    ops: ["lowerBound", "upperBound", "contarApariciones"],
    entradas: [objetivo(4, "x")],
    estadoInicial: () => estadoArreglo(ARREGLOS.repetidos, { fin: true }),
    mensajeInicial: "El 4 aparece tres veces. Prueba lowerBound(v, 4) y upperBound(v, 4), y después cuéntalos. Prueba también x = 5 (no está) y x = 20.",
  });

  // Paso 7: búsqueda sobre la respuesta.
  visualizador("vis-raiz", {
    ops: ["raizEntera"],
    entradas: [{ id: "n", etiqueta: "n", min: -9, max: 99999, valor: 700 }],
    estadoInicial: () => estadoRaiz(700),
    mensajeInicial: "Los candidatos son 0, 1, …, 700. Prueba con 700, con un cuadrado perfecto (625) y con 99999.",
  });

  // Paso 8: todo junto.
  visualizador("vis-todo", {
    ops: ["busquedaBinaria", "busquedaRecursiva", "lowerBound", "upperBound", "contarApariciones"],
    etiquetas: {
      busquedaBinaria: "busquedaBinaria",
      busquedaRecursiva: "busquedaRecursiva",
      lowerBound: "lowerBound",
      upperBound: "upperBound",
      contarApariciones: "contarApariciones",
    },
    entradas: [
      { id: "arreglo", etiqueta: "v", opciones: [["muchos", "con repetidos"], ["ordenado", "15 distintos"], ["desordenado", "sin ordenar"]] },
      objetivo(3, "x"),
    ],
    estadoInicial: (valores) => estadoArreglo(ARREGLOS[valores.arreglo], { fin: true }),
    mensajeInicial: "Elige un arreglo y un valor, y compara: ¿cuál se detiene al encontrarlo y cuál sigue buscando?",
  });

  // ------------------------------------------------------------------
  // Paso 1: el juego de adivinar con cartas boca abajo
  // ------------------------------------------------------------------

  const CARTAS = 16;

  function montarJuego() {
    const caja = document.getElementById("juego");
    if (!caja) return;
    let valores = [];
    let buscado = 0;
    let izq = 0;
    let der = CARTAS - 1;
    let intentos = 0;
    let terminado = false;
    let automatico = null;

    const textoBuscado = el("b", { class: "bb-buscado" });
    const datos = el("div", { class: "variables" });
    const mensaje = el("p", { class: "bb-juego-mensaje", "aria-live": "polite" });
    const cartas = el("div", { class: "bb-cartas" });
    const bAuto = el("button", { class: "boton principal", type: "button", text: "Que juegue la estrategia del medio", onclick: jugarSolo });
    const bOtra = el("button", { class: "boton", type: "button", text: "Otra partida", onclick: nueva });

    function nueva() {
      clearInterval(automatico);
      automatico = null;
      const pool = Array.from({ length: 98 }, (_, k) => k + 1);
      for (let k = pool.length - 1; k > 0; k--) {
        const j = Math.floor(Math.random() * (k + 1));
        [pool[k], pool[j]] = [pool[j], pool[k]];
      }
      valores = pool.slice(0, CARTAS).sort((a, b) => a - b);
      buscado = valores[Math.floor(Math.random() * CARTAS)];
      izq = 0;
      der = CARTAS - 1;
      intentos = 0;
      terminado = false;
      textoBuscado.textContent = buscado;
      cartas.replaceChildren(...valores.map((_, i) => el("button", {
        type: "button", class: "bb-carta", "aria-label": `Carta ${i}, boca abajo`, onclick: () => voltear(i),
      }, el("span", { class: "bb-carta-cara", text: "?" }), el("span", { class: "bb-carta-indice", text: i }))));
      mensaje.className = "bb-juego-mensaje";
      mensaje.textContent = `Las cartas están ordenadas de menor a mayor, boca abajo. Toca una para darla vuelta.`;
      actualizar();
    }

    function actualizar() {
      datos.replaceChildren(DS.variables({ intentos, candidatas: Math.max(0, der - izq + 1) }));
      bAuto.disabled = terminado || !!automatico;
    }

    function voltear(i) {
      if (terminado || i < izq || i > der) return;
      const carta = cartas.children[i];
      if (carta.classList.contains("revelada")) return;
      intentos++;
      carta.classList.add("revelada");
      carta.firstChild.textContent = valores[i];
      carta.setAttribute("aria-label", `Carta ${i}: ${valores[i]}`);
      const v = valores[i];
      if (v === buscado) {
        terminado = true;
        carta.classList.add("encontrada");
        for (const c of cartas.children) c.disabled = true;
        mensaje.className = "bb-juego-mensaje bien";
        mensaje.textContent = `¡Ahí está el ${buscado}! ${plural(intentos, "intento", "intentos")}. `
          + "Eligiendo siempre la carta del medio nunca hacen falta más de 5 con 16 cartas (16 → 8 → 4 → 2 → 1). Mirando una por una, podrían ser 16.";
      } else {
        const antes = der - izq + 1;
        const desde = v < buscado ? izq : i;
        const hasta = v < buscado ? i : der;
        if (v < buscado) izq = i + 1;
        else der = i - 1;
        for (let k = desde; k <= hasta; k++) {
          const c = cartas.children[k];
          c.style.transitionDelay = `${Math.abs(k - i) * 35}ms`;
          c.classList.add("descartada");
          c.disabled = true;
        }
        const quedan = der - izq + 1;
        mensaje.className = "bb-juego-mensaje";
        mensaje.textContent = `${v} ${v < buscado ? "<" : ">"} ${buscado}: el ${buscado} tiene que estar a la ${v < buscado ? "derecha" : "izquierda"}. `
          + (antes - quedan > 1 ? `Descartaste ${antes - quedan} de golpe, sin mirarlas.` : "Descartaste solo esa: elegir un extremo no ayuda.")
          + ` Quedan ${quedan}.`;
      }
      actualizar();
    }

    function jugarSolo() {
      if (terminado) return;
      const turno = () => {
        if (terminado) {
          clearInterval(automatico);
          automatico = null;
          actualizar();
          return;
        }
        voltear(izq + Math.floor((der - izq) / 2));
      };
      automatico = setInterval(turno, 1100);
      turno();
      actualizar();
    }

    caja.classList.add("panel", "bb-juego");
    caja.append(
      el("div", { class: "controles" }, el("span", { class: "bb-pide" }, "Busca el ", textoBuscado), datos,
        el("span", { class: "separador" }), bAuto, bOtra),
      el("div", { class: "bb-mesa" }, cartas),
      mensaje);
    nueva();
  }

  // ------------------------------------------------------------------
  // Paso 5: (izq + der) / 2 se desborda con arreglos enormes
  // ------------------------------------------------------------------

  // 2147483647 → "2 147 483 647" (espacio fino), y el signo menos tipográfico.
  const fmt = (x) => (x < 0 ? "−" : "") + String(Math.abs(x)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  const posicion = (x) => `${((x - INT_MIN) / 4294967296) * 100}%`;

  function montarDesborde() {
    const caja = document.getElementById("desborde");
    if (!caja) return;
    const entrada = (id, valor) => el("input", { type: "number", id, min: 0, max: INT_MAX, step: 1, inputmode: "numeric", value: valor });
    const inIzq = entrada("desborde-izq", 1500000000);
    const inDer = entrada("desborde-der", 2000000000);
    const recta = el("div", { class: "bb-int" });
    const filas = el("div", { class: "bb-formulas" });
    const aviso = el("p", { class: "bb-juego-mensaje", "aria-live": "polite" });

    function chip(texto, clase, k) {
      return el("span", { class: `bb-chip ${clase || ""}`, style: `animation-delay:${k * 0.35}s`, text: texto });
    }

    function calcular() {
      const izq = Number(inIzq.value);
      const der = Number(inDer.value);
      const valido = (x) => inIzq.value.trim() !== "" && Number.isInteger(x) && x >= 0 && x <= INT_MAX;
      if (!valido(izq) || !valido(der) || izq > der) {
        aviso.className = "bb-juego-mensaje mal";
        aviso.textContent = `izq y der son índices de tipo int: enteros entre 0 y ${fmt(INT_MAX)}, con izq ≤ der.`;
        return;
      }
      const suma = izq + der;
      const sumaInt = (izq + der) | 0; // lo que guarda un int de 32 bits
      const ingenuo = Math.trunc(sumaInt / 2);
      const seguro = izq + Math.trunc((der - izq) / 2);
      const seDesborda = suma > INT_MAX;

      const pasosIngenuo = [chip(`izq + der = ${fmt(suma)}`, seDesborda ? "aviso" : "", 0)];
      if (seDesborda) pasosIngenuo.push(chip(`no cabe en un int: da la vuelta → ${fmt(sumaInt)}`, "mal", 1));
      pasosIngenuo.push(chip(`/ 2 = ${fmt(ingenuo)}`, "", pasosIngenuo.length));
      pasosIngenuo.push(chip(seDesborda ? `✗ v[${fmt(ingenuo)}]: fuera del arreglo` : `✓ medio = ${fmt(ingenuo)}`, seDesborda ? "mal final" : "bien final", pasosIngenuo.length));
      const pasosSeguro = [
        chip(`der − izq = ${fmt(der - izq)}`, "", 0),
        chip(`/ 2 = ${fmt(Math.trunc((der - izq) / 2))}`, "", 1),
        chip(`izq + eso = ${fmt(seguro)}`, "", 2),
        chip(`✓ medio = ${fmt(seguro)}`, "bien final", 3),
      ];
      filas.replaceChildren(
        el("div", { class: "bb-formula" }, el("code", { class: "bb-formula-codigo", text: "(izq + der) / 2" }), el("div", { class: "bb-chips" }, pasosIngenuo)),
        el("div", { class: "bb-formula" }, el("code", { class: "bb-formula-codigo", text: "izq + (der - izq) / 2" }), el("div", { class: "bb-chips" }, pasosSeguro)));

      // La recta de los int: la suma corre hacia la derecha y, si se pasa, reaparece por la izquierda.
      const punto = el("span", { class: `bb-punto suma${seDesborda ? " vuelta" : ""}`, title: "izq + der" });
      punto.style.setProperty("--desde", posicion(der));
      punto.style.setProperty("--hasta", posicion(seDesborda ? sumaInt : Math.min(suma, INT_MAX)));
      const tick = (x, texto, clase) => el("span", { class: `bb-tick ${clase}`, style: `left:${posicion(x)}`, text: texto });
      recta.replaceChildren(
        el("div", { class: "bb-int-pista" }),
        tick(INT_MIN, `${fmt(INT_MIN)}`, "extremo izquierdo"),
        tick(0, "0", "cero"),
        tick(INT_MAX, `${fmt(INT_MAX)}`, "extremo derecho"),
        tick(izq, "izq", "arriba izq"),
        tick(der, "der", "arriba der"),
        punto,
        el("span", { class: `bb-resultado ${seDesborda ? "mal" : "bien"}`, style: `left:${posicion(ingenuo)}`, title: "(izq + der) / 2" }),
        el("span", { class: "bb-resultado bien seguro", style: `left:${posicion(seguro)}`, title: "izq + (der - izq) / 2" }));
      aviso.className = `bb-juego-mensaje ${seDesborda ? "mal" : "bien"}`;
      aviso.textContent = seDesborda
        ? `izq + der = ${fmt(suma)} se pasa de ${fmt(INT_MAX)}, el int más grande. En C++ eso es comportamiento indefinido; en la práctica, da la vuelta a los negativos.`
        : "Con estos índices las dos fórmulas dan lo mismo: izq + der todavía cabe en un int. Prueba con un arreglo gigante.";
    }

    const preset = (texto, a, b) => el("button", { class: "boton", type: "button", text: texto, onclick: () => { inIzq.value = a; inDer.value = b; calcular(); } });
    caja.classList.add("panel", "bb-desborde");
    caja.append(
      el("div", { class: "controles" },
        el("label", { class: "campo", for: inIzq.id }, "izq", inIzq),
        el("label", { class: "campo", for: inDer.id }, "der", inDer),
        el("button", { class: "boton principal", type: "button", text: "Calcular medio", onclick: calcular }),
        el("span", { class: "separador" }),
        preset("Índices chicos", 3, 9),
        preset("Arreglo gigante", 1500000000, 2000000000)),
      el("div", { class: "bb-desborde-cuerpo" }, recta,
        el("div", { class: "bb-leyenda bb-int-leyenda" },
          el("span", {}, el("i", { class: "bb-muestra punto" }), "izq + der (en un int)"),
          el("span", {}, el("i", { class: "bb-muestra barra mal" }), "(izq + der) / 2"),
          el("span", {}, el("i", { class: "bb-muestra barra bien" }), "izq + (der - izq) / 2")),
        filas),
      aviso);
    for (const i of [inIzq, inDer]) i.addEventListener("keydown", (ev) => { if (ev.key === "Enter") calcular(); });
    calcular();
  }

  if (typeof document !== "undefined") {
    montarJuego();
    montarDesborde();
  }
})();
