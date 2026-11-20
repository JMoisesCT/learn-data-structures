// Lección de recursión, en pasos. Los fragmentos de código deben coincidir
// línea por línea con ejemplos/cpp/recursion.cpp, y en inglés con
// ejemplos/cpp/en/recursion.cpp (scripts/verificar-fragmentos.mjs lo
// revisa). Los textos que se ven van en los dos idiomas con DS.tr.
(function () {
  const { el, tr } = DS;
  const SVG = "http://www.w3.org/2000/svg";
  const DURACION = 450;
  const DIGITOS = "0123456789ABCDEF";
  const MAXIMO_LL = 9223372036854775807n; // el long long más grande

  // ------------------------------------------------------------------
  // Fragmentos de C++ (copiados de ejemplos/cpp/recursion.cpp y de
  // ejemplos/cpp/en/recursion.cpp, con las mismas líneas)
  // ------------------------------------------------------------------

  const CODIGO = tr({
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
  }, {
    sumaDigitos: `
      int digitSum(int n) {
          if (n < 10) {
              return n;
          }
          return digitSum(n / 10) + n % 10;
      }`,
    imprimirDigitos: `
      void printDigits(int n) {
          if (n >= 10) {
              printDigits(n / 10);
          }
          std::cout << n % 10 << ' ';
      }`,
    imprimirAlReves: `
      void printReversed(int n) {
          std::cout << n % 10 << ' ';
          if (n >= 10) {
              printReversed(n / 10);
          }
      }`,
    invertir: `
      int reverseDigits(int n, int accumulated) {
          if (n == 0) {
              return accumulated;
          }
          return reverseDigits(n / 10, accumulated * 10 + n % 10);
      }`,
    aBase: `
      std::string toBase(int n, int base) {
          if (n < 0 || base < 2 || base > 16) {
              throw std::invalid_argument("n must be >= 0 and the base between 2 and 16");
          }
          if (n < base) {
              return std::string(1, DIGITS[n]);
          }
          return toBase(n / base, base) + DIGITS[n % base];
      }`,
    esPalindromo: `
      bool isPalindrome(const std::string& text, int i, int j) {
          if (i >= j) {
              return true;
          }
          if (text[i] != text[j]) {
              return false;
          }
          return isPalindrome(text, i + 1, j - 1);
      }`,
    potencia: `
      long long power(long long base, int exponent) {
          if (exponent == 0) {
              return 1;
          }
          long long half = power(base, exponent / 2);
          if (exponent % 2 == 0) {
              return half * half;
          }
          return half * half * base;
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
  });

  // Nombres del C++ en el idioma de la página: funciones y variables que se
  // dibujan. Las claves de CODIGO y de OPS quedan en español.
  const NOMBRES = tr({}, {
    sumaDigitos: "digitSum", imprimirDigitos: "printDigits", imprimirAlReves: "printReversed", invertir: "reverseDigits",
    aBase: "toBase", esPalindromo: "isPalindrome", potencia: "power",
    acumulado: "accumulated", DIGITOS: "DIGITS", texto: "text", exponente: "exponent", mitad: "half",
  });
  const nombre = (x) => NOMBRES[x] || x;

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

  // Si la recursión va a ser profunda, los marcos son más bajos (y más
  // todavía con más de 8 niveles, como aBase(999, 2)).
  // Cada operación empieza de cero (los ids siguen contando, para que nada
  // de la operación anterior se confunda con lo nuevo).
  function nuevaLlamada(s, profundidad) {
    Object.assign(s, estadoVacio(), { sig: s.sig, apretado: profundidad > 8 ? 2 : profundidad > 4 ? 1 : 0 });
  }

  // ------------------------------------------------------------------
  // Animaciones de cada función
  // ------------------------------------------------------------------

  const OPS = {
    sumaDigitos: {
      etiqueta: `${nombre("sumaDigitos")}(n)`,
      usa: ["n"],
      codigo: "sumaDigitos",
      ejecutar(s, { n }, paso) {
        const C = "sumaDigitos";
        const F = nombre(C);
        nuevaLlamada(s, String(n).length);
        conNumero(s, n);
        const P = conNivel(s, paso);
        function rec(n) {
          const m = llamar(s, `${F}(${n})`);
          const k = s.marcos.length;
          const largo = String(n).length;
          if (n < 10) {
            m.base = true;
            s.vis = { vigentes: 1 };
            P(C, 2, k === 1
              ? tr(`${F}(${n}): ¿n < 10? Sí, tiene un solo dígito.`, `${F}(${n}): n < 10? Yes, it has a single digit.`)
              : tr(`Nueva llamada con su propio n = ${n}. ¿n < 10? Sí: ya no se puede partir más.`, `New call with its own n = ${n}. n < 10? Yes: it can't be split any further.`));
            const r = ficha(s, n, celda(0));
            m.resultado = [r];
            s.vis = { vigentes: 1, activos: [r.id], salida: k === 1 ? r.v : null };
            P(C, 3, k === 1
              ? tr(`Caso base: devuelve ${n} sin llamarse. Con un solo dígito, la suma es el mismo dígito.`, `Base case: it returns ${n} without calling itself. With a single digit, the sum is that same digit.`)
              : tr(`Caso base: devuelve ${n} sin llamarse. Aquí la pila deja de crecer y empieza a bajar.`, `Base case: it returns ${n} without calling itself. Here the stack stops growing and starts shrinking.`), k === 1 ? "exito" : "");
            return r;
          }
          s.vis = { vigentes: largo };
          P(C, 2, k === 1
            ? tr(`${F}(${n}): ¿n < 10? No, tiene ${largo} dígitos. Hay que partirlo.`, `${F}(${n}): n < 10? No, it has ${largo} digits. It has to be split.`)
            : tr(`Nueva llamada, con su propio marco y su propio n = ${n}. ¿n < 10? No.`, `New call, with its own frame and its own n = ${n}. n < 10? No.`));
          const q = Math.floor(n / 10);
          const ultimo = ficha(s, n % 10, celda(largo - 1));
          const h = hueco(s, `${F}(${q})`);
          m.expr = [h, txt("+"), ultimo];
          s.vis = { vigentes: largo - 1, activos: [ultimo.id] };
          P(C, 5, tr(
            `n % 10 = ${n % 10} es el último dígito y n / 10 = ${q}, el resto. El ${n % 10} se queda esperando en este marco mientras ${F}(${q}) resuelve lo demás.`,
            `n % 10 = ${n % 10} is the last digit and n / 10 = ${q} is the rest. The ${n % 10} waits in this frame while ${F}(${q}) solves the rest.`));
          const sub = rec(q);
          volver(s);
          h.lleno = [sub];
          s.vis = { vigentes: largo - 1, activos: [sub.id] };
          P(C, 5, tr(`${F}(${q}) devolvió ${sub.v}: su marco se cierra y el valor sube al hueco que lo esperaba.`, `${F}(${q}) returned ${sub.v}: its frame closes and the value goes up into the slot that was waiting for it.`));
          const r = ficha(s, Number(sub.v) + (n % 10));
          m.resultado = [r];
          s.vis = { vigentes: largo, activos: [r.id], salida: k === 1 ? r.v : null };
          P(C, 5, k === 1
            ? tr(`${sub.v} + ${n % 10} = ${r.v}. ${F}(${n}) devuelve ${r.v}: cada llamada sumó un dígito al volver.`, `${sub.v} + ${n % 10} = ${r.v}. ${F}(${n}) returns ${r.v}: each call added one digit on the way back.`)
            : tr(`${sub.v} + ${n % 10} = ${r.v}: ${F}(${n}) devuelve ${r.v} a la llamada de arriba.`, `${sub.v} + ${n % 10} = ${r.v}: ${F}(${n}) returns ${r.v} to the call above.`), k === 1 ? "exito" : "");
          return r;
        }
        rec(n);
      },
    },

    imprimirDigitos: {
      etiqueta: `${nombre("imprimirDigitos")}(n)`,
      usa: ["n"],
      codigo: "imprimirDigitos",
      ejecutar(s, { n }, paso) {
        const C = "imprimirDigitos";
        const F = nombre(C);
        nuevaLlamada(s, String(n).length);
        conNumero(s, n);
        s.pantalla = [];
        const P = conNivel(s, paso);
        const pantalla = () => `"${s.pantalla.map((f) => `${f.v} `).join("")}"`;
        function rec(n) {
          const m = llamar(s, `${F}(${n})`);
          const k = s.marcos.length;
          const largo = String(n).length;
          const cout = ficha(s, n % 10, celda(largo - 1), "pendiente");
          if (n >= 10) {
            const q = Math.floor(n / 10);
            const h = hueco(s, `${F}(${q})`, true);
            m.expr = [h, txt(tr("; después cout <<", "; then cout <<"), "suave"), cout];
            s.vis = { vigentes: largo, activos: [cout.id] };
            P(C, 3, tr(
              `n = ${n} ≥ 10: primero llama a ${F}(${q}). El cout << ${n % 10} queda pendiente: está DESPUÉS de la llamada.`,
              `n = ${n} ≥ 10: first it calls ${F}(${q}). The cout << ${n % 10} is left pending: it comes AFTER the call.`));
            rec(q);
            volver(s);
            h.texto = tr("✓ terminó", "✓ done");
          } else {
            m.base = true;
            m.expr = [txt("cout <<", "suave"), cout];
            s.vis = { vigentes: largo, activos: [cout.id] };
            P(C, 2, k === 1
              ? tr(`n = ${n} < 10: el if no entra y no hay llamada.`, `n = ${n} < 10: the if is skipped and there is no call.`)
              : tr(`n = ${n} < 10: el if no entra. Caso base: esta llamada ya no llama a nadie.`, `n = ${n} < 10: the if is skipped. Base case: this call doesn't call anyone else.`));
          }
          // El dígito sale volando a la pantalla; en el marco queda la marca de impreso.
          m.expr = m.expr.map((x) => (x === cout ? txt(`${cout.v} ✓`, "bien") : x));
          cout.clase = "";
          s.pantalla.push(cout);
          s.vis = { vigentes: largo, activos: [cout.id] };
          P(C, 5, n >= 10
            ? tr(`Volvió de la llamada. Ahora sí: cout << ${n % 10}. Pantalla: ${pantalla()}.`, `Back from the call. Now it does: cout << ${n % 10}. Screen: ${pantalla()}.`)
            : tr(`cout << ${n}: es el primero que se imprime, aunque es la última llamada. Pantalla: ${pantalla()}.`, `cout << ${n}: it is the first one printed, even though it is the last call. Screen: ${pantalla()}.`));
        }
        rec(n);
        s.vis = { vigentes: String(n).length };
        P(C, 6, tr(
          `Listo: ${pantalla()}, en orden. Cada llamada imprimió su dígito al volver, de la más profunda (el primer dígito) a la primera.`,
          `Done: ${pantalla()}, in order. Each call printed its digit on the way back, from the deepest one (the first digit) to the first one.`), "exito");
      },
    },

    imprimirAlReves: {
      etiqueta: `${nombre("imprimirAlReves")}(n)`,
      usa: ["n"],
      codigo: "imprimirAlReves",
      ejecutar(s, { n }, paso) {
        const C = "imprimirAlReves";
        const F = nombre(C);
        nuevaLlamada(s, String(n).length);
        conNumero(s, n);
        s.pantalla = [];
        const P = conNivel(s, paso);
        const pantalla = () => `"${s.pantalla.map((f) => `${f.v} `).join("")}"`;
        function rec(n) {
          const m = llamar(s, `${F}(${n})`);
          const k = s.marcos.length;
          const largo = String(n).length;
          const cout = ficha(s, n % 10, celda(largo - 1));
          s.pantalla.push(cout);
          s.vis = { vigentes: largo, activos: [cout.id] };
          P(C, 2, tr(
            `${k === 1 ? "" : `Nueva llamada con n = ${n}. `}cout << n % 10: imprime ${n % 10} de ida, ANTES de llamar. Pantalla: ${pantalla()}.`,
            `${k === 1 ? "" : `New call with n = ${n}. `}cout << n % 10: it prints ${n % 10} on the way down, BEFORE the call. Screen: ${pantalla()}.`));
          if (n >= 10) {
            const q = Math.floor(n / 10);
            const h = hueco(s, `${F}(${q})`, true);
            m.expr = [h, txt(tr("; después: nada", "; then: nothing"), "suave")];
            s.vis = { vigentes: largo - 1 };
            P(C, 4, tr(`n = ${n} ≥ 10: llama a ${F}(${q}). A esta llamada no le queda nada por hacer después.`, `n = ${n} ≥ 10: it calls ${F}(${q}). This call has nothing left to do afterwards.`));
            rec(q);
            volver(s);
            h.texto = tr("✓ terminó", "✓ done");
            s.vis = { vigentes: largo };
            P(C, 6, k === 1
              ? tr(`Volvió y termina sin hacer nada más. Pantalla: ${pantalla()}: el último dígito salió primero.`, `It came back and ends without doing anything else. Screen: ${pantalla()}: the last digit came out first.`)
              : tr(`${F}(${n}) vuelve de su llamada y termina: no tenía nada pendiente.`, `${F}(${n}) comes back from its call and ends: it had nothing pending.`), k === 1 ? "exito" : "");
          } else {
            m.base = true;
            s.vis = { vigentes: largo };
            P(C, 3, tr(`n = ${n} < 10: el if no entra. Caso base: no hay más llamadas.`, `n = ${n} < 10: the if is skipped. Base case: no more calls.`));
            s.vis = { vigentes: largo };
            P(C, 6, k === 1
              ? tr(`Listo: ${pantalla()}.`, `Done: ${pantalla()}.`)
              : tr(`${F}(${n}) termina. Las de arriba terminan una tras otra, sin imprimir nada más.`, `${F}(${n}) ends. The ones above end one after another, without printing anything else.`), k === 1 ? "exito" : "");
          }
        }
        rec(n);
      },
    },

    invertir: {
      etiqueta: `${nombre("invertir")}(n, 0)`,
      usa: ["n"],
      codigo: "invertir",
      ejecutar(s, { n }, paso) {
        const C = "invertir";
        const F = nombre(C);
        const A = nombre("acumulado");
        nuevaLlamada(s, String(n).length + 1);
        conNumero(s, n);
        const P = conNivel(s, paso);
        function rec(n, acumulado) {
          const m = llamar(s, `${F}(${n}, ${acumulado})`);
          const k = s.marcos.length;
          const largo = cifras(n);
          if (n === 0) {
            m.base = true;
            s.vis = { vigentes: 0 };
            P(C, 2, k === 1
              ? tr(`${F}(0, 0): n == 0, no hay dígitos que invertir.`, `${F}(0, 0): n == 0, there are no digits to reverse.`)
              : tr(`${F}(0, ${acumulado}): n == 0, ya no quedan dígitos.`, `${F}(0, ${acumulado}): n == 0, there are no digits left.`));
            const r = ficha(s, acumulado);
            m.resultado = [r];
            s.vis = { vigentes: 0, activos: [r.id], salida: k === 1 ? r.v : null };
            P(C, 3, k === 1
              ? tr(`Caso base: devuelve ${A} = 0.`, `Base case: it returns ${A} = 0.`)
              : tr(`Caso base: devuelve ${A} = ${acumulado}, que ya es el número invertido. Nadie arriba lo va a cambiar.`, `Base case: it returns ${A} = ${acumulado}, which is already the reversed number. Nobody above will change it.`), k === 1 ? "exito" : "");
            return r;
          }
          s.vis = { vigentes: largo };
          P(C, 2, k === 1
            ? tr(`${F}(${n}, 0): n ≠ 0, quedan dígitos. ${A} empieza en 0.`, `${F}(${n}, 0): n ≠ 0, there are digits left. ${A} starts at 0.`)
            : tr(`Nueva llamada: n = ${n}, ${A} = ${acumulado}. n ≠ 0.`, `New call: n = ${n}, ${A} = ${acumulado}. n ≠ 0.`));
          const q = Math.floor(n / 10);
          const d = n % 10;
          const nuevo = acumulado * 10 + d;
          const digito = ficha(s, d, celda(largo - 1));
          const h = hueco(s, `${F}(${q}, ${nuevo})`);
          m.expr = [txt(`${acumulado}·10 +`, "suave"), digito, txt("→", "suave"), h];
          s.vis = { vigentes: largo - 1, activos: [digito.id] };
          P(C, 5, tr(
            `${A} * 10 + n % 10 = ${acumulado}·10 + ${d} = ${nuevo}: el último dígito pasa al acumulado. Llama a ${F}(${q}, ${nuevo}) y no deja nada pendiente.`,
            `${A} * 10 + n % 10 = ${acumulado}·10 + ${d} = ${nuevo}: the last digit moves into the accumulator. It calls ${F}(${q}, ${nuevo}) and leaves nothing pending.`));
          const r = rec(q, nuevo);
          volver(s);
          h.lleno = [r];
          s.vis = { vigentes: largo, activos: [r.id], salida: k === 1 ? r.v : null };
          P(C, 5, k === 1
            ? tr(`${F}(${n}, 0) devuelve ${r.v}. El resultado se armó de ida, en ${A}; de vuelta solo subió sin cambios.`, `${F}(${n}, 0) returns ${r.v}. The result was built on the way down, in ${A}; on the way back it only went up unchanged.`)
            : tr(`Devolvió ${r.v}, y esta llamada devuelve lo mismo, sin tocarlo: es recursión de cola.`, `It returned ${r.v}, and this call returns the same thing, untouched: it is tail recursion.`), k === 1 ? "exito" : "");
          return r;
        }
        rec(n, 0);
      },
    },

    aBase: {
      etiqueta: `${nombre("aBase")}(n, base)`,
      usa: ["n", "base"],
      codigo: "aBase",
      ejecutar(s, { n, base, sinTabla }, paso) {
        const C = "aBase";
        const F = nombre(C);
        const D = nombre("DIGITOS");
        const valida = n >= 0 && base >= 2 && base <= 16;
        nuevaLlamada(s, valida ? n.toString(base).length : 1);
        // La cadena DIGITOS, con cada símbolo bajo su posición (en Todo junto no hay lugar).
        if (!sinTabla) s.tabla = { base };
        const P = conNivel(s, paso);
        const comillas = (fichas) => `"${fichas.map((f) => f.v).join("")}"`;
        function rec(n) {
          const m = llamar(s, `${F}(${n}, ${base})`);
          const k = s.marcos.length;
          if (k === 1) {
            if (!valida) {
              m.error = true;
              m.expr = [txt("throw std::invalid_argument", "mal")];
              s.vis = { sacudir: true, salida: "error", error: true };
              P(C, 3, n < 0
                ? tr(`n = ${n} es negativo: no hay dígitos para eso. Lanza std::invalid_argument y no se llama a nadie.`, `n = ${n} is negative: there are no digits for that. It throws std::invalid_argument and no one is called.`)
                : base < 2
                  ? tr(`base = ${base}: con menos de 2 dígitos no se puede escribir (dividir entre ${base} nunca achica n${base === 1 ? "; la recursión no terminaría" : ""}). Lanza std::invalid_argument.`,
                    `base = ${base}: you can't write numbers with fewer than 2 digits (dividing by ${base} never makes n smaller${base === 1 ? "; the recursion would never end" : ""}). It throws std::invalid_argument.`)
                  : tr(`base = ${base}: ${D} solo tiene 16 símbolos (0-9 y A-F). Lanza std::invalid_argument.`, `base = ${base}: ${D} only has 16 symbols (0-9 and A-F). It throws std::invalid_argument.`), "error");
              return null;
            }
            s.vis = {};
            P(C, 2, tr(`${F}(${n}, ${base}): n ≥ 0 y la base está entre 2 y 16, se puede convertir.`, `${F}(${n}, ${base}): n ≥ 0 and the base is between 2 and 16, so it can be converted.`));
          }
          if (n < base) {
            m.base = true;
            const c = DIGITOS[n];
            const r = ficha(s, c, `d${n}`, "car comilla");
            m.expr = [txt("std::string(1,", "suave"), r, txt(")", "suave")];
            s.vis = { lee: n, activos: [r.id] };
            P(C, 6, tr(
              `n = ${n} < ${base}: cabe en un solo dígito (caso base). ${D}[${n}] es el char '${c}', el símbolo que vale ${n}. std::string(1, '${c}') arma un string con 1 copia de ese carácter.`,
              `n = ${n} < ${base}: it fits in a single digit (base case). ${D}[${n}] is the char '${c}', the symbol worth ${n}. std::string(1, '${c}') builds a string with 1 copy of that character.`));
            r.clase = "car";
            m.expr = [txt(`std::string(1, '${c}')`, "suave")];
            m.resultado = [r];
            s.vis = { activos: [r.id], salida: k === 1 ? comillas([r]) : null };
            P(C, 6, tr(
              `Devuelve "${c}", un std::string de largo 1. Hay que convertir el char porque ${F} devuelve std::string.`,
              `It returns "${c}", a std::string of length 1. The char has to be converted because ${F} returns std::string.`), k === 1 ? "exito" : "");
            return [r];
          }
          const q = Math.floor(n / base);
          const resto = n % base;
          const digito = ficha(s, DIGITOS[resto], `d${resto}`, "car comilla");
          const h = hueco(s, `${F}(${q}, ${base})`);
          m.expr = [h, txt("+", "suave"), digito];
          m.nota = `${n} = ${q}·${base} + ${resto}`;
          s.vis = { lee: resto, activos: [digito.id] };
          P(C, 8, tr(
            `${k === 1 ? "" : "La validación pasa otra vez. "}n = ${n} ≥ ${base}: ${n} ÷ ${base} = ${q}, resto ${resto}, y ${D}[${resto}] = '${DIGITOS[resto]}'. Es el ÚLTIMO dígito: espera a que ${F}(${q}, ${base}) escriba los de adelante.`,
            `${k === 1 ? "" : "The check passes again. "}n = ${n} ≥ ${base}: ${n} ÷ ${base} = ${q}, remainder ${resto}, and ${D}[${resto}] = '${DIGITOS[resto]}'. It is the LAST digit: it waits for ${F}(${q}, ${base}) to write the ones in front.`));
          const sub = rec(q);
          volver(s);
          h.lleno = sub;
          s.vis = { activos: sub.map((f) => f.id) };
          P(C, 8, tr(`${F}(${q}, ${base}) devolvió ${comillas(sub)}: sube al hueco y su marco se cierra.`, `${F}(${q}, ${base}) returned ${comillas(sub)}: it goes up into the slot and its frame closes.`));
          h.lleno = null;
          h.texto = comillas(sub);
          m.expr = m.expr.map((x) => (x === digito ? txt(`'${digito.v}'`, "suave") : x));
          digito.clase = "car";
          const r = [...sub, digito];
          m.resultado = r;
          s.vis = { activos: [digito.id], salida: k === 1 ? comillas(r) : null };
          P(C, 8, k === 1
            ? tr(`${comillas(sub)} + '${digito.v}' = ${comillas(r)} (string + char pega el carácter al final). ${n} en base ${base} es ${comillas(r)}: los restos salieron del último al primero y la recursión los dejó en orden.`,
              `${comillas(sub)} + '${digito.v}' = ${comillas(r)} (string + char appends the character at the end). ${n} in base ${base} is ${comillas(r)}: the remainders came out from last to first and the recursion put them in order.`)
            : tr(`${comillas(sub)} + '${digito.v}' = ${comillas(r)}: el dígito de esta llamada va al final.`, `${comillas(sub)} + '${digito.v}' = ${comillas(r)}: this call's digit goes at the end.`), k === 1 ? "exito" : "");
          return r;
        }
        rec(n);
      },
    },

    esPalindromo: {
      etiqueta: tr("esPalindromo(texto, 0, tamaño - 1)", "isPalindrome(text, 0, size - 1)"),
      usa: ["palabra"],
      codigo: "esPalindromo",
      ejecutar(s, { palabra }, paso) {
        const C = "esPalindromo";
        const F = nombre(C);
        const T = nombre("texto");
        nuevaLlamada(s, Math.floor(palabra.length / 2) + 1);
        s.letras = { letras: palabra.split("").map((c, i) => ({ id: `l${i}`, v: c })), pares: {} };
        const P = conNivel(s, paso);
        function rec(i, j) {
          const m = llamar(s, `${F}(${T}, ${i}, ${j})`);
          const k = s.marcos.length;
          const marcas = { i, j };
          if (i >= j) {
            m.base = true;
            const r = ficha(s, "true", null, "verdadero");
            m.resultado = [r];
            s.vis = { marcas, activos: [r.id], salida: k === 1 ? "true" : null };
            P(C, 3, palabra.length === 0
              ? tr("El texto está vacío: i = 0 y j = -1 ya se cruzaron. Caso base: true (no hay nada que no coincida).", "The text is empty: i = 0 and j = -1 have already crossed. Base case: true (there is nothing that doesn't match).")
              : i === j
                ? tr(`i = j = ${i}: queda una sola letra en el medio, igual a sí misma. Caso base: devuelve true.`, `i = j = ${i}: a single letter is left in the middle, equal to itself. Base case: it returns true.`)
                : tr(`i = ${i} > j = ${j}: ya se cruzaron, se compararon todas las parejas. Caso base: devuelve true.`, `i = ${i} > j = ${j}: they have crossed, every pair was compared. Base case: it returns true.`), k === 1 ? "exito" : "");
            return r;
          }
          const a = palabra[i];
          const b = palabra[j];
          s.vis = { marcas, comparando: [i, j] };
          P(C, 5, tr(
            `${k === 1 ? "" : "Nueva llamada. "}i = ${i} < j = ${j}, así que compara ${T}[${i}] = '${a}' con ${T}[${j}] = '${b}'.`,
            `${k === 1 ? "" : "New call. "}i = ${i} < j = ${j}, so it compares ${T}[${i}] = '${a}' with ${T}[${j}] = '${b}'.`));
          if (a !== b) {
            m.base = true;
            s.letras.pares[i] = s.letras.pares[j] = "mal";
            const r = ficha(s, "false", null, "falso");
            m.resultado = [r];
            m.expr = [txt(`'${a}' ≠ '${b}'`, "mal")];
            s.vis = { marcas, activos: [r.id], sacudir: true, salida: k === 1 ? "false" : null };
            P(C, 6, tr(`'${a}' ≠ '${b}': otro caso base. No hace falta mirar el resto: devuelve false.`, `'${a}' ≠ '${b}': another base case. There's no need to look at the rest: it returns false.`));
            return r;
          }
          s.letras.pares[i] = s.letras.pares[j] = "bien";
          const h = hueco(s, `${F}(${T}, ${i + 1}, ${j - 1})`);
          m.expr = [txt(`'${a}' = '${b}' →`, "bien"), h];
          s.vis = { marcas: { i: i + 1, j: j - 1 } };
          P(C, 8, tr(
            `'${a}' = '${b}'. La respuesta ahora depende solo de lo de adentro: llama con i + 1 = ${i + 1} y j - 1 = ${j - 1}.`,
            `'${a}' = '${b}'. The answer now depends only on what is inside: it calls with i + 1 = ${i + 1} and j - 1 = ${j - 1}.`));
          const r = rec(i + 1, j - 1);
          volver(s);
          h.lleno = [r];
          const fin = r.v === "true";
          s.vis = { marcas, activos: [r.id], salida: k === 1 ? r.v : null };
          P(C, 8, k === 1
            ? (fin
              ? tr(`Devuelve true: "${palabra}" es un palíndromo. Cada llamada comparó una pareja, de afuera hacia adentro.`, `It returns true: "${palabra}" is a palindrome. Each call compared one pair, from the outside in.`)
              : tr(`Devuelve false: "${palabra}" no es un palíndromo. El false subió sin cambios desde la llamada que encontró la diferencia.`, `It returns false: "${palabra}" is not a palindrome. The false went up unchanged from the call that found the mismatch.`))
            : tr(`Devolvió ${r.v}; esta llamada devuelve lo mismo, sin tocarlo.`, `It returned ${r.v}; this call returns the same thing, untouched.`), k === 1 && fin ? "exito" : "");
          return r;
        }
        rec(0, palabra.length - 1);
      },
    },

    potencia: {
      etiqueta: tr("potencia(base, exponente)", "power(base, exponent)"),
      usa: ["base", "exponente"],
      codigo: "potencia",
      ejecutar(s, { base, exponente }, paso) {
        const C = "potencia";
        const F = nombre(C);
        const M = nombre("mitad");
        nuevaLlamada(s, exponente ? Math.floor(Math.log2(exponente)) + 2 : 1);
        s.contador = { llamadas: 0, multiplicaciones: 0, conFor: Math.max(0, exponente - 1) };
        const P = conNivel(s, paso);
        const b = BigInt(base);
        function rec(e) {
          const m = llamar(s, `${F}(${base}, ${e})`);
          const k = s.marcos.length;
          s.contador.llamadas++;
          if (e === 0) {
            m.base = true;
            const r = ficha(s, 1);
            m.resultado = [r];
            s.vis = { activos: [r.id], salida: k === 1 ? "1" : null };
            P(C, 3, k === 1
              ? tr(`exponente = 0: caso base. ${base}⁰ = 1.`, `exponent = 0: base case. ${base}⁰ = 1.`)
              : tr("exponente = 0: caso base. Cualquier número elevado a 0 es 1: devuelve 1 sin llamarse.", "exponent = 0: base case. Any number raised to 0 is 1: it returns 1 without calling itself."), k === 1 ? "exito" : "");
            return 1n;
          }
          const mitadE = Math.floor(e / 2);
          const h = hueco(s, `${F}(${base}, ${mitadE})`);
          m.expr = [txt(`${M} =`, "suave"), h];
          s.vis = { contador: ["llamadas"] };
          P(C, 5, tr(
            `${base}^${e} = (${base}^${mitadE})²${e % 2 ? ` × ${base}` : ""}. Primero calcula la mitad: ${F}(${base}, ${mitadE}).`,
            `${base}^${e} = (${base}^${mitadE})²${e % 2 ? ` × ${base}` : ""}. First it computes the half: ${F}(${base}, ${mitadE}).`));
          const sub = rec(mitadE);
          if (sub == null) return null;
          volver(s);
          const fm = ficha(s, sub);
          h.lleno = [fm];
          s.vis = { activos: [fm.id] };
          P(C, 5, tr(`${M} = ${sub}. Se calcula UNA vez y se usa dos veces.`, `${M} = ${sub}. It is computed ONCE and used twice.`));
          const par = e % 2 === 0;
          const r = par ? sub * sub : sub * sub * b;
          const lineaR = par ? 7 : 9;
          const cuenta = par ? `${sub} × ${sub}` : `${sub} × ${sub} × ${base}`;
          if (r > MAXIMO_LL || r < -MAXIMO_LL - 1n) {
            m.error = true;
            m.expr = [txt(cuenta, "mal")];
            s.vis = { sacudir: true, salida: "error", error: true };
            P(C, lineaR, tr(
              `${cuenta} = ${r} no cabe en un long long (máximo ${MAXIMO_LL}): se desborda. En C++ eso es comportamiento indefinido; el resultado sería basura.`,
              `${cuenta} = ${r} doesn't fit in a long long (maximum ${MAXIMO_LL}): it overflows. In C++ that is undefined behavior; the result would be garbage.`), "error");
            return null;
          }
          s.contador.multiplicaciones += par ? 1 : 2;
          const fr = ficha(s, r);
          m.expr = [txt(`${M} = ${sub}:`, "suave"), txt(cuenta)];
          m.resultado = [fr];
          s.vis = { activos: [fr.id], contador: ["multiplicaciones"], salida: k === 1 ? String(r) : null };
          const pocas = s.contador.multiplicaciones >= s.contador.conFor;
          P(C, lineaR, k === 1
            ? tr(`${e} es ${par ? "par" : "impar"}: ${cuenta} = ${r}. ${F}(${base}, ${e}) = ${r} con ${s.contador.multiplicaciones} multiplicaciones; con un for serían ${s.contador.conFor}.${pocas ? " Con exponentes tan chicos no se gana nada: la ventaja se ve con los grandes." : ""}`,
              `${e} is ${par ? "even" : "odd"}: ${cuenta} = ${r}. ${F}(${base}, ${e}) = ${r} with ${s.contador.multiplicaciones} multiplications; with a for loop it would take ${s.contador.conFor}.${pocas ? " With exponents this small nothing is gained: the advantage shows with large ones." : ""}`)
            : tr(`${e} es ${par ? "par: mitad × mitad" : "impar: mitad × mitad × base"} = ${r}. Devuelve ${r}.`, `${e} is ${par ? "even: half × half" : "odd: half × half × base"} = ${r}. It returns ${r}.`), k === 1 ? "exito" : "");
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
    const llamadaDe = (k) => (conMemo ? `fibonacciMemo(${k}, memo)` : `fibonacci(${k})`);
    const ver = (vis) => { s.vis = Object.assign({ camino: camino.slice() }, vis); };

    function rec(id) {
      const nodo = porId[id];
      const k = nodo.k;
      camino.push(id);
      s.arbol.estado[id] = "pila";
      s.contador.llamadas++;
      if (!vistos.has(k)) { vistos.add(k); s.contador.distintos = vistos.size; }
      const raiz = camino.length === 1;
      const repetido = !conMemo && nodo.repetido
        ? tr(` fibonacci(${k}) ya se había calculado antes: todo lo que cuelga de aquí es trabajo repetido.`, ` fibonacci(${k}) had already been computed before: everything hanging from here is repeated work.`)
        : "";
      if (nodo.tipo === "base") {
        s.arbol.estado[id] = "listo";
        s.arbol.texto[id] = String(k);
        ver({ actual: id, salida: raiz ? String(k) : null });
        P(C, 3, tr(`${llamadaDe(k)}: n < 2, caso base. Devuelve ${k}.`, `${llamadaDe(k)}: n < 2, base case. It returns ${k}.`), raiz ? "exito" : "");
        camino.pop();
        return k;
      }
      if (nodo.tipo === "memo") {
        s.arbol.estado[id] = "memo";
        s.arbol.texto[id] = String(nodo.v);
        ver({ actual: id, vuela: { memo: k, a: id, v: nodo.v } });
        P(C, 6, tr(
          `${llamadaDe(k)}: memo[${k}] = ${nodo.v}, ya estaba calculado. Lo devuelve sin llamar a nadie: aquí se poda todo un subárbol.`,
          `${llamadaDe(k)}: memo[${k}] = ${nodo.v}, it was already computed. It returns it without calling anyone: a whole subtree is pruned here.`));
        camino.pop();
        return nodo.v;
      }
      s.arbol.texto[id] = "? + ?";
      ver({ actual: id, repetido: !!repetido });
      P(C, conMemo ? 8 : 5, conMemo
        ? tr(`${llamadaDe(k)}: memo[${k}] = -1, todavía no se calculó. Llama primero a fibonacciMemo(${k - 1}, memo).`, `${llamadaDe(k)}: memo[${k}] = -1, it hasn't been computed yet. First it calls fibonacciMemo(${k - 1}, memo).`)
        : tr(`${llamadaDe(k)}: n ≥ 2. Llama primero a fibonacci(${k - 1}).${repetido}`, `${llamadaDe(k)}: n ≥ 2. First it calls fibonacci(${k - 1}).${repetido}`));
      const [h1, h2] = nodo.hijos;
      const a = rec(h1);
      s.arbol.texto[id] = `${a} + ?`;
      ver({ actual: id, vuela: { de: h1, a: id, v: a } });
      P(C, conMemo ? 8 : 5, tr(`${llamadaDe(k - 1)} devolvió ${a}. Ahora la segunda llamada: ${llamadaDe(k - 2)}.`, `${llamadaDe(k - 1)} returned ${a}. Now the second call: ${llamadaDe(k - 2)}.`));
      const b = rec(h2);
      const v = a + b;
      s.arbol.estado[id] = "listo";
      s.arbol.texto[id] = String(v);
      if (conMemo) {
        s.memo[k] = { id: s.memo[k].id, v: String(v) };
        ver({ actual: id, vuela: { de: h2, a: id, v: b }, guarda: k });
        P(C, 8, tr(`${a} + ${b} = ${v}. memo[${k}] = ${v}: queda guardado para la próxima vez que se pida.`, `${a} + ${b} = ${v}. memo[${k}] = ${v}: it is stored for the next time it is asked for.`));
        if (raiz) {
          ver({ actual: id, salida: String(v) });
          const sinMemo = arbolDeLlamadas(n, false).nodos.length;
          P(C, 9, tr(`return memo[${k}]: devuelve ${v} con ${s.contador.llamadas} llamadas. Sin memo serían ${sinMemo}.`, `return memo[${k}]: it returns ${v} with ${s.contador.llamadas} calls. Without memo it would take ${sinMemo}.`), "exito");
        }
      } else {
        ver({ actual: id, vuela: { de: h2, a: id, v: b }, salida: raiz ? String(v) : null });
        P(C, 5, raiz
          ? tr(`${a} + ${b} = ${v}: fibonacci(${k}) devuelve ${v}. Hizo ${s.contador.llamadas} llamadas para solo ${s.contador.distintos} valores distintos.`, `${a} + ${b} = ${v}: fibonacci(${k}) returns ${v}. It made ${s.contador.llamadas} calls for only ${s.contador.distintos} distinct values.`)
          : tr(`${a} + ${b} = ${v}: fibonacci(${k}) devuelve ${v}.`, `${a} + ${b} = ${v}: fibonacci(${k}) returns ${v}.`), raiz ? "exito" : "");
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
      : el("span", { class: p.texto ? "rec-hueco-texto" : "rec-hueco-vacio", text: p.texto || (p.sinValor ? tr("en curso…", "running…") : "?") });
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
      el("span", { class: "rec-prof", title: tr(`Llamada número ${k + 1} en la pila`, `Call number ${k + 1} on the stack`), text: k + 1 }),
      el("code", { class: "rec-llamada", text: m.llamada }),
      m.base && !m.error ? el("span", { class: "rec-etiqueta-base", text: tr("caso base", "base case") }) : "",
      m.expr.length ? el("span", { class: "rec-expr" }, m.expr.map((p) => dibujarPieza(s, p))) : "",
      m.nota ? el("span", { class: "rec-nota", text: m.nota }) : "",
      m.resultado ? el("span", { class: "rec-devuelve" }, el("span", { class: "rec-flecha", text: tr("devuelve", "returns") }), m.resultado.map((f) => dibujarFicha(s, f))) : "");
  }

  function dibujarNumero(s) {
    const vis = s.vis || {};
    const vigentes = vis.vigentes == null ? s.numero.cifras.length : vis.vigentes;
    return el("div", { class: "rec-fila" },
      el("span", { class: "fila-titulo", text: "n" }),
      el("div", { class: "rec-cifras" }, s.numero.cifras.map((c, i) =>
        el("span", { class: `rec-cifra${i < vigentes ? "" : " sacada"}`, "data-id": c.id, text: c.v }))));
  }

  // DIGITOS[k] es el símbolo que vale k; los que la base no usa quedan tenues.
  function dibujarTabla(s) {
    const vis = s.vis || {};
    return el("div", { class: "rec-fila" },
      el("span", { class: "fila-titulo", text: nombre("DIGITOS") }),
      el("div", { class: "rec-tabla" }, DIGITOS.split("").map((c, i) =>
        el("div", { class: "rec-letra-col" },
          el("span", { class: `rec-tabla-celda${i >= s.tabla.base ? " sin-usar" : ""}${vis.lee === i ? " leida" : ""}`, "data-id": `d${i}`, text: c }),
          el("span", { class: "indice", text: i })))));
  }

  function dibujarPantalla(s) {
    return el("div", { class: "rec-fila" },
      el("span", { class: "fila-titulo", text: tr("pantalla", "screen") }),
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
      el("span", { class: "fila-titulo", text: nombre("texto") }),
      el("div", { class: "rec-letras" }, columnas.length ? columnas : el("span", { class: "rec-vacio", text: tr("\"\" (vacío)", "\"\" (empty)") }),
        fuera.length ? el("div", { class: "rec-letra-col fuera" }, el("span", { class: "rec-letra vacia", text: "" }), el("span", { class: "indice", text: tr("fuera", "outside") }),
          el("span", { class: "rec-marcas" }, fuera.map(([x, v]) => el("span", { class: "marcador", "data-id": `marca-${x}`, text: `▲${x}=${v}` })))) : ""));
  }

  function dibujarContador(s) {
    const cambio = (s.vis || {}).contador || [];
    const c = s.contador;
    // Las claves (llamadas, multiplicaciones…) son las del estado; se muestran en el idioma de la página.
    const ROTULOS = { llamadas: tr("llamadas", "calls"), multiplicaciones: tr("multiplicaciones", "multiplications"), distintos: tr("valores distintos", "distinct values") };
    const dato = (clave, valor) => el("span", { class: cambio.includes(clave) ? "cambio" : "" }, `${ROTULOS[clave]} = `, el("b", { text: valor }));
    if (s.arbol) {
      return el("div", { class: "variables rec-contador" },
        dato("llamadas", c.llamadas), dato("distintos", c.distintos));
    }
    return el("div", { class: "variables rec-contador" },
      dato("llamadas", c.llamadas), dato("multiplicaciones", c.multiplicaciones),
      el("span", { class: "rec-comparacion" }, tr("con un for: ", "with a for loop: "), el("b", { text: c.conFor })));
  }

  const marcosTexto = (n) => (n === 1 ? tr("1 marco", "1 frame") : tr(`${n} marcos`, `${n} frames`));

  function infoPila(s) {
    const vis = s.vis || {};
    const n = s.marcos.length;
    return el("div", { class: "rec-info" },
      el("div", { class: "pila-llamadas", "aria-label": tr("Profundidad de la pila de llamadas", "Call stack depth") },
        n ? [tr("pila:", "stack:"), el("span", { class: "llamada", text: marcosTexto(n) })] : tr("pila vacía", "empty stack")),
      s.contador ? dibujarContador(s) : "",
      vis.salida != null
        ? el("div", { class: "salida-valor" }, vis.error ? tr("lanza", "throws") : tr("devuelve", "returns"), el("div", { class: `celda ${vis.error || vis.salida === "false" ? "error" : "encontrada"}`, text: vis.error ? tr("excepción", "exception") : vis.salida }))
        : "");
  }

  function construir(s) {
    const total = s.marcos.length;
    return el("div", { class: `rec-contenido${s.apretado ? " apretado" : ""}${s.apretado > 1 ? " muy-apretado" : ""}` },
      infoPila(s),
      s.numero ? dibujarNumero(s) : "",
      s.tabla ? dibujarTabla(s) : "",
      s.letras ? dibujarLetras(s) : "",
      s.pantalla ? dibujarPantalla(s) : "",
      el("div", { class: "rec-marcos" }, total
        ? s.marcos.map((m, k) => dibujarMarco(s, m, k, total))
        : el("span", { class: "rec-vacio", text: tr("Todavía no hay llamadas: elige una operación.", "No calls yet: choose an operation.") })));
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
      el("div", { class: "pila-llamadas", "aria-label": tr("Profundidad de la pila de llamadas", "Call stack depth") },
        profundidad ? [tr("pila:", "stack:"), el("span", { class: "llamada", text: marcosTexto(profundidad) })] : tr("pila vacía", "empty stack")),
      s.contador ? dibujarContador(s) : "",
      vis.repetido ? el("span", { class: "rec-aviso", text: tr("trabajo repetido", "repeated work") }) : "",
      vis.salida != null ? el("div", { class: "salida-valor" }, tr("devuelve", "returns"), el("div", { class: "celda encontrada", text: vis.salida })) : "");
  }

  // ------------------------------------------------------------------
  // Un visualizador: DS.tema con las operaciones elegidas
  // ------------------------------------------------------------------

  function visualizador(contenedor, opciones) {
    DS.tema({
      contenedor,
      incremental: true,
      dibujar: opciones.dibujar || dibujarPila,
      codigo: Object.fromEntries(opciones.ops.map((id) => [OPS[id].codigo, CODIGO[OPS[id].codigo]])),
      tituloCodigo: (clave) => `${nombre(clave)}()`,
      mensajeInicial: opciones.mensajeInicial,
      estadoInicial: opciones.estadoInicial || estadoVacio,
      entradas: opciones.entradas,
      operaciones: opciones.ops.map((id) => Object.assign({ id }, opciones.adaptar ? opciones.adaptar(id) : OPS[id])),
    });
  }

  const numero = (id, etiqueta, valor, min, max, alCambiar) => ({ id, etiqueta, valor, min, max, alCambiar });
  // Los textos de esPalindromo cumplen papeles: un palíndromo largo, uno que
  // falla recién en la tercera pareja, uno impar corto, uno par, uno que
  // falla enseguida, una letra y el vacío. En inglés, palabras con los
  // mismos papeles.
  const PALABRAS = tr(["reconocer", "recorrer", "radar", "abba", "sala", "x", ""], ["racecar", "remember", "radar", "noon", "hello", "x", ""]);
  // Estado inicial de esPalindromo: el texto ya a la vista, sin llamadas.
  function conLetras(palabra) {
    const s = estadoVacio();
    s.letras = { letras: palabra.split("").map((c, i) => ({ id: `l${i}`, v: c })), pares: {} };
    return s;
  }

  // ------------------------------------------------------------------
  // Vista previa al escribir: el número que se escribe se dibuja enseguida,
  // sin llamadas. Conserva el contador de ids: las cifras que ya estaban se
  // quedan, las nuevas aparecen y los marcos de la operación anterior se
  // desvanecen.
  // ------------------------------------------------------------------

  function previa(s, armar) {
    const p = Object.assign(estadoVacio(), { sig: s.sig });
    if (armar) armar(p);
    return p;
  }
  const conCifras = (s, n, pantalla) => previa(s, (p) => {
    conNumero(p, n);
    if (pantalla) p.pantalla = [];
  });
  const digitos = (n) => (String(n).length === 1 ? tr("un solo dígito", "a single digit") : tr(`${String(n).length} dígitos`, `${String(n).length} digits`));
  // base^exponente escrito sin ambigüedad: (−3)^5, no −3^5.
  const elevado = (base, e) => `${base < 0 ? `(${base})` : base}^${e}`;

  // ¿potencia(base, e) se desborda? Igual que la animación: alguna llamada
  // da un resultado que no cabe en un long long.
  function desborda(base, e) {
    const b = BigInt(base);
    function rec(e) {
      if (e === 0) return 1n;
      const mitad = rec(Math.floor(e / 2));
      if (mitad == null) return null;
      const r = e % 2 === 0 ? mitad * mitad : mitad * mitad * b;
      return r > MAXIMO_LL || r < -MAXIMO_LL - 1n ? null : r;
    }
    return rec(e) == null;
  }
  // El primer exponente (de 0 a 64) que ya no cabe, o null si ninguno.
  function inicioDesborde(base) {
    for (let e = 0; e <= 64; e++) if (desborda(base, e)) return e;
    return null;
  }

  // ------------------------------------------------------------------
  // Ejemplos de un clic: ponen los valores como si se escribieran (así la
  // muesca, el dibujo y el mensaje se actualizan) y ejecutan la operación.
  // Se bloquean junto con los botones mientras corre una animación.
  // ------------------------------------------------------------------

  // enLinea: junto a los botones (cuando sobra espacio); si no, en su propia
  // fila bajo los botones, más baja que una fila de botones.
  function ejemplos(contenedor, lista, enLinea) {
    if (typeof document === "undefined") return;
    const raiz = document.getElementById(contenedor);
    const controles = raiz && raiz.querySelector(".controles");
    if (!controles) return;
    const botones = [...controles.querySelectorAll("button.principal")];
    const chips = lista.map((ej) => el("button", {
      type: "button", class: "rec-ejemplo", title: ej.titulo || null, text: ej.texto,
      onclick: () => {
        const boton = botones[ej.op || 0];
        if (!boton || boton.disabled) return;
        for (const [id, v] of Object.entries(ej.valores)) {
          const input = document.getElementById(`${contenedor}-${id}`);
          input.value = v;
          input.dispatchEvent(new Event("input", { bubbles: true }));
        }
        boton.click();
      },
    }));
    const grupo = el("span", { class: `rec-ejemplos${enLinea ? " en-linea" : ""}` }, el("span", { class: "rec-ejemplos-titulo", text: tr("Prueba:", "Try:") }), chips);
    if (enLinea) controles.insertBefore(grupo, controles.querySelector(".separador"));
    else controles.append(grupo);
    const sincronizar = () => { for (const c of chips) c.disabled = botones[0].disabled; };
    new MutationObserver(sincronizar).observe(botones[0], { attributes: true, attributeFilter: ["disabled"] });
  }

  // ------------------------------------------------------------------
  // Deslizador del exponente: el riel se pone rojo desde el primer exponente
  // que no cabe en un long long con la base elegida.
  // ------------------------------------------------------------------

  function deslizadorExponente(contenedor) {
    if (typeof document === "undefined") return;
    const inExp = document.getElementById(`${contenedor}-exponente`);
    const inBase = document.getElementById(`${contenedor}-base`);
    if (!inExp || !inBase) return;
    const desl = el("input", { type: "range", class: "rec-deslizador", min: 0, max: 64, step: 1, "aria-label": nombre("exponente") });
    desl.value = inExp.value;
    const pintar = () => {
      const base = Number(inBase.value);
      const zona = Number.isInteger(base) ? inicioDesborde(base) : null;
      // El corte cae entre zona − 1 y zona, medido como el centro del pulgar (16 px).
      desl.style.setProperty("--corte", zona == null ? "100%" : `calc(8px + ${(zona - 0.5) / 64} * (100% - 16px))`);
      desl.classList.toggle("en-zona", zona != null && Number(desl.value) >= zona);
      desl.title = zona == null
        ? tr(`Con base ${base}, ningún exponente se desborda`, `With base ${base}, no exponent overflows`)
        : tr(`Desde ${elevado(base, zona)} no cabe en un long long`, `From ${elevado(base, zona)} on, it doesn't fit in a long long`);
    };
    desl.addEventListener("input", () => {
      inExp.value = desl.value;
      inExp.dispatchEvent(new Event("input", { bubbles: true }));
    });
    inExp.addEventListener("input", () => {
      const e = Number(inExp.value);
      if (inExp.value.trim() !== "" && Number.isInteger(e) && e >= 0 && e <= 64) desl.value = e;
      pintar();
    });
    inBase.addEventListener("input", pintar);
    inExp.closest(".campo").after(desl);
    pintar();
  }

  // ------------------------------------------------------------------
  // Visualizadores de la lección
  // ------------------------------------------------------------------

  visualizador("vis-suma", {
    ops: ["sumaDigitos"],
    entradas: [numero("n", "n", 1234, 0, 99999, (s, { n }) => ({
      estado: conCifras(s, n),
      mensaje: tr(`n = ${n}, con ${digitos(n)}. Pulsa ${nombre("sumaDigitos")}(n) y cuenta los marcos que abre la pila.`,
        `n = ${n}, with ${digitos(n)}. Press ${nombre("sumaDigitos")}(n) and count the frames the stack opens.`),
    }))],
    mensajeInicial: tr(
      "Pulsa sumaDigitos(n) y mira la pila: baja hasta el caso base y las sumas se hacen al volver.",
      "Press digitSum(n) and watch the stack: it goes down to the base case and the sums are done on the way back."),
  });
  ejemplos("vis-suma", [{ texto: "7", valores: { n: 7 } }, { texto: "1234", valores: { n: 1234 } }, { texto: "90817", valores: { n: 90817 } }], true);

  visualizador("vis-imprimir", {
    ops: ["imprimirDigitos", "imprimirAlReves"],
    entradas: [numero("n", "n", 1234, 0, 999999, (s, { n }) => ({
      estado: conCifras(s, n, true),
      mensaje: tr(`n = ${n}. ¿En qué orden saldrán sus dígitos con cada función? Pruébalas y compara la pantalla.`,
        `n = ${n}. In what order will its digits come out with each function? Try both and compare the screen.`),
    }))],
    mensajeInicial: tr(
      "Las dos funciones son casi iguales: solo cambia si el cout va antes o después de la llamada. Pruébalas y compara la pantalla.",
      "The two functions are almost the same: the only change is whether the cout goes before or after the call. Try both and compare the screen."),
  });
  ejemplos("vis-imprimir", [
    { texto: `${nombre("imprimirDigitos")}(507)`, valores: { n: 507 }, op: 0 },
    { texto: `${nombre("imprimirAlReves")}(507)`, valores: { n: 507 }, op: 1 },
  ]);

  visualizador("vis-invertir", {
    ops: ["invertir"],
    entradas: [numero("n", "n", 1234, 0, 999999, (s, { n }) => ({
      estado: conCifras(s, n),
      mensaje: tr(`n = ${n}: ${nombre("acumulado")} empieza en 0 y cada llamada le pasa el último dígito que queda.`,
        `n = ${n}: ${nombre("acumulado")} starts at 0 and each call hands it the last digit left.`),
    }))],
    mensajeInicial: tr(
      "Fíjate en acumulado: el resultado se arma de ida. Prueba también n = 1200.",
      "Watch accumulated: the result is built on the way down. Also try n = 1200."),
  });
  ejemplos("vis-invertir", [{ texto: "1234", valores: { n: 1234 } }, { texto: "1200", valores: { n: 1200 } }], true);

  // aBase: al escribir, DIGITOS muestra qué símbolos usa la base.
  const previaBase = (s, { n, base }) => {
    const F = nombre("aBase");
    return {
      estado: previa(s, (p) => { p.tabla = { base }; }),
      mensaje: n < 0
        ? tr(`n = ${n} es negativo: ${F} lanzará std::invalid_argument.`, `n = ${n} is negative: ${F} will throw std::invalid_argument.`)
        : base < 2 || base > 16
          ? tr(`base = ${base}: fuera de 2 a 16, ${F} lanzará std::invalid_argument.`, `base = ${base}: outside 2 to 16, ${F} will throw std::invalid_argument.`)
          : tr(`${n} en base ${base}: cada llamada divide entre ${base} y el resto elige el símbolo de ${nombre("DIGITOS")}.`,
            `${n} in base ${base}: each call divides by ${base} and the remainder picks the symbol from ${nombre("DIGITOS")}.`),
    };
  };
  visualizador("vis-base", {
    ops: ["aBase"],
    entradas: [numero("n", "n", 13, -9, 999, previaBase), numero("base", "base", 2, -1, 20, previaBase)],
    mensajeInicial: tr(
      "Convierte 13 a base 2. Después prueba 255 en base 16 y una base inválida, como 1.",
      "Convert 13 to base 2. Then try 255 in base 16 and an invalid base, like 1."),
  });
  ejemplos("vis-base", [
    { texto: tr("13 en base 2", "13 in base 2"), valores: { n: 13, base: 2 } },
    { texto: tr("255 en base 16", "255 in base 16"), valores: { n: 255, base: 16 } },
    { texto: tr("base 1", "base 1"), titulo: tr("Una base inválida: lanza std::invalid_argument", "An invalid base: it throws std::invalid_argument"), valores: { n: 13, base: 1 } },
  ]);

  visualizador("vis-palindromo", {
    ops: ["esPalindromo"],
    entradas: [{
      id: "palabra", etiqueta: nombre("texto"), opciones: PALABRAS.map((p) => [p, p ? `"${p}"` : tr("\"\" (vacío)", "\"\" (empty)")]),
      // El texto elegido se ve enseguida, letra por letra.
      alCambiar: (s, { palabra }) => ({
        estado: conLetras(palabra),
        mensaje: palabra.length > 1
          ? tr(`texto = "${palabra}": ${palabra.length} letras. Cada llamada compara la primera y la última que quedan, y se mete hacia adentro.`,
            `text = "${palabra}": ${palabra.length} letters. Each call compares the first and the last ones left, and moves inward.`)
          : tr(`texto = "${palabra}": con ${palabra.length ? "una letra" : "el texto vacío"} no hay parejas que comparar. Es un caso base.`,
            `text = "${palabra}": with ${palabra.length ? "a single letter" : "the empty text"} there are no pairs to compare. It is a base case.`),
      }),
    }],
    estadoInicial: ({ palabra }) => conLetras(palabra),
    mensajeInicial: tr(
      "Elige un texto: cada llamada compara una pareja de letras, de afuera hacia adentro.",
      "Choose a text: each call compares a pair of letters, from the outside in."),
  });

  // potencia: al escribir, el contador muestra cuánto costaría con un for y
  // el mensaje dice si el resultado cabe en un long long.
  const previaPotencia = (s, { base, exponente }) => {
    const zona = inicioDesborde(base);
    const conFor = Math.max(0, exponente - 1);
    return {
      estado: previa(s, (p) => { p.contador = { llamadas: 0, multiplicaciones: 0, conFor }; }),
      mensaje: zona != null && exponente >= zona
        ? tr(`${elevado(base, exponente)} no cabe en un long long: desde ${elevado(base, zona)} se desborda (la zona roja del riel).`,
          `${elevado(base, exponente)} doesn't fit in a long long: from ${elevado(base, zona)} on it overflows (the red zone of the track).`)
        : tr(`${elevado(base, exponente)} cabe en un long long. Con un for serían ${conFor} multiplicaciones; ¿cuántas hará ${nombre("potencia")}?`,
          `${elevado(base, exponente)} fits in a long long. With a for loop it would take ${conFor} multiplications; how many will ${nombre("potencia")} make?`),
    };
  };
  visualizador("vis-potencia", {
    ops: ["potencia"],
    entradas: [numero("base", "base", 2, -99, 99, previaPotencia), numero("exponente", nombre("exponente"), 10, 0, 64, previaPotencia)],
    mensajeInicial: tr(
      "Calcula 2^10 y cuenta las multiplicaciones. Mueve el exponente: la zona roja del riel no cabe en un long long.",
      "Compute 2^10 and count the multiplications. Move the exponent: the red zone of the track doesn't fit in a long long."),
  });
  deslizadorExponente("vis-potencia");
  ejemplos("vis-potencia", [
    { texto: "2¹⁰", valores: { base: 2, exponente: 10 } },
    { texto: "2⁶²", valores: { base: 2, exponente: 62 } },
    { texto: "10¹⁹", titulo: tr("No cabe en un long long", "It doesn't fit in a long long"), valores: { base: 10, exponente: 19 } },
  ], true);

  visualizador("vis-fibonacci", {
    ops: ["fibonacci", "fibonacciMemo"],
    dibujar: dibujarArbol,
    entradas: [numero("n", "n", 5, 0, 6, (s, { n }) => ({
      estado: previa(s),
      mensaje: tr(`n = ${n}. Ejecuta fibonacci(${n}) y después fibonacciMemo(${n}, memo), y compara las llamadas.`,
        `n = ${n}. Run fibonacci(${n}) and then fibonacciMemo(${n}, memo), and compare the calls.`),
    }))],
    mensajeInicial: tr(
      "Cada nodo es una llamada. Ejecuta fibonacci(5) y cuenta cuántas veces aparece f(2); después, fibonacciMemo.",
      "Each node is a call. Run fibonacci(5) and count how many times f(2) appears; then, fibonacciMemo."),
  });

  // En Todo junto, dos campos sirven a todas: n y b (la base o el exponente).
  const conDosCampos = (id) => {
    const op = OPS[id];
    if (id === "aBase") {
      return Object.assign({}, op, { usa: ["n", "b"], etiqueta: `${nombre("aBase")}(n, b)`, ejecutar: (s, args, paso) => op.ejecutar(s, { n: args.n, base: args.b, sinTabla: true }, paso) });
    }
    if (id === "potencia") {
      return Object.assign({}, op, { usa: ["n", "b"], etiqueta: `${nombre("potencia")}(n, b)`, ejecutar: (s, args, paso) => op.ejecutar(s, { base: args.n, exponente: args.b }, paso) });
    }
    return op;
  };
  const previaTodo = (s, { n, b }) => ({
    estado: conCifras(s, n),
    mensaje: tr(`n = ${n}, b = ${b}: b es la base de ${nombre("aBase")} o el exponente de ${nombre("potencia")}.`,
      `n = ${n}, b = ${b}: b is the base of ${nombre("aBase")} or the exponent of ${nombre("potencia")}.`),
  });

  visualizador("vis-todo", {
    ops: ["sumaDigitos", "imprimirDigitos", "imprimirAlReves", "invertir", "aBase", "potencia"],
    adaptar: conDosCampos,
    entradas: [numero("n", "n", 156, 0, 999, previaTodo), numero("b", "b", 16, 0, 64, previaTodo)],
    mensajeInicial: tr(
      "Todas las funciones con la pila a la vista. b es la base de aBase o el exponente de potencia.",
      "Every function with the stack in view. b is the base of toBase or the exponent of power."),
  });
})();
