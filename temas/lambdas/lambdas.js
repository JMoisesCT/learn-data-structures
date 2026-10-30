// Lección de lambdas en C++, en pasos. Los fragmentos de código deben
// coincidir línea por línea con ejemplos/cpp/lambdas.cpp
// (scripts/verificar-fragmentos.mjs lo revisa).
(function () {
  const { el } = DS;
  const SVG = "http://www.w3.org/2000/svg";
  const DURACION = 450;
  const MAXIMO = 7; // elementos de numeros: límite solo para que el dibujo quepa

  // ------------------------------------------------------------------
  // Fragmentos de C++ (copiados de ejemplos/cpp/lambdas.cpp)
  // ------------------------------------------------------------------

  const CODIGO = {
    elevarAlCuadrado: `
      int elevarAlCuadrado(int n) {
          auto cuadrado = [](int x) {
              return x * x;
          };
          int resultado = cuadrado(n);
          return resultado;
      }`,
    capturaPorValor: `
      int capturaPorValor(int factor, int x) {
          auto multiplicar = [factor](int y) {
              return y * factor;
          };
          factor = 100;
          return multiplicar(x);
      }`,
    sumarConReferencia: `
      int sumarConReferencia(const std::vector<int>& numeros) {
          int total = 0;
          auto acumular = [&total](int x) {
              total += x;
          };
          for (int x : numeros) {
              acumular(x);
          }
          return total;
      }`,
    sumaDeCuadrados: `
      int sumaDeCuadrados(const std::vector<int>& numeros) {
          auto sumarCuadrados = [](const std::vector<int>& v) {
              auto cuadrado = [](int x) {
                  return x * x;
              };
              int suma = 0;
              for (int x : v) {
                  suma += cuadrado(x);
              }
              return suma;
          };
          return sumarCuadrados(numeros);
      }`,
    usarSumador: `
      int usarSumador(int base, int x) {
          auto crearSumador = [](int b) {
              return [b](int y) {
                  return b + y;
              };
          };
          auto sumarBase = crearSumador(base);
          return sumarBase(x);
      }`,
    contarMayores: `
      int contarMayores(const std::vector<int>& numeros, int limite) {
          return std::count_if(numeros.begin(), numeros.end(), [limite](int x) {
              return x > limite;
          });
      }`,
    primerMultiplo: `
      int primerMultiplo(const std::vector<int>& numeros, int k) {
          auto it = std::find_if(numeros.begin(), numeros.end(), [k](int x) {
              return x % k == 0;
          });
          if (it == numeros.end()) {
              return -1;
          }
          return *it;
      }`,
    ordenarDescendente: `
      void ordenarDescendente(std::vector<int>& numeros) {
          std::sort(numeros.begin(), numeros.end(), [](int a, int b) {
              return a > b;
          });
      }`,
    ordenarPorCercania: `
      void ordenarPorCercania(std::vector<int>& numeros, int centro) {
          std::sort(numeros.begin(), numeros.end(), [centro](int a, int b) {
              int da = std::abs(a - centro);
              int db = std::abs(b - centro);
              if (da != db) {
                  return da < db;
              }
              return a < b;
          });
      }`,
    ordenarParesPrimero: `
      void ordenarParesPrimero(std::vector<int>& numeros) {
          std::sort(numeros.begin(), numeros.end(), [](int a, int b) {
              if (a % 2 != b % 2) {
                  return a % 2 == 0;
              }
              return a < b;
          });
      }`,
  };

  // ------------------------------------------------------------------
  // Estado: la pila de llamadas (un marco por función o lambda en
  // ejecución) y, si la operación lo usa, el vector numeros de main().
  // Cada valor es una ficha con id: si el C++ la copia, la copia nueva
  // sale volando desde la original (desde); si la mueve, conserva su id.
  // ------------------------------------------------------------------

  function estadoDesde(numeros) {
    const s = { sig: 1, marcos: [], numeros: null, vis: {} };
    if (numeros) s.numeros = numeros.map((v) => ficha(s, v));
    return s;
  }

  function ficha(s, v, desde) {
    return { tipo: "num", id: `f${s.sig++}`, v, desde: desde || null };
  }

  const copia = (s, f) => ficha(s, f.v, f.id);

  // capturas: [{ nombre, ficha }] por valor o [{ nombre, ref }] por referencia
  // (ref es el id de la variable original).
  function lambda(s, firma, capturas) {
    return { tipo: "lambda", id: `l${s.sig++}`, firma, capturas: capturas || [] };
  }

  const refNumeros = () => ({ tipo: "ref", texto: "numeros" });

  // tipo: "" (función), "lambda" o "biblioteca" (std::count_if, std::sort…)
  function abrir(s, titulo, tipo) {
    const m = { id: `m${s.sig++}`, titulo, tipo: tipo || "", vars: [], retorno: null };
    s.marcos.push(m);
    return m;
  }

  const cerrar = (s) => s.marcos.pop();

  function asignar(m, nombre, valor) {
    const v = m.vars.find((x) => x.nombre === nombre);
    if (v) v.valor = valor;
    else m.vars.push({ nombre, valor });
    return valor;
  }

  const quitar = (m, nombre) => { m.vars = m.vars.filter((x) => x.nombre !== nombre); };
  const leer = (m, nombre) => m.vars.find((x) => x.nombre === nombre).valor;
  const idVar = (m, nombre) => `${m.id}-${nombre}`;

  const texto = (v) => (v === true ? "true" : v === false ? "false" : String(v));
  const lista = (s) => `{${s.numeros.map((f) => f.v).join(", ")}}`;

  // ------------------------------------------------------------------
  // Animaciones de cada función
  // ------------------------------------------------------------------

  // Si la operación nunca tiene más de dos marcos a la vez, los marcos
  // pueden ser más anchos (y más bajos).
  function nuevaLlamada(s, maxMarcos) {
    s.marcos = [];
    s.amplio = maxMarcos <= 2;
    s.vis = {};
  }

  const OPS = {
    elevarAlCuadrado: {
      etiqueta: "elevarAlCuadrado(n)",
      usa: ["n"],
      codigo: "elevarAlCuadrado",
      ejecutar(s, { n }, paso) {
        nuevaLlamada(s, 2);
        const f = abrir(s, "elevarAlCuadrado(int n)");
        const fn = asignar(f, "n", ficha(s, n));
        s.vis = { activos: [fn.id] };
        paso("elevarAlCuadrado", 1, `Llamamos a elevarAlCuadrado(${n}): se abre su marco en la pila con n = ${n}.`);
        const cuadrado = asignar(f, "cuadrado", lambda(s, "[](int x)"));
        s.vis = { activos: [cuadrado.id] };
        paso("elevarAlCuadrado", 2, "auto cuadrado = [](int x) {…}: se crea un objeto función y se guarda en cuadrado. El cuerpo todavía NO se ejecuta. [] vacío: no captura nada.");
        const g = abrir(s, "cuadrado(int x)", "lambda");
        const fx = asignar(g, "x", copia(s, fn));
        s.vis = { activos: [cuadrado.id, fx.id] };
        paso("elevarAlCuadrado", 5, `cuadrado(n): se llama como cualquier función. Se abre un marco nuevo y el parámetro x recibe una copia de n (${n}).`);
        const r = ficha(s, n * n);
        g.retorno = r;
        s.vis = { activos: [fx.id] };
        paso("elevarAlCuadrado", 3, `Ahora sí se ejecuta el cuerpo: return x * x = ${n} × ${n} = ${n * n}.`);
        cerrar(s);
        asignar(f, "resultado", r);
        s.vis = { cambio: [r.id] };
        paso("elevarAlCuadrado", 5, `El marco de la lambda se cierra y lo que devolvió (${n * n}) se guarda en resultado.`);
        f.retorno = r;
        s.vis = { salida: n * n };
        paso("elevarAlCuadrado", 6, `return resultado: elevarAlCuadrado(${n}) devuelve ${n * n}.`, "exito");
      },
    },

    capturaPorValor: {
      etiqueta: "capturaPorValor(factor, x)",
      usa: ["factor", "x"],
      codigo: "capturaPorValor",
      ejecutar(s, { factor, x }, paso) {
        nuevaLlamada(s, 2);
        const f = abrir(s, "capturaPorValor(int factor, int x)");
        const ff = asignar(f, "factor", ficha(s, factor));
        const fx = asignar(f, "x", ficha(s, x));
        s.vis = { activos: [ff.id, fx.id] };
        paso("capturaPorValor", 1, `Entramos con factor = ${factor} y x = ${x}.`);
        const guardada = copia(s, ff);
        const multiplicar = asignar(f, "multiplicar", lambda(s, "[factor](int y)", [{ nombre: "factor", ficha: guardada }]));
        s.vis = { activos: [guardada.id] };
        paso("capturaPorValor", 2, `[factor]: al crearse, la lambda guarda dentro de sí una COPIA de factor (${factor}). Es como un atributo del objeto función.`);
        asignar(f, "factor", ficha(s, 100));
        s.vis = { cambio: [idVar(f, "factor")], exito: [guardada.id] };
        paso("capturaPorValor", 5, factor === 100
          ? "factor = 100: la variable ya valía 100. La copia de la lambda es independiente de todos modos."
          : `factor = 100 cambia la variable de afuera, pero la copia que guarda la lambda no se entera: sigue valiendo ${factor}.`);
        const g = abrir(s, "multiplicar(int y)", "lambda");
        const fy = asignar(g, "y", copia(s, fx));
        s.vis = { activos: [multiplicar.id, fy.id] };
        paso("capturaPorValor", 6, `multiplicar(x): se abre el marco de la lambda con y = ${x}.`);
        const r = ficha(s, x * factor);
        g.retorno = r;
        s.vis = { activos: [fy.id, guardada.id] };
        paso("capturaPorValor", 3, `return y * factor: usa SU copia de factor (${factor}), no la variable que ahora vale 100. ${x} × ${factor} = ${x * factor}.`);
        cerrar(s);
        f.retorno = r;
        s.vis = { salida: r.v };
        paso("capturaPorValor", 6, `capturaPorValor(${factor}, ${x}) devuelve ${r.v}` + (factor === 100 ? "." : `, no ${x * 100}: la captura por valor congela el valor del momento en que se creó la lambda.`), "exito");
      },
    },

    sumarConReferencia: {
      etiqueta: "sumarConReferencia(numeros)",
      codigo: "sumarConReferencia",
      ejecutar(s, args, paso) {
        nuevaLlamada(s, 2);
        const f = abrir(s, "sumarConReferencia(const vector<int>& numeros)");
        asignar(f, "numeros", refNumeros());
        paso("sumarConReferencia", 1, `numeros llega por referencia (const &): no se copia el vector ${lista(s)}, se usa el de main.`);
        asignar(f, "total", ficha(s, 0));
        s.vis = { activos: [idVar(f, "total")] };
        paso("sumarConReferencia", 2, "int total = 0.");
        const acumular = asignar(f, "acumular", lambda(s, "[&total](int x)", [{ nombre: "&total", ref: idVar(f, "total") }]));
        s.vis = { activos: [acumular.id], flechas: true };
        paso("sumarConReferencia", 3, "[&total]: la lambda NO copia total; guarda una referencia (la flecha) a la variable original.");
        s.numeros.forEach((celda, i) => {
          const fx = asignar(f, "x", copia(s, celda));
          s.vis = { celdas: { [i]: "actual" }, revisadas: i, marcas: { [i]: "x" } };
          paso("sumarConReferencia", 6, `for (int x : numeros): x = ${celda.v}.`);
          const g = abrir(s, "acumular(int x)", "lambda");
          const gx = asignar(g, "x", copia(s, fx));
          s.vis = { celdas: { [i]: "actual" }, revisadas: i, marcas: { [i]: "x" }, activos: [acumular.id, gx.id] };
          paso("sumarConReferencia", 7, `acumular(${celda.v}): se abre el marco de la lambda con su propio x.`);
          const antes = leer(f, "total").v;
          asignar(f, "total", ficha(s, antes + celda.v, gx.id));
          s.vis = { celdas: { [i]: "actual" }, revisadas: i, marcas: { [i]: "x" }, cambio: [idVar(f, "total")], flechaActiva: true };
          paso("sumarConReferencia", 4, `total += x: a través de la referencia cambia el total de afuera: ${antes} + ${celda.v} = ${antes + celda.v}.`);
          cerrar(s);
        });
        quitar(f, "x");
        const total = leer(f, "total");
        f.retorno = total;
        s.vis = { salida: total.v };
        paso("sumarConReferencia", 9, s.numeros.length
          ? `return total: devuelve ${total.v}. La lambda nunca devolvió nada; trabajó sobre total a través de la referencia.`
          : "numeros está vacío: el for no da vueltas, la lambda nunca se llama y total sigue en 0.", "exito");
      },
    },

    sumaDeCuadrados: {
      etiqueta: "sumaDeCuadrados(numeros)",
      codigo: "sumaDeCuadrados",
      ejecutar(s, args, paso) {
        nuevaLlamada(s, 3);
        const f = abrir(s, "sumaDeCuadrados(const vector<int>& numeros)");
        asignar(f, "numeros", refNumeros());
        paso("sumaDeCuadrados", 1, `Entramos con numeros = ${lista(s)} (por referencia).`);
        const externa = asignar(f, "sumarCuadrados", lambda(s, "[](const vector<int>& v)"));
        s.vis = { activos: [externa.id] };
        paso("sumaDeCuadrados", 2, "Se crea la lambda de afuera, sumarCuadrados. La de adentro (cuadrado) todavía no existe: está en el cuerpo, que aún no se ejecuta.");
        const g = abrir(s, "sumarCuadrados(const vector<int>& v)", "lambda");
        asignar(g, "v", refNumeros());
        s.vis = { activos: [externa.id] };
        paso("sumaDeCuadrados", 12, "sumarCuadrados(numeros): se abre su marco. v es otra referencia al mismo vector.");
        const interna = asignar(g, "cuadrado", lambda(s, "[](int x)"));
        s.vis = { activos: [interna.id] };
        paso("sumaDeCuadrados", 3, "Ahora sí: dentro del marco de sumarCuadrados se crea cuadrado. Es una variable local de la lambda de afuera.");
        asignar(g, "suma", ficha(s, 0));
        s.vis = { activos: [idVar(g, "suma")] };
        paso("sumaDeCuadrados", 6, "int suma = 0.");
        s.numeros.forEach((celda, i) => {
          const gx = asignar(g, "x", copia(s, celda));
          const vis = { celdas: { [i]: "actual" }, revisadas: i, marcas: { [i]: "x" } };
          s.vis = vis;
          paso("sumaDeCuadrados", 7, `for (int x : v): x = ${celda.v}.`);
          const h = abrir(s, "cuadrado(int x)", "lambda");
          const hx = asignar(h, "x", copia(s, gx));
          s.vis = Object.assign({ activos: [interna.id, hx.id] }, vis);
          paso("sumaDeCuadrados", 8, `cuadrado(${celda.v}): una lambda llama a otra. La pila tiene tres marcos: cada uno con sus propias variables.`);
          const r = ficha(s, celda.v * celda.v);
          h.retorno = r;
          s.vis = Object.assign({ activos: [hx.id] }, vis);
          paso("sumaDeCuadrados", 4, `return x * x = ${r.v}.`);
          cerrar(s);
          const antes = leer(g, "suma").v;
          asignar(g, "suma", ficha(s, antes + r.v, r.id));
          s.vis = Object.assign({ cambio: [idVar(g, "suma")] }, vis);
          paso("sumaDeCuadrados", 8, `Se cierra el marco de cuadrado. suma += ${r.v} → ${antes + r.v}.`);
        });
        quitar(g, "x");
        const suma = leer(g, "suma");
        g.retorno = suma;
        s.vis = { activos: [suma.id] };
        paso("sumaDeCuadrados", 10, `return suma: sumarCuadrados devuelve ${suma.v}.`);
        cerrar(s);
        f.retorno = suma;
        s.vis = { salida: suma.v };
        paso("sumaDeCuadrados", 12, `Al cerrarse el marco de sumarCuadrados, cuadrado se destruye con él: solo existía ahí adentro. sumaDeCuadrados devuelve ${suma.v}.`, "exito");
      },
    },

    usarSumador: {
      etiqueta: "usarSumador(base, x)",
      usa: ["base", "x"],
      codigo: "usarSumador",
      ejecutar(s, { base, x }, paso) {
        nuevaLlamada(s, 2);
        const f = abrir(s, "usarSumador(int base, int x)");
        const fb = asignar(f, "base", ficha(s, base));
        const fx = asignar(f, "x", ficha(s, x));
        s.vis = { activos: [fb.id, fx.id] };
        paso("usarSumador", 1, `Entramos con base = ${base} y x = ${x}.`);
        const fabrica = asignar(f, "crearSumador", lambda(s, "[](int b)"));
        s.vis = { activos: [fabrica.id] };
        paso("usarSumador", 2, "Se crea crearSumador: una lambda cuyo trabajo es fabricar otras lambdas.");
        const g = abrir(s, "crearSumador(int b)", "lambda");
        const gb = asignar(g, "b", copia(s, fb));
        s.vis = { activos: [fabrica.id, gb.id] };
        paso("usarSumador", 7, `crearSumador(base): se abre su marco con b = ${base}.`);
        const guardada = copia(s, gb);
        const sumador = lambda(s, "[b](int y)", [{ nombre: "b", ficha: guardada }]);
        g.retorno = sumador;
        s.vis = { activos: [guardada.id] };
        paso("usarSumador", 3, `return [b](int y) {…}: se crea una lambda NUEVA que guarda su propia copia de b (${base}) y se devuelve como valor.`);
        cerrar(s);
        asignar(f, "sumarBase", sumador);
        s.vis = { exito: [guardada.id] };
        paso("usarSumador", 7, `El marco de crearSumador se cierra y su b desaparece, pero la lambda devuelta conserva su copia. Con [&b] quedaría apuntando a una variable que ya no existe.`);
        const h = abrir(s, "sumarBase(int y)", "lambda");
        const hy = asignar(h, "y", copia(s, fx));
        s.vis = { activos: [sumador.id, hy.id] };
        paso("usarSumador", 8, `sumarBase(x): se abre el marco de la lambda fabricada con y = ${x}.`);
        const r = ficha(s, base + x);
        h.retorno = r;
        s.vis = { activos: [guardada.id, hy.id] };
        paso("usarSumador", 4, `return b + y: b sale de la copia guardada. ${base} + ${x} = ${base + x}.`);
        cerrar(s);
        f.retorno = r;
        s.vis = { salida: r.v };
        paso("usarSumador", 8, `usarSumador(${base}, ${x}) devuelve ${r.v}. Cada llamada a crearSumador fabrica un sumador distinto con su propia b.`, "exito");
      },
    },

    contarMayores: {
      etiqueta: "contarMayores(numeros, limite)",
      usa: ["limite"],
      codigo: "contarMayores",
      ejecutar(s, { limite }, paso) {
        nuevaLlamada(s, 3);
        const f = abrir(s, "contarMayores(const vector<int>& numeros, int limite)");
        asignar(f, "numeros", refNumeros());
        const fl = asignar(f, "limite", ficha(s, limite));
        s.vis = { activos: [fl.id] };
        paso("contarMayores", 1, `¿Cuántos elementos de ${lista(s)} son mayores que ${limite}?`);
        const g = abrir(s, "std::count_if", "biblioteca");
        const guardada = copia(s, fl);
        const pred = asignar(g, "pred", lambda(s, "[limite](int x)", [{ nombre: "limite", ficha: guardada }]));
        asignar(g, "cuenta", ficha(s, 0));
        s.vis = { activos: [pred.id] };
        paso("contarMayores", 2, `La lambda se escribe ahí mismo, como tercer argumento, y count_if la recibe como pred. Guarda una copia de limite (${limite}).`);
        const cumplen = {};
        s.numeros.forEach((celda, i) => {
          const h = abrir(s, "pred(int x)", "lambda");
          const hx = asignar(h, "x", copia(s, celda));
          const r = ficha(s, celda.v > limite);
          h.retorno = r;
          const celdas = Object.assign({}, cumplen, { [i]: "actual" });
          s.vis = { celdas, revisadas: i, marcas: { [i]: "it" }, activos: [hx.id, guardada.id] };
          paso("contarMayores", 3, `count_if llama a pred(${celda.v}): ¿${celda.v} > ${limite}? ${texto(r.v)}.`);
          cerrar(s);
          if (r.v) {
            cumplen[i] = "cumple";
            asignar(g, "cuenta", ficha(s, leer(g, "cuenta").v + 1, r.id));
          } else {
            cumplen[i] = "no";
          }
          s.vis = { celdas: Object.assign({}, cumplen), revisadas: i + 1, marcas: { [i]: "it" }, cambio: r.v ? [idVar(g, "cuenta")] : [] };
          paso("contarMayores", 2, r.v ? `true: count_if suma 1 → cuenta = ${leer(g, "cuenta").v}.` : "false: no se cuenta. count_if pasa al siguiente.");
        });
        const cuenta = leer(g, "cuenta");
        cerrar(s);
        f.retorno = cuenta;
        s.vis = { celdas: Object.assign({}, cumplen), revisadas: s.numeros.length, salida: cuenta.v };
        paso("contarMayores", 2, `count_if llamó a la lambda ${s.numeros.length} vez/veces, una por elemento: O(n). Devuelve ${cuenta.v}.`, "exito");
      },
    },

    primerMultiplo: {
      etiqueta: "primerMultiplo(numeros, k)",
      usa: ["k"],
      codigo: "primerMultiplo",
      ejecutar(s, { k }, paso) {
        nuevaLlamada(s, 3);
        const f = abrir(s, "primerMultiplo(const vector<int>& numeros, int k)");
        asignar(f, "numeros", refNumeros());
        const fk = asignar(f, "k", ficha(s, k));
        s.vis = { activos: [fk.id] };
        paso("primerMultiplo", 1, `Buscamos en ${lista(s)} el primer múltiplo de ${k}.`);
        const g = abrir(s, "std::find_if", "biblioteca");
        const guardada = copia(s, fk);
        const pred = asignar(g, "pred", lambda(s, "[k](int x)", [{ nombre: "k", ficha: guardada }]));
        s.vis = { activos: [pred.id] };
        paso("primerMultiplo", 2, `find_if recibe la lambda, que guarda una copia de k (${k}).`);
        const descartadas = {};
        for (let i = 0; i < s.numeros.length; i++) {
          const celda = s.numeros[i];
          const h = abrir(s, "pred(int x)", "lambda");
          const hx = asignar(h, "x", copia(s, celda));
          if (k === 0) {
            s.vis = { celdas: { [i]: "actual" }, marcas: { [i]: "it" }, malos: [guardada.id], sacudir: true };
            paso("primerMultiplo", 3, `x % k con k = 0 es dividir entre cero: comportamiento indefinido (el programa puede caerse). Por eso k debe ser al menos 1.`, "error");
            return;
          }
          const r = ficha(s, celda.v % k === 0);
          h.retorno = r;
          s.vis = { celdas: Object.assign({ [i]: "actual" }, descartadas), revisadas: i, marcas: { [i]: "it" }, activos: [hx.id, guardada.id] };
          paso("primerMultiplo", 3, `pred(${celda.v}): ${celda.v} % ${k} = ${celda.v % k}, ¿es 0? ${texto(r.v)}.`);
          cerrar(s);
          if (r.v) {
            cerrar(s);
            asignar(f, "it", { tipo: "ref", texto: `numeros[${i}]` });
            s.vis = { celdas: Object.assign({ [i]: "cumple" }, descartadas), revisadas: i, marcas: { [i]: "it" }, activos: [idVar(f, "it")] };
            paso("primerMultiplo", 2, `true: find_if se detiene aquí, sin mirar el resto, y devuelve un iterador a numeros[${i}].`);
            s.vis = { celdas: { [i]: "cumple" }, marcas: { [i]: "it" } };
            paso("primerMultiplo", 5, "¿it == numeros.end()? No: sí encontró uno.");
            const r2 = copia(s, celda);
            f.retorno = r2;
            s.vis = { celdas: { [i]: "cumple" }, marcas: { [i]: "it" }, salida: celda.v };
            paso("primerMultiplo", 8, `return *it: devuelve ${celda.v}. Revisó ${i + 1} de ${s.numeros.length} elementos.`, "exito");
            return;
          }
          descartadas[i] = "no";
        }
        cerrar(s);
        const n = s.numeros.length;
        asignar(f, "it", { tipo: "ref", texto: "numeros.end()" });
        s.vis = { celdas: Object.assign({}, descartadas), revisadas: n, marcas: { [n]: "it" }, activos: [idVar(f, "it")] };
        paso("primerMultiplo", 2, n
          ? `Ningún elemento cumple: find_if llega al final y devuelve numeros.end(), la posición después del último.`
          : "numeros está vacío: find_if no llama nunca a la lambda y devuelve numeros.end().");
        s.vis = { celdas: Object.assign({}, descartadas), revisadas: n, marcas: { [n]: "it" }, malos: [idVar(f, "it")] };
        paso("primerMultiplo", 5, "¿it == numeros.end()? Sí: no hay ningún múltiplo.");
        f.retorno = ficha(s, -1);
        s.vis = { celdas: Object.assign({}, descartadas), revisadas: n, marcas: { [n]: "it" }, salida: -1, sacudir: true };
        paso("primerMultiplo", 6, `return -1. Tuvo que revisar los ${n} elementos: el peor caso es O(n).`, "error");
      },
    },
  };

  // std::sort con tres criterios distintos (uno por función del C++).
  const CRITERIOS = {
    descendente: {
      texto: "a > b",
      codigo: "ordenarDescendente",
      firma: "[](int a, int b)",
      etiqueta: "ordenarDescendente()",
      titulo: "ordenarDescendente(vector<int>& numeros)",
      fin: 4,
      comparar: (a, b) => ({ r: a > b, linea: 3, detalle: `¿${a} > ${b}?` }),
    },
    cercania: {
      texto: "cercanía",
      codigo: "ordenarPorCercania",
      firma: "[centro](int a, int b)",
      captura: "centro",
      etiqueta: "ordenarPorCercania(centro)",
      titulo: "ordenarPorCercania(vector<int>& numeros, int centro)",
      fin: 9,
      comparar(a, b, centro) {
        const da = Math.abs(a - centro);
        const db = Math.abs(b - centro);
        return da !== db
          ? { r: da < db, linea: 6, detalle: `distancias ${da} y ${db}: ¿${da} < ${db}?`, extra: { da, db } }
          : { r: a < b, linea: 8, detalle: `empatan en distancia (${da}); ¿${a} < ${b}?`, extra: { da, db } };
      },
    },
    pares: {
      texto: "pares primero",
      codigo: "ordenarParesPrimero",
      firma: "[](int a, int b)",
      etiqueta: "ordenarParesPrimero()",
      titulo: "ordenarParesPrimero(vector<int>& numeros)",
      fin: 7,
      comparar(a, b) {
        return a % 2 !== b % 2
          ? { r: a % 2 === 0, linea: 4, detalle: `uno es par y el otro no; ¿${a} es par?` }
          : { r: a < b, linea: 6, detalle: `los dos son ${a % 2 ? "impares" : "pares"}; ¿${a} < ${b}?` };
      },
    },
  };

  OPS.ordenar = {
    etiqueta: (valores) => CRITERIOS[valores.criterio].etiqueta,
    usa: ["criterio", "centro"],
    codigo: "ordenarDescendente",
    ejecutar(s, { criterio, centro }, paso) {
      const c = CRITERIOS[criterio];
      nuevaLlamada(s, 3);
      const f = abrir(s, c.titulo);
      asignar(f, "numeros", { tipo: "ref", texto: "numeros (se modifica)" });
      let fc = null;
      if (c.captura) fc = asignar(f, "centro", ficha(s, centro));
      s.vis = { activos: fc ? [fc.id] : [] };
      paso(c.codigo, 1, `Vamos a ordenar ${lista(s)} con el criterio "${c.texto}". numeros llega por referencia sin const: sort lo modifica.`);
      const g = abrir(s, "std::sort", "biblioteca");
      const guardada = fc ? copia(s, fc) : null;
      const comp = asignar(g, "comp", lambda(s, c.firma, guardada ? [{ nombre: "centro", ficha: guardada }] : []));
      s.vis = { activos: [comp.id] };
      paso(c.codigo, 2, "std::sort recibe la lambda como comp. Solo sabe hacer una pregunta: comp(a, b), «¿a debe ir antes que b?».");
      const n = s.numeros.length;
      // Algunas preguntas de ejemplo con vecinos; el orden real de las
      // comparaciones depende de la implementación de std::sort.
      for (let i = 0; i < Math.min(3, n - 1); i++) {
        const fa = s.numeros[i];
        const fb = s.numeros[i + 1];
        const h = abrir(s, "comp(int a, int b)", "lambda");
        const ha = asignar(h, "a", copia(s, fa));
        const hb = asignar(h, "b", copia(s, fb));
        const resp = c.comparar(fa.v, fb.v, centro);
        if (resp.extra) {
          asignar(h, "da", ficha(s, resp.extra.da));
          asignar(h, "db", ficha(s, resp.extra.db));
        }
        const r = ficha(s, resp.r);
        h.retorno = r;
        s.vis = { celdas: { [i]: "actual", [i + 1]: "actual" }, marcas: { [i]: "a", [i + 1]: "b" }, activos: [ha.id, hb.id].concat(guardada ? [guardada.id] : []) };
        paso(c.codigo, resp.linea, `sort pregunta comp(${fa.v}, ${fb.v}): ${resp.detalle} ${texto(resp.r)}` + (resp.r ? `: ${fa.v} va antes que ${fb.v}.` : `: ${fa.v} no tiene que ir antes que ${fb.v}.`));
        cerrar(s);
      }
      const ordenado = s.numeros.slice().sort((x, y) => {
        if (c.comparar(x.v, y.v, centro).r) return -1;
        if (c.comparar(y.v, x.v, centro).r) return 1;
        return 0;
      });
      s.numeros = ordenado;
      const todas = Object.fromEntries(ordenado.map((_, i) => [i, "cumple"]));
      s.vis = { celdas: todas };
      paso(c.codigo, 2, n > 1
        ? `sort sigue preguntando (unas n·log n veces; el orden exacto de las preguntas depende de la biblioteca) y mueve cada valor a su lugar: ${lista(s)}.`
        : "Con 0 o 1 elementos no hay nada que comparar: ya está ordenado.");
      cerrar(s);
      s.vis = { celdas: todas };
      paso(c.codigo, c.fin, `Listo: ${lista(s)}. Cambiando solo la lambda, el mismo std::sort ordena con otro criterio.`, "exito");
    },
  };

  OPS.agregar = {
    etiqueta: "push_back(valor)",
    usa: ["valor"],
    secundaria: true,
    ejecutar(s, { valor }, paso) {
      nuevaLlamada(s, 3);
      if (s.numeros.length >= MAXIMO) {
        s.vis = { sacudir: true };
        paso("contarMayores", 0, `Para que el dibujo quepa en pantalla, numeros llega hasta ${MAXIMO} elementos. Pulsa Reiniciar para empezar de nuevo.`, "error");
        return;
      }
      s.numeros.push(ficha(s, valor));
      s.vis = { celdas: { [s.numeros.length - 1]: "cumple" } };
      paso("contarMayores", 0, `numeros.push_back(${valor}) en main: ahora numeros = ${lista(s)}.`);
    },
  };

  // ------------------------------------------------------------------
  // Dibujo: se reconstruye en cada paso y las piezas con data-id se
  // animan desde donde estaban (técnica FLIP): lo que se mueve se desliza,
  // lo nuevo aparece (o vuela desde su origen) y lo que sale se desvanece.
  // ------------------------------------------------------------------

  const sinMovimiento = () => typeof window !== "undefined" && window.matchMedia
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function claseValor(s, id, extra) {
    const vis = s.vis || {};
    let clase = extra || "";
    if ((vis.activos || []).includes(id)) clase += " activo";
    if ((vis.exito || []).includes(id)) clase += " bien";
    if ((vis.malos || []).includes(id)) clase += " mal";
    if ((vis.cambio || []).includes(id)) clase += " cambio";
    return clase;
  }

  function dibujarFicha(s, f) {
    let clase = "lam-valor";
    if (f.v === true) clase += " verdadero";
    if (f.v === false) clase += " falso";
    return el("span", { class: claseValor(s, f.id, clase), "data-id": f.id, "data-desde": f.desde, text: texto(f.v) });
  }

  function dibujarLambda(s, l) {
    const capturas = l.capturas.length
      ? l.capturas.map((c) => el("div", { class: `lam-captura${c.ref ? " ref" : ""}` },
        el("span", { class: "lam-nombre", text: c.nombre }),
        c.ref
          ? el("span", { class: "lam-ancla", "data-ancla": c.ref, title: "referencia a la variable original" })
          : dibujarFicha(s, c.ficha)))
      : [];
    return el("div", { class: claseValor(s, l.id, "lam-closure"), "data-id": l.id },
      el("div", { class: "lam-firma" }, el("span", { class: "lam-lambda", "aria-hidden": "true", text: "λ" }), el("code", { text: l.firma })),
      capturas.length ? el("div", { class: "lam-capturas" }, capturas) : "");
  }

  function dibujarValor(s, valor) {
    if (valor.tipo === "num") return dibujarFicha(s, valor);
    if (valor.tipo === "lambda") return dibujarLambda(s, valor);
    return el("span", { class: "lam-ref", text: `→ ${valor.texto}` });
  }

  // "contarMayores(const vector<int>& numeros, int limite)" -> "contarMayores(numeros, limite)"
  function tituloCorto(titulo) {
    const m = titulo.match(/^([^(]+)\((.*)\)$/);
    if (!m) return titulo;
    const nombres = m[2].split(",").map((p) => p.trim().split(/[\s&*]+/).pop()).filter(Boolean);
    return `${m[1]}(${nombres.join(", ")})`;
  }

  // El título muestra solo los nombres de los parámetros (la firma completa queda
  // en el tooltip y en el código). lejano: en pantallas angostas, los marcos
  // debajo de los dos últimos se pliegan (ver estilos.css).
  function dibujarMarco(s, m, esActual, lejano) {
    const filas = m.vars.map((v) => {
      const id = idVar(m, v.nombre);
      return el("div", { class: claseValor(s, id, v.valor.tipo === "num" ? "lam-var" : "lam-var ancha"), "data-id": id },
        el("span", { class: "lam-nombre", text: v.nombre }),
        el("span", { class: "lam-slot", "data-slot": id }, dibujarValor(s, v.valor)));
    });
    if (m.retorno) {
      filas.push(el("div", { class: "lam-var lam-devuelve", "data-id": `${m.id}-return` },
        el("span", { class: "lam-nombre", text: "return" }),
        el("span", { class: "lam-slot" }, dibujarValor(s, m.retorno))));
    }
    const etiqueta = m.tipo === "lambda" ? "lambda" : m.tipo === "biblioteca" ? "biblioteca" : "función";
    return el("div", { class: `lam-marco${m.tipo ? ` ${m.tipo}` : ""}${esActual ? " actual" : ""}${lejano ? " lejano" : ""}`, "data-id": m.id },
      el("div", { class: "lam-marco-titulo", title: m.titulo }, el("span", { class: "lam-tipo", text: etiqueta }), el("code", { text: tituloCorto(m.titulo) })),
      el("div", { class: "lam-vars" }, filas));
  }

  function dibujarNumeros(s) {
    const vis = s.vis || {};
    const marcas = vis.marcas || {};
    const n = s.numeros.length;
    const celdas = s.numeros.map((f, i) => {
      let clase = "lam-celda";
      const estado = (vis.celdas || {})[i];
      if (estado) clase += ` ${estado}`;
      else if (vis.revisadas != null && i < vis.revisadas) clase += " revisada";
      return el("div", { class: clase },
        el("span", { class: "lam-caja" }, dibujarFicha(s, f)),
        el("span", { class: "indice", text: i }),
        el("span", { class: "lam-marcas" }, marcas[i] ? el("span", { class: "marcador", "data-id": `marca-${marcas[i]}`, text: `▲ ${marcas[i]}` }) : ""));
    });
    if (marcas[n]) {
      celdas.push(el("div", { class: "lam-celda fin" },
        el("span", { class: "lam-caja" }, el("span", { class: "lam-fin", text: "end()" })),
        el("span", { class: "indice", text: n }),
        el("span", { class: "lam-marcas" }, el("span", { class: "marcador", "data-id": `marca-${marcas[n]}`, text: `▲ ${marcas[n]}` }))));
    }
    return el("div", { class: "lam-numeros" },
      el("span", { class: "fila-titulo" }, "numeros", el("br"), el("small", { text: "(en main)" })),
      el("div", { class: "lam-celdas" }, n || marcas[n] ? celdas : el("span", { class: "lam-sin", text: "vacío: {}" })));
  }

  function construir(s) {
    const vis = s.vis || {};
    const info = el("div", { class: "lam-info" },
      el("div", { class: "pila-llamadas", "aria-label": "Pila de llamadas" },
        s.marcos.length ? ["pila:", ...s.marcos.map((m) => el("span", { class: "llamada", text: m.titulo.split("(")[0] }))] : "pila vacía"),
      vis.salida != null ? el("div", { class: "salida-valor" }, "devuelve", el("div", { class: "celda encontrada", text: texto(vis.salida) })) : "");
    const marcos = el("div", { class: `lam-marcos${s.amplio ? " amplio" : ""}${vis.sacudir ? " sacudir" : ""}` },
      s.marcos.map((m, k) => dibujarMarco(s, m, k === s.marcos.length - 1, k < s.marcos.length - 2)));
    return el("div", { class: "lam-contenido" }, info, s.numeros ? dibujarNumeros(s) : "", marcos);
  }

  // Flechas de las capturas por referencia: del ancla a la variable original.
  function dibujarFlechas(lienzo, svg, s, k) {
    svg.replaceChildren();
    const base = lienzo.getBoundingClientRect();
    const vis = s.vis || {};
    const punto = (r, dx, dy) => [(r.left - base.left) / k + dx, (r.top - base.top) / k + dy];
    for (const ancla of lienzo.querySelectorAll(".lam-contenido [data-ancla]")) {
      const destino = lienzo.querySelector(`.lam-contenido [data-slot="${ancla.dataset.ancla}"]`);
      if (!destino) continue;
      const ra = ancla.getBoundingClientRect();
      const rd = destino.getBoundingClientRect();
      const [x1, y1] = punto(ra, ra.width / k, ra.height / k / 2);
      const [x2, y2] = punto(rd, rd.width / k + 4, rd.height / k / 2);
      const curva = Math.max(36, Math.abs(y2 - y1) * 0.6);
      const derecha = Math.max(x1, x2) + curva;
      const camino = document.createElementNS(SVG, "path");
      camino.setAttribute("d", `M ${x1} ${y1} C ${derecha} ${y1}, ${derecha} ${y2}, ${x2} ${y2}`);
      camino.setAttribute("class", `lam-flecha${vis.flechaActiva ? " activa" : ""}${vis.flechas ? " nueva" : ""}`);
      camino.setAttribute("pathLength", "1");
      camino.setAttribute("marker-end", "url(#lam-punta)");
      svg.append(camino);
    }
    if (svg.childNodes.length) {
      const defs = document.createElementNS(SVG, "defs");
      const punta = document.createElementNS(SVG, "marker");
      for (const [a, v] of Object.entries({ id: "lam-punta", viewBox: "0 0 10 10", refX: 8, refY: 5, markerWidth: 7, markerHeight: 7, orient: "auto-start-reverse" })) punta.setAttribute(a, v);
      const forma = document.createElementNS(SVG, "path");
      forma.setAttribute("d", "M0 0 L10 5 L0 10 z");
      punta.append(forma);
      defs.append(punta);
      svg.prepend(defs);
    }
  }

  function dibujar(escenario, s) {
    let lienzo = escenario.querySelector(".lam-lienzo");
    const antes = new Map();
    if (lienzo) {
      for (const nodo of lienzo.querySelectorAll(".lam-contenido [data-id]")) antes.set(nodo.dataset.id, { nodo, r: nodo.getBoundingClientRect() });
    } else {
      lienzo = el("div", { class: "lam-lienzo" }, el("div", { class: "lam-contenido" }), el("div", { class: "lam-fantasmas", "aria-hidden": "true" }));
      lienzo.prepend(document.createElementNS(SVG, "svg"));
      escenario.append(lienzo);
    }
    const contenido = construir(s);
    lienzo.querySelector(".lam-contenido").replaceWith(contenido);
    const k = parseFloat(getComputedStyle(lienzo).zoom) || 1;
    dibujarFlechas(lienzo, lienzo.querySelector("svg"), s, k);
    if (!antes.size || sinMovimiento() || !lienzo.offsetWidth) return;

    const base = lienzo.getBoundingClientRect();
    const nuevos = new Map();
    for (const nodo of contenido.querySelectorAll("[data-id]")) nuevos.set(nodo.dataset.id, nodo);

    // Desplazamiento visual de cada pieza que ya estaba (o que vuela desde su origen).
    const deltas = new Map();
    for (const [id, nodo] of nuevos) {
      const previo = antes.get(id) || (nodo.dataset.desde && antes.get(nodo.dataset.desde));
      if (!previo) {
        nodo.classList.add("lam-entra");
        continue;
      }
      const r = nodo.getBoundingClientRect();
      deltas.set(nodo, [previo.r.left - r.left, previo.r.top - r.top, !antes.has(id)]);
    }
    for (const [nodo, [dx, dy, vuela]] of deltas) {
      // Si su contenedor también se mueve, solo se anima la diferencia.
      const padre = nodo.parentElement.closest("[data-id]");
      const [px, py] = (padre && deltas.get(padre)) || [0, 0];
      const x = (dx - px) / k;
      const y = (dy - py) / k;
      if (Math.abs(x) < 1 && Math.abs(y) < 1) continue;
      nodo.classList.add("lam-vuela");
      const animacion = nodo.animate(
        vuela
          ? [{ transform: `translate(${x}px, ${y}px) scale(1.15)` }, { transform: "translate(0, 0) scale(1)" }]
          : [{ transform: `translate(${x}px, ${y}px)` }, { transform: "translate(0, 0)" }],
        { duration: DURACION, easing: "cubic-bezier(.3,.7,.3,1)" });
      animacion.onfinish = animacion.oncancel = () => nodo.classList.remove("lam-vuela");
    }

    // Lo que ya no está se desvanece en su lugar (solo la pieza de más afuera).
    const fantasmas = lienzo.querySelector(".lam-fantasmas");
    for (const [id, { nodo, r }] of antes) {
      if (nuevos.has(id)) continue;
      const padre = nodo.parentElement && nodo.parentElement.closest("[data-id]");
      if (padre && !nuevos.has(padre.dataset.id)) continue;
      const fantasma = nodo.cloneNode(true);
      fantasma.removeAttribute("data-id");
      for (const hijo of fantasma.querySelectorAll("[data-id]")) {
        // Lo que sigue en el dibujo ya vuela a su lugar nuevo: no se duplica.
        if (nuevos.has(hijo.dataset.id)) hijo.style.visibility = "hidden";
        hijo.removeAttribute("data-id");
      }
      fantasma.classList.remove("lam-entra", "lam-vuela");
      fantasma.classList.add("lam-fantasma");
      Object.assign(fantasma.style, {
        left: `${(r.left - base.left) / k}px`,
        top: `${(r.top - base.top) / k}px`,
        width: `${r.width / k}px`,
        height: `${r.height / k}px`,
      });
      fantasmas.append(fantasma);
      setTimeout(() => fantasma.remove(), DURACION);
    }
  }

  // ------------------------------------------------------------------
  // Visualizadores de la lección
  // ------------------------------------------------------------------

  function visualizador(contenedor, opciones) {
    const claves = [...new Set(opciones.ops.flatMap((id) => (id === "ordenar" ? Object.values(CRITERIOS).map((c) => c.codigo) : [OPS[id].codigo]).filter(Boolean)))];
    DS.tema({
      contenedor,
      incremental: true,
      dibujar,
      codigo: Object.fromEntries(claves.map((c) => [c, CODIGO[c]])),
      tituloCodigo: (clave) => `${clave}()`,
      codigoInicial: opciones.codigoInicial,
      mensajeInicial: opciones.mensajeInicial,
      estadoInicial: opciones.estadoInicial,
      entradas: opciones.entradas,
      operaciones: opciones.ops.map((id) => Object.assign({ id }, opciones.adaptar ? opciones.adaptar(id) : OPS[id])),
    });
  }

  const NUMEROS = [4, 7, 2, 9, 5];
  const numero = (id, etiqueta, valor, min, max) => ({ id, etiqueta, valor, min: min ?? -99, max: max ?? 99 });
  const LISTAS = [
    ["4,7,2,9,5", "{4, 7, 2, 9, 5}"],
    ["3,1,6", "{3, 1, 6}"],
    ["8,8,1,5", "{8, 8, 1, 5}"],
    ["", "{} (vacío)"],
  ];
  const elegirLista = { id: "lista", etiqueta: "numeros", opciones: LISTAS };
  const desdeLista = (valores) => estadoDesde(valores.lista ? valores.lista.split(",").map(Number) : []);
  const criterio = { id: "criterio", etiqueta: "Orden", opciones: Object.entries(CRITERIOS).map(([id, c]) => [id, c.texto]), reinicia: false };
  const codigoCriterio = (valores) => CRITERIOS[valores.criterio].codigo;

  visualizador("vis-simple", {
    ops: ["elevarAlCuadrado"],
    entradas: [numero("n", "n", 5)],
    estadoInicial: () => estadoDesde(null),
    mensajeInicial: "Pulsa elevarAlCuadrado(n) y fíjate en qué momento se ejecuta x * x: no es al crear la lambda.",
  });

  visualizador("vis-valor", {
    ops: ["capturaPorValor"],
    entradas: [numero("factor", "factor", 3, -999, 999), numero("x", "x", 4)],
    estadoInicial: () => estadoDesde(null),
    mensajeInicial: "Antes de ejecutarlo: ¿la lambda va a usar factor = 3 o factor = 100?",
  });

  visualizador("vis-referencia", {
    ops: ["sumarConReferencia"],
    entradas: [elegirLista],
    estadoInicial: desdeLista,
    mensajeInicial: "Con & la lambda no se lleva una copia: modifica el total de afuera. Prueba también con el vector vacío.",
  });

  visualizador("vis-anidadas", {
    ops: ["sumaDeCuadrados"],
    entradas: [elegirLista],
    estadoInicial: desdeLista,
    mensajeInicial: "Mira la pila de llamadas: llega a tener tres marcos, uno dentro de otro.",
  });

  visualizador("vis-fabrica", {
    ops: ["usarSumador"],
    entradas: [numero("base", "base", 10), numero("x", "x", 5)],
    estadoInicial: () => estadoDesde(null),
    mensajeInicial: "Fíjate qué pasa con b cuando termina crearSumador.",
  });

  visualizador("vis-contar", {
    ops: ["contarMayores"],
    entradas: [numero("limite", "limite", 4)],
    estadoInicial: () => estadoDesde(NUMEROS),
    mensajeInicial: "Cuenta los mayores que 4. Después prueba con otro límite.",
  });

  visualizador("vis-buscar", {
    ops: ["primerMultiplo"],
    entradas: [numero("k", "k", 3, 0, 20)],
    estadoInicial: () => estadoDesde(NUMEROS),
    mensajeInicial: "Busca el primer múltiplo de 3. Prueba también k = 8 (no hay ninguno) y k = 0.",
  });

  visualizador("vis-ordenar", {
    ops: ["ordenar"],
    entradas: [criterio, numero("centro", "centro", 6)],
    codigoInicial: codigoCriterio,
    estadoInicial: () => estadoDesde(NUMEROS),
    mensajeInicial: "Elige un criterio y ordena. Cambia de criterio y vuelve a ordenar el resultado.",
  });

  // centro solo es un argumento de ordenarPorCercania: con los otros criterios no se muestra.
  {
    const elegido = document.getElementById("vis-ordenar-criterio");
    const campoCentro = document.getElementById("vis-ordenar-centro");
    if (elegido && campoCentro) {
      const mostrarCentro = () => {
        campoCentro.closest(".campo").style.display = CRITERIOS[elegido.value].captura ? "" : "none";
      };
      elegido.addEventListener("change", mostrarCentro);
      mostrarCentro();
    }
  }

  // En Todo junto, un solo campo (n) hace de valor, limite, k y centro.
  const conValor = (id) => {
    const op = OPS[id];
    const usa = (op.usa || []).map((u) => (u === "criterio" ? u : "valor"));
    return Object.assign({}, op, {
      usa: [...new Set(usa)],
      etiqueta: typeof op.etiqueta === "function"
        ? (valores) => op.etiqueta(valores).replace(/\(centro\)$/, "(n)")
        : op.etiqueta.replace(/\(numeros\)$/, "()").replace(/\((numeros, )?(limite|k|valor)\)$/, "(n)"),
      ejecutar: (s, args, paso) => op.ejecutar(s, Object.assign({ limite: args.valor, k: args.valor, centro: args.valor }, args), paso),
    });
  };

  visualizador("vis-todo", {
    ops: ["agregar", "sumarConReferencia", "contarMayores", "primerMultiplo", "ordenar"],
    adaptar: conValor,
    entradas: [numero("valor", "n", 3, 0, 99), criterio],
    codigoInicial: "sumarConReferencia",
    estadoInicial: () => estadoDesde(NUMEROS),
    mensajeInicial: "El vector numeros de main() con las funciones que reciben lambdas. n es el valor que se agrega, y también limite, k o centro.",
  });
})();
