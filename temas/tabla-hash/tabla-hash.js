// Lección de la tabla hash: funciones hash, encadenamiento, direccionamiento
// abierto (sondeo lineal, cuadrático y doble hash), factor de carga y rehash.
// Los fragmentos de código deben coincidir línea por línea con
// ejemplos/cpp/tabla_hash.cpp (scripts/verificar-fragmentos.mjs lo revisa).
(function () {
  const { el } = DS;
  const SVG = "http://www.w3.org/2000/svg";
  const EJEMPLO = [15, 7, 42, 3, 99]; // los mismos números que usa main()

  // ------------------------------------------------------------------
  // Fragmentos de C++ (copiados de ejemplos/cpp/tabla_hash.cpp)
  // ------------------------------------------------------------------

  const FUNCIONES = {
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
  };

  const ENCADENADA = {
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
  };

  const ABIERTA = {
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
  };

  const elegir = (origen, ...claves) => Object.fromEntries(claves.map((c) => [c, origen[c]]));

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
      nombre: "División",
      idea: "clave % m, la más simple. Reparte mejor con m primo.",
      calcular: (k, m) => hashDivision(k, m),
      pasos(k, m, paso) {
        const r = k % m;
        paso(2, `r = ${k} % ${m} = ${r}: el resto de dividir ${k} entre ${m}. Siempre queda entre 0 y ${m - 1}.`, { clave: k, m, r });
        return [3, `r no es negativo, así que se devuelve tal cual: ${r}.`, { clave: k, m, r }];
      },
    },
    multiplicacion: {
      clave: "hashMultiplicacion",
      nombre: "Multiplicación",
      idea: "multiplica por A ≈ 0.618, se queda con los decimales y los escala a m (Knuth). El valor de m casi no importa.",
      calcular: (k, m) => Math.trunc(m * fraccion(k)),
      pasos(k, m, paso) {
        const producto = k * A;
        const f = producto - Math.floor(producto);
        const vars = { clave: k, m };
        paso(2, "A ≈ 0.618 es la parte decimal de la razón áurea. Knuth la recomienda porque mezcla muy bien los dígitos de la clave.", vars);
        paso(3, `producto = ${k} × 0.618… = ${decimal(producto)}.`, Object.assign(vars, { producto: decimal(producto) }));
        paso(4, `fraccion = ${decimal(producto)} − ${Math.floor(producto)} = ${decimal(f)}: nos quedamos solo con los decimales, un número entre 0 y 1.`,
          Object.assign(vars, { fraccion: decimal(f) }));
        const r = Math.trunc(m * f);
        return [5, `${m} × ${decimal(f)} = ${decimal(m * f)}; al convertirlo a int se cortan los decimales: ${r}.`, vars];
      },
    },
    cuadrado: {
      clave: "hashCuadradoMedio",
      nombre: "Cuadrado medio",
      idea: "eleva al cuadrado y toma los dígitos del centro, donde influyen todos los dígitos de la clave.",
      calcular: (k, m) => (Math.floor((k * k) / 100) % 100) % m,
      pasos(k, m, paso) {
        const cuadrado = k * k;
        const centro = Math.floor(cuadrado / 100) % 100;
        const seis = String(cuadrado).padStart(6, "0");
        const vars = { clave: k, m, cuadrado };
        paso(2, `cuadrado = ${k} × ${k} = ${cuadrado}. Al elevar al cuadrado, cada dígito de la clave influye en los del centro.`, vars);
        paso(3, `centro = (${cuadrado} / 100) % 100 = ${centro}: de ${seis.slice(0, 2)}[${seis.slice(2, 4)}]${seis.slice(4)} quitamos los 2 últimos dígitos y nos quedamos con los 2 siguientes.`,
          Object.assign(vars, { centro }));
        return [4, `return ${centro} % ${m} = ${centro % m}.`, vars];
      },
    },
    plegado: {
      clave: "hashPlegado",
      nombre: "Plegado",
      idea: "corta la clave en grupos de 2 dígitos y los suma. Sirve para claves largas, como teléfonos.",
      calcular(k, m) {
        let suma = 0;
        for (let c = k; c > 0; c = Math.floor(c / 100)) suma += c % 100;
        return suma % m;
      },
      pasos(k, m, paso) {
        let suma = 0;
        let c = k;
        paso(2, `suma = 0. Vamos a cortar ${k} en grupos de 2 dígitos, de derecha a izquierda, y sumarlos.`, { clave: c, m, suma });
        while (c > 0) {
          const grupo = c % 100;
          suma += grupo;
          paso(4, `suma += ${c} % 100 = ${grupo} (los 2 últimos dígitos): suma = ${suma}.`, { clave: c, m, suma });
          c = Math.floor(c / 100);
          paso(5, c > 0 ? `clave /= 100: quedan los dígitos ${c}.` : "clave /= 100: ya no quedan dígitos (clave = 0).", { clave: c, m, suma });
        }
        paso(3, "clave > 0 es falso: terminó el plegado.", { clave: c, m, suma });
        return [7, `return ${suma} % ${m} = ${suma % m}.`, { clave: c, m, suma }];
      },
    },
  };

  const TEXTO = {
    suma: {
      clave: "hashSumaLetras",
      idea: "Suma de letras: suma el código ASCII de cada letra. Es fácil, pero amor, roma, mora y ramo tienen las mismas letras… y la misma suma.",
      calcular: (t, m) => [...t].reduce((s, c) => s + codigo(c), 0) % m,
      pasos(t, m, paso) {
        let suma = 0;
        paso(2, `suma = 0. Recorremos "${t}" letra por letra y sumamos su código ASCII.`, { suma }, null);
        [...t].forEach((c, k) => {
          const antes = suma;
          suma += codigo(c);
          paso(4, `c = '${c}' (${codigo(c)}): suma = ${antes} + ${codigo(c)} = ${suma}.`, { c: `'${c}'`, suma }, k);
        });
        return [5, `return ${suma} % ${m} = ${suma % m}.`, { suma }];
      },
    },
    polinomial: {
      clave: "hashPolinomial",
      idea: "Polinomial (Horner): h = h · 31 + c en cada letra, así el orden importa (es el String.hashCode() de Java). El % m de cada vuelta evita desbordar el int.",
      calcular: (t, m) => [...t].reduce((h, c) => (h * 31 + codigo(c)) % m, 0),
      pasos(t, m, paso) {
        let h = 0;
        paso(2, `h = 0. En cada letra, h se multiplica por 31 antes de sumar: así la posición de cada letra cuenta.`, { h }, null);
        [...t].forEach((c, k) => {
          const antes = h;
          h = (h * 31 + codigo(c)) % m;
          paso(4, `c = '${c}' (${codigo(c)}): h = (${antes}·31 + ${codigo(c)}) % ${m} = ${antes * 31 + codigo(c)} % ${m} = ${h}.`, { c: `'${c}'`, h }, k);
        });
        return [5, `return ${h}.`, { h }];
      },
    },
  };

  const PALABRAS = ["amor", "roma", "mora", "ramo", "casa", "saca", "sol", "luna", "gato", "perro"];

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
    return `${n} clave(s) · ${usadas} de ${cubetas.length} cubetas usadas · ${n - usadas} colisión(es) · la más llena tiene ${mayor}`;
  }

  function dibujarCubetas(cubetas, vis) {
    return el("div", { class: "cubetas-hash" },
      cubetas.map((contenido, i) =>
        el("div", { class: `fila-cubeta${vis.cubeta === i ? " activa" : ""}${contenido.length > 1 ? " colision" : ""}` },
          el("span", { class: "indice", text: `[${i}]` }),
          el("div", { class: "caja" },
            contenido.map((v) => el("span", { class: `ficha${vis.nuevo === v && vis.cubeta === i ? " nueva" : ""}`, text: v }))))),
      el("p", { class: "resumen-cubetas", text: resumen(cubetas) }));
  }

  // ------------------------------------------------------------------
  // Paso 2: funciones hash para números
  // ------------------------------------------------------------------

  const MAXIMO_FICHAS = 30;

  // Coloca la clave en su cubeta y arma el mensaje (con o sin colisión).
  function colocar(s, valor, indice) {
    const antes = s.cubetas[indice].slice();
    s.cubetas[indice].push(valor);
    s.vis.cubeta = indice;
    s.vis.nuevo = valor;
    return antes.length
      ? `Cubeta ${indice}: ¡colisión! Ya estaba${antes.length > 1 ? "n" : ""} ${antes.join(", ")}.`
      : `Cubeta ${indice}: estaba libre, no hay colisión.`;
  }

  function agregarLote(s, valores, paso) {
    const f = NUMERICAS[s.funcion];
    const nuevos = valores.filter((v) => !s.cubetas.some((c) => c.includes(v)));
    if (s.cubetas.flat().length + nuevos.length > MAXIMO_FICHAS) {
      paso(f.clave, 0, `Para que quepa en pantalla, la tabla llega hasta ${MAXIMO_FICHAS} claves. Pulsa Reiniciar.`, "error");
      return;
    }
    if (!nuevos.length) {
      paso(f.clave, 0, "Esas claves ya están en la tabla.", "error");
      return;
    }
    nuevos.forEach((v, k) => {
      const indice = f.calcular(v, s.m);
      s.vis = { vars: { clave: v, m: s.m } };
      const texto = colocar(s, v, indice);
      paso(f.clave, 0, `${f.clave}(${v}, ${s.m}) = ${indice}. ${texto}`, k === nuevos.length - 1 ? "exito" : "");
    });
    s.vis = { vars: { m: s.m } };
    paso(f.clave, 0, `Así reparte ${f.nombre.toLowerCase()} con m = ${s.m}. ${resumen(s.cubetas)}. Cambia la función o m y compara.`, "exito");
  }

  DS.tema({
    contenedor: "vis-funciones",
    codigo: elegir(FUNCIONES, "hashDivision", "hashMultiplicacion", "hashCuadradoMedio", "hashPlegado"),
    tituloCodigo: (clave) => `${clave}(clave, m)`,
    codigoInicial: ({ funcion }) => NUMERICAS[funcion].clave,
    mensajeInicial: ({ funcion, m }) => `${NUMERICAS[funcion].nombre} (m = ${m}): ${NUMERICAS[funcion].idea} Calcula una clave o agrega varias de golpe.`,
    estadoInicial: ({ funcion, m }) => ({ funcion, m: Number(m), cubetas: cubetasVacias(Number(m)), vis: {} }),
    entradas: [
      { id: "funcion", etiqueta: "Función", opciones: Object.entries(NUMERICAS).map(([k, f]) => [k, f.nombre]), valor: "division" },
      { id: "m", etiqueta: "Cubetas (m)", opciones: [["7", "7"], ["10", "10"], ["11", "11"]], valor: "7" },
      { id: "clave", etiqueta: "Clave", min: 0, max: 999, aleatorio: true },
    ],
    operaciones: [
      {
        id: "calcular",
        etiqueta: ({ funcion }) => `${NUMERICAS[funcion].clave}(clave, m)`,
        usa: ["clave"],
        ejecutar(s, { clave }, paso) {
          const f = NUMERICAS[s.funcion];
          if (s.cubetas.some((c) => c.includes(clave))) {
            paso(f.clave, 0, `${clave} ya está en la tabla. Prueba con otra clave.`, "error");
            return;
          }
          if (s.cubetas.flat().length >= MAXIMO_FICHAS) {
            paso(f.clave, 0, `Para que quepa en pantalla, la tabla llega hasta ${MAXIMO_FICHAS} claves. Pulsa Reiniciar.`, "error");
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
        etiqueta: `Agregar ${EJEMPLO.join(", ")}`,
        secundaria: true,
        ejecutar(s, args, paso) { agregarLote(s, EJEMPLO, paso); },
      },
      {
        id: "decenas",
        etiqueta: "Agregar 10, 20, …, 100",
        secundaria: true,
        ejecutar(s, args, paso) { agregarLote(s, Array.from({ length: 10 }, (_, k) => 10 * (k + 1)), paso); },
      },
    ],
    dibujar(escenario, s) {
      escenario.append(DS.variables(s.vis.vars || { m: s.m }), dibujarCubetas(s.cubetas, s.vis));
    },
  });

  // ------------------------------------------------------------------
  // Paso 3: funciones hash para palabras
  // ------------------------------------------------------------------

  const M_TEXTO = 7;

  DS.tema({
    contenedor: "vis-palabras",
    codigo: elegir(FUNCIONES, "hashSumaLetras", "hashPolinomial"),
    tituloCodigo: (clave) => `${clave}(texto, m)`,
    codigoInicial: ({ funcion }) => TEXTO[funcion].clave,
    mensajeInicial: ({ funcion }) => `${TEXTO[funcion].idea} Prueba los anagramas con las dos funciones.`,
    estadoInicial: ({ funcion }) => ({ funcion, cubetas: cubetasVacias(M_TEXTO), vis: {} }),
    entradas: [
      { id: "funcion", etiqueta: "Función", opciones: [["suma", "Suma de letras"], ["polinomial", "Polinomial"]], valor: "suma" },
      { id: "palabra", etiqueta: "Palabra", opciones: PALABRAS.map((p) => [p, p]), valor: "amor", reinicia: false },
    ],
    operaciones: [
      {
        id: "calcular",
        etiqueta: ({ funcion, palabra }) => `${TEXTO[funcion].clave}("${palabra}", ${M_TEXTO})`,
        usa: ["palabra"],
        ejecutar(s, { palabra }, paso) {
          const f = TEXTO[s.funcion];
          if (s.cubetas.some((c) => c.includes(palabra))) {
            paso(f.clave, 0, `"${palabra}" ya está en la tabla. Elige otra palabra.`, "error");
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
        etiqueta: "Agregar los 4 anagramas",
        secundaria: true,
        ejecutar(s, args, paso) {
          const f = TEXTO[s.funcion];
          const nuevos = ["amor", "roma", "mora", "ramo"].filter((p) => !s.cubetas.some((c) => c.includes(p)));
          if (!nuevos.length) {
            paso(f.clave, 0, "Los cuatro anagramas ya están en la tabla.", "error");
            return;
          }
          for (const p of nuevos) {
            s.vis = { vars: { m: M_TEXTO }, palabra: p };
            const indice = f.calcular(p, M_TEXTO);
            paso(f.clave, 0, `${f.clave}("${p}", ${M_TEXTO}) = ${indice}. ${colocar(s, p, indice)}`);
          }
          s.vis = { vars: { m: M_TEXTO } };
          paso(f.clave, 0, s.funcion === "suma"
            ? "Las cuatro palabras tienen las mismas letras, así que la suma es la misma: todas caen en la misma cubeta, sin importar m."
            : "Con el hash polinomial el orden cambia el resultado y los anagramas se reparten. Aún pueden chocar dos (solo hay 7 cubetas), pero ya no por tener las mismas letras.", "exito");
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
      escenario.append(DS.variables(vis.vars || { m: M_TEXTO }), letras, dibujarCubetas(s.cubetas, vis));
    },
  });

  // ------------------------------------------------------------------
  // Pasos 4 y 6: encadenamiento (tabla de listas enlazadas) y rehash
  // ------------------------------------------------------------------

  const FILA = 44;
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

  const nombreNodo = (s, id) => (id == null ? "nullptr" : `nodo ${s.nodos[id]}`);

  // Bloques que se dibujan: la tabla y, durante el rehash, la tabla nueva.
  function bloques(s, disponible) {
    const lista = [{ id: "t", m: s.m, cubetas: s.cubetas, pendiente: s.pendiente, titulo: s.nueva ? `tabla (la vieja, m = ${s.m})` : `tabla (m = ${s.m})` }];
    if (s.nueva) lista.push({ id: "n", m: s.nueva.m, cubetas: s.nueva.cubetas, titulo: `nueva (m = ${s.nueva.m})` });
    let x = 0;
    let y = 0;
    for (const b of lista) {
      const largo = Math.max(2, ...b.cubetas.map((c, i) => c.length + (b.pendiente && b.pendiente.cubeta === i ? 1 : 0)));
      b.ancho = X_NODO + (largo - 1) * PASO_X + ANCHO_NODO;
      b.alto = TITULO + b.m * FILA;
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
    escenario.append(el("div", { class: "info-hash" }), lienzo);
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
      const y1 = origen.offsetTop + ALTO_NODO / 2;
      const x2 = destino.offsetLeft - 3;
      const y2 = destino.offsetTop + ALTO_NODO / 2;
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

  function dibujarCadenas(escenario, s) {
    if (!escenario) return;
    const lienzo = escenario.querySelector(".lienzo-hash") || crearLienzoCadenas(escenario);
    lienzo._estado = s;
    const vis = s.vis || {};
    escenario.querySelector(".info-hash").replaceChildren(DS.variables(Object.assign({}, vis.vars, { "α": alfa(s) }), vis.cambiadas));

    const lista = bloques(s, escenario.clientWidth - 32);
    const flechas = enlaces(s);
    const conSalida = new Set(flechas.filter((f) => f.a).map((f) => f.de));
    const vivos = new Set();
    const piezas = [];
    let ancho = 0;
    let alto = 0;

    const ubicar = (nodo, x, y) => { nodo.style.left = `${x}px`; nodo.style.top = `${y}px`; };

    for (const b of lista) {
      ancho = Math.max(ancho, b.x + b.ancho);
      alto = Math.max(alto, b.y + b.alto);
      piezas.push(el("span", { class: "fila-titulo", style: `left:${b.x}px;top:${b.y}px`, text: b.titulo }));
      const resaltada = b.id === "t" ? vis.cubeta : vis.cubetaNueva;
      b.cubetas.forEach((cadena, i) => {
        const y = b.y + TITULO + i * FILA;
        piezas.push(el("span", { class: "indice indice-cubeta", style: `left:${b.x}px;top:${y + 8}px`, text: `[${i}]` }));

        const k = `${b.id}-${i}`;
        vivos.add(`c:${k}`);
        let cubeta = lienzo.querySelector(`.cubeta[data-k="${k}"]`);
        if (!cubeta) {
          cubeta = el("div", { class: "cubeta", "data-k": k });
          lienzo.append(cubeta);
        }
        ubicar(cubeta, b.x + X_CUBETA, y);
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
          nodo.classList.toggle("suelto", !!(s.pendiente && s.pendiente.id === id));
          nodo.classList.toggle("activo", vis.activo === id);
          nodo.classList.toggle("anterior", vis.anterior === id);
          nodo.classList.toggle("encontrado", vis.encontrado === id);
          nodo.classList.toggle("borrado", vis.borrado === id);
        });
      });
    }
    for (const pieza of lienzo.querySelectorAll(".nodo, .cubeta")) {
      const clave = pieza.classList.contains("nodo") ? `n:${pieza.dataset.id}` : `c:${pieza.dataset.k}`;
      if (!vivos.has(clave)) pieza.remove();
    }
    lienzo.querySelector(".capa-fija").replaceChildren(...piezas);
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

  const MENSAJE_LIMITE = (maximo, conEliminar) => `Para que la animación quepa en pantalla, la tabla llega hasta ${maximo} nodos. ${conEliminar ? "Elimina alguno o pulsa" : "Pulsa"} Reiniciar.`;

  function animarInsertar(s, clave, paso, maximo, cierre) {
    if (totalNodos(s) >= maximo) {
      paso("insertar", 1, MENSAJE_LIMITE(maximo, !cierre), "error");
      return;
    }
    const indice = hashDivision(clave, s.m);
    const ocupantes = s.cubetas[indice].map((id) => s.nodos[id]);
    s.vis = { cubeta: indice, vars: { clave, indice } };
    paso("insertar", 2, `indice = hashDivision(${clave}, ${s.m}) = ${clave} % ${s.m} = ${indice}. La clave va a la cubeta ${indice}.`);
    const id = crearNodo(s, clave);
    s.pendiente = { id, cubeta: indice, enlazado: false };
    s.vis = { cubeta: indice, activo: id, vars: { clave, indice, nuevo: nombreNodo(s, id) } };
    paso("insertar", 3, `new Nodo(${clave}): un nodo nuevo en memoria. Todavía no está en la lista (su sig es nullptr).`);
    s.pendiente.enlazado = true;
    s.vis = { cubeta: indice, activo: id, flecha: `n:${id}`, vars: { clave, indice, nuevo: nombreNodo(s, id) } };
    paso("insertar", 4, ocupantes.length
      ? `¡Colisión! En la cubeta ${indice} ya ${ocupantes.length > 1 ? "están" : "está"} ${ocupantes.join(", ")}. nuevo->sig = tabla[${indice}]: el nodo nuevo apunta al que hoy es el primero (${ocupantes[0]}).`
      : `nuevo->sig = tabla[${indice}], que es nullptr: la cubeta estaba vacía, así que no hay colisión.`);
    s.cubetas[indice].unshift(id);
    s.pendiente = null;
    s.vis = { cubeta: indice, activo: id, flecha: `c:t-${indice}`, vars: { clave, indice, nuevo: nombreNodo(s, id) } };
    paso("insertar", 5, `tabla[${indice}] = nuevo: la lista de la cubeta ahora empieza en ${clave}. No hubo que recorrerla: O(1), haya o no colisión.`);
    s.vis = { cubeta: indice, encontrado: id, vars: { clave, indice }, cambiadas: ["α"] };
    paso("insertar", 6, `cantidad++: el factor de carga queda en α = ${alfa(s)}.${cierre ? ` ${cierre(s)}` : ""}`, "exito");
  }

  function animarBuscar(s, clave, paso) {
    const indice = hashDivision(clave, s.m);
    s.vis = { cubeta: indice, vars: { clave, indice } };
    paso("buscar", 2, `indice = ${clave} % ${s.m} = ${indice}. Si ${clave} está en la tabla, solo puede estar en la cubeta ${indice}: las demás ni se miran.`);
    let actual = s.cubetas[indice][0];
    let vistos = 0;
    s.vis = { cubeta: indice, activo: actual, vars: { clave, indice, actual: nombreNodo(s, actual) } };
    paso("buscar", 3, actual ? `actual = tabla[${indice}]: empezamos por el primer nodo de la cubeta.` : `actual = tabla[${indice}] = nullptr: la cubeta está vacía.`);
    while (actual) {
      vistos++;
      const v = s.nodos[actual];
      if (v === clave) {
        s.vis = { cubeta: indice, encontrado: actual, vars: { clave, indice, actual: nombreNodo(s, actual) } };
        paso("buscar", 5, `¿actual->valor (${v}) == ${clave}? Sí: return true. Revisamos ${vistos} nodo(s) de ${totalNodos(s)}.`, "exito");
        return;
      }
      paso("buscar", 5, `¿actual->valor (${v}) == ${clave}? No.`);
      const pos = s.cubetas[indice].indexOf(actual);
      actual = s.cubetas[indice][pos + 1];
      s.vis = { cubeta: indice, activo: actual, flecha: `n:${s.cubetas[indice][pos]}`, vars: { clave, indice, actual: nombreNodo(s, actual) } };
      paso("buscar", 6, `actual = actual->sig: avanzamos a ${nombreNodo(s, actual)}.`);
    }
    s.vis = { cubeta: indice, vars: { clave, indice, actual: "nullptr" } };
    paso("buscar", 4, "actual es nullptr: se acabó la lista de esta cubeta.");
    paso("buscar", 8, `return false: ${clave} no está en la tabla. Solo revisamos ${vistos} nodo(s).`, "error");
  }

  function animarEliminar(s, clave, paso) {
    const indice = hashDivision(clave, s.m);
    const cadena = s.cubetas[indice];
    const vars = (actual, anterior) => ({ clave, indice, actual: nombreNodo(s, actual), anterior: nombreNodo(s, anterior) });
    s.vis = { cubeta: indice, vars: { clave, indice } };
    paso("eliminar", 2, `indice = ${clave} % ${s.m} = ${indice}: solo hay que buscar en la lista de la cubeta ${indice}.`);
    let actual = cadena[0];
    let anterior = null;
    s.vis = { cubeta: indice, activo: actual, vars: { clave, indice, actual: nombreNodo(s, actual) } };
    paso("eliminar", 3, actual ? "actual = tabla[indice]: el primer nodo de la cubeta." : "actual = tabla[indice] = nullptr: la cubeta está vacía.");
    s.vis = { cubeta: indice, activo: actual, vars: vars(actual, anterior) };
    paso("eliminar", 4, "anterior = nullptr: todavía no hay un nodo antes de actual. Lo necesitamos para \"saltar\" el nodo que borremos.");
    while (actual) {
      const v = s.nodos[actual];
      if (v === clave) {
        s.vis = { cubeta: indice, borrado: actual, anterior, vars: vars(actual, anterior) };
        paso("eliminar", 6, `¿actual->valor (${v}) == ${clave}? Sí: este es el nodo a borrar.`);
        s.saltado = actual;
        const siguiente = cadena[cadena.indexOf(actual) + 1];
        s.vis = { cubeta: indice, borrado: actual, anterior, flecha: anterior ? `n:${anterior}` : `c:t-${indice}`, vars: vars(actual, anterior) };
        if (anterior) paso("eliminar", 7, `anterior->sig = actual->sig: el ${s.nodos[anterior]} ahora apunta a ${nombreNodo(s, siguiente)} y se salta al ${clave}.`);
        else paso("eliminar", 8, `anterior es nullptr (era el primero): tabla[${indice}] = actual->sig = ${nombreNodo(s, siguiente)}.`);
        cadena.splice(cadena.indexOf(actual), 1);
        delete s.nodos[actual];
        s.saltado = null;
        s.vis = { cubeta: indice, vars: vars(null, anterior) };
        paso("eliminar", 9, `delete actual: liberamos la memoria del nodo ${clave}.`);
        s.vis = { cubeta: indice, vars: { clave, indice }, cambiadas: ["α"] };
        paso("eliminar", 11, `cantidad-- y return true. Ahora α = ${alfa(s)}.`, "exito");
        return;
      }
      s.vis = { cubeta: indice, activo: actual, anterior, vars: vars(actual, anterior) };
      paso("eliminar", 6, `¿actual->valor (${v}) == ${clave}? No.`);
      anterior = actual;
      s.vis = { cubeta: indice, activo: actual, anterior, vars: vars(actual, anterior) };
      paso("eliminar", 13, `anterior = actual (${v}).`);
      actual = cadena[cadena.indexOf(actual) + 1];
      s.vis = { cubeta: indice, activo: actual, anterior, flecha: `n:${anterior}`, vars: vars(actual, anterior) };
      paso("eliminar", 14, `actual = actual->sig: ${nombreNodo(s, actual)}.`);
    }
    s.vis = { cubeta: indice, anterior, vars: vars(null, anterior) };
    paso("eliminar", 5, "actual es nullptr: recorrimos toda la lista de la cubeta.");
    paso("eliminar", 16, `return false: ${clave} no estaba en la tabla.`, "error");
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
    paso("rehash", 2, `nuevoTamano = siguientePrimo(2 · ${viejo}) = ${nuevoTamano}. Creamos un arreglo nuevo de ${nuevoTamano} cubetas vacías.`);
    for (let b = 0; b < viejo; b++) {
      const cadena = s.cubetas[b];
      s.vis = { cubeta: b, activo: cadena[0], vars: { nuevoTamano, actual: nombreNodo(s, cadena[0]) } };
      paso("rehash", 3, cadena.length
        ? `Cubeta ${b} de la tabla vieja: actual = su primer nodo (${s.nodos[cadena[0]]}).`
        : `Cubeta ${b} de la tabla vieja: está vacía, no hay nada que mover.`);
      while (cadena.length) {
        const actual = cadena[0];
        const siguiente = cadena[1];
        const v = s.nodos[actual];
        const vars = { nuevoTamano, actual: nombreNodo(s, actual), siguiente: nombreNodo(s, siguiente) };
        s.vis = { cubeta: b, activo: actual, vars };
        paso("rehash", 5, `siguiente = actual->sig (${nombreNodo(s, siguiente)}): lo guardamos antes de cambiar el puntero del nodo.`);
        const indice = hashDivision(v, nuevoTamano);
        s.vis = { cubeta: b, cubetaNueva: indice, activo: actual, vars: Object.assign({ indice }, vars) };
        paso("rehash", 6, `indice = ${v} % ${nuevoTamano} = ${indice}. Antes estaba en la cubeta ${b} (${v} % ${viejo})`
          + (indice === b ? ": por casualidad, el número de cubeta no cambia." : ": con otro m, cambia de cubeta."));
        cadena.shift();
        s.nueva.cubetas[indice].unshift(actual);
        s.vis = { cubeta: b, cubetaNueva: indice, activo: actual, flecha: `c:n-${indice}`, vars: Object.assign({ indice }, vars) };
        paso("rehash", 8, `actual->sig = nueva[${indice}] y nueva[${indice}] = actual: el mismo nodo se engancha al frente de su nueva cubeta. No se copia ni se crea nada.`);
        s.vis = { cubeta: b, activo: siguiente, vars: { nuevoTamano, actual: nombreNodo(s, siguiente) } };
        paso("rehash", 9, siguiente ? `actual = siguiente: seguimos con el ${s.nodos[siguiente]}.` : `actual = siguiente = nullptr: terminamos la cubeta ${b}.`);
      }
    }
    s.cubetas = s.nueva.cubetas;
    s.m = nuevoTamano;
    s.nueva = null;
    s.vis = { vars: { nuevoTamano }, cambiadas: ["α"] };
    paso("rehash", 12, `tabla.swap(nueva): la tabla nueva toma el lugar de la vieja. α bajó a ${alfa(s)}: las listas vuelven a ser cortas.`, "exito");
  }

  // Paso 4: encadenamiento con el ejemplo de main().
  const MAXIMO_ENCADENADA = 14;

  DS.tema({
    contenedor: "vis-encadenamiento",
    incremental: true,
    dibujar: dibujarCadenas,
    codigo: elegir(ENCADENADA, "insertar", "buscar", "eliminar"),
    tituloCodigo: (clave) => `TablaHashEncadenada::${clave}()`,
    mensajeInicial: `La tabla de main(), m = 7: las cubetas 0 y 1 tuvieron colisiones. Inserta 21 (cae en la 0), busca 99 y 10, y elimina 15.`,
    estadoInicial: () => estadoCadenas(7, EJEMPLO),
    entradas: [{ id: "clave", etiqueta: "Clave", min: 0, max: 999, valor: 21 }],
    operaciones: [
      {
        id: "insertar",
        etiqueta: "insertar(clave)",
        usa: ["clave"],
        ejecutar(s, { clave }, paso) { animarInsertar(s, clave, paso, MAXIMO_ENCADENADA); },
      },
      {
        id: "buscar",
        etiqueta: "buscar(clave)",
        usa: ["clave"],
        ejecutar(s, { clave }, paso) { animarBuscar(s, clave, paso); },
      },
      {
        id: "eliminar",
        etiqueta: "eliminar(clave)",
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
    tituloCodigo: (clave) => `TablaHashEncadenada::${clave}()`,
    mensajeInicial: `m = 5 cubetas y ${EJEMPLO.length} claves: α = 1, un nodo por cubeta en promedio. Inserta 20 (α pasa de 1) y luego haz rehash.`,
    estadoInicial: () => estadoCadenas(5, EJEMPLO),
    entradas: [{ id: "clave", etiqueta: "Clave", min: 0, max: 999, valor: 20 }],
    operaciones: [
      {
        id: "insertar",
        etiqueta: "insertar(clave)",
        usa: ["clave"],
        ejecutar(s, { clave }, paso) {
          animarInsertar(s, clave, paso, MAXIMO_CARGA, (t) => (totalNodos(t) / t.m > 1
            ? "Pasó de 1: las listas se alargan y buscar se vuelve lento. Es hora de un rehash."
            : "Mientras α no pase de 1, las listas siguen cortas."));
        },
      },
      {
        id: "rehash",
        etiqueta: "rehash(siguientePrimo(2 · m))",
        ejecutar(s, args, paso) {
          if (s.m >= MAXIMO_M) {
            paso("rehash", 1, `Para que quepa en pantalla, la animación llega hasta m = ${MAXIMO_M}. Pulsa Reiniciar para volver a m = 5.`, "error");
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
      nombre: "Sondeo lineal", linea: 3, formula: "(h + i) % m",
      idea: "prueba la celda siguiente. Es simple y bueno para la caché, pero forma racimos de celdas ocupadas que alargan los sondeos.",
      pos: (k, i, m) => (hashDivision(k, m) + i) % m,
      cuenta: (k, i, m) => `(${hashDivision(k, m)} + ${i}) % ${m}`,
    },
    cuadratico: {
      nombre: "Sondeo cuadrático", linea: 4, formula: "(h + i²) % m",
      idea: "salta cada vez más lejos y rompe los racimos, pero no visita todas las celdas: puede fallar aunque haya lugar.",
      pos: (k, i, m) => (hashDivision(k, m) + i * i) % m,
      cuenta: (k, i, m) => `(${hashDivision(k, m)} + ${i}²) % ${m}`,
    },
    doble: {
      nombre: "Doble hash", linea: 6, formula: "(h + i · paso) % m",
      idea: "cada clave salta distinto (paso sale de un segundo hash) y, con m primo, recorre todas las celdas. Calcula dos hashes.",
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
    paso("posicion", 2, `h = ${clave} % ${s.m} = ${h}: la celda "ideal" de ${clave}. Es el intento i = 0.`);
    if (s.sondeo === "doble") {
      paso("posicion", 5, `Doble hash: el salto depende de la clave. paso = 1 + ${clave} % ${s.m - 1} = ${vars.paso} (nunca 0, para no quedarse quieto).`);
    }
    paso("posicion", t.linea, s.sondeo === "doble"
      ? `El intento i avanza i veces ese paso: celda ${t.formula}.`
      : `${t.nombre}: el intento i va a la celda ${t.formula}.`);
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
      paso(claveCodigo, 3, `i = ${i}: p = posicion(${clave}, ${i}) = ${t.cuenta(clave, i, s.m)} = ${p}.`
        + (repetida >= 0 ? ` ¡Ya la probamos en i = ${repetida}!` : ""));
      if (decide(i, p, visitas)) return { i, p, visitas };
    }
    return { i: s.m, p: null, visitas };
  }

  const describir = (c) => (c.estado === "ocupada" ? `ocupada (${c.clave})` : c.estado === "borrada" ? `una lápida (ahí estuvo ${c.clave})` : "vacía");

  DS.tema({
    contenedor: "vis-abierta",
    codigo: ABIERTA,
    tituloCodigo: (clave) => `TablaHashAbierta::${clave}()`,
    codigoInicial: "insertar",
    mensajeInicial: ({ sondeo }) => `${SONDEOS[sondeo].nombre}, ${SONDEOS[sondeo].formula}: ${SONDEOS[sondeo].idea}`,
    estadoInicial: ({ sondeo }) => estadoAbierta(sondeo),
    entradas: [
      { id: "sondeo", etiqueta: "Estrategia", opciones: Object.entries(SONDEOS).map(([k, t]) => [k, t.nombre]), valor: "lineal" },
      { id: "clave", etiqueta: "Clave", min: 0, max: 999, valor: 14 },
    ],
    operaciones: [
      {
        id: "insertar",
        etiqueta: "insertar(clave)",
        usa: ["clave"],
        ejecutar(s, { clave }, paso) {
          const vars = explicarPosicion(s, clave, paso, {});
          const r = sondear(s, clave, "insertar", paso, vars, (i, p, visitas) => {
            const c = s.celdas[p];
            const libre = c.estado !== "ocupada";
            s.vis = { visitas, actual: p, vars: Object.assign({}, vars, { i, p }), resultado: libre ? "ok" : "" };
            paso("insertar", 4, `¿estados[${p}] != Ocupada? La celda está ${describir(c)}: ${libre ? "¡hay lugar!" : "sigue al próximo intento."}`);
            return libre;
          });
          if (r.p == null) {
            s.vis = { visitas: r.visitas, vars: Object.assign({}, vars, { i: s.m }) };
            const distintas = new Set(r.visitas).size;
            paso("insertar", 11, ocupadas(s) === s.m
              ? `Probamos los ${s.m} intentos y la tabla está llena: return false. En direccionamiento abierto, α nunca puede pasar de 1.`
              : `return false después de ${s.m} intentos, ¡aunque quedan ${s.m - ocupadas(s)} celda(s) libre(s)! Esta clave solo visitó ${distintas} celdas distintas: ${[...new Set(r.visitas)].join(", ")}.`, "error");
            return;
          }
          const reusada = s.celdas[r.p].estado === "borrada";
          s.celdas[r.p] = { estado: "ocupada", clave };
          s.vis = { visitas: r.visitas, resultado: "ok", actual: r.p, vars: Object.assign({}, vars, { i: r.i, p: r.p }), alfa: true };
          paso("insertar", 8, `claves[${r.p}] = ${clave}, se marca Ocupada${reusada ? " (reutilizamos la lápida)" : ""} y return true. ${r.i ? `Hicieron falta ${r.i + 1} intentos` : "Bastó 1 intento"}. α = ${alfaAbierta(s)}.`, "exito");
        },
      },
      {
        id: "buscar",
        etiqueta: "buscar(clave)",
        usa: ["clave"],
        ejecutar(s, { clave }, paso) {
          const vars = explicarPosicion(s, clave, paso, {});
          let fin = null;
          const r = sondear(s, clave, "buscar", paso, vars, (i, p, visitas) => {
            const c = s.celdas[p];
            const base = { visitas, actual: p, vars: Object.assign({}, vars, { i, p }) };
            if (c.estado === "vacia") {
              s.vis = Object.assign(base, { resultado: "error" });
              paso("buscar", 4, `La celda ${p} está vacía: si ${clave} existiera, se habría guardado aquí o antes. return false.`, "error");
              fin = "vacia";
              return true;
            }
            if (c.estado === "ocupada" && c.clave === clave) {
              s.vis = Object.assign(base, { resultado: "ok" });
              paso("buscar", 5, `claves[${p}] == ${clave}: ¡encontrada en el intento ${i}! return true.`, "exito");
              fin = "encontrada";
              return true;
            }
            s.vis = base;
            paso("buscar", 5, c.estado === "borrada"
              ? `La celda ${p} es una lápida: no es ${clave}, pero no podemos parar aquí. Seguimos.`
              : `La celda ${p} tiene ${c.clave}, no ${clave}. Seguimos.`);
            return false;
          });
          if (!fin) {
            s.vis = { visitas: r.visitas, vars: Object.assign({}, vars, { i: s.m }) };
            paso("buscar", 7, `Agotamos los ${s.m} intentos sin encontrarla: return false.`, "error");
          }
        },
      },
      {
        id: "eliminar",
        etiqueta: "eliminar(clave)",
        usa: ["clave"],
        ejecutar(s, { clave }, paso) {
          const vars = explicarPosicion(s, clave, paso, {});
          let fin = null;
          const r = sondear(s, clave, "eliminar", paso, vars, (i, p, visitas) => {
            const c = s.celdas[p];
            const base = { visitas, actual: p, vars: Object.assign({}, vars, { i, p }) };
            if (c.estado === "vacia") {
              s.vis = Object.assign(base, { resultado: "error" });
              paso("eliminar", 4, `La celda ${p} está vacía: ${clave} no está en la tabla. return false.`, "error");
              fin = "vacia";
              return true;
            }
            if (c.estado === "ocupada" && c.clave === clave) {
              s.vis = base;
              paso("eliminar", 5, `claves[${p}] == ${clave}: la encontramos.`);
              s.celdas[p] = { estado: "borrada", clave };
              s.vis = Object.assign({}, base, { resultado: "lapida" });
              paso("eliminar", 8, `estados[${p}] = Borrada: dejamos una lápida en vez de vaciarla. Si la vaciáramos, una búsqueda que pasa por aquí pararía antes de tiempo. α = ${alfaAbierta(s)}.`, "exito");
              fin = "borrada";
              return true;
            }
            s.vis = base;
            paso("eliminar", 5, c.estado === "borrada" ? `La celda ${p} es una lápida: seguimos.` : `La celda ${p} tiene ${c.clave}, no ${clave}. Seguimos.`);
            return false;
          });
          if (!fin) {
            s.vis = { visitas: r.visitas, vars: Object.assign({}, vars, { i: s.m }) };
            paso("eliminar", 11, `Agotamos los ${s.m} intentos sin encontrarla: return false.`, "error");
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
          el("div", { class: `celda ${clase}`, title: c.estado === "borrada" ? "lápida" : null, text: c.estado === "vacia" ? "" : c.clave }),
          el("span", { class: "indice", text: p }));
      });
      escenario.append(
        DS.variables(Object.assign({ estrategia: SONDEOS[s.sondeo].formula }, vis.vars, { "α": alfaAbierta(s) })),
        el("div", { class: "celdas-abiertas", style: `--m:${s.m}` }, celdas),
        el("p", { class: "secuencia", text: visitas.length ? `Intentos: ${visitas.join(" → ")}` : "Celdas: azul = ocupada, punteada = vacía, tachada = lápida." }));
    },
  });
})();
