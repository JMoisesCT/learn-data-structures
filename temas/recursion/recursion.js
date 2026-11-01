// Lección de recursión, en pasos. Los fragmentos de código deben coincidir
// línea por línea con ejemplos/cpp/recursion.cpp
// (scripts/verificar-fragmentos.mjs lo revisa).
(function () {
  const { el } = DS;
  const SVG = "http://www.w3.org/2000/svg";
  const DURACION = 450;
  const DIGITOS = "0123456789ABCDEF";

  // ------------------------------------------------------------------
  // Fragmentos de C++ (copiados de ejemplos/cpp/recursion.cpp)
  // ------------------------------------------------------------------

  const CODIGO = {
    sumaDigitos: `
      int sumaDigitos(int n) {
          if (n < 10) {
              return n;
          }
          return sumaDigitos(n / 10) + n % 10;
      }`,
    imprimirDigitos: `
      void imprimirDigitos(int n) {
          if (n >= 10) {
              imprimirDigitos(n / 10);
          }
          std::cout << n % 10 << ' ';
      }`,
    imprimirAlReves: `
      void imprimirAlReves(int n) {
          std::cout << n % 10 << ' ';
          if (n >= 10) {
              imprimirAlReves(n / 10);
          }
      }`,
    invertir: `
      int invertir(int n, int acumulado) {
          if (n == 0) {
              return acumulado;
          }
          return invertir(n / 10, acumulado * 10 + n % 10);
      }`,
    aBase: `
      std::string aBase(int n, int base) {
          if (n < 0 || base < 2 || base > 16) {
              throw std::invalid_argument("n debe ser >= 0 y la base estar entre 2 y 16");
          }
          if (n < base) {
              return std::string(1, DIGITOS[n]);
          }
          return aBase(n / base, base) + DIGITOS[n % base];
      }`,
    esPalindromo: `
      bool esPalindromo(const std::string& texto, int i, int j) {
          if (i >= j) {
              return true;
          }
          if (texto[i] != texto[j]) {
              return false;
          }
          return esPalindromo(texto, i + 1, j - 1);
      }`,
    potencia: `
      long long potencia(long long base, int exponente) {
          if (exponente == 0) {
              return 1;
          }
          long long mitad = potencia(base, exponente / 2);
          if (exponente % 2 == 0) {
              return mitad * mitad;
          }
          return mitad * mitad * base;
      }`,
    fibonacci: `
      long long fibonacci(int n) {
          if (n < 2) {
              return n;
          }
          return fibonacci(n - 1) + fibonacci(n - 2);
      }`,
    fibonacciMemo: `
      long long fibonacciMemo(int n, std::vector<long long>& memo) {
          if (n < 2) {
              return n;
          }
          if (memo[n] != -1) {
              return memo[n];
          }
          memo[n] = fibonacciMemo(n - 1, memo) + fibonacciMemo(n - 2, memo);
          return memo[n];
      }`,
  };

  // ------------------------------------------------------------------
  // Estado: la pila de llamadas, un marco por llamada en curso (el de más
  // abajo es la llamada más reciente). Cada marco tiene su expresión
  // pendiente, con un hueco donde caerá lo que devuelva la llamada de
  // abajo. Cada valor es una ficha con id: si el C++ la copia, la copia
  // sale volando desde la original (desde); si la mueve, conserva su id.
  // ------------------------------------------------------------------

  function estadoVacio() {
    return { sig: 1, marcos: [], numero: null, pantalla: null, letras: null, contador: null, arbol: null, memo: null, vis: {} };
  }

  function ficha(s, v, desde, clase) {
    return { t: "ficha", id: `f${s.sig++}`, v: String(v), desde: desde || null, clase: clase || "" };
  }
  const txt = (v, clase) => ({ t: "txt", v, clase: clase || "" });
  // sinValor: la llamada es a una función void (no devuelve nada).
  const hueco = (s, etiqueta, sinValor) => ({ t: "hueco", id: `h${s.sig++}`, etiqueta, lleno: null, texto: null, sinValor: !!sinValor });

  function llamar(s, llamada) {
    const m = { id: `m${s.sig++}`, llamada, expr: [], resultado: null, nota: "", base: false, error: false };
    s.marcos.push(m);
    return m;
  }
  const volver = (s) => s.marcos.pop();

  // Las cifras del número de la operación, en casillas que no cambian de id.
  function conNumero(s, n) {
    s.numero = { cifras: String(n).split("").map((c, i) => ({ id: `c${i}`, v: c })) };
  }
  const celda = (i) => `c${i}`;
  const cifras = (n) => (n === 0 ? 0 : String(n).length);

  // paso() con la profundidad de la recursión (para el panel de código).
  function conNivel(s, paso, profundidad) {
    return (clave, linea, texto, tipo) => {
      s.vis.nivel = profundidad ? profundidad() : s.marcos.length;
      paso(clave, linea, texto, tipo);
    };
  }

  // Si la recursión va a ser profunda, los marcos son más bajos.
  // Cada operación empieza de cero (los ids siguen contando, para que nada
  // de la operación anterior se confunda con lo nuevo).
  function nuevaLlamada(s, profundidad) {
    Object.assign(s, estadoVacio(), { sig: s.sig, apretado: profundidad > 4 });
  }

  // ------------------------------------------------------------------
  // Animaciones de cada función
  // ------------------------------------------------------------------

  const OPS = {
    sumaDigitos: {
      etiqueta: "sumaDigitos(n)",
      usa: ["n"],
      codigo: "sumaDigitos",
      ejecutar(s, { n }, paso) {
        const C = "sumaDigitos";
        nuevaLlamada(s, String(n).length);
        conNumero(s, n);
        const P = conNivel(s, paso);
        function rec(n) {
          const m = llamar(s, `sumaDigitos(${n})`);
          const k = s.marcos.length;
          const largo = String(n).length;
          if (n < 10) {
            m.base = true;
            s.vis = { vigentes: 1 };
            P(C, 2, k === 1 ? `sumaDigitos(${n}): ¿n < 10? Sí, tiene un solo dígito.` : `Nueva llamada con su propio n = ${n}. ¿n < 10? Sí: ya no se puede partir más.`);
            const r = ficha(s, n, celda(0));
            m.resultado = [r];
            s.vis = { vigentes: 1, activos: [r.id], salida: k === 1 ? r.v : null };
            P(C, 3, k === 1
              ? `Caso base: devuelve ${n} sin llamarse. Con un solo dígito, la suma es el mismo dígito.`
              : `Caso base: devuelve ${n} sin llamarse. Aquí la pila deja de crecer y empieza a bajar.`, k === 1 ? "exito" : "");
            return r;
          }
          s.vis = { vigentes: largo };
          P(C, 2, k === 1
            ? `sumaDigitos(${n}): ¿n < 10? No, tiene ${largo} dígitos. Hay que partirlo.`
            : `Nueva llamada, con su propio marco y su propio n = ${n}. ¿n < 10? No.`);
          const q = Math.floor(n / 10);
          const ultimo = ficha(s, n % 10, celda(largo - 1));
          const h = hueco(s, `sumaDigitos(${q})`);
          m.expr = [h, txt("+"), ultimo];
          s.vis = { vigentes: largo - 1, activos: [ultimo.id] };
          P(C, 5, `n % 10 = ${n % 10} es el último dígito y n / 10 = ${q}, el resto. El ${n % 10} se queda esperando en este marco mientras sumaDigitos(${q}) resuelve lo demás.`);
          const sub = rec(q);
          volver(s);
          h.lleno = [sub];
          s.vis = { vigentes: largo - 1, activos: [sub.id] };
          P(C, 5, `sumaDigitos(${q}) devolvió ${sub.v}: su marco se cierra y el valor sube al hueco que lo esperaba.`);
          const r = ficha(s, Number(sub.v) + (n % 10));
          m.resultado = [r];
          s.vis = { vigentes: largo, activos: [r.id], salida: k === 1 ? r.v : null };
          P(C, 5, k === 1
            ? `${sub.v} + ${n % 10} = ${r.v}. sumaDigitos(${n}) devuelve ${r.v}: cada llamada sumó un dígito al volver.`
            : `${sub.v} + ${n % 10} = ${r.v}: sumaDigitos(${n}) devuelve ${r.v} a la llamada de arriba.`, k === 1 ? "exito" : "");
          return r;
        }
        rec(n);
      },
    },

    imprimirDigitos: {
      etiqueta: "imprimirDigitos(n)",
      usa: ["n"],
      codigo: "imprimirDigitos",
      ejecutar(s, { n }, paso) {
        const C = "imprimirDigitos";
        nuevaLlamada(s, String(n).length);
        conNumero(s, n);
        s.pantalla = [];
        const P = conNivel(s, paso);
        const pantalla = () => `"${s.pantalla.map((f) => `${f.v} `).join("")}"`;
        function rec(n) {
          const m = llamar(s, `imprimirDigitos(${n})`);
          const k = s.marcos.length;
          const largo = String(n).length;
          const cout = ficha(s, n % 10, celda(largo - 1), "pendiente");
          if (n >= 10) {
            const q = Math.floor(n / 10);
            const h = hueco(s, `imprimirDigitos(${q})`, true);
            m.expr = [h, txt("; después cout <<", "suave"), cout];
            s.vis = { vigentes: largo, activos: [cout.id] };
            P(C, 3, `n = ${n} ≥ 10: primero llama a imprimirDigitos(${q}). El cout << ${n % 10} queda pendiente: está DESPUÉS de la llamada.`);
            rec(q);
            volver(s);
            h.texto = "✓ terminó";
          } else {
            m.base = true;
            m.expr = [txt("cout <<", "suave"), cout];
            s.vis = { vigentes: largo, activos: [cout.id] };
            P(C, 2, k === 1 ? `n = ${n} < 10: el if no entra y no hay llamada.` : `n = ${n} < 10: el if no entra. Caso base: esta llamada ya no llama a nadie.`);
          }
          // El dígito sale volando a la pantalla; en el marco queda la marca de impreso.
          m.expr = m.expr.map((x) => (x === cout ? txt(`${cout.v} ✓`, "bien") : x));
          cout.clase = "";
          s.pantalla.push(cout);
          s.vis = { vigentes: largo, activos: [cout.id] };
          P(C, 5, n >= 10
            ? `Volvió de la llamada. Ahora sí: cout << ${n % 10}. Pantalla: ${pantalla()}.`
            : `cout << ${n}: es el primero que se imprime, aunque es la última llamada. Pantalla: ${pantalla()}.`);
        }
        rec(n);
        s.vis = { vigentes: String(n).length };
        P(C, 6, `Listo: ${pantalla()}, en orden. Cada llamada imprimió su dígito al volver, de la más profunda (el primer dígito) a la primera.`, "exito");
      },
    },

    imprimirAlReves: {
      etiqueta: "imprimirAlReves(n)",
      usa: ["n"],
      codigo: "imprimirAlReves",
      ejecutar(s, { n }, paso) {
        const C = "imprimirAlReves";
        nuevaLlamada(s, String(n).length);
        conNumero(s, n);
        s.pantalla = [];
        const P = conNivel(s, paso);
        const pantalla = () => `"${s.pantalla.map((f) => `${f.v} `).join("")}"`;
        function rec(n) {
          const m = llamar(s, `imprimirAlReves(${n})`);
          const k = s.marcos.length;
          const largo = String(n).length;
          const cout = ficha(s, n % 10, celda(largo - 1));
          s.pantalla.push(cout);
          s.vis = { vigentes: largo, activos: [cout.id] };
          P(C, 2, `${k === 1 ? "" : `Nueva llamada con n = ${n}. `}cout << n % 10: imprime ${n % 10} de ida, ANTES de llamar. Pantalla: ${pantalla()}.`);
          if (n >= 10) {
            const q = Math.floor(n / 10);
            const h = hueco(s, `imprimirAlReves(${q})`, true);
            m.expr = [h, txt("; después: nada", "suave")];
            s.vis = { vigentes: largo - 1 };
            P(C, 4, `n = ${n} ≥ 10: llama a imprimirAlReves(${q}). A esta llamada no le queda nada por hacer después.`);
            rec(q);
            volver(s);
            h.texto = "✓ terminó";
            s.vis = { vigentes: largo - 1 };
            P(C, 6, k === 1
              ? `Volvió y termina sin hacer nada más. Pantalla: ${pantalla()}: el último dígito salió primero.`
              : `imprimirAlReves(${n}) vuelve de su llamada y termina: no tenía nada pendiente.`, k === 1 ? "exito" : "");
          } else {
            m.base = true;
            s.vis = { vigentes: largo };
            P(C, 3, `n = ${n} < 10: el if no entra. Caso base: no hay más llamadas.`);
            s.vis = { vigentes: largo };
            P(C, 6, k === 1 ? `Listo: ${pantalla()}.` : `imprimirAlReves(${n}) termina. Las de arriba terminan una tras otra, sin imprimir nada más.`, k === 1 ? "exito" : "");
          }
        }
        rec(n);
      },
    },

    invertir: {
      etiqueta: "invertir(n, 0)",
      usa: ["n"],
      codigo: "invertir",
      ejecutar(s, { n }, paso) {
        const C = "invertir";
        nuevaLlamada(s, String(n).length + 1);
        conNumero(s, n);
        const P = conNivel(s, paso);
        function rec(n, acumulado) {
          const m = llamar(s, `invertir(${n}, ${acumulado})`);
          const k = s.marcos.length;
          const largo = cifras(n);
          if (n === 0) {
            m.base = true;
            s.vis = { vigentes: 0 };
            P(C, 2, k === 1 ? "invertir(0, 0): n == 0, no hay dígitos que invertir." : `invertir(0, ${acumulado}): n == 0, ya no quedan dígitos.`);
            const r = ficha(s, acumulado);
            m.resultado = [r];
            s.vis = { vigentes: 0, activos: [r.id], salida: k === 1 ? r.v : null };
            P(C, 3, k === 1 ? "Caso base: devuelve acumulado = 0." : `Caso base: devuelve acumulado = ${acumulado}, que ya es el número invertido. Nadie arriba lo va a cambiar.`, k === 1 ? "exito" : "");
            return r;
          }
          s.vis = { vigentes: largo };
          P(C, 2, k === 1 ? `invertir(${n}, 0): n ≠ 0, quedan dígitos. acumulado empieza en 0.` : `Nueva llamada: n = ${n}, acumulado = ${acumulado}. n ≠ 0.`);
          const q = Math.floor(n / 10);
          const d = n % 10;
          const nuevo = acumulado * 10 + d;
          const digito = ficha(s, d, celda(largo - 1));
          const h = hueco(s, `invertir(${q}, ${nuevo})`);
          m.expr = [txt(`${acumulado}·10 +`, "suave"), digito, txt("→", "suave"), h];
          s.vis = { vigentes: largo - 1, activos: [digito.id] };
          P(C, 5, `acumulado * 10 + n % 10 = ${acumulado}·10 + ${d} = ${nuevo}: el último dígito pasa al acumulado. Llama a invertir(${q}, ${nuevo}) y no deja nada pendiente.`);
          const r = rec(q, nuevo);
          volver(s);
          h.lleno = [r];
          s.vis = { vigentes: largo - 1, activos: [r.id], salida: k === 1 ? r.v : null };
          P(C, 5, k === 1
            ? `invertir(${n}, 0) devuelve ${r.v}. El resultado se armó de ida, en acumulado; de vuelta solo subió sin cambios.`
            : `Devolvió ${r.v}, y esta llamada devuelve lo mismo, sin tocarlo: es recursión de cola.`, k === 1 ? "exito" : "");
          return r;
        }
        rec(n, 0);
      },
    },

    aBase: {
      etiqueta: "aBase(n, base)",
      usa: ["n", "base"],
      codigo: "aBase",
      ejecutar(s, { n, base }, paso) {
        const C = "aBase";
        const valida = n >= 0 && base >= 2 && base <= 16;
        nuevaLlamada(s, valida ? n.toString(base).length : 1);
        const P = conNivel(s, paso);
        const comillas = (fichas) => `"${fichas.map((f) => f.v).join("")}"`;
        function rec(n) {
          const m = llamar(s, `aBase(${n}, ${base})`);
          const k = s.marcos.length;
          if (k === 1) {
            if (!valida) {
              m.error = true;
              m.expr = [txt("throw std::invalid_argument", "mal")];
              s.vis = { sacudir: true, salida: "error", error: true };
              P(C, 3, n < 0
                ? `n = ${n} es negativo: no hay dígitos para eso. Lanza std::invalid_argument y no se llama a nadie.`
                : base < 2
                  ? `base = ${base}: con menos de 2 dígitos no se puede escribir (dividir entre ${base} nunca achica n${base === 1 ? "; la recursión no terminaría" : ""}). Lanza std::invalid_argument.`
                  : `base = ${base}: DIGITOS solo tiene 16 símbolos (0-9 y A-F). Lanza std::invalid_argument.`, "error");
              return null;
            }
            s.vis = {};
            P(C, 2, `aBase(${n}, ${base}): n ≥ 0 y la base está entre 2 y 16, se puede convertir.`);
          }
          if (n < base) {
            m.base = true;
            const r = ficha(s, DIGITOS[n], null, "car");
            m.resultado = [r];
            s.vis = { activos: [r.id], salida: k === 1 ? comillas([r]) : null };
            P(C, 6, `n = ${n} < ${base}: cabe en un solo dígito. Caso base: devuelve "${DIGITOS[n]}".`, k === 1 ? "exito" : "");
            return [r];
          }
          const q = Math.floor(n / base);
          const resto = n % base;
          const digito = ficha(s, DIGITOS[resto], null, "car");
          const h = hueco(s, `aBase(${q}, ${base})`);
          m.expr = [h, txt("+", "suave"), digito];
          m.nota = `${n} = ${q}·${base} + ${resto}`;
          s.vis = { activos: [digito.id] };
          P(C, 8, `${k === 1 ? "" : "La validación pasa otra vez. "}n = ${n} ≥ ${base}: ${n} ÷ ${base} = ${q}, resto ${resto} → '${DIGITOS[resto]}'. Es el ÚLTIMO dígito: espera a que aBase(${q}, ${base}) escriba los de adelante.`);
          const sub = rec(q);
          volver(s);
          h.lleno = sub;
          s.vis = { activos: sub.map((f) => f.id) };
          P(C, 8, `aBase(${q}, ${base}) devolvió ${comillas(sub)}: sube al hueco y su marco se cierra.`);
          h.lleno = null;
          h.texto = comillas(sub);
          m.expr = m.expr.map((x) => (x === digito ? txt(`'${digito.v}'`, "suave") : x));
          const r = [...sub, digito];
          m.resultado = r;
          s.vis = { activos: [digito.id], salida: k === 1 ? comillas(r) : null };
          P(C, 8, k === 1
            ? `${comillas(sub)} + '${digito.v}' = ${comillas(r)}. ${n} en base ${base} es ${comillas(r)}: los restos salieron del último al primero y la recursión los dejó en orden.`
            : `${comillas(sub)} + '${digito.v}' = ${comillas(r)}: el dígito de esta llamada va al final.`, k === 1 ? "exito" : "");
          return r;
        }
        rec(n);
      },
    },

    esPalindromo: {
      etiqueta: "esPalindromo(texto, 0, tamaño - 1)",
      usa: ["palabra"],
      codigo: "esPalindromo",
      ejecutar(s, { palabra }, paso) {
        const C = "esPalindromo";
        nuevaLlamada(s, Math.floor(palabra.length / 2) + 1);
        s.letras = { letras: palabra.split("").map((c, i) => ({ id: `l${i}`, v: c })), pares: {} };
        const P = conNivel(s, paso);
        function rec(i, j) {
          const m = llamar(s, `esPalindromo(texto, ${i}, ${j})`);
          const k = s.marcos.length;
          const marcas = { i, j };
          if (i >= j) {
            m.base = true;
            const r = ficha(s, "true", null, "verdadero");
            m.resultado = [r];
            s.vis = { marcas, activos: [r.id], salida: k === 1 ? "true" : null };
            P(C, 3, palabra.length === 0
              ? "El texto está vacío: i = 0 y j = -1 ya se cruzaron. Caso base: true (no hay nada que no coincida)."
              : i === j
                ? `i = j = ${i}: queda una sola letra en el medio, igual a sí misma. Caso base: devuelve true.`
                : `i = ${i} > j = ${j}: ya se cruzaron, se compararon todas las parejas. Caso base: devuelve true.`, k === 1 ? "exito" : "");
            return r;
          }
          const a = palabra[i];
          const b = palabra[j];
          s.vis = { marcas, comparando: [i, j] };
          P(C, 5, `${k === 1 ? "" : "Nueva llamada. "}i = ${i} < j = ${j}, así que compara texto[${i}] = '${a}' con texto[${j}] = '${b}'.`);
          if (a !== b) {
            m.base = true;
            s.letras.pares[i] = s.letras.pares[j] = "mal";
            const r = ficha(s, "false", null, "falso");
            m.resultado = [r];
            m.expr = [txt(`'${a}' ≠ '${b}'`, "mal")];
            s.vis = { marcas, activos: [r.id], sacudir: true, salida: k === 1 ? "false" : null };
            P(C, 6, `'${a}' ≠ '${b}': otro caso base. No hace falta mirar el resto: devuelve false.`);
            return r;
          }
          s.letras.pares[i] = s.letras.pares[j] = "bien";
          const h = hueco(s, `esPalindromo(texto, ${i + 1}, ${j - 1})`);
          m.expr = [txt(`'${a}' = '${b}' →`, "bien"), h];
          s.vis = { marcas: { i: i + 1, j: j - 1 } };
          P(C, 8, `'${a}' = '${b}'. La respuesta ahora depende solo de lo de adentro: llama con i + 1 = ${i + 1} y j - 1 = ${j - 1}.`);
          const r = rec(i + 1, j - 1);
          volver(s);
          h.lleno = [r];
          const fin = r.v === "true";
          s.vis = { marcas, activos: [r.id], salida: k === 1 ? r.v : null };
          P(C, 8, k === 1
            ? (fin ? `Devuelve true: "${palabra}" es un palíndromo. Cada llamada comparó una pareja, de afuera hacia adentro.` : `Devuelve false: "${palabra}" no es un palíndromo. El false subió sin cambios desde la llamada que encontró la diferencia.`)
            : `Devolvió ${r.v}; esta llamada devuelve lo mismo, sin tocarlo.`, k === 1 && fin ? "exito" : "");
          return r;
        }
        rec(0, palabra.length - 1);
      },
    },

    potencia: {
      etiqueta: "potencia(base, exponente)",
      usa: ["base", "exponente"],
      codigo: "potencia",
      ejecutar(s, { base, exponente }, paso) {
        const C = "potencia";
        nuevaLlamada(s, exponente ? Math.floor(Math.log2(exponente)) + 2 : 1);
        s.contador = { llamadas: 0, multiplicaciones: 0, conFor: Math.max(0, exponente - 1) };
        const P = conNivel(s, paso);
        const MAXIMO = 9223372036854775807n;
        const b = BigInt(base);
        function rec(e) {
          const m = llamar(s, `potencia(${base}, ${e})`);
          const k = s.marcos.length;
          s.contador.llamadas++;
          if (e === 0) {
            m.base = true;
            const r = ficha(s, 1);
            m.resultado = [r];
            s.vis = { activos: [r.id], salida: k === 1 ? "1" : null };
            P(C, 3, k === 1 ? `exponente = 0: caso base. ${base}⁰ = 1.` : "exponente = 0: caso base. Cualquier número elevado a 0 es 1: devuelve 1 sin llamarse.", k === 1 ? "exito" : "");
            return 1n;
          }
          const mitadE = Math.floor(e / 2);
          const h = hueco(s, `potencia(${base}, ${mitadE})`);
          m.expr = [txt("mitad =", "suave"), h];
          s.vis = { contador: ["llamadas"] };
          P(C, 5, `${base}^${e} = (${base}^${mitadE})²${e % 2 ? ` × ${base}` : ""}. Primero calcula la mitad: potencia(${base}, ${mitadE}).`);
          const sub = rec(mitadE);
          if (sub == null) return null;
          volver(s);
          const fm = ficha(s, sub);
          h.lleno = [fm];
          s.vis = { activos: [fm.id] };
          P(C, 5, `mitad = ${sub}. Se calcula UNA vez y se usa dos veces.`);
          const par = e % 2 === 0;
          const r = par ? sub * sub : sub * sub * b;
          const lineaR = par ? 7 : 9;
          const cuenta = par ? `${sub} × ${sub}` : `${sub} × ${sub} × ${base}`;
          if (r > MAXIMO || r < -MAXIMO - 1n) {
            m.error = true;
            m.expr = [txt(cuenta, "mal")];
            s.vis = { sacudir: true, salida: "error", error: true };
            P(C, lineaR, `${cuenta} = ${r} no cabe en un long long (máximo ${MAXIMO}): se desborda. En C++ eso es comportamiento indefinido; el resultado sería basura.`, "error");
            return null;
          }
          s.contador.multiplicaciones += par ? 1 : 2;
          const fr = ficha(s, r);
          m.expr = [txt(`mitad = ${sub}:`, "suave"), txt(cuenta)];
          m.resultado = [fr];
          s.vis = { activos: [fr.id], contador: ["multiplicaciones"], salida: k === 1 ? String(r) : null };
          P(C, lineaR, k === 1
            ? `${e} es ${par ? "par" : "impar"}: ${cuenta} = ${r}. potencia(${base}, ${e}) = ${r} con ${s.contador.multiplicaciones} multiplicaciones; con un for serían ${s.contador.conFor}.${s.contador.multiplicaciones >= s.contador.conFor ? " Con exponentes tan chicos no se gana nada: la ventaja se ve con los grandes." : ""}`
            : `${e} es ${par ? "par: mitad × mitad" : "impar: mitad × mitad × base"} = ${r}. Devuelve ${r}.`, k === 1 ? "exito" : "");
          return r;
        }
        rec(exponente);
      },
    },
  };

  // ------------------------------------------------------------------
  // Fibonacci: el árbol de llamadas, con y sin memoria
  // ------------------------------------------------------------------

  const DX = 46; // entre dos hojas
  const DY = 50; // entre dos niveles
  const ANCHO_NODO = 44;

  // Todas las llamadas que hará fibonacci(n) (o fibonacciMemo), en orden,
  // con su lugar en el árbol: las hojas de izquierda a derecha y cada padre
  // centrado sobre sus hijos.
  function arbolDeLlamadas(n, conMemo) {
    const nodos = [];
    const memo = [];
    const calculados = new Set();
    function rec(k, padre, prof) {
      const nodo = { id: `a${nodos.length}`, k, padre: padre ? padre.id : null, prof, hijos: [], tipo: "", repetido: k >= 2 && calculados.has(k) };
      nodos.push(nodo);
      if (padre) padre.hijos.push(nodo);
      if (k < 2) {
        nodo.tipo = "base";
        nodo.v = k;
      } else if (conMemo && memo[k] != null) {
        nodo.tipo = "memo";
        nodo.v = memo[k];
      } else {
        nodo.v = rec(k - 1, nodo, prof + 1) + rec(k - 2, nodo, prof + 1);
        if (conMemo) memo[k] = nodo.v;
      }
      calculados.add(k);
      return nodo.v;
    }
    rec(n, null, 0);
    let hojas = 0;
    (function ubicar(nodo) {
      if (!nodo.hijos.length) nodo.x = hojas++;
      else {
        nodo.hijos.forEach(ubicar);
        nodo.x = (nodo.hijos[0].x + nodo.hijos[nodo.hijos.length - 1].x) / 2;
      }
    })(nodos[0]);
    for (const nodo of nodos) nodo.hijos = nodo.hijos.map((h) => h.id);
    return { nodos, hojas, profundidad: Math.max(...nodos.map((x) => x.prof)) };
  }

  function animarFibonacci(s, n, conMemo, paso) {
    const C = conMemo ? "fibonacciMemo" : "fibonacci";
    const { nodos, hojas, profundidad } = arbolDeLlamadas(n, conMemo);
    const porId = Object.fromEntries(nodos.map((x) => [x.id, x]));
    nuevaLlamada(s, 0);
    s.arbol = { n, conMemo, hojas, profundidad, nodos: nodos.map(({ id, k, padre, prof, x, repetido }) => ({ id, k, padre, prof, x, repetido: !conMemo && repetido })), estado: {}, texto: {} };
    s.contador = { llamadas: 0, distintos: 0 };
    s.memo = conMemo ? Array.from({ length: n + 1 }, (_, i) => ({ id: `memo${i}`, v: "-1" })) : null;
    const camino = [];
    const vistos = new Set();
    const P = conNivel(s, paso, () => camino.length);
    const nombre = (k) => (conMemo ? `fibonacciMemo(${k}, memo)` : `fibonacci(${k})`);
    const ver = (vis) => { s.vis = Object.assign({ camino: camino.slice() }, vis); };

    function rec(id) {
      const nodo = porId[id];
      const k = nodo.k;
      camino.push(id);
      s.arbol.estado[id] = "pila";
      s.contador.llamadas++;
      if (!vistos.has(k)) { vistos.add(k); s.contador.distintos = vistos.size; }
      const raiz = camino.length === 1;
      const repetido = !conMemo && nodo.repetido ? ` fibonacci(${k}) ya se había calculado antes: todo lo que cuelga de aquí es trabajo repetido.` : "";
      if (nodo.tipo === "base") {
        s.arbol.estado[id] = "listo";
        s.arbol.texto[id] = String(k);
        ver({ actual: id, salida: raiz ? String(k) : null });
        P(C, 3, `${nombre(k)}: n < 2, caso base. Devuelve ${k}.`, raiz ? "exito" : "");
        camino.pop();
        return k;
      }
      if (nodo.tipo === "memo") {
        s.arbol.estado[id] = "memo";
        s.arbol.texto[id] = String(nodo.v);
        ver({ actual: id, vuela: { memo: k, a: id, v: nodo.v } });
        P(C, 6, `${nombre(k)}: memo[${k}] = ${nodo.v}, ya estaba calculado. Lo devuelve sin llamar a nadie: aquí se poda todo un subárbol.`);
        camino.pop();
        return nodo.v;
      }
      s.arbol.texto[id] = "? + ?";
      ver({ actual: id, repetido: !!repetido });
      P(C, conMemo ? 8 : 5, conMemo
        ? `${nombre(k)}: memo[${k}] = -1, todavía no se calculó. Llama primero a fibonacciMemo(${k - 1}, memo).`
        : `${nombre(k)}: n ≥ 2. Llama primero a fibonacci(${k - 1}).${repetido}`);
      const [h1, h2] = nodo.hijos;
      const a = rec(h1);
      s.arbol.texto[id] = `${a} + ?`;
      ver({ actual: id, vuela: { de: h1, a: id, v: a } });
      P(C, conMemo ? 8 : 5, `${nombre(k - 1)} devolvió ${a}. Ahora la segunda llamada: ${nombre(k - 2)}.`);
      const b = rec(h2);
      const v = a + b;
      s.arbol.estado[id] = "listo";
      s.arbol.texto[id] = String(v);
      if (conMemo) {
        s.memo[k] = { id: s.memo[k].id, v: String(v) };
        ver({ actual: id, vuela: { de: h2, a: id, v: b }, guarda: k });
        P(C, 8, `${a} + ${b} = ${v}. memo[${k}] = ${v}: queda guardado para la próxima vez que se pida.`);
        if (raiz) {
          ver({ actual: id, salida: String(v) });
          P(C, 9, `return memo[${k}]: devuelve ${v} con ${s.contador.llamadas} llamadas. Sin memo serían ${arbolDeLlamadas(n, false).nodos.length}.`, "exito");
        }
      } else {
        ver({ actual: id, vuela: { de: h2, a: id, v: b }, salida: raiz ? String(v) : null });
        P(C, 5, raiz
          ? `${a} + ${b} = ${v}: fibonacci(${k}) devuelve ${v}. Hizo ${s.contador.llamadas} llamadas para solo ${s.contador.distintos} valores distintos.`
          : `${a} + ${b} = ${v}: fibonacci(${k}) devuelve ${v}.`, raiz ? "exito" : "");
      }
      camino.pop();
      return v;
    }
    rec(nodos[0].id);
  }

  OPS.fibonacci = {
    etiqueta: "fibonacci(n)",
    usa: ["n"],
    codigo: "fibonacci",
    ejecutar: (s, { n }, paso) => animarFibonacci(s, n, false, paso),
  };
  OPS.fibonacciMemo = {
    etiqueta: "fibonacciMemo(n, memo)",
    usa: ["n"],
    codigo: "fibonacciMemo",
    ejecutar: (s, { n }, paso) => animarFibonacci(s, n, true, paso),
  };

  // ------------------------------------------------------------------
  // Dibujo de la pila de marcos
  // ------------------------------------------------------------------

  const sinMovimiento = () => typeof window !== "undefined" && window.matchMedia
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function dibujarFicha(s, f) {
    const activo = ((s.vis || {}).activos || []).includes(f.id);
    let clase = "rec-valor";
    if (f.clase) clase += ` ${f.clase}`;
    if (activo) clase += " activo";
    return el("span", { class: clase, "data-id": f.id, "data-desde": f.desde, text: f.v });
  }

  function dibujarPieza(s, p) {
    if (p.t === "ficha") return dibujarFicha(s, p);
    if (p.t === "txt") return el("span", { class: `rec-txt${p.clase ? ` ${p.clase}` : ""}`, text: p.v });
    // Hueco: la llamada de abajo y lo que devolvió (o ? mientras tanto).
    const contenido = p.lleno && p.lleno.length
      ? p.lleno.map((f) => dibujarFicha(s, f))
      : el("span", { class: p.texto ? "rec-hueco-texto" : "rec-hueco-vacio", text: p.texto || (p.sinValor ? "en curso…" : "?") });
    return el("span", { class: `rec-hueco${p.lleno || p.texto ? " lleno" : ""}`, "data-id": p.id },
      el("code", { text: p.etiqueta }), p.sinValor ? "" : el("span", { class: "rec-igual", text: "=" }), el("span", { class: "rec-hueco-valor" }, contenido));
  }

  function dibujarMarco(s, m, k, total) {
    const vis = s.vis || {};
    const actual = k === total - 1;
    let clase = "rec-marco";
    if (actual) clase += " actual";
    if (m.base) clase += " base";
    if (m.error) clase += " error";
    if (actual && vis.sacudir) clase += " sacudir";
    return el("div", { class: clase, "data-id": m.id, style: `--prof:${k}` },
      el("span", { class: "rec-prof", title: `Llamada número ${k + 1} en la pila`, text: k + 1 }),
      el("code", { class: "rec-llamada", text: m.llamada }),
      m.base && !m.error ? el("span", { class: "rec-etiqueta-base", text: "caso base" }) : "",
      m.expr.length ? el("span", { class: "rec-expr" }, m.expr.map((p) => dibujarPieza(s, p))) : "",
      m.nota ? el("span", { class: "rec-nota", text: m.nota }) : "",
      m.resultado ? el("span", { class: "rec-devuelve" }, el("span", { class: "rec-flecha", text: "devuelve" }), m.resultado.map((f) => dibujarFicha(s, f))) : "");
  }

  function dibujarNumero(s) {
    const vis = s.vis || {};
    const vigentes = vis.vigentes == null ? s.numero.cifras.length : vis.vigentes;
    return el("div", { class: "rec-fila" },
      el("span", { class: "fila-titulo", text: "n" }),
      el("div", { class: "rec-cifras" }, s.numero.cifras.map((c, i) =>
        el("span", { class: `rec-cifra${i < vigentes ? "" : " sacada"}`, "data-id": c.id, text: c.v }))));
  }

  function dibujarPantalla(s) {
    return el("div", { class: "rec-fila" },
      el("span", { class: "fila-titulo", text: "pantalla" }),
      el("div", { class: "rec-pantalla" }, s.pantalla.length ? s.pantalla.map((f) => dibujarFicha(s, f)) : el("span", { class: "rec-cursor", text: "▌" })));
  }

  function dibujarLetras(s) {
    const vis = s.vis || {};
    const marcas = vis.marcas || {};
    const comparando = vis.comparando || [];
    const letras = s.letras.letras;
    const columnas = letras.map((l, i) => {
      let clase = "rec-letra";
      if (s.letras.pares[i]) clase += ` ${s.letras.pares[i]}`;
      if (comparando.includes(i)) clase += " comparando";
      const nombres = [marcas.i === i ? "i" : "", marcas.j === i ? "j" : ""].filter(Boolean);
      return el("div", { class: "rec-letra-col" },
        el("span", { class: clase, text: l.v }),
        el("span", { class: "indice", text: i }),
        el("span", { class: "rec-marcas" }, nombres.map((x) => el("span", { class: "marcador", "data-id": `marca-${x}`, text: `▲${x}` }))));
    });
    // i o j fuera del texto (texto vacío, o j = -1): su marca va en un lugar aparte.
    const fuera = [["i", marcas.i], ["j", marcas.j]].filter(([, v]) => v != null && (v < 0 || v >= letras.length));
    return el("div", { class: "rec-fila" },
      el("span", { class: "fila-titulo", text: "texto" }),
      el("div", { class: "rec-letras" }, columnas.length ? columnas : el("span", { class: "rec-vacio", text: "\"\" (vacío)" }),
        fuera.length ? el("div", { class: "rec-letra-col fuera" }, el("span", { class: "rec-letra vacia", text: "" }), el("span", { class: "indice", text: "fuera" }),
          el("span", { class: "rec-marcas" }, fuera.map(([x, v]) => el("span", { class: "marcador", "data-id": `marca-${x}`, text: `▲${x}=${v}` })))) : ""));
  }

  function dibujarContador(s) {
    const cambio = (s.vis || {}).contador || [];
    const c = s.contador;
    const dato = (nombre, valor) => el("span", { class: cambio.includes(nombre) ? "cambio" : "" }, `${nombre} = `, el("b", { text: valor }));
    if (s.arbol) {
      return el("div", { class: "variables rec-contador" },
        dato("llamadas", c.llamadas), dato("valores distintos", c.distintos));
    }
    return el("div", { class: "variables rec-contador" },
      dato("llamadas", c.llamadas), dato("multiplicaciones", c.multiplicaciones),
      el("span", { class: "rec-comparacion" }, "con un for: ", el("b", { text: c.conFor })));
  }

  function infoPila(s) {
    const vis = s.vis || {};
    const n = s.marcos.length;
    return el("div", { class: "rec-info" },
      el("div", { class: "pila-llamadas", "aria-label": "Profundidad de la pila de llamadas" },
        n ? ["pila:", el("span", { class: "llamada", text: `${n} ${n === 1 ? "marco" : "marcos"}` })] : "pila vacía"),
      s.contador ? dibujarContador(s) : "",
      vis.salida != null
        ? el("div", { class: "salida-valor" }, vis.error ? "lanza" : "devuelve", el("div", { class: `celda ${vis.error || vis.salida === "false" ? "error" : "encontrada"}`, text: vis.error ? "excepción" : vis.salida }))
        : "");
  }

  function construir(s) {
    const total = s.marcos.length;
    return el("div", { class: `rec-contenido${s.apretado ? " apretado" : ""}` },
      infoPila(s),
      s.numero ? dibujarNumero(s) : "",
      s.letras ? dibujarLetras(s) : "",
      s.pantalla ? dibujarPantalla(s) : "",
      el("div", { class: "rec-marcos" }, total
        ? s.marcos.map((m, k) => dibujarMarco(s, m, k, total))
        : el("span", { class: "rec-vacio", text: "Todavía no hay llamadas: elige una operación." })));
  }

  function dibujarPila(escenario, s) {
    let lienzo = escenario.querySelector(".rec-lienzo");
    const antes = new Map();
    if (lienzo) {
      for (const nodo of lienzo.querySelectorAll(".rec-contenido [data-id]")) antes.set(nodo.dataset.id, { nodo, r: nodo.getBoundingClientRect() });
    } else {
      lienzo = el("div", { class: "rec-lienzo" }, el("div", { class: "rec-contenido" }), el("div", { class: "rec-fantasmas", "aria-hidden": "true" }));
      escenario.append(lienzo);
    }
    const contenido = construir(s);
    lienzo.querySelector(".rec-contenido").replaceWith(contenido);
    if (!antes.size || sinMovimiento() || !lienzo.offsetWidth) return;

    const k = parseFloat(getComputedStyle(lienzo).zoom) || 1;
    const base = lienzo.getBoundingClientRect();
    const nuevos = new Map();
    for (const nodo of contenido.querySelectorAll("[data-id]")) nuevos.set(nodo.dataset.id, nodo);

    // Desplazamiento de cada pieza que ya estaba (o que vuela desde su origen).
    const deltas = new Map();
    for (const [id, nodo] of nuevos) {
      const previo = antes.get(id) || (nodo.dataset.desde && antes.get(nodo.dataset.desde));
      if (!previo) {
        nodo.classList.add("rec-entra");
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
      nodo.classList.add("rec-vuela");
      const animacion = nodo.animate(
        vuela
          ? [{ transform: `translate(${x}px, ${y}px) scale(1.15)` }, { transform: "translate(0, 0) scale(1)" }]
          : [{ transform: `translate(${x}px, ${y}px)` }, { transform: "translate(0, 0)" }],
        { duration: DURACION, easing: "cubic-bezier(.3,.7,.3,1)" });
      animacion.onfinish = animacion.oncancel = () => nodo.classList.remove("rec-vuela");
    }

    // Lo que ya no está (un marco que se cierra) se desvanece en su lugar.
    const fantasmas = lienzo.querySelector(".rec-fantasmas");
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
      fantasma.classList.remove("rec-entra", "rec-vuela", "sacudir");
      fantasma.classList.add("rec-fantasma");
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
  // Dibujo del árbol de llamadas de Fibonacci
  // ------------------------------------------------------------------

  function escalarArbol(lienzo) {
    const escenario = lienzo.closest(".escenario");
    if (!escenario || !escenario.clientWidth) return; // paso oculto: se mide al mostrarlo
    const ancho = Number(lienzo.dataset.ancho);
    const alto = Number(lienzo.dataset.alto);
    const k = Math.max(0.55, Math.min(1, (escenario.clientWidth - 32) / ancho));
    lienzo.style.transform = k < 1 ? `scale(${k})` : "";
    const marco = lienzo.parentElement;
    marco.style.width = `${ancho * k}px`;
    marco.style.height = `${alto * k}px`;
  }

  if (typeof window !== "undefined") {
    window.addEventListener("resize", () => {
      for (const lienzo of document.querySelectorAll(".rec-arbol")) escalarArbol(lienzo);
    });
  }

  function dibujarArbol(escenario, s) {
    let info = escenario.querySelector(".rec-info");
    let lienzo = escenario.querySelector(".rec-arbol");
    if (!info) {
      info = el("div", { class: "rec-info" });
      lienzo = el("div", { class: "rec-arbol" });
      lienzo.append(document.createElementNS(SVG, "svg"));
      escenario.append(info, el("div", { class: "rec-marco-arbol" }, lienzo), el("div", { class: "rec-memo-fila" }));
    }
    const vis = s.vis || {};
    const a = s.arbol;
    // Sin operación todavía: solo el texto de ayuda.
    const nodos = a ? a.nodos : [];
    const camino = new Set(vis.camino || []);
    info.replaceWith(infoArbol(s));
    info = escenario.querySelector(".rec-info");

    const ancho = a ? (a.hojas - 1) * DX + ANCHO_NODO + 8 : 0;
    const alto = a ? a.profundidad * DY + 46 : 0;
    const clave = a ? `${a.n}-${a.conMemo}` : "";
    if (lienzo.dataset.clave !== clave) {
      // Otra llamada: el árbol se arma de nuevo.
      for (const viejo of lienzo.querySelectorAll(".rec-nodo, .rec-viajero")) viejo.remove();
      lienzo.dataset.clave = clave;
    }
    lienzo.dataset.ancho = ancho;
    lienzo.dataset.alto = alto;
    lienzo.style.width = `${ancho}px`;
    lienzo.style.height = `${alto}px`;
    escalarArbol(lienzo);

    const pos = {};
    for (const nodo of nodos) pos[nodo.id] = { x: 4 + nodo.x * DX, y: nodo.prof * DY };
    const visibles = a ? nodos.filter((x) => a.estado[x.id]) : [];
    const ids = new Set(visibles.map((x) => x.id));
    for (const caja of lienzo.querySelectorAll(".rec-nodo")) {
      if (!ids.has(caja.dataset.id)) caja.remove();
    }
    for (const nodo of visibles) {
      let caja = lienzo.querySelector(`.rec-nodo[data-id="${nodo.id}"]`);
      if (!caja) {
        caja = el("div", { class: "rec-nodo", "data-id": nodo.id },
          el("span", { class: "rec-nodo-k", text: `f(${nodo.k})` }), el("span", { class: "rec-nodo-v" }));
        lienzo.append(caja);
        if (vis.actual === nodo.id && !sinMovimiento()) caja.classList.add("rec-entra");
      }
      caja.style.left = `${pos[nodo.id].x}px`;
      caja.style.top = `${pos[nodo.id].y}px`;
      const estado = a.estado[nodo.id];
      const repetido = nodo.repetido;
      caja.className = `rec-nodo ${estado}${camino.has(nodo.id) ? " en-pila" : ""}${vis.actual === nodo.id ? " actual" : ""}${repetido ? " repetido" : ""}${caja.classList.contains("rec-entra") ? " rec-entra" : ""}`;
      caja.querySelector(".rec-nodo-v").textContent = a.texto[nodo.id] || "";
    }

    // Aristas de cada padre a sus hijos ya llamados.
    const svg = lienzo.querySelector("svg");
    svg.replaceChildren();
    for (const nodo of visibles) {
      if (nodo.padre == null) continue;
      const p = pos[nodo.padre];
      const h = pos[nodo.id];
      const linea = document.createElementNS(SVG, "line");
      linea.setAttribute("x1", p.x + ANCHO_NODO / 2);
      linea.setAttribute("y1", p.y + 36);
      linea.setAttribute("x2", h.x + ANCHO_NODO / 2);
      linea.setAttribute("y2", h.y);
      if (camino.has(nodo.id)) linea.setAttribute("class", "en-pila");
      svg.append(linea);
    }

    // memo[] de main, debajo del árbol.
    const filaMemo = escenario.querySelector(".rec-memo-fila");
    filaMemo.replaceChildren(s.memo
      ? el("div", { class: "rec-fila" }, el("span", { class: "fila-titulo", text: "memo" }),
        el("div", { class: "rec-memo" }, s.memo.map((c, i) => el("div", { class: "rec-letra-col" },
          el("span", { class: `rec-letra${c.v === "-1" ? " vacia-memo" : " lleno"}${vis.guarda === i ? " guarda" : ""}${vis.vuela && vis.vuela.memo === i ? " leida" : ""}`, "data-memo": i, text: c.v }),
          el("span", { class: "indice", text: i })))))
      : "");

    // El valor devuelto viaja del hijo al padre (o de memo al nodo, o del nodo a memo).
    if (vis.vuela && !sinMovimiento() && lienzo.offsetWidth) {
      const v = vis.vuela;
      const caja = (id) => lienzo.querySelector(`.rec-nodo[data-id="${id}"]`);
      const celdaMemo = (i) => filaMemo.querySelector(`[data-memo="${i}"]`);
      const k = lienzo.getBoundingClientRect().width / (Number(lienzo.dataset.ancho) || 1) || 1;
      const base = lienzo.getBoundingClientRect();
      const centro = (nodo) => {
        const r = nodo.getBoundingClientRect();
        return [(r.left + r.width / 2 - base.left) / k, (r.top + r.height / 2 - base.top) / k];
      };
      const origen = v.memo != null ? celdaMemo(v.memo) : caja(v.de);
      const destino = caja(v.a);
      if (origen && destino) viajar(lienzo, String(v.v), centro(origen), centro(destino));
      if (vis.guarda != null && caja(vis.actual) && celdaMemo(vis.guarda)) {
        setTimeout(() => viajar(lienzo, s.memo[vis.guarda].v, centro(caja(vis.actual)), centro(celdaMemo(vis.guarda))), DURACION * 0.6);
      }
    }
  }

  function viajar(lienzo, texto, [x1, y1], [x2, y2]) {
    const viajero = el("span", { class: "rec-viajero", text: texto });
    lienzo.append(viajero);
    viajero.style.left = `${x1}px`;
    viajero.style.top = `${y1}px`;
    const animacion = viajero.animate(
      [{ transform: "translate(-50%, -50%) scale(1.1)" }, { transform: `translate(calc(${x2 - x1}px - 50%), calc(${y2 - y1}px - 50%)) scale(1)` }],
      { duration: DURACION, easing: "cubic-bezier(.3,.7,.3,1)", fill: "forwards" });
    animacion.onfinish = animacion.oncancel = () => viajero.remove();
  }

  function infoArbol(s) {
    const vis = s.vis || {};
    const profundidad = (vis.camino || []).length;
    return el("div", { class: "rec-info" },
      el("div", { class: "pila-llamadas", "aria-label": "Profundidad de la pila de llamadas" },
        profundidad ? ["pila:", el("span", { class: "llamada", text: `${profundidad} ${profundidad === 1 ? "marco" : "marcos"}` })] : "pila vacía"),
      s.contador ? dibujarContador(s) : "",
      vis.repetido ? el("span", { class: "rec-aviso", text: "trabajo repetido" }) : "",
      vis.salida != null ? el("div", { class: "salida-valor" }, "devuelve", el("div", { class: "celda encontrada", text: vis.salida })) : "");
  }

  // ------------------------------------------------------------------
  // Visualizadores de la lección
  // ------------------------------------------------------------------

  function visualizador(contenedor, opciones) {
    DS.tema({
      contenedor,
      incremental: true,
      dibujar: opciones.dibujar || dibujarPila,
      codigo: Object.fromEntries(opciones.ops.map((id) => [OPS[id].codigo, CODIGO[OPS[id].codigo]])),
      tituloCodigo: (clave) => `${clave}()`,
      mensajeInicial: opciones.mensajeInicial,
      estadoInicial: estadoVacio,
      entradas: opciones.entradas,
      operaciones: opciones.ops.map((id) => Object.assign({ id }, opciones.adaptar ? opciones.adaptar(id) : OPS[id])),
    });
  }

  const numero = (id, etiqueta, valor, min, max) => ({ id, etiqueta, valor, min, max });
  const PALABRAS = ["reconocer", "recorrer", "radar", "abba", "sala", "x", ""];

  visualizador("vis-suma", {
    ops: ["sumaDigitos"],
    entradas: [numero("n", "n", 1234, 0, 99999)],
    mensajeInicial: "Pulsa sumaDigitos(n) y mira la pila: baja hasta el caso base y las sumas se hacen al volver.",
  });

  visualizador("vis-imprimir", {
    ops: ["imprimirDigitos", "imprimirAlReves"],
    entradas: [numero("n", "n", 1234, 0, 999999)],
    mensajeInicial: "Las dos funciones son casi iguales: solo cambia si el cout va antes o después de la llamada. Pruébalas y compara la pantalla.",
  });

  visualizador("vis-invertir", {
    ops: ["invertir"],
    entradas: [numero("n", "n", 1234, 0, 999999)],
    mensajeInicial: "Fíjate en acumulado: el resultado se arma de ida. Prueba también n = 1200.",
  });

  visualizador("vis-base", {
    ops: ["aBase"],
    entradas: [numero("n", "n", 13, -9, 999), numero("base", "base", 2, -1, 20)],
    mensajeInicial: "Convierte 13 a base 2. Después prueba 255 en base 16 y una base inválida, como 1.",
  });

  visualizador("vis-palindromo", {
    ops: ["esPalindromo"],
    entradas: [{ id: "palabra", etiqueta: "texto", opciones: PALABRAS.map((p) => [p, p ? `"${p}"` : "\"\" (vacío)"]), reinicia: false }],
    mensajeInicial: "Elige un texto: cada llamada compara una pareja de letras, de afuera hacia adentro.",
  });

  visualizador("vis-potencia", {
    ops: ["potencia"],
    entradas: [numero("base", "base", 2, -99, 99), numero("exponente", "exponente", 10, 0, 64)],
    mensajeInicial: "Calcula 2^10 y cuenta las multiplicaciones. Prueba un exponente grande, como 2^62, y uno que no quepa, como 10^19.",
  });

  visualizador("vis-fibonacci", {
    ops: ["fibonacci", "fibonacciMemo"],
    dibujar: dibujarArbol,
    entradas: [numero("n", "n", 5, 0, 6)],
    mensajeInicial: "Cada nodo es una llamada. Ejecuta fibonacci(5) y cuenta cuántas veces aparece f(2); después, fibonacciMemo.",
  });

  // En Todo junto, dos campos sirven a todas: n y b (la base o el exponente).
  const conDosCampos = (id) => {
    const op = OPS[id];
    if (id === "aBase") {
      return Object.assign({}, op, { usa: ["n", "b"], etiqueta: "aBase(n, b)", ejecutar: (s, args, paso) => op.ejecutar(s, { n: args.n, base: args.b }, paso) });
    }
    if (id === "potencia") {
      return Object.assign({}, op, { usa: ["n", "b"], etiqueta: "potencia(n, b)", ejecutar: (s, args, paso) => op.ejecutar(s, { base: args.n, exponente: args.b }, paso) });
    }
    return op;
  };

  visualizador("vis-todo", {
    ops: ["sumaDigitos", "imprimirDigitos", "imprimirAlReves", "invertir", "aBase", "potencia"],
    adaptar: conDosCampos,
    entradas: [numero("n", "n", 156, 0, 999), numero("b", "b", 16, 0, 64)],
    mensajeInicial: "Todas las funciones con la pila a la vista. b es la base de aBase o el exponente de potencia.",
  });
})();
