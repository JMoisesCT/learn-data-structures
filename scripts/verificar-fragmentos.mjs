// Verifica que cada fragmento de código que muestran las animaciones
// exista, línea por línea, en el archivo .cpp del tema. Así la animación
// nunca enseña código distinto al ejemplo que se compila.
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

for (const slug of readdirSync(dirTemas)) {
  const html = join(dirTemas, slug, "index.html");
  const js = join(dirTemas, slug, `${slug}.js`);
  if (!existsSync(html) || !existsSync(js)) continue;

  const cpp = readFileSync(html, "utf8").match(/data-codigo-completo="([^"]+)"/);
  if (!cpp) {
    console.error(`✗ ${slug}: index.html no tiene data-codigo-completo`);
    errores++;
    continue;
  }
  const lineasCpp = leerCpp(cpp[1]);

  // Ejecutamos el .js del tema con un DS falso para capturar su configuración
  // (una página puede tener varios visualizadores).
  const configuraciones = [];
  const DS = { el: () => null, variables: () => null, tema: (c) => { configuraciones.push(c); } };
  vm.runInNewContext(readFileSync(js, "utf8"), { DS, console });
  if (!configuraciones.length) {
    console.error(`✗ ${slug}: ${slug}.js no llamó a DS.tema()`);
    errores++;
    continue;
  }

  const fragmentos = configuraciones.flatMap((cfg) => Object.entries(cfg.codigo));
  for (const [clave, texto] of fragmentos) {
    revisados++;
    if (contiene(lineasCpp, normalizar(texto))) {
      console.log(`✓ ${slug}: ${clave}`);
    } else {
      console.error(`✗ ${slug}: el fragmento "${clave}" no coincide con ejemplos/cpp/${cpp[1]}`);
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
        cambios.set(clave, [cfg.codigo[clave] || "", texto]);
        if (contiene(lineasVariante, normalizar(texto))) {
          console.log(`✓ ${slug}: ${clave} (${nombre})`);
        } else {
          console.error(`✗ ${slug}: el fragmento "${clave}" de la variante "${nombre}" no coincide con ejemplos/cpp/${variante.archivo}`);
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
        console.error(`✗ ${slug}: la variante "${nombre}" cambia "${clave}", que no está en codigo o en ejemplos/cpp/${cpp[1]}`);
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
      console.error(`✗ ${slug}: ejemplos/cpp/${archivo} debe ser ejemplos/cpp/${cpp[1]} con los fragmentos de la variante "${nombre}" cambiados (sin contar comentarios). Difiere en: "${b[j] ?? "(fin del archivo)"}" (se esperaba "${a[j] ?? "(fin del archivo)"}")`);
      errores++;
    } else {
      console.log(`✓ ${slug}: ${archivo} es ${cpp[1]} con la variante "${nombre}"`);
    }
  }
}

if (errores) {
  console.error(`\n${errores} problema(s). Actualiza el fragmento en el .js o el .cpp para que coincidan.`);
  process.exit(1);
}
console.log(`\n${revisados} fragmentos coinciden con sus archivos .cpp.`);
