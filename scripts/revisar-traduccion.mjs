// Revisa en el navegador la versión en inglés de un tema contra la de español.
//
//   1. Estructura: los dos idiomas tienen los mismos pasos (ids), los mismos
//      visualizadores y las mismas preguntas, con la respuesta correcta en el
//      mismo lugar.
//   2. Textos sin traducir: en la página en inglés busca acentos, ñ, ¿, ¡ y
//      palabras en español en el texto fijo y, ejecutando cada operación paso
//      a paso, en el mensaje, el título del código, el escenario, el código y
//      los controles. Las palabras salen solas: son los identificadores del
//      .cpp en español que no están en el .cpp en inglés (izq, pivote…), más
//      algunas de la interfaz. Se pueden agregar otras con --palabras.
//   3. Pantalla: a 1280 y 390 px de ancho y en modo oscuro, en los dos
//      idiomas, que no haya scroll horizontal ni errores de consola, y que a
//      1280 × 800 cada paso quepa sin scroll (salvo el del código completo).
//   4. Pasos: que cada operación dé la misma cantidad de pasos en los dos
//      idiomas. Con arreglos o pivotes al azar la cantidad cambia de una
//      corrida a otra: esas diferencias salen como aviso, no como problema.
//
// Recorre cada visualizador de cada paso, cada opción de cada lista y cada
// operación del selector, en modo "Paso a paso". Las operaciones secundarias
// (como swap en Ordenamientos elementales) y los paneles propios de un tema
// (como las carreras) se revisan aparte, a mano o con un script corto.
//
// Necesita Playwright (no es una dependencia del sitio: en las sesiones en la
// nube ya está instalado) y el sitio servido desde la raíz del repositorio:
//
//   python3 -m http.server 8000
//   node scripts/revisar-traduccion.mjs <slug> [--repeticiones N] [--palabras "a|b"] [--base URL]
//
// Ejemplo: node scripts/revisar-traduccion.mjs cola
// Con temas largos puede tardar varios minutos. Termina con código 1 si
// encontró algún problema.
import { createRequire } from "node:module";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const opcion = (nombre, porDefecto) => {
  const k = args.indexOf(nombre);
  return k >= 0 ? args[k + 1] : porDefecto;
};
const slug = args.find((a, k) => !a.startsWith("--") && !(k > 0 && args[k - 1].startsWith("--")));
if (!slug) {
  console.error("Uso: node scripts/revisar-traduccion.mjs <slug> [--repeticiones N] [--palabras \"a|b\"] [--base URL]");
  process.exit(2);
}
const REPETICIONES = Number(opcion("--repeticiones", 2));
const BASE = opcion("--base", "http://localhost:8000/").replace(/\/?$/, "/");
const MAX_PASOS = 600; // por operación

// --- Palabras en español: identificadores del .cpp que cambiaron al traducir.
function archivoCpp(html) {
  const m = readFileSync(html, "utf8").match(/data-codigo-completo="([^"]+)"/);
  return m ? join(raiz, "ejemplos", "cpp", m[1]) : null;
}
function identificadores(archivo) {
  if (!archivo || !existsSync(archivo)) return new Set();
  const codigo = readFileSync(archivo, "utf8")
    .replace(/\/\/.*$/gm, "")
    .replace(/"(?:[^"\\]|\\.)*"/g, "\"\"");
  return new Set(codigo.match(/\b[A-Za-z_]\w{2,}\b/g) || []);
}
const pagEs = join(raiz, "temas", slug, "index.html");
const pagEn = join(raiz, "en", "temas", slug, "index.html");
if (!existsSync(pagEs) || !existsSync(pagEn)) {
  console.error(`Falta ${existsSync(pagEs) ? pagEn : pagEs}.`);
  process.exit(2);
}
const idsEn = identificadores(archivoCpp(pagEn));
const soloEs = [...identificadores(archivoCpp(pagEs))].filter((w) => !idsEn.has(w));
const INTERFAZ = ["Pulsa", "Prueba", "Reiniciar", "Ejecutar", "devuelve", "vac[ií]an?", "vac[ií]os?", "arreglo", "Arreglo", "Algoritmo", "nodo", "valor"];
const extra = opcion("--palabras", "");
const palabras = [...soloEs, ...INTERFAZ, ...(extra ? extra.split("|") : [])];
const ES = new RegExp(`[áéíóúñ¿¡]|\\b(${palabras.join("|")})\\b`);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let problemas = 0;
const avisar = (t) => { problemas++; console.log(t); };
const url = (idioma) => `${BASE}${idioma === "en" ? "en/" : ""}temas/${slug}/`;

const browser = await chromium.launch();

// --- 1. Estructura y texto fijo.
{
  const ctx = await browser.newContext();
  const p = await ctx.newPage();
  const estructura = async (idioma) => {
    await p.goto(url(idioma));
    return p.evaluate(() => [...document.querySelectorAll(".paso-leccion")].map((s) => ({
      id: s.id,
      vis: [...s.querySelectorAll('div[id^="vis-"]')].map((v) => v.id),
      preguntas: [...s.querySelectorAll(".pregunta")].map((q) => [...q.querySelectorAll(".opcion")].map((o) => (o.hasAttribute("data-correcta") ? "C" : "-")).join("")),
    })));
  };
  const es = await estructura("es");
  const en = await estructura("en");
  if (JSON.stringify(es) !== JSON.stringify(en)) {
    for (let k = 0; k < Math.max(es.length, en.length); k++) {
      if (JSON.stringify(es[k]) !== JSON.stringify(en[k])) avisar(`Estructura distinta en el paso ${k + 1}:\n  ES ${JSON.stringify(es[k])}\n  EN ${JSON.stringify(en[k])}`);
    }
  } else {
    console.log(`Estructura igual: ${es.length} pasos, ${es.flatMap((s) => s.preguntas).length} preguntas.`);
  }
  const resto = await p.evaluate((fuente) => {
    const re = new RegExp(fuente);
    const fuera = [];
    const recorrer = (n) => {
      for (const c of n.childNodes) {
        if (c.nodeType === 3) {
          const m = c.textContent.match(re);
          if (m) fuera.push(`"${m[0]}" en: ${c.textContent.trim().slice(0, 90)}`);
        } else if (c.nodeType === 1 && !c.closest("[data-codigo-completo], .pie, .panel-codigo, [id^=vis-], code, pre")) {
          recorrer(c);
        }
      }
    };
    recorrer(document.querySelector("main"));
    for (const a of document.querySelectorAll("[data-explicacion], [data-titulo]")) {
      const t = a.getAttribute("data-explicacion") || a.getAttribute("data-titulo");
      const m = t.match(re);
      if (m) fuera.push(`"${m[0]}" en: ${t.slice(0, 90)}`);
    }
    const d = `${document.title} ${document.querySelector('meta[name="description"]').content}`;
    const m = d.match(re);
    if (m) fuera.push(`"${m[0]}" en el título o la descripción`);
    return fuera;
  }, ES.source);
  for (const r of resto) avisar(`[en, texto fijo] ${r}`);
  await ctx.close();
}

// --- 2 a 4. Cada visualizador, cada opción, cada operación.
const pasosPor = { es: [], en: [] };
for (const idioma of ["es", "en"]) {
  for (const [ancho, oscuro] of [[1280, false], [390, false], [1280, true]]) {
    const ctx = await browser.newContext({ viewport: { width: ancho, height: 800 }, colorScheme: oscuro ? "dark" : "light" });
    await ctx.addInitScript((i) => { localStorage.setItem("ds-modo", "manual"); localStorage.setItem("ds-idioma", i); }, idioma);
    const page = await ctx.newPage();
    const errores = [];
    page.on("pageerror", (e) => errores.push(String(e)));
    page.on("console", (m) => { if (m.type() === "error") errores.push(m.text()); });
    await page.goto(url(idioma));
    const tag = `${idioma} ${ancho}${oscuro ? " oscuro" : ""}`;
    console.log(`Revisando ${tag}…`);
    const medir = async (donde) => {
      const m = await page.evaluate(() => ({ v: document.scrollingElement.scrollHeight - innerHeight, h: document.scrollingElement.scrollWidth - innerWidth }));
      if (m.h > 0) avisar(`[${tag}] scroll horizontal de ${m.h} px en ${donde}`);
      if (ancho === 1280 && m.v > 0 && !donde.startsWith("codigo")) avisar(`[${tag}] no cabe (${m.v} px) en ${donde}`);
    };
    const buscarEs = (donde, texto) => {
      if (idioma !== "en") return;
      const m = texto.match(ES);
      if (m) {
        const k = texto.indexOf(m[0]);
        avisar(`[${tag}] "${m[0]}" en ${donde}: …${texto.slice(Math.max(0, k - 100), k + 80)}…`);
      }
    };
    const ids = await page.$$eval(".paso-leccion", (ps) => ps.map((p) => p.id));
    for (const id of ids) {
      await page.evaluate((i) => (location.hash = i), id);
      await sleep(300);
      const paso = page.locator(".paso-leccion:not([hidden])");
      if ((await paso.getAttribute("id")) !== id) avisar(`[${tag}] no se mostró el paso ${id}`);
      await medir(id);
      const visIds = await paso.locator('div[id^="vis-"]').evaluateAll((vs) => vs.map((v) => v.id));
      for (const visId of visIds) {
        const vis = page.locator(`#${visId}`);
        if (!(await vis.locator(".boton-ejecutar").count())) continue; // panel propio del tema
        const selects = await vis.locator("select").count();
        const combos = [null];
        for (let k = 0; k < selects; k++) {
          const valores = await vis.locator("select").nth(k).evaluate((s) => [...s.options].map((o) => o.value));
          for (const v of valores.slice(1)) combos.push([k, v]);
        }
        const fin = vis.locator('button[aria-label="Último paso"], button[aria-label="Last step"]');
        const sig = vis.locator('button[aria-label="Paso siguiente"], button[aria-label="Next step"]');
        const reiniciar = vis.locator("button", { hasText: /^(Reiniciar|Reset)$/ });
        for (const combo of combos) {
          if (combo) {
            if (await fin.isEnabled().catch(() => false)) await fin.click();
            await vis.locator("select").nth(combo[0]).selectOption(combo[1]);
            await sleep(250);
          } else if (await reiniciar.count()) {
            await reiniciar.first().click();
            await sleep(250);
          }
          const nombre = `${visId}${combo ? ` (lista ${combo[0] + 1} = ${combo[1]})` : ""}`;
          buscarEs(`${nombre}, estado inicial`, await vis.evaluate((v) => [v.querySelector(".mensaje")?.textContent, v.querySelector(".escenario")?.innerText, v.querySelector(".titulo-codigo")?.textContent].join(" | ")));
          const chips = await vis.locator(".selector-ops button").count();
          for (const op of chips ? [...Array(chips).keys()] : [null]) {
            for (let r = 0; r < REPETICIONES; r++) {
              if (op != null) await vis.locator(".selector-ops button").nth(op).click();
              const ejecutar = vis.locator(".boton-ejecutar");
              const llamada = (await ejecutar.textContent()).trim().replace(/^▶\s*/, "");
              buscarEs(`el botón de ${nombre}`, llamada);
              await ejecutar.click();
              let n = 0;
              for (;;) {
                await sleep(40);
                buscarEs(`${nombre}, ${llamada}, paso ${n}`, await vis.evaluate((v) => [
                  v.querySelector(".mensaje")?.textContent, v.querySelector(".titulo-codigo")?.textContent,
                  v.querySelector(".escenario")?.innerText, v.querySelector(".panel-codigo pre")?.innerText,
                  [...v.querySelectorAll("label, button, option")].map((b) => b.textContent).join(" "),
                ].join(" | ")));
                const ultimo = await sig.isDisabled();
                if (n === 0 || ultimo) await medir(`${id}, ${nombre}, ${llamada}, paso ${n}`);
                if (ultimo) break;
                await sig.evaluate((b) => b.click());
                if (++n > MAX_PASOS) { avisar(`[${tag}] ${nombre}, ${llamada}: más de ${MAX_PASOS} pasos`); break; }
              }
              if (ancho === 1280 && !oscuro) pasosPor[idioma].push({ clave: `${nombre}, operación ${op ?? 1}, vez ${r + 1}`, n });
            }
          }
        }
      }
    }
    if (errores.length) avisar(`[${tag}] errores en la consola: ${errores.join(" / ")}`);
    await ctx.close();
  }
}
await browser.close();

const distintos = pasosPor.es.filter((x, k) => pasosPor.en[k] && x.n !== pasosPor.en[k].n);
if (distintos.length) {
  console.log("Aviso: cantidad de pasos distinta entre idiomas (normal si el visualizador usa valores al azar):");
  for (const x of distintos) console.log(`  ${x.clave}: ES ${x.n}, EN ${pasosPor.en[pasosPor.es.indexOf(x)].n}`);
} else {
  console.log(`Mismos pasos en los dos idiomas (${pasosPor.es.length} ejecuciones).`);
}
console.log(problemas ? `${problemas} problema(s).` : "Sin problemas.");
process.exit(problemas ? 1 : 0);
