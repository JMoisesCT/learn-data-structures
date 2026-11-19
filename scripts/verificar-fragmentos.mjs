// Verifica que cada fragmento de código que muestran las animaciones
// exista, línea por línea, en el archivo .cpp del tema. Así la animación
// nunca enseña código distinto al ejemplo que se compila.
//
// Si el tema tiene versión en inglés (en/temas/<slug>/index.html), revisa
// también sus fragmentos contra su .cpp en inglés (ejemplos/cpp/en/), y que
// cada fragmento tenga las mismas líneas en los dos idiomas: los mensajes de
// la animación usan los mismos números de línea.
//
// Uso: node scripts/verificar-fragmentos.mjs
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const dirTemas = join(raiz, "temas");
let errores = 0;
let revisados = 0;

const normalizar = (texto) => texto.split("\n").map((l) => l.trim()).filter((l) => l !== "");

function buscar(archivo, fragmento) {
  for (let i = 0; i + fragmento.length <= archivo.length; i++) {
    if (fragmento.every((linea, k) => archivo[i + k] === linea)) return i;
  }
  return -1;
}
const contiene = (archivo, fragmento) => buscar(archivo, fragmento) >= 0;
const leerCpp = (nombre) => normalizar(readFileSync(join(raiz, "ejemplos", "cpp", nombre), "utf8"));
const sinComentarios = (lineas) => lineas.filter((l) => !l.startsWith("//"));
// Líneas de un fragmento sin la sangría común (como lo muestra el visualizador).
const lineasDe = (texto) => texto.replace(/^\n+|\s+$/g, "").split("\n").length;

for (const slug of readdirSync(dirTemas)) {
  const js = join(dirTemas, slug, `${slug}.js`);
  if (!existsSync(join(dirTemas, slug, "index.html")) || !existsSync(js)) continue;
  const paginas = [["es", join(dirTemas, slug, "index.html")], ["en", join(raiz, "en", "temas", slug, "index.html")]];
  const fragmentosPorIdioma = {};
  for (const [idioma, html] of paginas) {
    if (!existsSync(html)) continue;
    fragmentosPorIdioma[idioma] = verificarPagina(slug, js, html, idioma);
  }
  // Mismas líneas en los dos idiomas, para que los pasos resalten la línea correcta.
  const { es, en } = fragmentosPorIdioma;
  if (es && en) {
    for (const [clave, texto] of es) {
      const otro = en.get(clave);
      revisados++;
      if (otro == null) {
        console.error(`✗ ${slug}: el fragmento "${clave}" no tiene versión en inglés`);
        errores++;
      } else if (lineasDe(otro) !== lineasDe(texto)) {
        console.error(`✗ ${slug}: el fragmento "${clave}" tiene ${lineasDe(texto)} líneas en español y ${lineasDe(otro)} en inglés`);
        errores++;
      } else {
        console.log(`✓ ${slug}: ${clave} tiene las mismas líneas en español y en inglés`);
      }
    }
  }
}

// Revisa los fragmentos de una página (en un idioma) contra su .cpp y
// devuelve un Map clave -> fragmento (incluye los de las variantes).
function verificarPagina(slug, js, html, idioma) {
  const encontrados = new Map();
  const etiqueta = idioma === "es" ? slug : `${slug} (en)`;
  const contenido = readFileSync(html, "utf8");
  if (idioma === "en" && !/<html lang="en">/.test(contenido)) {
    console.error(`✗ ${etiqueta}: en/temas/${slug}/index.html debe empezar con <html lang="en">`);
    errores++;
  }
  const cpp = contenido.match(/data-codigo-completo="([^"]+)"/);
  if (!cpp) {
    console.error(`✗ ${etiqueta}: index.html no tiene data-codigo-completo`);
    errores++;
    return encontrados;
  }
  if (idioma === "en" && !cpp[1].startsWith("en/")) {
    console.error(`✗ ${etiqueta}: data-codigo-completo debe ser un archivo de ejemplos/cpp/en/`);
    errores++;
  }
  const lineasCpp = leerCpp(cpp[1]);

  // Ejecutamos el .js del tema con un DS falso para capturar su configuración
  // (una página puede tener varios visualizadores), en el idioma de la página.
  const configuraciones = [];
  const DS = {
    el: () => null,
    variables: () => null,
    tema: (c) => { configuraciones.push(c); },
    idioma,
    tr: (es, en) => (idioma === "en" && en !== undefined ? en : es),
  };
  vm.runInNewContext(readFileSync(js, "utf8"), { DS, console });
  if (!configuraciones.length) {
    console.error(`✗ ${etiqueta}: ${slug}.js no llamó a DS.tema()`);
    errores++;
    return encontrados;
  }

  const fragmentos = configuraciones.flatMap((cfg) => Object.entries(cfg.codigo));
  for (const [clave, texto] of fragmentos) {
    revisados++;
    encontrados.set(clave, texto);
    if (contiene(lineasCpp, normalizar(texto))) {
      console.log(`✓ ${etiqueta}: ${clave}`);
    } else {
      console.error(`✗ ${etiqueta}: el fragmento "${clave}" no coincide con ejemplos/cpp/${cpp[1]}`);
      errores++;
    }
  }

  // Variantes (cfg.variantes): sus fragmentos están en su propio .cpp, y ese
  // archivo es el principal con esos fragmentos cambiados (salvo comentarios).
  // Así las dos versiones no se separan con el tiempo.
  const cambiosPorArchivo = new Map(); // archivo -> { nombre, cambios: Map(clave -> [original, nuevo]) }
  for (const cfg of configuraciones) {
    for (const [nombre, variante] of Object.entries(cfg.variantes || {})) {
      const lineasVariante = leerCpp(variante.archivo);
      if (!cambiosPorArchivo.has(variante.archivo)) cambiosPorArchivo.set(variante.archivo, { nombre, cambios: new Map() });
      const { cambios } = cambiosPorArchivo.get(variante.archivo);
      for (const [clave, texto] of Object.entries(variante.codigo)) {
        revisados++;
        encontrados.set(`${clave} (${nombre})`, texto);
        cambios.set(clave, [cfg.codigo[clave] || "", texto]);
        if (contiene(lineasVariante, normalizar(texto))) {
          console.log(`✓ ${etiqueta}: ${clave} (${nombre})`);
        } else {
          console.error(`✗ ${etiqueta}: el fragmento "${clave}" de la variante "${nombre}" no coincide con ejemplos/cpp/${variante.archivo}`);
          errores++;
        }
      }
    }
  }
  for (const [archivo, { nombre, cambios }] of cambiosPorArchivo) {
    const esperado = lineasCpp.slice();
    for (const [clave, [original, texto]] of cambios) {
      const viejo = normalizar(original);
      const i = viejo.length ? buscar(esperado, viejo) : -1;
      if (i < 0) {
        console.error(`✗ ${etiqueta}: la variante "${nombre}" cambia "${clave}", que no está en codigo o en ejemplos/cpp/${cpp[1]}`);
        errores++;
        continue;
      }
      esperado.splice(i, viejo.length, ...normalizar(texto));
    }
    const a = sinComentarios(esperado);
    const b = sinComentarios(leerCpp(archivo));
    const k = a.findIndex((linea, j) => linea !== b[j]);
    if (k >= 0 || a.length !== b.length) {
      const j = k >= 0 ? k : Math.min(a.length, b.length);
      console.error(`✗ ${etiqueta}: ejemplos/cpp/${archivo} debe ser ejemplos/cpp/${cpp[1]} con los fragmentos de la variante "${nombre}" cambiados (sin contar comentarios). Difiere en: "${b[j] ?? "(fin del archivo)"}" (se esperaba "${a[j] ?? "(fin del archivo)"}")`);
      errores++;
    } else {
      console.log(`✓ ${etiqueta}: ${archivo} es ${cpp[1]} con la variante "${nombre}"`);
    }
  }
  return encontrados;
}

if (errores) {
  console.error(`\n${errores} problema(s). Actualiza el fragmento en el .js o el .cpp para que coincidan.`);
  process.exit(1);
}
console.log(`\n${revisados} fragmentos coinciden con sus archivos .cpp.`);
