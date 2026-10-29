// Lección de la lista enlazada, en pasos. Los fragmentos de código deben
// coincidir línea por línea con ejemplos/cpp/lista_enlazada.cpp
// (scripts/verificar-fragmentos.mjs lo revisa).
(function () {
  const { el } = DS;
  const MAXIMO = 15; // límite solo para que la animación quepa en pantalla
  const MARGEN = 14;
  const X_LISTA = 100; // x del primer nodo: a la izquierda va la variable cabeza
  const ALTO_NODO = 46;
  const Y_FILA = 58; // y de la primera fila: arriba quedan las marcas de los punteros
  const SVG = "http://www.w3.org/2000/svg";
  const ORDEN_PUNTEROS = ["nuevo", "anterior", "actual", "nodo", "temp"];

  // Direcciones "al azar": cada new Nodo cae donde haya lugar, no en orden.
  const DIRECCIONES = [0x3a0, 0x1c8, 0x5f0, 0x2b8, 0x748, 0x0d0, 0x630, 0x418, 0x290, 0x7e0, 0x158, 0x6a8];

  // ------------------------------------------------------------------
  // Fragmentos de C++ (copiados de ejemplos/cpp/lista_enlazada.cpp)
  // ------------------------------------------------------------------

  const CODIGO = {
    nodoEn: `
      Nodo* nodoEn(int pos) const {
          if (pos < 0) {
              return nullptr;
          }
          Nodo* actual = cabeza;
          for (int i = 0; i < pos && actual != nullptr; i++) {
              actual = actual->siguiente;
          }
          return actual;
      }`,
    obtener: `
      int obtener(int pos) const {
          Nodo* nodo = nodoEn(pos);
          if (nodo == nullptr) {
              throw std::out_of_range("posicion invalida");
          }
          return nodo->valor;
      }`,
    insertarAlInicio: `
      void insertarAlInicio(int valor) {
          Nodo* nuevo = new Nodo(valor);
          nuevo->siguiente = cabeza;
          cabeza = nuevo;
          tamano++;
      }`,
    insertarEn: `
      void insertarEn(int pos, int valor) {
          if (pos < 0 || pos > tamano) {
              throw std::out_of_range("posicion invalida");
          }
          if (pos == 0) {
              insertarAlInicio(valor);
              return;
          }
          Nodo* anterior = nodoEn(pos - 1);
          Nodo* nuevo = new Nodo(valor);
          nuevo->siguiente = anterior->siguiente;
          anterior->siguiente = nuevo;
          tamano++;
      }`,
    insertarAlFinal: `
      void insertarAlFinal(int valor) {
          insertarEn(tamano, valor);
      }`,
    buscar: `
      bool buscar(int valor) const {
          Nodo* actual = cabeza;
          while (actual != nullptr) {
              if (actual->valor == valor) {
                  return true;
              }
              actual = actual->siguiente;
          }
          return false;
      }`,
    eliminar: `
      bool eliminar(int valor) {
          if (cabeza == nullptr) {
              return false;
          }
          if (cabeza->valor == valor) {
              Nodo* temp = cabeza;
              cabeza = cabeza->siguiente;
              delete temp;
              tamano--;
              return true;
          }
          Nodo* actual = cabeza;
          while (actual->siguiente != nullptr && actual->siguiente->valor != valor) {
              actual = actual->siguiente;
          }
          if (actual->siguiente == nullptr) {
              return false;
          }
          Nodo* temp = actual->siguiente;
          actual->siguiente = temp->siguiente;
          delete temp;
          tamano--;
          return true;
      }`,
    eliminarEn: `
      int eliminarEn(int pos) {
          if (pos < 0 || pos >= tamano) {
              throw std::out_of_range("posicion invalida");
          }
          Nodo* temp;
          if (pos == 0) {
              temp = cabeza;
              cabeza = cabeza->siguiente;
          } else {
              Nodo* anterior = nodoEn(pos - 1);
              temp = anterior->siguiente;
              anterior->siguiente = temp->siguiente;
          }
          int valor = temp->valor;
          delete temp;
          tamano--;
          return valor;
      }`,
  };

  // Funciones que llama cada operación: su código también tiene que estar
  // en el visualizador para mostrarlo durante la llamada.
  const LLAMA = {
    obtener: ["nodoEn"],
    insertarEn: ["insertarAlInicio", "nodoEn"],
    insertarAlFinal: ["insertarEn", "insertarAlInicio", "nodoEn"],
    eliminarEn: ["nodoEn"],
  };

  // ------------------------------------------------------------------
  // Estado: nodos por id (para que se deslicen), la cabeza, tamano y los
  // punteros locales de cada función (nuevo, anterior, actual, nodo, temp).
  // ------------------------------------------------------------------

  const hex = (n) => `0x${n.toString(16).padStart(3, "0")}`;

  function crearNodo(s, v, extra) {
    const id = `n${s.sig++}`;
    s.nodos[id] = Object.assign({ v, sig: null, dir: DIRECCIONES[s.usadas++ % DIRECCIONES.length] }, extra);
    return id;
  }

  // opciones: direcciones (se ve la dirección de cada nodo) o indices (su posición).
  function estadoDesde(valores, opciones) {
    const o = opciones || {};
    const s = { nodos: {}, cabeza: null, tamano: valores.length, ptrs: {}, sig: 1, usadas: 0, direcciones: !!o.direcciones, indices: !!o.indices, vis: {} };
    let anterior = null;
    for (const v of valores) {
      const id = crearNodo(s, v);
      if (anterior) s.nodos[anterior].sig = id;
      else s.cabeza = id;
      anterior = id;
    }
    return s;
  }

  // Recorre desde cabeza y devuelve los ids en orden.
  function cadena(s) {
    const orden = [];
    const vistos = new Set();
    for (let id = s.cabeza; id != null && !vistos.has(id); id = s.nodos[id].sig) {
      vistos.add(id);
      orden.push(id);
    }
    return orden;
  }

  // Cómo se nombra un puntero en los mensajes: por su valor o, en el paso
  // de las direcciones, por la dirección a la que apunta.
  function nombre(s, id) {
    if (id == null) return "nullptr";
    return s.direcciones ? `${hex(s.nodos[id].dir)} (el ${s.nodos[id].v})` : `el nodo ${s.nodos[id].v}`;
  }

  // Lo que muestra "devuelve" cuando una función retorna un puntero.
  const puntero = (s, id) => (id == null ? "nullptr" : s.direcciones ? hex(s.nodos[id].dir) : `nodo ${s.nodos[id].v}`);
  const valorSig = (s, id) => (s.nodos[id].sig == null ? "nullptr" : s.nodos[s.nodos[id].sig].v);

  // Lo que costó llegar al nodo anterior con nodoEn.
  const costoLlegar = (saltos) => (saltos === 0
    ? "Aquí el anterior era la cabeza (0 saltos), pero en general llegar a él cuesta pos - 1 saltos: O(n)."
    : `Lo que costó fue llegar al anterior: ${saltos} salto(s), O(n).`);

  function limiteAlcanzado(s, clave, paso) {
    if (Object.keys(s.nodos).length < MAXIMO) return false;
    s.vis = { error: true };
    paso(clave, 2, `Para que la animación quepa en pantalla, la lista llega hasta ${MAXIMO} nodos. Elimina alguno o pulsa Reiniciar.`, "error");
    return true;
  }

  // Limpia lo que solo existe mientras corre una función.
  function terminar(s) {
    s.ptrs = {};
    for (const nodo of Object.values(s.nodos)) {
      delete nodo.ancla;
      delete nodo.reserva;
    }
  }

  // ------------------------------------------------------------------
  // Animaciones de cada función. Las que otras llaman (nodoEn,
  // insertarAlInicio, insertarEn) reciben la pila de llamadas que esperan
  // "arriba" de ellas, para mostrarla mientras corren.
  // ------------------------------------------------------------------

  // nodoEn(pos): devuelve el id del nodo o null.
  function animarNodoEn(s, pos, paso, pila) {
    const llamadas = pila.concat(`nodoEn(${pos})`);
    const ver = (o) => { s.vis = Object.assign({ pila: llamadas, vars: { pos } }, o); };
    ver({});
    paso("nodoEn", 2, `Entramos a nodoEn(${pos}). ¿pos < 0? ${pos < 0 ? "Sí." : "No."}`);
    if (pos < 0) {
      ver({ salida: "nullptr" });
      paso("nodoEn", 3, "No existe una posición negativa: return nullptr, y quien llamó decide qué hacer.");
      return null;
    }
    s.ptrs.actual = s.cabeza;
    ver({ activo: s.cabeza, flecha: "cabeza" });
    paso("nodoEn", 5, s.cabeza == null
      ? "La lista está vacía: actual empieza en nullptr."
      : pos === 0
        ? `actual empieza en la cabeza (${nombre(s, s.cabeza)}), que ya es la posición 0: no hace falta saltar.`
        : `No hay cuenta que diga dónde está el nodo ${pos}: lo único que conocemos es cabeza. actual empieza ahí (${nombre(s, s.cabeza)}).`);
    let i = 0;
    const revisados = [];
    while (i < pos && s.ptrs.actual != null) {
      const desde = s.ptrs.actual;
      revisados.push(desde);
      s.ptrs.actual = s.nodos[desde].sig;
      ver({ vars: { pos, i }, activo: s.ptrs.actual, flecha: desde, revisados: revisados.slice() });
      paso("nodoEn", 7, `i = ${i} < ${pos}: seguimos la flecha de ${s.nodos[desde].v}. actual = actual->siguiente → ${nombre(s, s.ptrs.actual)}. Van ${i + 1} salto(s).`);
      i++;
    }
    const id = s.ptrs.actual;
    ver({ vars: { pos, i }, activo: id, revisados });
    paso("nodoEn", 6, id != null
      ? `i == pos: llegamos a la posición ${pos} después de ${pos} salto(s).`
      : `actual es nullptr: la lista se terminó después de ${i} nodo(s), antes de llegar a la posición ${pos}.`);
    ver({ vars: { pos, i }, encontrado: id, revisados, salida: puntero(s, id) });
    paso("nodoEn", 9, id == null
      ? "return nullptr: esa posición no existe."
      : `return actual: devuelve el nodo mismo (su dirección), no solo su valor. Con él, quien llamó puede leerlo o cambiar su siguiente.`);
    delete s.ptrs.actual;
    return id;
  }

  function animarAlInicio(s, valor, paso, pila) {
    const llamadas = pila.concat(`insertarAlInicio(${valor})`);
    const ver = (o, cambio) => { s.vis = Object.assign({ pila: llamadas, vars: { valor, tamano: s.tamano }, cambio }, o); };
    const id = crearNodo(s, valor, { ancla: -0.5 });
    s.ptrs.nuevo = id;
    ver({ activo: id });
    paso("insertarAlInicio", 2, `new Nodo(${valor}): el nodo aparece donde haya memoria libre${s.direcciones ? ` (${hex(s.nodos[id].dir)})` : ""}. Su siguiente es nullptr y todavía nadie apunta a él.`);
    s.nodos[id].sig = s.cabeza;
    ver({ activo: id, flecha: id });
    paso("insertarAlInicio", 3, s.cabeza == null
      ? "nuevo->siguiente = cabeza: la lista estaba vacía, así que sigue siendo nullptr."
      : `nuevo->siguiente = cabeza: el nodo nuevo apunta al que hoy es el primero (${s.nodos[s.cabeza].v}). Así el resto de la lista no se pierde.`);
    s.cabeza = id;
    ver({ activo: id, flecha: "cabeza" });
    paso("insertarAlInicio", 4, `cabeza = nuevo: la lista ahora empieza en ${valor}.`);
    s.tamano++;
    ver({ activo: id }, ["tamano"]);
    paso("insertarAlInicio", 5, `tamano++: ahora hay ${s.tamano} nodo(s). Ningún nodo se copió ni se movió en memoria: siempre son los mismos pasos, O(1).`, "exito");
    delete s.ptrs.nuevo;
  }

  function animarInsertarEn(s, pos, valor, paso, pila) {
    const llamadas = pila.concat(`insertarEn(${pos}, ${valor})`);
    const ver = (o, cambio) => { s.vis = Object.assign({ pila: llamadas, vars: { pos, valor, tamano: s.tamano }, cambio }, o); };
    const valida = pos >= 0 && pos <= s.tamano;
    ver({});
    paso("insertarEn", 2, `¿pos está entre 0 y tamano (${s.tamano})? ${!valida ? "No." : pos === s.tamano ? "Sí: pos == tamano también vale, significa «después del último»." : "Sí."}`);
    if (!valida) {
      ver({ error: true, posMala: pos });
      paso("insertarEn", 3, `Se puede insertar de la posición 0 a la ${s.tamano}; ${pos} queda afuera. Se lanza std::out_of_range y no se crea ningún nodo.`, "error");
      return;
    }
    paso("insertarEn", 5, `¿pos == 0? ${pos === 0 ? "Sí: el nodo nuevo será la cabeza, y la cabeza no tiene nodo anterior." : "No: hay un nodo anterior al que engancharlo."}`);
    if (pos === 0) {
      paso("insertarEn", 6, "Ese caso ya lo resuelve insertarAlInicio: lo reutilizamos.");
      animarAlInicio(s, valor, paso, llamadas);
      ver({ activo: s.cabeza });
      paso("insertarEn", 7, "return: insertarAlInicio ya hizo todo, en O(1).", "exito");
      return;
    }
    paso("insertarEn", 9, `Para enganchar el nodo nuevo hay que cambiar el siguiente del nodo ANTERIOR, el de la posición ${pos - 1}. Se lo pedimos a nodoEn(${pos - 1}).`);
    const anterior = animarNodoEn(s, pos - 1, paso, llamadas);
    s.ptrs.anterior = anterior;
    ver({ activo: anterior });
    paso("insertarEn", 9, `nodoEn devolvió ${nombre(s, anterior)}: anterior apunta a él.`);
    const id = crearNodo(s, valor, { ancla: pos - 0.5 });
    s.ptrs.nuevo = id;
    ver({ activo: id, mirado: anterior });
    paso("insertarEn", 10, `new Nodo(${valor}): el nodo aparece suelto, debajo de donde va a quedar. Todavía nadie apunta a él.`);
    const siguiente = s.nodos[anterior].sig;
    s.nodos[id].sig = siguiente;
    ver({ activo: id, mirado: anterior, flecha: id, nulo: siguiente == null ? id : null });
    paso("insertarEn", 11, siguiente == null
      ? "nuevo->siguiente = anterior->siguiente: anterior era el último, así que el nuevo también apunta a nullptr."
      : `nuevo->siguiente = anterior->siguiente: el nuevo apunta a ${s.nodos[siguiente].v}. Va primero: si antes cambiáramos anterior->siguiente, se perdería el camino hacia ${s.nodos[siguiente].v}.`);
    s.nodos[anterior].sig = id;
    ver({ activo: id, flecha: anterior });
    paso("insertarEn", 12, `anterior->siguiente = nuevo: ${s.nodos[anterior].v} ahora apunta al nuevo y el ${valor} queda en la posición ${pos}.${siguiente == null ? "" : " Los nodos de después no se movieron en memoria: solo cambió su posición en la lista."}`);
    s.tamano++;
    ver({ activo: id }, ["tamano"]);
    paso("insertarEn", 13, `tamano++. Enlazar fueron dos punteros, O(1). ${costoLlegar(pos - 1)}`, "exito");
    delete s.ptrs.nuevo;
    delete s.ptrs.anterior;
  }

  const OPS = {
    obtener: {
      etiqueta: "obtener(pos)",
      usa: ["pos"],
      ejecutar(s, { pos }, paso) {
        const pila = [`obtener(${pos})`];
        s.vis = { vars: { pos } };
        paso("obtener", 2, `obtener no recorre la lista por su cuenta: le pide a nodoEn(${pos}) el nodo de esa posición.`);
        const id = animarNodoEn(s, pos, paso, pila);
        s.ptrs.nodo = id;
        s.vis = { vars: { pos }, activo: id };
        paso("obtener", 2, id == null ? "nodoEn devolvió nullptr: nodo = nullptr." : `nodoEn devolvió ${nombre(s, id)}: nodo apunta a él.`);
        paso("obtener", 3, `¿nodo == nullptr? ${id == null ? "Sí." : "No."}`);
        if (id == null) {
          s.vis = { vars: { pos }, error: true };
          paso("obtener", 4, pos < 0
            ? "No existe una posición negativa. Se lanza std::out_of_range y la lista no cambia."
            : `No hay nodo en la posición ${pos}. Se lanza std::out_of_range y la lista no cambia.`, "error");
          terminar(s);
          return;
        }
        s.vis = { vars: { pos }, encontrado: id, salida: s.nodos[id].v };
        paso("obtener", 6, `return nodo->valor: ${s.nodos[id].v}. En el vector sería una cuenta y un salto; aquí fueron ${pos} salto(s), uno por cada nodo anterior: O(n).`, "exito");
        terminar(s);
      },
    },

    insertarAlInicio: {
      etiqueta: "insertarAlInicio(valor)",
      usa: ["valor"],
      ejecutar(s, { valor }, paso) {
        if (limiteAlcanzado(s, "insertarAlInicio", paso)) return;
        animarAlInicio(s, valor, paso, []);
        terminar(s);
      },
    },

    insertarEn: {
      etiqueta: "insertarEn(pos, valor)",
      usa: ["pos", "valor"],
      ejecutar(s, { pos, valor }, paso) {
        if (limiteAlcanzado(s, "insertarEn", paso)) return;
        animarInsertarEn(s, pos, valor, paso, []);
        terminar(s);
      },
    },

    insertarAlFinal: {
      etiqueta: "insertarAlFinal(valor)",
      usa: ["valor"],
      ejecutar(s, { valor }, paso) {
        if (limiteAlcanzado(s, "insertarAlFinal", paso)) return;
        const n = s.tamano;
        s.vis = { vars: { valor, tamano: n } };
        paso("insertarAlFinal", 2, `El final es la posición tamano (${n}): justo después del último nodo. insertarAlFinal solo llama a insertarEn(${n}, ${valor}).`);
        animarInsertarEn(s, n, valor, paso, [`insertarAlFinal(${valor})`]);
        s.vis = { vars: { valor, tamano: s.tamano } };
        paso("insertarAlFinal", 3, n === 0
          ? "Con la lista vacía, tamano era 0: insertarEn delegó en insertarAlInicio y no hubo nada que recorrer."
          : `Es una sola línea, pero no es gratis: nodoEn dio ${n - 1} salto(s) para llegar al último. Sigue siendo O(n).`, "exito");
        terminar(s);
      },
    },

    buscar: {
      etiqueta: "buscar(valor)",
      usa: ["valor"],
      ejecutar(s, { valor }, paso) {
        s.ptrs = { actual: s.cabeza };
        s.vis = { vars: { valor }, activo: s.cabeza, flecha: "cabeza" };
        paso("buscar", 2, s.cabeza == null ? "La lista está vacía: actual empieza en nullptr." : "actual empieza en la cabeza.");
        const revisados = [];
        while (s.ptrs.actual != null) {
          const id = s.ptrs.actual;
          const v = s.nodos[id].v;
          s.vis = { vars: { valor }, activo: id, revisados: revisados.slice() };
          paso("buscar", 4, `actual no es nullptr. ¿actual->valor (${v}) == ${valor}? ${v === valor ? "¡Sí!" : "No."}`);
          if (v === valor) {
            s.vis = { vars: { valor }, encontrado: id, revisados: revisados.slice(), salida: "true" };
            paso("buscar", 5, `return true. Revisamos ${revisados.length + 1} nodo(s).`, "exito");
            terminar(s);
            return;
          }
          revisados.push(id);
          s.ptrs.actual = s.nodos[id].sig;
          s.vis = { vars: { valor }, activo: s.ptrs.actual, flecha: id, revisados: revisados.slice() };
          paso("buscar", 7, `actual = actual->siguiente → ${nombre(s, s.ptrs.actual)}.`);
        }
        s.vis = { vars: { valor }, revisados };
        paso("buscar", 3, "actual es nullptr: se terminó la lista.");
        s.vis = { vars: { valor }, revisados, salida: "false" };
        paso("buscar", 9, revisados.length
          ? `return false: ${valor} no está. Hubo que revisar los ${revisados.length} nodos; en el peor caso es O(n).`
          : "return false: en una lista vacía no hay nada que revisar.", "error");
        terminar(s);
      },
    },

    eliminar: {
      etiqueta: "eliminar(valor)",
      usa: ["valor"],
      ejecutar(s, { valor }, paso) {
        const vars = () => ({ valor, tamano: s.tamano });
        s.vis = { vars: vars(), flecha: "cabeza", nulo: s.cabeza == null ? "cabeza" : null };
        paso("eliminar", 2, `¿cabeza == nullptr? ${s.cabeza == null ? "Sí." : "No."}`);
        if (s.cabeza == null) {
          s.vis = { vars: vars(), nulo: "cabeza", error: true, salida: "false" };
          paso("eliminar", 3, "La lista está vacía: no hay nada que eliminar. return false.", "error");
          return;
        }
        const primero = s.cabeza;
        s.vis = { vars: vars(), activo: primero };
        paso("eliminar", 5, `¿cabeza->valor (${s.nodos[primero].v}) == ${valor}? ${s.nodos[primero].v === valor ? "Sí: hay que borrar el primero." : "No."}`);

        if (s.nodos[primero].v === valor) {
          s.ptrs = { temp: primero };
          s.vis = { vars: vars(), condenado: primero };
          paso("eliminar", 6, "temp = cabeza: guardamos su dirección. Si moviéramos cabeza primero, ya nadie sabría dónde está este nodo para liberarlo.");
          s.nodos[primero].reserva = 0;
          s.cabeza = s.nodos[primero].sig;
          s.vis = { vars: vars(), condenado: primero, flecha: "cabeza" };
          paso("eliminar", 7, `cabeza = cabeza->siguiente: la lista ahora empieza en ${s.cabeza == null ? "nullptr (quedó vacía)" : s.nodos[s.cabeza].v}. El ${valor} quedó afuera, pero sigue ocupando memoria.`);
          delete s.nodos[primero];
          s.ptrs = {};
          s.vis = { vars: vars() };
          paso("eliminar", 8, "delete temp: liberamos la memoria del nodo. Los demás nodos no se tocaron.");
          s.tamano--;
          s.vis = { vars: vars(), cambio: ["tamano"] };
          paso("eliminar", 9, `tamano--: quedan ${s.tamano} nodo(s).`);
          s.vis = { vars: vars(), salida: "true" };
          paso("eliminar", 10, "return true. Sin recorrer nada: borrar el primero es O(1).", "exito");
          terminar(s);
          return;
        }

        s.ptrs = { actual: primero };
        s.vis = { vars: vars(), activo: primero };
        paso("eliminar", 12, "Para desenganchar un nodo hay que cambiar el siguiente del nodo ANTERIOR. actual va a buscar ese anterior, empezando por la cabeza.");
        const revisados = [];
        for (;;) {
          const id = s.ptrs.actual;
          const sig = s.nodos[id].sig;
          if (sig == null) {
            s.vis = { vars: vars(), activo: id, nulo: id, revisados: revisados.slice() };
            paso("eliminar", 13, `actual->siguiente es nullptr: llegamos al último sin encontrar ${valor}.`);
            break;
          }
          s.vis = { vars: vars(), activo: id, mirado: sig, flecha: id, revisados: revisados.slice() };
          if (s.nodos[sig].v === valor) {
            paso("eliminar", 13, `actual->siguiente->valor es ${valor}: actual (${s.nodos[id].v}) es el anterior. Paramos.`);
            break;
          }
          paso("eliminar", 13, `actual->siguiente->valor es ${s.nodos[sig].v}, no ${valor}: seguimos.`);
          revisados.push(id);
          s.ptrs.actual = sig;
          s.vis = { vars: vars(), activo: sig, flecha: id, revisados: revisados.slice() };
          paso("eliminar", 14, `actual = actual->siguiente → ${nombre(s, sig)}.`);
        }

        const anterior = s.ptrs.actual;
        if (s.nodos[anterior].sig == null) {
          s.vis = { vars: vars(), nulo: anterior, revisados: revisados.concat(anterior), error: true, salida: "false" };
          paso("eliminar", 17, `${valor} no está en la lista. return false y la lista no cambia.`, "error");
          terminar(s);
          return;
        }
        s.vis = { vars: vars(), activo: anterior, mirado: s.nodos[anterior].sig };
        paso("eliminar", 16, "actual->siguiente no es nullptr: el valor sí está.");
        const temp = s.nodos[anterior].sig;
        s.ptrs.temp = temp;
        s.vis = { vars: vars(), activo: anterior, condenado: temp };
        paso("eliminar", 19, `temp = actual->siguiente: temp marca el nodo ${valor}, el que vamos a borrar.`);
        s.nodos[temp].reserva = cadena(s).indexOf(temp);
        s.nodos[anterior].sig = s.nodos[temp].sig;
        s.vis = { vars: vars(), activo: anterior, condenado: temp, flecha: anterior };
        paso("eliminar", 20, `actual->siguiente = temp->siguiente: ${s.nodos[anterior].v} salta por encima de ${valor} y apunta a ${valorSig(s, anterior)}. Ya no se llega a ${valor} desde la cabeza.`);
        delete s.nodos[temp];
        s.ptrs = { actual: anterior };
        s.vis = { vars: vars(), activo: anterior };
        paso("eliminar", 21, "delete temp: liberamos la memoria del nodo. Ningún otro nodo se movió en memoria: solo cambió un puntero.");
        s.tamano--;
        s.vis = { vars: vars(), activo: anterior, cambio: ["tamano"] };
        paso("eliminar", 22, `tamano--: quedan ${s.tamano} nodo(s).`);
        s.vis = { vars: vars(), salida: "true" };
        paso("eliminar", 23, "return true. El borrado en sí es O(1); lo caro fue encontrar el anterior: O(n).", "exito");
        terminar(s);
      },
    },

    eliminarEn: {
      etiqueta: "eliminarEn(pos)",
      usa: ["pos"],
      ejecutar(s, { pos }, paso) {
        const pila = [`eliminarEn(${pos})`];
        let valor;
        const ver = (o, cambio) => { s.vis = Object.assign({ vars: valor == null ? { pos, tamano: s.tamano } : { pos, tamano: s.tamano, valor }, cambio }, o); };
        const valida = pos >= 0 && pos < s.tamano;
        ver({ nulo: s.cabeza == null ? "cabeza" : null });
        paso("eliminarEn", 2, s.tamano === 0
          ? "¿pos está entre 0 y tamano - 1? tamano es 0: no hay ninguna posición válida."
          : `¿pos está entre 0 y tamano - 1 (${s.tamano - 1})? ${valida ? "Sí." : "No."}`);
        if (!valida) {
          ver({ error: true, posMala: pos, nulo: s.cabeza == null ? "cabeza" : null });
          paso("eliminarEn", 3, s.tamano === 0
            ? "La lista está vacía: no hay nodo que eliminar. Se lanza std::out_of_range."
            : `No hay nodo en la posición ${pos}: van de 0 a ${s.tamano - 1}. Se lanza std::out_of_range y la lista no cambia.`, "error");
          terminar(s);
          return;
        }
        paso("eliminarEn", 6, `¿pos == 0? ${pos === 0 ? "Sí: se borra la cabeza, que no tiene nodo anterior." : "No: hay que cambiar el siguiente del nodo anterior."}`);
        let temp;
        if (pos === 0) {
          temp = s.cabeza;
          s.ptrs.temp = temp;
          ver({ condenado: temp });
          paso("eliminarEn", 7, "temp = cabeza: guardamos su dirección. Si moviéramos cabeza primero, ya nadie sabría dónde está este nodo para liberarlo.");
          s.nodos[temp].reserva = 0;
          s.cabeza = s.nodos[temp].sig;
          ver({ condenado: temp, flecha: "cabeza", nulo: s.cabeza == null ? "cabeza" : null });
          paso("eliminarEn", 8, `cabeza = cabeza->siguiente: la lista ahora empieza en ${s.cabeza == null ? "nullptr (quedó vacía)" : s.nodos[s.cabeza].v}. El nodo quedó afuera, pero sigue ocupando memoria.`);
        } else {
          paso("eliminarEn", 10, `nodoEn(${pos - 1}) nos lleva al nodo anterior al que vamos a borrar.`);
          const anterior = animarNodoEn(s, pos - 1, paso, pila);
          s.ptrs.anterior = anterior;
          ver({ activo: anterior });
          paso("eliminarEn", 10, `nodoEn devolvió ${nombre(s, anterior)}: anterior apunta a él.`);
          temp = s.nodos[anterior].sig;
          s.ptrs.temp = temp;
          ver({ activo: anterior, condenado: temp });
          paso("eliminarEn", 11, `temp = anterior->siguiente: temp marca el nodo ${s.nodos[temp].v}, el de la posición ${pos}.`);
          s.nodos[temp].reserva = cadena(s).indexOf(temp);
          s.nodos[anterior].sig = s.nodos[temp].sig;
          ver({ activo: anterior, condenado: temp, flecha: anterior, nulo: s.nodos[anterior].sig == null ? anterior : null });
          paso("eliminarEn", 12, `anterior->siguiente = temp->siguiente: ${s.nodos[anterior].v} salta por encima de ${s.nodos[temp].v} y apunta a ${valorSig(s, anterior)}.`);
        }
        valor = s.nodos[temp].v;
        ver({ condenado: temp }, ["valor"]);
        paso("eliminarEn", 14, `int valor = temp->valor: guardamos el ${valor} para devolverlo. Después del delete ya no se puede leer.`);
        delete s.nodos[temp];
        delete s.ptrs.temp;
        ver({});
        paso("eliminarEn", 15, "delete temp: liberamos la memoria del nodo. Los demás no se movieron.");
        s.tamano--;
        ver({}, ["tamano"]);
        paso("eliminarEn", 16, `tamano--: quedan ${s.tamano} nodo(s).`);
        ver({ salida: valor });
        paso("eliminarEn", 17, `return ${valor}. ${pos === 0 ? "Borrar la cabeza es O(1)." : `Desenganchar es O(1). ${costoLlegar(pos - 1)}`}`, "exito");
        terminar(s);
      },
    },
  };


  // ------------------------------------------------------------------
  // Dibujo: los nodos alcanzables desde cabeza van en filas, como un texto
  // que salta de línea al llegar al borde; los que están sueltos (recién
  // creados o desenganchados) van debajo de su fila. Todo se reutiliza por
  // id para que se deslice con transiciones CSS.
  // ------------------------------------------------------------------

  const pasoX = (s) => (s.direcciones ? 136 : 108);
  const anchoNodo = (s) => (s.direcciones ? 94 : 78);
  const bajada = (s) => ALTO_NODO + (s.direcciones ? 62 : 48); // de una fila a sus nodos sueltos
  // Entre dos filas: el carril de la flecha que salta de fila y las marcas de los punteros.
  const separacion = (s) => (s.direcciones ? 70 : 58);
  // Lo que ocupa una fila: sus nodos sueltos solo ocupan lugar cuando los hay.
  const altoFila = (s, sueltos) => (sueltos ? bajada(s) + ALTO_NODO + 22 + (s.direcciones ? 14 : 0) : ALTO_NODO);

  // Cuántos nodos caben por fila en el ancho del escenario (al menos 3: si
  // no caben, el dibujo se reduce). Se mide el ancho visible, sin el zoom del
  // motor, para que sea el mismo que en las copias con que el motor mide el alto.
  function columnas(lienzo, s) {
    const ancho = lienzo.closest(".desliza-lista").getBoundingClientRect().width;
    if (!ancho) return Number(lienzo.dataset.columnas) || 5; // paso oculto: se mide al mostrarlo
    return Math.max(3, Math.floor((ancho - X_LISTA - MARGEN - anchoNodo(s)) / pasoX(s)) + 1);
  }

  function posiciones(s, cols, conNulo) {
    const fila = cadena(s);
    const enFila = new Set(fila);
    // Un nodo recién desenganchado guarda su lugar hasta el delete.
    const reservados = Object.entries(s.nodos)
      .filter(([id, n]) => !enFila.has(id) && n.reserva != null)
      .sort((a, b) => a[1].reserva - b[1].reserva);
    const lugares = fila.slice();
    for (const [id, n] of reservados) lugares.splice(Math.min(n.reserva, lugares.length), 0, id);
    const filaDe = (k) => Math.max(0, Math.floor(k / cols));

    // El lugar k de cada nodo y si va debajo de su fila.
    const lugar = {};
    lugares.forEach((id, k) => { lugar[id] = { k, abajo: !enFila.has(id) }; });
    let extra = 0;
    for (const [id, n] of Object.entries(s.nodos)) {
      if (lugar[id]) continue;
      const k = n.ancla != null ? n.ancla : lugares.length + extra++;
      // Si abre una fila que todavía está vacía, aparece ya en ella.
      const f = filaDe(k);
      lugar[id] = { k, abajo: !(f > 0 && f * cols >= lugares.length) };
    }

    // Cada fila empieza debajo de la anterior y de sus nodos sueltos.
    let filas = conNulo ? filaDe(lugares.length) + 1 : 1;
    const conSueltos = [];
    for (const { k, abajo } of Object.values(lugar)) {
      filas = Math.max(filas, filaDe(k) + 1);
      if (abajo) conSueltos[filaDe(k)] = true;
    }
    const tops = [Y_FILA];
    for (let f = 1; f < filas; f++) tops[f] = tops[f - 1] + altoFila(s, conSueltos[f - 1]) + separacion(s);
    const en = (k, abajo) => ({ x: X_LISTA + (k - filaDe(k) * cols) * pasoX(s), y: tops[filaDe(k)] + (abajo ? bajada(s) : 0), abajo });

    const pos = {};
    for (const [id, { k, abajo }] of Object.entries(lugar)) pos[id] = Object.assign(en(k, abajo), { suelto: !enFila.has(id) });
    const ultima = filas - 1;
    const alto = tops[ultima] + (conSueltos[ultima] ? bajada(s) + ALTO_NODO + 34 : ALTO_NODO + (s.direcciones ? 28 : s.indices ? 24 : 14));
    return { pos, nulo: en(lugares.length, false), alto, indice: new Map(fila.map((id, k) => [id, k])) };
  }

  let lienzos = 0;

  function crearLienzo(escenario) {
    const n = ++lienzos;
    const svg = document.createElementNS(SVG, "svg");
    svg.innerHTML =
      "<defs>" +
      `<marker id="punta-lista-${n}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z"/></marker>` +
      `<marker id="punta-lista-activa-${n}" class="activa" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z"/></marker>` +
      "</defs>";
    const cabeza = el("div", { class: "lcabeza", "data-pieza": "cabeza" }, el("span", { class: "lcabeza-nombre", text: "cabeza" }), el("span", { class: "sig" }));
    const nulo = el("div", { class: "lnulo", text: "nullptr" });
    const lienzo = el("div", { class: "lienzo-enlazada", "data-n": n }, svg, cabeza, nulo);
    // Las variables quedan fijas; si el dibujo no cabe, solo él hace scroll.
    escenario.append(el("div", { class: "info-lista" }), el("div", { class: "desliza-lista" }, el("div", { class: "marco-lista" }, lienzo)));
    return lienzo;
  }

  if (typeof window !== "undefined") {
    window.addEventListener("resize", () => {
      for (const lienzo of document.querySelectorAll(".lienzo-enlazada")) {
        // Si cambia cuántos nodos caben por fila, se acomodan de nuevo.
        const s = lienzo._estado;
        if (!s || !lienzo.closest(".desliza-lista").clientWidth) continue; // paso oculto
        if (columnas(lienzo, s) !== Number(lienzo.dataset.columnas)) dibujar(lienzo.closest(".escenario"), s);
        else {
          escalar(lienzo);
          // Si se dibujó con el paso oculto, los nodos no tenían posición: las flechas se trazan ahora.
          trazarFlechas(lienzo, pasoX(s));
        }
      }
    });
  }

  // En pantallas angostas reducimos el dibujo; si aun así no cabe, hace scroll por dentro.
  const escala = (lienzo) => Math.max(0.6, Math.min(1, lienzo.closest(".desliza-lista").clientWidth / Number(lienzo.dataset.ancho)));

  function escalar(lienzo) {
    if (!lienzo.closest(".desliza-lista").clientWidth) return; // está en un paso oculto: se mide al mostrarlo
    const ancho = Number(lienzo.dataset.ancho);
    const alto = Number(lienzo.dataset.alto);
    const k = escala(lienzo);
    lienzo.style.transform = k < 1 ? `scale(${k})` : "";
    const marco = lienzo.parentElement;
    marco.style.width = `${ancho * k}px`;
    marco.style.height = `${alto * k}px`;
  }

  // Si el dibujo no cabe, se desplaza hasta lo que está pasando.
  function enfocar(lienzo) {
    const desliza = lienzo.closest(".desliza-lista");
    if (desliza.scrollWidth <= desliza.clientWidth) return;
    const foco = lienzo.querySelector(".lnulo.visible, .nodo.condenado, .nodo.encontrado, .nodo.activo");
    if (!foco) return;
    const centro = (parseFloat(foco.style.left) + 40) * escala(lienzo);
    desliza.scrollTo({ left: Math.max(0, centro - desliza.clientWidth / 2), behavior: "smooth" });
  }

  // Lo que sale del dibujo se desvanece en lugar de desaparecer de golpe.
  function retirar(nodo) {
    nodo.removeAttribute("data-id");
    nodo.removeAttribute("data-nombre");
    nodo.classList.add("saliendo");
    setTimeout(() => nodo.remove(), 400);
  }

  // Punto de salida de una flecha: el centro del campo siguiente o, si
  // muestra una dirección, su borde derecho (para no tapar el texto).
  function salida(pieza) {
    const sig = pieza.querySelector(".sig");
    const x = sig.textContent ? sig.offsetLeft + sig.offsetWidth - 2 : sig.offsetLeft + sig.offsetWidth / 2;
    return { x: pieza.offsetLeft + x, y: pieza.offsetTop + pieza.offsetHeight / 2 };
  }

  function camino(origen, destino, paso) {
    const { x: x1, y: y1 } = salida(origen);
    const tx = destino.offsetLeft;
    const ty = destino.offsetTop;
    const th = destino.offsetHeight;
    // Salta a la fila de abajo: sale por la derecha, cruza por encima de las
    // marcas de la fila nueva y entra al nodo por la izquierda, como las demás.
    if (ty > origen.offsetTop + 5 && tx < origen.offsetLeft) {
      const r = 10;
      const xd = origen.offsetLeft + origen.offsetWidth + 14;
      const xi = tx - 28;
      const yc = ty - 40;
      const y2 = ty + th / 2;
      return `M ${x1} ${y1} L ${xd - r} ${y1} Q ${xd} ${y1} ${xd} ${y1 + r} L ${xd} ${yc - r} Q ${xd} ${yc} ${xd - r} ${yc}`
        + ` L ${xi + r} ${yc} Q ${xi} ${yc} ${xi} ${yc + r} L ${xi} ${y2 - r} Q ${xi} ${y2} ${xi + r} ${y2} L ${tx - 3} ${y2}`;
    }
    if (Math.abs(ty - origen.offsetTop) < 5) {
      const x2 = tx - 3;
      const y2 = ty + th / 2;
      // Si salta por encima de un lugar vacío (al eliminar), hace un arco.
      if (x2 - x1 > paso * 1.4) return `M ${x1} ${y1} C ${x1 + 30} ${y1 - 58}, ${x2 - 40} ${y2 - 58}, ${x2} ${y2}`;
      return `M ${x1} ${y1} L ${x2} ${y2}`;
    }
    const arriba = ty < origen.offsetTop;
    const x2 = tx + 20;
    const y2 = arriba ? ty + th + 3 : ty - 3;
    return `M ${x1} ${y1} C ${x1 + 46} ${y1}, ${x2} ${arriba ? y2 + 46 : y2 - 46}, ${x2} ${y2}`;
  }

  // Las flechas se reutilizan por origen; si cambia su destino, se trazan de nuevo.
  function actualizarFlechas(lienzo, s, vis) {
    const n = lienzo.dataset.n;
    const svg = lienzo.querySelector("svg");
    const deseadas = new Map();
    if (s.cabeza != null) deseadas.set("cabeza", s.cabeza);
    for (const [id, nodo] of Object.entries(s.nodos)) if (nodo.sig != null && s.nodos[nodo.sig]) deseadas.set(id, nodo.sig);
    for (const path of svg.querySelectorAll("path.flecha")) {
      if (deseadas.get(path.dataset.de) !== path.dataset.a) path.remove();
    }
    for (const [de, a] of deseadas) {
      let path = svg.querySelector(`path.flecha[data-de="${de}"]`);
      if (!path) {
        path = document.createElementNS(SVG, "path");
        path.setAttribute("data-de", de);
        path.setAttribute("data-a", a);
        path.setAttribute("pathLength", "1");
        path.setAttribute("class", "flecha traza");
        svg.append(path);
      }
      const activa = vis.flecha === de;
      path.classList.toggle("activa", activa);
      path.setAttribute("marker-end", `url(#punta-lista${activa ? "-activa" : ""}-${n})`);
    }
  }

  function trazarFlechas(lienzo, paso) {
    for (const path of lienzo.querySelectorAll("svg path.flecha")) {
      const { de, a } = path.dataset;
      const origen = de === "cabeza" ? lienzo.querySelector(".lcabeza") : lienzo.querySelector(`.nodo[data-id="${de}"]`);
      const destino = lienzo.querySelector(`.nodo[data-id="${a}"]`);
      if (origen && destino) path.setAttribute("d", camino(origen, destino, paso));
    }
  }

  function dibujar(escenario, s) {
    const lienzo = escenario.querySelector(".lienzo-enlazada") || crearLienzo(escenario);
    const vis = s.vis || {};
    const dx = pasoX(s);
    const cols = columnas(lienzo, s);
    lienzo.dataset.columnas = cols;
    lienzo._estado = s;
    lienzo.classList.toggle("con-direcciones", s.direcciones);

    // Llamadas en curso (cuando una función llama a otra), variables y
    // valor devuelto, arriba del dibujo.
    const malo = vis.salida === "false" || vis.salida === "nullptr";
    escenario.querySelector(".info-lista").replaceChildren(
      vis.pila && vis.pila.length > 1
        ? el("div", { class: "pila-llamadas", "aria-label": "Llamadas en curso" },
          vis.pila.flatMap((texto, k) => [k ? "›" : "", el("span", { class: "llamada", text: texto })]))
        : "",
      DS.variables(vis.vars || {}, vis.cambio),
      vis.salida != null ? el("div", { class: "salida-valor" }, "devuelve", el("div", { class: `celda ${malo ? "error" : "encontrada"}`, text: vis.salida })) : "");

    // ¿Algún puntero local vale nullptr, o pos se pasó del final? Entonces se
    // ve el "nullptr" al final.
    const nombres = ORDEN_PUNTEROS.filter((k) => s.ptrs[k] !== undefined);
    const posMala = vis.posMala != null ? vis.posMala : null;
    const algunoNulo = nombres.some((k) => s.ptrs[k] == null) || (posMala != null && posMala >= 0);
    const { pos, nulo: fin, alto: altoNodos, indice } = posiciones(s, cols, algunoNulo);
    const alto = posMala != null ? Math.max(altoNodos, (posMala < 0 ? Y_FILA : fin.y) + ALTO_NODO + 28) : altoNodos;
    const nulo = lienzo.querySelector(".lnulo");
    nulo.style.left = `${fin.x}px`;
    nulo.style.top = `${fin.y + 8}px`;
    nulo.classList.toggle("visible", algunoNulo);

    // La variable cabeza, a la izquierda.
    const cabeza = lienzo.querySelector(".lcabeza");
    cabeza.style.left = `${MARGEN}px`;
    cabeza.style.top = `${Y_FILA}px`;
    const sigCabeza = cabeza.querySelector(".sig");
    sigCabeza.classList.toggle("nulo", s.cabeza == null);
    sigCabeza.classList.toggle("resaltado", vis.nulo === "cabeza");
    sigCabeza.textContent = s.direcciones && s.cabeza != null ? hex(s.nodos[s.cabeza].dir) : "";
    cabeza.classList.toggle("activa", vis.flecha === "cabeza");

    // Nodos.
    const vivos = new Set(Object.keys(s.nodos));
    for (const caja of lienzo.querySelectorAll(".nodo[data-id]")) if (!vivos.has(caja.dataset.id)) retirar(caja);
    for (const [id, nodo] of Object.entries(s.nodos)) {
      const p = pos[id];
      let caja = lienzo.querySelector(`.nodo[data-id="${id}"]`);
      let clase = "nodo";
      if (!caja) {
        caja = el("div", { class: "nodo", "data-id": id },
          el("span", { class: "valor" }), el("span", { class: "sig" }), el("span", { class: "ldireccion" }));
        caja.style.left = `${p.x}px`;
        caja.style.top = `${p.y}px`;
        lienzo.append(caja);
        clase += " nuevo";
      } else if (caja.classList.contains("nuevo") && caja.style.left === `${p.x}px` && caja.style.top === `${p.y}px`) {
        clase += " nuevo"; // que no se corte el pop si el paso no lo movió
      }
      caja.style.left = `${p.x}px`;
      caja.style.top = `${p.y}px`;
      caja.querySelector(".valor").textContent = nodo.v;
      const sig = caja.querySelector(".sig");
      sig.classList.toggle("nulo", nodo.sig == null);
      sig.classList.toggle("resaltado", vis.nulo === id);
      sig.textContent = s.direcciones && nodo.sig != null && s.nodos[nodo.sig] ? hex(s.nodos[nodo.sig].dir) : "";
      caja.querySelector(".ldireccion").textContent = s.direcciones ? hex(nodo.dir) : s.indices && indice.has(id) ? `pos ${indice.get(id)}` : "";
      if (p.suelto) clase += " suelto";
      if (vis.activo === id) clase += " activo";
      if (vis.mirado === id) clase += " mirado";
      if (vis.encontrado === id) clase += " encontrado";
      if (vis.condenado === id) clase += " condenado";
      if ((vis.revisados || []).includes(id)) clase += " revisado";
      caja.className = clase;
    }

    // Punteros locales: marcas que se deslizan de nodo en nodo.
    const pila = {};
    for (const k of nombres) {
      const destino = s.ptrs[k];
      const lugar = destino == null ? Object.assign({ nulo: true }, fin) : pos[destino];
      if (!lugar) continue;
      const clave = destino == null ? "nulo" : destino;
      const nivel = (pila[clave] = (pila[clave] || 0) + 1) - 1;
      let marca = lienzo.querySelector(`.lpuntero[data-nombre="${k}"]`);
      if (!marca) {
        marca = el("span", { class: "lpuntero", "data-nombre": k });
        marca.style.left = `${lugar.x + 23}px`;
        lienzo.append(marca);
      }
      const ancla = lugar.nulo ? 34 : 23; // centro del campo valor (o del nullptr)
      marca.textContent = lugar.abajo ? `↑ ${k}` : `${k} ↓`;
      marca.style.left = `${lugar.x + ancla}px`;
      marca.style.top = lugar.abajo
        ? `${lugar.y + ALTO_NODO + 4 + nivel * 14 + (s.direcciones ? 14 : 0)}px`
        : `${lugar.y - 18 - nivel * 14}px`;
      marca.classList.toggle("nulo", destino == null);
      marca.classList.toggle("mala", destino == null && !!vis.error);
    }
    // Una posición fuera de la lista: marca roja debajo de cabeza (si es
    // negativa) o del nullptr (si se pasa del final).
    if (posMala != null) {
      let marca = lienzo.querySelector('.lpuntero[data-nombre="pos"]');
      const x = posMala < 0 ? MARGEN + 17 : fin.x + 34;
      if (!marca) {
        marca = el("span", { class: "lpuntero mala", "data-nombre": "pos" });
        marca.style.left = `${x}px`;
        lienzo.append(marca);
      }
      marca.textContent = `↑ pos = ${posMala}`;
      marca.style.left = `${x}px`;
      marca.style.top = `${(posMala < 0 ? Y_FILA : fin.y) + ALTO_NODO + 8}px`;
      nombres.push("pos");
    }
    for (const marca of lienzo.querySelectorAll(".lpuntero[data-nombre]")) if (!nombres.includes(marca.dataset.nombre)) retirar(marca);

    // Tamaño del dibujo y sacudida si hubo un error.
    const derecha = Math.max(fin.x + (algunoNulo ? 80 : 0), ...Object.values(pos).map((p) => p.x + dx));
    const ancho = Math.max(320, derecha + MARGEN);
    lienzo.style.width = `${ancho}px`;
    lienzo.style.height = `${alto}px`;
    lienzo.dataset.ancho = ancho;
    lienzo.dataset.alto = alto;
    escalar(lienzo);
    lienzo.classList.remove("sacudir");
    if (vis.error) {
      void lienzo.offsetWidth; // reinicia la animación
      lienzo.classList.add("sacudir");
    }

    enfocar(lienzo);

    // Las flechas siguen a los nodos mientras se deslizan.
    actualizarFlechas(lienzo, s, vis);
    const hasta = performance.now() + 520;
    cancelAnimationFrame(lienzo._cuadro);
    const cuadro = () => {
      trazarFlechas(lienzo, dx);
      if (performance.now() < hasta && lienzo.isConnected) lienzo._cuadro = requestAnimationFrame(cuadro);
    };
    cuadro();
  }

  // ------------------------------------------------------------------
  // Visualizadores de la lección
  // ------------------------------------------------------------------

  function visualizador(contenedor, opciones) {
    DS.tema({
      contenedor,
      incremental: true,
      dibujar,
      codigo: Object.fromEntries(opciones.ops.flatMap((id) => [id, ...(LLAMA[id] || [])]).map((id) => [id, CODIGO[id]])),
      tituloCodigo: (clave) => `ListaEnlazada::${clave}()`,
      mensajeInicial: opciones.mensajeInicial,
      estadoInicial: opciones.estadoInicial,
      entradas: opciones.entradas,
      operaciones: opciones.ops.map((id) => Object.assign({ id }, OPS[id])),
    });
  }

  const VALOR = { id: "valor", etiqueta: "Valor", min: 0, max: 99, aleatorio: true };
  const POSICION = { id: "pos", etiqueta: "pos", min: -3, max: 12, valor: 2 };

  // Paso 1: obtener(pos) con nodoEn, y las direcciones de memoria a la vista.
  visualizador("vis-obtener", {
    ops: ["obtener"],
    entradas: [POSICION],
    estadoInicial: () => estadoDesde([3, 7, 12, 20], { direcciones: true }),
    mensajeInicial: "Debajo de cada nodo está su dirección; en su campo siguiente, la dirección del próximo. Pulsa obtener(pos) y prueba también pos = 0 y pos = 6.",
  });

  // Pasos 2 a 7: una operación cada uno.
  visualizador("vis-inicio", {
    ops: ["insertarAlInicio"],
    entradas: [VALOR],
    estadoInicial: () => estadoDesde([7, 12]),
    mensajeInicial: "La lista tiene 7 y 12. Inserta un valor al inicio y fíjate en el orden de los dos punteros.",
  });

  visualizador("vis-insertar-en", {
    ops: ["insertarEn"],
    entradas: [POSICION, VALOR],
    estadoInicial: () => estadoDesde([3, 7, 12, 20], { indices: true }),
    mensajeInicial: "Debajo de cada nodo está su posición. Inserta en pos = 2 (entre 7 y 12); prueba también pos = 0, pos = 4 (el final) y pos = 6.",
  });

  visualizador("vis-final", {
    ops: ["insertarAlFinal"],
    entradas: [VALOR, { id: "inicial", etiqueta: "Lista inicial", opciones: [["llena", "3 → 7 → 12"], ["vacia", "vacía"]] }],
    estadoInicial: ({ inicial }) => estadoDesde(inicial === "vacia" ? [] : [3, 7, 12], { indices: true }),
    mensajeInicial: ({ inicial }) => inicial === "vacia"
      ? "La lista está vacía: tamano es 0. Inserta al final para ver qué hace insertarEn(0, valor)."
      : "Inserta al final: mira la pila de llamadas arriba del dibujo y cuenta los saltos de nodoEn. Prueba también con la lista vacía.",
  });

  visualizador("vis-buscar", {
    ops: ["buscar"],
    entradas: [{ id: "valor", etiqueta: "Valor", min: 0, max: 99, valor: 12 }],
    estadoInicial: () => estadoDesde([3, 7, 12, 20]),
    mensajeInicial: "Busca 12; después un valor que no esté (por ejemplo 99).",
  });

  visualizador("vis-eliminar", {
    ops: ["eliminar"],
    entradas: [{ id: "valor", etiqueta: "Valor", min: 0, max: 99, valor: 12 }],
    estadoInicial: () => estadoDesde([3, 7, 12, 20]),
    mensajeInicial: "Elimina 12 (en medio), después 3 (la cabeza) y un valor que no esté.",
  });

  visualizador("vis-eliminar-en", {
    ops: ["eliminarEn"],
    entradas: [Object.assign({}, POSICION, { valor: 1 })],
    estadoInicial: () => estadoDesde([3, 7, 12, 20], { indices: true }),
    mensajeInicial: "Elimina la posición 1 (el 7); prueba también pos = 0 y pos = 4, que ya no existe.",
  });

  // Todas las operaciones juntas.
  visualizador("vis-todo", {
    ops: ["insertarAlInicio", "insertarEn", "insertarAlFinal", "buscar", "eliminar", "eliminarEn", "obtener"],
    entradas: [VALOR, Object.assign({}, POSICION, { valor: 1 })],
    estadoInicial: () => estadoDesde([3, 7, 12], { indices: true }),
    mensajeInicial: "La lista de main() después de las tres primeras líneas: 3 → 7 → 12. Combina operaciones: pos solo se usa en insertarEn, eliminarEn y obtener.",
  });

  // ------------------------------------------------------------------
  // ¿Lista o vector? Cuánto trabajo hace cada uno según n
  // ------------------------------------------------------------------

  const COMPARACIONES = [
    {
      id: "inicio",
      titulo: "Insertar al inicio",
      vector: (n) => [n + 1, `corre ${fmt(n)} elementos y escribe 1`],
      lista: () => [3, "crea un nodo y cambia 2 punteros"],
      texto: "La lista gana siempre: no importa cuántos nodos haya detrás.",
    },
    {
      id: "final",
      titulo: "Insertar al final",
      vector: () => [1, "escribe en datos[tamano] (O(1) amortizado)"],
      lista: (n) => [n + 1, `recorre ${fmt(n)} nodos y cambia 1 puntero`],
      texto: "El vector gana. La lista empataría si guardara un puntero al último nodo (ejercicio del final).",
    },
    {
      id: "medio",
      titulo: "Leer la posición n / 2",
      vector: () => [1, "una cuenta y un salto"],
      lista: (n) => [Math.floor(n / 2), `${fmt(Math.floor(n / 2))} saltos de nodo en nodo`],
      texto: "El vector gana: es su gran ventaja, el acceso por índice.",
    },
    {
      id: "eliminar",
      titulo: "Eliminar el primero",
      vector: (n) => [n - 1, `corre ${fmt(n - 1)} elementos a la izquierda`],
      lista: () => [2, "mueve cabeza y hace delete"],
      texto: "La lista gana. (Si ya tienes el nodo anterior, borrar en medio también es O(1).)",
    },
    {
      id: "buscar",
      titulo: "Buscar (peor caso)",
      vector: (n) => [n, `revisa ${fmt(n)} casillas`],
      lista: (n) => [n, `revisa ${fmt(n)} nodos`],
      texto: "Empate en la cuenta, pero en la práctica el vector es varias veces más rápido: sus datos están juntos y el procesador los trae a la caché en bloque; los nodos están dispersos.",
    },
    {
      id: "memoria",
      titulo: "Memoria usada",
      unidad: "bytes",
      vector: (n) => [4 * n, `${fmt(4 * n)} bytes: 4 por int (más la capacidad libre)`],
      lista: (n) => [16 * n, `${fmt(16 * n)} bytes: int + puntero + relleno, 16 por nodo`],
      texto: "Cada nodo paga además su puntero (8 bytes en un sistema de 64 bits) y el relleno de alineación.",
    },
  ];

  function fmt(n) {
    return n.toLocaleString("es");
  }

  function montarComparador() {
    const caja = document.getElementById("comparador");
    if (!caja) return;
    let elegida = COMPARACIONES[0];
    const rango = el("input", { type: "range", min: 0, max: 3, step: 1, value: 2, "aria-label": "Cantidad de elementos" });
    const tamanos = [10, 100, 1000, 100000];
    const etiquetaN = el("b");
    const botones = COMPARACIONES.map((c) => el("button", { type: "button", text: c.titulo, onclick: () => { elegida = c; pintar(); } }));
    const barra = (nombre) => {
      const relleno = el("div", { class: "barra-comparador-relleno" });
      const cifra = el("span", { class: "barra-comparador-cifra" });
      const detalle = el("span", { class: "barra-comparador-detalle" });
      const fila = el("div", { class: "fila-comparador" },
        el("span", { class: "fila-comparador-nombre", text: nombre }),
        el("div", { class: "barra-comparador" }, relleno), cifra, detalle);
      return { fila, relleno, cifra, detalle };
    };
    const bVector = barra("vector");
    const bLista = barra("lista");
    const conclusion = el("p", { class: "resumen-costo", "aria-live": "polite" });

    function pintar() {
      const n = tamanos[Number(rango.value)];
      etiquetaN.textContent = fmt(n);
      botones.forEach((b, k) => b.setAttribute("aria-pressed", String(COMPARACIONES[k] === elegida)));
      const [cv, dv] = elegida.vector(n);
      const [cl, dl] = elegida.lista(n);
      const maximo = Math.max(cv, cl);
      const unidad = elegida.unidad || "pasos";
      for (const [b, costo, detalle, otro] of [[bVector, cv, dv, cl], [bLista, cl, dl, cv]]) {
        b.relleno.style.width = `${Math.max(1.5, (costo / maximo) * 100)}%`;
        b.relleno.classList.toggle("gana", costo < otro);
        b.relleno.classList.toggle("pierde", costo > otro);
        b.cifra.textContent = `${fmt(costo)} ${costo === 1 ? unidad.replace(/s$/, "") : unidad}`;
        b.detalle.textContent = detalle;
      }
      conclusion.textContent = elegida.texto;
    }

    rango.addEventListener("input", pintar);
    caja.classList.add("panel", "comparador");
    caja.append(
      el("div", { class: "controles" },
        el("div", { class: "selector-modo selector-comparador", role: "group", "aria-label": "Operación" }, botones)),
      el("div", { class: "cuerpo-comparador" },
        el("label", { class: "tamano-comparador" }, "Elementos: n = ", etiquetaN, rango),
        bVector.fila, bLista.fila),
      conclusion);
    pintar();
  }

  if (typeof document !== "undefined") montarComparador();
})();
