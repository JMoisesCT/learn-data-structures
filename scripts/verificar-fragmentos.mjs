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

function contiene(archivo, fragmento) {
  for (let i = 0; i + fragmento.length <= archivo.length; i++) {
    if (fragmento.every((linea, k) => archivo[i + k] === linea)) return true;
  }
  return false;
}

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
  const lineasCpp = normalizar(readFileSync(join(raiz, "ejemplos", "cpp", cpp[1]), "utf8"));

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
}

if (errores) {
  console.error(`\n${errores} problema(s). Actualiza el fragmento en el .js o el .cpp para que coincidan.`);
  process.exit(1);
}
console.log(`\n${revisados} fragmentos coinciden con sus archivos .cpp.`);
