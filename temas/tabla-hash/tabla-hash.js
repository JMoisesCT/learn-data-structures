// Lección de la tabla hash: funciones hash, encadenamiento, direccionamiento
// abierto (sondeo lineal, cuadrático y doble hash), factor de carga y rehash.
// Los fragmentos de código deben coincidir línea por línea con
// ejemplos/cpp/tabla_hash.cpp (scripts/verificar-fragmentos.mjs lo revisa).
(function () {
  const { el, tr } = DS;
  const SVG = "http://www.w3.org/2000/svg";
  const EJEMPLO = [15, 7, 42, 3, 99]; // los mismos números que usa main()

  // ------------------------------------------------------------------
  // Fragmentos de C++ (copiados de ejemplos/cpp/tabla_hash.cpp y de
  // ejemplos/cpp/en/hash_table.cpp)
  // ------------------------------------------------------------------

  const FUNCIONES = tr({
    hashDivision: `
      int hashDivision(int clave, int m) {
          int r = clave % m;
          return r < 0 ? r + m : r;   // en C++, -15 % 7 == -1
      }`,
    hashMultiplicacion: `
      int hashMultiplicacion(int clave, int m) {
          const double A = 0.6180339887;   // (√5 - 1) / 2
          double producto = clave * A;
          double fraccion = producto - floor(producto);
          return (int)(m * fraccion);
      }`,
    hashCuadradoMedio: `
      int hashCuadradoMedio(int clave, int m) {
          int cuadrado = clave * clave;
          int centro = (cuadrado / 100) % 100;
          return centro % m;
      }`,
    hashPlegado: `
      int hashPlegado(int clave, int m) {
          int suma = 0;
          while (clave > 0) {
              suma += clave % 100;
              clave /= 100;
          }
          return suma % m;
      }`,
    hashSumaLetras: `
      int hashSumaLetras(const string& texto, int m) {
          int suma = 0;
          for (char c : texto)
              suma += c;
          return suma % m;
      }`,
    hashPolinomial: `
      int hashPolinomial(const string& texto, int m) {
          int h = 0;
          for (char c : texto)
              h = (h * 31 + c) % m;
          return h;
      }`,
  }, {
    hashDivision: `
      int divisionHash(int key, int m) {
          int r = key % m;
          return r < 0 ? r + m : r;   // in C++, -15 % 7 == -1
      }`,
    hashMultiplicacion: `
      int multiplicationHash(int key, int m) {
          const double A = 0.6180339887;   // (√5 - 1) / 2
          double product = key * A;
          double fraction = product - floor(product);
          return (int)(m * fraction);
      }`,
    hashCuadradoMedio: `
      int midSquareHash(int key, int m) {
          int square = key * key;
          int middle = (square / 100) % 100;
          return middle % m;
      }`,
    hashPlegado: `
      int foldingHash(int key, int m) {
          int sum = 0;
          while (key > 0) {
              sum += key % 100;
              key /= 100;
          }
          return sum % m;
      }`,
    hashSumaLetras: `
      int letterSumHash(const string& text, int m) {
          int sum = 0;
          for (char c : text)
              sum += c;
          return sum % m;
      }`,
    hashPolinomial: `
      int polynomialHash(const string& text, int m) {
          int h = 0;
          for (char c : text)
              h = (h * 31 + c) % m;
          return h;
      }`,
  });

  const ENCADENADA = tr({
    insertar: `
      void insertar(int clave) {
          int indice = hashDivision(clave, tamano());
          Nodo* nuevo = new Nodo(clave);
          nuevo->sig = tabla[indice];   // inserta al frente
          tabla[indice] = nuevo;
          cantidad++;
      }`,
    buscar: `
      bool buscar(int clave) const {
          int indice = hashDivision(clave, tamano());
          Nodo* actual = tabla[indice];
          while (actual) {
              if (actual->valor == clave) return true;
              actual = actual->sig;
          }
          return false;
      }`,
    eliminar: `
      bool eliminar(int clave) {
          int indice = hashDivision(clave, tamano());
          Nodo* actual = tabla[indice];
          Nodo* anterior = nullptr;
          while (actual) {
              if (actual->valor == clave) {
                  if (anterior) anterior->sig = actual->sig;
                  else tabla[indice] = actual->sig;
                  delete actual;
                  cantidad--;
                  return true;
              }
              anterior = actual;
              actual = actual->sig;
          }
          return false;
      }`,
    rehash: `
      void rehash(int nuevoTamano) {
          vector<Nodo*> nueva(nuevoTamano, nullptr);
          for (Nodo* actual : tabla) {
              while (actual) {
                  Nodo* siguiente = actual->sig;
                  int indice = hashDivision(actual->valor, nuevoTamano);
                  actual->sig = nueva[indice];   // al frente, como en insertar
                  nueva[indice] = actual;
                  actual = siguiente;
              }
          }
          tabla.swap(nueva);
      }`,
  }, {
    insertar: `
      void insert(int key) {
          int index = divisionHash(key, size());
          Node* newNode = new Node(key);
          newNode->next = table[index];   // inserts at the front
          table[index] = newNode;
          count++;
      }`,
    buscar: `
      bool find(int key) const {
          int index = divisionHash(key, size());
          Node* current = table[index];
          while (current) {
              if (current->value == key) return true;
              current = current->next;
          }
          return false;
      }`,
    eliminar: `
      bool remove(int key) {
          int index = divisionHash(key, size());
          Node* current = table[index];
          Node* prev = nullptr;
          while (current) {
              if (current->value == key) {
                  if (prev) prev->next = current->next;
                  else table[index] = current->next;
                  delete current;
                  count--;
                  return true;
              }
              prev = current;
              current = current->next;
          }
          return false;
      }`,
    rehash: `
      void rehash(int newSize) {
          vector<Node*> newTable(newSize, nullptr);
          for (Node* current : table) {
              while (current) {
                  Node* nextNode = current->next;
                  int index = divisionHash(current->value, newSize);
                  current->next = newTable[index];   // at the front, as in insert
                  newTable[index] = current;
                  current = nextNode;
              }
          }
          table.swap(newTable);
      }`,
  });

  const ABIERTA = tr({
    posicion: `
      int posicion(int clave, int i) const {
          int h = hashDivision(clave, m);
          if (sondeo == Sondeo::Lineal) return (h + i) % m;
          if (sondeo == Sondeo::Cuadratico) return (h + i * i) % m;
          int paso = 1 + hashDivision(clave, m - 1);   // segundo hash: nunca 0
          return (h + i * paso) % m;
      }`,
    insertar: `
      bool insertar(int clave) {
          for (int i = 0; i < m; i++) {
              int p = posicion(clave, i);
              if (estados[p] != Estado::Ocupada) {
                  claves[p] = clave;
                  estados[p] = Estado::Ocupada;
                  cantidad++;
                  return true;
              }
          }
          return false;   // ningún intento encontró lugar
      }`,
    buscar: `
      bool buscar(int clave) const {
          for (int i = 0; i < m; i++) {
              int p = posicion(clave, i);
              if (estados[p] == Estado::Vacia) return false;
              if (estados[p] == Estado::Ocupada && claves[p] == clave) return true;
          }
          return false;
      }`,
    eliminar: `
      bool eliminar(int clave) {
          for (int i = 0; i < m; i++) {
              int p = posicion(clave, i);
              if (estados[p] == Estado::Vacia) return false;
              if (estados[p] == Estado::Ocupada && claves[p] == clave) {
                  estados[p] = Estado::Borrada;   // lápida
                  cantidad--;
                  return true;
              }
          }
          return false;
      }`,
  }, {
    posicion: `
      int position(int key, int i) const {
          int h = divisionHash(key, m);
          if (probing == Probing::Linear) return (h + i) % m;
          if (probing == Probing::Quadratic) return (h + i * i) % m;
          int step = 1 + divisionHash(key, m - 1);   // second hash: never 0
          return (h + i * step) % m;
      }`,
    insertar: `
      bool insert(int key) {
          for (int i = 0; i < m; i++) {
              int p = position(key, i);
              if (states[p] != State::Occupied) {
                  keys[p] = key;
                  states[p] = State::Occupied;
                  count++;
                  return true;
              }
          }
          return false;   // no attempt found a place
      }`,
    buscar: `
      bool find(int key) const {
          for (int i = 0; i < m; i++) {
              int p = position(key, i);
              if (states[p] == State::Empty) return false;
              if (states[p] == State::Occupied && keys[p] == key) return true;
          }
          return false;
      }`,
    eliminar: `
      bool remove(int key) {
          for (int i = 0; i < m; i++) {
              int p = position(key, i);
              if (states[p] == State::Empty) return false;
              if (states[p] == State::Occupied && keys[p] == key) {
                  states[p] = State::Deleted;   // tombstone
                  count--;
                  return true;
              }
          }
          return false;
      }`,
  });

  const elegir = (origen, ...claves) => Object.fromEntries(claves.map((c) => [c, origen[c]]));

  // Nombre de cada función en el idioma de la página (las claves quedan en español).
  const F = tr({}, {
    hashDivision: "divisionHash", hashMultiplicacion: "multiplicationHash", hashCuadradoMedio: "midSquareHash",
    hashPlegado: "foldingHash", hashSumaLetras: "letterSumHash", hashPolinomial: "polynomialHash",
    insertar: "insert", buscar: "find", eliminar: "remove", posicion: "position", siguientePrimo: "nextPrime",
  });
  const nombreF = (clave) => F[clave] || clave;
  const ENCADENADA_CLASE = tr("TablaHashEncadenada", "ChainedHashTable");
  const ABIERTA_CLASE = tr("TablaHashAbierta", "OpenAddressingHashTable");

  // Nombres del C++ que se dibujan. Los estados usan los de español y se
  // traducen al pintar, así son iguales en los dos idiomas.
  const NOMBRES = {
    clave: "key", producto: "product", fraccion: "fraction", cuadrado: "square", centro: "middle", suma: "sum",
    indice: "index", nuevo: "newNode", actual: "current", anterior: "prev", nuevoTamano: "newSize",
    siguiente: "nextNode", paso: "step", estrategia: "strategy",
  };
  const ident = (k) => tr(k, NOMBRES[k] || k);
  const variables = (vars, cambiadas) => DS.variables(
    Object.fromEntries(Object.entries(vars).map(([k, v]) => [ident(k), v])), (cambiadas || []).map(ident));
  const CLAVE = tr("Clave", "Key");
  // insertar(clave) / insert(key): el parámetro se llama como la entrada.
  const llamadaCon = (f) => `${nombreF(f)}(${ident("clave")})`;

  // ------------------------------------------------------------------
  // Las funciones hash en JavaScript (mismo resultado que en C++)
  // ------------------------------------------------------------------

  const A = 0.6180339887;
  const hashDivision = (clave, m) => { const r = clave % m; return r < 0 ? r + m : r; };
  const codigo = (c) => c.charCodeAt(0);

  // Muestra un double con hasta 4 decimales, como lo imprimiría cout.
  const decimal = (x) => String(Number(x.toFixed(4)));
  const fraccion = (clave) => { const p = clave * A; return p - Math.floor(p); };

  // Cada función: nombre del C++, cálculo directo y los pasos para animarla.
  const NUMERICAS = {
    division: {
      clave: "hashDivision",
      nombre: tr("División", "Division"),
      idea: tr("clave % m, la más simple. Reparte mejor con m primo.", "key % m, the simplest. It spreads better with a prime m."),
      calcular: (k, m) => hashDivision(k, m),
      pasos(k, m, paso) {
        const r = k % m;
        paso(2, tr(`r = ${k} % ${m} = ${r}: el resto de dividir ${k} entre ${m}. Siempre queda entre 0 y ${m - 1}.`,
          `r = ${k} % ${m} = ${r}: the remainder of dividing ${k} by ${m}. It's always between 0 and ${m - 1}.`), { clave: k, m, r });
        return [3, tr(`r no es negativo, así que se devuelve tal cual: ${r}.`, `r isn't negative, so it's returned as is: ${r}.`), { clave: k, m, r }];
      },
    },
    multiplicacion: {
      clave: "hashMultiplicacion",
      nombre: tr("Multiplicación", "Multiplication"),
      idea: tr("multiplica por A ≈ 0.618, se queda con los decimales y los escala a m (Knuth). El valor de m casi no importa.",
        "multiplies by A ≈ 0.618, keeps the decimals and scales them to m (Knuth). The value of m barely matters."),
      calcular: (k, m) => Math.trunc(m * fraccion(k)),
      pasos(k, m, paso) {
        const producto = k * A;
        const f = producto - Math.floor(producto);
        const vars = { clave: k, m };
        paso(2, tr("A ≈ 0.618 es la parte decimal de la razón áurea. Knuth la recomienda porque mezcla muy bien los dígitos de la clave.",
          "A ≈ 0.618 is the decimal part of the golden ratio. Knuth recommends it because it mixes the key's digits very well."), vars);
        paso(3, `${ident("producto")} = ${k} × 0.618… = ${decimal(producto)}.`, Object.assign(vars, { producto: decimal(producto) }));
        paso(4, tr(`fraccion = ${decimal(producto)} − ${Math.floor(producto)} = ${decimal(f)}: nos quedamos solo con los decimales, un número entre 0 y 1.`,
          `fraction = ${decimal(producto)} − ${Math.floor(producto)} = ${decimal(f)}: we keep only the decimals, a number between 0 and 1.`),
          Object.assign(vars, { fraccion: decimal(f) }));
        const r = Math.trunc(m * f);
        return [5, tr(`${m} × ${decimal(f)} = ${decimal(m * f)}; al convertirlo a int se cortan los decimales: ${r}.`,
          `${m} × ${decimal(f)} = ${decimal(m * f)}; converting it to int cuts off the decimals: ${r}.`), vars];
      },
    },
    cuadrado: {
      clave: "hashCuadradoMedio",
      nombre: tr("Cuadrado medio", "Mid-square"),
      idea: tr("eleva al cuadrado y toma los dígitos del centro, donde influyen todos los dígitos de la clave.",
        "squares the key and takes the middle digits, which all the key's digits affect."),
      calcular: (k, m) => (Math.floor((k * k) / 100) % 100) % m,
      pasos(k, m, paso) {
        const cuadrado = k * k;
        const centro = Math.floor(cuadrado / 100) % 100;
        const seis = String(cuadrado).padStart(6, "0");
        const vars = { clave: k, m, cuadrado };
        paso(2, tr(`cuadrado = ${k} × ${k} = ${cuadrado}. Al elevar al cuadrado, cada dígito de la clave influye en los del centro.`,
          `square = ${k} × ${k} = ${cuadrado}. When squaring, each digit of the key affects the middle ones.`), vars);
        paso(3, tr(`centro = (${cuadrado} / 100) % 100 = ${centro}: de ${seis.slice(0, 2)}[${seis.slice(2, 4)}]${seis.slice(4)} quitamos los 2 últimos dígitos y nos quedamos con los 2 siguientes.`,
          `middle = (${cuadrado} / 100) % 100 = ${centro}: from ${seis.slice(0, 2)}[${seis.slice(2, 4)}]${seis.slice(4)} we drop the last 2 digits and keep the next 2.`),
          Object.assign(vars, { centro }));
        return [4, `return ${centro} % ${m} = ${centro % m}.`, vars];
      },
    },
    plegado: {
      clave: "hashPlegado",
      nombre: tr("Plegado", "Folding"),
      idea: tr("corta la clave en grupos de 2 dígitos y los suma. Sirve para claves largas, como teléfonos.",
        "cuts the key into groups of 2 digits and adds them up. It's useful for long keys, like phone numbers."),
      calcular(k, m) {
        let suma = 0;
        for (let c = k; c > 0; c = Math.floor(c / 100)) suma += c % 100;
        return suma % m;
      },
      pasos(k, m, paso) {
        let suma = 0;
        let c = k;
        paso(2, tr(`suma = 0. Vamos a cortar ${k} en grupos de 2 dígitos, de derecha a izquierda, y sumarlos.`,
          `sum = 0. We'll cut ${k} into groups of 2 digits, from right to left, and add them up.`), { clave: c, m, suma });
        while (c > 0) {
          const grupo = c % 100;
          suma += grupo;
          paso(4, tr(`suma += ${c} % 100 = ${grupo} (los 2 últimos dígitos): suma = ${suma}.`, `sum += ${c} % 100 = ${grupo} (the last 2 digits): sum = ${suma}.`), { clave: c, m, suma });
          c = Math.floor(c / 100);
          paso(5, c > 0 ? tr(`clave /= 100: quedan los dígitos ${c}.`, `key /= 100: the digits ${c} are left.`)
            : tr("clave /= 100: ya no quedan dígitos (clave = 0).", "key /= 100: no digits left (key = 0)."), { clave: c, m, suma });
        }
        paso(3, tr("clave > 0 es falso: terminó el plegado.", "key > 0 is false: the folding is done."), { clave: c, m, suma });
        return [7, `return ${suma} % ${m} = ${suma % m}.`, { clave: c, m, suma }];
      },
    },
  };

  const TEXTO = {
    suma: {
      clave: "hashSumaLetras",
      idea: tr("Suma de letras: suma el código ASCII de cada letra. Es fácil, pero amor, roma, mora y ramo tienen las mismas letras… y la misma suma.",
        "Letter sum: adds up the ASCII code of each letter. It's easy, but listen, silent, enlist and tinsel have the same letters… and the same sum."),
      calcular: (t, m) => [...t].reduce((s, c) => s + codigo(c), 0) % m,
      pasos(t, m, paso) {
        let suma = 0;
        paso(2, tr(`suma = 0. Recorremos "${t}" letra por letra y sumamos su código ASCII.`, `sum = 0. We go through "${t}" letter by letter and add up its ASCII code.`), { suma }, null);
        [...t].forEach((c, k) => {
          const antes = suma;
          suma += codigo(c);
          paso(4, `c = '${c}' (${codigo(c)}): ${ident("suma")} = ${antes} + ${codigo(c)} = ${suma}.`, { c: `'${c}'`, suma }, k);
        });
        return [5, `return ${suma} % ${m} = ${suma % m}.`, { suma }];
      },
    },
    polinomial: {
      clave: "hashPolinomial",
      idea: tr("Polinomial (Horner): h = h · 31 + c en cada letra, así el orden importa. El % m de cada vuelta evita desbordar el int.",
        "Polynomial (Horner): h = h · 31 + c on each letter, so the order matters. The % m on each iteration keeps the int from overflowing."),
      calcular: (t, m) => [...t].reduce((h, c) => (h * 31 + codigo(c)) % m, 0),
      pasos(t, m, paso) {
        let h = 0;
        paso(2, tr("h = 0. En cada letra, h se multiplica por 31 antes de sumar: así la posición de cada letra cuenta.",
          "h = 0. On each letter, h is multiplied by 31 before adding: that way each letter's position counts."), { h }, null);
        [...t].forEach((c, k) => {
          const antes = h;
          h = (h * 31 + codigo(c)) % m;
          paso(4, `c = '${c}' (${codigo(c)}): h = (${antes}·31 + ${codigo(c)}) % ${m} = ${antes * 31 + codigo(c)} % ${m} = ${h}.`, { c: `'${c}'`, h }, k);
        });
        return [5, `return ${h}.`, { h }];
      },
    },
  };

  // Los anagramas chocan con la suma de letras (en los dos idiomas caen en la cubeta 4).
  const ANAGRAMAS = tr(["amor", "roma", "mora", "ramo"], ["listen", "silent", "enlist", "tinsel"]);
  const PALABRAS = ANAGRAMAS.concat(tr(["casa", "saca", "sol", "luna", "gato", "perro"], ["stop", "pots", "sun", "moon", "cat", "dog"]));

  // ------------------------------------------------------------------
  // Dibujo de cubetas simples (una fila por cubeta, como imprimir())
  // ------------------------------------------------------------------

  function cubetasVacias(m) {
    return Array.from({ length: m }, () => []);
  }

  function resumen(cubetas) {
    const n = cubetas.reduce((t, c) => t + c.length, 0);
    const usadas = cubetas.filter((c) => c.length).length;
    const mayor = Math.max(0, ...cubetas.map((c) => c.length));
    return tr(`${n} clave(s) · ${usadas} de ${cubetas.length} cubetas usadas · ${n - usadas} colisión(es) · la más llena tiene ${mayor}`,
      `${n} key(s) · ${usadas} of ${cubetas.length} buckets used · ${n - usadas} collision(s) · the fullest has ${mayor}`);
  }

  // Con muchas cubetas (m = 10 u 11) van en dos columnas en pantallas anchas
  // ([0]…[5] a la izquierda): así el paso cabe sin scroll.
  function dibujarCubetas(cubetas, vis) {
    const dos = cubetas.length > 8;
    return el("div", {},
      el("div", { class: `cubetas-hash${dos ? " dos-columnas" : ""}`, style: dos ? `--filas:${Math.ceil(cubetas.length / 2)}` : null },
        cubetas.map((contenido, i) =>
          el("div", { class: `fila-cubeta${vis.cubeta === i ? " activa" : ""}${contenido.length > 1 ? " colision" : ""}` },
            el("span", { class: "indice", text: `[${i}]` }),
            el("div", { class: "caja" },
              contenido.map((v) => el("span", { class: `ficha${vis.nuevo === v && vis.cubeta === i ? " nueva" : ""}`, text: v })))))),
      el("p", { class: "resumen-cubetas", text: resumen(cubetas) }));
  }

  // ------------------------------------------------------------------
  // Paso 2: funciones hash para números
  // ------------------------------------------------------------------

  const MAXIMO_FICHAS = 30;
  const LIMITE_FICHAS = () => tr(`Para que quepa en pantalla, la tabla llega hasta ${MAXIMO_FICHAS} claves. Pulsa Reiniciar.`,
    `So that it fits on screen, the table goes up to ${MAXIMO_FICHAS} keys. Press Reset.`);

  // Coloca la clave en su cubeta y arma el mensaje (con o sin colisión).
  function colocar(s, valor, indice) {
    const antes = s.cubetas[indice].slice();
    s.cubetas[indice].push(valor);
    s.vis.cubeta = indice;
    s.vis.nuevo = valor;
    return antes.length
      ? tr(`Cubeta ${indice}: ¡colisión! Ya estaba${antes.length > 1 ? "n" : ""} ${antes.join(", ")}.`, `Bucket ${indice}: collision! ${antes.join(", ")} ${antes.length > 1 ? "were" : "was"} already there.`)
      : tr(`Cubeta ${indice}: estaba libre, no hay colisión.`, `Bucket ${indice}: it was free, no collision.`);
  }

  function agregarLote(s, valores, paso) {
    const f = NUMERICAS[s.funcion];
    const nuevos = valores.filter((v) => !s.cubetas.some((c) => c.includes(v)));
    if (s.cubetas.flat().length + nuevos.length > MAXIMO_FICHAS) {
      paso(f.clave, 0, LIMITE_FICHAS(), "error");
      return;
    }
    if (!nuevos.length) {
      paso(f.clave, 0, tr("Esas claves ya están en la tabla.", "Those keys are already in the table."), "error");
      return;
    }
    nuevos.forEach((v) => {
      const indice = f.calcular(v, s.m);
      s.vis = { vars: { clave: v, m: s.m } };
      const texto = colocar(s, v, indice);
      paso(f.clave, 0, `${nombreF(f.clave)}(${v}, ${s.m}) = ${indice}. ${texto}`);
    });
    s.vis = { vars: { m: s.m } };
    paso(f.clave, 0, tr(`Así reparte ${f.nombre.toLowerCase()} con m = ${s.m}. ${resumen(s.cubetas)}. Cambia la función o m y compara.`,
      `That's how ${f.nombre.toLowerCase()} spreads them with m = ${s.m}. ${resumen(s.cubetas)}. Change the function or m and compare.`), "exito");
  }

  DS.tema({
    contenedor: "vis-funciones",
    codigo: elegir(FUNCIONES, "hashDivision", "hashMultiplicacion", "hashCuadradoMedio", "hashPlegado"),
    tituloCodigo: (clave) => `${nombreF(clave)}(${ident("clave")}, m)`,
    codigoInicial: ({ funcion }) => NUMERICAS[funcion].clave,
    mensajeInicial: ({ funcion, m }) => `${NUMERICAS[funcion].nombre} (m = ${m}): ${NUMERICAS[funcion].idea} `
      + tr("Calcula una clave o agrega varias de golpe.", "Compute one key or add several at once."),
    estadoInicial: ({ funcion, m }) => ({ funcion, m: Number(m), cubetas: cubetasVacias(Number(m)), vis: {} }),
    entradas: [
      { id: "funcion", etiqueta: tr("Función", "Function"), opciones: Object.entries(NUMERICAS).map(([k, f]) => [k, f.nombre]), valor: "division" },
      { id: "m", etiqueta: tr("Cubetas (m)", "Buckets (m)"), opciones: [["7", "7"], ["10", "10"], ["11", "11"]], valor: "7" },
      { id: "clave", etiqueta: CLAVE, min: 0, max: 999, aleatorio: true },
    ],
    operaciones: [
      {
        id: "calcular",
        etiqueta: ({ funcion }) => `${nombreF(NUMERICAS[funcion].clave)}(${ident("clave")}, m)`,
        usa: ["clave"],
        ejecutar(s, { clave }, paso) {
          const f = NUMERICAS[s.funcion];
          if (s.cubetas.some((c) => c.includes(clave))) {
            paso(f.clave, 0, tr(`${clave} ya está en la tabla. Prueba con otra clave.`, `${clave} is already in the table. Try another key.`), "error");
            return;
          }
          if (s.cubetas.flat().length >= MAXIMO_FICHAS) {
            paso(f.clave, 0, LIMITE_FICHAS(), "error");
            return;
          }
          const ver = (vars) => { s.vis = { vars }; };
          const [linea, texto, vars] = f.pasos(clave, s.m, (l, t, v) => { ver(Object.assign({}, v)); paso(f.clave, l, t); });
          ver(Object.assign({}, vars));
          const indice = f.calcular(clave, s.m);
          paso(f.clave, linea, `${texto} ${colocar(s, clave, indice)}`, "exito");
        },
      },
      {
        id: "main",
        etiqueta: `+ ${EJEMPLO.join(", ")}`,
        secundaria: true,
        ejecutar(s, args, paso) { agregarLote(s, EJEMPLO, paso); },
      },
      {
        id: "decenas",
        etiqueta: "+ 10, 20, …, 100",
        secundaria: true,
        ejecutar(s, args, paso) { agregarLote(s, Array.from({ length: 10 }, (_, k) => 10 * (k + 1)), paso); },
      },
    ],
    dibujar(escenario, s) {
      escenario.append(variables(s.vis.vars || { m: s.m }), dibujarCubetas(s.cubetas, s.vis));
    },
  });

  // ------------------------------------------------------------------
  // Paso 3: funciones hash para palabras
  // ------------------------------------------------------------------

  const M_TEXTO = 7;

  DS.tema({
    contenedor: "vis-palabras",
    codigo: elegir(FUNCIONES, "hashSumaLetras", "hashPolinomial"),
    tituloCodigo: (clave) => `${nombreF(clave)}(${tr("texto", "text")}, m)`,
    codigoInicial: ({ funcion }) => TEXTO[funcion].clave,
    mensajeInicial: ({ funcion }) => `${TEXTO[funcion].idea} ${tr("Prueba los anagramas con las dos funciones.", "Try the anagrams with both functions.")}`,
    estadoInicial: ({ funcion }) => ({ funcion, cubetas: cubetasVacias(M_TEXTO), vis: {} }),
    entradas: [
      { id: "funcion", etiqueta: "", opciones: [["suma", tr("Suma de letras", "Letter sum")], ["polinomial", tr("Polinomial", "Polynomial")]], valor: "suma" },
      { id: "palabra", etiqueta: "", opciones: PALABRAS.map((p) => [p, p]), valor: PALABRAS[0], reinicia: false },
    ],
    operaciones: [
      {
        id: "calcular",
        etiqueta: ({ funcion, palabra }) => `${nombreF(TEXTO[funcion].clave)}("${palabra}", ${M_TEXTO})`,
        usa: ["palabra"],
        ejecutar(s, { palabra }, paso) {
          const f = TEXTO[s.funcion];
          if (s.cubetas.some((c) => c.includes(palabra))) {
            paso(f.clave, 0, tr(`"${palabra}" ya está en la tabla. Elige otra palabra.`, `"${palabra}" is already in the table. Choose another word.`), "error");
            return;
          }
          const ver = (vars, letra) => { s.vis = { vars: Object.assign({ m: M_TEXTO }, vars), palabra, letra }; };
          const [linea, texto, vars] = f.pasos(palabra, M_TEXTO, (l, t, v, letra) => { ver(v, letra); paso(f.clave, l, t); });
          ver(vars, null);
          const indice = f.calcular(palabra, M_TEXTO);
          paso(f.clave, linea, `${texto} ${colocar(s, palabra, indice)}`, "exito");
        },
      },
      {
        id: "anagramas",
        etiqueta: tr("+ anagramas", "+ anagrams"),
        secundaria: true,
        ejecutar(s, args, paso) {
          const f = TEXTO[s.funcion];
          const nuevos = ANAGRAMAS.filter((p) => !s.cubetas.some((c) => c.includes(p)));
          if (!nuevos.length) {
            paso(f.clave, 0, tr("Los cuatro anagramas ya están en la tabla.", "The four anagrams are already in the table."), "error");
            return;
          }
          for (const p of nuevos) {
            s.vis = { vars: { m: M_TEXTO }, palabra: p };
            const indice = f.calcular(p, M_TEXTO);
            paso(f.clave, 0, `${nombreF(f.clave)}("${p}", ${M_TEXTO}) = ${indice}. ${colocar(s, p, indice)}`);
          }
          // La última palabra sigue a la vista: si su fila de letras se fuera, la tabla subiría de golpe.
          s.vis = { vars: { m: M_TEXTO }, palabra: nuevos[nuevos.length - 1] };
          paso(f.clave, 0, s.funcion === "suma"
            ? tr("Las cuatro palabras tienen las mismas letras, así que la suma es la misma: todas caen en la misma cubeta, sin importar m.",
              "The four words have the same letters, so the sum is the same: they all land in the same bucket, whatever m is.")
            : tr("Con el hash polinomial el orden cuenta y los anagramas se reparten. Dos aún pueden chocar (hay 7 cubetas), pero no por tener las mismas letras.",
              "With the polynomial hash the order counts and the anagrams spread out. Two could still collide (there are 7 buckets), but not because they share letters."), "exito");
        },
      },
    ],
    dibujar(escenario, s) {
      const vis = s.vis;
      const letras = vis.palabra
        ? el("div", { class: "letras" }, [...vis.palabra].map((c, k) =>
          el("div", { class: `letra${vis.letra === k ? " actual" : ""}${vis.letra != null && k < vis.letra ? " hecha" : ""}` },
            el("span", { class: "letra-caracter", text: c }), el("span", { class: "indice", text: codigo(c) }))))
        : "";
      escenario.append(variables(vis.vars || { m: M_TEXTO }), letras, dibujarCubetas(s.cubetas, vis));
    },
  });

  // ------------------------------------------------------------------
  // Pasos 4 y 6: encadenamiento (tabla de listas enlazadas) y rehash
  // ------------------------------------------------------------------

  const FILA = 44;
  const FILA_COMPACTA = 28;
  const ALTO_NODO = 32;
  const ANCHO_NODO = 62;
  const PASO_X = 84;
  const X_CUBETA = 34;
  const X_NODO = X_CUBETA + 30 + 26;
  const TITULO = 24;
  const SEPARACION = 32;
  let lienzos = 0;

  const totalNodos = (s) => Object.keys(s.nodos).length;
  const alfa = (s) => `${totalNodos(s)} / ${s.m} = ${decimal(totalNodos(s) / s.m)}`;

  function estadoCadenas(m, valores) {
    const s = { m, cubetas: cubetasVacias(m), nodos: {}, siguienteId: 1, pendiente: null, saltado: null, nueva: null, vis: {} };
    for (const v of valores) s.cubetas[hashDivision(v, m)].unshift(crearNodo(s, v));
    return s;
  }

  function crearNodo(s, v) {
    const id = `n${s.siguienteId++}`;
    s.nodos[id] = v;
    return id;
  }

  const nombreNodo = (s, id) => (id == null ? "nullptr" : `${tr("nodo", "node")} ${s.nodos[id]}`);

  // Bloques que se dibujan: la tabla y, durante el rehash, la tabla nueva.
  function bloques(s, disponible) {
    const titulo = s.nueva ? tr(`tabla (la vieja, m = ${s.m})`, `table (the old one, m = ${s.m})`) : tr(`tabla (m = ${s.m})`, `table (m = ${s.m})`);
    const lista = [{ id: "t", m: s.m, cubetas: s.cubetas, pendiente: s.pendiente, titulo }];
    if (s.nueva) lista.push({ id: "n", m: s.nueva.m, cubetas: s.nueva.cubetas, titulo: `${tr("nueva", "newTable")} (m = ${s.nueva.m})` });
    let x = 0;
    let y = 0;
    for (const b of lista) {
      const largo = Math.max(2, ...b.cubetas.map((c, i) => c.length + (b.pendiente && b.pendiente.cubeta === i ? 1 : 0)));
      b.ancho = X_NODO + (largo - 1) * PASO_X + ANCHO_NODO;
      // Con muchas cubetas (después de un rehash), filas más bajas para que la tabla quepa.
      b.fila = b.m > 7 ? FILA_COMPACTA : FILA;
      b.alto = TITULO + b.m * b.fila;
    }
    const enFila = lista.length > 1 && lista[0].ancho + SEPARACION + lista[1].ancho <= disponible;
    for (const b of lista) {
      b.x = x;
      b.y = y;
      if (enFila) x += b.ancho + SEPARACION;
      else y += b.alto + 12;
    }
    return lista;
  }

  // Flechas: de cada cubeta a su primer nodo y de cada nodo al siguiente.
  function enlaces(s) {
    const lista = [];
    const todos = [["t", s.cubetas, s.pendiente], ...(s.nueva ? [["n", s.nueva.cubetas, null]] : [])];
    for (const [b, cubetas, pendiente] of todos) {
      cubetas.forEach((cadena, i) => {
        const enEspera = pendiente && pendiente.cubeta === i ? pendiente : null;
        const seq = [`c:${b}-${i}`, ...cadena.map((id) => `n:${id}`)];
        for (let k = 0; k < seq.length; k++) {
          let destino = k + 1 < seq.length ? k + 1 : null;
          let arco = k === 0 && !!enEspera && destino != null;
          // eliminar: el anterior ya saltó al nodo que se va a borrar.
          if (destino != null && s.saltado && seq[destino] === `n:${s.saltado}`) {
            destino = destino + 1 < seq.length ? destino + 1 : null;
            arco = destino != null;
          }
          lista.push({ de: seq[k], a: destino == null ? null : seq[destino], arco });
        }
        if (enEspera) lista.push({ de: `n:${enEspera.id}`, a: enEspera.enlazado && cadena.length ? `n:${cadena[0]}` : null, arco: false });
      });
    }
    return lista;
  }

  function crearLienzoCadenas(escenario) {
    const n = ++lienzos;
    const svg = document.createElementNS(SVG, "svg");
    svg.innerHTML =
      "<defs>" +
      `<marker id="punta-hash-${n}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z"/></marker>` +
      `<marker id="punta-hash-activa-${n}" class="activa" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z"/></marker>` +
      "</defs>";
    const lienzo = el("div", { class: "lienzo-lista lienzo-hash", "data-n": n }, svg, el("div", { class: "capa-fija" }));
    escenario.append(el("div", { class: "info-hash", "data-alto-estable": true }), lienzo);
    return lienzo;
  }

  function dibujarFlechas(lienzo, lista, activa) {
    const n = lienzo.dataset.n;
    const svg = lienzo.querySelector("svg");
    svg.querySelectorAll("path.flecha").forEach((p) => p.remove());
    const pieza = (clave) => clave && lienzo.querySelector(clave.startsWith("n:")
      ? `.nodo[data-id="${clave.slice(2)}"]` : `.cubeta[data-k="${clave.slice(2)}"]`);
    for (const { de, a, arco } of lista) {
      const origen = pieza(de);
      const destino = pieza(a);
      if (!origen || !destino) continue;
      const esNodo = de.startsWith("n:");
      const x1 = origen.offsetLeft + (esNodo ? ANCHO_NODO - 12 : 15);
      const y1 = origen.offsetTop + (origen.offsetHeight || ALTO_NODO) / 2;
      const x2 = destino.offsetLeft - 3;
      const y2 = destino.offsetTop + (destino.offsetHeight || ALTO_NODO) / 2;
      const d = arco
        ? `M ${x1} ${y1} C ${x1 + 24} ${y1 - 34}, ${x2 - 30} ${y2 - 34}, ${x2} ${y2}`
        : `M ${x1} ${y1} L ${x2} ${y2}`;
      const path = document.createElementNS(SVG, "path");
      const resaltada = activa === de;
      path.setAttribute("d", d);
      path.setAttribute("class", "flecha" + (resaltada ? " activa" : ""));
      path.setAttribute("marker-end", `url(#punta-hash${resaltada ? "-activa" : ""}-${n})`);
      svg.append(path);
    }
  }

  if (typeof window !== "undefined") {
    // Al cambiar el ancho, la tabla nueva del rehash puede ir al lado o debajo.
    window.addEventListener("resize", () => {
      for (const lienzo of document.querySelectorAll(".lienzo-hash")) {
        if (lienzo._estado) dibujarCadenas(lienzo.closest(".escenario"), lienzo._estado);
      }
    });
  }

  // Lo que ya no está se desvanece antes de borrarse (sin id, para que no se reuse).
  function retirar(pieza) {
    delete pieza.dataset.id;
    delete pieza.dataset.k;
    pieza.classList.add("saliendo");
    setTimeout(() => pieza.remove(), 350);
  }

  function dibujarCadenas(escenario, s) {
    if (!escenario) return;
    const lienzo = escenario.querySelector(".lienzo-hash") || crearLienzoCadenas(escenario);
    lienzo._estado = s;
    const vis = s.vis || {};
    escenario.querySelector(".info-hash").replaceChildren(variables(Object.assign({}, vis.vars, { "α": alfa(s) }), vis.cambiadas));

    const lista = bloques(s, escenario.clientWidth - 32);
    const flechas = enlaces(s);
    const conSalida = new Set(flechas.filter((f) => f.a).map((f) => f.de));
    const vivos = new Set();
    const piezas = [];
    let ancho = 0;
    let alto = 0;

    const ubicar = (nodo, x, y) => { nodo.style.left = `${x}px`; nodo.style.top = `${y}px`; };

    // tabla.swap(nueva): las cubetas de la tabla nueva pasan a ser las de la
    // tabla y se deslizan a su lugar; las de la vieja se desvanecen.
    const relevo = !s.nueva && !!lienzo.querySelector('.cubeta[data-k^="n-"]');
    if (relevo) {
      for (const c of lienzo.querySelectorAll('.cubeta[data-k^="t-"]')) retirar(c);
      for (const c of lienzo.querySelectorAll('.cubeta[data-k^="n-"]')) c.dataset.k = `t-${c.dataset.k.slice(2)}`;
    }

    for (const b of lista) {
      ancho = Math.max(ancho, b.x + b.ancho);
      alto = Math.max(alto, b.y + b.alto);
      piezas.push(el("span", { class: "fila-titulo", style: `left:${b.x}px;top:${b.y}px`, text: b.titulo }));
      const resaltada = b.id === "t" ? vis.cubeta : vis.cubetaNueva;
      b.cubetas.forEach((cadena, i) => {
        const y = b.y + TITULO + i * b.fila;
        const compacta = b.fila < FILA;
        piezas.push(el("span", { class: "indice indice-cubeta", style: `left:${b.x}px;top:${y + (compacta ? 4 : 8)}px`, text: `[${i}]` }));

        const k = `${b.id}-${i}`;
        vivos.add(`c:${k}`);
        let cubeta = lienzo.querySelector(`.cubeta[data-k="${k}"]`);
        if (!cubeta) {
          cubeta = el("div", { class: "cubeta", "data-k": k });
          lienzo.append(cubeta);
        }
        ubicar(cubeta, b.x + X_CUBETA, y);
        cubeta.classList.toggle("compacta", compacta);
        cubeta.classList.toggle("activa", resaltada === i);
        cubeta.classList.toggle("nula", !conSalida.has(`c:${k}`));

        const ids = b.pendiente && b.pendiente.cubeta === i ? [b.pendiente.id, ...cadena] : cadena;
        ids.forEach((id, pos) => {
          vivos.add(`n:${id}`);
          let nodo = lienzo.querySelector(`.nodo[data-id="${id}"]`);
          const x = b.x + X_NODO + pos * PASO_X;
          if (!nodo) {
            nodo = el("div", { class: "nodo nuevo", "data-id": id }, el("span", { class: "valor" }), el("span", { class: "sig" }));
            ubicar(nodo, x, y);
            lienzo.append(nodo);
          }
          nodo.querySelector(".valor").textContent = s.nodos[id];
          nodo.querySelector(".sig").classList.toggle("nulo", !conSalida.has(`n:${id}`));
          ubicar(nodo, x, y);
          nodo.classList.toggle("compacta", compacta);
          nodo.classList.toggle("suelto", !!(s.pendiente && s.pendiente.id === id));
          nodo.classList.toggle("activo", vis.activo === id);
          nodo.classList.toggle("anterior", vis.anterior === id);
          nodo.classList.toggle("encontrado", vis.encontrado === id);
          nodo.classList.toggle("borrado", vis.borrado === id);
        });
      });
    }
    for (const pieza of lienzo.querySelectorAll(".nodo[data-id], .cubeta[data-k]")) {
      const clave = pieza.classList.contains("nodo") ? `n:${pieza.dataset.id}` : `c:${pieza.dataset.k}`;
      if (!vivos.has(clave)) retirar(pieza);
    }
    const fija = lienzo.querySelector(".capa-fija");
    fija.replaceChildren(...piezas);
    // Con el relevo, los índices [i] aparecen de a poco en vez de saltar.
    if (relevo) {
      fija.classList.remove("relevo");
      void fija.offsetWidth;
      fija.classList.add("relevo");
    }
    lienzo.style.width = `${ancho}px`;
    lienzo.style.height = `${alto}px`;

    // Redibujamos las flechas mientras los nodos se deslizan.
    const fin = performance.now() + 520;
    cancelAnimationFrame(lienzo._cuadro);
    const cuadro = () => {
      dibujarFlechas(lienzo, flechas, vis.flecha);
      if (performance.now() < fin) lienzo._cuadro = requestAnimationFrame(cuadro);
    };
    cuadro();
  }

  const MENSAJE_LIMITE = (maximo, conEliminar) => tr(`Para que la animación quepa en pantalla, la tabla llega hasta ${maximo} nodos. ${conEliminar ? "Elimina alguno o pulsa" : "Pulsa"} Reiniciar.`,
    `So that the animation fits on screen, the table goes up to ${maximo} nodes. ${conEliminar ? "Remove some or press" : "Press"} Reset.`);

  function animarInsertar(s, clave, paso, maximo, cierre) {
    if (totalNodos(s) >= maximo) {
      paso("insertar", 1, MENSAJE_LIMITE(maximo, !cierre), "error");
      return;
    }
    const indice = hashDivision(clave, s.m);
    const ocupantes = s.cubetas[indice].map((id) => s.nodos[id]);
    s.vis = { cubeta: indice, vars: { clave, indice } };
    paso("insertar", 2, tr(`indice = hashDivision(${clave}, ${s.m}) = ${clave} % ${s.m} = ${indice}. La clave va a la cubeta ${indice}.`,
      `index = divisionHash(${clave}, ${s.m}) = ${clave} % ${s.m} = ${indice}. The key goes to bucket ${indice}.`));
    const id = crearNodo(s, clave);
    s.pendiente = { id, cubeta: indice, enlazado: false };
    s.vis = { cubeta: indice, activo: id, vars: { clave, indice, nuevo: nombreNodo(s, id) } };
    paso("insertar", 3, tr(`new Nodo(${clave}): un nodo nuevo en memoria. Todavía no está en la lista (su sig es nullptr).`,
      `new Node(${clave}): a new node in memory. It isn't in the list yet (its next is nullptr).`));
    s.pendiente.enlazado = true;
    s.vis = { cubeta: indice, activo: id, flecha: `n:${id}`, vars: { clave, indice, nuevo: nombreNodo(s, id) } };
    paso("insertar", 4, ocupantes.length
      ? tr(`¡Colisión! En la cubeta ${indice} ya ${ocupantes.length > 1 ? "están" : "está"} ${ocupantes.join(", ")}. nuevo->sig = tabla[${indice}]: el nodo nuevo apunta al que hoy es el primero (${ocupantes[0]}).`,
        `Collision! Bucket ${indice} already has ${ocupantes.join(", ")}. newNode->next = table[${indice}]: the new node points to the one that's first right now (${ocupantes[0]}).`)
      : tr(`nuevo->sig = tabla[${indice}], que es nullptr: la cubeta estaba vacía, así que no hay colisión.`,
        `newNode->next = table[${indice}], which is nullptr: the bucket was empty, so there's no collision.`));
    s.cubetas[indice].unshift(id);
    s.pendiente = null;
    s.vis = { cubeta: indice, activo: id, flecha: `c:t-${indice}`, vars: { clave, indice, nuevo: nombreNodo(s, id) } };
    paso("insertar", 5, tr(`tabla[${indice}] = nuevo: la lista de la cubeta ahora empieza en ${clave}. No hubo que recorrerla: O(1), haya o no colisión.`,
      `table[${indice}] = newNode: the bucket's list now starts at ${clave}. It didn't have to be walked: O(1), collision or not.`));
    s.vis = { cubeta: indice, encontrado: id, vars: { clave, indice }, cambiadas: ["α"] };
    paso("insertar", 6, tr(`cantidad++: el factor de carga queda en α = ${alfa(s)}.`, `count++: the load factor is now α = ${alfa(s)}.`) + (cierre ? ` ${cierre(s)}` : ""), "exito");
  }

  function animarBuscar(s, clave, paso) {
    const indice = hashDivision(clave, s.m);
    s.vis = { cubeta: indice, vars: { clave, indice } };
    paso("buscar", 2, tr(`indice = ${clave} % ${s.m} = ${indice}. Si ${clave} está en la tabla, solo puede estar en la cubeta ${indice}: las demás ni se miran.`,
      `index = ${clave} % ${s.m} = ${indice}. If ${clave} is in the table, it can only be in bucket ${indice}: the others aren't even looked at.`));
    let actual = s.cubetas[indice][0];
    let vistos = 0;
    s.vis = { cubeta: indice, activo: actual, vars: { clave, indice, actual: nombreNodo(s, actual) } };
    paso("buscar", 3, actual ? tr(`actual = tabla[${indice}]: empezamos por el primer nodo de la cubeta.`, `current = table[${indice}]: we start with the bucket's first node.`)
      : tr(`actual = tabla[${indice}] = nullptr: la cubeta está vacía.`, `current = table[${indice}] = nullptr: the bucket is empty.`));
    while (actual) {
      vistos++;
      const v = s.nodos[actual];
      if (v === clave) {
        s.vis = { cubeta: indice, encontrado: actual, vars: { clave, indice, actual: nombreNodo(s, actual) } };
        paso("buscar", 5, tr(`¿actual->valor (${v}) == ${clave}? Sí: return true. Revisamos ${vistos} nodo(s) de ${totalNodos(s)}.`,
          `current->value (${v}) == ${clave}? Yes: return true. We checked ${vistos} node(s) out of ${totalNodos(s)}.`), "exito");
        return;
      }
      paso("buscar", 5, tr(`¿actual->valor (${v}) == ${clave}? No.`, `current->value (${v}) == ${clave}? No.`));
      const pos = s.cubetas[indice].indexOf(actual);
      actual = s.cubetas[indice][pos + 1];
      s.vis = { cubeta: indice, activo: actual, flecha: `n:${s.cubetas[indice][pos]}`, vars: { clave, indice, actual: nombreNodo(s, actual) } };
      paso("buscar", 6, tr(`actual = actual->sig: avanzamos a ${nombreNodo(s, actual)}.`, `current = current->next: we move on to ${nombreNodo(s, actual)}.`));
    }
    s.vis = { cubeta: indice, vars: { clave, indice, actual: "nullptr" } };
    paso("buscar", 4, tr("actual es nullptr: se acabó la lista de esta cubeta.", "current is nullptr: this bucket's list is over."));
    paso("buscar", 8, tr(`return false: ${clave} no está en la tabla. Solo revisamos ${vistos} nodo(s).`, `return false: ${clave} isn't in the table. We only checked ${vistos} node(s).`), "error");
  }

  function animarEliminar(s, clave, paso) {
    const indice = hashDivision(clave, s.m);
    const cadena = s.cubetas[indice];
    const vars = (actual, anterior) => ({ clave, indice, actual: nombreNodo(s, actual), anterior: nombreNodo(s, anterior) });
    s.vis = { cubeta: indice, vars: { clave, indice } };
    paso("eliminar", 2, tr(`indice = ${clave} % ${s.m} = ${indice}: solo hay que buscar en la lista de la cubeta ${indice}.`,
      `index = ${clave} % ${s.m} = ${indice}: we only have to search the list of bucket ${indice}.`));
    let actual = cadena[0];
    let anterior = null;
    s.vis = { cubeta: indice, activo: actual, vars: { clave, indice, actual: nombreNodo(s, actual) } };
    paso("eliminar", 3, actual ? tr("actual = tabla[indice]: el primer nodo de la cubeta.", "current = table[index]: the bucket's first node.")
      : tr("actual = tabla[indice] = nullptr: la cubeta está vacía.", "current = table[index] = nullptr: the bucket is empty."));
    s.vis = { cubeta: indice, activo: actual, vars: vars(actual, anterior) };
    paso("eliminar", 4, tr("anterior = nullptr: todavía no hay un nodo antes de actual. Lo necesitamos para \"saltar\" el nodo que borremos.",
      "prev = nullptr: there's no node before current yet. We need it to \"skip\" the node we delete."));
    while (actual) {
      const v = s.nodos[actual];
      if (v === clave) {
        s.vis = { cubeta: indice, borrado: actual, anterior, vars: vars(actual, anterior) };
        paso("eliminar", 6, tr(`¿actual->valor (${v}) == ${clave}? Sí: este es el nodo a borrar.`, `current->value (${v}) == ${clave}? Yes: this is the node to delete.`));
        s.saltado = actual;
        const siguiente = cadena[cadena.indexOf(actual) + 1];
        s.vis = { cubeta: indice, borrado: actual, anterior, flecha: anterior ? `n:${anterior}` : `c:t-${indice}`, vars: vars(actual, anterior) };
        if (anterior) {
          paso("eliminar", 7, tr(`anterior->sig = actual->sig: el ${s.nodos[anterior]} ahora apunta a ${nombreNodo(s, siguiente)} y se salta al ${clave}.`,
            `prev->next = current->next: ${s.nodos[anterior]} now points to ${nombreNodo(s, siguiente)} and skips ${clave}.`));
        } else {
          paso("eliminar", 8, tr(`anterior es nullptr (era el primero): tabla[${indice}] = actual->sig = ${nombreNodo(s, siguiente)}.`,
            `prev is nullptr (it was the first one): table[${indice}] = current->next = ${nombreNodo(s, siguiente)}.`));
        }
        cadena.splice(cadena.indexOf(actual), 1);
        delete s.nodos[actual];
        s.saltado = null;
        s.vis = { cubeta: indice, vars: vars(null, anterior) };
        paso("eliminar", 9, tr(`delete actual: liberamos la memoria del nodo ${clave}.`, `delete current: we free the memory of node ${clave}.`));
        s.vis = { cubeta: indice, vars: { clave, indice }, cambiadas: ["α"] };
        paso("eliminar", 11, tr(`cantidad-- y return true. Ahora α = ${alfa(s)}.`, `count-- and return true. Now α = ${alfa(s)}.`), "exito");
        return;
      }
      s.vis = { cubeta: indice, activo: actual, anterior, vars: vars(actual, anterior) };
      paso("eliminar", 6, tr(`¿actual->valor (${v}) == ${clave}? No.`, `current->value (${v}) == ${clave}? No.`));
      anterior = actual;
      s.vis = { cubeta: indice, activo: actual, anterior, vars: vars(actual, anterior) };
      paso("eliminar", 13, tr(`anterior = actual (${v}).`, `prev = current (${v}).`));
      actual = cadena[cadena.indexOf(actual) + 1];
      s.vis = { cubeta: indice, activo: actual, anterior, flecha: `n:${anterior}`, vars: vars(actual, anterior) };
      paso("eliminar", 14, tr(`actual = actual->sig: ${nombreNodo(s, actual)}.`, `current = current->next: ${nombreNodo(s, actual)}.`));
    }
    s.vis = { cubeta: indice, anterior, vars: vars(null, anterior) };
    paso("eliminar", 5, tr("actual es nullptr: recorrimos toda la lista de la cubeta.", "current is nullptr: we walked the bucket's whole list."));
    paso("eliminar", 16, tr(`return false: ${clave} no estaba en la tabla.`, `return false: ${clave} wasn't in the table.`), "error");
  }

  function esPrimo(n) {
    if (n < 2) return false;
    for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
    return true;
  }

  function siguientePrimo(n) {
    while (!esPrimo(n)) n++;
    return n;
  }

  function animarRehash(s, paso) {
    const nuevoTamano = siguientePrimo(2 * s.m);
    const viejo = s.m;
    s.nueva = { m: nuevoTamano, cubetas: cubetasVacias(nuevoTamano) };
    s.vis = { vars: { nuevoTamano } };
    paso("rehash", 2, tr(`nuevoTamano = siguientePrimo(2 · ${viejo}) = ${nuevoTamano}. Creamos un arreglo nuevo de ${nuevoTamano} cubetas vacías.`,
      `newSize = nextPrime(2 · ${viejo}) = ${nuevoTamano}. We create a new array of ${nuevoTamano} empty buckets.`));
    for (let b = 0; b < viejo; b++) {
      const cadena = s.cubetas[b];
      s.vis = { cubeta: b, activo: cadena[0], vars: { nuevoTamano, actual: nombreNodo(s, cadena[0]) } };
      paso("rehash", 3, cadena.length
        ? tr(`Cubeta ${b} de la tabla vieja: actual = su primer nodo (${s.nodos[cadena[0]]}).`, `Bucket ${b} of the old table: current = its first node (${s.nodos[cadena[0]]}).`)
        : tr(`Cubeta ${b} de la tabla vieja: está vacía, no hay nada que mover.`, `Bucket ${b} of the old table: it's empty, there's nothing to move.`));
      while (cadena.length) {
        const actual = cadena[0];
        const siguiente = cadena[1];
        const v = s.nodos[actual];
        const vars = { nuevoTamano, actual: nombreNodo(s, actual), siguiente: nombreNodo(s, siguiente) };
        s.vis = { cubeta: b, activo: actual, vars };
        paso("rehash", 5, tr(`siguiente = actual->sig (${nombreNodo(s, siguiente)}): lo guardamos antes de cambiar el puntero del nodo.`,
          `nextNode = current->next (${nombreNodo(s, siguiente)}): we save it before changing the node's pointer.`));
        const indice = hashDivision(v, nuevoTamano);
        s.vis = { cubeta: b, cubetaNueva: indice, activo: actual, vars: Object.assign({ indice }, vars) };
        paso("rehash", 6, tr(`indice = ${v} % ${nuevoTamano} = ${indice}. Antes estaba en la cubeta ${b} (${v} % ${viejo})`
          + (indice === b ? ": por casualidad, el número de cubeta no cambia." : ": con otro m, cambia de cubeta."),
        `index = ${v} % ${nuevoTamano} = ${indice}. Before, it was in bucket ${b} (${v} % ${viejo})`
          + (indice === b ? ": by chance, the bucket number doesn't change." : ": with another m, it changes bucket.")));
        cadena.shift();
        s.nueva.cubetas[indice].unshift(actual);
        s.vis = { cubeta: b, cubetaNueva: indice, activo: actual, flecha: `c:n-${indice}`, vars: Object.assign({ indice }, vars) };
        paso("rehash", 8, tr(`actual->sig = nueva[${indice}] y nueva[${indice}] = actual: el mismo nodo se engancha al frente de su nueva cubeta. No se copia ni se crea nada.`,
          `current->next = newTable[${indice}] and newTable[${indice}] = current: the same node hooks onto the front of its new bucket. Nothing is copied or created.`));
        s.vis = { cubeta: b, activo: siguiente, vars: { nuevoTamano, actual: nombreNodo(s, siguiente) } };
        paso("rehash", 9, siguiente ? tr(`actual = siguiente: seguimos con el ${s.nodos[siguiente]}.`, `current = nextNode: we continue with ${s.nodos[siguiente]}.`)
          : tr(`actual = siguiente = nullptr: terminamos la cubeta ${b}.`, `current = nextNode = nullptr: we're done with bucket ${b}.`));
      }
    }
    s.cubetas = s.nueva.cubetas;
    s.m = nuevoTamano;
    s.nueva = null;
    s.vis = { vars: { nuevoTamano }, cambiadas: ["α"] };
    paso("rehash", 12, tr(`tabla.swap(nueva): la tabla nueva toma el lugar de la vieja. α bajó a ${alfa(s)}: las listas vuelven a ser cortas.`,
      `table.swap(newTable): the new table takes the old one's place. α dropped to ${alfa(s)}: the lists are short again.`), "exito");
  }

  // Paso 4: encadenamiento con el ejemplo de main().
  const MAXIMO_ENCADENADA = 14;

  DS.tema({
    contenedor: "vis-encadenamiento",
    incremental: true,
    dibujar: dibujarCadenas,
    codigo: elegir(ENCADENADA, "insertar", "buscar", "eliminar"),
    tituloCodigo: (clave) => `${ENCADENADA_CLASE}::${nombreF(clave)}()`,
    mensajeInicial: tr("La tabla de main(), m = 7: las cubetas 0 y 1 tuvieron colisiones. Inserta 21 (cae en la 0), busca 99 y 10, y elimina 15.",
      "The table from main(), m = 7: buckets 0 and 1 had collisions. Insert 21 (it lands in 0), find 99 and 10, and remove 15."),
    estadoInicial: () => estadoCadenas(7, EJEMPLO),
    entradas: [{ id: "clave", etiqueta: CLAVE, min: 0, max: 999, valor: 21 }],
    operaciones: [
      {
        id: "insertar",
        etiqueta: llamadaCon("insertar"),
        usa: ["clave"],
        ejecutar(s, { clave }, paso) { animarInsertar(s, clave, paso, MAXIMO_ENCADENADA); },
      },
      {
        id: "buscar",
        etiqueta: llamadaCon("buscar"),
        usa: ["clave"],
        ejecutar(s, { clave }, paso) { animarBuscar(s, clave, paso); },
      },
      {
        id: "eliminar",
        etiqueta: llamadaCon("eliminar"),
        usa: ["clave"],
        ejecutar(s, { clave }, paso) { animarEliminar(s, clave, paso); },
      },
    ],
  });

  // Paso 6: factor de carga y rehash.
  const MAXIMO_CARGA = 12;
  const MAXIMO_M = 11;

  DS.tema({
    contenedor: "vis-carga",
    incremental: true,
    dibujar: dibujarCadenas,
    codigo: elegir(ENCADENADA, "insertar", "rehash"),
    tituloCodigo: (clave) => `${ENCADENADA_CLASE}::${nombreF(clave)}()`,
    mensajeInicial: tr(`m = 5 cubetas y ${EJEMPLO.length} claves: α = 1, un nodo por cubeta en promedio. Inserta 20 (α pasa de 1) y luego haz rehash.`,
      `m = 5 buckets and ${EJEMPLO.length} keys: α = 1, one node per bucket on average. Insert 20 (α goes over 1) and then rehash.`),
    estadoInicial: () => estadoCadenas(5, EJEMPLO),
    entradas: [{ id: "clave", etiqueta: CLAVE, min: 0, max: 999, valor: 20 }],
    operaciones: [
      {
        id: "insertar",
        etiqueta: llamadaCon("insertar"),
        usa: ["clave"],
        ejecutar(s, { clave }, paso) {
          animarInsertar(s, clave, paso, MAXIMO_CARGA, (t) => (totalNodos(t) / t.m > 1
            ? tr("Pasó de 1: las listas se alargan y buscar se vuelve lento. Es hora de un rehash.", "It went over 1: the lists get longer and finding gets slow. It's time for a rehash.")
            : tr("Mientras α no pase de 1, las listas siguen cortas.", "As long as α doesn't go over 1, the lists stay short.")));
        },
      },
      {
        id: "rehash",
        etiqueta: `rehash(${nombreF("siguientePrimo")}(2 · m))`,
        ejecutar(s, args, paso) {
          if (s.m >= MAXIMO_M) {
            paso("rehash", 1, tr(`Para que quepa en pantalla, la animación llega hasta m = ${MAXIMO_M}. Pulsa Reiniciar para volver a m = 5.`,
              `So that it fits on screen, the animation goes up to m = ${MAXIMO_M}. Press Reset to go back to m = 5.`), "error");
            return;
          }
          animarRehash(s, paso);
        },
      },
    ],
  });

  // ------------------------------------------------------------------
  // Paso 5: direccionamiento abierto (sondeo lineal, cuadrático, doble hash)
  // ------------------------------------------------------------------

  const M_ABIERTA = 7;

  const SONDEOS = {
    lineal: {
      nombre: tr("Sondeo lineal", "Linear probing"), linea: 3, formula: "(h + i) % m",
      idea: tr("prueba la celda siguiente. Es simple y bueno para la caché, pero forma racimos de celdas ocupadas que alargan los sondeos.",
        "tries the next cell. It's simple and cache-friendly, but it forms clusters of taken cells that make the probes longer."),
      pos: (k, i, m) => (hashDivision(k, m) + i) % m,
      cuenta: (k, i, m) => `(${hashDivision(k, m)} + ${i}) % ${m}`,
    },
    cuadratico: {
      nombre: tr("Sondeo cuadrático", "Quadratic probing"), linea: 4, formula: "(h + i²) % m",
      idea: tr("salta cada vez más lejos y rompe los racimos, pero no visita todas las celdas: puede fallar aunque haya lugar.",
        "jumps farther each time and breaks up the clusters, but it doesn't visit every cell: it can fail even when there's room."),
      pos: (k, i, m) => (hashDivision(k, m) + i * i) % m,
      cuenta: (k, i, m) => `(${hashDivision(k, m)} + ${i}²) % ${m}`,
    },
    doble: {
      nombre: tr("Doble hash", "Double hashing"), linea: 6, formula: tr("(h + i · paso) % m", "(h + i · step) % m"),
      idea: tr("cada clave salta distinto (paso sale de un segundo hash) y, con m primo, recorre todas las celdas. Calcula dos hashes.",
        "each key jumps differently (step comes from a second hash) and, with a prime m, it goes through every cell. It computes two hashes."),
      pos: (k, i, m) => (hashDivision(k, m) + i * (1 + hashDivision(k, m - 1))) % m,
      cuenta: (k, i, m) => `(${hashDivision(k, m)} + ${i}·${1 + hashDivision(k, m - 1)}) % ${m}`,
    },
  };

  function insertarDirecto(s, clave) {
    const t = SONDEOS[s.sondeo];
    for (let i = 0; i < s.m; i++) {
      const p = t.pos(clave, i, s.m);
      if (s.celdas[p].estado !== "ocupada") {
        s.celdas[p] = { estado: "ocupada", clave };
        return true;
      }
    }
    return false;
  }

  function estadoAbierta(sondeo) {
    const s = { m: M_ABIERTA, sondeo, celdas: Array.from({ length: M_ABIERTA }, () => ({ estado: "vacia" })), vis: {} };
    for (const v of EJEMPLO) insertarDirecto(s, v);
    return s;
  }

  const ocupadas = (s) => s.celdas.filter((c) => c.estado === "ocupada").length;
  const alfaAbierta = (s) => `${ocupadas(s)} / ${s.m} = ${decimal(ocupadas(s) / s.m)}`;

  // Paso en posicion(): cómo se calcula h y la fórmula de la estrategia.
  function explicarPosicion(s, clave, paso, base) {
    const t = SONDEOS[s.sondeo];
    const h = hashDivision(clave, s.m);
    const vars = Object.assign({ clave, h }, s.sondeo === "doble" ? { paso: 1 + hashDivision(clave, s.m - 1) } : {});
    s.vis = Object.assign({}, base, { vars, inicio: h });
    paso("posicion", 2, tr(`h = ${clave} % ${s.m} = ${h}: la celda "ideal" de ${clave}. Es el intento i = 0.`, `h = ${clave} % ${s.m} = ${h}: the "ideal" cell for ${clave}. It's attempt i = 0.`));
    if (s.sondeo === "doble") {
      paso("posicion", 5, tr(`Doble hash: el salto depende de la clave. paso = 1 + ${clave} % ${s.m - 1} = ${vars.paso} (nunca 0, para no quedarse quieto).`,
        `Double hashing: the jump depends on the key. step = 1 + ${clave} % ${s.m - 1} = ${vars.paso} (never 0, so it doesn't stand still).`));
    }
    paso("posicion", t.linea, s.sondeo === "doble"
      ? tr(`El intento i avanza i veces ese paso: celda ${t.formula}.`, `Attempt i moves i times that step: cell ${t.formula}.`)
      : tr(`${t.nombre}: el intento i va a la celda ${t.formula}.`, `${t.nombre}: attempt i goes to cell ${t.formula}.`));
    return vars;
  }

  // Recorre los intentos; decide(p, celda) devuelve true para detenerse.
  function sondear(s, clave, claveCodigo, paso, vars, decide) {
    const t = SONDEOS[s.sondeo];
    const visitas = [];
    for (let i = 0; i < s.m; i++) {
      const p = t.pos(clave, i, s.m);
      const repetida = visitas.indexOf(p);
      visitas.push(p);
      s.vis = { visitas: visitas.slice(), actual: p, vars: Object.assign({}, vars, { i, p }) };
      paso(claveCodigo, 3, `i = ${i}: p = ${nombreF("posicion")}(${clave}, ${i}) = ${t.cuenta(clave, i, s.m)} = ${p}.`
        + (repetida >= 0 ? tr(` ¡Ya la probamos en i = ${repetida}!`, ` We already tried it at i = ${repetida}!`) : ""));
      if (decide(i, p, visitas)) return { i, p, visitas };
    }
    return { i: s.m, p: null, visitas };
  }

  const AGOTADOS = (m) => tr(`Agotamos los ${m} intentos sin encontrarla: return false.`, `We used up the ${m} attempts without finding it: return false.`);
  const describir = (c) => (c.estado === "ocupada" ? tr(`ocupada (${c.clave})`, `taken (${c.clave})`)
    : c.estado === "borrada" ? tr(`una lápida (ahí estuvo ${c.clave})`, `a tombstone (${c.clave} was there)`) : tr("vacía", "empty"));

  DS.tema({
    contenedor: "vis-abierta",
    codigo: ABIERTA,
    tituloCodigo: (clave) => `${ABIERTA_CLASE}::${nombreF(clave)}()`,
    codigoInicial: "insertar",
    mensajeInicial: ({ sondeo }) => `${SONDEOS[sondeo].nombre}, ${SONDEOS[sondeo].formula}: ${SONDEOS[sondeo].idea}`,
    estadoInicial: ({ sondeo }) => estadoAbierta(sondeo),
    entradas: [
      { id: "sondeo", etiqueta: tr("Estrategia", "Strategy"), opciones: Object.entries(SONDEOS).map(([k, t]) => [k, t.nombre]), valor: "lineal" },
      { id: "clave", etiqueta: CLAVE, min: 0, max: 999, valor: 14 },
    ],
    operaciones: [
      {
        id: "insertar",
        etiqueta: llamadaCon("insertar"),
        usa: ["clave"],
        ejecutar(s, { clave }, paso) {
          const vars = explicarPosicion(s, clave, paso, {});
          const r = sondear(s, clave, "insertar", paso, vars, (i, p, visitas) => {
            const c = s.celdas[p];
            const libre = c.estado !== "ocupada";
            s.vis = { visitas, actual: p, vars: Object.assign({}, vars, { i, p }), resultado: libre ? "ok" : "" };
            paso("insertar", 4, tr(`¿estados[${p}] != Ocupada? La celda está ${describir(c)}: ${libre ? "¡hay lugar!" : "sigue al próximo intento."}`,
              `states[${p}] != Occupied? The cell is ${describir(c)}: ${libre ? "there's room!" : "on to the next attempt."}`));
            return libre;
          });
          if (r.p == null) {
            s.vis = { visitas: r.visitas, vars: Object.assign({}, vars, { i: s.m }) };
            const distintas = new Set(r.visitas).size;
            paso("insertar", 11, ocupadas(s) === s.m
              ? tr(`Probamos los ${s.m} intentos y la tabla está llena: return false. En direccionamiento abierto, α nunca puede pasar de 1.`,
                `We tried the ${s.m} attempts and the table is full: return false. In open addressing, α can never go over 1.`)
              : tr(`return false después de ${s.m} intentos, ¡aunque quedan ${s.m - ocupadas(s)} celda(s) libre(s)! Esta clave solo visitó ${distintas} celdas distintas: ${[...new Set(r.visitas)].join(", ")}.`,
                `return false after ${s.m} attempts, even though ${s.m - ocupadas(s)} cell(s) are still free! This key only visited ${distintas} different cells: ${[...new Set(r.visitas)].join(", ")}.`), "error");
            return;
          }
          const reusada = s.celdas[r.p].estado === "borrada";
          s.celdas[r.p] = { estado: "ocupada", clave };
          s.vis = { visitas: r.visitas, resultado: "ok", actual: r.p, vars: Object.assign({}, vars, { i: r.i, p: r.p }), alfa: true };
          paso("insertar", 8, tr(`claves[${r.p}] = ${clave}, se marca Ocupada${reusada ? " (reutilizamos la lápida)" : ""} y return true. ${r.i ? `Hicieron falta ${r.i + 1} intentos` : "Bastó 1 intento"}. α = ${alfaAbierta(s)}.`,
            `keys[${r.p}] = ${clave}, it's marked Occupied${reusada ? " (we reuse the tombstone)" : ""} and return true. ${r.i ? `It took ${r.i + 1} attempts` : "1 attempt was enough"}. α = ${alfaAbierta(s)}.`), "exito");
        },
      },
      {
        id: "buscar",
        etiqueta: llamadaCon("buscar"),
        usa: ["clave"],
        ejecutar(s, { clave }, paso) {
          const vars = explicarPosicion(s, clave, paso, {});
          let fin = null;
          const r = sondear(s, clave, "buscar", paso, vars, (i, p, visitas) => {
            const c = s.celdas[p];
            const base = { visitas, actual: p, vars: Object.assign({}, vars, { i, p }) };
            if (c.estado === "vacia") {
              s.vis = Object.assign(base, { resultado: "error" });
              paso("buscar", 4, tr(`La celda ${p} está vacía: si ${clave} existiera, se habría guardado aquí o antes. return false.`,
                `Cell ${p} is empty: if ${clave} existed, it would have been stored here or earlier. return false.`), "error");
              fin = "vacia";
              return true;
            }
            if (c.estado === "ocupada" && c.clave === clave) {
              s.vis = Object.assign(base, { resultado: "ok" });
              paso("buscar", 5, tr(`claves[${p}] == ${clave}: ¡encontrada en el intento ${i}! return true.`, `keys[${p}] == ${clave}: found on attempt ${i}! return true.`), "exito");
              fin = "encontrada";
              return true;
            }
            s.vis = base;
            paso("buscar", 5, c.estado === "borrada"
              ? tr(`La celda ${p} es una lápida: no es ${clave}, pero no podemos parar aquí. Seguimos.`, `Cell ${p} is a tombstone: it isn't ${clave}, but we can't stop here. We go on.`)
              : tr(`La celda ${p} tiene ${c.clave}, no ${clave}. Seguimos.`, `Cell ${p} has ${c.clave}, not ${clave}. We go on.`));
            return false;
          });
          if (!fin) {
            s.vis = { visitas: r.visitas, vars: Object.assign({}, vars, { i: s.m }) };
            paso("buscar", 7, AGOTADOS(s.m), "error");
          }
        },
      },
      {
        id: "eliminar",
        etiqueta: llamadaCon("eliminar"),
        usa: ["clave"],
        ejecutar(s, { clave }, paso) {
          const vars = explicarPosicion(s, clave, paso, {});
          let fin = null;
          const r = sondear(s, clave, "eliminar", paso, vars, (i, p, visitas) => {
            const c = s.celdas[p];
            const base = { visitas, actual: p, vars: Object.assign({}, vars, { i, p }) };
            if (c.estado === "vacia") {
              s.vis = Object.assign(base, { resultado: "error" });
              paso("eliminar", 4, tr(`La celda ${p} está vacía: ${clave} no está en la tabla. return false.`, `Cell ${p} is empty: ${clave} isn't in the table. return false.`), "error");
              fin = "vacia";
              return true;
            }
            if (c.estado === "ocupada" && c.clave === clave) {
              s.vis = base;
              paso("eliminar", 5, tr(`claves[${p}] == ${clave}: la encontramos.`, `keys[${p}] == ${clave}: we found it.`));
              s.celdas[p] = { estado: "borrada", clave };
              s.vis = Object.assign({}, base, { resultado: "lapida" });
              paso("eliminar", 8, tr(`estados[${p}] = Borrada: dejamos una lápida en vez de vaciarla. Si la vaciáramos, una búsqueda que pasa por aquí pararía antes de tiempo. α = ${alfaAbierta(s)}.`,
                `states[${p}] = Deleted: we leave a tombstone instead of emptying it. If we emptied it, a search that goes through here would stop too early. α = ${alfaAbierta(s)}.`), "exito");
              fin = "borrada";
              return true;
            }
            s.vis = base;
            paso("eliminar", 5, c.estado === "borrada" ? tr(`La celda ${p} es una lápida: seguimos.`, `Cell ${p} is a tombstone: we go on.`)
              : tr(`La celda ${p} tiene ${c.clave}, no ${clave}. Seguimos.`, `Cell ${p} has ${c.clave}, not ${clave}. We go on.`));
            return false;
          });
          if (!fin) {
            s.vis = { visitas: r.visitas, vars: Object.assign({}, vars, { i: s.m }) };
            paso("eliminar", 11, AGOTADOS(s.m), "error");
          }
        },
      },
    ],
    dibujar(escenario, s) {
      const vis = s.vis || {};
      const visitas = vis.visitas || [];
      const celdas = s.celdas.map((c, p) => {
        const intentos = visitas.map((q, i) => (q === p ? i : null)).filter((i) => i != null);
        let clase = c.estado === "ocupada" ? "ocupada" : c.estado === "borrada" ? "lapida" : "vacia";
        if (vis.actual === p) {
          clase += vis.resultado === "ok" ? " encontrada" : vis.resultado === "error" ? " error" : vis.resultado === "lapida" ? " lapida escrita" : " leida";
        } else if (intentos.length) {
          clase += " visitada";
        }
        if (vis.inicio === p) clase += " leida";
        return el("div", { class: "celda-col" },
          el("span", { class: "marcador", text: intentos.length ? `i=${intentos.join(",")}` : "" }),
          el("div", { class: `celda ${clase}`, title: c.estado === "borrada" ? tr("lápida", "tombstone") : null, text: c.estado === "vacia" ? "" : c.clave }),
          el("span", { class: "indice", text: p }));
      });
      escenario.append(
        variables(Object.assign({ estrategia: SONDEOS[s.sondeo].formula }, vis.vars, { "α": alfaAbierta(s) })),
        el("div", { class: "celdas-abiertas", style: `--m:${s.m}` }, celdas),
        el("p", { class: "secuencia", text: visitas.length ? `${tr("Intentos", "Attempts")}: ${visitas.join(" → ")}`
          : tr("Celdas: azul = ocupada, punteada = vacía, tachada = lápida.", "Cells: blue = taken, dotted = empty, crossed out = tombstone.") }));
    },
  });
})();
